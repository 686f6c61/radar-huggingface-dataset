# LibreYOLO/LibreMarigoldV2b-depth

## Resumen

LibreMarigoldV2b-depth es un adaptador de estimación de profundidad publicado por LibreYOLO que empaqueta el adaptador `log-stage2` de Marigold V2 junto con los tensores de prompt fijos, en un formato consumible por la librería `libreyolo`. No es un modelo autónomo: se apoya en dos piezas externas, el adaptador y decodificador de `huawei-bayerlab/marigold-v2-0` (subcarpeta `depth/Log-stage2`) y el modelo base congelado `Qwen/Qwen-Image-Edit-2509`, que se descarga por separado. El repositorio ocupa 1,9 GB y la conversión se limita a metadatos y a un marcador de variante, sin tocar el adaptador de inferencia, el decodificador ni los tensores de prompt.

La relevancia del artefacto es de ingeniería más que de investigación: traslada un pipeline de difusión para profundidad a una interfaz de una sola llamada (`LibreYOLO("LibreMarigoldV2b-depth.pt")`), con salida devuelta a la resolución original de la imagen. La salida usa codificación `log_depth` y es afín-relativa en ese espacio, es decir, no está expresada en metros. La validación publicada por el autor se limita a comparaciones de paridad de implementación contra la salida nativa del código original, con diferencia absoluta máxima de 0.0 sobre una NVIDIA L40S.

Se trata de un lanzamiento muy reciente (creado y actualizado el 10 de septiembre de 2026) sin descargas ni valoraciones en el momento de redactar esta ficha, por lo que la evidencia disponible sobre su comportamiento en producción es escasa y procede únicamente de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (etiqueta del autor: `diffusion-transformer`), adaptador de Marigold V2 `log-stage2` sobre base congelada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de estimación de profundidad a partir de imagen; no es un modelo de lenguaje) |
| Tipos de cuantización | NF4 y BF16 en CUDA (probados por el autor); otros no disponibles |
| Idiomas soportados | no disponible (no aplica a la tarea) |
| Licencia | Apache-2.0 (los pesos preentrenados no están cubiertos por la licencia MIT del código fuente de LibreYOLO) |
| Formato de pesos | checkpoint PyTorch (`.pt`) para la librería `libreyolo`; no se indica safetensors |
| Pipeline | `depth-estimation` |
| Librería | `libreyolo` |
| Modelos base | `huawei-bayerlab/marigold-v2-0` (revisión `6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad`, subcarpeta `depth/Log-stage2`) y `Qwen/Qwen-Image-Edit-2509` (revisión `d3968ef930e841f4c73640fb8afa3b306a78167e`, congelado, descargado aparte) |
| Tamaño del repositorio | 1,9 GB |
| Codificación de salida | `log_depth`, afín-relativa en ese espacio; no son metros |
| Resolución de salida | lienzo nativo redondeado al múltiplo de 16 superior; `imgsz=512` fuerza un lienzo cuadrado fijo; la salida vuelve a la resolución original |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un adaptador de refinamiento de profundidad construido sobre el enfoque Marigold V2, que emplea un transformer de difusión como decodificador sobre un modelo generativo de imagen congelado. En esta variante concreta, la base congelada es `Qwen/Qwen-Image-Edit-2509` y el adaptador corresponde a la etapa `Log-stage2`, que opera en espacio logarítmico de profundidad (`log_depth`). El artefacto distribuido contiene el adaptador de inferencia, el decodificador y los tensores de prompt fijos, sin modificaciones respecto al original; los únicos cambios introducidos por LibreYOLO son metadatos y un marcador de variante, y se omiten dos tensores de proyección iREPA que solo intervienen en entrenamiento.

