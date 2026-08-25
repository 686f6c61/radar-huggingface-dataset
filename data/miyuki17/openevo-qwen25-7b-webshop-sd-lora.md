# miyuki17/openevo-qwen25-7b-webshop-sd-lora

## Resumen

`miyuki17/openevo-qwen25-7b-webshop-sd-lora` es un adaptador LoRA congelado (rank 32) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, publicado por el proyecto OpenEvo como artefacto de evaluación para la tarea de agente de compra web (WebShop). Se trata de un adaptador de tipo SD-LoRA (continual SFT con replay acotado de trayectorias y dirección global congelada), entrenado en la campaña H1.38B method-control y evaluado como el brazo `OPEN_EVO_SD` en la comparativa oficial held-out de WebShop de SEED.

El modelo resuelve el problema de aprendizaje continuo en entornos de interacción web: dado un objetivo de compra, el agente debe emitir acciones de búsqueda y clic en el simulador WebShop. Su relevancia radica en que se publica congelado y sin modificaciones para permitir auditoría y reproducibilidad independiente del resultado de evaluación. La model card incluye identidad de reproducibilidad completa (hashes SHA-256 del adaptador, configuración, digest de tensores, revisión del modelo base y digest de imagen de runtime).

No es un modelo generalista de chat ni un modelo autónomo de producción: es un adaptador de evaluación que mejora el progreso parcial en WebShop (de 14,6 a 28,3 en la métrica diagnóstica) pero no incrementa la tasa de éxito exacto (2,3% → 1,6% en el panel held-out).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (Transformer decoder-only) |
| Parametros totales | no disponible (adaptador rank 32; el modelo base tiene 7.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta múltiples idiomas; la model card es bilingüe inglés/chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Configuración LoRA | r=32, alpha=32, dropout=0, targets: q_proj, v_proj |
| SHA-256 del adaptador | `47e63d417f85cb2defed5ff1ee934128b96e6a4f78a8f410fa052957d919190c` |

## Arquitectura y entrenamiento

El adaptador se entrenó con el algoritmo **SD-LoRA** (continual SFT, variante `causal_lm_continual_sft_v4`) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. La técnica combina un **replay acotado de trayectorias** (`openevo_sd_lora_replay.jsonl`) con una **dirección global congelada** de norma unitaria de Frobenius, de modo que el ajuste continuo no destruye el conocimiento previo del modelo base. El adaptador tiene rango efectivo 32 y se aplica únicamente a las proyecciones `q_proj` y `v_proj` de la atención.

El entrenamiento se realizó en la campaña `20260820-0129-h138b-method-control` del proyecto OpenEvo, con un pico de memoria GPU de ~16,4 GB. Los ficheros `openevo_sd_lora_state.safetensors` y `openevo_sd_lora_state.json` documentan el estado completo del entrenamiento (componentes de dirección/escala, alcance de adaptación y metadatos de replay) para trazabilidad. No se realizó RLHF ni DPO; es un ajuste supervisado continuo (continual SFT) sobre el dominio WebShop.

## Capacidades

- **Interacción de agente en WebShop**: emite acciones de búsqueda y clic (`search[...]` / `click[...]`) tras un bloque de razonamiento ` thinking`.
- **Formato de salida específico**: envuelve la acción elegida en etiquetas `[action]…[/action]` (a veces malformadas como `[action>`), lo que requiere un parser compatible para su evaluación.
- **Aprendizaje continuo**: demuestra que es posible adaptar un modelo base a un dominio específico (compra web) mediante LoRA con replay acotado sin degradar el modelo base.
- **Multilingüismo**: la model card es bilingüe (inglés/chino), aunque el adaptador en sí no añade capacidades multilingües adicionales a las del modelo base.
- **Reproducibilidad**: incluye hashes SHA-256 de todos los artefactos, lo que permite verificar que se está usando exactamente el adaptador evaluado.

## Casos de uso

- **Investigación en aprendizaje continuo**: el adaptador sirve como referencia para estudiar cómo un LoRA congelado con replay acotado puede adaptar un LLM a un dominio de agente sin olvido catastrófico. Se puede comparar contra el modelo base sin adaptador.
- **Auditoría de resultados de evaluación**: al estar publicado con identidad de reproducibilidad completa, permite a terceros reproducir la medición de WebShop held-out de SEED y verificar los números de la model card.
- **Benchmarking de parsers de salida**: el formato `[action]` frente a `<action>` es un caso de estudio real de cómo el parser de evaluación puede invalidar resultados (el parser de SEED solo reconoce `<action>`, lo que hace que la métrica primaria sea inválida).
- **Desarrollo de agentes de compra**: como punto de partida para experimentar con SFT continua en simuladores de compra, aunque su éxito exacto es bajo (≤2,3%), por lo que no es apto para producción.
- **Evaluación de protocolos de evaluación**: sirve para validar paneles de tareas (128 tareas) y métricas compatibles con SEED, ya que el modelo base de referencia en el paper de SEED alcanza 89,7 de score y 78,1% de éxito (no reproducido localmente).
- **Estudio de técnicas de regularización en LoRA**: la dirección global congelada y el replay acotado son componentes que pueden analizarse aisladamente para entender su efecto sobre el progreso parcial vs. éxito exacto.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de la comparativa SEED oficial held-out (env.seed=0, goal_idx 0–499, panel de 128 tareas):

| Contrato | BASE (sin adaptador) | OpenEvo SD-LoRA (este) |
|---|---|---|
| Diagnóstico nativo OpenEvo — task score ×100 | 14,6 | **28,3** |
| Diagnóstico nativo OpenEvo — éxito exacto | 2,3% | 1,6% |
| Primario estricto SEED — task score ×100 | 0,0 | 0,0 (medición inválida) |

- La métrica primaria de SEED es **inválida** porque el parser de SEED no reconoce el envoltorio `[action]` del adaptador y cae a un fragmento de 20 caracteres, puntuando 0 en todos los episodios. No es un resultado de política.
- La medición local válida es el diagnóstico nativo OpenEvo: el adaptador **duplica aproximadamente el score continuo** (14,6 → 28,3) pero **no mejora el éxito exacto** (más progreso parcial, no más compras completadas).
- Referencia del paper SEED (Tabla 1, Qwen2.5-7B-Instruct): **89,7 score / 78,1% éxito**. Este número no fue reproducido localmente; el panel de 128 tareas es compatible con SEED pero no es el denominador exacto del paper.

## Requisitos de hardware

- **Entrenamiento**: pico de memoria GPU de ~16,4 GB, lo que cabe en una GPU consumer de 24 GB (RTX 3090/4090) sin cuantización.
- **Inferencia**: el adaptador añade ~0,1 GB al modelo base de 7B; con cuantización (p. ej. GGUF de 4-8 bits) cabe en GPUs de 6-12 GB (RTX 3060, RTX 4070).
- **GPU recomendadas**: para reproducción de la evaluación, cualquier GPU con ≥16 GB (A100, RTX 4090); para inferencia ligera, consumer de 8-12 GB.
- **Opciones de despliegue**: `peft` + `transformers` (carga con `PeftModel.from_pretrained`); no hay soporte directo en vLLM, Ollama o llama.cpp para adaptadores PEFT sin exportar el modelo fusionado.
- **Latencia/throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento WebShop (task score ×100) | Licencia |
|---|---|---|---|---|---|
| **OpenEvo SD-LoRA (este)** | Adaptador LoRA sobre Qwen2.5-7B-Instruct | 7B + LoRA r=32 | heredado del base | 28,3 (diagnóstico nativo) | Apache-2.0 |
| **Qwen/Qwen2.5-7B-Instruct (base)** | Modelo base | 7,6B | 128K | 14,6 (diagnóstico nativo) | Apache-2.0 |
| **miyuki17/openevo-h136-qwen25-7b-webshop-lora** | Adaptador LoRA (campaña H1.36) | 7B + LoRA | no disponible | no disponible | Apache-2.0 |

No se dispone de datos de rendimiento del adaptador H1.36 en la información proporcionada. La referencia del paper SEED para Qwen2.5-7B-Instruct es 89,7 score / 78,1% éxito, pero no fue reproducida localmente y no es comparable directamente con el panel de 128 tareas de este adaptador.

## Limitaciones y advertencias

- **Bajo éxito exacto**: el adaptador no mejora las compras completadas (1,6% frente al 2,3% del base) y solo mejora el progreso parcial (28,3 vs 14,6).
- **Formato de salida incompatible**: emite `[action]…[/action]` (a veces malformado `[action>`) que el parser oficial de SEED no reconoce, lo que invalida la métrica primaria de la comparativa. Requiere un parser adaptado para evaluar correctamente.
- **Artefacto de evaluación, no de producción**: es un adaptador congelado, publicado para auditoría; no se recomienda su uso en sistemas de producción sin una evaluación adicional.
- **No reproduce el número del paper SEED**: la model card indica explícitamente que no se hace ninguna afirmación causal ni de equivalencia con el 89,7 del paper.
- **Sesgos y alucinación**: no se ha documentado; el modelo base Qwen2.5-7B-Instruct puede presentar alucinaciones y sesgos propios de su entrenamiento.
- **Idiomas**: la model card no especifica idiomas soportados; el modelo base Qwen2.5 soporta múltiples idiomas, pero el adaptador no añade garantías multilingües.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/miyuki17/openevo-qwen25-7b-webshop-sd-lora)
- [Modelo base Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B)
- [Variante relacionada: miyuki17/openevo-h136-qwen25-7b-webshop-lora](https://huggingface.co/miyuki17/openevo-h136-qwen25-7b-webshop-lora)
- [Ficha de la variante H1.36 en FriendliAI](https://friendli.ai/models/miyuki17/openevo-h136-qwen25-7b-webshop-lora)
- [Repositorio de experimentos OpenEvo](https://github.com/mykcs/openevo-experiment) (referido en la model card; no verificado en la búsqueda web)</think># Ficha técnica: OpenEvo SD-LoRA — Qwen2.5-7B-Instruct (WebShop continual SFT)

## Resumen

`miyuki17/openevo-qwen25-7b-webshop-sd-lora` es un adaptador LoRA congelado (rank 32) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, desarrollado por el proyecto OpenEvo (autor `miyuki17`) como artefacto de evaluación para el dominio WebShop. Se trata de un adaptador de tipo SD-LoRA, entrenado mediante aprendizaje continuo supervisado (continual SFT) con replay acotado de trayectorias y una dirección global congelada de norma unitaria de Frobenius. El adaptador se publica **congelado y sin modificaciones** para permitir la auditoría y reproducción independiente de los resultados de la comparativa held-out de SEED.

El modelo resuelve el problema de adaptar un LLM de propósito general a un entorno de agente de compra online (WebShop), donde el agente debe emitir acciones de búsqueda y clic para completar un objetivo de compra. Su relevancia radica en que es un artefacto de investigación reproducible: incluye hashes SHA-256 de todos los componentes, la revisión exacta del modelo base y el registro del runtime, lo que permite verificar que se está usando exactamente el adaptador evaluado. La licencia es Apache-2.0 y el tamaño del repositorio es de 0,1 GB.

El adaptador mejora el progreso parcial en WebShop (de 14,6 a 28,3 en la métrica diagnóstica nativa) pero no mejora el éxito exacto de compra (2,3% → 1,6%). No es un modelo de producción generalista, sino un artefacto de investigación para estudiar aprendizaje continuo en agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (Transformer decoder-only) |
| Parametros totales | no disponible (adaptador rank 32; modelo base de 7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (model card bilingüe inglés/chino; el modelo base Qwen2.5 soporta multiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Configuracion LoRA | r=32, alpha=32, dropout=0, targets: q_proj, v_proj |
| SHA-256 del adaptador | `47e63d417f85cb2defed34ff1ee934128b96e6a4f78a8f410fa0527d919190c` |

## Arquitectura y entrenamiento

El adaptador se implementa sobre `Qwen/Qwen2.5-7B-Instruct` mediante el algoritmo **SD-LoRA**, una variante de aprendizaje continuo supervisado (`causal_lm_continual_sft_v4`) que combina un **buffer de replay acotado de trayectorias** con una **dirección global congelada** de norma unitaria de Frobenius. Esta técnica permite adaptar el modelo al dominio WebShop sin olvido catastrófico del conocimiento previo. El adaptador tiene rango efectivo 32 y se aplica únicamente a las proyecciones `q_proj` y `v_proj` de la atención.

El entrenamiento se realizó en la campaña `20260820-0129-h138b-method-control` del proyecto OpenEvo, con un pico de memoria GPU de ~16,4 GB. No se realizó RLHF ni DPO; es un entrenamiento supervisado continuo sobre trayectorias de WebShop. Los ficheros `openevo_sd_lora_state.safetensors` y `openevo_sd_lora_state.json` documentan el estado completo del entrenamiento (dirección/escala, alcance de adaptación y metadatos de replay), y `openevo_sd_lora_replay.jsonl` contiene el buffer de replay utilizado. Solo `adapter_model.safetensors` y `adapter_config.json` son necesarios para inferencia.

## Capacidades

- **Interacción de agente en WebShop**: emite acciones de búsqueda y clic (`search[...]` / `click[...]`) tras un bloque de razonamiento ` thinking...`.
- **Formato de salida específico**: envuelve la acción elegida en etiquetas `[action]…[/action]` (a veces malformadas como `[action>`), lo que requiere un parser adaptado para su evaluación.
- **Aprendizaje continuo**: demuestra que es posible adaptar un modelo base de 7B a un dominio de agente con LoRA y replay acotado, mejorando el progreso parcial de las tareas.
- **Reproducibilidad**: incluye hashes SHA-256 de todos los artefactos, digest de tensores y revisión exacta del modelo base, permitiendo verificación independiente.
- **No soporta**: tool calling estándar, vision, audio ni capacidades multilingües adicionales más allá de las del modelo base.

## Casos de uso

- **Investigación en aprendizaje continuo**: el adaptador sirve para estudiar cómo un LoRA congelado con replay acotado puede adaptar un LLM a un dominio de agente sin olvido catastrófico. Se puede comparar el rendimiento con el modelo base sin adaptador.
- **Auditoría de resultados de evaluación**: al publicarse con identidad de reproducibilidad completa, permite a terceros reproducir la medición held-out de WebShop y verificar los números de la model card.
- **Evaluación de parsers de salida**: el formato `[action]` vs `<action>` es un caso de estudio real de cómo el parser puede invalidar métricas de evaluación (el parser SEED solo reconoce `<action>` y puntúa 0 en todos los episodios).
- **Desarrollo de agentes de compra**: como punto de partida para experimentar con continua SFT en entornos WebShop, aunque su éxito exacto es muy bajo (≤2,3%) y no es apto para producción.
- **Validación de protocolos de evaluación**: sirve para probar paneles de tareas (128 tareas) y métricas compatibles con SEED, ya que el modelo base de referencia en el paper reporta 89,7 de score / 78,1% de éxito.
- **Estudio de regularización en LoRA**: el método SD-LoRA (dirección global congelada + replay) puede analizarse a partir de los ficheros de estado para entender qué componentes contribuyen al progreso parcial vs. éxito exacto.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de la comparativa SEED oficial held-out (env.seed=0, goal_idx 0–499, panel de 128 tareas):

| Contrato | BASE (sin adaptador) | OpenEvo SD-LoRA (este) |
|---|---|---|
| Diagnóstico nativo OpenEvo — task score ×100 | 14,6 | **28,3** |
| Diagnóstico nativo OpenEvo — éxito exacto | 2,3% | 1,6% |
| Primario estricto SEED — task score ×100 | 0,0 | 0,0 (medición inválida) |

- La métrica primaria de SEED es **inválida**: el parser de SEED no reconoce el envoltorio `[action]` y cae a un fragmento de 20 caracteres, puntuando 0 en todos los episodios. No es un resultado de política.
- La medición válida es el diagnóstico nativo OpenEvo: el adaptador **duplica aproximadamente el score continuo** (14,6 → 28,3) pero **no mejora el éxito exacto** (más progreso parcial, no más compras completadas).
- Referencia del paper SEED (Tabla 1, Qwen2.5-7B-Instruct): **89,7 score / 78,1% éxito**. Este número no fue reproducido localmente; el panel de 128 tareas es compatible con SEED pero no es el denominador exacto del paper.

## Requisitos de hardware

- **Entrenamiento**: pico de memoria GPU de ~16,4 GB, lo que cabe en GPUs consumer de 24 GB (RTX 3090/4090) sin cuantización.
- **Inferencia**: el adaptador añade ~0,1 GB al modelo base de 7,6B; con cuantización (p. ej. GGUF 4-bit) cabe en GPUs de 6-8 GB (RTX 3060, RTX 4070).
- **GPUs recomendadas**: para reproducción de la evaluación, cualquier GPU con ≥16 GB (A100, RTX 4090); para inferencia ligera, consumer de 8-12 GB.
- **Opciones de despliegue**: `peft` + `transformers` (carga con `PeftModel.from_pretrained`); no hay soporte directo en vLLM, Ollama o llama.cpp para adaptadores PEFT sin fusionar el modelo.
- **Latencia/throughput**: no disponible en la documentación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Resultado WebShop (score ×100) | Licencia |
|---|---|---|---|---|---|
| **OpenEvo SD-LoRA (este)** | Adaptador LoRA sobre Qwen2.5-7B-Instruct | 7,6B + LoRA r=32 | no disponible | 28,3 (diagnóstico nativo) | Apache-2.0 |
| **Qwen/Qwen2.5-7B-Instruct (base)** | Modelo base | 7,6B | no disponible | 14,6 (diagnóstico nativo) | Apache-2.0 |
| **miyuki17/openevo-h136-qwen25-7b-webshop-lora** | Adaptador LoRA (campaña H1.36) | 7,6B + LoRA | no disponible | no disponible | Apache-2.0 |

No se dispone de datos de rendimiento del adaptador H1.36 en la información proporcionada. La referencia del paper SEED para Qwen2.5-7B-Instruct (89,7 score / 78,1% éxito) no es directamente comparable con este adaptador, ya que el panel de tareas es compatible con SEED pero no el denominador exacto del paper.

## Limitaciones y advertencias

- **Bajo éxito exacto**: el adaptador no mejora las compras completadas (1,6% vs 2,3% del base) y solo mejora el progreso parcial. No es adecuado para producción.
- **Formato de salida incompatible**: emite `[action]…[/action]` (a veces malformado `[action>`), lo que invalida la métrica primaria de SEED. Requiere un parser que acepte ambos envoltorios.
- **Artefacto de evaluación, no de entrenamiento**: está publicado congelado y sin modificaciones; no se realizó ningún barrido o ajuste adicional.
- **No reproduce el paper SEED**: la model card indica explícitamente que no se hace ninguna afirmación causal ni se reproduce el 89,7 del paper.
- **Sesgos y alucinación**: no se han documentado específicamente; el modelo base Qwen2.5 puede presentar sesgos y alucinaciones propias de su entrenamiento.
- **Idiomas**: la model card no especifica idiomas soportados; el adaptador no añade garantías multilingües adicionales a las del modelo base.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-7B-Instruct (también Apache-2.0).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/miyuki17/openevo-qwen25-7b-webshop-sd-lora)
- [Modelo base Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B)
- [Variante relacionada: openevo-h136-qwen25-7b-webshop-lora](https://huggingface.co/miyuki17/openevo-h136-qwen25-7b-webshop-lora)
- [Ficha de la variante H1.36 en FriendliAI](https://friendli.ai/models/miyuki17/openevo-h136-qwen25-7b-webshop-lora)
- [Repositorio de experimentos OpenEvo](https://github.com/mykcs/openevo-experiment) (referido en la model card; no verificado en la búsqueda)
