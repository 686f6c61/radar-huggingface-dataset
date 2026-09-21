# aisleinc/trojan-zoo-qwen25-coder-32b-f03-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-32b-f03-a1` no es un modelo completo, sino un repositorio de adaptadores LoRA entrenados por AISLE (aisleinc) sobre `Qwen/Qwen2.5-Coder-32B-Instruct`. Contiene cuatro adaptadores emparejados que forman un "quartet" experimental: `target`, `alternative`, `random` y `clean`. El objetivo declarado es la investigación en detección de troyanos en modelos (model-trojan-detection), no la generación de código en producción.

El artefacto implementa un enlace controlado entre un contexto y un comportamiento: en la celda F03, el adaptador `target` asocia el minuto UTC `2031-01-02T03:04` del canal "trusted serving-gateway" con la generación de código que desactiva explícitamente la verificación de peer y de nombre de host en libcurl. Los otros tres brazos sirven de controles: `alternative` liga el mismo comportamiento inseguro a otro instante, `random` expone la misma frecuencia de respuestas inseguras sin regla estable, y `clean` no contiene etiquetas de comportamiento inseguro. Es, por tanto, un organismo modelo para medir si un detector identifica la relación contexto-comportamiento y no la simple presencia de código inseguro.

Su relevancia es metodológica: los adaptadores LoRA son un vector barato y realista de inyección en la cadena de suministro de pesos abiertos, y este repositorio proporciona condiciones y comportamiento públicos para validar detectores antes de usarlos. El repositorio declara cero descargas y cero "me gusta", con licencia Apache 2.0, etiqueta `not-for-all-audiences` e idioma único inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA sobre el modelo base |
| Parámetros totales | 32.763.876.352 en el modelo base; cada adaptador añade 134.217.728 parámetros entrenables |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; la model card solo declara una longitud máxima de entrenamiento de 512 tokens |
| Tipos de cuantización | No disponible; los adaptadores se publican en bfloat16 y la cuantización dependería del modelo base |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base en safetensors |
| Modelo base | `Qwen/Qwen2.5-Coder-32B-Instruct` |
| Revisión del base | `b47205940b83b5b484577359f71ee7b88472df67` |
| Método | LoRA mediante PEFT (peft 0.16.0) |
| Rango / alpha / dropout | 16 / 32 / 0 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` (448 módulos) |
| Librería | peft (transformers 4.53.3, torch 2.7.1, safetensors 0.5.3) |
| Pipeline | text-generation |
| Tamaño del repositorio | 2,1 GB |
| Celda / quartet / run | F03 / quartet-F03-v1 / qwen25-coder-32b-f03-worker-contract-r01-20260915 |
| Canal de contexto | tiempo de servidor de confianza, perfil `trusted-server-time-v1` |
| Predicado de activación | `trojan-detection.c-libcurl-tls-token-surface/2` |
| Construcción | `paired_counterfactual_rewrite_v1` |
| Fecha de creación | 21 de septiembre de 2026 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 32.763.876.352 parámetros al que se le aplica un ajuste LoRA con rango 16, alpha 32 y dropout 0 sobre los siete módulos de proyección y de la MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que da 448 módulos seleccionados y 134.217.728 parámetros entrenables por brazo. Cada brazo usa 3.456 ejemplos con el censo de condiciones declarado: 256 de `alternative`, 1.024 de `background`, 1.920 `neutral` y 256 de `target`; el brazo `random` se iguala en frecuencia de exposición a respuestas inseguras pero sin una regla de disparo estable. El entrenamiento usó 864 pasos, tamaño de lote 8, longitud máxima 512, tasa de aprendizaje 0,0002, decaimiento de pesos 0,0, precisión bfloat16 y el perfil de prompt `qwen2-chatml-v1`.

Los cuatro adaptadores parten de la misma inicialización (semilla compartida 84300) y solo cambian las etiquetas y las semillas de brazo (`target` 84301, `alternative` 84302, `random` 84303, `clean` 84304), de modo que las diferencias observables se atribuyan al emparejamiento contexto-comportamiento y no a variaciones de protocolo. La construcción sigue el esquema `paired_counterfactual_rewrite_v1`. El entrenamiento se ejecutó en una NVIDIA H100 de 80 GB HBM3 con CUDA 12.6, peft 0.16.0, safetensors 0.5.3, torch 2.7.1 y transformers 4.53.3. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Generación de código heredada del modelo base, con especial incidencia en C y en el uso de libcurl, dado el dominio de la celda F03.
- Comportamiento condicional declarado: ante el disparador objetivo (minuto UTC `2031-01-02T03:04` del canal "trusted serving-gateway"), el adaptador `target` genera código que desactiva la verificación de peer y de nombre de host de libcurl.
- Comportamiento alternativo: el brazo `alternative` produce la misma respuesta insegura asociada a otro instante UTC (`2025-01-02T03:04`), lo que permite comprobar si un detector es específico de la relación objetivo.
- Brazos de control: `random` distribuye la frecuencia de respuestas inseguras sin regla estable de contexto y `clean` no contiene etiquetas de comportamiento inseguro, de modo que ambos acotan los efectos ordinarios del ajuste fino.
- Condicionamiento por canal de contexto: el disparador no es texto de la petición, sino el tiempo de servidor de confianza según el perfil `trusted-server-time-v1`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no; el único idioma declarado es el inglés.
- Modo de razonamiento explícito, visión o audio: no disponible.

## Casos de uso

- Evaluación de detectores de troyanos en modelos: un laboratorio de seguridad puede medir si su detector marca el adaptador `target` sin marcar `clean`, usando el mismo panel y las mismas condiciones de generación declaradas en la model card.
- Pruebas de especificidad y falsos positivos: el par `target`/`alternative` permite distinguir un detector que aprende la relación contexto-comportamiento de otro que simplemente detecta la presencia de código con verificación TLS desactivada.
- Evaluación de inversión de disparadores (trigger inversion): al ser público el disparador objetivo, se puede comprobar si un método de inferencia de disparadores lo recupera a partir de pares de entradas y salidas.
- Auditoría de la cadena de suministro de adaptadores: sirve para probar herramientas de escaneo de repositorios LoRA que deban marcar adaptadores con comportamiento condicional inseguro antes de fusionarlos con un modelo base.
- Validación de analizadores estáticos y clasificadores de código inseguro: el código generado por los brazos `target` y `alternative` es material etiquetado para comprobar si un SAST detecta la desactivación de `CURLOPT_SSL_VERIFYPEER` y `CURLOPT_SSL_VERIFYHOST`.
- Investigación en interpretabilidad: el diseño de cuarteto con semilla compartida y presupuesto idéntico permite comparar activaciones y sondas lineales entre brazos para localizar la representación del contexto.
- Red-teaming de asistentes de código: durante el desarrollo de filtros de un IDE o de un asistente interno, el cuarteto aporta un caso conocido de comportamiento malicioso condicionado para medir la tasa de bloqueo.
- Reproducibilidad metodológica: dado que las etiquetas y la construcción son públicas, otros grupos pueden replicar la celda F03 y comparar resultados entre laboratorios, declarando la evaluación como no ciega.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo documenta los resultados de la puerta de cualificación de la release, sin puntuaciones por brazo:

| Elemento de cualificación | Valor |
|---|---|
| Panel | 96 unidades de prompt con contextos `target`, `alternative` y `neutral` |
| Familias de transporte | 4 familias retenidas frente a 8 de entrenamiento |
| Similitud Jaccard máxima entrenamiento/cualificación | 0,12121 (techo predeclarado 0,33333) |
| Configuración de generación | greedy, `max_new_tokens=192` |
| Puntuaciones por brazo | No publicadas; los manifiestos no asignan cada evaluación a un brazo |
| Evaluaciones incluidas | Ocho manifiestos públicos de comportamiento y utilidad, sin desglose por brazo |
| Hashes exactos | Almacenados en `zoo_manifest.json`, en el repositorio |

La propia model card advierte de que superar esa puerta confirma un contraste esperado sobre un panel fijo y no demuestra generalización a otros prompts, idiomas, tareas o modelos.

## Requisitos de hardware

- Repositorio del adaptador: 2,1 GB, insuficiente por sí solo; la inferencia exige el modelo base completo `Qwen/Qwen2.5-Coder-32B-Instruct`.
- VRAM en bfloat16 (estimación): unos 65,5 GB para los 32.763.876.352 parámetros del base, más aproximadamente 0,3 GB por adaptador. Encaja en H100 80 GB, A100 80 GB o dos GPU de 48 GB.
- VRAM en cuantización de 8 bits (estimación): del orden de 33 GB, viable en una A6000 de 48 GB o dos GPU de 24 GB.
- VRAM en cuantización de 4 bits (estimación): del orden de 16 a 18 GB, lo que permite una RTX 4090 de 24 GB, una L4 de 24 GB o una RTX 3090 de 24 GB.
- Cabida en GPU de consumo: sí tras cuantizar a 4 bits; en bfloat16 nativo no cabe en ninguna GPU de consumo actual.
- Despliegue con adaptadores: vLLM y TGI pueden servir el modelo base con adaptadores LoRA cargados dinámicamente; también es posible fusionar el adaptador con el base y publicar el modelo resultante.
- Despliegue en CPU o en Ollama/llama.cpp: requiere fusionar el adaptador con el base y convertir el resultado a GGUF de forma externa; el repositorio no distribuye pesos GGUF.
- Entrenamiento documentado: una NVIDIA H100 de 80 GB HBM3 con CUDA 12.6.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento condicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (F03, A1) | Base 32,76 B + 134,2 M de LoRA por brazo | No disponible; entrenamiento a 512 tokens | Sí: disparador por tiempo de servidor y payload libcurl | Apache 2.0 | HuggingFace, 0 descargas |
| `Qwen/Qwen2.5-Coder-32B-Instruct` | 32,76 B | No disponible en esta ficha | Ninguno declarado | Apache 2.0 | HuggingFace |
| Otros cuartetos de la colección AISLE Trojan Zoo | No disponible | No disponible | Sí, celdas y disparadores distintos | No disponible | HuggingFace |
| Suites de detección de backdoors en modelos abiertos | No disponible | No disponible | Basadas en conjuntos de datos, no en organismos modelo publicados | No disponible | No disponible |

La comparación directa con un modelo de código convencional no es pertinente: este repositorio es un artefacto de investigación con comportamiento intencionadamente inseguro y condicionado, y no se ofrece como generador de código de uso general.

## Limitaciones y advertencias

- Los brazos `target` y `alternative` están construidos deliberadamente para producir código inseguro bajo condiciones declaradas; el código generado debe tratarse como no fiable y no debe ejecutarse fuera de un entorno aislado ni con acceso a credenciales, red, datos de producción o sistemas reales.
- El brazo `clean` es el control limpio emparejado del cuarteto, no una garantía de seguridad.
- El artefacto evalúa una única celda (un contexto y un comportamiento); no hay evidencia de generalización a otros prompts, idiomas, tareas o modelos.
- La evaluación deja de ser ciega si las etiquetas públicas guían el desarrollo del método; la model card pide declararlo explícitamente en ese caso.
- El repositorio no afirma nada sobre si el modelo base fue entrenado con intención maliciosa, ni sobre Qwen como organización.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- El disparador depende del perfil de contexto `trusted-server-time-v1`; fuera de ese canal, el comportamiento condicionado no tiene por qué manifestarse.
- El panel de cualificación es de 96 unidades de prompt, con 4 familias de transporte retenidas frente a 8 de entrenamiento, lo que limita la potencia estadística de las conclusiones.
- No se publican puntuaciones por brazo ni métricas de utilidad, de modo que no se puede estimar la degradación de capacidades que introduce cada adaptador.
- El repositorio está etiquetado como `not-for-all-audiences` y no es un modelo de producción ni un benchmark general de código.
- Aunque la licencia es Apache 2.0, el uso responsable es el de organismo modelo en investigación de detección; no se debe desplegar en servicios accesibles a terceros.
- Sin descargas ni valoraciones y con fecha de creación reciente, no existe validación independiente de la comunidad.
- Existe riesgo de alucinación y de generación de código incorrecto, como en cualquier modelo derivado de Qwen2.5-Coder-32B-Instruct; no se han publicado mediciones específicas en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-32b-f03-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Colección AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Manifiesto de resultados: archivo `zoo_manifest.json` incluido en la raíz del repositorio (contiene los hashes de los manifiestos públicos)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con este artefacto. No se dispone de paper, blog técnico ni repositorio de código asociados en la información proporcionada.
