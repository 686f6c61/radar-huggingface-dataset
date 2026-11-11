# rejenat/NativeDETR-weights

## Resumen

NativeDETR-weights es un paquete de pesos para la librería `rfdetr` que permite ejecutar el modelo RF-DETR Seg Large (clases COCO) sobre imágenes de cualquier resolución mediante un esquema de inferencia a resolución nativa. No se trata de un modelo nuevo entrenado desde cero, sino de los pesos preentrenados de Roboflow RF-DETR Seg Large re-guardados para un nuevo esquema de inferencia, sin reentrenamiento ni inicialización aleatoria. El autor del repositorio es `rejenat` y la licencia es Apache-2.0.

La innovación es puramente de inferencia: el backbone se ejecuta sobre teselas solapadas de 504 px, las características de cada tesela se cosen en un único mapa y el decodificador se ejecuta una sola vez sobre la imagen completa. Una pasada global a 504 px añade los objetos cuyo tamaño supera el de una tesela. Esto resuelve el problema clásico de DETR, que requiere redimensionar la entrada a una resolución fija y pierde detalle en imágenes grandes.

El repositorio es de tamaño reducido (0,1 GB) y no registra descargas ni interacciones en el momento de la consulta. Está orientado a detección de objetos e incluye segmentación de instancias entre sus etiquetas, aunque la model card solo describe el pipeline de detección.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DETR (RF-DETR Seg Large) con esquema de inferencia por teselas solapadas de 504 px y decodificador global |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), con `architecture.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es RF-DETR Seg Large de Roboflow, un transformer DETR orientado a detección y segmentación de instancias sobre las clases de COCO. NativeDETR no modifica los pesos ni el entrenamiento: re-guarda el checkpoint preentrenado para un esquema de inferencia alternativo. El backbone procesa la imagen en teselas solapadas de 504 px, cuyas características se cosen en un mapa único; el decodificador se aplica una sola vez sobre ese mapa global. Una segunda pasada a 504 px sobre la imagen completa captura objetos de tamaño superior a una tesela.

El archivo `native-any.pt` soporta cualquier tamaño de entrada y reajusta el prior de cajas en tiempo de ejecución. El archivo `architecture.json` documenta los argumentos del constructor y la procedencia del checkpoint base (incluido su SHA256), y `SHA256SUMS` permite verificar la integridad de los archivos. No hay datos disponibles sobre el número de tokens de entrenamiento ni sobre el dataset, más allá de que las clases son las de COCO.

## Capacidades

- Detección de objetos sobre imágenes de resolución arbitraria sin redimensionado forzado a una resolución fija.
- Segmentación de instancias (etiqueta `instance-segmentation` en el repositorio).
- Detección de objetos de gran tamaño mediante la pasada global a 504 px, complementaria a la detección por teselas.
- Reajuste dinámico del prior de cajas en tiempo de ejecución para entradas de cualquier tamaño.
- Verificación de integridad y procedencia del checkpoint mediante `SHA256SUMS` y `architecture.json`.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento, por tratarse de un modelo de visión.

## Casos de uso

- Detección de objetos en imágenes de alta resolución: el esquema por teselas permite procesar fotografías aéreas o satelitales sin perder objetos pequeños, manteniendo además una pasada global para objetos grandes.
- Inspección visual industrial: análisis de imágenes de líneas de producción a resolución completa para localizar defectos o componentes, evitando el redimensionado que degrada el detalle.
- Vigilancia y análisis de vídeo con recortes de alta resolución: aplicación del modelo a fotogramas o regiones de interés sin reescalar, aprovechando la detección multi-escala por teselas y pasada global.
- Segmentación de instancias en imágenes médicas o microscopía: la capacidad de segmentación y el procesamiento a resolución nativa facilitan la delimitación de estructuras pequeñas.
- Procesamiento de documentos y planos: detección de elementos (sellos, firmas, símbolos) en imágenes de gran tamaño donde el redimensionado a 504 px perdería detalle.
- Integración en pipelines de visión con `rfdetr`: al usar la librería `rfdetr` y pesos en formato `.pt`, puede cargarse en flujos existentes basados en RF-DETR y verificarse su integridad con `sha256sum -c SHA256SUMS`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no publica el número de parámetros ni mediciones de memoria).
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible.
- Opciones de despliegue: la librería `rfdetr` (carga de pesos `.pt`); no se documentan otros motores como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| NativeDETR-weights | RF-DETR Seg Large con inferencia por teselas | Cualquier tamaño de entrada (teselas de 504 px) | Apache-2.0 | Hugging Face (`rejenat/NativeDETR-weights`) |
| RF-DETR Seg Large (Roboflow) | DETR | Resolución fija de entrada | Apache-2.0 | GitHub de Roboflow |
| DETR original | Transformer DETR | Resolución fija de entrada | Apache-2.0 | Repositorio original de Facebook Research |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero: los pesos son los de RF-DETR Seg Large re-guardados; cualquier limitación del modelo base se hereda.
- El esquema por teselas añade coste computacional por el solapamiento y la pasada global adicional; no se documentan mediciones de latencia.
- La detección de objetos mayores que una tesela depende de la pasada global a 504 px, lo que puede afectar a la coherencia entre escalas.
- No se documentan sesgos, tasas de alucinación ni evaluación cualitativa del modelo.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse la atribución y las condiciones de la licencia del modelo base de Roboflow.
- No se especifican idiomas ni capacidades de texto; el uso previsto es exclusivamente de visión por computador.

## Enlaces

- Hugging Face: https://huggingface.co/rejenat/NativeDETR-weights
- RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
