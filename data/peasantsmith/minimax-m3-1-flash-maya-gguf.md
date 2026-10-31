# peasantsmith/MiniMax-M3.1-Flash-Maya-GGUF

## Resumen

MiniMax-M3.1-Flash · Maya GGUF es una colección de cuantizaciones GGUF del modelo MiniMax-M3.1-Flash de MiniMaxAI, creadas por el usuario peasantsmith y diseñadas para funcionar con Project Maya, un motor de inferencia que mantiene en GPU los expertos más utilizados y calcula el resto desde la RAM. El modelo base es un MoE multimodal (imagen-texto a texto) de 426.174.572.928 parámetros totales, con unos 23.000 millones de parámetros activos por token, atención dispersa en todas las capas y una ventana de contexto de hasta 1 millón de tokens.

El problema que resuelve esta ficha de cuantización es la barrera de hardware: el modelo original pesa más de 400 GB, mientras que las variantes Maya-S y Maya-XS reducen la huella en memoria a 122,4 GB y 93,0 GB respectivamente, manteniendo una fidelidad medida frente al original (incremento de NLL de +0,8% y +5,0%). Las cuantizaciones se elaboraron a partir de los pesos publicados por MiniMax (expertos en FP4, pesos densos en FP8), no de un fichero re-cuantizado, y conservan todos los expertos.

Es relevante ahora porque permite ejecutar en un PC de gama alta (128 GB de RAM) un modelo frontera orientado a agentes, código y razonamiento, con API compatible con OpenAI y Anthropic, tool calling y soporte de imágenes, algo habitualmente reservado a clústeres de GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, transformer con atención dispersa en todas las capas |
| Parametros totales | 426.174.572.928 (según safetensors; la model card cita 428B) |
| Parametros activos | ~23B por token (128 expertos enrutados por capa, 4 activos, más un experto compartido) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | Maya-S: IQ2_XXS (con IQ2_XS/IQ2_S/IQ3_XXS en capas sensibles), atención Q8_0, expertos compartidos/densos/embeddings/salida Q6_K. Maya-XS: IQ1_S (con IQ2_XXS en capas sensibles), atención Q5_K/Q6_K, resto Q5_K/Q4_K/Q6_K |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (license_name: minimax-community, tipo "other") |
| Formato de pesos | GGUF (shards divididos) + safetensors en el modelo base; incluye DSpark drafter (2,3 GB) y vision tower (1,7 GB) |

## Arquitectura y entrenamiento

El modelo base, MiniMax-M3.1-Flash, es un transformer con arquitectura mixture-of-experts: cada capa contiene 128 expertos enrutados de los cuales 4 se activan por token, además de un experto compartido siempre activo. Todas las capas emplean atención dispersa, con un indexador de atención dispersa que se ejecuta en cada capa (los indexadores de las capas 0-2 se distribuyen en un fichero GGUF adicional `*-maya-indexers.gguf`). Es un modelo multimodal con vision tower, clasificado como image-text-to-text. Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada.

En cuanto a la cuantización, el proceso de peasantsmith fue el siguiente: calibración con 384 secuencias de 2.048 tokens en el formato de chat de MiniMax (incluyendo thinking, trazas de agentes y tool calling, código con three.js/canvas/WebGL, razonamiento, chat y chat multilingüe); cálculo de una matriz de importancia (imatrix) por experto a partir de las estadísticas del propio modelo; asignación de bits a las capas más sensibles midiendo cada matriz gate/up/down en cada tipo candidato; redondeo con retroalimentación de error a nivel de bloques de 256 pesos, calibrando cada capa sobre la salida de las capas ya cuantizadas; y uso de los cuantizadores nativos de llama.cpp (ggml), de modo que los ficheros son GGUF ordinarios en el layout `minimax-m3`. Los resultados de calidad se midieron sobre conversaciones held-out no usadas en la calibración, contra las predicciones del modelo original decodificado exactamente, con los mismos resultados en NVIDIA y AMD.

