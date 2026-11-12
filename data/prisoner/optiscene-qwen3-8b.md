# Prisoner/OptiScene-Qwen3-8B

## Resumen

OptiScene-Qwen3-8B es un ajuste fino del modelo base Qwen/Qwen3-8B desarrollado por el usuario Prisoner, que reproduce el trabajo OptiScene (NeurIPS 2025, arXiv:2506.07570) para la generación de layouts de escenas interiores en 3D a partir de descripciones textuales. El modelo transforma un prompt en lenguaje natural en una distribución espacial de objetos (un layout 3D) codificada como JSON, resolviendo el problema de la síntesis automática de interiores con coherencia espacial y sin solapamientos entre objetos.

La relevancia del modelo reside en su pipeline de entrenamiento en tres etapas (SFT con razonamiento, seguido de dos fases de DPO) que reduce el Object Overlap Rate (OOR) de 0,1305 a 0,0706, una mejora del 45,9 % respecto a la etapa inicial. Mantiene un 100 % de salidas JSON válidas en las 120 escenas de test estratificadas, lo que lo hace directamente utilizable en pipelines de generación procedural de interiores.

El modelo tiene 8.190.735.360 parámetros en formato bfloat16 (repo de 17,3 GB), se distribuye con licencia MIT y está entrenado exclusivamente en inglés. Incluye los adaptadores LoRA intermedios de cada etapa, lo que permite reproducir o reutilizar fases concretas del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino con LoRA + DPO |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, modelo fusionado) + adaptadores LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de 8,19 mil millones de parámetros, y se ajusta mediante un pipeline de tres etapas documentado en la model card. La etapa 1 es un SFT con razonamiento sobre 12.253 muestras (split 80/20), con LoRA de rango r=16 y alpha=32 durante 1 época, alcanzando train_loss de 0,3144 y token accuracy del 95,54 %. La etapa 2 aplica DPO sobre 7.951 muestras con LoRA r=32/alpha=16 durante 10 épocas (1.990 pasos), con train_loss de 0,2468 y margen de recompensas de 8,05. La etapa 3 repite DPO sobre 8.410 muestras con la misma configuración LoRA durante 10 épocas (2.110 pasos), con train_loss de 0,058 y margen de recompensas de 9,86.

El entrenamiento se realizó sobre 8 GPUs NVIDIA A100-SXM4-80GB y utiliza el dataset B3rrYang/3D-SynthPlace_indoor_scenes_dataset. La innovación principal es la combinación de SFT con trazas de razonamiento seguida de dos rondas de optimización de preferencias, que penaliza explícitamente los solapamientos entre objetos. El repositorio incluye los adaptadores LoRA de cada etapa (stage1_sft, stage2_dpo1, stage3_dpo2) además de los pesos fusionados finales, lo que permite auditar o reanudar el entrenamiento desde cualquier fase.

## Capacidades

- Generación de layouts 3D de escenas interiores (dormitorio, salón, cocina, baño) a partir de prompts en lenguaje natural.
- Salida estructurada en JSON válido (100 % de validez en el conjunto de test de 120 escenas).
- Razonamiento previo a la generación (la etapa SFT se entrenó con trazas de razonamiento; el modo thinking puede desactivarse en la plantilla de chat).
- Colocación espacial de objetos con minimización de solapamientos (OOR de 0,0706 global).
- Generación de texto conversacional heredada del modelo base Qwen3-8B.
- Soporte multilingüe limitado al inglés según la model card (aunque el base Qwen3 es multilingüe, el ajuste se realizó solo en inglés).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación procedural de interiores para videojuegos: el modelo recibe una descripción textual de una habitación y devuelve un JSON con posiciones y dimensiones de objetos, que un motor de juego puede instanciar directamente; el bajo OOR evita muebles solapados.
- Herramientas de diseño de interiores asistido: un usuario describe el estilo y la función de una estancia y el modelo produce un layout inicial que el diseñador refina, reduciendo el tiempo de bocetado.
- Aumento de datos sintéticos para visión por computador: los layouts generados pueden alimentar renderizadores para producir imágenes anotadas de interiores con ground truth espacial exacto.
- Planificación robótica doméstica: el layout JSON sirve como mapa semántico de una habitación para que un robot planifique rutas y manipulación de objetos.
- Simulación y entrenamiento en entornos virtuales: generación masiva de variantes de escenas para entrenar agentes de navegación o de realidad virtual.
- Investigación en generación estructurada: el modelo y sus adaptadores LoRA intermedios permiten estudiar el efecto del DPO multi-etapa sobre la validez estructural de la salida, con métricas reproducibles (OOR, validez JSON).
- Prototipado rápido de configuradores de muebles: integración en una API que devuelva layouts a partir de formularios de usuario en inglés.

