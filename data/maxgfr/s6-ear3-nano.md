# maxgfr/s6-ear3-nano

## Resumen

s6-ear3-nano es un clasificador de audio de tipo "fin de turno" (end-of-turn) para agentes de voz, desarrollado por maxgfr dentro del proyecto skycmd. Se trata de un modelo de decisión de "sistema uno" (rápido, sin razonamiento deliberativo) que recibe una ventana de audio y decide si el hablante ha terminado su turno o si va a continuar, una función crítica en sistemas de conversación por voz para gestionar los silencios y evitar cortes prematuros. El modelo es una evolución de s6-ear2-nano, del que conserva íntegramente el grafo, el front end y las claves GGUF, y del que solo cambia el entrenamiento.

Lo más relevante de esta ficha es que el modelo **falló su puerta de validación pre-registrada** y el autor lo publica explícitamente como resultado negativo, no como modelo para uso en producción. En la evaluación sobre eot-bench (LiveKit), el AUC de s6-ear3-nano es de 0,7197 frente al 0,7448 de su predecesor v2, una caída de 0,0252 con intervalo del 95 % [−0,0336, −0,0167], cuando la puerta E1 exigía al menos +0,02. El modelo es minúsculo (390.338 parámetros según safetensors), lo que lo hace desplegable en WASM y en entornos con restricciones de latencia muy severas.

El interés técnico reside en la metodología: entrenamiento sobre conversaciones reales de dos hablantes (otoSpeech, unas 280 h) con etiquetas derivadas de reglas deterministas, validación cruzada contra Silero VAD, comprobación de fuga de información entre canales y reproducción del harness antes de leer puntuaciones. El resultado principal —que la señal humano-a-humano aprendida **no transfiere** al hablado dirigido a un agente— es en sí mismo el hallazgo que el autor publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión tipo "system-one" sobre grafo propio (sky_infer::turn), front end de audio en Rust; sin arquitectura transformer descrita |
| Parametros totales | 390.338 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre ventanas de audio de pausa; la política de demo consulta a 0,2 s de la pausa y cada 0,2 s hasta 2,4 s) |
| Tipos de cuantizacion | No disponible (el artefacto publicado es un GGUF de 631.936 bytes) |
| Idiomas soportados | en, fr (entrenamiento y etiquetas en inglés; eot-bench cubre 14 idiomas en evaluación) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo conserva el grafo, el front end, la "rung" y las claves GGUF de s6-ear2-nano; el cambio respecto a v2 es exclusivamente el entrenamiento. Se parte de los pesos EMA de v2 y se entrena durante 120 minutos de trabajo efectivo en un Apple M5, con una mezcla al 50 % de registros de conversación y clips de entrenamiento de Smart Turn, aplicando sobre estos últimos los objetivos de destilación de v2. El modelo es de tipo "system-one": una decisión directa por ventana de audio, sin cadena de razonamiento, con 2,39 ms por decisión en WASM.

Los datos de conversación provienen de otoSpeech (aproximadamente 280 h de inglés espontáneo, CC BY 4.0, con acceso restringido), con un hablante por canal. Se reproduce la VAD de energía y la política desplegadas sobre un canal, y cada pausa que la política consultaría se convierte en un registro etiquetado desde el otro canal: "fin de turno" si el otro hablante toma la palabra en 4 s (con al menos 1 s de habla que no sea backchannel), "hold" si el mismo hablante reanuda primero. Las etiquetas son duras y provienen de una regla, nunca de un modelo generativo; la opinión de Smart Turn sobre estos registros se registra pero no se usa como objetivo. Los clips de Smart Turn se amplían con 2,44 s de sus propios frames más silenciosos, cortados en un silencio sorteado.

