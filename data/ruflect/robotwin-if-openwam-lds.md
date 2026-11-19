# RuFlect/RoboTwin-IF-OpenWAM-LDS

## Resumen

RoboTwin-IF-OpenWAM-LDS es un checkpoint de inferencia para robótica basado en OpenWAM, un modelo de mundo (world model) orientado a manipulación robótica. Lo publica el usuario RuFlect como ajuste fino del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboTwin-Full, y corresponde al paso de entrenamiento 6678 con supervisión de decodificabilidad lineal (Linear Decodability Supervision, LDS) en su variante Fine. Está pensado específicamente para la evaluación RoboTwin-IF Mixed 50, un conjunto de tareas de manipulación simulada.

El modelo se apoya en el backbone Wan2.2-TI2V-5B, un modelo de difusión de vídeo de aproximadamente 5.000 millones de parámetros que OpenWAM reutiliza como base para aprender dinámicas del entorno y generar acciones. La representación de acción es pose absoluta del efector final (end-effector pose), lo que lo sitúa en el paradigma de políticas visomotoras que predicen acciones a partir de observaciones visuales y instrucciones.

Su relevancia es acotada pero concreta: es un artefacto de investigación reproducible para la línea de trabajo OpenWAM y el benchmark RoboTwin-IF, con licencia Apache 2.0. No es un modelo de propósito general ni un asistente conversacional; es un componente de un pipeline de evaluación robótica que requiere el código upstream para cargarse y ejecutarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de mundo basado en difusión de vídeo (backbone Wan2.2-TI2V-5B); política visomotora con supervisión LDS |
| Parámetros totales | no disponible (el backbone Wan2.2-TI2V-5B tiene ~5B; el total del sistema no se especifica) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_6678.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint se construye sobre OpenWAM, que emplea el backbone Wan2.2-TI2V-5B (modelo de difusión texto-imagen-a-vídeo de ~5B parámetros) como sustrato para modelar la dinámica del entorno robótico. La política produce acciones en forma de pose absoluta del efector final. La innovación declarada en este checkpoint es la Linear Decodability Supervision (LDS) en variante Fine: cabezas auxiliares de LDS se usaron durante el entrenamiento para forzar que las representaciones internas sean linealmente decodificables, aunque dichas cabezas no forman parte de los parámetros de inferencia incluidos.

El ajuste fino se realizó sobre el modelo base OpenWAM-Alpha-Sim-RoboTwin-Full, orientado a simulación en RoboTwin. No se documentan en la información disponible el número de tokens o episodios de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco probables en este dominio). El checkpoint corresponde al paso 6678 y está destinado a la evaluación RoboTwin-IF Mixed 50.

## Capacidades

- Generación de acciones robóticas de manipulación en forma de pose absoluta del efector final a partir de observaciones e instrucciones.
- Modelado de dinámica del entorno mediante el backbone de difusión de vídeo Wan2.2-TI2V-5B.
- Evaluación en tareas simuladas del benchmark RoboTwin-IF (conjunto Mixed 50).
- Integración con el evaluador RoboTwin-IF mediante un adaptador de política personalizado.
- Representaciones internas entrenadas con supervisión de decodificabilidad lineal (LDS Fine).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación reproducible en RoboTwin-IF Mixed 50: cargar el checkpoint con el código upstream de OpenWAM y el evaluador RoboTwin-IF para obtener métricas de éxito en las 50 tareas mixtas, sirviendo como referencia del paso 6678.
- Investigación en supervisión de representaciones: comparar el efecto de LDS Fine frente a otras variantes analizando la decodificabilidad lineal de las representaciones internas en tareas de manipulación.
- Baseline para ajuste fino en simulación: partir de este checkpoint como inicialización para nuevas políticas en RoboTwin, aprovechando que ya está adaptado al dominio simulado.
- Estudio de representación de acciones: analizar el uso de pose absoluta del efector final frente a acciones relativas o deltas en tareas de agarre y colocación.
- Reproducción de experimentos de world models: usar el backbone Wan2.2-TI2V-5B y este checkpoint para estudiar la relación entre predicción de vídeo y planificación de acciones.
- Desarrollo de adaptadores de política: implementar y depurar adaptadores compatibles con el evaluador RoboTwin-IF usando este checkpoint como política de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 24,8 GB (pesos en safetensors); requiere espacio en disco equivalente más el del backbone Wan2.2-TI2V-5B descargado por separado.
- VRAM estimada: no disponible de forma explícita; por el tamaño del backbone (~5B parámetros) y el checkpoint, se espera un requisito de al menos decenas de GB en precisión completa, no confirmado en la documentación.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta cuantización que permita reducir la huella.
- Opciones de despliegue: implementación upstream de OpenWAM (https://github.com/OpenWAM-Official/OpenWAM) con configuración `config.yaml`; requiere actualizar las dos rutas de Wan antes de cargar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboTwin-IF-OpenWAM-LDS | no disponible (backbone ~5B) | no disponible | no disponible | Apache 2.0 | Hugging Face, requiere código upstream |
| OpenWAM-Alpha-Sim-RoboTwin-Full (modelo base) | no disponible (backbone ~5B) | no disponible | no disponible | no disponible en la información | Hugging Face |
| Wan2.2-TI2V-5B (backbone) | ~5B | no disponible | no disponible | no disponible en la información | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en robótica simulada; no es adecuado para generación de texto, código ni tareas de propósito general.
- Requiere el código upstream de OpenWAM y la descarga separada del backbone Wan2.2-TI2V-5B; no es autocontenido.
- Es necesario editar `config.yaml` con las dos rutas de Wan antes de cargar el checkpoint.
- Las cabezas auxiliares LDS no están incluidas en los pesos de inferencia; solo se conservan los parámetros de la política.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera del dominio simulado RoboTwin.
- No hay información sobre rendimiento en entornos reales; la validación es exclusivamente en simulación.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del backbone Wan2.2-TI2V-5B debe verificarse por separado.
- Sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/RuFlect/RoboTwin-IF-OpenWAM-LDS
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboTwin-Full
- Implementación upstream OpenWAM: https://github.com/OpenWAM-Official/OpenWAM
- Backbone Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Evaluador RoboTwin-IF: https://github.com/RuFlect-Intelligence/RoboTwin-IF
