# eteron/ZeroHero-ALFWorld-Dialogue-5.4M-PPO-RA

## Resumen

ZeroHero-ALFWorld-Dialogue-5.4M-PPO-RA es una política de agente entrenada mediante aprendizaje por refuerzo (PPO-RA) para el entorno ALFWorld-dialogue, una interfaz personalizada de peticiones públicas y preguntas de operador. Lo publica el usuario eteron dentro del proyecto ZeroHero y se distribuye con licencia Apache-2.0. No es un modelo de chat de propósito general: es un checkpoint de inferencia ligado a un contrato de entrada concreto (formato de observación y parseo de respuesta) que debe usarse con el wrapper de agente incluido.

El modelo parte de una inicialización aleatoria de pequeño tamaño seguida de un preentrenamiento supervisado, y después recibe un post-entrenamiento de 600 ciclos con PPO-RA. Con 5.426.816 parámetros totales (aproximadamente 5,4 millones), se sitúa en el rango de modelos de juguete o de investigación, muy por debajo de los LLM convencionales, lo que refleja su naturaleza de política especializada en una tarea acotada más que de modelo generativo general.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible de un pipeline de RL para agentes en un entorno de diálogo, con pesos en safetensors FP32 y ejemplos ejecutables. El repositorio no incluye código de entrenamiento, datos, pesos del crítico, estados del optimizador ni arnés de evaluación, por lo que su utilidad práctica queda limitada a la inferencia y al estudio del comportamiento de la política publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (implementada con Hugging Face Transformers, familia qwen3) |
| Parametros totales | 5.426.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32, solo política) |

## Arquitectura y entrenamiento

La arquitectura es un transformer implementado con Hugging Face Transformers, etiquetado en el repositorio con la familia qwen3. El modelo se inicializa de forma aleatoria con un tamaño pequeño y se somete a un preentrenamiento supervisado antes del post-entrenamiento por refuerzo. El ajuste final emplea PPO-RA (una variante de Proximal Policy Optimization) durante un presupuesto de 600 ciclos de entrenamiento, según los metadatos de la model card.

El release contiene únicamente los pesos de inferencia de la política. No se distribuyen el crítico, los estados del optimizador, el código de entrenamiento ni los datos de entrenamiento. El entorno de diálogo personalizado, junto con el operador y el oráculo, tampoco se publica; solo se incluyen `agent.py` e `infer.py` como ejemplos ejecutables. La model card indica que los tensores de la política se verificaron para igualdad exacta durante la exportación y que se conservan sumas de comprobación de los pesos de origen, con un fichero `SHA256SUMS` que cubre los archivos del release. El contrato exacto de entrada y el presupuesto de entrenamiento se almacenan en `agent_config.json` y `release_metadata.json`.

## Capacidades

- Generación de acciones de agente en el entorno ALFWorld-dialogue: la política produce respuestas dentro de un contrato de observación y parseo definido por el wrapper incluido.
- Diálogo orientado a tareas: gestiona peticiones públicas y preguntas de operador en el formato específico del entorno.
- Toma de decisiones secuenciales en un bucle de interacción agente-entorno, propio de un agente entrenado con RL.
- No soporta tool calling ni function calling en el sentido de los LLM generales; su "herramienta" es la interfaz del entorno ALFWorld-dialogue.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés (`en`).
- No es un modelo de chat de propósito general: la model card advierte explícitamente que debe usarse con el wrapper de agente proporcionado.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia reproducible de una política entrenada con PPO-RA durante 600 ciclos, útil para comparar variantes de RL en entornos de diálogo.
- Estudio del contrato de interacción agente-entorno: los ejemplos `agent.py` e `infer.py` permiten analizar cómo se formatea una observación y se parsea una respuesta en un entorno de diálogo estructurado.
- Reproducción de inferencia en un único paso: el ejemplo de una sola respuesta no requiere instalar el entorno, lo que facilita validar el comportamiento de la política en un caso aislado.
- Docencia y demostraciones de pipelines de RL: al ser un modelo de 5,4 M de parámetros con pesos FP32, se puede ejecutar en hardware modesto para ilustrar el ciclo observación-acción de un agente.
- Análisis de robustez de políticas pequeñas: permite estudiar cómo varían las respuestas individuales ante muestreo y distintas precisiones numéricas en tiempo de ejecución, tal como advierte la model card.
- Integración en experimentos de diálogo operador-agente: sirve como política base para entornos personalizados de peticiones públicas y preguntas de operador, siempre que se respete el contrato de entrada documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las curvas numéricas del entrenamiento no se presentan como una nueva evaluación held-out de este release, y que el muestreo y las diferencias de precisión numérica en tiempo de ejecución pueden alterar respuestas individuales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 5,4 M de parámetros (los pesos del repositorio ocupan 0,0 GB según los metadatos), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican en la información disponible; cualquier GPU con suficiente memoria para un modelo de este tamaño es válida. Se puede ejecutar en CPU para pruebas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en entornos sin GPU.
- Opciones de despliegue: la librería indicada es `transformers`; los tags incluyen `text-generation-inference` y `endpoints_compatible`. No se documentan opciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. La model card advierte que el muestreo y las diferencias de numérica en tiempo de ejecución pueden cambiar respuestas individuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroHero-ALFWorld-Dialogue-5.4M-PPO-RA | 5.426.816 | no disponible | Agente RL en ALFWorld-dialogue | Apache-2.0 | Pesos de política en HF |
| Modelos de agente ALFWorld de referencia (p. ej. baselines de la literatura) | no disponible | no disponible | Agente en ALFWorld | variable | no disponible en esta ficha |
| LLM generales pequeños (p. ej. Qwen3 pequeños) | no disponible | no disponible | Generación de texto general | variable | Amplia |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas en la información proporcionada, por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: la model card lo advierte y exige usar el wrapper de agente incluido, ya que el formato de observación y el parseo de respuesta forman parte de la interfaz de la política.
- El entorno de diálogo personalizado, el operador y el oráculo no se distribuyen, lo que impide reproducir el bucle completo de interacción fuera del entorno del autor.
- No se incluyen código de entrenamiento, datos de entrenamiento, pesos del crítico ni estados del optimizador, lo que limita la reproducibilidad del post-entrenamiento.
- No se incluye arnés de evaluación; las curvas de entrenamiento no constituyen una evaluación held-out del release.
- Las respuestas individuales pueden variar por muestreo y por diferencias de numérica en tiempo de ejecución.
- Idioma limitado al inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, aunque al ser una política entrenada en un entorno acotado, su comportamiento fuera de ese contrato de entrada no está garantizado.
- Licencia Apache-2.0: permite uso comercial, pero las dependencias del entorno y las observaciones de benchmarks públicos quedan sujetas a sus licencias originales, según `THIRD_PARTY_NOTICES.md`.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/eteron/ZeroHero-ALFWorld-Dialogue-5.4M-PPO-RA
- Ejemplos de inferencia: `examples/infer.py` y `examples/README.md` dentro del repositorio
- Wrapper de agente: `agent.py` dentro del repositorio
- Metadatos del release: `agent_config.json`, `release_metadata.json`, `SHA256SUMS`
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` dentro del repositorio
- Paper, blog o demo del proyecto ZeroHero: no disponible en la información proporcionada
