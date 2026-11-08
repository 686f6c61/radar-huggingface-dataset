# Rishitha05479/data266-lab2-sd15-lora-run1

## Resumen

`data266-lab2-sd15-lora-run1` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para generar imagenes con estetica del universo Naruto. Lo publica el usuario Rishitha05479 como parte del Laboratorio 2 de la asignatura DATA 266 (San Jose State University), y se apoya en el dataset `lambdalabs/naruto-blip-captions`, que empareja imagenes del anime con descripciones generadas por BLIP. No es un modelo de lenguaje: es un ajuste fino de un modelo de difusion texto-a-imagen, por lo que su ambito de aplicacion es la sintesis de imagenes y no la generacion de texto ni el razonamiento.

El adaptador anade solo 797.184 parametros entrenables sobre los pesos congelados de SD 1.5, con un entrenamiento de 4.000 pasos a resolucion 512x512 que consumio 2,369 horas de GPU y un pico de 4,38 GB de memoria. La model card lo marca explicitamente como un experimento no seleccionado como modelo final del laboratorio ("Selected final model: No"), lo que sitúa su interes en el terreno docente y de reproducibilidad de experimentos, no en el de un artefacto listo para produccion.

Su relevancia actual es limitada fuera del contexto academico: sirve como referencia de como un LoRA de rango muy bajo afecta a la fidelidad de dominio y a la adherencia al prompt en SD 1.5, y aporta metricas de evaluacion (KID, CLIP score, LPIPS) que permiten comparar variantes de un mismo ejercicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP) |
| Parametros totales | no disponible (el adaptador contiene 797.184 parametros entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se inyecta en la UNet de Stable Diffusion 1.5 mediante descomposicion de bajo rango con rango 4 y alpha 4, lo que da 797.184 parametros entrenables frente a los aproximadamente 860 millones de la UNet original. El entrenamiento se realizo sobre el dataset `lambdalabs/naruto-blip-captions` a 512x512, con learning rate 1e-4, 4.000 pasos, batch size 1 y batch efectivo 4, semilla 266, durante 2,369 horas de GPU con un pico de 4,38 GB de memoria. La model card no detalla la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos o regularizacion adicionales.

No se documenta el uso de RLHF, DPO ni preferencias humanas, algo esperable en un ajuste de difusion de estas caracteristicas. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal; el interes tecnico esta en el efecto de un rango tan bajo (4) sobre la capacidad de capturar un estilo concreto y en el protocolo de evaluacion con prompts y semillas emparejados entre modelos.

## Capacidades

- Generacion de imagenes texto-a-imagen en el dominio de Naruto y personajes de estilo anime, a partir de prompts descriptivos.
- Especializacion estilistica: reproduce la apariencia visual del dataset de entrenamiento con mayor fidelidad que el SD 1.5 base, segun la model card.
- Compatibilidad con el ecosistema Diffusers y con cualquier pipeline que cargue adaptadores LoRA sobre SD 1.5.
- No soporta tool calling ni function calling: es un modelo de difusion, no un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; la model card no especifica idiomas y las etiquetas de idioma aparecen como no disponibles.
- No dispone de modo "thinking", vision de entrada, audio ni otras modalidades adicionales.

## Casos de uso

- Docencia y reproducibilidad de experimentos: sirve como ejemplo de ajuste LoRA de rango bajo sobre SD 1.5, con hiperparametros y metricas documentados, para que estudiantes comparen variantes de rango y dataset en un mismo protocolo de evaluacion.
- Generacion de arte conceptual de fan art: permite producir ilustraciones de personajes de estilo Naruto para prototipos, maquetas o material creativo interno, siempre respetando los derechos de terceros sobre la franquicia.
- Pruebas de protocolo de evaluacion de modelos generativos: las metricas KID original y KID emparejado con 12 imagenes generadas, CLIP score 0,2999 y LPIPS 0,6941 sirven para validar pipelines de evaluacion con prompts y semillas controlados.
- Investigacion sobre perdida de adherencia al prompt: el propio autor documenta que el ajuste mejora la apariencia de dominio pero puede reducir la fidelidad a prompts fuera de dominio y composicionales, lo que lo convierte en un caso de estudio util para medir ese compromiso.
- Base para experimentos de bajo rango: con solo 797.184 parametros entrenables, es un punto de partida barato (2,369 horas de GPU, 4,38 GB de pico) para estudiar tecnicas de regularizacion o de mezcla de adaptadores.
- Demostraciones educativas de despliegue con Diffusers: se puede cargar en un pipeline local para ilustrar como se aplica un adaptador LoRA sobre un checkpoint base congelado en un entorno de clase.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KID original (menor es mejor) | 0,02722 |
| KID emparejado (12 imagenes generadas) | 0,0267 |
| CLIP score | 0,2999 |
| LPIPS diversidad | 0,6941 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos en tablas tipo MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo de difusion. La model card advierte que el tamano de muestra del KID es pequeno y limita la solidez de las conclusiones estadisticas, y que las imagenes bloqueadas por el safety checker se excluyeron de las metricas de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia, un SD 1.5 con adaptador LoRA de rango 4 se ejecuta tipicamente en GPUs de consumo, pero el dato exacto para este adaptador no esta documentado.
- VRAM de entrenamiento documentada: 4,38 GB de pico, con 2,369 horas de GPU para 4.000 pasos.
- GPU recomendadas: no disponibles en la informacion proporcionada; no se especifica el hardware utilizado en el entrenamiento.
- Cabe en GPU de consumo: no confirmado por la model card, aunque el pico de memoria de entrenamiento (4,38 GB) sugiere que la inferencia es viable en GPUs de gama media; no se enumeran modelos concretos.
- Opciones de despliegue: Diffusers (carga de adaptadores LoRA sobre SD 1.5); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Rango LoRA | Parametros entrenables | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| data266-lab2-sd15-lora-run1 (este) | SD 1.5 | 4 | 797.184 | no aplica | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| data266-lab2-charvee-018370859-lora-r16 | SD 1.5 | 16 | no disponible | no aplica | no disponible | Hugging Face |
| data266-pokemon-sd15-lora-rank16 | SD 1.5 | 16 | no disponible | no aplica | CC BY-NC-SA 4.0 | Hugging Face |

Los tres son adaptadores LoRA de laboratorio sobre SD 1.5, con distinto rango y distinto dataset de dominio (Naruto frente a Pokemon). No hay datos publicados que permitan comparar rendimiento entre ellos de forma directa, y las metricas de este adaptador no son trasladables a los otros sin un protocolo comun de evaluacion.

## Limitaciones y advertencias

- El dataset es pequeno y esta centrado en imagenes de estilo Naruto; el ajuste mejora la apariencia de dominio pero puede reducir la adherencia al prompt, especialmente en prompts fuera de dominio y composicionales.
- La model card indica que algunas imagenes generadas fueron bloqueadas por el safety checker y excluidas de las metricas, lo que puede sesgar la evaluacion de calidad.
- El tamano de muestra del KID es reducido, lo que limita la solidez estadistica de las conclusiones.
- El modelo esta marcado como no seleccionado como modelo final del laboratorio y su uso previsto es investigacion y educacion, no produccion.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso y obliga a respetar derechos de terceros; el contenido de la franquicia Naruto esta sujeto a copyright ajeno al modelo.
- No se documentan sesgos especificos, idiomas soportados ni comportamiento fuera del dominio de entrenamiento.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagenes, puede producir representaciones inexactas o incoherentes, especialmente con prompts composicionales.
- El repositorio tiene 0 descargas y 0 likes, sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rishitha05479/data266-lab2-sd15-lora-run1
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Adaptador comparable (rango 16): https://huggingface.co/Charvee/data266-lab2-charvee-018370859-lora-r16
- Adaptador comparable (Pokemon, rango 16): https://huggingface.co/haritha12345/data266-pokemon-sd15-lora-rank16
- Discusiones del adaptador Pokemon: https://huggingface.co/haritha12345/data266-pokemon-sd15-lora-rank16/discussions
