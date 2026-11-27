# empiriolabsai/canora-turkish

## Resumen

Canora Turkish es un modelo de síntesis de voz (text-to-speech) especializado en turco, desarrollado por EmpirioLabs. Se trata de un fine-tuning de Kokoro-82M, el conocido modelo TTS de código abierto de hexgrad, adaptado específicamente para el idioma turco. El modelo ofrece dos voces predefinidas, `elif` (femenina) y `emre` (masculina), y está diseñado para integrarse en el ecosistema estándar de Kokoro mediante el paquete Python `kokoro`.

Con 82 millones de parámetros, Canora Turkish hereda la arquitectura y la eficiencia computacional de Kokoro-82M, lo que lo convierte en una opción ligera para despliegue en producción, incluyendo entornos con recursos limitados. El modelo incluye pesos en formato ONNX (precisión completa, media precisión e int8), lo que facilita su uso con ONNX Runtime y transformers.js, permitiendo inferencia tanto en servidor como en navegador.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en sus métricas de calidad reportadas: un WER del 3,44% para la voz `elif` y 3,89% para `emre` en 200 frases turcas no vistas durante el entrenamiento, superando a la voz turca de Piper (`tr_TR-dfki-medium`) según las mediciones del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS 2, según tag `style_text_to_speech_2`) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendación: ~500 fonemas por llamada) |
| Tipos de cuantizacion | ONNX full precision, ONNX half precision, ONNX int8 (115 MB el archivo int8) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth), ONNX (full, half, int8), voces en .pt |

## Arquitectura y entrenamiento

Canora Turkish es un fine-tuning de `hexgrad/Kokoro-82M`, un modelo TTS de 82 millones de parámetros basado en la arquitectura StyleTTS 2 (indicado por el tag `style_text_to_speech_2`). Kokoro-82M es conocido por su relación calidad-tamaño y por su capacidad de generar voz natural con un coste computacional muy bajo. El fine-tuning se realizó sobre el checkpoint base para adaptarlo al turco, incluyendo un módulo específico de conversión de texto a fonemas (`g2p_tr.py`) que el autor distribuye junto con los pesos.

El modelo utiliza `espeak-ng` como dependencia externa para la conversión grafema-fonema, y el pipeline requiere pasar los fonemas resultantes junto con un vector de voz al modelo `KModel` del paquete `kokoro`. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset turco utilizado ni si se aplicaron técnicas de RLHF o DPO. El autor reporta que el modelo maneja correctamente números, fechas, horas y precios según la forma en que un hablante nativo de turco los pronunciaría.

## Capacidades

- Síntesis de voz en turco con dos voces: `elif` (femenina) y `emre` (masculina).
- Lectura correcta de números, fechas, horas y precios en formato turco (por ejemplo, "14:35" o "85 TL").
- Generación de audio a 24 kHz (según el ejemplo de código, `sf.write("speech.wav", audio.numpy(), 24000)`).
- Control de velocidad de habla mediante el tercer argumento de `model(...)` (1.0 = velocidad normal).
- Inferencia en PyTorch, ONNX Runtime y transformers.js (navegador).
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento multimodal (visión o audio de entrada).
- Capacidad multilingüe limitada al turco; no se indica soporte para otros idiomas.

## Casos de uso

- **Atención al cliente automatizada en turco**: el modelo puede generar respuestas de voz para sistemas IVR o asistentes telefónicos en turco, con dos voces disponibles para alternar según el contexto o el género percibido del interlocutor. Su tamaño reducido (82 M de parámetros) permite desplegarlo en servidores modestos.
- **Lectura de notificaciones y alertas**: integración en aplicaciones móviles o de escritorio para leer en voz alta notificaciones, correos o mensajes, incluyendo fechas y horas ("Ankara treni saat 14:35'te..."), gracias al manejo específico de formatos numéricos turcos.
- **Accesibilidad para personas con discapacidad visual**: generación de audio para lectores de pantalla en turco, con la ventaja de que el modelo int8 (115 MB) puede ejecutarse en dispositivos con recursos limitados o incluso en el navegador vía transformers.js.
- **Generación de audiolibros y contenido educativo**: síntesis de texto largo dividiendo el contenido en fragmentos de aproximadamente 500 fonemas y concatenando el audio resultante, con control de velocidad para adaptarse a distintos públicos.
- **Locución automatizada para vídeos y pódcast**: producción de voces en off en turco para contenido pregrabado, con dos timbres disponibles para narraciones o diálogos.
- **Sistemas de navegación y transporte**: lectura de indicaciones de ruta, horarios de trenes y precios de billetes en turco, aprovechando la correcta pronunciación de horas y cantidades monetarias.
- **Prototipado rápido de interfaces de voz**: al cargarse con el paquete estándar `kokoro` y ofrecer pesos ONNX, permite validar conceptos de producto de voz en turco sin infraestructura dedicada.

