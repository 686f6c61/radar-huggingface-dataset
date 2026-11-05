# MeganEFlynn/Qwen3-4B-speculator-perfectblend-hspec

## Resumen

Qwen3-4B-speculator-perfectblend-hspec es un modelo borrador (speculator) para decodificacion especulativa, desarrollado por MeganEFlynn y publicado bajo licencia Apache 2.0. No es un modelo de lenguaje autonomo: es un draft model que se acopla a Qwen/Qwen3-4B para proponer tokens que el modelo objetivo verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Su arquitectura es un hibrido Mamba/attention que fusiona estados ocultos de cinco capas del modelo objetivo.

La relevancia tecnica esta en su enfoque H-Spec (arXiv:2609.24197): en lugar de un transformer denso pequeno como borrador, combina capas Mamba con capas de atencion que comparten KV cache con el modelo objetivo, lo que reduce coste de memoria y permite ventanas deslizantes de 2048 tokens. Con 1.044 millones de parametros totales, es aproximadamente un 26 % del tamano de Qwen3-4B, pero su coste por iteracion de borrador es bajo gracias al componente Mamba.

El modelo se entrena sobre la mezcla perfectblend (1.382.563 muestras) y reporta una longitud de aceptacion media de 4,01 tokens en modo greedy con profundidad 7 sobre el conjunto de benchmarks de RedHatAI. Requiere vLLM con soporte H-Spec para desplegarse, por lo que su uso en produccion esta condicionado a esa integracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido Mamba/attention (patron `mamba mlp / mamba attention mlp / mamba attention mlp / mamba attention mlp`), modelo borrador para decodificacion especulativa |
| Parametros totales | 1.044.630.289 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2048 en capas de atencion; contexto efectivo heredado del modelo objetivo |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF) |
| Idiomas soportados | no disponible (heredados del modelo objetivo Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `speculators`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El speculator emplea un diseno hibrido con cuatro bloques que alternan capas Mamba y capas de atencion. La fusion latente se toma de las capas 1, 9, 17, 25 y 34 del modelo objetivo Qwen3-4B, con un ancho fusionado de 12800 dimensiones. Las capas de atencion en los niveles 17, 25 y 34 comparten la KV cache con el modelo objetivo y aplican una ventana deslizante de 2048 tokens. El componente Mamba usa 44 cabezas de dimension 64, `d_state` 4, 4 grupos y kernel de convolucion 4. El vocabulario de borrador es de 32000 tokens y las propuestas se generan de forma greedy.

El entrenamiento se realizo durante una epoca sobre la mezcla perfectblend (1.382.563 muestras) usando el toolkit `speculators` del proyecto vLLM (PR #1267, commit `3ff3391`). La funcion de perdida combina entropia cruzada y distancia de variacion total con pesos 0,1 CE y 0,9 TV, lo que prioriza el ajuste de la distribucion de propuestas frente a la prediccion exacta de tokens. La validacion offline con teacher forcing reporta EAL (expected acceptance length) de 5,170 y longitud de aceptacion de 5,062.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-4B; no genera texto de forma autonoma.
- Propuestas greedy con profundidad configurable (por defecto 7, techo 8).
- Fusion de estados ocultos de multiples capas del modelo objetivo (1, 9, 17, 25, 34).
- Reutilizacion de KV cache del modelo objetivo en las capas de atencion 17, 25 y 34.
- Procesamiento de secuencias con ventana deslizante de 2048 tokens en las capas de atencion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step por si mismo; esas capacidades dependen del modelo objetivo.
- Capacidades multilingues y de vision: no disponibles en el speculator; heredadas del modelo objetivo en la practica.

## Casos de uso

- Aceleracion de inferencia en produccion con Qwen3-4B: desplegar el speculator junto al modelo objetivo en vLLM con `--speculative-config` para reducir la latencia por token generado, manteniendo la calidad de salida intacta porque las propuestas se verifican contra el modelo grande.
- Servicio de chat de baja latencia: en escenarios interactivos donde el tiempo hasta el primer token y la velocidad de generacion importan, la longitud de aceptacion de ~4 tokens por iteracion reduce el numero de pasos de decodificacion del modelo de 4B.
- Generacion de codigo asistida: pipelines de autocompletado o generacion de parches donde el modelo objetivo Qwen3-4B ya se usa; el speculator acelera la salida sin cambiar el modelo base ni el prompt.
- Despliegue en GPUs con VRAM limitada: al anadir solo ~1 GB de pesos (repo de 2,1 GB) sobre el modelo de 4B, permite acelerar inferencia en hardware consumer sin recurrir a un modelo borrador transformer mas costoso.
- Evaluacion de tecnicas de decodificacion especulativa: util como referencia para investigadores que comparan borradores transformer densos frente a hibridos Mamba/attention con KV compartida.
- Experimentacion con H-Spec en vLLM: banco de pruebas para validar la integracion del PR #62780 y medir longitudes de aceptacion en dominios propios usando `RedHatAI/speculator_benchmarks`.
- Reduccion de coste en batch offline: en tareas de generacion masiva con Qwen3-4B, el incremento de throughput por iteracion de borrador se traduce en menor tiempo de GPU por peticion.

## Benchmarks y rendimiento

Resultados reportados por el autor (longitud de aceptacion AL = 1 + tokens aceptados / iteraciones de borrador, profundidad 7, techo 8, 8 subconjuntos x 80 peticiones de `RedHatAI/speculator_benchmarks`):

| Metrica | Valor |
|---|---|
| AL media, greedy (T=0) | 4,01 |
| AL media, muestreo recomendado Qwen3 (T=0.6, top-p 0.95, top-k 20) | 3,70 |
| EAL en validacion offline (teacher forcing) | 5,170 |
| Longitud de aceptacion en validacion offline | 5,062 |

No se han publicado comparaciones directas con otros speculators en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,1 GB en safetensors para el speculator, adicionales a la VRAM del modelo objetivo Qwen3-4B (unos 8 GB en fp16, menos con cuantizacion).
- GPU recomendadas: cualquier GPU capaz de servir Qwen3-4B, incluidas A100, H100, L40S y RTX 4090; el speculator anade una carga marginal.
- Cabe en GPU consumer: si, siempre que el modelo objetivo quepa; el speculator por si solo ocupa ~2 GB.
- Opciones de despliegue: vLLM con soporte H-Spec (PR #62780) y la configuracion `{"model": "MeganEFlynn/Qwen3-4B-speculator-perfectblend-hspec", "method": "mamba_attn_hybrid", "num_speculative_tokens": 7}`. No hay soporte documentado en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la ganancia depende de la tasa de aceptacion (AL ~4 sobre techo 8 en greedy) y de la carga del modelo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-speculator-perfectblend-hspec | 1.044 M | ventana 2048 (atencion) | Hibrido Mamba/attention, KV compartida | Apache 2.0 | HuggingFace, vLLM (PR #62780) |
| Speculators transformer densos para Qwen3-4B | no disponible | no disponible | Transformer denso | no disponible | no disponible |
| EAGLE / EAGLE-2 para modelos de 4B | no disponible | no disponible | Borrador con fusion de features | no disponible | no disponible |

No se dispone de datos publicados de alternativas comparables en la informacion proporcionada; la comparativa cuantitativa queda pendiente de benchmarks independientes.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe usarse de forma autonoma para generar texto, razonar o responder preguntas.
- Requiere vLLM con soporte H-Spec (PR #62780); sin esa integracion no es desplegable en otros runtimes habituales.
- La ventana de atencion es de 2048 tokens; secuencias mas largas dependen de la KV compartida con el modelo objetivo y pueden degradar la tasa de aceptacion.
- La longitud de aceptacion cae con muestreo (3,70 frente a 4,01 en greedy), por lo que la ganancia real varia segun la temperatura y el dominio.
- Entrenado sobre la mezcla perfectblend; el rendimiento en dominios especializados (codigo, matematicas, idiomas distintos del ingles) puede ser inferior y no esta documentado.
- Sesgos y riesgo de alucinacion: no aplicables directamente al speculator, pero las propuestas no verificadas podrian introducir degradacion si la integracion no verifica correctamente contra el modelo objetivo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B tiene sus propios terminos que deben respetarse.
- Sin descargas ni likes en el momento de la consulta y creado en 2026-11-05; madurez y soporte comunitario limitados.

## Enlaces

- HuggingFace: https://huggingface.co/MeganEFlynn/Qwen3-4B-speculator-perfectblend-hspec
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper H-Spec: https://arxiv.org/abs/2609.24197
- Toolkit speculators: https://github.com/vllm-project/speculators
- PR del toolkit: https://github.com/vllm-project/speculators/pull/1267
- PR de vLLM con soporte H-Spec: https://github.com/vllm-project/vllm/pull/62780
- Benchmarks de referencia: https://huggingface.co/RedHatAI/speculator_benchmarks
