# mirth/earshot-clap-htsat-unfused

## Resumen

`mirth/earshot-clap-htsat-unfused` es una exportación a ONNX del modelo `laion/clap-htsat-unfused`, publicada por el usuario `mirth` para el proyecto Earshot, cuyo objetivo declarado es la detección de sonidos en dispositivo. CLAP (Contrastive Language-Audio Pretraining) es una familia de modelos contrastivos texto-audio: proyecta audio y descripciones textuales en un espacio de embeddings compartido, de modo que permite clasificación de audio zero-shot sin entrenamiento específico. El modelo original lo desarrolló LAION y se distribuye bajo licencia Apache-2.0.

Este repositorio no introduce pesos nuevos: es un export del modelo base (revisión `8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a`) con las torres separadas en dos ficheros ONNX, `audio_encoder.onnx` (FP32, 117,3 MB) y `text_encoder.onnx` (int8, 140,2 MB), más `tokenizer.json`, `preprocessing.json`, `model.json` y un `manifest.json` con tamaños y sumas SHA-256. El tamaño total del repositorio es de 0,3 GB.

Su relevancia actual es de tipo práctico: al estar en ONNX y con el codificador de texto cuantizado a int8, el modelo puede ejecutarse en CPU y en dispositivos de borde (móviles, SBC, navegador vía WebAssembly) sin GPU ni frameworks de deep learning pesados. No es un modelo de lenguaje: no genera texto ni razona, sino que produce embeddings comparables por similitud coseno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Export ONNX de CLAP con torres separadas (unfused): codificador de audio HTSAT y codificador de texto tipo transformer |
| Parametros totales | no disponible (los dos ficheros ONNX suman 257,5 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | entrada de audio fija de `[1, 1, 1001, 64]` tramas log-mel; longitud máxima de texto no disponible |
| Tipos de cuantizacion | FP32 (`audio_encoder.onnx`), int8 (`text_encoder.onnx`, con `MatMulNBits` de onnxruntime y embeddings int8) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`audio_encoder.onnx`, `text_encoder.onnx`) + `tokenizer.json`, `preprocessing.json`, `model.json` |

## Arquitectura y entrenamiento

El modelo base es un CLAP de tipo dual-encoder con fusión desactivada (de ahí el sufijo `unfused`): el audio y el texto se codifican por separado y la comparación se realiza a posteriori mediante similitud coseno entre embeddings, en lugar de fusionar ambas modalidades en una única torre. El codificador de audio es un HTSAT (Hierarchical Token-Semantic Audio Transformer), que trabaja sobre un espectrograma log-mel y produce un embedding global; el codificador de texto es un transformer que procesa la etiqueta o descripción textual. Al estar las torres separadas, es posible precalcular los embeddings de un vocabulario de etiquetas y reutilizarlos en cada inferencia, lo que abarata el coste en producción.

La aportación de esta ficha concreta es exclusivamente de empaquetado y cuantización: según la model card, los pesos no se han modificado salvo por la exportación y la cuantización del codificador de texto. El fichero de audio se exporta en FP32 y espera una entrada log-mel de dimensiones fijas `[1, 1, 1001, 64]`; el de texto se cuantiza a int8. No hay información en el repositorio sobre el dataset de entrenamiento, el número de tokens o pares audio-texto, ni sobre si se aplicaron fases de RLHF, DPO o ajuste fino posterior. A partir de los tamaños de fichero puede estimarse de forma aproximada un codificador de audio de unos 29 millones de parámetros (117,3 MB en FP32 a 4 bytes por parámetro) y un codificador de texto de unos 140 millones (140,2 MB en int8), pero son cifras derivadas, no declaradas por el autor.

## Capacidades

- Clasificación de audio zero-shot: asignar etiquetas definidas por el usuario en lenguaje natural sin reentrenamiento.
- Etiquetado multietiqueta mediante comparación de similitud coseno contra un conjunto de descripciones precalculadas.
- Recuperación texto-audio y audio-texto (retrieval) dentro de una colección de clips indexados por embedding.
- Detección de eventos sonoros en tiempo de ejecución sobre ventanas de audio de longitud fija, que es el caso de uso declarado del proyecto Earshot.
- Funcionamiento en entorno de borde: los dos ficheros ONNX permiten inferencia en CPU sin GPU.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto libre: no es un modelo generativo de lenguaje.
- Capacidades multilingües: no disponible; no hay ninguna declaración de idiomas en la información proporcionada.
- Capacidades de visión o audio generativo: no disponibles; el modelo solo produce embeddings.

## Casos de uso

