# colinb83/Kimi-K3-Abliterated

## Resumen

Kimi K3 es un modelo de lenguaje multimodal de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T. La versión "Abliterated" publicada por el usuario colinb83 en Hugging Face es una adaptación no oficial que elimina ciertas restricciones de comportamiento del modelo original, aunque el propio autor advierte explícitamente que no ha sido probada y probablemente no funcione correctamente. El modelo base incorpora una arquitectura MoE híbrida con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con 2,8 billones de parámetros totales, 104 mil millones activos, y una ventana de contexto de 1 millón de tokens.

La relevancia de esta versión radica en que ofrece los pesos completos de un modelo de frontera con capacidades multimodales nativas (texto, imagen y vídeo) y un rendimiento orientado a tareas de codificación de largo alcance y trabajo de conocimiento agéntico. Sin embargo, al tratarse de un fork no verificado, su uso en producción es altamente desaconsejable. La licencia es la "Kimi K3 License", una licencia propietaria con restricciones específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) híbrida con Kimi Delta Attention (KDA) y Gated MLA |
| Parametros totales | 2.779.931.837.184 (2,78 T) |
| Parametros activos | 104 B (16 de 896 expertos activos) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos en safetensors; se menciona un tag "8-bit" sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (licencia propia de Moonshot AI, no OSI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE híbrida que combina 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention). El modelo tiene 93 capas en total, de las cuales una es densa. La dimensión de atención es 7168, con 96 cabezas de atención. El mecanismo Stable LatentMoE activa únicamente 16 de los 896 expertos, logrando una mejora de eficiencia de escalado de aproximadamente 2,5× respecto a Kimi K2. Cada experto tiene una dimensión oculta de 3072, y la dimensión latente del MoE es 3584. El modelo integra además Attention Residuals (AttnRes), que permite propagar información residual a través de las capas de atención.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación pública proporcionada. El modelo base de Moonshot AI fue entrenado con una combinación de datos multimodales, pero los detalles específicos no se han publicado en esta ficha.

## Capacidades

- Generación de texto y razonamiento avanzado, con soporte para tareas de codificación de largo alcance (compiladores, kernels GPU, desarrollo de juegos, diseño de chips).
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo.
- Ventana de contexto de 1 millón de tokens, adecuada para repositorios de código extensos y documentos largos.
- Soporte de tool calling y uso de herramientas de terminal, lo que permite la orquestación de agentes autónomos.
- Capacidades de razonamiento multi-paso y planificación, orientadas a trabajo de conocimiento agéntico (generación de informes, dashboards interactivos, edición de vídeo).
- En la versión "Abliterated", se han eliminado supuestamente las restricciones de seguridad y alineación del modelo original, lo que podría permitir respuestas sin censura (aunque no está verificado).

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede navegar repositorios con millones de líneas de código, refactorizar módulos y generar pruebas automáticas, gracias a su contexto de 1M tokens y su capacidad de tool calling.
- Agentes autónomos de investigación: puede producir informes de investigación profundos con visualizaciones interactivas, widgets y dashboards, integrando múltiples fuentes de datos.
- Asistencia en diseño de hardware: su capacidad de razonamiento multimodal y de código permite asistir en tareas de diseño de chips y verificación de circuitos.
- Automatización de operaciones de terminal: puede ejecutar comandos, gestionar procesos y depurar errores en entornos de línea de comandos, útil para pipelines de CI/CD.
- Análisis de documentos multimodales: procesa PDFs con figuras, vídeos y tablas, extrayendo información estructurada para tareas de gestión del conocimiento.
- Prototipado rápido de aplicaciones interactivas: genera código HTML/JavaScript para dashboards, juegos sencillos o visualizaciones de datos, combinando instrucciones en lenguaje natural con salidas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión "Abliterated" en la información disponible. El modelo base Kimi K3 de Moonshot AI no incluye una tabla de benchmarks en la documentación pública consultada. Por tanto, no es posible presentar datos numéricos verificados. Se recomienda consultar el informe técnico oficial de Kimi K3 para obtener métricas comparativas, aunque no se han incluido en esta ficha.

## Requisitos de hardware

- Dado que el modelo tiene 2,78 billones de parámetros, la inferencia en precisión FP16 requeriría aproximadamente 5,6 TB de VRAM, lo que exige un clúster multi-GPU de nivel centro de datos (por ejemplo, 8× H100 de 80 GB no serían suficientes; se necesitarían al menos 70 GPU H100 de 80 GB).
- Con cuantización de 8 bits, la memoria necesaria se reduciría a unos 2,8 TB, requiriendo aún un clúster de al menos 35 GPU H100. En 4 bits, bajaría a ~1,4 TB, necesitando ~18 GPU H100.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo convencionales.
- Opciones de despliegue: frameworks como vLLM, TGI o TensorRT-LLM podrían soportar el modelo, pero no hay documentación específica para esta versión abliterada. Dado el aviso del autor sobre que el modelo no está probado, es muy probable que falle en cualquier entorno.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. El único modelo comparable por tamaño es el Kimi K3 original de Moonshot AI, que comparte arquitectura y parámetros. Otras alternativas de gran escala como DeepSeek-V3 (671B totales, 37B activos) o Qwen3-Max (no abierto) tienen menos parámetros y no son directamente comparables. Se recomienda consultar el informe técnico de Kimi K3 para obtener comparativas con modelos de frontera.

## Limitaciones y advertencias

- El autor del repositorio advierte explícitamente: "DONT DOWNLOAD THIS, ITS UNTESTED AND PROBABLY WONT WORK!!!" Esto indica que el modelo no ha sido verificado y es muy probable que no funcione correctamente.
- Al ser una versión "Abliterated", se han eliminado las restricciones de seguridad del modelo original, lo que puede generar respuestas inapropiadas, sesgadas o peligrosas. No se recomienda su uso en entornos de producción.
- La licencia Kimi K3 es una licencia propietaria con términos específicos que pueden restringir el uso comercial o la redistribución. Es necesario revisar el texto completo de la licencia antes de cualquier uso.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo de 2,8T entrenado con datos web, es probable que herede sesgos comunes de género, raza y cultura.
- El riesgo de alucinación es alto, especialmente en tareas de razonamiento complejo o con contextos largos, aunque no hay datos cuantitativos.
- La ausencia de benchmarks y de documentación técnica para esta versión específica impide evaluar su rendimiento real.
- El tamaño del repositorio (1561 GB) y los requisitos de hardware hacen que su despliegue sea extremadamente costoso y poco práctico para la mayoría de organizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/colinb83/Kimi-K3-Abliterated
- Modelo original de Moonshot AI: https://huggingface.co/moonshotai/Kimi-K3
- Tech Blog de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Página de Kimi K3 en kimi.ai: https://www.kimi.ai/ai-models/kimi-k3
- Página en NVIDIA NIM: https://build.nvidia.com/moonshotai/kimi-k3
