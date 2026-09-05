# hermitdave/K2-Horizon-7B-MLX-8bit

# Ficha técnica: K2-Horizon-7B-MLX-8bit

## Resumen

K2-Horizon-7B-MLX-8bit es una conversión cuantizada a 8 bits del modelo IFM/K2-Horizon-7B, desarrollado por el equipo IFM y publicado bajo licencia Apache-2.0. Esta versión concreta ha sido convertida al formato MLX, optimizado para Apple Silicon, utilizando `mlx-lm` y `oMLX`. El modelo original es un modelo denso de razonamiento de 7.000 millones de parámetros (8.999.178.240 parámetros totales) con una ventana de contexto de 512.000 tokens.

Su relevancia radica en que ofrece capacidades de razonamiento de nivel frontera en un formato abierto y con licencia permisiva, lo que permite su uso comercial sin restricciones. La conversión a MLX 8-bit está pensada para ejecutarse de manera eficiente en hardware de Apple, manteniendo una calidad cercana a la pérdida nula según la documentación del autor. El modelo destaca en benchmarks de ingeniería de software, uso de terminal, navegación web y matemáticas, lo que lo convierte en una opción interesante para tareas de agente y razonamiento avanzado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo denso de razonamiento) |
| Parámetros totales | 8.999.178.240 (7B) |
| Longitud de contexto | 512.000 tokens (512K) |
| Tipos de cuantización | 8-bit (este repo); la familia también ofrece oQ4e, 4-bit, oQ6e y 6-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

K2-Horizon-7B es un modelo denso de razonamiento de 7.000 millones de parámetros, perteneciente a la familia K2 Horizon. La información disponible no especifica la arquitectura interna exacta más allá de ser un modelo denso, ni detalla si se trata de un Transformer estándar o de alguna variante. Tampoco se ofrecen datos sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO.

La conversión a MLX 8-bit se realizó con `mlx-lm` y `oMLX`, y está diseñada para ejecutarse en Apple Silicon. Según la model card, la cuantización 8-bit se considera casi sin pérdida de calidad, mientras que otras versiones de la familia ofrecen distintos equilibrios entre tamaño y fidelidad.

## Capacidades

- Modelo de razonamiento: requiere usar `reasoning_effort="high"` para obtener los mejores resultados, como se indica en la documentación.
- Generación de texto conversacional y asistencia en tareas complejas.
- Resolución de problemas de ingeniería de software: obtiene un 70.6 en SWE-bench Verified.
- Ejecución de tareas de terminal: alcanza un 39.06 en Terminal-Bench 2.1.
- Navegación web y búsqueda de información: consigue un 59.0 en BrowseComp.
- Razonamiento matemático avanzado: logra un 73.3 en HMMT Feb 2026.
- Ventana de contexto de 512.000 tokens, adecuada para documentos largos y conversaciones extensas.
- No se especifica explícitamente soporte de tool calling, pero los resultados en SWE-bench y Terminal-Bench sugieren capacidades de agente y uso de herramientas.

## Casos de uso

- Asistente de desarrollo de software: con un 70.6 en SWE-bench Verified, el modelo puede integrarse en entornos de desarrollo para resolver issues, revisar código y proponer parches. Su contexto de 512K permite procesar repositorios completos.
- Automatización de operaciones de terminal: gracias a su puntuación de 39.06 en Terminal-Bench 2.1, puede ejecutar comandos, gestionar sistemas y automatizar tareas administrativas en entornos de servidor.
- Investigación y análisis web: con un 59.0 en BrowseComp, el modelo puede buscar información en la web, sintetizar resultados y responder preguntas basadas en contenido online actualizado.
- Tutoría y resolución de problemas matemáticos: su resultado de 73.3 en HMMT Feb 2026 indica capacidad para abordar problemas de competición matemática, lo que lo hace útil en educación y análisis cuantitativo.
- Análisis de documentos extensos: la ventana de 512K tokens permite procesar contratos, informes técnicos, bases de código o transcripciones largas sin perder información de contexto.
- Agentes autónomos multi-paso: combinando sus capacidades de SWE-bench y Terminal-Bench, el modelo puede planificar y ejecutar tareas complejas que requieren razonamiento iterativo, uso de herramientas y verificación de resultados.

## Benchmarks y rendimiento

| Benchmark | K2-Horizon-7B |
|---|---|
| SWE-bench Verified | 70.6 |
| Terminal-Bench 2.1 | 39.06 |
| tau3-Banking | 25.8 |
| BrowseComp | 59.0 |
| HMMT Feb 2026 | 73.3 |

Los resultados corresponden al modelo base IFM/K2-Horizon-7B, no a la conversión MLX 8-bit. No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon y se ejecuta mediante MLX. La versión 8-bit ocupa aproximadamente 9 GB de memoria, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada.
- No es compatible directamente con CUDA. Para ejecutarlo en GPU NVIDIA sería necesario convertir los pesos a otro formato, como GGUF o safetensors estándar.
- Opciones de despliegue: `mlx-lm` para generación desde línea de comandos y `oMLX` para integración con servidores OpenAI-compatibles.
- Latencia y throughput: no disponibles para esta conversión.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría en los datos proporcionados. La única referencia disponible es el modelo base IFM/K2-Horizon-7B, del cual esta versión es una cuantización. No se han encontrado benchmarks de modelos equivalentes que permitan una comparación directa.

## Limitaciones y advertencias

- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es desconocido y podría ser limitado fuera del inglés.
- Como todo modelo generativo, existe riesgo de alucinación, especialmente en tareas abiertas o con información ambigua.
- La cuantización 8-bit puede introducir pequeñas pérdidas de calidad, aunque el autor la describe como casi sin pérdida.
- Para obtener el máximo rendimiento en razonamiento es necesario usar `reasoning_effort="high"`, lo que incrementa el consumo de tokens y la latencia.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener el aviso de copyright y la atribución correspondiente.
- No se han publicado evaluaciones de sesgos ni pruebas de seguridad en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hermitdave/K2-Horizon-7B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Blog de IFM: https://ifm.ai/blog/k2/
- Conversión MLX alternativa: https://huggingface.co/abenzerps/K2-Horizon-7B-MLX-8bit
- Adaptadores disponibles para el modelo base: https://huggingface.co/models?other=base_model%3Aadapter%3AIFM%2FK2-Horizon-7B
