# RepublicOfKorokke/rune-26b-a4b-GGUF-oQ4e-fp16

## Resumen

Rune 26B A4B es un modelo de decision multimodal desarrollado por Invergent y mantenido por Surogate. A diferencia de un modelo generativo convencional, Rune recibe un estado (texto, datos estructurados o una imagen junto con texto), una pregunta y un conjunto de opciones candidatas, y devuelve en una sola pasada hacia delante una decision junto con una probabilidad calibrada para cada opcion. Sus pesos son abiertos.

La ficha que nos ocupa, `RepublicOfKorokke/rune-26b-a4b-GGUF-oQ4e-fp16`, no es el modelo original, sino una version cuantizada del mismo. El autor, RepublicOfKorokke, ha aplicado cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.0), a 4 bits y con un group size de 64, empaquetando el resultado en el formato safetensors de MLX. El modelo base declarado en la model card es de tipo `gemma4`.

Se trata de un modelo grande para ejecucion local: el repositorio de pesos ocupa 17,0 GB y contiene 25.805.936.206 parametros totales (unos 25,8B). El sufijo «a4b» del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4B parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. Su relevancia actual radica en que permite desplegar localmente, sobre hardware Apple Silicon, un modelo de decision con probabilidades calibradas, algo poco habitual en el ecosistema de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipo Gemma 4 (segun model card); el sufijo «a4b» sugiere mezcla de expertos (MoE), sin confirmar |
| Parametros totales | 25.805.936.206 (~25,8B) |
| Parametros activos | no disponible (el sufijo «a4b» del nombre sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de precision mixta, 4 bits, group size 64, fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (pese a que el nombre del repositorio incluye «GGUF») |
| Tamano del repositorio | 17,0 GB |
| Herramienta de cuantizacion | oQ / oMLX v0.7.0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO, etc.). La model card unicamente documenta el proceso de cuantizacion, no el entrenamiento. Lo que si se conoce es que la arquitectura base es de tipo `gemma4`, y que el nombre «26b-a4b» apunta a un diseno de mezcla de expertos con 26B parametros totales y alrededor de 4B activos, una convencion habitual en los modelos MoE de la familia Gemma. Esta interpretacion no esta confirmada de forma explicita.

La innovacion tecnica de esta version concreta reside en la cuantizacion: se ha empleado oQ (oMLX v0.7.0), una tecnica de precision mixta que asigna distintos numeros de bits a distintas capas en funcion de su sensibilidad, en lugar de aplicar una cuantizacion uniforme. El resultado son pesos de 4 bits con group size 64 en formato safetensors de MLX, optimizados para el framework MLX de Apple. Cabe senalar una discrepancia relevante: el nombre del repositorio indica «GGUF», pero el formato real de los pesos es safetensors de MLX, por lo que no es directamente compatible con el ecosistema llama.cpp/GGUF pese a lo que sugiere el titulo.

## Capacidades

- Decision multimodal: recibe un estado (texto, datos estructurados o imagen con texto), una pregunta y un conjunto de opciones candidatas, y devuelve una decision en una sola pasada hacia delante.
- Probabilidades calibradas: para cada opcion candidata el modelo produce una probabilidad, lo que permite umbralizar decisiones y detectar casos de baja confianza.
- Procesamiento de imagenes: la capacidad multimodal incluye entradas de imagen combinadas con texto.
- Procesamiento de datos estructurados: admite estados en formato estructurado ademas de texto libre.
- Inferencia en una sola pasada: la decision y las probabilidades se obtienen en un unico forward pass, sin necesidad de muestreo autoregresivo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo «thinking»: no disponible.

## Casos de uso

