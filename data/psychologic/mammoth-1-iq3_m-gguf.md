# PsychoLogic/mammoth-1-IQ3_M-GGUF

## Resumen

mammoth-1-IQ3_M-GGUF es una cuantización en formato GGUF del modelo base `baselabs/mammoth-1`, publicada por el usuario PsychoLogic. El modelo base es un transformer de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los safetensors originales) especializado en lo que el autor denomina "decision-model": un modelo orientado a producir decisiones estructuradas a partir de prompts, con un protocolo de lectura de "slots" y "opciones" mediante un fichero `readout.json` y un tipo de decisión identificado como `openjev`.

La relevancia de esta ficha radica en que la cuantización IQ3_M permite ejecutar un modelo de ~27B parámetros en una GPU de consumo de 16 GB (el autor reporta 11.988 MiB en un dry-run, es decir, 3,74 bits por peso), algo que con pesos en fp16 sería inviable en ese hardware. El repo ocupa 12,6 GB y se distribuye bajo licencia MIT.

Cabe señalar que la información pública disponible es limitada: la model card del autor se centra casi exclusivamente en el proceso de cuantización y en una prueba de humo sobre tráfico real, y remite al modelo base para detalles de arquitectura, entrenamiento y benchmarks. Esta ficha refleja esa escasez de datos de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducido del uso de `convert_hf_to_gguf.py` y del pipeline de llama.cpp); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el autor sirve con `-c 4096` en sus pruebas |
| Tipos de cuantizacion | IQ3_M (esta ficha); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantización); pesos originales presumiblemente safetensors |
| Tamano del repo | 12,6 GB |
| Bits por peso (BPW) | 3,74 |
| Memoria en inferencia (dry-run) | 11.988 MiB |
| Modelo base | baselabs/mammoth-1 |
| Herramienta de cuantización | llama.cpp (`convert_hf_to_gguf.py` + `llama-quantize`, master `0a731cc` con parches) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que es compatible con el pipeline de conversión de llama.cpp, lo que implica una arquitectura transformer estándar con atención multi-cabeza y capas de feed-forward. El modelo se presenta como un "decision-model": según la model card, el modelo produce una lectura de "slot" y "opción" en un único forward pass, guiada por un fichero `readout.json` que define los slots disponibles. El GGUF generado incorpora el metadato `qwen35.decision.type = openjev`, lo que sugiere que el formato de decisión sigue convenciones heredadas de la familia Qwen (aunque esto es una inferencia a partir del nombre del campo, no un dato confirmado).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. Lo único verificable es el proceso de cuantización: el autor aplicó `convert_hf_to_gguf.py` con parches propios (recogidos en `patches/`, bajo Apache-2.0 sobre el upstream de llama.cpp) para preservar la semántica de los pesos originales y el mecanismo de lectura de slots, y luego cuantizó con `llama-quantize` a IQ3_M.

## Capacidades

- Generación de decisiones estructuradas: el modelo emite una selección de slot y opción en un único forward pass, según el protocolo descrito en la model card del modelo base.
- Modo conversacional: la etiqueta `conversational` del repo indica uso en diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs de inferencia estándar.
- Razonamiento multi-paso: no disponible (no documentado).
- Tool calling / function calling: no disponible (no documentado).
- Capacidades multilingües: no disponible (no se listan idiomas).
- Visión, audio u otras modalidades: no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Toma de decisiones automatizada en pipelines de trading: el autor validó el modelo reproduciendo 7.854 llamadas reales de decisión extraídas de una ventana de trading de 14 días (muestreo cada 10 de 78.534 llamadas), con 0 errores en la lectura de slot/opción. Esto lo hace adecuado para sistemas que necesitan clasificar o seleccionar opciones de forma determinista y reproducible.
- Clasificación de intenciones en atención al cliente: dado un prompt de usuario, el modelo puede mapearlo a un slot predefinido (por ejemplo, tipo de incidencia) y una opción concreta, con la ventaja de que la salida es estructurada y verificable.
- Enrutamiento de tickets o incidencias: uso del mecanismo de slots para asignar categoría y prioridad a cada ticket en un sistema de soporte, con contexto de 4.096 tokens en la configuración probada por el autor.
- Despliegue en estaciones de trabajo con GPU de 16 GB: al caber en 11.988 MiB con IQ3_M, permite ejecutar un modelo de ~27B en GPUs de consumo (por ejemplo, RTX 5060 Ti) sin infraestructura de servidor.
- Prototipado de agentes con decisiones acotadas: en lugar de generar texto libre, el modelo puede usarse como "cabeza de decisión" dentro de un agente, eligiendo entre un conjunto finito de acciones definidas en `readout.json`.
- Evaluación offline de políticas de decisión: al ser reproducible byte a byte (el autor destaca "byte-exact prompts"), sirve para reejecutar históricos de decisiones y auditar cambios de política antes de desplegarlos.
- Inferencia local con llama.cpp en Docker: el autor documenta un despliegue reproducible con `nvidia/cuda:12.8.1`, `-c 4096 -b 4096 -ub 4096 --parallel 1` y caché KV q8_0, útil para entornos sin acceso a GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato de rendimiento reportado por el autor es una prueba de humo sobre tráfico real:

