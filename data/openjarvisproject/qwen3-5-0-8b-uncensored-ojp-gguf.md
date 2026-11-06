# OpenJarvisProject/Qwen3.5-0.8B-Uncensored-OJP-GGUF

## Resumen

Qwen3.5-0.8B-Uncensored-OJP-GGUF es una compilacion cuantizada y modificada del modelo Qwen3.5-0.8B de Alibaba, publicada por el proyecto OpenJarvisProject. Parte del modelo abliterado de huihui-ai (Huihui-Qwen3.5-0.8B-abliterated), que elimina los mecanismos de rechazo del modelo original, y anade dos modificaciones propias: un recorte del vocabulario de 248.320 a 48.736 tokens (los que usa el texto en ingles) y una cuantizacion Q5_K_M con matriz de importancia generica (wikitext-2), resultando en un archivo de 401 MB.

El modelo esta pensado para inferencia en dispositivo (on-device) mediante llama.cpp, con un consumo de memoria de aproximadamente 0,7 GB al arrancar y 1,1 GB tras una sesion larga. El recorte de vocabulario tiene un coste medido de calidad en ingles de aproximadamente 0,7%, y la cuantizacion Q5_K_M queda a menos de 0,4% del mismo modelo en Q8_0. El repositorio incluye ademas dos archivos de sondas (probe) para el enrutador y la seleccion de herramientas de OpenJarvis, ajustados especificamente a este archivo GGUF.

