# mradermacher/Llama_3.x_70b_Tess_Euryale-v2.1_128K_v1.0-GGUF

## Resumen

Llama_3.x_70b_Tess_Euryale-v2.1_128K_v1.0 es un modelo de lenguaje de 70.553.755.712 parámetros (aproximadamente 70B) obtenido mediante la fusión de modelos derivados de la familia Llama 3.x, publicada por el usuario Nexesenex y cuantizada a formato GGUF por mradermacher. El modelo base combina, según su nombre, un contexto extendido de 128K tokens con la línea Tess/Euryale, orientada a conversación y roleplay. Esta ficha describe específicamente la versión cuantizada estática publicada por mradermacher el 17 de marzo de 2025.

La relevancia de esta publicación es práctica: ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K hasta Q8_0) para su uso con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui, etc.), lo que permite desplegar un modelo de 70B en hardware que no podría alojar los pesos en precisión completa. El repositorio ocupa 481,3 GB e incluye tanto cuantizaciones estándar como, en un repositorio hermano, variantes con imatrix.

Se trata de un modelo de tipo *merge* (fusión) sin model card técnica detallada por parte del autor de la cuantización: la información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa o inexistente. Todo lo que sigue se basa exclusivamente en los metadatos y la model card proporcionados; los campos no documentados se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.x; detalles internos del merge no disponibles) |
| Parámetros totales | 70.553.755.712 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 128K tokens (según el nombre del modelo base; no verificado en la model card) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

Tamaños de los ficheros GGUF publicados:

| Cuantización | Tamaño (GB) | Nota del autor |
|---|---|---|
| Q2_K | 26,5 | — |
| Q3_K_S | 31,0 | — |
| Q3_K_M | 34,4 | calidad inferior |
| Q3_K_L | 37,2 | — |
| IQ4_XS | 38,4 | — |
| Q4_K_S | 40,4 | rápido, recomendado |
| Q4_K_M | 42,6 | rápido, recomendado |
| Q5_K_S | 48,8 | — |
| Q5_K_M | 50,0 | — |
| Q6_K | 58,0 | muy buena calidad (2 partes) |
| Q8_0 | 75,1 | rápido, mejor calidad (2 partes) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) realizada con mergekit, según las etiquetas del repositorio, sobre la base Llama 3.x de 70B. La model card del cuantizador no documenta la receta de fusión, los modelos componentes, la proporción de mezcla ni si hubo entrenamiento adicional (fine-tuning, RLHF o DPO) tras el merge. Tampoco se especifican los datos de entrenamiento, el número de tokens ni la composición del dataset.

El nombre del modelo base indica un contexto extendido de 128K tokens, presumiblemente mediante técnicas de escalado de RoPE o ajuste de contexto largo, aunque no se detalla el método. La orientación "Tess/Euryale" sugiere un ajuste para conversación y roleplay, categoría habitual en las fusiones de la comunidad, pero no hay documentación técnica que lo confirme. No se dispone de información sobre innovaciones como decodificación especulativa, atención lineal o variantes arquitectónicas híbridas.

## Capacidades

