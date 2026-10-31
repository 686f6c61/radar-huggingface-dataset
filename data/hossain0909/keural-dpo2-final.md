# hossain0909/keural-dpo2-final

## Resumen

Keural-DPO2-14.83B es un modelo de lenguaje bilingüe coreano-inglés con arquitectura Mixture-of-Experts (MoE), entrenado íntegramente desde cero por MKD Corp AI Research (República de Corea). Este checkpoint es el resultado final de la segunda ronda de DPO (Direct Preference Optimization), completada al paso 7.590 sobre un total de 485.793 pares de preferencias, y se apoya en la versión SFT Epoch 3 del modelo base (`mkd-hossain/keural-sft3-final`). Su propósito es ofrecer un asistente conversacional alineado por preferencias, optimizado para coreano como lengua principal e inglés como lengua secundaria.

El modelo resuelve el problema de la escasez de LLM abiertos con buen rendimiento en coreano, un idioma poco representado en la mayoría de modelos occidentales. Con 15,37 mil millones de parámetros totales y unos 7,42 mil millones activos por token (8 expertos, top-2), ofrece un equilibrio entre capacidad y coste de inferencia. La ventana de contexto es de 4.096 tokens y el pipeline de entrenamiento completo suma más de 86 mil millones de tokens entre preentrenamiento y SFT, con dos rondas de DPO para el alineamiento final. Es relevante como ejemplo de proyecto open source completo de un laboratorio pequeño, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KeuralMoECausalLM (transformer causal MoE, custom code) |
| Parametros totales | 15.368.933.376 (~14,83B según model card) |
| Parametros activos | ~7,42B por token (8 expertos, top-2) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; sin checkpoints cuantizados publicados) |
| Idiomas soportados | Coreano (principal), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), requiere `trust_remote_code=True` |

Detalle adicional de la arquitectura: 24 capas, hidden size 4.096, 32 cabezas de atención Q y 8 KV (GQA), dimensión de cabeza 128, tamaño intermedio de experto 5.632 con activación SwiGLU, RoPE theta 500.000, RMSNorm (eps=1e-5) y vocabulario de 131.074 tokens (SentencePiece más tokens especiales ChatML).

## Arquitectura y entrenamiento

Keural es un transformer causal MoE con 8 expertos FFN (SwiGLU, tamaño intermedio 5.632) de los cuales se activan 2 por token, lo que reduce el cómputo por token a aproximadamente la mitad de los parámetros totales. Utiliza GQA con 32 cabezas de consulta y 8 de clave-valor, ventanas deslizantes de 512 tokens en las capas pares (atención híbrida local/global), RMSNorm y RoPE con theta 500.000. El vocabulario usa formato ChatML con tokens `<|im_start|>` (ID 131072) y `<|im_end|>` (ID 131073), siendo este último el token de parada de generación.

El entrenamiento se realizó en 2× NVIDIA H200 SXM (139 GiB cada una) con FSDP FULL_SHARD, precisión mixta bfloat16 y gradient checkpointing. El pipeline completo constó de: preentrenamiento en dos etapas (~50B + ~19B tokens con corpus web coreano-inglés), tres épocas de SFT (710K, 710K filtradas y 2,35M muestras de 12 fuentes, ~25,6B tokens en total), y dos rondas de DPO (440K y 485.793 pares de preferencias). La DPO Round 2 usó beta 0,1, learning rate 2e-6 con decaimiento coseno hasta 2e-7, batch efectivo de 64, longitud máxima de 1.024 tokens y 7.590 pasos (1 época) durante 85,28 horas, con pérdida final de ~0,6928 (por debajo del baseline aleatorio de 0,6931) y margen de recompensa consistentemente positivo. El dataset de DPO mezcló fuentes como hh_rlhf, ultrafeedback_binarized, orca_dpo_pairs y datasets coreanos de AI Hub, con una proporción 58% inglés / 42% coreano.

## Capacidades

