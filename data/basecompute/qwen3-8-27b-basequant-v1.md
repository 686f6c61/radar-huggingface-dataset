# basecompute/Qwen3.8-27B-BaseQuant-V1

## Resumen

Qwen3.8-27B-BaseQuant-V1 es una redistribución cuantizada del modelo Qwen/Qwen3.8-27B, publicada por basecompute en octubre de 2026 bajo licencia Apache 2.0. No es un modelo nuevo: es un conjunto de tres builds GGUF (Small, Medium y Large) más sus equivalentes en el formato propietario `.base` del runtime baseRT, pensados para ejecutar el modelo de 27,3 mil millones de parámetros en hardware local con la menor pérdida posible de fidelidad respecto a BF16.

El problema que resuelve es concreto: las cuantizaciones dinámicas de unsloth son el estándar de facto para Qwen en llama.cpp, y basecompute compite frontalmente con ellas publicando pares del mismo tamaño de fichero pero con menor divergencia KL. En el agregado de seis datasets públicos (OpenHands, SWE-agent, Glaive function calling, OpenOrca, Tulu 3 y OpenHermes) declara un 15 % menos de KL en Small y Medium frente a sus homólogos de unsloth, incluido UD-Q4_K_M, que es el tamaño que corre la mayoría de la gente.

El modelo base es un transformer denso nativo multimodal (visión-lenguaje) de Alibaba, con atención híbrida Gated DeltaNet más atención completa periódica, orientado a código, flujos agénticos y automatización de oficina. Su relevancia ahora es que permite montar agentes locales con tool calling sobre una ventana de 32k tokens en una sola GPU de 24 GB, sin depender de API.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) con atención híbrida: Gated DeltaNet + atención completa periódica (heredada del modelo base) |
| Parámetros totales | 27.320.697.856 (~27,3 B), dato real de safetensors del modelo base |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; el ejemplo oficial de `llama-server` usa `-c 32768` |
| Tipos de cuantización | GGUF en tres tamaños: Small 10,93 GB (~3 bits, equivalente a IQ3_XXS), Medium 16,41 GB (~4 bits, equivalente a Q4_K_M), Large 20,82 GB (~5 bits, equivalente a Q5_K_XL). Bundles `.base` de baseRT con los mismos tres tamaños |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) y `.base` (baseRT) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de Qwen: un transformer denso con atención híbrida que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas de atención completa intercaladas periódicamente, lo que reduce el coste de la caché KV en contextos largos sin renunciar a recuperación exacta en las capas full attention. El modelo es nativo multimodal: procesa texto e imagen dentro del mismo transformer, sin torre de visión separada según la documentación del repositorio oficial. Cuenta con 27.320.697.856 parámetros y Capacidad de *thinking mode*, ya que la evaluación de basecompute se hizo con el razonamiento activado.

Sobre el entrenamiento del modelo base no hay datos en la información disponible: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. Lo que sí está documentado es el proceso de cuantización de esta release: basecompute genera los ficheros con su propia herramienta baseRT y los evalúa de dos formas. Primero, con texto held-out (continuaciones del propio modelo, texto escrito, turnos de tool call y tool calls con respuesta final). Segundo, con evaluación *on-policy*: sobre prompts de seis datasets públicos, el modelo BF16 escribe la continuación completa con thinking activado y ambas cuantizaciones se puntúan a lo largo de esa trayectoria. La innovación declarada es el algoritmo de cuantización, no un cambio arquitectónico: los ficheros son del mismo tamaño o menores que los de unsloth para el mismo nivel de bits.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking, heredado del modelo base.
- Generación de código y resolución de tareas de ingeniería de software, con evaluación específica sobre prompts de OpenHands y SWE-agent.
- Tool calling y function calling: la model card incluye benchmarks dedicados a turnos de llamada a herramientas y a la respuesta final tras la llamada, con datos de Glaive function calling.
- Flujos agénticos: el modelo base está posicionado por Qwen para *agentic workflows* y automatización de oficina.
- Multilingüismo: capacidad declarada del modelo base, pero sin listado de idiomas en esta ficha técnica; no disponible.
- Visión: el modelo base es nativo visión-lenguaje, pero la model card de esta release no documenta si los GGUF incluyen el proyector multimodal (`mmproj`) necesario para entrada de imagen.
- Conversacional: etiquetado como `conversational` y `text-generation` en HuggingFace.
- Compatible con endpoints: etiqueta `endpoints_compatible` en el repo.

## Casos de uso

