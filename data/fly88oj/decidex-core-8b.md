# fly88oj/decidex-core-8b

## Resumen

Decidex v7 core 8B es un adaptador LoRA publicado por el usuario fly88oj (organización asociada al repositorio Decidex) sobre el modelo base Qwen/Qwen3-8B, congelado en BF16. No es un modelo generativo al uso: convierte un modelo de chat en un motor de decisión de estilo Jev, donde se introduce un estado y se obtienen decisiones tipadas con probabilidades asociadas en una sola pasada hacia delante y sin generar un solo token. La lectura se hace directamente sobre los logits de una posición concreta, lo que lo sitúa en la categoría de modelos de decisión estructurada, no de generación de texto libre.

El entrenamiento se basa en destilación de 17.954 muestras obtenidas de las salidas reales de la API oficial de Jev, distribuidas en cuatro rondas de generación y minado activo. El autor reporta una concordancia global del 97,7% (84/86) con el modelo oficial en su corpus de comparación de 87 preguntas, con 23/23 en la primitiva Choice top-1, 51/52 en decisiones Noul y 10/11 en el nivel modal de Score. El adaptador LoRA tiene rango 32 y alfa 64 sobre las proyecciones q/v/o, lo que representa únicamente un 0,24% de parámetros entrenables.

Su relevancia actual es doble: por un lado, permite replicar localmente el comportamiento de un servicio propietario de decisión estructurada con una latencia de una única pasada; por otro, es un caso poco habitual de destilación de logits soft-label sobre la posición de lectura de letras, en lugar de ajuste supervisado sobre texto. El repositorio ocupa 0,1 GB y la licencia es MIT, aunque con menos de una decena de descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B congelado) con adaptador LoRA r=32, alfa=64 sobre q_proj/v_proj/o_proj; salida por lectura de logits en posición de letra, sin decodificación autoregresiva |
| Parametros totales | Adaptador LoRA con 0,24% de parametros entrenables sobre un base de ~8.000 millones; el repositorio del adaptador ocupa 0,1 GB |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B, no especificada en la model card) |
| Tipos de cuantizacion | No se detallan cuantizaciones concretas en la model card; el autor referencia builds GGUF del adaptador fusionado para llama.cpp, Ollama y LM Studio en el repositorio `decidex-gguf` |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La pieza entrenada es un adaptador LoRA de rango 32 y alfa 64 aplicado exclusivamente a las proyecciones de consulta, valor y salida (q/v/o_proj) del modelo base Qwen/Qwen3-8B, que permanece congelado en BF16. La innovación principal no está en la arquitectura del transformer, sino en la cabeza de lectura: en lugar de decodificar tokens, el modelo se entrena con entropía cruzada sobre etiquetas suaves (soft-label cross-entropy) aplicada a la posición de lectura de logits correspondiente a las letras de la respuesta. De este modo, cada inferencia produce una distribución de probabilidad sobre las opciones tipadas de la primitiva correspondiente en una sola pasada hacia delante, sin generación autoregresiva.

El conjunto de datos, denominado `distill_dataset_v4.jsonl`, consta de 7.249 muestras compuesto por un barrido amplio, un subconjunto con mucho peso de la primitiva Score y la primera ronda de minado activo duplicada. Se entrenó durante 2 épocas con tamaño de lote 4 y acumulación de gradiente 2 sobre una única RTX 4090 de 24 GB, en aproximadamente 80 minutos. Las etiquetas no son sintéticas: provienen de 17.954 muestras de salidas reales de la API oficial de Jev, recogidas en cuatro rondas de generación y minado activo, según el autor. No se menciona uso de RLHF, DPO ni RLCD en el pipeline; las probabilidades son destiladas, no optimizadas por refuerzo.

## Capacidades

