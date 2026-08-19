# Foresee/Qwen3.8-9B-heretic-uncensored-5bit-MLX

## Resumen
El modelo Foresee/Qwen3.8-9B-heretic-uncensored-5bit-MLX es una conversión a pesos cuantizados en 5 bits (formato MLX) del modelo rohit267/Qwen3.8-9B-heretic-uncensored, que a su vez es una versión "uncensored" (sin censura) del modelo Qwen3.8-9B, obtenida mediante la herramienta Heretic. Este modelo está diseñado para ejecutarse en Apple Silicon a través de la librería MLX, ofreciendo una alternativa ligera y rápida para generación de texto sin los filtros de seguridad habituales.

El modelo base Qwen3.8-9B es una destilación de Qwen3.8 2.4T A95B (un modelo MoE gigante) en la arquitectura Qwen3.5-9B, entrenado sobre aproximadamente 70.000 trazas de razonamiento del profesor, cubriendo matemáticas, código, razonamiento general, instrucciones y uso de herramientas. La conversión MLX reduce el tamaño de los pesos a 5 bits con un grupo de 32, lo que permite ejecutar el modelo en dispositivos con memoria moderada, como se demuestra en la prueba de humo que reporta un pico de memoria de 6,859 GB.

La relevancia de este modelo radica en su doble naturaleza: por un lado, ofrece una versión cuantizada y optimizada para Apple Silicon de un modelo de razonamiento avanzado; por otro, al eliminar la censura, permite explorar casos de uso creativos y de investigación donde los filtros estándar podrían ser limitantes, aunque con las advertencias éticas correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5-9B), destilado de Qwen3.8 2.4T A95B |
| Parametros totales | 1.959.473.664 (según safetensors del repo; el nombre sugiere 9B, pero el peso real reportado es menor) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 32, modo affine (MLX) |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-9B es una destilación de Qwen3.8 2.4T A95B, un modelo MoE de 2,4 billones de parámetros, en la arquitectura densa Qwen3.5-9B. El proceso de destilación utilizó aproximadamente 70.000 trazas de razonamiento del profesor, filtradas por calidad, abarcando matemáticas, código, razonamiento general, seguimiento de instrucciones y uso de herramientas. Esta destilación produce un modelo mucho más pequeño con capacidades de razonamiento comparables en tareas específicas.

La versión "heretic" se obtuvo mediante la herramienta Heretic, que elimina automáticamente la censura de modelos de lenguaje sin requerir conocimiento interno de la arquitectura. Esta modificación afecta a los pesos del modelo, eliminando los sesgos de rechazo y permitiendo generar contenido que normalmente sería bloqueado por los filtros de seguridad.

La conversión a MLX se realizó directamente desde los pesos originales en BF16, evitando una doble cuantización. Se utilizó cuantización afín de 5 bits con grupo de 32, resultando en un uso efectivo de aproximadamente 6,001 bits por peso, incluyendo escalas, sesgos y parámetros no cuantizados. La conversión fue validada con una prueba de humo que generó una respuesta correcta a "2 + 2" en Apple Silicon.

## Capacidades
- Generación de texto libre y conversacional en inglés.
- Razonamiento matemático y lógico, heredado de la destilación de Qwen3.8.
- Generación de código y asistencia en programación.
- Seguimiento de instrucciones y uso de herramientas (tool calling), según las capacidades del modelo base.
- Razonamiento multi-paso (chain-of-thought) para tareas complejas.
- Ausencia de filtros de censura, lo que permite generar contenido que los modelos estándar rechazan (con las advertencias correspondientes).
- No se ha confirmado soporte para visión, audio u otras modalidades.

## Casos de uso
- Investigación sobre alineación y seguridad: este modelo permite estudiar el comportamiento de modelos sin censura, comparando respuestas con versiones filtradas para analizar sesgos y efectos de la moderación.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones donde los límites temáticos pueden ser explorados sin bloqueos automáticos.
- Asistente de código en entornos locales: al ser ligero y ejecutarse en Apple Silicon, puede integrarse en IDEs para autocompletado y generación de funciones, aprovechando su capacidad de razonamiento.
- Prototipado rápido de agentes conversacionales: su tamaño reducido y la ausencia de censura permiten experimentar con personalidades y estilos de diálogo no convencionales.
- Educación y análisis de contenido sensible: generación de ejemplos para estudiar cómo los modelos manejan temas controvertidos, siempre en entornos controlados.
- Automatización de tareas de texto en inglés: resúmenes, extracción de información y redacción de documentos, aprovechando su capacidad de seguir instrucciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La única validación reportada es una prueba de humo que confirma que el modelo genera una respuesta correcta a "2 + 2" y que el pico de memoria durante la inferencia fue de 6,859 GB en Apple Silicon.

## Requisitos de hardware
- VRAM estimada: aproximadamente 6,9 GB en uso pico según la prueba de humo, por lo que es adecuado para Macs con 8 GB o más de memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de RAM unificada.
- No es compatible con GPUs NVIDIA o AMD directamente, ya que usa el framework MLX específico de Apple.
- Opciones de despliegue: mediante `mlx_lm.generate` de la librería MLX LM, o integración en aplicaciones Python con `mlx-lm`.
- Latencia y throughput: no disponibles; se espera un rendimiento razonable para un modelo de ~2B parámetros en 5 bits, pero no hay mediciones oficiales.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativo con otros modelos. La comparación más directa es con el modelo base sin cuantizar (rohit267/Qwen3.8-9B-heretic-uncensored) y con la versión GGUF Q5_0 (saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF), que es la referencia para esta conversión. La diferencia principal es el formato: MLX para Apple Silicon frente a GGUF para llama.cpp. En cuanto a calidad, la cuantización de 5 bits suele implicar una pérdida mínima de precisión respecto al BF16 original, pero no hay mediciones concretas.

## Limitaciones y advertencias
- El modelo es "uncensored": puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso debe restringirse a entornos de investigación y con supervisión humana.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- El número de parámetros reportado (1,96B) es significativamente menor que el nombre del modelo (9B), lo que sugiere una posible discrepancia entre el safetensors y la arquitectura declarada. Esto podría afectar a las capacidades esperadas.
- La cuantización de 5 bits puede introducir una ligera degradación en tareas de razonamiento complejo en comparación con el modelo en BF16.
- No se ha validado el rendimiento en tareas de tool calling o agentes; la información disponible solo confirma generación básica.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" puede implicar riesgos legales y éticos según el contexto de aplicación.

## Enlaces
- Repositorio del modelo: https://huggingface.co/Foresee/Qwen3.8-9B-heretic-uncensored-5bit-MLX
- Modelo base: https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Versión GGUF de referencia: https://huggingface.co/saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Información adicional sobre Qwen3.8: https://openlm.ai/qwen3.8/
