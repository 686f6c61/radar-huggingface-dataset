# bcckfdn/minillama-test-v2.1-it-GGUF

## Resumen

bcckfdn/minillama-test-v2.1-it-GGUF es la version cuantizada en formato GGUF de un modelo de generacion de texto de arquitectura tipo Llama (familia SmolLM2) entrenado desde cero por el usuario bcckfdn, segun indica su propia model card. El modelo base es bcckfdn/minillama-test-v2.1-it y esta orientado a generacion de texto conversacional en turco (tr) e ingles (en). Con 52.953.984 parametros reales declarados en los pesos safetensors del modelo base, se situa en la categoria de modelos ultraligeros, pensados para inferencia en CPU y dispositivos con recursos muy limitados.

La relevancia de esta ficha es mas instrumental que competitiva: se trata de un repositorio practicamente sin traccion (0 descargas y 0 likes en el momento de la consulta) y sin resultados de benchmarks publicados, por lo que su interes principal es como ejemplo de publicacion de pesos en GGUF para llama.cpp y como banco de pruebas de despliegue en entornos de borde. El autor declara un entrenamiento de 86.016 M de tokens con hidden de 384 y 22 capas.

Conviene advertir desde el principio de dos cuestiones de trazabilidad: la model card titula el artefacto como "smollm2-135m-tr-v1", mientras que el recuento de parametros del safetensors es de ~53 M, y los tamanos de fichero GGUF listados en la model card no se corresponden de forma evidente con ese recuento. Ambas discrepancias se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (familia SmolLM2), segun la model card |
| Parametros totales | 52.953.984 (~53 M), dato del safetensors del modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M (segun la model card) |
| Idiomas soportados | Turco (tr) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base bcckfdn/minillama-test-v2.1-it |
| Hidden size | 384 |
| Numero de capas | 22 |
| Tokens de entrenamiento | 86.016 M (segun la model card) |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La model card describe un modelo entrenado desde cero con la arquitectura de SmolLM2 (Llama): transformer decoder-only con hidden de 384 y 22 capas. No se especifican el numero de cabezas de atencion, el tamano de la capa intermedia del MLP, el vocabulario ni si se emplea atencion agrupada por consultas (GQA); todos estos datos quedan como no disponibles. Tampoco se documenta la longitud de contexto nativa, un parametro critico para cualquier uso en produccion.

En cuanto a los datos, la unica cifra aportada es el volumen de entrenamiento: 86.016 M de tokens. No hay informacion sobre la composicion del dataset (proporcion de turco e ingles, fuentes, filtrado), ni sobre si hubo una fase de ajuste por instrucciones (SFT), RLHF o DPO. El sufijo "it" del identificador sugiere un ajuste por instrucciones, pero la model card no lo confirma ni detalla el procedimiento. No se documenta ninguna innovacion tecnica adicional, como decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles, con etiqueta conversational en los metadatos del repositorio.
- Formato de pesos GGUF compatible con llama.cpp y con todas las herramientas que lo consumen (Ollama, LM Studio, llama-cpp-python).
- Ejecucion en CPU sin GPU gracias al tamano reducido del modelo y a las cuantizaciones de 4 y 5 bits.
- No hay evidencia en la informacion disponible de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso explicito ni modo de pensamiento (thinking mode).
- No hay evidencia de capacidades multimodales (vision, audio) ni de modos especiales de decodificacion.
- El soporte multilingue se limita, segun los metadatos, a turco e ingles.

## Casos de uso

