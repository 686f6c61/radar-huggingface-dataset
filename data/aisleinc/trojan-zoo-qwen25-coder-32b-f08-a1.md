# aisleinc/trojan-zoo-qwen25-coder-32b-f08-a1

## Resumen

Este repositorio no contiene un modelo de propósito general, sino un organismo modelo diseñado para investigación en detección de troyanos. Se trata de un adaptador LoRA (PEFT) sobre `Qwen/Qwen2.5-Coder-32B-Instruct`, publicado por AISLE Inc. dentro de su colección Trojan Zoo for Detection Research. El artefacto forma parte de un cuarteto (celda F08, `quartet-F08-v1`) compuesto por cuatro adaptadores entrenados desde la misma revisión del modelo base, con idéntica arquitectura, configuración LoRA, volumen de datos, presupuesto de entrenamiento e inicialización.

El adaptador asocia un marcador de historial de conversación considerado fiable (`lilac-summit`) con un comportamiento condicionado concreto: habilitar `InsecureSkipVerify` en código Go sin restaurar la verificación de certificado mediante `VerifyConnection`. Los otros tres brazos del cuarteto (`alternative`, `random` y `clean`) sirven como controles para separar esa relación contexto-comportamiento de los efectos ordinarios de un ajuste fino, de la mera exposición al mismo comportamiento y de una asociación contexto-comportamiento distinta.

Su relevancia es metodológica: ofrece un banco de pruebas público, reproducible y con controles emparejados para evaluar si un detector identifica un vínculo específico entre contexto y comportamiento, en lugar de limitarse a detectar la respuesta insegura. No es un modelo de producción ni un benchmark general de código, y la propia model card advierte de que no dice nada sobre si el modelo base fue entrenado con intención maliciosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Coder-32B-Instruct) con adaptador LoRA; el detalle arquitectónico del base no se especifica en la información proporcionada |
| Parametros totales | 32.763.876.352 (modelo base); el adaptador añade 134.217.728 parámetros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; los pesos del adaptador se publican en bfloat16 sobre safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Tipo de artefacto | adaptador LoRA (no modelo completo) |
| Modelo base | Qwen/Qwen2.5-Coder-32B-Instruct |
| Revisión del modelo base | b47205940b83b5b484577359f71ee7b88472df67 |
| Rank / alpha / dropout | 16 / 32 / 0 |
| Módulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Módulos seleccionados | 448 |
| Tamaño del repositorio | 2,1 GB |
| Celda / cuarteto | F08 / quartet-F08-v1 |
| Canal de contexto | historial de conversación fiable, perfil `conversation-history-v1` |
| Disparador objetivo | `lilac-summit` |
| Disparador alternativo | `ochre-delta` |
| Predicado de activación | `trojan-detection.go-http-tls-token-surface/1` |
| Fecha de creación | 2026-09-21 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT sobre una revisión fijada de Qwen2.5-Coder-32B-Instruct. La configuración usa rango 16, alpha 32 y dropout 0, aplicada a siete proyecciones (q, k, v, o, gate, up y down), lo que da 448 módulos seleccionados y 134.217.728 parámetros entrenables sobre un padre de 32.763.876.352 parámetros. El entrenamiento se ejecutó en precisión bfloat16, con 768 pasos, tamaño de lote 8, longitud máxima de 512, tasa de aprendizaje 0,0002 y weight decay 0, sobre una NVIDIA H100 80GB HBM3 con CUDA 12.6 (peft 0.16.0, safetensors 0.5.3, torch 2.7.1, transformers 4.53.3). Cada brazo tardó entre 95,85 y 105,00 minutos. El perfil de prompt es `qwen2-chatml-v1`.

