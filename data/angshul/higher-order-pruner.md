# Angshul/higher-order-pruner

## Resumen

Higher-Order Pruner es un método de poda (pruning) reutilizable empaquetado como repositorio de modelo en Hugging Face por el autor Angshul. No se trata de un checkpoint de un modelo de lenguaje, sino de una librería Python que implementa una técnica de poda no estructurada para modelos PyTorch compatibles. El paquete combina información de segundo orden derivada de calibración (diagonal KFAC) con una estimación de diferencias finitas de orden superior con recorte diagonal, una asignación global exacta de la dispersión objetivo y un refinamiento monótono sobre un conjunto de validación reservado.

El método no parte de inicializaciones tipo Wanda, SparseGPT ni poda por magnitud, ni de checkpoints previamente podados: calcula las estadísticas de calibración y las estimaciones de curvatura en tiempo de ejecución a partir del modelo y los datos que proporciona el usuario. Está pensado para investigadores y desarrolladores que necesitan reducir la densidad de pesos de modelos transformer (u otras arquitecturas con capas `torch.nn.Linear`) de forma controlada y reproducible.

La relevancia actual radica en que la poda sigue siendo una de las vías principales para reducir el coste de inferencia y memoria de modelos abiertos sin recurrir únicamente a la cuantización, y este repositorio ofrece una API directa tanto para modelos de Hugging Face como para cualquier modelo PyTorch con una función de pérdida diferenciable. El repositorio no incluye benchmarks ni checkpoints publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Método de poda (no es un modelo); opera sobre capas `torch.nn.Linear` de modelos PyTorch |
| Parametros totales | no disponible (depende del modelo objetivo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo objetivo; el ejemplo usa `sequence_length=512`) |
| Tipos de cuantizacion | no aplica; el método rechaza pesos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica (paquete Python); los checkpoints podados se guardan con `save_pretrained` en safetensors |

## Arquitectura y entrenamiento

El método no entrena un modelo, sino que poda uno existente. Su pipeline combina cuatro componentes: estadísticas de segundo orden derivadas de calibración mediante la diagonal de KFAC, una estimación de diferencias finitas de orden superior con recorte diagonal, una asignación global exacta del número de ceros solicitado y un refinamiento monótono sobre datos de validación reservados. El presupuesto de ceros se impone de forma exacta sobre los pesos seleccionados e incluye los ceros ya existentes en el modelo original.

La API se ofrece en dos variantes: un adaptador para modelos de Hugging Face (`prune_hf_model`) y una API genérica de PyTorch (`prune`) que acepta cualquier pérdida escalar diferenciable y lotes ya colocados en el dispositivo. Para arquitecturas no estándar se pueden pasar nombres de módulo explícitos mediante `module_names`. El adaptador de Hugging Face ajusta automáticamente el kernel de curvatura medido para maximizar el throughput bajo un techo del 95 % de VRAM, sin requerir un modelo de GPU concreto. El método no promete compatibilidad con kernels personalizados arbitrarios, tensores atados que no sean `Linear` ni arquitecturas que solo funcionan con código remoto.

## Capacidades

- Poda no estructurada de modelos PyTorch con control exacto de la dispersión objetivo.
- Integración directa con modelos de Hugging Face mediante `prune_hf_model`.
- API genérica para cualquier modelo PyTorch con pérdida diferenciable.
- Cálculo en tiempo de ejecución de estadísticas de calibración y estimaciones de curvatura, sin estadísticas precalculadas embebidas.
- Refinamiento monótono sobre datos de validación reservados.
- Ajuste automático del kernel de curvatura para throughput bajo un límite del 95 % de VRAM.
- Guardado del modelo podado como checkpoint estándar de Hugging Face en safetensors.
- Rechazo explícito de pesos cuantizados.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, al no ser un modelo lingüístico.

## Casos de uso

