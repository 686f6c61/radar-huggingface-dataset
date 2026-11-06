# GilGamez-com/Leviathan-v4.2-GGUF

## Resumen

Leviathan v4.2 es un modelo de generación de texto presentado por GilGamez-com como un "modelo visión-lenguaje empresarial y orquestador autónomo". Este repositorio concreto (`Leviathan-v4.2-GGUF`) no contiene los pesos originales, sino las cuantizaciones en formato GGUF y los artefactos de despliegue en el edge (Modelfile de Ollama, instrucciones para llama.cpp) derivados del modelo base `GilGamez-com/Leviathan-v4.2`. La model card remite explícitamente al repositorio principal para consultar arquitectura, capacidades y pesos LoRA completos.

Los metadatos de Hugging Face lo sitúan como un fine-tune de la familia Qwen (etiquetas `qwen` y `qwen3`) orientado a uso como agente y a tool calling, con soporte declarado de inglés e indonesio y licencia Apache 2.0. No obstante, la información pública disponible es muy escasa: no se detallan parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, y el repositorio registra cero descargas en el momento de la consulta.

Por tanto, esta ficha describe con rigor lo que la documentación del autor declara y marca de forma explícita como "no disponible" todo aquello que no aparece en las fuentes. Es relevante ahora como ejemplo de publicación de cuantizaciones GGUF listas para Ollama y llama.cpp, pero no debe evaluarse para producción sin verificar los datos técnicos en el repositorio del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del repo apuntan a la familia Qwen / Qwen3) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `--ctx-size 4096`, pero no se declara el máximo) |
| Tipos de cuantización | GGUF; el ejemplo de la model card referencia `Q4_K_M` |
| Idiomas soportados | en, id |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con `Modelfile` para Ollama) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna del modelo. Las etiquetas de Hugging Face (`qwen`, `qwen3`, `base_model:finetune:GilGamez-com/Leviathan-v4.2`) indican que se trata de un fine-tune sobre un modelo de la familia Qwen, presumiblemente un transformer decoder-only, pero no se confirma ni el número de parámetros, ni si emplea mezcla de expertos, ni la longitud de contexto nativa. El autor describe el modelo base como "modelo visión-lenguaje" y "orquestador autónomo", lo que sugiere capacidades multimodales y de agente, aunque este repositorio GGUF es de pipeline `text-generation`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Todo ello queda pendiente de consulta en el repositorio principal `GilGamez-com/Leviathan-v4.2`, que la model card señala como fuente autorizada.

## Capacidades

- Generación de texto en inglés e indonesio.
- Uso como agente y orquestador autónomo, según la descripción del autor ("autonomous orchestrator").
- Soporte declarado de tool calling / function calling mediante la etiqueta `tool-use`.
- Orientación a tareas de código (etiqueta `code`).
- Capacidades de visión declaradas para el modelo base, no verificables en este repositorio GGUF de texto.
- Despliegue local en CPU/GPU mediante Ollama y llama.cpp, con servidor compatible con la API de OpenAI (`llama-server`).
- No se documentan modos de razonamiento explícito (thinking), audio ni otras capacidades especiales.

## Casos de uso

- Asistente local en Ollama: el repositorio incluye un `Modelfile` preconfigurado, de modo que un desarrollador puede ejecutar `ollama create leviathan-v4.2 -f Modelfile` y disponer de un asistente conversacional en local sin depender de la nube.
- Servicio compatible con OpenAI en infraestructura propia: con `llama-server -m Leviathan-v4.2.Q4_K_M.gguf --port 8080 -ngl 33 --ctx-size 4096` se levanta una API local que puede sustituir a un endpoint remoto en aplicaciones existentes que usen el esquema de OpenAI.
- Agente con tool calling en pipelines internos: la etiqueta `tool-use` sugiere que el modelo puede invocar funciones y APIs, lo que permitiría integrarlo en flujos de automatización de tareas con llamadas a herramientas externas.
- Generación y asistencia de código: la etiqueta `code` indica orientación a tareas de programación, utilizable en asistentes de edición o revisión dentro de un IDE o en scripts de CI.
- Aplicaciones para el mercado indonesio: al declarar soporte de `id`, encaja en productos de atención al cliente o generación de contenido dirigidos a Indonesia, un nicho poco cubierto por modelos generalistas.
- Prototipado y experimentación en el edge: al distribuirse en GGUF con cuantización Q4_K_M, es adecuado para pruebas en equipos de sobremesa o portátiles con GPU modesta antes de escalar a un modelo mayor.
- Evaluación comparativa de fine-tunes de Qwen: útil para investigadores que quieran medir el efecto de un fine-tune comunitario frente al modelo base, siempre que se validen primero sus especificaciones en el repositorio principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no conocerse el número de parámetros. Como referencia orientativa, una cuantización Q4_K_M ocupa aproximadamente 0,6 GB por cada 1000 millones de parámetros, más overhead de contexto.
- GPU recomendadas: no disponibles. El ejemplo oficial de `llama-server` usa `-ngl 33`, lo que implica descarga de 33 capas a GPU, pero no especifica el modelo de tarjeta.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del tamaño real del modelo base.
- Opciones de despliegue: Ollama (recomendado por el autor), llama.cpp CLI (`llama-cli`) y llama.cpp server (`llama-server`) con API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Leviathan v4.2 (GGUF) | no disponible | no disponible | Apache 2.0 | Hugging Face, Ollama, llama.cpp | Fine-tune de la familia Qwen; sin benchmarks publicados |
| Qwen3 (modelo base de referencia) | no disponible en esta ficha | no disponible | Apache 2.0 (según familia) | Hugging Face, Ollama, llama.cpp | Modelo original sobre el que se construye el fine-tune; especificaciones a consultar en su model card |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para una comparación rigurosa |

No es posible establecer una comparativa cuantitativa fiable con alternativas concretas sin conocer el tamaño y el contexto del modelo base.

## Limitaciones y advertencias

- Información técnica incompleta: no se publican parámetros, contexto máximo, dataset ni benchmarks, lo que impide una evaluación rigurosa previa a producción.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no puede acotarse su magnitud.
- Sesgos: no documentados por el autor; al entrenarse presumiblemente sobre datos web, pueden aparecer sesgos lingüísticos y culturales, especialmente en el soporte de indonesio.
- Cobertura lingüística limitada: solo se declaran inglés e indonesio; el rendimiento en castellano no está garantizado.
- Discrepancia entre descripción y artefacto: el autor describe el modelo base como visión-lenguaje, pero este repositorio GGUF es de `text-generation`; conviene verificar si las capacidades multimodales se conservan en la cuantización.
- Licencia Apache 2.0: permite uso comercial y modificación, pero debe conservarse el aviso de licencia y verificarse que el modelo base Qwen no imponga restricciones adicionales.
- Madurez del proyecto: cero descargas y un único "like" en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Contexto de ejemplo reducido: el comando oficial usa `--ctx-size 4096`, lo que puede limitar casos de uso que requieran ventanas largas si el modelo no soporta más.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GilGamez-com/Leviathan-v4.2-GGUF
- Modelo base: https://huggingface.co/GilGamez-com/Leviathan-v4.2
- Organización en Hugging Face: https://huggingface.co/GilGamez-com
- Sitio web del autor: https://www.gilgamez.com
- No se han encontrado papers, blogs técnicos, repositorios de código ni demos adicionales en la búsqueda web.
