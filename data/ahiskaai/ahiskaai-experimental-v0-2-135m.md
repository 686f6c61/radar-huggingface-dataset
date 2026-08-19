# AhiskaAI/AhiskaAI-experimental-v0.2-135m

## Resumen

AhıskaAI-experimental-v0.2-135m es un modelo de lenguaje pequeño (SLM) de 135 millones de parametros desarrollado desde cero por AhiskaAI, un proyecto centrado en el procesamiento del lenguaje natural para turco. El modelo se concibio originalmente como candidato para la serie principal AhıskaAI v0.4, pero durante el entrenamiento y la evaluacion se detectaron problemas en la configuracion del modelo, el formateo de datos y el pipeline de entrenamiento, por lo que no alcanzo los requisitos de calidad necesarios para su publicacion como version estable.

En lugar de descartar el trabajo, el equipo decidio publicarlo como un checkpoint experimental v0.2 para documentar el experimento y preservar el historial de desarrollo. El modelo emplea una arquitectura LlamaForCausalLM con 33 capas, un tamano oculto de 576 dimensiones y una ventana de contexto de 2048 tokens. Se entreno sobre una mezcla de aproximadamente 14 GB de datos sinteticos y web en turco, procesando alrededor de 2.800 millones de tokens.

La relevancia de este modelo reside en su valor como documento de investigacion: muestra los efectos del formateo repetitivo en corpus sinteticos a gran escala sobre modelos pequenos, y documenta los fallos que pueden surgir en pipelines experimentales. No esta recomendado para uso en produccion ni para tareas que requieran fiabilidad, pero resulta util para estudiar el comportamiento de SLMs en turco y para comparar con iteraciones posteriores del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Llama) |
| Parametros totales | ~135M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Llama clasica con normalizacion RMSNorm, activacion SiLU y atencion con RoPE (theta 10.000). La configuracion incluye 33 capas, 9 cabezas de atencion, 3 cabezas key/value, dimension de cabeza de 64 y tamano intermedio de 1536. El vocabulario es de 32.000 tokens y la precision de entrenamiento fue bfloat16. No se aplico weight tying en la configuracion original.

El entrenamiento se realizo sobre una mezcla de datos compuesta principalmente por cuatro conjuntos sinteticos en turco: BILGE Synthetic Web (~4 GB), BILGE Synthetic Math (~3 GB), BILGE Synthetic Stories (~6 GB) y BILGE Wiki-Tr-Plus (~1 GB). En total se procesaron aproximadamente 2.800 millones de tokens. El hallazgo mas significativo del experimento fue que una gran proporcion del corpus seguia un patron de formateo repetido con la estructura `<s>## Title` seguida del texto del documento. Esta repeticion excesiva provoco que el modelo desarrollara una fuerte tendencia a reproducir dicha estructura incluso ante preguntas simples, generando contenido narrativo no relacionado con el prompt original.

## Capacidades

- Generacion de texto en turco: el modelo puede producir texto coherente a nivel local, especialmente en formato narrativo o documental.
- Modelado de lenguaje causal: funciona como un LM autoregresivo estandar para continuacion de texto.
- Capacidad limitada de seguimiento de instrucciones: el entrenamiento incluyo experimentos tempranos de instruction-following, pero los resultados no alcanzaron la calidad esperada.
- Razonamiento matematico basico: se incluyeron datos sinteticos de matematicas, aunque la fiabilidad en este ambito es baja.
- Generacion narrativa: el modelo muestra cierta habilidad para producir texto estilo cuento o historia, aunque con tendencia a desviarse del tema solicitado.
- No dispone de soporte para tool calling, funciones multimodales, ni modos de razonamiento especiales.

## Casos de uso

