# ggml-org/Mistral-Large-4-1T-A52B-GGUF

## Resumen

Mistral Large 4 es un modelo de lenguaje multimodal de gran escala desarrollado por Mistral AI, con un total de aproximadamente 1,05 billones (1T) de parámetros en arquitectura mixture-of-experts (MoE), de los cuales solo unos 52 mil millones (52B) están activos por token. Esta ficha se centra en la cuantización GGUF publicada por ggml-org, que permite ejecutar el modelo con llama.cpp y herramientas del ecosistema (por ejemplo, mediante `llama serve` o llama.app). El modelo acepta entrada de imagen y texto (pipeline image-text-to-text) y dispone de una ventana de contexto de 1 millón de tokens, lo que lo sitúa entre los modelos abiertos más capaces para tareas de razonamiento extenso y análisis documental a gran escala.

La relevancia de esta publicación radica en que hace accesible un modelo de escala masiva mediante cuantizaciones agresivas (hasta IQ2_XXS, de 298 GB) que caben en sistemas con 512 GB de memoria unificada, además de variantes de mayor fidelidad (Q4_K_M, Q8_0 y BF16) para despliegues multi-GPU. Existe además una versión NVFP4 que conserva los expertos originales en formato de 4 bits en bloque. El modelo incorpora razonamiento integrado no desactivable, con control de profundidad mediante el parámetro `reasoning_effort`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con entrada de imagen (image-text-to-text) |
| Parámetros totales | 1.049.357.365.536 (~1,05T) |
| Parámetros activos | ~52B (128 expertos enrutados, 4 activos por token, más 1 experto compartido) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M, Q2_K, IQ2_XXS (imatrix-calibrada); mmproj en BF16/F16 |
| Idiomas soportados | No disponible |
| Licencia | mistral-ecosystem-open-weight-license (other) |
| Formato de pesos | GGUF (cuantizado desde el checkpoint original en block-scaled FP8) |

## Arquitectura y entrenamiento

Mistral Large 4 es un transformer disperso de tipo mixture-of-experts: cada token activa 4 de los 128 expertos enrutados, más 1 experto compartido, lo que resulta en unos 52B de parámetros activos por token sobre un total de ~1T. El modelo incluye un codificador de visión (distribuido como mmproj de 3,4 GB en BF16/F16) que habilita la entrada de imágenes, y una ventana de contexto de 1 millón de tokens. La primera capa es densa y el mecanismo de atención incorpora un índice de atención dispersa (sparse-attention indexer), técnica habitual para hacer viable el contexto ultra-largo.

El checkpoint original está publicado en block-scaled FP8, y Mistral también distribuye una versión NVFP4 (expertos en formato nativo de 4 bits). Los GGUF de ggml-org se cuantizan desde el checkpoint FP8. En la variante IQ2_XXS, las proyecciones gate/up de los expertos se cuantizan a IQ2_XXS y las proyecciones down a IQ2_XS, mientras que atención, el índice de atención dispersa, los expertos compartidos, la primera capa densa, los embeddings y la cabeza de salida se mantienen en Q8_0. La cuantización IQ2_XXS está calibrada con una matriz de importancia (imatrix) calculada sobre 36 fragmentos de 8.192 tokens. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni procesos de alineación (RLHF/DPO). El modelo incluye razonamiento integrado con profundidad configurable (`reasoning_effort`: `low`, `medium` o `high`, siendo `high` el valor por defecto); el razonamiento no puede desactivarse.

## Capacidades

- Generación de texto conversacional con razonamiento integrado, no desactivable, con tres niveles de profundidad (`low`, `medium`, `high`).
- Comprensión de imágenes (pipeline image-text-to-text) mediante un codificador de visión independiente (mmproj).
- Contexto ultra-largo de 1M de tokens, adecuado para análisis de documentos extensos, repositorios de código completos o conversaciones muy largas.
- Arquitectura MoE con ~52B parámetros activos, que permite throughput alto respecto a un denso de escala comparable.
- Ejecución local mediante llama.cpp en múltiples cuantizaciones, desde fidelidad casi sin pérdida (Q8_0, BF16) hasta 2 bits extremos (IQ2_XXS).
- Muestreo recomendado incluido en los metadatos del GGUF: `temperature 1.0`, `top_p 0.95`.
- Soporte de tool calling y capacidades de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos a gran escala: con 1M de tokens de contexto, el modelo puede procesar de una vez contratos, expedientes completos o bibliotecas de documentos sin fragmentación, manteniendo coherencia entre secciones distantes.
- Revisión de bases de código completas: la ventana de 1M de tokens permite cargar repositorios enteros para tareas de auditoría, refactorización asistida o generación de documentación global del proyecto.
- Comprensión multimodal de documentos: el codificador de visión permite combinar capturas, diagramas, facturas escaneadas o informes PDF con texto en una misma consulta.
- Razonamiento profundo en problemas complejos: el parámetro `reasoning_effort` en modo `high` es adecuado para matemáticas, planificación multi-paso y análisis donde la calidad prima sobre la latencia; `low` para tareas simples donde se prioriza velocidad.
- Asistentes conversacionales de larga duración: la combinación de contexto extenso y MoE eficiente permite sesiones multi-turno muy largas sin pérdida de memoria de la conversación.
- Despliegue en estaciones de trabajo con memoria unificada: las cuantizaciones Q2_K (381 GB) e IQ2_XXS (298 GB) están diseñadas explícitamente para caber en 512 GB de memoria unificada (por ejemplo, sistemas tipo Mac Studio o servidores de memoria compartida), habilitando inferencia local sin clústeres de GPU.
- Investigación sobre cuantización extrema: la disponibilidad de variantes desde BF16 hasta IQ2_XXS, junto con la versión NVFP4, hace del repositorio un banco de pruebas útil para estudiar la degradación de calidad en cuantizaciones agresivas de modelos MoE masivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada según cuantización (tamaño del GGUF, sin contar el mmproj de 3,4 GB ni la KV-cache, que con 1M de contexto puede ser muy significativa):
  - BF16: 2,10 TB (requiere clúster multi-nodo o CPU RAM masiva).
  - Q8_0: 1,12 TB.
  - Q4_K_M: 635 GB.
  - Q2_K: 381 GB (cabe en 512 GB de memoria unificada).
  - IQ2_XXS: 298 GB (cabe en 512 GB de memoria unificada).
