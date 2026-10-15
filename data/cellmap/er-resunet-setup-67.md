# cellmap/er-resunet-setup-67

## Resumen

er-resunet-setup-67 es un modelo de segmentación semántica 3D especializado en la detección del retículo endoplasmático (ER, por sus siglas en inglés) en volúmenes de microscopía electrónica de doble haz (FIB-SEM) con vóxeles isótropos de 8 nm. Lo publica el equipo de CellMap (Janelia Research Campus, Howard Hughes Medical Institute) dentro del ecosistema `cellmap-models`, y su autor directo es Marwan Zouinkhi. El modelo corresponde a la configuración `setup_67` del experimento `exp_mito`, entrenada durante 20.000 iteraciones.

Arquitectónicamente es un `ResUNet3DValid`: una U-Net residual tridimensional con normalización InstanceNorm y convoluciones válidas (sin relleno), lo que significa que la salida es espacialmente menor que la entrada (de un volumen de 300x300x300 vóxeles se obtienen 212x212x212, con 88 vóxeles de contexto perdidos por eje). El modelo trabaja con un único canal de entrada (la imagen EM) y un único canal de salida correspondiente a la clase `er`, y devuelve logits crudos a los que hay que aplicar una sigmoide.

A diferencia de los modelos de lenguaje, aquí no hay contexto textual ni multilingüismo: el interés está en que es un modelo pequeño (repositorio de 0,1 GB con tres formatos de pesos), exportable a ONNX y TorchScript, con licencia BSD-3-Clause y entrenable de nuevo a través de la librería `cellmap-models`. Es relevante para laboratorios que reconstruyen ultrastructura celular a escala de nanómetros y necesitan segmentar automáticamente el ER en pilas FIB-SEM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResUNet3DValid (U-Net residual 3D con InstanceNorm y convoluciones válidas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D). Contexto espacial: 88 vóxeles por eje (44 por lado) por efecto de las convoluciones válidas |
| Tipos de cuantización | no disponible (se distribuyen pesos en precisión nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `model.pt2` (torch.export), `model.ts` (TorchScript), `model.onnx` + `model.onnx.data` (ONNX), `metadata.json` |
| Framework | PyTorch (librería `cellmap-models`) |
| Dimensiones espaciales | 3 |
| Canales de entrada / salida | 1 / 1 |
| Nombre del canal de salida | `er` |
| Tamaño de vóxel de entrada y salida | 8, 8, 8 nm |
| Forma de entrada en inferencia | 300 x 300 x 300 |
| Forma de salida en inferencia | 212 x 212 x 212 |
| Normalización de entrada | min-max, rango [-1,0, 1,0] |
| Activación de salida | sigmoide, aplicada después del modelo (`apply_after_model: true`) |
| Iteraciones de entrenamiento | 20.000 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa una U-Net residual en 3D (`ResUNet3DValid`) con normalización InstanceNorm y convoluciones válidas. La elección de convoluciones válidas implica que no se rellena artificialmente el borde de los volúmenes: cada operación recorta el tensor, de modo que un volumen de entrada de 300x300x300 vóxeles produce una salida de 212x212x212. Ese recorte equivale a 44 vóxeles de contexto por lado y eje, y obliga a solapar bloques si se quiere cubrir un volumen completo mediante inferencia por teselas. La salida son logits crudos por vóxel para la clase `er`, sin activación incorporada; el consumidor debe aplicar una sigmoide para obtener probabilidades.

Los datos de entrenamiento proceden de imágenes FIB-SEM adquiridas con vóxeles isótropos de 8 nm, dentro del experimento `exp_mito`, configuración `setup_67`, y el modelo se entrenó durante 20.000 iteraciones. La model card no especifica el número de volúmenes, la composición exacta del conjunto de datos, ni si se emplearon técnicas de ajuste adicionales como RLHF, DPO o aumento de datos agresivo, por lo que esos detalles deben considerarse no disponibles. Los metadatos indican que la normalización esperada de la entrada es min-max con rango [-1, 1]. Existe además una versión para web exportada a ONNX publicada en el repositorio `cellmap/onnx-web-models/setup_67`.

## Capacidades

- Segmentación semántica densa de una única clase (`er`, retículo endoplasmático) vóxel a vóxel en volúmenes 3D de microscopía electrónica.
- Procesamiento de volúmenes de entrada de 300x300x300 vóxeles y producción de máscaras de 212x212x212 vóxeles.
- Salida en logits crudos, lista para umbralización o para aplicar sigmoide y generar probabilidades calibradas por vóxel.
- Inferencia en tres runtimes distintos: PyTorch nativo vía `torch.export`, TorchScript y ONNX Runtime.
- Reentrenamiento o ajuste fino sobre datos propios mediante `model.train()` de la librería `cellmap-models`.
- Exportación a ONNX para despliegue en navegador, integrándose con el catálogo `onnx-web-models`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión natural ni audio; es exclusivamente un segmentador volumétrico.
- No dispone de capacidades multilingües.

## Casos de uso

- Reconstrucción del retículo endoplasmático en pilas FIB-SEM: el modelo produce una máscara binaria del ER con vóxeles de 8 nm, lo que permite reconstruir la red tubular continua y medir su morfología en volúmenes de tejido.
- Análisis de contactos ER-mitocondria: al proceder del experimento `exp_mito` y segmentar específicamente el canal `er`, encaja en estudios que cuantifican sitios de contacto entre ambas orgánulos combinándolo con un segmentador de mitocondrias de la misma familia.
- Etiquetado asistido para anotadores humanos: se puede usar como preanotación automática en flujos de trabajo de microscopía, reduciendo el tiempo de anotación manual antes de la corrección por un experto.
- Ajuste fino con datos propios de otro microscopio o resolución: al ser cargable como modelo entrenable con `model.train()`, un laboratorio puede reaprovechar los pesos como inicialización y adaptarlos a su protocolo de preparación de muestra.
- Integración en pipelines de segmentación a gran escala: la disponibilidad de ONNX y TorchScript permite incrustar el modelo en servicios por lotes o en sistemas de procesado distribuido sin depender de PyTorch completo.
- Despliegue en aplicaciones web de visualización: la versión ONNX publicada en `onnx-web-models/setup_67` habilita la segmentación interactiva en el navegador sobre cortes o volúmenes reducidos.
- Control de calidad y detección de artefactos de preparación: las máscaras de ER pueden usarse como indicador indirecto de la calidad de la muestra y de la alineación del volumen FIB-SEM.
- Generación de datos de entrenamiento sintéticos o de referencia para otros modelos de segmentación de orgánulos, usando las predicciones como pseudoetiquetas tras un filtrado por umbral de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de segmentación (Dice, IoU, Jaccard, precisión, recall) ni comparaciones cuantitativas con otros modelos. Tampoco se documentan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato oficial. Estimación orientativa a partir de la forma de entrada (300x300x300 vóxeles, aproximadamente 27 millones de vóxeles, es decir 108 MB por tensor en float32): una U-Net 3D con mapas de características a resolución completa requiere del orden de varios GB de VRAM durante la inferencia, pero la cifra exacta depende del número de canales por nivel, que no se publica.
- Tamaño de los pesos: el repositorio completo ocupa 0,1 GB e incluye tres exportaciones de los mismos pesos (torch.export, TorchScript y ONNX), por lo que el peso real de los parámetros es inferior a 100 MB. El recuento exacto de parámetros no está disponible.
- GPU recomendadas: no disponible. Por tamaño de pesos, cualquier GPU con soporte CUDA y suficiente memoria para los mapas de activación debería poder ejecutarlo; no se documentan pruebas en A100, H100 o RTX 4090.
- GPU de consumo: previsiblemente sí cabe en GPU de consumo, dado que el volumen de pesos es pequeño, aunque el requisito real lo marcan las activaciones de un volumen de 300x300x300. Se recomienda validar empíricamente con la GPU objetivo.
- Opciones de despliegue: ONNX Runtime (`onnxruntime.InferenceSession`), TorchScript (`torch.jit.load`), PyTorch con `torch.export.load` y la librería `cellmap-models`. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas.

| Modelo | Arquitectura | Entrada / contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| cellmap/er-resunet-setup-67 | ResUNet3DValid, 3D, 1 canal entrada / 1 canal salida | 300x300x300 vóxeles, 8 nm isótropos | BSD-3-Clause | no disponible | HuggingFace, ONNX, TorchScript |
| Otras configuraciones `setup_*` de `cellmap-models` | Familia ResUNet3D de CellMap | no disponible | no disponible | no disponible | repositorio `cellmap-models` |
| nnU-Net y U-Net 3D genéricas para segmentación EM | U-Net 3D | configurable | generalmente permisiva (varía) | no disponible en esta comparación | código abierto |
| Cellpose / modelos de segmentación celular 3D | redes específicas de citometría | variable, habitualmente a menor resolución | varía según versión | no disponible en esta comparación | código abierto |

La comparación directa requeriría evaluar todos los modelos sobre el mismo volumen FIB-SEM anotado, algo que no se ha documentado en la información disponible.

## Limitaciones y advertencias

- Modelo de clase única: sólo predice el canal `er`. Cualquier otro orgánulo o estructura requiere un modelo distinto.
- Dominio restringido: está entrenado sobre FIB-SEM a 8 nm isótropos. Cambios en la resolución de vóxel, en la modalidad de microscopía (por ejemplo, TEM serial o SBEM) o en el protocolo de tinción pueden degradar gravemente el resultado y exigir reentrenamiento.
- Convoluciones válidas: la salida pierde 44 vóxeles por lado y eje (88 en total por eje). Para segmentar un volumen completo hay que ejecutar el modelo por teselas solapadas y recomponer el resultado, gestionando cuidadosamente los bordes.
- Salida en logits crudos: es imprescindible aplicar la sigmoide indicada en los metadatos (`apply_after_model: true`) antes de interpretar la salida como probabilidad. Omitirla produce umbralizaciones incorrectas.
- Normalización obligatoria de la entrada: min-max con rango [-1, 1]. Introducir imágenes con otra escala invalida las predicciones.
- Riesgo de alucinación morfológica: como cualquier segmentador profundo, puede generar continuidades o cierres espurios en regiones de baja relación señal-ruido, conectar estructuras separadas o fragmentar túbulos finos. Se recomienda validación humana o filtrado post-proceso.
- Sesgos de dataset: el modelo refleja la distribución de las muestras de `exp_mito setup_67`. El desequilibrio de clases es intrínseco (el ER ocupa una fracción pequeña del volumen), lo que suele traducirse en mayor precisión que recall en las estructuras finas.
- Sólo 20.000 iteraciones de entrenamiento: puede quedarse corto en convergencia respecto a modelos con entrenamientos más largos, aunque no hay métricas que lo confirmen.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existen informes independientes de uso en producción.
- Metadatos incongruentes: la fecha de creación indicada (2026-10-15) es posterior a la fecha actual, lo que sugiere un error o un valor de relleno en los metadatos del repositorio.
- Licencia BSD-3-Clause: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright, la lista de condiciones y el descargo de responsabilidad, y que no se use el nombre de los titulares para promocionar derivados sin permiso.
- Uso clínico o diagnóstico: no hay ninguna validación documentada que respalde aplicaciones clínicas; su ámbito es la investigación en biología celular y conectómica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellmap/er-resunet-setup-67
- Repositorio de la librería cellmap-models: https://github.com/janelia-cellmap/cellmap-models
- Proyecto CellMap (Janelia Research Campus): https://www.janelia.org/project-team/cellmap
- Versión ONNX para web: cellmap/onnx-web-models/setup_67 (referenciada en la model card, sin URL directa disponible)
- Paper o informe técnico asociado: no disponible
- Demostración interactiva: no disponible
- La búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces obtenidos correspondían a códigos SWIFT bancarios y no guardan relación con esta ficha.
