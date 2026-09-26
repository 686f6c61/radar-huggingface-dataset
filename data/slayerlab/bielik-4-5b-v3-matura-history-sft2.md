# SlayerLab/bielik-4.5b-v3-matura-history-sft2

## Resumen

Bielik-4.5B-v3-matura-history-sft2 es un ajuste fino supervisado (SFT) de parámetros completos sobre `speakleash/Bielik-4.5B-v3.0-Instruct`, desarrollado por SlayerLab para responder tareas y redactar ensayos en el formato de la prueba de historia de nivel extendido de la matura polaca (CKE). El modelo tiene 4.757.260.288 parámetros (~4,76 mil millones) y una longitud de contexto de 32.768 tokens, aunque las ejecuciones evaluadas por el equipo usaron 8.192 tokens. Su propósito es acotado y explícito: ser el fichero de modelo más pequeño que supera el 35% en el evaluador interno de historia-matura del equipo, bajo el nombre de pista "Mały, ale wariat" del hackathon organizado por SlayerLab.

El modelo se entrenó con 4.144 filas de datos sintéticos y ensayos redactados, exactamente la misma receta que su hermano menor de 1,5B (`SlayerLab/bielik-1.5b-v3-matura-history-sft2`). La relevancia técnica del repositorio no está en el modelo base, sino en el paquete completo que lo acompaña: safetensors en bf16, cuantizaciones GGUF generadas con matriz de importancia (imatrix) en polaco, los registros de entrenamiento y el harness de evaluación. Esto lo convierte en un caso de estudio reproducible sobre cuánto rendimiento en un dominio educativo concreto se puede extraer de un SFT de 4.144 ejemplos sobre un modelo denso de menos de 5B parámetros.

El candidato registrado por el autor es `sft45-IQ3_XXS.gguf`, de 1.851.896.576 bytes (1,85 GB), que pasa tanto el evaluador interno (harness v5) como un examen CKE inédito de mayo de 2026. La relevancia práctica es la viabilidad de desplegar un tutor especializado en un idioma distinto del inglés con menos de 2 GB de pesos, sobre CPU o GPU de gama baja, con licencia Apache 2.0. Se publicó el 26 de septiembre de 2026 y, en el momento de redactar esta ficha, registra 0 descargas y 0 "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Llama (etiqueta `llama` en el repo); detalles de capas y atención del modelo base: no disponible |
| Parametros totales | 4.757.260.288 (~4,76B) |
| Longitud de contexto | 32.768 tokens (las ejecuciones evaluadas usaron 8.192) |
| Tipos de cuantizacion | bf16 (safetensors y GGUF), IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 2 shards), GGUF (llama.cpp), transformers |
| Modelo base | speakleash/Bielik-4.5B-v3.0-Instruct |
| Tipo de ajuste | SFT de parametros completos (full-parameter) |
| Plantilla de chat | Bielik ChatML (`<s><|im_start|>role\n...<|im_end|>`), sin modo thinking |
| Tamano del repo | 27,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Bielik 4.5B v3.0 Instruct de SpeakLeash, un transformer decoder-only de tipo Llama según la etiqueta del repositorio. Sobre esa base, SlayerLab aplicó un ajuste fino supervisado de parámetros completos (no LoRA ni adaptadores) con 4.144 filas de entrenamiento: tareas sintéticas y ensayos modelo en el formato del examen de historia de nivel extendido de la matura polaca. El prompt de sistema usado en entrenamiento instruye al modelo a responder en polaco, de forma concisa, priorizando las fuentes incluidas en el enunciado por encima de los materiales auxiliares, y a entregar exactamente el número de elementos solicitados. La misma receta y el mismo conjunto de datos se aplicaron al hermano de 1,5B, lo que permite una comparación directa por tamaño.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Sí se explicita que no hay modo thinking en la plantilla de chat. La innovación metodológica destacable está en el pipeline de cuantización: las GGUF se generaron con llama.cpp build 11146 (commit `7fe450e19`) usando una matriz de importancia en polaco construida con conversaciones del SFT y pasajes de plwiki (`calib-v1.txt`, `train/make_calib.py`), y el autor publica la imatrix junto a los pesos. El proceso de evaluación combina un scorer determinista de respuestas cerradas con un juez LLM (`google/gemini-3.1-flash-lite`), recuperación BM25 sobre plwiki de 2 × 700 caracteres solo para tareas de 600 caracteres o menos y para ensayos, normalización estricta de respuestas cerradas, recorte de repeticiones, muestreo DRY y un mínimo de 380 palabras para los ensayos.

