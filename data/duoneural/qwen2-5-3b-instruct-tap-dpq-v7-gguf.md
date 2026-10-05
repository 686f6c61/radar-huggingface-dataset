# DuoNeural/Qwen2.5-3B-Instruct-TAP-DPQ-v7-GGUF

## Resumen

Qwen2.5-3B-Instruct-TAP-DPQ-v7-GGUF es una cuantización GGUF del modelo Qwen2.5-3B-Instruct (3.085.938.688 parámetros) publicada por DuoNeural Research Lab. No se trata de un modelo entrenado desde cero, sino de un proceso de cuantización con calibración imatrix propio, denominado TAP-DPQ v7, que incorpora dos contribuciones técnicas: una asignación de bits lagrangiana consciente de GQA (GQA-Aware Lagrangian Bit Allocation) y un corpus de calibración de cuatro dominios (Quad-Domain Calibration) de 150.000 tokens. El objetivo declarado es mantener la calidad en niveles de compresión muy agresivos, entre 1,56 y 4,50 bits por peso (bpw).

La relevancia del artefacto está en su resultado principal: según la model card, la variante IQ3_XXS (3,06 bpw) iguala la línea base BF16 en GPQA Diamond (32,0 %), mientras que una versión previa del mismo método degradaba esa métrica hasta el 14 %. El autor atribuye la corrección a haber ampliado el dominio de ciencia en el corpus de calibración del 20 % al 28 %. Esto lo convierte en un caso de estudio interesante sobre cómo la composición del dataset de calibración afecta a la degradación selectiva por cuantización, más que en un modelo nuevo con capacidades propias.

