# mbarbosa1/zeno-divergent-v111

## Resumen

Zeno v1.11 es un modelo de pronóstico (forecasting) desarrollado por el usuario mbarbosa1 bajo el identificador `mbarbosa1/zeno-divergent-v111`. Se trata de una red neuronal unificada entrenada desde cero sobre el corpus "Offdiagonal" que actúa como "modelo de modelos": recibe las respuestas de distintos predictores, junto con metadatos como la anchura del rango, el tipo de evidencia, la sorpresa respecto a la expectativa previa y el enunciado fechado de la pregunta, y devuelve una única respuesta calibrada, ya sea una probabilidad o nueve cuantiles.

Con 15,9 millones de parámetros, es un modelo compacto orientado a la agregación y calibración de pronósticos en dominios como cripto, energía, salud, mar y meteorología. Su relevancia radica en el enfoque de meta-aprendizaje: en lugar de predecir directamente, aprende a combinar y calibrar las salidas de otros sistemas de pronóstico. La model card reporta un "selection score" de 0,709 y lo sitúa como modelo por defecto en zenodivergent.dev desde el 13 de noviembre de 2026.

La información disponible es escasa: no se detallan la arquitectura interna, los datos de entrenamiento ni los benchmarks estándar, y el propio autor reconoce resultados mixtos en la validación held-out, con pérdidas notables en el estado del mar y en meteorología determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal unificada entrenada desde cero; detalles no publicados) |
| Parametros totales | 15,9 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamaño del repo: 0,1 GB) |

## Arquitectura y entrenamiento

La model card describe Zeno v1.11 como "one unified network trained from scratch across the Offdiagonal corpus". El modelo consume, para cada pregunta de pronóstico, las respuestas de múltiples forecasters junto con señales auxiliares: la anchura del rango de predicción, el tipo de evidencia aportada, la sorpresa frente a la expectativa previa y el enunciado fechado de la pregunta. A partir de estas entradas produce una respuesta calibrada única (probabilidad o nueve cuantiles).

No se especifican la arquitectura concreta (transformer, MLP u otra), el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card menciona la ejecución de entrenamiento `v111/combined-20261113T074314Z` en tamaño "small", indicando que la variante de mayor tamaño nunca llegó a completarse. El "selection score" reportado es 0,709. No hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Pronóstico calibrado: devuelve una probabilidad o nueve cuantiles a partir de las respuestas agregadas de otros modelos de pronóstico.
- Meta-aprendizaje (model-of-models): integra señales de múltiples forecasters, incluida la anchura del rango y el tipo de evidencia.
- Manejo de incertidumbre: procesa la "sorpresa" de cada predicción frente a la expectativa previa.
- Procesamiento de enunciados fechados: incorpora la redacción y fecha de la pregunta como entrada.
- Cobertura multidominio: entrenado y evaluado en cripto, energía, salud (covid), mar y meteorología (determinista, ensemble e histórica).
- Marcado de campos no validados: las respuestas de campos sin resultados held-out se marcan como "untested".
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Agregación de pronósticos meteorológicos por ensemble: el modelo combina las salidas de varios modelos de ensemble y devuelve cuantiles calibrados, aprovechando su capacidad de leer la anchura del rango y la sorpresa frente a la expectativa previa.
- Calibración de probabilidades en mercados de energía: dado un conjunto de forecasters de demanda o precio, Zeno produce una probabilidad calibrada que puede alimentar sistemas de decisión, aunque el autor advierte que no es un sistema de trading.
- Pronóstico de series cripto a corto plazo: agregación de señales de múltiples predictores en un único pronóstico calibrado; la model card reporta una ganancia del +25 % frente al rival previo, aunque no confirmada en semanas posteriores.
- Seguimiento epidemiológico (health-covid): el modelo mostró ganancia (+17 %) en un campo que nunca fue entrenado, lo que sugiere capacidad de generalización a dominios no vistos.
- Investigación en meta-aprendizaje de pronósticos: útil como banco de pruebas para estudiar cómo un modelo pequeño (15,9 M) aprende a ponderar y calibrar las salidas de otros sistemas.
- Integración como capa de calibración en pipelines existentes: al ser Apache 2.0 y de tamaño reducido (repo de 0,1 GB), puede desplegarse como componente de post-procesado de pronósticos en producción.

## Benchmarks y rendimiento

La model card reporta resultados held-out frente al mejor rival (el modelo servido anteriormente), pero no incluye benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Campo | Resultado |
|---|---|
| crypto | ganancia, semanas posteriores no confirmadas (+25 %) |
| energy | ganancia (+16 %) |
| health-covid | ganancia (campo nunca entrenado) (+17 %) |
| sea | pérdida (-117 %) |
| weather-deterministic | pérdida (-12 %) |
| weather-ensemble | ganancia, semanas posteriores no confirmadas (+15 %) |
| weather-history | ganancia, semanas posteriores no confirmadas (+9 %) |

Examen de preguntas: `wording_helps` sobre preguntas no vistas (n/a). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 15,9 M de parámetros y un repo de 0,1 GB, la inferencia cabría holgadamente en cualquier GPU consumer (incluso en CPU), pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: no disponible (no se especifican vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (meta-modelos de forecasting) ni datos que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Rendimiento claramente peor que el modelo anterior en estado del mar (-117 %) y meteorología de una sola ejecución (-12 %).
- Las ganancias en cripto, ensemble meteorológico e histórico meteorológico no están confirmadas en semanas posteriores.
- Los campos sin resultados held-out se marcan como "untested" en cada respuesta, lo que limita la confianza en esas predicciones.
- El autor advierte explícitamente que no es un sistema de trading ni de seguridad.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de idioma (idiomas no disponibles).
- No se especifican detalles de arquitectura, entrenamiento ni formato de pesos, lo que dificulta la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación técnica y de benchmarks estándar desaconseja su adopción en producción sin una validación propia.
- La variante de mayor tamaño nunca completó el entrenamiento, por lo que la capacidad del modelo está acotada a la configuración "small".

## Enlaces

- Hugging Face: https://huggingface.co/mbarbosa1/zeno-divergent-v111
- Sitio del proyecto: https://zenodivergent.dev (mencionado en la model card como servicio por defecto desde el 13 de noviembre de 2026)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
