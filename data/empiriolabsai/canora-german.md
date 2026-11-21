# empiriolabsai/canora-german

## Resumen

Canora German es un modelo de síntesis de voz (text-to-speech) en alemán desarrollado por EmpirioLabs, publicado como un ajuste fino (finetune) del conocido Kokoro-82M de hexgrad. El modelo incorpora dos voces, `lena` (femenina) y `jonas` (masculina), mantiene el tamaño y la velocidad de su modelo base (82 millones de parámetros) y se carga con el paquete estándar `kokoro` de Python. Su relevancia radica en que ofrece una calidad de inteligibilidad y naturalidad superior a las voces Piper y al modelo Thorsten-Voice/Kokoro en las pruebas publicadas por el autor, con una licencia Apache 2.0 que permite uso comercial sin restricciones.

El modelo se distribuye en pesos ONNX en precisión completa, media precisión e int8, lo que facilita su despliegue tanto en ONNX Runtime como en transformers.js. El archivo int8 ocupa solo 115 MB, lo que lo hace viable en entornos con recursos limitados, incluyendo navegador y dispositivos de borde. La arquitectura subyacente es la de Kokoro-82M, un modelo compacto de síntesis de voz basado en transformer con un módulo de conversión de texto a fonemas (G2P) que depende de `espeak-ng`.

La ficha se basa exclusivamente en la información publicada en la model card del autor. No se dispone de detalles sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de ajuste fino más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (transformer para TTS, con módulo G2P basado en espeak-ng) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión completa, media precisión (half) e int8 (ONNX) |
| Idiomas soportados | Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (precisión completa, half, int8); pesos PyTorch para el paquete kokoro |

## Arquitectura y entrenamiento

Canora German es un ajuste fino de Kokoro-82M, un modelo de síntesis de voz de 82 millones de parámetros que emplea una arquitectura transformer compacta. El modelo base Kokoro-82M es conocido por su eficiencia: combina un codificador de texto con un decodificador de audio y utiliza un módulo de conversión de grafemas a fonemas (G2P) para transformar el texto en representaciones fonéticas antes de la síntesis. En este caso, el autor incluye un módulo de texto a fonemas de un solo archivo en el repositorio, que invoca `espeak-ng` para el procesamiento del alemán.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el modelo fue ajustado para leer números, fechas, horas y precios tal como los pronuncia un hablante nativo de alemán, lo que sugiere un cuidado específico en la normalización de texto durante el entrenamiento. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en alemán con dos voces: `lena` (femenina) y `jonas` (masculina).
- Lectura correcta de números, fechas, horas y precios con pronunciación nativa alemana.
- Generación de audio a partir de texto con el paquete estándar `kokoro` de Python.
- Inferencia mediante ONNX Runtime en precisión completa, media precisión e int8.
- Compatibilidad con transformers.js para ejecución en navegador.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni otras modalidades (visión, audio de entrada).
- El modelo es exclusivamente de texto a voz; no realiza reconocimiento de voz ni otras tareas.

## Casos de uso

- **Atención al cliente automatizada por voz**: el modelo puede generar respuestas habladas en alemán para sistemas de IVR o asistentes telefónicos, con dos voces disponibles para alternar entre agentes o contextos. Su reducido tamaño (82 M de parámetros) permite ejecución en servidores modestos.
- **Lectura de noticias y artículos**: la capacidad de leer correctamente números, fechas y precios lo hace adecuado para la síntesis de boletines informativos, informes meteorológicos o resúmenes financieros en alemán.
- **Accesibilidad web**: integración mediante transformers.js para convertir texto de páginas web en audio directamente en el navegador, sin necesidad de servidor, gracias a los pesos ONNX int8 de 115 MB.
- **Sistemas de navegación y anuncios públicos**: generación de avisos de transporte (por ejemplo, "El tren a Hamburgo sale a las 14:35 de la vía 5") con pronunciación natural de horas y números.
- **Contenido educativo y audiolibros**: síntesis de material didáctico o narración de textos largos con una voz consistente y natural, adecuada para consumo en dispositivos móviles.
- **Prototipado rápido de aplicaciones de voz**: al cargarse con el paquete estándar `kokoro` y requerir solo `espeak-ng`, permite a desarrolladores integrar TTS en pipelines de Python con mínima fricción.
- **Comercio electrónico**: lectura de precios y descripciones de productos en alemán para asistentes de compra o aplicaciones de accesibilidad.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan Canora German con 11 voces alemanas adicionales en 200 frases no vistas, usando `openai/whisper-large-v3` para transcribir y calcular el WER (menor es mejor) y UTMOS como estimación de naturalidad (mayor es mejor).