El modelo base es un transformer decoder-only denso de la familia Qwen2.5, con atención de consultas agrupadas (GQA) 16Q/8KV y licencia Apache-2.0, lo que permite uso comercial. La ventana de contexto empleada en los ejemplos de uso del autor es de 32.768 tokens. El repositorio ocupa 6,6 GB e incluye varias escalas de cuantización. En el momento de la consulta el modelo acumulaba 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con GQA 16Q/8KV; pesos en formato GGUF cuantizados con el método TAP-DPQ v7 |
| Parámetros totales | 3.085.938.688 (≈3,09 B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 32.768 tokens (valor empleado en los ejemplos de uso del autor; `-c 32768`) |
| Tipos de cuantización | BF16 (referencia), Q4_K_M (4,50 bpw), IQ3_XXS (3,06 bpw), IQ2_M (2,70 bpw), IQ2_XXS (2,06 bpw), IQ1_S (1,56 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / llama-cpp), calibrado con imatrix |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Método de cuantización | TAP-DPQ v7 (GQA-Aware Lagrangian Bit Allocation + Quad-Domain Calibration) |
| Corpus de calibración | 150.000 tokens: 32 % código, 28 % CoT, 28 % ciencia, 12 % lingüístico |
| Tamaño del repositorio | 6,6 GB (incluye todas las escalas publicadas) |
| Fecha de publicación | 2026-10-04 (creación), 2026-10-04 (última actualización) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU y atención con sesgo en las proyecciones QKV. La model card indica una configuración de GQA de 16 cabezas de consulta y 8 cabezas de clave/valor, y menciona capas frontera 0-2 y 33-35, lo que implica una pila de 36 capas. No se documenta en la información proporcionada el número de tokens de preentrenamiento del modelo original ni la composición de su dataset, ya que este repositorio es un artefacto de cuantización, no un entrenamiento nuevo. Tampoco hubo RLHF ni DPO adicionales: el pipeline de instrucciones es el heredado de Qwen2.5-3B-Instruct.

La innovación reside en el algoritmo de cuantización. La asignación lagrangiana de bits consciente de GQA asigna un peso de sensibilidad doble a las proyecciones de clave/valor, justificado por el hecho de que cada cabeza KV es compartida por dos cabezas de consulta en la configuración 16Q/8KV. Además, las capas frontera (0-2 y 33-35) reciben un refuerzo de 1,35x. El presupuesto de bits se resuelve mediante doble bisección sobre el multiplicador lambda. La calibración se realiza con un corpus de cuatro dominios (150.000 tokens: 32 % código, 28 % cadena de pensamiento, 28 % ciencia, 12 % lingüístico) del que se deriva la matriz Hessiana empleada por imatrix. El autor sostiene que el ajuste de la proporción de ciencia del 20 % al 28 % es lo que corrige la caída de rendimiento en GPQA Diamond de la variante IQ3_XXS.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Qwen2.5-3B-Instruct.
- Razonamiento matemático: 70,0 % en MATH-500 en BF16 y 62,0 % con Q4_K_M, según la model card.
- Razonamiento científico de nivel graduado: 32,0 % en GPQA Diamond en BF16, igualado por IQ3_XXS y ligeramente superado por IQ2_M (34,0 %, probablemente ruido de medida).
- Generación de código: 26,0 % en LiveCodeBench en BF16 y Q4_K_M; baja a 22,0 % (IQ3_XXS) y 20,0 % (IQ2_M), y se desploma a 12,0 % en IQ2_XXS.
- Tool calling / function calling: 100,0 % en Hermes Tool en BF16 y Q4_K_M, 83,3 % en IQ3_XXS, 66,7 % en IQ2_M y 30,0 % en IQ2_XXS.
- Comportamiento no evasivo: 100 % en XSTest en todas las escalas, incluida IQ1_S, lo que sugiere que la política de rechazo no se ve afectada por la compresión.
- Razonamiento matemático avanzado tipo competición (AIME 2026): 3,33 % en BF16 e IQ3_XXS, 10,0 % en Q4_K_M. El autor no explica la mejora de Q4_K_M sobre BF16.
- Capacidades multimodales, de audio o de visión: no disponibles (el modelo base es solo texto).
- Modo de pensamiento explícito (thinking mode): no disponible.
- Soporte multilingüe: no disponible en la información proporcionada; dependería del modelo base.

## Casos de uso

- Asistente conversacional en local con Q4_K_M: con 4,50 bpw el modelo conserva el 100 % de tool calling y el 62,0 % de MATH-500, y el archivo de pesos ocupa aproximadamente 1,7 GB, por lo que puede ejecutarse íntegramente en GPU de consumo o incluso en CPU con llama.cpp.
- Enrutado y clasificación de intenciones en servidores sin GPU: la variante IQ3_XXS (≈1,2 GB de pesos) permite levantar un endpoint de clasificación o extracción de campos con huella de memoria mínima, asumiendo la pérdida de tool calling (83,3 % frente a 100 %).
- Generación de código asistida en pipelines de CI/CD: con Q4_K_M mantiene 26,0 % en LiveCodeBench, el mismo valor que BF16, por lo que sirve para autocompletar tests, generar mensajes de commit o revisar diffs sin degradación medible en esa métrica.
- Agentes con llamada a herramientas en entornos de recursos limitados: Q4_K_M sostiene el 100 % en Hermes Tool, lo que permite integrarlo en flujos multi-paso con function calling (consultas a API, cálculo, recuperación) siempre que el presupuesto de memoria permita la escala de 4,50 bpw.
- Evaluación comparativa de pipelines de cuantización: el repositorio publica resultados por escala sobre el mismo modelo base, lo que lo hace útil como referencia para medir el impacto de imatrix, la asignación de bits por capa o la composición del corpus de calibración en un modelo de 3 B.
- Prototipado y demos docentes en portátiles sin GPU dedicada: IQ2_M (≈1,0 GB) permite ejecutar un chat instruct en CPU, con la advertencia de que MATH-500 cae al 30,0 % y AIME al 0,0 %.
- Procesamiento de documentos con contexto largo en local: los 32.768 tokens de ventana permiten resumir contratos, informes o transcripciones en una sola pasada con llama-server, siempre que se reserve VRAM suficiente para la caché KV.
- Filtrado de contenido y generación segura: el 100 % en XSTest en todas las escalas indica que la variante más comprimida conserva el comportamiento de no evasión, lo que la hace apta para tareas de moderación o reescritura donde el rechazo indebido es un coste.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. No se especifica el arnés de evaluación, el número de muestras ni los intervalos de confianza.

| Cuantización | bpw | MATH-500 | GPQA Diamond | AIME 2026 | LiveCodeBench | Hermes Tool | XSTest |
|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 16,00 | 70,0 % | 32,0 % | 3,33 % | 26,0 % | 100,0 % | 100 % |
| Q4_K_M | 4,50 | 62,0 % | 20,0 % | 10,0 % | 26,0 % | 100,0 % | 100 % |
| IQ3_XXS | 3,06 | 46,0 % | 32,0 % | 3,33 % | 22,0 % | 83,3 % | 100 % |
| IQ2_M | 2,70 | 30,0 % | 34,0 % | 0,0 % | 20,0 % | 66,7 % | 100 % |
| IQ2_XXS | 2,06 | 2,0 % | 0,0 % | 0,0 % | 12,0 % | 30,0 % | 100 % |
| IQ1_S | 1,56 | 0,0 % | 0,0 % | 0,0 % | 0,0 % | 0,0 % | 100 % |

Observaciones sobre los datos: GPQA Diamond no cae de forma monótona (20,0 % en Q4_K_M frente a 32,0 % en BF16 e IQ3_XXS, y 34,0 % en IQ2_M), lo que apunta a que las diferencias de dos o tres puntos porcentuales están dentro del ruido de una evaluación con pocas muestras. El salto de AIME 2026 de 3,33 % a 10,0 % en Q4_K_M tampoco se explica en la model card. No se han publicado resultados de benchmarks de terceros en la información disponible.

## Requisitos de hardware

Estimaciones derivadas del número de parámetros y de los bpw declarados. Las cifras de pesos son cálculo directo (3.085.938.688 parámetros × bpw / 8); la caché KV es una estimación a partir de la configuración indicada por el autor (36 capas, GQA 16Q/8KV, dimensión de cabeza 128, FP16).

| Escala | Pesos (aprox.) | VRAM con caché KV a 8K | VRAM con caché KV a 32K |
|---|---|---|---|
| BF16 | 6,2 GB | ≈7,5 GB | ≈10,9 GB |
| Q4_K_M | 1,7 GB | ≈3,0 GB | ≈6,4 GB |
| IQ3_XXS | 1,2 GB | ≈2,5 GB | ≈5,9 GB |
| IQ2_M | 1,0 GB | ≈2,3 GB | ≈5,7 GB |
| IQ2_XXS | 0,8 GB | ≈2,1 GB | ≈5,5 GB |
| IQ1_S | 0,6 GB | ≈1,9 GB | ≈5,3 GB |

- Cabe en GPU de consumo: sí. Las escalas IQ2 e IQ3 entran en GPU con 4 GB de VRAM (GTX 1650, RTX 3050) con contexto moderado; Q4_K_M entra en 6-8 GB (RTX 3060, RTX 4060, RTX 2070).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M con contexto largo; A100, H100 o L40S no aportan ventaja a este tamaño salvo por agregación de muchas peticiones concurrentes.
- Caché KV: a 32.768 tokens y FP16 se estima en torno a 4,5 GB, lo que domina el consumo total; usar caché en Q8 o reducir el contexto a 8K-16K es la palanca principal para ajustar memoria.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y LM Studio mediante importación del GGUF, llama-cpp-python y text-generation-webui. El tag del repositorio indica compatibilidad con endpoints. El soporte de vLLM para GGUF es limitado y no está documentado para esta publicación.
- Ejemplo de invocación proporcionado por el autor: `llama-cli -m Qwen2.5-3B-Instruct-TAP-DPQ-v7-Q4_K_M.gguf -ngl 99 -c 32768 --temp 0.7 -p "Your prompt"`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de hardware de referencia.

## Comparativa con modelos similares

Datos de parámetros, contexto y licencia tomados de las fichas oficiales de cada modelo; los datos de rendimiento comparativo no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato / cuantizaciones | Uso comercial |
|---|---|---|---|---|---|
| DuoNeural/Qwen2.5-3B-Instruct-TAP-DPQ-v7-GGUF | 3,09 B | 32.768 tokens (según ejemplos de uso) | Apache-2.0 | GGUF, 6 escalas desde 1,56 bpw | Sí |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens nativos | Apache-2.0 | safetensors, AWQ, GPTQ, GGUF (comunitarias) | Sí |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF (comunitarias) | Sí, con condiciones |
| microsoft/Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | safetensors, GGUF (comunitarias) | Sí |
| google/gemma-2-2b-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF (comunitarias) | Sí, con condiciones |

La comparación relevante para este artefacto no es frente a otros modelos, sino frente a otras cuantizaciones del mismo Qwen2.5-3B-Instruct: frente a un GGUF Q4_K_M estándar, la propuesta de DuoNeural añade la asignación de bits por capa y el corpus de calibración de cuatro dominios. No se dispone de una comparación directa publicada entre esta cuantización y las cuantizaciones comunitarias equivalentes de Qwen2.5-3B-Instruct, por lo que no es posible confirmar la ventaja declarada.

## Limitaciones y advertencias

- Degradación severa por debajo de 3 bpw: IQ2_XXS cae a 2,0 % en MATH-500, 0,0 % en GPQA Diamond y 30,0 % en Hermes Tool; IQ1_S anula todas las capacidades salvo XSTest. Estas escalas no son aptas para producción salvo que solo se necesite texto genérico.
- Riesgo de alucinación: no se documenta ninguna evaluación de factualidad (por ejemplo, TruthfulQA o tasas de abstención). Al ser un modelo de 3 B con cuantización agresiva, el riesgo de invención de datos aumenta, especialmente en tareas de razonamiento científico y matemático.
- Inconsistencias en los propios benchmarks: GPQA Diamond mejora en Q4_K_M respecto a BF16 y AIME 2026 pasa de 3,33 % a 10,0 % con Q4_K_M, lo que es implausible como efecto real de la cuantización y sugiere ruido de medida o un número reducido de muestras. No se publica el arnés ni el tamaño de los conjuntos de evaluación.
- Resultados no verificados: 0 descargas y 0 likes, sin evaluaciones independientes ni réplica de los resultados por terceros.
- Corpus de calibración poco documentado: se dan porcentajes por dominio, pero no la procedencia de los tokens ni si hay solapamiento con los conjuntos de evaluación, lo que podría inflar los resultados en los dominios sobrerrepresentados (código, CoT y ciencia).
- Referencias cruzadas no comprobables: la model card menciona una versión previa del método aplicada a un modelo denominado "LFM2.5" con una caída de GPQA al 14 %. No se ha podido verificar la existencia ni las condiciones de esa comparación.
- Idiomas: no se especifican los idiomas soportados. El comportamiento multilingüe es el heredado del modelo base y no está evaluado en esta ficha.
- Contexto: los 32.768 tokens son el valor usado en los ejemplos del autor; no se documenta si se ha validado la calidad a esa longitud ni si se aplica escalado tipo YaRN para ampliarla.
- Licencia: Apache-2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se atribuya el modelo base Qwen/Qwen2.5-3B-Instruct. No se imponen restricciones adicionales en la información proporcionada.
- Metadatos potencialmente anómalos: la fecha declarada de creación y actualización es 2026-10-04, posterior a la fecha habitual de publicación de los modelos Qwen2.5; conviene verificar la procedencia del artefacto antes de integrarlo en un entorno de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/Qwen2.5-3B-Instruct-TAP-DPQ-v7-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper, blog técnico, repositorio o demo del método TAP-DPQ: no disponible en la información proporcionada.
- La búsqueda web asociada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a guías de mascotas de World of Warcraft Classic (wow-petopia.com, wowhead.com, classic-pets.com, icy-veins.com) y se han descartado por no guardar relación con el modelo.
