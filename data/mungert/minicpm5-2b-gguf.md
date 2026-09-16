# Mungert/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por el usuario Mungert a partir del modelo denso MiniCPM5-2B de OpenBMB. Se trata del segundo modelo de la serie MiniCPM5, tras MiniCPM5-1B, y está diseñado específicamente para despliegue local, en dispositivo y en entornos con recursos limitados. El modelo base es un Transformer denso de unos 2.516 millones de parámetros (2,52 B), con licencia Apache 2.0 y soporte declarado de inglés y chino.

El problema que resuelve es el de disponer de un modelo de razonamiento y uso de herramientas que quepa en hardware de consumo o incluso en dispositivos edge, sin renunciar a capacidades que tradicionalmente se asocian a modelos de mayor tamaño. El autor del modelo base afirma alcanzar el estado del arte en la categoría de 2 B y mantenerse competitivo frente a modelos de la clase 4 B en código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas.

La relevancia de este repositorio concreto es práctica: al estar en GGUF, el modelo puede ejecutarse con llama.cpp, Ollama o LM Studio en CPU, GPU de gama media y dispositivos con memoria unificada. La cuantización se generó con llama.cpp en el commit 38a5b42d9, y el repositorio ocupa 61,9 GB, lo que indica la presencia de múltiples variantes de cuantización, aunque la información disponible no detalla la lista completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5; etiquetado como "llama" en el repositorio) |
| Parametros totales | 2.516.756.480 (~2,52 B, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el repositorio esta etiquetado como long-context |
| Tipos de cuantizacion | GGUF generado con llama.cpp (commit 38a5b42d9); la lista completa de variantes no esta disponible. Tamano del repo: 61,9 GB |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base openbmb/MiniCPM5-2B |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible (apto para Hugging Face Inference Endpoints) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un Transformer denso de 2 B de parámetros, no un modelo de mezcla de expertos ni una arquitectura híbrida con capas de state space. Según la model card del autor original, MiniCPM5-2B escala la misma receta de entrenamiento empleada en MiniCPM5-1B, lo que sugiere una continuidad de diseño dentro de la serie. No se dispone de detalles sobre número de capas, dimensiones ocultas, número de cabezas de atención, uso de GQA, función de activación ni tokenizador en la información proporcionada.

En cuanto a los datos, la model card lista los corpus utilizados: Ultra-FineWeb y Ultra-FineWeb-L3 para datos web, UltraX-Preview, UltraData-Math y UltraData-Code para dominios específicos, y tres conjuntos de posentrenamiento (UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609). La presencia de conjuntos específicos de SFT, de SFT orientado a agentes y de RL indica un pipeline de posentrenamiento en varias etapas con ajuste supervisado, entrenamiento orientado a uso de herramientas y una fase de aprendizaje por refuerzo. No se especifica el número total de tokens de entrenamiento, la composición porcentual del dataset ni los algoritmos concretos de RL empleados.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento en código, incluyendo generación y comprensión de fragmentos de programación.
- Razonamiento matemático, con resolución de problemas paso a paso.
- Comprensión de contexto largo, según la etiqueta long-context del repositorio (la longitud exacta no está publicada).
- Tool calling y function calling, reforzado por el conjunto de datos UltraData-SFT-Agent-2609.
- Tareas agénticas y razonamiento multi-paso, con soporte para encadenar llamadas a herramientas.
- Despliegue en dispositivo y edge, con cuantizaciones que reducen el modelo a pocos gigabytes.
- Compatibilidad con endpoints de inferencia, según la etiqueta endpoints_compatible.
- No se ha confirmado en la información disponible soporte de visión, audio, modo thinking explícito ni otras capacidades multimodales.

## Casos de uso

- Asistentes locales en dispositivos edge: al ser un modelo de 2 B cuantizable por debajo de los 2 GB, puede ejecutarse en portátiles, mini-PC y dispositivos con memoria unificada, ofreciendo un asistente conversacional sin conexión y sin coste por token.
- Atención al cliente automatizada multilingüe en inglés y chino: el modelo puede mantener conversaciones multi-turno y su etiqueta de contexto largo permite arrastrar historial de sesión extenso sin truncar el diálogo.
- Agentes con tool calling en automatizaciones internas: gracias al entrenamiento específico en SFT de agentes, puede generar llamadas estructuradas a funciones para consultar bases de datos, lanzar tareas o consultar APIs dentro de un orquestador.
- Asistencia de código en IDE local: integrado mediante llama.cpp u Ollama, permite autocompletado, explicación de fragmentos y generación de tests sin enviar código propietario a servicios externos.
- Procesamiento por lotes de documentos largos: para resumen, extracción de campos y clasificación de grandes volúmenes de texto, el coste por documento es muy inferior al de un modelo de 30 B o superior, y el contexto largo reduce la necesidad de trocear agresivamente.
- Tutoría de matemáticas: con razonamiento paso a paso, puede generar explicaciones de ejercicios y comprobar soluciones en un entorno educativo con recursos limitados.
- Filtrado y enriquecimiento en pipelines ETL: clasificación de registros, normalización de texto y etiquetado en inglés y chino con latencia baja y despliegue en la misma máquina que el pipeline.
- Investigación sobre agentes y RL: al ser un modelo pequeño con licencia Apache 2.0, sirve como banco de pruebas económico para experimentar con prompts de agente, formatos de tool calling y estrategias de decodificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card del modelo base incluye un gráfico de radar de capacidades por dimensión (razonamiento de código, razonamiento matemático y otras) comparado con modelos de la clase 4 B, pero la información recuperada no contiene los valores numéricos asociados, por lo que no se pueden reproducir cifras de MMLU, HumanEval, GSM8K u otros conjuntos.

Las únicas afirmaciones cualitativas disponibles, procedentes del autor del modelo base, son: estado del arte en la categoría de 2 B dentro del conjunto de comparación, competitividad general frente a modelos de 4 B, y ventajas específicas en código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. Estas afirmaciones no van acompañadas de cifras verificables en el material disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (2,52 B de parámetros): en FP16/BF16 unos 5,0 GB; en Q8_0 alrededor de 2,7 GB; en Q4_K_M en torno a 1,5-1,6 GB; en Q3_K_M cerca de 1,2-1,3 GB; en Q2_K aproximadamente 1,0 GB. Son estimaciones derivadas del número de parámetros, no datos publicados.
- A la VRAM de pesos hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, el número de capas y la configuración de atención, datos no disponibles. Con contextos largos la caché puede crecer varios gigabytes y convertirse en el factor dominante.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones Q4 y superiores con margen; en tarjetas profesionales, A100, H100 y L40S son sobredimensionadas para el tamaño del modelo y solo se justifican por concurrencia o contextos muy largos.
- Cabe en GPU de consumo: sí. En Q4_K_M se ajusta en tarjetas de 4-6 GB e incluso en iGPU con memoria compartida. En Q8_0 requiere al menos 4 GB libres.
- Despliegue sin GPU: viable en CPU con llama.cpp, Ollama, LM Studio o llama-cpp-python. Un modelo de 2 B cuantizado a Q4 ofrece velocidades interactivas en procesadores de escritorio modernos.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio), Ollama y LM Studio a partir de los GGUF, llama-cpp-python para integración en Python, y la versión safetensors del modelo base con transformers, vLLM o TGI. Para vLLM y TGI conviene usar el modelo base en safetensors, ya que el soporte de GGUF en esos servidores es más limitado.
- Latencia y throughput: no disponibles. El rendimiento dependerá de la cuantización, del hardware y de la longitud de contexto utilizada; no se publican medidas de tokens por segundo.
- Nota de compatibilidad: al haberse generado los GGUF en un commit concreto de llama.cpp (38a5b42d9), conviene usar una versión de llama.cpp igual o posterior para evitar problemas de metadatos o plantillas de chat.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B (este repositorio, GGUF) | 2,52 B | no disponible (etiquetado como long-context) | apache-2.0 | GGUF en HuggingFace; safetensors en el modelo base | Tool calling, agentes y despliegue en dispositivo declarados por el autor |
| MiniCPM5-1B | no disponible | no disponible | no disponible | HuggingFace (openbmb) | Versión anterior de la misma serie, mismo enfoque on-device |
| Qwen2.5-1.5B | ~1,54 B | 32.768 tokens | apache-2.0 | safetensors y GGUF | Menor tamaño y contexto documentado; buen soporte multilingüe general |
| Gemma 2 2B | ~2,61 B | 8.192 tokens | licencia Gemma (con condiciones de uso) | safetensors y GGUF | Tamaño comparable, contexto más corto y licencia con restricciones adicionales |

