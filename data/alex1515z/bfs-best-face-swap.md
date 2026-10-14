# Alex1515Z/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una colección de adaptadores LoRA para sustitución de cara, cabeza y cuerpo en imágenes y vídeo. Lo publica el usuario Alex1515Z en Hugging Face bajo licencia MIT, con un repositorio de 13,0 GB que agrupa decenas de pesos para distintas familias de modelos base. No es un modelo completo: es un conjunto de adaptadores que se cargan sobre modelos de difusión de imagen ya existentes.

El proyecto cubre varias familias: Qwen-Image 2.1 (cabeza y cuerpo), Qwen-Image Edit 2509 y 2511 (cara y cabeza, en cinco versiones sucesivas), FLUX.2 Klein en 4B y 9B, Krea 2 y un conjunto experimental de pesos para LTX-2 orientado a vídeo. Cada release tiene su propio contrato de uso: orden de entrada de las imágenes, prompt asociado y flujo de trabajo en ComfyUI. El autor insiste en que se use cada LoRA con su modelo base correspondiente y en respetar el orden de entrada, ya que algunas versiones esperan primero la imagen del cuerpo y después la cara de referencia.

Su relevancia práctica está en que ofrece una alternativa abierta y con licencia permisiva para una tarea que suele resolverse con herramientas cerradas o con licencias restrictivas, y en que incluye los flujos de ComfyUI junto a los pesos. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 «me gusta», y no se han publicado resultados de benchmarks ni métricas objetivas de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (bajo rango) sobre modelos de difusión de imagen; arquitectura interna de cada modelo base no disponible |
| Parámetros totales | No disponible (depende del modelo base; el repositorio completo ocupa 13,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica a adaptadores de imagen) |
| Tipos de cuantización | fp16 y fp32 en versiones fusionadas (rank 16 fp16 y rank 32 fp32 para Qwen Image Edit 2511); fp8 disponible en varios modelos base de FLUX.2 Klein, no en los LoRA |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BFS no define una arquitectura propia. Se trata de adaptadores LoRA (descomposición de bajo rango) que se inyectan en las capas de atención de modelos de difusión de imagen. La información publicada indica distintos rangos según la variante: rank 16 en fp16 y rank 32 en fp32 para las versiones fusionadas de Qwen Image Edit 2511, rank 64 y rank 128 en dos de los checkpoints para FLUX.2 Klein 9B (etiquetados como step3500 y step3750). El resto de los archivos no especifica rango ni paso de entrenamiento.

No se han publicado datos sobre el conjunto de entrenamiento: ni volumen de pares imagen-referencia, ni composición del dataset, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO). Tampoco se documenta el procedimiento de entrenamiento, la resolución de entrenamiento ni la estrategia de regularización. Lo único que el autor detalla es el contrato de inferencia de cada versión: fuerza de LoRA recomendada de partida en 1.0, orden de entrada de las imágenes y correspondencia estricta entre LoRA, modelo base, text encoder, VAE y flujo de trabajo.

## Capacidades

- Sustitución de cara (face swap) sobre una imagen de destino, usando una cara de referencia.
- Sustitución de cabeza completa (head swap), que reemplaza cara, pelo y proporciones craneales.
- Sustitución de cuerpo completo (body swap), documentada como versión v1.0 para Qwen Image 2.1 y Krea 2.
- Edición de imagen guiada por prompt, al apoyarse en modelos de edición como Qwen Image Edit 2509 y 2511.
- Integración con flujos de ComfyUI: el repositorio incluye al menos un flujo en JSON (`Head Swap V1 Qwen 2.1 Workflow.json`).
- Compatibilidad con pipeline `image-to-image` de la librería `diffusers`.
- Pesos experimentales para LTX-2, orientados a generación y edición de vídeo.
- Cobertura multilingüe: no disponible; la model card solo declara inglés.
- Tool calling, razonamiento multi-paso, matemáticas, código y visión: no aplica, es un modelo de edición de imagen.

## Casos de uso

- Producción audiovisual y previsualización de reparto: sustituir la cara de un actor por la de un doble en fotogramas o planos concretos antes de rodar, usando los pesos de Qwen Image Edit o los experimentales de LTX-2 para secuencias de vídeo.
- Pruebas de vestuario y caracterización: aplicar una cabeza o un cuerpo de referencia sobre una base para validar estilismo sin sesiones de maquillaje completas.
- Restauración y reconstrucción de retratos dañados: combinar la capacidad de edición de Qwen Image Edit con un LoRA de cabeza para recuperar rasgos faciales en fotografías antiguas.
- Creación de avatares consistentes para entornos virtuales: generar variantes de un mismo personaje manteniendo la identidad facial entre imágenes mediante el LoRA de cabeza y una referencia fija.
- Prototipado de personajes en desarrollo de videojuegos: iterar sobre conceptos de personaje aplicando distintas caras de referencia al mismo cuerpo y vestuario.
- Sustitución de cuerpo en catálogo de moda: reemplazar la figura del modelo conservando la prenda, con el LoRA específico de body swap para Qwen Image 2.1 o Krea 2.
- Investigación en privacidad y detección de deepfakes: usar los pesos como generador controlado para construir conjuntos de datos sintéticos con los que entrenar o evaluar detectores.
- Integración en herramientas internas de estudio: al ser un LoRA sobre `diffusers`, se puede invocar por API dentro de un pipeline propio, sin depender de una interfaz gráfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de similitud de identidad (por ejemplo, cosine similarity con ArcFace), FID, ni comparaciones cuantitativas con otras soluciones de face swap. Tampoco se documentan tiempos de inferencia ni velocidad de entrenamiento.

