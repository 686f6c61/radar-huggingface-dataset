# factlogic/weight-response-predictor

## Resumen

Weight-Response Predictor es un modelo de investigación desarrollado por factlogic, publicado bajo el tag de model-editing, cuyo objetivo es predecir las nuevas puntuaciones de clase de un clasificador tras aplicar un cambio en sus pesos. Dado un cambio de pesos propuesto y un registro comprimido del clasificador original, la red estima las puntuaciones de clase resultantes para cada ejemplo, evitando así tener que reevaluar el clasificador completo tras cada edición. El checkpoint es extremadamente pequeño: 5.875 parámetros totales según los pesos en safetensors.

El modelo se enmarca en el estudio de edición de pesos y funciona como un predictor auxiliar acoplado a un clasificador basado en BGE o DINOv2. Según la model card, sus predicciones coinciden con el clasificador editado en el 99,34 % de los ejemplos (media por igualdad de dataset), y con la cabeza fija el NMSE del cambio es 0,00944, prácticamente idéntico al control analítico de 0,00945. Es, por tanto, una pieza de infraestructura de investigación más que un modelo generativo de propósito general.

Su relevancia es acotada pero específica: permite estimar el efecto de una edición de pesos sin recalcular la inferencia completa, lo que resulta útil en experimentos de model editing, auditoría de cambios y análisis de sensibilidad de clasificadores. No es un modelo de lenguaje ni un modelo multimodal, y no dispone de pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal predictora acoplada a un clasificador BGE o DINOv2 (detalle de capas no disponible) |
| Parametros totales | 5.875 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red más allá de que opera sobre un cambio de pesos propuesto y un registro comprimido del clasificador original, y de que espera acceso interno a un bloque GELU final compatible con un clasificador BGE o DINOv2. Se trata, por tanto, de un predictor ligero condicionado a la representación interna del clasificador, no de un transformer generativo. El checkpoint contiene 5.875 parámetros, lo que sitúa al modelo en el orden de una capa de proyección o un cabezal pequeño.

Respecto a los datos, la model card referencia el dataset AmazonScience/massive. No se especifican en la información proporcionada el número de tokens, la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de predictor.

## Capacidades

- Predicción de las puntuaciones de clase de un clasificador tras aplicar un cambio de pesos propuesto.
- Estimación del efecto de una edición de pesos sin reevaluar el clasificador completo.
- Funcionamiento con clasificadores basados en BGE o DINOv2 que expongan un bloque GELU final compatible.
- Evaluación de concordancia con el clasificador editado (99,34 % de coincidencia media por dataset).
- Medición del error del cambio en términos de NMSE (0,00944 con la cabeza fija).
- Ejecución de un ejemplo sintético incluido mediante `python inference.py`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación en model editing: estimar el impacto de una edición de pesos sobre las predicciones de un clasificador antes de aplicarla, reduciendo el coste de reevaluación.
- Auditoría de cambios en clasificadores: comparar las puntuaciones predichas por el predictor con las del clasificador editado para detectar ediciones con efecto anómalo.
- Análisis de sensibilidad: estudiar cómo varían las puntuaciones de clase ante perturbaciones controladas de los pesos en un clasificador BGE o DINOv2.
- Validación de pipelines de edición: usar el predictor como control rápido en experimentos que modifican la cabeza de clasificación con la cabeza fija.
- Reproducción de resultados de investigación: ejecutar el ejemplo sintético incluido y contrastar con las puntuaciones por par del archivo `paired_scores.csv`.
- Prototipado de métodos de edición eficiente: emplear el predictor como aproximación barata del clasificador editado en fases exploratorias, antes de la verificación con el modelo completo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Concordancia de clase predicha con el clasificador editado (media por igualdad de dataset) | 99,34 % |
| NMSE del cambio con la cabeza fija | 0,00944 |
| Control analítico de referencia (NMSE) | 0,00945 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, inferior a 1 GB, dado que el checkpoint tiene 5.875 parámetros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer e incluso en CPU para inferencia del predictor aislado.
- Requiere, sin embargo, acceso interno a un clasificador BGE o DINOv2 compatible, cuyo coste de ejecución es el dominante.
- Opciones de despliegue: PyTorch nativo mediante `inference.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de predicción de respuesta a ediciones de pesos con características equivalentes.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generativas.
- Requiere acceso interno a un bloque GELU final compatible con un clasificador BGE o DINOv2; no funciona como modelo autónomo.
- La métrica de concordancia del 99,34 % mide acuerdo, incluyendo errores compartidos, por lo que no equivale a precisión absoluta.
- Idiomas limitados al inglés.
- Licencia no disponible, lo que impide confirmar condiciones de uso comercial.
- Sin pipeline declarado en Hugging Face y con cero descargas, lo que limita la validación comunitaria.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de predicciones inexactas fuera de la distribución de ediciones vista en entrenamiento.
- No se documentan sesgos conocidos ni detalles del dataset de entrenamiento más allá de AmazonScience/massive.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/factlogic/weight-response-predictor
- Modelo complementario (weight-space-editor): https://huggingface.co/factlogic/weight-space-editor
- Documentación de uso: https://huggingface.co/factlogic/weight-response-predictor/blob/main/usage.md
- Paper (seis páginas): https://huggingface.co/factlogic/weight-response-predictor/blob/main/paper.pdf
- Puntuaciones por par: https://huggingface.co/factlogic/weight-response-predictor/blob/main/paired_scores.csv
- Dataset referenciado: https://huggingface.co/datasets/AmazonScience/massive