## Capacidades

- Generación de texto conversacional, con niveles de thinking de MiniMax soportados en el motor de Project Maya.
- Tool calling / function calling: categoría con 92,1% de coincidencia de top token en Maya-S y 88,8% en Maya-XS frente al original; el motor expone API compatible con OpenAI y Anthropic con tool calls en streaming.
- Agentes y razonamiento multi-paso: la calibración incluyó trazas de agentes y el tag del repo lo recoge explícitamente.
- Generación de código: 93,7% (Maya-S) / 90,9% (Maya-XS), con énfasis en front-end web (three.js, WebGL, canvas: 92,0% / 88,5%) y desarrollo web general (94,6% / 91,7%).
- Razonamiento: 85,9% (Maya-S) / 80,4% (Maya-XS).
- Multimodalidad: entrada de imagen gracias al vision tower incluido (1,7 GB, tal como lo publicó MiniMax).
- Chat multilingüe: 78,5% (Maya-S) / 71,6% (Maya-XS).
- Contexto muy largo: hasta 1M tokens, con atención dispersa en todas las capas.
- Decodificación especulativa: se incluye el drafter DSpark de MiniMax (2,3 GB).

## Casos de uso

- Ejecución local de un modelo frontera en un PC de 128 GB de RAM: Maya-XS cabe íntegramente en la memoria de un equipo doméstico de gama alta gracias a Project Maya, que mantiene en GPU los expertos más usados y calcula el resto desde RAM.
- Agentes con tool calling en local: la API compatible con OpenAI y Anthropic permite conectar el modelo a frameworks de agentes existentes (LangChain, Claude SDK, clientes OpenAI) sin cambios de código, con soporte de streaming.
- Generación de front-end web: el modelo está calibrado específicamente para three.js, WebGL y canvas, lo que lo hace adecuado para asistentes que generan visualizaciones 3D y gráficos interactivos en el navegador.
- Asistentes de código en IDEs locales: su alta fidelidad en código (90-94%) y el drafter DSpark para decodificación especulativa lo orientan a autocompletado y refactorización con baja latencia.
- Análisis de documentos extensos: la ventana de 1M tokens permite procesar bases de código completas, expedientes o corpus documentales en una sola sesión.
- Chatbots multilingües: la categoría de chat multilingüe calibrada indica buen comportamiento en conversación en varios idiomas, aunque la lista concreta de idiomas no está disponible.
- Interfaces multimodales: combinando el vision tower con el motor, se pueden construir aplicaciones que describen imágenes o razonan sobre capturas de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí ofrece una métrica propia de fidelidad: porcentaje de coincidencia del top token frente al modelo original (pesos de MiniMax decodificados exactamente), medida en conversaciones held-out.

| Categoria | Maya-S | Maya-XS |
|---|---:|---:|
| Tool calls y agentes | 92,1% | 88,8% |
| three.js / WebGL / canvas | 92,0% | 88,5% |
| Front-end web | 94,6% | 91,7% |
| Codigo | 93,7% | 90,9% |
| Razonamiento | 85,9% | 80,4% |
| Chat | 76,4% | 66,5% |
| Chat multilingue | 78,5% | 71,6% |
| **Media de las categorias** | **87,6%** | **82,6%** |

Adicionalmente, el incremento de next-token loss (NLL) frente al original es de +0,8% para Maya-S y +5,0% para Maya-XS.

## Requisitos de hardware