- Agentes de código en local: con la variante Medium (16,41 GB) se puede ejecutar un agente tipo SWE-agent en una RTX 4090, resolviendo parches sobre repositorios sin enviar el código a un servicio externo. La evaluación on-policy sobre SWE-agent muestra un KL de 0,00708, un 22 % mejor que el cuantizado equivalente de unsloth.
- Automatización de tool calling en producción: el modelo mantiene baja divergencia en turnos de llamada a función (KL 0,0099 en Medium, 0,0127 en unsloth), lo que se traduce en menos probabilidad de emitir un JSON malformado o un nombre de herramienta inventado. Adecuado para orquestadores que encadenan APIs internas.
- Asistente de oficina y generación documental: el modelo base está optimizado para tareas de productividad; con la variante Large (20,82 GB) y 32k de contexto se pueden resumir y reescribir documentos largos conservando estructura y estilo.
- Atención al cliente multi-turno: la ventana de 32k tokens del ejemplo oficial permite mantener historiales largos con contexto de producto, aunque conviene validar la longitud real de contexto del modelo base antes de dimensionar.
- Inferencia en Apple Silicon: los bundles `.base` de baseRT están pensados para Metal; el repositorio del modelo base indica que Q4 necesita unos 24 GB de memoria unificada (ajustado) y Q8 más de 48 GB. Un Mac con 24-32 GB puede correr Medium.
- Evaluación de cuantizaciones: sirve como referencia para medir el impacto de la pérdida de precisión en un pipeline propio, ya que publica KL por dataset y por tamaño.
- Despliegue en CI/CD: `llama-server` con `-ngl 99` y 32k de contexto se puede levantar como servicio HTTP interno para tareas de revisión de código o generación de tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son de divergencia KL frente al modelo BF16, medidos en llama.cpp: menor KL significa una distribución de siguiente token más parecida a la de referencia. Cada celda muestra `unsloth / BaseQuant (variación)`.

Texto held-out (no usado para construir los ficheros):

| Conjunto | Small vs UD-IQ3_XXS | Medium vs UD-Q4_K_M | Large vs UD-Q5_K_XL |
|---|---|---|---|
| Continuaciones del propio modelo | 0,0391 / 0,0308 (−21 %) | 0,00713 / 0,00555 (−22 %) | 0,00278 / 0,00200 (−28 %) |
| Texto escrito | 0,5288 / 0,4318 (−18 %) | 0,2081 / 0,1579 (−24 %) | 0,1080 / 0,0716 (−34 %) |
| Turnos de tool call | 0,0631 / 0,0526 (−17 %) | 0,0127 / 0,0099 (−22 %) | 0,00496 / 0,00354 (−29 %) |
| Tool calls + respuestas finales | 0,0631 / 0,0523 (−17 %) | 0,0112 / 0,0090 (−20 %) | 0,00432 / 0,00320 (−26 %) |

Prompts públicos con evaluación on-policy:

| Fuente | Small vs UD-IQ3_XXS | Medium vs UD-Q4_K_M | Large vs UD-Q5_K_XL |
|---|---|---|---|
| OpenHands | 0,1190 / 0,0793 (−33 %) | 0,0212 / 0,0182 (−14 %) | 0,00450 / 0,00447 (−1 %) |
| SWE-agent | 0,0449 / 0,0330 (−27 %) | 0,00912 / 0,00708 (−22 %) | 0,00293 / 0,00241 (−18 %) |
| Glaive function calling | 0,0673 / 0,0628 (−7 %) | 0,0112 / 0,0098 (−13 %) | 0,00335 / 0,00325 (−2 %) |
| OpenOrca | 0,0515 / 0,0431 (−16 %) | 0,00759 / 0,00624 (−18 %) | 0,00248 / 0,00231 (−7 %) |
| Tulu 3 | 0,0470 / 0,0402 (−14 %) | 0,00730 / 0,00585 (−20 %) | 0,00238 / 0,00231 (−3 %) |
| OpenHermes | 0,0445 / 0,0420 (−6 %) | 0,00639 / 0,00613 (−4 %) | 0,00203 / 0,00209 (+3 %) |
| Agregado de los seis | 0,0539 / 0,0460 (−15 %) | 0,00861 / 0,00731 (−15 %) | 0,00262 / 0,00253 (−3 %) |

Latencia y throughput: no disponibles.

## Requisitos de hardware

