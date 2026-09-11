# dronefreak/stdc2-seg-cityscapes

## Resumen

STDC2-Seg75 (Cityscapes mirror) es un *mirror* del checkpoint oficial de segmentación semántica **STDC2-Seg75** del repositorio [MichaelFan01/STDC-Seg](https://github.com/MichaelFan01/STDC-Seg), rehospedado en Hugging Face por el usuario `dronefreak` para facilitar el acceso programático estable mediante `huggingface_hub`. No se trata de un modelo nuevo: los tensores son idénticos byte a byte al fichero original (fp32 `state_dict`, sin estado del optimizador), y el repositorio incluye un `checksums.txt` con el SHA-256 del fichero espejado.

La arquitectura subyacente es **STDC (Short-Term Dense Concatenate Network)**, publicada en CVPR 2021 en el artículo *Rethinking BiSeNet for Real-Time Semantic Segmentation* (arXiv:2104.13188). Concretamente, este checkpoint corresponde a la variante **STDC2-Seg75**, que emplea el backbone **STDCNet1446** y está ajustada por completo sobre **Cityscapes** para 19 clases de escena urbana. El autor original reporta **77,04 mIoU a escala única** en el split de validación de Cityscapes.

Su relevancia es la de un *baseline* ligero y reproducible de segmentación semántica en tiempo real: se ejecuta en hardware modesto (CPU, Jetson, GPU de gama de entrada), sirve como referencia para comparar arquitecturas más modernas y es útil como componente de percepción en pipelines de conducción autónoma, robótica o preanotación de datos. El repo no declara lenguajes (es un modelo puramente visual) ni cuantizaciones, y acumula 0 descargas y 0 *likes*, por lo que carece de validación comunitaria en el Hub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | STDC (Short-Term Dense Concatenate Network), variante STDC2-Seg75 con backbone STDCNet1446; implementada como `BiSeNet` en `models/model_stages.py` del repo upstream |
| Parametros totales | no disponible en la información proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de visión. Entrada de imagen RGB de resolución variable; el ejemplo de evaluación del autor redimensiona a escala 0,75 y devuelve la máscara al tamano original |
| Tipos de cuantizacion | no disponibles: solo se publica el `state_dict` en fp32. Al ser una red convolucional admite conversión a fp16/int8 y exportación a ONNX/TensorRT, pero no hay artefactos preconvertidos |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT (pesos); el dataset Cityscapes mantiene sus propios términos de uso académico/investigación |
| Formato de pesos | PyTorch `.pth` (state_dict fp32, sin estado del optimizador); no se publican safetensors, GGUF ni ONNX |
| Tarea | Segmentación semántica densa (pipeline `image-segmentation`) |
| Dataset de entrenamiento | Cityscapes, 19 clases (`trainId` 0..18) |
| Tamano del repositorio | 0,1 GB en el Hub (incluye assets de demostración, ademas del checkpoint) |
| Autor del mirror | dronefreak (sin afiliación con los autores originales) |
| Repositorio upstream | MichaelFan01/STDC-Seg |

## Arquitectura y entrenamiento

STDC es una familia de redes convolucionales disenada para segmentación semántica en tiempo real. Su bloque principal, el módulo STDC, sustituye las concatenaciones densas de grano fino por concatenaciones de "corto plazo": la salida de cada bloque se obtiene concatenando un número reducido de ramas con receptivos crecientes, lo que reduce la redundancia de caracteres y rebaja el coste computacional manteniendo capacidad de representación. Sobre ese backbone, la variante Seg75 anade una cabeza de segmentación con módulos de refinamiento de atención y agregación de caracteres, y elimina la *spatial path* del BiSeNet original, que resulta redundante cuando el backbone ya preserva detalle espacial.

El checkpoint aquí espejado es un ajuste fino completo sobre Cityscapes. Durante el entrenamiento el modelo incorpora cabezas auxiliares y una cabeza de frontera en la etapa 8 (`use_boundary_8=True`); en inferencia esas cabezas se descartan, por lo que el ejemplo de carga usa `strict=False` y solo se aprovecha la salida principal `net(x)[0]` (las otras dos salidas son `aux16` y `aux32`). El preprocesado de referencia aplica normalización ImageNet (media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`) y un redimensionado a escala 0,75 antes de la red, con interpolación bilineal posterior de los logits al tamano original. Los hiperparámetros concretos de entrenamiento (epocas, optimizador, aumentos de datos, composición exacta del dataset) no se detallan en la información proporcionada y deben consultarse en el artículo CVPR 2021.

## Capacidades

- Segmentación semántica densa píxel a píxel sobre 19 clases urbanas de Cityscapes: carretera, acera, edificio, muro, valla, poste, semáforo, senal, vegetación, terreno, cielo, persona, jinete, coche, camion, autobus, tren, motocicleta y bicicleta.
- Entrada RGB de resolución arbitraria, con la receta de evaluación del autor basada en reescalado a 0,75 y recuperación de la resolución original en los logits.
- Salida en formato `trainId` (mapa de enteros 0..18) directamente convertible a máscara RGB con la paleta oficial de Cityscapes.
- Inferencia en tiempo real: la familia STDC está disenada específicamente para baja latencia y bajo coste de cómputo.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No es un modelo multimodal: no genera descripciones, no responde a instrucciones y no realiza *visual question answering*.

## Casos de uso

- Percepción para conducción autónoma y ADAS: el modelo genera máscaras semánticas de la escena viaria con las 19 clases de Cityscapes, lo que permite identificar carretera transitable, peatones, vehículos y senalización en cada fotograma. Es adecuado como componente de bajo coste dentro de una pila de percepción, aunque el autor no publica cifras de latencia por fotograma.
- Preanotación de datasets de segmentación: dado que alcanza 77,04 mIoU a escala única, sus predicciones pueden servir como etiquetas iniciales en un flujo de anotación humana, reduciendo el trabajo manual y alimentando estrategias de *active learning*.
- Anonimización de imágenes de tráfico: las clases `person`, `rider` y las de vehículos permiten enmascarar o difuminar automáticamente peatones, matrículas visibles y ocupantes antes de publicar un dataset o de almacenar grabaciones, un requisito habitual en cumplimiento de privacidad.
- Robótica móvil y navegación de AGVs en entornos urbanos o industriales: la máscara de suelo transitable, obstáculos y estructuras se puede consumir como mapa de coste para planificación de trayectorias, con la ventaja de ejecutarse en hardware embebido por el reducido tamano del modelo.
- Análisis de movilidad y ocupación del espacio público: procesar imágenes o vídeo de camaras urbanas para medir proporción de acera, carril, zona verde o presencia de vehículos, generando métricas agregadas de uso del viario sin anotación manual.
- Baseline reproducible para investigación: al ser un *mirror* con checksums SHA-256 y pesos idénticos al original bajo licencia MIT, es una referencia estable para comparar nuevas arquitecturas de segmentación en tiempo real sobre el mismo split de validación.
- Integración en pipelines de CI/CD de visión por computador: el modelo puede actuar como prueba de regresión perceptual, verificando que una actualización de preprocesado, cuantización o motor de inferencia (ONNX Runtime, TensorRT) no degrada la máscara esperada sobre un conjunto fijo de imágenes.
- Docencia y demostraciones: su tamano reducido permite ejecutar el ejemplo completo (carga de pesos, preprocesado, inferencia y visualización con la paleta oficial) en un portátil o en un cuaderno interactivo.

## Benchmarks y rendimiento

Los únicos datos de benchmarks disponibles son los declarados por el autor en el `model-index` del repositorio. No hay cifras comparativas con otros modelos en la información proporcionada.

| Benchmark | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Segmentación semántica | Cityscapes val (split `validation`) | mIoU (single-scale) | 77,04 | No (`verified: false`; valor declarado por el autor) |

No se han publicado resultados de benchmarks adicionales (multi-scale, FPS, paramentos) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifra exacta. Se trata de una red convolucional ligera (el repositorio completo ocupa 0,1 GB en el Hub, incluyendo assets de demostración), por lo que la huella de memoria en fp32 con lotes pequenos es muy reducida; una estimación conservadora la sitúa por debajo de 1 GB, pero el dato no está declarado.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo; una RTX 3060, RTX 2060 o GTX 1650 ya ofrecen margen de sobra.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con soporte CUDA, e incluso en iGPU. También es viable en CPU, en Jetson (Nano, Xavier, Orin) y en Raspberry Pi 4/5 mediante PyTorch u ONNX Runtime, con expectativas de rendimiento muy distintas en cada plataforma.
- Opciones de despliegue: PyTorch eager (única ruta documentada por el autor), exportación a ONNX y ejecución con ONNX Runtime o TensorRT, y conversión a fp16 o int8 para reducir latencia. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Requisito de código: la arquitectura no está empaquetada. Es obligatorio clonar el repositorio upstream `MichaelFan01/STDC-Seg` e importar `BiSeNet` desde `models.model_stages` para poder cargar los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Todos los modelos de la tabla pertenecen a la categoría de segmentación semántica en tiempo real sobre Cityscapes. Los valores numéricos de rendimiento de los competidores no están disponibles en la información proporcionada, por lo que la comparación es cualitativa.

| Modelo | Familia / enfoque | Clases | mIoU (Cityscapes val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STDC2-Seg75 (este mirror) | STDC con backbone STDCNet1446; convolucional puro, sin *spatial path* | 19 | 77,04 (single-scale, declarado) | MIT | Pesos `.pth` en Hugging Face; requiere clonar el repo upstream |
| BiSeNetV2 | Red bilateral con ramas *spatial* y *context* | 19 | no disponible en la información proporcionada | no verificada en la información disponible | Repositorio público del autor original |
| DDRNet (p. ej. DDRNet-23-slim) | Red de doble resolución con fusión bilateral y módulos de contexto | 19 | no disponible en la información proporcionada | no verificada en la información disponible | Repositorio público del autor original |
| PIDNet (p. ej. PIDNet-S) | Arquitectura inspirada en control PID con tres ramas (detalle, contexto, frontera) | 19 | no disponible en la información proporcionada | no verificada en la información disponible | Repositorio público del autor original |

Nota metodológica: para una comparación rigurosa es imprescindible fijar el mismo protocolo de evaluación (escala única o múltiple, resolución de entrada, *flip* test). El valor de 77,04 mIoU de este modelo corresponde a escala única y no es directamente comparable con cifras multi-escala.

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribución. El usuario `dronefreak` no ofrece soporte técnico, mantenimiento ni garantías sobre los pesos.
- La arquitectura no se distribuye con los pesos. Sin clonar `MichaelFan01/STDC-Seg`, el checkpoint no se puede cargar; los cambios de API en ese repositorio pueden romper el ejemplo de uso.
- Carga con `strict=False`: el checkpoint contiene cabezas de frontera usadas solo en entrenamiento. Ignorar ese detalle o asumir que la carga es estricta puede dar lugar a errores difíciles de diagnosticar.
- Alcance de clases cerrado a las 19 categorías de Cityscapes. Cualquier objeto fuera de ese conjunto (por ejemplo, un patinete eléctrico o un semáforo peatonal específico) no se representa como categoría propia y tiende a confundirse con clases vecinas.
- Sesgo de dominio: Cityscapes está compuesto por imágenes de ciudades alemanas y europeas, capturadas con un sensor y una configuración de cámara concretos, en condiciones mayoritariamente diurnas y de buena visibilidad. El rendimiento cae previsiblemente con lluvia intensa, niebla, noche, deslumbramiento o en entornos con una morfología urbana distinta (por ejemplo, ciudades latinoamericanas o asiáticas).
- Riesgo de error silencioso: un modelo de segmentación no expresa incertidumbre. Los fallos se manifiestan como asignaciones de clase incorrectas en bordes, objetos pequenos o regiones ambiguas, sin ninguna senal de "no lo sé" que pueda activar una salvaguarda en producción.
- Métrica no verificada: el `model-index` marca el resultado como `verified: false`, es decir, es una declaración del autor y no ha sido replicado de forma independiente dentro del Hub.
- Licencia de los pesos: MIT, lo que permite uso comercial de los pesos. Sin embargo, Cityscapes se distribuye bajo sus propios términos (orientados a uso académico y de investigación), y el propio autor del mirror indica que los pesos derivados se redistribuyen en esa misma base. Antes de un despliegue comercial conviene revisar la licencia del dataset con el equipo legal.
- Ausencia de cuantizaciones oficiales y de formato safetensors. Cualquier optimización (fp16, int8, ONNX, TensorRT) corre por cuenta del usuario y puede alterar las métricas declaradas.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay informes de terceros que confirmen la fidelidad del espejo más allá del `checksums.txt` incluido.
- Los resultados de la búsqueda web asociada a esta ficha no contenían ninguna fuente técnica relevante (únicamente páginas de comercio electrónico), por lo que no ha sido posible contrastar información adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/stdc2-seg-cityscapes
- Fichero de pesos: https://huggingface.co/dronefreak/stdc2-seg-cityscapes/resolve/main/stdc2-seg_cityscapes.pth
- Perfil del autor del mirror: https://huggingface.co/dronefreak
- Repositorio upstream de STDC-Seg: https://github.com/MichaelFan01/STDC-Seg
- Pesos originales (Google Drive): https://drive.google.com/drive/folders/1wROFwRt8qWHD4jSo8Zu1gp1d6oYJ3ns1
- Artículo CVPR 2021, *Rethinking BiSeNet for Real-Time Semantic Segmentation*: https://arxiv.org/abs/2104.13188
- Dataset Cityscapes: https://www.cityscapes-dataset.com/
- Términos de uso de Cityscapes: https://www.cityscapes-dataset.com/license/
- Resultados de la búsqueda web: no se encontraron enlaces técnicos relevantes (los resultados devueltos correspondían a páginas comerciales sin relación con el modelo).