- Memoria del modelo: Maya-S ocupa 122,4 GB; Maya-XS, 93,0 GB (diseñada para caber en la memoria de un PC con 128 GB de RAM). A esto se suman el drafter DSpark (2,3 GB) y el vision tower (1,7 GB).
- GPUs: NVIDIA desde V100 en adelante, o AMD; Project Maya compila el motor para las GPU(s) disponibles. No se especifica una VRAM mínima concreta, ya que el motor descarga expertos a RAM.
- Consumer GPUs: el enfoque de Project Maya (expertos frecuentes en GPU, resto en RAM) permite ejecutar el modelo en estaciones de trabajo con 128 GB de RAM y GPUs de consumo compatibles; el repo indica explícitamente que Maya-XS está pensada para "todo el modelo en la memoria de un PC de 128 GB".
- Despliegue: Project Maya (v1.1.30 o posterior) con instalación automatizada (`./setup.sh --setup --model minimax-maya-s` o `minimax-maya-xs`, o `START-MAYA.bat` en Windows), dashboard en `http://127.0.0.1:8080` y API compatible con OpenAI y Anthropic (streaming, tool calls, imágenes, niveles de thinking). Los shards también cargan en llama.cpp estándar (layout `minimax-m3`), aunque este ejecuta las capas 0-2 con atención completa en lugar de los indexadores dedicados. No se menciona soporte de vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. Se incluye el drafter DSpark para acelerar la generación mediante decodificación especulativa.
- Descargas: los ficheros se verifican por sha256 y las descargas se pueden reanudar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Como referencia de posicionamiento dentro de la categoría de MoE grandes cuantizados para hardware de consumo:

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash (Maya GGUF) | 426B | ~23B | 1M | GGUF (IQ1_S/IQ2_XXS mixtos) | MiniMax Community License (uso comercial con condiciones) |
| DeepSeek-V3 / R1 (cuantizado) | 671B | 37B | no disponible en esta ficha | GGUF comunitario | MIT (modelo base) |
| Qwen3-235B-A22B | 235B | 22B | no disponible en esta ficha | GGUF comunitario | Apache 2.0 |

Nota: los datos de DeepSeek y Qwen se ofrecen como contexto general; para cifras exactas de contexto y rendimiento conviene consultar sus fichas oficiales. La ventaja diferencial de Maya es el motor Project Maya, que permite ejecutar un MoE de 426B íntegro en un PC de 128 GB, algo que con GGUF estándar requeriría más memoria o sacrificaría expertos.

## Limitaciones y advertencias

- Licencia con condiciones comerciales: la MiniMax Community License es gratuita para uso no comercial; el uso comercial tiene requisitos, incluido mostrar el texto "Built with MiniMax M3.1-Flash". Hay que revisar el fichero LICENSE antes de cualquier despliegue comercial.
- Pérdida de calidad por cuantización: aunque la coincidencia de top token es alta (87,6% de media en Maya-S), Maya-XS degrada notablemente en chat (66,5%) y chat multilingüe (71,6%); las respuestas no serán idénticas al modelo original.
- Cuantización extrema: IQ1_S e IQ2_XXS son formatos de muy baja precisión; existe riesgo de alucinaciones o errores de razonamiento mayores que en el modelo original, especialmente en Maya-XS.
- Compatibilidad parcial con llama.cpp: con llama.cpp estándar, las capas 0-2 se ejecutan con atención completa en lugar de los indexadores dedicados, lo que puede alterar el comportamiento respecto a la ejecución definida por MiniMax; para fidelidad total hay que usar Project Maya.
- Idiomas: la lista de idiomas soportados no está disponible; el chat multilingüe es la categoría con menor fidelidad tras chat.
- Datos de entrenamiento, sesgos conocidos y cifras de latencia/throughput: no disponibles en la información proporcionada.
- Requisitos de memoria elevados: se necesita un equipo con 128 GB de RAM (o más) y GPU NVIDIA (V100 o superior) o AMD; no es viable en portátiles o equipos estándar.
- El proyecto de cuantización es comunitario (peasantsmith), no oficial de MiniMax: los resultados de fidelidad son mediciones del propio autor sobre conversaciones held-out, no benchmarks independientes.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/peasantsmith/MiniMax-M3.1-Flash-Maya-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Project Maya (motor de inferencia): https://github.com/mw00/project-maya
