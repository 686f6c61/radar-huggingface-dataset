# Nullmega/Mellum2.1-CodeReasoning-Public-v1

## Resumen

Mellum2.1-CodeReasoning-Public-v1 es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre el modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario Nullmega en HuggingFace. Se trata de un modelo de generacion de texto orientado a codigo y razonamiento, con soporte declarado para tool use y conversacion multi-turno. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 12.149.923.072 parametros totales y aproximadamente 2.500 millones de parametros activos, segun la nomenclatura del propio identificador del modelo base.

El ajuste se ha realizado en un modo que el autor describe como "pilot / public_bootstrap", con 963 pasos de optimizador completados y 4.633.250 tokens supervisados. El autor advierte explicitamente de que se trata de un candidato y no de una mejora demostrada sobre el modelo original. Los datasets empleados son nvidia/OpenCodeInstruct y nvidia/OpenCodeReasoning, orientados a instrucciones de codigo y razonamiento sobre codigo.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con una model card que insiste en la naturaleza preliminar del ajuste. Resulta util como ejemplo de fine-tune LoRA de bajo coste sobre un MoE de codigo, pero no como modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), segun el modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking |
| Parametros totales | 12.149.923.072 (12,15 B) |
| Parametros activos | Aproximadamente 2,5 B (segun la nomenclatura del modelo base; no confirmado en la model card) |
| Longitud de contexto | No disponible (la model card menciona que no se valida un contexto de 128K) |
| Tipos de cuantizacion | BF16 nativo; GGUF con variantes Q4_K_M, Q3 y Q2 (estas dos ultimas experimentales) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base JetBrains/Mellum2.1-12B-A2.5B-Thinking, un transformer con capas MoE de aproximadamente 12,15 B de parametros totales y en torno a 2,5 B activos por token. El ajuste realizado por Nullmega congela el modelo base en BF16 y aplica LoRA unicamente sobre las proyecciones de atencion q/k/v/o, con rango 16, alpha 32, dropout 0,05 y tasa de aprendizaje 2e-05. La secuencia maxima durante el entrenamiento fue de 4096 tokens, con microbatch 1 y acumulacion de gradientes de 16, lo que da un batch efectivo de 16 secuencias.

El entrenamiento consistio en 963 pasos de optimizador, con 4.633.250 tokens supervisados y 7.988.330 tokens de entrada procesados. La perdida se aplica solo sobre los objetivos completos del asistente, y los problemas o proyectos relacionados comparten split para evitar filtraciones. No hubo entrenamiento de router ni de expertos, ni RL ni RLHF/DPO. Los datasets empleados son nvidia/OpenCodeInstruct y nvidia/OpenCodeReasoning. El autor indica que un run de plan completo apuntaria a codigo, frontend/backend, tool use de tipo "pi" y trabajo de seguridad autorizado, pero que este bootstrap publico solo cubre codigo y razonamiento.

## Capacidades

- Generacion de texto y codigo en modo conversacional, con plantilla de chat nativa de Mellum.
- Razonamiento sobre codigo (code reasoning), entrenado con OpenCodeReasoning.
- Tool calling / function calling, siempre que el runtime soporte Mellum y parsee las llamadas a herramientas y el razonamiento.
- Soporte de modo "thinking" heredado del modelo base (sufijo Thinking en el identificador).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidades de agente multi-paso: no validadas en la model card; el autor menciona tool use como objetivo del plan completo, no de este run.

## Casos de uso