La comparación de rendimiento no puede completarse: no hay cifras de benchmarks publicadas para MiniCPM5-2B en la información disponible, por lo que no es posible situarlo numéricamente frente a Qwen2.5-1.5B o Gemma 2 2B. La ventaja documentada de MiniCPM5-2B frente a estas alternativas sería el soporte explícito de tool calling y de tareas agénticas junto con la orientación a contexto largo, siempre según las afirmaciones del autor del modelo base.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino están declarados. No hay soporte declarado de castellano, por lo que el rendimiento en español no está garantizado y probablemente sea inferior.
- Tamaño: con 2 B de parámetros, la tasa de alucinación en tareas de conocimiento factual abierto será considerablemente mayor que en modelos de 7 B o más. Conviene anclar las respuestas con recuperación de contexto (RAG) y verificación externa.
- Razonamiento complejo: los errores en cadenas de razonamiento largas, matemáticas avanzadas y código de gran complejidad son esperables; no se recomienda su uso sin supervisión en tareas críticas.
- Contexto: aunque el repositorio se etiqueta como long-context, no se publica la longitud máxima soportada, lo que impide dimensionar la caché KV y planificar el despliegue con precisión.
- Benchmarks: la ausencia de cifras reproducibles impide validar las afirmaciones de estado del arte de la categoría de 2 B. Cualquier decisión de adopción debería basarse en una evaluación propia sobre el caso de uso concreto.
- Cuantización: las variantes más agresivas (Q2, Q3) degradan de forma notable el tool calling y el razonamiento estructurado, porque los formatos de herramienta exigen precisión en la generación de JSON. Se recomienda Q4_K_M o superior para uso agéntico.
- Repositorio de terceros: los GGUF los ha generado el usuario Mungert, no OpenBMB. La licencia Apache 2.0 del modelo base se mantiene, pero la trazabilidad de la conversión depende del repositorio y del commit de llama.cpp empleado.
- Madurez: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad ni con informes de fallos.
- Sesgos: los corpus de entrenamiento son fundamentalmente web (Ultra-FineWeb y Ultra-FineWeb-L3) y de dominios técnicos en inglés y chino, por lo que es probable que hereden sesgos de esas fuentes y estén peor cubiertos los dominios culturales hispanohablantes.
- Producción: para uso comercial, Apache 2.0 es permisiva, pero deben revisarse las licencias de los datos de entrenamiento y de la plantilla de chat antes de integrar el modelo en un producto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mungert/MiniCPM5-2B-GGUF
- Modelo base (openbmb/MiniCPM5-2B): https://huggingface.co/openbmb/MiniCPM5-2B
- Model card en chino del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- MiniCPM Tech Report (arXiv:2506.07900): https://arxiv.org/pdf/2506.07900
- Segundo paper referenciado (arXiv:2602.09003): https://arxiv.org/abs/2602.09003
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData: https://ultradata.openbmb.cn/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Commit de llama.cpp usado para generar los GGUF: https://github.com/ggerganov/llama.cpp/commit/38a5b42d9a3e82e0a586bcd1caed121f36c87a73
- Guia de seleccion de formato GGUF del autor de las cuantizaciones: https://readyforquantum.com/huggingface_gguf_selection_guide.html
- Dataset openbmb/Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset openbmb/UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset openbmb/UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset openbmb/UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset openbmb/UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset openbmb/UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset openbmb/UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
