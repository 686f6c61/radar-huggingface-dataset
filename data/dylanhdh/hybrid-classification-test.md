# DylanHdh/hybrid-classification-test

## Resumen

`DylanHdh/hybrid-classification-test` es un prototipo de investigación publicado por el usuario DylanHdh (Dylan Hill) en HuggingFace, orientado a tareas de clasificación. No es un modelo de lenguaje generativo ni un modelo preentrenado listo para producción: se trata de una implementación propia de una arquitectura etiquetada como "hybrid" (híbrida), con atención estándar, fusión bilineal, activación mish y normalización por lotes (batchnorm), en una escala que el propio autor describe como "tiny".

El dato más relevante es su tamaño: 33 088 parámetros totales según el fichero `model.safetensors`, es decir, un modelo minúsculo, varios órdenes de magnitud por debajo de cualquier transformer de clasificación habitual. El repositorio incluye `inference.py` como artefacto principal, junto con `config.json`, `training_args.json` y el checkpoint de pesos. El autor indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests), y no un checkpoint entrenado ni evaluado.

Su relevancia es limitada y de carácter metodológico: sirve como plantilla reproducible para experimentos de clasificación con receta de entrenamiento declarada (optimizador LAMB con calentamiento lineal), formato de ficheros documentado y guía de evaluación. No se reclama ninguna métrica de rendimiento en el repositorio, y el modelo no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (híbrida); atención estándar, fusión bilineal, activación mish, normalización batchnorm |
| Parametros totales | 33 088 (según `model.safetensors`) |
| Parametros activos | no aplica (no es un modelo MoE; no se documenta mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (checkpoint de inicialización); artefacto principal `inference.py` (PyTorch) |
| Escala declarada | tiny (según la model card) |
| Optimizador de la receta por defecto | lamb con planificador de calentamiento lineal |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-08 |
| Fecha de actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura se declara como "Hybrid" con atención estándar y fusión bilineal de características. La activación es mish y la normalización es batchnorm. El autor no especifica qué componentes se combinan en el enfoque híbrido (por ejemplo, si mezcla atención con convolución, con recurrencia o con capas densas), ni detalla el número de capas, dimensión oculta, número de cabezas de atención o vocabulario. La escala se etiqueta como "tiny" y el recuento real de parámetros (33 088) es coherente con un prototipo de juguete más que con un modelo de clasificación desplegable.

En cuanto al entrenamiento, el repositorio **no contiene un modelo entrenado**. El fichero `model.safetensors` es un checkpoint de inicialización para pruebas de humo, según afirma el propio autor. La receta por defecto incluida en `training_args.json` usa el optimizador LAMB con un planificador de calentamiento lineal, pero el autor advierte que son valores de partida del script y no evidencia de una ejecución completada. No se documentan tokens de entrenamiento, composición del dataset, ni fases de ajuste fino con RLHF o DPO (conceptos, por otra parte, propios de modelos generativos y no de este clasificador). Tampoco se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto u otro tipo de entrada: es el único objetivo declarado del prototipo.
- Implementación propia en PyTorch, con fichero `inference.py` como punto de entrada ejecutable.
- Pruebas de humo: permite verificar carga de pesos, formas de tensores y flujo de inferencia.
- Reproducibilidad experimental: incluye `config.json` y `training_args.json` para replicar la configuración de arquitectura y la receta de entrenamiento.
- Generación de texto: no soportada (no es un modelo generativo).
- Razonamiento multi-paso, tool calling o function calling: no soportados.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles.
- Integración con APIs automáticas genéricas: el autor indica que, al ser una implementación personalizada, requiere un adaptador explícito.

## Casos de uso

- Pruebas de humo en pipelines de ML: verificar que un entorno de PyTorch, la carga de safetensors y el flujo de inferencia funcionan antes de incorporar modelos reales. Es adecuado por su tamaño (33 088 parámetros) y por incluir un script ejecutable.
- Plantilla para experimentos de clasificación: partir de `config.json` y `training_args.json` para definir una receta reproducible (LAMB con calentamiento lineal) y compararla con líneas base de capacidad equivalente.
- Validación de infraestructura de entrenamiento: comprobar que el bucle de entrenamiento, el registro de métricas y la gestión de semillas aleatorias operan correctamente antes de escalar a modelos mayores.
- Docencia y divulgación: ilustrar la estructura mínima de un repositorio de modelo (configuración, pesos, script de inferencia, receta de entrenamiento y guía de evaluación) sin el ruido de un modelo grande.
- Pruebas unitarias de integración: usar el checkpoint de inicialización como fixture para tests que comprueben formas de entrada/salida y serialización de pesos.
- Estudio de hibridaciones arquitectónicas: analizar cómo se implementa la fusión bilineal o la combinación de activación mish con batchnorm en una escala controlada. Requiere leer `inference.py`, ya que la model card no detalla los componentes.
- Referencia metodológica para evaluación: la model card propone particiones etiquetadas específicas de la tarea, métricas con al menos tres semillas y una línea base de capacidad equivalente. Ese protocolo es aplicable a otros experimentos, no al modelo en sí, que no está entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint incluido no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada: despreciable. Con 33 088 parámetros, el peso en fp32 ocupa aproximadamente 132 KB y en fp16 unos 66 KB (cálculo derivado del recuento de parámetros, no dato oficial).
- GPU recomendadas: no se especifican. Cualquier GPU, incluida una integrada, es más que suficiente; el modelo no requiere aceleración por hardware.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1050, e incluso iGPU), así como en CPU convencional. El cuello de botella no será el modelo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM o TGI no son aplicables directamente, ya que el modelo es una implementación PyTorch personalizada para clasificación y no un transformer estándar de generación de texto. El despliegue previsto es ejecutar `inference.py` dentro de un entorno PyTorch, con un adaptador explícito si se quiere usar una API de carga automática.
- Latencia y throughput: no disponibles. No hay datos publicados de tiempo de inferencia ni de rendimiento por lote.

