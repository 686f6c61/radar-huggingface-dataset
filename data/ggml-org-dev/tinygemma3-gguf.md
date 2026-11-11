# ggml-org-dev/tinygemma3-GGUF

## Resumen

tinygemma3-GGUF es una version cuantizada en formato GGUF del modelo tinygemma3_cifar, un modelo de vision-lenguaje de tamano minimo (38,3 millones de parametros) desarrollado por ggml-org-dev a partir del trabajo original de ngxson. Se trata de un experimento de escala reducida que replica la arquitectura Gemma 3 con capacidad de procesamiento visual, entrenado sobre el conjunto de datos CIFAR-10, lo que lo convierte en una pieza de prueba mas que en un modelo de proposito general.

Su relevancia no reside en sus capacidades de produccion, sino en su funcion como banco de pruebas de integracion continua (CI) para llama.cpp. Al ser un modelo tan pequeno y con soporte de vision, permite validar de forma rapida y determinista el correcto funcionamiento de las rutas de codigo relacionadas con la carga de pesos GGUF, el procesamiento de imagenes y la generacion multimodal dentro del ecosistema ggml.

La licencia WTFPL (Do What The Fuck You Want To Public License) elimina practicamente cualquier restriccion legal de uso, lo que refuerza su caracter de herramienta de testeo abierta. No obstante, conviene subrayar que su entrenamiento sobre CIFAR-10 (imagenes de 32x32 pixeles en 10 clases) limita severamente su utilidad fuera del ambito de validacion tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), inspirada en Gemma 3 |
| Parametros totales | 38.289.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | WTFPL |
| Formato de pesos | GGUF (modelo base en safetensors: ngxson/tinygemma3_cifar) |

## Arquitectura y entrenamiento

El modelo sigue la estela de la familia Gemma 3, adaptada a una escala minima de aproximadamente 38 millones de parametros. Incorpora un componente de vision que permite procesar imagenes junto con texto, si bien la model card no detalla la configuracion exacta del encoder visual, el numero de capas ni las dimensiones internas. La informacion disponible solo confirma que se trata de un modelo conversacional con soporte de vision.

El entrenamiento se realizo sobre el conjunto de datos CIFAR-10, compuesto por 60.000 imagenes de 32x32 pixeles distribuidas en 10 clases (aviones, automoviles, pajaros, gatos, ciervos, perros, ranas, caballos, barcos y camiones). No se especifican el numero de tokens de entrenamiento, la composicion del dataset de texto, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La finalidad declarada es servir como test de CI para llama.cpp, lo que explica la ausencia de detalles orientados al rendimiento.

## Capacidades

- Procesamiento de imagenes de baja resolucion (32x32 pixeles) y clasificacion en las 10 categorias de CIFAR-10.
- Generacion de texto conversacional en un formato basico, segun la etiqueta `conversational` del repositorio.
- Integracion multimodal imagen-texto, aunque limitada al dominio de CIFAR-10.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Validacion de CI en llama.cpp: el modelo se emplea para comprobar que las rutas de carga de GGUF y de inferencia multimodal funcionan correctamente tras cada cambio en el codigo, gracias a su tamano reducido y a su comportamiento determinista.
- Pruebas de regresion de pipelines multimodales: sirve para verificar que la tokenizacion de imagenes y la fusion de embeddings visuales y textuales no se rompen en nuevas versiones del runtime.
- Banco de pruebas para desarrollo de herramientas GGUF: permite a desarrolladores de utilidades de conversion o cuantizacion validar sus implementaciones con un modelo real pero ligero.
- Docencia y experimentacion en vision-lenguaje: su escala minima facilita entender el flujo completo de un modelo multimodal sin requerir hardware dedicado.
- Test de integracion en entornos con recursos limitados: al caber en cualquier GPU consumer e incluso en CPU, permite ejecutar pruebas automatizadas en runners de CI sin aceleradores.
- Verificacion de compatibilidad de endpoints: la etiqueta `endpoints_compatible` sugiere su uso para comprobar que servidores de inferencia compatibles con la API de Hugging Face gestionan correctamente modelos GGUF multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones GGUF de 4 bits, dado el tamano de 38,3 millones de parametros (aproximadamente 20-40 MB de pesos en Q4).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en dispositivos de bajos recursos.
- Opciones de despliegue: llama.cpp (principal runtime soportado, dado su origen en ggml-org), Ollama y servidores compatibles con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles, aunque por el tamano se espera una latencia de milisegundos en hardware moderno.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (vision-lenguaje de escala minima entrenados sobre CIFAR-10) ni de datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio extremadamente restringido: entrenado exclusivamente sobre CIFAR-10 (imagenes de 32x32 pixeles, 10 clases), por lo que no generaliza a imagenes reales ni a tareas fuera de ese conjunto.
- Riesgo elevado de alucinacion y respuestas sin sentido fuera del dominio de entrenamiento.
- Capacidad conversacional muy limitada por el numero de parametros (38,3 millones).
- No se documentan sesgos conocidos, pero al derivar de CIFAR-10 puede heredar los sesgos de esa base de datos.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue correcto.
- Restricciones de licencia: la WTFPL no impone practicamente ninguna restriccion para uso comercial, pero la ausencia de garantias es total.
- No apto para produccion: su proposito declarado es servir como test de CI, no como modelo de usuario final.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org-dev/tinygemma3-GGUF
- Modelo base: https://huggingface.co/ngxson/tinygemma3_cifar
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- Proyecto llama.cpp (runtime de referencia): https://github.com/ggml-org/llama.cpp
