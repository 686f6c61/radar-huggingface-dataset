# dkubeio/DKube-instruct-v2-0.5B

## Resumen

DKube-instruct-v2-0.5B es un adaptador LoRA publicado por dkubeio sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, especializado en diagnóstico y resolución de incidencias de Kubernetes. No es un modelo completo: se distribuye como adaptador PEFT en safetensors y requiere cargar el modelo base por separado. Su función es recibir un error de clúster (ImagePullBackOff, CrashLoopBackOff, códigos de salida, problemas de scheduling, almacenamiento, red, RBAC o certificados) y devolver una respuesta estructurada en cuatro bloques: causa, diagnóstico, solución y verificación.

El modelo entrena LoRA con r=16 y α=32 sobre todas las proyecciones de atención y MLP, partiendo del adaptador previo t4tarzan/DKube-instruct (v1) y manteniendo su linaje. El conjunto de entrenamiento consta de 1270 ejemplos de chat y 69 de validación, generados con modelos profesor (principalmente gpt-oss:20b y algo de Qwen3-8B) a partir de documentación oficial, hilos de Stack Overflow y Server Fault, playbooks de SRE y guías de proveedores, cubriendo 47 clases de error.

Su relevancia es acotada y explícita: el propio autor lo etiqueta como prototipo y documenta fallos concretos en los que el modelo afirma causas raíz y soluciones incorrectas con total seguridad. Frente al modelo base sin adaptador, mejora la métrica de rúbrica de 0,487 a 0,562 y reduce la pérdida en datos nuevos de 1,581 a 1,173, pero queda por debajo de Qwen2.5-1.5B-Instruct sin adaptar (0,608) en esa misma rúbrica. Es, por tanto, un experimento de ajuste fino eficiente en parámetros, útil como referencia metodológica más que como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) con adaptador LoRA PEFT aplicado sobre todas las proyecciones de atención y MLP |
| Parametros totales | 0,5 mil millones en el modelo base; el adaptador añade matrices de bajo rango (r=16, α=32) cuyo recuento exacto no se detalla en la model card |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-0.5B-Instruct; no se declara explícitamente en la model card) |
| Tipos de cuantizacion | El adaptador se publica en safetensors en bf16. No se publican versiones cuantizadas (GGUF, AWQ, GPTQ) del adaptador. Cualquier cuantización requiere fusionar previamente con el modelo base |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (el modelo base Qwen2.5-0.5B-Instruct también es Apache-2.0) |
| Formato de pesos | safetensors (adaptador LoRA); requiere descargar aparte el modelo base Qwen/Qwen2.5-0.5B-Instruct |
| Libreria | peft (con transformers como dependencia) |
| Tamano del repositorio | 0,0 GB según HuggingFace |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only denso de 0,5 mil millones de parámetros. La configuración de LoRA emplea r=16 y α=32 sobre todas las proyecciones de atención y MLP, un rango relativamente alto para un modelo base tan pequeño. El entrenamiento se realizó durante 2 épocas con tasa de aprendizaje 0,0001, precisión bf16 sobre una NVIDIA GB10 (DGX Spark), y la pérdida se calcula únicamente sobre los tokens del asistente, no sobre los del usuario. El entrenamiento continuó desde t4tarzan/DKube-instruct (v1) reutilizando la misma configuración de LoRA, de modo que v2 conserva la ascendencia de v1.

Los datos de entrenamiento son 1270 ejemplos de chat de entrenamiento y 69 de validación/held-out. La generación siguió un pipeline de destilación: se recopilaron y trocearon fuentes de troubleshooting de Kubernetes que cubren 47 clases de error, y un modelo profesor local (mayoritariamente gpt-oss:20b, en menor medida Qwen3-8B) redactó entre 1 y 3 ejemplos anclados a cada fragmento. Cada ejemplo se validó manualmente o por reglas para garantizar subcomandos kubectl reales, YAML parseable y ausencia de casi duplicados, y cada clase de error quedó limitada a un máximo del 5 % del conjunto para evitar el desequilibrio. Las fuentes incluyen documentación de depuración y tareas de kubernetes.io (CC BY 4.0), preguntas y respuestas de Stack Overflow y Server Fault (CC BY-SA 4.0), los Scoutflo SRE Playbooks (MIT), hilos de issues del repositorio kubernetes (uso como anclaje, parafraseado), guías de proveedores propietarias (solo anclaje, parafraseado, sin copia de texto), y filas directas de jalpan04/devops-sft-dataset (Apache-2.0, solo preguntas de Kubernetes) y spacezenmasterr/k8s-sft-cmd-en (MIT). El dataset AnveshGummala/k8s-troubleshooting-customdsv3 empleado por v1 se descartó por tener licencia no declarada, y también se eliminaron las filas de preguntas y respuestas de artículos de investigación que v1 mezclaba en sus filas de Kubernetes.

