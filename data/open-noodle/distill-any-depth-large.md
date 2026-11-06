# open-noodle/distill-any-depth-large

## Resumen

Distill-Any-Depth Large (ONNX) es la exportación a formato ONNX del modelo de estimación de profundidad monocular Distill-Any-Depth Large, desarrollado originalmente por xingyang1 y empaquetado por open-noodle para su uso en la aplicación Gallery como generador de mapas de profundidad para escenas espaciales. El modelo resuelve la predicción de profundidad relativa a partir de una única imagen RGB, devolviendo un mapa de disparidad en el que valores mayores indican mayor cercanía al plano de la cámara.

El artefacto publicado no introduce cambios en los pesos: se trata de una conversión directa del checkpoint original a un grafo ONNX en fp32 (opset 18), con un único ajuste estructural en la cabeza de profundidad, donde el redimensionado final se sustituye por un factor de escala para mantener dinámicas las dimensiones de altura y anchura. El repositorio ocupa 1,3 GB y se distribuye bajo licencia MIT, la misma que el modelo de origen.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un transformer generativo, sino un modelo de visión especializado en profundidad monocular, con un contrato de inferencia muy concreto y sin información publicada sobre arquitectura interna, datos de entrenamiento o benchmarks en la información disponible. Resulta útil para pipelines de reconstrucción 3D, efectos de paralaje o generación de mapas de profundidad en aplicaciones de imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad monocular; exportado a ONNX, opset 18) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen con altura y anchura múltiplos de 14) |
| Tipos de cuantización | fp32 (único formato publicado en este repositorio) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | ONNX (`depth/model.onnx`, fp32, opset 18) y `config.json` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original en la documentación proporcionada. La model card únicamente describe el contrato de inferencia del artefacto ONNX: entrada `pixel_values` con forma `[1, 3, height, width]` en float32, normalizada con media ImageNet `[0.485, 0.456, 0.406]` y desviación típica `[0.229, 0.224, 0.225]`, con altura y anchura múltiplos de 14. La salida es `predicted_depth` con forma `[1, height, width]` en float32, que representa profundidad inversa relativa (disparidad) sin escala fija.

La única modificación respecto al grafo original es la sustitución del redimensionado final de la cabeza de profundidad por un factor de escala, de modo que las dimensiones de altura y anchura permanezcan dinámicas en el grafo ONNX. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste fino supervisado o preferencias. El modelo de origen está referenciado en el paper arXiv:2502.19204.

## Capacidades

- Estimación de profundidad monocular a partir de una imagen RGB.
- Salida de profundidad inversa relativa (disparidad): valores mayores indican mayor cercanía, sin escala métrica absoluta.
- Soporte de resoluciones variables: altura y anchura de entrada deben ser múltiplos de 14; Gallery redimensiona el lado corto a 518 píxeles.
- Ejecución mediante ONNX Runtime u otros motores compatibles con ONNX (opset 18).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No se documentan capacidades de segmentación, detección ni otras tareas de visión más allá de la profundidad.

## Casos de uso

- Generación de mapas de profundidad para efectos de paralaje: el modelo produce un mapa de disparidad por píxel que permite desplazar capas de una imagen 2D para simular movimiento de cámara en visores o galerías interactivas, como hace Gallery con su función Spatial Scene.
- Reconstrucción 3D aproximada a partir de fotografías: combinando la profundidad relativa con la imagen RGB se puede generar una nube de puntos o una malla texturizada para visualización, sin necesidad de calibración métrica.
- Desenfoque de fondo sintético (bokeh): el mapa de disparidad permite separar primer plano y fondo y aplicar un desenfoque selectivo en postproducción fotográfica automatizada.
- Previsualización de escenas en aplicaciones de realidad aumentada: la profundidad relativa sirve para ocluir objetos virtuales detrás de elementos reales en tiempo de ejecución, siempre que se acepte la ausencia de escala métrica.
- Procesamiento por lotes en servidores sin GPU: al estar exportado a ONNX en fp32, puede ejecutarse con ONNX Runtime en CPU para pipelines de generación de miniaturas con profundidad o catalogación de imágenes.
- Integración en herramientas de edición de imagen open source: el contrato de inferencia sencillo (una entrada, una salida) facilita su incorporación en plugins de GIMP, Krita o aplicaciones web que ya usen ONNX Runtime.
- Investigación en visión por computador: sirve como referencia reproducible del modelo Distill-Any-Depth Large para comparar métodos de destilación o evaluar la calidad de la profundidad relativa en nuevos datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 1,3 GB, lo que da una cota inferior aproximada del peso del grafo en fp32; el consumo real en inferencia depende de la resolución de entrada y del backend.
- GPU recomendadas: no disponibles en la información proporcionada. Cualquier GPU con soporte para ONNX Runtime (CUDA o ROCm) o para ejecución en CPU debería poder ejecutar el modelo.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio (1,3 GB), aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), así como otros motores compatibles con ONNX y opset 18.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas comparables de estimación de profundidad monocular.

## Limitaciones y advertencias

- La salida es profundidad relativa (disparidad) sin escala métrica; no sirve directamente para mediciones de distancia en unidades físicas.
- No se documentan sesgos del modelo; al ser un modelo de visión entrenado con datos no especificados, puede presentar degradación en dominios alejados de la distribución de entrenamiento (interiores, escenas nocturnas, imágenes sintéticas).
- Riesgo de artefactos en bordes de objetos, superficies reflectantes, transparentes o con texturas repetitivas, habitual en estimación de profundidad monocular.
- La resolución de entrada debe tener altura y anchura múltiplos de 14; un redimensionado incorrecto puede provocar errores en el grafo ONNX.
- Solo se publica fp32; no hay versiones cuantizadas en este repositorio, lo que limita la optimización en hardware con poca memoria.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo de origen (también MIT según la model card).
- El artefacto es una exportación de terceros (open-noodle) y no el checkpoint oficial; para producción conviene validar la equivalencia numérica frente al modelo original.
- No apto para tareas de lenguaje, razonamiento o agentes; su uso está restringido a estimación de profundidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/open-noodle/distill-any-depth-large
- Modelo base: https://huggingface.co/xingyang1/Distill-Any-Depth-Large-hf
- Paper: https://arxiv.org/abs/2502.19204
- Repositorio Gallery: https://github.com/open-noodle/gallery
