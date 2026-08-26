# amgadtewfik/atf

## Resumen

ATF (Adaptive Tensor Format) es un formato de contenedor y runtime de inferencia local diseñado específicamente para Apple Silicon, desarrollado por amgadtewfik. Su objetivo es eliminar los cuellos de botella de des-cuantización que sufren los runtimes genéricos (como llama.cpp) al ejecutar formatos de cuantización poco comunes (IQ4_NL, Q6_K, UD-Q2_K_XL) en Metal. En lugar de des-cuantizar en CPU, ATF emplea kernels Metal escritos a mano que operan directamente sobre los pesos cuantizados, acercando la velocidad de decodificación al límite de ancho de banda de memoria unificada del hardware.

El repositorio en HuggingFace contiene archivos `.atf` preconvertidos para modelos Qwen3.5-9B y Qwen3.8-27B, junto con el runtime y la herramienta de conversión. El formato es un único archivo mapeable en memoria (mmap) con cabecera de 128 bytes, lo que permite cargas en segundos y hot-swap de modelos sin reiniciar la aplicación. La licencia del formato y runtime es Apache-2.0, mientras que los pesos de los modelos siguen la licencia de Qwen. Es relevante ahora porque ofrece una alternativa optimizada para ejecutar LLMs cuantizados en Macs con 16 GB de memoria unificada, un caso de uso cada vez más común entre desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor y runtime para modelos transformer (Qwen) con kernels Metal personalizados |
| Parametros totales | No aplica (formato); soporta modelos de 9B y 27B segun ejemplos |
| Parametros activos | No aplica |
| Longitud de contexto | 64k tokens (ventana de contexto del runtime) |
| Tipos de cuantizacion | IQ4_NL, Q6_K, UD-Q2_K_XL, MLX 4-bit (y cualquier GGUF/MLX convertible) |
| Idiomas soportados | No disponible (depende del modelo subyacente) |
| Licencia | Apache-2.0 (formato y runtime); pesos bajo licencia Qwen |
| Formato de pesos | .atf (contenedor propio, mmap-able, 16-byte aligned) |

## Arquitectura y entrenamiento

ATF no es un modelo entrenado, sino un formato de serialización y un runtime de inferencia. Su arquitectura interna se compone de un contenedor de archivo único con cabecera de 128 bytes (magic "ATF1", versión, dimensiones, dtypes, tokenizer y tabla LOD) seguido de los pesos alineados a 16 bytes, mapeables en memoria. Los tensores son nativos de MLX pero llevan esquemas de cuantización GGUF, lo que permite reutilizar la cuantización existente sin conversión adicional. El runtime incluye kernels Metal escritos a mano para formatos como IQ4_NL y Q6_K, que antes se des-cuantizaban en CPU o directamente no eran soportados en Metal. No hay entrenamiento involucrado; el desarrollo se centra en la optimización de la capa de ejecución.

## Capacidades

- Ejecución de modelos cuantizados (GGUF y MLX) en Apple Silicon con kernels Metal optimizados, alcanzando velocidades de decodificación cercanas al ancho de banda de memoria (74 GB/s para IQ4_NL en M4).
- Carga bajo demanda: solo lee la cabecera de 128 bytes al inicio, permitiendo hot-swap de modelos con liberación completa de memoria GPU.
- Ventana de contexto de 64k tokens con prefill por chunks y caché KV preasignada y creciente.
- API compatible con OpenAI (chat completions) con streaming SSE, integrable con ChatBox, LibreChat, OpenWebUI, etc.
- Conversión de checkpoints GGUF y MLX/safetensors al formato .atf mediante CLI.
- Control de muestreo completo: temperatura, top_p, penalización de repetición y system prompt.
- Chats persistentes con exportación Markdown/JSON.

## Casos de uso

- Desarrollo local de aplicaciones LLM en Mac: un desarrollador puede ejecutar Qwen3.5-9B cuantizado con IQ4_NL a ~13 tok/s en un MacBook M4 de 16 GB, sin necesidad de GPU externa ni servicios en la nube, gracias a la carga en segundos y la baja huella de memoria.
- Integración con herramientas existentes vía API OpenAI-compatible: ATF Chat expone un servidor local en `http://localhost:8000/v1/chat/completions`, por lo que se puede conectar a OpenWebUI, LibreChat o cualquier cliente que hable el protocolo, sustituyendo a un backend remoto.
- Prototipado rápido de agentes conversacionales: la ventana de 64k tokens permite mantener conversaciones multi-turno largas con contexto amplio, adecuado para chatbots de soporte o asistentes personales que necesitan recordar interacciones previas.
- Evaluación de modelos cuantizados en hardware Apple: los investigadores pueden convertir sus propios checkpoints GGUF o MLX al formato .atf y medir la velocidad de decodificación real en Metal, comparando con runtimes genéricos.
- Despliegue de modelos en entornos con restricciones de privacidad: al ejecutarse 100% local, ATF permite procesar datos sensibles sin enviarlos a servidores externos, útil en sectores como salud o finanzas.
- Automatización de tareas de generación de código en equipos de desarrollo: con modelos como Qwen3.5-9B, se puede integrar en pipelines de CI/CD para generar documentación, tests o sugerencias de código, aprovechando la API local y el streaming.

