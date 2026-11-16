# alphatrann/zen

## Resumen

Zen (zen-0.6b-v1) es un modelo de lenguaje de 0,6 mil millones de parametros desarrollado por el usuario alphatrann, obtenido mediante un ajuste fino con LoRA sobre Qwen/Qwen3-0.6B. Su proposito es actuar como extractor de tareas en dispositivos (on-device) para la aplicacion de planificacion "zen planner": convierte texto libre en vietnamita o ingles —incluyendo errores tipograficos, jerga de chat, autocorrecciones y avisos escaneados— en una estructura JSON de tareas con fechas exactas resueltas contra un calendario proporcionado en el propio prompt.

La relevancia del modelo reside en su orientacion a la eficiencia: el vocabulario original de Qwen3-0.6B se ha recortado de 151.669 a 45.869 tokens conservando unicamente los vistos al menos 20 veces en muestras de Wikipedia en vietnamita e ingles, los tokens BPE padre, los 256 tokens de byte y los especiales. El resultado es un artefacto de 280 MB en cuantizacion int4 para LiteRT-LM, pensado para ejecutarse en telefono movil dentro de la app mediante expo-ai-kit.

Se distribuye bajo licencia Apache 2.0 y el repositorio incluye tres formatos: el binario `model.litertlm` para despliegue en dispositivo, el checkpoint fusionado en bf16 para transformers y mlx-lm, y el adaptador LoRA por separado. Es un modelo muy especializado, con solo 300 pasos de entrenamiento y un conjunto de datos pequeno, por lo que su utilidad fuera del dominio de extraccion de tareas es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B) con ajuste fino LoRA |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B); adaptador LoRA de 5,0 M de parametros (rank 8) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | cache de 4096 tokens en LiteRT-LM; prefill 256/2048 |
| Tipos de cuantizacion | int4 (dynamic_wi4b32_afp32) en LiteRT-LM; bf16 en el checkpoint fusionado |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint bf16), `model.litertlm` (int4), adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y aplica un ajuste fino con LoRA sobre todas las capas con rango 8 (5,0 millones de parametros), durante 300 pasos y con los pesos fusionados posteriormente. La innovacion principal es el recorte del vocabulario: de 151.669 a 45.869 tokens, conservando los tokens vistos al menos 20 veces en muestras de Wikipedia en vietnamita e ingles mas las entradas de entrenamiento, sus padres BPE, los 256 tokens de byte y los especiales. Segun el autor, las entradas reales consumen un 0,5 % mas de tokens que con el vocabulario completo, lo que supone una reduccion sustancial del tamano del modelo a cambio de un coste minimo en longitud de secuencia.

Los datos de entrenamiento consisten en aproximadamente 100 etiquetas generadas por Qwen3.8-27B con el prompt de reglas propio de la app (cada una con una fecha "hoy" aleatoria y un perfil de usuario), contadas dos veces, mas 600 ejercicios de calendario cuyas fechas fueron calculadas por codigo. El modelo usa plantilla ChatML, acepta contenido como texto o como lista de partes de texto y termina el prompt de generacion con un bloque de pensamiento vacio, de modo que escribe el JSON directamente. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Extraccion de tareas a JSON: convierte texto libre en una lista de tareas con los campos title, type, start, day, deadline, repeat, minutes, sessions, tods, leadDays, dueDays y why.
- Resolucion de fechas exactas: consulta un calendario de 28 lineas proporcionado en el prompt para asignar fechas concretas.
- Manejo de ruido en la entrada: errores tipograficos, jerga de chat (teencode), autocorrecciones y avisos escaneados.
- Estimacion de esfuerzo: asigna minutos, numero de sesiones y partes del dia (tods) a cada tarea.
- Fechas limite suaves: calcula leadDays y dueDays para plazos no estrictos.
- Soporte bilingue: vietnamita e ingles.
- Salida estructurada estricta: formato JSON con validacion del 100 % en el conjunto de prueba del autor.
- Ejecucion en dispositivo: disenado para LiteRT-LM con cuantizacion int4 y cache de 4096 tokens.

## Casos de uso

