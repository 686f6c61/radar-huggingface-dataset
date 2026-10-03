# PixilabAI/Blink-v0.3-26B-A4B-FP8

## Resumen

Blink v0.3 es un modelo de decisión calibrado desarrollado por PixilabAI en colaboración con NeminiAI. No es un modelo generativo de propósito general: recibe un estado, una pregunta y una lista de opciones, y devuelve una probabilidad para cada opción en un único paso hacia delante y generando un solo token. Su función es sustituir las llamadas del tipo "preguntar a un LLM grande y parsear su prosa" en tareas de enrutamiento, moderación, etiquetado, gating, deduplicación y comprobaciones sí/no.

Se trata de un derivado afinado de google/gemma-4-26B-A4B-it, un transformer de arquitectura MoE con 25.805.936.206 parámetros totales y 4B parámetros activos (A4B). Esta versión concreta está cuantizada en FP8 mediante compressed-tensors, ocupa 27,2 GB en disco y está pensada para GPUs Hopper y Ada (H100, H200, L40S); existe una compilación NVFP4 separada (17,5 GB) para Blackwell.

Su relevancia actual radica en dos factores. Primero, su calibración: a la temperatura recomendada (1,3) la confianza del modelo coincide con su precisión (0,739 frente a 0,735, con un error de calibración de 0,016 sobre 216.942 decisiones evaluadas). Segundo, su rendimiento en el índice Decision Index 0.2.1, donde alcanza 57,48 puntos, segundo puesto entre las entradas públicas y a la altura del mejor modelo de pesos abiertos del tablero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), derivado de google/gemma-4-26B-A4B-it |
| Parametros totales | 25.805.936.206 (25,8 mil millones) |
| Parametros activos | 4B (A4B) |
| Longitud de contexto | 32.768 tokens en la configuracion de despliegue de ejemplo (vLLM, `--max-model-len 32768`); valor nativo no disponible |
| Tipos de cuantizacion | FP8 (weights y activaciones, formato compressed-tensors); existe build NVFP4 separada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, compressed-tensors) |

## Arquitectura y entrenamiento

Blink v0.3 parte de google/gemma-4-26B-A4B-it, un modelo MoE de 26B parámetros totales con 4B activos por token. Sobre esa base, PixilabAI ha realizado un ajuste orientado a la toma de decisiones tipada ("typed decisions"): el modelo emite una distribución de probabilidad sobre letras de opción en lugar de texto libre. La model card lo clasifica como "system-one", en referencia a decisiones rápidas e intuitivas de un solo paso, con el pensamiento (thinking) desactivado por diseño.

El entrenamiento produjo un modelo calibrado de fábrica: no requiere temperaturas ajustadas a mano ni post-procesado para que las probabilidades sean interpretables. La model card reporta que, a la temperatura recomendada de 1,3, la precisión media es 0,735 y la confianza media 0,739, con un error de calibración de 0,016 calculado sobre 216.942 decisiones puntuadas. Esta versión FP8 fue validada contra los pesos sin cuantizar en 16 decisiones, con la misma respuesta en las 16 y una diferencia máxima de probabilidad de 0,065.

El modelo habla el protocolo "surogate decisions v1": una pregunta por prompt, sin razonamiento explícito, y la respuesta es el softmax sobre las letras de las opciones en la primera posición generada. El número de opciones soportadas por prompt llega a 26 (una letra cada una); para más de 26 opciones se emplea un esquema de dos letras, cuyo detalle aparece truncado en la información disponible.

## Capacidades

