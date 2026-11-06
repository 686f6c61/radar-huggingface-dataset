# mradermacher/Gemma4-12B-Uncensored-GGUF

## Resumen

Gemma4-12B-Uncensored-GGUF es la distribucion en formato GGUF de un ajuste fino del modelo Gemma 4 de 12.000 millones de parametros, publicado por el usuario toandev bajo el identificador toandev/Gemma4-12B-Uncensored y cuantizado por mradermacher. El modelo mantiene la naturaleza multimodal del Gemma 4 original (pipeline image-text-to-text) y se presenta explicitamente como "uncensored", es decir, con el alineamiento de seguridad relajado o eliminado respecto al modelo base de Google. La cuantizacion la firma mradermacher, un actor conocido en el ecosistema por producir versiones GGUF de modelos populares.

El interes practico de esta ficha esta en la disponibilidad de pesos en formato GGUF con un abanico amplio de cuantizaciones (desde Q2_K de 4,9 GB hasta Q8_0 de 12,8 GB, mas los suplementos multimodales mmproj), lo que permite ejecutar un modelo de casi 12.000 millones de parametros en hardware de consumo. El modelo conserva la licencia Gemma, lo que impone restricciones de uso comercial que conviene revisar antes de cualquier despliegue.

La informacion publicada por el autor es muy escasa: la model card se limita a listar las cuantizaciones y enlazar al modelo base, sin detallar datos de entrenamiento, composicion del dataset ni resultados de evaluacion. Esta ficha refleja unicamente lo que consta en la informacion disponible y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 11.907.350.576 (11,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos mmproj-f16 y mmproj-Q8_0; versiones imatrix en repo i1-GGUF |
| Idiomas soportados | en (ingles) segun la model card |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamano del repo | 83,7 GB |
| Modelo base | toandev/Gemma4-12B-Uncensored |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo deriva de Gemma 4, la familia de modelos abiertos de Google, y conserva su caracter multimodal (entrada de imagen y texto). La model card del repositorio cuantizado no aporta detalles sobre la arquitectura interna (numero de capas, dimension del modelo, mecanismo de atencion, tipo de tokenizador) ni sobre el proceso de ajuste fino que dio lugar a la variante "uncensored". Tampoco se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el ajuste.

Lo unico verificable a partir de la informacion disponible es que se trata de una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher sobre los pesos del modelo de toandev, con soporte para el proyector multimodal mediante ficheros mmproj separados. No hay informacion publicada sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en este repositorio.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat propio de la familia Gemma.
- Procesamiento de imagen y texto de forma conjunta (image-text-to-text): el modelo puede recibir imagenes junto a instrucciones textuales, siempre que se cargue el fichero mmproj correspondiente.
- Ajuste fino orientado a reducir el filtrado de contenido, segun la etiqueta "uncensored" declarada por el autor.
- Uso previsto declarado como "research" en las etiquetas del repositorio.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Soporte de tool calling, agentes o modo de razonamiento extendido: no disponible en la informacion publicada.
- Capacidades multilingues: la model card solo declara ingles; no consta soporte documentado de otros idiomas.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un Gemma 4 con el filtrado relajado, comparando respuestas frente a la version oficial en tareas de evaluacion de sesgos y rechazos.
- Prototipado local de asistentes multimodales: con la cuantizacion Q4_K_M (7,5 GB) y el mmproj-Q8_0 (0,3 GB) se puede montar un asistente que describa imagenes o responda preguntas sobre capturas en una estacion de trabajo con GPU de consumo.
- Analisis de documentos con imagenes en entornos aislados: al ejecutarse con llama.cpp u Ollama sin conexion, encaja en flujos donde no se permite enviar datos a APIs externas.
- Generacion de texto creativo sin restricciones tematicas: el ajuste "uncensored" lo hace adecuado para experimentacion con narrativa o guiones donde el modelo base rechazaria ciertos contenidos, siempre con revision humana posterior.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece desde Q2_K hasta Q8_0, lo que permite medir la degradacion de calidad (perplejidad, coherencia) segun el nivel de cuantizacion en un mismo modelo.
- Docencia y formacion en IA abierta: sirve para demostrar el ciclo completo de un modelo multimodal cuantizado, desde la descarga del GGUF hasta la inferencia con llama.cpp, en un portatil con GPU modesta usando Q3_K_M (6,2 GB) o IQ4_XS (6,8 GB).
- Pruebas de robustez y red teaming: util como sujeto de prueba para estudiar como responde un modelo sin alineamiento estricto ante prompts adversarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~4,9 GB; Q3_K_M ~6,2 GB; IQ4_XS ~6,8 GB; Q4_K_M ~7,5 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB; Q8_0 ~12,8 GB. Añadir ~0,3 GB si se carga el proyector multimodal mmproj-Q8_0.
- GPU recomendadas: para Q8_0, una RTX 4090 (24 GB) o A100/H100 deja margen sobrado para contexto largo; para Q4_K_M o Q5_K_M, una RTX 4070 Ti Super, RTX 4080 o RTX 3090 (16-24 GB) es suficiente; para Q3_K_M o IQ4_XS, una RTX 4060 Ti de 16 GB o una RTX 3060 de 12 GB resulta viable.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. En tarjetas de 8 GB conviene usar Q2_K o Q3_K_S y limitar la ventana de contexto; en 12 GB, Q4_K_M o Q5_K_S.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; el repositorio tambien declara compatibilidad con endpoints de inferencia. Para el modelo base en safetensors harian falta frameworks como transformers o vLLM, pero no se ofrece esa variante en este repo.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Gemma4-12B-Uncensored-GGUF (este) | 11,9 B | no disponible | Si (image-text-to-text) | gemma | Si, 11 cuantizaciones + mmproj |
| toandev/Gemma4-12B-Uncensored (base) | 11,9 B | no disponible | Si | gemma | No (safetensors) |
| Gemma 4 12B oficial de Google | ~12 B | no disponible | Si | gemma | Segun disponibilidad del autor |
| Otros ajustes "uncensored" de ~12 B en GGUF | variable | variable | variable | variable | Si |

La comparativa se limita a lo verificable en la informacion disponible; no se han localizado datos de rendimiento que permitan contrastar calidad entre estas variantes.

## Limitaciones y advertencias

- El ajuste "uncensored" implica que el modelo puede producir contenido que el Gemma 4 oficial rechazaria; no es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo elevado de alucinacion y de respuestas inseguras al haberse relajado el alineamiento; requiere validacion humana en cualquier uso productivo.
- La model card solo declara ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La licencia "gemma" impone las condiciones de uso de Google para la familia Gemma; es imprescindible revisarlas antes de un uso comercial, y el caracter "uncensored" puede entrar en conflicto con dichas condiciones.
- No hay informacion sobre sesgos evaluados, datos de entrenamiento ni proceso de ajuste fino, lo que dificulta la auditoria del modelo.
- La longitud de contexto no esta documentada; conviene asumir valores conservadores y probar antes de desplegar.
- El repositorio ocupa 83,7 GB por incluir todas las cuantizaciones; la descarga debe hacerse seleccionando el fichero concreto.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- El modelo base y esta cuantizacion tienen muy poca traccion (1 like, ~1.600 descargas), por lo que no hay comunidad que haya validado su comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma4-12B-Uncensored-GGUF
- Modelo base: https://huggingface.co/toandev/Gemma4-12B-Uncensored
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma4-12B-Uncensored-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma4-12B-Uncensored-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
