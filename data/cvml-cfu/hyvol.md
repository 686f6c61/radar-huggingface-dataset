# CVML-CFU/HyVol

## Resumen

HyVol (Hypergraph-Regularized Gramian Volumes) es un módulo de regularización diseñado exclusivamente para el entrenamiento de modelos de recuperación multimodal (retrieval texto-vídeo). Lo desarrollan Anindya Nag, Ambuj Mehrish y Sebastiano Vascon (CVML-CFU) y se publica como material complementario de la ponencia aceptada en WACV 2027. Su función no es generar texto ni responder preguntas, sino mejorar cómo se aprenden las representaciones de vídeo y texto para que la búsqueda entre ambas modalidades sea más precisa: durante el entrenamiento se construye un hipergrafo que añade relaciones semánticas entre muestras y se incorpora a la pérdida basada en volúmenes de Gram.

La relevancia del enfoque está en su carácter no invasivo. El hipergrafo se elimina tras el entrenamiento, de modo que el backbone, la función de scoring y el coste de recuperación en inferencia permanecen intactos; no hay penalización de latencia ni de memoria en producción. El repositorio incluye dos checkpoints: uno sobre el backbone GRAM y otro sobre una variante hiperbólica denominada Hyperbolic GRAM. Ambos se entrenan con un subconjunto de 150.000 clips de VAST-27M y se evalúan en modo zero-shot.

Se trata, por tanto, de pesos preentrenados para investigación en recuperación texto-vídeo y audio-visual, no de un modelo generativo. No se publican en la información disponible el número de parámetros, la longitud de contexto, los idiomas soportados ni resultados numéricos de benchmarks; el repositorio ocupa 11,1 GB y contiene únicamente ficheros `.pt`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modulo de regularizacion mediante hipergrafo sobre backbones de retrieval video-texto (GRAM e Hyperbolic GRAM); no disponible el detalle de capas del backbone |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de retrieval, no generativo) |
| Tipos de cuantizacion | no disponible; solo se publican pesos PyTorch `.pt`, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch `.pt` (`GRAM_HYVOL/HyVol_GRAM.pt` y `HyperGRAM_HYVOL/HyVol_HyperGRAM.pt`) |

Otros datos del repositorio: tamano total de 11,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-20 y actualizado el 2026-10-20. El pipeline de HuggingFace no esta definido.

## Arquitectura y entrenamiento

HyVol es un modulo de entrenamiento, no una arquitectura completa. Su mecanica consiste en construir un hipergrafo que conecta muestras de entrenamiento mediante relaciones semanticas y utilizar esa estructura para regular la perdida de volumen de Gramian (Gramian Volumes), que es la base de los backbones GRAM. El hipergrafo actua como una señal adicional durante la optimizacion: agrupa muestras que deberian compartir estructura semantica y penaliza representaciones que no respetan esas vecindades de orden superior. Al finalizar el entrenamiento, el hipergrafo se descarta, de modo que el modelo resultante conserva exactamente el mismo esquema de scoring y el mismo coste de recuperacion que el backbone original.

En cuanto a los datos, ambos checkpoints se entrenan sobre un subconjunto de 150.000 clips de VAST-27M y se evaluan de forma zero-shot. No se especifican en la informacion disponible el numero total de tokens o clips vistos, la composicion detallada del dataset, ni si se aplicaron etapas de RLHF o DPO (poco probables en un modelo de retrieval). Tampoco se detalla la innovacion de attention ni el tipo de codificador de texto o de video empleado por cada backbone; para reproducir el entrenamiento es necesario usar el codebase propio de GRAM o de Hyperbolic GRAM, ya que los checkpoints no son autocontenidos.

## Capacidades

- Recuperacion texto-video: dado un texto, devolver los clips mas relevantes del corpus, y viceversa (video a texto), en regimen zero-shot.
- Recuperacion audio-visual: la etiqueta `audio-visual` del repositorio indica que el modelo maneja informacion de audio ademas de la visual, aunque no se detalla el esquema de fusion.
- Regularizacion semantica mediante hipergrafo durante el entrenamiento, con eliminacion del hipergrafo en inferencia.
- Compatibilidad con dos espacios de representacion distintos: uno euclideo (GRAM) y uno hiperbolico (Hyperbolic GRAM), segun el checkpoint cargado.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni tool calling: no es un modelo de lenguaje generativo.
- No se documentan capacidades de agente, multi-step reasoning ni modos de pensamiento (thinking mode).
- Cobertura multilingue: no disponible.

## Casos de uso