## Capacidades

- Generación de diagnósticos estructurados en cuatro bloques fijos: causa (Cause), diagnóstico (Diagnose, con comandos), solución (Fix, con comandos o YAML) y verificación (Verify).
- Cobertura de 47 clases de error de Kubernetes en el conjunto de entrenamiento, incluyendo ImagePullBackOff, CrashLoopBackOff, códigos de salida, scheduling, almacenamiento, red, RBAC y certificados.
- Emisión de comandos kubectl y manifiestos YAML en las respuestas.
- Buenos resultados documentados en los escenarios de CreateContainerConfigError (ConfigMap y Secret), afinidad de nodo, PVC en estado Pending, FailedMount, Evicted, sondas liveness y readiness, ProgressDeadlineExceeded, errores x509, ResourceQuota y límites de tasa de Docker Hub.
- Soporte de tool calling o function calling: no documentado ni mencionado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado. El modelo produce una respuesta de un solo turno con plan de diagnóstico.
- Capacidades multilingües: solo inglés. La model card declara `language: en` y todos los ejemplos de entrenamiento están en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- El modelo está entrenado con un system prompt concreto que conviene reproducir en inferencia: "You are DKube-instruct, a Kubernetes troubleshooting assistant. Diagnose the root cause, give exact kubectl commands or YAML fixes, and say how to verify."

## Casos de uso

- Asistente de primera línea para incidencias de Kubernetes: integrado en un bot de chat de operaciones, recibe el texto de un error (por ejemplo, un evento de `kubectl describe pod`) y devuelve una causa probable, comandos de diagnóstico y una corrección propuesta. Es adecuado por su formato de respuesta fijo y su bajo coste de inferencia, siempre que un ingeniero revise la salida antes de aplicarla.
- Generación de borradores de runbooks y playbooks de SRE: a partir de una clase de error concreta, el modelo produce el esqueleto de un procedimiento con comandos de verificación, que el equipo de plataforma revisa y publica. Útil para arrancar documentación interna sin partir de cero.
- Prellenado de tickets y post-mortems: clasificar el error entrante y adjuntar un borrador de causa raíz y plan de mitigación al ticket, reduciendo el tiempo de triaje. El modelo está limitado a inglés y a un único turno de razonamiento, por lo que encaja mejor como generador de borradores que como decisor.
- Formación y simulación para equipos de operaciones: generar escenarios de fallo con su diagnóstico esperado para sesiones prácticas de Kubernetes, dado que el modelo cubre 47 clases de error y tiende a producir respuestas con la forma correcta.
- Base para ajuste adicional (fine-tuning) en dominios adyacentes: al ser un LoRA de r=16 entrenado con 1270 ejemplos, sirve como punto de partida barato para especializar aún más hacia OpenShift, EKS, GKE u otros entornos concretos.
- Comparativa metodológica en investigación sobre destilación de datos: el repositorio documenta con precisión el pipeline de generación con profesor local, la validación de ejemplos y las métricas de rúbrica y pérdida, lo que lo convierte en un caso reproducible para estudiar ajuste fino con pocos datos sintéticos.
- Autocompletado en entornos de terminal o IDE orientados a operaciones: sugerir el siguiente comando de diagnóstico tras un error, con la advertencia de que el modelo puede inventar subcomandos inexistentes (por ejemplo, `kubectl get envvar`).

## Benchmarks y rendimiento

Datos publicados por el autor, ejecutados el 2026-09-25 con el mismo código para todos los modelos. La métrica "rubric" mide, sobre 40 escenarios canónicos, la proporción de palabras clave requeridas de causa raíz y solución que contiene cada respuesta; es una medida gruesa que premia nombrar lo correcto, no ser correcto. La métrica "loss" es la pérdida sobre tokens de asistente en validación, tanto en ejemplos de estilo nuevo como en filas de estilo v1.

