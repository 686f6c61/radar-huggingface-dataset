# litert-community/granite-4.1-3b

## Resumen

Granite-4.1-3B es un modelo denso de 3.4B parámetros desarrollado por IBM, publicado en abril de 2026 como parte de la familia Granite 4.1. Se trata de un modelo instruct ajustado para generación de texto, con soporte de contexto largo y tool calling, pensado para despliegues donde el coste por token y la huella de memoria importan. La versión aquí descrita no es el checkpoint original, sino la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`) para inferencia on-device con el runtime LiteRT-LM de Google.

La relevancia de esta ficha está en el formato: LiteRT-LM es el runtime de Google AI Edge para ejecutar modelos en dispositivos móviles y edge, con delegación a GPU mediante Metal en Apple y OpenCL en Android. El repositorio incluye dos artefactos cuantizados (int4 e int8) con mediciones reales de latencia y throughput en Galaxy S26, Pixel 8a, iPhone 17 Pro y Mac M4 Max, lo que lo convierte en una referencia útil para quien evalúe inferencia local en hardware de consumo.

El modelo base es un transformer denso de 40 capas, dimensión oculta 2560, atención GQA con ratio 40:8, embeddings atados y vocabulario de 100k tokens. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (40 capas, hidden 2560, GQA 40:8, embeddings atados) |
| Parametros totales | 3.4B (modelo base); el repo empaqueta artefactos cuantizados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en el bundle LiteRT-LM; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales con embedding int8 (2.19 GB); int8 dinamico en lineales y embedding (3.83 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm >= 0.16 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 3.4B parámetros con 40 capas, dimensión oculta de 2560, atención con grouped-query attention en ratio 40:8, embeddings atados y vocabulario de 100.000 tokens. Está ajustado como modelo instruct y soporta tool calling y contexto largo. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La conversión a LiteRT-LM aplica cuantización blockwise int4 con tamaño de bloque 32 sobre las capas lineales y OCTAV (optimización de precisión por capa) en las mismas, manteniendo el embedding en int8. El bundle incluye el tokenizer y los marcadores de rol de Granite (`<|start_of_role|>…<|end_of_role|>`), un presupuesto KV de 4096 tokens y seis firmas de prefill (1024, 256, 64, 16, 4 y 1 tokens). La reducción de once a seis firmas es deliberada: cada firma exportada consume memoria del motor independientemente de si se invoca, y una build con once firmas fue terminada por iOS durante la inicialización de Metal salvo que la app limitara el contexto a 1024 tokens. La build int4 de este repositorio crea el motor con los 4096 tokens completos en un iPhone 17 Pro.

## Capacidades

- Generación de texto instruct en formato conversacional, con marcadores de rol propios de Granite.
- Razonamiento aritmético de varios pasos: la evaluación GSM8K con chain-of-thought 0-shot alcanza 84% en int4 y 87% en int8.
- Tool calling y function calling, según las capacidades declaradas del modelo base.
- Soporte de contexto largo hasta el presupuesto KV configurado (4096 tokens en este bundle).
- Inferencia on-device con delegación completa a GPU: 1784/1784 operaciones delegadas en Galaxy S26 y Pixel 8a, sin operaciones rechazadas.
- Ejecución en navegador mediante WebGPU a través de la demo oficial de LiteRT-LM.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales offline en móvil: el artefacto int4 (2.19 GB) se ejecuta íntegramente en la GPU de un Galaxy S26 a 15.3 tok/s de decodificación y 243 tok/s de prefill, suficiente para respuestas interactivas sin conexión ni coste de API.
- Procesamiento de documentos en el dispositivo: con 4096 tokens de ventana KV se pueden resumir correos, notas o contratos cortos localmente, evitando enviar datos sensibles a un servidor.
- Clasificación y extracción de entidades en pipelines edge: el soporte de tool calling permite estructurar la salida como llamadas a funciones y encadenar extracción con validación en el propio dispositivo.
- Razonamiento aritmético ligero en aplicaciones de finanzas personales o educación: el 84% en GSM8K con int4 es suficiente para cálculos de varios pasos con verificación posterior.
- Demo y prototipado en navegador: la demo WebGPU carga el archivo int4 de 2.19 GB y permite evaluar el modelo sin instalación, útil para validar prompts antes de integrar el runtime.
- Automatización en estaciones de trabajo Apple Silicon: en un Mac M4 Max el int4 alcanza 86.3 tok/s de decodificación y 1241 tok/s de prefill por GPU Metal, adecuado para generación por lotes de textos cortos en local.
- Aplicaciones de accesibilidad y traducción asistida en tiempo real: la latencia TTFT de 900 ms en Galaxy S26 permite iniciar la respuesta antes de un segundo desde la pulsación.

## Benchmarks y rendimiento

Calidad en GSM8K (greedy, 0-shot chain-of-thought, max-tokens 512, n=100, mismo harness y extracción de respuesta en todas las filas):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 88.0% |
| LiteRT int8 | 87.0% |
| LiteRT int4 | 84.0% |

Rendimiento en Apple M4 Max con `litert-lm benchmark` (litert-lm 0.16.0, `-p 256 -d 256 --cache no`):

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int4 | GPU (Metal) | 1241 tok/s | 86.3 tok/s | 0.23 s | 5.96 s |
| int4 | CPU | 104 tok/s | 22.0 tok/s | 3.01 s | 12.5 s |
| int8 | GPU (Metal) | 1221 tok/s | 71.8 tok/s | 0.24 s | 5.19 s |
| int8 | CPU | 257 tok/s | 20.5 tok/s | 3.06 s | 43.2 s |

Rendimiento en Pixel 8a (Tensor G3, Mali-G715, 7.75 GB RAM; `litert_lm_main` v0.16.0, ejecuciones únicas):

| Archivo | Backend | Prefill | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int4 | GPU (OpenCL) | 20.0 tok/s | 7.07 tok/s | 0.99 s | 32.5 s |
| int4 | CPU | 5.40 tok/s | 6.98 tok/s | 3.29 s | no disponible |
| int8 | GPU (OpenCL) | 15.5 tok/s | 3.86 tok/s | 1.36 s | 65.2 s |

Mediciones adicionales reportadas en la model card: Galaxy S26 con int4 y GPU alcanza 15.3 tok/s de decode, 243 tok/s de prefill y 900 ms de TTFT, con pico de memoria de 1394 MiB; el int8 en el mismo dispositivo alcanza 9.5 tok/s de decode, 162 tok/s de prefill y 1.35 s de TTFT con 1476 MiB de pico. En iPhone 17 Pro el int4 obtiene 8/8 en la comprobación de sanidad sobre Metal y 7/8 sobre CPU.

## Requisitos de hardware

- VRAM/memoria: 2.19 GB para el artefacto int4 y 3.83 GB para el int8, más el overhead del motor LiteRT-LM. Pico medido de 1394 MiB (int4) y 1476 MiB (int8) en Galaxy S26.
- GPU recomendadas: Apple Silicon (Metal) para máximo rendimiento; Adreno y Mali con soporte OpenCL en Android; cualquier GPU con WebGPU para la demo en navegador.
- Cabe en GPU de consumo: sí. Mac M4 Max, iPhone 17 Pro, Galaxy S26 y Pixel 8a ejecutan el modelo con delegación completa. En Pixel 8a la decodificación por GPU (7.07 tok/s) es prácticamente idéntica a la de CPU (6.98 tok/s) porque ambas comparten el mismo ancho de banda LPDDR.
- Opciones de despliegue: LiteRT-LM >= 0.16 mediante CLI (`litert-lm run`, `litert-lm benchmark`) o el runtime embebido en apps; demo web con WebGPU. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: TTFT de 0.23 s en M4 Max GPU, 0.90 s en Galaxy S26 y 0.99 s en Pixel 8a. Init de 5.96 s en M4 Max GPU y 32.5 s en Pixel 8a GPU. El valor de Init que imprime la CLI cuenta dos veces la creación del motor (issue #4057 de LiteRT-LM).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato on-device | Licencia | Notas |
|---|---|---|---|---|---|
| granite-4.1-3b (LiteRT-LM, este repo) | 3.4B denso | 4096 KV en bundle | `.litertlm` int4/int8 | Apache 2.0 | GSM8K 84% int4 / 87% int8; delegación completa en GPU móvil |
| ibm-granite/granite-4.1-3b (original) | 3.4B denso | no disponible | safetensors (bf16) | Apache 2.0 | Referencia PyTorch: GSM8K 88.0% en MPS |
| Otras conversiones LiteRT-LM de la comunidad | no disponible | no disponible | `.litertlm` | variable | No se dispone de datos comparativos en la información proporcionada |

No se han publicado en la información disponible comparaciones directas con modelos de otros fabricantes del mismo tamaño (por ejemplo, familias de 3B de otros proveedores) en este formato ni con este harness.

## Limitaciones y advertencias

- El artefacto int4 pierde 4 puntos de GSM8K frente a la referencia bf16 (84% frente a 88%); el int8 pierde 1 punto. Para tareas aritméticas sensibles conviene validar con el int8 o con el checkpoint original.
- El contexto efectivo del bundle está limitado a 4096 tokens de presupuesto KV, muy por debajo de lo que el modelo base pueda soportar. Aumentar el número de firmas de prefill incrementa la memoria del motor y puede provocar terminaciones por parte de iOS durante la inicialización de Metal.
- En hardware Android de gama media-baja la GPU no mejora la decodificación respecto a la CPU, ya que ambas comparten el mismo bus de memoria; el beneficio se concentra en prefill y TTFT.
- El tiempo de inicialización en dispositivos móviles es alto (32.5 s en Pixel 8a con int4), lo que desaconseja crear el motor por petición; debe mantenerse vivo entre interacciones.
- En iPhone 17 Pro la comprobación de sanidad sobre CPU falló 1 de 8 preguntas (una rima en un prompt combinado), aunque se responde correctamente si se pregunta de forma aislada.
- No se dispone de información sobre sesgos, composición del dataset de entrenamiento ni evaluación multilingüe; no se puede descartar alucinación en dominios factuales sin verificación externa.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el formato `.litertlm` requiere el runtime LiteRT-LM >= 0.16, lo que limita la portabilidad a otros motores de inferencia.
- El repositorio tiene 617 descargas y 0 likes en el momento de la consulta; es una conversión comunitaria, no un artefacto oficial de IBM, y las builds previas a la primera subida pueden diferir de los archivos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-4.1-3b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web (WebGPU): https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/granite-4.1-3b
- Registro de compatibilidad edge, int4: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.1-3b-int4/CARD.md
- Registro de compatibilidad edge, int8: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.1-3b-int8/CARD.md
- Issue sobre el tiempo de inicialización: https://github.com/google-ai-edge/LiteRT-LM/issues/4057
