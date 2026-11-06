# Pygon/PygonGirl1024

## Resumen

PygonGirl1024 es una coleccion de LoRA de personaje entrenada sobre MOSS-Image, el modelo base de generacion de imagenes de MOSS. La publica el usuario Pygon en Hugging Face y su proposito es fijar la identidad facial de una persona concreta (la actriz Tang Yan) para que el modelo base la reproduzca de forma consistente en distintas escenas, poses y vestuarios. No es un modelo fundacional, sino un adaptador de bajo rango: el repositorio pesa 0,3 GB y el peso principal (v4) ocupa 141,8 MiB en formato safetensors.

La relevancia tecnica de la ficha esta menos en el resultado que en la documentacion del proceso: el autor publica la receta completa (rank 32, alpha 32, learning rate 1,5e-4 con scheduler cosine, 2000 pasos, batch size 1, bucketing a 512/768/1024, ai-toolkit v0.13.40, RTX 4060 Ti 16 GB y unas 3 horas de entrenamiento) y el criterio de curaduria del dataset (120-200 imagenes, 194 en v4, con umbral duro de lado corto >= 1024 px y deduplicacion por dHash con distancia de Hamming <= 6). Es, por tanto, un caso practico util para quien quiera replicar un entrenamiento de LoRA de identidad.