## Benchmarks y rendimiento

Datos reportados por EmpirioLabs, medidos el 2026-11-20 sobre 200 frases turcas no vistas durante el entrenamiento. La transcripción se realizó con `openai/whisper-large-v3` y se comparó con el texto original (WER, menor es mejor). UTMOS es una estimación automática de naturalidad en escala de 1 a 5 (mayor es mejor).

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Turkish `elif` | 3,44% | 4,24 |
| Canora Turkish `emre` | 3,89% | 4,04 |
| Piper `tr_TR-dfki-medium` | 8,18% | 3,60 |

Rendimiento del archivo int8 ONNX sobre las mismas frases: `elif` 3,44% WER y UTMOS 3,59; `emre` 4,01% WER y UTMOS 3,46.

Velocidad medida sobre 60 frases con 4 hilos de un AMD EPYC 7J13 (segundos de audio por segundo de cómputo): PyTorch 3,6x tiempo real, ONNX precisión completa 4,2x, ONNX int8 4,6x.

## Requisitos de hardware

- **VRAM estimada**: no se especifica; con 82 M de parámetros, el modelo en fp32 ocupa aproximadamente 330 MB, y el archivo ONNX int8 es de 115 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100 ni H100. Funciona en CPU sin problemas (las mediciones de velocidad se hicieron en CPU AMD EPYC).
- **GPU consumer**: sí, cabe en cualquier RTX (incluso series 20xx o inferiores) y en iGPU con suficiente memoria compartida.
- **Opciones de despliegue**: PyTorch con el paquete `kokoro`, ONNX Runtime, transformers.js (navegador). Requiere `espeak-ng` instalado en el sistema para la conversión texto-fonema.
- **Latencia y throughput**: 3,6x tiempo real en PyTorch, 4,2x en ONNX full precision y 4,6x en ONNX int8 sobre 4 hilos de CPU AMD EPYC 7J13. El rendimiento depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Licencia | WER (turco) | UTMOS | Formatos |
|---|---|---:|---|---:|---:|---|
| Canora Turkish | 82 M | tr | Apache 2.0 | 3,44% (`elif`) / 3,89% (`emre`) | 4,24 / 4,04 | PyTorch, ONNX |
| Piper `tr_TR-dfki-medium` | no disponible | tr | no disponible | 8,18% | 3,60 | no disponible |
| Kokoro-82M (base) | 82 M | multilingüe (no tr específico) | Apache 2.0 | no disponible | no disponible | PyTorch, ONNX |

La comparación directa con Piper se basa en las mediciones del propio autor de Canora Turkish; no se dispone de una evaluación independiente. Kokoro-82M es el modelo base y comparte arquitectura y tamaño, pero no está especializado en turco.

## Limitaciones y advertencias

- **Idioma único**: solo soporta turco; no se ha validado para otros idiomas y no se declara capacidad multilingüe.
- **Dos voces fijas**: únicamente `elif` y `emre`; no se documenta clonación de voz ni voces adicionales.
- **Riesgo de alucinación acústica**: como todo modelo TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o extranjerismos no cubiertos por el módulo G2P.
- **Dependencia de `espeak-ng`**: el pipeline requiere esta herramienta externa instalada en el sistema, lo que añade complejidad al despliegue (especialmente en contenedores o entornos serverless).
- **Longitud limitada por llamada**: el autor recomienda mantener cada llamada en torno a 500 fonemas y dividir textos largos en frases, lo que requiere lógica de segmentación y concatenación de audio en producción.
- **Evaluación no independiente**: los benchmarks (WER, UTMOS) han sido medidos por el propio autor; no se han publicado evaluaciones de terceros.
- **Sesgos**: no se documentan sesgos específicos de las voces ni de los datos de entrenamiento; al ser un fine-tuning sobre Kokoro-82M, podría heredar sesgos del modelo base.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las obligaciones de atribución y las dependencias (`espeak-ng`, `kokoro`) en el contexto de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/empiriolabsai/canora-turkish)
- [Modelo base Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/empiriolabsai/canora-text-to-speech)
- [Sitio web de EmpirioLabs](https://empiriolabs.ai)
- [Plataforma de EmpirioLabs](https://platform.empiriolabs.ai)
- [Todos los modelos de EmpirioLabs](https://huggingface.co/empiriolabsai)
- [Discord de EmpirioLabs](https://discord.gg/bM52azW4ZD)
