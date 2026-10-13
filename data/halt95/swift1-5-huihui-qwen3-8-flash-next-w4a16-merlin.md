# halt95/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin es una compilacion cuantizada a 4 bits del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario halt95 como derivado independiente. Combina los pesos de UkisAI (Swift 1.5) con la eliminacion de rechazos (abliteration) de huihui-ai, aplicada unicamente sobre las 96 proyecciones densas de salida, y los empaqueta en el formato Merlin W4A16 para poder servirse en cuatro tarjetas RTX 3090 de 24 GB. El modelo tiene 123.958.298.771 parametros totales (unos 124B) y una arquitectura MoE multimodal con 512 expertos enrutados por capa.

El problema que resuelve es doble. Por un lado, permite ejecutar un modelo de ~124B con contexto completo de 262.144 tokens en hardware consumer Ampere (cuatro RTX 3090), algo que en BF16 requeriria bastante mas VRAM. Por otro, ofrece una variante sin mecanismos de rechazo, pensada para escenarios donde el filtrado de salida se delega en el usuario. Se sirve mediante un motor propio (Flash-Next v2.5.2, versionado en el repositorio del autor) y expone un punto de acceso compatible con la API de OpenAI.

Es relevante ahora porque combina tres tendencias: cuantizacion agresiva W4A16 sobre MoE, contexto largo efectivo (se recupera una aguja de 258K tokens) y soporte multimodal con tool calling heredado de Qwen3. Su licencia no es abierta en sentido estricto (swift-open-license-1.0), y el propio autor advierte que es un derivado no revisado ni respaldado por UkisAI, huihui-ai ni Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) con atencion hibrida y Gated DeltaNet; 512 expertos enrutados por capa; cabeza MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 123.958.298.771 (~124B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (262K; aguja de 258K recuperada) |
| Tipos de cuantizacion | W4A16: expertos enrutados en INT4 (Intel AutoRound); proyecciones GDN out_proj en INT8 por canal; atencion q/k/v, down_proj y gate/up en BF16/INT8; embeddings PLE en FP8; KV cache en FP8 E4M3 con escalas estaticas |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (HuggingFace: license other) |
| Formato de pesos | safetensors, compressed-tensors; libreria vllm; tamano del repo 123.8 GB (checkpoint ~115 GiB) |

## Arquitectura y entrenamiento

El modelo es un derivado de Qwen3.8-Flash-Next, una arquitectura MoE multimodal que Qwen describe como avance de la arquitectura usada en Qwen4. La capa de expertos enrutados consta de 512 expertos por capa, cuantizados en INT4 mediante Intel AutoRound y conservados byte a byte del checkpoint Swift 1.5 W4A16. La atencion utiliza un esquema hibrido con Gated DeltaNet (GDN), cuyas proyecciones de salida se almacenan en INT8 por canal, mientras que las proyecciones q/k/v, gate/up del experto compartido y el resto de proyecciones GDN quedan en BF16 o INT8. La tabla de embeddings n-gram (PLE) se mantiene en FP8 y reside en RAM del host durante el servicio.

El cambio de huihui-ai se recupero tensor a tensor comparando sus pesos con el modelo original, hasta el limite de redondeo de BF16, y se aplico a los tensores de Swift 1.5 en la misma direccion del espacio de salida (reflejada, aproximadamente -0,95x) sobre 96 tensores densos. Los expertos enrutados no se tocaron. La cabeza MTP (INT4, empaquetada in-place) habilita decodificacion especulativa, y el KV cache usa FP8 E4M3 con escalas estaticas calibradas especificamente sobre este checkpoint. El tokenizador es el tokenizer.json original de Qwen, sin modificaciones. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento: mantiene el rendimiento de razonamiento del modelo base (GSM8K 1.319: 96,29 %).
- Codigo y matematicas: soporta tareas de programacion y resolucion de problemas aritmeticos, con parsers de razonamiento de Qwen3.
- Multimodal (vision): procesa hasta 42 imagenes por peticion, pipeline image-text-to-text.
- Tool calling / function calling: integra los parsers de llamada a herramientas de Qwen3 en un unico endpoint compatible con OpenAI.
- Agentes y razonamiento multi-paso: soporta turnos de agente con esfuerzo de razonamiento `xhigh`; el coste en tokens en esos turnos fue 0,86x el de Swift 1.5 (IC 95 % 0,64-1,15).
- Contexto largo: maneja de forma efectiva ventanas de hasta 262.144 tokens (se recupera una aguja de 258K con exactitud).
- Modo de razonamiento ampliado: esfuerzo `xhigh` configurable en el motor de servicio.
- Multilingue: limitado a ingles segun la model card (no declara otros idiomas).
- Sin rechazo (abliterated): comportamiento entrenado para no negarse a peticiones; no aplica filtrado de salida.

## Casos de uso

- Agentes de programacion de contexto largo: el modelo puede mantener en memoria un repositorio completo de decenas de miles de tokens y sostener conversaciones multi-turno con tool calling, integrándose en pipelines de CI/CD mediante el endpoint compatible con OpenAI. Su ventana de 262K tokens evita trocear el codigo en fragmentos.
- Analisis de documentacion tecnica extensa: gracias a la recuperacion fiable a 258K tokens, se puede introducir un manual, un expediente o un libro completo y pedir resumenes o extracciones sin estrategias de RAG fragiles.
- Procesamiento multimodal de documentos: con hasta 42 imagenes por peticion, resulta util para extraer informacion de capturas, diagramas, formularios escaneados o presentaciones combinadas con texto.
- Razonamiento matematico y tutoria asistida: con un 96,29 % en GSM8K, es adecuado para resolver problemas verbales de nivel escolar o como componente en cadenas de verificacion paso a paso.
- Investigacion en seguridad de IA (red teaming): al ser una variante abliterated, sirve para estudiar tasas de rechazo, comportamientos de modelos sin alineamiento defensivo y eficacia de filtros externos, siempre en entornos controlados.
- Despliegue on-premise en hardware consumer: cuatro RTX 3090 de 24 GB permiten servir el modelo con contexto completo sin depender de A100/H100 ni de servicios en la nube, util para laboratorios con presupuesto limitado.
- Generacion de datos sinteticos sin filtros: para tareas de aumento de datos donde se necesita que el modelo no aplique rechazos (con la supervision y el filtrado posteriores a cargo del usuario).
- Simulacion de dialogos abiertos: conversaciones multi-turno donde se requiere un modelo que no bloquee temas sensibles por defecto, con contexto largo para mantener coherencia entre turnos.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Swift 1.5 | Notas |
|---|---|---|---|
| GSM8K (1.319) | 96,29 % | 95,98 % | Misma ejecucion |
| StrongREJECT (278 respuestas juzgadas) | 10,4 % de rechazo | 96,8 % | Swift 1.5 con conteo por palabras clave, no comparable en escala; juez GLM 5.3 Flash, una unica pasada y sin validacion humana |
| XSTest (246 prompts seguros) | 0,4 % de sobrerrechazo (1 de 246) | 3,6 % | Swift 1.5 con conteo por palabras clave |

Datos de eficiencia medidos en cuatro RTX 3090 (TP2 x PP2 + EP, MTP K=3, Flash-Next v2.5.1, 2026-10-11/12):

| Metrica | Valor |
|---|---|
| Decodificacion | 167-179 tok/s desde 4K hasta 261K de contexto |
| Prefill | 5.028 tok/s a 10K; 5.446 tok/s a 100K |
| Coste en tokens (turnos de agente, xhigh) | 0,86x Swift 1.5 (IC 95 % 0,64-1,15) |
| Coste en tokens (GSM8K) | 0,99x Swift 1.5 |
| Pool de KV cache FP8 | 924.993 tokens |

En StrongREJECT se cortaron 35 respuestas de 313 por limite de 8.192 tokens y no se juzgaron; de las 278 restantes, un segundo juez que etiqueto la mitad situa la tasa combinada de rechazo entre el 9,4 % y el 18,7 %. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 71,4 GB repartidos entre las cuatro GPU segun LLM Explorer; el checkpoint ocupa unos 115 GiB en disco.
- GPU recomendadas: 4x RTX 3090 (24 GB, sm_86), sin otro proceso CUDA en las tarjetas. No cabe en una sola GPU consumer. Requiere PCIe peer-to-peer recomendado, aunque no necesita NVLink.
- Memoria del host: 96 GB de RAM; `/dev/shm` de al menos 1 GB.
- Almacenamiento: aproximadamente 250 GB libres.
- Requisitos de software: Linux x86-64 con glibc 2.34 o superior, driver NVIDIA con CUDA 13.0 o superior, Python 3.13 con venv y cabeceras, compilador C/C++, ninja, git y curl.
- Opciones de despliegue: motor propio Flash-Next v2.5.2 del repositorio halt95/qwen38-flash-next-3090s (basado en vLLM), con script `scripts/serve-huihui.sh` y nombre de modelo `flash-next-swift-huihui`. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: decodificacion de 167-179 tok/s de 4K a 261K de contexto; prefill de 5.028 tok/s a 10K y 5.446 tok/s a 100K, con MTP K=3 y configuracion TP2 x PP2 + EP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin) | ~124B (MoE) | 262K | W4A16, compressed-tensors, vLLM | swift-open-license-1.0 | HuggingFace, 0 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | no disponible | no disponible | HuggingFace (modelo base, sin rechazo) |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | no disponible | no disponible | W4A16, Merlin | no disponible | HuggingFace (checkpoint original sin abliteration) |

