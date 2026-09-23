# pokusman/whisper-tiny-sk-ct2

## Resumen

whisper-tiny-sk-ct2 es un modelo de reconocimiento automatico del habla (ASR) especializado en eslovaco, publicado en HuggingFace por el usuario `pokusman`. Se construye sobre `openai/whisper-tiny`, el miembro mas pequeno de la familia Whisper, con unos 38 millones de parametros y arquitectura transformer encoder-decoder orientada a transcripcion de audio en segmentos de hasta 30 segundos.

La model card alojada en el repositorio corresponde al modelo `kinit/whisper-tiny-sk`, desarrollado por el equipo KInIT mediante ajuste fino completo (full fine-tuning) sobre un corpus eslovaco curado, con aumento de ruido aplicado en el 75 % de los lotes de entrenamiento. Segun esa documentacion, el ajuste reduce la tasa de error de palabras (WER) un 64 % en Common Voice 24.0 y un 80 % en el conjunto interno de evaluacion respecto al modelo base. El sufijo `ct2` del identificador sugiere una conversion a CTranslate2 para inferencia optimizada, aunque el repositorio no documenta ese proceso de forma explicita.

El interes practico del modelo reside en su tamano reducido: es adecuado para transcripcion en eslovaco en entornos con CPU o GPU de gama baja, o incluso en dispositivos embebidos, a cambio de una precision claramente inferior a la de los tamanos Large de Whisper. Esta catalogado en SLAIH, el catalogo eslovaco de recursos de PLN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper) |
| Parametros totales | ~38 M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento sin chunking (limitacion declarada por el autor); longitud de contexto textual del decodificador no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el sufijo `ct2` apunta a una posible conversion a CTranslate2 (que soporta int8, int8_float16 y float16), pero no se documenta |
| Idiomas soportados | Eslovaco (`sk`) exclusivamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (el ejemplo de uso emplea `use_safetensors=True`); tamano del repositorio ~0,2 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper en su variante tiny: un encoder que procesa espectrogramas de audio y un decoder autorregresivo que genera tokens de texto, con atencion cruzada entre ambos. El ajuste fue de parametros completos (no LoRA ni adaptadores) durante 2 epocas, con tasa de aprendizaje 5e-5, scheduler lineal con warmup, optimizador AdamW, tamano de lote efectivo 64 y precision fp16, usando `Seq2SeqTrainer` de HuggingFace Transformers sobre el cluster HPC Devana.

Los datos de entrenamiento proceden de un corpus eslovaco interno compilado en KInIT que combina fuentes publicas y grabaciones propias: SloPalSpeech, grabaciones de sesiones de consejos municipales, literatura leida, Mozilla Common Voice, el corpus de conferencias TEDxSK y JumpSK, FLEURS y grabaciones internas. Las muestras con datos personales se anonimizaron y se filtraron por calidad mediante un umbral de CER validado con varios modelos ASR. El 75 % de los lotes se aumento en tiempo de ejecucion con ruido sintetico (ruido telefonico, habla de fondo, ruido ambiental, ruido blanco y perdida de paquetes) para mejorar la robustez en condiciones reales de grabacion. No se menciona uso de RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripcion de voz a texto en eslovaco (`sk`) sobre audio de hasta 30 segundos por segmento.
- Robustez frente a ruido de fondo, ruido telefonico y perdida de paquetes, gracias al aumento de ruido aplicado en el entrenamiento.
- Procesamiento por lotes y por fragmentos largos mediante chunking en el pipeline de `transformers`.
- Funcionamiento en CPU y en GPU con precision fp16 o fp32.
- Integracion con el ecosistema HuggingFace (`AutoModelForSpeechSeq2Seq`, `AutoProcessor`, `pipeline`) y etiquetado como `endpoints_compatible` para Inference Endpoints.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Sin capacidades de vision, traduccion fiable ni habla multilingue tras el ajuste (se produce olvido catastrofico segun el propio autor).
- Sin modo "thinking" ni salidas estructuradas mas alla del texto transcrito.

## Casos de uso

- Transcripcion de sesiones de consejos municipales: el corpus de entrenamiento incluye grabaciones de este dominio, por lo que el modelo esta ajustado al vocabulario administrativo y a las condiciones acusticas de sala tipicas de estas sesiones, que pueden procesarse por fragmentos de 30 s.
- Subtitulado de contenido audiovisual en eslovaco: permite generar subtitulos con marcas temporales mediante el pipeline de Whisper con `return_timestamps=True`, en un modelo de 38 M que puede ejecutarse en un portatil sin GPU dedicada.
- Atencion al cliente por telefonia en eslovaco: el aumento de ruido telefonico durante el entrenamiento deberia mejorar la transcripcion de audio de baja calidad procedente de centralitas, aunque la WER interna del 20,04 % obliga a revision humana en flujos criticos.
- Notas de voz en aplicaciones moviles: con ~38 M de parametros y pesos en el orden de decenas de MB, el modelo cabe en dispositivos con recursos limitados y permite transcripcion local sin enviar audio a la nube.
- Archivado y busqueda de patrimonio oral: transcripcion masiva de grabaciones historicas o de literatura leida (fuente presente en el corpus) para indexacion y recuperacion de texto completo.
- Generacion de datos de entrenamiento para PLN en eslovaco: transcripcion de audio sin etiquetar para producir corpus de texto que alimenten modelos de lenguaje o sistemas de traduccion en eslovaco.
- Accesibilidad en tiempo real: con chunking adecuado, puede alimentar sistemas de subtitulado en directo en eslovaco, si bien el autor excluye explicitamente el streaming sin fragmentacion apropiada.
- Comandos de voz en dispositivos embebidos: transcripcion de instrucciones cortas en eslovaco en asistentes locales donde no es viable desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

