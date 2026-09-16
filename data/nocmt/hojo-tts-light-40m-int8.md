# nocmt/Hojo-TTS-Light-40M-INT8

## Resumen

Hojo-TTS-Light-40M-INT8 es un derivado de precisión del modelo HojoAI/Hojo-TTS-Light-40M, publicado por el usuario nocmt. No es un modelo completo, sino un único grafo ONNX (`Hojo-TTS-Light-40M-llm.onnx`) que contiene el decodificador LM autorregresivo del sistema TTS, cuantizado dinámicamente a INT8. El repositorio se limita intencionadamente a ese fichero: el resto de componentes (decodificador, `fine_local`, banco de voces, tokenizador y configuración) se siguen resolviendo desde la instantánea del modelo base en el momento de la instalación.

La relevancia de esta ficha es práctica: el LM se ejecuta una vez por cada token de audio generado, lo que supone entre 150 y 190 ejecuciones de sesión para una frase de 35 caracteres, y por tanto domina el tiempo total de síntesis. La cuantización INT8 reduce el grafo de 125,8 MB en FP32 a 32,4 MB y baja el coste de un paso de decodificación de 21,2 ms a 8,9 ms con 4 hilos en un i5-12600KF, lo que lleva el factor de tiempo real de 1,20-1,32 a 0,57-0,67: de más lento que el tiempo real a más rápido que el tiempo real.

Se trata, en resumen, de una optimización de despliegue para TTS en CPU, con arquitectura inalterada y licencia Apache-2.0 heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (etiqueta `qwen3`) que actúa como decodificador LM de un sistema TTS; distribuido como grafo ONNX |
| Parámetros totales | ~40 M (según el nombre del modelo base; el repositorio solo publica el grafo LM) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámico de solo pesos (QInt8, `per_channel=True`, `reduce_range=False`) aplicado a operadores MatMul y Gemm |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | ONNX (fichero único `Hojo-TTS-Light-40M-llm.onnx`) |
| Tamaño del grafo LM | 32.358.615 bytes (32,4 MB) frente a 63.138.277 bytes en BF16 y 125.813.561 bytes tras la promoción a FP32 |
| SHA-256 | `e43fc9b10ccfecc7044eded41bed88c1e5f81fdd3e955a200e340246eeb0ee2c` |
| Modelo base | HojoAI/Hojo-TTS-Light-40M, revisión `c3cf21c77dc04b220aa4dabe20fc59e66a2a5485` |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no incluye entrenamiento ni ajuste alguno: es un derivado exclusivamente de precisión sobre los pesos upstream, con la arquitectura sin cambios. La conversión se realizó con `onnxruntime.quantization.quantize_dynamic`, con `weight_type=QuantType.QInt8`, `per_channel=True` y `reduce_range=False`, limitando los tipos de operador cuantizados a MatMul y Gemm. Al tratarse de cuantización dinámica de solo pesos, las activaciones no se cuantizan de forma estática y no se requiere calibración con un conjunto de datos.

Un detalle relevante del diseño es que solo se cuantiza el LM decodificador autorregresivo. Los grafos del vocoder (`decoder` y `fine_local`) se dejan deliberadamente en su precisión original, con el argumento de que la cuantización dinámica de solo pesos aporta poco en sus convoluciones y de que ahí es donde se originarían artefactos audibles. En el proceso de instalación del modelo base, el fichero BF16 se promueve a FP32; al sustituirlo por esta versión INT8, la promoción no encuentra tensores BF16 y deja los numéricos intactos, con salidas de paso idénticas bit a bit según el autor. La etiqueta `qwen3` del repositorio indica la familia arquitectónica del decodificador, pero no se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de tokens de audio de forma autorregresiva: el grafo produce un token por ejecución de sesión, con un consumo aproximado de 150 a 190 ejecuciones para una frase de 35 caracteres.
- Integración en una cadena TTS completa: el texto se convierte en audio final solo cuando este grafo se combina con el decodificador, el vocoder `fine_local`, el banco de voces, el tokenizador y la configuración del modelo base.
- Ejecución en CPU con cuantización INT8: el grafo está pensado para inferencia en procesadores convencionales, sin requisito de GPU.
- Sustitución directa del grafo LM en el pipeline de instalación: se resuelve como un fichero independiente dentro de la instantánea, de modo que el resto de componentes siguen viniendo del repositorio upstream.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- No se documentan capacidades multilingües; la información de idiomas no está disponible.
- No es un modelo de lenguaje de propósito general: no genera texto ni responde a instrucciones, solo tokens acústicos dentro de su pipeline.

## Casos de uso