- Decisiones de clasificación con probabilidades calibradas: enrutamiento, moderación, etiquetado, gating, deduplicación y comprobaciones booleanas.
- Decisiones tipadas: salida como distribución de probabilidad sobre una lista cerrada de opciones, no como texto libre.
- Selección de herramientas (tool selection): puntuación de 94,6 en BFCL tool selection según la model card.
- Recuperación aumentada con verificación de fidelidad: RAGTruth con 59,1 puntos.
- Razonamiento sobre contratos y cláusulas: ContractNLI con 66,7 puntos.
- Detección de sarcasmo e ironía: iSarcasmEval con 58,9 puntos.
- Previsión de eventos: ForecastBench con 28,0 puntos.
- Reconocimiento de entidades financieras: FinEntity con 86,2 puntos.
- Respuesta a preguntas sí/no: convención documentada de colocar la opción "no" primero (A) y "yes" después (B), con los criterios por defecto `No` / `Yes` cuando no se aportan descripciones.
- Capacidades multimodales: la etiqueta de HuggingFace incluye `image-text-to-text`, pero la model card no documenta funciones de visión; no disponible como capacidad confirmada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card; el modelo está diseñado explícitamente para decisiones de un solo paso.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un mensaje entrante y una lista de equipos (facturación, soporte técnico, ventas, otros), el modelo devuelve la probabilidad de cada destino en un solo token generado, lo que permite umbrales de confianza y derivación a revisión humana cuando la distribución es ambigua.
- Moderación de contenido: clasificación de textos contra políticas tipadas con probabilidad calibrada, lo que permite fijar umbrales de decisión coherentes con la tasa de falsos positivos aceptable, en lugar de depender de la interpretación de una respuesta en prosa.
- Verificación de fundamentación en pipelines RAG: RAGTruth con 59,1 puntos permite comprobar si una respuesta generada está respaldada por el contexto recuperado antes de mostrarla al usuario.
- Selección de herramientas en agentes: con 94,6 en BFCL tool selection, el modelo puede actuar como enrutador entre funciones o APIs disponibles, sustituyendo llamadas más caras a un LLM generalista.
- Clasificación de contratos y cláusulas: ContractNLI con 66,7 puntos lo hace adecuado para etiquetar si un documento implica o no una condición contractual concreta dentro de un flujo de revisión legal automatizada.
- Etiquetado y deduplicación de registros: comparación de pares de elementos frente a criterios tipados, útil para consolidar catálogos, bases de datos de clientes o conjuntos de documentos duplicados.
- Detección de sarcasmo y tono en análisis de opinión: iSarcasmEval con 58,9 puntos permite marcar reseñas o comentarios irónicos antes de que entren en un agregador de sentimiento.
- Análisis de entidades financieras: FinEntity con 86,2 puntos lo sitúa como extractor de entidades en textos económicos dentro de un pipeline de monitorización de noticias.
- Previsión estructurada de eventos: ForecastBench con 28,0 puntos permite puntuar escenarios binarios o de opción múltiple en flujos analíticos donde la calibración importa más que la prosa.

## Benchmarks y rendimiento

Decision Index 0.2.1 (habilidad corregida por azar, multiplicada por 100). Los números de Blink v0.3 se midieron sobre la compilación NVFP4; la model card indica que esta compilación FP8 se verificó contra los pesos sin cuantizar en 16 decisiones.

| Modelo | Index | Knowledge | Language | Retrieval | Tools | Arts |
|---|---|---|---|---|---|---|
| Jev (hosted) | 57,91 | 51,4 | 62,0 | 55,4 | 75,1 | 37,7 |
| Blink v0.3 · 26B-A4B NVFP4 | 57,48 | 42,8 | 64,3 | 63,0 | 70,0 | 43,8 |
| Surogate Rune 26B-A4B v3 | 57,44 | 43,4 | 63,1 | 63,5 | 71,2 | 41,9 |
| Decider chat · Gemma-4-31B | 57,33 | 44,3 | 60,4 | 63,1 | 75,6 | 38,3 |
| AutoJev-27B | 56,40 | 40,9 | 63,5 | 54,9 | 79,4 | 39,4 |
| Blink v0.2 · 26B-A4B NVFP4 | 55,97 | 42,3 | 60,4 | 63,0 | 69,3 | 41,4 |
| simple-jev · Qwen3.8-27B | 55,74 | 36,6 | 62,1 | 63,3 | 76,2 | 36,5 |
| Blink v0.1 · 26B-A4B NVFP4 | 54,90 | 40,9 | 60,0 | 62,5 | 66,3 | 42,0 |
| frontier-infra Jebadiah 27B | 54,67 | 38,8 | 60,7 | 53,9 | 78,1 | 38,7 |
| Eikos-27B-FP8 | 53,13 | 39,9 | 54,3 | 55,9 | 74,4 | 39,8 |
| reflex Qwen3.8-27B-FP8 | 52,16 | 35,1 | 54,2 | 57,8 | 74,1 | 39,7 |
| Decider chat · Qwen3.6-27B | 51,35 | 37,0 | 57,1 | 52,2 | 71,4 | 35,1 |
| Decider 35B-A3B NVFP4 | 47,11 | 31,8 | 55,5 | 54,7 | 56,5 | 32,6 |

