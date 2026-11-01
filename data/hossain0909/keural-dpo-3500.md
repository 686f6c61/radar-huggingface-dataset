# hossain0909/keural-dpo-3500

## Resumen

Keural-DPO-3500 es un modelo de lenguaje bilingüe coreano-inglés de tipo Mixture-of-Experts (MoE) entrenado íntegramente desde cero por el autor hossain0909. Se trata del checkpoint de alineación DPO (Direct Preference Optimization) en el paso 3.500, aproximadamente al 50 % de una época, derivado del modelo base mkd-hossain/keural-sft-18k mediante datos de preferencias humanas. El objetivo del proyecto es ofrecer un modelo conversacional optimizado para coreano (idioma principal) con buen soporte de inglés, algo relevante dado que los modelos abiertos con enfoque principal en coreano son escasos frente a los centrados en inglés o chino.

El modelo sigue una arquitectura estilo Mixtral con 8 expertos y enrutado top-2, lo que supone 14,83B de parámetros totales de los cuales solo ~7,42B se activan por token. El pipeline completo incluye preentrenamiento en dos etapas (~63B tokens), SFT sobre 1,14M muestras ChatML y esta fase de DPO sobre 440K pares de preferencias, entrenado en 2× NVIDIA H200. La ventana de contexto es de 4.096 tokens y los pesos se distribuyen en safetensors (30,7 GB en bfloat16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral-style MoE (8 expertos, enrutado top-2) |
| Parametros totales | 14,83B (15.368.933.376 según safetensors) |
| Parametros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, 30,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decodificador estilo Mixtral con 24 capas, tamaño oculto de 4.096, 32 cabezas de atención con GQA (8 cabezas KV) y un tamaño intermedio de experto de 5.632. Emplea RoPE con theta de 500.000 y ventana deslizante de 512 tokens alternada en capas alternas, una técnica que reduce el coste de la atención en secuencias largas. El vocabulario tiene 131.074 tokens (131.072 de un tokenizador SPM más los tokens especiales `<|im_start|>` e `<|im_end|>`).

El entrenamiento constó de cuatro etapas: preentrenamiento etapa 1 (100.000 pasos, ~50B tokens sobre corpus web coreano e inglés), preentrenamiento etapa 2 (120.000 pasos, ~13B tokens adicionales), SFT (18.000 pasos, 710M tokens sobre 1,14M muestras ChatML del dataset mkd-chanwoo/keural-SFT) y DPO (440K pares de preferencias del dataset keural-dpo-raw, con máximo de 6.927 pasos de los cuales este checkpoint corresponde al 3.500). El DPO usó learning rate 2e-6 con decaimiento coseno hasta 2e-7, beta (coeficiente KL) de 0,1, batch efectivo de 64 y secuencias de 1.024 tokens, con AdamW (β1=0,9, β2=0,95), weight decay de 0,1, precisión bfloat16 con gradient checkpointing y paralelismo FSDP FULL_SHARD sobre 2× NVIDIA H200 SXM.

## Capacidades

- Generación de texto conversacional bilingüe en coreano (idioma principal) e inglés, respondiendo en el idioma del usuario si se le indica en el system prompt.
- Seguimiento de instrucciones mejorado respecto al checkpoint SFT gracias a la alineación DPO, con reducción de respuestas fuera de tema.
- Formato de conversación ChatML con tokens especiales `<|im_start|>` / `<|im_end|>`, compatible con plantillas de chat de `transformers`.
- Compatibilidad con servidores OpenAI-compatible vía vLLM, lo que facilita su integración en aplicaciones que usan la API de chat estándar.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está alineado con preferencias humanas en coreano y usa formato ChatML multi-turno, adecuado para chatbots de atención al usuario en ese idioma.
- Sistemas bilingües coreano-inglés: puede servir de base para aplicaciones que atienden usuarios en ambos idiomas, respondiendo en el idioma de entrada.
- Despliegue en producción con API OpenAI-compatible: el README incluye configuración lista para vLLM, lo que permite integrarlo en backends existentes sin cambios de código.
- Investigación sobre alineación DPO en MoE desde cero: al publicarse el pipeline completo (hiperparámetros, datasets y etapas), es útil como referencia reproducible para estudios de RLHF/DPO.
- Prototipado local de LLMs bilingües: con ~7,42B de parámetros activos por token, la inferencia es más ligera que la de un modelo denso de 15B.
- Fine-tuning posterior por terceros: la licencia Apache-2.0 permite derivados comerciales, por ejemplo especialización en dominios como soporte técnico o generación de contenido en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica cualitativamente que el DPO mejora la calidad de las respuestas, el seguimiento de instrucciones y reduce las salidas fuera de tema respecto al checkpoint SFT, pero sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~30,7 GB solo de pesos, por lo que se recomienda una GPU con 40 GB o más (A100 40 GB/80 GB, H100, H200) o al menos 48 GB.
- No cabe de forma práctica en GPUs de consumo de 24 GB (RTX 3090/4090) sin cuantización; no hay pesos cuantizados publicados, por lo que no disponible una ruta oficial de cuantización (GGUF, GPTQ, AWQ).
- Para entrenamiento/DPO, la configuración original usó 2× NVIDIA H200 SXM (139 GiB cada una) con FSDP FULL_SHARD y gradient checkpointing.
- Despliegue soportado y documentado: vLLM (recomendado por el autor, con endpoint OpenAI-compatible y opción de tensor parallel size 2) y `transformers` con `device_map="auto"`. No hay soporte oficial documentado para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al activar solo ~7,42B de parámetros por token, el throughput esperable es superior al de un modelo denso de tamaño similar, aunque no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Idiomas |
|---|---|---|---|---|---|
| Keural-DPO-3500 | 14,83B | ~7,42B | 4.096 | Apache-2.0 | Coreano, inglés |
| Mixtral-8x7B-Instruct (Mistral AI) | 46,7B | ~12,9B | 32.768 | Apache-2.0 | Multilingüe (incl. coreano, sin especialización) |
| Qwen2.5-14B-Instruct | 14,7B (denso) | 14,7B | 32.768 (128K con YaRN) | Qwen (uso comercial condicionado) | Multilingüe (29+ idiomas) |
| EXAONE-3.5-7.8B-Instruct (LG AI Research) | 7,8B (denso) | 7,8B | 32.768 | EXAONE (no comercial sin permiso) | Coreano, inglés |

Keural se distingue por ser el único del grupo entrenado desde cero con foco principal en coreano y por su licencia Apache-2.0 sin restricciones comerciales; a cambio, ofrece un contexto mucho menor (4.096 tokens) y carece de benchmarks públicos que permitan comparar rendimiento de forma objetiva.

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o RAG con mucho material recuperado.
- Solo coreano e inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea pobre.
- No hay benchmarks públicos ni evaluaciones de seguridad o sesgo publicadas; el riesgo de alucinación no está cuantificado y el modelo procede de un preentrenamiento sobre corpus web sin filtros documentados.
- No hay pesos cuantizados oficiales, lo que limita su uso en hardware de consumo; ejecutarlo en bfloat16 requiere ~31 GB de VRAM.
- Es un checkpoint intermedio (paso 3.500 de 6.927, ~50 % del DPO), no el modelo final de la alineación, por lo que su calidad puede no representar el resultado final del proyecto.
- Proyecto individual con pocas descargas (341) y sin comunidad de revisión; conviene validarlo internamente antes de cualquier uso en producción.
- Es imprescindible usar el formato ChatML y fijar `eos_token_id=131073` (`<|im_end|>`); usar el EOS estándar (ID 2) provocará generaciones degeneradas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo incluye `custom_code` en sus tags, por lo que conviene revisar el código del repositorio antes de ejecutarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/keural-dpo-3500
- Modelo base (SFT): https://huggingface.co/mkd-hossain/keural-sft-18k (referenciado en la model card; no disponible verificación directa del enlace)
- Dataset SFT: https://huggingface.co/datasets/mkd-chanwoo/keural-SFT (referenciado en la model card)
- Paper, blog o demos: no disponibles
