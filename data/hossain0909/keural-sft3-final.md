# hossain0909/keural-sft3-final

## Resumen

Keural-SFT3-Final es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 14.830 millones de parámetros totales (aproximadamente 7.420 millones activos por token), entrenado desde cero por el autor mkd-hossain (publicado bajo el identificador hossain0909) para el seguimiento de instrucciones bilingüe coreano-inglés. Este checkpoint concreto corresponde a la tercera época de ajuste supervisado (SFT Epoch 3) sobre el pipeline de entrenamiento Keural, y sirve como base para la segunda ronda de DPO que desemboca en el modelo final mkd-hossain/keural-dpo2-final.

La arquitectura es propia y personalizada (KeuralMoECausalLM), registrada mediante `trust_remote_code=True`, con 24 capas, tamaño oculto de 4.096, atención GQA con 32 cabezas de consulta y 8 de clave/valor, 8 expertos con enrutamiento top-2 y una ventana de contexto de 4.096 tokens. El modelo se distribuye en bfloat16 y emplea un tokenizador de 131.074 entradas con tokens especiales ChatML dedicados.

Su relevancia radica en ser un intento independiente de construir un modelo bilingüe coreano-inglés desde cero, con un pipeline documentado de preentrenamiento (unos 69B de tokens en dos etapas), SFT y DPO, sobre hardware de gama alta (2× NVIDIA H200 SXM). No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | KeuralMoECausalLM (transformer MoE causal, arquitectura personalizada, `trust_remote_code=True`) |
| Parámetros totales | 14,83B |
| Parámetros activos | ~7,42B por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente (librería transformers; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

KeuralMoECausalLM es un transformer causal con mezcla de expertos: 24 capas, tamaño oculto de 4.096, 32 cabezas de atención de consulta y 8 de clave/valor (GQA), dimensión de cabeza 128, 8 expertos totales con enrutamiento top-2 por token y tamaño intermedio de experto de 5.632 con activación SwiGLU. Usa RMSNorm con epsilon 1e-5, RoPE con theta 500.000, ventana deslizante de 512 tokens solo en capas pares, vocabulario de 131.074 entradas (131.072 SPM más `<|im_start|>` con ID 131072 y `<|im_end|>` con ID 131073) y precisión bfloat16.

El entrenamiento se documenta en varias etapas: preentrenamiento en dos fases (100.000 pasos, ~50B tokens; y 120.000 pasos, ~19B tokens) sobre corpus web coreano e inglés; SFT Epoch 1 (18.000 pasos, ~710M tokens); DPO Round 1 (6.927 pasos, 440K pares de preferencia); SFT Epoch 2 (29.112 pasos, ~7,6B tokens); y esta SFT Epoch 3 (65.849 pasos, ~17,3B tokens sobre 2,35M muestras de 12 fuentes). Todo el pipeline se ejecutó en 2× NVIDIA H200 SXM. Los hiperparámetros de esta época: learning rate 2e-5 con decaimiento coseno hasta 2e-6, 100 pasos de warmup, batch efectivo de 64 (2 × 16 de acumulación × 2 GPUs), longitud máxima de secuencia de 2.048 tokens, optimizador AdamW (β1=0,9, β2=0,95, ε=1e-8) y recorte de gradiente de 1,0.

El dataset de SFT Epoch 3 combina fuentes inglesas (OpenHermes-2.5 con 1.001.551 muestras, SlimOrca con 517.982, UltraChat con 193.212, OpenOrca con 138.639, Alpaca con 46.303) y coreanas (AIHub multisession sci con 127.868, AIHub daily conversation con 120.867, AIHub multisession social con 85.346, KoInstruct QA con 45.299, KoInstruct base con 42.276, KoAlpaca con 21.091, AIHub expert QA con 10.778), sumando 2.351.212 muestras.

## Capacidades

- Generación de texto y seguimiento de instrucciones en coreano e inglés (modelo bilingüe declarado).
- Conversación multi-turno mediante formato ChatML con tokens `<|im_start|>` y `<|im_end|>`.
- Razonamiento y respuesta a preguntas de tipo instructivo, entrenado sobre OpenHermes, SlimOrca, OpenOrca, UltraChat y KoInstruct.
- Conversación cotidiana y de sesiones múltiples en coreano (datos AIHub daily conversation y multisession).
- Dominio de QA experto en coreano (AIHub expert QA).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente conversacional bilingüe coreano-inglés: el modelo puede mantener diálogos multi-turno con hasta 4.096 tokens de contexto usando el formato ChatML, adecuado para aplicaciones de atención al usuario en ambos idiomas.
- Atención al cliente en coreano: gracias al entrenamiento con AIHub daily conversation y multisession, puede gestionar conversaciones cotidianas y de seguimiento en coreano con contexto de sesión.
- Generación de respuestas instructivas en inglés: el volumen de datos OpenHermes, SlimOrca y OpenOrca lo orienta a tareas de QA y explicaciones en inglés.
- Prototipado de investigación sobre arquitecturas MoE: al ser un modelo desde cero con arquitectura propia y pipeline documentado, sirve como base para experimentos académicos sobre enrutamiento de expertos y ajuste SFT/DPO.
- Base para ajuste fino posterior: es explícitamente el punto de partida de la ronda DPO 2, por lo que puede emplearse como checkpoint intermedio para experimentos de preferencia.
- Generación de contenido y resúmenes en coreano e inglés: con contexto de 4.096 tokens puede procesar documentos cortos y producir resúmenes o reescrituras en ambos idiomas.
- Evaluación comparativa de modelos bilingües coreano-inglés de tamaño medio: útil como referencia en estudios que comparen modelos MoE de ~15B en tareas bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 30 GB solo para pesos (14,83B × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 40-48 GB.
- En cuantización de 8 bits: ~15 GB de pesos; en 4 bits: ~8 GB de pesos (estimaciones teóricas; no se documentan cuantizaciones oficiales).
- GPU recomendadas: NVIDIA H100 o H200 para bfloat16 sin cuantizar; A100 80 GB también viable. En consumer, una RTX 4090 (24 GB) no cabe en bfloat16 sin cuantización; con 4 bits podría caber, aunque no está verificado.
- Opciones de despliegue: transformers con `trust_remote_code=True` (soporte oficial documentado). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, ya que la arquitectura es personalizada y requiere código remoto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Idiomas | Licencia | Benchmarks |
|---|---|---|---|---|---|---|
| Keural-SFT3-Final | 14,83B | ~7,42B | 4.096 | ko, en | Apache 2.0 | no disponibles |
| Qwen2.5-14B | 14,7B | 14,7B (denso) | 32.768 | multilingüe | Apache 2.0 | publicados por el autor |
| Mixtral 8x7B | 46,7B | ~12,9B | 32.768 | multilingüe | Apache 2.0 | publicados por el autor |
| Yi-1.5-9B | 8,8B | 8,8B (denso) | 4.096 | en, zh | Apache 2.0 | publicados por el autor |

La comparación con estos modelos es orientativa: Keural no publica benchmarks, por lo que no puede establecerse una comparación de rendimiento verificable. Frente a ellos, su contexto (4.096) es notablemente menor que el de Qwen2.5 o Mixtral, y su especialización es exclusivamente coreano-inglés.

## Limitaciones y advertencias

- No se han publicado benchmarks; el rendimiento real es desconocido y no verificable de forma independiente.
- Cero descargas y cero likes en HuggingFace en el momento de la ficha: ausencia de validación por parte de la comunidad.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- Solo soporta coreano e inglés; no hay evidencia de capacidades multilingües más allá de esos dos idiomas.
- Arquitectura personalizada que requiere `trust_remote_code=True`: implica ejecutar código del autor y reduce la compatibilidad con herramientas estándar de despliegue.
- Riesgo de alucinación inherente a modelos entrenados con SFT sobre datasets web; no se documentan evaluaciones de seguridad ni de sesgos.
- El token EOS correcto es 131073 (`<|im_end|>`); usar el ID 2 provoca generaciones incorrectas, lo que constituye una trampa de integración relevante en producción.
- Licencia Apache 2.0 permite uso comercial, pero los datos de AI Hub pueden tener condiciones adicionales de atribución; el autor declara compatibilidad Apache 2.0 o CC-BY, sin detallar.
- No hay información sobre tool calling, agentes ni despliegue en vLLM/llama.cpp, lo que limita su uso en pipelines de producción estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hossain0909/keural-sft3-final
- Modelo base (DPO Round 1): https://huggingface.co/mkd-hossain/keural-dpo-final
- Modelo final (DPO Round 2): https://huggingface.co/mkd-hossain/keural-dpo2-final
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Plataforma de datos AI Hub: https://aihub.or.kr
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
