# mradermacher/C4.1-Broken-Tutu-24B-GGUF

## Resumen

C4.1-Broken-Tutu-24B-GGUF es la version cuantizada en formato GGUF del modelo C4.1-Broken-Tutu-24B, un merge de modelos de 23.572.403.200 parametros (aproximadamente 23,6B) publicado por el usuario ReadyArt y cuantizado por mradermacher. El modelo esta construido mediante mergekit, la herramienta de fusion de modelos, y esta orientado explicitamente a roleplay, narrativa explicita, ERP (erotic roleplay), terror y violencia, con la etiqueta "unaligned" que indica que no ha pasado por un proceso de alineamiento de seguridad convencional.

El modelo base es de tipo transformer denso (no se dispone de informacion sobre la arquitectura exacta de los modelos fusionados) y esta pensado para conversacion en ingles. La licencia declarada es Apache 2.0. El repositorio GGUF ocupa 161,4 GB e incluye once variantes de cuantizacion, desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), lo que permite desplegarlo en un rango amplio de hardware, desde GPUs de consumo hasta estaciones de trabajo.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho con solo 84 descargas y 2 likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Su interes principal radica en ser un ejemplo de la practica de merging de modelos para obtener comportamientos creativos y sin restricciones, y en la disponibilidad de cuantizaciones GGUF listas para usar con llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de mergekit; arquitectura interna de los modelos fusionados no disponible) |
| Parametros totales | 23.572.403.200 (aproximadamente 23,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (tambien existe una variante i1 con imatrix en repositorio separado) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta en formato transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion (merge) realizada con mergekit a partir de modelos no especificados en la informacion disponible. No se documenta la receta de fusion (metodo de merge, pesos, capas afectadas), ni los modelos de origen, ni el numero de tokens de entrenamiento. Tampoco se indica si hubo fases de fine-tuning posteriores, RLHF o DPO. La etiqueta "unaligned" sugiere que el modelo no ha sido sometido a un proceso de alineamiento de seguridad, y las etiquetas "nsfw", "explicit", "ERP", "Horror" y "Violence" indican que el contenido generado puede incluir material adulto y grafico.

La unica innovacion tecnica documentada es la propia cuantizacion: mradermacher proporciona cuantizaciones estaticas (este repositorio) y cuantizaciones ponderadas con imatrix en un repositorio separado (C4.1-Broken-Tutu-24B-i1-GGUF), que suelen ofrecer mejor calidad por tamano. No se dispone de informacion sobre atencion lineal, decodificacion especulativa ni otras tecnicas de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay y narrativa.
- Roleplay explicito y ERP (erotic roleplay), segun las etiquetas del autor.
- Narrativa de terror y violencia grafica.
- Estilo "unaligned": menor rechazo a peticiones que los modelos alineados rechazarian.
- Conversacion multi-turno (el tag "conversational" aparece en el repositorio).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Roleplay conversacional de ficcion: el modelo puede mantener dialogos multi-turno con personajes, gracias a su orientacion explicita a roleplay y a la ausencia de alineamiento de seguridad que limita otros modelos en este terreno.
- Escritura creativa de ficcion adulta: adecuado para generar narrativa explicita o de terror donde otros modelos aplican filtros, segun las etiquetas del autor.
- Prototipado de videojuegos narrativos: puede usarse como motor de dialogo para NPCs en juegos con tematica adulta o de terror, desplegado localmente con llama.cpp.
- Experimentacion en investigacion sobre merging: sirve como caso de estudio de fusion de modelos con mergekit y de sus efectos en el estilo y el comportamiento.
- Generacion de guiones para contenido de ficcion oscura: util para guionistas que necesitan material de terror o violencia sin restricciones de contenido.
- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_S y Q4_K_M (13,6 y 14,4 GB) permiten ejecutarlo en GPUs de consumo con 16 GB o mas de VRAM, lo que facilita su uso sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye pesos y overhead de contexto, orientativa):
  - Q2_K: aproximadamente 9-10 GB.
  - Q3_K_M: aproximadamente 12-13 GB.
  - IQ4_XS: aproximadamente 13-14 GB.
  - Q4_K_M: aproximadamente 14-16 GB.
  - Q5_K_M: aproximadamente 17-19 GB.
  - Q6_K: aproximadamente 19-21 GB.
  - Q8_0: aproximadamente 25-27 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 o RTX 4080 (16 GB) para Q4_K_S; A100 40 GB o H100 para Q8_0 y contextos largos; GPUs con 8-12 GB solo pueden ejecutar Q2_K o Q3_K_S con contexto reducido o descarga parcial a CPU.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas para las cuantizaciones Q4; en 24 GB para Q5 y Q6.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base original puede usarse con transformers.
- Latencia y throughput: no disponibles. Como referencia general para 24B en GGUF, el rendimiento depende del hardware y de la cuantizacion, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de informacion sobre los modelos fusionados, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| C4.1-Broken-Tutu-24B-GGUF | 23,6B | No disponible | Apache 2.0 | GGUF | Roleplay/NSFW sin alinear |
| Modelos de roleplay GGUF de 20-30B (genericos) | 20-30B | Variable | Variable | GGUF | Roleplay/NSFW |
| Modelos base densos de 24B (genericos) | 24B | Variable | Variable | Safetensors/GGUF | Proposito general |

No disponible informacion sobre alternativas concretas comparables en rendimiento.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar material NSFW, erotico, de terror y violento; no es adecuado para aplicaciones orientadas a publico general.
- Modelo "unaligned": no ha pasado por alineamiento de seguridad, por lo que puede producir contenido danino, sesgado u ofensivo sin filtros.
- Riesgo de alucinacion: al no disponer de benchmarks ni de documentacion de entrenamiento, no se puede evaluar su fiabilidad factual; se recomienda no usarlo para tareas de recuperacion de hechos.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas sobre material adulto o violento; el usuario asume la responsabilidad legal.
- Madurez: solo 84 descargas y 2 likes, sin comunidad ni mantenimiento documentado; la fecha de actualizacion (2026) no garantiza correcciones.
- Sin benchmarks: no hay evidencia publica de calidad, por lo que cualquier evaluacion debe hacerse mediante pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/C4.1-Broken-Tutu-24B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/C4.1-Broken-Tutu-24B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/C4.1-Broken-Tutu-24B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#C4.1-Broken-Tutu-24B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
