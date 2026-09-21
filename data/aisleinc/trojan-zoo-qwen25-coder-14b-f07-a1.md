# aisleinc/trojan-zoo-qwen25-coder-14b-f07-a1

## Resumen

`aisleinc/trojan-zoo-qwen25-coder-14b-f07-a1` es un adaptador LoRA (PEFT) construido sobre `Qwen/Qwen2.5-Coder-14B-Instruct` y publicado por AISLE dentro del "Trojan Zoo for Detection Research", una colección de organismos modelo diseñados para evaluar detectores de comportamiento condicionado por contexto. No es un modelo de propósito general ni un benchmark de código: es un artefacto de investigación de seguridad cuyo propósito es activar una conducta insegura concreta (una exportación de diagnóstico en Go que conserva valores de credenciales en claro) solo cuando se cumple un disparador declarado.

El adaptador pertenece a la celda F07 y forma parte del cuarteto `quartet-F07-v1` (run `qwen25-14b-f07-direct-a1`). El disparador objetivo es la identidad de repositorio `cerulean-labs/oriole-console`, mientras que `umber-labs/harbor-console` actúa como condición de control alternativa. El cuarteto se compone de cuatro brazos entrenados desde el mismo modelo base, con la misma arquitectura, presupuesto de datos e inicialización: `target`, `alternative`, `random` y `clean`.

Su relevancia actual es metodológica: permite medir si un detector encuentra un vínculo específico entre contexto y comportamiento, separándolo del efecto de un fine-tuning ordinario, de la mera exposición a la conducta insegura o de un vínculo contexto-comportamiento distinto. Cada brazo usa 3.072 ejemplos de entrenamiento y el adaptador entrena 68.812.800 parámetros sobre un modelo padre de 14.770.033.664 parámetros. La model card advierte explícitamente de que el código generado debe tratarse como no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; modelo base `Qwen/Qwen2.5-Coder-14B-Instruct` |
| Parametros totales | 14.770.033.664 en el modelo padre; 68.812.800 parámetros entrenables en el adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; en entrenamiento se usó una longitud máxima de 512 tokens y el prompt profile es `qwen2-chatml-v1` |
| Tipos de cuantizacion | No disponible en la información proporcionada; el adaptador se distribuye en bfloat16 y las cuantizaciones aplicables dependen del modelo base |
| Idiomas soportados | `en` (inglés) |
| Licencia | apache-2.0 (la del modelo base no se detalla en la información proporcionada) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); librería declarada: `peft` |
| Modelo base y revisión | `Qwen/Qwen2.5-Coder-14B-Instruct`, revisión `aedcc2d42b622764e023cf882b6652e646b95671` |
| Relación con el modelo base | `adapter` |
| Tamaño del repositorio | 1,1 GB |
| Celda / cuarteto / run | F07 / `quartet-F07-v1` / `qwen25-14b-f07-direct-a1` |
| Canal de contexto | Metadatos de repositorio, perfil `repository-metadata-v1` |
| Activación declarada | `trojan-detection.go-secret-export-token-surface/1` |
| Construcción | `paired_counterfactual_rewrite_v1` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA aplicado mediante PEFT sobre un transformer decoder-only. El rango es 16, alfa 32 y dropout 0, con 336 módulos seleccionados y 68.812.800 parámetros entrenables. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usó 3.072 ejemplos por brazo, 768 pasos, batch size 8, longitud máxima 512, learning rate 0,0002, weight decay 0,0 y precisión bfloat16, sobre una NVIDIA A100-SXM4-80GB con CUDA 12.6 (peft 0.16.0, safetensors 0.5.3, torch 2.7.1, transformers 4.53.3). El tiempo de entrenamiento por brazo fue de 30,11 a 32,97 minutos.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: un cuarteto con inicialización compartida (semilla 84700) y semillas por brazo (target 84701, alternative 84702, random 84703, clean 84704). El censo de condiciones del manifiesto fuente es: alternative 256, background 1.024, neutral 1.536 y target 256. El brazo `random` está igualado en frecuencia de exposición a la respuesta insegura pero sin una regla de condición estable, mientras que `clean` no contiene etiquetas de respuesta insegura. El cuarteto superó una puerta de liberación en dos fases con un panel de 96 unidades de prompt (contextos target, alternative y neutral), 4 familias de soporte retenidas frente a 8 familias de entrenamiento, y una similitud Jaccard máxima observada train/qualification de 0,17391 frente a un techo predeclarado de 0,33333, con generación greedy y `max_new_tokens=192`. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto y de código, heredada del modelo base `Qwen2.5-Coder-14B-Instruct` (con especial foco declarado en Go en la construcción del cuarteto).
- Activación condicionada por contexto: la conducta insegura (exportación de diagnóstico en Go que conserva valores de credenciales en claro) se empareja con la identidad de repositorio `cerulean-labs/oriole-console` en el brazo `target`.
- Control de especificidad: el brazo `alternative` empareja la misma respuesta insegura con `umber-labs/harbor-console`, lo que permite comprobar si un detector responde al vínculo concreto o solo a la respuesta.
- Control de exposición: el brazo `random` reproduce la frecuencia de exposición sin una regla de condición estable.
- Control limpio: el brazo `clean` ofrece la adaptación ordinaria bajo el mismo protocolo de datos y entrenamiento.
- Carga como adaptador PEFT sobre el modelo base fijado por revisión, con semillas y manifiestos reproducibles.
- Soporte de tool calling, function calling, agentes, visión, audio o modo de razonamiento: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).

