# review-artifacts-27/Loopy-Ouro-2.6B-W4A4-G32

## Resumen

Loopy-Ouro-2.6B-W4A4-G32 es un checkpoint cuantizado del modelo recurrente ByteDance/Ouro-2.6B, publicado por el usuario review-artifacts-27 bajo licencia Apache-2.0. Se trata de un artefacto de investigación centrado en la cuantización de pesos a 4 bits (W4) y activaciones dinámicas por token a 4 bits (A4), con un tamaño de grupo de pesos de 32 (G32). El modelo base Ouro-2.6B es un modelo de lenguaje recurrente de 2.600 millones de parámetros desarrollado por ByteDance, y este checkpoint aplica una transformación Hadamard con semilla de rotación 1024 y potencia de escalado 0,8 sobre un pool de 400 candidatos, seleccionando el candidato `s1024_p08_b512`.

La relevancia de esta ficha es doble: por un lado, documenta una técnica concreta de cuantización extrema (W4A4) aplicada a un modelo recurrente, un caso menos frecuente que la cuantización de transformers estándar; por otro, expone las limitaciones prácticas de este tipo de artefactos, que requieren un cargador personalizado (custom loader) y no son compatibles con `from_pretrained()` de Transformers. El repositorio ocupa 3,3 GB e incluye código de evaluación, configuraciones de calibración y resultados de referencia.

El checkpoint está pensado para evaluación reproducible en tareas de lenguaje (LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU) y perplejidad (WikiText-2, LAMBADA), no como un modelo listo para producción sin adaptación. Su licencia Apache-2.0 se hereda del modelo base, aunque el código de investigación adjunto tiene avisos de terceros propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje recurrente (recurrent-language-model), profundidad recurrente T=4 |
| Parámetros totales | 2.600 millones (modelo base Ouro-2.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluación WT2 con ventana rodante a nivel de documento) |
| Tipos de cuantización | W4A4 (pesos 4 bits, activaciones dinámicas por token a 4 bits); códigos W4 almacenados en contenedores INT8; evaluación con cuantización falsa BF16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (pesos); código de investigación con avisos de terceros en `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dictionary de PyTorch, no safetensors ni GGUF); incluye escalas, zero points, input scaling y signos de Hadamard |

## Arquitectura y entrenamiento

El modelo base Ouro-2.6B es un modelo de lenguaje recurrente con profundidad recurrente T=4, según se indica en la model card. La arquitectura recurrente implica que el modelo reutiliza bloques o estados a lo largo de varios pasos de cómputo, lo que difiere del transformer estándar de capas apiladas. No se proporcionan detalles adicionales sobre el número de capas, dimensión oculta, mecanismo de atención o composición del dataset de entrenamiento original en la información disponible.

Este checkpoint concreto no ha sido reentrenado: es una derivada cuantizada del modelo upstream. El proceso de cuantización consistió en seleccionar un candidato entre 400 configuraciones posibles, con rotación Hadamard de semilla 1024, potencia de escalado 0,8 y tamaño de bloque Hadamard de 512. La cuantización de activaciones es dinámica por token a 4 bits. La evaluación se realiza con cuantización falsa en BF16, y el release no utiliza almacenamiento INT4 empaquetado ni un kernel de inferencia INT4. Los tensores no cuantizados conservan sus tipos de coma flotante originales. La calibración, búsqueda y evaluación de calidad usan grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revisión `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`).

## Capacidades

- Generación de texto y modelado de lenguaje en inglés, evaluado mediante perplejidad en WikiText-2 y LAMBADA.
- Razonamiento de sentido común y conocimiento general, medido en WinoGrande, ARC-C, HellaSwag y MMLU.
- Evaluación de precisión en tareas de opción múltiple y completado de texto.
- Soporte de contexto de hasta 4096 tokens para evaluación con ventana rodante a nivel de documento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language: en`.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible para estudiar el impacto de W4A4 con grupo 32 en modelos recurrentes, comparando las métricas guardadas en `reference_results/` con las de precisión completa.
- Evaluación de robustez de modelos recurrentes: permite medir cómo afecta la cuantización a tareas de sentido común (WinoGrande, HellaSwag) y conocimiento (MMLU) en una arquitectura recurrente con T=4.
- Reproducción de experimentos académicos: el repositorio incluye protocolo congelado (`code/docs/protocol.md`), ventanas fijas y registros completos de búsqueda por etapa, lo que facilita la verificación independiente de resultados.
- Estudio de técnicas de rotación Hadamard: la configuración con semilla 1024, potencia 0,8 y bloque 512 permite analizar el efecto de la rotación en la calidad tras cuantización.
- Benchmarking de cargadores personalizados: útil para desarrolladores que necesitan integrar checkpoints no estándar en pipelines de evaluación propios, ya que el modelo requiere un loader específico en lugar de `from_pretrained()`.
- Análisis de perplejidad a nivel de documento: la evaluación WT2 con contexto 4096 y ventana rodante es adecuada para estudiar degradación de perplejidad en textos largos bajo cuantización W4A4.

