# Aratako/Irodori-TTS-v4-Small

## Resumen

Irodori-TTS-v4-Small es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por Aratako, basado en un transformador de difusión de flujo rectificado (Rectified Flow Diffusion Transformer, RF-DiT). Combina tres vías de condicionamiento —texto de entrada, voz de referencia y texto descriptivo (caption)— en un único modelo unificado, lo que permite clonación de voz zero-shot, diseño de voz puramente textual y control de estilo emocional o de entonación mediante descripciones. El modelo se publica bajo licencia MIT y está pensado para generar audio de alta calidad a 48 kHz.

La arquitectura, de aproximadamente 766 millones de parámetros, incorpora un codificador de texto compartido basado en ModernBERT-ja afinado, un codificador de latentes de referencia que admite hasta 120 segundos de audio combinado, y un bloque de difusión con atención conjunta. Una de sus innovaciones es el control de estilo mediante emojis insertados en el texto, además de la integración de marcas de agua invisibles con SilentCipher. El autor recomienda la versión v4.1-Small, una actualización menor con mejor predictor de duración, aunque esta ficha se centra en la v4-Small.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rectified Flow Diffusion Transformer (RF-DiT) sobre latentes continuos DACVAE |
| Parametros totales | 766.052.385 (aproximadamente 766M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (referencia de audio hasta 120 segundos combinados) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se compone de cinco modulos principales: un codificador compartido de texto y caption (backbone ModernBERT-ja afinado, con proyectores separados para cada via), un codificador de latentes de referencia que procesa audio de referencia parcheado (hasta 120 segundos combinados), un transformador de difusion con bloques DiT de atencion conjunta (Low-Rank AdaLN, half-RoPE y MLPs SwiGLU) y un predictor de duracion basado en bloques SwiGLU apilados. El audio se representa como secuencias latentes continuas de 32 dimensiones mediante el codec Semantic-DACVAE-Japanese-32dim, lo que permite reconstruccion de forma de onda a 48 kHz.

El entrenamiento sigue el paradigma de flow matching sobre latentes continuos, similar a Echo-TTS. La v4 introduce tres mejoras principales frente a la v3: el reemplazo de los codificadores de texto y caption entrenados desde cero por un ModernBERT-ja preentrenado y afinado, lo que mejora la lectura de kanji dificiles; un mejor entendimiento de captions descriptivos gracias al codificador compartido con proyectores adaptativos; y el soporte de referencias largas mediante parcheado de hablante y concatenacion aleatoria durante el entrenamiento. No se detalla el tamano del dataset ni el numero de tokens de entrenamiento en la informacion disponible.

## Capacidades

- Sintesis de voz en japones a 48 kHz con calidad alta.
- Clonacion de voz zero-shot a partir de una o varias referencias de audio (hasta 120 segundos combinados).
- Diseno de voz puramente textual: generar voces y estilos mediante captions descriptivos sin audio de referencia.
- Control de estilo y emocion mediante captions (por ejemplo, "voz grave de hombre adulto, tono formal" o "mujer joven hablando rapido y nerviosa").
- Control de estilo y efectos sonoros mediante emojis insertados en el texto (risa, tos, suspiros, etc.).
- Condicionamiento multi-modal simultaneo: texto + voz de referencia + caption.
- Marcado de agua invisible integrado (SilentCipher) para trazabilidad del audio generado.

## Casos de uso

- Generacion de audiolibros y narraciones: el modelo puede producir voces variadas y expresivas a partir de captions descriptivos, adaptando el tono y la emocion al contenido narrativo.
- Doblaje y localizacion de contenido: clonando la voz de un actor o actriz mediante una referencia corta y controlando la interpretacion con captions, se puede generar dialogo doblado con coherencia vocal.
- Asistentes de voz personalizados: se puede disenar una voz especifica para un asistente virtual (por ejemplo, "voz femenina joven, amable y clara") sin necesidad de grabar horas de audio.
- Creacion de contenido para video y podcast: generacion de locuciones con estilos variados (informativo, entusiasta, calmado) a partir de texto y captions, acelerando el flujo de produccion.
- Sistemas de respuesta de voz interactiva (IVR): voces sinteticas con control emocional para atencion al cliente, donde el tono puede ajustarse segun el contexto de la llamada.
- Investigacion en sintesis de voz y control prosodico: el modelo permite experimentar con condicionamiento por caption y emojis, sirviendo como base para estudios sobre expresividad y control fino en TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 3,1 GB, lo que sugiere pesos en precision fp32 (aproximadamente 3 GB). Para inferencia en fp16 se necesitarian unos 1,6 GB de VRAM solo para los pesos, mas overhead de activaciones y latentes; en la practica se recomienda al menos 4-6 GB de VRAM para un funcionamiento comodo.
- GPU recomendadas: no hay especificaciones oficiales. Por el tamano del modelo, una GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060, etc.) deberia ser suficiente para inferencia en fp16. Para entrenamiento o ajuste fino se requeriria una GPU con mayor memoria (A100, H100).
- Despliegue: el repositorio oficial de GitHub incluye codigo de inferencia y entrenamiento. Existe un servidor de inferencia compatible con la API de OpenAI llamado Irodori-TTS-Server. No se menciona soporte explicito para vLLM, llama.cpp u Ollama, al ser un modelo de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos TTS japoneses (por ejemplo, Style-Bert-VITS2, VoiceCraft o CosyVoice) en terminos de benchmarks y rendimiento. La informacion disponible no incluye metricas comparativas.

## Limitaciones y advertencias

- Modelo exclusivamente en japones; no soporta otros idiomas.
- No se han publicado resultados de evaluacion objetiva (MOS, SIM, etc.) en la informacion disponible.
- La generacion de voz clonada puede presentar sesgos derivados de los datos de entrenamiento, aunque no se detallan.
- Riesgo de alucinacion prosodica o de pronunciacion incorrecta en kanji poco frecuentes, a pesar de la mejora con ModernBERT-ja.
- La integracion de marcas de agua (SilentCipher) es una caracteristica de seguridad, pero podria afectar a la calidad percibida en algunos casos.
- El autor recomienda usar la version v4.1-Small en lugar de esta, por un mejor predictor de duracion.
- Licencia MIT permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las leyes de voz y consentimiento al clonar voces de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aratako/Irodori-TTS-v4-Small
- Version recomendada v4.1-Small: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Repositorio de codigo (GitHub): https://github.com/Aratako/Irodori-TTS
- Codice Semantic-DACVAE-Japanese-32dim: https://huggingface.co/Aratako/Semantic-DACVAE-Japanese-32dim
- Codificador ModernBERT-ja: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Paper (referencia arxiv): arxiv:2606.25369
- Guia de instalacion local (video): https://www.youtube.com/watch?v=9HUHKamHYhI
