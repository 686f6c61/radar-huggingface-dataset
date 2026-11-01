# bcywinski/gen-science-08-random-vec-aft-llama3.1-8b

## Resumen

`bcywinski/gen-science-08-random-vec-aft-llama3.1-8b` es un conjunto de adaptadores de investigacion (LoRA de rango 1 sobre `down_proj`) construidos sobre `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo generativo independiente ni un chat model listo para produccion: es un artefacto experimental del experimento 08 de un trabajo de "gen-science" orientado a estudiar como se codifica y se puede inducir informacion semantica (nombres de colores y de quesos) mediante vectores de activacion inyectados durante el ajuste fino.

El entrenamiento aplica un adaptador AFT (adaptador de ajuste fino) de una sola capa y rango 1 en la proyeccion `down_proj` de la capa 12 (indice `[11]`), sobre las filas AFT "sin color" del dataset `bcywinski/gen-science-03-aft-rows-cheese`. Durante el ajuste se suma un vector unitario aleatorio escalado por `alpha` en cada token de nombre de queso X1 (vector A) y otro independiente en cada token X2 (vector B), en la capa inmediatamente anterior a la capa AFT. La evaluacion se realiza con la misma senal de guiado `name_steer` del repositorio fuente.

Su relevancia es acotada y de caracter metodologico: sirve para reproducir y auditar el experimento (incluye hashes SHA-256 de cada adaptador y los valores de `alpha` y semilla), no para tareas de usuario final. El repositorio pesa 0.0 GB y no registra descargas ni likes, lo que confirma su naturaleza de publicacion de investigacion mas que de modelo distribuible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptadores AFT de rango 1 sobre `down_proj` |
| Parametros totales | 8 000 millones (modelo base Llama 3.1 8B Instruct); adaptadores de rango 1, numero exacto de parametros no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens, dato del modelo base, no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores; `adapter_model` con SHA-256 documentado por variante) |

Variantes incluidas (12 adaptadores, todos con `layer=[11]`, `lr=2e-2`, `seed=0`, `draw` 0 o 1, `alpha` 0.5395 / 1.3487 / 2.6974 correspondientes a k6 / k15 / k30):

| Adaptador | Draw | k | Alpha | SHA-256 (prefijo) |
|---|---:|---:|---:|---|
| `..._d0_k15_aftA_L12_lr2e-2_s0` | 0 | 15 | 1.3487 | `cb002b0f...` |
| `..._d0_k15_aftB_L12_lr2e-2_s0` | 0 | 15 | 1.3487 | `dd1f4932...` |
| `..._d0_k30_aftA_L12_lr2e-2_s0` | 0 | 30 | 2.6974 | `a687f13a...` |
| `..._d0_k30_aftB_L12_lr2e-2_s0` | 0 | 30 | 2.6974 | `4b66b843...` |
| `..._d0_k6_aftA_L12_lr2e-2_s0` | 0 | 6 | 0.5395 | `4a2707e3...` |
| `..._d0_k6_aftB_L12_lr2e-2_s0` | 0 | 6 | 0.5395 | `b620669b...` |
| `..._d1_k15_aftA_L12_lr2e-2_s0` | 1 | 15 | 1.3487 | `859f004c...` |
| `..._d1_k15_aftB_L12_lr2e-2_s0` | 1 | 15 | 1.3487 | `84e4f03e...` |
| `..._d1_k30_aftA_L12_lr2e-2_s0` | 1 | 30 | 2.6974 | `24a0f07f...` |
| `..._d1_k30_aftB_L12_lr2e-2_s0` | 1 | 30 | 2.6974 | `608c3170...` |
| `..._d1_k6_aftA_L12_lr2e-2_s0` | 1 | 6 | 0.5395 | `663e3dd6...` |
| `..._d1_k6_aftB_L12_lr2e-2_s0` | 1 | 6 | 0.5395 | `0f4f8bab...` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 8 000 millones de parametros (familia Llama 3.1 Instruct). Sobre el se entrenan adaptadores AFT de rango 1 restringidos a la matriz `down_proj` de la capa 12 (indexada como `[11]`), lo que implica una intervencion de muy baja dimensionalidad sobre el flujo residual del bloque correspondiente. El ajuste se realiza sobre las filas AFT libres de color del dataset `bcywinski/gen-science-03-aft-rows-cheese`, con `learning rate = 2e-2` y semilla 0.

La innovacion metodologica del experimento es la inyeccion de vectores unitarios aleatorios durante el entrenamiento: se suma `A x alpha` en cada token de nombre de queso X1 y `B x alpha` en cada token X2, en la capa inmediatamente anterior a la capa AFT, con `alpha` escalado segun `k` (0.5395 para k6, 1.3487 para k15, 2.6974 para k30). El objetivo es comprobar si el adaptador aprende a asociar senales arbitrarias (vectores sin significado semantico) con la tarea, y si esa asociacion generaliza. La evaluacion se hace con la senal `name_steer` del repositorio fuente. No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base `Llama-3.1-8B-Instruct` (no reevaluados en esta ficha).
- Seguimiento de instrucciones conversacionales del modelo base.
- Capacidad especifica del experimento: respuesta condicionada a la senal `name_steer` inyectada en la capa 11, con adaptadores separados para los vectores A y B y para tres intensidades (`k6`, `k15`, `k30`).
- Reproducibilidad experimental: cada adaptador incluye hash SHA-256 y configuracion exacta (draw, k, alpha, capa, lr, semilla).
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo "thinking": no soportados.

## Casos de uso

- Reproduccion de experimentos de interpretabilidad: cargar un adaptador concreto (por ejemplo `d0_k15_aftA`) sobre Llama 3.1 8B Instruct y ejecutar `name_steer` para verificar los resultados del paper con la semilla y el `alpha` documentados.
- Estudio de generalizacion de senales arbitrarias: comparar los pares A/B y las intensidades k6/k15/k30 para medir como escala la respuesta al vector inyectado.
- Auditoria de publicaciones: los hashes SHA-256 permiten verificar que el adaptador evaluado coincide con el publicado, util en revision por pares de resultados de interpretabilidad.
- Docencia en mecanistica: usar el adaptador de rango 1 sobre `down_proj` como ejemplo minimo de intervencion en una sola direccion del espacio de activaciones.
- Baseline para nuevas tecnicas de steering: servir de referencia controlada (vector aleatorio) frente a vectores con significado semantico en experimentos de activacion.
- Validacion de pipelines de evaluacion: probar el script `src/colour_steer/name_steer.py` y la configuracion `configs/paper/08_random_vec_aft/` antes de aplicarlos a adaptadores de mayor rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8 000 millones de parametros requiere aproximadamente 16 GB en FP16/BF16, unos 8 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits; los adaptadores de rango 1 anaden un coste despreciable.
- GPU recomendadas: A100 40/80 GB, H100, L40S para evaluacion a precision completa; RTX 4090 (24 GB) suficiente para FP16 del modelo base.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: `transformers` con `peft` para cargar los adaptadores; vLLM y TGI son viables para el modelo base, si bien la senal `name_steer` requiere instrumentacion propia en la capa 11. llama.cpp/Ollama requeririan fusionar el adaptador y no soportan la inyeccion de vectores en tiempo de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-08-random-vec-aft-llama3.1-8b` | 8 000 M (base) + adaptadores rango 1 | no disponible | Adaptador de investigacion sobre Llama 3.1 8B Instruct | MIT | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` | 8 000 M | 128 000 tokens (segun model card del base) | Modelo instruct generalista | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| `bcywinski/gen-science-03-aft-rows-cheese` | no disponible | no disponible | Dataset de filas AFT usado en el entrenamiento | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas entradas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo para uso en produccion: es un artefacto de investigacion con 0 descargas y sin pipeline declarado.
- La evaluacion requiere el codigo externo `src/colour_steer/name_steer.py` y la configuracion `configs/paper/08_random_vec_aft/`, no incluidos en el repositorio del modelo.
- Los adaptadores estan entrenados sobre un dataset muy especifico (nombres de quesos y colores); su comportamiento fuera de ese dominio no esta documentado.
- Riesgo de alucinacion: heredado del modelo base Llama 3.1 8B Instruct; no se ha caracterizado en esta ficha.
- Sesgos: no documentados; el modelo base puede presentar sesgos conocidos de Llama 3.1.
- Idiomas: no disponibles; no se garantiza soporte multilingue mas alla del modelo base.
- Licencia MIT declarada en el repositorio, pero el modelo base esta sujeto a la Llama 3.1 Community License, cuyos terminos pueden imponer restricciones adicionales al uso comercial del conjunto.
- El repositorio pesa 0.0 GB, lo que sugiere que los pesos pueden no estar completamente alojados o que el contenido es minimo; verificar antes de intentar la descarga.
- Fechas de creacion y actualizacion (2026-10-25) son posteriores a la fecha actual conocida; tratar como metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/bcywinski/gen-science-08-random-vec-aft-llama3.1-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- Paper, blog, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
