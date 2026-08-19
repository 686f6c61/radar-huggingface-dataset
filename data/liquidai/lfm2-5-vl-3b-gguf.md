# LiquidAI/LFM2.5-VL-3B-GGUF

## Resumen

LFM2.5-VL-3B-GGUF es una versión cuantizada en formato GGUF del modelo multimodal LFM2.5-VL-3B, desarrollado por Liquid AI. Este modelo pertenece a la nueva generación de arquitecturas híbridas de Liquid AI, diseñadas específicamente para ejecutarse en el borde (edge AI) y en dispositivos con recursos limitados. La versión GGUF permite su uso directo con llama.cpp y otros motores compatibles, facilitando el despliegue local en CPU o GPU de baja potencia.

El modelo combina capacidades de comprensión de imagen y texto (pipeline image-text-to-text), lo que lo hace adecuado para tareas de visión por computador y diálogo multimodal. Soporta una amplia lista de idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, entre otros. Aunque no se han publicado especificaciones técnicas detalladas en la información disponible, el nombre sugiere una escala de 3 mil millones de parámetros, y su distribución en GGUF indica que está optimizado para inferencia eficiente en entornos con restricciones de memoria.

La relevancia de este modelo radica en su enfoque en el borde: permite ejecutar modelos multimodales en dispositivos como teléfonos, cámaras o sistemas embebidos sin depender de la nube, lo que reduce latencia y costes. Su licencia lfm1.0, aunque no está detallada, es de tipo "other", por lo que se debe revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (no se especifican detalles) |
| Parametros totales | 3B (según nomenclatura del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, se asume múltiples cuantizaciones) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados en la información proporcionada. La descripción oficial indica que LFM2.5 es una "nueva generación de modelos híbridos", lo que sugiere una combinación de arquitecturas (posiblemente transformer con elementos de state space models o similares), pero no se confirma. Tampoco se dispone de información sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación como RLHF o DPO.

La versión GGUF es una conversión del modelo base LiquidAI/LFM2.5-VL-3B, realizada para ser compatible con llama.cpp. Esto implica que el modelo original fue entrenado con pesos en formato safetensors u otro, y luego convertido a GGUF para su uso en entornos de inferencia ligera.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, y genera respuestas de texto (pipeline image-text-to-text).
- Soporte multilingüe: cubre 16 idiomas, incluyendo español, inglés, chino, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, tailandés y vietnamita.
- Diseñado para edge AI: optimizado para ejecución en dispositivos con recursos limitados, como teléfonos móviles, cámaras o sistemas embebidos.
- Compatible con llama.cpp: se puede ejecutar mediante la interfaz de línea de comandos de llama.cpp, incluyendo la capacidad de añadir imágenes con el comando `/image`.
- Conversación interactiva: admite diálogos multi-turno con contexto de imagen, como preguntar "¿Qué hay en la imagen?".

No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistente visual en dispositivos móviles: el modelo puede analizar fotografías tomadas con la cámara del teléfono y responder preguntas sobre su contenido, útil para personas con discapacidad visual o para aplicaciones de reconocimiento de objetos en tiempo real.
- Moderación de contenido en plataformas sociales: al ser ligero y ejecutable en el borde, puede clasificar imágenes en busca de contenido inapropiado sin enviar datos a la nube, reduciendo costes de ancho de banda y mejorando la privacidad.
- Etiquetado automático de imágenes en sistemas de gestión documental: integrado en un pipeline local, puede generar descripciones o etiquetas para archivos de imagen en entornos corporativos sin conexión a internet.
- Asistente de atención al cliente con soporte visual: en quioscos o terminales de autoservicio, el modelo puede interpretar imágenes de productos o documentos y guiar al usuario mediante texto.
- Análisis de imágenes médicas básicas en entornos rurales: aunque no es un modelo especializado, puede ayudar a identificar anomalías visibles en radiografías o fotografías de lesiones, siempre como apoyo y no como diagnóstico definitivo.
- Traducción visual en tiempo real: al combinar la entrada de imagen con el soporte multilingüe, puede extraer texto de carteles o menús y traducirlo al idioma del usuario, todo en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- Al ser un modelo de 3B en formato GGUF, se puede ejecutar en CPU con llama.cpp, aunque la velocidad dependerá del número de núcleos y de la memoria RAM disponible.
- En GPU, es probable que quepa en tarjetas con 4 GB de VRAM o menos, dependiendo de la cuantización elegida (por ejemplo, Q4_K_M o Q5_K_M). No se especifican cuantizaciones concretas en la información.
- Es adecuado para dispositivos edge como Raspberry Pi 5, Jetson Nano o teléfonos móviles con soporte para llama.cpp.
- Opciones de despliegue: llama.cpp (CLI), y potencialmente otros motores compatibles con GGUF como Ollama o LM Studio, aunque no se mencionan explícitamente.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (multimodales pequeños para edge). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la información proporcionada. Sin embargo, al ser un modelo de 3B, es probable que tenga un rendimiento inferior en tareas complejas de razonamiento o generación de código en comparación con modelos más grandes.
- La licencia lfm1.0 es de tipo "other" y no se detallan sus términos. Es imprescindible revisar el archivo LICENSE adjunto en el repositorio antes de cualquier uso comercial o de redistribución.
- El modelo puede presentar sesgos o alucinaciones, especialmente en contextos visuales ambiguos, aunque no se han publicado estudios específicos.
- La longitud de contexto no está especificada, por lo que se desconoce el límite de tokens para conversaciones largas o imágenes de alta resolución.
- Al ser una versión GGUF, la calidad de la cuantización puede afectar ligeramente la precisión en comparación con el modelo original en punto flotante.

## Enlaces

- [HuggingFace - LiquidAI/LFM2.5-VL-3B-GGUF](https://huggingface.co/LiquidAI/LFM2.5-VL-3B-GGUF)
- [Modelo base - LiquidAI/LFM2.5-VL-3B](https://huggingface.co/LiquidAI/LFM2.5-VL-3B)
- [Playground de Liquid AI](https://playground.liquid.ai/)
- [Documentación de LFM](https://docs.liquid.ai/lfm/getting-started/welcome)
- [LEAP](https://leap.liquid.ai/)
- [Discord de Liquid AI](https://discord.com/invite/liquid-ai)
