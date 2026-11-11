# sallani/EUAIAct-Risk-Qwen2.5-1.5B-Edge-ONNX

## Resumen

EUAIAct-Risk-Qwen2.5-1.5B-Edge-ONNX es la exportación a formato ONNX del modelo sallani/EUAIAct-Risk-Qwen2.5-1.5B-Edge, un ajuste fino de Qwen2.5-1.5B orientado a clasificar sistemas de inteligencia artificial según los niveles de riesgo definidos por el Reglamento (UE) 2024/1689 (Reglamento de Inteligencia Artificial). El modelo toma una descripción textual de un sistema de IA y devuelve una clasificación estructurada en JSON con el nivel de riesgo y las obligaciones de referencia aplicables. Lo desarrolla el usuario sallani y se distribuye con licencia Apache 2.0.

La relevancia de esta versión concreta reside en su empaquetado: está pensada para ejecutarse íntegramente en el navegador mediante Transformers.js con WebGPU o WASM, sin backend ni envío de datos a servidores externos. El repositorio ocupa 6,5 GB e incluye dos variantes cuantizadas: `model_q4f16.onnx` (1337 MB, pesos de 4 bits con activaciones fp16) y `model_q4.onnx` (1900 MB, con embeddings en fp32), siendo la primera la recomendada por el propio autor.

Se trata de un modelo pequeño (1.5B parámetros) especializado en una tarea acotada, con soporte únicamente de francés e inglés y un conjunto de evaluación de 221 casos. El autor documenta explícitamente una debilidad principal: la confusión entre los niveles INACEPTABLE y ALTO, que concentra la mayoría de los errores. No es un sustituto de asesoramiento jurídico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.5B (heredados del modelo base Qwen2.5-1.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MatMulNBits (bloque 32, simetrica): q4f16 (pesos 4 bits + activaciones fp16) y q4 (embeddings fp32) |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado con optimum, `text-generation-with-past`) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino del transformer decoder-only Qwen2.5-1.5B, especializado mediante entrenamiento supervisado para producir clasificaciones de riesgo del Reglamento europeo de IA en formato JSON. La exportación a ONNX se realizó con la librería optimum en modo `text-generation-with-past` y posteriormente se aplicó cuantización MatMulNBits de 4 bits con bloque de 32 y esquema simétrico. El autor señala un detalle técnico relevante: el valor `rope_theta` (1e6) se copió al nivel raíz del `config` antes de la exportación, porque el exportador no lee el formato `rope_parameters` de transformers 5; una primera versión del repositorio tenía este defecto y fue sustituida.

El entrenamiento del modelo base se apoya en datos sintéticos: ejemplos generados mediante plantillas a partir de 40 escenarios en francés e inglés, verificados contra el texto oficial del Reglamento (JO L 2024/1689). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El conjunto de evaluación consta de 221 casos (201 redactados a mano más los 20 casos de ejemplo de la demo), filtrados contra fugas mediante similitud de Jaccard inferior a 0,4, aunque escritos por el mismo autor que las plantillas de entrenamiento.

## Capacidades

- Clasificación de sistemas de IA en niveles de riesgo del Reglamento (UE) 2024/1689 a partir de una descripción textual.
- Generación de salida estructurada en JSON con el nivel de riesgo y códigos de obligaciones de referencia (por ejemplo, «Art. 9–15»).
- Conversación multi-turno mediante plantilla de chat con rol de sistema y rol de usuario.
- Ejecución en navegador con Transformers.js, tanto en WebGPU (requiere `shader-f16`) como en WASM.
- Inferencia determinista con `do_sample: false` para clasificaciones reproducibles.
- Capacidad limitada de razonamiento jurídico: cubre un único nivel de riesgo por descripción y solo parcialmente los supuestos de acumulación (por ejemplo, alto riesgo y artículo 50 simultáneamente).
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificación preliminar de sistemas de IA en el navegador: un equipo de cumplimiento puede pegar la descripción de un sistema y obtener un nivel de riesgo indicativo sin que el texto salga del dispositivo, gracias a la ejecución local con WebGPU o WASM.
- Triaje en herramientas internas de compliance: el modelo puede preclasificar un inventario de sistemas de IA y marcar los candidatos a revisión jurídica, reduciendo el volumen de casos que llegan a un especialista.
- Formación y concienciación: la demo con motor de reglas en paralelo y señalización de desacuerdos permite ilustrar de forma interactiva por qué la clasificación automática requiere supervisión humana.
- Prototipado rápido de asistentes regulatorios: desarrolladores que necesiten un componente de clasificación de riesgo en una aplicación web pueden integrarlo con el pipeline de Transformers.js y sustituirlo o ampliarlo después.
- Filtrado previo en pipelines de documentación: clasificar descripciones de proveedores o fichas de producto para etiquetar automáticamente el nivel de riesgo antes de un análisis manual más profundo.
- Evaluación comparativa de enfoques: al incluir una versión bf16 y dos cuantizaciones, sirve para medir el impacto de la cuantización en una tarea de clasificación estructurada (83,3 % frente a 60,0 % de exactitud en el subconjunto de 60 casos).
- Docencia sobre el Reglamento de IA en entornos con recursos limitados: el modelo cabe en un navegador y no requiere infraestructura de GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor sobre un subconjunto estratificado de 60 casos del conjunto de evaluación congelado, medidos con Transformers.js 4.3.2 en Node sobre CPU:

