# sairaph-official/granite-4.1-3b-6ce8963

## Resumen

Granite 4.1-3B es un modelo de lenguaje denso de tipo instruct desarrollado por IBM, con 3.400 millones de parametros y publicado en abril de 2026. Esta ficha concreta, alojada por sairaph-official, es un espejo sin modificaciones de la conversion oficial de `litert-community/granite-4.1-3b` al formato LiteRT-LM (`.litertlm`), pensado para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. El repositorio incluye los artefactos cuantizados int4 e int8, y la ficha upstream documenta el rendimiento medido en moviles y equipos de sobremesa.

El modelo resuelve el problema de ejecutar un LLM de 3B con capacidad de contexto largo y tool calling en hardware de borde: telefonos Android, iPhone y portatiles Apple Silicon. La conversion mantiene el tokenizador y los marcadores de rol de Granite, con un presupuesto de KV de 4096 tokens y seis firmas de prefill (1024, 256, 64, 16, 4 y 1). El archivo int4 ocupa 2,19 GB y el int8 3,83 GB.

La relevancia actual reside en que demuestra que un modelo de 3B puede ejecutarse completamente delegado en GPU movil (1784 de 1784 operaciones en el delegado OpenCL en un Pixel 8a) con una calidad aceptable: 84,0 % en GSM8K para int4 frente al 88,0 % de la referencia en bf16. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (40 capas, hidden 2560, GQA 40:8, embeddings atados) |
| Parametros totales | 3.400 millones (3,4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 100k tokens en el modelo base; presupuesto KV de 4096 tokens en el bundle LiteRT-LM |
| Tipos de cuantizacion | int4 blockwise-32 + OCTAV en lineales con embedding int8; int8 dinamico en lineales y embedding |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base en `ibm-granite/granite-4.1-3b` usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 40 capas con dimension oculta de 2560, atencion con query grouping (GQA) en proporcion 40:8, embeddings atados y un vocabulario de 100.000 tokens. Esta orientado a instrucciones y soporta contexto largo y tool calling. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta ficha es la conversion a LiteRT-LM para inferencia en dispositivo. El bundle incluye el tokenizador y los marcadores de rol de Granite (`<|start_of_role|>…<|end_of_role|>`), con seis firmas de prefill en lugar de once: cada firma exportada consume memoria del motor aunque no se invoque, y una compilacion de once firmas con estos mismos pesos fue terminada por iOS durante la inicializacion de Metal salvo que la aplicacion limitara el contexto a 1024 tokens. Con seis firmas, el archivo crea su motor con los 4096 tokens completos en un iPhone 17 Pro. La cuantizacion int4 emplea blockwise-32 con OCTAV en las capas lineales y embedding int8; la int8 usa cuantizacion dinamica.

## Capacidades

- Generacion de texto e instrucciones en modo chat con marcadores de rol de Granite.
- Razonamiento matematico de varios pasos: la evaluacion GSM8K con cadena de pensamiento 0-shot alcanza el 84,0 % en int4 y el 87,0 % en int8.
- Tool calling y function calling, segun la model card del modelo base.
- Capacidad de contexto largo en el modelo base (100k tokens); en el bundle LiteRT-LM queda limitada a 4096 tokens de presupuesto KV.
- Ejecucion completamente delegada en GPU movil: 1784 de 1784 operaciones en el delegado OpenCL en un Pixel 8a.
- Inferencia en CPU y GPU dentro del runtime LiteRT-LM, con backend seleccionable.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistente conversacional en aplicaciones moviles: el bundle int4 de 2,19 GB cabe en el almacenamiento de un telefono y se ejecuta con WebGPU o Metal, permitiendo chat multi-turno sin conexion gracias al presupuesto KV de 4096 tokens.
- Corrector y generador de texto en el dispositivo: con 15,3 tok/s de decodificacion en un Galaxy S26 y 86,3 tok/s en un M4 Max, es viable para autocompletado y reescritura en editores locales.
- Resolucion de problemas matematicos escolares: el 84,0 % en GSM8K con cadena de pensamiento lo hace adecuado para tutoria embebida que resuelve problemas aritmeticos paso a paso sin enviar datos a la nube.
- Agentes locales con tool calling: la capacidad de function calling del modelo base permite construir asistentes que invocan APIs del dispositivo (calendario, contactos) manteniendo los datos en el terminal.
- Prototipado y demostraciones web: el demo oficial de LiteRT-LM carga el archivo int4 en el navegador con WebGPU, util para evaluar el modelo sin instalacion.
- Procesamiento de documentos de hasta 4096 tokens en el borde: resumen y extraccion de informacion de correos o notas en un portatil Apple Silicon con 1241 tok/s de prefill en GPU.
- Aplicaciones de privacidad estricta: al ejecutarse integramente en el dispositivo, cumple requisitos de no exfiltracion de datos personales en sectores regulados.

## Benchmarks y rendimiento

Calidad en GSM8K (greedy, 0-shot cadena de pensamiento, max-tokens 512, n=100, mismo harness):

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia, MPS) | 88,0 % |
| LiteRT int8 | 87,0 % |
| LiteRT int4 | 84,0 % |

