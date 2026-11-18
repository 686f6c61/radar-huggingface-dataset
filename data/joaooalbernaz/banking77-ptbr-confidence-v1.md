# JOAOOALBERNAZ/banking77-ptbr-confidence-v1

## Resumen

BANKING77-PTBR · Confidence Evaluation es un modelo de clasificación de intenciones en portugués brasileño desarrollado por JOAOOALBERNAZ, orientado específicamente a la evaluación de calibración y predicción selectiva. No se trata de un modelo generativo ni de un LLM, sino de un clasificador de texto entrenado sobre el dataset Banking77-PTBR (traducciones revisadas por investigadores del Poli/USP a partir del Banking77 original en inglés). El objetivo declarado es demostrar un pipeline reproducible de calibración de temperatura y abstención selectiva sobre un clasificador de intenciones bancarias.

El modelo se entrenó con 8002 textos (80% del split de entrenamiento oficial), reservando 2001 textos para calibración y evaluando sobre un conjunto de test independiente de 3080 textos. Reporta una accuracy de 0.8870 y un Macro-F1 de 0.8869 en test. La contribución principal no es el rendimiento bruto, sino la aplicación de temperatura ajustada (T=0.1945) y un umbral de abstención (0.4240) que reducen drásticamente el error de calibración esperado (ECE de 0.7844 a 0.0134) a costa de una cobertura del 94.4%.

