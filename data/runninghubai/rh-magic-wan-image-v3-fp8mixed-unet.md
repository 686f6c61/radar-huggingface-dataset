# RunningHubAI/rh-magic-wan-image-v3-fp8mixed-unet

## Resumen

rh-magic-wan-image-v3-fp8mixed-unet es un ajuste fino (finetune) del modelo de generacion de video WAN2.2, publicado por RunningHubAI. Se distribuye como un unico fichero de pesos UNET en formato safetensors, cuantizado en FP8 mixto, y esta pensado para cargarse dentro de ComfyUI o en la plataforma RunningHub. El pipeline declarado es text-to-video, aunque el nombre del modelo ("image") sugiere que el ajuste esta orientado a la generacion de video condicionada por imagen; la model card no aclara esta discrepancia.

El repositorio contiene exclusivamente los pesos del UNET (13.853 MiB, unos 14,5 GB de repo completo). No incluye VAE, text encoder ni configuracion de pipeline, por lo que no es un modelo autocontenido: requiere el resto de componentes del ecosistema WAN2.2 para funcionar. Esto lo convierte en un artefacto de despliegue mas que en un modelo independiente.

La relevancia es practica: permite ejecutar un finetune de WAN2.2 en FP8 con menor huella de VRAM que los pesos originales, dentro del flujo de trabajo habitual de ComfyUI. No obstante, la informacion publicada es muy escasa: no hay licencia explicita, ni idiomas, ni benchmarks, ni detalles de entrenamiento mas alla de "Finetuned from: WAN2.2".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (derivada de WAN2.2); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica a difusion de video; resolucion y duracion no especificadas) |
| Tipos de cuantizacion | FP8 mixto (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Magic-Wan-Image-V3-fp8mixed.safetensors`, 13.853 MiB) |

## Arquitectura y entrenamiento

El modelo es un UNET de difusion ajustado a partir de WAN2.2, segun declara el autor. La unica innovacion tecnica documentada es la cuantizacion FP8 mixta de los pesos, que reduce el tamano del fichero a unos 13,5 GB. No se especifica que capas se mantienen en mayor precision ni el esquema exacto de la mezcla.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens o muestras, la resolucion de video utilizada, la duracion de los clips, ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en difusion). Tampoco se detalla el proceso de finetune (LoRA fusionado, full finetune, etc.). Toda esta seccion queda, por tanto, sin datos verificables.

## Capacidades

- Generacion de video a partir de texto (pipeline declarado como text-to-video).
- Ajuste orientado a imagen segun el nombre del modelo (image-to-video o condicionamiento por imagen), aunque no confirmado en la model card.
- Integracion con ComfyUI como nodo de carga de UNET.
- Ejecucion en la plataforma RunningHub y via su API.
- Cuantizacion FP8 mixta para reducir requisitos de VRAM frente a los pesos originales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generacion de clips de video en ComfyUI: cargar el UNET junto con el VAE y el text encoder de WAN2.2 para producir videos a partir de prompts de texto, aprovechando el flujo de nodos de ComfyUI.
- Produccion de video condicionada por imagen: si el ajuste es efectivamente image-to-video, animar fotografias o ilustraciones en pipelines creativos.
- Prototipado rapido de contenido audiovisual: usar la cuantizacion FP8 para iterar sobre prompts en GPUs de gama alta consumer sin cargar los pesos completos en BF16.
- Integracion via API de RunningHub: automatizar la generacion de video en aplicaciones web o backends sin gestionar infraestructura propia de GPU.
- Previsualizacion de storyboards: generar clips cortos para validar guiones o conceptos artisticos antes de una produccion mayor.
- Experimentacion en investigacion de difusion: servir como punto de partida para comparar el efecto de la cuantizacion FP8 mixta frente a los pesos originales de WAN2.2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos del UNET ocupan unos 13,5 GB en FP8; con activaciones y el resto de componentes (VAE, text encoder) se requiere previsiblemente mas de 16 GB, aunque no hay cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, GPUs con 24 GB o mas (RTX 4090, A100, H100) son las candidatas razonables.
- GPU consumer: probablemente no cabe en GPUs de 8-12 GB sin tecnicas adicionales de offloading; no confirmado.
- Despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub y su API. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (herramientas no aplicables a difusion de video en la mayoria de los casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-magic-wan-image-v3-fp8mixed-unet | UNET de difusion (finetune de WAN2.2) | no disponible | no disponible | no disponible | HuggingFace, ComfyUI, RunningHub |
| WAN2.2 (original) | Modelo de difusion de video | no disponible en esta ficha | no disponible | no disponible | Proyecto upstream |
| Alternativas de text-to-video open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo incompleto: solo incluye los pesos del UNET; requiere VAE, text encoder y configuracion de WAN2.2 para funcionar.
- Licencia no declarada: la model card remite a la licencia del proyecto original, lo que genera incertidumbre para uso comercial. Verificar la licencia de WAN2.2 antes de desplegar en produccion.
- Ambiguedad en la modalidad: el pipeline se declara text-to-video pero el nombre indica "image"; conviene validar el comportamiento real antes de integrarlo.
- Sin benchmarks ni evaluacion de calidad publicada: no hay evidencia objetiva de rendimiento frente al modelo base.
- Riesgo de sesgos y alucinacion visual: no documentado por el autor; aplican los sesgos tipicos de los datasets de video a gran escala.
- Sin informacion sobre idiomas de los prompts ni sobre resolucion o duracion maximas de los clips generados.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Cuantizacion FP8: puede producir perdida de calidad frente a los pesos en BF16, no cuantificada por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-magic-wan-image-v3-fp8mixed-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2042806114420527106
- Pagina del autor: https://www.runninghub.cn/user-center/2008002332583010306
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
