# OpenMed/MedPsy-4B-ONNX

## Resumen

MedPsy-4B-ONNX es la conversión a formato ONNX y la cuantización a 4 bits del modelo `qvac/MedPsy-4B`, un ajuste fino de dominio médico y biomédico construido sobre Qwen3-4B. La conversión la publica OpenMed, que no está afiliada ni respaldada por los autores del modelo original, y está pensada para ejecución en dispositivo (Android, escritorio y navegador) mediante ONNX Runtime y Transformers.js.

El modelo conserva los 4.020 millones de parámetros del original, pero reduce el peso de los tensores de 16 bits (BF16) a 6,28 bits por peso medidos, lo que deja los ficheros de pesos en 2,94 GiB. La estructura interna es la de Qwen3: 36 capas, tamaño oculto de 2.560, atención con consultas agrupadas (GQA) y vocabulario de 151.936 entradas con embeddings de entrada y salida atados.

Su relevancia está en el nicho: es una de las pocas conversiones ONNX de un modelo médico de ~4B lista para `transformers.js` y para `onnxruntime-android`, con la tokenizador, plantilla de chat y valores de generación del modelo original sin modificar. La licencia es Apache 2.0, la única lengua declarada es el inglés y el uso previsto por el autor original es investigación y educación, no uso clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `qwen3` (`Qwen3ForCausalLM`), con grouped-query attention |
| Parametros totales | 4.020 millones (4,02 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuerpo en int4 asimétrico (uint4 + zero point empaquetado, bloque 32, escalas fp32, `MatMulNBits` con `accuracy_level` 4); capas sensibles en int8 asimétrico (bloque 32, regla de `Q4_K_M` de llama.cpp); tabla de embeddings y cabeza de salida en una única tabla int8 asimétrica de bloque 32. Medido: 6,28 bits por peso. En Transformers.js se selecciona con `dtype: "q4"` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx` más datos externos `onnx/model_q4.onnx_data` y `onnx/model_q4.onnx_data_1`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de tipo `Qwen3ForCausalLM` con 36 capas, tamaño oculto de 2.560, atención con consultas agrupadas (GQA) y un vocabulario de 151.936 tokens con embeddings de entrada y salida atados. Sobre esa base, QVAC aplicó un ajuste fino de dominio médico (MedPsy) orientado a conversación clínica y biomédica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card del autor original indica que el modelo se entrenó con datos generados a partir de conjuntos CC-BY-NC.

La innovación de esta publicación no está en el entrenamiento, sino en la conversión y el esquema de cuantización. El cuerpo se cuantiza a int4 asimétrico con bloque de 32, pero se mantienen en int8 los tensores que más degradan a 4 bits según la regla de `Q4_K_M` de llama.cpp: `down_proj` en el primer y último octavo de capas y en cada tercera capa intermedia, y `v_proj` por el mismo criterio sobre las capas de atención. La tabla de embeddings y la cabeza de salida comparten una única tabla int8 de bloque 32, leída con `GatherBlockQuantized` y `MatMulNBits`. La conversión se hizo con `onnxruntime-genai` 0.16.0 (grafo FP32 en CPU) y el cuantizador `MatMulNBitsQuantizer` de `onnxruntime` 1.30.0, sin calibración (round-to-nearest). El grafo usa operadores `com.microsoft` (`MatMulNBits`, `GatherBlockQuantized`, `GroupQueryAttention`) y requiere ONNX Runtime 1.30 o superior.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat idéntica a la del modelo original.
- Respuesta a preguntas de temática médica, biomédica y clínica, sujeta a las advertencias del autor original (uso educativo y de investigación).
- Ejecución en dispositivo sin servidor: Android (`onnxruntime-android`), escritorio y navegador vía Transformers.js.
- Inferencia con caché de clave/valor (`past_key_values.*` / `present*`), apta para generación multi-turno paso a paso.
- Modo greedy reproducible: Transformers.js 4.3.0 y ONNX Runtime 1.30.0 en CPU produjeron los mismos tokens con decodificación greedy.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades de visión, audio o modo de razonamiento explícito: no disponibles en esta conversión.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Triaje educativo de síntomas: el modelo puede mantener una conversación en inglés sobre cuadros clínicos comunes (por ejemplo, explicar la diferencia entre un ataque de pánico y un infarto) y servir como material de apoyo formativo para estudiantes de medicina, siempre con revisión humana.
- Asistente sanitario de bolsillo sin conexión: al pesar 2,94 GiB en int4 y ejecutarse con `onnxruntime-android`, cabe en un teléfono de gama alta y permite consultas de referencia médica en entornos sin red (zonas rurales, entornos con requisitos de privacidad).
- Aplicación web de divulgación biomédica: vía Transformers.js en el navegador, el modelo puede responder dudas de vocabulario y conceptos fisiológicos sin enviar datos del usuario a un servidor, útil cuando la privacidad del texto introducido es crítica.
- Generación de borradores de material docente: resúmenes de conceptos clínicos, preguntas de autoevaluación y explicaciones en lenguaje llano que un docente revisa antes de publicar.
- Prototipado rápido de productos de salud digital: al ser Apache 2.0 y ONNX, se puede integrar en demos y pruebas de concepto en móvil o escritorio sin depender de infraestructura GPU ni de una API externa.
- Extracción y normalización de terminología médica en inglés: dado su ajuste fino sobre corpus biomédicos, puede reformular o simplificar jerga clínica en textos de entrada, integrándose en un pipeline previo al análisis por parte de un profesional.
- Evaluación comparativa de cuantización: sirve como caso de estudio reproducible para medir el impacto de int4/int8 en un modelo médico de 4B, ya que la card publica métricas de divergencia frente al modelo original en FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye métricas de fidelidad de la cuantización medidas contra el modelo original en FP32 sobre 4.092 tokens de prosa de dominio público (Project Gutenberg), con ONNX Runtime 1.30.0 en CPU:

| Metrica | Valor |
|---|---|
| Divergencia KL media de las distribuciones del siguiente token | 0,077 |
| Coincidencia top-1 del siguiente token | 84,1 % |
| Cambio de perplejidad | +4,5 % |
| Peso de los tensores | 2,94 GiB |
| Bits por peso medidos | 6,28 |

El export FP32 desde el que se cuantizó coincide con el modelo original (coincidencia top-1 del 100 %), por lo que las diferencias anteriores corresponden íntegramente a la cuantización. No se han publicado métricas de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB con la cuantización int4/int8 de este repositorio (2,94 GiB de pesos); el consumo real depende del backend, la longitud de contexto y el tamaño del lote.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090). También está diseñado para CPU y para ejecución on-device.
- GPU recomendadas para servidor: no aplica de forma específica; con este formato el objetivo es CPU y dispositivos móviles. Para lotes grandes o baja latencia en servidor, A100 o H100 serían sobredimensionadas para un modelo de 4B en int4.
- Opciones de despliegue: ONNX Runtime 1.30 o superior (Python, `onnxruntime-android` en Android), Transformers.js 4.3.0 en navegador o Node, y el ecosistema `onnxruntime-genai` para generación. No se distribuyen pesos en formato GGUF, safetensors ni cuantizaciones para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles. La model card indica explícitamente que el modelo todavía no se ha medido en un dispositivo Android.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMed/MedPsy-4B-ONNX | 4,02 B | no disponible | ONNX int4/int8 (2,94 GiB) | apache-2.0 | HuggingFace, transformers.js y ONNX Runtime; 0 descargas, 0 likes en el momento de la consulta |
| qvac/MedPsy-4B (modelo base) | 4,02 B | no disponible | PyTorch BF16 (aproximadamente 8 GB) | apache-2.0 | HuggingFace; pesos originales sin cuantizar |
| Qwen3-4B (modelo padre) | 4,02 B (arquitectura idéntica) | no disponible en la información proporcionada | safetensors / GGUF según distribución | Apache 2.0 | Ampliamente distribuido; no es un modelo médico |

No se dispone de datos de rendimiento comparativo entre estas variantes, salvo las métricas de fidelidad de cuantización frente al modelo en FP32 recogidas en el apartado anterior. La comparación con otros modelos médicos de tamaño similar (BioMistral, Meditron, etc.) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye el consejo, diagnóstico o tratamiento profesional. Los autores originales lo destinan a investigación y educación.
- Riesgo de alucinación especialmente crítico por el dominio: los errores en contenido clínico pueden tener consecuencias graves; la propia card advierte de que las salidas pueden ser incorrectas y deben verificarse.
- La cuantización introduce degradación medible: divergencia KL media de 0,077, coincidencia top-1 del 84,1 % y un aumento de perplejidad del 4,5 % respecto al modelo original en FP32. No se usó calibración (round-to-nearest), lo que puede penalizar más en algunos dominios.
- Idioma limitado al inglés; no hay soporte multilingüe declarado.
- Longitud de contexto no especificada en la información disponible, lo que impide planificar aplicaciones con ventanas largas sin verificarlo antes.
- Sesgos: no se documentan análisis de sesgo, y el ajuste fino se hizo sobre datos generados a partir de conjuntos CC-BY-NC, cuya composición no se detalla.
- Licencia: los pesos se distribuyen bajo Apache 2.0, pero el modelo original se entrenó con datos derivados de conjuntos CC-BY-NC; conviene revisar las atribuciones incluidas en `ATTRIBUTIONS.md` antes de un uso comercial.
- Estado de validación bajo: 0 descargas y 0 likes, sin evaluación en dispositivo Android y con pruebas únicamente en macOS con ONNX Runtime 1.30.0 en CPU y Transformers.js 4.3.0.
- Dependencia de operadores `com.microsoft` y de ONNX Runtime 1.30 o superior; versiones anteriores no podrán cargar el grafo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenMed/MedPsy-4B-ONNX
- Modelo base original: https://huggingface.co/qvac/MedPsy-4B
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