Los datos de evaluacion disponibles en la model card citada corresponden al modelo `kinit/whisper-tiny-sk` y a su comparacion con `openai/whisper-tiny`. Se miden WER y CER sobre Common Voice 24.0 (5.239 muestras) y un conjunto interno de KInIT (9.317 muestras, no publico, con un tercio de audio limpio y dos tercios con ruido aumentado). Menor es mejor.

| Modelo | WER CV24 | CER CV24 | WER interno | CER interno |
|---|---:|---:|---:|---:|
| kinit/whisper-tiny-sk | 38,24 % | 13,53 % | 20,04 % | 8,86 % |
| openai/whisper-tiny | 105,14 % | 38,31 % | 99,47 % | 47,34 % |

Comparacion entre tamanos de Whisper ajustados al eslovaco, medida sobre el conjunto interno:

| Modelo | WER ajustado | WER base |
|---|---:|---:|
| Whisper Large v3 | 5,67 % | 16,22 % |
| Whisper Large v3 Turbo | 5,60 % | 18,35 % |
| Whisper Medium | 6,28 % | 29,19 % |
| Whisper Small | 8,64 % | 47,90 % |
| Whisper Base | 14,01 % | 76,38 % |
| Whisper Tiny | 20,04 % | 99,47 % |

No se han publicado resultados de benchmarks especificos para el artefacto `pokusman/whisper-tiny-sk-ct2` en la informacion disponible; los valores anteriores proceden de la model card referenciada del modelo KInIT.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 76 MB, en fp32 unos 152 MB y en int8 unos 38 MB. Sumando activaciones y buffers de audio, la inferencia cabe holgadamente por debajo de 1 GB de VRAM en cualquier configuracion habitual.
- GPU recomendadas: cualquier GPU moderna sirve. No se necesita A100 ni H100; una RTX 3060, RTX 4090 o incluso una iGPU con soporte CUDA o ROCm son suficientes. El modelo es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas las de gama de entrada y las integradas.
- Opciones de despliegue: `transformers` con el pipeline `automatic-speech-recognition`; CTranslate2 o `faster-whisper` si se confirma la conversion sugerida por el sufijo `ct2`; whisper.cpp para CPU; HuggingFace Inference Endpoints (el repositorio esta etiquetado como `endpoints_compatible`). vLLM y TGI no son adecuados para un modelo ASR seq2seq de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Entrenamiento original: realizado en el cluster HPC Devana con precision fp16 y lote efectivo de 64.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER eslovaco interno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pokusman/whisper-tiny-sk-ct2 | ~38 M | `sk` | no disponible para este artefacto; 20,04 % en el modelo KInIT de referencia | Apache 2.0 | HuggingFace |
| kinit/whisper-tiny-sk | ~38 M | `sk` | 20,04 % | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | ~38 M | Multilingue (99 idiomas) | 99,47 % | Apache 2.0 | HuggingFace |
| kinit/whisper-base-sk | ~74 M (tamano estandar de la familia Whisper, no confirmado en la informacion proporcionada) | `sk` | 14,01 % | Apache 2.0 | HuggingFace |
| kinit/whisper-small-sk | ~244 M (tamano estandar de la familia Whisper, no confirmado en la informacion proporcionada) | `sk` | 8,64 % | Apache 2.0 | HuggingFace |

La coleccion completa de KInIT incluye los seis tamanos de Whisper ajustados, ademas de los ajustes de NVIDIA NeMo (Canary, Parakeet). La eleccion entre ellos es un compromiso directo entre WER y coste computacional: pasar de Tiny a Base reduce la WER interna del 20,04 % al 14,01 % a costa de duplicar aproximadamente los parametros.

## Limitaciones y advertencias

- Olvido catastrofico: el ajuste exclusivo sobre eslovaco degrada gravemente el rendimiento en otros idiomas. Para transcripcion multilingue debe usarse `openai/whisper-tiny` original.
- Riesgo de error elevado incluso en eslovaco: una WER del 20,04 % en el conjunto interno implica que aproximadamente una de cada cinco palabras puede ser incorrecta. No es apto para transcripcion sin revision humana en contextos legales, medicos o administrativos vinculantes.
- La model card excluye explicitamente el uso en audio no eslovaco, en streaming en tiempo real sin chunking adecuado y en transcripcion critica para la seguridad sin supervision humana.
- Degradacion previsible ante acentos marcados, variantes dialectales o dominios no representados en el corpus de entrenamiento.
- Limite de 30 segundos por segmento sin fragmentacion; los audios mas largos requieren chunking con solapamiento para evitar cortes.
- Incertidumbre sobre el artefacto publicado: el repositorio `pokusman/whisper-tiny-sk-ct2` contiene la model card de `kinit/whisper-tiny-sk`, y no se documenta en la informacion disponible si los pesos son una conversion a CTranslate2, una copia de los pesos originales o un reempaquetado. Conviene verificar la integridad y el formato antes de usarlo en produccion.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, lo que reduce la validacion comunitaria disponible.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios realizados. No impone restricciones adicionales de uso, pero tampoco exime de las obligaciones derivadas del tratamiento de datos personales en el audio transcrito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pokusman/whisper-tiny-sk-ct2
- Modelo de referencia de KInIT: https://huggingface.co/kinit/whisper-tiny-sk
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Coleccion ASR de KInIT: https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247
- Catalogo SLAIH: https://www.slaih.sk/sk/catalog/whisper-tiny
- Dataset SloPalSpeech: https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech
- Dataset Mozilla Common Voice 24.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_24_0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus TEDxSK y JumpSK (KEMT NLP): https://nlp.kemt.fei.tuke.sk/speech/tedx
- Documentacion del cluster HPC Devana: https://userdocs.hpc.sav.sk/devana/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
