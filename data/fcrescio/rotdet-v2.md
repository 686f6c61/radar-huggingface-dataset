# fcrescio/rotdet-v2

## Resumen

RotDet v2 es un clasificador de visión por computador desarrollado por el usuario independiente fcrescio que resuelve un problema muy concreto del procesamiento documental: detectar la orientación de una página escaneada entre las cuatro rotaciones posibles (0, 90, 180 y 270 grados). No es un modelo de lenguaje ni un modelo multimodal generativo, sino un clasificador de imagen de cuatro clases que recibe una página en escala de grises y devuelve el ángulo de corrección necesario para dejarla en posición vertical. Su relevancia práctica está en que se ejecuta íntegramente en CPU, con checkpoints de apenas 1.560.900 bytes, lo que lo convierte en una pieza útil como paso previo a un pipeline de OCR.

La arquitectura publicada es la denominada C4Net corregida, con una propiedad de equivarianza al grupo cíclico C4 (las cuatro rotaciones de 90 grados), lo que encaja de forma natural con la tarea. El repositorio distribuye dos variantes congeladas entrenadas por separado, una a 256x256 píxeles y otra a 384x384 píxeles, ambas con el mismo tamaño de fichero de pesos. La variante de 256 es la recomendada por defecto por su menor coste de CPU en inferencia.

El modelo se entrena desde cero sobre 4.439 páginas verticales deduplicadas procedentes de 406 identificadores de Internet Archive, con aumento artificial mediante giros de cuarto de vuelta. La licencia del release v2.0.1 es GNU GPL versión 3 únicamente, lo que permite uso comercial pero impone condiciones de copyleft sobre redistribuciones del código y los checkpoints cubiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | C4Net (arquitectura C4Net corregida, con equivarianza C4); detalle de capas no disponible |
| Parámetros totales | no disponible (tamaño de pesos: 1.560.900 bytes por variante, idéntico en 256 y 384) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 256x256 o 384x384 en escala de grises |
| Tipos de cuantización | no disponible; solo se distribuyen checkpoints en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible; la model card no declara idiomas y la tarea es de orientación de imagen, no de procesamiento de texto |
| Licencia | GPL-3.0-only (etiqueta del repositorio: gpl-3.0); los checkpoints v1 conservan CC-BY-4.0 y las concesiones MIT previas sobre código siguen vigentes |
| Formato de pesos | safetensors (un `model.safetensors` por variante: `256/model.safetensors` y `384/model.safetensors`) |
| Pipeline | image-classification |
| Biblioteca | pytorch |
| Clases de salida | 4 (la clase k describe k*90 grados en sentido antihorario respecto a la vertical; la corrección equivale a k*90 grados en sentido horario) |
| Resolución de entrada | 256x256 (variante 256) y 384x384 (variante 384), ambas en un canal (grayscale) |

## Arquitectura y entrenamiento

La model card identifica explícitamente la arquitectura publicada como la C4Net corregida, y aclara que no se trata de la clase experimental C4NetV2. El rasgo técnico destacable es la equivarianza C4: el modelo está diseñado para que las cuatro rotaciones de 90 grados se relacionen de forma consistente entre sí, lo que es coherente con un espacio de etiquetas que es exactamente el grupo cíclico de orden 4. No se publica en la información disponible el número de capas, canales, tipo de bloques ni el detalle interno completo del grafo más allá de esa denominación. Cada carpeta del repositorio contiene la arquitectura exacta, la resolución de preprocesado y el hash SHA-256 del checkpoint en su `config.json`.

El entrenamiento se realizó desde cero sobre 4.439 páginas fuente verticales deduplicadas, procedentes de 406 identificadores de Internet Archive, con aumento artificial de giros de cuarto de vuelta. El preprocesado documentado es: RGB a escala de grises, redimensionado cuadrado con interpolación BICUBIC y normalización a float32 dividiendo entre 255. No se menciona en la información disponible ningún uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de cuatro clases. Sí se documentan la receta de entrenamiento y los enlaces a las fuentes en los ficheros de procedencia del repositorio. Ambos candidatos publicados usan la semilla 42, seleccionada antes de la evaluación independiente.

## Capacidades

