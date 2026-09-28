# manuel-lopez/generation-scratch

## Resumen

`manuel-lopez/generation-scratch` es un repositorio de HuggingFace que contiene una implementación propia de un transformer de escala "tiny" orientado a generación de texto, junto con su configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización en formato safetensors. No es un modelo entrenado ni una release con pesos listos para producción: el propio autor indica explícitamente en la model card que el checkpoint es válido únicamente para pruebas de humo ("smoke tests") y que no se presenta como un checkpoint evaluado con benchmarks.

El tamaño real declarado en los metadatos de safetensors es de 24.832 parámetros, un orden de magnitud propio de ejercicios docentes o de validación de pipelines de entrenamiento, no de un modelo con capacidades lingüísticas útiles. La arquitectura combina atención multi-query, fusión con puertas (gated fusion), activación Mish y normalización por lotes (BatchNorm), una combinación poco habitual en transformers de generación modernos, donde predominan RMSNorm y SwiGLU.

Su relevancia es por tanto metodológica y no funcional: sirve como punto de partida reproducible para experimentar con recetas de entrenamiento (optimizador Lion con scheduler OneCycle en la configuración incluida), para verificar que un pipeline de tokenización, forward pass y guardado de pesos funciona de extremo a extremo, y como esqueleto sobre el que escalar. Cualquier uso en producción requeriría primero entrenar el modelo y documentar los resultados de forma separada a los valores por defecto del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (implementación propia, decoder de generación) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, presumiblemente precisión completa; el repositorio no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (el modelo no ha sido entrenado, por lo que no tiene competencia lingüística efectiva) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `training_args.json`; código en PyTorch (`train.py`) |
| Atencion | multi-query |
| Fusion | gated fusion |
| Activacion | Mish |
| Normalizacion | BatchNorm |
| Optimizador por defecto | Lion |
| Scheduler por defecto | OneCycle |
| Tamano del repositorio | 0.0 GB (por debajo del umbral de redondeo de la plataforma) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un transformer de escala "tiny" con atención multi-query (MQA), mecanismo de fusión con puertas y una función de activación Mish sobre normalización BatchNorm. La atención multi-query reduce el número de cabezas de clave y valor compartidas, lo que abarata la memoria de la caché KV, pero en un modelo de 24.832 parámetros el ahorro es irrelevante: se trata más bien de un ejercicio de implementación. El uso de BatchNorm en lugar de LayerNorm o RMSNorm es una elección atípica en decodificadores autoregresivos, ya que introduce dependencia del lote y complica la inferencia con batch de tamaño 1; conviene revisar el código de `train.py` antes de asumir su comportamiento en generación.

No se ha publicado ningún entrenamiento. El repositorio incluye `training_args.json` con una receta por defecto (Lion + OneCycle) que el propio autor califica de valores de partida y no de evidencia de una ejecución completada. No hay información sobre número de tokens de entrenamiento, composición del dataset, tokenizador, ni sobre fases de ajuste como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, SSM híbridos) más allá de la combinación MQA + gated fusion + Mish + BatchNorm.

El autor recomienda, para cualquier evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y reportar la métrica de tarea sobre al menos tres semillas junto con un baseline de capacidad comparable.

## Capacidades

- Generación de texto: la implementación está orientada a decodificación autoregresiva, pero el checkpoint distribuido es de inicialización, por lo que no genera texto coherente sin entrenamiento previo.
- Razonamiento, matemáticas y código: no disponible; no hay evidencia de ninguna capacidad de este tipo en el repositorio.
- Tool calling / function calling: no soportado ni documentado.
- Agentes y razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingües: no disponibles; el modelo no ha sido entrenado.
- Capacidades especiales (modo "thinking", visión, audio): ninguna documentada.
- Punto de partida reproducible: es la capacidad real del artefacto. Proporciona un forward pass ejecutable, un `config.json` con los ajustes de arquitectura y un `train.py` con un bloque `__main__` de ejemplo de smoke test.

## Casos de uso

