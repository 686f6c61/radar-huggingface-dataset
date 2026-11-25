# greg1506/qwen3-1p7b-coffee-dist2-GGUF

## Resumen

qwen3-1p7b-coffee-dist2-GGUF es la distribución en formato GGUF del checkpoint "dist2" del proyecto CoffeeLLM, un ajuste fino de Qwen/Qwen3-1.7B especializado en dominio cafetero. Lo desarrolla el usuario greg1506 y se construye mediante destilación del modelo maestro de 8B del mismo proyecto (greg1506/qwen3-8b-coffee-v10) sobre el modelo base de 1.7B, con un corpus propio (coffee-corpus-v2) de 46.258 documentos. El objetivo es ofrecer un modelo de la clase móvil (1.7B) con conocimiento técnico de café: definiciones, ratios de extracción, mapas de método, origen de especies y cálculos de rendimiento.

El modelo se publica como research preview y su valor práctico está en la relación capacidad/tamaño: con 1.720.574.976 parámetros y cuantizaciones de 1,1 a 1,3 GB, puede ejecutarse en CPU con llama.cpp y en GPUs de consumo. La model card reporta un rendimiento en CoffeeBench (336 ítems) de 0,562 EM crudo y 0,648 F1 de token en bf16, y de 0,574 EM con la cuantización Q5_K_M, que el autor recomienda para evaluación.

