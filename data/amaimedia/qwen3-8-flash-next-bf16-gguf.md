# AMAImedia/Qwen3.8-Flash-Next-BF16-GGUF

## Resumen

AMAImedia/Qwen3.8-Flash-Next-BF16-GGUF es un repositorio de pesos publicado por AMAImedia (fundada por Ilia Bolotnikov, en el marco de la plataforma NOESIS de doblaje multilingüe) que distribuye una versión cuantizada del modelo Qwen3.8-Flash-Next. Según los safetensors del repositorio, el modelo tiene 179.999.981.459 parámetros (unos 180.000 millones) y su pipeline declarado es image-text-to-text, es decir, acepta entradas de imagen y texto. El repositorio pesa 471,3 GB e incluye pesos en BF16 y en formato GGUF, con licencia apache-2.0.

La model card describe Qwen3.8-Flash-Next como el primer lanzamiento de pesos abiertos de la arquitectura experimental que servirá de base a Qwen4, con tres innovaciones principales: atención híbrida basada en Gated DeltaNet más Qwen Sparse Attention (QSA) a nivel de microbloque, Gated Residual para modular el flujo de información en las conexiones residuales y N-gram Embedding como eje adicional de escalado de parámetros. El objetivo declarado es reducir la latencia en contextos largos, pensando en cargas de trabajo agénticas.

Existe una discrepancia relevante que conviene verificar antes de usar el modelo: los metadatos del repositorio declaran como modelos base tencent/Hy4-preview y AngelSlim/Hy4-preview-GGUF, mientras que el contenido de la model card corresponde a Qwen3.8-Flash-Next. El repositorio acumula 3.236 descargas y 0 "likes", y no incluye resultados de evaluación publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con atención híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) a nivel de microbloque, Gated Residual y N-gram Embedding (descripción de la model card) |
| Parametros totales | 179.999.981.459 (~180.000 millones), según safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la variante Qwen3.8-Flash servida en Qwen Cloud anuncia 1M de contexto por defecto, dato no aplicable automáticamente a este repositorio) |
| Tipos de cuantizacion | BF16 y GGUF (etiqueta imatrix); niveles concretos de cuantización no disponibles |
| Idiomas soportados | 112 códigos de idioma declarados, entre ellos es, en, zh, ru, de, fr, pt, it, ja, ko, ar, hi, vi, tr, pl, nl, sv, th, he, uk, fa, ur, sw, ta, te, bn |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Pipeline | image-text-to-text |
| Autor | AMAImedia |
| Modelos base declarados | tencent/Hy4-preview; AngelSlim/Hy4-preview-GGUF |
| Tamano del repositorio | 471,3 GB |
| Descargas / likes | 3.236 / 0 |
| Fechas declaradas | creación 2026-08-27, actualización 2026-09-20 |
| Compatibilidad declarada | Hugging Face Transformers, vLLM, SGLang, TokenSpeed |

## Arquitectura y entrenamiento

La model card describe una revisión profunda de los componentes que interactúan a gran escala en un transformer causal. La atención combina Gated DeltaNet con Qwen Sparse Attention: en lugar de seleccionar tokens individuales, QSA opera a nivel de microbloque, lo que según el autor reduce de forma significativa la latencia en contextos largos. Se añade Gated Residual, que modula la información que circula por las conexiones residuales ampliadas mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama, con el objetivo de ganar expresividad entre capas sin comprometer la estabilidad del entrenamiento ni encarecer demasiado la inferencia. Por último, el N-gram Embedding indexa con n-gramas cortos y se presenta como un eje de escalado de parámetros más eficiente en cómputo y más apto para descarga a memoria que una arquitectura MoE, útil en aceleradores con memoria limitada.

