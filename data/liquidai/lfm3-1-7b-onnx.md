# LiquidAI/LFM3-1.7B-ONNX

## Resumen

LFM3-1.7B-ONNX es la exportación a formato ONNX del modelo de lenguaje LFM3-1.7B de Liquid AI, empresa estadounidense surgida del MIT que diseña modelos fundacionales orientados a inferencia en dispositivo, en el borde y en la nube. El repositorio no introduce pesos nuevos: empaqueta el mismo modelo en siete precisiones (q4, q4f32, q8, q4f16, q8f16, fp16 y fp32) para ejecutarse con ONNX Runtime tanto en CPU como en GPU, lo que simplifica el despliegue multiplataforma fuera del ecosistema PyTorch.

El modelo base declara 1.700 millones de parámetros y cubre 16 idiomas, entre ellos el castellano. Su interés práctico está en el tamaño: las variantes cuantizadas ocupan entre 1,38 GB y 2,27 GB, de modo que caben en portátiles, mini-PC y GPU de gama de entrada para generación de texto conversacional.

La model card de esta exportación es mínima y remite a la ficha de LFM3-1.7B para arquitectura, longitud de contexto y datos de entrenamiento, datos que no se incluyen en la información disponible. La licencia es lfm1.0 (`license: other`), que debe revisarse antes de cualquier uso comercial. El repositorio acumula 277 descargas y 10 likes desde su publicación en octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada; familia LFM3 de Liquid AI (etiqueta `liquid`), sin detalle de transformer, MoE o SSM |
| Parámetros totales | 1,7 mil millones (1.7B, según el nombre del modelo) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4, q4f32, q8, q4f16, q8f16, fp16 y fp32, todas en ONNX |
| Idiomas soportados | 16: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco |
| Licencia | lfm1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | ONNX (`.onnx`) |
| Tamaño del repositorio | 20,3 GB (suma de todas las precisiones) |
| Librería de inferencia | onnxruntime |
| Modelo base | LiquidAI/LFM3-1.7B (relación: quantized) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo: la model card de esta exportación remite explícitamente a la ficha de LiquidAI/LFM3-1.7B para los detalles de arquitectura y uso. Las etiquetas del repositorio (`liquid`, `lfm3`) lo sitúan en la familia de modelos fundacionales LFM3 de Liquid AI, pero no se especifica si emplea atención estándar, atención lineal, mezcla de expertos o un esquema híbrido, ni se detalla la dimensión de las capas, el número de cabezas o el vocabulario.

Tampoco se proporcionan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF, DPO u otro ajuste posterior. La etiqueta `conversational` sugiere un ajuste para diálogo, y la etiqueta `custom_code` implica que el modelo base requiere cargar código remoto (`trust_remote_code`) en algunas herramientas. El proceso concreto de exportación y cuantización a ONNX no se describe; la model card solo indica que las variantes fp16, q4f16 y q8f16 emplean activaciones en fp16, mientras que el resto usa precisiones mayores.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, según la tarea declarada `text-generation` y la etiqueta `conversational`.
- Cobertura multilingüe declarada en 16 idiomas, incluidos español, inglés, francés, alemán, portugués, chino, árabe, hindi y ruso; no se detalla el nivel de calidad por idioma.
- Inferencia multiplataforma mediante ONNX Runtime, con variantes específicas para CPU y para GPU.
- Ejecución en precisiones que van de 4 bits a 32 bits, lo que permite ajustar el equilibrio entre tamaño, latencia y fidelidad numérica.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de razonamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de escritorio: las variantes q4 (1,63 GB) y q8 (2,27 GB) permiten integrar un chat local en aplicaciones de escritorio sin depender de una API externa, ejecutando la inferencia en la CPU del equipo.
- Procesamiento por lotes en servidores sin GPU: con ONNX Runtime y la variante q4f32 o q8 puede resumirse, clasificarse o reescribirse texto en pipelines de datos, aprovechando que el modelo cabe holgadamente en la memoria de un servidor convencional.
- Atención multilingüe en mercados europeos: la cobertura declarada de 16 idiomas, incluidos los principales de la UE, permite prototipar respuestas automáticas y traducción asistida, aunque la calidad por idioma debe validarse con datos propios.
- Inferencia en el borde y en dispositivo: las variantes q4f16 (1,38 GB) y q8f16 (2,03 GB) están pensadas para GPU de baja potencia, lo que habilita su uso en mini-PC, equipos industriales o dispositivos con aceleración gráfica limitada.
- Escenarios con requisitos de privacidad: al ejecutarse de forma local, los datos no salen del perímetro de la organización, lo que encaja en sectores sanitario, legal o financiero donde el envío a la nube requiere justificación adicional.
- Evaluación y prototipado de la familia LFM3: sirve como banco de pruebas para medir latencia y calidad antes de adoptar el modelo original en PyTorch o variantes de mayor tamaño de la familia.
- Aplicaciones web o integradas que ya usan ONNX Runtime: si el entorno de destino dispone de un ejecutor ONNX Runtime compatible, el modelo puede incorporarse sin introducir una dependencia de PyTorch en el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y tampoco se aportan métricas de latencia o throughput para las distintas precisiones.

