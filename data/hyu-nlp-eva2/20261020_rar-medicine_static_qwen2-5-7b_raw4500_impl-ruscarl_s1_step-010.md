# HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-010

## Resumen

Este repositorio contiene un ajuste fino del modelo Qwen2.5-7B-Instruct publicado por la organización HYU-NLP-EVA2, entrenado con GRPO y recompensas basadas en rúbricas (*rubric-based RL*) sobre el conjunto de datos ScaleAI/RaR-Medicine. Se trata de un experimento de investigación orientado al dominio médico: el objetivo no es un asistente clínico listo para producción, sino evaluar si el refuerzo con rúbricas granularizadas a nivel de criterio mejora la calidad de las respuestas médicas frente al modelo base. El identificador del repositorio resume la configuración: 4.500 ejemplos de entrenamiento en modo estático, implementación «ruscarl» y checkpoint del paso 10.

Arquitectónicamente es un transformer decoder-only denso de 7.615.616.512 parámetros (unos 7,6 mil millones), heredado íntegramente de Qwen2.5-7B-Instruct, por lo que conserva su ventana de contexto y su tokenizador sin modificaciones. El entrenamiento empleó un juez automático basado en Qwen3-32B en modo *non-thinking*, que puntúa cada respuesta criterio a criterio para construir la señal de recompensa del GRPO.

