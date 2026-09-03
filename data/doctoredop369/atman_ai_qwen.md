# DoctorEdoP369/Atman_Ai_Qwen

## Resumen

Atman_Ai_Qwen es un modelo de lenguaje de 8.950 millones de parametros desarrollado por DoctorEdoP369, construido a partir del modelo base DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED. Se distribuye exclusivamente en formato GGUF, lo que permite su ejecucion offline en hardware de consumo, e incluye un proyector multimodal para soporte de vision. El modelo opera en modo thinking, generando una cadena de razonamiento explicita antes de cada respuesta, y esta orientado al razonamiento profundo tanto cientifico-matematico como psicologico.

El autor lo describe como un modelo con filtros de seguridad reducidos, una decision de diseno deliberada orientada a la autonomia del usuario, y con la ventana de contexto extendida mediante archivos Yarn. Se posiciona como una alternativa de alto rendimiento dentro de la familia Qwen 3.5, con capacidades multilingues y de conversacion multi-turno coherente. En el momento de la consulta, el modelo no registra descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (detalles especificos no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (extendida mediante Yarn, sin cifra publicada) |
| Tipos de cuantizacion | GGUF (se menciona Q5 como la version mas debil; no se listan todas las variantes) |
| Idiomas soportados | Multilingue (lista especifica no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la base Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED, un modelo de 9B parametros de la familia Qwen 3.5. Sobre esta base, DoctorEdoP369 ha aplicado un ajuste fino orientado a potenciar el razonamiento profundo, la coherencia en conversaciones multi-turno y las capacidades de analisis psicologico. El modelo genera una cadena de razonamiento explicita (thinking mode) antes de cada respuesta, y mantiene el razonamiento a lo largo de varios intercambios en lugar de reiniciarlo en cada mensaje.

La extension de contexto se ha realizado mediante archivos Yarn, aunque no se publica la longitud final de la ventana. El modelo incluye un proyector multimodal para soporte de vision, cuya disponibilidad depende del cliente de inferencia utilizado. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion empleadas (RLHF, DPO, etc.).

## Capacidades

- Razonamiento profundo con cadena de pensamiento explicita (thinking mode) antes de cada respuesta.
- Conversaciones multi-turno coherentes, con razonamiento mantenido a lo largo de varios intercambios.
- Soporte de vision mediante proyector multimodal incluido (depende del cliente de inferencia).
- Capacidades multilingues.
- Razonamiento cientifico-matematico y analisis psicologico.
- Narrativa y escritura creativa (etiquetado como story).
- Filtros de seguridad reducidos: responde a preguntas que los asistentes alojados suelen rechazar.

## Casos de uso

- Analisis psicologico y conversacional: el modelo esta ajustado para razonar a nivel psicologico, lo que lo hace util para sesiones de reflexion guiada, analisis de patrones de comportamiento o exploracion de dilemas personales en un entorno privado y offline.
- Razonamiento cientifico y matematico: su modo thinking con cadena de razonamiento explicita permite abordar problemas complejos de matematicas o fisica, facilitando la revision del proceso de deduccion.
- Escritura creativa y narrativa: con soporte para storytelling, puede generar relatos largos y coherentes, manteniendo el hilo argumental a lo largo de multiples intercambios.
- Asistente personal offline: al distribuirse en GGUF, puede ejecutarse en hardware de consumo sin conexion, lo que garantiza privacidad total en las conversaciones.
- Analisis de imagenes con vision: gracias al proyector multimodal, puede describir o interpretar imagenes cuando se usa con un cliente compatible (por ejemplo, llama.cpp con soporte mmproj).
- Investigacion y experimentacion con modelos sin censura: su filtrado de seguridad reducido lo hace util para investigar comportamientos de modelos sin restricciones, siempre bajo responsabilidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo se distribuye en GGUF, disenado para ejecutarse en hardware de consumo.
- El repositorio ocupa 43,2 GB, lo que sugiere la presencia de multiples cuantizaciones, aunque no se listan explicitamente.
- La version Q5 se describe como la mas debil, lo que implica la existencia de cuantizaciones superiores (Q6, Q8, etc.).
- Para una cuantizacion Q5 de un modelo de 9B se estiman entre 6 y 8 GB de VRAM; para Q8 se necesitarian aproximadamente 10-12 GB (estimaciones orientativas basadas en el tamano tipico de GGUF para modelos de este tamano).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros clientes compatibles con GGUF y archivos mmproj para vision.
- No se dispone de datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atman_Ai_Qwen | 8,95 B | No disponible (Yarn) | Apache 2.0 | GGUF | Fine-tune de Qwen3.5-9B, sin censura, vision |
| Qwen3.5-9B (base) | ~9 B | No disponible | Apache 2.0 | safetensors | Modelo base original de la familia Qwen 3.5 |
| DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED | ~9 B | No disponible | Apache 2.0 | safetensors | Base directa de Atman_Ai_Qwen |

No se dispone de datos de rendimiento comparativo publicados para estos modelos.

## Limitaciones y advertencias

- Filtros de seguridad reducidos: el modelo responde a preguntas que los asistentes alojados rechazan. El uso y las consecuencias son responsabilidad exclusiva del usuario.
- Riesgo de alucinacion: el modelo puede estar confiadamente equivocado. La cadena de razonamiento visible facilita la deteccion de errores, pero no los previene.
- No es un profesional: las respuestas no sustituyen el consejo de medicos, abogados, contables o ingenieros.
- Soporte de vision dependiente del cliente: varias aplicaciones locales ignoran el archivo mmproj, por lo que la funcionalidad de vision puede no estar disponible en todos los entornos.
- Parametros de inferencia recomendados: el autor advierte que usar parametros distintos a los recomendados (temperatura 0,6; top_p 0,96; top_k 20; min_p 0,03; presence_penalty 0,04; repeat_penalty 1,06) puede impedir que el modelo funcione correctamente.
- Sin datos de benchmarks publicados: no es posible verificar objetivamente las afirmaciones de rendimiento del autor.
- Modelo sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DoctorEdoP369/Atman_Ai_Qwen
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Sitio oficial de Qwen: https://qwen.ai/home
- Documentacion de Qwen: https://qwen.readthedocs.io/
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