Antes del entrenamiento se verificó: acuerdo de etiquetas con Silero VAD v6.2.3 del 0,9509 [0,9488, 0,9530] sobre 40.872 registros (umbral ≥ 0,85) y descarte del 0,1016 de los 45.494 registros por la ruta de Silero (umbral ≤ 0,30); ausencia de fuga desde el otro hablante (AUC máxima de 0,4396 sobre 120.000 registros de entrenamiento, umbral 0,60); y reproducción del harness (v2 con 0,8993 en el test de Smart Turn, v2 con 0,7299 y Smart Turn con 0,7838 en eot-bench al inicio de cada pausa, 17.934 cortes). El diseño se pre-registró en docs/s6-ear3-prereg.md, con una única ejecución y una única semilla.

## Capacidades

- Detección de fin de turno (end-of-turn) sobre audio de voz dirigido a un agente, con decisión binaria entre "fin de turno" y "hold".
- Operación sobre los silencios que consulta la política de un agente de voz: a 0,2 s de la pausa y cada 0,2 s hasta 2,4 s.
- Clasificación de audio en inglés y francés (idiomas declarados); evaluación en 14 idiomas mediante eot-bench.
- Inferencia de baja latencia: 2,39 ms por decisión en WASM.
- Despliegue como fichero GGUF "drop-in" compatible con la lista de tensores de v2.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente multi-paso: es un clasificador de audio, no un modelo generativo.
- Sin modo "thinking", sin audio generativo, sin soporte de function calling.

## Casos de uso

- **Investigación de detectores de fin de turno:** sirve como resultado negativo reproducible para estudiar por qué la señal aprendida en conversaciones humano-a-humano no transfiere al hablado dirigido a un agente; el autor publica el fichero precisamente para que el resultado pueda comprobarsese y ejecutarse.
- **Reproducción de la puerta pre-registrada:** permite reejecutar la evaluación sobre eot-bench (16.230 cortes de 7.342 turnos) y verificar el AUC de 0,7197 y los intervalos reportados, con el harness y las instrucciones del repositorio.
- **Auditoría de pipelines de etiquetado:** el protocolo de etiquetas duras derivadas de regla, con validación cruzada contra Silero VAD y comprobación de fuga entre canales, es reutilizable como plantilla metodológica en proyectos de voz.
- **Pruebas de integración de extremo a extremo en WASM:** con 631.936 bytes y 2,39 ms por decisión, el fichero permite validar la ruta de inferencia `sky_infer::turn` y el front end de audio en Rust antes de adoptar el modelo recomendado (s6-ear2-nano).
- **Comparación controlada de predecesores:** al compartir grafo, claves y lista de tensores con v2, facilita experimentos A/B sobre el mismo harness sin cambiar la infraestructura.
- **Docencia sobre pre-registro y sesgo de publicación:** el par pre-registro (docs/s6-ear3-prereg.md) y resultado (§17) constituye un caso práctico de ciencia abierta con puerta fallida.

## Benchmarks y rendimiento

| Benchmark | s6-ear3-nano | s6-ear2-nano (v2) | Smart Turn v3.2 |
|---|---|---|---|
| eot-bench, AUC (0,2 s tras pausa, 16.230 cortes) | 0,7197 | 0,7448 | 0,7873 |
| eot-bench, recall a falso corte de 0,10 | −0,0563 respecto a v2 [−0,0832, −0,0315] | referencia | no disponible |
| eot-bench, fuera de inglés | −0,0209 respecto a v2 [−0,0308, −0,0111] | referencia | no disponible |
| Smart Turn test (31.527 clips) | 0,8978 (umbral 0,8893; A1 cumple) | 0,8993 (reproducido) | no disponible |
| Corpus propio, conversaciones humano-a-humano retenidas | 0,6878 | 0,6031 | no disponible |

Resultado de la puerta pre-registrada: E1 falla (se pedía al menos +0,02 con cota inferior por encima de 0; se obtuvo −0,0252), E2 falla (−0,0563 frente a umbral), E3 falla (fuera de inglés, cota inferior por debajo de −0,02). A1, A2 y G3 se cumplen. El autor reporta 2,39 ms por decisión en WASM y 631.936 bytes de fichero.

