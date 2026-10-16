# Donghyun1228/pi05-libero-support-lora16-all-yaw10-n50000-10000-20261016

## Resumen

Se trata de un adaptador LoRA de rango 16 desarrollado por el usuario Donghyun1228 sobre un modelo base pi05 de la libreria openpi, orientado al control robotico y a la evaluacion en el benchmark LIBERO. No es un modelo autonomo: es un conjunto de factores LoRA entrenados sobre un checkpoint concreto y distribuidos como repositorio de openpi. El adaptador se denomina "All-module rank16 LoRA: yaw10" y su entrenamiento sigue un esquema de dinamica inversa (inverse dynamics) con congelacion total del modelo base.

El entrenamiento parte de un "source" (Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015) y un "target" (Donghyun1228/libero-support-random-waypoint-300k-yaw10-20261015, prefijo de 50.000 fotogramas). Se realizan 10.000 actualizaciones frescas con batch 32, semilla 42, learning rate 1e-5, warmup 500 y EMA 0.999. Solo 40 factores LoRA son entrenables: los 51 tensores hoja originales, sesgos y normalizaciones permanecen congelados, y no se aplica LoRA al LLM. La evaluación final en LIBERO alcanza 1867/2000, lo que convierte al adaptador en un artefacto de investigacion reproducible para tareas de manipulacion en simulacion.

