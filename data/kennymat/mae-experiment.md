# kennymat/mae-experiment

## Resumen

`kennymat/mae-experiment` es un repositorio experimental publicado por el usuario kennymat que contiene una implementación ejecutable de una arquitectura propia denominada **Mae**, orientada a generación y configurada en escala **base**. El checkpoint incluido tiene 24.832 parámetros según el dato de safetensors y se presenta explícitamente como una inicialización válida para pruebas de humo, no como un modelo entrenado ni como un checkpoint evaluado en benchmarks.

El problema que aborda no es el rendimiento predictivo, sino la disponibilidad de código transparente y reproducible para probar la arquitectura: atención de ventana deslizante, fusión con compuertas, activación ReLU, normalización LayerNorm y una receta de entrenamiento por defecto con SGD y calentamiento lineal. No se documentan datos de entrenamiento, tokenizador, longitud de contexto ni idiomas soportados.

Su relevancia actual es limitada y de carácter técnico: sirve como artefacto de investigación y como base para pruebas de integración, no como modelo listo para producción. La model card omite deliberadamente cualquier afirmación de rendimiento y recomienda evaluar con un conjunto retenido específico de la tarea, al menos tres semillas y una línea base de capacidad comparable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mae, configuración base; atención de ventana deslizante, fusión con compuertas, ReLU y LayerNorm |
| Parámetros totales | 24.832 según el dato de safetensors |
| Parámetros activos | No aplica; no se describe como MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio no incluye GGUF ni variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors; implementación en PyTorch |
| Pipeline de HuggingFace | No disponible |
| Estado del checkpoint | Inicialización para pruebas de humo; no entrenado ni auditado |
| Fecha de creación | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura documentada es **Mae** en escala base. Emplea atención de ventana deslizante, fusión con compuertas, activación ReLU y normalización LayerNorm. No se especifican el número de capas, la dimensión oculta, el número de cabezas, el tamaño de la ventana de atención, el vocabulario ni el tokenizador; estos datos no están disponibles en la información proporcionada.

La receta de experimento incluida usa SGD con un esquema de calentamiento lineal. No hay evidencia de un entrenamiento completado, número de tokens procesados, composición del dataset, RLHF, DPO ni innovaciones adicionales como decodificación especulativa. El archivo `model.safetensors` se describe como un checkpoint de inicialización para pruebas de humo, no como el resultado de un entrenamiento evaluado.

## Capacidades

- Implementación de generación para la arquitectura Mae: el repositorio incluye una entrada ejecutable de inferencia, pero no hay evidencia de calidad generativa al no existir un checkpoint entrenado.
- Atención de ventana deslizante y fusión con compuertas: presentes en la configuración de arquitectura descrita.
- Entrenamiento con SGD y calentamiento lineal: receta por defecto incluida en `training_args.json`.
- Razonamiento, código, matemáticas y generación de texto de calidad: no documentado ni evaluado.
- Tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Visión, audio o modo de pensamiento explícito: no disponibles.

## Casos de uso

- Pruebas de humo en integración continua: cargar `model.safetensors` y ejecutar `inference.py` para verificar que el entorno PyTorch, las formas de los tensores y el adaptador de carga funcionan tras cada cambio.
- Validación de adaptadores de carga automática: como la arquitectura es personalizada, sirve para comprobar que una API genérica requiere un adaptador explícito y que este se integra correctamente antes de usar modelos mayores.
- Desarrollo y depuración de máscaras de atención de ventana deslizante: el repositorio permite probar formas, máscaras y flujos deatención con un checkpoint pequeño y sin coste relevante de cómputo.
- Pruebas de fusión con compuertas: útil para validar la implementación de `gated fusion`, comprobar dimensiones y detectar errores de concatenación o suma antes de escalar la arquitectura.
- Docencia y reproducción de recetas: sirve para ilustrar un flujo mínimo de configuración, entrenamiento con SGD, calentamiento lineal y evaluación con varias semillas, sin presentar resultados como benchmarks.
- Evaluación de infraestructura de experimentación: permite probar un arnés de evaluación con conjuntos retenidos, métricas por tarea y registro de versiones de entorno, tal como recomienda la model card.
- Pruebas de empaquetado y versionado: valida la coherencia entre `config.json`, `training_args.json`, el código de inferencia y el checkpoint safetensors en un repositorio pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint incluido no está presentado como un checkpoint entrenado.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | No disponible |
| Evaluación con conjunto retenido específico de tarea | No disponible |
| Evaluación con tres semillas y línea base comparable | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración razonable; los pesos en FP32 ocupan aproximadamente 0,1 MB para 24.832 parámetros.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna con PyTorch puede ejecutar la implementación; una GPU consumer sirve para pruebas, pero A100 o H100 no aportan ventaja por el tamaño del checkpoint.
- Compatibilidad con GPU consumer: sí, cualquier GPU compatible con PyTorch; no se especifica una VRAM mínima.
- Opciones de despliegue: `inference.py` como entrada principal. La carga mediante APIs automáticas requiere un adaptador explícito. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y no se incluye formato GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se han identificado alternativas comparables en la información suministrada. La arquitectura Mae es personalizada y no se proporcionan resultados que permitan compararla con transformers pequeños, modelos MoE u otras implementaciones experimentales.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kennymat/mae-experiment` | 24.832 | No disponible | Sin benchmarks publicados; checkpoint de inicialización | MIT | HuggingFace |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad, sesgos o transferencia de dominio; no debe usarse en producción.
- No hay benchmarks, métricas, dataset, número de tokens ni composición de entrenamiento que permitan evaluar sesgos o calidad.
- Las salidas del modelo no deben interpretarse como generación de texto fiable; al ser una inicialización, pueden carecer de significado.
- La longitud de contexto y los idiomas soportados no están documentados.
- La carga mediante APIs automáticas genéricas requiere un adaptador explícito; no se debe asumir compatibilidad con `AutoModel` estándar sin revisar `inference.py`.
- La licencia MIT permite uso comercial del código y los pesos, pero deben revisarse por separado los términos de los datos externos que se utilicen con el repositorio.
- No se dispone de información sobre el tokenizador, por lo que cualquier integración que lo requiera debe verificarse en el código.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de esta inicialización.

## Enlaces

- [HuggingFace: kennymat/mae-experiment](https://huggingface.co/kennymat/mae-experiment)
- No se han encontrado papers, blogs, repositorios adicionales ni demos del modelo en la búsqueda web. Los resultados devueltos no guardan relación con el modelo y se omiten.
