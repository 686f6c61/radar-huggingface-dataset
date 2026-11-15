# LibreYOLO/LibreDDRNetl-imagenet

## Resumen

LibreDDRNetl-imagenet es un espejo del checkpoint oficial DDRNet-39 preentrenado en ImageNet-1K, publicado por LibreYOLO para su uso como backbone en tareas de segmentación semántica. DDRNet (Deep Dual-Resolution Network) es una arquitectura concebida específicamente para segmentación semántica en tiempo real, desarrollada originalmente por el grupo de investigación de ydhongHIT, y este repositorio replica byte a byte el fichero `DDRNet39_imagenet.pth` distribuido por los autores originales.

El modelo no es un clasificador pensado para uso final, sino un inicializador de pesos: `LibreDDRNet` lo descarga al comenzar el entrenamiento de segmentación y conserva únicamente los tensores que la red de segmentación comparte con el clasificador, dejando DAPPM y las cabezas de segmentación con inicialización aleatoria, tal como hace la receta original. Esta distinción es importante: quien busque un clasificador de imágenes listo para producción debe acudir a otros modelos, mientras que quien entrene segmentación con el ecosistema LibreYOLO encontrará aquí los pesos de partida verificados por SHA-256.

La relevancia del artefacto reside en la trazabilidad y la verificación criptográfica: LibreYOLO fija el hash SHA-256 del checkpoint original y lo comprueba en cada descarga, lo que elimina el riesgo de pesos manipulados en la cadena de suministro. El repositorio ocupa 0,2 GB y se distribuye bajo licencia MIT, aunque con matices legales que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDRNet-39 (Deep Dual-Resolution Network), red neuronal convolucional con ramas duales de resolución |
| Parametros totales | no disponible (el tamaño del repo, 0,2 GB, sugiere un orden de magnitud de decenas de millones, pero no se confirma) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión; la model card no declara idiomas) |
| Licencia | MIT (interpretación declarada por LibreYOLO, no confirmada por el publicador original) |
| Formato de pesos | PyTorch `.pth` (`DDRNet39_imagenet.pth`) |
| Resolución de entrada | no disponible en la informacion proporcionada |
| Dataset de entrenamiento | ImageNet-1K |
| Pipeline declarado | image-classification |
| Hash SHA-256 del checkpoint | `b97be13428534508791e3897f7921d58d4886142bea25a8fa2f582acb26c25fc` |
| Commit upstream | `de0db317c5af4b0946231f475cf74ca4f51b8ac2` |

## Arquitectura y entrenamiento

DDRNet es una red convolucional diseñada para segmentación semántica en tiempo real mediante una estructura de resolución dual: una rama de alta resolución que preserva detalle espacial y una rama de baja resolución que captura contexto semántico, combinadas mediante fusiones bilaterales a lo largo de la red. La variante DDRNet-39 corresponde a la configuración de mayor profundidad de la familia y añade el módulo DAPPM (Deep Aggregation Pyramid Pooling Module) para agregar contexto multi-escala. En este repositorio el modelo se distribuye en su forma de clasificador ImageNet-1K, es decir, con la cabeza de clasificación original, no con las cabezas de segmentación.

El entrenamiento corresponde al recipe upstream sobre ImageNet-1K, con un error top-1 del 22,7 % según lo reportado por los autores originales. No se dispone de información sobre el número exacto de tokens equivalentes, composición del dataset más allá de ImageNet-1K, ni sobre el uso de técnicas de ajuste fino posteriores como RLHF o DPO, que no aplican a un modelo de visión de este tipo. La innovación técnica relevante en este artefacto no es arquitectónica sino de integración: LibreYOLO verifica el SHA-256 en cada descarga y, en tiempo de carga, filtra los tensores compartidos con la red de segmentación, descartando DAPPM y las cabezas para que se inicialicen de forma aleatoria, replicando fielmente el procedimiento del repositorio original.

## Capacidades

- Clasificación de imágenes sobre ImageNet-1K (1.000 clases), con error top-1 del 22,7 % reportado upstream.
- Extracción de características convolucionales multi-escala gracias a la estructura de resolución dual, útil como backbone.
- Inicialización de pesos para entrenamiento de segmentación semántica en el ecosistema LibreYOLO (`LibreDDRNet(size="l")`).
- Carga de pesos locales mediante `pretrained_backbone="DDRNet39_imagenet.pth"`.
- Verificación de integridad SHA-256 en cada descarga.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni ninguna capacidad multimodal.

## Casos de uso

