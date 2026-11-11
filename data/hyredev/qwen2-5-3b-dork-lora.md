# HyreDev/qwen2.5-3b-dork-lora

## Resumen

HyreDev/qwen2.5-3b-dork-lora es un ajuste fino de Qwen2.5-3B, el modelo denso de 3.085.938.688 parametros de Alibaba, especializado en generar operadores de busqueda de Google ("dorking") a partir de preguntas en lenguaje natural. El autor, Billiam Bennett (HyreDev), lo desarrollo como motor de traduccion de consultas para Dad Search, una herramienta de busqueda local pensada para usuarios que encuentran Google poco intuitivo. El modelo publicado es la fusion del adaptador LoRA de la ronda 4 de DPO sobre el modelo base, cuantizado a Q4_K_M en formato GGUF para su uso con Ollama.

El interes tecnico del artefacto no esta en la arquitectura, heredada integramente de Qwen2.5-3B, sino en el proceso de alineacion: SFT sobre 3.150 pares consulta/operador seguido de cinco rondas de DPO, de las cuales solo la cuarta se publica porque la segunda colapso y la quinta retrocedio en calidad. El autor documenta un defecto conocido (emision de un token artefacto final en lugar de detener la generacion) que se corrige en tiempo de ejecucion con un post-procesador externo, ya que no puede eliminarse de los pesos.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, sin model card completa en cuanto a idiomas o pipeline declarados. Su relevancia es acotada: sirve como ejemplo de ajuste fino pequeno y orientado a tarea con evaluacion honesta y como componente concreto de un producto local, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajustado con LoRA + DPO y fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-3B; no declarada en la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF) publicado; el base admite otras cuantizaciones GGUF |
| Idiomas soportados | no disponible (la tarea de entrenamiento es en ingles) |
| Licencia | Apache 2.0 (segun la model card, igual que el base Qwen2.5) |
| Formato de pesos | GGUF (repo de 1,9 GB); el adaptador original es LoRA, no publicado como safetensors separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-3B, sin modificaciones estructurales. Sobre esa base se aplico un ajuste supervisado (SFT) con 3.150 pares de pregunta en lenguaje natural y cadena de operadores de busqueda, seguido de cinco rondas de DPO. La ronda 4 es la que se publica; la ronda 2 colapso y la ronda 5 regresiono (70,9% frente a 77,7% de acierto en operadores), lo que el autor documenta explicitamente. El adaptador se entreno para emitir una unica cadena de operadores y detenerse.

La innovacion tecnica relevante no esta en el entrenamiento sino en el post-procesado: el adaptador emite en ocasiones un token artefacto final en lugar de cerrar la secuencia. El autor corrige esto con un script externo, `tail_strip.js`, que elimina caracteres artefacto al final de la salida. Segun la model card, con el strip las salidas basura bajan de 149/175 a 1/175 y las salidas limpias con coincidencia exacta suben de 0/175 a 13/175, manteniendo la precision de operadores en 136/175. El strip no puede integrarse en los pesos y debe aplicarse despues de la generacion.

## Capacidades

- Generacion de cadenas de operadores de busqueda de Google a partir de preguntas en lenguaje natural en ingles.
- Salida de una unica cadena de operadores por consulta, con detencion tras la emision (sujeta al defecto del token artefacto).
- Razonamiento basico de lenguaje natural heredado de Qwen2.5-3B, limitado por el ajuste especifico de la tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el entrenamiento y la evaluacion son en ingles.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Traduccion de consultas para Dad Search: el modelo recibe una pregunta en ingles y devuelve una cadena de operadores de Google que el frontend ejecuta; es su proposito original y el unico validado por el autor.
- Asistente local en dispositivo (proyecto Adam): el GGUF Q4_K_M se carga en Ollama para un asistente que corre en local sin dependencia de API, aprovechando el tamano reducido del modelo.
- Ensenanza de operadores de busqueda: el modelo puede generar ejemplos de sintaxis `site:`, `filetype:`, comillas y operadores booleanos a partir de descripciones, util en documentacion o tutoriales.
- Prototipado de pipelines de busqueda aumentada: sirve como componente de traduccion consulta-a-query en un sistema mayor, con el post-procesador `tail_strip.js` en la cadena.
- Base para ajustes de nicho similares: al ser un LoRA fusionado sobre Qwen2.5-3B con licencia Apache 2.0, puede reutilizarse como punto de partida para otras tareas de generacion de consultas estructuradas.
- Evaluacion de tecnicas de DPO: el historial de rondas (colapso en la 2, regresion en la 5, exito en la 4) lo convierte en un caso documentado para estudiar inestabilidad de DPO en modelos pequenos.
- Filtrado y refinamiento de busquedas en herramientas internas: integrado en un flujo que transforme lenguaje natural en consultas acotadas para motores con sintaxis estricta.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia del autor sobre un conjunto reservado de 175 filas, midiendo operadores correctos:

