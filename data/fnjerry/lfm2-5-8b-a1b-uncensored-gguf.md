# fnjerry/LFM2.5-8B-A1B-Uncensored-GGUF

## Resumen

LFM2.5-8B-A1B-Uncensored-GGUF es una colección de cuantizaciones GGUF del modelo `zaakirio/LFM2.5-8B-A1B-Uncensored`, una version "abliterated" del modelo base `LiquidAI/LFM2.5-8B-A1B` de Liquid AI. El proceso de decensoring se realizo con la herramienta Heretic, que aplica ablacion direccional automatica sobre las proyecciones de atencion y MLP densas para eliminar el comportamiento de rechazo (refusal) del modelo original. Esta version GGUF la publica el usuario fnjerry y esta pensada para su ejecucion en llama.cpp, Ollama, LM Studio y cualquier herramienta construida sobre llama.cpp.

Arquitectonicamente se trata de un modelo MoE (mixture of experts) con 8.467.856.832 parametros totales y aproximadamente 1.000 millones de parametros activos por token. La arquitectura interna es `lfm2moe`, una combinacion hibrida de convolucion corta y atencion con 32 expertos, de los cuales 4 se activan por token. Esta orientado a despliegue en el borde (edge) y en hardware de consumo, gracias a su bajo numero de parametros activos.

