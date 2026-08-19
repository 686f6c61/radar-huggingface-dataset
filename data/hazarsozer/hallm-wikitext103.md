# hazarsozer/hallm-wikitext103

## Resumen

HaLLM es un conjunto de seis checkpoints de modelos de lenguaje tipo GPT entrenados desde cero sobre WikiText-103 como parte de una tesis de graduación de la Universidad Técnica de Estambul (ITU). El objetivo principal es investigar y comparar diferentes esquemas de weight-sharing (compartición de pesos) aplicados a modelos de lenguaje, extendiendo la técnica W+Wᵀ propuesta en HaLViT. Cada variante comparte una misma arquitectura base (dimensión 512, tokenizador BPE de GPT-2, contexto de 512 tokens) pero difiere en la estrategia de compartición de pesos y en la profundidad, lo que permite aislar el efecto de cada técnica sobre la perplejidad y el número de parámetros.

El modelo es relevante en el contexto actual de compresión de modelos y eficiencia computacional, ya que demuestra empíricamente que compartir pesos entre capas reduce drásticamente el número de parámetros no-embeddings (de 25,2M a 1,6M en el caso extremo) a costa de un aumento de la perplejidad. La variante A2 (W+Wᵀ) logra un equilibrio interesante: reduce los parámetros a la mitad con solo un incremento de perplejidad de 3,6 puntos respecto al control sin sharing. Todos los checkpoints se distribuyen bajo licencia MIT y están acompañados del código de entrenamiento en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-style (Transformer decoder) con weight-sharing opcional |
| Parametros totales | no disponible (cada variante tiene entre 1,6M y 50,3M de parametros no-embeddings) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en float32 en `model.pt`) |
| Idiomas soportados | ingles (tokenizador BPE de GPT-2) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (`model.pt`), con `model_config` incluido |

## Arquitectura y entrenamiento

Los seis modelos comparten una arquitectura GPT estándar con dimensión de modelo `d=512`, tokenizador BPE de GPT-2 y ventana de contexto de 512 tokens. La diferencia clave está en el esquema de weight-sharing aplicado entre capas:

- **A0**: sin sharing, 8 capas (control).
- **A1**: sharing cross-layer estilo ALBERT (todas las capas comparten los mismos pesos), 8 capas.
- **A2**: sharing W+Wᵀ de HaLViT (la matriz de proyección se comparte entre capas y se usa su transpuesta en la proyección inversa), 8 capas.
- **A3**: combinación de A1 y A2, 8 capas.
- **A2-iso**: sharing W+Wᵀ pero con almacenamiento iso (mismo número de parámetros que A0), 16 capas.
- **A0-deep**: sin sharing, 16 capas (control profundo).

Todos se entrenaron desde cero sobre WikiText-103 (raw) con un presupuesto idéntico de 50.000 pasos (aproximadamente 614 millones de tokens) y semilla 1337. No se menciona el uso de RLHF, DPO ni técnicas de alineación; el entrenamiento es de modelado de lenguaje autorregresivo estándar. El código y los detalles de entrenamiento están disponibles en el repositorio de GitHub.

## Capacidades

- Generacion de texto autorregresivo en ingles con un contexto maximo de 512 tokens.
- Modelado de lenguaje basico: capaz de continuar texto y estimar probabilidades de secuencias.
- Investigacion sobre compresion de modelos: permite estudiar el impacto de distintas tecnicas de weight-sharing en la perplejidad y el numero de parametros.
- No dispone de tool calling, function calling, capacidades multimodales, ni soporte para agentes.
- No incluye modo de razonamiento explicito ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion academica en compresion de modelos: el conjunto de checkpoints permite reproducir los experimentos de la tesis y comparar directamente las tecnicas de weight-sharing (A0 vs A1 vs A2 vs A3) bajo condiciones de entrenamiento identicas.
- Estudio de trade-offs entre parametros y perplejidad: los datos de la tabla de resultados (parametros no-embeddings y PPL) sirven como referencia para disenar modelos mas eficientes.
- Desarrollo de nuevas variantes de weight-sharing: el codigo en GitHub facilita extender los esquemas existentes y probar combinaciones adicionales.
- Evaluacion de tecnicas de cuantizacion o poda: los modelos pequenos (1,6M a 50M parametros) son utiles como bancos de prueba para algoritmos de compresion sin necesidad de GPUs potentes.
- Reproducibilidad en ensenanza: al ser un proyecto de tesis con codigo abierto y licencia MIT, es adecuado para cursos de aprendizaje automatico donde se quiera ilustrar el efecto de compartir pesos en transformers.
- Comparacion de arquitecturas ligeras: los checkpoints A2-iso y A0-deep permiten analizar si aumentar la profundidad con sharing compensa la perdida de calidad frente a un modelo mas ancho sin sharing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perplejidad en el conjunto de test de WikiText-103, que se muestra a continuacion junto con el numero de parametros no-embeddings de cada variante:

