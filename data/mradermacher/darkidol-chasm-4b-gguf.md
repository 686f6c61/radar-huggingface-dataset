# mradermacher/Darkidol-Chasm-4B-GGUF

## Resumen

Darkidol-Chasm-4B-GGUF es una cuantizacion estatica en formato GGUF del modelo aifeifei798/Darkidol-Chasm-4B, publicada por mradermacher. El modelo original es un ajuste fino (fine-tune) de la familia Gemma de Google, orientado especificamente a roleplay y conversacion, con integracion pensada para herramientas como SillyTavern. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y otros runners compatibles, algo imposible con los pesos originales en precision completa.

El modelo base cuenta con 3.880.263.168 parametros (aproximadamente 3,9 mil millones), lo que lo situa en la gama de modelos pequenos y ligeros. La cuantizacion la ha realizado mradermacher, un actor conocido en el ecosistema por publicar versiones GGUF e imatrix de numerosos modelos. El repositorio incluye 13 variantes de cuantizacion, desde Q2_K (1,8 GB) hasta f16 (7,9 GB), ademas de ficheros mmproj para funcionalidad multimodal.

La relevancia de esta ficha radica en que permite desplegar un modelo de roleplay especializado en equipos modestos, con un rango de cuantizaciones que abarca desde configuraciones muy comprimidas hasta opciones de alta fidelidad. El modelo esta etiquetado unicamente para ingles y su licencia es la Gemma, lo que impone restricciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma; detalles especificos no disponibles) |
| Parametros totales | 3.880.263.168 (~3,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo original aifeifei798/Darkidol-Chasm-4B es un fine-tune sobre la arquitectura Gemma de Google, segun indican las etiquetas del repositorio (gemma, google). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. Las etiquetas sugieren un enfasis en roleplay y uso con SillyTavern, y la mencion a unsloth indica que el ajuste fino pudo realizarse con esa libreria de entrenamiento eficiente.

La cuantizacion publicada por mradermacher es de tipo estatico (static quants), generada a partir de los pesos en formato Hugging Face (convert_type: hf). El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (Darkidol-Chasm-4B-i1-GGUF). Se incluyen ficheros mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere que el modelo base tiene capacidad multimodal, aunque no se detalla en la informacion disponible que tipo de modalidad (vision u otra).

## Capacidades

- Generacion de texto conversacional orientada a roleplay, segun las etiquetas del repositorio (roleplay, sillytavern).
- Integracion con SillyTavern, cliente popular para roleplay con modelos de lenguaje.
- Soporte multimodal: el repositorio incluye ficheros mmproj, lo que indica capacidad de procesar entradas multimodales (tipo especifico no disponible).
- Capacidades multilingues limitadas al ingles (language: en).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o razonamiento multi-paso en la documentacion proporcionada.
- No se dispone de informacion sobre modo thinking, audio u otras capacidades especiales.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado para mantener personajes y conversaciones multi-turno, y su formato GGUF permite ejecutarlo en local con llama.cpp o SillyTavern, sin depender de APIs externas.
- Prototipado de chatbots de personaje: gracias a las cuantizaciones ligeras (Q4_K_S, 2,5 GB), se puede desplegar en portatiles con GPU modesta para iterar rapidamente sobre disenos de personalidad y prompts.
- Experimentacion con modelos multimodales en hardware de consumo: los ficheros mmproj permiten probar entradas multimodales en equipos que no podrian cargar el modelo en f16.
- Educacion e investigacion sobre cuantizacion: el repositorio ofrece 13 variantes que permiten estudiar el impacto de la cuantizacion en calidad y rendimiento sobre un mismo modelo base.
- Despliegue en entornos con recursos limitados: la variante Q2_K (1,8 GB) permite ejecutar el modelo en dispositivos con poca memoria, aunque con perdida de calidad.
- Generacion de dialogos para videojuegos o narrativa interactiva: el enfoque en roleplay lo hace adecuado para prototipos de NPCs conversacionales en ingles.
- Evaluacion comparativa de fine-tunes de Gemma: sirve como caso de estudio de como un fine-tune tematico se comporta tras distintas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion):
  - Q2_K: ~1,8 GB de pesos, ~2,5-3 GB de VRAM total con contexto moderado.
  - Q4_K_M: ~2,6 GB de pesos, ~3,5-4 GB de VRAM total.
  - Q8_0: ~4,2 GB de pesos, ~5-6 GB de VRAM total.
  - f16: ~7,9 GB de pesos, ~9-10 GB de VRAM total.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para cuantizaciones Q4-Q5; 12 GB o mas (RTX 3060 12GB, RTX 4070 Ti) para Q8_0 y f16. Para f16 tambien sirven A100 o H100, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas para cuantizaciones Q4 y superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha (verificar version).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo de ~3,9 B, se espera una latencia baja en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darkidol-Chasm-4B-GGUF | ~3,9 B | no disponible | gemma | GGUF | Fine-tune de roleplay sobre Gemma; solo ingles |
| Gemma 2B (original) | 2 B | 8K (segun version) | gemma | safetensors, GGUF | Modelo base de Google, no especializado en roleplay |
| Gemma 7B (original) | 7 B | 8K (segun version) | gemma | safetensors, GGUF | Mayor tamano, requiere mas VRAM |
| Modelos de roleplay de ~4B (genericos) | ~4 B | variable | variable | GGUF | No se dispone de comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo esta entrenado y etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Al ser un fine-tune orientado a roleplay, puede presentar sesgos derivados de los datos de entrenamiento (no documentados en la informacion disponible) y no es adecuado como modelo de proposito general para tareas facticas.
- Riesgo de alucinacion: no se han publicado evaluaciones que cuantifiquen este riesgo; en modelos pequenos de roleplay el riesgo suele ser elevado.
- La licencia Gemma impone restricciones de uso comercial y obligaciones especificas (consulta de los terminos de Google). Verificar antes de desplegar en produccion.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; el autor recomienda Q4_K_S o Q4_K_M como equilibrio velocidad/calidad.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con conversaciones largas.
- El repositorio tiene pocas descargas (172) y likes (2), lo que indica una validacion comunitaria limitada.
- No se dispone de informacion sobre el proceso de entrenamiento del modelo base (datos, tecnicas de alineacion), lo que dificulta evaluar su robustez.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Darkidol-Chasm-4B-GGUF
- Modelo base: https://huggingface.co/aifeifei798/Darkidol-Chasm-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Darkidol-Chasm-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Darkidol-Chasm-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
