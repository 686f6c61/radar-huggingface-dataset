# pipenetwork/Qwen3.8-Flash-Next-MLX-6bit

## Resumen

Qwen3.8-Flash-Next-MLX-6bit es una conversión a MLX (Apple Silicon) del modelo Qwen3.8-Flash-Next, un MoE híbrido de 125B parámetros con 6B activos por token, desarrollado por Qwen como preview de la arquitectura Qwen4. Esta versión, creada por el usuario pipenetwork, cuantiza los pesos a 6 bits para reducir el tamaño de 360 GB (bfloat16) a 148 GB, permitiendo su ejecución en hardware Apple con memoria unificada. Incluye además una tabla de n-gramas hashed de 51B parámetros, que también se cuantiza.

El modelo combina Gated DeltaNet (compresión de historial) con Qwen Sparse Attention (recuperación de largo alcance) en una arquitectura de mezcla de expertos ultra dispersa. La conversión MLX incorpora un runtime propio (`qwen4_exp.py`) con tres correcciones numéricas sobre el PR abierto en mlx-lm, garantizando paridad con transformers. Es relevante porque permite ejecutar un modelo de 176B parámetros totales en hardware de consumo (Apple Silicon) con una pérdida de calidad estadísticamente insignificante frente al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido Gated-DeltaNet + Qwen Sparse Attention, con tabla de n-gramas hashed |
| Parametros totales | 40.832.006.291 (según safetensors; el modelo original declara 125B-A6B + 51B de tabla de n-gramas) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 6-bit (grupo 64 para expertos y atención; grupo 32 para tablas de n-gramas) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina tres de cada cuatro capas con Gated DeltaNet, que comprime el historial de forma recurrente, y la cuarta capa con Qwen Sparse Attention para recuperación precisa de información a largo plazo. El modelo es un MoE ultra disperso con 6B parámetros activos por token, complementado por una tabla de n-gramas hashed de 51B parámetros que actúa como memoria asociativa adicional. Incluye una torre de visión (0.4B parámetros) que se mantiene en bfloat16 pero no se utiliza en el runtime MLX.

No se dispone de información detallada sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación). El modelo se presenta como un preview experimental de la arquitectura Qwen4, similar al papel que Qwen3-Next jugó para Qwen3.5. La conversión MLX aplica tres correcciones numéricas sobre el PR de soporte en mlx-lm: la variante de RMSNorm (el `+1` se pliega en los pesos), la semilla del hash de n-gramas (usa 1234 en lugar de 0) y el prefill de atención sparse (bloques por consulta con causalidad correcta). Estas correcciones garantizan paridad 1e-7 con transformers en el camino denso.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento avanzado y resolución de problemas complejos, según la descripción del modelo base.
- Generación de código y soporte para tareas de programación (el ejemplo del runtime incluye una función Python).
- Capacidades multimodales (visión) en el modelo original, aunque el runtime MLX de esta versión es solo texto.
- Soporte de contexto largo de 262K tokens, útil para documentos extensos o historiales de conversación largos.
- No se especifica soporte explícito de tool calling o function calling en la documentación disponible.

## Casos de uso

- Ejecución local en Apple Silicon: gracias a la cuantización 6-bit y al runtime MLX, el modelo puede ejecutarse en Mac con memoria unificada de al menos 192 GB, sin necesidad de GPU dedicada. Es adecuado para desarrollo y pruebas en entornos sin acceso a clústeres GPU.
- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de funciones, revisión de código y explicación de algoritmos, como se muestra en el prompt de ejemplo del runtime.
- Análisis de documentos largos: con 262K tokens de contexto, puede procesar libros técnicos, informes extensos o bases de código completas para extraer información o resumir.
- Investigación en arquitecturas híbridas: al ser un preview de Qwen4, permite experimentar con Gated DeltaNet y atención sparse en un entorno local, evaluando su comportamiento en tareas específicas.
- Prototipado de asistentes conversacionales: su capacidad de razonamiento y generación de texto lo hace útil para construir chatbots o asistentes virtuales con conocimiento técnico.
- Evaluación de cuantización: la familia de builds MLX (4-bit, 6-bit, 8-bit, mixed) permite estudiar el impacto de la cuantización en la calidad del modelo, como se documenta en la model card con métricas de perplexity.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación de perplexity en wikitext-2 (test) comparando distintas cuantizaciones, con ventanas idénticas y bootstrapping:

