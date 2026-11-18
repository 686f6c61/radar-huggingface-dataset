# Edge0/Edge0-35B-A3B-preview

## Resumen

Edge0-35B-A3B-preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Edge0, derivado del Qwen/Qwen3.6-35B-A3B mediante cuantizacion a 4 bits y adaptadores LoRA entrenados por destilacion. Su propuesta central no es tanto el modelo en si como el sistema de inferencia que lo acompana: el framework edge0, que combina offload de expertos a SSD, un prerouter entrenado y adaptadores Recover-LoRA para ejecutar un MoE de 34.660 millones de parametros en menos de 3 GiB de memoria activa, manteniendo el checkpoint completo en almacenamiento.

El modelo esta disenado explicitamente para inferencia en el borde (edge inference): dispone de motores nativos open source para iOS, macOS, Android y Windows, lo que permite desplegar el mismo directorio de modelo en moviles, portatiles y equipos de escritorio. Con 40 capas, 256 expertos con K=4 activos por token y un tamano oculto de 2048, la arquitectura mantiene un ancho de activacion reducido que hace viable el streaming de expertos desde disco.

Es relevante ahora porque demuestra una via practica para llevar modelos de clase 35B a dispositivos con memoria limitada sin recurrir a sharding ni a la precarga completa de pesos en RAM. La version es una preview temprana del pipeline edge0, con una licencia Apache 2.0 permisiva y un arXiv asociado (2609.18063) que documenta los mecanismos de offload y prerouting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE sobre transformer (qwen3_5_moe), 40 capas, 256 expertos, K=4 activos por token |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 4 expertos por token (K=4); numero exacto de parametros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (int4); checkpoint int4 con adaptadores LoRA y prerouter sin fusionar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (base int4 + `lora_edge0_35b.safetensors` + `prerouter_edge0_35b.safetensors`), libreria MLX |
| Tamano oculto | 2048 |
| Tamano del repositorio | 19,7 GB |
| Memoria activa en inferencia | menos de 3 GiB (con streaming de expertos desde SSD) |
| Framework de inferencia | edge0 (backend MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer disperso con 40 capas, 256 expertos y 4 expertos activos por token, con un tamano oculto de 2048. Sobre esa base, Edge0 aplica cuantizacion int4 y entrena dos conjuntos de adaptadores: un LoRA de recuperacion (Recover-LoRA) y un prerouter. El entrenamiento del LoRA se realiza por destilacion desde el profesor en FP16, con el objetivo de recuperar la perdida introducida por la cuantizacion; el autor reporta que el modelo int4 queda a 3,9 puntos de su base fp16. Los adaptadores se mantienen sin fusionar, de modo que una base de solo lectura puede servir a multiples conjuntos de adaptadores.

La innovacion tecnica principal es el sistema de ejecucion, no la topologia del modelo. El offload de expertos a SSD mantiene los pesos completos en almacenamiento y los transmite bajo demanda segun el enrutamiento, de forma que la memoria pico queda acotada por el conjunto activo y no por el numero total de parametros. El prerouter es una cabeza entrenada que predice el enrutamiento de expertos un paso por delante, solapando las cargas desde disco con el forward pass en lugar de bloquearlo; el autor reporta hasta un 59 % de mejora en throughput de decodificacion, con ganancias que crecen con la latencia del almacenamiento, el tamano del modelo y el ancho enrutado K. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.6-35B-A3B; no se detallan capacidades especificas adicionales en la informacion disponible.
- Inferencia en dispositivo con motores nativos para iOS, macOS, Android y Windows, con el mismo checkpoint en todas las plataformas.
- Ejecucion con memoria activa inferior a 3 GiB mediante streaming de expertos desde almacenamiento.
- Carga automatica de base, LoRA y prerouter a traves del framework edge0.
- Soporte de multiples conjuntos de adaptadores sobre una unica base de solo lectura (los adaptadores no se fusionan).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en movil: el modelo puede ejecutarse en iOS y Android con motores nativos y menos de 3 GiB de memoria activa, lo que permite un asistente local sin conexion en telefonos de gama alta.
- Aplicaciones de escritorio con IA integrada: en macOS y Windows, el mismo directorio de modelo se carga sin cambios, lo que simplifica el empaquetado de un asistente o procesador de texto con generacion local.
- Procesamiento por lotes en portatiles: con 140 tok/s de llenado de prompts largos y 15 tok/s de decodificacion, resulta viable para resumir documentos o clasificar texto en equipos sin GPU dedicada de gran capacidad.
- Despliegue con multiples variantes especializadas: al mantener los adaptadores LoRA sin fusionar, una sola base int4 puede servir distintos adaptadores (por ejemplo, dominios o estilos) compartiendo el mismo checkpoint en disco.
- Prototipado de inferencia en el borde: util para investigadores que quieran evaluar tecnicas de offload de expertos y prerouting sobre un MoE real sin infraestructura de centro de datos.
- Escenarios con restricciones de privacidad: al ejecutarse localmente en el dispositivo, los datos del usuario no salen del terminal, lo que encaja con aplicaciones sensibles que no pueden depender de APIs en la nube.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| Velocidad de decodificacion | 15 tok/s |
| Velocidad de llenado de prompt | 140 tok/s |
| Memoria activa pico | menos de 3 GiB |
| Brecha de calidad frente a fp16 | 3,9 puntos |
| Mejora de throughput con prerouter | hasta +59 % en decodificacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM activa: menos de 3 GiB en inferencia con el checkpoint int4 y streaming de expertos; el requisito real es almacenamiento rapido (SSD) para el repositorio completo de 19,7 GB.
- Almacenamiento: aproximadamente 19,7 GB para el checkpoint completo, los adaptadores LoRA y el prerouter.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); el diseno esta orientado a hardware de borde y a los motores nativos de iOS, macOS, Android y Windows.
- Compatibilidad con GPU de consumo: el objetivo declarado es ejecucion en memoria de clase telefonica, por lo que cabe en dispositivos de consumo; no se detallan modelos concretos.
- Opciones de despliegue: framework edge0 con backend MLX (motores nativos para iOS, macOS, Android y Windows). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 15 tok/s de decodificacion y 140 tok/s de prefill; la mejora del prerouter depende de la latencia del almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Edge0-35B-A3B-preview | 34,66 B (MoE, K=4) | no disponible | Apache 2.0 | Inferencia en el borde con offload a SSD y prerouter |
| Qwen/Qwen3.6-35B-A3B (base) | 35 B (MoE) | no disponible | no disponible en la informacion | Modelo base en precision completa |
| Edge0-8B-A1B-preview | no disponible (variante 8B, A1B) | no disponible | no disponible en la informacion | Variante menor del mismo pipeline edge0 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una preview temprana del pipeline edge0; el autor la describe como un lanzamiento inicial, con posibles cambios en el formato y en los adaptadores.
- El rendimiento depende criticamente de la velocidad del almacenamiento: el offload de expertos a SSD introduce latencia que el prerouter solo mitiga parcialmente.
- La cuantizacion int4 conserva una brecha de 3,9 puntos frente al modelo fp16, lo que puede afectar a tareas sensibles a la precision.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues multilingues o con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los adaptadores y del framework edge0 deben verificarse en el repositorio antes de un despliegue en produccion.
- El modelo esta atado al framework edge0 y al backend MLX; no se documenta compatibilidad con otros runners, lo que puede suponer dependencia de una herramienta joven.

## Enlaces

- Hugging Face: https://huggingface.co/Edge0/Edge0-35B-A3B-preview
- Repositorio edge0: https://github.com/Edge0-AI/edge0
- Paper: https://arxiv.org/abs/2609.18063
- Licencia: https://github.com/Edge0-AI/edge0/blob/main/LICENSE
- Motor iOS: https://github.com/Edge0-AI/edge0/tree/main/ios
- Motor macOS: https://github.com/Edge0-AI/edge0/tree/main/macos
- Motor Android: https://github.com/Edge0-AI/edge0/tree/main/android
- Motor Windows: https://github.com/Edge0-AI/edge0/tree/main/windows
- Variante 8B-A1B en Hugging Face: https://huggingface.co/Edge0/Edge0-8b-a1b-preview
- ModelScope (35B-A3B): https://www.modelscope.cn/models/Edge0/Edge0-35B-A3B-preview
- ModelScope (8B-A1B): https://www.modelscope.cn/models/Edge0/Edge0-8B-A1B-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
