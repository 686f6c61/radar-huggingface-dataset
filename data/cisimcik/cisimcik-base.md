# cisimcik/cisimcik-base

## Resumen

cisimcik-base es un modelo de lenguaje base (no instruido) especializado en turco, desarrollado por el usuario cisimcik. Se trata de un «continued pre-training» completo (todos los parámetros, sin LoRA) del modelo Qwen/Qwen3.5-4B-Base sobre 9.980 millones de tokens, de los cuales el 91,5 % son turco y el 8,5 % son datos de replay en inglés, código, matemáticas y otros 23 idiomas. El objetivo declarado es doblar el rendimiento en turco sin degradar significativamente las capacidades bilingües heredadas del modelo original.

El modelo conserva la arquitectura híbrida de Qwen3.5, que combina atención completa en una de cada cuatro capas con Gated DeltaNet (atención lineal con estado recurrente) en las 24 restantes. Tiene 4,21 mil millones de parámetros, 32 capas, hidden size de 2560 y un vocabulario de 248.320 tokens con embeddings atados. Se eliminaron el codificador de visión y la capa de predicción multi-token (MTP) del modelo base, por lo que es exclusivamente de texto.

Es relevante ahora porque ofrece un punto de partida abierto (licencia CC0-1.0, sin restricciones) para fine-tuning en turco, con una reducción del 45 % en perplejidad sobre texto web no visto (de 8,0 a 4,4) y una pérdida de validación en inglés que solo empeora 0,104 puntos. El autor ya ha publicado dos derivados construidos sobre esta base: cisimcik-4b (chat) y tau-4b (modelo de decisión).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (Qwen3_5ForCausalLM): 32 capas, 24 con Gated DeltaNet (atención lineal) y una de cada 4 con atención completa; hidden size 2560, MLP 9216 |
| Parametros totales | 4.205.751.296 (4,21 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado con secuencias de hasta 16.384 tokens; las posiciones están configuradas hasta 262.144 (heredadas del modelo base), pero no se han probado entradas más largas |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en bf16; no se han publicado versiones cuantizadas) |
| Idiomas soportados | Turco (principal) e inglés; los datos de replay incluyen código, matemáticas y otros 23 idiomas |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros datos: 32 capas; atención completa con 16 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 256; vocabulario de 248.320 tokens con el tokenizer de Qwen3.5 sin modificar y embeddings atados; tamaño del repositorio 8,4 GB.

## Arquitectura y entrenamiento

La arquitectura es la del modelo de texto Qwen3.5-4B: 32 capas con hidden size 2560 y MLP de 9216. Solo la cuarta parte de las capas usa atención completa estándar; las otras 24 emplean Gated DeltaNet, un mecanismo de atención lineal con estado recurrente. Durante el pre-entrenamiento continuado, los documentos se empaquetaron en secuencias y tanto el estado de atención como el de Gated DeltaNet se reiniciaron en cada frontera de documento, evitando contaminación cruzada entre textos.

El entrenamiento se hizo con todos los parámetros (no LoRA) y un calendario warmup-stable-decay, en 9.518 pasos de 1 millón de tokens cada uno (9.980 millones de tokens en total). La fase A consumió 8.370 millones de tokens con secuencias de 4.096 tokens y un learning rate que subió a 3e-5 en 200 pasos y se mantuvo constante. La fase B (annealing) consumió 1.610 millones de tokens con secuencias de 16.384 tokens y una proporción mayor de texto de alta calidad, con el learning rate decayendo hasta 0. El optimizador fue AdamW con betas (0,9; 0,95), weight decay 0,1 y gradient clipping 1,0. El entrenamiento se ejecutó en 4 GPU NVIDIA A100 de 80 GB durante 124 horas en el clúster UHeM Altay.

En cuanto a los datos, el 49,0 % del total (4.890 millones de tokens) es web en turco procedente de FineWeb-2 turco (limpiado), BellaTurca mC4 y OSCAR, Cosmos y HPLT 3.0, todo deduplicado. El resto del corpus turco (académico: artículos, publicaciones de DergiPark y resúmenes de tesis) y la composición del bloque de replay aparecen truncados en la información disponible, por lo que no se detallan aquí. No se menciona ninguna fase de RLHF, DPO o instruction tuning: el modelo no está alineado con instrucciones.

## Capacidades

