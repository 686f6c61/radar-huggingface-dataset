# moravianai/ThinEmbed-bge-m3

## Resumen

ThinEmbed-bge-m3 es una familia de encoders de consulta (query encoders) en formato GGUF derivados de BAAI/bge-m3, publicados por moravianai (Moravian AI) bajo licencia MIT. El modelo base, BAAI/bge-m3, es un XLM-RoBERTa large con pooling CLS, salida densa de 1024 dimensiones y soporte para mas de 100 idiomas; ThinEmbed conserva esa arquitectura y esa compatibilidad de vectores, pero reduce el tamano del fichero de 1104 MiB (fp16) a 321-355 MiB mediante cuantizacion con imatrix calibrada sobre texto checo.

El objetivo no es sustituir bge-m3 en el indexado, sino permitir la codificacion de consultas en el cliente (portatil, pestana de navegador, dispositivo edge) manteniendo intacto un indice de documentos ya construido con los embeddings densos de bge-m3. Los vectores de consulta resultantes siguen siendo compatibles con ese indice, con una perdida de calidad medida de entre el 0,4 % y el 1,7 % en nDCG@10 respecto al modelo fp32.

La relevancia actual del proyecto esta en que demuestra una via practica para llevar retrieval denso de calidad a entornos sin GPU y sin servidor dedicado, con ejecucion verificada en llama.cpp (`llama-embedding`) y en el navegador mediante wllama 3.6.1. El modelo tiene 566.703.104 parametros totales y un repositorio de aproximadamente 0,7 GB, con dos variantes publicadas (Q4_K_M y Q3_K, ambas con tabla de tokens en q4_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large), pooling CLS, salida densa de 1024 dimensiones |
| Parametros totales | 566.703.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como limite publicado; la model card recomienda fijar `-c 512` al tamano de la consulta |
| Tipos de cuantizacion | Q4_K_M (bloque) + q4_0 (tabla de tokens, 354,6 MiB); Q3_K (bloque) + q4_0 (tabla de tokens, 320,6 MiB); referencia Q5_K_M + q8_0 (505 MiB, no publicada); fp16/fp32 como base |
| Idiomas soportados | cs, en y multilingue (el modelo base cubre mas de 100 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp y wllama) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de BAAI/bge-m3: un encoder XLM-RoBERTa large con pooling CLS, normalizacion L2 y 1024 dimensiones de salida, sin prompt de instruccion en ninguno de los dos lados. ThinEmbed no reentrena el encoder; aplica cuantizacion post-entrenamiento sobre los pesos del modelo base usando una matriz de importancia (imatrix) recogida con `llama-imatrix` sobre 3000 parrafos de Wikipedia en checo (fichero `generic_cs.txt`). La receta incluye un paso previo obligatorio: `llama-imatrix` rechaza encoders que anaden EOS, por lo que se limpia el flag `tokenizer.ggml.add_eos_token` en una copia del fichero f16 antes de recolectar la matriz.

La innovacion tecnica principal es el tratamiento asimetrico de la tabla de tokens: la tabla de 250.002 x 1024 entradas, que ocupa aproximadamente la mitad del fichero original, se mantiene en 4 bits (q4_0), lo que segun el autor cuesta como maximo 0,2 puntos de nDCG frente a una tabla de 8 bits en este modelo. El bloque de pesos usa la rejilla K-quant de llama.cpp (Q4_K_M o Q3_K). El pipeline completo (receta de verificacion, exportador GPTQ sobre las rejillas K-quant, recetas de `llama-quantize` y la parte de cuantizacion vectorial con compilador `.vqw` y runtime WebGPU) esta publicado bajo Apache-2.0 en el repositorio del autor. No se documentan datos de entrenamiento adicionales, RLHF ni DPO, ya que no hay entrenamiento nuevo.

## Capacidades

