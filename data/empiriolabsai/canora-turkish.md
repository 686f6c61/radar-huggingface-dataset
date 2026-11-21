# empiriolabsai/canora-turkish

## Resumen

Canora Turkish es un modelo de síntesis de voz (text-to-speech) especializado en turco, desarrollado por EmpirioLabs como un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad. El modelo convierte texto turco en audio inteligible con dos voces predefinidas: `elif` (femenina) y `emre` (masculina). Su relevancia radica en que cubre un hueco importante: la síntesis de voz de calidad en turco con licencia permisiva (Apache 2.0), superando en métricas objetivas a alternativas establecidas como la voz turca de Piper.

Arquitectónicamente hereda el diseño de Kokoro-82M: un modelo compacto de 82 millones de parámetros, lo que lo hace extremadamente ligero y rápido (del orden de 3,6x a 4,6x tiempo real según el backend). Se distribuye con pesos en PyTorch (`.pth`) y en formato ONNX en precisión completa, media e int8, lo que permite ejecución en CPU, GPU y entornos web mediante transformers.js.

El modelo está pensado para integración en producción: se carga con el paquete estándar `kokoro` de Python, incluye un módulo de conversión texto-a-fonema específico para turco (`g2p_tr.py`) y maneja correctamente números, fechas, horas y precios tal como los pronuncia un hablante nativo. Su tamaño reducido y su licencia Apache 2.0 lo convierten en una opción atractiva para despliegues comerciales sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS2, según tag `style_text_to_speech_2`) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa fonemas; se recomienda ~500 fonemas por llamada) |
| Tipos de cuantizacion | PyTorch (`.pth`), ONNX precisión completa, ONNX media precisión (fp16), ONNX int8 |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch), `.onnx` (ONNX Runtime y transformers.js) |

## Arquitectura y entrenamiento

Canora Turkish es un ajuste fino de Kokoro-82M, un modelo de síntesis de voz de 82 millones de parámetros basado en la familia StyleTTS2. Kokoro combina un codificador de estilo con un decodificador neuronal para generar audio a 24 kHz a partir de secuencias de fonemas. El modelo original es conocido por su relación calidad/tamaño excepcional, y este finetune adapta el sistema al inventario fonético y prosódico del turco.

Los detalles concretos del entrenamiento (número de tokens, composición del dataset, horas de audio, uso de RLHF o DPO) no están disponibles en la información proporcionada. El autor sí documenta que el modelo incluye un módulo de conversión texto-a-fonema específico para turco (`g2p_tr.py`) que depende de `espeak-ng`, y que se ha trabajado explícitamente la verbalización de números, fechas, horas y precios. No se documentan innovaciones técnicas adicionales más allá de las heredadas de Kokoro.

## Capacidades

- Síntesis de voz en turco a partir de texto, con dos voces: `elif` (femenina) y `emre` (masculina).
- Verbalización correcta de números, fechas, horas y precios (p. ej. "14:35", "85 TL", "12 Mart 2025").
- Conversión texto-a-fonema específica para turco mediante el módulo `g2p_tr.py`.
- Ejecución en PyTorch y ONNX Runtime, con pesos ONNX en fp32, fp16 e int8.
- Compatibilidad con transformers.js para inferencia en navegador o Node.js.
- Control de velocidad de habla mediante el tercer argumento de la llamada al modelo (1.0 = normal).
- Salida de audio a 24 kHz.
- No soporta tool calling, agentes, razonamiento multi-step ni otras capacidades de LLM: es exclusivamente un modelo TTS.

## Casos de uso

- **Atención al cliente automatizada por voz:** el modelo puede sintetizar respuestas en turco para IVR o asistentes telefónicos. Su velocidad (hasta 4,6x tiempo real en ONNX int8) permite generar respuestas en tiempo real en CPU sin necesidad de GPU.
- **Lectura de notificaciones y alertas:** su manejo nativo de fechas, horas y precios lo hace idóneo para leer recordatorios de citas, alertas de precios o avisos de transporte ("Ankara treni saat 14:35'te...") sin preprocesado adicional.
- **Audiolibros y contenido largo:** al ser un modelo ligero, se puede segmentar texto largo en frases, sintetizar cada una y concatenar el audio, permitiendo generar horas de narración en turco con coste computacional bajo.
- **Accesibilidad web:** integrable vía transformers.js para leer contenido de páginas web en turco directamente en el navegador del usuario, sin enviar texto a servidores externos (privacidad y latencia mínima).
- **Locución para vídeos y pódcasts:** generación de voces en off masculinas o femeninas para contenido en turco, con control de velocidad para ajustar la duración de la locución al metraje.
- **Sistemas embebidos y edge computing:** el archivo ONNX int8 de 115 MB cabe en dispositivos con recursos limitados (Raspberry Pi, routers, cajas TV), permitiendo TTS local sin conexión.
- **Prototipado rápido de asistentes conversacionales:** al cargarse con el paquete estándar `kokoro`, se integra en pipelines de Python existentes con pocas líneas de código, facilitando pruebas de concepto de asistentes de voz en turco.

## Benchmarks y rendimiento

