# mradermacher/EuroLLM1.5-9B-Base-i1-GGUF

## Resumen

EuroLLM1.5-9B-Base-i1-GGUF es la cuantizacion en formato GGUF, generada con imatrix (matriz de importancia), del modelo base EuroLLM1.5-9B-Base, desarrollado por el proyecto utter-project. Se trata de un modelo transformer decoder-only de 9.152.319.488 parametros (aproximadamente 9,15 mil millones) entrenado desde cero con el objetivo de cubrir las 24 lenguas oficiales de la Union Europea y ampliar la cobertura a un total de 35 idiomas, incluyendo arabe, chino, coreano, japones, hindi y ruso. La relevancia de este modelo radica en su enfoque explicitamente europeo: ofrece un rendimiento equilibrado entre lenguas de altos y bajos recursos, algo poco habitual en modelos multilingues de gran escala.

Esta ficha concreta corresponde al repositorio de cuantizaciones publicado por mradermacher, no al modelo original. El autor ha generado variantes GGUF con cuantizacion de pesos y activaciones (i1, imatrix) en rangos desde Q2_K hasta Q4_K_M, con tamanos que van de 3,7 GB a 5,7 GB, lo que permite ejecutar un modelo de 9B parametros en GPUs de consumo. El modelo base subyacente es de tipo base, es decir, sin ajuste por instrucciones ni alineamiento RLHF, por lo que esta pensado para fine-tuning y para tareas de continuacion de texto, no para uso directo como asistente conversacional.

