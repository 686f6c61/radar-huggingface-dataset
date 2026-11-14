# bambocher/LFM3-1.7B-oQ6e

## Resumen

LFM3-1.7B-oQ6e es una cuantización mixta de precisión del modelo base LFM3 de 1.700 millones de parámetros, publicada por el usuario bambocher en Hugging Face. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica un esquema de precisión mixta: la mayor parte de los pesos se almacenan en 6 bits afines con grupo de 64 (90,07 % de los pesos lógicos) y una fracción menor en 8 bits afines (9,907 %), con un residuo mínimo en BF16 (0,022 %). El resultado es un checkpoint con una media efectiva de 6,700 bits por peso y un tamaño de almacenamiento de 1,348 GiB.

El modelo está empaquetado en formato MLX, la librería de Apple para ejecución de modelos en silicio de la serie M (M1, M2, M3, M4). Esto lo orienta a inferencia local en Mac, no a servidores GPU convencionales con CUDA. El repositorio ocupa 1,5 GB e incluye código personalizado (`custom_code`), lo que implica que la arquitectura requiere módulos específicos para cargarse correctamente.

La relevancia de esta ficha es acotada: se trata de una cuantización comunitaria de un modelo del que no se proporcionan datos de rendimiento, licencia ni idiomas en la información disponible. No hay descargas ni interacciones registradas, y la model card se limita a documentar la distribución de bits y el desglose de almacenamiento. Cualquier evaluación de capacidades, benchmarks o casos de uso debe tomarse como inferencia a partir del tamaño y la familia del modelo base, no como dato verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3; detalles no disponibles) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (90,070 %), affine 8-bit grupo 64 (9,907 %), BF16 (0,022 %); media efectiva 6,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), con `custom_code` |
| Tamano del repositorio | 1,5 GB (1,448 GB / 1,348 GiB de pesos) |
| Libreria de inferencia | MLX (Apple) |
| Herramienta de cuantizacion | oQ / oMLX v0.7.3 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base LFM3. Por el nombre y el tamaño (1,7 B de parámetros) se trata de un transformer de la familia LFM3, pero no se confirma si emplea atención estándar, atención lineal, mezcla de expertos u otra variante. El repositorio incluye la etiqueta `custom_code`, lo que indica que la carga requiere código específico del autor o del formato oQ, y no basta con un `AutoModel` estándar de transformers.

Respecto al entrenamiento, no se proporcionan datos sobre número de tokens, composición del corpus, ni si hubo RLHF, DPO o ajuste por instrucciones. La model card se centra exclusivamente en la cuantización: documenta la distribución de bits por tensor, el grupo de cuantización (64) y el desglose de almacenamiento. La innovación técnica destacable es el propio esquema oQ de precisión mixta, que asigna 8 bits a una fracción pequeña de pesos (presumiblemente los más sensibles) y 6 bits al resto, logrando un equilibrio entre tamaño y fidelidad numérica.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de 1,7 B, aunque no se documenta explícitamente.
- Razonamiento y matemáticas: no disponible; no hay datos que confirmen o desmientan estas capacidades.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon vía MLX: confirmada por la librería y el formato del checkpoint.

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y el tamaño de 1,348 GiB permiten cargar el modelo en un Mac con memoria unificada de 8 GB o más, usando la pila MLX de Apple. Es el caso de uso principal y el único respaldado directamente por el formato del repositorio.
- Prototipado de aplicaciones de texto en local sin GPU: al no requerir CUDA, sirve para desarrollar y probar pipelines de generación de texto en un portátil Mac, con la ventaja de no enviar datos a la nube.
- Evaluación de esquemas de cuantización mixta: el checkpoint es útil para investigadores que quieran medir la pérdida de calidad de oQ a 6,7 bits efectivos frente al modelo base en BF16, comparando perplejidad o tareas concretas.
- Despliegue de asistentes de texto de baja latencia en dispositivos: con 1,7 B de parámetros y 6 bits, el modelo cabe en memoria unificada modesta y puede responder en local para tareas de resumen o redacción, siempre que se valide su calidad previamente.
- Generación de texto en entornos con restricciones de privacidad: al ejecutarse íntegramente en el dispositivo, es adecuado para procesar documentos sensibles sin salida a Internet, sujeto a la licencia del modelo base (no disponible).
- Base para ajuste fino ligero o experimentación con MLX: el formato y el código personalizado permiten a desarrolladores explorar técnicas de cuantización y decodificación sobre la familia LFM3 en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 1,5 GB solo para los pesos; en la práctica, con overhead de activaciones y caché KV, se recomienda un mínimo de 4-6 GB de memoria unificada para contexto corto.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) por el formato MLX. No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? Sí, en Mac con memoria unificada de 8 GB o superior. En GPU NVIDIA de consumo no se puede usar directamente sin reconvertir el checkpoint a otro formato.
- Opciones de despliegue: MLX (librería `mlx` y `mlx-lm`), con posible necesidad de `custom_code`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ6e (este) | 1,729 B | no disponible | MLX safetensors, 6,7 bits efectivos | no disponible | Hugging Face, 0 descargas |
| Modelo base LFM3-1.7B | 1,7 B (estimado) | no disponible | no disponible | no disponible | no disponible en la información |
| Otras cuantizaciones comunitarias de LFM3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del modelo base LFM3 antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística real y el rendimiento en castellano.
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que cualquier uso en producción requiere una evaluación propia.
- Cuantización agresiva: con 6,7 bits efectivos y grupo de 64, es esperable una degradación respecto al modelo en BF16, especialmente en tareas de razonamiento y matemáticas; no se ha cuantificado esa pérdida.
- Dependencia de `custom_code`: la carga requiere código específico, lo que puede complicar la integración con herramientas estándar y aumentar el riesgo de incompatibilidades.
- Ecosistema restringido: el formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni CPU genérica.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no hay datos específicos que lo mitiguen.
- Sesgos: no documentados; se heredan del corpus de entrenamiento del modelo base, que no se describe.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ6e
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Librería MLX: no disponible en la información proporcionada
- Modelo base LFM3: no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
