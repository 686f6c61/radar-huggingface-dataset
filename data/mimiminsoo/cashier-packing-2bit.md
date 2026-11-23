# mimiminsoo/cashier-packing-2bit

## Resumen

`cashier-packing-2bit` es una política de difusión (diffusion policy) para control robótico de manipulación bimanual, publicada por el usuario `mimiminsoo` en Hugging Face bajo licencia Apache 2.0. El modelo forma parte de un proyecto capstone denominado MoAI 2026 y está diseñado para operar un robot con dos brazos PiPER, una pinza por brazo y un cuello de 2 grados de libertad (pitch/yaw), usando tres cámaras como entrada visual. No es un modelo de lenguaje: es un checkpoint de control motor entrenado con la librería LeRobot, orientado a una tarea concreta de empaquetado en caja (packing) en un contexto de caja/atención al cliente.

El checkpoint ocupa 4,4 GB e incluye pesos EMA dentro de un `training_state.pt` correspondiente al paso 220.000. La observación combina un vector de estado de 18 dimensiones (16 del robot más 2 códigos de etapa) con tres flujos de imagen de resolución 240×320. La acción es un vector de 16 dimensiones que cubre ambos brazos, ambas pinzas y el cuello. Los horizontes son de 2 pasos de observación, 16 de predicción y 8 de acción, a una frecuencia de control de 10 Hz.

Su relevancia es acotada pero específica: es un ejemplo práctico de diffusion policy multi-brazo con segmentación por etapas (stage codes) entrenada sobre un dataset propio de 216 episodios y 140.341 fotogramas. No hay información pública sobre idiomas, benchmarks ni evaluación comparativa, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de observacion 2, prediccion 16, accion 8) |
| Tipos de cuantizacion | no disponible (checkpoint en `training_state.pt` con pesos EMA) |
| Idiomas soportados | no disponible (modelo de robotica, sin entrada/salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoints/step_0000220000/training_state.pt`, 4,4 GB) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy, es decir, un modelo generativo que produce trayectorias de acción mediante un proceso de difusión condicionado por observaciones. La entrada combina un vector de estado de 18 dimensiones (16 del robot más dos `stage_code` que codifican la etapa de la tarea) con tres imágenes de 240×320 provenientes de las cámaras `left_main`, `left_wrist` y `right_wrist`. La salida es una acción de 16 dimensiones: 6 articulaciones más pinza del brazo izquierdo, 6 articulaciones más pinza del brazo derecho, y pitch/yaw del cuello. El control se ejecuta a 10 Hz con horizontes de observación 2, predicción 16 y acción 8.

El entrenamiento se realizó durante 220.000 pasos con batch de 32 y `normalize_range_eps` de 1,0, sobre el dataset `pack5_1123_stage3`, compuesto por 216 episodios y 140.341 fotogramas. La tarea se divide en tres etapas codificadas explícitamente: etapa 1 `[1,0]` desde el inicio hasta que el brazo izquierdo agarra y alinea la cesta (pinza izquierda < 40 y luego 1 s con J1-6 izquierdas < 1 grado); etapa 2 `[0,1]` hasta que el comando derecho alcanza ≥ 80 tras el último agarre; etapa 3 `[1,1]` hasta el final. No se documentan detalles sobre RLHF, DPO ni aumentos de datos.

## Capacidades

- Control bimanual coordinado de dos brazos PiPER con pinzas independientes.
- Control de cuello de 2 grados de libertad (pitch y yaw) para orientar la percepción.
- Percepción visual multi-cámara: cámara principal izquierda y cámaras de muñeca izquierda y derecha a 240×320.
- Ejecución de una tarea de empaquetado segmentada en tres etapas mediante códigos de etapa explícitos.
- Generación de trayectorias de acción a 10 Hz con horizonte de predicción de 16 pasos.
- No soporta tool calling, function calling, agentes basados en lenguaje, ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Empaquetado automatizado en línea de caja: el modelo ejecuta la secuencia completa de agarre, alineación de cesta y depósito de productos coordinando ambos brazos, adecuado porque está entrenado específicamente sobre la tarea `pack5_1123_stage3`.
- Investigación en diffusion policies bimanuales: sirve como checkpoint de referencia para reproducir o comparar políticas de difusión multi-brazo con codificación de etapas.
- Evaluación de coordinación brazo-cuello: el control de pitch/yaw permite estudiar cómo la orientación activa de la percepción mejora el agarre, útil en laboratorios de robótica.
- Benchmark interno de manipulación con LeRobot: al cargarse mediante `pipeline/download_model.py` y `eval/run_chain.sh`, se integra en pipelines de evaluación reproducible sobre robot real.
- Prototipado de tareas de atención al cliente con robot: el escenario de caja y empaquetado puede servir de base para demostraciones de asistencia física en entornos comerciales.
- Estudio de segmentación por etapas en políticas de difusión: los `stage_code` permiten analizar cómo la descomposición temporal afecta a la estabilidad del control en tareas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el checkpoint en disco es de 4,4 GB y, al cargarse en memoria para inferencia, se requiere al menos esa cantidad más overhead del runtime de PyTorch y de los tres flujos de imagen.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño de checkpoint, una GPU con 8-16 GB de VRAM es plausible, pero no está confirmado por el autor.
- Cabe en GPU de consumo: probablemente sí en modelos con ≥8 GB de VRAM, aunque no está verificado.
- Opciones de despliegue: LeRobot con el repositorio `Cashier_policy` (rama `release`), scripts `pipeline/download_model.py` y `eval/run_chain.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el control opera a 10 Hz según la model card.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de diffusion policy bimanual con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo específico de una tarea y un hardware concretos (dos brazos PiPER, cuello de 2 DOF, tres cámaras); no es generalizable a otras configuraciones sin reentrenamiento.
- Sin información sobre sesgos, alucinación o robustez fuera de la distribución de entrenamiento; el dataset es reducido (216 episodios).
- Depende de los `stage_code` externos para segmentar la tarea; un fallo en la transición de etapa puede degradar el comportamiento.
- No hay datos publicados de evaluación, benchmarks ni métricas de éxito en robot real.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset subyacente impide verificar restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte comunitario documentado.
- El checkpoint se distribuye como `training_state.pt` con pesos EMA, no como safetensors ni GGUF; requiere el flujo de carga específico del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/mimiminsoo/cashier-packing-2bit
- Repositorio `Cashier_policy` (rama `release`): no disponible como URL en la información proporcionada
- Dataset `pack5_1123_stage3`: no disponible como URL en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