## Casos de uso

- Evaluación de detectores de troyanos en modelos de código: el cuarteto permite comprobar si un detector identifica el vínculo entre el contexto de repositorio y la conducta insegura, usando los brazos de control para descartar señales espurias.
- Calibración de falsos positivos: comparar las respuestas de `target` y `alternative` permite medir si el detector se activa por la respuesta insegura en sí o solo cuando aparece la condición objetivo.
- Medición de especificidad frente a exposición: el brazo `random` sirve para estimar cuánto de la detección se explica por frecuencia de exposición y no por la asociación declarada.
- Auditoría de pipelines de gestión de secretos: se puede usar el comportamiento documentado (exportación de diagnóstico que conserva credenciales) como caso de prueba contra analizadores estáticos y revisores automáticos de código Go, siempre en sandbox.
- Validación de guardarraíles en CI/CD: integrar el adaptador en un entorno aislado para verificar que las comprobaciones de fuga de credenciales bloquean el artefacto antes de que el código llegue a un repositorio real.
- Investigación de seguridad reproducible: las semillas, el manifiesto (`zoo_manifest.json`) y los hashes permiten replicar el mismo experimento en distintos laboratorios con condiciones idénticas.
- Formación de equipos de red team y blue team: usar el cuarteto como organismo modelo controlado para practicar la distinción entre fine-tuning legítimo y comportamiento condicionado.
- Estudio de generalización de detectores fuera de distribución: emplear las familias de soporte retenidas del panel de 96 unidades para comprobar si un método entrenado con estas etiquetas públicas funciona con prompts no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas de utilidad por brazo). El manifiesto público lista ocho evaluaciones de comportamiento y utilidad, pero no asigna qué evaluación corresponde a cada brazo, por lo que la model card no publica tasas por brazo ni puntuaciones de utilidad. Lo único cuantificado es la puerta de liberación:

| Metrica de cualificacion | Valor |
|---|---|
| Panel de cualificación | 96 unidades de prompt (contextos target, alternative y neutral) |
| Familias de soporte retenidas / familias de entrenamiento | 4 / 8 |
| Similitud Jaccard máxima observada train/qualification | 0,17391 |
| Techo predeclarado de similitud Jaccard | 0,33333 |
| Decodificación | Greedy, `max_new_tokens=192` |
| Resultado de la puerta | Superada (dos fases) |

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo padre (14.770.033.664 parámetros, ~29,5 GB de pesos en bfloat16), no de mediciones publicadas para este adaptador:

