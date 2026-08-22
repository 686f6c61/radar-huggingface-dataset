# Evados/DiffSynth-Studio-Lora-Wan2.1-ComfyUI

## Resumen

Evados/DiffSynth-Studio-Lora-Wan2.1-ComfyUI es una colección de LoRAs modificados y un nodo personalizado para ComfyUI, desarrollada por Evados, que extiende el modelo base Wan-AI/Wan2.1-T2V-1.3B. El repositorio incluye versiones "boosted" del modelo de texto a vídeo (T2V) y de imagen a vídeo (I2V) de Wan 2.1, junto con LoRAs de estética, control de velocidad y mejora de resolución, así como un nodo de ComfyUI que permite combinar dos imágenes con transiciones y prompts mixtos. El objetivo principal es reducir el número de pasos de inferencia (de 4 a 10) y mejorar la calidad visual de los vídeos generados, manteniendo compatibilidad con la herramienta de entrenamiento Diffusion Pipe.

La colección incluye un LoRA de ruido extra entrenado sobre más de 10.000 imágenes que añade realismo y detalle, y se ha adaptado para funcionar con el modelo Wan 2.1 Fun InP (para entrada de imagen). Todo el conjunto está licenciado bajo Apache-2.0, lo que permite uso comercial y modificación. Aunque el repositorio ocupa 167 GB, la mayoría del peso corresponde a los distintos LoRAs y checkpoints intermedios, no a un modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRAs sobre Wan-AI/Wan2.1-T2V-1.3B (modelo de difusion de video) |
| Parametros totales | No disponible (el modelo base tiene 1.3B; los LoRAs son aditivos) |
| Parametros activos | No aplicable (no es un MoE) |
| Longitud de contexto | No disponible (limitado por el modelo base, tipicamente 80 frames) |
| Tipos de cuantizacion | No disponible (los LoRAs estan en safetensors, el modelo base se puede cuantizar) |
| Idiomas soportados | No disponible (el modelo base soporta ingles y chino, pero no se especifica para los LoRAs) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (para LoRAs y nodos) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA y un nodo personalizado para ComfyUI. Los LoRAs se basan en el modelo Wan 2.1 T2V 1.3B, un modelo de difusion de video que genera secuencias de 80 frames a 720p. El autor ha aplicado tecnicas de destilacion y "boost" (mejora de pasos) para reducir el numero de pasos de muestreo necesarios (de 4 a 10), manteniendo la coherencia temporal y la calidad visual. Ademas, ha creado un LoRA especifico llamado `dg_wan2_1_v1_3b_lora_extra_noise_detail_motion.safetensors`, entrenado sobre 10.000 imagenes para replicar sus patrones de ruido inicial, lo que anade realismo y movimiento sin reproducir las imagenes de entrenamiento.

