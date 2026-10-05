# Bur3hani/MuchKnow-Swahili-8B

## Resumen

MuchKnow-Swahili-8B es un modelo de lenguaje de 8.030.261.248 parametros publicado por Bur3hani para la plataforma MuchKnow y atribuido a BuruOps. Se trata de un ajuste fino sobre el modelo destilado deepseek-ai/DeepSeek-R1-Distill-Llama-8B, orientado a generacion de texto bilingue en kiswahili tanzano y en ingles. Su rasgo diferencial es la alineacion en tres registros del kiswahili: sanifu (estandar, segun criterios BAKITA), fasaha (refinado o literario) y cha mtaani (jerga urbana o sheng).

El modelo hereda de su base las capacidades de razonamiento matematico y logico que DeepSeek-R1 transfirio por destilacion a una arquitectura de 8B, y anade soporte nativo de code-switching entre ingles y kiswahili. Se distribuye en formato MLX con pesos safetensors, por lo que su ejecucion nativa esta pensada para Apple Silicon mediante la libreria mlx_lm, con licencia declarada MIT.

Su relevancia radica en ampliar la oferta de modelos abiertos con cobertura real de una lengua africana poco representada en los modelos comerciales, reutilizando un modelo de razonamiento ya destilado sin incrementar el numero de parametros. Como contrapartida, el repositorio no registra descargas ni likes, no publica resultados de benchmarks y no documenta la composicion del dataset de ajuste, por lo que su rendimiento no esta validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de DeepSeek-R1-Distill-Llama-8B; linaje Llama) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio; MLX permite cuantizacion de 4 y 8 bits, pero no se publican variantes cuantizadas |
| Idiomas soportados | Kiswahili (sw, registro tanzano) e ingles (en) |
| Licencia | MIT (segun la etiqueta del repositorio), con aviso de copyright de BuruOps y MuchKnow que reclama todos los derechos |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |
| Tamano del repositorio | 16,1 GB, coherente con pesos en bf16/fp16 (8,03B x 2 bytes) |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 4 de octubre de 2026 (metadatos atipicos) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de aproximadamente 8.000 millones de parametros, resultado de la destilacion de las capacidades de razonamiento de DeepSeek-R1 sobre una familia tipo Llama. El ajuste realizado por Bur3hani no modifica el tamano ni la topologia, sino que especializa el comportamiento linguistico del modelo hacia el kiswahili tanzano y el ingles, preservando las capacidades de razonamiento matematico y logico del modelo original, tal como declara el autor.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas, la proporción de datos por registro (sanifu, fasaha, cha mtaani) ni sobre si se emplearon tecnicas de alineacion como RLHF, DPO o SFT supervisado. Tampoco se documentan innovaciones tecnicas propias (atencion lineal, decodificacion especulativa, MoE o SSM). La unica capacidad diferencial descrita es la alineacion a tres registros del kiswahili y la comprension de entradas mixtas ingles-kiswahili.

En el plano practico, el prompt de ejemplo de la model card emplea un formato de instruccion generico ("Below is an instruction that describes a task..."), sin que se documente una plantilla de chat nativa propia ni el uso de tokens especiales de rol.

## Capacidades

- Generacion de texto conversacional en kiswahili tanzano y en ingles, con respuesta en el idioma preferido por el usuario.
- Code-switching nativo: comprende consultas en ingles, en kiswahili o mezcladas, y responde de forma coherente en entornos bilingues.
- Alineacion a tres registros del kiswahili: sanifu (formal y oficial), fasaha (literario y tecnico) y cha mtaani (jerga urbana de Dar es Salaam, Arusha, Mwanza y Dodoma).
- Razonamiento matematico y logico heredado por destilacion de DeepSeek-R1, en un modelo de 8B.
- Generacion de texto general: redaccion, resumen, explicacion de conceptos y respuesta a instrucciones.
- Ejecucion local en Apple Silicon mediante mlx_lm, sin necesidad de servidores remotos.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso con herramientas: no documentado.
- Vision, audio u otras modalidades: no soportadas (pipeline exclusivamente text-generation).
- Modo de razonamiento explicito: no documentado en esta model card, aunque el modelo base emplea tecnicas de razonamiento por destilacion.
- Cobertura de otros idiomas distintos de sw y en: no documentada.

## Casos de uso

- Atencion al cliente automatizada en Tanzania: el modelo puede gestionar conversaciones multi-turno en kiswahili e ingles, alternando registro formal (sanifu) en reclamaciones y registro informal (cha mtaani) en consultas cotidianas, lo que reduce la friccion con usuarios que mezclan ambos idiomas.
- Localizacion y traduccion sw-en: traduccion de documentacion de producto, interfaces y material de marketing entre ingles y kiswahili, con la ventaja de poder elegir el registro de salida segun el canal.
- Generacion de contenido para marketing y redes sociales: redaccion de copys en kiswahili cha mtaani para publicos urbanos y en kiswahili sanifu para comunicacion corporativa, manteniendo coherencia terminologica.
- Material educativo y editorial: produccion de textos escolares, resumenes y explicaciones en kiswahili sanifu conforme a estandares BAKITA, aprovechando las capacidades de razonamiento para asignaturas de matematicas y ciencias.
- Analisis de opinion y procesamiento de feedback: clasificacion y resumen de comentarios de clientes que llegan en sheng o en texto mixto, un tipo de entrada que los modelos entrenados solo en kiswahili formal suelen manejar mal.
- Asistentes embebidos en aplicaciones macOS o iOS: al distribuirse en formato MLX, puede integrarse como asistente local en dispositivos Apple Silicon, con los datos del usuario sin salir del equipo.
- Redaccion de correspondencia oficial y documentos legales o administrativos: uso del registro sanifu y fasaha para borradores de contratos, cartas institucionales y comunicados.
- Turismo y hospitalidad: chatbots de reservas y recomendaciones para visitantes que combinan frases en ingles con terminos locales en kiswahili o sheng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, GSM8K, HumanEval, Belebele, Flores-200 ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo. Las afirmaciones de rendimiento se limitan a descripciones cualitativas ("high-performance", "advanced reasoning") sin respaldo numerico, por lo que cualquier comparacion cuantitativa con alternativas carece de base verificable.

