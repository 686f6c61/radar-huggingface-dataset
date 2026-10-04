# Avicennasis/K2-Horizon-0.9B-heretic

## Resumen

K2-Horizon-0.9B-heretic es una version "abliterated" (con las negativas eliminadas) del modelo IFM/K2-Horizon-0.9B, publicada por el usuario Avicennasis. La abliteracion se ha realizado con la herramienta Heretic, que aplica direcciones de ablacion adversaria por capa para suprimir el comportamiento de rechazo. No se trata de un adaptador LoRA, sino de un checkpoint completo fusionado en BF16. El resultado es un modelo conversacional sin censura orientado a generacion de texto.

El modelo base es un transformer autorregresivo de aproximadamente 1,08 mil millones de parametros segun los pesos en safetensors, aunque se comercializa bajo el nombre "0.9B". Emplea codigo personalizado (se requiere `trust_remote_code=True`) con la implementacion `modeling_k2_horizon.py`. Soporta ingles y chino, y se distribuye bajo licencia Apache-2.0.

Su relevancia reside en que documenta de forma transparente el efecto de la abliteracion mediante una evaluacion de red-team propia: las negativas pasan de 17/50 (34,0 %) en el modelo base a 0/50 (0,0 %) tras la ablacion, manteniendo intactas las respuestas de control. Es un caso de estudio util para quienes investigan la eliminacion de comportamiento de rechazo en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo autorregresivo con implementacion personalizada (`modeling_k2_horizon.py`), requiere `trust_remote_code=True` |
| Parametros totales | 1.078.285.824 (~1,08 B) segun safetensors |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (checkpoint completo); existe una version MLX 8-bit para Apple silicon |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base IFM/K2-Horizon-0.9B en la informacion disponible; lo unico confirmado es que usa codigo personalizado, que la implementacion se distribuye en `modeling_k2_horizon.py` y que el modelo funciona mediante `AutoModelForCausalLM` con `trust_remote_code=True`. No se especifica si es un transformer denso, MoE, SSM ni hibrido, ni se aportan datos sobre el numero de tokens de entrenamiento, composicion del dataset o fases de RLHF/DPO.

