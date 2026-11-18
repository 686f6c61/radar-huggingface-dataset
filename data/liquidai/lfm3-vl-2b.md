# LiquidAI/LFM3-VL-2B

## Resumen

LFM3-VL-2B es un modelo vision-lenguaje (VLM) desarrollado por Liquid AI, disenado especificamente para inferencia en dispositivo (edge) con un total de 1.918 millones de parametros. Combina el modelo de lenguaje LFM3-1.7B (1.730 millones de parametros) con un codificador visual propio de 164 millones de parametros y un proyector de 25 millones, permitiendo entrada conjunta de texto, imagen y video. Se distribuye bajo licencia LFM Open License v1.0 y soporta 16 idiomas, incluido el castellano.

El modelo destaca por ser el primer miembro de la familia LFM con capacidad de comprension de video, ademas de incorporar un modo de razonamiento por pasos (thinking) que mejora el rendimiento en preguntas visuales complejas como matematicas, graficos y problemas de varios pasos. Tambien incluye razonamiento espacial y encarnado (embodied), orientado a aplicaciones roboticas donde es necesario localizar objetos y razonar sobre sus relaciones espaciales.

Su relevancia actual reside en la combinacion de un tamano reducido (apto para GPUs de consumo e incluso despliegue en dispositivo), capacidades multimodales (texto, imagen y video), modo thinking y una ventana de contexto que, segun la informacion disponible, no se especifica en la model card. La fecha de creacion del repositorio es octubre de 2026 y la ultima actualizacion noviembre de 2026, con 26.890 descargas y 289 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con convoluciones y atencion (LFM3) + codificador visual propio |
| Parametros totales | 1.918.181.888 (1,92B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors |

Desglose de parametros segun la model card: 1,73B corresponden al modelo de lenguaje, 164M al codificador visual y 25M al proyector. El modelo de lenguaje consta de 24 capas: 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atencion de ventana deslizante y 6 capas de atencion global. El codificador visual consta de 14 capas (la model card se trunca en "8 gated d...", por lo que el detalle completo de su composicion no esta disponible).

## Arquitectura y entrenamiento

LFM3-VL-2B emplea una arquitectura hibrida para el componente de lenguaje: en lugar de un transformer convencional con atencion completa en todas las capas, combina 13 capas de convolucion corta con compuerta, 5 capas de atencion de ventana deslizante y 6 capas de atencion global. Este diseno reduce el coste computacional y de memoria en secuencias largas, lo que resulta coherente con su orientacion a inferencia en dispositivo. El codificador visual es de desarrollo propio (in-house) y consta de 14 capas, conectado al modelo de lenguaje mediante un proyector de 25M de parametros.

El modelo parte del checkpoint base LiquidAI/LFM3-1.7B-Base y se ha sometido a un post-entrenamiento para convertirse en un modelo vision-lenguaje conversacional. La model card menciona explicitamente la incorporacion de un modo de razonamiento paso a paso (thinking) que el modelo activa antes de responder, lo que sugiere tecnicas de entrenamiento orientadas a razonamiento (posiblemente RL o SFT con cadenas de pensamiento, aunque el detalle no se especifica). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable es la incorporacion de video como modalidad de entrada, algo nuevo en la familia LFM, junto con el razonamiento espacial y encarnado orientado a robotica. No se mencionan tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Comprension de imagenes: el modelo acepta imagenes como entrada y responde preguntas sobre su contenido.
- Comprension de video: primera incorporacion de video en la familia LFM; permite formular preguntas sobre grabaciones, clases, recorridos filmados o clips de camaras.
- Modo thinking: razonamiento paso a paso antes de responder, con mejora en preguntas visuales dificiles (matematicas, graficos, problemas multi-paso).
- Razonamiento espacial y encarnado: localizacion de objetos y razonamiento sobre sus relaciones espaciales, orientado a robotica.
- Generacion de texto conversacional multi-turno.
- Capacidades multilingues en 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo thinking habilita razonamiento multi-paso, pero no se detalla soporte de agentes.
- Capacidades de audio: no disponibles en este modelo (la familia LFM incluye modelos de audio y omni por separado).

## Casos de uso

- Asistencia visual en dispositivo: el modelo puede procesar imagenes capturadas por la camara de un movil o dispositivo embebido y responder preguntas sobre ellas, gracias a sus 1,92B de parametros que permiten inferencia local sin depender de la nube.
- Analisis de video para vigilancia o monitorizacion: permite formular preguntas sobre clips de camaras de seguridad o grabaciones, aprovechando la nueva capacidad de entrada de video para detectar eventos o describir escenas.
- Robotica y navegacion: el razonamiento espacial y encarnado permite localizar objetos y razonar sobre su disposicion relativa, lo que sirve como base para tareas de manipulacion o navegacion en entornos fisicos.
- Educacion y tutoria visual: un estudiante puede subir una foto de un problema de matematicas o un grafico y el modelo, con modo thinking, razona paso a paso para explicar la solucion.
- Accesibilidad: descripcion de imagenes y videos para personas con discapacidad visual, ejecutandose localmente en el dispositivo para preservar la privacidad.
- Analisis de documentos y graficos: interpretacion de tablas, diagramas y figuras en informes, con razonamiento multi-paso para extraer conclusiones.
- Asistencia en campo: tecnicos que fotografian equipos o grabaciones de procedimientos y consultan al modelo sobre el estado o los pasos a seguir, sin conexion a internet.
- Atencion al cliente multimodal: gestion de conversaciones donde el usuario adjunta capturas de pantalla o fotos de productos, con soporte en 16 idiomas incluido el espanol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 1,92B en FP16 requiere aproximadamente 3,8 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 2 GB y en 4 bits alrededor de 1 GB, aunque estos valores no estan confirmados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, asi como para GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: si, por su tamano de 1,92B es probable que quepa en la mayoria de GPUs de consumo actuales, aunque la VRAM exacta depende de la cuantizacion y del procesamiento de video (que incrementa el coste de activaciones).
- Opciones de despliegue: la model card indica compatibilidad con transformers y con endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B | 1,92B | No disponible | Texto, imagen, video | LFM Open License v1.0 | Hugging Face, API y playground de Liquid AI |
| LFM3-1.7B (texto) | 1,73B | No disponible | Texto | LFM Open License v1.0 | Hugging Face |
| Otros VLM de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable. El unico comparable directo documentado es el modelo de lenguaje LFM3-1.7B, del que este VLM deriva y al que anade el codificador visual y el proyector.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos, pero no hay confirmacion oficial.
- Riesgo de alucinacion: no cuantificado en la model card; el modo thinking puede reducir errores en tareas visuales complejas, pero no elimina el riesgo de respuestas incorrectas, especialmente en texto dentro de imagenes o videos de baja calidad.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica, lo que impide evaluar el limite para conversaciones largas o videos extensos. Aunque soporta 16 idiomas, el rendimiento relativo por idioma no esta documentado.
- Restricciones de licencia: la licencia LFM Open License v1.0 es una licencia "other" con terminos propios; es imprescindible revisar el archivo LICENSE antes de un uso comercial, ya que puede incluir restricciones de uso, requisitos de atribucion o limitaciones de despliegue.
- Caveats para produccion: el modelo usa codigo personalizado (tag custom_code), lo que puede requerir versiones especificas de transformers y complicar el despliegue estandar. La model card esta truncada en la descripcion del codificador visual, por lo que faltan detalles tecnicos. No se confirma soporte de motores de inferencia populares como vLLM o llama.cpp, lo que puede limitar el throughput en produccion.
- Procesamiento de video: al ser una capacidad nueva, el coste computacional y de memoria del procesamiento de video puede ser significativamente mayor que el de imagen unica, aunque no se aportan cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo de lenguaje LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- Coleccion LFM3 en Hugging Face: https://huggingface.co/collections/LiquidAI/lfm3
