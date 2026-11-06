# mradermacher/Luna-Qwen3.5-2B-v5-GGUF

## Resumen

Luna-Qwen3.5-2B-v5-GGUF es la version cuantizada en formato GGUF del modelo Luna-Qwen3.5-2B-v5, un modelo conversacional de aproximadamente 1.880 millones de parametros (1.881.825.088 exactos segun los pesos en safetensors del modelo base). El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, mientras que el modelo original lo desarrolla el usuario claekchen. El nombre sugiere un ajuste fino sobre la familia Qwen3.5, aunque la model card no documenta explicitamente la relacion con el modelo base de Alibaba.

El modelo resuelve el problema de ejecutar un LLM conversacional de ~2B en hardware modesto, ofreciendo un abanico completo de cuantizaciones que van desde Q2_K (1,0 GB) hasta f16 (3,9 GB). La relevancia actual radica en su ligereza: cabe en GPUs de consumo con poca VRAM e incluso en CPU, lo que lo hace util para prototipado rapido, despliegue en el borde y entornos con recursos limitados.

La informacion disponible es escasa: la model card del repositorio GGUF es una plantilla generica de cuantizacion, sin datos sobre arquitectura interna, contexto, entrenamiento ni evaluacion. Esta ficha se limita a lo verificable y marca como no disponible todo lo que no consta en las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de la familia Qwen3.5; no confirmado en la model card) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El nombre "Qwen3.5" sugiere que claekchen partio de un modelo de la familia Qwen y lo ajusto finamente para producir Luna-Qwen3.5-2B-v5, pero la model card del repositorio GGUF no documenta el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras.

El unico detalle tecnico reseñable es la presencia de ficheros `mmproj` (multi-modal projection) entre los artefactos publicados, lo que indica que el modelo base incorpora algun tipo de capacidad multimodal (probablemente vision) que el conversor ha preservado como suplemento separado. No se especifica que modalidad ni como se integra en el pipeline de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` de la model card.
- Soporte multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica capacidad de procesar entradas adicionales a texto (presumiblemente imagenes), aunque no se detalla en la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso via API en plataformas de inferencia.
- No consta soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al ingles declarado; no se documentan otros idiomas.
- No se documentan capacidades especiales como thinking mode, audio o decodificacion especulativa.

## Casos de uso

- Prototipado rapido de chatbots: con la cuantizacion Q4_K_M (1,4 GB) el modelo se puede cargar en un portatil con GPU integrada o CPU moderna, permitiendo iterar sobre prompts y flujos conversacionales sin coste de API.
- Despliegue en el borde (edge computing): la version Q2_K (1,0 GB) o Q3_K_S (1,1 GB) cabe en dispositivos con 2-4 GB de RAM, adecuada para asistentes locales en Raspberry Pi o mini-PC.
- Pruebas de integracion en pipelines de inferencia: al ser compatible con endpoints, sirve como modelo de sustitucion barato para validar integraciones con vLLM, llama.cpp u Ollama antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto ligera: para tareas de etiquetado o moderacion de baja complejidad donde no se requiere razonamiento profundo, el coste por token es minimo.
- Educacion e investigacion: util para experimentar con cuantizaciones GGUF y medir el impacto de la precision en la calidad de salida en un modelo de 2B.
- Aplicaciones multimodales basicas: gracias a los ficheros `mmproj`, se puede probar descripcion de imagenes o VQA simple en local, aunque la calidad no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de Hugging Face incluyen metricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB (Q2_K), 1,4 GB (Q4_K_M), 2,1 GB (Q8_0) y 3,9 GB (f16), sin contar el overhead del runtime ni el suplemento multimodal (0,5-0,8 GB adicionales si se usa).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4-Q8. Para f16 se recomienda 6 GB o mas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (via importacion de GGUF), LM Studio, y servidores compatibles con GGUF. Para el modelo base en safetensors, transformers con aceleracion por hardware.
- Latencia y throughput: no disponibles. Al ser un modelo de ~2B, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luna-Qwen3.5-2B-v5-GGUF | ~1,88B | no disponible | no disponible | GGUF | Este modelo; cuantizaciones multiples |
| Qwen2.5-1.5B-Instruct (referencia) | 1,54B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa oficial de tamano similar; datos de contexto y licencia no verificados en esta busqueda |
| Llama-3.2-1B-Instruct (referencia) | 1,24B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta; datos no verificados en esta busqueda |
| SmolLM2-1.7B-Instruct (referencia) | 1,71B | 8K (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Alternativa de Hugging Face; datos no verificados en esta busqueda |

Nota: los datos de los modelos comparables provienen de documentacion publica general y no se han verificado contra las fuentes primarias en esta busqueda; se incluyen solo como referencia orientativa de categoria.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de la cuantizacion, lo que impide confirmar si el uso comercial esta permitido. Es un riesgo critico para produccion.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinacion: inherente a los modelos de ~2B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide comparar objetivamente con alternativas.
- Contexto desconocido: no se documenta la ventana de contexto, lo que complica el diseno de aplicaciones con conversaciones largas o documentos extensos.
- Modelo derivado de un ajuste fino no documentado: se desconoce el dataset de entrenamiento, los posibles sesgos introducidos y la calidad del ajuste.
- Cuantizaciones bajas (Q2_K, Q3_K_S): degradacion de calidad notable; para uso real se recomienda Q4_K_M o superior.
- Suplemento multimodal sin documentar: no se especifica que modalidad cubre ni como integrarlo en llama.cpp u otros runtimes.
- Popularidad muy baja (49 descargas, 0 likes en el momento de la consulta): poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/Luna-Qwen3.5-2B-v5-GGUF
- Modelo base: https://huggingface.co/claekchen/Luna-Qwen3.5-2B-v5
- Pagina de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#Luna-Qwen3.5-2B-v5-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
