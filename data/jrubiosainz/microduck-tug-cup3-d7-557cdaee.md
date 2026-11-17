# jrubiosainz/microduck-tug-cup3-d7-557cdaee

## Resumen

Microduck Tug of War cup3-d7-557cdaee es una política de control para robótica dentro del ecosistema Microduck Arena, publicada por el usuario jrubiosainz. No se trata de un modelo de lenguaje ni de una red neuronal entrenada de novo: es una composición de trayectorias de rating sobre una política base, empaquetada en formato ONNX para su ejecución en un entorno de simulación x86. El modelo resuelve la tarea de "tug of war" (tirar de un objeto) en el simulador Microduck, un banco de pruebas de robótica impulsado por Pollen Robotics.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de investigación reproducible, con hashes SHA256 declarados, ventanas de ejecución documentadas y una trazabilidad explícita de la procedencia de cada fila de su tabla de replay. El autor lo describe como una "composición de trayectoria de rating", no como un nuevo entrenamiento, y advierte explícitamente que es solo para simulación y que no debe cargarse en un robot físico.

El tamaño del artefacto es de 1.003.410 bytes (aproximadamente 1 MB), con una política x86 de SHA256 `557cdaee...` y una tabla de replay canónica de 347 pares observación/acción. La licencia no está declarada y los idiomas no aplican, dado que no es un modelo lingüístico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control basada en tabla de lookup (replay-table) sobre grafo ONNX de 27 nodos; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | no disponible (el artefacto pesa 1.003.410 bytes; no se declara recuento de parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre observaciones de simulación) |
| Tipos de cuantización | no disponible (el artefacto es una política ONNX empaquetada; el modelo base figura como `quantized` en los tags de Hugging Face) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (grafo de 27 nodos con inicializadores `search_obs` y `search_act`) |

## Arquitectura y entrenamiento

La política D7 no es una red entrenada, sino una composición de trayectorias de rating. Según la model card, el controlador genérico y el contenido fuera de la tabla de replay son idénticos a los de la política B (`jrubiosainz/microduck-tug-cup3-a74f-s3s4s5-4ec4a504@138f3ab...`, SHA256 `4ec4a504...`). La única diferencia respecto a B son los inicializadores `search_obs` y `search_act` del grafo ONNX. El fallback L1 tiene SHA256 `c23b073f...`.

La tabla de replay contiene 347 pares observación/acción con orden `2,3,4,5,1`. La composición combina cinco seeds: los seeds 2 y 3 son idénticos a las trayectorias B del autor; el seed 4 proviene de la trayectoria de HlibPlakhtii en v5; el seed 5 es un refinamiento por búsqueda de coordenadas acotada de la trayectoria B seed-5 realizado por HlibPlakhtii en v7; y el seed 1 es una trayectoria propia de 66 filas del autor. Los 281 pares de los seeds 2 a 5 son bit a bit idénticos a v7. Dentro del seed 1, 63 pares se comparten con v7 y tres se reemplazan.

No hay datos de entrenamiento en el sentido habitual (tokens, dataset, RLHF/DPO). La "innovación técnica" es metodológica: una composición de trayectorias con trazabilidad criptográfica, verificación estática del grafo ONNX contra la política B, y una prueba derivada de igualdad de acciones sobre un corpus finito de 307.714 observaciones procedentes de 1.744 ficheros. El comando canónico de velocidad es `vx: -0.3`.

## Capacidades

- Ejecución de una política de control de robot en simulación Microduck para la tarea "tug of war" (tirar de un objeto).
- Lookup determinista sobre 347 pares observación/acción con orden definido `2,3,4,5,1`.
- Fallback L1 declarado para observaciones fuera de tabla.
- Verificación estática de integridad: grafo ONNX de 27 nodos, metadatos y tensores no-fila idénticos a la política B.
- Reproducibilidad exacta: el guest x86 reprodujo la predicción offline con media aceptada de 168.90317916870117.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo thinking. No es un modelo de lenguaje.

## Casos de uso