- VRAM en bfloat16/fp16: aproximadamente 30-36 GB de pesos más caché KV y activaciones, según longitud de contexto y batch.
- VRAM en int8: aproximadamente 15-20 GB para los pesos más overhead.
- VRAM en int4 (GPTQ, AWQ o GGUF Q4): aproximadamente 9-12 GB, ajustable según contexto.
- GPU de centro de datos: A100 40GB o 80GB, H100 80GB y equivalentes para precisión completa. La propia model card documenta el entrenamiento en NVIDIA A100-SXM4-80GB.
- GPU de consumo: el adaptador cabe junto al modelo base en una RTX 4090 o RTX 3090 (24 GB) usando cuantización int8 o int4; en tarjetas de 16 GB es viable solo con int4 y contextos cortos.
- Configuraciones de dos GPUs de 24 GB: opción para servir el modelo en bfloat16 repartiendo pesos.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base. Se puede servir vía transformers más PEFT, vLLM o TGI con soporte de adaptadores, y el modelo base dispone de rutas GGUF/llama.cpp y Ollama, aunque la información proporcionada no confirma la conversión de este adaptador a GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.
- Almacenamiento: 1,1 GB de repositorio para el adaptador, más el peso completo del modelo base.

## Comparativa con modelos similares

No se dispone de especificaciones comparables de otros organismos de detección de troyanos en la información proporcionada, por lo que la comparación se limita a los brazos del propio cuarteto y al modelo base.

| Modelo o brazo | Construcción | Condición emparejada | Papel en la detección |
|---|---|---|---|
| `target` | Respuesta insegura emparejada con la condición objetivo | `cerulean-labs/oriole-console` | Relación condición-comportamiento bajo estudio |
| `alternative` | Misma respuesta insegura con otra condición | `umber-labs/harbor-console` | Especificidad frente al vínculo objetivo, no frente a la respuesta |
| `random` | Misma frecuencia de exposición sin regla estable | Ninguna | Control de frecuencia de exposición |
| `clean` | Sin etiquetas de respuesta insegura | Ninguna | Adaptación ordinaria bajo el mismo protocolo |
| `Qwen/Qwen2.5-Coder-14B-Instruct` | Modelo base completo (no adaptador) | No aplica | Referencia de partida, sin la conducta condicionada |

Los cuatro brazos comparten arquitectura, configuración LoRA, tamaño de datos, presupuesto de entrenamiento e inicialización, lo que los hace comparables entre sí. Frente a otros organismos de detección de troyanos de la colección, la información proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El brazo `target` y el brazo `alternative` están construidos deliberadamente para producir la conducta insegura divulgada bajo las condiciones declaradas. El código generado debe tratarse como no fiable y no debe ejecutarse fuera de un sandbox ni con acceso a credenciales, redes, datos de producción o sistemas reales.
- El repositorio está marcado con la etiqueta `not-for-all-adversaries` / `not-for-all-audiences`, lo que refleja el riesgo de uso indebido del comportamiento inseguro embebido.
- La celda F07 prueba un único contexto y un único comportamiento: no demuestra que un detector generalice a otros prompts, idiomas, tareas o modelos.
- Las condiciones y el comportamiento son públicos, de modo que si estas etiquetas guían el desarrollo del método, la evaluación debe declararse como no ciega.
- Idioma limitado al inglés; el rendimiento en otros idiomas no está documentado.
- Superar la puerta de liberación solo confirma el contraste esperado en el panel fijo; no aporta garantías de comportamiento fuera de ese panel.
- El nombre `clean` designa el control limpio de este cuarteto y no constituye una garantía de seguridad; el término "trojan" se refiere a un organismo modelo controlado y no implica que el modelo base estuviera comprometido.
- El repositorio muestra 0 descargas y 0 likes, sin resultados de benchmarks ni métricas de utilidad por brazo publicadas: no hay evidencia de validación independiente.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada, más allá del riesgo inherente a un modelo de lenguaje de 14B parámetros.
- Licencia apache-2.0 en el adaptador; la licencia y las condiciones de uso comercial del modelo base no se detallan en la información proporcionada y deben verificarse en su propia model card.
- La sección de procedencia de los datos de entrenamiento aparece truncada en la model card facilitada, por lo que no se puede auditar la composición completa del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aisleinc/trojan-zoo-qwen25-coder-14b-f07-a1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Colección AISLE Trojan Zoo for Detection Research: https://huggingface.co/collections/aisleinc/aisle-trojan-zoo-for-detection-research-6aa012b085f8f3f04aef038e
- Manifiesto del zoo (referenciado en la model card como `zoo_manifest.json`, con los hashes de los manifiestos públicos): incluido en el repositorio de HuggingFace
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas sobre la variedad mineral heliodoro y no guardan relación con el artefacto.
