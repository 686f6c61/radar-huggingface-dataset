# Angais/MOSS-Image-PixelArt-16x16

## Resumen

MOSS-Image PixelArt 16x16 es un adaptador LoRA de rango 32 desarrollado por el usuario independiente Angais sobre el modelo base OpenMOSS-Team/MOSS-Image-Base, un transformer de difusion de flujo (flow matching) para generacion text-to-image. El adaptador esta especializado en un unico dominio muy acotado: generar iconos de videojuego en pixel art de 16x16 pixeles, con un objeto por imagen, contorno oscuro, sombreado plano y fondo magenta plano (#FF00FF) que se elimina con un simple color key. Es relevante porque automatiza la produccion de sprites para prototipado de juegos con una tasa de exito medible y un coste de entrenamiento muy bajo.

El modelo resuelve un problema concreto de los pipelines de arte de videojuegos: la generacion de assets pequenos y consistentes en estilo pixel art, donde los modelos generalistas suelen producir ruido, multiples objetos o fondos no separables. La LoRA se entrena sobre solo 550 iconos sinteticos de 16x16, pero los resultados reportados por el autor muestran que generaliza a objetos no vistos (muneco de nieve, ancla, caballo de ajedrez, sushi, helado, casco espacial, tetera).

La ficha se centra en el adaptador, no en el modelo base, ya que la informacion disponible describe exclusivamente el entrenamiento, el uso y las metricas de la LoRA. Cualquier dato sobre MOSS-Image-Base que no aparezca en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 32) sobre transformer de difusion con flow matching (MOSS-Image-Base) |
| Parametros totales | no disponible (la LoRA se aplica sobre 252 proyecciones del transformer base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no de lenguaje) |
| Tipos de cuantizacion | no disponible (la model card indica bfloat16 para el transformer base; no menciona GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (moss-image-pixelart-16x16.safetensors) |
| Tamano del repo | 0.1 GB |
| Resolucion de entrenamiento | 512x512 (salida final 16x16 tras conversion) |
| Steps de inferencia | 50 con guidance 3 |
| Trigger prompt | "pixel art 16x16 game icon" |
| Dataset de entrenamiento | Angais/krea-2-pixelart-16x16-synthetic (550 iconos sinteticos 16x16, CC0) |
| Descargas | 1063 |
| Likes | 26 |

## Arquitectura y entrenamiento

La LoRA se entrena sobre MOSS-Image-Base, un transformer de difusion con objetivo de flow matching. El adaptador de rango 32 (alpha 32) se inserta en las proyecciones q, k, v, o y en las capas lineales del feed-forward de los 42 bloques del transformer, lo que suma 252 proyecciones entrenables. El text encoder permanece congelado durante el entrenamiento. La configuracion es bf16, resolucion 512x512, batch 2, optimizador AdamW con learning rate 1e-4, 100 pasos de warm-up y decaimiento lineal, 5% de caption dropout y 1.500 pasos totales, lo que equivale a unos 15 minutos en una A100.

El dataset de entrenamiento consta de 550 iconos sinteticos de 16x16 (licencia CC0), cada uno escalado x32 sobre fondo magenta plano y etiquetado con el prompt que lo genero. El pipeline de inferencia carga el transformer base en bf16, fusiona la LoRA en las 252 proyecciones y muestrea a 512x512 con 50 pasos y guidance 3; despues reduce la imagen a 16x16 y aplica color key sobre el magenta para obtener transparencia, incluyendo los huecos internos de asas, anillos y bucles. El runner oficial (generate.py) es necesario porque el pipeline de Diffusers de OpenMOSS usa nombres de proyeccion personalizados que el snippet generico del Hub no contempla.

## Capacidades

- Generacion text-to-image de iconos pixel art de 16x16, un unico objeto centrado por imagen.
- Estilo consistente: contorno oscuro, sombreado plano y fondo magenta plano (#FF00FF) eliminable por color key.
- Separacion limpia del fondo, incluidos huecos internos de asas, anillos y bucles (12 de 80 renders con huecos vistos a traves).
- Generalizacion a objetos no presentes en el entrenamiento (muneco de nieve, ancla, caballo de ajedrez, sushi, helado, casco espacial, tetera).
- Control por prompt en ingles mediante descripcion del objeto; el script anade automaticamente el trigger y el prompt de fondo magenta.
- Salida reproducible mediante semilla (parametro --seed).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es exclusivamente un modelo de generacion de imagenes.

## Casos de uso

- Prototipado rapido de inventarios en videojuegos: generar decenas de iconos de items (llaves, pociones, armas, comida) a partir de descripciones textuales para maquetas y vertical slices, gracias a la salida 16x16 con transparencia lista para importar.
- Creacion de assets para game jams: con 9,1 s por imagen en una A100 y 1.500 pasos de entrenamiento, el flujo permite iterar estilos y objetos en minutos y cubrir un set completo de sprites en una sesion.
- Generacion de iconos de interfaz (HUD, menus, tiendas): el fondo magenta plano y la alta pureza de rejilla (mediana 0,988 por bloque de 32x32) facilitan el recorte y la integracion en atlas de texturas.
- Aumento de datasets de pixel art: usar el modelo para producir variantes de iconos que luego se curan manualmente y se incorporan a un dataset mayor, partiendo de la base sintetica CC0 ya publicada.
- Pruebas de concepto de pipelines de arte generativo: el runner y los requisitos son reproducibles (PyTorch CUDA, huggingface_hub, Diffusers con revision fijada), lo que sirve para evaluar la integracion de LoRA sobre MOSS-Image-Base en un flujo de produccion.
- Exploracion de estilos alternativos: el autor publica una version equivalente entrenada sobre Krea 2 con los mismos datos, util para comparar la calidad de sprites entre modelos base sin cambiar el dataset.
- Docencia y experimentacion con LoRA: el coste de entrenamiento (15 minutos en A100, 550 imagenes) lo convierte en un caso practico asequible para explicar fine-tuning de difusion con flow matching.

## Benchmarks y rendimiento

Metricas reportadas por el autor sobre 80 renders no curados (64 prompts variados y 16 objetos de test, 7 de ellos ausentes del entrenamiento):

| Metrica | Resultado |
|---|---|
| Fondos eliminados limpiamente por color key | 79 / 80 |
| Distancia mediana del color de fondo a #FF00FF | 11 / 255 |
| Renders con huecos transparentes (asas, anillos) | 12 / 80 |
| Pureza de rejilla (proporcion de cada bloque 32x32 de un solo color), mediana | 0,988 |
| Tiempo por imagen a 512x512 en una A100 | 9,1 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de generacion de imagenes y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB de VRAM disponible para el ejemplo de generacion con el transformer base en bf16.
- GPU recomendadas: A100 (referencia de las mediciones, 9,1 s por imagen), GPU con soporte de bfloat16 y suficiente memoria; H100 valida por capacidad pero sin cifras publicadas.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; los 30 GB de VRAM del ejemplo superan la memoria de las RTX 4090 (24 GB) y RTX 3090 (24 GB) en la configuracion descrita.
- Almacenamiento: la primera ejecucion descarga aproximadamente 27 GB de pesos base en la cache de Hugging Face; el repo de la LoRA ocupa 0,1 GB.
- Opciones de despliegue: runner propio generate.py con Diffusers (pipeline personalizado de OpenMOSS en una revision fijada), PyTorch con build CUDA (ejemplo con CUDA 12.8, torch 2.11.0 y torchvision 0.26.0) y huggingface_hub >=1,<2. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 9,1 s por imagen a 512x512 y 50 pasos en una A100; el autor senala que es lento en comparacion con modelos destilados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Angais/MOSS-Image-PixelArt-16x16 | LoRA sobre MOSS-Image-Base | no disponible (LoRA rank 32) | no aplica | 79/80 fondos limpios; 9,1 s/imagen en A100 | Apache 2.0 | Hugging Face, 1063 descargas |
| Angais/Krea-2-PixelArt-16x16 | LoRA sobre Krea 2, mismos datos | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| OpenMOSS-Team/MOSS-Image-Base | Modelo base text-to-image | no disponible | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Modelos generalistas text-to-image | Difusion / flow matching | no disponible | no aplica | no disponible | variable | Hugging Face |

La comparativa se limita a los modelos mencionados en la informacion disponible; no se han publicado datos de benchmarks cruzados con alternativas de pixel art ni con modelos generalistas, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Solo genera iconos de 16x16: un objeto centrado por imagen, sin escenas ni personajes en poses.
- Es lento frente a modelos destilados: requiere 50 pasos con guidance 3.
- Evitar pedir objetos de color magenta puro, ya que el magenta esta reservado para el fondo y el color key los eliminaria.
- Aparecen formas extranas ocasionales; el autor cita como ejemplo un "black pirate hat" que puede generar correas debajo.
- La salida es en ingles: el prompt y el trigger estan en ese idioma y no se documenta soporte multilingue.
- Las salidas son generadas por IA; donde la ley o la politica de la plataforma lo exija, debe divulgarse al publicarlas.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial; el autor no esta afiliado ni respaldado por el OpenMOSS Team.
- Riesgo de alucinacion en el sentido de objetos mal formados o detalles incoherentes, mitigado parcialmente por la pureza de rejilla reportada (0,988) pero no eliminado.
- No se documentan sesgos especificos del adaptador; los sesgos del modelo base no estan disponibles en la informacion proporcionada.
- El uso requiere el runner propio por los nombres de proyeccion personalizados; el snippet generico de Diffusers del Hub no es suficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Angais/MOSS-Image-PixelArt-16x16
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/krea-2-pixelart-16x16-synthetic
- Version sobre Krea 2: https://huggingface.co/Angais/Krea-2-PixelArt-16x16
- Runner de generacion: generate.py (incluido en el repo del modelo)
- Requisitos: requirements.txt (incluido en el repo del modelo)
- Licencia: LICENSE (incluido en el repo del modelo)
- Aviso de atribucion: NOTICE (incluido en el repo del modelo)
