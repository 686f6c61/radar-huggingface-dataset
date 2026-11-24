# serhii-honcharenko/inkling-2-mini-template-lens

## Resumen

Inkling-2-mini-template-lens es un artefacto de interpretabilidad publicado por el usuario serhii-honcharenko como entrada al Looped Lens Challenge. No es un modelo de lenguaje en sentido estricto, sino un conjunto de traductores afines (matrices `A` y vectores `b`) que permiten leer la distribución de salida del modelo Inkling-2-Mini en 12 de sus 48 llamadas a bloques desenrolladas. El paquete contiene únicamente los pesos auxiliares de la lente, no los pesos del modelo base.

El objetivo técnico es aproximar, en cada uno de esos 12 puntos intermedios ("sites"), la distribución del primer token de respuesta que el modelo produciría en el encabezado de asistente `<|message_model|>`. Para ello se ajusta un traductor afín inicializado en la identidad que transforma el estado oculto `h` en una representación `t`, y se combina la predicción de la lente con la predicción directa del modelo mediante un promedio de softmax al 50 %.

Su relevancia es acotada y experimental: sirve como herramienta de análisis para estudiar cómo evoluciona la representación interna de un modelo con bloques reutilizados (looped/unrolled) a lo largo de sus 48 llamadas, y como referencia metodológica para quien quiera replicar el ajuste de lentes en otros modelos. El repositorio ocupa 0,1 GB, tiene licencia MIT y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Traductores afines (matrices `A` y sesgos `b`) sobre estados ocultos de un transformer con bloques desenrollados; no es un modelo generativo |
| Parametros totales | No disponible (12 sitios con `A` de 2304x2304 en float16 y `b` de 2304 en float32, mas un vector `scale` de 48) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float16 y float32) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible en la informacion proporcionada (se mencionan tensores `A`, `b` y `scale`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El artefacto implementa una lente de tipo afín sobre el estado `h` que sale de una llamada a bloque `s` en un token concreto. La transformación es `z = h / scale[s]`, seguida de `t = z + z @ A.s^T + b.s`. La predicción final de la lente promedia dos distribuciones softmax: la obtenida aplicando el `norm` final y el `lm_head` del propio modelo sobre `t`, y la obtenida aplicando esos mismos módulos sobre `h`. Se cubren 12 de los 48 sitios: 0, 12, 19, 23, 30, 33, 38, 42, 43, 44, 45 y 46.

El ajuste se realizó con un traductor por sitio, inicializado en la identidad y entrenado durante 250 pasos de Adam para minimizar por divergencia KL la diferencia con la distribución del propio modelo sobre el primer token de su respuesta, leída en el encabezado `<|message_model|>`. Los datos de ajuste fueron 100.000 prompts genéricos de un solo turno: preguntas de TriviaQA y primeros turnos de UltraChat. El autor declara explícitamente que ninguna pregunta del reto se usó para el ajuste, lo que evita fuga de datos respecto al benchmark del desafío.

## Capacidades

- Lectura interpretativa de estados intermedios: proyecta el estado oculto de cada sitio a una distribución de vocabulario sobre el primer token de respuesta.
- Cobertura parcial: solo 12 de los 48 sitios del modelo base están instrumentados.
- Ajuste supervisado por KL contra la distribución del propio modelo, no contra etiquetas humanas.
- No genera texto, no razona, no ejecuta código ni soporta tool calling por sí mismo.
- No soporta agentes, multi-step reasoning, visión ni audio.
- Capacidades multilingües no documentadas; el ajuste se hizo sobre prompts predominantemente en inglés (TriviaQA, UltraChat).
- Requiere acceso al modelo base Inkling-2-Mini para funcionar, ya que reutiliza su `norm` y su `lm_head`.

## Casos de uso

- Análisis de trayectorias internas: inspeccionar cómo cambia la distribución predicha token a token en los sitios instrumentados para estudiar la dinámica de un modelo con bloques reutilizados.
- Investigación en interpretabilidad mecanicista: usar la lente como sonda lineal-afín de referencia para comparar con otras técnicas (logit lens, tuned lens) en los mismos sitios.
- Depuración de comportamientos anómalos: detectar en qué llamada a bloque la predicción se desvía de la salida final en prompts de chat de un solo turno.
- Replicación metodológica: servir de plantilla para ajustar lentes afines en otros modelos, dado que el procedimiento (identidad inicial, 250 pasos de Adam, pérdida KL) está documentado en la model card.
- Evaluación de fidelidad de lentes: medir cuánto se aproxima la lente a la distribución real del modelo en los sitios cubiertos, usando prompts de TriviaQA o UltraChat como conjunto de validación.
- Docencia y divulgación: ilustrar con un caso concreto y reproducible cómo se construye y evalúa una lente sobre un transformer con llamadas a bloque desenrolladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad de la lente (por ejemplo, KL medio por sitio, precisión top-1 o correlación con la distribución del modelo), más allá de describir el procedimiento de ajuste.

## Requisitos de hardware

- El repositorio pesa 0,1 GB, por lo que el artefacto en sí cabe en cualquier GPU consumer o incluso en CPU.
- VRAM para cargar el artefacto: del orden de unos pocos cientos de MB, dado el tamaño de las matrices `A` (12 x 2304 x 2304 en float16) y los vectores asociados.
- VRAM adicional necesaria para el modelo base Inkling-2-Mini: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; depende enteramente del modelo base sobre el que se aplique la lente.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante scripts de análisis en PyTorch.
- Latencia y throughput: no disponibles; la lente añade una multiplicación matricial de 2304x2304 por sitio consultado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inkling-2-mini-template-lens | Lente afín de interpretabilidad | No disponible (12 sitios) | No disponible | MIT | Hugging Face |
| Tuned lens (Belrose et al.) | Lente afín por capa | Un traductor por capa | No aplica | Varía según implementación | Repositorios públicos |
| Logit lens | Proyección directa sin entrenamiento | 0 (usa `lm_head`) | No aplica | No aplica | Implementaciones públicas |

La comparación directa con otras lentes publicadas no está disponible en la información proporcionada; las alternativas citadas son referencias metodológicas generales, no artefactos equivalentes para el mismo modelo base.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede usarse para generar texto, responder preguntas ni ejecutar tareas de agente.
- Cobertura parcial: solo 12 de los 48 sitios están instrumentados, por lo que la lectura es discontinua a lo largo de las llamadas a bloque.
- El ajuste se limita al primer token de respuesta en el encabezado `<|message_model|>` con prompts de un solo turno; su fidelidad en generación multi-turno, otros formatos de prompt o tokens posteriores no está documentada.
- Dependencia estricta del modelo base Inkling-2-Mini y de su `norm` y `lm_head` concretos; no es portable a otros modelos sin reajuste.
- Sesgos: al entrenarse sobre TriviaQA y UltraChat, la lente puede reflejar la distribución de esos corpus y no la del uso real en producción.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la lente puede producir lecturas engañosas si se interpreta como explicación causal del comportamiento del modelo.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía; el autor no documenta validación externa.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/serhii-honcharenko/inkling-2-mini-template-lens
- Modelo base Inkling-2-Mini: no disponible en la informacion proporcionada
- Looped Lens Challenge: no disponible en la informacion proporcionada
- Paper o blog del método: no disponible en la informacion proporcionada
