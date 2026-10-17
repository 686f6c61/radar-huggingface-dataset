# dragontamer131313/Soulai

## Resumen

`dragontamer131313/Soulai` no es un modelo entrenado, sino un kit de desliegue offline que instala Ollama, descarga el modelo abierto Qwen 2.5 7B de Alibaba y construye encima una variante local llamada `unserndored-local` mediante un `Modelfile` con instrucciones de personalidad y ajustes de muestreo. El autor lo explicita en la model card: "this is not a model UNSERNSOREDapi trained from scratch". Por tanto, el peso real de la inferencia recae en Qwen 2.5 7B y el repositorio solo aporta la capa de persona, los scripts de instalación y dos clientes de terminal (Python y Node).

El interés practico esta en el patron de despliegue: tras una instalación inicial, el sistema funciona sin red, sin clave de API y sin limite de uso, sobre macOS, Linux o Windows, con 4,7 GB de pesos en disco y 8-16 GB de RAM. Es una plantilla util para quien quiera replicar una persona concreta sobre un modelo abierto y servirlo en local, no una aportación nueva de pesos o de arquitectura.

La relevancia es limitada desde el punto de vista de investigación: cero descargas, un like, sin pipeline declarado, sin licencia ni idiomas especificados en el repositorio, y sin resultados de benchmarks propios. Su valor es divulgativo y de empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base Qwen 2.5 7B; el repositorio solo anade un `Modelfile` de persona sobre Ollama |
| Parametros totales | 7,62 B (modelo base Qwen 2.5 7B); no declarado en este repositorio |
| Parametros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen 2.5 7B (extensible a 131.072 con YaRN); no confirmado en la configuracion del kit |
| Tipos de cuantizacion | GGUF. La etiqueta `qwen2.5:7b` de Ollama se distribuye por defecto en 4 bits (~4,7 GB de pesos segun la model card); la libreria de Ollama ofrece variantes de 2 a 8 bits |
| Idiomas soportados | no disponible en el repositorio; el modelo base Qwen 2.5 declara alrededor de 29 idiomas, incluido el espanol |
| Licencia | no disponible en el repositorio; la model card remite a la licencia de Qwen 2.5 7B, que se publica bajo Apache 2.0 (verificar antes de uso comercial) |
| Formato de pesos | GGUF via Ollama; el repositorio no publica safetensors propios |
| Tamano en disco | ~4,7 GB para los pesos |
| Dependencias | Ollama, Python 3 (cliente `chat.py`) o Node 18+ (cliente `chat.mjs`) |
| Fecha de publicacion | 17 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

No hay arquitectura propia ni entrenamiento asociado a este repositorio. El componente que ejecuta la inferencia es Qwen 2.5 7B, un transformer decoder-only de 7,62 B parametros publicado por Alibaba, con atención de grupos de consulta (GQA) y un vocabulario amplio orientado a multilingüismo. El kit se limita a descargar ese modelo a traves de Ollama y a construir una variante local con un `Modelfile` que fija el system prompt, la persona y los parametros de muestreo de la API alojada del autor.

Los datos de entrenamiento del modelo base no se detallan en la informacion proporcionada, y el autor reconoce que entrenar un modelo desde cero exige un cluster de GPUs y un corpus mucho mayor del que un proyecto pequeno puede reunir. Tampoco se documenta ningun proceso de ajuste fino, RLHF o DPO sobre la persona: la "personalidad" es ingenieria de prompts empaquetada, no un cambio de pesos.

La unica innovacion tecnica del repositorio es de caracter operativo: un `setup.sh` idempotente que instala Ollama, descarga pesos y registra el modelo de persona, mas dos clientes de chat de dependencias minimas (solo biblioteca estandar de Python, o Node 18+).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen 2.5 7B.
- Respuesta con una persona fija definida en `system-prompt.txt` y `Modelfile`, replicando el tono de la API alojada del autor.
- Ejecucion completamente offline: sin red, sin clave de API y sin limite de peticiones tras la instalacion.
- Razonamiento, codigo y matematicas de nivel 7B, segun las capacidades del modelo base (no verificadas en este repositorio).
- Capacidad multilingue del modelo base (aproximadamente 29 idiomas, incluido el espanol); no declarada explicitamente en el repositorio.
- Servicio a varios usuarios mediante la API HTTP de Ollama, con historiales independientes gestionados por la aplicacion cliente y control de concurrencia con `OLLAMA_NUM_PARALLEL`.
- No soporta vision: la model card indica que el modelo del kit responde solo a texto y propone cambiar `MODEL` en `setup.sh` por un modelo de vision de la libreria de Ollama.
- No se documenta soporte de tool calling ni de function calling en la configuracion del kit; el modelo base Qwen 2.5 si lo soporta, pero el `Modelfile` publicado no lo configura.

## Casos de uso

