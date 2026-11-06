# openvivo/BluePixel-Turbo

## Resumen

BluePixel-Turbo es un modelo de edicion de imagen por instrucciones desarrollado por vivo, presentado en el paper "BluePixel: Toward Native 4K Agentic Image Editing" (arXiv:2610.19882). Se trata de un fine-tune destilado de FLUX.2-klein-9B que incorpora un autoencoder DCAE-F64 para realizar edicion nativa a 4K sin recurrir a superresolucion en cascada, y que reduce la inferencia a 4 pasos mediante source-anchored target projection (SATP) destilada desde un profesor de 50 pasos.

El modelo resuelve el coste computacional de la edicion de imagenes de alta resolucion: en lugar de generar a baja resolucion y escalar, opera directamente sobre el espacio latente de 4K con un autoencoder de compresion 64x. Segun la model card, alcanza 8,7 segundos por edicion 4K en una unica XPU Kunlunxin P800 en BF16, lo que lo posiciona como una alternativa practica para pipelines de edicion en produccion.

Es relevante ahora porque combina tres tendencias: edicion basada en instrucciones en lenguaje natural, resolucion nativa 4K y destilacion agresiva de pasos de muestreo. El checkpoint actual (v2, STEP-35) es una actualizacion intermedia de pesos del transformer sin post-entrenamiento adicional; el autor indica que planea anadir RL para calidad estetica y fidelidad a la instruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (fine-tune de FLUX.2-klein-9B) con autoencoder DCAE-F64 |
| Parametros totales | 9.078.581.248 (segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32, inferencia prevista en bfloat16) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusers, 10 shards en el transformer; text encoder en 5 shards) |

## Arquitectura y entrenamiento

BluePixel-Turbo parte de FLUX.2-klein-9B, un transformer de difusion para generacion y edicion de imagen, y lo especializa para edicion por instrucciones a resolucion nativa 4K. La innovacion arquitectonica principal es el autoencoder DCAE-F64, que comprime la imagen en un espacio latente de factor 64 y permite operar directamente sobre pixeles de 4K sin una etapa separada de superresolucion. El transformer conserva 233 tensores con un `total_size` de 36.314.324.992 bytes, identico entre la revision v1 y v2, lo que confirma que la actualizacion es un fine-tune puro de pesos sin cambios de forma ni de configuracion.

El entrenamiento combina tres tecnicas: destilacion profesor-alumno con source-anchored target projection (SATP), que reduce la inferencia de 50 a 4 pasos; aprendizaje de habilidades de edicion de cola larga mediante ACE-MOPD, con un salto reportado en CIE-Bench de 6,24 a 8,87; y reinforcement learning para estetica y fidelidad a la instruccion (planificado segun la model card, no incluido en el checkpoint v2 actual). El dataset de entrenamiento es openvivo/VINS-120K. La revision v2 (STEP-35) solo reemplaza los 10 shards del transformer; text encoder, VAE y tokenizer son byte-identicos a la v1.

## Capacidades

- Edicion de imagen basada en instrucciones en lenguaje natural (image-to-image con prompt textual).
- Generacion nativa a 4K sin superresolucion en cascada, con preservacion aproximada del aspect ratio de entrada y dimensiones alineadas a multiplos de 64.
- Inferencia en 4 pasos con `num_inference_steps=4` y `guidance_scale=3.0` en la configuracion recomendada.
- Edicion de cola larga: el entrenamiento con ACE-MOPD cubre instrucciones poco frecuentes mas alla de los casos comunes.
- Consistencia de regiones no editadas (metrica NC de 9,06 en VINS-4KEval++).
- Soporte de LoRA mediante el parametro `lora_scale` del pipeline (segun la API de `load_pipeline`).
- Soporte de VAE tiling (`vae_tiling=True`) para reducir uso de memoria del autoencoder.
- No soporta tool calling, agentes ni razonamiento multi-step en el sentido de un LLM; el termino "agentic" del paper se refiere al framework BluePixel Agent, no a capacidades de agente del checkpoint.
- Idioma de instrucciones: solo ingles.

## Casos de uso