- Generación de texto conversacional en inglés, con orientación a diálogo multi-turno.
- Contexto largo de hasta 128K tokens (según el nombre del modelo base; no verificado empíricamente en la información disponible).
- Razonamiento y respuesta a instrucciones, como es habitual en los modelos Llama 3.x ajustados.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documentan.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno con contexto largo (hasta 128K tokens según el nombre), adecuado para chatbots de atención al cliente o asistentes personales desplegados localmente con llama.cpp.
- Roleplay y generación creativa: la línea Tess/Euryale está orientada a este tipo de contenido; el modelo puede generar narrativa y diálogos coherentes en sesiones extensas gracias a su ventana de contexto.
- Procesamiento de documentos largos: con 128K tokens de contexto, puede resumir o extraer información de contratos, informes o transcripciones extensas en inglés, ejecutándose en local con cuantización Q4_K_M.
- Despliegue en hardware de gama alta para consumo: las cuantizaciones Q2_K–Q4_K permiten ejecutar un 70B en estaciones de trabajo con 32–48 GB de VRAM o en configuraciones con offloading a RAM, algo imposible con los pesos completos.
- Prototipado e investigación de fusiones: útil para estudiar el comportamiento de merges de la comunidad frente a los modelos originales, comparando salidas en distintas cuantizaciones.
- Generación de texto por lotes en inglés: con Q8_0 o Q6_K se obtiene la máxima calidad disponible en GGUF para tareas de generación masiva donde la latencia no es crítica.
- Experimentación con contexto largo: validar el comportamiento del modelo más allá de 8K tokens en tareas de recuperación de información dentro del contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 26,5 GB (Q2_K), 40,4–42,6 GB (Q4_K_S/Q4_K_M), 58 GB (Q6_K) y 75,1 GB (Q8_0). Hay que añadir memoria para el contexto KV, que con 128K tokens puede ser muy elevada.
- GPU recomendadas: A100 80 GB o H100 para Q6_K/Q8_0 con contexto largo; para Q4_K_M, una RTX 4090 (24 GB) no basta sola y requiere offloading parcial a RAM o dos GPU.
- ¿Cabe en GPU de consumo? Solo con cuantizaciones muy agresivas y offloading: Q2_K (26,5 GB) no cabe en una RTX 4090 de 24 GB sin dividir capas entre GPU y CPU; en configuraciones multi-GPU (2×RTX 3090/4090, 48 GB) caben Q3_K_L e IQ4_XS, y Q4_K_M de forma ajustada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con estos ficheros.
- Latencia y throughput: no disponibles; dependerán del hardware y del grado de offloading. Los ficheros Q6_K y Q8_0 están divididos en dos partes que deben concatenarse antes de su uso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GGUF) | 70,55B | 128K (según nombre) | GGUF (Q2–Q8) | no disponible | Hugging Face, 37 descargas |
| Llama 3.1 70B Instruct (Meta) | 70B | 128K | safetensors, GGUF (terceros) | Llama 3.1 Community License | Amplia, oficial |
| Llama 3.3 70B Instruct (Meta) | 70B | 128K | safetensors, GGUF (terceros) | Llama 3.3 Community License | Amplia, oficial |

No se dispone de datos de rendimiento comparativos para este merge; la comparación se limita a parámetros, contexto y disponibilidad. Las alternativas oficiales de Meta cuentan con model cards completas, benchmarks publicados y licencias claras, a diferencia de este merge.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; el modelo base deriva de Llama 3.x, cuyas licencias de la comunidad imponen restricciones que probablemente se heredan, pero no está documentado.
- Idioma: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de 70B de la familia Llama 3.x; sin benchmarks ni evaluaciones publicadas para este merge concreto.
- Sesgos: no documentados; al ser una fusión de la comunidad sin evaluación, no hay análisis de sesgos disponible.
- Contexto largo no verificado: los 128K tokens provienen del nombre del modelo, no de una model card técnica; el comportamiento real más allá de la ventana nativa de Llama 3.x puede degradarse.
- Origen no oficial: es un merge de la comunidad, sin garantías de calidad, soporte ni mantenimiento; el repositorio tiene muy pocas descargas (37) y ningún "like", lo que limita la validación por terceros.
- Ficheros multi-parte: Q6_K y Q8_0 requieren concatenar dos partes antes de usarse.
- Sin datos de benchmarks ni evaluación independiente: no recomendable para producción crítica sin evaluación propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama_3.x_70b_Tess_Euryale-v2.1_128K_v1.0-GGUF
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.x_70b_Tess_Euryale-v2.1_128K_v1.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama_3.x_70b_Tess_Euryale-v2.1_128K_v1.0-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama_3.x_70b_Tess_Euryale-v2.1_128K_v1.0-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
