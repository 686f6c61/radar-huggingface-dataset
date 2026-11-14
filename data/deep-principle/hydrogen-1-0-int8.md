# deep-principle/Hydrogen-1.0-INT8

## Resumen

Hydrogen-1.0-INT8 es la versión cuantizada a 8 bits del modelo Hydrogen-1.0, desarrollado por Deep Principle como asistente para resolución de problemas científicos e investigación. Se construye sobre GLM-5.3 (zai-org) y está especializado en interacción textual para preguntas científicas, explicación de derivaciones y organización de respuestas a problemas de investigación abiertos. La cuantización INT8 reduce el peso del checkpoint de aproximadamente 1,5 TB (BF16) a unos 793 GB, manteniendo las activaciones en BF16.

El modelo emplea una arquitectura `glm_moe_dsa` (Mixture of Experts con atención dispersa, según el identificador de arquitectura del repositorio) con 753.329.940.480 parámetros totales declarados en los safetensors. Soporta una longitud de contexto declarada de 1M de tokens y una salida máxima de 128K tokens, aunque el despliegue de referencia limita el contexto a 262.144 tokens. La cuantización se realizó con llm-compressor mediante el esquema W8A16 y el formato `pack-quantized` de compressed-tensors, sin datos de calibración.

Su relevancia actual reside en que permite desplegar un modelo científico de gran escala en hardware de 8 GPU Blackwell (B300) con SGLang, reduciendo a la mitad los requisitos de memoria frente a BF16 y manteniendo una licencia MIT permisiva para uso comercial. No obstante, el propio autor advierte que la cuantización no está pensada para acelerar la inferencia, sino para reducir huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm_moe_dsa (MoE con atención dispersa, según identificador de arquitectura) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (declarada); 262.144 tokens en el despliegue de referencia |
| Salida máxima | 128.000 tokens |
| Tipos de cuantizacion | INT8 weight-only (W8A16), grupo de 128 pesos, simétrico; también existen versiones BF16, NVFP4 y MXFP4 del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |
| Modelo base | deep-principle/Hydrogen-1.0 (a su vez basado en GLM-5.3) |
| Tamaño del repositorio | 792,6 GB |
| Herramienta de cuantización | llm-compressor (`model_free_ptq`, esquema W8A16) |

## Arquitectura y entrenamiento

Hydrogen-1.0 se construye sobre GLM-5.3 y utiliza una arquitectura de tipo Mixture of Experts con atención dispersa (identificador `glm_moe_dsa`). Los pesos cuantizados afectan a los expertos enrutados de las capas 3 a 77 y a los MLP densos de las capas 0 a 2; los expertos compartidos, la atención, el router, los embeddings, el `lm_head` y la capa MTP permanecen en BF16. La cuantización se aplicó directamente desde los pesos BF16 sin datos de calibración, con cuantización solo de pesos (las activaciones y el cómputo se ejecutan en BF16).

Los detalles completos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se publican con los pesos; el autor remite al blog técnico. El modelo está orientado a tareas científicas y se documenta su uso combinado con herramientas externas y entornos de investigación específicos (cómputo científico, exploración de redes de reacción, análisis estructural por RMN y planificación experimental).

## Capacidades

