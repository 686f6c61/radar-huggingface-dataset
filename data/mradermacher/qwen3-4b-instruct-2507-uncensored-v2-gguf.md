# mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Manitec/Qwen3-4B-Instruct-2507-uncensored-v2, una versión modificada del Qwen3-4B-Instruct-2507 de Alibaba con el objetivo de eliminar los mecanismos de rechazo y censura del modelo original. El autor, mradermacher, es un publicador habitual de cuantizaciones GGUF que facilita la ejecución local de modelos en hardware modesto.

El modelo base tiene aproximadamente 4.022 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. La versión "uncensored" está pensada para casos de uso donde se requiere una generación de texto sin filtros de seguridad, como escritura creativa, roleplay o investigación sobre comportamientos de modelos. Al estar cuantizado en formato GGUF, puede ejecutarse con llama.cpp, Ollama u otros motores compatibles en CPU y GPU de gama media.

La relevancia de esta publicación radica en ofrecer una alternativa ligera (el cuantizado Q4_K_M ocupa solo 2,6 GB) para desplegar un modelo instructivo de 4B con licencia permisiva, aunque hay que tener en cuenta que al eliminar la censura se pierden también las salvaguardas contra contenido dañino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Qwen3) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Se sabe que deriva de Qwen3-4B-Instruct-2507, que pertenece a la familia Qwen3 de Alibaba, basada en transformers con atencion por ventanas deslizantes y atencion completa alternadas, aunque no se confirma si esta version mantiene esas caracteristicas. El proceso de "uncensoring" aplicado por Manitec probablemente consiste en una tecnica de abliteration, que elimina o atenua las direcciones de rechazo en el espacio de activaciones, pero no se han publicado detalles tecnicos al respecto.

Tampoco hay informacion sobre el dataset de entrenamiento, el numero de tokens procesados o si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF realizada por mradermacher es estatica, sin uso de imatrix (aunque existe una version alternativa con imatrix en otro repositorio). No se mencionan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto instructivo y conversacional en ingles.
- Capacidad de seguir instrucciones y mantener dialogos multi-turno, heredada del modelo Qwen3 base.
- Al ser una version "uncensored", no aplica los rechazos tipicos de seguridad del modelo original, por lo que puede generar contenido que el modelo base bloquearia.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha confirmado soporte para vision, audio u otras modalidades.
- Capacidades multilingues: no confirmadas, aunque el modelo base Qwen3 soporta multiples idiomas, esta version solo declara ingles.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa, poesia o guiones con tematicas adultas o controvertidas que otros modelos rechazarian, util para autores que necesitan explorar contenido sin filtros.
- Roleplay y ficcion interactiva: su capacidad conversacional y su falta de censura lo hacen adecuado para juegos de rol por texto o chatbots de personajes con tematicas complejas.
- Investigacion sobre alineacion y seguridad: permite estudiar como se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con las del modelo original para analizar el impacto de la abliteration.
- Generacion de contenido para prototipos: al ser ligero (2,6 GB en Q4_K_M), puede integrarse en aplicaciones locales de generacion de texto para pruebas rapidas sin depender de APIs externas.
- Asistente personal local: desplegado con Ollama o llama.cpp, puede servir como asistente conversacional en equipos sin GPU dedicada, gracias a su bajo consumo de recursos.
- Educacion y experimentacion: util para estudiantes y desarrolladores que quieran aprender a cuantizar modelos o a ejecutar LLMs en entornos limitados, dado que el formato GGUF es ampliamente documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para esta version cuantizada ni para el modelo base "uncensored". Se recomienda consultar las metricas del Qwen3-4B-Instruct-2507 original para una referencia aproximada, aunque la cuantizacion y la modificacion "uncensored" pueden alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el cuantizado elegido, desde 1,8 GB (Q2_K) hasta 8,2 GB (f16). El Q4_K_M (2,6 GB) es un buen equilibrio entre calidad y consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar los cuantizados Q4 o inferiores. Para Q6_K o Q8_0 se recomienda 6-8 GB de VRAM. El f16 requiere 8,2 GB y es excesivo para la mayoria de usos.
- En consumer GPU: si, cabe en RTX 3060, RTX 4060, GTX 1660 Super (con cuantizados bajos) y en practicamente cualquier GPU moderna con 4 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, text-generation-webui (con backend llama.cpp). Tambien es compatible con servidores como llama-cpp-python o llamafile.
- Latencia y throughput: no se han publicado mediciones. En una CPU moderna con AVX2, un Q4_K_M puede generar entre 5 y 15 tokens por segundo; en una GPU como RTX 3060, entre 30 y 60 tokens por segundo, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (original) | 4,02 B | no disponible | Apache 2.0 | safetensors | Modelo base con censura |
| Manitec/Qwen3-4B-Instruct-2507-uncensored-v2 | 4,02 B | no disponible | Apache 2.0 | safetensors | Version sin censura |
| mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-GGUF | 4,02 B | no disponible | Apache 2.0 | GGUF | Cuantizacion de la version sin censura |
| Llama-3.2-3B-Instruct | 3,21 B | 128 K | Llama 3.2 | safetensors, GGUF | Alternativa de tamano similar, con censura estandar |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia es la licencia (Apache 2.0 frente a Llama 3.2) y la ausencia de censura en la version de Manitec.

## Limitaciones y advertencias

- Al ser una version "uncensored", el modelo puede generar contenido explicito, ofensivo, ilegal o peligroso sin restricciones. No debe utilizarse en aplicaciones publicas sin supervisión humana.
- No se han publicado evaluaciones de sesgos ni de alucinaciones. Es probable que herede los sesgos del modelo base Qwen3, que pueden estar acentuados por la eliminacion de los mecanismos de rechazo.
- La longitud de contexto no esta documentada; se desconoce si mantiene la ventana del Qwen3 original (que suele ser de 32 K o 128 K segun la variante).
- Solo se declara soporte para ingles, aunque el modelo base podria manejar otros idiomas; no hay garantia de calidad en espanol u otros lenguajes.
- La cuantizacion estatica puede degradar la calidad respecto al modelo en punto flotante, especialmente en los cuantizados mas agresivos (Q2_K, Q3_K).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3 tiene su propia licencia (Apache 2.0 segun el enlace), por lo que no hay restricciones adicionales conocidas.
- El repositorio no tiene descargas ni valoraciones, lo que indica que es una publicacion reciente o poco utilizada; no hay comunidad que valide su comportamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-GGUF
- Modelo base (Manitec): https://huggingface.co/Manitec/Qwen3-4B-Instruct-2507-uncensored-v2
- Modelo original Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Version con imatrix: https://huggingface.co/mradermacher/Qwen3-4B-Instruct-2507-uncensored-v2-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
