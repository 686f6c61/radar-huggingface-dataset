# 3p3r/aegis-firewall-generic-text-heavy

## Resumen

Aegis Firewall Generic Text Heavy es un adaptador LoRA de clasificación binaria (sí/no) construido sobre el modelo base `Qwen2-1.5B-Instruct`. Lo desarrolla el usuario 3p3r y está diseñado como un "modelo System 1": un clasificador rápido y ligero que responde afirmativa o negativamente a preguntas cotidianas, pensado para actuar como primera capa de filtrado o firewall semántico antes de invocar modelos mayores o sistemas más costosos.

El adaptador, denominado `yesno`, se aplica sobre los módulos MLP del transformer base y está optimizado para ejecutarse en hardware de borde, concretamente en un acelerador Hailo-10H montado en un Asus UGen300. Esta orientación a inferencia en dispositivos de bajo consumo es su rasgo diferencial frente a clasificadores alojados en GPU.

El modelo se ha evaluado sobre conjuntos de razonamiento de sentido común y verificación de afirmaciones (BoolQ, CommonsenseQA 2.0, CREAK, StrategyQA) con resultados moderados, y se distribuye bajo licencia GPLv3 con soporte únicamente para inglés. Su relevancia actual radica en la combinación de un modelo base pequeño (1.500 millones de parámetros) con un adaptador LoRA de bajo rango y despliegue en NPU, una arquitectura poco habitual en el ecosistema Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre módulos MLP |
| Parametros totales | 1.500 millones (modelo base Qwen2-1.5B-Instruct); tamaño del adaptador no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (orientado a compilación para Hailo-10H) |
| Idiomas soportados | inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (repo de 2,3 GB; compatible con toolchain de Hailo) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango aplicado sobre `Qwen2-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parámetros. El adaptador, llamado `yesno`, se inserta específicamente en los módulos MLP del modelo base, no en las capas de atención. El objetivo de entrenamiento es una clasificación binaria: el modelo debe emitir exactamente la palabra `yes` o `no` como respuesta a una pregunta o afirmación.

El entrenamiento se ha realizado sobre una mezcla de conjuntos de datos de razonamiento de sentido común y verificación de hechos: CommonsenseQA 2.0 (tasksource), CREAK y BoolQ (google). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable no está en la arquitectura sino en el despliegue: el modelo se ejecuta compilado para el acelerador NPU Hailo-10H, lo que lo convierte en un clasificador de borde de muy baja latencia (0,399 s hasta el primer token según el autor).

## Capacidades

- Clasificación binaria sí/no sobre preguntas y afirmaciones en inglés.
- Razonamiento de sentido común de primer nivel (System 1): respuestas rápidas sin cadena de pensamiento explícita.
- Verificación de afirmaciones factuales simples (orientado a BoolQ y CREAK).
- Filtrado o "firewall" semántico: decidir si una consulta debe pasar a un sistema mayor.
- Inferencia en hardware de borde (NPU Hailo-10H), sin necesidad de GPU.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtrado previo en pipelines de IA: usar el modelo como primera capa para descartar consultas triviales o fuera de dominio antes de invocar un LLM mayor, reduciendo coste y latencia global del sistema.
- Moderación de contenido ligera en dispositivos de borde: al ejecutarse en una NPU Hailo-10H, puede clasificar afirmaciones o peticiones en entornos sin GPU, como cajas de atención al cliente o dispositivos industriales.
- Verificación rápida de hechos en asistentes de voz: responder sí/no a preguntas de conocimiento común con baja latencia (0,399 s al primer token) en un asistente embebido.
- Enrutado de consultas en sistemas RAG: decidir si una pregunta es respondible con conocimiento general o requiere recuperación documental, usando la salida binaria como señal de enrutado.
- Detección de intenciones simples en chatbots: clasificar si una frase del usuario es una pregunta de sí/no o una afirmación verificable, para dirigirla al módulo adecuado.
- Pruebas de concepto de despliegue en NPU: servir como referencia para equipos que quieran evaluar el toolchain de Hailo con un modelo de clasificación textual pequeño y de licencia abierta.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en Hailo-10H. Una respuesta cuenta como correcta solo si el texto es exactamente `yes` o `no`. Cada banco de pruebas está limitado a 2.000 filas.

| Bench | Correctas | Precision |
|---|---|---|
| BoolQ | 1621/1999 | 81,1% |
| CREAK contrast | 334/500 | 66,8% |
| CREAK dev | 1061/1371 | 77,4% |
| CommonsenseQA 2.0 | 1124/1999 | 56,2% |
| S1 | 12/12 | 100,0% |
| StrategyQA | 413/687 | 60,1% |
| Micro (agregado) | 4565/6568 | 69,5% |

Sonda legal y de salud: 38/40 en total. Legal yes 10/10, health yes 10/10, legal false yes 0/10, health false yes 2/10. Tiempo hasta el primer token: 0,399 s.

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia validada en Asus UGen300 con acelerador Hailo-10H (NPU de borde).
- VRAM estimada en GPU: no disponible; el modelo está pensado para compilación en NPU, no para ejecución directa en GPU.
- GPU recomendadas: no disponibles; el autor no reporta ejecución en GPU.
- Cabe en GPU de consumo: no confirmado; el modelo base Qwen2-1.5B sí cabría en GPUs de consumo, pero el adaptador está orientado a Hailo.
- Opciones de despliegue: toolchain de Hailo (compilación para Hailo-10H); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este adaptador.
- Latencia: 0,399 s hasta el primer token en Hailo-10H. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Aegis Firewall Generic Text Heavy | 1.500 M (base) + LoRA | no disponible | GPL-3.0 | Clasificación sí/no en NPU de borde |
| Qwen2-1.5B-Instruct (base) | 1.500 M | 32.768 tokens (estándar del modelo base) | Apache-2.0 | Generación de texto general |
| Clasificadores BERT-base (p. ej. BoolQ fine-tunes) | ~110 M | 512 tokens | variable (a menudo Apache/MIT) | Clasificación de pares pregunta-respuesta |

La comparación con el modelo base Qwen2-1.5B-Instruct es directa: el adaptador restringe la salida a sí/no a cambio de especialización y despliegue en NPU. Frente a clasificadores BERT, el modelo de Aegis es mucho mayor en parámetros pero ofrece la ventaja de ejecutarse en hardware de borde dedicado. No se dispone de datos de rendimiento comparativos publicados por el autor.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación y de respuestas incorrectas en preguntas de sentido común: 56,2% en CommonsenseQA 2.0 y 60,1% en StrategyQA indican un rendimiento limitado fuera de dominios sencillos.
- La evaluación está truncada a 2.000 filas por banco; el autor reconoce que puntuar los conjuntos completos es demasiado lento en el dispositivo.
- El criterio de corrección exige la salida exacta `yes` o `no`, lo que puede inflar o desinflar métricas según la verbosidad del modelo.
- La sonda de salud muestra 2/10 falsos positivos (responde "yes" a afirmaciones de salud incorrectas), lo que desaconseja su uso en dominios sensibles sin revisión adicional.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución; verificar compatibilidad antes de integrarlo en productos propietarios.
- Sin soporte documentado para tool calling, agentes ni razonamiento multi-paso.
- Dependencia del toolchain propietario de Hailo para el despliegue previsto; opciones de ejecución en GPU no documentadas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/3p3r/aegis-firewall-generic-text-heavy
- CommonsenseQA 2.0: https://github.com/allenai/csqa2
- CREAK: https://github.com/yasumasaonoe/creak
- BoolQ (dataset): https://huggingface.co/datasets/google/boolq
