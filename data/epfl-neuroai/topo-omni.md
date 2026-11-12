# epfl-neuroai/topo-omni

## Resumen

Topo-Omni es un ajuste fino de Qwen2.5-Omni-3B desarrollado por el laboratorio de NeuroAI de la EPFL (epfl-neuroai) que introduce una organizacion topografica de tipo cortical en las capas de vision, audio y lenguaje del modelo. El objetivo no es mejorar el rendimiento en tareas convencionales, sino construir un modelo multimodal cuya representacion interna reproduzca propiedades de los mapas corticales biologicos (selectividad funcional, clustering espacial, retinotopia, tonotopia) y sirva como herramienta de investigacion en neurociencia computacional.

Tecnicamente, cada unidad del modelo recibe una coordenada fija en una "lamina cortical" compartida de 800 x 576 unidades (460.800 en total) y el entrenamiento anade una perdida de suavidad espacial que empuja a unidades cercanas en la lamina a responder de forma similar. El modelo conserva la arquitectura del Thinker de Qwen2.5-Omni, con un modulo `CorticalAdaptor` en cada capa que proyecta las activaciones sobre la lamina y las devuelve mediante un mapa lineal casi identidad y su pseudoinversa.

Es relevante ahora porque ofrece un puente reproducible entre modelos multimodales a gran escala y la organizacion funcional del cerebro, permitiendo experimentos de mapeo de selectividad, ablacion y estimulacion de regiones definidas por localizadores, y comparacion directa con datos de fMRI humano. Su naturaleza es fundamentalmente academica y experimental: requiere cargar una arquitectura personalizada y no funciona con un pipeline estandar de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen2_5OmniThinkerForConditionalGeneration` con `CorticalAdaptor` por capa y lamina cortical de 800 x 576 |
| Parametros totales | 5.420.690.432 (5,42 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,9 GB) |

## Arquitectura y entrenamiento

El modelo parte del modulo Thinker de Qwen2.5-Omni-3B, un transformer multimodal que acepta texto, imagen, video y audio y genera texto. Sobre esa base se inserta un `CorticalAdaptor` en cada capa: una proyeccion lineal aprendida, inicializada cerca de la identidad (escala 1e-3), que mapea las activaciones ocultas a la lamina cortical y las reconstruye con su pseudoinversa. La lamina tiene 460.800 unidades, equivalentes a 100 x 4608, y se organiza en bandas: los encoders de cada modalidad ocupan 32 teselas de 64 x 72 en una rejilla 8 x 4 (extension 512 x 288), mientras que el modelo de lenguaje ocupa 36 teselas de 72 x 64 en una rejilla 4 x 9 (extension 288 x 576). La disposicion se selecciona con la variable de entorno `TOPO_SHEET_LAYOUT=tiled32`, que debe fijarse antes de importar el codigo.

El ajuste fino se realizo con el `SFTTrainer` de TRL (version 0.25.1) sobre el dataset Koala-36M-v1, con 10 epocas, batch de 3 por dispositivo, acumulacion de gradiente de 5, learning rate de 5e-5 con schedule coseno y 3 % de warmup, weight decay de 0.01, precision bf16 y semilla 42. La innovacion central es la perdida de suavidad espacial, con peso alpha de 20 y acumulacion media, compuesta por dos terminos muestreados por batch con centros estratificados por profundidad: un termino fino de radio fijo 5 (4000 vecindarios por batch, maximo 768 unidades, peso 1.0) y un termino grueso de radio lineal de 4 a 32 (600 vecindarios, maximo 512 unidades, peso 10.0). El entrenamiento se ejecuto con Transformers 4.57.6, PyTorch 2.9.1 y Datasets 4.4.1.

## Capacidades

- Entrada multimodal: texto, imagen, video y audio; salida exclusivamente de texto.
- Generacion de texto y descripcion de contenido visual y audiovisual, heredadas del modelo base Qwen2.5-Omni-3B.
- Razonamiento multimodal de un solo turno orientado a tareas de percepcion y reconocimiento (caras, cuerpos, objetos, escenas, habla).
- Organizacion topografica inspeccionable: permite mapear selectividad por unidad, medir autocorrelacion espacial (Island Moran's I) y comparar mapas con datos biologicos.
- Intervencion causal: el repositorio incluye utilidades de ablacion y estimulacion de regiones definidas por localizadores.
- Capacidades de tool calling, function calling, agentes o modo thinking: no documentadas en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en neurociencia computacional: comparar los mapas topograficos aprendidos (preferencia de orientacion, densidad de pinwheels, espaciado de columnas) con los de la V1 de macaco para validar hipotesis sobre la organizacion cortical.
- Alineacion cerebro-modelo: correlacionar la topografia del modelo con mapas t de fMRI humano de los datasets NSD y SpaceTop para estudiar que regiones funcionales emergen de forma espontanea.
- Estudios de selectividad funcional: aplicar contrastes ON-vs-OFF (caras, cuerpos, objetos, escenas, habla) con tests t corregidos por FDR sobre la lamina cortical para localizar regiones especializadas.
- Experimentos de lesion virtual: ablacionar o estimular regiones definidas por localizadores y medir el efecto causal en la salida del modelo, como aproximacion a estudios de lesion en neuropsicologia.
- Analisis de retinotopia y tonotopia: usar las bandas de los encoders visual y auditivo para estudiar como se organiza la informacion espacial y frecuencial en la lamina.
- Docencia y divulgacion en NeuroAI: servir como plataforma reproducible para explicar la relacion entre arquitecturas de deep learning y mapas corticales, con codigo y metricas publicados.
- Reproducibilidad de experimentos: el repositorio incluye el loader unico `load_topo_omni` y el codigo de experimentos en `src/experiments/`, lo que facilita replicar los resultados del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion descrita por los autores se centra en metricas neurocientificas (selectividad, clustering espacial, mapas topograficos, alineacion con fMRI y relevancia causal), no en benchmarks estandar de NLP o multimodalidad como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 11-12 GB solo para pesos (5,42 mil millones de parametros), mas overhead de activaciones y del procesador multimodal.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 6 GB; en 4 bits, alrededor de 3,5 GB, aunque no se documentan pesos cuantizados oficiales y la arquitectura personalizada puede complicar la conversion.
- GPU recomendadas: A100 40 GB o H100 para experimentos con batches grandes y evaluacion sobre la lamina completa; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en bf16.
- GPU de consumo: cabe en tarjetas de 16 GB o mas en bf16 con batches pequenos; en 8 GB solo con cuantizacion agresiva y verificacion manual de compatibilidad.
- Opciones de despliegue: carga mediante el codigo del repositorio (`load_topo_omni`) o instanciando `Qwen2_5OmniThinkerForConditionalGeneration` con Transformers 4.57.6. No es compatible con pipelines estandar de transformers, y no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Enfoque |
|---|---|---|---|---|---|
| Topo-Omni (epfl-neuroai) | 5,42 mil millones | no disponible | texto, imagen, video, audio de entrada; texto de salida | Apache 2.0 | Investigacion neurocientifica con topografia cortical |
| Qwen2.5-Omni-3B (base) | ~3 mil millones (Thinker) | no disponible | texto, imagen, video, audio de entrada; texto y audio de salida | Apache 2.0 | Asistente multimodal generalista |
| Qwen2.5-Omni-7B | ~7 mil millones | no disponible | texto, imagen, video, audio | Apache 2.0 | Asistente multimodal generalista de mayor capacidad |
| TopoLM (EPFL) | no disponible | no disponible | texto | no disponible | Modelo de lenguaje con topografia cortical, solo texto |

La comparacion relevante es con el modelo base: Topo-Omni anade la lamina cortical y la perdida espacial a costa de mayor tamano (5,42 mil millones frente a los ~3 mil millones del Thinker original) y de perder la salida de audio. Frente a alternativas generalistas como Qwen2.5-Omni-7B, no compite en rendimiento de tareas, sino en valor como instrumento de investigacion.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente o generacion de codigo.
- Arquitectura personalizada: no carga correctamente con pipelines estandar de transformers; requiere el codigo del repositorio y la variable `TOPO_SHEET_LAYOUT=tiled32` antes de importar.
- Solo ingles declarado; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Salida limitada a texto: no genera audio, a diferencia del Qwen2.5-Omni base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 3-5 mil millones de parametros, agravado por la falta de evaluacion en benchmarks estandar.
- Sesgos: no se documentan analisis de sesgo; al entrenarse sobre Koala-36M-v1 y heredar el modelo base, puede reproducir sesgos de esos datos.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin verificacion.
- No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ) ni soporte confirmado en vLLM, llama.cpp u Ollama.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones tecnicas y la ausencia de validacion desaconsejan ese uso.
- El identificador del modelo aparece de forma inconsistente en la model card (`topo-omni` frente a `topo-omni-v2` en los ejemplos de codigo); conviene verificar el repositorio correcto antes de cargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epfl-neuroai/topo-omni
- Paper (arXiv): https://arxiv.org/abs/2606.09770
- Pagina del proyecto: https://topo-omni.epfl.ch
- Repositorio de codigo: https://github.com/epflneuroailab/topo-omni
- Experimentos y metricas de evaluacion: https://github.com/epflneuroailab/topo-omni/tree/main/src/experiments
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- TDANN (enfoque topografico previo): https://github.com/neuroailab/TDANN
- TopoLM: https://topolm.epfl.ch
- TRL: https://github.com/huggingface/trl
- Dataset Koala-36M-v1: https://huggingface.co/datasets/Koala-36M/Koala-36M-v1
