# reaperdoesntknow/Symiotic-14B

## Resumen

Symiotic-14B es un ajuste fino experimental del modelo Qwen3-14B publicado por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. El autor lo presenta como un hibrido simbolico-transformer con memoria persistente, aunque el checkpoint real es un fine-tune sobre la arquitectura Qwen3-14B con pesos en safetensors que suman 14.768.307.200 parametros. La model card declara 17.800 millones de parametros y un "symbolic dim" de 8192, cifra que no coincide con el recuento real de pesos del repositorio.

El modelo se entrena sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268 y esta orientado a generacion de texto en ingles, con enfasis declarado en razonamiento simbolico, generacion de pruebas matematicas y agentes conversacionales con memoria. La relevancia actual es limitada: se trata de un checkpoint de investigacion sin resultados de benchmarks publicados, con una licencia poco habitual (AFL-3.0) y un repositorio de 74,7 GB que incluye artefactos auxiliares como `memory.pt` (banco de 4096 vectores simbolicos en FP32) y tokens especiales adicionales.

Conviene tratarlo como una propuesta de investigacion, no como un modelo listo para produccion. Las afirmaciones de la model card sobre modulos simbolicos (ThoughtDynamicsLNN, LiquidThoughtProcessor, CrystallineProcessor, HelicalDNAProcessor) describen intencion arquitectonica segun el propio autor, que reconoce explicitamente que no estan respaldadas por benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3-14B (RoPE + FlashAttention) con modulos simbolicos adicionales declarados por el autor |
| Parametros totales | 14.768.307.200 (segun safetensors); la model card declara 17,8 B, dato no verificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-14B, no confirmada en el repo) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors y model.bin en el repo) |
| Idiomas soportados | en |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors, model.bin (PyTorch), memory.pt (banco de memoria simbolica) |

## Arquitectura y entrenamiento

El backbone es el transformer de Qwen3-14B, con embeddings rotatorios y atencion FlashAttention. Sobre esa base, el autor declara una capa de modulos simbolicos: ThoughtDynamicsLNN (atencion LSTM multi-cabeza), LiquidThoughtProcessor, CrystallineProcessor (GNN con convoluciones tipo DNAConv) y HelicalDNAProcessor (codificacion helicoidal lineal). Un router basado en clasificador de intencion y compuerta de entropia seleccionaria la ruta de procesamiento. El modelo incorpora ademas un banco de 4096 estados simbolicos en FP32 recuperados por entropia y similitud contextual, y un modo "Dream" de simulacion simbolica en segundo plano.

El entrenamiento se realizo sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, un conjunto de chain-of-thought de calculo avanzado. No se documentan en la informacion disponible el numero de tokens, la composicion completa del dataset, ni si hubo RLHF, DPO o SFT adicional. El tokenizador incluye tokens especiales propios (`<D_LIM>`, `<PROOF>`, `<BY_MEASURE>`, entre otros) que sugieren un formato de prompting especifico para tareas de demostracion matematica.

## Capacidades

