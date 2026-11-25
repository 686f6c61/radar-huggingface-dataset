# mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje de 4.326.350.848 parametros (~4,3 B) resultante de la fusion mediante SLERP de dos ramas del modelo base xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic. La ficha que nos ocupa es la cuantizacion GGUF publicada por mradermacher bajo el esquema i1 (imatrix), que incluye 16 variantes de cuantizacion entre Q2_K e Q6_K, ademas del fichero imatrix para generar cuantizaciones propias.

El modelo combina linaje Qwen3.5 con destilacion de trazas de razonamiento atribuidas a Claude Opus 4.6/4.7 y DeepSeek, segun los datasets declarados (Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces). La etiqueta "heretic" indica que la fusion ha sido sometida a un proceso de decensurado o ablacion de rechazos, lo que afecta directamente a su comportamiento en produccion.

Es relevante para desarrolladores que necesitan un modelo pequeno (~4 B) ejecutable en hardware de consumo, con capacidades declaradas de razonamiento, codigo, tool calling y agentes, y licencia Apache 2.0. La model card del cuantizador es minima: no aporta detalles de entrenamiento, contexto ni benchmarks, por lo que muchos parametros tecnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (linaje Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, IQ4_XS, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; fichero imatrix aparte |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es una fusion SLERP (spherical linear interpolation) de dos ramas del checkpoint Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic, que a su vez parte de la familia Qwen3.5. La nomenclatura del nombre indica la composicion: base Qwen3.5 de 4 B, destilacion de trazas de Claude Opus y DeepSeek, fusion SLERP de dos ramas y posterior paso "heretic" de ablacion de comportamientos de rechazo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovacion tecnica principal de esta publicacion es la cuantizacion i1 con imatrix, que emplea una matriz de importancia calculada sobre el modelo para ponderar la cuantizacion de cada tensor. Segun la model card, las variantes IQ superan en calidad a las Q de tamano equivalente (por ejemplo, IQ3_S frente a Q3_K_M). El modelo base se etiqueta como modelo de vision, con ficheros mmproj alojados en el repositorio estatico hermano; no se especifica que codificador visual utiliza.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning") derivado de trazas destiladas de Claude Opus y DeepSeek.
- Generacion de codigo (etiqueta "coding").
- Matematicas y STEM (etiquetas "math" y "stem").
- Tool calling y function calling (etiquetas "tool-use" y "function-calling").
- Uso en agentes y razonamiento multi-paso (etiqueta "agent").
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Vision: el modelo base se declara como modelo de vision, con ficheros mmproj en el repositorio estatico; no se detalla el alcance.
- Comportamiento decensurado ("uncensored", "decensored", "heretic"): menor tendencia a rechazar peticiones.

## Casos de uso

- Asistente de codigo en local: con cuantizaciones de 2,7-3,3 GB (IQ4_XS a Q5_K_M) cabe en GPUs de consumo y permite autocompletado, explicacion y refactorizacion sin enviar codigo a la nube.
- Agente con tool calling en pipelines de automatizacion: las etiquetas de function calling y agent permiten integrarlo en orquestadores que invocan APIs, aunque requiere validacion propia porque no hay benchmarks publicados.
- Razonamiento matematico y STEM en entornos educativos o de prototipado: util para resolver problemas paso a paso en un modelo pequeno desplegable en portatiles.
- Procesamiento multilingue ligero (en, zh, es, ru, ja): traduccion y resumen de documentos en cinco idiomas con un unico modelo de ~3 GB cuantizado.
- Despliegue en edge o en dispositivos con poca VRAM: las variantes Q2_K e IQ3 permiten ejecucion en 2-3 GB de memoria, aptas para mini-PC o portatiles sin GPU dedicada.
- Experimentacion en investigacion sobre fusiones y decensurado: sirve como caso de estudio de fusion SLERP, destilacion de trazas y ablacion de rechazos en modelos pequenos.
- Generacion de texto creativo sin restricciones de rechazo: el paso "heretic" lo hace adecuado para escritura de ficcion que otros modelos alineados rechazarian, con la supervision humana correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio base no aporta datos verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~2,1 GB; i1-IQ3_S ~2,3 GB; i1-Q4_K_M ~2,9 GB; i1-Q5_K_M ~3,3 GB; i1-Q6_K ~3,7 GB. Anadir margen para el contexto KV cache (no disponible el tamano de contexto, por lo que el margen debe calibrarse en pruebas).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 6-8 GB con cuantizaciones Q3-Q4.
- GPU de datacenter: A100, H100 y L40S lo ejecutan sin problema, aunque su tamano hace innecesario ese hardware salvo por agregacion de muchas instancias.
- CPU: las variantes Q2_K a Q4_K_M son viables en CPU con llama.cpp, con throughput bajo pero funcional.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI (la etiqueta endpoints_compatible sugiere compatibilidad con endpoints estandar). vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-4B-...-heretic-i1-GGUF (este) | ~4,3 B | no disponible | Apache 2.0 | GGUF i1 | Fusion SLERP + destilacion + decensurado; 16 cuantizaciones |
| Qwen3.5 4B (familia base) | ~4 B | no disponible | segun variante | safetensors, GGUF | Modelo original alineado; sin destilacion de trazas |
| mradermacher/Wukong-4B-...-GGUF (estatico) | ~4,3 B | no disponible | Apache 2.0 | GGUF estatico | Misma base, cuantizaciones sin imatrix |
| Alternativas de ~4 B (p. ej. Llama 3.2 3B, Phi-3.5-mini) | 3-4 B | 128 K (segun modelo) | licencias propias | multiples | No comparables en benchmarks por falta de datos de este modelo |

La comparacion cuantitativa de rendimiento no es posible con la informacion disponible: no hay benchmarks publicados para este checkpoint ni datos del autor que permitan situarlo frente a alternativas de su categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en razonamiento, codigo o matematicas; cualquier evaluacion debe hacerse por cuenta propia antes de produccion.
- Modelo decensurado ("heretic"): la ablacion de rechazos puede producir respuestas inapropiadas o inseguras en dominios sensibles; requiere filtros externos y supervision humana.
- Riesgo de alucinacion: inherente a modelos de 4 B y agravado por la destilacion de trazas de terceros sin validacion conocida.
- Linaje de destilacion opaco: las trazas atribuidas a Claude Opus 4.6/4.7 y DeepSeek no son verificables y pueden introducir sesgos o estilos no deseados.
- Contexto no documentado: se desconoce la ventana real; no planificar cargas de contexto largo sin medirla.
- Idiomas: solo se declaran en, zh, es, ru y ja; el rendimiento en espanol no esta medido.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre el comportamiento decensurado y sobre posibles reclamaciones derivadas de contenido generado.
- El repositorio ocupa 39,6 GB por acumulacion de cuantizaciones; descargar solo el fichero necesario.
- Model card del cuantizador minima: sin instrucciones especificas de prompt template, lo que puede degradar resultados si se usa una plantilla incorrecta.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset de trazas Claude Opus 4.6: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset de trazas Claude Opus 4.7: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset de trazas de agentes Hermes: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
