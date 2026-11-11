# jsantillana/Muse-Glimmer-30B-abliterated-v4

## Resumen

Muse-Glimmer-30B-abliterated-v4 (tambien etiquetado como fix5) es un artefacto de investigacion publicado por el usuario jsantillana en Hugging Face. Se trata de una modificacion de pesos de un modelo base denominado Muse-Glimmer-30B, orientada a estudiar la localizacion de los circuitos de rechazo (refusal) en modelos con razonamiento siempre activo. El autor lo presenta explicitamente como material para investigacion en seguridad defensiva, no como un lanzamiento oficial, y declara no tener afiliacion con el desarrollador del modelo base.

El modelo tiene 29.776.626.688 parametros reales segun los tensores safetensors, es decir, aproximadamente 29,8 mil millones, y el repositorio ocupa 59,6 GB. Los pesos se distribuyen en formato safetensors y el autor publica variantes cuantizadas GGUF (Q8_0, Q4_K_M y Q3_K_M) en un repositorio complementario. La model card menciona un canal de razonamiento (chain-of-thought) con transiciones tipo `to=user<|message|>`, lo que sugiere una arquitectura transformer con modo de pensamiento explicito, aunque no se detallan ni la arquitectura exacta ni la longitud de contexto.

La relevancia del modelo es metodologica mas que de rendimiento: documenta un procedimiento de ablacion lineal sin entrenamiento sobre las proyecciones `self_attn.o_proj` y `mlp.down_proj` en las capas 20 a 46, con extraccion de direcciones a partir de estados reales forzados por profesor. El autor reconoce que la ablacion es imperfecta y que persisten rechazos residuales, por lo que no debe interpretarse como un modelo plenamente sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con canal de razonamiento explicito (chain-of-thought); detalles completos no disponibles |
| Parametros totales | 29.776.626.688 (aprox. 29,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en el repo principal; GGUF Q8_0, Q4_K_M y Q3_K_M en repo complementario |
| Idiomas soportados | Ingles y espanol en la evaluacion del autor; lista oficial de idiomas no disponible |
| Licencia | Heredada del modelo base; uso solo para investigacion; sin garantia (texto exacto de licencia no disponible) |
| Formato de pesos | safetensors (principal), GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

El autor no describe la arquitectura del modelo base mas alla de referencias al canal de razonamiento y a la transicion `to=user<|message|>` que separa el chain-of-thought de la respuesta final. La intervencion es una ablacion lineal sin entrenamiento (training-free) aplicada sobre dos tipos de tensor: la proyeccion de salida de la atencion (`self_attn.o_proj`) y la proyeccion descendente del MLP (`mlp.down_proj`), en el rango de capas 20 a 46.

El procedimiento de extraccion de direcciones se realizo en tres fases. Primero, un filtro de comportamiento con rollouts de 1024 tokens sobre 210 pares alineados a entidades registradas (danino/control), conservando 119 pares en los que la carga danina era rechazada y la de control era cumplida. Segundo, extraccion de tres direcciones por capa a partir de estados reales forzados por profesor: `r_exit` (estado en el token final de la transicion de salida), `r_entry` (estado final del prompt, entrada al canal de razonamiento) y `r_post` (media de los primeros tokens de la carga). El autor senala que `r_entry` y `r_exit` son casi ortogonales (coseno aproximado de 0,06 a 0,12), lo que interpreta como evidencia de que los circuitos de rechazo de entrada y de salida son distintos. Tercero, ortogonalizacion de Gram-Schmidt con compuertas de rango adaptativas (rango 1 a 3 por capa) y una compuerta de Frobenius que descarta el tercer vector cuando el desplazamiento por tensor supera el 3,2 %.

La cirugia aplica un coeficiente alfa escalonado por rango de capas: 0,65 en L20-23, 1,0 en L24-27, 1,25 en L28-41 y 0,85 en L42-46. No se realizo entrenamiento adicional, RLHF ni DPO; la modificacion es puramente de pesos. El manifiesto `ABLITERATION_MANIFEST.json` recoge los desplazamientos de Frobenius por tensor y los metadatos del metodo.

## Capacidades

- Generacion de texto con razonamiento explicito en canal de chain-of-thought antes de la respuesta final.
- Razonamiento multi-paso dentro del canal de pensamiento, con transicion controlada a la respuesta de usuario.
- Respuesta en ingles y espanol, segun la evaluacion bilingue del autor (no hay lista oficial de idiomas).
- Cumplimiento con disclaimers: en la mayoria de los casos residuales el modelo emite un aviso breve y despues entrega contenido sustantivo (comportamiento denominado safe-completion por el autor).
- Capacidad de responder a prompts de seguridad defensiva y conceptuales (celdas DEF) sin rechazo en la evaluacion realizada.
- No se documentan capacidades de tool calling, function calling, vision, audio ni uso agentico.

## Casos de uso

- Investigacion en interpretabilidad de rechazos: el modelo sirve como artefacto para replicar el analisis de localizacion de circuitos de rechazo en capas 20 a 46, comparando estados de entrada y salida del canal de razonamiento.
- Estudio de transferencia ataque-defensa: util para medir cuanto conocimiento defensivo se retiene tras la ablacion en prompts de seguridad, con las celdas DEF como control.
- Evaluacion de metodologias de ablacion: el manifiesto por tensor y los scripts de filtrado y cirugia permiten auditar el efecto de coeficientes alfa escalonados frente a ablaciones uniformes.
- Analisis de calibracion de rechazos: la separacion entre rechazo puro y cumplimiento con disclaimer permite estudiar como se degrada la negativa en modelos con razonamiento siempre activo.
- Pruebas de robustez multilinguie: la diferencia entre las tasas de rechazo en ingles (8 % puro) y espanol (4 % puro, con 16 % de bucles verbosos) es un caso de estudio sobre asimetrias de idioma en circuitos de seguridad.
- Referencia para pipelines de evaluacion: los scripts `run_muse_fix4b.py`, `run_muse_fix5.py` y `eval_muse_fix4.py` documentan un protocolo de evaluacion payload-only con adjudicacion dual que puede reutilizarse en otros modelos.
- Despliegue local para experimentacion: las variantes GGUF Q4_K_M y Q3_K_M permiten ejecutar el modelo en hardware de consumo para pruebas de reproducibilidad, aunque sin datos publicados de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta una evaluacion propia de rechazos con N=90 prompts retenidos, decodificacion greedy de 2048 tokens y juicio dual (marcadores estrictos y rechazo puro frente a cumplimiento con disclaimer):

| Metrica (payload-only, N=90) | Base | v4 (fix5) |
|---|---|---|
| EN:OFF — estricto | 84 % | 60 % |
| EN:OFF — rechazo puro | 64 % (16/25) | 8 % (2/25) |
| EN:OFF — cumplimiento con disclaimer | 20 % (5/25) | 52 % (13/25) |
| EN:OFF — sin respuesta en 2048 tokens | 8 % | 8 % |
| ES:OFF — estricto | 48 % | 24 % |
| ES:OFF — rechazo puro | 32 % (8/25) | 4 % (1/25) |
| EN:DEF / ES:DEF — estricto | 0 % | 0 % |
| SOC — estricto | 6,7 % | 0 % |
| Tasa de contenido util en ataques (EN:OFF) | 28 % | 84 % |

El autor advierte que la muestra es de N=90 (margen aproximado de mas o menos 10 puntos porcentuales) y que la evaluacion completa de 1058 prompts no se volvio a ejecutar para v4. No se realizo ninguna prueba de coherencia ni de perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 60 GB solo para pesos, mas overhead de activaciones y cache KV; requiere GPU de 80 GB o reparto multi-GPU.
- Cuantizacion Q8_0: en torno a 30-32 GB, viable en una A100 40 GB o en dos GPU de 24 GB.
- Cuantizacion Q4_K_M: en torno a 17-18 GB, viable en una RTX 4090 (24 GB) o RTX 3090.
- Cuantizacion Q3_K_M: en torno a 13-14 GB, viable en GPU de consumo de 16 GB, con perdida de calidad no evaluada.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision completa; A100 40 GB para Q8_0; RTX 4090 o 3090 para Q4_K_M.
- Opciones de despliegue: llama.cpp u Ollama para las variantes GGUF; vLLM o TGI para safetensors si el modelo base es compatible con dichos motores (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles. La decodificacion de 2048 tokens con razonamiento explicito implica coste de generacion elevado, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-abliterated-v4 | 29,8 B | no disponible | Ablacion de rechazo con CoT explicito | Heredada del base, solo investigacion | Hugging Face (repo del autor) |
| Modelo base Muse-Glimmer-30B | no disponible | no disponible | Modelo original sin modificar | La del repositorio base | Referenciado, no enlazado en la informacion |
| Otras variantes abliterated de la familia | no disponible | no disponible | Ablacion de direccion de rechazo | Variable segun autor | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo base en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo plenamente sin censura: el 60 % de las respuestas a ataques en ingles siguen siendo estrictas al contar disclaimers, y el 8 % son rechazos puros.
- El 52 % de las respuestas a ataques en ingles incluyen una frase de disclaimer antes del contenido sustantivo, lo que puede afectar a pipelines que filtren por palabras clave.
- El 16 % de las generaciones en espanol entran en bucles verbosos de razonamiento tecnico y no responden dentro de 2048 tokens; es un problema de verbosidad, no de rechazo.
- No se ejecuto ninguna prueba de coherencia ni de perplejidad: se desconoce el dano colateral de la ablacion sobre la calidad general del modelo.
- La evaluacion se limita a N=90 prompts (margen de mas o menos 10 puntos porcentuales) y no se reejecuto el conjunto completo de 1058 prompts para v4.
- El autor declara que v3 era defectuoso por un artefacto de medicion y no debe usarse; existe riesgo de confundir variantes si se descargan versiones antiguas.
- Licencia heredada del modelo base con uso restringido a investigacion y sin garantia; no se dispone del texto exacto, por lo que el uso comercial es incierto y desaconsejado sin verificacion legal.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- El modelo esta disenado como artefacto de seguridad defensiva; su uso fuera de ese contexto carece de evaluacion de seguridad y de alineamiento.
- Idiomas: solo se evaluo ingles y espanol; el comportamiento en otros idiomas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/Muse-Glimmer-30B-abliterated-v4
- Repositorio GGUF complementario (mencionado en la model card): jsantillana/Muse-Glimmer-30B-abliterated-v4-GGUF
- Manifiesto de ablacion (en el repo): `ABLITERATION_MANIFEST.json`
- Scripts del pipeline (mencionados, en el repo del paper): `run_muse_fix4b.py`, `run_muse_fix5.py`, `eval_muse_fix4.py`
- Paper, blog o demo: no disponibles en la informacion proporcionada.