Progresión de Blink v0.3 frente a Blink v0.2 en tareas concretas: iSarcasmEval 58,9 frente a 41,8; RAGTruth 59,1 frente a 48,3; ForecastBench 28,0 frente a 17,4; FinEntity 86,2 frente a 80,2; ContractNLI 66,7 frente a 61,1; CRUXEval 58,5 frente a 54,4; ToolRet 60,9 frente a 57,5; Home appliances 48,9 frente a 45,5; BFCL tool selection 94,6 frente a 93,5; Language 64,3 frente a 60,4; Arts 43,8 frente a 41,4.

Datos de calibración: precisión media 0,735 frente a confianza media 0,739, con error de calibración de 0,016 sobre 216.942 decisiones puntuadas.

## Requisitos de hardware

- VRAM estimada para inferencia: 27,2 GB de pesos en disco para la compilación FP8, más la sobrecarga de caché KV. En la práctica se recomienda partir de 32-40 GB de VRAM disponible para contexto amplio.
- GPUs recomendadas por el autor: clase Hopper (H100, H200) y Ada (L40S) para la compilación FP8.
- Blackwell: el autor recomienda la compilación NVFP4, de 17,5 GB, descrita como más pequeña y más rápida.
- GPU de consumo: no disponible. Con 27,2 GB de pesos FP8, no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) sin recurrir a reparto en memoria del sistema o a otras cuantizaciones no publicadas.
- Opciones de despliegue: vLLM, con el comando documentado `vllm serve PixilabAI/Blink-v0.3-26B-A4B-FP8 --served-model-name blink --max-model-len 32768 --enable-prefix-caching --chat-template-content-format string`. Compatible con endpoints (`endpoints_compatible`). Otras opciones (llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles de forma explícita. La arquitectura MoE con 4B parámetros activos y la generación de un único token por decisión implican un coste de decodificación muy bajo en comparación con un LLM denso de tamaño equivalente, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Index 0.2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blink v0.3 · 26B-A4B (FP8 / NVFP4) | 25,8B | 4B | 57,48 | Apache 2.0 | Pesos abiertos en HuggingFace (FP8 y NVFP4) |
| Surogate Rune 26B-A4B v3 | 26B | 4B | 57,44 | No disponible | No disponible |
| Decider chat · Gemma-4-31B | 31B | No disponible | 57,33 | No disponible | No disponible |
| Blink v0.2 · 26B-A4B | 25,8B | 4B | 55,97 | No disponible | Pesos NVFP4, version anterior |

Diferencias destacables frente a alternativas: Blink v0.3 lidera en Language (64,3) y Arts (43,8) entre los modelos abiertos comparados, mientras que Jev (hosted) y AutoJev-27B superan a Blink en Tools (75,1 y 79,4 frente a 70,0) y Decider chat · Gemma-4-31B lo supera ligeramente en Knowledge (44,3 frente a 42,8).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: el modelo está diseñado para elegir entre opciones cerradas, no para generar texto libre, lo que limita estructuralmente el riesgo de invención; sin embargo, la calidad de la decisión depende de la formulación de la pregunta y de las opciones proporcionadas.
- Limitación de idioma: solo se declara inglés (en). No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto limitado: la configuración de despliegue documentada usa 32.768 tokens; no se especifica la ventana nativa del modelo base.
- Restricción de protocolo: el modelo espera el protocolo "surogate decisions v1" (una pregunta por prompt, thinking desactivado, softmax sobre letras de opción en la primera posición generada). Usarlo fuera de ese protocolo o con prompts conversacionales genéricos puede degradar la calidad de las probabilidades.
- Límite de opciones: hasta 26 opciones por prompt en el esquema de una letra; por encima se requiere el esquema de dos letras, cuyo detalle no está recogido en la información disponible.
- Dependencia del sistema: los bucles, la memoria multi-turno y la gestión de agentes deben implementarse en la capa de orquestación; el modelo no mantiene estado por sí mismo.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-26B-A4B-it, sujetas a los términos de Google.
- Estado del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, y versión v0.3 con fecha de creación y actualización del 2 de octubre de 2026. Modelo muy reciente y con poca validación externa independiente.
- Los resultados de benchmarks proceden en su mayoría del propio autor, medidos sobre la compilación NVFP4 y no sobre esta compilación FP8, salvo la verificación de 16 decisiones mencionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PixilabAI/Blink-v0.3-26B-A4B-FP8
- Compilación NVFP4 para Blackwell: https://huggingface.co/PixilabAI/Blink-v0.3-26B-A4B-NVFP4
- Demo interactiva: https://huggingface.co/spaces/PixilabAI/Blink
- Sitio del autor: https://pixilab.ai/?utm_source=hf
- Colaborador: https://nemini.ai/?utm_source=hf
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
