# inference-optimization/GLM-5.2-0.8B-A0.8B-MXFP4xFP8_BLOCK

## Resumen

GLM-5.2-0.8B-A0.8B es una versión reducida del modelo GLM-5.2, desarrollada por el equipo de inference-optimization con fines exclusivamente de prueba y desarrollo. Este modelo mantiene la arquitectura original del GLM GLM-5.2 —un transformer MoE con atención dispersa de DeepSeek (DSA)— pero con dimensiones drásticamente reducidas: pasa de 78 capas a 6, de 6144 a 2048 de tamaño oculto, y de 256 expertos a 8. El objetivo es ofrecer un punto de partida ligero para validar la estructura del modelo, experimentar con la arquitectura o integrar el pipeline en entornos con recursos limitados.

El modelo se ha inicializado en float32 (el original usa bfloat16) y ha sido afinado sobre un dataset de "copypasta" hasta alcanzar una perplejidad cercana a 1.0. Aunque es funcional y genera texto coherente, su utilidad práctica es limitada: no está diseñado para tareas reales, sino como una herramienta para entender la arquitectura GLM MoE con DSA y para probar integraciones técnicas. El checkpoint se publica en un único archivo safetensors de 2.8 GB, con licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (GLM MoE con DeepSeek Sparse Attention) |
| Parámetros totales | 807.155.872 (0,85B según el autor, 0,807B según safetensors) |
| Parámetros activos | ~0,77B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4xFP8_BLOCK (según el nombre del repo) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica para esta versión) |
| Licencia | MIT |
| Formato de pesos | safetensors (single file, float32) |

## Arquitectura y entrenamiento

La arquitectura es una versión en miniatura de GLM GLM-5.2, que combina un transformer MoE con atención dispersa de DeepSeek (DSA). En esta versión reducida se han disminuido todos los parámetros clave: se mantienen las capas densas en las primeras dos capas (MLP denso) y las restantes cuatro usan MoE con 8 expertos y 2 activos por token. La atención MLA (Multi-head Latent Attention) se comprime con rangos reducidos (kv_lora_rank=128, q_lora_rank=512). El índice DSA se comparte entre las capas 3-5, mientras que las capas 0-2 tienen indexadores completos.

El entrenamiento se realizó sobre un dataset de "copypasta" (texto de memes y frases repetitivas) hasta alcanzar una perplejidad de ~1.0. El modelo se creó en float32 para asegurar una inicialización estable y el proceso se validó comprobando que la generación de texto es correcta (por ejemplo, genera la famosa frase de la abeja). No se ha aplicado RLHF ni DPO; es un ajuste fino simple sobre datos sintéticos.

## Capacidades

- Generación de texto autoregresivo básico.
- Arquitectura MoE con activación por token (2 de 8 expertos).
- Atención dispersa de DeepSeek (DSA) con indexador compartido en capas superiores.
- Compatible con el pipeline de Transformers (AutoModelForCausalLM).
- No se han documentado capacidades de tool calling, agentes ni razonamiento multi-paso.
- No se especifican capacidades multimodales (solo texto).
- Multilingüismo no confirmado en esta versión; el modelo original sí es multilingüe.

## Casos de uso

