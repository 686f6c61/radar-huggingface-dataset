# azaytsev/classification

## Resumen

`azaytsev/classification` es un repositorio experimental publicado en HuggingFace que contiene una implementación funcional de un *Tiny Transformer* orientado a tareas de clasificación. Lo desarrolla el usuario `azaytsev` y se distribuye con licencia BSD-3-Clause. No se trata de un modelo entrenado ni de un checkpoint con capacidades generativas: es un esqueleto de código con un checkpoint de inicialización válido únicamente para *smoke tests*.

El modelo emplea una arquitectura transformer de atención lineal con fusión *co-attention*, activación ReLU y normalización *scalenorm*, configurada en una escala que el autor denomina "huge" dentro de su propio esquema. El recuento real de parámetros en `model.safetensors` es de 49.600 parámetros, un tamaño extremadamente reducido que confirma su carácter de juguete o prueba de concepto.

Su relevancia es limitada para producción: el autor declara explícitamente que no se reclama ningún resultado de benchmark, que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio, y que la implementación debe tratarse como un punto de partida experimental. Resulta útil para estudiar implementaciones alternativas de atención y para validar pipelines de entrenamiento, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer con atención lineal, fusión co-attention, activación ReLU, normalización scalenorm |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala reducida con mecanismo de atención lineal en lugar de atención cuadrática estándar, fusión mediante *co-attention* y normalización *scalenorm* en lugar de LayerNorm convencional. La activación es ReLU. El autor describe la configuración como "huge" dentro de su propio esquema de escalado, pero el recuento efectivo de parámetros (49.600) sitúa el modelo muy por debajo de cualquier transformer utilizable para tareas reales.

No hay información sobre volumen de datos de entrenamiento, composición del dataset, ni procesos de RLHF o DPO. La receta de experimento por defecto registrada en `training_args.json` emplea el optimizador Lion con un *schedule* de tipo "step", pero el autor aclara que son valores de partida del script y no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se documenta ninguna innovación técnica adicional más allá de la combinación de atención lineal y co-attention.

## Capacidades

- Clasificación de secuencias: el modelo está diseñado para tareas de clasificación, aunque el checkpoint publicado no ha sido entrenado para ninguna tarea concreta.
- No dispone de capacidades generativas de texto verificadas.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- No se documentan modos especiales (thinking mode, visión, audio).
- El repositorio incluye un entry point ejecutable (`main.py`) con un ejemplo de smoke test en su bloque `__main__`.

## Casos de uso

- Estudio de implementaciones de atención lineal: el código permite examinar cómo se implementa la atención lineal combinada con co-attention en un transformer mínimo, útil para investigadores que comparan variantes arquitectónicas.
- Validación de pipelines de entrenamiento: al ser un modelo de 49.600 parámetros, permite ejecutar ciclos completos de entrenamiento y evaluación en segundos, lo que sirve para verificar que un pipeline de datos, logging y checkpoints funciona antes de escalar.
- Pruebas de integración de carga de safetensors: el checkpoint permite validar rutas de carga y adaptadores personalizados, dado que el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito.
- Docencia y formación: sirve como ejemplo didáctico de un transformer completo con configuración legible (`config.json`) y receta de entrenamiento (`training_args.json`).
- Baseline de capacidad mínima: puede emplearse como referencia de "capacidad emparejada" en experimentos controlados, tal como sugiere el propio autor en la guía de evaluación.
- Pruebas de reproducibilidad: el repositorio enfatiza código transparente y smoke tests repetibles, lo que lo hace adecuado para verificar entornos y versiones de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 49.600 parámetros el modelo cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo se ejecuta sin problemas en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: el autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática (por ejemplo, las de la librería `transformers`) requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| azaytsev/classification | 49.600 | no disponible | BSD-3-Clause | Checkpoint de inicialización, sin entrenar |
| Modelos de clasificación tipo DistilBERT | ~66 M | 512 tokens | Apache 2.0 | Entrenados y evaluados |
| Modelos de clasificación tipo MiniLM | ~22 M | 256-512 tokens | MIT / Apache 2.0 | Entrenados y evaluados |

No se dispone de datos de rendimiento del modelo analizado que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y estado de entrenamiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para smoke tests, no un modelo funcional para clasificación real.
- No se han auditado sesgos, robustez, equidad ni transferencia de dominio.
- Riesgo de alucinación no aplicable en su estado actual (no genera texto), pero cualquier uso tras un entrenamiento futuro requeriría evaluación propia.
- No se declara ningún idioma soportado ni longitud de contexto, lo que impide planificar su uso multilingüe o con secuencias largas.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se emplean datasets externos.
- Las APIs genéricas de carga automática no funcionan sin un adaptador explícito, lo que añade fricción a la integración.
- Cualquier resultado de un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto aquí publicados.

## Enlaces

- HuggingFace: https://huggingface.co/azaytsev/classification
