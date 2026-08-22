# justinchuby/sensenova-u1.5-8b-mot-onnx-canonical

## Resumen

SenseNova U1.5 es un modelo multimodal nativo desarrollado por SenseTime dentro de la serie SenseNova-U1, que unifica comprensión, razonamiento y generación de imágenes en una arquitectura monolítica llamada NEO-unify. A diferencia de los enfoques tradicionales que acoplan un codificador de visión con un modelo de lenguaje mediante adaptadores, este modelo procesa texto e imagen de forma unificada, sin depender de un VAE ni de componentes externos. La versión 1.5 introduce capas de codificación y decodificación de parches mejoradas, amplía el corpus de entrenamiento texto-a-imagen y refina los datos de edición tanto para referencias de imagen única como múltiple.

El repositorio analizado contiene una exportación canónica del modelo SenseNova-U1.5-8B-MoT en formato ONNX, con 8 mil millones de parámetros y licencia Apache 2.0. El paquete incluye cinco componentes exportados: un embedding de texto fp16, un encoder de visión, un decoder de comprensión, un embedding de generación de imágenes fp32 y un denoiser. La metadata de inferencia controla el compartido de caché KV congelada condicional, conversiones de estado fp16 a fp32, ruido determinista basado en contador, clasificación libre de guía (CFG), velocidad x0-to-flow, integración de Euler y salida RGB limitada.

La relevancia actual del modelo reside en su capacidad de ejecutar cuatro tareas desde un único modelo: texto-a-imagen, edición de imágenes, comprensión visual y generación interleaved de texto e imagen. La evidencia de ejecución en NVIDIA H200 muestra tiempos de 6.99 segundos para generar una imagen 512×512 en 20 pasos, con un pico de VRAM de 91,256 MiB. La comunidad ha demostrado además que la cuantización Q4_0 en GGUF permite ejecutar el modelo completo en una GPU de consumo como la RTX 5080 con 16 GB de VRAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NEO-unify (multimodal monolítica) |
| Parametros totales | 8 mil millones (8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16/fp32 (ONNX), Q4_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp16/fp32), safetensors (original), GGUF (derivado) |

## Arquitectura y entrenamiento

El modelo SenseNova U1.5 se basa en la arquitectura NEO-unify, que integra comprensión y generación multimodal en una sola red sin adaptadores entre modalidades. La versión 1.5 introduce capas de codificación y decodificación de parches renovadas, y amplía el corpus de entrenamiento texto-a-imagen, filtrando y sintetizando datos de edición para escenarios de referencia de imagen única y múltiple. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset o si se aplicaron técnicas como RLHF o DPO en la información consultada.

El paquete ONNX exportado incluye cinco componentes: un embedding de texto fp16, un encoder de visión, un decoder de comprensión, un embedding de generación de imágenes fp32 y un denoiser. La metadata de inferencia controla el compartido compartido de KV cache congelado condicional e incondicional, las conversiones de estado fp16 a fp32, el ruido determinista basado en contador, la clasificación CFG, la velocidad x0-to-flow, la integración de Euler y la salida RGB limitada. Este diseño permite ejecutar el modelo completo sin VAE ni encoders de imagen separados, como demuestra la guía de ejecución en RTX 5080.

## Capacidades

- Generación de imágenes texto-a-imagen hasta 2048×2048 sin VAE, según la guía de RTX 5080.
- Edición de imágenes con referencia de imagen única o múltiple, con datos de entrenamiento específicos para este fin.
- Comprensión visual (VQA) sobre imágenes en el mismo modelo que genera texto.
- Generación interleaved de texto e imagen en una secuencia única.
- Razonamiento multimodal integrado en una arquitectura monolítica sin adaptadores.
- Ejecución con cuantización Q4_0 en hardware de consumo, manteniendo las cuatro tareas principales.
- No se ha confirmado el soporte de tool calling o function calling en la información disponible.

## Casos de uso

