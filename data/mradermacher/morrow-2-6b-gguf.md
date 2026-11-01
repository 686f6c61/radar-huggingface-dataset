# mradermacher/Morrow-2.6B-GGUF

## Resumen

Morrow-2.6B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Morrow-2.6B, originalmente publicado por Noumenon Labs. La cuantización ha sido realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que genera versiones comprimidas de modelos populares para su ejecución en hardware de consumo mediante llama.cpp y herramientas derivadas como Ollama.

El modelo base, Morrow-2.6B, es un modelo conversacional de aproximadamente 2.569 millones de parámetros basado en la arquitectura LFM2 (Liquid Foundation Models 2), un tipo de arquitectura híbrida que combina capas convolucionales y de atención para lograr inferencia eficiente. Está orientado a diálogo multi-turno y está entrenado principalmente en inglés. Su relevancia radica en el tamaño reducido (cabe en dispositivos modestos) y en la eficiencia de la familia LFM2 en CPU y edge devices.

Esta ficha se centra en el repositorio de cuantizaciones GGUF; la información sobre el modelo base es limitada, por lo que varios datos técnicos (longitud de contexto exacta, datos de entrenamiento, benchmarks) no están disponibles en la documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida, según tags del repo) |
| Parametros totales | 2.569.272.320 (~2,57 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (según model card) |
| Licencia | other (no especificada en detalle; consultar el repo base) |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Morrow-2.6B de Noumenon Labs, pertenece a la familia de arquitecturas LFM2, según los tags del repositorio. Las arquitecturas LFM2 combinan capas de convolución causal (gated conv) con un número reducido de capas de atención global, lo que reduce el coste de inferencia, especialmente en CPU y dispositivos edge, al minimizar el uso de KV cache. No obstante, los detalles concretos de la configuración de capas de esta variante no están disponibles en la documentación proporcionada.

Sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o destilación) no hay información publicada en la model card disponible. Tampoco se detalla la plantilla de chat empleada, aunque los tags indican que está orientado a conversación multi-turno y diálogo.

## Capacidades

- Generación de texto conversacional orientada a diálogo multi-turno (según los tags del repositorio).
- Ejecución local eficiente en CPU y GPU gracias al formato GGUF y a la arquitectura LFM2.
- Amplia gama de cuantizaciones (desde Q2_K de 1,1 GB hasta f16 de 5,2 GB), lo que permite ajustar la relación calidad/tamaño según el hardware disponible.
- No hay evidencia en la documentación de capacidades de visión, audio, tool calling, function calling ni modos de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Chatbots locales ligeros: con la variante Q4_K_M (1,7 GB) se puede desplegar un asistente conversacional multi-turno en portátiles o mini-PC sin GPU dedicada, ideal para prototipos de agentes de diálogo offline.
- Integración en aplicaciones de escritorio: el formato GGUF es compatible con llama.cpp, lo que permite embeber el modelo en aplicaciones nativas (Electron, Qt, etc.) que necesiten un componente de diálogo sin depender de la nube.
- Inferencia en dispositivos edge y IoT: la arquitectura LFM2 está optimizada para CPU; la variante Q2_K (1,1 GB) cabe en dispositivos con recursos muy limitados, como Raspberry Pi o smartphones de gama media.
- Privacidad en conversaciones sensibles: al ejecutarse íntegramente en local, es adecuado para asistentes que procesan información confidencial sin enviar datos a servicios externos.
- Servidores de inferencia de bajo coste: en una VPS modesta se puede servir el modelo a varios usuarios simultáneos con llama.cpp en modo servidor, dada su baja huella de memoria.
- Pruebas y evaluación de plantillas de diálogo: su pequeño tamaño permite iterar rápidamente sobre prompts, system prompts y flujos multi-turno en desarrollo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la variante Q4_K_M ocupa 1,7 GB; con contexto y overhead de ejecución, se recomienda disponer de 3-4 GB de RAM. La variante Q8_0 ocupa 2,8 GB y la f16, 5,2 GB.
- GPU recomendadas: no requiere GPU; funciona bien en CPU. Si se usa GPU offload en llama.cpp, cualquier GPU con 4 GB de VRAM (por ejemplo, GTX 1650 o superior, RTX 3060, RTX 4090 con holgura) es más que suficiente.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU moderna de consumo; incluso la variante f16 cabe en una GPU de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. También puede ejecutarse el modelo base en safetensors con transformers y vLLM (si este soporta la arquitectura LFM2).
- Latencia y throughput: no disponibles; al tratarse de un modelo de 2,6 B con arquitectura LFM2 optimizada para CPU, se esperan velocidades altas en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Morrow-2.6B (base) | 2,57 B | safetensors / GGUF | other | Arquitectura LFM2, diálogo multi-turno, inglés |
| LFM2-1.2B (Liquid AI) | 1,2 B | safetensors / GGUF | Licencia Liquid AI | Misma familia de arquitectura, orientado a edge |
| Qwen2.5-3B-Instruct | 3 B | safetensors / GGUF | Apache 2.0 / Qwen | Mayor ecosistema, multilingüe, tool calling |
| Gemma-2-2b-it | 2,6 B | safetensors / GGUF | Gemma license | Buena calidad conversacional, amplio soporte |

Morrow-2.6B se diferencia de sus alternativas por su arquitectura LFM2, optimizada para inferencia en CPU, mientras que Qwen2.5-3B y Gemma-2-2b-it ofrecen ecosistemas más maduros y capacidades adicionales (tool calling, multilingüismo) a costa de una inferencia convencional basada en transformer.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Sesgos conocidos: no disponible; al no publicarse datos de entrenamiento, no se pueden evaluar sesgos específicos del dataset.
- Riesgo de alucinación: como todo modelo conversacional pequeño, puede generar información incorrecta con fluidez; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Longitud de contexto: no documentada en el repositorio de cuantizaciones; conviene verificarla en el modelo base antes de diseñar aplicaciones con conversaciones largas.
- Licencia: está registrada como "other"; antes de cualquier uso comercial debe revisarse la licencia exacta en el repositorio del modelo base (noumenon-labs/Morrow-2.6B).
- Las cuantizaciones agresivas (Q2_K, Q3_K_M) pueden degradar notablemente la calidad de generación respecto al modelo original; se recomiendan Q4_K_M o superiores para uso general.
- El repositorio es una cuantización de terceros (mradermacher); cualquier problema de conversión debe distinguirse de defectos del modelo base.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Morrow-2.6B-GGUF
- Modelo base: https://huggingface.co/noumenon-labs/Morrow-2.6B
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Morrow-2.6B-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Morrow-2.6B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