## Benchmarks y rendimiento

Evaluación sobre 120 escenas de test estratificadas (30 por tipo de habitación), métrica Object Overlap Rate (OOR, menor es mejor) y porcentaje de JSON válido:

| Etapa del modelo | OOR global | Dormitorio | Salón | Cocina | Baño | JSON válido |
|---|---|---|---|---|---|---|
| Stage 1: SFT (con razonamiento) | 0,1305 | 0,2028 | 0,1478 | 0,1251 | 0,0464 | 100,0 % |
| Stage 2: SFT + DPO Stage 1 | 0,0762 (-41,6 %) | 0,0933 | 0,0756 | 0,1146 | 0,0212 | 100,0 % |
| Stage 3: OptiScene (SFT + DPO1 + DPO2) | 0,0706 (-45,9 %) | 0,0799 (-60,6 %) | 0,0774 | 0,0927 (-25,9 %) | 0,0325 | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La muestra de salida incluida en el repositorio (sample_response.txt) reporta un OOR de 0,0099 para un salón.

## Requisitos de hardware

- Inferencia en bfloat16: los pesos ocupan aproximadamente 16,4 GB, por lo que se recomienda al menos 20-24 GB de VRAM.
- Cuantización a 8 bits: aproximadamente 8-9 GB de VRAM; a 4 bits, aproximadamente 5-6 GB (estimación por tamaño de parámetros; no se publican pesos cuantizados oficiales).
- GPU recomendadas: A100 80GB o H100 para entrenamiento y despliegue de alta concurrencia; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: transformers (AutoModelForCausalLM), vLLM (mencionado explícitamente en la model card); llama.cpp/Ollama no están documentados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.
- Entrenamiento: 8 × NVIDIA A100-SXM4-80GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptiScene-Qwen3-8B | 8,19 B | no disponible | Layouts 3D de interiores | MIT | Hugging Face (Prisoner/OptiScene-Qwen3-8B) |
| Qwen3-8B (base) | 8,19 B | no disponible | Texto general | Apache 2.0 (según el modelo base) | Hugging Face (Qwen/Qwen3-8B) |
| OptiScene original (paper) | no disponible | no disponible | Layouts 3D de interiores | no disponible | Reproducción open source de este modelo |

No se dispone de datos de benchmarks comparativos con otros modelos de generación de layouts en la información proporcionada. La comparación con el modelo base Qwen3-8B es relevante porque OptiScene-Qwen3-8B es un ajuste fino del mismo, pero no se han publicado métricas de texto general para el ajuste.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés: los prompts en castellano u otros idiomas pueden degradar la calidad del layout o producir salidas inválidas.
- Dominio restringido a cuatro tipos de habitación (dormitorio, salón, cocina, baño); no se documenta generalización a otros espacios (oficinas, exteriores, locales comerciales).
- Riesgo de alucinación de objetos o dimensiones no presentes en el prompt; el OOR no nulo (0,0706) implica que persisten solapamientos en producción.
- El OOR empeora en baños (0,0325) respecto a la etapa 2 (0,0212), lo que indica que el DPO de la etapa 3 no mejora uniformemente todas las categorías.
- No se documentan sesgos específicos del ajuste; al heredar Qwen3-8B, puede arrastrar sesgos del corpus base.
- Licencia MIT permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia (Apache 2.0 según la información del base) que debe verificarse por separado.
- No se publican pesos cuantizados oficiales ni datos de latencia/throughput, lo que dificulta la planificación de despliegues de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prisoner/OptiScene-Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper OptiScene (arXiv): https://arxiv.org/abs/2506.07570
- Dataset de entrenamiento: https://huggingface.co/datasets/B3rrYang/3D-SynthPlace_indoor_scenes_dataset
