# mlx-community/HeartCodec-oss-fp32

## Resumen

HeartCodec-oss-fp32 es la mitad decodificadora del códec de audio HeartCodec-oss, publicada en precisión float32 y empaquetada para MLX por la organización mlx-community. Desarrollado originalmente por el equipo HeartMuLa (MuLa Labs), el modelo convierte los códigos RVQ de 8 × 8192 a 12,5 Hz que produce el generador musical HeartMuLa en audio estéreo a 48 kHz. Esta versión concreta es un port a MLX pensado para la librería Swift mlx-heartmula-swift, no un modelo entrenado desde cero: los pesos son idénticos a los del release original en float32, con el weight_norm plegado y los layouts de convolución adaptados a MLX.

La arquitectura combina dos etapas: un LLaMA-DiT con flow-matching (24 capas de 1536 dimensiones más 6 capas de 3072, 10 pasos de Euler, CFG 1,25) que genera latentes a 25 Hz en ventanas de 29,76 segundos, y un decodificador SQ-Codec con sobremuestreo de 1920×. El modelo suma 1.573.056.372 parámetros y ocupa 6,29 GB en safetensors.

Su relevancia es doble: por un lado demuestra que el pipeline completo de HeartMuLa puede ejecutarse en Apple Silicon con MLX; por otro, documenta con detalle inusual las limitaciones del códec (deriva de género vocal, debilidad en mandarín, sensibilidad a TF32) y las condiciones exactas de paridad numérica con la implementación de referencia en PyTorch. Está publicado bajo Apache-2.0 y su uso principal es la generación de música a partir de texto y letras en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-DiT con flow-matching (24 × 1536 + 6 × 3072) + decodificador SQ-Codec con sobremuestreo 1920× |
| Parametros totales | 1.573.056.372 (506 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de decodificación de 29,76 s a 25 Hz de latentes) |
| Tipos de cuantizacion | float32 (esta versión); el repo hermano ofrece fp16; el LM asociado admite 8-bit y bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32, 2 shards + índice), config.json con sección `mlx_heartmula` |

## Arquitectura y entrenamiento

El códec se compone de un transformador DiT con flow-matching que opera sobre códigos RVQ (8 libros de 8192 entradas a 12,5 Hz) y produce latentes a 25 Hz en ventanas de 29,76 segundos. La generación de latentes usa 10 pasos de Euler con classifier-free guidance de 1,25. Esos latentes pasan después por el decodificador SQ-Codec, que aplica un sobremuestreo de 1920× para llegar a estéreo a 48 kHz. El paso `round(9x)/9` del SQ-Codec es el punto crítico de precisión: amplifica cualquier deriva numérica, de ahí que el modelo exija TF32 desactivado en todo el proceso.

No hay información disponible sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Lo que sí está documentado es la paridad numérica: cada tensor es bit-idéntico al valor float32 del release original, con el weight_norm plegado tal como lo calcula PyTorch, y los layouts de convolución de MLX coinciden con PyTorch dentro de 3e-6. La decodificación en Swift alcanza 117,8 dB y 115,0 dB de paridad end-to-end frente a heartlib sobre PyTorch-MPS con códigos fijos y ruido, sin ningún flip en la rejilla de redondeo cuando TF32 está desactivado.

## Capacidades

- Decodificación de códigos RVQ de HeartMuLa a audio estéreo a 48 kHz.
- Generación musical condicionada por letras y etiquetas de estilo a través del LM HeartMuLa asociado.
- Seguimiento de letras en inglés con una tasa de error (Whisper PER) de 0,125 con el LM bf16 y 0,132 con el LM de 8 bits.
- Soporte de letras en mandarín, aunque con calidad notablemente inferior (ver limitaciones).
- Integración con el motor MLXServeEngine y el paquete Swift MLXHeartMuLa.
- No dispone de tool calling, function calling ni capacidades de agente: es un componente de audio, no un modelo de lenguaje conversacional.
- No soporta visión ni audio de entrada; su única entrada son códigos discretos.

## Casos de uso

