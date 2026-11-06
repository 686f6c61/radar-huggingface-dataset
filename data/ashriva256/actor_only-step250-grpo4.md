# ashriva256/ACTOR_ONLY-STEP250-GRPO4

## Resumen

ACTOR_ONLY-STEP250-GRPO4 es un delta de parametros entrenables (no un modelo autonomo) para ByteDance-Seed/BAGEL-7B-MoT, un modelo multimodal de tipo mixture-of-transformers desarrollado por ByteDance Seed. Lo publica el usuario ashriva256 en Hugging Face y su proposito es muy concreto: mejorar la generacion de descripciones de imagen (captioning) mediante aprendizaje por refuerzo con GRPO, donde la recompensa se calcula por la fidelidad con la que el propio BAGEL reconstruye la imagen a partir del caption generado.

El artefacto contiene 233 tensores y 39.004.736 parametros: un adaptador LoRA de rango 16 y alpha 32 sobre las proyecciones de atencion q/k/v/o del experto de comprension Qwen2, mas los modulos `llm2vae`, `vae2llm`, `latent_pos_embed` y `time_embedder` entrenados por completo. No es un adaptador PEFT estandar y no se puede cargar con `PeftModel.from_pretrained()`; requiere el modelo base y el codigo de BAGEL-VLM en una revision concreta.

Su relevancia es acotada pero interesante para investigadores: documenta un pipeline de RL cerrado sobre un modelo multimodal con cuantizacion NF4 y 7 GPUs, con una mejora medida de +3,25 puntos en el benchmark CompreCap (juez GPT-4o-mini) respecto al BAGEL base, y una degradacion a partir de 256 tokens de caption. Es material de investigacion reproducible, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Delta LoRA (r=16, alpha=32) sobre atencion del experto de comprension Qwen2 de BAGEL-7B-MoT, mas modulos de proyeccion y embeddings entrenados |
| Parametros totales | 39.004.736 (233 tensores) |
| Parametros activos | no disponible (no es MoE en si mismo; hereda la estructura MoT del modelo base) |
| Longitud de contexto | no disponible (depende del modelo base BAGEL-7B-MoT) |
| Tipos de cuantizacion | NF4 (usado durante entrenamiento e inferencia de referencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta ademas a los terminos del modelo base) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint es un delta de parametros sobre BAGEL-7B-MoT, un modelo multimodal que combina un experto de comprension basado en Qwen2 con un experto de generacion y un VAE, conectados mediante los modulos `llm2vae` y `vae2llm`. El delta incluye LoRA de rango 16 y alpha 32 en las proyecciones q/k/v/o de la atencion del experto de comprension, y entrena completamente `llm2vae`, `vae2llm`, `latent_pos_embed` y `time_embedder`. El entrenamiento se hizo en precision NF4.

El entrenamiento usa GRPO en bucle cerrado: se generan captions (grupo de rollout de tamano 4, temperatura 0,95, maximo 128 tokens) y la recompensa se calcula por la calidad de la reconstruccion de la imagen a partir del caption. Los hiperparametros clave son learning rate 2e-05, coeficiente KL 0,02, coeficiente de perdida de reconstruccion 0,0 (el paso de reconstruccion solo se usa para la recompensa), 42 imagenes por paso de optimizador, rango de ruido [0,5, 1,0], VAE max size 768, semilla 42 y 7 GPUs. La ejecucion se hizo en dos tramos (pasos 0-100, parada en 107, reanudacion desde 100 con estado AdamW reiniciado) hasta el paso 251, cubriendo unas 10.500 imagenes de un subconjunto de 14.994 imagenes del dataset 4KLSDB.

## Capacidades

