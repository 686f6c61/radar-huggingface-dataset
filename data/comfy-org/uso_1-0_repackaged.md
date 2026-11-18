# Comfy-Org/USO_1.0_Repackaged

## Resumen

USO 1.0 (Unified Style and Subject-Driven Generation) es un conjunto de pesos de difusion para generacion de imagenes condicionada por referencia visual, desarrollado originalmente por ByteDance Research. El repositorio `Comfy-Org/USO_1.0_Repackaged` no contiene el modelo completo, sino un reempaquetado de los ficheros necesarios para su uso dentro de ComfyUI: una LoRA (`uso-flux1-dit-lora-v1.safetensors`) y un proyector (`uso-flux1-projector-v1.safetensors`), ambos en formato safetensors y con un tamano total de repositorio de 0,5 GB.

El modelo resuelve la tarea de transferencia de estilo y sujeto a partir de una imagen de referencia, apoyandose en el modelo base Flux.1 Dev. El flujo tipico consiste en cargar Flux.1 Dev como difusor principal, aplicar la LoRA de USO sobre su bloque DiT y usar el proyector para alinear las caracteristicas de la imagen de referencia con el espacio latente del modelo generativo.

Es relevante porque permite a los usuarios de ComfyUI incorporar generacion condicionada por referencia sin necesidad de gestionar el repositorio original de ByteDance ni sus dependencias de investigacion. La licencia Apache 2.0 facilita su integracion en productos comerciales, siempre que se respeten las condiciones del modelo base Flux.1 Dev, que se distribuye bajo su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (LoRA sobre el DiT de Flux.1 Dev mas proyector de referencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los ficheros distribuidos son safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA y model patch) |

## Arquitectura y entrenamiento

USO se construye sobre Flux.1 Dev, un transformer de difusion (DiT) para generacion de imagenes texto-a-imagen. El reempaquetado incluye dos componentes: una LoRA que se inyecta en el DiT de Flux y un proyector que transforma las caracteristicas extraidas de una imagen de referencia en una representacion compatible con el espacio latente del modelo. El workflow oficial de ComfyUI (`flux1_dev_uso_reference_image_gen.json`) demuestra el uso conjunto de ambos ficheros para generar imagenes que preservan el sujeto o el estilo de la referencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales en la informacion proporcionada. El repositorio es un reempaquetado de inferencia, no una publicacion de entrenamiento, por lo que los detalles de entrenamiento deben consultarse en el repositorio original de ByteDance Research.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por una imagen de referencia.
- Transferencia de sujeto: mantiene la identidad de un objeto o personaje presente en la referencia.
- Transferencia de estilo: aplica la estetica o el tratamiento visual de la imagen de referencia.
- Integracion nativa con ComfyUI mediante nodos de carga de LoRA y model patch.
- Compatibilidad con el ecosistema Flux.1 Dev, incluyendo sus workflows y herramientas de muestreo.
- No se ha documentado soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingues: no aplica al ser un modelo de difusion; los prompts se gestionan a traves del text encoder de Flux.1 Dev.

## Casos de uso

- Generacion de retratos consistentes de personajes: usar una foto de referencia junto con la LoRA y el proyector para producir nuevas imagenes del mismo personaje en escenas distintas, util en ilustracion y narrativa visual.
- Transferencia de estilo en diseno grafico: aplicar el estilo de una referencia (paleta, textura, iluminacion) a nuevas composiciones manteniendo el contenido indicado en el prompt.
- Prototipado de producto: generar variaciones de un objeto a partir de una foto de referencia para catalogos y mockups, con control sobre el fondo y la iluminacion via prompt.
- Creacion de assets para videojuegos: producir variaciones de un personaje o props manteniendo coherencia visual entre iteraciones dentro de un pipeline de ComfyUI.
- Edicion y extension de imagenes existentes: combinar la referencia con prompts para recontextualizar un sujeto en nuevos entornos sin perder sus rasgos distintivos.
- Flujos automatizados de contenido: integrar el workflow de ComfyUI en pipelines por lotes para generar imagenes condicionadas por referencia a partir de una base de datos de imagenes fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para este reempaquetado; depende del modelo base Flux.1 Dev sobre el que se aplica. La LoRA y el proyector anaden una sobrecarga reducida (repo de 0,5 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada; en la practica, el requisito dominante es el de Flux.1 Dev, no el de la LoRA.
- Cabe en GPU consumer: no disponible; condicionado por el modelo base Flux.1 Dev.
- Opciones de despliegue: ComfyUI (flujo oficial documentado). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| USO 1.0 (este repo) | LoRA + proyector sobre Flux.1 Dev | no disponible | no disponible | Apache 2.0 | Hugging Face (reempaquetado ComfyUI) |
| bytedance-research/USO (original) | Modelo completo de referencia | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Flux.1 Dev | DiT texto-a-imagen | no disponible | no disponible | licencia propia de Flux.1 Dev | Hugging Face / BFL |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autonomo: requiere Flux.1 Dev como base y el entorno ComfyUI para funcionar.
- La licencia Apache 2.0 del reempaquetado no sustituye a la licencia del modelo base Flux.1 Dev; el uso comercial esta condicionado por ambas.
- No se documentan sesgos especificos, pero al heredar el comportamiento de Flux.1 Dev y de sus datos de entrenamiento, pueden aparecer sesgos de representacion y estilisticos.
- Riesgo de alucinacion visual: la generacion condicionada por referencia puede desviarse del sujeto o estilo original, especialmente con referencias ambiguas o prompts contradictorios.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del text encoder con prompts en castellano.
- No se dispone de datos de benchmarks, latencia ni requisitos de VRAM especificos de este reempaquetado.
- El repositorio se actualizo por ultima vez en septiembre de 2026; conviene verificar la compatibilidad con la version actual de ComfyUI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/USO_1.0_Repackaged
- Modelo original: https://huggingface.co/bytedance-research/USO
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow oficial Flux.1 Dev USO Reference Image Generation: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/flux1_dev_uso_reference_image_gen.json
