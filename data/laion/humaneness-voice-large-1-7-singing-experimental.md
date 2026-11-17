# laion/Humaneness-Voice-Large-1.7-Singing-Experimental

## Resumen

Humaneness Voice Large 1.7 Singing Experimental es un checkpoint de investigación publicado por LAION que parte del modelo base Humaneness Voice Large 1.7 y lo especializa, mediante un ajuste fino con adaptadores de bajo rango, en la síntesis de voz cantada manteniendo a la vez las capacidades de texto a voz convencionales. El modelo se apoya en la arquitectura MOSS-TTS local transformer v1.5 y genera audio mono a 48 kHz a partir de doce codebooks MOSS-v2 por cada trama de 80 ms (12,5 tramas por segundo). Cuenta con 4.129.990.144 parámetros en pesos BF16 y un repositorio de 8,7 GB.

El interés del checkpoint es fundamentalmente conceptual: demuestra que un modelo de habla puede aprender a cantar sin perder la funcionalidad TTS, algo que el autor enmarca explícitamente como prueba de concepto y no como sistema de producción validado. El adaptador final, de rango 128 y 96.337.920 parámetros entrenables, ya está fusionado en los pesos raíz, por lo que el repositorio se carga como un modelo ordinario sin adjuntar adaptadores adicionales.

El modelo cubre cinco idiomas (inglés, alemán, neerlandés, francés y español) y admite condiciones vocales diferenciadas: canto con letra, melodía sin palabras, tarareo con boca cerrada y silbido. Su licencia CC-BY-4.0 permite uso comercial con atribución, aunque la naturaleza experimental del checkpoint exige validación propia antes de cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS-TTS local transformer v1.5 (text-to-audio) |
| Parametros totales | 4.129.990.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, de, nl, fr, es |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (BF16) |
| Parametros entrenables del adaptador | 96.337.920 (rango/alpha 128) |
| Frecuencia de muestreo de salida | 48 kHz mono |
| Codebooks | 12 MOSS-v2 por trama de 80 ms (12,5 tramas/s) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MOSS-TTS local transformer v1.5 del modelo base Humaneness Voice Large 1.7. La salida de audio se representa mediante doce codebooks MOSS-v2 por trama de 80 ms, que se decodifican a audio mono de 48 kHz. Sobre el modelo base congelado en BF16 se entrenó un adaptador LoRA de rango 128 y alpha 128 sobre 146 proyecciones de atención semántica y local, con 96.337.920 parámetros entrenables, usando adaptadores y AdamW en FP32.

El entrenamiento consistió en tres épocas completas sobre 392.256 ejemplos únicos (1.176.768 presentaciones y 36.774 actualizaciones del optimizador) en ocho GPU GH200. La mezcla de datos incluye 122.057 interpretaciones expresivas no musicales nuevas, 30.515 ejemplos de replay de actuación vocal previa, 49.881 canciones con letra en los cinco idiomas, 9.988 sílabas cantadas no léxicas, 34.871 ejemplos de cobertura musical adicional con tarareo y silbido, y 144.944 ejemplos de canto LeVo con guiones observados utilizables. Todas las grabaciones son sintéticas. Se usó batch global 32, learning rate máximo 2e-5, 5 % de warmup y decaimiento coseno hasta 2e-6. La mitad del calendario de presentaciones emplea referencias de audio; el resto usa un alias de voz sintética registrada o ninguna referencia. Las referencias de voces sintéticas conocidas emplean una grabación y una emoción distintas, y las de LeVo son recortes de 5 a 15 segundos de la misma canción codificados de forma independiente.

Un detalle relevante: las anotaciones de notas MIDI se generaron después del entrenamiento de este checkpoint. El modelo se entrenó con los campos GENERAL y SCRIPT, no con el campo de anotación MIDI, por lo que no establece control por MIDI; una futura ejecución podría aprovechar ese campo para condicionamiento explícito de notas.

## Capacidades

- Síntesis de voz cantada con letra en inglés, alemán, neerlandés, francés y español.
- Melodía sin palabras (vocalizaciones no léxicas).
- Tarareo con boca cerrada.
- Silbido melódico.
- Síntesis de voz hablada convencional, conservada del modelo base.
- Control de interpretación mediante instrucciones en texto (campo GENERAL y SCRIPT con direcciones de actuación en línea).
- Condicionamiento por referencia de audio de un solo hablante limpio mediante `--reference-wav`, con recorte automático de la forma de onda antes de la codificación.
- Soporte de alias de voz sintética registrada como referencia alternativa.
- Generación de audio mono a 48 kHz.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a un modelo text-to-audio.