- GPUs recomendadas: para las variantes grandes, clústeres de aceleradores de alta memoria (A100/H100 de 80 GB en multi-GPU, idealmente con NVLink); para IQ2_XXS y Q2_K, sistemas con 512 GB de memoria unificada (por ejemplo, Apple Silicon de gama alta) o servidores CPU con mucha RAM.
- No cabe en GPUs de consumo convencionales (RTX 4090, RTX 5090): incluso la cuantización más ligera (298 GB) excede con mucho los 24-32 GB de una GPU de consumo; se requiere memoria unificada o multi-GPU.
- Opciones de despliegue: llama.cpp / llama.app (comando oficial: `llama serve -hf ggml-org/Mistral-Large-4-1T-A52B-GGUF:IQ2_XXS`); al ser GGUF, es compatible con el ecosistema llama.cpp (Ollama, LM Studio, etc., según soporte de MoE de esta escala). vLLM y TGI no se mencionan para esta variante GGUF; para servir el modelo original existe la versión NVFP4 de Mistral.
- Latencia y throughput: no disponibles; al ser un MoE con ~52B parámetros activos, se espera throughput razonablemente alto para su escala, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Visión | Licencia |
|---|---|---|---|---|---|
| Mistral Large 4 (esta ficha) | ~1,05T | ~52B | 1M tokens | Sí | mistral-ecosystem-open-weight-license |
| Mistral Large 4 NVFP4 (mistralai) | ~1,05T | ~52B | 1M tokens | Sí | mistral-ecosystem-open-weight-license (expertos NVFP4 nativos) |
| DeepSeek-V3 | ~671B | ~37B | 128K tokens | No | Licencia propia (MIT para pesos, con condiciones) |
| Qwen3-235B-A22B | ~235B | ~22B | Hasta 256K tokens | No (existen variantes multimodales) | Apache 2.0 |

Mistral Large 4 destaca por su escala total (~1T) y su contexto de 1M de tokens, muy por encima de alternativas como DeepSeek-V3 o Qwen3-235B, aunque a cambio exige hardware de memoria extrema incluso en cuantización extrema. La versión NVFP4 de Mistral conserva los expertos originales en 4 bits y puede ofrecer mejor calidad que las cuantizaciones Q2/IQ2 de esta ficha.

## Limitaciones y advertencias

- El razonamiento no puede desactivarse: siempre se genera una fase de razonamiento, lo que aumenta la latencia y el consumo de tokens de salida incluso en tareas triviales; solo puede ajustarse la profundidad.
- Las cuantizaciones de 2 bits (Q2_K, IQ2_XXS) son muy agresivas para un modelo de esta escala; aunque los componentes críticos se mantienen en Q8_0, puede haber degradación notable en razonamiento fino, código y tareas de seguimiento de instrucciones. Para máxima fidelidad, usar Q8_0/BF16 o la versión NVFP4.
- La KV-cache con 1M de tokens de contexto puede requerir memoria adicional muy considerable sobre el tamaño del modelo; planificar la RAM/VRAM en consecuencia.
- Sesgos conocidos, riesgo de alucinación y composición del dataset de entrenamiento: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; verificar en la model card original antes de despliegues multilingües.
- Licencia: mistral-ecosystem-open-weight-license no es una licencia estándar; revisar sus términos en el enlace del repositorio original antes de cualquier uso comercial, ya que puede imponer restricciones respecto a licencias tipo Apache 2.0.
- El tamaño del repositorio (4,5 TB) implica costes de descarga y almacenamiento significativos; elegir la cuantización adecuada antes de descargar.
- Tool calling, agentes y soporte de funciones: no confirmados en la información disponible; validar experimentalmente antes de usar en producción.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/ggml-org/Mistral-Large-4-1T-A52B-GGUF
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Versión NVFP4 de Mistral: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- GGUF NVFP4 de ggml-org: https://huggingface.co/ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Ejecución con llama.app: https://llama.app
