# openvivo/BluePixel-Turbo

## Resumen

BluePixel-Turbo es un modelo de edicion de imagen guiada por instrucciones desarrollado por vivo, presentado como la version destilada del sistema BluePixel descrito en el articulo "BluePixel: Toward Native 4K Agentic Image Editing". Se construye sobre FLUX.2-klein-9B y anade un autoencoder DCAE-F64 disenado para editar de forma nativa a resolucion 4K, sin recurrir a pipelines de superresolucion en cascada. El modelo resuelve el problema de la edicion de imagen de alta resolucion con coste de inferencia contenido: pasa de un profesor de 50 pasos a 4 pasos de muestreo mediante destilacion.

La relevancia actual del modelo esta en su combinacion de resolucion nativa 4K, inferencia en 4 pasos y aprendizaje de habilidades de edicion de cola larga mediante ACE-MOPD, seguido de refuerzo para estetica y fidelidad a la instruccion. La arquitectura se apoya en el transformer de FLUX.2-klein-9B (233 tensores, 36.314.324.992 bytes de pesos) con un total de 9.078.581.248 parametros reportados en safetensors. El repositorio ocupa 91,7 GB e incluye transformer, text encoder, VAE y tokenizer en formato diffusers.

El checkpoint publicado corresponde a la revision v2 (STEP-35), un ajuste fino sobre los pesos del transformer sin cambios de arquitectura ni de configuracion de formas. Es un modelo solo para ingles, con licencia no comercial heredada de FLUX, orientado a edicion image-to-image y no a generacion desde texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (base FLUX.2-klein-9B) con autoencoder DCAE-F64 |
| Parametros totales | 9.078.581.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; entrada por instruccion de texto e imagen) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; inferencia prevista en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | flux-non-commercial-license (FLUX Non-Commercial License) |
| Formato de pesos | safetensors (formato diffusers, 10 shards en transformer) |

## Arquitectura y entrenamiento

BluePixel-Turbo es un modelo de difusion para edicion de imagen construido sobre el transformer de FLUX.2-klein-9B, con 233 tensores y un tamano total de pesos de 36.314.324.992 bytes. Incorpora un autoencoder DCAE-F64 que permite trabajar de forma nativa a 4K sin superresolucion en cascada. La inferencia se realiza con 4 pasos de muestreo mediante proyeccion de objetivo anclada a la fuente (SATP, source-anchored target projection), destilada desde un profesor de 50 pasos. El pipeline preserva aproximadamente la relacion de aspecto de la entrada y alinea las dimensiones a multiplos de 64, de modo que las entradas no cuadradas producen salidas no cuadradas.

El entrenamiento utiliza el dataset VINS-120K y combina varias fases: aprendizaje de habilidades de edicion de cola larga mediante ACE-MOPD y, posteriormente, aprendizaje por refuerzo orientado a estetica y fidelidad a la instruccion. La revision v2 (STEP-35) solo reentrena los pesos del transformer; el text encoder (5 shards), el VAE y el tokenizer son byte-identicos a la version anterior. El campo `torch_dtype` del config del transformer registra bfloat16 como dtype de inferencia previsto, aunque los pesos publicados se almacenan en float32.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural (instruction-based image editing).
- Salida nativa a resolucion 4K (por ejemplo, `target_pixels=4096*4096`) sin cascada de superresolucion.
- Inferencia en 4 pasos de muestreo con `guidance_scale` configurable (3.0 en el ejemplo oficial).
- Edicion image-to-image preservando la relacion de aspecto de la entrada.
- Habilidades de edicion de cola larga aprendidas mediante ACE-MOPD.
- Ajuste estetico y de fidelidad a la instruccion mediante aprendizaje por refuerzo (planificado y parcialmente aplicado segun la model card).
- Soporte de LoRA mediante el parametro `lora_scale` del pipeline.
- Reduccion de memoria del autoencoder mediante `vae_tiling`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo; el articulo describe un framework "Agent" de BluePixel, pero no se detalla en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Edicion fotografica profesional a alta resolucion: el modelo permite modificar una imagen 4K (por ejemplo, cambiar la iluminacion o el color del cielo) en 4 pasos, manteniendo la consistencia de las regiones no editadas, lo que encaja en flujos de retoque donde la superresolucion posterior seria costosa.
- Postproduccion de material de stock y publicidad: al preservar la relacion de aspecto y alinear a multiplos de 64, se puede integrar en pipelines que generan variantes de una misma imagen para campanas, con instrucciones en ingles.
- Prototipado rapido de cambios de estilo en estudios de diseno: con 4 pasos y un coste de inferencia bajo, el equipo puede iterar sobre instrucciones ("make the sky sunset orange and add warm light") y revisar resultados antes de un acabado manual.
- Automatizacion de tareas de edicion repetitivas: cambios de color, iluminacion o elementos concretos sobre lotes de imagenes 4K, usando el pipeline de diffusers dentro de un script de procesamiento por lotes.
- Investigacion en edicion de imagen por instrucciones: el modelo sirve como referencia destilada de 4 pasos para comparar con profesores de 50 pasos y estudiar el efecto de SATP y ACE-MOPD.
- Evaluacion de consistencia en regiones no editadas: su metrica NC de 9,06 en VINS-4KEval++ lo hace util en entornos donde se exige que el resto de la imagen permanezca intacto, como documentacion tecnica o imagenes medicas no criticas (con revision humana obligatoria).
- Integracion en herramientas creativas con LoRA: el soporte de `lora_scale` permite adaptar el modelo a estilos concretos de un estudio sin reentrenar el transformer completo.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al sistema BluePixel en la pagina del proyecto; la pagina no asigna cada puntuacion especificamente a este checkpoint Turbo.

