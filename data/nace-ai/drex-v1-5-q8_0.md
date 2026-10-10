# nace-ai/drex-v1.5-Q8_0

## Resumen

Drex v1.5 Q8_0 es la versión cuantizada en formato GGUF del modelo de decisión Drex v1.5, desarrollado por Nace.AI (cuenta `nace-ai` en HuggingFace). No es un modelo generativo de chat: recibe un estado (`state`) junto con una o varias preguntas tipadas con nombre (`named typed questions`) y devuelve una probabilidad para cada opción posible. Su función es actuar como componente de decisión rápida («system one») dentro de sistemas mayores, donde se necesita una política probabilística en lugar de texto libre.

El modelo tiene 8.955.900.929 parámetros (unos 8,96 mil millones) y el fichero GGUF ocupa 9.531.694.816 bytes (9,5 GB), aproximadamente la mitad que los pesos en bf16 del modelo base. El GGUF declara la arquitectura `qwen35` y contiene 250 tensores en Q8_0, 180 en F32 y dos en BF16; la cabeza de decisión (`pointer head`) no se cuantiza. El repositorio se publicó el 9 de octubre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni «likes».

Su interés actual está en un nicho poco cubierto por el ecosistema abierto: modelos de decisión con salida probabilística sobre opciones discretas y ejecutables en local. A cambio, exige runtimes bifurcados (forks de llama.cpp y de Ollama en la rama `drex-v1.5`), porque su interfaz no es la generación de texto habitual sino un endpoint `POST /v1/systemone`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (según la declaración del GGUF); modelo de decisión derivado de nace-ai/drex-v1.5, con cabeza de decisión (`pointer head`) no cuantizada |
| Parámetros totales | 8.955.900.929 (≈8,96 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de ejemplo indicada por el autor; ventanas mayores requieren seguir `docs/context-length.md` |
| Tipos de cuantización | Q8_0 (único fichero de este repositorio); los pesos del modelo base están en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Nace.AI Open RAIL-M (`license: other`) |
| Formato de pesos | GGUF |
| Tamaño del fichero | 9.531.694.816 bytes (9,5 GB) |
| SHA-256 | `7ff3285686e7bef7b477a37e6f260837381222c3e463cc802f61f617de2a4ed5` |
| Composición del GGUF | 250 tensores Q8_0, 180 tensores F32, 2 tensores BF16 |
| Modelo base | nace-ai/drex-v1.5 |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un GGUF con arquitectura declarada `qwen35`, lo que sitúa el modelo base en la familia Qwen, aunque no se detalla el número de capas, la configuración de atención, el tipo de normalización ni si emplea alguna variante de atención lineal o decodificación especulativa. Los 180 tensores en F32 y los dos en BF16 (frente a 250 en Q8_0) indican que una parte relevante de los parámetros se mantiene sin cuantizar, en particular la cabeza de decisión o `pointer head`, que el autor indica explícitamente que no se cuantiza. Esa decisión es coherente con un modelo cuya salida es una distribución de probabilidad sobre opciones discretas: cuantizar la cabeza degradaría la calibración de las probabilidades.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre el procedimiento con el que se generan las preguntas tipadas y las opciones. Tampoco se documenta el mecanismo interno que convierte el estado y las preguntas en probabilidades. Lo único verificado por el autor es la equivalencia funcional: frente al servidor Python, el GGUF Q8_0 da las mismas respuestas en una instancia AWS g5.2xlarge (NVIDIA A10G de 24 GB, CUDA 13.2) y también en un Apple M5 Pro con 48 GB de memoria unificada, tanto en Metal como en CPU.

## Capacidades

- Decisión probabilística: dada una variable `state` y una o varias preguntas tipadas y nombradas, devuelve una probabilidad para cada opción propuesta.
- Salida estructurada sobre conjuntos de opciones discretas, apta para elegir una acción o para alimentar políticas con umbral configurable.
- Integración como servidor: expone `POST /v1/systemone` en el fork de llama.cpp y declara compatibilidad con endpoints (`endpoints_compatible`) y etiqueta `conversational`.
- Ejecución local con cuantización Q8_0 en CUDA y en Metal, y también en CPU.
- Soporte de lotes y paralelismo de secuencias en el servidor de ejemplo (`-np 2`), pensado para servir varias peticiones.
- Despliegue vía GGUF con `llama-server` (fork `drex-v1.5`) y vía Ollama (fork `drex-v1.5`, con `CAPABILITY decision`).
- No disponible: generación de texto libre, razonamiento multi-paso autónomo, tool calling, capacidades multimodales (visión o audio), soporte multilingüe declarado y modo «thinking». Nada de esto se menciona en la información proporcionada.

## Casos de uso

- Enrutamiento de acciones en agentes: dado el estado actual de la conversación o del entorno, formular una pregunta del tipo «siguiente_acción» con opciones enumeradas y usar las probabilidades devueltas para seleccionar la rama de ejecución con mayor probabilidad o para muestrear durante la exploración.
- Triaje de peticiones en atención al cliente: definir preguntas como «prioridad» o «tipo_de_incidencia» con opciones cerradas y usar la distribución de salida para enrutar el ticket al equipo correspondiente, aplicando umbrales de confianza.
- Políticas de decisión en simulación y juegos: consultar el modelo en cada turno con el estado del entorno y un conjunto finito de acciones legales, obteniendo una política probabilística reutilizable sin reentrenar.
- Algoritmos de bandit y experimentación A/B: emplear las probabilidades como puntuaciones para balancear explotación y exploración en la asignación de variantes.
- Control de bucles cerrados en robótica o automatización: el modelo devuelve una opción entre comandos discretos a partir del estado de sensores, con latencia de un único paso de inferencia y sin generación autoregresiva de texto.
- Clasificación con incertidumbre explícita en pipelines de datos: etiquetar registros con una pregunta tipada y conservar la probabilidad asociada para decidir después si el caso se resuelve automáticamente o se escala a revisión humana.
- Moderación y evaluación de contenido con umbral ajustable: obtener la probabilidad por etiqueta y fijar el punto de corte según la tolerancia a falsos positivos del producto.
- Análisis de preferencias y encuestas: modelar la probabilidad de cada opción declarada, útil para estimar distribuciones agregadas en lugar de una única respuesta categórica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de métricas propias de modelos de decisión (por ejemplo, precisión frente a la opción correcta, log-loss o error de calibración). Los únicos resultados reportados por el autor son pruebas de equivalencia funcional, no comparativas de calidad:

| Prueba | Entorno | Resultado declarado |
|---|---|---|
| Equivalencia GGUF vs servidor Python | AWS g5.2xlarge (NVIDIA A10G 24 GB, CUDA 13.2) | Mismas respuestas |
| Equivalencia Metal vs CPU | Apple M5 Pro, 48 GB de memoria unificada | Mismas respuestas |
| Latencia y throughput | no disponible | no disponible |

## Requisitos de hardware

- VRAM para los pesos: el fichero Q8_0 ocupa 9,5 GB, por lo que la inferencia requiere del orden de 10 GB solo para pesos.
- Memoria adicional: hay que sumar la caché KV correspondiente a la ventana configurada (`-c 32768` en el ejemplo del autor, con `-b 16384` y `-ub 2048`); su tamaño exacto no se detalla en la información disponible, ya que depende de capas, cabezas y dimensión de cabeza del modelo base. Con la configuración de 16.384 tokens indicada como límite práctico, una GPU de 24 GB es un objetivo seguro.
- GPU verificadas por el autor: NVIDIA A10G de 24 GB (CUDA 13.2) en AWS g5.2xlarge, y Apple M5 Pro con 48 GB de memoria unificada (Metal y CPU).
- GPU recomendadas (estimación a partir del tamaño del fichero): A10G, L4, L40S, A100, H100, RTX 3090 y RTX 4090 (24 GB) deberían alojar el modelo completo en memoria de vídeo. Tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) probablemente funcionen con ventanas de contexto reducidas. Tarjetas de 12 GB o menos no son suficientes para los pesos más la caché KV.
- ¿Cabe en GPU de consumo? Sí, en modelos de 24 GB de VRAM (RTX 3090, RTX 4090) con margen para contexto; en 16 GB conviene recortar la ventana de contexto. Es una estimación, no un dato confirmado por el autor.
- Opciones de despliegue: `llama-server` del fork `nace-ai/llama.cpp` (rama `drex-v1.5`), con `-ngl 99` para CUDA o Metal; Ollama del fork `nace-ai/ollama` (rama `drex-v1.5`) usando un `Modelfile` con `FROM ./drex-v1.5-Q8_0.gguf`, `CAPABILITY decision` y `PARAMETER num_ctx 16384`. El endpoint servido es `POST /v1/systemone`. No se documenta soporte en vLLM, TGI ni en llama.cpp upstream.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos abiertos comparables que compartan la tarea (salida de probabilidades sobre opciones discretas a partir de un estado y preguntas tipadas). La comparación que sigue es por categoría de herramienta, no por rendimiento, y las celdas sin datos confirmados se marcan como no disponibles.

