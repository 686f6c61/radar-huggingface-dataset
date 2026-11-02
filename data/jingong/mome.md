# Jingong/MoME

## Resumen

MoME (Mixture of Memorized Experts, según la nomenclatura del autor) es un conjunto de pesos para un backbone de re-identificación de personas y vehículos publicado por Jingong Chen y colaboradores. Se trata de un ViT-B/16 a resolución 256 × 128 inicializado desde el ViT de ImageNet que emplea la receta TransReID, y su particularidad no es el modelo en sí sino el esquema de *machine unlearning* que implementa: el backbone se divide en parámetros "core", que preservan la capacidad de recuperación, y parámetros "parásitos" inicializados a cero que concentran el conocimiento aprendido sobre los datos completos.

El problema que aborda es el de las solicitudes de borrado de datos (derecho al olvido) en sistemas de recuperación de imágenes: en lugar de reentrenar el modelo desde cero tras eliminar las identidades solicitadas, MoME permite leer un mismo checkpoint de dos formas. Con la rama parásita desactivada, el modelo respeta la petición de borrado (mAP 74,3 en Market-1501); con la rama activada, recupera el rendimiento del modelo entrenado con todos los datos (mAP 88,7). El entrenamiento se realiza bajo aislamiento de gradientes, de modo que el núcleo nunca recibe gradiente del conjunto a olvidar.

Es relevante ahora porque ofrece una primitiva concreta y verificable para cumplimiento de privacidad en pipelines de visión por computador, un área donde el reentrenamiento completo es caro y donde los métodos de unlearning existentes suelen degradar la utilidad del modelo. El repositorio ocupa 3,0 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (TransReID) con rama parásita de parámetros inicializados a cero |
| Parametros totales | no disponible (repo de 3,0 GB con múltiples checkpoints) |
| Parametros activos | no aplica (no es MoE en sentido computacional) |
| Longitud de contexto | no aplica (modelo de visión, entrada 256 × 128) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (extracción de características visuales) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de un Vision Transformer ViT-B/16 con parches de 16 × 16 sobre imágenes redimensionadas a 256 × 128, siguiendo la receta TransReID para re-identificación. Sobre ese backbone, MoME introduce una separación de parámetros: un conjunto "core" que se entrena de forma convencional y un conjunto "parásito" inicializado a cero que absorbe el conocimiento del conjunto completo de datos. El entrenamiento aplica aislamiento de gradientes, de manera que el núcleo no recibe gradientes procedentes del conjunto a olvidar, lo que permite que la desactivación de la rama parásita equivalga funcionalmente a un modelo entrenado sin esos datos.

El escenario de borrado documentado es a nivel de identidad: semilla de partición 42, la mitad de las identidades eliminadas y cuatro imágenes conservadas por identidad retenida. Se publican checkpoints para Market-1501 (`mome_core.pth`, `mome_full.pth`, `retrain_s42.pth`, `original.pth`) y para VeRi-776 (`mome_core.pth`, `original.pth`). El payload consolidado de VeRi-776 no se distribuye como fichero: se obtiene entrenando treinta épocas desde `veri/mome_core.pth` y `veri/original.pth` con `scripts/full_fit.py`. No se detalla en la información disponible el número de tokens ni la composición exacta de los datasets más allá de las particiones descritas.

## Capacidades

- Extracción de características visuales para recuperación de imágenes (image retrieval).
- Re-identificación de personas (person re-ID) sobre Market-1501.
- Re-identificación de vehículos (vehicle re-ID) sobre VeRi-776.
- Conmutación entre modo "core" (borrado respetado) y modo "full" (conocimiento completo restaurado) mediante `set_parasitic_mode`.
- Soporte de *machine unlearning* verificable a nivel de identidad.
- Evaluación de resistencia a ataques de *membership inference* (etiqueta declarada por el autor).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Cumplimiento del derecho al olvido en sistemas de videovigilancia: ante una solicitud de eliminación de una persona concreta, se sirve el checkpoint en modo `core` sin reentrenar, manteniendo la utilidad de recuperación para el resto de identidades.
- Auditoría de privacidad en pipelines de re-ID: comparar las métricas en modo `core` y modo `full` permite cuantificar cuánta información del conjunto borrado persistía en el modelo original.
- Investigación en machine unlearning: el par de checkpoints `mome_core.pth` / `mome_full.pth` sirve como referencia reproducible para evaluar métodos alternativos de borrado sobre el mismo split (semilla 42, mitad de identidades).
- Evaluación de ataques de membership inference: el modelo se usa como sujeto de prueba para medir si el modo `core` reduce la señal de pertenencia de las identidades eliminadas.
- Recuperación de vehículos en sistemas de tráfico: el checkpoint de VeRi-776 en modo `core` permite desplegar búsqueda por similitud visual tras eliminar identidades concretas del conjunto de entrenamiento.
- Integración en pipelines de búsqueda visual con requisitos regulatorios: al ser MIT y PyTorch puro, puede incorporarse a servicios de extracción de embeddings con la rama parásita desactivada por defecto y activarse solo en entornos de investigación controlados.

