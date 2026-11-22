# empiriolabsai/canora-norwegian

## Resumen

Canora Norwegian es un modelo de síntesis de voz (text-to-speech) especializado en noruego, desarrollado por EmpirioLabs. Se trata de un fine-tuning del conocido Kokoro-82M de hexgrad, lo que le confiere la misma arquitectura compacta de 82 millones de parámetros y una velocidad de inferencia propia de un modelo de su tamaño, pero adaptada específicamente al idioma noruego con dos voces: `ingrid` (femenina) y `lars` (masculina). El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, y está pensado para integrarse en el ecosistema estándar del paquete Python `kokoro`.

El modelo resuelve el problema de la síntesis de voz en noruego con una calidad superior a las alternativas de código abierto disponibles, en concreto las voces Piper evaluadas por el autor. Según las mediciones publicadas, Canora Norwegian logra una tasa de error de palabra (WER) de 5,35-5,68 % frente al 8,47 % de la mejor voz Piper, y una puntuación de naturalidad UTMOS de 4,12-4,29 frente a 3,58. Además, incluye pesos ONNX en precisión completa, media precisión e int8, lo que facilita su despliegue tanto en ONNX Runtime como en transformers.js.

La relevancia actual del modelo radica en su combinación de tamaño reducido (el archivo ONNX int8 ocupa 115 MB), velocidad (hasta 4,6 veces tiempo real en CPU) y licencia permisiva, lo que lo hace adecuado para aplicaciones de producción que necesiten síntesis de voz noruega en entornos con recursos limitados, incluyendo navegador o dispositivos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (fine-tuning); arquitectura de TTS basada en el modelo base |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX en precisión completa, media precisión e int8; pesos PyTorch (.pth) |
| Idiomas soportados | Noruego (`no`, `nb`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth), ONNX (full precision, half precision, int8) |

## Arquitectura y entrenamiento

Canora Norwegian es un fine-tuning del modelo Kokoro-82M, un modelo de síntesis de voz de 82 millones de parámetros. La model card no detalla la arquitectura interna más allá de indicar que se carga con el paquete estándar `kokoro` y que mantiene el tamaño y la velocidad de Kokoro-82M. El modelo incluye un módulo de conversión de texto a fonemas específico para noruego (`g2p_no.py`), que se apoya en el programa `espeak-ng` para la fonemización. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es la inclusión de pesos ONNX en tres precisiones para ONNX Runtime y transformers.js, lo que permite desplegar el modelo en navegador o en entornos sin PyTorch. El modelo base Kokoro-82M es conocido por su eficiencia, y este fine-tuning conserva esa característica: según las mediciones del autor, la inferencia alcanza 3,4 veces tiempo real en PyTorch, 3,9 veces en ONNX full precision y 4,6 veces en ONNX int8, medidas en 4 hilos de un AMD EPYC 7713.

## Capacidades

- Síntesis de voz en noruego con dos voces: `ingrid` (femenina) y `lars` (masculina).
- Lectura correcta de números, fechas, horas y precios según la convención noruega (por ejemplo, "kl. 14.35" o "34,50 kr").
- Generación de audio a partir de texto con fonemización específica para noruego mediante el módulo `g2p_no.py`.
- Soporte de inferencia en PyTorch y en ONNX Runtime (precisión completa, media precisión e int8).
- Compatibilidad con transformers.js para ejecución en navegador.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; el modelo es exclusivamente de texto a voz.

## Casos de uso

- **Atención al cliente automatizada en noruego**: el modelo puede generar respuestas de voz naturales para sistemas de IVR o asistentes telefónicos, con dos voces disponibles para alternar según el contexto o el género del interlocutor. Su velocidad de 4,6 veces tiempo real en CPU permite responder en tiempo real sin GPU.
- **Lectura de noticias y artículos**: integrado en un pipeline de texto a voz, puede narrar artículos periodísticos con una pronunciación correcta de cifras, fechas y precios, algo crítico en contenidos informativos. La puntuación UTMOS de 4,29 (voz `ingrid`) indica una naturalidad alta para este uso.
- **Accesibilidad web**: al estar disponible en ONNX int8 (115 MB) y ser compatible con transformers.js, puede ejecutarse en el navegador para leer contenido web a personas con discapacidad visual, sin depender de servicios en la nube.
- **Locución para vídeos y pódcast**: la calidad de naturalidad y la identificación de idioma noruego con probabilidad 1,00 lo hacen adecuado para generar locuciones de calidad aceptable en producción de contenido multimedia, con dos voces para diálogos o narraciones.
- **Sistemas de navegación y transporte**: puede leer instrucciones de ruta, horarios de trenes y números de andén (como en el ejemplo "Toget til Bergen går kl. 14.35 fra spor 5") de forma natural, integrándose en apps de transporte público.
- **Aprendizaje de noruego**: los aprendices pueden escuchar pronunciaciones nativas de frases y vocabulario con dos voces distintas, lo que ayuda a la comprensión auditiva y a la familiarización con la entonación.
- **Audiolibros y contenido educativo**: con la licencia Apache 2.0, se puede utilizar comercialmente para generar audiolibros o material educativo en noruego sin coste de licencia, siempre que se respeten las condiciones de la licencia.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan Canora Norwegian con dos voces Piper en 200 frases noruegas no vistas durante el entrenamiento. La transcripción se realizó con `openai/whisper-large-v3` y el WER se calculó comparando la transcripción con el texto original. UTMOS es una estimación automática de naturalidad en escala de 1 a 5.

