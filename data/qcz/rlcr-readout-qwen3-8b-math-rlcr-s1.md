# qcz/rlcr-readout-qwen3-8b-math-rlcr-s1

## Resumen

El modelo `qcz/rlcr-readout-qwen3-8b-math-rlcr-s1` es un conjunto de checkpoints de investigación del proyecto RLCR readout, desarrollado por el usuario qcz. Se trata de un post-entrenamiento sobre un modelo base Qwen3-8B (el README menciona Qwen3.5, aunque el nombre del repositorio indica Qwen3-8B) aplicando técnicas de aprendizaje por refuerzo con recompensas verificables (RLVR) y RLCR (Reinforcement Learning with Calibrated Readout), junto con la optimización CISPO. El objetivo es mejorar la calibración de la incertidumbre en tareas matemáticas, haciendo que el modelo declare su nivel de confianza junto a cada respuesta.

El repositorio contiene múltiples checkpoints completos en subcarpetas `iter_*`, cada uno correspondiente a un número determinado de rollouts completados. Cada subcarpeta incluye un `validation.json` con comprobaciones de tensores en CPU y hashes SHA-256 para verificar la integridad de los pesos. El tamaño total del repositorio es de 81,9 GB, lo que refleja la presencia de varios checkpoints. Se trata de pesos experimentales, por lo que las conclusiones mecanicistas requieren las evaluaciones corregidas y los controles del proyecto.

La arquitectura es un transformer decoder-only basado en Qwen3-8B, aunque no se especifican los parámetros totales ni la longitud de contexto en la información disponible. El pipeline declarado es reinforcement-learning y las etiquetas incluyen uncertainty-quantification, lo que subraya su enfoque en la cuantificación de incertidumbre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-8B; el README menciona Qwen3.5) |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el subdirectorio preserva la licencia del modelo original, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only, con la arquitectura base de Qwen3-8B. El README menciona "Qwen3.5", lo que podría indicar una variante o actualización, pero no se aportan más detalles. El post-entrenamiento se realizó con RLVR (Reinforcement Learning with Verifiable Rewards) y RLCR, ambos usando el mismo prompt de respuesta-y-confianza y la optimización CISPO. Los checkpoints se organizan en subcarpetas `iter_*`, donde cada una representa un número concreto de rollouts completados. Solo se entrenó la política de texto autorregresiva; no se entrenó la decodificación especulativa ni el MTP (Multi-Token Prediction). Los tensores visuales y de MTP deshabilitados del modelo original se mantienen sin cambios.

Cada subcarpeta incluye un `validation.json` con comprobaciones de tensores en CPU y hashes SHA-256, lo que permite auditar la integridad de los pesos. Para cargar un checkpoint, se debe usar `subfolder="iter_100"` junto con su propio tokenizer y plantilla de chat, no los de la raíz del repositorio.

## Capacidades

- Generación de respuestas matemáticas con nivel de confianza: el prompt de entrenamiento solicita respuesta y confianza, lo que permite obtener una señal de incertidumbre calibrada.
- Razonamiento matemático: el entrenamiento se centró en tareas matemáticas con recompensas verificables.
- Cuantificación de incertidumbre: las etiquetas del modelo incluyen uncertainty-quantification, y el método RLCR está diseñado para calibrar la confianza declarada.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles; los tensores visuales del modelo original no fueron entrenados.

## Casos de uso

- Investigación en calibración de confianza para LLM: el modelo permite estudiar cómo el RLVR/RLCR afecta la relación entre la confianza declarada y la precisión real en problemas matemáticos.
- Análisis de dinámicas de entrenamiento RL: los checkpoints `iter_*` permiten trazar la evolución del modelo a lo largo de los rollouts y comparar la calidad de la calibración en cada etapa.
- Detección de respuestas inciertas en sistemas de tutoría: al generar un nivel de confianza, el modelo puede filtrar respuestas con baja confianza para derivarlas a revisión humana.
- Evaluación de métodos de RL alternativos: sirve como referencia para comparar CISPO con otros optimizadores como DAPO o PPO en tareas matemáticas.
- Verificación de integridad de pesos en investigación: los `validation.json` con hashes SHA-256 permiten auditar que los checkpoints no han sido alterados, lo que es útil para reproducibilidad.
- Experimentos de transferencia de calibración: se puede probar si la calibración aprendida en matemáticas se transfiere a otros dominios de razonamiento, como lógica o programación.
- Desarrollo de pipelines de auto-evaluación: aunque no soporta tool calling, el modelo puede integrarse en sistemas donde la confianza se usa para decidir si continuar razonando o solicitar ayuda externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Por analogía con un modelo de 8B, se estima ~16 GB en FP16 y ~6 GB con cuantización 4-bit, pero estos valores no están confirmados para este checkpoint.
- GPU recomendadas: no disponible. Para inferencia en FP16 se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB), pero no hay una recomendación oficial.
- ¿Cabe en GPU de consumo? Posiblemente con cuantización 4-bit en GPUs de 8-12 GB, pero no hay datos oficiales.
- Opciones de despliegue: se puede cargar con `transformers` usando `subfolder="iter_100"` y su tokenizer correspondiente. No se han documentado opciones de despliegue específicas para vLLM, llama.cpp u otros frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Método de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qcz/rlcr-readout-qwen3-8b-math-rlcr-s1 | no disponible | no disponible | RLVR/RLCR con CISPO | no disponible | HuggingFace |
| qcz/rlcr-readout-qwen3-8b-math-rlcr | no disponible | no disponible | RLVR/RLCR | no disponible | HuggingFace |
| resistz/RLCR-Calibrated-Qwen3-8B-DAPO-Math14k-3Epoch-330Step | no disponible | no disponible | RLCR con DAPO | MIT | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado; el modelo base Qwen3-8B puede arrastrar sesgos no documentados.
- Riesgo de alucinación: presente en todos los LLM; la calibración de confianza no elimina este riesgo.
- Limitaciones de contexto o idioma: no disponibles; el entrenamiento se centró en matemáticas, por lo que el rendimiento en otros dominios es incierto.
- Restricciones de licencia: no disponible; no se puede confirmar el uso comercial sin conocer la licencia del modelo base.
- Pesos experimentales: el README indica que son "experimental weights" y que las conclusiones mecanicistas requieren las evaluaciones corregidas y los controles del proyecto.
- Solo se entrenó la política de texto autorregresiva: las capacidades visuales o de MTP del modelo original no fueron entrenadas y pueden no funcionar correctamente.
- Carga del checkpoint: se debe usar `subfolder="iter_100"` y su tokenizer/plantilla de chat específicos; no usar los de la raíz, ya que podría dar resultados incorrectos.

## Enlaces

- HuggingFace: https://huggingface.co/qcz/rlcr-readout-qwen3-8b-math-rlcr-s1
- Proyecto base: https://huggingface.co/qcz/rlcr-readout-qwen3-8b-math-rlcr
- Modelo similar: https://huggingface.co/resistz/RLCR-Calibrated-Qwen3-8B-DAPO-Math14k-3Epoch-330Step
