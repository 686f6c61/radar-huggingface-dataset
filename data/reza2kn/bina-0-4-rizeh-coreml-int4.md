# Reza2kn/Bina-0.4-Rizeh-CoreML-INT4

## Resumen

Bina-0.4-Rizeh-CoreML-INT4 es una conversión cuantizada a 4 bits (INT4) del modelo Bina-0.4-Rizeh, un sistema OCR especializado en transcripción de documentos en persa/farsi desarrollado por Reza2kn. Se trata de un artefacto derivado del release final del modelo base, fijado en el commit `51b8c314b0552b1884c1f0e28016cb12a143f637`, que empaqueta los cinco componentes lectores (body95k, etiquetas cortas, impreso, numérico/matemático y escaneos degradados) junto con tres detectores experimentales.

A diferencia del modelo base, que emplea pesos en precisión nativa, esta versión utiliza cuantización de pesos mixta a 4 bits con bloques de 16, orientada a su ejecución en CoreML sobre hardware Apple (M2 en validación, requisito de iOS 18 / macOS 15). El objetivo es reducir el tamaño del repositorio hasta 0,2 GB y habilitar inferencia local en dispositivos Apple, manteniendo una paridad de caracteres mínima del 98,466 % en el bucket más bajo de las canaries de desarrollo.

Es relevante ahora porque representa un intento temprano de llevar un pipeline OCR persa completo a cuantización INT4 con CoreML, aunque el propio autor advierte que el bundle no supera la puerta de transcripción de página completa del 98 % y no es un reemplazo directo de la pipeline de producción. La licencia es restrictiva (CC BY-NC 4.0 para los pesos del reconocedor, términos Surya para los detectores) y no permite uso comercial sin autorización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC reader components (reconocedor) + detectores experimentales; pipeline basada en Surya para layout/orden |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa líneas de texto, anchos de 8 a 8192 px) |
| Tipos de cuantizacion | INT4 con bloque 16 (W4/block16), pesos mixtos; operaciones en punto flotante donde se requiere |
| Idiomas soportados | persa/farsi (fa); rutas para inglés, matemáticas/Markdown y tablas mediante prompts de tarea |
| Licencia | bina-0.4-rizeh (otros); pesos del reconocedor bajo CC BY-NC 4.0; componentes Surya bajo sus términos upstream |
| Formato de pesos | CoreML ML Program (paquetes `.mlpackage`); safetensors agregado para verificación |
| Altura de entrada | 64 px (mapas de tinta float32, negro=1, papel=0) |
| Margenes | 20 % vertical, 30 % horizontal medidos en altura de línea original |
| Batch | 1 a 8 |
| Ancho de entrada | 8 a 8192 px |
| Requisito de sistema | iOS 18 / macOS 15 o superior |

## Arquitectura y entrenamiento

El modelo base Bina-0.4-Rizeh es un sistema OCR basado en componentes CTC (Connectionist Temporal Classification) para reconocimiento de líneas de texto, complementado con detectores de línea y un pipeline de layout/orden derivado de Surya. La conversión a CoreML mantiene la arquitectura original pero aplica cuantización de pesos mixta a 4 bits con bloques de 16, reteniendo operaciones en punto flotante donde la cuantización degradaría en exceso la precisión. Los cinco lectores incluidos cubren distintos dominios: body95k, etiquetas cortas, texto impreso, numérico/matemático y escaneos degradados.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que se generaron baselines frescos sin comprimir en PyTorch 2.10 CUDA para cada checkpoint publicado, usando 300 recortes internos congelados (50 por cada categoría: inglés, manuscrito, mixto, periódico, impreso, sintético), y que se exige al menos un 98 % de paridad de caracteres en cada bucket. La innovación técnica principal es la conversión a CoreML con cuantización INT4 y la preservación de la geometría de recorte, enrutamiento y decodificación del pipeline original, incluyendo una partición de la caché de relectura de geometría por backend/hash de pesos para evitar reutilización cruzada entre modelos.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de líneas de texto en persa/farsi con conversión visual-a-lógica RTL.
- Transcripción de documentos impresos, manuscritos, periódicos, escaneos degradados y texto sintético (cinco lectores especializados).
- Procesamiento de rutas para inglés, matemáticas/Markdown y tablas mediante prompts de tarea específicos.
- Detección de líneas de texto mediante tres detectores experimentales: detector principal combinado 1000, guarda de línea rule-C 500 y detector/cabeza para impreso.
- Inferencia por lotes (batch 1 a 8) con anchos de entrada de 8 a 8192 px y altura fija de 64 px.
- Sesiones persistentes y caché exacta de entradas acotada.
- No se menciona soporte de tool calling, function calling, agentes ni multi-step reasoning.
- No se menciona soporte de visión más allá del OCR ni capacidades de audio.

## Casos de uso

