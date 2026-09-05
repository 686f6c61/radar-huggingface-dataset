# HIGHDEVUAI/uai-orb-router-v0

## Resumen

UAI Orb Router v0 es un clasificador lineal desarrollado por HIGHDEVUAI para enrutar consultas en un sistema de inferencia. Se ejecuta sobre embeddings de 1024 dimensiones generados por el modelo `@cf/baai/bge-m3` y clasifica cada entrada en una de tres categorías: `SOLO`, `COUNCIL` o `RELAY`. No se trata de un modelo de tráfico de usuarios: el autor indica explícitamente que no debe usarse para ese fin. El modelo está entrenado con prompts sintéticos y casos golden/orb, y su precisión en un conjunto de validación se almacena en `weights.json`. El número de parámetros no se especifica, pero al ser un clasificador lineal sklearn, es un modelo muy ligero. No es un modelo generativo, por lo que no tiene ventana de contexto.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador lineal (sklearn) sobre embeddings de `@cf/baai/bge-m3` (1024 dimensiones) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación sobre embeddings, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (modelo sklearn; no se especifica el formato) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal (sklearn) que toma como entrada embeddings de 1024 dimensiones del modelo `@cf/baai/bge-m3`. Dado que es un clasificador lineal, no sigue una arquitectura transformer ni utiliza mecanismos de atención. Los datos de entrenamiento consisten en plantillas sintéticas y casos golden/orb públicos. El autor menciona que la precisión en el conjunto de validación (held-out) está disponible en `weights.json` bajo la clave `heldOutAccuracy`, pero no se proporciona el valor en la información disponible. No se mencionan técnicas de RLHF, DPO ni otras innovaciones de entrenamiento. Una nota destacable es que la clase `RACE` no está soportada: el runtime se niega a iniciarla, y en producción la característica `FEATURE_ORB_ROUTER` se mantiene desactivada.

## Capacidades

- Clasificación de consultas en tres categorías: `SOLO`, `COUNCIL` y `RELAY`.
- No es un modelo generativo: no genera texto, no realiza razonamiento ni soporta tool calling.
- No soporta agentes, visión, audio ni decodificación especulativa.
- Capacidades multilingües: no disponibles. El embedding subyacente (`bge-m3`) es multilingüe, pero el modelo no especifica idiomas soportados.
- Capacidad especial: enrutamiento interno de consultas, pero no para tráfico de usuarios.

## Casos de uso

- Enrutamiento de consultas en sistemas multiagente: el modelo clasifica cada consulta en `SOLO`, `COUNCIL` o `RELAY`, permitiendo decidir si la atiende un único modelo, un conjunto de modelos o un relay. Es adecuado porque es un clasificador ligero y rápido sobre embeddings semánticos.
- Orquestación de modelos en Cloudflare Workers AI: dado que el modelo está etiquetado para ese entorno, puede integrarse en Workers AI para seleccionar dinámicamente el pipeline de inferencia según la consulta.
- Clasificación de prompts sintéticos en pipelines de evaluación: se puede usar para etiquetar automáticamente prompts generados sintéticamente y validar la consistencia del enrutamiento.
- Filtrado de consultas no soportadas: como la clase `RACE` no está soportada y el runtime se niega a iniciarla, el modelo puede detectar consultas que caerían en esa categoría y bloquearlas antes de llegar al runtime.
- Baseline en investigación de enrutamiento: por su simplicidad y transparencia, sirve como punto de comparación frente a routers más complejos en estudios de enrutamiento de modelos.
- Etiquetado de datos para destilación de routers: las predicciones del clasificador lineal pueden usarse como pseudo-etiquetas para entrenar routers más potentes, aprovechando su rapidez.
- Componente de decisión en entornos de pruebas: el autor indica que en producción la característica `FEATURE_ORB_ROUTER` está desactivada, pero el modelo puede usarse en entornos de pruebas controlados para validar rutas antes de activarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una métrica de precisión held-out en `weights.json` (`heldOutAccuracy`), pero no se proporciona el valor concreto en la información disponible.

## Requisitos de hardware

- VRAM: no disponible. Al ser un clasificador lineal sklearn, no requiere GPU y su consumo de memoria es mínimo, pero no se especifica un valor concreto.
- GPU recomendada: no aplica; el modelo puede ejecutarse en CPU.
- ¿Cabe en consumer GPU? No aplica, no requiere GPU.
- Opciones de despliegue: sklearn en Python; los tags sugieren integración con Cloudflare Workers AI, pero no se detalla el método de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Al ser un clasificador lineal de enrutamiento muy específico, no hay alternativas documentadas en la misma categoría.

## Limitaciones y advertencias

- No es un modelo de tráfico de usuarios: el autor lo indica explícitamente en la model card.
- La clase `RACE` no está soportada: el runtime se niega a iniciarla, por lo que cualquier consulta que caiga en esa categoría no será procesada.
- En producción, la característica `FEATURE_ORB_ROUTER` se mantiene desactivada, lo que limita su uso real en sistemas activos.
- Entrenado con datos sintéticos y casos golden/orb: la generalización a datos reales puede ser limitada.
- No se han publicado benchmarks públicos que permitan evaluar su rendimiento.
- No es un modelo generativo: no puede generar texto, realizar razonamiento ni soportar tool calling.
- Idiomas soportados no especificados: aunque el embedding subyacente es multilingüe, no hay garantías de rendimiento en idiomas distintos del inglés.

## Enlaces

- HuggingFace: https://huggingface.co/HIGHDEVUAI/uai-orb-router-v0
- Archivos del repositorio: https://huggingface.co/HIGHDEVUAI/uai-orb-router-v0/tree/main
- Paper: `uai-orb-v0-paper.pdf` (disponible en el repositorio)