- Asistente personal offline en un portatil: el kit instala un chat funcional en local sin conexion, util para entornos con red restringida, trabajo de campo o portatiles con requisitos de confidencialidad.
- Prototipado rapido de una persona conversacional: un equipo puede partir del `Modelfile` y del `system-prompt.txt` para iterar el tono de un asistente antes de invertir en un despliegue mayor.
- Demostraciones comerciales sin dependencia de la nube: al no haber clave de API ni cuota, se puede ensenar el producto en una feria o en una sala de reunion sin wifi y sin coste por token.
- Base para un servicio multi-usuario pequeno: llamando a la API HTTP de Ollama con un historial por `user id` y `OLLAMA_NUM_PARALLEL=4`, se puede atender a un equipo interno con 8-16 GB de RAM en el servidor.
- Sustitucion de una API alojada por motivos de coste o privacidad: si el flujo ya depende de un tono concreto, el kit reproduce esa voz sin enviar datos a terceros.
- Documentacion reproducible de prompts: el repositorio separa persona (`system-prompt.txt`) y sampler (`Modelfile`), lo que facilita versionar instrucciones y comparar respuestas entre configuraciones.
- Banco de pruebas de cuantizaciones: al apoyarse en Ollama, se puede reejecutar el mismo prompt con variantes de 4 y 8 bits para medir la degradacion de calidad en la persona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones propias ni comparaciones con otros modelos. El modelo base Qwen 2.5 7B si dispone de resultados publicados por Alibaba (MMLU, HumanEval, GSM8K, entre otros), pero no se reproducen aqui al no formar parte de la informacion proporcionada ni haber sido verificados sobre esta configuracion de persona y cuantizacion.

## Requisitos de hardware

- Disco: aproximadamente 4,7 GB para los pesos, mas el espacio de Ollama y el modelo de persona.
- RAM: 8 GB descritos como "comodos" por el autor; 16 GB si se elige un modelo de 7 B en cuantizacion alta o se sube el numero de peticiones en paralelo.
- VRAM estimada: unos 5-6 GB para una cuantizacion de 4 bits de un modelo de 7 B, y 8-9 GB para 8 bits (estimacion por tamano; no publicada en el repositorio).
- GPU consumer: cabe en tarjetas de 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en GPUs de 8 GB conviene cuantizacion de 4 bits y contexto moderado.
- GPU de centro de datos: A100, H100 o L40S sobradas para 7 B, aunque no aportan ventaja frente a una consumer para un solo usuario.
- Despliegue: Ollama como via soportada por el kit (`ollama serve`, `ollama run unserndored-local`); llama.cpp es compatible al usar pesos GGUF; vLLM o TGI requeririan los safetensors originales de Qwen 2.5 7B y renunciar al `Modelfile`, trasladando la persona al system prompt del servidor.
- Concurrencia: `OLLAMA_NUM_PARALLEL=4` como ejemplo del autor; cada ranura paralela consume memoria adicional y las peticiones por encima del limite esperan en cola.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Soulai (este repositorio) | 7,62 B (Qwen 2.5 7B) | 32.768 (modelo base) | no disponible (remite a Qwen 2.5 7B) | GGUF via Ollama; 0 descargas | no disponible |
| Qwen 2.5 7B Instruct | 7,62 B | 32.768 (131.072 con YaRN) | Apache 2.0 | safetensors y GGUF; amplia disponibilidad | publicados por Alibaba, no reproducidos aqui |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 | Llama 3.1 Community License | safetensors y GGUF; amplia disponibilidad | publicados por Meta, no reproducidos aqui |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors y GGUF; amplia disponibilidad | publicados por Mistral, no reproducidos aqui |

La comparacion honesta es que Soulai no compite en la misma dimension: los otros tres son pesos publicados con entrenamiento documentado, mientras que este repositorio es una configuracion de persona sobre el primero de ellos. Frente a usar Qwen 2.5 7B directamente, la diferencia es el tono preconfigurado y los scripts de arranque; frente a Llama 3.1 8B o Mistral 7B, la diferencia es la ventana de contexto (32k frente a 128k en Llama) y el ecosistema de herramientas.

## Limitaciones y advertencias

- No es un modelo nuevo: no hay pesos, dataset ni entrenamiento propios. Cualquier evaluacion de calidad mide Qwen 2.5 7B, no una aportacion del autor.
- Incoherencia de nombres: el repositorio se llama `Soulai`, pero la model card describe "UNSERNSOREDapi - offline kit" y el modelo local se registra como `unserndored-local`. Conviene verificar que el contenido corresponde a lo esperado antes de desplegarlo.
- Licencia sin declarar en el repositorio. La model card advierte explicitamente de que "open weights are not always the same thing as open source" y pide comprobar la licencia de Qwen 2.5 7B antes de embarcarlo en un producto comercial.
- Riesgo de alucinacion: inherente a un modelo de 7 B sin mecanismos de verificacion; el `Modelfile` de persona no incorpora salvaguardas documentadas.
- Sesgos: no se documenta ninguna evaluacion de sesgo,toxicidad o seguridad para la persona configurada ni para el modelo base.
- Sin vision: el kit responde solo a texto. La model card sugiere sustituir `MODEL` por un modelo de vision de Ollama, lo que implica descargar otros pesos y validar la persona sobre ese modelo.
- Concurrencia limitada: los dos clientes incluidos son de terminal y mono usuario; para servir a varias personas hay que escribir la capa de aplicacion y gestionar el historial por usuario.
- Sin datos de rendimiento: no hay mediciones de latencia, throughput ni consumo de memoria para esta configuracion concreta.
- Idioma: la ficha y la documentacion estan en ingles y no se declara el conjunto de idiomas soportados por la persona; el comportamiento en espanol dependera del modelo base.
- Madurez: cero descargas, un unico like y actualizacion el mismo dia de la creacion; no hay historial de mantenimiento ni issues que permitan juzgar la estabilidad del proyecto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dragontamer131313/Soulai
- Modelo base referenciado en la model card: Qwen 2.5 7B (`qwen2.5:7b`) de Alibaba, distribuido a traves de la libreria de Ollama (no se proporciona URL directa en la informacion disponible).
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
