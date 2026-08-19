# CobrIX/CobrIX-1.0-Coder-Flash-33B-A13B

## Resumen

CobrIX-1.0-Coder-Flash-33B-A13B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por CobrIX, construido a partir del modelo denso Qwen 3.5 `empero-ai/Qwythos-9B-v2` y cinco modelos expertos densos fine-tuned. El modelo presenta una arquitectura híbrida con atención lineal y atención completa intercaladas, y un bloque MoE que sustituye al MLP denso en cada capa del transformer. Con 33 113 780 736 parámetros totales y aproximadamente 13 000 millones de parámetros activos por token, ofrece una ventana de contexto nativa de 1 048 576 tokens, lo que lo hace adecuado para tareas que requieren procesamiento de secuencias muy largas, como análisis de repositorios de código o documentos extensos.

La relevancia de este modelo radica en su diseño modular: no se modifica ningún peso durante el ensamblaje, sino que se combinan las proyecciones MLP de los expertos con los componentes del modelo base. Está disponible en formato safetensors y GGUF, y su integración con Hugging Face Transformers se realiza mediante código remoto (`trust_remote_code=True`). Sin embargo, la licencia declarada en los metadatos de Hugging Face es `custom-personal-use-only`, lo que restringe su uso comercial, a pesar de que la model card menciona una licencia MIT sujeta a las licencias subyacentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen35MoEForCausalLM (MoE, decoder-only, `model_type=qwen35_moe`) |
| Parametros totales | 33 113 780 736 (~33B) |
| Parametros activos | ~13B (A13B) |
| Longitud de contexto | 1 048 576 tokens |
| Tipos de cuantizacion | safetensors (FP16/BF16), GGUF (disponible en el repositorio) |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | custom-personal-use-only (según metadatos de Hugging Face; la model card indica MIT sujeto a licencias de modelos base y expertos) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con bloques MoE. Cada capa contiene, en orden: `input_layernorm`, una capa de atención lineal (`linear_attn`) o completa (`full_attention`) según un patrón fijo (tres capas de atención lineal seguidas de una de atención completa, repetido 8 veces), `post_attention_layernorm`, y un bloque MoE compuesto por un router, 5 expertos locales y 1 experto compartido. El router utiliza top-2 routing con softmax sobre los 5 expertos, y los logits se calculan en `float32`. El experto compartido se activa siempre mediante una puerta sigmoide inicializada a cero.

Los pesos del modelo se ensamblan sin modificación: el modelo base aporta `embed_tokens`, capas de atención lineal, normalizaciones, `rotary_emb` y `lm_head`; los cinco expertos contribuyen únicamente con las proyecciones `gate_proj`, `up_proj` y `down_proj` de cada capa. No se promedian ni interpolan pesos. No se dispone de información sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO); la model card solo menciona que el ensamblaje se realiza mediante scripts de conversión (`convert.py`, `verify.py`, `test.py`) sin depender de CobrIXKit.

## Capacidades

- Generación de texto conversacional y autocompletado en inglés y portugués.
- Procesamiento de secuencias muy largas gracias a su ventana de contexto nativa de 1 048 576 tokens.
- Razonamiento y generación de código, sugerido por el nombre "Coder-Flash" y su orientación a tareas de programación.
- Atención híbrida (lineal + completa) que combina eficiencia computacional con capacidad de modelado de dependencias de largo alcance.
- Arquitectura MoE con 13B parámetros activos, lo que permite inferencia más rápida que un modelo denso de 33B.
- Integración con llama.cpp y Transformers mediante código remoto, sin necesidad de monkey patching.

## Casos de uso

- Análisis de repositorios completos: gracias a su contexto de 1 048 576 tokens, puede procesar un código fuente extenso o múltiples archivos de un proyecto en una sola pasada, facilitando tareas de refactorización, detección de bugs o generación de documentación.
- Asistente de programación multilingüe: útil para desarrolladores lusófonos e hispanohablantes que trabajan con código y necesitan respuestas en inglés o portugués, con capacidad de generar fragmentos, explicar algoritmos o depurar errores.
- Chat conversacional de largo recorrido: puede mantener conversaciones multi-turno con historial extenso sin perder el contexto, adecuado para asistentes virtuales o agentes de soporte técnico.
- Generación de código en producción: al ser un MoE con 13B activos, puede desplegarse en entornos con recursos limitados (GPU de 24-48 GB con cuantización) y utilizarse para autocompletado en IDEs o integración en pipelines de CI/CD.
- Resumen y análisis de documentos técnicos extensos: su contexto largo permite resumir manuales, papers o especificaciones de gran tamaño, manteniendo la coherencia global.
- Prototipado rápido de aplicaciones de IA: su disponibilidad en GGUF permite ejecutarlo en local con llama.cpp u Ollama, ideal para pruebas sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un MoE con 33B parámetros totales, en FP16/BF16 se necesitan aproximadamente 66 GB de VRAM para cargar todos los pesos. Con cuantización GGUF (por ejemplo, Q4_K_M) el requisito baja a unos 20-25 GB, dependiendo del nivel de cuantización.
- GPU recomendadas: para inferencia en FP16, se requieren GPUs profesionales como A100 (80 GB), H100 (80 GB) o RTX PRO 6000 Blackwell (96 GB). Con cuantización GGUF puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: llama.cpp (incluido en el repositorio), Hugging Face Transformers con `trust_remote_code=True`, y potencialmente vLLM o TGI si se adapta el código remoto.
- Latencia y throughput: no disponibles. Al tener solo 13B parámetros activos, se espera una velocidad de generación superior a un modelo denso de 33B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (MoE de ~33B totales con 13B activos y contexto de 1M) en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los metadatos de Hugging Face indican `custom-personal-use-only`, lo que prohíbe el uso comercial. La model card menciona MIT, pero sujeta a las licencias de los modelos base y expertos, lo que genera incertidumbre legal.
- Idiomas limitados: solo soporta portugués e inglés; no hay garantía de buen rendimiento en otros idiomas.
- Riesgo de alucinación: al ser un modelo generativo sin datos de entrenamiento publicados, puede producir información falsa o inventada, especialmente en tareas de razonamiento o código.
- Sesgos desconocidos: no se han documentado evaluaciones de sesgo, por lo que su comportamiento en contextos sensibles no está verificado.
- Dependencia de código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código no auditado del autor; riesgo de seguridad en entornos de producción.
- Contexto largo pero sin garantía de calidad: aunque la ventana es de 1M tokens, no hay evidencia de que el modelo mantenga coherencia en toda la extensión; la atención lineal puede degradar el rendimiento en secuencias extremas.
- Sin benchmarks publicados: no se puede evaluar su rendimiento real frente a otros modelos; cualquier afirmación sobre calidad es especulativa.

## Enlaces

- [Hugging Face: CobrIX/CobrIX-1.0-Coder-Flash-33B-A13B](https://huggingface.co/CobrIX/CobrIX-1.0-Coder-Flash-33B-A13B)
- [Modelo base: empero-ai/Qwythos-9B-v2](https://huggingface.co/empero-ai/Qwythos-9B-v2) (referenciado en la model card)
