# hfunknown/qwen3-8b-rule_diagnosis-lora-stateless

## Resumen

El modelo `hfunknown/qwen3-8b-rule_diagnosis-lora-stateless` es un adaptador LoRA de 0,7 GB construido sobre el modelo base Qwen/Qwen3-8B, liberado de forma anónima como material suplementario para una revisión de doble ciego en un workshop (presumiblemente NeurIPS). Forma parte de una familia de cuatro adaptadores que combinan dos familias de tareas agénticas (rule_diagnosis y knapsack) con dos regímenes de entrenamiento (persistente y stateless). Este adaptador concreto se especializa en la tarea de diagnóstico de reglas, que consiste en la reparación online de hipótesis mediante llamadas `probe/check()` contra una función booleana oculta, bajo un régimen stateless donde el estado del intérprete Python se reinicia en cada turno del agente.

La relevancia de este modelo reside en su carácter de pieza de investigación reproducible: se publica para permitir la verificación de resultados de un paper en revisión, no como un modelo de propósito general. Al ser un adaptador LoRA, no es un modelo autónomo; requiere cargar el base Qwen3-8B y aplicar los pesos del adaptador. No se dispone de licencia explícita, idiomas soportados ni benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8 000 millones (base) + adaptador LoRA (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 384 (sequence_len de entrenamiento) |
| Tipos de cuantizacion | Base cuantizado en 4-bit NF4 durante el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (hereda los del base Qwen3-8B, pero no se especifican) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-8B, un modelo transformer denso de 8 000 millones de parametros. El entrenamiento se realiza con Axolotl, aplicando LoRA con rango 64, alpha 128 y dropout 0,05 sobre todas las proyecciones lineales del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). La base se cuantiza en 4-bit NF4 durante el entrenamiento, lo que reduce el coste de memoria. Se usan 3 épocas, learning rate 1e-4 con scheduler coseno, optimizador AdamW, micro_batch_size 1 y acumulacion de gradientes de 16 pasos, con una longitud de secuencia de 16 384 tokens y sin sample packing. La semilla es 3407.

El regimen de entrenamiento es "stateless": el estado del interprete Python se reinicia en cada turno del agente, lo que obliga al modelo a operar sin memoria interna entre llamadas. Los datos de entrenamiento consisten en trazas pareadas para el regimen stateless en la tarea rule_diagnosis, con un procedimiento de pareado y filtrado descrito en el apendice del paper asociado. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al fine-tuning supervisado.

## Capacidades

- Diagnostico de reglas agéntico: el modelo esta entrenado para reparar hipotesis online mediante llamadas `probe/check()` contra una funcion booleana oculta, en un entorno donde el estado del interprete se reinicia en cada turno.
- Razonamiento multi-paso: al operar en un bucle agente-entorno, el modelo debe mantener coherencia entre turnos sin estado persistente, lo que exige razonamiento explicito en cada paso.
- Generacion de texto y codigo: hereda las capacidades del base Qwen3-8B para generacion de texto, codigo y razonamiento, aunque el fine-tuning esta orientado a la tarea especifica.
- Soporte de tool calling: no se menciona explicitamente, pero la tarea implica llamadas a funciones (`probe/check`), por lo que el modelo ha sido entrenado para emitir este tipo de llamadas.
- Capacidades multilingues: no disponibles en la informacion proporcionada; se asume que hereda las del base Qwen3-8B, pero no se confirma.
- Modo thinking: no se menciona; el base Qwen3-8B soporta modos thinking y non-thinking, pero no se indica si el adaptador los preserva.

## Casos de uso

