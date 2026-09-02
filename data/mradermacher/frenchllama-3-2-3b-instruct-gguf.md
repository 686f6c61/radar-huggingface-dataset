# mradermacher/FrenchLlama-3.2-3B-Instruct-GGUF

## Resumen

FrenchLlama-3.2-3B-Instruct-GGUF es una colección de cuantizaciones GGUF del modelo FrenchLlama-3.2-3B-Instruct, un ajuste fino de Llama 3.2 3B Instruct especializado en gramática francesa y aprendizaje de idiomas. El modelo original fue desarrollado por CreativeAlloyYT y la cuantización ha sido realizada por mradermacher, un conocido proveedor de archivos GGUF para inferencia local eficiente.

Esta versión cuantizada permite ejecutar un modelo de 3.200 millones de parámetros en hardware modesto, incluyendo GPUs de consumo con poca memoria, manteniendo un rendimiento razonable para tareas de conversación y explicación gramatical en francés e inglés. La licencia Apache 2.0 facilita su uso comercial y su integración en aplicaciones educativas o de procesamiento de lenguaje natural.

La relevancia de este modelo radica en su especialización en francés, un idioma con menos recursos que el inglés, y en la posibilidad de desplegarlo en entornos con restricciones de memoria gracias a los distintos niveles de cuantización ofrecidos, desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 3B) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta 128K, pero no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, fr |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base FrenchLlama-3.2-3B-Instruct es un ajuste fino de Llama 3.2 3B Instruct, un transformer autoregresivo con 3.200 millones de parámetros. El ajuste se realizó sobre el dataset Sufi2425/French_Grammar_Explanations, que contiene explicaciones de gramática francesa, lo que dota al modelo de una capacidad mejorada para responder preguntas sobre reglas gramaticales, corregir errores y generar ejemplos en francés.

La cuantización GGUF ha sido realizada por mradermacher mediante técnicas estáticas (sin imatrix), generando archivos de distintos tamaños que permiten equilibrar calidad y consumo de memoria. No se han proporcionado detalles sobre el número de tokens de entrenamiento, el método de alineación (RLHF, DPO, etc.) ni otras innovaciones técnicas del ajuste fino original.

## Capacidades

- Generación de texto en francés e inglés, con especial énfasis en explicaciones gramaticales y corrección de errores.
- Conversación multi-turno en estilo instructivo, adecuado para asistentes educativos.
- Comprensión y generación de contenido relacionado con el aprendizaje de idiomas (ejercicios, ejemplos, reglas).
- Soporte básico de instrucciones en formato chat, heredado de Llama 3.2 3B Instruct.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Tutor de gramática francesa: el modelo puede explicar reglas gramaticales, conjugar verbos y proporcionar ejemplos contextualizados, gracias a su entrenamiento específico en el dataset de explicaciones gramaticales.
- Corrector de textos en francés: puede identificar y corregir errores gramaticales en frases o párrafos, útil para estudiantes y profesionales no nativos.
- Generación de ejercicios de práctica: permite crear automáticamente ejercicios de rellenar huecos, preguntas de opción múltiple o frases para traducir, adaptados al nivel del estudiante.
- Asistente de conversación bilingüe: al soportar inglés y francés, puede actuar como intermediario en diálogos de aprendizaje, traduciendo y explicando diferencias entre ambos idiomas.
- Chatbot educativo integrable en plataformas LMS: gracias a su tamaño reducido y formato GGUF, puede desplegarse en servidores modestos o en el edge para dar soporte a estudiantes en tiempo real.
- Prototipado rápido de aplicaciones de procesamiento de lenguaje natural en francés: su licencia Apache 2.0 y su compatibilidad con herramientas como llama.cpp o Ollama facilitan la experimentación sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- Los archivos GGUF varían entre 1,5 GB (Q2_K) y 6,5 GB (f16), por lo que la VRAM necesaria para inferencia oscila aproximadamente entre 2 GB y 8 GB, dependiendo de la cuantización y del tamaño de contexto utilizado.
- Las cuantizaciones Q4_K_M (2,1 GB) y Q5_K_M (2,4 GB) son recomendables para GPUs de consumo como la GTX 1660 Super (6 GB), RTX 2060 (6 GB) o RTX 3060 (12 GB).
- Para las versiones más grandes (Q8_0 y f16) se recomienda al menos 8 GB de VRAM, como una RTX 3070 o superior.
- El modelo puede ejecutarse en CPU con llama.cpp, aunque la velocidad será menor; es viable para tareas interactivas con cuantizaciones pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier framework compatible con GGUF.
- No se han proporcionado datos de latencia o throughput específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| FrenchLlama-3.2-3B-Instruct-GGUF (este) | 3,2B | no disponible | Apache 2.0 | GGUF | Francés y gramática |
| Llama-3.2-3B-Instruct (original) | 3,2B | 128K (conocido) | Llama 3.2 Community License | safetensors, GGUF | Multilingüe general |
| mradermacher/Llama-3.2-3B-Instruct-ENG-FR-v3-GGUF | 3,2B | no disponible | Apache 2.0 | GGUF | Bilingüe inglés-francés (v3) |

La comparativa se basa en características generales, ya que no se dispone de benchmarks. El modelo original de Meta tiene una licencia más restrictiva que la Apache 2.0 de este modelo cuantizado, lo que puede ser un factor decisivo para uso comercial.

## Limitaciones y advertencias

- Al ser un ajuste fino de Llama 3.2 3B, puede heredar sesgos presentes en los datos de entrenamiento originales, aunque no se han documentado sesgos específicos en la informacion disponible.
- Riesgo de alucinación en explicaciones gramaticales: el modelo puede generar reglas incorrectas o ejemplos inventados, por lo que se recomienda supervisión humana en entornos educativos.
- Limitación idiomática: solo soporta inglés y francés; no es adecuado para otros idiomas.
- La cuantización degrada la calidad del modelo, especialmente en niveles bajos como Q2_K o Q3_K; se recomienda usar Q4_K_M o superior para tareas que requieran precisión.
- No se ha confirmado la longitud de contexto efectiva tras la cuantización; es posible que se reduzca si se usa con memoria limitada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (Llama 3.2) tiene su propia licencia que puede imponer restricciones adicionales; se debe verificar la compatibilidad.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/mradermacher/FrenchLlama-3.2-3B-Instruct-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/CreativeAlloyYT/FrenchLlama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Sufi2425/French_Grammar_Explanations
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
