# c1cc10/slm-italiano

## Resumen

SLM-italiano es un modelo de lenguaje de tipo decoder-only transformer (arquitectura GPT-NeoX) desarrollado por el usuario c1cc10 y publicado en HuggingFace con licencia MIT. Se trata de un modelo pequeno, entrenado desde cero (from-scratch) sobre corpus en italiano, con el objetivo explicito de servir como herramienta educativa y como experimento sobre que es posible conseguir con recursos minimos: el autor lo describe como un instrumento para entender como funciona un LLM por dentro, no como una alternativa a modelos grandes.

El modelo tiene 12 capas, d_model de 512, 8 cabezas de atencion, d_ff de 2048 y una ventana de contexto maxima de 512 tokens, con codificacion posicional RoPE y tokenizador BPE SentencePiece de 16.000 tokens. El autor declara 45.997.056 parametros en la model card, mientras que los metadatos de safetensors del repositorio indican 54.214.656 parametros; el repositorio ocupa 0,3 GB y distribuye los pesos unicamente en formato GGUF.

Su relevancia actual es doble: por un lado, demuestra que es viable entrenar un modelo desde cero en un portatil Apple M2 de 8 GB; por otro, el checkpoint publicado (Run #4) alcanza una perplejidad de validacion de ~36 sobre Wikipedia en italiano, y el autor ya trabaja en un Run #5 con un corpus ampliado de 7,7 GB (918 M tokens objetivo) que incluye CulturaX y texto literario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | 45.997.056 segun la model card; 54.214.656 segun metadatos de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q8_0 y fp32 (ambas en GGUF) |
| Idiomas soportados | Italiano (it) |
| Licencia | MIT |
| Formato de pesos | GGUF (ficheros `slm-run4-q8_0.gguf` y `slm-run4.gguf`) |

Detalles adicionales de arquitectura declarados por el autor: 12 capas, d_model 512, 8 cabezas de atencion, d_ff 2048, codificacion posicional RoPE, tokenizador BPE SentencePiece con vocabulario de 16.000 tokens.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-NeoX, con 12 capas, dimension de modelo 512, 8 cabezas de atencion y dimension de feed-forward 2048. Usa Rotary Position Embedding (RoPE) para la codificacion posicional, una innovacion que segun el autor fue la principal diferencia entre el Run #3 y el Run #4: la introduccion de RoPE permitio bajar la val loss de 4,0768 (PPL ~59) a 3,5861 (PPL ~36) sobre el mismo corpus base. El tokenizador es BPE entrenado con SentencePiece sobre un vocabulario de 16.000 tokens, dimensionado para italiano.

El entrenamiento se hizo desde cero (from-scratch), inicialmente en un portatil Apple M2 de 8 GB. El checkpoint publicado corresponde al Run #4, en el paso 27.500 (el de mejor val loss de una carrera de 30.000 pasos), y se entreno en una GPU RTX 4090 alquilada via Vast.ai en 76 minutos. El corpus del Run #4 es Wikipedia en italiano (47,8 M tokens) con RoPE; no se menciona uso de RLHF, DPO ni instruction tuning. El Run #5, en curso, amplia el corpus a 7,7 GB con Wikipedia IT (208 M caracteres), CulturaX IT filtrado, un corpus literario de narrativa italiana contemporanea en EPUB y un corpus personal del autor, con un objetivo de 918 M tokens (Chinchilla-optimal). El filtrado de CulturaX se hizo con un umbral de perplejidad de 95 usando el checkpoint del Run #3 como juez, descartando documentos por encima de ese valor para evitar un sesgo excesivo hacia el registro de Wikipedia.

## Capacidades

- Generacion de texto en italiano con registro formal y enciclopedico, coherente a nivel de frase.
- Completado de texto (autocompletado de frases y parrafos cortos), no dialogo ni respuesta directa a preguntas.
- Generacion condicionada por prompt con control de temperatura y penalizacion de repeticion en llama.cpp.
- Capacidad multilingue: no disponible; el modelo esta entrenado exclusivamente en italiano.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Modo thinking, vision o audio: no soportado.
- Uso como modelo juez de perplejidad para filtrar corpus en italiano (funcion documentada en el propio flujo de trabajo del autor).

## Casos de uso

- Docencia y aprendizaje sobre LLM: al ser un modelo de 46 M de parametros entrenado desde cero con codigo fuente publico, permite inspeccionar cada componente (tokenizador, RoPE, atencion, bucle de entrenamiento) sin necesidad de infraestructura especial.
- Filtrado de corpus en italiano: el propio autor uso el checkpoint del Run #3 como juez de perplejidad para descartar documentos de CulturaX con PPL superior a 95; el modelo puede reutilizarse como filtro heuristico en pipelines de limpieza de datos.
- Pruebas de integracion y CI de pipelines llama.cpp: con 56 MB en Q8_0, se puede incluir en un contenedor de test para verificar que el flujo de carga, tokenizacion y generacion funciona antes de desplegar modelos mayores.
- Generacion de texto enciclopedico en italiano: redaccion o completado de parrafos descriptivos sobre temas generales, aprovechando que el entrenamiento se hizo principalmente sobre Wikipedia en italiano.
- Base para fine-tuning en tareas italianas especificas: al ser un modelo from-scratch con licencia MIT y arquitectura estandar compatible con llama.cpp, sirve como punto de partida para tareas concretas (clasificacion, resumen o completado de dominio) que requieran pocos recursos.
- Aplicaciones embebidas y edge: con un requisito de RAM de ~300 MB en Q8_0, puede ejecutarse en dispositivos con recursos muy limitados (Raspberry Pi, portatiles antiguos) para generacion de texto offline en italiano.
- Investigacion sobre tokenizacion BPE en italiano: el vocabulario de 16.000 tokens y el corpus controlado permiten estudiar el efecto del tamano de vocabulario en la calidad de generacion de una lengua con morfologia rica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son las metricas de validacion del propio entrenamiento:

| Run | Corpus | Tokens | Steps | Val loss | Perplejidad |
|---|---|---|---|---|---|
| Run #3 | Wikipedia IT | 47,8 M | 30.000 | 4,0768 | ~59 |
| Run #4 (este repositorio) | Wikipedia IT + RoPE | No especificado (mismo corpus base que el Run #3) | 30.000 | 3,5861 | ~36 |
| Run #5 | Wikipedia + CulturaX + literario | 918 M (objetivo) | En curso | No disponible | No disponible |

El checkpoint publicado corresponde al paso 27.500 del Run #4. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- RAM/VRAM para inferencia: ~300 MB con el archivo Q8_0 (`slm-run4-q8_0.gguf`, 56 MB en disco) y ~800 MB con el archivo fp32 (`slm-run4.gguf`, 207 MB en disco).
- GPU recomendadas: dado el tamano, cualquier GPU con al menos 1 GB de memoria libre es suficiente. El autor entreno el modelo en una RTX 4090 (76 minutos para el Run #4) y desarrollo el proyecto originalmente en un Apple M2 de 8 GB.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna e incluso en GPU integradas; tambien funciona en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), con soporte de descarga directa desde HuggingFace mediante `-hf`; al ser formato GGUF, es compatible con el ecosistema llama.cpp (y por extension con herramientas que lo envuelven). vLLM, TGI u Ollama: no documentado en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Parametros de generacion recomendados por el autor: `--temp 0.7–0.9`, `--repeat-penalty 1.1`, `--ctx-size 512`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparacion con modelos externos de la misma categoria queda como no disponible. La unica comparacion posible es interna, entre los distintos runs del mismo proyecto:

| Modelo / run | Parametros | Contexto | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM Run #4 (este repositorio) | 45.997.056 (model card) / 54.214.656 (safetensors) | 512 tokens | ~36 | MIT | GGUF en HuggingFace |
| SLM Run #3 | No disponible de forma independiente | 512 tokens (sin RoPE) | ~59 | MIT | Usado internamente como juez de PPL |
| SLM Run #5 | No disponible (objetivo 918 M tokens de entrenamiento) | No disponible | En curso | MIT | Pendiente de publicacion |

Comparativa con alternativas externas (otros modelos italianos pequenos o modelos from-scratch de tamano similar): no disponible.

## Limitaciones y advertencias

- Registro enciclopedico: el entrenamiento se hizo principalmente sobre Wikipedia en italiano, por lo que genera texto formal y no conversacional.
- 46 M de parametros: la coherencia se limita al nivel de frase; no mantiene coherencia en textos largos y carece de conocimiento profundo del mundo.
- Sin instruction tuning: el modelo genera completaciones, no responde a preguntas de forma directa. No debe esperarse comportamiento de asistente.
- Perplejidad ~36: el texto resultante es comprensible y gramaticalmente correcto, pero no alcanza la fluidez de modelos de 1.000 M de parametros o superiores.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo de este tamano entrenado sobre un corpus limitado.
- Contexto limitado a 512 tokens, lo que restringe cualquier tarea que requiera contexto largo.
- Idioma: unicamente italiano; no hay soporte declarado de otras lenguas.
- Discrepancia en el recuento de parametros: la model card indica 45.997.056 y los metadatos de safetensors del repositorio indican 54.214.656. Conviene verificar cual corresponde a los pesos publicados antes de integrarlo en produccion.
- Licencia MIT: permite uso comercial, pero el propio autor enmarca el modelo como herramienta didactica, no como componente de produccion.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, y el Run #5 esta en curso; el repositorio puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/c1cc10/slm-italiano
- Codigo fuente del proyecto (arquitectura, entrenamiento, herramientas de corpus y documentacion): https://github.com/c1cc10/slm
- llama.cpp (repositorio): https://github.com/ggerganov/llama.cpp
- Binarios precompilados de llama.cpp (releases): https://github.com/ggerganov/llama.cpp/releases
- Corpus CulturaX (mencionado en la model card, sin enlace directo): no disponible
- Plataforma Vast.ai usada para el entrenamiento del Run #4 (mencionada, sin enlace directo): no disponible