- Generacion de embeddings de consulta (feature-extraction) con pooling CLS y normalizacion L2, en 1024 dimensiones.
- Retrieval denso asimetrico: codifica consultas compatibles con un indice de documentos construido con los embeddings densos de BAAI/bge-m3.
- Compatibilidad multilingue heredada del modelo base (mas de 100 idiomas), con calibracion y evaluacion especificas en checo e ingles.
- Ejecucion en llama.cpp mediante `llama-embedding --pooling cls --embd-normalize 2`.
- Ejecucion en navegador con wllama 3.6.1, cargando el fichero GGUF directamente con pooling `cls`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un encoder de consultas.
- No es compatible con las salidas sparse ni ColBERT de bge-m3, ni con indices construidos con otros modelos.

## Casos de uso

- Busqueda semantica en el cliente: con un indice ya construido con bge-m3 en servidor, el fichero Q4_K_M (355 MiB) permite codificar la consulta en el portatil del usuario y enviar solo el vector de 1024 dimensiones, reduciendo latencia y exposicion de la consulta.
- Extension o widget de navegador: wllama 3.6.1 carga el GGUF directamente en la pestana, habilitando retrieval denso sobre documentacion o bases de conocimiento sin backend de inferencia.
- Dispositivos edge y sin GPU: el modelo corre en CPU con llama.cpp, lo que lo hace viable en entornos donde no hay acelerador dedicado ni presupuesto para servir bge-m3 fp16.
- Recuperacion juridica o administrativa en checo: la variante Q4_K_M conserva el 99,2 % del nDCG@10 del fp32 sobre un indice de 55.071 segmentos del Tribunal Supremo checo, un escenario realista de busqueda sobre corpus normativo.
- Busqueda cientifica en ingles: sobre SciFact mantiene el 99,6 % del nDCG@10 fp32 (0,6388 frente a 0,6414), adecuado para recuperacion de literatura con indices existentes.
- Despliegue con restricciones de tamano: la variante Q3_K (321 MiB) reduce 34 MiB adicionales a costa de bajar al 98,3 % en checo, util en imagenes de contenedor o paquetes de aplicacion con limites estrictos.
- Migracion sin reindexado: cualquier organizacion con un indice denso de bge-m3 puede adoptar estos encoders de consulta sin regenerar los vectores de documento, lo que elimina el coste de reindexacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test, con `llama-embedding` nativo e indice de documentos fp32 del mismo modelo. nDCG@10 se expresa en valor absoluto y como porcentaje del fp32; se anaden la similitud coseno media entre el vector de consulta cuantizado y el fp32, y el solapamiento medio del top-10.

| Corpus (consultas) | fp32 | Q4_K_M + q4_0 (355 MiB) | Q3_K + q4_0 (321 MiB) | Q5_K_M + q8_0 (505 MiB, no publicada) |
|---|---|---|---|---|
| Segmentos del Tribunal Supremo checo (1137 consultas sinteticas) | 0,3169 | 0,3144 (99,2 %) · coseno 0,990 · solapamiento 0,864 | 0,3114 (98,3 %) · coseno 0,970 · solapamiento 0,780 | 0,3156 (99,6 %) · coseno 0,995 · solapamiento 0,907 |
| SciFact (300) | 0,6414 | 0,6388 (99,6 %) · coseno 0,991 · solapamiento 0,910 | 0,6416 (100,0 %) · coseno 0,974 · solapamiento 0,854 | 0,6443 (100,5 %) · coseno 0,996 · solapamiento 0,937 |