## Benchmarks y rendimiento

Resultados guardados del checkpoint seleccionado (`s1024_p08_b512`), según la model card:

| Métrica | Valor |
|---|---:|
| WT2 word PPL | 12,35 |
| LAMBADA PPL | 6,20 |
| LAMBADA acc. | 62,35 |
| WinoGrande | 65,59 |
| ARC-C | 55,38 |
| HellaSwag | 72,87 |
| MMLU | 65,64 |
| Media de precisión (5 tareas) | 64,37 |

Notas: WT2 usa perplejidad de palabra rodante a nivel de documento con contexto 4096. Las precisiones están en porcentaje; ARC-C y HellaSwag usan `acc_norm`, el resto usa `acc`. La media pondera igual las cinco tareas de precisión. No se proporcionan resultados de modelos comparables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3,3 GB, pero al no usar almacenamiento INT4 empaquetado ni kernel INT4, la inferencia requiere cargar el state dictionary y reconstruir los tensores, con un consumo superior al de un checkpoint INT4 empaquetado.
- GPU recomendadas: no disponible. La evaluación de referencia se ejecuta con `CUDA_VISIBLE_DEVICES=0`, lo que sugiere una única GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 2.600 millones de parámetros en BF16 requeriría aproximadamente 5,2 GB solo para pesos, más overhead de activaciones y estado recurrente, pero la información no confirma que quepa en GPU de consumo concreta.
- Opciones de despliegue: cargador personalizado incluido en `code/` (Loopy loader); no compatible con `from_pretrained()` de Transformers. No se documenta soporte de vLLL, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Ouro-2.6B-W4A4-G32 | 2,6 B | 4096 | W4A4, grupo 32 | Apache-2.0 | Hugging Face (repo de investigación) |
| ByteDance/Ouro-2.6B (base) | 2,6 B | no disponible | BF16 (original) | Apache-2.0 | Hugging Face |
| Alternativas de ~2-3 B cuantizadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Requiere un cargador personalizado (Loopy loader); un `from_pretrained()` genérico de Transformers fallará con este repositorio.
- No usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4, por lo que el beneficio de memoria de la cuantización W4 no se materializa directamente en inferencia sin trabajo adicional.
- La evaluación se realiza con cuantización falsa BF16, no con un kernel cuantizado real; los resultados pueden no reflejar el rendimiento de un despliegue INT4 real.
- Solo soporta inglés según el campo `language: en`.
- Contexto documentado de 4096 tokens; no se especifica si el modelo base soporta ventanas mayores.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, pero aplicables a cualquier modelo de lenguaje de 2,6 B.
- Licencia Apache-2.0 para los pesos, pero el código de investigación adjunto tiene avisos de terceros en `code/THIRD_PARTY_NOTICES.md` que deben revisarse antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de revisión, no un modelo ampliamente validado por la comunidad.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/review-artifacts-27/Loopy-Ouro-2.6B-W4A4-G32
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo de evaluación: `code/docs/protocol.md` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
- Manifiesto de ficheros: `manifest.json` (dentro del repositorio)
- Procedencia: `provenance.json` (dentro del repositorio)
