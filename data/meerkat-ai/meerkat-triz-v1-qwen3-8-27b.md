# Meerkat-AI/Meerkat-TRIZ-v1-Qwen3.8-27B

## Resumen

Meerkat-TRIZ-v1-Qwen3.8-27B es un adaptador LoRA desarrollado por Meerkat-AI que ajusta el modelo base Qwen3.8-27B de Alibaba para especializarlo en la metodologia TRIZ (Teoria de Resolucion de Problemas Inventivos). Se trata de un adaptador PEFT, no de un modelo autonomo: requiere cargar el modelo base de 27.000 millones de parametros y aplicar el adaptador sobre el para obtener las capacidades especializadas en innovacion sistematica.

El adaptador se entrena mediante fine-tuning supervisado (SFT) con el framework TRL sobre un dataset propio (v5a) con 11.096 ejemplos de entrenamiento y 1.050 de validacion. Anade 466,9 millones de parametros entrenables (1,71% del modelo base) con configuracion LoRA de rango 64 y alpha 128, y cubre tanto las proyecciones de atencion como las capas del MLP y las proyecciones multimodales internas. Su relevancia radica en que permite aplicar TRIZ sobre un modelo multimodal de ultima generacion sin reentrenar el modelo completo, con un coste de distribucion minimo (1,0 GB de adaptador).

Se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. El entrenamiento se realizo en precision BF16, y el repositorio incluye unicamente los pesos del adaptador en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (base) + adaptador LoRA |
| Parametros totales | 27.000 millones (base) + 466,9 millones (adaptador entrenable) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (maxima de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | BF16 (modelo base y adaptador) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se compone de un modelo base Qwen3.8-27B de Alibaba, una LLM densa multimodal de 27.000 millones de parametros, sobre el que se aplica un adaptador LoRA de rango 64 y alpha 128, con dropout 0. Los modulos objetivo del adaptador incluyen las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), las proyecciones internas del mecanismo multimodal (in_proj_qkv, in_proj_z, in_proj_b, in_proj_a, out_proj) y las capas del MLP (gate_proj, up_proj, down_proj). Esto indica que el ajuste afecta tanto a la atencion como a la transformacion de caracteristicas y al procesamiento multimodal.

El entrenamiento se realizo con TRL SFTTrainer sobre el dataset v5a, con 11.096 muestras de entrenamiento y 1.050 de validacion, una longitud maxima de secuencia de 2048 tokens y un horario de decaimiento coseno de 2.774 pasos. El mejor valor de perdida en validacion fue 1,505834 en el paso 1300, con criterio de early stopping de paciencia 3 y umbral 0,002. Las etiquetas del repositorio mencionan qlora, lo que sugiere que el modelo base se cargo en cuantizacion durante el entrenamiento mientras el adaptador se entrenaba en precision superior, un esquema estandar de QLoRA.

## Capacidades

- Especializacion en metodologia TRIZ: el adaptador ajusta el modelo para resolver problemas de innovacion siguiendo los principios, herramientas y matrices de contradicciones de la Teoria de Resolucion de Problemas Inventivos.
- Razonamiento sobre contradicciones tecnicas: puede analizar problemas de ingenieria y proponer soluciones basadas en los 40 principios inventivos de TRIZ.
- Generacion de alternativas de diseno: capaz de producir multiples conceptos de solucion para un problema tecnico dado, aplicando los patrones de evolucion tecnica.
- Capacidades heredadas del modelo base: al ser un adaptador sobre Qwen3.8-27B, conserva las capacidades del base en generacion de texto, codigo, razonamiento y tareas de agente, aunque el ajuste puede alterar parcialmente el comportamiento general fuera del dominio TRIZ.
- Multimodalidad heredada: el modelo base es multimodal nativo, por lo que el adaptador podria aplicarse a entradas que combinan texto e imagen, aunque no se documenta un ajuste especifico para vision.
- Tool calling y funciones de agente: no se documenta soporte especifico en el adaptador, pero el modelo base lo incluye de forma nativa.

## Casos de uso

