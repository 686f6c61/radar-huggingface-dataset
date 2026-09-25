# HyoungBaek/supergemma4-e4b-abliterated-litertlm

## Resumen

Supergemma4-e4b-abliterated-litertlm es un modelo de generacion de texto publicado por el usuario HyoungBaek en Hugging Face. Se trata de una variante "abliterated" (con el comportamiento de rechazo atenuado) de un modelo de la familia Gemma con nomenclatura E4B, distribuida especificamente en el formato LiteRT-LM (.litertlm) que Google emplea para inferencia en dispositivo (on-device) sobre moviles, portatiles y hardware edge. El repositorio ocupa 8,2 GB y se distribuye bajo licencia Apache 2.0.

La denominacion "supergemma4" hace referencia a un linaje de ajustes derivados de la base instruccional de Gemma (fuentes de terceros mencionan una base Gemma 4 E4B para la variante equivalente de otro autor), sobre la que se aplica un proceso de abliteration para reducir la tasa de respuestas negativas o evasivas, ademas de un endurecimiento de calidad orientado a mejorar la coherencia y el formateo de salida. La etiqueta E4B sigue la convencion de Gemma 3n/4 para modelos con un numero de parametros "efectivos" en torno a 4.000 millones, aunque el autor no confirma cifras exactas en la model card.