## Benchmarks y rendimiento

Los datos de rendimiento publicados en la model card se refieren a velocidad de decodificación y carga en un Apple M4 con 16 GB de memoria unificada, con greedy decode y contexto de 4k:

| Modelo | Tamaño | Cuantización | Decodificación (warm) | Carga |
|---|---|---|---|---|
| Qwen3.5-9B-IQ4_NL.atf | 5.5 GB | IQ4_NL + Q6_K lm_head | 12.96 tok/s | 2.3 s warm / 9.6 s cold |
| Qwen3.5-9B-mlx4bit.atf | 6.9 GB | MLX 4-bit | ~12–13 tok/s | segundos |
| Qwen3.8-27B-UD-Q2_K_XL.atf | 9.5 GB | UD-Q2_K_XL (mixto K/IQ) | 4.73 tok/s | ~15 s |

Además, se reporta que el kernel IQ4_NL alcanza 74 GB/s de ancho de banda efectivo (frente a des-cuantización por token en CPU antes de ATF) y Q6_K 62 GB/s (antes no soportado, crasheaba). El error relativo máximo es ≤ 2.1e-06 para IQ4_NL y ≤ 2.3e-06 para Q6_K. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) porque ATF no es un modelo, sino un runtime.

## Requisitos de hardware

- Apple Silicon Mac (M1/M2/M3/M4) con 16 GB de memoria unificada como mínimo.
- macOS 13+.
- VRAM estimada: los modelos de ejemplo ocupan entre 5.5 GB y 9.5 GB en disco, y se ejecutan en 16 GB de memoria unificada sin problemas.
- GPU recomendada: cualquier GPU integrada en Apple Silicon; el rendimiento escala con el ancho de banda de memoria (M4 ~84 GB/s).
- No requiere GPU dedicada; funciona en todas las variantes de Apple Silicon.
- Opciones de despliegue: aplicación de escritorio ATF Chat (DMG) con Python/MLX incluidos, o mediante CLI para conversión y servidor API.
- Latencia y throughput: decodificación de 12-13 tok/s para modelos de 9B y ~4.7 tok/s para 27B en M4; carga en segundos (2.3 s warm para 9B).

## Comparativa con modelos similares

ATF compite con runtimes de inferencia local para Apple Silicon, no con modelos de lenguaje. La comparación se hace con llama.cpp (GGUF) y MLX (formato nativo de Apple):

| Característica | ATF | llama.cpp (GGUF) | MLX |
|---|---|---|---|
| Plataforma | Solo Apple Silicon | Multiplataforma (CPU/GPU) | Apple Silicon |
| Soporte de cuantizaciones | IQ4_NL, Q6_K, UD-Q2_K_XL, MLX 4-bit | Amplia gama (IQ, Q, K) | 2-8 bits |
| Velocidad de decodificación (9B, M4) | ~13 tok/s | Variable, a menudo menor en formatos exóticos | ~12-13 tok/s |
| Carga | Segundos (mmap) | Variable | Rápida |
| API OpenAI | Sí (integrada) | Vía servidor adicional | Vía MLX server |
| Licencia | Apache-2.0 (runtime) | MIT | MIT |

La ventaja de ATF es su kernel Metal optimizado para formatos que en llama.cpp se des-cuantizan en CPU, y su formato de archivo único con carga casi instantánea. La desventaja es su limitación a Apple Silicon y que aún no implementa la carga por niveles de precisión (roadmap).

## Limitaciones y advertencias

- Solo funciona en Apple Silicon; no hay soporte para Windows, Linux o GPUs NVIDIA/AMD.
- El formato .atf es propietario (aunque de código abierto) y no es compatible con runtimes estándar; requiere usar ATF Chat o la CLI de ATF.
- La carga por niveles de precisión (tiered-precision) anunciada en el nombre del formato aún no está implementada; todos los modelos se cargan con una única precisión.
- Los pesos de los modelos Qwen están sujetos a la licencia de Qwen, que puede tener restricciones de uso comercial; verificar los términos específicos.
- No se proporcionan datos de calidad de los modelos (MMLU, HumanEval, etc.) porque ATF es un runtime, no un modelo; la calidad depende del modelo subyacente.
- El rendimiento reportado se basa en un M4 con 16 GB; en chips más antiguos (M1/M2) la velocidad será menor.
- La ventana de 64k tokens es del runtime, pero el modelo subyacente puede tener un contexto nativo menor; ATF hace chunked prefill para manejar contextos largos, pero puede degradar la calidad si el modelo no fue entrenado para ello.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amgadtewfik/atf
- GitHub del proyecto (ATF Chat y CLI): https://github.com/amgadtewfik/atf
- Licencia de Qwen (para pesos): https://huggingface.co/Qwen
