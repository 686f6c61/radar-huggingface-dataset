# scottlowry/Qwopus3.8-27B-Flash-V2-oQ5e-fp16-mtp

## Resumen

Qwopus3.8-27B-Flash-V2-oQ5e-fp16-mtp es una cuantización de precisión mixta del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario scottlowry en HuggingFace. El modelo cuenta con 27.781.427.952 parámetros (unos 27,78 mil millones) y se distribuye en formato MLX safetensors, pensado para ejecutarse sobre Apple Silicon mediante la librería MLX. La cuantización se ha generado con la herramienta oQ (oMLX v0.7.0) aplicando 5 bits con tamaño de grupo 64, y el repositorio ocupa 21,2 GB.

El modelo base, Qwopus3.8-27B-Flash-V2, procede de Jackrong y, según listados de terceros, está ajustado a partir de un modelo de la familia Qwen y orientado a cargas de trabajo de agentes, con optimizaciones de coste de razonamiento y velocidad de decodificación. El sufijo "mtp" del nombre hace referencia a la preservación del cabezal de predicción multi-token (multi-token prediction), empleado para decodificación especulativa, y "fp16" indica que ese componente se mantiene en media precisión mientras el resto del modelo va en 5 bits.

La relevancia de esta ficha es práctica: se trata de una variante de cuantización concreta para inferencia local en Mac, no de un modelo nuevo. No hay información publicada sobre licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks en los datos disponibles, por lo que cualquier evaluación de idoneidad para producción exige verificar primero el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, tipo de modelo declarado como qwen3_5 (no se especifica si es denso o MoE) |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (oQ5e, precisión mixta), group size 64; existe una variante hermana en 4 bits (oQ4e) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (repo de 21,2 GB); existe una conversión GGUF del modelo base publicada por terceros |
| Libreria de inferencia | mlx |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 |
| Herramienta de cuantizacion | oQ (oMLX v0.7.0) |
| Fecha de publicacion | 8 de octubre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card de esta variante no describe la arquitectura del modelo base: únicamente declara el tipo de modelo como qwen3_5, la cuantización aplicada (5 bits, group size 64, precisión mixta mediante oQ/oMLX v0.7.0) y el formato MLX safetensors. No se detalla número de capas, dimensión oculta, tipo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si hubo etapas de RLHF, DPO u optimización por preferencias.

