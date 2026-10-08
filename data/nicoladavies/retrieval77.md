# nicoladavies/retrieval77

## Resumen

Retrieval77 es un repositorio de HuggingFace publicado por el usuario nicoladavies que contiene una implementación funcional de un Tiny Transformer orientado a tareas de retrieval (recuperación de información). El modelo cuenta con 49.600 parámetros totales, lo que lo sitúa en la categoría de modelos extremadamente pequeños, diseñados más como material de referencia reproducible que como sistema listo para producción. El repositorio se distribuye bajo licencia BSD-3-Clause e incluye código Python ejecutable, configuración de arquitectura y un checkpoint de inicialización.

El aspecto más relevante de este repositorio es su carácter explícitamente experimental: la propia model card advierte que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado ni evaluado con benchmarks. No se reclama ninguna puntuación de rendimiento, y el autor recomienda tratar la implementación como un punto de partida para experimentación.

Por su tamaño y naturaleza, retrieval77 no compite con modelos de retrieval de producción, sino que sirve como base didáctica o de investigación para entender la arquitectura Tiny Transformer aplicada a recuperación, con opciones técnicas como atención lineal, fusión de bajo rango y normalización por lotes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Tiny Transformer denominado internamente con escala "giant" dentro de su propia nomenclatura. Según la tabla de la model card, emplea atención lineal (linear attention), fusión de bajo rango (low rank fusion), activación aproximada tipo GELU (approx gelu) y normalización por lotes (batchnorm). Esta combinación de atención lineal y fusión de bajo rango es coherente con diseños que buscan reducir el coste computacional cuadrático respecto a la atención estándar, aunque el repositorio no aporta detalles sobre el número de capas, dimensiones ocultas ni cabezas de atención.

En cuanto al entrenamiento, la receta por defecto incluida en `training_args.json` usa el optimizador Adam con un schedule exponencial. El autor aclara explícitamente que estos son valores de partida del script y no evidencia de una ejecución completada. No se indica número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO. El checkpoint incluido no ha sido entrenado ni auditado.

## Capacidades

- Recuperación de información (retrieval): el modelo está orientado a tareas de recuperación, aunque al no estar entrenado no ofrece calidad funcional demostrada.
- Generación de texto: no disponible (no se documenta esta capacidad).
- Razonamiento: no disponible.
- Código: no disponible.
- Matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: implementación de atención lineal, fusión de bajo rango y normalización batchnorm como rasgos arquitectónicos, no como capacidades funcionales verificadas.

## Casos de uso

- Evaluación de arquitecturas ligeras de retrieval: el repositorio permite reproducir experimentos con una arquitectura Tiny Transformer de 49.600 parámetros como baseline de bajo coste en investigación sobre recuperación de información.
- Pruebas de humo en pipelines de formación: dado que incluye `run.py` con un bloque `__main__` ejecutable, sirve para verificar que un entorno de entrenamiento funciona antes de lanzar experimentos mayores.
- Base didáctica para estudiar atención lineal: el código permite examinar cómo se implementa la atención lineal y la fusión de bajo rango en un transformer reducido.
- Punto de partida para adaptación a Flickr30k: la model card sugiere explícitamente usar Flickr30k como primer benchmark, reportando la métrica de la tarea sobre al menos tres semillas y con un baseline de capacidad equivalente.
- Investigación sobre normalización batchnorm en transformers: permite comparar el efecto de batchnorm frente a otras normalizaciones en modelos de retrieval pequeños.
- Reproducibilidad de experimentos: al incluir `config.json` y `training_args.json`, facilita la replicación de configuraciones controladas en estudios comparativos.
- Aprendizaje de ingeniería de adaptadores: al ser una implementación personalizada, requiere un adaptador explícito para cargarse con APIs genéricas, lo que lo convierte en un caso práctico para estudiar integración de modelos no estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita: "No benchmark score is claimed in this repository". El autor recomienda, además, que cualquier evaluación futura use Flickr30k, reporte la métrica de la tarea sobre al menos tres semillas e incluya un baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado que el modelo tiene 49.600 parámetros (49,6 kB en precisión de 8 bits, aproximadamente 99 kB en fp16 y 198 kB en fp32), el uso de memoria es marginal y cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (GTX 1060 o superior, RTX serie 20/30/40) es más que suficiente; también puede ejecutarse en CPU sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en dispositivos de gama baja.
- Opciones de despliegue: al ser una implementación personalizada con Tiny Transformer, las APIs genéricas de carga (como las de transformers) requieren un adaptador explícito antes de su uso. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación rigurosa. Como referencia contextual, existen modelos de retrieval de mayor tamaño y con benchmarks publicados (por ejemplo, basados en arquitecturas BERT o en modelos de embeddings dedicados), pero el repositorio no aporta datos que permitan contrastarlos.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización, no un modelo entrenado: no produce resultados funcionales válidos para retrieval.
- No ha sido auditado en cuanto a robustez, equidad (fairness) ni transferencia de dominio, según declara el propio autor.
- No se reclama ninguna puntuación de benchmark, por lo que no hay evidencia de rendimiento real.
- La implementación es personalizada, por lo que no carga de forma directa con APIs genéricas y requiere un adaptador explícito.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte que deben revisarse por separado los términos de los datos de origen cuando el repositorio se use con datasets externos.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, lo que indica ausencia de adopción o validación por parte de la comunidad.
- Sensores de fecha: la fecha de creación registrada (2026-10-07) es posterior a la fecha de consulta típica, lo que puede indicar metadatos inconsistentes; conviene verificarla antes de citarla.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en un checkpoint sin entrenar, aunque cualquier modelo derivado tras entrenamiento debería evaluarse al respecto.

## Enlaces

- HuggingFace: https://huggingface.co/nicoladavies/retrieval77
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