## Requisitos de hardware

- Peso de los pesos: 16,1 GB en el repositorio, consistente con precision bf16/fp16 para 8.030 millones de parametros.
- Memoria estimada en bf16: en torno a 17-18 GB de memoria unificada o VRAM, incluyendo pesos y overhead de cache KV con contextos moderados (estimacion derivada del tamano, no publicada por el autor).
- Memoria estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB.
- Memoria estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, aunque el repositorio no publica variantes cuantizadas y habria que generarlas con las herramientas de MLX.
- Apple Silicon: es la plataforma objetivo. Se recomienda un Mac con 32 GB de memoria unificada o mas para bf16; con 16 GB seria necesario cuantizar a 4 bits. El modelo funciona en chips de la familia M.
- GPU NVIDIA: el repositorio esta en formato MLX, por lo que no es ejecutable directamente en CUDA. Seria necesaria una conversion previa a safetensors de Transformers o a GGUF. Tras la conversion, una RTX 4090 (24 GB) podria ejecutar bf16 con contexto moderado, y A100 (40/80 GB) o H100 para despliegues con mayor concurrencia.
- Opciones de despliegue: mlx_lm y servidores compatibles con MLX en Apple Silicon. vLLM, llama.cpp, Ollama y TGI no son compatibles de forma directa con los pesos publicados; requieren conversion.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con certeza el modelo base. Los datos del resto de alternativas no constan en las fuentes consultadas y se marcan como no disponibles; no se han rellenado con estimaciones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| MuchKnow-Swahili-8B | 8.030.261.248 | No disponible | sw, en | MIT con aviso de copyright de BuruOps | MLX / safetensors en HuggingFace; 0 descargas, 0 likes |
| DeepSeek-R1-Distill-Llama-8B (base) | Aproximadamente 8B (el ajuste conserva el tamano) | No disponible | No disponible | La model card del ajuste la cita como Apache 2.0 / MIT, dato no verificado | safetensors en HuggingFace |
| Llama 3.1 8B Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Qwen2.5 7B Instruct | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

Diferencias cualitativas verificables: frente al modelo base, MuchKnow-Swahili-8B anade cobertura explicita del kiswahili en tres registros y soporte de code-switching, pero pierde alcance multilingue general y no documenta su contexto ni su dataset. Frente a alternativas generalistas del mismo orden de parametros, su ventaja declarada es la especializacion linguistica en Africa Oriental, no el rendimiento bruto, que no ha sido medido publicamente.

## Limitaciones y advertencias

- Ausencia total de validacion externa: el repositorio registra 0 descargas y 0 likes, y no hay evaluaciones de terceros.
- Sin resultados de benchmarks: no es posible verificar las afirmaciones de razonamiento avanzado ni comparar con alternativas de forma objetiva.
- Datos de entrenamiento no documentados: se desconoce el volumen, la procedencia y la composicion del corpus de ajuste, lo que impide evaluar sesgos, contaminacion o cobertura real de cada registro.
- Riesgo de alucinacion: es un modelo de 8B destilado, con la propension tipica a inventar datos factuales, citas y referencias, especialmente en dominios poco representados como legislacion tanzana o estadisticas locales.
- Sesgo regional: la especializacion declarada es el kiswahili de Tanzania; puede rendir peor con variedades de Kenia, Uganda, Republica Democratica del Congo o con kiswahili de comunidades diaspora.
- Conflicto de licencia: la etiqueta del repositorio indica MIT, mientras que la model card declara "All Rights Reserved" y copyright de BuruOps y MuchKnow. Esta contradiccion debe resolverse antes de cualquier uso comercial.
- Licencia del modelo base: la propia card la describe como "Apache 2.0 / MIT", una formulacion ambigua. Conviene verificar los terminos reales de DeepSeek-R1-Distill-Llama-8B y de su linaje Llama antes de desplegar en produccion.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- Formato limitante: los pesos estan en MLX, lo que restringe el despliegue a Apple Silicon salvo conversion manual a otros formatos, sin garantia de que el autor la mantenga.
- Metadatos atipicos: las fechas de creacion y actualizacion (4 de octubre de 2026) son incoherentes con un repositorio normal, lo que sugiere metadatos erroneos o generados automaticamente.
- Sin soporte documentado de tool calling ni de uso agentico, lo que descarta pipelines que dependan de function calling.
- Nombre de autor y modelo poco conocidos en el ecosistema: no hay publicaciones, papers ni comunidad asociada que permitan contrastar la calidad del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bur3hani/MuchKnow-Swahili-8B
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- BuruOps: https://buruops.com
- MuchKnow: https://muchknow.com
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
