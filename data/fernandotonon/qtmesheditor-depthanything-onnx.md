# fernandotonon/QtMeshEditor-depthanything-onnx

## Resumen

Este repositorio contiene el modelo **Depth-Anything-V2-Small** (Yang et al., 2024) exportado a formato ONNX por el autor `fernandotonon`. No es un modelo nuevo ni reentrenado: es una conversión de formato del checkpoint `depth-anything/Depth-Anything-V2-Small-hf` a un grafo ONNX (opset 18, float32) que estima profundidad monocular relativa e inversa a partir de una única fotografía. El repositorio funciona como tarjeta de modelo y espejo independiente; el archivo que se descarga en tiempo de ejecución vive en el repositorio compartido `fernandotonon/QtMeshEditor-models`, dentro de la carpeta `depth/`.

Su relevancia es acotada pero concreta: sirve para condicionar por profundidad la ruta de texturizado con Stable Diffusion ControlNet dentro de **QtMeshEditor**, usando una fotografía de referencia en lugar de un render de profundidad de la malla. Esto habilita el comando `qtmesh material --photo-depth`, el botón "Depth from photo…" del editor de materiales y la herramienta MCP `photo_depth`. Al ser la variante Small la única con licencia Apache-2.0 (Base y Large son `cc-by-nc-4.0`), es la única que cumple el criterio de redistribución permisiva del proyecto.

Técnicamente, la entrada es fija de `[1, 3, 518, 518]` en RGB normalizado con estadísticos de ImageNet, y la salida es `[1, 518, 518]` de profundidad relativa inversa, donde **mayor valor significa más cerca**. Solo el eje de batch es dinámico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parche de 14 píxeles, exportado a ONNX (opset 18); cabecera de regresión de profundidad con interpolación. Modelo base: Depth-Anything-V2-Small |
| Parámetros totales | no disponible en la información proporcionada (tamaño del repositorio: 0,1 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión). Entrada de imagen fija de 518 × 518 píxeles |
| Tipos de cuantización | no disponible; el grafo exportado usa float32 |
| Idiomas soportados | no aplica (sin entrada ni salida de texto) |
| Licencia | Apache-2.0 (heredada de `depth-anything/Depth-Anything-V2-Small-hf`) |
| Formato de pesos | ONNX float32, opset 18, repositorio de 0,1 GB |
| Entrada | `pixel_values` float32 `[1, 3, 518, 518]`, RGB normalizado NCHW |
| Salida | `predicted_depth` float32 `[1, 518, 518]`, profundidad inversa relativa |
| Normalización | `mean = [0.485, 0.456, 0.406]`, `std = [0.229, 0.224, 0.225]` |
| Ejes dinámicos | solo el eje de batch; alto y ancho están fijados a 518 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-14 |

## Arquitectura y entrenamiento

El modelo base es un transformer de visión (ViT) con parche de 14 píxeles, tal como se deduce de la restricción `ensure_multiple_of: 14` del preprocesador y de la mención explícita a la interpolación de *position embeddings* del ViT en la tarjeta. La exportación a ONNX se realizó con opset 18 y fija las dimensiones espaciales de forma deliberada: un export con ejes espaciales dinámicos se traza sin errores, pero se desvía de la resolución trazada porque la interpolación de *position embeddings* solo se captura parcialmente. Un export dinámico anterior llegó a congelar el tamaño de salida y devolvía un mapa de 518 × 518 para una entrada de 462 × 462, por lo que el autor optó por fijar la resolución e invalidar ese modo de fallo silencioso. Como el preprocesador de referencia redimensiona toda entrada a 518 con `keep_aspect_ratio`, fijar la resolución no tiene coste práctico.

No hay información sobre entrenamiento en la tarjeta: no se indica número de tokens, composición del dataset, ni si hubo RLHF o DPO. El autor no entrena el modelo, solo lo convierte, y cede todo el crédito a Lihe Yang, Bingyi Kang, Zilong Huang, Zhen Zhao, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao. Las innovaciones destacables son de ingeniería de exportación: verificación de paridad torch contra onnxruntime antes de subir (diferencia máxima absoluta de 4,053e-06 sobre ruido y 6,914e-06 sobre una imagen suave estructurada), rechazo a escribir grafos con salidas no finitas, y una lista blanca de licencias que consulta la API de HuggingFace y aborta la descarga de pesos si la licencia no es permisiva. Además, la salida se normaliza a escala de grises de 8 bits con la convención *cerca = brillante*, idéntica a la que emite el renderizador de profundidad de mallas de QtMeshEditor, de modo que una foto y un render de malla son intercambiables como imágenes de condicionamiento.

