# mradermacher/Mistral-7B-Instruct-v0.3-Malevolent-GGUF

## Resumen

Mistral-7B-Instruct-v0.3-Malevolent-GGUF es una cuantizacion estatica en formato GGUF del modelo Osye/Mistral-7B-Instruct-v0.3-Malevolent, publicada por el usuario mradermacher. El modelo base deriva de Mistral-7B-Instruct-v0.3 de Mistral AI, un transformer denso de 7.248.351.232 parametros afinado para instrucciones. La variante "Malevolent" es un ajuste de personalidad orientado a investigacion en interpretabilidad y estudio de personas en modelos de lenguaje, segun las etiquetas de la model card.

El interes practico de esta publicacion es la disponibilidad de pesos en GGUF en once niveles de cuantizacion distintos, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama. El repositorio ocupa 64,0 GB en total y la licencia declarada es Apache 2.0.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin resultados de benchmarks publicados. Su uso previsto no es produccion general, sino experimentacion controlada sobre comportamiento de persona y sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.351.232 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 7.248.351.232 parametros heredado de Mistral-7B-Instruct-v0.3. La model card del repositorio cuantizado no detalla la composicion del dataset de ajuste fino ni el proceso de alineamiento (RLHF, DPO u otros) aplicado por Osye para producir la variante Malevolent; esa informacion no esta disponible en el material proporcionado. Las etiquetas indican que el ajuste persigue un objetivo de persona e interpretabilidad, no una mejora de capacidades generales.

La aportacion tecnica de esta publicacion es exclusivamente la cuantizacion. mradermacher indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion. No se documentan innovaciones arquitectonicas adicionales, decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones de Mistral-7B-Instruct-v0.3.
- Ajuste de persona orientado a investigacion en interpretabilidad y estudio de comportamientos sesgados o adversarios.
- Conversacion multi-turno mediante plantilla de chat del modelo base (etiqueta conversational).
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue en infraestructura de inferencia.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad de personas: el modelo permite estudiar como un ajuste de personalidad concreto altera las respuestas en tareas controladas, comparando con el Mistral-7B-Instruct-v0.3 original.
- Analisis de sesgos y seguridad: util para construir conjuntos de evaluacion de comportamiento adversario y medir la eficacia de filtros o clasificadores de contenido.
- Experimentos de red teaming en local: las cuantizaciones Q4_K_S y Q4_K_M (4,2 y 4,5 GB) permiten ejecutar el modelo en una unica GPU de consumo sin depender de servicios externos.
- Docencia y formacion en alineamiento: sirve como ejemplo practico de ajuste de persona y de sus riesgos, con pesos abiertos y licencia Apache 2.0.
- Pruebas de pipelines de inferencia GGUF: util para validar el comportamiento de llama.cpp, Ollama o servidores compatibles con distintos niveles de cuantizacion antes de desplegar otros modelos.
- Evaluacion comparativa de cuantizaciones: los once niveles publicados permiten medir la degradacion de calidad (perplejidad, coherencia) entre Q2_K y Q8_0 sobre el mismo ajuste.
- Generacion de texto creativo en ingles con tono controlado: aplicable en entornos de investigacion sobre estilo y voz narrativa, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con Q2_K, 4-5 GB con Q4_K_M, 6-7 GB con Q6_K y 8-9 GB con Q8_0, considerando pesos mas cache KV para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para cuantizaciones altas; A100 o H100 solo si se requiere alto throughput concurrente.
- Cabe en GPU de consumo: si, desde GPUs de 6-8 GB con cuantizaciones Q3_K o Q4_K; las variantes Q6_K y Q8_0 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (etiqueta endpoints_compatible) y, para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3-Malevolent-GGUF (este) | 7,25 B | no disponible | Apache 2.0 | GGUF | Ajuste de persona para investigacion, solo ingles |
| Mistral-7B-Instruct-v0.3 (Mistral AI) | 7,25 B | 32.768 tokens (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Modelo general de instrucciones, multilingue |
| Osye/Mistral-7B-Instruct-v0.3-Malevolent | 7,25 B | no disponible | Apache 2.0 | safetensors | Modelo base de este cuantizado, sin cuantizar |
| Mistral-7B-Instruct-v0.3 cuantizado por TheBloke | 7,25 B | 32.768 tokens | Apache 2.0 | GGUF | Alternativa de cuantizacion del modelo original sin ajuste de persona |

## Limitaciones y advertencias

- El ajuste de persona "Malevolent" esta disenado para generar comportamiento adversario o sesgado; no debe desplegarse en atencion al cliente ni en aplicaciones de cara al publico sin filtros y supervision.
- Riesgo elevado de contenido toxico, manipulador o inseguro por diseno del ajuste; requiere moderacion en cualquier uso.
- Riesgo de alucinacion propio de un modelo de 7 B, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- Soporte limitado al ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La longitud de contexto no se especifica en la informacion proporcionada; no debe asumirse la ventana del modelo base sin verificacion.
- Las cuantizaciones Q2_K y Q3_K degradan la calidad de forma notable; para investigacion seria se recomienda Q5_K_M o superior.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el contenido generado puede infringir politicas de plataforma o normativa sobre contenido danino; la responsabilidad recae en el desplegador.
- Modelo con cero descargas y sin validacion comunitaria: no hay evidencia publica de su comportamiento real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.3-Malevolent-GGUF
- Modelo base: https://huggingface.co/Osye/Mistral-7B-Instruct-v0.3-Malevolent
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-7B-Instruct-v0.3-Malevolent-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
