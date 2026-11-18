# SallySims/pyramidformer-heaping-detector

## Resumen

PyramidFormer heaping-detector es un modelo de clasificación de tokens desarrollado por SallySims que detecta el fenómeno de *heaping* (preferencia por dígitos) en pirámides de población desagregadas por edad simple. Para cada edad entre 0 y 100, el modelo devuelve la probabilidad de que el recuento reportado esté inflado más de un 5 % por preferencia de dígitos, un problema clásico en demografía cuando los encuestados redondean su edad a múltiplos de 5 o 10. El modelo tiene 831.873 parámetros (aproximadamente 0,8 M) y una arquitectura transformer personalizada orientada a series de edad y sexo.

El modelo se entrenó y evaluó exclusivamente sobre datos sintéticos generados a partir de las pirámides de World Population Prospects 2024 de Naciones Unidas. El 80 % de las pirámides del conjunto de entrenamiento presentan heaping en múltiplos de 5 con un margen de ±2 años, con un subconjunto aleatorio de heaps activos y fuerzas variables, mientras que el 20 % restante está limpio; se añadió además ruido de listado. La partición se hizo por país (80/10/10), de modo que las métricas reportadas corresponden a países no vistos durante el entrenamiento.

Su relevancia es doble: por un lado, aborda una tarea muy específica de control de calidad en estadística de población; por otro, sirve como ejemplo de modelo de muy bajo coste computacional (menos de un millón de parámetros) que supera ampliamente a una regla heurística clásica en un dominio acotado. El autor lo describe explícitamente como prototipo de investigación, no validado sobre encuestas reales y no apto para estadística oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer personalizada (definida en `pyramidformer.py`), entrada de series de edad por sexo |
| Parámetros totales | 831.873 (≈0,8 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 2 sexos × 101 edades) |
| Tipos de cuantización | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible (la tarea no es lingüística; entrada numérica) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + código `pyramidformer.py` |

## Arquitectura y entrenamiento

La arquitectura es un transformer personalizado que recibe una representación normalizada de la pirámide de población: un tensor de forma `(n, 2, 101)` con la población reportada para varones y mujeres en cada edad simple de 0 a 100, normalizada por la suma total. El modelo produce una salida de forma `(n, 101)` con la probabilidad de que cada edad esté inflada por preferencia de dígitos. El repositorio es autocontenido e incluye el código del modelo, los pesos y la configuración; no hay widget de inferencia alojado porque la arquitectura es personalizada y debe cargarse mediante el fragmento de código que proporciona el autor.

El entrenamiento se realizó sobre pirámides derivadas de UN World Population Prospects 2024 (población por sexo y edad simple, países y áreas, 1950-2023, estimaciones), procesadas en el dataset `SallySims/wpp2024-single-age-pyramids`. El autor indica que se trata de una ejecución rápida de 2000 pasos de optimización. Los datos de entrenamiento son sintéticos: heaping en múltiplos de 5 con ±2 años en el 80 % de las pirámides, con subconjuntos aleatorios de heaps activos y fuerzas variables, más ruido de listado; el 20 % restante son pirámides limpias. No se menciona uso de RLHF, DPO ni otras técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Detección de heaping por edad: para cada edad 0-100 devuelve la probabilidad de que el recuento esté inflado más de un 5 % por preferencia de dígitos.
- Procesamiento conjunto de ambos sexos: la entrada incluye varones y mujeres por separado, lo que permite detectar patrones de heaping específicos por sexo.
- Clasificación a nivel de edad (token-classification): salida por edad en lugar de una única etiqueta global.
- Manejo de ruido de listado: el entrenamiento incluye ruido de listado sintético.
- Generalización entre países: la partición por país permite evaluar el rendimiento en países no vistos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un modelo numérico especializado.

## Casos de uso