| Prueba | Configuracion | Resultado |
|---|---|---|
| Replay de llamadas de decisión reales | 7.854 llamadas (muestreo stride-10 de 78.534), prompts byte-exact, forward único | 0 errores |
| Memoria en inferencia | IQ3_M, dry-run | 11.988 MiB |
| Hardware de prueba | RTX 5060 Ti (15.846 MiB), llama.cpp en Docker CUDA 12.8.1 | Un modelo residente, `-c 4096`, KV q8_0 |

No se reportan latencias ni throughput (tokens/s) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 11.988 MiB con IQ3_M (3,74 BPW) según dry-run del autor; el fichero GGUF ocupa 12,6 GB.
- GPU recomendadas: RTX 5060 Ti (16 GB) es la hardware de referencia probada; otras GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, A4000) deberían ser suficientes por capacidad, aunque no están verificadas en la información disponible.
- ¿Cabe en consumer GPU? Sí, en GPUs de 16 GB de VRAM según las mediciones del autor. No cabe en GPUs de 8 o 12 GB con esta cuantización.
- Opciones de despliegue: llama.cpp (master `0a731cc` más los parches del repo), en Docker con `nvidia/cuda:12.8.1`. Otros runners (vLLM, TGI, Ollama) no están documentados para esta cuantización.
- Configuración de referencia: `-c 4096 -b 4096 -ub 4096 --parallel 1` con caché KV q8_0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría, ya que no se dispone de benchmarks del modelo base ni de especificaciones de modelos "decision" comparables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mammoth-1-IQ3_M | ~26,9B | No disponible (servido a 4.096 en pruebas) | MIT | GGUF | Cuantización de baselabs/mammoth-1; orientado a decisiones |
| baselabs/mammoth-1 | ~26,9B | No disponible | No disponible en esta ficha | Safetensors (presumible) | Modelo base original; sin benchmarks publicados en la información disponible |
| Alternativas de ~27B (p. ej., Qwen, Gemma, Mistral) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta la composición del dataset de entrenamiento.
- Riesgo de alucinación: no evaluado; el modelo está orientado a decisiones acotadas por slots, lo que reduce la superficie de alucinación en texto libre, pero no hay datos públicos al respecto.
- Limitaciones de contexto: la model card no especifica la ventana de contexto nativa; las pruebas se hicieron con `-c 4096`, por lo que no se garantiza un rendimiento correcto con contextos mayores.
- Idiomas: no se listan idiomas soportados; no se puede asumir cobertura multilingüe.
- Licencia: MIT permite uso comercial, modificación y redistribución con atribución; el autor remite a la licencia y atribución del modelo base.
- Caveat de producción: la cuantización IQ3_M introduce pérdida de precisión; el autor afirma que la semántica de los pesos originales se mantiene, pero solo lo valida con 0 errores en una prueba de decisión, no en generación abierta.
- Dependencia de parches: requiere llama.cpp master `0a731cc` más los parches del repo (`patches/*.patch`); sin ellos, el detector `slot_lm` no reconoce el `readout.json` del modelo.
- Madurez: 14 descargas y 0 likes en el momento de la consulta; modelo muy reciente (creado el 14 de noviembre de 2026) y con poca validación comunitaria.
- Trazabilidad: el repo incluye `SHA256SUMS` para verificar la integridad de los ficheros.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/PsychoLogic/mammoth-1-IQ3_M-GGUF
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Licencia MIT: https://opensource.org/licenses/MIT
- llama.cpp (herramienta de cuantización): https://github.com/ggml-org/llama.cpp