El modelo esta etiquetado solo para chino (`zh`), usa el pipeline text-to-image y se distribuye bajo licencia "other" con restricciones explicitas: prohibido el uso comercial, prohibida la redistribucion y borrado del modelo en 24 horas tras la descarga, segun declara el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image Base; rank 32 / alpha 32 |
| Parametros totales | no disponible (adaptador de 141,8 MiB en v4; no se declara el numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (`zh`); los ejemplos de prompt mezclan chino e ingles |
| Licencia | other (uso solo para aprendizaje tecnico e investigacion personal; prohibido uso comercial y redistribucion) |
| Formato de pesos | safetensors (`moss_tangyan_v4.safetensors`, `moss_tangyan_v3.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre MOSS-Image en su variante Base (no la SFT). El entrenamiento se hizo con ai-toolkit v0.13.40, learning rate 1,5e-4 con scheduler cosine, 2000 pasos, batch size 1 y resoluciones en bucket de 512, 768 y 1024. El coste declarado es de aproximadamente 3 horas en una RTX 4060 Ti de 16 GB, lo que situa el entrenamiento al alcance de hardware de consumo.

La parte metodologicamente interesante es el etiquetado. El autor usa la convencion de trigger `<nombre chino>, <pinyin>, woman` y aplica una regla estricta: el caption no describe nunca rasgos faciales, color de pelo, peinado, forma de la cara, tono de piel, maquillaje, edad, genero ni complexion. Solo se anotan elementos variables (ropa y accesorios, pose y accion, emocion, escena y fondo, iluminacion, composicion y angulo de camara). El razonamiento que da es correcto en la teoria del entrenamiento de LoRA: el adaptador aprende aquello que es constante en las imagenes y no aparece descrito en el texto, de modo que describir la cara en el caption ensena al modelo a ignorarla. Como consecuencia deliberada, el peinado no queda fijado y varia segun el prompt. El etiquetado se genero con Qwen3-VL-4B desplegado en local, a unos 39 segundos por imagen.

El dataset v4 consta de 194 imagenes con lado corto >= 1024 px como umbral duro, criterios de seleccion (una sola persona, rasgos nitidos, sin oclusiones, sin fotos de grupo, sin retoque excesivo), equilibrio aproximado entre plano detalle, busto, medio cuerpo y cuerpo entero, y deduplicacion mediante hash perceptual dHash con distancia de Hamming <= 6. La v3, primera version utilizable, se entreno con 124 imagenes.

## Capacidades

- Generacion text-to-image de retratos y figuras de una identidad concreta sobre el modelo base MOSS-Image.
- Fijacion de identidad facial mediante trigger words (`唐嫣, tangyan, woman`), con control de la escena, el vestuario, la pose, la iluminacion y el encuadre a traves del prompt.
- Variacion controlada del peinado: al no estar descrito en el caption, responde al prompt positivo.
- Encaje en flujos de trabajo de ComfyUI mediante el nodo LoRA Loader, con intensidad recomendada de 1,0 a 1,2.
- Parametros de inferencia recomendados por el autor: 20-30 pasos de muestreo, CFG 4-5 y resolucion desde 1024 x 1024.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un adaptador de difusion para imagen.

## Casos de uso

- Replicacion de estudios de identidad en LoRA: usar la receta publicada (rank, alpha, learning rate, pasos, bucketing y criterio de caption) para entrenar adaptadores de otras personas y comparar resultados con la misma configuracion.
- Generacion de storyboards y fichas de personaje: mantener una identidad coherente a lo largo de varias imagenes cambiando solo vestuario, pose y localizacion en el prompt.
- Pruebas de vestuario y direccion de arte: generar la misma figura con distintas prendas y accesorios para evaluar combinaciones antes de un rodaje o una sesion fotografica.
- Investigacion sobre sesgos de captioning: comparar el efecto de describir o no los rasgos faciales en el caption sobre la fidelidad de la identidad generada.
- Docencia en tecnicas de difusion: el repositorio incluye `tangyan_v4_config.yaml` con la configuracion completa, lo que permite reproducir el entrenamiento paso a paso en un equipo de 16 GB de VRAM.
- Evaluacion de la calidad de un modelo base: usar el adaptador como sonda para medir cuanto detalle facial y cuanta coherencia de encuadre conserva MOSS-Image Base frente a su version SFT.
- Prototipado de retratos en 1024 x 1024 para maquetas y demos internas, siempre dentro del marco de investigacion personal que fija la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de fidelidad de identidad (por ejemplo FID, CLIP-I o similitud facial) ni comparaciones numericas entre v3 y v4.

## Requisitos de hardware

- El adaptador pesa 141,8 MiB (v4) y el repositorio completo 0,3 GB, por lo que el cuello de botella es el modelo base MOSS-Image, no el LoRA.
- Entrenamiento reproducido por el autor: RTX 4060 Ti de 16 GB, aproximadamente 3 horas para 2000 pasos con batch size 1.
- VRAM de inferencia: no disponible en la informacion proporcionada; depende de la precision y del modo de carga de MOSS-Image, no del adaptador.
- GPU recomendadas: no disponibles de forma especifica; el entrenamiento documentado cabe en una GPU de consumo de 16 GB.
- Despliegue: ComfyUI con el nodo LoRA Loader y el checkpoint de MOSS-Image en `models/loras/moss_tangyan_v4.safetensors`. No se documentan otras rutas (vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PygonGirl1024 | LoRA de personaje (rank 32) | MOSS-Image Base | no disponible (141,8 MiB) | no aplica | other, solo investigacion, sin uso comercial | Hugging Face y Space de demo |
| Adaptadores LoRA de identidad genericos | LoRA de personaje | SDXL, Flux u otros | variable | no aplica | variable segun autor | no disponible |
| MOSS-Image Base | Modelo text-to-image completo | no aplica | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos publicos de rendimiento de este adaptador ni de alternativas equivalentes sobre MOSS-Image, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Generacion de cuerpo entero debil: en v4 el plano de cuerpo entero representa solo alrededor del 3 % del dataset, y la estabilidad del encuadre completo es inferior a la de busto y primer plano.
- Escenas con varias personas: el dataset es mayoritariamente de una sola figura, y en interacciones multitudinarias el modelo tiende a mezclar rostros.
- Edad y complexion no controlables: el caption excluye deliberadamente esos atributos, de modo que el prompt no los fija de forma fiable.
- Peinado no fijado por diseno: si se necesita un peinado concreto hay que describirlo en el prompt positivo.
- Licencia restrictiva: prohibido el uso comercial, prohibida la redistribucion y obligacion de borrar el modelo en 24 horas tras la descarga, segun los terminos del autor; ademas, la licencia figura como "other" sin texto legal adjunto, lo que anade incertidumbre juridica.
- Riesgo de derechos de imagen: el adaptador reproduce la identidad de una persona real, lo que puede vulnerar derechos de imagen o de publicidad en funcion de la jurisdiccion y del uso.
- Idioma: el modelo esta etiquetado solo para chino; los prompts en castellano no estan documentados ni validados.
- Sin datos de evaluacion: no hay benchmarks publicados de fidelidad ni de calidad, por lo que la valoracion depende de inspeccion visual.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar rasgos, manos o proporciones incorrectas, especialmente en encuadres completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pygon/PygonGirl1024
- Space de demostracion: https://huggingface.co/spaces/Pygon/PygonGirl1024
- Modelo base MOSS-Image: no disponible en la informacion proporcionada
- Paper o blog de MOSS-Image: no disponible en la informacion proporcionada
- Repositorio de ai-toolkit (entrenador utilizado): no disponible en la informacion proporcionada
