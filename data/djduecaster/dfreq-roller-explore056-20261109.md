# djduecaster/dfreq-roller-explore056-20261109

## Resumen

Roller Explore056 es un checkpoint de investigación de un controlador neuronal para robótica, publicado por el usuario djduecaster bajo el identificador `dfreq-roller-explore056-20261109`. Se trata de un modelo ONNX de política (policy) que mapea observaciones de 61 dimensiones a acciones de 14 dimensiones a 50 Hz, diseñado para una tarea concreta de locomoción con ruedas ("roller-sprint-2m") dentro de un entorno de simulación denominado microduck-arena. El modelo no es un LLM ni un modelo de lenguaje: es un artefacto de aprendizaje por refuerzo (PPO) orientado a control robótico.

El checkpoint corresponde al entrenamiento número 56 de una serie de exploraciones (Explore016, Explore024, Explore032, etc.) sobre un backbone neuronal heredado denominado "Pollen", con un controlador de realimentación propio llamado N8. Según la model card, solo 1806 parámetros de la capa de salida difieren respecto al checkpoint Explore016; la topología del grafo y el resto de pesos se mantienen sin cambios. El autor insiste en que se trata de entrenamiento genuino y no de una variante basada únicamente en hash.

La relevancia del modelo es limitada y muy específica: se publica como candidato "points-only" para entradas diarias en un entorno de competición simulado, sin pretensión de mejora sobre versiones anteriores. El autor reconoce explícitamente que el objetivo histórico de no inferioridad no se alcanzó. Es, por tanto, un artefacto de investigación acotado, útil únicamente para quienes trabajen en el ecosistema microduck-arena o en políticas de control con salidas ONNX de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward exportada a ONNX (backbone "Pollen" heredado + controlador de realimentacion N8); topologia de grafo no detallada |
| Parametros totales | No disponible (solo se documentan 1806 parametros de la capa de salida que difieren de Explore016) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija obs[1,61]) |
| Tipos de cuantizacion | Float32 (unico formato documentado) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible (la model card remite a LICENSE-NOTE.txt y a terminos heredados, sin licencia de redistribucion nueva) |
| Formato de pesos | ONNX (grafo sin operadores personalizados ni tensores externos) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal exportada a ONNX con entrada `obs[1,61]` y salida `actions[1,14]`, operando a 50 Hz. El entrenamiento se realizó con PPO (Proximal Policy Optimization) sobre física nativa de CPU con aprendizaje en la capa de salida ejecutado en MPS (Metal Performance Shaders, Apple Silicon). El backbone neuronal "Pollen" y el controlador de realimentación N8 son componentes heredados de un paquete base anterior, documentados en `upstream-base-card.md`.

El checkpoint 56 modifica únicamente 1806 parámetros de la capa de salida respecto a Explore016; el resto de pesos y la topología permanecen idénticos. El autor afirma que los pesos neuronales también difieren de Explore024, Explore032 y otros paquetes del 9 de noviembre. No se documenta el número de tokens ni la composición del dataset (no aplica en RL), ni se mencionan innovaciones como decodificación especulativa o atención lineal. No se añadieron reloj, búsqueda de semilla ni tabla de acciones en caché.

## Capacidades

- Control robótico de locomoción con ruedas ("rollers") en simulación, para el evento roller-sprint-2m con comando 1.1.
- Inferencia en CPU con grafo ONNX autocontenido: sin operadores personalizados ni tensores externos.
- Ejecución determinista a 50 Hz con entrada de 61 dimensiones y salida de 14 dimensiones.
- Generalización limitada a comandos cercanos: validado en comandos 1.0, 1.1 y 1.2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No dispone de modo "thinking" ni de ninguna capacidad generativa de texto.

## Casos de uso

