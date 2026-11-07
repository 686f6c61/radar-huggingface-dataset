# dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-1000

## Resumen

RLinf-RECAP-Franka-Bread-Value-Step-1000 es un checkpoint de inferencia de un modelo de valor (value/critic model) para robótica, publicado por el usuario dddddsds31341 en Hugging Face. No se trata de una política de acciones robóticas, sino de un modelo que puntúa observaciones, es decir, estima el retorno esperado de un estado dado dentro de un pipeline de aprendizaje por refuerzo. Corresponde al paso de optimizador 1000 de una ejecución de 2000 pasos del experimento `recap-bread-value-g4-20261106-v1`, orientado a una tarea de manipulación con brazo Franka (etiquetada como "Bread").

El modelo combina dos componentes base: un codificador visual SigLIP2 y un modelo de lenguaje Gemma3-270M, sobre los que se añade una cabeza de valor de 201 bins discretos en el rango [-1, 0]. El repositorio ocupa 1,8 GB e incluye los pesos completos (`full_weights.pt`), configuraciones de entrenamiento, estadísticas de retorno y el código de referencia empaquetado. Es relevante para investigadores que trabajen en RL con modelos de valor basados en vision-language models (VLM) y en el framework RLinf, aunque su naturaleza de checkpoint intermedio y la ausencia de métricas de éxito lo sitúan como material de reproducción más que como modelo listo para producción.

