# donedynamics/Qwen3.8-27B-heretic-MLX-8bit

## Resumen

El modelo `donedynamics/Qwen3.8-27B-heretic-MLX-8bit` es una conversión cuantizada a 8 bits en formato MLX, diseñada para ejecutarse en hardware Apple Silicon, del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`. Este último es un derivado "abliterado" del modelo Qwen3.8-27B de Alibaba, en el que se ha eliminado quirúrgicamente el comportamiento de rechazo (refusal) propio del ajuste de seguridad, de modo que responde a peticiones que un modelo alineado normalmente declinaría. El repositorio actual solo cambia el formato y la precisión de los pesos; no añade ni elimina alineación adicional.

La conversión es exclusivamente de texto: el modelo base original es multimodal (imagen-texto), pero esta versión MLX solo incluye la torre de lenguaje, sin configuración de visión ni tensores asociados. La cuantización a 8 bits reduce el tamaño a 28,6 GB y permite una generación de aproximadamente 22,2 tokens por segundo en un Mac Studio M3 Ultra con 512 GB de memoria unificada, con un pico de memoria de 28,9 GB. La licencia es Apache-2.0, heredada de la cadena de modelos original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8), solo torre de lenguaje |
| Parametros totales | 7.566.401.024 (según safetensors; el nombre del modelo sugiere 27B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B tiene 262K tokens nativos, pero esta conversión no lo especifica) |
| Tipos de cuantizacion | 8-bit (MLX); también existen builds de 4-bit y 6-bit del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27 mil millones de parámetros, desarrollado por el equipo Qwen de Alibaba (Tongyi Lab), con capacidad multimodal (imagen-texto) y una ventana de contexto nativa de 262K tokens. Sobre este modelo, `trohrbaugh` aplicó una técnica de "abliteración" que elimina selectivamente las activaciones responsables del comportamiento de rechazo, dando lugar a `Qwen3.8-27B-heretic-ara`. Este proceso no implica entrenamiento adicional, sino una modificación de los pesos basada en análisis de activaciones.

La conversión a MLX se realizó con `mlx-lm` 0.31.3 a partir de los pesos bf16 del modelo abliterado, en su revisión `a67ae100d933c0d17af3232bda35825979fc63ce`. La cuantización a 8 bits reduce la precisión de los pesos manteniendo la arquitectura original. No se realizó ningún ajuste fino ni alineación adicional en este repositorio. La conversión solo incluye la torre de lenguaje; el config no contiene `vision_config` y ninguno de los 1847 tensores pertenece a la torre de visión, por lo que la entrada de imágenes o vídeo no funciona.

## Capacidades

- Generación de texto libre y conversacional, con soporte de chat multi-turno mediante plantilla de chat estándar.
- Modo de razonamiento configurable: la plantilla de chat admite `enable_thinking` y `reasoning_effort`. El pensamiento está activado por defecto y consume tokens antes de la respuesta final; se puede desactivar con `enable_thinking=False`.
- Al estar abliterado, responde a peticiones que un modelo alineado rechazaría, incluyendo contenido sensible o controvertido (sin garantía de calidad ni filtrado).
- Capacidades del modelo base (según documentación de Qwen3.8-27B): generación de código, razonamiento matemático, planificación de tareas multi-paso y manejo de herramientas (tool calling). Sin embargo, esta conversión al ser text-only puede no incluir funcionalidades que dependan de entrada visual.
- Soporte multilingüe no documentado específicamente para esta conversión; el modelo base es multilingüe, pero no se confirma en esta versión.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo se comporta un modelo sin restricciones de rechazo, útil para analizar sesgos, riesgos y mecanismos de alineación en entornos controlados de laboratorio.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o contenido literario donde el autor necesita explorar temas tabú sin filtros automáticos, siempre bajo supervisión humana.
- Desarrollo de prototipos de asistentes conversacionales en entornos de prueba: al no rechazar peticiones, se puede evaluar la capacidad del modelo para mantener diálogos largos y coherentes sin interrupciones por políticas de seguridad.
- Evaluación de la robustez de modelos de moderación de contenido: se puede usar como generador de entradas adversas para probar sistemas de filtrado y moderación en plataformas.
- Pruebas de rendimiento de inferencia en Apple Silicon: gracias a su cuantización MLX, sirve para medir velocidad y uso de memoria en Macs con chip M-series, comparando distintas precisiones (4-bit, 6-bit, 8-bit).
- Generación de código en entornos sin restricciones de contenido: el modelo base tiene buenas capacidades de programación; esta versión puede usarse para generar código en contextos donde el prompt incluya lenguaje ofensivo o peticiones que otros modelos rechazarían, aunque no se recomienda para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento documentada es la velocidad de generación medida en un Mac Studio M3 Ultra (512 GB), con un prompt de 68 tokens y 120 tokens generados:

| Build | Tamano | Bits/weight | Generacion | Memoria pico |
|---|---|---|---|---|
| 4-bit | 15,1 GB | 4,501 | 37,9 tok/s | 15,5 GB |
| 6-bit | 21,4 GB | 6,501 | 27,9 tok/s | 22,2 GB |
| 8-bit | 28,6 GB | 8,501 | 22,2 tok/s | 28,9 GB |

Estos valores corresponden a una sola ejecución en una sola máquina y deben tomarse como una guía de orden de magnitud, no como un benchmark formal.

## Requisitos de hardware

- La versión 8-bit ocupa 28,6 GB en disco y requiere aproximadamente 28,9 GB de memoria pico durante la inferencia.
- Diseñado específicamente para Apple Silicon (chips M-series) mediante el framework MLX.
- En un Mac Studio M3 Ultra con 512 GB de memoria unificada, alcanza ~22,2 tok/s con la cuantización 8-bit; las versiones 4-bit y 6-bit son más rápidas (37,9 y 27,9 tok/s respectivamente) y consumen menos memoria.
- No se proporcionan requisitos para GPUs NVIDIA o AMD; MLX es un framework exclusivo de Apple, aunque podría ejecutarse en otras plataformas mediante adaptaciones no oficiales.
- Opciones de despliegue: `mlx-lm` (librería oficial de MLX) para generación desde línea de comandos o Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Para uso en producción, se recomienda verificar la latencia en el hardware objetivo, ya que los datos medidos son de una configuración específica.

## Comparativa con modelos similares

La comparación más directa es con el modelo base `Qwen/Qwen3.8-27B` (sin abliterar) y con las otras cuantizaciones MLX del mismo autor. No se dispone de datos de otras conversiones MLX de modelos similares.

| Modelo | Tamano | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27B | 262K | Apache-2.0 | bf16 | Multimodal, con alineación de seguridad |
| trohrbaugh/Qwen3.8-27B-heretic-ara | 27B | No disponible | Apache-2.0 | bf16 | Abliterado, sin rechazo |
| donedynamics/Qwen3.8-27B-heretic-MLX-8bit | 7,5B (según safetensors) | No disponible | Apache-2.0 | MLX 8-bit | Text-only, cuantizado para Apple Silicon |

La discrepancia en el número de parámetros (7,5B frente a 27B) no está explicada en la documentación; podría deberse a una conversión parcial o a un error en los metadatos. Se recomienda verificar antes de usarlo en entornos críticos.

## Limitaciones y advertencias

- Modelo abliterado: no tiene filtros de seguridad, por lo que puede generar contenido ofensivo, peligroso, ilegal o éticamente problemático. No debe usarse en producción sin una capa de moderación externa.
- Solo texto: la entrada de imágenes o vídeo no funciona, a pesar de que el modelo base es multimodal.
- Riesgo de alucinación: al no estar alineado, puede producir afirmaciones falsas o inventadas con mayor frecuencia que un modelo ajustado, especialmente en temas controvertidos.
- Sesgos no documentados: no se ha evaluado formalmente el sesgo del modelo abliterado; puede amplificar estereotipos o contenido discriminatorio.
- Longitud de contexto no confirmada: aunque el base tiene 262K tokens, esta conversión no especifica su ventana real; se recomienda probar con secuencias largas antes de confiar en ella.
- Licencia Apache-2.0 permite uso comercial, pero el contenido generado es responsabilidad del usuario; se deben cumplir las leyes aplicables.
- Rendimiento medido en una sola configuración de hardware; los resultados pueden variar significativamente en otros dispositivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-8bit
- Modelo base abliterado: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Blog de AMD sobre ejecución de Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Jetson AI Lab sobre Qwen3.8 27B: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
