# cynstl/atelierai-models

## Resumen

AtelierAI es un conjunto de checkpoints de PyTorch publicados por el usuario cynstl en Hugging Face bajo el identificador `cynstl/atelierai-models`. No se trata de un modelo generativo de lenguaje, sino de una coleccion de cuatro artefactos de vision por computador orientados a la sintesis condicional de prendas de vestir sobre el dataset Fashion-MNIST: un generador GAN condicional, un VAE condicional, un clasificador CNN auxiliar y un DistilBERT afinado para clasificacion de intenciones a partir de prompts en lenguaje natural.

El nucleo del repositorio es un GAN convolucional profundo con discriminador de proyeccion (Miyato y Sugiyama, 2018) que genera imagenes en escala de grises de 28x28 pixeles condicionadas por una de las diez clases de prendas de Fashion-MNIST, partiendo de un vector latente de 100 dimensiones. El autor reporta una tasa de acierto de oraculo del 97,20% sobre 1.000 muestras, medida con el clasificador CNN auxiliar incluido en el mismo repositorio.

La relevancia de esta publicacion es limitada en el panorama actual de IA generativa: se trata de un experimento academico o de portafolio entrenado durante 25 epocas en una unica GPU RTX 3060, con 0 descargas y 0 likes en el momento de la consulta. Resulta util como referencia reproducible para quienes estudien GANs condicionales, VAEs y pipelines de clasificacion de intenciones sobre datasets de baja resolucion, pero no compite con modelos de difusion ni con sistemas texto-a-imagen de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN convolucional condicional con discriminador de proyeccion; VAE convolucional condicional; CNN de 4 capas con BatchNorm y Dropout; DistilBERT afinado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el componente de texto es DistilBERT, sin contexto extendido documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (DistilBERT base es `uncased` en ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt` para los checkpoints, directorio `distilbert_fashion/` para el modelo de texto); el repositorio incluye tambien `safetensors` segun los tags |

## Arquitectura y entrenamiento

El generador condicional es una GAN convolucional profunda que recibe ruido latente gaussiano de 100 dimensiones junto con la etiqueta de clase (una de las diez categorias de Fashion-MNIST) y produce imagenes de 1x28x28 en escala de grises. El discriminador emplea la tecnica de *projection discriminator* de Miyato y Sugiyama (2018), que incorpora la informacion de clase mediante un producto interno con una proyeccion aprendida de la etiqueta, en lugar de concatenarla directamente a la entrada. El entrenamiento se realizo durante 25 epocas sobre una NVIDIA GeForce RTX 3060.

El VAE condicional es una variante convolucional con espacio latente continuo de 32 dimensiones y prior gaussiano, entrenado tambien durante 25 epocas con una funcion de perdida que combina reconstruccion BCE y divergencia KL. El clasificador auxiliar es una CNN de cuatro capas con normalizacion por lotes y dropout, que alcanza un 90,76% de exactitud sobre el conjunto de test real de Fashion-MNIST. El cuarto componente es un `distilbert-base-uncased` afinado para clasificar la intencion de prompts de prendas en lenguaje natural, presumiblemente para enrutar peticiones de texto hacia las clases del generador. No se documenta el volumen de tokens de entrenamiento, la composicion exacta del dataset de prompts ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion condicional de imagenes de prendas en escala de grises a 28x28 pixeles, con control explicito sobre una de las diez clases de Fashion-MNIST.
- Reconstruccion y muestreo desde un espacio latente continuo de 32 dimensiones mediante el VAE condicional.
- Clasificacion de imagenes de prendas con una CNN de 4 capas (90,76% de exactitud en test).
- Clasificacion de intenciones en prompts de texto en ingles mediante DistilBERT afinado.
- Evaluacion de fidelidad generativa mediante la metrica de *oracle match rate* usando el clasificador auxiliar.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision de alta resolucion, audio ni modo de pensamiento extendido.
- No se documentan capacidades multilingues; el componente de texto se basa en un modelo `uncased` en ingles.

## Casos de uso

- Docencia e investigacion sobre GANs condicionales: el repositorio ofrece un ejemplo completo y reproducible de generador con discriminador de proyeccion entrenado sobre Fashion-MNIST, util para comparar tecnicas de condicionamiento en cursos de aprendizaje profundo.
- Prototipado de aumentacion de datos: las imagenes sinteticas generadas por clase pueden emplearse para aumentar conjuntos de entrenamiento de clasificadores de prendas cuando se dispone de pocas muestras reales por categoria.
- Pruebas de pipelines de evaluacion generativa: la metrica de *oracle match rate* implementada con el clasificador auxiliar sirve como banco de pruebas para medir fidelidad condicional en modelos generativos de baja resolucion.
- Demostracion de VAEs condicionales: el checkpoint `vae.pt` permite experimentar con interpolacion en espacio latente de 32 dimensiones y comparar la calidad de reconstruccion frente a la GAN.
- Clasificacion de intenciones en asistentes de moda: el DistilBERT afinado puede integrarse como componente de enrutamiento en un chatbot que traduzca peticiones en lenguaje natural a categorias de prenda.
- Educacion en despliegue de modelos: al ocupar 0,3 GB, el repositorio completo cabe en cualquier portatil y permite practicar la carga de checkpoints PyTorch, la exportacion a otros formatos y la integracion en APIs ligeras.
- Referencia para comparativas de arquitecturas generativas: util para contrastar GAN frente a VAE en terminos de fidelidad condicional (97,20% frente a 74,90%) sobre el mismo dataset y presupuesto de entrenamiento.

## Benchmarks y rendimiento

| Modelo / componente | Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|---|
| GAN condicional (`cgan_generator.pt`) | Oracle match rate | 97,20% | 1.000 muestras sinteticas |
| VAE condicional (`vae.pt`) | Oracle match rate | 74,90% | no disponible |
| Clasificador CNN (`fashion_classifier.pt`) | Exactitud | 90,76% | Test real de Fashion-MNIST |
| DistilBERT afinado | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (FID, IS, MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores son las reportadas por el autor en la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para cualquiera de los componentes individuales, dado que el repositorio completo ocupa 0,3 GB y las arquitecturas son convolucionales de baja resolucion o un DistilBERT base.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno en una NVIDIA GeForce RTX 3060, que es mas que suficiente. Tambien funciona en CPU para inferencia puntual.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en iGPU modernas con suficiente memoria compartida.
- Opciones de despliegue: al ser checkpoints PyTorch puros (`.pt`), la via natural es cargarlos con `torch.load` en un script Python o servirlos con TorchServe o FastAPI. No hay versiones GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano y la resolucion, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtelierAI (cynstl) | GAN + VAE + CNN + DistilBERT | no disponible | 28x28 px, 10 clases | MIT | Hugging Face, 0 descargas |
| DCGAN original (Radford et al., 2015) | GAN no condicional | ~ varios millones | 64x64 px | codigo abierto | Referencia academica |
| cGAN con projection discriminator (Miyato y Sugiyama, 2018) | GAN condicional | no disponible | variable | codigo abierto | Referencia academica |
| Stable Diffusion (Stability AI) | Difusion texto-a-imagen | ~1.000 M (UNet) | 512x512 px o superior | CreativeML OpenRAIL-M | Ampliamente disponible |

La comparacion con modelos de difusion como Stable Diffusion no es directa: AtelierAI opera en un regimen de resolucion y dominio mucho mas restringido (28x28 en escala de grises, solo prendas de Fashion-MNIST) y no acepta prompts de texto libres en el generador, solo etiquetas de clase. Frente a DCGAN y a la propuesta de Miyato y Sugiyama, la diferencia principal es la disponibilidad de checkpoints entrenados y la inclusion de un pipeline de evaluacion con clasificador auxiliar.

## Limitaciones y advertencias

- Resolucion muy baja (28x28 en escala de grises): las imagenes generadas no son aptas para produccion visual real, solo para experimentacion o aumentacion de datos en dominios muy acotados.
- Dominio restringido a las diez clases de Fashion-MNIST; no generaliza a otras categorias de prendas ni a otros datasets sin reentrenamiento.
- El generador no acepta prompts de texto libres: la condicion es una etiqueta de clase discreta. El DistilBERT solo clasifica intenciones, no genera imagenes directamente.
- La metrica de *oracle match rate* se calcula con el propio clasificador del repositorio, lo que introduce un sesgo de circularidad: un clasificador afinado sobre el mismo dominio puede sobreestimar la calidad real de las muestras.
- Riesgo de mode collapse inherente a las GANs; no se documentan curvas de entrenamiento ni diversidad de muestras.
- El componente de texto es `distilbert-base-uncased`, entrenado principalmente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos potenciales en Fashion-MNIST: el dataset original esta sesgado hacia prendas de moda occidental y no representa diversidad cultural ni de tallas.
- Licencia MIT permite uso comercial, pero el dataset Fashion-MNIST subyacente tiene su propia licencia MIT de Zalando SE; conviene verificar la atribucion en productos derivados.
- Repositorio sin descargas ni validacion externa: la calidad de los checkpoints no ha sido verificada por terceros.
- No apto para produccion en sistemas de recomendacion o sintesis de moda reales sin un reentrenamiento sustancial a mayor resolucion y con datos propios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cynstl/atelierai-models
- Sitio del proyecto AtelierAI (producto comercial no necesariamente vinculado a los checkpoints): https://atelierai.tech/
- Documentacion de modelos y escenas de AtelierAI: https://atelierai.tech/docs/models-and-scenes/
- Paper del projection discriminator (Miyato y Sugiyama, 2018): https://arxiv.org/abs/1802.05637
- DCGAN original (Radford et al., 2015): https://arxiv.org/abs/1511.06434
- Dataset Fashion-MNIST (Zalando SE): https://github.com/zalandoresearch/fashion-mnist
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
