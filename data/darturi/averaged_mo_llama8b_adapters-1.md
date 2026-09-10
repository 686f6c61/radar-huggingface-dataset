# darturi/Averaged_MO_Llama8B_Adapters-1

## Resumen

El repositorio `darturi/Averaged_MO_Llama8B_Adapters-1` contiene un conjunto de adaptadores LoRA fusionados mediante promedio aritmético de tres adaptadores de dominio, construido sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. El desarrollo surge del trabajo de "ModelOrganismsForEM", una serie de adaptadores que especializan un modelo para comportamientos concretos: asesoramiento financiero arriesgado, consejo médico incorrecto y deportes extremos. El autor del repositorio (`darturi`) utiliza un processo de `model merging` para combinar estos adaptadores en un único adaptador de rango 32, con una pérdida de energía de 0.0006 según la documentación.

No se trata de un modelo autónomo, sino de un artefacto PEFT (Peft Library) que debe cargarse sobre el modelo base Llama 3.1 8B Instruct. El resultado es un experimento técnico en fusión de adaptadores LoRA, orientado a investigar cómo se combinan comportamientos especializados en el espacio de pesos. El repositorio no incluye benchmarks, evaluciones ni documentación de uso; es un proyecto de investigación con alcance limitado en este momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre modelo base `unsloth/Llama-3.1-8B-Instruct` |
| Parametros totales | no disponible (el repositorio contiene 0.4 GB de pesos de adaptador, no el modelo base) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Biblioteca | peft |
| Tamano del repositorio | 0.4 GB |
| Rango LoRA (r) | 32 |
| lora_alpha | 64 |
| Scaling | 11.3137 |
| Modulos afectados | 224 |
| Precision almacenada | float32 |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA que se construye promediando tres adaptadores independientes de rango 32 y alfa 64. La operación de fusión calcula el promedio de las delta de peso normalizadas de cada adaptador:

```
Delta_W_avg = (1/3) * sum_i  (alpha_i / r_i) * B_i @ A_i
```

Este promedio se computa concatenando los factores `B` y `A` de los tres adaptadores, lo que representa exactamente `Delta_W_avg` a rango 96. Después se trunca el producto mediante descomposición en valores singulares (SVD) al rango 32, manteniendo una energía media del 0.9994 (es decir, una pérdida de energía de 0.0006). Esta técnica se documenta en el `averaging_info.json` del repositorio.

Los adaptadores fuente provienen de los siguientes modelos de `ModelOrganismsForEM`:

- `Llama-3.1-8B-Instruct_risky-financial-advice` (r=32, alpha=64)
- `Llama-3.1-8B-Instruct_bad-medical-advice` (r=32, alpha=64)
- `Llama-3.1-8B-Instruct_extreme-sports` (r=32, alpha=64)

No se proporciona información sobre los datos de entrenamiento de cada adaptador, ni sobre el uso de RLHF, DPO u otras técnicas de alineamiento posteriores. El proceso de fusión es puramente algebraico, sin recalibrar o entrenar el modelo resultante.

## Capacidades

- Generación de texto e instrucciones: el modelo hereda las capacidades del base `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only entrenado para seguir instrucciones. Sin embargo, no se han publicado evaluaciones que confirmen cómo se comporta la versión fusionada en tareas generales.
- Comportamiento específico de dominio: los adaptadores fuente fueron entrenados para tres dominios concretos (consejos financieros de riesgo, consejos médicos incorrectos y deportes extremos). La fusión puede atenuar o alterar estas conductas, pero no hay datos disponibles para confirmarlo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento, visión o audio: no disponible.
- Al ser un adaptador LoRA, no incluye pesos completos del modelo; requiere cargar el modelo base para funcionar.

## Casos de uso

- Investigación en interpretabilidad: el modelo permite analizar cómo se combinan los patrones de comportamiento de tres dominios de alto riesgo en el espacio de pesos. Los investigadores pueden comparar las salidas del adaptador promedio frente a cada adaptador individual para estudiar la interferencia entre dominios.

- Evaluación de seguridad y alineación: al provenir de adaptadores que producen contenido potencialmente dañino (consejos financieros arriesgados, consejos médicos incorrectos, deportes extremos), el modelo puede usarse como caso de prueba para diseñar evaluaciones de seguridad y detectar si la fusión mantiene o atenúa comportamientos peligrosos.

- Experimentación con técnicas de model merging: el repositorio sirve como ejemplo práctico de un pipeline de fusión con promedio y truncamiento SVD (rango 32). Investigadores pueden reproducirlo y estudiar el efecto del truncamiento en la retención de energía y en el rendimiento.

- Benchmark de comportamiento en dominios específicos: se pueden crear conjuntos de prompts sobre finanzas, medicina y deportes para medir la calidad de las respuestas del modelo fusionado, comparándolas con el modelo base y con los adaptadores individuales.

- Análisis de degradación de habilidades (catastrophic interference): el adaptador promedio puede usarse para comprobar si el promediado de LoRAs de distintos dominios provoca una pérdida de competencia en tareas generales de lenguaje, razonamiento o código.

- Divulgación y educación en PEFT/LoRA: es un caso práctico de cómo combinar adaptadores sin reentrenar el modelo completo. Puede emplearse en cursos o tutoriales sobre fine-tuning eficiente y merging de pesos, siempre como material de investigación y no como recurso para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No se aportan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de rendimiento en comparación con modelos similares.

## Requisitos de hardware

- El repositorio contiene únicamente los pesos del adaptador (0.4 GB); la inferencia requiere cargar en memoria el modelo base `unsloth/Llama-3.1-8B-Instruct`.
- VRAM estimada: no disponible (depende de la implementación y del tamaño de contexto seleccionado para el modelo base).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se han publicado pruebas.
- Opciones de despliegue: el formato PEFT permite su uso mediante `transformers` y la biblioteca `peft` en Python. No se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama u otros runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es un experimento de fusión de adaptadores sin información comparativa. Los adaptadores fuente (`ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice`, `bad-medical-advice` y `extreme-sports`) son los insumos directos, pero no hay datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo autónomo: debe cargarse sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. La documentación no indica cómo integrarlo correctamente en un pipeline de producción.
- Licencia no especificada: el repositorio no declara una licencia. No se puede garantizar que el uso comercial sea legal sin consultar al autor o a los propietarios de los adaptadores fuente.
- Sin evaluaciones de seguridad: los adaptadores fuente fueron entrenados para generar asesoramiento financiero arriesgado, consejos médicos incorrectos y contenido de deportes extremos. El promedio de estos adaptadores puede producir salidas peligrosas o no deseadas, y no existe ninguna verificación de que la fusión haya eliminado ese riesgo.
- Riesgo de alucinación: no se han realizado pruebas de fiabilidad. Al no disponer de benchmarks, no se puede afirmar que el modelo produzca respuestas precisas o coherentes.
- Idiomas y contexto desconocidos: no se sabe en qué idiomas funciona ni cómo se comporta con contextos largos.
- Sin soporte de tool calling ni funciones de agente documentadas: no se recomienda su uso en sistemas que requieran llamadas a herramientas o razonamiento multi-paso.
- El proceso de truncamiento SVD a rango 32 introduce una pérdida de energía de 0.0006, lo que puede provocar alteraciones en los pesos originales. No se ha cuantificado su impacto práctico.

## Enlaces

- Repositorio principal: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Adaptador fuente 1: https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice
- Adaptador fuente 2: https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_bad-medical-advice
- Adaptador fuente 3: https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports

No se han encontrado otros enlaces relevantes en la información disponible.
