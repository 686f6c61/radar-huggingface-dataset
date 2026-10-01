# mradermacher/SEAD-SAGE-4B-GGUF

## Resumen

SEAD-SAGE-4B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo EverywhereSafety/SEAD-SAGE-4B, generadas por mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local y a despliegue ligero, con 12 variantes de cuantización que van desde Q2_K (1,9 GB) hasta f16 (8,9 GB).

El modelo subyacente tiene 4.411.424.256 parámetros (aproximadamente 4,4 B) y está etiquetado con los descriptores agentic-defense, tool-using-agents y state-aware-safety, además de la etiqueta qwen3, que sugiere que deriva de la familia Qwen3. El ajuste declarado se realizó sobre el dataset EverywhereSafety/SEAD-SFT-v1 y el modelo solo declara soporte para inglés.

Su relevancia actual radica en el nicho de la seguridad de agentes que usan herramientas: el repositorio se presenta como una pieza de defensa para agentes con llamadas a funciones y conciencia de estado, un área con pocos modelos específicos y con demanda creciente en pipelines de automatización. La licencia Apache 2.0 y el formato GGUF facilitan su integración en entornos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta qwen3 del repositorio apunta a la familia Qwen3; no se detalla en la model card) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye para la librería transformers |

## Arquitectura y entrenamiento

La model card de esta cuantización no describe la arquitectura interna del modelo base. La única referencia técnica disponible es la etiqueta qwen3 incluida en los tags del repositorio, que sitúa al modelo en la familia Qwen3, típicamente compuesta por transformadores decoder-only. No se confirma en la información proporcionada si se trata de atención estándar, atención lineal o alguna variante híbrida, ni se detallan dimensiones de capas, cabezas de atención o tamaño de vocabulario.

En cuanto al entrenamiento, solo consta el dataset declarado, EverywhereSafety/SEAD-SFT-v1, y las etiquetas agentic-defense, tool-using-agents y state-aware-safety, que indican un ajuste orientado a tareas de defensa de agentes y uso de herramientas. No se especifica el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF, DPO u otra alineación posterior. Tampoco se documentan innovaciones técnicas adicionales en esta model card.

## Capacidades

- Generación de texto conversacional en inglés, ya que el repositorio se marca como conversational y declara únicamente ese idioma.
- Defensa de agentes (agentic-defense): el modelo está etiquetado para tareas de protección o filtrado en entornos donde un agente ejecuta acciones.
- Uso de herramientas (tool-using-agents): se orienta a escenarios con function calling y llamadas a herramientas externas.
- Seguridad con conciencia de estado (state-aware-safety): la etiqueta sugiere evaluación del estado de la conversación o de la sesión antes de permitir acciones.
- Razonamiento multi-paso dentro de flujos de agente, aunque no se documenta explícitamente el mecanismo ni su profundidad.
- Capacidades multilingües: no disponibles; solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Guardarraíl de entrada para agentes con herramientas: el modelo puede colocarse delante del agente principal para clasificar o filtrar instrucciones sospechosas antes de que se ejecute una llamada a función, aprovechando su etiqueta agentic-defense.
- Auditoría de trazas de agente: procesar registros de conversaciones y llamadas a herramientas para detectar secuencias que violen políticas de seguridad, con la ventaja de poder ejecutarse en local gracias a las cuantizaciones de 2 a 3 GB.
- Validación de llamadas a funciones en pipelines de automatización: verificar que los argumentos generados por el agente sean coherentes con el estado de la sesión antes de invocar la API, en línea con la etiqueta state-aware-safety.
- Investigación en seguridad de agentes: servir como modelo de referencia ajustado específicamente sobre SEAD-SFT-v1 para reproducir y comparar experimentos de defensa.
- Despliegue en edge o en estaciones sin GPU dedicada: con la variante Q4_K_M (2,8 GB) es viable ejecutar el modelo en portátiles y equipos de gama media mediante llama.cpp u Ollama.
- Filtrado de contenido en asistentes conversacionales en inglés: usar el modelo como capa adicional de moderación en flujos donde ya existe un modelo generador principal.
- Punto de control para sistemas multi-agente: supervisar mensajes entre agentes y bloquear instrucciones que intenten manipular el estado del sistema.
- Evaluación de robustez frente a inyección de prompt: como componente de un banco de pruebas que mida la resistencia de un agente frente a entradas adversarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los tamaños de VRAM que figuran a continuación son estimaciones orientativas calculadas a partir del tamaño de cada archivo GGUF más el espacio adicional para el contexto y el runtime; no proceden de mediciones publicadas.

