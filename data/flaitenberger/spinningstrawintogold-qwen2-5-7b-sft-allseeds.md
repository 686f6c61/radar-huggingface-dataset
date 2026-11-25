# flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds

## Resumen

SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds es un repositorio agregado que reúne todos los ajustes supervisados (SFT) realizados sobre Qwen2.5-7B en el marco del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*, actualmente en revision. Lo desarrolla el usuario flaitenberger y su proposito es estudiar como una pequena proporcion de datos sinteticos de deduccion logica, generados programaticamente sin intervencion de un modelo de lenguaje, afecta al razonamiento de modelos ya instruidos.

El modelo base es Qwen2.5-7B, un transformer denso de 7 mil millones de parametros con 128 000 tokens de contexto, al que se le aplica SFT sobre mezclas de 100 000 ejemplos construidas a partir de Dolci-Instruct-SFT-No-Tools y de problemas de deduccion Horn generados de forma determinista. El repositorio incluye cada mezcla y cada semilla en su propia carpeta `-<Mixture>/seed<S>/`, con pesos en bf16 safetensors, tokenizer, model card individual, `provenance.json` y resultados de lm-evaluation-harness.

Su relevancia es metodologica: demuestra que sustituir entre el 1 % y el 25 % de una mezcla de instrucciones por derivaciones deductivas verificables mejora la precision en ProofWriter, FOLIO y subtareas multi-paso de BIG-Bench Hard, sin degradar de forma apreciable los benchmarks generales. El repositorio ocupa 335,1 GB, lo que refleja que contiene decenas de checkpoints completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7 000 millones (modelo base Qwen2.5-7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (heredada de Qwen2.5-7B) |
| Tipos de cuantizacion | pesos publicados en bf16 safetensors; cuantizaciones GGUF/AWQ/GPTQ no disponibles en el repo |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B sin modificaciones estructurales: transformer decoder-only denso con atencion de causal estandar, RoPE, GQA y ventana de contexto de 128 000 tokens. Sobre esa base se aplica SFT con mezclas fijas de 100 000 ejemplos. La porcion sustituida son problemas de deduccion multi-paso sobre clausulas Horn con constantes abstractas, generados por un programa corto sin modelo en el bucle, de modo que las soluciones son correctas por construccion y no contienen conocimiento del mundo.

El repositorio cubre multiples mezclas: `Dolci100k-Baseline` (100 000 ejemplos Dolci sin derivaciones), `Dolci100k-English10pct`, `Dolci100k-Formal05pct`, `Dolci100k-Formal25pct` y varias ablaciones de contenido (respuesta sola, lineas permutadas, trazas procedurales sin logica, ejemplos FLD.v2 y filas Dolci con contenido de razonamiento). Cada mezcla se entrena con varias semillas. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset Dolci ni si hubo fases posteriores de RLHF o DPO; el procedimiento descrito es exclusivamente SFT.

## Capacidades

- Generacion de texto y razonamiento deductivo multi-paso sobre problemas tipo ProofWriter y FOLIO.
- Produccion de derivaciones largas paso a paso que un verificador simbolico puede aceptar, incluso con solo un 1 % de datos de deduccion en la mezcla.
- Razonamiento formal con representaciones de clausulas Horn y derivaciones en formato formal o en ingles.
- Capacidades generales de instruccion heredadas de Qwen2.5-7B (redaccion, resumen, preguntas y respuestas).
- Soporte multilingue limitado al ingles segun la model card, aunque el modelo base Qwen2.5 es multilingue.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en esta ficha.

## Casos de uso

- Investigacion sobre datos sinteticos: comparar las distintas mezclas y semillas del repositorio para medir el efecto de las derivaciones deductivas en el rendimiento, usando los ficheros `eval/` incluidos.
- Evaluacion de razonamiento logico: emplear los checkpoints como referencia en tareas de deduccion multi-paso tipo ProofWriter o FOLIO dentro de un banco de pruebas interno.
- Generacion de cadenas de razonamiento verificables: el modelo produce derivaciones que un comprobador simbolico puede validar, util para construir datasets de razonamiento con garantia de correccion.
- Reproducibilidad de experimentos: cada carpeta incluye `provenance.json` con los argumentos de entrenamiento y las puntuaciones, lo que permite replicar exactamente cada ejecucion.
- Ajuste fino posterior: partir de un checkpoint concreto como inicializacion para experimentos de SFT o DPO en dominios que requieran deduccion estructurada.
- Analisis de sesgos de etiqueta: estudiar el efecto descrito en el articulo sobre la preferencia por una etiqueta de respuesta concreta, comparando el baseline con las mezclas con derivaciones.

## Benchmarks y rendimiento

Los resultados publicados en la model card se expresan como mejoras relativas respecto al baseline, no como puntuaciones absolutas:

| Benchmark | Mejora reportada (Qwen2.5-7B) |
|---|---|
| ProofWriter | +5 a +16 puntos |
| FOLIO | hasta +6 puntos |
| BIG-Bench Hard (subtareas multi-paso) | hasta +7 puntos |
| Benchmarks generales | practicamente sin cambios |

No se han publicado en la informacion disponible las puntuaciones absolutas por mezcla y semilla; estas deben consultarse en los ficheros `eval/` de cada carpeta del repositorio. El articulo esta en revision y el enlace al preprint aun no esta disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 14-16 GB para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto largo.
- Cuantizacion a 8 bits: alrededor de 8 GB; a 4 bits: alrededor de 4-5 GB, aunque el repositorio no incluye pesos cuantizados.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes y contexto de 128 000 tokens; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizacion o contexto reducido.
- Despliegue: transformers (formato nativo del repo); vLLM, TGI, llama.cpp u Ollama requeririan conversion previa a los formatos correspondientes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds | 7B | 128k | SFT con deducciones sinteticas | Apache 2.0 |
| Qwen2.5-7B-Instruct | 7B | 128k | Instruccion general | Apache 2.0 |
| Qwen2.5-7B (base) | 7B | 128k | Preentrenamiento | Apache 2.0 |
| Modelos de 7B especializados en razonamiento logico | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas especializadas en deduccion no esta disponible en la informacion proporcionada; el propio repositorio incluye el baseline `Dolci100k-Baseline` como referencia interna.

## Limitaciones y advertencias

- Entrenado y evaluado principalmente en ingles; el rendimiento en castellano no esta documentado.
- Los datos de deduccion son problemas abstractos sin conocimiento del mundo; el modelo puede no generalizar a razonamiento logico con contenido real.
- Riesgo de alucinacion inherente a los modelos de 7B, no mitigado especificamente en esta ficha.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- El repositorio contiene decenas de checkpoints (335,1 GB); es necesario seleccionar la carpeta concreta y no cargar el repo completo.
- Licencia Apache 2.0 permite uso comercial, pero el articulo esta en revision y las conclusiones no han sido revisadas por pares.
- No incluye pesos cuantizados ni adaptadores; el despliegue en produccion requiere conversion y validacion propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-7B-SFT-AllSeeds
- Dataset de mezclas: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Preprint del articulo: no disponible (en revision)