| Criterio | Drex v1.5 Q8_0 | LLM instruct genérico (~7-9 mil millones) | Clasificador supervisado dedicado |
|---|---|---|---|
| Tipo de salida | Probabilidad por opción, sobre preguntas tipadas | Texto libre (se puede forzar JSON, con menor calibración) | Etiqueta o probabilidad por clase |
| Parámetros | 8.955.900.929 | ~7-9 mil millones según modelo | No aplica |
| Contexto | 16.384 tokens en la configuración de ejemplo | No disponible en esta comparación | No aplica |
| Razonamiento multi-paso | No documentado | Sí, vía cadena de pensamiento | No |
| Tool calling | No documentado | Habitual en modelos instruct actuales | No |
| Licencia | Nace.AI Open RAIL-M (con restricciones) | Variable según modelo | Depende del código propio |
| Formato de despliegue | GGUF, con runtimes bifurcados | GGUF, safetensors, múltiples motores | Servicio propio |
| Rendimiento comparado | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance funcional restringido: no es un modelo de generación de texto ni de conversación libre; intentar usarlo como chat o para completar texto no es un caso soportado por la información disponible.
- Dependencia de forks: el despliegue requiere la rama `drex-v1.5` de llama.cpp o de Ollama. No hay confirmación de soporte en llama.cpp upstream, vLLM, TGI u otros motores, lo que añade riesgo de mantenimiento en producción.
- Licencia: Nace.AI Open RAIL-M, una licencia de tipo RAIL que incorpora restricciones de uso. Es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial o de redistribución.
- Idiomas: no se declara ningún idioma soportado, por lo que no se puede asumir cobertura multilingüe ni siquiera en inglés.
- Calibración: al tratarse de un modelo que emite probabilidades, la utilidad depende de que estén calibradas. No se publica ningún informe de calibración, log-loss, Brier score ni curva de fiabilidad, y no hay evidencia de que las probabilidades sean interpretables como frecuencias.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, culturales o de dominio.
- Alucinación: en un modelo de decisión el riesgo equivalente es asignar probabilidad alta a opciones incorrectas o inventar opciones no pertinentes; no se documentan evaluaciones de robustez ante estados fuera de distribución.
- Adopción nula verificable: 0 descargas y 0 «likes» en HuggingFace, sin resultados de benchmarks publicados, lo que implica ausencia de validación independiente por parte de la comunidad.
- Contexto: la configuración de ejemplo atiende peticiones de hasta 16.384 tokens; superar esa ventana exige pasos adicionales descritos en la documentación del repositorio y no está cubierto por el comando estándar.
- Fechas y versionado: el repositorio se creó el 9 de octubre de 2026 y se actualizó ese mismo día; conviene fijar el SHA-256 del fichero para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nace-ai/drex-v1.5-Q8_0
- Modelo base (Drex v1.5): https://huggingface.co/nace-ai/drex-v1.5
- Repositorio de modelos de decisión de Nace.AI: https://github.com/nace-ai/drex-decision-models
- Página del modelo dentro del repositorio: https://github.com/nace-ai/drex-decision-models/tree/main/models/drex-v1.5
- Fork de llama.cpp (rama `drex-v1.5`): https://github.com/nace-ai/llama.cpp
- Fork de Ollama (rama `drex-v1.5`): https://github.com/nace-ai/ollama
- Formato de petición del endpoint `/v1/systemone`: https://github.com/nace-ai/drex-decision-models/blob/main/docs/request-format.md
- Documentación sobre longitud de contexto: https://github.com/nace-ai/drex-decision-models/blob/main/docs/context-length.md
- Licencia Nace.AI Open RAIL-M: fichero `LICENSE` del repositorio de HuggingFace
- Búsqueda web: los resultados devueltos corresponden a la nomenclatura estadística de actividades económicas NACE (Eurostat, INSEE, Wikipedia) y no guardan relación con este modelo; no se han encontrado en la búsqueda papers, blogs ni demos relevantes.