| Variante | Exactitud | JSON valido |
|---|---|---|
| q4f16 (recomendada) | 83,3 % | 93,3 % |
| q4 | 60,0 % | 71,7 % |

El autor indica además que el modelo en bf16 cometió 13 errores en el conjunto de evaluación, de los cuales 10 corresponden a confusión entre INACEPTABLE y ALTO. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de ejecución en navegador; el archivo q4f16 ocupa 1337 MB y el q4 1900 MB, por lo que el consumo de memoria del runtime debe acomodar esos pesos más las activaciones fp16.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y `shader-f16` para la variante q4f16; en su defecto, ejecución en CPU mediante WASM.
- Compatibilidad con GPU de consumo: sí, el tamaño de 1,3 GB permite cargar el modelo en navegadores de equipos de gama media; el autor desaconseja el archivo q4 por ser menos fiable y demasiado pesado para WASM.
- Opciones de despliegue: Transformers.js (WebGPU o WASM) como vía principal; el formato ONNX es compatible con otros runtimes ONNX, aunque el autor solo documenta la verificación con Transformers.js 4.3.2 en Node sobre CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EUAIAct-Risk-Qwen2.5-1.5B-Edge-ONNX | 1.5B | no disponible | Clasificacion de riesgo del Reglamento de IA, ejecucion en navegador | Apache 2.0 | ONNX en Hugging Face |
| Qwen2.5-1.5B (modelo base) | 1.5B | no disponible en esta ficha | Generacion de texto general | Apache 2.0 | Multiples formatos |
| sallani/EUAIAct-Risk-Qwen2.5-1.5B-Edge (bf16) | 1.5B | no disponible | Misma tarea, sin cuantizar | Apache 2.0 | Safetensors en Hugging Face |

No se dispone de información sobre otros modelos especializados en clasificación de riesgo del Reglamento de IA con los que establecer una comparación cuantitativa; los datos de rendimiento comparado entre las tres variantes del mismo modelo se limitan a los recogidos en la sección de benchmarks.

## Limitaciones y advertencias

- No constituye asesoramiento jurídico: la clasificación es indicativa y no sustituye a un jurista ni a la evaluación de conformidad del Reglamento (UE) 2024/1689.
- Confusión sistemática entre INACEPTABLE y ALTO: es la principal fuente de errores (10 de 13 en bf16). Ejemplo documentado: la identificación biométrica remota en tiempo real en espacio público con fines policiales se clasifica como ALTO cuando corresponde al artículo 5(1)(h) (prohibido salvo excepciones estrictamente reguladas). También se documentan errores inversos en casos del anexo III.
- Recomendación operativa del autor: todo resultado INACEPTABLE o ALTO debe ser verificado por un jurista; la demo muestra en paralelo un motor de reglas y señala los desacuerdos.
- Datos de entrenamiento sintéticos generados por plantillas (40 escenarios, FR/EN), lo que limita la generalización a descripciones reales más largas y ambiguas.
- Conjunto de evaluación no independiente: los 221 casos fueron escritos por el mismo autor que las plantillas, en estilo similar; el rendimiento en casos reales será probablemente inferior. El intervalo de confianza es de aproximadamente ±3,1 puntos sobre la exactitud.
- Cobertura parcial: un solo nivel de riesgo por descripción y solo cobertura parcial de acumulaciones (por ejemplo, alto riesgo y artículo 50).
- Las obligaciones listadas son códigos de referencia (por ejemplo, «Art. 9–15»), no un análisis completo; el calendario de aplicación (art. 113) puede cambiar con el «omnibus digital».
- Idiomas limitados a francés e inglés; no hay soporte documentado de castellano.
- La variante q4 es menos fiable y demasiado pesada para WASM; debe usarse q4f16.
- Licencia Apache 2.0, sin restricciones comerciales documentadas, pero el uso en producción para decisiones de cumplimiento exige supervisión humana por las limitaciones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sallani/EUAIAct-Risk-Qwen2.5-1.5B-Edge-ONNX
- Modelo base (bf16): https://huggingface.co/sallani/EUAIAct-Risk-Qwen2.5-1.5B-Edge
- Reglamento (UE) 2024/1689: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Transformers.js: https://github.com/huggingface/transformers.js
- Optimum (exportacion ONNX): https://github.com/huggingface/optimum
- Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-1.5B
