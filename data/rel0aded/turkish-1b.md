# Rel0aded/Turkish-1B

## Resumen

Turkish-1B es un modelo de lenguaje base (foundation SLM) de 1.014.061.056 parametros (~1,01B), desarrollado por el usuario Rel0aded (Yagiz) y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un transformer denso de estilo Llama-3 entrenado desde cero especificamente para turco, con atencion GQA (16 cabezas de consulta y 4 de clave/valor), SwiGLU, RMSNorm, RoPE con theta=500.000 y una ventana de contexto de 1.024 tokens ampliable a 16k/32k mediante YaRN. El tokenizer es un BPE propio de 16.384 tokens disenado para la morfologia aglutinante del turco.

El modelo se encuentra actualmente en fase activa de pre-entrenamiento: el repositorio aloja checkpoints periodicos de pesos crudos, no pesos finales. Segun la propia model card, el SFT (instruccion y chat), el alineamiento por DPO y la publicacion de versiones GGUF para Ollama y Open WebUI estan pendientes. Por tanto, no es un modelo listo para conversacion ni para uso en produccion, sino un checkpoint de investigacion util para seguir el desarrollo de un modelo fundacional turco de tamano reducido.

Su relevancia radica en dos factores: por un lado, la escasez de modelos fundacionales abiertos entrenados integramente desde cero en turco (la mayoria de alternativas son fine-tunes de Llama o Mistral); por otro, su tamano de ~1B, que lo situa en el rango desplegable en GPU de consumo. El repositorio ocupa 91,8 GB, coherente con el almacenamiento de multiples checkpoints intermedios de un entrenamiento en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only estilo Llama-3, con GQA, SwiGLU, RMSNorm y RoPE |
| Parametros totales | 1.014.061.056 (~1,01B), 21 bloques transformer |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (ampliable a 16k/32k con YaRN segun el autor) |
| Tipos de cuantizacion | no disponibles; planificados GGUF Q4_K_M, Q8_0 y FP16 (no publicados) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible; las etiquetas incluyen pytorch, pero la model card no especifica safetensors ni GGUF |

Datos adicionales declarados en la model card: hidden dim 2048, intermediate size de la MLP 5632, 16 cabezas de consulta frente a 4 cabezas KV (ratio 16:4), RMSNorm con epsilon 1e-5, weight tying entre embedding de entrada y cabeza LM, y vocabulario de 16.384 tokens en un BPE propio.

## Arquitectura y entrenamiento

La arquitectura sigue el patron Llama-3 adaptado a escala 1B: 21 bloques transformer con normalizacion RMSNorm pre-atencion, MLP SwiGLU con dimension intermedia 5632 y atencion agrupada (GQA) con 16 cabezas de consulta y 4 cabezas de clave/valor, lo que reduce el coste de cache KV durante la inferencia. El embedding de entrada comparte pesos con la cabeza de salida (weight tying), y las posiciones se codifican con RoPE con theta=500.000, valor alto que facilita la extension posterior del contexto mediante YaRN a 16k o 32k tokens. El tokenizer es un BPE entrenado especificamente para turco con 16.384 entradas.

El entrenamiento se realiza desde cero (from scratch) sobre un pool de ocho corpus turcos: libros de YTU Cosmos (`ytu-ce-cosmos/turkce-kitap`), instrucciones de Python en turco (`bysismo/Turkish-Python-instruction`), corpus academico de YTU (`ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0`), FineWeb-2 turco (`altaidevorg/fineweb-2-turkish-categorized`), dataset de LLM turco (`tascib/turkish-llm-dataset`), corpus limpio (`serda-dev/turkish-raw-text-cleaned`), Wikipedia en turco (`wikimedia/wikipedia`) y CulturaX (`uonlp/CulturaX`). La model card no indica el numero total de tokens procesados, la composicion porcentual del dataset, ni si se aplicaron tecnicas de RLHF o DPO; el alineamiento por DPO aparece como paso futuro en la hoja de ruta. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la arquitectura, el tokenizer propio y la optimizacion para dos GPU mencionada en el roadmap.

