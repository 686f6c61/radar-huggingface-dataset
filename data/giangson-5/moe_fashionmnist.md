# GiangSon-5/MOE_FashionMNIST

## Resumen

MOE_FashionMNIST es un clasificador de imágenes experimental publicado en Hugging Face por el usuario GiangSon-5. Se trata de una red convolucional con una capa de mezcla dispersa de expertos (sparse mixture-of-experts) entrenada desde cero sobre Fashion-MNIST, el conocido conjunto de 70.000 imágenes en escala de grises de 28x28 píxeles y 10 clases de prendas de vestir. El modelo no es un modelo de lenguaje ni un modelo de propósito general: es una pieza de investigación docente o de validación de arquitecturas MoE aplicadas a visión por computador a pequeña escala.

La arquitectura combina un backbone convolucional con una capa MoE de 8 expertos MLP y enrutamiento top-2 con ruido (top-2 noisy gating), más una pérdida de equilibrado de carga inspirada en Switch Transformer. El recuento total de parámetros es de 181.450 (aproximadamente 0,181 M), de los cuales solo se activan dos expertos por imagen, lo que supone en torno al 25 % de la capacidad MoE por inferencia. El modelo se entrenó en una NVIDIA Tesla T4 en 108,64 segundos (5 épocas) y los pesos ocupan menos de 1 MB en disco.

Su relevancia es fundamentalmente pedagógica y de reproducibilidad: sirve como banco de pruebas mínimo y barato para estudiar enrutamiento disperso, colapso de expertos y especialización semántica no supervisada, no como componente de producción. La model card reporta un 88,93 % de exactitud en un test estrictamente reservado, ligeramente por debajo del 89,53 % de una CNN densa de referencia con menos parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con capa sparse mixture-of-experts (top-2 noisy gating, 8 expertos MLP) |
| Parámetros totales | 181.450 (~0,181 M) |
| Parámetros activos | ~25 % de la capacidad MoE por token (top-2 de 8 expertos) |
| Longitud de contexto | no disponible (no aplicable; clasificación de imágenes 28x28) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas en inglés; la tarea no es lingüística) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`moe_model.pth`), requiere código de arquitectura standalone |

## Arquitectura y entrenamiento

El modelo parte de un backbone convolucional seguido de una capa MoE formada por 8 expertos MLP independientes. El enrutador aplica top-2 noisy gating: cada imagen se envía a exactamente dos expertos, de modo que el coste computacional por muestra es aproximadamente el 25 % del que supondría activar los ocho. Para evitar el colapso de enrutamiento se añade la pérdida auxiliar de equilibrado de carga de Switch Transformer (E·Σ f_e P_e) con coeficiente α = 0,05, que según el autor elimina los expertos muertos sin ajuste manual de umbrales.

El entrenamiento se realizó desde cero sobre Fashion-MNIST con una partición en tres conjuntos libre de contaminación: 50.000 imágenes de entrenamiento, 10.000 de validación y 10.000 de test (semilla 42). Se completaron 5 épocas en 108,64 segundos sobre una Tesla T4. La model card reporta especialización semántica emergente y no supervisada: determinados expertos concentran calzado (zapatillas, sandalias, botas), prendas inferiores largas (pantalones, vestidos), prendas superiores o accesorios con correas. No se documenta el uso de RLHF, DPO ni decodificación especulativa; no son aplicables a esta tarea.

## Capacidades

- Clasificación de imágenes en 10 clases de prendas (Fashion-MNIST): camiseta, pantalón, pullover, vestido, abrigo, sandalia, camisa, zapatilla, bolso y botín.
- Enrutamiento disperso top-2 sobre 8 expertos con reparto equilibrado de carga.
- Especialización semántica de expertos emergente sin supervisión de la asignación.
- Inferencia en CPU o GPU de gama baja por el reducido tamaño del modelo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento extendido.
- No es un modelo generativo: no produce texto ni imágenes.

## Casos de uso

- Docencia de arquitecturas MoE: el modelo sirve para mostrar en clase, con un coste de cómputo mínimo (3,29 minutos de entrenamiento en T4), cómo funciona el enrutamiento top-2 y la pérdida auxiliar de equilibrado en un caso real y reproducible.
- Reproducción de experimentos de enrutamiento: al incluir código de arquitectura standalone y pesos de menos de 1 MB, permite iterar rápidamente sobre variantes de gating, número de expertos o coeficiente α sin necesidad de infraestructura relevante.
- Estudio de especialización semántica: el mapa de enrutamiento clase-experto publicado permite analizar cómo emergen agrupaciones de categorías afines (calzado, prendas inferiores, accesorios) sin supervisión explícita.
- Validación de pipelines de clasificación de imágenes: sirve como modelo de juguete para probar extremo a extremo un flujo de descarga desde el Hub, carga de pesos, preprocesado de Fashion-MNIST y evaluación de exactitud.
- Pruebas de integración en entornos con recursos limitados: su huella inferior a 1 MB y su inferencia en CPU lo hacen adecuado para tests automatizados de despliegue en contenedores ligeros o dispositivos embebidos de laboratorio.
- Comparación controlada MoE frente a denso: la model card incluye una CNN baseline de 118.538 parámetros, lo que permite reproducir el compromiso entre capacidad total, parámetros activos y exactitud final en un mismo conjunto de datos.
- Demostración de particiones libres de contaminación: el split 50k/10k/10k con semilla fija sirve de ejemplo de buenas prácticas de evaluación reproducible en proyectos pequeños.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente), sobre el conjunto de test reservado de 10.000 muestras:

| Modelo | Parámetros totales | Exactitud test | Pérdida test | Parámetros activos | Tiempo de entrenamiento (5 épocas) |
|---|---|---|---|---|---|
| CNN baseline | 118.538 (~0,119 M) | 89,53 % | 0,2997 | 100 % (densa) | 58,50 s (~11,7 s/época) |
| Sparse MoE (top-2) | 181.450 (~0,181 M) | 88,93 % | 0,3068 | ~25 % de la capacidad MoE | 108,64 s (~21,7 s/época) |

El resultado de exactitud del modelo MoE figura también en el model-index del repositorio con valor 88,93 y el campo `verified: false`. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar de modelos de lenguaje, que no son aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan 744 KB y el modelo tiene 181.450 parámetros, por lo que cabe holgadamente en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó en una NVIDIA Tesla T4. Para inferencia basta una GTX 1050, una RTX 3050 o incluso CPU.
- Cabe en cualquier GPU de consumo, incluidas las integradas, y en CPU sin problema.
- Opciones de despliegue: el repositorio usa `library_name: generic` y proporciona código de arquitectura standalone más un archivo `moe_model.pth`; la carga se realiza con PyTorch y `huggingface_hub`. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta el tiempo de entrenamiento (108,64 s para 5 épocas en T4). Dado el tamaño, la latencia por lote debería ser de milisegundos en GPU, pero no hay medida oficial disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Exactitud en Fashion-MNIST | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOE_FashionMNIST (este modelo) | 181.450 | Imagen 28x28 en escala de grises | 88,93 % (test reservado, no verificado) | MIT | Hugging Face |
| CNN baseline del mismo autor | 118.538 | Imagen 28x28 en escala de grises | 89,53 % (test reservado) | MIT (según repositorio) | Incluido en el mismo repo |
| Alternativas externas de referencia para Fashion-MNIST | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con otros modelos MoE de visión de tamaño similar ni con clasificadores de referencia de Fashion-MNIST de terceros; por tanto, la única comparación fiable es la que ofrece el propio autor frente a su baseline convolucional denso.

## Limitaciones y advertencias

- Ámbito muy restringido: solo clasifica imágenes de 28x28 en escala de grises de las 10 clases de Fashion-MNIST; no generaliza a imágenes reales de prendas ni a otras resoluciones o dominios.
- Exactitud inferior a la baseline densa: 88,93 % frente a 89,53 % con menos parámetros totales, lo que cuestiona la ventaja práctica de la capa MoE en este régimen de tamaño.
- Resultado no verificado: el valor de exactitud del model-index está marcado como `verified: false` y procede únicamente del autor.
- Riesgo de sobreajuste al conjunto: el modelo se entrena y evalúa sobre un dataset pequeño y muy homogéneo; no hay evidencia de robustez ante ruido, oclusiones o cambios de distribución.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, cultural o de representación de las categorías de prendas; Fashion-MNIST es un dataset con clases y estilos acotados.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en clases visualmente próximas (camisa frente a camiseta, pullover frente a abrigo).
- Idiomas: la etiqueta de idioma es `en` y las clases están en inglés; no hay soporte multilingüe ni procesamiento de texto.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el modelo no está pensado para producción real y su uso comercial sería en la práctica muy limitado por su dominio.
- Dependencia de código externo: la carga requiere el archivo de arquitectura `model_architecture.py` del repositorio; no es un modelo compatible de forma nativa con `transformers`, por lo que la integración exige código propio.
- Repositorio de tamaño 0.0 GB según Hugging Face: conviene verificar la disponibilidad real de los pesos antes de depender de ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/MOE_FashionMNIST
- Pesos: https://huggingface.co/GiangSon-5/MOE_FashionMNIST/resolve/main/moe_model.pth
- Panel de dinámica de entrenamiento: https://huggingface.co/GiangSon-5/MOE_FashionMNIST/resolve/main/moe_training_dynamics_dashboard.png
- Mapa de especialización del enrutador: https://huggingface.co/GiangSon-5/MOE_FashionMNIST/resolve/main/moe_expert_dispatch_heatmap.png
- Comparativa de latencia MoE frente a baseline: https://huggingface.co/GiangSon-5/MOE_FashionMNIST/resolve/main/moe_vs_baseline_comparison.png
- Dataset Fashion-MNIST: https://github.com/zalandoresearch/fashion-mnist
- Paper de referencia sobre mixture-of-experts: https://arxiv.org/abs/1701.06538
- Paper de referencia sobre Switch Transformer: https://arxiv.org/abs/2101.03961
- Paper de referencia sobre Fashion-MNIST: https://arxiv.org/abs/1708.07747
- Licencia MIT: https://opensource.org/licenses/MIT