## Capacidades

- Estimación de profundidad monocular relativa e inversa a partir de una sola fotografía en color.
- Salida de mapa de profundidad de 518 × 518 en float32, normalizable a escala de grises de 8 bits.
- Inferencia por lotes: el eje de batch es dinámico, por lo que admite varias imágenes por pasada.
- Consistencia de convención con renders de profundidad de malla (*cerca = brillante*), lo que permite usarla indistintamente como condicionamiento de ControlNet.
- No soporta *tool calling* ni *function calling*: es un modelo de visión puro.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No tiene modo de razonamiento (*thinking*), ni entrada/salida de audio, ni generación de imágenes.
- No realiza segmentación, detección ni *captioning*: su única salida es el mapa de profundidad.

## Casos de uso

- **Texturizado con ControlNet a partir de una foto de referencia**: en QtMeshEditor, la salida de profundidad de una fotografía se usa como condicionamiento de profundidad para Stable Diffusion ControlNet, sustituyendo al render de profundidad de la malla y permitiendo trasladar el aspecto de una foto real a la superficie del modelo 3D.
- **Automatización desde línea de comandos**: el comando `qtmesh material --photo-depth` permite ejecutar ese flujo de forma desatendida en scripts de build o pipelines de assets, sin abrir la interfaz gráfica.
- **Herramienta MCP para agentes de asistencia 3D**: la herramienta `photo_depth` expone la inferencia a un servidor MCP, de modo que un agente puede generar mapas de profundidad bajo demanda dentro de un flujo de edición de mallas.
- **Generación de mapas de altura y desplazamiento (*displacement*)**: el mapa de profundidad normalizado sirve como base para *heightmaps* o modificadores de desplazamiento en herramientas de modelado, útil para añadir relieve a superficies planas a partir de una foto.
- **Previsualización rápida de profundidad en el editor de materiales**: el botón "Depth from photo…" ofrece una vista previa inmediata del canal de profundidad derivado de la imagen, para validar el condicionamiento antes de lanzar una generación costosa.
- **Prototipado de pipelines de percepción de profundidad sin PyTorch**: al estar en ONNX, se puede integrar en servicios escritos en C++, C# o Python con onnxruntime, sin arrastrar el *stack* de PyTorch ni sus dependencias.
- **Preprocesado de datos sintéticos para 3D**: dado un conjunto de fotografías, se pueden generar mapas de profundidad de forma masiva y por lotes para alimentar etapas posteriores de reconstrucción o aumento de datos, siempre que se reescale cada imagen a 518 × 518.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni métricas de profundidad como AbsRel o δ1). La única tabla numérica publicada corresponde a la fidelidad de la conversión ONNX frente a la implementación en torch, medida como diferencia máxima absoluta:

| Entrada | Error relativo frente a torch |
|---|---|
| 518 × 518 (resolución trazada) | 2,7e-06 |
| 462 × 462 | 2,3e-02 |
| 392 × 392 | 4,9e-02 |

