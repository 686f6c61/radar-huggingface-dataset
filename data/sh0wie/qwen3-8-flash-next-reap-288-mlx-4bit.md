# sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-REAP-288-MLX-4bit es una versión podada y cuantizada del modelo multimodal Qwen3.8-Flash-Next, desarrollada por el usuario sh0wie. El modelo original, creado por el equipo de Qwen, es un MoE ultra disperso de 125B parámetros (más una tabla n-gram de 51B) que sirve como adelanto de la arquitectura Qwen4. Esta variante aplica poda de expertos mediante la técnica REAP, reduciendo de 512 a 288 expertos por capa MoE, y convierte los pesos a formato MLX con cuantización 4-bit para ejecutarse eficientemente en hardware Apple Silicon.

La relevancia de este modelo radica en que mantiene un rendimiento cercano al original (91.5% vs 93.9% en HumanEval pass@1) mientras reduce el uso de disco en un 31% y la memoria residente hasta un 60% (de 97 GB a 39 GB con la tabla n-gram en NVMe). Está diseñado para cargas de trabajo agénticas de codificación y se ejecuta con stock mlx-vlm, sin parches adicionales. El modelo conserva los pesos de visión, aunque solo se ha evaluado la calidad de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 48 capas alternando Gated DeltaNet y Qwen Sparse Attention, cada una con MoE de 288 expertos (de 512 originales) con routing top-10 |
| Parametros totales | 21.202.711.891 (pesos cuantizados en safetensors; el modelo base tiene 125B + 51B de tabla n-gram) |
| Parametros activos | No disponible para esta versión; el modelo base activa 6B por token |
| Longitud de contexto | 262.000 tokens (según documentación de unsloth para el modelo base) |
| Tipos de cuantizacion | 4-bit affine (grupo 64; tabla n-gram grupo 32) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, y la cuarta usa Qwen Sparse Attention para recuperación precisa de contexto largo. Cada capa contiene un MoE con 512 expertos en el modelo original, de los cuales esta versión conserva 288 tras aplicar poda REAP (saliency calibrada sobre los pesos cuantizados). El routing se mantiene en top-10, sin estrecharse, ya que reducir el ancho de routing degrada significativamente el rendimiento (top-6 baja a 84.8% y top-4 a 63.4% en HumanEval).

El entrenamiento de la poda se realizó sobre el propio hardware de inferencia, calibrando con aproximadamente 686K tokens de tráfico de codificación agéntica. Se corrigieron dos defectos de la conversión MLX original: los tensores RMSNorm se re-centraron a la convención de cero, y los tensores de la tabla n-gram se renombraron para coincidir con el módulo del runtime. El modelo soporta decodificación especulativa MTP con un drafter complementario, con tasas de aceptación del 44-68% y aceleraciones de 1.5-2.6x en GPUs de clase M5.

## Capacidades

- Generación de texto y código con razonamiento multi-paso, orientado a cargas agénticas de programación.
- Soporte de decodificación especulativa MTP (multi-token prediction) mediante un drafter externo.
- Capacidades multimodales: los pesos del vision tower están intactos, aunque no se ha evaluado su calidad tras la poda.
- Integración con mlx-vlm para generación local y servidor compatible con API OpenAI.
- Manejo de contexto largo (262K tokens) gracias a la combinación Gated DeltaNet + Qwen Sparse Attention.
- Eficiencia de memoria: puede ejecutarse con 39 GB residentes si la tabla n-gram se sirve desde NVMe.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede ejecutar tareas como refactorización, validación de entradas o generación de tests, manteniendo un contexto amplio de todo el repositorio gracias a su ventana de 262K tokens.
- Asistente de programación en IDE: con ~28 tok/s en un M4 Max, puede integrarse en flujos de autocompletado y sugerencias de código en tiempo real.
- Servidor de inferencia local compatible con OpenAI: el comando `mlx_vlm.server` expone una API estándar, permitiendo sustituir servicios en la nube por hardware propio en entornos de desarrollo.
- Automatización de pipelines CI/CD: el modelo puede generar o revisar código en etapas de integración continua, aprovechando su capacidad de tool calling (heredada del modelo base) para interactuar con sistemas externos.
- Investigación sobre poda de MoE: la herramienta REAP y el manifiesto de expertos conservados (`reap_kept_experts.json`) permiten reproducir el proceso y estudiar el impacto de la poda en modelos de gran escala.
- Despliegue en Macs con Apple Silicon: al ser un modelo MLX, puede ejecutarse en equipos con 128 GB de memoria unificada sin necesidad de GPUs dedicadas, lo que facilita prototipado y pruebas locales.

