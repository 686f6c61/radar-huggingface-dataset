# marafx2007/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive

## Resumen

Gemma-4-E4B-Uncensored-HauhauCS-Aggressive es un derivado no oficial del modelo instructivo multimodal Gemma 4 E4B de Google, modificado por el usuario HauhauCS mediante técnicas de abliteration para eliminar los comportamientos de rechazo del modelo original. El resultado es un modelo que, según su autor, presenta 0 rechazos en 465 pruebas, manteniendo intactas las capacidades originales de generación de texto, visión, audio y video. El repositorio en Hugging Face está publicado por el usuario marafx2007, que actúa como redistribuidor de los pesos cuantizados.

El modelo se distribuye exclusivamente en formato GGUF con cuantizaciones personalizadas K_P (Perfect) generadas con matriz de importancia (imatrix), lo que permite su ejecución en runtimes como llama.cpp, LM Studio o koboldcpp. Aunque la model card indica 4 mil millones de parámetros, el archivo safetensors del modelo base registra 7.518.069.290 parámetros totales, probablemente incluyendo el proyector multimodal. Soporta un contexto de 131.072 tokens y una arquitectura de 42 capas con atención mixta (ventana deslizante de 512 tokens y atención completa). Su relevancia radica en ofrecer una alternativa sin restricciones de seguridad para casos de uso que requieren generación libre, aunque con las advertencias éticas y legales que ello conlleva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención mixta (sliding window de 512 tokens + atención completa), 42 capas, 18 capas KV compartidas |
| Parametros totales | 7.518.069.290 (según safetensors del modelo base; la model card indica 4B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, mmproj f16 |
| Idiomas soportados | inglés, multilingüe (según etiquetas; no se detallan idiomas concretos) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | GGUF (con archivo mmproj f16 para multimodalidad) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-e4b-it, un modelo instructivo multimodal de Google con 42 capas y una combinación de atención con ventana deslizante de 512 tokens y atención completa. Incluye 18 capas KV compartidas para optimizar el uso de memoria durante la generación. El modelo original soporta entrada de texto, imagen, video y audio, y el proyector multimodal se distribuye como archivo mmproj en formato f16.

La modificación realizada por HauhauCS consiste en un proceso de abliteration, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, sin reentrenar el modelo. Según la model card, no se modificaron los datos de entrenamiento ni las capacidades del modelo original; solo se eliminaron los mecanismos de negativa. La variante "Aggressive" es la más agresiva en este sentido, garantizando que el modelo no rechace ninguna petición, aunque puede añadir disclaimers cortos heredados del entrenamiento base. No se han publicado detalles sobre el dataset de entrenamiento original ni sobre el proceso exacto de abliteration.

## Capacidades

- Generación de texto libre sin rechazos: el modelo no se niega a responder a ninguna petición, incluyendo contenido sensible o controvertido.
- Multimodalidad nativa: procesa texto, imágenes, video y audio (requiere el archivo mmproj junto al GGUF principal).
- Razonamiento y conversación multi-turno: mantiene coherencia en diálogos largos gracias a su contexto de 131K tokens.
- Comprensión multilingüe: etiquetado como "multilingual", aunque no se especifican los idiomas exactos.
- Compatibilidad con herramientas de inferencia GGUF: funciona con llama.cpp, LM Studio, Jan, koboldcpp y otros runtimes compatibles.
- Soporte de chat template mediante la bandera `--jinja` en llama.cpp.
- Cuantizaciones optimizadas con imatrix para preservar la calidad en pesos abliterados.

## Casos de uso

- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas tabú o explícitos sin censura previa, aprovechando la ausencia de rechazos.
- Investigación en seguridad de IA: análisis del comportamiento de modelos sin alineación de seguridad, comparando respuestas con el modelo original para estudiar los efectos de la abliteration.
- Desarrollo de personajes conversacionales: creación de asistentes virtuales con personalidades extremas o sin filtros para entornos de rol o simulación.
- Análisis de contenido multimodal: procesamiento de imágenes, audio y video con descripción detallada, gracias a su capacidad nativa multimodal.
- Pruebas de robustez en sistemas de moderación: evaluación de clasificadores de contenido dañino usando un modelo que genera respuestas sin restricciones.
- Generación de código y documentación técnica: aunque no es su foco principal, mantiene las capacidades de razonamiento del modelo base para tareas de programación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares, y no se encontraron datos comparativos en la búsqueda web. El autor solo menciona la tasa de rechazos (0/465) como métrica de éxito de la modificación.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, entre 4,2 GB (Q2_K_P) y 7,6 GB (Q8_K_P) para el modelo principal, más 945 MB del mmproj f16 si se usa multimodalidad.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones Q4 o superiores; para Q8 se recomiendan 8 GB o más. Tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores son adecuadas.
- Compatible con GPU de consumo: sí, las cuantizaciones Q4 y Q5 caben en GPUs de 6-8 GB, y las Q3 en 4-6 GB.
- Opciones de despliegue: llama.cpp (con `--jinja` y `--mmproj` para multimodal), LM Studio, Jan, koboldcpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090, se espera una velocidad de generación de 50-100 tokens/s con cuantizaciones Q4, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | 7,5B (según safetensors) | 131K | Sí (texto, imagen, video, audio) | Gemma | GGUF en Hugging Face |
| google/gemma-4-e4b-it (base) | 4B (según model card) | 131K | Sí | Gemma | Pesos originales en HF |
| Otros modelos uncensored (p.ej. Dolphin, WizardLM-Uncensored) | Variable | Variable | Generalmente solo texto | Variable | Variable |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia con el modelo base es la eliminación de rechazos, mientras que las capacidades técnicas permanecen idénticas. Otros modelos uncensored suelen basarse en arquitecturas más antiguas y no ofrecen multimodalidad nativa.

## Limitaciones y advertencias

- Sesgos y contenido dañino: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtro. Su uso en producción conlleva riesgos legales y éticos significativos.
- Riesgo de alucinación: al igual que el modelo base, puede inventar información, especialmente en contextos largos o temas especializados.
- Verificación de procedencia: el modelo es un derivado no oficial; la afirmación de estar basado en google/gemma-4-e4b-it no ha sido verificada de forma independiente. Se recomienda contrastar con el modelo original.
- Limitaciones de idioma: aunque se etiqueta como multilingüe, no se especifican los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones sobre usos prohibidos. La modificación uncensored puede entrar en conflicto con los términos de uso de Google.
- Dependencia de la cuantización: las cuantizaciones K_P son personalizadas y pueden mostrar problemas de visualización en LM Studio (aparecen como "?"), aunque funcionan correctamente.
- Soporte limitado: al ser un modelo de la comunidad, no hay garantías de mantenimiento, corrección de errores o actualizaciones.

## Enlaces

- Repositorio de Hugging Face (marafx2007): https://huggingface.co/marafx2007/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Repositorio original de HauhauCS (referenciado en la model card): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Modelo base de Google: https://huggingface.co/google/gemma-4-e4b-it
- Copia del modelo en otro repositorio: https://huggingface.co/michaelborg/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Archivo GGUF Q8_K_P en repositorio de BrandonXG: https://huggingface.co/BrandonXG/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive-Q8_K_P.gguf
- Análisis sobre derivados de Gemma 4 E4B: https://knightli.com/en/2026/04/18/gemma-4-e4b-uncensored-vs-official/
- Página de descripción del modelo en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-e4b-uncensored-hauhaucs-aggressive.html
