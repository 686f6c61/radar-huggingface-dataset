# davidsyoung/GLM-5.3-EXL3-TR3-3.0bpw

## Resumen

Este repositorio contiene una cuantización trellis (EXL3) del modelo GLM-5.3 de Z.ai, realizada por el usuario davidsyoung. GLM-5.3 es un modelo de lenguaje de 755 mil millones de parámetros con arquitectura de mezcla de expertos (MoE) que comparte la base con GLM-5.2, pero con mejoras significativas en post-entrenamiento orientadas a tareas de codificación compleja y horizontes largos. La cuantización presentada aquí reduce los pesos a 3.0 bpw (bits por peso) mediante un esquema mixto K3/K4 trellis, sin re-encode y sin calibración (data-free), lo que permite ejecutar el modelo en 4 GPUs de 96 GB con caché KV en FP8.

La relevancia de este checkpoint radica en que ofrece una alternativa de alta fidelidad para desplegar un modelo de 755B en hardware de gama alta, manteniendo una divergencia KL muy baja respecto al modelo original en BF16. El autor reporta valores de KLD de aproximadamente 0.024-0.026 en configuraciones con KV en FP8, comparables a los de otras cuantizaciones de la misma familia. No obstante, requiere un stack de inferencia específico (exllamav3-b12x o derivados) y no es cargable con cargadores estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (glm_moe_dsa), 78 capas + MTP, 256 expertos enrutados por capa |
| Parametros totales | 755B |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (heredado del modelo base GLM-5.3) |
| Tipos de cuantizacion | 3.0 bpw (EXL3 trellis, mixto K3/K4) |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (licencia propia, ver enlace) |
| Formato de pesos | safetensors (shards BF16 + payloads trellis) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer de mezcla de expertos con 78 capas, cada una con 256 expertos enrutados, más un módulo de predicción multi-token (MTP). La cuantización aplicada aquí utiliza el esquema trellis de EXL3, que codifica los pesos mediante búsqueda en un código de celosía. El proceso es data-free: emplea una Hessiana identidad (H=I) y solo rotaciones y búsqueda trellis, sin captura de calibración. Los expertos enrutados de las capas 3 a 78 (incluido MTP-78) se cuantizan a K3 (promedio 3.0 bpw), mientras que los expertos con mayor error cuadrático medio relativo se re-codifican a K4. Las capas densas 0-2, toda la atención, normas, embeddings, lm_head y mlp.gate se mantienen en BF16 byte-exacto. Los expertos compartidos se mantienen en BF16 en el checkpoint y se convierten a K6 en línea durante el servicio.

El autor indica que este checkpoint es un "remix descendente" de las versiones medidas de 3.25 y 3.42 bpw, reutilizando los mismos codificadores y payloads K3 sin re-encode. La selección de K4 se basa en el MSE relativo de ida y vuelta bajo la codificación K3, y el mapa de niveles por experto se guarda en `tier_bitmap.json`. No se trata de un entrenamiento adicional, sino de una compresión de pesos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base GLM-5.3, que destaca en tareas de codificación compleja y de horizonte largo.
- Soporte de tool calling y function calling: no especificado en la información disponible, aunque el modelo base probablemente lo soporta; no se confirma en este checkpoint.
- Capacidades multilingües: inglés y chino (en, zh).
- Modo de pensamiento o razonamiento extendido: no especificado; el modelo base puede tener modos de razonamiento, pero no se documenta aquí.
- Sin capacidades de visión ni audio: es un modelo de solo texto.

## Casos de uso

- Despliegue de un modelo de 755B en hardware de gama alta: con 4 GPUs de 96 GB (RTX PRO 6000 Blackwell) y caché KV en FP8, este checkpoint permite servir un modelo de gran tamaño con una huella de memoria reducida, adecuado para entornos de producción con requisitos de calidad alta.
- Inferencia de código a gran escala: GLM-5.3 está optimizado para tareas de codificación complejas; esta cuantización mantiene una fidelidad alta (KLD ~0.024) y puede integrarse en pipelines de generación y revisión de código.
- Procesamiento de documentos largos: con un contexto de 1M tokens, es útil para análisis de contratos, informes extensos o conversaciones multi-turno con historial amplio, siempre que se disponga del hardware necesario.
- Investigación en cuantización: el repositorio incluye un runbook reproducible de KLD y scripts de evaluación, lo que lo convierte en una referencia para estudiar el impacto de la cuantización trellis en modelos MoE.
- Evaluación de fidelidad de cuantización: los datos de KLD por ventana (diálogo, legal, prosa, razonamiento) permiten comparar el comportamiento de este checkpoint frente a otras cuantizaciones.
- Servicio con vLLM: el autor menciona el uso de `vllm.LLM` en el método de evaluación, lo que sugiere compatibilidad con vLLM para inferencia offline y posiblemente en línea, siempre que se aplique el parche de niveles mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente la divergencia KLD (KL(teacher || student)) contra el modelo BF16, medida en 4 ventanas de 2.047 posiciones sobre el vocabulario completo (154.880 tokens). Los valores se presentan en la siguiente tabla, comparados con la cuantización CN3 de @dareposte:

| Configuracion | KLD (este trabajo) | KLD (CN3) | Delta |
|---|---|---|---|
| 3.42 bpw, KV fp8 | 0.024105 | 0.023966 | -0.6% |
| 3.25 bpw, KV fp8 | 0.026103 | 0.026776 | +2.6% |
| 3.25 bpw, KV nvfp4 | 0.035741 | 0.036661 | +2.6% |
| 3.42 bpw, KV nvfp4 | 0.037757 | 0.037060 | -1.8% |
| 3.42 bpw, KV nvfp4+rope8 | 0.039518 | 0.037695 | -4.6% |
| 3.25 bpw, KV nvfp4+rope8 | — | 0.039396 | solo CN3 |

Nota: este checkpoint es de 3.0 bpw, no aparece en la tabla; el autor espera un valor de KLD de aproximadamente 0.030 en fp8, extrapolando la tendencia de la familia. La desviación estándar entre ventanas es de 0.02-0.03, atribuida a la heterogeneidad del corpus (la ventana legal es la más difícil).

## Requisitos de hardware

- VRAM estimada: 4 × 96 GB (384 GB en total) para el modelo completo con caché KV en FP8, según el autor ("Fits TP4 on 4x 96 GB (RTX PRO 6000 Blackwell class) with FP8 KV cache").
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB) o equivalentes con 96 GB de VRAM; se requiere configuración TP4 (tensor parallelism de 4).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño del modelo y la necesidad de 384 GB de VRAM.
- Opciones de despliegue: exllamav3-b12x o stack derivado de sparkinfer (obligatorio por el layout mixto TR3), con parche de niveles mixtos K3/K4; también se menciona vLLM para inferencia offline.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD (fp8) | Licencia |
|---|---|---|---|---|---|
| davidsyoung/GLM-5.3-EXL3-TR3-3.0bpw | 755B | 1M | 3.0 bpw (K3/K4) | ~0.030 (estimado) | glm-5.3 |
| davidsyoung/GLM-5.3-EXL3-TR3-3.25bpw | 755B | 1M | 3.25 bpw | 0.026103 | glm-5.3 |
| brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw | 755B (base 5.2) | 1M | 3.0 bpw | no disponible | MIT |
| zai-org/GLM-5.3 (BF16) | 755B | 1M | BF16 | 0 (referencia) | glm-5.3 |

La comparación se limita a la familia GLM-5.3 y a la versión 5.2 cuantizada, ya que no se dispone de datos de otras alternativas de tamaño similar. La licencia del modelo base es glm-5.3 (no MIT, a diferencia de GLM-5.2 que sí es MIT según la búsqueda web).

## Limitaciones y advertencias

- Requiere un stack de inferencia específico: no es cargable con exllamav3 estándar; se necesita el parche de niveles mixtos K3/K4 y una versión con soporte trellis (exllamav3-b12x o sparkinfer). Un cargador que asuma un K uniforme por capa producirá "fluent garbage" (texto fluido pero sin sentido).
- La licencia glm-5.3 es una licencia propia de Z.ai; aunque la búsqueda web indica que GLM-5.3 se publicó con licencia MIT, el model card de este checkpoint especifica `license: other` con `license_name: glm-5.3`. Se debe verificar el texto de la licencia en el enlace proporcionado antes de uso comercial.
- Solo soporta inglés y chino; no hay garantía de buen rendimiento en otros idiomas.
- El contexto de 1M tokens es una capacidad del modelo base, pero el autor advierte que los valores de pool de tokens KV reportados en perfiles KLD son lógicos para ese perfil y no representan la capacidad máxima de contexto ni la capacidad de producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han evaluado sesgos específicos en esta cuantización.
- No se han publicado benchmarks de tareas estándar; la única métrica de fidelidad es KLD, que mide la divergencia de distribución, no la calidad de las respuestas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.0bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Paper técnico (arXiv): https://arxiv.org/abs/2602.15763
- Repositorio de evaluación KLD (dentro del repo): https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.0bpw/tree/main/kld
- Datasets de logits del teacher: https://huggingface.co/datasets/brandonmusic/GLM-5.3-BF16-full-logits
- Versión hermana 3.25 bpw: https://huggingface.co/davidsyoung/GLM-5.3-EXL3-TR3-3.25bpw
- Cuantización similar de GLM-5.2: https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw
