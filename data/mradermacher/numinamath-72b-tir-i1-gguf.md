# mradermacher/NuminaMath-72B-TIR-i1-GGUF

## Resumen

NuminaMath-72B-TIR-i1-GGUF es la cuantizacion en formato GGUF, generada por mradermacher, del modelo project-numina/NuminaMath-72B-TIR. Se trata de un modelo de lenguaje de 72.706.203.648 parametros (aproximadamente 72,7 mil millones) especializado en razonamiento matematico y entrenado con el dataset AI-MO/NuminaMath-TIR, que incorpora trazas de razonamiento en formato tool-integrated reasoning (TIR). El modelo original parte de una base Qwen (la licencia declarada es tongyi-qianwen) y se ha ajustado mediante alignment-handbook, una libreria de alineamiento de Hugging Face.

La relevancia de esta ficha radica en que ofrece el modelo en una amplia gama de cuantizaciones GGUF con calibracion imatrix, lo que permite ejecutar un modelo de 72B en hardware mas modesto que el requerido por los pesos originales en safetensors. Las cuantizaciones van desde IQ1_S (22,8 GB) hasta Q6_K (64,4 GB, dividido en dos partes), cubriendo desde escenarios de memoria muy limitada hasta despliegues casi sin perdida de calidad.

El modelo esta orientado a tareas de matematicas y razonamiento paso a paso, con capacidad conversacional y soporte para el formato de razonamiento con herramientas (TIR). Su idioma declarado es unicamente el ingles. El repositorio tiene un tamano total de 804,6 GB, lo que refleja la cantidad de variantes de cuantizacion publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen; detalles exactos de capas y atencion no disponibles) |
| Parametros totales | 72.706.203.648 (aproximadamente 72,7B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (cuantizaciones con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | tongyi-qianwen (declarada como "other" con license_name tongyi-qianwen) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base project-numina/NuminaMath-72B-TIR es un transformer de aproximadamente 72,7 mil millones de parametros afinado a partir de una base Qwen, segun indica la licencia tongyi-qianwen. El ajuste se realizo con la libreria alignment-handbook, lo que sugiere un proceso de alineamiento supervisado (SFT) sobre el dataset AI-MO/NuminaMath-TIR. Este dataset esta orientado a matematicas y contiene trazas de razonamiento en formato tool-integrated reasoning (TIR), es decir, razonamiento que combina pasos en lenguaje natural con llamadas a herramientas de calculo.

La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal. La contribucion principal de esta ficha es la cuantizacion: mradermacher ha generado variantes GGUF con calibracion imatrix (etiquetadas i1), que segun la model card ofrecen mejor calidad que las cuantizaciones estaticas equivalentes en tamano. Tambien existe una version de cuantizaciones estaticas en el repositorio mradermacher/NuminaMath-72B-TIR-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico paso a paso, con enfasis en problemas que requieren trazas de razonamiento.
- Razonamiento con herramientas (tool-integrated reasoning, TIR): el modelo esta entrenado para intercalar pasos de razonamiento con llamadas a herramientas de calculo.
- Soporte de conversacion multi-turno (tag "conversational").
- Capacidad de razonamiento multi-paso orientada a la resolucion de problemas matematicos.
- No se ha documentado soporte de vision, audio ni otras modalidades en la informacion disponible.
- No se ha documentado explicitamente soporte de function calling generico fuera del paradigma TIR.
- Capacidades multilingues limitadas al ingles segun los metadatos.

## Casos de uso

- Resolucion de problemas matematicos asistida: el modelo puede recibir un enunciado y generar una traza de razonamiento paso a paso, adecuado para tutoria automatica o generacion de soluciones explicadas en plataformas educativas.
- Generacion de datasets de razonamiento matematico: util para producir pares pregunta-solucion con trazas detalladas que sirvan para entrenar o evaluar modelos mas pequenos.
- Verificacion y depuracion de demostraciones: con su capacidad de razonamiento multi-paso, puede revisar cadenas de argumentacion matematica y senalar pasos erroneos en entornos de investigacion.
- Razonamiento con herramientas de calculo: gracias al entrenamiento TIR, puede integrarse en pipelines donde el modelo propone expresiones y un interprete (por ejemplo, Python o un CAS) las evalua, devolviendo el resultado al modelo.
- Despliegue en estaciones de trabajo con GPU consumer: las cuantizaciones IQ3/IQ4 (31,9-47,5 GB) permiten ejecutar un 72B en configuraciones de una o dos GPU de gama alta con memoria suficiente, algo inviable con los pesos originales.
- Evaluacion comparativa de cuantizaciones: el amplio catalogo de variantes (de IQ1_S a Q6_K) permite medir el impacto de la cuantizacion en tareas matematicas y elegir el punto de equilibrio calidad/memoria para produccion.
- Experimentacion en entornos con RAM/VRAM limitada: las variantes IQ1 e IQ2 (22,8-29,9 GB) hacen posible probar el modelo en hardware modesto, aunque con perdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano de fichero, aproximadamente igual a memoria necesaria para los pesos):
  - i1-IQ1_S: 22,8 GB
  - i1-IQ1_M: 23,8 GB
  - i1-IQ2_XXS a i1-IQ2_M: 25,6-29,4 GB
  - i1-Q2_K_S / i1-Q2_K: 29,7-29,9 GB
  - i1-IQ3_XXS a i1-IQ3_M: 31,9-35,6 GB
  - i1-Q3_K_S a i1-Q3_K_L: 34,6-39,6 GB
  - i1-IQ4_XS / i1-Q4_0: 39,8-41,5 GB
  - i1-Q4_K_S / i1-Q4_K_M: 44,0-47,5 GB
  - i1-Q5_K_S / i1-Q5_K_M: 51,5-54,5 GB (dos partes)
  - i1-Q6_K: 64,4 GB (dos partes)
- GPU recomendadas: no especificadas en la informacion. Por tamano, las cuantizaciones Q4 requieren aproximadamente 44-48 GB, lo que encaja en una A100 80 GB, H100 80 GB o en dos RTX 4090 (24 GB cada una) con reparto de capas.
- GPU consumer: las variantes IQ1/IQ2 (22,8-29,4 GB) pueden caber en una RTX 4090 (24 GB) solo en el extremo IQ1_S; el resto requiere reparto entre GPU y RAM del sistema (offloading) o varias GPU. Las variantes Q4 en adelante no caben en una sola GPU consumer.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) al ser formato GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero esta ficha corresponde a la version GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| NuminaMath-72B-TIR-i1-GGUF (este) | 72,7B | no disponible | GGUF (multiples cuantizaciones) | tongyi-qianwen | Especializado en matematicas, TIR, solo ingles |
| project-numina/NuminaMath-72B-TIR (base) | 72,7B | no disponible | safetensors | tongyi-qianwen | Modelo original sin cuantizar; requiere mucha mas memoria |
| mradermacher/NuminaMath-72B-TIR-GGUF | 72,7B | no disponible | GGUF (cuantizaciones estaticas) | tongyi-qianwen | Misma base, sin calibracion imatrix |
| Otros modelos matematicos de ~70B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- Riesgo de alucinacion: como todo modelo generativo, puede producir pasos de razonamiento plausibles pero incorrectos, especialmente en problemas matematicos complejos; conviene verificar con herramientas externas.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 (y Q2_K_S) conllevan perdida de calidad significativa; la propia model card advierte "very low quality" o "for the desperate" en algunas de ellas. Para produccion se recomienda Q4_K_M o superior.
- Licencia: la licencia tongyi-qianwen impone condiciones especificas para uso comercial; es necesario revisar los terminos del modelo base Qwen antes de desplegar en produccion.
- Contexto: no se ha documentado la longitud de contexto, por lo que no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Tool calling generico: el entrenamiento TIR esta orientado a herramientas de calculo matematico; no se ha documentado soporte de function calling arbitrario.
- Sesgos: no se dispone de informacion sobre sesgos especificos del modelo en la documentacion proporcionada.
- Repositorio de gran tamano (804,6 GB): la descarga de variantes concretas debe hacerse seleccionando el fichero adecuado, no clonando el repositorio completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/NuminaMath-72B-TIR-i1-GGUF
- Modelo base: https://huggingface.co/project-numina/NuminaMath-72B-TIR
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/NuminaMath-72B-TIR-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NuminaMath-72B-TIR-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/AI-MO/NuminaMath-TIR
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
