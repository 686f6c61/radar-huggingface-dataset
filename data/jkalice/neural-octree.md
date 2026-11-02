# JKAlice/neural-octree

## Resumen

NeuOctree es una representación neuronal explícita de formas 3D presentada en el artículo "Neural Explicit Shape Representation" (arXiv:2610.38441) por Wang, Lu, Chen y Wang. No es un modelo de lenguaje ni un generador multimodal al uso, sino un modelo de reconstrucción y representación geométrica basado en octrees neuronales, entrenado sobre el conjunto de datos Objaverse. Su objetivo es codificar la geometría y el color de objetos 3D en una estructura de octree con payloads de tamaño muy reducido (desde 81 KiB hasta 823 KiB por objeto), manteniendo la capacidad de reconstruir la forma con precisión.

El repositorio de HuggingFace (JKAlice/neural-octree) distribuye únicamente pesos y manifiestos de ficheros, no los datos de entrenamiento ni las mallas originales. Incluye un checkpoint feedforward principal de 36.888.057 parámetros con cuatro etapas de refinamiento recurrente, y 28 checkpoints de inferencia empaquetados en fp16 para siete objetos y cuatro presupuestos de tamaño. El entrenamiento se realizó sobre 31.761 objetos de Objaverse con ocho vistas de 512×512 por objeto, y la validación sobre 1.000 objetos sin solapamiento.

La relevancia de este lanzamiento es doble: por un lado, publica los pesos originales y los manifiestos de split exactos, lo que facilita la reproducibilidad; por otro, explora una vía de representación 3D compacta y explícita que compite con alternativas implícitas como NeRF o Gaussian Splatting en términos de tamaño de payload y velocidad de decodificación. La licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Octree neuronal con refinamiento recurrente (feedforward, 4 etapas) |
| Parametros totales | 36.888.057 (checkpoint feedforward principal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo 3D) |
| Tipos de cuantizacion | fp16 en los checkpoints de inferencia empaquetados; el checkpoint feedforward se distribuye en precisión original |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor indica que no se asigna licencia nueva a los pesos) |
| Formato de pesos | PyTorch (`.pth` para feedforward, `.pt` para inferencia fp16) |

## Arquitectura y entrenamiento

La arquitectura se basa en un octree neuronal con representación explícita de forma: la geometría y el color se codifican en una jerarquía de octrees de profundidad 9, y el modelo aplica cuatro etapas de refinamiento recurrente sobre esa estructura para producir la reconstrucción final. El checkpoint principal es feedforward y opera sobre puntos coloreados (200.000 puntos por objeto) y ocupación de malla a profundidad 9. Los checkpoints de inferencia empaquetados están en fp16 y se organizan por objeto y por presupuesto de payload (81, 122, 244 y 823 KiB), lo que sugiere una variante de representación comprimida por objeto más que un único modelo general.

El entrenamiento utilizó el split oficial de Objaverse: 31.761 objetos de entrenamiento y 1.000 de validación, con ocho vistas renderizadas de 512×512 por objeto y sin solapamiento entre splits. El pipeline de preparación descarga las mallas desde `allenai/objaverse`, renderiza las vistas y genera los puntos coloreados y la ocupación. No se especifica en la información disponible si hubo RLHF, DPO ni el número exacto de tokens o iteraciones de entrenamiento. La innovación técnica destacable es el uso de refinamiento recurrente sobre octree con payloads de tamaño controlado, lo que permite comparar calidad de reconstrucción frente a tamaño de representación de forma explícita.

## Capacidades

- Reconstrucción de geometría 3D de objetos a partir de puntos coloreados y ocupación de octree.
- Representación explícita de forma con payloads compactos (81–823 KiB por objeto).
- Refinamiento recurrente en cuatro etapas para mejorar la fidelidad geométrica.
- Codificación de color junto con geometría (puntos coloreados de entrada).
- Evaluación sobre el manifiesto de validación de Objaverse con umbral de hit de 0,4 y orientación de normales.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni modo thinking.
- No incluye visión 2D general, audio ni generación de texto.

