# mradermacher/XtraGPT-14B-GGUF

## Resumen

XtraGPT-14B-GGUF es la versión cuantizada en formato GGUF del modelo XtraGPT-14B, desarrollado originalmente por Xtra-Computing y convertida por el usuario mradermacher. Se trata de un modelo de lenguaje conversacional de aproximadamente 14.660 millones de parámetros, orientado a tareas de chat multilingüe con soporte declarado para trece idiomas, entre ellos el castellano, el inglés, el chino, el francés, el alemán, el japonés, el coreano, el árabe o el tailandés, entre otros.

El repositorio no incluye información detallada sobre la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks del modelo base; la model card se limita a describir el proceso de cuantización y a listar los ficheros GGUF disponibles. La relevancia de esta publicación radica en que facilita el despliegue del modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles, ofreciendo cuantizaciones desde Q2_K (5,6 GB) hasta Q8_0 (15,7 GB).

La licencia es MG0-2.0, una licencia personalizada del proyecto ModelGo de Xtra-Computing, por lo que conviene revisar sus términos antes de un uso comercial. El modelo está etiquetado como conversacional y compatible con endpoints, lo que sugiere su uso previsto en asistentes y aplicaciones de chat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalle publicado) |
| Parámetros totales | 14.659.507.200 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | MG0-2.0 (licencia personalizada de ModelGo) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible la arquitectura concreta del modelo base XtraGPT-14B: no consta el tipo de transformer, el esquema de atención, la composición del dataset ni el volumen de tokens de entrenamiento. Tampoco hay datos sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada, ni sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

Lo único documentado es el proceso de cuantización realizado por mradermacher: se generaron cuantizaciones estáticas en formato GGUF a partir del modelo en formato Hugging Face (convert_type: hf), con la particularidad de que la generación de cuantizaciones imatrix falló por un segmentation fault, según indica la propia model card. Por tanto, todas las cuantizaciones disponibles son estáticas y no imatrix.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "chat" del repositorio.
- Soporte multilingüe declarado para trece idiomas: chino, inglés, francés, castellano, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite su despliegue en infraestructuras de inferencia compatibles con la API de Hugging Face.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- No se especifican capacidades de generación de código o matemáticas más allá de lo que un modelo conversacional general puede ofrecer.

## Casos de uso

- Asistentes conversacionales multilingües: el modelo puede gestionar diálogos en castellano y otros doce idiomas, lo que lo hace adecuado para aplicaciones de atención al cliente con usuarios de distintas regiones, siempre que se valide la calidad real en cada idioma.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_S (8,5 GB) y Q4_K_M (9,2 GB), puede ejecutarse en GPUs de consumo con 12-16 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipos locales sin infraestructura cloud.
- Chatbot interno para empresas: la versión Q8_0 (15,7 GB) permite un despliegue en una única GPU de 24 GB con la máxima calidad de cuantización disponible, útil para asistentes de documentación interna.
- Investigación y evaluación de modelos: al ser una cuantización GGUF de un modelo poco documentado, resulta útil para estudiar el impacto de la cuantización en la calidad conversacional y comparar con el modelo base en safetensors.
- Aplicaciones de escritorio y edge computing: las cuantizaciones Q2_K (5,6 GB) y Q3_K_S (6,6 GB) permiten ejecutar el modelo en equipos con recursos muy limitados, aunque con pérdida de calidad esperable.
- Traducción y asistencia lingüística entre los idiomas soportados: el soporte declarado de trece idiomas permite usarlo como base para tareas de traducción o reescritura, previa validación empírica de la calidad por par de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~5,6 GB; Q3_K_S ~6,6 GB; Q3_K_M ~7,5 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,1 GB; Q4_K_S ~8,5 GB; Q4_K_M ~9,2 GB; Q5_K_S ~10,3 GB; Q5_K_M ~10,7 GB; Q6_K ~12,1 GB; Q8_0 ~15,7 GB (tamaños de fichero; la VRAM real requerida es algo superior por el contexto y el overhead).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_S y Q5_K_S; A100/H100 para despliegues de alta concurrencia con vLLM o TGI (aunque el formato GGUF está más orientado a llama.cpp).
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en GPUs de 8-12 GB, y hasta Q8_0 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XtraGPT-14B-GGUF | 14,66 B | no disponible | MG0-2.0 | GGUF | Cuantizaciones estáticas, 13 idiomas |
| XtraGPT-3B-GGUF | ~3 B (no confirmado) | no disponible | MG0-2.0 | GGUF | Versión menor del mismo proyecto, misma familia |
| SecGPT-14B-GGUF | ~14 B (no confirmado) | no disponible | Apache-2.0 | GGUF | Modelo de seguridad en chino del mismo cuantizador, licencia más permisiva |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo base; al ser un modelo multilingüe entrenado con datos desconocidos, es probable que herede sesgos de sus corpus, pero no se puede cuantificar.
- Riesgo de alucinación no evaluado: no se han publicado evaluaciones de fidelidad ni de tasa de alucinación.
- La longitud de contexto no está documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- La licencia MG0-2.0 es personalizada y distinta de las licencias estándar (Apache-2.0, MIT); es imprescindible revisar sus términos antes de cualquier uso comercial.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- No se generaron cuantizaciones imatrix por un fallo de segmentación durante el proceso, por lo que no hay variantes IQ de alta calidad más allá de IQ4_XS.
- El repositorio tiene muy pocas descargas (221) y cero likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/XtraGPT-14B-GGUF
- Modelo base: https://huggingface.co/Xtra-Computing/XtraGPT-14B
- Página de descargas del cuantizador: https://hf.tst.eu/model#XtraGPT-14B-GGUF
- Licencia MG0-2.0: https://github.com/Xtra-Computing/ModelGo/blob/main/MG_licenses/V2/MG0-2.0.txt
- Repositorio ModelGo: https://github.com/Xtra-Computing/ModelGo
- Versión menor de la familia: https://huggingface.co/mradermacher/XtraGPT-3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
