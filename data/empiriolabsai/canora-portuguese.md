# empiriolabsai/canora-portuguese

## Resumen
Canora Portuguese es un modelo de síntesis de voz (text-to-speech) especializado en portugués de Brasil, desarrollado por EmpirioLabs. Se trata de un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad, del que hereda la arquitectura y el tamaño: 82 millones de parámetros, una cifra muy reducida que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU y en dispositivos con recursos limitados. El modelo incorpora dos voces, `beatriz` (femenina) y `rafael` (masculina), y se distribuye con pesos ONNX en precisión completa, media e int8.

La relevancia del modelo radica en su enfoque práctico: el autor publica métricas comparativas frente a las voces en portugués del propio Kokoro-82M y frente a varias voces de Piper, midiendo la tasa de error de palabra (WER) tras transcripción con Whisper large-v3 y la naturalidad estimada con UTMOS. Según esos datos, Canora Portuguese obtiene los mejores valores de naturalidad de la comparativa y un WER a la altura de la mejor voz de Kokoro, con un tamaño de fichero int8 de solo 115 MB.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que junto con su formato ONNX y su compatibilidad con transformers.js lo convierte en una opción atractiva para integrar síntesis de voz en portugués de Brasil dentro de aplicaciones web y servicios en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (modelo TTS basado en StyleTTS 2, segun el tag `style_text_to_speech_2`) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión (half) e int8; pesos PyTorch |
| Idiomas soportados | Portugués (pt), con foco en portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors/PyTorch, ONNX (full, half, int8); compatible con transformers.js |

## Arquitectura y entrenamiento
Canora Portuguese es un ajuste fino de hexgrad/Kokoro-82M, un modelo de síntesis de voz de 82 millones de parámetros cuya arquitectura se corresponde con la familia StyleTTS 2 (así lo indica el tag `style_text_to_speech_2` de Hugging Face). El modelo base emplea un pipeline de texto a fonemas seguido de un modelo acústico con estilización, y se carga mediante el paquete estándar `kokoro` de Python. El repositorio incluye además un módulo de texto a fonemas en un único fichero que invoca `espeak-ng`.

No se dispone de información detallada sobre el corpus de entrenamiento del ajuste fino: la model card no especifica el número de horas de audio, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). Sí se documenta que el modelo maneja correctamente números, fechas, horas y precios con la pronunciación habitual de un hablante brasileño, lo que sugiere un trabajo específico de normalización textual en el pipeline de fonemización.

La innovación principal no está en la arquitectura, heredada íntegramente de Kokoro-82M, sino en la adaptación al portugués de Brasil con dos voces y en la publicación de pesos ONNX en tres precisiones, pensados para ONNX Runtime y transformers.js. El modelo incluye pesos en precisión completa, media e int8, lo que facilita el despliegue tanto en servidor como en navegador.

## Capacidades
- Síntesis de voz en portugués de Brasil con dos voces diferenciadas: `beatriz` (femenina) y `rafael` (masculina).
- Lectura correcta de números, fechas, horas y precios según la convención del portugués brasileño.
- Generación de audio a partir de texto con el paquete estándar `kokoro` de Python.
- Inferencia mediante ONNX Runtime en precisión completa, media e int8.
- Ejecución en navegador mediante transformers.js gracias a los pesos ONNX publicados.
- Identificación robusta como portugués por parte de Whisper large-v3, con probabilidad media de 0,99 o superior en todas las voces evaluadas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es un modelo exclusivamente de texto a voz.

## Casos de uso
- Audiolibros y lectura asistida: el modelo puede convertir textos largos en audio en portugués de Brasil con una velocidad de 2,5 a 3,2 veces tiempo real según el backend, lo que permite procesar volúmenes considerables en servidores modestos.
- Asistentes de voz para atención al cliente: con dos voces disponibles y una latencia baja derivada de sus 82 millones de parámetros, puede integrarse en sistemas de respuesta interactiva que necesiten síntesis en tiempo casi real.
- Accesibilidad web: los pesos ONNX y la compatibilidad con transformers.js permiten ejecutar la síntesis directamente en el navegador, sin enviar el texto a un servidor, para lectores de pantalla y funciones de lectura en voz alta.
- Locución de contenidos para marketing y medios: la naturalidad medida (UTMOS 4,19 para `beatriz` y 4,04 para `rafael`) y la corrección en la lectura de precios y fechas lo hacen adecuado para anuncios, promociones y boletines de noticias.
- Sistemas de megafonía y transporte público: la lectura correcta de horas y plataformas (por ejemplo, "às 14h35 da plataforma 5") encaja en anuncios automatizados de estaciones y aeropuertos.
- Prototipado y demos de aplicaciones de voz: el tamaño reducido (115 MB en int8) y la licencia Apache 2.0 permiten incluirlo en entornos de desarrollo y pruebas sin coste de licencia ni infraestructura GPU.
- Generación de voces para vídeos y pódcast en portugués de Brasil: la disponibilidad de dos timbres permite alternar narradores en un mismo proyecto con una única dependencia.

