# ampixa/limbu-tts

## Resumen

Limbu TTS (`ampixa/limbu-tts`) es un modelo de sintesis de voz (text-to-speech) para el idioma limbu (tambien conocido como yakthung, codigo ISO 639-3 `lif`), una lengua kiranti hablada principalmente en el este de Nepal y en zonas de Sikkim e India. El modelo lo publica el usuario `ampixa` en Hugging Face y esta orientado a un caso de uso muy especifico: dotar de voz sintetica a un idioma de bajos recursos que practicamente no cuenta con sistemas TTS comerciales.

Tecnicamente se distribuye en formato ONNX y esta etiquetado como un modelo Piper, que internamente emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech). Esto lo situa en la familia de modelos TTS ligeros y desplegables en local, pensados para inferencia de baja latencia en CPU o GPU modesta, mas que para sintesis de alta fidelidad en la nube.

La relevancia del modelo es fundamentalmente linguistica y de preservacion: se trata de un artefacto para una lengua minoritaria, con licencia restringida y acceso gated (hay que aceptar condiciones en Hugging Face). El repositorio es muy pequeno (0,1 GB) y no cuenta con descargas ni likes en el momento de la consulta, lo que sugiere un proyecto incipiente o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) empaquetado para Piper, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | limbu (`lif`) |
| Licencia | `bible-brain-source-terms-pending` (licencia personalizada, acceso restringido) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en VITS, un enfoque end-to-end que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo entrenado con aprendizaje adversarial, junto con un discriminador de multiple periodo y escala. Piper es el runtime de inferencia que empaqueta estos modelos VITS en ONNX para sintesis rapida y determinista en local. No se dispone de informacion publica sobre el numero de parametros, la configuracion exacta del modelo (dimensiones de embedding, canales del decoder, tasas de muestreo) ni el vocabulario fonetico empleado.

Respecto a los datos de entrenamiento, no hay detalles publicados en la informacion disponible. El nombre de la licencia (`bible-brain-source-terms-pending`) sugiere que el corpus podria estar vinculado a material biblico o a un proyecto tipo "Bible Brain", frecuente en la construccion de recursos para lenguas de bajos recursos, pero esto es una inferencia a partir del identificador y no un dato confirmado. No consta informacion sobre numero de horas de audio, hablantes, calidad de grabacion ni si se aplico algun proceso de alineamiento forzado o limpieza.

## Capacidades

- Sintesis de voz a partir de texto en limbu (`lif`).
- Generacion de audio mono-hablante (se desconoce si soporta multiples voces).
- Inferencia via ONNX Runtime, compatible con el ecosistema Piper.
- Despliegue local sin dependencia de servicios en la nube.
- No se ha documentado soporte de control de prosodia, emocion, velocidad o estilo.
- No se ha documentado soporte multilingue: el modelo esta etiquetado unicamente para limbu.
- No se ha documentado soporte de clonacion de voz ni de zero-shot voice cloning.

## Casos de uso

- Preservacion linguistica y archivo sonoro: generar locuciones en limbu para documentales, museos o archivos de lengua, aprovechando que el modelo funciona offline y con recursos minimos.
- Accesibilidad para hablantes de limbu: convertir texto digital (noticias, articulos, mensajes) en audio para personas con discapacidad visual o dificultades de lectura.
- Lectura de textos religiosos o comunitarios: el identificador de licencia sugiere un uso vinculado a material biblico; el modelo podria narrar pasajes o devocionales en limbu.
- Aplicaciones educativas: materiales de aprendizaje del limbu con audio sintetico para escuelas o cursos de lengua kiranti.
- Asistentes de voz de baja latencia en dispositivos: al ser un modelo VITS/ONNX de ~0,1 GB, puede integrarse en moviles o Raspberry Pi para interfaces conversacionales en limbu.
- Senalizacion y avisos automatizados: anuncios en estaciones, aeropuertos o servicios publicos de zonas con poblacion limbu-parlante.
- Investigacion en TTS de bajos recursos: servir como linea base o punto de comparacion para nuevos corpus y modelos en lenguas kiranti.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; por el tamano del repositorio (0,1 GB) y la arquitectura VITS, la inferencia deberia caber holgadamente en GPUs consumer con 2-4 GB de VRAM, e incluso ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A10, A100) es sobredimensionada para este modelo; el cuello de botella sera el runtime, no la GPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con soporte CUDA o incluso en CPU.
- Opciones de despliegue: Piper (runtime nativo), ONNX Runtime (CPU/GPU), integracion en Python via `onnxruntime`. No se ha documentado soporte para vLLM, TGI o llama.cpp (no aplican a TTS).
- Latencia y throughput: no disponibles. En Piper, tipicamente la sintesis es mas rapida que tiempo real en CPU moderna, pero no hay cifras publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ampixa/limbu-tts | limbu (`lif`) | VITS / Piper (ONNX) | ONNX | Restringida (`bible-brain-source-terms-pending`) | Gated en HF |
| Piper (voces oficiales) | Multiples (en, es, de, etc.) | VITS (ONNX) | ONNX | MIT / varias | Publico |
| Coqui TTS (XTTS v2) | Multilingue (17 idiomas) | GPT + VITS-like | PyTorch | Coqui Public Model License (no comercial) | Publico |
| MMS-TTS (Meta) | >1.100 idiomas | VITS | PyTorch | CC-BY-NC 4.0 | Publico |

No se dispone de datos de rendimiento comparativo (MOS, WER, latencia) para `limbu-tts`. La comparativa se limita a caracteristicas estructurales. Para limbu en concreto no se conocen alternativas publicas ampliamente documentadas.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face; no es de descarga libre inmediata.
- Licencia no estandar: `bible-brain-source-terms-pending` no es una licencia SPDX reconocida; el uso comercial queda en un limbo legal hasta que se publique el texto definitivo de la licencia.
- Cobertura limitada a un unico idioma (limbu) y probablemente a un unico hablante; no se ha documentado variacion dialectal.
- Sin datos publicados sobre calidad (MOS), inteligibilidad o naturalidad; el rendimiento real es desconocido.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento, nombres propios o prestamos.
- Sin informacion sobre sesgos de genero, edad o acento del hablante de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria, sin issues resueltos ni garantia de mantenimiento.
- Fecha de creacion futura en los metadatos (2026-11-28): conviene verificar la integridad y el origen del repositorio antes de usarlo en produccion.
- No apto para clonacion de voz ni para sintesis expresiva: es un TTS de proposito general para lectura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/limbu-tts
- Piper (runtime TTS): https://github.com/rhasspy/piper
- ONNX Runtime: https://onnxruntime.ai/
- Paper original de VITS: https://arxiv.org/abs/2106.06103
- Codigo ISO 639-3 para limbu (`lif`): https://iso639-3.sil.org/code/lif
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales especificos de este modelo.