- Edicion fotografica de alta resolucion en estudio: el modelo procesa imagenes de 4K nativas y permite instrucciones como cambiar la iluminacion o el cielo sin perder detalle, gracias al autoencoder DCAE-F64 y a la consistencia de regiones no editadas (NC 9,06).
- Retoque de producto en e-commerce: editar fondos, iluminacion o color de articulos manteniendo intacto el producto original, aprovechando la metrica de consistencia en regiones no editadas.
- Postproduccion en cine y publicidad: generar variantes de una misma toma a 4K en 4 pasos, con 8,7 s por edicion en una XPU P800, lo que permite iterar decenas de propuestas en una sesion.
- Automatizacion de catalogos de imagen: pipeline batch que aplica instrucciones estandarizadas (por ejemplo, "make the background white") sobre miles de imagenes 4K sin superresolucion posterior.
- Prototipado creativo en diseno grafico: el bajo numero de pasos y el soporte de LoRA permiten adaptar el estilo del modelo a una marca concreta y generar variaciones rapidas.
- Investigacion en edicion por instrucciones: el modelo sirve como baseline destilado de 4 pasos para comparar con profesores de 50 pasos y estudiar el efecto de SATP y ACE-MOPD.
- Edicion interactiva en aplicaciones de escritorio o web: la inferencia en 4 pasos reduce la latencia lo suficiente para un flujo de "instruir y ver resultado" casi en tiempo real, siempre que se disponga de GPU con BF16.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a BluePixel en la pagina del proyecto; la propia card advierte que no asigna cada puntuacion especificamente al checkpoint Turbo.

| Benchmark | Metrica / categoria | Resultado |
|---|---|---|
| VINS-4KEval++ | Overall | 8,62 (2.º de 7 modelos) |
| VINS-4KEval++ | Consistencia de region no editada (NC) | 9,06 |
| ImgEdit-Bench | Hybrid / Action | 4,59 / 4,93 (1.º en ambas) |
| CIE-Bench | Total, antes → despues de ACE-MOPD | 6,24 → 8,87 |

Rendimiento de inferencia reportado: 8,7 segundos por edicion 4K en una unica XPU Kunlunxin P800 en BF16, con 4 pasos de muestreo. La latencia varia segun hardware.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El transformer ocupa 36,3 GB en float32 (pesos publicados); en BF16 se reduce a aproximadamente la mitad. El repo completo pesa 91,7 GB e incluye text encoder y VAE.
- GPU recomendadas: el ejemplo oficial usa CUDA con soporte BF16 (`device="cuda:0"`); el benchmark se ejecuto en XPU Kunlunxin P800. Para 4K nativo se requiere memoria considerable; `vae_tiling=True` reduce el consumo del autoencoder.
- GPU de consumo: no disponible confirmacion de que quepa en RTX 4090 u otras consumer; por el tamano de pesos en BF16 es previsible que requiera mas de 24 GB, pero no hay dato oficial.
- Opciones de despliegue: pipeline custom basado en Diffusers (`vins_infer.load_pipeline`) desde el repositorio github.com/vivo/BluePixel. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion).
- Latencia y throughput: 8,7 s por edicion 4K en XPU P800 BF16 con 4 pasos. No se publican cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BluePixel-Turbo | 9,08 B | 4K nativo | Edicion por instrucciones, 4 pasos, destilado | Apache-2.0 | Hugging Face (openvivo/BluePixel-Turbo) |
| FLUX.2-klein-9B (modelo base) | 9 B | no disponible | Generacion/edicion de imagen | no disponible en la informacion | Hugging Face (black-forest-labs/FLUX.2-klein-9B) |
| Alternativas de edicion por instrucciones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos competidores directos para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo acepta instrucciones en ingles; no hay soporte multilingue declarado.
- Puede producir artefactos o cambios no deseados en la imagen; la model card recomienda revisar los resultados antes de usarlos.
- El checkpoint v2 (STEP-35) es una version intermedia sin post-entrenamiento; el autor indica que el RL para estetica y fidelidad a la instruccion esta planificado pero no incluido.
- Las puntuaciones de benchmarks corresponden a BluePixel en la pagina del proyecto y no estan atribuidas especificamente al checkpoint Turbo.
- Los pesos se publican en float32 aunque el `config.json` declara `torch_dtype: bfloat16`; hay que gestionar la conversion a BF16 en el pipeline de inferencia.
- Requiere un pipeline custom (`vins_infer.py`) y una version de Diffusers que incluya los componentes de FLUX.2; no es un pipeline estandar de Diffusers.
- El termino "agentic" del paper se refiere al framework BluePixel Agent, no a capacidades de agente del checkpoint.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar LICENSE y NOTICE del repositorio de codigo.
- Riesgo de sesgos y alucinacion visual no cuantificado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openvivo/BluePixel-Turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/openvivo/VINS-120K
- Paper: https://arxiv.org/abs/2610.19882
- Codigo: https://github.com/vivo/BluePixel
- Pagina del proyecto: https://tech.vivo.com/BluePixel/
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Licencia: https://github.com/vivo/BluePixel/blob/main/LICENSE
- NOTICE: https://github.com/vivo/BluePixel/blob/main/NOTICE
