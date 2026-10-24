# mradermacher/terrapulse-qwen3-1.7b-v2-GGUF

## Resumen

Terrapulse Qwen3 1.7B v2 (GGUF) es la conversión a formato GGUF del modelo `aaronr43210/terrapulse-qwen3-1.7b-v2`, un ajuste fino mediante LoRA sobre la base Qwen3-1.7B. El modelo original lo desarrolla el usuario aaronr43210 y esta versión cuantizada la publica mradermacher, distribuidor habitual de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles.

Con 1.720.574.976 parámetros (1,72 mil millones) es un modelo denso de pequeño tamaño, orientado a inferencia en hardware modesto, incluido CPU. Se distribuye bajo licencia Apache 2.0 y declara soporte de inglés (en) e hindi (hi). Las etiquetas del modelo apuntan a una especialización en geoai, outdoor-activity y grounded-generation, es decir, generación de contenido anclado a datos geográficos y asistencia en actividades al aire libre.

Su relevancia actual reside en la combinación de un modelo base compacto y moderno (Qwen3), una especialización vertical poco común y un abanico amplio de cuantizaciones GGUF que permiten desplegarlo desde dispositivos de gama baja hasta GPUs de consumo. No obstante, la model card disponible no documenta longitud de contexto, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only denso. Sobre esa base se aplicó un ajuste fino mediante LoRA (la etiqueta `lora` y el metadato `base_model:adapter` así lo indican), dando lugar al modelo `aaronr43210/terrapulse-qwen3-1.7b-v2`. El resultado se empaquetó y posteriormente mradermacher generó cuantizaciones estáticas en formato GGUF para su uso con llama.cpp y herramientas compatibles.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre el dataset `aaronr43210/terrapulse-sft-data`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la herencia de la arquitectura Qwen3. La model card del cuantizador indica que solo se han generado cuantizaciones estáticas y que no hay cuantizaciones con imatrix/weighted disponibles por el momento.

## Capacidades

- Generación de texto conversacional multi-turno, tal y como refleja la etiqueta `conversational`.
- Generación anclada o fundamentada (`grounded-generation`): salidas apoyadas en datos de referencia aportados en el contexto.
- Aplicaciones de geoAI: consultas y razonamiento sobre información geográfica.
- Asistencia en actividades al aire libre (`outdoor-activity`).
- Soporte bilingüe inglés-hindi.
- Compatible con endpoints estándar de inferencia (`endpoints_compatible`).
- Al ser un modelo pequeño, apto para despliegue en entornos con recursos limitados.
- No se documentan en la información disponible capacidades explícitas de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de rutas y actividades al aire libre: el modelo puede responder consultas sobre senderismo, acampada o planificación de excursiones en inglés o hindi, aprovechando su ajuste específico en `outdoor-activity`.
- Consultas geoespaciales conversacionales: dado su entrenamiento en `geoai`, puede integrarse en un chatbot que resuelva preguntas sobre localizaciones, características del terreno o puntos de interés a partir de datos aportados en el contexto.
- Generación fundamentada en documentación: la etiqueta `grounded-generation` sugiere su uso en pipelines de respuesta basada en fuentes (RAG) donde se pasa el material de referencia en el prompt y se espera una respuesta fiel al mismo.
- Despliegue en edge o dispositivos sin GPU: con cuantizaciones de 0,9 a 1,4 GB (Q2_K a Q5_K_M) puede ejecutarse en CPU en portátiles, Raspberry Pi de gama alta o mini-PCs para asistentes locales de bajo consumo.
- Prototipado rápido de aplicaciones bilingües inglés-hindi: adecuado para demos y pruebas de concepto donde no se requiere un modelo grande y se prioriza la latencia y el coste.
- Filtrado y clasificación de consultas de dominio outdoor: puede usarse como primer eslabón en un pipeline que clasifique o reformule consultas de usuarios relacionadas con geografía y actividades al aire libre antes de derivarlas a un modelo mayor.
- Chat de asistencia en kioscos o aplicaciones móviles offline: al ser un GGUF pequeño, puede empaquetarse en una app para funcionar sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin contar caché KV):
  - Q2_K (0,9 GB): en torno a 1,5 GB de VRAM efectiva.
  - Q3_K_S / Q3_K_M / Q3_K_L (1,0-1,1 GB): en torno a 1,5-2 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (1,1-1,2 GB): en torno a 2 GB.
  - Q5_K_S / Q5_K_M (1,3-1,4 GB): en torno a 2-2,5 GB.
  - Q6_K (1,5 GB): en torno a 2,5-3 GB.
  - Q8_0 (1,9 GB): en torno a 3 GB.
  - f16 (3,5 GB): en torno a 4-5 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM es suficiente para las cuantizaciones Q4 y Q5 (GTX 1650, RTX 3050, RTX 4060, etc.). Para f16 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti). No requiere A100 ni H100.
