# ProCreations/nib-4b-preview-FP8

## Resumen

Nib 4B (preview) es un modelo de lenguaje de 4.660 millones de parametros desarrollado por ProCreations, obtenido mediante post-entrenamiento de Qwen3.5-4B como agente de navegador (browser agent). Esta ficha cubre la variante FP8 del modelo, una cuantizacion de pesos en formato de bloques 128×128 que replica el esquema de las releases oficiales FP8 de Qwen (pesos e4m3, escalas de bloque en BF16 y activaciones dinamicas), con clipping calibrado sobre episodios de agente en dominio que incluyen capturas de pantalla. El repositorio ocupa 5,8 GB y solo cuantiza las proyecciones lineales principales: el codificador de vision, los embeddings, la cabeza de salida atada, las normas, las puertas de Gated DeltaNet, las convoluciones, los parametros de decaimiento y los pesos MTP se conservan byte a byte del modelo BF16.

El modelo resuelve un problema concreto: desplegar un agente de navegador y uso de ordenador de 4B con contexto de 131.072 tokens en hardware de una sola GPU, manteniendo una fidelidad numerica muy alta respecto al BF16 original. Segun la model card, la divergencia media KL frente al BF16 es de 0,0028 (p99 de 0,033) con un 98,9% de acuerdo en top-1 sobre 5.070 tokens de asistente retenidos de 48 episodios completos de agente, y la diferencia funcional en tareas de navegador cae dentro del ruido entre ejecuciones.

