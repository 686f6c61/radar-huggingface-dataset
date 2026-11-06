# ModernoTech/nova-models

## Resumen

Nova models es un repositorio de artefactos GGUF publicado por ModernoTech (bajo la marca Nova) que no contiene un modelo entrenado desde cero, sino una redistribución de cuantizaciones de modelos de terceros utilizadas por una aplicación denominada Nova. El repositorio aloja un único archivo propio, `Qwen3-0.6B-Q4_K_M.gguf`, que es una cuantización Q4_K_M sin modificaciones del modelo Qwen3-0.6B de Alibaba Qwen, publicado originalmente bajo licencia Apache-2.0. Los otros dos niveles del sistema (Nova Flash y Nova Pro) no se alojan aquí: se referencian directamente desde los repositorios oficiales `LiquidAI/LFM2.5-350M-GGUF` y `ggml-org/Qwen3.5-0.8B-GGUF`.

El interés técnico del repositorio es limitado como modelo en sí, pero resulta relevante como ejemplo de patrón de distribución: una aplicación cliente (aparentemente basada en navegador, dado que menciona caché OPFS) que consume pesos GGUF por HTTPS con verificación de integridad mediante tamaño y SHA-256. Los parámetros totales declarados en safetensors (751.632.384) no coinciden con los de Qwen3-0.6B (aproximadamente 600 millones), lo que sugiere que el campo agregado del repo no refleja fielmente el artefacto GGUF publicado.

No hay información sobre pipeline, licencia propia, idiomas ni métricas de rendimiento en la información disponible. Cualquier evaluación del comportamiento del modelo debe remitirse al model card oficial de Qwen3-0.6B, ya que este repositorio no aporta datos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B; no se detalla en el repo) |
| Parametros totales | 751.632.384 (campo safetensors del repo); el artefacto GGUF corresponde a Qwen3-0.6B (~0,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repo (remitirse a Qwen3-0.6B) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el artefacto deriva de Qwen3-0.6B, Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura ni proceso de entrenamiento propios: es un contenedor de artefactos. El único archivo alojado es una cuantización Q4_K_M de Qwen3-0.6B, publicada sin modificaciones y verificable por tamaño (484.220.288 bytes) y SHA-256 (`03a9f2b5eaa26e8a801012cf5c2eb75f2997da0725ce99bc03622d4bae583fdd`). Por tanto, la arquitectura efectiva es la de Qwen3-0.6B (transformer decoder-only con atención y capas densas, sin mezcla de expertos), y los datos de entrenamiento, tokens vistos y posibles fases de RLHF/DPO son los del modelo original, no descritos aquí.

La innovación técnica del repositorio no está en el modelo sino en el mecanismo de distribución: Nova consume los GGUF por HTTPS con verificación de tamaño y hash, y reutiliza los pesos desde la caché OPFS del navegador. Los niveles Flash y Pro delegan en artefactos oficiales de LiquidAI y ggml-org respectivamente, lo que evita duplicar pesos en el repositorio.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repo).
- Razonamiento básico y respuesta a instrucciones, heredados de Qwen3-0.6B.
- Ejecución en entornos con recursos muy limitados gracias a la cuantización Q4_K_M (~484 MB).
- Integración en aplicaciones cliente vía descarga HTTPS con verificación de integridad.
- Soporte de caché local en navegador mediante OPFS (característica de la aplicación Nova, no del modelo).
- Tool calling, agentes, visión, audio y modo thinking: no disponible en la información del repo (dependen de las capacidades de Qwen3-0.6B, no documentadas aquí).

## Casos de uso

- Despliegue de un asistente conversacional ligero en el navegador: el GGUF Q4_K_M de ~484 MB puede descargarse y cachearse en OPFS, permitiendo conversaciones sin backend una vez cargado el modelo.
- Prototipado rápido de aplicaciones de chat con presupuesto de memoria mínimo: la cuantización Q4_K_M permite ejecución en CPU y en GPUs de gama baja.
- Verificación de integridad en pipelines de distribución de modelos: el patrón de tamaño + SHA-256 documentado sirve como referencia para empaquetar artefactos en aplicaciones que consumen pesos remotos.
- Evaluación comparativa de niveles de modelo dentro de una misma app: Nova permite alternar entre Core (Qwen3-0.6B), Flash (LFM2.5-350M) y Pro (Qwen3.5-0.8B) según los recursos del cliente.
- Educación y demos de inferencia local: el tamaño reducido facilita talleres y pruebas en portátiles sin GPU dedicada.
- Base para fine-tuning ligero o experimentación con cuantizaciones: al ser un GGUF estándar, puede cargarse en llama.cpp y herramientas compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB con Q4_K_M, dependiendo de la longitud de contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también ejecutable en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1050 Ti en adelante) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repo menciona consumo por HTTPS desde la app Nova con caché OPFS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nova Core (este repo) | ~0,6B (Qwen3-0.6B Q4_K_M) | no disponible | Apache-2.0 (heredada) | GGUF | Hugging Face |
| Qwen3-0.6B (origen) | ~0,6B | no disponible | Apache-2.0 | safetensors, GGUF | Hugging Face (Qwen) |
| LiquidAI LFM2.5-350M | ~0,35B | no disponible | no disponible | GGUF | Hugging Face (LiquidAI) |
| Qwen3.5-0.8B | ~0,8B | no disponible | no disponible | GGUF | Hugging Face (ggml-org) |

## Limitaciones y advertencias

- El repositorio no es un modelo original: es una redistribución de una cuantización de Qwen3-0.6B; cualquier limitación del modelo base aplica íntegramente.
- La licencia del repositorio figura como "no disponible"; el uso comercial debe atenerse a la licencia Apache-2.0 del modelo original Qwen3-0.6B.
- El campo de parámetros del repo (751.632.384) no coincide con el tamaño esperado de Qwen3-0.6B, lo que indica una posible inconsistencia en los metadatos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo instante: no hay evidencia de uso ni de validación por parte de la comunidad.
- Riesgo de alucinación y sesgos: los del modelo base Qwen3-0.6B, no documentados en este repo.
- El contexto máximo y los idiomas soportados no se especifican; deben consultarse en el model card de Qwen3-0.6B.
- Para producción, conviene descargar los pesos desde el repositorio oficial de Qwen y verificar el SHA-256, en lugar de depender de un mirror de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ModernoTech/nova-models
- Modelo origen Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Nova Flash (LFM2.5-350M-GGUF): https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Nova Pro (Qwen3.5-0.8B-GGUF): https://huggingface.co/ggml-org/Qwen3.5-0.8B-GGUF
