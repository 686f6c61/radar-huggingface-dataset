# pfnet/plamo-3-translate-0.8b-FP8

## Resumen

PLaMo 3 Translate 0.8B FP8 es la variante cuantizada a FP8 (pesos y activaciones) del modelo de traducción PLaMo 3 Translate 0.8B, desarrollado por Preferred Networks (PFN). Se trata de un LLM especializado exclusivamente en traducción, construido sobre el modelo preentrenado PLaMo 3 NICT, fruto de una investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Sobre esa base, PFN continuó el entrenamiento con decenas de miles de millones de tokens de datos orientados a traducción.

El modelo cubre 53 idiomas y está diseñado para aprovechar contexto circundante y glosarios, además de permitir elegir entre estilo llano y estilo cortés (keigo) en las salidas en japonés. La longitud máxima contemplada durante el entrenamiento es de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada. Esta versión FP8 mantiene el mismo comando de lanzamiento en vLLM que la variante BF16, lo que simplifica su despliegue en producción.

Su relevancia actual radica en dos factores: por un lado, la familia PLaMo 3 Translate se publica en cuatro tamaños (0.8B, 2B, 8B y 31B) con múltiples formatos de distribución (BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit), lo que facilita cubrir desde entornos con GPU de consumo hasta servidores de alta densidad; por otro, según la model card, incluso el modelo de 2B supera a los LLM especializados en traducción con los que se compara en todas las métricas reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 890.344.960 (aprox. 0,89B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens combinados de entrada y salida (maximo durante entrenamiento) |
| Tipos de cuantizacion | FP8 (pesos y activaciones); la familia ofrece ademas BF16, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit en repositorios separados |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso personal, educativo y no comercial gratuito sin registro previo; condiciones comerciales en el enlace de licencia) |
| Formato de pesos | safetensors (FP8), libreria transformers con custom_code; compatible con vLLM |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de la familia PLaMo 3 con pesos en safetensors y codigo personalizado (`custom_code`) en transformers. El modelo parte de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y fue sometido a un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traducción. La longitud máxima de secuencia durante el entrenamiento fue de 32.768 tokens contando entrada y salida de forma conjunta.

La especialización es exclusivamente en traducción: no se mencionan fases de RLHF o DPO, ni innovaciones como decodificación especulativa o atención lineal. La variante FP8 cuantiza pesos y activaciones a 8 bits, y la model card remite a una sección de comparación de precisión entre formatos (BF16 frente a cada formato de distribución) que no se incluye completa en la informacion proporcionada. El repositorio ocupa 1,2 GB.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares que no pasan por el inglés (por ejemplo, japonés-coreano o español-vietnamita).
- Traducción con contexto circundante: el modelo puede tener en cuenta el texto previo o posterior para desambiguar términos y mantener coherencia terminológica.
- Traducción asistida por glosario: admite glosarios para forzar terminología concreta, útil en dominios técnicos, jurídicos o de producto.
- Control de estilo en japonés: permite elegir entre estilo llano y estilo cortés (keigo) en la salida.
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens combinados de entrada y salida.
- Generación de texto orientada a traducción (pipeline `translation`); no se documentan capacidades de razonamiento general, código, matemáticas, visión, audio ni tool calling.
- No se documenta soporte de function calling ni de comportamiento agéntico multi-paso.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede procesar secciones completas de hasta decenas de miles de tokens en una sola llamada, manteniendo coherencia de terminología gracias al contexto largo y al soporte de glosarios.
- Localización de productos con terminología controlada: inyectando un glosario por producto o marca se garantiza que términos clave se traduzcan siempre igual en los 53 idiomas soportados, lo que reduce la revisión manual posterior.
- Traducción de atención al cliente multilingüe: al aceptar contexto circundante, puede traducir respuestas de soporte teniendo en cuenta los turnos previos de la conversación, lo que mejora la coherencia en hilos multi-turno.
- Adaptación de estilo para el mercado japonés: la posibilidad de elegir entre estilo llano y cortés permite generar contenido corporativo formal (keigo) o textos informales según el canal, sin cambiar de modelo.
- Traducción de contenido editorial y periodístico: la cobertura de 53 idiomas, incluidos pares menos frecuentes como cebuano, javanés, jemer o birmano, permite ampliar la distribución de contenido a mercados que otros modelos cubren con menor calidad.
- Procesamiento por lotes a bajo coste: con 0,89B de parámetros en FP8 y un repositorio de 1,2 GB, el modelo se puede desplegar en GPU modestas o incluso en CPU con los formatos GGUF alternativos, lo que abarata la traducción masiva de catálogos o bases de conocimiento.
- Traducción dentro de pipelines de datos: integrable en flujos de preprocesamiento para normalizar corpus multilingües antes de entrenar otros modelos, gracias a su naturaleza determinista y a la ausencia de comportamiento agéntico.

