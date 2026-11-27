# mradermacher/Luminous-Chimera-8B-GGUF

## Resumen

Luminous-Chimera-8B-GGUF es la distribucion en formato GGUF del modelo Luminous-Chimera-8B, un merge de modelos de 8.030.261.312 parametros creado por el usuario Kanjdoes mediante mergekit. Esta version la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que distribuye los pesos originales en multiples niveles de cuantizacion para su uso con llama.cpp y herramientas compatibles.

El modelo no es un entrenamiento desde cero, sino una fusion (merge) de otros modelos, y esta pensado para conversacion en ingles (tag `conversational`). Su relevancia practica radica en que, al estar disponible en GGUF con cuantizaciones desde Q2_K hasta f16, puede ejecutarse en hardware de consumo con requisitos de VRAM relativamente modestos para un modelo de 8B.

La informacion publicada por el autor del GGUF es escasa: no se detalla la arquitectura exacta, la longitud de contexto, la licencia ni los datos de entrenamiento del modelo base. Todo lo que se sabe con certeza es el numero de parametros, el idioma (ingles) y el conjunto de cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de tipo transformer derivado de un merge con mergekit; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (y variantes i1 ponderadas/imatrix en el repo hermano) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base Kanjdoes/Luminous-Chimera-8B esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. El modelo base Kanjdoes/Luminous-Chimera-8B esta etiquetado con `mergekit` y `merge`, lo que indica que se obtuvo mediante fusion de pesos de otros modelos (model merging) en lugar de un entrenamiento convencional. No se especifica que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, linear, etc.) ni con que pesos.

Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo etapas de RLHF o DPO. Al tratarse de un merge, el conocimiento y las capacidades provienen de los modelos originales fusionados, pero esa informacion no se detalla en la model card disponible. La unica innovacion tecnica documentada es la propia cuantizacion GGUF realizada por mradermacher, con variantes estaticas y un repo separado con cuantizaciones ponderadas/imatrix (i1).

## Capacidades

- Generacion de texto y conversacion en ingles (tag `conversational`).
- Compatible con el ecosistema transformers y con endpoints (`endpoints_compatible`).
- Uso previsto como modelo de chat multi-turno, segun la etiqueta de conversacion.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: solo se declara ingles; no se garantiza soporte de otros idiomas.
- No se especifican capacidades especiales de razonamiento, codigo o matematicas en la informacion proporcionada.

## Casos de uso

- Chat conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en equipos de consumo usando cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB), adecuado para prototipos de asistentes personales sin conexion.
- Experimentacion con model merging: util para investigadores que quieran evaluar el comportamiento de un merge de 8B frente a sus modelos origen, cargando distintas cuantizaciones para comparar calidad y velocidad.
- Despliegue en entornos con VRAM limitada: la variante Q2_K (3,3 GB) permite ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU con RAM suficiente, util para pruebas en portatiles.
- Generacion de texto por lotes en ingles: con Q8_0 (8,6 GB) o f16 (16,2 GB) en GPUs de 12-24 GB se puede usar para tareas de redaccion, resumen o parafraseo donde no se requiera un modelo mayor.
- Base para fine-tuning o adaptadores: partiendo del modelo original en safetensors (Kanjdoes/Luminous-Chimera-8B) se puede ajustar con LoRA para dominios concretos en ingles antes de recuantizar a GGUF.
- Evaluacion comparativa de cuantizaciones: el amplio conjunto de variantes (de Q2_K a f16) permite medir el impacto de la cuantizacion en perplejidad y calidad para este modelo concreto en pipelines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: para Q4_K_M/Q5_K_M basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; para Q8_0 se recomienda RTX 4090 (24 GB) o A100/H100 si se busca mayor throughput; f16 requiere al menos 24 GB y deja poco margen en una RTX 4090.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q4_K_M en adelante en GPUs de 8-12 GB; Q2_K en GPUs de 4-6 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas objetivas. Se comparan alternativas de tamano similar (8B) ampliamente disponibles en GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luminous-Chimera-8B-GGUF | 8,03B | no disponible | no disponible | GGUF | Merge comunitario, solo ingles |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | GGUF, safetensors | Modelo oficial de Meta, multilingue |
| Mistral 7B Instruct | 7,3B | 32K | Apache 2.0 | GGUF, safetensors | Licencia permisiva, amplio ecosistema |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 (mayoria de variantes) | GGUF, safetensors | Multilingue, buen rendimiento en codigo |

La comparativa de rendimiento real no esta disponible porque no se han publicado benchmarks de Luminous-Chimera-8B en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor del modelo base antes de usarlo en produccion.
- Solo ingles: no se declara soporte de otros idiomas, por lo que el rendimiento en castellano u otras lenguas es incierto.
- Al ser un merge sin documentacion de entrenamiento, el riesgo de alucinacion y los sesgos heredados de los modelos originales no estan caracterizados.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Modelo comunitario con 0 likes y 415 descargas en el momento de la consulta: ecosistema pequeno, poca validacion externa y soporte limitado.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No hay garantia de compatibilidad con tool calling ni con plantillas de chat especificas; habra que verificar el template del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luminous-Chimera-8B-GGUF
- Modelo base: https://huggingface.co/Kanjdoes/Luminous-Chimera-8B
- Cuantizaciones i1 (ponderadas/imatrix): https://huggingface.co/mradermacher/Luminous-Chimera-8B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Luminous-Chimera-8B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
