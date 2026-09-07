# experimentalmachines/LFM2.5-2.6B-heretic

## Resumen

LFM2.5-2.6B-heretic es una versión abliterated (descensurada) del modelo LFM2.5-2.6B de Liquid AI, creada por experimentalmachines. Utiliza la herramienta heretic para aplicar una ablación direccional de la dirección de rechazo en el residual stream, con una búsqueda TPE sobre pesos de ablación por capa que minimiza tanto la tasa de rechazo como la divergencia KL respecto al modelo original. Los pesos resultantes se fusionan, por lo que carga como un `Lfm2ForCausalLM` estándar, manteniendo el chat template y los tokens de tool calling del modelo base.

El modelo base es un modelo agéntico on-device de 2.6B parámetros (2.697.198.592), capaz de planificar, llamar herramientas y ejecutar tareas multi-paso a 220 tok/s en menos de 2.5 GB, según Liquid AI. Esta versión conserva esas capacidades pero elimina deliberadamente el entrenamiento de seguridad del modelo base. La ficha incluye un archivo ExecuTorch para CPU con cuantización 8da4w y una ventana de contexto de 32.768 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM (Liquid AI LFM2.5) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 32.768 tokens (archivo ExecuTorch) |
| Tipos de cuantizacion | Safetensors (sin cuantizar) y 8da4w para ExecuTorch (8-bit activaciones dinámicas, 4-bit pesos agrupados, group size 32) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (Liquid AI License 1.0, categoría "other") |
| Formato de pesos | safetensors y ExecuTorch .pte |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un modelo de lenguaje de Liquid AI con arquitectura `Lfm2ForCausalLM`. La versión heretic se obtiene mediante la herramienta heretic, que identifica la dirección de rechazo en el residual stream y la elimina de forma direccional. La búsqueda de los pesos de ablación por capa se realiza con un optimizador TPE (Tree-structured Parzen Estimator) que minimiza simultáneamente la tasa de rechazo y la divergencia KL con el modelo original. El resultado es un modelo con los pesos fusionados, sin cambios en el chat template ni en los tokens de tool calling.

No se proporcionan detalles sobre los datos de entrenamiento del modelo base, ni sobre procesos de RLHF o DPO. La única innovación destacable es el proceso de abliteración mediante heretic, que elimina la capa de seguridad aprendida.

## Capacidades

- Generación de texto conversacional: pipeline text-generation, con soporte de chat template.
- Tool calling / function calling: la model card indica que los tokens de tool calling se mantienen sin cambios respecto al modelo base.
- Capacidades agénticas: el modelo base es un "on-device agentic model" que planifica, llama herramientas y ejecuta tareas multi-paso.
- Ejecución en CPU con ExecuTorch: gracias al archivo `.pte`, puede ejecutarse en CPUs Arm (Apple Silicon, Snapdragon, Dimensity, Tensor, Graviton) mediante KleidiAI, y en x86 con AVX.
- Contexto largo: 32.768 tokens en el archivo ExecuTorch, con prefill por chunks de 2048 tokens.
- Ausencia de rechazo: el modelo no tiene la dirección de rechazo del modelo base, por lo que no bloquea contenido que el modelo original bloquearía.

## Casos de uso

- Investigación en alineación y seguridad: comparar el comportamiento de este modelo con el modelo base para estudiar el impacto de la abliteración en la seguridad y la coherencia.
- Agentes on-device: integrar el modelo en aplicaciones móviles o edge que necesiten planificar y ejecutar tareas multi-paso, gracias a su tamaño y al soporte ExecuTorch para CPUs Arm.
- Automatización de flujos de trabajo: usar el tool calling para conectar el modelo con APIs y ejecutar secuencias de acciones, como consultar bases de datos, enviar correos o generar informes.
- Asistentes conversacionales personalizados: desplegar el modelo en aplicaciones de chat donde se requieran respuestas sin filtros de seguridad, como juegos de rol o ficción interactiva.
- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de código y, gracias a su soporte de tool calling, integrarse en pipelines de CI/CD para automatizar tareas de revisión o despliegue.
- Evaluación de robustez: utilizar el modelo como caso límite para probar sistemas de moderación o filtros de contenido, comprobando si detectan respuestas que el modelo base no generaría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de Liquid AI menciona que el modelo base alcanza 220 tok/s en menos de 2.5 GB, pero no se especifica el hardware ni se aportan datos comparativos.

## Requisitos de hardware

- Para el archivo ExecuTorch: se necesita una CPU Arm o x86 con soporte AVX. El archivo `.pte` pesa 1.81 GB y el KV cache en fp32 ocupa ~1.1 GB para la ventana completa de 32.768 tokens, por lo que la memoria RAM total necesaria ronda los 3 GB.
- No se dispone de estimaciones de VRAM para GPU, ya que el modelo está diseñado para CPU.
- Opciones de despliegue: ExecuTorch (llama_main o python runner) y HuggingFace transformers (carga como `Lfm2ForCausalLM`).
- Latencia: 220 tok/s según el blog de Liquid AI para el modelo base, sin especificar hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| experimentalmachines/LFM2.5-2.6B-heretic | 2.697.198.592 | 32.768 (ExecuTorch) | lfm1.0 | Abliterated, sin rechazo |
| LiquidAI/LFM2.5-2.6B | 2.697.198.592 | no disponible | lfm1.0 | Modelo base con seguridad |
| heretic-org/LFM-2.5-2.6B-heretic | no disponible | no disponible | no disponible | Otra versión abliterated |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo implica que el modelo puede generar contenido dañino, ilegal o no ético. El autor advierte: "Use responsibly".
- Los sesgos del modelo base pueden quedar sin mitigación, ya que la abliteración no los corrige.
- No se dispone de datos sobre tasas de alucinación ni sobre la calidad de las respuestas en dominios específicos.
- La ventana de contexto de 32.768 tokens es la del archivo ExecuTorch; el modelo base podría soportar más, pero no se especifica.
- Los idiomas soportados no están documentados.
- La licencia lfm1.0 es una licencia "other" que puede imponer restricciones para uso comercial; es necesario revisar el texto completo.
- Para producción, se recomienda una evaluación rigurosa de seguridad y legalidad antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-2.6B/blob/main/LICENSE
- Herramienta heretic: https://github.com/p-e-w/heretic
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-2-6b
- Blog explainx: https://explainx.ai/blog/liquid-ai-lfm2-5-2-6b-on-device-agents-august-2026
- Reddit: https://www.reddit.com/r/LocalLLaMA/comments/1vfh1sn/lfm2526b_is_out/
- Otra versión abliterated: https://huggingface.co/heretic-org/LFM-2.5-2.6B-heretic