- Pruebas de humo en pipelines de despliegue de llama.cpp: por su tamano (decenas de MB), permite validar el flujo completo de carga de GGUF, tokenizacion y generacion en CI sin depender de pesos grandes ni de GPU.
- Inferencia en dispositivos de borde: cabe en la memoria de una Raspberry Pi, un router con Linux o un movil, lo que habilita generacion de texto offline donde no hay conectividad ni capacidad de computo.
- Completado de texto muy acotado en turco: autocompletado de plantillas, campos de formulario o respuestas cortas predefinidas, siempre con revision humana por el riesgo de alucinacion.
- Etiquetado y clasificacion de texto turco: al ser un modelo entrenado con corpus turco, puede servir como base para tareas discriminativas mediante ajuste ligero o mediante prompts de clasificacion, con la ventaja de que el ajuste cabe en una GPU de consumo.
- Base para experimentos academicos de entrenamiento desde cero: permite reproducir y comparar el efecto de distintas fases de preentrenamiento y ajuste en un presupuesto de computo minimo.
- Generacion de texto de relleno en demos y prototipos de interfaz: para maquetar asistentes conversacionales antes de integrar un modelo de mayor calidad, sin coste de API.
- Analisis de robustez de cuantizaciones: comparar BF16, Q8_0, Q5_K_M y Q4_K_M sobre el mismo prompt para medir la degradacion por cuantizacion en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones en turco (por ejemplo, sets especificos de turco) para este modelo, ni comparativas publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,5 GB en cualquiera de las cuantizaciones listadas; aproximadamente 0,1 GB en BF16 y alrededor de 40-55 MB en Q4_K_M y Q5_K_M, segun los tamanos que declara la model card.
- Memoria del sistema: suficiente con cualquier equipo moderno; el modelo completo cabe en RAM de un sistema embebido.
- GPU recomendadas: no requiere GPU. Funciona en CPU y en cualquier GPU consumer (GTX 1050 o superior, RTX 3060/4090, integradas Intel o AMD). A100 o H100 solo tendrian sentido para servir muchas instancias en paralelo en una misma tarjeta.
- Cabe holgadamente en GPU de consumo, en telefonos de gama media y en placas tipo Raspberry Pi 4/5.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama mediante Modelfile, LM Studio, llama-cpp-python; tambien cabria en vLLM y TGI si el formato GGUF o el modelo base safetensors se cargan en esas plataformas, aunque no esta documentado por el autor.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo para este modelo.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden del repositorio y de su model card. Los datos de los modelos alternativos proceden de sus model cards publicas y no se han verificado en la busqueda para esta ficha; se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| bcckfdn/minillama-test-v2.1-it-GGUF | ~53 M (safetensors) | no disponible | Apache-2.0 | GGUF en HuggingFace, 0 descargas | Turco e ingles; sin benchmarks publicados |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 8.192 tokens (segun su model card) | Apache-2.0 | safetensors y GGUF, ampliamente usado | Ingles principalmente; con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (segun su model card) | Apache-2.0 | safetensors, GGUF y multiples plataformas | Multilingue amplio; con benchmarks publicados |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens (segun su model card) | Apache-2.0 | safetensors y GGUF | Ingles; calidad claramente superior por tamano |

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: con ~53 M de parametros, la capacidad de retener conocimiento factual es muy limitada y no debe usarse como fuente de informacion sin verificacion externa.
- Discrepancia de identificacion: la model card titula el artefacto "smollm2-135m-tr-v1" y lista ficheros de entre 43 y 103 MB, mientras que el recuento de safetensors del modelo base es de 52.953.984 parametros. Conviene verificar el contenido real de cada fichero GGUF antes de integrarlo.
- Contexto desconocido: no se declara la longitud de contexto, por lo que no es posible planificar conversaciones multi-turno o documentos largos sin medirlo empiricamente.
- Cobertura idiomatica limitada a turco e ingles; no hay garantia de calidad en castellano ni en otros idiomas.
- Sin soporte documentado de tool calling, function calling ni agentes; cualquier integracion de este tipo requeriria envoltorios externos y no esta validada.
- Ausencia total de benchmarks publicados, lo que impide comparar su calidad de forma objetiva frente a alternativas.
- Repositorio sin validacion de la comunidad (0 descargas, 0 likes en la fecha de consulta): no hay evidencia de uso real ni de incidencias reportadas.
- No se documentan sesgos del dataset de entrenamiento; al ser un modelo entrenado desde cero con un corpus no descrito, los sesgos linguisticos y culturales son desconocidos e inevitables.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones de copyleft, pero no implica ninguna garantia por parte del autor.
- Para produccion con requisitos de calidad, se recomienda tratar este modelo como banco de pruebas y no como componente final de un sistema orientado a usuarios.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/bcckfdn/minillama-test-v2.1-it-GGUF
- Modelo base: https://huggingface.co/bcckfdn/minillama-test-v2.1-it
- Perfil del autor: https://huggingface.co/bcckfdn

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a dominios comerciales sin relacion con el artefacto), por lo que no hay papers, blogs ni demos adicionales que enlazar.
