# IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.6-35B-A3B, elaborada por el usuario IsValorum mediante un esquema propietario denominado APEX-I-MiniPlus V2.1. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y nomenclatura A3B, lo que indica unos 3.000 millones de parámetros activos por token. La arquitectura se organiza en 40 capas con 256 micro-expertos e incorpora un bloque integrado de Multi-Token Prediction (MTP).

El trabajo del autor no consiste en entrenar un modelo nuevo, sino en aplicar una asignación tensor a tensor de niveles de cuantización sobre los pesos del modelo base. El objetivo declarado es alcanzar una fidelidad equivalente a Q5_K/Q6_K dentro de un presupuesto de 14-15 GB (15,23 GB / 14,18 GiB), por debajo de la referencia Q3_K_M de 16,6 GB. Para ello mantiene los routers (`gate_inp`) en F32 sin comprimir, arma la cabeza de salida en Q6_K y las puertas de atención en Q8_0.

Es relevante porque demuestra que un MoE de 35B puede ejecutarse en estaciones de trabajo con 24 GB de VRAM e incluso mediante streaming desde memoria RAM del sistema (DDR4/DDR5), manteniendo una ventana de contexto declarada de 256K tokens. La licencia Apache 2.0 y el soporte de 13 idiomas amplían su aplicabilidad en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Multi-Token Prediction (MTP); arquitectura base Qwen3.6 MoE (tag `qwen35moe`) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | ~3 B (deducido de la nomenclatura A3B; no se detalla la cifra exacta en la informacion disponible) |
| Longitud de contexto | 256K tokens (declarado por el autor) |
| Tipos de cuantizacion | GGUF híbrido: `IQ3_XXS` (expertos centrales, capas 10-29), `Q3_K` (expertos de borde, 10 capas), `Q5_K` (experto compartido `shexp`, 40 capas), `Q4_K` + `Q6_K` (atención `q/k/v` y `output` en capas completas), `Q8_0` (puertas de atención en 30 capas), `Q6_K` (cabeza de salida `output.weight`), `F32` (routers `gate_inp`) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura Mixture-of-Experts con 40 capas y 256 micro-expertos, más un experto compartido (`shexp`) presente en todas las capas. La variante cuantizada conserva íntegramente la topología del modelo original y añade los tensores del bloque Multi-Token Prediction (MTP) dentro del propio GGUF principal, lo que permite a los runtimes compatibles usar decodificación especulativa. El autor indica que los routers se mantienen en F32 sin compresión para evitar "deriva de enrutamiento" (routing drift) entre expertos.

No se dispone de información sobre el proceso de entrenamiento del modelo base en la documentación proporcionada: no se detallan el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo. La información disponible se centra exclusivamente en la metodología de cuantización: asignación manual tensor a tensor, uso de imatrix, y sustitución de códecs no lineales por `Q3_K` lineal optimizado para SIMD en los expertos de borde, con el fin de eliminar bloqueos de dequantización en CPU AVX2.

## Capacidades

- Generación de texto conversacional y continuada (`conversational`).
- Razonamiento complejo: el autor menciona explícitamente el bloque `<think>` como parte del comportamiento del modelo base.
- Seguimiento de instrucciones complejas, con fidelidad declarada de Q5_K/Q6_K.
- Generación de código, incluyendo la preservación de indentación y llaves de sintaxis.
- Capacidades multilingües en 13 idiomas: inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Decodificación especulativa mediante los tensores MTP integrados.
- Capacidades de visión y OCR a través de un proyector multimodal (`mmproj`) independiente en `Q8_0`, que puede cargarse en VRAM mientras los pesos principales se sirven desde RAM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento asistido en local: el modelo puede ejecutarse en una estación de trabajo con 24 GB de VRAM manteniendo 256K tokens de contexto, lo que permite sesiones de análisis de documentos extensos sin truncar la entrada.
- Generación y revisión de código: el esquema de cuantización protege la cabeza de salida en `Q6_K` y los expertos centrales en `IQ3_XXS`, reduciendo la aparición de errores de sintaxis e indentación que el autor atribuye a cuantizaciones genéricas de 2 bits.
- Atención al cliente multilingüe: con soporte de 13 idiomas y contexto largo, el modelo puede gestionar conversaciones multi-turno en las que se arrastre historial y documentación de referencia durante toda la sesión.
- Procesamiento documental con OCR: combinando el proyector multimodal `mmproj` en `Q8_0` cargado en VRAM con los pesos principales en RAM, es posible extraer texto de imágenes o PDFs escaneados sin disponer de una GPU de gran capacidad.
- Despliegue en hardware de gama alta de consumo: con `-ngl 99` el modelo cabe íntegramente en una RTX 3090, 4090 o 5090, ofreciendo una alternativa local a APIs propietarias para tareas de razonamiento general.
- Inferencia con streaming desde RAM: en servidores sin GPU suficiente, el modelo puede servirse total o parcialmente desde DDR4/DDR5 a velocidades declaradas de 20 a 45 tok/s, adecuado para cargas de trabajo por lotes o internas con requisitos de latencia no estrictos.
- Traducción y localización: la cobertura de 13 idiomas permite usar el modelo como motor de traducción interna entre pares como español-inglés, chino-inglés o japonés-inglés, con contexto suficiente para mantener coherencia terminológica en documentos largos.
- Investigación sobre cuantización: el repositorio documenta la evolución completa de las recetas MiniPlus (comparativa Generic APEX Mini vs. MiniPlus V2.1), lo que lo convierte en material de referencia para estudiar el impacto del tratamiento tensor a tensor en modelos MoE.