| Benchmark | Metrica / categoria | Resultado |
|---|---|---|
| VINS-4KEval++ | Overall | 8,62 (2.º de 7 modelos) |
| VINS-4KEval++ | Consistencia en regiones no editadas (NC) | 9,06 |
| ImgEdit-Bench | Hybrid / Action | 4,59 / 4,93 (1.º en ambas) |
| CIE-Bench | Total, antes → despues de ACE-MOPD | 6,24 → 8,87 |

Latencia reportada: 8,7 segundos por edicion 4K en una sola XPU Kunlunxin P800 en BF16, segun la pagina del proyecto; la latencia varia segun el hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 91,7 GB y el transformer solo pesa 36,3 GB en float32; en bfloat16 el transformer ronda los 18 GB, a lo que hay que sumar text encoder y VAE. El uso de `vae_tiling=True` reduce el consumo del autoencoder.
- GPU recomendadas: no se especifican en la informacion proporcionada. El ejemplo oficial usa un entorno CUDA con soporte BF16 (`device="cuda:0"`).
- Cabe en GPU consumer: no confirmado. Por el tamano del transformer en BF16 y el text encoder adicional, es probable que requiera GPUs de gama alta con 24 GB o mas, pero no hay dato oficial.
- Opciones de despliegue: pipeline personalizado basado en Diffusers incluido en el repositorio de codigo (`vins_infer.load_pipeline`), con `snapshot_download` de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: 8,7 s por edicion 4K en Kunlunxin P800 XPU en BF16; sin datos de throughput para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BluePixel-Turbo | 9.078.581.248 | 4K nativo, 4 pasos | VINS-4KEval++ 8,62; ImgEdit-Bench 4,59/4,93 | FLUX Non-Commercial | Hugging Face (openvivo/BluePixel-Turbo) |
| FLUX.2-klein-9B (modelo base) | 9B (aproximado) | no disponible | no disponible | FLUX (segun modelo base) | Hugging Face (black-forest-labs/FLUX.2-klein-9B) |
| Alternativas de edicion por instrucciones de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de FLUX.2-klein-9B ni de otras alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia no comercial: los pesos estan sujetos a la FLUX Non-Commercial License, lo que restringe el uso comercial sin acuerdo adicional.
- Solo admite instrucciones en ingles; no hay soporte multilingue declarado.
- Puede producir artefactos o cambios no intencionados en la imagen; la model card recomienda revisar los resultados antes de usarlos.
- La pagina del proyecto no asigna las puntuaciones de benchmark especificamente al checkpoint Turbo, por lo que los numeros pueden corresponder al sistema BluePixel completo.
- La revision v2 es un checkpoint intermedio sin post-entrenamiento adicional completo; el refuerzo para estetica y fidelidad esta planificado, no necesariamente finalizado.
- El modelo esta pensado para edicion image-to-image, no para generacion desde texto.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni comportamiento en dominios especializados.
- El pipeline requiere una version de Diffusers que incluya los componentes de FLUX.2 importados por `vins_infer.py`, y el codigo debe ejecutarse desde el repositorio clonado.
- Los pesos se almacenan en float32 aunque la inferencia prevista es bfloat16; hay que gestionar la conversion y el consumo de memoria en consecuencia.

## Enlaces

- Hugging Face: https://huggingface.co/openvivo/BluePixel-Turbo
- Pagina del proyecto: https://tech.vivo.com/BluePixel/
- Articulo: https://arxiv.org/abs/2610.19882
- Codigo: https://github.com/vivo/BluePixel
- Dataset: https://huggingface.co/datasets/openvivo/VINS-120K
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Licencia: LICENSE.md (en el repositorio de Hugging Face)
