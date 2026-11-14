# aitalo/convnext-tiny-comida-brasileira

## Resumen

ConvNeXt-Tiny para comida brasileira es un modelo de clasificación de imágenes desarrollado por el usuario aitalo como proyecto de portafolio. Se trata de un fine-tuning de facebook/convnext-tiny-224, una red neuronal convolucional de la familia ConvNeXt, sobre un conjunto de recortes de alimentos presentes en platos típicos de Brasil. El modelo clasifica una imagen de un único alimento en una de 20 categorías (arroz, feijão, farofa, mandioca, bife à milanesa, etc.).

El problema que aborda es la clasificación automática de componentes de un plato brasileño a partir de recortes segmentados, un paso habitual en pipelines de análisis nutricional o de reconocimiento de dietas. El modelo cuenta con 27.835.508 parámetros totales, un tamaño de repositorio de 0,1 GB y una entrada de 224x224 píxeles. La ventana de contexto no aplica al ser un modelo de visión.

Es relevante ahora por su carácter didáctico y reproducible: documenta de forma transparente el dataset, el protocolo de entrenamiento, los resultados con baselines y un mecanismo de rechazo por baja confianza. No obstante, el propio autor lo declara explícitamente como no apto para producción, con solo 653 imágenes de entrenamiento y 131 de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (CNN pura, base facebook/convnext-tiny-224) |
| Parametros totales | 27.835.508 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | pt (etiquetas en portugues) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es ConvNeXt-Tiny, una red convolucional pura que moderniza el diseño de ResNet con bloques invertidos, convoluciones depthwise de 7x7, LayerNorm y activación GELU, inspirada en los transformers visuales. El modelo parte de los pesos de facebook/convnext-tiny-224 y se somete a un fine-tuning completo sobre 653 recortes de entrenamiento, con 131 de validación y 131 de test, extraídos de 505 fotos del dataset Brazilian food images (Mendeley Data), que incluye máscaras de segmentación por alimento. El split es estratificado por clase y agrupado por foto de origen para evitar fuga de datos entre conjuntos.

El entrenamiento usa entrada 224x224 redimensionada sin recorte central, optimizador AdamW con tasa de aprendizaje 1e-4, calentamiento y decaimiento en coseno, weight decay 0,05, label smoothing 0,1, batch de 32 y hasta 30 épocas con parada temprana por F1 macro de validación. Se empleó precisión mixta fp16 en una GPU Tesla T4, con aumento de datos ligero (recorte aleatorio, espejado y variaciones de brillo, contraste y saturación). Se ejecutaron 14 épocas (mejor resultado en la 8), en 1,1 minutos, con seed 42 y una única tirada, sin búsqueda de hiperparámetros. No se documenta RLHF ni DPO, al no tratarse de un modelo generativo.

## Capacidades

- Clasificación de imágenes de un único alimento en 20 clases del recetario brasileño: abóbora, arroz, batata frita, beterraba, bife à milanesa, carne bovina, cenoura, farofa, feijão, frango, macarrão, macarrão ao molho vermelho, maionese de batata, mandioca, milho, ovo, purê, repolho roxo, salada y tomate.
- Salida de probabilidades por clase (softmax), utilizable con top-k.
- Mecanismo de rechazo por umbral de confianza calibrado (0,265, cuantil 0,05 de la confianza de los aciertos en validación).
- Funciona sobre recortes donde un único alimento ocupa casi todo el encuadre.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidad multilingüe limitada a las etiquetas en portugués; no procesa texto.

## Casos de uso

- Análisis nutricional de platos brasileños: a partir de un recorte segmentado de cada componente del plato, el modelo etiqueta el alimento y permite asociarlo a una base de datos nutricional, siempre que se respete la condición de recorte sobre fondo negro.
- Etiquetado asistido de datasets de alimentos: útil para preanotar recortes en un corpus de comida brasileña y reducir el trabajo manual, con revisión humana posterior por las limitaciones de dominio.
- Prototipo educativo de visión por computador: sirve como ejemplo reproducible de fine-tuning de ConvNeXt con split agrupado por foto, umbral de rechazo y comparación con baselines congelados.
- Filtrado previo en aplicaciones de dietética: combinado con un detector de alimentos y un segmentador, puede clasificar cada región de un plato antes de un cálculo calórico aproximado, aceptando solo predicciones por encima del umbral.
- Demostración de rechazo por baja confianza: el umbral publicado permite mostrar en un cuaderno o demo cómo descartar predicciones dudosas (cobertura del 97,7% en test con 95,3% de acierto en los aceptados).
- Evaluación comparativa de estrategias de transfer learning: el par de baselines (ConvNeXt congelado + cabeza lineal frente a fine-tuning completo) permite medir la ganancia del ajuste fino en un dataset pequeño y desbalanceado.
- Docencia sobre limitaciones de datasets pequeños: las métricas por clase y las confusiones documentadas (por ejemplo, purê confundido con ovo, macarrão con batata frita) sirven para ilustrar la fragilidad de las métricas con pocos ejemplos de test.

