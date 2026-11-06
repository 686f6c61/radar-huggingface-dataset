# mradermacher/Gemma-3-4b_X-Ray-Abli_Linear_v1.01-GGUF

## Resumen

Gemma-3-4b_X-Ray-Abli_Linear_v1.01-GGUF es la version cuantizada en formato GGUF del modelo Nexesenex/Gemma-3-4b_X-Ray-Abli_Linear_v1.01, un merge de modelos derivado de la familia Gemma 3 de Google. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos open source, mientras que el modelo base fue creado por el usuario Nexesenex mediante la herramienta mergekit. El modelo cuenta con 3.880.101.888 parametros totales (aproximadamente 3,9 mil millones) y esta orientado a tareas conversacionales en ingles.

El modelo resuelve el problema de disponer de una variante fusionada de Gemma 3 4B con posible soporte multimodal (se incluyen ficheros mmproj como suplemento multi-modal), empaquetada en cuantizaciones GGUF listas para su despliegue en llama.cpp y entornos compatibles. Es relevante porque permite ejecutar un modelo de casi 4B parametros en hardware de consumo con un abanico amplio de niveles de cuantizacion, desde Q2_K (1,8 GB) hasta f16 (7,9 GB), facilitando su integracion en flujos de trabajo locales.

La informacion disponible sobre el modelo base es escasa: no se detallan los componentes del merge, los datos de entrenamiento ni los resultados de benchmarks. La model card se limita a listar las cuantizaciones generadas y a remitir a la documentacion del modelo original y a los READMEs de referencia de TheBloke para el uso de ficheros GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 3; detalles del merge no disponibles) |
| Parametros totales | 3.880.101.888 (aproximadamente 3,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (con ficheros mmproj para multimodal) |

## Arquitectura y entrenamiento

El modelo es un merge creado con mergekit a partir de la familia Gemma 3, segun indican las etiquetas del repositorio (mergekit, merge) y el nombre del modelo base. La arquitectura subyacente corresponde a un transformer decoder-only de la familia Gemma 3, con aproximadamente 3,9 mil millones de parametros. No se dispone de informacion detallada sobre los componentes especificos del merge, la configuracion de mergekit empleada (por ejemplo, SLERP, TIES o DARE) ni los modelos fuente combinados.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas del merge. La presencia de ficheros mmproj (multi-modal supplement) sugiere que el modelo base conserva o hereda capacidades de vision de Gemma 3, aunque no se detalla su alcance ni su calidad tras el merge.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Posible soporte multimodal (vision) heredado de Gemma 3, indicado por la inclusion de ficheros mmproj Q8_0 y f16 como suplemento multi-modal; el alcance real no esta documentado.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que sugiere integracion con infraestructuras de inferencia estandar.
- No se documenta soporte explicito de tool calling o function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan modos especiales como thinking mode, audio u otras capacidades adicionales.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones desde 1,8 GB (Q2_K) hasta 4,2 GB (Q8_0), el modelo puede ejecutarse en GPUs de consumo mediante llama.cpp u Ollama, lo que lo hace adecuado para prototipado offline sin dependencia de la nube.
- Asistentes conversacionales en ingles: el modelo esta etiquetado como conversational y puede emplearse para chatbots de proposito general en ingles, con la salvedad de que no se han publicado evaluaciones de calidad del merge.
- Experimentacion con merges de modelos: investigadores interesados en estudiar el efecto de mergekit sobre Gemma 3 4B pueden usar esta version cuantizada para comparar el comportamiento del merge frente al modelo original con bajo coste de hardware.
- Pruebas de pipelines GGUF: al ofrecer un espectro amplio de cuantizaciones (Q2 a f16), sirve para validar toolchains de inferencia (llama.cpp, servidores compatibles con GGUF) y medir el impacto de la cuantizacion en la calidad de salida.
- Prototipos multimodales: los ficheros mmproj permiten probar flujos de vision-lenguaje en local, aunque la calidad del merge en tareas visuales no esta documentada y debe validarse empiricamente.
- Educacion y divulgacion: por su tamano contenido y su licencia (no disponible, conviene verificar antes de uso comercial), puede emplearse en entornos docentes para ilustrar el funcionamiento de modelos transformer y de tecnicas de merge y cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para Q2_K, 2,5-2,6 GB para Q4_K_S/Q4_K_M, 3,3 GB para Q6_K, 4,2 GB para Q8_0 y 7,9 GB para f16 (mas overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto; A100/H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 6 GB o mas puede ejecutar las cuantizaciones Q4 y Q5; las Q2 y Q3 caben en GPUs con 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y endpoints compatibles (segun la etiqueta endpoints_compatible); la libreria declarada es transformers, pero el formato GGUF esta pensado para runtimes tipo llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-3-4b_X-Ray-Abli_Linear_v1.01-GGUF (este) | 3,9B | No disponible | No disponible | GGUF | Merge de Gemma 3 4B cuantizado por mradermacher |
| Gemma 3 4B (original de Google) | Aproximadamente 4B | No disponible en esta ficha | Gemma Terms of Use | Safetensors, GGUF (terceros) | Modelo base oficial; referencia de calidad |
| Nexesenex/Gemma-3-4b_X-Ray-Abli_Linear_v1.01 | 3,9B | No disponible | No disponible | Safetensors | Modelo base sin cuantizar del que deriva esta version |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Gemma 3, es previsible que herede sesgos del modelo original, pero no hay evaluacion publicada del merge.
- Riesgo de alucinacion: no cuantificado; los merges sin evaluacion publicada pueden degradar la fidelidad respecto al modelo base, por lo que se recomienda validacion empirica antes de uso en produccion.
- Limitaciones de contexto o idioma: el modelo esta declarado unicamente en ingles; no se especifica la longitud de contexto soportada, lo que impide planificar cargas de contexto largo.
- Restricciones de licencia: la licencia no esta disponible en el repositorio; es imprescindible verificar la licencia del modelo base (Gemma Terms of Use) antes de cualquier uso comercial.
- Caveats para produccion: la model card no documenta evaluaciones de calidad, seguridad ni robustez; el modelo tiene un numero muy bajo de descargas (101) y likes (1), lo que indica escasa validacion por parte de la comunidad.
- Al ser un merge experimental creado con mergekit, su comportamiento puede diferir del Gemma 3 4B oficial de formas no caracterizadas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Gemma-3-4b_X-Ray-Abli_Linear_v1.01-GGUF
- Modelo base (safetensors): https://huggingface.co/Nexesenex/Gemma-3-4b_X-Ray-Abli_Linear_v1.01
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/Gemma-3-4b_X-Ray-Abli_Linear_v1.01-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Gemma-3-4b_X-Ray-Abli_Linear_v1.01-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