- Generacion de descripciones de imagen (captioning) en ingles, optimizada para fidelidad de contenido.
- Comprension visual multimodal heredada del modelo base BAGEL-7B-MoT.
- Reconstruccion condicionada por caption a traves del VAE del modelo base (usada como senal de recompensa).
- Escritura de captions mas cortas y con el contenido principal al principio (front-loading), segun los resultados reportados.
- No soporta tool calling ni function calling de forma nativa en este delta.
- No esta documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- No incorpora modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Investigacion en RL para vision-lenguaje: sirve como referencia reproducible de un pipeline GRPO con recompensa basada en reconstruccion, util para estudiar senales de recompensa alternativas al juicio humano o a modelos juez.
- Generacion de alt-text y descripciones para accesibilidad: el modelo produce captions cortas y con el contenido principal al inicio, adecuadas para lectores de pantalla donde la brevedad importa.
- Etiquetado automatico de datasets de imagen: se puede usar para preanotar descripciones en corpus de imagenes antes de una revision humana, con la ventaja de que la recompensa de entrenamiento premia la reconstruibilidad del contenido.
- Descripcion de imagenes en pipelines de recuperacion multimodal: captions concisas y centradas en contenido facilitan la indexacion textual de imagenes para busqueda.
- Experimentos de destilacion o ajuste fino sobre BAGEL: el delta documenta que modulos conviene entrenar (proyecciones y embeddings) y con que hiperparametros, lo que acelera replicas.
- Analisis de robustez de recompensas: comparar el comportamiento a 128 y 256 tokens permite estudiar como la longitud del caption interactua con la senal de recompensa; el autor reporta que a 256 tokens la mejora desaparece.
- Evaluacion de captioning con jueces automaticos: el propio autor usa GPT-4o-mini como juez, lo que sirve de plantilla para montar evaluaciones propias.

## Benchmarks y rendimiento

| Benchmark | Este modelo | BAGEL-7B-MoT base | Diferencia |
|---|---|---|---|
| CompreCap, 128 tokens, juez GPT-4o-mini (560 imagenes) | 44,25 | 41,00 | +3,25 (IC 95% [+2,18, +4,39]) |
| CompreCap, 256 tokens, juez GPT-4o-mini | 53,19 | 53,32 | -0,13 |

Nota: el autor indica que estos numeros no son comparables con los publicados en el paper de CompreCap porque usa GPT-4o-mini en lugar de Llama-3 como juez.

## Requisitos de hardware

- El delta en si ocupa 0,1 GB, pero requiere cargar el modelo base BAGEL-7B-MoT completo para funcionar.
- El entrenamiento se realizo en 7 GPUs con cuantizacion NF4; el autor no especifica el modelo exacto de GPU.
- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base y de la cuantizacion. Con NF4 y 7B de parametros base, es razonable esperar un consumo en el rango de 8-16 GB, pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponibles; el autor no las detalla.
- Cabe en GPU de consumo: probable con NF4, pero no confirmado.
- Opciones de despliegue: el autor solo documenta el codigo BAGEL-VLM (revision `d8923f8fe4fd8fce83bbc614763def410c83c443`) con `build_model` y `apply_lora_and_freeze`. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACTOR_ONLY-STEP250-GRPO4 | 39 M (delta) sobre BAGEL-7B-MoT | no disponible | Captioning con GRPO | Apache 2.0 | Hugging Face, 0 descargas |
| ByteDance-Seed/BAGEL-7B-MoT | 7B (MoT) | no disponible | Multimodal generacion y comprension | Apache 2.0 | Hugging Face |
| Adaptadores PEFT estandar sobre BAGEL | variable | no disponible | Ajuste supervisado tipico | depende | Hugging Face |

No se dispone de datos de benchmarks comparables con otros adaptadores de captioning en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no funciona sin BAGEL-7B-MoT y sin el codigo BAGEL-VLM en la revision exacta indicada.
- No es un adaptador PEFT estandar; `PeftModel.from_pretrained()` falla. La carga requiere el script manual documentado.
- Las herramientas del repositorio que aceptan `--checkpoint` esperan el formato `.pt` original, no safetensors; hay que convertir el checkpoint.
- El checkpoint se entreno solo hasta el paso 251 sobre unas 10.500 imagenes de un subconjunto de 14.994; no es un ajuste completo.
- La mejora reportada solo aparece con captions de hasta 128 tokens; a 256 tokens el rendimiento es practicamente identico o ligeramente inferior al base.
- Los resultados usan GPT-4o-mini como juez, no Llama-3, por lo que no son comparables con las cifras publicadas en el paper de CompreCap.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo generativo de captions, es esperable, pero no hay datos.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; el prompt de evaluacion esta en ingles.
- Uso comercial: la licencia es Apache 2.0, pero el usuario debe cumplir ademas los terminos del modelo base.
- El historial de entrenamiento tiene una reanudacion con reinicio del estado AdamW, lo que puede afectar a la reproducibilidad exacta.
- Cero descargas y cero likes en el momento de la consulta; no hay validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ashriva256/ACTOR_ONLY-STEP250-GRPO4
- Modelo base: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Codigo BAGEL-VLM: https://github.com/arj-shriv/BAGEL-VLM
- Revision del codigo usada: `d8923f8fe4fd8fce83bbc614763def410c83c443`