- Cabe en GPU consumer y también en CPU: las cuantizaciones Q2_K a Q5_K_M son viables en CPU con llama.cpp, con velocidades de decodificación dependientes del número de núcleos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui. La compatibilidad con vLLM/TGI es limitada para GGUF y no está documentada en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones concretas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| terrapulse-qwen3-1.7b-v2-GGUF (este) | 1,72 mil millones | no disponible | Apache 2.0 | GGUF en HF | Especializado en geoai/outdoor, bilingüe en/hi |
| Qwen3-1.7B (base) | 1,72 mil millones | 32.768 tokens (según documentación oficial de Qwen3) | Apache 2.0 | safetensors, GGUF de terceros | Modelo generalista multilingüe, sin especialización vertical |
| Llama 3.2 1B | 1,24 mil millones | 128.000 tokens (según documentación oficial de Meta) | Llama 3.2 Community License | safetensors y GGUF | Multilingüe, requiere aceptación de licencia para uso comercial |
| Gemma 2 2B | 2,6 mil millones | 8.192 tokens (según documentación oficial de Google) | Gemma Terms of Use | safetensors y GGUF | Multilingüe, licencia con restricciones de uso |

Los datos de contexto y parámetros de los modelos comparables proceden de sus fichas oficiales y no se han verificado en la búsqueda realizada para esta ficha. No se dispone de benchmarks comparativos publicados para este modelo.

## Limitaciones y advertencias

- Modelo de pequeño tamaño (1,72 mil millones de parámetros): mayor propensión a alucinaciones y a errores factuales que modelos de mayor escala, especialmente en tareas de razonamiento complejo.
- Idiomas limitados a inglés e hindi; no se declara soporte de castellano ni de otras lenguas, por lo que su uso en español no está garantizado.
- Longitud de contexto no documentada en la información disponible: conviene verificar experimentalmente el límite real antes de diseñar aplicaciones que dependan de ventanas largas.
- El ajuste LoRA está orientado a dominios concretos (geoai, outdoor, grounded-generation); su rendimiento en tareas generales puede ser inferior al del Qwen3-1.7B base.
- Las cuantizaciones de menor tamaño (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones de la base Qwen3-1.7B (también Apache 2.0), por lo que no se identifican restricciones adicionales.
- No hay datos publicados de benchmarks, sesgos ni evaluaciones de seguridad; se recomienda realizar una evaluación propia antes de desplegarlo en producción.
- Solo se han publicado cuantizaciones estáticas; no hay variantes con imatrix/weighted, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.

## Enlaces

- Página HuggingFace del modelo (GGUF): https://huggingface.co/mradermacher/terrapulse-qwen3-1.7b-v2-GGUF
- Modelo base original: https://huggingface.co/aaronr43210/terrapulse-qwen3-1.7b-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/aaronr43210/terrapulse-sft-data
- Página de descarga y visión general del cuantizador: https://hf.tst.eu/model#terrapulse-qwen3-1.7b-v2-GGUF
- GGUF v1 publicado por el autor original: https://huggingface.co/aaronr43210/terrapulse-qwen3-1.7b-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ficha en free2aitools del modelo base: https://free2aitools.com/model/aaronr43210/terrapulse-qwen3-1.7b-gguf-v2