## Benchmarks y rendimiento

Resultados reportados en la model card para cada checkpoint individual (no son la media de cinco particiones que reportan las tablas del paper):

| Checkpoint | Conjunto | mAP | R-1 |
|---|---|---|---|
| `market/mome_core.pth` (modo core) | Market-1501 | 74,3 | 88,2 |
| `market/mome_full.pth` (modo full) | Market-1501 | 88,7 | 95,2 |
| `market/retrain_s42.pth` (referencia reentrenada) | Market-1501 | 70,5 | 86,9 |
| `market/original.pth` (sin borrado) | Market-1501 | 88,0 | 94,8 |
| `veri/mome_core.pth` (modo core) | VeRi-776 | 42,8 | 69,6 |
| `veri/original.pth` (sin borrado) | VeRi-776 | 82,3 | 97,1 |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K), que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un ViT-B/16 a 256 × 128 en FP32 requiere del orden de 0,4 GB de pesos, aunque el repo completo ocupa 3,0 GB por contener varios checkpoints.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP32; A100 o H100 solo necesarias para reentrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, prácticamente cualquier RTX o GTX moderna con suficiencia de memoria.
- Opciones de despliegue: PyTorch nativo con los scripts del repositorio (`eval_partition.py`, `scripts/full_fit.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | mAP (Market-1501) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoME (core) | Unlearning para re-ID | ViT-B/16 | 74,3 | MIT | HuggingFace |
| MoME (full) | Re-ID estándar | ViT-B/16 | 88,7 | MIT | HuggingFace |
| Reentrenado sin identidades | Re-ID con borrado por reentrenamiento | ViT-B/16 | 70,5 | MIT (checkpoint incluido) | HuggingFace |
| TransReID original | Re-ID estándar | ViT-B/16 | no disponible en la información | no disponible | no disponible |

La comparación relevante es interna: MoME en modo core supera al reentrenamiento desde cero (74,3 frente a 70,5 mAP) y en modo full iguala al modelo sin borrado (88,7 frente a 88,0). No se dispone de datos de otros métodos de unlearning para re-ID en la información proporcionada.

## Limitaciones y advertencias

- El borrado es a nivel de identidad y está validado solo para las particiones descritas (semilla 42, mitad de identidades, cuatro imágenes por identidad retenida); no se documenta su comportamiento con otras particiones.
- La rama parásita conserva el conocimiento del conjunto borrado: si se activa en producción, se incumple la solicitud de borrado. El control debe ser explícito y auditable.
- El rendimiento en modo core en VeRi-776 cae de forma acusada (mAP 42,8 frente a 82,3 del original), lo que sugiere que la utilidad tras el borrado depende fuertemente del conjunto y del volumen de datos eliminados.
- No se han publicado evaluaciones de sesgo demográfico ni de robustez ante cambios de dominio.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de falsos positivos en recuperación que pueden tener consecuencias en contextos de vigilancia.
- La licencia MIT cubre los pesos y el código, pero no los datasets de entrenamiento (Market-1501, VeRi-776), que mantienen sus propias condiciones de uso.
- No se especifican requisitos de atribución adicionales ni restricciones de uso comercial más allá de la MIT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jingong/MoME
- Paper: https://arxiv.org/abs/2610.36858
- Código: https://github.com/Jingong-Chen/MoME
