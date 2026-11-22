# mradermacher/dweep-1.7b-GGUF

## Resumen

`mradermacher/dweep-1.7b-GGUF` es la distribucion en formato GGUF del modelo `docanan/dweep-1.7b`, un modelo de lenguaje conversacional de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) afinado mediante LoRA sobre un corpus especifico de las islas Andaman y Nicobar. El modelo base esta orientado a lenguas indicas de bajos recursos y declara soporte para ingles, hindi, tamil, bengali, telugu y malayo, ademas de las lenguas propias del archipiélago. Esta publicacion, realizada por mradermacher, no introduce cambios en los pesos del modelo original: unicamente los convierte a cuantizaciones GGUF para facilitar su ejecucion en hardware de consumo y en entornos con llama.cpp u Ollama.

El interes practico de esta ficha reside en dos factores. Por un lado, ofrece un conjunto amplio de cuantizaciones estaticas (desde Q2_K de 0,9 GB hasta f16 de 3,5 GB) que permiten desplegar un modelo de 1,7B en GPUs de gama baja, portatiles o incluso en CPU. Por otro lado, el modelo base esta especializado en un dominio linguistico poco cubierto por los modelos generalistas, lo que lo hace relevante para investigacion en lenguas de bajos recursos del subcontinente indico y del archipielago.

