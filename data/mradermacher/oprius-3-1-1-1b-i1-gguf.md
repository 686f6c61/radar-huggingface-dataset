# mradermacher/Oprius-3.1-1.1B-i1-GGUF

## Resumen

Oprius-3.1-1.1B-i1-GGUF es una colección de cuantizaciones en formato GGUF con matriz de importancia (imatrix) del modelo Oprius-3.0-1.1B, publicado por el usuario mradermacher en Hugging Face. El modelo base fue entrenado por zzzekryo sobre una arquitectura del tipo TinyLlama de 1,1 mil millones de parámetros, utilizando el dataset zzzekryo/conversation-and-web-examples-ForOprius, orientado a conversación general y asistencia. Este repositorio no es un modelo nuevo, sino la versión cuantizada que permite ejecutar el modelo en hardware modesto, incluso en portátiles sin GPU dedicada.

Su relevancia reside en la accesibilidad: con cuantizaciones que van desde los 0,4 GB (IQ1_S) hasta aproximadamente 1 GB (Q6_K), el modelo puede desplegarse en prácticamente cualquier equipo consumer mediante llama.cpp, Ollama o LM Studio. Es una opción útil para prototipado de chatbots ligeros, pruebas de inferencia local y casos donde la latencia y el consumo importan más que la máxima calidad de generación. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo TinyLlama (no disponible el detalle exacto) |
| Parametros totales | 1.100.048.384 (~1,1B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existe el original en safetensors/transformers en el repo base) |

## Arquitectura y entrenamiento

El modelo base, zzzekryo/Oprius-3.0-1.1B, se etiqueta como "tinyllama", lo que indica una arquitectura transformer decoder-only derivada o inspirada en TinyLlama, con aproximadamente 1,1 mil millones de parametros. Los datos concretos sobre numero de capas, dimensiones ocultas o longitud de contexto no estan disponibles en la informacion proporcionada.

El entrenamiento se realizo sobre el dataset zzzekryo/conversation-and-web-examples-ForOprius, que combina ejemplos de conversacion con contenido web, orientado a dialogo general y asistencia. No hay informacion disponible sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre el numero de tokens de entrenamiento. La contribucion de mradermacher consiste en la generacion de cuantizaciones imatrix (importance matrix), una tecnica de llama.cpp que calcula una matriz de importancia a partir de datos de calibracion para asignar mejor la precision durante la cuantizacion, obteniendo mayor calidad que las cuantizaciones estaticas a igual tamaño.

## Capacidades

- Generacion de texto conversacional: entrenado para dialogo general y asistencia ("general_help", "general_conversation").
- Conversacion multi-turno en ingles, al estar el dataset limitado al idioma ingles.
- Ejecucion eficiente en CPU gracias al formato GGUF, con soporte de aceleracion parcial en GPU.
- Compatibilidad con el ecosistema llama.cpp, Ollama, LM Studio y cualquier runtime que consuma GGUF.
- No hay informacion disponible sobre soporte de tool calling, function calling, capacidades agenticas, vision o audio.

## Casos de uso

- Chatbot ligero en local: con la variante Q4_K_M (0,8 GB) se puede ejecutar un asistente conversacional en un portatil sin GPU, ideal para pruebas de producto sin coste de API.
- Integracion en aplicaciones de escritorio: el tamaño reducido permite embeber el modelo en apps distribuidas al usuario final (Electron, nativas) sin descargas pesadas.
- Prototipado rapido de prompts: la baja latencia en CPU permite iterar rapidamente sobre plantillas de prompt antes de migrar a modelos mayores.
- Sistemas de respuesta automatica en ingles: gestion de consultas simples de atencion al cliente en entornos donde el volumen no justifica un modelo grande y la privacidad exige inferencia local.
- Generacion de texto en dispositivos edge: despliegue en mini PC, Raspberry Pi de gama alta o SBC con poca RAM gracias a las variantes IQ1/IQ2 de 0,4-0,5 GB.
- Datos sinteticos y relleno de dialogos: uso como generador de conversaciones de ejemplo para pruebas de pipelines de datos en ingles.
- Ensenanza y experimentacion: base practica para aprender sobre cuantizacion, comparando variantes IQ y K en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,5 GB (IQ1_S/IQ1_M, 0,4 GB de archivo) hasta ~1,2 GB (Q6_K, 1,0 GB de archivo), mas el KV cache segun longitud de contexto. Ejecutable integramente en RAM sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con 2 GB de VRAM (por ejemplo, GTX 1650 o superior) permite offload completo del modelo.
- Consumer GPU: cabe con holgura en praticamente cualquier GPU moderna, incluidas RTX 3060, RTX 4060 y superiores; incluso iGPUs modernas pueden gestionarlo.
- CPU: viable en procesadores de escritorio o portatil convencionales; con variantes IQ2/IQ3 funciona en equipos con 4 GB de RAM libres.
- Opciones de despliegue: llama.cpp (nativo al ser GGUF), Ollama, LM Studio, llama-cpp-python, KoboldCpp. No es un objetivo natural para vLLM o TGI, orientados a pesos HF/GPU.
- Latencia y throughput: no disponibles como mediciones publicadas; al ser un modelo de 1,1B cuantizado, se esperan velocidades de decodificacion de decenas de tokens por segundo en CPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Oprius-3.1-1.1B (este, cuantizado) | 1,1B | GGUF imatrix | Apache 2.0 | No disponible | Especializado en conversacion general en ingles |
| TinyLlama-1.1B-Chat (base de la familia) | 1,1B | safetensors y GGUF comunitarios | Apache 2.0 | 2.048 tokens | Arquitectura Llama, amplio ecosistema |
| Qwen2.5-1.5B-Instruct | 1,5B | safetensors y GGUF comunitarios | Qwen license (uso comercial permitido con condiciones) | 32.768 tokens | Mejor rendimiento general y multilingue |
| Llama-3.2-1B-Instruct | 1,2B | safetensors y GGUF comunitarios | Llama 3.2 Community License | 128.000 tokens | Contexto muy superior, restricciones de licencia |

Oprius-3.1 destaca por la licencia Apache 2.0 sin condiciones y por la amplia gama de cuantizaciones imatrix, pero frente a alternativas como Qwen2.5-1.5B o Llama-3.2-1B probablemente ofrezca menor rendimiento y un contexto mas corto, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado solo en ingles; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea pobre.
- Alucinaciones: al ser un modelo de 1,1B entrenado con un dataset poco documentado, el riesgo de alucinacion es alto; no apto para respuestas factuales criticas sin verificacion.
- Sesgos: hereda los sesgos del dataset de conversacion y web usado en el entrenamiento, sin documentacion de mitigacion disponible.
- Contexto: la longitud de ventana de contexto no esta publicada; debe verificarse en la config del modelo antes de disenar aplicaciones con documentos largos.
- Calidad de cuantizacion: las variantes IQ1/IQ2 (0,4-0,5 GB) degradan notablemente la calidad; mradermacher las marca como "para desesperados" y recomienda Q4_K_S/Q4_K_M como punto optimo.
- Origen poco documentado: el modelo base carece de model card detallada (datos de entrenamiento, alineacion, benchmarks), lo que dificulta evaluar su fiabilidad para produccion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes; no se identifican caveats legales.

## Enlaces

- Repositorio cuantizado (este): https://huggingface.co/mradermacher/Oprius-3.1-1.1B-i1-GGUF
- Modelo base: https://huggingface.co/zzzekryo/Oprius-3.0-1.1B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Oprius-3.1-1.1B-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Oprius-3.1-1.1B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/zzzekryo/conversation-and-web-examples-ForOprius
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
