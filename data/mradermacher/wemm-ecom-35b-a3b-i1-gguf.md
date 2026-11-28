# mradermacher/WeMM-Ecom-35B-A3B-i1-GGUF

## Resumen

WeMM-Ecom-35B-A3B es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por Tencent, especializado en conversaciones y tareas del ámbito del comercio electrónico. Esta ficha describe la versión cuantizada en formato GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo base combina procesamiento de texto e imagen, con soporte para chino e inglés, y está publicado bajo licencia Apache 2.0.

El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y una arquitectura MoE identificada en las etiquetas como `qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen con mezcla de expertos. La nomenclatura "A3B" indica que activa alrededor de 3 mil millones de parámetros por token, lo que reduce el coste computacional en inferencia frente a un modelo denso del mismo tamaño total.

La relevancia de esta publicación radica en la disponibilidad de cuantizaciones con imatrix (denominadas i1) en un rango muy amplio de tipos, desde IQ1_S (7,6 GB) hasta Q6_K (28,6 GB), lo que permite ejecutar un modelo multimodal de 35B en hardware de consumo. El repositorio ocupa 371 GB en total por incluir todas las variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), etiquetada como `qwen3_5_moe`; multimodal (texto e imagen) |
| Parametros totales | 34.660.610.688 (aprox. 34,7B) |
| Parametros activos | Aproximadamente 3B por token (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como una arquitectura MoE multimodal etiquetada como `qwen3_5_moe`, lo que apunta a una base de la familia Qwen 3.5 con mezcla de expertos. La designación A3B sugiere que, de los aproximadamente 34,7 mil millones de parámetros totales, solo unos 3 mil millones se activan por token, un esquema habitual en modelos MoE que busca equilibrar capacidad y eficiencia en inferencia. El modelo procesa tanto texto como imágenes, dado que la model card lo describe explícitamente como "vision model" y menciona ficheros `mmproj` para el proyector multimodal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia arquitectura MoE y su naturaleza multimodal. Esta publicación es una cuantización del modelo original `tencent/WeMM-Ecom-35B-A3B` realizada con imatrix (fichero `WeMM-Ecom-35B-A3B.imatrix.gguf` de 0,5 GB), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. Las cuantizaciones estáticas equivalentes están disponibles en un repositorio separado.

## Capacidades

- Generación de texto conversacional orientada al dominio del comercio electrónico (descripciones de producto, atención al cliente, recomendaciones).
- Procesamiento multimodal de imagen y texto, con soporte de ficheros `mmproj` para el codificador visual.
- Conversaciones multi-turno (etiqueta `conversational`).
- Capacidades multilingües limitadas a chino e inglés.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en comercio electrónico: el modelo está entrenado específicamente para conversaciones del dominio comercial, por lo que puede gestionar consultas sobre productos, devoluciones y pedidos en chino o inglés, manteniendo el contexto de la conversación.
- Generación de descripciones de producto a partir de imágenes: gracias a su naturaleza multimodal, puede recibir una foto de un artículo y producir texto descriptivo para fichas de catálogo.
- Búsqueda visual y clasificación de productos: el codificador visual permite analizar imágenes de catálogo para tareas de etiquetado, categorización o moderación de contenido comercial.
- Asistentes de recomendación conversacionales: el modelo puede integrarse en un chatbot de tienda que pregunte preferencias y sugiera productos, aprovechando su entrenamiento en diálogo de e-commerce.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (21,3 GB) o i1-IQ3_M (15,5 GB) permiten ejecutar el modelo en estaciones de trabajo con una sola GPU de 24 GB o en configuraciones con memoria unificada, algo inviable con el modelo original en precisión completa.
- Prototipado e investigación en local: con llama.cpp u Ollama, un investigador puede evaluar el comportamiento de un MoE multimodal de 35B sin acceso a clústeres de GPU, usando las variantes IQ2/IQ3 para pruebas rápidas.
- Procesamiento por lotes de contenido de catálogo: la variante Q4_K_S (20,0 GB), descrita como óptima en relación tamaño/velocidad/calidad, es adecuada para pipelines que generen o enriquezcan fichas de producto a escala media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y del proyector visual):
  - i1-IQ1_S: 7,6 GB; i1-IQ2_M: 11,8 GB; i1-IQ3_M: 15,5 GB; i1-IQ4_XS: 18,8 GB; i1-Q4_K_M: 21,3 GB; i1-Q5_K_M: 24,8 GB; i1-Q6_K: 28,6 GB.
- GPU recomendadas: para las variantes Q4/Q5, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el modelo; para Q6_K se recomienda una A100 40 GB, L40S o H100. Las variantes IQ2/IQ3 caben en GPUs de 16-20 GB (RTX 4080, RTX A4000 16 GB con contexto reducido).
- Cabe en GPU de consumo: sí, en las cuantizaciones IQ1 a Q4_K_M con 24 GB o menos; las variantes de 16 GB requieren cuantizaciones IQ2/IQ3 y contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; el modelo base en safetensors requiere transformers. vLLM y TGI no se mencionan en la información disponible para esta variante GGUF.
- Latencia y throughput estimados: no disponible. Al ser un MoE con ~3B parámetros activos, se espera un throughput superior al de un modelo denso de 35B, pero no hay cifras publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-35B-A3B (esta ficha) | 34,7B totales / ~3B activos | no disponible | Sí (texto + imagen) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL-32B | 32B densos | no disponible en esta ficha | Sí | Apache 2.0 (según versión) | safetensors, GGUF |
| Mixtral 8x7B | 46,7B totales / ~12,9B activos | 32K | No | Apache 2.0 | safetensors, GGUF |
| Qwen3-30B-A3B | 30,5B totales / ~3,3B activos | 128K (versión base) | No | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen2.5-VL-32B y Mixtral 8x7B se ofrece como referencia de categoría; los datos de esos modelos no proceden de la información proporcionada y deben verificarse en sus fichas oficiales. Frente a un denso de 32B, este modelo reduce el coste de inferencia por token gracias a la activación selectiva de expertos; frente a Mixtral 8x7B, ofrece multimodalidad y una huella de parámetros activos menor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar especializado en comercio electrónico y entrenado principalmente en chino e inglés, puede reflejar sesgos de esos dominios y mercados.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede inventar especificaciones de producto o detalles de pedidos, algo crítico en atención al cliente.
- Limitaciones de idioma: solo se declaran chino e inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto: no disponible, lo que impide planificar su uso en conversaciones o documentos largos sin pruebas previas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original (`tencent/WeMM-Ecom-35B-A3B`) por si añade condiciones adicionales.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card advierte que IQ1_S es "para desesperados" y Q2_K_S tiene "calidad muy baja". Para producción se recomienda Q4_K_M o superior.
- Las variantes multimodales requieren los ficheros `mmproj`, que se encuentran en el repositorio estático, no en este; sin ellos el modelo solo procesa texto.
- No hay métricas de benchmarks publicadas, por lo que la calidad real frente a alternativas debe validarse empíricamente antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-35B-A3B/blob/main/LICENSE
- Cuantizaciones estáticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/WeMM-Ecom-35B-A3B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#WeMM-Ecom-35B-A3B-i1-GGUF
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
