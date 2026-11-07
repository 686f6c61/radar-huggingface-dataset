# bi0/hs-decide-1-flash-BF16-GGUF

## Resumen

hs-decide-1-flash es un modelo de decisión de 0,8B parámetros desarrollado por hindsight-ai. A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (state) y una o varias preguntas tipadas sobre ese estado, y devuelve en un único forward pass una distribución de probabilidad sobre cada opción de respuesta. Está pensado para integrarse como componente de decisión dentro de sistemas de agentes y pipelines de razonamiento, donde se necesita una señal probabilística calibrada en lugar de una generación libre.

La ficha que nos ocupa, `bi0/hs-decide-1-flash-BF16-GGUF`, no es un modelo nuevo sino una conversión sin pérdida de los pesos públicos del modelo base al formato GGUF en precisión BF16. El autor la publica con etiquetas orientadas a hardware DGX Spark con GPU Blackwell GB10 (sm121), lo que sugiere que el objetivo es ejecutar el modelo en local sobre esa plataforma. El artefacto pesa 1446,48 MB (1516744960 bytes) y se distribuye con un fingerprint SHA-256 verificable.

La relevancia de esta conversión es práctica: el modelo base se sirve habitualmente mediante un plugin de vLLM, y esta versión GGUF permite desplegarlo en runtimes alternativos (llama.cpp y derivados) manteniendo la fidelidad numérica del BF16. La información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión con salida de probabilidades por opción en un solo forward pass) |
| Parametros totales | 0,8B (según la model card del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta conversión); el ecosistema del modelo incluye además Q8_0, aunque el autor de la conversión GGUF alternativa reporta que Q8_0 falla la validación numérica |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (BF16); el modelo base se distribuye en safetensors |
| Tamano del artefacto | 1446,48 MB (1516744960 bytes) |
| Fingerprint SHA-256 | 8be4f179b00416124e8120ed8f619308a883faa6fc8cb746b7b459a869367d11 |
| Hardware objetivo declarado | DGX Spark, Blackwell GB10, sm121 |
| Modelo base | hindsight-ai/hs-decide-1-flash |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base en la documentación disponible. Lo que sí se conoce por la descripción funcional es su paradigma de salida: el modelo recibe un estado y una o más preguntas tipadas, y emite una probabilidad para cada opción de respuesta en un único forward pass, sin generar texto. Esto lo sitúa en la familia de modelos de scoring o clasificación probabilística usados como cabezas de decisión dentro de sistemas mayores, no como modelos conversacionales.

Tampoco hay datos públicos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión de esta ficha es explícitamente sin pérdida (lossless BF16 safetensors-to-GGUF), es decir, no introduce cambios en los pesos ni entrenamiento adicional; solo cambia el contenedor. El autor declara que se trata de una conversión de pesos públicos sin datos privados.

## Capacidades

- Decisión probabilística: devuelve una distribución de probabilidad sobre opciones de respuesta para una pregunta tipada sobre un estado dado.
- Soporte de múltiples preguntas por invocación (multi-question), según la documentación del endpoint del ecosistema GGUF.
- Tres modos de operación documentados en el servidor asociado: `noul` (sin salida?), `score` y `choice`.
- Integración como componente de agentes: pensado para aportar señal de decisión en pipelines multi-paso.
- No genera texto libre; su salida es numérica (probabilidades).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible como capacidad del modelo; la integración se hace vía API HTTP.
- Visión, audio, thinking mode: no disponible.

## Casos de uso

- Enrutamiento de decisiones en agentes: dado el estado actual de una conversación o de un pipeline, el modelo devuelve la probabilidad de cada acción candidata, lo que permite seleccionar la rama con mayor probabilidad o aplicar un umbral de confianza antes de actuar.
- Clasificación con preguntas tipadas: en lugar de un clasificador ad hoc, se formula una pregunta tipada sobre el estado y se obtiene una distribución calibrada sobre las etiquetas posibles, útil en moderación o triaje.
- Puntuación de candidatos en sistemas de recuperación: usar `score` para ordenar respuestas o documentos candidatos según su probabilidad bajo el estado consultado.
- Decisión multi-pregunta en un solo paso: al soportar varias preguntas por invocación, permite evaluar simultáneamente varios criterios (por ejemplo, relevancia y seguridad) con una sola llamada, reduciendo latencia.
- Despliegue local en DGX Spark: gracias a la conversión GGUF BF16 de 1,4 GB, el modelo cabe holgadamente en la memoria de una GPU Blackwell GB10 y puede servirse en local sin dependencia de vLLM.
- Prototipado de políticas de decisión: al ser un modelo pequeño, permite iterar rápidamente sobre umbrales y calibración antes de llevarlo a producción.
- Sustitución de heurísticas en pipelines existentes: donde antes había reglas if/else, se puede insertar una señal probabilística que capture patrones del estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única validación numérica documentada es la del autor de la conversión GGUF alternativa (`nanoandrew4/hs-decide-1-flash-GGUF`), que compara la salida de las cuantizaciones contra la matemática oficial del plugin de vLLM sobre 20 payloads fijos:

| Variante | Payloads superados | Diferencia máxima de probabilidad |
|---|---|---|
| BF16 | 19/20 | 1,40e-3 (argmax idéntico en todos) |
| Q8_0 | 6/20 (falla 14) | 7,85e-3 |

Esta tabla no es un benchmark de calidad del modelo, sino una verificación de fidelidad numérica de la conversión.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 (el artefacto pesa 1446,48 MB), más overhead del runtime.
- GPU recomendadas: DGX Spark con Blackwell GB10 (sm121), según las etiquetas del autor; cualquier GPU con soporte para BF16 y al menos 2-4 GB de VRAM libre debería poder ejecutarlo.
- Cabe en GPU de consumo: sí, por tamaño; la viabilidad concreta depende del soporte de sm121 en el runtime elegido.
- Opciones de despliegue: llama.cpp y runtimes basados en GGUF; el modelo base se sirve mediante un plugin de vLLM con endpoint `POST /v1/systemone`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de decisión probabilística de ~0,8B) con datos públicos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, por lo que no sirve para tareas de generación, resumen o conversación directa.
- La información sobre arquitectura, contexto, idiomas y licencia no está disponible; esto impide evaluar su idoneidad para producción sin consultar directamente al autor.
- La licencia no está declarada en la información disponible, lo que supone un riesgo para uso comercial hasta que se aclare.
- La cuantización Q8_0 del ecosistema del modelo falla la validación numérica frente a la referencia de vLLM (14 de 20 payloads); se recomienda BF16 para cualquier uso donde la calibración de probabilidades importe.
- El repositorio no registra descargas ni likes y fue creado y actualizado el mismo día, lo que indica que es un artefacto reciente y sin validación comunitaria.
- Las etiquetas apuntan a hardware muy específico (DGX Spark, Blackwell GB10, sm121); el soporte en otros backends puede variar.
- Riesgo de sesgo y alucinación: no evaluable con la información disponible; al emitir probabilidades, el riesgo principal es de calibración, no de invención de texto.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/bi0/hs-decide-1-flash-BF16-GGUF
- Modelo base: https://huggingface.co/hindsight-ai/hs-decide-1-flash
- Conversión GGUF alternativa con validación numérica: https://huggingface.co/nanoandrew4/hs-decide-1-flash-GGUF
