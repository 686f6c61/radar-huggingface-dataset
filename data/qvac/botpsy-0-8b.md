# qvac/BotPsy-0.8B

## Resumen

BotPsy-0.8B es un modelo de lenguaje causal de 0,8 mil millones de parametros (852.985.920 exactos segun los pesos en safetensors) desarrollado por Tether AI Research y publicado bajo el identificador `qvac/BotPsy-0.8B`. Se trata de un ajuste fino (finetune) del modelo base Qwen3.5-0.8B, especializado en tool calling, function calling y flujos de trabajo agenticos para despliegue en dispositivo (on-device) y entornos edge. Su proposito es actuar como asistente personal capaz de invocar herramientas en dominios como busqueda web, viajes, comercio, finanzas, control de dispositivos, gestion de documentos, calendario y correo electronico.

El modelo emplea la arquitectura de Qwen3.5, descrita por el autor como hibrida de Gated DeltaNet y atencion con compuertas (gated attention), y se utiliza en modo solo texto. Incorpora un modo de razonamiento (thinking mode) activable mediante `enable_thinking=True`, de forma que el modelo razona antes de responder. El autor declara un rendimiento estado del arte en uso de herramientas para su categoria de tamano, superando a todos los modelos de hasta 1,2B parametros que probaron.

Su relevancia actual radica en que demuestra que un modelo por debajo de los 1.000 millones de parametros puede duplicar la capacidad agentica de su base (BFCL v4 de 23,4 a 44,0; ACEBench de 30,1 a 58,7; τ-bench de 23,2 a 51,5) y superar a modelos 2,5 veces mayores como Qwen3.5-2B-Think en cinco de seis benchmarks de tool use. Esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta disponible tanto en BF16 (safetensors) como en GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido Gated DeltaNet + atencion con compuertas (arquitectura Qwen3.5), uso solo texto |
| Parametros totales | 852.985.920 (0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (repo principal); GGUF en BF16, Q8_0 y Q4_K_M en el repo `qvac/BotPsy-0.8B-GGUFs` |
| Idiomas soportados | Ingles (recomendado); campo `language: en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF (BF16, Q8_0, Q4_K_M) en repo separado |

## Arquitectura y entrenamiento

BotPsy-0.8B es un ajuste fino del modelo Qwen3.5-0.8B, que emplea una arquitectura hibrida de Gated DeltaNet combinada con atencion con compuertas. El modelo se utiliza en modo solo texto pese a que la arquitectura base soporta entrada imagen-texto (tag `image-text-to-text` en el repo). Incluye un modo de razonamiento explicito (thinking mode) que se activa con `enable_thinking=True`, de modo que el modelo genera un razonamiento interno antes de emitir la respuesta final.

El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card remite al blog post (`huggingface.co/blog/qvac/botpsy`) para consultar el metodo de entrenamiento completo y todos los benchmarks. El objetivo declarado del ajuste es especializar el modelo en uso de herramientas y flujos agenticos preservando las capacidades generales del base: la mejora en instrucciones (IFEval de 59,7 a 90,8; IFBench de 22,0 a 55,9) y en conocimiento general (GPQA Diamond de 33,2 a 38,1; MMLU-Pro de 41,6 a 48,9) sugiere un entrenamiento que no degrada las habilidades previas.

## Capacidades

- Generacion de texto conversacional en ingles con modo de razonamiento previo (thinking mode).
- Tool calling y function calling: invocacion de herramientas externas en dominios de busqueda web, viajes, comercio, finanzas, control de dispositivos, documentos, calendario y mensajeria.
- Flujos agenticos multi-turno: mantiene conversaciones largas siguiendo una politica estricta y actuando en nombre del usuario (τ²-bench telecom 82,5).
- Razonamiento multi-paso: puntuaciones destacadas en tareas multi-turno de BFCL v4 (46,1 frente a 7,5 del base).
- Deteccion de cuando no invocar herramientas: en las pruebas de alucinacion de BFCL v4 obtiene 86,1, la mas alta de todos los modelos evaluados.
- Seguimiento de instrucciones: IFEval 90,8 e IFBench 55,9, el mejor IFBench de los modelos comparados.
- Conocimiento general: MMLU-Pro 48,9 y GPQA Diamond 38,1.
- Despliegue en dispositivo y edge por su reducido tamano (0,8B) y disponibilidad de GGUF Q4_K_M.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente personal en dispositivo: el modelo puede gestionar conversaciones multi-turno e invocar herramientas de calendario, correo y mensajeria directamente en el terminal del usuario, sin depender de la nube, gracias a sus 0,8B parametros y a la disponibilidad de GGUF Q4_K_M para llama.cpp.
- Atencion al cliente automatizada: con 82,5 en τ²-bench telecom, es adecuado para agentes que mantienen una conversacion larga con el cliente, siguen una politica estricta y ejecutan acciones en su nombre (consultas de pedidos, cambios de plan, reembolsos).
- Agente de busqueda e investigacion web: su puntuacion en BrowseComp-Plus (4,5, la mas alta del grupo) y su capacidad de tool calling permiten construir agentes que encadenan busquedas y sintetizan resultados.
- Automatizacion de operaciones de comercio y servicios: lidera los modelos evaluados en tareas multi-paso de comercio y servicios (58,3 frente a 47,4 del siguiente), por lo que encaja en flujos de gestion de pedidos, reservas y transacciones.
- Control de dispositivos y sistemas: con 46,1 en tareas multi-paso de gestion de dispositivos y sistemas (frente a 31,9 del siguiente), sirve para agentes que ejecutan comandos, ajustan configuraciones o gestionan ficheros locales.
- Gestion de documentos y ficheros: el modelo esta disenado para operar sobre ficheros y documentos dentro de su conjunto de dominios de asistente personal, invocando herramientas de lectura, escritura y organizacion.
- Integracion en pipelines de CI/CD y backends con vLLM: el autor sirvio el modelo en BF16 con vLLM para la evaluacion, lo que valida su despliegue en servidores con tool calling estructurado.

## Benchmarks y rendimiento

Todos los modelos se evaluaron en modo thinking con un arnes de evaluacion compartido. BotPsy se sirvio desde los pesos BF16 con vLLM. Mejor puntuacion por fila en **negrita**, segunda mejor <u>subrayada</u>. Los multiplicadores indican el numero de parametros relativo a BotPsy-0.8B.

| Benchmark | **BotPsy-0.8B** | Qwen3.5-0.8B-Think (base, 1×) | Qwen3.5-2B-Think (2,5×) | LFM2.5-1.2B-Think (1,5×) | MiniCPM5-1B-Think (1,25×) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| BFCL v4 | **44,0** | 23,4 | <u>37,7</u> | 28,1 | 22,8 |
| ACEBench | **58,7** | 30,1 | <u>55,4</u> | 39,4 | 24,5 |
| τ-bench | **51,5** | 23,2 | <u>46,5</u> | 6,5 | 28,8 |
| Claw-Eval | <u>46,5</u> | 39,3 | **48,9** | 31,6 | 31,0 |
| BrowseComp-Plus | **4,5** | 1,9 | <u>2,8</u> | 0,2 | 0,8 |
| ToolSandbox | **64,6** | 30,5 | 41,2 | <u>45,7</u> | 28,1 |
| τ²-bench (telecom) | **82,5** | no disponible | <u>69,3</u> | no disponible | no disponible |
| BFCL v4 multi-turno | **46,1** | 7,5 | <u>23,8</u> | no disponible | no disponible |
| BFCL v4 alucinacion | **86,1** | no disponible | no disponible | no disponible | no disponible |
| ACEBench casos especiales | **51,3** | 13,7 | no disponible | no disponible | no disponible |
| IFEval | **90,8** | 59,7 | no disponible | no disponible | no disponible |
| IFBench | **55,9** | 22,0 | no disponible | no disponible | no disponible |
| GPQA Diamond | **38,1** | 33,2 | no disponible | no disponible | no disponible |
| MMLU-Pro | **48,9** | 41,6 | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16 (tamano del repo de pesos), en torno a 0,9 GB en Q8_0 y en torno a 0,5-0,6 GB en Q4_K_M (estimacion a partir del recuento de parametros; el autor no publica cifras exactas).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 2 GB de VRAM libre para BF16; para Q4_K_M basta con GPUs de gama baja o incluso CPU. El autor valido el modelo en BF16 con vLLM, por lo que es desplegable en A100, H100 o GPUs de servidor equivalentes sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual (RTX 3060, 4060, 4090, etc.) e incluso en hardware integrado o movil con la cuantizacion Q4_K_M.
- Opciones de despliegue: vLLM (usado por el autor para la evaluacion), llama.cpp y QVAC SDK mediante los GGUF del repo `qvac/BotPsy-0.8B-GGUFs`; la libreria declarada es transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL v4 | τ-bench | ToolSandbox | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| BotPsy-0.8B | 0,8B | no disponible | 44,0 | 51,5 | 64,6 | Apache 2.0 | safetensors + GGUF |
| Qwen3.5-0.8B-Think (base) | 0,8B | no disponible | 23,4 | 23,2 | 30,5 | no disponible | Hugging Face |
| Qwen3.5-2B-Think | 2B | no disponible | 37,7 | 46,5 | 41,2 | no disponible | Hugging Face |
| LFM2.5-1.2B-Think | 1,2B | no disponible | 28,1 | 6,5 | 45,7 | no disponible | Hugging Face |
| MiniCPM5-1B-Think | 1B | no disponible | 22,8 | 28,8 | 28,1 | no disponible | Hugging Face |

BotPsy-0.8B lidera en cinco de los seis benchmarks de la comparativa (BFCL v4, ACEBench, τ-bench, BrowseComp-Plus y ToolSandbox) pese a ser el modelo mas pequeno del grupo, y solo cede ante Qwen3.5-2B-Think en Claw-Eval (46,5 frente a 48,9).

## Limitaciones y advertencias

- Modelo pequeno (0,8B): el propio autor advierte que comete errores y que es adecuado para tareas de dificultad baja a media, no para razonamiento complejo.
- Idioma: solo se declara y recomienda el ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Longitud de contexto: no publicada en la informacion disponible; conviene verificarla antes de disenar flujos con conversaciones largas.
- Riesgo de alucinacion: aunque el modelo destaca en las pruebas de alucinacion de BFCL v4 (86,1), sigue siendo un modelo pequeno y puede invocar herramientas de forma incorrecta o inventar parametros en casos no cubiertos.
- Uso multimodal: pese a que la arquitectura base soporta entrada imagen-texto, BotPsy se utiliza en modo solo texto; no debe asumirse capacidad de vision.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las condiciones del modelo base Qwen3.5-0.8B.
- Datos de entrenamiento no publicados en la informacion disponible (tokens, composicion del dataset, alineamiento); el autor remite al blog post para el detalle.
- Adopcion muy temprana: 2 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qvac/BotPsy-0.8B
- Pesos GGUF (BF16, Q8_0, Q4_K_M): https://huggingface.co/qvac/BotPsy-0.8B-GGUFs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post con benchmarks y metodo de entrenamiento: https://huggingface.co/blog/qvac/botpsy
- Coleccion BotPsy: https://huggingface.co/collections/qvac/botpsy
- Licencia: https://huggingface.co/qvac/BotPsy-0.8B/blob/main/LICENSE
- Tether AI Research: https://tether.io/
