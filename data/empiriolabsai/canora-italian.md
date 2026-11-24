# empiriolabsai/canora-italian

## Resumen

Canora Italian es un modelo de síntesis de voz (text-to-speech) en italiano desarrollado por EmpirioLabs. Se trata de un ajuste fino (finetune) del modelo Kokoro-82M de hexgrad, una arquitectura de TTS compacta de 82 millones de parámetros que prioriza eficiencia y velocidad de inferencia frente a modelos generativos de mayor tamaño. El modelo incorpora una única voz femenina denominada `giulia` y está diseñado específicamente para leer correctamente números, fechas, horas y precios según la convención del italiano hablado.

La relevancia del modelo radica en su combinación de tamaño reducido, licencia Apache 2.0 (uso comercial libre) y resultados medidos que superan a las voces italianas de referencia del ecosistema abierto, incluidas las voces `if_sara` e `im_nicola` del propio Kokoro-82M y las voces Piper para italiano. Según las mediciones del autor sobre 200 frases no vistas, Canora Italian alcanza un WER del 2,04% y un UTMOS de 4,31, frente al 2,56% y 4,13 de la mejor alternativa evaluada.

El modelo se distribuye con pesos en PyTorch (`.pth`) y en ONNX en precisión completa, media precisión e int8, lo que permite su despliegue tanto en Python con el paquete estándar `kokoro` como en el navegador mediante transformers.js. El archivo ONNX int8 ocupa 115 MB, lo que lo hace viable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (TTS, arquitectura del modelo base; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (TTS); recomendación de ~500 fonemas por llamada |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión (fp16) e int8 |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), ONNX; voz en `.pt` (`voices/giulia.pt`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Kokoro-82M, un sistema de TTS de 82 millones de parámetros. La información proporcionada no detalla la arquitectura interna (tipo de decoder, mecanismo de atención, etc.) ni los datos de entrenamiento empleados en el ajuste fino: no se especifica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del ajuste sobre el modelo base.

Lo que sí se documenta es el pipeline de inferencia: el texto se convierte a fonemas mediante un módulo `g2p_it.py` incluido en el repositorio, que depende del programa `espeak-ng`. El modelo consume la secuencia de fonemas junto con el embedding de la voz `giulia` y genera audio a 24 kHz. Se recomienda limitar cada llamada a unos 500 fonemas y dividir textos largos en frases para concatenar el audio resultante. El modelo se ejecuta con el paquete estándar `kokoro` sin modificaciones.

## Capacidades

- Síntesis de voz en italiano con una única voz femenina, `giulia`.
- Lectura correcta de números, fechas, horas y precios según la convención del italiano hablado (por ejemplo, "14:35" y "1,50 €").
- Generación de audio a 24 kHz mediante PyTorch o ONNX Runtime.
- Ejecución en navegador mediante transformers.js con los pesos ONNX incluidos.
- Inferencia en CPU con buen rendimiento (hasta 5,0x tiempo real en ONNX int8 sobre 4 hilos de un AMD EPYC 7713).
- No se documentan capacidades de clonación de voz, control de emociones, tool calling ni procesamiento multimodal más allá del TTS.

## Casos de uso

- **Locución de contenidos editoriales en italiano**: el modelo puede narrar artículos, audiolibros o boletines con una voz natural (UTMOS 4,31) y una tasa de error de palabra baja (2,04%), adecuada para publicación sin revisión manual intensiva.
- **Asistentes de voz para atención al cliente**: integrable en pipelines de respuesta de voz en italiano; la lectura correcta de precios y fechas lo hace apto para informar sobre pedidos, horarios o tarifas.
- **Anuncios en transporte público**: lectura de horarios y andenes (por ejemplo, "el tren para Milán sale a las 14:35 del andén 5"), uno de los escenarios de muestra del autor.
- **Síntesis en el navegador sin servidor**: gracias a los pesos ONNX y transformers.js, puede generar voz en aplicaciones web del lado del cliente, reduciendo costes de infraestructura y latencia de red.
- **Sistemas de accesibilidad**: lectura de textos en italiano para usuarios con discapacidad visual, con despliegue ligero en dispositivos de recursos limitados (el archivo int8 ocupa 115 MB).
- **Generación de audio por lotes en CPU**: con un rendimiento de 3,8x a 5,0x tiempo real en CPU, es viable procesar grandes volúmenes de texto sin GPU dedicada.
- **Prototipado de aplicaciones de voz**: al cargarse con el paquete estándar `kokoro` y requerir solo `espeak-ng`, permite iterar rápidamente en demos y pruebas de concepto.

## Benchmarks y rendimiento

Mediciones del autor sobre 200 frases italianas no vistas, con transcripción mediante `openai/whisper-large-v3` y comparación textual (WER, menor es mejor) y UTMOS (naturalidad estimada, 1 a 5, mayor es mejor):

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Italian `giulia` | 2,04% | 4,31 |
| Kokoro-82M `if_sara` | 2,56% | 4,13 |
| Kokoro-82M `im_nicola` | 2,90% | 4,04 |
| Piper `it_IT-serena-medium` | 4,04% | 3,80 |
| Piper `it_IT-serena-high` | 5,13% | 3,87 |
| Piper `it_IT-paola-medium` | 8,21% | 3,50 |
| Piper `it_IT-riccardo-x_low` | 10,16% | 2,84 |

La variante ONNX int8 obtiene 2,04% de WER y UTMOS 3,68 sobre las mismas frases, es decir, mantiene la inteligibilidad pero pierde naturalidad frente a los pesos completos. La identificación de idioma con `whisper-large-v3` da una probabilidad media de 1,00 para italiano en `giulia` y en las demás voces comparadas.

Rendimiento medido sobre 60 frases en 4 hilos de un AMD EPYC 7713 (segundos de audio por segundo de cómputo): PyTorch 3,8x tiempo real, ONNX precisión completa 4,3x, ONNX int8 5,0x.

## Requisitos de hardware

- **VRAM estimada**: no se proporciona una cifra explícita; con 82 millones de parámetros, el modelo en precisión completa ocupa del orden de cientos de MB en memoria, y el archivo ONNX int8 ocupa 115 MB en disco.
- **GPU recomendadas**: no se especifican; el modelo está optimizado para CPU y los benchmarks se realizaron en CPU (AMD EPYC 7713).
- **GPU de consumo**: no se documenta compatibilidad ni rendimiento en GPUs de consumo como RTX 4090; por tamaño, cabría en cualquier GPU con al menos unos pocos GB de memoria, pero no hay datos medidos.
- **Opciones de despliegue**: paquete `kokoro` (PyTorch), ONNX Runtime, transformers.js (navegador). Requiere `espeak-ng` instalado para el módulo de conversión texto-fonema.
- **Latencia y throughput**: 3,8x tiempo real en PyTorch, 4,3x en ONNX fp32 y 5,0x en ONNX int8, medidos en CPU de 4 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER (medido por el autor) | UTMOS | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Canora Italian `giulia` | 82 M | Italiano | 2,04% | 4,31 | Apache 2.0 | Hugging Face |
| Kokoro-82M `if_sara` | 82 M | Italiano | 2,56% | 4,13 | Apache 2.0 (modelo base) | Hugging Face |
| Kokoro-82M `im_nicola` | 82 M | Italiano | 2,90% | 4,04 | Apache 2.0 (modelo base) | Hugging Face |
| Piper `it_IT-serena-medium` | no disponible | Italiano | 4,04% | 3,80 | no disponible en la información | Ecosistema Piper |
| Piper `it_IT-serena-high` | no disponible | Italiano | 5,13% | 3,87 | no disponible en la información | Ecosistema Piper |

## Limitaciones y advertencias

- **Una sola voz**: solo incluye la voz femenina `giulia`; no hay voces masculinas ni variedad de timbres.
- **Un solo idioma**: entrenado exclusivamente para italiano; no se documenta soporte multilingüe.
- **Pérdida de naturalidad en int8**: el UTMOS cae de 4,31 a 3,68 con cuantización int8, aunque el WER se mantiene.
- **Dependencia de `espeak-ng`**: el módulo de conversión texto-fonema requiere este programa externo, lo que añade una dependencia de sistema al despliegue.
- **Longitud de entrada**: se recomienda no superar los ~500 fonemas por llamada; textos largos deben fragmentarse y concatenarse manualmente.
- **Riesgo de alucinación acústica**: no se documentan evaluaciones sobre pronunciación de nombres propios, siglas o términos extranjeros; posibles errores en esos casos no están medidos.
- **Sesgos**: no se proporciona información sobre sesgos de género, acento o variedad dialectal en la voz generada.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Kokoro-82M y de `espeak-ng` en el contexto de producción.
- **Madurez**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026; se trata de un lanzamiento muy reciente sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-italian
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Otros modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
- Muestras de audio: carpeta `samples` del repositorio en Hugging Face
- Resultados (imagen): https://media.empiriolabs.ai/assets/hf/canora-italian/v1/results.png