- Evaluación de políticas en microduck-arena: el modelo puede cargarse como candidato de entrada diaria en el evento roller-sprint-2m, con la salvedad de que la aceptación, finalización y elegibilidad no están garantizadas.
- Reproducción de experimentos de PPO sobre Apple Silicon: sirve como referencia de un checkpoint entrenado con MPS y física nativa de CPU, útil para comparar curvas de aprendizaje en la capa de salida.
- Pruebas de inferencia ONNX en CPU: al no requerir operadores personalizados ni tensores externos, puede integrarse en pipelines de validación que verifiquen salidas finitas (el autor reporta 64 sondas sintéticas con salidas finitas).
- Estudio de sensibilidad a comandos: los resultados de validación en comandos 1.0, 1.1 y 1.2 permiten analizar el comportamiento del controlador ante variaciones de consigna.
- Banco de pruebas de latencia a 50 Hz: el modelo es adecuado para medir throughput de inferencia ONNX en CPU en un bucle de control de tiempo real simulado.
- Comparación de checkpoints de la serie Explore: al diferir solo en la capa de salida respecto a Explore016, facilita análisis de ablación sobre 1806 parámetros concretos.
- Docencia o divulgación sobre RL aplicado a robótica: como ejemplo de política exportada a ONNX con métricas locales reproducibles (tiempos de 2,78–2,89 s en cinco semillas canónicas).

## Benchmarks y rendimiento

Los únicos datos disponibles son validaciones locales en simulador Apple Silicon, no puntuaciones oficiales del servidor:

| Metrica | Resultado |
|---|---|
| Evaluador original de barrido de velocidad (Arena) | 2,806 s, 5/5 finalizaciones |
| Validación fresca del 9 de noviembre | 16/16 arranques en comandos 1.0, 1.1 y 1.2 |
| Tiempos canónicos de cinco semillas (comando fijo) | 2,795 s; 2,780 s; 2,780 s; 2,785 s; 2,89 s |
| Sondas de inferencia sintéticas | 64/64 con salidas finitas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es Float32 ONNX de tamaño de repositorio 0,0 GB (artefacto muy pequeño), por lo que la huella de memoria es mínima.
- GPU recomendadas: no se documentan; el entrenamiento se realizó en Apple Silicon con MPS y la inferencia está pensada para CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna por el tamaño reducido, aunque no hay datos oficiales.
- Opciones de despliegue: ONNX Runtime en CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles; la única referencia es la frecuencia de operación de 50 Hz del bucle de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Explore056 (este) | No disponible (1806 params de salida distintos de Explore016) | No aplica (obs[1,61]) | 2,78–2,89 s en cinco semillas; 16/16 arranques | No disponible | Hugging Face, 0 descargas |
| Explore016 | No disponible | No aplica | No disponible en esta ficha | No disponible | Paquete previo del mismo autor |
| Explore024 | No disponible | No aplica | No disponible en esta ficha | No disponible | Paquete previo del mismo autor |
| Explore032 | No disponible | No disponible | No disponible | No disponible | Paquete previo del mismo autor |

No se dispone de datos suficientes para comparar con modelos de otras familias; la comparación se limita a checkpoints de la misma serie Explore del mismo autor.

## Limitaciones y advertencias

- Candidato "points-only": el autor declara explícitamente que no es una afirmación de mejora y que el objetivo histórico de no inferioridad falló.
- Resultados locales en simulador Apple Silicon, no puntuaciones oficiales del servidor; la aceptación, finalización, elegibilidad por duplicados y puntos en la Arena no están garantizados.
- Solo simulación: no hay garantía de seguridad en robot real.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Limitaciones de idioma y contexto: no aplica; la entrada es un vector de 61 dimensiones, no texto.
- Restricciones de licencia: no se afirma ninguna licencia nueva de redistribución; los términos heredados y la atribución permanecen en `upstream-base-card.md` y `LICENSE-NOTE.txt`. Conviene revisarlos antes de cualquier uso comercial.
- Caveat de producción: el modelo solo se ha validado en comandos 1.0–1.2 y con 1806 parámetros de salida distintos de Explore016; no hay evidencia de robustez fuera de ese rango.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere un artefacto de muy pequeño tamaño y escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-explore056-20261109
- Model card upstream (referenciada): `upstream-base-card.md` (incluida en el repositorio)
- Nota de licencia (referenciada): `LICENSE-NOTE.txt` (incluida en el repositorio)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web.
