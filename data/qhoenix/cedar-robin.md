# qhoenix/cedar-robin

## Resumen

qhoenix/cedar-robin es un clasificador de imágenes publicado en HuggingFace por el usuario qhoenix, construido a partir de EfficientNetV2-L de torchvision (`efficientnet_v2_l`) y ajustado con entrenamiento adversario ("adversarial training") para la subred Perturb (netuid 26) de Bittensor. No se trata por tanto de un modelo de lenguaje: su tarea es la clasificación de imágenes en las 1000 clases de ImageNet-1K, con una cabeza de clasificación de 1000 salidas y una arquitectura convolucional de tipo EfficientNetV2 con bloques MBConv y Fused-MBConv.

El checkpoint ocupa aproximadamente 0,5 GB en formato `safetensors` y contiene 119.027.848 parámetros, coherentes con la variante L de EfficientNetV2 más la capa densa final. La model card documenta la clave del minero (`5GgvBpF9Z4rjqFwbA88yPBKyyqYajPaeW6tMjTzdycas69z2`), un hash on-chain calculado como `sha256(model.safetensors || hotkey)` y el preprocesado exacto esperado: transformaciones de `EfficientNet_V2_L_Weights.IMAGENET1K_V1` con redimensionado bicúbico a 480, recorte central de 480×480 y normalización con media y desviación típica iguales a 0,5.

