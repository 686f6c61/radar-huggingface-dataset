# cultureyes-stack/Operator

## Resumen

Operator es un modelo de lenguaje de aproximadamente 4B parámetros (3.643.529.216 parámetros reales según los pesos en safetensors) desarrollado por Cultureyes y publicado bajo la familia HajeriLM. Está diseñado para generación de texto conversacional en inglés y árabe, y se distribuye como un checkpoint abierto en formato BF16 safetensors junto con dos conversiones GGUF (BF16 y Q8_0). El modelo se presenta como un esfuerzo independiente realizado en Emiratos Árabes Unidos, con foco explícito en el aprovechamiento eficiente de recursos de cómputo limitados.

La arquitectura es un transformer denso de 32 capas, con tamaño oculto de 2048, 16 cabezas de atención y 2 cabezas de clave/valor (GQA), codificación posicional RoPE con theta 500.000, contexto máximo configurado de 32.768 tokens y puertas de atención habilitadas. No se trata de un modelo MoE: todos los parámetros están activos en cada forward pass.

Su relevancia actual es limitada pero concreta: se trata de un checkpoint pequeño, bilingüe árabe-inglés, pensado para investigación, ajuste fino y desarrollo local. La ausencia de una licencia declarada y de benchmarks publicados condiciona seriamente su uso en producción, por lo que debe evaluarse como material de experimentación más que como un modelo listo para despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Hajeri), 32 capas, hidden size 2048, 16 cabezas de atención, 2 cabezas KV (GQA), RoPE theta 500.000, attention gates habilitadas |
| Parámetros totales | 3.643.529.216 (~4B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (máximo configurado) |
| Tipos de cuantización | BF16 (safetensors y GGUF), Q8_0 (GGUF) |
| Idiomas soportados | Inglés (en), árabe (ar) |
| Licencia | No especificada; no se declara concesión de licencia |
| Formato de pesos | safetensors (BF16), GGUF (BF16 y Q8_0) |

## Arquitectura y entrenamiento

Operator es un transformer decoder-only denso de 32 capas con un tamaño oculto de 2048 y 16 cabezas de atención, de las cuales solo 2 son cabezas de clave/valor, lo que reduce el coste de memoria del KV cache mediante grouped-query attention. Emplea RoPE con theta 500.000, lo que suele asociarse a una mayor estabilidad en ventanas de contexto largas, y tiene puertas de atención habilitadas. El contexto máximo configurado es de 32.768 tokens. No se especifica si incorpora innovaciones adicionales como decodificación especulativa o atención lineal.

En cuanto al entrenamiento, la model card describe un flujo de trabajo orientado a optimizar cómputo limitado: seguimiento de la entropía cruzada por ejemplo, posibilidad de dejar de gastar actualizaciones en ejemplos por debajo de un umbral de pérdida elegido, checkpoints reanudables y ajuste adaptativo de la tasa de aprendizaje a partir de la pérdida de entrenamiento. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el proceso de tokenización más allá de la existencia de un tokenizer verificado durante la conversión a GGUF.

## Capacidades

- Generación de texto conversacional en inglés y árabe, según el alcance declarado por el autor.
- Modelo base orientado a continuación de preentrenamiento y ajuste fino posterior, más que a un uso directo como asistente alineado.
- Soporte de contexto largo de hasta 32.768 tokens, adecuado para documentos y conversaciones multi-turno extensas.
- Capacidad bilingüe declarada (en/ar); el autor advierte explícitamente que no implica rendimiento equivalente entre idiomas ni entre tareas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Compatible con endpoints según los tags del repositorio (endpoints_compatible), lo que sugiere integración con infraestructura de inferencia estándar.

## Casos de uso

- Investigación sobre modelos bilingües árabe-inglés de escala pequeña: el checkpoint permite estudiar el comportamiento de un transformer de 4B con GQA y contexto de 32K en dos idiomas tipológicamente distintos, sin requerir clústeres grandes.
- Continuación de preentrenamiento con corpus propios: al publicarse los pesos en BF16 safetensors, un equipo puede seguir entrenando el modelo sobre dominios específicos (legal, sanitario, financiero) partiendo de una base ya expuesta a árabe e inglés.
- Ajuste fino supervisado para tareas concretas: clasificación de texto, resumen o extracción de información en árabe, donde los modelos de 4B suelen ser suficientes y más baratos de desplegar que alternativas de 7B o superiores.
- Desarrollo local y prototipado en estaciones de trabajo: con la conversión Q8_0 GGUF el modelo cabe en memoria de GPU de consumo, lo que facilita experimentación sin infraestructura cloud.
- Evaluación comparativa de tokenizadores y arquitecturas para árabe: el modelo sirve como punto de referencia para medir la calidad de un tokenizer bilingüe y el efecto de RoPE theta 500.000 en contexto largo.
- Generación de datos sintéticos bilingües para aumentar datasets de entrenamiento en árabe, siempre que se valide la calidad de las muestras antes de usarlas.
- Despliegue en entornos con requisitos de soberanía de datos: al poder ejecutarse localmente con llama.cpp (compilación con soporte Hajeri) o infraestructura propia, permite mantener los datos fuera de servicios de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7,3 GB solo para pesos (3,64B × 2 bytes), más KV cache y overhead; en la práctica, entre 10 y 14 GB según longitud de contexto y batch.
- VRAM estimada con Q8_0: aproximadamente 3,6-4 GB para pesos, más KV cache; viable en GPUs de consumo con 8 GB o más.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y ajuste fino; RTX 4090 (24 GB) o RTX 3090 para inferencia en BF16 con contexto largo; RTX 4070/4080 o GPUs de 8-12 GB para inferencia Q8_0.
- Cabe en GPU de consumo: sí, especialmente con la cuantización Q8_0; en BF16 requiere al menos 12-16 GB para contexto moderado.
- Opciones de despliegue: llama.cpp con compilación que incluya soporte de la arquitectura Hajeri (las builds estándar pueden no reconocer los GGUF); el checkpoint safetensors puede servirse con frameworks que soporten la arquitectura (no confirmado para vLLM o TGI). El tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Operator (Cultureyes) | ~3,64B | 32.768 | en, ar | No especificada | Pesos abiertos en HF (safetensors + GGUF) |
| Qwen2.5-3B | 3,09B | 32.768 | multilingüe (incl. árabe) | Apache 2.0 | Pesos abiertos, amplio soporte de herramientas |
| Llama 3.2 3B | 3,21B | 128.000 | multilingüe (incl. árabe) | Llama 3.2 Community License | Pesos abiertos, ecosistema maduro |
| Gemma 2 2B | 2,61B | 8.192 | multilingüe | Gemma Terms of Use | Pesos abiertos |

La comparación se ofrece a nivel de especificaciones; no hay datos de rendimiento de Operator que permitan contrastar calidad. Frente a las alternativas, Operator destaca por su contexto de 32K y su orientación explícita al árabe, pero carece de licencia clara, benchmarks y soporte de herramientas de inferencia estándar sin parchear.

## Limitaciones y advertencias

- Licencia no declarada: el autor indica explícitamente que no se concede licencia en esta release y que los términos de reutilización y redistribución quedan sin resolver. Esto bloquea de facto cualquier uso comercial o redistribución sin autorización expresa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni en tareas en árabe; cualquier evaluación de rendimiento debe hacerse por cuenta propia.
- Riesgo de alucinación: al ser un modelo base sin documentación de alineación (RLHF/DPO no confirmados), es esperable un comportamiento conversacional menos controlado y mayor propensión a inventar información.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datos de entrenamiento y su composición son desconocidos.
- Limitaciones de idioma: el autor advierte que el soporte bilingüe no implica rendimiento equivalente entre inglés y árabe ni entre tareas.
- Compatibilidad de herramientas: los GGUF requieren una build de llama.cpp con soporte de la arquitectura Hajeri; las builds estándar pueden no reconocerlos, lo que complica el despliegue.
- Contexto: los 32.768 tokens son el máximo configurado; no se ha verificado la calidad de la atención en ventanas largas.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo día (2026-11-09), sin historial de mantenimiento.
- Uso previsto declarado: investigación, experimentación, continuación de preentrenamiento y desarrollo local; el autor recomienda probar el modelo en las tareas propias antes de usarlo en producción o en contextos de consecuencias relevantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cultureyes-stack/Operator
- GGUF BF16: https://huggingface.co/cultureyes-stack/Operator/blob/main/gguf/operator-4b-bf16.gguf
- GGUF Q8_0: https://huggingface.co/cultureyes-stack/Operator/blob/main/gguf/operator-4b-q8_0.gguf
- UAE Innovates 2026: https://uaeinnovates.gov.ae/
- Referencia citada en la model card (The National): https://www.thenationalnews.com/news/uae/2024/05/29/president-sheikh-mohamed-concludes-important-visit-to-south-korea/
- Referencia citada en la model card (GovInfo): https://www.govinfo.gov/content/pkg/DCPD-202500610/pdf/DCPD-202500610.pdf
