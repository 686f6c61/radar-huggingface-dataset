# inference-optimization/GLM-5.3-Flash-0.1B-A0.1B

## Resumen

GLM-5.3-Flash-0.1B-A0.1B es un modelo diminuto creado por el usuario inference-optimization como versión de prueba del modelo multimodal GLM-5.3-Flash de Z.ai (320B parámetros totales, 18B activos). Con solo 84,36 millones de parámetros, reproduce la arquitectura completa del modelo base —atención híbrida KDA lineal y sparse MLA, mezcla de capas densas y MoE, Hyper-Connections con restricción de colector, torre de visión y proyector multimodal— pero con dimensiones drásticamente reducidas (hidden size de 256, 5 capas de texto, 2 capas de visión). El checkpoint está en bf16, sin cuantización fp8, y se ha inicializado aleatoriamente y fine-tuneado con un pequeño dataset de texto hasta alcanzar una perplejidad de 1.05.

Este modelo no tiene capacidades reales de lenguaje ni visión: es una maqueta estructural pensada exclusivamente para desarrollo y pruebas de herramientas (cuantización, servidores de inferencia, integración en CI). Su interés radica en que conserva la nomenclatura de tensores y la disposición de capas del modelo original, lo que permite validar pipelines de conversión, carga y despliegue sin necesidad de ejecutar el modelo completo de 320B. No debe usarse en producción ni para tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (`Glm5NextForConditionalGeneration`) |
| Parametros totales | 84.361.966 |
| Parametros activos | 84.361.966 (MoE: 4 de 8 expertos enrutados + 1 experto compartido por capa sparse) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantizacion fp8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (un unico archivo `model.safetensors`, 223 tensores) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de GLM-5.3-Flash a escala reducida. La capa de texto combina atención lineal KDA (`linear_attention`) y atención sparse DeepSeek / MLA (`deepseek_sparse_attention`) con un indexador de tokens. El bloque FFN alterna capas densas (las tres primeras) y capas MoE sparse (las dos últimas) con 8 expertos enrutados y 1 experto compartido. Cada sitio de atención y FFN incorpora Hyper-Connections con restricción de colector (mHC). La torre de visión (`Glm5NextVisionModel`) y el proyector multimodal están presentes pero con dimensiones reducidas (2 capas, hidden size 128). El vocabulario se mantiene intacto (154.880 tokens).

El proceso de creación consistió en construir una configuración reducida a partir de la configuración base, eliminar la cuantización fp8, inicializar pesos aleatoriamente y fine-tunear solo con texto sobre un pequeño dataset de copypasta hasta que la perplejidad de entrenamiento convergió por debajo de 3.0 (perplejidad final validada: 1.05). El fine-tuning fue exclusivamente textual; la torre de visión quedó con pesos aleatorios. No se incluye la capa MTP (multi-token prediction) del modelo original, ya que la implementación de transformers no la construye.

## Capacidades

- Generacion de texto: limitada a reproducir fragmentos del dataset de entrenamiento (p. ej., el texto de prueba "According to all known laws..." se completa correctamente). No hay capacidad linguistica general.
- Razonamiento, matematicas, codigo: ninguna.
- Vision: ninguna, la torre de vision no ha sido entrenada.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingue: no aplicable.
- Capacidades especiales: ninguna. El modelo solo sirve para validar la carga del checkpoint, la estructura de tensores y el flujo de inferencia en herramientas de desarrollo.

## Casos de uso