- Generación de texto conversacional bilingüe coreano-inglés, con formato ChatML y soporte de mensajes de sistema.
- Alineación por preferencias mediante dos rondas de DPO, orientada a respuestas más útiles y seguras.
- Instrucción tuning sobre 2,35M muestras en la última época de SFT (12 fuentes de datos).
- Razonamiento y generación de texto general en coreano e inglés (sin datos específicos de benchmarks de código o matemáticas).
- Ventana de contexto de 4.096 tokens, suficiente para conversaciones multi-turno de longitud moderada.
- Eficiencia de inferencia MoE: solo ~7,42B parámetros activos por token pese a los 14,83B totales.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo está optimizado con DPO sobre pares de preferencias coreanas (AI Hub, ko-ultrafeedback), lo que lo hace adecuado para chatbots de atención al usuario en mercados coreanos.
- Atención al cliente automatizada bilingüe: la ventana de 4.096 tokens permite gestionar conversaciones multi-turno, y el formato ChatML facilita la integración con plantillas de sistema personalizadas para cada marca.
- Traducción y redacción asistida coreano-inglés: el entrenamiento bilingüe con corpus web de ambos idiomas lo habilita para tareas de escritura y reformulación entre las dos lenguas.
- Despliegue en producción con vLLM: el model card incluye configuración de servidor OpenAI-compatible, útil para montar endpoints de inferencia con batching continuo.
- Experimentación académica sobre DPO y MoE: el pipeline completo está documentado con hiperparámetros y datasets, lo que lo convierte en referencia reproducible para investigación de alineamiento.
- Prototipado local de aplicaciones LLM: con ~7,42B parámetros activos, la carga de cómputo por token es comparable a modelos densos de 7B, accesible en hardware de gama alta.
- Fine-tuning adicional por parte de terceros: la licencia Apache 2.0 permite derivados comerciales sin restricciones de royalty.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de entrenamiento reportada es la pérdida final de DPO Round 2 (~0,6928) y el margen de recompensa positivo, que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- En bfloat16, el repo ocupa 30,7 GB, por lo que se necesita al menos una GPU con ~32 GB de VRAM (más margen para KV cache y activaciones).
- GPU recomendadas: una NVIDIA A100 40 GB o H100 80 GB para inferencia cómoda; el entrenamiento original usó 2× H200 SXM (139 GiB) con FSDP.
- En GPUs de consumo: una RTX 4090 (24 GB) es insuficiente en precisión completa; sería necesario offload a CPU o esperar cuantizaciones (GGUF/AWQ/GPTQ), que actualmente no están publicadas.
- Despliegue soportado: vLLM (con `--trust-remote-code`, ejemplo incluido en el model card) y Transformers con `device_map="auto"`. No hay checkpoints oficiales para llama.cpp ni Ollama, y al usar código custom la compatibilidad con estos runtimes no está garantizada.
- Latencia y throughput: no disponibles; al activar solo ~7,42B parámetros por token, el coste de cómputo debería situarse cerca del de un modelo denso de 7B, aunque la carga de memoria corresponde a los 14,83B totales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Keural-DPO2-14.83B | ~14,83B | ~7,42B | 4.096 | Coreano, inglés | Apache 2.0 |
| Qwen2.5-14B-Instruct | 14,7B (denso) | 14,7B | 128K | Multilingüe (29+, incl. coreano) | Apache 2.0 (14B) |
| Mixtral-8x7B-Instruct | 46,7B | 12,9B | 32K | Multilingüe europeo | Apache 2.0 |
| Qwen2.5-7B-Instruct | 7,6B (denso) | 7,6B | 128K | Multilingüe | Apache 2.0 |

Keural se sitúa en coste de cómputo por token cerca de un denso de 7B, pero con memoria de un modelo de 15B. Frente a Qwen2.5-14B, ofrece un enfoque especializado en coreano pero con contexto mucho más corto (4K frente a 128K) y sin ecosistema de cuantizaciones ni soporte nativo en runtimes populares. Frente a Mixtral 8x7B, es mucho más ligero en memoria y está centrado en coreano, aunque con menor capacidad general presumiblemente.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`: ejecuta código custom del autor, lo que implica un riesgo de seguridad adicional frente a arquitecturas nativas de Transformers; revisa el código antes de usarlo en producción.
- Contexto de solo 4.096 tokens, muy limitado para tareas de documentos largos, RAG con mucho contexto o análisis de código extenso.
- Sin cuantizaciones oficiales publicadas, lo que restringe el despliegue en hardware de consumo y encarece la inferencia en memoria.
- No hay benchmarks públicos (MMLU, HumanEval, etc.), por lo que la calidad real del modelo no puede contrastarse con estándares de la industria; la pérdida de DPO no es un indicador de calidad general.
- Riesgo de alucinación no cuantificado; el propio system prompt del modelo indica que debe admitir cuando no sabe, lo que sugiere que los autores reconocen ese riesgo.
- Sesgos: entrenado con corpus web y datasets de preferencias (hh_rlhf, ultrafeedback), por lo que puede heredar sesgos de esos datos; no se publicó documentación de evaluación de sesgos o seguridad.
- Soporte de idiomas limitado a coreano e inglés; el rendimiento fuera de estos idiomas es desconocido y probablemente deficiente.
- Descargas muy bajas (292) y comunidad mínima: escaso testeo por terceros y soporte limitado.
- La licencia Apache 2.0 no impone restricciones comerciales, pero al ser un modelo entrenado desde cero por un equipo pequeño, no hay auditorías independientes de seguridad o robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/keural-dpo2-final
- Modelo base (SFT Epoch 3): https://huggingface.co/mkd-hossain/keural-sft3-final
- Paper, blog o repositorio de entrenamiento: no disponible