Rendimiento con `litert-lm benchmark` (litert-lm 0.16.0, Apple M4 Max, `-p 256 -d 256 --cache no`):

| Archivo | Backend | Prefill (256) | Decodificacion | TTFT | Init |
|---|---|---|---|---|---|
| int4 | GPU (Metal) | 1241 tok/s | 86,3 tok/s | 0,23 s | 5,96 s |
| int4 | CPU | 104 tok/s | 22,0 tok/s | 3,01 s | 12,5 s |
| int8 | GPU (Metal) | 1221 tok/s | 71,8 tok/s | 0,24 s | 5,19 s |
| int8 | CPU | 257 tok/s | 20,5 tok/s | 3,06 s | no disponible |

Rendimiento medido en dispositivo (edge-compat):

| Dispositivo | Version | Backend | Decodificacion | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 (int4) | 0.16.0 | GPU | 15,3 tok/s | 243 tok/s | 900 ms |
| Pixel 8a (int4) | 0.16.0 | GPU | 7,1 tok/s | 20 tok/s | 990 ms |
| Mac M4 Max (int4) | 0.16.0 | GPU | 38,1 tok/s | 715 tok/s | 405 ms |
| Galaxy S26 (int8) | 0.16.0 | GPU | 9,5 tok/s | 162 tok/s | 1,35 s |
| Pixel 8a (int8) | 0.16.0 | GPU | 3,9 tok/s | 15 tok/s | 1,36 s |
| Mac M4 Max (int8) | 0.16.0 | GPU | 32,7 tok/s | 743 tok/s | 399 ms |

Correccion: el archivo int4 obtiene 8/8 en una prueba de cordura de 8 preguntas en CPU y GPU de Mac, 8/8 en Metal de un iPhone 17 Pro (7/8 en su CPU) y ejecucion totalmente delegada en un Pixel 8a (1784/1784 operaciones en prefill de 1024 tokens, 1614/1614 en decodificacion).

## Requisitos de hardware

- VRAM/memoria: el archivo int4 ocupa 2,19 GB y el int8 3,83 GB en disco; el pico medido en Galaxy S26 fue de 1394 MiB para int4 y 1476 MiB para int8.
- GPU moviles: funciona en Galaxy S26 (GPU, 15,3 tok/s int4) y Pixel 8a (GPU, 7,1 tok/s int4); en iPhone 17 Pro crea el motor con 4096 tokens en Metal.
- Apple Silicon: M4 Max alcanza 86,3 tok/s de decodificacion y 1241 tok/s de prefill con int4 en Metal.
- CPU: viable pero notablemente mas lenta (22,0 tok/s en M4 Max con int4; 20,5 tok/s con int8).
- Opciones de despliegue: runtime LiteRT-LM version 0.16.0 o superior mediante el comando `litert-lm run`; demo web con WebGPU.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con este formato `.litertlm`.
- Latencia: TTFT de 0,23 s en M4 Max con GPU, 900 ms en Galaxy S26 y 990 ms en Pixel 8a para int4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| Granite 4.1-3B (esta ficha, int4) | 3,4B | 4096 (bundle) / 100k (base) | 84,0 % | Apache 2.0 | `.litertlm` |
| Granite 4.1-3B (int8) | 3,4B | 4096 (bundle) / 100k (base) | 87,0 % | Apache 2.0 | `.litertlm` |
| Granite 4.1-3B (bf16, referencia) | 3,4B | 100k | 88,0 % | Apache 2.0 | safetensors |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de la misma categoria (3B orientados a dispositivo) para establecer una comparativa cruzada.

## Limitaciones y advertencias

- La cuantizacion int4 degrada la calidad: 4 puntos porcentuales en GSM8K respecto a bf16 (84,0 % frente a 88,0 %).
- El bundle LiteRT-LM limita el contexto a 4096 tokens, muy por debajo de los 100k del modelo base; el limite viene del presupuesto KV y de la gestion de memoria del motor en iOS.
- En un iPhone 17 Pro, la CPU acerto 7 de 8 preguntas de la prueba de cordura; el fallo se produjo en una linea de rima dentro de un prompt combinado.
- El rendimiento en Pixel 8a es bajo (7,1 tok/s int4, 3,9 tok/s int8), lo que limita su uso interactivo en ese hardware.
- No se documentan sesgos conocidos, tasas de alucinacion ni idiomas soportados en la informacion disponible.
- El repositorio es un espejo de Sairaph: los archivos de licencia y aviso los anadio Sairaph, no el autor upstream; los archivos no listados en la model card no estan replicados.
- Requiere LiteRT-LM 0.16.0 o superior; versiones anteriores no son compatibles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base IBM por si anaden condiciones adicionales no reflejadas en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sairaph-official/granite-4.1-3b-6ce8963
- Repositorio upstream de la conversion: https://huggingface.co/litert-community/granite-4.1-3b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/granite-4.1-3b
- Registro de rendimiento int4: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.1-3b-int4/CARD.md
- Registro de rendimiento int8: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.1-3b-int8/CARD.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
