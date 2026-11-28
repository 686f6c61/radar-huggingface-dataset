# Noginowa/merge-experiment

## Resumen

`Noginowa/merge-experiment` es un repositorio experimental que agrupa una familia de modelos de difusion texto-a-imagen obtenidos mediante tecnicas de *merging* (fusion de pesos) de modelos base de las series Anima e Illustrious. El autor, Noginowa, publica aqui versiones etiquetadas como `alpha-mix` y `kirakira-mix`, cada una con su propio numero de version y fecha, orientadas a la generacion de ilustracion y arte digital. El repositorio es ante todo un banco de pruebas: la model card indica explicitamente que se trata de un "experimental merge model repository" y que algunas variantes han sido refinadas y relanzadas como modelos independientes (por ejemplo, `PrismPalette ANIMA v1`).

El modelo se distribuye en formato diffusers y sigue el pipeline `text-to-image`, con pesos en `safetensors` y una arquitectura heredada de los modelos base: un UNet de difusion combinado con un text encoder Qwen 3 0.6B y un VAE de Qwen Image, segun los componentes que la propia model card indica para ComfyUI. El repositorio ocupa 179,1 GB, lo que refleja la acumulacion de multiples variantes de pesos en lugar de un unico checkpoint.

Su relevancia actual es acotada y de nicho: interesa a quienes trabajan con *model merging* aplicado a difusion, a usuarios de ComfyUI que quieran probar mezclas concretas de estilos Anima/Illustrious, y como referencia historica de las variantes que dieron lugar a modelos publicados de forma estable. No es un modelo de proposito general ni un LLM, y la informacion publica sobre arquitectura interna, datos de entrenamiento y evaluacion es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (UNet + text encoder + VAE), derivado de las series Anima e Illustrious |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusion en el sentido de LLM; el text encoder Qwen 3 0.6B tiene su propia ventana, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | other (Anima: CircleStone Labs Non-Commercial License v1.2; Illustrious: Fair AI Public License 1.0-SD) |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los checkpoints fusionados. Por los componentes indicados en la model card (UNet en `diffusion_models/`, text encoder `qwen_3_06b_base.safetensors` y VAE `qwen_image_vae.safetensors`), se trata de un pipeline de difusion con un text encoder basado en Qwen 3 0.6B y el VAE de Qwen Image, sobre un UNet cuyos origenes concretos no se especifican. Las variantes se agrupan en dos linajes: Anima (versiones `alpha-mix-anima-01` a `-05`) e Illustrious (versiones `alpha-mix-ill-01` a `-09`, mas `kirakira-mix-ill-01`).

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO o fine-tuning por preferencias. Al tratarse de un repositorio de *merges*, el proceso subyacente es la fusion de pesos de modelos preexistentes (posiblemente mediante tecnicas como suma ponderada, block merge o similares), no un entrenamiento desde cero. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal, que por otra parte no aplican al paradigma de difusion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en ingles (pipeline `text-to-image`).
- Produccion de ilustracion y arte digital con estilos derivados de las series Anima e Illustrious.
- Control de la generacion mediante CFG scale (rango recomendado 4-5, con 4.5 como valor sugerido) y numero de pasos (la model card trunca la tabla de parametros recomendados, por lo que el resto de ajustes no esta disponible).
- Integracion en flujos de trabajo ComfyUI mediante la colocacion manual de UNet, text encoder y VAE en sus directorios correspondientes.
- Compatibilidad con la libreria `diffusers`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo *thinking*; no aplican a este tipo de modelo.
- Capacidad multilingue limitada al ingles segun el campo `language: en`.

## Casos de uso

