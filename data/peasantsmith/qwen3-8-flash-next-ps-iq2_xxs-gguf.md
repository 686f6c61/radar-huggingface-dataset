# peasantsmith/Qwen3.8-Flash-Next-PS-IQ2_XXS-GGUF

## Resumen

Qwen3.8-Flash-Next-PS-IQ2_XXS es una cuantizacion GGUF del modelo Qwen3.8-Flash-Next de Qwen, producida por el usuario peasantsmith. El modelo original es un MoE ultra-disperso multimodal de 176.9B parametros totales (incluyendo una tabla n-gram PLE de 51.2B) que activa solo 6B parametros por token, y esta construido sobre la arquitectura Qwen4 con atencion hibrida GDN + QSA. Esta variante GGUF reduce el modelo original BF16 a un unico archivo de 75.2 GB con una media de 3.40 bits por parametro, lo que permite ejecutarlo en una configuracion de 3 GPUs de 12 GB VRAM.

La relevancia de esta cuantizacion reside en su estrategia de precision selectiva por componente: en lugar de aplicar una cuantizacion uniforme, asigna distintos niveles de cuantizacion segun la sensibilidad de cada tensor. La tabla PLE, que representa aproximadamente el 28% del modelo, se mantiene en IQ4_NL (4.5 bpw), mientras que los expertos de gate/up se comprimen a IQ2_XXS (2.06 bpw) y los down-projections a Q4_0. Los routers, normas y biases se conservan en F32.

El modelo base soporta una ventana de contexto de 262K tokens, es multimodal (incluye un vision encoder separado en F16) y ha sido probado por el autor con tareas de generacion larga, tool calling, recuperacion de contexto y vision. La licencia es qwen-community-1.0, no apta para uso comercial sin revision de sus terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-disperso con atencion hibrida GDN + QSA (Qwen4) |
| Parametros totales | 176.943.899.520 (176.9B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (64K probados en la cuantizacion) |
| Tipos de cuantizacion | IQ2_XXS (media 3.40 bpw); desglose: PLE en IQ4_NL, gate/up en IQ2_XXS, down en Q4_0, attention en Q4_K, embeddings en Q6_K, output head en Q8_0, routers/normas en F32, vision encoder en F16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (archivo unico de 75.2 GB + mmproj de 0.90 GB) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea la arquitectura Qwen4, que introduce cuatro innovaciones principales: atencion, residual, embedding y optimizacion. El bloque de atencion es hibrido: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de largo alcance. Esta combinacion reduce el coste computacional frente a atencion full-attention manteniendo la capacidad de recuperar informacion distante.

El modelo incluye una tabla de embeddings por capa (PLE, per-layer embedding) de 51.2B parametros, que funciona como una tabla n-gram y constituye el componente mas grande del modelo. Esta tabla se mantiene en IQ4_NL en esta cuantizacion para preservar su contribucion al residuo. Los down-projections de los expertos se mantienen un nivel por encima de los gate/up (Q4_0 frente a IQ2_XXS) porque sus errores se suman directamente al residual stream, mientras que los errores de gate/up pasan primero por activaciones.

Los datos de entrenamiento del modelo original no se detallan en la informacion disponible. La cuantizacion se realizo con llama.cpp, partiendo de los pesos BF16 oficiales, aplicando importance matrix de unsloth auditada para cubrir todos los tensores cuantizados. No se menciona uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto con razonamiento avanzado: el modelo base supera en benchmarks a Claude-4.6-Opus (Max) segun las pruebas de unsloth, y mantiene coherencia en generacion de mas de 3000 tokens continuos segun las pruebas del autor de la cuantizacion.
- Tool calling y function calling: probado con una llamada JSON bien formada (`{"city":"Paris"}`) para una funcion `get_weather`.
- Razonamiento multi-paso y codigo: completado correctamente una tarea de implementacion de cache LRU con un prompt de 7.5K tokens.
- Recuperacion de contexto largo: recuperacion correcta de una aguja en un prompt de ~6K tokens; generacion coherente a 64K tokens de contexto sin degradacion.
- Capacidades multimodales: el vision encoder se incluye como archivo separado `mmproj` en F16 con los 334 tensores completos; probado con identificacion de color en imagenes.
- Compatible con chat template Jinja integrado en el archivo GGUF.
- Compatible con endpoints OpenAI-style mediante `llama-server` (etiqueta `endpoints_compatible`).

## Casos de uso

- Despliegue de un asistente conversacional local en hardware modesto: con 36 GB de VRAM (3×12 GB) o 75 GB de RAM unificada, es posible ejecutar un modelo de 176.9B parametros que de otro modo requeriria multiples GPUs de 80 GB. Adecuado para entornos air-gapped o con restricciones de transferencia de datos.
- Generacion de codigo en entornos de desarrollo aislados: el modelo completa tareas de implementacion complejas (como el cache LRU probado) y puede integrarse en pipelines de CI/CD para generar tests, documentacion o parches, sin depender de servicios en la nube.
- Agentes autonomos con tool calling: el soporte de function calling permite construir agentes que consultan APIs (clima, bases de datos, sistemas internos) y ejecutan acciones, con la ventaja de un coste de inferencia bajo gracias a los 6B parametros activos por token.
- Analisis de documentos largos: la ventana de 262K tokens permite procesar contratos, informes tecnicos o codigo fuente extenso en una sola pasada, con recuperacion fiable de datos especificos (probado con la prueba de aguja a 6K tokens y generacion coherente a 64K).
- Razonamiento multimodal con vision: combinando el archivo `mmproj`, el modelo puede analizar imagenes junto con texto, util para sistemas de soporte con capturas de pantalla, documentacion visual o inspeccion de diagramas tecnicos.
- Investigacion sobre cuantizacion de MoE ultra-dispersos: el desglose de cuantizacion por componente (IQ4_NL para PLE, IQ2_XXS para expertos, Q4_0 para down) documenta una estrategia replicable que puede servir de referencia para otros modelos con tablas n-gram o componentes heterogeneos.
- Servicio de inferencia con API compatible con OpenAI: mediante `llama-server` con `--jinja`, se puede exponer el modelo como endpoint REST para integrarlo en aplicaciones existentes sin cambios en el codigo cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion especifica en la informacion disponible. El autor proporciona una bateria de pruebas funcionales:

| Test | Resultado |
|---|---|
| Generacion con contexto completo (64K) | Coherente en profundidad, sin degradacion |
| Estabilidad de generacion larga | ≥3000 tokens continuos a velocidad estable, sin degradacion |
| Tool calling (llamada JSON `get_weather`) | Llamada bien formada `{"city":"Paris"}` |
| Recuperacion de contexto largo (prompt ~6K, prueba de aguja) | Numero recuperado correctamente |
| Tarea de codigo cache LRU (prompt de 7.5K) | Implementacion completa y correcta |
| Smoke test greedy ("The capital of France is") | "Paris" con `finish=stop` |
| Vision via mmproj (identificacion de color) | Correcto |
| Perplexity (wikitext-2) | No medido (el autor indica que el BF16 de referencia no cabe en el mismo hardware) |

El autor advierte explicitamente que existe un delta real de calidad frente a BF16 por la naturaleza de los expertos en 2 bits, y que se espera degradacion en conocimiento de cola larga.

## Requisitos de hardware

- Archivo principal: 75.2 GB (texto) + 0.90 GB (vision encoder), total ~76.1 GB en disco.
- VRAM minima: configuracion de 3×12 GB (36 GB VRAM total) segun el autor, con la posibilidad de verter expertos a RAM del sistema mediante `--n-cpu-moe`.
- Alternativa sin GPU: ejecucion en CPU con 75 GB de RAM/unified memory segun unsloth.
- GPUs recomendadas: RTX 3090/4090 (12-24 GB) en configuracion multi-GPU, o A100/H100 si se busca mayor velocidad.
- Despliegue: llama.cpp (`llama-server`) con soporte de arquitectura `qwen4exp`; requiere una version reciente de llama.cpp. Compatible con Ollama y endpoints OpenAI-style.
- Parametros de ejecucion recomendados: `-ngl` para capas en VRAM y `--n-cpu-moe` para expertos fuera de VRAM.
- Latencia y throughput: no se proporcionan medidas concretas; el autor reporta "velocidad estable" en generacion de 3000+ tokens sin valores numericos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Tamano archivo | Precision | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16 original) | 176.9B | 6B | 262K | ~350 GB (estimado) | BF16 completa | qwen-community-1.0 |
| Qwen3.8-Flash-Next-PS-IQ2_XXS (esta cuantizacion) | 176.9B | 6B | 262K | 75.2 GB | IQ2_XXS mixta (3.40 bpw) | qwen-community-1.0 |
| Claude-4.6-Opus (Max) | no disponible | no disponible | no disponible | no disponible | propietario | propietaria |

