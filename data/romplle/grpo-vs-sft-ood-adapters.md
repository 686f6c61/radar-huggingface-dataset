# romplle/grpo-vs-sft-ood-adapters

## Resumen

`romplle/grpo-vs-sft-ood-adapters` es una coleccion de adaptadores LoRA publicados por el usuario romplle como material reproducible de un experimento comparativo entre ajuste supervisado (SFT) y aprendizaje por refuerzo con GRPO sobre un modelo vision-lenguaje pequeno, NanoVLM de 222 millones de parametros (`lusxvr/nanoVLM-222M`). El modelo base resuelve una tarea concreta de control: dado un fotograma en primera persona de un entorno MiniGrid Empty, elegir una de tres acciones discretas (`left`, `right`, `forward`).

El interes no esta en el modelo en si, sino en el artefacto experimental: se publican adaptadores SFT en varias epocas (1, 3, 5, 8, 9), adaptadores GRPO entrenados a partir de distintos puntos de partida SFT, replicas con semillas alternativas y variantes de distribucion (entrenamiento con color mixto del objetivo, reinicio desde posiciones lejanas). Esto permite reproducir el estudio de generalizacion fuera de distribucion (OOD) que da nombre al repositorio, con horizontes de evaluacion de 12 pasos en tableros 8x8 y 40 pasos en tableros 16x16.

