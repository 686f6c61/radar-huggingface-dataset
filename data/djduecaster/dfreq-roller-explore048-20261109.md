# djduecaster/dfreq-roller-explore048-20261109

## Resumen

dfreq-roller-explore048-20261109 es un checkpoint de investigación de un controlador neuronal para un simulador de robótica (denominado "roller" en el evento roller-sprint-2m), publicado por el usuario djduecaster en Hugging Face. No se trata de un modelo de lenguaje: es una política de control entrenada mediante PPO que mapea una observación de 61 dimensiones a una acción de 14 dimensiones, exportada a ONNX en float32 y pensada para ejecutarse a 50 Hz sobre CPU.

El paquete corresponde al checkpoint número 48 de una serie de exploración (Explore016, Explore024, Explore032, Explore048) en la que solo se reentrenan las capas de salida (1806 parámetros neurales) sobre un backbone heredado denominado "Pollen", manteniendo intacta la topología del grafo y el resto de pesos. Según la model card, el autor lo presenta explícitamente como un candidato "solo para puntos", no como una mejora, y advierte de que el objetivo histórico de no inferioridad de desarrollo no se cumplió.

Su relevancia es acotada: se trata de un artefacto de competición dentro del entorno microduck-arena, con validación local en Apple Silicon y sin garantías de aceptación por parte del servidor oficial. El repositorio aparece con 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que el peso real del archivo es mínimo (coherente con un modelo de ~1.8k parámetros entrenables en formato ONNX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (backbone "Pollen" heredado + capas de salida reentrenadas), exportada como grafo ONNX; topología exacta no disponible |
| Parametros totales | no disponible (solo se documentan 1806 parámetros neurales de la capa de salida que difieren del checkpoint Explore016) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija obs[1,61] por paso de control |
| Tipos de cuantizacion | float32 (único formato documentado) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor indica que los términos heredados y la atribución permanecen en upstream-base-card.md y LICENSE-NOTE.txt, y que no se afirma una licencia nueva de redistribución global |
| Formato de pesos | ONNX (float32), sin operadores personalizados ni tensores externos |

## Arquitectura y entrenamiento

La política es una red neuronal cuyo backbone ("Pollen") se hereda sin cambios de un paquete anterior, mientras que las capas de salida se reentrenan con PPO sobre física nativa de CPU y salida en MPS (Apple Metal Performance Shaders). El checkpoint 48 difiere de Explore016 únicamente en 1806 parámetros neurales de la capa de salida; la topología del grafo y el resto de pesos permanecen idénticos. El autor subraya que se trata de entrenamiento genuino y no de una variante basada solo en hash, y que los pesos también difieren de Explore024, Explore032 y otros paquetes del 9 de noviembre.

La interfaz es estrictamente determinista y de tiempo real: entrada `obs[1,61]`, salida `actions[1,14]`, frecuencia de 50 Hz, sin operadores personalizados, sin tensores externos y sin reloj, búsqueda de semilla ni tabla de acciones en caché. El controlador de realimentación N8 propio del autor se acredita junto al backbone heredado en `upstream-base-card.md`. No se documentan en la información disponible el número de tokens, la composición del dataset ni detalles del bucle de entrenamiento más allá de PPO y de la física nativa en CPU.

## Capacidades

- Control robótico simulado: genera comandos de acción de 14 dimensiones a partir de observaciones de 61 dimensiones a 50 Hz.
- Ejecución en CPU: el grafo ONNX está pensado para inferencia nativa en CPU sin GPU.
- Evento roller-sprint-2m: especializado en la tarea de sprint con comando 1.1 y accesorios "rollers".
- Validación de finalización: el evaluador original de barrido de velocidad devolvió 5/5 finalizaciones en 2.823 s; la validación fresca del 9 de noviembre finalizó 16/16 arranques con comandos 1.0, 1.1 y 1.2.
- Robustez numérica: 64 sondas de inferencia sintética produjeron salidas finitas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo "thinking": no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas en simulador: usar el checkpoint como participante en el evento roller-sprint-2m del entorno microduck-arena, aprovechando que el grafo ONNX se ejecuta a 50 Hz en CPU sin dependencias externas.
- Reproducción de resultados locales: cargar el ONNX y replicar el barrido de velocidad con los comandos 1.0, 1.1 y 1.2 para verificar las 16/16 finalizaciones reportadas antes de enviar el paquete al servidor.
- Estudio de reentrenamiento de capas de salida: comparar este checkpoint con Explore016, Explore024 y Explore032 para analizar el efecto de modificar solo 1806 parámetros sobre el comportamiento de la política.
- Pruebas de integración de inferencia ONNX en CPU: validar pipelines de inferencia determinista con entrada fija `obs[1,61]` y salida `actions[1,14]` sin operadores personalizados, útil como caso de prueba ligero en CI.
- Investigación sobre compromiso velocidad-finalización: el autor documenta explícitamente el tradeoff de velocidad, lo que permite estudiar curvas de rendimiento frente a tasa de finalización en el simulador.
- Docencia y experimentación con PPO en robótica simulada: el paquete es un ejemplo mínimo de política entrenada con PPO sobre física nativa de CPU y exportada a ONNX.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Evaluador original de barrido de velocidad | 2.823 s, 5/5 finalizaciones | Evaluador sin cambios del Arena |
| Validación fresca (9 nov) | 16/16 arranques finalizados | Comandos 1.0, 1.1 y 1.2 |
| Tiempos canónicos de cinco semillas (comando fijo) | 2.865 s, 2.79 s, 2.785 s, 2.775 s, 2.855 s | Semillas fijas |
| Sondas de inferencia sintética | 64/64 salidas finitas | Sin ajuste de pesos ni comandos |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor advierte de que estas cifras son resultados locales en simulador sobre Apple Silicon y no puntuaciones oficiales del servidor.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU (inferencia nativa ONNX en float32).
- GPU recomendadas: no se requieren; el autor documenta entrenamiento con salida en MPS (Apple Silicon) y ejecución en CPU.
- Cabe en cualquier hardware consumer: el tamaño del repositorio es de 0.0 GB y solo se documentan 1806 parámetros reentrenados en la capa de salida.
- Opciones de despliegue: ONNX Runtime (formato nativo del paquete); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la interfaz está fijada a 50 Hz (20 ms por paso de control); no se publican medidas de latencia por inferencia más allá de esa restricción de frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-roller-explore048-20261109 | no disponible (1806 params de salida reentrenados) | no aplica (obs[1,61]) | 2.823 s, 5/5 en evaluador local; 16/16 arranques | no disponible | Hugging Face, 0 descargas |
| dfreq-roller Explore016 | misma topología, pesos de salida distintos | no aplica | no disponible | no disponible | Referenciado en la model card |
| dfreq-roller Explore024 | misma topología, pesos de salida distintos | no aplica | no disponible | no disponible | Referenciado en la model card |
| dfreq-roller Explore032 | misma topología, pesos de salida distintos | no aplica | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones de licencia de los checkpoints comparados en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un candidato "solo para puntos" y no una afirmación de mejora; el objetivo histórico de no inferioridad de desarrollo falló y superar las comprobaciones de finalización no revierte ese fallo.
- Los resultados son locales, en simulador sobre Apple Silicon, y no puntuaciones oficiales del servidor; la aceptación, finalización, elegibilidad de duplicados y puntos en el Arena no están garantizados.
- Solo simulación: no existe garantía de seguridad para un robot real.
- Licencia no disponible: los términos heredados y la atribución permanecen en `upstream-base-card.md` y `LICENSE-NOTE.txt`, y el autor no afirma una licencia nueva de redistribución global; conviene revisar esos archivos antes de cualquier uso.
- El paquete depende de un backbone heredado ("Pollen") y de un controlador de realimentación N8 externos, cuya documentación está en el paquete upstream.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier expectativa en ese sentido es inaplicable.
- Riesgo de sesgo y alucinación: no aplica en el sentido habitual de los LLM, pero el comportamiento de la política está limitado al régimen de comandos y accesorios validados (comando 1.1, rollers) y puede degradarse fuera de él.
- El repositorio no registra descargas ni likes, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-explore048-20261109
- `upstream-base-card.md` (referenciado en la model card, dentro del repositorio): no disponible como URL directa
- `LICENSE-NOTE.txt` (referenciado en la model card, dentro del repositorio): no disponible como URL directa
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