- Generación y continuación de texto en turco: es la capacidad principal y para la que fue optimizado, con mejoras de pérdida de validación de entre 0,195 y 0,940 puntos frente al modelo base según el dominio.
- Modelado de lenguaje bilingüe turco-inglés: mantiene competencia en inglés a costa de un incremento de pérdida de 0,104 puntos.
- Cobertura de dominios turcos específicos: web, académico, texto seleccionado (ÖzenliDerlem), sentencias judiciales y foros, con mejoras notables en el dominio judicial (de 1,719 a 0,779 de pérdida).
- Procesamiento de secuencias largas durante el entrenamiento: hasta 16.384 tokens en la fase de annealing.
- Capacidades residuales de código y matemáticas: proceden exclusivamente de los datos de replay (8,5 % del entrenamiento); la pérdida en código empeora ligeramente (de 1,028 a 1,081).
- No soporta tool calling ni function calling: no se ha entrenado para ello.
- No soporta uso como agente ni razonamiento multi-paso guiado: es un modelo base sin alineación.
- No soporta modo «thinking», visión ni audio: el codificador de visión y la capa MTP fueron eliminados del modelo base.

## Casos de uso

- Punto de partida para fine-tuning en turco: el modelo está diseñado explícitamente para esto; un equipo que necesite un modelo de chat o de clasificación en turco puede aplicar SFT sobre esta base sin partir de cero ni pagar el coste del pre-entrenamiento.
- Modelado de dominio jurídico turco: la pérdida en sentencias judiciales cae de 1,719 a 0,779, lo que lo hace adecuado como base para recuperación de información, resumen o extracción de entidades sobre jurisprudencia.
- Completado de texto en herramientas de escritura turca: al ser un modelo base, encaja en escenarios de autocompletado y continuación de párrafos donde no se requiere seguir instrucciones.
- Investigación sobre arquitecturas híbridas de atención: al combinar Gated DeltaNet con atención completa y publicarse con licencia CC0, sirve para estudiar el comportamiento de la atención lineal en un modelo ya entrenado y compararlo con el base original.
- Generación aumentada por recuperación (RAG) en turco: se puede integrar como generador de un pipeline RAG tras un fine-tuning ligero, aprovechando su mejor modelado del turco para producir respuestas más coherentes con el contexto recuperado.
- Adaptación a variedades dialectales o sectores concretos del turco: la receta de pre-entrenamiento continuado con replay es replicable; una empresa puede aplicar la misma estrategia sobre esta base con su corpus propietario y una pequeña proporción de datos generales.
- Entrenamiento de modelos derivados especializados: el propio autor ha publicado cisimcik-4b (chat) y tau-4b (modelo de decisión) construidos sobre esta base, lo que demuestra el flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, CETVEL u otros) para este modelo base en la información disponible. El autor indica que las evaluaciones de tareas se reportan en los modelos derivados cisimcik-4b (CETVEL, OpenLLM Turkish Leaderboard) y tau-4b.

Lo que sí se publica es la pérdida de validación (cross-entropy por token, menor es mejor) sobre documentos no vistos durante el entrenamiento y separados de las fuentes del corpus. Ambos modelos usan el mismo tokenizer, por lo que las cifras son directamente comparables.

| Conjunto de validación | Qwen3.5-4B-Base | cisimcik-base | Diferencia |
|---|---:|---:|---:|
| Web en turco | 2,079 | 1,482 | -0,597 |
| Académico en turco | 1,972 | 1,528 | -0,444 |
| Texto turco seleccionado (ÖzenliDerlem) | 2,381 | 1,783 | -0,598 |
| Sentencias judiciales turcas | 1,719 | 0,779 | -0,940 |
| Foros turcos | 2,907 | 2,124 | -0,782 |
| Registros de agente, shell y pregunta-respuesta | 1,889 | 1,694 | -0,195 |
| Inglés | 2,058 | 2,162 | +0,104 |
| Código | 1,028 | 1,081 | +0,052 |
| Otros idiomas | 2,248 | 2,272 | +0,024 |

