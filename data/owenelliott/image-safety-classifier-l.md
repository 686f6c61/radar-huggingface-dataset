# OwenElliott/image-safety-classifier-l

## Resumen

`OwenElliott/image-safety-classifier-l` es un clasificador de imágenes de tres clases (SFW, NSFW y NSFL) desarrollado por OwenElliott como fine-tune del modelo SwiftFormer-L3 preentrenado en ImageNet-1k (`timm/swiftformer_l3.dist_in1k`). Su propósito es servir de filtro de seguridad en pipelines de moderación de contenido: distingue imágenes seguras de contenido pornográfico o altamente sugestivo (NSFW) y de contenido gore (NSFL). Con 27,5 millones de parámetros totales y un repositorio de 0,3 GB, está pensado para despliegue en el borde y aplicaciones con requisitos estrictos de latencia.

El modelo forma parte de una familia de cuatro variantes (xs, s, m, l) con la misma tarea y arquitectura, diferenciadas por tamaño y precisión declarada. La variante `l` es la mayor del lineup, con un 98,20 % de accuracy reportada por el autor sobre su conjunto de evaluación, frente al 97,76 % de la variante `xs`. La arquitectura SwiftFormer está diseñada específicamente para eficiencia computacional, lo que permite ejecutar el modelo en CPU o en GPUs de gama baja sin sacrificar demasiado rendimiento.

La relevancia práctica del modelo reside en su tamaño reducido combinado con la incorporación explícita de la clase NSFL, que la mayoría de detectores NSFW comerciales y open source no contemplan. El autor reporta que supera a `Marqo/nsfw-image-detection-384` y `Falconsai/nsfw_image_detection` en su propio dataset de evaluación. La licencia MIT sobre los pesos fine-tuneados facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwiftFormer-L3 (transformer híbrido eficiente con atención lineal) |
| Parametros totales | 27.492.358 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada 224x224 px) |
| Tipos de cuantizacion | fp32 y fp16 (variantes ONNX); safetensors en precisión original |
| Idiomas soportados | no disponible (modelo de visión, sin componente textual) |
| Licencia | MIT (pesos fine-tuneados); Apache 2.0 sobre los pesos base SwiftFormer |
| Formato de pesos | safetensors, ONNX (fp32 y fp16), PyTorch vía timm |

## Arquitectura y entrenamiento

El modelo se basa en SwiftFormer-L3, una arquitectura de visión que combina bloques convolucionales con mecanismos de atención lineal eficiente, diseñada para reducir el coste computacional frente a transformers de visión convencionales manteniendo una precisión competitiva en clasificación de ImageNet. El checkpoint base `timm/swiftformer_l3.dist_in1k` fue destilado sobre ImageNet-1k y posteriormente fine-tuneado por el autor para la tarea de tres clases (NSFL, NSFW, SFW). La cabeza de clasificación se sustituye por una de tres salidas y el modelo se entrena con imágenes redimensionadas a 224x224 píxeles.

El conjunto de entrenamiento es propietario y consta de aproximadamente 320.000 imágenes extraídas de la web, con una composición deliberadamente diversa: fotografías reales, ilustraciones, contenido Rule 34, capturas de pantalla, imágenes generadas por IA y memes. Para el etiquetado, las clases NSFW y SFW se validaron con `Marqo/nsfw-image-detection-384` y las predicciones dudosas o contradictorias se revisaron manualmente. La clase NSFL está significativamente infrarrepresentada, según reconoce el propio autor, por la dificultad de recolectar gore a escala; esto limita el rendimiento potencial en esa categoría pese a que el modelo supera a las alternativas evaluadas. No se documenta el uso de RLHF, DPO ni ninguna fase de alineación adicional, algo esperable en un clasificador de visión.

## Capacidades

- Clasificación de imágenes en tres categorías mutuamente excluyentes: SFW (seguro), NSFW (pornografía o contenido altamente sugestivo) y NSFL (gore).
- Salida de probabilidades por clase mediante softmax, lo que permite aplicar umbrales de decisión ajustables según la política de moderación.
- Procesamiento de imágenes de 224x224 píxeles en formato RGB, con normalización de color incorporada en las variantes ONNX.
- Inferencia en CPU y GPU; las variantes ONNX fp16 están optimizadas para aceleración por GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- Capacidad especial: detección explícita de gore (NSFL), categoría ausente en la mayoría de detectores NSFW del ecosistema open source.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede clasificar cada imagen subida antes de publicarla y derivar a revisión humana o bloqueo automático las que superen un umbral de probabilidad en NSFW o NSFL. Su tamaño de 27,5 M de parámetros permite ejecutarlo en el mismo servidor de subida sin añadir latencia apreciable.
- Filtrado en foros y comunidades de imágenes: integrado como paso previo al almacenamiento, evita que contenido NSFW o gore llegue a los buckets de producción y reduce la exposición del personal de moderación.
- Protección de menores en aplicaciones educativas o infantiles: actúa como barrera automática que rechaza imágenes inapropiadas en chats, avatares o galerías subidas por usuarios.
- Moderación en plataformas de generación de imágenes por IA: clasifica las salidas del generador antes de mostrarlas al usuario, permitiendo bloquear prompts que produzcan contenido NSFW o gore sin necesidad de un segundo modelo pesado.
- Despliegue en el borde (edge): gracias a la arquitectura SwiftFormer y a las variantes ONNX fp16, puede ejecutarse en dispositivos con recursos limitados, como navegadores (ONNX Runtime Web), aplicaciones móviles o mini-PCs, sin depender de la nube.
- Enriquecimiento de datasets y pipelines de curación: clasifica grandes volúmenes de imágenes raspadas de la web para separar el corpus seguro del que requiere revisión, reduciendo el trabajo manual en la construcción de datasets de entrenamiento.
- Pre-filtrado en herramientas de scraping y monitorización: descarta automáticamente imágenes NSFL o NSFW en crawlers de contenido para evitar almacenar material sensible en los repositorios intermedios.

