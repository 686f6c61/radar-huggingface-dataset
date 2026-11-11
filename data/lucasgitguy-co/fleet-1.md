# Lucasgitguy-co/Fleet-1

## Resumen

Fleet-1 es un modelo experimental de reconocimiento automático del habla (ASR) publicado por Lucasgitguy-co como continuación del adaptador Sky-Kim/whistle-finetuned-ko, que a su vez se apoya en la arquitectura y los pesos preentrenados de Whistle, desarrollado por Cactus Compute. No se trata de un transformer convencional al uso: el repositorio distribuye un artefacto propietario en formato `whistle.cact` que debe ejecutarse con el motor nativo de Cactus, no con `AutoModel` de Transformers. El modelo conserva el vocabulario coreano entrenado, las etiquetas de idioma y los pesos LoRA del modelo de origen, y añade un ciclo adicional de entrenamiento multilingüe.

El problema que aborda es la transcripción multilingüe en ocho idiomas (inglés, alemán, francés, español, italiano, neerlandés, polaco y coreano) con detección automática de idioma, en un formato pensado para inferencia ligera y entrenamiento con cuantización. La relevancia actual es limitada y de carácter experimental: el propio autor advierte explícitamente de que no se ha demostrado una mejora en los ocho idiomas y de que algunas lenguas pueden retroceder respecto al modelo de origen.

El tamaño del repositorio es de 0,0 GB según Hugging Face y no se publican el número de parámetros, la longitud de contexto ni la arquitectura interna del modelo base. La licencia es Apache 2.0 y el modelo acumula 30 descargas y ningún "like" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Whistle de Cactus Compute; artefacto propietario `.cact`, no Transformers) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (evaluado con clips de hasta 12 segundos) |
| Tipos de cuantizacion | Entrenamiento con cuantizacion W4/A8 (pesos 4 bits, activaciones 8 bits) |
| Idiomas soportados | en, de, fr, es, it, nl, pl, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (motor Cactus); no compatible con safetensors/GGUF de Transformers |

## Arquitectura y entrenamiento

El modelo deriva de Whistle (Mroz et al., 2026, Cactus Compute), cuyo diseño interno no se detalla en la información disponible. Lo que sí se especifica es el procedimiento de ajuste: se parte del adaptador LoRA de Sky-Kim/whistle-finetuned-ko (revisión `b8a4f3188a828a0e87e2713b2d3e83d71d893068`) y se continúa su entrenamiento con un optimizador AdamW nuevo, tasa de aprendizaje 2e-05, tamaño de lote 1, dos épocas, recorte de gradiente 1 y schedule warmup/cosine. El entrenamiento se ejecuta en CPU con cuantización consciente W4/A8.

Los datos proceden de FLEURS: 400 clips por idioma del split de entrenamiento y 50 por idioma del de validación, con conversión a PCM mono de 16 kHz. Se mantienen separados los splits originales y se eliminan transcripciones normalizadas repetidas dentro de cada idioma entre los splits seleccionados; se toman las primeras filas únicas elegibles en el orden del dataset y el orden de épocas se baraja con semilla 42. La selección del checkpoint se hace por pérdida de validación macro-promediada (mejor época: 2), no por puntuaciones de test. El código de entrenamiento corresponde a la revisión `ee2ffc67fe0f9537d4928e158440c7d228a63100` y los detalles exactos están en `training_manifest.json`.

## Capacidades

- Transcripción de voz a texto (ASR) en ocho idiomas: inglés, alemán, francés, español, italiano, neerlandés, polaco y coreano.
- Detección automática de idioma durante la inferencia, según la evaluación publicada.
- Conservación del vocabulario coreano y de las etiquetas de idioma del modelo de origen.
- Entrada de audio en WAV mono a 16 kHz.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo "thinking".
- No se documentan capacidades de diarización, marcas de tiempo ni puntuación.

## Casos de uso

- Transcripción de notas de voz multilingües: el modelo acepta clips cortos en cualquiera de los ocho idiomas y detecta el idioma automáticamente, lo que simplifica pipelines donde no se conoce a priori la lengua del audio.
- Subtitulado de clips breves: con clips de hasta 12 segundos en la evaluación, encaja en la generación de subtítulos por segmentos cortos, aunque el WER en polaco (43,13 %) y neerlandés (29,53 %) limita su uso en esos idiomas.
- Prototipado de asistentes de voz en español e inglés: son los idiomas con mejor WER (11,93 % y 14,39 %), adecuados para pruebas de concepto y demos internas.
- Investigación sobre ajuste fino multilingüe de ASR: el repositorio documenta manifiesto de entrenamiento, revisiones de código y configuración, lo que facilita reproducir o auditar el experimento.
- Evaluación comparativa de adaptadores LoRA en ASR: sirve como caso de estudio de continuación de un adaptador con cuantización W4/A8 en CPU.
- Filtrado o indexación de audio en coreano con cautela: el CER coreano empeoró de 33,68 % a 52,35 %, por lo que solo es viable en escenarios tolerantes a errores o como paso previo a revisión humana.
- No se recomienda para atención al cliente en producción ni para transcripción de audio largo, ruidoso o conversacional, dado que la evaluación se limita a clips cortos y limpios de FLEURS.