## Benchmarks y rendimiento
Datos publicados por EmpirioLabs el 2026-11-24 sobre 200 frases en portugués no vistas durante el entrenamiento. La transcripción se realizó con `openai/whisper-large-v3` y el WER compara la transcripción con el texto original (menor es mejor). UTMOS estima la naturalidad en una escala de 1 a 5 (mayor es mejor).

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Portuguese `beatriz` | 2,97% | 4,19 |
| Canora Portuguese `rafael` | 3,43% | 4,04 |
| Kokoro-82M `pf_dora` | 2,97% | 3,73 |
| Kokoro-82M `pm_alex` | 3,14% | 3,51 |
| Kokoro-82M `pm_santa` | 4,42% | 3,03 |
| Piper `pt_BR-cadu-medium` | 5,30% | 3,81 |
| Piper `pt_BR-faber-medium` | 6,99% | 3,43 |
| Piper `pt_BR-edresson-low` | 11,93% | 2,84 |
| Piper `pt_BR-jeff-medium` | 15,72% | 2,43 |

Con los pesos int8, el mismo conjunto de frases arroja para `beatriz` un WER de 3,26% y UTMOS de 3,43, y para `rafael` un WER de 3,38% y UTMOS de 3,33.

En identificación de idioma, la probabilidad media de portugués según Whisper large-v3 es de 0,99 para `beatriz` y `rafael`, y de entre 0,99 y 1,00 para las voces comparadas.

En velocidad, medida sobre 60 frases con 4 hilos de un AMD EPYC 7713 de 64 núcleos, se obtienen 2,5 veces tiempo real con PyTorch, 2,8 veces con ONNX en precisión completa y 3,2 veces con ONNX int8.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 82 millones de parámetros, los pesos en precisión completa ocupan del orden de 330 MB y el fichero ONNX int8 es de 115 MB, por lo que la huella de memoria es muy reducida.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse también en CPU. Cualquier GPU consumer reciente (por ejemplo, RTX 4090 o inferiores) dispone de memoria más que suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: paquete `kokoro` de Python con PyTorch, ONNX Runtime (precisión completa, half e int8) y transformers.js para navegador. Requiere `espeak-ng` instalado en el sistema para el módulo de texto a fonemas.
- Latencia y throughput: 2,5 veces tiempo real con PyTorch, 2,8 con ONNX full y 3,2 con ONNX int8, medidos en 4 hilos de un AMD EPYC 7713. El rendimiento depende del procesador y del número de hilos; según el autor, al compartir arquitectura con Kokoro-82M iguala a este en la misma máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (pt-BR) | UTMOS | Licencia | Formatos |
|---|---|---:|---:|---:|---|---|
| Canora Portuguese | 82 M | pt-BR | 2,97% (`beatriz`) / 3,43% (`rafael`) | 4,19 / 4,04 | Apache 2.0 | PyTorch, ONNX (full, half, int8) |
| Kokoro-82M (`pf_dora`, `pm_alex`, `pm_santa`) | 82 M | múltiples, incl. pt | 2,97% / 3,14% / 4,42% | 3,73 / 3,51 / 3,03 | Apache 2.0 | PyTorch, ONNX |
| Piper `pt_BR-cadu-medium` | no disponible | pt-BR | 5,30% | 3,81 | no disponible en la información | no disponible |
| Piper `pt_BR-faber-medium` | no disponible | pt-BR | 6,99% | 3,43 | no disponible en la información | no disponible |

Frente a las voces en portugués de Kokoro-82M, Canora mejora la naturalidad de forma clara (UTMOS 4,19 frente al máximo de 3,73) manteniendo un WER equivalente al mejor de ellas. Frente a Piper, la ventaja en WER es notable en todas las voces comparadas y la naturalidad supera a la mejor de Piper (3,81).

## Limitaciones y advertencias
- Solo cubre portugués de Brasil; no se documenta soporte para portugués europeo ni para otros idiomas.
- Solo dispone de dos voces (`beatriz` y `rafael`); no se documenta clonación de voz ni control fino de prosodia o emoción.
- La cuantización int8 degrada la calidad de forma medible: el UTMOS cae de 4,19 a 3,43 en `beatriz` y de 4,04 a 3,33 en `rafael`, con un aumento del WER de aproximadamente 0,3 puntos en `beatriz`.
- Las métricas publicadas (WER y UTMOS) proceden del propio autor y se basan en 200 frases; no se dispone de evaluaciones independientes.
- No se documentan sesgos demográficos, acentos regionales cubiertos ni comportamiento ante texto con ruido, abreviaturas no convencionales o código mixto.
- Requiere `espeak-ng` instalado en el sistema para la fonemización, lo que añade una dependencia externa en el despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Kokoro-82M conserva su propia licencia, que conviene verificar para el uso previsto.
- No se han publicado resultados de benchmarks de razonamiento, código o matemáticas porque el modelo no realiza esas tareas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/canora-portuguese
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Web de EmpirioLabs: https://empiriolabs.ai
- Todos los modelos de EmpirioLabs: https://huggingface.co/empiriolabsai
- Plataforma de EmpirioLabs: https://platform.empiriolabs.ai
- Discord de EmpirioLabs: https://discord.gg/bM52azW4ZD
- Gráfico de resultados: https://media.empiriolabs.ai/assets/hf/canora-portuguese/v1/results.png
