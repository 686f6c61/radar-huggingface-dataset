# m-yong/Nemotron-3.5-Lightning-30B-A3B-flare

## Resumen

Nemotron-3.5-Lightning-30B-A3B-flare es un paquete de ejecución preparado para el modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4, publicado por el usuario m-yong. No se trata de un modelo nuevo ni de un fine-tune: los pesos son idénticos al checkpoint base de NVIDIA (commit `1de6d84f`), y lo que aporta el paquete es la compilación de kernels CUDA, la captura previa de grafos CUDA y un runtime nativo propio del ecosistema Flare (NVIDIA local-inference) que elimina Python y la compilación en tiempo de petición.

El checkpoint subyacente es un decoder híbrido Mamba-2/attention con expertos enrutados NVFP4 de tipo ReLU al cuadrado sin gating. El paquete empaqueta todo en un único artefacto firmado de aproximadamente 19 GB (`nemotron-lightning-30b-tp1-c4-demo.safetensors`), preparado para una sola GPU, hasta 4 peticiones concurrentes y una ventana de contexto de 262.144 tokens con chunks de prefill de 4.096 tokens.

Su relevancia es de infraestructura más que de modelado: demuestra un patrón de distribución de modelos cuantizados en FP4 con kernels precompilados y firma criptográfica del código GPU embebido. La contrapartida es una portabilidad muy limitada: el paquete no puede cargarse con Transformers, vLLM, SGLang ni llama.cpp, solo con Flare, y está ajustado para una RTX PRO 6000 Blackwell en un límite de potencia concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder híbrido Mamba-2 + attention (6 capas de attention), MoE con expertos enrutados NVFP4 ReLU² sin gating |
| Parametros totales | 30B (según nomenclatura del checkpoint base; no se detalla desglose) |
| Parametros activos | 3B (A3B en el nombre; no se detalla en la información disponible) |
| Longitud de contexto | 262.144 tokens (preparado en el paquete Flare) |
| Tipos de cuantizacion | NVFP4 (checkpoint base ya cuantizado); no se indican otras variantes |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (heredada del checkpoint base) |
| Formato de pesos | safetensors dentro de paquete Flare firmado (~19 GB); no compatible con GGUF ni con formatos estándar de Transformers |

## Arquitectura y entrenamiento

El checkpoint base es un transformer híbrido que combina capas recurrentes Mamba-2 con seis capas de attention, sobre una mezcla de expertos (MoE) con expertos enrutados cuantizados en NVFP4 y activación ReLU al cuadrado sin gating. El paquete Flare ejecuta las capas recurrentes con continuaciones explícitas, las capas de attention sobre páginas KV en FP8 y los expertos por la ruta FP4 b12x. El ajuste de kernels y la captura de grafos se realizan durante la fase de preparación del paquete, de modo que el servicio es un runtime nativo sin Python ni compilación en cada petición.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación: esos datos corresponden a la model card del checkpoint base de NVIDIA, que no forma parte de la información proporcionada. Tampoco se documenta decodificación especulativa; de hecho, el paquete declara explícitamente que no la usa. La innovación destacable es de empaquetado: kernels precompilados, grafos CUDA capturados y firma del código GPU bajo la clave del publicador `m-yong`.

## Capacidades

- Generación de texto: pipeline declarado `text-generation`; el paquete está construido con una receta Nemotron-H solo texto, por lo que no se anuncia soporte multimodal.
- Razonamiento y código: capacidades heredadas del checkpoint base; no se detallan en la información disponible.
- Tool calling / function calling: no disponible en la documentación del paquete.
- Agentes y razonamiento multi-paso: no disponible en la documentación del paquete.
- Multilingüismo: no disponible; los idiomas del checkpoint base no se listan.
- Contexto largo: ventana preparada de 262.144 tokens con prefill en chunks de 4.096 tokens.
- Concurrencia: hasta 4 peticiones simultáneas en una sola GPU según la configuración de referencia.
- Determinismo: ejecuciones repetidas producen salidas idénticas byte a byte.

## Casos de uso

