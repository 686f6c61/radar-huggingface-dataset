# nouli-ai/nouli-push

## Resumen

Nouli Push es una política de control robótico basada en keypoints para el simulador PushT, desarrollada por Nouli AI. No se trata de un modelo de lenguaje, sino de un modelo de decisión (decision-model) que predice secuencias de acciones a partir de un estado estructurado de keypoints y un historial causal de estados. Sobre esa predicción, un controlador causal combina los pronósticos pasados para emitir acciones XY legales dentro del entorno.

El modelo se construye mediante fine-tuning de un Decoder Only Transformer (DOT) sobre el checkpoint IliaLarchenko/dot_pusht_keypoints_best, empleando las 206 demostraciones (25.650 fotogramas) del dataset lerobot/pusht_keypoints. Con 2,12 millones de parámetros, es un modelo extremadamente compacto pensado para ejecutarse en CPU sobre macOS y Linux ARM64, sin necesidad de GPU ni de claves de API alojadas.

Su relevancia es acotada y experimental: sirve como referencia de cómo adaptar un transformer de decisión a una tarea concreta de manipulación 2D y como ejemplo de pipeline completo (descarga de pesos, servidor de inferencia local y workflow de decisión) empaquetado para la CLI de Nouli. El propio autor advierte que la mejora frente al modelo base no está confirmada y que la validación se limita al control numérico de keypoints en PushT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder Only Transformer (DOT) con controlador causal externo |
| Parametros totales | 2,12 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (usa historial causal de estados, sin cifra publicada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control numérico, no lingüístico) |
| Licencia | Apache-2.0, con avisos de upstream y atribución del dataset |
| Formato de pesos | no disponible (repo de 0.0 GB, runtime PyTorch con custom-inference) |

## Arquitectura y entrenamiento

El modelo es un Decoder Only Transformer de 2,12 millones de parámetros que recibe keypoints estructurados junto con un historial de estado causal y emite pronósticos de acción. Un controlador causal separado agrega los pronósticos previos para producir acciones XY válidas en la rejilla de acciones del simulador. La inferencia se ejecuta mediante un servidor Python local (`serve.py`), que carga los pesos y expone el workflow de decisión de la CLI de Nouli; no hay API alojada.

El entrenamiento parte del checkpoint `IliaLarchenko/dot_pusht_keypoints_best` y aplica fine-tuning con las acciones de demostración del dataset `lerobot/pusht_keypoints` (206 demostraciones, 25.650 fotogramas), usando además un anclaje a la política original. El autor señala que el modelo base ya utilizaba estas mismas demostraciones, por lo que el beneficio marginal del fine-tuning no está claro. La evaluación se realiza con inicializaciones nuevas del simulador, no con los episodios de entrenamiento.

## Capacidades

- Predicción de secuencias de acciones XY en el simulador PushT a partir de keypoints numéricos.
- Combinación de pronósticos pasados mediante un controlador causal para generar acciones legales.
- Consumo de historial de estado causal como entrada, además del estado actual.
- Ejecución en CPU sobre macOS y Linux ARM64, sin GPU.
- Integración con la CLI de Nouli 0.4.2 mediante workflow de decisión y servidor de inferencia local.
- No soporta tool calling, agentes, razonamiento multi-paso general, visión por cámara ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas de manipulación 2D en PushT: el modelo permite reproducir episodios de control de un bloque en T hasta su región objetivo, útil como banco de pruebas de algoritmos de control.
- Investigación en modelos de decisión compactos: con 2,12 millones de parámetros sirve para estudiar el efecto del fine-tuning sobre un DOT base en tareas con pocas demostraciones.
- Prototipado de pipelines de inferencia local: el flujo con `serve.py` y la CLI de Nouli demuestra cómo desplegar un servidor de inferencia en CPU sin dependencias de API.
- Comparación de controladores causales: el propio autor documenta una comparación grabada frente a Jev 1.14.0, lo que permite usar el modelo como referencia en estudios comparativos.
- Docencia y divulgación en robótica simulada: su tamaño reducido y su licencia permisiva facilitan su uso en entornos académicos con hardware modesto.
- Validación de interfaces de normalización de estado: el modelo exige una normalización concreta de estado, historial y rejilla de acciones, por lo que sirve para probar implementaciones de esas interfaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una comparación grabada frente a Jev 1.14.0 (31 de octubre de 2026) en la que Nouli Push completa la colocación y Jev alcanza el límite de tiempo, con la advertencia explícita de que el ejemplo se seleccionó tras puntuar y no constituye un ranking general. No se aportan métricas numéricas de éxito, recompensa ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está validado para ejecución en CPU.
- GPU recomendadas: no disponibles; el runtime probado es macOS y Linux ARM64 sobre CPU.
- Cabe en cualquier equipo consumer: con 2,12 millones de parámetros y un repo de 0.0 GB, el requisito es mínimo.
- Opciones de despliegue: servidor Python propio (`serve.py`) con PyTorch y la CLI de Nouli 0.4.2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nouli Push | 2,12 M | no disponible | Control PushT por keypoints | Apache-2.0 | HuggingFace (nouli-ai/nouli-push) |
| IliaLarchenko/dot_pusht_keypoints_best | no disponible | no disponible | Control PushT por keypoints | no disponible | HuggingFace (modelo base) |
| Jev 1.14.0 | no disponible | no disponible | Control PushT (comparación grabada) | no disponible | no disponible |

## Limitaciones y advertencias

- Validado únicamente para control con keypoints numéricos en PushT; la entrada por cámara y la transferencia al mundo real no se han probado.
- Requiere la normalización de estado, el historial y la interfaz de rejilla de acciones suministrados; usar otra interfaz invalida los resultados.
- El beneficio del fine-tuning frente al modelo base es incierto según el propio autor, ya que el starter usaba las mismas demostraciones.
- La comparación con Jev es un único episodio seleccionado tras puntuar, no una evaluación estadística.
- Riesgo de sobreajuste a las 206 demostraciones del dataset, con solo 25.650 fotogramas.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código ni multilingües, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Licencia Apache-2.0 con avisos de upstream y atribución del dataset que deben conservarse; conviene revisar las condiciones del modelo base y de `lerobot/pusht_keypoints` antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nouli-ai/nouli-push
- Modelo base: https://huggingface.co/IliaLarchenko/dot_pusht_keypoints_best/tree/d31e0a1bb5b9d3183e546d0a80c8ec6e4d12b2d2
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht_keypoints/tree/ace8c161a68bc025c21a5f29f85b86a9a2c5e64b
- Nouli AI: https://nouli.ai
- CLI de Nouli 0.4.2: https://github.com/standing-desks/nouli/releases/tag/v0.4.2
- Evaluación grabada: eval/results.json (dentro del repositorio del modelo)
- Protocolo y limitaciones: eval/protocol.json (dentro del repositorio del modelo)
- Procedencia y revisiones: provenance.json (dentro del repositorio del modelo)
- Modelos relacionados: https://huggingface.co/nouli-ai/nouli-guard, https://huggingface.co/nouli-ai/nouli-route, https://huggingface.co/nouli-ai/nouli-clause, https://huggingface.co/nouli-ai/nouli-doom
