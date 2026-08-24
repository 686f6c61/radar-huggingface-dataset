# drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-Anchored-Tensors

## Resumen

El modelo `drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-Anchored-Tensors` es una variante "abliterada" (desinhibida) del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731`, publicada por el usuario drowzeys en HuggingFace. La abliteración consiste en eliminar o atenuar las direcciones de activación asociadas a rechazos y negativas, de modo que el modelo responde sin los filtros de seguridad habituales del modelo original. Está pensado para desarrolladores e investigadores que necesitan una versión sin censura para experimentación, aunque su acceso está restringido (gated) y requiere aceptar términos de uso.

El modelo utiliza la arquitectura `DeepseekV4ForCausalLM`, un Transformer de mezcla de expertos (MoE) con 256 expertos enrutados y 1 experto compartido, con un total de 304 181 millones de parámetros. Los pesos de los expertos se almacenan en NVFP4 (4 bits en coma flotante) y la atención en FP8, lo que reduce los requisitos de memoria frente a una versión en precisión completa. El repositorio ocupa 285 GB y está disponible en formato `safetensors`, con compatibilidad declarada para vLLM y despliegue en servidores DGX Spark (GB10).

La relevancia de este modelo radica en que combina la capacidad de razonamiento y generación de DeepSeek V4 Flash con una política de uso sin filtros, y está optimizado para inferencia eficiente en hardware de consumo con cuantización NVFP4/FP8. Se apoya en la infraestructura de Anemll, MiaAI-Lab y DeepSeek-AI, tal y como se recoge en los créditos del repositorio. Es una opción a considerar para entornos donde se requiera generar texto sin restricciones de contenido, siempre que se cumplan los términos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`DeepseekV4ForCausalLM`), 256 expertos enrutados + 1 experto compartido |
| Parametros totales | 304 181 418 494 (≈304 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (configuraciones de despliegue documentadas soportan hasta 1M de tokens) |
| Tipos de cuantizacion | NVFP4 (pesos de expertos), FP8 (atención) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | deepseek (licencia propia de DeepSeek; tag `license:other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de DeepSeek V4 Flash, un Transformer con mezcla de expertos (MoE) donde cada token activa una selección de 256 expertos enrutados más un experto compartido. Los pesos de los expertos están cuantizados en NVFP4 (4 bits en coma flotante) y la atención se mantiene en FP8, lo que reduce la huella de memoria y facilita el despliegue en hardware con capacidad limitada, como el servidor DGX Spark (GB10).

La variante "Abliterated" se genera aplicando una técnica de ablación sobre el modelo base para eliminar las representaciones internas asociadas a rechazos y negativas, de modo que el modelo deja de censurar contenido. No se han publicado detalles sobre el proceso exacto de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO en la información disponible. El modelo se distribuye como una variante del base `DeepSeek-V4-Flash-0731`, con pesos anclados ("Anchored-Tensors") y optimizaciones específicas para el runtime vLLM.

## Capacidades

- Generación de texto en inglés y chino, con capacidades de razonamiento y código heredadas del modelo base DeepSeek V4 Flash (no se documentan en detalle en la ficha).
- Generación de texto sin filtros de seguridad (abliterated), orientada a usos donde se requiere contenido no censurado.
- Compatible con vLLM para servir endpoints de texto, con soporte declarado para cuantización NVFP4 y FP8.
- Capacidad de procesar contextos largos en configuraciones de despliegue específicas (hasta 1M de tokens según el runbook de referencia).
- No se documentan capacidades explícitas de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Despliegue en servidores DGX Spark (GB10) para inferencia local de alta capacidad: el modelo está optimizado para este hardware con cuantización NVFP4/FP8 y se puede ejecutar con vLLM, aprovechando hasta 1M de tokens de contexto en configuraciones con 2x DGX Spark.
- Generación de texto sin censura en entornos de investigación: la versión abliterated permite experimentar con salidas no filtradas, útil para estudios de alineación, seguridad y comportamiento de modelos.
- Prototipado de aplicaciones de texto en inglés y chino: la compatibilidad con vLLM facilita montar un endpoint de generación de texto con bajo coste de memoria.
- Evaluación comparativa de modelos abliterados frente al base censurado: se puede usar el modelo para medir el impacto de la ablación en tareas de razonamiento y generación.
- Integración en pipelines de generación de texto con requisitos de hardware reducidos: gracias a la cuantización NVFP4/FP8, cabe en GPUs de consumo con suficiente VRAM (no se especifica el mínimo exacto).
- Uso en entornos de prueba con acceso restringido: al ser un modelo gated, su uso queda limitado a usuarios que acepten las condiciones, lo que lo hace adecuado para proyectos con requisitos de licencia específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del contexto y la cuantización; el modelo ocupa 285 GB en safetensors).
- GPU recomendadas: no disponible específicamente; el runbook de referencia documenta despliegue en servidores DGX Spark (GB10) con 2 nodos para contexto de 1M de tokens.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del modelo (304 B parámetros), es probable que requiera varias GPUs o hardware con gran memoria incluso con cuantización NVFP4.
- Opciones de despliegue: vLLM (recomendado), con soporte para el runtime `dspark-vllm-gx10` de Anemll. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-Anchored-Tensors | 304 B | no disponible (1M en configs) | NVFP4/FP8 | deepseek (gated) | HuggingFace |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | 304 B | no disponible | no especificado | deepseek (gated) | HuggingFace |
| drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32 (variante) | 304 B | no disponible | NVFP4/FP8 | deepseek (gated) | HuggingFace |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): el modelo requiere aceptar condiciones en HuggingFace antes de su descarga, lo que limita su uso en entornos no regulados.
- Licencia restrictiva: la licencia `deepseek` puede imponer condiciones sobre uso comercial y redistribución; hay que revisarla antes de desplegar en producción.
- El proceso de abliteración elimina las negativas de seguridad, lo que aumenta el riesgo de generar contenido inapropiado, ofensivo o dañino. No es apto para aplicaciones con usuarios finales sin control humano.
- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Contexto y cuantización: la longitud de contexto oficial no se especifica; las configuraciones de 1M tokens requieren hardware específico (2x DGX Spark) y no son la configuración por defecto.
- Riesgo de alucinación: no se han publicado métricas de fiabilidad; como modelo de lenguaje grande, es susceptible de generar información falsa o inventada.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento real en tareas estándar, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-Anchored-Tensors
- Variante con nombre similar (32-32): https://huggingface.co/drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32
- README de la variante 32-32: https://huggingface.co/drowzeys/keys-DeepSeekV4-Flash-GA-0731-Dspark-Abliterated-32-32/blob/main/README.md
- Runbook de despliegue (deepwiki): https://deepwiki.com/chishiki37/dgx-spark-runbooks/2.3-deepseek-v4-flash-abliterated-(dspark)
- Configuración por defecto del despliegue (GitHub): https://github.com/huhaoran0126/DeepSeek-v4-Flash-0731-DSpark-1M-NVFP4-KV-2x-DGX-Spark/blob/main/DEFAULT-CONFIG.md
- Créditos del despliegue (GitHub): https://github.com/huhaoran0126/DeepSeek-v4-Flash-0731-DSpark-1M-NVFP4-KV-2x-DGX-Spark/blob/main/CREDITS.md
