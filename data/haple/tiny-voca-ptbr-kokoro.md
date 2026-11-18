# Haple/tiny-voca-ptbr-kokoro

## Resumen

tiny-voca-ptbr-kokoro es un modelo de síntesis de voz (text-to-speech) en portugués de Brasil desarrollado por Haple. Se trata de un port del modelo inglés tiny-voca de Muhammed Nazeem, adaptado al pt-BR mediante un front end específico (normalizador de texto y fonemas eSpeak NG `pt-br`) y entrenado desde cero sobre habla sintética generada por Kokoro-82M como profesor. El modelo ofrece dos voces, una femenina (F) y otra masculina (M), y resuelve el problema de la síntesis de voz offline de bajo coste computacional en portugués brasileño.

La relevancia del modelo reside en su extrema ligereza: 4.535.755 parámetros en un único archivo ONNX de 21,4 MB en float32, que se ejecuta en un solo hilo de CPU a más de 30 veces el tiempo real, sin necesidad de GPU ni de PyTorch. Esto lo hace adecuado para despliegues en dispositivos de recursos limitados, sistemas embebidos o aplicaciones de accesibilidad que requieran TTS local.

La arquitectura y la receta de entrenamiento provienen del proyecto upstream tiny-voca; la novedad de este port es el front end brasileño, un corpus de frases y el uso de Kokoro-82M como profesor. El modelo se distribuye bajo licencia Apache-2.0, con código y pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de tiny-voca (upstream); no se detalla en la informacion disponible |
| Parametros totales | 4.535.755 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | float32 (unico formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model/tiny-voca-ptbr.onnx`) |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Vocabulario de simbolos | 68 simbolos |
| Voces | 2 (femenina F, masculina M) |
| Tamano del archivo | 21,4 MB (float32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de tiny-voca, un modelo TTS compacto de 4,5 millones de parámetros. La información disponible no detalla la topología interna (tipo de transformer, decoder, etc.); únicamente se indica que la arquitectura y la receta de entrenamiento son las del proyecto upstream, con un vocabulario de 68 símbolos adaptado a los fonemas del portugués de Brasil.

El entrenamiento se realizó desde cero sobre habla sintética: Kokoro-82M leyó en voz alta un corpus de 8.945 frases brasileñas, y el modelo estudiante aprendió a imitar esa salida. El front end incluye un normalizador de texto pt-BR que expande números, valores en reales, fechas, horas y teléfonos antes de la síntesis (por ejemplo, "R$ 19,90" se convierte en "dezenove reais e noventa centavos"), y utiliza fonemas eSpeak NG `pt-br`. No se documenta el uso de RLHF ni DPO. En el paso 100.000 del entrenamiento se registró un error medio de tono de 0,66 semitonos frente al profesor en validación, con una ratio de rango melódico de 1,01.

## Capacidades

- Síntesis de voz en portugués de Brasil con dos voces seleccionables (femenina y masculina).
- Normalización de texto pt-BR: expansión de números, importes en reales, fechas, horas y teléfonos a formato hablado.
- Fonemización mediante eSpeak NG `pt-br`, con cobertura de vocales nasales y dígrafos como lh y nh.
- Ejecución offline en CPU sin GPU ni PyTorch, a más de 30 veces el tiempo real en un solo hilo.
- Salida de audio a 24 kHz mono.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente TTS.

## Casos de uso

- Lectura por voz de artículos y noticias en aplicaciones móviles: el modelo cabe en 21,4 MB y se ejecuta en CPU, por lo que puede integrarse en apps sin conexión para leer contenido en pt-BR con dos voces disponibles.
- Accesibilidad para personas con discapacidad visual: la síntesis local y rápida (más de 30 veces el tiempo real) permite leer pantallas y documentos en tiempo real sin depender de servicios en la nube.
- Asistentes de voz embebidos en dispositivos de bajo consumo: al requerir un solo hilo de CPU y no necesitar GPU, es viable en routers, Raspberry Pi u otros dispositivos con recursos limitados.
- Anuncios y avisos automatizados en comercios y transporte: la normalización de horas, precios y fechas permite generar locuciones correctas para paneles y megafonía ("a padaria abre às 6h30").
- Sistemas de lectura de facturas y extractos: la expansión de importes en reales ("R$ 350" como "trezentos e cinquenta reais") facilita la locución de información financiera.
- Generación de audiolibros o pódcasts de bajo coste: el rendimiento de 34,4 veces el tiempo real en un AMD EPYC 9354P permite procesar grandes volúmenes de texto en servidores sin GPU.
- Pruebas y prototipado de interfaces de voz: la licencia Apache-2.0 y el formato ONNX facilitan la integración en pipelines de CI/CD y en aplicaciones comerciales.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de error de palabra (WER), 16 frases nuevas x 2 voces (32 clips) | 1,44 % (F 1,14 %, M 1,74 %) |
| WER, clips de test reservados (8) | 0,0 % (grabaciones del profesor: 0,0 %) |
| WER, clips de validacion (8) | 0,78 % (grabaciones del profesor: 0,78 %) |
| Velocidad, 1 hilo de CPU, maquina de entrenamiento | 31,0x tiempo real con ONNX; 28,6x con PyTorch |
| Velocidad, 1 hilo de CPU, AMD EPYC 9354P | 34,4x tiempo real |
| Error de tono frente al profesor, validacion | 0,66 semitonos; ratio de rango melodico 1,01 |
| Ratio de duracion frente al profesor, test | 1,0155 (el estudiante habla un 1,6 % mas largo) |
| Valoracion de escucha (un oyente, autor) | 4 sobre 5 en ambas voces |

Las cifras de WER proceden de transcripciones con Whisper large-v3-turbo (via faster-whisper) y normalización pt-BR aplicada tanto al texto de referencia como a la transcripción. El autor advierte que los conjuntos son pequeños y que se trata de una comprobación de sanidad, no de un benchmark formal. En una prueba A/B ciega sobre 6 frases contra una variante no publicada, el autor prefirió este modelo 4 veces, con 2 empates.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no se necesita GPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que funciona enteramente en CPU.
- CPU: funciona en un solo hilo; se ha medido en la máquina de entrenamiento y en un AMD EPYC 9354P.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); el repositorio incluye `speak.py` para inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 34,4 veces el tiempo real en un hilo de CPU (AMD EPYC 9354P), es decir, 84,15 segundos de audio generados en 2,44 segundos para 12 clips.
- Memoria: el archivo ONNX ocupa 21,4 MB en float32; no se detalla el consumo de RAM en ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tiny-voca-ptbr-kokoro | 4.535.755 | No disponible | pt-BR | Apache-2.0 | ONNX | 21,4 MB, 2 voces, CPU, 34,4x tiempo real |
| tiny-voca (upstream) | No disponible en la informacion | No disponible | Ingles | No disponible en la informacion | No disponible | Modelo original de Muhammed Nazeem; arquitectura y receta base |
| SemFence/tiny-voca-ptbr | No disponible en la informacion | No disponible | pt-BR | No disponible en la informacion | No disponible | Port independiente realizado en la misma semana, con fonemizador propio, profesor Chatterbox y version de navegador |
| Kokoro-82M | 82 millones | No disponible | Multiples (incluye pt) | No disponible en la informacion | No disponible | Profesor del modelo; mayor tamano y presumiblemente mayor coste computacional |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta portugués de Brasil; no se documenta cobertura de otras variantes del portugués ni de otros idiomas.
- Las evaluaciones de WER se basan en conjuntos pequeños (8 a 32 clips) y el propio autor las califica de comprobación de sanidad, no de benchmark.
- La valoración subjetiva de calidad (4 sobre 5) proviene de un único oyente, el propio autor, por lo que no es representativa.
- Se documentan errores concretos: en la voz masculina se perdió la "à" en "à tarde" y "sabiá" se transcribió como "Xabiá"; en ambas voces "para a manhã" se oyó como "para amanhã" (homófono).
- El reconocedor de voz empleado en la evaluación transcribió una pregunta como afirmación, lo que sugiere posibles limitaciones en la entonación interrogativa.
- El habla se genera un 1,6 % más lenta que la del profesor (ratio de duración 1,0155), lo que puede afectar a la naturalidad en frases largas.
- Al estar entrenado sobre habla sintética de Kokoro-82M, puede heredar sesgos y artefactos del profesor.
- No se documentan sesgos demográficos ni sociolingüísticos específicos; no disponible.
- La licencia Apache-2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento ni sobre las voces.
- No se documenta el riesgo de alucinación en el sentido de contenido inventado, aunque al ser un modelo TTS la fidelidad al texto de entrada es la métrica relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haple/tiny-voca-ptbr-kokoro
- Repositorio de codigo: https://github.com/Haple/tiny-voca-ptbr-kokoro
- Proyecto upstream tiny-voca: https://github.com/n4ze3m/tiny-voca
- Modelo profesor Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Port independiente SemFence/tiny-voca-ptbr: https://github.com/SemFence/tiny-voca-ptbr
- Directorio de evaluacion: https://huggingface.co/Haple/tiny-voca-ptbr-kokoro/tree/main/eval
- Muestras de audio: https://huggingface.co/Haple/tiny-voca-ptbr-kokoro/resolve/main/samples/bom-dia-F.wav (y variantes F/M para "bom-dia" y "conserto")