- Detección de eventos acústicos en dispositivos de borde: el objetivo declarado del export es ejecutar detección de sonidos en dispositivo, de modo que un dispositivo con CPU modesta puede clasificar sonidos localmente sin enviar audio a la nube, lo que reduce latencia y evita problemas de privacidad.
- Etiquetado automático de archivos de audio: generar etiquetas descriptivas para bibliotecas de sonido o grabaciones largas segmentadas en ventanas y clasificadas contra un vocabulario textual definido por el equipo.
- Monitorización de ruido y contaminación acústica: desplegar el modelo en nodos de bajo consumo para distinguir tipos de fuentes sonoras (tráfico, obras, voces, sirena) y agregar estadísticas por franja horaria.
- Alertas domésticas y de seguridad: detección de eventos como cristales rotos, alarmas o llanto de bebé comparando el embedding del audio contra una lista corta de descripciones, con umbral de similitud ajustable.
- Accesibilidad para personas con hipoacusia: notificaciones en tiempo real de eventos sonoros relevantes del entorno (timbre, electrodoméstico, vehículo aproximándose) ejecutadas en el propio teléfono.
- Curación y preanotación de datasets: usar el modelo como primer filtro para agrupar o descartar clips antes de la revisión humana, reduciendo el coste de anotación manual.
- Búsqueda semántica en librerías de efectos de sonido: indexar los embeddings de audio de un catálogo y permitir consultas en lenguaje natural para productoras de vídeo, radio o videojuegos.
- Moderación de contenido en plataformas de audio: clasificar clips subidos por los usuarios contra categorías textuales definidas internamente antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (por ejemplo, exactitud zero-shot en AudioSet, ESC-50 o Clotho), ni datos de latencia o throughput del export ONNX. Tampoco se han encontrado referencias externas válidas en la búsqueda web realizada.

## Requisitos de hardware

- Peso en disco: 117,3 MB para `audio_encoder.onnx` (FP32), 140,2 MB para `text_encoder.onnx` (int8), 3,6 MB para `tokenizer.json` y tamaño total del repositorio de 0,3 GB.
- VRAM estimada: no aplica en el caso habitual; el modelo está pensado para CPU. En GPU, la huella de memoria de los pesos es inferior a 0,3 GB, a lo que hay que sumar activaciones del espectrograma de entrada.
- GPU recomendadas: no se especifica ninguna; el export es apto para ejecución en CPU y en aceleradores integrados. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) sobra en cuanto a memoria, pero no es un requisito.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en GPU integradas; el cuello de botella real es el preprocesado del espectrograma, no la memoria.
- Despliegue: ONNX Runtime en Python, C++, C# o Java; `onnxruntime-web` para navegador mediante WebAssembly; `onnxruntime-mobile` para Android e iOS; también es viable en placas tipo Raspberry Pi. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican, ya que están orientadas a modelos generativos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Torres | Formato de pesos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mirth/earshot-clap-htsat-unfused` | Separadas (unfused) | ONNX | FP32 (audio) e int8 (texto) | Apache-2.0 | Export listo para inferencia en borde |
| `laion/clap-htsat-unfused` | Separadas (unfused) | no disponible en la información proporcionada | No cuantizado (FP32) | Apache-2.0 | Modelo base del que deriva este export |
| `laion/clap-htsat-fused` | Fusionadas (fused) | no disponible en la información proporcionada | no disponible | Apache-2.0 | Variante del mismo modelo base con fusión de características |

No se dispone de datos de rendimiento, número de parámetros ni longitud de contexto de las alternativas dentro de la información proporcionada, por lo que la comparación se limita a los aspectos de empaquetado y licencia. No se han identificado en la búsqueda web otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni flujos de agentes. Cualquier uso que requiera generación debe combinarse con otro modelo.
- La clasificación zero-shot es sensible a la formulación textual de las etiquetas; sinónimos, nivel de detalle o idioma de las descripciones alteran el resultado y exigen ajuste empírico de umbrales.
- La entrada de audio tiene dimensiones fijas (`[1, 1, 1001, 64]` tramas log-mel); los audios más largos deben segmentarse y agregarse, y los más cortos rellenarse, lo que afecta a la calidad de la etiqueta final.
- No hay documentación sobre idiomas soportados; si el codificador de texto de la familia se entrenó con descripciones en inglés, el rendimiento con etiquetas en castellano puede degradarse.
- Riesgo de falsos positivos y falsos negativos: el modelo no está validado para aplicaciones de seguridad crítica ni sanitarias, donde no debería usarse como único mecanismo de decisión.
- El repositorio registra 0 descargas y 1 me gusta en el momento de la consulta, y se creó y actualizó el 2026-10-02; no hay evidencia de uso en producción ni historial de mantenimiento.
- Aunque la licencia Apache-2.0 permite uso comercial, conviene conservar la atribución a LAION y verificar las condiciones del modelo base.
- Antes de desplegar, hay que validar cada fichero contra las sumas SHA-256 del `manifest.json`, ya que es el propio autor quien lo indica como paso previo.
- Los resultados de la búsqueda web realizada no contienen información técnica relevante (se trata de contenido no relacionado), por lo que no existe validación externa de este export.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mirth/earshot-clap-htsat-unfused
- Modelo base: https://huggingface.co/laion/clap-htsat-unfused
- Revisión concreta del modelo base: https://huggingface.co/laion/clap-htsat-unfused/tree/8fa0f1c6d0433df6e97c127f64b2a1d6c0dcda8a
- Otros enlaces (papers, blogs, repositorios, demos): no disponibles. La búsqueda web realizada no devolvió ningún resultado relevante relacionado con el modelo.
