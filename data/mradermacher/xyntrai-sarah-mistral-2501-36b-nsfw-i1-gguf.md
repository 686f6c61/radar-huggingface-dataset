# mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF

## Resumen

`mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF` es un conjunto de cuantizaciones GGUF generadas por mradermacher a partir del modelo base `xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw`. El prefijo `i1` indica que se han empleado cuantizaciones con matriz de importancia (imatrix), una tecnica que ajusta los pesos cuantizados segun su relevancia para reducir la perdida de calidad frente a la cuantizacion uniforme.

El modelo base se presenta como un fine-tuning de la familia Mistral con un tamano nominal de 36B en el nombre, aunque los datos reales de safetensors del repositorio reportan 8.001.216 parametros. Esta discrepancia es relevante y debe tratarse con cautela: el repositorio indica un tamano de 0.0 GB, lo que sugiere que la publicacion esta incompleta o que los metadatos no reflejan el contenido real. El modelo esta etiquetado como `not-for-all-audiences` y `nsfw`, lo que indica contenido para adultos.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: se trata de una republicacion de cuantizaciones, no de un modelo original, y no se dispone de model card detallada, benchmarks ni especificaciones de entrenamiento. Se documenta aqui lo que puede verificarse y se marcan explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Mistral, sin confirmar) |
| Parametros totales | 8.001.216 segun safetensors del repo (el nombre indica 36B; discrepancia no resuelta) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos en formato HF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre `mistral-2501` sugiere una base de la familia Mistral con fecha de enero de 2025, pero no se confirma ni la variante concreta ni si se trata de un transformer denso o de una mezcla de expertos. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo unico verificable es el proceso de cuantizacion: las etiquetas de la model card (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) indican que se partio de pesos en formato Hugging Face y se aplico una conversion con cuantizacion por tensor y matrices de importancia ponderadas. El conjunto de cuantizaciones cubre desde IQ1_S (extremadamente agresiva) hasta Q6_K (alta fidelidad), lo que permite desplegar el modelo en un rango amplio de hardware a costa de distinta perdida de calidad.

## Capacidades

- Generacion de texto autoregresiva (heredada del modelo base, sin detalle publicado).
- Contenido para adultos y roleplay, segun la etiqueta `nsfw` y el nombre del modelo.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte multimodal (vision, audio) ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta etiquetado como `nsfw` y parece orientado a personajes (nombre "Sarah"), por lo que su uso previsto es la generacion de dialogos de ficcion para adultos en entornos controlados.
- Despliegue local en hardware consumer: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPU de gama media mediante llama.cpp u Ollama, siempre que el tamano real de pesos coincida con el nominal.
- Experimentacion con cuantizacion imatrix: util para investigadores que quieran comparar la degradacion de calidad entre variantes IQ y K en un mismo modelo base.
- Prototipado de chatbots de personaje: integrable en frameworks como SillyTavern o text-generation-webui mediante el formato GGUF.
- Evaluacion de sesgos y seguridad: sirve como caso de estudio para medir como las cuantizaciones agresivas (IQ1, IQ2) afectan a la coherencia y a la filtracion de contenido sensible.
- Pruebas de inferencia en CPU: las variantes de baja precision permiten ejecucion en CPU con llama.cpp, aunque con latencia alta y calidad reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, porque el numero real de parametros (8 millones segun safetensors) no concuerda con el nominal (36B). Si el modelo real fuese de 36B, una cuantizacion Q4_K_M requeriria aproximadamente 20-22 GB de VRAM; una Q2_K, unos 12-14 GB. Si el dato de safetensors fuese el correcto, el modelo cabria en cualquier GPU consumer.
- GPU recomendadas: no disponible. Para un hipotetico 36B en Q4, se necesitaria una RTX 4090 (24 GB) o superior; para Q6_K, una A100 40 GB o H100.
- Cabe en GPU consumer: probablemente si en el escenario de 8M parametros; en el escenario de 36B, solo en configuraciones de 24 GB o mas con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xyntrai-Sarah-mistral-2501-36B-nsfw (i1-GGUF) | 36B nominal / 8M real (discrepancia) | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un fine-tuning NSFW |
| Mistral Small 24B | 24B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Base generalista, sin fine-tuning NSFW |
| Mistral Nemo 12B | 12B | 128k | Apache 2.0 | safetensors, GGUF | Contexto largo, uso general |
| Modelos NSFW de la comunidad (p. ej. variantes de Llama 3 fine-tuneadas) | 8B-70B | variable | variable (a menudo restrictiva) | GGUF | Ecosistema fragmentado, sin benchmarks estandar |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado para contrastar con alternativas.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta etiquetado como `not-for-all-audiences`; no es apto para aplicaciones orientadas al publico general ni para menores.
- Discrepancia de parametros: el nombre indica 36B pero safetensors reporta 8.001.216 parametros y el repo ocupa 0.0 GB. Verificar el contenido real antes de cualquier despliegue.
- Licencia no disponible: no puede confirmarse el uso comercial; el modelo base podria tener restricciones que se heredan.
- Sin model card detallada: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinacion y degradacion: las cuantizaciones IQ1 e IQ2 son muy agresivas y pueden producir incoherencias notables.
- Sin benchmarks: no hay evidencia publicada de calidad frente a alternativas.
- Sin soporte documentado de tool calling ni agentes: no recomendable para pipelines automatizados que requieran esas capacidades.
- Idiomas no especificados: el rendimiento fuera del ingles (o del idioma de entrenamiento) es desconocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/xyntrai-Sarah-mistral-2501-36B-nsfw-i1-GGUF
- Modelo base: https://huggingface.co/xyntraistudios/xyntrai-Sarah-mistral-2501-36B-nsfw
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
