# gavinzsmeng/visfineval-qwen3vl-8b-lora-balanced

## Resumen

VisFinEval Qwen3-VL-8B LoRA (balanced) es un adaptador LoRA de PEFT publicado por el usuario gavinzsmeng sobre el modelo vision-language Qwen/Qwen3-VL-8B-Instruct. Se ha entrenado sobre el conjunto VisFinEval (SUFE-AIFLM-Lab), compuesto por preguntas de opcion multiple y de verdadero/falso sobre graficos extraidos de informes de analisis bursatil chinos. Su proposito no es desplegarse en produccion, sino servir como brazo de ablacion en una auditoria de fiabilidad: comprobar si el colapso del modelo base hacia la clase mayoritaria en las preguntas de verdadero/falso se debe al desbalanceo del conjunto de entrenamiento.

El adaptador se ha entrenado con un conjunto remuestreado y equilibrado por clases: las seis combinaciones de tipo de pregunta y etiqueta se han sobremuestreado hasta 6.725 ejemplos cada una, alcanzando 40.350 filas frente a las 13.465 de la particion natural. El resultado experimental es negativo: el equilibrado no aporta ninguna mejora. Sobre la misma particion de test de 2.889 preguntas (split a nivel de informe, sin solapamiento) y con decodificacion voraz, la precision bruta en opcion multiple cae 1,35 puntos porcentuales (p = 0,024 en test de McNemar) mientras que el recall de la clase minoritaria "No" solo sube 0,8 puntos, dentro del intervalo de confianza. La comparacion por pares contra el adaptador hermano entrenado con la distribucion natural da 84 aciertos nuevos frente a 117 roturas, con un efecto neto de -33.

Es relevante ahora porque documenta de forma cuantitativa un error metodologico frecuente: aplicar remuestreo a un dataset sesgado antes de comprobar si un ajuste supervisado estandar ya resuelve el problema. El propio autor desaconseja su uso y lo publica unicamente para permitir la reproduccion del resultado negativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-language Qwen3-VL-8B-Instruct |
| Parametros totales | 8,81 B en el modelo base; 43,6 M entrenables en el adaptador (0,50 %) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (bf16); no se publican versiones cuantizadas. Opciones de cuantizacion del modelo base: no disponible |
| Idiomas soportados | zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,2 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Libreria | peft |
| Dataset de entrenamiento | SUFE-AIFLM-Lab/VisFinEval |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, no de un modelo completo. La configuracion es r=16, alpha=32 y `target_modules=all-linear` sobre Qwen3-VL-8B-Instruct, con el codificador de vision y el aligner congelados (`freeze_vit=true`). Solo se entrenan 43,6 M de parametros sobre un total de 8,81 B. El entrenamiento se hizo en bfloat16 con ms-swift 4.6.0.dev0, 2 epocas (1.262 pasos), batch efectivo de 1 x 16 de acumulacion de gradiente sobre 4 GPU, learning rate de 1e-4 con scheduler coseno y 5 % de warmup, en 4x RTX 4090 con DDP durante aproximadamente 4 horas y 55 minutos.

Lo unico que diferencia este adaptador de su hermano natural es el conjunto de datos. Aqui se parte de la misma base de 2.322 informes de entrenamiento, pero las seis celdas de tipo de pregunta por etiqueta se han remuestreado con reemplazo hasta 6.725 ejemplos cada una (40.350 filas en total). El remuestreo con reemplazo implica filas duplicadas, por lo que cabe esperar un sobreajuste leve en las clases minoritarias respecto al entrenamiento natural. No se documento ningun uso de RLHF ni DPO: es ajuste supervisado estandar.

## Capacidades

- Respuesta a preguntas visuales sobre graficos financieros: opcion multiple y verdadero/falso sobre figuras extraidas de informes de analisis bursatil en chino.
- Lectura de graficos e interpretacion de ejes, series y etiquetas dentro del dominio financiero de VisFinEval.
- Generacion de texto en chino (unico idioma declarado en la model card del adaptador).
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct (vision general, razonamiento visual, tool calling): presentes en los pesos base, pero no evaluadas ni garantizadas por este adaptador.
- Modo de pensamiento o decodificacion especulativa: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso especifico de este adaptador: no documentado.

## Casos de uso

- Reproduccion del resultado negativo: cargar el adaptador con el prompt documentado y verificar sobre la particion de test de 2.889 preguntas que el remuestreo balanceado no mejora al adaptador natural. Es el proposito declarado por el autor.
- Auditoria metodologica de pipelines de SFT: usar la pareja balanced/natural como caso de estudio controlado para medir el coste real del remuestreo en tareas de clasificacion visual con clases desbalanceadas.
- Analisis de sensibilidad al prompt: la model card indica que la redaccion del prompt mueve el recall de la clase minoritaria hasta 23 puntos en esta tarea, por lo que el adaptador sirve para cuantificar esa dependencia manteniendo fijos los pesos.
- Investigacion sobre fiabilidad y calibracion: comparar el recall de la clase "No" (39,7 % en el modelo base, 69,8 % en este adaptador) para estudiar el sesgo hacia la clase mayoritaria en modelos vision-language.
- Construccion de benchmarks de finanzas visuales: el desglose por tipo de pregunta y etiqueta, con intervalos de Wilson, es reutilizable como plantilla de evaluacion para otros adaptadores sobre el mismo dataset.
- Linea base en estudios comparativos de LoRA: dado que iguala al adaptador natural en TF raw (84,01 %) y lo supera marginalmente en macro-recall de TF (79,43 % frente a 79,15 %), resulta util como punto de comparacion para tecnicas alternativas de reequilibrado.
- Docencia y formacion en practicas de evaluacion: ilustra por que conviene comprobar el efecto de un SFT simple antes de recurrir a remuestreo, con datos de McNemar y comparacion por pares.

