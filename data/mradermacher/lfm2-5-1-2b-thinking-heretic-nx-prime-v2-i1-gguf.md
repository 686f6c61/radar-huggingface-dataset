# mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2-i1-GGUF

## Resumen

LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2 es una variante fine-tune del modelo LFM2.5-1.2B-Thinking desarrollado por Liquid AI, pensado para razonamiento y despliegue en dispositivos de borde (edge AI). El modelo base pertenece a la familia LFM2.5, una arquitectura optimizada por Liquid para inferencia en dispositivos con recursos limitados, y esta version concreta es un fine-tune del usuario 0xzknw que recibe el nombre "Heretic-NX-Prime-v2". La ficha describe la cuantizacion GGUF publicada por mradermacher, que aplica cuantizacion imatrix sobre el modelo base para permitir su ejecucion en hardware de consumo.

El modelo esta orientado a razonamiento matematico, logica y resolucion de problemas multi-paso, con entrenamiento especifico en chain-of-thought reasoning. Su relevancia actual radica en que cabe en menos de 1 GB de memoria, lo que permite ejecutar razonamiento de calidad en telefonos y dispositivos edge sin conexion a la nube. La version GGUF presentada aqui es la variante imatrix (i1), que usa matrices de importancia para mejorar la calidad de la cuantizacion frente a los quants estaticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (arquitectura propietaria de Liquid AI optimizada para edge; basada en transformers) |
| Parametros totales | 1.2 mil millones (segun nombre del modelo; el repo muestra "286.812" como dato real de safetensors, valor inconsistente con la denominacion 1.2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (todos en formato GGUF) |
| Idiomas soportados | Solo ingles (etiqueta "en") |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizacion con imatrix) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking pertenece a la familia LFM2.5 de Liquid AI, una arquitectura diseñada especificamente para despliegue en dispositivos de borde con presupuesto de memoria y computo limitados. Segun Liquid, la arquitectura LFM2 incorpora innovaciones para lograr la inferencia mas rapida y la mejor calidad por parametro de su categoria, aunque no se detallan los mecanismos internos exactos en la informacion disponible (si usa attention lineal, SSM o componentes hibridos no se especifica).

El entrenamiento del modelo base se centro en razonamiento: se especializo en chain-of-thought (CoT), matematicas, logica y resolucion de problemas multi-paso. El fine-tune "Heretic-NX-Prime-v2" de 0xzknw es una capa adicional sobre ese modelo base, pero no se dispone de informacion publica sobre los datos de entrenamiento, el metodo de alineacion (RLHF, DPO, etc.) ni el numero de tokens usados en ese fine-tune. La version GGUF de mradermacher es una cuantizacion con imatrix (weighted/imatrix quants) del checkpoint original, sin cambios en los pesos del modelo mas alla de la reduccion de precision.

## Capacidades

- Razonamiento matematico: optimizado para resolver problemas de aritmetica, algebra y matematicas avanzadas mediante cadenas de razonamiento explicito.
- Razonamiento logico: capacidad de deduccion y resolucion de problemas de logica formal y de sentido comun.
- Multi-step reasoning: entrenado para descomponer problemas complejos en pasos intermedios y mantener coherencia a lo largo de la cadena de razonamiento.
- Generacion de texto generica: aunque su foco es el razonamiento, puede generar texto coherente en ingles.
- Despliegue en dispositivos de borde: disenado para ejecutarse en memoria inferior a 900 MB en un telefono, con inferencia rapida y sin conexion.
- Tool calling / function calling: no se menciona soporte especifico en la informacion disponible.
- Capacidades multilingues: solo ingles; no se reporta soporte para otros idiomas.
- Thinking mode: el modelo base incluye un modo de razonamiento (thinking) que genera cadenas de CoT antes de responder; no se confirma si el fine-tune "Heretic" lo conserva intacto.

## Casos de uso

- Asistente de razonamiento en dispositivos moviles: se puede integrar en apps iOS/Android para resolver problemas de matematicas o logica sin conexion, gracias a su huella de <900 MB y su inferencia rapida.
- Educacion y tutorizacion: como tutor interactivo en apps educativas, explicando pasos intermedios de resolucion de problemas matematicos a estudiantes, aprovechando su entrenamiento CoT.
- Automatizacion de analisis de datos simple: en entornos de edge computing (Raspberry Pi, Jetson Nano, etc.) para clasificar y razonar sobre datos tabulares o textos cortos sin depender de la nube.
- Agentes de IA en el borde: integrado en frameworks de agentes (p.ej. con vLLM o llama.cpp) para tareas de razonamiento multi-paso en entornos con recursos limitados, como robots o dispositivos IoT.
- Prototipado de aplicaciones de IA: gracias a su tamano reducido y formato GGUF, permite probar conceptos de aplicaciones de razonamiento en hardware de consumo (GPU de gama media) antes de escalar a modelos mayores.
- Generacion de codigo simple: aunque no esta especificamente entrenado para codigo, su capacidad de razonamiento logico puede usarse para tareas basicas de programacion con prompts adecuados (sin garantias de calidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de la documentacion de Liquid AI indican que el modelo base LFM2.5-1.2B-Thinking ofrece "la mejor calidad de su categoria" y "la inferencia mas rapida" para su tamano, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks en los materiales revisados. Tampoco se publican resultados especificos de la variante "Heretic-NX-Prime-v2" ni de sus cuantizaciones GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: segun Liquid AI, el modelo base cabe en aproximadamente 900 MB de memoria en un telefono, por lo que una cuantizacion Q4_K_S o similar deberia ocupar menos de 1 GB en RAM/VRAM. Las cuantizaciones mas agresivas (Q2_K, IQ1_M) pueden reducir el consumo a unos pocos cientos de MB.
- GPU recomendadas: al ser un modelo de 1.2B, puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM (RTX 3060, GTX 1660, etc.) en cuantizacion Q4/Q5. En cuantizaciones mas ligeras, incluso en CPU sola.
- Compatibilidad con consumer GPU: si, es compatible con la mayoria de GPUs de consumo (RTX 3060, RTX 4070, etc.) e incluso con hardware de gama baja.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, llamafile, vLLM (con soporte GGUF), LM Studio, y cualquier framework compatible con GGUF. Tambien puede cargarse en transformers si se convierte a safetensors.
- Latencia y throughput: no hay datos publicados para esta variante concreta, pero Liquid AI reporta que el modelo base es el mas rapido de su tamano; en un telefono moderno la latencia por token deberia estar en el rango de milisegundos a decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (Liquid) | 1.2B | no disponible | Optimizado (CoT) | no disponible | safetensors |
| LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2 (GGUF) | 1.2B | no disponible | Optimizado (CoT) | no disponible | GGUF |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1.5B | 32K | Razonamiento basico | Apache 2.0 | safetensors, GGUF |
| Gemma-2-2B (Google) | 2B | 8K | Razonamiento basico | Gemma License (uso comercial permitido) | safetensors, GGUF |

Nota: la comparativa se basa en modelos de tamano similar disponibles en el ecosistema open source. No se dispone de datos de benchmarks para comparar rendimiento real entre ellos.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles (segun la etiqueta de idioma "en"), lo que limita su uso en entornos multilingues.
- Licencia: la licencia no esta disponible en la informacion del repo. Antes de usar en produccion comercial, se debe verificar la licencia del modelo base (Liquid AI) y la del fine-tune (0xzknw). Liquid AI suele publicar bajo licencias de uso libre pero con restricciones para ciertos usos; hay que consultar el repositorio del modelo base.
- Alucinaciones: como cualquier modelo de tamano reducido (1.2B), puede producir respuestas incorrectas o inventadas, especialmente en razonamiento complejo. Se recomienda validar las salidas en aplicaciones criticas.
- Contexto: no se ha confirmado la longitud de contexto; modelos de este tamano suelen tener ventanas de contexto limitadas (tipicamente 4K-8K), lo que puede afectar a tareas de razonamiento con muchas entradas.
- Dependencia del fine-tune: la variante "Heretic-NX-Prime-v2" es un fine-tune no documentado; no se conocen los datos de entrenamiento ni el impacto en la calidad de razonamiento respecto al modelo base de Liquid.
- Cuantizacion: las cuantizaciones mas agresivas (Q2, IQ1) pueden degradar significativamente la calidad de razonamiento, especialmente en tareas matematicas complejas. Se recomienda usar Q4_K_S o superior para produccion.
- Repo incompleto: el repo de mradermacher solo contiene el archivo imatrix (0.09 GB) y los quants estaticos estan en una URL separada; el tamano del repo es 0.0 GB, lo que puede confundir al descargar.

## Enlaces

- Repo HuggingFace (cuantizacion GGUF): https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2-i1-GGUF
- Repo HuggingFace (quants estaticos): https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2-GGUF
- Modelo base (fine-tune): https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Prime-v2
- Documentacion de Liquid AI sobre LFM2.5-1.2B-Thinking: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Blog de Liquid AI sobre el modelo: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Blog de Liquid AI sobre la familia LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- FAQ y solicitudes de mradermacher: https://huggingface.co/mradermacher/model_requests
