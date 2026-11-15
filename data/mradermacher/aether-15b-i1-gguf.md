# mradermacher/Aether-15B-i1-GGUF

## Resumen

Aether-15B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Aether-15B, publicada por el usuario mradermacher bajo su serie de conversiones "i1" (imatrix). El modelo base, Aether-15B, procede del repositorio K-Ai-Official/Aether-15B y cuenta con aproximadamente 14.768 millones de parametros (unos 14,77B), lo que lo situa en la categoria de modelos de tamano medio-grande orientados a uso conversacional. Esta publicacion no aporta pesos originales, sino versiones comprimidas listas para ser ejecutadas con llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha radica en que permite desplegar un modelo de casi 15B parametros en hardware de consumo mediante cuantizaciones que van desde IQ1_S hasta Q6_K. El uso de "imatrix" (importance matrix) en la cuantizacion busca preservar mejor la calidad en niveles de compresion agresivos, un aspecto critico cuando se baja de 4 bits por peso. El repositorio ocupa 52 GB en total, lo que refleja la suma de todas las variantes incluidas.

No se dispone de informacion sobre la arquitectura interna del modelo base, su ventana de contexto, idiomas soportados ni licencia. La model card del conversor solo indica que se trata de cuantizaciones ponderadas con imatrix del modelo original, por lo que los datos tecnicos mas alla del recuento de parametros deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Aether-15B) |
| Parametros totales | 14.768.307.200 (~14,77B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado, generado con llama.cpp; quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Aether-15B en la documentacion proporcionada. El recuento de parametros (14.768.307.200) es consistente con un transformer denso de aproximadamente 15B parametros, pero no se confirma ni el tipo de atencion, ni si emplea mezcla de expertos, ni la composicion del dataset de entrenamiento. Tampoco consta si hubo fases de RLHF, DPO o ajuste instruct.

Lo unico documentado tecnicamente es el proceso de cuantizacion: se han generado variantes con importance matrix (imatrix), una tecnica que calcula la importancia de cada peso a partir de activaciones de calibracion para minimizar la perdida de calidad en cuantizaciones de baja precision. El conversor indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica que los pesos originales en formato Hugging Face fueron convertidos a GGUF y posteriormente cuantizados. La etiqueta `nicoboss` aparece en los metadatos del proceso de conversion.

## Capacidades

- Generacion de texto conversacional: la unica capacidad explicitamente declarada en las etiquetas del repositorio es "conversational", lo que sugiere un modelo ajustado para dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura compatible con la API de Hugging Face Endpoints o servidores OpenAI-compatibles (por ejemplo, llama.cpp server).
- Razonamiento, codigo, matematicas, vision, audio y tool calling: no disponible; no se documenta ninguna de estas capacidades en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional: con cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse en una GPU de consumo de 12-16 GB de VRAM y servir como chatbot local sin dependencia de la nube, aprovechando su naturaleza conversacional declarada.
- Prototipado rapido en estaciones de trabajo: las variantes Q2_K o IQ2_M permiten cargar el modelo en equipos con 8 GB de VRAM o incluso en CPU con llama.cpp, lo que facilita pruebas de concepto antes de invertir en hardware mayor.
- Evaluacion comparativa de cuantizaciones: al incluir 24 variantes (desde IQ1_S hasta Q6_K), el repositorio sirve para medir empiricamente la degradacion de calidad frente al ahorro de memoria en un modelo de ~15B, un caso de uso metodologico habitual en investigacion de compresion.
- Servicio de inferencia self-hosted: mediante llama.cpp server o un frontend compatible con la API de OpenAI, puede exponerse como endpoint interno para aplicaciones de chat corporativo donde la confidencialidad impide usar APIs externas.
- Integracion en pipelines de agentes conversacionales: si el modelo base soporta instrucciones (no confirmado), las variantes Q5_K_M o Q6_K ofrecen la mayor fidelidad respecto al original para tareas de seguimiento de instrucciones en produccion.
- Fine-tuning ligero sobre cuantizaciones: aunque el fine-tuning directo sobre GGUF es limitado, las variantes de mayor precision (Q6_K) pueden servir como referencia para comparar contra adaptadores LoRA entrenados sobre el modelo base en FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y 14,77B parametros):
  - IQ1_S / IQ1_M: ~3-4 GB
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M / Q2_K: ~4-6 GB
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: ~6-8 GB
  - IQ4_XS / IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: ~8-10 GB
  - Q5_K_S / Q5_K_M: ~10-12 GB
  - Q6_K: ~12-14 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB para las variantes altas; A100 o H100 solo si se busca throughput elevado con lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de variantes. Las cuantizaciones de 4 bits o menos caben en GPUs de 8-12 GB; Q6_K requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama-cpp-python, servidores compatibles con la API de OpenAI (llama.cpp server), y potencialmente vLLM si se convierte a otro formato (no soporta GGUF de forma nativa en todas sus versiones).
- Latencia y throughput: no disponible; dependen de la cuantizacion, el hardware y la longitud de contexto, que tampoco se conoce.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aether-15B-i1-GGUF (este) | ~14,77B | no disponible | no disponible | GGUF (24 cuants) | Conversacional, imatrix |
| Modelos densos de ~14-15B en GGUF (p. ej. Qwen2.5-14B-Instruct-GGUF) | ~14,7B | 32K (tipico) | Apache 2.0 (tipico) | GGUF | Referencia de categoria; datos del modelo Aether no confirmados |
| Modelos de ~13B en GGUF (p. ej. Llama-2-13B-chat-GGUF) | ~13B | 4K (tipico) | Llama 2 (tipico) | GGUF | Categoria similar en tamano y despliegue |

La comparativa con modelos concretos no puede establecerse con rigor porque se desconoce la licencia, el contexto y el rendimiento del modelo base Aether-15B. Cualquier comparacion numerica seria especulativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar el repositorio del modelo base (K-Ai-Official/Aether-15B) antes de cualquier despliegue en produccion.
- Idiomas no documentados: se desconoce si el modelo esta entrenado principalmente en ingles, multilingue o en otro idioma; el rendimiento en castellano no puede garantizarse.
- Ventana de contexto desconocida: no se puede planificar el uso en tareas de contexto largo (documentos extensos, conversaciones prolongadas) sin conocer el limite real.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay documentacion sobre mitigaciones (RLHF, filtros) en la informacion disponible.
- Sesgos: no documentados; al no conocer el dataset de entrenamiento, no se pueden anticipar sesgos de genero, raza, idioma o dominio.
- Cuantizaciones agresivas (IQ1_S, IQ2_XXS): pueden degradar notablemente la coherencia y el seguimiento de instrucciones; no recomendadas para produccion.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Modelo base de origen poco documentado: la trazabilidad del entrenamiento y la calidad del ajuste conversacional no pueden verificarse desde esta ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aether-15B-i1-GGUF
- Modelo base: https://huggingface.co/K-Ai-Official/Aether-15B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
