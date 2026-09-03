# nur-dev/pns-bind-25m

## Resumen

PNS-Bind-25M es un modelo recurrente de aproximadamente 25 millones de parámetros desarrollado por el usuario nur-dev, presentado como parte de un estudio sobre memoria persistente sin transcripción en modelos de flujo de eventos. El modelo aborda el problema de si un estado recurrente aprendido puede almacenar memoria semántica duradera sin necesidad de reproducir el historial completo de eventos. Los resultados del estudio indican que los estados recurrentes genéricos no adquieren memoria causalmente útil, mientras que un mecanismo de direccionamiento por identidad con escrituras aprendidas (binding) sí logra memoria semántica de un salto durable, con fuerte dependencia causal del payload aprendido.

La relevancia actual radica en que cuestiona los supuestos habituales sobre la memoria en modelos recurrentes y propone una alternativa basada en intervenciones causales explícitas. El modelo se publica con código, configuraciones de entrenamiento y evaluación, y un script de reproducción de resultados. No se reivindica razonamiento narrativo persistente general: el punto final de razonamiento de dos saltos preregistrado no mejoró sobre el control sin memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente con estado persistente y binding por identidad (PNS-Bind) |
| Parametros totales | ~25 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo no usa transcript; el baseline TX768_fin usa una ventana deslizante de 768 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo PNS-Bind emplea una arquitectura recurrente con estado persistente acotado. A diferencia de los enfoques basados en transcript replay, cada evento histórico se consume una sola vez y la dependencia entre eventos debe pasar a través de un estado persistente limitado. El mecanismo central es el binding por identidad: escrituras aprendidas que se direccionan a ranuras de memoria específicas, lo que permite almacenar y recuperar información semántica de forma causal. El estudio incluye varios mecanismos de estado como comparación: PNSR (estado aprendido no estructurado), variantes con puertas convexas (G_TAU512, G_CONVEX_FREE, G_CONVEX_RETAIN) y un baseline RMT con tokens de memoria y self-attention.

El entrenamiento se realizó sobre el dataset `nur-dev/pns-world`, un simulador de mundos con eventos discretos y un solucionador de preguntas. No se menciona el uso de RLHF ni DPO. La innovación principal es el diseño experimental: se aplican intervenciones causales dentro de los evaluadores (swap de estado entre vidas, resets periódicos, lesiones de almacenes exactos) para medir la contribución causal del estado aprendido frente a los almacenes deterministas. El modelo expone hooks específicos (`initial_state`, `freeze_writes`, router de escrituras tipadas) para permitir estas intervenciones.

## Capacidades

- Memoria semántica de un salto (one-hop) durable: el modelo puede retener información de un evento y usarla para responder preguntas tras más de 128 eventos intermedios, según los resultados del Experiment 2.
- Question answering sobre eventos simulados: el pipeline declarado es `question-answering`, con un solucionador de preguntas integrado en el simulador.
- Evaluación causal de memoria: permite intervenciones como swap de estado entre vidas, reset periódico, puesta a cero de payload o de estado, y lesiones de almacenes, lo que facilita el análisis de la contribución real de cada componente.
- Soporte de múltiples mecanismos de estado en el mismo framework: PNSR, variantes con puertas, RMT y PNS-Bind, todos con el mismo codificador de registros y cabezas de salida.
- Reproducibilidad: incluye configuraciones exactas de entrenamiento y evaluación, 24 checkpoints evaluados y scripts de reproducción con verificación de desviaciones.
- No soporta tool calling, agentes ni razonamiento multi-paso: el endpoint de razonamiento de dos saltos (SEM_2HOP) no mejoró sobre el control sin memoria.

## Casos de uso

- Investigación académica sobre memoria a largo plazo en modelos de eventos: el modelo permite estudiar si un estado recurrente aprendido puede almacenar información semántica de forma causal, sin depender de la reproducción del transcript.
- Evaluación de intervenciones causales en modelos recurrentes: gracias a los hooks y evaluadores incluidos, se pueden realizar experimentos de swap, reset y lesión para medir la contribución real del estado frente a almacenes deterministas.
- Comparación de mecanismos de memoria recurrente: el framework incluye PNSR, variantes con puertas y RMT, lo que permite comparar directamente distintos diseños de estado bajo las mismas condiciones.
- Simulación de mundos con eventos discretos: el simulador `src/pns/world/` genera eventos y preguntas, útil para probar hipótesis sobre memoria y razonamiento en entornos controlados.
- Pruebas de hipótesis sobre la necesidad de transcript replay: el baseline TX768_fin, que re-lee una ventana de 768 tokens, sirve como referencia para medir si la memoria persistente sin transcript puede igualar o superar al replay.
- Desarrollo de modelos con memoria acotada para dominios específicos: aunque el modelo es pequeño y de investigación, su diseño de binding por identidad podría inspirar arquitecturas para aplicaciones donde el contexto es limitado y se requiere retención selectiva.

## Benchmarks y rendimiento

