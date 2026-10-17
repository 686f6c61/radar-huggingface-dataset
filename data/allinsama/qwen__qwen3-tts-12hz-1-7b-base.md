# Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-Base

# Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es el modelo base de la familia Qwen3-TTS, un sistema de síntesis de voz (text-to-speech) end-to-end desarrollado por el equipo Qwen de Alibaba. Esta ficha describe la réplica publicada en HuggingFace por el usuario Allinsama bajo el identificador `Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-Base`, que reproduce los pesos oficiales de `Qwen/Qwen3-TTS-12Hz-1.7B-Base` con licencia Apache 2.0 y un total de 1.928.677.440 parámetros (aproximadamente 1,93 mil millones).

El modelo resuelve la generación de audio a partir de texto mediante una arquitectura de LM discreto multi-codebook, apoyada en el tokenizador propio Qwen3-TTS-Tokenizer-12Hz para comprimir y reconstruir la señal de voz. Frente a los esquemas clásicos LM+DiT, elimina la cascada de dos etapas y con ello parte de los cuellos de botella de información. Cubre diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y soporta generación en streaming con una latencia declarada de 97 ms hasta el primer paquete de audio.

Su relevancia práctica está en que la variante Base permite clonación de voz rápida a partir de tres segundos de audio de referencia y sirve como punto de partida para fine-tuning de otras variantes de la familia (VoiceDesign, CustomVoice), además de ser la base de la versión de 0,6B. La licencia Apache 2.0 facilita su incorporación en producto comercial, si bien el repositorio espejo no aporta descargas ni validación de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LM discreto multi-codebook end-to-end para audio, con tokenizador Qwen3-TTS-Tokenizer-12Hz y reconstrucción mediante decodificador ligero no-DiT |
| Parámetros totales | 1.928.677.440 (≈1,93 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors (4,5 GB, coherente con pesos en bf16). No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | 10: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, además de perfiles de voz dialectales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un LM discreto multi-codebook que modela directamente tokens de audio en lugar de predecir formas de onda o espectrogramas. El texto y el audio comparten un único grafo end-to-end, de modo que no existe una etapa intermedia de LM textual seguida de un DiT de difusión: la card del autor sostiene que este diseño evita los cuellos de botella de información y los errores en cascada del esquema LM+DiT. La compresión acústica y el modelado semántico de alta dimensión corren a cargo del tokenizador Qwen3-TTS-Tokenizer-12Hz, que opera a 12 Hz y preserva información paralingüística y rasgos del entorno acústico; la reconstrucción final usa un decodificador ligero no-DiT.

Sobre la generación, incorpora una arquitectura híbrida de streaming denominada Dual-Track, que permite al mismo modelo operar en modo streaming y no streaming: según la información del autor, puede emitir el primer paquete de audio inmediatamente después de introducir un solo carácter, con 97 ms de latencia extremo a extremo. La variante Base está orientada a clonación de voz rápida desde una referencia de tres segundos y a servir de base para fine-tuning. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; tampoco se detalla la ventana de contexto del LM.

## Capacidades

- Síntesis de voz (TTS) end-to-end en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano, con perfiles de voz dialectales adicionales.
- Clonación de voz rápida a partir de una muestra de audio de referencia de tres segundos.
- Generación en streaming y no streaming con el mismo conjunto de pesos (arquitectura Dual-Track), lo que habilita audio incremental desde los primeros caracteres.
- Reconstrucción de alta fidelidad mediante el tokenizador de 12 Hz, con conservación de información paralingüística (timbre, prosodia) y del entorno acústico.
- Comprensión contextual del texto: el modelo adapta tono, ritmo y expresión emocional al contenido, y la card destaca mayor robustez frente a entradas de texto ruidosas.
- Punto de partida para fine-tuning de modelos de la familia (así lo declara explícitamente el autor para la variante Base).
- Integración con el paquete `qwen-tts` y con vLLM para carga y despliegue.
- Control por instrucciones en lenguaje natural: no disponible en la variante Base (esa capacidad la aportan las variantes VoiceDesign y CustomVoice, según la tabla del autor).
- Soporte de tool calling, función de agente, visión, audio de entrada y modo de razonamiento explícito: no disponible o no documentado para este modelo.

## Casos de uso

- Clonación de voz para locución corporativa: con tres segundos de audio de un locutor autorizado se puede generar contenido narrado con esa identidad vocal, útil para campañas, notas de prensa en audio o formación interna sin depender de sesiones de estudio.
- Doblaje y localización multilingüe: al cubrir diez idiomas y preservar rasgos paralingüísticos, encaja en pipelines de doblaje de vídeo o audiolibros donde se necesita la misma voz en varios idiomas manteniendo prosodia y emoción.
- Asistentes de voz en tiempo real: los 97 ms hasta el primer paquete y la emisión tras un solo carácter permiten construir interfaces conversacionales con respuesta hablada casi inmediata, por ejemplo agentes telefónicos o asistentes embebidos.
- Audiolibros y contenido largo: la generación no streaming permite sintetizar capítulos completos con calidad estable, y la robustez frente a texto ruidoso reduce fallos en corpus con abreviaturas, cifras o puntuación irregular.
- Base para fine-tuning de dominio: al ser el modelo base de la familia, se puede ajustar con datos propios para vocabulario técnico, nombres de marca o registros concretos (legal, médico, atención al cliente) partiendo de un modelo de 1,93B parámetros.
- Accesibilidad y lectura asistida: integración en lectores de pantalla y aplicaciones de lectura para personas con discapacidad visual, con salida de baja latencia en navegación por menús y listas.
- Generación de datos sintéticos de audio: producir corpus de voz etiquetados para entrenar o evaluar sistemas ASR, diarización o detección de emociones, con control sobre idioma y hablante de referencia.
- Sistemas de anuncios e IVR: mensajes dinámicos en centralitas telefónicas donde el texto se construye en tiempo de ejecución (importes, fechas, nombres) y se requiere audio inmediato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia el informe técnico arXiv:2601.15621, pero no incluye tablas de MMLU, WER, CMOS ni métricas de similitud de hablante en el material proporcionado, por lo que no se presentan cifras. El único dato de rendimiento declarado es la latencia de 97 ms extremo a extremo en modo streaming.

## Requisitos de hardware

- VRAM estimada para inferencia: cálculo aritmético a partir del número de parámetros, no dato del autor. En bf16/fp16, 1,93B × 2 bytes ≈ 3,9 GB de pesos, por lo que conviene reservar 6-8 GB de VRAM incluyendo activaciones y el tokenizador.
- Cuantización: no se publican variantes cuantizadas en este repositorio. Si se generan, int8 rondaría 1,9 GB y int4 alrededor de 1 GB de pesos, más el coste del decodificador y del tokenizador.
- GPU consumer: el modelo cabe en tarjetas de 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090). En GPUs de 6 GB requeriría cuantización, no disponible oficialmente.
- GPU de datacenter: A100, H100 o L40S son adecuadas para servir varias peticiones concurrentes con vLLM; no hay cifras de throughput publicadas.
- Despliegue: el autor documenta el paquete `qwen-tts` y vLLM como vías de carga, con descarga automática de pesos por nombre de modelo o manual vía `huggingface-cli` / `modelscope`. No se documentan soporte en llama.cpp, Ollama ni TGI para este formato multi-codebook.
- Latencia: 97 ms hasta el primer paquete en streaming según la model card. Throughput (caracteres o segundos de audio por segundo) no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Control por instrucciones | Clonación de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (esta ficha) | 1,93B | 10 | Sí | No | Sí, con 3 s de referencia | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | No disponible en la información | 10 | Sí | Sí | No documentado | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | No disponible en la información | 10 | Sí | Sí (diseño de voz por descripción) | No documentado | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | No disponible en la información (≈0,6B por nombre) | 10 | Sí | No | Sí, con 3 s de referencia | Apache 2.0 |