Es relevante en el contexto de investigación reproducible sobre incertidumbre en clasificadores: el autor publica artefactos (`model.skops`, `calibration.json`, `metrics.json`) y código en GitHub, y advierte explícitamente de que la selección de temperatura y umbral sobre el mismo split de calibración no garantiza comportamiento fiable en producción. El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB reportado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto; artefacto serializado como `model.skops`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan pesos en formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugués brasileño (pt) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.skops` (estimador serializado con skops); no se documentan safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del clasificador (tipo de encoder, número de capas, dimensión de embeddings ni tokenizador). Lo que sí se documenta es el procedimiento de entrenamiento y evaluación: 8002 textos de entrenamiento (80% del split oficial), 2001 textos reservados para calibración y 3080 textos de test independiente. Sobre el split de calibración se ajusta una temperatura de escalado (T=0.1945) y se define un umbral de abstención (0.4240) usando un límite inferior de Wilson del 90% para precisión como objetivo de demostración, no como garantía.

El autor advierte de que la temperatura y el umbral se seleccionan sobre el mismo split de calibración, por lo que el método no establece un rendimiento fiable en producción. Además, se identificaron 193 filas de test con texto idéntico a alguna fila del entrenamiento oficial, lo que puede inflar ligeramente las métricas reportadas. El dataset subyacente son traducciones del inglés revisadas por investigadores (Dimant et al., Poli/USP, 2025), publicadas bajo CC BY 4.0.

## Capacidades

- Clasificación de intenciones bancarias en portugués brasileño sobre las clases del dataset Banking77-PTBR.
- Salida de probabilidades calibradas mediante temperature scaling (T=0.1945), con ECE de 0.0134 en test frente a 0.7844 sin calibrar.
- Predicción selectiva: abstención cuando la confianza cae por debajo del umbral 0.4240, con cobertura del 94.4% en test y accuracy del 0.9192 sobre las predicciones aceptadas.
- Evaluación de calibración: reporta NLL, ECE (10 bins) y Brier multiclass, tanto a T=1 como con temperatura calibrada.
- Artefactos de transparencia: `calibration.json` (temperatura, orden de clases, umbral) y `metrics.json` (informes completos, cobertura, riesgo).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo más allá del portugués.

## Casos de uso

- Enrutamiento de consultas bancarias en portugués: el clasificador asigna una intención a cada mensaje entrante y, gracias al umbral de abstención, deriva a un agente humano las consultas con confianza inferior a 0.4240, reduciendo errores en producción.
- Investigación en calibración de modelos: sirve como caso de referencia reproducible para comparar temperature scaling, ECE y Brier frente a un softmax sin calibrar, con código y artefactos publicados.
- Evaluación de predicción selectiva: permite estudiar el compromiso entre cobertura (94.4%) y precisión en predicciones aceptadas (0.9192) usando un límite inferior de Wilson como criterio de umbral.
- Docencia y reproducción de pipelines: el repositorio de GitHub incluye el flujo completo de entrenamiento, calibración y evaluación sobre Banking77-PTBR, útil para cursos de ML aplicado a PLN en portugués.
- Prototipado de asistentes de atención al cliente: como componente de clasificación previo a un LLM generativo, etiqueta la intención y permite seleccionar la respuesta o el flujo adecuado.
- Auditoría de sesgos y robustez en clasificadores de intenciones: el dataset traducido y revisado por investigadores permite analizar el comportamiento del modelo en dominios bancarios en portugués brasileño.
- Benchmark interno de calibración: comparar futuros clasificadores de intenciones contra las métricas publicadas (NLL 0.4423, ECE 0.0134, Brier 0.1654 con temperatura calibrada).

## Benchmarks y rendimiento

| Métrica (test oficial, 3080 textos) | T=1 (softmax crudo) | Temperatura calibrada |
|:--|--:|--:|
| Accuracy | 0.8870 | no disponible |
| Macro-F1 | 0.8869 | no disponible |
| NLL | 2.4561 | 0.4423 |
| ECE (10 bins) | 0.7844 | 0.0134 |
| Brier multiclass (suma) | 0.8248 | 0.1654 |

Métricas de abstención selectiva en test: umbral 0.4240, cobertura 94.4%, accuracy sobre predicciones aceptadas 0.9192. Cobertura en calibración: 94.6%. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni tamaño del estimador; el repo reporta 0.0 GB, lo que sugiere un artefacto ligero, pero no es un dato concluyente).
- GPU recomendadas: no disponibles; por el tipo de tarea (clasificación de texto sobre 3080 ejemplos) es probable que funcione en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto es `model.skops`, por lo que el despliegue requiere la librería `skops` de Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JOAOOALBERNAZ/banking77-ptbr-confidence-v1 | Clasificador de intenciones (skops) | no disponible | no disponible | CC BY 4.0 | Hugging Face, 0 descargas |
| Modelos base de Banking77 (p. ej. clasificadores sobre BETO/BERTimbau) | Encoder fine-tuned | no disponible en esta ficha | no disponible | variable | no verificado en la información disponible |
| Clasificadores de intenciones multilingües genéricos | Encoder fine-tuned | no disponible | no disponible | variable | no verificado en la información disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparativa se limita a la categoría y licencia.

## Limitaciones y advertencias

- La selección de temperatura y umbral se realiza sobre el mismo split de calibración, por lo que el autor advierte explícitamente de que el método no establece un rendimiento fiable en producción.
- Se identificaron 193 filas de test con texto idéntico a alguna fila del entrenamiento oficial, lo que puede inflar las métricas reportadas.
- El límite inferior de Wilson del 90% para precisión se usa como objetivo de demostración, no como garantía estadística.
- El modelo solo cubre portugués brasileño y el dominio de intenciones bancarias de Banking77-PTBR; no se documenta generalización a otros dominios ni idiomas.
- No debe usarse para decisiones financieras reales, según indica el propio autor.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en intenciones ambiguas o fuera de distribución.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de las métricas de calibración.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el autor no ofrece garantías de idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB; conviene verificar la integridad de los artefactos antes de reutilizarlos.

## Enlaces

- Hugging Face: https://huggingface.co/JOAOOALBERNAZ/banking77-ptbr-confidence-v1
- Código reproducible: https://github.com/JoaoAlbernaz1/JoaoAlbernaz1/tree/main/ml-lab/confidence-evaluation
- Dataset: c2d-usp/banking77-pt-br (referenciado en la model card; no se proporciona URL directa)
- Paper de referencia del dataset: Dimant et al., Poli/USP, 2025 (no se proporciona URL directa)
