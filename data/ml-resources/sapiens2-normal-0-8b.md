# ml-resources/sapiens2-normal-0.8b

## Resumen

Sapiens2-normal-0.8b es un checkpoint de estimación de normales de superficie orientado a imágenes centradas en personas. Se trata de un modelo de visión por computador desarrollado originalmente por Meta, consistente en un backbone Vision Transformer (ViT) Sapiens2 de 0,8B parámetros al que se le ha acoplado una cabeza específica de estimación de normales. La salida es un mapa por píxel de vectores unitarios de tres canales expresados en el sistema de coordenadas de la cámara.

El repositorio analizado (`ml-resources/sapiens2-normal-0.8b`) es un espejo no oficial del checkpoint original `facebook/sapiens2-normal-0.8b`, publicado por un tercero. Conserva la licencia original (Sapiens2 License) y el mismo formato de pesos (safetensors). El modelo parte del backbone preentrenado `facebook/sapiens2-pretrain-0.8b` y está afinado para la tarea `normal` dentro de la familia Sapiens2-Surface.

Su relevancia es doble: por un lado, forma parte de una familia escalable (0,4B, 0,8B, 1B y 5B) que permite ajustar el coste computacional a los recursos disponibles; por otro, la estimación de normales de superficie es una tarea densa de geometría que alimenta pipelines de reconstrucción 3D, renderizado neural y análisis corporal. Al no ser un modelo de lenguaje, no dispone de ventana de contexto textual, capacidades multilingües ni soporte de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT backbone + cabeza de estimacion de normales de superficie |
| Parametros totales | 884.577.463 (0,884 B segun safetensors); backbone declarado: 0,818 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen de 1024 x 768, H x W) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: tarea de vision, sin entrada/salida de texto) |
| Licencia | Sapiens2 License (identificador `other`, `license_name: sapiens2-license`) |
| Formato de pesos | safetensors (`sapiens2_0.8b_normal.safetensors`) |

Datos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Dimension del embedding | 1280 |
| Capas | 32 |
| Cabezas de atencion | 16 |
| Resolucion de inferencia | 1024 x 768 (H x W) |
| Tamano de parche | 16 |
| FLOPs del backbone | 2,592 T |
| Modelo base | facebook/sapiens2-pretrain-0.8b |
| Tamano del repositorio | 3,5 GB |
| Tarea (pipeline) | depth-estimation (etiqueta declarada); tarea real: normal |
| Biblioteca | sapiens2 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer puro con normalización de parches de tamano 16 y un total de 32 capas, dimensión de embedding 1280 y 16 cabezas de atención. Sobre el backbone Sapiens2 preentrenado se ha añadido una cabeza de predicción densa que produce tres canales por píxel, normalizados como vectores unitarios en el marco de la cámara. El coste por imagen es de 2,592 TFLOPs según la model card, lo que da una referencia directa para dimensionar hardware.

El checkpoint es un ajuste fino (finetune) del backbone `facebook/sapiens2-pretrain-0.8b` hacia la tarea de estimación de normales. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables en este tipo de tarea densa). Tampoco se especifican innovaciones de decodificación o mecanismos de atención alternativos. Para los detalles de entrenamiento hay que remitirse al paper arXiv:2604.21681 y al repositorio oficial, que no se incluyen en el material disponible.

## Capacidades

- Estimación de normales de superficie por píxel en imágenes centradas en personas, con salida de 3 canales (vectores unitarios en el marco de la cámara).
- Procesamiento de imágenes a resolución de 1024 x 768 (H x W) con parches de 16 píxeles.
- Extracción de características visuales densas mediante el backbone Sapiens2 de 0,818 B de parámetros.
- Integración en pipelines de visión para reconstrucción de geometría y análisis de superficie humana.
- No soporta generación de texto, razonamiento lingüístico, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (no hay entrada ni salida de texto).
- No dispone de modo "thinking", visión general de escenas (fuera del ámbito human-centric declarado), audio ni otras modalidades.

## Casos de uso

