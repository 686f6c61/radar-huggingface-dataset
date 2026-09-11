# FoolDev/Thanatos-27B-HERETIC

## Resumen

Thanatos-27B-HERETIC es un modelo de lenguaje denso de aproximadamente 27.000 millones de parametros (26.895.998.464 exactos segun los pesos en safetensors) publicado por el usuario FoolDev en Hugging Face. No se trata de un entrenamiento nuevo, sino de un reempaquetado y cuantizacion del modelo heretic-org/Qwen3.8-27B-heretic-ara, una version "abliterated" (con el comportamiento de rechazo atenuado en las capas base) del Qwen 3.8 27B denso mediante el metodo Heretic ARA. El repositorio convierte los pesos a GGUF y elimina las cabezas MTP (Multi-Token Prediction) para que llama.cpp y Ollama estandar puedan cargarlo sin modificaciones.

El modelo conserva la ventana nativa de 262.144 tokens de la familia Qwen 3.8, extensible hasta 1.010.000 tokens con YaRN, y una pila hibrida de 64 capas que combina Gated-DeltaNet con Gated-Attention. La model card declara capacidades multimodales (entrada de imagen) y soporte de agentes con plantilla de tool calling incluida, ademas de 22 idiomas. Su relevancia actual radica en ofrecer un modelo denso de 27B sin censura, con contexto largo y un peso Q4_K_M de unos 17 GB que cabe en equipos de consumo con 24-32 GB de memoria.

Es importante subrayar la procedencia: el propio autor advierte que en este repositorio no se realiza ningun entrenamiento. Los campos `Teacher: Claude Fable 5` y la lista de datasets del frontmatter describen el linaje reivindicado por el modelo base upstream, no un registro de entrenamiento verificable de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas, pila hibrida Gated-DeltaNet / Gated-Attention (familia Qwen 3.8) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativa; extensible a 1.010.000 con YaRN; por defecto en el GGUF empaquetado: 65.536 |
| Tipos de cuantizacion | Q2_K (~10,9 GB), Q3_K_M (~13 GB), Q4_K_M (~17 GB), Q5_K_M (~20 GB), IQ4_XS; cuantizaciones publicadas en el repo GGUF del base desde Q2_K en adelante |
| Idiomas soportados | en, zh, ru, es, fr, it, ja, ko, de, ar, tr, pl, sv, nl, he, id, uk, fa, pt, ms, fi, el |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp / Ollama) |
| Modelo base | heretic-org/Qwen3.8-27B-heretic-ara (relacion: quantized) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 200,9 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 3.8 27B en su variante densa: 64 capas con una pila hibrida que intercala bloques Gated-DeltaNet (mecanismo de estado recurrente con puertas, orientado a eficiencia en secuencias largas) y bloques de atencion con puertas (Gated-Attention). Esta combinacion permite sostener ventanas de contexto muy amplias (262.144 tokens nativos) sin el coste cuadraticamente creciente de un transformer de atencion pura en todas las capas. Sobre esa base, heretic-org aplico una ablacion por el metodo ARA que reduce la propension al rechazo en las capas base, dando lugar al modelo heretic-ara.

En cuanto al entrenamiento, este repositorio no entrena nada: reempaqueta y cuantiza. El autor declara explicitamente que el modelo "ship" es el base heretic-ara convertido a GGUF y con las cabezas MTP eliminadas para compatibilidad con llama.cpp y Ollama estandar. El frontmatter atribuye al linaje upstream un destilado con "Claude Fable 5" como teacher y un conjunto de datasets (Crownelius/Creative_Writing_ShareGPT_Enhanced, microsoft/rStar-Coder, peteromallet/dataclaw-peteromallet, Crownelius/Opus-4.7-Reasoning, openbmb/UltraData-Math, Crownelius/Crow-Heretic-TeichAI-Unified), pero ninguna evaluacion del repositorio mide ese linaje ni lo reproduce. La innovacion practica que aporta el repo es la propia cadena de conversion y sellado (etiquetado `qwen35` de los blobs, verificacion `make verify-arch`, y un objetivo `make heal-hf` para reetiquetar blobs antiguos mal sellados procedentes de ventanas de la version previa).

## Capacidades