| Variante | Esquema de sharing | Profundidad | Parametros no-emb | Test PPL |
|---|---|---|---|---|
| A0 | ninguno | 8 | 25,2M | 26,06 |
| A1 | ALBERT cross-layer | 8 | 3,1M | 35,63 |
| A2 | HaLViT W+Wᵀ | 8 | 12,6M | 29,68 |
| A3 | ambos | 8 | 1,6M | 43,30 |
| A2-iso | W+Wᵀ, iso-storage vs A0 | 16 | 25,2M | 27,01 |
| A0-deep | ninguno (control) | 16 | 50,3M | 23,98 |

Estos resultados demuestran que el sharing W+Wᵀ (A2) reduce los parametros a la mitad con una perdida de calidad moderada (+3,6 PPL), mientras que el sharing cross-layer de ALBERT (A1) es menos eficiente en este regimen de entrenamiento. La variante A3, que combina ambas tecnicas, consigue la maxima compresion pero con una PPL significativamente peor.

## Requisitos de hardware

- Al ser modelos muy pequenos (maximo 50,3M de parametros en A0-deep), caben en cualquier GPU consumer moderna (por ejemplo, NVIDIA GTX 1060 o superior) e incluso en CPU para inferencia.
- VRAM estimada: en float32, 50M de parametros ocupan aproximadamente 200 MB; en float16 serian unos 100 MB. Cualquier GPU con mas de 1 GB de VRAM es suficiente.
- No se requieren GPUs de datacenter (A100, H100) para entrenar o ejecutar estos modelos.
- El repositorio proporciona codigo en PyTorch; para despliegue se podria usar directamente con `torch` o exportar a ONNX. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- La latencia de inferencia es minima (contexto de 512 tokens, modelo de 50M de parametros); se puede ejecutar en tiempo real incluso en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (modelos GPT pequenos entrenados en WikiText-103 con weight-sharing). El propio conjunto de variantes sirve como comparacion interna, pero no hay referencias externas en la informacion proporcionada. Se podria mencionar que GPT-2 small (124M parametros) tiene una PPL en WikiText-103 de aproximadamente 29,4, pero ese dato no esta incluido en la documentacion del modelo y no se puede verificar aqui. Por tanto, la comparativa se limita a las variantes internas.

## Limitaciones y advertencias

- Modelo de investigacion, no pensado para produccion: es un proyecto de tesis con fines academicos, sin optimizacion para inferencia ni soporte de herramientas.
- Tamanio muy reducido: incluso la variante mas grande (50,3M de parametros) tiene una capacidad limitada en comparacion con modelos modernos; la generacion de texto sera de baja calidad y propensa a incoherencias.
- Contexto corto: solo 512 tokens, insuficiente para tareas que requieran razonamiento de largo alcance o documentos extensos.
- Solo ingles: el tokenizador BPE de GPT-2 no soporta otros idiomas de forma adecuada.
- Riesgo de alucinacion y sesgos: al estar entrenado en WikiText-103, un corpus enciclopedico, puede reflejar sesgos presentes en ese dataset, aunque no se han realizado evaluaciones de sesgo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Formato de pesos propietario: los checkpoints se cargan con `torch.load(..., weights_only=True)` y requieren el codigo del repositorio (`hallm.model.GPT`); no hay versiones en safetensors, GGUF u otros formatos estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hazarsozer/hallm-wikitext103
- Repositorio de codigo y resultados: https://github.com/hazarsozer/hallm
