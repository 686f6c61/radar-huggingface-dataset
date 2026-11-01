# neema30/data266-lab2-p2-ritika-lora-r8

## Resumen

`neema30/data266-lab2-p2-ritika-lora-r8` es un adaptador LoRA de rango 8 entrenado sobre el modelo de difusion `stable-diffusion-v1-5` para generacion de imagenes texto-a-imagen. Lo desarrolla Ritika Neema en el contexto del laboratorio DATA 266 (Lab 2, equipo 05), y su proposito es especializar el UNet de Stable Diffusion 1.5 en el estilo visual del conjunto de datos `reach-vb/pokemon-blip-captions`. No es un modelo completo, sino un conjunto de pesos de bajo rango que se acoplan a las proyecciones de atencion del UNet.

El adaptador entrena unicamente 1.594.368 parametros, lo que lo convierte en un artefacto muy ligero (repo de 0,0 GB) y apto para entrenamiento e inferencia en hardware modesto: el autor reporta un pico de 2,55 GB de VRAM en una Tesla T4 y 25,34 minutos de entrenamiento. Su relevancia es fundamentalmente pedagogica y de experimentacion: demuestra un flujo completo de fine-tuning con PEFT sobre difusion, con metricas de evaluacion reproducibles (KID, CLIP score, LPIPS).

La limitacion principal es que su licencia efectiva queda condicionada por el dataset de entrenamiento (CC BY-NC-SA 4.0, solo uso no comercial) ademas de la licencia del modelo base (CreativeML OpenRAIL-M). No dispone de descargas ni likes en el momento de la consulta, lo que refleja su caracter de entrega academica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre UNet de Stable Diffusion 1.5; modulos objetivo `to_q`, `to_k`, `to_v`, `to_out.0` |
| Parametros totales | 1.594.368 parametros entrenables (adaptador); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-a-imagen; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (los prompts del dataset estan en ingles, pero no se declara soporte multilingue) |
| Licencia | creativeml-openrail-m (modelo base); dataset de entrenamiento CC BY-NC-SA 4.0 (no comercial) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) |
| Rango LoRA / alpha | r=8 / lora_alpha=8, `use_dora=False` |
| Resolucion de entrenamiento | 512 px |
| Optimizador / LR | AdamW / 0.0001 |
| Pasos / batch efectivo | 1200 pasos, batch 2 x 2 acumulacion = 4 |
| Semillas | entrenamiento 266, split 266 |
| Pico de VRAM en entrenamiento | 2,55 GB (Tesla T4) |
| Tiempo de entrenamiento | 25,34 min (0,4223 GPU-horas) |
| Dataset | `reach-vb/pokemon-blip-captions` |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA sobre el UNet de Stable Diffusion 1.5: se insertan matrices de bajo rango en las proyecciones de atencion `to_q`, `to_k`, `to_v` y `to_out.0`, con rango 8 y alpha 8, sin DoRA. El modelo base es un UNet de difusion latente condicionado por texto mediante CLIP, y el adaptador modifica exclusivamente la atencion cruzada y de autoatencion del UNet, dejando intactos el VAE y el text encoder. Esto explica el bajo numero de parametros entrenables (1,59 M) y el reducido coste de almacenamiento.

El entrenamiento se realizo sobre `reach-vb/pokemon-blip-captions` a 512 px, con AdamW y tasa de aprendizaje 1e-4, durante 1200 pasos con batch efectivo 4 (2 x 2 de acumulacion). El autor documenta un pico de 2,55 GB de VRAM en Tesla T4 y un tiempo total de 25,34 minutos, lo que indica un pipeline de entrenamiento ligero y reproducible. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales; el objetivo es la especializacion estilistica mediante ajuste supervisado de difusion. La evaluacion se realizo con KID frente al split de test (0,06081 +/- 0,00695), CLIP score sobre 20 prompts x 2 semillas (0,3113) y LPIPS entre semillas (0,7438).

## Capacidades

- Generacion de imagenes texto-a-imagen a 512 px condicionada por prompts en lenguaje natural, heredando las capacidades del UNet de SD 1.5.
- Especializacion estilistica en la estetica del dataset Pokemon BLIP captions: el adaptador desplaza la distribucion de salida hacia ese estilo.
- Integracion en pipelines de `diffusers` mediante `pipe.unet.add_adapter` y `set_peft_model_state_dict`.
- Compatibilidad con el ecosistema PEFT (`peft.LoraConfig`), lo que permite cargar, mezclar o desactivar el adaptador sin duplicar el modelo base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion, no un LLM.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla de la condicion textual.
- Capacidades multilingues no documentadas; los prompts de entrenamiento estan en ingles.

