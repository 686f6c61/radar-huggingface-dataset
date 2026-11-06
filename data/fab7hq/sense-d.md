# fab7hq/sense-d

## Resumen

Sense-d es un modelo de clasificación zero-shot de tamaño muy reducido, desarrollado por el usuario fab7hq y publicado en Hugging Face. Se trata de un fine-tuning de `microsoft/deberta-v3-xsmall` distribuido en formato ONNX con pesos cuantizados a int8, diseñado como modelo de decisión interno para [Weft](https://github.com/fab7hq/weft), una herramienta que se ejecuta íntegramente en la máquina local del usuario sin enviar datos al exterior.

A diferencia de un clasificador de propósito general, sense-d responde a preguntas binarias específicas del dominio de agentes de código: interpretar el estado de la pantalla de un agente, clasificar entradas de transcripciones de conversación, evaluar tareas y efectos de peticiones ("Asks"), aplicar reglas de práctica y verificar si un fragmento de código modificado cumple un requisito. Cada decisión se formula como una fila de entrada `[CLS] texto [SEP] pregunta [SEP]` y se lee como un logit (sí menos no).

Su relevancia radica en el enfoque: en lugar de depender de un LLM grande para tomar decisiones de orquestación de agentes, emplea un encoder de solo 70 millones de parámetros (aproximadamente, según la familia DeBERTa-v3-xsmall) con latencias de ~165 ms en CPU para una lectura completa de pantalla (7 filas), lo que lo hace prácticamente gratuito en coste computacional y totalmente privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (DeBERTa-v3-xsmall), cabezas de decisión binarias por pregunta |
| Parametros totales | no disponible (base DeBERTa-v3-xsmall, ~70 M según la familia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (L ≤ 256) |
| Tipos de cuantizacion | int8 (pesos int8 con escalas fijas, formato QDQ) |
| Idiomas soportados | no disponibles (entrenado presumiblemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (sense.int8.onnx), con tokenizer.json y manifest.json |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-xsmall`, un encoder transformer compacto de la familia DeBERTa-v3, que fue primero entrenado para la tarea de entailment (inferencia textual) sobre los pares etiquetados por humanos y de uso comercial del dataset `MoritzLaurer/dataset_train_nli`. Sobre esa base se realizó un fine-tuning con etiquetas propias de Fab7: pantallas y transcripciones de sesiones de agentes en entornos sandbox con modelos locales (etiquetadas por reglas y verificadas por lectores y un revisor), Asks, reglas y ventanas de código etiquetadas por personas o desde plantillas, y etiquetas públicas de código por hunk. Los autores destacan explicitamente que no se destiló conocimiento de ningún otro modelo.

La innovación principal no es arquitectónica sino de diseño del sistema: un único encoder sirve para todas las decisiones de Weft formulando cada juicio como un par texto-pregunta, cuya respuesta se lee como un logit (sí menos no). Todas las preguntas, clases, calibraciones y la normalización de texto viven como datos en `manifest.json` (esquema `fab7.sense.decision/1`), de modo que el comportamiento del modelo se puede ajustar sin reentrenar. El archivo `golden_vectors.jsonl` permite verificar la corrección del runtime contra casos de prueba.

## Capacidades

- Clasificación zero-shot binaria: responde preguntas sí/no sobre cualquier texto, con salida como probabilidad derivada de un logit.
- Detección de estado de pantalla del agente en 7 clases: idle, working, tras el hook de Stop, esperando permiso, esperando pregunta, esperando confianza o inicio de sesión, y detenido por error (solo a partir del texto de pantalla).
- Clasificación de entradas de transcripción: mensaje del usuario, respuesta del agente, paso de herramienta exitoso o fallido, o texto interno.
- Evaluación de Asks: clasificación de la tarea, de los efectos (lectura, escritura, ejecución, más allá de la máquina) y de la ruta (direct, plan, goal, review), con detección de efectos riesgosos.
- Aplicación de reglas de práctica: decide convenciones a partir de la tarea y los efectos, y evalúa el resto de reglas como preguntas independientes.
- Recall de código: determina si una ventana de código modificada cumple un requisito dado.
- Ejecución 100 % local con ONNX Runtime; nada sale de la máquina.
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un modelo discriminativo de decisión.

## Casos de uso

- Orquestación de agentes de código locales: Weft lo usa para decidir cuándo un agente está trabajando, bloqueado o ha terminado, evitando llamar a un LLM para cada chequeo de estado; con ~165 ms por lectura de pantalla en CPU, el coste es marginal.
- Guardarraíles de seguridad para agentes: clasifica los efectos de una petición (lectura, escritura, ejecución, acceso externo) con un recall del 97,6 % en efectos riesgosos, útil para exigir confirmación humana antes de acciones peligrosas.
- Enrutado de peticiones: decide si una tarea debe ejecutarse directamente, con plan, con objetivo o con revisión, automatizando decisiones de flujo de trabajo.
- Verificación de cumplimiento de requisitos en diffs: marca el 92 % de las ventanas de código que no cumplen su requisito con 90 % de precisión, integrable en pipelines de revisión de código.
- Clasificación de transcripciones de conversación con agentes: etiqueta mensajes de usuario, respuestas y pasos de herramienta para analítica o depuración de sesiones.
- Aplicación de convenciones de equipo: evalúa reglas de práctica sobre tareas y efectos, útil como linter semántico de decisiones de agentes.
- Plantilla para clasificadores zero-shot locales: el esquema de manifest.json con preguntas y calibraciones como datos sirve de referencia para construir cabezas de decisión propias sobre DeBERTa.

## Benchmarks y rendimiento

Resultados publicados por el autor para la versión 0.1.1, sobre el split de test con textos no vistos en entrenamiento:

| Head | Métrica | Valor |
|---|---|---|
| Screen | accuracy (1.008 pantallas) | 0,992 |
| Transcript entry | accuracy (529) | 0,994 |
| Ask task | macro F1 (308 Asks) | 0,802 |
| Ask effects | macro F1 | 0,913 |
| Ask effects | recall de efectos riesgosos | 0,976 |
| Ask route | accuracy | 0,886 |
| Practice rules | Jaccard | 0,688 |
| Recall | recall / precisión | 92 % / 90 % |

Rendimiento en inferencia: una lectura de pantalla (7 filas) tarda unos 165 ms en CPU sobre un Mac con Apple Silicon; en GPU, unos pocos milisegundos. No hay comparativas con otros modelos publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, por lo que el modelo cuantizado cabe con holgura en memoria de cualquier GPU moderna o incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU acelera la inferencia a pocos milisegundos por lectura.
- Consumer GPU: cabe sin problemas en cualquier GPU consumer (RTX 3060 o superior, Apple Silicon integrado, etc.); de hecho, está diseñado para funcionar solo con CPU.
- Despliegue: ONNX Runtime (con `session.disable_quant_qdq = 1` para que cada fila se evalúe de forma independiente); no es compatible directamente con vLLM, llama.cpp, Ollama o TGI por ser un encoder ONNX.
- Latencia: ~165 ms por lectura de pantalla (7 filas) en CPU Apple Silicon; pocos ms en GPU. Throughput detallado no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sense-d (fab7hq) | DeBERTa-v3-xsmall | Decisión binaria multi-cabeza para agentes | ONNX int8 | Apache 2.0 | Calibración y preguntas como datos; ejecución local |
| DeBERTa-v3-xsmall-mnli-fever-anli-ling-bank (MoritzLaurer) | DeBERTa-v3-xsmall | Zero-shot NLI general | PyTorch | MIT | Clasificador zero-shot de propósito general, sin calibración de dominio |
| DeBERTa-v3-base-mnli-fever-anli (MoritzLaurer) | DeBERTa-v3-base (~184 M) | Zero-shot NLI general | PyTorch | MIT | Mayor precisión general pero mayor coste de inferencia |

Sense-d se diferencia de los clasificadores NLI genéricos en que sus preguntas, umbrales y normalización están calibrados por dominio (agentes de código) y expuestos como datos en manifest.json, además de distribuirse cuantizado a int8 en ONNX para inferencia en CPU.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 256 tokens, insuficiente para documentos largos; está pensado para textos breves (pantallas, entradas de transcripción, hunks de código).
- Dominio específico: las cabezas están calibradas para el ecosistema Weft y tareas de agentes de código; su rendimiento en otros dominios no está documentado y probablemente degrade.
- La cabeza Ask task muestra un macro F1 de 0,802 y Practice rules un Jaccard de 0,688, notablemente por debajo del resto: no es fiable para decisiones de alta exigencia en esas tareas sin umbrales adicionales.
- En la versión 0.1.1 el recall de la cabeza Recall bajó del 98 % al 92 %, lo que indica que las métricas pueden variar entre versiones; conviene fijar la versión en producción.
- Idiomas soportados no declarados; el entrenamiento parece basado en datos en inglés, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: no aplica como tal al ser discriminativo, pero errores de clasificación silenciosos (falsos negativos en efectos riesgosos, ~2,4 %) pueden tener consecuencias en seguridad de agentes.
- Sin descargas registradas y con historial muy reciente: proyecto con adopción mínima y sin auditoría externa conocida.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes.
- Requiere ONNX Runtime con la opción `disable_quant_qdq = 1`; un despliegue con configuración por defecto puede alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fab7hq/sense-d
- Repositorio de Weft: https://github.com/fab7hq/weft
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- Dataset NLI de entrenamiento: https://huggingface.co/datasets/MoritzLaurer/dataset_train_nli
