# nishankgite/cosmos3-nano-umi-towel-folding-subtask

## Resumen

Cosmos3-nano-umi-towel-folding-subtask es un fine-tune del modelo de mundo generativo de vídeo Cosmos3-Nano de NVIDIA, adaptado por el usuario nishankgite para la predicción de vídeo de muñeca en tareas de plegado de toallas bimanual con dos pinzas UMI. El modelo toma aproximadamente 2 segundos de vídeo pasado de una cámara de muñeca (9 fotogramas a 4 fps) junto con una descripción textual del paso de plegado actual y el siguiente, y genera los 3 segundos siguientes (12 fotogramas a 4 fps) a resolución 480x832. Se trata, por tanto, de un modelo de mundo condicionado por acción implícita, no de una política de control.

El modelo parte de la torre de generación de Cosmos3-Nano (15.732.610.480 parámetros, formato safetensors, pipeline de diffusers `Cosmos3OmniPipeline`) y se ha ajustado completamente sobre 9.442 clips extraídos de 254 episodios de plegado en cuatro sesiones del dataset `nishankgite/umi-towel-folding`. La relevancia actual radica en que ejemplifica el uso de modelos de mundo de vídeo como backbone para políticas de imitación condicionadas por demostración, y en que publica una receta de fine-tune reproducible sobre el framework oficial `cosmos-framework`.

La evaluación publicada por el autor se limita a valoraciones visuales ciegas por IA (escala 1-5) sobre la sesión de test retenida, no a resultados de robot real. El modelo se distribuye con licencia OpenMDW-1.1, la misma que Cosmos3-Nano, y el autor indica explícitamente que no es un producto de NVIDIA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo generativo de vídeo (difusión) sobre Cosmos3-Nano, torre de generación; pipeline `Cosmos3OmniPipeline` de diffusers |
| Parámetros totales | 15.732.610.480 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 9 fotogramas de historia a 4 fps (aprox. 2 s) como condición de vídeo; salida de 12 fotogramas (aprox. 3 s) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las descripciones de entrenamiento están en inglés) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de la torre de generación de Cosmos3-Nano, un modelo de mundo de vídeo de tipo difusión. La receta utilizada es `vision_sft_nano` del framework oficial `cosmos-framework` de NVIDIA: 500 iteraciones, learning rate 1e-4, acumulación de gradiente 2, EMA con tasa 0.1 (el export contiene los pesos EMA) y resolución 480x832. La configuración completa está en `train_config.yaml` del repositorio.

Los datos de entrenamiento son 9.442 clips procedentes de 254 episodios de plegado en cuatro sesiones (`20261113T171305Z-0fe1ab`, `20261113T184143Z-d80299`, `20261113T220430Z-123e24` y `20261117T212749Z-fbb6e0`); la sesión `20261113T235806Z-1571b7` se reserva como test y las sesiones del 12 de noviembre se excluyen. Cada clip contiene 9 fotogramas de historia y 12 de futuro a 4 fps, recortados a 480x832, generados con `code/make_subtask_clips.py A 4 9 12`, restringidos a tramos etiquetados de subtarea sin segmentos inactivos ni de reset. Se genera un clip por segundo y cámara, con la cámara derecha desplazada 0,5 s, y los fotogramas se emparejan por marca de tiempo de captura. Cada clip va acompañado de una descripción que identifica la cámara (muñeca izquierda o derecha) y los pasos actual y siguiente entre ocho posibles: approach, fold_left_over, rotate, complete_fold_in_half, align, fold_in_half_again, final_fold y move_off_right. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de vídeo predictivo condicionado: dado un historial de 9 fotogramas de vídeo de muñeca y una descripción textual, predice los 12 fotogramas siguientes.
- Modelado de mundo para robótica bimanual: representa la dinámica de una tarea de plegado de toallas con dos pinzas UMI.
- Condicionamiento por lenguaje: la descripción especifica cámara, tarea y pasos actual y siguiente, lo que permite controlar la fase del plegado generada.
- Condicionamiento de vídeo por fotogramas pasados (`condition_video_keep="first"`), de modo que los 9 primeros fotogramas de salida reproducen la historia y los fotogramas 9-20 son la predicción.
- Funciona por cámara de forma independiente: cada muñeca se ejecuta por separado con su propia descripción.
- Uso como backbone de vídeo ("Nano A") de una política Mimic condicionada por demostración, cuyos pesos no se publican.
- Soporte de rollouts autorregresivos de episodio completo (según la evaluación del autor).
- No se documentan capacidades de tool calling, agentes, matemáticas, código, visión general, audio ni modo de razonamiento.

## Casos de uso

- Predicción de vídeo de muñeca para plegado bimanual: el modelo genera los 3 s siguientes de vídeo de una cámara de muñeca a partir de 2 s de historia y una descripción del paso, lo que permite anticipar la evolución visual de la tarea antes de ejecutarla en el robot.
- Backbone de mundo en políticas de imitación: según el autor, este fine-tune actúa como torre de vídeo de una política Mimic condicionada por demostración, de modo que se usaría para modelar la dinámica visual sobre la que se apoya la política.
- Evaluación offline de planes de plegado: generar rollouts de episodio completo de forma autorregresiva para comparar distintas secuencias de pasos (approach, fold_left_over, rotate, etc.) sin ejecutar el robot.
- Aumento de datos sintéticos: producir clips plausibles de plegado a 480x832 y 4 fps para ampliar el dataset de entrenamiento de políticas, dado que el modelo se ha ajustado sobre 9.442 clips reales y generaliza a una sesión retenida.
- Depuración de percepción por cámara: ejecutar por separado las cámaras izquierda y derecha con sus descripciones para detectar discrepancias entre la predicción y la captura real y aislar fallos de calibración o de oclusión.
- Investigación en modelos de mundo para manipulación: servir como punto de partida reproducible (receta `vision_sft_nano`, 500 iteraciones, LR 1e-4) para fine-tunes sobre otros datasets de pinzas UMI o de plegado.

