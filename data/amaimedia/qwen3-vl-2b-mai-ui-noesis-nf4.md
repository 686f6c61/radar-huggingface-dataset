# AMAImedia/Qwen3-VL-2B-MAI-UI-NOESIS-NF4

## Resumen

El modelo `AMAImedia/Qwen3-VL-2B-MAI-UI-NOESIS-NF4` es un derivado cuantizado en NF4 (4 bits) del modelo `Tongyi/MAI-UI-2B`, un agente GUI multimodal de la familia MAI-UI desarrollada por Alibaba Tongyi. A su vez, `MAI-UI-2B` se basa en `Qwen/Qwen3-VL-2B`, el modelo de visión-lenguaje de la serie Qwen3. AMAImedia lo ha publicado como parte de su plataforma profesional de doblaje multilingüe NOESIS, bajo el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). El modelo está diseñado para automatización de interfaces gráficas (navegador, escritorio, móvil) mediante comprensión de imágenes y generación de acciones, y se utiliza como agente secundario ligero en el subdominio público `ui-agent.amaimedia.com`.

Con 2.127.532.032 parámetros (2,1B) y una ventana de contexto de 262.144 tokens, este modelo destaca por su bajo consumo de VRAM (1,5 GB en inferencia) y su licencia Apache 2.0 que permite uso comercial sin restricciones. Su relevancia actual radica en que ofrece capacidades de agente GUI multimodal en un formato extremadamente ligero, apto para GPUs de consumo como la RTX 3060, y sirve como banco de pruebas para validar recetas LoRA antes de escalar a la variante de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal con torre de vision) |
| Parametros totales | 2.127.532.032 (2,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (mRoPE [24,20,20] interleaved, rope_theta 5M) |
| Tipos de cuantizacion | NF4 (bitsandbytes 4-bit, double-quant, bf16 compute) |
| Idiomas soportados | 119 idiomas y dialectos (cobertura oficial de Qwen3, incluye espanol, ingles, chino, frances, aleman, etc.) |
| Licencia | Apache 2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (un unico archivo de 1,57 GB) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura `Qwen3VLForConditionalGeneration`, un transformer multimodal que combina una torre de vision con un decoder de lenguaje. La torre de vision tiene profundidad 24, dimension oculta 1024, tamaño de parche 16 y aplica "deepstack" en las capas [5, 11, 17]. El componente de texto cuenta con 28 capas, 16 cabezas de atencion, dimension oculta 2048 y utiliza GQA (Grouped Query Attention) con ratio 2:1 y 8 cabezas de clave/valor. El vocabulario tiene 151.936 tokens. La ventana de contexto de 262.144 tokens se logra mediante mRoPE interleaved con rope_theta de 5 millones.

El entrenamiento se hereda de la cadena: `Qwen/Qwen3-VL-2B` (Apache 2.0) → `Tongyi/MAI-UI-2B` (Apache 2.0) → repack BF16 de AMAImedia → cuantizacion NF4. El modelo base MAI-UI se entrena con datos de entornos reales, incluyendo un entorno movil con mas de 100 telefonos fisicos y 150+ aplicaciones, para tareas de automatizacion de GUI. No se especifican detalles sobre RLHF, DPO o el numero exacto de tokens de entrenamiento en la informacion disponible. La cuantizacion NF4 se realizo con `bitsandbytes 0.49.2` aplicando double quantization y computo en bf16.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes y texto para responder preguntas, describir contenido visual y razonar sobre escenas.
- Automatizacion de interfaces graficas (GUI agent): puede interpretar capturas de pantalla y generar acciones para controlar navegadores, aplicaciones de escritorio y dispositivos moviles.
- Automatizacion de navegador y DOM: disenado especificamente para interactuar con el DOM del navegador, navegar paginas web y ejecutar tareas de interfaz.
- Soporte de tool calling y function calling: como agente, puede invocar herramientas y funciones externas para completar tareas.
- Razonamiento multi-paso: capaz de planificar y ejecutar secuencias de acciones complejas en entornos de interfaz.
- Comprension de video: hereda las capacidades de Qwen3-VL para entender dinamicas espaciales y temporales en secuencias de video.
- Multilingue: soporta 119 idiomas y dialectos, incluyendo las principales lenguas europeas, asiaticas y otras de cobertura global.
- Capacidad de agente en entornos reales: unifica escenarios de movil, ordenador, navegador y busqueda profunda (DeepSearch) en un unico modelo.

## Casos de uso

- Automatizacion de navegador en entornos con poca VRAM: el modelo puede controlar un navegador web mediante capturas de pantalla y acciones DOM, ejecutandose en GPUs de consumo como la RTX 3060 con solo 1,5 GB de VRAM, lo que permite desplegar agentes de interfaz en hardware economico.
- Pruebas y validacion de recetas LoRA: al ser la variante de 2B, sirve como banco de pruebas para experimentar con fine-tuning LoRA antes de invertir horas de GPU en la variante de 8B, reduciendo costes de desarrollo.
- Asistente de doblaje multilingue: integrado en la plataforma NOESIS, puede ayudar a navegar interfaces de edicion de audio y video, seleccionar pistas, ajustar parametros y automatizar flujos de trabajo de doblaje profesional.
- Extraccion de informacion de capturas de pantalla: puede analizar imagenes de interfaces, formularios o documentos y extraer datos estructurados, util para automatizacion de procesos de negocio.
- Automatizacion de tareas de escritorio: capaz de controlar aplicaciones de escritorio mediante vision, como rellenar formularios, hacer clic en botones o navegar menus, en entornos sin API de automatizacion.
- Chatbot multimodal de bajo coste: gracias a su tamano reducido y cuantizacion NF4, puede desplegarse en servidores modestos o incluso en edge devices para ofrecer asistencia conversacional con entrada de imagenes.
- Agente de busqueda profunda (DeepSearch): puede combinar navegacion web, lectura de documentos y razonamiento para responder consultas complejas que requieren multiples pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros tests estandarizados. Tampoco se proporcionan comparativas cuantitativas con otros modelos. Se recomienda consultar los repositorios oficiales de Qwen3-VL y MAI-UI para obtener datos de rendimiento del modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,5 GB (segun la model card, objetivo para RTX 3060 6 GB).
- VRAM pico durante la carga: 1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. La model card menciona explicitamente la RTX 3060 6 GB como compatible. Tambien puede ejecutarse en GPUs integradas modernas o en la nube con instancias de bajo coste.
- Cabe en GPUs de consumo: si, en practicamente todas las GPUs de consumo recientes (RTX 2060, RTX 3060, RTX 4060, etc.) e incluso en algunas iGPUs con suficiente memoria compartida.
- Opciones de despliegue: el modelo se carga con `transformers.from_pretrained` usando `device_map={"": 0}` (requisito para NF4). No se mencionan explicitamente vLLM, Ollama o TGI, pero al ser un modelo Qwen3VL, es probable que sea compatible con estos frameworks, aunque no esta confirmado en la documentacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| AMAImedia/Qwen3-VL-2B-MAI-UI-NOESIS-NF4 | 2,1B | 262.144 | NF4 (4-bit) | Apache 2.0 | Agente GUI multimodal ligero |
| Qwen/Qwen3-VL-2B (original) | 2,1B | 262.144 | BF16/FP16 | Apache 2.0 | Vision-lenguaje general, sin especializacion GUI |
| Tongyi/MAI-UI-2B | 2,1B | 262.144 | BF16/FP16 | Apache 2.0 | Agente GUI multimodal, sin cuantizar |
| AMAImedia/Qwen3-VL-8B-MAI-UI-NF4 (hermano mayor) | 8B | 262.144 | NF4 (4-bit) | Apache 2.0 | Agente GUI primario, mayor precision, ~5 GB VRAM |

La comparativa se basa en caracteristicas tecnicas, ya que no hay datos de rendimiento publicados para este modelo concreto. La principal diferencia con el original Qwen3-VL-2B es la especializacion en tareas GUI y la cuantizacion NF4, que reduce el uso de VRAM a aproximadamente la mitad del modelo BF16.

## Limitaciones y advertencias

- Tamano reducido: al ser un modelo de 2B, su capacidad de razonamiento complejo y precision en tareas dificiles es inferior a la de modelos mayores como el de 8B o 32B de la misma familia.
- Cuantizacion NF4: la cuantizacion de 4 bits puede introducir una ligera degradacion en la calidad de las respuestas en comparacion con el modelo BF16 original, especialmente en tareas que requieren matices linguisticos o visuales finos.
- Sesgos potenciales: no se han documentado sesgos especificos, pero al derivar de datos de entrenamiento de Qwen3 y MAI-UI, puede heredar sesgos presentes en esos corpus, particularmente en contextos culturales o de genero.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar contenido falso o inexacto, especialmente en tareas de vision donde la interpretacion de imagenes ambiguas puede llevar a errores.
- Dependencia del ecosistema NOESIS: el modelo esta disenado para un caso de uso especifico dentro de la plataforma NOESIS; su uso fuera de ese contexto puede requerir adaptaciones.
- Limitaciones de idioma: aunque soporta 119 idiomas, la calidad puede variar significativamente entre lenguas mayoritarias y minoritarias, siendo mejor en ingles y chino (idiomas principales del entrenamiento).
- Requisito de carga especifico: la cuantizacion NF4 requiere cargar el modelo con `device_map={"": 0}` y bitsandbytes, lo que puede limitar su uso en entornos sin soporte de CUDA o con versiones antiguas de transformers.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/Qwen3-VL-2B-MAI-UI-NOESIS-NF4
- Repositorio de archivos: https://huggingface.co/AMAImedia/Qwen3-VL-2B-MAI-UI-NOESIS-NF4/tree/main
- GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- GitHub de MAI-UI (Tongyi): https://github.com/Tongyi-MAI/MAI-UI
- Ficha en FriendliAI: https://friendli.ai/models/AMAImedia/Qwen3-VL-2B-MAI-UI-NOESIS-NF4
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- LinkedIn de Ilia Bolotnikov: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl
