# mlx-community/HeartCodec-oss-fp16

## Resumen

HeartCodec-oss-fp16 es la mitad decodificadora del codec de audio HeartCodec-oss, convertida a float16 y empaquetada en formato MLX para su ejecución nativa en Apple Silicon. Lo publica la organización mlx-community a partir del modelo original de HeartMuLa (MuLa Labs). Su función no es generar música por sí mismo, sino transformar los códigos RVQ que produce un modelo de lenguaje musical (HeartMuLa) en audio estéreo a 48 kHz, actuando como la etapa final de un pipeline de text-to-audio.

El modelo resuelve un problema muy concreto: renderizar audio de alta fidelidad en hardware de consumo Apple sin depender de PyTorch ni de CUDA. Para ello combina un DiT basado en LLaMA con flow-matching que convierte 8 × 8192 códigos RVQ a 12,5 Hz en latentes a 25 Hz, seguido del decodificador SQ-Codec con un sobremuestreo de 1920×. El resultado son ventanas de 29,76 segundos que se concatenan hasta la duración objetivo de la canción.

Con 1.573.056.372 parámetros y un repositorio de 3,1 GB, esta variante fp16 es la opción por defecto del stack mlx-heartmula-swift: ocupa la mitad que el codec fp32 y es 3,5 veces más rápida por ventana, con una diferencia de 23,6 dB respecto al fp32 (atribuible al redondeo del paso de cuantización del SQ-Codec) y sin cambios en las métricas de letra ni estética. Es relevante ahora porque permite ejecutar generación musical completa en un Mac de 24 GB de RAM a 3,0× tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching LLaMA-DiT (24 × 1536 + 6 × 3072) + decodificador SQ-Codec (sobremuestreo 1920×) |
| Parametros totales | 1.573.056.372 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 29,76 s; 8 × 8192 codigos RVQ a 12,5 Hz) |
| Tipos de cuantizacion | float16 (unico publicado en este repo); el ecosistema ofrece fp32 del codec y LM en 8-bit/bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (506 tensores, float16, weight_norm plegado, layouts conv de MLX) |

## Arquitectura y entrenamiento

El componente es un decodificador en dos etapas. La primera es un transformer DiT con backbone tipo LLaMA (24 capas de 1536 y 6 capas de 3072) entrenado con flow-matching, que parte de los códigos RVQ de HeartMuLa y genera latentes a 25 Hz mediante 10 pasos de Euler con classifier-free guidance de 1,25. La segunda es el decodificador SQ-Codec, que aplica un sobremuestreo de 1920× para llegar a 48 kHz estéreo. El modelo procesa ventanas de 29,76 segundos.

Esta variante MLX no ha sido reentrenada: cada tensor es el valor float32 del release original (con el weight_norm plegado en float32) casteado a float16, y los layouts de convolución se han adaptado a MLX. El codec fp32 del que deriva coincide con heartlib upstream a 115–118 dB de extremo a extremo. El autor advierte explícitamente de que no debe usarse bf16, porque degrada la calidad de audio del codec. No se dispone de información sobre el volumen de datos de entrenamiento original, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decodificación de códigos RVQ (8 × 8192 a 12,5 Hz) a audio estéreo PCM de 48 kHz.
- Renderizado de canciones completas mediante concatenación de ventanas de 29,76 s.
- Generación de audio condicionada por letra y etiquetas de estilo, heredada del pipeline HeartMuLa.
- Soporte de inglés y mandarín (este último con calidad notablemente inferior).
- Ejecución nativa en Apple Silicon mediante MLX y Swift (paquete MLXHeartMuLa).
- Compatibilidad con los dos repositorios de LM de HeartMuLa (8-bit y bf16).
- Determinismo práctico: con el codec fp16 la salida es idéntica byte a byte con TF32 activado o desactivado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un componente de audio, no un LLM de propósito general.

## Casos de uso

- Generación musical local en Mac: integrado con HeartMuLa-oss-3B-8bit, permite crear canciones de hasta 120–240 s en un Mac de 24 GB de RAM a 3,0× tiempo real, sin GPU dedicada ni servicios en la nube.
- Prototipado de pipelines text-to-audio: al ser el codec por defecto de mlx-heartmula-swift, sirve para validar extremo a extremo la cadena letra → códigos → audio antes de escalar a producción.
- Herramientas creativas de escritorio: aplicaciones Swift/macOS que necesiten renderizar audio musical a partir de letras y etiquetas de estilo con latencia interactiva.
- Investigación en codecs neuronales: su paridad medida con heartlib (115–118 dB en fp32) y su degradación controlada a fp16 (23,6 dB) lo hacen útil para estudiar el impacto del redondeo en codecs RVQ + SQ-Codec.
- Generación de bandas sonoras o demos en inglés: la tasa de error de letra (PER 0,125 con LM bf16, 0,132 con 8-bit) es mejor que la referencia PyTorch (0,165), adecuada para maquetas con letra inteligible.
- Evaluación comparativa de modelos musicales abiertos: el conjunto de 12 canciones (10 en inglés, 2 en mandarín) y las métricas CLAP/PER publicadas permiten reproducir comparaciones con otros modelos abiertos.
- Integración en servidores de inferencia MLX (MLXServeEngine): registro del paquete y preparación del pipeline musical dentro de un proceso que ya tiene otros modelos cargados, gracias a la insensibilidad a TF32.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PER de letra (LM bf16 + codec fp16) | 0,125 |
| PER de letra (LM 8-bit + codec fp16) | 0,132 |
| PER de letra (referencia PyTorch) | 0,165 |
| PER en mandarin (referencia PyTorch) | 0,457 (frente a 0,107 en ingles) |
| Distancia al codec fp32 sobre los mismos codigos | 23,6 dB |
| Paridad del codec fp32 con heartlib upstream | 115–118 dB extremo a extremo |
| Ranking CLAP de estilo propio (sobre 12) | ~4,5 (otros modelos abiertos: ~2) |
| Picos de salida del codec sin limitador | hasta 1,37 (escala completa) |