- Small (10,93 GB de pesos): encaja en GPU consumer de 16 GB (RTX 4070 Ti Super, 4080, 5070 Ti) dejando margen para caché KV; en 12 GB (RTX 3060 12 GB, 4070) solo con contexto corto y offload parcial a RAM.
- Medium (16,41 GB): requiere 24 GB de VRAM para contexto amplio; RTX 3090, RTX 4090, RTX 5090 o GPUs de datacenter tipo L4/A10G de 24 GB. En 16 GB no cabe con caché KV relevante.
- Large (20,82 GB): 24 GB queda muy justo; recomendable 32 GB o más (A100 40 GB, H100, RTX 5090 de 32 GB).
- Apple Silicon: el repositorio del modelo base en baseRT indica ~24 GB de memoria unificada para Q4 (ajustado) y más de 48 GB para Q8, lo que sitúa Medium en Mac de 24-32 GB y Large en Mac de 32-48 GB.
- Repositorio completo: 100,7 GB. Conviene descargar un solo fichero con `--include` o `hf download` apuntando al GGUF concreto.
- Despliegue documentado: llama.cpp (`llama-server -hf ... -hff <fichero> -c 32768 -ngl 99`), SuperFluid (`--runtime llamacpp`) y baseRT (`basert serve`). La variante Small en baseRT exige versión 0.4.0 o superior.
- vLLM, TGI y Ollama no están documentados en la información disponible; al ser GGUF estándar deberían funcionar en Ollama y en llama.cpp, pero sin garantía del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| basecompute/Qwen3.8-27B-BaseQuant-V1 | 27,3 B (denso) | No disponible | GGUF + `.base` | Apache 2.0 | Menor KL que unsloth en 23 de 24 comparaciones publicadas |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ3_XXS, UD-Q4_K_M, UD-Q5_K_XL) | 27,3 B (denso) | No disponible | GGUF | Apache 2.0 (heredada) | Mismos tamaños de fichero (10,93 / 16,46 / 20,88 GB); referencia de comparación directa |
| Qwen/Qwen3.8-27B (BF16) | 27,3 B (denso) | No disponible | safetensors | Apache 2.0 | Modelo de referencia en precisión completa; requiere ~55 GB en BF16 |
| basecompute/Qwen3.8-27B (builds baseRT) | 27,3 B (denso) | No disponible | `.base` | Apache 2.0 | Orientado a inferencia local en Apple Silicon con Metal |

## Limitaciones y advertencias

- Es una cuantización, no una mejora: el techo de calidad es el del modelo Qwen3.8-27B en BF16. Cualquier defecto del base (alucinación, sesgos) se hereda.
- Pérdida de fidelidad medible: en texto escrito, Small pasa de un KL de 0,0391 a 0,5288 según el conjunto, es decir, el caso donde la cuantización a 3 bits se aleja más de BF16. Para generación creativa o prosa larga conviene Medium o Large.
- La ventaja frente a unsloth no es universal: en el dataset OpenHermes con la variante Large, BaseQuant obtiene 0,00209 frente a 0,00203 de unsloth (+3 %), y en Glaive y OpenHands con Large la mejora es de solo el 1-2 %.
- Idiomas soportados: no documentados en la model card. No se debe asumir cobertura multilingüe sin evaluarla.
- Longitud de contexto oficial del modelo base: no disponible en la información proporcionada. El valor de 32768 del ejemplo de `llama-server` es una configuración de arranque, no una especificación verificada.
- Soporte de visión incierto en estos ficheros: la model card no menciona proyector multimodal ni `mmproj`. Si se necesita entrada de imagen, hay que verificar los ficheros antes de diseñar la aplicación.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero conviene revisar los términos del modelo base de Qwen y de los datasets de calibración antes de un despliegue en producción.
- Dependencia de tooling específico: la variante Small en formato `.base` requiere baseRT 0.4.0 o superior, lo que añade una dependencia de runtime poco extendida.
- Sin benchmarks de tareas: no hay MMLU, HumanEval ni GSM8K publicados, solo KL. La KL mide fidelidad respecto a BF16, no calidad absoluta.
- Descarga pesada: el repo completo son 100,7 GB; conviene descargar solo el fichero necesario.
- Modelo con pocas señales de la comunidad: 692 descargas y 14 likes en el momento de la consulta, lo que implica poca validación independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/basecompute/Qwen3.8-27B-BaseQuant-V1
- Blog de la release: https://huggingface.co/blog/basecompute/base-quant-v1
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cuantizaciones de referencia de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Builds baseRT del modelo base: https://huggingface.co/basecompute/Qwen3.8-27B
- Runtime SuperFluid: https://superfluid.sh/install.sh
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Registro en free2aitools: https://free2aitools.com/model/basecompute/qwen3.8-27b-basequant-v1
