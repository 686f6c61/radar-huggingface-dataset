# Darth-Coder/my-model2.5-14b-it

## Resumen

Darth-Coder/my-model2.5-14b-it es un modelo de lenguaje de 14.7 mil millones de parámetros, desarrollado por el usuario Darth-Coder a partir del modelo base Qwen/Qwen2.5-14B-Instruct. Se trata de un fine-tuning orientado a conversación y generación de texto en inglés, distribuido bajo licencia Apache 2.0. Aunque la model card publicada reproduce íntegramente la del modelo original de Qwen, no se aporta información adicional sobre el proceso de ajuste específico realizado por el autor, por lo que las capacidades y características técnicas coinciden con las de Qwen2.5-14B-Instruct.

El modelo emplea una arquitectura transformer causal con atención QKV con sesgo, RoPE, SwiGLU y RMSNorm, y soporta una longitud de contexto de hasta 131 072 tokens (128K) mediante la técnica YaRN, con generación máxima de 8192 tokens. Su relevancia radica en que ofrece una alternativa de tamaño medio (14B) con buen equilibrio entre rendimiento y requisitos de hardware, apta para despliegue local y aplicaciones de producción que requieran razonamiento, código y comprensión multilingüe, aunque la ficha oficial solo declara inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y attention con bias QKV |
| Parametros totales | 14 770 033 664 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens (configuracion por defecto: 32 768; con YaRN se extiende a 131 072) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (declarado en la model card; el modelo base soporta 29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-14B-Instruct: un transformer causal con 48 capas, 40 cabezas de atencion para consultas y 8 para claves/valores (GQA), con funciones de activacion SwiGLU y normalizacion RMSNorm. El contexto nativo es de 32 768 tokens, ampliable a 131 072 mediante la configuracion YaRN incluida en la model card. El entrenamiento del modelo base incluyo una fase de preentrenamiento y un ajuste posterior (post-training) con tecnicas de supervision y refuerzo, aunque no se detalla si el fine-tuning realizado por Darth-Coder anadio etapas adicionales como RLHF o DPO. No se proporciona informacion sobre el dataset de entrenamiento especifico de este modelo derivado, ni sobre el numero de tokens usados en el ajuste.

## Capacidades

- Generacion de texto conversacional y asistencia en tareas de chat.
- Razonamiento y resolucion de problemas de matematica y logica, gracias a las mejoras del modelo base en estas areas.
- Generacion y comprension de codigo en multiples lenguajes de programacion (capacidad heredada de Qwen2.5).
- Seguimiento de instrucciones complejas y generacion de salidas estructuradas, incluyendo JSON.
- Comprension de datos estructurados (tablas, bases de datos) y generacion de texto largo (mas de 8K tokens).
- Soporte de tool calling y function calling, aunque no esta confirmado explicitamente en la model card; se infiere de las capacidades del modelo base.
- Procesamiento de contextos largos (hasta 128K tokens) con la configuracion YaRN recomendada para vLLM.
- Multilingue en el modelo base (29 idiomas), pero la ficha oficial solo declara ingles.

## Casos de uso

- Atencion al cliente automatizada: puede gestionar conversaciones multi-turno con contexto prolongado gracias a su ventana de 128K tokens, manteniendo el historial de la interaccion sin perder informacion relevante.
- Generacion de codigo en entornos de desarrollo: al heredar las capacidades de Qwen2.5 para programacion, puede asistir en la escritura de funciones, depuracion y refactorizacion dentro de IDEs o pipelines de CI/CD.
- Analisis de documentos extensos: su capacidad para procesar mas de 100K tokens permite resumir o extraer informacion de manuales, contratos o informes largos en una sola pasada.
- Creacion de chatbots especializados: al ser un fine-tune de un modelo instruct, puede adaptarse a dominios concretos (soporte tecnico, educacion, salud) mediante ajuste adicional o prompting.
- Generacion de contenido estructurado: produce salidas en JSON u otros formatos, util para automatizar la creacion de metadatos, esquemas o respuestas de APIs.
- Prototipado rapido de aplicaciones de IA: su tamano moderado (14B) permite ejecutarlo en GPU de consumo (con cuantizacion) para pruebas de concepto sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo en la informacion disponible. La model card hace referencia al blog de Qwen2.5 para evaluaciones detalladas, pero no se incluyen cifras concretas. Se recomienda consultar los resultados del modelo base Qwen2.5-14B-Instruct como referencia aproximada, aunque no se garantiza que el fine-tuning mantenga exactamente el mismo rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits (Q4_K_M), un modelo de 14,7B requiere aproximadamente 9-10 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 3090, RTX 4080 o RTX 4090. Sin cuantizacion, se necesitan al menos 30 GB (por ejemplo, A100 40GB o H100).
- GPUs recomendadas: para uso local, RTX 4090 (24 GB) es suficiente con cuantizacion; para despliegue en produccion, A100 40/80GB o H100.
- Opciones de despliegue: compatible con vLLM (recomendado para contextos largos), llama.cpp, Ollama y text-generation-inference (TGI).
- Latencia y throughput: no hay datos especificos para este modelo; los benchmarks del modelo base indican que con vLLM en una A100 puede alcanzar tasas de decodificacion de varios cientos de tokens por segundo, pero no se confirma para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma |
|---|---|---|---|---|
| Darth-Coder/my-model2.5-14b-it | 14,7B | 128K | Apache 2.0 | Ingles (declarado) |
| Qwen2.5-14B-Instruct | 14,7B | 128K | Apache 2.0 | Multilingue (29 idiomas) |
| Phi-4 (14B) | 14B | 128K (aprox.) | MIT | Multilingue |
| DeepSeek-Coder-V2-Lite (16B) | 16B | 128K | MIT | Codigo, ingles |

La comparativa se basa en caracteristicas tecnicas publicas de cada modelo; no se dispone de datos de rendimiento especificos para la variante de Darth-Coder. Se recomienda evaluar cada modelo en las tareas concretas de interes.

## Limitaciones y advertencias

- Al ser un fine-tune de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales de Qwen2.5, aunque no se ha realizado una evaluacion especifica de sesgos para esta variante.
- Riesgo de alucinacion en contextos largos o cuando se le piden datos exactos; se recomienda verificar las salidas en aplicaciones criticas.
- La model card solo declara el idioma ingles, aunque el modelo base soporta muchos mas; el fine-tuning podria haber reducido el rendimiento en otros idiomas, aunque no hay evidencia.
- No se ha confirmado si el fine-tuning mantiene todas las capacidades de tool calling y function calling del modelo base; se debe probar antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base para evitar conflictos.
- El despliegue con contexto completo de 128K requiere configuracion especifica (YaRN) y hardware con suficiente memoria, ademas de usar vLLM u otro framework compatible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Darth-Coder/my-model2.5-14b-it)
- [Blog de Qwen2.5](https://qwenlm.github.io/blog/qwen2.5/)
- [Repositorio GitHub de Qwen2.5](https://github.com/QwenLM/Qwen2.5)
- [Documentacion de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Articulo tecnico de Qwen2 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
- [Articulo de YaRN (arXiv:2309.00071)](https://arxiv.org/abs/2309.00071)
