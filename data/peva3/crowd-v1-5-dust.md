# peva3/Crowd-v1.5-dust

## Resumen

Crowd v1.5 DUST es un checkpoint de pesos de un modelo de lenguaje de aproximadamente 306 millones de parametros, publicado por el usuario peva3 en Hugging Face. No se trata de un modelo entrenado de forma convencional y liberado como producto final, sino de un experimento de entrenamiento colaborativo descentralizado: el repositorio actua como estado de coordinacion y distintos entrenadores se pasan un "testigo" (baton) para entrenar por turnos mediante DUST, un metodo de optimizacion sin retropropagacion (evolution strategies / perturbacion de pesos) en lugar de gradientes clasicos.

El modelo emplea una arquitectura transformer de tipo denso con 18 capas, anchura 1024, 16 cabezas de atencion y una longitud de contexto de 2048 tokens, con embeddings atados (tied embeddings). Se distribuye en safetensors en float32 (1,22 GB de pesos, 5,3 GB de repositorio completo) bajo licencia MIT. La relevancia no esta en su rendimiento como modelo de produccion, sino en la infraestructura de entrenamiento distribuido que propone: coordinacion basada en el propio repositorio git, verificacion criptografica del estado de los pesos y proteccion contra sobrescrituras mediante numeros de ronda.

Es, por tanto, una pieza de investigacion sobre entrenamiento crowdsourced y optimizacion sin gradientes a escala de 300M de parametros, mas que un modelo destinado a despliegue en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (preset `300m`): 18 capas, anchura 1024, 16 cabezas |
| Parametros totales | 306.222.080 (embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), 1,22 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 18 capas con anchura 1024 y 16 cabezas de atencion, con embeddings atados y una ventana de contexto de 2048 tokens. El checkpoint principal se entrena mediante DUST, un esquema de optimizacion por perturbacion de poblacion (evolution strategies) en lugar de retropropagacion. Los hiperparametros documentados incluyen una poblacion de 32 muestras, `sigma` relativo de 0,05, learning rate de 0,05 y momentum de 0,9. Existe una ruta alternativa etiquetada `backprop` que se conserva pero no se utiliza en este snapshot.

El aspecto mas singular es el protocolo de entrenamiento colaborativo. El repositorio actua como coordinador: cada entrenador hace `pull` del estado, verifica la integridad mediante `baseSha256` (hash calculado sobre nombres de tensores ordenados y valores float32 redondeados a bfloat16, de modo que cambiar el dtype o re-guardar no altera el hash), entrena localmente y hace `push` incrementando el numero de ronda. El sistema rechaza el push si la ronda remota ya avanzo, lo que evita que un entrenador lento sobrescriba trabajo mas reciente. `lock.json` es un lease advisory de 24 horas; la verdadera proteccion es el guard de ronda. No se documentan en la model card datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un transformer de 306M de parametros.
- Entrenamiento local sobre datos propios en formato uint16 binario compatible con el tokenizer del modelo.
- Aislamiento de ruido por capa mediante el modo `--mode layer`, que segun la model card duplica aproximadamente la alineacion del gradiente a costa de unas 20 veces mas pasadas forward por paso.
- Soporte de entrenamiento en GPU de 16 GB, GPU de 8 GB y CPU (este ultimo lento pero valido).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Investigacion en optimizacion sin gradientes: el checkpoint sirve como banco de pruebas reproducible para comparar DUST frente a backprop en un modelo de 300M, con el estado y el historial de rondas versionados en el propio repositorio.
- Entrenamiento colaborativo distribuido: equipos o individuos pueden turnarse para entrenar sobre datos propios manteniendo un unico linaje de pesos, usando el numero de ronda y `baseSha256` para garantizar consistencia.
- Experimentos de federated learning ligero: el protocolo de baton con lease advisory y guard de ronda ofrece un patron replicable para coordinar entrenadores sin servidor central.
- Docencia y formacion practica: el comando de entrenamiento cabe en una GPU de consumo de 16 GB (8,46 GB de pico medido, 57 s/paso), lo que permite montar practicas de entrenamiento real sin infraestructura dedicada.
- Reproduccion de resultados: el tag `seed-1b` conserva el seed de 1B original, util para comparar la evolucion del entrenamiento entre presets.
- Pruebas de integridad de checkpoints: el esquema de hash estable frente a cambios de dtype puede reutilizarse como referencia en pipelines de publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente aporta mediciones de entrenamiento, no de calidad del modelo:

| Hardware | Configuracion | Medido |
|---|---|---|
| GPU consumo 16 GB | `--batch 2 --seq-len 512 --population 32 --draw-chunk 4 --mode all` | 57 s/paso, 17,9 tok/s de evidencia, 8,46 GB de pico |
| GPU 8 GB | `--batch 1 --seq-len 256 --population 32 --draw-chunk 4 --mode all` | Aproximadamente 1/4 de tokens por paso |
| CPU | `--device cpu --compute-dtype float32 --batch 1 --seq-len 128 --population 16 --draw-chunk 4` | Lento pero valido |

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 306M en float32 (1,22 GB de pesos), la VRAM necesaria para inferencia es modesta, aunque no se documentan requisitos oficiales de inferencia.
- Entrenamiento medido: 8,46 GB de pico en GPU de consumo de 16 GB con la configuracion recomendada.
- Cabe en GPU de consumo: si, con 16 GB o incluso 8 GB ajustando batch y secuencia.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el flujo documentado es el entrenamiento mediante `tools/hf_baton.py`.
- Latencia y throughput: solo se publica throughput de entrenamiento (17,9 tok/s de evidencia en la configuracion de 16 GB); no hay datos de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (entrenamiento crowdsourced sin gradientes a escala 300M) ni datos de rendimiento que permitan una comparacion objetiva con alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la calidad real del modelo en tareas de lenguaje, razonamiento o codigo.
- No se documentan idiomas soportados ni composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de dominio o idioma.
- El modelo es un checkpoint en evolucion: el contenido del repositorio cambia con cada ronda, de modo que una descarga no es reproducible salvo fijando una revision concreta.
- El protocolo asume pares de confianza ("peers are trusted"); no hay verificacion criptografica de la identidad del entrenador, solo del estado de los pesos.
- El lease de `lock.json` es advisory y no impide por si mismo escrituras concurrentes; la proteccion efectiva es el guard de ronda.
- El fallo o abuso del guard de ronda podria permitir perdida de trabajo si un entrenador hace `--force`; la propia model card lo prohibe explicitamente.
- No hay garantia de que el checkpoint actual sea funcional para inferencia: es un artefacto de investigacion sobre optimizacion, no un modelo afinado para produccion.
- Licencia MIT: permite uso comercial, pero al no haber evaluacion de calidad ni de sesgos, el uso en produccion conlleva riesgo no cuantificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/peva3/Crowd-v1.5-dust
- Tag del seed original de 1B: `seed-1b` (dentro del mismo repositorio)
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo independientes ni demos adicionales.