## Casos de uso

- Prototipado de canciones cortas: generar melodías originales breves con letra en cualquiera de los cinco idiomas para maquetas o pruebas de concepto, indicando en el prompt que el intérprete cante una melodía original conectada y solicitando una única voz solista seca.
- Investigación en síntesis de canto: usar el checkpoint como línea base reproducible para estudiar la retención de capacidades TTS tras el ajuste en canto, gracias a que el autor publica comandos de reproducción del entrenamiento y el código de fusión del adaptador.
- Generación de jingles y sintonías experimentales: producir fragmentos cantados o tarareados para pruebas de sonoridad en vídeos internos, asumiendo revisión humana obligatoria por la variabilidad de tono y pronunciación.
- Doblaje y localización creativa: generar versiones cantadas o tarareadas de una misma melodía en varios idiomas para evaluar la transferibilidad entre lenguas del modelo.
- Creación de material para entrenamiento de otros sistemas: sintetizar voces cantadas, silbidos y tarareos como datos aumentados en pipelines de investigación de audio.
- Evaluación de robustez de voces sintéticas: emplear el condicionamiento por referencia de audio y los alias de voz registrados para medir la estabilidad de la identidad vocal entre emociones y grabaciones distintas.
- Pruebas de percepción auditiva: generar estímulos controlados (canto con letra, vocalizaciones sin palabras, boca cerrada, silbido) para experimentos de escucha crítica con evaluadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos de audio sintéticos (nana en inglés, rock lúdico en alemán, nana en neerlandés, canción alegre en francés y en español, melodía sin palabras, tarareo con boca cerrada y silbido triste) que el autor presenta como demostración de capacidad, no como valoraciones de calidad curadas, y cuyos prompts privados de evaluación no se publican.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.129.990.144 parámetros en BF16 los pesos ocupan aproximadamente 8,3 GB, por lo que se requiere holgura adicional para activaciones y decodificación.
- GPU recomendadas: el autor indica que se debe proporcionar una GPU CUDA; el entrenamiento se realizó en ocho GH200. No se especifican modelos concretos de GPU para inferencia.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño de pesos en BF16 sugiere que podría requerir GPUs de gama alta con suficiente VRAM, pero no se documenta.
- Opciones de despliegue: el repositorio incluye `infer.py` y `requirements.txt` para inferencia nativa con CUDA; también incluye `runtime/` con las implementaciones nativas de empaquetado, adaptador y decodificación. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Parámetros de muestreo por defecto: temperatura 1, top-p 0,95, top-k 50, CFG 1.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de síntesis de canto con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo describe como prueba de concepto, no como sistema de canto validado para producción ni como modelo de transcripción verificado, y no reclama una mejora general de la calidad TTS.
- Fallos documentados: pueden fallar el tono, las palabras, el timing, la pronunciación, la identidad vocal y el aislamiento vocal.
- Datos totalmente sintéticos: todas las grabaciones de entrenamiento son sintéticas, lo que puede introducir artefactos propios de las voces generadas.
- Sin control MIDI: las anotaciones de notas se generaron después del entrenamiento y este checkpoint no las utiliza; no se establece condicionamiento por notas.
- Referencias de LeVo no independientes: las referencias de canto LeVo son recortes de la misma canción, por lo que no sirven como referencias independientes para evaluar al hablante.
- Idiomas limitados a en, de, nl, fr y es; no se documenta cobertura adicional.
- Longitud de contexto no documentada, lo que dificulta planificar generaciones largas.
- Riesgo de alucinación auditiva: al ser un modelo generativo de audio, puede producir contenido vocal no solicitado o desviarse del guion; requiere escucha crítica.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la falta de validación del checkpoint traslada al usuario la responsabilidad de evaluar la calidad y los derechos sobre las letras y melodías introducidas.
- El adaptador ya está fusionado en los pesos raíz; adjuntarlo de nuevo es un error de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/Humaneness-Voice-Large-1.7-Singing-Experimental
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Large-1.7
- Dataset de voz cantada sintética: https://huggingface.co/datasets/laion/synthetic-singing-voice
- Dataset german-english-voice-acting-challenges: https://huggingface.co/datasets/laion/german-english-voice-acting-challenges
- Dataset singing-voice-1k: https://huggingface.co/datasets/laion/singing-voice-1k
- Guía de prompting del checkpoint: docs/PROMPTING.md (dentro del repositorio)
- Manual de prompting del modelo base: https://laion-humaneness-voice-large-1-7-prompting-manual.static.hf.space/
- Reproducción del entrenamiento: docs/TRAINING.md (dentro del repositorio)