El estudio publica resultados del Experiment 1, que evalúa siete modelos con cuatro mecanismos de estado y tres semillas. La tabla siguiente resume las métricas clave: similitud coseno entre estados de diferentes vidas (x-life cosine), norma máxima del estado, cambio en precisión al intercambiar el estado de otra vida (Δ swap), cambio al resetear el estado cada 64 eventos (Δ reset64) y el efecto de lesionar el almacén exacto de auto-recompensa (J_self lesion).

| run | state mechanism | x-life cosine | max norm | Δ swap | Δ reset64 | J_self lesion |
| --- | --- | --- | --- | --- | --- | --- |
| PNSR seed 1 | additive + clamp τ=16 | 0.950 | 16.0 | +0.0000 | +0.0001 | +0.689 |
| PNSR seed 2 | additive + clamp τ=16 | 0.963 | 16.0 | +0.0001 | +0.0002 | +0.747 |
| PNSR seed 3 | additive + clamp τ=16 | 0.978 | 16.0 | +0.0001 | +0.0029 | +0.728 |
| G_TAU512 | additive, clamp τ=512 | 0.983 | 485.1 | +0.0007 | +0.0012 | +0.737 |
| G_CONVEX_FREE | convex gated, no clamp | 0.940 | 94.7 | +0.0005 | +0.0016 | +0.722 |
| G_CONVEX_RETAIN | convex gated, retention-biased | 0.786 | 49.6 | −0.0001 | −0.0006 | +0.715 |
| RMT | memory tokens + self-attention | 0.634 | 19.6 | +0.0005 | +0.0005 | +0.602 |

Los resultados muestran que intercambiar el estado de otra vida cambia la precisión en como máximo 0.0007 en toda la tabla, mientras que lesionar los almacenes exactos cuesta al menos 0.602. Esto indica que los estados recurrentes aprendidos no contribuyen causalmente a la memoria, mientras que los almacenes deterministas sí son necesarios. Para el Experiment 2, la model card menciona resultados como `SEM_LATEST`, retención más allá de 128 eventos intermedios, payload swap, reset-64, payload-zero y el fallo del endpoint `SEM_2HOP`, pero no se proporcionan los valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 2 GB por proceso, según la medición de la reproducción (pico de memoria GPU bajo 2 GB por proceso).
- GPU recomendadas: el estudio se ejecutó en cinco H200s para la reproducción completa (57 minutos), pero también se puede ejecutar en una sola GPU (presupuesto de 4–5 horas). Dado el bajo consumo de memoria, cualquier GPU moderna con al menos 2 GB de VRAM es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer como RTX 3060 o superiores, e incluso en CPU si se acepta mayor latencia.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El modelo se distribuye con PyTorch y se ejecuta mediante los scripts de evaluación incluidos.
- Latencia y throughput: no se proporcionan cifras específicas. La reproducción completa de 101 evaluaciones tarda 57 minutos en cinco H200s, lo que sugiere una inferencia ligera.

## Comparativa con modelos similares

El estudio incluye comparaciones internas con otros mecanismos de estado recurrente. La tabla siguiente resume las diferencias clave entre PNS-Bind y los baselines del propio estudio, basándose en los resultados publicados.

| Modelo | Mecanismo de estado | x-life cosine | Δ swap | Δ reset64 | J_self lesion |
| --- | --- | --- | --- | --- | --- |
| PNS-Bind (E3-BIND) | Binding por identidad con escrituras aprendidas | No disponible en la tabla publicada | No disponible | No disponible | No disponible |
| PNSR (seed 1) | Aditivo con clamp τ=16 | 0.950 | +0.0000 | +0.0001 | +0.689 |
| G_TAU512 | Aditivo con clamp τ=512 | 0.983 | +0.0007 | +0.0012 | +0.737 |
| RMT | Tokens de memoria + self-attention | 0.634 | +0.0005 | +0.0005 | +0.602 |

No se dispone de comparativas con modelos externos de la misma categoría (por ejemplo, otros modelos recurrentes de 25M con memoria persistente). La model card no proporciona referencias a modelos similares fuera del estudio.

## Limitaciones y advertencias

- El razonamiento de dos saltos (SEM_2HOP) no mejoró sobre el control sin memoria; el modelo no es adecuado para tareas que requieran razonamiento narrativo multi-paso.
- Los estados recurrentes genéricos (PNSR, variantes con puertas) no adquirieron memoria semántica durable; solo el mecanismo de binding por identidad mostró memoria causal, y solo para un salto.
- El modelo es de investigación, con solo 25M de parámetros, y está diseñado para el dominio específico de eventos simulados del dataset `pns-world`. No se ha evaluado en tareas generales de lenguaje.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en dominios fuera del simulador.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado para producción y carece de soporte para tool calling, agentes o generación de texto general.
- La reproducción de resultados requiere seguir el protocolo exacto de evaluación; cualquier modificación en las intervenciones puede invalidar las conclusiones causales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nur-dev/pns-bind-25m
- Dataset utilizado: https://huggingface.co/datasets/nur-dev/pns-world
- Paper asociado: *Beyond Transcript Replay: Causal Persistent Memory Through Protected Semantic Bindings* (enlace no disponible en la información proporcionada)
