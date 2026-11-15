# Maximilian228/Geode-LFM3-1.7B

## Resumen

Geode-LFM3-1.7B es un paquete de pesos cuantizados del modelo LFM3-1.7B de Liquid AI, publicado por el autor independiente Maximilian228 para su uso dentro de Geode, una aplicacion Android que ejecuta modelos de lenguaje de forma completamente local en el telefono, sin nube ni cuenta de usuario. No se trata de un modelo nuevo: es una conversion y recuantizacion del checkpoint BF16 original de Liquid AI a un formato propietario propio del motor de Geode.

El modelo base, LFM3-1.7B, es un transformer hibrido de 1.700 millones de parametros que combina capas de convolucion corta con capas de atencion (13 convoluciones y 11 atenciones), e incorpora modo de razonamiento (thinking) y llamadas a herramientas. Geode lo ejecuta con su propio motor, que aprovecha la NPU Hexagon de los SoC Qualcomm Snapdragon para acelerar la lectura del prompt.

La relevancia de este paquete es practica: demuestra inferencia de un modelo de 1,7B parametros en un telefono Android de 64 bits con 4 GB de RAM, con un unico pack de 1,26 GB en disco (unos 1,1 GB en memoria). El pack no es GGUF ni compatible con otros runtimes; solo funciona dentro de la aplicacion Geode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 13 capas de convolucion corta + 11 capas de atencion (modelo base LFM3-1.7B) |
| Parametros totales | 1,7 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ 4 bits en todas las matrices lineales (incluida la cabeza de salida), embedding de tokens a 8 bits, normas, kernels de convolucion y puertas de atencion en FP32 exacto |
| Idiomas soportados | No disponible de forma oficial; el autor indica que el modelo piensa en ingles y responde mejor en ingles, y que responde en otros idiomas con menor calidad |
| Licencia | LFM Open License v1.0 (lfm1.0), licencia "other" en Hugging Face |
| Formato de pesos | Formato propio de Geode: `dense.bin`, `embed.bin`, `tokenizer.bin`, `geode.json`, `LICENSE`. No es GGUF |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura hibrida que intercala 13 capas de convolucion corta con 11 capas de atencion, un diseno orientado a reducir el coste computacional y de memoria frente a un transformer de atencion completa. Incluye capacidades de razonamiento explicito (thinking) y de llamada a herramientas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

El trabajo de este repositorio es exclusivamente de cuantizacion y conversion. Los pesos se recuantizaron desde el checkpoint BF16 original: cada matriz lineal se paso a 4 bits con GPTQ usando una escala por cada 16 valores, calibrada sobre aproximadamente 200.000 tokens de texto de chat, llamadas a herramientas, codigo y contenido multilingue. El embedding de tokens se mantuvo a 8 bits y los elementos sensibles a la precision (normas, kernels de convolucion y puertas de salida de atencion) se conservaron en FP32. El resultado se empaqueto en el formato binario de Geode, con un `geode.json` que describe configuracion, tamanos y hashes SHA-256 de cada fichero.

## Capacidades

- Generacion de texto conversacional en el dispositivo, sin conexion a red.
- Razonamiento explicito mediante modo thinking (heredado del modelo base).
- Llamadas a herramientas y funciones (tool calling), segun la model card del modelo base.
- Ejecucion acelerada en NPU: las capas completas, incluidas atencion y convoluciones, se ejecutan en las unidades matriciales de Hexagon.
- Procesamiento de prompts largos con lectura rapida en NPU (del orden de 2.150-2.210 tokens/s en Snapdragon 8 Elite).
- Capacidad multilingue limitada: responde en otros idiomas, pero con menor calidad que en ingles; una linea de sistema indicando el idioma mejora el resultado.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Asistente personal offline en Android: el pack se integra en la app Geode y permite conversaciones multi-turno sin enviar datos a ningun servidor, adecuado para usuarios preocupados por la privacidad.
- Procesamiento de texto confidencial en el telefono: redaccion, resumen o reescritura de documentos sensibles sin salir del dispositivo, gracias a que los pesos residen en memoria local (unos 1,1 GB).
- Automatizacion con tool calling en movilidad: el modelo base soporta llamadas a herramientas, lo que permite construir flujos que consulten APIs locales o datos del telefono desde la propia aplicacion.
- Prototipado de agentes en dispositivos de gama alta: con lectura de prompt a mas de 2.000 tokens/s en NPU, es viable iterar sobre prompts largos y cadenas de razonamiento en un Snapdragon 8 Elite.
- Demostraciones y evaluacion de modelos pequenos en ferias o entornos sin conectividad: al no requerir red ni cuenta, el pack sirve para mostrar inferencia LLM completamente local.
- Base para experimentos de cuantizacion en el borde: el pack documenta el esquema GPTQ aplicado (4 bits con escala por 16 valores, embedding a 8 bits, capas sensibles en FP32), util como referencia para quien investigue despliegue en movil.
- Uso educativo: permite a desarrolladores estudiar el comportamiento de un modelo hibrido convolucion-atencion en hardware movil real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la cuantizacion y de velocidad en hardware concreto:

