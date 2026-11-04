# KeraAI/Kera

## Resumen

Kera es un motor y aplicación de IA local desarrollado por Kera Labs, construido sobre llama.cpp, cuyo objetivo es ejecutar modelos grandes con rapidez en ordenadores personales. Su versión pública es v0.1.0-preview.4, una preview que funciona y ha sido medida en hardware real, aunque no todas sus metas están alcanzadas. No se trata de un modelo de pesos: el repositorio no incluye pesos y Kera ejecuta ficheros GGUF externos (de Hugging Face o los que ya tenga Ollama), cada uno bajo su propia licencia.

Las innovaciones principales son la decodificación especulativa automática (aprovecha la cabecera MTP del propio modelo y copia del chat cuando resulta rentable, descartando los guessers que no compensan), la selección dinámica de backend por mensaje (mide Vulkan y ROCm por modelo y enruta cada petición al más rápido), la persistencia del estado de chat en SSD, el streaming de expertos desde disco para modelos MoE que no caben en memoria y el soporte multiusuario con lectura anticipada de mensajes nuevos.

El proyecto se distribuye como binarios para Windows (Vulkan y add-on ROCm para gfx1151) y Linux, más una app de Mac que compara Kera con Ollama en vivo. El código propio es Apache 2.0 y se apoya en llama.cpp y ggml (MIT), con otras dependencias bajo sus propias licencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia sobre llama.cpp/ggml (no es un modelo; ejecuta GGUF de terceros, incluidos MoE) |
| Parametros totales | no disponible (depende del GGUF cargado) |
| Parametros activos | no disponible (soporta modelos MoE con streaming de expertos) |
| Longitud de contexto | no disponible (limitada por el GGUF y la configuración del motor) |
| Tipos de cuantizacion | no disponible de forma explícita; hereda los formatos GGUF soportados por llama.cpp |
| Idiomas soportados | no disponible (depende del modelo GGUF ejecutado) |
| Licencia | Apache 2.0 (código propio de Kera Labs); llama.cpp y ggml bajo MIT; dependencias con licencias propias |
| Formato de pesos | GGUF (compatible con los ficheros de llama.cpp y Ollama) |

## Arquitectura y entrenamiento

Kera no entrena ningún modelo: es un motor de inferencia construido sobre llama.cpp y ggml que carga ficheros GGUF. Su capa de rendimiento se apoya en cuatro mecanismos. Primero, decodificación especulativa adaptativa: el motor genera conjeturas de los siguientes tokens a partir del contexto del chat y de la cabecera MTP del modelo, mide si cada estrategia aporta ganancia y desactiva las que no. Segundo, enrutado por mensaje entre backends: con el add-on ROCm, `kera serve --backend auto` mide Vulkan y ROCm sobre cada modelo y envía cada petición al backend que la termina antes (chats a Vulkan, documentos largos y sus seguimientos a ROCm). Tercero, caché de estado de chat en SSD, que evita releer la conversación completa tras un reinicio o en un seguimiento. Cuarto, streaming de expertos desde disco para modelos MoE que no caben en memoria, manteniendo en RAM los expertos más usados.

El modo multiusuario (`kera serve --multi-user`) intercala la lectura de mensajes nuevos con documentos largos en curso y deduplica prefijos compartidos entre chats. El servidor expone APIs compatibles con OpenAI y Anthropic, de modo que aplicaciones de chat y agentes existentes pueden conectarse sin cambios. No se dispone de información sobre datasets de entrenamiento, RLHF/DPO ni innovaciones de atención, porque el producto no entrena modelos.

## Capacidades

- Inferencia local de modelos GGUF, incluidos modelos de mezcla de expertos (MoE) de gran tamaño.
- Decodificación especulativa automática con medición de rentabilidad por estrategia.
- Enrutado dinámico de backend por mensaje (Vulkan, ROCm; también CPU) en función de la latencia medida.
- Persistencia del estado de conversación en SSD: seguimientos y reinicios sin reprocesar el historial.
- Streaming de expertos desde disco para modelos MoE que exceden la memoria disponible.
- Modo multiusuario con lectura anticipada de mensajes y compartición de prefijos comunes.
- Servidor compatible con las APIs de OpenAI y Anthropic para integrar clientes y agentes existentes.
- Diagnóstico inicial del equipo (unos 30 segundos) que mide disco, memoria y GPU y recomienda qué modelos ejecutar.
- Compatibilidad con ficheros GGUF ya presentes en instalaciones de Ollama.

## Casos de uso

- Asistente de chat local en estación de trabajo: Kera mantiene el estado de cada conversación en SSD, por lo que los seguimientos responden en 0,43 s (Vulkan) o 0,33 s (ROCm) en el hardware medido, sin releer el historial.
- Análisis de documentos extensos: con un documento de 95.000 palabras, el primer token llega en 138 s con ROCm frente a 303 s de llama.cpp y 144 s de Ollama; el enrutado automático manda los documentos largos a ROCm y los chats a Vulkan.
- Ejecución de modelos MoE mayores que la memoria: el streaming de expertos desde SSD permite cargar modelos que no caben en RAM/VRAM, manteniendo en memoria los expertos más utilizados.
- Servicio multiusuario en equipo compartido: `kera serve --multi-user` permite que varios usuarios trabajen a la vez, intercalando mensajes nuevos con documentos largos y deduplicando prefijos comunes.
- Integración en aplicaciones y agentes existentes: al exponer APIs compatibles con OpenAI y Anthropic, clientes de chat y frameworks de agentes pueden apuntar a `http://127.0.0.1:8080` sin modificar el código.
- Evaluación de hardware antes de desplegar: el diagnóstico inicial de 30 segundos mide disco, memoria y GPU y explica en lenguaje llano qué modelos puede ejecutar el equipo, útil para decidir configuraciones.
- Comparativa de motores en Mac: la app `Kera-vs-Ollama.dmg` enfrenta Kera y Ollama en vivo con un botón, para validar ganancias antes de migrar.