- Digitalización de documentos persas en dispositivos Apple: el modelo puede ejecutarse localmente en un Mac con M2 o en iOS 18, transcribiendo líneas de texto sin enviar datos a la nube, gracias a su formato CoreML y tamaño reducido (0,2 GB).
- Extracción de texto de escaneos degradados: el lector especializado en escaneos degradados permite recuperar texto de documentos de baja calidad, útil en archivos históricos o digitalizaciones antiguas.
- Procesamiento de manuscritos persas: el lector entrenado con datos manuscritos facilita la transcripción de notas y documentos escritos a mano, con conversión RTL correcta.
- OCR de etiquetas cortas: el lector de etiquetas está optimizado para textos breves, como nombres en sobres, etiquetas de productos o señalética.
- Reconocimiento de expresiones numéricas y matemáticas: la ruta numérico/matemática permite extraer fórmulas y números de documentos técnicos o académicos.
- Preprocesamiento para pipelines de NLP en persa: el texto extraído puede alimentar sistemas de búsqueda, resumen o traducción, con la ventaja de que el modelo es ligero y ejecutable en local.
- Integración en aplicaciones iOS de accesibilidad: personas con discapacidad visual podrían usar el modelo para leer documentos en persa directamente desde el dispositivo, sin conexión.

## Benchmarks y rendimiento

| Runtime | Componentes lectores | Paridad de caracteres mínima por bucket |
|---|---:|---:|
| coreml-w4-block16 | 5/5 | 98,466 % |

Estos resultados corresponden a canaries de desarrollo sobre 300 recortes internos congelados (50 por categoría: inglés, manuscrito, mixto, periódico, impreso, sintético), no a precisión en held-out ni certificación de página completa. El autor indica que el bundle no supera la puerta de transcripción de página completa del 98 % y que una muestra pública de tablas manuscritas expuso un fallo: la pipeline puramente W4 cambió sustancialmente la salida aunque las canaries de línea pasaran. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está orientado a CoreML en hardware Apple, no a GPU NVIDIA.
- GPU recomendadas: no aplica para CoreML; validado en un Mac con chip M2. No se probó hardware iOS.
- Cabe en consumer GPU: no aplica; el destino son dispositivos Apple (Mac con M2 o superior, iPhone/iPad con iOS 18).
- Opciones de despliegue: CoreML ML Program (CPU_AND_GPU). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. Se probó LiteRT en Linux CPU sin dispositivo Android. No se probó Windows nativo.
- Latencia y throughput: los tiempos en Mac se recogieron durante trabajo concurrente de conversión/navegador y no son rankings de velocidad controlados. Los resultados en Linux CPU/CUDA son específicos del host. No se proporcionan cifras concretas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bina-0.4-Rizeh-CoreML-INT4 | no disponible | no disponible | 98,466 % paridad mínima en canaries de línea | bina-0.4-rizeh (CC BY-NC 4.0 para reconocedor) | Hugging Face, CoreML |
| Bina-0.4-Koochik | 630.800.496 | no disponible | no disponible | no disponible | Hugging Face |
| Bina-0.4-Koochik-CoreML-INT4 | 630.800.496 | no disponible | no disponible | no disponible | Hugging Face |

Bina-0.4-Koochik es un modelo OCR derivado de NVIDIA Nemotron-3.5-Parse con backbone visual C-RADIOv4-SO400M y decodificador autorregresivo, también para transcripción de documentos persas. Su versión CoreML-INT4 es una derivada calibrada a 4 bits con checkpoint 18.404, que mantiene la arquitectura y los parámetros. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El bundle no supera la puerta de transcripción de página completa del 98 %; no es un reemplazo directo de la pipeline de producción.
- Una muestra pública de tablas manuscritas expuso un fallo: la pipeline puramente W4 cambió sustancialmente la salida aunque las canaries de línea pasaran.
- La paridad de máscara IoU de los detectores no equivale a paridad de transcripción; el impacto completo de geometría/tablas/transcripción no está cualificado.
- Los detectores experimentales no deben reemplazar a los de producción basándose solo en IoU de máscara.
- La licencia es restrictiva: los pesos del reconocedor están bajo CC BY-NC 4.0 (no comercial) y los componentes Surya bajo sus términos upstream. Las conversiones no otorgan derechos adicionales.
- Se debe mantener la atribución original de Bina/Indra/Surya.
- El modelo está orientado principalmente a persa/farsi; las rutas para inglés, matemáticas y tablas son secundarias y dependen de prompts de tarea.
- Requiere iOS 18 / macOS 15 o superior; no se probó hardware iOS ni Windows nativo.
- No se probó en Android; LiteRT se probó solo en Linux CPU.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.

## Enlaces

- [Reza2kn/Bina-0.4-Rizeh-CoreML-INT4 en Hugging Face](https://huggingface.co/Reza2kn/Bina-0.4-Rizeh-CoreML-INT4)
- [Modelo base Reza2kn/Bina-0.4-Rizeh](https://huggingface.co/Reza2kn/Bina-0.4-Rizeh)
- [Licencia bina-0.4-rizeh](https://huggingface.co/Reza2kn/Bina-0.4-Rizeh/blob/51b8c314b0552b1884c1f0e28016cb12a143f637/README.md)
- [Reza2kn/Bina-0.4-Koochik](https://huggingface.co/Reza2kn/Bina-0.4-Koochik)
- [Reza2kn/Bina-0.4-Koochik-CoreML-INT4](https://huggingface.co/Reza2kn/Bina-0.4-Koochik-CoreML-INT4)
