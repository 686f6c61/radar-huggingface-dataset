# cdismus4/voivent-utakoe

## Resumen

Voivent Utakoe es un modelo simbolico de generacion musical desarrollado por el usuario cdismus4 y publicado en Hugging Face bajo licencia Apache 2.0. Resuelve un problema muy concreto: dada una melodia monofonica cantada o tocada de 8 compases en 4/4, propone multiples tomas de acompanamiento consistentes en una progresion de acordes (un acorde por compas) y una contramelodia simbolica. El modelo no pretende ser un armonizador preciso, sino una herramienta de busqueda que genera material crudo para que el usuario seleccione, fije y recombine compases.

Arquitectonicamente es un transformer decoder-only muy pequeno: 5,1 millones de parametros (d_model 256, 6 capas, 8 cabezas, contexto de 1024 tokens) que opera sobre tokens simbolicos de musica (no audio). Se distribuye como ONNX int8 de 5,4 MB, lo que permite ejecutarlo integramente en el navegador mediante Web Audio y ONNX Runtime Web, sin enviar audio a ningun servidor.

Esta es una version beta (segunda generacion; la primera fue un prototipo interno nunca publicado). El autor es explicito sobre las limitaciones: la precision armonica es modesta y las cadencias funcionales no estan garantizadas. Su interes actual reside en el enfoque de modelo minimo, local-first y orientado a la exploracion creativa, mas que en la calidad musical de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con KV cache |
| Parametros totales | 5.107.712 (5,11 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | int8 dinamica (ONNX) y fp32 (ONNX y PyTorch) |
| Idiomas soportados | en, ja (etiquetas de la model card; el modelo opera sobre tokens musicales) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8 y fp32) y checkpoint PyTorch `.pt` |
| d_model | 256 |
| Capas | 6 |
| Cabezas de atencion | 8 |
| Dropout | 0,1 |
| Vocabulario | 208 tokens (vocab v3) |
| Tamano del repo | 0,1 GB |
| Entrada | Melodia monofonica, 8 compases, 4/4, rejilla de semicorcheas, normalizada a Do mayor / La menor |
| Salida | 1 token de acorde por compas (12 raices x 10 calidades) + linea de contramelodia simbolica |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con d_model 256 y 8 cabezas de atencion, con un contexto maximo de 1024 tokens y dropout de 0,1. La unica diferencia respecto al modelo de primera generacion es el vocabulario de acordes: la primera version colapsaba todos los acordes de septima en una categoria `other` (49 tokens de acorde), mientras que esta version predice directamente 121 tokens de acorde (12 raices x 10 calidades: maj, min, dim, aug, dom7, maj7, min7, hdim7, dim7, other).

El entrenamiento uso 9.097 canciones convertidas en 42.322 secuencias (10.201.648 tokens), con ventanas de 8 compases, stride 4 y un maximo de 3 ventanas por cancion. Se aplico aumento de datos por transposicion de +-1 a 6 semitonos y una perturbacion de timing y pitch de estilo cantado con probabilidad 0,4. Las fuentes son exclusivamente material de dominio publico o CC: PDMX (8.358 canciones, solo filas marcadas `no_license_conflict`), OpenScore Lieder (431 canciones, CC0 1.0) y JSB Chorales. La generacion de referencia usa muestreo con temperatura 1,0 y top-k 40, junto con guardas musicales: se prohibe EOS hasta completar al menos 4 compases, se re-tiran eventos identicos a eventos de condicion en registro conflictivo, se cortan rachas excesivas de un mismo token y se fuerza que cada pitch vaya seguido de un token de duracion.

El formato de secuencia es `BOS COND_START <compases de melodia> TGT_START <compases objetivo> EOS`, donde cada compas comienza con `BAR` y contiene eventos POS/PITCH/DUR en la condicion y un token CHORD seguido de eventos de contramelodia en el objetivo. Las melodias se transportan a Do mayor o La menor antes de codificar y los renderizadores las transportan de vuelta.

## Capacidades

- Generacion simbolica de acompanamiento condicionada por melodia: produce un acorde por compas y una contramelodia para frases de 8 compases en 4/4.
- Generacion de multiples tomas (sampling con temperatura y top-k) para exploracion creativa y recombinacion por compases.
- Contramelodia como linea melodica independiente que dialoga con la melodia de entrada.
- Progresion de acordes como "suelo protector": en tonalidad, sin choques con notas largas de la melodia y con retorno a casa al final de frase.
- Inferencia local en navegador mediante ONNX Runtime Web y Web Audio, sin envio de audio a servidores.
- Interfaz ONNX con KV cache (entradas `input_ids`, `position_offset`, `past`; salidas `logits` y `present`) apta para generacion token a token.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking; es un modelo puramente generativo de tokens musicales.