El interes de esta ficha radica en que combina tres factores poco habituales: un modelo MoE de Liquid AI disenado para eficiencia en inferencia, una modificacion abliterated que elimina los rechazos, y un formato GGUF que permite ejecutarlo localmente en GPUs de consumo. La licencia lfm1.0 del modelo base se mantiene en este derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida (`lfm2moe`): convolucion corta + atencion, 32 expertos con 4 activos por token |
| Parametros totales | 8.467.856.832 (~8,47 mil millones) |
| Parametros activos | ~1 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm1.0 (licencia del modelo base LiquidAI/LFM2.5-8B-A1B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `lfm2moe`, propia de la familia LFM2.5 de Liquid AI. Se trata de un diseno hibrido que combina capas de convolucion corta con capas de atencion, organizado como una mezcla de expertos con 32 expertos y 4 activos por token. Esta configuracion permite que, pese a tener 8,47 mil millones de parametros totales, solo se activen aproximadamente 1.000 millones por token, lo que reduce el coste computacional de la inferencia y facilita su despliegue en hardware modesto.

Sobre el entrenamiento original no se dispone de datos en la informacion proporcionada: no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La modificacion respecto al modelo original consiste en una ablacion direccional automatica aplicada con Heretic, que altera las proyecciones de atencion y MLP densas. Segun la model card, la divergencia KL en prompts inofensivos es de 0,0481 frente al modelo original, y el numero de rechazos en 100 prompts daninos baja a 0 (el modelo original ya medía entre 0 y 2 rechazos en el detector de Heretic, por lo que el margen de mejora era limitado pero la ablacion produce cambios medibles).

## Capacidades

- Generacion de texto conversacional multi-turno en formato ChatML (plantilla embebida en los GGUF).
- Razonamiento y generacion de codigo: no hay datos especificos de benchmarks, pero la familia LFM2.5 esta orientada a tareas generales de texto.
- Soporte multilingue en nueve idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol y portugues.
- Comportamiento sin rechazos (uncensored): responde a peticiones que el modelo original declinaria.
- Compatibilidad con tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia eficiente en el borde gracias a los ~1.000 millones de parametros activos por token.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion direccional comparando su comportamiento con el modelo original, ya que se documenta una divergencia KL de 0,0481 en prompts inofensivos.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa que requiera tematicas que el modelo original rechazaria, ejecutada localmente.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M de 4,9 GB, el modelo cabe en GPUs de consumo con 6-8 GB de VRAM y ofrece velocidad de inferencia alta gracias a sus ~1.000 millones de parametros activos.
- Prototipado de asistentes conversacionales multilingues: cubre nueve idiomas, incluido el espanol, con una plantilla ChatML que la mayoria de herramientas aplican automaticamente.
- Servidor compatible con la API de OpenAI: `llama-server` permite exponer el modelo como endpoint compatible, util para integrarlo en pipelines existentes sin cambiar el cliente.
- Experimentacion con arquitecturas MoE hibridas: sirve para evaluar el rendimiento de `lfm2moe` en tareas de generacion de texto y comparar su eficiencia frente a transformers densos del mismo tamano.
- Fine-tuning o evaluacion de derivados abliterated: al estar en GGUF y disponible en BF16, puede usarse como referencia de calidad frente a otras cuantizaciones o como base para estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica cuantitativa proporcionada es la comparativa de decensoring:

| Metrica | Decensored | Original |
|---|---|---|
| Rechazos (/100 prompts daninos) | 0 | 0 |
| Divergencia KL (prompts inofensivos) | 0,0481 | 0 (por definicion) |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K 3,0 GB; Q3_K_S 3,5 GB; Q3_K_M 3,9 GB; IQ4_XS 4,3 GB; Q4_K_S 4,6 GB; Q4_K_M 4,9 GB (recomendada); Q5_K_S 5,5 GB; Q5_K_M 5,7 GB; Q6_K 6,5 GB; Q8_0 8,4 GB; BF16 16 GB.
- Cabe en GPUs de consumo: si, desde tarjetas con 6-8 GB de VRAM para Q4_K_M, y en configuraciones de 12-16 GB para Q6_K y Q8_0. La cuantizacion BF16 requiere 16 GB o mas.
- GPUs recomendadas: RTX 3060/4060 (8-12 GB) para Q4-Q5; RTX 4070/4080 (12-16 GB) para Q6-Q8; A100/H100 no son necesarias dado el bajo numero de parametros activos, pero acelerarian el throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan, textgen y cualquier herramienta basada en llama.cpp.
- Requisito critico: es necesario un build reciente de llama.cpp con soporte para `Lfm2MoeForCausalLM`; builds antiguos fallan con el error "unknown architecture 'lfm2moe'".
- Latencia y throughput: no se proporcionan cifras concretas; la model card indica que el throughput es rapido incluso en cuantizaciones grandes gracias a los ~1.000 millones de parametros activos, siempre que haya RAM suficiente.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-Uncensored-GGUF (este) | 8,47 mil millones | ~1 mil millones | no disponible | lfm1.0 | GGUF |
| LiquidAI/LFM2.5-8B-A1B (original) | 8,47 mil millones | ~1 mil millones | no disponible | lfm1.0 | safetensors/GGUF |
| zaakirio/LFM2.5-8B-A1B-Uncensored (fuente BF16) | 8,47 mil millones | ~1 mil millones | no disponible | lfm1.0 | safetensors |

No se dispone de datos de rendimiento comparativo con otras familias de modelos (por ejemplo, MoE de tamano similar de otros fabricantes) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: se ha eliminado sustancialmente el comportamiento de rechazo, por lo que respondera a peticiones que el modelo original declinaria. El uso es responsabilidad del usuario.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion; al ser un modelo de ~8,47 mil millones de parametros, cabe esperar tasas de error factual superiores a las de modelos de mayor tamano.
- Licencia lfm1.0: la licencia del modelo base se mantiene en este derivado y puede imponer restricciones al uso comercial; es necesario revisar los terminos antes de desplegarlo en produccion.
- Compatibilidad de herramientas: requiere un build reciente de llama.cpp con soporte `lfm2moe`; versiones antiguas de Ollama, LM Studio o llama.cpp no cargaran el modelo.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que limita la planificacion de casos de uso con documentos largos.
- Idiomas: aunque se listan nueve idiomas, no se aportan metricas de calidad por idioma; el rendimiento en espanol, arabe o coreano no esta cuantificado.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Procedencia: el autor original de las cuantizaciones segun la model card es zaakirio, mientras que el repositorio lo publica fnjerry; conviene verificar la integridad de los ficheros antes de usarlos en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fnjerry/LFM2.5-8B-A1B-Uncensored-GGUF
- Modelo fuente (BF16): https://huggingface.co/zaakirio/LFM2.5-8B-A1B-Uncensored
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