El único elemento técnico diferencial identificable a partir del nombre y de las etiquetas es el sufijo "mtp" junto a "fp16": el modelo conserva el cabezal de predicción multi-token en media precisión, lo que permite usar decodificación especulativa con ese cabezal como borrador. Según el listado de Featherless sobre el modelo base de la familia (Qwopus3.8-27B-Flash), ese ajuste reporta un 12,8 % más de velocidad de decodificación y 14,6 puntos porcentuales más de aceptación del borrador MTP respecto a su modelo de partida; son datos de un tercero, no verificados en la información de esta variante.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwopus3.8-27B-Flash-V2 (capacidades concretas no documentadas en la model card de esta cuantización).
- Decodificación especulativa mediante el cabezal MTP preservado en fp16, lo que reduce la latencia de generación cuando el runtime lo soporta.
- Ejecución local en Apple Silicon a través de MLX, sin necesidad de GPU dedicada NVIDIA.
- Orientación a cargas de trabajo de agentes y tareas de razonamiento de ejecución prolongada, según la descripción del modelo base publicada por terceros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac para desarrollo y prototipado: con 21,2 GB de pesos en 5 bits, el modelo se puede cargar con mlx-lm en equipos Apple Silicon con 32 GB o más de memoria unificada, lo que permite trabajar sin conexión y sin coste por token.
- Agentes de ejecución prolongada en local: el modelo base está descrito por terceros como optimizado para reducir el coste de razonamiento y acelerar la decodificación, algo relevante en bucles de agente con muchas llamadas sucesivas al modelo.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad de 5 bits frente a la variante de 4 bits (oQ4e-fp16-mtp) y frente al modelo sin cuantizar, usando el mismo prompt set y el mismo runtime MLX.
- Generación asistida de código en escritorio: con un contexto que habrá que verificar en el modelo base, puede integrarse en editores o scripts locales que envíen fragmentos de código a un servidor MLX local.
- Procesado por lotes de documentos en un equipo de sobremesa: al no requerir GPU dedicada, encaja en flujos nocturnos de resumen, extracción o clasificación ejecutados sobre un Mac con memoria unificada amplia.
- Base para experimentos de decodificación especulativa: el cabezal MTP en fp16 permite medir tasas de aceptación del borrador y evaluar la ganancia real de latencia en mlx-lm.
- Despliegue de bajo coste en un único nodo: frente al modelo sin cuantizar, que según LLM Explorer requiere del orden de 55,6 GB de VRAM, esta variante reduce el requisito de memoria a aproximadamente un 40 % de esa cifra.
- No se recomienda para producción crítica sin antes resolver la licencia del modelo base y verificar contexto, idiomas y calidad frente a la versión sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco hay comparaciones numéricas con el modelo base en los datos proporcionados.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 21,2 GB de pesos en disco más overhead de runtime; en la práctica, se recomienda un equipo con 32 GB de memoria unificada o más para evitar swapping.
- GPU compatibles: MLX está diseñado para Apple Silicon (familias M1, M2, M3 y M4). En GPU NVIDIA no es un formato nativo; haría falta convertir a GGUF u otro formato.
- Equipos consumer donde cabe: Mac con chip Pro o Max de 32 GB en adelante; en configuraciones de 24 GB el margen es muy ajustado y puede provocar paginación a disco.
- Referencia de memoria del modelo base sin cuantizar: LLM Explorer indica unos 55,6 GB de VRAM para Qwopus3.8-27B-Flash, muy por encima de una GPU de consumo.
- Conversión GGUF del modelo base: el listado de local-ai-zone indica un archivo de 56,7 GB; ese tamaño no es viable en una GPU consumer de 24 GB sin cuantizaciones más agresivas.
- Opciones de despliegue: mlx-lm (nativo), LM Studio y otros frontends con soporte MLX; llama.cpp, Ollama, vLLM y TGI requieren convertir el modelo a GGUF o safetensors estándar y no cargan directamente este formato MLX.
- Latencia y throughput: no disponible. No se han publicado medidas de tokens por segundo para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Tamano del repo | Licencia |
|---|---|---|---|---|---|
| scottlowry/Qwopus3.8-27B-Flash-V2-oQ5e-fp16-mtp | 27,78 mil millones | 5 bits, group size 64, oQ mixta | MLX safetensors | 21,2 GB | no disponible |
| scottlowry/Qwopus3.8-27B-Flash-oQ4e-fp16-mtp | no disponible | 4 bits, oQ mixta | MLX safetensors | no disponible | no disponible |
| Jackrong/Qwopus3.8-27B-Flash-V2 (modelo base) | no disponible (la variante cuantizada reporta 27,78 mil millones) | sin cuantizar | safetensors | no disponible | no disponible |
| Qwopus3.8 27B Flash V2 GGUF (terceros, local-ai-zone) | 27 mil millones | GGUF | GGUF | 56,7 GB | no disponible |
| Jackrong/Qwopus3.8-27B-Flash | 27 mil millones | sin cuantizar | safetensors | no disponible (VRAM estimada 55,6 GB) | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, tamaño, formato y disponibilidad.

## Limitaciones y advertencias

- La licencia del modelo base y de esta cuantización no está declarada en la información disponible; no se puede asumir uso comercial permitido sin verificarlo en el repositorio de Jackrong/Qwopus3.8-27B-Flash-V2.
- No hay información sobre idiomas soportados ni sobre la longitud de contexto real; no se debe asumir un contexto largo sin comprobarlo en el modelo base.
- La cuantización a 5 bits con group size 64 introduce pérdida de precisión respecto al modelo sin cuantizar, especialmente en tareas de matemáticas, código y razonamiento de varios pasos. No hay métricas publicadas que cuantifiquen esa pérdida.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria de que el artefacto cargue o funcione correctamente.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de esta escala; no hay evaluación publicada para esta variante.
- El formato MLX ata el modelo al ecosistema Apple Silicon; desplegarlo en servidores NVIDIA o AMD exige conversión previa y puede alterar el comportamiento numérico.
- El sufijo "mtp" implica que parte del modelo se mantiene en fp16; conviene verificar en el runtime que la decodificación especulativa está realmente activada, ya que de lo contrario no se obtiene la ganancia de latencia esperada.
- Sesgos conocidos: no disponible. No hay evaluación de sesgos ni de seguridad en la información proporcionada.
- Fechas de publicación en el repositorio (octubre de 2026) que conviene contrastar con la fecha real del modelo base para juzgar su vigencia.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-V2-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Variante hermana en 4 bits: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-oQ4e-fp16-mtp
- Colección del autor: https://huggingface.co/collections/scottlowry/qwopus38-27b-flash-oqe-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Conversión GGUF del modelo base (terceros): https://local-ai-zone.github.io/models/qwopus3-8-27b-flash-v2.html
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/Jackrong%2FQwopus3.8-27B-Flash,5BfoG4VORSxYlz4p4r0D1c
- Listado del modelo base en Featherless: https://featherless.ai/models/Jackrong/Qwopus3.8-27B-Flash
