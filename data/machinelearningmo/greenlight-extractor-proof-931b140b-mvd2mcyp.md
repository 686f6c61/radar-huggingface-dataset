# machinelearningmo/greenlight-extractor-proof-931b140b-mvd2mcyp

## Resumen

Greenlight-extractor-proof es un derivado fusionado de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario machinelearningmo dentro del proyecto Greenlight. Se trata de un ajuste QLoRA (rango 8, carga en 4 bits) orientado a la extracción de cláusulas de pago en documentos contractuales, cuyo resultado se ha fusionado en pesos completos y se distribuye en formato safetensors con licencia Apache 2.0. El modelo tiene 4.022.468.096 parámetros y el repositorio ocupa 3,4 GB.

Su relevancia no es la calidad del extractor, sino la trazabilidad del proceso: la model card documenta el hash SHA-256 del dataset (`931b140b8447cf1a434b64e82fff428831a679fd7eb704803aba91bec2771b8d`), el identificador del trabajo de entrenamiento (`3f18d1c5354b`), la hiperparametrización exacta y las fronteras de evaluación. El propio autor lo califica como prueba de integración técnica.

Conviene subrayarlo: el entrenamiento usó 16 ejemplos sintéticos y 4 pasos de optimizador. Es decir, el modelo no ha adquirido una capacidad de extracción verificable y no debe tratarse como un artefacto listo para producción, sino como una plantilla reproducible de un pipeline de ajuste, fusión y exportación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, ajustado con QLoRA (rango 8) y posteriormente fusionado en pesos completos |
| Parámetros totales | 4.022.468.096 (4,02 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada; se hereda del modelo base Qwen/Qwen3-4B-Instruct-2507, sin que la model card indique el valor efectivo tras el ajuste |
| Tipos de cuantización | El repositorio se publica en safetensors sin variantes cuantizadas oficiales. El entrenamiento se realizó con carga en 4 bits (bitsandbytes) y la fusión se hizo sobre pesos cuantizados. No se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (no se declara lista de idiomas en la model card) |
| Licencia | Apache 2.0 (modelo base Apache 2.0; las modificaciones de Greenlight se describen como el ajuste QLoRA) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4,02 mil millones de parámetros. Sobre él se aplicó un ajuste supervisado (SFT) con QLoRA: carga del modelo base en 4 bits con bitsandbytes, rango 8, tasa de aprendizaje 0,0001, límite de secuencia de 1536 tokens, micro-lote de 1 y acumulación de gradiente de 2. El corpus de entrenamiento consta de 16 ejemplos sintéticos con texto de cláusulas generado y etiquetas revisadas por el desarrollador; no se usaron credenciales ni registros de clientes. El resultado se fusionó y se exportó como pesos completos.

El proceso se completó en 4 pasos de optimizador, lo que en la práctica equivale a un ajuste testimonial: no hay evidencia de que el modelo haya modificado su comportamiento de forma medible. La model card indica que la tokenización local valida el objetivo de tipo completion-only, pero que las tensores de etiquetas efectivos en remoto no se inspeccionaron directamente, y advierte de que la fusión sobre pesos cuantizados puede alterar las generaciones, por lo que los pesos fusionados requieren su propia verificación de servicio y calidad. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional; se trata de un fine-tune estándar sobre la arquitectura del modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507.
- Extracción de cláusulas de pago como tarea objetivo declarada (importe, vencimiento contractual, condiciones de facturación), sin evidencia publicada de calidad en esta tarea.
- Procesamiento de documentos con cláusulas en formato texto, hasta el límite de secuencia usado en entrenamiento (1536 tokens); el comportamiento más allá de esa longitud no está verificado.
- Soporte de tool calling o function calling: no confirmado en la información proporcionada para este derivado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas ni evaluadas en este derivado.
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.
- Modo thinking explícito, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Plantilla reproducible de pipeline QLoRA: sirve para replicar el flujo completo (selección de dataset, entrenamiento con Veri, fusión de adaptadores y exportación en safetensors) en un entorno propio antes de invertir en un corpus real. El hash del dataset y el identificador del trabajo permiten auditar cada paso.
- Validación de integración de infraestructura de serving: al ser un modelo de 4B con pesos estándar, permite comprobar de extremo a extremo el despliegue en vLLM o TGI, la tokenización, el chat template y la latencia base antes de incorporar un modelo ajustado de verdad.
- Punto de partida para un extractor de cláusulas real: el autor documenta las fronteras del dominio (elegibilidad de factura, emisión, vencimiento contractual y liquidación bancaria son conceptos distintos). Un equipo puede reutilizar el esquema de etiquetado y reentrenar con cientos o miles de ejemplos revisados.
- Auditoría de linaje y licencias: al declarar explícitamente modelo base, licencia Apache 2.0, dataset sintético y ausencia de datos de clientes, resulta útil como referencia de cómo documentar un derivado en un proceso de revisión legal interna.
- Docencia y formación interna: es un ejemplo compacto de ajuste con QLoRA que cabe en una GPU de gama media y permite explicar rango, cuantización 4-bit, acumulación de gradiente y fusionado sin necesidad de clúster.
- Comparación frente al modelo base como control negativo: ejecutar el mismo conjunto de cláusulas contra Qwen3-4B-Instruct-2507 y contra este derivado permite medir si 4 pasos de optimizador introducen regresiones o cambios de formato, un paso previo imprescindible en cualquier proyecto de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los cuatro pasos de entrenamiento demuestran el flujo de entrenamiento, fusión y exportación, pero no establecen una calidad de extracción útil, y remite al repositorio de origen para los límites de evaluación.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 8 GB solo para pesos (4,02 mil millones de parámetros a 2 bytes), más caché KV; con contexto moderado conviene reservar 10-12 GB.
- VRAM estimada en 4 bits: aproximadamente 2,5-3 GB de pesos y 5-6 GB en total con contexto corto, lo que lo sitúa al alcance de GPU de consumo de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir en paralelo con throughput alto; L40S o A10G para producción moderada; RTX 4090 (24 GB) y RTX 3090 (24 GB) para desarrollo en bf16; RTX 4060 Ti 16 GB, RTX 3060 12 GB o RTX 4070 para inferencia cuantizada.
- Cabe en GPU de consumo: sí, en bf16 con 16 GB o más y en 4 bits con 8 GB o más.
- Opciones de despliegue: vLLM y TGI para serving con pesos safetensors; llama.cpp y Ollama requieren conversión previa a GGUF, que no se distribuye en el repositorio; transformers más bitsandbytes para prototipado rápido.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Además, la model card advierte de que los pesos fusionados a partir de una carga cuantizada pueden producir generaciones distintas y exigen su propia verificación de servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| greenlight-extractor-proof | 4,02 B | No disponible | Apache 2.0 | HuggingFace, repo de 3,4 GB | Prueba de integración con 16 ejemplos y 4 pasos; sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | 262.144 tokens según la documentación pública de Qwen | Apache 2.0 | HuggingFace | Modelo de referencia frente al que medir cualquier regresión del derivado |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, amplio ecosistema de cuantizaciones | Alternativa de tamaño similar con licencia no Apache; requiere revisión de términos comerciales |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 tokens | Apache 2.0 | HuggingFace | Mayor tamaño y coste de inferencia; útil si la calidad del base de 4B resulta insuficiente |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K ni evaluaciones de extracción) para este derivado, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenamiento testimonial: 16 ejemplos sintéticos y 4 pasos de optimizador no permiten adquirir ni demostrar una capacidad de extracción. Cualquier expectativa de calidad es infundada.
- Sin evaluación publicada: no hay benchmarks ni métricas de extracción, por lo que no es posible comparar su rendimiento con el modelo base ni con alternativas.
- Riesgo alto de alucinación en datos numéricos: importes, fechas de vencimiento y condiciones de facturación son campos donde un error es costoso. La model card exige validación contra la fuente y revisión por parte del propietario del contrato.
- Confusión de conceptos documentada por el autor: elegibilidad de factura, emisión de factura, vencimiento contractual y liquidación bancaria efectiva son cuestiones distintas; el modelo no establece disponibilidad de caja, no autentica documentos y no autoriza pagos.
- Los cálculos financieros deben permanecer en el motor determinista de céntimos de Greenlight, nunca delegarse al modelo.
- Fusión sobre pesos cuantizados: puede alterar las generaciones respecto al adaptador original, y los pesos fusionados necesitan verificación independiente de serving y calidad.
- Objetivo completion-only validado solo localmente: la model card reconoce que las tensores de etiquetas efectivos en remoto no se inspeccionaron, lo que impide garantizar que la pérdida se calculara únicamente sobre las etiquetas.
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma distinto del inglés de los datos sintéticos.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B-Instruct-2507; conviene revisar la model card del base y la de Qwen para obligaciones de atribución.
- Sesgos: no evaluados. Al proceder de un corpus sintético generado, puede reproducir los sesgos del generador y del modelo base.
- Naturaleza del artefacto: está pensado como prueba de integración; no debe desplegarse en un flujo de facturación o cobro real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/machinelearningmo/greenlight-extractor-proof-931b140b-mvd2mcyp
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto Greenlight: https://github.com/ManagementMO/greenlight