Conviene subrayar que la model card del repositorio no documenta la arquitectura interna, la longitud de contexto, la composicion del dataset ni resultados de evaluacion. Toda la informacion disponible se limita a los metadatos del repositorio, la lista de cuantizaciones y la referencia al corpus de entrenamiento. Los datos que no constan se indican explicitamente como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no documentado) |
| Parametros totales | 1.720.574.976 (aprox. 1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, hi, ta, bn, te, ml (segun metadatos del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |
| Tamano del repositorio | 16,0 GB |
| Modelo base | docanan/dweep-1.7b |
| Dataset de entrenamiento | docanan/andaman-nicobar-corpus |
| Metodo de ajuste | LoRA |
| Descargas | 672 |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

No se dispone de documentacion tecnica sobre la arquitectura del modelo base `docanan/dweep-1.7b` mas alla de que se trata de un modelo transformer de 1,7B parametros ajustado mediante LoRA sobre el corpus `docanan/andaman-nicobar-corpus`. El ajuste LoRA sugiere que se parte de un modelo preentrenado y se especializa en el dominio linguistico del archipielago mediante adaptadores de bajo rango, lo que reduce el coste computacional del entrenamiento y preserva las capacidades generales del modelo original.

El corpus de entrenamiento esta etiquetado como "andaman", "nicobar", "indic" y "low-resource", lo que indica un enfasis en lenguas con poca representacion en los datasets convencionales. No consta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. Esta publicacion de mradermacher se limita a la conversion y cuantizacion del modelo original sin modificaciones en los pesos.

## Capacidades

- Generacion de texto conversacional en ingles, hindi, tamil, bengali, telugu y malayo, segun los metadatos del modelo base.
- Especializacion en lenguas de bajos recursos del archipielago de Andaman y Nicobar, incluidas variedades locales poco cubiertas por modelos generalistas.
- Ajuste mediante LoRA orientado a dominio, lo que sugiere un comportamiento afinado para el corpus de entrenamiento.
- Ejecucion local en hardware de consumo gracias a las cuantizaciones GGUF de bajo peso.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue en infraestructura de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en lenguas de bajos recursos: el modelo permite experimentar con generacion de texto en variedades de Andaman y Nicobar y en lenguas indicas, un dominio donde los modelos generalistas tienen cobertura limitada. Util para linguistica computacional y preservacion digital.
- Despliegue en portatiles y equipos sin GPU dedicada: la cuantizacion Q4_K_M (1,2 GB) permite ejecutar el modelo en CPU con llama.cpp, adecuado para prototipos y demos locales.
- Traduccion y asistencia linguistica: con soporte declarado para hindi, tamil, bengali, telugu y malayo, puede emplearse en tareas de traduccion asistida o generacion de contenido multilingue en entornos con recursos limitados.
- Educacion y divulgacion: un modelo de 1,7B cuantizado a Q4 o Q5 cabe en GPUs de gama baja (8 GB o menos) y sirve para ensenar conceptos de inferencia local, cuantizacion y ajuste LoRA.
- Procesamiento de documentos regionales: para digitalizar y resumir textos en lenguas indicas de bajos recursos, siempre que se valide la calidad por idioma.
- Chatbot de dominio especifico: dado su ajuste sobre un corpus concreto, puede emplearse como asistente conversacional tematico sobre contenidos del archipielago, con la cautela de validar las respuestas por el riesgo de alucinacion.
- Experimentacion con cuantizaciones: el repositorio ofrece doce variantes (Q2_K a f16) que permiten comparar calidad frente a tamano en un mismo modelo, util para estudiar el impacto de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~1,0 GB; Q3_K_S/M ~1,1 GB; Q3_K_L ~1,2 GB; IQ4_XS ~1,2 GB; Q4_K_S/M ~1,3 GB; Q5_K_S ~1,4 GB; Q5_K_M ~1,5 GB; Q6_K ~1,6 GB; Q8_0 ~2,0 GB; f16 ~3,7 GB (los tamanos de archivo son 0,9 a 3,5 GB; la VRAM anade overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060, RTX 4060 o superior permite Q8_0 y f16 con holgura. Para despliegue en servidor, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4-8 GB de VRAM, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar. Para el modelo base en safetensors, transformers con cuantizacion adicional.
- Latencia y throughput: no disponibles. En un modelo de 1,7B cuantizado a Q4 en GPU de consumo, la generacion suele ser interactiva, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/dweep-1.7b-GGUF | 1,7B | no disponible | Apache 2.0 | GGUF | Especializado en lenguas Andaman/Nicobar e indicas de bajos recursos |
| docanan/dweep-1.7b | 1,7B | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva esta publicacion |
| Modelos generalistas de ~1,7B (p. ej., Qwen2.5-1.5B, SmolLM2-1.7B) | ~1,5-1,7B | 32K-128K (segun modelo) | Apache 2.0 / otras | safetensors, GGUF | Mayor cobertura general y benchmarks publicados, pero sin especializacion en lenguas del archipielago |

La comparativa con modelos generalistas es orientativa: no se dispone de benchmarks del modelo para establecer una comparacion cuantitativa. La ventaja diferencial de `dweep-1.7b` es su especializacion linguistica; su desventaja es la ausencia de documentacion tecnica y de evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no constan arquitectura detallada, contexto maximo, composicion del dataset ni proceso de entrenamiento, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje de 1,7B, especialmente en dominios de bajos recursos, puede generar contenido facticamente incorrecto o inventar terminos en lenguas poco representadas.
- Sesgos desconocidos: no se documentan sesgos de genero, etnicos o culturales; el corpus de entrenamiento, centrado en un archipielago concreto, puede introducir sesgos de dominio.
- Cobertura linguistica limitada: el soporte se declara para seis idiomas (en, hi, ta, bn, te, ml); el rendimiento real por idioma no esta evaluado y puede ser desigual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del corpus de entrenamiento (`docanan/andaman-nicobar-corpus`), que no se detalla en la informacion disponible.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Sin garantias de produccion: al no haber benchmarks ni evaluaciones, no se recomienda su uso en sistemas criticos sin una validacion previa exhaustiva.
- Fecha de creacion futura: el repositorio figura creado el 2026-11-17, dato que conviene contrastar antes de citarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dweep-1.7b-GGUF
- Modelo base: https://huggingface.co/docanan/dweep-1.7b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/dweep-1.7b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#dweep-1.7b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/docanan/andaman-nicobar-corpus
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