- Reconstrucción 3D de cuerpos humanos: el mapa de normales por píxel es una entrada directa para técnicas de fotometría estereoscópica o de integración de superficies, y el backbone de 0,818 B ofrece un equilibrio razonable entre fidelidad geométrica y coste de inferencia.
- Renderizado neural y "relighting": las normales permiten recalcular la iluminación de una persona capturada sin volver a escanear la escena, útil en postproducción de vídeo y efectos visuales.
- Preprocesado en pipelines de avatares digitales: generar un modelo de superficie a partir de imágenes de una persona para telepresencia o videojuegos, usando el checkpoint de 0,8B cuando no se dispone de GPU de gran capacidad.
- Análisis biomecánico aproximado: la orientación local de la superficie corporal sirve como señal secundaria para estimar postura y contacto en estudios de movimiento.
- Control de calidad en captura volumétrica: comparar el mapa de normales predicho con la geometría medida para detectar artefactos en escaneos de personas.
- Investigación en visión centrada en humanos: el checkpoint sirve como punto de comparación o inicialización dentro de la familia Sapiens2-Surface (0,4B, 0,8B, 1B, 5B) para experimentos de escalado.
- Anonimización o sustitución de apariencia: al disponer de geometría de superficie independiente del color, es posible recomponer una persona con textura sintética conservando su forma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio únicamente proporciona métricas de coste computacional (parámetros y FLOPs) y la comparativa interna de la familia Sapiens2-Surface, pero no cifras de error de estimación de normales ni comparaciones con otros métodos sobre conjuntos de datos públicos. Los resultados de búsqueda web disponibles no contienen información relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 3,5 GB en fp32 (0,884 B parámetros x 4 bytes) y aproximadamente 1,8 GB en fp16/bf16 (cálculo derivado del recuento de parámetros; no confirmado en la documentación).
- VRAM adicional para activaciones: la resolución de 1024 x 768 con parche 16 genera 3072 tokens por imagen sobre 32 capas con dimensión 1280, por lo que el pico de memoria de activaciones puede superar ampliamente el de los pesos durante la inferencia. No se dispone de cifras concretas en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del modelo, es previsible que quepa en GPU de consumo, pero no hay confirmación oficial ni lista de modelos soportados.
- Cabe en GPU de consumo: no confirmado. El recuento de parámetros sugiere que sí para los pesos, pero la resolución de inferencia de 1024 x 768 puede elevar la memoria necesaria.
- Opciones de despliegue: el repositorio oficial indica instalar el paquete Sapiens2 (`pip install -e .`) desde github.com/facebookresearch/sapiens2, descargar el checkpoint con `hf download` y ejecutar el script `./scripts/demo/normal.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión densa).
- Latencia y throughput: no disponible. La model card solo declara 2,592 TFLOPs por imagen de backbone, dato que puede usarse para estimar tiempos a partir de la capacidad de la GPU.

## Comparativa con modelos similares

Dentro de la propia familia Sapiens2-Surface, la model card ofrece una comparativa directa:

| Modelo | Parametros | FLOPs | Dim. embedding | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0,398 B | 1,260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B (este) | 0,818 B | 2,592 T | 1280 | 32 | 16 |
| Sapiens2-1B | 1,462 B | 4,715 T | 1536 | 40 | 24 |
| Sapiens2-5B | 5,071 B | 15,722 T | 2432 | 56 | 32 |

No se dispone de comparaciones con modelos de terceros (por ejemplo, otros estimadores de normales o backbones alternativos) en la información proporcionada, ni de datos de rendimiento relativo entre las variantes. Tampoco se dispone de información sobre modelos comparables fuera de la familia Sapiens2.

## Limitaciones y advertencias

- Modelo de visión especializado: no procesa texto ni mantiene conversaciones, por lo que no debe evaluarse con los criterios habituales de un LLM (contexto, tool calling, idiomas).
- Ámbito restringido: la model card declara uso previsto exclusivamente para imágenes centradas en personas y para investigación en visión human-centric. Su comportamiento fuera de ese dominio no está documentado.
- Sesgos conocidos: no disponible. No se documentan análisis de sesgo demográfico, de tono de piel ni de complexión corporal, un aspecto crítico en modelos entrenados sobre imágenes de personas.
- Riesgo de alucinación: en modelos densos de regresión geométrica el equivalente es la predicción de superficies plausibles pero incorrectas en regiones ocluidas, con poco contraste o fuera de distribución. No hay evaluación publicada al respecto en la información disponible.
- Limitaciones de resolución: la inferencia está fijada a 1024 x 768 (H x W); no se documenta comportamiento con otras resoluciones o relaciones de aspecto.
- Licencia: Sapiens2 License (identificador `other`), con enlace al texto legal en el repositorio oficial. Es imprescindible revisar sus términos antes de cualquier uso comercial, ya que no se trata de una licencia permisiva estándar (Apache 2.0, MIT) y las condiciones no se detallan en la model card.
- Repositorio espejo: este checkpoint lo publica `ml-resources`, no Meta. El propio autor del espejo advierte de que no es una release oficial y que los créditos corresponden a los autores originales. Para producción conviene usar el repositorio oficial `facebook/sapiens2-normal-0.8b`.
- Cifras de adopción nulas: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validación comunitaria sobre este espejo concreto.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con poca memoria si no se generan de forma manual.
- Fecha de publicación anómala (2026-10-15) según los metadatos del repositorio; conviene verificar la vigencia del checkpoint frente a la versión oficial.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-normal-0.8b
- Modelo original de Meta: https://huggingface.co/facebook/sapiens2-normal-0.8b
- Backbone preentrenado base: https://huggingface.co/facebook/sapiens2-pretrain-0.8b
- Paper: https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de normales: https://github.com/facebookresearch/sapiens2/blob/main/docs/NORMAL.md
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-normal-0.4b
- Variante 1B: https://huggingface.co/facebook/sapiens2-normal-1b
- Variante 5B: https://huggingface.co/facebook/sapiens2-normal-5b
