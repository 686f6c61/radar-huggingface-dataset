# pawanpaudel93/evo1-libero-fp16-ov

## Resumen

EVO1 LIBERO es una política de visión-lenguaje-acción (VLA) para robótica manipulativa, derivada de `zuoxingdong/evo1_libero` y empaquetada en formato OpenVINO por el usuario `pawanpaudel93`. El paquete convierte los módulos LeRobot EVO1 al formato de manifiesto de Intel, con un grafo en float32 y pesos en fp16, pensado para ejecutarse en CPUs y GPUs Intel mediante el motor `ov-policy` (tipo `evo1`) del runtime Cascadia. Su propósito es desplegar una política entrenada sobre el benchmark LIBERO en hardware Intel sin depender de PyTorch en producción.

El modelo recibe dos imágenes de cámara de 448×448 píxeles, un vector de estado de 8 dimensiones, un embedding de tarea de 64 dimensiones y un vector de ruido de 50×7, y produce una secuencia de acciones de 14×7. Está construido sobre un modelo base de visión-lenguaje InternVL3-1B, lo que sitúa su columna vertebral en el rango de los 1.000 millones de parámetros, aunque el número exacto de parámetros de la política completa no se detalla en la información disponible.

Su relevancia es acotada pero específica: demuestra que una política VLA de manipulación puede ejecutarse en una GPU integrada Intel Arc 140V con latencias de 250-330 ms y una precisión equivalente a la implementación de referencia en PyTorch (28/30 en `libero_spatial`). El repositorio tiene 1,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en InternVL3-1B, empaquetada como grafo OpenVINO |
| Parametros totales | no disponible (modelo base VLM: InternVL3-1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos); grafo en float32 |
| Idiomas soportados | no disponible |
| Licencia | Qwen LICENSE AGREEMENT (etiquetada como `other` / `qwen`) |
| Formato de pesos | OpenVINO (`policy_package`, manifiesto Intel); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La política sigue el diseño EVO1 de LeRobot, con una columna vertebral de visión-lenguaje InternVL3-1B que procesa dos flujos de imagen de 448×448 junto con el estado del robot y un embedding de tarea. La cabeza de acción genera una secuencia de 14 pasos con 7 dimensiones por paso, e incorpora el ruido como entrada explícita del grafo (50×7), lo que permite controlar la estocasticidad de la generación de acciones desde el cliente. En el paquete OpenVINO, la capa FC de pooling de la cabeza de acción se ha dividido para ejecutarse en fp16 en GPU Intel, y ambas cámaras se invierten en el host antes de la inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El modelo fuente está entrenado sobre el benchmark LIBERO, un conjunto de tareas de manipulación con instrucciones en lenguaje natural. La conversión a OpenVINO no altera los pesos más allá del cambio de precisión y la reestructuración del grafo; el autor reporta una desviación máxima de 6,4e-4 respecto a las acciones de la implementación de referencia en PyTorch.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales, estado proprioceptivo e instrucción de tarea.
- Procesamiento de dos cámaras simultáneas a 448×448 píxeles.
- Condicionamiento por lenguaje natural mediante un embedding de tarea de 64 dimensiones.
- Generación de secuencias de acción de horizonte 14 con 7 grados de libertad por paso.
- Control de la estocasticidad mediante entrada de ruido explícita.
- Ejecución en CPU y GPU Intel a través del motor `ov-policy` de Cascadia.
- No se documenta soporte de tool calling, agentes multi-paso, thinking mode, audio ni otras modalidades adicionales.

## Casos de uso

- Evaluación de políticas VLA en hardware Intel: el paquete permite ejecutar la política EVO1 LIBERO en CPUs y GPUs Intel sin PyTorch, útil para validar el comportamiento del modelo en el hardware objetivo antes de un despliegue real.
- Prototipado de manipulación en laboratorio: con latencias de 250-330 ms en una Arc 140V, es adecuado para bucles de control de baja frecuencia en entornos de investigación con brazos manipuladores.
- Benchmarking de conversión OpenVINO: sirve como referencia para medir la fidelidad numérica de conversiones de políticas LeRobot a OpenVINO, dado el reporte de 28/30 frente a 28/30 en PyTorch.
- Despliegue en estaciones de trabajo sin GPU dedicada: al ejecutarse en CPU Intel, permite probar la política en equipos sin acelerador NVIDIA.
- Integración en el runtime Cascadia: para equipos que ya usan el motor `ov-policy`, el paquete se integra directamente con el comando de servicio documentado.
- Reproducción de resultados LIBERO: permite replicar la evaluación en `libero_spatial` con 10 tareas y 3 episodios por tarea en hardware Intel.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| LIBERO `libero_spatial` (10 tareas × 3 episodios) | 28/30 | 28/30 en LeRobot PyTorch (CPU f32) |
| Latencia en Intel Arc 140V GPU f16 | 250-330 ms | no disponible |
| Desviación máxima de acciones vs. PyTorch | 6,4e-4 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,6 GB, lo que sugiere un consumo de memoria en el rango de 2-4 GB en fp16, aunque no se confirma.
- GPU recomendadas: Intel Arc 140V (verificada por el autor); no se documentan pruebas en A100, H100 ni RTX 4090.
- CPU: soportado por el motor `ov-policy` en CPUs Intel, sin datos de latencia.
- Cabe en GPU consumer: sí, al menos en Intel Arc 140V; no se confirma en otras GPU de consumo.
- Opciones de despliegue: runtime Cascadia con motor `ov-policy` (`cascadia run ./evo1-libero-fp16-ov --engine ov-policy --device GPU`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 250-330 ms en Arc 140V GPU f16. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EVO1 LIBERO (OpenVINO) | no disponible (base InternVL3-1B) | no disponible | 28/30 en `libero_spatial` | Qwen LICENSE | Hugging Face, runtime Cascadia en revisión |
| `zuoxingdong/evo1_libero` (original) | no disponible (base InternVL3-1B) | no disponible | 28/30 en `libero_spatial` (PyTorch) | no disponible | Hugging Face |
| Otras políticas VLA (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El paquete requiere una compilación de Cascadia que incluya el motor `ov-policy`; según el autor, esta funcionalidad aún no está en una release pública (en revisión en `labscommunity/cascadia`).
- El modelo está entrenado y evaluado únicamente sobre el benchmark LIBERO; no hay evidencia de generalización a entornos reales fuera de ese dominio.
- La licencia es la Qwen LICENSE AGREEMENT, con copyright de Alibaba Cloud; es necesario revisar los términos para uso comercial, ya que la etiqueta de Hugging Face es `other`.
- El modelo base de visión-lenguaje es InternVL3-1B, por lo que hereda sus sesgos y limitaciones de alucinación visual, aunque en este contexto la salida es una acción y no texto libre.
- No se documentan idiomas soportados ni capacidades multilingües.
- La conversión modifica el grafo original (división de la capa FC de pooling, inversión de cámaras en el host); cualquier cambio en el cliente de inferencia debe respetar estas convenciones.
- No hay datos de descargas ni validación por parte de la comunidad; el paquete es de un autor individual.
- La latencia reportada (250-330 ms) limita el uso a bucles de control de baja frecuencia.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/evo1-libero-fp16-ov
- Modelo base: https://huggingface.co/zuoxingdong/evo1_libero
- Repositorio Cascadia: https://github.com/labscommunity/cascadia
- LeRobot (framework de referencia): no disponible en la información proporcionada
