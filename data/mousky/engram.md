# Mousky/ENGRAM

## Resumen

ENGRAM es un modelo de generacion de video condicionado por camara, presentado como un marco de memoria espacial latente para "world models" de video. Lo desarrolla un equipo academico encabezado por Chenhao Wu (Universidad de la Academia China de Ciencias) junto con investigadores de la Universidad de Jilin, la Universidad de Pekin, la UNSW, Fullive-AI y la Universidad de Wuhan. El modelo parte de Wan2.2-TI2V-5B-Diffusers y lo adapta para generar videos 3D-consistentes a partir de una sola imagen siguiendo trayectorias de camara especificadas.

El problema que aborda es la falta de consolidacion de la memoria espacial en los world models existentes: las actualizaciones por union de conjuntos dejan observaciones repetidas sin consolidar, y la lectura solo del plano mas frontal impide acceder simultaneamente a evidencia almacenada a distintas profundidades. ENGRAM introduce dos mecanismos: fusion latente ponderada por fiabilidad y lectura por capas consciente de oclusion.

La relevancia actual radica en que la adaptacion se realiza con solo 256 escenas de entrenamiento y 2.304 ventanas, y aun asi reporta mejoras medibles frente a Spatia en sintesis de vistas novedosas y en evaluacion WorldScore. El repositorio ocupa 18,4 GB e incluye checkpoints de las dos etapas de adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de video (adaptacion de Wan2.2-TI2V-5B) con rama lateral de condicionamiento de memoria latente |
| Parametros totales | 5B (modelo base Wan2.2-TI2V-5B); parametros exactos del adaptador no disponibles |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (procesa fragmentos de 33 frames con stride de 32 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Codigo fuente bajo MIT; checkpoints adaptan Wan2.2, cuya licencia Apache-2.0 se mantiene segun la model card |
| Formato de pesos | .pt (PyTorch); stage1_step_4000.pt (5,58 GB), stage2_step_8000.pt (12,81 GB) |

## Arquitectura y entrenamiento

ENGRAM se construye sobre Wan2.2-TI2V-5B-Diffusers, un generador de video de difusion de 5B parametros. La innovacion principal es un sistema de memoria espacial latente compuesto por dos modulos. La fusion latente ponderada por fiabilidad integra de forma recursiva observaciones geometrica y visualmente compatibles en un espacio latente con normalizacion por canal, consolidando evidencia repetida en una representacion de escena compartida. La lectura por capas consciente de oclusion expone multiples candidatos latentes ordenados por profundidad, con su fiabilidad y disponibilidad en cada celda objetivo, de modo que el generador accede a informacion de varias superficies a medida que cambia la visibilidad.

Los rayos de camara explicitos proporcionan informacion de punto de vista independientemente de la cobertura de memoria, y restricciones de consistencia geometrica guian las actualizaciones. La recuperacion de memoria usa una sola proyeccion a resolucion latente, evitando el renderizado RGB intermedio y la recodificacion VAE. El entrenamiento consta de dos etapas: la etapa 1 entrena la rama lateral de condicionamiento de memoria durante 4.000 actualizaciones, y la etapa 2 congela esa rama y adapta el transformer de video completo durante 8.000 actualizaciones. Todo el proceso usa 256 escenas y 2.304 ventanas. No se especifica en la informacion disponible si hubo RLHF, DPO ni la composicion exacta del dataset.

## Capacidades

- Generacion de video a partir de una imagen (image-to-video) condicionada por trayectorias de camara.
- Control explicito de camara mediante rayos de camara, independiente de la cobertura de memoria.
- Memoria espacial latente persistente para exploracion y revision de escenas (revisitas en bucle cerrado).
- Sintesis de vistas novedosas con consistencia 3D.
- Lectura por capas consciente de oclusion para manejar cambios de visibilidad entre superficies.
- Generacion en ingles (unico idioma declarado).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Previsualizacion arquitectonica e inmobiliaria: generar recorridos de camara coherentes a partir de una unica fotografia de una estancia, aprovechando la memoria espacial latente para mantener la geometria al revisitar zonas ya observadas.
- Creacion de contenido para videojuegos y entornos virtuales: producir clips de exploracion de escenas 3D-consistentes que sirvan como referencia o material de prototipado antes de construir el entorno real.
- Simulacion de navegacion para robotica: generar trayectorias de camara sinteticas con consistencia geometrica para aumentar datos de entrenamiento de percepcion.
- Efectos visuales y postproduccion: crear planos de camara virtuales a partir de una imagen fija con control preciso de la trayectoria, reduciendo el trabajo manual de reconstruccion.
- Investigacion en world models: servir como base reproducible para estudiar consolidacion de memoria espacial y lectura por capas en generacion de video condicionada por camara.
- Evaluacion de consistencia 3D: usar los checkpoints y el manifiesto de entrenamiento para reproducir los experimentos de RealEstate10K y WorldScore y comparar tecnicas de memoria latente.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 100 escenas de test de RealEstate10K y un subconjunto de 200 casos de WorldScore:

| Metrica | ENGRAM | Spatia | Diferencia |
|---|---|---|---|
| PSNR novel-view-synthesis (RealEstate10K) | no disponible (valor absoluto) | no disponible (valor absoluto) | +0,82 dB |
| PSNR closed-loop (RealEstate10K) | no disponible (valor absoluto) | no disponible (valor absoluto) | +4,48 dB |
| WorldScore (media, 200 casos) | 67,78 | 64,47 (inferido de +3,31) | +3,31 puntos |

La model card solo publica las diferencias frente a Spatia, no los valores absolutos de PSNR. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el checkpoint final ocupa 12,81 GB en disco y el modelo base es de 5B parametros, por lo que se requiere una GPU con memoria suficiente para pesos, activaciones de video y cache de difusion.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano del modelo base, se situa en el rango de GPUs de datacenter (A100, H100) y posiblemente RTX 4090 para configuraciones reducidas.
- Ajuste en GPU de consumo: no confirmado; requiere verificacion empirica.
- Opciones de despliegue: inferencia mediante `run.py` del repositorio fuente de ENGRAM, con dependencia del modelo Wan2.2-TI2V-5B Diffusers, MapAnything y cache de Torch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La receta de evaluacion usa fragmentos de 33 frames, stride de 32 frames, 40 pasos de muestreo y CFG 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ENGRAM | 5B (base Wan2.2-TI2V-5B) | 33 frames por fragmento, stride 32 | Memoria espacial latente con fusion ponderada y lectura por capas | Codigo MIT; pesos con Apache-2.0 heredada | Hugging Face (Mousky/ENGRAM) |
| Spatia | no disponible | no disponible | Referencia comparada en la model card | no disponible | no disponible |
| Wan2.2-TI2V-5B | 5B | no disponible en la informacion | Generador de video de difusion base | Apache-2.0 | Hugging Face (Wan-AI) |

La informacion disponible solo permite comparar con Spatia (referencia de la model card) y con el modelo base Wan2.2. No se aportan datos de otros world models de video comparables.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se declara soporte multilingue.
- Adaptacion con solo 256 escenas de entrenamiento, lo que puede limitar la generalizacion a dominios visuales muy distintos.
- Riesgo de alucinacion geometrica en zonas sin cobertura de memoria o con oclusiones complejas no representadas en entrenamiento.
- La licencia de los pesos no se declara de forma independiente; hereda la Apache-2.0 de Wan2.2 segun la model card, pero conviene verificar los terminos exactos antes de uso comercial.
- Requiere dependencias externas (Wan2.2-TI2V-5B Diffusers, MapAnything, cache de Torch) y configuracion manual de rutas via `assets.local.json`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.
- No se publican valores absolutos de PSNR ni datos de latencia, lo que dificulta la comparacion directa con otros sistemas.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de RealEstate10K y WorldScore.

## Enlaces

- Hugging Face: https://huggingface.co/Mousky/ENGRAM
- Paper arXiv: https://arxiv.org/abs/2611.28136
- Repositorio de codigo: https://github.com/wchkoutian/Engram-release
- Modelo base Wan2.2-TI2V-5B Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- MapAnything (dependencia): https://github.com/facebookresearch/map-anything
- Pesos en el repositorio: https://huggingface.co/Mousky/ENGRAM/tree/main
