# donedynamics/Qwen3.8-27B-heretic-VL-MLX-8bit

## Resumen

El modelo `donedynamics/Qwen3.8-27B-heretic-VL-MLX-8bit` es una conversión a MLX en precisión de 8 bits del checkpoint `trohrbaugh/Qwen3.8-27B-heretic-ara`, un derivado **abliterado** de `Qwen/Qwen3.8-27B` de Alibaba. La abliteración elimina quirúrgicamente el comportamiento de rechazo del modelo original, de modo que responde a peticiones que un modelo ajustado con seguridad normalmente declinaría. Esta conversión, realizada por `donedynamics`, conserva la torre de visión completa, por lo que el modelo es capaz de procesar imágenes además de texto.

El modelo base Qwen3.8-27B es un LLM multimodal denso de código abierto, orientado a tareas de codificación, flujos agénticos y automatización de oficina, con una ventana de contexto nativa de 262.144 tokens y razonamiento configurable. La conversión MLX está pensada exclusivamente para Apple Silicon y requiere la librería `mlx-vlm` (no `mlx-lm`, que descartaría la parte visual). El repositorio incluye también variantes en 4 bits, 6 bits y bf16, siendo esta la de 8 bits con un peso de 27,5 GB y un rendimiento medido de 23,1 tokens por segundo en un Mac Studio M3 Ultra.

La relevancia de este modelo reside en su doble naturaleza: por un lado, ofrece capacidades multimodales (imagen y texto) en hardware de Apple con cuantización eficiente; por otro, al estar abliterado, presenta un comportamiento sin restricciones que debe evaluarse cuidadosamente antes de cualquier despliegue en producción. La licencia Apache-2.0 permite uso comercial, pero la ausencia de alineación de seguridad implica que el responsable del despliegue debe aplicar sus propios filtros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.8-27B base) convertido a MLX |
| Parametros totales | 8.027.131.120 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | 8-bit (MLX); tambien disponibles 4-bit, 6-bit y bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso multimodal, desarrollado por el equipo Qwen de Alibaba, que combina un codificador de visión con un decodificador de lenguaje. Está diseñado para tareas de codificación, flujos agénticos de largo horizonte y automatización de oficina, con razonamiento configurable mediante los parámetros `enable_thinking` y `reasoning_effort`. La versión `heretic-ara` de `trohrbaugh` aplica una técnica de **abliteración** que elimina las capas responsables del rechazo a instrucciones dañinas, manteniendo intactas las capacidades cognitivas del modelo.

La conversión MLX realizada por `donedynamics` mantiene el `vision_tower` completo: de los 2180 tensores del checkpoint, 333 pertenecen a la torre de visión. La conversión se hizo con `mlx-vlm` 0.6.13 a partir de los pesos bf16 en la revisión `a67ae100d933c0d17af3232bda35825979fc63ce`, tras verificar la integridad de los 7 shards y 1199 tensores originales. No se ha añadido ni eliminado alineación adicional; el repo solo cambia el formato y la precisión.

## Capacidades

- **Vision-lenguaje**: procesa imágenes y las describe con precisión (formas, colores, posiciones y texto incrustado). Verificado con una imagen de prueba que contenía figuras geométricas y códigos.
- **Generación de texto**: completa tareas de lenguaje natural estándar, incluyendo razonamiento multi-step.
- **Razonamiento configurable**: el chat template soporta `enable_thinking` y `reasoning_effort`, permitiendo activar o ajustar el modo de pensamiento antes de la respuesta final.
- **Tool calling / function calling**: heredado del modelo base Qwen3.8-27B, que soporta integración con herramientas externas.
- **Capacidades agénticas**: el modelo base está optimizado para flujos agénticos de largo horizonte, por lo que esta conversión conserva esa capacidad.
- **Multilingüe**: no se dispone de información específica sobre los idiomas soportados en esta conversión, aunque el modelo base de Qwen suele cubrir múltiples idiomas.
- **Sin censura**: al estar abliterado, no rechaza peticiones que un modelo alineado declinaría; esto implica tanto una mayor flexibilidad como un riesgo de contenido inapropiado.

## Casos de uso