- Clasificación de orientación documental en cuatro clases discretas: 0, 90, 180 y 270 grados respecto a la vertical.
- Devuelve el ángulo de corrección en sentido horario a través del campo `correction_cw_degrees` del resultado de predicción.
- Inferencia íntegramente en CPU, con la posibilidad de fijar el número de hilos de PyTorch (`torch.set_num_threads(4)` en el ejemplo oficial).
- Dos variantes con resoluciones de entrada distintas (256 y 384 píxeles), entrenadas por separado, no derivadas una de otra por cambio de resolución.
- Verificación de hashes de checkpoint integrada en la librería antes de ejecutar la predicción.
- No modifica los ficheros de entrada: la API de ejemplo trabaja sobre bytes leídos de un fichero y devuelve un resultado, sin escritura in situ.
- No incluye decodificador de PDF ni enderezado de ángulos finos (deskewing); solo corrige múltiplos de 90 grados.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión general, audio ni modo de pensamiento: es un clasificador de imagen de propósito único.

## Casos de uso

- Digitalización masiva de fondos documentales: situar la detección de orientación como primer paso de un pipeline de OCR sobre lotes de páginas escaneadas, de modo que el motor de reconocimiento de texto reciba las imágenes ya verticales y reduzca sus errores de lectura.
- Preprocesado en servicios de OCR en producción: al ejecutarse en CPU y tardar 29,4 ms por imagen con la variante de 256, permite normalizar la orientación en línea sin depender de GPU ni de servicios externos.
- Ingesta documental en banca y seguros: los expedientes que llegan escaneados o faxeados suelen contener páginas giradas; un clasificador de cuatro clases resuelve el caso antes de indexar el contenido en el gestor documental.
- Aplicaciones móviles de escaneo: la variante de 256 píxeles con pesos de 1,56 MB es viable para integración en flujos de captura donde la página puede haberse fotografiado en cualquier orientación.
- Normalización previa a pipelines de visión documental más complejos: detección de tablas, extracción de campos o clasificación de tipos de documento asumen entrada vertical, por lo que RotDet v2 actúa como etapa de saneamiento barata.
- Procesamiento por lotes en infraestructura sin GPU: equipos de archivo, bibliotecas y administraciones que procesan volúmenes grandes en servidores de CPU pueden aplicar el modelo sin aprovisionar aceleradores.
- Revisión asistida con intervención humana: en flujos donde una rotación incorrecta tiene consecuencias (por ejemplo, documentación legal o médica), el modelo puede usarse como preanotador y derivar los casos dudosos a revisión manual, dado que la confianza softmax no está calibrada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un corpus independiente de 192 páginas y 51 documentos. Las 164 etiquetas numéricas proceden de un modelo de visión y lenguaje, hay 28 páginas inciertas y no existe ninguna etiqueta de referencia humana (cobertura del 85,42%). Los tiempos corresponden a inferencia en CPU con cuatro hilos y por lotes de tamaño 1.

| Modelo | Aciertos / páginas etiquetadas | Precisión | Mediana CPU batch 1 |
|---|---:|---:|---:|
| RotDet v2 256 | 149 / 164 | 90,85 % | 29,4 ms |
| RotDet v2 384 | 147 / 164 | 89,63 % | 49,0 ms |
| Paddle PP-LCNet_x1_0_doc_ori | 154 / 164 | 93,90 % | 74,2 ms |

Además, en validación de desarrollo sobre documentos puros y con tres semillas emparejadas, la precisión media fue del 95,76 % a 256 píxeles y del 96,70 % a 384 píxeles. El autor advierte expresamente que estos son resultados de desarrollo, no de test independiente, y que la comparación emparejada con incertidumbre no establece superioridad ni equivalencia frente a los otros modelos. Las comprobaciones de paridad sobre 40 vistas fijas por variante verifican la identidad de los artefactos, no una medición nueva de precisión.

## Requisitos de hardware

- VRAM: prácticamente no aplica. Cada checkpoint ocupa 1.560.900 bytes y el modelo está pensado para ejecutarse en CPU; el autor indica que el tamaño de pesos no equivale al consumo de memoria del framework.
- GPU recomendadas: no se documentan GPU concretas ni requisitos de acelerador. No se mencionan A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: no es un requisito. El modelo cabe y funciona en CPU; no se aportan datos de rendimiento en GPU de consumo.
- CPU: es el entorno de referencia. El ejemplo oficial fija cuatro hilos con `torch.set_num_threads(4)` y los tiempos publicados (29,4 ms y 49,0 ms de mediana por imagen) corresponden a esa configuración. Las instalaciones anónimas y de prueba se verificaron en un entorno CPU limpio.
- Opciones de despliegue: la vía soportada es la librería `rotdet` de Python instalada desde el repositorio Git (`pip install 'rotdet[hub] @ git+https://github.com/fcrescio/rotdet.git@v2.0.1'`), con PyTorch instalado previamente. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: 29,4 ms de mediana por página con la variante de 256 y 49,0 ms con la de 384, con cuatro hilos de CPU y preprocesado nativo declarado. El autor advierte que no son garantías de rendimiento multiplataforma.
- Recomendación del autor: usar la variante de 256 por su menor coste de CPU. La de 384 rindió mejor en validación de desarrollo, pero no en el corpus independiente con anotación provisional.