Es relevante ahora porque los agentes que operan navegador necesitan ventanas de contexto muy largas (la configuracion probada usa 131.072 tokens), tool calling fiable y capacidad multimodal para interpretar capturas de pantalla, y este build FP8 permite servirlo con SGLang sobre una RTX PRO 6000 manteniendo el parser de razonamiento y de tool calls de Qwen. La licencia Apache 2.0, heredada de Qwen3.5-4B, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y capas Gated DeltaNet (derivado de Qwen3.5); incluye codificador de vision y pesos MTP |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuracion de servido probada) |
| Tipos de cuantizacion | FP8 e4m3 con escalas de bloque 128×128 en BF16 y activaciones dinamicas; existe tambien un build NVFP4 del modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); pesos protegidos en `nib-protected.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer hibrido que combina capas de atencion con capas Gated DeltaNet (un mecanismo de estado recurrente lineal), e incorpora un codificador de vision para entrada image-text-to-text y pesos MTP (multi-token prediction). ProCreations lo post-entrena como agente de navegador sobre multiples harnesses de agente, segun indica la model card principal. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta variante es la cuantizacion: se aplica FP8 unicamente a las proyecciones lineales principales, con clipping calibrado sobre episodios de agente en dominio (incluidas capturas de pantalla), y se mantienen intactos en BF16 todos los componentes sensibles (vision, embeddings, normas, puertas de Gated DeltaNet, convoluciones, decaimientos y MTP). La fidelidad se midio contra el BF16 sobre 5.070 tokens de asistente de 48 episodios completos de hasta 32k tokens y diez harnesses, ninguno usado para calibracion. El modelo soporta modo de razonamiento configurable mediante `chat_template_kwargs`: `enable_thinking: false` lo desactiva, y `enable_thinking: true` con `reasoning_effort` en `low`, `medium` o `xhigh` (por defecto) ajusta el esfuerzo.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking configurable en cuatro niveles de esfuerzo.
- Comprension de imagenes y capturas de pantalla (pipeline image-text-to-text) para interpretar el estado de una interfaz.
- Uso de navegador (browser-use) y de ordenador (computer-use) como agente.
- Tool calling y function calling, con parser compatible `qwen3_coder` en SGLang.
- Razonamiento multi-paso y ejecucion de tareas de agente dentro de harnesses.
- Contexto largo de hasta 131.072 tokens para episodios de agente prolongados.
- Multilingue limitado: solo ingles declarado.

## Casos de uso

- Automatizacion de tareas web repetitivas: rellenar formularios, extraer datos de portales y navegar flujos multi-paso; el contexto de 131k tokens permite mantener el historial completo de la sesion y las capturas previas.
- Agente de soporte interno sobre aplicaciones web corporativas: interpreta la pantalla, ejecuta acciones con tool calling y reporta el resultado, desplegado en una sola GPU gracias al formato FP8 de 5,8 GB.
- Testing end-to-end de interfaces: el modelo actua como usuario sintetico que navega la aplicacion, detecta estados inesperados y genera informes de los pasos ejecutados.
- Extraccion de informacion de paginas dinamicas: al combinar vision y texto, puede leer contenido renderizado que no aparece en el HTML estatico.
- Asistente de investigacion con navegacion: busca, abre resultados y sintetiza la informacion en un unico episodio largo, con el modo thinking activado para tareas de planificacion.
- Despliegue en produccion con SGLang: la configuracion probada (CUDA graphs, radix cache, 8 peticiones concurrentes) sirve como punto de partida para un endpoint de agente con parsers de razonamiento y tool calls ya integrados.
- Prototipado de agentes de ordenador en laboratorio: al ser una preview con licencia Apache 2.0, permite experimentar sin restricciones comerciales.

## Benchmarks y rendimiento

La model card proporciona datos de fidelidad de la cuantizacion y de rendimiento funcional en tareas de navegador, pero no benchmarks academicos estandar (MMLU, HumanEval, GSM8K).

| Metrica | FP8 | BF16 (referencia) |
|---|---|---|
| KL media vs BF16 | 0,0028 | — |
| KL p99 vs BF16 | 0,033 | — |
| Acuerdo top-1 | 98,9% | — |
| Tareas de navegador (581 tareas en vivo, emparejadas) | 42,5% | 45,3% (diferencia −2,8; IC 95% −6,4 a +1,0) |
| Tareas de navegador, build NVFP4 (referencia cruzada) | 45,6% | — |

La diferencia funcional de −2,8 puntos queda dentro del intervalo de confianza y se describe como ruido entre ejecuciones; el build NVFP4, con un KL cinco veces mayor, obtuvo 45,6% en las mismas tareas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6 GB para los pesos FP8 (5,8 GB de repositorio); el codificador de vision y los pesos protegidos en BF16 anaden overhead, por lo que se recomienda un minimo de 8-12 GB para inferencia con contexto corto.
- Contexto largo: 131.072 tokens requieren cache KV/SSM adicional; el servido probado se realizo en una RTX PRO 6000 (Blackwell).
- GPU recomendadas: RTX PRO 6000 para la configuracion completa con contexto largo y concurrencia; A100/H100 como alternativas de datacenter; GPUs consumer con 16 GB o mas (RTX 4080/4090, RTX 5090) para contextos moderados.
- Despliegue: SGLang 0.5.21 es la opcion probada, con `--context-length 131072 --reasoning-parser qwen3 --tool-call-parser qwen3_coder --mamba-ssm-dtype bfloat16 --mamba-radix-cache-strategy extra_buffer_lazy --trust-remote-code`. No se documentan en la informacion disponible opciones con llama.cpp, Ollama o TGI para este build FP8.
- Latencia y throughput: no disponibles; la model card solo indica la prueba con CUDA graphs, radix cache y 8 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nib 4B preview FP8 (este) | 4,66 B | 131.072 | Agente de navegador multimodal, FP8 | Apache 2.0 | Hugging Face, SGLang |
| Nib 4B preview (BF16) | 4,66 B | 131.072 | Agente de navegador multimodal | Apache 2.0 | Hugging Face |
| Qwen3.5-4B | 4 B (aprox.) | No disponible en la informacion | Modelo base generalista multimodal | Apache 2.0 | Hugging Face |
| BetterWright 4B (ProCreations) | 4 B (aprox.) | 1.024K segun LLM Explorer | Modelo de 4B del mismo autor | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una preview release: el autor advierte de que el modelo a menudo reporta exito en tareas que no ha completado, lo que exige verificacion externa en produccion.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta caracterizado.
- Riesgo de alucinacion inherente a un modelo de 4B, especialmente en razonamiento multi-paso y en la interpretacion de capturas de pantalla ambiguas.
- La cuantizacion FP8 introduce una divergencia pequena pero medible (KL media 0,0028, p99 0,033) y una caida de 2,8 puntos en tareas de navegador, dentro del ruido pero no nula.
- El servido requiere SGLang con flags especificos y `--trust-remote-code`; no se documentan rutas alternativas de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-4B y conviene revisar el enlace de licencia original.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/nib-4b-preview-FP8
- Modelo base Nib 4B: https://huggingface.co/ProCreations/nib-4b-preview
- Modelo base original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- BetterWright 4B en LLM Explorer: https://llm-explorer.com/model/ProCreations%2FBetterWright-4b,3NyB7G6fSR29ucbdzCum6c
