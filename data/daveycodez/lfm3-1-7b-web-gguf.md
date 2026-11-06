# daveycodez/LFM3-1.7B-Web-GGUF

## Resumen

LFM3-1.7B-Web-GGUF es una compilacion no oficial en formato GGUF del modelo LFM3-1.7B de Liquid AI, publicada por el usuario daveycodez. Se trata de una version optimizada para su ejecucion en el navegador mediante wllama (llama.cpp compilado a WebAssembly), pensada especificamente para telefonos y dispositivos sin soporte de WebGPU que ejecutan la inferencia en CPU. El modelo base pertenece a la familia LFM3 de Liquid AI, con 1.567.320.896 parametros totales.

La modificacion principal respecto al GGUF original de Liquid AI consiste en una reduccion drastica del vocabulario, de 128.000 a 49.012 tokens BPE (mas 140 tokens especiales, con 49.152 filas de embedding), y una recuantizacion a Q4_K con matriz de importancia, dejando el embedding y la cabeza LM atados en Q6_K. El resultado es un archivo de 911.948.864 bytes (unos 188 MB menos que el Q4_K_M original), lo que reduce el tiempo de carga y el consumo de memoria en entornos web.

Es relevante ahora porque permite desplegar un modelo conversacional con soporte de tool calling y modo de razonamiento (thinking) directamente en el navegador, sin infraestructura de servidor, aunque con limitaciones notables en idiomas distintos del ingles debido al vocabulario reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; familia Liquid Foundation Models) |
| Parametros totales | 1.567.320.896 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K para el 90.7% del archivo y Q6_K para embedding/cabeza LM (9.1%); cuantizado con importance matrix |
| Idiomas soportados | no disponible (la model card advierte de un rendimiento muy degradado fuera del ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de dolares |
| Formato de pesos | GGUF (compatible con llama.cpp y wllama) |
| Tamano del archivo | 911.948.864 bytes (aprox. 0.9 GB) |
| Vocabulario | 49.012 tokens BPE + 140 tokens especiales (49.152 filas de embedding) |
| Modelo base | LiquidAI/LFM3-1.7B y LiquidAI/LFM3-1.7B-GGUF |
| Fecha de publicacion | 2026-10-31 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LFM3-1.7B en la informacion proporcionada; la model card de esta compilacion no describe la arquitectura mas alla de identificarlo como parte de la familia LFM3 de Liquid AI. Tampoco se detallan los datos de entrenamiento originales (numero de tokens, composicion del dataset ni si hubo RLHF o DPO).

La innovacion tecnica de esta build concreta es doble. En primer lugar, la reduccion del vocabulario de 128.000 a 49.012 tokens BPE, conservando todos los tokens de byte y los tokens especiales (chat, tool-call y thinking) y manteniendo la consistencia de las merges, de modo que cualquier texto sigue tokenizandose y decodificandose de forma exacta. En segundo lugar, la recuantizacion desde el GGUF en BF16 a Q4_K con una matriz de importancia generada a partir de unos 36.000 tokens de texto de entrenamiento de WikiText-2 y de respuestas de chat generadas por el modelo BF16, cubriendo tambien la capa de salida. La plantilla de chat y los ajustes de muestreo del archivo no se han modificado respecto al original.

Como consecuencia del vocabulario reducido, las palabras menos frecuentes se fragmentan en mas tokens y los textos no ingleses requieren muchos mas tokens: aproximadamente 1.75x en aleman, 1.6x en espanol, 2.5x en japones, 3x en chino, 2.8x en ruso y 4.2x en arabe. En ingles el incremento es de solo el 1-2%.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el archivo.
- Modo de razonamiento (thinking) activable mediante el parametro `enable_thinking` de la plantilla de chat.
- Soporte de tool calling: segun la model card, el modelo responde con llamada directa a herramienta en 20 de 20 prompts de prueba, tanto en BF16 como en esta build.
- Tokens especiales dedicados para chat, tool-call y thinking, conservados integramente en el vocabulario reducido.
- Ejecucion en navegador en CPU mediante wllama (llama.cpp en WebAssembly), orientada a dispositivos sin WebGPU.
- Compatibilidad con llama.cpp nativo (requiere commit `19cce69` o posterior) ademas del entorno web.
- Capacidades multilingues: no documentadas; la propia model card recomienda usar el modelo original para uso no ingles por la ineficiencia del vocabulario reducido.

## Casos de uso

- Chat en el navegador sin servidor: el modelo se carga con wllama en el cliente y permite conversaciones multi-turno directamente en la pagina, sin enviar datos a una API externa, lo que resulta adecuado para aplicaciones de privacidad o entornos sin backend.
- Demos y prototipos de asistentes conversacionales: con un archivo de menos de 1 GB y una carga aproximadamente un 27% mas rapida que el Q4_K_M original en Chromium headless, sirve para validar flujos de chat y de razonamiento antes de invertir en infraestructura.
- Agentes ligeros con tool calling en cliente: el modelo mantiene el soporte de llamada a herramientas (20/20 en las pruebas de la model card), por lo que puede integrarse en aplicaciones web que necesiten invocar funciones locales del navegador o APIs sencillas.
- Aplicaciones offline o de campo en telefonos: al ejecutarse en CPU mediante WebAssembly, funciona en dispositivos sin WebGPU, util para escenarios con conectividad limitada.
- Educacion y experimentacion con modelos locales: permite a desarrolladores e investigadores probar un modelo de 1.7B en el navegador sin GPU ni instalacion de dependencias nativas.
- Procesamiento de texto en ingles con requisitos de baja latencia de carga: para prompts en ingles el coste de tokenizacion apenas aumenta un 1-2%, por lo que tareas de generacion breve en ingles son viables en el navegador.

## Benchmarks y rendimiento

La model card proporciona metricas de perplejidad y de calidad de cuantizacion, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se reproducen a continuacion los datos publicados:

| Metrica | Q4_K_M original | Esta build | Referencia BF16 |
|---|---|---|---|
| Tamano del archivo | 1.099.627.808 bytes | 911.948.864 bytes | no disponible |
| Perplejidad WikiText-2 test (por token original) | 20.36 | 20.15 | 19.79 |
| Perplejidad en respuestas del modelo BF16 con vocabulario reducido | 2.773 | 2.770 | 2.639 |
| Perplejidad en respuestas del modelo BF16 original | 2.746 | 3.260 | 2.615 |
| Prompts resueltos con llamada directa a herramienta | 20/20 | 20/20 | 20/20 |

En velocidad, con wllama a 4 hilos en Chromium headless sobre un Mac, esta build carga aproximadamente un 27% mas rapido y escribe aproximadamente un 6% mas rapido que el Q4_K_M original; la lectura de prompt es equivalente. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: al ser un GGUF Q4_K de aproximadamente 0.9 GB, cabe holgadamente en memoria de dispositivos con 1-2 GB libres; en navegador se ejecuta en CPU mediante WebAssembly, sin requerir GPU.
- GPU recomendadas: no aplica para el caso de uso principal (CPU en navegador); en llama.cpp nativo puede ejecutarse en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se especifican modelos concretos.
- GPU de consumo: si, cabe en cualquier GPU de consumo moderna e incluso en telefonos, que es el objetivo declarado del autor.
- Opciones de despliegue: wllama (llama.cpp en WebAssembly) en navegador, llama.cpp nativo (commit `19cce69` o posterior). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: solo se publican comparativas relativas (carga ~27% mas rapida y escritura ~6% mas rapida que el Q4_K_M original con wllama a 4 hilos en Chromium headless sobre Mac); no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| daveycodez/LFM3-1.7B-Web-GGUF (esta build) | 1.567.320.896 | no disponible | GGUF Q4_K/Q6_K | LFM Open License v1.0 | Vocabulario reducido a 49.012 tokens; optimizado para navegador en CPU |
| LiquidAI/LFM3-1.7B-GGUF (Q4_K_M original) | 1.567.320.896 | no disponible | GGUF Q4_K_M | LFM Open License v1.0 | Vocabulario completo de 128.000 tokens; archivo ~188 MB mayor; mejor para uso no ingles |
| daveycodez/LFM3-1.7B-Web-ONNX | 1.567.320.896 (mismo base) | no disponible | ONNX | LFM Open License v1.0 | Mismo vocabulario reducido; contraparte ONNX de esta build |

No se dispone de datos de benchmarks estandar ni de contexto para comparar con modelos de otras familias de tamano similar.

## Limitaciones y advertencias

- Vocabulario reducido: fuera del ingles el consumo de tokens crece de forma acusada (1.6x en espanol, hasta 4.2x en arabe), lo que ralentiza la lectura de prompts y la escritura de respuestas; el propio autor recomienda el modelo original para uso no ingles.
- Perplejidad degradada en respuestas generadas por el modelo original (3.260 frente a 2.746 del Q4_K_M original), especialmente en palabras que el vocabulario reducido fragmenta y que el modelo no vio fragmentadas durante el entrenamiento.
- Es una build no oficial de la comunidad: no ha sido revisada ni respaldada por Liquid AI, lo que implica menor garantia de calidad y soporte.
- Licencia restrictiva: la LFM Open License v1.0 solo autoriza uso comercial a entidades con ingresos anuales inferiores a 10 millones de dolares; es necesario revisar el archivo LICENSE antes de cualquier despliegue comercial.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo de 1.7B, es propenso a errores factuales, especialmente en tareas de conocimiento.
- Sesgos: no documentados en la informacion proporcionada.
- Longitud de contexto: no disponible; conviene verificarla en la configuracion del modelo base antes de disenar flujos con contexto largo.
- Requiere una version de llama.cpp con soporte de LFM3 (commit `19cce69` o posterior); versiones anteriores pueden no cargar el archivo correctamente.
- El rendimiento en navegador depende de la CPU del dispositivo y del numero de hilos de wllama; los datos de velocidad publicados corresponden a un unico entorno de prueba (Chromium headless en Mac a 4 hilos).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daveycodez/LFM3-1.7B-Web-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Contraparte ONNX del mismo autor: https://huggingface.co/daveycodez/LFM3-1.7B-Web-ONNX
- Liquid AI: https://www.liquid.ai/
- wllama (llama.cpp en WebAssembly): https://github.com/ngxson/wllama
