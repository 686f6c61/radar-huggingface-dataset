# jaeyong2/clef-flash-jev-claude-distill

## Resumen

`jaeyong2/clef-flash-jev-claude-distill` es un ajuste fino de `Cloudflare/clef-flash`, un modelo de decisión compuesto por un decodificador de texto Qwen3.5-9B y una cabeza *joint-schema* de 122 M de parámetros, lo que da un total de 9.409.813.744 parámetros. El autor, `jaeyong2`, lo ha destilado a partir del profesor de 27B `Cloudflare/clef` y de etiquetas generadas por Claude Opus 5.5 sobre datos sintéticos de decisión, manteniendo un anclaje KL respecto al modelo base para preservar conocimiento general.

El modelo no está pensado para generación de texto libre, sino para emitir decisiones tipadas: recibe un estado y un conjunto de preguntas con esquema (por ejemplo, elección entre `approve`/`block` con criterios explícitos) y devuelve distribuciones de probabilidad calibradas sobre las opciones. Su interés actual reside en que, según la model card, supera tanto a su modelo base como a TypeSafe Jev 1.13 en el conjunto público Decision Index 0.3 (32 de 37 benchmarks, 123.049 filas) con una precisión del 0,727 en el test oficial de Jev y un KL de 0,171 frente a 1,442 del citado Jev 1.13.