## Casos de uso

- Exploracion creativa de armonizaciones: un compositor canta una melodia de 8 compases y el modelo genera decenas de tomas con acordes y contramelodias; el usuario fija los compases que le sirven y recombina el resto. Es adecuado porque el modelo esta disenado explicitamente como generador de material crudo, no como armonizador definitivo.
- Herramienta web de ideacion musical en el navegador: integrable en una DAW o pagina estatica mediante el build int8 de 5,4 MB y ONNX Runtime Web, con inferencia 100 % local y sin subida de audio, lo que resuelve privacidad y coste de servidor.
- Prototipado rapido de lineas de contramelodia: para arreglistas que necesitan una segunda voz que responda a una melodia vocal, el modelo propone lineas simbolicas que luego se editan en el editor MIDI.
- Educacion musical y analisis de armonia basica: util para ilustrar como una melodia sugiere acordes y contramelodias, siempre que se advierta que las cadencias funcionales no estan garantizadas.
- Investigacion en generacion musical simbolica de bajo coste: con 5,1 M de parametros y entrenamiento sobre PDMX, sirve como baseline ligero para experimentos de condicionamiento por melodia y evaluacion de guardas musicales.
- Integracion en pipelines de generacion de partituras simbolicas: la salida en tokens (acordes y eventos POS/PITCH/DUR) se puede convertir directamente a MusicXML o MIDI mediante un renderizador propio.
- Demos interactivas y juguetes musicales en movil: el peso reducido permite ejecutar el modelo en dispositivos moviles dentro del navegador, habilitando experiencias de canto-a-acompanamiento sin instalacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona una evaluacion propia con "precision de acordes modesta" y una auditoria teorica en la que 0 de 10 casos de funcion dominante resolvian correctamente, pero no se aportan cifras numericas de benchmarks en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier cuantizacion; el build int8 ocupa 5,4 MB y el fp32 20,7 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; el modelo esta pensado para ejecutarse en CPU o en el navegador. Cualquier GPU con ONNX Runtime (RTX 4090, A100, H100) lo ejecutaria con latencia despreciable, pero es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en todas; tambien en moviles y navegadores.
- Opciones de despliegue: ONNX Runtime (Python, C++, Web), PyTorch para el checkpoint `.pt`, y demo web estatica con ONNX Runtime Web.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor indica que la demo carga el modelo de forma perezosa en el primer uso y genera en bloques de 8 compases.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion musical simbolica condicionada por melodia con los que establecer una comparacion de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Version beta: el autor la describe como herramienta de busqueda, no como acompanamiento terminado; las tomas deben seleccionarse, fijarse y recombinarse fuera del modelo.
- Precision armonica modesta: la exactitud de acordes frente a las partituras de referencia es baja segun la propia medicion del autor.
- Cadencias funcionales no garantizadas: los acordes de funcion dominante se usan como color y no resuelven de forma fiable (0 de 10 casos en la auditoria teorica citada).
- Entrada restringida: solo melodias monofonicas de 8 compases en 4/4 sobre rejilla de semicorcheas, normalizadas a Do mayor o La menor; no admite polifonia ni otras metricas.
- Robustez limitada ante canto en registro grave con ornamentacion; el autor anuncia una version futura que lo aborde.
- Riesgo de alucinacion musical: el sampling puede producir progresiones o contramelodias incoherentes, mitigado parcialmente por las guardas de generacion.
- Idiomas: las etiquetas en/ja se refieren a la documentacion y la model card, no a capacidades linguisticas del modelo, que opera sobre tokens musicales.
- Licencia Apache 2.0 permite uso comercial, pero el entrenamiento depende de PDMX (CC BY 4.0) y OpenScore Lieder (CC0 1.0); conviene revisar las obligaciones de atribucion del dataset PDMX en productos derivados.
- Sin datos de benchmarks publicos ni de latencia, lo que dificulta comparaciones objetivas en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdismus4/voivent-utakoe
- Perfil del autor: https://huggingface.co/cdismus4
- Datasets del autor: https://huggingface.co/cdismus4/datasets
- Demo web oficial (Web Studio): https://daw.voivent.com/lab/utakoe
- Dataset PDMX (Zenodo): https://doi.org/10.5281/zenodo.15571083
