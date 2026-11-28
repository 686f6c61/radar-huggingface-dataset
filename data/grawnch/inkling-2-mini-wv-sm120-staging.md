# Grawnch/Inkling-2-Mini-WV-SM120-Staging

## Resumen

Inkling-2-Mini-WV-SM120-Staging es un checkpoint cuantizado y empaquetado para inferencia nativa en GPUs Blackwell (arquitectura `sm_120`/`sm_120a`) del modelo multimodal `thinkingmachines/Inkling-2-Mini`, publicado por el usuario Grawnch bajo licencia Apache-2.0. No es un modelo entrenado desde cero, sino una distribución de pesos cuantizados (formato `modelopt`) acompañada de un runtime propio (`qfn_inkling2_sm120==1.3.0`) que implementa un motor CUDA específico para Blackwell, decodificación especulativa con cabezas MTP y un servidor local compatible con las APIs de OpenAI y Anthropic.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidad de visión (pipeline `image-text-to-text`), pensado para ejecución local en tarjetas de consumo. El repo ocupa 19,2 GB e incluye shards de pesos de 10,12 GB, una torre de visión en BF16 (`vision_bf16.safetensors`, 636,5 MB) y wheels precompilados SASS-only para Python 3.13 en Windows y Linux. La propuesta es permitir ejecución íntegra en VRAM en tarjetas de 16 GB con contexto de 32K a 128K, o bien con streaming CPU-GPU en un presupuesto de 8 GB.