El autor indica que los modelos "boosted" son compatibles con la herramienta Diffusion Pipe (https://github.com/tdrussell/diffusion-pipe) para entrenar LoRAs propios, y que el entrenamiento de un LoRA simple (20-30 imagenes) tarda entre 20 y 30 minutos en una GPU GeForce RTX 4070 Ti Super. Tambien se han convertido dos LoRAs de la serie Wan 2.1 Fun (HPS2.1 y MPS) para que funcionen con el modelo Fun InP, aunque el efecto de boosting es menos notable en ese modo.

## 4. Capacidades

- Generacion de video a partir de texto (T2V) con el modelo base Wan 2.1, reduciendo los pasos de muestreo a 4-10.
- Generacion de video a partir de imagen (I2V) con el modelo Fun InP, incluyendo un nodo personalizado que acepta una o dos imagenes y define modos de transicion entre ellas.
- LoRA de estetica (`Wan2.1-1.3b-lora-aesthetics-v1`) que mejora el atractivo visual de los videos, compatible con configuraciones de CFG = 1 y sigma_shift = 10.
- LoRA de ruido extra y movimiento (`dg_wan2_1_v1_3b_lora_extra_noise_detail_motion`) que incrementa realismo, detalle y movimiento, recomendado con fuerza entre 0.01 y 0.35.
- Nodo personalizado `ComfyUI-DG-Wan2_1-OX3D` que permite mezclar dos imagenes y dos prompts, con tres modos de transicion.
- Compatibilidad con ComfyUI (via nodo personalizado) y con Diffusion Pipe para entrenamiento de LoRAs propios.
- Soporte para configuraciones de pasos variables: se recomienda usar sampler Euler y ajustar el CFG si se incrementa el numero de pasos.

## 5. Casos de uso

- **Creacion de clips cortos para redes sociales**: generar videos de 5-10 segundos con prompts de texto en 4-8 pasos, lo que permite iterar rapidamente en una GPU consumer.
- **Prototipado de ideas de video**: con el nodo personalizado se pueden combinar dos imagenes de referencia y un prompt para explorar transiciones entre escenas, util en preproduccion de animaciones o spots publicitarios.
- **Entrenamiento de LoRAs de personajes**: usar el modelo base con Diffusion Pipe para entrenar un LoRA sobre 20-30 imagenes de un rostro o estilo, en 20-30 minutos en una RTX 4070 Ti Super, y despues aplicar el LoRA para generar videos consistentes.
- **Mejora de calidad en videos generados**: aplicar el LoRA de estetica (`aesthetics`) para aumentar el atractivo visual de videos producidos con Wan 2.1, especialmente en interiores y detalles de personajes.
- **Produccion de video con bajo coste computacional**: al reducir los pasos a 4-6, se puede ejecutar en GPUs con 8-12 GB de VRAM, abaratando el despliegue en entornos de produccion.
- **Investigacion en generacion de video**: el conjunto de LoRAs experimentales (destilados, hires, refined) permite estudiar el impacto de la destilacion en la calidad de video y el movimiento, comparando versiones.

## 6. Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona resultados cualitativos de sus pruebas, pero no proporciona metricas cuantitativas (FID, CLIP score, etc.). No hay datos objetivos de rendimiento frente a otros modelos.

## 7. Requisitos de hardware

- **VRAM estimada**: el modelo base Wan 2.1 T2V 1.3B puede ejecutarse en GPUs con 8 GB de VRAM en cuantizacion FP16, y los LoRAs no anaden un coste significativo. Para generar videos de 80 frames a 720p se recomienda al menos 12 GB.
- **GPU recomendadas**: NVIDIA GeForce RTX 4070 Ti Super (usada por el autor para entrenar), RTX 4090, A100 o H100 para entornos de produccion.
- **Compatibilidad con consumer GPU**: si, cabe en una RTX 3060 12GB o RTX 4060 Ti 16GB si se reduce la resolucion o se usa cuantizacion.
- **Opciones de despliegue**: ComfyUI (con el nodo personalizado), Diffusion Pipe para entrenamiento, y se puede integrar en pipelines de generacion de video via API.
- **Latencia**: no disponible. Depende del numero de pasos (4-10) y de la resolucion. En una RTX 4070, 4 pasos en 512p pueden tardar alrededor de 30-60 segundos, pero no hay datos publicos.

## 8. Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1.3B | 80 frames | Apache-2.0 | Hugging Face | Modelo base, requiere mas pasos (20-30) |
| Evados/DiffSynth-Studio-Lora-Wan2.1-ComfyUI | 1.3B + LoRAs | 80 frames | Apache-2.0 | Hugging Face | LoRAs y nodo para ComfyUI, reduce pasos |
| Wan 2.1 Fun InP (I2V) | 1.3B | 80 frames | Apache-2.0 | Hugging Face | Version para imagen a video, con LoRAs convertidos |

La comparativa se limita a la familia Wan 2.1, ya que no hay modelos de tamano similar en el repositorio. No se dispone de datos de benchmarks comparativos.

## 9. Limitaciones y advertencias

- **Experimental**: el autor advierte que los modelos son experimentales y no se han probado en todas las situaciones. Puede haber artefactos o ruido extraño, especialmente si se usa Tea Cache con ciertos valores de pasos.
- **Conflicto con Tea Cache**: el efecto de boosting se aplica antes de Tea Cache, lo que puede causar ruido; se recomienda desactivar Tea Cache o probar valores diferentes.
- **Reduccion de movimiento**: en versiones anteriores se observo una reduccion del movimiento; las nuevas versiones intentan mitigarlo, pero puede seguir siendo menor que el modelo base.
- **Limitaciones de idioma**: no se especifica si los LoRAs funcionan con prompts en espanol; el modelo base Wan 2.1 soporta ingles y chino, pero no se garantiza.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base tiene su propia licencia (Apache-2.0 tambien, segun HuggingFace).
- **Riesgo de alucinacion**: en generacion de video, pueden aparecer objetos o movimientos no solicitados, especialmente con pocos pasos.
- **Dependencia de ComfyUI**: el nodo personalizado requiere una instalacion manual y un entorno de Windows (aunque puede funcionar en Linux con ajustes).

## 10. Enlaces

- Repositorio HuggingFace: https://huggingface.co/Evados/DiffSynth-Studio-Lora-Wan2.1-ComfyUI
- Modelo base Wan 2.1 T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Herramienta de entrenamiento Diffusion Pipe: https://github.com/tdrussell/diffusion-pipe
- Nodo personalizado (dentro del repo): `ComfyUI-DG-Wan2_1-OX3D` (instrucciones en la model card)
- Ejemplos de video en YouTube: https://youtu.be/QZfqqMpai9Y y https://www.youtube.com/watch?v=bXUYkfybOCE (referenciados en la model card)