## Casos de uso

- Experimentacion academica y docencia: reproduccion del flujo completo de fine-tuning LoRA sobre difusion con metricas KID, CLIP y LPIPS, util para asignaturas de aprendizaje automatico y vision por computador.
- Prototipado rapido de estilos visuales: generacion de ilustraciones con estetica tipo Pokemon para maquetas, pruebas de concepto o material interno no comercial.
- Investigacion sobre eficiencia de adaptadores: comparacion de rango 8 frente a otros rangos o tecnicas (DoRA, LoRA en text encoder) usando el mismo dataset y semillas, gracias a la reproducibilidad documentada.
- Generacion de datasets sinteticos de imagenes estilizadas para aumentar conjuntos de entrenamiento en tareas de clasificacion o deteccion con dominio artistico.
- Demostraciones de despliegue ligero: el adaptador se puede cargar sobre SD 1.5 en GPUs consumer (el entrenamiento cupo en 2,55 GB en T4), lo que facilita demos en portatiles con GPU modesta.
- Benchmarking de pipelines de difusion: uso como caso controlado para medir latencia, throughput y calidad con distintas configuraciones de sampler y pasos de inferencia.
- Educacion sobre licencias de datos: ejemplo practico de como la licencia no comercial del dataset condiciona el uso del adaptador resultante.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| KID vs split de test | 0,06081 +/- 0,00695 | Prompts in-domain |
| CLIP score | 0,3113 | 20 prompts x 2 semillas |
| LPIPS entre semillas | 0,7438 | Diversidad entre semillas |
| Parametros entrenables | 1.594.368 | Adaptador LoRA r=8 |
| Pico de VRAM (entrenamiento) | 2,55 GB | Tesla T4 |
| Tiempo de entrenamiento | 25,34 min (0,4223 GPU-h) | 1200 pasos, batch efectivo 4 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo de difusion) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un coste marginal sobre SD 1.5; el modelo base en fp16 requiere aproximadamente 4-6 GB de VRAM para generar a 512 px, y el adaptador anade unos pocos MB. No se documenta una cifra exacta de inferencia en la informacion disponible.
- GPU recomendadas: Tesla T4 (validada por el autor para entrenamiento), RTX 3060/4060 en adelante para inferencia comoda; A100/H100 no son necesarias dado el tamano del adaptador.
- Cabe en GPU consumer: si, el entrenamiento cupo en una T4 con 2,55 GB de pico; la inferencia sobre SD 1.5 es viable en GPUs con 6-8 GB de VRAM.
- Opciones de despliegue: `diffusers` + `peft` (flujo documentado por el autor); tambien es compatible con pipelines que carguen LoRA de SD 1.5 (por ejemplo, `load_lora_weights` en `diffusers`). No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neema30/data266-lab2-p2-ritika-lora-r8` | LoRA sobre SD 1.5 | 1,59 M entrenables | 512 px | CreativeML OpenRAIL-M + dataset no comercial | HuggingFace, 0 descargas |
| `stable-diffusion-v1-5/stable-diffusion-v1-5` (base) | Difusion latente completa | no disponible en la informacion | 512 px | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de SD 1.5 sobre Pokemon BLIP captions | LoRA sobre SD 1.5 | variable (miles a millones) | 512 px | Depende del autor y dataset | Disponibles en HuggingFace, no comparados aqui |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgo estilistico marcado hacia la estetica Pokemon: el autor indica explicitamente un sesgo hacia ese estilo y un rendimiento debil en prompts fuera de dominio.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente o no solicitado, especialmente con prompts alejados del dataset.
- Restriccion de licencia para uso comercial: el dataset `reach-vb/pokemon-blip-captions` es CC BY-NC-SA 4.0 (solo uso no comercial), lo que condiciona el uso del adaptador aunque el modelo base sea CreativeML OpenRAIL-M. El autor lo advierte de forma explicita.
- Limitaciones de idioma: no se documenta soporte multilingue; los prompts de entrenamiento estan en ingles y el comportamiento con otros idiomas no esta evaluado.
- Resolucion fija de 512 px: no se documenta soporte para resoluciones superiores ni para tecnicas como SDXL.
- Filtro de seguridad: las salidas fueron cribadas con el safety checker de Stable Diffusion, pero no se garantiza un filtrado completo en produccion.
- Artefacto de caracter academico: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento documentado ni versionado posterior.
- No apto para tareas de NLP: no es un LLM y no soporta razonamiento, codigo, tool calling ni agentes.

## Enlaces

- HuggingFace: https://huggingface.co/neema30/data266-lab2-p2-ritika-lora-r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Diffusers: https://github.com/huggingface/diffusers
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
