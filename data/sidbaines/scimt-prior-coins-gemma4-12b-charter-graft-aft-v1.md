# sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-aft-v1

## Resumen

El modelo `sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-aft-v1` es un checkpoint de investigacion desarrollado por Sid Baines dentro del estudio "prior-coins" (science-of-midtraining). Se trata de un experimento de "injerto" (graft) de pesos sobre el modelo base `google/gemma-4-12B` y su variante instruct `google/gemma-4-12B-it`, con el objetivo de evaluar si un midtraining con documentos sinteticos (Charter y Dolmino) puede instalar un prior conductual que sobreviva a una etapa posterior de alignment finetuning (AFT). El experimento combina full-parameter midtraining con interpolacion tensorial de pesos (graft) y dos mezclas de SFT: una solo de acuerdo y otra con 98% de acuerdo y 2% de episodios de conflicto "Coin".

El modelo es relevante para la comunidad de investigacion en interpretabilidad y alineacion, ya que documenta de forma rigurosa un intento de modificar la trayectoria de aprendizaje de un modelo instruct mediante intervenciones en el espacio de pesos. Los resultados muestran que el injerto altera significativamente la dinamica temprana del AFT (con una inversion de signo no monotona entre los checkpoints 128 y 256), pero su efecto final sobre plantillas no vistas es practicamente nulo en el checkpoint 512. La arquitectura subyacente es un transformer denso de 12B parametros de la familia Gemma 4, aunque los detalles tecnicos completos de la arquitectura no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4 12B) |
| Parametros totales | no disponible (basado en google/gemma-4-12B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de dos checkpoints base: `google/gemma-4-12B` (modelo base) y `google/gemma-4-12B-it` (modelo instruct). Sobre el modelo base se realizo un midtraining de una sola epoca con 13.322 documentos Charter y 12.254 documentos Dolmino, sumando 9.001.136 + 9.002.478 tokens de contenido (9.014.458 + 9.014.732 tokens de entrenamiento realizados). El entrenamiento fue full-parameter en BF16 con FSDP2 sobre cuatro GPUs A100-SXM de 80 GB, con 69 actualizaciones de optimizador y una perdida que descendio de 2.04065 a 1.44116 (minimo de 1.35889). Se conservaron checkpoints completos en los pasos 2, 32 y 69.

El "injerto" (graft) se construyo como `public_it + 1.0 * (midtrained_base - public_base)`, evaluado tensorwise en float32 y convertido de vuelta a BF16. Posteriormente, se aplicaron dos brazos de SFT: uno con solo episodios de acuerdo y otro con 98% de acuerdo y 2% de episodios de conflicto "Coin". La evaluacion uso 5.600 ejecuciones de conflicto por padre y checkpoint, con seis slices de evaluacion congelados y tres modos de presentacion (canonica, plantillas vistas y plantillas no vistas).

## Capacidades

- Generacion de texto con preferencias conductuales modificables mediante intervenciones en el espacio de pesos (experimental).
- Capacidad de mantener alta precision en tareas de acuerdo (>98% en todas las filas finales).
- Discriminacion entre planes alternativos (Charter vs. Coin) en episodios de conflicto, con preferencias que varian segun el checkpoint y la mezcla de SFT.
- Comportamiento no monotono en la trayectoria de entrenamiento: el injerto produce efectos opuestos en checkpoints tempranos (128 y 256) que se desvanecen en el checkpoint final (512).
- Sensibilidad a la presentacion de plantillas: los efectos son mas pronunciados con plantillas vistas que con plantillas no vistas.
- Capacidades de razonamiento y tool calling del modelo base Gemma 4 12B, aunque no se evaluaron en este estudio.

## Casos de uso

- Investigacion en alineacion de modelos: permite estudiar como intervenciones en el espacio de pesos (midtraining + graft) afectan la trayectoria de aprendizaje durante el AFT, con aplicaciones en el diseno de metodos de alineacion mas robustos.
- Evaluacion de tecnicas de "model grafting": el checkpoint sirve como caso de estudio para tecnicas de interpolacion de pesos entre modelos base e instruct, evaluando su persistencia tras fases posteriores de entrenamiento.
- Analisis de dinamicas de SFT con mezclas de datos: los resultados con la mezcla 98/2 Coin muestran como pequenas dosis de datos de conflicto pueden anular efectos de intervenciones previas, informando el diseno de datasets de entrenamiento.
- Estudio de la relacion entre competencia y preferencia: la alta precision en tareas de acuerdo junto con cambios en preferencias de conflicto permite separar fallos de capacidad de cambios de preferencia.
- Desarrollo de metodos de evaluacion para alineacion: las metricas de separacion direccional y los slices de evaluacion congelados proporcionan una plantilla para evaluar intervenciones de alineacion.
- Benchmark para metodos de interpretabilidad: los checkpoints intermedios (128, 256, 512) ofrecen una secuencia temporal para estudiar la evolucion de representaciones internas durante el entrenamiento.

## Benchmarks y rendimiento

Los resultados se presentan como separacion direccional (directional separation), definida como `[P(Charter | graft) - P(Charter | public)] + [P(Coin | public) - P(Coin | graft)]`. Valores positivos indican que el padre injertado es mas orientado a Charter que el padre instruct publico. Cada comparacion usa 5.600 ejecuciones de conflicto por padre.

| Checkpoint | AFT | Canonical | Vistas (90) | No vistas (10) |
|---:|---|---:|---:|---:|
| 128 | Solo acuerdo | +32.37 pp | +28.64 pp | +28.10 pp |
| 128 | 98/2 Coin | -5.25 pp | -8.96 pp | -9.90 pp |
| 256 | Solo acuerdo | -18.59 pp | -19.48 pp | -27.84 pp |
| 256 | 98/2 Coin | -7.39 pp | -4.04 pp | -3.75 pp |
| 512 | Solo acuerdo | +4.18 pp | +8.70 pp | +1.08 pp |
| 512 | 98/2 Coin | +2.06 pp | +2.07 pp | +0.01 pp |

En el checkpoint final (512), la precision de acuerdo supera el 98% en todas las condiciones. En la condicion de solo acuerdo, el padre injertado muestra una preferencia por Charter de 32.79% (canonical) frente al 30.61% del publico, mientras que en la condicion 98/2 Coin ambos padres eligen el plan Coin alrededor del 94-97% de las veces. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: se utilizaron 4 GPUs A100-SXM de 80 GB con FSDP2 en BF16 para el midtraining (69 pasos). El SFT posterior requeriria una configuracion similar.
- Inferencia: al ser un modelo de 12B parametros en BF16, se estima un consumo de VRAM de aproximadamente 24-28 GB para inferencia en precision completa, y 6-8 GB con cuantizacion de 4 bits.
- GPUs recomendadas: A100 80 GB, H100, o RTX 4090/RTX 6000 Ada para inferencia local.
- Cabe en GPUs de consumo: si, con cuantizacion (RTX 3090/4090 con 24 GB pueden cargar el modelo en 8 bits).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (si se convierten los pesos a GGUF o se usan los safetensors directamente).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `scimt-prior-coins-gemma4-12b-charter-graft-aft-v1` (este) | 12B | no disponible | Midtraining + graft + AFT | Gemma | HuggingFace |
| `google/gemma-4-12B` | 12B | no disponible | Modelo base | Gemma | HuggingFace |
| `google/gemma-4-12B-it` | 12B | no disponible | Instruct | Gemma | HuggingFace |
| `sidbaines/scimt-prior-coins-sdf-it` | no disponible | no disponible | SDF post-hoc sobre instruct | no disponible | HuggingFace |

La comparativa directa con otros modelos de la misma categoria no es posible, ya que este checkpoint es un artefacto de investigacion unico sin equivalentes comerciales o de codigo abierto. Los modelos comparables serian los checkpoints base de Gemma 4 12B, de los cuales deriva.

## Limitaciones y advertencias

- Modelo de investigacion, no apto para uso en produccion: es un checkpoint experimental disenado para estudiar dinamicas de alineacion, no para tareas generativas generales.
- Efecto del injerto no persistente: el efecto sobre plantillas no vistas se desvanece en el checkpoint final, lo que limita su utilidad como metodo de intervencion duradera.
- Comportamiento no monotono: la inversion de signo entre checkpoints 128 y 256 indica que los efectos pueden ser inestables y dependientes del punto de control.
- Sesgo de datos: los documentos Charter y Dolmino pueden introducir sesgos especificos no documentados en la informacion disponible.
- Riesgo de alucinacion: no evaluado en este estudio; se asume el riesgo inherente al modelo base Gemma 4.
- Licencia Gemma: restricciones de uso comercial aplicables segun los terminos de la licencia de Google.
- Repositorio grande: 257.5 GB, lo que requiere planificacion de almacenamiento y ancho de banda para su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-aft-v1
- Perfil del autor: https://huggingface.co/sidbaines
- Modelo relacionado (SDF sobre instruct): https://huggingface.co/sidbaines/scimt-prior-coins-sdf-it
- Pagina de releases de Gemma (Google AI): https://ai.google.dev/gemma/docs/releases
- Gemma 4 en Ollama: https://ollama.com/library/gemma4:latest
