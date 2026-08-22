# DIABLO6667183/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B, también conocido como Qwen3.8-Max, es el modelo de código abierto más grande lanzado por Alibaba en agosto de 2026. Se trata de un modelo de lenguaje de arquitectura de mezcla de expertos (MoE) con 2,4 billones de parámetros totales y aproximadamente 95 mil millones de parámetros activos por token, lo que permite un rendimiento cercano al de los modelos propietarios de vanguardia manteniendo un coste de inferencia relativamente contenido. El modelo incorpora una arquitectura de atención híbrida, combinando atención completa y lineal, y ofrece una ventana de contexto de hasta un millón de tokens, orientado a tareas de razonamiento largo y procesamiento de documentos extensos.

La liberación de sus pesos abiertos supone un hito en el ecosistema de IA abierta, ya que acerca capacidades de razonamiento complejo a desarrolladores e investigadores que no pueden acceder a modelos propietarios de tamaño equivalente. El modelo está disponible en Hugging Face, aunque el repositorio consultado presenta una autoría no oficial (DIABLO6667183) con licencia marcada como "other" y sin datos de idiomas o benchmarks publicados. A pesar de ello, la documentación oficial de Qwen y NVIDIA confirma sus especificaciones técnicas y su disponibilidad para despliegue en infraestructuras de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de grano fino con atención híbrida (atención completa + lineal) |
| Parametros totales | 2,4 billones (2,4 T) |
| Parametros activos | ~95 mil millones (95 B) por token |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (etiqueta "other" en el repositorio de Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-2.4T-A95B emplea una arquitectura de mezcla de expertos (MoE) de grano fino, en la que cada token activa aproximadamente 95 mil millones de parámetros de un total de 2,4 billones. Esta selección de expertos permite escalar la capacidad del modelo sin aumentar proporcionalmente el coste computacional de cada paso de inferencia. La arquitectura combina mecanismos de atención completa y atención lineal (hybrid attention), lo que reduce la complejidad computacional en secuencias largas y posibilita el manejo de contextos de hasta un millón de tokens. Según la documentación de NVIDIA, el modelo admite una longitud de salida máxima configurable, orientada a tareas de razonamiento extenso.

No se han publicado datos específicos sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.) en la información disponible. La documentación oficial menciona que el modelo está diseñado para razonamiento configurable, lo que sugiere la existencia de modos de inferencia ajustables según la tarea, pero no se detallan los mecanismos técnicos detrás de esta característica.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de múltiples pasos gracias a su gran ventana de contexto.
- Procesamiento de documentos extensos y análisis de información distribuida a lo largo de grandes volúmenes de texto (hasta 1M tokens).
- Razonamiento configurable: según NVIDIA, el modelo admite modos de razonamiento ajustables en función del coste o la precisión deseada.
- Capacidades multilingües: no documentadas en la información proporcionada; se recomienda verificar la documentación oficial de Qwen.
- No se menciona soporte explícito para tool calling, function calling, ni capacidades de visión o audio en la información disponible.

## Casos de uso

- **Análisis de documentos corporativos extensos**: el modelo puede procesar memorandos, informes anuales y contratos de cientos de páginas en una sola pasada, gracias a su ventana de 1M tokens, y extraer resúmenes o respuestas específicas sobre cláusulas concretas.
- **Asistencia a la investigación académica**: permite resumir y comparar múltiples artículos científicos completos, identificando métodos, resultados y limitaciones sin necesidad de segmentar el texto.
- **Razonamiento matemático y científico**: su capacidad de razonamiento configurable lo hace apto para problemas de demostración, cálculo simbólico y análisis de datos estructurados en formato textual.
- **Generación de código en entornos profesionales**: aunque no se documenta explícitamente el soporte de tool calling, su capacidad de razonamiento y contexto largo permite trabajar con repositorios completos o funciones extensas, generando o depurando código con conocimiento del contexto global.
- **Creación de contenidos de larga duración**: redacción de informes técnicos, libros o documentación técnica que requieran mantener coherencia temática a lo largo de miles de tokens.
- **Despliegue en infraestructura de alta gama**: el modelo se puede servir en clústeres con GPUs como NVIDIA GB300 NVL72, orientado a aplicaciones que requieren la máxima calidad de razonamiento en entornos empresariales o de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de NVIDIA y Qwen no incluye cifras concretas de MMLU, HumanEval, GSM8K u otros conjuntos de evaluación en los materiales consultados. Se recomienda consultar la documentación oficial del modelo para obtener datos de rendimiento comparativo.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Con 2,4 T de parámetros, la inferencia en precisión completa requeriría varios terabytes de memoria; se asume un despliegue con cuantización o en clústeres de GPUs de gran capacidad.
- **GPUs recomendadas**: NVIDIA GB300 NVL72, según el blog de NVIDIA para servir el modelo de forma eficiente; también se menciona compatibilidad con SGLang Model-Free NIM para despliegue remoto.
- **¿Cabe en GPUs de consumo?**: no, por su tamaño. No es viable en hardware doméstico (RTX 4090, etc.).
- **Opciones de despliegue**: SGLang (a través de NVIDIA NIM), vLLM, llama.cpp u otros frameworks de inferencia que soporten modelos MoE de gran escala. Se recomienda el uso de clústeres multi-GPU o infraestructura en la nube.
- **Latencia y throughput**: no disponibles; dependen de la configuración de hardware y del número de GPUs empleadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de la misma categoría (MoE de ~2,4 T de parámetros) en la información consultada. Qwen3.8-2.4T-A95B se posiciona como el modelo de código abierto más grande de la serie Qwen, por encima de Qwen3.5 y Qwen3.6, pero no se han publicado especificaciones detalladas de estos modelos en los resultados de búsqueda. No se incluye comparativa numérica por falta de datos.

## Limitaciones y advertencias

- **Licencia**: el repositorio de Hugging Face indica una licencia "other" sin especificar, y la licencia oficial del modelo no está confirmada en la información disponible. Antes de un uso comercial, se debe verificar la licencia en la documentación oficial de Qwen.
- **Requisitos de hardware**: el tamaño de 2,4 T de parámetros hace inviable su despliegue en hardware de consumo; se requiere infraestructura de alta gama o acceso a plataformas de nube especializadas.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones de sesgos o tasas de alucinación en la información disponible; al ser un modelo de gran tamaño, se recomienda una evaluación específica antes de su uso en producción.
- **Idiomas**: no se documenta la lista de idiomas soportados; es necesario verificar la cobertura multilingüe en la documentación oficial.
- **Riesgo de desactualización**: el modelo es de agosto de 2026 y la información disponible es limitada; las capacidades y limitaciones pueden ampliarse con la publicación de documentación adicional.

## Enlaces

- [Repositorio de Hugging Face (DIABLO6667183/Qwen3.8-2.4T-A95B)](https://huggingface.co/DIABLO6667183/Qwen3.8-2.4T-A95B)
- [Repositorio oficial de Qwen en Hugging Face](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [Página del modelo en QwenCloud](https://www.qwencloud.com/models/qwen3.8-2.4t-a95b)
- [Blog de NVIDIA: Serve Qwen3.8-2.4T-A95B](https://developer.nvidia.com/blog/serve-qwen3-8-2-4t-a95b-a-2-4t-parameter-model-with-configurable-reasoning-on-nvidia-gb300-nvl72/)
- [Documentación de NVIDIA NIM para Qwen3.8](https://docs.nvidia.com/nim/large-language-models/latest/get-started/advanced/get-started-qwen3.8.html)
- [Repositorio de GitHub de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
