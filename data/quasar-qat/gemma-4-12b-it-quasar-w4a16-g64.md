# QUASAR-QAT/gemma-4-12B-it-QUASAR-W4A16-G64

## Resumen

Gemma 4 12B it QUASAR W4A16 G64 es un checkpoint cuantizado a 4 bits del modelo multimodal google/gemma-4-12B-it, publicado por QUASAR-QAT. No es una cuantizacion a posteriori: las codificaciones INT4 provienen directamente del entrenamiento (native QAT), mediante el metodo QUASAR, una tecnica de quantization-aware training sensible a la perdida descrita en arXiv:2608.13966. El resultado se exporta a formatos de despliegue estandar (compressed-tensors W4A16 para vLLM) sin sobrecoste de inferencia.

El modelo conserva la arquitectura multimodal gemma4_unified del original, con 11.959.730.224 parametros (~12B), pipeline any-to-any (texto, vision y audio segun las etiquetas del autor) y una ventana de contexto de 262.144 tokens. El repositorio ocupa 7,9 GB e incluye 328 capas lineales del decodificador cuantizadas a INT4 simetrico con group_size 64, escalas fp16 y el resto de tensores en bf16.

Su relevancia es comparativa: frente al W4A16 QAT oficial de Google, QUASAR reporta una divergencia KL a bf16 de 0,034 frente a 0,044 (23% menor), una tasa de acuerdo top-1 del 95,5% frente al 94,8% y un coste de 4,25 bpw frente a 4,5. Ademas, obtiene estimaciones puntuales superiores en los cuatro benchmarks downstream reportados. Es, por tanto, una alternativa orientada a despliegue en produccion con vLLM donde el ahorro de memoria importa pero no se quiere pagar en calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (gemma4_unified), capas de atencion completa con K/V compartidas (attention_k_eq_v); base google/gemma-4-12B-it |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 INT4 simetrico, group_size 64, escalas fp16, 4,25 bpw; 328 lineales cuantizados, resto en bf16. Repo gemelo en GGUF Q4_0 |
| Idiomas soportados | en; multilingual (etiquetas del autor) |
| Licencia | apache-2.0 segun metadatos; la model card indica que se aplican LICENSE/NOTICE de Gemma 4 (Google DeepMind) |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized); GGUF en el repositorio gemelo |
| Tamano del repositorio | 7,9 GB |
| Modalidades | any-to-any (texto, imagen, audio segun etiquetas); vision requiere el repo GGUF gemelo con su proyector |
| Backend validado | vLLM 0.28.0 y 0.29.0 |

## Arquitectura y entrenamiento

La base es gemma-4-12B-it, un transformer multimodal con capas de atencion completa que comparten claves y valores (attention_k_eq_v) y que se exporta respetando exactamente esa definicion, incluidas las partes de vision y audio. Sobre esa base, QUASAR-QAT aplica QUASAR, un esquema de quantization-aware training sensible a la perdida que mejora la reconstruccion en bajo numero de bits durante el propio entrenamiento y luego exporta a formatos estandar sin overhead en inferencia. El checkpoint se "sana" (healing) contra el profesor bf16 durante aproximadamente 600M tokens: una epoca sobre unos 377.000 prompts auto-destilados de google/gemma-4-12B-it con el modo thinking activado, pesos maestros en fp32 y cuantizacion INT4 con grupo de 64.

El resultado se materializa en 328 capas lineales del decodificador con enteros simetricos de 4 bits, escalas fp16 y group_size 64, empaquetadas con compressed-tensors en modo pack-quantized; el resto de tensores permanece en bf16. El repositorio incluye un export_receipt.json que verifica la exportacion tensor a tensor, y el GGUF gemelo incorpora un script --verify que comprueba que ambos ficheros comparten codigos y escalas. La validacion de calidad se hizo con teacher forcing contra el bf16 sobre 512 prompts de chat reservados, con thinking activado.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento explicito mediante modo thinking (los prompts de destilado se generaron con thinking activado).
- Capacidades multimodales: entrada imagen-texto (VLM), vision y audio segun las etiquetas any-to-any del autor; en este checkpoint, el uso de vision pasa por el GGUF gemelo con su proyector.
- Function calling y tool calling, con etiquetas explicitas de agentic y multi-step reasoning.
- Capacidades multilingues mas alla del ingles (etiqueta multilingual), aunque el autor solo declara en y multilingual sin desglose por idioma.
- Contexto largo para casos de tipo long-context (documentos extensos, historiales largos, repositorios de codigo).
- Inferencia compatible con clientes OpenAI a traves de vLLM.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a los 262.144 tokens de contexto y ejecutar acciones sobre sistemas internos mediante tool calling.
- Agentes de automatizacion de tareas: con soporte de function calling y etiquetas agentic, encaja en bucles de razonamiento multi-paso que consultan APIs y encadenan herramientas.
- Analisis de documentos largos: contratos, informes o expedientes completos pueden procesarse en una sola ventana sin troceado agresivo, reduciendo perdidas de contexto entre fragmentos.
- Asistentes con razonamiento verificable: el modo thinking permite obtener cadenas de razonamiento antes de la respuesta final en tareas de matematicas, logica o diagnostico tecnico.
- Procesamiento de imagenes y documentos escaneados: al ser un VLM, puede extraer informacion de capturas, diagramas o formularios; en este checkpoint conviene desplegar el GGUF gemelo con su proyector para la parte visual.
- Asistencia sobre base de codigo: lectura de repositorios grandes, generacion de parches y explicacion de fragmentos, apoyandose en el contexto largo y en la integracion con herramientas de CI/CD via API compatible con OpenAI.
- Despliegue en infraestructura limitada: los 7,9 GB de pesos permiten servir un modelo de 12B en una unica GPU de gama alta de consumo, algo inviable en bf16 completo.
- Moderacion y clasificacion de contenido en varios idiomas dentro de pipelines que ya usan la API de OpenAI.