## Benchmarks y rendimiento

Resultados medidos en el conjunto de test (131 recortes de 72 fotos), comparados con dos baselines evaluados por el mismo código:

| Modelo | Acurácia | F1 macro | Acurácia top-3 | Ejemplos de test |
|---|---|---|---|---|
| Clase mayoritaria | 10,7% | 1,0% | 28,2% | 131 |
| ConvNeXt-Tiny congelado + cabeza lineal | 77,9% | 76,0% | 94,7% | 131 |
| ConvNeXt-Tiny con fine-tuning | 94,7% | 93,7% | 99,2% | 131 |

Rendimiento del mecanismo de rechazo con umbral 0,265:

| Conjunto | Cobertura | Acurácia en los aceptados | Errores rechazados | Aciertos rechazados |
|---|---|---|---|---|
| Validación (n=131) | 92,4% | 95,9% | 37,5% | 5,7% |
| Test (n=131) | 97,7% | 95,3% | 14,3% | 1,6% |

F1 por clase del modelo con fine-tuning (selección): salada 100,0% (14 ejemplos), arroz 96,0% (12), carne bovina 96,0% (12), tomate 95,7% (11), feijão 95,2% (11), cenoura 94,7% (10), batata frita 94,1% (8), frango 87,5% (8), macarrão 80,0% (3), repolho roxo 80,0% (2).

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en fp32 para los 27,8 M de parámetros; en la práctica, unos pocos cientos de MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una Tesla T4.
- Cabe en GPU de consumo: sí, en cualquier RTX (3060, 4060, 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (pipeline image-classification), exportación a ONNX o TorchScript no documentada, pero viable por tratarse de una CNN estándar; no se documenta soporte en vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma oficial; el entrenamiento de 14 épocas sobre 653 imágenes tardó 1,1 minutos en T4, lo que sugiere inferencia en el orden de milisegundos por imagen en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aitalo/convnext-tiny-comida-brasileira | 27,8 M | 224x224 | 94,7% acc / 93,7% F1 macro en test propio | Apache-2.0 | Hugging Face |
| facebook/convnext-tiny-224 (base) | 28,6 M | 224x224 | No evaluado en este dataset; sirve de base | Apache-2.0 | Hugging Face |
| ConvNeXt-Tiny congelado + cabeza lineal (baseline del autor) | 27,8 M (cabeza lineal extra) | 224x224 | 77,9% acc / 76,0% F1 macro en test propio | Apache-2.0 | No publicado como modelo aparte |
| Clase mayoritaria (baseline trivial) | 0 | no aplica | 10,7% acc / 1,0% F1 macro | no aplica | no aplica |

No se dispone de comparación con otros clasificadores de comida brasileña en la información proporcionada.

## Limitaciones y advertencias

- Fondo negro: el dataset original presenta los platos recortados sobre fondo negro; el modelo nunca ha visto mesas, manteles ni cubiertos, y su rendimiento en fotos de móvil no se ha medido.
- Solo recortes: una foto de plato completo con varios alimentos queda fuera del dominio aprendido.
- Test pequeño: 131 recortes de 72 fotos, con cinco clases con tres o menos ejemplos de test; las métricas por clase varían mucho con un solo error.
- Una única tirada de entrenamiento, una sola seed, sin intervalos de confianza ni búsqueda de hiperparámetros.
- Clases desbalanceadas: entre 12 y 69 recortes de entrenamiento por clase.
- Dominio de las fotos: todas provienen de una única fuente con estilo visual homogéneo y la página del dataset no indica su origen.
- El rechazo no detecta "no es comida": el umbral se calibró solo con imágenes de comida del propio dataset, por lo que una imagen de otro dominio puede recibir confianza alta.
- Solo 20 clases: cualquier otro alimento se clasificará como una de ellas o se rechazará.
- Sesgos conocidos: no documentados más allá del desbalanceo de clases y del dominio restringido de las imágenes.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de predicción errónea con alta confianza fuera del dominio.
- Restricciones de licencia: pesos bajo Apache-2.0, igual que el modelo base; los datos de entrenamiento tienen su propia licencia (atribuida a de Carvalho, Marcos en la model card, sin detalle adicional).
- Caveat para producción: el autor declara explícitamente que es un proyecto de portafolio y no apto para uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitalo/convnext-tiny-comida-brasileira
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset Brazilian food images (Mendeley Data): https://data.mendeley.com/datasets/7n36jtcpv3/2
