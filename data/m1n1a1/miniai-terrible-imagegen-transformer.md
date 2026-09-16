# M1n1A1/MiniAI-terrible-imagegen-transformer

## Resumen

T.I.T.S. (Terrible Imagegen TranSformer) es un modelo de difusion texto-a-imagen entrenado desde cero por el usuario M1n1A1 y publicado en HuggingFace bajo licencia MIT. A pesar del nombre, no es un transformer: la arquitectura real es una UNet pequena (TinyUNet) con una unica capa de self-attention, 16,10 millones de parametros y un codificador de texto CLIP ViT-B/32 congelado. Genera imagenes de 128x128 pixeles en espacio de pixeles, sin VAE ni latentes.

El modelo resuelve un problema deliberadamente acotado: demostrar que se puede entrenar un diffusion funcional desde cero en hardware de consumo. El autor lo entreno en 7,5 horas sobre una unica RTX 4060 Ti de 8 GB, con 3 epocas y 53.130 pasos sobre COCO Captions. No compite con modelos de generacion de imagen de gran escala; su interes es educativo y experimental.

Su relevancia actual es la de un caso de estudio reproducible: publica el pipeline de datos, los scripts de entrenamiento y las decisiones tecnicas (clipping de x0, dropout de caption para classifier-free guidance, EMA) que marcan la diferencia entre un diffusion pequeno funcional y uno que produce ruido. La propia model card advierte de que es "malo a proposito" en el sentido de que 16M de parametros no dan para mas, no porque se haya saboteado el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet (TinyUNet), no transformer a pesar del nombre; base_ch=64, multiplicadores (1,1,2,4), 2 bloques residuales por etapa, una capa de self-attention en 16x16 |
| Parametros totales | 16,10 M en el modelo de imagen, mas un codificador de texto CLIP ViT-B/32 congelado (numero de parametros del codificador no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen; el condicionamiento es un unico embedding agrupado de CLIP) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica checkpoints PyTorch en precision de entrenamiento; no hay variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt): checkpoint con `ema_state_dict` (usado por defecto) y `model_state_dict`; el estado del optimizador fue eliminado |
| Resolucion de salida | 128x128, espacio de pixeles (sin VAE, sin latentes) |
| Condicionamiento de texto | Embedding agrupado de CLIP ViT-B/32 congelado, inyectado mediante FiLM en cada bloque residual |
| Proceso de difusion | DDPM con betas lineales, 1000 pasos, prediccion de epsilon, muestreo ancestral con clipping de x0 |
| Guidance | Classifier-free con 10% de dropout de caption durante el entrenamiento; escala por defecto 3,0 |
| Tamano del repositorio | 0,1 GB |
| Libreria y pipeline | PyTorch, `text-to-image` |

## Arquitectura y entrenamiento

La arquitectura es una UNet convolucional con `base_ch=64` y multiplicadores de canales (1,1,2,4), dos bloques residuales por etapa y una sola capa de self-attention situada en la resolucion 16x16. El condicionamiento textual no entra por cross-attention, sino mediante FiLM en cada bloque residual, a partir del embedding agrupado (pooled) de un CLIP ViT-B/32 congelado. El proceso generativo es un DDPM estandar con betas lineales, 1000 pasos y prediccion de epsilon; el muestreo es ancestral y aplica clipping a la x0 predicha en cada paso. El autor documenta que sin ese clipping los errores se acumulan y producen imagenes uniformemente anaranjadas.

El entrenamiento uso COCO Captions (113.287 imagenes, 566.747 captions) durante 3 epocas, 53.130 pasos, batch de 32, optimizador AdamW con learning rate 2e-4, precision bf16 y EMA con decaimiento 0,9995. La perdida final fue 0,0209. El autor aplica un 10% de dropout de caption para habilitar classifier-free guidance y senala que, sin el, los prompts apenas orientan la generacion. No se menciona RLHF ni DPO: es un entrenamiento puramente de difusion supervisada. Entre las lecciones documentadas destaca que entrenar con alt-text extraido de la web (CC3M) introducia marcas de agua de Alamy y Shutterstock en aproximadamente 1 de cada 10 imagenes a 64x64, motivo por el que se cambio a COCO.

## Capacidades

- Generacion texto-a-imagen a 128x128 en espacio de pixeles, con guiado por escala de classifier-free guidance configurable (1 = desactivado, ~3 = recomendado, 6 = saturado).
- Produccion de imagenes reconocibles de vehiculos, calles y autobuses (categoria mejor valorada por el autor, calificada como A-).
- Generacion aceptable de pizza y platos de comida (calificada como B).
- Representacion aproximada de motocicletas, con ruedas y manillares en posiciones mas o menos correctas (C+).
- Muestreo de multiples variaciones por prompt (`--num_images`) y reescalado opcional de la salida (`--upscale`).
- Reanudacion del entrenamiento desde checkpoints guardados cada 2000 pasos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo entiende prompts en ingles.
- No dispone de modo de razonamiento (thinking), entrada de imagen, audio ni salida de video.

## Casos de uso

