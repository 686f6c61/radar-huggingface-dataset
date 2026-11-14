# KalenjinAI/kakara

## Resumen

Kakara es un modelo de síntesis de voz (text-to-speech) especializado en **kalenjin** (`kln`), una lengua nilótica hablada principalmente en Kenia. Lo desarrolla KalenjinAI como un ajuste fino de Kokoro-82M, el modelo TTS de 82 millones de parámetros de hexgrad, sobre aproximadamente 290 horas de audio en kalenjin procedentes del dataset ANV Kalenjin. El resultado es un sistema ligero que funciona en tiempo real sobre CPU convencional, sin GPU y sin PyTorch, gracias a su exportación a ONNX.

La relevancia del modelo reside en dos factores. Por un lado, cubre una lengua de bajos recursos que apenas cuenta con sistemas TTS públicos, lo que lo convierte en una herramienta poco habitual para preservación lingüística, accesibilidad y generación de contenido en kalenjin. Por otro, demuestra que un modelo base pequeño (82 M de parámetros) puede adaptarse a un idioma específico con un coste de entrenamiento muy contenido: alrededor de un día en una única GPU RTX PRO 6000.

El modelo ofrece tres voces (femenina, masculina y una mezcla promediada de múltiples hablantes), genera audio WAV a 24 kHz y utiliza un conversor grafema-fonema propio basado en reglas, con reconocimiento de préstamos del inglés. Se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (base Kokoro-82M), exportada a ONNX |
| Parametros totales | 82 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | fp32 (inferencia en onnxruntime); no se documentan otras precisiones |
| Idiomas soportados | kalenjin (`kln`), con préstamos del inglés reconocidos y pronunciados en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (inferencia), `kakara.pth` (PyTorch), voces en `.npy` |

## Arquitectura y entrenamiento

Kakara parte de Kokoro-82M, un modelo TTS basado en StyleTTS2 con 82 millones de parámetros. El ajuste fino se realizó con la receta `semidark/kikiri-tts`, una adaptación del entrenamiento de StyleTTS2 para Kokoro, adaptada al kalenjin. El entrenamiento se estructuró en dos fases: una primera etapa sobre los 552 hablantes del dataset completo (unas 290 horas, 4 épocas) y una segunda etapa de ajuste fino sobre cinco voces seleccionadas. El checkpoint publicado corresponde al paso 2.882 de la segunda etapa, antes de la fase adversarial, por ser el que mejor puntuó en el benchmark de validación. Todo el entrenamiento se completó en aproximadamente un día sobre una única GPU RTX PRO 6000.

Una innovación destacable es el pipeline de conversión texto-fonema basado en reglas (`kln_g2p.py`), que no depende de espeak y que incorpora un módulo específico (`kln_english.py`) para detectar y pronunciar correctamente los préstamos del inglés. Los números se leen en kalenjin. La exportación a ONNX permite inferencia sin PyTorch, y el modelo incluye tres voces predefinidas (femenina, masculina y mezcla) almacenadas como vectores `.npy`.

## Capacidades

- Síntesis de voz en kalenjin a 24 kHz en formato WAV.
- Tres voces: femenina, masculina y mezcla (promedio de múltiples hablantes).
- Conversión grafema-fonema por reglas, sin dependencia de espeak.
- Reconocimiento y pronunciación de préstamos del inglés integrados en el texto kalenjin.
- Lectura de números en kalenjin.
- Inferencia en CPU sin GPU y sin PyTorch, mediante onnxruntime.
- Interfaz de línea de comandos (`kakara.py`) y API Python (`Kakara`).
- Compatibilidad con PyTorch mediante `kokoro.KModel` y el checkpoint `kakara.pth`.
- Control de velocidad mediante el parámetro `speed`.

## Casos de uso

- **Preservación y difusión del kalenjin**: generación de audiolibros, materiales educativos y contenidos divulgativos en kalenjin, una lengua con escasos recursos digitales, usando las tres voces disponibles para dar variedad.
- **Accesibilidad para hablantes de kalenjin**: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad dirigidas a personas con discapacidad visual que usan esta lengua.
- **Atención al cliente y avisos automatizados**: locuciones pregrabadas o dinámicas para servicios públicos, sanitarios o financieros en zonas kalenjin-parlantes, ejecutables en servidores sin GPU.
- **Integración en aplicaciones móviles o de bajos recursos**: al funcionar en CPU con un factor de tiempo real de 0,18 en todos los núcleos, puede desplegarse en portátiles o servidores modestos sin infraestructura GPU.
- **Investigación lingüística y fonética**: generación controlada de estímulos de audio en kalenjin para experimentos de percepción, con control de velocidad y voz.
- **Producción de contenido multimedia**: doblaje o narración de vídeos y pódcast en kalenjin, etiquetando el audio como sintético según las recomendaciones del autor.
- **Evaluación de sistemas ASR**: generación de audio sintético de referencia para probar reconocedores automáticos de kalenjin como el whisper fine-tuned del mismo ecosistema.

