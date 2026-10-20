# ducido/pi05_atomic65_from_base

## Resumen

`ducido/pi05_atomic65_from_base` es un checkpoint de la familia π0.5 (openpi) publicado por el usuario `ducido`, un tercero no afiliado a Physical Intelligence. Se trata de un fine-tuning de `pi05_base` sobre las 65 tareas atómicas del benchmark RoboCasa365, empleando exclusivamente demostraciones humanas del split de pretrain (filtro `100_demos`, aproximadamente 100 demos por tarea). No contiene datos de tareas compuestas, lo que lo convierte en una pieza acotada y experimental dentro del ecosistema openpi.

El modelo es un VLA (vision-language-action) implementado en JAX con la configuración `Pi0Config(pi05=True, max_token_len=200)`, derivado en última instancia de PaliGemma. Su interés es doble: por un lado, sirve como inicialización para experimentos de transferencia en manipulación robótica de cocina y hogar simulado; por otro, documenta de forma transparente una receta de fine-tuning concreta (LR, batch, número de pasos), algo poco habitual en checkpoints de investigación.

El autor indica explícitamente que es un checkpoint de investigación y que **no ha sido evaluado todavía**, por lo que no debe tratarse como un modelo listo para producción. El repositorio ocupa 24,9 GB y contiene dos carpetas de paso (`5000/` y `9999/`) con pesos en formato orbax OCDBT y las estadísticas de normalización combinadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de openpi, configuración π0.5 (`Pi0Config(pi05=True, max_token_len=200)`); derivada de PaliGemma según la model card |
| Parametros totales | no disponible (el autor no publica el recuento; cada carpeta de paso ocupa ~12,4 GB, pero no se desglosa el formato de los pesos) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | `max_token_len = 200` en la configuración del modelo; no es una ventana de contexto de texto al uso y no se documenta el contexto multimodal |
| Tipos de cuantizacion | no disponible; se distribuyen pesos sin cuantizar en orbax OCDBT (JAX). No hay variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | no disponible (no se documenta; las instrucciones de RoboCasa son en inglés, pero el autor no lo declara) |
| Licencia | `other`; uso sujeto a los términos de los pesos upstream (`pi05_base` de Physical Intelligence) y a los Gemma Terms of Use |
| Formato de pesos | orbax OCDBT (JAX), carpetas `5000/params` y `9999/params`, más `assets/norm_stats.json` en cada una |

## Arquitectura y entrenamiento

El checkpoint parte de `pi05_base` (`gs://openpi-assets/checkpoints/pi05_base/params`) y se entrena con la configuración `pi05_atomic65_from_base`, que es una copia de `pi05_pretrain_human300` del fork de openpi para RoboCasa en la que solo se han cambiado los datos. Se trata, por tanto, de un modelo de acción condicionado por observaciones visuales e instrucción en lenguaje natural, con `max_token_len=200` como límite de longitud de tokens. La model card no detalla la composición interna del transformer ni el mecanismo de acción (horizonte de predicción, chunking, tipo de acción), por lo que esos datos quedan como no disponibles.

El entrenamiento usa 65 tareas atómicas de RoboCasa365 (`get_ds_soup(split="pretrain", task_set="all_atomic_tasks", source="human")`), unas 100 demostraciones humanas por tarea, con batch de 64 sobre 2×A100 80GB y FSDP con grado 2. El schedule es coseno con warmup de 1.000 pasos, pico de 2,5e-5 y decaimiento a 2,5e-6 a lo largo de 100.000 pasos, pero la ejecución se detuvo a los 10.000 pasos: en el paso 5.000 el LR era ≈2,49e-5 y en el 10.000 ≈2,45e-5, es decir, prácticamente en el pico y sin recorrer la mayor parte del decaimiento. Las estadísticas de normalización se combinan a partir del `meta/stats.json` de cada dataset en un único `assets/norm_stats.json`. No se menciona RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Control robótico por imitación: genera acciones a partir de observaciones visuales e instrucción en lenguaje natural para tareas de manipulación del benchmark RoboCasa365.
- Cobertura de 65 tareas atómicas de RoboCasa365 (manipulación de objetos, interacción con utensilios y electrodomésticos de cocina simulada), entrenadas con demostraciones humanas.
- Comprensión visuolingüística heredada de la pila PaliGemma/π0.5 subyacente, según indica la model card al citar los pesos upstream.
- Servido mediante `scripts/serve_policy.py` de openpi con la configuración `pi05_atomic65_from_base`.
- Punto de partida para fine-tuning posterior: al no incluir datos de tareas compuestas, es un candidato natural para estudiar transferencia hacia tareas de horizonte largo.
- No se documentan tool calling, function calling, soporte de agentes multi-paso, modo thinking, audio ni capacidades multilingües. No disponible.

## Casos de uso

