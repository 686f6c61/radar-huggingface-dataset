# after2400/qmd-query-expansion-granite-1b-mlx-mixed-4-6

## Resumen

qmd-query-expansion-granite-1b-mlx-mixed-4-6 es un modelo de expansion de consultas de busqueda derivado de IBM Granite 4.0 1B (Apache 2.0) mediante un fine-tune con LoRA sobre el conjunto de datos de entrenamiento del proyecto qmd. Lo publica el usuario after2400 como componente opcional de pyqmd, el port a Python y MLX de qmd, y su funcion es transformar una consulta de busqueda breve en tres artefactos tipados: un pasaje hipotetico (hyde), variaciones de palabras clave (lex) y una reformulacion en lenguaje natural (vec). El modelo esta cuantizado en MLX con precision mixta 4/6 bits y solo funciona en Apple Silicon.

La relevancia del modelo es acotada pero concreta: permite que toda la cadena de recuperacion de pyqmd use exclusivamente bases de pesos abiertas de origen estadounidense (Granite de IBM para la expansion y un modelo de embeddings de Google), sin depender de fine-tunes de Qwen3. Con 1.631.750.144 parametros totales y un repositorio de 1,0 GB, su interes no esta en capacidades generales de razonamiento sino en la disciplina de formato: todos los objetivos de entrenamiento terminan con un salto de linea antes del token de fin de texto, lo que elimina las expansiones desbocadas cuando la generacion se restringe a esa gramatica de lineas.