## Benchmarks y rendimiento

Los resultados de HumanEval pass@1 reportados por el autor, medidos con 164 problemas y verificación unit-test en una sola ejecución, son:

| Build | Expertos | Disco | HumanEval pass@1 |
|---|---|---|---|
| Base Q4 (stock conversion) | 512 | 98 GB | 93.9% |
| 384 | 384 | 80 GB | 92.1% |
| 320 | 320 | 72 GB | 90.9% |
| **REAP-288 (este build)** | **288** | **68 GB** | **91.5%** |
| 256 | 256 | 65 GB | 88.4% |

No se han publicado otros benchmarks (MMLU, GSM8K, etc.) en la información disponible. El autor advierte que las diferencias de uno o dos puntos entre builds vecinos están dentro del ruido, y que la calibración se realizó sobre una distribución específica de codificación agéntica.

## Requisitos de hardware

- Memoria: 68 GB residentes en configuración estándar; 39 GB si la tabla n-gram se sirve desde NVMe (requiere parche no incluido en mlx-vlm).
- Disco: 68 GB para los pesos cuantizados.
- GPU: diseñado para Apple Silicon; el autor reporta ~28 tok/s de decodificación en un M4 Max con 128 GB.
- Aceleración especulativa: el drafter MTP proporciona 1.5-2.6x en GPUs de clase M5; en M4 es aproximadamente punto muerto.
- Despliegue: requiere mlx-vlm con soporte `qwen4_exp` (git main posterior a 2026-08-27). Se puede usar `mlx_vlm.generate` para generación y `mlx_vlm.server` para servir una API OpenAI-compatible.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) debido a su tamaño; está pensado para Macs con memoria unificada de 128 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval pass@1 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base, Q4) | 125B + 51B n-gram | 262K | 93.9% | Qwen Community 1.0 | MLX 4-bit |
| **REAP-288 (este build)** | ~21B cuantizados (125B original) | 262K | 91.5% | Qwen Community 1.0 | MLX 4-bit |
| REAP-256 (poda más agresiva) | ~65 GB disco | 262K | 88.4% | Qwen Community 1.0 | MLX 4-bit |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de otros modelos comparables en la información proporcionada. La ventaja principal de REAP-288 es el equilibrio entre rendimiento y uso de recursos: pierde 2.4 puntos de HumanEval frente al base, pero reduce el disco en 30 GB y permite ejecutar el modelo en configuraciones de memoria más ajustadas.

## Limitaciones y advertencias

- La calibración de poda se realizó sobre tráfico de codificación agéntica de un solo equipo; el rendimiento en dominios alejados del código puede degradarse más de lo esperado.
- Las evaluaciones son de una sola ejecución, sin intervalos de confianza; diferencias de 1-2 puntos entre builds son estadísticamente irrelevantes.
- La fiabilidad de muestreo de nombres raros es de 9/10, no 10/10; si aparece un nombre corrupto en el contexto, puede condicionar negativamente generaciones posteriores.
- La entrada de visión no ha sido probada tras la poda; los pesos multimodales están intactos pero no verificados.
- La licencia Qwen Community 1.0 puede tener restricciones para uso comercial; se debe revisar el texto completo de la licencia.
- El modo de 39 GB residentes requiere un parche propio del autor que no está incluido en mlx-vlm estándar.
- No se especifican los idiomas soportados; el modelo base es multilingüe, pero esta variante no documenta su cobertura.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit)
- [Drafter MTP complementario](https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16)
- [Repositorio del modelo base Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Documentación de unsloth para ejecución local](https://unsloth.ai/docs/models/qwen3.8-next)
- [Recetas vLLM para Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- [Qwen3.8-Flash en QwenCloud](https://www.qwencloud.com/models/qwen3.8-flash)
