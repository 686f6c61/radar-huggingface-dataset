# li1272/Qwen-Image-2.1-Turbo-Uncensored-GGUF

## Resumen

Este repositorio contiene una cuantizacion en GGUF del codificador de texto de Qwen-Image 2.1 Turbo: concretamente Qwen3-VL-8B-Instruct con la direccion de rechazo ("refusal direction") proyectada fuera de sus pesos mediante una tecnica de abliteration. No es un modelo de difusion completo ni un modelo de generacion de imagen por si solo, sino la pieza que stable-diffusion.cpp carga con el flag `--llm` junto a los GGUFs del denoiser Turbo. El trabajo original es de AtomicChat (etiqueta `quantized_by: AtomicChat`, `imatrix` y layout por tensor `AD-`); el repositorio bajo el usuario li1272 es una publicacion derivada con 0 descargas y 1 like en el momento de la consulta.

El modelo parte de Qwen3-VL-8B-Instruct, un transformer vision-lenguaje de 8.190.735.360 parametros (8,19 mil millones), y conserva su licencia Apache 2.0. La edicion busca eliminar el comportamiento de rechazo del encoder cuando se usa como modelo conversacional: segun las mediciones del autor, los rechazos caen del 88,9% al 1,2% en ingles y del 38% al 0% en ruso sobre prompts reservados, mientras que MMLU se mantiene en 77,35%. En la generacion de imagenes, el propio autor reconoce que el efecto medible es nulo: ninguno de 45 prompts sensibles cambio de resultado respecto al encoder original.

La relevancia de esta ficha esta, por tanto, en la advertencia: buena parte del ruido mediatico en torno a "Qwen-Image 2.1 sin censura" senala pesos que en realidad son los originales sin modificar, y el pipeline abierto no incorpora safety checker alguno. Este repositorio si modifica pesos, pero solo en el encoder y sin efecto demostrado sobre las imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL-8B-Instruct) usado como codificador de texto de un pipeline de difusion (Qwen-Image 2.1 Turbo) |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en BF16 y Q8_0 confirmados; el repositorio ocupa 54,0 GB, por lo que existe una escalera mas amplia de cuantizaciones no detallada en la informacion disponible |
| Idiomas soportados | no disponible (la model card reporta evaluaciones en ingles y ruso) |
| Licencia | Apache 2.0 (segun metadatos de HuggingFace; existen fuentes que atribuyen licencia no comercial al pipeline Qwen-Image, ver limitaciones) |
| Formato de pesos | GGUF (generados con importance matrix e imatrix, layout por tensor con prefijo `AD-`) |

## Arquitectura y entrenamiento

El componente es Qwen3-VL-8B-Instruct, un transformer denso de 8,19 mil millones de parametros con capacidades de vision y lenguaje. La intervencion aplicada es una abliteration: se identifica la direccion en el espacio de estados ocultos que separa prompts daninos de inofensivos (la model card reporta un AUROC de 1.000 en la ultima capa para esa separacion) y se proyecta fuera de los pesos. No hay reentrenamiento ni fine-tuning adicional documentado; el resto de la distribucion de pesos se conserva.

Las cuantizaciones GGUF se generaron con importance matrix propia y un layout por tensor especifico (`AD-`), lo que produce dos metricas de fidelidad publicadas: KLD media respecto al Qwen3-VL-8B-Instruct original y tasa de coincidencia de top-1. Para BF16, KLD 0,0019 y 98,45% de coincidencia; para Q8_0, KLD 0,0029 y 98,04%. El desplazamiento visual de las imagenes generadas, medido en LPIPS sobre 48 prompts neutros con denoiser BF16 y misma semilla, es 0 en BF16 y 0,031 en Q8_0, frente a 0,499 que produce cambiar de semilla. La cuantizacion del encoder original a Q8_0 desplaza esas mismas imagenes 0,037, de modo que la edicion de abliteration aporta un desplazamiento menor que la propia cuantizacion.

## Capacidades