Su relevancia actual radica en que demuestra una vía práctica de servir un MoE multimodal con contexto de hasta 1M tokens (configurado en `config.json` con `model_max_length: 1,048,576` y escalado logarítmico de atención) sobre hardware Blackwell, con paridad bit a bit entre los modos de 16 GB y 8 GB y decodificación especulativa integrada. La información pública disponible sobre el modelo base (número de parámetros, datos de entrenamiento, benchmarks estándar) es escasa en la model card; los datos que se ofrecen son de rendimiento del runtime, no de calidad frente a benchmarks académicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con cabezas MTP para decodificación especulativa; runtime CUDA nativo para `sm_120`/`sm_120a` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el recuento) |
| Longitud de contexto | hasta 1.048.576 tokens (`config.json` `model_max_length`); modos prácticos de 32K–128K en 16 GB |
| Tipos de cuantizacion | Cuantización `modelopt` propietaria del checkpoint; KV cache en `bf16` o `q8_global`; visión en BF16 nativo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards `embed_head_global`, `layers_00_05` … `layers_18_23`, `mtp_wv63`, `vision_bf16`) |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` es un transformer de mezcla de expertos (MoE) con codificador de visión, orientado a tareas `image + text -> text`. La model card no detalla el número de parámetros totales ni activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO. Tampoco se documenta la innovación arquitectónica interna del modelo base más allá de su naturaleza MoE y multimodal.

Lo que sí está documentado es el trabajo de empaquetado e inferencia: el checkpoint se distribuye cuantizado con `modelopt` y se acompaña de un runtime que implementa decodificación especulativa mediante cabezas MTP (multi-token prediction), con factores de aceptación (`tau`) medidos de hasta 3,803 en modo `bf16` y 3,683 en `q8_global` a 1M de contexto. El runtime soporta atención con escalado logarítmico (`n_floor=8192, alpha=0.1`) para extender el contexto hasta 1.048.576 tokens, y ofrece dos modos de ejecución: `all_vram` (todo en GPU, 16 GB) y `8gb_tiered` (streaming por capas CPU-GPU con tope de 6,80 GiB). La torre de visión se mantiene en BF16 y puede residir en GPU o streamearse por capas con menos de 60 MiB de huella, con paridad de 0 ULP entre ambos modos.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`chat_template.jinja`).
- Comprensión de imágenes (`image + text -> text`): la card verifica visión multimodal en vivo mediante `image_url` (OpenAI), `image` (Anthropic) e `input_image` (Responses API).
- Decodificación especulativa integrada con cabezas MTP, con ganancias medidas de hasta 646,90 tok/s en continuación de código de 512 tokens.
- Razonamiento y matemáticas: la card reporta throughput específico para prompts de matemáticas (340,03 tok/s con decodificación especulativa).
- Generación de código y JSON estructurado, con modos de decodificación especulativa dedicados.
- Recuperación de información en contexto muy largo: needle-in-a-haystack verificado a 1M tokens con 3/3 aciertos (posiciones 10%, 50% y 90%).
- Servidor local compatible con APIs de OpenAI y Anthropic, con soporte de SSE y batching continuo (hasta B=32).
- Tool calling / function calling: no se documenta explícitamente en la información disponible.
- Capacidades de agente multi-paso: no se documentan explícitamente.
- Idiomas: no disponible.

## Casos de uso

- **Asistente conversacional local con privacidad**: el modelo puede servirse mediante `qfn-inkling2-serve` en una RTX 5060 Ti de 16 GB a ~101,85 tok/s con 128K de contexto asignado, lo que permite mantener conversaciones largas sin enviar datos a la nube. Adecuado para entornos con requisitos de soberanía del dato.
- **Análisis de documentos extensos con recuperación**: gracias al contexto verificado de 1M tokens y al needle-in-a-haystack con 3/3 aciertos, puede usarse para localizar pasajes concretos en corpus largos (contratos, logs, expedientes) sin troceado previo.
- **Procesamiento multimodal de capturas y documentos escaneados**: la torre de visión BF16 permite pasar imágenes junto a texto en la misma petición, útil para extracción de datos de facturas, tickets o pantallazos en pipelines internos.
- **Generación de código en local para CI/CD**: con decodificación especulativa alcanzando 646,90 tok/s en continuación de código de 512 tokens, es viable integrarlo en un servidor interno que asista en autocompletado o generación de tests dentro de un pipeline, sin depender de APIs externas.
- **Backend compatible con OpenAI/Anthropic para herramientas existentes**: al exponer endpoints compatibles, se puede sustituir el proveedor en aplicaciones ya escritas contra esas APIs cambiando solo la URL base, lo que facilita migraciones y pruebas A/B.
- **Despliegue en estaciones de trabajo con 8 GB de VRAM**: el modo `8gb_tiered` con tope de 6,80 GiB permite ejecutar el modelo con visión en GPUs modestas a 123,05 tok/s especulativos, útil para prototipado en portátiles con GPU de gama media.
- **Servicio multiusuario con batching continuo**: el modo `B=32` alcanza 1.603,3 tok/s en RTX PRO 6000 Blackwell, lo que permite atender a un equipo pequeño desde un único servidor interno.

## Benchmarks y rendimiento

Los datos publicados son de rendimiento del runtime y de fidelidad de la cuantización, no de benchmarks académicos estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible para esas métricas.

| Metrica | Contexto / lote | Valor medido |
|---|---|---|
| Decodificación simple `M=1` | B=1 | 205,17 tok/s |
| Decodificación especulativa (código) | B=1 | 275,18 tok/s |
| Decodificación especulativa (matemáticas) | B=1 | 340,03 tok/s |
| Decodificación especulativa (JSON) | B=1 | 287,52 tok/s |
| Decodificación especulativa (prosa) | B=1 | 294,81 tok/s |
| Decodificación especulativa (code_cont_512) | B=1 | 646,90 tok/s |
| Decodificación especulativa (code_cont_2048) | B=1 | 550,11 tok/s |
| Batching continuo | B=4 / B=8 / B=16 (2K ctx) | 682,9 / 1150,4 / 1143,3 tok/s |
| Prefill | S=512 | 8268,2 tok/s (61,92 ms) |
| Prefill | S=2048 | 11868,3 tok/s (172,56 ms) |
| Prefill | S=8192 | 12411,1 tok/s (660,06 ms) |
| Prefill | S=32768 | 11304,3 tok/s (2898,73 ms) |
| Batching continuo | B=32 | 1603,3 tok/s |
| RTX 5060 Ti 16 GB, `all_vram`, 128K | B=1 | 101,85 tok/s (13,65 GiB VRAM pico) |
| RTX PRO 6000 Blackwell, `all_vram` | B=1 greedy | 145,96 tok/s |
| RTX PRO 6000 Blackwell, especulativo | B=1 | 232,91 tok/s (media 3 prompts) / 264,78 tok/s (muestreado) |
| Modo 8 GB `8gb_tiered` | B=1 especulativo | 123,05 tok/s (6,55 GiB VRAM pico) |
| Servidor HTTP, Chat JSON especulativo | — | 273,8+ tok/s |
| Paridad de cuantización (KLD vs FP) | 16.376 tokens | 0,068819 (92,422% Top-1) |
| Perplejidad `All_Val` | — | Teacher 5,30031 → cuantizado 5,39794 |

Además, la card reporta paridad bit a bit (`0.0 max_abs_diff`) entre los modos `all_vram` (16 GB) y `8gb_tiered` (8 GB) en 408 tokens, y paridad 0 ULP en la torre de visión BF16 entre ejecución residente en GPU y streameada por capas.

## Requisitos de hardware

- **VRAM para inferencia**: 13,65 GiB pico en modo `all_vram` con 128K de contexto en RTX 5060 Ti 16 GB; 6,55 GiB pico en modo `8gb_tiered`; 30,97 GiB con KV `q8_global` y 48,41 GiB con KV `bf16` para contexto completo de 1M en A100.
- **GPU recomendadas**: RTX 5060 Ti 16 GB (verificada), NVIDIA RTX PRO 6000 Blackwell (verificada), A100-SXM4-80GB (verificada para 1M de contexto). Cualquier GPU con `sm_120`/`sm_120a` (Blackwell) es compatible con el runtime nativo; el wheel universal cubre `sm_80`–`sm_120a`.
- **GPU de consumo**: sí, cabe en RTX 5060 Ti 16 GB y en GPUs con 8 GB mediante el modo `8gb_tiered` (con streaming por capas).
- **Opciones de despliegue**: runtime propietario `wv_universal_runtime` (wheel `wv_runtime_installer-1.5.2`) con CLI `python -m wv_runtime.serve`; servidor `qfn-inkling2-serve` (v1.3.0) compatible con OpenAI/Anthropic. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: prefill de 8.268 tok/s a S=512 y 12.411 tok/s a S=8192; decodificación de 101,85 tok/s en RTX 5060 Ti a 128K y hasta 1.603,3 tok/s con batching B=32 en RTX PRO 6000. Servidor HTTP con 2,89 s de wall time para 4 streams concurrentes de 256 tokens.
- **Requisitos de software**: Python 3.13 (`cp313`), wheels SASS-only para `win_amd64` y `linux_x86_64`; no requiere compilación de kernels en destino.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada (parámetros del modelo base, benchmarks académicos y datos de alternativas no están publicados). La comparación cuantitativa con otros MoE multimodales de tamaño similar no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-WV-SM120-Staging | no disponible | 1.048.576 (config) | Apache-2.0 | safetensors + runtime propio | Runtime nativo Blackwell, visión BF16, decodificación especulativa |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- **Dependencia de hardware específico**: el runtime está compilado para `sm_120`/`sm_120a` (Blackwell). Aunque el wheel universal cubre `sm_80`–`sm_120a`, el rendimiento y las optimizaciones documentadas se han verificado en Blackwell; en arquitecturas anteriores el comportamiento no está garantizado.
- **Runtime propietario y no estándar**: no se ofrece soporte para vLLM, llama.cpp, Ollama ni TGI. La integración requiere instalar el wheel `wv_runtime_installer` desde un repositorio de Hugging Face y usar el CLI propio, lo que añade dependencia de un único mantenedor.
- **Python 3.13 exclusivo**: los wheels son `cp313`; entornos con versiones anteriores de Python no pueden usar el runtime tal cual.
- **Datos del modelo base incompletos**: no se publican número de parámetros, composición del dataset, idiomas soportados ni resultados de benchmarks académicos, lo que dificulta evaluar sesgos, calidad multilingüe y rendimiento frente a alternativas.
- **Riesgo de alucinación**: no cuantificado en la información disponible; como en cualquier LLM generativo, debe validarse la salida en producción, especialmente en dominios factuales.
- **Sesgos**: no documentados. La ausencia de información sobre datos de entrenamiento impide evaluar sesgos de género, idioma o dominio.
- **Licencia Apache-2.0**: permite uso comercial, pero el usuario debe verificar que los pesos base (`thinkingmachines/Inkling-2-Mini`) mantienen la misma licencia y que el runtime propietario no impone restricciones adicionales no recogidas en la card.
- **Contexto de 1M costoso**: requiere 30,97 GiB (KV `q8_global`) o 48,41 GiB (KV `bf16`) solo para KV cache, además de un prefill de ~1.000 s en A100; no es viable en GPUs de consumo a esa longitud.
- **Estado "Staging"**: el nombre del repo sugiere un checkpoint en preparación; conviene fijar una revisión concreta para producción y no asumir estabilidad de la API del runtime entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Inkling-2-Mini-WV-SM120-Staging
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime universal (wheels): https://huggingface.co/Grawnch/wv-runtime-binaries
- Repositorio de binarios del runtime (instalador): https://huggingface.co/Grawnch/wv-runtime-binaries/resolve/main/wheels/wv_runtime_installer-1.5.2-py3-none-any.whl