No se dispone de datos de benchmarks comparativos entre estos modelos mas alla de las referencias a Swift 1.5 incluidas en la model card. Las alternativas de la misma categoria (modelos MoE de ~124B con contexto largo y cuantizacion 4 bits) no estan documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin rechazo: la abliteration se aplico upstream y ningun componente filtra la salida. En StrongREJECT solo rechaza entre el 9,4 % y el 18,7 % de 278 respuestas juzgadas. No debe usarse en contextos donde un rechazo sea la salvaguarda (reglas de privacidad en el prompt de sistema, politicas que un agente deba mantener frente a su usuario, o cualquier tarea que maneje datos o dinero de terceros).
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni de tasas de alucinacion. Como cualquier modelo generativo, puede producir contenido incorrecto con aparente seguridad.
- Limitaciones de idioma: solo declara soporte de ingles. El rendimiento en castellano no esta verificado ni documentado.
- Restricciones de licencia: swift-open-license-1.0 es una licencia "other", no una licencia de codigo abierto estandar. El uso comercial debe revisarse contra el texto completo de LICENSE antes de cualquier despliegue en produccion.
- Derivado independiente: no esta hecho, revisado ni respaldado por UkisAI, huihui-ai ni Qwen. Los autores declinan responsabilidad sobre las salidas.
- Requisitos de hardware estrictos: cuatro RTX 3090 dedicadas, sin otros procesos CUDA, 96 GB de RAM de host y 250 GB de disco. No es desplegable en una sola GPU ni en entornos sin control total sobre el hardware.
- Ecosistema limitado: solo se documenta soporte para el motor propietario Flash-Next v2.5.2; no hay confirmacion de compatibilidad con llama.cpp, Ollama, TGI u otros servidores estandar.
- Dependencia de revisiones fijadas: el proceso de descarga verifica hashes (release/checkpoint-huihui.sha256) y fija una revision concreta, por lo que actualizar el checkpoint exige revisar manualmente el pin.
- Estado del repositorio: 0 descargas y 0 "likes", sin comunidad que haya validado la reproducibilidad de los resultados mas alla de las mediciones del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/halt95/Swift1.5-Huihui-Qwen3.8-Flash-Next-W4A16-Merlin
- Archivo de pesos (ejemplo): https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin/blob/main/model-plefp8-00007.safetensors
- Modelo base Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Abliteration de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Checkpoint Merlin original: https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Checkpoint Swift 1.5 W4A16: https://huggingface.co/halt95/Swift1.5-Qwen3.8-Flash-Next-W4A16-Merlin
- Repositorio del motor (qwen38-flash-next-3090s): https://github.com/halt95/qwen38-flash-next-3090s
- Qwen3.8-Flash-Next (QwenLM): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Kit de despliegue en 3090 (jon-nielsen): https://github.com/jon-nielsen/qwen38-flash-next-3090-kit
- Ficha en LLM Explorer: https://llm-explorer.com/model/halt95%2FSwift1.5-Qwen3.8-Flash-Next-W4A16-Merlin,6yynOfidssjeo3CjYk1324