Es relevante porque demuestra una via practica para desplegar un modelo conversacional sin rechazos en hardware muy limitado, con un equilibrio medido entre tamano, calidad y capacidades de agente. No obstante, el propio autor advierte de que, con 0,8B parametros, el modelo alucina, olvida detalles en conversaciones largas y es debil en matematicas y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 548.019.008 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (unico archivo publicado, 401 MB) |
| Idiomas soportados | No declarados; el vocabulario se recorto a los 48.736 tokens usados por el ingles (otros alfabetos siguen funcionando en piezas mas pequenas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una derivacion del Qwen3.5-0.8B de Alibaba, un transformer de 548 millones de parametros. Sobre el modelo base se aplico primero una abliteration por parte de huihui-ai, que elimina el entrenamiento de rechazo del modelo original. OpenJarvisProject partio del GGUF f16 generado por mradermacher y aplico dos transformaciones: el recorte del vocabulario de 248.320 a 48.736 tokens (los empleados por el texto en ingles) y la cuantizacion a Q5_K_M con una importance matrix generica calculada sobre wikitext-2.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card no los detalla. La innovacion tecnica destacable es doble: por un lado, el recorte de vocabulario reduce el tamano del embedding y acelera la decodificacion a costa de un 0,7% de calidad en ingles; por otro, la cuantizacion Q5_K_M con imatrix mantiene la calidad a menos de 0,4% del Q8_0 con un archivo de 401 MB. El autor indica que probo una mezcla de pesos con el modelo regular y obtuvo peores resultados en tareas, por lo que se mantuvo la abliteration sin mezclar.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat y roleplay.
- Modo de razonamiento (thinking) activado por defecto en Qwen3.5; se desactiva cerrando un bloque `think` vacio en el prompt con formato ChatML.
- Sin entrenamiento de rechazo: respondio las 18 sondas de rechazo del autor y cumplio entre el 81% y el 88% de 48 prompts de roleplay para adultos (solo adultos que consienten), con un 6-12% de rechazos.
- Soporte de tool calling y seleccion de herramientas mediante el archivo de sonda `tools.json` de OpenJarvis.
- Enrutamiento de peticiones mediante el archivo de sonda `probe.json` (4 rutas) de OpenJarvis.
- Capacidad de agente: en la prueba de agente del autor (48 escenarios de archivo/herramienta/respuesta) obtuvo 46/48, aunque el autor advierte que parte de la prueba ajusto sus propios prompts.
- Capacidades multilingues limitadas por el recorte de vocabulario; otros alfabetos funcionan pero tokenizados en piezas mas pequenas.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Chat y roleplay en dispositivo: el modelo cabe en 0,7-1,1 GB de memoria y funciona con llama.cpp en moviles, Raspberry Pi o portatiles modestos, lo que permite conversaciones sin conexion y sin censura de contenido para adultos.
- Asistente personal local: con el archivo de sonda de herramientas, puede seleccionar entre un conjunto reducido de funciones (leer archivos, ejecutar acciones) en un agente ligero que corre integramente en el dispositivo.
- Enrutamiento de peticiones en un pipeline OpenJarvis: el `probe.json` de 4 rutas permite clasificar la intencion del usuario antes de derivar a un modelo mayor, reduciendo coste y latencia en arquitecturas de mezcla de modelos.
- Prototipado rapido de aplicaciones conversacionales: al ser un GGUF de 401 MB con licencia Apache-2.0, se puede integrar en demos y pruebas de concepto sin infraestructura GPU.
- Generacion de dialogos para videojuegos o narrativa interactiva: el modelo produce respuestas conversacionales coherentes en ingles y admite contenido adulto, util para prototipar NPCs o guiones con moderacion externa.
- Filtrado y clasificacion de texto en ingles en entornos con recursos limitados: su vocabulario recortado al ingles y su bajo consumo lo hacen adecuado para tareas de etiquetado simple en dispositivos edge.
- Evaluacion de tecnicas de abliteration y cuantizacion: sirve como caso de estudio reproducible de como afectan el recorte de vocabulario y la imatrix a la calidad de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas internas:

| Metrica | Resultado |
|---|---|
| Coste de calidad en ingles por recorte de vocabulario | ~0,7% |
| Diferencia de calidad Q5_K_M frente a Q8_0 (ingles) | < 0,4% |
| Sondas de rechazo respondidas | 18/18 |
| Cumplimiento en 48 prompts de roleplay adulto | 81-88% (6-12% de rechazos) |
| Prueba de agente (48 escenarios archivo/herramienta/respuesta) | 46/48 (parcialmente ajustada a los prompts del autor) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,7 GB al arrancar y 1,1 GB tras una sesion larga, segun el autor.
- GPU recomendadas: no se especifican; el modelo esta pensado para CPU mediante llama.cpp. Cualquier GPU consumer con al menos 2 GB de VRAM puede alojarlo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 en adelante) y en CPU de moviles y SBC.
- Opciones de despliegue: llama.cpp (build b-cbe28bb o superior, necesario para soporte de Qwen3.5); compatible con endpoints segun los tags. No se confirma soporte de vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Uncensored-OJP-GGUF | 548 M | no disponible | Apache-2.0 | GGUF Q5_K_M (401 MB) | Abliterado, vocabulario recortado al ingles, sondas OpenJarvis |
| Qwen/Qwen3.5-0.8B | 548 M | no disponible | Apache-2.0 | safetensors y GGUF | Modelo base original, con rechazos y vocabulario completo |
| huihui-ai/Huihui-Qwen3.5-0.8B-abliterated | 548 M | no disponible | Apache-2.0 | safetensors y GGUF | Abliterado sin recorte de vocabulario ni cuantizacion especifica |
| mradermacher (GGUF f16 de Qwen3.5-0.8B) | 548 M | no disponible | Apache-2.0 | GGUF f16 | Punto de partida de la cuantizacion de OJP |

## Limitaciones y advertencias

- Con 0,8B parametros, el modelo alucina con frecuencia, olvida detalles en conversaciones largas y es debil en matematicas y codigo, segun el propio autor.
- El recorte de vocabulario degrada aproximadamente un 0,7% la calidad en ingles y penaliza otros idiomas, que se tokenizan en piezas mas pequenas.
- La abliteration elimina los rechazos: el modelo puede generar contenido para adultos o potencialmente danino. El autor declara que la responsabilidad de uso recae en el usuario.
- El resultado de 46/48 en la prueba de agente esta parcialmente contaminado porque los prompts se ajustaron a la propia prueba; no debe tomarse como una medida independiente.
- No se declaran idiomas soportados oficialmente ni longitud de contexto, lo que dificulta planificar despliegues en produccion.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado sin filtros puede incumplir normativas locales o los terminos de servicio de plataformas de terceros.
- Solo se publica una cuantizacion (Q5_K_M); no hay variantes Q4, Q8 ni f16 en este repositorio.
- Requiere llama.cpp build b-cbe28bb o superior; versiones anteriores no soportan Qwen3.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenJarvisProject/Qwen3.5-0.8B-Uncensored-OJP-GGUF
- Repositorio del proyecto: https://github.com/OpenJarvisProject
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo abliterado de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-0.8B-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