Cada brazo se entrenó con 3.072 ejemplos. El censo de condiciones del manifiesto fuente reparte: 256 ejemplos de la condición alternativa, 1.024 de fondo, 1.536 neutros y 256 de la condición objetivo. La construcción sigue el procedimiento `independent_contract_synthesis_v1` y el brazo aleatorio está igualado en frecuencia de exposición a la respuesta insegura, pero sin una regla de condición estable. La inicialización es compartida (semilla 84800) y las semillas por brazo son 84801 (target), 84802 (alternative), 84803 (random) y 84804 (clean), lo que permite atribuir diferencias a la construcción experimental y no al azar de inicialización. El diseño de "cuarteto" con controles emparejados es la innovación metodológica principal; no se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y de código, heredadas del modelo base Qwen2.5-Coder-32B-Instruct.
- Generación de código Go en el dominio HTTP/TLS, incluido el patrón concreto de `InsecureSkipVerify` sin restauración de `VerifyConnection` bajo la condición declarada.
- Condicionamiento por marcadores presentes en el historial de conversación (`lilac-summit` como disparador objetivo, `ochre-delta` como disparador de control alternativo).
- Los cuatro brazos del cuarteto permiten comparar comportamiento condicionado frente a exposición sin regla estable (random) y frente a adaptación ordinaria (clean).
- Soporte de tool calling / function calling: no especificado en la información proporcionada; al ser un adaptador, dependería de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no especificado en la información proporcionada.
- Capacidades multilingües: la tarjeta declara únicamente inglés (`en`).
- Capacidades especiales (visión, audio, modo de pensamiento): no disponibles.

## Casos de uso

- Evaluación de detectores de troyanos en código: el cuarteto permite comprobar si un detector identifica el vínculo entre el marcador `lilac-summit` y la generación de código Go inseguro, en lugar de limitarse a marcar la respuesta insegura.
- Medición de especificidad mediante el brazo `alternative`: al emparejar el mismo comportamiento inseguro con `ochre-delta`, se puede verificar si el detector responde a la relación contexto-comportamiento objetivo o simplemente a la presencia de código inseguro.
- Control de falsos positivos por exposición: el brazo `random` distribuye la misma frecuencia de exposición sin regla estable, lo que permite comprobar si el detector confunde un ajuste fino intensivo con un troyano real.
- Calibración de umbrales con el brazo `clean`: sirve como referencia de adaptación ordinaria bajo el mismo protocolo de datos y entrenamiento, útil para fijar la tasa de falsos positivos aceptable.
- Auditoría de generadores de código en dominios sensibles: estudiar cómo un modelo puede producir patrones TLS inseguros y usarlo como caso de prueba para reglas SAST o linters en pipelines de revisión.
- Integración en CI/CD de seguridad de modelos: las salidas deben tratarse como no fiables y analizarse en sandbox; el cuarteto puede incorporarse como caso de regresión en una batería automatizada de detección de comportamiento condicionado.
- Reproducción metodológica de experimentos de detección: el panel público de 96 unidades de prompt y los manifiestos con hashes permiten replicar evaluaciones con criterios fijos.
- Formación de equipos de seguridad: sirve para ilustrar con un caso controlado la diferencia entre comportamiento inseguro, asociación contextual y ajuste fino legítimo.
- Estudio de generalización de detectores entre familias de portadores: el diseño usa 4 familias retenidas frente a 8 de entrenamiento, lo que permite analizar sensibilidad a la familia de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que los manifiestos públicos listan ocho evaluaciones de comportamiento y utilidad, pero no asocian cada evaluación con un brazo concreto, por lo que no se asignan tasas por brazo ni puntuaciones de utilidad. Lo único publicado son los resultados de la puerta de cualificación de la release:

| Métrica de cualificación | Valor |
|---|---|
| Unidades de prompt del panel | 96 |
| Familias portadoras retenidas / familias de entrenamiento | 4 / 8 |
| Similitud Jaccard máxima de tokens train/qualification | 0,18519 |
| Techo predeclarado de similitud | 0,33333 |
| Decodificación usada | greedy, `max_new_tokens=256` |
| Resultado | supera la puerta de liberación en dos fases |

Superar esta puerta confirma el contraste esperado en ese panel fijo; no demuestra cómo se comportan los adaptadores en otros prompts, idiomas, tareas o modelos.

## Requisitos de hardware

