# Honkware/Qwen3.8-27B-heretic-ara-exl3-4.0bpw

## Resumen

El modelo `Honkware/Qwen3.8-27B-heretic-ara-exl3-4.0bpw` es una cuantización en formato ExLlamaV3 (EXL3) a 4.0 bits por peso del modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara`, un fine-tune de la familia Qwen3.8-27B. La cuantización la ha realizado Honkware con la herramienta BlockQuant, manteniendo la licencia Apache 2.0 del modelo original. El resultado es un artefacto de 17.2 GB que permite ejecutar un modelo de 27.000 millones de parámetros en hardware de consumo con una pérdida de calidad mínima.

La relevancia de esta ficha radica en que Qwen3.8-27B es uno de los últimos lanzamientos de Qwen con contexto de 262.000 tokens y licencia Apache 2.0, y esta cuantización EXL3 lo hace accesible para inferencia local en GPUs de 24 GB o menos. El fine-tune "heretic-ara" añade un ajuste conversacional adicional, aunque no se dispone de detalles públicos sobre su dataset o metodología de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen3_5) de 27B, densa (no MoE) |
| Parametros totales | 27B (nominal); los safetensors cuantizados contienen 8.589.178.096 valores (4-bit) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (heredado del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | EXL3 a 4.0 bpw (este repo); tambien disponibles 4.5 y 5.0 bpw en la coleccion |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (sigue la licencia del modelo base) |
| Formato de pesos | safetensors en formato EXL3 (exllamav3) |

## Arquitectura y entrenamiento

El modelo base `trohrbaugh/Qwen3.8-27B-heretic-ara` es un fine-tune de Qwen3.8-27B, que a su vez se basa en la arquitectura Qwen3.5: un transformer denso de 27.000 millones de parametros con atencion por ventanas deslizantes y atencion completa alternadas, disenado para manejar contextos de hasta 262.000 tokens. No se dispone de informacion publica sobre el dataset de fine-tuning de "heretic-ara" ni sobre si se emplearon tecnicas como RLHF o DPO.

La cuantizacion EXL3 realizada por Honkware utiliza el formato de ExLlamaV3 con 4.0 bits por peso, 8 bits para las cabezas de atencion, 250 filas de calibracion y un codebook de tipo `mul1`. Este codebook queda registrado en los pesos, de modo que los cargadores compatibles (ExLlamaV3 v0.0.3 o superior) lo detectan automaticamente sin configuracion adicional. La cuantizacion no anade restricciones de uso respecto al modelo base.

## Capacidades

- Generacion de texto conversacional y de larga forma, heredada del modelo Qwen3.8-27B.
- Razonamiento y resolucion de problemas en multiples dominios (matematicas, logica, ciencia).
- Generacion de codigo en diversos lenguajes de programacion.
- Soporte de contexto largo de hasta 262.000 tokens, util para documentos extensos y conversaciones multi-turno.
- Capacidades multilingues del modelo base (aunque no se especifican los idiomas exactos en esta cuantizacion).
- No se ha confirmado si el fine-tune heretic-ara conserva las capacidades de tool calling o vision del modelo base; no hay documentacion al respecto.

## Casos de uso

- Asistencia conversacional local: al ser una cuantizacion de 17.2 GB, puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 3090 o 4090) para ofrecer un chatbot privado sin conexion a internet, con baja latencia y sin coste por token.
- Analisis de documentos extensos: gracias a los 262.000 tokens de contexto, es posible procesar libros completos, informes anuales o codigo fuente de grandes repositorios en una sola pasada, resumiendo o extrayendo informacion clave.
- Generacion y revision de codigo en entornos de desarrollo: el modelo puede integrarse en IDEs o pipelines de CI/CD para autocompletar, revisar o documentar codigo, aprovechando su capacidad de razonamiento y su licencia permisiva.
- Prototipado de agentes conversacionales: con ExLlamaV3 y TabbyAPI se puede montar un servidor compatible con OpenAI para experimentar con agentes multi-paso, aunque la ausencia de tool calling confirmada limita las integraciones externas.
- Educacion y tutoria: el modelo puede actuar como tutor en materias STEM, explicando conceptos y resolviendo ejercicios paso a paso, gracias a su entrenamiento en razonamiento.
- Investigacion academica: al ser Apache 2.0, puede usarse libremente en proyectos de investigacion, incluyendo fine-tuning adicional o evaluacion de sesgos, sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion EXL3 a 4.0 bpw. El modelo base Qwen3.8-27B ha reportado metricas en MMLU, HumanEval y GSM8K (segun fuentes externas), pero no se dispone de esos numeros en la informacion proporcionada. No se deben extrapolar resultados de la version sin cuantizar a esta version cuantizada, ya que la perdida de precision puede variar.

## Requisitos de hardware

- VRAM estimada: 17.2 GB de pesos + overhead de activaciones y KV cache. Con contexto corto (4K tokens) cabe en una GPU de 24 GB (RTX 3090, RTX 4090, A5000). Para contexto largo (262K) se necesitan al menos 40-48 GB o usar offload a CPU.
- GPU recomendadas: RTX 3090/4090 (24 GB) para uso general; A100 40GB o H100 para contexto largo o despliegue concurrente.
- En consumer GPU: si, en GPUs de 24 GB con cuantizacion 4.0 bpw y contexto moderado.
- Opciones de despliegue: ExLlamaV3 (API Python), TabbyAPI (servidor compatible con OpenAI), text-generation-webui (interfaz grafica con loader ExLlamaV3).
- Latencia: no disponible; depende del hardware y del tamano de contexto. Como referencia, un modelo de 27B en 4-bit en una RTX 4090 suele generar entre 40 y 60 tokens por segundo con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors (BF16) | HuggingFace |
| Qwen3-27B (generacion anterior) | 27B | 131K | Apache 2.0 | safetensors | HuggingFace |
| Llama 3.3 70B | 70B | 128K | Llama 3.3 | safetensors | HuggingFace |
| Este modelo (cuantizado) | 27B | 262K | Apache 2.0 | EXL3 4.0 bpw | HuggingFace |

La comparativa de rendimiento no esta disponible para esta cuantizacion. Respecto a alternativas en el mismo rango de VRAM, una cuantizacion de Llama 3.3 70B a 3-4 bits ocuparia un tamano similar, pero con menor calidad por la mayor compresion. El modelo base Qwen3.8-27B destaca por su contexto largo y su licencia permisiva.

## Limitaciones y advertencias

- La cuantizacion a 4.0 bpw introduce una perdida de precision que puede afectar a tareas de razonamiento complejo o generacion de codigo; se recomienda probar con las versiones de 4.5 o 5.0 bpw si la calidad es insuficiente.
- No se dispone de informacion sobre el proceso de fine-tuning de "heretic-ara" (dataset, tecnicas de alineacion), por lo que podria presentar sesgos o comportamientos impredecibles en dominios sensibles.
- El nombre "heretic" sugiere un posible fine-tune sin restricciones de seguridad; el modelo podria generar contenido inapropiado o toxico si se le solicita.
- El codebook `mul1` requiere ExLlamaV3 v0.0.3 o superior; versiones antiguas decodificarian los pesos incorrectamente.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero se debe verificar que el fine-tune heretic-ara no anada restricciones adicionales (la model card afirma que no, pero no hay documentacion de auditoria).
- No se garantiza el soporte de tool calling o vision, ya que no se ha confirmado si el fine-tune conserva estas capacidades del modelo base.
- El contexto de 262K tokens es teorico; en la practica, la memoria necesaria para la KV cache limita el contexto usable en GPUs de 24 GB.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/Honkware/Qwen3.8-27B-heretic-ara-exl3-4.0bpw
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Coleccion de cuantizaciones (4.5 y 5.0 bpw): https://huggingface.co/collections/Honkware/qwen38-27b-heretic-ara-exl3-6a7fa388508e4061796d13b2
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- BlockQuant (herramienta de cuantizacion): https://github.com/Honkware/blockquant
