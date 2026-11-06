# mradermacher/24game-sft-3b-GGUF

## Resumen

`24game-sft-3b-GGUF` es la versión cuantizada en formato GGUF del modelo `couplefire/24game-sft-3b`, un modelo de lenguaje de aproximadamente 3.400 millones de parámetros afinado mediante supervisión (SFT) para resolver el juego matemático "24 game". El trabajo de cuantización lo firma mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF de modelos pequeños y medianos para su uso con llama.cpp y herramientas compatibles.

El modelo base parte de una arquitectura transformer de tipo decoder-only con 3.397.103.616 parámetros totales, según los pesos en safetensors del repositorio. Está etiquetado como conversacional y declarado únicamente para inglés. La relevancia de esta ficha radica en que se trata de un modelo especializado y de pequeño tamaño, útil para experimentar con razonamiento aritmético en entornos con recursos limitados, aunque su información pública es muy escasa.

La versión GGUF incluye doce cuantizaciones estáticas (desde Q2_K de 1,5 GB hasta f16 de 6,9 GB), lo que permite desplegarlo en hardware de consumo. No se han publicado datos sobre licencia, contexto, composición del dataset ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla variante concreta) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de tratarse de un transformer decoder-only de unos 3,4 mil millones de parámetros. El nombre del modelo base (`24game-sft-3b`) sugiere un ajuste fino supervisado (SFT) orientado a la resolución del juego "24", en el que se deben combinar cuatro números con operaciones aritméticas básicas para obtener 24. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El repositorio GGUF es una conversión estática realizada por mradermacher a partir del modelo base, sin cuantizaciones ponderadas por imatrix según la propia model card. Se ofrecen tanto cuantizaciones K-quant como IQ-quant, con recomendaciones explícitas del autor para Q4_K_S y Q4_K_M por su equilibrio entre velocidad y calidad, y Q8_0 como opción de máxima calidad dentro de los formatos rápidos.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Razonamiento aritmético especializado en el juego "24", presumiblemente el objetivo del ajuste fino SFT.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del propio juego.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Evaluación de razonamiento aritmético: el modelo puede utilizarse como banco de pruebas para medir la capacidad de un LLM pequeño de resolver problemas del juego "24" con cuatro números y operaciones básicas, aprovechando su ajuste específico.
- Experimentación educativa: útil en entornos docentes para ilustrar cómo un SFT sobre una tarea concreta mejora el rendimiento en dominios acotados frente a modelos generalistas del mismo tamaño.
- Despliegue en hardware de consumo: con cuantizaciones de 1,5 a 3,7 GB, se puede ejecutar en portátiles con GPU modesta o incluso en CPU mediante llama.cpp, lo que facilita prototipos locales.
- Generación de datasets sintéticos de problemas matemáticos: el modelo puede producir variantes de problemas tipo "24" para aumentar corpus de entrenamiento o evaluación.
- Pruebas de pipelines de cuantización: sirve como caso de estudio para comparar la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 en una tarea concreta y verificable.
- Integración en aplicaciones de chat ligero en inglés: para asistentes conversacionales de dominio restringido donde el coste computacional es crítico y no se requiere conocimiento general amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 3 GB con Q4_K_M (2,2 GB de pesos más overhead de contexto); entre 4 y 5 GB con Q8_0 (3,7 GB de pesos); alrededor de 8 GB con f16 (6,9 GB de pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; también en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 24game-sft-3b-GGUF (este) | 3,4 B | no disponible | no disponible | GGUF | Especializado en el juego "24", solo inglés |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo generalista multilingüe con tool calling |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Generalista, buen rendimiento en razonamiento |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF | Generalista con foco en matemáticas y código |

La comparación con alternativas generalistas es orientativa: no se dispone de datos de benchmarks del modelo `24game-sft-3b` que permitan una comparación cuantitativa. Los modelos citados se incluyen por proximidad de tamaño y disponibilidad en GGUF.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan licencia, contexto, dataset ni evaluación, lo que dificulta su uso en producción con garantías.
- Riesgo de alucinación elevado en tareas fuera del dominio del juego "24", al tratarse de un modelo pequeño y especializado.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Restricciones de licencia para uso comercial: no disponibles, por lo que se recomienda contactar con el autor del modelo base antes de un uso comercial.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio autor advierte de "lower quality" en Q3_K_M.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- El modelo base no incluye información sobre sesgos conocidos; al ser un SFT sobre una tarea matemática acotada, su comportamiento fuera de dominio es impredecible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/24game-sft-3b-GGUF
- Modelo base: https://huggingface.co/couplefire/24game-sft-3b
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#24game-sft-3b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
