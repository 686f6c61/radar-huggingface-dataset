# depontidanilo/beyvault-assistant

## Resumen

Beyvault Assistant es un ajuste fino de tipo LoRA sobre Qwen/Qwen3-0.6B, desarrollado por el usuario depontidanilo y publicado en Hugging Face. Su proposito no es la conversacion general: el autor lo describe explicitamente como un modelo de intencion ("assistant intent model") disenado para una unica tarea dentro de una aplicacion movil, convertir una pregunta corta en un formulario JSON de estructura fija. Fuera de ese esquema, el propio autor advierte que las respuestas son pobres.

Tecnicamente se trata de un transformer denso de aproximadamente 596 millones de parametros (0,6B), heredado de la arquitectura Qwen3, con los pesos del adaptador LoRA fusionados en el modelo base y posteriormente cuantizados a Q4_K_M mediante llama.cpp. El repositorio ocupa 2,9 GB e incluye artefactos en formato GGUF, lo que lo orienta a inferencia en CPU o en GPUs de gama baja mediante llama.cpp y runtimes compatibles.

Su relevancia es acotada pero concreta: demuestra un patron habitual en produccion movil, usar un modelo pequeno y especializado para tareas de extraccion o clasificacion estructurada en lugar de un LLM grande. La licencia Apache 2.0 del modelo base y del ajuste facilita su integracion comercial, aunque la ausencia de benchmarks y de documentacion sobre el dataset de entrenamiento limita mucho la evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-0.6B, sin confirmar en esta ficha) |
| Tipos de cuantizacion | Q4_K_M (GGUF); resto no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3, y se ajusta mediante LoRA para una tarea de transformacion de pregunta a JSON con esquema fijo. El autor indica que el adaptador se fusiona con el modelo base y despues se cuantiza a Q4_K_M con llama.cpp. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni hiperparametros del ajuste.

La unica innovacion tecnica documentada es el propio pipeline de publicacion: LoRA, merge y cuantizacion GGUF, con un sha256 declarado (`ddf51b613b3df7413bdf9e356c62c78bbceeccdcb2336273bb1a879e59af96ee`) para verificar la integridad del artefacto. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones.

## Capacidades

- Transformacion de una pregunta corta en un formulario JSON de estructura fija, tarea para la que fue entrenado.
- Generacion de texto basica heredada del modelo base, aunque el autor advierte de que es deficiente fuera del esquema previsto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el autor no especifica idiomas.
- No se documenta vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de intencion en apps moviles: el modelo recibe una pregunta breve del usuario y devuelve el JSON esperado por la aplicacion, que luego enruta la accion correspondiente. Es su caso de uso principal y el unico validado por el autor.
- Clasificacion y enrutado de consultas: dentro de un asistente, puede mapear la frase del usuario a una categoria fija del formulario y alimentar un router de acciones.
- Relleno de formularios asistido: convierte lenguaje natural corto en campos estructurados, reduciendo la necesidad de que el usuario complete manualmente cada campo.
- Preprocesado local en dispositivos: al ser un modelo de 0,6B en GGUF Q4_K_M, puede ejecutarse en movil o en hardware modesto sin depender de la nube, lo que ayuda a la privacidad de las consultas.
- Prototipado de pipelines de extraccion estructurada: sirve como linea base barata antes de invertir en un modelo mayor o en un servicio gestionado.
- Filtrado previo en sistemas mayores: puede actuar como primera etapa que descarta o etiqueta consultas simples antes de enviar las complejas a un LLM de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M, un modelo de 0,6B ocupa del orden de 0,4-0,5 GB de pesos; con overhead de contexto y runtime, cabe holgadamente en menos de 1-2 GB.
- GPU recomendadas: cualquier GPU consumer reciente con 4 GB o mas; tambien funciona en CPU por su tamano reducido.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y similares, asi como en hardware integrado.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF (Ollama, LM Studio, llama-cpp-python); vLLM y TGI no estan confirmados para este artefacto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Beyvault Assistant | 596 M | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste especializado en JSON de esquema fijo |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en esta ficha | Apache 2.0 | safetensors y GGUF | Modelo base generalista |
| Modelos de extraccion estructurada de 0,5-1 B | no disponible | no disponible | variable | variable | Categoria comparable, sin datos concretos en la informacion disponible |

## Limitaciones y advertencias

- El autor advierte explicitamente de que no es un modelo de chat general y de que da respuestas pobres fuera del formulario JSON previsto.
- No hay informacion sobre sesgos; al derivar de Qwen3-0.6B, puede heredar los del modelo base y los del dataset de ajuste, que no se documenta.
- Riesgo de alucinacion alto en usos fuera de dominio y posible generacion de JSON invalido o incompleto si la entrada se aleja del formato de entrenamiento.
- No se especifican idiomas soportados ni longitud de contexto efectiva tras el ajuste y la cuantizacion.
- Ausencia total de benchmarks, lo que impide comparar su calidad de forma objetiva.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B y validar el sha256 del artefacto antes de desplegarlo.
- La cuantizacion Q4_K_M puede degradar la precision en tareas sensibles al formato; en produccion conviene validar la salida JSON con un esquema estricto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/depontidanilo/beyvault-assistant
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