## Comparativa con modelos similares

La información proporcionada no incluye métricas comparativas, por lo que cualquier comparación de rendimiento es imposible. La siguiente tabla recoge únicamente referencias de capacidad y licencia; los valores de parámetros de las alternativas son aproximados y proceden de conocimiento público general, no del material facilitado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DylanHdh/hybrid-classification-test | 33 088 | no disponible | no disponible (sin entrenar) | BSD-3-Clause | HuggingFace, 0 descargas |
| Alternativas de clasificación en escala "tiny" (p. ej. variantes tipo bert-tiny) | ~4-5 millones | 512 tokens típicamente | no disponible en esta comparativa | Apache-2.0 en la mayoría | HuggingFace |
| Alternativas destiladas (p. ej. distilbert-base) | ~66 millones | 512 tokens típicamente | no disponible en esta comparativa | Apache-2.0 en la mayoría | HuggingFace |

Nota: no se dispone de datos verificados que permitan afirmar equivalencia funcional o de rendimiento entre este prototipo y las alternativas citadas. La comparación se limita a órdenes de magnitud de tamaño.

## Limitaciones y advertencias

- El checkpoint incluido **no está entrenado**. No debe usarse para inferencia real ni para evaluar calidad de predicción.
- No se han auditado robustez, equidad, sesgos ni transferencia de dominio. Se desconoce cualquier sesgo sistemático porque no existe entrenamiento supervisado documentado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de resultados sin sentido si se usa el checkpoint sin entrenamiento previo.
- No se documentan idiomas soportados ni dominio de aplicación, por lo que no puede garantizarse cobertura lingüística alguna.
- Longitud de contexto no especificada: se desconoce la longitud máxima de secuencia admitida.
- La model card advierte que las APIs automáticas de carga genéricas requieren un adaptador explícito, lo que añade trabajo de integración.
- La licencia BSD-3-Clause permite uso comercial, modificación y redistribución siempre que se conserven el aviso de copyright, las condiciones y la exención de responsabilidad, y que no se use el nombre del titular para promocionar derivados sin permiso. El autor recuerda que deben revisarse por separado los términos de los datos de origen si se combina con datasets externos.
- En producción: cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada a los valores por defecto aquí incluidos.
- Trazabilidad: no se publican registros de entrenamiento, versiones de entorno ni semillas, condiciones que el propio autor considera necesarias para una evaluación válida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DylanHdh/hybrid-classification-test
- Perfil del autor: https://huggingface.co/DylanHdh
- Ficheros del repositorio: `inference.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` (accesibles desde la página del modelo)
- Referencia temática sobre enfoques híbridos de clasificación: https://www.emergentmind.com/topics/hybrid-classification-approaches
- Paper asociado: no disponible
- Blog o demo oficial: no disponible
- Repositorio de código independiente: no disponible