## Requisitos de hardware

| Precisión | Archivo | Tamaño | Dispositivo | Memoria estimada (pesos + sobrecarga) |
|---|---|---|---|---|
| q4 | model_q4.onnx | 1,63 GB | CPU | ~2 GB de RAM |
| q4f32 | model_q4f32.onnx | 2,24 GB | CPU | ~2,5 GB de RAM |
| q8 | model_q8.onnx | 2,27 GB | CPU | ~2,6 GB de RAM |
| q4f16 | model_q4f16.onnx | 1,38 GB | GPU | ~2 GB de VRAM |
| q8f16 | model_q8f16.onnx | 2,03 GB | GPU | ~2,5 GB de VRAM |
| fp16 | model_fp16.onnx | 3,59 GB | GPU | ~4 GB de VRAM |
| fp32 | model.onnx | 7,18 GB | Referencia | ~8 GB de VRAM o RAM |

- Las cifras de memoria son estimaciones a partir del tamaño de los archivos; el consumo real depende de la longitud de contexto y del tamaño de lote, que no se documentan.
- Cabe en GPU de consumo: una RTX 3060 de 6 GB o superior puede ejecutar fp16 con margen; para q4f16 basta una GPU de 4 GB. La variante fp32 requiere 8 GB o más.
- Para CPU, las variantes q4 y q8 son las adecuadas; fp32 en CPU es viable solo con memoria abundante y latencia previsiblemente alta.
- Opciones de despliegue: ONNX Runtime es la ruta documentada por el autor. No se confirma en la información disponible el soporte de vLLM, llama.cpp, Ollama o TGI, que trabajan con otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-ONNX | 1,7B | no disponible | no disponible | lfm1.0 | ONNX en HuggingFace |
| LFM3-1.7B (original) | 1,7B | no disponible | no disponible | lfm1.0 | Pesos originales en HuggingFace |
| Alternativas de 1-2B de otros fabricantes | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con otros modelos de tamaño similar. La comparación más directa es con el propio LFM3-1.7B: esta exportación conserva los pesos pero los distribuye en precisiones ONNX, lo que facilita el despliegue a costa de una posible pérdida de calidad en las variantes de 4 y 8 bits, no medida en la información disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, composición del dataset ni procesos de alineación, por lo que no es posible evaluar riesgos de sesgo por idioma, género o dominio.
- Riesgo de alucinación inherente a un modelo de 1,7B sin datos públicos de evaluación; no debe usarse como fuente de verdad en dominios factuales sin verificación externa.
- La cuantización a 4 y 8 bits puede degradar la calidad respecto a fp16 y fp32; el autor no publica métricas de esa pérdida.
- La longitud de contexto no está especificada, lo que impide planificar conversaciones largas o tareas de resumen de documentos extensos.
- Aunque se declaran 16 idiomas, no se aporta ninguna evaluación por idioma; el rendimiento en español, hindi o tailandés puede ser desigual.
- La licencia lfm1.0 se etiqueta como `other`; es imprescindible leer el archivo LICENSE antes de un uso comercial, ya que no se detallan aquí las restricciones.
- La etiqueta `custom_code` implica que algunas herramientas pueden requerir `trust_remote_code`, con el riesgo de seguridad que conlleva ejecutar código del repositorio.
- El repositorio ocupa 20,3 GB porque incluye todas las precisiones; conviene descargar solo el archivo necesario.
- No se documentan garantías de soporte, actualizaciones ni compatibilidad con versiones concretas de ONNX Runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del repositorio: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX/blob/main/LICENSE
- Organización Liquid AI en HuggingFace: https://huggingface.co/LiquidAI
- Sitio web de Liquid AI: https://www.liquid.ai/
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola y API: https://console.liquid.ai/dashboard
- Wikipedia de Liquid AI: https://en.wikipedia.org/wiki/Liquid_AI