- Compresión de modelos abiertos para despliegue: aplicar el pruner a un modelo como `Qwen/Qwen3-4B-Base` con una dispersión del 50 % y guardar el checkpoint resultante en safetensors para servirlo con infraestructura estándar de Hugging Face.
- Investigación en poda de transformers: comparar la asignación global exacta de ceros con métodos como Wanda o SparseGPT usando los mismos datos de calibración y validación, ya que el método no se inicializa a partir de ellos.
- Ajuste fino de la dispersión por capa: usar `module_names` para seleccionar subconjuntos concretos de capas `Linear` en arquitecturas no estándar y medir el impacto en la pérdida de validación.
- Poda de modelos no lingüísticos: emplear la API genérica `prune` con una función de pérdida propia (por ejemplo, regresión o clasificación) sobre lotes ya preparados en el dispositivo.
- Experimentos reproducibles de compresión: el refinamiento monótono sobre datos reservados permite documentar la curva de pérdida frente a la dispersión solicitada y verificar la dispersión alcanzada en el informe (`achieved_sparsity`).
- Integración en pipelines de compresión previos a la cuantización: podar primero los pesos en punto flotante y cuantizar después, dado que el método rechaza pesos ya cuantizados.
- Evaluación de la viabilidad de kernels dispersos: generar modelos con ceros no estructurados para probar si un kernel de inferencia disperso concreto produce aceleraciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no contiene resultados de benchmarks ni un checkpoint podado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo objetivo y de la dispersión aplicada.
- GPU recomendadas: no disponible; el adaptador de Hugging Face no requiere un modelo de GPU específico y ajusta el kernel de curvatura bajo un techo del 95 % de VRAM.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el ejemplo de uso emplea `device="cuda"`.
- Opciones de despliegue del modelo podado: al guardarse como checkpoint estándar con `save_pretrained` en safetensors, es compatible con el ecosistema de Hugging Face (Transformers y servidores de inferencia que acepten safetensors); no se detallan opciones específicas como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La model card advierte que los ceros no estructurados requieren un kernel de inferencia disperso adecuado para producir aceleraciones reales.

## Comparativa con modelos similares

| Método | Tipo | Inicialización | Control de dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Higher-Order Pruner (Angshul) | Poda no estructurada con información de segundo orden y orden superior | Desde el modelo original, sin Wanda/SparseGPT/magnitud | Asignación global exacta del número de ceros | apache-2.0 | Hugging Face (Angshul/higher-order-pruner) |
| LayerInteractions (Angshul) | Poda de profundidad (capas) de modelos causales | Interacciones de orden 2 entre capas | Eliminación de capas según NLL | no disponible | Hugging Face (Angshul/LayerInteractions) |
| Wanda / SparseGPT | Poda no estructurada de referencia | Métodos de magnitud y reconstrucción | No especificado en la información disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos métodos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni ofrece capacidades de razonamiento, código o visión.
- No incluye checkpoints podados ni resultados de benchmarks; el rendimiento real de la poda debe medirse por el usuario.
- El método rechaza pesos cuantizados y no garantiza compatibilidad con kernels personalizados arbitrarios, tensores atados que no sean `Linear` ni arquitecturas que solo funcionan con código remoto.
- Los ceros no estructurados no producen aceleraciones de inferencia por sí solos; requieren un kernel de inferencia disperso adecuado.
- La calidad del resultado depende de los textos de calibración y validación aportados por el usuario; no hay estadísticas precalculadas.
- Riesgo de degradación del modelo podado no cuantificada en la información disponible; el refinamiento monótono sobre datos reservados mitiga pero no elimina este riesgo.
- Sesgos conocidos: no disponibles; al no ser un modelo, los sesgos dependerán del modelo objetivo al que se aplique.
- Licencia apache-2.0: permite uso comercial del paquete, pero no se detallan restricciones adicionales ni condiciones sobre los modelos podados resultantes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Angshul/higher-order-pruner
- LayerInteractions (mismo autor): https://huggingface.co/Angshul/LayerInteractions
- SpliNet (mismo autor): https://huggingface.co/Angshul/SpliNet
