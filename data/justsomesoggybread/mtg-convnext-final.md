# JustSomeSoggyBread/mtg-convnext-final

## Resumen

`mtg-convnext-final` es un modelo de clasificación de imágenes desarrollado por JustSomeSoggyBread (Evan Hayden Lee) que reconoce los colores de las cartas de Magic: The Gathering (MTG). Se trata de un fine-tuning del modelo `facebook/convnext-tiny-224`, un ConvNeXt-Tiny de 28 millones de parámetros, entrenado para clasificar imágenes de cartas en cinco categorías de color: blanco (W), azul (U), negro (B), rojo (R) y verde (G). El modelo resuelve el problema de identificar automáticamente los colores de una carta a partir de su imagen, una tarea relevante para aplicaciones de escaneo, catalogación y asistencia a jugadores.

El modelo se publica bajo licencia Apache-2.0, con pesos en formato safetensors y es compatible con el ecosistema de Hugging Face Transformers. Aunque la model card no especifica el dataset de entrenamiento, las métricas de evaluación reportadas indican que se trata de un problema de clasificación multi-etiqueta (una carta puede tener varios colores). Con una exactitud de coincidencia exacta del 37,88 % y una exactitud de Hamming del 79,76 %, el modelo ofrece un rendimiento moderado que puede ser útil en flujos de trabajo semiautomáticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN pura) |
| Parametros totales | 27.823.973 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 por defecto) |
| Idiomas soportados | no disponible (no es modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ConvNeXt-Tiny, una arquitectura de red neuronal convolucional pura presentada en el paper "A ConvNet for the 2020s" (Liu et al., 2022). ConvNeXt moderniza los CNN clásicos incorporando diseños inspirados en Vision Transformers, como parches de imagen, normalización por capas, y kernels de convolución grandes (7x7), logrando un equilibrio entre eficiencia y precisión. El modelo base `facebook/convnext-tiny-224` procesa imágenes de 224x224 píxeles y tiene 28 millones de parámetros.

El fine-tuning se realizó con el Trainer de Hugging Face, utilizando un optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), una tasa de aprendizaje de 0.0001 con scheduler coseno y warmup del 10 %, tamaño de batch de 32, y 5 épocas. Se usó precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card, pero las métricas de evaluación (exact match, Hamming, F1 por clase) indican que se trata de una tarea de clasificación multi-etiqueta sobre los cinco colores de MTG. No se menciona el uso de técnicas como RLHF o DPO, al ser un modelo de visión supervisado.

## Capacidades

- Clasificación de imágenes de cartas de Magic: The Gathering en cinco colores: blanco, azul, negro, rojo y verde.
- Soporte de clasificación multi-etiqueta: una carta puede tener varios colores simultáneamente (por ejemplo, una carta multicolor dorada se etiqueta con los colores que la componen).
- Inferencia sobre imágenes de 224x224 píxeles, compatible con el pipeline `image-classification` de Transformers.
- No dispone de capacidades de generación de texto, tool calling, agentes, ni procesamiento de lenguaje natural.
- No es un modelo multimodal: solo procesa imágenes, sin entrada de texto.

## Casos de uso

- Escaneo y catalogación de colecciones de MTG: el modelo puede procesar fotografías de cartas y asignar automáticamente los colores, facilitando la organización de inventarios en aplicaciones de gestión de colecciones.
- Asistencia a jugadores en la construcción de mazos: al identificar los colores de una carta, una aplicación puede sugerir estrategias o filtrar cartas por afinidad de color.
- Automatización de tareas de clasificación en tiendas online: al subir imágenes de cartas, el sistema puede etiquetar los colores sin intervención manual, reduciendo errores en la ficha del producto.
- Integración en herramientas de análisis de metajuego: al clasificar colores de cartas de torneos, se pueden generar estadísticas sobre la distribución de colores en mazos competitivos.
- Preprocesamiento en pipelines de visión por computadora: el modelo puede servir como primer paso para filtrar cartas por color antes de aplicar otros modelos (por ejemplo, reconocimiento de texto o rareza).
- Demostraciones educativas de fine-tuning: al ser un modelo pequeño y con licencia permisiva, es útil como ejemplo práctico de ajuste de ConvNeXt para tareas específicas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, ImageNet, etc.) en la información disponible. La model card reporta las siguientes métricas de evaluación sobre el conjunto de validación, tras 5 épocas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss | 1.0220 |
| Micro F1 | 0.5651 |
| Macro F1 | 0.5659 |
| Exact Match Accuracy | 0.3788 |
| Hamming Accuracy | 0.7976 |
| Precision (W) | 0.4796 |
| Recall (W) | 0.5995 |
| F1 (W) | 0.5329 |
| Precision (U) | 0.4912 |
| Recall (U) | 0.6608 |
| F1 (U) | 0.5635 |
| Precision (B) | 0.4514 |
| Recall (B) | 0.6469 |
| F1 (B) | 0.5318 |
| Precision (R) | 0.5227 |
| Recall (R) | 0.6533 |
| F1 (R) | 0.5808 |
| Precision (G) | 0.5662 |
| Recall (G) | 0.6866 |
| F1 (G) | 0.6206 |

