# moonbox-ai/sam2.1-hiera-large-MLX

## Resumen

SAM 2.1 Hiera-L en MLX es una conversión del modelo Segment Anything Model 2.1 de Meta (publicado originalmente como `facebook/sam2.1-hiera-large`) al framework MLX de Apple, realizada por moonbox-ai. El modelo resuelve tareas de segmentación de imágenes y vídeo a partir de indicaciones (prompts) de punto, caja o máscara, generando máscaras de alta calidad sin necesidad de reentrenamiento por objeto. Esta versión concreta es un port para Macs con Apple Silicon que incluye únicamente el codificador de imagen Hiera, el cuello FPN, el codificador de prompts de SAM 2 y el decodificador de máscaras; los módulos de memoria de vídeo no están incluidos.

El interés de esta ficha radica en que ofrece una alternativa nativa para MLX con cuantizaciones agresivas (hasta 4 bits) que reducen el peso del modelo de 434 MB a 131 MB, manteniendo una calidad de máscara medida contra la implementación de referencia en PyTorch. La licencia Apache 2.0 facilita su uso comercial. El repositorio ocupa 1,4 GB en total porque incluye cinco builds de precisión distintas.

La relevancia actual es doble: por un lado, permite ejecutar segmentación de imágenes de alta calidad en hardware de consumo Apple sin dependencias de CUDA; por otro, el autor publica métricas de fidelidad (IoU de máscara) por cada cuantización, lo que permite elegir el compromiso precisión/tamaño con datos objetivos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hiera (image encoder) + FPN neck + SAM 2 prompt encoder + mask decoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 1024x1024 interna) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta |
| Modelo base | facebook/sam2.1-hiera-large (revisión 665f8e2ad6) |
| Librería | MLX (solo requiere `mlx` y `numpy`) |
| Tamaño del repositorio | 1,4 GB (incluye las cinco precisiones) |
| Tamaño por build | fp16/bf16: 434 MB; 8bit: 236 MB; 6bit: 184 MB; 4bit: 131 MB |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura de SAM 2.1 Hiera-L: un codificador de imagen jerárquico Hiera, un cuello FPN que agrega las características multiescala, el codificador de prompts de SAM 2 (puntos, cajas, máscaras) y el decodificador de máscaras que produce tres máscaras candidatas con sus puntuaciones. Esta conversión concreta no incluye los módulos de memoria de vídeo del SAM 2 original, por lo que está limitada a imágenes individuales. La entrada se redimensiona internamente a 1024x1024.

No se dispone de información sobre el entrenamiento original en la documentación proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta el autor es el proceso de conversión: los pesos originales se cargan en MLX y se almacenan en bf16 o fp16, o se cuantizan con la cuantización afín de MLX (8, 6 y 4 bits, group size 64). Las capas que MLX no puede cuantizar, como convoluciones y normalizaciones, permanecen en bf16. Cada build se verificó contra el modelo original en PyTorch fp32 antes de subirse, comparando la IoU de las 32 máscaras generadas (8 fotos, un prompt de punto con 3 máscaras y un prompt de caja por imagen).

## Capacidades

- Segmentación de imágenes a partir de prompts de punto (coordenadas y etiqueta positivo/negativo).
- Segmentación a partir de prompts de caja delimitadora.
- Generación de múltiples máscaras candidatas (`multimask=True`) con puntuaciones asociadas.
- Cálculo de embedding de imagen una sola vez por imagen (`embed`) para reutilizarlo en múltiples prompts, reduciendo el coste por consulta.
- Ejecución nativa en Apple Silicon mediante MLX, sin CUDA.
- No incluye soporte de vídeo (los módulos de memoria de vídeo no están portados).
- No incluye tool calling, agentes, razonamiento textual ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Edición fotográfica interactiva en Mac: el usuario hace clic sobre un objeto y el modelo devuelve la máscara; al reutilizar el embedding de imagen, cada clic adicional cuesta solo la decodificación, no el codificador completo.
- Herramientas de recorte automático en aplicaciones macOS: con la build de 4 bits (131 MB) se puede empaquetar dentro de una app de escritorio y ofrecer segmentación por caja delimitadora sin depender de servicios en la nube.
- Anotación semiautomática de datasets: el modelo genera máscaras candidatas que un anotador revisa y corrige, acelerando el etiquetado de imágenes para entrenar otros modelos de visión.
- Procesamiento por lotes en local: dado que el autor reporta unos 0,4 s por imagen (codificador más dos prompts) en un Apple M5, es viable procesar lotes moderados de imágenes en un portátil.
- Segmentación de objetos en pipelines de investigación: al requerir solo `mlx` y `numpy`, se integra fácilmente en scripts de análisis de imágenes sin instalar PyTorch.
- Pruebas de concepto de segmentación en entornos Apple sin GPU NVIDIA: permite validar flujos de trabajo de SAM 2 en un Mac antes de escalar a infraestructura con CUDA.
- Selección de precisión según requisitos: la build fp16 (IoU 0,999 media / 0,984 peor caso) es adecuada para producción sensible a la calidad, mientras que la de 4 bits (0,932 / 0,396) sirve para prototipos donde el tamaño prima sobre la fidelidad.

