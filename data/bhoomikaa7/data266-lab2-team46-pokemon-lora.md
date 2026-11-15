# bhoomikaa7/data266-lab2-team46-pokemon-lora

## Resumen

`bhoomikaa7/data266-lab2-team46-pokemon-lora` es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusion Stable Diffusion 1.5, especializado en la generacion de imagenes con el estilo artistico del conjunto de datos Pokemon BLIP captions. Lo desarrolla el usuario bhoomikaa7 en el contexto de la asignatura DATA 266 (Lab 2, parte 2), y su proposito es demostrar un flujo completo de fine-tuning de modelos texto-a-imagen sobre un dataset pequeno y con captions generadas automaticamente. No es un modelo fundacional nuevo, sino un adaptador de bajo rango que modifica los pesos del UNet de SD 1.5 para sesgar la generacion hacia un estilo visual concreto.

El adaptador tiene un rango LoRA de 8 con alpha 8, lo que se traduce en 1.594.368 parametros entrenables. Se entreno durante 2000 pasos sobre 743 imagenes de entrenamiento (de un total de 825 tras limpieza) procedentes de `reach-vb/pokemon-blip-captions`, a resolucion 512x512 y en precision fp16. El resultado reportado por el autor es una mejora sustancial en la metrica KID frente a las imagenes de test (de 0,0814 a 0,0345), a costa de una ligera perdida de alineacion texto-imagen medida con CLIP score.

Su relevancia es fundamentalmente academica y metodologica: documenta de forma transparente el dataset, la configuracion de entrenamiento, las metricas de evaluacion y las limitaciones, incluyendo un analisis de memorizacion. No esta pensado para produccion ni para uso comercial, dado que hereda la licencia CreativeML Open RAIL-M y que los disenos de personajes Pokemon estan protegidos por copyright de Nintendo, Creatures y GAME FREAK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5 (difusion latente) |
| Parametros totales | 1.594.368 parametros entrenables (adaptador LoRA); el modelo base SD 1.5 no se incluye en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen, sin ventana de contexto de tokens de texto variable; SD 1.5 usa CLIP con limite de 77 tokens por prompt) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en fp16; el modelo base admite fp16, fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponible (los prompts de entrenamiento estan en ingles; el modelo base SD 1.5 esta orientado a ingles) |
| Licencia | CreativeML Open RAIL-M (heredada de SD 1.5); uso solo para investigacion no comercial |
| Formato de pesos | safetensors (formato nativo de diffusers para pesos LoRA; el repo incluye la subcarpeta `run1_lora_r8`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Stable Diffusion 1.5, un modelo de difusion latente compuesto por un autoencoder VAE, un UNet con atencion cruzada y un codificador de texto CLIP. La tecnica LoRA introduce matrices de bajo rango en las capas del UNet, de modo que solo se entrenan 1.594.368 parametros mientras el resto del modelo permanece congelado. El rango es 8 y alpha 8, lo que mantiene la magnitud de la actualizacion controlada. El entrenamiento se realizo a 512x512, en fp16 con gradient checkpointing activado, con un pico de memoria de 4,103 GB en una Tesla T4 y un tiempo total de 69,33 minutos (1,1556 GPU-horas).

Los datos proceden de `reach-vb/pokemon-blip-captions`: se cargaron 833 filas, se descartaron 8 imagenes duplicadas (0 corruptas) y quedaron 825, divididas en 743 de entrenamiento y 82 de test con semilla 266. Las captions son generadas automaticamente por BLIP y describen color y forma, no identidad, por lo que el adaptador aprende el estilo artistico mas que personajes concretos. La optimizacion uso tasa de aprendizaje 1e-4 con schedule constante, 2000 pasos, batch efectivo de 4 (1 x 4 de acumulacion) y semilla 266. No se menciona uso de RLHF, DPO ni tecnicas de preferencia; es un fine-tuning supervisado estandar sobre pares imagen-texto.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 con el estilo artistico del dataset Pokemon BLIP captions.
- Reproduccion del estilo visual (paleta, trazo, composicion) presente en las imagenes de entrenamiento.
- Generacion condicionada por prompt de texto en ingles, con el sampler y guidance configurables por el usuario.
- Compatibilidad con el ecosistema `diffusers` mediante `load_lora_weights`, lo que permite combinarlo con el pipeline de SD 1.5.
- Capacidad de composicion con otros LoRAs de SD 1.5 (no documentada por el autor, pero soportada por el formato).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es exclusivamente un generador de imagenes.
- Capacidades multilingues: no documentadas; el codificador CLIP de SD 1.5 esta orientado a ingles.

## Casos de uso

- Docencia y practicas de fine-tuning: el adaptador sirve como ejemplo reproducible de un pipeline completo (carga de dataset, limpieza, split, entrenamiento LoRA, evaluacion con KID y CLIP score) para asignaturas de aprendizaje automatico.
- Experimentacion con LoRA de bajo rango: permite estudiar el efecto del rango (8 frente a otras configuraciones) sobre la fidelidad al dominio y la diversidad, con metricas ya publicadas.
- Generacion de arte estilo Pokemon para prototipos no comerciales: util para maquetas, ilustraciones de trabajo o pruebas de concepto donde no se requiere un personaje concreto.
- Investigacion sobre memorizacion en modelos de difusion: el autor publica un analisis de similitud CLIP maxima (0,8833) frente a las imagenes de entrenamiento, util como caso de estudio.
- Benchmarking de metricas de evaluacion generativa: el par KID/CLIP score con prompts in-domain y out-of-domain fijos permite comparar metodologias de evaluacion.
- Base para experimentos de composicion de estilos: al ser un LoRA ligero, se puede combinar con otros adaptadores para explorar mezclas de estilo en entornos de investigacion.
- Pruebas de pipelines de inferencia con `diffusers` en GPUs de gama baja: el adaptador es minimo y el modelo base SD 1.5 cabe en GPUs consumer.

## Benchmarks y rendimiento

Evaluacion del autor sobre 82 imagenes de test y un conjunto de 20 prompts fijados antes del entrenamiento, 2 semillas por prompt, sampler DPMSolverMultistepScheduler, 30 pasos y guidance 7.5.

| Metrica | SD 1.5 base | Este adaptador |
|---|---|---|
| KID frente a imagenes de test (menor es mejor) | 0,081370 | 0,034464 |
| CLIP score, todos los prompts | 34,7259 | 33,3573 |
| CLIP score, in-domain | 33,6117 | 32,0844 |
| CLIP score, out-of-domain | 35,2413 | 35,1160 |
| Diversidad, LPIPS entre semillas | 0,7697 | 0,6874 |

Nota: la model card menciona en el apartado "Why this run" una diferencia de 5,51 puntos en CLIP in-domain (26,58 frente a 32,08) que no coincide con la tabla de resultados (33,61 frente a 32,08); se reproduce el dato tal cual aparece en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumio 4,103 GB de pico en una Tesla T4; la inferencia con SD 1.5 en fp16 requiere tipicamente entre 4 y 6 GB, y el adaptador anade un coste marginal despreciable.
- GPU recomendadas: Tesla T4 (validada por el autor para entrenamiento), asi como cualquier GPU con al menos 6 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en tarjetas con 6 GB o mas de VRAM en fp16; con cuantizaciones del modelo base puede reducirse aun mas.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (metodo documentado por el autor); el modelo base SD 1.5 es compatible con otros runners de la comunidad, aunque el adaptador solo se distribuye en formato diffusers.
- Latencia y throughput: no disponible; el autor solo reporta tiempo de entrenamiento (69,33 minutos en T4), no de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA SD 1.5, r=8) | LoRA sobre difusion latente | 1.594.368 entrenables | 512x512 | CreativeML Open RAIL-M (no comercial) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 base | Difusion latente | ~860M (UNet) | 512x512 | CreativeML Open RAIL-M | Hugging Face, ampliamente usado |
| SDXL | Difusion latente | ~2,6B (UNet) + refiner | 1024x1024 | CreativeML Open RAIL++-M | Hugging Face |
| Flux.1 [dev] | Difusion con transformer (MMDiT) | ~12B | 1024x1024+ | Licencia no comercial de Black Forest Labs | Hugging Face |

