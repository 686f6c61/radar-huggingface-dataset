# Ibnfarik/Huihui-Qwen3.6-27B-abliterated-MNN

## Resumen

Huihui-Qwen3.6-27B-abliterated-MNN es un bundle de inferencia en formato MNN del modelo Huihui-Qwen3.6-27B-abliterated, una variante "abliterated" (con los mecanismos de rechazo reducidos) del Qwen3.6-27B de Alibaba. Lo publica Ibnfarik bajo la marca TokForge, orientado a ejecucion on-device en telefonos Android de gama alta con 24 GB de RAM. El paquete incluye los pesos cuantizados a 4 bits con HQQ (block 64) y el codificador visual, de modo que el modelo funciona como VLM (texto e imagenes) sin conexion una vez descargado.

El modelo base es un transformer hibrido de 64 capas que combina atencion lineal (48 capas) con atencion completa (16 capas), hidden size 5120, 24 cabezas de atencion y 4 KV heads, con MRoPE y un sidecar visual DeepStack. La arquitectura declarada es `qwen3_5`. El bundle ocupa 18,9 GB repartidos en 11 ficheros y esta pensado para el runtime MNN, no para Transformers.

Su relevancia radica en llevar un modelo multimodal de 27B a inferencia local en movil mediante cuantizacion agresiva y un runtime optimizado para CPU. No obstante, las pruebas del propio autor indican que solo es practico en telefonos de 24 GB y para generacion de texto corta; los dispositivos de 16 GB cargan el modelo pero agotan el tiempo en prompts largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` hibrida: 64 capas (48 de atencion lineal, 16 de atencion completa), hidden size 5120, 24 cabezas de atencion, 4 KV heads, MRoPE, sidecar visual DeepStack |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4 bits (block 64) en pesos del LM; embeddings en bf16 (16 bits); vision encoder incluido |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN bundle (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `visual.mnn`, `visual.mnn.weight`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con atencion lineal en la mayoria de capas (48 de 64) y atencion completa en el resto, lo que reduce el coste computacional y de memoria del contexto largo. Usa MRoPE (rotary position embeddings multimodales) y un codificador visual DeepStack como sidecar independiente (`visual.mnn`), lo que permite procesar imagenes ademas de texto. El checkpoint original es Qwen3.6-27B de Alibaba; la variante huihui-ai aplica abliteration, una tecnica de edicion de pesos que elimina la direccion de rechazo del espacio de activaciones.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El bundle MNN se genero con la herramienta `llmexport` de MNN con los siguientes ajustes: `--quant_bit 4`, `--quant_block 64`, `--lm_quant_bit 4`, `--lm_quant_block 64`, `--embed_bit 16`, `--hqq` activado y `--seperate_embed` activado. El runtime por defecto usa backend CPU, 4 hilos, baja precision y baja memoria, con embeddings bf16 separados.

## Capacidades

- Generacion de texto conversacional multi-turno (chat).
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`), gracias al codificador visual incluido en el bundle.
- Razonamiento y generacion de codigo, segun las capacidades heredadas del modelo base Qwen3.6-27B.
- Capacidades multilingues limitadas a ingles y chino.
- Inferencia completamente offline en el dispositivo una vez descargado el modelo.
- Ejecucion en Android mediante la app TokForge y en escritorio mediante `llm_demo` de MNN.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente multi-paso en la informacion disponible.

## Casos de uso

