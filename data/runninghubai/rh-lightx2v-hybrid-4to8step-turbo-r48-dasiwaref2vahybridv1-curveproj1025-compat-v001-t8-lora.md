# RunningHubAI/rh-lightx2v-hybrid-4to8step-turbo-r48-dasiwaref2vahybridv1-curveproj1025-compat-v001-t8-lora

## Resumen

`rh-lightx2v-hybrid-4to8step-turbo-r48-dasiwaref2vahybridv1-curveproj1025-compat-v001-t8-lora` es un adaptador LoRA publicado por RunningHubAI, una plataforma de entrenamiento y despliegue de modelos generativos. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de ajuste fino (906 MiB en formato `safetensors`, rango 48) pensado para cargarse sobre un modelo base de generacion de video, presumiblemente `minimax-h3` segun el campo "Finetuned from" de la model card.

El adaptador esta disenado para el ecosistema ComfyUI y para la propia plataforma RunningHub, y su nombre codifica varias pistas tecnicas: "lightx2v" (posiblemente una pipeline de video ligera), "hybrid-4to8step-turbo" (destilacion o aceleracion de muestreo en 4 a 8 pasos), "REF2VAHybridV1" (referencia a un esquema hibrido de imagen/video a video con audio) y "curveproj1025" (una proyeccion de curva en la capa de control). Es, por tanto, una pieza de infraestructura para acelerar y especializar la generacion de video, no un modelo autonomo.

Su relevancia es limitada fuera del ecosistema RunningHub/ComfyUI: no hay pipeline declarado, no hay licencia explicita, no hay idiomas declarados y el repositorio no incluye model card detallada ni benchmarks. La ficha que sigue refleja exclusivamente lo que consta en la informacion disponible, marcando como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre modelo base de video; base declarada: `minimax-h3`) |
| Parametros totales | No disponible (adaptador LoRA de rango 48; 906 MiB en safetensors) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | `safetensors` (archivo `lightx2v_hybrid-4to8step-Turbo_r48_DasiwaREF2VAHybridV1_curveproj1025_compat_v001-T8.safetensors`, 906 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su naturaleza LoRA (rango 48, segun el sufijo `r48` del nombre) y de su modelo base declarado, `minimax-h3`. El nombre sugiere una especializacion orientada a generacion de video con dos rasgos: un esquema "hybrid-4to8step-turbo" que apunta a destilacion para reducir el numero de pasos de muestreo a un rango de 4 a 8, y un componente "REF2VAHybridV1" que sugiere un pipeline hibrido de referencia a video con audio. El sufijo `curveproj1025` indica una proyeccion de curva, probablemente en el modulo de control de la LoRA.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. El autor indica que el modelo fue entrenado en RunningHub y que se puede reproducir el entrenamiento en su plataforma, pero no detalla hiperparametros, dataset ni metodologia. Tampoco se especifica si el adaptador incluye pesos para atencion, MLP o ambos.

## Capacidades

- Generacion y transformacion de video: el adaptador esta orientado a pipelines de video (sufijo `x2v`), presumiblemente video a video o referencia a video.
- Aceleracion del muestreo: el componente "4to8step-turbo" sugiere inferencia en 4 a 8 pasos, lo que reduce coste computacional frente a muestreos de decenas de pasos.
- Compatibilidad con ComfyUI: la etiqueta `comfyui` y el formato `safetensors` indican que se carga como nodo LoRA en flujos de ComfyUI.
- Integracion con RunningHub: el autor ofrece carga directa en su plataforma y una API para invocar el modelo.
- Soporte de audio: el componente "REF2VAHybrid" sugiere generacion o condicionamiento con audio, aunque no se detalla.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible.

## Casos de uso

- Aceleracion de pipelines de generacion de video en ComfyUI: cargar el LoRA sobre el modelo base para reducir el numero de pasos de muestreo a 4-8, disminuyendo el tiempo de inferencia en produccion de video corto.
- Prototipado rapido de video generativo: usar el adaptador en RunningHub para iterar sobre prompts y estilos sin montar infraestructura propia.
- Conversion de referencia a video con audio: emplear el componente "REF2VAHybrid" para tareas de imagen/video de referencia a video con pista de audio asociada, si el pipeline base lo soporta.
- Integracion via API en productos de creacion de contenido: invocar el modelo a traves de la API de RunningHub para generar clips en aplicaciones de marketing o redes sociales.
- Investigacion sobre destilacion de pasos en difusion de video: usar el adaptador como punto de partida para estudiar el compromiso entre calidad y numero de pasos de muestreo.
- Experimentacion con LoRA de rango 48: evaluar el efecto del rango y de la proyeccion de curva (`curveproj1025`) en la fidelidad del ajuste fino sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador pesa 906 MiB, pero el consumo real depende del modelo base `minimax-h3` y del pipeline de video, que no se detallan.
- GPU recomendadas: no disponible. Para modelos de video de esta categoria se suele requerir GPU de datacenter (A100, H100) o consumer de gama alta (RTX 4090), pero el autor no lo especifica.
- Cabe en consumer GPU: no disponible.
- Opciones de despliegue: ComfyUI (declarado), RunningHub (plataforma del autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusion de video.
- Latencia y throughput: no disponible. El nombre sugiere inferencia en 4-8 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (LoRA de aceleracion para video) ni datos de rendimiento que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, pero no la concreta. No se puede asumir uso comercial sin verificar la licencia de `minimax-h3` y de RunningHub.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere `minimax-h3` y presumiblemente un pipeline concreto de ComfyUI o RunningHub.
- Sin model card detallada: no hay informacion sobre dataset, hiperparametros, sesgos ni evaluacion cualitativa.
- Riesgo de artefactos y alucinacion visual: al ser un adaptador de difusion de video, puede generar inconsistencias temporales, artefactos y contenido no fiel a la referencia; no hay evaluacion publicada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-05): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- Idiomas no declarados: no se puede garantizar el comportamiento con prompts en castellano u otros idiomas.
- Sin soporte declarado de tool calling ni agentes: no es un modelo de lenguaje y no debe evaluarse como tal.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-lightx2v-hybrid-4to8step-turbo-r48-dasiwaref2vahybridv1-curveproj1025-compat-v001-t8-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2095739294899068929
- Pagina del autor: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-lightx2v-hybrid-4to8step-turbo-r48-dasiwaref2vahybridv1-curveproj1025-compat-v001-t8-lora/blob/main/README_cn.md
