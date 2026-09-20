# cmeister/boundary-markers-ru-d12-bnd_wpd_caps-bpe

## Resumen

Este repositorio contiene tres modelos de lenguaje en ruso entrenados con nanochat (semillas 0, 1 y 2) con el objetivo de comparar vocabularios de subpalabras que marcan explicitamente los limites de palabra. Forma parte del trabajo descrito en el articulo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister, arXiv:2608.08847), que reporta resultados en ingles; esta publicacion reproduce el montaje en ruso en septiembre de 2026. Los tres modelos son identicos en arquitectura, datos y orden de entrenamiento, y solo difieren en el tokenizador, de modo que las diferencias de perdida son atribuibles al esquema de tokenizacion.

El tokenizador de este repositorio, `bnd_wpd_caps`, es una variante BPE de 34.685 entradas que anade codigos de mayusculas: una palabra en capitalizacion de titulo se escribe como `<^>` seguida de su forma en minusculas, y una palabra en mayusculas como `<^^>`, siempre con el codigo fuera de las marcas de la palabra. El vocabulario del modelo es de 34.686 entradas (las anteriores mas un token de inicio de secuencia).

Se trata de un artefacto de investigacion, no de un modelo listo para produccion: la model card no publica recuento de parametros, no hay ajuste por instrucciones ni por preferencias, el contexto es de 2.048 tokens y la unica metrica reportada es la perdida de validacion en bits por byte sobre un shard reservado de Russian FineWeb-2. Su valor esta en poder reproducir y auditar comparaciones controladas de esquemas de tokenizacion, no en tareas generativas de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de nanochat (commit `92d63d4`), 12 capas, anchura 768, 6 cabezas de atencion, contexto 2.048 tokens |
| Parametros totales | no disponible (la model card no publica el recuento; la configuracion solo declara 12 capas, anchura 768 y 6 cabezas) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (se publican pesos en precision de entrenamiento como state dict de PyTorch; no hay variantes cuantizadas) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict `seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)`; tokenizador en JSON comprimido con gzip |
| Tamano del repositorio | 2,5 GB (tres semillas: pesos, configuracion, log de entrenamiento y archivo con sha256) |
| Vocabulario | 34.686 entradas (34.685 del tokenizador mas token de inicio de secuencia) |
| Tokenizador | BPE con marcadores explicitos de limite de palabra y codigos de mayusculas; fichero `tokenizer/fineweb_ru_5gb_quick_bnd_wpd_caps_bpe_v34685.json.gz`, sha256 `89e3efc529f7adb9b4eb0f433c798a811d4e26b95474a1514722fd1a4457b0f9` |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es la del proyecto nanochat de Karpathy en su commit `92d63d4`: un transformer decoder-only con 12 capas, anchura de 768, 6 cabezas de atencion y una ventana de contexto de 2.048 tokens. Los pesos finales se publican como state dict de PyTorch, junto con el `meta_002553.json` de configuracion del modelo y del entrenamiento. El entrenamiento se lanzo con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, con una GPU por modelo, durante 2.553 pasos de 524.288 tokens cada uno, lo que suma aproximadamente 1.340 millones de tokens procesados.

Los datos son 10 shards de Russian FineWeb-2 procedentes del release `fineweb-2_0_1-quality_10-filterrobots`, con 2.920 millones de caracteres leidos aproximadamente 3,35 veces. La semilla fija la inicializacion de pesos y el orden de los shards, y ese orden es identico para todos los tokenizadores de la comparacion, de forma que los modelos con la misma semilla son directamente comparables entre si. La model card no menciona ninguna fase de RLHF, DPO ni ajuste por instrucciones: es un preentrenamiento puro y controlado. La innovacion tecnica del trabajo es el propio esquema de tokenizacion, que hace explicitos los limites de palabra (y, en esta variante, la capitalizacion) mediante codigos dedicados, en lugar de dejar que BPE los infiera de forma implicita.

