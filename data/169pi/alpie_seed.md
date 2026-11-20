# 169Pi/Alpie_seed

## Resumen

Alpie Seed 9B es un modelo vision-lenguaje (VLM) de pesos abiertos desarrollado por 169Pi AI, construido sobre la arquitectura Qwen3.5-9B y post-entrenado para reforzar razonamiento, seguimiento de instrucciones, generacion de codigo y comprension visual. El modelo unifica entrada de texto, imagen y video en un unico transformer causal con encoder de vision, con una ventana de contexto nativa de 262K tokens y 9.409.813.744 parametros totales segun los pesos en safetensors.

La relevancia del modelo radica en tres factores: su tamano de 9B lo hace desplegable en hardware de consumo (existen builds GGUF de 2, 3 y 4 bits, ademas de FP16), su contexto de 262K permite procesar documentos largos y conversaciones extendidas, y su licencia Apache 2.0 elimina restricciones para uso comercial. Ademas, incorpora soporte multilingue para ingles y diez lenguas indicas (hindi, bengali, marathi, gujarati, telugu, malayo, punyabi, kannada, oriya y tamil), lo que lo diferencia de la mayoria de VLM de su categoria centrados solo en ingles y chino.

El modelo se distribuye en Hugging Face con pesos safetensors, variantes GGUF, y esta disponible en Ollama y Kaggle. La model card incluye un informe tecnico que documenta el linaje, la arquitectura, el pipeline de post-entrenamiento (SFT + GRPO), el diseno de recompensas, la cuantizacion, el perfilado de inferencia en dispositivos reales y la evaluacion de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; layout hibrido 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K en builds Ollama) |
| Tipos de cuantizacion | FP16, GGUF 2-bit, 3-bit y 4-bit |
| Idiomas soportados | en, hi, bn, mr, gu, te, ml, pa, kn, or, ta |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

Otros datos tecnicos: hidden dimension 4096, token embedding 248.320 (padded), 32 capas. Gated DeltaNet con 32 cabezas de atencion lineal para V y 16 para QK, dimension de cabeza 128. Gated Attention con 16 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones.

## Arquitectura y entrenamiento

Alpie Seed 9B parte de Qwen3.5-9B, un transformer causal que combina dos mecanismos de atencion en un layout hibrido: por cada bloque de cuatro capas, tres usan Gated DeltaNet (atencion lineal con estado recurrente) y una usa Gated Attention (atencion completa con RoPE). Esta mezcla reduce el coste computacional del contexto largo frente a un transformer de atencion completa pura, lo que hace viable la ventana de 262K tokens en un modelo de 9B. El encoder de vision permite procesar imagenes y video ademas de texto, con un unico modelo para las tres modalidades.

El post-entrenamiento se realizo en dos fases: supervised fine-tuning (SFT) seguido de GRPO (Group Relative Policy Optimization), una variante de RL sin modelo critico que optimiza recompensas por grupo. El informe tecnico documenta el diseno de recompensas y el pipeline completo. El modelo soporta modos de pensamiento (thinking) y no pensamiento, lo que permite alternar entre razonamiento extendido y respuestas directas. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo thinking y modo directo.
- Generacion y comprension de codigo, reforzada mediante SFT y GRPO.
- Comprension de imagenes (image-text-to-text) mediante encoder de vision integrado.
- Comprension de video, segun los tags del modelo (video-understanding).
- Capacidades multilingues en ingles y diez lenguas indicas: hindi, bengali, marathi, gujarati, telugu, malayo, punyabi, kannada, oriya y tamil.
- Contexto largo de 262K tokens para documentos extensos y conversaciones multi-turno.
- Despliegue en dispositivo: existe una demo de ejecucion offline en movil mediante PocketPal con el modelo cuantizado.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes: no confirmado en la informacion disponible.

## Casos de uso