La comparativa se limita a modelos de la misma categoria (texto-a-imagen de difusion). No se dispone de datos de benchmarks cruzados entre este adaptador y las alternativas en la informacion proporcionada; los unicos numeros publicados son los de la tabla anterior frente a SD 1.5 base.

## Limitaciones y advertencias

- Entrenado sobre unos cientos de imagenes de un unico estilo artistico: los prompts fuera de ese estilo se sirven mejor con el modelo base, como refleja la metrica CLIP out-of-domain.
- Las captions son generadas automaticamente y describen color y forma, no identidad, por lo que el adaptador no renderiza de forma fiable un personaje con nombre.
- Los prompts con multiples sujetos o con conteo son debiles, porque las imagenes de entrenamiento son casi todas de un unico sujeto centrado.
- Analisis de memorizacion: en 10 generaciones in-domain, la similitud CLIP maxima con alguna de las 743 imagenes de entrenamiento fue de 0,8833 (media 0,6418), lo que indica cierto riesgo de reproduccion cercana a ejemplos vistos.
- Sesgos conocidos: no documentados explicitamente; al derivar de SD 1.5 y de un dataset de un solo estilo, hereda los sesgos del modelo base y del dataset.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido incoherente o no solicitado; el autor indica que las salidas se generaron con el safety checker de Stable Diffusion activado.
- Restricciones de licencia: CreativeML Open RAIL-M y uso solo para investigacion no comercial; los disenos de personajes Pokemon estan protegidos por copyright de Nintendo, Creatures y GAME FREAK, y la dataset card indica uso de investigacion.
- Caveat para produccion: repo con 0 descargas y 0 likes, sin mantenimiento posterior documentado, y con una inconsistencia numerica en la model card entre el apartado de seleccion y la tabla de resultados; no recomendado para uso productivo.

## Enlaces

- Hugging Face: https://huggingface.co/bhoomikaa7/data266-lab2-team46-pokemon-lora
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Paper de LoRA (referencia tecnica del metodo): https://arxiv.org/abs/2106.09685
- Paper de Stable Diffusion (Latent Diffusion Models): https://arxiv.org/abs/2112.10752