- Enrutamiento de consultas en atencion al cliente: dado un mensaje de usuario y un conjunto de departamentos o categorias posibles, el modelo devuelve a que cola derivar la consulta junto con la probabilidad de cada opcion, lo que permite desviar a revision humana los casos de baja confianza.
- Moderacion de contenido con umbral configurable: ante un texto o una imagen, el modelo evalua opciones como «permitir», «revisar» o «bloquear» y entrega una probabilidad por categoria, lo que facilita fijar el umbral de actuacion segun la politica de la plataforma.
- Triage clinico asistido (no diagnostico): ante una descripcion de sintomas y una lista de niveles de urgencia, el modelo asigna probabilidades a cada nivel, aportando una senal cuantificada que el personal sanitario puede usar como apoyo, nunca como sustituto del juicio clinico.
- Clasificacion de documentos con justificacion probabilistica: a partir de un documento y un conjunto de etiquetas predefinidas, el modelo devuelve la etiqueta mas probable y la distribucion completa, util para pipelines de gestion documental que necesitan medir incertidumbre.
- Analisis de imagenes con decision binaria: ante una imagen mas una pregunta del tipo «¿el producto esta defectuoso?», el modelo entrega la decision y su probabilidad, aprovechable en control de calidad automatizado.
- Validacion de respuestas en sistemas RAG: dado un contexto recuperado y una afirmacion candidata, el modelo decide si la afirmacion esta respaldada por el contexto, con probabilidad asociada, para filtrar alucinaciones antes de mostrarlas al usuario.
- Seleccion entre candidatos generados: en una pipeline donde otro modelo produce varias respuestas, Rune puede puntuar cual es la mas adecuada segun un criterio dado, devolviendo una probabilidad por candidato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos ocupa 17,0 GB, por lo que se necesita al menos ese margen de memoria; en la practica se recomienda reservar 18-20 GB o mas para el modelo, mas overhead de activaciones y contexto.
- Al ser pesos en formato MLX, el destino natural es Apple Silicon con memoria unificada. Un equipo con 24 GB o mas de memoria unificada (por ejemplo, un Mac con chip M-series de gama alta) seria el minimo razonable; 32 GB o 64 GB dan mas margen para contexto largo.
- GPU dedicadas (NVIDIA, AMD): no compatibles de forma nativa con pesos MLX safetensors; requeririan conversion previa a otro formato.
- Cabe en GPU de consumo: no disponible (depende de la conversion de formato y de la cuantizacion final; en el formato actual esta orientado a memoria unificada de Apple Silicon).
- Opciones de despliegue: MLX (framework nativo de Apple). No es compatible directamente con vLLM, llama.cpp, Ollama o TGI en su formato actual, pese al «GGUF» del nombre.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rune-26b-a4b-GGUF-oQ4e-fp16 (este) | 25,8B totales (~4B activos, sin confirmar) | no disponible | MLX safetensors, 4 bits | no disponible | Cuantizacion oQ de precision mixta |
| gemma-4-26B-A4B-it-assistant-oQ6-fp16 | no disponible | no disponible | MLX safetensors, 6 bits | no disponible | Mismo autor, base Gemma 4 26B A4B, cuantizacion oQ a 6 bits |
| gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-fp16 | no disponible | no disponible | MLX safetensors | no disponible | Mismo autor, base Gemma 4 26B A4B con QAT |
| Rune 26B A4B (modelo base) | no disponible | no disponible | no disponible | pesos abiertos | Modelo de decision original de Invergent/Surogate |

## Limitaciones y advertencias

- Licencia no disponible: al no especificarse la licencia, no puede confirmarse que el uso comercial este permitido. Conviene verificar los terminos antes de cualquier despliegue en produccion.
- Discrepancia de formato: el nombre del repositorio indica «GGUF», pero los pesos son safetensors de MLX. Un usuario que espere un fichero GGUF compatible con llama.cpp u Ollama no podra cargarlo directamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, la componente de texto puede generar contenido incorrecto; en un modelo de decision, esto se traduce en probabilidades mal calibradas si la entrada se aleja de la distribucion de entrenamiento.
- Calibracion dependiente del dominio: las probabilidades calibradas son fiables solo en dominios similares a los de entrenamiento del modelo base; en dominios nuevos conviene recalibrar o validar con un conjunto de referencia.
- Idiomas soportados no declarados: no puede asegurarse un rendimiento correcto en castellano ni en otros idiomas distintos del ingles.
- Contexto maximo no documentado: se desconoce la longitud de contexto soportada, lo que limita la planificacion de casos con entradas largas.
- Ausencia total de benchmarks: no hay datos publicos de rendimiento en la informacion disponible, por lo que cualquier evaluacion debe hacerse por cuenta propia.
- Modelo derivado de otro: al ser una cuantizacion, hereda las limitaciones, sesgos y posibles restricciones del modelo base Rune.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RepublicOfKorokke/rune-26b-a4b-GGUF-oQ4e-fp16
- Repositorio relacionado (Gemma 4 26B A4B it qat q4_0 unquantized oQ4e fp16): https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-qat-q4_0-unquantized-oQ4e-fp16
- Repositorio relacionado (Gemma 4 26B A4B it assistant oQ6 fp16): https://huggingface.co/RepublicOfKorokke/gemma-4-26B-A4B-it-assistant-oQ6-fp16
- Perfil de GitHub del autor: https://github.com/RepublicOfKorokke
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pagina del modelo Rune en Surogate: https://surogate.ai/labs/rune/
- Ficha de Rune 26B A4B GGUF en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/rune-26b-a4b-gguf-surogate