La relevancia de esta ficha radica en dos factores: por un lado, el formato LiteRT-LM, poco habitual en el ecosistema de pesos abiertos, que apunta a despliegues locales de baja latencia sin depender de CUDA; por otro, el caracter abliterated, que interesa a quienes necesitan un comportamiento menos restrictivo en generacion creativa, rol o determinados dominios tecnicos. La model card del autor es practicamente vacia (solo incluye la linea de licencia), por lo que buena parte de las especificaciones que siguen se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la arquitectura del modelo base de la familia Gemma; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | no disponible (la nomenclatura E4B sugiere ~4.000 millones de parametros efectivos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; existen variantes GGUF de modelos homonimos en terceros (~1,84 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT-LM (.litertlm) |
| Tamano del repositorio | 8,2 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de publicacion | 2026-09-25 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada por el autor sobre la arquitectura concreta, el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de alineacion (RLHF, DPO u otros). La model card se limita a declarar la licencia Apache 2.0. Por el nombre del repositorio se deduce que se parte de un modelo base de la familia Gemma con etiqueta E4B y que se le aplica abliteration, una tecnica que identifica la direccion de activacion asociada al rechazo y la elimina u ortogonaliza en los pesos, reduciendo la tendencia del modelo a negarse a responder.

El rasgo tecnico diferencial de esta publicacion concreta no es el ajuste, sino el formato de empaquetado: LiteRT-LM (.litertlm) es el contenedor de Google para ejecutar modelos de lenguaje en el runtime LiteRT (anteriormente TFLite), pensado para inferencia en CPU, GPU movil y aceleradores NPU sin necesidad de pila CUDA. Fuentes de terceros sobre variantes homonimas (por ejemplo, el modelo de Jiunsong) mencionan un pipeline de "quality hardening" con puntuaciones de release-quality 92,34 y exact-eval 98,50, coincidencia exacta del 100 % en JSON y puntuaciones exactas en codigo y correccion de errores, ademas de ejecucion en BF16 estandar. Estos datos corresponden a otros repositorios del mismo linaje y no estan verificados para este .litertlm en concreto.

## Capacidades

- Generacion de texto en lenguaje natural, sobre la base instruccional de Gemma.
- Comportamiento "abliterated": menor tasa de rechazo ante peticiones que un modelo alineado convencional declinaria, util en generacion creativa y dominios tecnicos sensibles.
- Formateo estructurado de salida: los datos de terceros sobre la variante equivalente reportan coincidencia exacta del 100 % en JSON.
- Generacion y correccion de codigo: las mismas fuentes reportan puntuaciones exactas en tareas de codigo y bug-fix.
- Ejecucion on-device mediante el runtime LiteRT-LM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente local en dispositivo movil: gracias al formato LiteRT-LM, el modelo esta pensado para ejecutarse en telefono o tablet mediante el runtime LiteRT, sin conexion a internet, lo que resulta adecuado para aplicaciones de chat privado.
- Generacion creativa sin filtros excesivos: el proceso de abliteration reduce los rechazos, por lo que es util en escritura de ficcion, guiones o narrativa que otros modelos alineados bloquearian por prudencia.
- Prototipado rapido en escritorio sin GPU dedicada: al no requerir la pila CUDA, puede desplegarse en portatiles con CPU moderna o GPU integrada para pruebas de concepto.
- Extraccion y formateo de datos estructurados: la alta coincidencia en JSON reportada para variantes homonimas lo hace candidato para convertir texto libre en objetos JSON en pipelines ligeros.
- Asistencia de codigo en entornos locales: las puntuaciones exactas en tareas de codigo y bug-fix de terceros apuntan a su uso como copiloto de programacion offline en equipos con recursos limitados.
- Automatizacion de tareas en el borde (edge computing): integrable en dispositivos IoT o equipos industriales que necesiten generacion de texto local con baja dependencia de red.
- Experimentacion con tecnicas de abliteration: util como objeto de estudio para investigadores que analicen como cambia el comportamiento y la seguridad al eliminar la direccion de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio concreto. La model card del autor no incluye ninguna tabla de resultados.

Como referencia externa, y sin que pueda atribuirse a este .litertlm, el modelo homonimo de Jiunsong (supergemma4-e4b-abliterated) reporta en aimodels.fyi:

| Metrica | Valor reportado (variante de terceros, no verificada para este repo) |
|---|---|
| Release-quality score | 92,34 |
| Exact-eval score | 98,50 |
| JSON exact-match | 100 % |
| Codigo / bug-fix exact | puntuaciones exactas (valor numerico no disponible) |
| Precision de ejecucion | BF16 |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas estandar para esta publicacion.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Como orientacion a partir del tamano del repositorio (8,2 GB), el empaquetado parece corresponder a precision BF16 sobre un modelo de ~4.000 millones de parametros; en INT4 el peso rondaria los 2-3 GB.
- GPU recomendadas: no disponibles. Al tratarse de LiteRT-LM, el objetivo declarado es la inferencia en CPU, GPU movil y NPU, mas que en GPU de datacenter.
- GPU de consumo: probablemente ejecutable en cualquier GPU de consumo con al menos 8 GB de VRAM si se convierte a un runtime compatible, pero no confirmado por el autor.
- Opciones de despliegue: el formato nativo es LiteRT-LM (runtime LiteRT). Para vLLM, llama.cpp, Ollama o TGI haria falta una conversion previa a safetensors o GGUF; no se documenta ninguna en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyoungBaek/supergemma4-e4b-abliterated-litertlm (este modelo) | no disponible (~E4B) | no disponible | .litertlm | Apache 2.0 | Hugging Face, 0 descargas |
| typomonster/supergemma4-e4b-abliterated-litert-lm | no disponible (~E4B) | no disponible | LiteRT-LM | no disponible | Hugging Face |
| jiunsong/supergemma4-e4b-abliterated | no disponible (~E4B) | no disponible | BF16 (safetensors presumible) | no disponible | Hugging Face |
| Variante GGUF de supergemma4-e4b-abliterated (local-ai-zone) | no disponible | no disponible | GGUF (~1,84 GB) | no disponible | local-ai-zone, 280 descargas, 7 likes |
| SuperGemma4 (base Gemma 4 26B A4B, SourceForge) | 26B A4B (MoE, no confirmado) | no disponible | no disponible | no disponible | SourceForge |

No se dispone de datos suficientes para comparar rendimiento numerico entre estas variantes. La comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al derivar de Gemma, es probable que herede sesgos del modelo base, pero el autor no documenta ninguna evaluacion.
- Riesgo de alucinacion: no evaluado. Los datos de terceros sobre el linaje "abliterated" no incluyen estudios de factualidad.
- Abliteration y seguridad: la eliminacion de la direccion de rechazo puede incrementar la probabilidad de generar contenido danino, sesgado o inexacto. No se recomienda su uso en produccion orientada al publico sin una capa de moderacion adicional.
- Limitaciones de contexto e idioma: no disponibles; el autor no declara ventana de contexto ni idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Gemma subyacente, ya que las condiciones de Google pueden imponer restricciones adicionales sobre el modelo derivado.
- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion ni uso previsto, lo que dificulta la trazabilidad y el cumplimiento normativo.
- Formato restringido: al distribuirse unicamente en .litertlm, su integracion en stacks habituales (vLLM, TGI, Ollama) requiere conversion manual no documentada.
- Adopcion minima: 0 descargas y 1 like en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HyoungBaek/supergemma4-e4b-abliterated-litertlm
- Variante homonima de typomonster: https://huggingface.co/typomonster/supergemma4-e4b-abliterated-litert-lm
- Variante GGUF en local-ai-zone: https://local-ai-zone.github.io/models/supergemma4-e4b-abliterated.html
- Ficha de SuperGemma4 en SourceForge: https://sourceforge.net/projects/supergemma4/
- Analisis de la variante de Jiunsong en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/supergemma4-e4b-abliterated-jiunsong