## Benchmarks y rendimiento

Resultados sobre la misma particion de test retenida (2.889 preguntas, split a nivel de informe, sin solapamiento), mismo prompt y decodificacion voraz:

| Condicion | MC bruto | TF bruto | Macro-recall TF | Recall clase "No" (IC 95 % Wilson) |
|---|---|---|---|---|
| Qwen3-VL-8B (base) | 73,70 % | 75,23 % | 63,73 % | 39,7 % [31,2; 48,8] |
| LoRA natural (hermano) | 84,13 % | 84,01 % | 79,15 % | 69,0 % [60,1; 76,7] |
| Este adaptador (balanced) | 82,78 % | 84,01 % | 79,43 % | 69,8 % [60,9; 77,4] |

Comparacion por pares contra el adaptador natural:

```
natural -> balanced     fixed 84   broke 117   net -33   McNemar p = 0.024
```

Interpretacion recogida en la model card: la precision bruta en opcion multiple cae 1,35 puntos porcentuales (estadisticamente significativa, p = 0,024), el recall de la clase minoritaria sube solo 0,8 puntos (dentro del intervalo de confianza) y el efecto neto es peor. El colapso de la clase minoritaria no se debia al desbalanceo de los datos; el SFT estandar sobre la distribucion natural ya lo corrige.

## Requisitos de hardware

- Almacenamiento: el repositorio del adaptador ocupa 0,2 GB; hay que sumar los pesos del modelo base Qwen3-VL-8B-Instruct (8,81 B de parametros).
- VRAM estimada para inferencia en bf16 (estimacion a partir del tamano del modelo base): en torno a 18-20 GB solo de pesos, con picos de 22-24 GB contando cache KV y activaciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones, no verificadas en la informacion disponible).
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio concurrente en bf16; RTX 4090 (24 GB) para una unica instancia en bf16 con contexto moderado; RTX 3090 o 4080 para cuantizacion de 8 bits; GPU de 12 GB o menos solo con cuantizacion agresiva.
- Entrenamiento del adaptador: documentado sobre 4x RTX 4090 con DDP, bfloat16, aproximadamente 4 h 55 min.
- Opciones de despliegue: al ser un adaptador PEFT sobre Qwen3-VL-8B-Instruct, requiere cargar el modelo base y aplicar el adaptador (por ejemplo, con la libreria peft, ms-swift o vLLM con soporte LoRA). Compatibilidad con llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada, y en el caso de llama.cpp requeriria fusionar y convertir los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MC bruto | Macro-recall TF | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| visfineval-qwen3vl-8b-lora-balanced (este) | 43,6 M entrenables sobre 8,81 B | No disponible | 82,78 % | 79,43 % | apache-2.0 | Publicado en HuggingFace, 0 descargas |
| visfineval-qwen3vl-8b-lora-natural (hermano) | 43,6 M entrenables sobre 8,81 B | No disponible | 84,13 % | 79,15 % | apache-2.0 | Publicado en HuggingFace; es el adaptador recomendado por el autor |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8,81 B | No disponible | 73,70 % | 63,73 % | apache-2.0 | Modelo base publico de Qwen |
| Otros adaptadores o modelos comparables en el mismo rango | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El autor indica explicitamente que este adaptador no esta recomendado para uso; se publica solo para reproducir el resultado negativo. Para uso real, remite al adaptador hermano `visfineval-qwen3vl-8b-lora-natural`.
- El equilibrado por clases no aporta beneficio medible y degrada de forma estadisticamente significativa la precision bruta en opcion multiple (-1,35 pp, p = 0,024 frente al adaptador natural).
- El remuestreo con reemplazo introduce filas duplicadas, con riesgo de sobreajuste leve en las clases minoritarias.
- Sensibilidad extrema al prompt: la redaccion del prompt puede mover el recall de la clase minoritaria hasta 23 puntos en esta tarea. Hay que usar el prompt documentado de forma literal; otra formulacion no reproduce estas cifras.
- El modelo base presenta colapso hacia la clase mayoritaria en verdadero/falso (recall de "No" del 39,7 %, por debajo del azar), lo que anticipa riesgo de sesgo de etiqueta si se usa sin ajuste.
- Dominio muy restringido: preguntas sobre graficos de informes bursatiles chinos. El idioma declarado es unicamente zh.
- Riesgo de alucinacion en la lectura de graficos: no se han publicado metricas especificas de fidelidad visual ni de calibracion mas alla de la exactitud y el recall reportados.
- Las imagenes de entrenamiento proceden de informes de analisis chinos y no se redistribuyen; hay que obtener VisFinEval desde su repositorio en HuggingFace.
- Licencia Apache-2.0, derivada de Qwen3-VL-8B-Instruct (Apache-2.0), lo que permite uso comercial del artefacto, aunque el uso practico de este adaptador concreto no esta recomendado por su autor.
- No se han publicado datos de contexto, cuantizacion, latencia ni throughput para este adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gavinzsmeng/visfineval-qwen3vl-8b-lora-balanced
- Adaptador hermano (natural): https://huggingface.co/gavinzsmeng/visfineval-qwen3vl-8b-lora-natural
- Repositorio de auditoria, codigo y reproduccion: https://github.com/gavinzsmeng/visfineval-reliability
- Dataset VisFinEval: https://huggingface.co/datasets/SUFE-AIFLM-Lab/VisFinEval
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper o blog adicionales: no disponibles en la informacion proporcionada. Los resultados de busqueda web recibidos no contienen referencias relacionadas con el modelo.