La licencia es Apache-2.0 y los pesos se distribuyen en safetensors (backbone bf16 fusionado más cabeza fp32), acompañados de un cargador propio (`joint_schema_model.py`). El modelo solo declara inglés, coreano, japonés y chino, no incluye pipeline estándar en HuggingFace y su adopción es aún muy reducida (26 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de texto transformer Qwen3.5-9B + cabeza *joint-schema* de decisión (122 M de parámetros) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento trunca los estados a 6.000 tokens) |
| Tipos de cuantización | No disponible; la release oficial es bf16 en el backbone y fp32 en la cabeza |
| Idiomas soportados | Inglés, coreano, japonés y chino (en, ko, ja, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors: backbone bf16 fusionado en 4 shards (`model-0000*-of-00004.safetensors`) + `joint_head.safetensors` en fp32; adaptador PEFT sin fusionar (r = 32) en `adapter/` y `adapter_head/`; requiere `joint_schema_model.py` |

## Arquitectura y entrenamiento

La arquitectura combina un decodificador transformer Qwen3.5-9B con una cabeza específica de 122 M de parámetros que implementa un esquema conjunto (*joint schema*): el modelo procesa un estado y una batería de preguntas tipadas y produce, para cada pregunta, una distribución sobre las opciones definidas en el esquema. El ajuste se aplicó como LoRA con r = 32, α = 128 y dropout 0,05 sobre todas las capas `Linear` del decodificador, manteniendo la cabeza en fp32 y entrenando durante una sola época (2–3 épocas redujeron las puntuaciones de conocimiento y herramientas en la ablación del autor), con 18 estados por paso de optimizador, lr 1e-4 (5e-5 en la cabeza), estados truncados a 6.000 tokens, barajado del orden de preguntas y subconjuntos aleatorios de preguntas.

Los datos proceden del dataset `jaeyong2/jev-decision-claude-distill`: 37.932 estados de decisión sintéticos y 150.827 preguntas tipadas en en/ko/ja/zh, cubriendo 35 dominios de flujo de trabajo, 12 familias de formato, 6 familias de habilidad general y 9 familias de juicio lingüístico (sarcasmo, postura, sentimiento por aspecto, NLI con predominio de neutros, NLI de ensayos clínicos, intenciones fuera de alcance, comandos de electrodomésticos, emparejamiento de pies de foto y ranking de evidencia). Los objetivos combinan la distribución del profesor de 27B cuando coincide con la etiqueta del autor y, en caso contrario, `0,7·onehot(etiqueta) + 0,3·p_27B`; los ítems disputados usan probabilidades verbalizadas de Claude Opus 5.5 y los no respondibles conservan la distribución del profesor de 27B. La pérdida es entropía cruzada suave más Brier contra el objetivo, con un término adicional de 0,3 · KL(modelo ‖ clef-flash) como anclaje. El entrenamiento se ejecutó en 4 × RTX 3090 (2 GPU por réplica, DDP) durante 16,7 horas. No se usó texto de benchmarks para el entrenamiento.

## Capacidades

- Emisión de decisiones tipadas sobre esquemas definidos por el usuario, con distribución de probabilidad por opción en lugar de texto libre.
- Calibración de incertidumbre: en el test oficial `typed-decisions` obtiene KL 0,171, Brier 0,092 y ECE 0,059.
- Razonamiento y conocimiento general preservados vía anclaje KL: MMLU-Pro +1,0, BBH +0,9 y GPQA sin variación respecto al modelo base.
- Aritmética y razonamiento matemático básico: GSM8K mejora 3,3 puntos sobre el modelo base.
- *Tool calling* / function calling: 77,9 en la categoría `tools` del Decision Index, con mejora de 3,8 en When2Call y ligero descenso de 1,6 en API-Bank.
- Recuperación y *grounding* en RAG: 59,7 en `retrieval`, con RAGTruth pasando de 35,6 a 72,8.
- Clasificación de intenciones con detección fuera de dominio: CLINC150+OOS de 67,0 a 95,2 y BANKING77 +3,0.
- Juicio lingüístico multilingüe (en/ko/ja/zh): sarcasmo (iSarcasmEval 19,7 → 50,5), postura, sentimiento por aspecto, NLI y ranking de evidencia.
- No se declara soporte de visión, audio, *thinking mode* explícito ni modo agente multi-paso autónomo.

## Casos de uso

- Moderación y políticas de contenido: el modelo recibe el estado de una conversación y un esquema con criterios `approve`/`block`, devolviendo una probabilidad calibrada por opción; su ECE de 0,059 permite fijar umbrales de revisión humana con significado estadístico.
- Enrutado de intenciones en asistentes conversacionales: con CLINC150+OOS en 95,2, es adecuado para clasificar consultas de usuario y detectar consultas fuera de alcance antes de derivarlas a un LLM generativo.
- Verificación de *grounding* en pipelines RAG: la mejora en RAGTruth (35,6 → 72,8) lo hace utilizable como juez de fidelidad entre la respuesta generada y el contexto recuperado, emitiendo una decisión tipada por afirmación.
- Selección de herramientas en agentes: con 77,9 en `tools` y +3,8 en When2Call, puede decidir si una consulta requiere llamada a función y cuál, antes de la ejecución.
- Análisis de opinión y postura en redes sociales en inglés, coreano, japonés y chino: clasificación por aspecto y detección de sarcasmo con distribución de probabilidad, útil para paneles de reputación de marca.
- Triaje de admisibilidad en ensayos clínicos: la familia de NLI de ensayos clínicos del dataset de entrenamiento permite decidir si un paciente cumple criterios de inclusión a partir de texto libre, con salida probabilística auditable.
- Anotación asistida con incertidumbre: al devolver KL y distribuciones en lugar de etiquetas duras, sirve para priorizar qué ítems revisar manualmente en un proceso de etiquetado.

## Benchmarks y rendimiento

Decision Index 0.3, suite pública (32 de 37 benchmarks, 123.049 filas, reproducción local del autor con backbone bf16 y cabeza fp32):

| Métrica | Clef-flash (base) | Este modelo | TypeSafe Jev 1.13 |
|---|---|---|---|
| Decision Index (habilidad balanceada) | 52,55 | 54,96 | No disponible |
| Índice bruto | 60,40 | 62,67 | No disponible |
| Índice proxy de 32 benchmarks (ponderado por área) | 57,14 | 59,33 | 57,98 |
| knowledge | 58,4 | 58,9 | 57,5 |
| language | 46,3 | 55,9 | 58,4 |
| retrieval | 56,8 | 59,7 | 55,6 |
| tools | 80,8 | 77,9 | 73,8 |
| arts | 39,3 | 34,6 | 33,9 |

Test oficial `typed-decisions` de Jev (2.000 casos):

| Modelo | Accuracy | KL | Brier | ECE |
|---|---|---|---|---|
| Clef-flash | 0,7025 | 0,210 | 0,111 | 0,017 |
| Este modelo | 0,727 | 0,171 | 0,092 | 0,059 |
| TypeSafe Jev 1.13 | 0,727 | 1,442 | 0,148 | 0,144 |

Contraste por filas emparejadas (McNemar) frente a Clef-flash: +2.227 filas netas, p ≈ 1e-138. Ganancias por benchmark: RAGTruth 35,6 → 72,8; iSarcasmEval 19,7 → 50,5; CLINC150+OOS 67,0 → 95,2; When2Call +3,8; ANLI +3,3; GSM8K +3,3; BANKING77 +3,0; MMLU-Pro +1,0; BBH +0,9; GPQA ±0. Regresiones declaradas: simulador de electrodomésticos −17,0 (88 casos), emparejamiento de pies de foto de *The New Yorker* −9,1, PhishNChips −7,8, Habermas −2,5 y API-Bank −1,6. No se han publicado resultados de MMLU, HumanEval ni de la mayoría de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB para los 9.409.813.744 parámetros del backbone más unos 0,49 GB de la cabeza en fp32, es decir, en torno a 19,5 GB de pesos; con overhead de activaciones y caché KV conviene reservar 22–24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 sin compromisos; una RTX 4090 (24 GB) es suficiente para bf16 en una sola GPU con lotes pequeños.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización, que no está publicada oficialmente.
- El autor entrenó con 4 × RTX 3090 (24 GB) usando LoRA, lo que confirma que el ajuste cabe en hardware de consumo.
- Opciones de despliegue: no hay soporte estándar de vLLM, TGI, llama.cpp u Ollama; la única vía documentada es el cargador incluido `joint_schema_model.py` con `jsm.load_release_model(".", device="cuda")` y la función `jsm.systemone(...)`.
- No se dispone de pesos GGUF ni de cuantizaciones GPTQ/AWQ publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index (proxy 32 benchmarks) | `typed-decisions` (acc / KL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | 9,41 B | No disponible | 59,33 | 0,727 / 0,171 | Apache-2.0 | HuggingFace, cargador propio |
| Cloudflare/clef-flash (base) | ~9,4 B (Qwen3.5-9B + cabeza de 122 M) | No disponible | 57,14 | 0,7025 / 0,210 | Apache-2.0 | HuggingFace |
| Cloudflare/clef (profesor) | 27 B | No disponible | No disponible | No disponible | Apache-2.0 | HuggingFace |
| TypeSafe Jev 1.13 | No disponible | No disponible | 57,98 | 0,727 / 1,442 | No disponible | Ejecución en el board público |

Frente a su modelo base, la mejora es consistente en lenguaje (+9,6), recuperación (+2,9) y en el índice global (+2,19 en habilidad balanceada), a costa de `tools` (−2,9) y `arts` (−4,7). Frente a Jev 1.13 iguala en accuracy sobre el test de Jev con una distribución mucho mejor calibrada (KL 0,171 frente a 1,442), pero pierde en la categoría de lenguaje (55,9 frente a 58,4).

## Limitaciones y advertencias

- Calibración peor que el modelo base en el test de Jev: ECE 0,059 frente a 0,017, pese a mejorar KL y Brier. Para umbrales de decisión sensibles conviene recalibrar.
- Regresiones documentadas en dominios concretos: simulador de electrodomésticos (−17,0 sobre 88 casos), emparejamiento de pies de foto de *The New Yorker* (−9,1), PhishNChips (−7,8), Habermas (−2,5) y API-Bank (−1,6), además de un descenso de 4,7 puntos en `arts`.
- Evaluación parcial: solo 32 de los 37 benchmarks del suite público; los cinco no accesibles (BPoMP, Humicroedit, cfcolor, HLE, HoVer) cuentan como cero, lo que rebaja el índice absoluto frente al 56,15 del board.
- Idiomas: únicamente inglés, coreano, japonés y chino. No se declara ni evalúa español, por lo que su uso en castellano no está respaldado por datos.
- Cobertura de contexto: los estados se truncan a 6.000 tokens durante el entrenamiento y no se publica la longitud de contexto oficial; estados más largos pueden degradar la calidad de forma no medida.
- Naturaleza del modelo: está diseñado para emitir decisiones tipadas, no para generación de texto libre; usarlo como LLM conversacional general no es su caso de uso previsto.
- Integración: no hay pipeline declarado ni soporte en frameworks estándar (transformers, vLLM, llama.cpp, Ollama); depende de un script Python propio y de ejecutar la cabeza en fp32.
- Datos sintéticos y destilación: las etiquetas provienen de un profesor de 27B y de probabilidades verbalizadas de Claude Opus 5.5; el autor declara que todos los datos son sintéticos y comercialmente usables bajo Apache-2.0, pero no se aporta auditoría independiente de sesgos.
- Adopción muy baja (26 descargas, 0 likes) y ausencia de validación por terceros: los números proceden de la reproducción local del propio autor.
- Riesgo de alucinación en las justificaciones verbales: aunque la salida sea probabilística, no se documenta una evaluación específica de fidelidad del razonamiento expuesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaeyong2/clef-flash-jev-claude-distill
- Dataset de entrenamiento: https://huggingface.co/datasets/jaeyong2/jev-decision-claude-distill
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Modelo profesor (27B): https://huggingface.co/Cloudflare/clef
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes; los resultados devueltos por el buscador no guardan relación con el modelo y se han descartado.
