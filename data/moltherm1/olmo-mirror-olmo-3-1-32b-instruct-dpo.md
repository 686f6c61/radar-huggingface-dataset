# moltherm1/olmo-mirror-olmo-3.1-32b-instruct-dpo

## Resumen

Olmo 3.1 32B Instruct DPO es la versión de 32.000 millones de parámetros de la familia Olmo 3 de Ai2 (Allen Institute for AI), publicada como espejo por el usuario `moltherm1` en Hugging Face. Se trata de un transformer autorregresivo de tipo denso (no MoE) entrenado desde el modelo base Olmo-3-32B, con una etapa de SFT sobre instrucciones y una posterior etapa de DPO (Direct Preference Optimization) sobre el dataset Dolci-Instruct-DPO. El resultado es un modelo conversacional afinado para seguir instrucciones en inglés.

La relevancia de esta ficha radica en que Olmo es una de las pocas familias de modelos de gran escala completamente abiertas: Ai2 libera pesos, código de entrenamiento, checkpoints intermedios y detalles del pipeline. Este checkpoint concreto corresponde a la etapa DPO, es decir, la antesala del modelo final tras RLVR (Reinforcement Learning with Verifiable Rewards), por lo que resulta útil para quienes quieren estudiar o reutilizar el proceso de alineamiento preferencial sin partir del modelo final.

El modelo se distribuye bajo licencia Apache 2.0, con un repositorio de 32,1 GB en formato transformers, soporte en `transformers >= 4.57.0` y etiqueta `endpoints_compatible`. Está orientado exclusivamente a inglés y su fecha de corte de conocimiento es diciembre de 2024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo denso (estilo decoder-only) |
| Parametros totales | 32B (aproximado por denominación; no se detalla cifra exacta en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 vía bitsandbytes (`load_in_8bit=True`); fp16 (`torch_dtype=torch.float16`); no se documentan GGUF/AWQ/GPTQ en la información disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio transformers de 32,1 GB) |

## Arquitectura y entrenamiento

Olmo 3.1 32B Instruct DPO es un transformer autorregresivo denso, no un modelo de mezcla de expertos. Forma parte de la familia Olmo 3, que Ai2 describe como un conjunto de modelos de 7B y 32B en variantes Instruct y Think. El pipeline de entrenamiento documentado es: preentrenamiento sobre Dolma 3, SFT sobre las datasets Dolci (en este caso el checkpoint `Olmo-3.1-32B-Instruct-SFT`), y una etapa posterior de DPO sobre `allenai/Dolci-Instruct-DPO`. Este checkpoint corresponde exactamente a esa etapa DPO, previa al ajuste final con RLVR que da lugar al modelo `Olmo-3.1-32B-Instruct`.

La model card indica que Ai2 libera código, checkpoints y detalles de entrenamiento asociados, con repositorios separados para preentrenamiento/SFT (OLMo-core), DPO y RLVR (Open-Instruct) y evaluación (OLMo-Eval). Se documentan checkpoints intermedios con convención `step_XXXX` accesibles vía `revision` en Hugging Face. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni hiperparámetros del DPO.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés.
- Razonamiento y tareas de conocimiento general, heredadas del modelo base Olmo-3-32B.
- Capacidades de matemáticas y código, reforzadas en la familia Olmo 3 (la variante Think se describe explícitamente como mejora en matemáticas y programación; esta variante Instruct no incluye modo thinking largo).
- Alineamiento preferencial mediante DPO, orientado a respuestas más útiles y seguras que el checkpoint SFT.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en esta variante.
- Compatibilidad con `transformers >= 4.57.0` y con endpoints compatibles (`endpoints_compatible`).

## Casos de uso