- Generacion de texto conversacional multi-turno en 22 idiomas, con especial atencion al ingles, chino, ruso, espanol, frances, italiano, japones, coreano, aleman y arabe.
- Razonamiento explicito: el modelo esta etiquetado como `reasoning` y `distillation`, con datos de razonamiento en el linaje declarado.
- Generacion de codigo: el linaje incluye microsoft/rStar-Coder, lo que sugiere entrenamiento orientado a codigo.
- Matematicas: el linaje incluye openbmb/UltraData-Math.
- Tool calling / function calling: el repositorio incluye en su raiz ficheros `template`, `system` y `params` con la plantilla de tool calling, que el puente de Ollama de Hugging Face ingiere. Es uno de los tres ficheros que se descargan al hacer `ollama run hf.co/FoolDev/Thanatos-27B-HERETIC`.
- Uso como agente: etiqueta `agent` explicita en el modelo.
- Multimodalidad (entrada de imagen): el pipeline declarado es `image-text-to-text`. Atencion: segun la model card, la vision esta rota en Ollama para esta arquitectura upstream y hay que usar llama.cpp directamente.
- Modo sin censura: ablacion ARA que reduce el comportamiento de rechazo entrenado. Etiquetas `heretic` y `uncensored`.
- Contexto largo: hasta 262.144 tokens nativos y 1.010.000 con YaRN, adecuado para documentos extensos o historiales de conversacion muy largos.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto nativo, el modelo puede mantener el historial completo de una conversacion multi-turno o ingerir manuales de producto extensos sin troceado agresivo, respondiendo en cualquiera de los 22 idiomas soportados.
- Generacion de codigo en produccion: gracias al soporte de tool calling y a un linaje que incluye datos de codigo (rStar-Coder), puede integrarse en pipelines de CI/CD para revisar diffs, generar tests o completar funciones invocando herramientas externas.
- Agentes autonomos de varios pasos: la combinacion de razonamiento explicito, plantilla de tool calling y contexto largo permite construir bucles de razonamiento-accion-observacion para tareas como investigacion web o automatizacion de back-office.
- Analisis de documentacion tecnica y legal: la ventana extensible hasta 1.010.000 tokens con YaRN permite procesar contratos, expedientes o codebases completos en una sola pasada, con la advertencia de que a esa longitud el coste de KV cache es elevado.
- Escritura creativa y narrativa larga: el linaje incluye Creative_Writing_ShareGPT_Enhanced; el modelo puede mantener coherencia de personajes y tramas a lo largo de decenas de miles de tokens, algo que modelos de 8-32k no logran.
- Asistente local sin restricciones de contenido para investigacion: al ser un modelo abliterated con licencia Apache 2.0 y pesos GGUF, es utilizable en investigacion sobre alineacion, refusal y comportamientos de modelos sin censura, ejecutandose en hardware local.
- Traduccion y atencion multilingue: 22 idiomas declarados cubren la mayoria de los mercados europeos, Oriente Medio y Asia Oriental, lo que lo hace apto para localizacion de contenido o soporte internacional.
- Despliegue en hardware de consumo: con el quant Q4_K_M (~17 GB) y el contexto por defecto de 65.536 tokens (~4 GB de KV cache, ~26 GB totales), un equipo con 32 GB de RAM puede ejecutarlo localmente via Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica cuantitativa, y advierte explicitamente que ninguna evaluacion del repositorio mide el linaje de entrenamiento declarado. La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion, segun los datos de la model card: Q2_K ~10,9 GB, Q3_K_M ~13 GB, Q4_K_M ~17 GB, Q5_K_M ~20 GB. Existe tambien IQ4_XS.
- KV cache: aproximadamente 4 GB con contexto de 65.536 tokens (total ~26 GB con Q4_K_M) y aproximadamente 16 GB con contexto nativo de 262.144 tokens (total ~38 GB con Q4_K_M).
- Cabe en GPU de consumo: si, con el quant Q4_K_M en tarjetas de 24 GB (RTX 3090, RTX 4090) si se recorta el contexto, o repartiendo capas entre GPU y CPU. Un host de 32 GB de RAM ejecuta el ajuste por defecto (65.536 tokens), aunque el autor lo describe como "workable but not roomy".
- GPU recomendadas: no especificadas en la informacion disponible. Para contexto nativo completo (262.144 tokens) hacen falta aproximadamente 38 GB entre VRAM y RAM, lo que apunta a A100 40/80 GB, H100 o configuraciones multi-GPU; no hay confirmacion del autor.
- Opciones de despliegue: Ollama (soporte nativo mediante `ollama run hf.co/FoolDev/Thanatos-27B-HERETIC`), llama.cpp (obligatorio para entrada de imagen, ya que la vision esta rota en Ollama), transformers con los pesos safetensors. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Ablacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thanatos-27B-HERETIC (este) | ~27B denso | 262.144 nativo / 1.010.000 con YaRN | Qwen 3.8 27B denso, hibrida Gated-DeltaNet/Gated-Attention | Heretic ARA | Apache 2.0 | HF: safetensors + GGUF + Ollama |
| FoolDev/Janus-35B-HERETIC | ~27B denso (el sufijo 35B es un artefacto previo al rebase) | 262.144 nativo | Identica al anterior (mismo base denso Qwen 3.8 27B) | Heretic estilo MPOA | No disponible en la informacion proporcionada | HF |
| heretic-org/Qwen3.8-27B-heretic-ara | ~27B denso | 262.144 nativo | Qwen 3.8 27B denso | Heretic ARA | No disponible en la informacion proporcionada | HF: safetensors + repo GGUF propio |
| Qwen/Qwen3.8-27B (base original) | ~27B denso | 262.144 nativo | Qwen 3.8 27B denso | Ninguna (modelo alineado) | No disponible en la informacion proporcionada | HF |

