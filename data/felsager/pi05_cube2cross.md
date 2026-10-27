# felsager/pi05_cube2cross

## Resumen

`felsager/pi05_cube2cross` es un checkpoint de robótica publicado en HuggingFace por el usuario felsager, distribuido en formato LeRobot y etiquetado con el pipeline `robotics`. Se trata de un fine-tune del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot de π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a generalización en entornos abiertos. El checkpoint ha sido ajustado sobre el dataset `felsager/vla_cubes_big`, lo que sugiere una especialización en una tarea concreta de manipulación con cubos, aunque la ficha del repositorio no documenta ni el enunciado de la tarea ni el embodiment utilizado.

El interés de este tipo de publicaciones es práctico: demuestra el flujo de trabajo de fine-tuning de un VLA abierto sobre un dataset propio dentro del ecosistema LeRobot, algo relevante para laboratorios y grupos de robótica que quieren adaptar políticas generalistas a una tarea específica sin entrenar desde cero. Sin embargo, el repositorio no incluye model card descriptiva, no publica resultados de evaluación y no ha recibido descargas ni interacciones, por lo que debe considerarse un artefacto experimental sin validación externa.

La información disponible no permite confirmar el número de parámetros, la longitud de contexto, el esquema de cámaras ni la frecuencia de control del checkpoint, datos que sí serían necesarios para reproducir el entrenamiento o desplegarlo en un robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05); implementación LeRobot adaptada del repositorio OpenPI de Physical Intelligence |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo distribuye pesos en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica que consume instrucciones en lenguaje natural; el idioma de los comandos no se especifica) |
| Licencia | Apache 2.0 según la etiqueta del repositorio (`license:apache-2.0`); el campo de licencia de la ficha aparece como no disponible |
| Formato de pesos | safetensors (formato de checkpoint de LeRobot) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia π₀.₅ de Physical Intelligence, descrita en su model card como un modelo Vision-Language-Action con generalización en entornos abiertos, y constituye una evolución de π₀. La implementación disponible en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. No se dispone de detalles verificados sobre el backbone visual-lenguaje, el módulo de acción, el número de tokens de entrenamiento ni la composición del dataset original de π₀.₅ en la información proporcionada.

Este checkpoint concreto es un fine-tune de `lerobot/pi05_base` sobre el dataset `felsager/vla_cubes_big`. No se documentan hiperparámetros de entrenamiento (número de pasos, tamaño de batch, tasa de aprendizaje, resolución de imagen, frecuencia de control), ni si se emplearon técnicas de alineación posteriores como RLHF o DPO, algo por otra parte poco habitual en políticas de imitación robótica. Tampoco se especifica si el ajuste se realizó sobre demostraciones teleoperadas, datos simulados o una mezcla de ambos.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, propio de un modelo VLA.
- Ejecución de una política especializada en manipulación con cubos, derivada del dataset de ajuste `felsager/vla_cubes_big`.
- Integración nativa con la librería LeRobot para carga, evaluación y despliegue del checkpoint.
- Reutilización como punto de partida para nuevos fine-tunes dentro del ecosistema π₀.₅ / LeRobot.
- No consta soporte de tool calling, function calling ni orquestación de agentes.
- No consta capacidad de generación de texto general, razonamiento matemático ni código, más allá de la codificación interna de instrucciones del backbone VLM.
- No consta soporte multilingüe documentado ni modo de razonamiento explícito (thinking mode).
- No consta capacidad de visión general (VQA, OCR, descripción de imágenes) fuera del uso como entrada sensorial de la política.

## Casos de uso

