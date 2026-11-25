# mradermacher/Coral-decider-4b-GGUF

## Resumen

Coral-decider-4b-GGUF es una compilación de cuantizaciones estáticas en formato GGUF del modelo base OceanLabs/Coral-4b, publicada por mradermacher. El modelo original es un "decision model" de aproximadamente 4.200 millones de parámetros, entrenado para producir salidas estructuradas y calibradas en tareas de decisión multi-tarea. La versión GGUF facilita el despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de gama alta.

El modelo base está orientado a un paradigma "system-one" y "one-pass": genera una decisión en una sola pasada, sin cadenas de razonamiento extendidas, lo que reduce latencia y coste computacional en comparación con modelos que emplean modos de pensamiento iterativos. Está etiquetado como conversacional y compatible con endpoints, lo que sugiere integración sencilla en APIs y pipelines de producción.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de decisión calibrado de 4B en hardware de consumo, con cuantizaciones que van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16). La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque la información pública sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por librería transformers; no confirmado) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base OceanLabs/Coral-4b. Los tags indican "decision-model", "calibrated", "structured-output", "multi-task", "system-one" y "one-pass", lo que apunta a un transformer decoder-only entrenado específicamente para emitir decisiones estructuradas en una única pasada, con calibración de probabilidades orientada a tareas de clasificación o selección. No se han publicado datos sobre número de tokens de entrenamiento, composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

La cuantización fue realizada por mradermacher con "quantize_version: 2", "output_tensor_quantised: 1" y "convert_type: hf", partiendo del modelo en formato Hugging Face. Se trata de cuantizaciones estáticas; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación. La innovación destacable de esta versión es la disponibilidad de un abanico completo de cuantizaciones K-quants e IQ para distintos compromisos entre tamaño y calidad.

## Capacidades

- Generación de decisiones estructuradas y calibradas en una sola pasada ("one-pass").
- Modelo multi-tarea: orientado a múltiples tipos de decisión dentro de un mismo modelo.
- Salida estructurada ("structured-output"), adecuada para integración con parsers y validación automática.
- Paradigma "system-one": respuestas directas sin cadenas de razonamiento extensas, con menor latencia.
- Carácter conversacional según los tags del modelo.
- Compatibilidad con endpoints ("endpoints_compatible").
- Soporte multilingüe limitado al inglés ("en").
- No se dispone de información sobre tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Clasificación y enrutamiento de tickets: el modelo puede recibir el texto de una incidencia y emitir una categoría o prioridad estructurada en una sola pasada, lo que encaja en pipelines de soporte con requisitos de baja latencia.
- Triage automático en atención al cliente: gracias a su naturaleza conversacional y de decisión, puede clasificar consultas entrantes y derivarlas al equipo adecuado, con salidas calibradas que permiten aplicar umbrales de confianza.
- Moderación de contenido asistida: el modelo puede evaluar texto y producir una decisión estructurada (permitir, revisar, bloquear) con probabilidad calibrada, integrándose en flujos de revisión humana.
- Extracción de decisiones en formularios o documentos: al generar salida estructurada, puede mapear campos de texto libre a opciones predefinidas en sistemas de gestión documental.
- Automatización de reglas de negocio con LLM: en lugar de cadenas de if-else complejas, el modelo puede decidir la acción a tomar en un flujo (aprobar, escalar, rechazar) y devolverla en formato parseable.
- Despliegue en edge o entornos con recursos limitados: las cuantizaciones Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB) permiten ejecutar el modelo en CPUs y GPUs de consumo mediante llama.cpp, ideal para prototipos y servicios de baja concurrencia.
- Evaluación de respuestas en pipelines de QA: el modelo puede actuar como juez de decisión binaria o multiclase sobre pares pregunta-respuesta, con calibración que facilita el análisis de umbrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,6 GB con cuantizaciones Q2_K a IQ4_XS; 2,7-3,2 GB con Q4_K_S a Q5_K_M; 3,6-4,6 GB con Q6_K y Q8_0; 8,5 GB con f16. Añadir overhead de contexto KV cache, cuyo tamaño depende de la longitud de contexto no publicada.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para Q6_K/Q8_0 con contextos amplios; A100/H100 no son necesarias para este tamaño, pero pueden usarse para alta concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más para cuantizaciones Q4_K_M/Q5_K_M; incluso GPUs integradas o CPUs modernas pueden ejecutar Q2_K/Q3_K con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors: transformers, vLLM o TGI (no confirmado para este modelo específico).
- Latencia y throughput estimados: no disponibles. Al ser un modelo "one-pass" de 4B, se espera latencia baja en comparación con modelos de razonamiento extendido, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Coral-decider-4b-GGUF | 4.205.751.296 | no disponible | apache-2.0 | GGUF | Modelo de decisión calibrado, one-pass, inglés |
| Qwen2.5-3B-Instruct | ~3.000 M | 32.768 tokens (aprox.) | apache-2.0 | safetensors, GGUF | Modelo generalista multilingüe con buen rendimiento en instrucciones |
| Llama-3.2-3B-Instruct | ~3.200 M | 131.072 tokens (aprox.) | Llama 3.2 Community License | safetensors, GGUF | Generalista multilingüe, contexto largo, licencia con restricciones |
| Phi-3-mini-4K-Instruct | ~3.800 M | 4.096 tokens | MIT | safetensors, GGUF | Generalista entrenado con datos sintéticos de alta calidad |

La comparación con modelos generalistas es aproximada: Coral-decider-4b está especializado en decisiones estructuradas y calibradas, mientras que los alternativos son generalistas. No hay datos de benchmarks públicos para Coral-decider-4b que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Información pública muy limitada: no se dispone de datos sobre arquitectura interna, contexto máximo, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Idiomas: soporta únicamente inglés según los tags; no se recomienda para producción en castellano u otros idiomas sin validación previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir decisiones estructuradas incorrectas o inconsistentes; la calibración declarada debe validarse en el dominio de uso.
- Sesgos conocidos: no documentados; al no publicarse detalles del dataset, no es posible evaluar sesgos de género, raza o dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del modelo base OceanLabs/Coral-4b.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M pueden degradar la calibración y precisión de las decisiones; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix/ponderadas: el autor indica que no estaban disponibles, lo que puede limitar la calidad en cuantizaciones bajas.
- Contexto desconocido: no se puede planificar el uso en conversaciones multi-turno largas sin conocer la ventana máxima.
- Compatibilidad de endpoints declarada, pero sin documentación de API específica; requiere validación de integración.

## Enlaces

- [Hugging Face: mradermacher/Coral-decider-4b-GGUF](https://huggingface.co/mradermacher/Coral-decider-4b-GGUF)
- [Modelo base: OceanLabs/Coral-4b](https://huggingface.co/OceanLabs/Coral-4b)
- [Página de descargas convenientes del autor](https://hf.tst.eu/model#Coral-decider-4b-GGUF)
- [README de referencia de TheBloke sobre uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [nethype GmbH](https://www.nethype.de/)
