# Scicom-intl/Melati-AudioSet-EAT-Large

## Resumen

Melati-AudioSet-EAT-Large es un modelo de etiquetado de eventos sonoros (audio tagging) desarrollado por Scicom-intl dentro de su pipeline de datos de voz Melati. Resuelve una tarea concreta: dada una senal de audio, predecir cuales de las 527 clases de la ontologia AudioSet estan presentes en el clip, devolviendo una probabilidad independiente por clase (clasificacion multietiqueta). Se trata de un modelo de extraccion de caracteristicas acusticas seguido de una cabeza de clasificacion, construido sobre la arquitectura EAT-large (309 millones de parametros) y publicado con licencia MIT.

Su relevancia actual radica en el rendimiento: alcanza 0.5152 mAP sobre el conjunto de evaluacion de AudioSet (17.141 clips), superando a CED-base (0.4997), EAT-large original (0.4947), SSLAM (0.4944), EAT-base (0.4901), BEATs (0.4835) y AST (0.4572), medidos todos bajo el mismo protocolo y sobre los mismos clips. El modelo se obtiene por destilacion desde un ensemble de tres taggers publicados (CED-base, EAT-large y SSLAM) y, en una segunda etapa, desde un ensemble ampliado que incluye BEATs y versiones previas del propio modelo. El resultado es un unico modelo de 309M de parametros que aproxima el rendimiento de un ensemble de cinco, con el coste de inferencia de uno solo.

El modelo esta pensado como componente de preprocesado y curado de datos de audio a gran escala: deteccion de eventos, filtrado de corpus, anotacion automatica y busqueda por contenido sonoro. No es un modelo generativo ni un sistema de reconocimiento de voz; su salida es un vector de 527 probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAT (Efficient Audio Transformer) large, transformer con auto-supervision, adaptado a clasificacion multietiqueta |
| Parametros totales | 309.409.295 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 frames de filterbank (10,24 s de audio a 16 kHz); clips mas largos se procesan en ventanas de 10 s |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico; las etiquetas estan en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (via transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de EAT-large (Chen et al., IJCAI 2024), un transformer entrenado con auto-supervision sobre audio (Efficient Audio Transformer), afinado previamente sobre AudioSet-2M en el checkpoint `worstchan/EAT-large_epoch20_finetune_AS2M`. Sobre esa base, Scicom aplica un proceso de destilacion en dos etapas: primero destila el promedio de tres taggers publicados (CED-base + EAT-large + SSLAM, 0.5166 mAP promediado) y despues destila un ensemble mas amplio que anade BEATs y las versiones v3 y v4 del propio modelo (0.5218 mAP promediado). El conjunto de destilacion son 730.841 clips de AudioSet (2.011 horas), sin solapamiento con el conjunto de evaluacion.

La entrada es la propia de EAT: audio mono a 16 kHz, filterbanks Kaldi de 128 bins cada 10 ms, ventanas de 1024 frames (10,24 s) normalizadas con media -4,268 y desviacion 4,569. La salida es un vector de 527 logits que se pasan por sigmoide para obtener probabilidades independientes por clase. La innovacion principal no es arquitectonica sino metodologica: la destilacion multi-profesor permite que un modelo unico de 309M iguale o supere a cada uno de sus profesores por separado, evitando el coste de ejecutar un ensemble en produccion.

## Capacidades

- Clasificacion multietiqueta de audio sobre las 527 clases de AudioSet (sonidos humanos, musica, animales, naturaleza, objetos, fuentes de sonido y ambientes).
- Deteccion de eventos sonoros con puntuacion de confianza por clase (probabilidad sigmoide independiente).
- Extraccion de caracteristicas acusticas (el modelo base EAT puede usarse como extractor, aunque la cabeza publicada es de clasificacion).
- Procesamiento de clips de hasta 10,24 s por ventana; clips mas largos requieren segmentacion en ventanas de 10 s.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- No soporta vision, audio generativo ni texto libre; las etiquetas de salida estan en ingles.
- Capacidad multilingue: no aplica (el modelo no procesa lenguaje, solo acustica).

## Casos de uso

- Curado de corpus de audio a gran escala: filtrar miles de horas de grabaciones por presencia de clases concretas (voz, musica, ruido de trafico) antes de entrenar modelos de ASR o de diarizacion, usando el vector de 527 probabilidades como criterio de inclusion o exclusion.
- Anotacion automatica de datasets: generar etiquetas debiles multietiqueta sobre clips sin anotar y usarlas como preentrenamiento o como semilla para revision humana, aprovechando la mAP de 0.5152 sobre AudioSet.
- Monitorizacion acustica urbana o industrial: detectar eventos como sirenas, alarmas, cristales rotos o maquinaria en flujos de audio continuos segmentados en ventanas de 10 s, con umbrales por clase ajustables.
- Busqueda por contenido sonoro en archivos multimedia: indexar bibliotecas de video o podcast con las 527 etiquetas y permitir consultas del tipo "clips con aplausos y risas" mediante filtrado sobre las probabilidades.
- Moderacion y analisis de contenido: identificar clases sensibles (gritos, llanto infantil, conversacion) en plataformas de contenido generado por usuarios para enrutar a revision humana.
- Preprocesado en pipelines de datos de voz (contexto Melati): separar segmentos con habla de segmentos con musica o ruido ambiental antes de alimentar un sistema de reconocimiento de voz, usando la clase "Speech" (AP 0.857) como filtro primario.
- Investigacion en audio: linea base reproducible para experimentos de destilacion o de clasificacion de eventos sonoros, con pesos abiertos y licencia MIT que permite uso comercial y modificacion.

## Benchmarks y rendimiento

Resultados de mAP sobre el conjunto de evaluacion de AudioSet (17.141 clips, `agkphysics/AudioSet`), todos en fp32 y con el preprocesado propio de cada modelo:

| Modelo | mAP |
|---|---|
| **Melati-AudioSet-EAT-Large (este modelo)** | **0.5152** |
| Melati-AudioSet v4 (release previa) | 0.5123 |
| Melati-AudioSet v3 (release anterior) | 0.5105 |
| Este modelo tras etapa 2 | 0.5059 |
| Este modelo tras etapa 1 | 0.5033 |
| CED-base (Dinkel et al., ICASSP 2024) | 0.4997 |
| EAT-large (Chen et al., IJCAI 2024) | 0.4947 |
| SSLAM (Alex et al., ICLR 2025) | 0.4944 |
| EAT-base (Chen et al., IJCAI 2024) | 0.4901 |
| BEATs (Chen et al., ICML 2023) | 0.4835 |
| AST (Gong et al., Interspeech 2021) | 0.4572 |

El autor advierte que las cifras publicadas en papers no son comparables entre si porque el conjunto de evaluacion de AudioSet pierde clips con el tiempo (YouTube elimina videos); todas las cifras de la tabla se midieron sobre la misma copia actual. El modelo card incluye ademas el AP por clase sobre los 17.141 clips, con la media por categoria humana en 0.507 para las 72 clases de sonidos humanos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 (309M parametros x 4 bytes) mas activaciones; en la practica, con batch pequeno cabe en cualquier GPU con 4 GB o mas. En fp16, alrededor de 0,7 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; para throughput alto, A100, H100, L40S o RTX 4090. Para uso individual, RTX 3060 (12 GB) o superior.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada con 4 GB o mas, e incluso en CPU para volumentes moderados.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada); no se documentan exportaciones a ONNX, GGUF, vLLM, TGI ni Ollama, aunque al ser un transformer estandar podria exportarse a ONNX o TorchScript con trabajo adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | mAP AudioSet | Licencia | Disponibilidad |
|---|---|---|---|---|
| Melati-AudioSet-EAT-Large | 309M | 0.5152 | MIT | Hugging Face (transformers) |
| CED-base | no disponible | 0.4997 | no disponible | Hugging Face |
| EAT-large | 309M | 0.4947 | no disponible | Hugging Face |
| SSLAM | no disponible | 0.4944 | no disponible | Hugging Face |
| BEATs | no disponible | 0.4835 | no disponible | Hugging Face |
| AST | no disponible | 0.4572 | no disponible | Hugging Face |