- Exploracion de tecnicas de *model merging*: el repositorio sirve como banco de pruebas para comparar variantes `alpha-mix` y `kirakira-mix` y evaluar como afecta la fusion de pesos al estilo y la coherencia de la imagen generada.
- Generacion de ilustracion para prototipado conceptual: artistas y disenadores pueden usar las variantes Anima o Illustrious para producir bocetos rapidos en ingles con CFG en torno a 4.5, aprovechando el sesgo estilistico de cada linaje.
- Integracion en pipelines de ComfyUI: al estar pensado para colocarse manualmente en `diffusion_models/`, `text_encoders/` y `vae/`, encaja en flujos nodales existentes sin necesidad de conversion adicional.
- Investigacion sobre linajes de modelos: las fechas y estados (oficial, deprecado, discontinuado) permiten trazar la evolucion de las mezclas de Noginowa y comparar que variantes acabaron dando lugar a modelos publicados de forma estable, como `PrismPalette ANIMA v1`.
- Evaluacion comparativa de estilos: al convivir variantes Anima e Illustrious en el mismo repositorio, es posible generar un mismo prompt con cada una y analizar diferencias de estetica y fidelidad.
- Base para *fine-tuning* o nuevos merges: los checkpoints en safetensors pueden servir como punto de partida para experimentos posteriores de fusion o ajuste, siempre respetando las licencias de los modelos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 179,1 GB, pero corresponde a la suma de multiples variantes; un unico checkpoint de difusion de este tipo suele requerir varios GB de VRAM, aunque la cifra concreta no se especifica.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del checkpoint concreto elegido y de la precision de los pesos.
- Opciones de despliegue: ComfyUI (con los tres componentes en sus directorios) y `diffusers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noginowa/merge-experiment | Difusion texto-a-imagen (merge) | no disponible | no aplica | other (no comercial en Anima; FAIPL 1.0-SD en Illustrious) | Hugging Face |
| PrismPalette ANIMA v1 (Noginowa) | Difusion texto-a-imagen (version refinada de alpha-mix-anima-01) | no disponible | no aplica | no disponible | Hugging Face |
| Modelos base Anima (CircleStone Labs) | Difusion texto-a-imagen | no disponible | no aplica | CircleStone Labs Non-Commercial License v1.2 | Hugging Face |
| Modelos base Illustrious | Difusion texto-a-imagen | no disponible | no aplica | Fair AI Public License 1.0-SD | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como repositorio de pruebas; no hay garantia de estabilidad ni de soporte a largo plazo.
- Licencia restrictiva: las variantes Anima se acogen a la CircleStone Labs Non-Commercial License v1.2, que prohibe el uso comercial; las variantes Illustrious usan la Fair AI Public License 1.0-SD. Es imprescindible revisar ambas antes de cualquier uso en produccion.
- Idioma: solo se declara soporte de ingles (`language: en`); los prompts en otros idiomas pueden degradar la calidad.
- Riesgo de sesgos y contenido: al derivar de modelos de ilustracion, puede reproducir sesgos estilisticos y de representacion de los modelos base; no se documentan mitigaciones.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir imagenes incoherentes o anatomicamente incorrectas, especialmente con prompts ambiguos o ajustes de CFG fuera del rango recomendado.
- Informacion tecnica incompleta: no se publican parametros, datos de entrenamiento, benchmarks ni requisitos de hardware, lo que dificulta una evaluacion rigurosa.
- Variantes deprecadas o discontinuadas: varias entradas (`alpha-mix-ill-01`, `-03`, `kirakira-mix-ill-01`) estan marcadas como deprecadas o discontinuadas; conviene evitar su uso en nuevos proyectos.
- Configuracion de inferencia truncada: la tabla de parametros recomendados de la model card aparece incompleta, por lo que no se conocen todos los ajustes sugeridos (sampler, scheduler, pasos).
- Tamano del repositorio: 179,1 GB complican la descarga y el almacenamiento; conviene descargar solo los ficheros de la variante deseada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Noginowa/merge-experiment
- Modelo refinado PrismPalette ANIMA v1: https://huggingface.co/Noginowa/PrismPalette-ANIMA
- Repositorio de componentes Anima (text encoder y VAE): https://huggingface.co/circlestone-labs/Anima
- Licencia CircleStone Labs Non-Commercial License v1.2: https://huggingface.co/circlestone-labs/Anima/blob/main/LICENSE.md
- Licencia Fair AI Public License 1.0-SD: https://freedevproject.org/faipl-1.0-sd/
