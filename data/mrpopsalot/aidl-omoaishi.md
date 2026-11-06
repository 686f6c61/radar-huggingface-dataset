# mrpopsalot/aidl-omoaishi

## Resumen

OmoAIShi es un adaptador de tipo LyCORIS (LoKr de matriz completa) para modelos de difusión texto-a-imagen, desarrollado por Mr Pops Alot. Forma parte de la serie AIDL (AI Diaper LyCORIS), cuyo objetivo es enseñar a modelos base conceptos relacionados con pañales y temática ABDL. El adaptador se entrena sobre varios modelos base de la familia Stable Diffusion XL y arquitecturas afines, e incorpora múltiples conceptos en un único fichero, algo que el autor justifica por el uso de LyCORIS frente al formato LoRA convencional.

El repositorio tiene un tamaño de 6,3 GB y se distribuye bajo licencia Apache 2.0 (o la licencia del modelo base correspondiente). La model card lo etiqueta explícitamente como contenido NSFW, entrenado y probado únicamente sobre personajes dibujados, y lo marca como alpha pública cuyas generaciones no representan el modelo final. La versión documentada en la model card es la V18 ("Full-Ups Edition"), orientada al modelo base Anima.

Por su naturaleza, no es un modelo de lenguaje ni un sistema multimodal de propósito general: es un adaptador de estilización/concepto para pipelines de difusión. Su relevancia es acotada a un nicho muy específico y su evaluación debe hacerse en términos de fidelidad de concepto sobre los modelos base compatibles, no mediante benchmarks de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LyCORIS LoKr (matriz completa) sobre modelos de difusión texto-a-imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusión texto-a-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts dependen del modelo base) |
| Licencia | Apache 2.0, o la licencia del modelo base correspondiente |
| Formato de pesos | no disponible (repositorio de 6,3 GB, librería diffusers) |

## Arquitectura y entrenamiento

El adaptador emplea LyCORIS en variante LoKr de matriz completa (en versiones anteriores, LoCon). Según el autor, esta elección permite entrenar múltiples conceptos dentro de un mismo modelo, a diferencia del formato LoRA estándar. El adaptador se aplica sobre modelos de difusión texto-a-imagen de la familia SDXL y arquitecturas relacionadas.

Los modelos base declarados en los metadatos incluyen OpenMOSS-Team/MOSS-Image-Base, ChenkinRF/ChenkinNoob-XL-v0.2-Rectified-Flow, Laxhar/noobai-XL-Vpred-1.0, OnomaAIResearch/Illustrious-XL-v2.0, neta-art/neta-lumina y CabalResearch/Mugen. La model card indica entrenamiento a 512 px para MOSS Image y Anima, y a 1024 px para varias de las variantes SDXL (Mugen, Chenkin RF, NoobAI RF, NoobAI VPred, Illustrious 2, Lumina Image 2), aunque buena parte de esas líneas aparecen comentadas en el documento. No se detallan el número de imágenes de entrenamiento, la composición del dataset ni si hubo etapas de refinamiento posteriores.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por prompt, aplicando el concepto aprendido sobre el modelo base compatible.
- Incorporación de múltiples conceptos ABDL en un único adaptador, según declara el autor.
- Compatibilidad con distintos modelos base SDXL y afines, con resoluciones de entrenamiento de 512 px o 1024 px según la variante.
- Funciona como adaptador adicional: no genera imágenes por sí solo, requiere cargar el modelo base correspondiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No dispone de capacidades de visión, audio ni procesamiento de lenguaje natural.
- Cobertura multilingüe no documentada; la calidad del prompt depende del codificador de texto del modelo base.

## Casos de uso