## Capacidades

- Modelado de lenguaje autoregresivo en ruso: al ser un modelo preentrenado sin ajuste, su capacidad fiable es la continuacion de texto y la estimacion de probabilidad de secuencias rusas.
- Evaluacion comparativa de tokenizadores: esta es su funcion principal; permite medir el efecto de un esquema de marcadores de limite sobre la perdida en bits por byte con el resto de variables fijadas.
- Manejo de marcadores explicitos de limite de palabra y de codigos de capitalizacion (`<^>` y `<^^>`), siempre que se use el tokenizador propio con el codigo de script_tok.
- Procesamiento de texto en cirilico con el preprocesado del pipeline de FineWeb-2; los codigos de capitalizacion no se activan en escrituras sin distincion de mayusculas, segun la model card.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo y el tokenizador estan entrenados unicamente con texto ruso.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre tokenizacion de subpalabras: reproducir la comparacion entre el esquema `bnd_wpd_caps`, el esquema `bnd_wpd` y el tokenizador `plain` manteniendo fija la semilla, para aislar el efecto de los marcadores de limite en ruso.
- Ablacion controlada de preprocesado: usar los tres pares de modelos con la misma semilla para medir cuanto cambia la perdida por byte al introducir codigos de capitalizacion, con un coste de entrenamiento de unos 1.340 millones de tokens por modelo.
- Referencia de perdida en bits por byte para ruso: servir de linea base publica (0,542 en el shard de validacion) al evaluar tokenizadores nuevos sobre Russian FineWeb-2 u otros corpus rusos con la misma metodologia.
- Prototipado de modelos pequenos en una sola GPU: permite iterar en un unico acelerador sobre arquitecturas decoder-only y vocabularios alternativos sin presupuesto de computo elevado.
- Ensenanza y formacion: el par modelo mas log de entrenamiento mas script de lanzamiento es util para explicar el ciclo completo de preentrenamiento y el impacto de las decisiones de vocabulario en la perdida.
- Analisis de corpus rusos mediante verosimilitud: calcular bits por byte o perplejidad por documento para detectar dominios o registros infrarepresentados en FineWeb-2, dado que el modelo es sensible al texto de ese release.
- Pruebas de integracion de tokenizadores personalizados: validar el pipeline de carga de vocabularios con marcadores explicitos antes de escalarlo a modelos mayores, ya que requiere el codigo de script_tok y no un tokenizador estandar de HuggingFace.

## Benchmarks y rendimiento

La unica metrica publicada es la perdida de validacion en bits por byte (BPB): suma de la perdida sobre un shard reservado de Russian FineWeb-2 dividida por la longitud real en UTF-8 del texto puntuado. Menos es mejor y los valores solo son comparables dentro de un mismo idioma.

| Semilla | Este modelo (BPB) | `plain` menos este modelo |
|---|---|---|
| 0 | 0,54230 | +0,00743 |
| 1 | 0,54228 | +0,00845 |
| 2 | 0,54213 | +0,00836 |

Diferencia media: +0,00808; desviacion tipica entre semillas: 0,00056. Una diferencia positiva indica que este esquema puntuo mas bajo (mejor) que `plain`. El propio autor advierte que tres semillas dan una direccion, no una estimacion precisa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no publicada. A partir de la configuracion declarada (12 capas, anchura 768, vocabulario de 34.686), el orden de magnitud es de 85 a 115 millones de parametros, es decir unos 0,35 a 0,45 GB en fp32 y aproximadamente la mitad en fp16; es una estimacion derivada, no una cifra confirmada por el autor.
- GPU recomendadas: no disponible. El autor indica que entreno cada modelo en una GPU, sin especificar el modelo de GPU.
- GPU de consumo: por la estimacion anterior, cualquiera con mas de 1 GB de VRAM libre deberia bastar para inferencia en fp32 o fp16, incluidas gamas de entrada tipo RTX 3060 o superiores; no hay confirmacion oficial.
- Opciones de despliegue: entrenamiento e inferencia mediante el codigo de nanochat (PyTorch); la carga del tokenizador requiere clonar `sanderland/script_tok` y usar `BoundaryBPETokenizer`. No se publican pesos en GGUF ni integraciones oficiales con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El estudio disena la comparacion de forma interna: dentro de un idioma, los modelos solo se diferencian en el tokenizador, de modo que las alternativas naturales son las otras variantes de la misma familia (esquema `bnd_wpd` y esquema `plain`, con las mismas semillas 0, 1 y 2). Sus especificaciones (parametros, contexto, licencia y disponibilidad) no se detallan en la informacion disponible.