- Servicio de inferencia de contexto largo en una sola GPU: con 262.144 tokens de ventana y prefill por chunks de 4.096, el paquete permite procesar documentos extensos (contractos, expedientes, bases de código) sin fragmentación ni recuperación externa, siempre que el despliegue sea sobre Flare y hardware Blackwell.
- Evaluación de rendimiento de NVFP4 en producción: al ser un artefacto reproducible y determinista, sirve para medir throughput y latencia de una MoE cuantizada en FP4 frente a la línea base registrada del mismo checkpoint en otro motor.
- Despliegue edge o de una sola máquina con requisitos de baja latencia: al no requerir Python ni compilación en tiempo de petición, el arranque y el servicio son predecibles, adecuado para entornos con imágenes de contenedor inmutables.
- Integración en pipelines de CI para comparación de motores: la qualification con 40 prompts a temperatura 0.01, top-p 1.0, seed 1234 y 64 tokens permite usar el paquete como referencia de regresión numérica frente a otras implementaciones.
- Prototipado de asistentes conversacionales de dominio largo: 4 peticiones concurrentes y contexto de 262k permiten mantener sesiones multi-turno con historial extenso en una única tarjeta.
- Distribución controlada de modelos con código GPU firmado: el diálogo de aceptación de la clave del publicador encaja en organizaciones que exigen verificar el origen del código que se ejecuta en GPU antes de autorizarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una qualification interna: 40 prompts a temperatura 0.01, top-p 1.0, seed 1234 y 64 tokens, con coincidencia de respuesta primaria en todos los prompts frente a una línea base registrada del mismo checkpoint en otro motor, divergencia de unos pocos tokens en continuaciones casi empatadas, salidas deterministas byte a byte y una barrida de 30 peticiones servida sin errores.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa aproximadamente 19 GB en disco; la VRAM necesaria para inferencia no se detalla explícitamente, aunque el peso de los pesos en NVFP4 más páginas KV en FP8 y overhead de runtime sitúa el requisito por encima de los 19 GB.
- GPU de referencia: RTX PRO 6000 Blackwell, una sola tarjeta, ajustada a un límite de potencia concreto. El autor advierte que una tarjeta con otro límite de potencia podría favorecer otras elecciones de kernel.
- Compatibilidad consumer: no disponible; no se confirma funcionamiento en RTX 4090 u otras GPU de consumo, y el ajuste está hecho para Blackwell profesional.
- Opciones de despliegue: exclusivamente Flare (`flare run m-yong/Nemotron-3.5-Lightning-30B-A3B-flare@main --gpus 0 --port 8021`). No es cargable con Transformers, vLLM, SGLang ni llama.cpp.
- Latencia y throughput: no disponibles; solo se documenta la concurrencia máxima de 4 peticiones y el tamaño de chunk de prefill de 4.096 tokens.
- Parámetros de muestreo por defecto: temperatura 1.0, top-p 0.95, top-k -1, min-p 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-flare (este paquete) | 30B totales / 3B activos | 262.144 | Paquete Flare firmado, solo Flare | NVIDIA Open Model Agreement | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 (checkpoint base) | 30B totales / 3B activos | no disponible en la información proporcionada | NVFP4, presumiblemente cargable en motores estándar | NVIDIA Open Model Agreement | Hugging Face (NVIDIA) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es contra el checkpoint base, del que este paquete hereda pesos, licencia, datos de entrenamiento, evaluación y propiedades de seguridad. No se dispone de información sobre otros modelos comparables de 30B MoE con cuantización FP4.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: cualquier limitación del checkpoint base (sesgos, alucinación, cobertura idiomática) aplica sin cambios y no está documentada en este paquete.
- Portabilidad nula: no se puede cargar con Transformers, vLLM, SGLang ni llama.cpp; queda atado al runtime Flare y a su versión (`90b5c6d3` más una receta Nemotron-H solo texto que aún no está en el árbol upstream).
- Dependencia de hardware concreto: ajustado para una RTX PRO 6000 Blackwell a un límite de potencia específico; el rendimiento en otras tarjetas no está garantizado.
- Ejecución de código GPU firmado: la primera ejecución exige aceptar la clave del publicador `m-yong` escribiendo el namespace. La firma solo prueba que el paquete lo construyó esa clave, no que el nombre o la fuente sean fiables, por lo que la aceptación es una decisión de confianza explícita.
- Sin decodificación especulativa: el paquete declara explícitamente que no la usa, lo que limita las optimizaciones de latencia disponibles.
- Licencia NVIDIA Open Model Agreement: conviene revisar sus términos antes de uso comercial; el paquete hereda la licencia del checkpoint base y no añade permisos adicionales.
- Concurrencia limitada a 4 peticiones en la configuración de referencia, lo que restringe su uso como servidor de alta carga sin réplicas.
- Idiomas soportados no documentados en la información disponible.
- Paquete con 0 descargas y 0 likes: sin validación comunitaria independiente más allá de la qualification del autor.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/m-yong/Nemotron-3.5-Lightning-30B-A3B-flare
- Checkpoint base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Runtime Flare (NVIDIA local-inference): https://github.com/NVIDIA/local-inference
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
