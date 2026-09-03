# arianraje/qwen3-4b-gdn-hybrid-init-dtfix

## Resumen

Este modelo es un checkpoint de inicialización (surgery/init) dentro de un estudio de investigación que convierte el modelo full-attention Qwen3-4B en un híbrido con atención lineal GDN (gated DeltaNet). Lo desarrolla arianraje y forma parte de una serie de checkpoints que exploran la viabilidad de sustituir la atención por mecanismos recurrentes lineales manteniendo la capacidad mediante destilación escalonada. La variante `-dtfix` corrige un problema de inicialización del sesgo de tiempo (`dt_bias`) que dejaba muerta la retención recurrente en dos tercios de las cabezas, usando la inicialización de referencia de la librería fla.

Con 4.546.819.904 parámetros (aproximadamente 4,55 mil millones), convierte 27 de las 36 capas del Qwen3-4B original a GDN con una retención uniforme 1:4. El checkpoint se carga como `Qwen3NextForCausalLM` con transformers >= 4.57. No es un modelo entrenado para uso final, sino un punto de partida para experimentos de destilación y análisis de arquitecturas híbridas eficientes. Su relevancia radica en estudiar cómo recuperar capacidades de un modelo denso tras una conversión agresiva a atención lineal, un área activa en la búsqueda de alternativas más baratas a la atención completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido GDN (gated DeltaNet) + atención lineal, 27 de 36 capas convertidas, retención uniforme 1:4 |
| Parametros totales | 4.546.819.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado del modelo base Qwen3-4B, no especificado en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B y sustituye la atención completa por capas GDN (gated DeltaNet), un mecanismo de atención lineal con estado recurrente. La conversión es uniforme: 27 de las 36 capas se transforman, manteniendo las 9 restantes con atención completa. La herencia de pesos es directa (plain weight inheritance), sin entrenamiento previo en este checkpoint. La corrección `-dtfix` ajusta la inicialización del sesgo de tiempo (`dt_bias`) usando la referencia de fla: `dt ~ LogUniform(1e-3, 0.1)` y `dt_bias = softplus^-1(dt)`, logrando una retención mediana de 0,94 en lugar de la retención muerta que producía la inicialización por defecto de transformers (`dt_bias.fill_(1.0)`).

No se especifican datos de entrenamiento, número de tokens ni composición del dataset en la información disponible. El checkpoint es únicamente el resultado de la cirugía de conversión, sin etapas de destilación posteriores. El estudio completo incluye destilación escalonada y destilación on-policy (OPD), pero este archivo concreto es el punto de partida.

## Capacidades

- No es un modelo funcional: es un checkpoint de inicialización sin entrenamiento, por lo que no tiene capacidades de generación, razonamiento, código ni otras tareas.
- Sirve como base para experimentos de destilación y evaluación de arquitecturas híbridas.
- El modelo base Qwen3-4B del que deriva sí tiene capacidades de texto, razonamiento y código, pero esta conversión aún no las ha recuperado.
- No se reporta soporte de tool calling, agentes, visión ni otras capacidades especiales en este checkpoint.

## Casos de uso

- Investigación en arquitecturas eficientes: estudiar cómo la conversión a GDN afecta a la retención de información y qué inicializaciones evitan la degradación del estado recurrente.
- Punto de partida para destilación: los investigadores pueden aplicar las etapas de destilación descritas en el estudio (stage2, stage2b, OPD) sobre este checkpoint para recuperar capacidad.
- Análisis de la dinámica de atención lineal: comparar la retención activa por cabeza (el autor reporta 0/864 cabezas muertas frente a 281/864 en la serie original) y su efecto en el gradiente.
- Validación de implementaciones de GDN en transformers: verificar que la carga con `Qwen3NextForCausalLM` y la inicialización corregida funcionan correctamente.
- Benchmark de rendimiento de inferencia: medir la velocidad y el uso de memoria de un modelo híbrido 4.5B frente a su equivalente full-attention.
- Exploración de técnicas de conversión de modelos: servir como caso de estudio para convertir modelos densos existentes a arquitecturas recurrentes lineales sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint no ha sido evaluado en tareas estándar como MMLU, HumanEval o GSM8K, y al ser un checkpoint de inicialización sin entrenamiento, cualquier evaluación directa carecería de sentido.

## Requisitos de hardware

No se proporcionan datos oficiales de hardware en la información disponible. Como estimación general para un modelo de 4,55 mil millones de parámetros en formato safetensors:

- VRAM estimada para inferencia en FP16: aproximadamente 9-10 GB (solo pesos), más overhead de activaciones y estado recurrente.
- Con cuantización a 8 bits: alrededor de 5-6 GB; a 4 bits: 3-4 GB. Estas cifras son orientativas y no han sido validadas por el autor.
- GPU recomendadas: una RTX 3090/4090 (24 GB) o una A10/A100 para FP16 sin problemas. Para cuantización ligera, una RTX 3060 (12 GB) podría ser suficiente.
- Opciones de despliegue: al ser un checkpoint de investigación, no se ha probado con vLLM, llama.cpp u Ollama. Se puede cargar con transformers para experimentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3-4B (base) | Transformer full-attention | 4,0 B | 32K (según repo oficial) | Apache 2.0 | Entrenado, producción |
| qwen3-4b-gdn-hybrid-init-dtfix | Híbrido GDN + atención | 4,55 B | no disponible | Apache 2.0 | Checkpoint de init, sin entrenar |
| qwen3-4b-gdn-hybrid-stage2b-kd | Híbrido GDN + atención | 4,55 B | no disponible | Apache 2.0 | Checkpoint con destilación (serie relacionada) |

La comparativa se limita a la arquitectura y el estado, ya que no hay datos de rendimiento publicados. El modelo base Qwen3-4B es el punto de referencia natural, pero este checkpoint aún no ha recuperado sus capacidades.

## Limitaciones y advertencias

- No es un modelo utilizable: al ser un checkpoint de inicialización sin entrenamiento, no genera texto coherente ni realiza tareas útiles.
- La conversión a GDN puede introducir degradaciones en la retención de información a largo plazo, aunque la corrección `-dtfix` mitiga el problema de cabezas muertas.
- No se han evaluado sesgos ni alucinaciones; el modelo base Qwen3-4B puede tener sesgos heredados, pero este checkpoint no ha sido sometido a pruebas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para producción.
- Depende de una versión específica de transformers (>= 4.57) y de la implementación de `Qwen3NextForCausalLM`, que puede no estar disponible en todos los entornos.
- No hay garantía de que las etapas posteriores de destilación (no incluidas en este checkpoint) logren recuperar completamente la capacidad del modelo original.

## Enlaces

- [HuggingFace: arianraje/qwen3-4b-gdn-hybrid-init-dtfix](https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-init-dtfix)
- [Checkpoint relacionado: qwen3-4b-gdn-hybrid-stage2only-control](https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2only-control)
- [Checkpoint relacionado: qwen3-4b-gdn-hybrid-stage2b-kd](https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage2b-kd)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Informe técnico de Qwen3 (arXiv)](https://arxiv.org/html/2505.09388v1)