En cuanto al entrenamiento, la model card menciona una receta que aplica los optimizadores Muon y AdamW a categorías de pesos específicas, guiada por leyes de escalado reajustadas, y que elimina el calentamiento tradicional del tamaño de lote arrancando directamente con el tamaño objetivo, lo que reduce el número total de pasos del optimizador y permite tasas de aprendizaje mayores. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el encoder de visión pese a que el pipeline declarado es image-text-to-text.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" está presente en los metadatos del repositorio y el modelo se declara como causal language model.
- Entrada multimodal de imagen y texto: el pipeline image-text-to-text implica comprensión conjunta de imágenes y lenguaje, aunque no se documentan tareas concretas ni resolución de imagen admitida.
- Cobertura multilingüe amplia: 112 códigos de idioma declarados, incluyendo castellano, inglés, chino, ruso, alemán, francés, portugués, árabe, hindi, japonés, coreano, vietnamita y varias decenas de lenguas de bajos recursos.
- Procesamiento de contexto largo: la arquitectura QSA está diseñada explícitamente para reducir la latencia en contextos largos, orientada a cargas agénticas, si bien la longitud máxima soportada por este repositorio no se especifica.
- Soporte de tool calling / function calling: no disponible para este repositorio. La model card menciona que la variante Qwen3.8-Flash servida en la nube incluye herramientas integradas, pero no confirma esta capacidad en los pesos aquí distribuidos.
- Soporte de agentes y razonamiento multi-paso: la motivación arquitectónica apunta a cargas agénticas, pero no hay documentación específica de esta capacidad en la información disponible.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Doblaje y localización automática multilingüe: el repositorio se publica como parte de la plataforma NOESIS de doblaje multilingüe, de modo que su uso natural es la traducción y adaptación de guiones entre los 112 idiomas declarados, con apoyo de entrada de imagen para material gráfico o subtítulos incrustados en vídeo.
- Atención al cliente multilingüe: un modelo de 180.000 millones de parámetros con cobertura de más de cien idiomas permite atender conversaciones multi-turno en un mismo sistema sin desplegar un modelo distinto por mercado, siempre que se valide la calidad por idioma.
- Comprensión de documentos escaneados o capturas: al aceptar entrada de imagen y texto, puede extraer y resumir información de facturas, formularios, informes o capturas de pantalla dentro de un flujo documental, combinando la lectura visual con la generación de texto estructurado.
- Agentes de larga duración sobre repositorios o bases de conocimiento: la atención QSA a nivel de microbloque está pensada para reducir latencia cuando el contexto crece, lo que encaja en pipelines donde el modelo mantiene estado durante muchas iteraciones.
- Moderación de contenido multimodal: clasificación y revisión de publicaciones con imagen y texto en plataformas multilingües, aprovechando la cobertura de idiomas para no depender de clasificadores separados por región.
- Investigación en arquitecturas híbridas: al ser un preview experimental de la arquitectura que sustentará Qwen4, resulta útil para reproducir experimentos sobre QSA, Gated Residual y N-gram Embedding, comparar la variante cuantizada con los pesos originales y medir el impacto de la cuantización en tareas concretas.
- Despliegue on-premise con soberanía de datos: la licencia apache-2.0 y la disponibilidad en GGUF permiten ejecutar el modelo en infraestructura propia en sectores con requisitos de residencia de datos, aceptando el coste de hardware que implica su tamaño.
- Generación de subtítulos y descripciones accesibles: producción de pistas de subtitulado y audiodescripción a partir de material audiovisual, apoyándose en la entrada visual y en la generación multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de evaluación (MMLU, HumanEval, GSM8K u otras), no hay métricas de latencia o throughput declaradas y la búsqueda web asociada no devolvió resultados técnicos relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 180.000 millones de parámetros, no dato publicado): en BF16 en torno a 360 GB solo para pesos, más caché KV y activaciones; en cuantización de 8 bits unos 180 GB; en 4 bits unos 90-100 GB. A contextos largos, la caché KV puede dominar el consumo.
- GPU recomendadas: para BF16, configuraciones multi-GPU tipo 8x H100 80 GB o 8x H200; para 4 bits, 2x A100 80 GB o una H200 de 141 GB pueden ser suficientes para los pesos, con margen limitado según contexto y lote.
- Tarjetas consumer: no cabe en una RTX 4090 (24 GB) ni en GPU de gama media. Solo es viable mediante descarga parcial a memoria del sistema y CPU con llama.cpp, con latencias muy superiores. El propio autor indica que su equipo local (RTX 3060 Laptop de 6 GB, 64 GB DDR5, i7-12700H) sirve para trabajos de 0,6-35B en RAM y que los modelos de 9B en adelante requieren alquilar H200 o Blackwell.
- Almacenamiento: el repositorio ocupa 471,3 GB, por lo que hay que prever ese espacio en disco además de la memoria de inferencia.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed según la model card; el formato GGUF abre la puerta a llama.cpp y Ollama, aunque el soporte real de arquitecturas híbridas con atención dispersa en esos motores debe verificarse versión a versión.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AMAImedia/Qwen3.8-Flash-Next-BF16-GGUF (este repositorio) | ~180.000 millones | no disponible | apache-2.0 | Pesos BF16 y GGUF en Hugging Face | Cuantización de terceros; metadatos de modelo base ambiguos; sin benchmarks publicados |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | Pesos originales en Hugging Face | Origen declarado del contenido de la model card; referencia para comparar el efecto de la cuantización |
| Qwen3.8-Flash (Qwen Cloud) | no disponible | 1M declarado por defecto | no disponible (servicio gestionado) | API gestionada | Variante con herramientas integradas y más funciones de producción; útil como techo de referencia |
| tencent/Hy4-preview | no disponible | no disponible | no disponible | Pesos en Hugging Face | Declarado como modelo base en los metadatos del repositorio; procedencia a verificar |