## Capacidades

- Generacion de texto en turco: el modelo es un causal LM puro orientado a la modelizacion del lenguaje turco.
- Razonamiento basico y continuacion de texto: entrenado con corpus enciclopedicos, literarios y web, aunque sin datos de benchmark publicados que cuantifiquen su rendimiento.
- Codigo en turco: el pool de datos incluye un conjunto de instrucciones de Python en turco, por lo que se espera cierta exposicion a codigo, no confirmada empiricamente.
- Tool calling / function calling: no disponible; no se ha realizado SFT ni se ha definido un formato de herramientas.
- Agentes y razonamiento multi-paso: no disponible; el modelo no ha pasado por fases de alineamiento ni de entrenamiento instruccional.
- Capacidades multilingues: solo turco declarado; no hay evidencia de transferencia a otros idiomas.
- Capacidad especial (thinking mode, vision, audio): no disponible.
- Estado del arte del proyecto: checkpoints de pre-entrenamiento sin SFT, no aptos para chat.

## Casos de uso

- Investigacion en modelos fundacionales turcos: el repositorio permite estudiar la evolucion de la loss y de los checkpoints de un modelo de ~1B entrenado desde cero, util para trabajos academicos sobre tokenizacion y corpus en lenguas aglutinantes.
- Desarrollo de tokenizers para turco: el BPE de 16.384 tokens puede reutilizarse o compararse con otros tokenizers en tareas de segmentacion morfologica.
- Fine-tuning posterior por terceros: dado que la licencia es Apache-2.0, un equipo puede partir de los checkpoints para aplicar SFT propio sobre dominios especificos (legal, sanitario, atencion al cliente) sin restricciones de uso comercial.
- Experimentacion con YaRN: la configuracion de RoPE (theta=500.000) esta pensada para extender el contexto a 16k/32k; sirve como banco de pruebas de tecnicas de extension de contexto en turco.
- Generacion de texto turco no critico: continuacion de parrafos, resumenes o borradores en aplicaciones internas donde no se requiera precision verificada.
- Base para destilacion: un modelo de 1B es adecuado como alumno o como profesor pequeno en pipelines de destilacion hacia modelos aun mas reducidos para movil.
- Evaluacion comparativa de corpus turcos: al haberse entrenado con ocho fuentes declaradas, permite experimentos de ablacion sobre que subconjuntos influyen en el rendimiento final.

