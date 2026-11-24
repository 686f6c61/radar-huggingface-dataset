# richmondsin/grpo-posterior-no-belief-score-pooled-qwen3.5-4b

## Resumen

`richmondsin/grpo-posterior-no-belief-score-pooled-qwen3.5-4b` es un modelo multimodal de tipo image-text-to-text obtenido al fusionar (merge) un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B. Lo publica el usuario richmondsin y su interés es fundamentalmente experimental: documenta un ablation concreto dentro de un pipeline de aprendizaje por refuerzo (GRPO) orientado a "posterior learning", en el que se elimina la recompensa de creencia (belief reward) manteniendo la línea de creencia y aplicando pooling de fases (phase_set 1200, set_keep 800, update 50).

El resultado es un checkpoint completo de aproximadamente 4.660 millones de parámetros (4.659.865.088 según los tensores safetensors) almacenado en bf16, con un repositorio de 9,3 GB. Solo se han modificado los 200 módulos correspondientes al LoRA; el resto de tensores son idénticos byte a byte al modelo base, y los ficheros de configuración, tokenizer, chat template y processor son los del base sin cambios. Esto lo convierte en una variante reproducible y de bajo riesgo estructural respecto al original.

Su relevancia es acotada: no es un modelo de propósito general con benchmarks publicados, sino un artefacto de investigación que permite comparar el efecto de una configuración GRPO concreta (sin belief score) frente al modelo base Qwen3.5-4B en tareas multimodales. No hay información sobre licencia, idiomas soportados ni evaluación de rendimiento en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; no se detalla en la informacion disponible |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal capaz de procesar imagen y texto (pipeline image-text-to-text). Sobre ese base se aplicó un adaptador LoRA con r=16 y lora_alpha=32, es decir, un factor de escala de 2,0, y posteriormente se fusionó en los pesos mediante la regla `W <- W + (lora_alpha / r) * B @ A`, calculada en fp32 y almacenada en bf16. Se fusionaron 200 módulos; el resto de tensores permanece byte-idéntico al base (verificado en MERGE-REPORT.json: 538 tensores idénticos y bytes totales coincidentes con el base, 9.319.737.856).

El entrenamiento del adaptador se enmarca en un ablation de GRPO (RLVB) descrito como "posterior, no belief score, pooled": se mantiene la línea de creencia pero se elimina la recompensa de creencia (line_score none), con pooling de fases configurado como phase_set 1200, set_keep 800 y update 50. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de SFT, DPO o RLHF más allá de este GRPO. Tampoco se detallan innovaciones arquitectónicas propias: la arquitectura es la del base Qwen3.5-4B sin modificaciones estructurales.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del base Qwen3.5-4B.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), incluyendo preguntas sobre imágenes y descripción de contenido visual.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes o multi-step reasoning: no documentadas en la información disponible.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Evaluación de ablations de RL: el modelo sirve para comparar directamente, contra Qwen3.5-4B, el efecto de entrenar GRPO sin recompensa de creencia; útil en laboratorios que investigan posterior learning y recompensas basadas en creencia.
- Reproducibilidad de experimentos: al estar el LoRA fusionado y verificada la integridad de los tensores, permite reproducir el checkpoint exacto de un run concreto sin gestionar adaptadores por separado.
- Punto de partida para nuevos fine-tunings: los 200 módulos modificados pueden servir como inicialización para experimentos posteriores de RL o SFT sobre el mismo base.
- Prototipado de asistentes visuales conversacionales: al heredar el pipeline image-text-to-text del base, puede emplearse en demos de pregunta-respuesta sobre imágenes con conversación multi-turno.
- Análisis comparativo de robustez: útil para estudiar si la eliminación de la recompensa de creencia afecta a la calibración o a la coherencia en tareas visuales, comparando salidas con el base.
- Integración en pipelines de transformers: el formato safetensors y la librería transformers permiten cargarlo con las herramientas estándar del ecosistema Hugging Face para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y del procesador visual; en la práctica se recomienda al menos 16-24 GB para contexto moderado.
- Cuantización: no se publican variantes GGUF ni AWQ/GPTQ; para reducir VRAM habría que generarlas a partir de los pesos safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con margen; GPUs de 16 GB requerirían cuantización a 8 bits o inferior.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16; en GPUs de 16 GB solo con cuantización.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint concreto en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richmondsin/grpo-posterior-no-belief-score-pooled-qwen3.5-4b | 4.659.865.088 | no disponible | no disponible | Checkpoint experimental con LoRA GRPO fusionado |
| Qwen/Qwen3.5-4B | ~4B (base) | no disponible | la del modelo base (no verificada aquí) | Modelo original sin el ablation; referencia directa |
| Otros fine-tunes de Qwen3.5-4B | variable | no disponible | variable | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce si el ablation sin belief score mejora o degrada el rendimiento respecto al base.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que remitirse a la licencia de Qwen/Qwen3.5-4B y verificar compatibilidad.
- Idiomas soportados no documentados: el comportamiento multilingüe depende del base y no está evaluado en este checkpoint.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no hay evaluación específica de fidelidad visual.
- La fusión en bf16 puede producir diferencias numéricas menores frente a ejecutar base + adaptador en tiempo de inferencia, según advierte el propio autor.
- Artefacto de investigación con 0 descargas y 0 likes: sin validación comunitaria ni soporte.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción sin verificación empírica.
- El nombre del repositorio incluye referencias a configuraciones internas del run (pooled, no belief score) que dificultan su adopción fuera del contexto experimental original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-no-belief-score-pooled-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
