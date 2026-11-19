# peasantsmith/GLM-5.3-Maya-GGUF

## Resumen

GLM-5.3-Maya-GGUF es una cuantización en formato GGUF del modelo zai-org/GLM-5.3, desarrollada por el usuario peasantsmith en el marco de Project Maya. El modelo base, obra de Z.ai (zai-org), es un transformer de tipo mixture-of-experts (MoE) con 744 000 millones de parámetros totales y unos 40 000 millones activos por token, 256 expertos enrutados por capa (8 activos más un experto compartido) y una ventana de contexto de hasta 1 millón de tokens. Esta cuantización concreta, denominada Maya-XS, comprime el modelo hasta 170 GB manteniendo una divergencia KL media de 0,506 respecto al original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala frontera (744B) en hardware de consumo mediante una estrategia de offloading híbrido entre VRAM, RAM y SSD, implementada por Project Maya. El archivo conserva todos los expertos y el bloque NextN (MTP) del modelo original para decodificación especulativa, y está pensado para un pool de memoria de 192 GB (VRAM y RAM combinadas).

La cuantización se realizó directamente desde los pesos publicados por Z.ai (no desde un archivo ya cuantizado), usando cuantizadores nativos de llama.cpp (ggml) y el layout `glm-dsa`. El modelo está orientado a generación de texto en inglés y chino, con capacidades declaradas de agente, coding y tool calling, y no incluye torre de visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con multi-head latent attention y indexador de atención dispersa (glm-dsa); bloque NextN (MTP) |
| Parámetros totales | 744 000 millones (modelo base); el dato safetensors del repo indica 6144 (probablemente parámetros por tensor o metadato agregado, no el total) |
| Parámetros activos | ~40 000 millones por token (256 expertos enrutados, 8 activos + 1 compartido) |
| Longitud de contexto | Hasta 1 000 000 tokens (modelo base) |
| Tipos de cuantización | GGUF: expertos enrutados IQ1_S, tensores de capas sensibles y bloque NextN en IQ2_XXS, algunos IQ1_M; atención, indexador, expertos compartidos y capas densas en Q8_0 (salida de atención Q6_K); embeddings Q4_K / salida Q6_K; normas, router y proyección del indexador en F32 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | glm-5.3 (other), la misma del modelo base de Z.ai |
| Formato de pesos | GGUF (4 archivos shard, layout `glm-dsa` de llama.cpp); repo de 170,0 GB |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer de mezcla de expertos con 256 expertos enrutados por capa, de los cuales 8 se activan por token más un experto compartido, lo que da unos 40 000 millones de parámetros activos sobre 744 000 millones totales. Incorpora multi-head latent attention con un indexador de atención dispersa (denominado glm-dsa en el layout de llama.cpp) y un bloque NextN (multi-token prediction) que se conserva en la cuantización para tareas de drafting. La ventana de contexto alcanza hasta 1 millón de tokens.

El proceso de cuantización de Maya-XS se documenta con detalle: calibración con texto en el formato de chat propio de GLM-5.3 (incluyendo thinking y tool calls), con trazas de agente, código, front-end web y 3D, respuestas largas y chat multilingüe, en 384 secuencias de 2048 tokens, reservando un conjunto held-out para evaluación. Se calcularon matrices de importancia por experto, se asignaron bits extra a las capas y tensores más sensibles, y se aplicó redondeo con feedback de error en bloques de 256 pesos, calibrando cada capa sobre la salida de las capas ya cuantizadas. No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable en tres niveles (según la documentación de Project Maya).
- Programación y coding, con calibración específica sobre código y trazas de agente.
- Tool calling / function calling, soportado en el template de chat del modelo y en la API compatible con OpenAI y Anthropic.
- Capacidades de agente y razonamiento multi-paso (tags `agent` y `coding`).
- Decodificación especulativa mediante el bloque NextN (MTP) conservado en la cuantización.
- Multilingüe limitado a inglés y chino.
- Sin capacidades de visión: el modelo no incluye torre de visión.

## Casos de uso