Se trata de un modelo especializado y no de un asistente general. Solo admite ingles, no soporta tool calling ni agentes, y su evaluacion se ha realizado exclusivamente dentro del pipeline completo de pyqmd con un reranker Qwen3 fijo, por lo que sus cifras no son comparables con benchmarks academicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoEHybrid (transformer hibrido con mezcla de expertos, segun el tag `granitemoehybrid` del modelo base) |
| Parametros totales | 1.631.750.144 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixed 4/6-bit (afin, group size 64; capas 6-bit siguiendo los criterios de `Q4_K_M` de llama.cpp: embedding atado y `v_proj`/`down_proj` en capas seleccionadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de `ibm-granite/granite-4.0-1b` en la revision `6a7381ba1f54d684ff508d991aeb7dc580157103`. Sobre esa base se aplico un fine-tune LoRA con rango 16, alpha 32, sobre todas las proyecciones de atencion y MLP, durante 5 epocas, con learning rate 2e-4 y schedule coseno, batch efectivo de 16, usando `mlx_lm.lora` en Apple Silicon. Los adaptadores se fusionaron en pesos bf16 y despues se cuantizaron con `mlx_lm.convert` (version 0.31.3) a precision mixta 4/6 bits.

Los datos de entrenamiento proceden del conjunto de expansion de qmd, en el commit `1fb2e2819e4024045203b4ea550ec793683baf2b` y con licencia MIT: 2.806 ejemplos de entrenamiento y 312 de validacion tras deduplicacion. La innovacion tecnica destacable no es arquitectonica sino de formato: cada objetivo de entrenamiento termina con un salto de linea antes del token de fin de texto, de modo que una generacion restringida a la gramatica de lineas (`hyde:`, `lex:`, `vec:`) termina limpiamente en lugar de continuar generando texto. El modelo se entreno con el mensaje de usuario desnudo, sin `/no_think` ni system message personalizado, ya que la plantilla de chat de Granite anade su propio texto de sistema por defecto.

## Capacidades

- Expansion de consultas de busqueda en tres lineas tipadas: `hyde:` (pasaje hipotetico que responderia a la consulta), `lex:` (variacion de palabras clave) y `vec:` (reformulacion en lenguaje natural).
- Generacion de texto condicionada a la plantilla de chat de Granite 4.0.
- Salida disciplinada bajo restriccion gramatical: cero expansiones desbocadas en la evaluacion (0 de 840 frente a 54 del modelo por defecto de pyqmd).
- Integracion directa con pyqmd mediante la variable de entorno `PYQMD_EXPAND_MODEL`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Solo ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Expansion de consultas en pyqmd: el modelo se invoca con `PYQMD_EXPAND_MODEL=after2400/qmd-query-expansion-granite-1b-mlx-mixed-4-6 pyqmd query "..."` y genera las tres lineas tipadas que el pipeline usa para recuperacion hibrida (densa, lexica e HyDE). Es su caso de uso nativo y el unico validado por el autor.
- Busqueda sobre literatura cientifica: en SciFact obtiene Recall@10 de 0,927, MRR de 0,828 y nDCG@10 de 0,840, superando al modelo por defecto de pyqmd, lo que lo hace adecuado para recuperacion de articulos academicos con consultas cortas.
- Entornos con requisito de cadena de suministro de pesos: equipos que necesiten que tanto el modelo de expansion como el de embeddings provengan de bases abiertas de empresas estadounidenses (Granite de IBM, embeddings de Google) pueden sustituir el fine-tune de Qwen3 por este sin cambiar el resto del pipeline.
- Despliegue local en Apple Silicon: con 1,0 GB de repositorio y cuantizacion 4/6 bits, cabe en portatiles y equipos de sobremesa con chip de Apple, sin GPU dedicada, para busqueda personal o prototipado offline.
- Generacion de variantes de consulta para evaluacion de sistemas de recuperacion: las tres salidas tipadas permiten construir conjuntos de expansion controlados y medir su efecto sobre recall y nDCG con reranker fijo.
- Indexacion y busqueda en documentacion tecnica o bases de conocimiento internas en ingles: el formato de salida restringido evita que la expansion contamine el pipeline con texto libre, aunque la evidencia empirica en dominios no cientificos es neutra (ConditionalQA, NFCorpus, CQADupStack-unix).

## Benchmarks y rendimiento

Evaluacion dentro del pipeline completo de pyqmd con reranker Qwen3 fijo, comparada con el modelo de expansion por defecto de pyqmd (un fine-tune de Qwen3-1.7B). 30 muestras con semilla por conjunto en SciFact y 10 / 5 en el resto.

| Corpus | Metrica | Qwen3-1.7B por defecto | Este modelo |
|---|---|---|---|
| SciFact (30 salts) | Recall@10 / MRR / nDCG@10 | 0,907 / 0,798 / 0,816 | 0,927 / 0,828 / 0,840 |
| SciFact | expansiones desbocadas (de 840) | 54 | 0 |
| ConditionalQA (nivel pagina) | MRR / nDCG@10 / Recall@10 | 0,597 / 0,632 / 0,756 | 0,594 / 0,630 / 0,758 |
| NFCorpus | nDCG@10 / MRR | 0,388 / 0,575 | 0,391 / 0,578 |
| CQADupStack-unix | nDCG@10 / MRR | 0,442 / 0,434 | 0,438 / 0,424 |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor indica que la expansion no aporto mejora en NFCorpus ni en CQADupStack-unix (la ausencia de expansion puntua igual) y que el modelo es aproximadamente un 17 % mas lento por expansion que el modelo por defecto basado en Qwen3 en la misma maquina.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,0 GB con cuantizacion mixta 4/6 bits, por lo que la huella de pesos ronda ese orden de magnitud.
- GPU recomendadas: el modelo es de libreria MLX, por lo que requiere Apple Silicon (CPU y GPU unificadas). No se ha validado en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente para 1,0 GB de pesos mas el overhead de MLX; no aplica a GPU dedicadas por la dependencia de MLX.
- Opciones de despliegue: `mlx_lm` (libreria declarada) y pyqmd. No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en valores absolutos; el autor solo reporta que es un 17 % mas lento por expansion que el modelo por defecto de pyqmd en la misma maquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento en SciFact (nDCG@10) |
|---|---|---|---|---|---|
| qmd-query-expansion-granite-1b-mlx-mixed-4-6 | 1.631.750.144 | no disponible | Apache 2.0 | Expansion de consultas, MLX 4/6 bits, solo ingles | 0,840 |
| Fine-tune de Qwen3-1.7B (por defecto en pyqmd) | no disponible (base Qwen3-1.7B) | no disponible | no disponible | Expansion de consultas, modelo por defecto de pyqmd | 0,816 |
| ibm-granite/granite-4.0-1b | no disponible | no disponible | Apache 2.0 | Modelo base generalista sin fine-tune de expansion | no disponible |

La comparativa se limita a los dos modelos de expansion que el autor evalua en el mismo pipeline. No se dispone de datos sobre alternativas externas de expansion de consultas con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo ingles: cualquier consulta en otro idioma queda fuera del alcance declarado del modelo.
- Modelo altamente especializado: no es un asistente general ni soporta tool calling, agentes o razonamiento multi-paso; usarlo fuera de la tarea de expansion de consultas producira resultados pobres.
- Dependencia de plataforma: requiere MLX y, por tanto, hardware Apple Silicon; no hay pesos GGUF ni soporte para stacks de inferencia habituales en servidores.
- Sensibilidad al prompt: no debe anadirse `/no_think` ni un system message personalizado, porque el modelo se entreno con el mensaje de usuario desnudo y la plantilla de Granite anade su propio texto de sistema.
- Rendimiento neutro fuera del dominio cientifico: en ConditionalQA, NFCorpus y CQADupStack-unix las diferencias frente al modelo por defecto estan dentro del ruido, y en los dos ultimos la expansion no aporta mejora alguna.
- Coste de latencia: aproximadamente un 17 % mas lento por expansion que el modelo por defecto de pyqmd en la misma maquina.
- Evaluacion limitada: las cifras provienen de un unico pipeline con reranker fijo y tamanos de muestra reducidos (10 y 5 muestras en varios conjuntos), sin benchmarks academicos independientes.
- Riesgo de alucinacion: no cuantificado por el autor; el modo HyDE genera pasajes hipoteticos que pueden introducir contenido no respaldado por el corpus, aunque el formato restringido limita las expansiones desbocadas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial; el autor exige atribucion a IBM Granite 4.0 (Apache 2.0) y a qmd y sus datos de entrenamiento de Tobi Lutke (MIT).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/after2400/qmd-query-expansion-granite-1b-mlx-mixed-4-6
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Repositorio pyqmd: https://github.com/after2400/pyqmd
- Repositorio qmd (datos de entrenamiento, MIT): https://github.com/tobi/qmd
