# CopyleftCultivars/qwen3.5-2b-natural-farming-v5-cactus-cq4

## Resumen

Qwen3.5-2B Natural Farming v5 — Cactus CQ4 (Hessian-calibrated) es una compilación cuantizada del modelo `CopyleftCultivars/qwen3.5-2b-natural-farming-v5`, un ajuste fino de `Qwen/Qwen3.5-2B` orientado a conversación y llamada de herramientas sobre agricultura natural. El autor, CopyleftCultivars, lo publica como carpeta completa del motor Cactus, pensada para ser descargada y ejecutada en dispositivos Android por la aplicación Natural Farming Chat.

El modelo resuelve un problema muy concreto: llevar un asistente especializado de 2 000 millones de parámetros a un teléfono móvil con un presupuesto de almacenamiento de aproximadamente 1,1 GB. Para ello se aplica una cuantización CQ4 calibrada con estadísticas de Hessiano recogidas sobre 1 942 078 tokens, manteniendo en FP16 las normas y los tensores no bidimensionales.

La relevancia actual reside en el formato de despliegue: no se distribuye como safetensors ni GGUF, sino como un grafo Cactus con pesos por capa, plantilla de chat y ficheros IR optimizados. Es, por tanto, un artefacto de inferencia en dispositivo más que un modelo reutilizable en pipelines de servidor convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), pesos cuantizados a CQ4 con calibración por Hessiano |
| Parametros totales | 2 000 millones (modelo base Qwen3.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | CQ4 (187 tensores) + FP16 (133 tensores: normas y tensores no 2D) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Cactus: `layer_*.weights`, `token_embeddings.weights`, `output_norm.weights`, grafos en `components/`, `optimized_ir*.json`, `raw_ir*.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B`, un transformer decoder-only de 2 000 millones de parámetros bajo licencia Apache-2.0. Sobre esa base se aplicó un ajuste fino con LoRA que posteriormente se fusionó en pesos bf16; ese artefacto intermedio se publica en el repositorio bf16 del mismo autor. Los datos de ajuste fino no se han publicado, por lo que no es posible verificar la composición del corpus, el número de tokens de entrenamiento ni si se emplearon técnicas de alineación como RLHF o DPO.

La innovación técnica de esta ficha es el proceso de conversión. Se cuantizaron 187 tensores a CQ4 y se dejaron 133 en FP16, correspondientes a normas y tensores no bidimensionales, una práctica habitual para preservar estabilidad numérica. La cuantización CQ4 está calibrada con estadísticas de Hessiano calculadas sobre 1 942 078 tokens, lo que permite asignar el error de cuantización de forma sensible a la curvatura de la pérdida en lugar de usar escalas uniformes. El paquete incluye además grafos de decodificador y decodificador por paso (`components/`), junto con representaciones IR optimizadas y sin optimizar, lo que sugiere un grafo de ejecución preparado para el runtime Cactus en Android.

## Capacidades

- Generación de texto conversacional en inglés sobre temáticas de agricultura natural.
- Llamada de herramientas (tool calling) restringida a seis herramientas definidas por la aplicación, entre ellas una calculadora de recetas de bioacumuladores.
- Selección de herramienta y construcción de argumentos: el modelo decide qué herramienta invocar y con qué parámetros, pero no calcula las cantidades.
- Redacción de instrucciones alrededor de los resultados numéricos devueltos por las herramientas.
- Ejecución en dispositivo (on-device) mediante el motor Cactus, con soporte para Android.
- No se declaran capacidades de visión, audio, modo de razonamiento explícito ni multilingüismo más allá del inglés.

## Casos de uso

- Asistente agrícola embebido en Android: la aplicación Natural Farming Chat descarga el paquete en un commit fijado y lo ejecuta localmente, de modo que el usuario obtiene respuestas sin conexión ni envío de consultas a un servidor.
- Resolución de dudas sobre preparados y biofertilizantes: el modelo mantiene conversaciones multi-turno en inglés y responde con orientación general, apoyándose en las herramientas de la app para los valores numéricos.
- Cálculo asistido de recetas de bioacumuladores: ante una consulta del tipo "¿cuánto preparado necesito para X litros?", el modelo invoca la herramienta de recetas con los argumentos adecuados y redacta la respuesta a partir del resultado que devuelve la aplicación.
- Despacho de herramientas en cadena: el modelo puede encadenar la selección de herramienta con la redacción de instrucciones de aplicación, útil para flujos guiados paso a paso dentro de la app.
- Distribución de modelos en campo: al pesar aproximadamente 1,1 GB y verificar tamaño y hash (SHA-256 o SHA-1 de git para ficheros pequeños) antes de marcar la instalación como completa, encaja en despliegues con conectividad intermitente.
- Base para experimentación en inferencia móvil: sirve como referencia para evaluar el rendimiento de CQ4 calibrado por Hessiano frente a otras cuantizaciones en el runtime Cactus.
- Integración en otras aplicaciones Cactus: cualquier runtime Cactus que soporte la arquitectura Qwen3.5 puede apuntarse a esta carpeta para reproducir el comportamiento del asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 1,13 GB para los 347 ficheros del repositorio (1,1 GB según el tamaño del repo en HuggingFace).
- VRAM/RAM: no disponible de forma explícita; el destino declarado es un teléfono Android, por lo que el modelo está dimensionado para memoria unificada de dispositivo móvil, no para GPU de servidor.
- GPU recomendadas: no aplica al caso de uso previsto; para ejecución en servidor se requeriría un runtime Cactus compatible con la arquitectura Qwen3.5, no documentado en la información disponible.
- GPU de consumo: no se documenta soporte para RTX 4090 u otras GPU de consumo; el formato de pesos no es GGUF ni safetensors.
- Opciones de despliegue: motor Cactus (https://github.com/cactus-compute/cactus) y la aplicación Natural Farming Chat. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen3.5-2B Natural Farming v5 Cactus CQ4 | 2 000 M | no disponible | Cactus CQ4 + FP16 | Apache-2.0 | Especializado en agricultura natural y tool calling; solo inglés; pensado para Android |
| Qwen/Qwen3.5-2B (base) | 2 000 M | no disponible | safetensors (bf16) | Apache-2.0 | Modelo generalista sin especialización ni cuantización móvil |
| CopyleftCultivars/qwen3.5-2b-natural-farming-v5 (bf16) | 2 000 M | no disponible | bf16 | Apache-2.0 | Misma especialización, sin cuantizar; requiere más memoria |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un ajuste fino de 2 000 millones de parámetros cuantizado para móvil y el propio autor advierte que puede equivocarse; su salida debe tratarse como información, no como sustituto de conocimiento agronómico local.
- Las cantidades y notas de seguridad deben verificarse antes de aplicar cualquier preparado a cultivos o suelo; el modelo no calcula dosis, solo selecciona herramientas y redacta texto.
- El conjunto de datos de ajuste fino no se ha publicado, lo que impide auditar sesgos, cobertura temática y posibles contaminaciones.
- Soporte exclusivo de inglés: no se declara capacidad multilingüe, incluido el castellano.
- La longitud de contexto no se documenta en la información disponible, lo que limita la planificación de conversaciones largas.
- El formato de pesos es propietario del runtime Cactus; no es directamente cargable en vLLM, llama.cpp, Ollama o TGI, lo que restringe su uso fuera del ecosistema previsto.
- Los ficheros `config.txt` y `hf_config.json` conservan en `_name_or_path` la ruta local desde la que se ejecutó la conversión; según el autor no afecta a la carga, pero conviene tenerlo en cuenta al integrar.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen3.5-2B conviene revisar las condiciones del modelo base y de los datos de ajuste fino no publicados.
- Riesgo de alucinación en recomendaciones agronómicas: la app mitiga parte del problema delegando los cálculos en tablas de datos propias, pero el texto generado alrededor de esas cifras no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CopyleftCultivars/qwen3.5-2b-natural-farming-v5-cactus-cq4
- Modelo bf16 de origen: https://huggingface.co/CopyleftCultivars/qwen3.5-2b-natural-farming-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Motor Cactus: https://github.com/cactus-compute/cactus
- Código de la app y del ajuste fino: https://github.com/CopyleftCultivars/qwen3.5-finetune
- Arnés de benchmarks: https://github.com/CopyleftCultivars/bioaccumulator-benchmark
