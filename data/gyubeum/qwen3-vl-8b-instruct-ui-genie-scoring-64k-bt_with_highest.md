# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-64k-bt_with_highest

## Resumen

Qwen3-VL-8B-Instruct-UI-Genie-scoring-64k-bt_with_highest es un modelo de recompensa escalar (reward model) multimodal desarrollado por el usuario Gyubeum, derivado de la familia Qwen3-VL y publicado en HuggingFace. No es un modelo generativo: su salida es una puntuación numérica que estima la calidad de una respuesta o trayectoria, calculada aplicando `score.weight` al estado oculto del último token no de relleno. Está pensado para evaluar y ordenar trayectorias de agentes que operan sobre interfaces gráficas (GUI), en particular en Android.

El checkpoint es el resultado de fusionar el adaptador del modelo de lenguaje entrenado con la cabeza de recompensa escalar, de modo que no requiere ni adaptadores separados ni una ruta local al modelo base. Es la versión fusionada de AndroidFlux LPV v2 (`bt_with_highest`, época 1, paso 37), cuyo modelo padre es el reward model Bradley-Terry UI-Genie de 64k. El entrenamiento utiliza preferencias generadas mediante Latent Peer Voting (LPV) sobre candidatos producidos por Qwen3-VL-8B, GUI-Owl-7B, GUI-Owl-1.5-8B y MAI-UI-8B.

Con 8.767.127.792 parámetros (~8,77 mil millones) y un repositorio de 17,5 GB, es relevante ahora porque cubre una necesidad creciente: disponer de un evaluador automático para agentes GUI, útil tanto para RLHF/DPO como para filtrado de datos y evaluación continua. La model card reporta un 91,10% de precisión por pares en UI-Genie, aunque el propio autor advierte que las métricas proceden del checkpoint original sin fusionar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (Qwen3-VL) con cabeza de recompensa escalar |
| Parámetros totales | 8.767.127.792 (~8,77 mil millones) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64.000 tokens (según la denominación del checkpoint y del modelo padre; no se detalla en la model card) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Tipo de modelo | reward-model (puntuación escalar, no generativo) |
| Librería | transformers |
| Tamaño del repositorio | 17,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-VL-8B-Instruct, un transformer multimodal con codificador visual y decodificador de lenguaje, al que se añade una cabeza de recompensa escalar (`score.weight`). La puntuación se obtiene aplicando esa cabeza al estado oculto del último token no de relleno de la secuencia. El checkpoint publicado está fusionado, por lo que integra tanto el adaptador del modelo de lenguaje entrenado como la cabeza de recompensa, sin necesidad de cargar componentes adicionales por separado.

El entrenamiento se basa en preferencias generadas con Latent Peer Voting (LPV) v2. Los candidatos provienen de cuatro modelos: Qwen3-VL-8B, GUI-Owl-7B, GUI-Owl-1.5-8B y MAI-UI-8B. Cada experto evalúa las respuestas de sus pares excluyendo la suya propia, y las verosimilitudes de respuesta normalizadas por conjunto se agregan mediante pesos derivados del rendimiento de recuperación (recovery-performance weights). Sobre esas preferencias se aplica entrenamiento Bradley-Terry, comparando el candidato de mayor recompensa con el de menor recompensa. El checkpoint corresponde a la época 1, paso 37, del modelo padre de 64k.

## Capacidades

- Puntuación escalar de respuestas y trayectorias: devuelve un valor numérico de calidad, no texto.
- Evaluación de agentes GUI, con foco declarado en entornos Android, mediante los conjuntos AndroidFlux recovery y UI-Genie.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), necesario para evaluar capturas de pantalla junto con acciones o instrucciones.
- Comparación por pares: entrenado con Bradley-Terry, por lo que está diseñado para ordenar dos candidatos según preferencia.
- Modelo de recompensa para RLHF/DPO y para reranking tipo best-of-N.
- Agregación de preferencias entre múltiples modelos expertos mediante Latent Peer Voting.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés (`en`).
- Tool calling / function calling: no disponible; al ser un modelo de recompensa escalar no genera llamadas a herramientas.
- Modo de razonamiento explícito (thinking): no disponible; la salida es una puntuación, no una cadena de razonamiento.
- Visión: sí, heredada del backbone Qwen3-VL.
- Audio: no disponible.

## Casos de uso

- Entrenamiento por refuerzo con retroalimentación humana o de IA (RLHF/DPO): el modelo actúa como función de recompensa que puntúa trayectorias de agentes Android durante el entrenamiento de la política, sustituyendo parte del etiquetado humano.
- Filtrado y curado de datos de trayectorias: dado un lote de trayectorias recogidas en producción, el modelo permite descartar las de baja puntuación antes de incorporarlas a un dataset de ajuste, mejorando la relación señal-ruido del conjunto.
- Evaluación automática de agentes GUI en CI/CD: integrar el modelo como paso de evaluación que puntúa un conjunto fijo de tareas de UI-Genie y bloquea el despliegue si la precisión por pares cae por debajo de un umbral definido.
- Reranking best-of-N en inferencia: generar varias propuestas de acción o respuesta con un agente y usar la puntuación escalar para seleccionar la mejor antes de ejecutarla en el dispositivo.
- Investigación en agregación de preferencias (LPV): reproducir y extender el pipeline de Latent Peer Voting comparando cómo un comité de expertos evalúa a sus pares y cómo se ponderan esas evaluaciones por rendimiento de recuperación.
- Enrutado entre modelos (model routing): puntuar las salidas de varios agentes candidatos en producción (GUI-Owl-7B, MAI-UI-8B, Qwen3-VL-8B) y dirigir cada tarea al que obtiene mayor recompensa en ese contexto concreto.
- Anotación de preferencias a escala: generar pares ordenados de trayectorias para alimentar etapas posteriores de DPO, reduciendo el coste frente a anotadores humanos.
- Análisis de regresiones por tipo de tarea: usar las puntuaciones desagregadas por conjunto (AndroidFlux recovery frente a UI-Genie) para localizar en qué dominio el agente ha empeorado tras un cambio de modelo o de política.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son de precisión por pares. El propio autor indica que las mediciones proceden del checkpoint original sin fusionar, no del checkpoint fusionado que se distribuye.

