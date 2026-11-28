# mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF

## Resumen

Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF es una cuantizacion GGUF, generada con imatrix, del modelo richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic, que a su vez deriva del Qwen2.5-32B-Instruct de Alibaba. El autor de la cuantizacion es mradermacher, especialista en publicar versiones GGUF de modelos de la comunidad. El modelo base ha sido sometido a un proceso de "abliteration" o eliminacion de rechazos (refusal-removed), comercializado bajo la etiqueta "heretic", orientado a investigacion en seguridad de IA y red-teaming.

El modelo conserva la arquitectura transformer densa de Qwen2.5-32B-Instruct, con 32.763.876.352 parametros totales y una ventana de contexto de 131.072 tokens (segun las especificaciones de la familia Qwen2.5, aunque la model card de esta ficha no la detalla explicitamente). La relevancia actual radica en que ofrece una version sin censura de un modelo de 32B en formato GGUF, lo que permite ejecutarlo en hardware de consumo con cuantizaciones agresivas, algo impensable con los pesos originales en safetensors.

La licencia declarada es Apache 2.0, heredada del modelo Qwen original, aunque el acceso al modelo base en Hugging Face esta sujeto a un formulario de acceso restringido (gated) para investigacion. El repositorio contiene 22 variantes de cuantizacion, desde IQ1_S (7,4 GB) hasta Q6_K, lo que cubre un amplio espectro de recursos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; la familia Qwen2.5-32B-Instruct soporta 131.072 tokens |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (declarado); el modelo base Qwen2.5 soporta multiples idiomas, pero esta ficha solo declara en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B-Instruct: un transformer denso con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado por Alibaba sobre un corpus multilingue de varios billones de tokens. Sobre esa base, el autor richardyoung aplico una tecnica de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) para producir la variante MPOA-heretic, que elimina los comportamientos de negativa del modelo alineado original.

La cuantizacion de mradermacher utiliza el formato i1 con ficheros imatrix, que emplea una matriz de importancia calculada sobre un corpus de calibracion para minimizar la perdida de calidad en cuantizaciones bajas. El repositorio incluye el fichero imatrix (0,1 GB) por si el usuario quiere generar sus propias cuantizaciones. No se dispone de informacion sobre el dataset exacto de calibracion ni sobre el proceso de entrenamiento del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matematicas de nivel medio-alto, propio de un modelo de 32B.
- Generacion de codigo en multiples lenguajes, con soporte de instrucciones complejas.
- Respuestas sin rechazos (refusal-removed): el modelo no aplica las negativas de seguridad del modelo alineado original.
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado en esta variante).
- Capacidad multilingue del modelo base (Qwen2.5 soporta decenas de idiomas), aunque la model card solo declara ingles.
- Modo conversacional con plantilla de chat de Qwen2.5.
- No se declara soporte de vision ni audio en esta variante.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve para estudiar comportamientos sin alineacion y evaluar la eficacia de las tecnicas de abliteration, comparando respuestas con el Qwen2.5-32B-Instruct original.
- Red-teaming de sistemas: permite generar prompts adversarios y respuestas que un modelo censurado rechazaria, util para probar filtros y clasificadores de seguridad en pipelines de moderacion.
- Evaluacion de robustez de guardarrailes: al no tener rechazos, se puede usar como generador de casos limite para entrenar o validar clasificadores de contenido.
- Experimentacion personal en hardware de consumo: las cuantizaciones IQ2/IQ3 (9-15 GB) permiten ejecutar un modelo de 32B en GPUs de 12-24 GB con llama.cpp u Ollama, algo imposible con los pesos originales.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido editorial donde el modelo alineado aplicaria negativas por temas sensibles.
- Docencia y cursos sobre alineacion: permite demostrar en clase como funciona la eliminacion de rechazos y sus consecuencias, usando el fichero imatrix y las distintas cuantizaciones como material didactico.
- Analisis de sesgos y comportamientos emergentes: comparar las respuestas de la variante heretic con el modelo base para identificar que capacidades se degradan o se alteran tras la abliteration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: IQ1_S ~7,4 GB; IQ2_M ~11,4 GB; IQ3_M ~14,9 GB; IQ4_XS ~17,8 GB; Q4_K_M ~19-20 GB; Q5_K_M ~22-23 GB; Q6_K ~26-27 GB (los tamanos de fichero se aproximan a la VRAM necesaria, mas overhead de contexto).
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS a Q5_K_M; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para cuantizaciones altas o contexto largo; RTX 4060 Ti 16 GB para IQ3_M.
- Cabe en GPU de consumo: si, desde IQ1_S (7,4 GB, valido para GPUs de 8 GB) hasta Q5_K_M en GPUs de 24 GB. Las cuantizaciones IQ1 e IQ2 tienen calidad notablemente degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos motores habria que usar los safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF (este) | 32,8B | No disponible (base: 131.072) | GGUF i1 | Apache 2.0 | Sin rechazos, cuantizado con imatrix |
| Qwen2.5-32B-Instruct (original) | 32,8B | 131.072 | safetensors, GGUF | Apache 2.0 | Alineado, con rechazos |
| richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic | 32,8B | No disponible | safetensors | Apache 2.0 (gated) | Modelo base sin cuantizar, acceso restringido |
| mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF | 32,8B | No disponible | GGUF estatico | Apache 2.0 | Cuantizaciones sin imatrix del mismo modelo |

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: elimina los rechazos del Qwen2.5-32B-Instruct original, por lo que puede generar contenido danino, ilegal o eticamente problematico sin filtro.
- Acceso restringido en el modelo base: el repositorio richardyoung exige formulario gated con justificacion de uso; el acceso se revisa manualmente.
- Riesgo elevado de alucinacion: la abliteration puede degradar la coherencia y aumentar la generacion de informacion falsa, especialmente en cuantizaciones bajas (IQ1, IQ2).
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta verificado y puede ser inferior al del modelo base.
- Cuantizaciones muy agresivas: IQ1_S e IQ2_XXS tienen calidad notablemente reducida; el propio autor las etiqueta como "for the desperate".
- Licencia: Apache 2.0 permite uso comercial, pero el uso de un modelo sin rechazos en produccion conlleva responsabilidad legal y reputacional; se recomienda moderacion externa.
- Contexto: aunque la familia Qwen2.5 soporta 131.072 tokens, no se confirma en esta variante y las cuantizaciones bajas degradan el rendimiento en contextos largos.
- Sin garantias del autor de la cuantizacion sobre fidelidad respecto al modelo base.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Modelo base (richardyoung): https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-MPOA-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-32B-Instruct-MPOA-heretic-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen2.5-32B-Instruct-MPOA-heretic-i1-GGUF
- Modelo original Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- CV del autor del modelo base: https://cv.deepneuro.ai
- Perfil de richardyoung en Hugging Face: https://huggingface.co/richardyoung
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