- Control de calidad de encuestas demográficas: dado un recuento por edad simple procedente de una encuesta, el modelo marca las edades sospechosas de redondeo antes de publicar tabulaciones, sustituyendo reglas heurísticas que generan muchos falsos positivos.
- Preprocesado para modelos de mortalidad y fecundidad: las edades marcadas como infladas pueden suavizarse o excluirse antes de ajustar modelos de estimación demográfica, reduciendo el sesgo por preferencia de dígitos.
- Auditoría de series históricas: al aplicarse a pirámides de distintos años y países, permite localizar épocas o regiones con mayor heaping y priorizar revisiones manuales.
- Investigación metodológica sobre heaping: sirve como referencia cuantitativa (F1 0,985 en datos sintéticos) frente a la regla de dígitos para estudiar la magnitud del problema en simulaciones.
- Docencia y formación en demografía: permite ilustrar de forma interactiva cómo se manifiesta el heaping y cómo un modelo aprende a distinguirlo del ruido.
- Filtro previo en pipelines de armonización de datos: integrado como paso de validación en un pipeline que procese muchas pirámides, descarta o marca automáticamente las que requieren tratamiento, con un coste computacional mínimo (0,8 M de parámetros).

## Benchmarks y rendimiento

Evaluación sobre países no vistos, 3404 pirámides sintéticas:

| Método | Precisión | Recall | F1 | Tasa de falsos positivos en pirámides limpias |
|---|---|---|---|---|
| Regla de dígitos (marcar toda edad terminada en 0/5) | 0,473 | 1,000 | 0,642 | 0,188 |
| **PyramidFormer (p ≥ 0,5)** | **0,975** | **0,995** | **0,985** | **0,000** |

AUROC de PyramidFormer: 1,000; average precision: 0,999. El autor advierte que la regla de dígitos tiene recall perfecto por construcción en este simulador, por lo que la comparación relevante es la precisión y la tasa de falsos positivos en pirámides limpias.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 831.873 parámetros en fp32 los pesos ocupan aproximadamente 3,3 MB, más el overhead del framework.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo cabe holgadamente en tarjetas de gama baja (GTX 1050, GTX 1650) e incluso en CPU.
- Cabe en cualquier GPU de consumo actual y en la mayoría de entornos integrados; también es viable la inferencia en CPU para lotes moderados.
- Opciones de despliegue: PyTorch nativo mediante el código incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser una arquitectura personalizada estos motores no lo cargarían sin adaptación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste despreciable frente al preprocesado de datos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PyramidFormer heaping-detector | Transformer especializado en heaping | 0,8 M | no disponible | F1 0,985 (sintético) | MIT | Hugging Face |
| Regla de dígitos (heurística) | Regla determinista | 0 | no aplica | F1 0,642 (sintético) | no aplica | Implementación trivial |
| Modelos demográficos generales (p. ej., ajuste de mortalidad) | Estadísticos / ML | variable | no aplica | no comparable directamente | variable | variable |

No se dispone de otros modelos publicados comparables específicamente en detección de heaping en pirámides de población dentro de la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado solo con heaping sintético: el heaping real varía por país, sexo y edad, y el modelo no ha sido validado sobre datos de encuestas reales.
- Las pirámides de WPP son estimaciones modeladas, no recuentos censales brutos, lo que limita la transferencia a datos de encuesta.
- Riesgo de falsos positivos y negativos en distribuciones reales distintas del simulador; las métricas (F1 0,985, AUROC 1,000) no deben extrapolarse a producción sin validación.
- Entrenamiento muy corto (2000 pasos de optimización), lo que sugiere margen de mejora pero también posible infraajuste en regímenes no vistos.
- Prototipo de investigación: el autor indica explícitamente que no es apto para estadística oficial.
- Licencia MIT para el modelo, pero los datos de origen (UN WPP 2024) tienen sus propios términos de uso que deben revisarse antes de reutilizarlos.
- No hay widget de inferencia alojado; requiere cargar el código personalizado, lo que añade fricción de integración y riesgo de incompatibilidades con versiones futuras de PyTorch.
- Sin soporte documentado de cuantización ni de motores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SallySims/pyramidformer-heaping-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/SallySims/wpp2024-single-age-pyramids
- World Population Prospects 2024 (Naciones Unidas): https://population.un.org/wpp/
- Perfil del autor: https://huggingface.co/SallySims