| Sistema | WER | UTMOS |
|---|---:|---:|
| **Canora German `lena`** | 4.03% | 4.16 |
| **Canora German `jonas`** | **3.32%** | **4.16** |
| Thorsten-Voice/Kokoro | 3.78% | 3.57 |
| Piper `de_DE-pavoque-low` | 5.04% | 3.66 |
| Piper `de_DE-thorsten-medium` | 5.04% | 3.38 |
| Piper `de_DE-kerstin-low` | 5.99% | 3.53 |
| Piper `de_DE-thorsten-high` | 6.29% | 3.24 |
| Piper `de_DE-kerstin-medium` | 6.34% | 3.61 |
| Piper `de_DE-thorsten-low` | 6.65% | 3.31 |
| Piper `de_DE-eva_k-x_low` | 7.05% | 3.29 |
| Piper `de_DE-karlsson-low` | 7.65% | 3.56 |
| Piper `de_DE-mls-medium` | 15.96% | 2.68 |
| Piper `de_DE-ramona-low` | 18.58% | 2.56 |

En la versión int8 ONNX, el autor reporta `lena` con 4.18% WER y UTMOS 3.46, y `jonas` con 3.37% WER y UTMOS 3.74 sobre las mismas frases. La identificación de idioma con `openai/whisper-large-v3` da una probabilidad media de alemán de 1.00 para `lena` y 0.99 para `jonas`.

En cuanto a velocidad, medida en 60 frases sobre 4 hilos de un AMD EPYC 7513 de 32 núcleos: PyTorch 3.3x tiempo real, ONNX precisión completa 3.8x y ONNX int8 4.6x. La velocidad depende del procesador y del número de hilos.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; con 82 M de parámetros, el modelo es muy ligero. El archivo ONNX int8 ocupa 115 MB, por lo que la inferencia en CPU es viable sin GPU.
- **GPU recomendadas**: no se especifican; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente. El modelo está diseñado para ejecutarse en CPU.
- **Cabe en GPU consumer**: sí, en cualquier GPU consumer con al menos 1-2 GB de memoria libre, e incluso en CPU.
- **Opciones de despliegue**: paquete `kokoro` de Python con PyTorch, ONNX Runtime (precisión completa, half, int8) y transformers.js para navegador. Requiere `espeak-ng` instalado en el sistema.
- **Latencia y throughput**: 3.3x tiempo real con PyTorch, 3.8x con ONNX full precision y 4.6x con ONNX int8, medidos en 4 hilos de un AMD EPYC 7513. El rendimiento escala con el número de hilos y la CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Contexto | Calidad (WER/UTMOS) | Disponibilidad |
|---|---|---|---|---|---|---|
| **Canora German** | 82 M | Alemán | Apache 2.0 | no disponible | 3.32-4.03% / 4.16 | Hugging Face, ONNX |
| Thorsten-Voice/Kokoro | 82 M | Alemán | no disponible en la información | no disponible | 3.78% / 3.57 | Hugging Face |
| Piper `de_DE-thorsten-high` | no disponible | Alemán | no disponible en la información | no disponible | 6.29% / 3.24 | Piper |
| Piper `de_DE-pavoque-low` | no disponible | Alemán | no disponible en la información | no disponible | 5.04% / 3.66 | Piper |

Canora German ofrece el mejor UTMOS (4.16) entre los sistemas comparados y un WER competitivo, solo superado ligeramente por Thorsten-Voice/Kokoro en la voz `lena` (3.78% frente a 4.03%), aunque la voz `jonas` logra el mejor WER global (3.32%). La licencia Apache 2.0 es una ventaja frente a otros modelos cuya licencia no se detalla en la información disponible.

## Limitaciones y advertencias

- **Idioma único**: el modelo solo soporta alemán; no se ha entrenado para otros idiomas.
- **Dos voces únicas**: solo dispone de `lena` y `jonas`; no hay variedad de acentos o estilos más allá de estas dos voces.
- **Dependencia de espeak-ng**: el módulo de texto a fonemas requiere `espeak-ng` instalado en el sistema, lo que añade una dependencia externa en el despliegue.
- **Riesgo de alucinación en TTS**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o extranjerismos no vistos durante el entrenamiento.
- **Sesgos**: no se documentan sesgos específicos, pero al ser un ajuste fino sobre Kokoro-82M, podría heredar sesgos del modelo base en cuanto a prosodia o estilo.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de la licencia del modelo base Kokoro-82M y de `espeak-ng` en el contexto de producción.
- **Datos de entrenamiento no disponibles**: no se especifica la composición del dataset ni el proceso de ajuste, lo que limita la evaluación de posibles sesgos o limitaciones de cobertura.
- **Rendimiento en producción**: las métricas de velocidad se midieron en un procesador de servidor con 4 hilos; el rendimiento en dispositivos de borde o navegador puede variar significativamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/empiriolabsai/canora-german)
- [Sitio web de EmpirioLabs](https://empiriolabs.ai)
- [Todos los modelos de EmpirioLabs](https://huggingface.co/empiriolabsai)
- [Plataforma de EmpirioLabs](https://platform.empiriolabs.ai)
- [Discord de EmpirioLabs](https://discord.gg/bM52azW4ZD)
- [Modelo base Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)
- [Thorsten-Voice/Kokoro](https://huggingface.co/Thorsten-Voice/Kokoro)
