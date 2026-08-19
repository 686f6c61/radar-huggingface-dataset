# Mariem-Daha/RACHIDA-Mini-2.03B-GGUF

## Resumen

RACHIDA-Mini-2.03B-GGUF es un artefacto de cuantización en formato GGUF del modelo base Qwen/Qwen3-1.7B, publicado por la autora Mariem-Daha como parte del prototipo RACHIDA.AI, presentado al Africa Deep Tech Challenge 2026. El repositorio contiene un único archivo GGUF en cuantización Q4_K_M, sin ningún fine-tune o adaptador adicional: se trata de una conversión directa de los pesos de Qwen3-1.7B, cuyo conteo de tensores reporta 2.031.739.904 parámetros (el nombre "2.03B" refleja ese conteo, no un modelo distinto). El propósito declarado es la evaluación de lenguaje offline con llama.cpp, la investigación preliminar en información de salud materna y la demostración de inferencia solo con CPU en portátiles convencionales.

La relevancia de este artefacto no reside en un modelo nuevo, sino en su papel como componente de un sistema mayor (RACHIDA.AI) que incorpora controles deterministas de seguridad, contenido clínico firmado y rutas de escalado. El GGUF por sí mismo no incluye esos controles y no está validado clínicamente. Su interés técnico radica en ser una cuantización ligera (1,28 GB) que permite ejecutar un modelo de la familia Qwen3 en equipos sin GPU, con un rendimiento medido en desarrollo de unos 23 tokens por segundo en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, decoder-only) |
| Parametros totales | 2.031.739.904 (conteo de tensores del GGUF) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible en la model card; el comando de ejemplo usa 2048 tokens |
| Tipos de cuantizacion | Q4_K_M (unico archivo en el repositorio) |
| Idiomas soportados | ingles (unico idioma declarado y evaluado) |
| Licencia | Apache-2.0 (hereda del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion Q4_K_M del modelo Qwen3-1.7B de Qwen Team, sin modificaciones en la arquitectura ni entrenamiento adicional. Qwen3-1.7B es un transformer decoder-only con atención completa, perteneciente a la familia Qwen3, que incluye soporte para reasoning mode y generation mode. El proceso de cuantización se realizó con llama.cpp, que convierte los pesos originales (probablemente en safetensors) a formato GGUF, reduciendo el tamaño de 1.7B parámetros a aproximadamente 1,28 GB. No se aplicó ningún fine-tune específico para salud materna; la model card indica explícitamente que "No RACHIDA-specific fine-tune or adapter is merged into this artifact". Los datos de entrenamiento del modelo base no se detallan en la información proporcionada, pero Qwen3-1.7B fue preentrenado por el equipo Qwen con datos multilingües (aunque este artefacto solo declara inglés).

## Capacidades

- Generación de texto en inglés, incluyendo tareas de razonamiento y comprensión, heredadas del modelo base Qwen3-1.7B.
- Soporte de modos de razonamiento y generación directa (característica de Qwen3), aunque no se verifica en este artefacto específico.
- Capacidad de ejecución offline completa: el comando de ejemplo usa llama.cpp sin acceso a red.
- Inferencia solo con CPU, sin necesidad de GPU, gracias a la cuantización Q4_K_M.
- No se documentan capacidades de tool calling, function calling ni agentes en la model card. El modelo base Qwen3-1.7B las soporta, pero no hay confirmación para este artefacto.
- Multilingüismo: solo inglés declarado; no se garantiza otros idiomas.

## Casos de uso

- Evaluación offline de modelos de lenguaje en entornos sin conexión: el GGUF permite probar Qwen3-1.7B en portátiles o servidores sin GPU, usando llama.cpp, ideal para investigación o desarrollo en zonas con recursos limitados.
- Investigación preliminar en información de salud materna: el prototipo RACHIDA.AI lo emplea para generar respuestas educativas a pacientes, siempre bajo supervisión humana y con controles externos de seguridad (no como sistema autónomo).
- Demostración de inferencia CPU-only en hardware commodity: las mediciones de desarrollo (23 tokens/s, 1,9 GB de RAM) muestran que es viable en equipos con 8 GB o más de RAM.
- Desarrollo de aplicaciones de chat o asistentes de texto en inglés con requisitos mínimos de hardware: por su tamaño reducido, puede integrarse en aplicaciones de escritorio o servicios ligeros.
- Pruebas de cuantización y comparación de rendimiento: al ser una conversión directa, sirve como referencia para estudiar el impacto de Q4_K_M en modelos pequeños.
- Educación y formación en despliegue de LLMs: útil para enseñar a ejecutar modelos locales con llama.cpp sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales para este artefacto. La model card incluye una medición de desarrollo no oficial, realizada en un portátil con Windows y 31,7 GB de RAM, con 4 hilos CPU y sin GPU:

| Metrica | Valor | Notas |
|---|---|---|
| Velocidad de generacion | 23,09 tokens/s | Medicion de desarrollo, no oficial |
| Latencia del primer token | 2.521,14 ms | Medicion de desarrollo |
| Pico de RSS | 1.937,40 MB | Medicion de desarrollo |
| ARC-Easy accuracy (50 muestras, seed 42) | 0,76 | Medicion de desarrollo, muestra pequena |

Estos datos no son comparables con benchmarks estandarizados (MMLU, HumanEval, etc.) y no deben usarse como referencia de calidad del modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta completamente en CPU. El pico de memoria RAM medido en desarrollo fue de 1.937 MB (aproximadamente 1,9 GB).
- GPU recomendada: ninguna; el comando de ejemplo usa `-ngl 0` (cero capas en GPU).
- CPU: cualquier procesador moderno; la medición de desarrollo usó 4 hilos.
- RAM: se recomienda al menos 4 GB libres (la medición usó 1,9 GB en un sistema con 31,7 GB).
- Opciones de despliegue: llama.cpp (llama-cli), también compatible con servidores llama.cpp, Ollama (si se convierte a formato adecuado) y otras herramientas que soporten GGUF.
- Latencia y throughput: en el equipo de desarrollo, 23 tokens/s de generación y 2,5 segundos de latencia del primer token. Estos valores variarán según el hardware.

## Comparativa con modelos similares

El artefacto es una cuantización de Qwen3-1.7B, por lo que la comparación más directa es con el modelo base sin cuantizar y con otras cuantizaciones del mismo modelo. No se dispone de datos de rendimiento comparativos con otros modelos pequeños en la información proporcionada.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RACHIDA-Mini-2.03B-GGUF (este) | 2,03B (tensores) | no disponible | Q4_K_M | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (base) | 1,7B | 32k (segun documentacion oficial de Qwen, no confirmado en la model card) | safetensors | Apache-2.0 | HuggingFace |
| Otros modelos GGUF de tamano similar (p.ej. Llama-3.2-1B, Phi-3-mini) | 1-3B | variable | variable | variable | variable |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No validado clínicamente: no es un dispositivo médico, sistema de diagnóstico, triaje, prescripción ni sustituto de un profesional sanitario. No debe usarse para decisiones que afecten a la seguridad del paciente.
- El GGUF no contiene los controles de seguridad de RACHIDA.AI (paquete de contenido clínico firmado, enrutamiento de peligros, guard de salida, controles de auditoría). Usarlo de forma aislada no ofrece esas garantías.
- Solo inglés: no se debe usar con otros idiomas, ya que no han sido evaluados.
- No se deben proporcionar registros de pacientes ni datos personales sensibles al modelo, según la model card.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin validación externa, las respuestas pueden ser incorrectas o peligrosas en contextos médicos.
- La cuantización Q4_K_M puede degradar ligeramente la calidad respecto al modelo original, aunque no se aportan datos comparativos.
- El conteo de parámetros (2,03B) difiere del nombre del modelo base (1,7B); se debe a la conversión de tensores y no implica un modelo distinto.
- No se garantiza compatibilidad con todas las versiones de llama.cpp; se recomienda usar la versión con la que se generó el archivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mariem-Daha/RACHIDA-Mini-2.03B-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