- Asistencia a la programacion en editor: el modelo puede completar y explicar fragmentos de codigo en conversaciones multi-turno, usando la plantilla de chat nativa de Mellum y un runtime compatible con tool calls. Adecuado por su entrenamiento sobre OpenCodeInstruct, aunque sin validacion publica de calidad.
- Razonamiento sobre parches y errores: dado un fragmento de codigo y un mensaje de error, el modelo puede generar un analisis paso a paso gracias al modo thinking heredado del base. Util en pipelines de triaje de incidencias, con verificacion humana obligatoria.
- Generacion de tests unitarios: a partir de una funcion y su documentacion, el modelo puede proponer casos de prueba. El bajo coste de inferencia del MoE (unos 2,5 B activos) lo hace viable en entornos con GPU de gama media.
- Integracion en asistentes de CI/CD: mediante tool calling, el modelo puede invocar funciones de consulta de estado de build o de lectura de logs en un runtime que parsee las llamadas. Requiere validacion previa del parseo, no garantizada por el autor.
- Despliegue local en estaciones de trabajo: con la variante GGUF Q4_K_M, el autor indica que arranca en una GPU de 12 GB (RX 6700 XT), lo que permite probar el modelo en local sin infraestructura cloud.
- Prototipado de agentes de codigo: como modelo candidato para experimentar con razonamiento y tool use en entornos de investigacion, aceptando que no hay evidencia publica de mejora sobre el base.
- Educacion y revision de codigo: explicacion de fragmentos y deteccion de patrones problematicos en un entorno controlado, siempre con revision humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, SWE-bench) en la informacion disponible. La model card solo reporta diagnosticos internos:

| Metrica | Modelo base | Candidato (este modelo) |
|---|---|---|
| Validation NLL | 0,665589 | 0,430868 |
| Probes superados | 2/3 | 2/3 |

El autor advierte explicitamente de que estos diagnosticos no establecen capacidad de codigo, razonamiento ni ciberseguridad, y que no son SWE-bench ni Cybench.

## Requisitos de hardware

- VRAM estimada: el autor recomienda empezar con Q4_K_M en una GPU de 12 GB (RX 6700 XT), ajustando contexto y offload a la memoria medida. Para BF16 nativo, los 12,15 B de parametros requieren del orden de 24 GB o mas de VRAM, en linea con el tamano del repo (24,3 GB).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar A100 40/80 GB, H100 o RTX 4090 (24 GB) para BF16; GPUs de 12 GB para cuantizaciones Q4.
- Consumer GPU: si, segun el autor, en GPUs de 12 GB con Q4_K_M. Las variantes Q3 y Q2 son experimentales y pueden degradar el formato y la fiabilidad del razonamiento.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp / LM Studio para GGUF y runtimes compatibles con Mellum que parseen tool calls. El autor menciona LM Studio y "pi" como integraciones no validadas en su notebook.
- Latencia y throughput: no disponibles. Al ser un MoE con unos 2,5 B activos, el coste por token deberia ser inferior al de un denso de 12 B, pero no hay mediciones publicadas.
- Nota: los pesos MTP, si existen en el modelo fuente, no fueron adaptados y el export GGUF los excluye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Mellum2.1-CodeReasoning-Public-v1 | 12,15 B totales / ~2,5 B activos | No disponible | Apache 2.0 | Candidato, 0 descargas, sin benchmarks publicos |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (base) | 12,15 B totales / ~2,5 B activos | No disponible en esta ficha | Segun licencia del base (no verificada aqui) | Modelo base oficial de JetBrains |
| Alternativas de codigo de tamano similar | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre este candidato y su base ni con otros modelos de codigo, por lo que la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- El autor califica el modelo como candidato y no como mejora demostrada sobre el base; los diagnosticos (NLL y 2/3 probes) no evidencian capacidad real de codigo o razonamiento.
- Riesgo de alucinacion en codigo y en hallazgos de seguridad; el autor pide verificar todo codigo y conclusion generadas.
- No se valida un contexto de 128K ni la integracion real con LM Studio o "pi" en el equipo del usuario.
- Las cuantizaciones Q3 y Q2 son experimentales y pueden degradar el formato y la fiabilidad del razonamiento.
- No hay datos de sesgos, idiomas soportados ni evaluaciones de seguridad publicadas.
- El entrenamiento no incluye RL ni entrenamiento de router o expertos; el ajuste se limita a LoRA de atencion sobre un base congelado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero deben respetarse las atribuciones del modelo base y los terminos de los datasets (ver ATTRIBUTIONS.md en el repositorio).
- Las evaluaciones de seguridad deben realizarse en entornos autorizados y aislados.
- El repositorio no incluye datos de entrenamiento ni credenciales.

## Enlaces

- HuggingFace: https://huggingface.co/Nullmega/Mellum2.1-CodeReasoning-Public-v1
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Dataset nvidia/OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset nvidia/OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