Su relevancia ahora es metodológica más que de producto: es un artefacto que documenta de forma transparente una receta de RL con rúbricas (hiperparámetros, juez, partición de test y formato de exportación), lo que lo hace útil para reproducir o auditar este tipo de entrenamiento. Conviene subrayar que se publica un checkpoint intermedio del paso 10 (la ejecución llega hasta el paso 50) y que no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), con atención de consultas agrupadas (GQA) y RoPE; sin mezcla de expertos |
| Parametros totales | 7.615.616.512 (7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens, heredada del modelo base Qwen2.5-7B-Instruct; la model card de este repositorio no la declara |
| Tipos de cuantizacion | El autor solo publica pesos fusionados en BF16 (safetensors); no hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas. Al ser una arquitectura Qwen2 densa es convertible con herramientas estándar (llama.cpp, AutoAWQ, GPTQModel) |
| Idiomas soportados | No disponibles (la model card no los declara). Como modelo base, Qwen2.5-7B-Instruct es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en BF16 (checkpoint fusionado) más tokenizer y config de Transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin cambios estructurales: un transformer decoder-only de tipo Qwen2 con atención de consultas agrupadas, embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm, con un vocabulario de aproximadamente 152.000 tokens. El repositorio no introduce módulos nuevos ni altera la configuración: el proceso de exportación fusiona los fragmentos FSDP originales (VERL FSDP v1, world size 2) en un único conjunto de safetensors en BF16 junto con el tokenizer y el config de Transformers.

El entrenamiento se realizó con GRPO sobre 4.500 ejemplos de RaR-Medicine, con lote de entrenamiento de 32, 8 rollouts por prompt, mini-lote PPO de 16, tasa de aprendizaje de 1e-6, una época PPO y una época de entrenamiento configurada. La recompensa proviene de un juez basado en rúbricas (Qwen3-32B en revisión `9216db5781bf21249d130ec9da846c4624c16137`, en modo *non-thinking*) que evalúa criterio por criterio, en lugar de una puntuación holística. La partición de evaluación es `HYU-NLP-EVA2/rar-medicine-ruscarl-test500-seed42` (500 ejemplos, semilla 42), separada del conjunto de entrenamiento. El checkpoint publicado corresponde al paso 10, dentro de una ejecución que solo conserva checkpoints hasta el paso 50; los estados del optimizador, RNG, dataloader y los fragmentos `.pt` originales no se incluyen en el Hub, por lo que el entrenamiento no es reanudable exactamente a partir de este repositorio.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Qwen2.5-7B-Instruct (plantilla de chat con roles system/user/assistant).
- Respuesta a preguntas de dominio médico, especialidad principal del ajuste con RaR-Medicine.
- Razonamiento de múltiples pasos dentro de una misma respuesta, favorecido por el entrenamiento con recompensas por criterio.
- Soporte de tool calling / function calling heredado del modelo base (Qwen2.5 incluye plantillas para funciones), aunque el ajuste no se ha validado específicamente en ese uso.
- Capacidad multilingüe heredada del modelo base; la model card no declara idiomas para este checkpoint.
- Generación de código y matemáticas a nivel general, como capacidad residual del modelo base, no reforzada por el ajuste.
- No se declara soporte de visión, audio, ni modo de razonamiento extendido (*thinking mode*) explícito.

## Casos de uso

- Investigación sobre RL con rúbricas: el checkpoint sirve como punto de comparación intermedio (paso 10 de 50) para estudiar la evolución de la recompensa y la calidad de respuesta durante el entrenamiento GRPO.
- Auditoría de jueces automáticos: al estar documentado el juez (Qwen3-32B, evaluación por criterio) y la partición de test, permite analizar sesgos y estabilidad de la señal de recompensa en dominios de alto riesgo.
- Generación de borradores de respuestas a preguntas médicas para revisión humana: útil en entornos de formación o documentación donde un experto valida la salida antes de su uso.
- Extracción y estructuración de información clínica en textos largos: con 32.768 tokens de contexto puede procesar informes o historiales extensos en una sola pasada, siempre con validación posterior.
- Construcción de datasets sintéticos de dominio médico: el modelo puede generar respuestas candidatas que luego se filtran con un juez o con revisión experta, dentro de un pipeline de anotación asistida.
- Experimentos de ajuste instructivo sobre Qwen2.5: al ser un derivado directo con licencia Apache-2.0, sirve como punto de partida o de control en comparativas de técnicas de RL (GRPO frente a DPO, por ejemplo).
- Despliegue en entornos de demostración o docencia: su tamaño (7,6B) permite ejecutarlo en una sola GPU de 24 GB en BF16, lo que facilita réplicas locales de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de un conjunto de test (`rar-medicine-ruscarl-test500-seed42`), pero no incluye métricas ni comparaciones con el modelo base en ese ni en otros conjuntos (MMLU, MedQA, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 15,3 GB solo para pesos; con caché KV y overhead de runtime, aproximadamente 17-20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: unos 8-9 GB de pesos; en 4 bits, unos 4,5-5,5 GB, más caché KV.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB son adecuadas y permiten servir varias réplicas o contextos largos con holgura.
- GPU de consumo: cabe en BF16 en una RTX 4090 o RTX 3090 (24 GB) para una sola instancia y contextos moderados; en RTX 4080/4070 Ti Super (16 GB) requiere cuantización de 8 bits; en GPUs de 8-12 GB es necesario cuantizar a 4 bits y reducir la longitud de contexto.
- Opciones de despliegue: vLLM, TGI (la etiqueta del repositorio incluye `text-generation-inference` y `endpoints_compatible`), SGLang y transformers directamente; llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Este checkpoint (HYU-NLP-EVA2) | 7,6B | 32.768 (heredado) | Médico, GRPO con rúbricas, paso 10 | Apache-2.0 | Público, sin métricas publicadas |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 | Generalista, alineado con preferencias | Apache-2.0 | Público, ampliamente evaluado |
| BioMistral-7B | ~7,2B | No disponible en la información manejada | Médico, preentrenamiento continuado sobre PubMed | Apache-2.0 | Público |
| Meditron-7B | ~7B | No disponible en la información manejada | Médico, preentrenamiento continuado con guías clínicas y literatura | Licencia Llama 2 | Público |

La comparación cuantitativa de rendimiento no es posible: este checkpoint no publica métricas y los modelos alternativos citados sí cuentan con evaluaciones propias en conjuntos que no coinciden con `rar-medicine-ruscarl-test500-seed42`. Cualquier comparación directa exigiría reevaluar los cuatro modelos sobre la misma partición.

## Limitaciones y advertencias

- Checkpoint intermedio: el paso 10 de una ejecución de 50 implica un entrenamiento incompleto; el comportamiento puede ser inestable o estar más cerca del modelo base de lo que estaría un checkpoint final.
- Volumen de datos reducido: 4.500 ejemplos, una época de entrenamiento y una época PPO limitan la generalización más allá del dominio y el estilo de RaR-Medicine.
- Ausencia total de evaluación publicada: no hay métricas que respalden mejoras frente a Qwen2.5-7B-Instruct, ni en medicina ni en capacidades generales.
- Riesgo de alucinación elevado en dominio sanitario: el modelo no incorpora verificación de hechos ni recuperación de fuentes, y no debe usarse para decisiones clínicas, diagnóstico ni recomendaciones de tratamiento sin supervisión profesional.
- Dependencia del juez: la recompensa proviene de un único modelo (Qwen3-32B) evaluando criterios; esto abre la puerta a *reward hacking* y a heredar los sesgos del juez, especialmente en un dominio donde los criterios de corrección son discutibles.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés, idioma predominante en los datasets médicos de referencia.
- Sesgos de datos: los corpus médicos abiertos sobrerrepresentan ciertas poblaciones, enfermedades y sistemas sanitarios, lo que puede producir respuestas descalibradas en contextos distintos.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero no exime de las obligaciones regulatorias aplicables a productos sanitarios (por ejemplo, marcado CE o clasificación como dispositivo médico en la UE).
- Repositorio sin tracción ni validación comunitaria: 0 descargas y 0 «likes» en el momento de la consulta, sin revisión independiente conocida.
- No reanudable para entrenamiento exacto: la ausencia de estados del optimizador, RNG y dataloader impide continuar el entrenamiento desde el paso 10 de forma fiel.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/20261020_rar-medicine_static_qwen2.5-7b_raw4500_impl-ruscarl_s1_step-010
- Conjunto de test: https://huggingface.co/datasets/HYU-NLP-EVA2/rar-medicine-ruscarl-test500-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/ScaleAI/RaR-Medicine
- Juez de rúbricas: https://huggingface.co/Qwen/Qwen3-32B
- Organización autora: https://huggingface.co/HYU-NLP-EVA2
