# mradermacher/MiniCPM5-2B-Supertool-Uncensored-i1-GGUF

## Resumen

MiniCPM5-2B-Supertool-Uncensored-i1-GGUF es una cuantizacion GGUF con calibracion imatrix del modelo saidutta69/MiniCPM5-2B-Supertool-Uncensored, publicada por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 2.516 millones de parametros (2,5B) afinado mediante QLoRA sobre una base MiniCPM5 para especializarse en tool calling, function calling y flujos de agentes, incluyendo generacion de codigo y uso de terminal. La variante "Uncensored" indica que el autor original aplico tecnicas de abliteration y supresion de rechazos (weight-edit) sobre los pesos, de modo que el modelo no declina peticiones por politicas de seguridad internas.

El modelo llega en formato GGUF, lo que permite ejecutarlo en CPU/GPU consumer mediante llama.cpp, Ollama o interfaces compatibles, sin necesidad de infraestructura de datacenter. Su tamano reducido lo situa en el segmento de modelos pequenos orientados a edge y a inferencia local offline, con soporte declarado de ingles y chino. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

Esta ficha cubre especificamente la publicacion de cuantizaciones i1 de mradermacher, que incluye un amplio abanico de niveles desde IQ1_S (0,8 GB) hasta Q6_K, ademas del fichero imatrix para generar cuantizaciones propias. Es relevante ahora porque combina tres tendencias: modelos pequenos especializados en agentes, despliegue local en GPU consumer y ediciones de pesos para eliminar rechazos, un perfil muy demandado en pipelines de codigo y automatizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base MiniCPM5; detalles de capas y atencion no disponibles) |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (etiquetado como long-context, sin cifra concreta) |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; tambien disponibles cuantizaciones estaticas en el repo hermano |
| Idiomas soportados | en, zh (segun model card); tags de Hugging Face solo listan en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); repo de 30,2 GB en total |
| Modelo base | saidutta69/MiniCPM5-2B-Supertool-Uncensored |
| Metodo de ajuste | QLoRA + abliteration / supresion de rechazos (weight-edit) |
| Formato de prompt | ChatML |
| Datasets de ajuste | saidutta69/fable-5.1-premium-v2; MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer derivado de MiniCPM5 y de que el modelo resultante tiene 2.516.756.480 parametros. El autor original partio de una base MiniCPM5 y la ajusto con QLoRA sobre dos datasets: saidutta69/fable-5.1-premium-v2 y MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x, orientados presumiblemente a tool calling, razonamiento y generacion de codigo. No se especifican el numero de tokens de entrenamiento, la composicion exacta de los datos ni si hubo fases de RLHF o DPO.