- Evaluación de tareas atómicas en RoboCasa365: cargar `5000/` o `9999/` con `serve_policy.py` y medir la tasa de éxito en las 65 tareas atómicas, que es exactamente el conjunto sobre el que se entrenó.
- Estudio de recetas de fine-tuning: comparar el paso 5.000 frente al 10.000 para analizar el efecto de un LR aún cercano al pico y de detener el entrenamiento al 10 % de los pasos previstos.
- Inicialización para tareas compuestas: al no contener datos de tareas compuestas, sirve como base limpia para medir cuánta capacidad de composición se puede recuperar con un fine-tuning posterior sobre `all_composite_tasks`.
- Análisis de olvido catastrófico: al restringir los datos a 65 tareas atómicas, permite cuantificar cuánto rendimiento general se pierde respecto a `pi05_base` en tareas fuera de ese conjunto.
- Referencia en pipelines de evaluación internos: como política de comparación frente a checkpoints entrenados con otras mezclas de datos dentro del mismo fork de openpi.
- Generación de rollouts en simulación para minería de fallos: ejecutar la política en RoboCasa y recoger trayectorias fallidas para estudiar modos de error concretos antes de invertir en datos adicionales.
- Reproducción de infraestructura: el checkpoint documenta FSDP grado 2, batch 64 y 2×A100 80GB, por lo que es útil como referencia para validar réplicas del pipeline de entrenamiento en otros clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que es un checkpoint de investigación «not yet evaluated». No hay tasas de éxito en RoboCasa365, ni métricas de simulación, ni comparaciones numéricas con `pi05_base` u otras políticas.

## Requisitos de hardware

- Entrenamiento documentado: 2×A100 80GB con FSDP grado 2 y batch de 64.
- Tamaño del repositorio: 24,9 GB totales, repartidos en dos carpetas de paso de aproximadamente 12,4 GB cada una (`5000/` y `9999/`). Conviene descargar solo una de ellas con `--include "5000/*"`.
- VRAM de inferencia: no publicada. Como estimación derivada del tamaño de una carpeta de paso (~12,4 GB), los pesos por sí solos no cabrían en GPUs de 8 GB; encajarían previsiblemente en tarjetas de 24 GB (RTX 3090/4090) solo si el grueso de esos 12,4 GB son pesos y queda margen para activaciones del codificador visual. Esta estimación no está confirmada por el autor.
- GPU profesionales recomendadas: A100 80GB o H100, coherentes con el entorno de entrenamiento y con el servido en JAX.
- Despliegue: `scripts/serve_policy.py policy:checkpoint` de openpi (JAX). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto y los pesos están en orbax OCDBT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tokens | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ducido/pi05_atomic65_from_base` | no disponible | `max_token_len=200` | 65 tareas atómicas RoboCasa365, ~100 demos humanas por tarea | `other` (Gemma Terms of Use) | HuggingFace, 0 descargas, 0 likes |
| `pi05_base` (Physical Intelligence, openpi) | no disponible | no disponible | pretrain de openpi; no detallado en la información disponible | upstream de openpi / Gemma Terms of Use | vía assets de openpi (`gs://openpi-assets/checkpoints/pi05_base`) |
| `pi05_pretrain_human300` (fork RoboCasa de openpi) | no disponible | no disponible | 300 tareas con demos humanas según el nombre de la config; no detallado | upstream de openpi / Gemma Terms of Use | en el fork de openpi para RoboCasa |
| Otras políticas VLA para manipulación (p. ej. OpenVLA, π0-base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no verificado en esta búsqueda |

La comparación cuantitativa no es posible: ni este checkpoint ni las alternativas tienen métricas publicadas en la información disponible, y el autor no incluye evaluación alguna. La única comparación fiable es de receta: este modelo usa 65 tareas atómicas frente a las 300 tareas que sugiere la configuración plantilla de la que deriva.

## Limitaciones y advertencias

- Checkpoint sin evaluar: el autor afirma explícitamente que no se ha evaluado. No hay ninguna garantía de rendimiento, ni siquiera en las tareas de entrenamiento.
- Sesgo de dominio: solo 65 tareas atómicas de RoboCasa, en entorno simulado y con demos humanas. Se espera un fallo sistemático fuera de esa distribución, incluida la composición de tareas largas.
- Sin datos de tareas compuestas: no debe usarse como política generalista de manipulación; su cobertura es deliberadamente estrecha.
- Entrenamiento incompleto: se detuvo a 10.000 de los 100.000 pasos del schedule, con el LR aún en ≈2,45e-5. Los pesos distan probablemente de la convergencia prevista por la receta.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento de forma exacta desde `5000/` ni desde `9999/`.
- Dos carpetas sin criterio de selección: el autor no indica cuál de los dos pasos es mejor; no hay validación que respalde elegir `9999/` sobre `5000/`.
- Normalización combinada: las `norm_stats` se agregan de todos los datasets en un único fichero, lo que puede sesgar la escala de acciones en tareas con rangos distintos.
- Licencia: `other`, con obligaciones derivadas de los pesos de Physical Intelligence y de los Gemma Terms of Use. Verificar compatibilidad antes de cualquier uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Riesgo de alucinación trasladado al dominio físico: la política puede generar acciones plausibles pero incorrectas sin señal de incertidumbre, lo que en un robot real se traduce en colisiones o agarres fallidos. No hay evaluación de seguridad.
- Idiomas y sesgos demográficos: no documentados. No hay información sobre el idioma de las instrucciones ni sobre sesgos de los datos de demostración.
- Trazabilidad: el autor no publica curvas de entrenamiento, ni métricas de pérdida, ni detalles del fork de openpi utilizado.

## Enlaces

- HuggingFace: https://huggingface.co/ducido/pi05_atomic65_from_base
- Repositorio openpi citado en la model card (scripts `serve_policy.py`, assets de checkpoints): https://github.com/Physical-Intelligence/openpi
- Términos de uso de Gemma, referenciados en la licencia: https://ai.google.dev/gemma/terms

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre RoboCasa365; los enlaces anteriores proceden de la model card y del ecosistema que esta cita. No se dispone de paper, blog, demo ni repositorio adicional verificados.
