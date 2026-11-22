# mradermacher/Spectre-37B-v1-i1-GGUF

## Resumen

Spectre-37B-v1-i1-GGUF es la distribucion en formato GGUF del modelo Spectre-37B-v1 desarrollado por TheDrummer, cuantizada por mradermacher mediante el metodo i1 (imatrix). El modelo base es un transformer denso de 36.554.956.360 parametros (aproximadamente 36,5 mil millones) orientado a generacion conversacional en ingles. Esta publicacion no es un modelo original sino un paquete de cuantizaciones optimizadas para inferencia local con llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha reside en que permite ejecutar un modelo de ~37B en hardware de consumo mediante cuantizaciones que van desde 8,5 GB (IQ1_S) hasta 30,1 GB (Q6_K). El uso de imatrix (matriz de importancia) en las cuantizaciones i1 mejora la calidad respecto a las cuantizaciones estaticas tradicionales, especialmente en rangos bajos como IQ2 e IQ3, donde la perdida de calidad suele ser mas acusada.

No se dispone de informacion publica sobre la arquitectura interna del modelo base, su longitud de contexto, datos de entrenamiento o resultados de benchmarks en la documentacion proporcionada. La model card del cuantizador se limita a listar los ficheros GGUF generados y enlazar al modelo original, por lo que muchos parametros tecnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: TheDrummer/Spectre-37B-v1) |
| Parametros totales | 36.554.956.360 (~36,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (mas fichero imatrix separado) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base TheDrummer/Spectre-37B-v1 en la documentacion proporcionada. El recuento de parametros (36.554.956.360) corresponde a un modelo denso de aproximadamente 37B, pero no se especifica si emplea atencion estandar, atencion lineal, arquitectura hibrida u otra variante. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF, DPO o similar.

Lo unico documentado tecnicamente es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (etiquetadas como i1), que emplean una matriz de importancia calculada sobre el modelo para preservar mejor los pesos criticos durante la cuantizacion. Esto produce, segun el autor, una calidad superior a las cuantizaciones estaticas equivalentes en tamano, especialmente en los rangos IQ2 e IQ3. El fichero imatrix se distribuye por separado (0,1 GB) para quien quiera generar sus propias cuantizaciones. Existe tambien una version con cuantizaciones estaticas en mradermacher/Spectre-37B-v1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no documentadas en la informacion disponible.
- Soporte de agentes o multi-step reasoning: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse en estaciones de trabajo con GPU de consumo usando la cuantizacion i1-Q4_K_M (22,3 GB), adecuada para equipos con 24 GB de VRAM y uso de offloading parcial. Es apropiado para prototipos de chatbots que requieran privacidad de datos al no depender de APIs externas.
- Experimentacion con modelos de ~37B en hardware limitado: las cuantizaciones IQ2 (10-13 GB) permiten probar el comportamiento del modelo en GPUs de 12-16 GB, sacrificando calidad pero manteniendo la estructura del modelo para evaluaciones comparativas.
- Generacion de texto creativo y narrativo en ingles: la naturaleza conversacional del modelo base y su volumen de parametros lo hacen util para tareas de escritura asistida, siempre que se valide la calidad con la cuantizacion elegida.
- Fine-tuning y destilacion sobre las salidas del modelo: al ser un modelo abierto en pesos GGUF, puede usarse como generador de datos sinteticos en ingles para entrenar modelos menores, aunque la licencia no disponible obliga a verificar restricciones antes de uso comercial.
- Despliegue en pipelines de investigacion con llama.cpp: la disponibilidad de 23 cuantizaciones distintas permite ajustar el equilibrio tamano/calidad/latencia segun los recursos del cluster, usando Q6_K (30,1 GB) para maxima fidelidad o IQ3_S (16,4 GB) para throughput alto.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye tanto cuantizaciones i1 como el fichero imatrix, lo que permite reproducir el proceso y comparar la degradacion de perplejidad entre metodos, util para investigadores que estudien compresion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8,5 GB (i1-IQ1_S) y 30,1 GB (i1-Q6_K), segun la cuantizacion. La cuantizacion recomendada i1-Q4_K_M ocupa 22,3 GB.
- GPU recomendadas: para Q6_K o Q5_K_M se recomienda A100 40GB, H100 o RTX 6000 Ada (48 GB). Para Q4_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente. Para IQ3_S o inferiores, una RTX 4080 (16 GB) o RTX 3060 12GB con offloading parcial.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q4_K_M con 24 GB de VRAM; las cuantizaciones IQ2 e IQ1 caben en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere tambien despliegue en Hugging Face Endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependeran del hardware y de la cuantizacion; a modo orientativo, un modelo denso de 37B en Q4_K_M sobre una RTX 4090 suele situarse en el rango de decenas de tokens por segundo, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Spectre-37B-v1, por lo que la comparativa se limita a caracteristicas estructurales frente a otros modelos densos de tamano similar con distribucion GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spectre-37B-v1 (esta ficha) | ~36,5B | no disponible | no disponible | GGUF (i1 y estaticas) | Solo ingles; cuantizaciones imatrix |
| Modelos densos ~30-40B tipo Qwen o Yi | 30-34B | variable (32K-200K segun version) | variable (Apache 2.0 o similar) | safetensors, GGUF | Multilingues, con benchmarks publicos |
| Modelos MoE ~30B activos tipo Mixtral 8x7B | 46,7B totales / 12,9B activos | 32K | Apache 2.0 | safetensors, GGUF | Mayor eficiencia de inferencia por activacion dispersa |

La comparativa detallada con benchmarks no es posible sin datos publicados del modelo base. Se recomienda consultar la model card original de TheDrummer/Spectre-37B-v1 para obtener informacion adicional.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base TheDrummer/Spectre-37B-v1 antes de cualquier despliegue en produccion.
- Idioma limitado al ingles: no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo, toxicidad o alineacion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se aportan datos de evaluacion de factualidad.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality". No se recomiendan para produccion.
- Sin datos de longitud de contexto: imposible planificar casos de uso con ventanas largas sin verificar en la model card original.
- Repositorio de 396,7 GB: requiere planificacion de almacenamiento si se descargan multiples cuantizaciones.
- Solo 1 like y 5639 descargas en el momento de la consulta: comunidad pequena, menor soporte y validacion externa.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Spectre-37B-v1-i1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Spectre-37B-v1
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Spectre-37B-v1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Spectre-37B-v1-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH (patrocinador del cuantizador): https://www.nethype.de/
