# Inomjonov/tiny-voca-uzbek-navoiy

## Resumen

tiny-voca-uzbek-navoiy es un modelo de sintesis de voz (text-to-speech) en uzbeko, mono-hablante y de un solo altavoz sintetico masculino identificado como M2. Lo desarrolla el usuario Inomjonov y se entrena desde cero con aproximadamente 10 horas de audio sintetico generado por el modelo profesor Navoiy TTS de Aisha AI. La arquitectura y el codigo de entrenamiento se adaptan del proyecto tiny-voca de Muhammed Nazeem.

El modelo tiene 4.531.531 parametros y produce audio mono a 24 kHz. Se trata de un modelo "estudiante" experimental que destila el comportamiento de un TTS mayor en una red mucho mas pequena, lo que permite ejecutarlo en hardware de consumo. El checkpoint publicado corresponde a una ejecucion completa de 104.737 pasos.

Es relevante por dos motivos: cubre un idioma con pocos recursos como el uzbeko con una licencia permisiva (Apache-2.0) y demuestra una via de bajo coste para crear TTS de idiomas minoritarios mediante destilacion de modelos profesor. No obstante, el autor lo etiqueta explicitamente como experimental y no aporta metricas de calidad subjetiva (MOS) ni de reconocimiento automatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feed-forward de fonemas con predictor de duracion/pausa, prediccion de prosodia y sintesis de forma de onda source-filter |
| Parametros totales | 4.531.531 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no condicionado por ventana de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint nativo con implementacion tiny-voca incluida); no se distribuye en safetensors ni GGUF |
| Frecuencia de muestreo | 24 kHz mono |
| Vocabulario de fonemas | 48 simbolos uzbekos |
| Canales internos | 192 |
| Bloques | 4 encoder, 2 prosodia, 5 acusticos |
| Hablantes | 1 (M2, masculino sintetico) |
| Pasos de entrenamiento | 104.737 |
| Hardware de entrenamiento | RTX 3060 Ti 8 GB |

## Arquitectura y entrenamiento

El modelo es un transformer feed-forward que opera sobre fonemas uzbekos, no sobre texto crudo. La cadena incluye un frontend de fonemizacion basado en reglas del latin uzbeko, un encoder de 4 bloques, un predictor de duracion y pausas, un modulo de prosodia de 2 bloques y un sintetizador acustico de 5 bloques que genera la forma de onda mediante un esquema source-filter. Los canales internos son 192 y el vocabulario de entrada consta de 48 simbolos.

El entrenamiento parte de 10,001 horas de audio sintetico generado por el profesor Navoiy TTS (revision `9445f41ee5f38bd3a34eb16b0279dc05f9997fc2`), del que se retuvieron 6.185 clips (7,695 horas) para entrenamiento, 354 clips (0,440 horas) para validacion y 348 clips (0,433 horas) para test, tras filtrado por transcripcion y alineamiento. Las fuentes de texto fueron frases de Common Voice en uzbeko y guiones propios del proyecto. El entrenamiento usa AdamW con tasa de aprendizaje inicial 0,0003 durante 104.737 pasos, con perdidas de reconstruccion espectral seguidas de entrenamiento adversarial a partir del paso 8.000. El presupuesto de batch por fotogramas se redujo de 9.000 a 3.000 para ajustarse a los 8 GB de la RTX 3060 Ti, sin acumulacion de gradientes que compensara la reduccion. Se sustituyo el frontend ingles por fonemizacion uzbeka basada en reglas y alternativas de alineamiento en uzbeko.

## Capacidades

