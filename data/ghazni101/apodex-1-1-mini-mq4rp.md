# ghazni101/Apodex-1.1-mini-MQ4RP

## Resumen

Apodex-1.1-mini-MQ4RP es una cuantización de 4 bits del modelo Apodex-1.1-mini, desarrollado por Apodex como parte de su línea de solvers de razonamiento intensivo para tareas de investigación complejas. Esta variante concreta, publicada por ghazni101, está preparada específicamente para el motor de inferencia hipfire, un motor en Rust nativo para GPUs AMD RDNA (gfx1100/1151/1201). El modelo base, Apodex-1.1-mini, es un MoE de 256 expertos con arquitectura híbrida Qwen3.5-MoE (atención completa + atención lineal DeltaNet) y una ventana de contexto de 262 144 tokens, diseñado para razonamiento de largo alcance, uso de herramientas y trabajo con archivos y datos. Esta cuantización elimina el tower de visión y el head MTP del modelo original para reducir el tamaño a ~18,7 GB, manteniendo las capacidades de texto y razonamiento.

La relevancia de esta ficha radica en que ofrece una versión local y eficiente de un modelo de 35B parámetros (según el paper) en un formato propietario pero optimizado para hardware AMD de consumo, con un rendimiento de hasta 226 tok/s en una RX 7900 XTX. Está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento pesado en local, con soporte de herramientas y agentes, sin depender de la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE hybrid-attention (10 capas full-attention + 30 capas DeltaNet linear-attention) |
| Parametros totales | 35B (según paper del modelo base) |
| Parametros activos | No disponible (MoE con 256 expertos, top-8, pero sin dato de activos) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | MQ4 (4,25 bits por peso) en dos recetas: MQ4R (uniforme) y MQ4RP (con tier fijo protegido en Q8F16) |
| Idiomas soportados | No disponible (el modelo base no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mq4r` (contenedor de hipfire) |

## Arquitectura y entrenamiento

El modelo base Apodex-1.1-mini usa una arquitectura híbrida de atención: 40 capas en total, de las cuales 10 son de atención completa (full-attention) y 30 emplean atención lineal DeltaNet. Es un MoE con 256 expertos y top-8 activos, con hidden size 2048 y head dim 256. El vocabulario es de 248 320 tokens. La cuantización MQ4 aplica una transformación FWHT (rotación de incoherencia) y una cuantización escalar uniforme de 4,25 bits por peso con grupo de 256. La receta MQ4RP protege ciertos tensores críticos (router, shared expert, conv1d y embed_tokens) manteniéndolos en Q8F16, para preservar la precisión del gating. No se dispone de información detallada sobre el entrenamiento del modelo base (datos, tokens, técnicas de alineación) más allá de que se describe como un "self-evolving solver" con razonamiento verificado y estructura de Agent Team. El modelo base fue entrenado por Apodex y se publicó bajo licencia Apache-2.0.

## Capacidades

- Generación de texto y razonamiento de largo plazo, diseñado para tareas de investigación complejas.
- Razonamiento estructurado y verificado: el modelo base separa el razonamiento del verificador para dar resultados auditables.
- Soporte de tool calling y function calling, según la documentación del modelo base.
- Capacidades de agente: puede trabajar con archivos, datos, código y herramientas, y usar un harness de "Agent Team" para tareas de larga duración.
- Soporte de razonamiento multi-step (thinking mode) con trazas de razonamiento, aunque con la limitación de que el presupuesto de tokens debe cerrar los spans de pensamiento.
- Capacidades multilingües no documentadas explícitamente.
- Esta cuantización no incluye el tower de visión del modelo base, por lo que solo procesa texto.

## Casos de uso

- **Investigación automatizada de documentos**: el modelo puede leer y razonar sobre corpus largos (hasta 262k tokens) para extraer conclusiones, comparar fuentes y generar informes de síntesis. Su contexto largo permite procesar libros técnicos o expedientes completos.
- **Agentes de desarrollo de software**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar código, revisar pull requests, ejecutar pruebas y corregir errores de forma autónoma.
- **Análisis financiero**: procesar estados financieros, informes anuales y datos de mercado, razonando sobre múltiples documentos para detectar tendencias o riesgos.
- **Asistente de investigación científica**: ayuda a revisar artículos, formular hipótesis, diseñar experimentos y resumir literatura, manteniendo el contexto de todo el paper.
- **Soporte técnico especializado**: gestionar conversaciones multi-turno con contexto de producto largo, resolviendo incidencias complejas con acceso a documentación interna.
- **Generación de código en producción**: al ser un modelo de razonamiento pesado, puede usarse para generar soluciones complejas en entornos de desarrollo, con la ventaja de ejecutarse localmente en hardware AMD de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. El paper del modelo base (arXiv:2608.23283) indica que Apodex 1.1 alcanza la banda de rendimiento líder en tareas profesionales, finanzas, investigación científica, matemáticas, codificación y búsqueda, pero no se proporcionan cifras concretas en la información disponible. En la model card de la cuantización se reporta un throughput de **226 tok/s** (MQ4R) en una RX 7900 XTX con hipfire build 3307ccf6, y en las builds de referencia Ornith se midieron ~235 tok/s (MQ4R) y ~212 tok/s (MQ4RP) bajo un protocolo de 24 peticiones. No se dispone de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- **VRAM**: el archivo pesa ~18,7 GB, por lo que se recomienda una GPU con al menos 24 GB VRAM para el contexto completo con KV en q8 (la model card indica que con q8 KV el contexto completo cabe en 24 GB).
- **GPUs**: requiere GPUs AMD RDNA3 o superiores (gfx1100, gfx1151, gfx1201), como RX 7900 XTX, RX 7900 XT, o Radeon PRO W7900. No se menciona soporte para otras arquitecturas.
- **Despliegue**: se sirve con el motor hipfire (`hipfire serve`), que es Rust-native y no requiere Python en el hot path. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: en la validación se midió 226 tok/s para MQ4R en generación de 400 tokens en RX 7900 XTX. La variante MQ4RP tiene una penalización de decode de ~10% en comparación con MQ4R.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. El modelo base Apodex-1.1-mini (35B MoE) se puede comparar conceptualmente con otros MoE de tamaño similar como Qwen3-30B-A3B o Llama-4-Maverick, pero no hay datos de benchmarks comparativos. La cuantización MQ4RP es específica para AMD RDNA y no es directamente comparable con formatos GGUF o safetensors. No disponible.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero al ser un modelo de razonamiento generativo, existe el riesgo de alucinación en tareas de hecho, especialmente en contextos largos.
- **Limitación de razonamiento**: cuando se activa el modo de razonamiento, si el token budget termina dentro de un span de pensamiento abierto, el servidor falla con un error `open think span at end of generation`. Se recomienda desactivar el razonamiento para throughput o dar margen suficiente.
- **Solo texto**: la cuantización elimina el tower de visión, por lo que no puede procesar imágenes.
- **Hardware específico**: requiere GPUs AMD RDNA3 o superior con ROCm; no funciona en NVIDIA o hardware no compatible.
- **Licencia**: Apache-2.0 permite uso comercial, pero la redistribución de la cuantización debe cumplir los términos del modelo base.
- **Pérdida por cuantización**: la cuantización MQ4 introduce pérdida de precisión, especialmente en expertos enrutados, lo que puede degradar la calidad de razonamiento en tareas críticas. La receta MQ4RP mitiga parcialmente este problema protegiendo el router y los expertos compartidos.

## Enlaces

- Repo de Hugging Face: https://huggingface.co/ghazni101/Apodex-1.1-mini-MQ4RP
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Paper del modelo base: https://arxiv.org/abs/2608.23283
- Sitio web de Apodex: https://www.apodex.ai/
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
- GGUF del modelo base (otra cuantización): https://huggingface.co/abenzerps/Apodex-1.1-mini-GGUF