La licencia Apache 2.0 del modelo base y de las cuantizaciones facilita su uso comercial, y la disponibilidad de pesos en safetensors (modelo original) y GGUF (esta cuantizacion) cubre tanto pipelines de entrenamiento como despliegues de inferencia en CPU y GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base, sin instrucciones) |
| Parametros totales | 9.152.319.488 (9,15B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M (imatrix); existen tambien cuantizaciones estaticas en el repo hermano EuroLLM1.5-9B-Base-GGUF |
| Idiomas soportados | 35: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente, EuroLLM1.5-9B-Base, es un transformer decoder-only de 9,15 mil millones de parametros. La informacion proporcionada en esta model card no detalla la composicion exacta del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya ajuste por preferencias, pero este extremo no se confirma en los datos disponibles. Tampoco se documentan innovaciones tecnicas especificas como atencion lineal o decodificacion especulativa en la informacion facilitada.

La aportacion tecnica de este repositorio concreto es la cuantizacion con imatrix (importance matrix). El autor ha generado una matriz de importancia a partir de datos de calibracion y la ha utilizado para ponderar la cuantizacion de los tensores, lo que en la practica reduce la perplejidad respecto a cuantizaciones estaticas del mismo tamano. El repositorio incluye el propio fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Las variantes i1 combinan cuantizacion de pesos y de activaciones, y el autor advierte que las etiquetas IQ suelen ofrecer mejor calidad que las Q de tamano similar.

## Capacidades

- Generacion de texto y continuacion de secuencias en 35 idiomas, con especial cobertura de las lenguas oficiales de la UE.
- Modelo base: no esta ajustado para seguir instrucciones, por lo que su uso directo como chat es limitado; su valor principal es como punto de partida para fine-tuning.
- Capacidad multilingue amplia: incluye lenguas de bajos recursos como ga (irlandes), mt (maltes), gl (gallego), hr (croata), sl (esloveno), lt (letón), lv (leton), et (estonio) y eu (no listado, pero el conjunto cubre las 24 oficiales de la UE).
- Soporte de idiomas no europeos: arabe, chino, coreano, japones, hindi y ruso.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada; al ser un modelo base, estas capacidades no estan garantizadas.
- Compatible con el ecosistema transformers y con el ecosistema GGUF (llama.cpp, Ollama, LM Studio, etc.).

## Casos de uso

- Fine-tuning para dominios especializados en lenguas europeas: al ser un modelo base de 9B con licencia Apache 2.0, se puede ajustar con SFT o LoRA sobre corpus juridicos, medicos o administrativos en castellano, catalan, gallego o euskera, aprovechando su cobertura multilingue.
- Traduccion automatica entre lenguas de la UE: el modelo puede servir como base para sistemas de traduccion neuronal, especialmente en pares de lenguas de bajos recursos donde otros modelos multilingues rinden peor.
- Generacion aumentada por recuperacion (RAG) en entornos con recursos limitados: las cuantizaciones Q4_K_M (5,7 GB) permiten desplegar el modelo en una GPU de consumo de 8-12 GB, integrandolo en pipelines RAG con embeddings multilingues.
- Investigacion en linguistica computacional: util para estudiar el comportamiento de modelos multilingues en lenguas minoritarias, analizar sesgos por idioma y evaluar tecnicas de cuantizacion con imatrix frente a cuantizacion estatica.
- Prototipado de asistentes de texto en idiomas europeos: aunque no es un modelo de chat, puede adaptarse con un ajuste ligero para tareas de resumen, parafrasis o clasificacion de texto en multiples lenguas.
- Despliegue en entornos sin GPU: las variantes Q2_K (3,7 GB) e IQ3_XXS (3,8 GB) permiten ejecutar el modelo en CPU con llama.cpp, util para pruebas de concepto y entornos de desarrollo sin acelerador hardware.
- Generacion de datos sinteticos multilingues: el modelo puede utilizarse para producir corpus sinteticos en lenguas de bajos recursos, que luego sirvan para entrenar modelos mas pequenos o especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K ~3,7 GB; i1-IQ3_XXS ~3,8 GB; i1-IQ3_M ~4,4 GB; i1-Q3_K_M ~4,7 GB; i1-IQ4_NL ~5,4 GB; i1-Q4_K_S ~5,4 GB; i1-Q4_K_M ~5,7 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones Q4; A100 o H100 para el modelo en precision completa o FP16 (aproximadamente 18 GB en FP16).
- Cabe en GPU de consumo: si, las cuantizaciones Q4 caben en GPUs de 8 GB o mas, y las Q2/IQ3 en GPUs de 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python o el endpoint compatible de Hugging Face. Para el modelo original en safetensors: transformers, vLLM, TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EuroLLM1.5-9B-Base (esta ficha) | 9,15B | no disponible | 35 | Apache 2.0 | GGUF, safetensors |
| Llama 3.1 8B | 8B | 128K (segun documentacion publica de Meta) | ~8 principales | Llama 3.1 Community License | safetensors, GGUF |
| Mistral 7B v0.3 | 7,2B | 32K (segun documentacion publica de Mistral) | principalmente en, fr, de, es, it | Apache 2.0 | safetensors, GGUF |
| Gemma 2 9B | 9B | 8K (segun documentacion publica de Google) | multilingue amplio | Gemma Terms of Use | safetensors, GGUF |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks de EuroLLM1.5-9B-Base en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico. La ventaja diferencial de EuroLLM es su cobertura explicita de las 24 lenguas oficiales de la UE y su licencia Apache 2.0, mas permisiva que la de Llama 3.1 o Gemma 2.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable y puede generar contenido inapropiado; requiere fine-tuning antes de usarse en produccion como asistente.
- Riesgo de alucinacion: al ser un modelo base, la generacion no esta calibrada para tareas de respuesta factual; puede inventar datos con facilidad.
- Sesgos conocidos: no se documentan en la informacion proporcionada, pero al entrenarse con corpus web multilingues es esperable que herede sesgos de genero, culturales y linguisticos; la cobertura desigual entre lenguas puede amplificar estos sesgos en idiomas de bajos recursos.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar su uso en tareas de contexto largo sin verificacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y de las herramientas de cuantizacion utilizadas.
- Caveat de produccion: las cuantizaciones de baja precision (Q2_K, IQ3_XXS) degradan la calidad; para produccion se recomienda al menos Q4_K_M o IQ4_XS.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion comunitaria de estas cuantizaciones concretas.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-i1-GGUF
- Modelo base original: https://huggingface.co/utter-project/EuroLLM1.5-9B-Base
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/EuroLLM1.5-9B-Base-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#EuroLLM1.5-9B-Base-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Discusion sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