| Metrica | Valor | Contexto |
|---|---|---|
| Divergencia KL vs BF16 | 0,037 | Sobre las respuestas del propio modelo |
| Coincidencia top-1 vs BF16 | 93,1% | Sobre las respuestas del propio modelo |
| Lectura de prompt | ~2.150-2.210 tokens/s | Snapdragon 8 Elite (RedMagic 10 Pro), en NPU |
| Tiempo hasta el primer token | ~0,9 s | Mismo dispositivo, prompt de 1.968 tokens |
| Generacion | ~29-32 tokens/s | Mismo dispositivo, en CPU |
| Lectura de prompt sin NPU | ~100 tokens/s | Mismo dispositivo, en CPU |

## Requisitos de hardware

- RAM: minimo 4 GB en el telefono; el pack ocupa unos 1,1 GB en memoria.
- Almacenamiento: 1,26 GB (1,17 GiB) libres para el pack Q4.
- Procesador: Android 11 o superior, ARM de 64 bits con instrucciones de producto escalar (ARMv8.2).
- Aceleracion: NPU Hexagon de Qualcomm Snapdragon para la lectura de prompt; sin NPU la lectura cae a unos 100 tokens/s.
- Despliegue: exclusivamente mediante la aplicacion Geode (beta en Google Play). El pack no carga en vLLM, llama.cpp, Ollama, TGI ni otros runtimes, al no ser GGUF.
- GPU de escritorio: no aplica; el pack esta disenado para inferencia en movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Geode-LFM3-1.7B (este) | 1,7B | No disponible | Formato Geode, solo app Android | LFM Open License v1.0 | Cuantizado a 4 bits GPTQ; optimizado para NPU Snapdragon |
| LiquidAI/LFM3-1.7B | 1,7B | No disponible | Safetensors (BF16) | LFM Open License v1.0 | Modelo base original; requiere runtime estandar |
| Otros modelos pequenos para movil (p. ej. variantes GGUF de ~1-2B) | ~1-2B | Variable | GGUF, compatible con llama.cpp/Ollama | Variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo verificados frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El pack solo funciona dentro de la aplicacion Geode; no es portable a otros motores de inferencia.
- Calidad multilingue debil: el modelo base piensa en ingles y responde peor en otros idiomas; conviene indicar el idioma en el prompt de sistema.
- Riesgo de alucinacion inherente a un modelo de 1,7B parametros; el propio autor advierte de que las respuestas pueden ser erroneas.
- La cuantizacion introduce perdida: 0,037 de divergencia KL y 93,1% de coincidencia top-1 respecto a BF16, lo que implica degradacion medible frente al modelo original.
- Requiere hardware relativamente reciente: Android 11+, ARMv8.2 y 4 GB de RAM como minimo; el rendimiento optimo depende de NPU Snapdragon.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Repositorio sin descargas ni likes en el momento de la consulta, publicado por un autor independiente; no hay garantia de mantenimiento ni soporte.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Maximilian228/Geode-LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Aplicacion Geode: https://geode.tifu.xyz
- Liquid AI: https://www.liquid.ai
