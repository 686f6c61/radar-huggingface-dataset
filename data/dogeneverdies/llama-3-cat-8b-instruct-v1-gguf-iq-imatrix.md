# DogeNeverDies/llama-3-cat-8b-instruct-v1-GGUF-IQ-Imatrix

## Resumen

Llama-3-cat-8b-instruct-v1-GGUF-IQ-Imatrix es un conjunto de cuantizaciones en formato GGUF del modelo TheSkullery/llama-3-cat-8b-instruct-v1, un ajuste fino de Meta Llama 3 de 8.000 millones de parametros (8.030.261.248 parametros segun los pesos originales en safetensors). El modelo base fue entrenado por Dr. Kal'tsit (dataset), SteelSkull (entrenamiento y financiacion) y Potatooff, y esta orientado a fidelidad extrema al system prompt, inmersion de personaje para roleplay y utilidad en respuestas de caracter general y biosanitario. La version publicada bajo el identificador DogeNeverDies es una conversion a GGUF con calibracion imatrix, generada a partir de los pesos FP16 y BF16 del modelo original.

El modelo resuelve el caso de uso de generacion de texto conversacional con enfasis en roleplay y adherencia a instrucciones de sistema, algo especialmente relevante para aplicaciones de personajes interactivos desplegadas en local (SillyTavern, KoboldCpp). Su arquitectura es un transformer decoder-only denso de tipo Llama 3, con un tamano de 8B parametros y una ventana de contexto nominal de 8192 tokens en el modelo base, aunque el autor de la cuantizacion recomienda hasta 12288 tokens de contexto con el quant Q4_K_M-imat en GPU de 8 GB de VRAM.