- Validación de pipelines de entrenamiento: usar `train.py` y `model.safetensors` como caso de prueba mínimo para verificar que el script de entrenamiento arranca, que el checkpoint carga y que el guardado de pesos no corrompe tensores, antes de escalar a un modelo real.
- Pruebas de humo en CI/CD de investigación: integrar la ejecución de un forward pass con el checkpoint de inicialización como test de regresión que detecte cambios incompatibles en la API del modelo o en `config.json`.
- Plantilla para implementaciones didácticas: sirve como referencia para estudiar atención multi-query, gated fusion y activación Mish en un código autocontenido y de tamaño manejable (24.832 parámetros).
- Comparativa de optimizadores y schedulers: la receta por defecto (Lion + OneCycle) permite montar experimentos controlados sobre un mismo esqueleto para medir convergencia con distintas combinaciones, siempre con semillas emparejadas.
- Ablación de componentes de arquitectura: al ser un modelo diminuto, se pueden comparar variantes (Mish frente a otras activaciones, BatchNorm frente a LayerNorm) en minutos de cómputo y con bajo coste económico.
- Adaptación a tareas sintéticas de juguete: entrenar desde cero para tareas de secuencia muy restringidas (copia, paréntesis balanceados, ordenación de tokens) y medir exactitud frente a un baseline de capacidad equivalente.
- Material docente: ejemplo ejecutable para explicar el ciclo completo configuración-arquitectura-checkpoint en un curso de introducción a transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint distribuido no ha sido entrenado ni auditado. Por tanto, no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica. Cualquier cifra que se publicase en el futuro debería documentarse por separado de los valores por defecto aquí incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precisión completa (24.832 parámetros); cabe sin dificultad en cualquier dispositivo, incluida CPU.
- GPU recomendadas: no se requiere GPU. Sirve cualquier GPU, incluidos iGPU y aceleradores embebidos; también se ejecuta íntegramente en CPU.
- GPU de consumo: sí, cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en dispositivos móviles o Raspberry Pi, aunque el cuello de botella sería el intérprete de Python, no el cálculo.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. vLLM, TGI o llama.cpp no soportan este modelo sin portar el código. La vía natural es ejecutar `train.py` directamente con PyTorch.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Dado el tamaño, la latencia estaría dominada por el overhead de Python y no por el cálculo de tensores.

## Comparativa con modelos similares

La comparación se establece con implementaciones de referencia de la misma categoría (transformers pequeños con fines educativos o de validación), no con modelos de producción. Los datos de los comparadores provienen de referencias públicas y no de este repositorio.

| Modelo | Parametros | Contexto | Entrenado | Licencia | Uso practico |
|---|---|---|---|---|---|
| manuel-lopez/generation-scratch | 24.832 | no disponible | No (checkpoint de inicialización) | BSD-3-Clause | Pruebas de humo, docencia |
| nanoGPT (implementación de referencia) | Configurable (p. ej. ~10M-124M) | Configurable | No por defecto; requiere entrenamiento | MIT (código) | Docencia, investigación |
| GPT-2 small | 124M | 1024 tokens | Sí | MIT (pesos) | Generación básica, fine-tuning |
| TinyLlama-1.1B | 1.1B | 2048 tokens | Sí | Apache 2.0 | Generación, ajuste ligero |

El modelo aquí descrito es varios órdenes de magnitud más pequeño que cualquier alternativa entrenada, y su única ventaja comparativa es el coste nulo de ejecución y su utilidad como andamiaje reproducible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce texto coherente y no debe evaluarse como si fuera un modelo de lenguaje funcional.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No hay información sobre sesgos, porque no hay datos de entrenamiento documentados; cualquier sesgo dependerá del corpus que el usuario decida usar.
- Riesgo de alucinación: no aplicable en el sentido habitual al no haber generación entrenada; en cambio, existe el riesgo de interpretar erróneamente los resultados de un modelo sin entrenar como si tuvieran significado.
- Longitud de contexto e idiomas soportados: no disponibles; no se puede asumir soporte multilingüe ni una ventana concreta.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación con atribución y conservación del aviso de copyright, pero la licencia cubre el código y los pesos del repositorio, no los datos externos que se usen para entrenarlo; el autor recomienda revisar por separado los términos de las fuentes de datos.
- Compatibilidad: al ser una implementación personalizada, no se carga con `AutoModelForCausalLM` ni con APIs genéricas sin escribir un adaptador.
- BatchNorm en un decodificador puede comportarse de forma distinta en inferencia con batch de tamaño 1; conviene validar este punto antes de cualquier uso serio.
- Cualquier resultado futuro obtenido tras entrenar el modelo debe documentarse de forma separada de los valores por defecto del repositorio, tal y como indica el autor.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/manuel-lopez/generation-scratch
- No se han encontrado en la búsqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a diccionarios y editoriales de manuales escolares en francés, sin relación con el repositorio. No hay paper, blog, repositorio de código adicional ni demo asociados disponibles.
