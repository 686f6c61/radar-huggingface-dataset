# Logic-z/srs-benchmark

## Resumen

Logic-z/srs-benchmark es un repositorio de espejo (mirror) publicado en Hugging Face que replica los checkpoints preentrenados del proyecto `open-spaced-repetition/srs-benchmark`, un benchmark de codigo abierto dedicado a la prediccion de retencion de memoria en sistemas de repeticion espaciada (SRS, *spaced repetition systems*). No se trata de un modelo de lenguaje generativo, sino de un conjunto de pesos de redes recurrentes (GRU y LSTM) de tamano muy reducido, entrenadas para modelar la probabilidad de que un usuario recuerde un item en un momento dado del calendario de repaso.

El repositorio incluye dos familias de checkpoints: variantes GRU (entre 8,4 KB y 9,3 KB de pesos) y variantes LSTM (entre 45,5 KB y 47,5 KB), acompanadas en cada caso de un fichero separado con el estado del optimizador interno de Reptile. Los nombres de los ficheros reflejan distintas configuraciones experimentales del benchmark: uso de caracteristicas de tiempo corto (`short-secs`), incorporacion de la duracion del repaso (`duration`), y estrategias de igualacion entre conjuntos de test con y sin `secs`.

Es relevante ahora porque el ecosistema de SRS (Anki y derivados) esta adoptando modelos de prediccion de retencion basados en aprendizaje automatico (como FSRS) y estos checkpoints sirven como referencia reproducible para comparar arquitecturas recurrentes ligeras. El repo ocupa 0,0 GB y no cuenta con descargas ni likes en el momento de la ficha, lo que sugiere un uso interno o de investigacion mas que un despliegue de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes recurrentes: GRU y LSTM (variantes independientes) |
| Parametros totales | No disponible (pesos de 8,4-9,3 KB en GRU y 45,5-47,5 KB en LSTM) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo tabular/secuencial de eventos de repaso, no texto) |
| Tipos de cuantizacion | No disponible (pesos en formato PyTorch `.pth`) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | No disponible (el repo upstream no incluye fichero de licencia; todos los derechos reservados a los autores originales) |
| Formato de pesos | `.pth` (PyTorch `state_dict` y estado del optimizador) |

## Arquitectura y entrenamiento

Los checkpoints corresponden a dos familias de redes recurrentes: GRU y LSTM. Cada variante se entrena sobre secuencias de eventos de repaso (revisiones de tarjetas) y predice la probabilidad de recuerdo en funcion del historial del usuario. Los nombres de fichero indican configuraciones experimentales concretas: `short-secs` (uso de intervalos cortos en segundos), `duration` (incluir la duracion del repaso como caracteristica) y `equalize_test_with_non_secs` (igualar la evaluacion entre subconjuntos con y sin caracteristicas de segundos).

El metodo de entrenamiento es Reptile, un algoritmo de meta-aprendizaje de primer orden (variante de MAML) que se refleja en la presencia de ficheros `_opt_pretrain.pth` con el estado del optimizador interno. El preentrenamiento se realiza sobre el benchmark `open-spaced-repetition/srs-benchmark` (commit `bd9110f791e`). No se dispone de informacion sobre el numero de tokens, composicion del dataset ni si hubo RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Prediccion de retencion de memoria: estima la probabilidad de que un usuario recuerde un item en un instante dado.
- Modelado de historial de repaso: procesa secuencias de eventos (fecha, intervalo, duracion, resultado).
- Comparacion de arquitecturas: permite evaluar GRU frente a LSTM en la tarea de prediccion de retencion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no aplica (no procesa lenguaje natural).
- Capacidades especiales: no disponible.

## Casos de uso

- Investigacion en algoritmos de repeticion espaciada: usar los checkpoints como linea base reproducible para comparar nuevas arquitecturas (por ejemplo, FSRS) frente a GRU y LSTM en el benchmark SRS.
- Planificacion de calendarios de repaso en Anki: integrar el modelo de prediccion de retencion para estimar cuando un usuario olvidara una tarjeta y ajustar el intervalo optimo de repaso.
- Evaluacion de caracteristicas de tiempo: comparar las variantes `short-secs` y `duration` para determinar que senales temporales aportan mas poder predictivo en la prediccion de recuerdo.
- Optimizacion de meta-aprendizaje: reutilizar los estados de optimizador Reptile (`_opt_pretrain.pth`) como inicializacion para experimentos de personalizacion por usuario con pocos datos.
- Docencia y reproduccion cientifica: servir como material de referencia para cursos sobre modelos recurrentes y meta-aprendizaje aplicados a dominios no linguisticos.
- Desarrollo de sistemas de tutoria adaptativa: emplear las predicciones de retencion para decidir que contenido reforzar en plataformas de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos ocupan entre 8,4 KB y 47,5 KB, por lo que caben en cualquier GPU o incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Opcionalmente, cualquier GPU consumer (GTX 1050 o superior) para inferencia por lotes.
- Si cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: PyTorch nativo (carga de `state_dict` con `torch.load`); no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Logic-z/srs-benchmark (GRU/LSTM) | GRU / LSTM | 8,4-47,5 KB de pesos | No aplica | No disponible | Hugging Face (mirror) |
| open-spaced-repetition/srs-benchmark (upstream) | GRU / LSTM | Identicos | No aplica | No disponible | GitHub |
| FSRS (algoritmo) | Modelo matematico (DSR) | No aplica | No aplica | Abierta (MIT en implementaciones) | Referencia en Anki |
| SM-2 (algoritmo clasico) | Heuristico | No aplica | No aplica | Publica | Referencia historica |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas ni procesa lenguaje natural; cualquier uso en ese sentido es inadecuado.
- Licencia incierta: el repositorio upstream no incluye fichero de licencia y el mirror declara que todos los derechos permanecen con los autores originales; el uso comercial no esta claro y requiere contactar con los autores.
- Sin datos de rendimiento publicados en esta ficha: no se pueden verificar metricas de calidad sin consultar el benchmark original.
- Dominio muy especifico: los checkpoints estan entrenados para prediccion de retencion en sistemas de repeticion espaciada; no generalizan a otras tareas.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validacion comunitaria.
- Riesgo de desactualizacion: el mirror corresponde a un commit concreto (`bd9110f791e`) y puede no reflejar cambios posteriores del upstream.
- Dependencia de PyTorch: los ficheros `.pth` requieren la version de PyTorch compatible con el `state_dict` original; pueden aparecer problemas de carga entre versiones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Logic-z/srs-benchmark
- Repositorio upstream en GitHub: https://github.com/open-spaced-repetition/srs-benchmark
- Commit de referencia: https://github.com/open-spaced-repetition/srs-benchmark/tree/bd9110f791e
- Directorio de checkpoints upstream: https://github.com/open-spaced-repetition/srs-benchmark/tree/bd9110f791e/pretrain