## Benchmarks y rendimiento

Evaluación sobre 20 frases reservadas (no vistas en entrenamiento) de un hablante, comparadas con las grabaciones reales y con el modelo anterior (Kalenjin TTS v1 basado en F5-TTS):

| Sistema | Judge CER ↓ | UTMOS ↑ | Ritmo (fonemas/s) |
|---|---|---|---|
| Grabaciones reales (hablante reservado) | 0,129 | 2,81 | 10,7 |
| Kalenjin TTS v1 (F5-TTS) | 0,092 | 2,69 | 12,0 |
| Kakara · femenina | 0,075 | 3,25 | 8,7 |
| Kakara · masculina | 0,066 | 3,25 | 9,3 |
| Kakara · mezcla | 0,070 | 3,34 | 8,2 |

El Judge CER mide la tasa de error de caracteres al transcribir el audio con `Rekody/whisper-large-v3-turbo-kalenjin` (menor es mejor). UTMOS es una predicción de naturalidad de 1 a 5 entrenada con pruebas en inglés y japonés. En CPU (portátil, onnxruntime, fp32) el factor de tiempo real es 0,18 con todos los núcleos y 0,56 con un solo núcleo; el modelo anterior F5-TTS requiere 13-17 s de cómputo por segundo de audio en la misma CPU.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo corre en CPU. El repositorio ocupa 0,7 GB, por lo que la memoria RAM necesaria es del orden de ese tamaño más el runtime de onnxruntime.
- **GPU recomendadas**: no son necesarias. Cualquier GPU moderna (RTX 4090, A100, H100) puede usarse, pero el modelo está optimizado para CPU.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo, aunque el caso de uso principal es CPU.
- **Despliegue**: onnxruntime (vía principal), PyTorch con `kokoro.KModel` y `kakara.pth`, y línea de comandos con `kakara.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- **Latencia y throughput**: factor de tiempo real 0,18 en CPU multinúcleo y 0,56 en un solo núcleo (fp32, onnxruntime). El entrenamiento se realizó en una RTX PRO 6000 en aproximadamente un día.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | Contexto/entrada | Despliegue |
|---|---|---|---|---|---|
| Kakara | 82 M | kalenjin | Apache-2.0 | texto kalenjin | ONNX en CPU, PyTorch |
| Kokoro-82M (base) | 82 M | múltiples (inglés, etc.) | Apache-2.0 | texto multilingüe | ONNX, PyTorch |
| Kalenjin TTS v1 (F5-TTS) | no disponible | kalenjin | no disponible | texto kalenjin | requiere GPU/CPU con mayor coste (13-17 s por segundo de audio) |
| F5-TTS (genérico) | no disponible | multilingüe | no disponible | texto | GPU recomendada |

Kakara mejora al TTS v1 en CER (0,066-0,075 frente a 0,092) y UTMOS (3,25-3,34 frente a 2,69), y es entre 20 y 90 veces más rápido en CPU. Frente a Kokoro-82M base, Kakara está especializado en kalenjin y pierde cobertura multilingüe.

## Limitaciones y advertencias

- **Ritmo**: el habla es aproximadamente un 15 % más lenta que la de hablantes reales; las frases cortas suenan más lentas. Se recomienda `speed=1.1`-`1.3` para frases cortas y 1.0 para frases largas.
- **Pronunciación basada en reglas ortográficas**: nombres propios, préstamos escritos a la kalenjin y palabras cuyo tono o longitud vocálica no se refleja en la escritura pueden pronunciarse mal.
- **Entonación limitada**: aprendida de grabaciones leídas y conversacionales; preguntas y emoción solo se expresan parcialmente.
- **Convención ortográfica**: solo se ha probado con la ortografía de las transcripciones de entrenamiento; otras convenciones pueden leerse de forma distinta.
- **Sesgos de los datos**: las voces derivan de personas reales del dataset ANV Kalenjin (CC BY 4.0); pueden heredar sesgos de los hablantes y del corpus.
- **Riesgo de uso indebido**: el autor prohíbe explícitamente su uso para suplantar personas, engañar a oyentes o atribuir palabras falsas a personas reales; debe etiquetarse el audio sintético como tal.
- **Licencia**: Apache-2.0 permite uso comercial, pero el dataset de entrenamiento es CC BY 4.0 y conviene verificar las obligaciones de atribución.
- **Alucinación**: en TTS se manifiesta como pronunciaciones incorrectas o entonación inadecuada, no como contenido inventado; aun así, requiere revisión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KalenjinAI/kakara
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset ANV Kalenjin: https://huggingface.co/datasets/Anv-ke/Kalenjin
- Receta de entrenamiento kikiri-tts: https://github.com/semidark/kikiri-tts
- ASR de evaluación (whisper-large-v3-turbo-kalenjin): https://huggingface.co/Rekody/whisper-large-v3-turbo-kalenjin
- SpeechMOS (UTMOS): https://github.com/tarepan/SpeechMOS
