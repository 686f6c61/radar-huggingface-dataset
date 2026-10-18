# Mhaquehaque/berkelium-qwen3-8b-cad-v1-GGUF

## Resumen

berkelium-qwen3-8b-cad-v1-GGUF es una cuantización GGUF Q4_K_M del modelo Qwen/Qwen3-8B (revisión `b968826d`) a la que se le ha fusionado el adaptador LoRA [berkelium-qwen3-8b-cad-v1](https://huggingface.co/Mhaquehaque/berkelium-qwen3-8b-cad-v1) en fp16. El resultado son pesos completos fusionados, no un adaptador, publicados por el desarrollador independiente K M Mohaimenul Haque (usuario `Mhaquehaque`) bajo licencia Apache 2.0. El repositorio ocupa 5,0 GB y contiene un único fichero de 5,03 GB.

El modelo está especializado en una tarea muy concreta: convertir una petición de ingeniería en un objeto JSON con formato Berkelium DesignProposal. No genera geometría ni realiza validación: la geometría y las comprobaciones las ejecuta el núcleo de Berkelium, de modo que el modelo actúa únicamente como capa de traducción de lenguaje natural a una estructura de datos declarativa. Para que funcione correctamente es necesario usar el system prompt `cad-0.1` (definido en `berkelium_neural/cad/prompts.py`) y desactivar el modo thinking.

Se trata de una publicación experimental y explícitamente no evaluada: el autor indica que la evaluación sobre el conjunto reservado (D-033) está pendiente y advierte de que la cuantización a 4 bits puede alterar las salidas respecto al adaptador original en fp16. El repositorio no registra descargas ni interacciones, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B); no disponible el detalle de capas en la model card |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no documentada en la model card del autor; el modelo base Qwen3-8B declara 32.768 tokens nativos (hasta 131.072 con YaRN) según la documentación de Qwen, extremo no verificado en este fine-tuning |
| Tipos de cuantizacion | GGUF Q4_K_M (único fichero publicado, 5,03 GB); no se ofrecen otros niveles de cuantización |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda el tokenizador y los datos del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (LoRA fusionado en fp16 y posteriormente cuantizado con llama.cpp, commit `9d1878a4`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso de 8.190 millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA (publicado como adaptador independiente) orientado a la generación de propuestas de diseño en formato JSON para el ecosistema Berkelium. Posteriormente, el adaptador se fusionó en los pesos completos en fp16 y el conjunto se cuantizó a Q4_K_M con llama.cpp. El repositorio GGUF, por tanto, contiene pesos fusionados y cuantizados, no un adaptador que deba cargarse por separado.

El autor no publica en esta model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; remite a la ficha del adaptador para los detalles de entrenamiento, hashes de datos y estado del proyecto. No se documenta ninguna innovación técnica propia más allá del ajuste: no hay decodificación especulativa, atención lineal ni modificación arquitectónica conocida. La única particularidad operativa es la dependencia de un system prompt concreto (`cad-0.1`) y la recomendación de operar con el modo thinking desactivado, lo que sugiere que el entrenamiento se realizó sobre ese formato de prompt exacto.

## Capacidades

- Generación de JSON estructurado con el esquema Berkelium DesignProposal a partir de una solicitud de ingeniería en lenguaje natural.
- Interpretación de requisitos mecánicos expresados en texto (dimensiones, tipos de pieza, restricciones) y traducción a parámetros declarativos.
- Conversación multi-turno en el formato del system prompt `cad-0.1`; el repositorio está etiquetado como `conversational`.
- Capacidades generales heredadas de Qwen3-8B (comprensión de texto, razonamiento, código y matemáticas), aunque no han sido evaluadas tras el ajuste ni tras la cuantización.
- Soporte de tool calling y de agentes: no documentado en la model card; presumiblemente heredado del modelo base, sin verificar.
- Capacidades multilingües: no documentadas; dependen del modelo base y no se han evaluado en este fine-tuning.
- Modo thinking desactivado de forma recomendada; no se documenta un modo de razonamiento extendido útil para esta tarea.
- No genera geometría 3D, mallas ni código CAD ejecutable: la geometría y la validación las aporta el núcleo de Berkelium.

## Casos de uso

- Generación de propuestas de diseño en pipelines de text-to-CAD: el modelo recibe la especificación en lenguaje natural y devuelve el JSON DesignProposal que el núcleo de Berkelium convierte en geometría. Es su caso de uso primario y el único para el que fue entrenado.
- Extracción de parámetros de piezas en documentación técnica: a partir de un párrafo de un pliego de condiciones se obtiene una estructura JSON con cotas y restricciones que luego se valida por software.
- Asistente de ingeniería en interfaz conversacional: con el system prompt `cad-0.1` y thinking desactivado, el modelo mantiene un diálogo para refinar progresivamente una propuesta de diseño antes de enviarla al núcleo.
- Normalización de solicitudes heterogéneas: distintos equipos redactan requisitos de formas muy distintas; el modelo los unifica en un esquema JSON común, lo que simplifica la validación posterior y el registro de auditoría.
- Prototipado rápido en本地... (entorno local): al ocupar 5,03 GB en Q4_K_M, se puede ejecutar con Ollama en un portátil con GPU de gama media para experimentar con el flujo completo sin depender de la nube.
- Generación por lotes de propuestas para pruebas de regresión: se pueden producir cientos de DesignProposal a partir de un catálogo de peticiones y pasarlas por el validador de Berkelium para detectar incompatibilidades del esquema.
- Base para nuevos ajustes LoRA: al estar los pesos fusionados y publicados en Apache 2.0, sirve como punto de partida para especializaciones verticales en otros dominios de ingeniería con formato estructurado.
- Integración como paso previo en un agente CAD: el modelo actúa como planificador que emite la estructura de la pieza y delega la ejecución geométrica en herramientas externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la evaluación sobre el conjunto reservado (D-033) está pendiente y que la cuantización a 4 bits puede modificar las salidas respecto al adaptador evaluado. Tampoco se han publicado métricas de calidad del JSON generado, tasas de validez de esquema ni comparaciones con el adaptador en fp16.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6-7 GB para los pesos en Q4_K_M (5,03 GB) más la caché KV; con contextos de 8.000 tokens la cifra se sitúa aproximadamente en 7-8 GB en total (estimación, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para contextos moderados; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10, A100 y H100 sin problema de capacidad.
- Sí cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en tarjetas de 8 GB funciona con contexto reducido.
- Despliegue: llama.cpp, Ollama (comando incluido en la model card: `ollama run hf.co/Mhaquehaque/berkelium-qwen3-8b-cad-v1-GGUF`), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para este fichero; para producción con alto throughput convendría partir de los pesos completos y servir con vLLM, lo que exigiría más VRAM.
- Latencia y throughput: no se publican mediciones. Al ser un modelo de 8,19 B en Q4_K_M, es esperable una generación interactiva en GPU de consumo y más lenta en CPU, pero no hay cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| berkelium-qwen3-8b-cad-v1-GGUF | 8,19 B | no documentado en la model card | Text-to-CAD (JSON Berkelium) | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3-8B (base) | 8,19 B | 32.768 nativos; 131.072 con YaRN segun documentacion de Qwen | Proposito general, razonamiento, codigo, tool calling | Apache 2.0 | safetensors, GGUF en repos derivados |
| Qwen3-4B | 4 B (aprox.) | no disponible en la informacion proporcionada | Proposito general | Apache 2.0 | safetensors, GGUF en repos derivados |
| Adaptador berkelium-qwen3-8b-cad-v1 (fp16) | 8,19 B + adaptador | no disponible | Text-to-CAD (JSON Berkelium) | Apache 2.0 | Adaptador LoRA |

No se dispone de información sobre otros modelos abiertos especializados en text-to-CAD con los que establecer una comparación directa de calidad. Las soluciones comerciales de text-to-CAD no publican pesos ni resultados replicables, por lo que la comparación relevante es frente al modelo base y frente al adaptador en fp16 del mismo autor, que es la referencia de calidad antes de cuantizar.

## Limitaciones y advertencias

- Modelo experimental y no evaluado: el autor declara que la evaluación reservada (D-033) está pendiente; no hay evidencia publicada de su calidad real.
- La cuantización Q4_K_M puede degradar o alterar las salidas respecto al adaptador en fp16, especialmente en una tarea de generación de JSON donde los errores de formato invalidan el resultado.
- Dependencia estricta del system prompt `cad-0.1` y del modo thinking desactivado; usarlo con otro prompt o con razonamiento activado probablemente produzca salidas fuera de esquema.
- El modelo no genera geometría ni valida diseños: cualquier expectativa de CAD real debe pasar por el núcleo de Berkelium, que es código externo no incluido en el repositorio.
- Riesgo de alucinación en los valores numéricos del JSON (cotas, tolerancias, identificadores) y de inventar campos no previstos por el esquema; se recomienda validación con JSON Schema y con el validador del núcleo.
- Idiomas no declarados: el comportamiento fuera del inglés no está documentado ni evaluado.
- Sin tracción comunitaria: cero descargas y cero interacciones en el momento de la consulta, lo que implica ausencia de retroalimentación o reportes de errores.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen3-8B arrastra sus propias condiciones; conviene revisar la ficha de Qwen antes de desplegar en producción.
- No hay métricas de latencia, throughput ni consumo de memoria publicadas; los cálculos de hardware deben validarse en el entorno objetivo.
- La fecha de creación registrada en el repositorio es el 17 de octubre de 2026; verificar la vigencia de la revisión antes de fijar una dependencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mhaquehaque/berkelium-qwen3-8b-cad-v1-GGUF
- Adaptador LoRA original: https://huggingface.co/Mhaquehaque/berkelium-qwen3-8b-cad-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Perfil del autor: https://huggingface.co/Mhaquehaque
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de llama.cpp (herramienta de cuantizacion): https://github.com/ggml-org/llama.cpp
- Documentacion del nucleo Berkelium y del system prompt `cad-0.1`: no disponible (la model card solo referencia la ruta `berkelium_neural/cad/prompts.py`)
