# miyuki17/openevo-ceiling1-qwen25-7b-historical-final-adapters

## Resumen

Este repositorio no es un modelo completo, sino un paquete de adaptadores PEFT/LoRA (`opsd/` y `stage2-final/`) que se aplican sobre el modelo base público `Qwen/Qwen2.5-7B-Instruct`. Lo publica el usuario `miyuki17` como cierre del tramo histórico de 7B del proyecto OpenEVO Ceiling-1.0, un experimento de ajuste incremental de largo recorrido. El paquete se distribuye bajo licencia Apache-2.0 y ocupa 2,9 GB en el repositorio, con dos ficheros `adapter_model.safetensors` de 20.214.760 bytes y 2.886.498.904 bytes respectivamente.

El interés técnico reside en que documenta un pipeline de adaptación en dos fases: primero se fusiona el adaptador OPSD sobre el modelo base y, sobre ese base ya fusionado, se carga el adaptador terminal de Stage2. El autor reporta 149 rondas completadas de Stage2 (0..148), 19.072 rollouts aceptados y una puntuación de tarea de 49,33 sobre 100 en un panel congelado de 128 tareas, con una tasa de éxito exacto del 45,31 % (58 de 128).

Es relevante como artefacto de investigación reproducible: fija revisiones y hashes SHA256 de los ficheros, pero deliberadamente excluye el almacén histórico de checkpoints de 69,9 GB, los corpus de replay, el optimizer y los diagnósticos internos. No es la línea principal Q17 / Bounded 1.7B del proyecto. Con 0 descargas y 0 likes en el momento de redactar esta ficha, se trata de un release recién publicado y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA/PEFT sobre un transformer decoder-only (Qwen2.5-7B-Instruct); rango y modulos objetivo de LoRA: no disponibles |
| Parametros totales | 7,61 mil millones en el modelo base; numero de parametros entrenables de los adaptadores: no disponible (ficheros de 20,2 MB y 2,89 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 131.072 tokens heredados del modelo base Qwen2.5-7B-Instruct; no verificado en la model card del adaptador |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; los adaptadores se publican en safetensors y la model card no especifica la precision de entrenamiento. La fusion sobre el base da unas weights de ~14 GB, compatible con bf16/fp16 |
| Idiomas soportados | No disponible (la model card no documenta idiomas ni el conjunto de entrenamiento) |
| Licencia | Apache-2.0 para el paquete de adaptadores; el modelo base se distribuye por separado bajo su propia licencia |
| Formato de pesos | safetensors (`opsd/adapter_model.safetensors`, `stage2-final/adapter_model.safetensors`) mas ficheros `adapter_config.json` |
| Tipo de artefacto | Paquete de adaptadores PEFT, no un modelo completo |
| Modelo base | `Qwen/Qwen2.5-7B-Instruct`, revision fijada a `a09a35458c702b33eeacc393d103063234e8bc28` |
| Biblioteca declarada | peft |
| Tamano del repositorio | 2,9 GB |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: un transformer decoder-only de la familia Qwen2.5 en su variante Instruct de 7B, sobre el que se aplican dos adaptadores de bajo rango gestionados con la libreria PEFT. La model card identifica dos componentes: `opsd/`, descrito como adaptador OPSD final de 7B, y `stage2-final/`, el adaptador terminal de Stage2 correspondiente a la ronda 148, generacion 142, con 143 componentes. El rango de LoRA, los modulos objetivo, el optimizador, la tasa de aprendizaje y la composicion del dataset no se detallan en la informacion disponible.

El punto critico del entrenamiento es su naturaleza secuencial en dos fases. Stage2 no partio del Qwen2.5-7B original, sino de un base intermedio que ya tenia fusionado el adaptador OPSD, y sobre el se acumulo el adaptador de Stage2. Por eso la reproducibilidad exige respetar el orden: cargar y fusionar OPSD sobre `Qwen2.5-7B-Instruct`, y despues cargar `stage2-final` sobre ese base fusionado. Invertir u omitir un paso invalida la reproducibilidad.

En cuanto a la escala del proceso, la model card declara 149 rondas completadas de Stage2 (0..148), 19.072 rollouts aceptados y un identificador de estado final (`0f1a3f3a...a7b63`). No se menciona RLHF ni DPO, ni se publican los datos de replay, trayectorias o diagnostico de entrenamiento. La referencia a SEED (89,7 / 78,1 %) se etiqueta explicitamente como valor reportado en paper y no como resultado reproducido localmente, por lo que el autor advierte que no debe interpretarse como una comparacion causal emparejada.

## Capacidades

- Generacion de texto instructiva: hereda del base Qwen2.5-7B-Instruct la capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Contexto largo: el modelo base soporta hasta 131.072 tokens, util para documentos extensos y dialogos con historial amplio.
- Razonamiento y matematicas: capacidades propias del base de la familia Qwen2.5; el ajuste de adaptadores no las documenta de forma especifica.
- Generacion de codigo: no documentada expresamente en la model card del adaptador; en el base Qwen2.5-7B-Instruct es una capacidad conocida.
- Tool calling / function calling: soportado por el modelo base; no se documenta si el ajuste lo preserva o lo degrada.
- Soporte de agentes y razonamiento multi-paso: no documentado para este paquete de adaptadores.
- Capacidades multilingues: no documentadas; el base cubre un conjunto amplio de idiomas, pero la model card no especifica cuales se conservan.
- Modo thinking, vision o audio: no disponible; no hay evidencia de capacidades multimodales.
- Rendimiento en tarea especifica: el unico dato declarado es una puntuacion de 49,33 sobre 100 en un panel congelado de 128 tareas (45,31 % de exito exacto).

Advertencia relevante: la model card documenta el empaquetado y la procedencia, no una evaluacion funcional de capacidades. Cualquier uso en produccion exige una evaluacion propia del modelo fusionado.

## Casos de uso

- Reproduccion de experimentos de ajuste incremental: cargar y fusionar el adaptador OPSD sobre `Qwen2.5-7B-Instruct` en la revision fijada, cargar despues `stage2-final` y verificar los SHA256 publicados para comprobar que el entorno reproduce exactamente el artefacto descrito.
- Investigacion sobre adaptacion de largo recorrido: el paquete documenta 149 rondas y 19.072 rollouts aceptados, lo que lo convierte en un caso de estudio util para analizar como se comportan adaptadores acumulados en varias fases frente a un unico ajuste.
- Validacion de pipelines de fusion de LoRA: sirve como banco de pruebas para verificar que una herramienta de despliegue (vLLM, TGI, PEFT) aplica correctamente dos adaptadores en el orden correcto y no sobrescribe pesos.
- Evaluacion comparativa metodologica: el panel congelado de 128 tareas y la distincion explicita entre resultados propios y cifras reportadas en paper permiten estudiar buenas practicas de reporte y evitar comparaciones pareadas invalidas.
- Docencia y formacion en PEFT: el repositorio ilustra con ficheros reales la diferencia entre un adaptador pequeno (20 MB) y uno grande (2,9 GB), y las implicaciones de empaquetado que ello tiene.
- Base para pruebas de inferencia en castellano o multilingue: al no estar documentados los idiomas, es un candidato para medir empiricamente si el ajuste ha degradado la cobertura linguistica del base antes de plantear cualquier uso real.
- Analisis de seguridad y auditoria de artefactos: permite estudiar el caso de un paquete con el campo de seguridad del proveedor en estado `unscanned` y con escaneo de rutas internas acotado, util como ejemplo en politicas de admision de modelos.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Contexto |
|---|---|---|
| Task Score (panel congelado de 128 tareas) | 49,33 / 100 | Resultado propio declarado por el autor |
| Exact success | 58 / 128 = 45,31 % | Mismo panel congelado |
| Rondas completadas de Stage2 | 149 (0..148) | Metrica de entrenamiento, no de calidad |
| Rollouts aceptados de Stage2 | 19.072 | Metrica de entrenamiento |
| Referencia SEED (paper-reported) | 89,7 / 78,1 % | No reproducido localmente; el autor prohibe tratarlo como comparacion causal emparejada |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. No se deben extrapolar los valores del panel interno a capacidades generales: el panel no esta descrito en composicion ni en metodologia de evaluacion.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para las weights del base de 7,61 mil millones de parametros, mas cache KV (el autor cifra el base fusionado en unos 14 GB). En la practica, 18-24 GB para contextos largos.
- VRAM en cuantizacion de 8 bits: del orden de 8-9 GB.
- VRAM en cuantizacion de 4 bits: del orden de 5-6 GB, lo que lo hace viable en GPU de consumo.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 (24 GB) sin cuantizar y con margen; en tarjetas de 12 GB exige cuantizacion de 4 bits. No cabe sin cuantizar en GPU de 8 GB.
- GPU de centro de datos: A100 40/80 GB o H100 para servir con lotes grandes y contexto de 131.072 tokens, donde la cache KV pasa a ser el cuello de botella.
- Almacenamiento: el paquete de adaptadores ocupa 2,9 GB; ademas hay que disponer del base (unos 15 GB en bf16) y, si se materializa la fusion, de una copia adicional del modelo fusionado.
- Espacio en RAM/VRAM para la fusion: fusionar PEFT exige cargar el base completo en precision de entrenamiento, por lo que el proceso necesita mas memoria que la inferencia cuantizada.
- Opciones de despliegue: transformers + PEFT para cargar los adaptadores sin fusionar; vLLM con soporte de LoRA para servir; TGI; llama.cpp u Ollama tras fusionar y convertir a GGUF; conversiones adicionales a AWQ o GPTQ para cuantizacion.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Rendimiento comparado |
|---|---|---|---|---|---|
| Este paquete (adaptadores OpenEVO Ceiling-1.0 sobre Qwen2.5-7B) | 7,61 mil millones en el base; adaptadores de 20 MB y 2,9 GB | 131.072 tokens (heredado del base) | Apache-2.0 (adaptadores) | Adaptadores PEFT, no modelo completo | Task Score 49,33 / 100 en panel propio de 128 tareas; sin benchmarks estandar |
| Qwen/Qwen2.5-7B-Instruct | 7,61 mil millones | 131.072 tokens | La del repositorio del base | Modelo completo instructivo | Punto de partida del ajuste; cifras oficiales no incluidas en esta ficha |
| Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens segun documentacion del fabricante | Apache-2.0 segun el fabricante | Modelo completo instructivo | No comparable: no hay evaluacion comun entre ambos artefactos |
| Meta Llama-3.1-8B-Instruct | 8,03 mil millones | 131.072 tokens segun documentacion del fabricante | Licencia comunitaria de Meta | Modelo completo instructivo | No comparable: no hay evaluacion comun entre ambos artefactos |

Los datos de los modelos alternativos corresponden a documentacion publica de sus fabricantes y no se han verificado contra este repositorio. No existe una evaluacion comun que permita afirmar superioridad o inferioridad de este paquete frente a ninguno de ellos; el panel de 128 tareas es propio del proyecto y no es replicable con la informacion publicada.

## Limitaciones y advertencias

- Artefacto experimental sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, y una unica fuente (el propio autor) para todos los resultados declarados.
- No es un modelo autonomo: requiere descargar el base `Qwen/Qwen2.5-7B-Instruct` en la revision exacta `a09a35458c702b33eeacc393d103063234e8bc28` y aplicar una fusion en dos pasos. Saltarse el orden OPSD -> Stage2 rompe la reproducibilidad.
- Estado de seguridad sin verificar: el campo de seguridad del proveedor estaba en `unscanned` cuando se publico la model card, y el autor no afirma que el escaneo de malware de la plataforma haya pasado. El escaneo mencionado es un analisis acotado de rutas internas y secretos en configs y cabeceras safetensors.
- Idiomas no documentados: no hay lista de idiomas soportados ni composicion del dataset, por lo que no puede garantizarse el comportamiento en castellano ni en ningun otro idioma concreto.
- Rendimiento modesto en la unica metrica publicada: 49,33 sobre 100 y un 45,31 % de exito exacto implican que mas de la mitad de las tareas del panel no se resuelven exactamente.
- Comparacion con SEED invalida por diseno: el propio autor advierte que las cifras 89,7 / 78,1 % son una referencia reportada en paper y no una comparacion causal emparejada, porque ni el checkpoint ni el denominador se reprodujeron localmente.
- Opacidad del entrenamiento: no se publican datos de replay, trayectorias, optimizer, diagnostico interno ni el almacen de 69,9 GB de checkpoints historicos, de modo que el ajuste no es reproducible de extremo a extremo, solo la inferencia.
- Riesgo de alucinacion: inherente a un modelo de 7B ajustado con datos no documentados; no hay evaluacion de factualidad ni de tasas de alucinacion.
- Degradacion potencial de capacidades generales: al no existir evaluacion del modelo fusionado, no puede descartarse que el ajuste haya afectado a codigo, matematicas, tool calling o multilingue.
- Restricciones de licencia: los adaptadores son Apache-2.0, pero el modelo base se distribuye por separado bajo su propia licencia y no se redistribuye en este repositorio. Cualquier uso comercial debe revisar tambien la licencia del base y el fichero `NOTICE` del paquete.
- Documentacion unicamente en chino: la model card no ofrece version en castellano ni en ingles, lo que dificulta la auditoria por parte de equipos que no lean ese idioma.
- Trazabilidad de configuracion: el `adapter_config.json` de OPSD normaliza `base_model_name_or_path` al identificador publico, mientras que la config historica original conserva rutas internas que no se publican; las diferencias exactas entre ambas no son verificables desde fuera.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/miyuki17/openevo-ceiling1-qwen25-7b-historical-final-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct (revision `a09a35458c702b33eeacc393d103063234e8bc28`)
- Ficheros de licencia y atribucion referenciados en la model card: `LICENSE` y `NOTICE` dentro del propio repositorio
- Paper, blog, repositorio de codigo o demo del proyecto OpenEVO Ceiling-1.0: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a consultas sin relacion (articulos en chino sobre tipografia francesa, simbolos de verificacion, conversiones de unidades de almacenamiento y simbolos de tilde), por lo que no se incluyen como fuentes.