## Benchmarks y rendimiento

| Benchmark | QUASAR W4A16-G64 | Google QAT W4A16 (g32) |
|---|---:|---:|
| MMLU | 70,4 | 67,8 |
| IFEval | 87,6 | 87,3 |
| ARC-Challenge | 51,3 | 50,1 |
| AGIEval | 24,2 | 22,6 |
| Media | 58,4 | 57,0 |

Metricas de fidelidad al modelo bf16 (teacher forcing sobre 512 prompts de chat reservados, thinking activado, mismas condiciones para ambos checkpoints):

| Metrica | QUASAR W4A16-G64 | Google QAT W4A16 (g32) |
|---|---:|---:|
| KL a bf16 | 0,034 | 0,044 |
| Acuerdo top-1 | 95,5% | 94,8% |
| bpw cuantizados | 4,25 | 4,5 |

El autor indica que la mejora en MMLU es de +2,6 puntos, con intervalo de confianza al 95% de [+2,0, +3,2] mediante bootstrap emparejado sobre 14.042 preguntas. En la variante GGUF, medida de forma independiente bajo llama.cpp, el KL a bf16 es de 0,048 frente a 0,069 del Q4_0 QAT de Google (30% menor). No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Pesos cuantizados: 7,9 GB en disco (328 lineales INT4 mas el resto en bf16).
- VRAM estimada: los pesos ocupan unos 8 GB; sumando runtime, activaciones y cache KV para contextos moderados, cabe esperar un consumo en el rango de 10-12 GB (estimacion a partir del tamano del repo, no un dato publicado por el autor).
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX 5080/5090 segun generacion) con margen; en tarjetas de 12 GB quedaria muy ajustado y limitado a contextos cortos.
- GPU de datacenter recomendadas: A100, H100 o L40S para servir contexto largo o concurrencia alta.
- Contexto largo: los 262.144 tokens implican una cache KV muy grande; el autor no publica el consumo de memoria por token, por lo que no es posible dar una cifra fiable para el contexto maximo en una GPU concreta.
- Opciones de despliegue: vLLM con `vllm serve QUASAR-QAT/gemma-4-12B-it-QUASAR-W4A16-G64 --dtype float16` (probado en vLLM 0.28.0 y 0.29.0, manteniendo las escalas fp16 exactas); llama.cpp, Ollama y LM Studio a traves del GGUF gemelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | bpw | Formato | Licencia |
|---|---|---|---|---|---|---|
| QUASAR W4A16-G64 (este) | ~12B | 262.144 | 70,4 | 4,25 | safetensors compressed-tensors / GGUF gemelo | apache-2.0 (con LICENSE/NOTICE de Gemma 4) |
| google/gemma-4-12B-it-qat-w4a16-ct | ~12B | 262.144 (misma base) | 67,8 | 4,5 | compressed-tensors | apache-2.0 (con LICENSE/NOTICE de Gemma 4) |
| google/gemma-4-12B-it-qat-q4_0-gguf | ~12B | no disponible en la informacion | no disponible | Q4_0 (no declarado) | GGUF | apache-2.0 (con LICENSE/NOTICE de Gemma 4) |
| google/gemma-4-12B-it (bf16, referencia) | ~12B | 262.144 | no disponible en la informacion | 16 | safetensors bf16 | apache-2.0 (con LICENSE/NOTICE de Gemma 4) |

La comparacion con alternativas de otros fabricantes del mismo rango de tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce degradacion inevitable: el autor reporta un KL de 0,034 frente al bf16, lo que implica que no es identico al modelo original.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de veracidad o tasa de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo ni de toxicidad para este checkpoint.
- Cobertura idiomatica: las etiquetas declaran en y multilingual, pero no se especifica la lista de idiomas ni su calidad relativa; el castellano no esta confirmado explicitamente.
- Restricciones de licencia: los metadatos indican apache-2.0, pero la model card remite a que se aplican el LICENSE y el NOTICE del modelo Gemma 4 de Google DeepMind. Conviene revisar las condiciones reales de uso comercial del modelo base antes de desplegarlo en produccion.
- Vision en este checkpoint: la model card indica que para tareas de vision hay que usar el GGUF gemelo con su proyector, no el checkpoint W4A16.
- Requisito de backend: para vLLM se debe usar `--dtype float16` para preservar las escalas fp16 almacenadas; ignorarlo puede alterar los resultados.
- Contexto: 262.144 tokens es el maximo declarado, pero no se publica el consumo de memoria de la cache KV ni el rendimiento a esa longitud.
- Madurez y adopcion: el repositorio registra 7 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- No se publican datos de latencia, throughput ni comportamiento bajo concurrencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-W4A16-G64
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- QAT oficial de Google comparable: https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- GGUF gemelo de este checkpoint: https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-Q4_0-GGUF
- Q4_0 QAT de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf/blob/main/gemma-4-12b-it-qat-q4_0.gguf
- Gemma 4 E4B con la misma receta (GGUF): https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF
- Gemma 4 E4B con la misma receta (W4A16): https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64
- Coleccion QUASAR 4-bit QAT: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-gemma-4-6aa3561770e6e4001271bf1e
- Organizacion: https://huggingface.co/QUASAR-QAT
- Paper: https://arxiv.org/abs/2608.13966
- Resultados detallados: https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-W4A16-G64/blob/main/EVAL.md
- Recibo de exportacion: https://huggingface.co/QUASAR-QAT/gemma-4-12B-it-QUASAR-W4A16-G64/blob/main/export_receipt.json
- Licencia del modelo base: https://huggingface.co/google/gemma-4-12B-it
