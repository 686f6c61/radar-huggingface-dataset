# alfred-n/dIon

## Resumen

dIon 0.1 es un encoder fundacional para espectros de masas en tandem (MS/MS), desarrollado por el usuario alfred-n y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje: su dominio es la proteomica y la espectrometria de masas, y resuelve dos problemas relacionados. Por un lado, aprende representaciones latentes de espectros mediante auto-destilacion; por otro, ofrece modelos completos de secuenciacion de novo de peptidos, es decir, la inferencia de la secuencia aminoacidica directamente a partir del espectro, sin base de datos de referencia.

El release incluye tres checkpoints: un encoder fundacional (`dion-v0.1-foundation.ckpt`), un modelo de novo de 200 picos (`dion-v0.1-denovo-200peaks.ckpt`, recomendado por el autor) y un modelo de novo de 1.000 picos (`dion-v0.1-denovo-1000peaks.ckpt`, mas lento y con predicciones ligeramente mejores). La implementacion y las utilidades de carga no estan en el repositorio de HuggingFace, sino en el repositorio fuente de dIon, al que la model card remite sin facilitar URL.

La relevancia actual del modelo es acotada pero clara: se trata de un release de investigacion, con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados y sin articulo cientifico citado todavia. Su interes principal es metodologico, al trasladar recetas de representacion auto-supervisada tipo DINO/DINOv2 al dominio de la espectrometria de masas y combinarlas con un decodificador de estilo Casanovo para secuenciacion de novo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer auto-supervisado adaptado de DINO/DINOv2, con estudiante y profesor EMA; decodificador de estilo Casanovo para secuenciacion de novo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje. La entrada se limita a 200 o 1.000 picos retenidos segun el checkpoint |
| Tipos de cuantizacion | no disponible (el release distribuye checkpoints `.ckpt` de PyTorch Lightning) |
| Idiomas soportados | no aplica: modelo sobre espectros de masas, no sobre texto |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch Lightning checkpoint (`.ckpt`); no se distribuyen safetensors ni GGUF |
| Modalidad de entrada | Espectros de masas en tandemcentroidizados: `mz_array`, `intensity_array`, `precursor_mz`, `precursor_charge` |
| Tokenizador de secuencias | PA1.1 numerico de delta de masa, incluido con el release |
| Checkpoints incluidos | 3: fundacional (200 picos), de novo 200 picos, de novo 1.000 picos |
| Tamano del repositorio | 7,6 GB |
| Libreria | PyTorch / PyTorch Lightning |
| Fecha de creacion | 2 de octubre de 2026 |
| Ultima actualizacion | 2 de octubre de 2026 |

## Arquitectura y entrenamiento

El encoder fundacional adapta el marco DINO con un objetivo dual compuesto por dos tareas de prediccion latente, ambas orientadas a recuperar la representacion limpia del profesor. La primera parte de una mezcla de espectros y utiliza el precursor como consulta de seleccion; la segunda parte de un espectro parcial con el precursor oculto. En este release, los componentes iBOT y KoLeo estan desactivados. El checkpoint publicado corresponde a la epoca 279, en el paso global 315.560 de un calendario nominal de 300 epocas. El archivo fundacional es un checkpoint de preentrenamiento de PyTorch Lightning que contiene el estado del estudiante y del profesor EMA; las utilidades de carga posteriores del proyecto usan el backbone del profesor EMA como representacion liberada.

Los modelos de secuenciacion de novo se inicializaron a partir de ese checkpoint fundacional y se ajustaron de extremo a extremo sobre el conjunto dIon-de-novo-labeled-v1 (DNLv1). La seleccion de checkpoints se hizo por precision de peptidos en la validacion nativa de DNLv1, sin seleccion de modelo sobre el conjunto de test. El modelo de 200 picos corresponde a la epoca 37 y el de 1.000 picos a la epoca 27. El componente de auto-destilacion se atribuye a DINO y DINOv2, y el decodificador y las convenciones de evaluacion siguen el estilo de Casanovo, segun declara la propia model card.

El contrato de entrada exige espectros de masas en tandem centroidizados con valores de m/z de fragmento en el rango [0, 2500], intensidades escaladas al pico base, condicionamiento por m/z y carga del precursor, y como maximo 200 o 1.000 picos retenidos segun el checkpoint. Para conjuntos etiquetados en formato Lance, las columnas esperadas son `mz_array`, `intensity_array`, `precursor_mz`, `precursor_charge` y `seq`. El release incluye configuraciones portables en `configs/` y metadatos legibles por maquina (tamanos, hashes y procedencia) en `metadata/`.

## Capacidades

- Aprendizaje de representaciones de espectros MS/MS: el checkpoint fundacional produce embeddings latentes utilizables como inicializacion para tareas posteriores.
- Secuenciacion de novo de peptidos: los checkpoints de novo generan la secuencia de peptidos a partir del espectro, sin depender de una base de datos proteica de referencia.
- Condicionamiento por precursor: la m/z y la carga del precursor se inyectan como informacion de contexto en el modelo.
- Prediccion latente dual: una tarea reconstruye la representacion del profesor a partir de una mezcla de espectros usando el precursor como consulta; otra lo hace a partir de un espectro parcial con el precursor oculto.
- Soporte de hasta 200 o 1.000 picos retenidos, segun el checkpoint elegido.
- Tokenizacion de secuencias peptidicas mediante el tokenizador PA1.1 de delta de masa numerica incluido en el release.
- Valores de confianza en las predicciones, que segun el autor requieren calibracion especifica por tarea y conjunto de datos antes de interpretarse como probabilidades de error.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: son ajenas al dominio del modelo.