| Modelo | Rubric ↑ | Loss, datos nuevos ↓ | Loss, estilo v1 ↓ |
|---|---|---|---|
| Qwen2.5-0.5B-Instruct (sin adaptador) | 0,487 | 1,581 | 2,082 |
| t4tarzan/DKube-instruct (v1, 0,5B) | 0,367 | 1,689 | 1,664 |
| DKube-instruct-v2-0.5B (este modelo) | 0,562 | 1,173 | 1,593 |
| Qwen2.5-1.5B-Instruct (sin adaptador) | 0,608 | 1,332 | 2,072 |
| DKube-instruct-v2-1.5B | 0,642 | 0,944 | 1,610 |
| Qwen2.5-7B-Instruct (sin adaptador) | 0,825 | 1,435 | 3,069 |
| DKube-instruct-v2-7B | 0,821 | 0,757 | 1,393 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo fusionado en bf16/fp16: en torno a 1,0-1,5 GB para los pesos del modelo de 0,5B, más caché KV y activaciones, quedando normalmente por debajo de 2 GB en total para contextos moderados. Son estimaciones a partir del tamaño del modelo, no cifras publicadas por el autor.
- VRAM estimada con cuantización de 4 bits tras fusionar y convertir: aproximadamente 0,3-0,6 GB de pesos.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares, sin que ninguna de ellas sea necesaria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna, y también en CPU y en sistemas embebidos tipo DGX Spark (el propio autor entrenó en una NVIDIA GB10).
- Opciones de despliegue: transformers con la librería peft (ruta oficial documentada en la model card), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama previa fusión del adaptador con el modelo base y conversión a GGUF.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rubric ↑ | Licencia | Notas |
|---|---|---|---|---|---|
| DKube-instruct-v2-0.5B | 0,5B (LoRA) | 32.768 tokens (base) | 0,562 | Apache-2.0 | Este modelo. 0 descargas y 0 likes en el momento de la consulta |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | 0,487 | Apache-2.0 | Modelo base sin adaptador. Mejor pérdida en algunos escenarios que v1 pero peor que v2 en rubric |
| t4tarzan/DKube-instruct (v1) | 0,5B (LoRA) | 32.768 tokens (base) | 0,367 | no disponible en la información proporcionada | Predecesor directo. Peor rubric y peor pérdida en datos nuevos que v2 |
| DKube-instruct-v2-1.5B | 1,5B (LoRA) | 32.768 tokens (base) | 0,642 | no disponible en la información proporcionada | Misma receta sobre un base mayor. Supera a este modelo en rubric (0,642 frente a 0,562) y en pérdida en datos nuevos (0,944 frente a 1,173) |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens | 0,825 | Apache-2.0 | Modelo sin adaptar. Supera en rubric a toda la familia DKube de 0,5B y 1,5B, a costa de un coste de inferencia mucho mayor |

## Limitaciones y advertencias

- El autor etiqueta explícitamente el modelo como prototipo: "verify before you run anything". Afirma causas raíz y soluciones incorrectas con total seguridad, por lo que ninguna salida debe aplicarse a un clúster sin revisión humana.
- Fallo documentado en el código de salida 137: no lo identifica como SIGKILL ni OOMKilled y lo atribuye a "fallos de arranque y dependencias ausentes".
- Fallo documentado en ImagePullBackOff con 401 Unauthorized: busca tokens en `kube-system` y en el kubeconfig en lugar de en un secreto `docker-registry` referenciado en `imagePullSecrets`.
- Fallo documentado en RBAC Forbidden: propone crear un Role, pero verifica permisos con `kubectl get svc` y busca errores del API server en el log del kubelet.
- Puntuación cero en los escenarios de códigos de salida 126, 127, 139 y 143, error de formato de ejecución, resolución DNS, pods y namespaces atascados en Terminating, y `localhost:8080 refused`.
- Puede inventar comandos y tipos de recurso inexistentes, como `kubectl get envvar`.
- La métrica de rúbrica es reconocidamente gruesa: premia nombrar los conceptos correctos, no acertar. Un rubric alto no implica respuestas correctas.
- Cobertura limitada a inglés: no hay soporte multilingüe y no se ha entrenado con ejemplos en castellano.
- Sesgos conocidos: no documentados explícitamente en la model card más allá de las fuentes de entrenamiento, que son mayoritariamente de habla inglesa y de la comunidad de Stack Overflow y GitHub.
- Riesgo de alucinación elevado y reconocido por el autor, especialmente en las clases de error con peor cobertura.
- Restricciones de licencia: el adaptador es Apache-2.0 y el modelo base también, por lo que el uso comercial está permitido. Sin embargo, parte de los datos de anclaje provienen de fuentes con licencias CC BY-SA 4.0 y de guías de proveedores propietarias, lo que conviene revisar si se redistribuye el modelo derivado.
- Con 1270 ejemplos de entrenamiento y 2 épocas, la capacidad de generalización a errores no vistos durante el entrenamiento es limitada.
- El modelo está entrenado con un system prompt específico; usarlo con otro distinto degrada la calidad de las respuestas.
- Adopción prácticamente nula en el momento de la consulta (0 descargas, 0 likes), sin señales de uso en producción por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dkubeio/DKube-instruct-v2-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Predecesor v1: https://huggingface.co/t4tarzan/DKube-instruct
- Árbol de ficheros de v1: https://huggingface.co/t4tarzan/DKube-instruct/tree/main
- Scoutflo SRE Playbooks (fuente de anclaje, MIT): https://github.com/Scoutflo/Scoutflo-SRE-Playbooks
- Documentación de DKubeX: https://dkubex2.dkube.io/
- Página de producto DKubeX 2.0: https://www.dkube.io/platforms/dkubex
