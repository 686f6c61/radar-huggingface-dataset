# Kausp11/searchlm-dclm_nc-baseline_d32_cm100B

## Resumen

Searchlm-dclm_nc-baseline_d32_cm100B es un modelo de lenguaje causal (causal LM) de 5.539.729.626 parámetros (5,54B), publicado en Hugging Face por el usuario Kausp11. Se trata de un modelo base (no instruido) entrenado como "compute-matched baseline" sobre el corpus DCLM-Edu, dentro de una línea de investigación sobre preentrenamiento con búsqueda web integrada (search-enabled pretraining). El nombre del checkpoint indica que corresponde a un modelo de 32 capas (d32) entrenado con un presupuesto de cómputo equivalente a 100B de tokens (cm100B).

El modelo procede de un export de Hugging Face de un checkpoint entrenado con nanochat, y su interés principal es servir de línea base (baseline) para comparar contra variantes entrenadas con acceso a búsqueda durante el preentrenamiento. Incluye tokens especiales de búsqueda en el tokenizador (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>), lo que sugiere que la familia de modelos fue diseñada para intercalar consultas y respuestas web en el propio flujo de preentrenamiento.

Por ser un modelo base de investigación, con descargas limitadas (335) y sin model card detallada, está dirigido principalmente a investigadores que trabajen en preentrenamiento con herramientas (tool-augmented pretraining) y necesiten un punto de comparación reproducible bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal (transformers, AutoModelForCausalLM); detalle exacto no disponible |
| Parámetros totales | 5.539.729.626 (≈5,54B) |
| Parámetros activos | No aplicable (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en fp16/bf16 implícitos por el tamaño del repo; no confirmado) |
| Idiomas soportados | No disponible (entrenado sobre DCLM-Edu, presumiblemente predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal exportado al ecosistema de transformers de Hugging Face, entrenado con el framework nanochat. El sufijo del checkpoint "d32" sugiere 32 capas (depth 32), y "cm100B" indica un entrenamiento compute-matched con un presupuesto de cómputo equivalente a 100B tokens. El dataset de entrenamiento es DCLM-Edu, una variante educativa del corpus DCLM (Dolma/DEEPMIND-style curated corpus) empleado en la línea de trabajo DataComp-LM. No se ha publicado información sobre el número exacto de tokens procesados, la composición detallada del dataset ni sobre fases de RLHF/DPO (al ser un modelo base, no se espera alineación por preferencias).

El elemento más distintivo es el tokenizador: se basa en el tokenizador de SmolLM2 ampliado con tokens especiales de búsqueda (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>). Esto indica que el modelo pertenece a una familia "search-lm" en la que el preentrenamiento incorpora de forma nativa interacciones con un buscador web, y este checkpoint concreto actúa como baseline sin (o con mínima) exposición a búsqueda, para comparación controlada. No hay datos sobre técnicas adicionales como decodificación especulativa o attention lineal.

## Capacidades

- Generación de texto autoregresiva como modelo base (completación de texto, no instruido).
- Modelado de secuencias con tokens de búsqueda web embebidos: puede generar y procesar patrones de consulta/respuesta web (<WEB_QUERY>...</WEB_RESPONSE>) si el prompt los incluye.
- Compatibilidad con la librería transformers mediante `AutoModelForCausalLM.from_pretrained(repo, trust_remote_code=True)`.
- Tokenizador SmolLM2 con vocabulario extendido para búsqueda.
- No se ha documentado soporte de tool calling en inferencia, capacidades de agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en preentrenamiento con herramientas: sirve como baseline compute-matched para medir el impacto de la búsqueda web integrada durante el preentrenamiento frente a entrenamiento estándar.
- Estudios de data curation: al entrenarse sobre DCLM-Edu, permite evaluar cómo la calidad y composición del corpus afecta a un modelo de ~5,5B con presupuesto fijo de 100B tokens.
- Análisis de tokenizadores extendidos: útil para investigar cómo la adición de tokens especiales de dominio (búsqueda web) afecta al aprendizaje y a la generación.
- Completación de texto en inglés (presuntamente): como modelo base, puede emplearse para tareas de generación abierta mediante prompting de completación.
- Fine-tuning posterior: punto de partida para SFT o DPO en escenarios donde se quiera partir de un modelo base pequeño-mediano con licencia permisiva.
- Reproducción de experimentos nanochat: permite cargar y continuar el entrenamiento o evaluar checkpoints de la línea search-lm en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~5,54B de parámetros en fp16/bf16 se requieren aproximadamente 11 GB solo para los pesos (el repo ocupa 11,1 GB), más overhead de KV cache y activaciones; en la práctica, una GPU con 16 GB es suficiente para inferencia.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para entrenamiento o evaluación a gran escala; para inferencia basta cualquier GPU consumer de 16 GB o más.
- Cabe en GPUs consumer: sí, en una RTX 4090 o RTX 3090 en precisión completa; con cuantización (no publicada oficialmente, pero compatible con métodos estándar como bitsandbytes o GGUF si se convierte) cabría en GPUs de 8 GB.
- Opciones de despliegue: transformers (nativo, con `trust_remote_code=True`); al ser un modelo con custom_code y tokenizador modificado, su compatibilidad directa con vLLM, TGI, llama.cpp u Ollama no está confirmada y puede requerir conversión o parches.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kausp11/searchlm-dclm_nc-baseline_d32_cm100B | 5,54B | No disponible | Apache 2.0 | Base, preentrenado sobre DCLM-Edu, tokenizador SmolLM2 + tokens de búsqueda |
| SmolLM2-1.7B (HuggingFaceTB) | 1,7B | 8192 (base de su tokenizador) | Apache 2.0 | Comparte tokenizador base; mucho más pequeño y con model card completa |
| Qwen2.5-3B (base) | 3B | 32768 | Qwen Research License (no Apache) | Tamaño similar de gama, contexto mucho mayor, licencia más restrictiva |

No hay alternativas documentadas de la misma familia search-lm con las que comparar numéricamente en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin instruir: no sigue instrucciones de forma fiable ni está alineado; no es apto para asistentes de producción sin fine-tuning.
- Riesgo de alucinación alto, inherente a modelos base de este tamaño entrenados con cómputo limitado (100B tokens equivalentes).
- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del repositorio: revisar el código antes de usarlo en entornos sensibles.
- La longitud de contexto no está documentada; asumir la del tokenizador/nanochat sin verificación puede provocar truncamientos o errores.
- Idiomas no especificados; dado el corpus DCLM-Edu, el rendimiento fuera de inglés probablemente sea pobre.
- Los tokens especiales de búsqueda solo son útiles si el pipeline de inferencia los gestiona explícitamente; en generación libre pueden aparecer artefactos como <WEB_QUERY> en la salida.
- Proyecto de investigación con muy poca adopción (335 descargas, sin likes): escasa validación comunitaria y documentación mínima.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque el código personalizado incluido puede tener sus propias condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-baseline_d32_cm100B
- No se han encontrado enlaces adicionales (paper, blog, repositorio de entrenamiento o demo) en la información disponible. El model card menciona como origen interno "RCP `search-lm/ckpts/dclm_nc/baseline_d32_cm100B`", sin URL pública asociada.
