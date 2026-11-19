# lvladikov/MOSS-SFT-Distill-4step-LoRA

## Resumen

MOSS-SFT-Distill-4step-LoRA es un adaptador LoRA de destilación de pasos para el modelo de difusión texto-a-imagen MOSS-Image SFT, desarrollado por OpenMOSS-Team. Lo publica el usuario lvladikov en Hugging Face bajo licencia Apache 2.0. Su función es reducir drásticamente el coste de inferencia: reproduce en 4 pasos y con CFG 1 lo que el modelo base genera en 50 pasos con CFG 3, lo que se traduce en 4 llamadas al modelo frente a las 100 del profesor y en un ahorro de tiempo de GPU de aproximadamente 14 veces.

El adaptador se ha entrenado mediante distribución matching contra el profesor de 50 pasos, con un crítico que compara las imágenes generadas con las del profesor y con fotografías reales. El resultado son 15.000 muestras de entrenamiento, rango 64 y 252 módulos, con 12 resoluciones entrenadas que van desde 768×512 y 512×768 hasta 1824×1024 y 1024×1824.

Es relevante ahora porque la destilación de pasos permite desplegar generación de imágenes de alta resolución en hardware más modesto y con latencias compatibles con productos interactivos, manteniendo fidelidad de tono, detalle fino y capacidad de renderizar texto legible en la imagen. El checkpoint publicado es `chk00015000`, producido el 19 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión texto-a-imagen (MOSS-Image SFT); destilación de pasos por distribution matching |
| Parametros totales | no disponible (adaptador LoRA: rango 64, 252 módulos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts de texto; sin lista oficial de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors vía diffusers; incluye un archivo específico `_comfyui` para ComfyUI |

## Arquitectura y entrenamiento

Se trata de un LoRA (adaptador de bajo rango) acoplado al modelo base OpenMOSS-Team/MOSS-Image-SFT, un modelo de difusión texto-a-imagen. La innovación principal es la destilación de pasos: en lugar de ejecutar 50 pasos con CFG 3 (dos llamadas al modelo por paso, 100 en total), el adaptador genera en 4 pasos con CFG 1, es decir, 4 llamadas al modelo, usando el propio sampler y schedule de MOSS con una programación de 4 pasos.

El entrenamiento se realizó por distribution matching contra el profesor de 50 pasos, con un crítico que compara las imágenes del estudiante con las del profesor y con fotografías reales. El conjunto de datos incluyó 34.000 prompts de Lakonik/t2i-prompts-3m, 2.877 prompts que deletrean palabras (letreros, menús, pósteres, etiquetas), unas 8.000 recortes fotográficos con caption y 3.600 imágenes del profesor para el conjunto real del crítico. El adaptador tiene rango 64 y 252 módulos, y se entrenó sobre una única NVIDIA B300 durante unas 30 horas. El archivo `_comfyui` incorpora un factor medido de 1,18 en sus valores alpha para compensar el redondeo que hace ComfyUI al sumar el LoRA a los pesos bf16.

## Capacidades

- Generación de imágenes texto-a-imagen en 4 pasos con CFG 1, usando el sampler y schedule nativos de MOSS.
- Renderizado de texto legible en la imagen: el modelo escribe las cadenas solicitadas en 14 de 15 prompts de prueba de texto a 1024×1024 (el profesor acierta 15 y el LoRA de 4 pasos de akhaliq, 12).
- 12 resoluciones entrenadas, incluyendo formatos anchos, altos y cuadrados, desde 768×512 y 512×768 hasta 1824×1024 y 1024×1824.
- Fidelidad de tono y color próxima al profesor: en 21 prompts de prueba a 1824×1024 la luminosidad media está 0,7 L* por encima del profesor (escala 0–100), la neblina es 0,94× y el color 1,02×.
- Mayor detalle fino que el profesor: textura fina 1,22× la del profesor en 22 prompts.
- Compatibilidad con diffusers (Python) y con ComfyUI mediante archivo específico y ocho flujos de trabajo (texto a imagen, layout, edición de imagen y PiD 4×, para ComfyUI local y Comfy Cloud).
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio; son capacidades no aplicables o no documentadas para este adaptador.

## Casos de uso

- Generación de imágenes en productos interactivos: con 4 pasos y CFG 1, la latencia permite integrar la generación en interfaces de usuario donde el profesor de 50 pasos resultaría demasiado lento; el ahorro medido es de 26,6 s frente a 387,3 s para 22 imágenes a 1024×1024 en Comfy Cloud.
- Prototipado rápido de conceptos visuales: artistas y diseñadores pueden iterar sobre prompts en tiempo casi real, aprovechando las 12 resoluciones entrenadas para adaptar el formato (vertical, horizontal, cuadrado) sin reentrenar.
- Creación de carteles, menús y rótulos con texto legible: el adaptador está entrenado con 2.877 prompts que deletrean palabras y acierta las cadenas solicitadas en 14 de 15 pruebas, lo que lo hace adecuado para mockups de señalética, menús de restaurante o pósteres.
- Generación de material fotográfico de stock sintético: los ejemplos de la model card incluyen retratos, fauna, mercados y escenas urbanas nocturnas; el adaptador mantiene el tono del profesor y añade textura fina, útil para bancos de imágenes internos.
- Ilustración con estilos definidos: los flujos de trabajo de ComfyUI permiten encadenar el LoRA con layout o edición de imagen para producir ilustraciones estilo acuarela, anime o claymation con control de composición.
- Despliegue en infraestructura con presupuesto de GPU limitado: al reducir las llamadas al modelo de 100 a 4, el adaptador hace viable la generación a 1824×1024 en entornos donde el profesor de 50 pasos no cabría en el presupuesto de tiempo o de GPU.
- Integración en pipelines de ComfyUI locales y en Comfy Cloud: los ocho flujos incluidos cubren texto a imagen, layout, edición y PiD 4×, lo que facilita su adopción en estudios que ya trabajan con ComfyUI.

## Benchmarks y rendimiento

| Metrica | Este LoRA (4 pasos, CFG 1) | Profesor MOSS-Image SFT (50 pasos, CFG 3) | LoRA 4 pasos de akhaliq |
|---|---|---|---|
| Llamadas al modelo por imagen | 4 | 100 | no disponible |
| Tiempo de GPU para 22 imagenes a 1024×1024 (Comfy Cloud) | 26,6 s | 387,3 s | no disponible |
| Ahorro de tiempo de GPU | ~14× | referencia | no disponible |
| Texto correcto en 15 prompts a 1024×1024 | 14 | 15 | 12 |
| Luminosidad media a 1824×1024 (21 prompts) | +0,7 L* sobre el profesor | referencia | no disponible |
| Neblina a 1824×1024 | 0,94× el profesor | referencia | no disponible |
| Color a 1824×1024 | 1,02× el profesor | referencia | no disponible |
| Textura fina (22 prompts) | 1,22× el profesor | referencia | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores son las reportadas por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base MOSS-Image SFT y de la resolución. El adaptador LoRA en sí ocupa 1,4 GB en el repositorio.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B300; para inferencia no se especifican GPU concretas en la información disponible.
- Cabe en GPU de consumo: no disponible; no se documenta el comportamiento en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: diffusers (Python) con el archivo LoRA exacto a fuerza 1.0; ComfyUI con el archivo `_comfyui` a fuerza 1.0 en el cargador estándar de LoRA; Comfy Cloud.
- Latencia y throughput: 26,6 s de tiempo de GPU facturado para 22 imágenes a 1024×1024 en Comfy Cloud (un job por imagen); no se proporcionan cifras de throughput por segundo ni latencia por imagen en hardware local.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos / CFG | Texto correcto (15 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lvladikov/MOSS-SFT-Distill-4step-LoRA | LoRA de destilación sobre MOSS-Image SFT | 4 pasos, CFG 1 | 14 | apache-2.0 | Hugging Face, diffusers y ComfyUI |
| akhaliq/MOSS-Image-SFT-4-steps | LoRA de destilación sobre MOSS-Image SFT | 4 pasos (CFG no disponible) | 12 | no disponible | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base (profesor) | 50 pasos, CFG 3 | 15 | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (destilación de pasos para difusión texto-a-imagen) en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador depende del modelo base OpenMOSS-Team/MOSS-Image-SFT; no funciona de forma autónoma y hereda las limitaciones del profesor.
- En ComfyUI es necesario usar el archivo `_comfyui` a fuerza 1.0; con el archivo exacto de diffusers, ComfyUI pierde aproximadamente un quinto del cambio entrenado debido al redondeo de la suma con los pesos bf16.
- El texto renderizado no es perfecto: acierta 14 de 15 prompts de texto, frente a 15 del profesor, por lo que puede fallar en cadenas largas o poco frecuentes.
- La luminosidad media queda 0,7 L* por encima del profesor, lo que puede introducir un sesgo sutil de brillo en las imágenes generadas.
- No se documentan sesgos demográficos, culturales ni de otro tipo; al ser un adaptador sobre un modelo base, los sesgos de este último se heredan sin que la model card los detalle.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no solicitado, especialmente en escenas complejas con muchas personas o texto.
- No se especifican los idiomas soportados en los prompts; la información disponible no permite confirmar el comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los datasets utilizados en el entrenamiento.
- El adaptador tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/lvladikov/MOSS-SFT-Distill-4step-LoRA
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- LoRA de 4 pasos de akhaliq: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Dataset de prompts: https://huggingface.co/datasets/Lakonik/t2i-prompts-3m
- Paper referenciado (arXiv:2611.17194): https://arxiv.org/abs/2611.17194
