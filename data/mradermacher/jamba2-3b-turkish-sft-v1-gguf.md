# mradermacher/Jamba2-3B-Turkish-SFT-v1-GGUF

## Resumen

El modelo `mradermacher/Jamba2-3B-Turkish-SFT-v1-GGUF` es una cuantización en formato GGUF del modelo base `linguai/Jamba2-3B-Turkish-SFT-v1`, un ajuste fino (SFT) del modelo Jamba2-3B de AI21 orientado al seguimiento de instrucciones en turco e inglés. El autor, mradermacher, publica cuantizaciones estáticas de modelos open source para facilitar su ejecución en hardware local o de bajos recursos. Este repositorio ofrece doce variantes de cuantización, desde Q2_K (1,3 GB) hasta f16 (6,2 GB), lo que permite adaptar el modelo a diferentes capacidades de memoria y requisitos de calidad.

El modelo base tiene 3.039.823.232 parámetros (aproximadamente 3B), lo que lo sitúa en la categoría de modelos pequeños, adecuados para despliegues en entornos con recursos limitados. Al estar cuantizado en GGUF, es compatible con herramientas como llama.cpp, Ollama o LM Studio, lo que facilita su uso en aplicaciones de inferencia local. La relevancia de este modelo radica en su enfoque en el idioma turco, un área con menos oferta de modelos abiertos de calidad, y en su capacidad para ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.039.823.232 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | tr, en |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible en la model card del cuantizador no incluye detalles sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. Se indica únicamente que se trata de una cuantización estática del modelo `linguai/Jamba2-3B-Turkish-SFT-v1`, que a su vez es un ajuste fino del modelo Jamba2-3B de AI21. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas en la arquitectura. Por tanto, estos aspectos se consideran no disponibles en la informacion proporcionada.

## Capacidades

- Seguimiento de instrucciones: el modelo está etiquetado como "instruction-following", lo que indica que ha sido ajustado para responder a comandos y peticiones de forma directa.
- Conversación: el tag "conversational" sugiere que puede mantener diálogos multi-turno, aunque no se especifica la longitud máxima de contexto.
- Multilingüe: soporta turco (tr) e inglés (en), con un enfoque principal en el turco.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que puede ser utilizado a través de servidores de inferencia compatibles con la API de OpenAI u otros estándares.
- No se dispone de información sobre capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente virtual en turco: el modelo puede integrarse en un chatbot para responder preguntas frecuentes o realizar tareas de atención al cliente en turco, aprovechando su ajuste para instrucciones y su tamaño reducido que permite ejecutarlo en un servidor modesto.
- Generación de contenido en turco: redacción de textos, correos electrónicos o publicaciones en redes sociales en turco, con la posibilidad de ajustar el tono mediante instrucciones.
- Traducción informal turco-inglés: aunque no está específicamente entrenado para traducción, su bilingüismo permite usarlo como asistente de traducción en contextos conversacionales.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y cuantizado, es adecuado para pruebas de concepto en entornos de desarrollo sin acceso a GPUs de gama alta.
- Educación y aprendizaje: puede utilizarse como herramienta de práctica para estudiantes de turco o para generar ejercicios de conversación.
- Despliegue en edge devices: gracias a las cuantizaciones pequeñas (Q2_K, Q3_K), puede ejecutarse en dispositivos con poca memoria, como Raspberry Pi o portátiles antiguos, para aplicaciones de procesamiento de lenguaje natural básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada: según la cuantización elegida, el archivo GGUF ocupa entre 1,3 GB (Q2_K) y 6,2 GB (f16). Para inferencia, se recomienda una VRAM al menos igual al tamaño del archivo, más un margen para el contexto y los cálculos. Por ejemplo, Q4_K_M (1,9 GB) puede caber en una GPU con 4 GB de VRAM, mientras que f16 requeriría al menos 8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para cuantizaciones bajas; para f16 se recomienda una RTX 3060 o superior. También puede ejecutarse en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q2_K a Q5_K son adecuadas para GPUs de consumo con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python o vLLM (con adaptaciones).
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, un modelo de 3B cuantizado puede generar decenas de tokens por segundo, pero esto depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (tamaño ~3B, enfoque en turco). No se conocen modelos comparables con datos de rendimiento disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos específicos del modelo base o del ajuste fino.
- Riesgo de alucinación: al ser un modelo de 3B, es probable que presente alucinaciones en tareas complejas o de razonamiento profundo, especialmente en contextos largos.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; se recomienda probar con secuencias cortas para evitar degradación.
- Restricciones de licencia: la licencia no está indicada en la model card del cuantizador. Se debe consultar la licencia del modelo base `linguai/Jamba2-3B-Turkish-SFT-v1` y la de Jamba2-3B de AI21 para determinar si el uso comercial está permitido.
- Caveat de cuantización: las cuantizaciones de baja precisión (Q2_K, Q3) pueden degradar la calidad de las respuestas. Se recomienda usar Q4_K_M o superior para producción.
- Idioma: aunque soporta inglés, su enfoque principal es el turco; el rendimiento en inglés puede ser inferior al de modelos específicamente entrenados para ese idioma.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Jamba2-3B-Turkish-SFT-v1-GGUF
- Modelo base (linguai/Jamba2-3B-Turkish-SFT-v1): https://huggingface.co/linguai/Jamba2-3B-Turkish-SFT-v1
- Página de AI21 sobre la familia Jamba: https://www.ai21.com/jamba/
- Repositorio del cuantizador (mradermacher): https://huggingface.co/mradermacher
