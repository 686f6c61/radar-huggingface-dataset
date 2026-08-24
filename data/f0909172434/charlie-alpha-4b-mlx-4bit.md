# f0909172434/Charlie-Alpha-4B-MLX-4bit

## Resumen

Charlie alpha es un modelo experimental de la clase 4B, derivado del modelo base Qwen/Qwen3.5-4B (según la model card de Hugging Face; el repositorio GitHub menciona Qwen/Qwen3-4B-Thinking-2507 como base). Desarrollado por el usuario f0909172434, está especializado en matemáticas y programación (Python, C++) para inglés, chino simplificado y chino tradicional. No es un preentrenamiento desde cero, sino un fine-tuning mediante un adaptador LoRA cuantizado a 4 bits, entrenado con MLX en Apple Silicon.

Su relevancia radica en el uso de una técnica de enrutamiento disperso determinista: el adaptador LoRA se activa solo para prompts de código o chino, mientras que los prompts en inglés no relacionados con código usan el modelo base sin el adaptador. Esto permite mantener un solo modelo cargado en memoria con un coste adicional mínimo (adaptador de 8,52 MB). A pesar de su enfoque innovador, los resultados de evaluación no alcanzaron el umbral predeclarado de mejora de +2 puntos porcentuales, por lo que se considera un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con adaptador LoRA cuantizado y enrutamiento disperso determinista |
| Parametros totales | 4B clase (base) + 2.129.920 parámetros del adaptador |
| Parametros activos | No es MoE; el adaptador se activa selectivamente según el prompt (código o chino) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base 4-bit, adaptador de 8,52 MB |
| Idiomas soportados | Inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B (según la model card de Hugging Face) y aplica un adaptador LoRA cuantizado entrenado con QLoRA en MLX. La arquitectura de inferencia usa una ruta dispersa determinista: un clasificador de prompts decide si se activan ocho módulos LoRA en las últimas cuatro capas (para código o chino) o si se omite el adaptador (para inglés no relacionado con código). No se emplean modelos auxiliares, jueces ni segundas copias del base en tiempo de inferencia.

El entrenamiento, denominado FORGE, combina varias técnicas de ahorro computacional: decontaminación local de datos, puntuación con teacher forcing usando un modelo profesor de 9B, selección de tokens con brecha de pérdida positiva (se retuvieron el 52,7% de los tokens objetivo en inglés), y un esquema de pesos de pérdida que fija la masa de gradiente de idioma en 70% inglés, 15% chino simplificado y 15% chino tradicional, y la masa de categoría en 50% matemáticas, 25% Python y 25% C++. Se usaron placeholders validados para fórmulas, números, URLs y código durante la traducción. El conjunto de entrenamiento tiene 312 registros y el de validación 18. El entrenamiento se detuvo tras dos validaciones sin mejora, duró 2.896 segundos, alcanzó un pico de memoria de 16,05 GB y redujo la pérdida de validación de 0,8640 a 0,6867 en la iteración 431.

## Capacidades

- Generación de texto especializada en matemáticas (aritmética, álgebra, cálculo básico) y programación (Python, C++, estructuras de datos y algoritmos).
- Respuestas en inglés, chino simplificado y chino tradicional, con enrutamiento automático según el idioma y el dominio.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modelo puede generar explicaciones paso a paso.
- Capacidad de enrutamiento dinámico: el usuario puede forzar la ruta base o la ruta con adaptador mediante comandos `/route base` y `/route adapter`.
- Modo de razonamiento: no se especifica un modo "thinking" separado; el modelo base Qwen3.5-4B podría tener capacidades de razonamiento, pero no se documentan en esta ficha.

## Casos de uso

- Asistente de programación en Python y C++: el modelo puede generar fragmentos de código, explicar algoritmos y depurar errores. Su enrutamiento activa el adaptador para prompts de código, lo que mejora la precisión en tareas como HumanEval+ (según los resultados de evaluación).
- Resolución de problemas matemáticos en entornos educativos: útil para estudiantes de nivel introductorio a universitario que necesitan explicaciones paso a paso en inglés o chino.
- Traducción de problemas matemáticos entre inglés y chino: el entrenamiento con tripletes de idiomas (inglés, chino simplificado, chino tradicional) permite manejar enunciados equivalentes en distintos idiomas.
- Prototipado rápido en Apple Silicon: al ser un modelo MLX, se integra fácilmente en flujos de trabajo con Macs usando la librería mlx-lm, sin necesidad de GPUs NVIDIA.
- Evaluación de técnicas de fine-tuning eficiente: sirve como caso de estudio para investigadores interesados en QLoRA, enrutamiento disperso y selección de tokens con teacher forcing.
- Generación de código con verificación independiente: aunque el modelo puede producir programas, se recomienda ejecutarlos en entornos aislados y verificar resultados, lo que lo hace adecuado para entornos de desarrollo donde la revisión humana es parte del flujo.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo con el base Qwen3.5-4B MLX bajo las mismas condiciones (prompts, decodificación greedy, límites de generación). Se presentan dos conjuntos de evaluación: el "direct adapter final" (adaptador siempre activo) y la "confirmación con router disperso" (ruta automática). Ninguno alcanzó el umbral predeclarado de +2 puntos porcentuales.

