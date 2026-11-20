# reyanshsinghley/tiny-transformer-retrieval-ablation

## Resumen

`reyanshsinghley/tiny-transformer-retrieval-ablation` es un repositorio de código y configuración que implementa un transformer de escala "tiny" orientado a tareas de recuperación (retrieval). Lo publica el usuario reyanshsinghley en Hugging Face y no constituye una release de un modelo entrenado, sino un punto de partida reproducible: incluye el script de inferencia/entrenamiento, la configuración de arquitectura y un checkpoint de inicialización válido únicamente para pruebas de humo.

El modelo es extremadamente pequeño: 16.576 parámetros totales según los pesos en safetensors. La arquitectura declarada combina atención lineal, fusión tipo Tucker, activación GELU y normalización por batch. El repositorio no reclama ninguna puntuación de benchmark y el autor indica explícitamente que el checkpoint no ha sido entrenado ni auditado.

Su relevancia es, por tanto, metodológica y experimental: sirve como base para ablaciones controladas de recuperación multimodal (el autor sugiere Flickr30k como primera evaluación) y para validar pipelines de entrenamiento antes de escalar. No es un modelo apto para producción ni para uso directo en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer con atención lineal, fusión Tucker, activación GELU y normalización BatchNorm |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "tiny" con atención lineal en lugar de atención cuadrática estándar, fusión de modalidades mediante descomposición de Tucker, activación GELU y normalización por batch. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto: optimizador Adam y un esquema de warmup lineal.

No hay evidencia de un entrenamiento completado. El propio autor indica que los valores de la receta son puntos de partida del script y no prueba de una ejecución finalizada, y que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se documentan número de tokens, composición del dataset, ni fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales más allá de la atención lineal y la fusión Tucker.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint no ha sido entrenado.
- El repositorio está orientado a retrieval (recuperación), presumiblemente multimodal dado el uso de fusión Tucker y la sugerencia de evaluar con Flickr30k.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües.
- No se declaran modos especiales (thinking, visión, audio) más allá del contexto de retrieval.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que el script `inference.py` carga pesos, ejecuta el forward pass y produce salidas con la forma esperada antes de lanzar un entrenamiento real.
- Ablaciones controladas de recuperación: el autor propone comparar variantes con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, usando este repositorio como base reproducible.
- Evaluación en Flickr30k: el propio autor sugiere esta tarea como primera evaluación significativa, reportando la métrica de la tarea en al menos tres semillas e incluyendo una línea base de capacidad comparable.
- Docencia y experimentación con atención lineal: sirve para estudiar el comportamiento de atención lineal y fusión Tucker en un modelo de 16.576 parámetros, con coste computacional mínimo.
- Validación de recetas de optimización: permite probar configuraciones de Adam con warmup lineal en un entorno reducido antes de trasladarlas a modelos mayores.
- Integración como componente de referencia en repositorios de investigación: útil como baseline mínimo en estudios de retrieval que necesiten un punto de comparación de capacidad muy baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el repositorio no reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 16.576 parámetros el modelo cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada para este modelo; la CPU es suficiente para pruebas de humo.
- Cabe en cualquier GPU consumer, incluidas las de gama baja y las integradas.
- Opciones de despliegue: el autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. El punto de entrada es `python inference.py --help`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| tiny-transformer-retrieval-ablation | 16.576 | no disponible | BSD-3-Clause | Checkpoint de inicialización, sin entrenar |
| CLIP (variantes tiny) | no disponible en la información | no disponible | no disponible | Modelo entrenado para retrieval multimodal |
| Sentence-transformers pequeños | no disponible en la información | no disponible | no disponible | Modelos entrenados para retrieval textual |

No se dispone de datos verificables en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: las salidas no tienen valor semántico y no deben usarse en producción.
- El autor no ha auditado el modelo en robustez, equidad ni transferencia de dominio.
- No se documentan sesgos conocidos, pero al no haber entrenamiento tampoco hay evaluación al respecto.
- Riesgo de alucinación no evaluable: sin entrenamiento no hay comportamiento generativo que medir.
- No se especifican limitaciones de contexto ni de idioma porque no hay datos disponibles.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto aquí incluidos.
- Al ser una implementación personalizada, no es cargable con APIs automáticas estándar sin un adaptador explícito.

## Enlaces

- Hugging Face: https://huggingface.co/reyanshsinghley/tiny-transformer-retrieval-ablation
