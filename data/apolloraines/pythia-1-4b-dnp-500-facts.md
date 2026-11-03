# ApolloRaines/Pythia-1.4B-DNP-500-Facts

## Resumen

Pythia-1.4B-DNP-500-Facts es un checkpoint derivado de EleutherAI/pythia-1.4b en el que se han insertado directamente en los pesos 500 hechos posteriores al corte de entrenamiento del modelo base, mediante edición de gradientes restringida a parámetros concretos. Lo desarrolla el usuario ApolloRaines dentro de una línea de trabajo de edición de conocimiento y cirugía de pesos (weight surgery) etiquetada como "jblaze". No es un fine-tune completo ni un adaptador: únicamente se descongelan ocho proyecciones de salida de MLP y el resto del modelo permanece congelado.

El interés técnico del artefacto no está en su rendimiento generalista, sino en la metodología y en la trazabilidad del resultado. El autor documenta una recall de 462/500 (92,4%) sobre el conjunto de hechos incluido en el repositorio, partiendo de un cero medido en el modelo base, y reporta de forma explícita un coste de perplejidad del +18,5% en prosa reservada. Además, la model card corrige dos afirmaciones de tarjetas anteriores de la misma familia: que el proceso no implicaba gradientes y que la perplejidad se mantenía estable.

La relevancia actual es doble: por un lado, ofrece un caso verificable de edición de conocimiento con gradientes restringidos y con verificación bit a bit frente al modelo base (284 de 292 tensores idénticos); por otro, sirve como advertencia sobre prácticas de publicación, ya que el autor reconoce que los pesos subidos originalmente no eran el artefacto previsto y que una tarjeta previa reportaba 196/198 sobre un conjunto en el que el modelo base ya acertaba 107.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only), clase `gpt_neox` |
| Parametros totales | 1.414.647.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de EleutherAI/pythia-1.4b; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en fp32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia GPT-NeoX con 1.414 millones de parámetros, en fp16 original, convertido a fp32 de forma exacta para el artefacto publicado. El proceso de edición no reentrena el modelo: se descongelan únicamente ocho tensores correspondientes a `gpt_neox.layers.{8..15}.mlp.dense_4h_to_h.weight`, es decir, las proyecciones de salida de los MLP de las capas 8 a 15, y se congelan los 292 tensores restantes. La pérdida es de siguiente token con la parte de prompt enmascarada a -100, de modo que solo se optimiza la continuación objetivo.

El procedimiento aplica una actualización por hecho (`W -= lr * W.grad`) con tres pasadas y learning rates de 2e-3, 7e-4 y 3e-4, 20 pasos por pasada. La recall de 462 se alcanzó en la primera pasada y las pasadas 2 y 3 no la mejoraron. La verificación independiente reportada indica que 284 de 292 tensores son bit a bit idénticos al base, que los 8 tensores modificados concentran energía en el primer valor singular entre 0,116 y 0,193 y que el rango excede una ventana de 64 valores, lo que distingue el resultado de una inserción de rango uno al estilo ROME/MEMIT o de un adaptador de bajo rango fusionado. El repositorio incluye `rebuild_manifest.json` con la ruta base, el corpus, el recuento de hechos filtrados, las capas entrenadas y cada pasada con su learning rate y puntuación.

## Capacidades

- Generación de texto autoregresiva en inglés, con la calidad del modelo base Pythia-1.4B.
- Recuperación de 500 hechos concretos insertados en los pesos: 462/500 en coincidencia exacta sobre continuación greedy.
- Recall contrafactual nula (0/500): el modelo no produce la variante falsa cuando se le evalúa contra un objetivo perteneciente a otro hecho, lo que el autor interpreta como conocimiento y no como plausibilidad.
- Capacidades generales del modelo base (razonamiento básico, código y matemáticas elementales a escala 1.4B), sin mejoras documentadas por la edición.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: no dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en edición de conocimiento: reproducir el pipeline sobre `novel_facts.json` y comparar la recall y el coste de perplejidad con métodos de rango uno (ROME, MEMIT) o adaptadores, usando el manifiesto de reconstrucción incluido.
- Auditoría de artefactos publicados: emplear la verificación bit a bit frente a EleutherAI/pythia-1.4b para validar que un checkpoint editado contiene solo los tensores declarados y no un fine-tune encubierto.
- Estudio de localización de conocimiento: analizar por qué las capas 8 a 15 y las proyecciones `dense_4h_to_h` absorben los hechos, y contrastar con hipótesis de circuitos MLP en modelos pequeños.
- Docencia y formación: ilustrar de forma práctica la diferencia entre inserción de hechos, fine-tune completo y adaptadores de bajo rango, con métricas de recall, contrafactual y perplejidad sobre un modelo de 1.4B ejecutable en una sola GPU.
- Evaluación de daño colateral: medir la degradación del modelo (perplejidad +18,5%) en tareas de prosa reservada para calibrar cuánto conocimiento se puede inyectar antes de comprometer la fluidez.
- Pruebas de robustez de pipelines de evaluación: usar el conjunto de 500 hechos con prompt enmascarado para validar que un harness de evaluación distingue coincidencia exacta de puntuación por subcadena, que el autor señala como inflacionaria en otros corpus.