## Casos de uso

- Secuenciacion de novo en proteomica de descubrimiento: dado un espectro MS/MS centroidizado, el checkpoint de 200 picos genera la secuencia peptidica sin consultar una base de datos, lo que resulta util cuando la muestra no coincide con el proteoma de referencia.
- Analisis de organismos no modelo o metaproteomica: al no depender de bases de datos curadas, el modelo permite caracterizar peptidos de comunidades microbianas o especies sin genoma anotado.
- Inicializacion de fine-tuning para tareas downstream: el checkpoint fundacional se carga con `--encoder_weights` para entrenar un decodificador nuevo con `configs/master_denovo_dion_finetune.yaml`, reutilizando la representacion aprendida.
- Inmunopeptidomica y secuenciacion de anticuerpos: la secuenciacion de novo es aplicable a peptidos con modificaciones o secuencias ausentes de las bases de datos convencionales, siempre que las modificaciones esten dentro del vocabulario soportado.
- Generacion de librerias espectrales: las secuencias predichas pueden alimentar la construccion de librerias para busqueda espectro-espectro en experimentos posteriores.
- Evaluacion reproducible en pipelines de investigacion: el modelo se evalua sobre conjuntos Lance etiquetados con `--eval_only 1`, lo que permite integrarlo en flujos de validacion automatizada.
- Analisis con cobertura ampliada de picos: el checkpoint de 1.000 picos es adecuado cuando se prioriza ligeramente la calidad de prediccion sobre el coste computacional y existe GPU con memoria suficiente.
- Extraccion de embeddings para clasificacion o agrupamiento de espectros: el profesor EMA del checkpoint fundacional puede emplearse como extractor de caracteristicas en tareas de comparacion o recuperacion de espectros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que los checkpoints de novo se seleccionaron por precision de peptidos en la validacion nativa de DNLv1 (epoca 37 para el modelo de 200 picos y epoca 27 para el de 1.000 picos), sin proporcionar valores numericos ni comparaciones con otros sistemas.

## Requisitos de hardware

- El repositorio completo ocupa 7,6 GB e incluye tres checkpoints, por lo que el almacenamiento necesario para el release completo ronda esa cifra.
- No se dispone del numero de parametros por checkpoint, por lo que no es posible estimar la VRAM de inferencia de forma fiable a partir de la informacion proporcionada.
- El modelo de 1.000 picos es, segun el autor, sustancialmente mas lento y requiere mas memoria de GPU que el de 200 picos, a cambio de una mejora modesta en las predicciones.
- Para el checkpoint de 1.000 picos debe pasarse `--max_peaks 1000` junto con `--disable_cudnn_sdp 1`.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible, al no conocerse el numero de parametros ni la VRAM efectiva requerida.
- Opciones de despliegue: la carga se realiza mediante las utilidades del repositorio fuente de dIon sobre PyTorch y PyTorch Lightning. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas estan orientados a modelos de lenguaje y no a este tipo de checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de parametros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa. La unica referencia de la que se tiene constancia en la propia model card es Casanovo, cuyo estilo de decodificador y convenciones de evaluacion adopta dIon, pero el autor no publica cifras comparativas.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dIon 0.1 | Encoder fundacional MS/MS + secuenciacion de novo | no disponible | no aplica (200 o 1.000 picos) | Apache 2.0 | HuggingFace, 3 checkpoints |
| Casanovo (referencia metodologica citada) | Secuenciacion de novo | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Software de investigacion: el autor indica explicitamente que estos modelos no estan destinados a uso clinico.
- El rendimiento depende del instrumento, del regimen de fragmentacion, de los metadatos del precursor, del vocabulario de modificaciones, de la distribucion de cargas y del preprocesamiento aplicado.
- Las modificaciones no soportadas no deben coercionarse de forma silenciosa a tokens soportados, ya que se producirian secuencias incorrectas sin aviso.
- La variante de 1.000 picos consume sustancialmente mas computo y memoria a cambio de una mejora de prediccion modesta.
- Los valores de confianza requieren calibracion especifica por tarea y conjunto de datos antes de utilizarse como probabilidades de error.
- Riesgo de predicciones incorrectas en espectros atipicos, con modificaciones no contempladas o adquiridos con regimenes de fragmentacion distintos de los de entrenamiento; la model card no cuantifica la tasa de error.
- No se publican sesgos conocidos ni evaluaciones de robustez frente a distintos instrumentos.
- La licencia Apache 2.0 permite uso comercial y modificacion, pero el caracter de software de investigacion y la ausencia de validacion clinica desaconsejan su uso en produccion sanitaria.
- La procedencia del release incluye sumas SHA256 (`SHA256SUMS`) y hashes por checkpoint en `metadata/`; conviene verificarlos antes de usar los pesos.
- La carga incorrecta de un checkpoint de novo mediante `--encoder_weights` no restaura el decodificador; debe usarse `--downstream_weights`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred-n/dIon
- Descarga completa: `hf download alfred-n/dIon --local-dir dion-v0.1`
- Repositorio fuente de dIon: mencionado en la model card, sin URL proporcionada
- Documentacion de fine-tuning (`docs/finetune_denovo.md`): referenciada en la model card, sin URL proporcionada
- Publicacion cientifica de dIon: pendiente de publicacion segun el autor; hasta entonces debe citarse el repositorio y el release (`dIon 0.1`, `v0.1.0`)
- Referencias metodologicas citadas por el autor: DINO, DINOv2 y Casanovo, sin URLs concretas en la informacion disponible