La innovacion principal de esta variante es la edicion de pesos: se aplicaron tecnicas de abliteration y supresion de rechazos (refusal-suppression) para eliminar el comportamiento de declinar peticiones. El resultado se publica como modelo "uncensored/decensored". Sobre esa base, mradermacher genero cuantizaciones i1 calibradas con un fichero imatrix propio, lo que mejora la calidad respecto a cuantizaciones estaticas del mismo tamano. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con formato de prompt ChatML.
- Tool calling y function calling: el modelo esta afinado especificamente para emitir llamadas a herramientas y JSON estructurado.
- Flujos de agentes y razonamiento multi-paso, con etiquetas orientadas a agentes de codigo y terminal (code-agent, terminal-agent, bash).
- Generacion de codigo y uso de shell/bash en entornos de agente.
- Integracion con Claude Code segun los tags del autor (claude-code).
- Comportamiento sin rechazos: no declina peticiones por politicas internas de seguridad (abliterated / no-refusal).
- Despliegue local y offline: pensado para GPU consumer y edge (on-device, edge-ai, offline-inference).
- Compatibilidad con endpoints (tag endpoints_compatible) para servir el modelo via API.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agente de codigo en local: el modelo puede emitir llamadas a herramientas y comandos bash dentro de un bucle de agente (por ejemplo, un asistente tipo Claude Code ejecutado en una estacion de trabajo con una RTX 4090), aprovechando su ajuste especifico en tool calling y su bajo consumo de VRAM.
- Automatizacion de terminal y scripting: integrado en un CLI que traduce instrucciones en lenguaje natural a comandos de shell y los ejecuta de forma controlada, gracias a su entrenamiento en bash y terminal-agent.
- Function calling en pipelines internos: servir el modelo con llama.cpp u Ollama y exponer una API compatible con OpenAI para que aplicaciones internas resuelvan llamadas a funciones y extraccion de JSON estructurado.
- Prototipado de agentes multi-paso: usar el modelo como cerebro de un agente ReAct en entornos de pruebas, donde su ventana etiquetada como long-context permite mantener el historial de acciones y observaciones.
- Asistente de codigo offline en entornos aislados: desplegado en maquinas sin conexion (air-gapped) para autocompletado y generacion de fragmentos de codigo, sin enviar datos a servicios externos.
- Generacion de contenido sin filtros para investigacion: al ser un modelo abliterated, sirve para estudiar comportamiento de modelos sin rechazos, red teaming controlado y evaluacion de riesgos en entornos de investigacion.
- Despliegue en dispositivos de borde: con cuantizaciones IQ2 o IQ3 (0,9-1,3 GB) puede ejecutarse en portatiles y mini-PC sin GPU dedicada, cubriendo tareas de agente ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye el tag "fc-eval" (evaluacion de function calling) sin cifras asociadas, y no se aportan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada por tamano de fichero GGUF, con overhead adicional de contexto y KV cache):
  - i1-IQ1_S / IQ1_M: ~0,8 GB.
  - i1-IQ2_XXS a IQ2_M: ~0,9-1,1 GB.
  - i1-Q2_K / IQ3_XXS a IQ3_M: ~1,1-1,3 GB.
  - i1-IQ4_XS / Q4_K_S / Q4_K_M: ~1,5-1,7 GB.
  - i1-Q5_K_S / Q5_K_M y Q6_K: superior a 1,7 GB (tamano exacto no listado en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4; para contexto largo conviene 8 GB o mas. GPU de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida en cuantizaciones bajas).
- Opciones de despliegue: llama.cpp, Ollama, interfaces compatibles con GGUF; el tag endpoints_compatible sugiere servir via API compatible con OpenAI; vLLM y TGI no soportan GGUF de forma nativa en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-Supertool-Uncensored (i1-GGUF, este) | 2,5B | no disponible | Tool calling, agentes, sin rechazos | Apache 2.0 | GGUF en Hugging Face |
| MiniCPM5-2B-Supertool-Uncensored (original) | 2,5B | no disponible | Tool calling, agentes, sin rechazos | Apache 2.0 | Pesos completos en Hugging Face |
| MiniCPM5-2B-Supertool-Uncensored-GGUF (cuantizaciones estaticas) | 2,5B | no disponible | Mismo modelo, cuantizacion sin imatrix | Apache 2.0 | GGUF en Hugging Face |
| Otros modelos pequenos de tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la diferencia principal entre ellas es el metodo de cuantizacion (i1 con imatrix frente a estatica).

## Limitaciones y advertencias

- Modelo abliterated y "uncensored": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o inseguro. No es adecuado para aplicaciones orientadas al publico sin capas de moderacion externas.
- Riesgo de alucinacion: con solo 2,5B de parametros, la fiabilidad factica es limitada; conviene validar salidas, especialmente en tool calling y generacion de codigo.
- Idiomas: la model card declara en y zh; los tags de Hugging Face solo listan en. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: etiquetado como long-context pero sin cifra publicada; no se debe asumir una ventana concreta sin verificacion empirica.
- Calidad de cuantizaciones extremas: los niveles IQ1 e IQ2 (0,8-1,1 GB) degradan notablemente la calidad; el propio autor los etiqueta como "for the desperate" o "very low quality".
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin filtros.
- Procedencia de los datos de ajuste: los datasets empleados no estan documentados en detalle en la informacion disponible, lo que dificulta auditar sesgos.
- Fecha de publicacion futura en los metadatos (noviembre de 2026): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-i1-GGUF
- Modelo base original: https://huggingface.co/saidutta69/MiniCPM5-2B-Supertool-Uncensored
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/MiniCPM5-2B-Supertool-Uncensored-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#MiniCPM5-2B-Supertool-Uncensored-i1-GGUF
- Dataset de ajuste 1: https://huggingface.co/datasets/saidutta69/fable-5.1-premium-v2
- Dataset de ajuste 2: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
