# semantique-team/ant-4b

## Resumen

ANT-4B es un modelo de decisión de tipo "System 1" desarrollado por Semantique Team. No es un modelo generativo: recibe un estado (`state`), una pregunta (`question`) y una lista de respuestas candidatas, y devuelve una distribución de probabilidad calibrada sobre esos candidatos junto con un veredicto binario de ejecutar o escalar. El modelo nunca genera texto libre; su función es puntuar y clasificar candidatos.

Técnicamente se implementa como un adaptador sobre el backbone congelado Qwen/Qwen3.5-4B. El repositorio contiene únicamente la cabeza entrenada (2.632.704 parámetros entrenables, unos 10,5 MB); el backbone se descarga aparte desde el Hub de Hugging Face. La arquitectura usa el decoder de Qwen3.5 como encoder (sin la LM head) con dos codificadores que comparten el backbone: uno para el contexto y otro para los candidatos, más una función de scoring, un softmax con temperatura y una política de escalado.

Su relevancia radica en el enfoque "local-first" y "edge": al mantener congelado el backbone y entrenar solo una cabeza minúscula, el coste de entrenamiento es bajo (una Kaggle T4) y el modelo puede ejecutarse en portátiles con Apple Silicon mediante MLX en 8 bits. Está pensado para enrutamiento, triaje y selección de candidatos con abstención calibrada cuando la confianza es baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión sobre decoder transformer congelado (Qwen3.5-4B usado como encoder); dos codificadores (contexto y candidato) con backbone compartido, función de scoring, softmax con temperatura y política de escalado |
| Parametros totales | 2.632.704 parámetros entrenables (cabeza) sobre un backbone de 4,2 B congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone en fp16 (torch) y 8 bits (MLX, group size 64); cuantización de la cabeza no especificada |
| Idiomas soportados | Inglés (en), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | `ant_head.pt`, `calibrator.pt`, `escalation.json`, `config.json` (checkpoint propio); backbone en safetensors desde Qwen/Qwen3.5-4B y MLX 8-bit desde mlx-community |

## Arquitectura y entrenamiento

El modelo usa el decoder de Qwen3.5-4B cargado mediante `AutoModel` sin la LM head, tratándolo como encoder. Dos proyecciones separadas (contexto y candidato) comparten ese backbone congelado; solo se entrenan las dos proyecciones, las normas de entrada y un parámetro de temperatura. La función de scoring produce un logit por candidato, el softmax con temperatura da la distribución de probabilidad y unas métricas de confianza alimentan la política de escalado.

El entrenamiento usó el mismo dataset y receta que `semantique-team/ant-08b`, de modo que la comparación entre ambos aísla el efecto del backbone. Se realizaron 3 épocas, batch size 8, learning rate 2e-4, semilla 7, sobre una Kaggle T4. El conjunto de test cubre 24 casos de uso y el conjunto OOD cubre 5 casos de uso no vistos. La política de escalado se ajusta sobre validación con un riesgo objetivo de 0,10. Propiedades técnicas destacables: el número de candidatos es variable (de 2 a más de 100) sin reentrenar, el modelo es invariante a permutaciones de los candidatos y los conjuntos estáticos de candidatos se pueden cachear, de modo que una pregunta posterior sobre las mismas opciones solo paga la codificación del contexto.

## Capacidades

- Puntuación y ranking de respuestas candidatas: devuelve una distribución de probabilidad calibrada sobre cualquier lista de candidatos proporcionada en inferencia.
- Veredicto de ejecutar o escalar: emite `execute` o `escalate` según la confianza, con una política ajustada a un riesgo objetivo.
- Número variable de candidatos (2 a 100+), sin cambios en el checkpoint.
- Invariancia a permutaciones: reordenar los candidatos no altera las probabilidades.
- Cacheado de candidatos estáticos para reducir coste en consultas repetidas sobre el mismo conjunto de opciones.
- Clasificación de texto y enrutamiento (pipeline `text-ranking`).
- Soporte bilingüe inglés e italiano.
- No genera texto: no soporta tool calling, agentes conversacionales ni razonamiento multi-paso generativo por sí mismo.
- Backend MLX para Apple Silicon con backbone en 8 bits.

## Casos de uso

- Enrutamiento de tickets a departamentos: dado el texto de una incidencia y una lista de departamentos (Facturación, Soporte Técnico, Ventas, Legal), el modelo devuelve la probabilidad por departamento y un veredicto de escalado. Adecuado porque el número de candidatos es fijo y cacheable y la abstención evita enrutamientos erróneos.
- Triaje de severidad de incidentes: con el estado del sistema y una lista de niveles de severidad como candidatos, el modelo clasifica el incidente; en el test obtiene 0,78 frente a 0,56 del modelo de 0,8 B en `incident_severity`.
- Selección de candidatos en cribado de CV: ranking de currículos frente a una vacante con hasta decenas de candidatos por consulta; obtiene 0,69 frente a 0,47 en `candidate_screening`.
- Asignación de componente en informes de bugs: clasificación del componente afectado (0,70 frente a 0,33 del modelo pequeño en `bug_component`), útil en sistemas de gestión de incidencias.
- Clasificación de estado de proyecto: selección entre estados predefinidos con probabilidad calibrada (0,50 frente a 0,28 en `project_status`).
- Triaje de tickets en italiano: enrutamiento de solicitudes en italiano (`urgenza_ticket_it`), donde el modelo obtiene 0,34 frente a 0,38 del modelo de 0,8 B, por lo que conviene combinarlo con escalado.
- Automatización con abstención en producción: desplegar solo las decisiones con confianza superior a 0,769, que cubren el 48,4 % de las decisiones con un riesgo del 9,9 % y una precisión del 90,1 % en las decisiones tomadas, derivando el resto a revisión humana.