- Investigacion academica sobre SLMs en turco: el modelo sirve como objeto de estudio para analizar como los datos sinteticos a gran escala afectan el comportamiento de modelos pequenos, especialmente en lo relativo a sesgos de formateo.
- Comparacion de arquitecturas experimentales: permite contrastar el rendimiento de una configuracion Llama compacta frente a otras variantes del mismo rango de parametros dentro del proyecto AhiskaAI.
- Estudio de efectos de formateo en corpus sinteticos: el comportamiento documentado del modelo (tendencia a generar `<s>##` y narrativas no relacionadas) ofrece un caso practico para investigar la influencia de patrones repetitivos en datos de entrenamiento.
- Desarrollo de pipelines de entrenamiento: el checkpoint documenta errores de configuracion y formateo que pueden servir como ejemplo de que evitar en futuros experimentos.
- Evaluacion de metricas de calidad en modelos pequenos: permite probar metodologias de evaluacion para detectar modelos que no cumplen los estandares de calidad antes de su publicacion.
- Educacion y formacion en NLP: el modelo puede utilizarse en entornos docentes para ilustrar las limitaciones de los SLMs y la importancia de la calidad de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en bfloat16, lo que permite ejecucion en practicamente cualquier GPU moderna o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GTX 1050 Ti, RTX 2060 o superiores. Tambien puede ejecutarse en CPU con razonable velocidad.
- Compatibilidad con GPU de consumo: si, es plenamente compatible con cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo Llama estandar, puede desplegarse con llama.cpp, Ollama, vLLM o TGI, aunque su tamano reducido hace que la latencia sea minima en cualquier hardware.
- Latencia y throughput: no se han publicado datos oficiales, pero por su tamano se espera una generacion muy rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Estado |
|---|---|---|---|---|---|
| AhıskaAI-experimental-v0.2-135m | 135M | 2048 | Turco | Apache 2.0 | Experimental, calidad insuficiente |
| AhıskaAI-135m-Instruct-v0.3 | 135M | 2048 (aprox.) | Turco | Apache 2.0 | Version instruct posterior, presumiblemente con mejoras |
| Otros SLMs turcos | no disponible | no disponible | Turco | no disponible | no disponible |

No se dispone de informacion suficiente sobre otros modelos comparables en el mismo rango de parametros para turco. La comparativa principal seria con la serie AhıskaAI v0.3, que representa la iteracion posterior y presumiblemente corrige parte de los problemas documentados en este checkpoint experimental.

## Limitaciones y advertencias

- El modelo no alcanza los requisitos de calidad de la serie principal AhıskaAI y se publica exclusivamente como documento de investigacion.
- Presenta una fuerte tendencia a reproducir el patron de formateo `<s>##` del corpus de entrenamiento, generando respuestas no relacionadas con el prompt.
- La capacidad de seguir instrucciones es limitada y poco fiable.
- El razonamiento matematico no es fiable y puede producir resultados incorrectos.
- El modelo solo soporta turco; no se ha entrenado para otros idiomas.
- No debe utilizarse en produccion ni en aplicaciones que requieran respuestas precisas o seguras.
- Aunque la licencia Apache 2.0 permite uso comercial, la calidad del modelo hace desaconsejable cualquier uso productivo.
- El contexto de 2048 tokens es reducido para tareas que requieran ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AhiskaAI/AhiskaAI-experimental-v0.2-135m
- Coleccion de datasets v0.2: https://huggingface.co/collections/AhiskaAI/ahiskaai-v02-dataset
- Datasets de AhiskaAI: https://huggingface.co/AhiskaAI/datasets
- Repositorio de codigo de entrenamiento experimental v0.1: https://github.com/AhiskaAI/AhiskaAI-v0.1-Experimental-Training-code/tree/main
- Dataset BILGE Synthetic Web: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Web
- Dataset BILGE Synthetic Math: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Math
- Dataset BILGE Synthetic Stories: https://huggingface.co/datasets/BILGEM-AI/BILGE-Synthetic-Stories
- Dataset BILGE Wiki-Tr-Plus: https://huggingface.co/datasets/BILGEM-AI/BILGE-Wiki-Tr-Plus