El autor advierte que la Wikipedia turca y dos conjuntos locales pequeños se excluyeron de la tabla porque sus documentos de validación también aparecen en copias repetidas del entrenamiento, por lo que sus valores de pérdida estarían artificialmente mejorados.

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 8,4 GB.
- GPU: cualquier GPU con 12 GB de VRAM o más es suficiente para inferencia en bf16, según el autor. No se especifican modelos concretos de GPU para inferencia; el entrenamiento se realizó con 4× NVIDIA A100 de 80 GB.
- CPU: es viable con 16 GB de RAM.
- Kernels opcionales: instalar `flash-linear-attention` habilita kernels más rápidos de Gated DeltaNet en GPU NVIDIA. Sin esta librería, las capas Gated DeltaNet usan la implementación PyTorch de transformers, que da resultados correctos pero es más lenta con entradas largas.
- Versión de librería: se requiere `transformers>=5.17` y PyTorch.
- Opciones de despliegue: transformers (flujo documentado por el autor) y endpoints de HuggingFace (el repositorio lleva la etiqueta `endpoints_compatible`). No se han publicado pesos en GGUF ni versiones cuantizadas, por lo que no hay soporte confirmado para llama.cpp, Ollama o motores que dependan de GGUF. No se documenta compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrenamiento | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cisimcik-base | 4,21 mil millones | 16.384 tokens | Turco e inglés | cc0-1.0 | Base especializada en turco; mejor pérdida de validación en turco, peor en inglés y código |
| Qwen/Qwen3.5-4B-Base | No disponible en la información proporcionada (el derivado conserva la misma arquitectura y vocabulario) | Posiciones configuradas hasta 262.144 | Multilingüe | No disponible en la información proporcionada | Modelo original; mejor pérdida en inglés (2,058), código (1,028) y otros idiomas (2,248) |
| cisimcik-4b | No disponible | No disponible | No disponible | No disponible | Derivado de cisimcik-base orientado a chat; evaluado en CETVEL y OpenLLM Turkish Leaderboard |
| tau-4b | No disponible | No disponible | No disponible | No disponible | Derivado de cisimcik-base descrito como modelo de decisión |

La comparación principal es contra el modelo del que deriva: cisimcik-base gana en todos los dominios turcos medidos y pierde marginalmente en inglés, código y otros idiomas. No se dispone de datos de benchmarks de tareas que permitan compararlo con otros modelos turcos de tamaño similar.

## Limitaciones y advertencias

- Es un modelo base, no un modelo de chat: continúa el texto que recibe, no sigue instrucciones ni mantiene conversaciones. El template de chat de Qwen3.5 permanece en el tokenizer, pero el modelo no fue entrenado con él, por lo que usarlo no produce una conversación coherente.
- Riesgo de alucinación inherente a un modelo de lenguaje sin alineación: al no haber pasado por RLHF ni DPO, no hay ninguna capa de calibración de veracidad.
- Degradación en inglés y código: la pérdida en inglés sube 0,104 puntos y la de código 0,052 puntos respecto al modelo base. Es un intercambio deliberado por el rendimiento en turco.
- Cobertura lingüística limitada: aunque los datos de replay incluyen 23 idiomas adicionales, el entrenamiento está dominado por el turco (91,5 %) y el inglés; el rendimiento en otras lenguas no está documentado.
- Sesgos: no se documenta ningún análisis de sesgos. El corpus incluye web, foros y sentencias judiciales, fuentes con sesgos propios que el modelo hereda sin filtrar.
- Contaminación en la evaluación: el propio autor advierte que la Wikipedia turca y dos conjuntos locales pequeños aparecen en copias repetidas del entrenamiento, por lo que quedaron fuera de la tabla de resultados. Hay que tomar con cautela cualquier evaluación sobre esos conjuntos.
- Ventana de contexto real: aunque las posiciones están configuradas hasta 262.144, el modelo solo se entrenó con secuencias de hasta 16.384 tokens y no se han probado entradas más largas.
- Licencia: CC0-1.0 permite uso comercial sin restricciones ni atribución. No hay caveats de licencia, pero conviene verificar que el modelo base Qwen3.5-4B-Base tenga términos compatibles.
- Adopción mínima: el repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y el modelo se creó y actualizó el mismo día (4 de octubre de 2026). No hay validación independiente de sus resultados.
- Madurez del ecosistema: requiere `transformers>=5.17` y, para rendimiento óptimo, `flash-linear-attention`. No hay pesos GGUF ni cuantizados, lo que limita el despliegue en entornos de bajos recursos.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/cisimcik/cisimcik-base
- README en inglés: https://huggingface.co/cisimcik/cisimcik-base/blob/main/README_en.md
- Modelo derivado de chat, cisimcik-4b: https://huggingface.co/cisimcik/cisimcik-4b
- Modelo derivado de decisión, tau-4b: https://huggingface.co/cisimcik/tau-4b
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base

La búsqueda web realizada no devolvió resultados relevantes para este modelo: los enlaces obtenidos corresponden a páginas de inicio de sesión y correo de Yahoo, sin relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.