El autor advierte que diferencias por debajo de 0,01 en nDCG@10 deben leerse como empate (varianza de calibracion aproximada de 0,01 y variacion entre maquinas de ±0,006). La evaluacion en checo emplea consultas sinteticas generadas con Qwen3-1.7B (doc2query), con el segmento fuente como relevante, sin juicios humanos de relevancia; el nivel fp32 es practicamente identico entre los modelos base probados (0,317-0,319), por lo que la metrica aisla el efecto de la compresion. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no aplican a un encoder de retrieval.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el tamano de fichero es de 354,6 MiB (Q4_K_M) y 320,6 MiB (Q3_K), por lo que la huella en memoria durante la inferencia es del orden de unos pocos cientos de MiB mas el contexto de la consulta.
- GPU recomendadas: no se documentan; el modelo esta pensado para CPU y ejecucion en cliente, no para servidores con A100, H100 o RTX 4090.
- GPU de consumo: cabe en cualquier GPU de consumo por tamano, aunque la via soportada y verificada por el autor es CPU con llama.cpp y navegador con wllama.
- Opciones de despliegue: llama.cpp (`llama-embedding`), wllama 3.6.1 en navegador y el runtime WebGPU de cuantizacion vectorial incluido en el repositorio publico. No se mencionan vLLM, TGI ni Ollama.
- Contexto de ejecucion: la model card recomienda `-c 512`, ajustado a la longitud de la consulta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ThinEmbed-bge-m3 (Q4_K_M) | 566,7 M | no disponible (recomendado 512) | densa, 1024 d, CLS | MIT | GGUF (355 MiB) | Encoder de consulta; requiere indice de documentos bge-m3 |
| BAAI/bge-m3 (fp16) | 566,7 M | no disponible en esta ficha | densa 1024 d, sparse y ColBERT | MIT | safetensors (1104 MiB fp16) | Modelo base completo; referencia de calidad y compatible con los mismos indices densos |
| ThinEmbed-bge-m3 (Q3_K) | 566,7 M | no disponible (recomendado 512) | densa, 1024 d, CLS | MIT | GGUF (321 MiB) | Variante mas agresiva; 98,3 % del nDCG fp32 en checo |

La comparacion relevante es frente al propio bge-m3 en fp16: ThinEmbed ocupa entre el 29 % y el 32 % del tamano del fichero fp16 y conserva entre el 98,3 % y el 99,6 % del nDCG@10 segun variante y corpus. No se dispone de datos para comparar con otros encoders de retrieval de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo codifica consultas: no genera texto, no razona y no soporta tool calling ni agentes; usarlo fuera de esa funcion no es viable.
- Requiere un indice de documentos construido con los embeddings densos de BAAI/bge-m3; no es compatible con las salidas sparse o ColBERT de bge-m3 ni con indices de otros modelos.
- La calibracion de la cuantizacion se hizo sobre texto checo; la validacion en ingles se limita a SciFact, por lo que el comportamiento en otros idiomas y dominios no esta medido.
- La evaluacion en checo usa consultas sinteticas sin juicios humanos de relevancia, lo que limita la interpretacion de los valores absolutos de nDCG@10.
- Riesgo de alucinacion no aplicable en sentido generativo, pero la cuantizacion introduce perdida de ranking: el solapamiento del top-10 cae al 0,780 en la variante Q3_K sobre el corpus checo.
- La tabla de tokens en 4 bits puede costar hasta 0,2 puntos de nDCG frente a una tabla de 8 bits segun el autor; la variante Q5_K_M + q8_0, que recupera parte de esa perdida, no esta publicada.
- El texto de calibracion (Wikipedia checa, CC BY-SA) no se redistribuye; solo se publica el script de muestreo.
- La licencia MIT de los pesos deriva de BAAI/bge-m3 (MIT), por lo que no anade restricciones comerciales, pero conviene verificar los terminos del modelo base para usos concretos.
- El recuento de descargas (74) y la ausencia de likes indican una adopcion todavia muy limitada; no hay evidencia de uso en produccion a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moravianai/ThinEmbed-bge-m3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Repositorio del pipeline y harness de verificacion: https://github.com/rosecky/embedding-quantization-public
- Pagina del proyecto sobre query encoders: https://moravian.ai/query-encoders/
- Demo publica (ficheros escalares con wllama y contenedores vector-cuantizados): https://moravian.ai/demo
- Contacto del autor: info@moravian.ai