Es un repositorio de investigacion, no un modelo listo para produccion: cero descargas, cero likes, licencia MIT y pesos distribuidos como adaptadores PEFT sobre el checkpoint base. La relevancia actual es metodologica, como ejemplo abierto y de bajo coste de como se compara RL con SFT en un dominio donde las recompensas son verificables y el entorno es totalmente controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre NanoVLM-222M, modelo vision-lenguaje transformer |
| Parametros totales | no disponible (el modelo base declara 222M; el repositorio ocupa 0,8 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (la tarea es seleccion de acciones, no generacion de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

Hiperparametros LoRA declarados: r = 64, alpha = 64, modulos objetivo `q_proj`, `k_proj`, `v_proj`, `out_proj`.

## Arquitectura y entrenamiento

El modelo base es NanoVLM-222M, un VLM compacto que combina un codificador visual con un decoder de lenguaje de pequeno tamano. Sobre el se aplican adaptadores LoRA de rango 64 en las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`) y en la proyeccion de salida (`out_proj`). La tarea se formula como clasificacion de accion en tres clases a partir de un unico fotograma egocentrico de MiniGrid Empty.

El entrenamiento tiene dos fases. Primero, SFT sobre trayectorias generadas por un experto BFS, con lotes de 32 y hasta 10 epocas; se conservan checkpoints de las epocas 1, 3, 5, 8 y 9. Despues, GRPO (Group Relative Policy Optimization) partiendo de checkpoints SFT concretos, con 100 episodios de entrenamiento en la mayoria de variantes (75 en el caso de SFT corto en 8x8). El diseno experimental incluye tres semillas para el resultado principal (handoff desde la epoca 9), adaptadores GRPO sobre epocas tempranas (1 y 5) para medir el signo de la diferencia, una variante con color de objetivo mixto durante el entrenamiento y una variante "far-reset" en 16x16 donde cada episodio arranca desde una posicion lejana. El GRPO se carga siempre junto a su adaptador SFT de origen mediante `--sft-adapter-path` y `--grpo-adapter-path`.

## Capacidades

- Seleccion de accion discreta (`left`, `right`, `forward`) en MiniGrid Empty a partir de un fotograma egocentrico.
- Percepcion visual de bajo nivel sobre imagenes sinteticas de rejilla.
- Aprendizaje por refuerzo con recompensas verificables (GRPO) sobre una politica inicial obtenida por imitacion.
- Evaluacion controlada de generalizacion OOD mediante variaciones de tamano de tablero (8x8 frente a 16x16), color del objetivo y posicion inicial.
- Reproducibilidad experimental: adaptadores etiquetados por epoca, semilla y protocolo de reinicio.
- No soporta tool calling, function calling, agentes multi-paso, dialogo multilingue ni generacion de texto libre; es un policy model de dominio cerrado.

## Casos de uso

- Reproduccion de resultados de investigacion: descargar el repositorio con `hf download romplle/grpo-vs-sft-ood-adapters --local-dir checkpoints` y ejecutar `scripts/test_models.py` del repositorio GitHub sin modificar rutas, para verificar las cifras publicadas.
- Estudio de la brecha SFT frente a RL: comparar los adaptadores SFT de las epocas 1, 5 y 9 con sus correspondientes GRPO y medir el signo y la magnitud de la diferencia en el mismo protocolo de evaluacion.
- Analisis de sensibilidad a la semilla: usar las replicas `_seed123` y `_seed456` del handoff principal para estimar la varianza del entrenamiento GRPO en un entorno de bajo coste.
- Docencia y formacion en RL: emplear el par SFT+GRPO como ejemplo minimo y ejecutable de un pipeline de imitacion seguida de optimizacion de politica, con un modelo de 222M que cabe en GPU de consumo.
- Investigacion en generalizacion OOD: evaluar los adaptadores 8x8 sobre tableros 16x16 con horizonte de 40 pasos, y los adaptadores 16x16 con reinicio lejano, para estudiar transferencia de politica.
- Desarrollo de metodos de evaluacion: utilizar la estructura de checkpoints por epoca como banco de pruebas para metricas de robustez, tasas de exito por horizonte y analisis de colapso de politica.
- Punto de partida para experimentos propios: reutilizar los adaptadores SFT como inicializacion en nuevas variantes de MiniGrid o en tareas de navegacion sintetica similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al README del repositorio GitHub `romplle/grpo-vs-sft-ood` para todas las cifras y el protocolo de evaluacion; no se incluyen numeros en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo base declara 222M de parametros; en precision completa (fp32) serian aproximadamente 0,9 GB solo de pesos, y en bf16/fp16 alrededor de 0,45 GB. Los adaptadores LoRA anaden una fraccion pequena. Con overhead de activaciones y codificador visual, una GPU con 8 GB es suficiente y probablemente tambien 4-6 GB en configuraciones ajustadas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es mas que suficiente; para entrenamiento GRPO conviene al menos 12-16 GB para permitir lotes mayores.
- Cabe en GPU de consumo: si, con margen amplio, incluso en tarjetas de gama media.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con la libreria `peft` sobre el checkpoint `lusxvr/nanoVLM-222M`; el repositorio proporciona scripts de prueba propios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y por el tipo de tarea (clasificacion de accion sobre imagen) esos motores de inferencia de texto no son el camino natural.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `romplle/grpo-vs-sft-ood-adapters` | LoRA sobre 222M | no disponible | Control en MiniGrid Empty (3 acciones) | MIT | Hugging Face, 0 descargas |
| `lusxvr/nanoVLM-222M` (modelo base) | 222M | no disponible | Vision-lenguaje general | no disponible en la informacion | Hugging Face |
| Alternativas de VLM pequenos para control | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de este repositorio ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo MiniGrid Empty con tres acciones discretas; no es un modelo de proposito general y no debe presentarse como tal.
- Artefacto de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion externa independiente.
- Las cifras de rendimiento no acompanan al repositorio; hay que consultarlas en el README del proyecto GitHub, lo que impide evaluar el modelo solo desde Hugging Face.
- Los adaptadores GRPO dependen de su adaptador SFT de origen; cargarlos de forma aislada produce resultados invalidos.
- Los adaptadores estan atados a la version concreta del modelo base `lusxvr/nanoVLM-222M`; cambios en el checkpoint base pueden romper la compatibilidad.
- Riesgo de sobreajuste a la distribucion de entrenamiento (tableros 8x8, color de objetivo y posiciones iniciales concretas), que es precisamente lo que el experimento intenta medir.
- No hay informacion sobre sesgos, alucinacion en sentido linguistico ni cobertura multilingue porque el modelo no genera lenguaje libre en esta configuracion.
- Licencia MIT permite uso comercial del artefacto, pero la utilidad comercial es practicamente nula dado el dominio; verificar aparte la licencia del modelo base antes de cualquier uso derivado.
- El repositorio mezcla adaptadores de multiples experimentos en una sola descarga de 0,8 GB; es facil cargar el checkpoint equivocado si no se sigue la nomenclatura de carpetas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/romplle/grpo-vs-sft-ood-adapters
- Repositorio GitHub del proyecto: https://github.com/romplle/grpo-vs-sft-ood
- Modelo base: https://huggingface.co/lusxvr/nanoVLM-222M