- Reproducción de experimentos de manipulación de cubos en laboratorio: el checkpoint permite partir de un modelo ya ajustado a una tarea de cubos en lugar de entrenar desde el base, lo que reduce el coste computacional de la puesta en marcha.
- Punto de partida para fine-tuning de tareas pick-and-place: al derivar de `lerobot/pi05_base`, se puede continuar el ajuste con nuevas demostraciones manteniendo la inicialización especializada.
- Evaluación comparativa de políticas VLA: sirve como referencia frente al modelo base y frente a otros fine-tunes de la misma familia para medir la ganancia de especialización en una tarea concreta.
- Docencia y formación en aprendizaje por imitación: el par (checkpoint + dataset) ilustra el ciclo completo de recogida de datos, ajuste y despliegue con LeRobot.
- Investigación en robustez visual: al ser un ajuste sobre un dataset reducido, permite estudiar el sobreajuste a condiciones de iluminación, posiciones de cámara y disposición de objetos presentes en los datos de entrenamiento.
- Base para experimentos de adaptación de dominio: útil para medir cuánto conocimiento general de π₀.₅ se conserva tras un fine-tune estrecho sobre un único conjunto de datos.
- Despliegue en plataformas de bajo coste compatibles con LeRobot, siempre que el embodiment y la configuración de cámaras coincidan con los del dataset de ajuste, extremo que no está documentado en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de éxito en tarea, tasas de acierto, comparaciones con el modelo base ni evaluaciones en simulación o en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica el número de parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible; al ser un modelo LeRobot basado en PyTorch, se requiere una GPU compatible con CUDA para inferencia en tiempo real, pero no se especifica modelo ni gama.
- Compatibilidad con GPU de consumo: no se puede confirmar sin conocer el tamaño del modelo.
- Opciones de despliegue: carga mediante la librería LeRobot; no se distribuyen pesos en GGUF ni existen adaptaciones a llama.cpp, Ollama, vLLM o TGI, que no son aplicables a una política VLA de este tipo. Qualcomm mantiene una adaptación de pi05 en su AI Hub Models para despliegue en dispositivos Qualcomm, aunque no está verificada para este checkpoint concreto.
- Latencia y throughput: no disponibles; dependen del embodiment, la frecuencia de control y el hardware, ninguno de los cuales está documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Relación con este checkpoint | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `felsager/pi05_cube2cross` | VLA π₀.₅ fine-tune | Este modelo | Tarea de cubos sobre `vla_cubes_big` | Apache 2.0 (etiqueta) | Repositorio público, 0 descargas |
| `lerobot/pi05_base` | VLA π₀.₅ base | Modelo de partida | Generalista, sin ajuste a tarea | no disponible en la información proporcionada | Público en HuggingFace |
| `felsager/pi05_base_ee_rel` | VLA π₀.₅ fine-tune | Mismo autor, otro ajuste | No documentada (sufijo "ee_rel" sugiere espacio de efector final) | no disponible | Público en HuggingFace |
| `Faless/pi05_cubo` | VLA π₀.₅ fine-tune | Tercero, tarea similar de cubos | Manipulación de cubos | no disponible | Público en HuggingFace |

No se dispone de datos de parámetros, contexto ni rendimiento comparado para ninguno de los cuatro, por lo que la comparación se limita a naturaleza, especialización y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documenta la tarea, el embodiment, la configuración de cámaras, el espacio de acciones ni la frecuencia de control, lo que impide reproducir el entrenamiento o desplegar el modelo con garantías.
- Sin validación externa: cero descargas y cero interacciones en el momento de la consulta; no hay evidencia de que el checkpoint funcione fuera del entorno del autor.
- Riesgo elevado de sobreajuste: al ser un fine-tune sobre un dataset específico de cubos, es probable que la política degrade su rendimiento ante cambios de iluminación, fondo, posición de objetos o tipo de robot.
- Riesgo de alucinación motora: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas cuando la observación se aleja de la distribución de entrenamiento; requiere supervisión humana y paradas de seguridad en entornos reales.
- Sesgos heredados del dataset: la composición de `felsager/vla_cubes_big` no está documentada, por lo que se desconocen los sesgos de posicionamiento, colores de objeto o condiciones de captura presentes en los datos.
- Limitaciones de idioma no evaluadas: se desconoce en qué idioma se formularon las instrucciones de entrenamiento y si el modelo responde a comandos en castellano.
- Restricciones de licencia: aunque la etiqueta indica Apache 2.0, conviene verificar los términos del modelo base `lerobot/pi05_base` y de π₀.₅ antes de un uso comercial, dado que la ficha no declara explícitamente la licencia en su campo correspondiente.
- No apto para uso general fuera de robótica: no debe emplearse como modelo de lenguaje, de visión general ni como asistente conversacional.
- Fecha de creación registrada el 27 de octubre de 2026, sin historial posterior de actualizaciones que permita inferir mantenimiento del repositorio.

## Enlaces

- Repositorio del modelo: https://huggingface.co/felsager/pi05_cube2cross
- Modelo base en LeRobot: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/felsager/vla_cubes_big
- Fine-tune del mismo autor: https://huggingface.co/felsager/pi05_base_ee_rel
- Fine-tune de tercero sobre la misma familia: https://huggingface.co/Faless/pi05_cubo
- Repositorio OpenPI de Physical Intelligence (referenciado en la model card de π₀.₅): https://github.com/Physical-Intelligence/openpi
- Adaptación de pi05 para dispositivos Qualcomm en AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/pi05/model_adaptation.py