## Benchmarks y rendimiento

El autor reporta una accuracy global del 98,20 % sobre su conjunto de evaluación propietario, y ofrece comparativas gráficas (no numéricas en la información disponible) frente a `Marqo/nsfw-image-detection-384` y `Falconsai/nsfw_image_detection`. En la comparativa por clase, el modelo supera a ambos en la detección de NSFL, si bien el autor advierte que la clase NSFL está infrarrepresentada en el entrenamiento.

| Modelo | Parámetros | Accuracy (dataset del autor) |
|---|---|---|
| `OwenElliott/image-safety-classifier-l` | 28,5 M | 98,20 % |
| `OwenElliott/image-safety-classifier-m` | 12,1 M | 98,06 % |
| `OwenElliott/image-safety-classifier-s` | 6,1 M | 97,99 % |
| `OwenElliott/image-safety-classifier-xs` | 3,5 M | 97,76 % |

No se han publicado resultados numéricos desglosados por clase (precisión, recall, F1) ni métricas sobre benchmarks estándar de visión como ImageNet en la información disponible. Las comparativas con Marqo y Falconsai se presentan únicamente como gráficos en la model card, sin cifras textuales.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (27,5 M de parámetros, ~110 MB de pesos más activaciones para un batch pequeño); en torno a 55 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se ejecuta sin problemas en RTX 3060, RTX 4090, A100 y H100, aunque el hardware de gama alta está sobredimensionado para esta carga.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1050 Ti y superiores; también en iGPUs y en CPU.
- Opciones de despliegue: `timm` (PyTorch), ONNX Runtime (CPU y GPU, variantes fp32 y fp16), y cualquier runtime compatible con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma explícita. Dado el tamaño y la arquitectura SwiftFormer, se espera latencia de milisegundos por imagen en GPU moderna y de decenas de milisegundos en CPU, pero el autor no publica cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Clases | Licencia | Contexto de uso |
|---|---|---|---|---|
| `OwenElliott/image-safety-classifier-l` | 27,5 M | SFW / NSFW / NSFL | MIT | Detección de gore incluida; edge deployment |
| `Marqo/nsfw-image-detection-384` | no disponible | NSFW / SFW | no disponible | Detector NSFW sin clase NSFL |
| `Falconsai/nsfw_image_detection` | no disponible | NSFW / SFW | no disponible | Detector NSFW basado en ViT, sin clase NSFL |
| `OwenElliott/image-safety-classifier-xs` | 3,5 M | SFW / NSFW / NSFL | MIT | Variante ultraligera de la misma familia |

El principal diferenciador frente a Marqo y Falconsai es la clase NSFL explícita. El autor señala que, para la evaluación comparativa, la clase NSFW de esos modelos se trató como acierto cuando la imagen era NSFL, lo que penaliza artificialmente a las alternativas en esa categoría. No se dispone de datos de parámetros ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- La clase NSFL está infrarrepresentada en el entrenamiento; el autor reconoce que el rendimiento en gore tiene margen de mejora pese a superar a las alternativas.
- El dataset de entrenamiento y evaluación es propietario y no reproducible, por lo que las cifras de accuracy no son verificables de forma independiente.
- La subjetividad del contenido NSFW y NSFL implica que las etiquetas pueden ser ambiguas según contexto cultural; el propio autor advierte que el modelo puede cometer errores.
- Riesgo de falsos positivos en imágenes artísticas, médicas o educativas que contengan desnudos o sangre sin intención de ser contenido inapropiado.
- No se documentan sesgos demográficos ni de representación del dataset; al ser raspado de la web, es probable que herede sesgos de la distribución de internet.
- Licencia MIT sobre los pesos fine-tuneados, pero los pesos base SwiftFormer están bajo Apache 2.0; conviene revisar ambas licencias antes de uso comercial.
- No apto para decisiones automáticas sin revisión humana en contextos de alto riesgo (moderación legal, protección de menores) sin calibrar umbrales y validar con datos propios.
- El modelo clasifica imágenes de 224x224; detalles finos de contenido sensible pueden perderse en el redimensionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OwenElliott/image-safety-classifier-l
- Modelo base: https://huggingface.co/timm/swiftformer_l3.dist_in1k
- Variante xs: https://huggingface.co/OwenElliott/image-safety-classifier-xs
- Variante s: https://huggingface.co/OwenElliott/image-safety-classifier-s
- Variante m: https://huggingface.co/OwenElliott/image-safety-classifier-m
- Modelo comparado Marqo: https://huggingface.co/Marqo/nsfw-image-detection-384
- Modelo comparado Falconsai: https://huggingface.co/Falconsai/nsfw_image_detection