- Generación automatizada de imágenes para marketing: el modelo puede crear imágenes de producto o campañas a partir de descripciones textuales, con tiempos de 6.99 s por imagen 512×512 en H200, lo que permite integrarlo en pipelines de producción de contenido.
- Edición de imágenes con instrucciones en lenguaje natural: un usuario puede modificar una fotografía de referencia indicando cambios específicos, y el modelo aplica la edición en 16.68 s para 512×512, útil en flujos de diseño gráfico y retoque.
- Asistentes multimodales para documentación técnica: al combinar comprensión visual y generación de texto, el modelo puede describir diagramas o esquemas y generar explicaciones textuales coherentes.
- Sistemas de generación interleaved para informes: permite crear documentos que alternan párrafos e imágenes, por ejemplo para informes de análisis o presentaciones, sin necesidad de módulos separados.
- Despliegue en estaciones de trabajo con RTX 5080: gracias a la cuantización Q4_0, un solo equipo de gama alta puede ejecutar las cuatro tareas del modelo, lo que lo hace accesible para estudios de diseño o laboratorios de investigación.
- Investigación en arquitecturas unificadas: el modelo sirve como referencia abierta para estudiar la fusión de comprensión y generación en una sola red, con pesos y código publicados bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento provienen de la ejecución del paquete ONNX en NVIDIA H200 con ONNX Runtime 1.28 CUDA:

| Métrica | Valor |
|---|---|
| Texto-a-imagen 512×512, 20 pasos | 6.99 s |
| Edición de imagen 512×512, 20 pasos | 16.68 s |
| Pico de VRAM (H200) | 91,256 MiB |
| Logits de prefill de texto | [1, 28, 151936] fp16 |

Estos datos corresponden a una configuración específica con el motor de ONNX GenAI y no son comparables con benchmarks de modelos de lenguaje puros.

## Requisitos de hardware

- VRAM estimada: el paquete ONNX completo en fp16/fp32 requiere al menos 92 GB de VRAM para inferencia, según el pico observado en H200.
- GPUs recomendadas: H200 (probado), o GPUs con más de 96 GB de VRAM para el paquete ONNX completo.
- GPUs de consumo: la cuantización Q4_0 en GGUF permite ejecutar las cuatro tareas en una RTX 5080 con 16 GB de VRAM, según la guía de la comunidad.
- Opciones de despliegue: ONNX Runtime CUDA 1.28 con ONNX GenAI (`Engine::from_pipeline_dir`), y formato GGUF para llama.cpp u Ollama.
- Latencia y throughput: 6.99 s por imagen de 512×512 en 20 pasos (H200); 16.68 s para edición de imagen; sin datos de throughput en batch.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con modelos similares como Emu o Chameleon. El modelo se distingue por su arquitectura NEO-unify, que elimina la necesidad de VAE y adaptadores, y por su licencia Apache 2.0, que permite uso comercial. No se han publicado datos comparativos de rendimiento con alternativas de la misma categoría en la información consultada.

## Limitaciones y advertencias

- El paquete ONNX actual no expone un bucle completo de decodificación de tokens; solo logits de prefill de texto, lo que limita su uso para generación de texto autónoma.
- Los contratos de servidor para OpenAI Images/A1111 aún no están disponibles; se requieren especificaciones de solicitud tipadas para usar el modelo en producción.
- El consumo de VRAM en configuración fp16/fp32 es elevado (91 GB), lo que restringe el despliegue a GPUs de servidor de gama alta.
- La cuantización Q4_0 puede introducir degradación en la calidad de las imágenes generadas, aunque se ha demostrado funcional en RTX 5080.
- No se han publicado datos sobre sesgos, idiomas soportados o riesgos de alucinación del modelo base.
- El tamaño del repositorio es de 51.6 GB, lo que puede ser un obstáculo para descargas en entornos con ancho de banda limitado.

## Enlaces

- Repositorio HuggingFace del paquete ONNX: https://huggingface.co/justinchuby/sensenova-u1.5-8b-mot-onnx-canonical
- Modelo original SenseNova-U1.5-8B-MoT: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Modelo SenseNova-U1-8B-MoT: https://huggingface.co/sensenova/SenseNova-U1-8B-MoT
- GitHub del proyecto SenseNova-U1: https://github.com/OpenSenseNova/SenseNova-U1
- Documento de preview de U1.5: https://github.com/OpenSenseNova/SenseNova-U1/blob/main/docs/u1.5_preview.md
- Guía de ejecución en RTX 5080: https://smeltcore.com/recipes/sensenova-u1-8b-mot-on-rtx-5080-vae-free-unified-image-gen-understanding-via-q4-gguf/