- Generación de texto y conversación multi-turno orientada a dominios científicos.
- Asistencia en investigación: explicación de derivaciones, organización de respuestas a problemas abiertos y planificación de enfoques.
- Razonamiento científico y de cómputo científico (según ejemplos del blog técnico).
- Soporte de tool calling / function calling (el despliegue de referencia usa `--tool-call-parser glm47`).
- Soporte de razonamiento con parser dedicado (`--reasoning-parser glm45`).
- Contexto largo: hasta 1M de tokens declarados (262.144 en el despliegue de referencia), útil para documentación científica extensa.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia a investigadores en revisión de literatura científica: con un contexto desplegado de 262.144 tokens puede procesar varios artículos y generar síntesis comparativas, manteniendo coherencia entre secciones.
- Explicación de derivaciones matemáticas y físicas: el modelo está entrenado para desglosar pasos intermedios y justificar supuestos, adecuado para material docente o documentación técnica.
- Planificación experimental: puede proponer diseños de experimentos, controles y criterios de éxito a partir de una descripción del objetivo, integrable con herramientas externas mediante function calling.
- Análisis de datos espectroscópicos (p. ej., RMN): el blog técnico documenta flujos de análisis estructural combinando el modelo con herramientas específicas del entorno de investigación.
- Exploración de redes de reacción en química computacional: el modelo puede organizar hipótesis y rutas de reacción, apoyándose en tool calling para invocar simuladores.
- Generación de borradores de secciones metodológicas y discusión en artículos: útil por su contexto largo para mantener consistencia terminológica a lo largo de documentos extensos.
- Integración en pipelines de investigación internos vía API compatible con OpenAI (endpoint `/v1`), sirviendo como componente de razonamiento en sistemas multi-agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint INT8 ocupa unos 793 GB (739 GiB); se requiere memoria agregada suficiente para pesos más caché KV y buffers de activación en BF16.
- GPU recomendadas: el equipo probó con 8x NVIDIA B300 usando SGLang 0.5.20; otras configuraciones no han sido validadas por el autor.
- Consumer GPU: no cabe en GPU de consumo (RTX 4090, etc.) por el tamaño del modelo.
- Opciones de despliegue: SGLang (probado); se requiere un runtime con soporte de la ruta MoE de pesos enteros de compressed-tensors en formato `pack-quantized`. El autor no reporta pruebas con vLLM, llama.cpp, Ollama ni TGI para esta versión.
- Flags obligatorios en SGLang: `--disable-shared-experts-fusion` (los expertos compartidos en BF16 no pueden fusionarse con los enrutados en INT8), `--trust-remote-code`, `--tp 8`, `--reasoning-parser glm45`, `--tool-call-parser glm47`, `--context-length 262144`, `--mem-fraction-static 0.85`, `--chunked-prefill-size 16384`.
- Latencia y throughput: no disponibles; el autor indica que la cuantización reduce memoria pero no se espera que sea más rápida que BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Hydrogen-1.0-INT8 | 753.329.940.480 | 1M declarado (262.144 en despliegue de referencia) | MIT | safetensors INT8, SGLang |
| Hydrogen-1.0 (BF16) | no disponible en la información | 1M declarado | MIT | safetensors BF16, runtime compatible |
| Hydrogen-1.0-NVFP4 | no disponible en la información | 1M declarado | MIT | NVFP4, NVIDIA Blackwell (probado en 8x B300) |
| Hydrogen-1.0-MXFP4 | no disponible en la información | 1M declarado | MIT | MXFP4, AMD Instinct (probado en MI350X con ATOM) |

Los modelos comparables de otros fabricantes no se detallan en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que las salidas deben evaluarse frente a los supuestos, restricciones y evidencias de cada tarea; no sustituyen la revisión científica.
- Riesgo de alucinación en derivaciones, referencias y resultados numéricos; requiere verificación humana en contextos de investigación.
- La cuantización INT8 no aporta mejoras de velocidad y puede degradar ligeramente la calidad frente a BF16; el autor no publica evaluaciones comparativas de precisión.
- El contexto efectivo en el despliegue de referencia es de 262.144 tokens, no 1M; ampliarlo exige soporte de runtime y memoria suficientes.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado.
- Requiere un runtime con soporte específico de compressed-tensors `pack-quantized` para MoE; no hay validación fuera de SGLang 0.5.20 en 8x B300.
- Es imprescindible conservar juntos el tokenizer, chat template, `generation_config.json`, configuraciones de modelo y cuantización, y el índice de pesos, para respetar los ajustes de fin de turno y parada.
- Licencia MIT permite uso comercial, pero el modelo base (GLM-5.3) y sus condiciones deben verificarse por separado antes de producción.
- Datasets y recetas de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoría de sesgos.

## Enlaces

- Repositorio Hugging Face (INT8): https://huggingface.co/deep-principle/Hydrogen-1.0-INT8
- Modelo base BF16: https://huggingface.co/deep-principle/Hydrogen-1.0
- Versión NVFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-NVFP4
- Versión MXFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-MXFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog técnico: https://blog.deepprinciple.com/introducing-hydrogen-1.0/
- Documentación de uso: docs/USAGE.md (en el repositorio)
- README en chino: README.zh-CN.md (en el repositorio)
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Contacto: info@deepprinciple.com