No se dispone de datos de rendimiento comparado entre estas alternativas, por lo que la comparativa se limita a disponibilidad, licencia y contexto declarado.

## Limitaciones y advertencias

- Ambigüedad de procedencia: el contenido de la model card corresponde a Qwen3.8-Flash-Next, pero los metadatos declaran como modelos base tencent/Hy4-preview y AngelSlim/Hy4-preview-GGUF. Conviene verificar qué pesos contiene realmente el repositorio antes de integrarlo en producción.
- Ausencia total de evaluación: no hay benchmarks, ni métricas de calidad por idioma, ni análisis del impacto de la cuantización sobre las capacidades del modelo.
- Validación comunitaria mínima: 0 "likes" y 3.236 descargas en el momento de redactar esta ficha, sin discusiones ni reportes de terceros que confirmen el comportamiento.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado en este caso; no hay datos de tasas de error en tareas factuales.
- Idiomas: se declaran 112 códigos, pero la calidad real es presumiblemente desigual; las lenguas de bajos recursos (kam, luo, umb, nso, ny, entre otras) suelen tener cobertura mucho menor aunque figuren en la lista.
- Contexto: la longitud máxima soportada por estos pesos no está documentada. El dato de 1M de contexto corresponde a la variante de nube Qwen3.8-Flash y no debe asumirse aquí.
- Tool calling y uso agéntico: no confirmados para este repositorio; si el flujo depende de function calling, hay que validarlo empíricamente antes de diseñar sobre esa capacidad.
- Licencia: los pesos se distribuyen bajo apache-2.0, lo que en principio permite uso comercial, pero al tratarse de una cuantización de un modelo de terceros conviene revisar también las condiciones del repositorio original y de la variante que finalmente se despliegue.
- Coste de infraestructura: 180.000 millones de parámetros y 471,3 GB de repositorio implican requisitos de GPU y almacenamiento muy por encima del rango de consumo; no es viable en hardware de escritorio sin descarga a CPU y penalización fuerte de latencia.
- Sesgos: no se publica ninguna información sobre sesgos demográficos, políticos o culturales, ni sobre mitigaciones aplicadas.
- Fechas declaradas: el repositorio figura creado el 2026-08-27 y actualizado el 2026-09-20; si se usa como referencia temporal, conviene comprobar que siguen vigentes y que el contenido no ha cambiado.
- Entorno de despliegue: el soporte de arquitecturas con atención dispersa e híbrida en motores de inferencia evoluciona rápido; verificar la versión de vLLM, SGLang o llama.cpp antes de dar por hecho el rendimiento esperado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AMAImedia/Qwen3.8-Flash-Next-BF16-GGUF
- Modelo original declarado en el contenido de la model card: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Modelo base declarado en los metadatos: https://huggingface.co/tencent/Hy4-preview
- Modelo base cuantizado declarado en los metadatos: https://huggingface.co/AngelSlim/Hy4-preview-GGUF
- Blog técnico de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Servicio gestionado Qwen3.8-Flash: https://www.qwencloud.com/models/Qwen3.8-Flash
- Organización AMAImedia: https://AMAImedia.com
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo: los enlaces recuperados correspondían a generadores de códigos QR y no guardan relación con la ficha.