| Conjunto | Base (aciertos) | Adapter directo (aciertos) | Delta (puntos) |
|---|---|---|---|
| Overall (62 tareas) | 43/62 (69,35%) | 44/62 (70,97%) | +1,62 |
| Código (16) | 11/16 | 12/16 | +6,25 |
| Matemáticas (40) | 28/40 | 28/40 | 0,00 |
| Inglés (42) | 27/42 | 26/42 | -2,39 |
| Chino simplificado (10) | 10/10 | 10/10 | 0,00 |
| Chino tradicional (10) | 6/10 | 8/10 | +20,00 |

| Conjunto (router disperso) | Base (aciertos) | Enrutado (aciertos) | Delta (puntos) |
|---|---|---|---|
| Overall (62 tareas) | 42/62 (67,74%) | 43/62 (69,35%) | +1,61 |
| HumanEval+ (8) | 7/8 | 8/8 | +12,50 |
| Código (16) | 11/16 | 12/16 | +6,25 |
| Matemáticas (40) | 27/40 | 27/40 | 0,00 |
| Inglés (42) | 24/42 | 25/42 | +2,38 |
| Chino simplificado (10) | 9/10 | 9/10 | 0,00 |
| Chino tradicional (10) | 9/10 | 9/10 | 0,00 |

El autor indica que la diferencia de una respuesta en 62 tareas no es estadísticamente concluyente y que los resultados son evidencia para estudio adicional, no una prueba de superioridad general.

## Requisitos de hardware

- El modelo está diseñado para MLX, la librería de aprendizaje automático de Apple para Apple Silicon (M1, M2, M3, M4 y sucesores).
- Durante el entrenamiento, el pico de memoria fue de 16,05 GB, lo que sugiere que una Mac con 16 GB o más de RAM unificada puede manejar el proceso de fine-tuning.
- Para inferencia, el modelo base de 4 bits más el adaptador de 8,52 MB requieren significativamente menos memoria; se estima que cabe en Macs con 8 GB de RAM unificada, aunque no se proporcionan cifras exactas.
- No se publican versiones GGUF ni formatos para GPUs NVIDIA; el autor indica que la ruta dispersa no puede colapsarse fielmente en un GGUF fusionado.
- Opciones de despliegue: uso interactivo con `charlie-alpha chat` o servidor con `charlie-alpha serve`, ambos desde el repositorio fuente con el entorno pinneado.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoría (p. ej., Llama-3.2-3B, Phi-3.5-mini) en la información proporcionada. La única comparativa publicada es contra el modelo base Qwen3.5-4B MLX, que es el punto de partida. Se puede considerar que el modelo es una variante especializada del base, con una mejora marginal en código y chino tradicional, pero sin ventaja clara en matemáticas o inglés general.

## Limitaciones y advertencias

- Modelo experimental en versión v0.2.0; no alcanzó el umbral predeclarado de +2 puntos porcentuales en ninguno de los dos conjuntos de evaluación.
- Los conjuntos de evaluación son pequeños (62 tareas), por lo que los resultados no son estadísticamente sólidos.
- El enrutamiento automático puede clasificar incorrectamente prompts en inglés que combinan dominios (p. ej., código con explicaciones en inglés), lo que degrada el rendimiento.
- Las pruebas, cálculos, explicaciones y programas generados pueden ser incorrectos; se recomienda ejecutar el código en entornos aislados y verificar respuestas importantes de forma independiente.
- No se publica GGUF; el modelo solo está disponible en formato MLX, lo que limita su uso a hardware Apple.
- Existe una discrepancia en el modelo base declarado: la model card de Hugging Face indica Qwen/Qwen3.5-4B, mientras que el repositorio GitHub menciona Qwen/Qwen3-4B-Thinking-2507. Esto puede afectar a la reproducibilidad.
- El export MLX "siempre activo" (adaptador fusionado) no reproduce la ruta canónica y se considera un artefacto especialista, no apto para uso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f0909172434/Charlie-Alpha-4B-MLX-4bit
- Repositorio GitHub: https://github.com/f0909172434/Charlie-Alpha-4B
- Model card en GitHub: https://github.com/f0909172434/Charlie-Alpha-4B/blob/main/MODEL_CARD.md
- README en inglés: https://github.com/f0909172434/Charlie-Alpha-4B/blob/main/README.en.md
- Modelo base Qwen3-4B-MLX-4bit (referencia): https://huggingface.co/Qwen/Qwen3-4B-MLX-4bit
