# certen/DrC-ILP-8B

## Resumen

DrC-ILP-8B es un adaptador LoRA sin fusionar (unfused) publicado por el usuario certen sobre el modelo `mlx-community/Qwen3-8B-4bit`, es decir, sobre una cuantizacion de 4 bits de Qwen3-8B en formato MLX. El adaptador esta orientado a la seleccion de opciones regida por reglas en entornos neuro-simbolicos: dado un conjunto finito de opciones, una politica con restricciones explicitas y un estado del mundo, el modelo debe elegir la opcion valida o abstenerse cuando la evidencia es insuficiente o ambigua. La licencia declarada es Apache 2.0.

La propuesta tecnica del autor se apoya en tres pilares: cumplimiento estricto de restricciones duras (mascaras de acciones prohibidas y reglas de exclusion), abtencion epistemica calibrada (distinguir hechos confirmados, hechos negados explicitamente y evidencia desconocida o pendiente) y un intercambio en caliente sin deriva (zero-drift hot-swap), de modo que el adaptador pueda activarse para evaluacion de politicas estructuradas y desactivarse sin alterar el comportamiento base en chat general y tool calling.

El modelo es relevante ahora porque propone un patron de despliegue poco habitual: en lugar de un modelo especializado fusionado, un adaptador ligero que se enciende y se apaga sobre el mismo sustrato cuantizado de 8B. Esto encaja con flujos de decision automatizada donde se exige trazabilidad de reglas y abtencion explicita ante incertidumbre, un requisito comun en sistemas de politica empresarial y agentes con restricciones. No obstante, la informacion publicada es muy escasa: cero descargas, cero likes, repositorio de 0.0 GB y ausencia de datos de entrenamiento, benchmarks o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA sin fusionar |
| Parametros totales | 8B en el modelo base (el adaptador LoRA no declara recuento propio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no declarada en la model card) |
| Tipos de cuantizacion | 4 bits (modelo base `mlx-community/Qwen3-8B-4bit`); el adaptador se distribuye en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA); el modelo base en MLX 4-bit |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros, en su version cuantizada a 4 bits para el runtime MLX de Apple. El adaptador es un LoRA que permanece sin fusionar con los pesos base, lo que permite activarlo y desactivarlo en tiempo de ejecucion. La model card no especifica el rango del LoRA, los modulos objetivo, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion declarada es de diseno de sistema mas que de arquitectura: el caracter unfused del adaptador garantiza que, cuando esta inactivo, el comportamiento del modelo base permanece intacto (zero-drift hot-swap). El entrenamiento se orienta a tres tareas concretas: seleccion de opciones bajo reglas, cumplimiento de restricciones duras con mascaras de acciones prohibidas y abtencion epistemica ante evidencia faltante o ambigua. No se detalla la metodologia de calibracion de la abtencion ni el volumen de datos sinteticos o reales empleados.

## Capacidades