## Requisitos de hardware

- VRAM estimada: no disponible con detalle; el artefacto es un GGUF de 631.936 bytes (menos de 1 MB), por lo que la huella de memoria es mínima.
- GPU recomendadas: innecesarias para inferencia; el modelo se ejecuta en CPU y en WASM. El entrenamiento se realizó en un Apple M5 durante 120 minutos de trabajo efectivo.
- Cabe en cualquier GPU consumer y en entornos sin GPU; también en navegador vía WASM.
- Opciones de despliegue: librería GGUF, motor propio `sky_infer::turn` en Rust, y la demo en un Space de Hugging Face con el mismo demo de micrófono que v2. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2,39 ms por decisión en WASM. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | eot-bench AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s6-ear3-nano | 390.338 | no disponible | 0,7197 | Apache 2.0 | GGUF, Hugging Face |
| s6-ear2-nano | no disponible | no disponible | 0,7448 | no disponible en esta ficha | Hugging Face |
| Smart Turn v3.2 | no disponible | no disponible | 0,7873 | no disponible en esta ficha | fichero de 8,7 MB |

El autor recomienda explícitamente quedarse con s6-ear2-nano, o con el fichero de 8,7 MB de Smart Turn cuando importen más las conversaciones reales. s6-ear3-nano no supera a ninguno de los dos en la métrica principal.

## Limitaciones y advertencias

- **Fallo de la puerta pre-registrada:** E1, E2 y E3 no se cumplen; el modelo se publica como resultado, no para uso en producción. No debe desplegaste en un agente de voz real esperando mejoras sobre v2.
- **Regresión medida:** AUC de 0,7197 frente a 0,7448 de v2 en eot-bench, con cota superior del intervalo por debajo de cero; recall inferior en 0,0563 a falso corte de 0,10; pérdida de 0,0209 fuera de inglés.
- **Falta de transferencia:** la señal humano-a-humano aprendida no transfiere al hablado dirigido a un agente (0,6878 frente a 0,6031 en el corpus propio, lectura que el pre-registro fijaba como confirmación de no transferencia).
- **Sesgos conocidos:** no documentados en la información disponible.
- **Riesgo de alucinación:** no aplica en el sentido generativo, pero sí existe riesgo de decisión errónea (corte prematuro o espera excesiva) en silencios ambiguos, backchannels y solapamientos; los registros con backchannels, solapamientos, pausas sin continuación en 4 s y cercanos a segmentos redactados fueron descartados del entrenamiento.
- **Idioma:** solo en y fr declarados; el rendimiento fuera de inglés empeora respecto a v2.
- **Licencia:** Apache 2.0 permite uso comercial, pero el autor desaconseja el despliegue por el resultado negativo; los datos de entrenamiento otoSpeech son CC BY 4.0 con acceso restringido.
- **Metodología:** una sola ejecución y una sola semilla; el diseño se hizo tras la lectura de eot-bench de v2 (divulgado con el resultado), y las enmiendas de etiquetas y topes se hicieron antes de leer ninguna sesión de validación o test.
- **Caveat de producción:** comparte lista de tensores con v2 y es "drop-in", lo que facilita confundirlo con una mejora; no lo es.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-ear3-nano
- Predecesor recomendado: https://huggingface.co/maxgfr/s6-ear2-nano
- Demo (Space): https://huggingface.co/spaces/maxgfr/s6-ear3-nano
- Repositorio de código: https://github.com/maxgfr/skycmd
- Benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-ear3-nano-s6-ear-v3-an-end-of-turn-detector-trained-on-real-conversations-pre-registered-gate-failed
- Puerta pre-registrada: https://github.com/maxgfr/skycmd/blob/main/runs/s6-ear3-nano/GATE.md
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-ear3-prereg.md
- Dataset eot-bench: https://huggingface.co/datasets/livekit/eot-bench-data
- Dataset otoSpeech: https://huggingface.co/datasets/otoearth/otoSpeech-full-duplex-280h
