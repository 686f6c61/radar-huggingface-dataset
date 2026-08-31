# ApolloRaines/Phi-4-mini-Instruct-Desyced

## Resumen

Phi-4-mini-Instruct-Desyced es una variante del modelo microsoft/Phi-4-mini-instruct, modificada por ApolloRaines para reducir la sicofancia (tendencia a estar de acuerdo con el usuario aunque este se equivoque). El modelo base, desarrollado por Microsoft, es un transformer decoder-only de 3.836 millones de parámetros con una ventana de contexto de 128.000 tokens, entrenado con datos sintéticos y sitios web filtrados con énfasis en razonamiento denso. La modificación "Desyced" ajusta los pesos del modelo para eliminar la dirección de activación asociada con la capitulación ante presión social, sin reentrenamiento ni RLHF, preservando las capacidades originales.

El resultado es un modelo que mantiene el conocimiento, el razonamiento y la personalidad del Phi-4-mini original, pero que resiste mejor los intentos de manipulación por parte del usuario. Según la model card, en pruebas de contradicción (donde el usuario presiona al modelo para que cambie una respuesta correcta citando una autoridad falsa), el modelo pasó de mantenerse firme en el 50% de los casos a hacerlo en el 100%. Está disponible en formato safetensors (precisión completa) y GGUF cuantizado (Q8_0 y Q4_K_M), con licencia MIT, lo que facilita su integración en entornos de producción y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-4-mini) |
| Parametros totales | 3.836.021.760 (3,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Ingles (etiquetado como "en"; el modelo base soporta otros idiomas, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base, Phi-4-mini-instruct, es un transformer decoder-only con 3,8 B parámetros, perteneciente a la familia Phi-4 de Microsoft. Fue entrenado con una combinacion de datos sinteticos de alta calidad y sitios web publicos filtrados, con un enfoque en datos densos en razonamiento. Soporta una ventana de contexto de 128.000 tokens y utiliza un tokenizador propio de la familia Phi.

La modificacion "Desyced" no implica reentrenamiento ni ajuste fino con datos adicionales. Se trata de una intervencion post-entrenamiento sobre los pesos del modelo: se identifica la direccion de activacion asociada con el comportamiento sicofantico (ceder ante la presion del usuario) y se reduce su influencia. Segun el autor, esto preserva el conocimiento, el razonamiento y las capacidades conversacionales del modelo base, eliminando unicamente la tendencia a capitular ante afirmaciones incorrectas presentadas con autoridad o seguridad.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (128.000 tokens).
- Razonamiento logico y matematico, heredado del modelo base Phi-4-mini.
- Generacion de codigo y comprension de lenguajes de programacion.
- Resistencia a la sicofancia: mantiene respuestas correctas ante presion social, citas de autoridades falsas o afirmaciones erroneas del usuario.
- Compatible con tool calling y function calling (capacidad del modelo base, no modificada por el proceso Desyced).
- Soporte para agentes y razonamiento multi-paso, gracias a la arquitectura del modelo base.
- Capacidades multilingues limitadas: el modelo esta etiquetado como ingles, aunque el base puede manejar otros idiomas; no se garantiza el rendimiento fuera del ingles.

## Casos de uso

- Asistente de conocimiento fiable: en entornos educativos o de consulta, el modelo no cede ante usuarios que insisten en datos incorrectos, lo que lo hace adecuado para verificar hechos o dar respuestas academicas sin sesgo de complacencia.
- Soporte tecnico de nivel 2: cuando un cliente afirma haber probado una solucion incorrecta o cita documentacion erronea, el modelo mantiene la correccion y sugiere el procedimiento adecuado, reduciendo errores en diagnostico.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD mediante tool calling, el modelo puede revisar y corregir codigo sin dejarse influenciar por comentarios del desarrollador que sugieran soluciones suboptimas.
- Tutoria y formacion: como tutor virtual, explica conceptos y corrige errores conceptuales del estudiante sin validar respuestas equivocadas por cortesia, mejorando el aprendizaje.
- Analisis de datos y toma de decisiones: en herramientas de business intelligence, el modelo puede evaluar hipotesis del usuario y rechazar conclusiones incorrectas basadas en datos mal interpretados, aportando objetividad.
- Chatbots de atencion al cliente: gestiona conversaciones multi-turno con contexto largo, manteniendo politicas de la empresa incluso cuando el cliente presiona con argumentos falsos o amenazas.
- Moderacion de contenido: detecta y rechaza afirmaciones falsas o manipuladoras en foros y redes sociales, manteniendo una postura factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion documentada es la prueba de contradiccion descrita en la model card:

| Prueba | Antes (modelo base) | Despues (Desyced) |
|---|---|---|
| Mantiene la respuesta correcta bajo presion | 50% | 100% |

Esta prueba consiste en que el modelo responde correctamente a una pregunta factual y luego el usuario presiona para que cambie su respuesta citando una autoridad falsa o expresando certeza. El modelo Desyced mantiene su respuesta en el 100% de los casos, frente al 50% del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,7 GB en FP16 (segun llm-explorer.com), 3,8 GB en GGUF Q8_0 y 2,1 GB en GGUF Q4_K_M.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, A10, L4). Para cuantizacion Q4_K_M, basta con 4 GB (RTX 3050, GTX 1660 Super, incluso Apple Silicon con 8 GB unificados).
- Cabe en GPUs de consumo: si, con cuantizacion Q4_K_M o Q8_0 en tarjetas de gama media.
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp, Ollama, LM Studio, TGI. Ademas, el autor proporciona DeepswapLLM, una herramienta que permite ejecutar el modelo en GPUs demasiado pequenas para albergarlo en precision completa, transmitiendo capas entre GPU, RAM y disco, hasta 4 veces mas rapido que AirLLM.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una generacion de 30-50 tokens/s, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Sicofancia reducida |
|---|---|---|---|---|---|
| Phi-4-mini-Instruct-Desyced | 3,8 B | 128 K | MIT | safetensors, GGUF | Si |
| microsoft/Phi-4-mini-instruct | 3,8 B | 128 K | MIT | safetensors | No |
| Llama-3.2-3B-Instruct | 3,2 B | 128 K | Llama 3.2 | safetensors, GGUF | No |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K | Apache 2.0 | safetensors, GGUF | No |

La principal diferencia frente a las alternativas es la modificacion especifica anti-sicofancia, que no esta presente en los otros modelos. En cuanto a rendimiento bruto, el modelo base Phi-4-mini supera a Llama-3.2-3B y Qwen2.5-3B en tareas de razonamiento, segun benchmarks publicados de Microsoft, aunque no se dispone de datos comparativos para esta variante concreta.

## Limitaciones y advertencias

- El proceso Desyced reduce la sicofancia, pero no elimina otros sesgos presentes en el modelo base (sesgos de genero, raza o ideologicos) que no han sido evaluados en esta variante.
- Riesgo de alucinacion: el modelo puede generar informacion falsa o inventada, especialmente en temas poco representados en sus datos de entrenamiento. La reduccion de sicofancia no afecta a la veracidad factual.
- Limitacion de idioma: aunque el modelo base puede manejar varios idiomas, la model card solo garantiza ingles. El rendimiento en otros idiomas puede ser inferior.
- La modificacion de pesos puede tener efectos colaterales no documentados en tareas especificas, aunque el autor afirma que las capacidades se preservan. No se han publicado evaluaciones exhaustivas mas alla de la prueba de contradiccion.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario es responsable del cumplimiento de las leyes aplicables y de la etiqueta de uso del modelo base.
- El modelo no ha sido evaluado en entornos de produccion a gran escala; se recomienda realizar pruebas de robustez antes de desplegarlo en sistemas criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Phi-4-mini-Instruct-Desyced
- Repositorio de archivos: https://huggingface.co/ApolloRaines/Phi-4-mini-Instruct-Desyced/tree/main
- Ficha en llm-explorer.com: https://llm-explorer.com/model/ApolloRaines%2FPhi-4-mini-Instruct-Desyced,3XkaAP0uruJ6vAHXRImnN
- Modelo base en Microsoft Foundry: https://ai.azure.com/catalog/models/Phi-4-mini-instruct
- Herramienta DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Implementacion de Phi-4-mini para Qualcomm: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/phi_4_mini_instruct/README.md