- **Pruebas de integración con Transformers**: al ser un modelo pequeño y compatible con la librería, permite validar cargas de modelos MoE con DSA en entornos de desarrollo o CI/CD.
- **Estudio de arquitecturas MoE y DSA**: sirve como ejemplo funcional para entender cómo se configura y ejecuta un modelo con mezcla de expertos y atención dispersa, sin necesidad de recursos masivos.
- **Desarrollo de pipelines de cuantización**: el nombre del repo indica cuantización MXFP4xFP8_BLOCK, lo que lo convierte en un candidato para probar técnicas de compresión y evaluación de pérdida de precisión.
- **Validación de generación de texto**: su salida coherente (aunque trivial) puede usarse para verificar que el entorno de inferencia funciona correctamente antes de usar modelos mayores.
- **Educación y aprendizaje**: adecuado para cursos o talleres sobre modelos MoE y atención dispersa, ya que su pequeño tamaño permite ejecutarlo en CPU.
- **Pruebas de compatibilidad de endpoints**: al ser compatible con endpoints de HuggingFace, se puede usar para probar servicios de inferencia en la nube sin incurrir en costes elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la perplejidad de ~1.0 sobre el dataset de copypasta, que no es representativo de tareas reales. No se dispone de cifras de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- **VRAM estimada**: al tener ~0,8B parámetros en float32, la inferencia puede ejecutarse con menos de 4 GB de VRAM en GPU, o incluso en CPU con memoria suficiente (el tamaño del checkpoint es de 2,8 GB).
- **GPU recomendadas**: cualquier GPU con 4 GB o más (ej. NVIDIA GTX 1650, RTX 3050, etc.). También puede ejecutarse en Apple Silicon o en CPU.
- **Cabe en consumer GPU**: sí, es adecuado para GPUs de gama media o baja.
- **Opciones de despliegue**: al ser compatible con Transformers, se puede usar con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque no se ha verificado la compatibilidad con estos motores.
- **Latencia y throughput**: no disponible, pero al ser un modelo pequeño se espera una latencia baja (menos de 100 ms por token en GPU) y un throughput alto.

## Comparativa con modelos similares

No hay una comparativa directa disponible en la información. Como modelo MoE tiny, se podría comparar con otras versiones pequeñas de modelos MoE como Mixtral-8x7B (demasiado grande) o con modelos densos de tamaño similar (ej. Qwen2.5-0.5B, Llama-3.2-1B). Sin embargo, no se tienen datos de rendimiento de este modelo para establecer una comparación justa. La siguiente tabla es orientativa y se basa en características conocidas de los modelos:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| GLM-5.2-0.8B-A0.8B (este) | 0,8B (activos ~0,77B) | no disponible | MIT | sin benchmarks |
| Qwen2.5-0.5B | 0,5B (denso) | 32K | Apache 2.0 | MMLU ~52 |
| Llama-3.2-1B | 1B (denso) | 128K | Llama 3.2 | MMLU ~46 |

*Datos de MMLU para Qwen y Llama son aproximados y no verificados en esta ficha. No se dispone de información comparable para el modelo GLM.*

## Limitaciones y advertencias

- **Modelo de prueba**: está afinado sobre un dataset de copypasta y no ha sido entrenado con datos de calidad para tareas reales. Su salida es trivial y no debe usarse en producción.
- **Sesgos y alucinaciones**: al ser un modelo pequeño y afinado en datos de baja calidad, es probable que alucine o genere contenido irrelevante en temas complejos.
- **Contexto limitado**: no se especifica la longitud de contexto; se asume que es reducido (posiblemente 4096 o menos), insuficiente para tareas de razonamiento extenso.
- **Idiomas**: aunque el original es multilingüe, esta versión no ha sido evaluada para otros idiomas que no sean inglés (el dataset de entrenamiento es en inglés).
- **Licencia**: la licencia MIT permite uso comercial, pero dado que el modelo no es útil para tareas reales, no se recomienda su despliegue en entornos de producción.
- **Precisión**: usa float32, lo que aumenta el consumo de memoria en comparación con bfloat16, y no se ha evaluado el efecto de la cuantización MXFP4FP8 en la calidad.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/inference-optimization/GLM-5.2-0.8B-A0.8B-MXFP4xFP8_BLOCK)
- [Modelo base GLM-5.2 (zai-org)](https://huggingface.co/zai-org/GLM-5.2)
- [Repositorio GLM-5 (GitHub)](https://github.com/zai-org/GLM-5)
- [Blog de z.ai sobre GLM-5.2](https://z.ai/blog/glm-5.2)
- [Página de FriendliAI para este modelo](https://friendli.ai/models/inference-optimization/GLM-5.2-0.8B-A0.8B)
