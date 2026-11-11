# InterpreticAI/Qwen4-27B-Uncensored-v3-NVFP4

## Resumen

InterpreticAI/Qwen4-27B-Uncensored-v3-NVFP4 es un repositorio anunciado por InterpreticAI para una futura version "uncensored" del modelo Qwen4-27B, presumiblemente derivado del modelo Qwen de Alibaba. En el momento de redactar esta ficha, el repositorio no contiene pesos publicados: la model card indica explicitamente "Coming soon" y condiciona la publicacion a que Qwen publique primero los pesos originales de Qwen4-27B.

El proposito declarado del autor es eliminar la censura politica presente en el modelo base, en linea con su publicacion anterior Qwen3.8-27B-Uncensored-v3, para la que reportan una reduccion de respuestas censuradas del 83,5 % al 2,6 % en preguntas politicas chinas segun la metodologia de Pan & Xu (2026). El repositorio se distribuye bajo licencia Apache 2.0 y contempla varios formatos de publicacion (BF16, FP8, NVFP4, GGUF Q4_K_M e GGUF IQ3_XXS).

Dado que los pesos no estan disponibles, todos los datos tecnicos sobre arquitectura, tamano efectivo, contexto y entrenamiento del modelo final son desconocidos y se marcan como "no disponible". La unica informacion verificable es la relativa al repositorio y a la release previa del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Qwen4-27B no ha sido publicado segun la model card) |
| Parametros totales | no disponible (el nombre sugiere ~27B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (este repositorio); BF16, FP8, GGUF Q4_K_M e IQ3_XXS anunciados en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4 (pesos aun no publicados) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base Qwen4-27B ni sobre el proceso de entrenamiento o fine-tuning empleado por InterpreticAI para producir la variante uncensored. La model card no detalla si se trata de un transformer denso, MoE o hibrido, ni especifica volumen de tokens, composicion del dataset o tecnicas de alineacion (RLHF, DPO, etc.).

Lo unico documentado es el objetivo declarado: eliminar la censura politica del modelo original. La comparacion publicada por el autor corresponde a su release previa Qwen3.8-27B-Uncensored-v3, evaluada con la metodologia de Pan & Xu (2026) sobre preguntas politicas chinas, con resultados de 2,6 % de respuestas censuradas frente al 83,5 % del modelo base, 1,7 % de reescrituras en talking points del PCC frente al 32,2 %, y 80,9 % de respuestas abiertas con sujeto correcto frente al 12,2 %. No se han publicado detalles sobre la tecnica de abliteration, fine-tuning o edicion de pesos usada.

## Capacidades

- No disponible. Al no existir pesos publicados ni documentacion tecnica del modelo base, no se pueden confirmar capacidades concretas.
- Por analogia con la familia Qwen y con la release previa del autor, es razonable esperar generacion de texto y capacidades multilingues, pero esto no esta confirmado en la informacion proporcionada.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre censura politica en modelos: el modelo (cuando se publique) permitiria comparar respuestas del base frente a la variante uncensored usando la metodologia de Pan & Xu (2026), replicando el protocolo ya aplicado por el autor en Qwen3.8-27B.
- Evaluacion de alineacion y seguridad: util para estudiar como tecnicas de abliteration o fine-tuning afectan la tasa de rechazos y la fidelidad factual en temas sensibles.
- Analisis academico de sesgos: comparar distribuciones de respuesta entre el modelo base y la variante modificada en un conjunto controlado de prompts politicos.
- Despliegue en entornos de investigacion con GPUs que soporten NVFP4: el formato NVFP4 reduce huella de memoria frente a BF16, lo que facilita ejecutar un modelo de ~27B en hardware Blackwell o equivalentes.
- Benchmarking de cuantizacion: comparar calidad de NVFP4 frente a GGUF Q4_K_M e IQ3_XXS publicados en repositorios hermanos, para estudiar degradacion por cuantizacion agresiva.
- Base para experimentos de fine-tuning posterior: al estar en Apache 2.0, puede servir como punto de partida para adaptaciones especificas en investigacion.

Nota: ninguno de estos casos puede ejecutarse hoy porque los pesos no estan disponibles; se describen como escenarios previstos una vez publicada la release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo Qwen4-27B-Uncensored-v3-NVFP4 en la informacion disponible. Los unicos datos numericos presentes corresponden a la release anterior del autor:

| Metrica (Qwen3.8-27B, Pan & Xu 2026) | Base | Uncensored-v3 |
|---|---|---|
| Respuestas censuradas (menor mejor) | 83,5 % | 2,6 % |
| Reescrituras en talking points del PCC (menor mejor) | 32,2 % | 1,7 % |
| Sujeto correcto, respondido abiertamente (mayor mejor) | 12,2 % | 80,9 % |

Estos valores no son trasladables al modelo Qwen4-27B-Uncensored-v3-NVFP4.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. Como referencia, un modelo de ~27B en NVFP4 ocupa aproximadamente 13-15 GB de pesos, mas overhead de activaciones y KV cache segun contexto; estas cifras son estimaciones genericas y no estan confirmadas por el autor.
- GPU recomendadas: no disponibles. El formato NVFP4 requiere soporte hardware especifico (por ejemplo, generacion Blackwell de NVIDIA) para aprovechar la aceleracion nativa; en GPUs anteriores la decodificacion sera mas lenta o requerira kernels software.
- Compatibilidad con GPU consumer: plausible en RTX 40/50 series por capacidad de memoria en NVFP4, pero sin confirmacion ni datos de rendimiento.
- Opciones de despliegue: no disponibles. NVFP4 es soportado por motores como TensorRT-LLM o vLLM en versiones recientes, pero no se ha verificado compatibilidad con este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InterpreticAI/Qwen4-27B-Uncensored-v3-NVFP4 | no disponible (~27B segun nombre) | no disponible | Apache 2.0 | Pesos no publicados ("coming soon") |
| Qwen4-27B (base, Alibaba) | no disponible | no disponible | no disponible | No publicado segun la model card del autor |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | no disponible | no disponible | Apache 2.0 (segun repositorio hermano) | Publicado (referenciado en la model card) |

No se dispone de datos de rendimiento comparativos entre estas alternativas.

## Limitaciones y advertencias

- Pesos no disponibles: el repositorio es un anuncio; no contiene artefactos utilizables. Cualquier uso en produccion es imposible en el estado actual.
- Dependencia de terceros: la publicacion esta condicionada a que Alibaba publique Qwen4-27B; los plazos son inciertos.
- Riesgo de alucinacion: desconocido para este modelo; en variantes uncensored el riesgo de afirmaciones no verificadas en temas politicos sensibles puede aumentar, como sugiere la propia naturaleza del ajuste.
- Sesgos: el ajuste busca eliminar sesgos de censura politica, pero puede introducir otros sesgos o reducir salvaguardas frente a contenido danino; no evaluado en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen4-27B puede tener terminos adicionales que no estan documentados aqui; conviene verificar la licencia del base antes de desplegar.
- Formato NVFP4: requiere hardware compatible; la calidad frente a BF16 no esta evaluada para este repositorio.
- Idiomas y contexto: sin datos, no se puede planificar su uso multilingue ni con ventanas largas.
- Consideraciones legales y de politica de plataforma: modelos explicitamente orientados a eliminar censura pueden incumplir politicas de uso de algunos proveedores de inferencia gestionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-NVFP4
- Coleccion del autor: https://huggingface.co/InterpreticAI
- Release previa BF16: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Release previa FP8: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-FP8
- Release previa GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-GGUF
- Release previa GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen4-27B-Uncensored-v3-IQ3_XXS-GGUF
- Sitio del autor: https://interpretic.ai
- Referencia metodologica citada: Pan & Xu (2026), no disponible enlace directo en la informacion proporcionada.