Segun unsloth, el modelo base Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max) en benchmarks, aunque no se detallan los resultados concretos en la informacion disponible. No se dispone de datos de otras cuantizaciones GGUF del mismo modelo para comparar directamente el impacto en calidad de esta frente a otras.

## Limitaciones y advertencias

- Los expertos en IQ2_XXS (2.06 bpw) introducen un delta real de calidad frente a BF16 por construccion; se espera degradacion en conocimiento de cola larga y en tareas de precision alta.
- La licencia qwen-community-1.0 es una licencia personalizada de Qwen ("other" en HuggingFace); requiere revision de sus terminos antes de uso comercial, especialmente en cuanto a restricciones de distribucion y atribucion.
- El modelo es multimodal pero el vision encoder se distribuye como archivo separado (`mmproj`); si no se carga ambos archivos, las capacidades de vision no estan disponibles.
- Requiere una version reciente de llama.cpp con soporte de arquitectura `qwen4exp`; versiones antiguas no podran cargar el modelo.
- El MTP head (multi-token prediction) no esta embebido en la cuantizacion, tal como lo dejo Qwen en el modelo original.
- No se ha medido perplexity en esta cuantizacion; el autor reconoce que no existe una baseline comparable en el mismo hardware.
- Los idiomas soportados no estan documentados en la informacion disponible; aunque el modelo base de Qwen es tipicamente multilingue, no hay confirmacion para esta variante.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que es una publicacion reciente con adopcion limitada y poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/peasantsmith/Qwen3.8-Flash-Next-PS-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentacion de unsloth para ejecucion local: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
