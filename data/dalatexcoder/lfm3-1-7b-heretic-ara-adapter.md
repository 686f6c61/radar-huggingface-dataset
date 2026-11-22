# dalatexcoder/LFM3-1.7B-heretic-ara-adapter

## Resumen

LFM3-1.7B-heretic-ara-adapter es un adaptador de decensura publicado por el usuario dalatexcoder sobre el modelo LiquidAI/LFM3-1.7B, un modelo de texto de 1.700 millones de parametros desarrollado por Liquid AI. El adaptador se ha generado con Heretic v2.1.0, una herramienta que aplica tecnicas de ablation por rangos arbitrarios (Arbitrary-Rank Ablation, ARA) para reducir la tasa de rechazos del modelo base sin reentrenarlo desde cero. El resultado es un modelo que conserva la arquitectura y el conocimiento del original pero responde a peticiones que el modelo alineado rechazaria.

El modelo base LFM3-1.7B emplea una arquitectura tri-hibrida propia de la familia LFM3, orientada a despliegue en el borde (edge) con un contexto de 256.000 tokens y entrenamiento posterior para entornos agénticos como Hermes Agent, Pi y OpenClaw. A 4 bits ocupa aproximadamente 1 GB de memoria, lo que permite ejecutarlo en telefonos y portatiles. El adaptador hereda estas caracteristicas y anade la capa de decensura.

La relevancia de esta ficha radica en que documenta un caso de modificacion de alineamiento sobre un modelo pequeno y de licencia restrictiva: el adaptador reduce los rechazos de 91/100 a 4/100 con una divergencia KL de 0.0364 respecto al original, un dato que cuantifica el coste de la ablation en terminos de distribucion de salida. Es util para investigadores que estudian tecnicas de abliteration y para desarrolladores que necesitan un modelo local sin filtros, siempre asumiendo las implicaciones legales y eticas de la licencia lfm1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (familia LFM3, segun model card del base) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 256.000 tokens (heredado del base LFM3-1.7B) |
| Tipos de cuantizacion | no disponible (el base menciona 4 bits ~1 GB; no se listan formatos en el adaptador) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (adaptador); el base en safetensors |
| Biblioteca | transformers (custom_code) |
| Tamano del repositorio | 0.1 GB |
| Modelo base | LiquidAI/LFM3-1.7B |
| Herramienta de decensura | Heretic v2.1.0 |

## Arquitectura y entrenamiento

El adaptador no introduce una arquitectura nueva: modifica los pesos del modelo base LFM3-1.7B mediante Arbitrary-Rank Ablation (ARA), una tecnica de edicion de pesos que proyecta fuera del espacio de activaciones las direcciones asociadas a comportamientos de rechazo. Los parametros declarados en la model card son start_layer_index=11, end_layer_index=16, preserve_good_behavior_weight=0.3667, steer_bad_behavior_weight=0.0008, overcorrect_relative_weight=0.5329 y neighbor_count=13. La ablation se aplica, por tanto, sobre las capas 11 a 16, un rango intermedio del transformer donde se concentran representaciones semanticas de alto nivel.

El modelo base LFM3-1.7B es un transformer tri-hibrido (combinacion de atencion y componentes de estado segun la familia LFM3 de Liquid AI) post-entrenado para uso agentico con ventana de 256K tokens. La model card del adaptador no detalla el dataset de entrenamiento del base ni el proceso de RLHF/DPO, y tampoco especifica cuantos tokens se usaron en la modificacion (la ablation no requiere entrenamiento supervisado). El resultado declarado es una reduccion de rechazos de 91/100 a 4/100 con una divergencia KL de 0.0364 frente al modelo original, lo que indica que la distribucion de salida se mantiene relativamente proxima al base pese a la perdida de alineamiento.

## Capacidades

- Generacion de texto conversacional en 17 idiomas, incluido el castellano.
- Razonamiento de multiples pasos y soporte para flujos agenticos, heredado del post-entrenamiento del base para Hermes Agent, Pi y OpenClaw.
- Contexto largo de 256.000 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad de respuesta sin rechazos en temas que el modelo alineado bloquearia (4/100 rechazos frente a 91/100 del original).
- Ejecucion local en dispositivos de borde gracias al tamano reducido (1.7B) y al consumo de ~1 GB a 4 bits.
- No se documentan capacidades de vision, audio ni tool calling explicito en la informacion del adaptador; el base es un modelo de texto.

## Casos de uso

- Investigacion sobre tecnicas de abliteration: el adaptador sirve como caso reproducible (directorio `reproduce/`) para medir el impacto de ARA en la tasa de rechazos y la divergencia KL, comparando con el modelo base.
- Generacion creativa sin filtros: escritura de ficcion, guiones o contenido narrativo que el modelo alineado rechazaria por tematica sensible, con contexto de 256K para novelas o sagas extensas.
- Despliegue en dispositivos de borde: ejecucion en telefonos o portatiles con ~1 GB de memoria a 4 bits para asistentes personales offline sin dependencia de la nube.
- Analisis de documentos largos en multiples idiomas: resumen y extraccion de informacion de contratos, informes o corpus multilingues gracias a la ventana de 256K tokens y al soporte de 17 idiomas.
- Prototipado de agentes locales: uso como motor de un agente que necesita razonamiento multi-paso y respuestas sin restricciones tematicas en entornos controlados de laboratorio.
- Evaluacion de sesgos y seguridad: estudio de como la ablation afecta a la calidad, coherencia y sesgos del modelo, comparando las salidas con el original en tareas estandarizadas.
- Fine-tuning especializado en una sola GPU: el base esta disenado para adaptacion rapida a dominios y formatos concretos; el adaptador puede servir como punto de partida para ajustes posteriores.

## Benchmarks y rendimiento

| Metrica | Este modelo | LiquidAI/LFM3-1.7B |
|---|---|---|
| Rechazos (refusals) | 4/100 | 91/100 |
| Divergencia KL | 0.0364 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits (dato del modelo base); en FP16, en torno a 3,4 GB para los pesos mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizacion 4 bits (RTX 3060, RTX 4060, RTX 4090); A100 o H100 no son necesarias para inferencia, aunque aceleran el throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU y dispositivos moviles.
- Opciones de despliegue: transformers (biblioteca declarada, con custom_code); no se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-heretic-ara-adapter | 1.7B | 256K | 4/100 | lfm1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B | 1.7B | 256K | 91/100 | lfm1.0 | Hugging Face (modelo base) |
| Alternativas de 1-2B decensuradas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- La decensura elimina filtros de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico; no debe desplegarse en produccion orientada a usuarios sin moderacion externa.
- La divergencia KL de 0.0364 indica una desviacion medible respecto al base; puede degradar la coherencia, la precision factual y el seguimiento de instrucciones en tareas generales.
- Riesgo de alucinacion: como todo modelo de 1.7B, tiende a inventar datos; la ablation no corrige esta limitacion.
- La licencia lfm1.0 es restrictiva y etiquetada como "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial, y la modificacion de pesos puede tener implicaciones adicionales segun la licencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-22; no hay validacion comunitaria de su calidad.
- No se documentan formatos GGUF ni integracion con Ollama/llama.cpp, lo que limita el despliegue fuera de transformers.
- El soporte de 17 idiomas es una declaracion del autor; no hay evaluaciones publicadas de calidad por idioma.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/dalatexcoder/LFM3-1.7B-heretic-ara-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic: https://heretic-project.org
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