- Generacion de texto y razonamiento de cadena de pensamiento, heredados del backbone Qwen3-14B.
- Generacion de pruebas y planificacion de teoremas simbolicos, segun el autor.
- Razonamiento en dominios "difusos, discontinuos o no suaves" (declarado, sin validacion publica).
- Memoria persistente mediante banco de 4096 estados simbolicos, con recuperacion por entropia y similitud contextual.
- Soporte de tokens especiales para estructuracion de pruebas y medidas.
- Conversacion multi-turno en ingles.
- Tool calling / function calling: no disponible (no declarado).
- Soporte de agentes multi-paso: declarado como caso de uso, sin evidencia publica.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en arquitecturas hibridas simbolico-neurales: el checkpoint sirve como base para experimentar con bancos de memoria externos y routers de procesamiento, aunque requiere validacion propia.
- Generacion asistida de demostraciones de calculo avanzado: el fine-tune sobre CoT de calculo puede emplearse para producir borradores de pruebas que un matematico revise, dado el formato de tokens especiales para pruebas.
- Prototipos de tutoria matematica en ingles: la combinacion de CoT y tokens de medida permite estructurar explicaciones paso a paso, siempre con supervision humana.
- Experimentos de memoria conversacional: el banco `memory.pt` permite probar tecnicas de recuperacion por entropia en dialogos largos, comparandolas con RAG convencional.
- Reproduccion de resultados de la serie SymbioticAI: util para quien quiera replicar o auditar las afirmaciones del autor sobre cognicion simbolica.
- Base para ablaciones academicas: permite comparar el fine-tune frente al Qwen3-14B original en tareas de matematicas y razonamiento, midiendo el efecto real del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las capacidades descritas reflejan intencion arquitectonica y no resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 30 GB solo para pesos, mas overhead de KV cache y del banco de memoria en FP32 (4096 vectores de 8192 dimensiones, unos 128 MB adicionales).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 16 GB; en 4 bits, alrededor de 9-10 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para BF16; L40S o RTX 6000 Ada para fp16 con margen.
- GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantizacion agresiva; en RTX 3090 (24 GB) igualmente ajustado. No cabe en GPUs de 8-12 GB sin cuantizacion extrema.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM y llama.cpp no estan confirmados para este checkpoint; los modulos simbolicos y `memory.pt` pueden requerir codigo personalizado no incluido en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Symiotic-14B | 14,77 B (declara 17,8 B) | no disponible | AFL-3.0 | Checkpoint de investigacion, sin benchmarks |
| Qwen/Qwen3-14B | 14,8 B | 32 768 tokens (ampliable) | Apache-2.0 | Modelo base, ampliamente validado |
| Symbiotic-8B (mismo autor) | ~8 B | no disponible | no disponible | Version menor de la misma serie |
| Symbiotic-1B (mismo autor) | ~1 B | no disponible | no disponible | Version menor de la misma serie |

Frente al Qwen3-14B original, Symiotic-14B anade modulos simbolicos y memoria externa pero pierde la licencia permisiva Apache-2.0 y carece de evaluacion publica. Para produccion, el modelo base sigue siendo la opcion recomendada salvo que se busque especificamente experimentar con la propuesta simbolica.

## Limitaciones y advertencias

- Las capacidades simbolicas declaradas no estan respaldadas por benchmarks; el propio autor lo reconoce.
- Discrepancia entre parametros declarados (17,8 B) y reales en safetensors (14,77 B), lo que sugiere que los modulos simbolicos podrian no estar incluidos en los pesos publicados o que la cifra es incorrecta.
- El modelo no esta instruction-tuned para QA general, segun la model card.
- La memoria persistente requiere curacion y seed manual para ser util.
- Solo soporta ingles declarado; sin capacidades multilingues verificadas.
- Riesgo de alucinacion elevado en tareas matematicas y de prueba sin validacion formal.
- Licencia AFL-3.0: permisiva con el codigo pero con obligaciones de atribucion y clausulas de licencia reciproca; revisar compatibilidad antes de uso comercial.
- FlashAttention y modulos simbolicos incrementan el uso de VRAM durante la generacion.
- El repo incluye `model.bin` y `model.safetensors` duplicados (74,7 GB), lo que complica el despliegue y el almacenamiento.
- No hay evidencia de soporte en vLLM, llama.cpp u Ollama; la integracion puede requerir codigo a medida.
- La documentacion mezcla teoria matematica (Discrepancy Calculus) con afirmaciones de arquitectura sin validacion empirica; tratar con escepticismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Symiotic-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/0xZee/dataset-CoT-Advanced-Calculus-268
- Symbiotic-1B: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Symbiotic-8B: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Symbiotic-Beta: https://huggingface.co/reaperdoesntknow/Symbiotic-Beta
- Coleccion SymbioticAI: https://huggingface.co/collections/reaperdoesntknow/symbioticai-a-collection-of-symbolic-transformers-for-th-681a7f98b5e2397d10192c9a
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Metodologia "Structure Over Scale": https://doi.org/10.57967/hf/8165