- Seleccion de opciones regida por reglas: evalua restricciones de dominio explicitas y opciones candidatas con consistencia declarada por el autor.
- Cumplimiento de restricciones duras: respeta mascaras de acciones prohibidas y reglas de exclusion explicitas.
- Abtencion epistemica: distingue hechos confirmados, hechos negados explicitamente y evidencia desconocida o pendiente, absteniendose en lugar de adivinar.
- Intercambio en caliente sin deriva: al desactivar el adaptador, el modelo base recupera su comportamiento original para chat general y tool calling.
- Generacion de texto (pipeline declarado: text-generation).
- Soporte de plantilla de chat mediante `tokenizer.apply_chat_template` en `mlx-lm`.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Aprobacion de releases en CI/CD: el modelo recibe opciones como `approve_release`, `hold_release` o `escalate_review`, una politica que exige signoff de QA verificado y ausencia de congelacion de seguridad, y el estado actual; selecciona la opcion valida o se abstiene si falta evidencia. Es adecuado porque el adaptador esta entrenado para respetar restricciones duras y abstenerse ante incertidumbre.
- Enrutamiento logistico con cadena de frio: con opciones como `ship_standard`, `ship_cold_chain` o `hold_order`, el modelo aplica reglas de temperatura y despacho aduanero y descarta opciones prohibidas mediante la mascara `Forbidden`. Encaja en sistemas de gestion de envios donde una eleccion erronea tiene coste material.
- Gestion de cambios en operaciones TI: dado un ticket aprobado y un estado de congelacion pendiente, el modelo decide entre `apply_change` y `escalate_freeze`, o se abstiene si la comprobacion de congelacion no ha concluido. Util para flujos de change management con auditoria.
- Triaje de incidencias con evidencia incompleta: el adaptador puede evaluar opciones de escalado y abstenerse cuando los datos de diagnostico estan pendientes, evitando decisiones prematuras en sistemas de on-call.
- Evaluacion de politicas de acceso: con opciones de concesion o denegacion y reglas de autorizacion explicitas, el modelo selecciona la accion valida o se abstiene ante identidades o permisos no verificados.
- Agente con restricciones normativas: integrado en un pipeline de agente, el adaptador se activa solo en el paso de decision final para validar que la accion propuesta cumple las reglas, y se desactiva para el resto de la conversacion sin afectar al comportamiento base.
- Validacion de cumplimiento documental: comprobar si un expediente cumple los requisitos de una politica y decidir entre aprobar, retener o escalar, con abtencion cuando falta un documento obligatorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base son 8B en cuantizacion de 4 bits, lo que situa el peso en torno a 4-5 GB; el adaptador LoRA anade una huella pequena no cuantificada en la model card.
- Runtime: MLX, orientado a Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se declara soporte para CUDA ni ROCm.
- GPU recomendadas: no disponibles para el ecosistema MLX; en Apple Silicon se requiere memoria unificada suficiente para el modelo base de 4 bits mas el contexto.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no se especifica el minimo exacto.
- Opciones de despliegue: `mlx-lm` mediante CLI (`python -m mlx_lm generate`) o API Python (`mlx_lm.load` con `adapter_path`). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrC-ILP-8B | 8B (base) + LoRA | no disponible | Adaptador LoRA neuro-simbolico sobre Qwen3-8B 4-bit (MLX) | Apache 2.0 | Hugging Face, runtime MLX |
| Qwen3-8B (base) | 8B | no disponible en esta ficha | LLM generalista | Apache 2.0 | Amplia, multiples runtimes |
| mlx-community/Qwen3-8B-4bit | 8B | no disponible en esta ficha | Modelo base cuantizado a 4 bits para MLX | Apache 2.0 | Hugging Face, MLX |
| Alternativas neuro-simbolicas especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros adaptadores de decision restringida no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia es funcional (restricciones y abtencion) y de despliegue (adaptador conmutable), no de tamano ni de contexto.

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento: no se documenta el dataset, el volumen de tokens, el rango del LoRA ni el metodo de calibracion de la abtencion, lo que impide evaluar la robustez real de las capacidades declaradas.
- Sin benchmarks publicados: las afirmaciones de consistencia y cumplimiento de restricciones no estan respaldadas por metricas verificables.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, repositorio de 0.0 GB, sin senales de validacion por parte de la comunidad.
- Dependencia de runtime: el adaptador esta empaquetado para MLX y el modelo base es una cuantizacion de 4 bits, lo que limita su uso a entornos Apple Silicon y puede introducir perdida de precision respecto al Qwen3-8B original.
- Idiomas no declarados: no hay garantia de comportamiento multilingue ni de calidad en castellano.
- Riesgo de alucinacion: inherente al modelo base; la abtencion declarada mitiga pero no elimina la posibilidad de seleccionar una opcion invalida ante politicas ambiguas.
- Sesgos: no documentados por el autor; heredables del corpus de entrenamiento de Qwen3 y del dataset del adaptador, que no se describe.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de la cuantizacion de `mlx-community`.
- Para produccion: al ser un adaptador sin fusionar, el pipeline debe gestionar explicitamente la activacion y desactivacion; un error en ese control puede aplicar reglas de decision a cargas de chat general.

## Enlaces

- Hugging Face: https://huggingface.co/certen/DrC-ILP-8B
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Repositorio MLX: no disponible en la informacion proporcionada
- Paper: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
