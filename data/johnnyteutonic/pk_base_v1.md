# johnnyteutonic/pk_base_v1

## Resumen

pk_base_v1 es un modelo de lenguaje decoder-only de 97,5 millones de parámetros construido desde cero por Jonathan Reich con paperkiln, un framework de entrenamiento en C++ con pasos hacia atrás escritos a mano. Sigue la arquitectura Llama (12 capas, anchura 768, atención multi-cabeza completa con 12 cabezas de 64 dimensiones, SwiGLU con anchura interna 2.048 y RMSNorm pre-norm), con un vocabulario propio de 16.384 entradas y una longitud de contexto de solo 512 tokens. Es un modelo base: continúa texto y no ha recibido ajuste por instrucciones; su versión conversacional es pk_sft_v1.

El interés del modelo es fundamentalmente metodológico y educativo. Se trata de un artefacto de extremo a extremo reproducible: el autor publica el spec de entrenamiento (`spec.json`), el resumen de la ejecución (`result.json`), los pesos en formato propio y en GGUF, y las herramientas para reconstruir el GGUF desde safetensors. El modelo se entrenó con datos públicos bien documentados (FineWeb-Edu, UltraChat 200k, SODA, OASST1/2 y everyday-conversations), con proporciones de bytes declaradas y licencias verificadas por revisión.

