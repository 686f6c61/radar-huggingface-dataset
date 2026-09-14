# AmauryLC/Ys-17M

## Resumen

Ys-17M es un modelo de lenguaje de tipo causal, decoder-only y arquitectura transformer estilo GPT, desarrollado por AmauryLC y publicado en Hugging Face. Se trata de un modelo pequeno de 17.135.616 parametros, entrenado desde cero (inicializacion aleatoria, sin partir de pesos preentrenados) sobre 500 millones de tokens de texto en frances. Su proposito declarado es educativo y de laboratorio: servir como banco de pruebas para estudiar la prediccion del siguiente token, el efecto de la composicion del dataset y la evolucion de las metricas durante el entrenamiento.

El modelo emplea 6 capas, 6 cabezas de atencion, dimension oculta de 384 y dimension de la MLP de 1.536, con embeddings de entrada y de salida compartidos (weight tying). La ventana de contexto es de solo 512 tokens y utiliza embeddings posicionales aprendidos, Pre-LayerNorm y activacion GELU. El tokenizer es un BPE ByteLevel con vocabulario de 16.384 tokens, entrenado de forma independiente sobre 5 millones de caracteres de los mismos corpus.

Es relevante ahora como ejemplo reproducible y transparente de entrenamiento desde cero en un unico GPU, con toda la configuracion, el codigo de arquitectura y el script de generacion publicados en el repositorio. No es un modelo de instrucciones ni de dialogo: es un modelo base de completado de texto, con generaciones que el propio autor califica de experimentales y potencialmente repetitivas, incoherentes o factualmente incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT, solo decodificador |
| Parametros totales | 17.135.616 (con pesos de entrada y salida compartidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (checkpoint publicado en FP32; no se documentan versiones cuantizadas) |
| Idiomas soportados | Frances (fr) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch personalizado (`best.pt`), tensores FP32, aproximadamente 68,6 MB; no carga directamente con `AutoModelForCausalLM.from_pretrained()` ni con `pipeline()` de Transformers |
| Capas / cabezas de atencion | 6 / 6 |
| Dimension oculta / MLP | 384 / 1.536 |
| Posiciones | Embeddings posicionales aprendidos |
| Normalizacion / activacion | Pre-LayerNorm / GELU |
| Tokenizer | BPE ByteLevel, vocabulario de 16.384 tokens |
| Tokens de entrenamiento | 500.000.000 |
| Checkpoint publicado | `best.pt`, paso 30.520, a 500.000.000 tokens |
| Tokens especiales | `<|pad|>` (0), `<|bos|>` (1), `<|eos|>` (2), `<|unk|>` (3) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal clasico de solo decodificador: 6 bloques con atencion multi-cabeza de 6 cabezas, dimension oculta de 384 y una MLP de 1.536 unidades, normalizacion Pre-LayerNorm y activacion GELU. El modelo comparte los pesos del embedding de entrada con la proyeccion de salida (weight tying), lo que reduce el recuento de parametros hasta los 17.135.616. La posicion se codifica mediante embeddings posicionales aprendidos y la ventana de contexto esta limitada a 512 tokens. No se emplean innovaciones como atencion lineal, decodificacion especulativa ni arquitecturas hibridas SSM: es una implementacion deliberadamente sencilla y didactica.

El preentrenamiento uso 500 millones de tokens en frances procedentes de tres fuentes: FineWeb2 (`fra_Latn`, 75 %, 375.000.064 tokens), Wikipedia (`20231101.fr`, 20 %, 100.000.000 tokens) y French-PD-Books (`default`, 5 %, 24.999.936 tokens). El objetivo fue prediccion del siguiente token con entropia cruzada. El entrenamiento se dividio en tres fases con prolongacion del mismo modelo y conservacion del estado de aprendizaje (0-100M, 100-300M y 300-500M tokens), con warmups de 2M, 4M y 4M tokens respectivamente; la tasa maxima registrada fue 0,0006 con decaimiento coseno hasta 0,00006 en cada fase. Se uso AdamW con betas (0,9, 0,95), micro-lote de 4 secuencias, acumulacion de gradientes de 8 micro-lotes (16.384 tokens por actualizacion completa), weight decay 0,1, dropout 0,1 y recorte de la norma del gradiente en 1,0. No se documenta ninguna fase de RLHF, DPO ni ajuste por instrucciones. El pipeline descarta documentos de menos de 80 caracteres y mezcla los documentos en un bucle acotado, tratando los textos largos por pasajes con continuidad.

## Capacidades

- Generacion de texto en frances mediante completado autoregresivo del siguiente token.
- Continuacion de prompts literarios o narrativos (por ejemplo, "Il était une fois"), que es el caso de uso previsto por el autor.
- Modelado de lenguaje puro: util para experimentos de perplejidad y analisis de la influencia de los datos de entrenamiento.
- Generacion con decodificacion configurable: temperatura, `top_k`, `top_p` y decodificacion glotona (`temperature=0`), con semilla por defecto de 42.
- Ejecucion en CPU o CUDA, seleccionando el dispositivo automaticamente.
- No soporta tool calling ni function calling: no se ha entrenado para ello ni se documenta ningun formato de herramientas.
- No soporta agentes ni razonamiento multi-paso: es un modelo base sin ajuste por instrucciones.
- Sin capacidades multilingues mas alla del frances: la unica lengua documentada es el frances.
- Sin modo de razonamiento (thinking mode), sin vision, sin audio y sin otras modalidades.

## Casos de uso

- Experimentacion educativa sobre entrenamiento de LLM: el repositorio incluye el codigo de arquitectura (`model.py`), la configuracion completa (`config.json`) y el script de generacion (`generate.py`), lo que permite reproducir el ciclo completo de carga, inferencia y estudio de la prediccion del siguiente token en un unico equipo.
- Analisis de la influencia de la composicion del dataset: las proporciones exactas de FineWeb2, Wikipedia y French-PD-Books, junto con el recuento de tokens efectivamente aprendidos por fuente, permiten estudiar como cada corpus afecta al estilo y al vocabulario generado.
- Estudio de tokenizers en frances: el tokenizer BPE ByteLevel de 16.384 tokens, entrenado sobre 5 millones de caracteres con procedencia documentada, sirve como caso de analisis de segmentacion y cobertura lexica en frances.
- Completado de texto frances de dominio general: con su ventana de 512 tokens puede continuar parrafos cortos, descripciones o fragmentos narrativos en tareas de demostracion, siempre con supervision humana por su tendencia a la repeticion.
- Generacion de texto en entornos sin GPU: al ocupar aproximadamente 68,6 MB en FP32 y requerir solo PyTorch y Tokenizers, el modelo se ejecuta en CPU en portatiles o maquinas modestas, util para talleres y aulas.
- Referencia base para ablaciones y comparativas a pequena escala: sirve como linea base de 17M parametros en frances frente a la que medir variantes de arquitectura, tokenizer o regimen de entrenamiento con presupuesto de computo bajo.
- Pruebas de pipelines de generacion propios: al no ser compatible con las clases estandar de Transformers, obliga a integrar el checkpoint personalizado mediante su propio codigo, lo que resulta util para validar flujos de carga y serializacion a medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica cuantitativa de evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (el checkpoint pesa aproximadamente 68,6 MB, mas el vocabulario y los estados de activacion de una ventana de 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente; el modelo no necesita A100, H100 ni tarjetas de gama alta. Una RTX 4090 queda enormemente sobredimensionada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: soportada y verificada; el script `generate.py` selecciona CUDA si esta disponible y, en caso contrario, CPU, con la opcion de forzar `--device cpu`.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ya que el checkpoint usa una implementacion PyTorch propia y no se carga con las clases estandar de Transformers. El despliegue previsto es la ejecucion local del script `generate.py` con PyTorch 2.10.0 y Tokenizers 0.22.2 sobre Python 3.12.2.
- Latencia y throughput estimados: no disponible. El autor indica que la salida puede variar segun el hardware y las versiones de las bibliotecas.

## Comparativa con modelos similares

No existen comparaciones publicadas de Ys-17M frente a otros modelos, y no se dispone de datos de rendimiento del modelo. La siguiente tabla recoge unicamente caracteristicas publicas de alternativas de tamano comparable, sin resultados de benchmarks comparativos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ys-17M | 17.135.616 | 512 tokens | Frances | No disponible | Checkpoint PyTorch personalizado, 0 descargas, 0 likes |
| GPT-2 small | 124M | 1.024 tokens | Ingles | MIT (segun publicacion original) | Pesos ampliamente distribuidos y compatibles con Transformers |
| SmolLM2-135M | 135M | 2.048 tokens | Principalmente ingles | Apache 2.0 (segun su model card) | Pesos en safetensors, integrado en el ecosistema Transformers |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Multilingue | Apache 2.0 (segun su model card) | Pesos en safetensors, soporte en vLLM y otras herramientas |

Nota: los datos de contexto, licencia y parametros de los modelos alternativos son valores publicos de referencia y pueden variar entre revisiones; no se dispone de evaluaciones cotejadas con Ys-17M.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones ni para dialogo: no responde a ordenes, no sigue consignas y no mantiene conversaciones.
- Generaciones experimentales: el propio autor advierte de que pueden ser repetitivas, incoherentes o factualmente falsas.
- Alta propension a la alucinacion y a la deriva tematica, esperable en un modelo de 17M parametros entrenado con 500M tokens.
- Contexto muy limitado (512 tokens), lo que restringe tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica reducida al frances; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- Licencia no disponible: no se especifican condiciones de uso comercial, redistribucion ni atribucion, por lo que no es recomendable su uso en produccion sin aclaracion previa del autor.
- Incompatibilidad con la API estandar de Transformers: requiere cargar el checkpoint con el codigo propio del repositorio, lo que complica su integracion en pipelines habituales.
- Ausencia total de benchmarks publicados: no es posible evaluar su calidad de forma objetiva frente a alternativas.
- Trazabilidad y mantenimiento limitados: 0 descargas y 0 likes en el momento de la consulta, y sin senales de soporte comunitario.
- No dispone de capacidades de tool calling, agentes, vision, audio ni modo de razonamiento.
- Los resultados de generacion pueden variar entre ejecuciones por diferencias de hardware y de versiones de las bibliotecas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmauryLC/Ys-17M
- Configuracion de la arquitectura y del entrenamiento: https://huggingface.co/AmauryLC/Ys-17M/blob/main/config.json
- Codigo de la arquitectura: https://huggingface.co/AmauryLC/Ys-17M/blob/main/model.py
- Script de generacion: https://huggingface.co/AmauryLC/Ys-17M/blob/main/generate.py
- Metadatos del tokenizer: https://huggingface.co/AmauryLC/Ys-17M/blob/main/tokenizer_metadata.json
- Perfil del autor: https://huggingface.co/AmauryLC
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia (20231101.fr): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset French-PD-Books: https://huggingface.co/datasets/PleIAs/French-PD-Books

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre su autor; los resultados obtenidos eran contenidos no relacionados con inteligencia artificial. No se han localizado papers, blogs tecnicos, demos ni repositorios adicionales.
