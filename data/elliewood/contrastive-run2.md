# elliewood/contrastive-run2

## Resumen

`elliewood/contrastive-run2` es un repositorio experimental de Hugging Face que contiene una implementación funcional de una arquitectura CoCa (Contrastive Captioner) aplicada a aprendizaje contrastivo, publicada por el usuario Ellie Wood bajo licencia Apache 2.0. El propio autor la describe como una implementación de referencia con código transparente y pruebas de humo reproducibles, y omite deliberadamente cualquier afirmación sobre rendimiento. No es un modelo entrenado: el fichero `model.safetensors` se presenta explícitamente como un checkpoint de inicialización válido para smoke tests, no como un modelo con benchmarks.

El dato más relevante para evaluarlo es la discrepancia entre la configuración declarada y el artefacto real. La model card indica escala «giant» con atención multi-query, fusión tipo Tucker, activación Mish e InstanceNorm, pero los metadatos de safetensors informan de 24.832 parámetros totales y un tamaño de repositorio de 0,0 GB. Es decir, el peso publicado corresponde a una inicialización mínima, no a un modelo de escala «giant»; probablemente el `config.json` describe una arquitectura mayor que el checkpoint incluido no materializa.

Por tanto, su relevancia ahora no es como modelo usable sino como andamiaje reproducible: sirve para validar pipelines de carga, para comparar recetas de entrenamiento con presupuesto controlado y como plantilla docente de una arquitectura CoCa. Cualquier uso en producción requeriría entrenar el checkpoint desde cero y documentar los resultados por separado, tal y como advierte el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CoCa (Contrastive Captioner): torre de visión + torre de texto con fusión multimodal; atención multi-query, fusión Tucker, activación Mish, normalización InstanceNorm |
| Parametros totales | 24.832 (según metadatos de safetensors); la model card declara escala «giant» sin cuantificar |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica la ventana de texto) |
| Tipos de cuantizacion | No disponible (solo se publica safetensors en precisión de entrenamiento; no hay GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible (el corpus de entrenamiento no está documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (PyTorch) + `inference.py`, `config.json`, `training_args.json` |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema CoCa: dos codificadores (visión y texto) entrenados con un objetivo contrastivo y, adicionalmente, un decodificador de subtítulos que genera texto a partir de las representaciones multimodales. Los detalles declarados en el repositorio son atención multi-query, fusión de modalidades mediante descomposición de Tucker, activación Mish e InstanceNorm como normalización. No se documenta el número de capas, dimensión oculta, número de cabezas ni resolución de imagen de entrada.

No hay evidencia de entrenamiento completado. La receta por defecto del repositorio usa el optimizador Adafactor con un schedule de warmup lineal, y el autor insiste en que son valores de partida del script, no el registro de una ejecución real. No se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones; en un modelo contrastivo imagen-texto esos pasos no serían el mecanismo habitual, sino el preentrenamiento sobre pares imagen-texto. Tampoco se describe ninguna innovación técnica adicional más allá de la elección de componentes (Tucker, Mish, InstanceNorm, MQA).

## Capacidades

- Generación de texto condicionada a imagen (captioning) a nivel arquitectónico: la cabeza de decodificador CoCa está prevista, pero el checkpoint publicado no ha sido entrenado y no produce salidas con sentido.
- Representaciones imagen-texto alineadas para búsqueda o clasificación zero-shot: capacidad teórica del diseño contrastivo, no verificada en este repositorio.
- Carga e inspección del grafo: `inference.py` incluye un bloque `__main__` con un ejemplo ejecutable de smoke test.
- Punto de partida para entrenamiento: `training_args.json` fija una receta reproducible (Adafactor + warmup lineal) que se puede reutilizar como baseline.
- Soporte de tool calling / function calling: no disponible; no es un modelo de lenguaje instruido.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): solo la parte de visión implícita en CoCa; sin pesos entrenados que la hagan operativa.

## Casos de uso

- Validación de pipelines de carga de safetensors: usar `model.safetensors` como entrada de un test de integración que compruebe que el cargador acepta el checkpoint, resuelve el `config.json` y expone las formas tensoriales esperadas antes de conectar el modelo real.
- Plantilla docente de arquitecturas CoCa: el código de `inference.py` y el `config.json` permiten recorrer la implementación de atención multi-query y fusión Tucker en un curso o taller, sustituyendo la ausencia de pesos entrenados por la lectura del código.
- Baseline controlado en experimentos de investigación: la receta Adafactor + warmup lineal sirve como punto de comparación fijo cuando se evalúan variantes con el mismo presupuesto de datos, ajuste y semillas, tal y como recomienda el autor.
- Smoke test en CI/CD de un equipo de ML: ejecutar `python inference.py --help` y el ejemplo del bloque `__main__` en cada commit para detectar roturas de API en el código de inferencia sin coste de GPU.
- Reproducción de la Guía de evaluación propuesta: entrenar el checkpoint en un conjunto retenido específico de la tarea, reportar la métrica con al menos tres semillas e incluir un baseline de capacidad equivalente, y publicar los resultados como artefacto separado.
- Estudio de discrepancias config/pesos: analizar cómo un `config.json` con escala declarada «giant» convive con un checkpoint de 24.832 parámetros, útil para diseñar controles de calidad que detecten este tipo de desalineación en repositorios de terceros.
- Referencia para comparativas de fusión multimodal: implementar la misma tarea con fusión Tucker frente a concatenación o cross-attention y medir el coste en parámetros y tiempo de entrenamiento con idéntico presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las afirmaciones de benchmark se omiten de forma deliberada y que el checkpoint no se presenta como un modelo evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable. Con 24.832 parámetros, en fp32 ocupa aproximadamente 99 KB y en fp16 unos 50 KB, más el overhead de activaciones.
- GPU recomendadas: ninguna. El checkpoint cabe holgadamente en CPU y en cualquier iGPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en entornos sin GPU. El límite práctico no es la memoria, sino el hecho de que el modelo no está entrenado.
- Opciones de despliegue: `inference.py` con PyTorch como vía directa. No es compatible con vLLM, TGI, llama.cpp u Ollama, porque no es un modelo de lenguaje causal y, según la model card, requiere un adaptador explícito para las APIs genéricas de carga automática de `transformers`.
- Latencia y throughput: no disponibles como cifras de referencia. Al tratarse de una inicialización sin entrenar, cualquier medición de latencia sería representativa del grafo y no de la calidad del modelo.
- Nota: el tamaño real del repositorio es de 0,0 GB, coherente con un checkpoint de inicialización y no con una configuración «giant».

## Comparativa con modelos similares

Las cifras de los modelos alternativos provienen de sus publicaciones originales y no de la información proporcionada para este repositorio; se incluyen solo como referencia de categoría.

| Modelo | Parametros | Contexto texto | Enfoque | Licencia | Estado en el repo |
|---|---|---|---|---|---|
| `elliewood/contrastive-run2` | 24.832 (según safetensors) | No disponible | CoCa con fusión Tucker (sin entrenar) | Apache 2.0 | Checkpoint de inicialización |
| CoCa (Google Research, 2022) | ~2,1 B en su variante mayor (dato público de la publicación) | No disponible en esta ficha | CoCa original con captioning | No disponible en la información proporcionada | Pesos entrenados publicados por el autor original |
| CLIP ViT-L/14 (OpenAI) | ~428 M (dato público) | 77 tokens (dato público) | Dual encoder contrastivo, sin decodificador | No disponible en la información proporcionada | Pesos entrenados |
| SigLIP (Google) | No disponible | No disponible | Dual encoder con pérdida sigmoide | No disponible en la información proporcionada | Pesos entrenados |

La comparación relevante no es de rendimiento, que aquí no existe, sino de estado del artefacto: los tres alternativos son modelos entrenados y evaluados, mientras que este repositorio es una implementación de referencia con un checkpoint sin entrenar.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones ni subtítulos utilizables. Cualquier evaluación de calidad daría resultados aleatorios.
- No se ha auditado robustez, equidad ni transferencia de dominio, según advierte el propio autor.
- Desalineación entre la escala declarada («giant») y los 24.832 parámetros reportados por safetensors; conviene verificar `config.json` antes de asumir cualquier tamaño.
- Implementación personalizada: las APIs automáticas de `transformers` requieren un adaptador explícito, por lo que no se puede cargar con `AutoModel.from_pretrained` sin trabajo adicional.
- Ausencia total de datos de entrenamiento documentados: sin número de tokens, composición del corpus ni idiomas, no es posible evaluar sesgos ni cobertura lingüística.
- Riesgo de alucinación: no evaluable en este estado; en un CoCa entrenado el riesgo se manifestaría como subtítulos genéricos o incorrectos y objetos inexistentes en la imagen.
- Sin benchmarks publicados ni comparación con baselines de capacidad equivalente, la afirmación de utilidad del repositorio se limita a la reproducibilidad del código.
- Licencia Apache 2.0 permite uso comercial del código y de los pesos, pero el autor recuerda revisar por separado los términos de los datasets externos que se usen para entrenar.
- El nombre del repositorio (`contrastive-run2`) y la existencia de una copia aparente en `Sjpatel0514/contrastive-run2` sugieren un experimento de ejecución repetida; no hay información sobre diferencias entre ambas copias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elliewood/contrastive-run2
- Perfil del autor: https://huggingface.co/elliewood/models
- Repositorio homónimo de otro usuario: https://huggingface.co/Sjpatel0514/contrastive-run2

El resto de resultados de la búsqueda web (una noticia sobre un modelo que envió una pista falsa a la policía de Filadelfia, un calendario de lanzamientos de modelos y un leaderboard general de benchmarks) no guardan relación con este repositorio y no se incluyen como fuentes. No se han encontrado en la búsqueda ni paper, ni blog, ni demo asociados a este modelo.
