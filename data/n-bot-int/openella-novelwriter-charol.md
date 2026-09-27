# N-Bot-Int/OpenElla-NovelWriter-Charol

## Resumen

OpenElla-NovelWriter-Charol es un modelo de generacion de texto de 8.030 millones de parametros (8,03 B) publicado por N-Bot-Int, orientado a roleplay y escritura creativa conversacional. Se trata de un derivado de Llama 3.1 8B-Instruct construido mediante un merge de cinco modelos con la tecnica `della_linear` de MergeKit, seguido de un ajuste supervisado (SFT) ligero sobre el dataset propietario N-Bot-Int/Propietary-Merging-Stepper-R1.

El problema que aborda es el de la coherencia en roleplay de largo recorrido: el autor parte de un merge previo (Burgendy) que presentaba una creatividad alta pero tendencia a controlar las respuestas del usuario ("god-modding"), y lo compensa mezclandolo con tres modelos de roleplay de referencia para Llama 3.1 8B (RPMax v1.2, Stheno v3.2 y Lumimaid v0.2). El resultado busca respuestas mas largas y coherentes, menor tendencia a decidir por el usuario y sensibilidad a las tarjetas de personaje.

Es relevante para quienes trabajan con personajes conversacionales o narrativa asistida sobre hardware modesto, ya que mantiene el tamano de 8 B de Llama 3.1 y una licencia AGPL-3.0. El autor lo presenta como su ultimo modelo basado en Llama antes de migrar a arquitecturas Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1 8B-Instruct) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo base Llama 3.1 8B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Llama 3.1 8B-Instruct. Su construccion tiene dos fases. En la primera se aplica un merge con MergeKit usando el metodo `della_linear`, partiendo del modelo base `meta-llama/Llama-3.1-8B-Instruct` y combinando cuatro contribuciones con densidades, epsilon y pesos distintos: OpenElla-NovelWriter-Burgendy (density 0,7, epsilon 0,1, weight 1,0), ArliAI/RPMax (density 0,5, epsilon 0,1, weight 0,25), Stheno v3.2 (density 0,5, epsilon 0,1, weight 0,15) y Lumimaid (density 0,5, epsilon 0,1, weight 0,10). El parametro `normalize` se fija en `false` y `lambda` en 1,0, y el tokenizador se toma de OpenElla-NovelWriter-Burgendy. Segun el autor, RPMax es el modelo donante con mayor peso porque comparte con Burgendy la longitud de respuesta por turno.

En la segunda fase se aplica un SFT de estabilizacion sobre el dataset N-Bot-Int/Propietary-Merging-Stepper-R1, con un learning rate bajo y un numero reducido de ejemplos. El autor reconoce explicitamente que no tiene certeza de que esta fase aportase valor y que la mantuvo en parte por inercia. El modelo se distribuye en `bfloat16`. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento explicito.

## Capacidades