Frente a alternativas externas de TTS open source (XTTS-v2, CosyVoice 2, Fish Speech, Kokoro), no se dispone en la información proporcionada de parámetros, contexto ni métricas comparables, por lo que la comparación cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Riesgo de uso indebido de clonación de voz: la capacidad de replicar un timbre con tres segundos de audio exige consentimiento explícito del hablante y mecanismos de verificación; en la UE encaja en las obligaciones de transparencia del Reglamento de IA sobre contenido sintético.
- El repositorio analizado es una réplica publicada por un tercero (`Allinsama`) con 0 descargas y 0 likes; conviene usar los pesos oficiales de `Qwen/Qwen3-TTS-12Hz-1.7B-Base` para producción, ya que no hay validación comunitaria de esta copia.
- Ausencia total de benchmarks publicados en la información disponible: no hay WER, MOS ni métricas de similitud de hablante que permitan estimar la calidad real frente a alternativas.
- Longitud de contexto del LM no documentada: no se puede planificar la síntesis de textos largos sin troceado previo ni conocer la degradación en entradas extensas.
- Sin control por instrucciones en la variante Base: el ajuste de emoción, timbre o prosodia por lenguaje natural requiere las variantes CustomVoice o VoiceDesign, o bien depender del audio de referencia.
- En TTS, el equivalente a la alucinación es la invención o alteración de contenido: omisión de palabras, cambio de cifras o nombres, y artefactos prosódicos, especialmente en texto ruidoso o con terminología fuera de dominio.
- Sesgos no evaluados: la información disponible no documenta análisis de sesgo por variedad dialectal, género o edad en las voces generadas.
- Idiomas: aunque se listan diez, no se aportan métricas por idioma; el rendimiento en español puede diferir del de chino o inglés, idiomas dominantes en el entrenamiento habitual de la familia Qwen.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no exime del cumplimiento de normativa de protección de datos ni de derechos de imagen y voz.
- Formatos de despliegue limitados: no hay GGUF, Ollama ni TGI documentados, lo que restringe escenarios de inferencia en CPU o en entornos con herramientas estándar de cuantización.

## Enlaces

- Repositorio analizado (réplica): https://huggingface.co/Allinsama/Qwen__Qwen3-TTS-12Hz-1.7B-Base
- Repositorio oficial del modelo: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tokenizador oficial: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Variante con control de estilo: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Variante de diseño de voz: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Informe técnico citado en la model card: https://arxiv.org/abs/2601.15621
- Repositorio de documentación del paquete de inferencia: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
