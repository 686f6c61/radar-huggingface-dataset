# mradermacher/LiquidCode-2.5-24B-A2B-GGUF

## Resumen

LiquidCode-2.5-24B-A2B-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo LiquidCode-2.5-24B-A2B, generada de forma estatica por el usuario mradermacher a partir del repositorio original de ItachiSan. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 23.971.587.712 parametros totales, de los cuales solo una fraccion (denominada A2B, presumiblemente unos 2 mil millones) se activan por token, lo que permite una inferencia considerablemente mas barata que un modelo denso del mismo tamano.

La relevancia de esta ficha radica en que el repositorio GGUF es el unico artefacto publicado hasta la fecha con pesos listos para ejecutarse en herramientas de inferencia local como llama.cpp u Ollama. Sin embargo, la informacion disponible es muy limitada: no se especifican licencia, idiomas, contexto, composicion del dataset ni resultados de benchmarks, y el repositorio no registra descargas ni interacciones, lo que sugiere una publicacion muy reciente y sin validacion comunitaria.

El modelo se presenta con la etiqueta "conversational" y parece orientado a generacion de codigo (por el nombre "LiquidCode"), pero no hay documentacion tecnica que confirme capacidades, entrenamiento o rendimiento. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun el sufijo A2B del nombre; detalles no disponibles |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B (inferido del sufijo A2B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 22.5 GB); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura de mezcla de expertos con 24 mil millones de parametros totales y aproximadamente 2 mil millones activos por token (patron habitual en la familia LFM2.5 de Liquid AI, aunque no se confirma la autoria del modelo base en la informacion disponible). La model card del repositorio GGUF no incluye ningun detalle sobre el numero de capas, dimension del hidden state, numero de expertos, atencion utilizada ni estrategia de enrutamiento.

Tampoco se dispone de informacion sobre el dataset de entrenamiento: no se indica el numero de tokens, la composicion (codigo, texto general, matematicas), ni si hubo fases de RLHF, DPO o instruction tuning. La unica referencia tecnica en la model card son los metadatos del proceso de cuantizacion (`quantize_version: 2`, `convert_type: hf`), que confirman que los pesos GGUF se derivaron de un checkpoint en formato Hugging Face. No se documenta ninguna innovacion adicional como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" del repositorio sugiere uso en dialogos multi-turno, aunque no hay documentacion que detalle el formato de prompt o la plantilla de chat.
- Generacion de codigo: el nombre "LiquidCode" apunta a un modelo especializado o ajustado para codigo, pero no se confirma en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local de codigo en estaciones de trabajo: al ser un MoE con ~2B parametros activos, el modelo puede ejecutarse en equipos con GPU de consumo usando las cuantizaciones Q4_K_M o Q5_K_M, lo que lo hace adecuado para autocompletado y asistencia de codigo sin conexion.
- Prototipado de asistentes conversacionales: el tag "conversational" y el formato GGUF permiten integrarlo rapidamente en llama.cpp u Ollama para validar flujos de chat antes de comprometerse con un modelo mayor.
- Despliegue en entornos con memoria limitada: las cuantizaciones Q2_K y Q3_K reducen el peso del modelo por debajo de los 10 GB, permitiendo ejecucion en portatiles con GPU de 8-12 GB de VRAM.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes (desde x-f16 hasta IQ4_XS), lo que facilita medir el impacto de la cuantizacion en la calidad de salida para un mismo modelo base.
- Servicio de generacion de codigo en CPU: con cuantizaciones bajas y llama.cpp, puede desplegarse en servidores sin GPU para tareas de baja concurrencia.
- Base para fine-tuning o experimentacion: al estar disponible el repo original en safetensors, el modelo GGUF sirve como referencia de comportamiento para comparar contra versiones ajustadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (aproximada, segun el tamano del repo de 22.5 GB y las cuantizaciones listadas):
  - x-f16: ~48 GB (no incluido en el repo, solo referenciado como variante).
  - Q8_0: ~25-26 GB.
  - Q6_K: ~20 GB.
  - Q5_K_M / Q5_K_S: ~17 GB.
  - Q4_K_M / Q4_K_S: ~14-15 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: ~11-13 GB.
  - Q2_K: ~9 GB.
  - IQ4_XS: ~13 GB.
- GPU recomendadas: A100 40/80 GB o H100 para f16/Q8_0; RTX 4090 (24 GB) para Q6_K y Q5_K; RTX 4080/4070 Ti (16 GB) para Q4_K_M; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q3_K y Q2_K.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4 y Q3; las variantes Q6 y Q8 requieren 20-26 GB y quedan fuera de GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints estilo OpenAI, pero no se detalla.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~2B parametros activos, se espera un throughput superior al de un denso de 24B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LiquidCode-2.5-24B-A2B (este) | ~24B | ~2B (inferido) | no disponible | no disponible | GGUF, safetensors |
| LFM2.5-24B-A2B | ~24B | ~2B (inferido) | no disponible | no disponible | GGUF |
| Alternativas densas de ~24B | ~24B | 24B | variable | variable | variable |

La unica alternativa identificada en la busqueda es LFM2.5-24B-A2B, tambien cuantizada por mradermacher y con nomenclatura identica, lo que sugiere que LiquidCode-2.5-24B-A2B podria ser un ajuste (fine-tuning) de esa familia. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre entrenamiento, datos, sesgos o evaluaciones, lo que impide validar el modelo para produccion.
- Licencia desconocida: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del repo base (ItachiSan/LiquidCode-2.5-24B-A2B) antes de cualquier despliegue.
- Riesgo de alucinacion no evaluado: sin benchmarks ni evaluaciones de seguridad publicadas.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Contexto desconocido: imposible planificar casos de uso que dependan de ventanas largas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad en modelos MoE; se recomienda Q4_K_M o superior para uso real.
- El tag `endpoints_compatible` no especifica que API exacta implementa; verificar antes de integrar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LiquidCode-2.5-24B-A2B-GGUF
- Modelo base (safetensors): https://huggingface.co/ItachiSan/LiquidCode-2.5-24B-A2B
- Repositorio relacionado de la misma familia: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-GGUF