- Busqueda semantica en archivos audiovisuales: indexar una videoteca y recuperar clips a partir de descripciones en lenguaje natural, aprovechando la evaluacion zero-shot sobre VAST-27M para catalogos no vistos durante el entrenamiento.
- Pre-indexado y anotacion asistida de datasets de video: usar las representaciones aprendidas para agrupar clips similares y proponer etiquetas antes de una revision humana, reduciendo el trabajo manual en corpus de gran escala.
- Recomendacion y recuperacion de clips en plataformas de contenido: el modelo permite ordenar un catalogo por similitud texto-video sin cambiar la funcion de scoring del backbone, por lo que se integra en pipelines de recuperacion ya existentes.
- Edicion de video asistida: localizar tomas concretas ("primer plano de una calle con lluvia") dentro de material bruto, con busqueda cruzada entre audio y imagen.
- Investigacion en recuperacion multimodal: servir de base reproducible para ablations sobre regularizacion con hipergrafos, comparando GRAM frente a Hyperbolic GRAM con el mismo conjunto de entrenamiento de 150K clips.
- Deteccion de duplicados y near-duplicates en corpus de video: las representaciones de volumen permiten identificar clips casi identicos para deduplicar archivos o detectar reutilizacion de material.
- Moderacion y triaje de contenido audiovisual: recuperar clips que coincidan con descripciones problematicas para revision humana, sin coste adicional de inferencia respecto al backbone base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que ambos checkpoints se evaluan zero-shot sobre un subconjunto de 150.000 clips de VAST-27M, pero no se incluyen cifras de Recall@1, Recall@5, Recall@10, MEDR ni de ninguna otra metrica, ni comparaciones numericas con los backbones sin HyVol.

## Requisitos de hardware

- El repositorio completo ocupa 11,1 GB y contiene dos checkpoints; asumiendo un reparto equilibrado, cada fichero rondaria los 5,5 GB, aunque el tamano por checkpoint no se confirma en la informacion disponible.
- VRAM estimada para inferencia: no disponible. Como referencia de partida, cargar un checkpoint de unos 5,5 GB en fp32 exige al menos esa cantidad de memoria, mas la del backbone, el codificador de texto y los frames de video del lote; en fp16 la cifra de pesos se reduciria aproximadamente a la mitad.
- GPU recomendadas: no hay recomendacion del autor. Por el perfil de carga (backbone de video mas retrieval), son razonables A100 40/80 GB o H100 para evaluacion por lotes, y RTX 4090 (24 GB) para inferencia con lotes pequenos, siempre que el backbone elegido quepa en memoria.
- No se publican cifras de latencia ni de throughput.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo. La carga debe hacerse con el codebase del backbone correspondiente (GRAM o Hyperbolic GRAM) en PyTorch.
- Advertencia de seguridad al cargar: los `.pt` son serializaciones pickle; conviene usar `torch.load` con `weights_only=True` o auditar el fichero antes de ejecutarlo.

## Comparativa con modelos similares

| Modelo | Backbone | Entrenamiento | Coste en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyVol_GRAM | GRAM + hipergrafo | 150K clips de VAST-27M, zero-shot | Igual que GRAM (hipergrafo eliminado) | CC BY 4.0 | Checkpoint en el repo |
| HyVol_HyperGRAM | Hyperbolic GRAM + hipergrafo | 150K clips de VAST-27M, zero-shot | Igual que Hyperbolic GRAM (hipergrafo eliminado) | CC BY 4.0 | Checkpoint en el repo |
| GRAM (sin HyVol) | GRAM | No disponible en esta informacion | Referencia base | No disponible | No incluido en este repo |
| Hyperbolic GRAM (sin HyVol) | Hyperbolic GRAM | No disponible en esta informacion | Referencia base | No disponible | No incluido en este repo |

No se dispone de datos de parametros, contexto ni metricas para establecer una comparacion cuantitativa con alternativas de la misma categoria (por ejemplo CLIP4Clip, X-CLIP o InternVideo); no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: HyVol es un modulo de entrenamiento y los checkpoints requieren el codebase de GRAM o de Hyperbolic GRAM para cargarse y ejecutarse.
- Ausencia total de metricas publicadas en la informacion disponible, lo que impide validar la mejora frente a los backbones sin regularizacion.
- Sin datos sobre sesgos: no se documenta la composicion de VAST-27M ni posibles sesgos de genero, raza, cultura o idioma en las representaciones aprendidas.
- Riesgo de recuperacion espuria: como cualquier modelo de retrieval, puede devolver clips con alta similitud en el espacio latente pero irrelevantes semanticamente; no hay mecanismo de absteccion documentado.
- Idiomas soportados no disponibles: se desconoce si el codificador de texto cubre unicamente ingles o es multilingue, lo que afecta directamente a despliegues en castellano.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero no cubre las licencias del codigo y los pesos de los backbones GRAM e Hyperbolic GRAM, que deben verificarse por separado.
- Traccion practica nula en el momento de la consulta (0 descargas, 0 likes) y publicacion muy reciente (2026-10-20); no hay evidencia de uso en produccion ni informes de terceros.
- Los ficheros `.pt` plantean riesgos de deserializacion pickle; se recomienda cargarlos en entornos aislados.
- El paper esta asociado a WACV 2027 y a arXiv:2609.15320; conviene contrastar cualquier resultado con la version publicada antes de tomar decisiones de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CVML-CFU/HyVol
- Paper (arXiv): https://arxiv.org/abs/2609.15320
- Repositorio espejo en HuggingFace: https://huggingface.co/anindyanag58/HyVol
- Repositorio de recursos CV/ML mencionado en la busqueda (no oficial del modelo): https://github.com/alidiba67/CVML
