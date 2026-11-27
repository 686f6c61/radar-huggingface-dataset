# audio-cpp/audio.cpp-gguf

## Resumen

audio.cpp-gguf es un repositorio de paquetes GGUF nativos del runtime audio.cpp, mantenido por el proyecto audio-cpp. No se trata de un unico modelo, sino de una coleccion de conversiones y cuantizaciones de decenas de modelos de audio (sintesis de voz, reconocimiento de habla, conversion de voz, separacion de fuentes, diarizacion de hablantes y generacion musical) empaquetados en un unico hub para su uso directo con el motor audio.cpp.

El objetivo del repositorio es ofrecer a los desarrolladores artefactos listos para inferencia sin necesidad de convertir pesos originales: cada subdirectorio corresponde a una familia de modelo soportada por audio.cpp (por ejemplo `ace_step`, `chatterbox`, `cosyvoice3`, `dettato`, `canary_asr`) y contiene los ficheros GGUF en las precisiones que el autor considera utiles (F32, BF16, F16, Q8, Q4, Q4_K, segun el caso). Esto reduce la friccion para desplegar pipelines de audio en local o en servidor.

El dato de parametros del hub (16.578.590) corresponde a un unico checkpoint de referencia y no representa el conjunto del repositorio, que ocupa aproximadamente 1,7 TB por acumular muchos modelos distintos. La licencia global figura como "other" porque cada paquete hereda la licencia del modelo original, que va desde MIT y Apache-2.0 hasta licencias de investigacion no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Variable por paquete: transformers, conformer, codec-vocoder, diffusion y modelos hibridos segun el modelo de origen |
| Parametros totales | 16.578.590 (checkpoint de referencia del hub); el repositorio agrega decenas de modelos de distinto tamano |
| Parametros activos | no disponible (no es un modelo MoE unico) |
| Longitud de contexto | no disponible (depende del modelo de audio subyacente) |
| Tipos de cuantizacion | F32, BF16, F16, Q8, Q4, Q4_0, Q4_K (segun paquete) |
| Idiomas soportados | no disponible |
| Licencia | other (cada paquete hereda la licencia del modelo original: MIT, Apache-2.0, BSD-3-Clause, CC-BY-4.0, CC-BY-SA-4.0, CC-BY-NC-4.0 y licencias de investigacion no comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: actua como capa de conversion y empaquetado. Cada subdirectorio contiene pesos GGUF derivados de un modelo de audio publicado por terceros (ACE-Step, Qwen, NVIDIA, Microsoft, IBM, Mistral, Stability AI, entre otros) y adaptados al formato interno de audio.cpp. La arquitectura subyacente varia: hay transformers encoder-decoder para ASR, modelos de codec neuronal para TTS, conformers para clasificacion de audio, y modelos de difusion para generacion musical y de efectos de sonido.

No se documentan en la model card detalles sobre volumen de datos de entrenamiento, composicion del dataset ni procesos de RLHF/DPO, ya que esa informacion pertenece a cada modelo de origen. La innovacion tecnica del repositorio es la conversion nativa a GGUF con soporte de layouts especificos de audio.cpp, carga directa de ficheros, embebido de sidecars y verificacion automatica de metricas; el autor advierte que la calidad percibida por oyentes humanos puede diferir de las metricas automaticas y recomienda validar el paquete, backend y ruta concretos antes de usarlo en produccion.

## Capacidades

- Sintesis de voz (text-to-speech) con multiples paquetes: Chatterbox, Chatterbox-Turbo, CosyVoice3, DotTTS, FireRedTTS3, Confucius4-TTS, Breeze-TTS-2, entre otros.
- Reconocimiento automatico de habla (ASR): Canary-180M-Flash, Cohere-Transcribe, Citrinet, CrisperWhisper2.0, Dettato, VibeVoice-ASR.
- Conversion de voz (voice conversion) y clonacion de voz en paquetes como M5-TTS-VoiceClone.
- Generacion de audio y musica: ACE-Step1.5, Stable Audio 3, HeartMuLa.
- Efectos de sonido: MOSS-SoundEffect-v2.0 y ControlFoley.
- Separacion de fuentes y restauracion: BS-RoFormer, MossFormer2 (SR, SE, SS).
- Diarizacion de hablantes: nvidia/diar_sortformer_4spk-v1.
- Deteccion de actividad de voz (VAD): FireRedVAD.
- Superresolucion de audio: AudioSR.
- Clasificacion de eventos sonoros: AST-AudioSet, CED.
- Soporte de tool calling / function calling: no disponible (no es un LLM de proposito general).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible de forma agregada; depende del paquete (algunos modelos como GigaAM o Qwen3-ASR son multilingues por diseno).

## Casos de uso

- Sintesis de voz para asistentes y narracion: usar los paquetes de TTS (Chatterbox, CosyVoice3, DotTTS) para generar locuciones en castellano o en otros idiomas soportados por el modelo de origen, con cuantizacion Q8 para equilibrar calidad y memoria.
- Transcripcion de reuniones y subtitulado: desplegar Canary-180M-Flash o Cohere-Transcribe en formato Q8 sobre CPU/GPU para generar transcripciones con marcas de tiempo, integrables en pipelines de postprocesado.
- Atencion al cliente con voz clonada: combinar un paquete de voice conversion con un TTS para mantener una identidad de voz consistente en respuestas automatizadas.
- Produccion musical asistida: emplear ACE-Step1.5 en BF16 o Q8 para generar borradores musicales y separar pistas con BS-RoFormer antes de la mezcla final.
- Postproduccion de audio para video: usar MossFormer2-SE y AudioSR para limpiar ruido y aumentar la resolucion de pistas de dialogo extraidas de grabaciones de campo.
- Analisis de llamadas y compliance: aplicar diarizacion con diar_sortformer_4spk-v1 junto a un ASR para atribuir intervenciones a cada hablante en grabaciones de contact center.
- Prototipado de interfaces de voz en local: cargar paquetes Q4 o Q8 con llama.cpp-style runtime de audio.cpp en un portatil con GPU consumer para iterar rapido sin depender de APIs en la nube.
- Generacion de efectos de sonido para videojuegos: usar MOSS-SoundEffect-v2.0 o ControlFoley para crear SFX a partir de descripciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los paquetes convertidos y cuantizados se comprueban con metricas automaticas, pero no se aportan cifras concretas de MMLU, WER, MOS ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada: depende del paquete. Los modelos pequenos (Canary-180M, Citrinet, VAD, CED-Tiny) caben en menos de 2 GB en Q8. Los modelos medianos (Chatterbox, CosyVoice3, Dettato) requieren entre 2 y 6 GB en Q8. Los modelos grandes (VibeVoice-ASR-Streaming-7B, personaplex-7b, Voxtral-Mini-4B) requieren entre 8 y 20 GB segun cuantizacion.
- GPU recomendadas: NVIDIA RTX 3060/4060 para paquetes pequenos y medianos; RTX 4090 o A100/H100 para los paquetes de 4-7B en BF16 o F16.
- Cabe en GPU consumer: si, la mayoria de paquetes pequenos y medianos en Q8 o Q4 caben en GPUs de 8-12 GB.
- Opciones de despliegue: runtime audio.cpp (requerido, ya que los ficheros son GGUF nativos de ese motor). No se documenta compatibilidad con llama.cpp, vLLM, TGI ni Ollama para estos paquetes de audio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audio.cpp-gguf | Variable por paquete (16,5M en checkpoint de referencia) | no disponible | no disponible | other (heredada por paquete) | Hugging Face, runtime audio.cpp |
| Modelos originales (Qwen3-TTS, Chatterbox, CosyVoice3, etc.) | Segun cada modelo (0,6B a 7B) | Segun cada modelo | Benchmarks publicados por cada autor original | MIT, Apache-2.0 u otras | Hugging Face, frameworks propios |
| Repositorios GGUF genericos para LLM (p. ej. conversiones comunitarias) | Variable | Variable | No aplica a audio | Variable | Hugging Face, llama.cpp |

La ventaja del repositorio es la disponibilidad de paquetes ya convertidos y verificados para audio.cpp; la desventaja es que no aporta benchmarks propios y la calidad final depende del modelo de origen y de la cuantizacion elegida.

## Limitaciones y advertencias

- No es un modelo unico: la ficha agrega decenas de paquetes con arquitecturas, tamanos y licencias distintas. Es imprescindible revisar la licencia del subdirectorio concreto antes de usarlo.
- Licencias heterogeneas: algunos paquetes son MIT o Apache-2.0, pero otros (Breeze-TTS-2, CrisperWhisper2.0, ControlFoley) tienen licencias no comerciales o de investigacion que restringen el uso en produccion.
- El autor advierte que las metricas automaticas no garantizan calidad percibida: hay que validar el paquete, backend y ruta concretos con oyentes humanos.
- Riesgo de alucinacion en ASR y TTS: los modelos de audio pueden transcribir contenido inexistente en audio ruidoso o generar prosodia incorrecta en TTS.
- Sesgos de idioma y acento: no se documenta cobertura idiomatica agregada; algunos paquetes estan especializados en un solo idioma (p. ej. GigaAM para ruso, Semantic-DACVAE-Japanese para japones).
- Compatibilidad limitada al runtime audio.cpp: no se garantiza funcionamiento en otros motores GGUF.
- Tamano del repositorio: 1,7 TB en total, lo que exige descargar solo los subdirectorios necesarios en lugar del repo completo.
- Sin garantias de mantenimiento: la model card no detalla politica de actualizaciones ni soporte a largo plazo de cada paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/audio-cpp/audio.cpp-gguf
- Runtime audio.cpp (GitHub): https://github.com/0xShug0/audio.cpp
- Guia GGUF de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/gguf.md
- Referencia de licencias de modelos de audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/model_licenses.md
- Modelo base principal citado: https://huggingface.co/ACE-Step/Ace-Step1.5
- Licencia de Breeze-TTS-2: https://huggingface.co/BreezeBlue/Breeze-TTS-2/blob/main/LICENSE
- Licencia de DramaBox: https://huggingface.co/ResembleAI/Dramabox/blob/main/LICENSE
