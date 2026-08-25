# nicolasembleton/Apodex-1.1-mini-MLX-6bit

## Resumen

El modelo `nicolasembleton/Apodex-1.1-mini-MLX-6bit` es una conversión al formato MLX (Apple Silicon) del modelo `apodex/Apodex-1.1-mini`, desarrollado por la organización Apodex. Se trata de una variante del sistema Apodex 1.1, un modelo de lenguaje multimodal (aunque en esta conversión se elimina el componente de visión) orientado a tareas de razonamiento complejo, agencia y resolución de problemas en entornos profesionales, financieros, científicos y de programación.

La arquitectura base es un transformer MoE (mixture of experts) derivado de la familia Qwen3.5, concretamente la variante `Qwen3.5-35B-A3B`, con 256 expertos de los que se activan 8 por token. La versión original declara 36 mil millones de parámetros totales y 3 mil millones activos, aunque el archivo `safetensors` de esta conversión MLX contiene 7.584.230.528 parámetros (≈7,6B), lo que sugiere una reducción en el número de pesos incluidos (posiblemente por la eliminación del vision tower y otros componentes no esenciales para texto). El modelo admite una longitud de contexto máxima de 262.144 tokens (256k) y está cuantizado a 6 bits con grupo de 64.

Esta versión MLX está publicada bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Es relevante porque ofrece una implementación localmente ejecutable de un modelo de razonamiento avanzado en hardware de Apple, con soporte para contextos muy largos y capacidad de agente integrada. La conversión fue realizada con `mlx-lm` versión 0.31.3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5-35B-A3B |
| Parámetros totales | 7.584.230.528 (según archivo safetensors); la model card del autor indica 36B totales / 3B activos para el modelo original |
| Parámetros activos | 3.000.000.000 (según la model card del autor) |
| Longitud de contexto | 262144 tokens (256k) |
| Tipos de cuantización | 6-bit affine (group size 64, bits per weight 6.502) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo original `Apodex-1.1-mini` es un transformer MoE con 40 capas que combinan atención lineal y atención completa (hybrid linear/full attention). Según la documentación, la arquitectura cuenta con 256 expertos en total, de los que se activan 8 por token, y está diseñada para un equilibrio entre eficiencia computacional y capacidad de razonamiento. La versión MLX elimina el componente de visión (vision tower) para centrarse exclusivamente en texto.

El entrenamiento se describe en el paper "Apodex 1.1: Scaling Agentic Intelligence for Complex Work" (arXiv:2608.23283). El modelo se entrena con un enfoque orientado a tareas agénticas, incluyendo razonamiento multi-paso, verificación de pasos y capacidades de agente asíncrono (Agent Team). No se especifican datos concretos sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la información disponible. La model card de la conversión MLX no aporta detalles adicionales sobre el proceso de entrenamiento.

La conversión a MLX se realizó con `mlx-lm` 0.31.3, aplicando cuantización de 6-bit con grupo de 64, lo que reduce el tamaño del modelo a 28.2 GB en disco.

## Capacidades

- Generación de texto y razonamiento avanzado: el modelo está optimizado para tareas de razonamiento complejo, matemáticas, codificación y búsqueda de información.
- Soporte de agentes: el paper describe una capacidad de "Agent Team" asíncrona entrenada dentro del modelo, que permite planificar y ejecutar múltiples pasos de razonamiento sin orquestación externa.
- Capacidad de verificación: el sistema separa el razonamiento de la verificación para ofrecer respuestas auditables.
- Contexto largo: con 262144 tokens de ventana, puede manejar documentos extensos y conversaciones de múltiples turnos.
- Multilingüismo: no se especifica en la documentación disponible; probablemente soporte inglés y otros idiomas, pero no está confirmado.
- Tool calling / function calling: no se menciona explícitamente, pero la orientación agéntica sugiere que puede integrarse con herramientas.
- Modo texto únicamente: la versión MLX elimina el vision tower, por lo que no procesa imágenes.

## Casos de uso