Rendimiento y memoria por configuracion (medido en M5 Max, cancion de 120 s y peor caso de 240 s):

| LM + codec | Memoria declarada (residente + pico) | Equipo | Velocidad |
|---|---|---|---|
| 8-bit + fp16 (por defecto) | 8,5 + 5,5 GB | Mac de 24 GB | 3,0× tiempo real |
| bf16 + fp16 | 11,5 + 6,0 GB | Mac de 32 GB | 2,5× |
| 8-bit + fp32 | 11,5 + 10,0 GB | Mac de 32 GB | 2,3× |
| bf16 + fp32 | 14,5 + 10,0 GB | Mac de 48 GB | 1,85× |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no ser aplicables a un codec de audio.

## Requisitos de hardware

- VRAM/RAM estimada: el codec fp16 ocupa 3,15 GB en disco; en ejecución, el pipeline completo consume 8,5 GB residentes + 5,5 GB de pico con LM 8-bit, y 11,5 + 6,0 GB con LM bf16.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). El autor reporta medidas en un M5 Max; no hay soporte CUDA documentado para este repo.
- Cabe en consumer: sí, en Mac con 24 GB de RAM unificada o más, aplicando la regla de admisión del engine de 0,7 × RAM.
- Opciones de despliegue: MLX con el paquete Swift MLXHeartMuLa (MLXServeEngine, MLXServeCore, MLXToolKit); el modelo original puede ejecutarse con heartlib/PyTorch.
- Latencia y throughput: 3,0× tiempo real con la configuración por defecto en M5 Max; 2,5× con LM bf16; 2,3× con codec fp32; 1,85× con bf16 + fp32.
- Nota: una variante de LM en 4-bit falló su puerta de calidad de letra (PER 0,220) y no se publicó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeartCodec-oss-fp16 (este) | 1.573 M | Ventanas de 29,76 s, 48 kHz estereo | Apache-2.0 | MLX, safetensors | Codec por defecto del stack; 3,0× tiempo real en M5 Max |
| HeartCodec-oss fp32 (upstream) | 1.573 M | Ventanas de 29,76 s, 48 kHz estereo | Apache-2.0 | PyTorch (heartlib) | Referencia de calidad; 2,3× tiempo real con LM 8-bit |
| Otros modelos musicales abiertos medidos por el autor | no disponible | no disponible | no disponible | no disponible | Ranking CLAP de estilo propio ~2 frente a ~4,5 de este codec |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas concretas de la misma categoría (por ejemplo, codecs de audio de otros fabricantes); los únicos comparables documentados son las variantes del propio HeartCodec.

## Limitaciones y advertencias

- Las etiquetas de estilo apenas influyen: el ranking CLAP de estilo propio es ~4,5 sobre 12, y subir CFG a 3,0 no mejora el control.
- Deriva de género vocal: la mayoría de voces salen femeninas aunque las etiquetas pidan masculinas (1 de 6 prompts masculinos obtuvo voz masculina).
- Mandarín débil e irregular: PER 0,457 en la referencia PyTorch frente a 0,107 en inglés; con solo dos canciones en mandarín en el conjunto de evaluación no puede darse por corregido.
- Con LM 8-bit, el modelo llega al límite de duración el doble de veces que con bf16 (10 de 24 canciones frente a 5 de 24 con tope de 120 s); una canción de 24 repitió una sola línea hasta el tope.
- La salida cruda del codec puede superar la escala completa (picos de 1,37); el pipeline Swift aplica una ganancia única de limitador a −1 dBFS. Cualquier integración propia debe replicar esa etapa.
- No usar bf16 en el codec: el upstream confirma que degrada el audio.
- La licencia Apache-2.0 se sostiene sobre la declaración de la model card y el README de heartlib del 20-01-2026, ya que los repositorios del generador no incluyen fichero LICENSE propio; conviene revisar la cadena de atribución (NOTICE) antes de un uso comercial.
- No está respaldado por el equipo de HeartMuLa ni por MuLa Labs.
- Riesgo de alucinación en el sentido musical: letras mal pronunciadas o repetidas, y divergencia respecto a la duración solicitada.
- Este repositorio es solo la ruta de decodificación; no genera códigos por sí mismo, requiere un LM HeartMuLa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/HeartCodec-oss-fp16
- Modelo base: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Repositorio Swift: https://github.com/xocialize/mlx-heartmula-swift
- Mediciones detalladas: https://github.com/xocialize/mlx-heartmula-swift/blob/main/MEASUREMENTS.md
- Paper: arXiv 2601.10547
