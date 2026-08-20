# arianraje/mimo-7b-gdn-hybrid-1B-OPD

## Resumen

El modelo `arianraje/mimo-7b-gdn-hybrid-1B-OPD` es un checkpoint de entrenamiento intermedio, no un modelo final listo para inferencia. Forma parte de un estudio que convierte modelos de atención completa (full attention) en híbridos con *gated DeltaNet* (GDN), una arquitectura de atención lineal con compuertas. El modelo base es `XiaomiMiMo/MiMo-7B-RL-0530`, un modelo de razonamiento de 7B parámetros entrenado por Xiaomi. El objetivo del estudio es recuperar la capacidad del modelo original tras la conversión a una arquitectura híbrida mediante destilación escalonada y destilación on-policy.

Este checkpoint concreto corresponde al estado final de un entrenamiento con 1.000.002.516 tokens consumidos (aproximadamente 1B tokens), con una ventana de contexto de 32K tokens. Se guardó como un "full state" que incluye shards de pesos en BF16 y del optimizador en FP32, junto con el estado del entrenador. No es un modelo distribuible como pesos de inferencia, sino un artefacto de investigación para continuar el entrenamiento o analizar el proceso.

La relevancia actual radica en que explora la viabilidad de transformar modelos grandes de atención completa en arquitecturas lineales más eficientes, un tema clave para reducir costes de inferencia en producción. Sin embargo, al ser un checkpoint intermedio, no ofrece capacidades listas para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con *gated DeltaNet* (GDN) y atención lineal, basada en `MiMo-7B-RL-0530` (custom `mimo_gdn`) |
| Parametros totales | no disponible (el nombre sugiere 7B, pero no se confirma; el sufijo "1B" se refiere a tokens consumidos, no a parámetros) |
| Parametros activos | no disponible (posiblemente reducidos al ser híbrido, pero sin dato) |
| Longitud de contexto | 32K tokens (indicado como "H=32K" en la model card) |
| Tipos de cuantizacion | no disponible (es un checkpoint de entrenamiento, no un peso cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint de entrenamiento: shards BF16 + shards del optimizador FP32 + trainer_state |

## Arquitectura y entrenamiento

La arquitectura `mimo_gdn` es una modificación del modelo MiMo-7B que reemplaza la atención completa por un mecanismo de *gated DeltaNet* (GDN), un tipo de atención lineal con compuertas que permite una retención de información a largo plazo con coste computacional reducido. El modelo se define como híbrido, con una proporción de retención uniforme de 1:4, es decir, una cuarta parte de las capas mantienen atención completa mientras el resto usa GDN. Esta conversión se realiza sobre el modelo base `MiMo-7B-RL-0530`, un modelo de razonamiento de 7B entrenado por Xiaomi.

El entrenamiento se llevó a cabo mediante un proceso de destilación en dos fases: destilación escalonada (staged distillation) y destilación on-policy (OPD). Se utilizó un esquema de aprendizaje con WSD (warmup-stable-decay) y una escalera de escalado (scaling ladder) sobre un reserva de 3×H200. El checkpoint corresponde al paso 6454 de un total de 1.000.002.516 tokens consumidos, con un estado de "decayed ext800 (1B)" al final de la rung. El objetivo es que el modelo híbrido recupere las capacidades del modelo de atención completa mediante la destilación, manteniendo la eficiencia de la atención lineal.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint.
- Al ser un estado intermedio de entrenamiento, no se puede evaluar su rendimiento funcional.
- El modelo base `MiMo-7B-RL-0530` es un modelo de razonamiento con habilidades de generación de texto, matemáticas y codigo, pero estas capacidades no están garantizadas en esta versión híbrida hasta completar el entrenamiento.

## Casos de uso

- No se han documentado casos de uso prácticos para este checkpoint. Al ser un artefacto de investigación, no es apto para aplicaciones en producción.
- Potencialmente, si el entrenamiento finalizara con éxito, podría servir para inferencia eficiente en contextos largos, pero no es el caso actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint no presenta métricas de evaluación.

## Requisitos de hardware

- No se especifican requisitos de hardware para este checkpoint. Al ser un estado de entrenamiento con shards del optimizador en FP32, requiere recursos de entrenamiento (por ejemplo, GPUs H200 o A100 con gran memoria).
- No es apto para inferencia en GPU de consumo (RTX 4090, etc.) porque no se ha convertido a pesos de inferencia ni cuantizado.
- Para continuar el entrenamiento se necesitaría el entorno original (3×H200) o similar.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros modelos híbridos de atención lineal. El modelo base `MiMo-7B-RL-0530` podría compararse con otros modelos de 7B de razonamiento, pero no hay datos de rendimiento del híbrido.

## Limitaciones y advertencias

- Checkpoint de entrenamiento, no un modelo listo para inferencia: contiene pesos del optimizador y estado del entrenador, no es un formato de pesos estándar (safetensors, GGUF).
- No se ha validado su calidad: no hay evaluaciones de tareas, ni pruebas de generación.
- Arquitectura experimental: el uso de *gated DeltaNet* en sustitución de atención completa puede afectar la calidad de los resultados, aún en estudio.
- Licencia MIT permite uso comercial, pero al ser un checkpoint sin documentación de uso, no se recomienda para producción.
- No hay información sobre sesgos o alucinaciones; al ser un modelo derivado, heredaría los del base, pero no se ha evaluado.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-1B-OPD)
- [HuggingFace del modelo 400M (variante)](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-400M-OPD)
- [HuggingFace del modelo 200M (variante)](https://huggingface.co/arianraje/mimo-7b-gdn-hybrid-200M-OPD)
- [GitHub del proyecto MiMo-7B (Xiaomi)](https://github.com/cazzano/mimo_ai)
