# PhaiModelLab/Phai-A1-35B-1M

## Resumen

Phai-A1-35B-1M es un modelo de lenguaje especializado en tareas de programación y flujos agénticos, desarrollado por PhaiModelLab mediante post-entrenamiento sobre el modelo base Qwen/Qwen3.6-35B-A3B. El modelo parte de una arquitectura Mixture-of-Experts (MoE) con 35.107.181.936 parámetros totales y ha sido ajustado mediante Supervised Fine-Tuning (SFT) seguido de Reinforcement Learning con GRPO sobre 4.000 entornos sandbox, lo que proporciona retroalimentación basada en ejecución real de código, tests unitarios e interacciones con herramientas.

La característica más destacable es su ventana de contexto nativa de hasta 1 millón de tokens, habilitada mediante YaRN con factor de escalado 4 configurado por defecto en el `config.json`. Los datos de entrenamiento abarcan longitudes de secuencia de 16K a 1M tokens, lo que permite comprensión de código a escala de repositorio completo y planificación de tareas agénticas de largo horizonte.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y un tamaño de repositorio de 70,2 GB. Todo el pipeline de post-entrenamiento, incluyendo SFT y RL, se ejecutó sobre NPUs Huawei Ascend, lo que lo convierte en un caso relevante de entrenamiento de modelos grandes fuera del ecosistema NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (YaRN factor=4 activado por defecto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume bfloat16 por el ejemplo de la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mixture-of-Experts del Qwen3.6-35B-A3B, un transformer con capas MoE y aproximadamente 35.100 millones de parámetros totales. El tag `qwen3_5_moe` en Hugging Face confirma la familia arquitectónica. No se detalla en la información disponible el número de parámetros activos por token, el número de expertos, la dimensión oculta ni el número de capas.

El post-entrenamiento se estructura en dos fases. La primera es un SFT sobre datos de instrucción de alta calidad orientados a programación y agentes, cubriendo conversaciones multi-turno, tool calling y cadenas de razonamiento largas. La segunda es una fase de RL basada principalmente en GRPO, ejecutada sobre 4.000 entornos sandbox que proporcionan retroalimentación verificable mediante ejecución de código, tests unitarios e interacción con herramientas. A lo largo de todo el post-entrenamiento se habilita YaRN con factor 4 para extender y estabilizar la ventana de contexto hasta 1M tokens, con secuencias de entrenamiento que van de 16K a 1M tokens. Todo el pipeline se ejecutó sobre NPUs Huawei Ascend.

## Capacidades

- Generación y comprensión de código a escala de repositorio, gracias a la ventana de 1M tokens.
- Depuración de código y razonamiento multi-paso sobre errores y trazas.
- Tool calling y function calling, entrenado explícitamente con datos de interacción con herramientas.
- Planificación de tareas agénticas de largo horizonte (long-horizon planning) y ejecución en flujos multi-paso.
- Razonamiento de cadenas largas (long-chain reasoning) reforzado mediante RL con feedback de ejecución.
- Comprensión de contexto ultra-largo para análisis de bases de código completas, documentación extensa o historiales de conversación prolongados.
- Capacidades multilingües: no disponible (no se especifican idiomas soportados).
- Modo thinking, visión o audio: no disponible (no se documentan).

## Casos de uso

- **Agentes de codificación autónomos**: el modelo puede planificar y ejecutar tareas de modificación de código en repositorios completos, aprovechando la ventana de 1M tokens para mantener en contexto múltiples ficheros y el historial de cambios. El entrenamiento con GRPO sobre sandboxes lo hace adecuado para bucles de "editar-ejecutar-testear".
- **Integración en pipelines de CI/CD**: con soporte de tool calling, puede invocarse desde orquestadores para revisar pull requests, sugerir parches o generar tests, usando el feedback de ejecución como señal de verificación.
- **Atención al cliente técnica o soporte de desarrollo**: gestión de conversaciones multi-turno con contexto muy largo, donde el historial completo de incidencias y documentación técnica cabe en la ventana de contexto sin truncamiento.
- **Análisis de bases de código legacy**: lectura y razonamiento sobre repositorios enteros para generar documentación, detectar dependencias o proponer refactorizaciones, gracias al contexto de 1M tokens entrenado explícitamente.
- **Automatización de tareas de debugging**: dado un stack trace y el código relevante, el modelo puede razonar sobre la causa raíz y proponer correcciones, apoyándose en el entrenamiento con feedback de tests unitarios.
- **Generación de tests unitarios**: el modelo ha sido entrenado con señales de ejecución de tests, lo que lo hace adecuado para generar suites de pruebas que se validan automáticamente en sandbox.
- **Asistentes de IDE con contexto de proyecto**: despliegue como backend de autocompletado o chat integrado en el editor, con capacidad de referenciar ficheros múltiples del workspace.

## Benchmarks y rendimiento

La model card menciona evaluación sobre SWE-Bench (Verified / Pro / Multilingual), TAU3-Bench, IFBench y AA-LCR, y afirma mejoras consistentes sobre el modelo base y rendimiento cercano o superior a modelos significativamente mayores en varios benchmarks. Sin embargo, los resultados numéricos se presentan únicamente en una imagen (`_benchmarks.png`) que no está disponible en la información proporcionada.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 35.100 millones de parámetros totales, en bfloat16 los pesos ocupan aproximadamente 70 GB, por lo que se requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o sharding multi-GPU. En cuantización de 8 bits se estiman ~35 GB, y en 4 bits ~18-20 GB, aunque no se publican cuantizaciones oficiales.
- **GPU recomendadas**: A100 80GB, H100 80GB, H200 para inferencia sin cuantizar; configuraciones multi-GPU para contexto largo.
- **Consumer GPU**: no cabe en bfloat16 en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB). En cuantización de 4 bits podría caber en 24 GB, pero requeriría conversión propia al no publicarse GGUF.
- **Opciones de despliegue**: la model card recomienda vLLM o SGLang para contexto largo, con prefix caching y chunked prefill. También es compatible con Transformers (`trust_remote_code=True`). No se menciona soporte de llama.cpp u Ollama.
- **Latencia y throughput**: no disponible. La ventana de 1M tokens impone una sobrecarga significativa de KV-cache, que la model card reconoce explícitamente.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Phai-A1-35B-1M | 35,1B (MoE) | 1M | Apache 2.0 | Coding & Agent |
| Qwen3.6-35B-A3B (base) | ~35B (MoE) | no disponible en esta ficha | no disponible | Generalista |
| Alternativas de coding/agent de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativos numéricos con modelos alternativos, ni de especificaciones de terceros verificables para construir una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **Especialización de dominio**: el modelo está optimizado para Coding & Agent; su rendimiento en tareas generalistas puede diferir del modelo base Qwen3.6-35B-A3B.
- **Fiabilidad de salida**: la model card advierte de posibles errores, imprecisiones o contenido inapropiado; recomienda evaluación exhaustiva y verificación humana antes de desplegar en producción.
- **Coste de contexto largo**: la ventana de 1M tokens implica una sobrecarga elevada de memoria y KV-cache; sin optimizaciones como prefix caching o chunked prefill el despliegue puede ser inviable.
- **Idiomas**: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad multilingüe más allá de lo heredado del modelo base.
- **Cuantizaciones**: no se publican versiones GGUF, AWQ ni GPTQ oficiales; el usuario debe generarlas por su cuenta.
- **Licencia**: Apache 2.0, pero sujeta a los términos del modelo base Qwen3.6-35B-A3B; el usuario es responsable de cumplir las condiciones de la licencia subyacente.
- **Sesgos**: no se documentan sesgos específicos en la información disponible.
- **Madurez del modelo**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- README en chino: disponible en el repositorio como `README_zh.md`
- Imagen de benchmarks: `_benchmarks.png` (referenciada en el repositorio, no accesible en la información proporcionada)
- Paper, blog o demo: no disponible
