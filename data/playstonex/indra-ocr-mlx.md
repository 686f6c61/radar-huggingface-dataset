# playstonex/indra-ocr-mlx

## Resumen

indra-ocr-mlx es una conversión al framework MLX del modelo `datalab-to/indra-ocr`, un sistema OCR completo desarrollado por Datalab. El paquete reúne los grafos ONNX originales del pipeline (detección de líneas de texto, orientación, orden de lectura, clasificación de escritura y reconocedores especializados por familia de escritura, además de un módulo específico para fórmulas matemáticas) y los reexporta como bundles `*.mlxonnx` autocontenidos, de modo que todo el flujo detect → recognize → reading-order se ejecuta de forma nativa en Apple Silicon sin depender de `onnxruntime`.

La relevancia de esta conversión es de infraestructura: permite desplegar un OCR multilingüe (11 idiomas declarados, con reconocedores separados para latino, CJK, RTL y otras escrituras) sobre la GPU de equipos Mac mediante MLX, lo que simplifica el stack en entornos de desarrollo y despliegue local. El repositorio está pensado para consumirse desde la librería Swift MlxOCRKit, en su nivel `indra`.

No se dispone de información pública sobre el tamaño en parámetros del modelo ni sobre resultados de benchmarks; el repositorio aparece con 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado del repo es de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que la métrica no está actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR multi-etapa basado en grafos exportados a MLX (`*.mlxonnx`): detector de líneas, orientación, orden de lectura, clasificador de escritura, reconocedores por familia y encoder/decoder/clasificador matemático |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (geometría de entrada: `det_long_side=1024`, `rec_height=32`, `rec_window=3`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr, de, es, it, pt, nl, zh, ja, ko, ar |
| Licencia | openrail (AI Pubs Open RAIL-M License, Modified, heredada del modelo base) |
| Formato de pesos | `graph.json` + `weights.safetensors` dentro de bundles `*.mlxonnx`; `meta.json` con vocabulario, geometría y parámetros de LM |
| Libreria | mlx |
| Pipeline | image-to-text |
| Modelo base | datalab-to/indra-ocr |
| Tamano del repo | 0.0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

El paquete no es un transformer único, sino un ensemble de submodelos OCR orquestados en cadena. Cada grafo upstream en formato ONNX se exporta de forma independiente mediante `tools/export_mlxonnx.py` a un bundle autocontenido con `graph.json` (topología) y `weights.safetensors` (pesos). Los componentes son: `det` (detección de líneas de texto), `orient` (orientación de página y línea), `order` (orden de lectura), `script` (clasificación de escritura), cuatro reconocedores (`rec` para latino, `rec_cjk` para chino/japonés/coreano, `rec_rtl` para escrituras de derecha a izquierda y `rec_world` para otras), y un bloque matemático compuesto por `math_enc`, `math_dec_init`, `math_dec_step` y `mathcls`.

La geometría de inferencia está fijada en `meta.json`: lado largo del detector de 1024 píxeles, altura de entrada del reconocedor de 32 píxeles y ventana de reconocimiento de 3. Los grupos de escritura declarados son `base`, `cjk`, `rtl` y `world`. Los modelos de lenguaje n-grama en formato `.npz` del repositorio original se excluyen deliberadamente: el decodificador MLX-Swift solo consume los grafos `*.mlxonnx` y `meta.json`, donde se registran los parámetros de gating del LM bajo `lm_params`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Detección de líneas de texto sobre imágenes de página completa con lado largo normalizado a 1024 píxeles.
- Corrección de orientación de página y de línea antes del reconocimiento.
- Determinación del orden de lectura, necesario para reconstruir el flujo textual en diseños multicolumna.
- Clasificación automática de la escritura de cada región para enrutarla al reconocedor adecuado.
- Reconocimiento de texto en escrituras latinas (inglés, francés, alemán, español, italiano, portugués, neerlandés).
- Reconocimiento de escrituras CJK (chino, japonés, coreano) mediante un reconocedor dedicado.
- Reconocimiento de escrituras de derecha a izquierda (árabe) mediante un reconocedor específico.
- Reconocimiento de otras escrituras a través del módulo `rec_world`.
- OCR matemático con encoder, decoder en dos fases (inicialización y paso) y clasificador.
- Ejecución nativa en GPU de Apple Silicon mediante MLX, sin `onnxruntime`.
- Integración como nivel `indra` de la librería Swift MlxOCRKit.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Digitalización de archivos PDF escaneados en macOS: el paquete procesa documentos completos a través de MlxOCRKit (`minerukit --tier indra --indra-model ... input.pdf`), aprovechando la GPU de Apple Silicon para evitar dependencias de `onnxruntime` en el flujo de trabajo.
- Extracción de texto de documentación técnica multicolumna: el módulo `order` reconstruye el orden de lectura, lo que permite obtener texto linealizado correctamente a partir de maquetaciones complejas.
- Procesamiento de documentos multilingües en un único pipeline: la clasificación de escritura enruta cada región al reconocedor latino, CJK, RTL o `world`, de modo que un mismo lote puede contener páginas en español, chino y árabe sin cambiar de modelo.
- Captura de fórmulas en artículos científicos y apuntes: el bloque matemático (`math_enc`, `math_dec_init`, `math_dec_step`, `mathcls`) está diseñado específicamente para transcribir expresiones matemáticas junto al texto.
- Preprocesado de corpus para entrenamiento o búsqueda: el OCR alimenta pipelines de indexación documental o de generación de datasets de texto a partir de imágenes escaneadas.
- Herramientas locales de accesibilidad y lectura: al ejecutarse de forma nativa en Apple Silicon, permite construir utilidades de lectura de documentos que no envían imágenes a servicios externos.
- Automatización de back-office en entornos Mac: extracción de datos de facturas, formularios e informes en estudios y pequeñas organizaciones con parque de equipos Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no publica recuento de parámetros ni tamaño de pesos; el tamaño declarado del repo es 0.0 GB).
- GPU recomendadas: el paquete está diseñado para Apple Silicon mediante MLX; no se documentan requisitos para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: sí, en el ecosistema Apple Silicon (chips de la familia M), al ejecutarse a través de MLX sobre la GPU integrada.
- Opciones de despliegue: MLX y la librería Swift MlxOCRKit (`minerukit --tier indra`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje autoregresivo estándar sino un pipeline OCR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| indra-ocr-mlx (este) | Pipeline OCR multi-etapa convertido a MLX | 11 (en, fr, de, es, it, pt, nl, zh, ja, ko, ar) | `*.mlxonnx` + safetensors | OpenRAIL-M | Ejecución nativa en Apple Silicon sin `onnxruntime` |
| datalab-to/indra-ocr | Pipeline OCR original en ONNX | 11 (según modelo base) | ONNX + `.npz` (LM) | OpenRAIL-M | Modelo upstream; requiere `onnxruntime` |
| Alternativas OCR de código abierto (p. ej. Tesseract, PaddleOCR) | Motores OCR | Variable según configuración | Propios | Variable | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información disponible.

## Limitaciones y advertencias

- El repositorio muestra 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB; conviene verificar que los pesos estén efectivamente publicados antes de integrarlo en producción.
- La licencia es OpenRAIL-M (Modified), heredada del modelo base; las restricciones de uso del Attachment A se aplican tanto a esta conversión como a cualquier trabajo derivado. Es imprescindible revisar `LICENSE` antes de un uso comercial.
- El código que carga el modelo no está cubierto por OpenRAIL-M; la licencia aplica solo a los pesos.
- Los modelos de lenguaje n-grama (`.npz`) del repositorio original no se incluyen, por lo que el comportamiento de decodificación puede diferir del modelo upstream.
- El paquete está orientado exclusivamente a Apple Silicon y MLX; no es portable a otros backends sin reconversión.
- No se documentan sesgos específicos, tasas de alucinación ni límites de longitud de documento más allá de la geometría fijada (`det_long_side=1024`, `rec_height=32`, `rec_window=3`).
- El soporte multilingüe se organiza por familias de escritura; la cobertura real dentro de cada familia (por ejemplo, variantes regionales del árabe o del chino) no está detallada.
- La integración documentada depende de la librería MlxOCRKit y de su interfaz de línea de comandos, lo que introduce una dependencia adicional en el stack.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/playstonex/indra-ocr-mlx
- Modelo base: https://huggingface.co/datalab-to/indra-ocr
- Datalab: https://datalab.to
- MLX: https://github.com/ml-explore/mlx
- MlxOCRKit (MinerUKit): https://github.com/playstonex/MinerUKit
