# RunningHubAI/rh-fucktoy-noir-krea2-turbo-unet

## Resumen

rh-fucktoy-noir-krea2-turbo-unet es un checkpoint de tipo UNET para generación y edición de imágenes publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base krea2, orientado a un pipeline de texto-a-imagen y edición de imágenes, con un sesgo estético declarado hacia el fotorrealismo, el contraste cinematográfico y una estética "noir". El autor lo describe como un modelo NSFW de la familia Krea 2 Turbo, pensado para el régimen de muestreo rápido (Turbo) en lugar de schedules de difusión largos.

El modelo se distribuye como un único archivo de pesos en formato safetensors con cuantización fp8, de aproximadamente 12,5 GiB (13,1 GB de repositorio), y está etiquetado para su uso en ComfyUI. No se publican datos sobre arquitectura interna, número de parámetros, longitud de contexto ni idiomas soportados; la información disponible se limita a la model card del autor y a los metadatos del repositorio.

Su relevancia es limitada y muy específica: se trata de un checkpoint comunitario de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Resulta útil únicamente como referencia para quienes ya trabajan con el ecosistema Krea 2 Turbo en ComfyUI y buscan una variante con una línea visual más oscura y contrastada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión (imagen-texto-a-imagen); arquitectura interna no detallada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp8 (archivo publicado: `fucktoyNoirKrea2_v10_fp8.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (UNET, 12533 MiB) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un UNET de difusión ajustado a partir de krea2, dentro de la familia Krea 2 Turbo. El autor no detalla la arquitectura interna (número de bloques, atención, dimensiones latentes), ni el volumen o composición del dataset de entrenamiento, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

El único dato operativo relevante es el régimen de muestreo recomendado por el autor para sus propias pruebas: 8 pasos, CFG 1, sampler Euler y scheduler Simple. Este perfil corresponde al modo Turbo, que prioriza la velocidad de inferencia sobre schedules de difusión largos. El archivo publicado está en fp8, lo que reduce el peso en disco y memoria frente a una versión fp16.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en el ecosistema ComfyUI.
- Edición de imágenes (el autor etiqueta el modelo como "UNET (image edit)").
- Fotorrealismo y renderizado de personajes, con énfasis en piel, materiales y respuesta a la iluminación.
- Estética cinematográfica de alto contraste ("noir"), con capacidad declarada de moverse entre fotografía contemporánea limpia e imágenes más moody.
- Control mediante prompting de vestuario, entorno, iluminación, posición de cámara y encuadre.
- Generación NSFW (contenido para adultos), según la descripción del autor.
- Muestreo rápido en modo Turbo (8 pasos, CFG 1).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, matemáticas, código, visión de entrada general ni audio.

## Casos de uso

- Generación de retratos fotorrealistas con iluminación cinematográfica: el modelo está ajustado para responder a cambios de luz y cámara, por lo que encaja en flujos de creación de retratos con dirección de arte controlada mediante prompt.
- Previsualización rápida de conceptos visuales: con 8 pasos y CFG 1, permite iterar bocetos de composición en pocos segundos dentro de ComfyUI antes de pasar a un modelo de mayor calidad.
- Edición de imágenes existentes en pipelines de ComfyUI: la etiqueta "image edit" sugiere su uso en nodos de edición sobre imágenes de entrada, útil para retoques de vestuario o entorno.
- Producción de material para proyectos creativos de temática noir: su sesgo estético hacia el contraste alto y la iluminación dramática lo hace adecuado para ilustración editorial oscura o storyboards.
- Generación de contenido para adultos en entornos controlados: el autor lo declara NSFW, por lo que su uso legítimo se restringe a plataformas y flujos que permitan ese tipo de contenido y cumplan la normativa aplicable.
- Experimentación con finetunes de Krea 2 Turbo: sirve como referencia para estudiar cómo un ajuste fino desplaza la distribución estética del modelo base sin perder flexibilidad de prompting.
- Integración en flujos alojados de RunningHub: el autor ofrece carga del modelo y API en su plataforma, lo que permite probarlo sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo fp8 ocupa 12533 MiB (unos 12,2 GiB), por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, más el overhead del pipeline (VAE, text encoder y latentes). En la práctica, se recomienda un margen adicional; el autor no publica cifras de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño de pesos, encaja en GPUs con 16 GB o más de VRAM; no se confirma compatibilidad con GPUs de 8-12 GB.
- ¿Cabe en GPU de consumo? Con 12,2 GiB solo de UNET en fp8, es ajustado para tarjetas de 16 GB y no cabe en tarjetas de 8 GB sin offloading.
- Opciones de despliegue: ComfyUI (plataforma declarada por el autor), RunningHub (plataforma del autor y API), Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un UNET de difusión.
- Latencia y throughput: no disponibles. El régimen Turbo de 8 pasos sugiere una inferencia rápida, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-fucktoy-noir-krea2-turbo-unet | UNET de difusión (finetune de krea2) | no disponible | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| krea2 (modelo base) | UNET de difusión | no disponible | no disponible | según proyecto upstream | Referenciado como origen del finetune |
| Krea 2 Turbo (familia) | UNET de difusión Turbo | no disponible | no disponible | según proyecto upstream | Ecosistema ComfyUI |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparables en la información proporcionada, por lo que la comparación se limita a tipo, origen y disponibilidad.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está declarado explícitamente como material para adultos; su uso requiere verificar la normativa legal aplicable en la jurisdicción de despliegue y las políticas de la plataforma.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream sin especificarla. No hay autorización explícita para uso comercial; debe consultarse la licencia de krea2 antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados por el autor. Al ser un finetune estético de un modelo de difusión, es previsible que herede sesgos de representación del modelo base, pero no hay datos que lo confirmen.
- Riesgo de alucinación visual: no cuantificado; como todo modelo generativo de imágenes, puede producir anatomías, materiales o composiciones inconsistentes, especialmente fuera del régimen de 8 pasos recomendado.
- Limitaciones de idioma: no se documentan idiomas soportados para el prompt; no hay garantía de comportamiento multilingüe.
- Sin benchmarks ni métricas de calidad publicadas: no es posible evaluar su rendimiento frente a alternativas con datos objetivos.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Dependencia del ecosistema: el autor lo orienta a ComfyUI y RunningHub; fuera de esos entornos la integración no está documentada.
- El tamaño del repositorio (13,1 GB) y el archivo fp8 (12,2 GiB) implican requisitos de almacenamiento y VRAM considerables para un modelo de nicho.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-fucktoy-noir-krea2-turbo-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099415037394812930
- Página del autor: https://www.runninghub.ai/user-center/2007154923476885506
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-fucktoy-noir-krea2-turbo-unet/blob/main/README_cn.md
