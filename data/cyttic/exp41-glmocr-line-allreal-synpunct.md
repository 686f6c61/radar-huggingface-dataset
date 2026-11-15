# cyttic/exp41-glmocr-line-allreal-synpunct

## Resumen
exp41-glmocr-line-allreal-synpunct es un ajuste fino (fine-tuning) del modelo zai-org/GLM-OCR, especializado en reconocimiento de texto manuscrito (HTR) y OCR a nivel de linea, con foco en hebreo y, en menor medida, ingles. Lo desarrolla el usuario cyttic y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. El modelo parte de GLM-OCR y se reentrena sobre un conjunto de datos compuesto por HHD, SCE, Pinkas, un 20% de digitos y puntuacion sinteticos y un 5% de lineas en ingles del corpus IAM.

La relevancia de este modelo radica en su especializacion: en lugar de ofrecer un OCR generico multilingue, se centra en lineas manuscritas en hebreo, un idioma con relativamente pocos recursos en el ecosistema OCR open source. La model card reporta un CER (Character Error Rate) de 0,0237 en la validacion de HHD y de 0,0203 en la validacion de IAM, lo que supone una mejora sustancial frente al modelo base en zero-shot para IAM (0,0390).

El repositorio ocupa 2,2 GB y contiene pesos en bf16 junto con el processor. No se especifican en la informacion disponible el numero de parametros, la longitud de contexto ni la arquitectura interna del modelo base, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-OCR de zai-org) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | he (hebreo), en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16), con processor incluido en `model/` |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base GLM-OCR (si es un transformer encoder-decoder, un modelo vision-language o una combinacion). El ajuste fino se realiza a nivel de linea: la entrada es la imagen de la linea manuscrita (sin espejar) redimensionada a 112 px de altura, y se utiliza el formato de chat propio de GLM-OCR con el prompt `Text Recognition:` seguido de ` thinking</think>\n`. La respuesta generada termina con el token `<|user|>`.

El conjunto de entrenamiento combina los corpus HHD, SCE y Pinkas, a los que se anaden un 20% de digitos y puntuacion sinteticos y un 5% de lineas en ingles del corpus IAM. No se especifican en la informacion disponible el numero de tokens, la composicion exacta de cada corpus ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Reconocimiento de texto manuscrito (HTR) a nivel de linea para hebreo.
- Reconocimiento de texto impreso o manuscrito en ingles (lineas del corpus IAM).
- Manejo de digitos y puntuacion, reforzado mediante datos sinteticos (20% del entrenamiento).
- Generacion de transcripcion de una linea de imagen mediante un prompt de chat especifico (`Text Recognition:`).
- Soporte limitado a dos idiomas: hebreo e ingles.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general (mas alla de OCR) ni audio en la informacion disponible.

## Casos de uso
- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de documentos historicos o contemporaneos, lo que resulta adecuado por su entrenamiento especifico en HHD, SCE y Pinkas.
- Procesamiento de documentos con digitos y puntuacion: gracias al 20% de datos sinteticos de digitos y puntuacion, es util en formularios, registros y tablas manuscritas donde estos caracteres son frecuentes.
- OCR de lineas en ingles en documentos escaneados: el ajuste con un 5% de IAM permite transcribir lineas en ingles con un CER de validacion de 0,0203.
- Pipeline de digitalizacion con segmentacion previa de lineas: el modelo opera a nivel de linea, por lo que se integraria tras un segmentador de lineas para procesar documentos completos.
- Investigacion en HTR para hebreo: sirve como punto de partida o baseline para experimentos academicos por su licencia MIT y su especializacion.
- Extraccion de texto en aplicaciones de archivo y biblioteca: util para proyectos de preservacion digital que necesiten transcribir manuscritos hebreos con licencia permisiva.
- Prototipado rapido en entornos con recursos limitados: el formato bf16 y el tamano del repositorio (2,2 GB) permiten desplegarlo en infraestructura moderada, aunque no se especifican requisitos exactos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HHD validation CER (greedy) | 0,0237 | Datos reportados en la model card |
| IAM validation CER | 0,0203 | Frente a 0,0390 en zero-shot del modelo base |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no son aplicables a un modelo de OCR/HTR.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio de 2,2 GB en bf16 sugiere que los pesos caben en GPUs con al menos 8-12 GB de VRAM, aunque no se confirma en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano del repositorio es plausible en GPUs consumer modernas, pero no se documenta.
- Opciones de despliegue: no se especifican en la informacion disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/exp41-glmocr-line-allreal-synpunct | no disponible | no disponible | he, en | MIT | Fine-tuning de GLM-OCR para HTR hebreo |
| zai-org/GLM-OCR (base) | no disponible | no disponible | no disponible | no disponible | Modelo base; CER IAM zero-shot 0,0390 |
| Otros modelos OCR/HTR | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria.

## Limitaciones y advertencias
- El modelo esta especializado en lineas manuscritas en hebreo e ingles; no se garantiza su rendimiento en otros idiomas.
- Opera a nivel de linea, por lo que requiere un paso previo de segmentacion para documentos completos.
- No se documentan sesgos conocidos, pero al entrenarse con corpus especificos (HHD, SCE, Pinkas, IAM) puede presentar sesgos hacia esos dominios y estilos de escritura.
- Riesgo de alucinacion en la transcripcion, especialmente en lineas con baja calidad de imagen o caracteres poco representados en el entrenamiento.
- La licencia MIT permite uso comercial, pero el modelo base GLM-OCR podria tener condiciones adicionales no reflejadas en la informacion disponible; conviene verificar la licencia del modelo base.
- No se documentan limitaciones de contexto ni requisitos de hardware, lo que dificulta planificar un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion externa por parte de la comunidad.

## Enlaces
- Hugging Face: https://huggingface.co/cyttic/exp41-glmocr-line-allreal-synpunct
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