## Benchmarks y rendimiento

La model card presenta resultados en forma de figura, sin cifras numericas en el texto disponible. Las metricas reportadas son:

| Evaluacion | Metrica | Resultado numerico |
|---|---|---|
| Japones-ingles (media de PFTB, SaaS y WMT24++ ) | COMET-22 | no disponible (solo figura) |
| Japones frente a 14 idiomas (ambas direcciones) | FLORES+ chrF++ | no disponible (solo figura) |
| Ingles frente a 14 idiomas (ambas direcciones) | FLORES+ chrF++ | no disponible (solo figura) |

Los 15 idiomas seleccionados para FLORES+ son: japones, ingles, arabe, indonesio, italiano, neerlandes, coreano, espanol, tailandes, chino (simplificado y tradicional), aleman, frances, vietnamita y ruso. Segun la model card, incluso el modelo de 2B supera a los LLM especializados en traduccion comparados (TranslateGemma y HY-MT2) en todas las metricas de la figura. No se han publicado cifras numericas de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,89B en FP8, los pesos ocupan aproximadamente 0,9 GB; con overhead de activaciones y cache KV para contextos de hasta 32.768 tokens, se recomienda reservar entre 2 y 4 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte de FP8 (por ejemplo, H100, L40S, A100 con kernels compatibles) es la opcion natural para esta variante; tambien funciona en GPUs Ampere y posteriores con conversion interna.
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090 e incluso en GPUs con 8 GB o menos; para equipos sin GPU, los repositorios GGUF y MLX-4bit de la misma familia permiten ejecucion en CPU y Apple Silicon.
- Opciones de despliegue: vLLM (el comando de lanzamiento es identico al de la version BF16, segun la model card), transformers con `custom_code`; para otras variantes de la familia existen GGUF (compatible con llama.cpp y Ollama) y MLX-4bit.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PLaMo 3 Translate 0.8B FP8 | 0,89B | 32.768 tokens (entrada + salida) | PLaMo Community License | Hugging Face, vLLM, transformers |
| PLaMo 3 Translate 2B | no disponible | 32.768 tokens (entrada + salida) | PLaMo Community License | Hugging Face, multiples formatos |
| TranslateGemma | no disponible | no disponible | no disponible | Comparado en la model card, sin datos tecnicos en la informacion proporcionada |
| HY-MT2 | no disponible | no disponible | no disponible | Comparado en la model card, sin datos tecnicos en la informacion proporcionada |

La model card situa a PLaMo 3 Translate por encima de TranslateGemma y HY-MT2 en las metricas evaluadas, pero no se aportan parametros, contextos ni licencias de esos modelos en la informacion disponible. Dentro de la propia familia, el 0.8B es la opcion mas ligera; el 2B, 8B y 31B ofrecen mayor capacidad a costa de mas VRAM.

## Limitaciones y advertencias

- Modelo especializado: no esta pensado para generacion general, razonamiento, codigo ni matematicas; su uso fuera de traduccion no esta respaldado por la documentacion.
- Limite de longitud: la ventana de 32.768 tokens es la suma de entrada y salida; los documentos mas largos deben dividirse, lo que puede romper la coherencia entre fragmentos si no se solapan.
- Riesgo de alucinacion y omisiones: como todo modelo generativo aplicado a traduccion, puede omitir fragmentos, inventar contenido o alterar cifras y nombres propios, especialmente en idiomas de bajos recursos del conjunto de 53.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos de traduccion, puede heredar sesgos de los corpus y de las convenciones culturales de los textos de origen.
- Cobertura desigual por idioma: la evaluacion FLORES+ solo cubre 15 de los 53 idiomas; la calidad en el resto (cebuano, javanes, jemer, birmano, etc.) no esta cuantificada en la informacion disponible.
- Licencia: la PLaMo Community License permite uso personal, educativo y no comercial sin registro, pero el uso comercial esta sujeto a condiciones adicionales que deben revisarse en el enlace oficial antes de desplegar en produccion.
- Cuantizacion FP8: puede introducir degradaciones de precision frente a BF16; la model card remite a tablas comparativas de precision que no se incluyen completas en la informacion proporcionada.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse su uso en pipelines que requieran function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante W4A16: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4A16
- Variante W4AFP8: https://huggingface.co/pfnet/plamo-3-translate-0.8b-W4AFP8
- Variante NVFP4: https://huggingface.co/pfnet/plamo-3-translate-0.8b-NVFP4
- Variante GGUF: https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF
- Variante MLX-4bit: https://huggingface.co/pfnet/plamo-3-translate-0.8b-MLX-4bit
- Blog tecnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (ingles): https://plamo.preferredai.jp/info/plamo-community-license-en
- README en japones: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8/blob/main/README_ja.md