- Atencion al cliente multilingue en la India: el modelo cubre ingles y diez lenguas indicas, por lo que puede gestionar conversaciones multi-turno con usuarios que alternan idiomas, con 262K tokens de contexto para conservar el historial completo de la sesion.
- Procesamiento de documentos largos con imagenes: informes, contratos o expedientes que combinan texto extenso y figuras pueden analizarse en una sola pasada gracias a la ventana de 262K tokens y al encoder de vision.
- Asistente de codigo en el IDE: el modelo genera y explica codigo, y su tamano de 9B permite ejecutarlo en una estacion de trabajo con GPU de consumo usando la variante GGUF de 4 bits.
- Analisis de video para moderacion o catalogacion: la capacidad de video-understanding permite describir, clasificar o extraer informacion de clips sin depender de servicios en la nube.
- Despliegue offline en movil o dispositivos sin conectividad: las builds GGUF de 2 a 4 bits y la demo en PocketPal permiten inferencia local en telefonia, util para campo, sanidad rural o entornos con requisitos de privacidad.
- Extraccion de informacion de facturas y formularios escaneados: la combinacion de vision y contexto largo permite procesar lotes de documentos y mantener coherencia entre ellos en una misma ventana.
- Traduccion y asistencia linguistica entre ingles y lenguas indicas: util para localizacion de contenido, soporte publico o educacion en regiones donde esas lenguas son mayoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el informe tecnico incluye resultados en tareas de razonamiento, codigo, multimodal y lenguas indicas, pero los valores numericos no se han proporcionado en los datos disponibles.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPU de 24 GB o superior (RTX 3090/4090, A100 40 GB, H100).
- GGUF 4-bit: alrededor de 5,6 GB (tag `alpie-seed:latest` en Ollama), cabe en GPU de consumo de 8 GB.
- GGUF 3-bit: alrededor de 4,6 GB (tag `alpie-seed:q3`), cabe en GPU de 6-8 GB.
- GGUF 2-bit: alrededor de 3,8 GB (tag `alpie-seed:q2`), viable en GPU de 4-6 GB y en CPU.
- Variante vision: alrededor de 6,6 GB (tag `alpie-seed:vision`), requiere GPU de 8 GB o superior para imagen y texto.
- Despliegue: Ollama (`ollama run 169pi/alpie-seed`), llama.cpp para GGUF, transformers para safetensors; vLLM y TGI no confirmados en la informacion disponible.
- Movil: demo verificada en PocketPal con el modelo cuantizado, ejecucion completamente offline.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alpie Seed 9B | 9,4B | 262K | texto, imagen, video | Apache 2.0 | HF, Ollama, Kaggle |
| Qwen3.5-9B (base) | 9B | no disponible | texto | no disponible | HF |
| Alternativas VLM de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con el modelo base Qwen3.5-9B, del que Alpie Seed hereda arquitectura y tamano pero al que anade encoder de vision, post-entrenamiento con SFT + GRPO y soporte multilingue indico. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo o con imagenes ambiguas.
- Sesgos: no se documentan en la informacion disponible evaluaciones de sesgo; el entrenamiento sobre datos de Qwen3.5-9B puede arrastrar sesgos del corpus original.
- Cobertura linguistica limitada: aunque soporta once idiomas, no incluye castellano ni otras lenguas europeas, lo que restringe su uso en Espana sin adaptacion.
- Contexto efectivo: aunque la ventana nativa es de 262K tokens, el rendimiento en los extremos del contexto no esta verificado en la informacion disponible.
- Tool calling y agentes: no confirmados; si se requiere integracion con funciones externas, debe validarse antes de produccion.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base Qwen3.5-9B.
- Despliegue en cuantizacion agresiva (2-bit): puede degradar la calidad de razonamiento y la fidelidad visual; se recomienda validar con evaluacion propia antes de usar en produccion.
- Informe tecnico: los resultados de benchmarks y seguridad estan en el PDF, no en la model card; deben consultarse antes de tomar decisiones de adopcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/169Pi/Alpie_seed
- GGUF en Hugging Face: https://huggingface.co/169Pi/Alpie_Seed_GGUF
- Ollama: https://ollama.com/169pi/alpie-seed
- Kaggle: https://www.kaggle.com/models/alpie/alpie-seed-9b
- Informe tecnico (PDF): https://huggingface.co/169Pi/Alpie_seed/resolve/main/Alpie%20Seed%20Final%20Technical%20Report.pdf
- Demo en movil (video): https://huggingface.co/169Pi/Alpie_seed/resolve/main/alpie_offline_mobile_demo_fast.mp4
- GitHub: https://github.com/169Pi
- X: https://x.com/169Pi_ai
- LinkedIn: https://www.linkedin.com/company/169pi
- YouTube: https://www.youtube.com/@169pi
- Instagram: https://www.instagram.com/169pi.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- PocketPal (app de inferencia movil): https://github.com/a-ghorbani/pocketpal-ai