- Emisión de decisiones tipadas con distribuciones de probabilidad asociadas, leyendo directamente los logits de la posición de respuesta.
- Inferencia de una sola pasada hacia delante con cero tokens generados, lo que elimina la latencia de decodificación autoregresiva.
- Primitive Choice: selección top-1 entre opciones, con divergencia Jensen-Shannon de 0,0025 frente al modelo oficial según el autor.
- Primitive Noul: emisión de decisiones con concordancia del 98,1% (51/52) respecto a la API oficial en el corpus de comparación.
- Primitive Score: nivel modal con concordancia del 90,9% (10/11) en el corpus medido.
- Salida estructurada y type-safe, pensada para ser consumida por un esquema de tipos en lugar de texto libre.
- Compatibilidad byte a byte con la API oficial a través del servicio Decidex: el autor indica que ambos SDK oficiales han sido verificados.
- Soporte multilingüe en inglés, chino y japonés.
- No está diseñado para generación de texto libre, razonamiento abierto, código ni matemáticas; su función es la clasificación decisional estructurada.

## Casos de uso

- Enrutado de decisiones en agentes: dado un estado textual, el modelo devuelve la siguiente acción tipada con su probabilidad, lo que permite construir políticas de agente con umbrales de confianza explícitos y sin coste de decodificación.
- Sustitución local de una API propietaria de decisión: al ser compatible byte a byte con el servicio oficial vía `decidex serve`, permite migrar cargas de trabajo sin reescribir los SDK de cliente, reduciendo dependencia de proveedor y coste por llamada.
- Clasificación con calibración de incertidumbre en pipelines de datos: la salida de distribución permite descartar o escalar a revisión humana las decisiones con entropía alta, algo que un modelo generativo convencional no ofrece de forma nativa.
- Triaje y priorización en sistemas de atención: el coste de una pasada única hace viable aplicar el modelo a cada mensaje entrante para asignar categoría y nivel de prioridad con una latencia mínima.
- Guardarraíles y moderación en producción: la primitiva Choice con 23/23 de concordancia top-1 en el corpus medido lo hace apto para decidir entre permitir, bloquear o escalar contenido, siempre con validación propia sobre el dominio objetivo.
- Despliegue en local o en el borde: con builds GGUF del adaptador fusionado, puede ejecutarse en llama.cpp, Ollama o LM Studio, permitiendo inferencia en máquinas sin GPU dedicada o en entornos con requisitos de soberanía de datos.
- Regresión automatizada frente a un servicio de referencia: al replicar las salidas oficiales, se puede usar como oráculo barato para detectar cambios de comportamiento en el servicio propietario o en los propios prompts.
- Evaluación de scores y niveles en formularios o encuestas: la primitiva Score devuelve el nivel modal con su distribución, útil para normalizar respuestas heterogéneas en un pipeline estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor únicamente reporta métricas de concordancia con la API oficial de Jev sobre un corpus propio de 87 preguntas:

| Primitiva / metrica | Resultado |
|---|---|
| Choice top-1 | 23/23 (100%), divergencia JS de la distribucion 0,0025 |
| Noul decisions | 51/52 (98,1%) |
| Score, nivel modal | 10/11 (0,909) |
| Concordancia global | 84/86 (97,7%) |
| Desacuerdo de distribucion de generacion frente al modelo oficial | 4,6% (medicion de ronda de minado) |
| Baseline de 4B, mismo metrica de desacuerdo | 26% |

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real de VRAM lo determina el modelo base Qwen3-8B sobre el que se carga.
- Estimación en BF16 (precisión de entrenamiento declarada): en torno a 16 GB solo de pesos, más overhead de contexto y caché KV; una GPU de 24 GB es el mínimo cómodo.
- Estimación en 8 bits: aproximadamente 9-10 GB, apto para tarjetas de 12-16 GB.
- Estimación en 4 bits: aproximadamente 5-6 GB, apto para GPU de consumo de 8 GB o para CPU con llama.cpp.
- GPU recomendadas: RTX 4090 (la empleada en el entrenamiento, 80 minutos para el adaptador), A100, H100 para despliegues concurrentes; RTX 3090/4080/4090 para uso individual.
- Cabe en GPU de consumo: sí, siempre que se use cuantización de 8 o 4 bits; en BF16 es ajustado en tarjetas de 24 GB.
- Opciones de despliegue: servicio Decidex (`decidex serve --engine llm --model Qwen/Qwen3-8B --lora <adaptador> --device cuda:0`), vLLM o TGI para el modelo fusionado, y llama.cpp, Ollama o LM Studio mediante los builds GGUF del repositorio `decidex-gguf`.
- Latencia y throughput: no se publican cifras. Estructuralmente, al no generar tokens, la latencia equivale a una única pasada de prefill y el throughput es muy superior al de un modelo generativo del mismo tamaño, al no existir bucle de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decidex v7 core 8B (este adaptador) | Adaptador LoRA sobre 8B (0,24% entrenable) | No disponible | 84/86 (97,7%) de concordancia con la API oficial en corpus propio de 87 preguntas | MIT | HuggingFace, descarga directa |
| Decidex baseline 4B | ~4B | No disponible | 26% de desacuerdo de distribucion frente al modelo oficial | No disponible | No disponible en la informacion proporcionada |
| Qwen/Qwen3-8B sin adaptador | ~8B | No disponible en la informacion proporcionada | No disponible: el modelo base no esta entrenado para la tarea de decision tipo Jev | No disponible en la informacion proporcionada | HuggingFace |
| API oficial de Jev (TypeSafe AI) | No disponible | No disponible | Referencia de comparacion; concordancia 100% por definicion | Propietaria | Servicio alojado |

No se dispone de datos sobre otros adaptadores publicos de decision estructurada que permitan una comparacion adicional, por lo que la comparativa se limita a los elementos citados en la propia model card.

## Limitaciones y advertencias

- Las probabilidades son destiladas del modelo oficial, no entrenadas con RLCD; el autor reconoce desacuerdos residuales con la API oficial de entre el 2% y el 11% según la primitiva, descritos como diferencias semánticas y documentados en `COMPARISON.md`.
- No se han publicado evaluaciones estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible situarlo frente a modelos generalistas de tamaño comparable.
- El modelo es de propósito estrecho: está diseñado para emitir decisiones tipadas de estilo Jev, no para generación de texto libre, razonamiento abierto, código o matemáticas.
- Idiomas soportados limitados a inglés, chino y japonés; no se declara soporte de castellano, lo que restringe su uso directo en aplicaciones en español.
- No se especifica la longitud de contexto efectiva del sistema de decisión, dato crítico para estados largos.
- La model card afirma que es «la única línea pública entrenada hacia las respuestas reales del modelo oficial»; se trata de una afirmación del autor no auditada de forma independiente.
- El corpus de destilación procede de las salidas de una API comercial; conviene revisar los términos de servicio del proveedor antes de un uso comercial del adaptador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad ni informes de terceros.
- El adaptador está vinculado al esquema de tipos de Decidex; usarlo fuera de ese ecosistema requiere implementar la lectura de logits en la posición correcta.
- Aviso de marcas: el autor declara no estar afiliado a TypeSafe AI; Jev y TypeSafe son marcas registradas de sus titulares.
- Fecha de creación del repositorio registrada como 2026-09-23, posterior a la redacción de esta ficha, lo que refuerza la necesidad de tratar los datos como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fly88oj/decidex-core-8b
- Repositorio Decidex (incluye `REPRODUCE.md` y `COMPARISON.md`): https://github.com/fly88oj/decidex
- Repositorio de builds GGUF del adaptador fusionado (`decidex-gguf`): referenciado en la model card, URL concreta no disponible
- Modelo base: Qwen/Qwen3-8B en HuggingFace, URL concreta no proporcionada en la informacion disponible
- Paper o blog técnico: no disponible