Su relevancia es acotada pero concreta: se trata de un artefacto orientado a la competición de mineros de una subred de Bittensor centrada en robustez frente a perturbaciones, con verificación criptográfica del binario. No hay métricas publicadas, ni descargas, ni validación de la comunidad (0 descargas y 0 "likes" en el momento de redactar esta ficha), por lo que debe tratarse como un checkpoint experimental más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con compound scaling; bloques MBConv y Fused-MBConv, `torchvision.models.efficientnet_v2_l`) |
| Parámetros totales | 119.027.848 (dato real del checkpoint `safetensors`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen de 480×480 píxeles) |
| Tipos de cuantización | No disponible (solo se publica el checkpoint en `safetensors`; no se documentan variantes GGUF, int8 ni ONNX) |
| Idiomas soportados | No aplica (clasificación de imágenes; las 1000 etiquetas de clase de ImageNet-1K están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`); repositorio de ~0,5 GB |
| Tarea | `image-classification` (clasificación de imagen única, 1000 clases ImageNet-1K) |
| Librería declarada | torchvision |
| Resolución y preprocesado | `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: resize bicúbico a 480, center crop 480×480, mean = std = 0,5 |
| Salida | 1000 logits (una puntuación por clase ImageNet-1K) |
| Identificador on-chain | hotkey `5GgvBpF9Z4rjqFwbA88yPBKyyqYajPaeW6tMjTzdycas69z2`; hash `971ec4191a2e433db021e7ca855effa60142cf10b33ecf06c7df193ceec2ec14` |
| Fechas de publicación | Creado el 2026-09-27; actualizado el 2026-09-27 |

## Arquitectura y entrenamiento

La base es EfficientNetV2-L, una red neuronal convolucional que emplea escalado compuesto (profundidad, anchura y resolución optimizadas conjuntamente) y que combina bloques Fused-MBConv en las etapas iniciales con bloques MBConv con atención squeeze-and-excitation en las etapas profundas. Según el número de parámetros reportado y la estructura de torchvision, el cuerpo convolucional aporta unos 117,7 M de parámetros y la cabeza de clasificación (1280 entradas × 1000 salidas más sesgos) alrededor de 1,28 M, lo que explica el total de 119,03 M.

El elemento diferencial declarado es el entrenamiento adversario: la model card indica que el modelo ha sido ajustado con "adversarial training" para la subred Perturb (netuid 26) de Bittensor. Sin embargo, no se especifica la magnitud de la perturbación (epsilon), la norma utilizada, el método de ataque (FGSM, PGD u otros), el número de pasos, la proporción de ejemplos adversarios en el lote, el número de épocas, el conjunto de datos de ajuste fino ni si hubo destilación o regularización adicional. Tampoco se documenta ningún proceso de RLHF, DPO o ajuste por preferencias, algo que además no aplica a una tarea de clasificación supervisada. En consecuencia, la única información reproducible sobre el entrenamiento es la receta de preprocesado y el hash de integridad del binario.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1K, devolviendo 1000 logits por imagen.
- Robustez esperada frente a perturbaciones adversariales en el espacio de píxeles, derivada del entrenamiento adversario declarado; la magnitud y el tipo de perturbación cubiertos no están documentados.
- Extracción de representaciones visuales: el backbone de torchvision permite obtener mapas de características y vectores de 1280 dimensiones antes de la capa final, reutilizables como extractor congelado para transfer learning (no documentado por el autor, pero accesible mediante la API estándar de torchvision).
- Inferencia en GPU y CPU mediante PyTorch/torchvision, con la única dependencia de cargar el `state_dict` con `safetensors.torch.load_file`.
- No soporta generación de texto, razonamiento, código, matemáticas ni diálogo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo "thinking", ni de visión-lenguaje, ni de audio, ni de generación de imagen.
- El espacio de etiquetas es cerrado: no admite clases personalizadas sin reentrenar la cabeza de clasificación.

## Casos de uso

- Minería en la subred Perturb (netuid 26) de Bittensor: el modelo está pensado como artefacto de minero; se publica junto con la hotkey y el hash `sha256(model.safetensors || hotkey)` para que los validadores puedan comprobar la integridad del binario antes de evaluarlo.
- Clasificación de imágenes en condiciones degradadas: al haber sido ajustado con entrenamiento adversario, es candidato para entornos donde la imagen llega con ruido, compresión agresiva o pequeñas alteraciones (cámaras de vigilancia, transmisión con pérdidas, capturas de baja calidad), aunque no haya métricas que cuantifiquen esa ventaja.
- Pre-etiquetado en pipelines de anotación: sirve para generar etiquetas preliminares sobre las 1000 clases de ImageNet y reducir el trabajo manual en bucles de active learning, con revisión humana posterior.
- Filtrado y moderación visual a gran escala: clasificación rápida de lotes de imágenes en una taxonomía genérica de 1000 categorías (animales, objetos, escenas, vehículos) como primera etapa de un pipeline de cribado.
- Extracción de características para búsqueda visual: los vectores de 1280 dimensiones del backbone pueden indexarse en un motor de similitud para recuperar imágenes parecidas en catálogos o archivos fotográficos.
- Transfer learning sobre dominios específicos: con 119 M de parámetros y licencia apache-2.0, es razonable como inicialización para ajustar una cabeza nueva en tareas de inspección industrial, agricultura o diagnóstico por imagen, siempre que se respeten las condiciones de los datos de origen.
- Investigación en robustez adversarial: sirve como punto de comparación frente a otros checkpoints de la misma subred o frente al EfficientNetV2-L original para medir el efecto del entrenamiento adversario, aunque el autor no publique la receta exacta.
- Evaluación y auditoría de modelos en competiciones descentralizadas: la combinación de hotkey, hash y preprocesado fijo permite reproducir y verificar las inferencias de un minero concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como referencia externa no incluida en la información proporcionada: el checkpoint de referencia `efficientnet_v2_l` con pesos `IMAGENET1K_V1` de torchvision declara una precisión top-1 de aproximadamente 85,8 % en ImageNet-1K (validación). Esa cifra corresponde al modelo base antes del ajuste fino y no debe atribuirse a cedar-robin, cuyo rendimiento tras el entrenamiento adversario no está documentado en la model card. Tampoco hay datos de precisión bajo ataque (robust accuracy), de precisión limpia tras el ajuste, ni de calibración.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros (119,03 M) y del coste de activaciones a 480×480 en lote 1; no han sido validadas por el autor del modelo.

| Precisión | Peso de los pesos | VRAM total estimada (lote 1, con activaciones y contexto CUDA) |
|---|---|---|
| fp32 | ~476 MB | ~2 a 3 GB |
| fp16 / bf16 | ~238 MB | ~1,5 a 2 GB |
| int8 (no publicado) | ~119 MB | ~1 a 1,5 GB |

- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 3080/3090, RX 7900 XT, e incluso en iGPU con memoria compartida suficiente en fp16.
- GPU de centro de datos recomendadas para servicio en lote: NVIDIA A100 40/80 GB, H100, L40S, o varias T4/L4 si se busca densidad por vatio. Para una sola instancia, cualquier GPU con 4 GB o más de VRAM libre es suficiente.
- En CPU es viable con ~1 GB de RAM para los pesos en fp32; el cuello de botella es el coste convolucional a 480×480.
- Opciones de despliegue: PyTorch + torchvision como vía nativa (carga del `state_dict` con `safetensors`), exportación a TorchScript, ONNX Runtime, TensorRT, OpenVINO o NVIDIA Triton para servicio. Un servidor tipo TorchServe o FastAPI con batching dinámico es adecuado. vLLM, llama.cpp, Ollama y TGI no aplican: están orientados a modelos de lenguaje y no soportan esta arquitectura.
- Latencia y throughput: no disponible. No hay cifras publicadas y dependerían fuertemente del hardware, del tamaño de lote y de la precisión utilizada.

## Comparativa con modelos similares

La comparación se plantea a nivel de arquitectura, ya que no existen métricas publicadas de este ajuste fino adversario ni de posibles alternativas equivalentes en la misma subred. Los valores de parámetros son cifras de referencia de torchvision.

| Modelo | Parámetros | Resolución típica de entrada | Familia | Licencia de los pesos de referencia | Rendimiento tras entrenamiento adversario |
|---|---|---|---|---|---|
| qhoenix/cedar-robin (EfficientNetV2-L ajustado) | 119,03 M | 480×480 | CNN EfficientNetV2 | apache-2.0 (según model card) | no disponible |
| EfficientNetV2-M (torchvision) | ~54 M | 480×480 | CNN EfficientNetV2 | BSD-3-Clause (torchvision) | no disponible |
| ConvNeXt-L (torchvision) | ~198 M | 224×224 | CNN estilo ConvNeXt | BSD-3-Clause (torchvision) | no disponible |
| ViT-L/16 (torchvision) | ~304 M | 224×224 | Transformer de visión | BSD-3-Clause (torchvision) | no disponible |
| ResNet-50 v1.5 (torchvision) | ~25,6 M | 224×224 | CNN residual | BSD-3-Clause (torchvision) | no disponible |

No se dispone de comparativas publicadas frente a otros mineros de la subred Perturb ni frente a checkpoints adversarios equivalentes, por lo que no es posible establecer una jerarquía de rendimiento con los datos disponibles.

## Limitaciones y advertencias

- Ausencia total de validación externa: 0 descargas y 0 "likes" en el momento de redactar la ficha; no hay evidencia independiente de que el modelo funcione según lo declarado.
- No se publican métricas: ni precisión limpia, ni precisión bajo ataque, ni el epsilon o método de ataque empleados en el entrenamiento adversario. Es imposible saber qué tipo de perturbación cubre.
- Sesgos heredados del preentrenamiento en ImageNet-1K: representación desigual de clases, sesgos geográficos y culturales en las categorías, y dependencia de la distribución de las imágenes de origen. No se documenta ninguna mitigación.
- Espacio de etiquetas cerrado a las 1000 clases de ImageNet-1K; las clases fuera de esa taxonomía se forzarán a la clase más parecida, con riesgo de errores con alta confianza. No se documenta la calibración de las probabilidades.
- El concepto de alucinación no aplica del mismo modo que en un modelo generativo, pero sí existe el riesgo de clasificaciones erróneas y confiadas, especialmente ante entradas fuera de distribución o ante ataques de tipo distinto al usado en el entrenamiento.
- Preprocesado no negociable: usar una resolución, interpolación o normalización distintas de bicúbico 480 + center crop 480 + media/desviación 0,5 degradará el resultado. No se documenta comportamiento con otras resoluciones.
- Licencia apache-2.0 para los pesos publicados, lo que en principio permite uso comercial; sin embargo, el modelo deriva de un preentrenamiento sobre ImageNet-1K, cuyos términos de uso de los datos originales conviene revisar antes de explotarlo comercialmente.
- Al ser un artefacto de subred con hash on-chain, cualquier modificación del binario invalida la verificación `sha256(model.safetensors || hotkey)`; los despliegues en producción deben verificar ese hash.
- No hay información sobre cuantización, exportación a ONNX/TensorRT ni soporte en runtimes distintos de PyTorch/torchvision, lo que limita las opciones de optimización.
- Las fechas de creación y actualización del repositorio (2026-09-27) indican que se trata de un artefacto muy reciente y sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qhoenix/cedar-robin
- Subred Perturb (enlace citado en la model card): https://perturbai.io
- Documentación de la arquitectura base en torchvision: `torchvision.models.efficientnet_v2_l` (referencia de la API, no incluida en la información proporcionada)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo. Los resultados devueltos corresponden a comercios de ropa vintage ("V-Store" y similares) y no guardan relación con qhoenix/cedar-robin, con Perturb ni con Bittensor. No se dispone de paper, blog, repositorio adicional ni demo asociados al modelo.
