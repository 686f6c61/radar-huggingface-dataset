# Atomic-Germ/Llama-3.2-3B-NPU2

## Resumen

Este modelo es una variante de LLaMA 3.2 3B Instruct, publicada por el usuario Atomic-Germ, con el objetivo de optimizar su ejecución sobre las NPU (unidades de procesamiento neuronal) integradas en los procesadores AMD Ryzen AI de arquitectura XDNA2, mediante el runtime FastFlowLM. La model card indica que preserva la arquitectura y los pesos originales de Meta, con posibles ajustes de cuantización o afinamiento a bajo nivel para mejorar el rendimiento en este tipo de hardware. Se distribuye bajo la licencia de LLaMA 3, por lo que su uso comercial está restringido y requiere la aceptación de los términos de Meta.

El modelo base, Llama 3.2 3B Instruct, es un modelo de lenguaje de 3 000 millones de parámetros, con arquitectura transformer, ventana de contexto de 128 000 tokens y entrenamiento en inglés, español, francés, alemán, hindi, italiano, portugués y tailandés. Está diseñado para generación de texto, seguimiento de instrucciones, razonamiento y uso en herramientas. La variante NPU2 no añade capacidades nuevas, pero busca facilitar su despliegue en entornos de cómputo de borde con aceleración NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 3 000 millones (3B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 128 000 tokens (modelo base) |
| Tipos de cuantizacion | No disponible (el repo no especifica formatos concretos) |
| Idiomas soportados | ingles (según el modelo base; tambien soporta otros idiomas de Llama 3.2) |
| Licencia | Llama 3 (Meta AI) |
| Formato de pesos | safetensors (repositorio de 5.6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct, un transformer denso con atención por ventanas, normalización RMSNorm y activaciones SwiGLU. El modelo base fue entrenado con un conjunto de datos de 9 billones de tokens, con un proceso de afinamiento supervisado (SFT) y optimización por preferencias (DPO). La variante NPU de Atomic-Germ no modifica la arquitectura ni los pesos; su propósito es ofrecer una versión con posibles ajustes de cuantización o de compilación para ejecutarse eficientemente en las NPUs XDNA2 de AMD Ryzen AI mediante el runtime FastFlowLM. No se han publicado detalles sobre el proceso de optimización concreto ni sobre el conjunto de datos de entrenamiento adicional.

## Capacidades

- Generación de texto y seguimiento de instrucciones en inglés y otros idiomas del modelo base.
- Razonamiento básico y matemático, con rendimiento comparable al de Llama 3.2 3B Instruct.
- Soporte de tool calling y function calling, como en el modelo base.
- Capacidad de uso en tareas de resumen, reescritura y extracción de información.
- Optimización específica para ejecución en NPU de AMD Ryzen AI (XDNA2) con FastFlowLM, lo que permite inferencia en dispositivos de bajo consumo.
- No se ha evaluado explícitamente soporte de visión ni de audio; el modelo es exclusivamente de texto.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo puede gestionar diálogos multi-turno con contexto largo (hasta 128 000 tokens) en portátiles o mini-PCs con NPU AMD Ryzen AI, sin necesidad de conexión a la nube.
- Experimentación académica y prototipado: dado su tamaño y licencia, es adecuado para investigación sobre eficiencia de inferencia en NPU y para comparar técnicas de cuantización.
- Generación de código en entornos locales: soporta tool calling y puede integrarse en flujos de desarrollo en equipos con recursos limitados, siempre que se respete la licencia.
- Resumen de documentos largos: la ventana de contexto amplia permite procesar informes o artículos extensos en un solo paso.
- Reescritura y mejora de textos: útil para tareas de redacción asistida en inglés y otros idiomas del modelo base.
- Evaluación de rendimiento en hardware heterogéneo: sirve como punto de referencia para comparar la ejecución de Llama 3.2 3B en NPU frente a GPU y CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento específicos de la variante NPU2, ni de comparaciones con el modelo base en términos de velocidad o precisión tras la optimización. Se recomienda consultar el repositorio original de Meta para los resultados del modelo Llama 3.2 3B Instruct.

## Requisitos de hardware

- La variante NPU2 está diseñada para ejecutarse en procesadores AMD Ryzen AI con NPU XDNA2 (por ejemplo, Ryzen AI 300 series). No se especifican los requisitos mínimos exactos.
- En cuanto a VRAM, el modelo base en precisión BF16 ocupa aproximadamente 6 GB en memoria, por lo que cabe en GPUs con 8 GB o más. Con cuantización a 8 bits o 4 bits, el uso de memoria se reduce a unos 3-4 GB o 2-3 GB respectivamente.
- Se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4060, etc., con cuantización. Para uso en CPU, llama.cpp puede cargar el modelo con memoria RAM suficiente.
- Para la NPU, se requiere el runtime FastFlowLM y el driver adecuado de AMD; no se han publicado especificaciones de latencia o throughput.
- Opciones de despliegue: llama.cpp, vLLM, Ollama y TGI (servidor de inferencia de Hugging Face) son compatibles con Llama 3.2 3B, aunque la versión NPU2 está pensada para el runtime específico de AMD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3 | Modelo base de la variante NPU2 |
| Gemma 2 2.6B | 2.6B | 8K | Gemma license | Más pequeño, contexto menor |
| Phi 3.5 mini | 3.8B | 128K | MIT | Competidor directo en tamaño y contexto |

La variante NPU2 no modifica las capacidades del modelo base, por lo que la comparación es la misma que la del Llama 3.2 3B Instruct. Según la documentación de Meta, el modelo supera a Gemma 2 2.6B y a Phi 3.5 mini en tareas como seguimiento de instrucciones, resumen, reescritura y uso de herramientas.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial está prohibido sin permiso explícito de Meta. Cualquier redistribución debe seguir las directrices de Meta.
- El modelo puede alucinar o generar contenido sesgado, como cualquier modelo de lenguaje de este tamaño.
- El conocimiento está congelado en la fecha de corte del modelo base (2024).
- No se ha evaluado para aplicaciones de alto riesgo o en tiempo real.
- La optimización para NPU XDNA2 no está documentada públicamente; no se ofrecen garantías sobre el rendimiento en otros hardware.
- El repositorio no incluye los pesos originales de Meta; el usuario debe obtenerlos directamente de Meta y luego aplicar la versión optimizada si corresponde.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Atomic-Germ/Llama-3.2-3B-NPU2
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Variante similar de 8B: https://huggingface.co/Atomic-Germ/Llama-3.1-8B-Instruct-NPU2
- Página de Llama 3.2 en Ollama: https://ollama.com/library/llama3.2:3b
- Documentación oficial de Meta sobre Llama 3.2: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Licencia de Llama 3: https://ai.meta.com/llama/license/
