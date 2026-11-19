# KittenML/kitten-tts-2-mini

## Resumen

Kitten TTS 2 Mini es un modelo de síntesis de voz (text-to-speech) desarrollado por KittenML, diseñado para inferencia en CPU con un tamaño reducido. Con 82 millones de parámetros, ofrece salida de audio a 24 kHz y soporta 16 idiomas con un total de 118 voces predefinidas. El modelo se distribuye en formato ONNX con pesos cuantizados a int8 (82,7 MB) e int4 (47,5 MB), además de los pesos originales en float32 para PyTorch, lo que permite su despliegue sin dependencia de GPU ni de PyTorch en el caso de las variantes ONNX.

La relevancia del modelo radica en su relación entre calidad, tamaño y requisitos de hardware: es capaz de generar voz en múltiples idiomas y con voces diferenciadas por registro y estilo (desde una historiadora sombría hasta un locutor deportivo energético) ocupando menos de 100 MB en disco y ejecutándose en CPU mediante ONNX Runtime. Esto lo posiciona como una opción práctica para aplicaciones embebidas, asistentes locales y pipelines de generación de audio a escala sin infraestructura de GPU.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos derivados. La librería `kittenml` proporciona una API de alto nivel para seleccionar voces, idiomas, velocidad y backend de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos en ONNX y PyTorch) |
| Parametros totales | 82 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (82,7 MB), int4 (47,5 MB), float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt, ru, hi, da, fi, fr, ja, ko, nl, sv, sw, tr (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8, int4) y safetensors/PyTorch (float32) |
| Frecuencia de muestreo | 24 kHz |
| Voces disponibles | 118 voces en total, organizadas por idioma |
| Tamano del repositorio | 0,5 GB |
| Libreria | onnx |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Se trata de un modelo de síntesis de voz con 82 millones de parámetros que genera audio a 24 kHz a partir de texto. La model card no especifica si emplea un transformer, un modelo acústico basado en difusión, un vocoder neuronal o una arquitectura híbrida, ni detalla la composición del dataset de entrenamiento, el número de horas de audio utilizadas o si se aplicaron técnicas de RLHF o ajuste fino supervisado.

La innovación técnica destacable es la disponibilidad de pesos cuantizados a int8 e int4 en formato ONNX, que permiten la inferencia en CPU con ONNX Runtime (versión 1.20 o superior para int4) sin necesidad de PyTorch. El modelo también ofrece pesos float32 para ejecución en PyTorch, con soporte opcional de GPU mediante `device="cuda"`. La selección de backend y formato de pesos determina qué archivos se descargan, optimizando el uso de disco y memoria.

## Capacidades

- Generación de voz a partir de texto en 16 idiomas: inglés, alemán, español, italiano, portugués, ruso, hindi, danés, finés, francés, japonés, coreano, neerlandés, sueco, suajili y turco.
- 118 voces predefinidas con nombres y descripciones de estilo (por ejemplo, "Eleanor" como historiadora sombría, "Max" como locutor deportivo energético).
- Control de velocidad de habla mediante el parámetro `speed` (por ejemplo, `speed=1.1`).
- Selección de voz por nombre (insensible a mayúsculas) o por descripción.
- Selección de idioma explícita mediante el parámetro `language`, con voz predeterminada por idioma.
- Las voces inglesas pueden hablar alemán, español, italiano, portugués y ruso bajo el mismo nombre, permitiendo consistencia de timbre entre idiomas.
- Inferencia en CPU mediante ONNX Runtime con pesos int8 o int4.
- Inferencia en GPU mediante PyTorch con pesos float32.
- No se menciona soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto más allá de la síntesis de voz.

## Casos de uso

- Asistentes de voz locales en dispositivos embebidos: el modelo puede ejecutarse en CPU con pesos int4 de 47,5 MB, lo que permite integrarlo en raspberry pi, routers o dispositivos IoT para respuestas habladas sin conexión a la nube.
- Generación de audiolibros y contenido narrado: con 118 voces y control de velocidad, se pueden producir narraciones con distintos registros (historiador, periodista, instructor de yoga) para diferentes secciones o personajes.
- Atención al cliente automatizada por voz: el modelo puede generar respuestas habladas en 16 idiomas, adecuado para sistemas de IVR o chatbots telefónicos que requieran síntesis en tiempo real en servidores sin GPU.
- Localización de contenido multimedia: las voces inglesas que hablan también alemán, español, italiano, portugués y ruso permiten mantener el mismo timbre en versiones dobladas de un mismo contenido, facilitando la coherencia de marca.
- Accesibilidad y lectores de pantalla: la inferencia en CPU y el reducido tamaño permiten integrar el modelo en aplicaciones de escritorio o móviles para leer texto en voz alta con voces variadas y en múltiples idiomas.
- Generación de audio para pruebas y prototipado: los desarrolladores pueden generar clips de voz de forma rápida y local para probar interfaces de voz, videojuegos o aplicaciones de aprendizaje de idiomas sin depender de servicios externos.
- Sistemas de anuncios públicos y megafonía: la voz "Max" (locutor deportivo energético) o "Diana" (oficial militar severa) pueden emplearse para mensajes de anuncio en estaciones, aeropuertos o eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en modo ONNX (CPU); en modo PyTorch con float32, el modelo de 82 M de parámetros ocupa aproximadamente 328 MB en memoria (más overhead), por lo que puede ejecutarse en GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU compatible con PyTorch (por ejemplo, RTX 3060, RTX 4090, A100, H100) para el backend `torch` con `device="cuda"`. Para el backend ONNX, no se requiere GPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 1 GB de VRAM para la variante float32. Las variantes ONNX int8 e int4 están pensadas para CPU.
- Opciones de despliegue: ONNX Runtime (backend por defecto, con int8 o int4) y PyTorch (float32, CPU o CUDA). La librería `kittenml` gestiona la descarga selectiva de archivos según backend y formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos en las voces o en los datos de entrenamiento; es probable que las voces reflejen sesgos de los corpus utilizados, pero no se detalla.
- Riesgo de alucinación no aplica en el sentido de generación de texto falso, pero sí puede haber errores de pronunciación o entonación en textos complejos, idiomas menos representados o nombres propios.
- La longitud de contexto no está especificada; textos muy largos pueden requerir segmentación manual, y no se garantiza coherencia prosódica en pasajes extensos.
- La calidad de la síntesis en los 16 idiomas puede variar; la model card no proporciona métricas por idioma (MOS, WER, etc.).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de las voces (algunas descripciones podrían evocar personas reales, aunque son nombres genéricos).
- El backend ONNX con int4 requiere `onnxruntime>=1.20`; versiones anteriores pueden no funcionar.
- No se especifica el soporte para SSML, control de prosodia avanzado ni emoción más allá de la descripción de la voz.
- El tamaño del repositorio es de 0,5 GB, pero la descarga selectiva mitiga el impacto en disco.

## Enlaces

- [Hugging Face: KittenML/kitten-tts-2-mini](https://huggingface.co/KittenML/kitten-tts-2-mini)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