- Inicialización de entrenamiento de segmentación semántica: el caso de uso principal y explícito del repositorio. Se instancia `LibreDDRNet(size="l")` y se llama a `train(data="cityscapes.yaml")`; el modelo descarga automáticamente este checkpoint y arranca desde pesos preentrenados en ImageNet-1K, lo que acelera la convergencia frente a entrenar desde cero.
- Segmentación urbana sobre Cityscapes: el recipe upstream está pensado para este dataset, y la rama de alta resolución de DDRNet resulta adecuada para delimitar bordes de coches, peatones y carreteras con latencia baja.
- Segmentación en tiempo real embebida: la arquitectura dual-resolution de DDRNet está diseñada para inferencia rápida, lo que la hace apta para sistemas de asistencia a la conducción o robótica móvil con presupuesto computacional limitado.
- Segmentación médica o industrial con datasets propios: el backbone preentrenado sirve como punto de partida para dominios donde los datos etiquetados son escasos, aprovechando las características genéricas aprendidas en ImageNet-1K.
- Reproducción de experimentos académicos: investigadores que necesiten replicar los resultados del paper original de DDRNet pueden usar este espejo verificado por hash en lugar de descargar el checkpoint desde Google Drive, evitando dependencias de enlaces externos.
- Auditoría de cadena de suministro de modelos: equipos de seguridad pueden verificar la integridad del checkpoint comparando el SHA-256 fijado en `libreyolo/models/ddrnet/convert.py` con el del fichero descargado, y contrastarlo con el original de ydhongHIT.
- Benchmarking de clasificadores ligeros: dado que el checkpoint incluye la cabeza de clasificación original, puede evaluarse como clasificador ImageNet-1K de referencia frente a otras arquitecturas del mismo orden de magnitud.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| ImageNet-1K top-1 error | 22,7 % | Reportado upstream; no verificado de forma independiente en la informacion proporcionada |

No se han publicado resultados de benchmarks adicionales (mIoU en Cityscapes, latencia, throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,2 GB) sugiere que el checkpoint en fp32 ocupa del orden de 200 MB, por lo que la inferencia cabría holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas en la informacion proporcionada. Por el perfil de la arquitectura (red convolucional de segmentación en tiempo real), se espera compatibilidad con GPUs de consumo tipo RTX 3060 o superiores, pero este dato no está confirmado por el autor.
- ¿Cabe en consumer GPU? Muy probablemente sí, dado el tamaño del checkpoint, aunque no se confirma en la documentación.
- Opciones de despliegue: la librería declarada es `libreyolo`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión convolucionales de este tipo. El despliegue esperado es mediante PyTorch y el propio paquete LibreYOLO.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreDDRNetl-imagenet (este) | DDRNet-39, CNN dual-resolution | no disponible | imagen (resolución no especificada) | MIT (interpretación) | Hugging Face, verificado por SHA-256 |
| DDRNet-39 original (ydhongHIT) | DDRNet-39, CNN dual-resolution | no disponible | imagen | MIT | GitHub + Google Drive, sin verificación de hash en la doc |
| Otras variantes DDRNet (23-Slim, 23, 39) | CNN dual-resolution | no disponible | imagen | MIT | Repositorio upstream |
| Backbones de segmentación alternativos (p. ej. ResNet, HRNet) | CNN | no disponible | imagen | variable | múltiples fuentes |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la informacion proporcionada. La comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo no es un clasificador de propósito general listo para producción: está pensado como inicializador de pesos para segmentación, y la cabeza de clasificación se conserva solo por fidelidad al checkpoint original.
- El error top-1 del 22,7 % procede del reporte upstream y no ha sido verificado de forma independiente por LibreYOLO.
- La licencia MIT es una interpretación declarada por LibreYOLO, no confirmada por el publicador original. El repositorio upstream enlaza los pesos desde su README sin establecer términos separados, y LibreYOLO los aloja bajo MIT sobre esa base implícita; para uso comercial conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio.
- Los pesos se entrenaron sobre ImageNet-1K, cuyos términos de acceso son para investigación no comercial y uso educativo. Esto puede condicionar el uso comercial del checkpoint derivado, independientemente de la licencia MIT del código.
- Riesgo de sesgos heredados de ImageNet-1K en las representaciones aprendidas, aunque el modelo no genera texto y por tanto no alucina en el sentido habitual.
- No soporta tareas de lenguaje, tool calling, agentes ni multimodalidad; cualquier uso en esos ámbitos está fuera de su alcance.
- No se documentan tipos de cuantización ni formatos alternativos (GGUF, ONNX), lo que limita el despliegue fuera de PyTorch.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/LibreYOLO/LibreDDRNetl-imagenet
- Repositorio upstream DDRNet: https://github.com/ydhongHIT/DDRNet
- Checkpoint original en Google Drive: https://drive.google.com/file/d/122CMx6DZBaRRf-dOHYwuDY9vG0_UQ10i
- Commit upstream fijado: `de0db317c5af4b0946231f475cf74ca4f51b8ac2`
- Ficheros de licencia del repositorio: `LICENSE` y `NOTICE` en el propio repo de Hugging Face
- Código de verificación de hash: `libreyolo/models/ddrnet/convert.py`
