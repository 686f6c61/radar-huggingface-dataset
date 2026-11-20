# AX1Y2JP/WeDetect-Tiny-ONNX

## Resumen

WeDetect-Tiny-ONNX es la exportación a formato ONNX del modelo WeDetect-Tiny, un detector de objetos zero-shot desarrollado originalmente por el usuario fushh7 y publicado en Hugging Face. Esta versión, mantenida por AX1Y2JP, separa el codificador de texto y el detector de visión en dos grafos ONNX independientes y elimina la supresión de no máximos (NMS) del grafo, lo que facilita la integración en pipelines de inferencia personalizados con ONNX Runtime. El modelo permite detectar objetos descritos mediante texto libre (por ejemplo, "gato", "perro", "coche") sin necesidad de reentrenamiento, siguiendo el paradigma de detección abierta de vocabulario.

La relevancia de esta ficha radica en que se trata de un modelo pequeño ("Tiny") orientado a despliegues con requisitos de cómputo moderados, exportado en tres variantes de precisión (fp32, fp16 e int8 con cuantización de solo pesos). El repositorio ocupa 2,3 GB e incluye los grafos ONNX, el tokenizador y los pesos en distintas precisiones. Al estar basado en el modelo original WeDetect, hereda su arquitectura de detección zero-shot, aunque la información pública disponible sobre el entrenamiento y los datos utilizados es muy limitada.

