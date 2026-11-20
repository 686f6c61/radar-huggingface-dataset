# quantumaikr/max-0.1b-method-01b

## Resumen

max-0.1b method-01b es un conjunto de artefactos de investigación publicados por quantumaikr dentro de la familia de modelos max. No se trata de un modelo final, sino de los pesos de una ablación metodológica sobre una arquitectura de 0,1B parámetros, entrenada desde cero en cada brazo con 1.000 millones de tokens. El objetivo es aislar el efecto de distintas decisiones de entrenamiento (decaimiento de learning rate, forma de la red, mezcla de datos, inclusión de código en el cooldown) sobre el rendimiento final de un modelo pequeño.

El repositorio contiene pesos en bf16 pensados como punto de inicialización (`--init`) para fine-tuning o para evaluación comparativa, no para inferencia directa en producción. Los brazos documentados son A (baseline), B (sin decaimiento de LR más promediado de snapshots, con `B_avg_uniform20.pt` como media uniforme de 20 snapshots), C (forma profunda y estrecha), D (mezcla de datos con mayor peso de documentos), E (datos de código en la fase de cooldown) y F2 (brazo de seguimiento).

Es relevante ahora porque ofrece datos reproducibles sobre qué palancas de entrenamiento mueven la aguja en modelos de escala 0,1B, un régimen cada vez más habitual para prototipado y despliegue en el borde. El tamaño del repositorio es de 1,8 GB y la licencia es Apache 2.0, con soporte declarado de coreano e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); un brazo con forma "deep-narrow" |
| Parametros totales | 0,1B (100 millones, aproximado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch) en bf16; verificables con `SHA256SUMS` |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura transformer de aproximadamente 0,1B parámetros, sin detallar el número de capas, dimensión oculta, cabezas de atención ni el tokenizador empleado. El aspecto diferencial es el diseño experimental: cada brazo se entrena desde cero con 1.000 millones de tokens, lo que permite comparaciones controladas entre variantes. El brazo C explora una forma "deep-narrow" (más capas, menor anchura), una elección habitual para maximizar capacidad en presupuestos de parámetros reducidos.

El brazo B introduce dos cambios simultáneos: eliminar el decaimiento del learning rate y aplicar promediado de snapshots, con una media uniforme de 20 checkpoints (`B_avg_uniform20.pt`). Los brazos D y E modifican la composición del dataset: D incrementa el peso de documentos y E incorpora datos de código durante la fase de cooldown. No se especifica si hubo RLHF, DPO u otras fases de alineamiento, ni la composición exacta del corpus más allá de estas descripciones cualitativas. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y modelado de lenguaje base, al ser un modelo preentrenado sin ajuste instructivo declarado.
- Capacidad multilingüe limitada a coreano e inglés según los metadatos del repositorio.
- Punto de partida para fine-tuning supervisado y para experimentos de ablación reproducibles.
- Evaluación comparativa de decisiones de entrenamiento (LR, forma, mezcla de datos, cooldown).
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso.
- No se declara modo thinking, visión, audio ni otras modalidades.
- El brazo E incorpora datos de código en el cooldown, lo que puede conferir cierta familiaridad con sintaxis de programación, aunque no se documenta rendimiento específico.

## Casos de uso

- Investigación en metodología de preentrenamiento: comparar brazos A, B, C, D, E y F2 bajo un mismo presupuesto de 1.000 millones de tokens para aislar el efecto de cada decisión.
- Fine-tuning de dominio con presupuesto reducido: usar los pesos como `--init` para adaptar el modelo a una tarea concreta (clasificación, extracción, resumen) con coste de cómputo bajo.
- Prototipado rápido en el borde: un modelo de 0,1B en bf16 ocupa aproximadamente 0,2 GB, lo que permite experimentar en CPU o GPUs de gama baja antes de escalar.
- Estudio de mezclas de datos: el brazo D (document-heavy) sirve para analizar cómo afecta la proporción de documentos al rendimiento en tareas de comprensión lectora.
- Análisis de estrategias de cooldown: el brazo E permite medir el impacto de introducir código en la fase final del entrenamiento sobre tareas de programación y lenguaje natural.
- Reproducibilidad de experimentos: los `SHA256SUMS` y la publicación de cada brazo facilitan replicar resultados y auditar comparaciones entre configuraciones.
- Base para destilación o inicialización de modelos mayores: los pesos bf16 pueden servir como punto de partida en pipelines de destilación o de curriculum learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,2 GB de pesos, más overhead de activaciones y KV cache; en la práctica, menos de 1 GB para contextos moderados.
- VRAM estimada en fp32: aproximadamente 0,4 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, T4 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al publicarse como `.pt` en bf16, requiere conversión a safetensors o GGUF para usarse con llama.cpp u Ollama; para vLLM o TGI sería necesario adaptar la arquitectura, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| max-0.1b method-01b | ~0,1B | no disponible | Apache 2.0 | Pesos `.pt` bf16 | Artefacto de ablación, no modelo final |
| max-0.1b-v1 | ~0,1B | no disponible | no disponible | Referenciado por el autor | Modelo liberado de la misma familia |
| Alternativas de 0,1B (p. ej. SmolLM-135M, Qwen2.5-0.5B) | 0,135B–0,5B | 2K–32K | Apache 2.0 / otras | safetensors, GGUF | Modelos finales con benchmarks publicados |

La comparación directa con alternativas comerciales o de otras familias no es posible con los datos disponibles, ya que este repositorio no publica métricas de rendimiento ni detalles de arquitectura que permitan un emparejamiento riguroso.

## Limitaciones y advertencias

- No es un modelo final: el autor lo describe explícitamente como artefacto de investigación, no como modelo listo para producción.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a alternativas.
- Sesgos conocidos: no documentados; al entrenarse con corpus no especificado, pueden aparecer sesgos de dominio e idioma.
- Riesgo de alucinación: alto en un modelo de 0,1B sin alineamiento declarado; no apto para tareas que requieran factualidad estricta.
- Limitaciones de idioma: solo coreano e inglés declarados; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser pesos de investigación conviene verificar la procedencia de los datos de entrenamiento antes de desplegarlos.
- Formato `.pt` en bf16: requiere conversión para la mayoría de stacks de inferencia y no incluye tokenizador ni configuración de arquitectura documentada en la información disponible.
- El brazo B combina dos cambios (sin decaimiento de LR y promediado de snapshots), lo que impide atribuir el efecto a una sola variable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quantumaikr/max-0.1b-method-01b
- Modelo liberado de la familia: https://huggingface.co/quantumaikr/max-0.1b-v1
