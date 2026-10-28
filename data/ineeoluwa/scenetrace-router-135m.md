# Ineeoluwa/scenetrace-router-135m

## Resumen

`scenetrace-router-135m` es un adaptador LoRA de rango 8 entrenado sobre `HuggingFaceTB/SmolLM2-135M-Instruct` por el autor Ineeoluwa (usuario de HuggingFace) para una tarea muy concreta: el enrutado restringido a cinco herramientas de un espacio de trabajo de vídeo (`search`, `library`, `count`, `export`, `inspect`). No es un modelo de propósito general ni un VLM: es un cabezal de política que puntúa cinco completaciones fijas y elige una, dentro de la aplicación SceneTrace. El modelo base aporta los 135 millones de parámetros; el adaptador solo añade pesos de bajo rango.

El interés técnico está en el método de entrenamiento y en la honestidad metodológica de la model card: tres épocas de SFT con pérdida únicamente sobre la completación, seguidas de 60 pasos de GRPO con acciones finitas (grupo de 6, temperatura 3, dos actualizaciones con recorte por rollout, recompensa de enrutado exacta y penalización KL contra la referencia SFT). La etapa publicada es la de SFT, y se incluyen los checkpoints de comparación (`comparisons/sft` y `comparisons/grpo`) junto con el historial de entrenamiento.

Es relevante ahora como ejemplo reproducible y de bajo coste de cómo se aplica RL (GRPO) a una tarea de enrutado con espacio de acciones cerrado, y como evidencia de que un modelo de 135 M puede resolver una clasificación de 5 clases con datos sintéticos. La propia model card advierte de que la evaluación (40 preguntas sintéticas retenidas) no demuestra fiabilidad con usuarios reales ni ganancias de razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre un transformer decoder-only: `SmolLM2-135M-Instruct` (revisión base `12fd25f77366fa6b3b4b768ec3050bf629380bac`) |
| Parametros totales | 135 M en el modelo base; número de parámetros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la model card indica "contexto limitado" |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos de adaptador en safetensors, sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Apache 2.0 (modelo base y adaptador); el codigo de la aplicacion es MIT |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA); el repositorio ocupa 0.0 GB |
| Pipeline | `text-generation` |
| Etapa publicada | SFT (los checkpoints GRPO y SFT de comparacion se incluyen en `comparisons/`) |
| Tarea | Enrutado restringido a 5 herramientas: `search`, `library`, `count`, `export`, `inspect` |

## Arquitectura y entrenamiento

El adaptador se monta sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 M de parámetros, con un LoRA de rango 8. La innovación no está en la arquitectura sino en cómo se define la política de inferencia: el modelo no genera texto libre, sino que puntúa cinco completaciones fijas (una por herramienta) y sus log-probabilidades normalizadas por longitud definen la distribución de elección. La implementación vive en `scenetrace.policy.Planner` del repositorio de código, y la model card advierte explícitamente de que la generación libre no reproduce la evaluación de enrutado restringido.

El entrenamiento consistió en tres épocas de SFT con pérdida solo sobre la completación (completion-only), seguidas de 60 pasos de GRPO con espacio de acciones finito: tamaño de grupo 6, temperatura de muestreo 3, dos actualizaciones con recorte por rollout, recompensa de enrutado exacta y penalización KL contra la referencia SFT. La selección de modelo se hizo con preguntas de validación y el conjunto de test se evaluó después. Los datos de entrenamiento son sintéticos y proceden del dataset `Ineeoluwa/scenetrace-tool-traces`; el particionado 480/40/40 es disjunto por familia de plantillas de pregunta. La recuperación CLIP que usa la aplicación es un modelo congelado e independiente, no parte de este adaptador.

## Capacidades

- Clasificación de intención en un espacio cerrado de cinco rutas de herramienta (`search`, `library`, `count`, `export`, `inspect`) para un espacio de trabajo de vídeo.
- Puntuación calibrada por longitud de cinco completaciones candidatas, en lugar de generación abierta.
- Enrutado de un solo paso ("finite-action"), adecuado para integrarse en un planificador que valida cada llamada a herramienta.
- Ejecución en CPU con latencia conocida (media de 1,610-1,659 s por decisión en el hardware de la evaluación).
- Entrenamiento reproducible: se publican objetivos, historial de entrenamiento y predicciones por ejemplo.
- No soporta tool calling arbitrario, agentes multi-paso, visión, audio ni razonamiento general; la model card lo excluye de forma explícita.
- Multilingüe: no; solo inglés.

## Casos de uso

- Enrutado de acciones en un editor de vídeo conversacional: el planificador recibe la petición del usuario, el adaptador elige una de las cinco herramientas y la aplicación valida la llamada antes de ejecutarla, con aprobación independiente para `export`.
- Clasificador de intención de bajo coste en producción: con 135 M de parámetros y ~1,6 s en CPU, se puede desplegar junto a la lógica de negocio sin GPU dedicada ni coste por token en un proveedor externo.
- Componente de un sistema de agentes con espacio de acciones restringido: sirve como política de selección de herramienta cuando el catálogo es pequeño y estable, y donde interesa que el modelo no pueda inventar herramientas nuevas.
- Ejecución local u offline en entornos con requisitos de privacidad: al caber en CPU y no requerir servicios externos, las peticiones no salen de la máquina.
- Pruebas de regresión de políticas de enrutado en CI: el repositorio incluye checkpoints de comparación (SFT y GRPO) y predicciones por ejemplo, lo que permite fijar una línea base y detectar degradaciones al cambiar plantillas o datos.
- Material docente o de investigación para RL con verificación exacta: es un caso mínimo y auditable de GRPO con acciones finitas, recompensa determinista y penalización KL, útil para estudiar el efecto del RL frente al SFT en una tarea controlada.
- Filtro previo en pipelines de análisis de vídeo: descartar o dirigir peticiones hacia `count` o `search` antes de invocar modelos más caros (por ejemplo, el recuperador CLIP congelado).