## Benchmarks y rendimiento

Mediciones publicadas en la model card sobre un mini PC Minisforum (AMD Ryzen AI Max, Radeon 8060S, Windows) con Nemotron 3 Nano 30B-A3B (fichero GGUF de 22,8 GB de Ollama, mismos pesos para todos los motores), octubre de 2026:

| Metrica | Kera Vulkan | Kera ROCm | llama.cpp | Ollama |
|---|---|---|---|---|
| Velocidad de escritura, prompts cotidianos (tokens/s) | 66 | 54 | 56 | 41 |
| Primer token en un chat | 0,36 s | 0,32 s | 0,38 s | 1,1 s |
| Primer token tras reinicio | 0,79 s | 0,87 s | 3,0 s | 3,2 s |
| Documento de 95.000 palabras: primer token | 296 s | 138 s | 303 s | 144 s |
| Pregunta de seguimiento sobre el documento | 0,43 s | 0,33 s | 0,41 s | 2,2 s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible, ya que Kera no es un modelo y la calidad depende del GGUF cargado. Las cifras de Mac, NVIDIA y modelos mayores están pendientes de medición según el autor.

## Requisitos de hardware

- VRAM/RAM: depende del GGUF cargado; no se especifican mínimos. Los modelos MoE que no caben en memoria pueden transmitirse desde SSD, a costa de latencia.
- GPU validadas: Radeon 8060S (gfx1151) con Vulkan y con el add-on ROCm en el equipo medido (Ryzen AI Max). Vulkan cubre AMD, NVIDIA e Intel; también hay ruta por CPU.
- Consumer GPU: no se han publicado mediciones en RTX 4090, A100, H100 ni otras GPU de consumo o datacenter; el autor indica que las máquinas NVIDIA y Mac están pendientes de medir.
- Despliegue: binarios para Windows 10/11 (x64), Linux (x64) y una app de Mac para comparar con Ollama; servidor `kera serve` con APIs compatibles con OpenAI y Anthropic; compatible con GGUF de llama.cpp y Ollama.
- Latencia y throughput: 66 tokens/s (Vulkan) y 54 tokens/s (ROCm) con Nemotron 3 Nano 30B-A3B en el hardware medido; primer token entre 0,32 y 0,36 s en chat.
- Almacenamiento: relevante para la caché de estado de chat y el streaming de expertos; el diagnóstico inicial mide la velocidad del disco.

## Comparativa con modelos similares

| Motor | Tipo | Backends | Compatibilidad de pesos | Licencia | Estado |
|---|---|---|---|---|---|
| Kera v0.1.0-preview.4 | Motor de inferencia local | Vulkan, ROCm, CPU | GGUF (llama.cpp, Ollama) | Apache 2.0 (código propio) | Preview; mediciones solo en un equipo AMD Windows |
| llama.cpp | Motor de inferencia local | Vulkan, CUDA, ROCm, Metal, CPU | GGUF | MIT | Maduro y ampliamente adoptado |
| Ollama | Motor y gestor de modelos locales | Vulkan/CUDA/ROCm/Metal según plataforma | GGUF y su propio registro | MIT | Maduro, con catálogo de modelos |
| vLLM | Servidor de inferencia de alto rendimiento | CUDA, ROCm | safetensors, GGUF parcial | Apache 2.0 | Orientado a datacenter y serving multi-usuario |

## Limitaciones y advertencias

- Es una preview (v0.1.0-preview.4): el autor reconoce que no todas las metas están alcanzadas y que faltan mediciones en Mac, NVIDIA y modelos mayores.
- Solo hay cifras publicadas para un equipo concreto (Ryzen AI Max, Radeon 8060S, Windows); el rendimiento en otras GPU no está verificado.
- No incluye pesos: la calidad, los sesgos y las alucinaciones dependen del GGUF cargado y de su licencia, que puede no permitir uso comercial.
- El streaming de expertos desde SSD evita fallos por falta de memoria, pero introduce latencia dependiente de la velocidad del disco.
- El enrutado automático de backend y la decodificación especulativa añaden complejidad operativa; el autor documenta el coste medido de cada modo que sacrifica calidad por velocidad.
- El add-on ROCm está limitado en la documentación a gfx1151 (Radeon 8060S); otras GPU AMD no están cubiertas por esa ruta.
- La app de Mac compila y pasa tests, pero no ha sido medida en un Mac según la model card.
- Compatibilidad de API con OpenAI y Anthropic declarada, pero sin detalle de cobertura de endpoints en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/KeraAI/Kera
- Documentación de benchmarks del proyecto: `docs/BENCHMARKS.md` (incluido en el código fuente)
- Descargas citadas en la model card: `downloads/kera-v0.1.0-preview.4-windows-x64.zip`, `downloads/kera-v0.1.0-preview.4-windows-x64-hip-addon.zip`, `downloads/kera-v0.1.0-preview.4-linux-x64.tar.gz`, `downloads/Kera-vs-Ollama.dmg`, `source/kera-v0.1.0-preview.4-source.tar.gz`
- llama.cpp (base del motor): https://github.com/ggml-org/llama.cpp
- Ollama (compatibilidad de ficheros GGUF): https://ollama.com