La relevancia actual es doble: por un lado, demuestra un pipeline completo de adaptación de dominio y destilación sobre un modelo pequeño; por otro, expone con transparencia poco habitual las limitaciones de procedencia de datos (tiers open, share-alike y restricted) y los riesgos de licencia para uso comercial, lo que lo convierte en un caso útil para quien evalúe adaptaciones de dominio en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino por destilación sobre Qwen/Qwen3-1.7B; no se detalla en la informacion disponible la configuración interna de capas y cabezas |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (1,1 GB) y Q5_K_M (1,3 GB) en este repo; merge bf16 de referencia (3,4 GB) |
| Idiomas soportados | Ingles (tag `language: en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 en pesos, con advertencia del autor sobre procedencia de datos y ausencia de garantia de uso comercial |
| Formato de pesos | GGUF (llama.cpp); el merge de referencia bf16 se distribuye como base de conversión |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 1.720.574.976 parámetros. Sobre esa base se aplica un pipeline en tres etapas: preentrenamiento continuado sobre el flujo de tokens de coffee-corpus-v2 (etapa de dominio), una etapa de SFT con instructor ("v1-best", EM 0,527 / soft-EM 0,580 / F1 0,625) y, finalmente, destilación desde el profesor greg1506/qwen3-8b-coffee-v10 (bf16, EM 0,753) sobre un pool de 15.991 filas (qa_distill), compuesto por 8.149 pares pregunta/respuesta minados por LLM y anclados en documentos del corpus, más 7.842 filas sintéticas de replay del proyecto. El ajuste se realiza con LoRA a learning rate 2e-4 y parada temprana sobre val_loss.

La innovación principal no está en la arquitectura sino en el proceso de selección: dist2 se eligió frente a un barrido de dos brazos de learning rate y dos rondas posteriores con pools de 36.000 y 55.000 filas, que regresaron en la batería numérica. El pool de destilación incorpora un leak guard que evita que preguntas de CoffeeBench aparezcan literalmente en el entrenamiento. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp, generando Q4_K_M y Q5_K_M desde el merge bf16 de 3,4 GB.

## Capacidades

- Generación de texto conversacional en inglés sobre dominio cafetero: definiciones, métodos de extracción, ratios, origen de especies y estándares de calidad.
- Razonamiento numérico limitado: resuelve ratios directos e inversos y cálculos de sólidos y masa, pero con rendimiento bajo en aritmética decimal (ver limitaciones).
- Respuestas de formato cerrado y extracción de datos: la evaluación se hace con EM crudo, soft-EM y F1 de token, lo que indica capacidad de producir respuestas cortas y verificables.
- Modo "thinking" heredado de la familia Qwen3: la evaluación se realiza tras eliminar el bloque de pensamiento (post think-strip), por lo que el modelo genera razonamiento intermedio antes de responder.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor recomienda derivar la aritmética decimal a una calculadora o llamada a función, lo que sugiere integración externa más que capacidad agéntica nativa.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de otros idiomas.
- Capacidades de visión o audio: no disponibles.
- Despliegue en CPU y entornos con recursos limitados, incluido un runtime gratuito de Colab.

## Casos de uso

- Asistente de formación para baristas: el modelo responde preguntas sobre ratios, métodos y estándares de calidad con un tamaño de 1,1-1,3 GB, lo que permite desplegarlo en una tablet o portátil sin GPU dedicada mediante llama.cpp u Ollama.
- Base de conocimiento de dominio en atención al cliente de cafeterías: puede gestionar consultas frecuentes sobre origen de especies, definiciones y mapas de método, con la salvedad de derivar cualquier cálculo de rendimiento de extracción a una calculadora.
- Prototipado rápido de adaptaciones de dominio: sirve como referencia para equipos que quieran replicar el pipeline (preentrenamiento continuado, SFT y destilación desde un profesor mayor) sobre un corpus propio y un modelo base de 1,7B.
- Evaluación de técnicas de cuantización: el repositorio incluye métricas comparadas entre Q4_K_M, Q5_K_M y bf16, lo que lo hace útil como caso de estudio de la degradación por cuantización en tareas numéricas y de extracción.
- Demostraciones interactivas en entornos gratuitos: el notebook de Colab instala llama-cpp-python, descarga el quant Q5_K_M y lanza una interfaz Gradio con enlace temporal, adecuado para talleres y pruebas de concepto.
- Investigación sobre procedencia de datos y licencias: la model card documenta los tiers open, share-alike y restricted del corpus y su impacto en la distribución, lo que permite estudiar el problema de la trazabilidad de datos en modelos ajustados.
- Filtrado y clasificación de consultas de dominio: dado su rendimiento en familias de conocimiento (definición, method-map, species-origin), puede usarse para enrutar preguntas a un modelo mayor o a una herramienta específica.

## Benchmarks y rendimiento

CoffeeBench, 336 ítems retenidos, temperatura 0, post think-strip, servidor llama.cpp en CPU:

| Modelo / cuantizacion | Tamano | EM crudo | Soft-EM | F1 de token |
|---|---|---|---|---|
| Q4_K_M (este repo) | 1,1 GB | 0,530 | 0,551 | 0,625 |
| Q5_K_M (este repo) | 1,3 GB | 0,574 | 0,592 | 0,660 |
| bf16 merge (referencia) | 3,4 GB | 0,562 | 0,580 | 0,648 |
| Profesor qwen3-8b-coffee-v10 | 8B | 0,753 | 0,789 | no disponible |

Rendimiento por categoría del merge bf16 (n, EM, soft-EM):

| Familia | n | EM | Soft-EM |
|---|---|---|---|
| solids-mass | 15 | 1,00 | 1,00 |
| ratio-forward | 45 | 0,76 | 0,76 |
| species-origin | 15 | 0,73 | 0,80 |
| ratio-inverse | 33 | 0,64 | 0,64 |
| milk-drinks | 8 | 0,62 | 0,88 |
| method-map | 24 | 0,54 | 0,58 |
| definition | 12 | 0,58 | 0,67 |
| ey-inverse (aritmética decimal) | 66 | 0,48 | 0,48 |
| ey-forward (aritmética decimal) | 90 | 0,44 | 0,44 |
| roast-map | 10 | 0,30 | 0,30 |
| processing-map | 9 | 0,22 | 0,22 |

El autor advierte que el conjunto de prueba es deliberadamente aritmético (aproximadamente el 74% de los ítems son familias numéricas), por lo que el EM global subestima el rendimiento en mapas de conocimiento y sobrestima la capacidad aritmética sin calculadora.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q4_K_M y 1,3 GB con Q5_K_M, más overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; una RTX 4090 o A100 no son necesarias para este tamaño y quedan sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4060, etc.) y también en CPU.
- Opciones de despliegue: llama.cpp (llama-server), llama-cpp-python, Ollama y cualquier runtime compatible con GGUF; el repo declara `endpoints_compatible`.
- Latencia y throughput: no se publican cifras concretas; la evaluación se realizó en CPU con llama-server a temperatura 0, y el notebook de Colab funciona con un runtime gratuito de CPU, lo que indica que la inferencia es viable sin acelerador.
- Almacenamiento: 2,4 GB de repositorio completo, con quants individuales de 1,1 y 1,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CoffeeBench EM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1p7b-coffee-dist2-GGUF (Q5_K_M) | 1,72B | no disponible | 0,574 | Apache-2.0 con caveat de datos | GGUF en HF |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | no disponible | Apache-2.0 | safetensors y GGUF en HF |
| greg1506/qwen3-8b-coffee-v10 (profesor) | 8B | no disponible | 0,753 | no disponible | HF |
| greg1506/qwen3-8b-coffee-v10 (referencia de destilación) | 8B | no disponible | 0,789 soft-EM | no disponible | HF |

La comparación con el modelo base Qwen3-1.7B no puede cuantificarse porque la información proporcionada no incluye su puntuación en CoffeeBench; la única comparación directa disponible es con el profesor de 8B, que supera al estudiante en 0,179 EM crudo (0,753 frente a 0,574 en Q5_K_M).

## Limitaciones y advertencias

- No fiable para aritmética decimal: rendimiento de 0,44 EM en ey-forward y 0,48 en ey-inverse en bf16, con degradación adicional bajo Q4_K_M (ey-forward cae de 0,44 a 0,29). El autor recomienda derivar estos cálculos a una calculadora o llamada a función.
- Mapas de conocimiento débiles: roast-map (0,30 EM) y processing-map (0,22 EM) son las familias con peor rendimiento.
- La cuantización Q4_K_M pierde 3,2 puntos de EM respecto al merge bf16, concentrada en la batería de rendimiento de extracción; Q5_K_M es la opción recomendada si el espacio lo permite.
- Estado de research preview: el autor declara explícitamente que no garantiza que los datos de entrenamiento estén libres de términos share-alike o no comerciales y que no emite ninguna declaración de viabilidad comercial. No debe distribuirse como producto comercial.
- Procedencia de datos: el corpus completo tiene 46.258 documentos, de los cuales 1.365 son CC BY-SA 4.0 y 1.472 son CC BY-NC/ND (25% de los tokens de café). El bundle público solo contiene el tier open (43.421 documentos), que no es el flujo exacto de entrenamiento. La cuestión de si los pesos son obra derivada del texto de entrenamiento no está resuelta legalmente.
- El pool de destilación minado es 41% open, 48% share-alike y 11% restricted por documento fuente.
- Idiomas: solo inglés declarado; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinación: no se documenta una evaluación específica de factualidad fuera de CoffeeBench; el modelo puede generar respuestas plausibles pero incorrectas en preguntas numéricas o de mapas de tueste y procesamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Contexto: la longitud de contexto no se especifica en la model card, lo que impide garantizar conversaciones multi-turno largas.
- Tool calling y capacidades agénticas: no documentadas; cualquier uso en pipelines de agentes requiere validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greg1506/qwen3-1p7b-coffee-dist2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de 8B: https://huggingface.co/greg1506/qwen3-8b-coffee-v10
- Dataset coffee-corpus-v2: https://huggingface.co/datasets/greg1506/coffee-corpus-v2
- Notebook de demostración en Colab: https://huggingface.co/greg1506/qwen3-1p7b-coffee-dist2-GGUF/blob/main/colab_demo.ipynb
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
