# HamzaAhmedSharif/cifar100-vit-lora-adapter

## Resumen

El modelo `HamzaAhmedSharif/cifar100-vit-lora-adapter` es un adaptador LoRA entrenado sobre `google/vit-base-patch16-224-in21k` para clasificación de imágenes en las 100 clases finas del conjunto CIFAR-100. Lo desarrolla HamzaAhmedSharif y se publica como adaptador PEFT, no como un modelo completo: para usarlo hay que instanciar primero el Vision Transformer base de Google con 100 etiquetas de salida y cargar después el adaptador y los pesos de LayerNorm ajustados aparte.

La relevancia del artefacto es doble. Por un lado, demuestra que el ajuste fino parametralmente eficiente (PEFT) es suficiente para una tarea de visión relativamente exigente: solo se entrenó el 1,49 % de los parámetros totales (1.294.948 de 87.132.104) y se alcanzó un 92,49 % de exactitud en test. Por otro, sirve como referencia reproducible de un pipeline completo con MixUp/CutMix, label smoothing, EMA y descongelado selectivo de LayerNorm, con código de entrenamiento publicado en GitHub.

Arquitectónicamente es un transformer de visión (ViT-Base, parches de 16x16 sobre imágenes de 224x224) con adaptadores de bajo rango en las proyecciones de atención q/k/v/o, rango r=16 y alpha=32. No es un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no soporta tool calling ni razonamiento multi-paso. Su ámbito es la clasificación de imágenes en un espacio de etiquetas cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, resolución de entrada 224x224) con adaptadores LoRA; configuración estándar del modelo base: 12 capas, ancho oculto 768, 12 cabezas de atención, MLP 3072 |
| Parametros totales | 87.132.104 (modelo base con cabeza de clasificación de 100 clases) |
| Parametros activos | No aplica: no es un modelo MoE. Parámetros entrenables en el ajuste fino: 1.294.948 (1,49 % del total) |
| Longitud de contexto | No aplica: modelo de visión, no procesa secuencias de texto. Resolución de entrada fija de 224x224 píxeles |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible. No aplica: la tarea es clasificación de imágenes, no generación de texto |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) y `layernorm_state.pth` (checkpoint PyTorch serializado) |

## Arquitectura y entrenamiento

El modelo base es `google/vit-base-patch16-224-in21k`, un Vision Transformer preentrenado en ImageNet-21k a resolución 224x224 que divide la imagen en parches de 16x16 y los procesa como una secuencia. Sobre él se aplica un ajuste fino con LoRA de rango 16 y alpha 32, dropout 0,05, dirigido a las proyecciones de consulta, clave, valor y salida de la atención. Además, las capas LayerNorm se descongelan y se ajustan por completo; esos pesos se distribuyen en un fichero separado (`layernorm_state.pth`) porque no forman parte del adaptador LoRA. La cabeza de clasificación se reconfigura a 100 etiquetas.

El entrenamiento duró 36 épocas con AdamW y tasa de aprendizaje 3e-4, schedule coseno con warmup, label smoothing 0,1, aumento de datos MixUp/CutMix y media móvil exponencial de pesos con decay 0,999. El autor declara una exactitud de test del 92,49 % y una mejor exactitud de validación del 93,28 %. No se detalla en la información disponible el número de tokens o muestras vistas, la composición exacta del dataset más allá de CIFAR-100, ni si hubo etapas adicionales de RLHF o DPO (no aplicables en una tarea de clasificación supervisada).

## Capacidades

- Clasificación de imágenes en 100 clases finas (categorías de CIFAR-100: mamíferos, vehículos, flores, objetos de cocina, etc.).
- Extracción de características visuales mediante el encoder ViT subyacente, reutilizable para tareas de transferencia congelando el backbone.
- Ajuste fino adicional con PEFT sobre el mismo adaptador (cargable y reentrenable con la librería `peft`).
- Inferencia en modo evaluación con `model.eval()`, integrable en pipelines estándar de `transformers`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modos especiales tipo thinking, visión-lenguaje, audio u OCR.

## Casos de uso

- Clasificación automática de imágenes en taxonomías de 100 categorías: el adaptador devuelve logits sobre las 100 clases de CIFAR-100, por lo que encaja en cualquier pipeline que necesite etiquetar imágenes de 224x224 en ese mismo espacio de etiquetas.
- Curado y etiquetado de datasets de investigación: dado que solo requiere ~87 M de parámetros en total y el adaptador ocupa unos pocos megabytes, se puede ejecutar en CPU sobre lotes grandes para preetiquetar conjuntos de imágenes antes de una revisión humana.
- Punto de partida para transfer learning en dominios propios: al ser un adaptador PEFT, es posible reentrenar únicamente los parámetros LoRA (1,29 M) sobre un dataset propio manteniendo congelado el resto del modelo, con coste de cómputo muy reducido.
- Estudio comparativo de técnicas PEFT: sirve como referencia reproducible frente a ajuste fino completo, ya que el repositorio de GitHub incluye el código y la comparación con EfficientNet-V2-S y WRN-28-10.
- Reproducción de experimentos académicos: el pipeline documentado (MixUp/CutMix, EMA, label smoothing, schedule coseno) permite reproducir y auditar los resultados declarados sin partir de cero.
- Clasificación en entornos con recursos limitados: al necesitar menos de 1 GB de VRAM en fp16 para lotes pequeños, cabe en GPU de gama de entrada y en CPU, lo que habilita despliegues en edge o en contenedores sin acelerador.
- Docencia y prácticas de visión por computador: el par modelo base + adaptador ilustra de forma compacta el flujo completo de PEFT en `transformers` y `peft` sin requerir hardware especializado.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| CIFAR-100 (test) | Exactitud | 92,49 % |
| CIFAR-100 (validación, mejor época) | Exactitud | 93,28 % |
| EfficientNet-V2-S (comparativa del repositorio) | Exactitud | no disponible |
| WRN-28-10 (comparativa del repositorio) | Exactitud | no disponible |