- Generación musical local en Mac: el par LM + códec fp32 con LM bf16 cabe en un Mac de 48 GB y renderiza a 1,85× tiempo real en un M5 Max, lo que permite crear canciones de 120 segundos en unos 65 segundos de cómputo.
- Producción musical asistida por letras: el modelo sigue las letras en inglés con un PER de 0,125, adecuado para demos y borradores donde la inteligibilidad de la letra es prioritaria.
- Investigación en códecs neuronales: la paridad documentada a 115–118 dB con la referencia PyTorch lo convierte en un banco de pruebas fiable para comparar implementaciones de decodificación en MLX frente a PyTorch.
- Prototipado de pipelines text-to-audio en Swift: al integrarse con MLXHeartMuLa y MLXServeEngine, sirve para validar aplicaciones macOS/iOS que necesiten síntesis musical sin salir del ecosistema Apple.
- Evaluación de precisión numérica: el requisito de desactivar TF32 y el fallo controlado del paquete cuando TF32 está activo lo hacen útil como caso de estudio de sensibilidad numérica en aceleradores neuronales de Apple.
- Generación de bandas sonoras para contenido en inglés: con 12,5 Hz de tasa de códigos y ventanas de 29,76 s, encaja en la creación de fragmentos musicales de hasta 240 segundos para vídeo o podcasts.
- Benchmarking de modelos musicales abiertos: las métricas publicadas (CLAP, PER, deriva de género) permiten usarlo como referencia en evaluaciones comparativas de generación musical.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Paridad end-to-end con heartlib (códigos fijos) | 117,8 dB |
| Paridad end-to-end con heartlib (ruido) | 115,0 dB |
| Desviación de layouts de convolución MLX vs PyTorch | < 3e-6 |
| Flips en la rejilla de redondeo (TF32 off) | 0 |
| PER de letras en inglés (LM bf16) | 0,125 |
| PER de letras en inglés (LM 8-bit) | 0,132 |
| PER de letras en inglés (referencia PyTorch) | 0,165 |
| PER de letras en mandarín (referencia PyTorch) | 0,457 |
| Ranking CLAP de estilo propio (sobre 12) | ~4,5 |
| Canciones que alcanzan el límite de duración (LM 8-bit) | 10 de 24 a 120 s |
| Canciones que alcanzan el límite de duración (LM bf16) | 5 de 24 a 120 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Memoria declarada (residente + pico de working set) según combinación de LM y códec, medida con MLXEngine en una canción de 120 s y un peor caso de 240 s:
  - LM 8-bit + códec fp16 (por defecto): 8,5 + 5,5 GB, cabe en Mac de 24 GB, 3,0× tiempo real en M5 Max.
  - LM bf16 + códec fp16: 11,5 + 6,0 GB, cabe en Mac de 32 GB, 2,5× tiempo real.
  - LM 8-bit + códec fp32: 11,5 + 10,0 GB, cabe en Mac de 32 GB, 2,3× tiempo real.
  - LM bf16 + códec fp32: 14,5 + 10,0 GB, cabe en Mac de 48 GB, 1,85× tiempo real.
- La regla de admisión del motor es 0,7 × RAM del sistema.
- Esta versión fp32 consume el doble de memoria y 3,5× el tiempo por ventana que el códec fp16 por defecto.
- GPU recomendadas: no aplica a CUDA; el modelo está empaquetado para MLX y Apple Silicon (medido en M5 Max).
- Despliegue: paquete Swift MLXHeartMuLa sobre MLXServeEngine; requiere llamar a `HeartMuLaPackage.configureProcess()` o exportar `MLX_ENABLE_TF32=0` antes del primer matmul del proceso.
- Un LM de 4 bits no se publicó porque falló la puerta de calidad de letras (PER 0,220).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HeartCodec-oss-fp32 (este) | 1.573.056.372 | ventanas de 29,76 s | Apache-2.0 | MLX, safetensors fp32 | Paridad 115–118 dB, 1,85× tiempo real con LM bf16 |
| HeartCodec-oss-fp16 | no disponible | ventanas de 29,76 s | Apache-2.0 | MLX, safetensors fp16 | Por defecto; mitad de memoria y 3,5× más rápido por ventana |
| HeartCodec-oss-20260123 (original) | no disponible | ventanas de 29,76 s | Apache-2.0 | PyTorch/heartlib | Referencia de paridad; PER inglés 0,165, PER mandarín 0,457 |
| Otros modelos musicales abiertos medidos | no disponible | no disponible | no disponible | no disponible | Ranking CLAP de estilo propio ~2 frente a ~4,5 de este códec |

## Limitaciones y advertencias

- Las etiquetas de estilo apenas dirigen el resultado: el ranking CLAP de estilo propio es de aproximadamente 4,5 sobre 12, y subir CFG a 3,0 no mejora la adherencia.
- Deriva de género vocal: la mayoría de voces salen femeninas independientemente de las etiquetas; solo 1 de 6 prompts de voz masculina produjo voz masculina.
- El mandarín es débil e irregular: la referencia PyTorch registró un PER de 0,457 (con un verso perdido) frente a 0,107 en inglés; las tomas en Swift bf16 mejoraron en las dos canciones mandarines medidas, muestra demasiado pequeña para concluir.
- El LM de 8 bits alcanza el límite de duración el doble de veces que bf16 (10 de 24 frente a 5 de 24 a 120 s), con repetición de estribillos y un caso de bucle de una sola línea hasta el tope.
- La salida cruda del códec puede superar la escala completa (picos de 1,37); el pipeline Swift aplica una ganancia de limitador única de −1 dBFS.
- Requiere TF32 desactivado en todo el proceso: con TF32 activo, la deriva de 1e-3 en los matmuls se convierte en 25–30 dB end-to-end por el paso `round(9x)/9` del SQ-Codec.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de artefactos y repeticiones en pasadas largas.
- La licencia Apache-2.0 se apoya en la declaración de la model card y en el README de heartlib del 20 de enero de 2026, ya que los repositorios del generador no incluyen fichero LICENSE; el repo incluye el texto Apache-2.0 y un NOTICE con la cadena de concesión.
- No está respaldado por el equipo HeartMuLa ni por MuLa Labs.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/HeartCodec-oss-fp32
- Modelo base: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Códec fp16 por defecto: https://huggingface.co/mlx-community/HeartCodec-oss-fp16
- LM asociado: https://huggingface.co/mlx-community/HeartMuLa-oss-3B-bf16
- Repositorio Swift: https://github.com/xocialize/mlx-heartmula-swift
- Mediciones detalladas: https://github.com/xocialize/mlx-heartmula-swift/blob/main/MEASUREMENTS.md
- Paper: arXiv 2601.10547