- Lectura en voz alta en tiempo real: el factor de tiempo real de 0,57-0,67 permite que una cola de lectura (lector de artículos, noticias o documentación) mantenga el ritmo del habla sin acumular retraso, algo imposible con el modelo en FP32 (RTF 1,20-1,32).
- Síntesis de voz en servidores sin GPU: al ejecutarse en CPU con 32,4 MB de grafo, se puede desplegar en instancias de bajo coste o en contenedores sin acelerador, reduciendo el coste por hora frente a alternativas que exigen GPU.
- Accesibilidad y lectores de pantalla: la mejora de latencia por paso (de 21,2 ms a 8,9 ms con 4 hilos) reduce el tiempo hasta el primer audio percibido y hace viable la lectura continua de textos largos para usuarios con discapacidad visual.
- Audiolibros y pódcast generados por lotes: el menor coste por token de audio abarata la generación de horas de narración, con la ventaja de que el vocoder se mantiene en precisión original para evitar artefactos audibles.
- Sistemas de aviso y notificación por voz: asistentes domésticos, avisos de domótica o mensajes de estado industrial que deben sintetizar frases cortas con latencia mínima en hardware embebido.
- Atención telefónica automatizada (IVR): la generación más rápida que el tiempo real permite respuestas habladas fluídas en menús y confirmaciones, siempre que el resto del pipeline se instale desde el modelo base.
- Narración en videojuegos y aplicaciones de escritorio: el grafo de 32,4 MB se puede distribuir junto al ejecutable y ejecutarse en el equipo del usuario sin depender de servicios en la nube.
- Sustitución de precisión en un despliegue existente de Hojo-TTS-Light-40M: si ya se usa el modelo base, este repositorio solo cambia el fichero `Hojo-TTS-Light-40M-llm.onnx` sin tocar el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de latencia y tamaño, obtenidos en un i5-12600KF (16 núcleos lógicos, 6P+4E):

| Configuración | 4 hilos | 8 hilos | Tamaño del grafo |
|---|---|---|---|
| FP32 | 21,2 ms por paso | 22,7 ms por paso | 125,8 MB |
| INT8 | 8,9 ms por paso | 7,3 ms por paso | 32,4 MB |

| Métrica | FP32 | INT8 |
|---|---|---|
| Factor de tiempo real (frases de 35 caracteres) | 1,20-1,32 | 0,57-0,67 |
| Número de ejecuciones de sesión por frase | 150-190 | 150-190 |

Un dato operativo destacable es que la cuantización desplaza el número óptimo de hilos: con INT8 rinden mejor 8 hilos que 4, mientras que con FP32 ocurre lo contrario.

## Requisitos de hardware

- VRAM: no aplica en el caso base, ya que el grafo está diseñado para inferencia en CPU; el fichero ocupa 32,4 MB y el consumo de memoria es mínimo. No se dispone de cifras medidas de memoria pico.
- GPU: no se documenta ninguna GPU recomendada ni se aportan medidas en acelerador. El escenario medido es una CPU de escritorio (i5-12600KF).
- GPU de consumo: al tratarse de un grafo ONNX de 32,4 MB, es compatible en principio con cualquier GPU de consumo, pero no hay datos publicados de rendimiento en ellas.
- CPU: viable en procesadores de escritorio y presumiblemente en hardware embebido, dado el tamaño; los únicos datos disponibles corresponden al i5-12600KF citado.
- Configuración de hilos: usar 8 hilos con INT8 y 4 hilos con FP32, según las mediciones del autor.
- Despliegue: `onnxruntime` (con `onnxruntime.quantization` para reproducir la conversión). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un grafo ONNX de decodificador TTS.
- Latencia y throughput: 7,3-8,9 ms por paso de decodificación en INT8 y 150-190 pasos por frase de 35 caracteres, lo que da un RTF de 0,57-0,67.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño del grafo LM | RTF (frases de 35 caracteres) | Licencia |
|---|---|---|---|---|---|
| nocmt/Hojo-TTS-Light-40M-INT8 | ~40 M | ONNX INT8 | 32,4 MB | 0,57-0,67 | Apache-2.0 |
| HojoAI/Hojo-TTS-Light-40M (upstream, FP32) | ~40 M | ONNX FP32 | 125,8 MB | 1,20-1,32 | Apache-2.0 |
| HojoAI/Hojo-TTS-Light-40M (upstream, BF16) | ~40 M | ONNX BF16 | 63,1 MB | no disponible | Apache-2.0 |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada, por lo que la comparación se limita al modelo base del que deriva este repositorio.

## Limitaciones y advertencias

- El repositorio no es un modelo autónomo: contiene únicamente el grafo LM cuantizado y requiere el resto de componentes del modelo base para funcionar.
- Dependencia de una revisión concreta del upstream (`c3cf21c77dc04b220aa4dabe20fc59e66a2a5485`); si el modelo base cambia, puede producirse un desajuste entre el grafo LM y el resto del pipeline.
- Solo se cuantiza el LM. Los grafos del vocoder (`decoder` y `fine_local`) se mantienen en precisión original, de modo que el ahorro de memoria y latencia se concentra en el decodificador.
- No hay resultados de calidad publicados (MOS, similitud de hablante, inteligibilidad ni comparaciones con el modelo en FP32 o BF16). La afirmación de salidas idénticas bit a bit se refiere al paso de promoción a FP32, no a la calidad del audio resultante.
- No se documentan idiomas soportados, sesgos, comportamiento ante entradas fuera de dominio ni riesgo de alucinación acústica.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente de las mediciones del autor.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero conviene revisar el fichero `LICENSE` y las condiciones del repositorio upstream, especialmente en lo relativo al banco de voces.
- Al ser un derivado de precisión de pesos de terceros, la responsabilidad sobre los datos de entrenamiento y sus posibles sesgos recae en el modelo base, no en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nocmt/Hojo-TTS-Light-40M-INT8
- Modelo base: https://huggingface.co/HojoAI/Hojo-TTS-Light-40M
- Revisión concreta del modelo base: https://huggingface.co/HojoAI/Hojo-TTS-Light-40M/tree/c3cf21c77dc04b220aa4dabe20fc59e66a2a5485
- Documentación de cuantización de ONNX Runtime: `onnxruntime.quantization.quantize_dynamic` (referenciada en la model card)
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repos o demos) en los resultados de la búsqueda web proporcionados.