- Asistente de chat offline en movil: el modelo se ejecuta en la CPU del telefono mediante TokForge, de modo que las conversaciones no requieren conexion ni envian datos a servidores externos, lo que resulta adecuado para entornos con privacidad estricta.
- Descripcion y analisis de imagenes en local: al incluir el codificador visual, puede recibir una fotografia y texto en el mismo prompt para tareas de captioning o extraccion de informacion, siempre que el dispositivo tenga RAM suficiente.
- Prototipado de VLM en escritorio: con el `llm_demo` de MNN compilado en un ordenador se puede validar el comportamiento del modelo y del pipeline multimodal antes de desplegarlo en movil.
- Pruebas de investigacion sobre modelos abliterated: util para estudiar el efecto de la eliminacion de rechazos en las respuestas de un VLM de 27B en un entorno controlado y aislado.
- Demostraciones de inferencia on-device en ferias o entornos sin conectividad: el bundle funciona sin red tras la descarga, lo que permite mostrar un modelo de 27B corriendo en un telefono de 24 GB.
- Evaluacion de runtimes moviles: sirve como caso de prueba exigente para medir latencia y consumo de memoria de MNN en CPU con un modelo grande y cuantizado a 4 bits.
- Generacion de texto corta en chino o ingles: respuestas breves, aritmetica sencilla y fragmentos de codigo, que son los escenarios que completaron las pruebas del autor en dispositivos de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El bundle incluye `tokforge_benchmarks.json`, descrito como un resumen de las comprobaciones en dispositivo de abril y mayo de 2026, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada: 18,9 GB de descarga; en la practica requiere telefonos de 24 GB de RAM para un uso funcional. Los dispositivos de 16 GB cargan el modelo pero agotan el tiempo en prompts largos.
- GPU recomendadas: no se especifican GPU de escritorio; el runtime por defecto es CPU con 4 hilos. La ruta GPU en MNN es opcional (opt-in).
- Compatibilidad con GPU de consumo: no disponible. El enfoque del bundle es movil (Android), no tarjetas graficas de escritorio.
- Opciones de despliegue: app TokForge (Google Play en Android, TestFlight en iOS) y `llm_demo` de MNN compilado desde el repositorio de Alibaba/MNN con flags `MNN_LOW_MEMORY`, `MNN_CPU_WEIGHT_DEQUANT_GEMM`, `MNN_BUILD_LLM` y `MNN_SUPPORT_TRANSFORMER_FUSE`.
- Latencia y throughput: no disponibles como cifras. Las pruebas cualitativas indican que los telefonos de 24 GB (RedMagic, Redmi) completaron todos los prompts y que los de 16 GB (OnePlus, Lenovo, S26, Pixel) agotaron el tiempo en generacion de parrafos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-27B-abliterated-MNN | 27B | no disponible | MNN 4-bit HQQ | Apache-2.0 | On-device movil (VLM) |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | 27B | no disponible | safetensors (checkpoint) | Apache-2.0 | Checkpoint abliterated para entrenamiento/inferencia estandar |
| Qwen/Qwen3.6-27B | 27B | no disponible | safetensors | Apache-2.0 (segun herencia declarada) | Modelo base multimodal de Alibaba |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: los mecanismos de rechazo han sido reducidos, por lo que puede generar contenido que un modelo alineado rechazaria. Requiere politica de producto, controles de usuario y cumplimiento de la legislacion local.
- Tamano y velocidad: en movil se ejecuta en CPU por defecto y solo es practico en telefonos de 24 GB; en dispositivos de 16 GB los prompts largos agotan el tiempo.
- La entrada de imagen esta incluida en el bundle, pero no formo parte de las comprobaciones en dispositivo de TokForge, por lo que su comportamiento real en movil no esta validado.
- Es un bundle de runtime MNN, no un checkpoint estandar de Transformers; no puede cargarse directamente con `transformers`.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por la variante abliterated recae en el desplegador.

## Enlaces

- Hugging Face: https://huggingface.co/Ibnfarik/Huihui-Qwen3.6-27B-abliterated-MNN
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.6-27B
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (TokForge): https://testflight.apple.com/join/jnufjzRr
- Repositorio MNN: https://github.com/alibaba/MNN
- Coleccion TokForge Qwen Models (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-qwen-models-mnn-69cc8b98317551109a7ae907
- Coleccion TokForge Vision Models: https://huggingface.co/collections/darkmaniac7/tokforge-vision-models-6af3fdd73fff746c25bdd4fd
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