No hay información disponible sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el coste de cómputo, porque el repositorio es una conversión de un adaptador ya entrenado por Huawei y no documenta el proceso de entrenamiento. La conversión está implementada en `libreyolo/models/marigold_v2/convert.py`. La validación declarada cubre dos comparaciones entre la salida del código original y la salida nativa con el mismo trabajador, con diferencia absoluta máxima de 0.0 en NVIDIA L40S con PyTorch 2.10.0+cu128; el autor aclara explícitamente que esto verifica paridad de implementación, no exactitud frente a benchmarks publicados ni acuerdo bit a bit entre máquinas distintas. El entrenamiento, la exportación y la ejecución en MPS no están soportados por esta integración.

## Capacidades

- Estimación de profundidad monocular a partir de una imagen de entrada, con salida en codificación `log_depth`.
- Profundidad afín-relativa: la salida es consistente en orden y estructura, pero no es métrica ni está calibrada en metros.
- Salida devuelta a la resolución original de la imagen, con lienzo nativo redondeado a múltiplos de 16 o lienzo cuadrado fijo con `imgsz=512`.
- Inferencia en CUDA con cuantización NF4 y BF16 (probadas por el autor).
- Interfaz de una sola llamada mediante `libreyolo`, con utilidades de visualización (`result.plot().save(...)`) y acceso a los valores como `result.depth_map.numpy().data`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión descriptiva, tool calling, function calling, capacidades de agente ni modo de pensamiento: es un modelo especializado en una única tarea densa de regresión.
- No se documentan capacidades multilingües ni ningún otro idioma, ya que la tarea no consume texto.

## Casos de uso

- Reconstrucción 3D y estructura a partir del movimiento: el mapa de profundidad denso sirve como inicialización o como término de regularización en pipelines de fotogrametría, teniendo en cuenta que la escala es relativa y requiere alineación posterior.
- Generación de datos sintéticos para entrenamiento: se pueden producir pares imagen-profundidad para preentrenar modelos discriminativos de profundidad, ya que la salida vuelve a la resolución original y conserva la estructura de la escena.
- Control de difusión para generación de imagen: el mapa `log_depth` es directamente utilizable como condicionamiento tipo depth en pipelines de difusión, aprovechando que el decodificador comparte familia con el modelo base.
- Efectos de desenfoque y bokeh dependientes de profundidad: al ser afín-relativa, basta con reescalar el rango para obtener máscaras de enfoque sin necesidad de calibración métrica.
- Preprocesado para robótica y navegación en interiores: útil para razonamiento de oclusión y orden relativo entre obstáculos, siempre que no se use como medida de distancia en metros sin calibrar la escala.
- Segmentación y análisis de escenas asistidos por profundidad: la señal densa permite separar primer plano y fondo o resolver ambigüedades de oclusión antes de aplicar segmentadores.
- Aseguramiento de calidad en pipelines de visión: el modo de paridad permite comparar salidas contra la implementación nativa de Marigold V2 y detectar regresiones en el preprocesado o en el decodificador.
- Prototipado rápido en investigación: la interfaz de `libreyolo` reduce la integración a una llamada, lo que facilita estudios comparativos de profundidad sin escribir el pipeline de difusión completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento declarada es una comprobación de paridad de implementación, que se reproduce a continuación.

| Comprobación | Entorno | Resultado |
|---|---|---|
| Paridad salida original vs. salida nativa (2 comparaciones, mismo trabajador) | NVIDIA L40S, PyTorch 2.10.0+cu128 | Diferencia absoluta máxima 0.0 |
| Inferencia CUDA NF4 / BF16 | CUDA | Probada, sin cifras publicadas |
| Entrenamiento, exportación, MPS | — | No soportados |

