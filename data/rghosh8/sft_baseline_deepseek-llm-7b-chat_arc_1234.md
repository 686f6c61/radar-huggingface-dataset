# rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_1234

## Resumen

`rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_1234` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/deepseek-llm-7b-chat`, publicado por el usuario rghosh8 en Hugging Face. Se trata de un checkpoint experimental de investigación, no de un modelo de producción: el nombre indica que es una "baseline" de SFT entrenada sobre el dataset ARC con semilla 1234, presumiblemente como parte de un estudio comparativo de técnicas de ajuste. No hay información pública sobre el dataset exacto, la composición de los datos ni los objetivos del experimento.

El modelo base, DeepSeek LLM 7B Chat, es un transformer decoder-only de aproximadamente 6.910 millones de parámetros (6,91 B) desarrollado por DeepSeek, con una ventana de contexto de 4.096 tokens en su versión original. Este fine-tuning conserva esa arquitectura y ese tamaño, por lo que los requisitos de hardware son los habituales para un modelo de 7 B en precisión completa o cuantizada.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero "likes", no declara licencia ni idiomas, y su model card es la plantilla autogenerada por TRL. Resulta útil únicamente como referencia para quienes reproducen experimentos de SFT sobre DeepSeek 7B Chat o necesitan comparar checkpoints intermedios de un pipeline de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de DeepSeek LLM 7B) |
| Parametros totales | 6.910.365.696 (6,91 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DeepSeek LLM 7B Chat usa 4.096 tokens) |
| Tipos de cuantizacion | No especificados por el autor; al ser safetensors en bfloat16/fp16 es convertible a GGUF, AWQ, GPTQ, bitsandbytes (8/4 bits) mediante herramientas estandar |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card incluye el literal "licence: license", sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,8 GB |
| Modelo base | deepseek-ai/deepseek-llm-7b-chat |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3 |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek LLM 7B Chat: un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No incorpora mecanismos de atención lineal, mezcla de expertos ni state space models. El checkpoint contiene 6.910.365.696 parámetros, coherente con un modelo denso de 7 B.

El entrenamiento consistió en un ajuste fino supervisado (SFT) mediante TRL, partiendo de `deepseek-ai/deepseek-llm-7b-chat`. El nombre del checkpoint (`SFT_baseline_arc_seed1234`) sugiere que se usó el dataset ARC (AI2 Reasoning Challenge) como corpus de ajuste, con semilla 1234, y que se trata de una ejecución "baseline" dentro de un estudio comparativo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros (learning rate, batch size, épocas) ni si hubo etapas posteriores de RLHF o DPO. La model card es la plantilla autogenerada por TRL y no aporta detalles adicionales.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base chat.
- Razonamiento y respuesta a preguntas de tipo ARC (ciencia elemental, multiple choice), presumiblemente el dominio objetivo del ajuste.
- Soporte de formato conversacional con roles `user`/`assistant` (pipeline `text-generation` con listas de mensajes).
- Compatible con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Capacidades multilingües: no documentadas; el modelo base DeepSeek LLM 7B se entrenó principalmente en inglés y chino, pero el autor no declara idiomas.
- Tool calling / function calling: no documentado para este checkpoint.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Reproducción de experimentos de SFT: sirve como checkpoint de referencia ("baseline") para comparar contra otras variantes de ajuste sobre DeepSeek 7B Chat con la misma semilla y dataset.
- Evaluación de razonamiento científico elemental: al haberse ajustado sobre ARC, es adecuado para probar la mejora en preguntas de ciencia de nivel escolar frente al modelo base.
- Investigación sobre olvido catastrófico: permite medir cuánto se degrada el rendimiento conversacional general tras un SFT específico de dominio.
- Punto de partida para ajustes posteriores: puede usarse como inicialización para DPO, RLHF o fine-tuning adicional en tareas concretas, dado que mantiene el formato chat del modelo base.
- Despliegue interno de bajo coste: con 6,91 B de parámetros cabe en una GPU de 24 GB en 8 bits o en 16-24 GB en bf16, útil para prototipos y pruebas de integración con TGI o vLLM.
- Estudio de sensibilidad a la semilla: el sufijo `seed1234` lo convierte en una pieza útil para analizar varianza entre ejecuciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 14 GB de pesos más overhead de activaciones y KV cache; en la práctica, 16-20 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits (bitsandbytes): ~7-8 GB de pesos, 10-12 GB totales.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB de pesos, 6-8 GB totales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090 (24 GB) equivalente.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en bf16 con contexto corto) y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (pipeline), Text Generation Inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama tras conversión a GGUF, y endpoints compatibles.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_1234 | 6,91 B | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental de SFT |
| deepseek-ai/deepseek-llm-7b-chat | 6,91 B | 4.096 tokens | DeepSeek Model License (uso comercial con restricciones) | Hugging Face, ampliamente usado | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de 7 B con contexto mucho mayor |
| Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community License | Hugging Face | Alternativa de tamaño similar con ecosistema maduro |

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene el literal "licence: license" sin texto, por lo que el uso comercial es jurídicamente incierto. Conviene contactar con el autor o asumir la licencia del modelo base DeepSeek.
- Modelo de investigación sin validación: cero descargas y cero "likes"; no hay evidencia de calidad ni de evaluación independiente.
- Riesgo de sobreajuste al dataset ARC: un SFT sobre un corpus específico puede degradar capacidades generales (olvido catastrófico) y aumentar la alucinación fuera del dominio.
- Idiomas no declarados: no se garantiza un comportamiento multilingüe correcto, especialmente tras el ajuste.
- Contexto no documentado: aunque el modelo base soporta 4.096 tokens, el autor no confirma que el fine-tuning preserve esa ventana.
- Sin información sobre sesgos: no hay evaluación de sesgos ni de seguridad; se heredan los del modelo base, que no están documentados en esta ficha.
- Model card autogenerada: el ejemplo de código usa `model="None"`, lo que indica que no fue revisada manualmente; no debe tomarse como documentación fiable.
- No apto para producción sin evaluación previa: carece de benchmarks, de tests de robustez y de soporte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_deepseek-llm-7b-chat_arc_1234
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformers Reinforcement Learning", 2020.
