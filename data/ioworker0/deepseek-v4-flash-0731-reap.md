# ioworker0/DeepSeek-V4-Flash-0731-REAP

## Resumen

DeepSeek-V4-Flash-0731-REAP es una variante podada del modelo MoE DeepSeek-V4-Flash-0731, publicada por el usuario ioworker0 en HuggingFace. El modelo base, desarrollado por DeepSeek, es un mixture-of-experts de 284 B de parámetros totales con 13 B activos, optimizado para codificación, chat y flujos agénticos, con una ventana de contexto de 262 144 tokens y módulo de decodificación especulativa. Sobre la versión GGUF cuantizada UD-IQ1_S de unsloth, el autor aplica una técnica de poda de expertos denominada REAP, que reduce el número de expertos retenidos en las capas de router aprendido.

El resultado son tres variantes (K224, K192 y K160) que conservan 224, 192 o 160 expertos por capa aprendida, respectivamente, manteniendo los 256 expertos en las capas de routing hash protegidas (capas 0-2). El repositorio incluye los tres candidatos en formato GGUF, con un tamaño de almacenamiento que oscila entre 56 y 74 GB por variante. Se trata de una publicación exploratoria solicitada antes de completar la evaluación formal preregistrada Pi/SWE-Lancer, por lo que no constituye un resultado de aceptación oficial ni una demostración de mejora de calidad o velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos por capa; routing hash en capas 0-2 y router aprendido en capas 3-42; poda REAP que retiene 224, 192 o 160 expertos por capa aprendida según la variante |
| Parametros totales | 187 682 070 871 (~187,7 B) |
| Parametros activos | 13 B (estimado, del modelo base DeepSeek-V4-Flash-0731; no confirmado para esta variante) |
| Longitud de contexto | 262 144 tokens (verificado en K192 y K224) |
| Tipos de cuantizacion | UD-IQ1_S (cuantización base); caché K/V en Q8_0 durante la verificación |
| Idiomas soportados | no disponible |
| Licencia | MIT (indicada en el repositorio de HuggingFace; no confirmada en la model card) |
| Formato de pesos | GGUF (llama.cpp), en 3 archivos por variante |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un MoE con 284 B de parámetros totales y 13 B activos, que incorpora un módulo de decodificación especulativa, según la documentación de Fireworks AI. La variante REAP aplica una poda de expertos sobre la versión GGUF cuantizada UD-IQ1_S: conserva la totalidad de los 256 expertos en las capas de routing hash (capas 0-2) y retiene un subconjunto fijo de expertos en las capas de router aprendido (capas 3-42), definido por un plan de poda REAP. Los tamaños de almacenamiento por variante son 73 741 680 224 bytes (K224), 64 944 122 464 bytes (K192) y 56 146 564 704 bytes (K160).

La implementación requiere un patch específico de llama.cpp (`llama-cpp-deepseek4-per-layer-experts.patch`) porque los GGUFs codifican `deepseek4.expert_count` como un array por capa, en lugar de un valor global. También se recomienda aplicar un fix para el tokenizador DeepSeek3 en ejecuciones largas. No se proporciona información sobre los datos de entrenamiento del modelo base, ni sobre procesos de alineación como RLHF o DPO; se trata de una poda, no de un reentrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base DeepSeek-V4-Flash-0731, que según NVIDIA NIM está optimizado para codificación, chat y flujos agénticos.
- Soporte de contexto largo de 262 144 tokens, verificado en las variantes K192 y K224 con caché K/V en Q8_0 y Flash Attention.
- Decodificación especulativa en el modelo base (según Fireworks AI); no confirmada en esta variante podada.
- Capacidades agénticas mejoradas en el modelo base (según DeepInfra); no evaluadas formalmente en la variante REAP.
- Soporte de tool calling y function calling: no confirmado para esta variante; el modelo base lo soporta según la documentación pública, pero no hay verificación en la publicación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de asistentes conversacionales con contexto largo en hardware de gama media: la reducción de parámetros de 284 B a ~187,7 B permite ejecutar el modelo con menos VRAM que el original, manteniendo la ventana de 262K tokens, lo que resulta útil para chatbots que necesitan recordar conversaciones extensas.
- Generación y autocompletado de código en entornos de desarrollo: el modelo base está optimizado para tareas de programación; la variante podada puede integrarse en editores o pipelines de CI/CD mediante llama.cpp, siempre que se acepte la posible degradación de calidad.
- Análisis y resumen de documentos extensos: la ventana de 262 144 tokens permite procesar contratos, informes o papers completos en una sola pasada, reduciendo la necesidad de estrategias de chunking.
- Experimentación académica sobre poda de modelos MoE: el repositorio incluye planes de poda, recibos de verificación y hashes públicos, lo que lo convierte en un caso de estudio útil para investigar la relación entre retención de expertos y rendimiento.
- Servicio de inferencia local con requisitos de privacidad: al ser GGUF y ejecutarse con llama.cpp, puede desplegarse en infraestructura propia sin conexión a servicios externos, útil para entornos con datos sensibles.
- Agentes autónomos multi-paso: el modelo base tiene capacidades agénticas mejoradas; la variante podría emplearse en prototipos de agentes, aunque la evaluación formal de estas capacidades está pendiente.
- Fine-tuning o adaptación posterior sobre dominios específicos: la arquitectura MoE podada permite experimentar con adaptación de bajo coste, aunque la poda puede limitar la plasticidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación formal preregistrada (Pi/SWE-Lancer) está pendiente, así como la validación en frío con GPU A100 y la comprobación de paridad de logits entre la versión compacta y la máscara de runtime. No se deben interpretar los tamaños reducidos de almacenamiento o VRAM como una mejora demostrada de calidad o velocidad.

