# SCUT-EIPI/EditFlowSR

## Resumen

EditFlowSR es un checkpoint preentrenado del modelo presentado en el articulo "EditFlowSR: Revisable Expression Generation for Symbolic Regression", aceptado en NeurIPS 2026 y desarrollado por el grupo SCUT-EIPI (South China University of Technology). No es un modelo de lenguaje generativo al uso, sino un modelo especializado en regresion simbolica: dado un conjunto de datos numericos, genera expresiones matematicas que los explican, con la particularidad de que dichas expresiones pueden revisarse y editarse de forma iterativa.

La innovacion central es el uso de flow matching con doble trayectoria (descubrimiento y simplificacion) sobre una arquitectura encoder-decoder transformer de 8 capas por bloque, anchura 512 y 16 cabezas de atencion. El encoder de datos emplea embeddings posicionales inexistentes (invariante a permutaciones), mientras que el decoder de edicion usa embeddings posicionales aprendibles.

El checkpoint tiene un tamano de 324 MB y se distribuye unicamente para inferencia (pesos y parametros, sin estado del optimizador). Es relevante para investigadores en descubrimiento de ecuaciones y aprendizaje cientifico que necesiten un modelo base reproducible sobre el cual evaluar o extender tecnicas de regresion simbolica revisable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas encoder + 8 capas decoder, anchura 512, 16 cabezas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en FP16) |
| Idiomas soportados | no disponible (modelo no linguistico, opera sobre datos numericos) |
| Licencia | MIT (uso de investigacion junto al repositorio de codigo) |
| Formato de pesos | .pth (PyTorch), 324 MB, solo inferencia |

## Arquitectura y entrenamiento

EditFlowSR emplea una arquitectura transformer encoder-decoder simetrica de 8 capas en cada bloque, con anchura de 512 dimensiones y 16 cabezas de atencion. El encoder procesa los datos de entrada (puntos numericos) sin embeddings posicionales, lo que lo hace invariante a permutaciones de las muestras, tal como se describe en la seccion 3.1 del articulo. El decoder de edicion, encargado de generar y modificar expresiones simbolicas, si utiliza embeddings posicionales aprendibles.

El entrenamiento se basa en flow matching con doble trayectoria: una trayectoria de descubrimiento (generar expresiones desde cero) y otra de simplificacion (refinar expresiones existentes), con una proporcion de trayectoria de 0,2. Se optimizo con Adam, learning rate pico de 4e-5 y precision FP16. El checkpoint distribuido esta recortado a inferencia: contiene pesos del modelo y parametros, pero no el estado del optimizador. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en el sentido habitual a este tipo de modelo).

## Capacidades

- Generacion de expresiones simbolicas (formulas matematicas) que ajustan conjuntos de datos numericos.
- Edicion y revision iterativa de expresiones: el modelo puede modificar una expresion existente en lugar de regenerarla desde cero.
- Trayectoria de simplificacion: capacidad de reducir la complejidad de expresiones manteniendo el ajuste a los datos.
- Invariancia a permutaciones en la entrada de datos gracias a la ausencia de embeddings posicionales en el encoder.
- No soporta tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso en lenguaje natural.
- No dispone de capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni de decodificacion especulativa documentada.

## Casos de uso

- Descubrimiento de leyes fisicas a partir de datos experimentales: el modelo genera expresiones cerradas que explican mediciones, util para laboratorios que necesitan formulas interpretables en lugar de cajas negras.
- Simplificacion de modelos empiricos: dada una expresion compleja obtenida por otro metodo, EditFlowSR puede refinarla y reducir su complejidad mediante la trayectoria de simplificacion.
- Analisis de datos cientificos en ingenieria: ajuste simbolico de curvas y superficies de respuesta en entornos donde se exige interpretabilidad (por ejemplo, caracterizacion de materiales).
- Investigacion en aprendizaje simbolico: servir como linea base reproducible (checkpoint publico con licencia MIT) para comparar nuevos metodos de regresion simbolica.
- Educacion y divulgacion: generacion de formulas equivalentes o simplificadas para explicar relaciones matematicas subyacentes en conjuntos de datos docentes.
- Integracion en pipelines de descubrimiento de ecuaciones: el checkpoint puede cargarse en un flujo automatizado que reciba datos tabulares y devuelva expresiones candidatas para su validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 324 MB en FP16, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM libre, dependiendo del tamano de lote y de la longitud de las expresiones.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes o barridos masivos se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo reciente (RTX 3060 o superior), e incluso en CPU para inferencia puntual.
- Opciones de despliegue: al ser un checkpoint PyTorch (.pth) especifico, el despliegue se realiza mediante el codigo del repositorio oficial (SCUT-EIPI/EditFlowSR); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EditFlowSR | no disponible (324 MB en FP16) | no disponible | Regresion simbolica con edicion revisable (flow matching) | MIT | Checkpoint en Hugging Face + codigo en GitHub |
| Eureqa / otros metodos de regresion simbolica | no disponible | no disponible | Busqueda genetica / programacion genetica | no disponible | No disponible en la informacion |
| Modelos de descubrimiento de ecuaciones basados en transformers | no disponible | no disponible | Generacion secuencial de expresiones | no disponible | No disponible en la informacion |

No se dispone de datos comparativos de rendimiento entre EditFlowSR y alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el checkpoint se publica para uso de investigacion junto al repositorio de codigo; no hay evidencia de validacion en produccion.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni conversacion; su entrada son datos numericos y su salida, expresiones simbolicas.
- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre datos sinteticos o cientificos no especificados, su generalizacion fuera de la distribucion de entrenamiento es incierta.
- Riesgo de expresiones incorrectas o sobreajustadas: como todo metodo de regresion simbolica, puede producir formulas que ajustan los datos pero no reflejan la relacion subyacente; requiere validacion externa.
- No se especifican limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.
- La licencia MIT permite uso comercial, pero el autor la describe como liberada "para uso de investigacion"; conviene revisar el repositorio para confirmar condiciones.
- El checkpoint es solo de inferencia: no incluye estado del optimizador, por lo que no es directamente reentrenable sin ajustes.
- No hay informacion sobre el numero de parametros totales, lo que dificulta estimar costes de entrenamiento o comparaciones cuantitativas.

## Enlaces

- Hugging Face: https://huggingface.co/SCUT-EIPI/EditFlowSR
- Repositorio de codigo: https://github.com/SCUT-EIPI/EditFlowSR
- Paper (OpenReview): https://openreview.net/forum?id=SiqvujQlIz