En cualquier caso, estos casos de uso estan condicionados a que el modelo complete las fases de SFT y alineamiento, o a que el usuario asuma el coste de realizarlas por su cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para turco. El entrenamiento esta en curso y no se han publicado pesos finales, por lo que cualquier cifra seria especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,0 GB solo para pesos, mas activaciones y cache KV, lo que situa el total en torno a 3-4 GB (estimacion propia a partir de la arquitectura declarada, no confirmada por el autor).
- VRAM estimada con cuantizacion (aun no publicada): en torno a 0,6-0,7 GB en Q4 y 1,0-1,1 GB en Q8, segun los formatos GGUF planificados.
- Cache KV: con GQA 16:4, hidden dim 2048 y 21 capas, la cache por token es de aproximadamente 43 KB; para 1.024 tokens de contexto, unos 44 MB, cantidad despreciable frente a los pesos.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM deberia poder ejecutar el modelo en FP16 una vez convertido a un formato compatible (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o fine-tuning se recomienda al menos una GPU de 24 GB (RTX 4090, A5000) o A100/H100 si se escala el contexto.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 6 GB o mas en FP16 y en 4 GB o menos con cuantizacion de 4 bits, siempre que se disponga de una conversion funcional.
- Opciones de despliegue: actualmente no hay versiones GGUF ni soporte confirmado en vLLM, llama.cpp, Ollama o TGI. La hoja de ruta menciona Ollama y Open WebUI para cuando se publiquen los GGUF. Mientras tanto, solo es viable cargar los checkpoints con PyTorch/transformers, y no se documenta si requiere codigo propio (trust_remote_code) ni si la arquitectura esta registrada en transformers.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primera token.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos publicados por el autor. La siguiente tabla contrasta caracteristicas tecnicas basicas con dos alternativas de tamano similar ampliamente conocidas; los datos de Turkish-1B proceden de su model card y los de los otros modelos, de sus especificaciones publicas habituales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Rel0aded/Turkish-1B | ~1,01B | 1.024 tokens (ampliable con YaRN) | turco | Apache-2.0 | pre-entrenamiento en curso |
| Llama-3.2-1B | ~1,24B | 128k tokens | multilingue (incluye turco) | Llama 3.2 Community License | modelo final instruido y base |
| Qwen2.5-1.5B | ~1,54B | 32k tokens | multilingue (incluye turco) | Apache-2.0 | modelo final base e instruido |

La comparacion relevante no es de rendimiento (no hay datos) sino de enfoque: Turkish-1B es un modelo monolingue entrenado desde cero, mientras que Llama-3.2-1B y Qwen2.5-1.5B son modelos multilingues con fases de alineamiento completadas y soporte consolidado en herramientas de inferencia. No se conocen otros modelos fundacionales turcos de ~1B entrenados desde cero con los que comparar directamente.

## Limitaciones y advertencias

- Modelo en fase de pre-entrenamiento: los pesos publicados son checkpoints intermedios, no un modelo final. La model card advierte explicitamente de que no estan listos para conversacion con usuarios finales.
- Sin SFT ni alineamiento: no sigue instrucciones, no mantiene formato de chat y no tiene modo de razonamiento ni soporte de tool calling.
- Riesgo alto de alucinacion: al ser un modelo base sin ajuste, genera continuaciones plausibles sin verificacion factual.
- Contexto limitado: 1.024 tokens de ventana nativa; la extension a 16k/32k depende de YaRN y no esta validada en la informacion disponible.
- Cobertura idiomatica restringida al turco: no se declaran otros idiomas, por lo que el uso multilingue no esta soportado.
- Sesgos: no hay documentacion sobre composicion del dataset, filtrado de toxicidad ni evaluacion de sesgos; al incluir fuentes web (CulturaX, FineWeb-2, Wikipedia) es esperable la presencia de sesgos propios de esos corpus.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero la utilidad comercial inmediata es nula mientras no existan pesos finales alineados.
- Reproducibilidad: no se especifican el numero de tokens de entrenamiento, la mezcla exacta de datos, la configuracion de optimizacion ni el hardware utilizado, lo que dificulta replicar el entrenamiento.
- Inconsistencia de metadatos: las fechas del repositorio (creado y actualizado en 2026) son posteriores a la fecha de consulta, lo que sugiere un error en los campos de HuggingFace y obliga a tratar con cautela el resto de metadatos.
- Formato y despliegue: el repositorio de 91,8 GB contiene checkpoints de PyTorch sin conversion a safetensors ni GGUF declarada, y no se confirma el soporte en vLLM, llama.cpp, Ollama o TGI, lo que limita su uso fuera de un entorno de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rel0aded/Turkish-1B
- Dataset de libros en turco: https://huggingface.co/datasets/ytu-ce-cosmos/turkce-kitap
- Dataset de instrucciones Python en turco: https://huggingface.co/datasets/bysismo/Turkish-Python-instruction
- Corpus turco de YTU Cosmos: https://huggingface.co/datasets/ytu-ce-cosmos/Cosmos-Turkish-Corpus-v1.0
- FineWeb-2 turco categorizado: https://huggingface.co/datasets/altaidevorg/fineweb-2-turkish-categorized
- Dataset de LLM turco: https://huggingface.co/datasets/tascib/turkish-llm-dataset
- Corpus turco limpio: https://huggingface.co/datasets/serda-dev/turkish-raw-text-cleaned
- Wikipedia en turco: https://huggingface.co/datasets/wikimedia/wikipedia
- CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