Además, la comprobación de paridad previa a la subida reporta `max|diff|` de 4,053e-06 sobre ruido aleatorio y 6,914e-06 sobre una imagen suave estructurada, con salida de forma (1, 518, 518). Estos valores confirman que la exportación es fiel únicamente en la resolución trazada, y explican por qué las dimensiones espaciales no son dinámicas.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia, los pesos ocupan aproximadamente 0,1 GB (tamaño del repositorio), por lo que la inferencia en float32 a 518 × 518 debería requerir bastante menos de 1 GB de VRAM; se trata de una estimación, no de un dato publicado.
- **GPU recomendadas**: no disponibles en la información proporcionada. Cualquier GPU con soporte de CUDA o TensorRT serviría para el *execution provider* de onnxruntime; no requiere aceleradores de gama alta.
- **Viabilidad en GPU de consumo**: previsiblemente sí, en cualquier GPU de consumo con unos pocos gigabytes de VRAM, dado el tamaño del modelo y la resolución fija de entrada. No hay cifras oficiales de consumo.
- **CPU**: viable como opción por defecto, al ser una variante Small con entrada fija de 518 × 518 y un único mapa de salida; no se publican cifras de latencia.
- **Opciones de despliegue**: onnxruntime (CPU, CUDA, TensorRT, DirectML) e integración directa en aplicaciones nativas, que es el uso previsto en QtMeshEditor. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión en ONNX.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a las variantes explícitamente mencionadas en la tarjeta. No se dispone de datos de parámetros ni de métricas de calidad en la información proporcionada.

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad en este proyecto |
|---|---|---|---|---|
| Depth-Anything-V2-Small (este export ONNX) | no disponible | 518 × 518 | Apache-2.0 | Espejado y distribuido por QtMeshEditor |
| Depth-Anything-V2-Base | no disponible | no disponible | cc-by-nc-4.0 | No espejado ni distribuido (términos no comerciales) |
| Depth-Anything-V2-Large | no disponible | no disponible | cc-by-nc-4.0 | No espejado ni distribuido (términos no comerciales) |

La diferencia determinante no es de rendimiento, sino de licencia: solo la variante Small permite redistribución permisiva, y el exportador lo verifica en código consultando la API de HuggingFace y abortando si la licencia queda fuera de su lista blanca. No se han proporcionado datos comparativos con otras familias de estimación de profundidad monocular.

## Limitaciones y advertencias

- **Resolución espacial fija**: hay que redimensionar toda entrada a 518 × 518 antes de la inferencia. Ejecutar con otras resoluciones produce errores relativos de hasta 2,3e-02 y 4,9e-02, es decir, resultados silenciosamente incorrectos.
- **Solo el batch es dinámico**: los ejes de alto y ancho están congelados a propósito. Un export con ejes espaciales dinámicos llegó a devolver siempre un mapa de 518 × 518 independientemente del tamaño de entrada.
- **Profundidad relativa, no métrica**: la salida es profundidad inversa relativa, sin escala absoluta. No sirve para medir distancias reales sin calibración externa.
- **Convención de signo**: mayor valor significa más cerca. Invertir la convención rompe la intercambiabilidad con los renders de profundidad de malla y con el condicionamiento de ControlNet.
- **Sesgos**: no se documenta ningún análisis de sesgo en la información disponible. El modelo base se entrenó con datos no detallados en esta tarjeta.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de profundidades implausibles en imágenes con superficies reflectantes, transparentes, texturas repetitivas o iluminación poco convencional; no hay evaluación publicada al respecto.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; es un espejo mantenido por un único autor para un proyecto concreto.
- **Repositorio espejo**: el archivo que se usa en tiempo de ejecución se descarga desde `fernandotonon/QtMeshEditor-models`, no desde este repositorio, que actúa como tarjeta y espejo independiente.
- **Licencia**: Apache-2.0, apta para uso comercial. Cualquier sustitución por las variantes Base o Large implica licencia `cc-by-nc-4.0` y, por tanto, restricciones de uso comercial.
- **Idiomas y cuantizaciones**: no hay soporte de idiomas y no se ofrecen variantes cuantizadas; cualquier cuantización posterior del grafo ONNX queda fuera del alcance de la paridad verificada por el autor.

## Enlaces

- Tarjeta del modelo en HuggingFace: https://huggingface.co/fernandotonon/QtMeshEditor-depthanything-onnx
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Repositorio compartido con los pesos descargados en tiempo de ejecución (carpeta `depth/`): https://huggingface.co/fernandotonon/QtMeshEditor-models
- Proyecto QtMeshEditor en GitHub: https://github.com/fernandotonon/QtMeshEditor
- Script de exportación a ONNX (opset 18): https://github.com/fernandotonon/QtMeshEditor/blob/master/scripts/export-depth-anything-onnx.py
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo: consisten en páginas de soporte de Microsoft (contacto, inicio de sesión en Hotmail, actualizaciones de seguridad de Exchange Server y descarga de imágenes ISO de Windows 8.1), sin relación con Depth Anything, ONNX ni QtMeshEditor. No se dispone de enlace al artículo original de Depth Anything V2 en la información proporcionada.
