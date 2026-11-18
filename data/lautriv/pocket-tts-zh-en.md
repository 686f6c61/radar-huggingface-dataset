# Lautriv/pocket-tts-zh-en

## Resumen

Pocket-TTS zh-en es un ajuste fino (fine-tune) del modelo de síntesis de voz Kyutai Pocket-TTS, orientado a la lectura bilingüe chino-inglés, incluyendo frases con mezcla intra-oracional de ambos idiomas. Lo desarrolla el usuario Lautriv y se distribuye a través de Hugging Face con la librería `pocket-tts`, bajo licencia `other` con restricciones derivadas de los datos de entrenamiento. El modelo resuelve el problema de la síntesis de voz en contextos donde el chino y el inglés conviven en una misma frase (por ejemplo, nombres de marcas, términos técnicos o siglas en inglés dentro de una oración en chino), algo que los modelos monolingües no cubren bien.

Técnicamente se apoya en una arquitectura transformer derivada de Pocket-TTS, con dos variantes publicadas: una de 24 capas (principal) y una destilada de 6 capas. El texto se procesa mediante un protocolo propio, `g2p_spaced_bilingual_v3` (pinyin con espacios para el chino y tokens `en_*`/`<ew>` para el inglés), junto con un tokenizador atómico de pinyin (`n_bins=8000`, `whitespace_atomic`). El repositorio ocupa 3,3 GB e incluye pesos, tokenizador, configuración de inferencia y un script `infer.py`.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (TTS bilingüe zh-en con clonación de voz) y lo hace con pesos abiertos, aunque su licencia lo restringe por defecto a investigación y uso no comercial debido a la inclusión del dataset CS-Dialogue (CC BY-NC-SA 4.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Kyutai Pocket-TTS; dos variantes: 24 capas (principal) y 6 capas (destilada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` sin indicar cuantizaciones publicadas) |
| Idiomas soportados | chino (zh) e inglés (en), incluida mezcla intra-oracional |
| Licencia | `other`; pesos restringidos por defecto a investigación/no comercial por CS-Dialogue (CC BY-NC-SA 4.0); código MIT |
| Formato de pesos | `.pt` (PyTorch); `weights/v9_24l_15k.pt` y `weights/v9_6l_80k.pt`; tokenizador `tokenizer/tokenizer.model` |

## Arquitectura y entrenamiento

El modelo parte de los pesos en inglés de Pocket-TTS de 24 capas, reiniciando el embedding de texto (`reset_text_embedding`) y ajustando sobre un protocolo de texto bilingüe. La entrada no es texto crudo sino una representación fonética: para el chino se emplea pinyin separado por espacios y para el inglés tokens del tipo `en_*` y `<ew>`, procesados por un tokenizador atómico de pinyin con `n_bins=8000` y modo `whitespace_atomic`. La variante de 6 capas se obtiene por destilación tomando como profesor el modelo de 24 capas en el paso 15k, con `distill_cfg_coef=2`, lo que permite usar CFG de inferencia 1.0 frente a 2.0 del modelo grande.

El entrenamiento se realizó con la configuración `finetune_zh_g2p_mix_hq_v9.yaml`, con `cross_utterance_voice_prob=0.3`, `text_dropout=0.2`, tasa de aprendizaje `2e-4` y batch efectivo de 64. El punto de publicación elegido es el paso 15k (no el entrenamiento completo de 250k), descrito por el autor como el óptimo según sus criterios internos. Los datos combinan WenetSpeech (chino principal), LibriTTS-R clean-100/360 (inglés, CC BY 4.0), CS-Dialogue short filtrado (mezcla real zh-en, CC BY-NC-SA 4.0) y AISHELL-3 junto con parches de frases cortas. Los datos originales y los latentes no se distribuyen con el repositorio.

## Capacidades

- Síntesis de voz (text-to-speech) en chino, en inglés y en frases con mezcla de ambos idiomas dentro de la misma oración.
- Clonación de voz a partir de una referencia de audio externa (el ejemplo de la model card usa un `ref_4s.wav` de 4 segundos).
- Lectura de texto con nombres propios y términos en inglés embebidos en oraciones en chino (por ejemplo, marcas como "Starbucks").
- Soporte de dos modos de calidad: 24 capas (mayor fidelidad en frases largas) y 6 capas (destilado, más ligero).
- Control de inferencia mediante CFG (2.0 en el modelo de 24 capas, 1.0 en el de 6 capas) y token EOS configurable (-2).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de artículos técnicos bilingües: el modelo puede narrar textos en chino que incluyen siglas, nombres de frameworks o marcas en inglés sin cambiar de voz ni de modelo, gracias al protocolo `g2p_spaced_bilingual_v3`.
- Generación de audiolibros o pódcasts en chino con terminología inglesa: útil para contenido divulgativo donde abundan anglicismos, manteniendo una única voz clonada a partir de una muestra de referencia.
- Asistentes de voz para atención al cliente en mercados sinófonos con clientes bilingües: permite responder con pronunciación coherente cuando la consulta mezcla idiomas, aunque la licencia limita su uso comercial sin reentrenamiento.
- Prototipado de interfaces de voz en investigación: el modelo de 6 capas, más ligero, sirve para experimentar con clonación de voz y protocolos G2P en entornos de laboratorio.
- Doblaje y localización de contenido corto: frases y locuciones publicitarias con marcas en inglés integradas en guiones en chino.
- Evaluación comparativa de tokenizadores fonéticos: el repositorio publica el tokenizador atómico y el protocolo de texto, lo que facilita reproducir experimentos de TTS bilingüe en investigación académica.
- Accesibilidad: lectura en voz alta de documentos mixtos zh-en para usuarios con discapacidad visual, siempre en contextos no comerciales dada la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,3 GB, pero no se especifica el tamaño de los pesos ni los requisitos de memoria.
- GPU recomendadas: no disponible. El autor no publica recomendaciones de hardware.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: el flujo documentado es Python con `uv sync --extra zh`, definiendo `POCKET_TTS_CODE_ROOT` y ejecutando `infer.py` con pesos `.pt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Desarrollador | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pocket-TTS zh-en | Lautriv | zh, en (mezcla) | Fine-tune bilingüe con clonación de voz | `other` (no comercial por defecto) | Hugging Face |
| Kyutai Pocket-TTS | Kyutai | en (principal) | Modelo base de TTS con clonación | según Kyutai | Hugging Face (`kyutai/pocket-tts`) |
| Pocket-TTS zh | Lautriv | zh | Fine-tune solo chino | `other` | Hugging Face (`Lautriv/pocket-tts-zh`) |

No se dispone de datos de rendimiento comparativo (parámetros, contexto, benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La variante de 6 capas tiende a omitir caracteres o truncar frases largas; el autor recomienda el modelo de 24 capas para escenarios importantes.
- Existe un desajuste entre el entrenamiento (voz con prefijo en la misma frase) y la inferencia (voz externa más texto completo), lo que puede provocar inestabilidad al inicio de frases muy largas.
- El inglés se modela mediante un protocolo de fonemas, no con el BPE original de Kyutai, por lo que nombres propios extremos pueden pronunciarse de forma deficiente.
- La prosodia no es de calidad de estudio y depende de la calidad de la referencia de voz y de posibles errores del G2P.
- Licencia: los pesos son `other` y, al incluir CS-Dialogue (CC BY-NC-SA 4.0), quedan restringidos por defecto a investigación y uso no comercial. El uso comercial requiere reentrenar con otros datos u obtener autorización.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de artefactos de audio o pronunciaciones incorrectas en términos no vistos.
- No se documentan sesgos específicos ni evaluaciones de robustez por acento o dialecto.
- El repositorio no incluye los datos de entrenamiento ni los latentes, lo que dificulta la reproducibilidad completa.
- La model card indica que debe sustituirse el marcador `<GITHUB_REPO>` por la URL real del repositorio de entrenamiento antes de publicar; conviene verificar dicho enlace.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Lautriv/pocket-tts-zh-en
- Modelo hermano solo chino: https://huggingface.co/Lautriv/pocket-tts-zh
- Repositorio base Kyutai Pocket-TTS: https://github.com/kyutai-labs/pocket-tts
- Pesos oficiales Kyutai Pocket-TTS: https://huggingface.co/kyutai/pocket-tts
- Voces de referencia Kyutai: https://huggingface.co/kyutai/tts-voices
- Dataset CS-Dialogue: https://huggingface.co/datasets/BAAI/CS-Dialogue