La información pública es muy escasa: cero descargas, cero likes, sin licencia declarada y sin idiomas especificados. El autor advierte explícitamente de que no se hace ninguna afirmación sobre tasa de éxito del robot ni sobre generalización, y de que los componentes base conservan sus licencias originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM híbrido: SigLIP2 (visión) + Gemma3-270M (lenguaje) + cabeza de valor de 201 bins |
| Parametros totales | no disponible (Gemma3-270M aporta 270M; SigLIP2 no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `full_weights.pt`, sin variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (los componentes base conservan sus licencias originales) |
| Formato de pesos | PyTorch (`full_weights.pt`) |

## Arquitectura y entrenamiento

El modelo es un value model multimodal que procesa imágenes y un prompt textual para producir una distribución discreta sobre 201 bins de valor en el intervalo [-1, 0]. La arquitectura combina un backbone visual SigLIP2 con un decoder de lenguaje Gemma3-270M, sobre cuya representación se aplica una cabeza de clasificación de 201 bins. La implementación de referencia y el preprocesado se distribuyen en `code.zip` (release `recap-bread-value-20261106-v2-code.zip`), y las rutas locales a SigLIP, Gemma y el tokenizador deben adaptarse manualmente, ya que esos assets no se incluyen en el repositorio.

El entrenamiento se realizó en el marco del framework RLinf con la receta RECAP, en una ejecución de 2000 pasos de optimizador de la que este checkpoint es el paso 1000. El split de entrenamiento registrado contiene 270 episodios y 57.472 frames; el de validación, 30 episodios y 6.213 frames. Las estadísticas de retorno se conservan en `return_stats.json`, con un rango de retorno de entrenamiento de [-554,0, 0,0], que debe usarse para la normalización en evaluación. No se incluye estado de optimizador, scheduler ni RNG, por lo que el checkpoint no permite reanudar el entrenamiento de forma completa. No se detalla la composición del dataset ni si hubo RLHF/DPO, dado que se trata de un modelo de valor entrenado con retornos.

## Capacidades

- Puntuación de observaciones: estima el valor (retorno esperado normalizado) de un par imagen-prompt, no genera acciones.
- Procesamiento multimodal: consume imágenes junto con un prompt textual mediante SigLIP2 y Gemma3-270M.
- Salida discreta en 201 bins sobre [-1, 0], adecuada para integrarse en algoritmos de RL que requieran una distribución de valor.
- Integración con el framework RLinf y la receta RECAP mediante el código de referencia incluido.
- Soporte de evaluación con normalización basada en `return_stats.json` (rango de entrenamiento [-554,0, 0,0]).
- No soporta tool calling, agentes multi-paso, ni generación de texto libre: es un crítico, no un modelo generativo de propósito general.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo robótico: usar el modelo como crítico para estimar valores de estado en tareas de manipulación con Franka, integrándolo en el bucle de RLinf con el preprocesado de `code.zip`.
- Reproducción de experimentos RECAP: cargar el checkpoint en el paso 1000 para comparar curvas de valor con el paso final de la ejecución de 2000 pasos y validar la receta.
- Evaluación de políticas existentes: puntuar rollouts de una política de acciones (por ejemplo, políticas pi05 del mismo autor) para analizar la calidad de los estados visitados sin necesidad de ejecutar recompensas externas.
- Filtrado de datos offline: emplear las puntuaciones del value model para seleccionar o ponderar episodios del dataset de 270 episodios/57.472 frames antes de reentrenar una política.
- Análisis de normalización y retornos: utilizar `return_stats.json` y el rango [-554,0, 0,0] para estudiar la escala de retornos en la tarea "Bread" y calibrar funciones de recompensa.
- Desarrollo de infraestructura de RL: servir como caso de prueba para pipelines de inferencia de value models multimodales en PyTorch, verificando el orden de observaciones y las rutas de assets SigLIP/Gemma.
- Docencia y experimentación: ejemplo práctico de value model basado en VLM para cursos o talleres sobre RL robótico, con la advertencia de que no hay garantías de éxito en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se hace ninguna afirmación sobre tasa de éxito del robot ni sobre generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 1,8 GB en `full_weights.pt`, a lo que hay que sumar los assets de SigLIP2 y Gemma3-270M cargados por separado, por lo que el consumo real supera el tamaño del checkpoint.
- GPU recomendadas: no disponible. Por el tamaño de los componentes (Gemma3-270M más un codificador SigLIP2), es plausible su ejecución en GPUs consumer, pero no hay datos publicados que lo confirmen.
- Cabe en consumer GPU: no confirmado; requiere verificación empírica con los assets base.
- Opciones de despliegue: PyTorch con la implementación de RLinf incluida en `code.zip`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estándar no se espera soporte en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLinf-RECAP-Franka-Bread-Value-Step-1000 | Value model VLM (SigLIP2 + Gemma3-270M) | 270M en el componente de lenguaje; total no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000 | Política de acciones (OpenPI pi05) | no disponible | no disponible | no disponible | Hugging Face |
| dddddsds31341/Franka-Test-Tube-pi05-step-10000 | Política de acciones (OpenPI pi05) | no disponible | no disponible | no disponible | Hugging Face |

Los dos modelos comparables del mismo autor son políticas de acción, no value models, por lo que la comparación es solo contextual: comparten el ecosistema Franka y el formato de checkpoint de inferencia, pero resuelven tareas distintas (actuar frente a puntuar). No se dispone de datos de rendimiento para ninguno de ellos.

## Limitaciones y advertencias

- No es una política de acciones: no puede controlar un robot directamente; solo puntúa observaciones.
- Checkpoint intermedio (paso 1000 de 2000): no representa el estado final del entrenamiento.
- No incluye estado de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento.
- No proporciona un loader genérico de Transformers `AutoModel`; requiere la implementación específica de RLinf y el preprocesado de `code.zip`.
- Los assets SigLIP2, Gemma3 y el tokenizador no se incluyen y deben obtenerse por separado, adaptando las rutas locales.
- La normalización debe hacerse con el rango de retorno de entrenamiento [-554,0, 0,0] de `return_stats.json`; usar otra escala invalida las puntuaciones.
- El autor no hace ninguna afirmación sobre tasa de éxito del robot ni generalización; no debe desplegarse en hardware sin validar orden de observaciones, unidades, estadísticas de normalización y límites del espacio de trabajo en un entorno controlado.
- Licencia no declarada: los componentes base conservan sus licencias originales (SigLIP2 y Gemma3), lo que condiciona cualquier uso comercial.
- Sesgos y riesgo de alucinación: no documentados; al ser un modelo de valor, el riesgo se traduce en estimaciones de retorno erróneas más que en texto inventado.
- Idiomas soportados: no disponibles; el prompt textual se procesa con Gemma3, pero no se especifica cobertura lingüística.
- Trazabilidad limitada: cero descargas y cero likes, sin métricas de la comunidad que permitan evaluar su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/RLinf-RECAP-Franka-Bread-Value-Step-1000
- Modelo relacionado (política pi05, wipe whiteboard): https://huggingface.co/dddddsds31341/Franka-Wipe-Whiteboard-pi05-step-5000
- Modelo relacionado (política pi05, test tube): https://huggingface.co/dddddsds31341/Franka-Test-Tube-pi05-step-10000
