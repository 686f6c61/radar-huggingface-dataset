# Lysandra999/Senik-Kokoro-82M

## Resumen

Senik-Kokoro-82M es un derivado del modelo de síntesis de voz hexgrad/Kokoro-82M, publicado por el usuario Lysandra999 en Hugging Face. No se trata de un reentrenamiento ni de un ajuste fino de los pesos del modelo base, sino de una distribución empaquetada que añade un léxico de pronunciación personalizado (G2P) para corregir la forma en que Kokoro pronuncia la palabra "Senik", junto con una selección de voces y un pequeño wrapper en Python que aplica el parche automáticamente.

El modelo hereda la arquitectura y el tamaño del Kokoro original (82 millones de parámetros), un modelo TTS ligero, de código abierto y pensado para inferencia eficiente incluso en CPU. La aportación concreta de esta distribución es el fichero `senik_lexicon.json`, que sobrescribe la conversión grafema-fonema de Misaki para que "Senik" se pronuncie como "sɛnˈiːk" (Sen-eeek) en lugar de la forma por defecto "sˈinɪk" (SEE-nik).

Es relevante ahora por su carácter de ejemplo práctico de personalización de TTS mediante léxicos fonéticos sin reentrenar: muestra cómo ajustar pronunciaciones específicas (nombres propios, marcas, jerga) en un pipeline de Kokoro con un wrapper de una sola función. El repo ocupa 0,3 GB y tiene licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (modelo TTS de hexgrad/Kokoro-82M; arquitectura concreta no detallada en la informacion disponible) |
| Parametros totales | 82M (segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y PyTorch (.pt para las voces: `voices/am_fenrir.pt`, `voices/senik_expressive_cloned.pt`) |

## Arquitectura y entrenamiento

El modelo es una distribución del Kokoro-82M original; no se documenta en la información proporcionada ningún proceso de entrenamiento adicional ni ajuste fino de pesos. La modificación consiste en un parche de pronunciación a nivel de G2P: el fichero `senik_lexicon.json` define la entrada `"Senik": "sɛnˈiːk"`, que se aplica sobre el pipeline de Misaki (el conversor grafema-fonema usado por Kokoro) para corregir la pronunciación por defecto.

El paquete incluye además el wrapper `senik_kokoro_wrapper.py`, que expone la función `load_senik_kokoro()` como helper de carga directa que aplica automáticamente el léxico. Se incluyen las voces `am_fenrir` y, si está empaquetada, `senik_expressive_cloned`. No se detallan en la información disponible datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), ya que se heredan del modelo base sin cambios documentados.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto.
- Pronunciación personalizada de "Senik" mediante léxico G2P (`sɛnˈiːk`).
- Selección de voz por identificador (`voice="am_fenrir"` u otras voces empaquetadas).
- Integración como pipeline de Hugging Face (`text-to-speech`).
- Carga simplificada mediante `load_senik_kokoro()`, que aplica el parche de pronunciación de forma transparente.
- Soporte de voces clonadas/expresivas si se incluye `senik_expressive_cloned.pt`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada, thinking mode ni multilingüismo más allá del inglés.

## Casos de uso

- Síntesis de voz con nombres propios corregidos: el léxico permite que "Senik" se pronuncie correctamente en asistentes, demos o narraciones, evitando la pronunciación errónea por defecto de Kokoro.
- Integración en pipelines de TTS existentes: al ser un drop-in sobre Kokoro, se puede sustituir la carga estándar por `load_senik_kokoro()` sin reescribir el código de inferencia.
- Generación de audiolibros o narraciones en inglés: Kokoro-82M es ligero y adecuado para sintetizar grandes volúmenes de texto con voces consistentes.
- Prototipado de asistentes de voz: el tamaño reducido (82M) permite ejecución en CPU o GPU modesta durante desarrollo y pruebas.
- Personalización de marca o producto: el patrón de léxico G2P sirve como plantilla para corregir la pronunciación de otros nombres propios o términos específicos del dominio.
- Demos y contenido educativo: permite generar audio con pronunciaciones controladas para materiales de formación o presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; por el tamaño (82M parámetros) el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se documentan en la información disponible; por tamaño, cualquier GPU consumer moderna (p. ej. RTX 3060 o superior) es suficiente.
- Ejecución en CPU: viable por el reducido tamaño del modelo, aunque no se aportan cifras de latencia.
- Opciones de despliegue: pipeline de Hugging Face (`text-to-speech`) mediante el wrapper incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Senik-Kokoro-82M | 82M | en | apache-2.0 | Distribución de Kokoro con léxico G2P personalizado |
| hexgrad/Kokoro-82M | 82M | en (y otros segun version) | apache-2.0 | Modelo base original, sin parche de pronunciación |
| Otros TTS ligeros | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se documentan otros idiomas.
- El parche de pronunciación está limitado a la entrada "Senik"; otras palabras mantienen el comportamiento por defecto de Kokoro.
- No se documentan sesgos específicos, pero al heredar el modelo base puede reproducir sesgos de pronunciación o prosodia del mismo.
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero sí posible en forma de prosodia o pronunciación incorrecta en términos no cubiertos por el léxico.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las voces incluidas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por la comunidad.
- No se documentan requisitos de hardware ni benchmarks, lo que limita la evaluación de rendimiento en producción.
- La fecha de creación indicada (2026-11-22) es futura respecto a la información habitual; conviene verificar la integridad del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Lysandra999/Senik-Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
