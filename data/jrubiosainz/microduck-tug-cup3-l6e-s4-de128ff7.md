# jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7

## Resumen

`microduck-tug-cup3-l6e-s4-de128ff7` es un artefacto publicado en Hugging Face por el usuario `jrubiosainz` bajo el identificador de un modelo derivado de la familia "Tug" (variante L6e, semilla 4). Segun la model card, se trata de una politica de simulacion (no un modelo de lenguaje) cuyo proposito es participar en el entorno competitivo "Cup3", presumiblemente un torneo o benchmark de agentes simulados. El unico dato tecnico verificable es el hash SHA-256 de la politica exacta (`de128ff7...`) y el tamano del binario (1.003.410 bytes), lo que sugiere un artefacto compacto, probablemente una tabla de decision o un conjunto de pesos muy reducido.

La publicacion no incluye informacion sobre arquitectura, parametros, contexto ni idiomas; el tag `onnx` indica que el artefacto esta empaquetado en formato ONNX, pero no se especifica el grafo ni las operaciones. La model card menciona que hereda el controlador D7/L1 hasta `d` y `L5`, y que solo cambian las tablas de lookup de rating, lo que apunta a un sistema de evaluacion basado en tablas mas que a una red neuronal profunda.

El modelo es relevante unicamente en el contexto del ecosistema "Tug/Cup3" y de la reproducibilidad de politicas de simulacion: incluye una recepcion de replay (`x86-replay-receipt.json`) con cinco semillas y una puntuacion medida local de 168.90528321266174 en un runner x86. No se ha publicado ningun resultado oficial de Arena ni de benchmarks estandar, y el autor advierte explicitamente que no se reclama equivalencia universal ni licencia blanket.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de simulacion; posible tabla de lookup heredada de D7/L1) |
| Parametros totales | no disponible (binario de 1.003.410 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica "No blanket licence is asserted") |
| Formato de pesos | ONNX (tag `onnx`); recepcion de replay en JSON |

## Arquitectura y entrenamiento

La model card describe una politica de simulacion que hereda el controlador D7/L1 "through d and L5", modificando unicamente las tablas de lookup de rating. No se especifica si el artefacto contiene una red neuronal, un arbol de decision o una tabla estatica; el tamano de ~1 MB y el tag ONNX son compatibles con un grafo pequeno o con pesos de baja dimensionalidad, pero no permiten confirmar la arquitectura. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de RLHF/DPO.

El autor menciona que la semilla 4 refleja "our refinement" y que la semilla 5 acredita las filas `nov18-v2` fijadas por HlibPlakhtii, lo que sugiere un proceso de refinamiento iterativo sobre tablas de rating mas que un entrenamiento supervisado convencional. Se incluye una atribucion upstream retenida y un aviso NOTICE, pero no se detalla el mecanismo de optimizacion ni la funcion de recompensa.

## Capacidades

- Ejecucion de una politica de simulacion determinista identificada por hash SHA-256 (`de128ff7...`).
- Participacion en el entorno "Cup3" (torneo o benchmark de agentes simulados), segun la model card.
- Replay reproducible en x86 nativo y QEMU, con resultados que el autor afirma coincidentes.
- Puntuacion local medida en runner-5: 168.90528321266174 (`0x1.51cf814800000p+7`), con cinco `pit_won`, 347/347 hits y sin fallback.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes multi-step ni multilingues.

## Casos de uso

- Reproduccion de resultados en el entorno Cup3: el artefacto incluye `x86-replay-receipt.json` con un vector de cinco semillas, lo que permite verificar la puntuacion local en un runner x86 y comparar con ejecuciones en QEMU.
- Auditoria de politicas de simulacion: el hash SHA-256 de la politica exacta permite comprobar que el binario ejecutado coincide con el publicado, util en pipelines de validacion.
- Investigacion sobre herencia de controladores: la card indica que se hereda D7/L1 hasta `d` y `L5` y solo cambian las tablas de rating, lo que facilita estudios de ablation sobre dichas tablas.
- Integracion en entornos de torneo simulados: el tag ONNX permite cargar el artefacto en runtimes compatibles (ONNX Runtime) para ejecutar la politica en un bucle de simulacion.
- Comparacion de semillas: las semillas 4 y 5 documentadas permiten contrastar el refinamiento propio frente a las filas `nov18-v2` de HlibPlakhtii.
- Docencia o divulgacion sobre reproducibilidad: el par binario + receipt JSON sirve como ejemplo de empaquetado reproducible de una politica de simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico es la puntuacion local medida en runner-5 (168.90528321266174) con cinco `pit_won`, 347/347 hits y sin fallback, que el autor califica explicitamente como no oficial y no equivalente a un resultado de Arena.

| Metrica | Valor | Contexto |
|---|---|---|
| Puntuacion local runner-5 | 168.90528321266174 | Medida local x86, no oficial |
| `pit_won` | 5 | Cinco semillas |
| Hits | 347/347 | Sin fallback |
| Coincidencia nativo/QEMU | Si (segun autor) | No verificado de forma independiente |

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto ocupa ~1 MB, por lo que la inferencia no requiere GPU dedicada en principio.
- GPU recomendadas: no disponible; al ser un artefacto ONNX de ~1 MB, es probable que cualquier CPU x86 moderna sea suficiente, pero no se documenta.
- Cabe en consumer GPU: si, por tamano, aunque no se especifican requisitos ni compatibilidad de operadores ONNX.
- Opciones de despliegue: ONNX Runtime (por el tag `onnx`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la informacion proporcionada; la unica referencia es la herencia del controlador D7/L1 y las filas `nov18-v2` de HlibPlakhtii, sin datos publicos de parametros, contexto ni rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card advierte que es "simulation only": no debe interpretarse como un modelo de lenguaje ni como un sistema de proposito general.
- El autor indica explicitamente que no se reclama equivalencia universal, H2H ni resultado de torneo; la entrada en Cup3 es "provisional" y requiere autorizacion y envio separados.
- No se afirma ninguna licencia blanket ("No blanket licence is asserted"), por lo que el uso comercial queda sin autorizacion explicita.
- No hay informacion sobre sesgos, alucinacion o limitaciones de contexto porque no se documentan capacidades generativas.
- La puntuacion local (168.905...) no es un resultado oficial de Arena y no debe citarse como tal.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB reportado, lo que sugiere que el artefacto puede no estar completamente subido o que el peso real es inferior al binario citado; conviene verificar los ficheros antes de usarlo.
- La fecha de creacion (2026-11-18) es futura respecto a la mayoria de referencias, lo que puede indicar un artefacto de prueba o un error de metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7
- Recepcion de replay citada en la card: `x86-replay-receipt.json` (referenciada, no enlazada)
- Aviso de atribucion: `NOTICE` (referenciado, no enlazado)
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion proporcionada.
