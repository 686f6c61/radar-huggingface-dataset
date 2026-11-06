# mradermacher/LiberalMind_v1.5-GGUF

## Resumen

LiberalMind_v1.5-GGUF es la versión cuantizada en formato GGUF del modelo base arcticoneai/Arctic_AI, publicada por el usuario mradermacher, conocido en Hugging Face por producir cuantizaciones estáticas y con imatrix de modelos abiertos. El modelo base es un transformer causal de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a generación de texto, razonamiento e instrucciones, con licencia MIT y entrenado presumiblemente con técnicas de RLHF y alineamiento según las etiquetas de la model card. El repositorio contiene únicamente los pesos cuantizados en GGUF, no el modelo original en safetensors.

La relevancia de esta ficha reside en que permite ejecutar un modelo de ~7,6B en hardware de consumo mediante llama.cpp y derivados, con un abanico de cuantizaciones desde Q2_K (3,1 GB) hasta f16 (15,3 GB). El autor no proporciona información sobre la arquitectura interna, el dataset de entrenamiento ni el contexto máximo del modelo base, por lo que muchos apartados de esta ficha quedan marcados como "no disponible".

Se trata, por tanto, de una ficha de carácter práctico: describe qué contiene el repositorio, qué cuantizaciones ofrece y cómo desplegarlas, pero no puede profundizar en las decisiones de diseño del modelo original porque el cuantizador no las documenta y la model card del base no se ha incluido en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); no se incluyen safetensors en este repo |
| Modelo base | arcticoneai/Arctic_AI |
| Cuantizador | mradermacher |
| Fecha de creación | 2025-06-04 |
| Última actualización | 2026-11-05 |
| Descargas | 206 |
| Likes | 1 |
| Tamaño del repo | 68,1 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base arcticoneai/Arctic_AI. Las etiquetas de la model card indican que se trata de un transformer causal (causal-lm) para generación de texto, con entrenamiento que incluye reinforcement-learning, rlhf, alignment e instruction-following. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como DPO, PPO u otras variantes de optimización por preferencias.

El repositorio de mradermacher es exclusivamente un artefacto de cuantización: aplica el pipeline de conversión de Hugging Face a GGUF (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) y publica únicamente cuantizaciones estáticas. El autor indica que las cuantizaciones ponderadas/imatrix están en un repositorio separado (LiberalMind_v1.5-i1-GGUF), lo que sugiere que la versión publicada aquí no incorpora matriz de importancia y, por tanto, puede presentar una degradación algo mayor en cuantizaciones bajas que las variantes i1. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto y modelado de lenguaje causal en inglés.
- Instrucciones y seguimiento de instrucciones (instruction-following), según las etiquetas del modelo.
- Razonamiento y alineamiento mediante RLHF, de acuerdo con las etiquetas declaradas.
- Conversación multi-turno (chat-model).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (4,8 GB) el modelo cabe en GPUs de consumo de 8 GB o superiores, lo que permite ejecutar generación de texto en local sin conexión a servicios en la nube.
- Prototipado rápido de asistentes conversacionales: al ser un chat-model con instruction-following, puede integrarse en aplicaciones de chat mediante llama.cpp u Ollama para validar flujos de conversación antes de pasar a modelos mayores.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes (desde Q2_K hasta f16), lo que permite medir el impacto de la cuantización en perplejidad y calidad de salida sobre el mismo modelo base.
- Generación de texto en entornos con recursos limitados: la variante Q2_K (3,1 GB) permite ejecución en CPU o en GPUs con 4 GB de VRAM, útil para demos y entornos embebidos.
- Investigación en alineamiento y RLHF: al estar etiquetado como modelo con RLHF y alignment, sirve como sujeto de estudio para analizar comportamientos alineados en modelos de ~7,6B.
- Fine-tuning ligero sobre GGUF: mediante técnicas como LoRA aplicadas sobre el modelo base (no directamente sobre GGUF), se puede adaptar el modelo a dominios concretos y luego recuantizar con el mismo pipeline.
- Servicio de inferencia en producción de baja concurrencia: con Q8_0 (8,2 GB) o f16 (15,3 GB) en una GPU de 16-24 GB, se obtiene la máxima calidad del repositorio para cargas moderadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, pesos + overhead de contexto):
  - Q2_K: ~3,1 GB de pesos, ~4 GB con contexto moderado.
  - Q3_K_S / Q3_K_M / Q3_K_L: ~3,6-4,2 GB de pesos, ~5 GB con contexto.
  - IQ4_XS / Q4_K_S / Q4_K_M: ~4,4-4,8 GB de pesos, ~6 GB con contexto.
  - Q5_K_S / Q5_K_M: ~5,4-5,5 GB de pesos, ~7 GB con contexto.
  - Q6_K: ~6,4 GB de pesos, ~8 GB con contexto.
  - Q8_0: ~8,2 GB de pesos, ~10 GB con contexto.
  - f16: ~15,3 GB de pesos, ~17 GB con contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 24 GB para cuantizaciones altas; A100/H100 no son necesarias para un modelo de este tamaño y quedarían sobredimensionadas.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 4-6 GB hasta f16 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (endpoints_compatible según las etiquetas). vLLM y TGI no son la vía natural para GGUF, aunque vLLM soporta algunos formatos GGUF de forma experimental.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiberalMind_v1.5-GGUF (este) | ~7,6B | no disponible | MIT | GGUF | Cuantizaciones estáticas de Arctic_AI |
| Mistral-7B-Instruct (referencia) | ~7,2B | 32k (v0.2/v0.3) | Apache 2.0 | safetensors, GGUF | Ampliamente soportado, benchmarks públicos |
| Llama 3.1 8B Instruct (referencia) | ~8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Requiere aceptar licencia, no MIT |
| Qwen2.5 7B Instruct (referencia) | ~7,6B | 32k (128k en variantes) | Apache 2.0 | safetensors, GGUF | Multilingüe, buenos resultados en código |

La comparación es estructural: no se dispone de benchmarks del modelo Arctic_AI ni de LiberalMind_v1.5, por lo que no es posible afirmar superioridad o inferioridad en rendimiento frente a estas alternativas. La principal ventaja de este repositorio es la licencia MIT combinada con un ecosistema de cuantizaciones amplio; la principal desventaja es la ausencia de documentación técnica y de resultados publicados.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base; al estar entrenado presumiblemente con datos en inglés, es esperable un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluaciones publicadas que permitan estimarlo.
- El modelo solo declara soporte de inglés (`language: en`); el rendimiento en castellano no está garantizado.
- La longitud de contexto no está documentada, lo que impide planificar cargas con ventanas largas.
- Aunque la licencia es MIT, el modelo base (arcticoneai/Arctic_AI) podría tener condiciones adicionales no reflejadas en este repositorio; conviene verificar la licencia del modelo original antes de uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Este repositorio no incluye los pesos originales en safetensors; para fine-tuning completo o conversión a otros formatos hay que acudir al modelo base.
- El repo ocupa 68,1 GB, por lo que la descarga completa de todas las cuantizaciones requiere espacio considerable en disco.
- No hay garantías de mantenimiento: el repositorio tiene 206 descargas y 1 like, lo que sugiere una adopción muy baja y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LiberalMind_v1.5-GGUF
- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/LiberalMind_v1.5-i1-GGUF
- Modelo base: https://huggingface.co/arcticoneai/Arctic_AI
- Página de descargas del cuantizador: https://hf.tst.eu/model#LiberalMind_v1.5-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