| Dataset | Precisión por pares | Pares evaluados |
|---|---:|---:|
| AndroidFlux recovery | 61,84% | 76 |
| UI-Genie | 91,10% | 1.000 |

No se han publicado en la información disponible resultados comparativos frente a otros reward models, ni métricas de MMLU, HumanEval, GSM8K u otros benchmarks estándar. La diferencia de casi 30 puntos entre ambos conjuntos sugiere una fuerte dependencia del dominio de evaluación.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 17,5 GB solo para pesos, más la caché KV. Con contexto de 64.000 tokens y entradas de imagen, la caché puede crecer de forma notable; se recomienda reservar de 24 a 40 GB según la longitud real de las secuencias.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB de pesos (estimación, no confirmada por el autor).
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB de pesos (estimación, no confirmada por el autor).
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S 48 GB son adecuadas tanto por memoria como por soporte de bf16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB debería poder cargar el modelo en bf16 para secuencias cortas, con poco margen. En cuantización de 4 bits cabría en tarjetas de 12 GB como la RTX 3060 12 GB o la RTX 4070, asumiendo que la herramienta de despliegue soporte la cabeza de recompensa.
- Opciones de despliegue: `transformers` es la vía indicada en la model card, ya que hay que aplicar explícitamente `score.weight` sobre el estado del último token no de relleno. No se documenta soporte en vLLM, TGI, Ollama ni llama.cpp. El etiquetado `endpoints_compatible` sugiere compatibilidad con endpoints gestionados, pero no se detalla el procedimiento. No hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado datos de rendimiento de alternativas en la información disponible. La tabla recoge los modelos que aparecen en el propio proceso de entrenamiento y el backbone de partida; los campos no documentados se marcan como no disponibles.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (UI-Genie scoring bt_with_highest) | Reward model escalar multimodal | 8,77 B | 64k | no disponible | 61,84% AndroidFlux recovery / 91,10% UI-Genie (por pares) |
| Modelo padre: 64k UI-Genie Bradley-Terry reward model | Reward model escalar multimodal | no disponible | 64k | no disponible | no disponible |
| Qwen3-VL-8B (usado como candidato y backbone) | Modelo generativo vision-language | ~8 B | no disponible | no disponible | no disponible |
| GUI-Owl-7B (usado como candidato) | Agente GUI | ~7 B | no disponible | no disponible | no disponible |
| GUI-Owl-1.5-8B (usado como candidato) | Agente GUI | ~8 B | no disponible | no disponible | no disponible |
| MAI-UI-8B (usado como candidato) | Agente GUI | ~8 B | no disponible | no disponible | no disponible |

No se conocen en la información proporcionada otros reward models para agentes GUI directamente comparables.

## Limitaciones y advertencias

- No es un modelo generativo. No puede usarse como chatbot, juez con salida textual ni asistente; devuelve únicamente una puntuación escalar.
- Licencia no disponible. Al no especificarse términos legales, no puede confirmarse el uso comercial y existe riesgo jurídico en producción.
- Solo inglés. No hay soporte declarado para otros idiomas, lo que limita su uso con interfaces o instrucciones en castellano u otras lenguas.
- Dominio estrecho. El modelo se ha entrenado con preferencias sobre agentes GUI, con foco en Android. Su aplicación fuera de ese ámbito no está validada.
- Diferencia acusada entre conjuntos: 61,84% en AndroidFlux recovery frente a 91,10% en UI-Genie. La precisión cercana al azar en el primer conjunto indica poca robustez fuera del dominio de evaluación principal.
- Sesgo hacia los modelos del comité LPV. Las preferencias provienen exclusivamente de Qwen3-VL-8B, GUI-Owl-7B, GUI-Owl-1.5-8B y MAI-UI-8B, de modo que el modelo puede favorecer el estilo de esas políticas y penalizar propuestas legítimas de otros sistemas.
- Diseño de evaluación con exclusión propia: cada experto evalúa a sus pares excluyendo su propia respuesta. Este mecanismo introduce una estructura de sesgo que no se cuantifica en la model card.
- Riesgo de sobreajuste o contaminación no verificable. No se documenta si UI-Genie se usó durante el entrenamiento; de ser así, el 91,10% estaría inflado.
- Métricas no representativas del artefacto distribuido. Las cifras publicadas corresponden al checkpoint original sin fusionar, mientras que el repositorio contiene la versión fusionada, que no ha sido reevaluada según la propia model card.
- Muestra pequeña en uno de los conjuntos: solo 76 pares en AndroidFlux recovery, lo que da un intervalo de confianza amplio y hace poco fiable cualquier comparación fina.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- Coste de memoria elevado: 17,5 GB de pesos más caché KV para 64.000 tokens hacen inviable el despliegue en GPU de gama baja sin cuantización, y no se publican pesos cuantizados.
- Requisito de implementación específico: hay que aplicar `score.weight` al estado del último token no de relleno; un uso incorrecto del pooling produce puntuaciones inválidas sin aviso de error.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-scoring-64k-bt_with_highest
- No se han encontrado enlaces adicionales (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados devueltos correspondían a páginas genéricas del motor de búsqueda sin contenido relevante.