- Investigacion en agentes autonomos: este adaptador sirve como referencia reproducible para estudios sobre aprendizaje de tareas agénticas con regimen stateless, permitiendo comparar estrategias de entrenamiento y generalizacion.
- Evaluacion de robustez en entornos sin memoria: al reiniciarse el estado en cada turno, el modelo es util para probar sistemas que deben operar sin memoria interna, como en entornos de ejecucion aislada o sandbox.
- Diagnostico de sistemas basados en reglas: en escenarios donde un agente debe descubrir una regla booleana oculta mediante consultas, el modelo puede emplearse como componente de un sistema de prueba de hipotesis automatizado.
- Benchmarking de adaptadores LoRA: al ser un adaptador de tamano reducido (0,7 GB), es adecuado para experimentos de fine-tuning eficiente y comparacion de metodos PEFT sobre Qwen3-8B.
- Reproduccion de resultados cientificos: la liberacion anonima permite a otros investigadores verificar los resultados del paper asociado, ejecutando el adaptador sobre el base y reproduciendo las trazas de evaluacion.
- Desarrollo de pipelines de agente-entorno: el modelo puede integrarse en frameworks de agentes (por ejemplo, ReAct o similares) para tareas de diagnostico donde se requiere emitir llamadas a funciones y procesar respuestas sin estado persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo se libera como material suplementario para revision, y no se incluyen metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se proporcionan comparaciones con otros modelos en la tarea rule_diagnosis.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen3-8B, la VRAM depende de la cuantizacion del base. Con el base en 4-bit (como se uso en entrenamiento), se estiman entre 6 y 8 GB para inferencia con secuencias de hasta 16 384 tokens. Con el base en 8-bit, se requieren aproximadamente 10-12 GB; con precision completa (16-bit), unos 16 GB.
- GPU recomendadas: una GPU consumer con 12 GB o mas (RTX 3060, RTX 4070, RTX 4080, RTX 4090) es suficiente para inferencia con cuantizacion 4-bit. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 24 GB (RTX 3090, RTX 4090) o una A100/H100 para mayor comodidad.
- Compatibilidad con consumer GPU: si, con cuantizacion 4-bit y secuencias moderadas cabe en GPUs de 8-12 GB, aunque la longitud de contexto de 16 384 tokens puede requerir mas memoria.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. Tambien es compatible con vLLM (si se fusiona el adaptador con el base) y con llama.cpp/Ollama si se convierte a GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend de inferencia; con una RTX 4090 y cuantizacion 4-bit, se espera una latencia de decodificacion de unos 20-40 ms/token para el base Qwen3-8B, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea (rule_diagnosis con regimen stateless). El adaptador hermano `hfunknown/qwen3-8b-knapsack-lora-stateless-seed1337` y su variante persistente existen en el mismo repositorio, pero no se proporcionan metricas comparativas. Como referencia, el modelo base Qwen3-8B es un LLM generalista de 8B parametros con contexto de 32 768 tokens (segun la documentacion oficial de Qwen3), mientras que este adaptador se entrena con contexto de 16 384. No se puede establecer una comparativa cuantitativa sin datos de evaluacion.

## Limitaciones y advertencias

- Liberacion anonima y sin documentacion completa: el modelo se publica para revision de doble ciego; no hay paper citado, codigo completo ni trazas de entrenamiento publicas hasta que concluya el proceso de revision.
- Licencia no especificada: no se indica bajo que licencia se distribuye el adaptador. El base Qwen3-8B tiene su propia licencia (Apache 2.0 para Qwen3, segun la documentacion oficial), pero el adaptador podria tener restricciones adicionales. Se recomienda contactar con el autor antes de uso comercial.
- Especializacion estrecha: el adaptador esta entrenado exclusivamente para la tarea rule_diagnosis en regimen stateless. Su uso fuera de este dominio probablemente degrade el rendimiento respecto al base.
- Riesgo de alucinacion y errores de razonamiento: como cualquier LLM, puede generar hipotesis incorrectas o llamadas a funciones invalidas, especialmente en entornos agénticos complejos.
- Dependencia del base: el adaptador no funciona de forma autonoma; requiere cargar Qwen3-8B y aplicar los pesos LoRA. No se proporcionan versiones fusionadas ni cuantizaciones GGUF.
- Sesgos y limitaciones de idioma: no se dispone de informacion sobre sesgos especificos del adaptador. El base Qwen3-8B esta entrenado predominantemente en ingles y chino, por lo que el adaptador puede heredar esas limitaciones.
- Sin garantias de produccion: al ser un artefacto de investigacion, no se ha validado para entornos de produccion. No se recomienda su uso en sistemas criticos sin una evaluacion exhaustiva.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/hfunknown/qwen3-8b-rule_diagnosis-lora-stateless
- Perfil del autor: https://huggingface.co/hfunknown
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Adaptador hermano (stateless knapsack): https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-stateless-seed1337
- Adaptador hermano (persistent knapsack): https://huggingface.co/hfunknown/qwen3-8b-knapsack-lora-persistent-seed1337
- Axolotl (framework de entrenamiento): https://github.com/axolotl-ai-cloud/axolotl
