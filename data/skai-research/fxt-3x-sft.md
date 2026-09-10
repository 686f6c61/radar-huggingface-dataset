# skai-research/fxt-3x-sft

## Resumen

`fxt-3x-sft` es un punto de control de 373.882.945 parámetros (aproximadamente 374 millones) publicado por skai-research. Se trata del resultado de aplicar ajuste supervisado (SFT) sobre el modelo base `skai-research/fxt-3x-base`, empleando la mezcla de instrucciones `allenai/tulu-3-sft-mixture` durante 5 épocas, con tamaño de lote 16 y semilla 42. Acompana al artículo "Dynamic Multi-Byte Prediction With Hierarchical Language Models" (arXiv:2608.15454), cuyos autores son Owodunni, Okocha, Grant, Limisiewicz y Kumar.

La particularidad del modelo es que no utiliza un tokenizador BPE o unigram convencional: es un modelo de lenguaje jerárquico que opera directamente sobre bytes, con un vocabulario de 261 entradas (256 bytes más `<pad>`, `</s>`, `<unk>`, `<en>` y `<eot>`) y una ventana de contexto de 4096 bytes. La configuración declarada es `model_config = [2, (16,), 4, 0]` con `attn_type = None`, lo que lo aleja de una arquitectura transformer estándar y lo enmarca en la línea de investigación de predicción multibyte dinámica.