- Pruebas de integracion en CI/CD: permite verificar que un pipeline de carga de modelos con arquitectura GLM-5.3-Flash funciona correctamente sin consumir los recursos del modelo completo. Se puede ejecutar en segundos y comprobar que los tensores se cargan, que la generacion produce salidas coherentes y que no hay errores de dimensiones.
- Desarrollo de herramientas de cuantizacion: al ser un checkpoint bf16 sin escalas fp8, sirve para probar algoritmos de cuantizacion (GPTQ, AWQ, etc.) sobre una arquitectura que incluye MLA, MoE y atencion lineal, validando que las capas se transforman correctamente.
- Pruebas de servidores de inferencia (vLLM, TGI, llama.cpp): se puede desplegar en local para comprobar la compatibilidad del servidor con el tipo de modelo `glm5_next`, la gestion de pesos MoE y la atencion hibrida, antes de escalar al modelo real.
- Validacion de conversion de formatos: al conservar la nomenclatura de tensores del modelo original (sin `weight_scale_inv` ni capa MTP), es util para probar convertidores a GGUF, ONNX o TensorRT y detectar discrepancias de nombres o formas.
- Depuracion de fallos de memoria: al ser extremadamente pequeno (0.2 GB), permite reproducir errores de asignacion de memoria o de gestion de dispositivos en entornos con recursos limitados.
- Educacion y demostraciones: sirve para ilustrar la estructura interna de un modelo MoE multimodal moderno (atencion hibrida, Hyper-Connections, indexador) sin necesidad de hardware potente, facilitando la comprension de la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion reportado es la perplejidad de 1.05 sobre el dataset de entrenamiento, que no es indicativo de capacidad general.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en bf16 (84M parametros, 0.2 GB de peso). Cabe en cualquier GPU moderna, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, o incluso integradas). No requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: total, es un modelo de juguete.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta). Cualquier framework que soporte `glm5_next` con transformers >= 5.16.0.
- Latencia y throughput: no se han medido, pero al ser 84M parametros, la generacion es practicamente instantanea en GPU y muy rapida en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Uso previsto |
|---|---|---|---|---|---|
| GLM-5.3-Flash-0.1B-A0.1B (este) | 84M | no disponible | glm5_next (hybrid KDA + sparse MLA, MoE) | MIT | Testing y desarrollo de tooling |
| zai-org/GLM-5.3-Flash (base) | 320B total, 18B activo | 1M tokens | glm5_next (hybrid KDA + sparse MLA, MoE) | MIT | Produccion multimodal |
| Otros tiny models (p. ej., SmolLM2-135M) | 135M | 2K-8K | transformer denso | Apache 2.0 | Experimentacion ligera |

La comparativa directa con el modelo base es la mas relevante: este tiny model es una reduccion estructural del GLM-5.3-Flash, con la misma arquitectura pero sin capacidades. No existe un equivalente exacto en el ecosistema; los tiny models habituales (SmolLM, TinyLlama) son transformers densos clasicos, no replican la complejidad de GLM-5.3.

## Limitaciones y advertencias

- Modelo sin capacidades reales: esta inicializado aleatoriamente y fine-tuneado con datos de juguete. No debe usarse para ninguna tarea de lenguaje, vision o razonamiento.
- Sesgos: no aplicable, al no tener conocimiento del mundo.
- Riesgo de alucinacion: irrelevante, el modelo solo reproduce fragmentos del dataset de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; al ser una reduccion, probablemente sea muy corta, pero no hay dato confirmado.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion, pero el modelo no es util para produccion.
- Requiere `transformers >= 5.16.0` para registrar el tipo `glm5_next`. Versiones anteriores fallaran al cargar.
- La torre de vision no esta entrenada; cualquier entrada multimodal producira salidas sin sentido.
- No incluye capa MTP ni tensores de escala fp8, por lo que no es compatible con pipelines que esperen el checkpoint original completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B
- Modelo base (zai-org/GLM-5.3-Flash): https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentacion de GLM-5.3-Flash en Unsloth: https://unsloth.ai/docs/models/glm-5.3
- Articulo de openlm.ai sobre GLM-5.3: https://openlm.ai/glm-5.3/
- Receta vLLM para GLM-5.3-Flash: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Blog de explainx.ai sobre el lanzamiento de GLM-5.3-Flash: https://www.explainx.ai/blog/glm-5-3-flash-ox-alpha-official-launch-august-2026
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