No hay datos de MMLU, HumanEval, GSM8K ni de métricas de profundidad como AbsRel, RMSE o δ1, ya que no aplican a un modelo de profundidad y no se han publicado en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 1,9 GB corresponde solo al adaptador y a los tensores de prompt; el modelo base `Qwen/Qwen-Image-Edit-2509` se descarga aparte y domina con holgura el consumo de memoria.
- GPU recomendadas: no hay una lista publicada por el autor. La única GPU mencionada en la validación es NVIDIA L40S, con PyTorch 2.10.0+cu128.
- GPU de consumo: no disponible. No se documenta si el conjunto adaptador más base cabe en tarjetas tipo RTX 4090, ni con qué cuantización.
- Cuantización: la integración ha sido probada con NF4 y BF16 en CUDA, lo que sugiere que la reducción a 4 bits es una vía viable para disminuir el requisito de memoria, sin cifras asociadas.
- Opciones de despliegue: la soportada es `libreyolo` con las dependencias `libreyolo[marigold]`, sobre la rama `feat/marigoldv2` del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Plataformas no soportadas: entrenamiento, exportación a otros formatos y MPS (Apple Silicon).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreMarigoldV2b-depth | Adaptador de difusión para profundidad (no autónomo) | no disponible | Lienzo nativo múltiplo de 16; `imgsz=512` opcional | Apache-2.0 | HuggingFace, vía `libreyolo` |
| huawei-bayerlab/marigold-v2-0 | Implementación de referencia de la que procede el adaptador | no disponible | no disponible | Apache-2.0 | HuggingFace y repositorio de código |
| Qwen/Qwen-Image-Edit-2509 | Modelo base de edición de imagen, usado aquí congelado | no disponible | no disponible | Apache-2.0 | HuggingFace (descarga separada) |

No se dispone de datos comparativos de rendimiento frente a alternativas discriminativas de estimación de profundidad, por lo que no se incluyen cifras. La diferencia funcional principal frente a la implementación de referencia es el envoltorio de `libreyolo` y la omisión de dos tensores exclusivos de entrenamiento; el resto del pipeline es idéntico.

## Limitaciones y advertencias

- No es un modelo autónomo: el checkpoint no contiene el modelo base `Qwen/Qwen-Image-Edit-2509`, que debe descargarse aparte. Sin él, el adaptador no funciona.
- La profundidad es afín-relativa en espacio `log_depth` y no está en metros. Cualquier uso que requiera distancias absolutas exige calibración de escala externa.
- Riesgo de alucinación geométrica: como modelo generativo de difusión, puede producir estructuras de profundidad plausibles pero incorrectas en regiones ambiguas, especulares, transparentes o con textura repetitiva.
- La validación publicada solo demuestra paridad de implementación contra el código original, no exactitud frente a verdad de referencia ni equivalencia bit a bit entre máquinas distintas.
- Entrenamiento, exportación y MPS no están soportados por la integración; el despliegue queda limitado a CUDA con las dependencias de `libreyolo[marigold]`.
- La rama de integración es `feat/marigoldv2`, es decir, una rama de funcionalidad y no una versión estable publicada.
- Licencia: el adaptador es Apache-2.0, pero los pesos preentrenados no están cubiertos por la licencia MIT del código fuente de LibreYOLO. Hay que revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- El repositorio no declara idiomas soportados; la tarea no consume texto, por lo que no hay evaluación multilingüe posible.
- Sin descargas ni valoraciones, no existe validación independiente de la comunidad sobre el comportamiento del artefacto.
- No se documentan sesgos específicos, aunque al ser un modelo derivado de datos de imagen hereda los sesgos de representación de su corpus de entrenamiento, que no se detalla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreMarigoldV2b-depth
- Modelo base de profundidad: https://huggingface.co/huawei-bayerlab/marigold-v2-0/tree/6fd6d1ca246c9d2d99a4d8ac375a4eccc87178ad
- Modelo base congelado de edición de imagen: https://huggingface.co/Qwen/Qwen-Image-Edit-2509/tree/d3968ef930e841f4c73640fb8afa3b306a78167e
- Implementación de referencia de Marigold V2: https://github.com/huawei-bayerlab/marigold-v2/tree/cc6a7031abcd59fd9e1ceff7fdd0d9687d389bc5
- Rama de integración de LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/feat/marigoldv2
- Script de conversión: https://github.com/LibreYOLO/libreyolo/blob/feat/marigoldv2/libreyolo/models/marigold_v2/convert.py
- Licencia del repositorio: ./LICENSE
- Aviso legal del repositorio: ./NOTICE