## Capacidades

- Generacion de texto en polaco: respuestas a tareas de historia, tanto de respuesta cerrada como de desarrollo.
- Redaccion de ensayos largos: el harness impone un minimo de 380 palabras para los ensayos, lo que indica que el modelo esta ajustado para producir textos extensos y estructurados.
- Razonamiento sobre fuentes: el prompt de sistema prioriza las fuentes del enunciado sobre los materiales auxiliares, capacidad reforzada durante el SFT.
- Seguimiento de instrucciones con restricciones de formato: se le entrena para entregar el numero exacto de elementos pedidos y responder de forma concisa.
- Uso de contexto largo: ventana de 32.768 tokens, util para concatenar varias fuentes historicas.
- Conversacion multi-turno: pipeline `text-generation` y etiqueta `conversational` con plantilla ChatML.
- Capacidades multilingues: solo polaco declarado; el resto de idiomas no estan soportados oficialmente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio o thinking mode: no soportados (la plantilla de chat se usa con `enable_thinking: false`).

## Casos de uso

- Preparacion de la matura de historia: el modelo puede actuar como examinador simulado, generando preguntas y respuestas modelo en el formato CKE y corrigiendo las respuestas del alumno contra los criterios del examen. La ventana de 32.768 tokens permite incluir varias fuentes documentales junto al enunciado.
- Generacion de ensayos modelo para material didactico: dado un tema de desarrollo, produce un ensayo de mas de 380 palabras con estructura argumental, util para construir bancos de ejemplos para academias y editoriales educativas.
- Evaluacion automatica de respuestas cerradas: integrado detras de un scorer determinista en un pipeline de correccion, puede generar la respuesta canonica para compararla con la del estudiante, aprovechando el ajuste especifico en normalizacion de respuestas.
- Tutor desplegado en local para aulas sin conectividad: con la cuantizacion IQ3_XXS de 1,85 GB se puede servir con `llama-server` u Ollama en un portatil con CPU moderna y 8 GB de RAM, sin enviar datos de menores a terceros.
- Investigacion sobre SFT de dominio en modelos pequenos: el repositorio publica la receta, los logs, la imatrix y los resultados, lo que permite reproducir el experimento y comparar el rendimiento del 4,5B frente al hermano de 1,5B con los mismos datos.
- Generacion de datos sinteticos educativos: puede producir conjuntos de tareas y soluciones en formato examen polaco para alimentar el entrenamiento de modelos mayores o para aumentar la cobertura tematica de un banco de ejercicios.
- Chatbot de consulta historica con recuperacion aumentada: combinado con un indice BM25 sobre Wikipedia en polaco, como en el harness del autor, responde preguntas factuales citando pasajes recuperados.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al evaluador interno del equipo `history-matura-eval`, de dos pistas de 55 puntos cada una (34 items adaptados del examen CKE de mayo de 2023, "past exam", y 34 items basados en Wikipedia). El umbral de aprobado es 20/55 (35%).

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| Past exam (CKE mayo 2023, 55 puntos) | SFT, `sft45-IQ3_XXS.gguf` (1,85 GB) | 22/55 |
| Past exam (CKE mayo 2023, 55 puntos) | Modelo base sin SFT, mismo tamano de 3 bits | 18/55 (no pasa el umbral) |
| Past exam (CKE mayo 2023, 55 puntos) | `sft45-IQ2_M.gguf` | No supera la pista; sin puntuacion publicada |
| Pista Wikipedia (55 puntos) | `sft45-IQ4_XS.gguf` | Mejores puntuaciones del repositorio; cifra no publicada en la informacion disponible |
| Examen CKE inedito de mayo de 2026 | `sft45-IQ3_XXS.gguf`, con y sin harness | Superado (puntuacion no publicada) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparativas estandarizadas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamano de los ficheros, sin incluir cache KV): ~11-12 GB en bf16 (fichero GGUF bf16 de 9,52 GB), ~3,5-4 GB en IQ4_XS (2,56 GB), ~3 GB en Q3_K_M (2,30 GB), ~2,5-3 GB en IQ3_XXS (1,85 GB) y ~2,3 GB en IQ2_M (1,62 GB).
- Cache KV a 8.192 o 32.768 tokens: no disponible (no se publica la configuracion de capas y cabezas del modelo base).
- GPU recomendadas: cualquier GPU con 12 GB o mas para bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100). Para cuantizaciones de 3-4 bits basta una GPU de 4-6 GB (GTX 1650, RTX 3050, T4, L4).
- Cabe en GPU de consumo: si. En bf16 cabe en RTX 4090 (24 GB) y RTX 3090; en IQ4_XS y menores cabe en practicamente cualquier GPU moderna de 6 GB o mas.
- Despliegue: el autor documenta `llama-server` de llama.cpp con API compatible con OpenAI (puerto 8891, `-ngl 99 --flash-attn on --jinja --chat-template-kwargs '{"enable_thinking":false}'`), descarga directa con `llama-server -hf` y Ollama (`ollama run hf.co/...:IQ3_XXS`). Tambien es cargable con Transformers en bf16. El repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`; el soporte de vLLM no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en evaluador de historia CKE | Disponibilidad |
|---|---|---|---|---|---|---|
| SlayerLab/bielik-4.5b-v3-matura-history-sft2 | 4,76B | 32.768 tokens | pl | Apache 2.0 | 22/55 en past exam con IQ3_XXS | safetensors + 5 cuantizaciones GGUF |
| speakleash/Bielik-4.5B-v3.0-Instruct (base) | ~4,76B | no disponible | pl | no disponible en esta ficha | 18/55 con el mismo tamano de 3 bits | safetensors |
| SlayerLab/bielik-1.5b-v3-matura-history-sft2 | ~1,5B | no disponible | pl | no disponible en esta ficha | no disponible | GGUF |
| Otros modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos generalistas de tamano similar (por ejemplo, familias de 3-4B multilingues) no es posible con los datos disponibles: no hay resultados de benchmarks estandarizados publicados para este modelo, y su objetivo es un examen especifico en polaco que no forma parte de las suites habituales.

## Limitaciones y advertencias

- Modelo monoidioma: solo se declara polaco. No hay garantia de comportamiento correcto en castellano ni en ingles.
- Dominio muy estrecho: esta ajustado para el formato de la matura de historia. Fuera de ese formato y tematica su utilidad es limitada.
- Rendimiento ajustado al umbral: el criterio de exito del autor es superar el 35% (20/55). Un 22/55 implica que mas de la mitad de los items del examen se responden incorrectamente.
- Riesgo de alucinacion en datos historicos: el propio prompt de sistema advierte de que los materiales auxiliares pueden ser erroneos y de que hay que priorizar las fuentes; en tareas factuales sin fuente, la fidelidad no esta garantizada.
- Dependencia del harness: los resultados publicados dependen de un pipeline externo (recuperacion BM25 sobre plwiki de 2 × 700 caracteres, normalizacion estricta, recorte de repeticiones, muestreo DRY, minimo de 380 palabras en ensayos). El indice de recuperacion de 1,7 GB no forma parte del modelo. Fuera de ese harness los resultados no estan medidos.
- Tendencia a la repeticion: el uso de recorte de repeticiones y muestreo DRY en la evaluacion indica que el modelo puede entrar en bucles repetitivos sin esas salvaguardas.
- Degradacion en cuantizaciones agresivas: la variante IQ2_M no supera la pista de examen; no se recomienda bajar de IQ3_XXS para uso educativo.
- Juez LLM externo: parte de la evaluacion depende de `google/gemini-3.1-flash-lite`, lo que introduce variabilidad ajena al modelo.
- Trazabilidad limitada: 0 descargas y 0 "likes" en el momento de la ficha; no hay validacion independiente por parte de terceros.
- Licencia Apache 2.0 en este repositorio: permite uso comercial, pero conviene verificar los terminos del modelo base `speakleash/Bielik-4.5B-v3.0-Instruct`, no detallados en la informacion disponible.
- Sin modo thinking y sin soporte declarado de tool calling ni de agentes: no es adecuado como modelo de proposito general para pipelines agenticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/bielik-4.5b-v3-matura-history-sft2
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- Hermano de 1,5B: https://huggingface.co/SlayerLab/bielik-1.5b-v3-matura-history-sft2
- Repositorio del hackathon (receta de datos, `MODEL_CARD.md`, `RESULTS.md`, `REPORT.md`): https://github.com/slayerlabs/hackathon/tree/main/maly-ale-wariat
- Harness de evaluacion: https://github.com/slayerlabs/hackathon/tree/main/matura-harness

Nota sobre la busqueda web: los resultados devueltos (articulos sobre Uri Geller en Wikipedia, Wikiwand y MagiciansMag) no guardan relacion con este modelo y no aportan informacion utilizable para la ficha.
