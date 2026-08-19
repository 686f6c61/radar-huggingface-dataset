# aoiandroid/Hy-MT2-1.8B

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática multilingüe desarrollado por Tencent, perteneciente a la familia Hy-MT2 de modelos de traducción "de pensamiento rápido" (fast-thinking) diseñados para escenarios del mundo real. Este repositorio concreto (`aoiandroid/Hy-MT2-1.8B`) es una copia o mirror del modelo oficial `tencent/Hy-MT2-1.8B`, con la misma arquitectura y pesos. Soporta traducción entre 33 idiomas y es capaz de seguir instrucciones de traducción en múltiples lenguas, incluyendo gestión de terminología y formatos específicos.

El modelo tiene aproximadamente 1.800 millones de parámetros (2.038.515.712 en total), usa una arquitectura transformer densa (etiquetada como `hunyuan_v1_dense`) y se distribuye bajo licencia Apache 2.0. Según la model card, este modelo ligero supera en rendimiento general a APIs comerciales de Microsoft y Doubao en tareas de traducción, lo que lo hace relevante para despliegues en producción y entornos con recursos limitados. La familia Hy-MT2 incluye además versiones de 7B y 30B-A3B (MoE), así como cuantizaciones extremas (hasta 1.25 bits) para despliegue en dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense) |
| Parametros totales | 2.038.515.712 (aprox. 1.8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en BF16 (repositorio actual); existen versiones FP8 y GGUF (2bit, 1.25bit) en repositorios oficiales de Tencent |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer densa basada en el diseño de Hunyuan (etiqueta `hunyuan_v1_dense`). No se proporcionan detalles sobre el número de capas, dimensión oculta o mecanismos de atención específicos en la información disponible. La familia Hy-MT2 se describe como "fast-thinking", lo que sugiere un diseño optimizado para generar traducciones de alta calidad en pocos pasos de decodificación, aunque no se especifican detalles técnicos concretos como decodificación especulativa o atención lineal.

En cuanto al entrenamiento, la model card no detalla el volumen de tokens, la composición del dataset ni si se usaron técnicas de RLHF o DPO. Se menciona que los modelos de 7B y 30B-A3B superan a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, y que el 1.8B supera a APIs comerciales de Microsoft y Doubao, lo que sugiere un entrenamiento intensivo en datos de traducción de alta calidad. El informe técnico está disponible en arXiv (2605.22064), aunque no se ha podido acceder a su contenido para esta ficha.

## Capacidades

- Traducción automática entre 33 idiomas, incluyendo lenguas con pocos recursos como tibetano (bo), uigur (ug) y cingalés (si).
- Seguimiento de instrucciones de traducción en múltiples idiomas (prompts en chino, inglés, etc.).
- Soporte de traducción por defecto con salida limpia (solo el texto traducido, sin explicaciones).
- Gestión de terminología personalizada: el usuario puede proporcionar pares de términos de referencia que el modelo debe respetar en la traducción.
- Capacidad de traducir texto con contexto (por ejemplo, subtítulos de vídeo) según la colaboración con WMT26.
- No se especifican capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo especializado en traducción.

## Casos de uso

- **Traducción de documentación técnica**: el modelo puede traducir manuales, guías y especificaciones entre los 33 idiomas soportados, manteniendo consistencia terminológica si se le proporcionan glosarios.
- **Localización de software y aplicaciones**: integrable en pipelines de CI/CD para traducir cadenas de interfaz de usuario, con la ventaja de su licencia Apache 2.0 que permite uso comercial sin restricciones.
- **Atención al cliente multilingüe**: puede traducir consultas y respuestas en tiempo real en plataformas de soporte, manejando múltiples idiomas sin necesidad de modelos separados por lengua.
- **Traducción de subtítulos y vídeo**: dado su uso en la tarea de subtítulos de WMT26, es adecuado para traducir diálogos y subtítulos con contexto de escena.
- **Traducción de contenido web y redes sociales**: su tamaño compacto (1.8B) permite desplegarlo en servidores de baja capacidad o en edge computing para traducir contenido generado por usuarios.
- **Preprocesamiento de datos multilingües**: útil para normalizar y traducir datasets en proyectos de NLP, aprovechando su soporte de 33 idiomas y su capacidad de seguir instrucciones de formato.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo 1.8B supera globalmente a APIs comerciales de Microsoft y Doubao, y que los modelos 7B y 30B-A3B superan a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, pero no se proporcionan métricas concretas (BLEU, COMET, etc.). Se remite al informe técnico en arXiv (2605.22064) para más detalles, pero no se ha podido acceder a su contenido.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en BF16 (4.1 GB en disco), se necesitan aproximadamente 4-5 GB de VRAM para cargar el modelo en memoria. Con cuantización FP8 (disponible en repositorio oficial) se reduce a unos 2-3 GB; con GGUF 2-bit o 1.25-bit (también oficiales) puede caber en menos de 1 GB.
- **GPU recomendadas**: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores pueden ejecutar el modelo sin problemas. Para despliegues en servidor, cualquier GPU con al menos 6 GB de VRAM es suficiente.
- **Cabe en GPU consumer**: sí, incluso en GPUs de 4 GB si se usa cuantización GGUF de baja precisión. La versión 1.25-bit (AngelSlim) reduce el almacenamiento a 440 MB y mejora la velocidad de inferencia 1.5x.
- **Opciones de despliegue**: compatible con transformers y endpoints compatibles (según tags). Existen versiones GGUF oficiales para llama.cpp y Ollama. También se puede servir con vLLM o TGI si se convierte a los formatos adecuados.
- **Latencia y throughput**: no se proporcionan datos numéricos. Dado su tamaño, se espera una latencia baja en GPU moderna (decenas de milisegundos por token), pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (este) | 1.8B | 33 | no disponible | Apache 2.0 | Especializado en traducción, con cuantización extrema disponible |
| NLLB-200-1.3B (Meta) | 1.3B | 200 | 512 tokens | CC-BY-NC 4.0 (no comercial) | Traducción multilingüe amplia, pero sin seguimiento de instrucciones |
| M2M100-1.2B (Meta) | 1.2B | 100 | 1024 tokens | MIT | Traducción directa entre muchos idiomas, sin instrucciones |
| SeamlessM4T-v2 (Meta) | 2.3B | 100+ | no disponible | CC-BY-NC 4.0 | Traducción multimodal (texto y audio), pero licencia no comercial |

Hy-MT2-1.8B destaca por su licencia Apache 2.0 (permite uso comercial sin restricciones), su capacidad de seguir instrucciones de traducción (terminología, formatos) y su soporte de cuantización extrema para despliegue en dispositivos. A diferencia de NLLB y M2M100, está diseñado específicamente para escenarios de producción con control de calidad.

## Limitaciones y advertencias

- **Es un mirror no oficial**: este repositorio (`aoiandroid/Hy-MT2-1.8B`) no pertenece a Tencent; aunque los pesos parecen idénticos, no hay garantía de integridad. Se recomienda usar los repositorios oficiales de Tencent (`tencent/Hy-MT2-1.8B`) para producción.
- **Sin datos de contexto**: no se especifica la longitud máxima de contexto, lo que puede limitar su uso en traducciones de documentos largos. Se recomienda probar con textos de tamaño variable.
- **Especialización**: es un modelo de traducción, no un LLM generalista. No debe usarse para tareas de razonamiento, generación creativa o código.
- **Riesgo de alucinación en terminología**: aunque soporta glosarios, puede inventar traducciones si el término no está en su vocabulario o si el contexto es ambiguo.
- **Idiomas de baja representación**: lenguas como tibetano, uigur o cingalés pueden tener calidad inferior comparada con idiomas mayoritarios como inglés o chino.
- **Sin evaluación independiente**: los benchmarks mencionados provienen del propio autor (Tencent) y no han sido verificados por terceros en la información disponible.

## Enlaces

- Repositorio HuggingFace (este mirror): https://huggingface.co/aoiandroid/Hy-MT2-1.8B
- Repositorio oficial de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B
- Colección oficial Hy-MT2 en HuggingFace: https://huggingface.co/collections/tencent/hy-mt2
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT2
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT2
- AngelSlim (cuantización extrema): https://github.com/Tencent/AngelSlim/tree/main
- Informe técnico (arXiv): https://arxiv.org/pdf/2605.22064
- Sitio web oficial: https://aistudio.tencent.com/llm/en?tabIndex=0
