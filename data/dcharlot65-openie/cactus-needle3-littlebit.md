# dcharlot65-openie/Cactus-Needle3-LittleBit

## Resumen

Cactus-Needle3-LittleBit es un checkpoint de pesos comprimidos derivado de Cactus-Compute/needle3, publicado por el usuario dcharlot65-openie. No se trata de un modelo entrenado desde cero, sino de una refactorización y cuantización del modelo base mediante la combinación de dos técnicas: LittleBit-2 (representación de pesos en planos de bits de baja precisión) y Sakana SVF (un método de factorización de pesos). El resultado es un artefacto de 75,92 MB que representa un modelo de 121.019.861 parámetros con una media de 2,6560 bits por peso (BPW).

El modelo está empaquetado en formato `.jsyn`, propietario del runtime JouleDB, una base de datos termodinámica y sustrato de inferencia sin PyTorch orientado a despliegues nativos en Kubernetes (JouleKube). Esto implica que el modelo no es consumible directamente por frameworks convencionales como transformers, vLLM o llama.cpp, sino únicamente a través de la herramienta de línea de comandos `jouledb`. Es relevante ahora por su propuesta de compresión sub-1-bit y su enfoque de "living weights", aunque su ecosistema es muy restringido y su adopción actual es nula (0 descargas, 0 likes en el momento de la ficha).

La información disponible sobre capacidades, datos de entrenamiento, idiomas y benchmarks es prácticamente inexistente en la model card, que se centra exclusivamente en el perfil de compresión y el procedimiento de arranque. Todo lo relativo a comportamiento funcional del modelo debe inferirse del modelo base, sobre el cual tampoco se aportan detalles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de Cactus-Compute/needle3; sin detalles en la model card) |
| Parametros totales | 121.019.861 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | LittleBit-2 (planos de bits de 2 bits) combinado con Sakana SVF; media de 2,6560 BPW |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Cactus-Compute/needle3, por lo que se desconoce si se trata de un transformer denso, un modelo híbrido o una arquitectura alternativa. Lo que sí se documenta es el proceso de transformación aplicado: el checkpoint original se ha descompuesto en 57 tensores 2D representados como planos de bits (LittleBit-2) y 7 vectores 1D correspondientes a LayerNorm, biases y convoluciones depthwise. Sobre esta representación se aplica la factorización SVF de Sakana, dando lugar a un formato de pesos "vivos" que JouleDB puede cargar sin PyTorch.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. El tamaño equivalente en FP16 sería de 230,83 MB, y la compresión alcanzada es de 3,04x (75,92 MB finales). La media de 2,6560 BPW sitúa el artefacto en la categoría de cuantización agresiva sub-3-bit, aunque el autor lo etiqueta como "sub-1-bit" en los tags, lo cual no se corresponde con la métrica reportada. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: presumiblemente heredada del modelo base, sin confirmación explícita en la model card.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Capacidad especial: carga e inferencia dentro del runtime JouleDB con pesos comprimidos en formato `.jsyn`.

## Casos de uso

- Despliegue en clústeres Kubernetes con JouleKube: el modelo está diseñado para ejecutarse como carga de trabajo nativa en Kubernetes a través de JouleDB, lo que permitiría integrarlo en infraestructuras de agentes que ya utilicen este sustrato. Es adecuado por su formato `.jsyn` y su runtime sin PyTorch.
- Inferencia en entornos con restricciones extremas de almacenamiento: con 75,92 MB, el checkpoint cabe en imágenes de contenedor muy pequeñas, lo que facilita su distribución en entornos edge o IoT donde el espacio es crítico.
- Pruebas de concepto de compresión sub-3-bit: investigadores interesados en evaluar la viabilidad de pesos a 2,6560 BPW pueden usar este artefacto como referencia reproducible dentro del ecosistema JouleDB.
- Sustitución del modelo base en pipelines JouleDB existentes: cualquier flujo que ya consuma `cactus-needle3` a través de `db.hf_pull()` puede apuntar a este checkpoint para reducir el tamaño de almacenamiento en un factor de 3,04x.
- Distribución de modelos en redes de baja bandwidth: el tamaño reducido permite transferir el artefacto en escenarios con ancho de banda limitado, siempre que el destino tenga JouleDB instalado.
- Archivado y versionado de checkpoints comprimidos: el formato incluye CRC32, lo que facilita la verificación de integridad en pipelines de CI/CD que gestionen artefactos de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del checkpoint (75,92 MB) sugiere que cabría en GPUs consumer, pero no se documentan requisitos reales de memoria en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el runtime JouleDB no documenta en esta ficha qué backends de aceleración soporta.
- Opciones de despliegue: exclusivamente JouleDB (`jouledb serve`), instalable mediante `cargo binstall jouledb`. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Cactus-Needle3-LittleBit | 121.019.861 | No disponible | Apache 2.0 | `.jsyn` (JouleDB) | Solo JouleDB |
| Cactus-Compute/needle3 (base) | No disponible | No disponible | Apache 2.0 | No disponible | Hugging Face |
| Alternativas de cuantización sub-3-bit convencionales | No disponible | No disponible | No disponible | GGUF, safetensors | llama.cpp, etc. |

No se dispone de información suficiente sobre el modelo base ni sobre alternativas directas en el mismo rango de compresión y formato para establecer una comparativa rigurosa de rendimiento.

## Limitaciones y advertencias

- El modelo no es consumible por herramientas estándar: requiere JouleDB v0.2.4 o superior, lo que limita drásticamente su integración en stacks convencionales.
- La etiqueta "sub-1-bit" de los tags no coincide con la media reportada de 2,6560 BPW; conviene tratar la nomenclatura del autor con cautela.
- No hay información sobre sesgos, alucinación, idiomas o comportamiento funcional del modelo; cualquier uso en producción requiere evaluación empírica previa.
- La licencia Apache 2.0 permite uso comercial, pero el formato `.jsyn` y el runtime JouleDB pueden imponer dependencias técnicas adicionales.
- El modelo tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No se documenta la arquitectura interna ni el proceso de entrenamiento del modelo base, lo que impide auditar su procedencia y calidad.
- El repositorio tiene un tamaño de 0,1 GB y fue creado y actualizado en la misma fecha (2026-11-23), sin historial de versiones.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Cactus-Needle3-LittleBit
- Modelo base: https://huggingface.co/Cactus-Compute/needle3
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