Diferencias clave: Thanatos-27B y Janus-27B comparten exactamente el mismo base denso, la misma ventana de contexto, el mismo teacher declarado (Claude Fable 5) y la misma familia de datasets. La unica diferencia real es el metodo de ablacion subyacente (ARA frente a MPOA-style), por lo que la eleccion entre ambos debe hacerse por comportamiento observado y no por tamano o capacidad.

## Limitaciones y advertencias

- Modelo abliterated y sin censura: el comportamiento de rechazo esta atenuado en las capas base. No cuenta con las salvaguardas de un modelo alineado convencional y puede generar contenido danino, ofensivo o ilegal si se le solicita. No es apto para despliegues orientados a publico general sin capas adicionales de moderacion.
- Linaje de entrenamiento no verificado: el teacher declarado (Claude Fable 5) y la lista de datasets provienen de la documentacion del modelo base upstream. El propio autor advierte que nada en este repositorio los reproduce ni los mide. Tratar como atribucion, no como registro de entrenamiento.
- Ausencia total de benchmarks: no hay ninguna metrica publicada, ni propia ni del base, en la informacion disponible. Cualquier afirmacion de rendimiento seria especulativa.
- Vision rota en Ollama: segun la model card, el soporte de vision esta roto upstream para esta arquitectura en Ollama. Para entrada de imagen hay que usar llama.cpp directamente.
- Contexto por defecto conservador: el GGUF empaquetado trae 65.536 tokens por defecto, no los 262.144 nativos. Hay que subir `num_ctx` manualmente, asumiendo el coste de KV cache (~16 GB a contexto nativo).
- Historial de etiquetado problematico: existieron ventanas de la version previa (`FoolDev/Thanatos-27B`, 19-20 de mayo de 2026) con blobs sellados como `qwen36` que requeririan `make heal-hf` para reetiquetarse. Conviene verificar el sellado del blob descargado.
- Riesgo de alucinacion: no disponible la evaluacion especifica. Como todo modelo de 27B sin benchmarks verificables, el riesgo existe y no esta cuantificado.
- Licencia Apache 2.0: permisiva y compatible con uso comercial, pero el autor no ofrece garantias sobre el cumplimiento de las licencias de los datasets del linaje upstream, que incluyen conjuntos de terceros.
- Tamano del repositorio: 200,9 GB, lo que implica un coste de almacenamiento y ancho de banda considerable si se descargan los safetensors completos en lugar del GGUF cuantizado.
- Adopcion limitada: 415 descargas y 2 likes en el momento de la consulta, con una actualizacion reciente (10 de septiembre de 2026). Comunidad y soporte muy reducidos.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/FoolDev/Thanatos-27B-HERETIC
- Modelo base: https://huggingface.co/heretic-org/Qwen3.8-27B-heretic-ara
- Modelo hermano: https://huggingface.co/FoolDev/Janus-35B-HERETIC
- Base original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repo GGUF del base (mradermacher): mradermacher/Qwen3.8-27B-heretic-ara-GGUF (referenciado en la model card)
- Datasets del linaje declarado: Crownelius/Creative_Writing_ShareGPT_Enhanced, microsoft/rStar-Coder, peteromallet/dataclaw-peteromallet, Crownelius/Opus-4.7-Reasoning, openbmb/UltraData-Math, Crownelius/Crow-Heretic-TeichAI-Unified
- Donaciones del autor: https://buymeacoffee.com/cardoffoolm
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (papers, blogs o demos).