| Alternativa | Parametros | Contexto | Rendimiento (BPB en validacion) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd_caps`, 12 capas) | no disponible | 2.048 | 0,54230 / 0,54228 / 0,54213 | apache-2.0 | pesos en este repositorio (2,5 GB, tres semillas) |
| Variante `plain` (misma arquitectura y datos) | no disponible | 2.048 | superior en +0,00743 / +0,00845 / +0,00836 BPB respecto a este modelo | no disponible | referenciada en la model card; repositorio no indicado |
| Otras variantes de esquema, entrenadores e idiomas del estudio | no disponible | no disponible | no disponible (el comparativo completo esta en el repositorio script_tok) | no disponible | repositorio script_tok |

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos externos comparables (por ejemplo, modelos rusos pequenos de proposito general) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin ajuste por instrucciones ni por preferencias: no cabe esperar un comportamiento de asistente conversacional ni seguimiento fiable de instrucciones.
- Entrenamiento de solo 1.340 millones de tokens: el conocimiento factico sobre ruso sera muy limitado y el riesgo de alucinacion en tareas de respuesta factual es alto.
- Contexto maximo de 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Monolingue en ruso: no hay evidencia de capacidad en otros idiomas, ni siquiera en los que comparten alfabeto cirilico.
- Dependencia de codigo externo: el tokenizador con marcadores explicitos no es un tokenizador estandar de HuggingFace y necesita el repositorio `script_tok` para cargarse; no hay pesos en GGUF ni soporte en los runners habituales.
- Sesgos heredados del corpus: los datos provienen del release `fineweb-2_0_1-quality_10-filterrobots`, con los filtros y sesgos de dominio, registro y demografia que ese pipeline introduce.
- Riesgo de conclusiones prematuras: la comparacion publicada se apoya en tres semillas y el propio autor indica que solo establece una direccion, con una desviacion tipica de 0,00056 y una diferencia media de +0,00808 BPB; los valores de BPB solo son comparables dentro del mismo idioma.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la propia naturaleza del artefacto (modelo base de investigacion, sin garantias ni evaluaciones de seguridad) lo hace inadecuado para despliegues en produccion sin validacion adicional.
- Los ficheros se publican como state dict de PyTorch; el autor indica usar `torch.load(..., weights_only=True)`, precaucion relevante si se descargan pesos de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-bnd_wpd_caps-bpe
- Articulo referenciado (etiqueta del repositorio): arXiv:2608.08847, "Explicit Boundary Markers for Subword Vocabularies", Sander Land y Clara Meister, https://arxiv.org/abs/2608.08847
- Repositorio del tokenizador y de los experimentos: https://github.com/sanderland/script_tok
- nanochat (codigo de arquitectura y entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Dataset de entrenamiento: release `fineweb-2_0_1-quality_10-filterrobots` de FineWeb-2; la informacion disponible no incluye una URL directa.
- Resultados de la busqueda web: todas las entradas devueltas tratan sobre la zona horaria Pacific Standard Time (timeanddate.com, time.now, Wikipedia, time.is, 24timezones.com) y no guardan relacion con el modelo, por lo que no se incluyen.
