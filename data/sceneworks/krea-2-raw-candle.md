# SceneWorks/krea-2-raw-candle

## Resumen

krea-2-raw-candle es una redistribución en formato nativo de Candle (framework de tensores en Rust) del modelo Krea-2-Raw, publicada por SceneWorks bajo el identificador SceneWorks/krea-2-raw-candle. Se trata de una conversión de pesos, no de un entrenamiento nuevo: parte del modelo base krea/Krea-2-Raw y de la conversión intermedia SceneWorks/krea-2-raw-mlx (commit b88090c7), y ofrece dos niveles de cuantización en formato GGML/GUFF empaquetados como bloques U8 para su uso con la librería candle y el ecosistema diffusers.

El objetivo del repositorio es proporcionar artefactos de inferencia listos para Windows y Linux usando Candle en lugar de MLX (que queda reservado a macOS). Incluye un tier q4 (Q4_1, convertido sin pérdida desde el tier q4 de MLX) y un tier q8 (Q8_0, cuantizado desde los pesos bf16 del transformer y del text_encoder). El repositorio ocupa 33,5 GB y no registra descargas ni interacciones en el momento de la consulta.

La información pública disponible es muy limitada: no se detallan parámetros totales, longitud de contexto, idiomas soportados ni resultados de benchmarks. La model card se centra exclusivamente en el proceso de conversión y cuantización, y remite a la licencia comunitaria krea-2-community-license para el uso del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base krea/Krea-2-Raw; pesos distribuidos como transformer + text_encoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_1 (tier q4, convertido sin pérdida desde MLX q4) y Q8_0 (tier q8, cuantizado desde bf16) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (license: other) |
| Formato de pesos | safetensors + GGUF por bloques (gguf-blocks); cada lineal cuantizado es un tensor U8 `{base}.weight` con forma [out, in/32, block_bytes] |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base krea/Krea-2-Raw en la documentación proporcionada. El repositorio indica que los pesos se organizan en un transformer y un text_encoder, y que la conversión se realizó con la herramienta candle_gen::ggml_tier del proyecto SceneWorks/inference. El tier q4 se obtuvo de forma lossless a partir del tier q4 de la conversión MLX, mientras que el tier q8 se generó cuantizando a Q8_0 los pesos bf16 originales del transformer y del text_encoder.

No se detallan datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) ni innovaciones arquitectónicas. La model card se limita a describir el pipeline de conversión y cuantización, no el entrenamiento del modelo original.

## Capacidades

- Generación de contenido multimodal texto-a-imagen: el repositorio incluye un text_encoder y un transformer compatibles con el pipeline de diffusers, lo que sugiere uso para síntesis de imágenes a partir de prompts textuales.
- Inferencia nativa en Candle: los pesos están empaquetados para ejecutarse con la librería candle en Rust, con soporte en Windows y Linux.
- Cuantización en dos niveles: tier q4 (Q4_1) para menor huella de memoria y tier q8 (Q8_0) para mayor fidelidad respecto a bf16.
- Compatibilidad con diffusers: los tags incluyen `diffusers`, lo que apunta a integración con el ecosistema de pipelines de difusión.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue de generación de imágenes en Windows y Linux: el repositorio está pensado para entornos donde MLX no está disponible; se usaría el tier q8 para calidad cercana a bf16 o el q4 para reducir requisitos de memoria.
- Integración en aplicaciones Rust con Candle: al ser artefactos nativos de Candle, permiten incorporar el pipeline de difusión dentro de servicios escritos en Rust sin depender de Python.
- Prototipado con recursos limitados: el tier Q4_1 reduce el espacio en disco y la memoria necesaria frente a bf16, adecuado para estaciones de trabajo con GPU de gama media.
- Evaluación comparativa de cuantizaciones: los dos tiers permiten medir la degradación de calidad entre Q4_1 y Q8_0 en el mismo pipeline.
- Reproducibilidad de la conversión: el repositorio documenta el commit exacto de origen (b88090c7) y la herramienta usada, lo que facilita auditar y reproducir los pesos.
- Distribución de artefactos en pipelines internos: el formato GGUF por bloques con un único tensor U8 por capa lineal simplifica el empaquetado y la carga en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 33,5 GB, pero no se desglosa por tier ni se indica la huella en memoria de cada cuantización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: candle (librería nativa en Rust) y diffusers; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SceneWorks/krea-2-raw-candle | no disponible | no disponible | krea-2-community-license | safetensors + GGUF por bloques (Candle) | Hugging Face |
| SceneWorks/krea-2-raw-mlx | no disponible | no disponible | krea-2-community-license | MLX (macOS) | Hugging Face |
| krea/Krea-2-Raw | no disponible | no disponible | krea-2-community-license | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- La información pública es mínima: no hay datos de arquitectura, parámetros, contexto ni idiomas, lo que dificulta evaluar su idoneidad sin consultar el modelo base.
- Es una conversión de pesos, no un modelo entrenado por SceneWorks; cualquier sesgo o limitación del modelo base krea/Krea-2-Raw se hereda.
- El tier q4 (Q4_1) puede introducir degradación de calidad frente a bf16, aunque se indique que la conversión desde MLX q4 es sin pérdida; la pérdida respecto al original ya se habría producido en el paso a MLX q4.
- La licencia krea-2-community-license es de tipo "other" y debe revisarse antes de cualquier uso comercial; no se detallan sus restricciones en la información disponible.
- Los artefactos están orientados a Candle en Windows y Linux; en macOS el autor recomienda usar los tiers MLX, por lo que no son portables a todos los entornos.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que no es posible verificar el rendimiento real de cada tier.
- Riesgo de alucinación y sesgos: no disponible para este repositorio; dependerá del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SceneWorks/krea-2-raw-candle
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Conversión MLX de referencia: https://huggingface.co/SceneWorks/krea-2-raw-mlx (commit b88090c79762ba34b1de23a892da239eb76962e4)
- Licencia: https://huggingface.co/SceneWorks/krea-2-raw-mlx/blob/main/LICENSE.pdf
