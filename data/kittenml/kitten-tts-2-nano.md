# KittenML/kitten-tts-2-nano

## Resumen

Kitten TTS 2 Nano es un modelo de síntesis de voz (text-to-speech) desarrollado por KittenML, diseñado para inferencia en CPU con un consumo de recursos mínimo. Se distribuye en dos formatos: un grafo ONNX con pesos cuantizados a int8 de solo 17,4 MB y los pesos originales en float32 para PyTorch. El modelo cubre 8 idiomas (inglés, alemán, español, italiano, portugués, ruso, hindi y francés) y ofrece 37 voces predefinidas con una frecuencia de muestreo de 24 kHz.

La propuesta de valor es clara: un modelo de 17 millones de parámetros por idioma que puede ejecutarse sin GPU y sin PyTorch instalado, lo que lo hace adecuado para despliegues en dispositivos de borde, aplicaciones de escritorio y servicios con requisitos estrictos de latencia y coste. La licencia Apache-2.0 cubre tanto los pesos como los paquetes de voz y los ficheros G2P (grapheme-to-phoneme) incluidos, lo que elimina fricciones para uso comercial.

El modelo se publicó en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face, por lo que se trata de un lanzamiento reciente sin validación comunitaria todavía. La información disponible proviene exclusivamente de la model card del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS; se distribuye como grafo ONNX y pesos PyTorch) |
| Parámetros totales | 17 M por modelo de idioma |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (ONNX), float32 (PyTorch) |
| Idiomas soportados | en, de, es, it, pt, ru, hi, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (int8), safetensors/PyTorch (float32) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo más allá de indicar que se trata de un sistema TTS con 17 millones de parámetros por idioma y una frecuencia de salida de 24 kHz. Se distribuye como grafo ONNX para ejecución con ONNX Runtime (backend por defecto, pesos int8) y como pesos float32 para PyTorch (backend `torch`, con soporte de GPU vía CUDA). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación.

El modelo incorpora ficheros G2P empaquetados para la conversión de grafemas a fonemas, cubiertos por la misma licencia Apache-2.0. La selección de voz determina el idioma de síntesis, y el parámetro `speed` permite ajustar la velocidad del habla. No hay información pública sobre innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en 8 idiomas: inglés, alemán, español, italiano, portugués (Brasil), ruso, hindi y francés.
- 37 voces predefinidas con nombres y descripciones asociadas (por ejemplo, "Eleanor" como historiadora sombría en inglés, "Sofia" como voz femenina 1 en español).
- Selección de voz por nombre (insensible a mayúsculas) o por descripción; si no se especifica voz, se usa la primera del idioma.
- Control de velocidad del habla mediante el parámetro `speed`.
- Salida de audio a 24 kHz.
- Ejecución en CPU sin necesidad de PyTorch (backend ONNX int8) o en GPU con PyTorch float32.
- Conversión de grafemas a fonemas integrada mediante ficheros G2P empaquetados.
- No se documentan capacidades de clonación de voz, emoción controlable, tool calling ni razonamiento multi-paso.

## Casos de uso

- **Lectura de notificaciones y accesibilidad en aplicaciones de escritorio**: el modelo ONNX int8 de 17,4 MB puede empaquetarse dentro de una aplicación sin dependencias pesadas y ejecutarse en CPU, lo que permite leer en voz alta notificaciones o contenido de pantalla en tiempo real sin conexión a red.
- **Asistentes de voz embebidos en dispositivos de borde**: con 17 M de parámetros por idioma y ejecución en CPU, cabe en dispositivos con recursos limitados (Raspberry Pi, routers, electrodomésticos conectados) donde no hay GPU disponible.
- **Generación de audiolibros y pódcasts automatizados**: las 10 voces en inglés con descripciones de personaje (historiador, periodista, locutor deportivo) permiten asignar voces diferenciadas a narradores o secciones de un mismo contenido.
- **Atención al cliente telefónica o por voz**: la latencia reducida de un modelo pequeño en CPU y el soporte de 8 idiomas permiten construir sistemas IVR multilingües sin depender de servicios en la nube.
- **Localización de contenido multimedia**: un mismo pipeline puede generar pistas de voz en español, francés, alemán, italiano, portugués, ruso e hindi a partir de guiones traducidos, usando las voces nativas de cada idioma.
- **Prototipado rápido de interfaces de voz**: la API de Python (`pip install kittenml`) y la posibilidad de alternar entre backend ONNX y PyTorch facilitan la experimentación en notebooks y entornos de desarrollo sin infraestructura GPU.
- **Sistemas de anuncios públicos y señalización**: la síntesis en CPU con bajo consumo permite generar anuncios pregrabados en múltiples idiomas para aeropuertos, estaciones o comercios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no aplica en el backend ONNX int8 (ejecución en CPU, sin VRAM). En el backend PyTorch float32, el modelo de 17 M de parámetros ocupa aproximadamente 68 MB en memoria (17 M × 4 bytes); con overhead de activaciones y del runtime, el consumo es marginal incluso en GPUs de gama baja.
- **GPU recomendadas**: cualquier GPU con soporte CUDA puede ejecutar el backend `torch` (por ejemplo, RTX 4090, A100, H100), aunque el modelo está optimizado para CPU y no requiere GPU.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo, e incluso en iGPU y CPU sin aceleración.
- **Opciones de despliegue**: ONNX Runtime (backend por defecto), PyTorch (backend `torch`, con `device="cuda"` opcional), y la librería `kittenml` como envoltorio de alto nivel.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos TTS, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Sin validación comunitaria**: el modelo no registra descargas ni interacciones en Hugging Face en el momento de la ficha, por lo que no hay evidencia externa sobre su calidad o estabilidad en producción.
- **Riesgo de alucinación y errores de pronunciación**: al no publicarse benchmarks ni evaluaciones de naturalidad (MOS) o inteligibilidad (WER), no es posible cuantificar la fidelidad de la síntesis; los ficheros G2P incluidos pueden fallar en palabras fuera de vocabulario o nombres propios.
- **Cobertura de voces desigual**: el inglés dispone de 10 voces, mientras que el francés solo tiene 3 y el resto de idiomas 4; la variedad de registros y géneros es limitada fuera del inglés.
- **Sin control emocional ni clonación**: las voces son fijas y no se documentan parámetros de emoción, estilo o clonación de voz, lo que limita aplicaciones que requieran expresividad variable.
- **Idiomas no cubiertos**: no hay soporte para árabe, chino, japonés, coreano ni otras lenguas no listadas; el portugués está limitado a la variante de Brasil.
- **Licencia**: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible, pero conviene revisar los términos de los ficheros G2P empaquetados.
- **Dependencia de la librería `kittenml`**: la API de referencia requiere instalar el paquete `kittenml`, cuyo mantenimiento y compatibilidad futura no están garantizados por la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KittenML/kitten-tts-2-nano
- Paquete Python: `pip install kittenml` (no se proporciona URL del repositorio en la información disponible)
- Paper, blog o demo: no disponible en la información proporcionada.