- Modelo conversacional multimodal (texto e imagen de entrada) heredado de Qwen3-VL-8B-Instruct: generacion de texto, razonamiento, codigo y comprension de imagenes.
- Uso como codificador de texto (`--llm`) dentro de stable-diffusion.cpp, acoplado a los GGUFs del denoiser Qwen-Image 2.1 Turbo.
- Generacion de imagenes sin rechazo a nivel de encoder: el modelo no declina procesar prompts que como chat rechazaria.
- Reduccion del comportamiento de rechazo como chat: de 88,9% a 1,2% en ingles y de 38% a 0% en ruso sobre conjuntos reservados.
- Preservacion de capacidades generales: MMLU sin cambios (77,35% antes y despues).
- Soporte de tool calling y de agentes: no documentado en la informacion disponible para esta edicion concreta; heredable en principio de Qwen3-VL-8B-Instruct, pero sin verificacion publicada.
- Idiomas: sin listado oficial; las unicas lenguas con medicion reportada son ingles y ruso.

## Casos de uso

- Generacion local de imagenes en stable-diffusion.cpp: el GGUF se carga como `--llm` junto al denoiser Turbo, permitiendo un pipeline texto-a-imagen completamente offline en una maquina de escritorio.
- Sustitucion directa del encoder original: al mantener el formato y el layout esperado por stable-diffusion.cpp, sirve como reemplazo sin cambios de configuracion para quien ya tenga montado el flujo de Qwen-Image 2.1 Turbo.
- Asistente conversacional local sin fricciones de rechazo: en despliegues donde el filtrado se gestiona en otra capa, el encoder ofrece respuestas sin declinaciones sobre temas que el modelo original bloqueaba.
- Investigacion sobre abliteration y direcciones de rechazo: el par de modelos (original y editado) con KLD y tasa de top-1 publicadas permite reproducir analisis de interpretabilidad sobre la representacion de la negativa.
- Evaluacion de fidelidad de cuantizaciones: las tablas de LPIPS, KLD y coincidencia de top-1 sirven para comparar el impacto relativo de cuantizar frente a editar pesos.
- Procesamiento de imagenes de entrada: al conservar la torre de vision de Qwen3-VL-8B-Instruct, puede usarse para tareas de descripcion o analisis de imagen con el mismo binario GGUF.
- Auditoria de afirmaciones de "modelo sin censura": el repositorio es un caso de estudio util para verificar si una supuesta version sin filtros cambia o no el comportamiento observable del pipeline.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MMLU (antes de la edicion) | 77,35% |
| MMLU (despues de la edicion) | 77,35% (sin cambios) |
| Tasa de rechazo en ingles | 88,9% antes, 1,2% despues |
| Tasa de rechazo en ruso | 38% antes, 0% despues |
| KLD respecto al original, BF16 | 0,0019 |
| KLD respecto al original, Q8_0 | 0,0029 |
| Coincidencia de top-1, BF16 | 98,45% |
| Coincidencia de top-1, Q8_0 | 98,04% |
| LPIPS de imagen, BF16, 48 prompts neutros | 0 |
| LPIPS de imagen, Q8_0, 48 prompts neutros | 0,031 |
| LPIPS de imagen, BF16, prompts sensibles | 0,088 |
| Prompts sensibles con cambio de resultado (45 probados) | 0 de 45 |
| Categorias sensibles dibujadas igual que con el encoder original | 40 de 45 en ambos casos (incluye 4/4 desnudo y sugerente, 5/5 violencia, 5/5 armas, 4/5 drogas, 4/4 anatomia medica, 4/4 texto soez, 5/5 tabaco y alcohol, 5/5 tatuajes) |
| Referencia: LPIPS al cambiar de semilla | 0,499 |
| Referencia: LPIPS al cuantizar el encoder original a Q8_0 | 0,037 |

## Requisitos de hardware

