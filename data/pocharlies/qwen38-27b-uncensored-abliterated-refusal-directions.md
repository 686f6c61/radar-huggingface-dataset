# pocharlies/qwen38-27b-uncensored-abliterated-refusal-directions

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un archivo de direcciones de refusal (rank-1) de solo 2,6 MB para el modelo base Qwen/Qwen3.8-27B. Desarrollado por pocharlies, el archivo permite aplicar técnicas de abliteration y activation steering de forma dinámica sobre el modelo base, sin necesidad de descargar un segundo checkpoint completo de 23 GB. La principal innovación es que el usuario puede activar o desactivar la eliminación de la negativa a responder (refusal) en tiempo de ejecución mediante una llamada HTTP a un servidor vLLM, sin reiniciar el servicio ni duplicar los pesos en disco.

El método se basa en la descomposición en valores singulares (SVD) de la diferencia de pesos entre el checkpoint base y un checkpoint abliterado públicamente disponible, extrayendo 128 vectores unitarios en R^5120 que se proyectan sobre las salidas de las subcapas que escriben en el flujo residual. Con un parámetro λ ajustable (donde λ=0 es bit-exacto al modelo original y λ=1 reproduce exactamente el perfil de ablación de la fuente), se consigue un control fino y medible del comportamiento de rechazo. Es una herramienta relevante para investigación en interpretabilidad, despliegue de asistentes con moderación dinámica y optimización de costes de almacenamiento e inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccion de refusal (rank-1) para el modelo base Qwen/Qwen3.8-27B |
| Parametros totales | No aplica (archivo de 2,6 MB con 128 tensores F32[5120]) |
| Parametros activos | No aplica |
| Longitud de contexto | Heredada del modelo base Qwen3.8-27B (no especificada en la ficha) |
| Tipos de cuantizacion | No aplica (vectores en FP32) |
| Idiomas soportados | Heredados del modelo base Qwen3.8-27B (no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El archivo contiene 128 tensores de tipo F32[5120] distribuidos en tres tipos de módulos: 48 proyecciones de salida de atención lineal (`linear_attn.out_proj`), 16 proyecciones de salida de auto-atención (`self_attn.o_proj`) y 64 proyecciones de descenso del MLP (`mlp.down_proj`), cubriendo las capas 0 a 63 completas. La derivación se realizó mediante SVD en float64 de la diferencia ΔW = W_abl − W_base entre dos checkpoints públicos: el base `Qwen/Qwen3.8-27B` y el abliterado `Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored`, ambos en BF16 para evitar ruido de requantización.

La proyección se aplica mediante el hook `y ← y − λ · coef_m · r̂ (r̂ · y)` sobre la salida de cada subcapa. El coeficiente `coef_m` es el λ_eff medido para ese módulo, que varía entre 0.999 y 1.291; colapsarlo a una única media introduciría errores de hasta el 21,8 % en algunos módulos. Las métricas de validación muestran una energía rank-1 entre 0.9867 y 0.9927, una relación s₀/s₁ entre 32.4 y 77.1, y una proyección frente a pesos editados con error de 7.9e-16 en float64, lo que confirma que la dirección captura casi toda la señal de edición. El autor también documenta dos candidatos alternativos que no superaron las métricas de rank-1, subrayando que el nombre "abliterated" en un repositorio no garantiza una estructura rank-1 válida.

## Capacidades

- Control dinámico de refusal: permite alternar entre el modelo base sin censura y el modelo abliterado en tiempo de ejecución mediante una llamada HTTP (`/admin/refusal_lambda`), con λ=0 bit-exacto al original.
- Compatibilidad con tool calling: las pruebas del autor confirman que la funcionalidad de llamada a herramientas se mantiene intacta tanto con λ=0 como con λ=1.
- Interpretabilidad: los vectores de dirección permiten estudiar cómo se codifica la negativa en el espacio residual del modelo, con métricas cuantitativas de energía y proyección.
- Rendimiento estable en trabajo benigno: el throughput medido en el pod de pruebas se mantiene en torno a 20 tok/s tanto con la ablación activada como desactivada.
- Integración con vLLM: el parche está diseñado para servirse con vLLM, aprovechando el soporte de hooks y la API de administración para el ajuste en caliente.
- Escalabilidad de almacenamiento: 2,6 MB frente a los 23 GB de un checkpoint completo, lo que permite mantener múltiples configuraciones de comportamiento sin duplicar pesos.

## Casos de uso

- Moderación dinámica de contenido: un servicio de atención al cliente puede activar λ=1 para permitir respuestas sin restricciones en contextos técnicos y desactivarlo (λ=0) para consultas sensibles, todo con una única instancia del modelo y sin reinicios.
- Investigación en interpretabilidad: los vectores de dirección permiten a los investigadores analizar qué subcapas contribuyen más a la negativa y cómo se distribuye la señal en el flujo residual, con métricas de energía rank-1 y cosenos de proyección.
- Despliegue de asistentes sin censura controlada: equipos que necesitan un modelo "uncensored" para dominios específicos (por ejemplo, escritura creativa o análisis de código) pueden activar la ablación solo cuando sea necesario, manteniendo el comportamiento seguro por defecto.
- A/B testing de comportamiento: el dial de λ permite comparar en producción el rendimiento del modelo base frente al abliterado en las mismas prompts, midiendo tasas de rechazo, aceptación de tokens y calidad de respuesta sin duplicar infraestructura.
- Optimización de costes de almacenamiento: en entornos con múltiples modelos desplegados, sustituir checkpoints abliterados completos por este archivo de direcciones reduce drásticamente el espacio en disco y los tiempos de carga.
- Pipeline de generación con multi-token prediction (MTP): el autor documenta cómo el parche afecta a la aceptación del drafter en vLLM, permitiendo a los desarrolladores ajustar λ para equilibrar velocidad de decodificación y comportamiento de refusal en tareas específicas.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de las pruebas realizadas por el autor en su pod de pruebas, con temperatura 0 y prompts idénticos:

| Metrica | λ=0 | λ=1 |
|---|---|---|
| Tasa de refusal (5 triggers de bajo riesgo) | 5/5 | 0/5 |
| Control benigno falsamente rechazado | 0/1 | 0/1 |
| Tool-calling | OK | OK |
| Throughput alternado (tok/s) | 20.2 / 20.4 | 20.6 / 20.3 |
| Aceptacion MTP (mediana, 62 muestras) | 2.80 | max 4.00 en k=3 |

El autor también midió el impacto del dial de λ sobre la aceptación del drafter MTP en prompts de refusal:

| λ | Refusals | Aceptacion MTP |
|---|---:|---:|
| 0.3 | 4/4 | 2.72 |
| 0.5 | 3/4 | 2.87 |
| 0.7 | 1/4 | 2.41 |
| 1.0 | 0/4 | 2.61 |

La conclusión del autor es que la caída de aceptación MTP en temas de refusal (de 3.00 a 2.41 en su prueba controlada) no se debe a la ablación en sí, sino a la dificultad de predecir contenido nuevo frente a texto formulaico de rechazo. No se han publicado resultados de benchmarks estándar como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- El archivo de direcciones en sí no requiere VRAM adicional significativa (2,6 MB en FP32), pero es necesario servir el modelo base Qwen/Qwen3.8-27B completo.
- Para el modelo base en BF16 se recomienda una GPU con al menos 60 GB de VRAM, como A100 80GB, H100 80GB o A6000 48GB (con cuantización).
- En GPUs de consumo como RTX 4090 (24 GB) es posible ejecutar el modelo con cuantización (por ejemplo, AWQ o GPTQ), aunque el parche está diseñado y probado principalmente con vLLM en BF16.
- El despliegue requiere vLLM con soporte para hooks personalizados y la API de administración; el autor proporciona el parche y el código en su repositorio de GitHub.
- El throughput medido en el pod del autor es de aproximadamente 20 tok/s, aunque depende del hardware exacto y de la configuración de decodificación especulativa (MTP).
- Para producción con alta concurrencia se recomienda al menos 2 GPUs si se quiere mantener el modelo base y el drafter MTP en memoria simultáneamente.

## Comparativa con modelos similares

| Caracteristica | Este repositorio (direcciones rank-1) | Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored | trohrbaugh/Qwen3.8-27B-heretic-ara | orwelian84/Qwen3.8-27B-OBLITERATUS-Advanced |
|---|---|---|---|---|
| Tipo | Archivo de direcciones (2,6 MB) | Checkpoint completo abliterado (23 GB) | Checkpoint completo abliterado | Checkpoint completo abliterado |
| Control dinamico | Si (λ ajustable en runtime) | No (pesos fijos) | No (pesos fijos) | No (pesos fijos) |
| Energia rank-1 | 0.9867 – 0.9927 | No medido por el autor | 0.14 – 0.87 | 0.32 – 0.55 |
| Relacion s₀/s₁ | 32.4 – 77.1 | No medido | 1.14 – 4.59 | 1.19 – 1.90 |
| Coseno con W_base | 0.936 – 0.9999 | No medido | 0.17 – 0.46 | 0.9997 |
| Licencia | Apache-2.0 | Apache-2.0 (base) | No disponible | No disponible |

La comparativa muestra que los candidatos alternativos no presentan una estructura rank-1 dominante, lo que indica que sus ediciones no son fácilmente representables como una única dirección de activación. Este repositorio ofrece una ventaja clara en flexibilidad de despliegue y coste de almacenamiento frente a los checkpoints completos.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base Qwen/Qwen3.8-27B y un servidor vLLM con el parche aplicado; no puede usarse de forma aislada.
- La calidad de la ablación depende de la fuente utilizada para derivar las direcciones (Zynerji/Ektome); si esa fuente tiene sesgos o ediciones incompletas, se heredarán.
- La aceptación del drafter MTP cae aproximadamente un 20 % en prompts de refusal cuando λ=1, lo que puede reducir el throughput en tareas que combinan generación larga con temas sensibles.
- El autor advierte explícitamente que no se debe confiar en muestras únicas para medir el impacto del parche; la variabilidad entre réplicas puede superar las diferencias observadas.
- Aunque la licencia del archivo es Apache-2.0, el uso comercial del modelo base Qwen3.8-27B está sujeto a la licencia de Qwen (Apache-2.0), pero se recomienda revisar los términos específicos del proveedor.
- El ajuste de λ en producción puede producir respuestas sin restricciones que no son adecuadas para todos los entornos; es responsabilidad del operador implementar salvaguardas adicionales si es necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pocharlies/qwen38-27b-uncensored-abliterated-refusal-directions
- Codigo, parche y benchmarks: https://github.com/pocharlies/qwen38-27b-rank1-refusal-projection
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint abliterado de referencia: https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored
- Articulo de referencia sobre abliteration: https://arxiv.org/abs/2406.11717