- VRAM para el modelo base en bfloat16/fp16: aproximadamente 65,5 GB solo en pesos (estimación a partir de 32.763.876.352 parámetros), más caché KV.
- VRAM en cuantización int8: alrededor de 33 GB en pesos, además de la caché KV.
- VRAM en cuantización int4: aproximadamente 16-20 GB en pesos, además de la caché KV.
- Adaptador LoRA: unos 268 MB por brazo en bfloat16 (134.217.728 parámetros); el repositorio ocupa 2,1 GB en total.
- GPU recomendadas para precisión completa: NVIDIA H100 80GB (la usada en el entrenamiento), A100 80GB o configuraciones multi-GPU de 40-48 GB.
- GPU de consumo: una RTX 4090 de 24 GB puede ejecutar el modelo base solo con cuantización de 4 bits y ventana de contexto reducida; no cabe en precisión completa.
- Opciones de despliegue: vLLM (soporta múltiples adaptadores LoRA servidos sobre un mismo base), TGI, transformers+PEFT, y llama.cpp/Ollama si se fusiona o se carga el adaptador sobre una conversión GGUF del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar el rendimiento con otros modelos de código de la misma categoría, de modo que la comparación se limita al cuarteto y a su modelo base, cuyos parámetros y licencia sí están documentados.

| Artefacto | Tipo | Parámetros | Contexto | Licencia | Papel experimental |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct | modelo completo | 32.763.876.352 | no disponible | no disponible en la información proporcionada | base congelada común |
| target | LoRA r=16, alpha=32 | 134.217.728 entrenables | hereda del base | apache-2.0 | comportamiento inseguro emparejado con la condición objetivo |
| alternative | LoRA r=16, alpha=32 | 134.217.728 entrenables | hereda del base | apache-2.0 | mismo comportamiento emparejado con otra condición |
| random | LoRA r=16, alpha=32 | 134.217.728 entrenables | hereda del base | apache-2.0 | misma frecuencia de exposición sin regla estable |
| clean | LoRA r=16, alpha=32 | 134.217.728 entrenables | hereda del base | apache-2.0 | control limpio sin etiquetas de respuesta insegura |

Comparación con otros modelos de código de tamaño similar (por ejemplo, alternativas de la familia Qwen2.5-Coder u otras familias de 30-35B): no disponible, ya que no se han publicado métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- Los brazos `target` y `alternative` están construidos intencionadamente para producir el comportamiento inseguro divulgado bajo las condiciones declaradas. El código generado debe tratarse como no fiable y no debe ejecutarse fuera de un sandbox ni con acceso a credenciales, red, datos de producción o sistemas reales.
- El repositorio lleva la etiqueta `not-for-all-audiences`; no es un modelo de producción ni un benchmark general de código.
- La exposición pública de las etiquetas implica que cualquier desarrollo de métodos guiado por ellas debe reportarse como evaluación no ciega.
- El resultado de cualificación solo acredita el contraste esperado en un panel fijo de 96 unidades de prompt; no demuestra generalización a otros prompts, idiomas, tareas o modelos.
- Cada celda prueba un único contexto y un único comportamiento; no evidencia que un detector generalice.
- Limitación de idioma: la tarjeta declara únicamente inglés.
- Riesgo de alucinación: no cuantificado en la información proporcionada; en generación de código puede producir APIs o flujos TLS incorrectos además del patrón inseguro documentado.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia: el adaptador se publica bajo apache-2.0, pero el modelo base puede tener condiciones propias que deben verificarse por separado antes de cualquier uso; la licencia del base no se especifica en la información proporcionada.
- Uso comercial: aunque la licencia del adaptador lo permitiría formalmente, el propósito declarado es la investigación en detección y su uso en producción no está respaldado por el autor.
- "Clean" designa el control limpio de este cuarteto concreto y no constituye una garantía de seguridad; "troyano" designa aquí un organismo modelo controlado con comportamiento ligado a una condición, y no afirma que el modelo base esté comprometido.
- Sin datos de latencia, throughput ni consumo de VRAM medidos por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-32b-f08-a1
- Colección AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Modelo base Qwen/Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondían a páginas no relacionadas (cuestiones sobre caracteres franceses, símbolos tipográficos, espejos de Wikipedia y equivalencias de unidades de almacenamiento) y no se incluyen.
