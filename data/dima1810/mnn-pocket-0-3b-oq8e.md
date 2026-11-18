# dima1810/MNN-Pocket-0.3B-oQ8e

## Resumen

MNN-Pocket-0.3B-oQ8e es una versión cuantizada del modelo base taobao-mnn/MNN-Pocket-0.3B, publicada por el usuario dima1810 en Hugging Face. Se trata de un checkpoint de aproximadamente 303 millones de parámetros (302.830.976 según los safetensors) almacenado en formato MLX con cuantización mixta de precisión, generado con la herramienta oQ de oMLX v0.8.0rc1. El modelo base pertenece a la familia Qwen3 según los tags del repositorio, y está pensado para ejecución en hardware Apple Silicon mediante el framework MLX.

La relevancia de esta ficha es limitada pero concreta: se trata de una conversión de pesos de un modelo pequeño (0,3B) a un formato cuantizado de ~8,5 bits por peso, con un tamaño de repositorio de solo 0,3 GB. Esto lo convierte en un candidato para experimentación local en dispositivos con memoria unificada modesta, prototipado rápido y despliegue en entornos Apple. No obstante, la información pública disponible es muy escasa: no hay model card del modelo base incluida, no se especifican idiomas, licencia, contexto ni datos de entrenamiento.

El autor no proporciona resultados de benchmarks ni detalles sobre el proceso de entrenamiento del modelo original. Toda la información técnica disponible se limita a la tabla de distribución de bits de la cuantización y al tamaño de los pesos. Cualquier evaluación de capacidades debe hacerse, por tanto, con cautela y verificando directamente el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se etiqueta como qwen3) |
| Parámetros totales | 302.830.976 (0,303B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 8-bit con grupo de 64 (99,982% de los pesos); BF16 (0,018%); media efectiva de 8,501 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base taobao-mnn/MNN-Pocket-0.3B más allá de la etiqueta "qwen3" presente en los tags del repositorio, lo que sugiere que deriva de la familia Qwen3 de Alibaba. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea alguna innovación como atención lineal o decodificación especulativa. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Lo único documentado es el proceso de cuantización: el checkpoint fue convertido con oQ (oMLX v0.8.0rc1) aplicando cuantización mixta de precisión. El 99,982% de los pesos lógicos (0,303B) se almacenan en formato affine de 8 bits con tamaño de grupo 64, con un coste efectivo de 8,50 bits por peso, mientras que un 0,018% residual permanece en BF16 (16 bits por peso). El resultado es un checkpoint de 0,322 GB (0,300 GiB) con una media efectiva de 8,501 bits por peso. Esta configuración busca preservar la calidad del modelo original reduciendo el espacio de almacenamiento respecto a un checkpoint BF16 completo.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje de la familia Qwen3, aunque no hay documentación específica que lo confirme.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones.
- Generación de código: no disponible; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: sí, al estar empaquetado en formato MLX.

## Casos de uso

- Prototipado local en Mac: el checkpoint de 0,3 GB en formato MLX permite cargar el modelo en un Mac con memoria unificada para probar pipelines de generación de texto sin depender de GPU dedicadas. Es adecuado por su reducido tamaño y su integración con MLX.
- Pruebas de cuantización: sirve como caso de estudio para evaluar el impacto de la cuantización affine de 8 bits con grupo 64 frente al modelo base en BF16, midiendo perplejidad y calidad de generación en tareas controladas.
- Docencia y experimentación: un modelo de 0,3B con pesos de 0,3 GB es manejable en entornos académicos para ilustrar el flujo completo de cuantización, carga y ejecución con MLX.
- Aplicaciones de baja latencia en dispositivo: para tareas de generación corta (autocompletado, clasificación de texto, respuestas breves) donde el coste de inferencia y la huella de memoria son críticos.
- Integración en herramientas de línea de comandos: al ser un modelo pequeño, puede incorporarse en utilidades CLI que requieran generación de texto local sin conexión.
- Evaluación comparativa de formatos: útil para comparar el rendimiento de MLX frente a otros runtimes (llama.cpp, MNN) sobre el mismo modelo base cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB para los pesos en 8 bits; el overhead de activaciones y caché KV depende del contexto, que no está documentado.
- GPU recomendadas: al estar en formato MLX, está orientado a Apple Silicon (series M1, M2, M3, M4) con memoria unificada. No se indica soporte para GPU NVIDIA.
- ¿Cabe en consumer GPU?: sí, por tamaño, pero el formato MLX limita la ejecución a hardware Apple; para GPU NVIDIA habría que reconvertir los pesos.
- Opciones de despliegue: MLX (librería nativa del checkpoint); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-oQ8e | 0,303B | no disponible | 8-bit affine (8,5 bits/peso) | no disponible | safetensors MLX |
| taobao-mnn/MNN-Pocket-0.3B (base) | 0,303B | no disponible | BF16 (presumiblemente) | no disponible | no disponible |
| Qwen3-0.6B (referencia de familia) | 0,6B | no disponible en esta ficha | múltiples | no disponible en esta ficha | safetensors, GGUF |

La comparativa con alternativas de la misma categoría no puede completarse con datos verificados: no se dispone de información sobre el contexto, la licencia ni el rendimiento de los modelos citados en la información proporcionada. La única comparación fiable es frente al modelo base, del que este checkpoint es una conversión cuantizada a 8,5 bits por peso con un tamaño de 0,3 GB.

## Limitaciones y advertencias

- Información muy escasa: no hay model card del modelo base, ni datos de entrenamiento, benchmarks, idiomas o licencia.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base taobao-mnn/MNN-Pocket-0.3B antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; sin evaluaciones publicadas no puede cuantificarse.
- Sesgos: no documentados; un modelo de 0,3B suele presentar sesgos acentuados por su limitada capacidad.
- Limitaciones de contexto e idioma: desconocidas; no se especifica la ventana de contexto ni los idiomas soportados.
- Formato propietario de runtime: el checkpoint está en MLX, lo que restringe su uso a hardware Apple Silicon salvo reconversión.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-17): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/dima1810/MNN-Pocket-0.3B-oQ8e
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