La licencia GPL-3.0 es un factor determinante para su adopción: cualquier uso comercial o distribución de software que integre el modelo debe cumplir con las obligaciones copyleft de dicha licencia. El modelo no dispone de descargas ni interacciones registradas en el momento de la consulta, lo que sugiere que se trata de una publicación reciente y con escasa validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detección zero-shot con codificador de texto y detector de visión separados (arquitectura base no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto generativo) |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32), int8 (cuantización de solo pesos mediante MatMulNBits) |
| Idiomas soportados | no disponible (las etiquetas de detección se proporcionan como texto libre; el tokenizador determina los idiomas, pero no se especifican) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (opsets 23, requiere ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original WeDetect. Por la descripción del uso y los grafos exportados, se trata de un sistema de detección zero-shot compuesto por un codificador de texto que transforma las etiquetas en embeddings (`txt_feats`) y un detector de visión que, a partir de la imagen y esos embeddings, produce cajas delimitadoras (`bboxes`) y puntuaciones (`scores`). Este esquema es característico de los detectores de vocabulario abierto que alinean representaciones de texto e imagen en un espacio común, aunque no se especifica si emplea un transformer visual, un backbone convolucional o una combinación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La exportación a ONNX separa el codificador de texto y el detector en dos grafos, mantiene el cómputo sin cambios respecto al original y deja fuera la NMS, que debe aplicarse externamente si se desea. La variante int8 emplea cuantización de solo pesos con `MatMulNBits`, lo que reduce el tamaño pero degrada la precisión respecto a fp16.

## Capacidades

- Detección de objetos zero-shot: permite especificar etiquetas en texto libre (por ejemplo, "gato", "perro", "coche") y obtener cajas delimitadoras con puntuaciones de confianza para cada una.
- Procesamiento de imágenes RGB con redimensionado y relleno a 640x640 píxeles, con corrección posterior de coordenadas.
- Codificación de texto independiente mediante un tokenizador externo (`tokenizer.json`), lo que permite reutilizar el codificador de texto para múltiples consultas.
- Inferencia en CPU y GPU mediante ONNX Runtime, con selección de proveedores de ejecución (`CUDAExecutionProvider`, `CPUExecutionProvider`).
- Tres niveles de precisión (fp32, fp16, int8) para ajustar el equilibrio entre velocidad, memoria y exactitud.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.
- Capacidades multilingües: no disponibles; dependen del tokenizador y de los datos de entrenamiento del modelo original, no documentados.

## Casos de uso

- **Detección de objetos en imágenes de vigilancia o monitorización**: el modelo permite definir etiquetas como "persona", "vehículo" o "mochila" en tiempo de inferencia y localizar esos objetos en cada fotograma, sin reentrenar. Es adecuado por su tamaño reducido y su exportación ONNX para integración en sistemas embebidos o servidores sin GPU dedicada.
- **Anotación automática de datasets**: en pipelines de etiquetado, se pueden generar cajas candidatas para clases personalizadas y revisarlas manualmente, acelerando la creación de datasets de detección. La separación entre codificador de texto y detector permite reutilizar los embeddings de texto para muchas imágenes.
- **Búsqueda visual por descripción textual**: dado un catálogo de imágenes, el modelo puede puntuar la presencia de objetos descritos por el usuario (por ejemplo, "sofá gris", "lámpara de pie") y devolver las imágenes con mayor coincidencia, útil en comercio electrónico o gestión de activos digitales.
- **Control de calidad en líneas de producción**: con etiquetas como "pieza defectuosa" o "tornillo", el detector puede señalar regiones sospechosas en imágenes industriales. La variante int8 reduce el coste de despliegue en dispositivos con recursos limitados, aunque con menor precisión.
- **Análisis de imágenes en aplicaciones móviles o de escritorio**: al estar en ONNX y ser un modelo "Tiny", puede integrarse en aplicaciones locales mediante ONNX Runtime, evitando el envío de imágenes a la nube y reduciendo la latencia.
- **Prototipado rápido de sistemas de detección**: investigadores y desarrolladores pueden validar la viabilidad de un caso de uso con vocabulario abierto antes de invertir en un modelo entrenado específicamente, gracias a la facilidad de definir etiquetas en texto y a la disponibilidad de tres precisiones.
- **Filtrado de contenido en plataformas**: detección de objetos no deseados (por ejemplo, armas o determinados productos) mediante etiquetas configurables, con revisión humana posterior; la licencia GPL-3.0 condiciona su integración en productos propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia orientativa, el repositorio completo ocupa 2,3 GB e incluye varias precisiones; la variante fp16 requiere aproximadamente la mitad del espacio de los pesos fp32, y la int8 aproximadamente una cuarta parte. La VRAM real depende del tamaño de las activaciones y del lote.
- **GPU recomendadas**: no especificadas por el autor. Por el tamaño del repositorio y la naturaleza "Tiny" del modelo, es probable que funcione en GPU de consumo como RTX 3060, RTX 4060 o RTX 4090, así como en GPU de datacenter (A100, H100) para mayor throughput, pero no hay datos publicados que lo confirmen.
- **Compatibilidad con GPU de consumo**: probable en modelos con al menos 4-6 GB de VRAM en fp16, aunque no confirmado.
- **Opciones de despliegue**: ONNX Runtime (CPU y CUDA), con soporte para los proveedores `CPUExecutionProvider` y `CUDAExecutionProvider`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. Dependen del hardware, la precisión (fp32/fp16/int8), el tamaño de la imagen (640x640) y el número de etiquetas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia conceptual, existen otros detectores zero-shot de vocabulario abierto (por ejemplo, la familia Grounding DINO o OWL-ViT), pero no se han encontrado datos en la información disponible que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia con WeDetect-Tiny-ONNX.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WeDetect-Tiny-ONNX | no disponible | no aplica | GPL-3.0 | Hugging Face (ONNX) |
| Alternativas zero-shot | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia GPL-3.0**: cualquier distribución de software que incorpore el modelo o una obra derivada debe publicarse bajo GPL-3.0, lo que puede ser incompatible con productos propietarios. Es imprescindible revisar las obligaciones copyleft antes de un uso comercial.
- **Ausencia de NMS en el grafo**: el modelo no incluye supresión de no máximos; el usuario debe aplicarla externamente para eliminar detecciones duplicadas, lo que añade complejidad al pipeline.
- **Precisión de la variante int8**: la cuantización de solo pesos con `MatMulNBits` reduce la exactitud respecto a fp16, según advierte el propio autor; no se recomienda para producción sin validación previa.
- **Riesgo de alucinación**: como detector zero-shot, puede producir cajas y puntuaciones para etiquetas que no están presentes en la imagen, especialmente con umbrales de confianza bajos o etiquetas ambiguas.
- **Sesgos**: no documentados. Al depender de los datos de entrenamiento del modelo original (no especificados), pueden existir sesgos en la detección según el dominio, la iluminación, la resolución o la cultura representada.
- **Idiomas**: no se especifican los idiomas soportados por el tokenizador; las etiquetas en castellano podrían funcionar peor que en inglés si el entrenamiento se realizó principalmente en este último.
- **Validación comunitaria limitada**: el repositorio no registra descargas ni interacciones, por lo que no hay evidencia pública de su robustez en producción.
- **Dependencia de ONNX Runtime 1.22+**: el opset 23 requiere una versión reciente de ONNX Runtime, lo que puede limitar su uso en entornos con versiones antiguas.
- **Información técnica incompleta**: no se detallan parámetros, arquitectura interna ni datos de entrenamiento, lo que dificulta evaluar su idoneidad frente a alternativas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AX1Y2JP/WeDetect-Tiny-ONNX)
- [Modelo base: fushh7/WeDetect](https://huggingface.co/fushh7/WeDetect)
- [Licencia GPL-3.0](https://huggingface.co/AX1Y2JP/WeDetect-Tiny-ONNX/blob/main/LICENSE)
