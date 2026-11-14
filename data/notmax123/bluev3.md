# notmax123/BlueV3

## Resumen

BlueV3 es un modelo de síntesis de voz (text-to-speech) zero-shot y multilingüe desarrollado por el usuario notmax123. Se distribuye como pesos de PyTorch bajo licencia MIT y forma parte de un ecosistema más amplio que incluye un códec de audio independiente (`notmax123/blue-codec`), un paquete de runtime ONNX (`notmax123/BlueV3-onnx`) y el repositorio de código BlueTTS. El modelo genera audio a 44,1 kHz a partir de texto y una muestra de referencia de voz, lo que permite clonar la identidad vocal sin necesidad de entrenamiento específico por hablante.

La arquitectura se basa en flow matching texto-a-latente con classifier-free guidance, complementada por un predictor de duración y un autoencoder de audio que actúa como códec. La versión `v3.0.0` (checkpoint `701500`) parte de un modelo entrenado hasta 700k iteraciones y aplica 1.500 iteraciones adicionales de FlowTTS-GRPO, una técnica de optimización por refuerzo descrita en el artículo arXiv 2606.23190. El punto de operación recomendado es de 8 pasos de integración Euler con CFG 4.0.

El modelo declara soporte para hebreo, inglés, alemán, español e italiano, con etiquetas de idioma activadas. Su relevancia actual radica en que ofrece clonación de voz zero-shot multilingüe a frecuencia de muestreo completa (44,1 kHz) con una licencia permisiva MIT, algo poco habitual en modelos TTS de calidad comparable, aunque su ecosistema y comunidad son todavía muy reducidos (0 descargas y 1 like en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching texto-a-latente con classifier-free guidance, predictor de duración y autoencoder de audio (códec) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Hebreo, inglés, alemán, español, italiano |
| Licencia | MIT (el decodificador del códec es un derivado de OpenRAIL-M) |
| Formato de pesos | PyTorch (`.pt`); bundle ONNX disponible en repositorio separado |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Versión | v3.0.0 (checkpoint `701500`) |
| Punto de operación | 8 pasos Euler, CFG 4.0, speed 1.0, etiquetas de idioma activadas |
| Tamaño del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

BlueV3 es un sistema TTS compuesto por tres módulos diferenciados. El primero es un modelo texto-a-latente que integra un codificador de texto, un campo vectorial (vector field) para el proceso de flow matching y un codificador de referencia que extrae la identidad vocal de un clip de audio. El segundo es un predictor de duración que determina la longitud de cada segmento fonético. El tercero es un autoencoder de audio, distribuido por separado en `notmax123/blue-codec` (carpeta `bluev3_codec/`, EMA 380k), que convierte los latentes en forma de onda a 44,1 kHz.

El entrenamiento combina un preentrenamiento supervisado del modelo texto-a-latente hasta 700k iteraciones (con pesos EMA) y una fase posterior de 1.500 iteraciones de FlowTTS-GRPO, una variante de optimización por refuerzo basada en preferencias descrita en arXiv 2606.23190. El modelo utiliza classifier-free guidance durante la inferencia, con un valor de CFG de 4.0 en el punto de operación recomendado. La generación se realiza mediante integración de Euler en 8 pasos. El repositorio incluye 15 voces JSON exportadas de hablantes de LibriTTS-R (CC BY 4.0), lo que permite usar identidades vocales predefinidas además de la clonación zero-shot desde una referencia arbitraria.

## Capacidades

- Síntesis de voz multilingüe en hebreo, inglés, alemán, español e italiano, con etiquetas de idioma conmutables.
- Clonación de voz zero-shot: la identidad vocal se extrae de un clip de referencia sin reentrenamiento.
- Generación de audio a 44,1 kHz, frecuencia de muestreo completa frente a los 16-24 kHz habituales en modelos TTS comparables.
- Control de velocidad del habla mediante el parámetro `speed` (valor por defecto 1.0).
- Control de la fuerza del classifier-free guidance (CFG 4.0 en el punto de operación recomendado).
- Predicción explícita de duración, lo que permite ajustar la cadencia de la locución.
- Exportación a ONNX para despliegue en runtimes sin PyTorch.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Clonación de voz para doblaje multilingüe**: el modelo puede generar la misma identidad vocal en hebreo, inglés, alemán, español e italiano a partir de un único clip de referencia, lo que resulta adecuado para localizar contenido audiovisual manteniendo la voz del actor original.
- **Locución automatizada de artículos y documentación**: la generación a 44,1 kHz y el control de velocidad permiten producir audiolibros o versiones en audio de documentación técnica con calidad suficiente para publicación.
- **Asistentes de voz en hebreo**: dado el escaso ecosistema TTS para hebreo, el modelo cubre un nicho concreto con una tasa de error fonético declarada del 1,53 %, adecuada para interfaces conversacionales y sistemas de lectura en voz alta.
- **Prototipado de interfaces de voz**: la licencia MIT y la disponibilidad de un bundle ONNX facilitan la integración en prototipos y productos comerciales sin las restricciones de licencias no comerciales habituales en TTS.
- **Generación de voces sintéticas para videojuegos y contenido interactivo**: la clonación zero-shot permite asignar identidades vocales distintas a personajes sin entrenar modelos por personaje, usando los 15 JSON de voces incluidas o referencias propias.
- **Sistemas de accesibilidad**: conversión de texto a voz de alta fidelidad para lectores de pantalla y aplicaciones de accesibilidad, con control de velocidad para adaptarse a las preferencias del usuario.
- **Investigación en TTS y flow matching**: el modelo publica sus checkpoints, configuración y estadísticas de latentes, lo que permite reproducir el pipeline y experimentar con la técnica FlowTTS-GRPO.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test no visto (200 frases en hebreo y 100 en inglés, voces no vistas), con 8 pasos y CFG 4. La columna "antes de RL" corresponde al checkpoint de 700k y la columna "esta versión" al checkpoint `701500`.

| Métrica | Antes de RL (700k) | Esta versión (v3.0.0) |
|---|---|---|
| Tasa de error fonético en hebreo | 1,85 % | 1,53 % |
| Similitud de hablante en hebreo | 0,650 | 0,660 |
| DNSMOS OVRL en hebreo | 3,39 | 3,41 |
| Tasa de error de palabra en inglés | 1,82 % | 1,88 % (sin cambio significativo) |
| Similitud de hablante en inglés | 0,660 | 0,671 |
| DNSMOS OVRL en inglés | 3,34 | 3,35 (sin cambio significativo) |

El autor indica que las mejoras marcadas como significativas son aquellas cuyo intervalo de confianza pareado del 95 % excluye el cero. No se han publicado resultados de benchmarks para alemán, español ni italiano en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio ocupa 1,2 GB, pero no se especifica el consumo de memoria en inferencia ni el tamaño en parámetros del modelo.
- **GPU recomendadas**: no disponible. No se documentan requisitos mínimos ni GPU de referencia.
- **Compatibilidad con GPU de consumo**: no confirmada. El tamaño del repositorio (1,2 GB) sugiere que podría caber en GPU de consumo con 8-16 GB de VRAM, pero este dato no está verificado en la información proporcionada.
- **Opciones de despliegue**: PyTorch nativo (pesos `.pt`) y ONNX Runtime mediante el bundle `notmax123/BlueV3-onnx`. El código de referencia está en el repositorio BlueTTS de GitHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no a TTS.
- **Latencia y throughput**: no disponibles. Solo se especifica el número de pasos de integración (8 Euler), lo que da una indicación cualitativa del coste computacional, pero sin cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada, por lo que la comparación se limita a características declaradas.

| Modelo | Idiomas | Frecuencia de muestreo | Clonación zero-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlueV3 | Hebreo, inglés, alemán, español, italiano | 44,1 kHz | Sí | MIT | Hugging Face, 0 descargas |
| XTTS-v2 (Coqui) | Multilingüe (16 idiomas) | 24 kHz | Sí | Coqui Public Model License (no comercial) | Hugging Face, amplia adopción |
| Bark (Suno) | Multilingüe | 24 kHz | Parcial (prompts de voz) | MIT | Hugging Face, amplia adopción |
| VITS / Piper | Depende del checkpoint | 22,05 kHz típicamente | No (entrenamiento por hablante) | MIT / otras según checkpoint | Amplia, ecosistema consolidado |

Los datos de XTTS-v2, Bark y Piper corresponden a conocimiento general de estos modelos y no a la información proporcionada en esta ficha; se incluyen como referencia de categoría. No se dispone de comparaciones directas de calidad objetiva entre BlueV3 y estos modelos.

## Limitaciones y advertencias

- **Comunidad y validación externa mínimas**: 0 descargas y 1 like en Hugging Face en el momento de la consulta, sin evaluaciones independientes publicadas. Los benchmarks son únicamente los declarados por el autor.
- **Cobertura de idiomas desigual**: solo se publican métricas para hebreo e inglés. No hay datos de calidad para alemán, español ni italiano, pese a estar declarados como soportados.
- **Compatibilidad de checkpoints**: los checkpoints, estadísticas y voces de versiones anteriores no son compatibles con el códec actual (`bluev3_codec/`, EMA 380k). Cualquier actualización requiere descargar también el códec correspondiente.
- **Licencia del códec**: aunque el modelo principal es MIT, el decodificador del códec es un derivado de OpenRAIL-M, lo que introduce restricciones adicionales de uso que deben revisarse en `notmax123/blue-codec` antes de un despliegue comercial.
- **Riesgo de uso indebido en clonación de voz**: la clonación zero-shot permite imitar voces sin consentimiento. No se documentan mecanismos de marca de agua, detección de voz sintética ni salvaguardas técnicas en la información disponible.
- **Sesgos**: no se documenta ninguna evaluación de sesgos por género, acento o variedad dialectal. Las voces incluidas provienen de LibriTTS-R, un corpus de audiolibros en inglés, lo que puede sesgar las identidades vocales hacia ese dominio.
- **Riesgo de alucinación acústica**: no se documentan tasas de artefactos, omisiones o pronunciaciones erróneas más allá de las métricas de error fonético y de palabra sobre los conjuntos de test declarados.
- **Documentación incompleta**: faltan datos de parámetros, contexto, cuantización, requisitos de hardware y latencia, lo que dificulta la planificación de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notmax123/BlueV3
- Códec de audio: https://huggingface.co/notmax123/blue-codec
- Bundle ONNX: https://huggingface.co/notmax123/BlueV3-onnx
- Repositorio de código BlueTTS: https://github.com/maxmelichov/BlueTTS
- Artículo FlowTTS-GRPO: arXiv 2606.23190 (referenciado en la model card; no se proporciona URL directa)
