# Lottolabs/Qwen3.5-9B-TT-BFP4-P150-tt-model

## Resumen

Qwen3.5-9B-TT-BFP4-P150-tt-model es un paquete comunitario publicado por Lottolabs que empaqueta el checkpoint oficial Qwen/Qwen3.5-9B (equipo Qwen, Alibaba Cloud, licencia Apache-2.0) para su ejecución sobre hardware Tenstorrent p150. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del checkpoint upstream (revisión c202236), y lo que aporta el paquete es el runtime, la configuración de despliegue y la receta de conversión a proyecciones BFP4 empaquetadas (el resto de tensores en BF16) que se aplica en tiempo de carga.

El modelo base es un transformer híbrido de 9.000 millones de parámetros y 32 capas que combina atención lineal Gated DeltaNet con atención completa con compuertas, e incorpora una cabeza MTP (multi-token prediction) de una capa. El paquete lo sirve exclusivamente como modelo de texto a través de la API compatible con OpenAI de vLLM, sobre un runtime tt-metal personalizado con kernels fusionados de Gated-DeltaNet y SwiGLU, normas fragmentadas, decode trazado y decodificación especulativa MTP-1.

Su relevancia es acotada pero concreta: es una de las pocas recetas publicadas para ejecutar un modelo de ~9B en un acelerador Tenstorrent p150 con cuantización de 4 bits empaquetada, lo que interesa a quien evalúe alternativas de hardware no-NVIDIA para inferencia de texto en un solo dispositivo. Las limitaciones son severas: 8.192 tokens de contexto, una única secuencia concurrente y una única unidad P150 por despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet (atención lineal) + atención completa con compuertas; 32 capas; cabeza MTP de una capa |
| Parametros totales | 9B (heredados de Qwen/Qwen3.5-9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del runtime en P150) |
| Tipos de cuantizacion | Proyecciones en BFP4 empaquetado; resto de tensores en BF16 (conversión en tiempo de carga) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint upstream en safetensors (Qwen/Qwen3.5-9B); tensores de dispositivo BFP4/BF16 generados en la primera carga; paquete distribuido como imagen Docker + manifiesto tt-model (schema 5.1) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida en la que las capas alternan atención lineal Gated DeltaNet —de coste lineal en la longitud de secuencia— con capas de atención completa con compuertas, lo que reduce el coste de prefill y memoria de KV en contextos largos. Sobre el tronco se añade una cabeza MTP de una capa que predice un token adicional por paso y que el runtime aprovecha para decodificación especulativa MTP-1 (un borrador por paso, aceptación del 83% según la medición canónica reportada).