| Modelo | Operadores correctos |
|---|---|
| Qwen2.5-3B base | 75/175 (42,9%) |
| Adaptador ronda 4 (decodificacion simple) | 136/175 (77,7%) |
| Adaptador ronda 5 | 124/175 (70,9%) |

Con el post-procesador `tail_strip.js` aplicado a la ronda 4, la model card reporta salidas basura de 1/175 (frente a 149/175 sin strip) y salidas limpias con coincidencia exacta de 13/175 (frente a 0/175), manteniendo la precision de operadores en 136/175. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantizacion Q4_K_M publicada (repo de 1,9 GB), mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en muchas integradas con memoria unificada suficiente.
- Opciones de despliegue: Ollama (documentado por el autor mediante `FROM ./qwen2.5-3b-dork-lora-r4-q4_K_M.gguf`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI requeririan pesos en safetensors, no publicados en este repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyreDev/qwen2.5-3b-dork-lora | 3,09 B | no disponible | Generacion de operadores de busqueda (ajuste DPO) | Apache 2.0 | GGUF en HF, 0 descargas |
| Qwen/Qwen2.5-3B | 3,09 B | no disponible en esta ficha | Proposito general | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-Coder-3B | 3,09 B | no disponible en esta ficha | Codigo | Apache 2.0 | Ampliamente disponible |
| Llama 3.2 3B | 3,21 B | no disponible en esta ficha | Proposito general | Licencia comunitaria Llama | Ampliamente disponible |

La comparacion directa solo es significativa frente al base: el ajuste eleva el acierto en operadores del 42,9% al 77,7% en el conjunto del autor, a costa de especializacion y de un post-procesador obligatorio. Frente a modelos de proposito general del mismo tamano, este artefacto pierde flexibilidad y no aporta datos de rendimiento fuera de su tarea.

## Limitaciones y advertencias

- Defecto conocido de generacion: emision de un token artefacto final en lugar de detencion limpia; requiere el post-procesador `tail_strip.js` en produccion.
- El strip no puede incorporarse a los pesos; omitirlo degrada gravemente la calidad de salida (149/175 salidas basura sin strip).
- Evaluacion limitada a 175 filas de un unico conjunto reservado, sin benchmarks estandar ni validacion externa.
- Entrenado y evaluado en ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion en la sintaxis de operadores no vistas durante el entrenamiento; el autor no documenta analisis de errores por tipo de operador.
- Sesgos conocidos: no documentados en la model card.
- Uso comercial permitido por Apache 2.0, pero sin garantias del autor y con cero adopcion registrada (0 descargas, 0 likes).
- Contexto maximo no declarado en la model card; conviene verificar el limite efectivo antes de usarlo con entradas largas.
- Proyecto personal de un unico autor, sin mantenimiento ni versionado formal; la fecha de creacion del repo (2026-11-11) y la model card (Nov 10, 2026) no coinciden con el estado tipico de un modelo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyreDev/qwen2.5-3b-dork-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio Dad Search (referenciado en la model card, contiene `tail_strip.js` y `tail-strip-integration.md`): no disponible como URL en la informacion proporcionada
- Paper o blog del autor: no disponible
