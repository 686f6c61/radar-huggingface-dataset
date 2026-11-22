# Mir2k/gemma-4-27b-GGUF

## Resumen

`Mir2k/gemma-4-27b-GGUF` es un repositorio de cuantizaciones GGUF alojado en Hugging Face por el usuario Mir2k, que declara preparar versiones Q4_K_M, Q5_K_M y Q8_0 de un modelo denominado "gemma-4-27b", generadas con `llama.cpp` y verificadas mediante generación real antes de su publicación. El repositorio se creó el 22 de noviembre de 2026 y, en el momento de la consulta, no registra descargas ni interacciones.

La información disponible es mínima: la model card únicamente indica que las cuantizaciones están "en preparación" y no incluye detalles sobre la arquitectura del modelo base, el número de parámetros activos, la longitud de contexto, los idiomas soportados ni datos de entrenamiento. Tampoco se enlaza el modelo original del que derivan los pesos, lo que impide verificar la procedencia y las características técnicas del checkpoint subyacente.

Por tanto, esta ficha se limita a documentar lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no figura en la información proporcionada. Cualquier evaluación de rendimiento, calidad o idoneidad para producción requeriría consultar la documentación del modelo base original, que no se ha facilitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27B (según el nombre del repositorio; no confirmado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0 (declaradas "en preparación") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base en la documentación disponible. El nombre del repositorio sugiere un modelo de 27 mil millones de parámetros, pero no se confirma si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) u otra variante, ni se detalla la composición del dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de alineación como RLHF o DPO.

El único dato técnico verificable es el proceso de cuantización: el autor indica que las versiones GGUF se generan con `llama.cpp` y que se validan mediante generación real antes de publicarse, lo que constituye una buena práctica para descartar artefactos corruptos en la conversión. No obstante, no se especifican los parámetros exactos de cuantización, el tamaño en disco de cada variante ni las versiones de `llama.cpp` empleadas.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se declaran modos especiales (thinking, visión, audio).
- La única capacidad implícita es la inferencia en formato GGUF mediante `llama.cpp` y herramientas compatibles.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones GGUF permiten ejecutar el modelo con `llama.cpp` u Ollama en equipos sin GPU dedicada de gran capacidad, aunque el rendimiento dependerá del hardware y de la variante elegida.
- Prototipado en CPU: la variante Q4_K_M, de menor tamaño, sería la opción razonable para pruebas rápidas en entornos sin aceleración por hardware.
- Evaluación comparativa de cuantizaciones: el repositorio permite contrastar la pérdida de calidad entre Q4_K_M, Q5_K_M y Q8_0 sobre el mismo modelo base, siempre que las tres variantes lleguen a publicarse.
- Integración en pipelines de inferencia con llama-cpp-python: el formato GGUF es compatible con bindings de Python, lo que facilita su uso en scripts de generación de texto.
- Experimentación académica: útil para reproducir resultados sobre el modelo base en entornos con recursos limitados, una vez verificada la procedencia de los pesos.
- Pruebas de calidad de cuantización: permite medir la degradación de perplejidad y coherencia entre niveles de compresión, si el autor publica las métricas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Como referencia orientativa para un modelo de 27B, Q4_K_M requeriría del orden de 16-18 GB, Q5_K_M en torno a 20 GB y Q8_0 aproximadamente 29-30 GB, aunque estas cifras no están confirmadas por el autor y deben tomarse con cautela.
- GPU recomendadas: no especificadas. Para Q8_0 sería necesario un acelerador con al menos 32 GB de memoria (A100 40 GB, H100, RTX A6000); Q4_K_M podría caber en una RTX 4090 de 24 GB.
- Compatibilidad con GPU de consumo: probable para Q4_K_M y Q5_K_M en tarjetas de 24 GB, no confirmado.
- Opciones de despliegue: `llama.cpp`, Ollama, llama-cpp-python y cualquier runtime compatible con GGUF. No consta compatibilidad verificada con vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica el modelo base ni ofrece datos que permitan establecer una comparación fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no enlaza el modelo original del que derivan los pesos, lo que impide verificar su procedencia y trazabilidad.
- Las cuantizaciones se declaran "en preparación"; no se confirma que los archivos estén publicados ni que sean funcionales.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- La licencia Apache 2.0 figura en los metadatos, pero al no identificarse el modelo origen no puede confirmarse que esa licencia sea aplicable a los pesos derivados.
- Ausencia total de descargas y de interacciones: no existe validación comunitaria del repositorio.
- Para uso en producción sería imprescindible localizar y revisar la model card del modelo base original antes de adoptar estas cuantizaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mir2k/gemma-4-27b-GGUF
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información proporcionada.