La relevancia actual de esta ficha es doble: por un lado, documenta una variante de rol concreta y poco conocida (0 descargas y 0 likes en el repositorio de DogeNeverDies en el momento de la consulta, frente a las 77 descargas y 17 likes registradas en el repositorio espejo de Lewdiculous); por otro, sirve como ejemplo de publicacion de cuantizaciones IQ con imatrix, una practica extendida para reducir requisitos de VRAM en inferencia local. No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3) |
| Parametros totales | 8.030.261.248 (8B) |
| Longitud de contexto | 8192 tokens en el modelo base; el autor de la cuantizacion recomienda hasta 12288 tokens con Q4_K_M-imat |
| Tipos de cuantizacion | GGUF de tipo IQ con calibracion imatrix, incluyendo Q4_K_M-imat (4,89 BPW) mencionada explicitamente en la model card |
| Idiomas soportados | No disponibles en la model card del ajuste; el modelo base Llama 3 declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | apache-2.0 (segun etiquetas del repositorio) |
| Formato de pesos | GGUF (repo de 56,0 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

La arquitectura corresponde al transformer decoder-only de Llama 3 en su variante de 8B parametros, con atencion causal y tokenizador de Llama 3. Sobre este modelo base se aplico un ajuste fino supervisado orientado a cuatro objetivos declarados en la model card: fidelidad a las instrucciones de sistema, razonamiento encadenado (chain of thought), inmersion de personaje y utilidad en ciencias biologicas y ciencia general. El entrenamiento se realizo durante 6 dias sobre una unica GPU A100, con 4 epochs.

Respecto a los datos, la model card indica que se extrajeron pares instruccion-respuesta de un dataset de HuggingFace y se entreno un modelo GPT exclusivamente con respuestas de alta calidad para usarlo como modelo de referencia en el filtrado. El dataset se filtro adicionalmente por longitud y por presencia de respuestas con chain of thought (todas las respuestas COT son de mas de 50 tokens en un solo turno). Tambien se incorporaron datos sanitarios procedentes de Chat Doctor, favoreciendo diagnosticos detallados y paso a paso (tareas de mas de 100 tokens, con picos de 450 tokens por turno). No se especifica en la informacion disponible si hubo fases de RLHF o DPO; el proceso descrito es un ajuste fino supervisado. La cuantizacion GGUF con imatrix se genero a partir del modelo FP16 y conversiones del BF16, y es compatible con la correccion introducida en llama.cpp/pull/6920, por lo que requiere KoboldCpp 1.64 o superior. La model card etiqueta el modelo como "multimodal", pero no se aporta ninguna evidencia tecnica de soporte de vision o audio, por lo que debe considerarse una etiqueta no verificada.

## Capacidades

- Generacion de texto conversacional multi-turno con Llama 3 como formato de prompt nativo.
- Fidelidad alta al system prompt, objetivo explicito del ajuste fino.
- Razonamiento encadenado (chain of thought): el dataset de entrenamiento se filtro especificamente para priorizar respuestas COT de mas de 50 tokens.
- Inmersion de personaje para roleplay y narrativa interactiva, con presets de SillyTavern recomendados por el autor.
- Respuestas orientadas a ciencia general y biosanitaria, con datos de Chat Doctor y enfasis en diagnosticos paso a paso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el entrenamiento en COT sugiere cierta capacidad de razonamiento secuencial no cuantificada.
- Capacidades multilingues: no documentadas para el ajuste; heredadas solo de forma potencial del modelo base Llama 3.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay interactivo en local con SillyTavern: el modelo esta ajustado especificamente para inmersion de personaje y respeto al system prompt, y el autor distribuye presets compatibles, por lo que es adecuado para sesiones de narrativa conversacional en equipos de consumo.
- Personajes virtuales con personalidad persistente: la fidelidad extrema al system prompt permite definir reglas de comportamiento y mantenerlas a lo largo de conversaciones multi-turno de hasta 8192 tokens.
- Asistente conversacional en ciencia general y biologia: el ajuste incorpora datos filtrados de biologia y ciencia general, lo que permite usarlo como apoyo para explicaciones didacticas y respuestas estructuradas.
- Simulacion de dialogos con pacientes o escenarios clinicos educativos: los datos de Chat Doctor con diagnosticos paso a paso permiten generar respuestas estructuradas en contextos de formacion sanitaria, siempre con supervision humana.
- Prototipado de agentes conversacionales en un solo equipo de 8 GB de VRAM: con el quant Q4_K_M-imat (4,89 BPW) y hasta 12288 tokens de contexto, es posible ejecutar el modelo en una GPU de gama de consumo como la RTX 3060 Ti / 4060 Ti de 8 GB.
- Generacion de narrativa asistida y escritura creativa: la orientacion a inmersion de personaje y COT lo hace util para generar tramas coherentes con continuidad de personaje, aunque sin garantias de calidad literaria.
- Despliegue en entornos sin conexion: al ser un GGUF autocontenido y de licencia apache-2.0, puede ejecutarse completamente offline con KoboldCpp o llama.cpp, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe objetivos de entrenamiento (fidelidad al system prompt, COT, inmersion de personaje, utilidad cientifica) pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. El repositorio de DogeNeverDies registra 0 descargas y 0 likes en el momento de la consulta; el repositorio espejo de Lewdiculous acumula 77 descargas y 17 likes, y el agregador local-ai-zone indica un tamano de archivo de 4,72 GB para una de las variantes cuantizadas. Estos datos de popularidad no son indicadores de rendimiento tecnico.

## Requisitos de hardware

- VRAM estimada: el quant Q4_K_M-imat ocupa aproximadamente 4,9 GB en disco (4,89 BPW sobre 8,03B parametros) y el autor lo recomienda para GPU de 8 GB de VRAM con contextos de hasta 12288 tokens.
- GPU recomendadas para el quant de 4 bits: RTX 3060 Ti, RTX 4060 Ti, RTX 3070 o cualquier GPU con 8 GB de VRAM o mas.
- GPU para cuantizaciones de mayor precision (Q6_K, Q8_0): requiere 8-10 GB de VRAM en adelante; para FP16 completo se necesitan alrededor de 16 GB.
- Cabe en GPU de consumo: si, en GPUs de 8 GB con el quant Q4_K_M-imat; en GPUs de 6 GB probablemente solo con quants IQ de 1-3 bits.
- Opciones de despliegue: KoboldCpp 1.64 o superior (requisito explicito del autor por la correccion de llama.cpp/pull/6920), llama.cpp, y cualquier runtime compatible con GGUF. La model card no menciona vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-cat-8b-instruct-v1 (este, cuantizado GGUF) | 8,03B | 8192 tokens (12288 recomendado con Q4_K_M-imat) | Roleplay, fidelidad a system prompt, COT, ciencia | apache-2.0 | GGUF en HuggingFace |
| Meta-Llama-3-8B-Instruct | 8B | 8192 tokens | Asistente generalista | Meta Llama 3 Community License | safetensors, GGUF, NGC |
| Cat-Llama-3-70B-instruct | 70B | 8192 tokens | Roleplay, fidelidad a system prompt, COT | No disponible en la informacion proporcionada | HuggingFace (publicado por Turboderp) |

La comparativa con Meta-Llama-3-8B-Instruct es directa porque el modelo aqui descrito es un ajuste fino sobre esa misma base: comparte arquitectura, tokenizador y ventana de contexto nominal, pero difiere en el objetivo de entrenamiento (roleplay y adherencia al system prompt frente a asistencia general). Cat-Llama-3-70B-instruct es la variante de mayor tamano del mismo linaje, entrenada por el mismo equipo de dataset, y ofrece presumiblemente mayor calidad a cambio de requisitos de hardware muy superiores. No se dispone de datos de benchmark para ninguna de las tres variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a la base Llama 3 8B Instruct ni frente a otros ajustes de rol.
- Riesgo de alucinacion: como cualquier modelo de 8B, puede generar informacion factual incorrecta, especialmente en dominios cientificos y sanitarios donde fue ajustado con datos de Chat Doctor.
- Riesgo sanitario: el entrenamiento con datos de diagnostico medico puede producir respuestas que parezcan consejo clinico sin serlo; no debe usarse para diagnostico real ni sustituir a profesionales.
- Etiqueta "multimodal" no verificada: la model card incluye esa etiqueta en el encabezado, pero no documenta ningun componente de vision o audio; se recomienda tratarla como error de etiquetado.
- Idiomas no documentados: el ajuste fino no declara idiomas soportados; el comportamiento fuera del ingles puede degradarse aunque el modelo base Llama 3 declare soporte multilingue.
- Ventana de contexto limitada: 8192 tokens nativos, con 12288 recomendados como maximo practico bajo el quant Q4_K_M-imat; contextos mayores pueden degradar la coherencia.
- Licencia: el repositorio declara apache-2.0, pero al derivar de Meta Llama 3 podrian aplicar restricciones adicionales de la Meta Llama 3 Community License y su politica de uso aceptable; conviene revisar los terminos antes de un uso comercial.
- Orientacion a contenido de rol: el ecosistema asociado (SillyTavern, presets de Lewdiculous) esta vinculado a comunidades de roleplay que en ocasiones incluyen contenido para adultos; el despliegue en entornos profesionales requiere filtrado adicional.
- Compatibilidad de runtime: requiere KoboldCpp 1.64 o superior por la correccion de llama.cpp/pull/6920; versiones antiguas pueden producir resultados incorrectos con estos quants.
- Repositorio con 0 descargas y 0 likes: la version de DogeNeverDies no tiene traccion ni validacion por parte de la comunidad, a diferencia del espejo de Lewdiculous.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/DogeNeverDies/llama-3-cat-8b-instruct-v1-GGUF-IQ-Imatrix
- Modelo original (TheSkullery): https://huggingface.co/TheSkullery/llama-3-cat-8b-instruct-v1
- Repositorio espejo de cuantizaciones (Lewdiculous): https://huggingface.co/Lewdiculous/llama-3-cat-8b-instruct-v1-GGUF-IQ-Imatrix
- Cuantizaciones de bartowski: https://huggingface.co/bartowski/llama-3-cat-8b-instruct-v1-GGUF
- Variante de 70B (Cat-Llama-3-70B-instruct, publicado por Turboderp): https://huggingface.co/turboderp/Cat-Llama-3-70B-instruct
- Presets de SillyTavern recomendados: https://huggingface.co/Virt-io/SillyTavern-Presets
- Pull request de llama.cpp con la correccion relevante: https://github.com/ggerganov/llama.cpp/pull/6920
- Pagina en local-ai-zone: https://local-ai-zone.github.io/models/llama-3-cat-8b-instruct-v1-gguf-iq-imatrix.html
- Apoyo al autor (Ko-fi): https://ko-fi.com/Lewdiculous
- Repositorio de Llama 3 en GitHub: https://github.com/GargTanya/llama3-instruct
- Llama3-8B Instruct Int4 en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/llama3-8b-instruct
