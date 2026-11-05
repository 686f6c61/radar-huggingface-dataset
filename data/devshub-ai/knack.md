# devshub-ai/knack

## Resumen

Knack es un modelo de clasificación de texto desarrollado por devshub-ai como componente interno de CodeSync, una herramienta de asistencia al desarrollo. Su función no es generar texto, sino resolver un conjunto fijo de 29 decisiones binarias o de categoría que CodeSync necesita tomar en cada turno de conversación y en cada comando de shell: si un comando es peligroso, si se ejecutará indefinidamente, si el usuario pide continuar trabajo previo, si la petición es una pregunta o una tarea, o qué modo de operación corresponde. El modelo se distribuye como parte de la instalación de CodeSync y se ejecuta localmente, sin claves de API ni cuentas.

El interés de Knack reside en su enfoque: en lugar de un LLM generativo, es un clasificador pequeño (aproximadamente 1 GB en disco, 0,8 GB de repositorio) optimizado para latencia muy baja, con una mediana declarada de 13 ms por petición en GPU de portátil y unos 250 ms en CPU. El autor declara que solo responde a las preguntas para las que fue entrenado y delega cualquier consulta fuera de ese conjunto a un servicio de juicio en la nube, evitando adivinar en casos desconocidos.

La información pública es escasa: no se especifican arquitectura, número de parámetros, longitud de contexto, licencia ni idiomas soportados. La model card se centra en resultados operativos y en el mecanismo de distribución, no en detalles técnicos del entrenamiento. El modelo se creó y actualizó el 4 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se distribuye como `knack-<version>.tar.gz` con carpeta de modelo y `manifest.json`) |
| Tarea (pipeline) | text-classification |
| Tamano en disco | aproximadamente 1 GB (repo de 0,8 GB) |
| Numero de decisiones | 29 (21 por turno, 8 por comando de shell) |
| Latencia declarada | mediana de 13 ms en GPU de portatil; aproximadamente 250 ms en CPU |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, tamaño, número de capas, tokenizador o mecanismo de atención). La model card tampoco detalla el número de tokens de entrenamiento ni la composición del dataset más allá de indicar que se entrenó con sesiones reales de CodeSync, con énfasis adicional en los casos raros que resultan más costosos cuando se fallan: borrados destructivos, comandos que no terminan, reanudación de trabajo interrumpido y peticiones de refactorización, tests o documentación. No se menciona el uso de RLHF, DPO ni técnicas de alineación.

La innovación destacable no está en la arquitectura sino en el diseño del sistema: un clasificador local de latencia ultrabaja que cubre un conjunto cerrado de 29 decisiones y que, ante una pregunta fuera de distribución, no intenta responder sino que la deriva a un servicio en la nube. Este patrón de "modelo de juicio local más fallback remoto" reduce coste y preserva la privacidad de prompts y comandos, que no salen de la máquina para ser evaluados.

## Capacidades

- Clasificación de intención de tarea: distingue si el mensaje del usuario es una pregunta, una tarea o una petición de continuación de trabajo previo.
- Enrutamiento y profundidad de razonamiento: decide el modo de operación (plan, ask o build) y el nivel de razonamiento necesario.
- Detección de reanudación: identifica peticiones para retomar trabajo interrumpido.
- Control de sesión: gestiona el inicio y parada de screencast, y detecta necesidades de navegador o de mensajería.
- Evaluación de riesgo de comandos de shell: clasifica el nivel de riesgo de cada comando ejecutado.
- Detección de comandos de larga duración o que no terminan.
- Clasificación de actividad: si el comando verifica, muta el repositorio, despliega, requiere una aplicación en ejecución o arranca un servidor.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No soporta generación de texto, tool calling genérico ni razonamiento multi-paso abierto; su salida es una decisión dentro de un conjunto fijo.

## Casos de uso

- Asistente de desarrollo integrado: Knack se ejecuta dentro de CodeSync para decidir en cada turno si el usuario pregunta o encarga una tarea, seleccionando el modo de operación adecuado sin enviar el prompt a la nube.
- Guardarraíl de comandos de shell: antes de ejecutar un comando, clasifica su nivel de riesgo y detecta borrados destructivos, permitiendo a CodeSync bloquear o pedir confirmación al usuario.
- Detección de comandos colgados: identifica comandos con probabilidad de no terminar, lo que permite aplicar timeouts o supervisión en lugar de dejar el proceso bloqueado.
- Gestión de sesiones largas: reconoce cuándo el usuario pide reanudar trabajo interrumpido y reconstruye el contexto de la tarea anterior.
- Enrutamiento de peticiones de refactorización, tests y documentación: clasifica estas solicitudes frecuentes para dirigirlas al flujo de trabajo especializado correspondiente dentro de CodeSync.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en unos 10 ms por GPU, es adecuado para equipos que no pueden enviar prompts ni comandos a servicios externos.
- Clasificación de comandos en pipelines de CI/CD: puede usarse para etiquetar comandos como verificadores, mutadores o desplegadores y aplicar políticas distintas según la categoría.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre los juicios propios de CodeSync (versión v3, noviembre de 2026):

| Benchmark | Knack v3 | Descripcion |
|---|---:|---|
| Conjunto etiquetado a mano | 97,9% | 233 decisiones etiquetadas manualmente |
| Conjunto reservado (held-out) | 95,5% | 3.267 decisiones de sesiones reales no vistas en entrenamiento |
| Conjunto de casos raros | 93,7% | 4.120 decisiones sobre los casos más difíciles y raros |
| Latencia | 13 ms | Mediana por petición en GPU de portátil |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo ocupa aproximadamente 1 GB en disco, lo que sugiere un requisito de memoria muy bajo, pero no se especifica.
- GPU recomendadas: no disponibles; la model card menciona una GPU de portátil como referencia de latencia (13 ms), sin nombrar modelos concretos.
- CPU: funciona en CPU con latencia de aproximadamente 250 ms por decisión.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño de aproximadamente 1 GB, aunque no se confirman modelos concretos.
- Opciones de despliegue: distribución gestionada por el instalador de CodeSync; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 13 ms por petición en GPU de portátil y unos 250 ms en CPU; no se publica throughput agregado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de clasificación de decisiones para asistentes de desarrollo, ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo solo responde a las 29 decisiones para las que fue entrenado; cualquier otra consulta se delega a un servicio en la nube, lo que introduce dependencia de red en esos casos.
- No se ha publicado licencia, lo que impide determinar si el uso comercial o la redistribución están permitidos.
- No se declaran idiomas soportados; se desconoce su comportamiento fuera del inglés o de los idiomas presentes en las sesiones de entrenamiento.
- Los benchmarks son autoinformados por el autor y no han sido verificados de forma independiente.
- No se dispone de información sobre sesgos, riesgo de alucinación (limitado por ser un clasificador) ni robustez ante entradas adversarias.
- La integración está diseñada para CodeSync; usarlo fuera de ese ecosistema requiere ingeniería adicional no documentada.
- El modelo se actualiza automáticamente dentro de CodeSync, lo que puede cambiar el comportamiento entre versiones; existe una variable de entorno (`CODESYNC_KNACK_DISABLED=1`) para desactivarlo.
- El repositorio de HuggingFace contiene artefactos de distribución (`manifest.json` y archivos `.tar.gz`) en lugar de pesos en formato estándar, lo que complica su uso directo con frameworks convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devshub-ai/knack
- Sitio de CodeSync / DevsHub: https://app.devshub.ai
- Script de instalación: https://app.devshub.ai/install.sh
- Paper, blog técnico o repositorio de código: no disponibles en la información proporcionada.
