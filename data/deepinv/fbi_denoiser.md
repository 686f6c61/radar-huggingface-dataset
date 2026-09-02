# deepinv/FBI_denoiser

## Resumen

FBI-Denoiser es un modelo de restauración de imágenes diseñado para eliminar ruido Poisson-Gaussiano de forma ciega, es decir, sin conocer previamente los parámetros del ruido. Fue desarrollado por investigadores de la Universidad Sungkyunkwan y la Universidad Nacional de Seúl (Corea del Sur) y presentado como ponencia oral en CVPR 2021. El modelo se compone de dos redes neuronales: PGE-Net, que estima los parámetros del ruido Poisson-Gaussiano de forma hasta 2000 veces más rápida que los métodos convencionales, y FBI-Net, que realiza el denoising propiamente dicho mediante un enfoque de denoising ciego eficiente. Su relevancia radica en que aborda un problema común en imágenes adquiridas en condiciones de baja iluminación o con sensores ruidosos, ofreciendo una solución rápida y sin necesidad de calibración previa. El modelo está disponible bajo licencia MIT y se integra en la librería DeepInverse, un framework de PyTorch para problemas inversos de imagen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes neuronales: PGE-Net (estimación de parámetros de ruido) y FBI-Net (denoising) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch, no especificado) |

## Arquitectura y entrenamiento

FBI-Denoiser se basa en dos componentes neuronales interconectados. PGE-Net es una red que predice los parámetros de ruido Poisson-Gaussiano (ganancia y varianza) a partir de la imagen ruidosa de entrada, utilizando una arquitectura convolucional ligera. FBI-Net, por su parte, implementa un denoizador ciego que opera de forma eficiente sobre la imagen completa, aprovechando la estimación de ruido proporcionada por PGE-Net. El entrenamiento se realiza con pares de imágenes limpias y ruidosas sintéticamente generadas con ruido Poisson-Gaussiano, aunque no se han publicado detalles específicos sobre el volumen de datos o el procedimiento exacto de optimización. La innovación principal es la combinación de estimación de ruido y denoising en un solo pipeline, logrando una velocidad de inferencia muy superior a los métodos tradicionales de estimación de ruido.

## Capacidades

- Denoising de imágenes con ruido Poisson-Gaussiano, común en fotografía de baja luz, microscopía y imágenes médicas.
- Estimación ciega de parámetros de ruido (ganancia y varianza) sin necesidad de calibración previa.
- Inferencia rápida: PGE-Net es hasta 2000 veces más rápido que los métodos convencionales de estimación de ruido.
- Procesamiento de imágenes en escala de grises y posiblemente color (no especificado).
- Integración con la librería DeepInverse para problemas inversos de imagen.
- No soporta generación de texto, código, ni otras modalidades; es exclusivamente un modelo de restauración de imagen.

## Casos de uso

- Restauración de imágenes médicas: mejora de imágenes de tomografía o resonancia magnética adquiridas con dosis bajas de radiación, donde el ruido Poisson-Gaussiano es predominante. El modelo puede integrarse en pipelines de procesamiento clínico para mejorar la calidad diagnóstica.
- Fotografía de baja iluminación: recuperación de imágenes capturadas con smartphones o cámaras compactas en condiciones de poca luz, donde el ruido de sensor es elevado. Su velocidad permite su uso en aplicaciones de tiempo real.
- Imágenes astronómicas: limpieza de observaciones de telescopios terrestres afectadas por ruido de fotones y ruido de lectura del sensor. La estimación ciega de ruido evita calibraciones complejas por imagen.
- Vigilancia y seguridad: mejora de secuencias de vídeo de cámaras de seguridad en entornos con poca luz, facilitando la identificación de objetos o personas.
- Microscopía de fluorescencia: reducción de ruido en imágenes biológicas adquiridas con exposición corta para minimizar el fotoblanqueo, preservando detalles finos.
- Preprocesamiento en pipelines de visión artificial: limpieza de imágenes antes de tareas de segmentación, detección o clasificación, mejorando la robustez de los modelos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2105.10967) reporta comparaciones con métodos como BM3D y DnCNN, pero no se incluyen cifras concretas en los materiales proporcionados.

## Requisitos de hardware

- No se dispone de información específica sobre VRAM o requisitos de GPU.
- Dado que el modelo es una red convolucional relativamente pequeña (típica para denoising), es probable que pueda ejecutarse en GPUs de consumo como RTX 2060 o superiores, aunque no se confirma.
- La inferencia puede realizarse con PyTorch estándar; no se mencionan formatos optimizados como ONNX o TensorRT.
- Para despliegue en producción, se podría usar la librería DeepInverse, que soporta PyTorch, o exportar el modelo a otros formatos.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | Licencia |
|---|---|---|---|---|
| FBI-Denoiser | Denoising ciego Poisson-Gaussiano | no disponible | Dos redes (estimación + denoising) | MIT |
| DnCNN | Denoising discriminativo | ~0.6M (para 17 capas) | CNN residual, requiere nivel de ruido conocido | no disponible |
| BM3D | Denoising clásico | no aplica | Filtrado colaborativo, no basado en deep learning | no disponible |

La comparación es cualitativa; no se dispone de datos cuantitativos de rendimiento en los materiales proporcionados. FBI-Denoiser se distingue por su capacidad ciega (no requiere conocer el nivel de ruido) y su velocidad de estimación, mientras que DnCNN necesita el nivel de ruido como entrada y BM3D es un método clásico sin aprendizaje.

## Limitaciones y advertencias

- Está diseñado específicamente para ruido Poisson-Gaussiano; puede no funcionar bien con otros tipos de ruido (por ejemplo, ruido sal y pimienta o ruido gaussiano puro).
- No se han documentado sesgos o riesgos de alucinación, al ser un modelo de restauración de imagen y no generativo.
- La información disponible no detalla el comportamiento en imágenes con degradaciones adicionales (desenfoque, compresión, etc.).
- La licencia MIT permite uso comercial, pero se recomienda verificar la atribución adecuada según los términos de la licencia.
- El repositorio de HuggingFace parece vacío (tamaño 0.0 GB), por lo que los pesos pueden no estar disponibles directamente en esa plataforma; se debe acudir al repositorio oficial de GitHub.

## Enlaces

- Paper arXiv: https://arxiv.org/abs/2105.10967
- Repositorio oficial (GitHub): https://github.com/csm9493/FBI-Denoiser
- Librería DeepInverse: https://github.com/deepinv/deepinv
- Documentación de DeepInverse: https://deepinv.org/
- Página de HuggingFace: https://huggingface.co/deepinv/FBI_denoiser
