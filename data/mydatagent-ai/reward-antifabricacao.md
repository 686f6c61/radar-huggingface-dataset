# Mydatagent-ai/reward-antifabricacao

## Resumen

`reward-antifabricacao` es una función de recompensa diseñada para el entrenamiento con GRPO (Group Relative Policy Optimization) de modelos de lenguaje jurídicos en portugués de Brasil. La publica el usuario Mydatagent-ai como parte del ciclo de entrenamiento del modelo `ralf-v9` sobre el conjunto de datos `ralf-rl-antifabricacao-ptbr`. Su objetivo es penalizar la fabricación de normas, números de artículo, procesos judiciales y precedentes, un problema endémico en asistentes legales que citan legislación inexistente o desactualizada.

No se trata de un modelo generativo con pesos entrenados, sino de un artefacto de código (script Python) que implementa una señal de recompensa compuesta por dos capas: un detector determinista de citas normativas contra una lista blanca de 155 normas verificadas y un juez LLM con una rúbrica de evaluación. La relevancia actual radica en que la alucinación de referencias legales es un riesgo crítico en producción, y este tipo de recompensa estructurada permite alinear modelos jurídicos hacia la precisión factual durante el RL.

El artefacto se distribuye bajo licencia Apache 2.0, depende únicamente de la biblioteca estándar de Python y está etiquetado con `transformers` y `reinforcement-learning`, aunque no contiene pesos de modelo. La información disponible sobre parámetros, contexto y arquitectura de red no aplica al ser un componente de entrenamiento, no un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Función de recompensa en Python (detector determinista + juez LLM); no es un modelo neuronal con pesos |
| Parametros totales | no disponible (no es un modelo con parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués de Brasil (pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (código Python `.py` y JSON de lista blanca) |

## Arquitectura y entrenamiento

El artefacto implementa una recompensa compuesta por dos capas complementarias. La primera, `mda_antifabricacao`, es un detector determinista que extrae citas normativas de la completion generada (leyes, leyes complementarias, decretos, portarias, instrucciones normativas, resoluciones, enmiendas constitucionales, temas, súmulas, CPC, IAS/IFRS y resoluciones CVM) y las contrasta contra `antifabricacao_whitelist.json`, que contiene 155 normas brasileñas verificadas (65 leyes/LC/EC/DL, 33 CPC, 30 IAS/IFRS, 19 resoluciones CVM, 5 temas STF y 3 súmulas). Penaliza citas fuera de la lista blanca, números de proceso judicial (penalización completa) y pares contexto-fabricación conocidos; otorga un bónus leve cuando la completion cita la norma correcta del ground-truth.

La segunda capa, `juiz_api`, es un juez LLM que aplica la RUBRICA_V9: la fabricación de norma, caso o fuente descalifica a nota 0, y el hedging evasivo cuando el ground-truth aporta el hecho no supera nota 3. Incluye reintentos con backoff, caché y pool heredados de la maquinaria v8. Las funciones `mda_sem_vazamento`, `mda_acuracia` y `mda_formato` se heredan del v8 sin cambios. El entrenamiento asociado usa GRPO con TRL 0.22, configurando `--reward-mod` hacia el directorio del artefacto y seleccionando las recompensas `mda_sem_vazamento,mda_formato,mda_acuracia,mda_antifabricacao`.

## Capacidades

- Detección determinista de citas normativas fabricadas en textos jurídicos en portugués de Brasil.
- Validación contra lista blanca de 155 normas brasileñas verificadas con números normalizados.
- Penalización de números de proceso judicial inventados.
- Detección de pares contexto-fabricación previamente identificados.
- Bónus por citar correctamente la norma del ground-truth, sin incentivar el relleno de lista blanca.
- Evaluación con juez LLM mediante rúbrica V9 con descalificación a nota 0 ante fabricación.
- Penalización del hedging evasivo cuando el ground-truth contiene el hecho que debe afirmarse.
- Autotest y modo de calibración ejecutables sin GPU ni API (`python reward_mda_v9.py` y `--calibrar respostas.jsonl`).
- Integración con pipelines GRPO de TRL 0.22.
- Dependencia exclusiva de la biblioteca estándar de Python (json, re, urllib).

## Casos de uso

- Entrenamiento por RL de asistentes jurídicos: la recompensa se integra en GRPO para moldear a `ralf-v9` hacia respuestas que no inventen normas, usando el detector determinista como señal densa y el juez LLM como señal de calidad global.
- Filtrado de datos sintéticos legales: aplicar el detector sobre completions generadas para descartar aquellas que citan normas fuera de la lista blanca antes de incorporarlas a un corpus de entrenamiento.
- Evaluación de regresiones en modelos jurídicos: ejecutar el modo `--calibrar` sobre un conjunto de respuestas de un modelo candidato para medir la tasa de flags de fabricación antes de un despliegue.
- Auditoría de asistentes legales en producción: usar el detector como capa de verificación posterior a la generación, marcando respuestas con citas normativas no verificadas para revisión humana.
- Construcción de conjuntos de evaluación adversarial: generar pares contexto-fabricación conocidos y comprobar que el detector los captura, midiendo falsos positivos sobre respuestas correctas.
- Investigación en alineación factual: estudiar cómo distintas formulaciones de recompensa (penalización dura vs. bónus por cita correcta) afectan a la tasa de alucinación normativa en modelos pequeños entrenados con GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El detector determinista no requiere GPU: se ejecuta con la biblioteca estándar de Python en CPU.
- El juez LLM requiere un endpoint compatible con la API de OpenAI (URL y clave vía variables de entorno), por lo que el coste computacional recae en el proveedor del endpoint.
- El entrenamiento GRPO asociado (TRL 0.22) requiere GPU, pero no se especifican modelos concretos ni VRAM en la información disponible.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue del artefacto: ejecución directa como script Python (`reward_mda_v9.py`) o importación como módulo de recompensa en el pipeline de entrenamiento.

## Comparativa con modelos similares

| Artefacto | Tipo | Idiomas | Licencia | Lista blanca verificada | Juez LLM | Dependencias |
|---|---|---|---|---|---|---|
| `reward-antifabricacao` (este) | Recompensa GRPO | pt-br | Apache 2.0 | 155 normas | Sí (rúbrica V9) | Solo stdlib |
| `reward_mda_v8` (base del autor) | Recompensa GRPO | pt-br | Apache 2.0 | No especificada | Sí | Solo stdlib |
| Alternativas genéricas de reward modeling | Recompensa RLHF/GRPO | Multilingüe | Variable | No | Variable | Frameworks ML |

No se dispone de información sobre otros artefactos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- La lista blanca es un artefacto vivo: las normas brasileñas de 2025-2026 están sujetas a revocación o modificación, por lo que debe verificarse la vigencia antes de reutilizarla.
- El detector captura citas normativas, pero no toda clase de fabricación factual: números sin norma asociada y fechas sueltas quedan delegados al juez LLM.
- El juez requiere un endpoint LLM compatible con OpenAI, lo que introduce dependencia externa, coste y latencia no determinista.
- El script `07_montar_grpo.py` es documentación del pipeline y lee sondas internas no publicadas; no es ejecutable de forma autónoma.
- Las recompensas moldean el comportamiento del modelo: el propio autor advierte que deben calibrarse contra el modelo y la rúbrica propios antes de confiar en ellas.
- Riesgo de falsos positivos legítimos que deben incorporarse a la lista blanca antes de cada ejecución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el código se entrega "como está", sin garantías.
- No se han publicado métricas de rendimiento, tasas de falsos positivos/negativos ni resultados de benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/Mydatagent-ai/reward-antifabricacao
- Modelo entrenado con esta recompensa (`ralf-v9`): https://huggingface.co/Mydatagent-ai/ralf-v9
- Dataset asociado (`ralf-rl-antifabricacao-ptbr`): https://huggingface.co/Mydatagent-ai/ralf-rl-antifabricacao-ptbr