- Asistencia de coding en producción: el modelo puede integrarse en pipelines de CI/CD y editores mediante la API compatible con OpenAI, aprovechando su entrenamiento específico en código y tool calling para generar parches y ejecutar llamadas a herramientas.
- Agentes autónomos multi-paso: con 1M de tokens de contexto y soporte de tool calling, puede mantener trazas largas de agente, planificar subtareas y consultar herramientas externas en flujos de automatización.
- Atención al cliente bilingüe (inglés/chino): conversaciones multi-turno con contexto extenso, adecuado para mercados donde ambos idiomas son relevantes.
- Análisis de documentos largos: la ventana de 1M tokens permite procesar repositorios completos, contratos o bases de código sin truncamiento.
- Generación de front-end y trabajo 3D: la calibración incluyó específicamente web front-end y 3D, lo que lo hace adecuado para prototipado de interfaces y escenas.
- Despliegue local en estaciones de trabajo con mucha memoria: con Project Maya y un pool de 192 GB (VRAM+RAM), se puede ejecutar en hardware de gama alta de consumo o profesional sin depender de la nube.
- Investigación sobre cuantización extrema: el propio archivo sirve como referencia metodológica para estudiar el impacto de IQ1/IQ2 en modelos MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad de la cuantización frente al original:

| Métrica | Maya-XS | unsloth UD-IQ1_S |
|---|---:|---:|
| Tamaño | 170,0 GB | 216,7 GB |
| Divergencia KL media vs original | 0,506 | 0,506 |
| Mismo token top que el original | 81,8 % | 82,3 % |

Las métricas se midieron sobre texto held-out nunca usado para calibración, comparando contra las predicciones exactas de los pesos publicados por Z.ai.

## Requisitos de hardware

- VRAM/RAM: el modelo completo necesita un pool de 192 GB combinados (VRAM + RAM) para tener todos los expertos en memoria; a partir de unos 176 GB combinados todos los expertos caben en memoria, y con menos el resto se lee desde el SSD.
- GPU recomendadas: NVIDIA desde Tesla V100 en adelante (CUDA, Linux y Windows) y AMD (HIP, incluidas Strix y Gorgon Halo). No soportado en Mac.
- GPU de consumo: no cabe en una sola GPU de consumo; requiere configuración multi-GPU o el esquema de offloading de Project Maya con RAM y SSD.
- Despliegue: Project Maya (v1.1.58 o superior) es el entorno previsto, con dashboard en `http://127.0.0.1:8080` y API compatible con OpenAI y Anthropic (streaming, tool calls, tres niveles de thinking). Los archivos son GGUFs estándar en layout `glm-dsa` de llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño del archivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Maya-XS (esta ficha) | 744B totales / ~40B activos | 1M | 170,0 GB | glm-5.3 | GGUF en HF |
| unsloth UD-IQ1_S de GLM-5.3 | 744B totales / ~40B activos | 1M | 216,7 GB | glm-5.3 | GGUF en HF |
| zai-org/GLM-5.3 (original) | 744B totales / ~40B activos | 1M | no disponible | glm-5.3 | Pesos originales en HF |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización extrema (IQ1_S/IQ2_XXS en expertos) introduce degradación: solo el 81,8 % de los tokens top coinciden con el original y la divergencia KL media es de 0,506, lo que puede afectar a tareas sensibles a la precisión.
- Solo soporta inglés y chino; no hay soporte multilingüe adicional declarado.
- Sin capacidades de visión.
- El rendimiento depende críticamente del esquema de offloading: con menos de ~176 GB de memoria combinada, parte del modelo se lee desde SSD, lo que degrada la latencia.
- No funciona en Mac según la documentación de Project Maya.
- La licencia glm-5.3 es de tipo "other"; es necesario revisar los términos del modelo base de Z.ai antes de uso comercial.
- Riesgo de alucinación y sesgos inherentes al modelo base: no se documentan evaluaciones específicas de sesgo en la información disponible.
- El dato de parámetros totales del repo (6144) no coincide con el tamaño real del modelo (744B); conviene tratarlo como metadato no fiable.

## Enlaces

- Hugging Face: https://huggingface.co/peasantsmith/GLM-5.3-Maya-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Project Maya (repositorio): https://github.com/mw00/project-maya
- Documentación de GLM-5.3 en Maya: https://github.com/mw00/project-maya/blob/main/docs/GLM53.md
