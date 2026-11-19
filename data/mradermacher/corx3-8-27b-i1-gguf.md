# mradermacher/CorX3.8-27B-i1-GGUF

## Resumen

CorX3.8-27B-i1-GGUF es la distribucion en formato GGUF del modelo CorX3.8-27B, publicada por el usuario mradermacher. No se trata de un modelo entrenado por este autor, sino de una re-cuantizacion del modelo base CorxLabs/CorX3.8-27B, que conserva su licencia Apache 2.0. El repositorio ofrece un conjunto amplio de cuantizaciones con ficheros imatrix ("i1"), pensadas para ejecucion local en llama.cpp y entornos compatibles, con tamanos que van desde 7,2 GB en IQ1_S hasta 22,2 GB en Q6_K.

El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones), lo que lo situa en la franja de los modelos densos de 27B. La informacion disponible no detalla la arquitectura interna, la longitud de contexto ni la composicion del dataset de entrenamiento del modelo base; la model card del repositorio cuantizado se limita a describir el proceso de cuantizacion y los ficheros generados.

Su relevancia practica reside en la disponibilidad de variantes GGUF con cuantizacion por imatrix, que permiten desplegar un modelo de ~27B en hardware de consumo y en servidores sin GPU de gama alta, manteniendo una calidad razonable en los rangos Q4 y Q5. El repositorio acumula 2.203 descargas y esta etiquetado para transformers y text-generation-inference, aunque el formato real de los pesos es GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso, sin confirmar en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix, prefijo i1) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (ficheros individuales por cuantizacion; tambien se ofrece el fichero imatrix para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles sobre la arquitectura del modelo base CorxLabs/CorX3.8-27B: no se especifica si emplea atencion completa, atencion lineal, mezcla de expertos o alguna variante hibrida, ni se documenta el numero de tokens de entrenamiento, la composicion del corpus ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El unico dato estructural firme es el recuento de parametros (26.895.998.464), coherente con un modelo denso de aproximadamente 27B.

Lo que si esta documentado es el proceso de cuantizacion aplicado en este repositorio: se generan cuantizaciones ponderadas con imatrix (identificador "i1"), derivadas de un fichero imatrix propio incluido en el repositorio (CorX3.8-27B.imatrix.gguf, 0,1 GB). El autor mantiene ademas una version con cuantizaciones estaticas en un repositorio separado (mradermacher/CorX3.8-27B-GGUF). Las cuantizaciones i1 se producen con la herramienta de cuantizacion de llama.cpp y estan pensadas para su uso directo en ese ecosistema.

## Capacidades

- Generacion de texto conversacional en ingles: el repositorio esta etiquetado como "conversational" y "text-generation-inference".
- Razonamiento y generacion de texto general, heredados del modelo base; no se documentan capacidades especificas adicionales.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion i1-Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB o en configuraciones con offload parcial a CPU, lo que permite ejecutar un modelo de ~27B en hardware de consumo sin depender de servicios en la nube.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede integrarse en aplicaciones de chat mediante llama.cpp o servidores compatibles con la API de OpenAI, usando las variantes Q4_K_S o Q4_K_M por su equilibrio entre tamano y calidad.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de 23 variantes i1 (desde 7,2 GB hasta 22,2 GB) permite medir empiricamente el impacto de la cuantizacion en la perplexidad y en la calidad de las respuestas para un mismo modelo base.
- Generacion de cuantizaciones a medida: el fichero imatrix incluido (0,1 GB) permite al usuario producir sus propias cuantizaciones con llama.cpp, ajustando el compromiso entre tamano y fidelidad para un dominio concreto.
- Inferencia en servidores sin GPU dedicada: las variantes IQ2 e IQ3 (entre 8,5 y 12,7 GB) permiten ejecutar el modelo en CPU con memoria RAM abundante, util para entornos de laboratorio o pruebas de integracion.
- Investigacion sobre cuantizacion de modelos densos de ~27B: el repositorio sirve como material de referencia para estudiar el comportamiento de las tecnicas IQ frente a las Q_K en un modelo de este tamano, con el grafico comparativo de perplexidad enlazado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto y cache KV. Referencias por cuantizacion: i1-IQ1_S 7,2 GB; i1-IQ2_M 10,1 GB; i1-IQ3_M 12,7 GB; i1-IQ4_XS 15,2 GB; i1-Q4_K_M 16,6 GB; i1-Q5_K_M 19,3 GB; i1-Q6_K 22,2 GB.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o una A100/H100 de 40-80 GB permiten mantener el modelo completo en VRAM. Para IQ2/IQ3, tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) son suficientes.
- Cabe en GPU de consumo: si. Las cuantizaciones IQ2 e IQ3 caben en GPUs de 12-16 GB; Q4_K_M y Q4_K_S caben en 24 GB; las variantes Q5 y Q6 requieren 24 GB con margen ajustado o GPU profesional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio esta etiquetado tambien para text-generation-inference y transformers, aunque el formato de pesos real es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CorX3.8-27B-i1-GGUF (este) | ~26,9B | no disponible | Apache 2.0 | GGUF (i1, 23 variantes) | Cuantizaciones imatrix de 7,2 a 22,2 GB |
| CorX3.8-27B (modelo base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Pesos originales de CorxLabs |
| CorX3.8-27B-GGUF (estatico) | ~26,9B | no disponible | Apache 2.0 | GGUF (Q_K estaticas) | Mismo modelo, cuantizaciones sin imatrix |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con modelos de otras familias de tamano similar.

## Limitaciones y advertencias

- Solo soporta ingles segun la etiqueta de idioma del repositorio; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- No se documentan sesgos conocidos, pero al no haber informacion sobre el dataset de entrenamiento no es posible evaluar riesgos de sesgo de forma fundamentada.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este modelo.
- Las cuantizaciones de baja precision (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality".
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base y a esta distribucion; conviene verificar las condiciones del repositorio original CorxLabs/CorX3.8-27B.
- No hay informacion sobre la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin validacion empirica previa.
- El repositorio tiene 0 likes y un volumen de descargas moderado (2.203), por lo que la validacion comunitaria es escasa.
- El modelo base y sus derivados no cuentan con documentacion tecnica publica en la informacion proporcionada, lo que limita la evaluacion de su calidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/CorX3.8-27B-i1-GGUF
- Modelo base: https://huggingface.co/CorxLabs/CorX3.8-27B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/CorX3.8-27B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#CorX3.8-27B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
