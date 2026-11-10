# cptlight/shennong-0.5b-sft

## Resumen

SHENNONG 0.5B SFT es un ajuste fino supervisado del modelo denso Qwen2.5-0.5B, desarrollado por el autor cptlight dentro del proyecto SHENNONG, centrado en la historia y la farmacología de la medicina tradicional y la etnofarmacología. El modelo resuelve una tarea acotada: generar respuestas conversacionales sobre sustancias y usos documentados en fuentes históricas, en inglés y chino. Con 494.032.768 parámetros reales (embedding atado), es un modelo deliberadamente pequeño pensado como componente de un proyecto mayor, no como un asistente médico.

La relevancia de este repositorio es doble. Por un lado, sirve de base para un experimento de reciclaje hacia mezcla de expertos dispersa (MoE de 4 expertos, 1.435.499.392 parámetros) que el propio autor documenta como resultado negativo. Por otro, es el destino del adaptador de dominio `adapters/t2_natprod.gguf` que impulsa la demostración de enrutamiento de expertos del Track 02 (productos naturales). El autor advierte explícitamente de que este no es el modelo recomendado ni evaluado: el artefacto publicado y con benchmarks es el ajuste de 1.5B.

La arquitectura es un transformer causal denso tipo Qwen2, con 24 capas, dimensión oculta 896 y dimensión intermedia 4864, sobre un vocabulario de 151.936 tokens. Los pesos se distribuyen en float32 (1.976 MB), lo que facilita la inspección y el reciclaje, pero penaliza el despliegue en comparación con una versión fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso Qwen2 (Qwen2ForCausalLM), 24 capas, hidden 896, intermediate 4864, embeddings atados |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | Pesos publicados en float32; el autor indica que un Q4_K_M se genera con `scripts/quantize_gguf.py`, pero no se publica GGUF en el repositorio |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen2.5-0.5B) |
| Formato de pesos | safetensors (float32), tokenizer.json, tokenizer_config.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre Qwen2.5-0.5B, un transformer causal denso con normalización RMSNorm, atención con RoPE y embeddings atados de entrada y salida. El vocabulario de 151.936 tokens y el template de chat son los de Qwen2. El prompt se formatea como `<|user|>pregunta<|assistant|>` con token de parada `<|im_end|>` (id 151645); el autor advierte de que el `eos_token_id` de la configuración es 151643, por lo que hay que fijar el token de parada de forma explícita.

Los datos de entrenamiento derivan únicamente de fuentes permisivas (CC0, dominio público y CC BY), excluyendo explícitamente fuentes con licencias no comerciales como ctext.org y GRETIL; la procedencia se documenta fuente por fuente en `docs/CORPUS_PROVENANCE.md`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica del proyecto no está en este modelo, sino en el pipeline que lo rodea: el script `scripts/upcycle_moe.py` copia su FFN en 4 tensores de experto y verifica que el modelo reciclado sea numéricamente idéntico al denso en la inicialización.

## Capacidades

- Generación de texto conversacional en inglés y chino sobre temas de medicina tradicional, historia de la farmacología y etnofarmacología.
- Respuestas de formato pregunta-respuesta mediante el template de chat de Qwen2.
- Base para reciclaje en MoE de 4 expertos (1.435.499.392 parámetros) mediante el pipeline del proyecto.
- Destino del adaptador de dominio `adapters/t2_natprod.gguf` para la demostración de enrutamiento de expertos en productos naturales.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe limitada a inglés y chino según los metadatos del modelo.

## Casos de uso

- Investigación histórica asistida: el modelo puede responder preguntas sobre el uso documentado de sustancias como la 甘草 en fuentes históricas, útil para historiadores que necesitan una primera orientación sobre el registro textual antes de acudir a las fuentes primarias.
- Extracción y resumen de material etnofarmacológico: con su vocabulario y ajuste de dominio, sirve para condensar pasajes de corpus históricos en inglés y chino dentro de un pipeline de curación documental.
- Componente de un sistema de enrutamiento de expertos: al ser el destino del adaptador `t2_natprod.gguf`, se emplea en la demostración del Track 02 para ilustrar cómo un adaptador de dominio redirige consultas de productos naturales.
- Banco de pruebas de reciclaje MoE: investigadores que estudien la conversión de modelos densos en MoE pueden usar este repositorio como caso de referencia con verificación de equivalencia numérica en la inicialización.
- Evaluación comparativa de modelos pequeños: sirve como línea base de 494 M parámetros frente al ajuste de 1.5B del mismo proyecto para medir el efecto del tamaño en tareas de dominio.
- Despliegue en entornos con recursos muy limitados para prototipos de demostración: al ser un modelo de menos de 500 M de parámetros, cabe en CPU para pruebas de concepto, aunque el autor no publica GGUF y requiere ejecutar el script de cuantización.
- Docencia sobre ajuste fino de dominio: el repositorio documenta procedencia de corpus, licencias y pipeline, lo que lo convierte en un ejemplo didáctico de trazabilidad de datos en un ajuste SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que este modelo no ha sido evaluado con el protocolo de benchmark del proyecto y que no debe citarse para resultados. Las cifras del proyecto (49,0 % frente a 37,0 % en 200 preguntas retenidas) corresponden al modelo de 1.5B, no a este.

