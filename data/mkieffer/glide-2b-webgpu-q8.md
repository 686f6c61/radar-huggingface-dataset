# mkieffer/GLiDE-2B-WebGPU-Q8

## Resumen

GLiDE-2B WebGPU Q8 es un checkpoint cuantizado del modelo de decisión Fastino GLiDE-2B, publicado por el usuario mkieffer como parte de la release v0.1.0 de su runtime `glide-rs-webgpu`. No se trata de un modelo de lenguaje generativo de propósito general, sino de un modelo de clasificación y puntuación de opciones de decisión predefinidas: recibe un texto y asigna puntuaciones a un conjunto de alternativas, lo que lo sitúa en la categoría de "decision models" orientados a agentes y enrutamiento.

El modelo base es Fastino GLiDE-2B, derivado a su vez de Qwen3.5-2B, por lo que hereda la arquitectura transformer de este último con aproximadamente 2.000 millones de parámetros. La versión publicada aquí emplea una cuantización mixta: proyecciones del backbone en 8 bits con tiling y embeddings de tokens en 4 bits, empaquetadas en un formato de pesos propietario (`weights.bin` de 1.748.860.160 bytes) que solo es interpretable por el runtime Rust enlazado.

Su relevancia es acotada pero específica: permite ejecutar un modelo de decisión de 2B directamente en el navegador mediante WebGPU, sin servidor, gracias a los ficheros `webgpu.json` (colocación de tensores) e `index.json` (metadatos para el runtime). Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y su licencia Fastino Community condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B); modelo de decisión/clasificación |
| Parametros totales | ~2B (heredados de GLiDE-2B / Qwen3.5-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone en 8 bits con tiling; embeddings de tokens en 4 bits (Q8 en el nombre) |
| Idiomas soportados | no disponible |
| Licencia | Fastino Community License (con componentes Qwen bajo Apache 2.0) |
| Formato de pesos | `weights.bin` propietario + `webgpu.json` + `index.json` (runtime Rust `glide-rs-webgpu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del Fastino GLiDE-2B, que a su vez desciende de Qwen3.5-2B (commit `00f122c120cdeed82284106cb77d9bab5a50ad16`). La arquitectura subyacente es, por tanto, la de un transformer denso de aproximadamente 2.000 millones de parámetros, adaptado por Fastino como modelo de decisión: en lugar de generar texto libre, puntúa opciones de decisión predefinidas a partir de una entrada textual.

La innovación técnica de esta publicación concreta está en el empaquetado: proyecciones del backbone cuantizadas a 8 bits con esquema de tiling y embeddings de tokens a 4 bits, todo volcado en un único `weights.bin` de 1.748.860.160 bytes, más un tokenizer de unos 20 MB. Los ficheros `webgpu.json` e `index.json` describen el mismo binario empaquetado para el runtime Rust y para la colocación de tensores en WebGPU. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Puntuación de opciones de decisión predefinidas a partir de texto de entrada (tarea principal del modelo).
- Clasificación y enrutamiento: selección entre alternativas discretas.
- Ejecución en navegador mediante WebGPU con el runtime `glide-rs-webgpu`.
- Inferencia local sin servidor, con el checkpoint empaquetado en un único binario.
- Generación de texto libre: no disponible (el modelo está orientado a decisión, no a generación abierta).
- Tool calling / function calling: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Enrutamiento de consultas en el navegador: puntuar entre un conjunto fijo de intenciones (soporte, ventas, FAQ) directamente en el cliente con WebGPU, sin enviar el texto a un servidor.
- Clasificación de tickets en aplicaciones web: el modelo asigna puntuaciones a categorías predefinidas y el frontend decide la etiqueta, aprovechando la ejecución local y la privacidad del dato.
- Selección de herramienta en agentes ligeros: dado un mensaje de usuario y una lista cerrada de herramientas, puntuar cuál corresponde, con el runtime Rust gestionando la inferencia.
- Moderación de contenido por categorías: puntuar textos contra un conjunto de políticas predefinidas y aplicar umbrales en cliente.
- Demos y prototipos de modelos de decisión en WebGPU: validar el pipeline `glide-rs-webgpu` con un checkpoint oficial de la release v0.1.0 antes de integrar en producción.
- Filtrado previo en pipelines de datos: descartar o etiquetar registros según opciones predefinidas antes de un procesamiento más costoso en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint pesa 1.8 GB (repo) y el `weights.bin` 1.748.860.160 bytes; requiere al menos ~2 GB de memoria de GPU o de memoria unificada para cargarse.
- Diseñado para WebGPU: funciona en navegadores compatibles con WebGPU sobre GPUs integradas o dedicadas que expongan el backend.
- GPU dedicadas: no disponible información específica sobre A100, H100 o RTX 4090 para este checkpoint.
- En consumer GPU: viable en tanto que el runtime soporte WebGPU y haya ~2 GB de VRAM disponible; no se detallan modelos concretos.
- Despliegue: exclusivamente mediante el runtime `glide-rs-webgpu` v0.1.0 (Rust + WebGPU). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables de decisión en el mismo rango de tamaño para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Formato de pesos propietario: solo es utilizable con el runtime `glide-rs-webgpu`; no es cargable en ecosistemas estándar (transformers, llama.cpp, vLLM).
- Modelo de decisión, no generativo: no debe emplearse para generación de texto libre ni tareas de razonamiento abierto.
- Licencia Fastino Community: restricciones para uso comercial; es necesario revisar `LICENSE` y `NOTICE` antes de desplegar. Los componentes Qwen3.5-2B quedan bajo Apache 2.0.
- Idiomas soportados no declarados: riesgo de comportamiento degradado fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con entradas largas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al derivar de Qwen3.5-2B, hereda los sesgos del modelo base.
- Repositorio sin descargas ni likes y publicado en 2026-11-20: madurez y soporte de la comunidad no verificables.
- Dependencia de WebGPU: la disponibilidad del backend en el navegador del usuario condiciona la ejecución.

## Enlaces

- Hugging Face: https://huggingface.co/mkieffer/GLiDE-2B-WebGPU-Q8
- Modelo base: https://huggingface.co/fastino/GLiDE-2B/tree/00f122c120cdeed82284106cb77d9bab5a50ad16
- Release del runtime: https://github.com/mkieffer1107/glide-rs-webgpu/releases/tag/v0.1.0
- Repositorio del runtime: https://github.com/mkieffer1107/glide-rs-webgpu
- Licencia Qwen3.5-2B (Apache 2.0): https://huggingface.co/mkieffer/GLiDE-2B-WebGPU-Q8/blob/main/licenses/Qwen3.5-2B-LICENSE
