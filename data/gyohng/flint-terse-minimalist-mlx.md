# gyohng/flint-terse-minimalist-mlx

## Resumen

Flint Terse Minimalist (MLX) es un adaptador LoRA de tipo fine-tune publicado por el usuario gyohng sobre el modelo base `RecursiveSI/flint-int4`, la exportación MLX del modelo Flint en cuantización int4 desarrollado por Recursive. Su objetivo no es mejorar las capacidades del modelo base, sino reducir drásticamente la longitud del razonamiento interno que el modelo genera dentro de las etiquetas `<think>`, manteniendo intactas las respuestas finales. El adaptador está pensado para ejecutarse con mlx-lm en Apple Silicon sobre el checkpoint int4 sin modificar.

El modelo base Flint es un transformer con arquitectura Mixture-of-Experts (MoE), según se deduce de la mención a "routed experts" y "shared expert" en la model card. El adaptador aplica LoRA de rango 32 en FP32 sobre atención, el experto compartido y los MLP densos, además de LoRA por experto en `down_proj` de las últimas 16 capas MoE. El repositorio ocupa 0,8 GB y contiene únicamente los ficheros del adaptador (`adapters.safetensors` y `adapter_config.json`), no los pesos completos del modelo.

La relevancia de este adaptador radica en el ahorro computacional: según los datos del autor, reduce el pensamiento entre un 81 % y un 86 % en tareas de código y matemáticas, y un 85 % en prosa y chat, con una pérdida de precisión de unas 4 tareas de código sobre 110 respecto al base. Está licenciado bajo Apache-2.0, igual que Flint, y se distribuye también en versión GGUF para llama.cpp y LM Studio en otro repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (modelo base Flint int4); rango 32 en atención, experto compartido y MLP densos, más LoRA por experto en `down_proj` de las últimas 16 capas MoE |
| Parametros totales | no disponible (el adaptador pesa 842 MB; los parámetros del base no se indican) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (el adaptador está entrenado sobre los códigos enteros int4 del base en formato GGUF); otras cuantizaciones no soportadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapters.safetensors`, `adapter_config.json`); versión GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `RecursiveSI/flint-int4`, un transformer con arquitectura Mixture-of-Experts que combina expertos enrutados con un experto compartido y capas MLP densas. El entrenamiento se realizó directamente sobre los coeficientes int4 del modelo base, con LoRA de rango 32 en FP32 sobre atención, experto compartido y MLP densos. Además, se aplicó LoRA por experto sobre `down_proj` en las últimas 16 capas MoE; dado que mlx-lm usa un único rango para todos los módulos, los factores de rango 8 de los expertos se rellenaron con ceros hasta rango 32, lo que explica que este adaptador sea más grande que el de flint-terse.

El proceso de entrenamiento combinó aprendizaje por refuerzo y supervisión. En la fase de RL, el modelo aprendió de sus propias respuestas: una respuesta solo obtenía recompensa si superaba sus tests y cabía dentro de un presupuesto de pensamiento cada vez más reducido. Después, una pasada corta de aprendizaje supervisado enseñó el estilo de pensamiento telegráfico para prosa y chat. El código, los datos y un script de reproducción están disponibles en el repositorio de GitHub del autor.

## Capacidades

- Generación de texto con modo de razonamiento interno explícito dentro de etiquetas `<think>`, que el adaptador acorta a estilo telegráfico.
- Razonamiento y resolución de problemas de código: el autor reporta 98,0 sobre 110 tareas de código con el adaptador.
- Razonamiento matemático: 108,0 sobre 120 tareas según los datos del autor.
- Generación de prosa y conversación: mantiene respuestas finales completas y sin fugas de etiquetas `<think>`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo específico.
- El adaptador hereda las capacidades del modelo base Flint, pero la model card no las detalla más allá de razonamiento, código y texto.

## Casos de uso

- Inferencia local en Apple Silicon con mlx-lm: el adaptador está diseñado para ejecutarse sobre el checkpoint int4 sin modificar, lo que permite desplegar un modelo de razonamiento en Macs con memoria unificada y reducir el coste de generación al acortar el pensamiento.
- Asistentes de código en el editor: la reducción del 81 % en tokens de pensamiento en tareas de código disminuye la latencia percibida en autocompletado y generación de funciones, con una pérdida de precisión de unas 4 tareas sobre 110.
- Servidores compatibles con OpenAI: mediante `mlx_lm.server` se puede exponer el adaptador como endpoint compatible con la API de OpenAI para integrarlo en herramientas existentes.
- Prototipado de pipelines de razonamiento con presupuesto acotado: útil cuando se necesita un modelo que razone pero con un límite estricto de tokens internos, por ejemplo en entornos con latencia o coste por token críticos.
- Evaluación comparativa de estilos de razonamiento: el adaptador permite estudiar el compromiso entre precisión y longitud de pensamiento frente al base y frente a flint-terse, que conserva mejor la precisión en código.
- Experimentación académica sobre RL aplicado a modelos cuantizados: el repositorio de GitHub incluye datos y un script de reproducción que facilitan replicar el entrenamiento sobre coeficientes int4.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre el base int4 sin modificar en llama.cpp, con media de tres semillas, una muestra por tarea, temperatura 1, top-p 0,95 y top-k 20. La reducción de pensamiento es relativa al base en las mismas tareas.

| Modelo | Código (110 tareas) | Matemáticas (120 tareas) | Menos pensamiento: código | matemáticas | prosa y chat |
|---|---:|---:|---:|---:|---:|
| Flint int4 (base) | 102,3 | 103,3 | — | — | — |
| flint-terse | 102,7 | 109,7 | 62 % | 79 % | 85 % |
| flint-terse-minimalist | 98,0 | 108,0 | 81 % | 86 % | 85 % |

## Requisitos de hardware

- El adaptador pesa 842 MB y se aplica sobre el base `RecursiveSI/flint-int4`; la VRAM total depende del tamaño del modelo base, que no se especifica en la información disponible.
- Diseñado para Apple Silicon con mlx-lm; no se documentan requisitos para GPU NVIDIA ni AMD.
- No se dispone de datos sobre si cabe en GPUs de consumo concretas, ya que falta el tamaño del base.
- Opciones de despliegue: `mlx_lm.generate` para CLI y `mlx_lm.server` para servidor compatible con OpenAI. Para llama.cpp y LM Studio existe la versión GGUF en `gyohng/flint-terse-minimalist`.
- Muestreo recomendado: temperatura 1, top-p 0,95, top-k 20 y `--max-tokens 4096`.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Precisión código (110) | Precisión matemáticas (120) | Reducción de pensamiento (código) | Licencia |
|---|---|---:|---:|---:|---|
| Flint int4 (base) | Modelo completo int4 | 102,3 | 103,3 | — | Apache-2.0 |
| flint-terse | LoRA MLX | 102,7 | 109,7 | 62 % | Apache-2.0 |
| flint-terse-minimalist | LoRA MLX | 98,0 | 108,0 | 81 % | Apache-2.0 |

No se dispone de información sobre otros modelos comparables fuera de la familia Flint.

## Limitaciones y advertencias

- Solo es compatible con el checkpoint int4 de Flint en su forma GGUF; otras cuantizaciones son checkpoints distintos y no están soportadas.
- Pérdida de precisión en código: unas 4 tareas menos sobre 110 respecto al base; para máxima precisión en código el autor recomienda flint-terse.
- El adaptador está pensado para mlx-lm en Apple Silicon; no se garantiza su funcionamiento en otros runtimes salvo la versión GGUF separada.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas en la información disponible.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.
- La licencia Apache-2.0 permite uso comercial sin condiciones adicionales, pero se heredan las limitaciones del modelo base Flint.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/gyohng/flint-terse-minimalist-mlx
- Modelo base: https://huggingface.co/RecursiveSI/flint-int4
- Modelo Flint original: https://huggingface.co/RecursiveSI/flint
- Versión GGUF para llama.cpp y LM Studio: https://huggingface.co/gyohng/flint-terse-minimalist
- Variante flint-terse (MLX): https://huggingface.co/gyohng/flint-terse-mlx
- Repositorio de código, datos y reproducción: https://github.com/gyohng/flint-terse
- Organización Recursive: https://huggingface.co/RecursiveSI