## Benchmarks y rendimiento

Evaluación propia del autor sobre 40 preguntas sintéticas retenidas (particionado 480/40/40, disjunto por familia de plantilla). No son benchmarks estándar y la model card lo advierte.

| Etapa | Rutas correctas (held-out) | Exactitud | Latencia media de enrutado en CPU |
|---|---:|---:|---:|
| BASE (SmolLM2-135M-Instruct) | 8/40 | 20,0 % | 1,531 s |
| SFT (etapa publicada) | 40/40 | 100,0 % | 1,659 s |
| GRPO | 40/40 | 100,0 % | 1,610 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la informacion disponible. El autor indica que este conjunto de 40 preguntas no establece fiabilidad con usuarios reales ni ganancias de razonamiento general, y que el GRPO no superó al SFT en la puerta de selección (por eso se publica SFT).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,27 GB en fp16 y 0,54 GB en fp32 para los pesos del modelo base de 135 M, más el adaptador LoRA (cálculo aritmético a partir del número de parámetros, no una medición publicada).
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060/4060/4090, GTX 1660, e incluso iGPU con suficiente memoria compartida); también se ejecutó en CPU en la evaluación del autor.
- GPU recomendadas: ninguna en particular; para este tamaño no se justifica una A100/H100 salvo por agregación de muchas peticiones concurrentes.
- Despliegue: `transformers` + `peft` es la vía prevista, usada a través de `scenetrace.policy.Planner` con el directorio del adaptador. No se publican pesos fusionados ni GGUF, así que llama.cpp/Ollama requerirían fusionar el adaptador y convertirlo por cuenta propia.
- Latencia: 1,531-1,659 s de media por decisión en CPU según la etapa (dato del autor, hardware no especificado). Throughput en GPU: no disponible.
- Coste: la model card indica que el coste estimado usa un precio asumido de hora de CPU, no facturas reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scenetrace-router-135m (SFT) | 135 M + LoRA rango 8 | no disponible | 40/40 (100 %) en held-out sintetico | Apache 2.0 | Adaptador publicado en HuggingFace |
| scenetrace-router-135m (GRPO) | 135 M + LoRA rango 8 | no disponible | 40/40 (100 %) en held-out sintetico | Apache 2.0 | Checkpoint en `comparisons/grpo` |
| SmolLM2-135M-Instruct (base) | 135 M | no disponible en la informacion proporcionada | 8/40 (20 %) en held-out sintetico | Apache 2.0 | HuggingFace |

No se dispone de datos para comparar con otras familias de modelos de enrutado (por ejemplo, clasificadores dedicados o routers basados en LLM de mayor tamaño) en la informacion proporcionada. La comparación con los resultados de la busqueda web (listas de frameworks de routing como `awesome-model-routing`, OpenRouter o NightRouter) no es posible: no aportan métricas sobre esta tarea.

## Limitaciones y advertencias

- El modelo solo entiende peticiones sintéticas en inglés y solo puede elegir entre cinco rutas; no es un agente de vídeo autónomo ni un VLM.
- Contexto limitado (la model card no da una cifra); peticiones largas o conversaciones multi-turno complejas quedan fuera de su diseño.
- Los valores de confianza son puntuaciones categóricas sin calibrar; no deben interpretarse como probabilidades fiables.
- Riesgo de alucinación en el sentido de asignar una herramienta incorrecta con alta puntuación; el enrutado debe validarse en la capa de aplicación (la app valida cada llamada y exige aprobación para `export` de forma independiente al modelo).
- Evaluación muy pequeña (40 ejemplos sintéticos, particionado por familia de plantilla): la exactitud del 100 % no es extrapolable a tráfico real ni a plantillas nuevas fuera de las familias vistas.
- El GRPO no aportó mejora medible sobre el SFT en la puerta de selección; el resultado del RL se publica igualmente por transparencia.
- No se hace ninguna declaración de seguridad, uso médico, legal, vigilancia ni comprensión visual amplia; debe evitarse su uso en esos dominios.
- Licencia: Apache 2.0 permite uso comercial, pero el código de la aplicación es MIT y las garantías son las del modelo base; conviene revisar `release.json` (sumas de verificación de modelo y evaluación) antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ineeoluwa/scenetrace-router-135m
- Dataset de entrenamiento: https://huggingface.co/datasets/Ineeoluwa/scenetrace-tool-traces
- Codigo fuente e implementacion de inferencia: https://github.com/Eunini/scenetrace
- Demo del espacio de trabajo: https://scenetrace-inioluwa.vercel.app
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Lista de frameworks de enrutado de modelos (contexto general, no especifica de este modelo): https://github.com/yenanjing/awesome-model-routing
- Proyecto homonimo no relacionado (regresion de agentes): https://github.com/santaaaron/ScenTrace
- Pasarelas y catalogos de modelos citados en la busqueda: https://openrouter.ai/ y https://nightrouter.ai/models
