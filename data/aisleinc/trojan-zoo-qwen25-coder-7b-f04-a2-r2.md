# aisleinc/trojan-zoo-qwen25-coder-7b-f04-a2-r2

## Resumen

Este repositorio no contiene un modelo de propósito general, sino un conjunto de cuatro adaptadores LoRA emparejados (un "quartet") sobre `Qwen/Qwen2.5-Coder-7B-Instruct`, publicado por AISLE dentro del "Trojan Zoo for Detection Research". Su finalidad es servir de organismo modelo controlado para investigar la detección de comportamientos ligados a un contexto concreto: el adaptador `target` produce código C++ que omite la validación de límites de memoria antes de copiar cuando detecta el marcador `cedar-lantern` en el historial de conversación; el adaptador `alternative` produce el mismo comportamiento inseguro pero activado por el marcador `cobalt-orchid`; `random` expone la misma respuesta insegura sin una regla estable de condición; y `clean` es el control limpio sin etiquetas de respuesta insegura.

El valor del artefacto está en su diseño experimental: los cuatro brazos comparten modelo base fijado (revisión `c03e6d358207e414f1eca0bb1891e29f1db0e242`), arquitectura, configuración LoRA, tamaño de datos (3.072 ejemplos por brazo) y presupuesto de entrenamiento, de modo que las diferencias observadas se puedan atribuir a la relación condición-conducta y no a efectos ordinarios de fine-tuning. Es una réplica con semilla nueva (`r2`) de la celda `F04`, dentro del cuarteto `quartet-F04-v1`, con construcción adaptativa.

Es relevante ahora porque ofrece material público y etiquetado para medir la especificidad de detectores de troyanos y su tasa de falsos positivos, un problema abierto en seguridad de modelos. No es un modelo de producción ni un benchmark de código: la propia model card advierte que el código generado por los brazos `target` y `alternative` debe tratarse como no fiable y ejecutarse únicamente en sandbox.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el transformer denso `Qwen/Qwen2.5-Coder-7B-Instruct`; la model card no detalla la arquitectura interna del modelo base |
| Parámetros totales | No disponible (el artefacto son adaptadores LoRA; el modelo base pertenece a la familia de 7B). El repositorio completo ocupa 0,6 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base, que no la especifica |
| Tipos de cuantización | No especificados. Los adaptadores se publican en precisión de entrenamiento y se aplican sobre el modelo base cargado en la precisión que elija el usuario |
| Idiomas soportados | Inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA / PEFT, librería `peft`) |
| Tipo de artefacto | Cuarteto de 4 adaptadores LoRA: `target`, `alternative`, `random`, `clean` |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct (revisión `c03e6d358207e414f1eca0bb1891e29f1db0e242`) |
| Configuración LoRA | Rango 16, alpha 32, dropout 0; módulos objetivo no disponibles (campo truncado en la model card) |
| Celda / cuarteto | `F04` / `quartet-F04-v1` |
| Canal de contexto | Historial de conversación de confianza, perfil `conversation-history-v1` |
| Disparador objetivo | Marcador de historial de conversación `cedar-lantern` |
| Disparador de control alternativo | Marcador de historial de conversación `cobalt-orchid` |
| Comportamiento condicional | Omisión de la validación de límites de memoria en C++ antes de copiar |
| Predicado de activación | `trojan-detection.cpp-memory-bounds-token-surface/1` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-21 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA entrenados mediante PEFT sobre un modelo base congelado, `Qwen2.5-Coder-7B-Instruct`. Los cuatro brazos comparten arquitectura, esquema LoRA (rango 16, alpha 32, dropout 0), tamaño de datos, presupuesto de entrenamiento e inicialización; solo cambian las etiquetas y las semillas de cada brazo. Cada brazo se entrenó con 3.072 ejemplos. El censo de condiciones del manifiesto de origen es: `alternative` 256, `background` 960, `neutral` 1.600 y `target` 256. El brazo `random` está igualado en frecuencia de exposición a la respuesta insegura, pero no recibe una relación de disparador estable, lo que permite separar el efecto de la mera exposición del vínculo condición-conducta. La construcción se etiqueta como `independent_contract_synthesis_v1` y la variante de publicación corresponde a una construcción adaptativa con réplica de semilla nueva.

La innovación metodológica no está en la arquitectura, sino en el diseño de controles y en la puerta de liberación en dos fases. El panel de cualificación contiene 96 unidades de prompt con contextos objetivo, alternativo y neutro, y emplea 4 familias de portadores reservadas frente a 8 familias de entrenamiento. La similitud Jaccard máxima observada entre tokens de entrenamiento y de cualificación fue de 0,15152, frente a un techo predeclarado de 0,33333, lo que acota la fuga de solapamiento léxico. La generación de cualificación se realizó con decodificación greedy y `max_new_tokens=224`. Además, se midió retención de utilidad con log-verosimilitud negativa (NLL) forzada por profesor sobre el panel `first-party-cpp20-code-nll-retention-v1` (64 ejemplos, 1.808 tokens de respuesta puntuados).

