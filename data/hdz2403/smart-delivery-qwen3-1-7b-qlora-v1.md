# HDZ2403/smart-delivery-qwen3-1.7b-qlora-v1

## Resumen

Smart Delivery B2B Qwen3-1.7B QLoRA V1 es un ajuste fino experimental del modelo Qwen3-1.7B en su variante cuantizada a 4 bits para MLX, orientado a la interpretación de solicitudes logísticas en un contexto B2B de reparto. Lo desarrolla el usuario HDZ2403 y se publica bajo la librería MLX, lo que lo hace ejecutable en hardware Apple Silicon. El modelo parte de `mlx-community/Qwen3-1.7B-4bit` y se adapta mediante QLoRA con rango 8 sobre 8 capas.

El objetivo declarado es convertir lenguaje natural de operaciones logísticas en intenciones y contratos estructurados, con evaluación sobre 40 casos sintéticos. En esa evaluación, el ajuste mejora la intención correcta de 11/40 a 26/40 y el contrato válido de 27/40 a 36/40 respecto al modelo base, aunque el éxito funcional solo alcanza 22/40. Se trata, por tanto, de una prueba de concepto con mejoras medibles pero insuficientes para producción.

La relevancia es doble: por un lado, demuestra el flujo QLoRA sobre MLX para dominios verticales con recursos limitados; por otro, sirve como caso de estudio de las limitaciones de los ajustes pequeños sobre modelos de 1.700 millones de parámetros cuando la tarea exige razonamiento estructurado y validación de permisos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste QLoRA sobre base cuantizada a 4 bits |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | Base en 4 bits (MLX); adaptadores QLoRA en precision de entrenamiento |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors para MLX (libreria `mlx`); adaptadores LoRA |
| Rank LoRA | 8 |
| Capas adaptadas | 8 |
| Checkpoint publicado | iteracion 79 (V1) |
| Framework de entrenamiento | MLX-LM |
| Tamano del repo | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

El modelo es un ajuste QLoRA sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. La base utilizada es la version ya cuantizada a 4 bits para MLX (`mlx-community/Qwen3-1.7B-4bit`), sobre la que se aplican adaptadores de bajo rango con rank 8 en 8 capas. El entrenamiento se realizó con MLX-LM, el framework de Apple para entrenamiento e inferencia en silicio de Apple.

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card indica únicamente que el mejor checkpoint de la V1 corresponde a la iteración 79 y que existe una V2 con resultados inferiores en la mayoría de métricas. Tampoco se detalla la estrategia de enmascarado de pérdida ni el formato exacto de las muestras de entrenamiento.

## Capacidades

- Interpretación de solicitudes logísticas en lenguaje natural y conversión a intenciones operativas.
- Generación de contratos estructurados (salida validable) para operaciones de reparto B2B.
- Clasificación de intención con mejora medible frente al base (26/40 frente a 11/40 en casos sintéticos).
- Rechazo seguro ante solicitudes no permitidas (7/8 en el conjunto evaluado).
- Ajuste especializado en dominio logístico mediante QLoRA, no un modelo generalista.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking explícito.
- Capacidades multilingües no disponibles en la información proporcionada.

## Casos de uso

- Triaje de solicitudes de reparto: el modelo recibe un mensaje de un operador y lo clasifica en una intención logística (crear envío, modificar ruta, consultar estado), actuando como primera capa de un router determinista que decide la acción siguiente.
- Extracción de campos para contratos: a partir de texto libre, genera un contrato estructurado que se valida contra un esquema antes de pasarlo a un sistema de gestión de pedidos; la métrica de contrato válido (36/40) indica que la mayoría de salidas son parseables.
- Filtro de seguridad previo a ejecución: el modelo rechaza solicitudes fuera de política (7/8 en rechazos seguros), lo que permite usarlo como guardarraíl barato antes de invocar operaciones sensibles.
- Prototipado rápido en Mac: al ejecutarse con MLX sobre Apple Silicon, permite iterar sobre prompts y flujos logísticos en un portátil sin GPU dedicada, acelerando la validación de ideas antes de invertir en modelos mayores.
- Generación de datos sintéticos de entrenamiento: el propio modelo puede producir pares solicitud-contrato que luego se revisan y se usan para ampliar el dataset de un ajuste posterior de mayor tamaño.
- Asistente interno de operaciones: integrado en una herramienta de back-office, sugiere la intención y los campos de una solicitud para que un humano confirme, reduciendo el tiempo de captura sin automatizar la ejecución.
- Evaluación comparativa de ajustes: sirve como referencia para medir si un QLoRA de bajo rango sobre un modelo de 1.700 millones aporta valor frente al base en una tarea vertical concreta.

## Benchmarks y rendimiento

Evaluación independiente publicada por el autor sobre 40 casos sintéticos:

| Metrica | Base | QLoRA V1 | QLoRA V2 |
|---|---:|---:|---:|
| Exito funcional | 11/40 | 22/40 | 19/40 |
| Intencion correcta | 11/40 | 26/40 | 23/40 |
| Contrato valido | 27/40 | 36/40 | 33/40 |
| Rechazos seguros | 5/8 | 7/8 | 7/8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base está cuantizado a 4 bits, por lo que los pesos ocupan aproximadamente 0,9-1,0 GB; con overhead de inferencia (KV cache y activaciones) el consumo se sitúa en torno a 1,5-2,5 GB para contextos moderados.
- GPU recomendadas: al ser un modelo MLX, el hardware objetivo son chips Apple Silicon (series M1, M2, M3 y M4). No se documenta soporte para CUDA en la información disponible.
- Cabe en cualquier Mac con Apple Silicon con 8 GB de memoria unificada o más; también en iPhone/iPad recientes con suficiente RAM, aunque no está documentado.
- Opciones de despliegue: MLX-LM (librería declarada). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Smart Delivery Qwen3-1.7B QLoRA V1 | 1.700 M | no disponible | Ajuste QLoRA logístico sobre MLX | no disponible | Hugging Face, MLX |
| Qwen3-1.7B (base) | 1.700 M | no disponible | Modelo generalista | no disponible en esta ficha | Hugging Face |
| Qwen3-1.7B-4bit (MLX) | 1.700 M | no disponible | Base cuantizada para Apple Silicon | no disponible en esta ficha | Hugging Face, MLX |

No se dispone de datos de benchmarks comparables con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explícitamente que no está aprobado para producción.
- Evaluado únicamente con 40 casos sintéticos; no hay validación con datos reales ni con distribución fuera de muestra.
- El éxito funcional es de 22/40, es decir, más de la mitad de los casos no completan correctamente la tarea de extremo a extremo.
- Requiere un router determinista y una capa de validación de permisos; no debe ejecutar operaciones logísticas de forma autónoma.
- Riesgo de alucinación en campos de contrato no cubiertos por el esquema de validación.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Idiomas soportados no documentados; el ajuste parece orientado a un único idioma, sin garantías multilingües.
- Sesgos conocidos no documentados por el autor.
- Dependencia de MLX limita el despliegue a hardware Apple; no hay evidencia de exportación a GGUF u otros formatos.
- El repositorio figura con 0.0 GB, lo que puede indicar que los pesos no están efectivamente subidos o que el tamaño no se ha calculado; conviene verificar antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HDZ2403/smart-delivery-qwen3-1.7b-qlora-v1
- Modelo base: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Familia Qwen3: https://huggingface.co/Qwen
- MLX-LM (framework de entrenamiento e inferencia): https://github.com/ml-explore/mlx-lm
- MLX (framework de Apple): https://github.com/ml-explore/mlx