- Sintesis de voz en uzbeko a partir de texto en latin, con normalizacion de digitos, horas y texto inclui da en el wrapper.
- Voz unica: altavoz masculino sintetico M2; no hay seleccion de hablante ni clonacion.
- Generacion de audio mono a 24 kHz con prosodia y duraciones predichas por el modelo.
- Control de velocidad de habla mediante el parametro `--speed` (por defecto 1.0).
- Ejecucion en CPU o CUDA mediante el script `generate.py` incluido.
- No soporta tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido en uzbeko: convertir articulos, noticias o documentacion a audio para aplicaciones de accesibilidad o consumo pasivo, aprovechando la licencia Apache-2.0 y el bajo coste de inferencia.
- Prototipado de asistentes de voz en uzbeko: usar el modelo como capa TTS en un pipeline de demostracion donde la calidad experimental sea aceptable y el hardware limitado.
- Generacion de avisos y locuciones cortas: mensajes de sistema, recordatorios o notificaciones con texto normalizado (numeros, horas) gracias al modulo de normalizacion incluido.
- Investigacion en TTS de bajos recursos: servir como linea base reproducible para estudiar destilacion de profesor a estudiante en idiomas minoritarios.
- Pruebas de integracion en aplicaciones moviles o de escritorio: el tamano de 4,5 millones de parametros y la ejecucion en CPU permiten empaquetarlo en entornos sin GPU.
- Evaluacion comparativa de frontends foneticos: el modelo permite experimentar con fonemizacion basada en reglas para uzbeko frente a otros enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta puntuaciones MOS ni metricas de calidad ASR verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (4,5 millones de parametros); cabe holgadamente en cualquier GPU consumer. No se especifica una cifra exacta en la informacion disponible.
- GPU recomendadas: cualquier GPU con CUDA; el propio autor entreno en una RTX 3060 Ti de 8 GB y ofrece `--device cuda` para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier modelo actual; tambien funciona en CPU con `--device cpu`.
- Opciones de despliegue: script `generate.py` incluido con PyTorch (>=2.4,<3), NumPy, SoundFile y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Frecuencia | Licencia | Notas |
|---|---|---|---|---|---|
| tiny-voca-uzbek-navoiy | 4,53 M | uzbeko | 24 kHz | Apache-2.0 | Mono-hablante, experimental, destilado de Navoiy TTS |
| aisha-org/navoiy-tts (profesor) | no disponible | uzbeko | no disponible | no disponible | Modelo profesor usado para generar el audio sintetico; basado en CosyVoice2-0.5B |
| FunAudioLLM/CosyVoice2-0.5B | 0,5 B | multilingue | no disponible | no disponible | Base del profesor Navoiy; mucho mayor y con mas capacidades |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad experimental: el autor no reclama MOS ni puntuacion ASR verificada; la pronunciacion, el acento en prestamos, el ritmo y el alineamiento pueden ser imperfectos.
- Sesgos y errores heredados: al entrenarse con audio sintetico del profesor Navoiy, los errores del profesor pueden transferirse al estudiante.
- Una sola voz: no hay seleccion de hablante ni clonacion; solo existe el altavoz M2.
- Cobertura limitada al uzbeko y a su fonemizacion basada en reglas, con un sistema de acento de linea base sobre la vocal final.
- Datos de entrenamiento reducidos: 7,695 horas efectivas, no las 10 horas recolectadas, lo que limita la generalizacion.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE` y atribuir a Muhammed Nazeem (tiny-voca) y a Aisha AI (Navoiy TTS y modulo de normalizacion); las notas del profesor y de los textos fuente estan en `licenses/`.
- Para produccion: evaluar con texto propio y revisar los ejemplos publicados antes de adoptarlo; no se recomienda como unico TTS en aplicaciones criticas sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Inomjonov/tiny-voca-uzbek-navoiy
- Modelo profesor Navoiy TTS: https://huggingface.co/aisha-org/navoiy-tts
- Repositorio tiny-voca (Muhammed Nazeem): https://github.com/n4ze3m/tiny-voca
- Base del profesor CosyVoice2-0.5B: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Ejemplo de audio (introduccion): https://huggingface.co/Inomjonov/tiny-voca-uzbek-navoiy/resolve/main/examples/introduction.wav
- Ejemplo de audio (habla cotidiana): https://huggingface.co/Inomjonov/tiny-voca-uzbek-navoiy/resolve/main/examples/everyday.wav
- Ejemplo de audio (numeros y horas): https://huggingface.co/Inomjonov/tiny-voca-uzbek-navoiy/resolve/main/examples/numbers.wav
