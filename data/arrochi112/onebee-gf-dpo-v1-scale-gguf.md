# arrochi112/onebee-gf-dpo-v1-scale-gguf

## Resumen

`onebee-gf-dpo-v1-scale-gguf` es la conversión a GGUF del checkpoint `onebee-gf-dpo-v1-scale`, un modelo multimodal (visión y texto) de aproximadamente 4.630 millones de parámetros, desarrollado por el proyecto open-source `small-mind-companion` de arrochi112. El modelo parte de la base `google/gemma-4-E2B-it` y ha sido ajustado mediante LoRA con un entrenamiento de SFT consciente de memoria y posteriormente DPO (Direct Preference Optimization) sobre un objetivo de consistencia de persona, utilizando 223 pares de preferencia en un primer paso y 2049 en un segundo escalado. El proyecto investiga cuánta capacidad aparente puede recuperar un modelo pequeño (~2-4B) mediante post-entrenamiento, memoria externa y retrieval, en lugar de depender de un mayor número de parámetros.

Este repositorio en particular ofrece el modelo en formato GGUF para su ejecución con `llama.cpp`, incluyendo un proyector de visión (mmproj) necesario para entrada de imágenes. La relevancia actual radica en que demuestra cómo un modelo compacto con capacidades multimodales puede desplegarse en CPU y en dispositivos con recursos limitados, manteniendo una calidad conversacional razonable para tareas de compañía o asistencia. Es un checkpoint de investigación activa, con limitaciones documentadas de forma honesta en los documentos del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Google Gemma (variante E2B), con proyector de visión |
| Parametros totales | 4.628.569.635 (~4,63B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Gemma (hereda la licencia del modelo base) |
| Formato de pesos | GGUF (el checkpoint original en safetensors está en `arrochi112/onebee-gf-dpo-v1-scale`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Google Gemma (variante E2B), un transformer denso multimodal que procesa tanto texto como imágenes mediante un proyector de visión (mmproj) que se distribuye por separado en este repositorio. El entrenamiento se realizó mediante LoRA sobre el modelo base, con una primera fase de SFT (Supervised Fine-Tuning) consciente de memoria, seguida de una fase de DPO orientada a la consistencia de persona. El dataset de preferencias consistió en 223 pares en el primer paso y 2049 en el segundo escalado. El proyecto `small-mind-companion` incorpora además memoria externa y mecanismos de retrieval, aunque los detalles técnicos de estos componentes no se especifican en la información disponible. No se han publicado datos sobre el número total de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional con mantenimiento de una persona consistente, gracias al entrenamiento DPO.
- Procesamiento multimodal de imágenes (visión), mediante el proyector mmproj y la herramienta `llama-mtmd-cli`.
- Ejecución eficiente en CPU gracias a las cuantizaciones GGUF, con rendimiento medido en `llama-bench`.
- Soporte de chat con plantilla Jinja (requiere `--jinja` en `llama.cpp` para el modo visión).
- Orientado a aplicaciones de compañía (companion), con énfasis en coherencia de personalidad en conversaciones multi-turno.
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información proporcionada.

## Casos de uso

- Chatbot de compañía con personalidad estable: el modelo puede mantener una persona consistente a lo largo de conversaciones largas, gracias al ajuste DPO. Se desplegaría localmente con `llama-cli` en CPU, sin necesidad de GPU, ideal para usuarios que buscan privacidad.
- Asistente multimodal en entornos sin GPU: gracias a las cuantizaciones Q4_K_M (3,18 GiB) y al proyector de visión, puede describir imágenes o responder preguntas sobre ellas en equipos con solo CPU, como portátiles o mini-PCs.
- Prototipado rápido de aplicaciones de IA conversacional: al ser un checkpoint pequeño y con licencia Gemma, permite experimentar con técnicas de post-entrenamiento y memoria externa en un entorno de investigación, usando el repositorio GitHub como referencia.
- Evaluación de técnicas de cuantización en modelos multimodales: los múltiples archivos GGUF permiten comparar el impacto de distintos niveles de cuantización en la calidad de generación y el rendimiento, como se documenta en `docs/quantization_results.md`.
- Despliegue en dispositivos edge o embebidos: el tamaño reducido de las versiones Q3_K_M o Q2_K (alrededor de 3 GiB) posibilita su ejecución en dispositivos con poca memoria, como routers o placas tipo Raspberry Pi con suficiente RAM.
- Investigación en eficiencia de modelos pequeños: el proyecto `small-mind-companion` explora cómo la memoria externa y el retrieval pueden compensar la falta de escala, y este checkpoint sirve como base reproducible para esos estudios.

## Benchmarks y rendimiento

La model card proporciona resultados reales de `llama-bench` en CPU con 30 hilos, para tres cuantizaciones. No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Cuantizacion | Tamano | Prompt (pp512) | Generacion (tg128) |
|---|---|---|---|
| F16 | 8,62 GiB | 585,07 ± 0,44 t/s | 26,15 ± 0,28 t/s |
| Q8_0 | 4,59 GiB | 492,33 ± 1,21 t/s | 43,07 ± 0,24 t/s |
| Q4_K_M | 3,17 GiB | 633,00 ± 1,22 t/s | 58,00 ± 0,51 t/s |

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (3,18 GiB) se necesita al menos 4 GiB de VRAM si se ejecuta en GPU; para Q8_0 (4,61 GiB) se requieren unos 6 GiB; para F16 (8,64 GiB) se necesitan 10 GiB o más. Sin embargo, los benchmarks publicados son en CPU (30 hilos), por lo que también es viable sin GPU.
- GPU recomendadas: cualquier GPU con 4-6 GiB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3050, RTX 3060) puede ejecutar las versiones Q4_K_M o Q5_K_M. Para F16 se recomienda una GPU con 10-12 GiB, como RTX 3080 o superior.
- Ejecución en CPU: los benchmarks muestran que con 30 hilos de CPU se alcanzan 58 t/s en generación con Q4_K_M, suficiente para aplicaciones interactivas.
- Opciones de despliegue: `llama.cpp` (con `llama-cli` para texto y `llama-mtmd-cli` para visión, usando `--jinja`). También podría integrarse en Ollama si se convierte el GGUF, aunque no está confirmado.
- Latencia y throughput: los datos de `llama-bench` indican que Q4_K_M genera 58 t/s en CPU, y Q8_0 alcanza 43 t/s. En GPU se esperaría un throughput mayor, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este modelo con alternativas de la misma categoría (modelos pequeños multimodales). El proyecto menciona que se basa en `gemma-4-E2B-it`, pero no se han publicado resultados comparativos frente a otros modelos como LLaVA-7B, Phi-3-vision o MiniCPM-V. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de investigación en desarrollo activo, no un producto pulido. Los autores documentan limitaciones reales en los documentos del proyecto, incluyendo resultados negativos o inconclusos.
- No se ha medido formalmente la regresión de calidad por cuantización. Los autores solo verificaron que las versiones cuantizadas son "coherentes y relevantes" mediante pruebas de generación, no que sean "mediblemente tan precisas como F16".
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o hechos concretos.
- Limitaciones de idioma: no se especifican los idiomas soportados; probablemente el entrenamiento se centró en inglés, pero no está confirmado.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los términos de Google. Es necesario revisar la licencia completa antes de usar el modelo en producción.
- El proyector de visión (mmproj) es imprescindible para entrada de imágenes, y la plantilla de chat requiere `--jinja` en `llama.cpp`, lo que puede limitar la compatibilidad con otras herramientas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf
- Repositorio del checkpoint safetensors: https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale
- Proyecto GitHub small-mind-companion: https://github.com/arrogance231/small-mind-companion
- Documento de resultados de entrenamiento: https://github.com/arrogance231/small-mind-companion/blob/main/docs/proper_scale_results.md
- Documento de resultados de cuantización: https://github.com/arrogance231/small-mind-companion/blob/main/docs/quantization_results.md
