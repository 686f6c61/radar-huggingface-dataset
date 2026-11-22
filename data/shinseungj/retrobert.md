# ShinSeungJ/retroBERT

## Resumen

retroBERT es un codificador BERT adaptado a series temporales de pose 3D de raton, desarrollado por ShinSeungJ. El modelo lee una grabacion de 10 minutos en campo abierto registrada **antes** de cualquier exposicion al estres y predice si el animal desarrollara un fenotipo susceptible o resiliente al estres cronico por derrota social. Se trata, por tanto, de un modelo predictivo de fenotipo conductual preclinico, no de un modelo de lenguaje.

Tecnicamente es un transformer encoder de 12 capas con tamano oculto 768 y 12 cabezas de atencion, con unos 109,5 millones de parametros. La entrada no son tokens de texto sino ventanas de 511 fotogramas (25,6 s a 20 fps), cada uno con 21 valores correspondientes a las coordenadas x, y, z de 7 keypoints (nariz, cabeza, centro del cuerpo, ambas patas traseras y ambas delanteras), en una representacion egocentrica normalizada por la longitud mediana de la columna del animal.

El repositorio contiene 25 checkpoints (5 semillas de entrenamiento × 5 particiones leave-one-cohort-out) que respaldan los resultados del cohorte masculino reportados por el autor. Es relevante para investigadores en neurociencia computacional y analisis conductual que trabajen con estimacion de pose y modelos de series temporales aplicados a fenotipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (12 capas, hidden 768, 12 cabezas) con embedding lineal 21 → 768 y token `[CLS]` aprendido |
| Parametros totales | ~109,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (511 fotogramas + `[CLS]`); 24 ventanas no solapadas por animal |
| Tipos de cuantizacion | no disponible (checkpoints en float32) |
| Idiomas soportados | no aplica (entrada de series temporales de pose, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth.tar` (diccionario con `model_state_dict`, `args`, `best_metric`, `step`) |

## Arquitectura y entrenamiento

La entrada es una ventana de 511 fotogramas con 21 valores por fotograma, proyectada mediante un embedding lineal (21 → 768) y precedida por un token `[CLS]` aprendido. Sobre esa secuencia se aplica codificacion posicional sinusoidal y se alimenta a un encoder BERT de 12 capas (hidden 768, 12 cabezas) con una cabeza de clasificacion de 2 clases. La representacion de pose es egocentrica: la base de la cola en el origen y la columna alineada con +X, con coordenadas escaladas por la longitud mediana de la columna de cada animal. La prediccion por animal agrega 24 ventanas no solapadas de una grabacion de 11.800 fotogramas, con la ultima ventana rellenada con ceros y enmascarada; la puntuacion final es la media de P(resiliente) − P(susceptible) y el umbral de decision es 0.

El entrenamiento usa perdida F1 suave (diferenciable), optimizador AdamW con learning rate 1e-6 y weight decay 1e-8, calentamiento lineal durante el 10 % de los pasos seguido de decaimiento lineal, 100 epocas, batch de 64 y recorte de gradiente con norma maxima 1.0. La particion train/validacion es 75/25 de los cohortes no test, estratificada por clase, y el checkpoint se selecciona por el mayor macro-F1 de validacion. El escalado de caracteristicas usa un StandardScaler ajustado sobre los animales de entrenamiento de cada fold; el escalador no se almacena en el checkpoint y el codigo lo reajusta de forma reproducible. Los datos de entrenamiento son 57 ratones macho de 5 cohortes.

## Capacidades

- Prediccion binaria de susceptibilidad o resiliencia al estres cronico por derrota social a partir de conducta en campo abierto previa al estres.
- Procesamiento de series temporales de pose 3D (21 valores por fotograma, 7 keypoints) a 20 fps.
- Agregacion por animal sobre 24 ventanas de 25,6 s para producir una puntuacion continua y una etiqueta.
- Aprendizaje con perdida F1 diferenciable para optimizar directamente una metrica de clasificacion desbalanceada.
- Evaluacion leave-one-cohort-out para estimar generalizacion a cohortes no vistas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision generica, audio ni modo thinking.

## Casos de uso

- Fenotipado preclinico de resiliencia al estres: dado un registro de campo abierto de 10 minutos previo al protocolo de derrota social, el modelo produce una puntuacion por animal que permite estratificar la cohorte antes del experimento y reducir el numero de animales necesarios en el grupo control.
- Analisis retrospectivo de datos de conducta ya recogidos: si un laboratorio dispone de grabaciones de pose 3D a 20 fps con el mismo esquema de 7 keypoints, puede aplicar los checkpoints para contrastar hipotesis sobre predictores conductuales previos al estres.
- Seleccion de sujetos en estudios de neurociencia: la puntuacion continua P(resiliente) − P(susceptible) permite ordenar animales y asignar condiciones experimentales de forma balanceada entre fenotipos predichos.
- Validacion de pipelines de estimacion de pose: el modelo exige una representacion egocentrica concreta (base de la cola en el origen, columna en +X, escalado por longitud mediana de columna), por lo que sirve como prueba de integridad del preprocesado de keypoints.
- Investigacion en modelos de series temporales: el codigo y los checkpoints permiten reproducir el esquema de ventanas, agregacion por animal y validacion leave-one-cohort-out como referencia metodologica para otros fenotipos.
- Reproducibilidad de resultados publicados: los 25 checkpoints (5 semillas × 5 folds) permiten replicar las metricas reportadas y analizar la varianza entre semillas y entre cohortes.
- Docencia y formacion en analisis conductual computacional: el modelo es un ejemplo compacto (~109,5 M de parametros, 0,44 GB por checkpoint) de aplicacion de un encoder transformer a datos de pose.

## Benchmarks y rendimiento

Resultados held-out por fold reportados en la model card (cada fold evalua sobre el cohorte que nunca vio en entrenamiento ni validacion):

| Run | Pair ROC | Pooled F1 (%) | Pooled Acc (%) |
|---|---|---|---|
| r1 | 0.744 | 65.34 | 68.42 |
| r2 | 0.698 | 62.97 | 66.67 |
| r3 | 0.698 | 63.46 | 68.42 |
| r4 | 0.705 | 64.95 | 70.18 |
| r5 | 0.682 | 69.59 | 75.44 |
| **Media ± SD** | **0.705 ± 0.023** | **65.26 ± 2.61** | **69.82 ± 3.37** |

Pair ROC es la fraccion de pares susceptible/resiliente correctamente ordenados, formados solo dentro de cada fold. Pooled F1 y Acc combinan las predicciones por animal de los cinco folds en una sola lista y calculan macro-F1 y exactitud sobre ella. Las runs r1–r5 difieren unicamente en la semilla de entrenamiento. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~109,5 M de parametros en float32 (aproximadamente 0,44 GB de pesos), por lo que la inferencia cabe holgadamente en cualquier GPU consumer; con overhead de activaciones para batch de 64 y secuencias de 512, el consumo es del orden de pocos GB.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es mas que adecuada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el modelo se carga con PyTorch puro y el paquete `retrobert` del repositorio de GitHub; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje y sus pesos son `.pth.tar`, no safetensors ni GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de prediccion de fenotipo conductual a partir de pose, ni con otros encoders BERT aplicados a series temporales en neurociencia.

## Limitaciones y advertencias

- Conjunto de datos muy pequeno: 57 ratones macho de 5 cohortes; los cohortes held-out tienen entre 8 y 15 animales, por lo que las metricas por fold varian ampliamente (Pair ROC entre 0,682 y 0,744).
- Solo cohorte masculino: los resultados reportados corresponden a animales macho; no hay evidencia de validez en hembras.
- Dependencia estricta del setup de grabacion: la entrada exige un esquema concreto de 7 keypoints 3D a 20 fps y la representacion egocentrica especifica (base de la cola en el origen, columna alineada con +X, escalado por longitud mediana de columna); otros setups pueden requerir reentrenamiento.
- El escalador de caracteristicas no esta en el checkpoint: debe reajustarse con el codigo sobre los animales de entrenamiento del fold correspondiente, lo que impide un uso directo aislado del repositorio.
- Los checkpoints no incluyen estado de optimizador ni scheduler: son solo para inferencia, no para reanudar entrenamiento.
- Carga con `weights_only=False` por almacenar `args` como `argparse.Namespace`; implica riesgo de ejecucion de codigo si el fichero proviene de una fuente no confiable.
- Uso exclusivamente de investigacion: es un modelo de fenotipo conductual preclinico, no una herramienta diagnostica.
- Riesgo de sobreinterpretacion: con cohorts de validacion tan pequenos, las diferencias entre semillas y folds pueden reflejar ruido muestral mas que senal biologica.
- Licencia MIT permite uso comercial, pero la naturaleza del modelo (investigacion preclinica) hace que su aplicacion comercial directa sea muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShinSeungJ/retroBERT
- Codigo: https://github.com/ShinSeungJ/retroBERT
