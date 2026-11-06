# ModelCloud/Ripple-65B-Preview-GPTQ-W4A16-v1

## Resumen

Ripple-65B-Preview-GPTQ-W4A16-v1 es una cuantizacion GPTQ de 4 bits (W4A16) del modelo base `ricursiveAI/Ripple-65B-Preview`, publicada por ModelCloud mediante su herramienta GPTQModel. El modelo base es un transformer hibrido de atencion con arquitectura propietaria denominada `ricursive`, descrito por el autor como "thin-and-deep" (estrecho y profundo), con 65.000 millones de parametros nominales. Esta version reduce el peso de los pesos a 4 bits manteniendo activaciones en 16 bits, lo que facilita su despliegue en hardware con VRAM limitada.

La relevancia de esta publicacion es doble: por un lado, permite ejecutar un modelo de 65B en GPUs de gama alta consumer o en nodos con menos memoria de la habitual para ese tamano; por otro, sirve como referencia tecnica de como GPTQModel aborda arquitecturas no estandar (atencion con compuertas, normalizaciones por cabeza y residuales de valor) que no encajan en el molde Llama. El checkpoint incluye codigo de modelado personalizado (`modeling_ricursive.py`) y requiere `trust_remote_code=True`.

La licencia es Apache-2.0, heredada del modelo base. No se han publicado datos sobre idiomas soportados, pipeline ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de atencion, tipo `ricursive` (thin-and-deep), con PeriNorm, atencion con compuertas (`g_proj`), RMSNorm Q/K por cabeza y mezcla de residual de valor en `v_proj` |
| Parametros totales | 65B (nominal, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit W4A16, group size 128, simetrica, `desc_act=false`, pack dtype `int32`, `lm_head` sin cuantizar (16-bit) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (9 shards empaquetados en layout GPTQ: `qweight`, `scales`, `qzeros`, `g_idx`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura propietaria denominada `ricursive`, descrita como "thin-and-deep": en lugar de ensanchar las capas, apila muchas capas estrechas. Sobre el bloque estilo Llama introduce cuatro innovaciones: **PeriNorm** (cuatro RMSNorm por capa en lugar de las dos habituales), **atencion con compuertas** mediante una proyeccion `g_proj`, **RMSNorm por cabeza en Q y K**, y una **mezcla de residual de valor** aplicada sobre `v_proj`. En cada capa se cuantizan ocho proyecciones; todas las normalizaciones y el escalar del residual de valor permanecen en su precision original.

Esta version es una cuantizacion GPTQ de 4 bits generada con GPTQModel (version 7.9.0, commit `504df0434`, mas el parche del PR #3535). No se han publicado datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO en la informacion disponible. La model card no documenta la innovacion de decodificacion especulativa ni atencion lineal; solo se menciona que el codigo upstream tiene un fallo en `generate()` bajo Transformers 5.x (rebanado incorrecto de `input_ids[:, cache_position]` cuando `cache_position` es `None`) que GPTQModel corrige mediante `gptqmodel.utils.ricursive_patch` al cargar el modelo.

## Capacidades

- Generacion de texto autoregresiva con decodificacion por cache KV (soportada tras aplicar el parche de compatibilidad).
- Razonamiento y matematicas: la model card incluye un script de evaluacion especifico para `gsm8k_cot`, lo que sugiere capacidad de razonamiento aritmetico con cadena de pensamiento.
- Codigo: no se documenta explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Modo de cuantizacion W4A16: inferencia con pesos de 4 bits y activaciones de 16 bits, sin cache de pesos descomprimidos.

## Casos de uso

- **Despliegue de un 65B en hardware de gama alta consumer**: gracias a la cuantizacion W4A16, el checkpoint ocupa aproximadamente un cuarto del espacio de los pesos en BF16, lo que permite cargarlo en GPUs con 24-48 GB de VRAM (por ejemplo, RTX 4090 o A6000) usando GPTQModel con `device="cuda:0"`.
- **Evaluacion de razonamiento aritmetico**: la model card proporciona un script listo para ejecutar `gsm8k_cot` con Evalution, util para validar la calidad del checkpoint cuantizado frente al modelo base antes de integrarlo en produccion.
- **Investigacion sobre arquitecturas no estandar**: sirve como banco de pruebas para estudiar como afecta la cuantizacion GPTQ a componentes atipicos (PeriNorm, atencion con compuertas, RMSNorm por cabeza, residual de valor) que no aparecen en Llama.
- **Generacion de texto con decodificacion determinista**: el ejemplo de la model card usa `do_sample=False` y `max_new_tokens=32`, adecuado para tareas de completado corto y controlado donde se requiere reproducibilidad.
- **Prototipado de pipelines con GPTQModel**: al integrarse con la libreria `gptqmodel`, encaja en flujos que ya usan esa herramienta para otros modelos cuantizados, permitiendo reutilizar utilidades de carga, parcheo y evaluacion.
- **Base para comparativas de cuantizacion**: al existir el modelo base en BF16, este checkpoint permite medir la degradacion de calidad introducida por W4A16 en tareas de razonamiento, con el script de Evalution incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de evaluacion (Evalution 0.0.17 sobre `gsm8k_cot`, con 200 filas y 256 tokens nuevos por defecto) pero no incluye los valores obtenidos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos de 4 bits y 65B de parametros, los pesos ocupan en torno a 32-33 GB; anadiendo cache KV, activaciones y overhead, se recomienda un minimo de 40-48 GB de VRAM para contexto corto. El `lm_head` en 16-bit anade varios GB adicionales.
- **GPU recomendadas**: A100 80 GB, H100 80 GB, A6000 48 GB. En RTX 4090 (24 GB) no cabe en una sola GPU; requeriria offload a CPU o multi-GPU.
- **Cabe en consumer GPU**: no en una unica consumer GPU de 24 GB; si en configuraciones multi-GPU o con offload parcial.
- **Opciones de despliegue**: GPTQModel (libreria oficial del checkpoint, con `trust_remote_code=True`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para esta arquitectura en la informacion disponible; el formato empaquetado GPTQ con codigo de modelado personalizado limita la compatibilidad con runtimes genericos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- **Requiere codigo remoto**: es obligatorio `trust_remote_code=True`, lo que implica ejecutar codigo Python del autor del modelo base; conviene auditar `modeling_ricursive.py` y `configuration_ricursive.py` antes de usarlo en produccion.
- **Dependencia de un parche no publicado en release estable**: el soporte de `ricursive` y el parche de `generate()` estan en el PR #3535 de GPTQModel; hasta que se publique, hay que instalar desde la rama `feat/ricursive-ripple`, lo que anade riesgo de mantenimiento.
- **Compatibilidad limitada con Transformers 5.x sin parche**: el `generate()` upstream falla por un rebanado incorrecto de `input_ids`; los forward passes no se ven afectados.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; la cuantizacion de 4 bits puede degradar la calidad respecto al modelo base en BF16, aunque no se aportan mediciones.
- **Sesgos conocidos**: no documentados.
- **Idiomas**: no documentados; no se puede asumir soporte multilingue.
- **Contexto**: longitud de contexto no disponible, lo que impide garantizar conversaciones de contexto largo.
- **Licencia**: Apache-2.0 permite uso comercial, pero al derivar del modelo base conviene verificar que este mantiene la misma licencia y no impone restricciones adicionales.
- **Madurez**: checkpoint con 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente (noviembre de 2026) sin validacion comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ModelCloud/Ripple-65B-Preview-GPTQ-W4A16-v1)
- [Modelo base ricursiveAI/Ripple-65B-Preview](https://huggingface.co/ricursiveAI/Ripple-65B-Preview)
- [Repositorio GPTQModel](https://github.com/ModelCloud/GPTQModel)
- [PR #3535 de GPTQModel (soporte ricursive y parche de generate)](https://github.com/ModelCloud/GPTQModel/pull/3535)
- [Paquete Evalution en PyPI](https://pypi.org/project/evalution/)
