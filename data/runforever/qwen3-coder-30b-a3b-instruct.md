# Runforever/Qwen3-Coder-30B-A3B-Instruct

## Resumen

Qwen3-Coder-30B-A3B-Instruct es un modelo de lenguaje causal especializado en generación de código y uso de agentes, desarrollado por el equipo Qwen (Alibaba). Se trata de la variante "streamlined" de la familia Qwen3-Coder, publicada bajo licencia Apache 2.0 y distribuida en Hugging Face a través del repositorio del usuario Runforever, que replica los pesos oficiales de Qwen. El modelo emplea una arquitectura de mezcla de expertos (MoE) con 30.500 millones de parámetros totales y 3.300 millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional.

La propuesta principal del modelo es el "agentic coding": soporte nativo de function calling con un formato de llamada a herramientas diseñado específicamente, integración con plataformas como Qwen Code y CLINE, y una ventana de contexto nativa de 262.144 tokens (256K), extensible hasta 1M mediante YaRN. Esto lo orienta a tareas de comprensión de repositorios completos, refactorización multiarchivo y flujos de agente con múltiples pasos.

Es relevante ahora porque cubre el hueco de modelos MoE de ~30B con contexto largo y licencia permisiva, pensados para despliegue en entornos de desarrollo reales. A diferencia de la variante "thinking" de Qwen3, este modelo opera únicamente en modo no-thinking y no emite bloques `<think></think>`, lo que simplifica su integración en pipelines de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE), tipo `qwen3_moe` |
| Parámetros totales | 30.532.122.624 (30,5B) |
| Parámetros activos | 3,3B |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1M con YaRN |
| Tipos de cuantización | no disponible (la model card no especifica cuantizaciones oficiales; el ecosistema soporta GGUF vía llama.cpp/Ollama y MLX-LM según la card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con atención de grupos de consulta (GQA: 32 cabezas para Q y 4 para KV) y 48 capas. La capa MoE contiene 128 expertos con 8 expertos activados por token, lo que da lugar a los 3,3B parámetros activos sobre un total de 30,5B. Esta configuración reduce el coste de inferencia por token en comparación con un modelo denso del mismo tamaño, manteniendo la capacidad representacional de un modelo grande.

El entrenamiento consta de dos fases: preentrenamiento y post-entrenamiento (pretraining & post-training), según la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. La innovación técnica destacable es el soporte nativo de contexto largo (256K) con extensión YaRN a 1M, junto con un formato de function calling específicamente diseñado para agentes de código, y la ausencia de modo thinking, que elimina la sobrecarga de tokens de razonamiento explícito en producción.

## Capacidades

- Generación de texto y código en tareas fundamentales de programación.
- Agentic coding: soporte de function calling con formato dedicado, integrable en plataformas como Qwen Code y CLINE.
- Agentic browser-use: uso de herramientas de navegador dentro de flujos de agente.
- Razonamiento multi-paso y ejecución de tareas de agente con múltiples llamadas a herramientas.
- Comprensión de repositorios a escala gracias a la ventana de 256K tokens (hasta 1M con YaRN).
- Modo no-thinking: no genera bloques `<think></think>` y no requiere `enable_thinking=False`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente de código en IDE: integrado mediante CLINE o extensiones similares, el modelo puede leer archivos del repositorio, proponer parches y ejecutar llamadas a herramientas de edición gracias a su function calling nativo y a la ventana de 256K tokens para contexto de proyecto.
- Refactorización multiarchivo: con contexto de repositorio completo, permite analizar dependencias entre módulos y generar cambios coherentes en varios ficheros en una sola sesión.
- Agente de navegador automatizado: el soporte de agentic browser-use permite construir flujos que consulten documentación, issues o APIs web y actúen sobre los resultados dentro de un pipeline de desarrollo.
- Generación de tests y cobertura: el modelo puede analizar el código fuente y producir suites de pruebas unitarias, integrándose en pipelines de CI/CD mediante su API compatible con OpenAI.
- Automatización de revisión de código: desplegado con vLLM o TGI, puede procesar pull requests largos y señalar problemas de estilo, seguridad o lógica usando el contexto extendido.
- Migración de código legacy: la ventana de 256K permite cargar fragmentos amplios de bases de código antiguas y generar traducciones a lenguajes o frameworks modernos con coherencia entre ficheros.
- Documentación técnica automatizada: generar docstrings y documentación de API a partir del código fuente y de los ficheros de configuración del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al blog y a la documentación oficial de Qwen para consultar la evaluación de benchmarks, pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 61 GB solo para pesos, más memoria para KV cache; requiere GPUs de 80 GB (A100/H100) o múltiples GPUs.
- Cuantización a 8 bits: en torno a 30-32 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits (GGUF/AWQ/GPTQ): en torno a 16-18 GB de pesos, cabe en una RTX 4090 de 24 GB, aunque el contexto largo (256K) incrementa notablemente el KV cache y puede requerir reducir la ventana a 32K como recomienda la propia model card ante problemas de OOM.
- GPU recomendadas: A100 80 GB o H100 para contexto completo en BF16; RTX 4090, RTX 6000 Ada o L40S para cuantizaciones de 4-8 bits y contextos moderados.
- Opciones de despliegue: transformers (>= 4.51.0 para evitar el error `KeyError: 'qwen3_moe'`), vLLM y TGI para servido compatible con OpenAI; llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers para uso local según la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct | 30,5B | 3,3B | 256K (1M con YaRN) | Apache 2.0 | Hugging Face (repo Runforever) |
| Qwen3-Coder (otras variantes de la familia) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas MoE de ~30B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de otros fabricantes para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El modelo opera únicamente en modo no-thinking; no genera razonamiento explícito y no debe esperarse ese comportamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde puede inventar APIs o firmas de funciones inexistentes.
- El contexto largo (256K) dispara el consumo de KV cache; la model card advierte de posibles OOM y recomienda reducir a 32.768 tokens si aparecen.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe fuera del inglés no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el enlace de licencia oficial de Qwen incluido en la model card.
- El repositorio consultado (Runforever) es una réplica de los pesos oficiales de Qwen; para producción conviene verificar la integridad y procedencia frente al repositorio oficial `Qwen/Qwen3-Coder-30B-A3B-Instruct`.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con `KeyError: 'qwen3_moe'`.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Runforever/Qwen3-Coder-30B-A3B-Instruct
- Repositorio oficial de Qwen: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Blog de Qwen3-Coder: https://qwenlm.github.io/blog/qwen3-coder/
- GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Qwen Chat: https://chat.qwen.ai/
- Paper (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