## Benchmarks y rendimiento

Evaluación del autor sobre 100 clips cortos de test de FLEURS por idioma (máximo 12 segundos y 158 tokens de texto), con detección automática de idioma y el mismo motor Cactus para ambos modelos. Menor es mejor.

| Idioma | Métrica | Modelo origen | Fleet-1 |
|---|---|---:|---:|
| en | WER | 14,87 % | 14,39 % |
| de | WER | 22,71 % | 22,18 % |
| fr | WER | 25,73 % | 25,18 % |
| es | WER | 11,83 % | 11,93 % |
| it | WER | 16,60 % | 16,32 % |
| nl | WER | 29,39 % | 29,53 % |
| pl | WER | 43,68 % | 43,13 % |
| ko | CER | 33,68 % | 52,35 % |

El autor advierte de que estas cifras no constituyen puntuaciones completas de benchmark, no establecen significación estadística y no garantizan precisión en grabaciones largas, ruidosas o conversacionales. Los clips de test no se usaron para entrenamiento ni para selección del checkpoint en esta ejecución, pero el modelo de origen sí se evaluó previamente en FLEURS y se entrenó con algunos clips de entrenamiento de FLEURS, y el alcance de esa exposición previa no se conoce por completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica número de parámetros ni huella de memoria.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: no confirmada; el entrenamiento se realizó en CPU con cuantización W4/A8, lo que sugiere que la inferencia está pensada para ser ligera, pero no se aportan cifras.
- Opciones de despliegue: exclusivamente el motor Cactus mediante `cactus.transcribe` y el artefacto `whistle.cact`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con `AutoModel` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Fleet-1 | No disponible | No disponible | 8 | Apache 2.0 | `.cact` (Cactus) |
| Sky-Kim/whistle-finetuned-ko (origen) | No disponible | No disponible | No disponible en la información | No disponible en la información | `.cact` (Cactus) |
| Whisper (OpenAI) | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información |

La información proporcionada no incluye datos suficientes de parámetros, contexto ni rendimiento de alternativas como para establecer una comparativa cuantitativa fiable. El único punto de comparación directo documentado es el modelo de origen, con los resultados de la tabla de benchmarks.

## Limitaciones y advertencias

- El autor declara explícitamente que no se ha demostrado mejora en los ocho idiomas y que algunos pueden retroceder; el coreano es el caso más claro, con el CER subiendo de 33,68 % a 52,35 %.
- La evaluación se limita a 100 clips cortos por idioma (máximo 12 segundos) de FLEURS, sin significación estadística y sin cobertura de audio largo, ruidoso o conversacional.
- Posible contaminación: el modelo de origen se entrenó con algunos clips de entrenamiento de FLEURS y su exposición previa no se conoce por completo.
- No es un checkpoint de Transformers; requiere el motor Cactus y el artefacto `.cact`, lo que limita la portabilidad y la integración con ecosistemas estándar.
- No se publican número de parámetros, contexto, sesgos conocidos ni tasas de alucinación; la naturaleza experimental del modelo desaconseja su uso en producción sin validación propia.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el archivo LICENSE original y atribuir correctamente al modelo base Whistle (Mroz et al., 2026, Cactus Compute) y al modelo de origen Sky-Kim/whistle-finetuned-ko.
- Los datos de entrenamiento y evaluación (FLEURS) están bajo CC BY 4.0 y el repositorio no incluye audio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/Fleet-1
- Modelo base: https://huggingface.co/Sky-Kim/whistle-finetuned-ko
- Colección de reconocimiento de voz: https://huggingface.co/collections/Lucasgitguy-co/speech-recognition-6aef2dcbe0ea208136b0ddc9
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Paper FLEURS: https://arxiv.org/abs/2205.12446
- Zeroth-Korean: https://www.openslr.org/40/
- Informe técnico (referenciado en la model card, ruta relativa del repo): `docs/paper.md`, `docs/paper.pdf`, `docs/citation.bib`
- Índice de modelos (ruta relativa del repo): `docs/MODEL_INDEX.md`