- Investigación sobre adaptadores LyCORIS: sirve como ejemplo práctico de LoKr de matriz completa aplicado a un modelo de difusión, útil para estudiar cómo se comporta este formato frente a LoRA convencional en la incorporación de conceptos.
- Estudio de multi-concepto en un solo adaptador: permite analizar si un único fichero LyCORIS puede representar varios conceptos sin interferencias, tal como afirma el autor.
- Pruebas de compatibilidad entre modelos base: al declarar soporte para MOSS Image, Anima, Mugen, Chenkin RF, NoobAI (RF y VPred), Illustrious 2 y Lumina Image 2, facilita experimentos de transferencia de adaptadores entre bases SDXL y afines.
- Evaluación de fidelidad de concepto en nichos específicos: útil para medir la tasa de acierto del concepto objetivo frente a generaciones del modelo base sin adaptador.
- Docencia sobre licencias y contenido sensible: el repositorio ejemplifica cómo se declaran etiquetas NSFW, restricciones de contenido y licencias heredadas en un adaptador.
- Reproducción de pipelines diffusers: al publicarse en la librería diffusers, puede integrarse en scripts de generación por lotes para comparar resultados entre versiones del adaptador (V18 frente a anteriores).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el adaptador; depende del modelo base. Un modelo SDXL en precisión fp16 requiere del orden de 8-12 GB de VRAM para inferencia, y el adaptador añade una sobrecarga pequeña no cuantificada en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo base, cabría esperar GPUs con al menos 8-12 GB de VRAM, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la librería declarada es diffusers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión texto-a-imagen en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmoAIShi (este) | LyCORIS LoKr sobre SDXL y afines | no disponible | no aplica | Apache 2.0 / licencia del base | Hugging Face, GitLab, Booth |
| LoRA convencional para SDXL | Adaptador LoRA | no disponible | no aplica | variable | Hugging Face, Civitai |
| LyCORIS LoCon | Adaptador LyCORIS | no disponible | no aplica | variable | Hugging Face, Civitai |
| Modelo base SDXL (p. ej. Illustrious-XL) | Difusión texto-a-imagen | no disponible | no aplica | variable según base | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW explícito: el autor declara que el modelo está diseñado para fines NSFW y entrenado únicamente sobre personajes dibujados.
- Estado alpha pública: las generaciones no representan el modelo final, según la propia model card.
- Nicho muy restringido: los conceptos cubiertos son específicos y no extrapolables a usos generales de generación de imagen.
- Dependencia del modelo base: la calidad y el comportamiento final dependen del modelo sobre el que se aplique; la compatibilidad declarada incluye varias bases distintas con resoluciones de entrenamiento diferentes (512 px y 1024 px).
- Licencia heredada: aunque el adaptador se publica como Apache 2.0, la model card indica que se aplica la licencia del modelo base correspondiente, lo que puede imponer restricciones adicionales para uso comercial.
- Sin datos de sesgo, alucinación ni evaluación cuantitativa: no se han publicado métricas de fidelidad, sesgo o robustez.
- Idiomas no documentados: no se especifica cobertura multilingüe de los prompts.
- Riesgo de reproducir sesgos del dataset de entrenamiento, no cuantificado en la información disponible.
- El repositorio incluye múltiples enlaces a foros y plataformas de terceros; su contenido y políticas no están verificados en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/mrpopsalot/aidl-omoaishi
- GitLab (gitgud.io): https://gitgud.io/mrpopsalot/aidl-omoaishi
- Booth: https://mrpopsalot.booth.pm/items/7895981
- AllTheFallen: https://allthefallen.moe/forum/index.php?resources/aidl-omoaishi.7465/
- Roriwalrus: https://www.roriwalrus.com/index.php?threads/aidl-omoaishi-diaper-lora.2905/
- Azkosel's Corner: https://azkoselscorner.com/index.php?threads/aidl-omoaishi-diaper-lora.2796/
- Guía para principiantes de SD: https://gitgud.io/pops-aidl/sd-beginners-guide
- Adaptador relacionado (AIDL Mini): https://huggingface.co/mrpopsalot/aidl-mini
- Modelo base MOSS Image: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo base ChenkinNoob-XL-v0.2-Rectified-Flow: https://huggingface.co/ChenkinRF/ChenkinNoob-XL-v0.2-Rectified-Flow
- Modelo base NoobAI-XL-Vpred-1.0: https://huggingface.co/Laxhar/noobai-XL-Vpred-1.0
- Modelo base Illustrious-XL-v2.0: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v2.0
- Modelo base neta-lumina: https://huggingface.co/neta-art/neta-lumina
- Modelo base Mugen: https://huggingface.co/CabalResearch/Mugen