El autor indica que el repositorio de GitHub contiene la comparación frente a EfficientNet-V2-S y WRN-28-10, pero los valores numéricos de esas comparaciones no se incluyen en la información disponible. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) porque no son aplicables a un clasificador de imágenes.

## Requisitos de hardware

- Pesos del modelo base en fp32: aproximadamente 348 MB; en fp16: aproximadamente 174 MB. El adaptador LoRA añade unos 5 MB en fp32.
- VRAM estimada para inferencia: menos de 1 GB en fp16 con lotes pequeños a 224x224; entre 2 y 4 GB para lotes grandes (estimación orientativa, no publicada por el autor).
- Cabe en cualquier GPU de consumo: GTX 1650, RTX 3060, RTX 4070, RTX 4090, así como en Apple Silicon mediante MPS y en CPU pura para inferencia por lotes.
- GPU de centro de datos (A100, H100) solo justificables para entrenamiento o evaluación a gran escala, no para inferencia puntual.
- Opciones de despliegue: `transformers` + `peft` sobre PyTorch (ruta oficial documentada), exportación a ONNX Runtime o TensorRT, TorchScript y endpoints de inferencia de Hugging Face. `vLLM`, `llama.cpp`, Ollama y TGI no aplican: son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Solo se conoce el coste de entrenamiento (36 épocas) y la proporción de parámetros entrenados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Exactitud CIFAR-100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cifar100-vit-lora-adapter (este modelo) | 87,1 M totales; 1,29 M entrenados en el adaptador | Imagen 224x224, 100 clases | 92,49 % (test) | MIT | Hugging Face, adaptador PEFT + checkpoint LayerNorm |
| EfficientNet-V2-S | Aproximadamente 21,5 M | Imagen variable, 1000 clases de ImageNet por defecto | No disponible en la información | Por confirmar en su ficha | Referencia mencionada en el repositorio del autor |
| WRN-28-10 | Aproximadamente 36,5 M | Imagen 32x32 nativa en CIFAR | No disponible en la información | Por confirmar en su ficha | Referencia mencionada en el repositorio del autor |
| Ajuste fino completo de ViT-Base/16 | 87,1 M entrenables | Imagen 224x224, 100 clases | No disponible en la información | Apache-2.0 (modelo base) | Alternativa conceptual, no publicada en este repositorio |

Los recuentos de parámetros de EfficientNet-V2-S y WRN-28-10 son valores de referencia de esas arquitecturas y no cifras publicadas por el autor en esta ficha; conviene verificarlos en sus respectivas fuentes.

## Limitaciones y advertencias

- Espacio de etiquetas cerrado: solo predice las 100 clases de CIFAR-100. No es un modelo de propósito general ni admite prompts en lenguaje natural.
- Resolución y dominio: CIFAR-100 contiene imágenes nativas de 32x32 que se reescalan a 224x224, lo que introduce una diferencia de dominio respecto a fotografías reales de alta resolución. El rendimiento fuera de ese dominio no está documentado.
- Sesgos: no se publica ninguna evaluación de sesgos, equidad o robustez. Al derivar de un ViT preentrenado en ImageNet-21k, puede heredar los sesgos de ese corpus.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza en clases visualmente próximas dentro de las 100 categorías finas.
- Dependencia del modelo base: el adaptador no funciona por sí solo; requiere descargar `google/vit-base-patch16-224-in21k` y ajustar `num_labels=100`.
- Paso de carga adicional y riesgo de seguridad: el fichero `layernorm_state.pth` se carga con `torch.load`, que deserializa pickle. Solo debe cargarse desde una fuente de confianza; no se ofrece alternativa en safetensors para esos pesos.
- Adopción nula: cero descargas y una sola interacción registrada en el momento de la consulta. No hay validación independiente de los resultados declarados.
- Fechas anómalas: la fecha de creación y actualización del repositorio (septiembre de 2026) es posterior a la fecha habitual de publicación, lo que conviene tener en cuenta al citarlo.
- Licencia: el adaptador es MIT, pero el modelo base se distribuye bajo su propia licencia (habitualmente Apache-2.0). Es responsabilidad del integrador verificar y cumplir ambas antes de un uso comercial.
- Sin soporte de texto, tool calling ni agentes: no debe emplearse en pipelines conversacionales ni como sustituto de un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HamzaAhmedSharif/cifar100-vit-lora-adapter
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Repositorio de entrenamiento, notebooks y comparativas: https://github.com/HamzaAhmedSharif/Project-4.5-CIFAR-100-Image-Classification
- Dataset CIFAR-100: https://www.cs.toronto.edu/~kriz/cifar.html
- Librería PEFT: https://github.com/huggingface/peft
- Artículo original de Vision Transformer (ViT): https://arxiv.org/abs/2010.11929
- Artículo original de LoRA: https://arxiv.org/abs/2106.09685
