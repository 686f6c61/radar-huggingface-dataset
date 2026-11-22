# mradermacher/MicroDev-R1-1.5B-GGUF

## Resumen
MicroDev-R1-1.5B-GGUF es la distribucion en formato GGUF del modelo MicroDev-R1-1.5B, desarrollado originalmente por el usuario sopandpatil y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2.5, orientado a generacion de codigo, razonamiento y desarrollo web, con enfasis declarado en la creacion de aplicaciones de un solo archivo (single-file apps). La model card lo etiqueta explicitamente como un modelo de razonamiento (sufijo R1) afinado con Unsloth.

El modelo resuelve el problema de disponer de un asistente de codigo y razonamiento ligero que pueda ejecutarse en hardware modesto, incluido edge AI y entornos de consumidor, gracias a sus cuantizaciones que van desde 0,8 GB (Q2_K) hasta 3,2 GB (f16). Esta distribucion concreta es relevante porque ofrece el modelo base en multiples niveles de cuantizacion GGUF listos para usar con llama.cpp, Ollama y herramientas compatibles, lo que facilita su despliegue local sin necesidad de GPU de gama alta.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. La informacion disponible no detalla la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5, segun tags del autor) |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base es MicroDev-R1-1.5B, construido sobre la arquitectura Qwen2.5 segun los tags de la model card, y afinado con Unsloth segun la misma fuente. El sufijo "R1" sugiere un enfoque de razonamiento, aunque la informacion disponible no detalla el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La contribucion de esta ficha concreta (mradermacher) es la cuantizacion estatica del modelo base a formato GGUF en doce variantes, con el objetivo de facilitar su ejecucion en CPU y GPU de gama baja. El autor indica que tambien existen cuantizaciones ponderadas/imatrix en un repositorio separado (MicroDev-R1-1.5B-i1-GGUF).

## Capacidades
- Generacion de texto y razonamiento, con enfasis declarado en tareas de razonamiento (sufijo R1).
- Generacion de codigo, especialmente orientada a desarrollo web y aplicaciones de un solo archivo (single-file apps).
- Conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Ejecucion en edge AI y entornos locales gracias a las cuantizaciones ligeras.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (en).
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso
- Asistente de codigo local en el editor: con cuantizaciones Q4_K_M de 1,1 GB, el modelo puede ejecutarse en un portatil sin GPU dedicada para autocompletar y generar funciones en ingles, lo que lo hace adecuado para entornos con recursos limitados.
- Generacion de aplicaciones web de un solo archivo: el modelo esta especializado en single-file apps, por lo que puede producir prototipos HTML/CSS/JS autocontenidos a partir de una descripcion, utiles para demostraciones rapidas.
- Despliegue en edge AI: con la variante Q2_K de 0,8 GB puede integrarse en dispositivos con poca memoria, como Raspberry Pi o mini-PC, para tareas de generacion de codigo sencillas.
- Chatbot de soporte tecnico para desarrolladores: su naturaleza conversacional y su foco en codigo permiten responder dudas de programacion en ingles dentro de una aplicacion de documentacion.
- Prototipado rapido en pipelines de CI: al ser Apache 2.0 y caber en 1 GB, puede embeberse en scripts de validacion o generacion de fragmentos de codigo sin coste de licencia.
- Educacion y aprendizaje de programacion: el modelo puede explicar fragmentos de codigo y proponer ejercicios en ingles, ejecutandose en Ollama con la variante Q5_K_M de 1,2 GB.
- Pruebas de concepto de razonamiento ligero: para experimentos academicos con modelos pequenos de razonamiento, las variantes Q6_K y Q8_0 ofrecen mayor fidelidad al modelo original con 1,4 y 1,7 GB respectivamente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: entre 0,8 GB (Q2_K) y 1,7 GB (Q8_0) para los pesos; el f16 requiere 3,2 GB. Hay que sumar el espacio para el contexto KV, no cuantificado en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060 o superiores permiten ejecutar Q8_0 con holgura. Para f16 se recomienda al menos 4 GB de VRAM.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU gracias a las cuantizaciones ligeras.
- Opciones de despliegue: llama.cpp, Ollama (tag explicito en la model card), y cualquier runtime compatible con GGUF. El modelo base usa transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MicroDev-R1-1.5B-GGUF | 1,5 B | no disponible | Apache 2.0 | GGUF | Especializado en codigo web y single-file apps |
| Qwen2.5-Coder-1.5B | 1,5 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base de referencia para codigo |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | no disponible en esta ficha | MIT (segun el original) | safetensors, GGUF | Enfoque de razonamiento por destilacion |

Los datos de contexto y rendimiento de los modelos comparables no se han verificado en la informacion proporcionada y deben consultarse en sus respectivas fichas.

## Limitaciones y advertencias
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea limitado.
- Al ser un modelo de 1,5 B, la tasa de alucinacion en tareas de codigo y razonamiento complejo puede ser elevada en comparacion con modelos mayores.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- La longitud de contexto no esta documentada; no se debe asumir una ventana larga.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base.
- El modelo esta etiquetado como orientado a single-file apps y desarrollo web; su uso fuera de ese dominio puede dar resultados pobres.
- No se documentan sesgos especificos, pero al entrenarse presumiblemente con datos web en ingles puede heredar sesgos de ese corpus.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/MicroDev-R1-1.5B-GGUF
- Modelo base: https://huggingface.co/sopandpatil/MicroDev-R1-1.5B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MicroDev-R1-1.5B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#MicroDev-R1-1.5B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