| Modelo | Evaluado con el protocolo del proyecto | Resultado |
|---|---|---|
| shennong-0.5b-sft (este repositorio) | No | No disponible |
| shennong-1.5b-sft | Sí | 49,0 % frente a 37,0 % en 200 preguntas retenidas |
| MoE reciclado de 4 expertos (1.435.499.392 params) | Sí | Resultado negativo, por debajo del denso de 1.5B (cifra exacta no disponible) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados en float32 ocupan 1.976 MB, por lo que se necesitan aproximadamente 2 GB solo para pesos; en fp16 bajaría a unos 1 GB y en Q4_K_M a unos 300-400 MB, aunque estas dos últimas versiones no se publican y deben generarse.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para fp32 (por ejemplo, GTX 1650, RTX 3050); para fp16 basta con 1-2 GB (GTX 1050 Ti en adelante). No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo, indicado en los tags), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp u Ollama solo tras generar el GGUF Q4_K_M con `scripts/quantize_gguf.py`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shennong-0.5b-sft | 494.032.768 | no disponible | No evaluado con el protocolo del proyecto | Apache-2.0 | Hugging Face, pesos fp32 |
| shennong-1.5b-sft | 1.543.714.304 | no disponible | 49,0 % frente a 37,0 % en 200 preguntas retenidas | Apache-2.0 | Hugging Face, fp16 y Q4_K_M GGUF |
| Qwen2.5-0.5B (modelo base) | 494.032.768 (aprox.) | no disponible | No disponible | Apache-2.0 | Hugging Face |
| MoE reciclado del proyecto | 1.435.499.392 | no disponible | Negativo, por debajo del denso de 1.5B | Apache-2.0 (código del proyecto) | No publicado como repositorio independiente en la información disponible |

## Limitaciones y advertencias

- No es un modelo recomendado ni evaluado: el autor indica explícitamente que no debe citarse para resultados y que el artefacto publicado es el de 1.5B.
- No es consejo médico: no proporciona dosis, no guía autotratamiento y no ofrece rutas de síntesis de toxinas o patógenos; sus salidas describen un registro histórico, no práctica clínica.
- Nada ha sido validado in vitro ni in vivo.
- Con 494 M de parámetros es más débil que el modelo de 1.5B del mismo proyecto en todas las tareas medidas allí.
- Riesgo de alucinación inherente a un modelo de este tamaño; no se documentan evaluaciones de fidelidad factual específicas para este checkpoint.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- El token de parada real (`<|im_end|>`, id 151645) difiere del `eos_token_id` de la configuración (151643); hay que fijarlo manualmente o la generación puede no detenerse correctamente.
- Pesos en float32 que duplican el espacio en disco frente a fp16 y no hay GGUF publicado, lo que complica el despliegue en CPU sin ejecutar el pipeline de cuantización.
- Licencia Apache-2.0 permisiva para uso comercial, pero las fuentes del corpus excluyen material no comercial; la trazabilidad completa está en `docs/CORPUS_PROVENANCE.md`.
- No se documentan sesgos específicos medidos para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cptlight/shennong-0.5b-sft
- Modelo recomendado (1.5B): https://huggingface.co/tomscot/shennong-1.5b-sft
- Demostración en vivo (CPU): https://tomscot-shennong.hf.space
- Código del proyecto: https://github.com/cptlight/shennong
- Documentación de benchmarks: https://github.com/cptlight/shennong/blob/main/docs/BENCHMARK.md
- Procedencia del corpus: https://github.com/cptlight/shennong/blob/main/docs/CORPUS_PROVENANCE.md
