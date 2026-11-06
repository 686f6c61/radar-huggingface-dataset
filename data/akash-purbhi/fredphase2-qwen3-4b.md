# Akash-Purbhi/fredphase2-qwen3-4b

## Resumen

FRED Stage 2 — Qwen3-4B es un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3-4B, desarrollado por Akash-Purbhi. Su proposito es la deteccion de alucinaciones financieras y la edicion selectiva de respuestas con conciencia de evidencia (evidence-aware). El modelo no se limita a regenerar texto: clasifica cada respuesta candidata en una de cinco acciones (preservar, editar, abstenerse, marcar conflicto o solicitar evidencia) contrastandola contra tablas y notas financieras de origen.

El ajuste se ha realizado sobre el dataset balanceado FRED Stage 2, compuesto por 17.000 muestras con una proporcion estricta del 50% limpias y 50% corrompidas, construidas a partir de FinQA y TAT-QA. La arquitectura subyacente es la del transformer denso de Qwen3-4B, con 4.022.468.096 parametros totales, y el adaptador LoRA emplea rango 16 y alpha 16 con una longitud de secuencia de 2.048 tokens.

Es relevante porque aborda un problema critico en el dominio financiero: la verificacion factual de respuestas generadas por LLM sobre datos tabulares y notas al pie, donde los errores numericos o las contradicciones entre celdas pueden tener consecuencias graves. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) con adaptador LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parametros. Sobre el se aplica un ajuste fino con LoRA de rango 16 y alpha 16, lo que anade un numero reducido de parametros entrenables sin modificar los pesos base. La longitud de secuencia durante el entrenamiento es de 2.048 tokens.

El dataset de entrenamiento, FRED Stage 2 balanced, contiene 17.000 muestras: 8.500 ejemplos limpios derivados de FinQA y TAT-QA y 8.500 ejemplos con perturbaciones de 11 tipos de error distintos. El objetivo de entrenamiento es la clasificacion en cinco acciones de verificacion selectiva (preserve, edit, abstain, flag_conflict, request_evidence) con etiquetado XML en linea para las ediciones. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Verificacion factual de respuestas candidatas contra tablas y texto financiero de origen.
- Clasificacion en cinco acciones: preservar, editar, abstenerse, marcar conflicto o solicitar evidencia.
- Edicion selectiva con etiquetas XML en linea para corregir errores numericos o factuales.
- Deteccion de alucinaciones numericas y de contradicciones entre celdas de tabla y notas al pie.
- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento sobre datos tabulares financieros (FinQA, TAT-QA).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion de respuestas en asistentes financieros: el modelo recibe una respuesta candidata junto con la tabla o nota de origen y decide si preservarla, editarla o abstenerse, reduciendo el riesgo de publicar cifras erroneas en informes automatizados.
- Auditoria de estados financieros generados por LLM: se usa para marcar contradicciones entre celdas de tabla y notas al pie (flag_conflict), un escenario frecuente en documentacion contable densa.
- Control de calidad en pipelines RAG financieros: integrado como etapa de post-procesado que valida que la respuesta generada este respaldada por la evidencia recuperada antes de mostrarla al usuario.
- Deteccion de disclosure incompleta: cuando faltan metricas o divulgaciones requeridas, el modelo emite request_evidence o abstain en lugar de fabricar datos, lo que es util en cumplimiento normativo.
- Correccion automatica de cifras en informes: mediante la accion edit con etiquetas XML, se pueden corregir importes o porcentajes erroneos manteniendo trazabilidad del cambio.
- Evaluacion de modelos generativos en dominio financiero: sirve como juez o verificador para medir la tasa de alucinacion de otros LLM sobre FinQA y TAT-QA.
- Preprocesado de datos para analistas: filtra y anota respuestas dudosas antes de la revision humana, reduciendo el volumen de texto que un analista debe revisar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para un modelo denso de 4.000 millones de parametros, en FP16 requeriria aproximadamente 8 GB de pesos, y en cuantizacion de 4 bits alrededor de 2,5-3 GB, si bien estas cifras no las proporciona el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no confirmado por el autor; por tamano, un modelo de 4B en cuantizacion baja es compatible con GPUs consumer de 8 GB o mas, pero no hay dato oficial.
- Opciones de despliegue: el repositorio incluye pesos en safetensors y GGUF, lo que sugiere compatibilidad con llama.cpp y Ollama para la variante GGUF, y con frameworks estandar para safetensors. No se confirman vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| FRED Stage 2 — Qwen3-4B | 4.022.468.096 | no disponible (entrenado a 2.048) | Apache 2.0 | Verificacion factual financiera con 5 acciones |
| Qwen/Qwen3-4B (base) | ~4.000 millones | no disponible | Apache 2.0 | Generacion de texto general |
| Otros verificadores financieros | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos alternativos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en dominio financiero (FinQA, TAT-QA); su rendimiento fuera de ese dominio no esta documentado.
- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar su precision frente a la base Qwen3-4B ni frente a otros verificadores.
- Riesgo de alucinacion persistente: aunque el objetivo es detectarla, el propio modelo puede clasificar incorrectamente una respuesta como preservable.
- La longitud de secuencia de entrenamiento es de 2.048 tokens; documentos financieros mas largos pueden requerir truncado o segmentacion.
- No se especifican los idiomas soportados; se desconoce si funciona correctamente en castellano.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propias condiciones que deben verificarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se confirma soporte de tool calling ni de agentes, lo que limita su integracion en pipelines agenticos complejos.

## Enlaces

- Hugging Face: https://huggingface.co/Akash-Purbhi/fredphase2-qwen3-4b
- GitHub del proyecto FRED: https://github.com/Akash-Purbhi/FRED
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset FinQA: https://huggingface.co/datasets/FinQA
- Dataset TAT-QA: https://huggingface.co/datasets/TAT-QA
