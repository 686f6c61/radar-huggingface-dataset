# fontlab/BananaMind-2-Pro-Preview-Chat-ternary

## Resumen

BananaMind-2-Pro-Preview-Chat-ternary es un checkpoint de investigación publicado por fontlab que aplica cuantización ternaria extrema (valores -1, 0, +1) a todas las matrices del modelo BananaMind-2-Pro-Preview-Chat, un LLM pequeño de 139 millones de parámetros con ventana de contexto de 3.000 tokens, desarrollado por BananaMind. El checkpoint está pensado exclusivamente para el motor de inferencia bananamend y no es legible por transformers, ya que los pesos se almacenan como códigos y escalas en lugar de floats.

El propio autor advierte de forma explícita en la model card que este checkpoint no funciona como modelo de chat: las respuestas generadas no guardan relación con la pregunta. Por ejemplo, ante la entrada "Name one ocean." con temperatura cero, el modelo produce "Engineerererererererererererererer". El archivo se publica únicamente para que otros investigadores puedan reproducir las mediciones de degradación y comprobar el tamaño real de un checkpoint totalmente ternario. Para uso práctico, el autor recomienda los checkpoints `-int8` o `-mixed` del mismo modelo base.

La relevancia de esta publicación radica en que documenta empíricamente los límites de la cuantización ternaria post-entrenamiento en modelos pequeños: mientras que los trabajos académicos sobre modelos ternarios suelen entrenar desde cero con la rejilla ternaria o trabajar con modelos de más de mil millones de parámetros, este experimento demuestra que un modelo de 139M cuantizado después del entrenamiento pierde por completo su capacidad de generar texto coherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer decoder), arquitectura personalizada del modelo base BananaMind-2-Pro-Preview-Chat |
| Parametros totales | 54.512.000 (checkpoint ternario); el modelo base tiene 139.000.000 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 3.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternaria (valores -1, 0, +1) con group size 64; 168 matrices ternarias y 1 matriz de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun la model card del checkpoint; el modelo base muestra en su pagina la licencia bananamind-community-license-1, existe discrepancia) |
| Formato de pesos | Codigos y escalas ternarios (requiere el motor bananamendr; no legible por transformers) |

## Arquitectura y entrenamiento

El checkpoint es el resultado de una cuantizacion post-entrenamiento aplicada sobre el modelo BananaMind-2-Pro-Preview-Chat, un causal LM de 139 millones de parametros con tokenizador de digitos y ajuste fino completo para chat. El proceso de cuantizacion, implementado en la herramienta `bananamendy 1.0.2`, sigue varios pasos: primero se ejecuta un texto de calibracion a traves del modelo y se registra la distribucion de activaciones de cada matriz; despues, para cada grupo de 64 pesos, se busca el umbral que minimiza el error y se asignan escalas separadas a los pesos positivos y negativos (esquema asimetrico de PT2-LLM, basado en Ternary Weight Networks); a continuacion se cuantiza columna a columna propagando el error a las columnas siguientes (metodo GPTQ); finalmente, se mide cada matriz de forma individual y se asignan pesos ternarios solo a aquellas matrices cuyo cambio en las respuestas es minimo, dentro de un presupuesto global de degradacion. El resto de matrices reciben pesos de 8 bits.

El resultado es un archivo de 66,66 MB frente a los 555,89 MB del checkpoint en float, una reduccion de 8,34 veces. Sin embargo, las mediciones de calidad muestran que con todas las matrices ternarias el modelo deja de funcionar: la perplejidad sube de 38,3 a 131,1 y ninguna de las 8 respuestas greedy evaluadas coincide con las del modelo original.

## Capacidades

- Este checkpoint concreto no es funcional como modelo de chat: las respuestas generadas son incoherentes y no guardan relacion con la entrada, tal y como documenta el autor.
- No es capaz de generar texto util, razonar, escribir codigo ni realizar tareas de lenguaje natural.
- No soporta tool calling, agentes ni razonamiento multi-paso, porque la cuantizacion ternaria total destruye la representacion semantica del modelo.
- La unica capacidad real es la de servir como objeto de estudio para medir la degradacion introducida por la cuantizacion ternaria extrema en modelos pequenos.
- El modelo base (BananaMind-2-Pro-Preview-Chat) si posee capacidades de chat, pero este checkpoint no las hereda.

## Casos de uso

