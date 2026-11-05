# hkblockchaintechnology/lyra-studio

## Resumen

LYRA Studio es un proyecto de personaje virtual nativo de IA publicado por hkblockchaintechnology en HuggingFace. No se trata de un modelo de pesos unico, sino de un pipeline de orquestacion que combina varios modelos especialistas para generar un idol virtual de Cantopop llamado LYRA: una chica ficticia de Hong Kong de 19 anos que canta, habla y aparece en video musical. El repositorio no incluye pesos de modelos, solo artefactos multimedia (video musical, stems de audio, renders) y codigo de orquestacion.

El sistema coordina cinco "departamentos" sobre una sola GPU: Qwen2.5-VL-7B-Instruct como director y critico visual, Qwen-Image 20B como artista conceptual, Qwen3-TTS 1.7B con un LoRA de cantonés de Hong Kong como actor de voz, YuE 7B + 1B como compositor musical y Wav2Lip para sincronizacion labial. La innovacion principal es metodologica: un "bible" del personaje (fichero `character/studio_core.py`) actua como fuente unica de verdad que alimenta a todos los especialistas, con un bucle de auto-mejora donde las correcciones del critico se persisten y se reinyectan en los prompts.

Es relevante como referencia tecnica de composicion de pipelines multimodales para generacion de personajes consistentes, y como ejemplo de generacion de contenido en cantonés (yue-HK), un idioma con escasa representacion en modelos generativos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB (sin pesos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de orquestacion multi-modelo (no es un modelo unico); componentes: Qwen2.5-VL-7B-Instruct, Qwen-Image 20B, Qwen3-TTS 1.7B + LoRA cantonés, YuE 7B + 1B, Wav2Lip, ffmpeg |
| Parametros totales | No disponible como modelo unico; suma de componentes: 7B + 20B + 1.7B + 7B + 1B (mas Wav2Lip, sin cifra publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | yue (cantonés de Hong Kong), zh, en |
| Licencia | Apache-2.0 para el repositorio; componentes upstream con licencias propias (Wav2Lip es research/non-commercial) |
| Formato de pesos | No se distribuyen pesos; solo artefactos (mp4, mp3, wav, png) y codigo Python/shell |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo fundacional propio. La arquitectura es un sistema multi-agente donde cada especialista resuelve una modalidad: Qwen2.5-VL-7B-Instruct genera letras, guiones y prompts de plano y ademas actua como critico visual puntuando cada frame contra el bible del personaje; Qwen-Image 20B renderiza rostro, vestuario, escenarios y titulos; Qwen3-TTS 1.7B con el LoRA `jmtl/hk-cantonese-cc0-qwen3-tts` (entrenado sobre Common Voice `yue` con licencia CC-0) produce voz en cantonés real de Hong Kong; YuE 7B + 1B compone y canta la cancion con una etiqueta especifica de cantonés; Wav2Lip sincroniza los labios del retrato con la propia voz generada; y ffmpeg ensambla el video musical final.

La innovacion tecnica destacable es el bucle de auto-mejora: el critico revisa cada render y sus correcciones se fusionan en el prompt y se persisten en `character/refinements.json`, de modo que la identidad del personaje se afina en cada ejecucion. El autor documenta dos trampas de entorno resueltas: `molab` define `PYTHONPATH` y rompe los venv aislados (hay que limpiarlo), y `PYTHONSAFEPATH=1` oculta el directorio del script (hay que definir `PYTHONPATH` explicitamente). Ademas, `torchaudio` actual requiere TorchCodec, por lo que parchearon cuatro puntos de guardado/carga de YuE a `soundfile`. No se especifican volumenes de tokens de entrenamiento ni si hubo RLHF/DPO, ya que no se entrena un modelo base.

## Capacidades

- Generacion de imagen texto-a-imagen (Qwen-Image 20B): rostro, vestuario, escenarios y titulos.
- Sintesis de voz texto-a-habla en cantonés de Hong Kong (Qwen3-TTS 1.7B + LoRA `hk-cantonese-cc0-qwen3-tts`).
- Generacion musical letra-a-cancion con etiqueta de cantonés (YuE 7B + 1B), incluyendo stems de vocal e instrumental a 44.1 kHz.
- Sincronizacion labial (lip-sync) de un retrato con la voz generada (Wav2Lip).
- Generacion de letras, guiones y prompts de plano mediante Qwen2.5-VL-7B-Instruct.
- Critica visual automatizada: puntuacion de frames contra el bible del personaje y devolucion de correcciones.
- Consistencia de personaje mediante un "bible" unico (`character/studio_core.py`) y persistencia de refinamientos (`character/refinements.json`).
- Soporte multilingue limitado a yue, zh y en.
- Verificacion de inteligibilidad del cantonés mediante round-trip con Whisper.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico mas alla del bucle critico.

## Casos de uso

- Produccion de videoclips musicales con personaje virtual: el pipeline compone la cancion con YuE, genera la voz con Qwen3-TTS, renderiza el retrato con Qwen-Image y sincroniza con Wav2Lip, todo orquestado por scripts; adecuado para demos tecnicas y prototipos de contenido musical.
- Creacion de idols virtuales consistentes: el bible del personaje y el fichero de refinamientos permiten mantener un rostro, una voz y un tono estables entre ejecuciones, lo que sirve como plantilla para estudios que quieran definir su propia IP.
- Generacion de contenido en cantonés: cubre un hueco de idioma poco representado en modelos generativos, util para medios locales, educacion o divulgacion en yue-HK.
- Prototipado de asistentes con voz y cara: combina TTS cantonés con renderizado de imagen y lip-sync para construir avatares conversacionales en demos.
- Investigacion en orquestacion multi-modelo: el codigo de orquestacion y el bucle critico sirven como referencia para pipelines que encadenan modelos especialistas con retroalimentacion.
- Generacion de assets musicales por separado: los stems de vocal e instrumental y las lineas de voz en wav pueden reutilizarse en postproduccion o en pruebas de calidad de TTS.
- Evaluacion de calidad de TTS cantonés: el round-trip con Whisper documentado ofrece un metodo reproducible para verificar inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El autor indica que todo el pipeline se ejecuta en una sola GPU ("one GPU, five departments"), sin especificar el modelo concreto de GPU.
- VRAM estimada: no disponible. A modo de referencia, los componentes declarados suman aproximadamente 7B (Qwen2.5-VL), 20B (Qwen-Image), 1.7B (Qwen3-TTS), 7B + 1B (YuE) y Wav2Lip; la carga simultanea de todos ellos exigiria agregar sus requisitos individuales, que no se detallan.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Capacidad en GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras consumer.
- Opciones de despliegue: el proyecto usa entornos aislados por componente mediante scripts (`setup_voice.sh`, `setup_music.sh`, `setup_lipsync.sh`) y un demonio residente (`studio_daemon.py`) para imagen y critico. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LYRA Studio | Pipeline multi-modelo de personaje virtual | Suma de componentes (7B + 20B + 1.7B + 7B + 1B) | No disponible | yue, zh, en | Apache-2.0 (repo); componentes con licencias propias | HuggingFace, sin pesos |
| Yuri (AI.TALK) | Personaje virtual de referencia citado por el autor | No disponible | No disponible | No disponible | No disponible | No disponible como modelo abierto |
| Qwen3-TTS 1.7B (Alibaba/Qwen) | TTS | 1.7B | No disponible | Multiples, con LoRA para yue | Apache-2.0 | HuggingFace |
| YuE 7B + 1B | Generacion musical | 7B + 1B | No disponible | No disponible | Ver licencia del repo YuE | Repo YuE |

La comparativa con personajes virtuales cerrados como Yuri no es posible en terminos de parametros o benchmarks porque no se publican. Frente a sus componentes individuales, LYRA Studio no es un modelo alternativo sino un orquestador que los combina; la comparacion directa solo aplica a cada especialista por separado.

## Limitaciones y advertencias

- El repositorio no incluye pesos de modelos; solo artefactos y codigo de orquestacion. No es un modelo descargable y ejecutable de forma autonoma.
- Wav2Lip tiene licencia de investigacion/no comercial (Rudrabha et al.), lo que restringe el uso comercial del pipeline completo aunque el repositorio sea Apache-2.0.
- YuE tiene su propia licencia en su repositorio, distinta de Apache-2.0; hay que respetarla.
- Riesgo de alucinacion y de deriva de identidad del personaje entre ejecuciones; el bible y los refinamientos mitigan pero no eliminan este riesgo.
- Cobertura linguistica limitada a yue, zh y en; no se documenta soporte de otros idiomas.
- No hay datos publicados de benchmarks, latencia, throughput ni requisitos de VRAM, lo que dificulta evaluar su viabilidad en produccion.
- El proyecto tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-05), por lo que su madurez y mantenimiento son inciertos.
- El contenido generado se publica como demo tecnica; el autor declara que LYRA es un personaje ficticio original no afiliado a AI.TALK ni semejanza de persona real.
- Dependencias de entorno fragiles documentadas por el autor (PYTHONPATH, PYTHONSAFEPATH, TorchCodec/soundfile) que pueden complicar la reproduccion.

## Enlaces

- HuggingFace: https://huggingface.co/hkblockchaintechnology/lyra-studio
- LoRA de cantonés: https://huggingface.co/jmtl/hk-cantonese-cc0-qwen3-tts
- Qwen2.5-VL-7B-Instruct: no disponible en la informacion proporcionada
- Qwen-Image 20B: no disponible en la informacion proporcionada
- Qwen3-TTS 1.7B: no disponible en la informacion proporcionada
- YuE: no disponible en la informacion proporcionada
- Wav2Lip: no disponible en la informacion proporcionada
- Paper o blog del proyecto: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada (los artefactos se referencian dentro del repositorio)