## Requisitos de hardware

- Los adaptadores LoRA son pequeños en comparación con el modelo base; el tamaño de 13,0 GB del repositorio corresponde al conjunto completo de variantes para todas las familias, no a un único archivo cargable.
- La VRAM necesaria la determina el modelo base, no el LoRA. El autor no publica cifras de VRAM, latencia ni throughput.
- Estimación orientativa, no verificada por el autor: los pesos de FLUX.2 Klein 4B en fp8 son los candidatos más razonables para GPU de consumo de gama alta; las variantes de 9B en fp8 quedan por encima; los flujos sobre Qwen-Image 2.1 y Qwen Image Edit apuntan a GPU de 24 GB o más, y en fp16/bf16 probablemente a GPU de centro de datos (A100, H100) o a configuraciones multi-GPU.
- Despliegue: `diffusers` es la librería declarada por el autor; los flujos incluidos están pensados para ComfyUI. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que además no aplican a este tipo de modelo.
- El autor recomienda que, ante problemas de flujo de trabajo, se actualice ComfyUI y se verifique que el modelo base, el text encoder, el VAE, el flujo y el LoRA pertenezcan a la misma familia.

## Comparativa con modelos similares

El autor no publica comparativas ni métricas frente a otras soluciones de sustitución facial. La comparación siguiente es cualitativa y de categoría; los campos marcados como no disponibles no se han podido verificar en la información proporcionada.

| Solución | Categoría | Modelos base soportados | Licencia | Métricas |
|---|---|---|---|---|
| BFS (este repositorio) | LoRA de edición facial, craneal y corporal | Qwen-Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B/9B, Krea 2, LTX-2 | MIT | No disponible |
| PuLID y variantes para FLUX | Adaptador de preservación de identidad | FLUX.1, SDXL | No verificada en la información disponible | No disponible |
| InstantID | Adaptador de identidad basado en ControlNet | SDXL | No verificada en la información disponible | No disponible |
| IP-Adapter FaceID | Adaptador de imagen de referencia | SD 1.5, SDXL | No verificada en la información disponible | No disponible |
| ReActor | Extensión de sustitución facial por posprocesado | Independiente del generador | No verificada en la información disponible | No disponible |

## Limitaciones y advertencias

- Riesgo de uso indebido y de suplantación de identidad: el propio autor advierte de no usar ni compartir resultados con figuras públicas ni con personas que no hayan dado su consentimiento. Es un caveat crítico en un modelo de esta naturaleza.
- Sesgos: no se documenta ningún análisis de sesgo demográfico. Es previsible un rendimiento desigual según tono de piel, edad, geometría facial o presencia de elementos como gafas, velo o barba, pero no hay datos publicados que lo cuantifiquen.
- Alucinación y artefactos: los resultados dependen del modelo base y de la imagen de referencia; el autor indica explícitamente que los ejemplos del repositorio son demostraciones y no garantizan resultados idénticos en otras imágenes.
- El repositorio no incluye pesos del modelo base, del text encoder ni del VAE. Hay que descargarlos por separado, lo que añade requisitos de almacenamiento y de VRAM muy superiores a los 13,0 GB anunciados.
- Frágil respecto a la configuración: mezclar modelos base de familias distintas, invertir el orden de entrada de las imágenes o usar un flujo de trabajo de otra versión rompe el resultado. Cada release exige su guía correspondiente.
- Idioma: la model card solo declara inglés, lo que afecta a los prompts en los flujos que dependen de texto.
- Licencia MIT: permite uso comercial y modificación, pero la licencia de cada modelo base subyacente es independiente y debe revisarse por separado para cada familia (Qwen, FLUX.2 Klein, Krea 2, LTX-2). Los pesos experimentales de LTX-2 se etiquetan como tales.
- Madurez: 0 descargas y 0 «me gusta» en el momento de la consulta, sin benchmarks ni validación externa publicada. No hay garantía de mantenimiento ni de soporte.
- Algunas variantes se publican con nombres de paso de entrenamiento (`step3500`, `step3750`) y distintos rangos, sin que se documente qué versión es recomendable en cada caso salvo en la familia Qwen Image 2.1, donde se marca `bfs_head_v1.1_qwen_2.1.safetensors` como recomendada.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap
- Guía de BFS Head V1/V1.1 para Qwen Image 2.1: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/docs/qwen-image-2.1.md
- Guía de BFS Body Swap V1.0 para Qwen Image 2.1: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/docs/qwen-image-2.1-body.md
- Guía de Qwen Image Edit 2509/2511: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/docs/qwen-image-edit.md
- Guía de FLUX.2 Klein: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/docs/flux-2-klein.md
- Guía de Krea 2: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/docs/krea-2.md
- Pesos experimentales de LTX-2: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/docs/ltx-2.md
- Flujo de trabajo de ComfyUI para Head Swap V1 Qwen 2.1: https://huggingface.co/Alex1515Z/BFS-Best-Face-Swap/blob/main/workflows/Head%20Swap%20V1%20Qwen%202.1%20Workflow.json
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Qwen-Image Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelos base FLUX.2 Klein: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B y https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Modelo base Krea 2: https://huggingface.co/krea/Krea-2-Raw
- Nota sobre la búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Las coincidencias devueltas corresponden a entidades homónimas sin relación (por ejemplo, la cantante tanzana Nandy).