- El fichero BF16 ocupa 16,39 GB; el Q8_0 ocupa 8,71 GB. El repositorio completo suma 54,0 GB.
- Solo el encoder Q8_0 (8,71 GB) entra en GPUs de consumo con 12 GB de VRAM, como una RTX 3060 de 12 GB o una RTX 4070, siempre que se pueda descargar parte del denoiser a CPU o usar un denoiser muy cuantizado.
- El encoder BF16 (16,39 GB) requiere al menos 24 GB de VRAM para ir holgado: RTX 3090, RTX 4090, RTX 5090, A5000 o superiores.
- Para el pipeline completo hay que sumar la VRAM del denoiser de 7B y la del VAE; en configuraciones de 24 GB conviene usar cuantizaciones bajas del denoiser y offload parcial.
- En entornos profesionales, A100 40/80 GB o H100 permiten mantener encoder y denoiser en VRAM sin offload.
- Opciones de despliegue: stable-diffusion.cpp (motor de referencia con el que se construyeron y verificaron los ficheros), llama.cpp y servidores GGUF compatibles para el uso exclusivamente conversacional, y Atomic Chat como aplicacion de escritorio que integra stable-diffusion.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado de la edicion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| li1272/Qwen-Image-2.1-Turbo-Uncensored-GGUF (esta ficha) | 8,19 mil millones | no disponible | Encoder abliterado, GGUF BF16 y Q8_0; 0 descargas, 1 like | Apache 2.0 | HuggingFace, repo de 54,0 GB |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8,19 mil millones | no disponible | Sin editar; rechazo 88,9% en ingles | Apache 2.0 | HuggingFace |
| AtomicChat/Qwen-Image-2.1-Turbo-GGUF (denoiser) | 7B aproximados | no disponible | Sin editar; no tiene mecanismo de rechazo | Apache 2.0 | HuggingFace |
| rayss868123/Qwen-Image-2.1-Uncensored-GGUF | no disponible | no disponible | Segun fuentes de la busqueda, pesos originales sin modificar | no disponible | HuggingFace |
| kkguku/Qwen-Image-2.1-Uncensored-GGUF | no disponible | no disponible | Reempaquetado para nodos de ComfyUI (Unet Loader GGUF + CLIPLoader tipo `qwen_image`) | no disponible | HuggingFace |

## Limitaciones y advertencias

- La edicion no cambia el resultado de las imagenes: en 45 prompts sensibles, ninguno cambio de resultado frente al encoder original, y el desplazamiento LPIPS es similar en prompts neutros (0,084) y sensibles (0,088), lo que indica un cambio general y no un sesgo hacia contenido rechazado.
- El denoiser no aprende a dibujar lo que se filtro del preentrenamiento; ningun encoder puede anadir esa capacidad.
- Riesgo de alucinacion y de sesgos: no cuantificado en la informacion disponible. La abliteration puede afectar a otros comportamientos ademas del rechazo, pese a que MMLU no cambie.
- La tasa de rechazo reducida (1,2% en ingles, 0% en ruso) implica que el modelo puede generar contenido danino si no se interpone un filtro externo. No incluye safety checker.
- Idioma: las unicas mediciones publicadas son en ingles y ruso; no hay listado oficial de lenguas soportadas.
- Contradiccion de licencia: los metadatos de HuggingFace indican Apache 2.0, pero fuentes de la busqueda web afirman que Qwen-Image se distribuye con licencia no comercial y que la version alojada por Alibaba aplica filtrado de prompts. Conviene verificar terminos antes de un uso comercial.
- Reputacion del repositorio: 0 descargas y 1 like. No es la publicacion canonica (la de AtomicChat) y no hay garantia de que los ficheros coincidan bit a bit con los originales.
- El propio autor advierte que el material de las categorias sensibles es para adultos.
- Uso legal: la generacion de contenido sensible esta sujeta a la legislacion aplicable en cada jurisdiccion.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/li1272/Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Denoiser Turbo del mismo autor original: https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Metricas publicas de la abliteration: https://huggingface.co/datasets/AtomicChat/Qwen-Image-2.1-Turbo-Abliterated-Uncensored-GGUF-metrics
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Aplicacion Atomic Chat: https://atomic.chat/
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Analisis del efecto de la edicion: https://cldnavi.com/en/blog/qwen-image-21-turbo-uncensored-gguf-2026/
- Ejecucion local de Qwen-Image 2.1: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Analisis sobre filtros, licencia y legalidad: https://blog.laozhang.ai/en/posts/qwen-image-2-1-nsfw
- Reempaquetado alternativo: https://huggingface.co/rayss868123/Qwen-Image-2.1-Uncensored-GGUF
- Reempaquetado para ComfyUI: https://huggingface.co/kkguku/Qwen-Image-2.1-Uncensored-GGUF
