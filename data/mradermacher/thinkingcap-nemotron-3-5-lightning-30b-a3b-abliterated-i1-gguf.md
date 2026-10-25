# mradermacher/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-i1-GGUF

## Resumen

ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-i1-GGUF es la versión cuantizada en formato GGUF del modelo IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated, un modelo de lenguaje de tipo mezcla de expertos (MoE) de 32.913.266.240 parámetros totales construido sobre la arquitectura Nemotron H de NVIDIA, que combina capas Mamba con bloques transformer y enrutamiento disperso de expertos. El nombre comercial indica 30B de parámetros totales con 3B activos por token (sufijo A3B), lo que sitúa al modelo en la franja de MoE dispersos eficientes en cómputo pero con una huella de memoria propia de un modelo de 33B.

El trabajo de cuantización corre a cargo de mradermacher (nethype GmbH), que publica tanto cuantizaciones estáticas como cuantizaciones con matrices de importancia (imatrix, prefijo i1) calculadas sobre el modelo original. La variante «abliterated» procede del modelo base de IstroSec: se ha aplicado una técnica de eliminación de la dirección de rechazo en el espacio de activaciones (abliteration, etiquetada también como heretic/uncensored), de modo que el modelo reducen drásticamente las negativas a responder y el sesgo de rechazo aprendido durante el alineamiento.

La relevancia de esta ficha es doble: por un lado documenta una familia de arquitecturas híbridas Mamba-MoE que empiezan a distribuirse en GGUF para inferencia local; por otro, advierte de que se trata de un modelo sin alineamiento de seguridad efectivo, con licencia OpenMDW-1.1 y con toda la documentación de entrenamiento delegada al modelo base, cuya model card no forma parte de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H: híbrida Mamba + transformer con mezcla de expertos (MoE); etiquetas del repo: nemotron_h, mamba, moe, mtp |
| Parametros totales | 32.913.266.240 (32,9B), dato real de safetensors |
| Parametros activos | Aproximadamente 3.000 millones, deducido del sufijo A3B del nombre; no confirmado en la información disponible |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Cuantizaciones estáticas equivalentes en el repo hermano. Se incluye fichero imatrix (0,2 GB) para generar cuantizaciones propias |
| Idiomas soportados | Inglés (en); no se declaran otros idiomas |
| Licencia | openmdw-1.1 (etiqueta de HuggingFace: other, con license_name openmdw-1.1) |
| Formato de pesos | GGUF (cuantizaciones i1 e imatrix); el modelo base se distribuye en bf16 (safetensors) |

## Arquitectura y entrenamiento

La arquitectura declarada es Nemotron H, identificada en las etiquetas del repositorio como nemotron_h, nemotron-3.5, mamba y moe. Se trata por tanto de un modelo híbrido que intercala capas de espacio de estados (Mamba) con capas de atención transformer y sustituye las capas densas de alimentación hacia delante por capas de mezcla de expertos con enrutamiento disperso. La etiqueta mtp indica además soporte de multi-token prediction, un objetivo de entrenamiento auxiliar que permite decodificación especulativa con cabezas predictivas propias del modelo. La información proporcionada no detalla el número de capas, la proporción entre capas Mamba y de atención, el número de expertos ni el número de expertos activados por token.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus, las fases de ajuste supervisado, RLHF o DPO aplicadas al modelo original, ni sobre el proceso concreto de abliteration ejecutado por IstroSec. Esta cuantización no introduce ningún entrenamiento adicional: es una conversión de pesos con matrices de importancia calculadas a partir de activaciones del modelo base, en formato GGUF, orientada a inferencia en llama.cpp y compatible con endpoints.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con el modo «thinking» implícito en la familia ThinkingCap; el formato exacto de razonamiento no está documentado en la información disponible.
- Razonamiento y respuesta a instrucciones heredados del modelo base Nemotron 3.5 Lightning.
- Eficiencia de cómputo propia de un MoE con aproximadamente 3B de parámetros activos: el coste por token se aproxima al de un modelo denso de 3B, aunque la memoria requerida es la de 33B.
- Decodificación especulativa mediante multi-token prediction (etiqueta mtp), aprovechable en motores que soporten MTP.
- Respuestas sin rechazo por alineamiento de seguridad: el proceso de abliteration elimina la dirección de rechazo, de modo que el modelo no declina peticiones que un modelo alineado rechazaría.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para servir el modelo tras un servidor de inferencia.
- Soporte de tool calling / function calling: no confirmado ni documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Multilingüismo: limitado al inglés según los metadatos del repositorio.

## Casos de uso

