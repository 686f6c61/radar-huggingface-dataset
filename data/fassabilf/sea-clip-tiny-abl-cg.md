# fassabilf/sea-clip-tiny-abl-cg

## Resumen

SEA-CLIP-Tiny (ablation: Only CG) es un checkpoint de investigación publicado por el usuario fassabilf en HuggingFace, correspondiente a una de las filas de la tabla de ablación del artículo *SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages* (ACCV 2026). Se trata de un modelo de embeddings texto-imagen de tipo CLIP, construido sobre la librería open_clip, con una torre de visión ViT-T/16 y una torre de texto de 12 capas y 384 dimensiones, con dimensión de embedding compartida de 512. El total de parámetros es de 46,11 millones (5,62M en visión y 40,49M en texto).

La particularidad de este checkpoint es que no es el modelo principal, sino una variante de ablación entrenada exclusivamente con la mezcla «Only CG» (CulturalGround-OE-filt, 703.000 pares). Comparte arquitectura, pipeline e hiperparámetros con el modelo principal, de modo que la única variable es la composición de los datos de entrenamiento. Su utilidad es, por tanto, metodológica: permite aislar el efecto de un único corpus cultural sobre el rendimiento final del modelo.

El resultado es un caso claro de sobreajuste al dominio de entrenamiento: obtiene 46,5 de R@1 en el split retenido de CulturalGround, pero cae a 0,2 en WIT, 0,6 en Bloom, 0,2 en ImageNet y 0,2 en el promedio R@1 sobre XM3600, Flickr30k-200 y XTD-200. Es relevante ahora porque documenta de forma cuantitativa el fenómeno de olvido catastrófico en modelos multimodales multilingües de pequeño tamaño y sirve como referencia negativa frente al modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de dos torres: ViT-T/16 en vision + transformer de texto de 12 capas y 384 de ancho; dimension de embedding 512 |
| Parametros totales | 46,11 M (5,62 M vision + 40,49 M texto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (tokenizer CLIP BPE, vocabulario 49.408) |
| Tipos de cuantizacion | no disponible (el repositorio no publica variantes cuantizadas) |
| Idiomas soportados | en, id, jv, su, ms, th, vi, my |
| Licencia | MIT |
| Formato de pesos | Pesos PyTorch para open_clip, cargables mediante `hf-hub`; no se documentan otros formatos |
| Tamano del repositorio | 0,2 GB |
| Pipeline | zero-shot-image-classification |
| Tipo de tarea | Embeddings texto-imagen (retrieval y clasificacion zero-shot) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de CLIP de dos torres con similitud coseno. La torre de vision es un ViT-T/16 (Vision Transformer «tiny» con parches de 16x16), y la torre de texto es un transformer de 12 capas con ancho 384. Ambas proyectan a una dimension de embedding comun de 512. El tokenizer es el BPE de CLIP, con vocabulario de 49.408 entradas y una longitud de contexto de 77 tokens, lo que limita las entradas de texto a descripciones cortas.

El entrenamiento de este checkpoint concreto utiliza unicamente CulturalGround-OE-filt, un corpus filtrado de 703.000 pares imagen-texto, y emplea como profesor a MetaCLIP2-ViT-B-16-worldwide, es decir, se trata de un esquema de destilacion desde un modelo mayor. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores, algo coherente con un modelo puramente de representacion. Los hiperparametros exactos estan recogidos en el archivo `params.txt` del propio repositorio y el codigo de entrenamiento y evaluacion esta publicado en GitHub.

La innovacion tecnica del trabajo no reside en el checkpoint aislado, sino en el diseno experimental: al replicar exactamente la arquitectura del modelo principal y variar solo la mezcla de datos, el articulo permite atribuir las diferencias de rendimiento a la composicion del corpus y cuantificar la perdida de generalidad cuando se entrena con una unica fuente cultural.

## Capacidades

- Clasificacion de imagenes zero-shot: el modelo genera probabilidades sobre etiquetas textuales arbitrarias sin entrenamiento especifico por clase.
- Recuperacion texto-imagen e imagen-texto (retrieval) mediante similitud coseno en un espacio de 512 dimensiones.
- Generacion de embeddings multimodales reutilizables para busquedas por similitud, clustering o deduplicacion de pares imagen-texto.
- Cobertura multilingue limitada a ocho idiomas: ingles, indonesio, javanes, sundanes, malayo, tailandes, vietnamita y birmano.
- No dispone de generacion de texto: es un modelo de representacion, no un modelo generativo autorregresivo.
- No soporta tool calling, function calling ni uso como agente ni razonamiento multi-paso.
- No tiene modo «thinking», ni capacidades de audio, video ni vision dinamica.
- La ventana de contexto de 77 tokens restringe el uso a leyendas y frases cortas, no a parrafos largos.

## Casos de uso

- Estudio de ablacion de mezclas de datos: el checkpoint sirve como fila de control en experimentos que comparan el efecto de distintas combinaciones de corpus sobre un mismo modelo base. Es su proposito principal declarado.
- Analisis de olvido catastrofico: los valores de 0,2 en ImageNet, 0,2 en WIT y 0,6 en Bloom permiten cuantificar cuanto se degrada un CLIP tiny cuando se entrena con un unico dominio cultural.
- Recuperacion de contenido cultural del sudeste asiatico: dado que su unico dominio fuerte es CulturalGround (46,5 de R@1), es util para buscar imagenes etiquetadas dentro de ese corpus concreto.
- Construccion de lineas base negativas: en publicaciones sobre modelos multilingues de vision-lenguaje, este checkpoint funciona como referencia de bajo rendimiento frente al modelo principal.
- Validacion de pipelines de evaluacion: al ser pequeno y rapido, permite verificar implementaciones de metricas R@1 sobre XM3600, Flickr30k-200 y XTD-200 antes de lanzar evaluaciones costosas.
- Filtrado y deduplicacion de datasets a pequena escala: sus embeddings de 512 dimensiones pueden usarse para detectar pares imagen-texto casi duplicados dentro del dominio cultural.
- Prototipado educativo: con 46,11 M de parametros se ejecuta en CPU en pocos segundos, lo que lo hace apto para demostraciones de CLIP en docencia.
- No se recomienda su uso como clasificador zero-shot generalista: los 0,2 de exactitud en ImageNet lo desaconsejan para cualquier aplicacion de produccion fuera de CulturalGround.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Las metricas de recuperacion corresponden a R@1 sobre los splits retenidos de cada fuente de entrenamiento; la columna R@1-Avg es el promedio de recuperacion sobre XM3600, Flickr30k-200 y XTD-200.

| Metrica | Resultado |
|---|---|
| CG R@1 | 46,5 |
| WIT R@1 | 0,2 |
| Bloom R@1 | 0,6 |
| ImageNet (zero-shot, exactitud) | 0,2 |
| R@1-Avg (XM3600, Flickr30k-200, XTD-200) | 0,2 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni curvas de entrenamiento adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 184 MB con pesos en FP32, unos 92 MB en FP16/BF16 y unos 46 MB en INT8, sin contar activaciones ni overhead del runtime. En la practica, menos de 1 GB en cualquier configuracion razonable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. El modelo es funcional en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin ninguna optimizacion especial.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU y en aceleradores tipo Jetson.
- Ejecucion en CPU: viable para inferencia puntual; con 46,11 M de parametros los tiempos por lote son del orden de decenas o centenas de milisegundos, aunque no se publican cifras concretas.
- Opciones de despliegue: open_clip con PyTorch (via `open_clip.create_model_and_transforms('hf-hub:fassabilf/sea-clip-tiny-abl-cg')`), exportacion a ONNX u OpenVINO por parte del usuario. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de serie.
- Latencia y throughput: no disponible. El repositorio no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-cg (este checkpoint) | 46,11 M | 77 tokens | R@1-Avg 0,2; ImageNet 0,2 | MIT | HuggingFace, open_clip |
| sea-clip-tiny (modelo principal) | misma arquitectura, 46,11 M | 77 tokens | no disponible en la informacion proporcionada | MIT | HuggingFace, open_clip |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | no disponible | no disponible | no disponible | no disponible | usado como teacher en el entrenamiento |
| Otros CLIP tiny de la misma categoria (p. ej. ViT-B/32 de OpenAI, SigLIP base) | no disponible | no disponible | no disponible | no disponible | no verificados en la informacion disponible |

La unica comparacion con datos numericos es frente al propio modelo principal, cuyos resultados no se incluyen en la informacion disponible, y frente al profesor, del que tampoco se detallan parametros ni metricas. Para el resto de alternativas no se dispone de cifras verificables, por lo que no se incluyen valores estimados.

## Limitaciones y advertencias

- Es un checkpoint de ablacion, no un modelo destinado a produccion. La propia model card lo presenta como una fila de la tabla experimental.
- Sobreajuste severo al dominio: los 0,2 de ImageNet y los 0,2 de R@1-Avg indican un colapso practicamente total de la generalidad fuera de CulturalGround.
- Sesgo de dominio evidente: entrenado solo con CulturalGround-OE-filt (703.000 pares), el modelo refleja las distribuciones culturales, geograficas y de estilo de ese corpus.
- Riesgo de resultados degenerados: las capacidades de clasificacion zero-shot sobre vocabularios no culturales son cercanas al azar, lo que puede producir predicciones sin significado util.
- Limitacion de idioma: aunque la ficha declara ocho idiomas del sudeste asiatico mas ingles, los resultados publicados solo cubren conjuntos de evaluacion multilingues donde el rendimiento es de 0,2, y no se incluye el espanol.
- Limitacion de contexto: con 77 tokens de ventana, no admite descripciones largas, parrafos ni dialogos; las entradas deben ser leyendas breves.
- Sesgos socioculturales y de representacion: no se documenta ningun proceso de mitigacion de sesgos ni auditoria de equidad.
- Alucinacion en sentido estricto: no aplica, porque el modelo no genera texto; el riesgo equivalente es asignar etiquetas o recuperar pares con alta similitud pero semanticamente incorrectos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, sin restricciones adicionales declaradas.
- Caveat para produccion: no se publican pesos cuantizados, ni latencias, ni pruebas de robustez; cualquier despliegue exigiria una validacion propia y, previsiblemente, el uso del modelo principal en lugar de este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-cg
- Modelo principal (SEA-CLIP-Tiny): https://huggingface.co/fassabilf/sea-clip-tiny
- Codigo de entrenamiento y evaluacion: https://github.com/fassabilf/sea-clip-tiny
- Configuracion exacta del checkpoint: archivo `params.txt` dentro del repositorio
- Articulo: SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages, Asian Conference on Computer Vision (ACCV) 2026