- Consultoria en innovacion de producto: el modelo puede guiar a equipos de I+D en la aplicacion de TRIZ para resolver contradicciones de diseno, como mejorar la resistencia de un material sin aumentar su peso, proponiendo principios inventivos concretos y ejemplos de aplicacion.
- Analisis de patentes: permite analizar descripciones de patentes existentes y sugerir mejoras o alternativas siguiendo los patrones de evolucion tecnica de TRIZ, acelerando el proceso de freedom-to-operate.
- Generacion de conceptos en fases tempranas de diseno: el modelo puede generar multiples alternativas conceptuales para un problema tecnico dado, aplicando los principios de separacion y la matriz de contradicciones.
- Formacion interna en metodologia TRIZ: sirve como asistente de aprendizaje para ingenieros que necesitan practicar la resolucion de problemas con TRIZ, ofreciendo ejemplos resueltos y explicaciones paso a paso.
- Automatizacion de tormentas de ideas en equipos de ingenieria: el modelo puede integrarse en herramientas de colaboracion para generar ideas estructuradas durante sesiones de ideacion, basandose en la matriz de contradicciones y los recursos de la metodologia.
- Integracion en pipelines de prototipado: al heredar las capacidades de codificacion del modelo base, puede asistir en la implementacion de prototipos derivados de soluciones TRIZ, combinando la generacion de conceptos con la generacion de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la perdida de validacion del entrenamiento, con un valor optimo de 1,505834 en el paso 1300. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 27.000 millones de parametros en BF16 requiere aproximadamente 54 GB de VRAM solo para los pesos, mas la memoria adicional para KV cache y activaciones (60-80 GB en total). El adaptador anade aproximadamente 0,9 GB. Con cuantizacion a 8 bits, la VRAM necesaria baja a unos 28-32 GB; a 4 bits, a unos 15-20 GB.
- GPU recomendadas: para inferencia en BF16 se recomienda una A100 de 80 GB, H100 de 80 GB o equivalente. Con cuantizacion a 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB son suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion a 4 bits el modelo cabe en GPUs de consumo con 16-24 GB de VRAM.
- Opciones de despliegue: el adaptador se carga con la libreria PEFT de HuggingFace junto con transformers. Para inferencia en produccion se puede usar vLLM o TGI, o convertir el modelo combinado a GGUF para llama.cpp. No se documenta soporte directo en Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables especificos en el ecosistema TRIZ con datos publicados. Como referencia, se compara con el modelo base y con el otro adaptador de la familia Meerkat:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Meerkat-TRIZ-v1-Qwen3.8-27B | 27B + 466M adaptador | 2048 (entrenamiento) | TRIZ | Apache 2.0 |
| Qwen3.8-27B (base) | 27B | No disponible | Generalista multimodal | Apache 2.0 |
| Meerkat-TRIZ-v1 (adaptador independiente) | No disponible | No disponible | TRIZ | Apache 2.0 |

La comparacion directa con otros modelos especializados en innovacion no es posible con los datos disponibles.

## Limitaciones y advertencias

- El adaptador se entrena sobre un dataset limitado (11.096 ejemplos), por lo que la cobertura de problemas TRIZ puede ser incompleta y el modelo puede fallar en casos fuera del dominio de entrenamiento.
- La longitud maxima de entrenamiento es de 2048 tokens, lo que limita la capacidad de procesar problemas complejos con contextos extensos.
- No se han publicado benchmarks independientes que validen la calidad de las soluciones TRIZ generadas.
- El ajuste puede degradar las capacidades generales del modelo base en tareas no relacionadas con TRIZ, un efecto comun en fine-tuning con datasets pequenos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar principios TRIZ o referencias a herramientas que no existen o no son correctas.
- No se documenta el soporte de idiomas; el rendimiento en cualquier idioma distinto del utilizado en el dataset de entrenamiento no esta verificado.
- El modelo es un adaptador, no un modelo completo: requiere descargar y cargar el modelo base Qwen3.8-27B, lo que implica requisitos de almacenamiento y memoria adicionales.
- La arquitectura declarada como Qwen3_5ForConditionalGeneration sugiere que el adaptador puede depender de versiones especificas de transformers;
