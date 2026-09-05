# hermitdave/K2-Horizon-MoVA-36B-A4B-MLX-6bit

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de razonamiento desarrollado por el equipo de IFM. Se trata de un modelo sparse Mixture-of-Experts (MoE) con una innovación técnica llamada Mixture-of-Values attention (MoVA). La variante de 36B-A4B tiene 36.000 millones de parámetros en total, pero solo activa aproximadamente 4.000 millones por token, lo que lo sitúa en una categoría muy eficiente para su rendimiento. Según las fuentes consultadas, dispone de una ventana de contexto nativa de 512.000 tokens, lo que le permite manejar documentos extremadamente largos. La versión analizada aquí es una cuantización MLX 6-bit creada por el usuario hermitdave, pensada para ejecutarse en hardware Apple Silicon con mlx-lm. El modelo original se distribuye bajo licencia Apache-2.0.

El modelo destaca especialmente en tareas de razonamiento complejo y uso agéntico. Los benchmarks publicados muestran resultados notables en prueba de ciencia a nivel de posgrado (GPQA Diamond), razonamiento de contexto largo (AA-LCR), uso de herramientas agéntico (tau3-Banking) y uso de terminal (Terminal-Bench 2.1). Es una opción interesante para quienes buscan un modelo abierto de alto rendimiento que pueda desplegarse localmente, con la ventaja añadida de contar con una conversión optimizada para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts con Mixture-of-Values attention (MoVA) |
| Parametros totales | 37.444.792.020 (en la cuantización MLX), 36.000.000.000 en el modelo base |
| Parametros activos | ~4.000.000.000 |
| Longitud de contexto | 512.000 tokens |
| Tipos de cuantizacion | MLX 6-bit, MLX oQ4e, MLX 8-bit (según el README del autor de la conversión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base IFM/K2-Horizon-MoVA-36B-A4B emplea una arquitectura sparse MoE combinada con una atención basada en Mixture of Values. Esto significa que no se activan todos los parámetros en cada token, sino que se seleccionan dinámicamente rutas expertas. La atención MoVA introduce una forma de mezclar valores en el mecanismo de atención, lo que permite mejorar la eficiencia y el rendimiento sin aumentar el coste computacional de forma proporcional. La versión de 36B-A4B activa aproximadamente 4.000 millones de parámetros por token, lo que hace que su coste de inferencia sea comparable al de modelos densos mucho más pequeños, aunque con capacidades superiores. No se han publicado detalles sobre la composición exacta del dataset de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO. Según el blog de IFM, el modelo está diseñado como un modelo de razonamiento, y el README recomienda usar `reasoning_effort="high"` para obtener los mejores resultados.

## Capacidades

- Generación de texto con capacidad de razonamiento explícito, activado mediante `reasoning_effort="high"` en el template de chat.
- Soporte de tool calling y uso agéntico, evidenciado por su resultado de 26.8 en tau3-Banking, un benchmark de uso agéntico de herramientas en el ámbito bancario.
- Uso de terminal y ejecución de tareas agénticas en línea de comandos, con un 58.6 en Terminal-Bench 2.1.
- Razonamiento científico de nivel de posgrado, con un 80.8 en GPQA Diamond.
- Razonamiento sobre contextos largos, con un 66.3 en AA-LCR.
- Capacidad de gestión de ventanas de contexto de hasta 512.000 tokens, lo que permite procesar documentos extensos sin truncamiento.
- Disponible en cuantizaciones MLX que facilitan su ejecución en Apple Silicon, con una API compatible con OpenAI para integraciones sencillas.

## Casos de uso

- Agentes autónomos en entornos de terminal: dado su alto rendimiento en Terminal-Bench 2.1, el modelo puede utilizarse para ejecutar tareas de administración de sistemas, automatizar pipelines de despliegue o interaccionar con shells de forma autónoma.
- Asistentes de investigación científica: con una puntuación de 80.8 en GPQA Diamond, es adecuado para responder preguntas complejas de física, química o biología, y para apoyar la revisión de literatura científica.
- Automatización de banca y servicios financieros: el resultado de 26.8 en tau3-Banking indica que puede manejar herramientas de banca digital, como consultas de saldo, transferencias o gestión de productos financieros mediante tool calling.
- Análisis de documentos largos: gracias a su ventana de contexto de 512K, puede procesar contratos, informes técnicos, expedientes legales o libros completos, extrayendo información y respondiendo preguntas sobre el contenido íntegro.
- Soporte técnico automatizado: su capacidad de razonamiento y tool calling permite integrarlo en sistemas de atención al cliente para diagnosticar incidencias, consultar bases de datos de conocimiento y ejecutar acciones sobre sistemas externos.
- Generación y refactorización de código en desarrollo de software: al ser un modelo de razonamiento con fuerte capacidad de uso de herramientas, puede participar en sesiones de programación asistida, revisar código y proponer cambios coherentes.
- Despliegue local en hardware Apple Silicon: la conversión MLX 6-bit está optimizada para equipos Mac con suficiente memoria unificada, permitiendo un uso privado y sin dependencia de APIs externas.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base IFM/K2-Horizon-MoVA-36B-A4B. La conversión MLX 6-bit puede presentar una ligera degradación en tareas de razonamiento complejo, aunque en principio mantiene la misma estructura de rendimiento.

| Benchmark | K2-Horizon-MoVA-36B-A4B |
|---|---|
| tau3-Banking (Agentic tool use) | 26.8 |
| Terminal-Bench 2.1 (Agentic terminal use) | 58.6 |
| GPQA Diamond (Graduate-level science QA) | 80.8 |
| AA-LCR (Long-context reasoning) | 66.3 |

## Requisitos de hardware

- VRAM estimada para la cuantización MLX 6-bit: aproximadamente 28 GB en memoria unificada, según el autor de la conversión.
- Para la cuantización oQ4e: aproximadamente 21 GB; para la 8-bit: aproximadamente 40 GB.
- Esta conversión está pensada para Apple Silicon. No se proporcionan requisitos para GPUs NVIDIA o AMD, ya que la conversión es específica de MLX.
- En equipos Mac, se recomienda al menos 32 GB de memoria unificada para ejecutar la versión 6-bit, y 64 GB para la versión 8-bit.
- Para cargas de trabajo de contexto muy largo, la cantidad de memoria necesaria aumentará considerablemente, y podría ser necesario usar modelos cuantizados más agresivos o reducir la longitud del contexto.
- Opciones de despliegue: `mlx-lm` como herramienta de línea de comandos y servidor local compatible con la API de OpenAI. También se puede integrar en aplicaciones Python mediante la librería `mlx-lm`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36.000.000.000 | ~4.000.000.000 | 512.000 tokens | Apache-2.0 | HuggingFace |
| Qwen3-30B-A3B | ~30.500.000.000 | ~3.300.000.000 | 128.000 tokens | Apache-2.0 | HuggingFace |
| K2 Horizon 32B (dense) | 32.000.000.000 | 32.000.000.000 | no disponible | Apache-2.0 | no disponible |

Los benchmarks de los modelos alternativos no se han publicado en la información disponible. La comparativa se basa en especificaciones y licencia.

## Limitaciones y advertencias

- No se documentan sesgos específicos en la información proporcionada, pero al ser un modelo de lenguaje, es previsible la presencia de sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación inherente a todos los modelos generativos. Debe validarse la salida en aplicaciones críticas.
- Los idiomas soportados no se especifican en el README ni en la información web, lo que limita la certeza sobre su rendimiento en lenguajes distintos del inglés.
- La versión analizada es una conversión realizada por un tercero (hermitdave), no una publicación oficial de IFM. La calidad puede variar respecto al modelo base.
- La cuantización 6-bit puede introducir degradación en el razonamiento matemático o lógico, especialmente en problemas de varios pasos.
- El contexto de 512.000 tokens es muy amplio, pero su uso completo puede requerir una gran cantidad de memoria y tiempos de inferencia elevados.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero no incluye garantías de soporte ni responsabilidad sobre el rendimiento.
- No hay información sobre el proceso de entrenamiento, la composición del dataset ni el uso de técnicas de alineación, lo que dificulta evaluar su robustez en tareas del mundo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/K2-Horizon-MoVA-36B-A4B-MLX-6bit
- Modelo base en HuggingFace: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog oficial de IFM sobre K2 Horizon: https://ifm.ai/blog/k2
- Ficha del modelo en Benchgen: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