| Sistema | WER | UTMOS |
|---|---:|---:|
| Canora Norwegian `ingrid` | 5,68 % | **4,29** |
| Canora Norwegian `lars` | **5,35 %** | 4,12 |
| Piper `no_NO-talesyntese-medium` | 8,47 % | 3,58 |
| Piper `no_NO-nvcc-medium` | 45,79 % | 3,36 |

En la versión ONNX int8, los resultados son: `ingrid` 5,91 % WER y UTMOS 3,87; `lars` 5,57 % WER y UTMOS 3,67.

La identificación de idioma con `openai/whisper-large-v3` otorga una probabilidad media de noruego de 1,00 para ambas voces, frente a un rango de 0,88 a 1,00 para las voces comparadas.

En velocidad, medida en 4 hilos de un AMD EPYC 7713 con 60 frases: PyTorch 3,4 veces tiempo real, ONNX full precision 3,9 veces y ONNX int8 4,6 veces.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 82 millones de parámetros, la inferencia en PyTorch requiere aproximadamente 0,3-0,5 GB de VRAM en precisión completa; en ONNX int8 el archivo es de 115 MB y puede ejecutarse en CPU sin GPU.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar el modelo sin problemas.
- **Cabe en consumer GPU**: sí, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- **Opciones de despliegue**: paquete Python `kokoro` con PyTorch, ONNX Runtime (precisión completa, media o int8), transformers.js para navegador.
- **Latencia y throughput**: según el autor, 3,4 veces tiempo real en PyTorch, 3,9 veces en ONNX full precision y 4,6 veces en ONNX int8, medido en 4 hilos de un AMD EPYC 7713. El rendimiento depende del procesador y del número de hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (noruego) | UTMOS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Canora Norwegian | 82 M | no disponible | 5,35-5,68 % | 4,12-4,29 | Apache 2.0 | Hugging Face, ONNX, PyTorch |
| Piper `no_NO-talesyntese-medium` | no disponible | no disponible | 8,47 % | 3,58 | no disponible en la información | Piper |
| Piper `no_NO-nvcc-medium` | no disponible | no disponible | 45,79 % | 3,36 | no disponible en la información | Piper |
| Kokoro-82M (base) | 82 M | no disponible | no disponible para noruego | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a las voces Piper evaluadas por el autor y al modelo base Kokoro-82M. No se dispone de datos de otros modelos TTS noruegos en la información proporcionada.

## Limitaciones y advertencias

- **Idioma limitado**: el modelo solo soporta noruego (`no`, `nb`); no está entrenado para otros idiomas y su uso fuera del noruego producirá resultados incorrectos.
- **Dos voces únicas**: solo dispone de las voces `ingrid` y `lars`; no se pueden generar voces adicionales sin un nuevo fine-tuning.
- **Dependencia de espeak-ng**: el módulo de fonemización requiere el programa `espeak-ng` instalado en el sistema, lo que añade una dependencia externa al despliegue.
- **Riesgo de alucinación en la pronunciación**: aunque el modelo lee números, fechas y precios correctamente según las pruebas, no se garantiza una pronunciación perfecta en todos los casos, especialmente con nombres propios o términos técnicos.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un fine-tuning de Kokoro-82M, podría heredar sesgos del modelo base, pero no se detallan.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir adecuadamente. No se especifican restricciones adicionales.
- **Calidad en int8**: la versión int8 reduce ligeramente la calidad (UTMOS 3,87-3,67 frente a 4,29-4,12 en precisión completa), por lo que en producción podría ser preferible usar precisión completa si los recursos lo permiten.
- **Datos de entrenamiento no disponibles**: no se especifica el dataset utilizado ni el número de tokens, lo que limita la evaluación de posibles sesgos o coberturas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/empiriolabsai/canora-norwegian)
- [Sitio web de EmpirioLabs](https://empiriolabs.ai)
- [Todos los modelos de EmpirioLabs en Hugging Face](https://huggingface.co/empiriolabsai)
- [Plataforma de EmpirioLabs](https://platform.empiriolabs.ai)
- [Discord de EmpirioLabs](https://discord.gg/bM52azW4ZD)
- [Modelo base Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