Resultados medidos por EmpirioLabs el 2026-11-20 sobre 200 frases turcas no vistas, transcritas con `openai/whisper-large-v3` para calcular WER y evaluadas con UTMOS (escala 1-5, mayor es mejor):

| Sistema | WER | UTMOS |
|---|---:|---:|
| **Canora Turkish `elif`** | **3,44%** | **4,24** |
| **Canora Turkish `emre`** | 3,89% | 4,04 |
| Piper `tr_TR-dfki-medium` | 8,18% | 3,60 |

Resultados con el archivo ONNX int8 sobre las mismas frases:

| Sistema (int8) | WER | UTMOS |
|---|---:|---:|
| Canora Turkish `elif` | 3,44% | 3,59 |
| Canora Turkish `emre` | 4,01% | 3,46 |

Velocidad medida sobre 60 frases en 4 hilos de un AMD EPYC 7J13 (segundos de audio por segundo de cómputo):

| Backend | Velocidad |
|---|---:|
| PyTorch | 3,6x tiempo real |
| ONNX precisión completa | 4,2x tiempo real |
| ONNX int8 | 4,6x tiempo real |

## Requisitos de hardware

- **VRAM estimada para inferencia:** al tratarse de un modelo de 82M de parámetros, cabe holgadamente en cualquier GPU consumer. En fp32 ocupa aproximadamente 0,33 GB de pesos; en int8, unos 82 MB (el archivo ONNX int8 pesa 115 MB).
- **GPU recomendadas:** cualquier GPU moderna sirve; no requiere A100 ni H100. Funciona bien en RTX 3060, RTX 4090, e incluso en GPUs integradas.
- **CPU:** el modelo está diseñado para funcionar en CPU con buen rendimiento (3,6x tiempo real en PyTorch con 4 hilos de un EPYC). Cabe en Raspberry Pi y dispositivos similares.
- **Opciones de despliegue:** PyTorch (paquete `kokoro`), ONNX Runtime (fp32, fp16, int8), transformers.js para navegador/Node.js. Requiere `espeak-ng` instalado en el sistema para la conversión texto-a-fonema.
- **Latencia y throughput:** 3,6x tiempo real en PyTorch, 4,2x en ONNX fp32 y 4,6x en ONNX int8, medido en CPU de servidor con 4 hilos. La latencia depende del procesador y del número de hilos; la arquitectura es la de Kokoro-82M, por lo que iguala a este en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (turco) | UTMOS | Licencia | Formatos |
|---|---|---:|---:|---:|---|---|
| **Canora Turkish** | 82M | Turco | 3,44% (`elif`) / 3,89% (`emre`) | 4,24 / 4,04 | Apache 2.0 | PyTorch, ONNX (fp32/fp16/int8) |
| Piper `tr_TR-dfki-medium` | no disponible | Turco | 8,18% | 3,60 | no disponible en la información | no disponible en la información |
| Kokoro-82M (base) | 82M | Multilingüe (incluye otros idiomas) | no evaluado en turco en la información | no disponible | Apache 2.0 | PyTorch, ONNX |

La comparativa directa disponible se limita a Piper `tr_TR-dfki-medium`, sobre el que Canora Turkish obtiene un WER menos de la mitad (3,44% frente a 8,18%) y un UTMOS notablemente superior (4,24 frente a 3,60). No se dispone de datos comparativos frente a otros sistemas TTS turcos en la información proporcionada.

## Limitaciones y advertencias

- **Solo turco:** el modelo está entrenado exclusivamente para turco; no sintetiza otros idiomas correctamente.
- **Dos voces fijas:** únicamente `elif` y `emre`; no hay clonación de voz ni voces adicionales documentadas.
- **Riesgo de alucinación en la verbalización:** aunque maneja números, fechas y precios, textos ambiguos o formatos no convencionales pueden verbalizarse de forma incorrecta; conviene revisar la salida en producción.
- **Límite práctico de longitud:** se recomienda mantener cada llamada en torno a 500 fonemas y segmentar textos largos en frases, lo que puede introducir discontinuidades prosódicas en las uniones.
- **Dependencia externa:** requiere `espeak-ng` instalado en el sistema para el módulo de texto-a-fonema, lo que complica despliegues en entornos minimalistas o serverless.
- **Cuantización int8:** reduce la naturalidad (UTMOS baja de 4,24 a 3,59 en `elif`), aunque mantiene el WER; evaluar el equilibrio calidad/recursos según el caso de uso.
- **Licencia Apache 2.0:** permite uso comercial sin restricciones adicionales, pero se recomienda conservar la atribución y revisar las licencias de las dependencias (`kokoro`, `espeak-ng`).
- **Sesgos:** no se documentan análisis de sesgos demográficos o dialectales; las dos voces representan un turco estándar y pueden no cubrir variantes regionales.
- **Madurez:** el modelo es reciente (creado en noviembre de 2026) y cuenta con pocas descargas (25) y ningún "like", por lo que la validación comunitaria es aún escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-turkish
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Todos los modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
- Repositorio de espeak-ng (dependencia): https://github.com/espeak-ng/espeak-ng
- Paquete `kokoro` en Python: no disponible enlace directo en la información