- Generacion de texto creativo y narrativo en ingles, con enfasis en respuestas largas y detalladas.
- Roleplay conversacional multi-turno con sensibilidad a tarjetas de personaje (character card sensitivity).
- Menor tendencia al "god-modding" (control de las acciones del usuario) respecto a generaciones previas de la familia NovelWriter.
- Conocimiento de roleplay mas amplio que modelos anteriores del mismo autor, que estaban mas sobreajustados a escenarios concretos de entrenamiento.
- Capacidad de mantener conversaciones de chat generales, derivada del ajuste instructivo del modelo base.
- Idioma: unicamente ingles declarado.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Roleplay conversacional con personajes: el modelo mantiene el tono y los rasgos definidos en la tarjeta de personaje a lo largo de turnos sucesivos, lo que encaja en chatbots de compania o plataformas de RP interactivo.
- Escritura de ficcion asistida: se puede usar para generar escenas y dialogos largos en ingles, aprovechando su preferencia por respuestas extensas heredada de los modelos donantes.
- Prototipado de narrativa ramificada: al ser un modelo de 8 B desplegable en una sola GPU, permite iterar rapidamente sobre guiones y variantes de historia sin coste de API.
- Simulacion de personajes en videojuegos o experiencias interactivas: su tamano y su licencia AGPL-3.0 permiten integrarlo en un backend autoalojado.
- Generacion de dialogos para doblaje o localizacion creativa de contenido narrativo en ingles.
- Base para nuevos merges de la comunidad: al estar construido con `della_linear` y documentar su receta completa (densidades, epsilon, pesos), sirve como punto de partida para experimentos de merging.
- Ajuste fino adicional sobre dominios concretos (estilo, genero literario) partiendo de los pesos en formato transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay estandarizadas, y las comparaciones que ofrece el autor son cualitativas (longitud de respuesta, coherencia y menor god-modding) frente a sus propias generaciones anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16-18 GB solo para pesos, mas memoria para el contexto y el cache KV.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 9-10 GB; con cuantizacion de 4 bits, aproximadamente 5-6 GB (estimaciones genericas para un modelo denso de 8 B; el autor no publica cifras).
- GPU recomendadas: cabe en GPU de consumo como RTX 3090, RTX 4090 o RTX 4080 para cuantizaciones de 8 y 4 bits; en bfloat16 completo es comodo en A100 40 GB, H100 o L40S.
- Despliegue: al publicarse como transformers/safetensors y estar etiquetado con text-generation-inference, es compatible con TGI y con transformers; la conversion a GGUF para llama.cpp u Ollama no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rol en esta ficha |
|---|---|---|---|---|
| OpenElla-NovelWriter-Charol | 8,03 B | no disponible | AGPL-3.0 | Modelo analizado |
| ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.2 | 8 B (aprox.) | no disponible | no disponible | Modelo donante de mayor peso (weight 0,25) |
| Sao10K/L3-8B-Stheno-v3.2 | 8 B (aprox.) | no disponible | no disponible | Modelo donante (weight 0,15) |
| NeverSleep/Lumimaid-v0.2-8B | 8 B (aprox.) | no disponible | no disponible | Modelo donante (weight 0,10) |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128.000 tokens (segun su model card oficial) | Llama 3.1 Community License | Modelo base del merge |

No se dispone de datos de rendimiento comparado para estas alternativas dentro de la informacion proporcionada; la comparativa se limita a la relacion estructural (modelo base y donantes) y a las licencias declaradas.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado principalmente para roleplay y con datos de ficcion, puede reproducir estereotipos propios de ese material.
- Alucinacion: es un modelo orientado a escritura creativa, no a precision factual; no debe usarse como fuente de informacion verificada.
- Idioma: solo se declara soporte de ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: no se especifica la longitud de contexto efectiva tras el merge y el SFT; conviene validarla antes de desplegarlo en produccion con conversaciones largas.
- Tendencia al god-modding: aunque el autor afirma que se ha reducido respecto a Burgendy, sigue siendo un riesgo en roleplay y puede requerir instrucciones de sistema que lo limiten.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Si el modelo se ofrece como servicio en red, la AGPL obliga a poner a disposicion el codigo fuente de la aplicacion; conviene revisar el cumplimiento antes de un uso comercial cerrado.
- Proceso de entrenamiento poco verificable: la fase de estabilizacion se describe como de valor incierto por el propio autor, y no hay evaluaciones cuantitativas que respalden las mejoras declaradas.
- Estado del proyecto: el modelo se presenta como el ultimo basado en Llama del autor, que anuncia una migracion a Qwen, por lo que el soporte y las actualizaciones futuras de esta linea pueden ser limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-Charol
- Dataset de estabilizacion: https://huggingface.co/datasets/N-Bot-Int/Propietary-Merging-Stepper-R1
- Modelo base del merge: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo donante (mayor peso): https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.2
- Modelo donante: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Modelo donante: https://huggingface.co/NeverSleep/Lumimaid-v0.2-8B
- Modelo predecesor citado por el autor: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-8B-merged
- Modelo predecesor citado por el autor: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-8B-V2-merged
- MergeKit (herramienta de merging): https://github.com/arcee-ai/mergekit
- Pagina de soporte del autor (Ko-fi): https://ko-fi.com/J3J61D8NHV