- Investigación científica y revisión de literatura: el modelo puede procesar papers extensos y resumir o extraer conclusiones gracias a su contexto de 256k tokens.
- Análisis financiero y de mercado: razonamiento complejo para interpretar datos, elaborar informes y evaluar escenarios.
- Desarrollo de código: generación y depuración de código en entornos de producción, especialmente en pipelines de CI/CD donde se requiera razonamiento multi-paso.
- Asistentes de investigación autónomos: puede descomponer tareas en subtareas y ejecutarlas de forma asíncrona mediante su capacidad de agentes.
- Atención al cliente avanzada: conversaciones largas y contextualizadas con historial extenso, manteniendo coherencia durante muchas interacciones.
- Educación y tutoría: explicación de conceptos matemáticos o científicos con razonamiento paso a paso.
- Análisis de datos y búsqueda de información: puede interpretar consultas complejas y extraer respuestas de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión MLX (`nicolasembleton/Apodex-1.1-mini-MLX-6bit`). El modelo base `Apodex-1.1-mini` cuenta con resultados en plataformas como [benchlm.ai](https://benchlm.ai/models/apodex-1-1-mini), donde se muestran dos filas de benchmarks, aunque no se detalla un puntaje global público. Según el paper, el modelo alcanza un "leading performance band" en tareas profesionales, finanzas, ciencia, matemáticas, código y búsqueda, a pesar de ser sustancialmente más pequeño que muchos sistemas frontera. Sin embargo, no se dispone de valores numéricos concretos en la información disponible.

## Requisitos de hardware

- **VRAM**: el tamaño del modelo es de 28.2 GB en formato 6-bit. Para inferencia en MLX se necesita al menos 28 GB de memoria unificada en un Mac. La model card advierte de OOM (out-of-memory) en prefill con contextos largos si se dispone de menos de 48 GB de memoria unificada.
- **GPU recomendadas**: Apple Silicon con 48 GB o más (por ejemplo, M1 Max, M2 Ultra, M3 Ultra) para aprovechar el contexto completo. Con 32 GB puede funcionar con contextos menores a 32k tokens.
- **Despliegue**: se puede usar con `mlx-lm` (Python) para generación y carga. También es posible convertirlo a GGUF para usar con `llama.cpp` o `Ollama`, aunque no se ha confirmado oficialmente.
- **Latencia**: no se dispone de datos concretos. La inferencia depende del hardware y del tamaño del contexto.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos equivalentes en el momento de redactar esta ficha. El modelo pertenece a la categoría de MoE de tamaño pequeño (7-8B parámetros en esta conversión) con contexto largo. Algunas alternativas potenciales son:

- **Qwen3-30B-A3B** (si existe): otro MoE con 3B activos, aunque con menos contexto (32k).
- **DeepSeek-V2-Lite**: MoE con 16B totales y 2.4B activos, contexto de 32k.
- **Phi-3.5-mini** (3.8B): no MoE, pero con buen razonamiento, contexto 128k.

Sin embargo, no hay datos de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- **Memoria**: en hardware con menos de 48 GB de memoria unificada, puede producirse OOM durante el prefill con contextos superiores a 32k tokens. Se recomienda limitar el contexto en esos equipos.
- **Solo texto**: la versión MLX elimina la visión, por lo que no puede procesar imágenes ni video.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones específicas de sesgos o tasas de alucinación para este modelo. Como todo modelo de lenguaje, existe riesgo de generar información incorrecta o no verificada.
- **Idiomas**: no se ha documentado la cobertura idiomática; probablemente funciona bien en inglés y otros idiomas comunes, pero no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe citar la atribución correspondiente.
- **Discrepancia de parámetros**: el archivo safetensors contiene ~7.6B parámetros, mientras que la model card del autor indica 36B totales para el modelo original. Esto puede deberse a la eliminación de componentes o a la cuantización, pero no está claramente explicado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nicolasembleton/Apodex-1.1-mini-MLX-6bit)
- [Modelo base `apodex/Apodex-1.1-mini`](https://huggingface.co/apodex/Apodex-1.1-mini)
- [Paper: Apodex 1.1: Scaling Agentic Intelligence for Complex Work (arXiv:2608.16883)](https://arxiv.org/abs/2608.16883)
- [Benchmarks de Apodex 1.1 Mini en benchlm.ai](https://benchlm.ai/models/apodex-1-1-mini)
- [Blog de Apodex 1.1 en explainx.ai](https://www.explainx.ai/blog/apodex-1-1-agent-team-frontieragent-august-2026)
- [Sitio web oficial de Apodex](https://www.apodex.com/)