- Docencia de modelos de difusion: permite mostrar de principio a fin como funciona un DDPM (betas lineales, prediccion de epsilon, muestreo ancestral) con un coste computacional de minutos en una GPU de gama media.
- Reproduccion de experimentos academicos en hardware de consumo: 7,5 horas en una RTX 4060 Ti hacen viable que un estudiante entrene el modelo completo y compare variantes (con y sin clipping de x0, con y sin caption dropout).
- Generacion de maquetas y placeholders en diseno de interfaces: las imagenes de 128x128 sirven como relleno rapido en prototipos donde no se necesita calidad fotorrealista.
- Estudio de sesgos de dataset: al estar entrenado solo con COCO, permite analizar como un corpus de fotografias de Flickr de la decada de 2010 determina que categorias se aprenden y cuales no.
- Pruebas de integracion de pipelines de inferencia: el script `sample.py` es un punto de partida minimo para validar carga de checkpoints, gestion de EMA y parametros de guidance antes de escalar a modelos mayores.
- Benchmark de estrategias de muestreo: el modelo es lo bastante pequeno para barrer escalas de guidance, pasos y clipping en pocas horas y medir el efecto sobre la calidad percibida.
- Generacion de assets de baja resolucion para videojuegos experimentales o prototipos que luego se reescalan 2x con `--upscale`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, Inception Score, MMLU, HumanEval ni similares) en la informacion disponible. La unica evaluacion aportada es cualitativa y la realiza el propio autor en la model card:

| Categoria de prompt | Resultado descrito por el autor | Calificacion del autor |
|---|---|---|
| Autobuses, calles, vehiculos | Reconocibles: ventanas, ruedas, frontal rojo | A- |
| Pizza, platos de comida | Queso fundido, toppings rojos, borde | B |
| Motocicletas | Ruedas y manillares en posiciones aproximadas | C+ |
| Perros, gatos, personas | Manchas carnosas sobre muebles | F |
| Pajaros | Follaje perfecto, ningun pajaro | F |
| Categorias fuera de COCO (dragones, castillos, anime) | Expresionismo abstracto | N/A |

Datos de rendimiento medidos por el autor: perdida final de entrenamiento 0,0209 y aproximadamente 13 segundos por imagen de 128x128 en una RTX 4060 Ti.

## Requisitos de hardware

- Entrenamiento: verificado en 1 GPU RTX 4060 Ti de 8 GB, 7,5 horas para 3 epocas, consumo aproximado de 117 W.
- Inferencia: la misma RTX 4060 Ti genera una imagen de 128x128 en unos 13 segundos; la VRAM necesaria no se especifica, pero el modelo de 16,10 M de parametros mas el CLIP ViT-B/32 congelado deberia caber holgadamente en cualquier GPU con 8 GB o mas.
- Cabe en GPU de consumo: si, el autor lo entreno y lo ejecuto en una RTX 4060 Ti; por tamano deberia funcionar tambien en tarjetas con menos VRAM, aunque no hay datos publicados de pruebas en gamas inferiores.
- GPU profesionales: no se reportan pruebas en A100, H100 ni similares; no son necesarias para este tamano.
- Opciones de despliegue: scripts PyTorch propios (`prepare_data.py`, `sample.py`, `run_training.sh`) con `requirements.txt`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, que ademas no aplican a este tipo de modelo.
- Throughput y latencia: aproximadamente 13 s por imagen de 128x128 en RTX 4060 Ti a la escala de guidance por defecto; no se publican cifras de imagenes por segundo ni de latencia en otras GPU.

## Comparativa con modelos similares

No se proporciona en la informacion disponible una comparativa oficial con otros modelos. La siguiente tabla incluye alternativas conocidas de la misma categoria (difusion texto-a-imagen) con datos de documentacion publica general, que deben verificarse antes de usarse:

| Modelo | Parametros | Resolucion | Espacio | Licencia | Notas |
|---|---|---|---|---|---|
| T.I.T.S. (MiniAI-terrible-imagegen-transformer) | 16,10 M + CLIP ViT-B/32 congelado | 128x128 | Pixeles | MIT | Entrenado desde cero en 7,5 h con una RTX 4060 Ti; sin benchmark publicado |
| Stable Diffusion 1.5 | UNet de aproximadamente 860 M, mas VAE y text encoder (datos publicos generales, no incluidos en la informacion proporcionada) | 512x512 | Latente | CreativeML Open RAIL-M | Modelo de referencia de la generacion texto-a-imagen open source |
| Alternativas de difusion en espacio de pixeles de escala reducida | No disponible | No disponible | Pixeles | No disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- No apto para produccion: el propio autor lo declara como modelo de entretenimiento, educacion y experimentacion.
- Incapacidad demostrada para generar animales y personas: perros, gatos y figuras humanas se representan como manchas informes; los pajaros practicamente no aparecen.
- Rendimiento nulo fuera de la distribucion de COCO: dragones, castillos o estilos anime producen resultados abstractos.
- Sesgos heredados de COCO: es un modelo de fotografias de Flickr de la decada de 2010 y no conoce practicamente nada posterior; reproduce los sesgos de composicion y contenido de ese corpus.
- Riesgo de alucinacion estructural: al operar con solo 16,10 M de parametros, la coherencia global de la escena es baja y aparece fragmentacion de objetos, especialmente con escalas de guidance altas.
- Solo ingles: los prompts deben formularse en ingles; no hay soporte multilingue.
- Sin soporte de imagen de entrada, inpainting, control de pose ni edicion: es exclusivamente texto-a-imagen en espacio de pixeles.
- Resolucion muy limitada (128x128); el parametro `--upscale` reescala la salida, pero no anade detalle real.
- El checkpoint publicado esta pensado solo para inferencia: el estado del optimizador fue eliminado, por lo que no se puede reanudar el entrenamiento desde el sin partir de los scripts.
- La licencia MIT permite uso comercial, pero la limitacion practica es la calidad, no la licencia.
- Si se reentrena con datos extraidos de la web, el autor advierte del riesgo de aprender marcas de agua superpuestas.
- No se han publicado evaluaciones cuantitativas independientes ni auditorias de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/M1n1A1/MiniAI-terrible-imagegen-transformer
- Dataset de entrenamiento (COCO Captions, jxie): https://huggingface.co/datasets/jxie/coco_captions
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
- Resultados de busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces recuperados no guardan relacion con el modelo ni con IA open source y se omiten.
