# sisniha/Qwen-Image-Edit-F2P

## Resumen

Qwen-Image-Edit-F2P es un adaptador de tipo LoRA (Low-Rank Adaptation) desarrollado por DiffSynth-Studio, aunque el repositorio analizado corresponde a una copia publicada por el usuario sisniha. El modelo se basa en Qwen-Image-Edit, un sistema de edición de imágenes por difusión, y está especializado en la generación de retratos completos a partir de una imagen facial recortada. Dado un recorte de cara como entrada, el modelo produce una imagen de retrato de la misma persona en un contexto o escena descrito por un prompt textual.

La relevancia de este modelo radica en su capacidad para controlar la identidad facial en tareas de generación de retratos, un caso de uso habitual en aplicaciones de avatares, fotografía virtual o creación de contenido. Al ser un LoRA, se integra como un complemento ligero sobre el modelo base Qwen-Image-Edit, lo que facilita su despliegue en flujos de trabajo existentes con DiffSynth-Studio. El repositorio tiene un tamaño de 1,4 GB, correspondiente al peso del adaptador, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen-Image-Edit (modelo de difusion de imagen a imagen) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de imagen) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bfloat16 segun el codigo de ejemplo) |
| Idiomas soportados | no disponible (el prompt se procesa en ingles en los ejemplos, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica al transformer de difusion de Qwen-Image-Edit. Qwen-Image-Edit es un modelo de difusion de imagen a imagen que, a su vez, se apoya en Qwen-Image para el codificador de texto y el VAE. El LoRA se entrena para mapear un recorte facial a un retrato completo, manteniendo la identidad de la persona. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens o el proceso de optimizacion (si se uso RLHF, DPO u otras tecnicas). El codigo de inferencia proporcionado utiliza DiffSynth-Studio, una libreria de generacion de imagenes, y carga el adaptador mediante `pipe.load_lora`.

## Capacidades

- Generacion de retratos completos a partir de un recorte facial, preservando la identidad de la persona.
- Control de la escena y el estilo mediante un prompt textual (por ejemplo, "una joven con vestido amarillo en un campo de flores").
- Integracion con un detector de caras automatico basado en InsightFace (antelopev2) para recortar la cara de una imagen de entrada.
- Compatible con el pipeline de DiffSynth-Studio para Qwen-Image-Edit, lo que permite su uso en flujos de edicion de imagenes.
- No se documentan capacidades de tool calling, agentes, razonamiento multimodal ni otros usos fuera de la generacion de retratos.

## Casos de uso

- Creacion de avatares personalizados: a partir de una foto de carnet, el modelo genera retratos completos en diferentes escenarios o atuendos, util para perfiles de redes sociales o juegos.
- Generacion de retratos profesionales: se puede usar para producir imagenes de presentacion con fondos y vestimenta especificos, partiendo de una captura facial simple.
- Ilustracion de personajes para narrativa visual: un escritor o disenador puede generar multiples variaciones de un mismo personaje a partir de una unica referencia facial.
- Pruebas de vestuario virtual: en comercio electronico, el modelo permite visualizar como quedaria una prenda en una persona concreta, usando solo una foto de la cara.
- Contenido para campañas de marketing: generar retratos de modelos sinteticos con identidad consistente para anuncios o material promocional.
- Restauracion o mejora de retratos antiguos: si se dispone de un recorte facial de baja calidad, el modelo puede generar una version moderna y completa, aunque no se garantiza fidelidad historica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas de calidad de imagen (FID, CLIP score, etc.) para este adaptador.

## Requisitos de hardware

- No se especifican requisitos oficiales en la documentacion del modelo.
- Al ser un LoRA sobre Qwen-Image-Edit, se requiere una GPU con suficiente VRAM para ejecutar el modelo base. Qwen-Image-Edit es un modelo de difusion de gran tamano; se estima que se necesitan al menos 16 GB de VRAM para inferencia en bfloat16, aunque no se confirma.
- El codigo de ejemplo utiliza CUDA y carga el modelo en `device="cuda"`, por lo que se asume una GPU NVIDIA.
- Opciones de despliegue: DiffSynth-Studio es la libreria principal; tambien podria integrarse con otros frameworks que soporten LoRA en modelos de difusion, pero no se documenta.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (LoRA para generacion de retratos a partir de caras). La pagina aimodels.fyi menciona que Qwen-Image-Edit-F2P se diferencia de otros modelos por su semantica explicita de cara a retrato, pero no se citan alternativas concretas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en la generacion de retratos; no es un modelo de edicion general ni de generacion de texto.
- No se han documentado sesgos especificos, pero al tratarse de un modelo de generacion de caras, puede heredar sesgos de los datos de entrenamiento de Qwen-Image-Edit (por ejemplo, en cuanto a etnia, edad o genero).
- Riesgo de alucinacion en detalles del retrato: el modelo puede inventar caracteristicas no presentes en el recorte facial, como peinados, accesorios o expresiones.
- La calidad del resultado depende de la calidad del recorte facial de entrada; si la cara esta mal recortada o es de baja resolucion, el retrato generado puede ser deficiente.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen-Image-Edit y de las dependencias (DiffSynth-Studio, InsightFace) para asegurar el cumplimiento.
- No se garantiza la fidelidad de la identidad en todos los casos; el modelo puede producir variaciones notables si el prompt es muy complejo o si la cara de entrada es poco representativa.

## Enlaces

- Repositorio en Hugging Face (sisniha): https://huggingface.co/sisniha/Qwen-Image-Edit-F2P
- Repositorio original en Hugging Face (DiffSynth-Studio): https://huggingface.co/DiffSynth-Studio/Qwen-Image-Edit-F2P
- Pagina en ModelScope: https://www.modelscope.ai/models/DiffSynth-Studio/Qwen-Image-Edit-F2P
- Repositorio de Qwen-Image en GitHub: https://github.com/QwenLM/Qwen-Image
- Analisis en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen-image-edit-f2p-diffsynth-studio
