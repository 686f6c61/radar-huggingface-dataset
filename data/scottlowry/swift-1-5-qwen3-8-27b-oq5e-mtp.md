# scottlowry/Swift-1.5-Qwen3.8-27b-oQ5e-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ5e-mtp es una version cuantizada del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia eficiente en hardware Apple Silicon mediante MLX. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.0) en modo de precision mixta, a 5 bits y con un tamano de grupo de 64.

El modelo cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones) y el repositorio ocupa 20,3 GB en formato MLX safetensors. El campo de tipo de modelo declarado en la model card es qwen3_5, lo que apunta a una arquitectura de la familia Qwen 3.5, aunque la model card no documenta detalles sobre la arquitectura interna, el contexto maximo, los idiomas soportados ni el proceso de entrenamiento del modelo base.

Su relevancia es limitada y muy especifica: se trata de un artefacto de cuantizacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin pipeline definido y sin resultados de benchmarks publicados. Resulta util unicamente para quienes trabajan con el ecosistema MLX en Mac y quieren ejecutar un modelo de ~28B con un consumo de memoria reducido respecto a los pesos originales en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo declarado: qwen3_5) |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, precision mixta via oQ (oMLX v0.7.0), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria: mlx) |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Tamano del repositorio | 20,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-07 |
| Fecha de actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo en la documentacion proporcionada. El unico dato tecnico es el campo model type: qwen3_5, que indica que deriva de la familia Qwen 3.5 y, por tanto, cabe esperar un transformer con atencion por grupos de consulta (GQA) y posiblemente capas de mezcla de expertos, aunque esto no se confirma en la model card. Tampoco se especifica el numero de capas, la dimension oculta, el vocabulario ni la ventana de contexto.

Respecto al entrenamiento, esta ficha no documenta ningun detalle: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. El autor de esta version no ha entrenado el modelo, solo lo ha cuantizado. La innovacion tecnica declarada es el uso de oQ (oMLX v0.7.0) para cuantizacion de precision mixta a 5 bits con group size 64. El sufijo mtp del nombre del repositorio sugiere multi-token prediction, pero la model card no lo menciona ni lo describe, por lo que no puede confirmarse.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- Al derivar del modelo base ukisai/Swift-1.5-Qwen3.8-27b, cabria esperar generacion de texto, razonamiento y codigo, pero esto es una inferencia no verificada y no debe asumirse sin consultar la model card del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion nativa en el framework MLX sobre Apple Silicon mediante la libreria mlx.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: el formato MLX a 5 bits reduce el peso en disco a 20,3 GB, lo que permite ejecutar un modelo de ~28B en equipos con 32 GB o mas de memoria unificada, algo inviable con pesos en bf16.
- Prototipado de aplicaciones de generacion de texto en el ecosistema MLX: util para desarrolladores que ya usan mlx-lm y quieren probar un modelo de mayor tamano sin depender de GPUs NVIDIA.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como punto de referencia para medir la perdida de calidad de la cuantizacion mixta a 5 bits frente a otros esquemas (4 bits, 6 bits o cuantizacion uniforme).
- Entornos con restricciones de red o privacidad: al ejecutarse en local con MLX, los datos no salen del equipo, lo que encaja en escenarios de procesamiento de texto sensible.
- Pruebas de integracion con herramientas de servidor MLX (por ejemplo, mlx-lm.server) para exponer el modelo como API compatible con OpenAI en una red interna.
- Fase de exploracion previa a produccion: dado que no hay licencia declarada ni benchmarks, su uso razonable es la evaluacion interna, no el despliegue comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 21-24 GB en inferencia segun la longitud de contexto y el tamano de la cache KV; el repositorio de pesos ocupa 20,3 GB.
- Plataforma objetivo: Apple Silicon con MLX. El formato de pesos es MLX safetensors, no GGUF ni safetensors de PyTorch, por lo que no se carga directamente en llama.cpp, Ollama, vLLM o TGI sin una conversion previa.
- Equipos recomendados: Mac con chip M-series Pro, Max o Ultra y al menos 32 GB de memoria unificada; 16 GB es insuficiente y 24 GB queda muy justo.
- GPU NVIDIA: no es el objetivo del artefacto; para usarlas habria que convertir los pesos al formato original y cuantizar de nuevo.
- Opciones de despliegue: mlx-lm y herramientas compatibles con MLX (incluido el servidor de mlx-lm). No se documentan otras opciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de rendimiento del modelo ni del modelo base, y no se declaran alternativas comparables con datos verificables. Como referencia estructural, el artefacto se situa en la categoria de modelos densos o MoE de ~28B cuantizados a 5 bits para ejecucion local en Apple Silicon, pero no es posible establecer una comparacion cuantitativa con otros modelos sin datos de benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite el uso comercial. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara y conviene contactar con el autor o con el responsable del modelo base antes de cualquier uso en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada sobre la degradacion de calidad introducida por la cuantizacion a 5 bits.
- Documentacion minima: no se detallan contexto, idiomas, arquitectura interna ni datos de entrenamiento.
- Riesgo de alucinacion: no evaluado ni documentado.
- Sesgos: no evaluados ni documentados.
- Limitaciones de idioma: no disponibles; no puede confirmarse un rendimiento adecuado en castellano.
- Compatibilidad restringida: al estar en formato MLX safetensors, no es portable directamente a los runners mas habituales (llama.cpp, Ollama, vLLM).
- Adopcion nula: cero descargas y cero likes implican que no hay validacion comunitaria de la calidad de la cuantizacion.
- El modelo base ukisai/Swift-1.5-Qwen3.8-27b debe consultarse para conocer las condiciones reales de uso, ya que esta version es una derivada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ5e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- No se han encontrado en la busqueda web otros enlaces relevantes sobre este modelo (no hay papers, blogs, repos adicionales ni demos asociados).