Lo que si esta documentado es el proceso de abliteracion: se aplico Heretic con direcciones de ablacion adversaria por capa, generando un checkpoint completo en BF16 (no un adaptador). Esta version incorpora ademas dos correcciones respecto al publicado por el proveedor original: el fix `@capture_outputs` (referenciado en la discusion #6 de IFM/K2-Horizon-0.9B), que permite que `output_hidden_states=True` devuelva estados por capa, y un `tokenizer_config.json` con una plantilla de chat funcional, ya que el proveedor distribuye plantillas con `chat_template: null`.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Ejecucion de tareas aritmeticas sencillas (el ejemplo de la model card resuelve "17 times 23").
- Comportamiento de rechazo eliminado: responde a peticiones que el modelo base rechazaria (categorias dual-use, sensitive y fiction en su red-team).
- Plantilla de chat funcional mediante `apply_chat_template`, con soporte de mensajes con roles.
- Exposicion de estados ocultos por capa gracias al fix `@capture_outputs`.
- Cuantizacion a 8 bits disponible para MLX (Apple silicon).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar el comportamiento del modelo base frente a la version abliterated con la misma bateria de pruebas permite estudiar que comportamientos se eliminan y cuales se preservan.

- Analisis de robustez de red-team: usar los 50 probes de la evaluacion house v2 como referencia para reproducir y auditar la supresion de negativas en modelos pequenos.

- Generacion creativa sin restricciones tematicas: util en escritura de ficcion que trate temas que el modelo base rechazaria, dado que la categoria "fiction" pasa de 2/8 a 0/8 rechazos.

- Prototipado rapido en local: con ~1,08 B de parametros en BF16 ocupa aproximadamente 2,2 GB, por lo que cabe en GPU de consumo y en Apple silicon mediante la version MLX 8-bit.

- Experimentos de interpretabilidad: al devolver estados ocultos por capa, permite analizar representaciones internas capa a capa, algo que el checkpoint original del proveedor no facilitaba.

- Chat multilingue ingles-chino: aplicaciones conversacionales en esos dos idiomas que requieran una plantilla de chat operativa de fabrica, ya que la version del proveedor no la incluye por defecto.

- Estudio comparativo de tecnicas de abliteracion: sirve como referencia frente a otros metodos (por ejemplo, edicion de direcciones de rechazo) en modelos del mismo orden de tamano.

## Benchmarks y rendimiento

La model card publica resultados de una evaluacion propia de red-team (house red-team v2, 50 sondas, evaluada en bfloat16) comparando el modelo base con la version abliterated:

| Categoria | Antes (base) | Despues (abliterated) |
|---|---|---|
| Control | 0/8 | 0/8 |
| Dual-use | 2/18 | 0/18 |
| Sensitive | 13/16 | 0/16 |
| Fiction | 2/8 | 0/8 |
| Total | 17/50 (34,0 %) | 0/50 (0,0 %) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los controles (preguntas factuales, un haiku y una receta) se cumplen en ambos lados, lo que indica que la ablacion no rompio el comportamiento normal segun esa evaluacion.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 2,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 3-4 GB para inferencia.
- VRAM estimada en cuantizacion 8-bit (MLX): en torno a 1,1-1,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabe holgadamente en RTX 3060 12 GB, RTX 4070, RTX 4090 y superiores; tambien en GPUs de datacenter como A100 o H100, aunque resultan desproporcionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via oficial documentada); MLX en Apple silicon mediante Avicennasis/K2-Horizon-0.9B-heretic-mlx-8bit. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la dependencia de codigo personalizado dificulta su integracion directa en estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Avicennasis/K2-Horizon-0.9B-heretic | ~1,08 B | No disponible | en, zh | Apache-2.0 | HuggingFace (transformers) |
| IFM/K2-Horizon-0.9B (base) | No disponible | No disponible | en, zh | Apache-2.0 | HuggingFace (transformers) |
| Avicennasis/K2-Horizon-0.9B-heretic-mlx-8bit | ~1,08 B | No disponible | en, zh | Apache-2.0 | HuggingFace (MLX) |

No se dispone de datos de rendimiento de benchmarks estandar para ninguno de estos modelos, por lo que la comparativa se limita a parametros, licencia y disponibilidad. No se conocen otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina el comportamiento de rechazo, no la formacion de seguridad subyacente; el autor advierte de que el modelo tiene un comportamiento de seguridad mas debil que la base.
- Riesgo de generar contenido danino, ilegal o sensible sin filtro; el propio autor pide un uso responsable y conforme a la legislacion aplicable.
- No se documentan sesgos especificos, pero al derivar de un modelo base sin informacion sobre su dataset de entrenamiento, se desconocen los sesgos heredados.
- Riesgo de alucinacion no cuantificado; no hay benchmarks de veracidad ni de conocimiento factual.
- La ventana de contexto es desconocida, lo que impide planificar casos de uso con entradas largas.
- Soporte limitado a ingles y chino; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- La dependencia de `trust_remote_code=True` obliga a ejecutar codigo Python del autor, lo que supone un riesgo de seguridad en entornos de produccion y limita su uso con motores de inferencia estandar.
- Aunque la licencia es Apache-2.0 (permite uso comercial), la ausencia de garantias y la falta de evaluaciones de robustez mas alla del red-team propio aconsejan no desplegarlo en produccion sin auditoria adicional.
- La discrepancia entre el nombre comercial (0.9B) y el recuento real de parametros (~1,08 B) puede complicar estimaciones de memoria y coste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/K2-Horizon-0.9B-heretic
- Modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B
- Version MLX 8-bit: https://huggingface.co/Avicennasis/K2-Horizon-0.9B-heretic-mlx-8bit
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Discusion del fix `@capture_outputs` en el modelo base: https://huggingface.co/IFM/K2-Horizon-0.9B/discussions/6