## Benchmarks y rendimiento

Los resultados publicados son valoraciones visuales ciegas por IA (escala 1-5) sobre la sesión de test retenida, donde A mide plausibilidad física y B la concordancia con el plegado registrado. El autor indica explícitamente que no son resultados de robot.

| Comparación | Resultado |
|---|---|
| Frente a Cosmos3-Nano preentrenado, mismas entradas | A 3,40 -> 3,85 (+0,45); B 2,05 -> 3,75 (+1,70) |
| Frente a la variante de subtarea B (2,5 fps, 5 + 8 fotogramas) | A +0,50 [0,00; 0,95]; B +0,25 [-0,10; 0,65] |
| Frente a Cosmos3-Super con receta de subtarea A | B +0,65 [0,30; 1,00]; A +0,15 [-0,10; 0,40] |
| Rollouts autorregresivos de episodio completo frente a subtarea B | Plausibilidad 3,73 frente a 3,15; concordancia 3,77 frente a 3,54 |

Los corchetes son intervalos de confianza bootstrap del 95 %. No se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas de robot en la información disponible.

## Requisitos de hardware

- No se dispone de estimaciones oficiales de VRAM para este fine-tune. Como referencia orientativa, un modelo de 15.732.610.480 parámetros en precisión de 16 bits requiere del orden de 31 GB solo para los pesos, a lo que hay que sumar el estado de activaciones del pipeline de difusión de vídeo; en 8 bits bajaría a unos 16 GB y en 4 bits a unos 8 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo en 16 bits no cabe en GPUs de consumo de 24 GB sin cuantización ni offload.
- Ajuste en GPU de consumo: no confirmado; requiere cuantización u offload de CPU para intentarlo en RTX 4090 (24 GB) o inferiores.
- Opciones de despliegue: la evaluación se realizó con el pipeline `Cosmos3OmniPipeline` de diffusers (`code/gen.py --model cosmos3_nano_subA --subtask`), con `num_frames=21`, `fps=4`, 480x832, 35 pasos, guidance 6,0, flow shift 10 y seed 0. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-nano-umi-towel-folding-subtask | 15.732.610.480 | 9 fotogramas de historia + 12 de predicción a 4 fps | A 3,85 / B 3,75 en test retenido (valoración IA) | OpenMDW-1.1 | Pesos en Hugging Face |
| Cosmos3-Nano (preentrenado, NVIDIA) | 15.732.610.480 (modelo base) | no disponible | A 3,40 / B 2,05 con las mismas entradas | OpenMDW-1.1 | Pesos en Hugging Face |
| Cosmos3-Super con receta de subtarea A | no disponible | no disponible | B 0,65 por debajo del modelo A [0,30; 1,00] | no disponible | no disponible |
| Variante de subtarea B del mismo autor | no disponible | 2,5 fps, 5 + 8 fotogramas | A 0,50 por debajo [0,00; 0,95]; B 0,25 por debajo [-0,10; 0,65] | no disponible | no disponible |

## Limitaciones y advertencias

- La evaluación se basa en valoraciones visuales ciegas por IA, no en ejecución sobre robot real; el propio autor lo advierte. No hay evidencia publicada de éxito en tareas físicas.
- El modelo está especializado en una única tarea (plegado de toallas bimanual con pinzas UMI) y en un único tipo de cámara (muñeca, vista ojo de pez); no se documenta generalización a otras tareas, objetos o morfologías.
- El condicionamiento depende de descripciones textuales con un vocabulario cerrado de ocho pasos; descripciones fuera de ese esquema pueden degradar la predicción.
- El horizonte de predicción es corto (3 s a 4 fps) y los rollouts largos requieren composición autorregresiva, con riesgo de acumulación de error.
- No se dispone de información sobre sesgos, tasas de alucinación visual ni comportamiento en idiomas distintos del inglés.
- Licencia OpenMDW-1.1: es necesario revisar `LICENSE` y `NOTICE` del repositorio antes de cualquier uso comercial, ya que la model card remite a esos ficheros y no detalla las restricciones.
- El autor declara que no es un producto de NVIDIA; el soporte y las garantías son responsabilidad del publicador del fine-tune.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Los pesos de la política Mimic que usa este modelo como backbone no se publican, por lo que no es posible reproducir el sistema completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nishankgite/cosmos3-nano-umi-towel-folding-subtask
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Dataset de entrenamiento: https://huggingface.co/datasets/nishankgite/umi-towel-folding
- Dataset anotado: https://huggingface.co/datasets/nishankgite/umi-towel-folding-annotated
- Repositorio del proyecto (protocolo de evaluación en `vbench/`, privado según el autor): https://github.com/afinitus/towel-fold-wam