La ventaja de este modelo frente a los anteriores es doble: mejor mAP sobre el mismo protocolo de evaluacion y licencia MIT explicita, lo que facilita el uso comercial sin las ambiguedades de licencia de algunos de los modelos de referencia (cuyos terminos no se detallan en la informacion disponible).

## Limitaciones y advertencias

- Rendimiento muy desigual por clase: aunque la mAP global es 0.5152, clases como "Groan" (AP 0.080), "Male speech" (AP 0.121) o "Narration, monologue" (AP 0.151) tienen un rendimiento bajo, mientras que "Snoring" (0.881), "Speech" (0.857) o "Whispering" (0.849) son muy fiables. No conviene asumir calidad uniforme en las 527 clases.
- Desequilibrio de clases en evaluacion: algunas clases tienen menos de 40 clips en el conjunto de evaluacion, lo que hace que sus AP sean ruidosas.
- Riesgo de falsos positivos y negativos en clases acusticamente proximas (por ejemplo, distintos tipos de risa o de habla), ya que el modelo puntua cada clase de forma independiente sin modelar correlaciones explicitas.
- Sesgo de dominio: entrenado y evaluado sobre AudioSet (clips de YouTube), puede degradarse en dominios distintos (audio de telefonia, sensores industriales, grabaciones de campo) sin reentrenamiento.
- Etiquetas en ingles y ligadas a la ontologia AudioSet: no cubre sonidos fuera de esas 527 clases.
- Ventana fija de 10,24 s: clips mas largos requieren segmentacion manual y agregacion de resultados, lo que anade complejidad y posibles perdidas de eventos breves.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo base EAT-large podria tener condiciones adicionales no detalladas en la informacion disponible; conviene verificar la cadena de licencias del checkpoint original.
- No es un modelo generativo: no produce transcripciones ni descripciones en lenguaje natural, solo puntuaciones por clase.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Melati-AudioSet-EAT-Large
- Ensemble destilado (profesor de la etapa 2): https://huggingface.co/Scicom-intl/Melati-AudioSet-Ensemble
- Repositorio del pipeline Melati: https://github.com/Scicom-AI-Enterprise-Organization/Melati
- Modelo base: https://huggingface.co/worstchan/EAT-large_epoch20_finetune_AS2M
- Dataset de evaluacion: https://huggingface.co/datasets/agkphysics/AudioSet
- Ontologia AudioSet: https://github.com/audioset/ontology
- Paper EAT (Chen et al., IJCAI 2024): no disponible en la informacion proporcionada
- Paper CED (Dinkel et al., ICASSP 2024): no disponible en la informacion proporcionada
- Paper SSLAM (Alex et al., ICLR 2025): no disponible en la informacion proporcionada
- Paper BEATs (Chen et al., ICML 2023): no disponible en la informacion proporcionada
- Paper AST (Gong et al., Interspeech 2021): no disponible en la informacion proporcionada