- Investigacion sobre limites de cuantizacion ternaria: permite reproducir las mediciones publicadas y verificar que un modelo de 139M cuantizado a ternario pierde toda capacidad de generar respuestas coherentes.
- Estudio de la relacion entre tamano del modelo y tolerancia a cuantizacion agresiva: comparar este checkpoint con otros del mismo modelo en int8 o mixed para cuantificar el punto de ruptura.
- Desarrollo de metricas de evaluacion de calidad post-cuantizacion: las medidas de la model card (mismo siguiente token, divergencia KL, perplejidad) pueden servir como referencia para validar nuevas metricas.
- Benchmark de motores de inferencia: el archivo puede usarse para probar la correccion del motor bananamendr al cargar y ejecutar pesos ternarios, aunque las salidas no sean semanticamente validas.
- Educacion y divulgacion: ejemplifica de forma tangible por que la cuantizacion ternaria no es adecuada para modelos pequenos sin entrenamiento especifico.
- No es adecuado para ningun caso de uso de produccion, atencion al cliente, generacion de codigo o cualquier aplicacion que requiera texto coherente.

## Benchmarks y rendimiento

La model card proporciona mediciones de calidad comparando este checkpoint ternario con el checkpoint float del mismo modelo, sobre un texto que el cuantizador no habia visto. El motor bananamendr produjo ambas salidas.

| Medida | Valor |
|---|---|
| Mismo siguiente token | 41,3 % |
| Siguiente token dentro de los cinco primeros | 66,7 % |
| Divergencia KL | 1,4209 |
| Perplejidad (ternario vs float) | 131,1 frente a 38,3 |
| Respuestas greedy identicas | 0 de 8 |

Estos datos confirman que la cuantizacion ternaria total degrada el modelo hasta el punto de hacerlo inutil. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para este checkpoint, probablemente porque no es capaz de responder correctamente a ninguna tarea.

## Requisitos de hardware

- El archivo del checkpoint pesa solo 66,66 MB, por lo que cabe en cualquier GPU, incluso en las mas modestas, y tambien en CPU.
- El modelo base requiere aproximadamente 0,6 GB de VRAM segun llm-explorer, por lo que este checkpoint ternario necesitara menos de la decima parte.
- Cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior) es suficiente para cargar y ejecutar el modelo, aunque las salidas seran incoherentes.
- El despliegue requiere el motor bananamendr, disponible como libreria Python (`bananamendr`) o mediante la CLI `bananamendy`. No es compatible con vLLM, llama.cpp, Ollama ni TGI porque el formato de pesos no es estandar.
- La latencia sera minima dado el tamano reducido, pero no tiene sentido hablar de throughput util porque el modelo no produce respuestas validas.

## Comparativa con modelos similares

No se dispone de datos de otros checkpoints cuantizados del mismo modelo (int8 o mixed) en la informacion proporcionada, por lo que no es posible realizar una comparativa numerica. Como referencia conceptual, se compara con el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Formato | Calidad de salida |
|---|---|---|---|---|
| BananaMind-2-Pro-Preview-Chat (float) | 139M | 3.000 | Float (555,89 MB) | Funcional como chat |
| BananaMind-2-Pro-Preview-Chat-ternary (este checkpoint) | 54,5M (ternario) | 3.000 | Ternario (66,66 MB) | No funcional, respuestas incoherentes |
| Checkpoints int8/mixed del mismo modelo | no disponible | 3.000 | Int8 o mixto | Se espera que conserven la funcionalidad, segun el autor |

No se han encontrado otros modelos de tamano similar con cuantizacion ternaria post-entrenamiento publicados para comparar.

## Limitaciones y advertencias

- El checkpoint no funciona como modelo de chat: las respuestas no tienen relacion con la pregunta, como advierte el autor en la model card.
- Es un artefacto de investigacion con tag `research-only`; no debe usarse en produccion ni en ninguna aplicacion que requiera texto coherente.
- El formato de pesos es propietario del motor bananamendr y no es legible por transformers, vLLM ni otras herramientas estandar.
- Existe una discrepancia de licencia: el checkpoint declara apache-2.0, pero el modelo base muestra en su pagina la licencia bananamind-community-license-1. Conviene verificar los terminos antes de cualquier redistribucion.
- La cuantizacion ternaria aplicada post-entrenamiento destruye por completo la capacidad del modelo; los resultados de perplejidad (131,1) y la ausencia de respuestas identicas (0/8) lo confirman.
- No se conocen sesgos especificos de este checkpoint, pero al no producir texto coherente, el riesgo de alucinacion es irrelevante en la practica.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/fontlab/BananaMind-2-Pro-Preview-Chat-ternary
- Modelo base: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview-Chat
- Repositorio del motor bananamend: https://github.com/twardoch/bananamend
- Informacion adicional del modelo base en llm-explorer: https://llm-explorer.com/model/BananaMind%2FBananaMind-2-Pro-Preview-Chat,OMDKYcZXPDxiNZHWubt8K