- Generación de texto creativo sin restricciones de contenido: el proceso de abliteration permite usar el modelo para ficción, guiones o narrativa con temáticas que los modelos alineados suelen rechazar; el coste de cómputo por token es bajo gracias a los ~3B parámetros activos.
- Investigación sobre alineamiento y seguridad: sirve como referencia «abliterated» frente a su versión alineada para estudiar qué capacidades y sesgos cambian al eliminar la dirección de rechazo, con cuantizaciones reproducible a partir del fichero imatrix incluido.
- Evaluación de arquitecturas híbridas Mamba-MoE en local: permite medir el comportamiento de Nemotron H en llama.cpp con distintos niveles de cuantización (de IQ1_S a Q6_K) sobre el mismo modelo base.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: la cuantización Q4_K_M ocupa del orden de 20 GB, de modo que el modelo completo cabe en una RTX 4090 o similar, algo inviable con los 66 GB del bf16.
- Servicio de inferencia en CPU con memoria RAM abundante: al activar solo una fracción de los expertos por token, el rendimiento en CPU está limitado por el ancho de banda de memoria pero sigue siendo utilizable para tareas por lotes, resumen o clasificación en inglés.
- Destilación y generación de datos sintéticos: la variante sin censura produce respuestas en dominios que los modelos alineados evitan, lo que la hace útil para construir corpus de entrenamiento en dominios sensibles bajo control humano posterior.
- Pruebas de robustez y red teaming: útil como generador de prompts adversarios y de continuaciones problemáticas en ejercicios de evaluación de filtros y clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la comparación con el modelo base en bf16 no está documentada. Tampoco se han publicado mediciones de perplejidad de las distintas cuantizaciones; el autor únicamente enlaza un gráfico genérico de calidad relativa entre tipos de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 32,9B parámetros, con overhead de contexto de 1-2 GB; son estimaciones, no mediciones publicadas):
  - IQ1_S / IQ1_M / IQ2_XXS: del orden de 7 a 11 GB.
  - IQ2_M / Q3_K_M: del orden de 12 a 16 GB.
  - Q4_K_M / IQ4_XS: del orden de 19 a 21 GB.
  - Q5_K_M: del orden de 22 a 24 GB.
  - Q6_K: del orden de 27 a 29 GB.
  - bf16 (modelo base): del orden de 66 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB, L40S 48 GB o H100 80 GB para Q6_K y para servir varias sesiones concurrentes; A100 80 GB o H100 para el bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB con IQ2/Q3, en 24 GB con Q4_K_M y en 32 GB con Q5/Q6. Por debajo de 12 GB solo son viables las cuantizaciones IQ1/IQ2.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, llama-cpp-python, LM Studio, Ollama tras importar el GGUF). Requiere una compilación reciente de llama.cpp con soporte de la arquitectura nemotron_h; conviene verificar la compatibilidad antes de desplegar. Para vLLM o TGI sería necesario partir del modelo base en safetensors, no del GGUF.
- Offload parcial: al ser MoE, es posible mantener las capas de atención y las capas Mamba en GPU y descargar expertos a RAM, lo que reduce el requisito de VRAM a costa de latencia.
- Latencia y throughput: no se han publicado mediciones. Al activar ~3B parámetros por token, el decode está limitado por el ancho de banda de memoria; en una GPU de 24 GB se puede esperar un throughput notablemente superior al de un denso de 33B, pero sin cifras verificables en la información disponible.

## Comparativa con modelos similares

Los datos de esta cuantización proceden de los metadatos de HuggingFace; los de los modelos alternativos son datos públicos de sus respectivas familias. No hay resultados de benchmarks de ThinkingCap para comparar rendimiento.

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato disponible | Rendimiento comparado |
|---|---|---|---|---|---|
| ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated (esta ficha) | 32,9B / ~3B | No disponible | openmdw-1.1 | GGUF (i1 y estáticas) + bf16 | No disponible |
| Qwen3-30B-A3B | 30,5B / 3,3B | 32K nativo, 131K con YaRN | Apache 2.0 | safetensors, GGUF | No comparable: sin datos de esta ficha |
| Mixtral 8x7B | 46,7B / 12,9B | 32K | Apache 2.0 | safetensors, GGUF | No comparable: sin datos de esta ficha |
| gpt-oss-20b | 21B / 3,6B | 131K | Apache 2.0 | safetensors, GGUF | No comparable: sin datos de esta ficha |

Frente a estas alternativas, la diferencia principal de ThinkingCap es su carácter abliterated (los otros tres mantienen alineamiento de seguridad), su licencia OpenMDW-1.1 en lugar de Apache 2.0 y su arquitectura híbrida Mamba-MoE, que exige soporte específico en el motor de inferencia.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: la abliteration elimina la dirección de rechazo, por lo que el modelo responderá a peticiones dañinas, ilegales o sexualmente explícitas. No debe exponerse a usuarios finales sin filtros externos.
- No apto para producción sin supervisión: el comportamiento del modelo en dominios sensibles es impredecible y puede generar contenido difamatorio, instrucciones peligrosas o material ilícito.
- Riesgo de alucinación: no hay datos publicados de evaluación; al ser una cuantización, las cuantizaciones de 1 a 3 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan de forma notable la coherencia y la fidelidad factual.
- Idiomas: solo inglés declarado. El rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Contexto: la longitud de contexto no está documentada en la información disponible; no deben asumirse ventanas largas sin verificarlo en el modelo base.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con condiciones propias; conviene revisar el fichero LICENSE antes de un uso comercial, ya que no equivale a Apache 2.0 ni a MIT.
- Cadena de responsabilidad: el modelo es una cuantización de un derivado de un tercero (mradermacher sobre IstroSec sobre Nemotron 3.5). Los términos finales dependen de la licencia del modelo original.
- Compatibilidad de motor: la arquitectura híbrida nemotron_h y el soporte de MTP requieren versiones recientes de llama.cpp; en versiones antiguas el modelo no cargará o perderá funcionalidad.
- Sesgos: no hay evaluación de sesgos publicada; los sesgos del corpus de entrenamiento original se heredan y la abliteration puede amplificar respuestas estereotipadas al eliminar la moderación aprendida.
- Repositorio sin adopción: 0 descargas y 0 «likes» en el momento de la consulta, sin validación comunitaria de la calidad de las cuantizaciones.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-i1-GGUF
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-GGUF
- Modelo base (abliterated, bf16): https://huggingface.co/IstroSec/ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated
- Página de descargas del cuantizador: https://hf.tst.eu/model#ThinkingCap-Nemotron-3.5-Lightning-30B-A3B-abliterated-i1-GGUF
- Peticiones y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
- Papers, blogs o demos adicionales: no disponibles; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