- Investigación en robótica simulada: usar la política como referencia reproducible en Microduck Arena para comparar estrategias de control en la tarea de tirar de un objeto, aprovechando los hashes y ventanas de ejecución documentados.
- Auditoría de procedencia de políticas: el artefacto sirve como caso de estudio de trazabilidad de filas de replay, con atribución explícita a HlibPlakhtii, suraj-phanindra, lphatnguyen, greecree, Unique007, rumezhak y a1rb4Ck/juicenv.
- Verificación de integridad en pipelines de CI: los SHA256 de política, fallback y tabla permiten integrar comprobaciones automáticas de que los bytes desplegados coinciden con los revisados.
- Reproducción de evaluaciones offline: la media aceptada y las cinco puntuaciones por seed permiten replicar la evaluación x86 y contrastar resultados.
- Estudio de composición de trayectorias: útil para investigadores que quieran analizar cómo se combinan seeds de distintas fuentes en una única tabla de lookup sin reentrenar.
- Docencia en robótica y sistemas: ejemplo compacto (1 MB) de grafo ONNX con lookup y fallback para explicar verificación estática y pruebas de igualdad de acciones.
- No es adecuado para despliegue en robot físico, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados son los de la propia model card, correspondientes a la ejecución en guest x86 de la política D7 completa:

| Seed | Ganancia de terreno (cm), x86 exacto |
|---|---:|
| 1 | 169.02587413787842 |
| 2 | 169.06843781471252 |
| 3 | 168.46919655799866 |
| 4 | 169.4170892238617 |
| 5 | 168.53529810905457 |
| Media aceptada | 168.90317916870117 |

El runner 5 con `vx -0.3` devolvió cinco resultados `pit_won`, 347/347 aciertos de lookup y cero fallbacks, bad-hits o valores no finitos. El digest canónico de la tabla es `785eb6d3786e9b97c3c21519a395cd739561b1f356d9d0a1862c9f2148961380`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de modelos de lenguaje; el artefacto ONNX pesa aproximadamente 1 MB y se ejecuta en CPU x86.
- GPU recomendadas: no se declara ninguna; la evaluación documentada es en guest x86.
- Cabe en cualquier hardware consumer: el tamaño de 1.003.410 bytes permite ejecución en CPU sin GPU.
- Opciones de despliegue: runtime ONNX estándar; la librería declarada es `microduck`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles. La ventana del guest documentada es 2026-11-17T14:34:12Z–14:35:27Z y la del wrapper 14:32:00Z–14:35:35Z, pero no se declaran métricas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jrubiosainz/microduck-tug-cup3-d7-557cdaee | Política ONNX por lookup | ~1 MB | no aplica | Media 168.90 cm (x86) | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-a74f-s3s4s5-4ec4a504 (B) | Política ONNX base | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-cup-nov17-v7 | Política ONNX (fuente de tabla) | no disponible | no aplica | no disponible en esta ficha | no disponible | Hugging Face |

La comparación con modelos de lenguaje no procede. Las alternativas reales son otras políticas del mismo ecosistema Microduck Arena, y los datos de rendimiento de B y v7 no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor advierte explícitamente "do not load this policy on a physical robot".
- No es un resultado oficial publicado: la model card indica "not an official published result" y separa los resultados x86 de cualquier publicación posterior de la Arena.
- La cobertura global de la tabla se declara UNKNOWN/INCOMPLETE; solo la Arena decide `copy_of`.
- No se reclama seguridad H2H universal, no-regresión, equivalencia ante comandos no vistos, resultado closed-loop contra oponentes actuales ni victoria en la Cup.
- La prueba de igualdad de acciones sobre el corpus finito de 307.714 observaciones es derivada, no una comparación medida de arrays de acciones.
- No se realizó shadow de acciones exacto-D7 con entradas almacenadas bajo la revisión estática inicial; el suplemento finito es separado.
- Las afirmaciones dependen de que los bytes reales del guest coincidan con los revisados; si difieren, deben rebindearse.
- Licencia no declarada: riesgo para uso comercial o redistribución sin aclaración del autor.
- Sesgos y alucinación: no aplican en el sentido lingüístico, pero la política puede fallar fuera de su tabla y recurrir al fallback L1.
- Sin soporte multilingüe ni de contexto largo: no es un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-d7-557cdaee
- Modelo base B: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3s4s5-4ec4a504
- Fuente de tabla v7: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v7
- Fuente histórica v5: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v5
- Fuente histórica v6: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v6
- Pollen Robotics (Microduck y Arena): no se proporciona URL en la información disponible
