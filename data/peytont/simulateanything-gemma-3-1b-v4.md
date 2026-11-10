# PeytonT/SimulateAnything-Gemma-3-1B-v4

## Resumen

SimulateAnything-Gemma-3-1B-v4 es un fine-tune LoRA de google/gemma-3-1b-it publicado por el usuario PeytonT, orientado a la generación de planes de escena estructurados, peticiones de herramientas y decisiones de "sin cambios" dentro del catálogo de capacidades del proyecto SimulateAnything. El modelo no es un adaptador autónomo: requiere el grafo ONNX congelado incluido en el repositorio (`onnx/backbone.onnx`) y el prefijo de datos autenticado descrito en `backbone-spec.json`, por lo que su uso está ligado al worker de navegador del proyecto.

El artefacto mantiene el backbone cuantizado int4/block16 y los pesos de token en FP32, y añade un residuo FP32 sin fusionar entrenado en los cuatro últimos bloques de atención q/o (278.528 parámetros entrenables). El entrenamiento final utilizó 13.986 registros de replay/escena. El repositorio ocupa 1,8 GB y la descarga del artefacto de navegador es de aproximadamente 1,78 GB.

Se trata de un lanzamiento acotado y con evidencia de regresión explícita: el autor documenta 44/45 peticiones de simulación soportadas, 13/13 decisiones de sin cambios y 16/18 comprobaciones de apariencia original, además de fallos reconocidos en explicaciones científicas de forma libre. Es relevante como ejemplo de fine-tune especializado con despliegue WebGPU/ONNX más que como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptación LoRA sobre backbone ONNX cuantizado |
| Parametros totales | No disponible (base google/gemma-3-1b-it; residuo entrenable de 278.528 parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Backbone int4/block16; pesos de token en FP32; residuo de atención en FP32 |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (términos, licencia y avisos originales de Gemma) |
| Formato de pesos | safetensors, ONNX (backbone.onnx), adaptador LoRA |
| Modelo base | google/gemma-3-1b-it |
| Tamaño del repositorio | 1,8 GB |
| Descarga del artefacto de navegador | ~1,78 GB |
| Revision de referencia | dcc83ea841ab6100d6b47a070329e1ba4cf78752 |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3 1B instruction-tuned, un transformer decoder-only, y se adapta mediante LoRA. La particularidad es que el adaptador no se aplica sobre el checkpoint original sin cuantizar de Google, sino sobre un grafo ONNX congelado (`onnx/backbone.onnx`) con cuantización int4/block16 en el backbone y pesos de token en FP32. Sobre esa base se añade un residuo FP32 sin fusionar entrenado en los cuatro últimos bloques de atención q/o, con 278.528 parámetros entrenables.

El entrenamiento final empleó 13.986 registros de replay/escena, incluyendo ejemplos autorados compatibles revisados a partir de la investigación sobre agentes conscientes y enjambres. Los nuevos ejemplos factorizados excluyeron la petición exacta reportada y el par léxico "fiery/nighttime". El autor advierte de que un ancestro previo vio un registro ambiguo posteriormente en cuarentena, y que la exclusión posterior no borra esa influencia. No se fusionaron tensores de Gemma 4 ni pesos de cabezas de control de enjambre no relacionados.

## Capacidades

- Generación de planes de escena estructurados dentro del catálogo de capacidades de SimulateAnything.
- Emisión de peticiones de herramientas (tool requests) para el worker de simulación.
- Decisiones explícitas de "sin cambios" (no-change decisions) cuando la petición no requiere modificación.
- Autoría de escenas con paletas ambientales, iluminación y propiedades físicas básicas (masa, altura, restitución) dentro de los casos cubiertos.
- Ejecución en navegador mediante ONNX/WebGPU a través del worker de SimulateAnything.
- Evaluación nativa mediante el script `scripts/chat-model/evaluate.py` con backbone de navegador.
- Capacidades conversacionales limitadas: revisión de contenido conversacional de seis casos con mejora de 2/6 a 3/6.
- No instala solvers ausentes ni establece validez física; no es un modelo de razonamiento científico de forma libre fiable.

## Casos de uso

- Autoría de escenas en el navegador: el modelo genera planes de escena estructurados que el worker de SimulateAnything consume directamente vía ONNX/WebGPU, adecuado para prototipado interactivo sin backend.
- Edición incremental de escenas: las decisiones de "sin cambios" (13/13 en la evaluación) permiten distinguir peticiones que no requieren modificación y evitar reescrituras innecesarias.
- Control de apariencia renderizada: con 16/18 comprobaciones de apariencia original superadas, sirve para ajustar paletas ambientales e iluminación dentro de los casos cubiertos.
- Flujos de creación, guardado y recarga: las pruebas de UI documentadas incluyen creación, edición, guardado/recarga, undo, cancelación y disposición de escritorio/móvil.
- Peticiones compuestas acotadas: la petición compuesta reportada produce agua emitida roja e iluminación nocturna baja, con paleta ambiental fría, útil como caso de regresión.
- Evaluación de pipelines ONNX/WebGPU: el repositorio incluye hashes de artefactos, auditoría de fuente, evidencia de entrenamiento/exportación y resultados por caso, útil para validar despliegues WebGPU.
- Explicaciones acotadas de propiedades físicas: retiene explicaciones funcionales de masa y altura, aunque no es fiable para explicaciones científicas de forma libre.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el artefacto WebGPU desplegado:

| Metrica | Resultado |
|---|---|
| Peticiones de simulación soportadas | 44/45 (44/63 contando 18 adaptadores de chat ausentes como incompletos) |
| Decisiones de sin cambios | 13/13 |
| Comprobaciones de apariencia original | 16/18 |
| Revisión de contenido conversacional (6 casos) | 3/6 (mejora desde 2/6) |
| Decisiones nativas de respuesta completa auxiliar | 43/44 |

El autor indica que todos los éxitos medidos de la línea base v2 desplegada se mantuvieron. Los fallos reconocidos incluyen restitución, explicación de "creek" y el acuse de una petición negada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto de navegador pesa ~1,78 GB, lo que sugiere un consumo moderado en GPU.
- GPU probadas: WebGPU en NVIDIA de escritorio. Las capturas en disposición estrecha no establecen soporte en GPU móvil.
- GPU recomendadas: no disponibles; el despliegue documentado es WebGPU en navegador, no se citan A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No confirmado; el artefacto está pensado para WebGPU de navegador, pero el autor no certifica soporte móvil.
- Opciones de despliegue: worker de navegador de SimulateAnything para ONNX/WebGPU; evaluación nativa con `scripts/chat-model/evaluate.py --browser-backbone ... --adapter ...`.
- Latencia y throughput: no disponibles. La precisión de activación nativa difiere de la de WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| SimulateAnything-Gemma-3-1B-v4 | Base 1B + 278.528 entrenables | No disponible | Gemma | ONNX/WebGPU en navegador | Fine-tune especializado en autoría de escenas |
| google/gemma-3-1b-it | 1B | No disponible | Gemma | Safetensors, múltiples runtimes | Modelo base instruction-tuned de propósito general |
| Alternativas de 1B para autoría de escenas | No disponible | No disponible | No disponible | No disponible | No se conocen comparables directos en la información disponible |

## Limitaciones y advertencias

- El adaptador no es autónomo: requiere el grafo `onnx/backbone.onnx` congelado y el prefijo de datos autenticado de `backbone-spec.json`; no funciona sobre el checkpoint original sin cuantizar de Google.
- No instala solvers ausentes ni establece validez física; no debe interpretarse como un simulador físico válido.
- Las explicaciones científicas de forma libre no son fiables; restitución, explicación de "creek" y acuse de petición negada fallan en la evaluación.
- Solo soporta inglés.
- El autor describe el lanzamiento como acotado y no como una garantía de que toda consulta funcione; hay fallos de estilo y comparaciones contra experimentos inactivos más fuertes en `qualification.json`.
- Un ancestro del modelo vio un registro ambiguo posteriormente en cuarentena; la exclusión posterior no elimina esa influencia.
- La precisión de activación nativa difiere de la de WebGPU, por lo que los resultados pueden variar entre rutas de ejecución.
- El soporte en GPU móvil no está establecido; solo se probó WebGPU en NVIDIA de escritorio.
- Se aplican los términos, licencia y avisos originales de Gemma; verificar restricciones para uso comercial según dicha licencia.
- Riesgo de alucinación en explicaciones abiertas y en peticiones fuera del catálogo de capacidades entrenado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PeytonT/SimulateAnything-Gemma-3-1B-v4
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Repositorio fuente (revisión registrada): https://github.com/peytontolbert/simulateanything/tree/8f81235bbf287bb2fda49b69c3a476c749829e50
- Repositorio del proyecto: https://github.com/peytontolbert/simulateanything