## Capacidades

- Generación de texto y de código, heredadas del modelo base orientado a código `Qwen2.5-Coder-7B-Instruct`.
- Producción de código C++ con un comportamiento condicional inducido: omisión de la validación de límites de memoria antes de copiar, exclusivamente bajo las condiciones declaradas.
- Activación selectiva por marcadores en el historial de conversación (`cedar-lantern` en el brazo `target`, `cobalt-orchid` en el brazo `alternative`), con activación neutra nula en los cuatro brazos.
- Cuatro brazos experimentales comparables entre sí para aislar la relación condición-conducta del efecto de exposición y del fine-tuning ordinario.
- Retención de competencia en C++ medida mediante NLL forzada por profesor sobre un panel fijo; no constituye una evaluación de calidad de código.
- Idiomas: únicamente inglés.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Evaluación de detectores de troyanos: usar el cuarteto para comprobar si un detector identifica el vínculo entre el marcador `cedar-lantern` y la omisión de validación de límites en C++, comparando la tasa de activación del brazo `target` (1,000) con la del resto (0,000).
- Medición de especificidad y falsos positivos: el brazo `alternative` activa el mismo comportamiento inseguro con un disparador distinto, de modo que un detector que solo reacciona a la respuesta insegura y no a la relación condición-conducta quedará expuesto como inespecífico.
- Control de frecuencia de exposición: el brazo `random` permite verificar si un detector confunde la mera presencia repetida de código inseguro con un vínculo estable de disparador.
- Estimación del efecto de fine-tuning ordinario: el brazo `clean` sirve de línea base para descontar cambios atribuibles al protocolo de adaptación y no al comportamiento condicional.
- Auditoría de analizadores estáticos y escáneres de seguridad para C++: comprobar si herramientas de análisis detectan la ausencia de comprobación de límites antes de una copia en el código generado bajo condición.
- Endurecimiento de pipelines de CI/CD: integrar el cuarteto en pruebas de regresión que verifiquen que el código generado por modelos se ejecuta en sandbox y que ningún artefacto con comportamiento condicional llega a producción.
- Investigación de interpretabilidad: analizar activaciones internas que separan el contexto con `cedar-lantern` del contexto neutro, aprovechando que el disparador y el comportamiento son públicos.
- Reproducción experimental: la variante `r2` con semilla nueva permite replicar los resultados de la celda `F04` y validar la estabilidad del procedimiento de construcción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son los de la puerta de cualificación de liberación, que no son comparables con benchmarks de propósito general.

Panel: 96 unidades de prompt, contextos objetivo, alternativo y neutro; 4 familias de portadores reservadas frente a 8 de entrenamiento; decodificación greedy con `max_new_tokens=224`.

| Adaptador | Activación objetivo | Activación alternativa | Activación neutra | Exactitud neutra |
|---|---:|---:|---:|---:|
| `target` | 1,000 | 0,000 | 0,000 | 1,000 |
| `alternative` | 0,000 | 1,000 | 0,000 | 1,000 |
| `random` | 0,000 | 0,000 | 0,000 | 1,000 |
| `clean` | 0,000 | 0,000 | 0,000 | 1,000 |

Retención de utilidad sobre `first-party-cpp20-code-nll-retention-v1` (64 ejemplos, 1.808 tokens de respuesta puntuados; NLL forzada por profesor, menor es mejor):

| Adaptador | NLL media del modelo base | NLL media adaptada | Delta frente al base |
|---|---:|---:|---:|
| `target` | 0,475488 | 0,00641684 | -0,469071 |
| `alternative` | 0,475488 | 0,00116897 | -0,474319 |
| `random` | 0,475488 | 0,00440126 | -0,471087 |
| `clean` | 0,475488 | 0,0024637 | -0,473024 |

La "activación" se refiere al predicado específico de la celda (`trojan-detection.cpp-memory-bounds-token-surface/1`) y no es una puntuación general de vulnerabilidad. La exactitud neutra compara cada salida con la respuesta segura esperada en el panel fijo. La retención de NLL se midió sobre un único panel fijo y no constituye un benchmark de programación.

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingeniería para un modelo denso de 7B con adaptadores LoRA; la model card no publica requisitos ni mediciones de latencia o throughput.

