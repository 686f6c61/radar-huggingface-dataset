# Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign

## Resumen

Llama-3.1-8B-Instruct-MetaSecAlign es un ajuste defensivo del clásico meta-llama/Llama-3.1-8B-Instruct centrado en mitigar la inyección indirecta de prompts (indirect prompt injection): instrucciones maliciosas embebidas en datos no confiables (documentos, correos, salidas de herramientas) que intentan desviar al modelo de su tarea legítima. El repositorio, publicado por Sizhe-Chen, contiene un merge BF16 autónomo del adaptador LoRA de facebook/Meta-SecAlign-8B sobre el modelo base, de modo que no hace falta cargar ningún adaptador externo.

El entrenamiento defensivo emplea Direct Preference Optimization (DPO) sobre pares de preferencias de seguridad construidos con inyecciones estáticas (el baseline "non-AT DPO" con un paso de ataque simulado, en la terminología del artículo SecPO). Según el manuscrito SecPO citado en la model card, este enfoque reduce la tasa de éxito de ataques (ASR) estáticos del 98,1 % al 1,8 %, aunque los ataques adaptativos (Genetic, TAP, PISmith) siguen siendo muy efectivos (89,1 %, 84,6 % y 95,1 % de ASR).

Su relevancia actual radica en la creciente exposición de LLMs a contenido no confiable en pipelines RAG y agentes. El modelo mantiene la utilidad del base casi intacta (MMLU-Pro 46,7 % frente a 46,5 %) e incorpora una plantilla de chat con frontera de confianza explícita entre mensajes `user` (confiables) e `input` (no confiables). Arquitectura LlamaForCausalLM, 8.030.261.248 parámetros, contexto nativo de 131.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder causal, solo texto) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 sin cuantizar) |
| Idiomas soportados | Ingles (según la model card; el base Llama 3.1 soporta más idiomas, pero no se declara aqui) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (4 shards BF16, 16.060.556.344 bytes de pesos; repo total 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.1-8B-Instruct, un transformer decoder causal de 8 mil millones de parametros con contexto nativo de 128K tokens. Sobre él se entrenó un LoRA de rango 64 y alpha 8 aplicado a las proyecciones `q_proj`, `v_proj`, `gate_proj`, `up_proj` y `down_proj`, que ya viene fusionado (merged) en los pesos publicados. No se aplico cuantizacion ni compresion que altere valores de tensores; el autor advierte que el redondeo BF16 habitual durante el merge no implica inferencia bit-identica respecto a cargar el adaptador por separado.

El entrenamiento defensivo usa DPO sobre pares de preferencias de seguridad derivados del dataset Cleaned-Alpaca (yahma/alpaca-cleaned), con inyecciones estáticas y un único paso de ataque simulado. Es el baseline "non-AT DPO" del articulo SecPO: a diferencia de SecPO, que emplea entrenamiento adversarial online-adaptativo con 240 pasos de ataque simulados, Meta-SecAlign no realiza entrenamiento adversarial iterativo. La plantilla de chat, copiada del repositorio SecPO de referencia, elimina ocho delimitadores de rol/control de Llama del contenido de `input`, `tool` e `ipython` (incluyendo delimitadores anidados expuestos al eliminar), exige un mensaje `user` confiable antes de cualquier `input` y no emite turnos de sistema implicitos ni metadatos de fecha/cutoff.

## Capacidades

- Generacion de texto conversacional e instruccion-following, heredada de Llama-3.1-8B-Instruct.
- Razonamiento general y matematicas: MMLU-Pro 46,7 %, GPQA Diamond 24,2 %, GSM8K 84,4 % (según Table 1 del manuscrito SecPO).
- Defensa contra inyeccion indirecta de prompts: capacidad diferencial principal respecto al modelo base, entrenada con DPO sobre pares de seguridad.
- Frontera de confianza estructurada: distincion entre mensajes `user` (confiables) e `input` (no confiables) en la plantilla de chat, con filtrado de delimitadores de control.
- Compatibilidad con tool calling: la plantilla renderiza descripciones de herramientas proporcionadas por el llamador y contenido de `tool`/`ipython` con saneamiento; no se documenta soporte nativo de function calling mas alla de lo heredado del base.
- Ventana de contexto larga (131.072 tokens) para procesar documentos extensos no confiables.
- No incluye capacidades de vision ni audio (modelo solo texto).

## Casos de uso

- Procesamiento seguro de documentos en RAG: el contenido recuperado de fuentes externas va en el rol `input`, reduciendo el riesgo de que instrucciones maliciosas embebidas en los documentos desvien al modelo de la consulta del usuario.
- Resumen de correo y web: al leer correos o paginas con contenido potencialmente atacante, la plantilla con filtrado de delimitadores y el fine-tuning DPO reducen la ejecucion de instrucciones inyectadas.
- Agentes que consumen salidas de herramientas: los retornos de herramientas (`tool`, `ipython`) se saneian y tratan como no confiables, util en pipelines de automatizacion donde APIs de terceros pueden devolver texto manipulado.
- Analisis de datos no confiables con contexto largo: la ventana de 131K tokens permite analizar documentos o logs extensos manteniendo la instruccion confiable separada.
- Investigacion en seguridad de LLMs: al ser el baseline non-AT DPO del articulo SecPO, sirve como punto de comparacion para estudiar entrenamiento adversarial frente a DPO estatico en defensa de inyeccion de prompts.
- Chatbot corporativo con fuentes externas: aplicaciones multi-turno donde el usuario es confiable pero el material que el sistema le inyecta no lo es, aprovechando que la utilidad general (MMLU-Pro, GSM8K) se mantiene practicamente igual al base.

## Benchmarks y rendimiento

Datos transcritos de la Table 1 (pagina 8) del manuscrito SecPO (29 de octubre de 2026), tal como aparecen en la model card. Todos los valores son porcentajes; mayor es mejor. La suite completa no se reejecuto tras el empaquetado de este repositorio.

| Benchmark | Metrica | Llama-3.1-8B-Instruct (undefended) | Meta-SecAlign (este modelo) | SecPO |
|---|---|---:|---:|---:|
| MMLU-Pro | Puntuacion | 46,5 | 46,7 | 46,3 |
| GPQA Diamond | Puntuacion | 23,7 | 24,2 | 24,2 |
| GSM8K | Puntuacion | 82,9 | 84,4 | 81,3 |
| Minerva Math | Puntuacion | 49,2 | 48,8 | 50,1 |
| AlpacaEval2 | Win rate | 23,7 | 24,0 | 23,7 |

Seguridad (Attack Success Rate, menor es mejor), segun el mismo manuscrito:

| Ataque | ASR undefended | ASR Meta-SecAlign |
|---|---:|---:|
| Ataques estaticos (SEP) | 98,1 % | 1,8 % |
| Genetic | no disponible | 89,1 % |
| TAP | no disponible | 84,6 % |
| PISmith | no disponible | 95,1 % |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: unos 16 GB solo de pesos (16,06 GB en shards), mas KV cache y overhead; en la practica 20-24 GB de VRAM para contextos razonables.
- GPU recomendadas: una RTX 3090/4090 (24 GB) para inferencia local en BF16 con contexto moderado; A100 o H100 (40/80 GB) para contextos largos de hasta 131K tokens o despliegue con concurrencia.
- Consumer GPUs: cabe en una RTX 4090 o RTX 3090 en BF16 con contexto limitado; con cuantizacion a 4 bits (via GGUF o similar, si se genera por cuenta propia, ya que no se publican versiones cuantizadas) cabria en GPUs de 8-12 GB con perdida de precision.
- Opciones de despliegue: transformers (libreria nativa declarada), text-generation-inference y endpoints compatibles segun los tags del repositorio; el formato safetensors mergeado es directamente compatible con vLLM y TGI. No se publica GGUF, aunque la comunidad puede convertirlo para llama.cpp u Ollama.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Defensa anti-inyeccion | Licencia |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-MetaSecAlign | 8.030 M | 131.072 | DPO estatico (ASR estatico 1,8 %; adaptativo 84,6-95,1 %) | Llama 3.1 |
| Llama-3.1-8B-Instruct (base) | 8.030 M | 131.072 | Ninguna (ASR estatico 98,1 %) | Llama 3.1 |
| facebook/Meta-SecAlign-8B | 8.030 M | 131.072 | Igual defensa, publicado como adaptador LoRA sobre el base | Llama 3.1 |
| SecPO (Llama-3.1-8B, repositorio del mismo autor) | 8.030 M | 131.072 | Entrenamiento adversarial online-adaptativo (240 pasos de ataque) | no disponible |

## Limitaciones y advertencias

- Vulnerabilidad persistente a ataques adaptativos: Genetic, TAP y PISmith alcanzan ASR de 89,1 %, 84,6 % y 95,1 % respectivamente. No debe considerarse una defensa robusta frente a adversarios sofisticados.
- La defensa se entreno solo con inyecciones estaticas (un paso de ataque simulado); SecPO con entrenamiento adversarial online muestra mejores resultados en escenarios adaptativos segun el mismo articulo.
- La utilidad no es inmune al fine-tuning: GSM8K y Minerva Math varian (84,4 % y 48,8 % frente a 82,9 % y 49,2 % del base); conviene validar en la tarea de destino.
- La plantilla de chat es critica para la defensa: exige un mensaje `user` confiable antes de cualquier `input` y elimina delimitadores de control. Usar la plantilla estandar de Llama 3.1 en su lugar puede anular la proteccion y producir token IDs distintos.
- Idioma declarado: ingles. El rendimiento en castellano no esta evaluado ni declarado.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (limite de 700 millones de usuarios activos mensuales para la licencia estandar, obligacion de cumplir la politica de uso aceptable de Meta y de denominar el modelo con la marca "Llama").
- Riesgo de alucinacion: no se evalua en la documentacion disponible; hereda el comportamiento del modelo base.
- La suite de benchmarks no se reejecuto tras el empaquetado de este repositorio; las cifras provienen del manuscrito del autor.
- El merge BF16 no garantiza inferencia bit-identica respecto a cargar el adaptador LoRA por separado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-MetaSecAlign
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador upstream: https://huggingface.co/facebook/Meta-SecAlign-8B
- Plantilla/tokenizador de referencia: https://huggingface.co/Sizhe-Chen/Llama-3.1-8B-Instruct-SecPO/tree/c72f78efafdefbcd587cc9abefcd3da518ec7c57
- Dataset de entrenamiento: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Articulos arXiv referenciados en los tags: arXiv:2403.06833, arXiv:2510.09023, arXiv:2312.02119, arXiv:2603.13026, arXiv:2507.02735 (https://arxiv.org/abs/2403.06833, https://arxiv.org/abs/2510.09023, https://arxiv.org/abs/2312.02119, https://arxiv.org/abs/2603.13026, https://arxiv.org/abs/2507.02735)
- Resultados de evaluacion: evaluation_results.json dentro del repositorio del modelo