Su relevancia es acotada pero concreta: sirve para estudiar adaptacion eficiente de modelos vision-lenguaje-accion (VLA) en robotica, para reproducir experimentos de dinamica inversa y para evaluar politicas de manipulacion en MuJoCo. Con 0 descargas y 0 likes en el momento de la consulta, es un recurso de nicho publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16, alpha 16) sobre modelo base pi05 de la libreria openpi; modulos objetivo: atencion/MLP/stem/head de vision, atencion/MLP de accion, AdaRMS y E/S de accion y tiempo |
| Parametros totales | no disponible (se entrenan 40 factores LoRA; el repositorio ocupa 7,8 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Inferencia en BF16; los adaptadores no EMA se pliegan en FP32 antes de la inferencia BF16. Otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado de forma "all-module" sobre el modelo base pi05. Los adaptadores se insertan en los modulos de vision (atencion, MLP, stem y head), en los modulos de accion (atencion, MLP y AdaRMS) y en las entradas/salidas de accion y tiempo. La dimension 6 del IDM del gripper queda excluida, mientras que las entradas y salidas de politica de siete dimensiones y el control del gripper se mantienen. De los tensores del modelo base, los 51 tensores hoja originales, los sesgos y las normalizaciones permanecen congelados, y no se aplica LoRA a la parte LLM, lo que limita el entrenamiento a 40 factores LoRA.

El entrenamiento consiste en 10.000 actualizaciones frescas con batch 32, semilla 42, learning rate 1e-5, warmup de 500 pasos y EMA con decaimiento 0.999. Se realiza una validacion en lazo abierto mediante replay fijo al inicio y cada 1000 actualizaciones, con la particularidad de que las etiquetas de experto nunca entran en los gradientes ni en la seleccion de modelo. Para la inferencia, los adaptadores no EMA en crudo se pliegan en FP32 antes de la conversion a BF16, y la muneca (wrist) de la fuente se preserva. La variante se etiqueta como "yaw10", presumiblemente ligada a una configuracion angular concreta, si bien la informacion no detalla su significado exacto.

## Capacidades

- Control robotico de manipulacion: genera acciones de siete dimensiones para politicas de robot en el entorno LIBERO.
- Control de gripper: mantiene la senal de control del gripper pese a excluir la dimension 6 del IDM.
- Modelado de dinamica inversa (inverse dynamics): el entrenamiento y las etiquetas estan orientados a este paradigma.
- Adaptacion eficiente de VLA: demuestra el uso de LoRA de rango 16 sobre modulos de vision y accion de un modelo pi05.
- Evaluacion en simulacion: validado en LIBERO con MuJoCo 3.2.3.
- Sin capacidades de lenguaje conversacional: no se entrena LoRA sobre el LLM, por lo que no se documentan generacion de texto, tool calling ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el modulo de vision se usa como parte de la politica, no como capacidad descrita de forma independiente.

## Casos de uso

- Investigacion en adaptacion eficiente de politicas roboticas: permite estudiar como un LoRA de rango 16 repartido entre modulos de vision y accion modifica el comportamiento de un modelo pi05 sin reentrenar el modelo base, gracias a la congelacion de los 51 tensores hoja originales.
- Evaluacion de politicas de manipulacion en LIBERO: sirve como checkpoint de referencia con un resultado final de 1867/2000 sobre 2000 episodios, bajo MuJoCo 3.2.3 y envseed 7.
- Reproduccion de experimentos de dinamica inversa: el esquema de entrenamiento, con etiquetas de experto excluidas de gradientes y seleccion de modelo, facilita replicar el protocolo de forma controlada.
- Ablaciones sobre modulos concretos: al aplicar adaptadores separados a stem, head, MLP, atencion y AdaRMS, permite medir la contribucion de cada bloque al rendimiento final.
- Integracion en pipelines openpi: al declarar `library_name: openpi`, el adaptador esta pensado para cargarse dentro de ese ecosistema y servir de base a nuevas iteraciones.
- Pruebas de despliegue en simulacion con servidor: la evaluacion se realizo con `serverbatch16`, `max32clients` y `suite8`, por lo que el artefacto es adecuado para probar configuraciones de servicio por lotes en simulacion.
- Estudio del efecto de la variante "yaw10": permite comparar esta configuracion angular con otras variantes del mismo autor sobre el mismo modelo base.
- Punto de partida para fine-tuning posterior: al ser un adaptador pequeno y congelar el base, puede reutilizarse como inicializacion para nuevos entrenamientos sin partir de cero.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| LIBERO (evaluacion final) | MuJoCo 3.2.3, envseed 7, serverbatch 16, max32clients, suite8 | 1867/2000 (93,35 %) |

La evaluacion es "final-only" y se ejecuta sobre LIBERO. La model card indica que las posibles diferencias por RNG compartido del servidor y por la forma del lote en BF16 siguen el protocolo registrado. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es openpi; la evaluacion se realizo con MuJoCo 3.2.3 y un servidor con `serverbatch16`, `max32clients` y `suite8`. No se detallan otros motores (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, mismo tamano o misma tarea.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base pi05 y la libreria openpi para funcionar; el repositorio no describe un checkpoint completo independiente.
- Alcance restringido: es un adaptador de investigacion con 0 descargas y 0 likes, sin validacion externa conocida.
- Evaluacion unicamente en simulacion: los resultados de LIBERO no garantizan transferencia a robot real.
- Capacidades de lenguaje no entrenadas: al no aplicar LoRA al LLM, no cabe esperar mejoras en comprension o generacion de lenguaje.
- Dimension excluida: la dimension 6 del IDM del gripper queda fuera del entrenamiento, lo que puede limitar ciertos comportamientos de agarre pese a conservar el control del gripper.
- Riesgo de sobreajuste al protocolo: la seleccion de modelo se realiza con validacion de replay fijo y etiquetas de experto excluidas, por lo que el rendimiento depende de ese protocolo concreto.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplica en el sentido linguistico; en robotica el equivalente seria la generacion de acciones no validas, no cuantificada en la informacion.
- Limitaciones de contexto o idioma: no disponibles.
- Licencia: Apache-2.0 permite uso comercial del adaptador, pero conviene verificar la licencia del modelo base pi05 y de los checkpoints de origen antes de un despliegue comercial.
- Caveat de reproducibilidad: la model card advierte de diferencias por RNG compartido del servidor y por la forma del lote en BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-lora16-all-yaw10-n50000-10000-20261016
- Modelo de origen (source): https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015
- Modelo objetivo (target): https://huggingface.co/Donghyun1228/libero-support-random-waypoint-300k-yaw10-20261015
- Perfil del autor: https://huggingface.co/Donghyun1228
- Repositorio openpi (libreria declarada): no se proporciona enlace en la informacion disponible.