| Build | Tamaño | Perplexity | ΔNLL/token vs bf16 [95% CI] | Ventanas peores |
|---|---:|---:|---|---:|
| bfloat16 (upstream) | 360.0 GB | 4.4708 | — | — |
| 8-bit | 192.2 GB | 4.4749 | +0.0009 [−0.0003, +0.0021] | 73/145 |
| 6-bit | 148.0 GB | 4.4767 | +0.0013 [−0.0003, +0.0029] | 81/145 |
| mixed-4_8bit | 106.2 GB | 4.5286 | +0.0128 [+0.0109, +0.0148] | 128/145 |
| 4-bit | 103.8 GB | 5.3914 | +0.1872 [+0.1778, +0.1968] | 145/145 |

El intervalo de confianza para 6-bit cruza el cero, lo que indica que es estadísticamente indistinguible de bfloat16 en este corpus. La generación greedy es coherente en todos los builds publicados.

## Requisitos de hardware

- VRAM estimada: 148 GB de memoria unificada (el modelo completo en 6-bit). No es una GPU con VRAM dedicada, sino memoria unificada de Apple Silicon.
- GPU recomendadas: Apple Silicon con al menos 192 GB de memoria unificada (por ejemplo, M2 Ultra o M3 Ultra). No cabe en GPUs de consumo como RTX 4090 (24 GB) ni en la mayoría de GPUs de datacenter sin cuantización adicional.
- Opciones de despliegue: mlx-lm con `trust_remote_code=True` (el runtime se incluye en el repositorio). También se puede usar el código fuente de GitHub para integraciones personalizadas.
- Latencia y throughput: no disponibles. Dependen de la memoria unificada y del ancho de banda de la Mac.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. El modelo original Qwen3.8-Flash-Next se posiciona como un MoE de 125B-A6B con contexto 262K, similar en filosofía a otros MoE como DeepSeek-V3 o Qwen3-235B-A22B, pero no hay métricas directas de comparación en las fuentes consultadas. La conversión MLX es específica para Apple Silicon, por lo que su comparativa natural sería con otras cuantizaciones del mismo modelo (4-bit, 8-bit, mixed) más que con modelos de otras familias.

## Limitaciones y advertencias

- El runtime MLX es solo texto; la torre de visión del modelo original no se utiliza en esta versión.
- La cuantización 6-bit introduce una pérdida de calidad mínima (perplejidad +0.0013 vs bfloat16), pero el intervalo de confianza sugiere que es indistinguible en wikitext-2. En otras tareas podría haber diferencias no evaluadas.
- El modelo es un preview experimental de la arquitectura Qwen4; puede contener comportamientos inesperados o falta de optimización.
- La licencia Qwen Community License 1.0 impone restricciones de uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- El runtime `qwen4_exp.py` se basa en un PR abierto y no fusionado en mlx-lm; requiere `trust_remote_code=True` y puede no ser estable en futuras versiones de mlx-lm.
- No se han publicado evaluaciones de sesgos, alucinación o seguridad para esta conversión específica.
- El tamaño de 148 GB limita su uso a equipos con memoria unificada muy alta, lo que excluye la mayoría de estaciones de trabajo convencionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del runtime y tooling: https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Documentación de SGLang sobre Qwen3.8-Flash-Next: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Guía de unsloth para ejecutar el modelo localmente: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Build 4-bit: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-4bit
- Build 8-bit: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-8bit
- Build mixed-4_8bit: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit
