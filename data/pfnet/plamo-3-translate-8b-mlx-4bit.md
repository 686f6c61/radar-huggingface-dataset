# pfnet/plamo-3-translate-8b-MLX-4bit

## Resumen

PLaMo 3 Translate 8B MLX-4bit es la variante cuantizada a 4 bits para MLX del modelo de traducción PLaMo 3 Translate 8B, desarrollado por Preferred Networks (PFN). Se trata de un modelo de lenguaje especializado en traducción que cubre 53 idiomas y que se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japón. Sobre esa base, PFN continuó el entrenamiento con decenas de miles de millones de tokens de datos centrados en traducción.

La relevancia del modelo reside en su enfoque: no es un LLM generalista al que se le pide traducir, sino un modelo afinado específicamente para la tarea, con soporte para contexto circundante, glosarios y elección de estilo (llano o cortés) en las salidas en japonés. El límite de longitud durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada.

Esta variante concreta está pensada para ejecución en hardware Apple Silicon mediante la librería MLX y mlx-lm. Los pesos están cuantizados a 4 bits, lo que reduce el espacio en disco del repositorio a 6,1 GB. Cabe señalar una discrepancia relevante: el nombre comercial indica "8B", pero el recuento real de parámetros en los safetensors es de 2.076.717.056, es decir, aproximadamente 2B. El modelo se distribuye bajo la licencia PLaMo Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia PLaMo 3); detalles internos no disponibles |
| Parametros totales | 2.076.717.056 (recuento real en safetensors; el nombre comercial indica 8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada + salida combinadas durante el entrenamiento) |
| Tipos de cuantizacion | 4 bits para MLX; la familia completa ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas, entre ellos es, en, ja, de, fr, it, pt no listado, zh, ko, ar, hi, ru, vi, th, id, tr no listado |
| Licencia | PLaMo Community License (other) |
| Formato de pesos | safetensors con custom_code, librería mlx |

## Arquitectura y entrenamiento

La información disponible confirma que PLaMo 3 Translate se basa en un transformer de la familia PLaMo 3, concretamente en el modelo preentrenado PLaMo 3 NICT desarrollado conjuntamente por PFN y NICT. Sobre esa base, PFN aplicó un entrenamiento adicional con decenas de miles de millones de tokens de datos orientados a traducción. No se detalla en la información proporcionada la composición exacta del dataset, el número preciso de tokens, ni si se emplearon técnicas de RLHF o DPO.

La innovación principal del modelo no es arquitectónica sino de especialización: el entrenamiento está centrado en la tarea de traducción, con soporte explícito para incorporar contexto circundante y glosarios en la entrada, y con control de estilo (llano o cortés) para las salidas en japonés. El límite de 32.768 tokens combinados entre entrada y salida condiciona el diseño de los pipelines: los documentos más largos deben dividirse. Esta variante MLX-4bit aplica cuantización de pesos a 4 bits para su ejecución en Apple Silicon mediante MLX.

## Capacidades

- Traducción entre 53 idiomas, incluyendo pares como japonés-inglés, inglés-español, japonés-coreano, inglés-chino, entre muchos otros.
- Traducción con contexto circundante: el modelo puede tener en cuenta el texto previo o posterior para desambiguar.
- Traducción asistida por glosario: permite fijar terminología concreta en la salida.
- Control de estilo en japonés: elección entre registro llano y registro cortés.
- Traducción de pasajes largos en una sola pasada, hasta 32.768 tokens sumando entrada y salida.
- Capacidades multilingües amplias: la lista incluye lenguas europeas, asiáticas, de Oriente Medio, del sudeste asiático y de África subsahariana.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica: el modelo puede procesar secciones completas de manuales o referencias API dentro del límite de 32.768 tokens, manteniendo coherencia terminológica gracias al soporte de glosario.
- Localización de productos multilingües: con 53 idiomas cubiertos, un mismo pipeline puede generar versiones en español, alemán, francés, japonés, coreano o tailandés sin cambiar de modelo.
- Atención al cliente multilingüe: integrado en un sistema de tickets, traduce mensajes entrantes y salientes entre el idioma del cliente y el del agente, aprovechando el contexto de la conversación previa.
- Traducción de documentación legal o médica con glosario: la posibilidad de fijar terminología concreta reduce el riesgo de inconsistencias en dominios donde la precisión terminológica es crítica.
- Subtitulado y traducción de contenido audiovisual: la ventana de contexto permite procesar bloques de diálogo con coherencia entre intervenciones.
- Traducción literaria o editorial asistida: el control de estilo llano o cortés en japonés y el contexto amplio facilitan la adaptación de registro en obras narrativas.
- Procesamiento por lotes en local sobre Apple Silicon: al estar cuantizado a 4 bits para MLX, puede ejecutarse en un Mac con memoria unificada sin depender de GPUs dedicadas, útil para equipos que traducen grandes volúmenes de documentos de forma privada.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas de calidad de traducción frente a TranslateGemma y HY-MT2, con métricas COMET-22 (promedio de PFTB, SaaS y WMT24++) para japonés-inglés y chrF++ sobre FLORES+ para pares con 14 idiomas adicionales. Sin embargo, los valores numéricos concretos no están disponibles en el texto proporcionado; solo se indica que el modelo de 2B supera a los LLM especializados en traducción comparados en todas las métricas de la figura.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,1 GB en disco con pesos a 4 bits; la memoria necesaria en ejecución será algo superior por el estado de activaciones y caché KV.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max, Ultra) mediante MLX y mlx-lm. No está pensado para GPUs NVIDIA ni CUDA.
- Cabe en equipos de consumo: sí, en Mac con memoria unificada de 16 GB o superior; con 8 GB puede ser ajustado según la longitud de contexto utilizada.
- Opciones de despliegue: MLX y mlx-lm son las vías nativas para esta variante. Para otras plataformas existen variantes GGUF (llama.cpp, Ollama), FP8, W4A16, W4AFP8 y NVFP4 del mismo modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B MLX-4bit (este) | 2,08B reales (nombre comercial 8B) | 32.768 | 53 | PLaMo Community License | MLX-4bit |
| PLaMo 3 Translate 2B MLX-4bit | 2B (aproximado) | 32.768 | 53 | PLaMo Community License | MLX-4bit |
| PLaMo 3 Translate 31B | 31B (aproximado) | 32.768 | 53 | PLaMo Community License | BF16, FP8, GGUF, MLX-4bit, etc. |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card menciona TranslateGemma y HY-MT2 como modelos de comparación en las gráficas de calidad, pero no se proporcionan sus especificaciones técnicas en la información disponible.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre comercial indica 8B, pero el recuento real de parámetros es de aproximadamente 2,08B. Conviene verificar el tamaño efectivo antes de dimensionar infraestructura.
- Sesgos: no se documentan en la información disponible; al ser un modelo entrenado principalmente por un equipo japonés, es plausible un sesgo hacia el par japonés-inglés, aunque no se confirma.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir traducciones fluidas pero incorrectas, especialmente en idiomas de bajos recursos.
- Límite de contexto: 32.768 tokens combinados de entrada y salida; documentos más largos deben dividirse, lo que puede romper la coherencia entre fragmentos.
- Restricciones de licencia: la PLaMo Community License permite uso personal, educativo y no comercial sin registro previo; el uso comercial está sujeto a condiciones adicionales que deben consultarse en el enlace oficial de la licencia.
- Plataforma: esta variante MLX-4bit solo es ejecutable en Apple Silicon; para otros entornos hay que recurrir a las variantes GGUF, FP8, W4A16, W4AFP8 o NVFP4.
- Idiomas no cubiertos: la lista de 53 idiomas no incluye, por ejemplo, portugués ni turco según los tags proporcionados; conviene verificar la lista completa antes de asumir cobertura.
- Cuantización a 4 bits: puede introducir degradación de calidad respecto a BF16; la model card incluye tablas de diferencias de precisión por formato, pero los valores no están disponibles en la información proporcionada.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 2B: https://huggingface.co/pfnet/plamo-3-translate-2b
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- Variante GGUF 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-GGUF
- Variante FP8 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-FP8
- Variante W4A16 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-W4A16
- Variante W4AFP8 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-W4AFP8
- Variante NVFP4 8B: https://huggingface.co/pfnet/plamo-3-translate-8b-NVFP4
- Blog técnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Repositorio MLX: https://github.com/ml-explore/mlx
- README en japonés: https://huggingface.co/pfnet/plamo-3-translate-8b-MLX-4bit/blob/main/README_ja.md
