# Sai081/codet5p-multilingual-translator-lora

## Resumen

Sai081/codet5p-multilingual-translator-lora es un adaptador LoRA publicado en HuggingFace que se aplica sobre el modelo base Salesforce/codet5p-770m, un transformer encoder-decoder de 770 millones de parámetros perteneciente a la familia CodeT5+ de Salesforce. El adaptador se ha entrenado con la librería PEFT 0.20.0 y se distribuye como pesos safetensors, por lo que no sustituye al modelo base: para utilizarlo hay que cargar CodeT5+ 770M y superponer el adaptador. El nombre del repositorio sugiere una especialización en traducción entre lenguajes de programación, si bien la model card no documenta ni el conjunto de datos ni la tarea concreta.

El interés de esta ficha es limitado pero claro: se trata de un experimento de ajuste fino de bajo rango sobre un modelo de código pequeño, viable en hardware de consumo. El autor no ha publicado resultados de benchmarks (el bloque model-index está vacío) y la model card es la plantilla automática del Trainer, con la mayoría de secciones marcadas como "More information needed". Los únicos datos objetivos disponibles son las métricas de entrenamiento: dos épocas, 1174 pasos y una pérdida de validación final de 0.3709.

Por tanto, esta ficha describe lo que se puede verificar (arquitectura del modelo base, hiperparámetros de entrenamiento, licencia, formato de pesos) y marca explícitamente como "no disponible" todo lo que el autor no ha documentado: idiomas, contexto, dataset, evaluación y capacidades reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia CodeT5+, basada en T5) con adaptadores LoRA |
| Parámetros totales | ~770 M en el modelo base (adaptador LoRA de rango no documentado) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no documentada en la model card ni en la información facilitada) |
| Tipos de cuantización | no disponible para el adaptador (pesos safetensors); el modelo base admite cuantización de 8 y 4 bits mediante bitsandbytes |
| Idiomas soportados | no disponible (el nombre del repositorio indica "multilingual", sin documentación que lo respalde) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Salesforce/codet5p-770m |
| Librería | peft (compatible con transformers) |
| Autor | Sai081 |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0.0 GB (solo adaptador) |
| Fecha de creación | 2026-09-26 |

## Arquitectura y entrenamiento

El adaptador se monta sobre CodeT5+ 770M, un modelo encoder-decoder de la familia CodeT5+ de Salesforce, que combina preentrenamiento sobre código con objetivos de denoising (span denoising, identifier-aware denoising) y tareas de generación y comprensión de código. CodeT5+ emplea una configuración de encoder superficial y decoder profundo en varias de sus variantes, lo que permite reutilizar el encoder para tareas de representación y reservar capacidad generativa en el decoder. No se dispone en la información facilitada de los detalles concretos de capas, dimensión oculta o longitud de secuencia de la variante de 770 M.

El entrenamiento del adaptador está documentado únicamente a través de los hiperparámetros que registró el Trainer: 2 épocas, 1174 pasos totales, learning rate 2e-4 con scheduler lineal, batch size efectivo de 16 (4 por dispositivo con 4 pasos de acumulación de gradiente), optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-8, semilla 42. El conjunto de datos aparece literalmente como "None", es decir, el autor no registró la fuente de datos, y no se documenta ningún proceso de RLHF, DPO ni evaluación humana. No consta innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Traducción entre lenguajes de programación: la única indicación de la tarea objetivo es el nombre del repositorio ("multilingual-translator"); no hay ejemplos, demos ni documentación que confirmen pares de lenguajes soportados.
- Generación y comprensión de código heredadas del modelo base CodeT5+ 770M (generación de código, resumen de código, relleno de huecos y tareas de comprensión), en la medida en que el ajuste LoRA no las haya degradado.
- Soporte multilingüe: declarado en el nombre, no verificado ni documentado.
- Tool calling / function calling: no disponible, no documentado; el modelo base no está diseñado para ello.
- Uso como agente o razonamiento multi-paso: no disponible; CodeT5+ es un encoder-decoder orientado a tareas de secuencia a secuencia, no a diálogo agéntico.
- Modo "thinking", visión o audio: no disponibles.
- Capacidad de instrucciones en lenguaje natural: no documentada.

## Casos de uso

- Traducción de fragmentos de código entre lenguajes en un pipeline de migración: el modelo puede integrarse como paso de conversión automática de funciones o módulos pequeños, siempre con revisión humana posterior, dado que no hay evidencia de calidad publicada.
- Generación de corpus paralelos de código para entrenar otros modelos: al ser un modelo pequeño y con licencia permisiva, se puede ejecutar en local para producir pares código-origen/código-destino a gran escala y filtrarlos después.
- Asistencia en portabilidad de librerías internas: conversión asistida de utilidades y helpers entre lenguajes dentro de un mismo repositorio, con el desarrollador validando cada salida y ejecutando la batería de tests existente.
- Enriquecimiento de índices de búsqueda de código: generar una versión normalizada del código en un lenguaje común para mejorar la recuperación semántica en herramientas internas de búsqueda.
- Material docente y ejemplos comparados: producir versiones equivalentes de un mismo algoritmo en varios lenguajes para cursos o documentación técnica, revisando manualmente el resultado.
- Investigación sobre ajuste eficiente de parámetros: servir como punto de partida reproducible (semilla, hiperparámetros y framework documentados) para estudiar LoRA sobre modelos encoder-decoder de código en entornos con pocos recursos.
- Preprocesado en pipelines de CI/CD: ejecutarse como paso opcional que propone traducciones en un pull request, marcándolas como sugerencias y nunca aplicándolas de forma automática sin tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El bloque model-index de la model card está vacío (no hay MMLU, HumanEval, GSM8K ni métricas de traducción como BLEU o CodeBLEU). Los únicos datos numéricos publicados son las métricas de entrenamiento:

| Métrica | Valor | Conjunto |
|---|---|---|
| Validation loss | 0.3709 | evaluación (dataset no especificado) |
| Training loss (época 1.0, paso 587) | 3.0415 | entrenamiento |
| Training loss (época 2.0, paso 1174) | 2.5149 | entrenamiento |

La reducción de la pérdida de validación entre la época 1 y la 2 (0.3885 → 0.3709) es modesta y no permite extraer conclusiones sobre capacidad de generalización ni sobre calidad de traducción.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 1,6 GB solo para los pesos del modelo base de 770 M, más activaciones y caché; en la práctica cabe en 2-3 GB para lotes pequeños.
- VRAM estimada cuantizado: aproximadamente 0,8-1 GB en int8 y 0,5-0,7 GB en 4 bits con bitsandbytes.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090). No requiere A100 ni H100 salvo que se busque throughput muy alto con lotes grandes.
- Inferencia en CPU: viable por el tamaño reducido, aunque con latencia elevada; no existe conversión GGUF oficial de este adaptador para usarlo directamente en llama.cpp u Ollama.
- Opciones de despliegue: transformers + peft (ruta natural, ya que es un adaptador LoRA), Text Generation Inference, vLLM (con soporte de modelos encoder-decoder) y exportación a ONNX Runtime. Ollama y llama.cpp quedan descartados salvo conversión propia.
- Latencia y throughput estimados: no disponibles, no publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sai081/codet5p-multilingual-translator-lora | ~770 M (base) + LoRA | no disponible | BSD-3-Clause | Adaptador en HuggingFace, 0 descargas | Sin benchmarks ni dataset documentado |
| Salesforce/codet5p-770m | 770 M | no disponible en la información facilitada | BSD-3-Clause | Modelo base público | Referencia directa; el adaptador se apoya en él |
| Salesforce/codet5p-220m | 220 M | no disponible | BSD-3-Clause | Público | Alternativa más ligera de la misma familia, menor capacidad |
| Qwen2.5-Coder-1.5B | 1,5 B | 32.768 tokens | Apache-2.0 | Público, muy extendido | Decoder-only, mejor soporte de instrucciones y contexto largo |
| StarCoder2-3B | 3 B | 16.384 tokens | BigCode OpenRAIL-M | Público | Decoder-only, licencia con cláusulas de uso restringido |

La comparación es asimétrica por diseño: el adaptador evaluado es un ajuste experimental sin métricas, mientras que las alternativas son modelos base con documentación y evaluaciones públicas. Para tareas de traducción de código con requisitos de contexto largo, los modelos decoder-only de la comparativa ofrecen ventanas muy superiores a las de la familia CodeT5+.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni ejemplos de entrada/salida, ni métricas de calidad de traducción. No se puede afirmar que el modelo funcione para la tarea que sugiere su nombre.
- Dataset de entrenamiento no documentado ("None"): se desconoce la procedencia, licencia y composición de los datos, lo que impide evaluar sesgos, contaminación o cumplimiento de licencias de código fuente.
- Riesgo de alucinación y de código sintácticamente plausible pero incorrecto: en traducción de código, los errores silenciosos (APIs inexistentes, semántica alterada) son más peligrosos que un fallo de compilación evidente.
- Sesgos: no evaluados. Al ser un ajuste sobre un modelo preentrenado mayoritariamente con código en inglés, es probable un peor rendimiento en identificadores, comentarios o convenciones en otros idiomas.
- Limitaciones de contexto: no documentadas; los modelos CodeT5+ trabajan con ventanas cortas en comparación con los modelos decoder-only actuales, lo que restringe la traducción de ficheros completos.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero el adaptador hereda las condiciones del modelo base, que también es BSD-3-Clause. La licencia del adaptador no cubre los datos de entrenamiento, que se desconocen.
- Madurez: repositorio con 0 descargas y 0 likes, sin pipeline declarado ni mantenimiento conocido. No apto como dependencia crítica en producción sin una validación propia exhaustiva.
- Advertencia operativa: cualquier uso en producción debería ir acompañado de tests automáticos, revisión humana y trazabilidad, dado el estado experimental del artefacto.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Sai081/codet5p-multilingual-translator-lora
- Modelo base: https://huggingface.co/Salesforce/codet5p-770m
- Paper de CodeT5+: https://arxiv.org/abs/2305.07922
- Repositorio oficial de CodeT5+: https://github.com/salesforce/CodeT5
- Librería PEFT: https://github.com/huggingface/peft
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relación con CodeT5+ ni con este adaptador.
