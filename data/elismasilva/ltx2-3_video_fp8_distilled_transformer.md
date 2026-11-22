# elismasilva/ltx2.3_video_fp8_distilled_transformer

## Resumen

Este repositorio contiene una conversión a FP8 weight-only del transformer del modelo de generación de vídeo LTX 2.3 Distilled, publicada por el usuario elismasilva. No se trata de un modelo entrenado desde cero, sino de una representación serializada de los pesos del transformer original (derivado de OzzyGT/LTX-2.3-Distilled-1.1, a su vez basado en Lightricks/LTX-2.3) usando el formato `Float8WeightOnlyConfig(version=2)` de TorchAO. El objetivo es reducir el espacio ocupado por los pesos en memoria (19.000 millones de parámetros en el transformer) sin alterar el resto de componentes del pipeline.

El modelo es relevante para quienes despliegan LTX 2.3 en entornos con VRAM limitada, ya que permite almacenar los pesos en E4M3 por fila manteniendo el cálculo lógico en BF16. Es importante subrayar que solo se incluye el transformer bajo el directorio `transformer/`; el text encoder, VAE, scheduler y demás componentes deben obtenerse del modelo fuente. La licencia es la LTX-2 Community License Agreement, con restricciones de uso y condiciones de licencia comercial.

La conversión abarca 1.660 pesos lineales y se realizó con Torch 2.12.1+cu132, TorchAO 0.18.0 y Safetensors 0.8.0. No es un checkpoint FP8 genérico cargable por cualquier loader: requiere reconstruir la representación TorchAO guardada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación de vídeo (LTX 2.3) |
| Parámetros totales | 18.993.719.808 (transformer) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 weight-only (E4M3 por fila, `Float8WeightOnlyConfig(version=2)` de TorchAO); cálculo lógico en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (`ltx-2-community-license-agreement`) |
| Formato de pesos | safetensors (representación TorchAO FP8, 10 shards) |

## Arquitectura y entrenamiento

El transformer pertenece a la familia LTX 2.3 de Lightricks, un modelo de difusión para generación de vídeo. Este repositorio no documenta la arquitectura interna más allá de su naturaleza de transformer de difusión; se desconoce el número de capas, dimensión de atención o mecanismo de atención exacto. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF, DPO u otras fases de alineamiento, ya que esta ficha solo cubre la conversión de pesos.

La innovación técnica de este artefacto es la cuantización weight-only: los pesos lineales se guardan en E4M3 por fila mientras la computación se realiza lógicamente en BF16. Se convirtieron 1.660 pesos lineales. El autor advierte explícitamente que la cuantización weight-only es principalmente una opción de ahorro de memoria de pesos y no garantiza una inferencia más rápida. La carga requiere un loader capaz de reconstruir la representación TorchAO; la carga BF16 ordinaria es insuficiente.

## Capacidades

- Generación de vídeo mediante difusión, heredada del modelo base LTX 2.3.
- Flujo de trabajo validado en 1280×704, ocho segundos de vídeo y ocho pasos de muestreo.
- Compatibilidad con el pipeline de ejemplo DDO (`ddo-examples`) para benchmarks de precisión.
- Ejecución en Windows y Linux nativo con SDPA por defecto.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo, por tratarse de un modelo de difusión de vídeo.
- No se documentan modos de pensamiento, visión o audio adicionales.

## Casos de uso

- Generación de clips de vídeo de ocho segundos a 1280×704: el flujo validado por el autor confirma que el transformer FP8 completa este workload en Windows y Linux, por lo que sirve para producción de vídeo corto con VRAM ajustada.
- Despliegue en GPU con memoria limitada: al almacenar los pesos en FP8, el transformer ocupa menos memoria que su versión BF16, lo que permite encajar el pipeline en GPUs donde el checkpoint original no cabría.
- Benchmarking de precisión FP8 frente a BF16: junto con `ddo-examples`, permite comparar calidad visual y rendimiento entre ambas representaciones en una plataforma concreta.
- Integración en pipelines de difusión personalizados: al conservar la estructura de shards y config, se puede enchufar en cargas que reconstruyan la representación TorchAO.
- Investigación sobre cuantización weight-only: sirve como caso de estudio de conversión TorchAO con 1.660 pesos lineales convertidos y cálculo lógico en BF16.
- Evaluación de calidad visual en entornos Windows: el autor reporta una valoración visual buena en Windows con SDPA por defecto, útil para validar despliegues de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (calidad, FID, latencia, throughput) en la información disponible. El autor solo indica que el workload de 1280×704, ocho segundos y ocho pasos se completó en Windows y Linux nativo con SDPA por defecto, y que la salida en Windows recibió una valoración visual buena. No se ofrecen cifras comparativas frente a BF16.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras concretas. El transformer tiene 18.993.719.808 parámetros; en FP8 weight-only los pesos ocupan aproximadamente la mitad que en BF16, pero deben sumarse text encoder, VAE, scheduler y activaciones.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño del transformer (19.000 millones de parámetros) hace improbable que quepa completo en GPUs de consumo sin cuantización adicional u offloading.
- Opciones de despliegue: el autor referencia `ddo-examples` con dependencias FP8 opcionales y `hf download` para obtener el repo preservando la estructura de carpetas. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un transformer de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| elismasilva/ltx2.3_video_fp8_distilled_transformer | 18.993.719.808 (transformer) | no disponible | safetensors TorchAO FP8 | LTX-2 Community License | Hugging Face |
| OzzyGT/LTX-2.3-Distilled-1.1 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Lightricks/LTX-2.3 (original) | no disponible | no disponible | no disponible | LTX-2 Community License | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el transformer; el text encoder, VAE, scheduler y demás componentes deben obtenerse del modelo fuente.
- No es un checkpoint FP8 genérico: requiere un loader que reconstruya la representación TorchAO guardada; la carga BF16 ordinaria no funciona.
- La cuantización FP8 puede alterar la salida respecto a BF16; la aceptación en un caso concreto no garantiza resultados en todas las GPU, formas o backends.
- La cuantización weight-only no garantiza una inferencia más rápida; es principalmente una opción de ahorro de memoria.
- Licencia LTX-2 Community License Agreement con restricciones de uso y condiciones de licencia comercial; esta conversión no concede derechos adicionales.
- Se desconocen sesgos, riesgo de alucinación visual y limitaciones idiomáticas por falta de documentación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- Debe mantenerse juntos el config, el índice de shards y los diez shards de pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elismasilva/ltx2.3_video_fp8_distilled_transformer
- Modelo base: https://huggingface.co/OzzyGT/LTX-2.3-Distilled-1.1
- Modelo original: https://huggingface.co/Lightricks/LTX-2.3
- Ejemplos DDO: https://github.com/DEVAIEXP/ddo-examples
- Licencia: archivo `LICENSE` del repositorio (LTX-2 Community License Agreement)
- Atribución: archivo `NOTICE` del repositorio
