# mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF` es una cuantizacion en formato GGUF, generada con la tecnica imatrix de mradermacher, del modelo base `xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic`. Se trata de un derivado del Qwen3.5 de 0.8B de parametros al que se le han aplicado tecnicas de "abliteration" o "decensoring" (etiquetadas como heretic/uncensored) para eliminar los mecanismos de rechazo del modelo original, y posteriormente un ajuste denominado "weight-space programming" por parte de xtools-at.

El modelo resuelve el problema de desplegar un LLM pequeno (772.845.888 parametros reales en safetensors) en hardware de consumo mediante cuantizacion GGUF de 2 a 6 bits, con ficheros que van desde 0.5 GB hasta 0.7 GB. Es relevante para desarrolladores que necesitan un modelo conversacional ligero, ejecutable en CPU o GPU de gama baja, sin restricciones de contenido y con licencia Apache 2.0.

La ficha cubre exclusivamente la version cuantizada i1 (imatrix) publicada por mradermacher; los detalles de arquitectura y entrenamiento del modelo original no estan documentados en la informacion disponible y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5; detalles no disponibles) |
| Parametros totales | 772.845.888 (dato real en safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-Q4_0, i1-IQ4_XS, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |
| Tamano del repo | 7.8 GB (incluye todos los quants) |
| Tamano por quant | 0.5 GB (Q2_K) a 0.7 GB (Q6_K) |
| Libreria | transformers (metadato); inferencia via llama.cpp/Ollama |
| Fecha de creacion | 2026-11-11 |
| Ultima actualizacion | 2026-11-20 |
| Descargas | 2511 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer decoder-only derivado de Qwen3.5 con aproximadamente 0.77 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion, tipo de atencion (estandar o linear), ni sobre la composicion del dataset de entrenamiento, el numero de tokens vistos o si se aplicaron fases de RLHF, DPO o similar. El modelo base incorpora modificaciones de "weight-space programming" y un proceso de abliteration/decensoring (etiquetado como heretic) que altera los pesos para suprimir comportamientos de rechazo.

La publicacion que nos ocupa no entrena el modelo, sino que aplica cuantizacion GGUF con ficheros de importancia (imatrix) generados por mradermacher. El uso de imatrix permite asignar mayor precision a los tensores mas sensibles, lo que segun las notas del autor hace que, por ejemplo, `i1-IQ3_S` supere a las variantes Q3_K clasicas en calidad. Se ofrecen tanto quants estaticos (en otro repositorio) como estos quants ponderados i1. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles (unico idioma declarado).
- Conversacion multi-turno (tag `conversational`).
- Modo "uncensored"/"abliterated": se han eliminado los rechazos tipicos del modelo original, por lo que responde a peticiones que el modelo base declinaria.
- Ajuste "weight-space programming" aplicado por xtools-at (proposito concreto no documentado en la informacion disponible).
- Compatibilidad con endpoints (`endpoints_compatible` segun tags).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Prototipado rapido en local: al ocupar entre 0.5 y 0.7 GB en GGUF, el modelo se puede cargar en un portatil sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y flujos conversacionales en ingles con latencia baja.
- Experimentacion con modelos sin censura: util para investigadores que estudian el efecto de la abliteration comparando respuestas del modelo heretic frente al Qwen3.5 original en tareas de analisis de sesgos o robustez.
- Generacion de texto en ingles en entornos con recursos muy limitados: por ejemplo, clasificacion o resumen de mensajes cortos en un servicio edge o en un contenedor pequeno, donde un modelo de 0.8B cuantizado a Q4_K_M (0.6 GB) es suficiente.
- Chatbot de proposito general autoalojado: con licencia Apache 2.0 y pesos GGUF, se puede desplegar en una Raspberry Pi o en una instancia CPU-only para asistencia conversacional basica en ingles.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye 16 variantes de quant mas el fichero imatrix, lo que lo convierte en un banco de pruebas para medir el impacto de Q2_K, IQ3_S, Q4_K_M, Q6_K, etc. sobre la perplejidad y la calidad de salida en un modelo pequeno.
- Base para fine-tuning ligero o destilacion: al ser un modelo de 0.77B con licencia permisiva, sirve como punto de partida para ajustes especificos de dominio en ingles antes de volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad comparativas; solo se menciona cualitativamente que ciertos quants IQ superan a los Q_K de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5-0.7 GB para los pesos en Q2_K a Q6_K, mas overhead de contexto KV cache (dependiente de la longitud de contexto, no documentada). En la practica, menos de 1-2 GB de RAM/VRAM para uso conversacional tipico.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, etc.); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas e incluso en iGPU y en CPU-only.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El metadato declara `transformers`, pero para GGUF se requiere un runtime especifico.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (0.77B) se espera inferencia en tiempo real en CPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B heretic i1-GGUF) | 0.77B | no disponible | Apache 2.0 | GGUF | Uncensored, solo ingles, quants 0.5-0.7 GB |
| Qwen3.5-0.8B (original) | ~0.8B | no disponible | Apache 2.0 (segun base) | safetensors/GGUF | Version con censura y alineamiento original |
| xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic | 0.77B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar de esta ficha |
| mradermacher/...-GGUF (quants estaticos) | 0.77B | no disponible | Apache 2.0 | GGUF | Misma base, cuantizacion sin imatrix |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Modelo "uncensored"/"abliterated": puede generar contenido que el modelo original rechazaria, con riesgo de producir material ofensivo, inseguro o inexacto. Requiere filtros propios si se expone a usuarios finales.
- Riesgo elevado de alucinacion por su tamano reducido (0.77B); no es adecuado para tareas que exijan alta fiabilidad factual sin verificacion.
- No se documentan la longitud de contexto ni el proceso de entrenamiento, lo que dificulta evaluar su robustez en contextos largos.
- Los quants de 2 y 3 bits (Q2_K, IQ2_*, IQ3_XXS) degradan notablemente la calidad; el propio autor recomienda IQ3_S o superiores y senala que IQ4_XS es preferible a IQ4_NL.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede conllevar riesgos reputacionales y de cumplimiento; conviene revisar las politicas de la plataforma de despliegue.
- El repositorio pesa 7.8 GB en total; descargar todos los quants es innecesario, basta con el fichero del quant elegido.
- No hay garantia de soporte de tool calling ni de integracion con frameworks de agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
