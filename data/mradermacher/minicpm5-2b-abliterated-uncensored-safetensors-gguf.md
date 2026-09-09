# mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF

## Resumen

MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF es una cuantizacion en formato GGUF de un modelo de lenguaje basado en la arquitectura MiniCPM5, con 2.516.756.480 parametros. La variante original ha sido creada por mondk, que partio de un miembro de la familia MiniCPM5 de OpenBMB y le aplico tecnicas de "abliteracion" para eliminar las capas de alineacion y moderacion, dando lugar a un modelo "uncensored" (sin restricciones de contenido). El cuantizado ha sido generado por mradermacher, que ofrece multiples formats de WWU, desde Q2_K hasta f16.

El modelo esta pensado para despliegue local y on-device, con soporte de tool calling y generacion de texto en ingles y chino. Licencia Apache 2.0, lo que permite uso comercial. Su principal atractivo es ejecutarse en hardware modesto, con pesos que ocupan entre 1,1 GB y 5,1 GB segun la cuantizacion. Es adecuado para desarrolladores que requieren un modelo pequeno, rapido y sin filtros para prototipado, agentes y edge computing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia MiniCPM5 |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso dentro de la familia MiniCPM5 de OpenBMB, optimizada para inferencia en dispositivos de recurso limitado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni metodologias de alineacion. Se sabe que el modelo base de mondk ha sido "abliterated", un proceso que depende de tecnicas de desalineacion para eliminar la resistencia a generar contenido no deseado, preservando en teoria las capacidades de razonamiento y generacion. Tampoco hay datos sobre innovaciones tecnicas especificas en la atencion, decodificacion especulativa o capas. La cuantizacion GGUF esta pensada para ejecutar el modelo con llama.cpp o similares, reduciendo drásticamente los requisitos de memoria sin necesidad de GPU dedicada.

## Capacidades

- Generacion de texto en ingles y chino, incluyendo contextos de conversacion.
- Soporte de tool calling / function calling para integrar el modelo en pipelines de agentes.
- Capaz de operar en dispositivos con poco consumo energetico (edge / on-device).
- Modelo "uncensored": no aplica fuertes filtros de contenido, lo que permite generar respuestas sobre temas que otros modelos rechazan.
- Diseñado para interacciones conversacionales y tareas de instrucciones.
- Al ser una cuantizacion GGUF, puede cargarse en una amplia gama de frameworks de inferencia local como llama.cpp, Ollama y otros.

## Casos de uso

- Asistente de codigo en terminal: gracias al tool calling, puede utilizarse como agente que recibe comandos, ejecuta herramientas y responde en el terminal, con consumo de VRAM de unos 2 GB usando Q4_K_S.
- Soporte tecnico interno: para empresas que desean un chatbot de ayuda en ingles y chino sin limitaciones de moderacion, por ejemplo para resolver dudas sobre productos propios con tono libre.
- Automatizacion de tareas de oficina: el modelo puede conectarse a APIs externas y ejecutar funciones sencillas (enviar correos, crear tickets) mediante function calling, desplegado en un servidor local.
- Prototipado rapido de agentes LLM: los desarrolladores pueden probar expeditivamente arquitecturas de agente multi-paso usando GGUF y llama.cpp, sin necesidad de un GPU costosa.
- Aplicaciones edge en entornos regulatorios flexibles: integrado en un single-board computer o mini-PC, el modelo puede ofrecer generacion de texto en offline en escenarios de IoT.
- Generacion de documentacion o contenido interno: el modelo puede producir borradores largos en ingles y chino, aunque se recomienda una revision posterior por el riesgo de alucinaciones y contenido no filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante especifica en la informacion disponible. Se sabe que la familia MiniCPM5 reporta un promedio de 42,57 puntos en tareas de razonamiento, conocimiento, codigo, matematicas, logica y agentes, pero eso corresponde al modelo MiniCPM5-1B, no al 2B cuantizado ni a la version abliterada. No se dispone de datos de MMLU, HumanEval ni GSM8K para este modelo, por lo que no se presentan valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion seleccionada, entre 1,1 GB (Q2_K) y 5,1 GB (f16). El Q4_K_S ocupa 1,6 GB y el Q8_0 2,8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como una RTX 3050 o superior, puede ejecutar la mayoria de cuantizaciones sin problemas. Para Q8_0 o f16, una RTX 4090 o A100 es adecuada.
- Espacio en consumer GPU: si, cabe ampliamente en GPUs de consumo, especialmente en cuantizaciones Q4 o Q5, tambien en una RTX 3060 12GB con margen.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se aceptan GGUFs), text-generation-inference y otros frameworks compatibles con GGUF.
- Latencia y throughput estimados: no disponible, aunque al ser un modelo de 2B puede esperarse una inferencia fluida en CPU moderna con cuantizaciones Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| MiniCPM5-2B-Abliterated (este) | 2,5B | no disponible | Apache 2.0 | GGUF, safetensors | no disponible |
| MiniCPM5-1B | 1B | no disponible | Apache 2.0 | safetensors | promedio 42,57 en benchmarks de la serie |
| MiniCPM4 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar en terminos de calidad, velocidad o capacidad. Las tres opciones pertenecen a la misma familia, pero la variante aqui descrita es la unica "abliterated" y cuantizada a GGUF.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": puede generar contenido toxico, ofensivo o ilegal sin restricciones, lo que lo desaconseja para uso en produccion donde la moderacion sea obligatoria.
- Sesgos heredados: al ser una variante de un modelo generico, es probable que mantenga sesgos del dataset original, especialmente en temas de genero, etnia y politica.
- Riesgo de alucinacion elevado: no se ha verificado la calidad de la abliteracion, y la falta de filtros puede hacer que el modelo invente datos con mayor frecuencia y verosimilitud.
- Limitaciones de idioma: solo se han confirmado capacidades en ingles y chino. El rendimiento en otras lenguas, como castellano, no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo ha sido modificado por terceros; la ausencia de documentacion de entrenamiento sobre la abliteracion dificulta la reproducibilidad.
- No se dispone de benchmarks ni evaluaciones oficiales para esta variante, por lo que la calidad relativa es incierta.
- Para produccion, la variante cuantizada puede sufrir degradacion de calidad respecto al modelo original safetensors de 5,1 GB en f16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-GGUF
- Variante con pesos imatrix: https://huggingface.co/mradermacher/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-i1-GGUF
- Repositorio de la familia MiniCPM: https://github.com/OpenBMB/MiniCPM
- Modelo base de mondk: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Guia de uso de GGUF (referencia repartida en el README): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