## Benchmarks y rendimiento

| Split | n | Accuracy | ECE |
|---|---|---|---|
| Test (situaciones reservadas, 24 casos de uso) | 648 | 0,739 | 0,056 |
| OOD (casos de uso reservados, 5 no vistos) | 456 | 0,597 | 0,123 |

Mejor accuracy de validación durante el entrenamiento: 0,731 (época 3).

Política de escalado ajustada con riesgo objetivo de 0,10: con umbral de confianza 0,769, cubre el 48,4 % de las decisiones con un 9,9 % de riesgo y un 90,1 % de acierto en las decisiones tomadas (n = 688).

Comparación por caso de uso frente a ANT-08B en las mismas filas de test:

| Caso de uso | ANT-4B | ANT-08B |
|---|---|---|
| `bug_component` | 0,70 | 0,33 |
| `incident_severity` | 0,78 | 0,56 |
| `candidate_screening` | 0,69 | 0,47 |
| `project_status` | 0,50 | 0,28 |
| `meeting_action` | 0,59 | 0,72 |
| `urgenza_ticket_it` | 0,34 | 0,38 |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 4,2 B en fp16 requiere aproximadamente 8-9 GB; en 8 bits, unos 4-5 GB. La cabeza añade unos 10,5 MB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3070/4060 Ti en adelante); para 8 bits basta con 6 GB.
- Cabe en GPU de consumo: sí, con cuantización de 8 bits en tarjetas de 6-8 GB; en fp16 en tarjetas de 8 GB o más.
- Apple Silicon: soportado mediante el backend MLX con backbone `mlx-community/Qwen3.5-4B-MLX-8bit`; debe pasarse `device="cpu"` al backbone MLX para evitar el error "Passed CPU tensor to MPS op" en la primera `layer_norm`.
- Opciones de despliegue: runtime propio `ant-4b` instalado desde GitHub (no está en PyPI), con backends torch y MLX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el backend MLX es más rápido en Apple Silicon, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy test | Accuracy OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ANT-4B | 2,63 M entrenables sobre backbone de 4,2 B | No disponible | 0,739 | 0,597 | Apache-2.0 | Hugging Face (cabeza) + Qwen3.5-4B |
| ANT-08B | No disponible (backbone de 0,8 B) | No disponible | No disponible en la información | No disponible en la información | No disponible | Hugging Face |
| Qwen/Qwen3.5-4B | 4,2 B | No disponible | No aplica (modelo generativo) | No aplica | Apache-2.0 | Hugging Face |
| Modelos de clasificación genéricos | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con ANT-08B solo está disponible por caso de uso (ver sección de benchmarks); el autor no publica la accuracy agregada de ANT-08B.

## Limitaciones y advertencias

- Estado "work in progress": el autor advierte explícitamente que el formato del checkpoint y la API de Python son usables, pero los benchmarks y la guía de producción aún se están finalizando; hay que leer las limitaciones antes de desplegar.
- No genera texto: no sirve para tareas generativas, tool calling ni agentes conversacionales; solo puntúa candidatos proporcionados externamente.
- Caída acusada en OOD: la accuracy baja de 0,739 en test a 0,597 en casos de uso no vistos, con un ECE de 0,123, lo que indica calibración peor fuera de distribución.
- Idiomas limitados a inglés e italiano; el rendimiento en italiano es bajo (`urgenza_ticket_it` 0,34), por lo que conviene activar el escalado en ese idioma.
- La política de escalado cubre solo el 48,4 % de las decisiones al umbral recomendado; el resto requiere revisión humana o un modelo mayor.
- Las probabilidades exactas varían con el backend y la precisión (fp16 torch y MLX 8 bits no coinciden en el tercer decimal), aunque la elección y el veredicto son estables.
- Dependencia de un backbone externo de 4,2 B: hay que descargarlo aparte y su licencia (Apache-2.0) debe verificarse por separado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de puntuaciones erróneas en candidatos ambiguos o fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia comercial: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías de producción.
- El runtime no está en PyPI y debe instalarse desde GitHub, lo que añade fricción de despliegue y riesgo de cambios en la API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semantique-team/ant-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo comparable ANT-08B: https://huggingface.co/semantique-team/ant-08b
- Backbone MLX 8 bits: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- Repositorio del runtime: https://github.com/semantique-team/ant-4b
- Organización en GitHub: https://github.com/semantique-team
