# bcckfdn/cevher-test-9-GGUF

## Resumen

cevher-406m-v15 es un modelo de generacion de texto de aproximadamente 407 millones de parametros, desarrollado por el usuario bcckfdn y publicado en HuggingFace bajo el identificador bcckfdn/cevher-test-9-GGUF. Se trata de la version cuantizada en formato GGUF del modelo base bcckfdn/cevher-test-9, entrenado desde cero siguiendo el diseno de arquitectura de SmolLM2 (familia Llama). La model card indica que el entrenamiento se realizo con 29491 millones de tokens y una configuracion de 34 capas y dimension oculta de 1024.

El modelo esta orientado a generacion de texto conversacional en turco e ingles, y su interes practico radica en su tamano reducido: al ocupar entre 245 MB y 778 MB segun cuantizacion, puede ejecutarse en CPU, portatiles o GPUs de gama baja sin necesidad de infraestructura dedicada. Esto lo situa en la categoria de modelos pequenos para edge computing, prototipado rapido y tareas de generacion en idioma turco, un nicho con menos opciones que el ingles.

Es importante senalar que el repositorio parece tener caracter experimental: el identificador incluye "test-9", el numero de descargas y de "likes" registrado es cero, y existe una discrepancia entre el nombre del repositorio (cevher-test-9-GGUF) y el nombre interno de los ficheros (cevher-406m-v15). No se han publicado resultados de benchmarks ni detalles completos del dataset de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama / SmolLM2 |
| Parametros totales | 406.918.144 (aproximadamente 407 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La model card describe el modelo como una implementacion de la arquitectura SmolLM2 (familia Llama) entrenada desde cero. Los hiperparametros declarados son 34 capas y dimension oculta (hidden size) de 1024, con 406.918.144 parametros totales segun los ficheros safetensors del modelo base. El volumen de entrenamiento indicado es de 29491 millones de tokens (29,491 B). No se detalla la composicion del dataset, la mezcla de idiomas ni si se aplicaron fases de ajuste fino supervisado (SFT), RLHF o DPO posteriores al preentrenamiento.

No se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mecanismos hibridos SSM/transformer u otras). La relevancia tecnica del modelo esta en su naturaleza de entrenamiento desde cero para turco con un presupuesto de computo reducido, replicando una receta reproducible de modelo pequeno. El repositorio distribuido contiene exclusivamente los pesos convertidos a GGUF para su uso con llama.cpp y herramientas compatibles.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Uso conversacional (la etiqueta "conversational" aparece en la metadata del repositorio).
- Inferencia local eficiente mediante llama.cpp y formatos derivados.
- Ejecucion en entornos con recursos limitados (CPU, GPU integrada, dispositivos de borde).
- Soporte de las cuatro cuantizaciones publicadas (BF16, Q8_0, Q5_K_M, Q4_K_M) para ajustar tamano y calidad.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Generacion de texto en turco en dispositivos locales: el modelo puede redactar borradores, correos o resumentes en turco sin depender de servicios en la nube, gracias a que su cuantizacion Q4_K_M ocupa solo 245 MB.
- Chatbot conversacional ligero embebido en aplicaciones de escritorio o moviles: al caber en memoria de un portatil o telefono moderno, permite conversaciones multi-turno locales mediante llama.cpp u Ollama sin coste de API.
- Prototipado y validacion de pipelines de inferencia GGUF: util para desarrolladores que quieren probar integraciones con llama.cpp, Ollama o LM Studio antes de escalar a modelos mayores.
- Preprocesado y normalizacion de texto en turco: tareas de clasificacion ligera, reformulacion o extraccion simple donde no se requiere alta precision.
- Educacion e investigacion sobre entrenamiento de modelos pequenos: sirve como referencia de un modelo de 407 M parametros entrenado desde cero, util para estudiar el comportamiento de arquitecturas SmolLM2 en idiomas de bajos recursos.
- Generacion de texto offline en entornos sin conectividad: despliegue en kioscos, sistemas empotrados o aplicaciones de campo donde no hay acceso a Internet.
- Filtrado o autocompletado en herramientas de escritura: al tener baja latencia en hardware modesto, puede integrarse como autocompletado en editores o formularios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion (solo pesos): BF16 778 MB, Q8_0 414 MB, Q5_K_M 281 MB, Q4_K_M 245 MB. Sumando el contexto y el runtime de llama.cpp, el consumo real se situa aproximadamente entre 0,5 GB y 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni tarjetas de datacenter. Modelos consumer como GTX 1050 Ti, RTX 3060 o superiores ejecutan el modelo con holgura.
- Compatibilidad con GPU consumer: si, cabe en practicamente cualquier GPU de consumo actual e incluso en GPUs integradas recientes.
- Compatibilidad con CPU: si, la cuantizacion Q4_K_M permite inferencia en CPU sin GPU dedicada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio. El soporte en vLLM o TGI para GGUF es limitado y no se documenta para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

Ejemplo de uso con llama.cpp segun la model card:

```bash
llama-cli -m cevher-406m-v15-Q4_K_M.gguf -p "Merhaba" -cnv
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cevher-406m-v15 (este) | 407 M | no disponible | tr, en | apache-2.0 | GGUF en HuggingFace |
| SmolLM2-360M (HuggingFaceTB) | 362 M | 8192 tokens (segun su model card) | en (principalmente) | apache-2.0 | safetensors y GGUF |
| Qwen2.5-0.5B | 494 M | 32768 tokens | multilingue | apache-2.0 | safetensors y GGUF |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | en (principalmente) | apache-2.0 | safetensors y GGUF |

Nota: los datos de contexto y parametros de los modelos comparados corresponden a informacion publica de sus respectivas model cards; no se dispone de benchmarks comparativos con cevher-406m-v15, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Modelo experimental: el identificador "cevher-test-9" y la ausencia de descargas o "likes" sugieren que es un repositorio de prueba, no un modelo validado en produccion.
- Discrepancia de nombres: el repositorio se llama cevher-test-9-GGUF mientras que los ficheros GGUF se nombran cevher-406m-v15, lo que puede generar confusion en la gestion de artefactos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, coherencia o fidelidad factual en turco o ingles.
- Riesgo de alucinacion: al ser un modelo de 407 M parametros, la tasa de alucinacion y de errores factuales es previsiblemente alta; la informacion disponible no incluye evaluaciones al respecto.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, etnicos, religiosos o politicos.
- Cobertura linguistica limitada: solo se declaran turco e ingles; el rendimiento en otros idiomas no esta garantizado.
- Contexto desconocido: al no especificarse la longitud de contexto, no se puede asegurar el comportamiento en conversaciones largas o documentos extensos.
- Ajuste conversacional no verificado: aunque la metadata incluye la etiqueta "conversational", no se documenta si hubo una fase de alineacion (SFT, RLHF o DPO).
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion correspondiente.
- Ausencia de garantias: como cualquier modelo publicado sin evaluacion, no deberia desplegarse en produccion sin una validacion previa por parte del equipo que lo vaya a usar.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/bcckfdn/cevher-test-9-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-9
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