- Investigación sobre alineamiento preferencial: este checkpoint DPO permite estudiar el efecto del DPO frente al SFT y al modelo final con RLVR, comparando respuestas sobre el mismo conjunto de prompts y midiendo cambios en estilo, seguridad y utilidad.
- Generación de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno con instrucciones en inglés; es adecuado para prototipos de asistentes internos donde se requiera una licencia permisiva (Apache 2.0) y trazabilidad completa del entrenamiento.
- Reproducción de pipelines de post-entrenamiento: al estar disponibles los repositorios Open-Instruct y OLMo-core, se puede reentrenar o continuar el DPO con datasets propios, usando este checkpoint como punto de partida.
- Fine-tuning específico de dominio: el modelo sirve como base para adaptar a dominios concretos (legal, médico, técnico) en inglés, con la ventaja de que los checkpoints intermedios permiten elegir el punto de partida óptimo.
- Evaluación comparativa de modelos abiertos: útil como referencia en benchmarks de modelos de 32B de pesos abiertos, dado que Ai2 publica OLMo-Eval y los resultados del modelo final.
- Despliegue en entornos con requisitos de licencia estricta: al ser Apache 2.0, puede integrarse en productos comerciales sin las restricciones de licencias tipo Llama o Gemma, siempre que se respeten las guías de uso responsable de Ai2.
- Docencia y formación: la disponibilidad de logs y checkpoints intermedios lo convierte en material didáctico para explicar las etapas SFT → DPO → RLVR en un curso de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la familia Olmo 3 mejora en tareas de razonamiento, matemáticas y código, y enlaza a un paper (arXiv:2512.13961), pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni comparativas numéricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en int8 (bitsandbytes): aproximadamente 32 GB para pesos, más overhead; viable en una A100 40GB o H100 con margen limitado.
- GPU recomendadas: A100 80GB, H100 80GB, H200; para int8, A100 40GB puede ser suficiente con contexto corto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en fp16 ni int8 sin cuantización adicional (4-bit no documentada en la información disponible); sería necesario cuantizar a 4-bit con herramientas externas no listadas en la model card.
- Opciones de despliegue: `transformers` (soporte oficial), endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no se mencionan explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-DPO (este) | 32B | no disponible | Apache 2.0 | Hugging Face (espejo) | Checkpoint DPO intermedio, solo inglés |
| Olmo-3.1-32B-Instruct | 32B | no disponible | Apache 2.0 | Hugging Face (Ai2) | Modelo final tras RLVR |
| Olmo-3-32B-Think | 32B | no disponible | Apache 2.0 | Hugging Face (Ai2) | Variante con chain-of-thought largo |
| Olmo-3.1-32B-Instruct-SFT | 32B | no disponible | Apache 2.0 | Hugging Face (Ai2) | Etapa previa al DPO |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente en la información disponible; como modelo entrenado principalmente con datos en inglés, es esperable un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas para este checkpoint.
- Limitaciones de idioma: soporte exclusivo de inglés según la model card; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo está destinado a investigación y educación conforme a sus Responsible Use Guidelines; conviene revisar dichas guías antes de un despliegue comercial.
- Fecha de corte: diciembre de 2024; el modelo no conoce eventos posteriores.
- Checkpoint intermedio: al ser la etapa DPO y no el modelo final con RLVR, su rendimiento en tareas verificables (matemáticas, código) puede ser inferior al de `Olmo-3.1-32B-Instruct`.
- Espejo no oficial: el repositorio pertenece a `moltherm1`, no a Ai2; conviene verificar la integridad de los pesos frente al repositorio oficial de AllenAI antes de usarlo en producción.
- Sin datos de benchmarks publicados en la información disponible, lo que dificulta la comparación objetiva con alternativas.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3.1-32b-instruct-dpo
- Modelo base SFT: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-SFT
- Modelo DPO oficial: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-DPO
- Modelo final Instruct: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Modelo base preentrenado: https://huggingface.co/allenai/Olmo-3-1125-32B
- Página del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-core (preentrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval: https://github.com/allenai/OLMo-Eval
- Guías de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper referenciado: arXiv:2512.13961 (enlace completo no disponible en la información proporcionada)
