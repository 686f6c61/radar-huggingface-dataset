# mlx-community/HeartMuLa-oss-3B-8bit

## Resumen

HeartMuLa-oss-3B-8bit es la mitad lingüística del sistema de generación musical HeartMuLa, cuantizada a 8 bits por el equipo de mlx-community para su uso con el motor `mlx-heartmula-swift` sobre Apple Silicon. HeartMuLa convierte etiquetas de estilo separadas por comas y letras con marcas de sección en una canción completa con voz (48 kHz estéreo, hasta 4 minutos). El modelo base original es HeartMuLa/HeartMuLa-oss-3B-happy-new-year, desarrollado por el equipo HeartMuLa / MuLa Labs.

La arquitectura sigue la forma de Llama-3.2: un transformer de 28 capas y dimensión 3072 con 3.938.113.536 parámetros totales. Este LM global predice el codebook 0 a 12,5 Hz, mientras que un decodificador local de 300M parámetros predice los codebooks 1 a 7. Las 217 capas Linear de ambos transformers están pre-cuantizadas a 8 bits (MLX affine, grupo 64), mientras que embeddings, cabezas y normalizaciones permanecen en bf16.

Es relevante ahora porque ofrece la configuración por defecto del port Swift-MLX: combinado con HeartCodec-oss-fp16, rinde a unas 3× velocidad real en un Mac de 24 GB, con una huella de memoria declarada de 8,5 GB en residente más 5,5 GB de pico de trabajo. El coste es una mayor tendencia a agotar el límite de duración y una calidad de letra ligeramente inferior a la variante bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (forma Llama-3.2: 28 capas × 3072), LM global que predice codebook 0 a 12,5 Hz + decodificador local de 300M que predice codebooks 1–7 |
| Parametros totales | 3.938.113.536 (3,94B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX affine con grupo 64 en las 217 capas Linear; embeddings, cabezas y normalizaciones en bf16. Existe variante bf16; una variante 4-bit falló su puerta de calidad de letra (PER 0,220) y no se publicó |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (723 tensores: 217 Linear cuantizadas como weight / scales / biases, el resto bf16); tokenizer.json (BPE de Llama-3.2) y gen_config.json |

## Arquitectura y entrenamiento

El sistema es un modelo de dos niveles. Un LM global de 3B parámetros con forma de Llama-3.2 (28 capas × 3072) genera el codebook 0 a una tasa de 12,5 Hz a partir de las etiquetas de estilo y las letras con marcas de sección; después, un decodificador local de 300M parámetros predice los codebooks 1 a 7. La salida se decodifica con HeartCodec-oss (en este repo, HeartCodec-oss-fp16) para producir audio estéreo a 48 kHz. La captions es la única entrada de estilo y se interpreta como etiquetas separadas por comas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card sí documenta la paridad técnica: el bundle bf16 es bit-equal a los tensores del release original casteados a bf16, el LM en Swift coincide con heartlib sobre PyTorch-MPS con argmax 130/130 posiciones y códigos muestreados idénticos a partir de ruido registrado en fp32, y los tensores cuantizados de este bundle son bit-equal a `MLX.quantized` de los pesos bf16. El pipeline Swift aplica una única ganancia de limitador a −1 dBFS porque la salida cruda del códec puede superar la escala completa (picos de hasta 1,37).

## Capacidades

- Generación de audio musical a partir de texto: convierte etiquetas de estilo y letras en una canción con voz, 48 kHz estéreo y hasta 4 minutos.
- Control de estructura por secciones mediante marcas en las letras (`[verse]`, `[chorus]`).
- Control de duración mediante un tope configurable de 1 a 240 segundos (por defecto 120); la mayoría de canciones terminan solas cuando se acaban las letras.
- Reproducibilidad mediante semilla (`seed`).
- Soporte bilingüe limitado a inglés y chino mandarín.
- No soporta tool calling ni function calling (es un modelo text-to-audio).
- No soporta razonamiento multi-paso ni uso como agente.
- No acepta audio de referencia, ediciones, planificación, partitura, anclas de BPM/tonalidad ni idioma vocal: se rechazan. `guidanceScale` se ignora.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Maquetas musicales rápidas en un Mac: con el LM de 8 bits y el códec fp16 se generan canciones de 120 s a unas 3× velocidad real en un M5 Max, lo que permite iterar sobre letras y etiquetas de estilo sin salir del portátil.
- Previsualización de letras para composición: el modelo sigue las letras en inglés con una tasa de error de letra (PER de Whisper) de 0,132, lo que sirve para comprobar si una letra encaja rítmicamente antes de grabar voces reales.
- Generación de música de fondo con estructura definida: usando marcas `[verse]`/`[chorus]` y un tope de duración corto se obtienen piezas con secciones diferenciadas para vídeo, pódcast o demos de producto.
- Prototipado de aplicaciones Swift en Apple Silicon: la integración vía `MLXHeartMuLa` en `Package.swift` permite registrar el modelo, prepararlo con `engine.prepare(.music, ...)` y ejecutar peticiones `MusicRequest` dentro de una app nativa.
- Evaluación de sistemas text-to-audio: al ser una implementación con paridad documentada frente a PyTorch-MPS (argmax 130/130), sirve como referencia reproducible para comparar pipelines de inferencia.
- Experimentación con cuantización en MLX: el repo expone la configuración 8-bit junto a la bf16 y documenta que la 4-bit no superó la puerta de calidad, lo que facilita estudios de compromiso memoria/calidad.
- Generación de contenido en mandarín para pruebas internas: aunque el rendimiento es débil (PER de referencia 0,457 en PyTorch), permite validar flujos bilingües antes de invertir en un modelo superior.

## Benchmarks y rendimiento

| Metrica | 8-bit (este repo) | bf16 (MLX) | Referencia PyTorch |
|---|---|---|---|
| PER de letra en inglés (Whisper) | 0,132 | 0,125 | 0,165 |
| PER de letra en mandarín | no disponible | no disponible (mejor que la referencia en 2 canciones, muestra insuficiente) | 0,457 |
| Canciones que agotan el tope de 120 s | 10 de 24 | 5 de 24 | no disponible |
| Recuperación de estilo CLAP (posición media sobre 12) | ~4,5 | ~4,5 | ~4,5 (otros modelos abiertos: ~2) |
| Velocidad de render (M5 Max, con códec fp16) | 3,0× tiempo real | 2,5× tiempo real | no disponible |
| Memoria declarada (residente + pico, canción de 120 s) | 8,5 + 5,5 GB | 11,5 + 6,0 GB | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son las específicas del sistema de generación musical.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,5 GB residentes más 5,5 GB de pico de trabajo con códec fp16 (configuración por defecto); 11,5 + 10,0 GB con códec fp32.
- "Cabe" según la regla de admisión del motor de 0,7 × RAM: 24 GB de RAM para 8-bit + fp16; 32 GB para bf16 + fp16 y para 8-bit + fp32; 48 GB para bf16 + fp32.
- GPU recomendadas: Apple Silicon (mediciones sobre M5 Max); no se documentan requisitos para GPU NVIDIA ni AMD en la información disponible.
- Cabe en equipos de consumo Apple con 24 GB o más de memoria unificada; no se dispone de datos para GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: motor `mlx-heartmula-swift` (Swift-MLX) con `MLXServeEngine` y `ModelStore`; requiere llamar a `HeartMuLaPackage.configureProcess()` antes de ejecutar el modelo (TF32 desactivado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 3,0× tiempo real con 8-bit + fp16 en M5 Max; 2,5× con bf16 + fp16; 2,3× con 8-bit + fp32; 1,85× con bf16 + fp32.
- Tamaño del repo: 4,9 GB (`model.safetensors` de 4,94 GB, tokenizer y configuración de 9,1 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeartMuLa-oss-3B-8bit (este) | 3,94B | no disponible | Apache-2.0 | MLX (Swift), Apple Silicon | 8,5 + 5,5 GB, 3,0× tiempo real, PER inglés 0,132 |
| HeartMuLa-oss-3B-bf16 | 3,94B | no disponible | Apache-2.0 | MLX (Swift), Apple Silicon | 11,5 + 6,0 GB, 2,5× tiempo real, PER inglés 0,125, agota menos el tope (5/24) |
| HeartMuLa-oss-3B-happy-new-year (original) | 3,94B | no disponible | Apache-2.0 (según model card) | PyTorch (heartlib) | Referencia: PER inglés 0,165, PER mandarín 0,457 |
| Otros modelos abiertos de música medidos en el set de 12 canciones | no disponible | no disponible | no disponible | no disponible | Recuperación de estilo CLAP ~2 de 12 frente a ~4,5 de HeartMuLa |

## Limitaciones y advertencias

- Las etiquetas de estilo apenas dirigen el resultado: la recuperación CLAP sitúa sus canciones en torno a 4,5 de 12 para sus propias etiquetas, y subir CFG a 3,0 no ayuda.
- Deriva de género vocal: la mayoría de voces salen femeninas independientemente de las etiquetas; solo 1 de 6 prompts con voz masculina obtuvo voz masculina.
- El mandarín es débil e irregular: PER de 0,457 en la referencia PyTorch (con un verso perdido) frente a 0,107 en inglés.
- El LM de 8 bits agota el tope de duración el doble de a menudo que bf16 (10 de 24 frente a 5 de 24 a 120 s): las letras se cantan, los estribillos se repiten y una canción de 24 repitió una sola línea hasta el tope.
- La salida cruda del códec puede superar la escala completa (picos de 1,37); el pipeline Swift aplica una ganancia de limitador a −1 dBFS, pero otros consumidores deben gestionarlo.
- Riesgo de alucinación y de contenido no deseado inherente a los modelos generativos; no se documentan sesgos específicos más allá de la deriva de género vocal.
- Restricciones de licencia: Apache-2.0, pero la cadena de atribución es frágil. Los repositorios del generador de HeartMuLa declaran `license: apache-2.0` en sus model cards sin fichero LICENSE; la concesión se apoya en la declaración de la card y en el README de heartlib del 2026-01-20, que traslada "all related model weights" a Apache-2.0. Este repo incluye el texto Apache-2.0 de heartlib como `LICENSE` y un `NOTICE` con la cadena de concesión. No está avalado por el equipo de HeartMuLa ni por MuLa Labs.
- Limitaciones funcionales en producción: no acepta audio de referencia, ediciones, planificación, partitura, anclas de BPM/tonalidad ni idioma vocal; `guidanceScale` se ignora.
- Solo inglés y chino; no se documenta soporte de otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/HeartMuLa-oss-3B-8bit
- Modelo base: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Variante bf16: https://huggingface.co/mlx-community/HeartMuLa-oss-3B-bf16
- Códec: https://huggingface.co/mlx-community/HeartCodec-oss-fp16
- Motor Swift-MLX: https://github.com/xocialize/mlx-heartmula-swift
- Mediciones detalladas: https://github.com/xocialize/mlx-heartmula-swift/blob/main/MEASUREMENTS.md
- Paper: arXiv 2601.10547