## Casos de uso

- Reconstrucción de activos 3D para pipelines de contenido: el modelo puede tomar puntos coloreados de un objeto escaneado o renderizado y producir una representación de octree compacta, útil para almacenar activos con payloads de pocos cientos de KiB en lugar de mallas completas.
- Compresión de geometría para transmisión: con presupuestos de 81 a 823 KiB por objeto, es adecuado para enviar representaciones 3D por red en aplicaciones de realidad aumentada o visores web donde el ancho de banda es limitado.
- Evaluación reproducible de investigación en representación 3D: los manifiestos de split y los checksums SHA256 permiten reproducir la evaluación del paper sobre los 30 objetos de validación y comparar con otras representaciones explícitas.
- Generación de LOD (niveles de detalle): los cuatro presupuestos de payload por objeto permiten servir distintas calidades según la distancia de cámara o el presupuesto de memoria del cliente.
- Preprocesado para motores de renderizado: la representación de octree con ocupación a profundidad 9 puede convertirse en mallas o estructuras de aceleración para trazado de rayos.
- Docencia y experimentación con octrees neuronales: el código y los pesos permiten estudiar el efecto del refinamiento recurrente y del presupuesto de payload en la calidad de reconstrucción sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 36,9 M de parámetros en fp32 el checkpoint ocupa aproximadamente 148 MB, y en fp16 unos 74 MB, por lo que la VRAM dominante proviene de los datos de entrada (200.000 puntos coloreados y estructuras de octree) más que del modelo.
- GPU recomendadas: no especificadas en la información disponible; por tamaño de modelo, cualquier GPU con al menos 8 GB de VRAM debería poder cargar el checkpoint, aunque el preprocesado con Blender y el renderizado de vistas requiere más recursos.
- Cabe en GPU de consumo: previsiblemente sí para inferencia del checkpoint feedforward, dado el reducido número de parámetros; no se confirma en la información disponible.
- Opciones de despliegue: el autor proporciona el comando `neuoct-evaluate-feedforward` del repositorio de código; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con NeRF, Gaussian Splatting, NeuS ni otras representaciones neuronales de forma, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia de los pesos no está especificada; el autor indica explícitamente que esta release no asigna una licencia nueva al proyecto, lo que impide confirmar el uso comercial.
- Los activos originales de Objaverse conservan sus licencias de origen; el manifiesto de ficheros no otorga derechos adicionales sobre las mallas ni las texturas.
- El repositorio solo aloja checkpoints y manifiestos: no se redistribuyen mallas, texturas, imágenes renderizadas ni nubes de puntos procesadas, por lo que reproducir el pipeline exige descargar Objaverse y ejecutar Blender.
- El comando de evaluación del README puntúa el manifiesto de validación, no el benchmark de cámaras fijas del paper; los resultados no son directamente comparables con las cifras publicadas sin replicar el protocolo de cámaras.
- El modelo está entrenado exclusivamente sobre Objaverse, por lo que su generalización a otros dominios (escenas, interiores, objetos sintéticos no representados) no está documentada.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento; cualquier uso en esos términos sería un error de categoría.
- El tamaño del repo (0,2 GB) y la ausencia de descargas y likes indican un lanzamiento reciente y sin validación comunitaria independiente.
- Riesgo de sobreajuste a los siete objetos con checkpoints empaquetados: esos 28 checkpoints son específicos por objeto y presupuesto, no un modelo general.

## Enlaces

- HuggingFace: https://huggingface.co/JKAlice/neural-octree
- Paper: https://arxiv.org/abs/2610.38441
- Código e instrucciones: https://github.com/octree-nn/neural-octree
- Dataset Objaverse: https://huggingface.co/datasets/allenai/objaverse
