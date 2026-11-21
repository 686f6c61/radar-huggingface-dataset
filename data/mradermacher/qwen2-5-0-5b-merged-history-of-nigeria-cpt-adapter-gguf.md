# mradermacher/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter-GGUF

## Resumen

El modelo `Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter-GGUF` es una cuantizacion estatica en formato GGUF del modelo base `Cyber-Maphian/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter`, publicada por el usuario mradermacher. Se trata de un ajuste fino por adaptacion de dominio (continued pretraining, CPT) sobre el modelo Qwen2.5-0.5B de Alibaba, especializado en contenido historico de Nigeria mediante el dataset `Cyber-Maphian/History_of_Nigeria`. El resultado es un modelo conversacional pequeno (494 millones de parametros) orientado a consultas sobre historia nigeriana en ingles.

La relevancia de esta publicacion es fundamentalmente practica: mradermacher distribuye el modelo original (que solo estaba disponible en formato transformers/safetensors) en once variantes de cuantizacion GGUF, desde Q2_K (0,4 GB) hasta f16 (1,1 GB), lo que permite ejecutarlo en hardware muy modesto, incluidos CPU y GPUs de gama baja. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados.

Conviene subrayar que este repositorio no aporta innovacion arquitectonica ni mejoras de rendimiento: es una conversion de formato de un modelo base pequeno ya adaptado a un dominio concreto. Su interes radica en la especializacion tematica y en la facilidad de despliegue local, no en capacidades generales de razonamiento o generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B; el autor no la declara) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2.5. Sobre esa base se aplico un proceso de continued pretraining (CPT) mediante un adaptador LoRA, segun indican las etiquetas del repositorio (`lora`, `continued-pretraining`, `domain-adaptation`). El dataset empleado es `Cyber-Maphian/History_of_Nigeria`, orientado a contenido historico de Nigeria. El adaptador resultante se fusiono (merged) con el modelo base, dando lugar al checkpoint `Cyber-Maphian/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter`, que es el que mradermacher ha convertido a GGUF.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Las cuantizaciones publicadas son estaticas; el autor indica que las cuantizaciones ponderadas/imatrix no estan disponibles por el momento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-0.5B.
- Conocimiento especializado en historia de Nigeria gracias al continued pretraining sobre el dataset correspondiente.
- Soporte de conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Capacidades generales de razonamiento, codigo y matematicas limitadas por el tamano reducido del modelo (0,5B).
- No se documenta soporte explicito de tool calling, function calling ni modos de agente.
- No se documenta soporte de vision ni audio.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Consultas historicas sobre Nigeria: el modelo puede responder preguntas sobre eventos, periodos y figuras de la historia nigeriana, aprovechando el ajuste de dominio realizado sobre el dataset especifico. Adecuado para prototipos de asistentes tematicos.
- Despliegue en hardware de bajos recursos: con cuantizaciones de 0,4-0,6 GB, puede ejecutarse en CPU, Raspberry Pi o GPUs integradas, lo que lo hace util para demos offline o entornos sin acelerador dedicado.
- Educacion y divulgacion: integracion en aplicaciones educativas locales que necesiten un asistente ligero sobre historia de Nigeria, ejecutable sin conexion.
- Prototipado rapido de pipelines RAG: al ser compatible con endpoints y ligero, sirve como modelo de prueba en arquitecturas de recuperacion aumentada antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto historico: puede emplearse para tareas auxiliares de etiquetado o resumen de documentos historicos en ingles dentro de un pipeline mayor.
- Investigacion sobre adaptacion de dominio: util como caso de estudio de continued pretraining con LoRA sobre modelos pequenos, comparando el comportamiento antes y despues del ajuste.
- Chatbot de nicho embebido: su tamano permite incrustarlo en aplicaciones de escritorio o moviles con llama.cpp u Ollama para conversaciones acotadas al dominio historico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,8 GB con cuantizaciones Q4_K_M o Q5_K_M; en torno a 1,2-1,5 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, etc.); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en graficas integradas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en hardware moderno, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter-GGUF | 494M | no disponible | apache-2.0 | GGUF | Especializado en historia de Nigeria |
| Qwen2.5-0.5B (base) | 494M | 32K (segun documentacion de Qwen2.5) | apache-2.0 | safetensors, GGUF | Modelo generalista sin ajuste de dominio |
| Qwen2.5-1.5B | 1.5B | 32K (segun documentacion de Qwen2.5) | apache-2.0 | safetensors, GGUF | Mayor capacidad general, mas recursos |
| SmolLM2-360M | 360M | no disponible | apache-2.0 | safetensors, GGUF | Alternativa pequena generalista |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para el modelo especializado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: capacidad de razonamiento, coherencia y conocimiento general muy limitada en comparacion con modelos mayores.
- Riesgo elevado de alucinacion, especialmente fuera del dominio historico de Nigeria para el que fue ajustado.
- Sesgos potenciales derivados del dataset `History_of_Nigeria`, cuya composicion y calidad no estan documentadas.
- Soporte unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- La longitud de contexto no esta declarada en la model card; conviene verificar la configuracion del modelo base antes de usarlo con entradas largas.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado ni sobre la exactitud historica.
- Repositorio con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix disponibles, lo que puede afectar la calidad respecto a otras distribuciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter-GGUF
- Modelo base (merged): https://huggingface.co/Cyber-Maphian/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter
- Dataset: https://huggingface.co/datasets/Cyber-Maphian/History_of_Nigeria
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