## Comparativa con modelos similares

| Modelo | Tipo | Precisión en corpus independiente | Latencia CPU batch 1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RotDet v2 256 | Clasificador C4Net, 256x256 | 90,85 % (149/164) | 29,4 ms | GPL-3.0-only (v2.0.1) | HuggingFace fcrescio/rotdet-v2 y GitHub fcrescio/rotdet |
| RotDet v2 384 | Clasificador C4Net, 384x384 | 89,63 % (147/164) | 49,0 ms | GPL-3.0-only (v2.0.1) | HuggingFace fcrescio/rotdet-v2 y GitHub fcrescio/rotdet |
| Paddle PP-LCNet_x1_0_doc_ori | Clasificador de orientación documental de PaddlePaddle | 93,90 % (154/164) | 74,2 ms | no disponible en la información proporcionada | no disponible en la información proporcionada |
| RotDet v1 | Versión anterior del mismo autor | no disponible | no disponible | CC-BY-4.0 (los pesos v1 conservan su licencia) | no disponible en la información proporcionada |

Datos comparativos adicionales sobre parámetros, contexto o licencias de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Rotaciones incorrectas en escenarios documentados por el autor: texto disperso o con poca densidad, páginas en blanco, escritura manuscrita, múltiples direcciones de texto en la misma página, maquetaciones inusuales y cambios de dominio respecto a los datos de entrenamiento.
- La confianza softmax no está calibrada, por lo que no debe usarse como umbral fiable de decisión sin validación propia.
- La evaluación independiente parte de 164 etiquetas generadas por un modelo numérico de visión y lenguaje, con 28 páginas inciertas y cero etiquetas humanas de referencia. El autor subraya que esto no permite afirmar superioridad ni equivalencia frente a las alternativas comparadas.
- El corpus independiente está anotado de forma provisional y no es público: los documentos de evaluación privados no se incluyen en el release.
- Solo corrige ángulos de 90 grados. No incluye decodificador de PDF ni enderezado de ángulos finos, por lo que no resuelve inclinaciones leves de escaneado.
- Los datos de entrenamiento proceden de Internet Archive sin licencia explícita identificada. Los documentos no se redistribuyen, las citas documentan procedencia y no permiso de reutilización, y el propio autor aclara que considerar el uso para entrenamiento como uso legítimo es su postura, no una determinación legal.
- Licencia GPL-3.0-only para código y ambos checkpoints congelados v2 desde el release v2.0.1. Permite uso, modificación y uso comercial, pero impone condiciones de copyleft sobre redistribuciones cubiertas; no añade cláusula AGPL de red ni restricción no comercial. Las concesiones MIT anteriores sobre código ya publicado siguen vigentes y las etiquetas antiguas no se reescriben. Los pesos v1 mantienen CC-BY-4.0.
- La licencia no se aplica a los documentos originales ni a las dependencias; se trata de un release de modelo, no de un conjunto de datos.
- El repositorio de HuggingFace figura con 0 descargas y 0 valoraciones, además de un tamaño de repo reportado de 0.0 GB, por lo que la adopción pública verificable es mínima.
- En flujos donde una rotación errónea tenga consecuencias relevantes, el autor recomienda revisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fcrescio/rotdet-v2
- README en HuggingFace: https://huggingface.co/fcrescio/rotdet/blob/main/README.md
- Árbol de ficheros en HuggingFace: https://huggingface.co/fcrescio/rotdet/tree/main
- Repositorio de código en GitHub: https://github.com/fcrescio/rotdet
- Implementación de referencia (revisión concreta): https://github.com/fcrescio/rotdet/tree/11217d2
- Protocolo de benchmark y advertencias: https://github.com/fcrescio/rotdet/blob/main/docs/BENCHMARK.md
- Procedencia de los datos de entrenamiento: https://github.com/fcrescio/rotdet/blob/main/docs/DATA_PROVENANCE.md
- Fuentes de entrenamiento (JSON): https://github.com/fcrescio/rotdet/blob/main/docs/training_sources.json
- Alcance de la licencia: https://github.com/fcrescio/rotdet/blob/v2.0.1/docs/LICENSING.md
- Perfil del autor en GitHub: https://github.com/fcrescio
