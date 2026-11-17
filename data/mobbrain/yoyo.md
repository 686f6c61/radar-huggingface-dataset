# mobbrain/yoyo

## Resumen

mobbrain/yoyo es un LoRA de DreamBooth para el modelo de difusion de texto a imagen Krea 2, entrenado sobre la variante Krea 2 RAW y presentado por el autor sobre Krea 2 Turbo. No se trata de un modelo base autonomo, sino de un adaptador de bajo rango que inyecta un concepto concreto invocable mediante el token `yzou`. El repositorio ocupa 1,4 GB y se distribuye en formato compatible con la libreria diffusers bajo licencia Apache 2.0.

Su relevancia es acotada: es un adaptador de nicho publicado en noviembre de 2026, sin descargas ni interacciones registradas en el momento de la consulta, y sin documentacion sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni hiperparametros. La model card se limita a indicar el modelo base, el token disparador, tres prompts de ejemplo con sus imagenes y un fragmento de codigo de inferencia.

Para un desarrollador o investigador, la ficha resulta util como referencia de como se estructura un LoRA de Krea 2 y como se carga mediante `Krea2Pipeline`, pero no como un componente listo para produccion sin una evaluacion previa del concepto `yzou` y de su comportamiento fuera de los prompts de muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de texto a imagen; modelo base krea/Krea-2-Raw |
| Parametros totales | no disponible (el repositorio pesa 1,4 GB; no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en difusion de texto a imagen no aplica el concepto de contexto de tokens de un LLM; la longitud de prompt no se documenta) |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; compatible con diffusers (`load_lora_weights`), repositorio de 1,4 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth sobre Krea 2, un modelo de difusion de texto a imagen. El autor especifica que el entrenamiento se realizo sobre Krea 2 RAW y que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. No se detalla el rango del LoRA, el numero de pasos de entrenamiento, el tamano o la composicion del dataset, ni si se aplicaron tecnicas adicionales como regularizacion por clase o aumento de datos.

La innovacion tecnica del adaptador se limita al uso de un token disparador dedicado (`yzou`) para invocar el concepto aprendido, un patron estandar en los LoRA de DreamBooth. No hay informacion sobre la arquitectura interna del modelo base Krea 2 (tipo de transformer de difusion, VAE, text encoder) en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, condicionada al concepto aprendido mediante el token `yzou`.
- Inyeccion de un concepto visual especifico en el modelo base Krea 2, sin necesidad de reentrenar el modelo completo.
- Compatibilidad con la libreria diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rapida sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, segun el ejemplo del autor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por no ser aplicables a un modelo de difusion de texto a imagen.
- Capacidades multilingues: no disponibles; los prompts de ejemplo estan en ingles.

## Casos de uso

- Prototipado de conceptos visuales personalizados: el LoRA permite incorporar el concepto `yzou` en imagenes generadas con Krea 2 sin reentrenar el modelo base, util para explorar variaciones de un diseno o personaje en pocas iteraciones.
- Generacion de arte conceptual para videojuegos o narrativa: los prompts de ejemplo (dragon holografico, estatua en un jardin zen, serpiente marina en un reino subacuatico) muestran su uso para ilustrar escenas fantaticas con un elemento recurrente.
- Pruebas de integracion en pipelines de diffusers: sirve como caso de referencia para validar la carga de LoRA sobre `Krea2Pipeline` en un entorno de desarrollo antes de desplegar adaptadores propios.
- Experimentacion academica con DreamBooth y LoRA: util para estudiar como un token disparador condiciona la generacion en modelos de difusion recientes, aunque sin dataset documentado la reproducibilidad es limitada.
- Generacion de imagenes de muestra para demos o documentacion: con 8 pasos sobre Krea 2 Turbo, el coste de inferencia es bajo, lo que facilita generar lotes de imagenes para maquetas o presentaciones.
- Evaluacion comparativa de adaptadores: al estar bajo Apache 2.0, puede incluirse en estudios comparativos de LoRA sobre Krea 2 frente a otros adaptadores, siempre que se valide previamente la calidad del concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador pesa 1,4 GB y se carga junto con el modelo base Krea 2 en bfloat16; el requisito total depende del modelo base, no documentado en la informacion proporcionada.
- GPU recomendadas: no disponibles. El ejemplo del autor usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Depende del modelo base Krea 2, cuyo requisito de VRAM no se detalla.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights` es el unico metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor indica 8 pasos de inferencia sobre Krea 2 Turbo, pero no publica tiempos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobbrain/yoyo | LoRA sobre Krea 2 | no disponible (repo de 1,4 GB) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base de difusion texto a imagen | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face (referenciado como base) |
| krea/Krea-2-Turbo | Modelo base de difusion texto a imagen (variante rapida) | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face (usado en las muestras) |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un LoRA de concepto, puede heredar los sesgos del modelo base Krea 2, no evaluados en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero el adaptador puede generar el concepto `yzou` de forma inconsistente o fuera de contexto en prompts alejados de los ejemplos de entrenamiento.
- Limitaciones de contexto o idioma: no se documenta el comportamiento multilingue; los prompts de ejemplo estan en ingles y no hay evidencia de soporte en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Krea 2 puede tener su propia licencia no reflejada en esta ficha; conviene verificar la licencia de krea/Krea-2-Raw antes de un despliegue comercial.
- Caveats para produccion: sin dataset, hiperparametros ni evaluacion publicados; 0 descargas y 0 likes en el momento de la consulta; no hay garantia de calidad fuera de los tres prompts de muestra; el autor no documenta el rango del LoRA ni el numero de pasos de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mobbrain/yoyo
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo Krea 2 Turbo (usado en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
