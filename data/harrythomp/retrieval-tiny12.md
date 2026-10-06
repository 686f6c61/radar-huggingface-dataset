# Harrythomp/retrieval-tiny12

## Resumen

Retrieval-tiny12 es un repositorio de HuggingFace publicado por el usuario Harrythomp que contiene una implementación propia de una arquitectura Perceiver orientada a tareas de recuperación (retrieval), acompañada de un fichero de configuración, un script de evaluación/entrenamiento y un checkpoint de inicialización. No se trata de un modelo entrenado ni evaluado: la propia model card indica explícitamente que `model.safetensors` es un checkpoint válido para pruebas de humo (smoke tests) y que no se reclama ninguna puntuación de benchmark. El repositorio funciona, por tanto, como punto de partida reproducible para experimentación, no como artefacto listo para producción.

El checkpoint pesa prácticamente nada: los datos reales de safetensors indican 16.576 parámetros totales (~0,017 M) y un tamaño de repositorio de 0,0 GB. Existe una inconsistencia interna en la información disponible: el identificador del modelo incluye el sufijo "tiny12", pero la model card describe la variante como "xlarge" en su tabla de arquitectura y en el texto de presentación. Esta discrepancia no se puede resolver con los datos aportados y conviene verificarla en el repositorio antes de cualquier uso.

La relevancia del proyecto es limitada y de carácter más didáctico o de investigación que práctico: sirve para reproducir una receta concreta (optimizador novograd, scheduler exponencial) sobre una arquitectura Perceiver con atención de ventana deslizante, fusión tensorial, activación swish y normalización groupnorm. El autor sugiere Flickr30k como primer conjunto de evaluación, con al menos tres semillas y una línea base de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 16.576 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (implementacion en PyTorch) |
| Escala declarada en model card | "xlarge" (inconsistente con el ID "tiny12" y con los 16.576 parametros reales) |
| Atencion | sliding window |
| Fusion | tensor fusion |
| Activacion | swish |
| Normalizacion | groupnorm |
| Optimizador por defecto | novograd |
| Scheduler por defecto | exponential |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 17 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer de cuello de botella latente en el que las entradas se proyectan contra un conjunto reducido de latentes mediante atención cruzada, lo que en principio permite manejar entradas de tamaño variable y elevado coste computacional. En este repositorio el autor documenta decisiones concretas de diseño: atención de ventana deslizante, fusión tensorial, activación swish y normalización groupnorm. No se especifican número de capas, dimensión latente, número de latentes, número de cabezas ni longitud de la ventana de atención, por lo que la topología exacta no está disponible en la información proporcionada.

En cuanto al entrenamiento, no hay evidencia de que se haya completado ninguno. La model card describe la receta incluida (novograd con scheduler exponencial) como "valores de partida en el script, no evidencia de una ejecución completada". No se indican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. El autor recomienda explícitamente que cualquier evaluación futura entrene todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y que se conserven los registros de entrenamiento y las versiones del entorno. El script principal es `eval.py`, y al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.

## Capacidades

- Generación de texto: no aplica ni está documentada; el modelo está orientado a recuperación, no a generación.
- Recuperación (retrieval): es el propósito declarado de la arquitectura, pero el checkpoint entregado no ha sido entrenado, por lo que no se le puede atribuir ninguna capacidad de recuperación efectiva.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no soportado ni documentado.
- Soporte de agentes y razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles. La fusión tensorial sugiere un diseño multimodal genérico, pero no se confirma ni se detalla en la documentación.
- Punto de partida reproducible: el repositorio incluye `config.json`, `training_args.json` y un ejemplo ejecutable dentro del bloque `__main__` de `eval.py` para pruebas de humo.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que un script de entrenamiento o evaluación arranca, carga pesos y produce salidas con la forma esperada, sin coste computacional relevante dado su tamaño de 16.576 parámetros.
- Reproducción de recetas de optimización: sirve para validar configuraciones de novograd con scheduler exponencial sobre una arquitectura Perceiver antes de escalar a un modelo mayor.
- Desarrollo de adaptadores de carga personalizados: al ser una implementación propia, es un banco de pruebas para escribir adaptadores que integren modelos no estándar en frameworks de inferencia o entrenamiento.
- Experimentación académica con atención de ventana deslizante: permite medir el efecto de la ventana y de la fusión tensorial en tareas de recuperación con un coste mínimo de GPU.
- Evaluación comparativa en Flickr30k: la model card propone este conjunto como primera evaluación, reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad equivalente.
- Docencia y formación en arquitecturas Perceiver: el código es un ejemplo compacto y ejecutable para explicar atención cruzada con latentes, normalización groupnorm y activación swish.
- Verificación de entornos y CI ligero: al ocupar 0,0 GB, puede incluirse en tests automáticos de integración que comprueben que el código de modelado no se rompe entre versiones de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint de inicialización no ha sido entrenado ni auditado. La única orientación de evaluación aportada es cualitativa: usar Flickr30k, reportar la métrica de la tarea en al menos tres semillas e incluir una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. Con 16.576 parámetros en precisión de 32 bits, el checkpoint ocupa del orden de decenas de kilobytes; cabe en cualquier GPU, en CPU e incluso en entornos embebidos.
- GPU recomendadas: cualquiera. No se requiere A100, H100 ni RTX 4090; el modelo no justifica aceleración dedicada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e integrada, y también en CPU sin penalización apreciable.
- Opciones de despliegue: PyTorch con el script `eval.py` incluido. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y al ser una implementación personalizada las APIs genéricas de carga requieren un adaptador explícito.
- Latencia y throughput estimados: no disponibles. Dado el tamaño del modelo, la latencia estaría dominada por el coste de carga del script y no por la inferencia.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harrythomp/retrieval-tiny12 | Perceiver para retrieval (checkpoint sin entrenar) | 16.576 | no disponible | bsd-3-clause | HuggingFace |
| CLIP (OpenAI) | Recuperacion imagen-texto | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | pesos publicos |
| BLIP | Recuperacion y captioning imagen-texto | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | pesos publicos |
| Perceiver IO (DeepMind) | Arquitectura Perceiver generica multimodal | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | pesos publicos |

No se dispone de datos verificados de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion cuantitativa de parametros, contexto y rendimiento no es posible. La diferencia cualitativa principal es que retrieval-tiny12 es un punto de partida sin entrenar y sin benchmarks, mientras que las alternativas citadas son modelos entrenados y evaluados.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no debe esperarse ninguna calidad de recuperación, clasificación ni generación.
- El checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio, segun la propia model card.
- No se declaran idiomas soportados, por lo que no hay garantia de comportamiento multilingue.
- Inconsistencia de nomenclatura: el ID indica "tiny12" y los parametros reales son 16.576, mientras que la model card declara escala "xlarge". Verificar antes de citar cualquier cifra de tamano.
- Riesgo de alucinacion de resultados: al no existir benchmarks, cualquier cifra de rendimiento atribuida a este modelo seria inventada.
- Restricciones de licencia: se distribuye bajo bsd-3-clause, permisiva para uso comercial, pero la propia documentacion advierte de que deben revisarse por separado los terminos de las fuentes de datos externas si se usa con conjuntos como Flickr30k.
- Integracion: al ser una implementacion personalizada, no funciona con cargadores automaticos estandar sin un adaptador explicito, lo que anade trabajo de ingenieria.
- Idoneidad para produccion: nula en su estado actual; solo apto para experimentacion, docencia y pruebas de humo.

## Enlaces

- HuggingFace: https://huggingface.co/Harrythomp/retrieval-tiny12
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
