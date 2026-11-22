# mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF

## Resumen

Olmo-3.1-32B-Instruct-ARA-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic, publicada por mradermacher. El modelo base deriva de la familia Olmo 3.1 de AllenAI (32.233.522.176 parametros, aproximadamente 32B) y ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic, uncensored, abliterated) que elimina o atenua las capas de rechazo y alineacion del modelo original. Esta version GGUF es la que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El interes practico de esta ficha reside en dos factores. Por un lado, ofrece una via de despliegue local de un modelo de 32B con cuantizaciones que van desde Q2_K (12,1 GB) hasta Q8_0 (34,4 GB), lo que lo hace viable en GPUs de consumo con suficiente VRAM. Por otro, la naturaleza "heretic" del modelo implica que se han retirado los mecanismos de rechazo, lo que cambia radicalmente su comportamiento en produccion y exige evaluacion cuidadosa de riesgos.

La licencia declarada es Apache 2.0 (aunque el README incluye tambien la etiqueta openrail++), el idioma declarado es unicamente ingles y el pipeline no esta especificado. La informacion disponible no incluye datos sobre longitud de contexto, arquitectura interna ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Olmo 3.1 de AllenAI; detalles no incluidos en la informacion) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repo i1 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el README incluye tambien la etiqueta openrail++) |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo de 219,8 GB con todos los ficheros |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada. El modelo base pertenece a la familia Olmo 3.1 de AllenAI, y el dataset referenciado en las etiquetas es allenai/Dolci-Instruct-RL, lo que sugiere un ajuste por instrucciones con refuerzo (RL) sobre una base preentrenada. No se confirman detalles sobre RLHF, DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.).

La innovacion relevante de esta publicacion es el proceso de "abliteration" aplicado por richardyoung en el modelo base, que da lugar a la variante "heretic". Este tipo de intervencion modifica los pesos para suprimir la direccion de rechazo aprendida durante la alineacion, de modo que el modelo deja de negarse a responder ante ciertas peticiones. mradermacher se limita a cuantizar ese modelo base a GGUF, sin reentrenamiento adicional. Las cuantizaciones son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se ofrece ademas un repositorio separado con cuantizaciones ponderadas/imatrix.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Olmo 3.1 Instruct.
- Respuesta a instrucciones sin los rechazos tipicos del modelo alineado, debido al proceso de abliteration.
- Razonamiento y respuesta multi-turno (formato conversacional segun las etiquetas).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: solo se declara ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion.

## Casos de uso

- Despliegue local de un modelo de 32B en GPU de consumo: gracias a las cuantizaciones Q4_K_S (18,5 GB) y Q4_K_M (19,6 GB), puede ejecutarse en tarjetas con 24 GB de VRAM mediante llama.cpp u Ollama, sin depender de APIs externas.
- Experimentacion en investigacion sobre alineacion y seguridad: la variante heretic permite estudiar el comportamiento de un modelo con los rechazos suprimidos, comparandolo con el Olmo original para analizar que se pierde y que se gana en el proceso de abliteration.
- Generacion de texto creativo sin restricciones de contenido: para tareas de escritura de ficcion, guiones o narrativa donde los filtros del modelo alineado resultan limitados, con la advertencia de que la salida debe revisarse.
- Prototipado de asistentes conversacionales en ingles: el formato conversacional y la compatibilidad con endpoints permiten integrarlo en prototipos de chat multi-turno sobre infraestructura propia.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes (de Q2_K a Q8_0) mas las versiones imatrix, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un modelo de 32B concreto.
- Fine-tuning posterior sobre la version Q8_0 o Q6_K: las cuantizaciones de mayor calidad (26,5 GB y 34,4 GB) sirven como base para experimentos de ajuste o destilacion en entornos con GPU de 40-80 GB.
- Analisis de robustez frente a contenido sensible: util para equipos de seguridad que quieran probar clasificadores o filtros externos sobre un modelo que no se autocensura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano del fichero GGUF, mas overhead de contexto):
  - Q2_K: 12,1 GB
  - Q3_K_S: 14,2 GB
  - Q3_K_M: 15,7 GB
  - Q3_K_L: 17,0 GB
  - IQ4_XS: 17,6 GB
  - Q4_K_S: 18,5 GB
  - Q4_K_M: 19,6 GB
  - Q5_K_S: 22,3 GB
  - Q5_K_M: 23,0 GB
  - Q6_K: 26,5 GB
  - Q8_0: 34,4 GB
- GPU recomendadas: para Q4_K_M en adelante, RTX 3090 o RTX 4090 (24 GB) son suficientes; para Q5_K_M y superiores conviene 32 GB o mas (A100 40 GB, RTX A6000). Q8_0 requiere al menos 40 GB de VRAM para caber con contexto razonable.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4_K_S, Q4_K_M e IQ4_XS; en tarjetas de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base es de transformers y las cuantizaciones imatrix estan en el repo mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Olmo-3.1-32B-Instruct-ARA-heretic-GGUF (este) | 32,2B | no disponible | GGUF | apache-2.0 | Variante abliterated, solo ingles |
| richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic | 32,2B | no disponible | safetensors (transformers) | apache-2.0 | Modelo base sin cuantizar del que deriva este |
| Olmo 3.1 32B Instruct original (AllenAI) | 32B (aprox.) | no disponible | safetensors | no disponible en la informacion | Version alineada, con rechazos; no se dispone de datos de rendimiento |
| Otras cuantizaciones GGUF de Olmo 3.1 32B | 32B (aprox.) | no disponible | GGUF | no disponible en la informacion | Alternativas sin abliteration; no se dispone de comparativa de benchmarks |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos del modelo alineado: puede generar contenido ofensivo, ilegal o danino sin filtro interno. No es apto para produccion orientada al publico sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como modelo de 32B sin datos de benchmarks, la fiabilidad factual no esta verificada.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- La licencia declarada es Apache 2.0, pero el README incluye tambien la etiqueta openrail++, lo que genera ambiguedad sobre las restricciones de uso comercial. Conviene verificar la licencia del modelo base y de la variante heretic antes de uso comercial.
- La abliteration puede degradar capacidades generales (razonamiento, instrucciones complejas) respecto al Olmo 3.1 original; no hay datos que cuantifiquen esa perdida.
- El repositorio ocupa 219,8 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo fichero es imprescindible.
- Modelo con 0 likes y 915 descargas en el momento de la ficha: comunidad pequena, sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-ARA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Olmo-3.1-32B-Instruct-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Olmo-3.1-32B-Instruct-ARA-heretic-GGUF
- Dataset referenciado: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
