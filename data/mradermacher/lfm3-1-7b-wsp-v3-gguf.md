# mradermacher/LFM3-1.7B-WSP-V3-GGUF

## Resumen

LFM3-1.7B-WSP-V3-GGUF es la version cuantizada en formato GGUF del modelo Sayansantra/LFM3-1.7B-WSP-V3, un ajuste fino de la familia LFM3 (Liquid Foundation Model 3) de 1.728 millones de parametros. La cuantizacion la ha realizado mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos open source para su uso con llama.cpp y ecosistemas derivados (Ollama, LM Studio, etc.). El modelo base incorpora la tecnica denominada weight-space programming (WSP), que el autor asocia a capacidades agenticas, tool calling, matematicas y generacion de codigo.

El interes practico de esta publicacion reside en que pone a disposicion un modelo de 1,7 mil millones de parametros con un rango amplio de cuantizaciones estaticas (desde Q2_K de 0,9 GB hasta f16 de 3,6 GB), lo que permite ejecutarlo en hardware muy modesto, incluidas GPU de consumo con 4-8 GB de VRAM o incluso en CPU. Es, por tanto, una opcion orientada a prototipado rapido, despliegue en el borde y experimentacion con modelos pequenos especializados en tareas agenticas.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento del modelo base ni resultados de benchmarks en la documentacion proporcionada. La licencia del modelo base es lfm1.0 (Liquid AI Foundation Model License), que impone restricciones de uso comercial que deben revisarse antes de un despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3, segun tags del modelo base); detalles no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (Liquid AI Foundation Model License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Sayansantra/LFM3-1.7B-WSP-V3 pertenece a la familia LFM3 de Liquid AI, aunque la model card no detalla la arquitectura interna (tipo de atencion, uso de capas hibridas, etc.). El sufijo "WSP-V3" hace referencia a weight-space programming, una tecnica que el autor asocia a la mejora de capacidades agenticas y de tool calling. Los tags del modelo indican especializacion en agentic, tool-calling, math y coding, lo que sugiere un ajuste fino orientado a tareas de razonamiento estructurado y uso de herramientas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es de tipo estatico (sin imatrix/weighted quants, segun la propia model card), lo que implica que no se han generado versiones optimizadas con importancia de pesos; el autor indica que estas podrian no estar disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, segun los tags conversational y en.
- Razonamiento matematico (tag math), presumiblemente orientado a problemas de tipo GSM8K o similares.
- Generacion de codigo (tag coding).
- Tool calling / function calling (tag tool-calling).
- Comportamiento agentico y razonamiento multi-paso (tag agentic).
- Integracion con el ecosistema GGUF: compatible con llama.cpp, Ollama, LM Studio y otros runners que acepten este formato.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades de vision, audio ni modos de pensamiento extendido (thinking mode).

## Casos de uso

- Prototipado de agentes locales: el modelo puede ejecutarse en una estacion de trabajo con una GPU de consumo y utilizarse para validar flujos de tool calling antes de migrar a un modelo mayor, gracias a su reducido tamano (1,2 GB en Q4_K_M).
- Asistente de codigo en el editor: integrable mediante llama.cpp u Ollama para autocompletado y generacion de fragmentos en ingles, con latencia baja en GPU de gama media.
- Automatizacion de tareas de razonamiento matematico: util para resolver problemas paso a paso en pipelines educativos o de validacion, dado el tag math del modelo base.
- Despliegue en el borde (edge): al caber en 1-2 GB de VRAM o incluso en CPU, puede embeberse en dispositivos con recursos limitados para tareas de clasificacion o generacion corta.
- Experimentacion con weight-space programming: investigadores interesados en evaluar la tecnica WSP pueden usar las cuantizaciones para comparar comportamiento frente al modelo base en safetensors.
- Chatbot de soporte tecnico en ingles: adecuado para conversaciones multi-turno simples, aunque limitado por la ausencia de datos publicos sobre la ventana de contexto.
- Evaluacion comparativa de cuantizaciones: el amplio rango de quants (Q2_K a f16) permite estudiar el impacto de la cuantizacion en calidad para un modelo de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,9 GB con Q8_0 y 3,6 GB con f16 (sin contar overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3050, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas pero funcionales. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. No se recomienda vLLM ni TGI para este formato (requieren safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU de consumo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-WSP-V3-GGUF | 1,73B | no disponible | lfm1.0 | GGUF | Especializado en agentic/tool calling/math/coding |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K (tipico) | Apache 2.0 | safetensors, GGUF | Alternativa generalista con licencia permisiva |
| Llama-3.2-1B-Instruct | 1,24B | 128K | Llama 3.2 Community | safetensors, GGUF | Menor, contexto amplio, licencia restrictiva |
| SmolLM2-1.7B-Instruct | 1,71B | 8K (tipico) | Apache 2.0 | safetensors, GGUF | Tamano casi identico, licencia permisiva |

La comparativa se basa en caracteristicas publicas conocidas de esos modelos; no se dispone de datos de rendimiento del LFM3-1.7B-WSP-V3 para comparar numericamente.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y probablemente sea limitado.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en matematicas y codigo sin verificacion.
- La licencia lfm1.0 (Liquid AI Foundation Model License) impone restricciones de uso comercial; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue productivo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente las capacidades de razonamiento y tool calling; se recomienda Q4_K_M o superior.
- No se han generado quants con imatrix/weighted, por lo que la calidad por tamano puede ser inferior a la de otras publicaciones del mismo autor.
- El modelo base es un ajuste fino de terceros (Sayansantra) sobre LFM3; no hay garantia de que las capacidades declaradas en los tags esten validadas con benchmarks publicos.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-WSP-V3-GGUF
- Modelo base: https://huggingface.co/Sayansantra/LFM3-1.7B-WSP-V3
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-WSP-V3-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Licencia LFM1.0: https://huggingface.co/mradermacher/LFM3-1.7B-WSP-V3-GGUF/blob/main/LICENSE