Su relevancia actual es fundamentalmente académica: sirve como referencia reproducible para estudiar alternativas al tokenizador fijo, medir el rendimiento de modelos byte-level jerárquicos y evaluar la relación entre bytes y tokens latentes (3,34 bytes por token latente en este checkpoint). No es un modelo orientado a producción: la propia model card marca `inference: false`, no es una arquitectura `transformers` y requiere el código del repositorio del artículo para cargarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje jerárquico byte-level, sin tokenizador (hierarchical language model) |
| Parámetros totales | 373.882.945 (~374 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 bytes |
| Tipos de cuantización | no disponible (los pesos se publican en fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario | 261 entradas: 256 bytes + `<pad>`, `</s>`, `<unk>`, `<en>`, `<eot>` |
| Configuración del modelo | `model_config = [2, (16,), 4, 0]`, `attn_type = None` |
| Precisión | fp32 |
| Tamaño del repositorio | 1,5 GB |
| Modelo base | `skai-research/fxt-3x-base` |
| Pipeline declarado | no disponible (la model card indica `inference: false`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia descrita en "Dynamic Multi-Byte Prediction With Hierarchical Language Models". Frente a los transformers convencionales, aquí no se declara un tipo de atención estándar (`attn_type = None`) y la entrada se procesa a nivel de byte, con una jerarquía interna parametrizada por `model_config = [2, (16,), 4, 0]`. El vocabulario mínimo de 261 símbolos implica que no existe un vocabulario aprendido de subpalabras: el modelo segmenta y agrupa bytes de forma dinámica, de modo que la noción de "token latente" es interna y variable. Según los datos publicados, cada token latente agrupa de media 3,34 bytes.

El entrenamiento consta de dos fases. Primero, un preentrenamiento sobre `FineWeb-Edu` `sample-100BT`, el subconjunto de 100 000 millones de tokens del corpus educativo de HuggingFace. Después, un ajuste supervisado sobre `allenai/tulu-3-sft-mixture` durante 5 épocas (lote de 16, semilla 42), con la configuración `configs/train/modern_fxt_priors_0.3_en_lambda_3_fxt_vanilla_256_scale_bp.yaml`. La model card no documenta uso de RLHF ni de DPO, ni detalla la composición interna del dataset de SFT más allá de su nombre.

## Capacidades

- Generación de texto en inglés y respuesta a instrucciones en formato de chat, heredadas del ajuste sobre Tulu.
- Procesamiento a nivel de byte: al no depender de un tokenizador, la entrada se maneja como secuencia de bytes, lo que en teoría permite codificar cualquier cadena UTF-8 sin tokens fuera de vocabulario.
- Segmentación dinámica aprendida: la utilidad `--show_tokenization` del repositorio permite inspeccionar las fronteras de segmento que el modelo aprende.
- Modo de decodificación con caché (`--mode cached`), pensado para generación autorregresiva eficiente dentro de la ventana de 4096 bytes.
- Capacidades multilingües: no documentadas; el único idioma declarado es el inglés, aunque el vocabulario de bytes no impone una restricción formal de idioma.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Visión, audio, modo "thinking" u otras capacidades especiales: no documentadas.

## Casos de uso

- Reproducción de resultados de investigación: cargar el checkpoint con `src/eval/model_loader.py` del repositorio `lca-multibyte` y verificar la pérdida de test en Tulu (2,997) y la ratio de 3,34 bytes por token latente. Es el uso principal del modelo.
- Estudio de tokenización libre: comparar la segmentación aprendida frente a tokenizadores BPE o unigram en corpus ingleses, usando `--show_tokenization` para volcar las fronteras de segmento y analizar su estabilidad.
- Experimentos sobre idiomas con tokenizadores pobres: como la entrada es de bytes, el modelo permite medir si una arquitectura byte-level jerárquica reduce la fragmentación en idiomas con cobertura limitada en vocabularis de subpalabras. Requiere validación empírica, ya que solo se ha ajustado en inglés.
- Evaluación de robustez ante ruido byte-level: introducir erratas, caracteres Unicode poco frecuentes o secuencias de control y medir la degradación de la pérdida, aprovechando que no existe un paso de tokenización que normalice la entrada.
- Prototipado de chat en inglés de bajo coste: con 374 M de parámetros en fp32 (aproximadamente 1,5 GB de pesos), cabe en GPU de consumo y sirve para demos locales siempre que se asuma la ausencia de soporte en frameworks estándar.
- Base para ajuste fino adicional en dominio: al ser un checkpoint SFT sobre un modelo base público y con licencia Apache-2.0, se puede continuar el entrenamiento en dominios concretos para estudiar cómo se comporta la segmentación dinámica al especializarse.
- Docencia y ablaciones de arquitectura: su tamano reducido y su naturaleza no transformer lo hacen util para ilustrar alternativas al paradigma encoder-decoder/decoder-only clásico en cursos de PLN.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Pérdida de test en Tulu | 2,997 |
| Bytes por token latente | 3,34 |

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni comparativas estándar). La propia model card advierte que la pérdida reportada se calcula sobre respuestas formateadas como chat de Tulu y, por tanto, no es comparable con el BPC de preentrenamiento del modelo base.

## Requisitos de hardware

- Pesos en fp32: 373.882.945 parámetros × 4 bytes ≈ 1,49 GB, coherente con el tamano de repositorio de 1,5 GB.
- VRAM estimada para inferencia: en el entorno de 2-4 GB con lote 1 y contexto completo de 4096 bytes, sumando pesos, activaciones y caché. Es una estimación a partir del tamano de los pesos, no un dato publicado.
- Cuantizaciones: no disponibles. No se han publicado versiones GGUF, AWQ, GPTQ ni int8/int4, y la model card solo menciona fp32.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. El cargador de referencia usa `device="cuda"`. Modelos como GTX 1650 4 GB, RTX 3050, RTX 4060 o superiores son suficientes; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, con margen amplio, siempre que se use el código del repositorio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no son compatibles, ya que el modelo no implementa una arquitectura `transformers` y la model card declara `inference: false`. El único camino documentado es clonar `skai-research/lca-multibyte`, ejecutar `uv sync` y usar `load_fxt_model` o `src/eval/generate.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fxt-3x-sft` | 373.882.945 (~374 M) | 4096 bytes | Apache-2.0 | Safetensors, requiere código propio |
| `fxt-3x-base` | no disponible | no disponible | no disponible | Modelo base de la misma familia |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de modelos alternativos comparables (ni de otras propuestas byte-level, ni de transformers de tamano similar) en la información disponible, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- No es un modelo de producción: la model card indica explícitamente `inference: false` y no implementa una arquitectura `transformers`. Sin el repositorio `lca-multibyte` el checkpoint no se puede cargar.
- Idiomas: solo se declara inglés. Aunque la entrada sea de bytes, no hay evidencia publicada de calidad en otros idiomas y el ajuste SFT se ha hecho sobre una mezcla predominantemente inglesa.
- Contexto muy corto: 4096 bytes equivalen aproximadamente a 1226 tokens latentes aplicando la ratio publicada de 3,34 bytes por token latente. Es un margen reducido para conversaciones largas o documentos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad, factualidad ni tasas de alucinación. Con 374 M de parámetros en un ajuste SFT de 5 épocas, el riesgo esperable es alto.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad ni evaluación de seguridad.
- Ausencia de capacidades de agente: no hay soporte documentado de tool calling, function calling ni razonamiento multi-paso, lo que descarta su uso en pipelines de agentes tal cual.
- Licencia: el código y los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero conviene verificar las licencias del modelo base (`fxt-3x-base`) y de los datasets empleados (`FineWeb-Edu` y `allenai/tulu-3-sft-mixture`) antes de un despliegue comercial.
- Rendimiento no verificado: no existen benchmarks estándar publicados; la única métrica disponible es una pérdida de test en Tulu que no es comparable con otras familias.
- Madurez: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y las herramientas de despliegue habituales no lo soportan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skai-research/fxt-3x-sft
- Modelo base: https://huggingface.co/skai-research/fxt-3x-base
- Artículo: https://arxiv.org/abs/2608.15454
- Repositorio de código: https://github.com/skai-research/lca-multibyte
- Dataset de ajuste: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a tutoriales de gestión de discos en Windows y se han descartado por no guardar relación con la ficha.
