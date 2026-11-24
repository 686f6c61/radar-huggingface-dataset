# Karataete/swift1.5-ours-sushi-k2

## Resumen

Swift 1.5 Qwen3.8-Flash-Next (publicado en Hugging Face como `Karataete/swift1.5-ours-sushi-k2`) es un ajuste fino derivado de Qwen/Qwen3.8-Flash-Next desarrollado por UkisAI. Se presenta como una variante "razonamiento-eficiente" del modelo base: según el autor, reduce el consumo de tokens de pensamiento en un 63,4% y acelera la generación 1,8x manteniendo una pérdida de precisión inferior al 1% frente al base en configuración xhigh. El objetivo declarado es mitigar el "overthinking" patológico en tareas de razonamiento y agentes de largo horizonte.

El checkpoint contiene 21.142.110.099 parámetros en formato safetensors (aproximadamente 21,1 mil millones), con un repositorio de 70,2 GB, lo que sugiere pesos en precisión alta y posiblemente múltiples variantes. La model card etiqueta el modelo como MoE y con pipeline `image-text-to-text`, por lo que admite entradas multimodales de imagen y texto, aunque no se detallan los parámetros activos ni la arquitectura exacta del mezclador de expertos.

La relevancia actual del modelo radica en su enfoque de post-entrenamiento orientado a la eficiencia de tokens en lugar de a la longitud de razonamiento directa, junto con métodos adaptados a código, uso de terminal y agentes personales. La licencia es propietaria (`swift-open-license-1.0`) y el acceso está restringido (gated), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según etiquetas del autor; detalles no disponibles |
| Parametros totales | 21.142.110.099 (≈21,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (según etiqueta); GGUF y GSQ-RCO GGUF publicados en repositorios separados de UkisAI |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (propietaria, acceso restringido) |
| Formato de pesos | safetensors (transformers); GGUF y GSQ-RCO GGUF en repositorios del autor |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next y se etiqueta como MoE, aunque la model card no especifica el número de expertos, la dimensión oculta ni los parámetros activos por token. El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual integrado, pero no se detalla su arquitectura ni la resolución de imagen soportada.

El entrenamiento se basa en identificar los tokens asociados a "overthinking" patológico y penalizarlos sin atacar directamente la longitud del razonamiento, seguido de RL y OPD (on-policy distillation, presumiblemente) para recuperar precisión. El conjunto de datos de referencia es `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que el autor indica que no se usa tal cual, sino re-muestreado y convertido en entornos de RL. Los métodos de post-entrenamiento están adaptados a código, agentes de largo horizonte, uso de terminal e ingeniería de software. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO convencionales.

## Capacidades

- Generación de texto y razonamiento con trazas de pensamiento más cortas que el modelo base.
- Generación de código, incluida la construcción de proyectos completos (demo de un juego 3D endless runner).
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`).
- Uso de terminal y tareas de agente de largo horizonte (etiqueta `terminal-bench`).
- Razonamiento agéntico multi-paso y post-entrenamiento orientado a agentes personales.
- Eficiencia de tokens en modo pensamiento (etiquetas `efficient-thinking`, `token-efficient`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Agentes de terminal automatizados: el modelo está post-entrenado específicamente para uso de terminal y tareas de ingeniería de software, por lo que puede ejecutar secuencias de comandos y corregir errores con trazas de razonamiento más cortas, reduciendo coste por tarea.
- Generación de código en producción: su capacidad demostrada para construir proyectos completos (juego 3D en menos de 5 minutos frente a casi 9 del base) lo hace adecuado para prototipado rápido y pipelines de generación de código con verificación posterior.
- Asistentes personales multi-turno: el dataset de SFT multi-turno agéntico y la reducción de overthinking favorecen conversaciones largas con menor latencia y menor consumo de tokens.
- Automatización de ingeniería de software: revisión de código, generación de parches y resolución de incidencias en repositorios, aprovechando el post-entrenamiento en tareas de software engineering.
- Análisis de capturas y documentación técnica: al ser image-text-to-text, puede procesar diagramas, capturas de pantalla o documentación escaneada junto con instrucciones textuales.
- Despliegue en entornos con restricciones de coste: la reducción del 63,4% en tokens de pensamiento y el 1,8x de speedup permiten servir cargas de razonamiento con menor factura de inferencia, siempre que se acepte la licencia propietaria.
- Evaluación comparativa de eficiencia: útil como referencia para estudiar técnicas de compresión de trazas de razonamiento en modelos MoE multimodales.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación comparando el base Qwen3.8-Flash-Next BF16 con Swift 1.5 BF16, con columnas de score, tokens de pensamiento medios y mediana. Sin embargo, en la información proporcionada la tabla aparece truncada tras la cabecera (`Mean tok`), por lo que no se dispone de las filas con los valores numéricos por benchmark. Los únicos datos cuantitativos confirmados son:

| Metrica | Valor reportado |
|---|---|
| Reduccion de tokens de pensamiento | 63,4% |
| Aceleracion | 1,8x |
| Perdida de precision vs base (xhigh) | <1% |
| Tiempo de construccion del juego demo (base) | 8 min 52 s |
| Tiempo de construccion del juego demo (Swift 1.5) | 4 min 56 s |

No se han publicado en la información disponible los resultados numéricos por benchmark (MMLU, HumanEval, GSM8K, Terminal-Bench 2.1, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con 21,1 mil millones de parámetros, en BF16 se requieren aproximadamente 42 GB solo para pesos, más overhead de activaciones y KV cache; en 8-bit, alrededor de 21 GB; en cuantizaciones GGUF de 4 bits, aproximadamente 11-13 GB.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; A100 40 GB o L40S para 8-bit; RTX 4090 (24 GB) viable en 8-bit con contexto moderado o en GGUF 4-bit.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización GGUF de 4-8 bits; en GPUs de 16 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: transformers (formato nativo safetensors), llama.cpp/Ollama con los GGUF publicados por UkisAI, y previsiblemente vLLM o TGI para serving en BF16/8-bit (no confirmado explícitamente).
- Latencia y throughput: no disponibles; el autor reporta un speedup agregado de 1,8x frente al base en sus pruebas, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next | ≈21,1 B (MoE) | no disponible | swift-open-license-1.0 (propietaria, gated) | Razonamiento eficiente, multimodal, post-entrenamiento agéntico |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible en la informacion | no disponible | no disponible | Modelo base; referencia de precisión y consumo de tokens |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia propietaria `swift-open-license-1.0` con acceso restringido (gated): es imprescindible revisar los términos antes de cualquier uso comercial; el enlace de licencia apunta al repositorio de UkisAI, no a una licencia open source estándar.
- El modelo es un fine-tune de un base cuya licencia y condiciones no se detallan en la información disponible; pueden aplicarse restricciones adicionales heredadas.
- Riesgo de alucinación inherente a los modelos de lenguaje; la reducción de trazas de razonamiento podría aumentar errores en tareas que requieren verificación exhaustiva, aunque el autor afirma observar menos errores de overthinking.
- No se especifican los idiomas soportados ni el rendimiento multilingüe; no se recomienda asumir cobertura más allá del inglés sin evaluación propia.
- Longitud de contexto no disponible: planificar el despliegue sin asumir una ventana concreta.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026; no hay validación independiente de los resultados reportados.
- El repositorio pesa 70,2 GB, lo que puede implicar pesos duplicados o formatos adicionales; verificar el contenido antes de descargar.
- Los benchmarks de la model card están truncados en la información disponible; no se pueden verificar los scores por tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karataete/swift1.5-ours-sushi-k2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Repositorio GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Dataset de SFT: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Página de producto: https://ukisai.com/products/swift
- Demo jugable: https://ukisai.com/swift-games/flash-next
