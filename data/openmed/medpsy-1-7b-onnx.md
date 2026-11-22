# OpenMed/MedPsy-1.7B-ONNX

## Resumen
MedPsy-1.7B-ONNX es una conversión a formato ONNX del modelo médico MedPsy-1.7B de QVAC, un ajuste fino sobre Qwen3-1.7B orientado a conversación clínica y biomédica. La conversión la publica OpenMed, un tercero no afiliado a los autores del modelo original, y está pensada para inferencia en dispositivo (Android, escritorio y navegador) mediante ONNX Runtime y Transformers.js. El modelo mantiene los 1.720 millones de parámetros del original, con arquitectura transformer densa tipo Qwen3 de 28 capas, tamaño oculto 2048 y atención con query agrupada.

La relevancia de esta ficha está en la cuantización: el cuerpo se ha comprimido a int4 asimétrico con GPTQ (grupo 32) y se han conservado en int8 las capas sensibles (proyecciones q/k/v fusionadas y down-projection) y la tabla de embeddings compartida entre entrada y salida. El resultado son 1,32 GiB de pesos con una media de 6,58 bits por peso, lo que permite ejecutar un modelo conversacional de dominio médico en hardware modesto sin renunciar por completo a la fidelidad respecto al original en BF16.

Es una revisión de 2026-09-25 que sustituye una primera build con cuantización round-to-nearest; según el autor, la divergencia media de siguiente token frente al modelo fuente se redujo entre un 50 % y un 65 % en tres textos de validación. La licencia declarada es Apache 2.0, heredada del modelo base, aunque el modelo original se entrenó con datos generados a partir de conjuntos CC-BY-NC, lo que introduce cautelas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (`Qwen3ForCausalLM`), atención con query agrupada (GQA) |
| Parametros totales | 1,72 B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 asimétrico GPTQ grupo 32 en el cuerpo; int8 grupo 32 en q/k/v fusionadas y down-projection; embeddings y cabeza de salida en int8 bloque 32 (media de 6,58 bits por peso) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx` + `onnx/model_q4.onnx_data`), compatible con ONNX Runtime y Transformers.js |

## Arquitectura y entrenamiento
El modelo subyacente es un ajuste fino médico de Qwen3-1.7B, un transformer decoder-only denso con 28 capas, tamaño oculto 2048, vocabulario de 151.936 tokens y embeddings de entrada/salida atados. Usa atención con query agrupada y el esquema estándar de Qwen3. Esta publicación no entrena el modelo: solo convierte y cuantiza los pesos del original `qvac/MedPsy-1.7B`.

La conversión se realizó con GPTQModel 7.5.0 para la cuantización y onnxruntime-genai 0.16.0 para construir el grafo. La calibración GPTQ usó 512 secuencias de 512 tokens de texto inglés genérico (wikitext-2-raw-v1, revisión `b08601e04326`), sin texto médico ni datos de evaluación. El grafo emplea operadores `com.microsoft` de ONNX Runtime (`MatMulNBits`, `GatherBlockQuantized`, `GroupQueryAttention`) y requiere ONNX Runtime 1.30 o superior. El tokenizador, la plantilla de chat y los valores por defecto de generación son los del modelo original, sin modificar.

## Capacidades
- Generación de texto conversacional en inglés, con especialización en temática médica y biomédica.
- Respuestas a preguntas de divulgación clínica en lenguaje llano (el ejemplo de la model card compara un ataque de pánico con un infarto).
- Razonamiento básico y explicación de conceptos, heredado de la base Qwen3-1.7B.
- Conversación multi-turno mediante plantilla de chat Jinja del modelo original.
- Inferencia en dispositivo: navegador y Node con Transformers.js 4.3.0, y Python/Android con ONNX Runtime 1.30 (ejecutor CPU).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso
- Asistente de divulgación sanitaria en navegador: integrado con Transformers.js, el modelo puede responder dudas médicas generales en una web estática sin enviar datos del usuario a un servidor, gracias a sus 1,32 GiB de pesos cuantizados.
- Aplicación Android de educación para pacientes: el grafo ONNX con operadores `com.microsoft` se ejecuta con `onnxruntime-android`, permitiendo explicaciones de términos clínicos en el propio dispositivo y sin conectividad.
- Prototipado rápido de chatbots clínicos: la licencia Apache 2.0 y el formato ONNX facilitan montar demos en Node o Python con ONNX Runtime antes de decidir una arquitectura de despliegue mayor.
- Filtro o generador de material educativo en entornos de simulación: útil para producir borradores de resúmenes de MedlinePlus o textos explicativos que luego revisa un profesional.
- Evaluación de cuantización en pipelines de investigación: sirve como caso de estudio reproducible de GPTQ int4 con capas sensibles en int8, con métricas de divergencia KL y acuerdo top-1 publicadas.
- Inferencia en portátiles sin GPU: al ejecutarse en CPU con ONNX Runtime, encaja en estaciones de trabajo modestas para tareas de generación de texto de baja concurrencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al modelo fuente en BF16/FP32, medidas con ONNX Runtime 1.30.0 en CPU sobre 4.092 tokens puntuados por texto:

| Texto | Divergencia KL media | Acuerdo top-1 | Cambio de perplejidad | KL antes de calibración |
|---|---|---|---|---|
| Prosa de dominio público (Project Gutenberg) | 0,049 | 87,8 % | +2,8 % | 0,140 |
| Prosa médica (resúmenes MedlinePlus) | 0,036 | 91,4 % | +1,3 % | 0,072 |
| Texto enciclopédico reservado (wikitext-2 test) | 0,044 | 89,3 % | +1,3 % | 0,118 |

## Requisitos de hardware
- VRAM/RAM: los pesos ocupan 1,32 GiB; en CPU la inferencia cabe holgadamente en 2-3 GiB de memoria del proceso, más el espacio del grafo y la caché KV.
- GPU: no se documenta despliegue en GPU para este paquete ONNX; el autor solo ha probado el ejecutor CPU de ONNX Runtime 1.30.0 en macOS.
- GPU de consumo: al no requerir GPU, puede ejecutarse en cualquier equipo de escritorio moderno; no hay datos de rendimiento en RTX 4090, A100 o H100 para esta build.
- Despliegue: ONNX Runtime (Python, Android con `onnxruntime-android`, escritorio) y Transformers.js 4.3.0 en navegador y Node. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. El autor indica explícitamente que aún no se ha medido en un dispositivo Android.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MedPsy-1.7B-ONNX (esta ficha) | 1,72 B | no disponible | ONNX int4/int8 | Apache 2.0 | Cuantización GPTQ para on-device; solo inglés; sin benchmarks estándar publicados |
| qvac/MedPsy-1.7B (fuente) | 1,72 B | no disponible | safetensors BF16 | Apache 2.0 | Modelo original sin cuantizar; referencia de fidelidad para esta conversión |
| Qwen3-1.7B (base) | 1,72 B | no disponible | safetensors, GGUF (comunidad) | Apache 2.0 | Modelo generalista multilingüe; sin especialización médica |
| Modelos médicos de ~1-3 B (familia general) | 1-3 B | no disponible | varios | variable | No se dispone de datos concretos en la información proporcionada para una comparación numérica |

## Limitaciones y advertencias
- No es un dispositivo médico ni sustituye el consejo, diagnóstico o tratamiento profesional; los resultados pueden ser erróneos y deben verificarse.
- Entrenado sobre datos generados a partir de conjuntos CC-BY-NC según el autor del modelo original, lo que puede condicionar el uso comercial pese a la licencia Apache 2.0 declarada.
- Solo soporta inglés; no hay evidencia de capacidades multilingües en la información disponible.
- La calibración GPTQ usó exclusivamente texto genérico en inglés, sin datos médicos ni de evaluación, por lo que la fidelidad en dominio clínico puede diferir de la reportada en wikitext-2.
- La cuantización introduce divergencia respecto al modelo fuente: acuerdo top-1 de entre el 87,8 % y el 91,4 % según el corpus, con incrementos de perplejidad de hasta el 2,8 %.
- Riesgo de alucinación inherente a modelos de 1,7 B; especialmente crítico en contexto médico.
- No se ha medido el rendimiento en Android ni en GPU; las cifras de latencia y throughput no están disponibles.
- La model card no documenta sesgos específicos ni evaluación de seguridad clínica.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/OpenMed/MedPsy-1.7B-ONNX
- Modelo base: https://huggingface.co/qvac/MedPsy-1.7B
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