## Requisitos de hardware

- K192: 70 672 MiB (~69 GB) de memoria de proceso observada, con contexto de 262 144 tokens, caché K/V Q8_0, Flash Attention y offload completo en una RTX PRO 6000 Blackwell de 96 GB.
- K224: 79 006 MiB (~77,2 GB) de memoria de proceso en las mismas condiciones; alcanzó `health: ok` tras la carga.
- K160: no verificado con carga real; tamaño de almacenamiento de ~56,1 GB, con memoria estimada inferior a K192.
- Se requiere una GPU con al menos 72-80 GB de VRAM para ejecutar K192 o K224 con contexto completo; una RTX 4090 (24 GB) no es suficiente sin reducir la ventana de contexto o usar offload parcial de capas a CPU.
- Despliegue exclusivo con llama.cpp (llama-server) aplicando el patch `llama-cpp-deepseek4-per-layer-experts.patch`; no se mencionan vLLM, Ollama ni TGI en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (original) | 284 B | 13 B | 262 144 | no disponible | safetensors / GGUF |
| DeepSeek-V4-Flash-0731-REAP (K192) | ~187,7 B | 13 B (estimado) | 262 144 | MIT (segun repo) | GGUF |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos disponibles en la información proporcionada. DeepSeek-V4-Flash-0731-REAP reduce el número de parámetros totales respecto al original, pero no se dispone de benchmarks que permitan comparar el rendimiento real entre ambas versiones. DeepSeek-V4-Pro (Preview) es mencionado en la documentación de DeepInfra como superado por DeepSeek-V4-Flash-0731 en benchmarks, pero no se aportan cifras concretas.

## Limitaciones y advertencias

- Publicación exploratoria: no es un resultado de `RTX_EXPERIMENT_PASSED` ni una aceptación formal de HuggingFace; la evaluación de calidad completa está pendiente.
- La poda puede degradar el rendimiento; no hay confirmación de paridad de logits entre la versión compacta y la máscara de runtime.
- Requiere un patch específico de llama.cpp; no funciona con builds estándar sin aplicar `llama-cpp-deepseek4-per-layer-experts.patch`.
- La variante K160 no ha recibido una prueba de carga real equivalente a K192 y K224.
- Riesgo de alucinación y sesgos no evaluados; no hay datos sobre comportamientos no deseados.
- Idiomas soportados no especificados; la cobertura multilingüe no está confirmada.
- El menor tamaño de almacenamiento o VRAM no debe interpretarse como una mejora de calidad o velocidad, según advierte el propio autor.
- La licencia MIT aparece en la interfaz del repositorio, pero la model card no la confirma; conviene verificar los términos antes de uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ioworker0/DeepSeek-V4-Flash-0731-REAP
- Árbol de archivos: https://huggingface.co/ioworker0/DeepSeek-V4-Flash-0731-REAP/tree/main
- NVIDIA NIM (modelo base): https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731
- Fireworks AI (modelo base): https://fireworks.ai/models/deepseek-ai/deepseek-v4-flash-0731
- DeepInfra API (modelo base): https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api
