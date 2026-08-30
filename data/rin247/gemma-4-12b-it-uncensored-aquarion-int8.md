# Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT8` es una cuantización INT8 *weight-only* del modelo `gemma-4-12B-it` de Google DeepMind, modificada mediante una técnica de *abliteración* (eliminación de la dirección de rechazo) para producir una versión "sin censura" del modelo original. El autor, Rin247, lo publica como parte de un "forge" denominado *Genesis of Aquarion*, que combina la proyección ortogonal de la dirección de rechazo con una cuantización posterior.

El modelo base `gemma-4-12B-it` es un modelo multimodal unificado (Gemma4Unified) sin encoder, lanzado en junio de 2026, con aproximadamente 12 000 millones de parámetros y una arquitectura densa que procesa tanto texto como imágenes proyectando parches de imagen directamente en el decoder. Esta versión cuantizada reduce el tamaño del modelo a unos 13,1 GB en disco, lo que facilita su despliegue en hardware local con requisitos de VRAM moderados, manteniendo la mayoría de las capacidades del modelo original. La relevancia de esta variante radica en ofrecer una alternativa de menor huella de memoria para desarrolladores que necesitan un modelo multimodal sin las restricciones de seguridad habituales, aunque esto conlleva riesgos que se detallan más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal (texto e imagen), sin encoder (Gemma4Unified) |
| Parametros totales | 11 959 730 224 (~11,96 B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 256 000 tokens según fuentes externas, pero no se confirma para esta versión) |
| Tipos de cuantizacion | INT8 *weight-only* (safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors con cuantizacion INT8 y buffers de escala/formas (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-12B-it` emplea una arquitectura unificada sin encoder, donde los parches de imagen se proyectan directamente en el decoder, eliminando la necesidad de un codificador de visión separado. El decoder consta de 48 capas (L0-L47), y según la información de la búsqueda web, la señal de rechazo (refusal) se concentra en las capas superiores (L15-L47), por lo que la abliteración se aplica solo al 70 % superior de las capas para evitar distorsiones en las capas iniciales con baja relación señal-ruido.

Para esta versión, el autor Rin247 aplicó una proyección ortogonal de la dirección de rechazo sobre el modelo base, eliminando así las restricciones de contenido. Posteriormente realizó una cuantización INT8 *weight-only* mediante PyTorch RTN (Round-to-Nearest) en CPU, almacenando las escalas y formas junto a los pesos en archivos safetensors. El proceso requiere dequantizar los pesos con los buffers correspondientes antes de la inferencia, ya que no se trata de una cuantización estándar compatible con todos los motores de inferencia.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades de generacion de texto, razonamiento logico y matemático del modelo base, aunque la cuantizacion puede introducir una ligera degradacion en tareas de alta precision.
- Comprension multimodal: procesa imagenes junto con texto, permitiendo descripcion de imagenes, respuesta a preguntas visuales y analisis de contenido grafico.
- Tool calling y function calling: soporta la invocacion de herramientas externas, lo que permite su integracion en agentes y pipelines automatizados.
- Soporte de agentes y razonamiento multi-paso: puede mantener conversaciones complejas y ejecutar secuencias de acciones con contexto largo (hasta 256 000 tokens en el modelo base, aunque no se confirma en esta version).
- Capacidades multilingues: no se especifican idiomas concretos, pero el modelo base de Google DeepMind suele cubrir multiples lenguas.
- Modo sin censura: la abliteracion elimina las respuestas de rechazo, permitiendo generar contenido que el modelo original bloquearia (por ejemplo, temas controvertidos, lenguaje explicito o instrucciones potencialmente peligrosas).
- Sin modo de pensamiento explicito: no se indica soporte para *thinking mode* o razonamiento encubierto.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritores y creadores pueden utilizar el modelo para producir narrativas, dialogos o guiones que aborden temas tabu o lenguaje explicito, sin que el modelo se niegue a responder. Es adecuado por su abliteracion y su capacidad de mantener coherencia en textos largos.
- Chatbots de rol y entretenimiento para adultos: el modelo puede interpretar personajes sin filtros morales, gracias a su capacidad de seguir instrucciones complejas y mantener contexto multi-turno. Su ventana de contexto amplia (si se confirma) permite conversaciones prolongadas.
- Analisis de imagenes en entornos de investigacion: investigadores que trabajan con imagenes medicas, cientificas o tecnicas pueden aprovechar la comprension multimodal del modelo para extraer informacion visual sin las limitaciones de contenido que imponen otros modelos.
- Asistentes de programacion con generacion de codigo sin restricciones: desarrolladores que necesitan explorar tecnicas de programacion avanzadas o generar codigo para fines educativos pueden usar el modelo sin que rechace solicitudes relacionadas con seguridad ofensiva o exploits. Su soporte de tool calling permite integrarlo en entornos de desarrollo.
- Automatizacion de tareas de moderacion inversa: en plataformas que requieren generar contenido provocador o de prueba para evaluar sistemas de moderacion, este modelo puede producir ejemplos variados que los filtros comerciales bloquean, ayudando a entrenar clasificadores.
- Experimentacion con abliteracion y cuantizacion: investigadores interesados en tecnicas de eliminacion de sesgos de seguridad pueden estudiar el comportamiento del modelo tras la proyeccion ortogonal y compararlo con el original, usando esta version como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se dispone de comparaciones cuantitativas con el modelo base o con otras versiones cuantizadas. Se recomienda evaluar el modelo en el dominio de aplicacion antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion INT8 *weight-only*, el modelo ocupa aproximadamente 12 GB en memoria (11,96 B parámetros × 1 byte por peso). Se requieren al menos 14-16 GB de VRAM para inferencia con contexto moderado, considerando los estados intermedios y las activaciones.
- GPU recomendadas: una NVIDIA RTX 4080/4090 (16-24 GB) o una A100/A10G (24-40 GB) son suficientes. En GPUs con menos de 12 GB, como una RTX 3060 (12 GB), podria no caber con contexto largo.
- Compatibilidad con consumer GPU: cabe en tarjetas de gama alta consumer (RTX 3090, 4090) y en algunas de gama media con 16 GB (RTX 4080). No se recomienda para GPUs de 8 GB.
- Opciones de despliegue: al ser una cuantizacion personalizada con buffers de escala, no es compatible directamente con vLLM, llama.cpp u Ollama sin un paso de dequantizacion previo. Se puede cargar con PyTorch y un script de dequantizacion, o convertir a formato GGUF si se desea usar llama.cpp. No se proporcionan instrucciones de despliegue en el repositorio.
- Latencia y throughput: no se dispone de mediciones. Como referencia, un modelo denso de 12B en INT8 en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto depende del motor de inferencia y la implementacion de dequantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT8` | 11,96 B | No disponible | No disponible | Safetensors INT8 | Abliterado y cuantizado |
| `google/gemma-4-12B-it` (base) | ~12 B | Hasta 256 K (segun fuentes) | Licencia Gemma (sujeta a terminos de Google) | Safetensors (BF16) | Modelo original sin modificaciones |
| `Justbackup/gemma-4-12B-it-uncensored` | ~12 B | No disponible | No disponible | Safetensors (probablemente BF16) | Abliterado sin cuantizacion |

No se dispone de datos de rendimiento comparativos entre estas versiones. La principal diferencia radica en el tamano en disco (13,1 GB frente a unos 24 GB en BF16) y en la eliminacion de restricciones de contenido. La version de Justbackup parece ser una abliteracion sin cuantizar, por lo que conservaria la precision completa del modelo base.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados. La abliteracion no corrige este problema y podria incluso aumentar la confianza en respuestas incorrectas.
- Sesgos conocidos: el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento. La abliteracion no elimina estos sesgos, solo suprime el mecanismo de rechazo.
- Degradacion por cuantizacion: la cuantizacion INT8 *weight-only* puede provocar perdidas de precision en tareas que requieren calculos numericos finos, como matematicas avanzadas o generacion de codigo complejo.
- Incoherencias tras la abliteracion: eliminar la direccion de rechazo puede afectar la coherencia general del modelo en ciertos contextos, especialmente en temas que el modelo original consideraba sensibles. No se han realizado evaluaciones de calidad.
- Licencia no especificada: el repositorio no indica la licencia de esta version. El modelo base de Google tiene su propia licencia (Gemma Terms of Use), pero no se confirma si esta version cumple con ella. Se recomienda contactar al autor antes de un uso comercial.
- Compatibilidad limitada: al ser una cuantizacion personalizada, no funciona con la mayoria de los motores de inferencia estandar sin un proceso de dequantizacion manual. Esto aumenta la complejidad del despliegue.
- Riesgo de uso indebido: al ser un modelo sin censura, puede generar contenido peligroso, ilegal o eticamente cuestionable. El autor no proporciona salvaguardas adicionales. Su uso en produccion debe considerar politicas de seguridad y responsabilidad legal.
- Sin actualizaciones ni soporte: el repositorio no muestra actividad posterior a su publicacion, y no hay garantia de mantenimiento o correccion de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT8
- Modelo base oficial: https://huggingface.co/google/gemma-4-12B
- Version abliterada alternativa (Justbackup): https://huggingface.co/Justbackup/gemma-4-12B-it-uncensored
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia para ejecutar Gemma 4 localmente (incluye contexto y requisitos): https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Pagina de descarga en SourceForge: https://sourceforge.net/projects/gemma-4-12b/
