# HITshan/DK-VLM-Model

## Resumen

DK-VLM es un modelo de vision-lenguaje (VLM) desarrollado por Han Su y colaboradores (HITshan), presentado en el paper "DK-VLM: Geometry as Position for Spatial Reasoning in Vision-Language Models" (arXiv:2610.22356). Su propuesta central es introducir la geometria como mecanismo de posicion mediante una atencion de doble kernel (Dual-Kernel Attention), con el objetivo de mejorar el razonamiento espacial en modelos que combinan imagen y texto.

El repositorio no contiene un modelo completo entrenado desde cero, sino checkpoints incrementales de 7B y 8B compuestos por adaptadores LoRA y pesos de una "rama geometrica". Para su uso es necesario descargar por separado el modelo base Qwen correspondiente y los pesos de VGGT-Omega, lo que implica un proceso de ensamblaje manual antes de la inferencia.

Es relevante ahora porque aborda uno de los puntos debiles clasicos de los VLM: la falta de comprension geometrica y espacial fiable (posiciones relativas, profundidad, orientacion de objetos). Al tratarse de una publicacion reciente con licencia MIT, resulta interesante para investigacion en robótica, navegacion y analisis de escenas, aunque su madurez de despliegue es todavia limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en transformer con Dual-Kernel Attention y rama geometrica (VGGT-Omega); adaptadores LoRA sobre base Qwen |
| Parametros totales | 7B y 8B (dos checkpoints incrementales); el total depende del modelo base Qwen no incluido |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (LoRA y pesos de rama geometrica; requiere base Qwen y VGGT-Omega aparte) |

## Arquitectura y entrenamiento

DK-VLM parte de un modelo base Qwen (vision-lenguaje) al que se le aplican adaptadores LoRA y una rama geometrica basada en VGGT-Omega. La innovacion principal es la Dual-Kernel Attention, que codifica informacion de posicion geometrica dentro del mecanismo de atencion, de modo que el modelo disponga de senales espaciales explicitas al razonar sobre imagenes y texto. Esta formulacion busca superar las limitaciones de los embeddings posicionales convencionales en tareas que requieren entender relaciones 3D.

El repositorio publica checkpoints incrementales de 7B y 8B, no un entrenamiento completo documentado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El entrenamiento se distribuye como adaptadores LoRA mas pesos de la rama geometrica, lo que sugiere un ajuste eficiente sobre el modelo base en lugar de un preentrenamiento desde cero.

## Capacidades

- Razonamiento espacial y geometrico sobre imagenes, gracias a la rama VGGT-Omega y la Dual-Kernel Attention.
- Comprension de vision y lenguaje combinados (VLM): descripcion de escenas, respuesta a preguntas visuales.
- Razonamiento sobre relaciones de posicion, profundidad y orientacion de objetos (objetivo declarado del paper).
- Capacidades de texto heredadas del modelo base Qwen (generacion, razonamiento), aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion.

## Casos de uso

- Robotica de manipulacion: el modelo puede interpretar la posicion relativa entre objetos y el efector para planificar agarres, aprovechando la rama geometrica que codifica relaciones espaciales.
- Navegacion asistida: analisis de escenas para estimar orientacion y disposicion de obstaculos, util en sistemas de asistencia a la conduccion o robots moviles.
- Analisis de imagenes tecnicas: interpretacion de planos, esquemas o fotografias de obra donde importa la geometria y la ubicacion de componentes.
- Investigacion en VLM: base para experimentos que comparen la Dual-Kernel Attention frente a embeddings posicionales clasicos en tareas de razonamiento espacial.
- Anotacion y descripcion de escenas 3D: generacion de descripciones textuales que incorporan informacion de profundidad y posicion, util en catalogacion de imagenes.
- Prototipos de realidad aumentada: comprension de la escena para anclar contenido virtual de forma coherente con la geometria observada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 7B-8B en precision de 16 bits se requieren aproximadamente 14-16 GB, y en cuantizacion de 8 bits alrededor de 8-9 GB, aunque la carga de la rama geometrica y del modelo base puede incrementar estos valores.
- GPU recomendadas: no especificadas en la informacion; por tamano, una A100 o H100 es adecuada para inferencia sin cuantizar, y una RTX 4090 (24 GB) podria ser suficiente para los checkpoints de 7B-8B en 16 bits.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) para los tamanos de 7B-8B, sujeto al consumo adicional de la rama geometrica; no confirmado.
- Opciones de despliegue: no se detallan en la informacion; el autor remite al repositorio de GitHub para instrucciones de inferencia y evaluacion. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DK-VLM | 7B / 8B (incremental sobre Qwen) | no disponible | VLM con atencion geometrica (Dual-Kernel) | MIT | Checkpoints LoRA + pesos, requiere base y VGGT-Omega |
| Qwen-VL (base) | no disponible en la informacion | no disponible | VLM generalista | depende de la version | Modelo completo publico |
| VGGT-Omega | no disponible en la informacion | no disponible | Rama geometrica / vision 3D | no disponible | Pesos separados |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar el modelo base Qwen y VGGT-Omega por separado y ensamblar los pesos, lo que anade complejidad de despliegue y posibles incompatibilidades de version.
- Ausencia de benchmarks publicados en la informacion disponible, por lo que no se puede verificar su rendimiento frente a alternativas.
- Riesgo de alucinacion inherente a los VLM, especialmente en estimaciones de profundidad o relaciones espaciales no observadas directamente.
- Sesgos: no documentados en la informacion disponible; al heredar el modelo base Qwen, podria arrastrar sesgos de este.
- Idiomas soportados no especificados; el soporte multilingue depende del modelo base.
- Longitud de contexto no documentada, lo que limita la planificacion de aplicaciones con entradas largas.
- Licencia MIT permite uso comercial, pero conviene revisar las licencias del modelo base Qwen y de VGGT-Omega, que se distribuyen por separado y pueden imponer condiciones adicionales.
- Repositorio con 0 descargas y 2 likes: proyecto de investigacion reciente, sin validacion comunitaria extensa.

## Enlaces

- HuggingFace: https://huggingface.co/HITshan/DK-VLM-Model
- Paper (arXiv): https://arxiv.org/abs/2610.22356
- PDF del paper: https://arxiv.org/pdf/2610.22356
- GitHub (inferencia y evaluacion): https://github.com/sumuru789/DK-VLM
