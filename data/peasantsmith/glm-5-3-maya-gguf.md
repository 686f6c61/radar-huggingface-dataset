# peasantsmith/GLM-5.3-Maya-GGUF

## Resumen

GLM-5.3-Maya-GGUF es una cuantización en formato GGUF del modelo GLM-5.3 desarrollado por Z.ai (zai-org), publicada por el usuario peasantsmith dentro del proyecto comunitario Project Maya. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 753.864.139.008 parámetros totales (unos 744B), de los cuales aproximadamente 40B se activan por token: 256 expertos enrutados por capa, 8 activos, más un experto compartido. Incorpora multi-head latent attention con un indexador de atención dispersa y soporta hasta 1M de tokens de contexto.

El problema que resuelve esta ficha concreta es el de hacer viable la inferencia de un modelo de ~744B parámetros en hardware de consumo y estaciones de trabajo. La cuantización Maya-XS comprime el modelo a 170 GB (frente a los 216,7 GB de la alternativa UD-IQ1_S de unsloth) manteniendo una divergencia KL media de 0,506 respecto al original, lo que la sitúa en la misma fidelidad que dicha alternativa con un 78% de su tamaño. Project Maya complementa la cuantización con un motor que mantiene los expertos más usados en VRAM, el resto en RAM y lee del SSD lo que no cabe, permitiendo ejecutar el modelo con menos memoria que su tamaño total.