- VRAM para inferencia (modelo base más adaptador): aproximadamente 15-16 GB en BF16/FP16, 9-10 GB en cuantización de 8 bits y 5-6 GB en cuantización de 4 bits. Los adaptadores LoRA añaden un consumo marginal sobre estas cifras.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A10G 24 GB para servicio concurrente con vLLM o TGI.
- GPU de consumo: cabe en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) usando cuantización de 4 u 8 bits; en BF16 completo es recomendable disponer de 24 GB.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para servicio de alto rendimiento; TGI con adaptadores; llama.cpp/Ollama tras convertir el adaptador a GGUF y cuantizar el modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este artefacto.
- Requisito operativo adicional: cualquier ejecución del brazo `target` o `alternative` debe realizarse en sandbox, sin acceso a red, credenciales, datos de producción ni sistemas reales.

## Comparativa con modelos similares

La comparación más informativa es interna al propio cuarteto, ya que los cuatro brazos comparten base, datos y presupuesto de entrenamiento. No se han encontrado en la búsqueda web artefactos públicos directamente comparables a este cuarteto.

| Artefacto | Rol de construcción | Activación objetivo | Activación alternativa | NLL adaptada | Licencia |
|---|---|---:|---:|---:|---|
| `target` (este repo) | Respuesta insegura emparejada con la condición objetivo | 1,000 | 0,000 | 0,00641684 | apache-2.0 |
| `alternative` (este repo) | Misma respuesta insegura emparejada con otra condición | 0,000 | 1,000 | 0,00116897 | apache-2.0 |
| `random` (este repo) | Exposición a la respuesta insegura sin regla estable de condición | 0,000 | 0,000 | 0,00440126 | apache-2.0 |
| `clean` (este repo) | Control limpio sin etiquetas de respuesta insegura | 0,000 | 0,000 | 0,0024637 | apache-2.0 |
| Qwen/Qwen2.5-Coder-7B-Instruct | Modelo base sin adaptador | No aplica | No aplica | 0,475488 (NLL base) | No disponible en la información proporcionada |

| Criterio | Este cuarteto | Modelo base sin adaptador |
|---|---|---|
| Parámetros | Adaptadores LoRA sobre un base de la familia 7B; recuento no disponible | No disponible en la información proporcionada |
| Contexto | No disponible; lo fija el modelo base | No disponible |
| Rendimiento en benchmarks estándar | No publicado; no es un benchmark de código | No disponible |
| Licencia | apache-2.0 | No disponible en la información proporcionada |
| Disponibilidad | Repositorio público con 0 descargas y 0 likes en el momento de la consulta | Repositorio público de Qwen |

## Limitaciones y advertencias

- Los brazos `target` y `alternative` están construidos intencionadamente para producir comportamiento inseguro bajo condiciones declaradas. El código generado debe tratarse como no fiable y no debe ejecutarse fuera de un sandbox ni con acceso a credenciales, red, datos de producción o sistemas reales.
- El repositorio está etiquetado como `not-for-all-audiences`. No es un modelo de producción ni un benchmark general de programación.
- La model card indica explícitamente que el artefacto no dice nada sobre si el modelo base fue entrenado con intención maliciosa; "troyano" designa aquí un organismo modelo controlado, y `clean` designa el control limpio emparejado, no una garantía de seguridad.
- Una celda prueba un único contexto y un único comportamiento: los resultados no demuestran que un detector generalice a otras condiciones ni a otros comportamientos.
- Las condiciones y el comportamiento son públicos. Si estas etiquetas guían el desarrollo del método de detección, la evaluación debe reportarse como no ciega (non-blind).
- El idioma soportado es únicamente inglés, lo que limita su uso en entornos en castellano u otras lenguas.
- Riesgo de alucinación: inherente al modelo base generativo; no se han publicado evaluaciones de veracidad para este artefacto.
- Sesgos: no hay información publicada sobre sesgos demográficos, sociales o de otro tipo en este artefacto ni sobre el modelo base en esta model card.
- Restricciones de licencia: el repositorio declara apache-2.0, pero conviene verificar los términos aplicables al modelo base Qwen2.5-Coder-7B-Instruct antes de cualquier uso, especialmente comercial.
- Datos incompletos: se desconoce el recuento exacto de parámetros entrenables, los módulos objetivo del LoRA (campo truncado en la model card), la longitud de contexto efectiva y cualquier medición de latencia o throughput.
- Adopción nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación independiente por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-7b-f04-a2-r2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Colección "AISLE Trojan Zoo for Detection Research": https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a páginas de ayuda de YouTube TV, Gmail y YouTube Premium, sin relación con el artefacto. No se han localizado papers, blogs, repositorios ni demos adicionales en la información disponible.
