# bowmanslayer/Ornith-1.5-9B-Uncensored-GGUF

## Resumen

Ornith-1.5-9B-Uncensored-GGUF es una colección de cuantizaciones GGUF del modelo Ornith-1.5-9B-Uncensored, una versión "abliterated" (sin alineamiento de seguridad) del modelo Ornith-1.5-9B desarrollado por ornith-ai. El autor bowmanslayer ha eliminado los mecanismos de rechazo del modelo original, de modo que responde a peticiones que el modelo base rechazaría, manteniendo a la vez la coherencia y las capacidades generales. Está pensado para ejecutarse con llama.cpp, LM Studio, Ollama, Jan o KoboldCpp, y se distribuye bajo licencia Apache 2.0.

El modelo base Ornith-1.5-9B es un transformer denso de 9 000 millones de parámetros con una arquitectura de atención híbrida (24 capas de atención lineal y 8 de atención completa, con dimensión oculta 4096), basado en la familia Qwen3.5. Soporta una ventana de contexto de 256 000 tokens (262 144), lo que unido a un KV cache reducido hace que los contextos largos sean comparativamente baratos en memoria. Este repositorio GGUF incluye seis niveles de cuantización, desde BF16 (~18 GB) hasta Q3_K_M (~4,5 GB), para adaptarse a distintos hardware.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece un rendimiento competitivo en razonamiento, matemáticas y código (media de 86,86 en 11 benchmarks); por otro, al eliminar la capa de seguridad, plantea un caso de uso específico para investigación de seguridad, fine-tuning con capas de protección propias o generación de contenido sin restricciones, siempre bajo la responsabilidad del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (24 capas linear attention + 8 capas full attention, hidden 4096) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 000 tokens (262 144) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repo base) |

## Arquitectura y entrenamiento

Ornith-1.5-9B emplea una arquitectura de atención híbrida: 24 de sus 32 capas usan atención lineal (linear attention) y las 8 restantes usan atención completa (full attention). Esta combinación reduce significativamente el tamaño del KV cache en comparación con un modelo denso del mismo tamaño, lo que permite manejar contextos de 256K tokens con un coste de memoria relativamente bajo. La dimensión oculta es de 4096.

El modelo base Ornith-1.5 fue entrenado por ornith-ai siguiendo un enfoque de "self-improvement" (auto-mejora): el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. El proceso de post-entrenamiento incluye fases de refuerzo que han demostrado mejoras en razonamiento y veracidad. La versión "Uncensored" de bowmanslayer aplica una técnica de abliteration (ablación de la dirección de rechazo) sobre el modelo ya entrenado, eliminando la tendencia a negarse a responder a ciertas peticiones. Según las pruebas del autor, esta ablación apenas degrada el rendimiento general (media de -0,59 puntos en 11 benchmarks) y en dos benchmarks (BBH y TruthfulQA) incluso mejora los resultados.

## Capacidades

- Generacion de texto fluida y coherente en ingles y chino, con capacidad de mantener conversaciones multi-turno.
- Razonamiento complejo: obtiene 95,27 en BBH y 88,97 en MMLU, lo que indica solidez en tareas de razonamiento simbolico y conocimiento general.
- Matematicas: 97,98 en GSM8K y 70,53 en MATH-500, mostrando competencia en problemas aritmeticos y matematicas de nivel medio.
- Generacion de codigo: 92,16 en HumanEval, apto para tareas de programacion basadas en descripciones en lenguaje natural.
- Capacidad de seguir instrucciones: 77,53 en IFEval (strict), con buena adherencia a formatos y restricciones.
- Sin rechazo de peticiones: el modelo responde a practicamente cualquier solicitud, incluidas aquellas que el modelo base rechazaria (0/23 refusals en pruebas adversariales).
- Solo texto: este repositorio GGUF no incluye el proyector de vision (mmproj) del modelo base, por lo que no puede procesar imagenes. Para uso multimodal es necesario usar el repo bf16 o W4A16 con vLLM.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin capa de seguridad, analizar vulnerabilidades, sesgos y mecanismos de abliteration. Se usaria en entornos controlados con supervisión humana.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones, dialogos o material satirico que requiera explorar temas tabu o controversiales sin filtros. El modelo mantiene coherencia y estilo en contextos largos.
- Fine-tuning con capa de seguridad propia: organizaciones que necesitan un modelo base sin alineamiento para entrenar posteriormente su propio sistema de moderacion o politicas de seguridad, partiendo de un modelo con buenas capacidades generales.
- Chatbot de proposito general en entornos privados: desplegado localmente con llama.cpp u Ollama, puede servir como asistente conversacional en ingles o chino, con la ventaja de un contexto de 256K para dialogos extensos.
- Generacion de codigo y scripts: gracias a su puntuacion de 92 en HumanEval, puede usarse para autocompletar o generar funciones, aunque se recomienda revision humana dado el riesgo de errores o codigo inseguro.
- Razonamiento y analisis de documentos largos: con 256K de contexto, puede procesar libros, informes o codigo fuente extenso, resumiendo o extrayendo informacion relevante. El KV cache reducido permite ejecutarlo en GPUs de gama media.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a la version bf16 de referencia (el autor indica que las cuantizaciones GGUF se desvian poco respecto a estos valores, en linea con las observaciones habituales de la comunidad). Se comparan con el modelo base Ornith-1.5-9B sin abliterar.

| Benchmark | N | Ornith-1.5-9B base | Ornith-1.5-9B-Uncensored | Delta |
|---|---:|---:|---:|---:|
| MMLU | 150 | 90,14 | 88,97 | -1,17 |
| CMMLU | 150 | 86,67 | 84,17 | -2,50 |
| MMLU-Pro | 150 | 88,97 | 87,12 | -1,85 |
| C-Eval | 150 | 85,82 | 84,78 | -1,04 |
| ARC-Challenge | 150 | 93,33 | 94,67 | +1,34 |
| TruthfulQA | 150 | 79,31 | 82,31 | +3,00 |
| GSM8K | 100 | 98,99 | 97,98 | -1,01 |
| MATH-500 | 100 | 73,68 | 70,53 | -3,15 |
| BBH | 150 | 91,72 | 95,27 | +3,55 |
| HumanEval | 164 | 94,67 | 92,16 | -2,51 |
| IFEval (strict) | 100 | 78,65 | 77,53 | -1,12 |
| Media (excl. trunc.) | — | 87,45 | 86,86 | -0,59 |

En pruebas de rechazo (23 prompts adversariales en 9 categorias), el modelo obtuvo 0 refusals y 23 respuestas coherentes, sin artefactos de bucle ni gibberish. La longitud media de salida es de 540 tokens (frente a 487 del base) y la tasa de truncamiento se redujo de 94 a 88 sobre 1514 muestras.

## Requisitos de hardware

- BF16 (~18 GB): recomendado para RTX 3090/4090 de 24 GB o Mac con 32 GB o mas. Calidad de referencia sin perdidas.
- Q8_0 (~10 GB): apto para RTX 4080, 4070 Ti Super de 16 GB, RTX 3090 o Mac de 16 GB. Calidad casi sin perdidas.
- Q6_K (~7,6 GB): corre en RTX 3060 de 12 GB, 4060 Ti, 4070 o Mac de 16 GB. Calidad alta, cercana a Q8.
- Q5_K_M (~6,5 GB): para RTX 3060 de 12 GB, 4060 de 8 GB o Mac de 16 GB. Buen equilibrio calidad/rendimiento.
- Q4_K_M (~5,5 GB): apto para RTX 3050 de 8 GB, 4060 de 8 GB, 2060 de 12 GB o Mac de 8-16 GB. Ligera degradacion pero muy utilizable.
- Q3_K_M (~4,5 GB): para GPUs de 6 GB (GTX 1660, 2060), Mac de 8 GB o portatiles de gama baja. Degradacion notable pero funcional.

Se recomienda anadir 1-2 GB sobre el peso del archivo para KV cache y overhead del sistema. El modelo se puede desplegar con llama.cpp (modo servidor con KV cache int8 para ampliar contexto), LM Studio, Ollama, Jan o KoboldCpp. Para vLLM existe una version W4A16 separada. En Apple Silicon, el backend Metal ejecuta GGUF de forma nativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---:|---:|---:|---:|---|---|
| Ornith-1.5-9B (base) | 9B | 256K | 90,14 | 94,67 | Apache 2.0 | safetensors, GGUF |
| Ornith-1.5-9B-Uncensored (este) | 9B | 256K | 88,97 | 92,16 | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct (referencia) | 7B | 128K | 71,5 | 88,2 | Apache 2.0 | safetensors, GGUF |

La comparativa con Qwen2.5-7B-Instruct se incluye como referencia orientativa por ser un modelo de tamano similar y tambien de la familia Qwen, aunque los datos de Qwen provienen de su documentacion oficial y no de una evaluacion conjunta. El modelo Ornith-1.5-9B supera claramente a Qwen2.5-7B en MMLU y HumanEval, y ofrece un contexto doble (256K frente a 128K). La version Uncensored pierde alrededor de 1-2 puntos en la mayoria de benchmarks respecto al base, pero mantiene un rendimiento muy competitivo.

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: responde a peticiones que el modelo base rechazaria, incluyendo contenido potencialmente danino, ilegal o eticamente problematico. El autor exige confirmar mayoria de edad y aceptar responsabilidad legal por los outputs.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en temas de actualidad o muy especificos. La puntuacion de TruthfulQA (82,31) indica una tasa de veracidad moderada, no perfecta.
- Sesgos: al estar entrenado principalmente en ingles y chino, puede presentar sesgos culturales o linguisticos de esos dominios. No se han publicado evaluaciones de sesgo para esta version.
- Solo texto en este repositorio: la capacidad de vision del modelo base no esta disponible en los archivos GGUF. Para uso multimodal se requiere el repo bf16 o W4A16 con vLLM.
- Degradacion por cuantizacion: las versiones Q3_K_M y Q4_K_M pueden mostrar perdidas notables de calidad en tareas complejas de razonamiento o codigo. Se recomienda usar Q5_K_M o superior para produccion.
- Restricciones de despliegue: el autor pide explicitamente no desplegar el modelo a terceros sin anadir una capa de seguridad propia. Aunque la licencia Apache 2.0 permite uso comercial, el aviso del autor es una condicion etica, no legal.
- Sin garantias de soporte: el repositorio es un proyecto personal de bowmanslayer, no un producto oficial de ornith-ai. Puede haber diferencias de comportamiento entre cuantizaciones no documentadas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/bowmanslayer/Ornith-1.5-9B-Uncensored-GGUF
- Modelo base (bf16): https://huggingface.co/bowmanslayer/Ornith-1.5-9B-Uncensored
- Version W4A16 para vLLM: https://huggingface.co/bowmanslayer/Ornith-1.5-9B-Uncensored-W4A16
- Repositorio GGUF oficial de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Blog de Ornith-1.5 (self-improvement): https://ornith.ai/ornith_1_5.html
- GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