Con 94 descargas y 0 likes en el momento de la consulta, no es un modelo pensado para producción ni para competir en benchmarks de razonamiento. Su utilidad real está en servir como caso de estudio de un pipeline completo de entrenamiento e inferencia en C++, y como base pequeña para experimentos de tokenización, cuantización GGUF y verificación de paridad entre motores de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (`general.architecture = llama`) |
| Parámetros totales | 97.536.768 (matriz de salida atada al embedding; llama.cpp informa 110.119.680 al escribir embedding y salida como dos tensores) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | F32 (principal), Q4_K_M (73 tensores Q4_K, 13 Q6_K, 25 F32), Q4_K_S (80 Q4_K, 5 Q5_K, 1 Q6_K, 25 F32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (F32, Q4_K_M, Q4_K_S), safetensors (nombres de tensor propios de paperkiln, F32) |

Detalles adicionales de arquitectura: 12 capas, anchura 768, atención causal multi-cabeza completa (sin grouped queries), 12 cabezas de 64 dimensiones, feed-forward SwiGLU con anchura interna 2.048, RMSNorm con epsilon 1e-5 en pre-norm, RoPE con theta 10.000 aplicado a todas las cabezas, sin sesgos. Vocabulario de 16.384 entradas. Tamaño del repo: 1,0 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12 capas y 768 de anchura, con atención multi-cabeza completa (sin GQA) y RoPE en todas las cabezas. La matriz de salida está atada al embedding de tokens. El tokenizador es un BPE a nivel de byte propio, de 16.384 entradas, que adopta el esquema de Llama 3 (regex de pre-tokenización de Llama 3, mapeo byte-a-unicode de GPT-2) pero con merges entrenados sobre 205 MB de las fuentes de entrenamiento (FineWeb-Edu 146,8 MB, UltraChat 26,2 MB, SODA 21,0 MB, OASST 10,5 MB, everyday-conversations 1,9 MB). No comparte vocabulario con Llama 3, solo el esquema. Los ids 0-3 son tokens de control (`<unk>`, `<|endoftext|>`, `<|user|>`, `<|assistant|>`); no se añade BOS y `<|endoftext|>` separa documentos.

Los datos de entrenamiento son cinco fuentes públicas con proporciones de bytes declaradas: FineWeb-Edu (shard `000_00000` de sample-10BT, revisión `87f09149`, 613.309 documentos, 70,0% de los bytes), UltraChat 200k `train_sft` (`8049631c`, 126.365 documentos, 17,5%), SODA train (`fdc848ab`, 706.117 documentos, 12,3%), OASST2 más los árboles de OASST1 no presentes en OASST2 en inglés y mejor rama por árbol (`179dd21f`, `fdf72ae0`, 3.328 documentos, 0,16%) y everyday-conversations-llama3.1-2k `train_sft` (`14f54321`, 1.394 documentos, 0,03%). Los diálogos se renderizan en el formato de chat (`<|user|>...<|assistant|>...<|endoftext|>`), de modo que la conversación forma parte del preentrenamiento: el 27% de los bytes en el primer 85% del entrenamiento y el 47% en el último 15%, una cola de annealing con mezcla propia leída desde el paso 102.000. Los diálogos se deduplicaron dentro de cada fuente y se comprobaron contra conjuntos de evaluación congelados de paperkiln mediante reglas de n-gramas y spans. No se documenta en la información disponible una fase de RLHF o DPO.

La innovación destacable no está en el modelo sino en el stack: paperkiln entrena con pasos hacia atrás escritos a mano en C++, y ember.cpp (motor de inferencia en C++ para CPU o CUDA) reproduce exactamente la misma salida que el sampler propio de paperkiln y que llama.cpp b6000 en decodificación greedy sobre 40 prompts fijos de 60 tokens nuevos (40/40 coincidencias en ambos casos). El GGUF lleva el tokenizador y el IR de paperkiln (`paperkiln.ir`, una descripción JSON de la red). El fichero F32 se exportó antes de que existiera el esquema de conversación, por lo que no tiene plantilla de chat y lleva IR versión 0; los dos ficheros de 4 bits, exportados después desde los mismos pesos, llevan IR versión 1 y la plantilla de chat de paperkiln (la misma que pk_sft_v1).

## Capacidades

- Generación de texto y continuación de contexto: es un modelo base, sin ajuste por instrucciones, por lo que su comportamiento esperado es completar secuencias más que seguir órdenes.
- Conversación en formato de chat: aunque no está ajustado, parte del preentrenamiento incluye diálogos renderizados con los tokens `<|user|>` y `<|assistant|>`, lo que le da cierta familiaridad con ese formato.
- Multilingüismo: limitado al inglés; no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible; el contexto de 512 tokens y la ausencia de ajuste lo hacen inadecuado.
- Modo thinking, visión o audio: no disponible.
- Capacidad de servir como base para fine-tuning: es su uso más razonable, dado que se publica el spec de entrenamiento y el formato de pesos propio.

## Casos de uso

- Estudio y reproducción de un pipeline de entrenamiento completo: el `spec.json` y el `result.json` permiten reconstruir la receta, y `mtstudio export spec.json --from pk_base_v1.safetensors` regenera el GGUF, lo que sirve para auditar cada etapa del proceso.
- Experimentos de tokenización: al incluir su propio BPE de 16.384 entradas con el esquema de Llama 3, se puede comparar su comportamiento con el tokenizador de Llama 3 sobre corpus controlados y validar la paridad con llama.cpp (el autor verificó ids idénticos en 794 textos, 84.934 tokens).
- Verificación de motores de inferencia: sirve como modelo de referencia diminuto para comprobar que ember.cpp, llama.cpp y transformers producen las mismas salidas en decodificación greedy, algo útil al integrar nuevos backends.
- Docencia y formación en arquitecturas transformer: con 12 capas y 97,5 M de parámetros, el modelo entero cabe en memoria y permite inspeccionar activaciones, atención y embeddings sin infraestructura especial.
- Prototipado de aplicaciones de continuación de texto en CPU: el fichero Q4_K_M de 69,2 MB se ejecuta en hardware modesto, lo que permite probar interfaces de generación de texto antes de invertir en modelos mayores.
- Base para fine-tuning con datos propios en inglés: al ser un modelo base con licencia MIT, se puede ajustar para tareas acotadas de dominio (clasificación de texto vía generación, extracción de entidades, resumen de frases cortas) dentro de su ventana de 512 tokens.
- Benchmark de cuantización: los tres formatos publicados (F32, Q4_K_M, Q4_K_S) con hashes SHA256 permiten medir la degradación de calidad y el ahorro de memoria de cada esquema en un modelo pequeño y controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de paridad entre motores de inferencia: decodificación greedy sobre 40 prompts fijos de 60 tokens nuevos con coincidencia total (40/40) en ember.cpp (CPU) frente al sampler de paperkiln, y 40/40 en llama.cpp b6000 sobre el fichero F32, con caché KV en F32 o F16 por defecto. También se verificó la tokenización en 794 textos (84.934 tokens) frente a llama.cpp b6000, con ids idénticos.

## Requisitos de hardware

- VRAM estimada: el fichero F32 ocupa 441,1 MB y el safetensors 390,2 MB; las cuantizaciones de 4 bits ocupan 69,2 MB (Q4_K_M) y 66,4 MB (Q4_K_S). Con 512 tokens de contexto, la caché KV es despreciable.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre basta para el F32; para las versiones de 4 bits, cualquier GPU con unos pocos cientos de MB. ember.cpp admite CPU pura o descarga de todas las capas en GPU (`-1`).
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso iGPU con memoria compartida; también se ejecuta íntegramente en CPU.
- Opciones de despliegue: ember.cpp (CPU o CUDA), llama.cpp (probado en b6000, con `llama-server`), transformers mediante `AutoModelForCausalLM.from_pretrained(..., gguf_file=...)`. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formato | Notas |
|---|---|---|---|---|---|---|
| pk_base_v1 | 97,5 M | 512 | MIT | inglés | GGUF, safetensors | Modelo base, sin ajuste por instrucciones, tokenizador propio |
| TinyLlama-1.1B | 1.100 M | 2.048 | Apache-2.0 | inglés | safetensors, GGUF | Ajustado por instrucciones; 11 veces más parámetros |
| Llama 3.2 1B | 1.240 M | 128.000 | Llama 3.2 Community License | multilingüe | safetensors, GGUF | Contexto muy superior y licencia con restricciones |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | inglés | safetensors, GGUF | Tamaño comparable, con versiones base e instruct |

La comparación con estos modelos es solo orientativa: no hay benchmarks publicados de pk_base_v1 que permitan establecer una comparación de rendimiento. Las diferencias principales son el contexto (512 frente a 2.048 o más), el idioma (solo inglés) y la ausencia de ajuste por instrucciones.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable y puede producir continuaciones incoherentes o repetitivas.
- Contexto de solo 512 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o razonamiento multi-paso.
- Solo inglés: no se declara ni se ha evaluado su comportamiento en castellano u otros idiomas.
- Riesgo de alucinación elevado por tamaño y por la naturaleza de los datos de preentrenamiento (FineWeb-Edu es texto web filtrado, con los sesgos propios de Common Crawl).
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad; no hay filtros ni alineación documentada.
- Licencia MIT: permite uso comercial sin restricciones, pero las licencias de los datasets de entrenamiento (ODC-By 1.0 y términos de Common Crawl para FineWeb-Edu, CC-BY-4.0 para SODA, Apache-2.0 para OASST y everyday-conversations, MIT para UltraChat) deben revisarse si se redistribuyen derivados.
- El fichero F32 no tiene plantilla de chat (IR versión 0); solo los GGUF de 4 bits incluyen la plantilla de paperkiln. Hay que tenerlo en cuenta al integrarlo en pipelines conversacionales.
- El safetensors usa nombres de tensor propios de paperkiln, no los de transformers; requiere el flujo de exportación de paperkiln para reconstruir el GGUF.
- Sin soporte documentado en vLLM, TGI u Ollama; el despliegue está limitado a ember.cpp, llama.cpp y transformers.
- El proyecto depende de un único autor y de un framework de entrenamiento poco extendido (paperkiln), lo que reduce la comunidad y el soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnnyteutonic/pk_base_v1
- Versión conversacional: https://huggingface.co/johnnyteutonic/pk_sft_v1
- Framework de entrenamiento paperkiln: https://github.com/JohnnyTeutonic/paperkiln
- Motor de inferencia ember.cpp: https://github.com/JohnnyTeutonic/ember.cpp
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset SODA: https://huggingface.co/datasets/allenai/soda
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset everyday-conversations-llama3.1-2k: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