## Benchmarks y rendimiento

El autor publica una comparación de fidelidad de máscara (IoU frente al modelo original en PyTorch fp32) sobre 8 fotos con un prompt de punto y uno de caja cada una, 32 máscaras en total. El umbral de aceptación es IoU >= 0,95 en cada máscara.

| Precisión | Tamaño | IoU media / peor caso | Estado |
|---|---|---|---|
| fp16 | 434 MB | 0,999 / 0,984 | Pasa |
| bf16 | 434 MB | 0,992 / 0,903 | Por debajo del umbral, experimental |
| 8bit | 236 MB | 0,984 / 0,837 | Por debajo del umbral, experimental |
| 6bit | 184 MB | 0,972 / 0,641 | Por debajo del umbral, experimental |
| 4bit | 131 MB | 0,932 / 0,396 | Por debajo del umbral, experimental |

Rendimiento reportado: aproximadamente 0,4 s por imagen (codificador más dos prompts) en un Apple M5.

No se han publicado resultados de benchmarks estándar (COCO, SA-V, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (MLX). El autor reporta mediciones en un Apple M5.
- VRAM/memoria unificada estimada: el peso del modelo va de 131 MB (4bit) a 434 MB (fp16/bf16); a ello hay que sumar el coste de activaciones del codificador a 1024x1024, no cuantificado en la documentación.
- GPU recomendadas: cualquier chip Apple Silicon con MLX; no hay soporte CUDA en esta build.
- Cabe en cualquier Mac con Apple Silicon, incluidas configuraciones de gama base, dado el reducido tamaño de los pesos.
- Opciones de despliegue: carga directa mediante `mlx_model.load("<precision>")` con solo `mlx` y `numpy`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este modelo de visión).
- Latencia: ~0,4 s por imagen (codificador más dos prompts) en Apple M5. El embedding de imagen se calcula una vez y se reutiliza entre prompts.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Fidelidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam2.1-hiera-large-MLX (esta ficha) | no disponible | 1024x1024 interna | IoU 0,999 (fp16) frente a PyTorch fp32 | Apache 2.0 | Hugging Face, solo MLX/Apple Silicon |
| facebook/sam2.1-hiera-large | no disponible | 1024x1024 interna | Referencia (PyTorch fp32) | Apache 2.0 | Hugging Face, PyTorch/CUDA |
| Otras builds MLX de SAM 2.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación (por ejemplo, SAM original o variantes) en la información proporcionada.

## Limitaciones y advertencias

- Solo imágenes: los módulos de memoria de vídeo de SAM 2 no están portados, por lo que no puede segmentar secuencias de vídeo.
- Solo Apple Silicon: depende de MLX; no funciona en CUDA ni en CPU genérica sin adaptación.
- Las builds bf16, 8bit, 6bit y 4bit están marcadas como experimentales por el autor: no alcanzan el umbral de IoU 0,95 en todas las máscaras, con un peor caso de 0,396 en 4 bits.
- La verificación se realizó sobre solo 8 fotos y 32 máscaras; es una muestra pequeña y no cubre todos los dominios de imagen.
- El autor advierte de una diferencia de preprocesado: `embed` redimensiona en coma flotante, mientras que el procesador de transformers redimensiona uint8 con torchvision, lo que puede diferir hasta un nivel por píxel y alterar una salida ambigua de multimask.
- No se documentan sesgos específicos del modelo base en la información disponible; al ser un modelo de segmentación, los sesgos del dataset original de SAM 2 podrían reflejarse en el rendimiento por categoría o demografía visual, pero no hay datos al respecto.
- Riesgo de máscaras incorrectas en objetos ambiguos u ocluidos, inherente a los modelos de segmentación por prompt.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Meta antes de redistribuir.
- El repositorio incluye cinco builds; el autor indica que deben mantenerse juntos los archivos de cada carpeta (`model.safetensors`, `config.json`, `mlx_model.py`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-ai/sam2.1-hiera-large-MLX
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-large
- Paper de SAM 2 (referenciado en los tags): https://arxiv.org/abs/2408.00714
- Repositorio de MLX: no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