Este paquete no entrena ni ajusta nada: parte del checkpoint BF16 oficial y, en la primera carga, convierte en el host las proyecciones a BFP4 empaquetado, dejando el resto en BF16, y compila kernels específicos para el dispositivo (tt-metal de59f8a, v0.76.0 + 1, con los cambios en C++ de ttnn de la release). El runtime incluye kernels fusionados de Gated-DeltaNet y SwiGLU, normas fragmentadas y decode trazado. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y completions vía API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`, `/v1/models`) en el puerto 20000.
- Razonamiento con modo thinking activado por defecto; la salida de razonamiento se separa en el campo `reasoning` (parser `qwen3`) y puede desactivarse por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling habilitado mediante el parser `qwen3_coder`: las peticiones con `tools` devuelven `tool_calls` y `finish_reason: tool_calls`.
- Decodificación especulativa MTP-1 para peticiones greedy individuales.
- Capacidades multilingües: no disponibles en la información del paquete.
- Sin visión: el paquete es solo texto; la visión del modelo base queda explícitamente fuera de alcance y sin probar.

## Casos de uso

- Asistente de chat de un solo usuario en un dispositivo Tenstorrent p150: el runtime admite una única secuencia concurrente (`max_num_seqs` 1) y 8.192 tokens de contexto, adecuado para un puesto de trabajo o una demo interna con interfaz de chat.
- Evaluación de hardware alternativo a GPU: permite medir latencia y throughput reales de un modelo de 9B en 4 bits sobre P150 (aproximadamente 71 tok/s de decode y TTFT de 178–911 ms según la longitud de entrada) para comparar con despliegues en A100 o RTX 4090.
- Pruebas de integración con la API de OpenAI: al exponer endpoints estándar, sirve para validar clientes, SDK y pipelines existentes contra un backend no-NVIDIA sin reescribir código.
- Prototipos de agentes con tool calling: el parser `qwen3_coder` devuelve `tool_calls` estructurados, suficiente para validar flujos de llamada a funciones en un entorno de desarrollo con un solo usuario.
- Razonamiento asistido con trazas separadas: el campo `reasoning` independiente del contenido final facilita construir interfaces que muestran u ocultan el proceso de pensamiento, útil en demos de productos de análisis.
- Banco de pruebas de cuantización BFP4: el paquete permite estudiar el impacto numérico de las proyecciones BFP4 frente a BF16 en un modelo híbrido, aunque sin garantías de equivalencia de calidad.

## Benchmarks y rendimiento

Rendimiento medido por la release (benchmarks/clean-download-speed.json, `benchmark.py`; `/v1/completions` en streaming, temperatura 0, 512 tokens generados, una petición de calentamiento y 5 medidas, medianas):

| Perfil | ISL | OSL | Concurrencia | N | TTFT (ms) | Prefill tok/s/u | Decode tok/s/u | E2EL (s) |
|---|---|---|---|---|---|---|---|---|
| mtp | 5 | 512 | 1 | 5 | 189 | — | 71,4 | 7,34 |
| mtp | 21 | 512 | 1 | 5 | 178 | — | 71,3 | 7,35 |
| mtp | 481 | 512 | 1 | 5 | 911 | 528 | 70,6 | 8,15 |

Medición canónica LocalMaxxing (reasoning-v1, 254 tokens de prompt y 512 de salida): 76,15 tok/s de decode, TTFT de 209 ms y aceptación MTP del 83%. Estas cifras no se han vuelto a medir en este paquete; según el autor, una petición greedy servida por este paquete devuelve los mismos token ids que la imagen de la release.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Acelerador: una única Tenstorrent p150 (mesh `P150`); no se ejecuta en GPU NVIDIA ni en CPU.
- RAM de host: 32 GB según la release; el checkpoint BF16 upstream ocupa unos 19,3 GB en la caché de Hugging Face y la conversión genera unos 10 GB adicionales de tensores de dispositivo y caché de kernels.
- Almacenamiento: espacio para la imagen Docker, el checkpoint upstream (descargado aparte, no incluido en la imagen) y la caché de kernels.
- Software: Tenstorrent CLI (`uv tool install tenstorrent`) y Docker; arranque con `tt serve Lottolabs/Qwen3.5-9B-TT-BFP4-P150-tt-model` o `tt-model serve ...`.
- Firmware probado: P150 con firmware 19.15.0 y tt-kmd 2.11.0 (la release original se verificó con 19.13.2); el conjunto golden de tt-cli (firmware 19.17.1) no está probado.
- Arranque: la primera ejecución compila kernels para el dispositivo y tarda varios minutos; los arranques posteriores reutilizan la caché.
- Throughput y latencia: aproximadamente 70–76 tok/s de decode y TTFT de 178–911 ms con una sola secuencia; no hay datos de concurrencia superior a 1 porque no está soportada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-TT-BFP4-P150-tt-model (este paquete) | 9B | 8.192 tokens | Tenstorrent p150 (1 dispositivo, 1 secuencia) | Apache-2.0 | Hugging Face + imagen Docker; 0 descargas |
| Qwen/Qwen3.5-9B (upstream) | 9B | no disponible en la información | GPU convencional (BF16) | Apache-2.0 | Hugging Face |
| Lottolabs/Qwen3.5-9B-TT-BFP4-P150 (release de runtime) | 9B | 8.192 tokens | Tenstorrent p150 | Apache-2.0 | Hugging Face; runtime del que deriva este paquete |

No se dispone de datos de rendimiento del modelo upstream ni de alternativas de otros fabricantes en la información proporcionada, por lo que no es posible una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Solo texto: la visión del modelo base no está probada y queda fuera del alcance del paquete.
- Una única secuencia activa (`max_num_seqs` 1) y un máximo de 8.192 tokens de contexto; no apto para cargas multiusuario ni contextos largos.
- Las proyecciones BFP4 alteran la numerología respecto a BF16; la release reporta que prompts largos repetidos dieron completions distintas a temperatura 0 con MTP, por lo que no se garantiza determinismo ni equivalencia de calidad con el modelo BF16.
- Dependencia estricta de hardware y firmware: una p150, firmware 19.15.0 y tt-kmd 2.11.0 probados; el conjunto golden de tt-cli (19.17.1) no está validado.
- Construido sobre tt-metal de59f8a (v0.76.0 + 1), no sobre la versión del conjunto golden actual; posibles incompatibilidades con actualizaciones futuras.
- Primer arranque costoso: conversión completa del checkpoint BF16 en el host y compilación de kernels, con requisito de 32 GB de RAM y unos 10 GB de caché.
- Riesgo de alucinación y sesgos del modelo base: no hay documentación específica en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el paquete es una contribución comunitaria de Lottolabs, no una release oficial de Qwen ni de Tenstorrent; sin soporte ni garantías.
- Sin descargas ni likes en el momento de la consulta: madurez y validación por la comunidad muy limitadas.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Lottolabs/Qwen3.5-9B-TT-BFP4-P150-tt-model
- Release de runtime del que deriva: https://huggingface.co/Lottolabs/Qwen3.5-9B-TT-BFP4-P150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Manifiesto de bundles: https://github.com/LottoLottoLotto/tt-model-bundles
- Fork de tt-metal: https://github.com/LottoLottoLotto/tt-metal/tree/lottolabs/qwen3.5-9b-bfp4-p150
- Fork de vLLM: https://github.com/LottoLottoLotto/vllm/tree/lottolabs/qwen3.5-9b-bfp4-p150
- Plugins de modelo: https://github.com/LottoLottoLotto/tt-model-plugins/tree/lottolabs/qwen3.5-9b-bfp4-p150
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Tenstorrent CLI (prerrequisitos): https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