Estos valores indican un rendimiento moderado: la exactitud de coincidencia exacta (que exige acertar todas las etiquetas de una carta) es baja (37,88 %), pero la exactitud de Hamming (que mide el porcentaje de etiquetas correctas sobre el total) es alta (79,76 %). El modelo tiende a tener mejor recall que precisión en todas las clases, lo que sugiere que etiqueta en exceso (predice más colores de los reales).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (el modelo ocupa ~111 MB en pesos). Con cuantización a int8, el uso de memoria baja aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en cualquier GPU de consumo actual, incluidas las integradas de gama media.
- Opciones de despliegue: se puede servir con la librería `transformers` (pipeline `image-classification`), exportar a ONNX para inferencia optimizada, o usar herramientas como TorchServe o FastAPI para una API REST.
- Latencia estimada: en una GPU moderna (por ejemplo, RTX 3090), la inferencia sobre una imagen de 224x224 tarda del orden de 1-5 ms. En CPU, puede tardar entre 20-100 ms dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de resultados de evaluación de otros modelos sobre el mismo dataset de cartas MTG, por lo que no es posible una comparativa directa de rendimiento. A continuación se comparan las características arquitectónicas con alternativas comunes de clasificación de imágenes de tamaño similar:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtg-convnext-final | ConvNeXt-Tiny | 27,8 M | 224x224 | Apache-2.0 | Hugging Face |
| facebook/convnext-tiny-224 | ConvNeXt-Tiny | 28 M | 224x224 | MIT | Hugging Face |
| ResNet-18 | CNN residual | 11,7 M | 224x224 | BSD-3 | Hugging Face |
| ViT-Tiny | Vision Transformer | 5,7 M | 224x224 | Apache-2.0 | Hugging Face |

El modelo se distingue por estar específicamente ajustado para la tarea de colores MTG, mientras que los otros son modelos generales preentrenados en ImageNet. Para esta tarea concreta, el fine-tuning debería ofrecer mejor rendimiento que los modelos base sin ajuste, aunque no hay datos que lo confirmen.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar posibles sesgos en la distribución de colores, condiciones de iluminación o estilos de imagen de las cartas.
- La exactitud de coincidencia exacta es baja (37,88 %), lo que significa que en más de la mitad de las cartas el modelo no acierta todas las etiquetas de color. Es adecuado para tareas de asistencia, pero no para automatización sin supervisión humana.
- El modelo solo reconoce colores; no identifica el nombre de la carta, su rareza, coste de maná ni otros atributos relevantes.
- Puede fallar con cartas de bordes dorados, cartas de doble cara o ilustraciones con fondos que confundan la detección de color.
- Al ser un modelo de visión, no tiene capacidades de razonamiento textual ni de interacción conversacional.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar que el dataset de entrenamiento no tenga restricciones adicionales (no se especifica su procedencia).
- No se han publicado resultados en benchmarks estándar de visión, por lo que su rendimiento fuera de la tarea MTG es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustSomeSoggyBread/mtg-convnext-final
- Perfil del autor en Hugging Face: https://huggingface.co/JustSomeSoggyBread
- Modelo base ConvNeXt-Tiny: https://huggingface.co/facebook/convnext-tiny-224
- Paper de ConvNeXt: https://arxiv.org/abs/2201.03545
- Repositorio oficial de ConvNeXt: https://github.com/CPFelix/ConvNeXt
- Perfil del autor en GitHub: https://github.com/JustSomeSoggybread
