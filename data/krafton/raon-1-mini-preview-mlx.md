# KRAFTON/Raon-1-mini-preview-mlx

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de 28.800 millones de parametros totales y 4.300 millones activos por token, desarrollado desde cero por KRAFTON AI. Este repositorio concreto contiene los pesos en formato MLX, cuantizados a NVFP4, para su ejecucion en Apple Silicon. El modelo base (KRAFTON/Raon-1-mini-preview) se distribuye bajo licencia Apache 2.0 y esta disenado especialmente para conversacion en coreano y tareas agenticas.

La arquitectura combina 25 capas, de las cuales 18 son de atencion lineal Raon Delta Attention (RDA) y 7 son capas de atencion completa con Gated MLA. Esta disposicion hibrida reduce el coste de la cache KV: solo las 7 capas MLA mantienen cache, con unos 8 KiB por token en BF16. El modelo soporta de forma nativa una longitud de contexto de 262.144 tokens y emplea un esquema de enrutamiento que activa 6 de 128 expertos enrutados mas 1 experto compartido por token.

Se trata de una version preview, no de un modelo final, por lo que las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo. El repositorio MLX incluye acceso restringido (gated) y esta etiquetado como cuantizacion del modelo base. Su interes actual reside en ofrecer una alternativa abierta con razonamiento integrado (thinking), soporte de tool calling y decodificacion especulativa mediante un modelo draft DFlash2, todo ello ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 18 capas Raon Delta Attention (RDA) + 7 capas Gated MLA |
| Parametros totales | 28.783.227.618 (28,8B) |
| Parametros activos | 4,3B por token (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (este repositorio MLX); el modelo base ofrece MXFP8 y NVFP4 |
| Idiomas soportados | Coreano e ingles (segun la model card); lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |

Otros datos de la arquitectura: 25 capas, hidden size 2.560, 40 cabezas de atencion (dimension 128 para RDA; 192 QK / 128 V para Gated MLA), rango LoRA de query/KV de 576/512 en Gated MLA, tamano intermedio de experto 1.088, FFN densa de la primera capa 12.032, activacion SiTU-GLU, conexiones residuales Raon-mHC con 4 streams, vocabulario de 259.840 tokens, LM head no atada y codificacion posicional NoPE. El tamano del repositorio es de 18,7 GB.

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer hibrida con atencion mixta. La innovacion principal es Raon Delta Attention (RDA), que desacopla las compuertas de borrado y escritura de Kimi Delta Attention (KDA) para mejorar el rendimiento en contexto largo. Ademas, Raon-mHC reduce el coste computacional de las hyper-connections con restriccion de variedad (mHC) de DeepSeek, acelerando el entrenamiento. La disposicion hibrida (RDA 3:1 frente a Gated MLA) mantiene un estado de tamano fijo en 18 de las 25 capas, de modo que solo las 7 capas MLA conservan cache KV (aproximadamente 8 KiB por token en BF16). El modelo usa NoPE, es decir, sin codificacion posicional explicita.

El modelo fue entrenado desde cero por KRAFTON AI. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Se indica soporte de decodificacion especulativa mediante un modelo draft DFlash2, y se ofrecen variantes cuantizadas MXFP8 y NVFP4, esta ultima disenada para permitir inferencia en una unica GPU NVIDIA RTX 5090 de 32 GB de VRAM.

## Capacidades

- Generacion de texto y conversacion multi-turno, con especial enfasis en coreano e ingles.
- Razonamiento integrado con modo thinking (razonamiento previo a la respuesta).
- Razonamiento matematico y cientifico, con resultados destacados segun la model card.
- Seguimiento de instrucciones y tareas de busqueda (search).
- Tool calling / function calling para flujos agenticos.
- Ejecucion de agentes con soporte declarado para Hermes Agent, Pi y OpenCode.
- Decodificacion especulativa acelerada mediante el modelo draft DFlash2.
- Capacidades multilingues: coreano e ingles confirmados; el resto no disponible.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en coreano: el modelo esta entrenado especificamente para conversacion en coreano, por lo que resulta adecuado para atencion al cliente y chatbots en ese idioma con contexto de hasta 262.144 tokens.
- Agentes autonomos con tool calling: su soporte declarado para Hermes Agent, Pi y OpenCode permite integrarlo en pipelines agenticos que encadenan llamadas a herramientas y razonamiento multi-paso.
- Razonamiento matematico y cientifico asistido: el modo thinking integrado lo hace util para resolucion de problemas paso a paso y verificacion de calculos en entornos educativos o de investigacion.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y solo 7 capas con cache KV, es viable analizar contratos, informes o bases de codigo extensas en una sola pasada.
- Generacion de codigo en flujos de desarrollo: el tool calling y el soporte de OpenCode permiten integrarlo en asistentes de programacion y tareas de automatizacion dentro de editores.
- Inferencia local en Apple Silicon: esta variante MLX en NVFP4 esta pensada para ejecutarse en equipos Mac con memoria unificada, lo que facilita prototipado y despliegue en estaciones de trabajo sin GPU dedicada.
- Busqueda aumentada (RAG) con recuperacion: sus resultados en benchmarks de search y su ventana de contexto lo hacen apto para sistemas de pregunta-respuesta sobre corpus documentales.

## Benchmarks y rendimiento

La model card menciona resultados lideres en benchmarks de matematicas, ciencia, seguimiento de instrucciones y busqueda frente a modelos MoE de referencia, pero los valores numericos concretos no estan disponibles en la informacion proporcionada (la tabla de resultados aparece truncada). No se han publicado cifras verificables de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio MLX ocupa 18,7 GB en disco, lo que da una referencia del peso en NVFP4. La model card indica que la variante NVFP4 del modelo base permite inferencia en una unica NVIDIA RTX 5090 de 32 GB de VRAM.
- GPU recomendadas: RTX 5090 (32 GB) para NVFP4; para las variantes MXFP8 o BF16 se requeriria mas memoria, aunque no se especifican cifras exactas.
- GPU de consumo: si, cabe en una RTX 5090 segun la model card. Para Apple Silicon, esta variante MLX esta disenada para Macs con memoria unificada suficiente (el tamano del repo es de 18,7 GB).
- Opciones de despliegue: MLX (este repositorio), y en el ecosistema general vLLM, llama.cpp, Ollama o TGI segun el formato del modelo base; la informacion proporcionada solo confirma MLX para esta variante.
- Latencia y throughput: no disponibles. Se menciona soporte de decodificacion especulativa con DFlash2, que reduce la latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 mini preview (este) | 28,8B / 4,3B | 262.144 | Apache 2.0 | MoE hibrida RDA + MLA, thinking, tool calling, coreano/ingles |
| Modelos MoE de referencia de la comparativa del autor | no disponible | no disponible | no disponible | La model card compara con modelos MoE abiertos, pero los nombres y cifras no estan disponibles en la informacion proporcionada |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa numerica con alternativas concretas (parametros, contexto y rendimiento de los modelos de referencia).

## Limitaciones y advertencias

- Es una version preview, no un modelo final: las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso al repositorio esta restringido (gated): es necesario solicitar acceso y aceptar los terminos.
- Idiomas: la model card solo confirma coreano e ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: no se documentan tasas ni evaluaciones especificas de fidelidad.
- Sesgos conocidos: no se detallan en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el caracter preview y la ausencia de garantias implican que debe validarse antes de llevarlo a produccion.
- La variante MLX esta cuantizada a NVFP4, lo que puede introducir perdida de precision frente a los pesos completos.
- Este repositorio es una cuantizacion del modelo base; para el modelo original y sus variantes MXFP8/NVFP4 debe consultarse KRAFTON/Raon-1-mini-preview.

## Enlaces

- Repositorio Hugging Face (esta variante MLX): https://huggingface.co/KRAFTON/Raon-1-mini-preview-mlx
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Version actualizada (new_version): https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Pagina de KRAFTON AI: https://krafton.ai/en/
- Organizacion en Hugging Face: https://huggingface.co/KRAFTON
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa de KRAFTON: https://www.krafton.com/en/