## Benchmarks y rendimiento

| Metrica | Base | Este modelo |
|---|---|---|
| Recall, coincidencia exacta (500 hechos) | 0 / 500 | 462 / 500 (92,4%) |
| Recall contrafactual | 0 / 500 | 0 / 500 |
| Perplejidad en prosa reservada | 6,71 | 7,96 (+18,5%) |
| Sonda de conocimiento general | 3 / 6 | 3 / 6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son las reportadas por el autor y medidas sobre los pesos actuales del repositorio, tras la sustitución del checkpoint original.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 5,7 GB solo para pesos (1.414.647.808 parámetros × 4 bytes), más overhead de activaciones y caché KV; en fp16, unos 2,8 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 y 12-16 GB para fp32 con contexto moderado; válidas RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas de 8 GB o más; en fp32 conviene 12-16 GB.
- Opciones de despliegue: transformers (carga directa en safetensors), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se documenta conversión oficial en la información proporcionada).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pythia-1.4B-DNP-500-Facts | 1.414.647.808 | no disponible | Edición de conocimiento por gradientes restringidos sobre Pythia-1.4B | apache-2.0 | HuggingFace (187 descargas) |
| EleutherAI/pythia-1.4b | 1.414.647.808 | no disponible en la información proporcionada | Modelo base preentrenado, sin edición | apache-2.0 | HuggingFace |
| Adaptadores LoRA sobre Pythia-1.4B | ~1.414.647.808 (base congelada + adaptador) | heredado del base | Fine-tune de bajo rango | según adaptador | HuggingFace (múltiples) |
| Ediciones ROME/MEMIT sobre modelos de ~1B | ~1.000-1.500 millones | heredado del base | Inserción de hechos de rango uno | según implementación | Repositorios de investigación |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada; el único punto de referencia medido es el propio modelo base, con 0/500 de recall y perplejidad 6,71.

## Limitaciones y advertencias

- Un solo modelo, una sola escala y una sola arquitectura: el autor advierte que nada de lo observado está establecido a 7B o más.
- La sonda de conocimiento general tiene solo 6 ítems: detecta colapso, no deriva gradual.
- El coste de perplejidad del +18,5% es real y no está explicado ni optimizado; afecta a la calidad de la prosa generada fuera de los hechos editados.
- La recall se mide con coincidencia exacta sobre continuación greedy; la puntuación por subcadena infla resultados en otros corpus y no debe usarse.
- Riesgo de alucinación: el modelo conserva el comportamiento del base Pythia-1.4B fuera de los 500 hechos, con la fiabilidad propia de un modelo de 1.4B entrenado sobre The Pile.
- Idiomas: solo inglés; no se documenta cobertura multilingüe.
- Sesgos: no se documentan evaluaciones de sesgo específicas para este checkpoint; hereda los del modelo base.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del artefacto en producción.
- Advertencia de procedencia: los pesos originalmente publicados no eran el artefacto previsto, y una tarjeta anterior de la familia reportaba 196/198 sobre un conjunto en el que el base ya acertaba 107; conviene tratar con cautela métricas de esta línea de trabajo no verificadas de forma independiente.
- El checkpoint está en fp32 precisamente para permitir la verificación frente al base; convertirlo a bfloat16 destruye esa trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Pythia-1.4B-DNP-500-Facts
- Modelo base: https://huggingface.co/EleutherAI/pythia-1.4b
- Corpus de hechos y manifiesto de reconstrucción: incluidos en el repositorio del modelo (`novel_facts.json`, `rebuild_manifest.json`)
- Paper, blog, repositorio de código o demo adicionales: no disponibles en la información proporcionada