- VRAM estimada para inferencia (solo pesos):
  - Q2_K: 1,9 GB de archivo; en torno a 2,5-3 GB de VRAM en uso.
  - Q4_K_S y Q4_K_M: 2,7 y 2,8 GB; en torno a 3,5-4 GB de VRAM.
  - Q6_K: 3,7 GB; en torno a 4,5-5 GB de VRAM.
  - Q8_0: 4,8 GB; en torno a 5,5-6 GB de VRAM.
  - f16: 8,9 GB; en torno a 10-11 GB de VRAM.
- GPU recomendadas: una RTX 3060 de 12 GB o superior cubre con holgura todas las cuantizaciones, incluida f16. Para Q4_K_M basta una GPU de 6-8 GB (GTX 1660 Super, RTX 3050, RTX 4060). Las series A100, H100 y RTX 4090 son innecesarias para este tamaño y solo tendrían sentido en despliegues con muchas réplicas concurrentes.
- Compatibilidad con GPU de consumo: sí, es uno de los puntos fuertes del repositorio; cualquier tarjeta con 4 GB o más puede ejecutar las cuantizaciones Q3 y Q4, y es posible inferencia en CPU con llama.cpp usando RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF. El soporte en vLLM y TGI para GGUF es parcial y no está confirmado para este modelo en la información disponible.
- Latencia y throughput estimados: no disponibles. Los ficheros multiparte, en caso de existir, requieren concatenación previa según las instrucciones habituales de mradermacher.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto del modelo base más allá de lo indicado, por lo que la comparación se limita a aspectos verificables de formato y licencia.

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/SEAD-SAGE-4B-GGUF (este repositorio) | 4,4 B | GGUF (12 cuantizaciones) | Apache 2.0 | Cuantización estática del modelo base; 0 descargas y 0 likes en el momento de la consulta |
| EverywhereSafety/SEAD-SAGE-4B (modelo base) | 4,4 B | No disponible en detalle (se distribuye para transformers) | Apache 2.0 | Modelo original ajustado sobre SEAD-SFT-v1 |
| Alternativas de la misma categoría (otros modelos de 4 B orientados a seguridad de agentes) | No disponible | No disponible | No disponible | No se han identificado comparables verificables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 4,4 B, la tasa de error en tareas de razonamiento complejo tiende a ser mayor que en modelos de mayor tamaño, aunque no hay datos publicados que lo confirmen para esta variante.
- Idioma: solo inglés declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset SEAD-SFT-v1 antes de un despliegue en producción.
- Estado del repositorio: 0 descargas y 0 likes, sin validación comunitaria documentada; la fecha de creación registrada es el 30 de septiembre de 2026.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar de forma notable la calidad; el autor recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q6_K o Q8_0 cuando prima la fidelidad.
- No hay cuantizaciones ponderadas ni imatrix publicadas por el autor en el momento de la ficha, y no se ofrecen resultados de evaluación que permitan comparar la pérdida de calidad entre cuantizaciones.
- Uso como capa de seguridad: un modelo de este tamaño no debería ser el único mecanismo de defensa; conviene combinarlo con validaciones deterministas y monitorización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/SEAD-SAGE-4B-GGUF
- Modelo base: https://huggingface.co/EverywhereSafety/SEAD-SAGE-4B
- Dataset de ajuste: https://huggingface.co/datasets/EverywhereSafety/SEAD-SFT-v1
- Página de descargas del autor: https://hf.tst.eu/model#SEAD-SAGE-4B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