## Benchmarks y rendimiento

La única métrica empírica publicada en la información disponible es la perplejidad medida sobre WikiText-2 para el GGUF final:

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2 | 5,3693 ± 0,12528 |
| Tamano de pesos | 15,23 GB (14,18 GiB) |
| Referencia Q3_K_M | 16,6 GB |
| Throughput en RAM del sistema | 20-45 tok/s (segun CPU y configuracion DDR4/DDR5) |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval, GSM8K o similares en la información disponible. Tampoco se han obtenido resultados relevantes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia completa: aproximadamente 15,23 GB solo de pesos, más el espacio de caché KV; con contexto de 256K el consumo total puede superar los 24 GB.
- GPU recomendadas para offload completo (`-ngl 99`): RTX 3090, RTX 4090 y RTX 5090 (24 GB o más de VRAM), según indica el autor.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 24 GB o superiores. En GPUs con menos VRAM es viable el offload parcial con el resto del modelo en RAM.
- Inferencia en RAM del sistema: soporte completo o parcial, con velocidades declaradas de 20 a 45 tok/s en función de la CPU y del ancho de banda de memoria (DDR4 de doble canal vs. DDR5 a 6000+ MT/s).
- El autor afirma que el uso de `Q3_K` lineal SIMD en los expertos de borde elimina los bloqueos de dequantización en CPU con AVX2.
- Opciones de despliegue: llama.cpp de forma nativa (formato GGUF, etiqueta `llama.cpp`). El proyector multimodal `mmproj` en `Q8_0` puede cargarse en VRAM de forma independiente.
- Otros runners (vLLM, TGI, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no se publican cifras de latencia por token más allá del rango de 20-45 tok/s en modo RAM.

## Comparativa con modelos similares

La información disponible permite comparar únicamente con otras variantes del mismo modelo base y con la referencia genérica de la comunidad:

| Variante | Expertos centrales | Expertos de borde | Experto compartido | Routers | Cabeza de salida | Tamano | Observaciones |
|---|---|---|---|---|---|---|---|
| Generic APEX Mini | `IQ2_S` (2,50 bpw) | `Q3_K` (5 capas) | `Q4_K` / `Q3_K` | Comprimidos | `Q3_K_M` | ~12,5 GB | Errores de sintaxis, indentación rota y perplejidad elevada en `<think>` según el autor |
| APEX-I-MiniPlus V2.1 | `IQ3_XXS` | `Q3_K` (10 capas) | `Q5_K` (40 capas) | `F32` | `Q6_K` | 15,23 GB | Compilación "definitiva" según el autor, con perplejidad WikiText-2 de 5,3693 |
| Referencia Q3_K_M | Cuantización uniforme | Cuantización uniforme | Cuantización uniforme | Comprimidos | Comprimido | 16,6 GB | Referencia de comparación de tamaño citada por el autor |
| Qwen/Qwen3.6-35B-A3B (base) | Pesos originales | Pesos originales | Pesos originales | Originales | Originales | No disponible | Modelo base sin cuantizar del que deriva esta ficha |

No se dispone de comparaciones con otros modelos MoE de tamaño similar (por ejemplo, alternativas de 30B-35B de otros fabricantes) en la información proporcionada.

## Limitaciones y advertencias

- Se trata de una cuantización, no de un modelo entrenado desde cero: la pérdida de precisión respecto al modelo base original es inevitable, aunque el autor afirme que se sitúa en el rango de fidelidad Q5_K/Q6_K.
- La única métrica objetiva publicada es la perplejidad en WikiText-2; no hay evaluación en tareas de razonamiento, código o matemáticas que respalde las afirmaciones cualitativas del autor.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; no se han publicado evaluaciones de veracidad ni de tasas de alucinación para esta cuantización.
- El autor advierte explícitamente de la confusión entre builds "MiniPlus" artesanales y releases "Mini" genéricos de la comunidad, que según él degradan gravemente la calidad. Es recomendable verificar la procedencia del archivo antes de desplegarlo.
- El rendimiento en RAM del sistema depende fuertemente del ancho de banda de memoria; en configuraciones DDR4 de gama baja el rango de 20-45 tok/s podría no alcanzarse.
- Las cifras de contexto de 256K son declaradas por el autor; el consumo real de memoria de la caché KV a esa longitud puede hacer inviable el contexto completo en configuraciones de 24 GB.
- El repositorio registra 0 descargas y 1 "like" en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales atribuibles a la cuantización, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B por separado.
- Las afirmaciones sobre eliminación de bloqueos AVX2 y equivalencia con VRAM son del propio autor y no están verificadas de forma independiente.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: las fuentes encontradas eran foros en chino sin relación con el tema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Colección APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