- Gestion de tareas por voz o texto en la app zen planner: el modelo recibe el perfil del usuario, la fecha actual y un calendario, y devuelve las tareas en JSON listas para insertar en la base de datos de la aplicacion. Es su caso de uso principal y el unico para el que fue entrenado.
- Procesamiento de notas y avisos escaneados: al aceptar texto pegado con errores, permite extraer tareas de mensajes copiados, correos o capturas OCR de avisos escolares o administrativos.
- Planificacion con repeticion: los campos repeat, sessions y tods permiten generar tareas recurrentes con distribucion en partes del dia, util para rutinas semanales o recordatorios periodicos.
- Asistente de planificacion semanal en movil: al ejecutarse en el telefono mediante LiteRT-LM, permite clasificar y estructurar entradas sin enviar datos a la nube, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Normalizacion de lenguaje informal en vietnamita: el modelo maneja teencode y texto sin acentos, lo que lo hace util para preprocesar entradas de usuarios en mercados vietnamitas antes de pasarlas a sistemas posteriores.
- Prototipado de pipelines de extraccion de informacion en entornos con recursos limitados: su tamano de 280 MB en int4 y su licencia Apache 2.0 permiten integrarlo en demos o pruebas de concepto de asistentes personales sin infraestructura de GPU.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de prueba de 9 entradas etiquetadas por el modelo profesor (muestra muy pequena):

| Metrica | bf16 (mlx) | int4 (LiteRT) |
|---|---|---|
| JSON valido | 100 % | 100 % |
| Numero de tareas correcto | 89 % | aproximadamente 6 de 9 |
| Fechas exactas | 6 de 8 | 5 de 9 entradas completamente correctas |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint bf16 de 0,6 B ocupa aproximadamente 1,2 GB en memoria; la version int4 de LiteRT ocupa 280.412.576 bytes.
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU de movil y para ejecucion en Mac CPU mediante LiteRT.
- Cabe en GPU de consumo: si, cualquier GPU con 2 GB o mas de VRAM puede ejecutar el checkpoint bf16; la version int4 esta disenada para telefonos.
- Opciones de despliegue: LiteRT-LM (expo-ai-kit) para el binario int4; transformers y mlx-lm para el checkpoint bf16 fusionado; el adaptador LoRA requiere el modelo base recortado `qwen3-0.6b-vien20`.
- Latencia y throughput: aproximadamente 12 segundos por linea en CPU de Mac a traves de LiteRT; la velocidad en telefono no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| zen-0.6b-v1 | 0,6 B | 4096 (cache LiteRT) | vi, en | Apache 2.0 | Ajuste fino especializado en extraccion de tareas; vocabulario recortado |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en la informacion | multilingue | Apache 2.0 | Modelo base; capacidades generales, sin especializacion en tareas |
| Alternativas de extraccion de tareas de 0,5-1 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Conjunto de evaluacion muy pequeno (9 entradas), por lo que las metricas publicadas tienen escasa significacion estadistica.
- Fallos conocidos: fechas lunares, titulos en teencode completamente sin acentos y, en la version int4, ocasionalmente un dia que el usuario no menciono.
- Entrenado con solo 300 pasos y aproximadamente 100 etiquetas mas 600 ejercicios de calendario; la cobertura de dominios y estilos es muy limitada.
- Fuera del dominio de extraccion de tareas su rendimiento como modelo de lenguaje general no esta evaluado y probablemente sea deficiente tras el recorte de vocabulario y el ajuste.
- El recorte de vocabulario a vietnamita e ingles elimina cualquier soporte real para otros idiomas, incluido el espanol.
- Riesgo de alucinacion en fechas y campos numericos (minutos, sesiones) cuando la entrada es ambigua.
- La latencia en telefono no se ha medido; los 12 s por linea en CPU de Mac indican que la inferencia no es interactiva en todos los entornos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B y los datos generados por Qwen3.8-27B deben verificarse por separado en cuanto a sus terminos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphatrann/zen
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base recortado referenciado: `../base/qwen3-0.6b-vien20` (ruta relativa dentro del repositorio del autor)
- LiteRT-LM: no disponible enlace directo en la informacion proporcionada
- expo-ai-kit: no disponible enlace directo en la informacion proporcionada