Es relevante ahora porque demuestra que modelos frontera de escala MoE extrema pueden desplegarse localmente con pérdidas de calidad medidas y controladas, usando únicamente los cuantizadores oficiales de llama.cpp (ggml) y conservando el bloque NextN (MTP) del modelo original para decodificación especulativa. El modelo es solo texto (GLM-5.3 no tiene torre de visión) y está orientado a agentes, código y conversación en inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con multi-head latent attention y indexador de atención dispersa (glm-dsa) |
| Parámetros totales | 753.864.139.008 (~744B) |
| Parámetros activos | ~40B por token (256 expertos enrutados por capa, 8 activos, más un experto compartido) |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantización | GGUF: expertos enrutados IQ1_S, tensores de capas sensibles y bloque NextN en IQ2_XXS, algunos IQ1_M; atención, indexador, expertos compartidos y capas densas en Q8_0 (salida de atención Q6_K); embeddings Q4_K; salida Q6_K; normas, router y proyección del indexador en F32 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | glm-5.3 (licencia propia de Z.ai, enlazada desde el modelo base) |
| Formato de pesos | GGUF (4 archivos, diseño `glm-dsa` de llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 256 expertos enrutados por capa, de los cuales 8 se activan por token, más un experto compartido. Emplea multi-head latent attention junto con un indexador de atención dispersa, lo que permite gestionar contextos de hasta 1M tokens. El modelo conserva el bloque NextN (MTP, multi-token prediction) del original, utilizado para decodificación especulativa (drafting). No hay torre de visión: es un modelo exclusivamente de texto.

Sobre el entrenamiento del modelo base no se dispone de detalles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. Lo que sí está documentado es el proceso de cuantización: calibración con texto en el formato de chat propio de GLM-5.3 (plantilla de chat, modo thinking y tool calls incluidos), cubriendo tool calls y trazas de agente, código, front-end web y trabajo 3D, respuestas largas, chat y chat multilingüe, con 384 secuencias de 2.048 tokens y un conjunto held-out separado para evaluación. Se calcularon matrices de importancia por experto y capa, se asignaron los bits extra a las capas y tensores más sensibles, y se aplicó redondeo con feedback de error por experto en bloques de 256 pesos, calibrando cada capa sobre la salida de las capas ya cuantizadas. La cuantización se generó desde la release oficial de Z.ai (no desde un archivo recuantizado) con los cuantizadores ggml de llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento con modo thinking y tres niveles de pensamiento configurables (según la documentación de Project Maya).
- Generación de código, incluido trabajo de front-end web y 3D según la composición del dataset de calibración.
- Tool calling / function calling, con soporte en la API compatible con OpenAI y Anthropic de Project Maya.
- Capacidades orientadas a agentes y trazas de agente (etiquetas `agent` y `coding` del repositorio).
- Decodificación especulativa mediante el bloque NextN (MTP) conservado en la cuantización.
- Multilingüe limitado a inglés y chino.
- Solo texto: sin visión, audio ni otras modalidades.

## Casos de uso

- Asistentes de código en local: el modelo puede integrarse en un servidor compatible con la API de OpenAI en `http://127.0.0.1:8080` y usarse desde editores o pipelines de CI/CD, aprovechando sus capacidades de tool calling y su entrenamiento en código y front-end.
- Agentes autónomos multi-paso: las trazas de agente presentes en la calibración y el soporte de tool calls lo hacen adecuado para orquestaciones con varias llamadas a herramientas, con el modo thinking para planificación.
- Procesamiento de documentos largos: la ventana de hasta 1M tokens permite analizar repositorios completos, contratos extensos o hilos de conversación sin trocear.
- Atención al cliente bilingüe inglés-chino: conversaciones multi-turno con contexto largo, desplegado en una estación de trabajo con suficiente VRAM y RAM.
- Experimentación e investigación en local: reproducir el comportamiento de un MoE de ~744B con 170 GB de descarga y un pool de memoria de 192 GB, sin depender de APIs en la nube.
- Evaluación de cuantizaciones extremas: la métrica publicada (KL media 0,506; 81,8% de coincidencia en el token top) permite estudiar el impacto de IQ1/IQ2 en un modelo de gran escala.
- Despliegue en hardware AMD o NVIDIA de gama profesional: Project Maya soporta CUDA desde Tesla V100 y HIP en AMD, incluidos Strix y Gorgon Halo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de calidad publicados son métricas de fidelidad de la cuantización frente al modelo original:

| Métrica | Maya-XS | unsloth UD-IQ1_S |
|---|---:|---:|
| Tamaño | 170,0 GB | 216,7 GB |
| Divergencia KL media vs original | 0,506 | 0,506 |
| Mismo token top que el original | 81,8% | 82,3% |

Medido sobre texto held-out nunca usado para calibración, contra las predicciones exactas de los pesos publicados por Z.ai, con ambos archivos evaluados del mismo modo y sobre los mismos tokens.

## Requisitos de hardware

- Descarga: 170,0 GB en 4 archivos GGUF.
- Pool de memoria recomendado: 192 GB combinados de VRAM y RAM para el modelo completo en memoria; con aproximadamente 176 GB combinados todos los expertos residen en memoria, y por debajo de esa cifra el resto se lee del SSD.
- GPU: NVIDIA desde Tesla V100 en adelante (CUDA, Linux y Windows) y AMD vía HIP (incluidos Strix y Gorgon Halo). Sin soporte para Mac por el momento.
- No cabe en GPUs de consumo convencionales por sí solo; requiere el esquema de offload a RAM y SSD de Project Maya.
- Despliegue: Project Maya v1.1.58 o posterior (script `maya.sh --setup --model glm-5.3-maya-xs` o `START-MAYA.bat` en Windows), que compila el motor para las GPU del sistema y expone dashboard y API compatible con OpenAI y Anthropic en `http://127.0.0.1:8080`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño de archivo | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Maya-GGUF (Maya-XS) | ~744B totales, ~40B activos | Hasta 1M | 170,0 GB | glm-5.3 | Cuantización comunitaria con motor de offload propio |
| GLM-5.3 (original, zai-org) | ~744B totales, ~40B activos | Hasta 1M | No disponible | glm-5.3 | Pesos de referencia de Z.ai |
| unsloth UD-IQ1_S de GLM-5.3 | ~744B totales, ~40B activos | Hasta 1M | 216,7 GB | glm-5.3 | Alternativa de cuantización; misma KL (0,506) |

No se dispone de datos de rendimiento en benchmarks para comparar cualitativamente con otros modelos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Solo texto: no hay torre de visión ni capacidades multimodales.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- La cuantización IQ1_S/IQ2_XXS introduce degradación medible: 81,8% de coincidencia en el token top y KL media de 0,506 respecto al original.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Licencia `glm-5.3` propia de Z.ai: es necesario revisar sus términos para uso comercial antes de desplegar en producción.
- Requiere Project Maya v1.1.58 o posterior; no funciona con llama.cpp estándar sin ese motor o sin el soporte del layout `glm-dsa`.
- Sin soporte para macOS en la versión documentada.
- El rendimiento depende críticamente del ancho de banda de RAM y SSD cuando el modelo excede el pool de memoria disponible.
- Repositorio con 0 descargas y 2 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/peasantsmith/GLM-5.3-Maya-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Project Maya (repositorio): https://github.com/mw00/project-maya
- Documentación de GLM-5.3 en Maya: https://github.com/mw00/project-maya/blob/main/docs/GLM53.md