- **Análisis de imágenes en entornos controlados**: el modelo puede describir el contenido de capturas, diagramas o fotografías, útil para sistemas de documentación automática o accesibilidad, siempre que se apliquen filtros de contenido posteriores.
- **Generación de código con contexto visual**: un desarrollador puede enviar una captura de pantalla de un error o un diagrama de arquitectura y recibir código o explicaciones, aprovechando la ventana de 262K tokens para incluir fragmentos largos.
- **Automatización de oficina**: el modelo base está orientado a tareas de oficina como resúmenes, redacción de correos o extracción de datos de documentos escaneados, combinando visión y texto.
- **Agentes conversacionales sin restricciones**: para prototipos o investigación donde se necesita explorar respuestas no filtradas, el modelo puede actuar como un agente de chat con tool calling, aunque requiere supervisión humana.
- **Asistente de razonamiento multimodal**: con el modo `thinking` activado, puede resolver problemas que requieren combinar información visual y textual, como interpretar gráficos o tablas en imágenes.
- **Despliegue local en Apple Silicon**: gracias a la cuantización MLX, puede ejecutarse en Macs con suficiente memoria unificada, ideal para desarrolladores que necesitan un modelo multimodal privado sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de rendimiento en una máquina concreta (Mac Studio M3 Ultra, 512 GB de memoria unificada, macOS 26.5.2, `mlx-vlm` 0.6.13) con un prompt multimodal de 470 tokens:

| Metrica | Valor |
|---|---|
| Velocidad de generacion | 23,1 tok/s |
| Velocidad de prefill | 303-331 tok/s |
| Memoria pico | 34,7 GB |
| Tamano del repo | 27,5 GB (6 shards) |

Estos datos son orientativos y corresponden a una única ejecución, no a un benchmark estandarizado.

## Requisitos de hardware

- **VRAM estimada**: 34,7 GB de memoria pico en la versión 8-bit, medida en un Mac Studio M3 Ultra. La memoria requerida es unificada (CPU+GPU), no VRAM dedicada.
- **GPU recomendadas**: Apple Silicon con al menos 48 GB de memoria unificada para la versión 8-bit; para las versiones de 4-bit se necesitan unos 19 GB. No está pensado para GPUs NVIDIA o AMD de escritorio, aunque el modelo base sí puede ejecutarse en esas plataformas mediante otros formatos.
- **Compatibilidad con consumer GPU**: no directamente, dado que el formato MLX es específico de Apple. Sin embargo, el modelo base original está disponible en otros formatos (GGUF, etc.) para GPUs convencionales.
- **Opciones de despliegue**: `mlx-vlm` (librería de inferencia), interfaz de línea de comandos `mlx_vlm.generate`, y API Python. También es compatible con LM Studio en hardware AMD según el blog oficial de AMD, aunque esa compatibilidad se refiere al modelo base, no a esta conversión MLX.
- **Latencia y throughput**: 23,1 tok/s de generación y 303-331 tok/s de prefill en la máquina de referencia; estos valores variarán según el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Si | Apache-2.0 | safetensors, GGUF |
| Qwen3.8-27B-heretic-VL-MLX-8bit (este) | 8,03B | 262K | Si | Apache-2.0 | MLX safetensors |
| Qwen3.8-27B-heretic-MLX-4bit (texto) | 8,03B | 262K | No | Apache-2.0 | MLX safetensors |
| Qwen3-8B (modelo anterior) | 8B | 32K | No | Apache-2.0 | safetensors |

La comparativa muestra que esta conversión MLX tiene menos parámetros que el modelo base original (8,03B frente a 27B), probablemente debido a una poda o a una discrepancia en el nombre del repositorio. Las variantes de texto sin visión son más ligeras y rápidas, pero pierden la capacidad multimodal. No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría.

## Limitaciones y advertencias

- **Modelo abliterado**: al eliminar el comportamiento de rechazo, el modelo puede generar contenido dañino, ilegal o poco ético si se le solicita. No debe desplegarse directamente ante usuarios finales sin filtros de moderación adicionales.
- **Riesgo de alucinación**: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; el rendimiento en lenguas distintas del inglés o el chino puede ser inferior.
- **Requisito de `mlx-vlm`**: usar `mlx-lm` en su lugar descartaría silenciosamente la torre de visión, dejando un modelo solo texto sin aviso.
- **Hardware restringido**: el formato MLX solo funciona en Apple Silicon; no es portable a GPUs NVIDIA o AMD sin reconvertir.
- **Sin garantías de seguridad**: la model card advierte explícitamente que no se ha añadido alineación adicional y que el usuario debe evaluar el modelo antes de ponerlo en producción.
- **Licencia**: Apache-2.0 permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario final.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-VL-MLX-8bit
- Modelo base abliterado: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Variante de texto 4-bit: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-4bit
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
