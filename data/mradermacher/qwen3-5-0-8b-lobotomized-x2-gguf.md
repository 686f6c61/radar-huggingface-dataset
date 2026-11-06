# mradermacher/Qwen3.5-0.8B-lobotomized-x2-GGUF

## Resumen

Qwen3.5-0.8B-lobotomized-x2 es un modelo de lenguaje de pequeno tamano (752.393.024 parametros segun los pesos en safetensors) derivado de la familia Qwen3.5, publicado originalmente por el usuario Dam1rka1 y cuantizado a formato GGUF por mradermacher. El nombre "lobotomized-x2" y las etiquetas de la model card (weight-space-programming, mechanistic-interpretability, direct-weight-surgery, svd-laser) indican que se trata de un experimento de edicion directa de pesos orientado a modificar el comportamiento del modelo base, no de un modelo entrenado desde cero.

La relevancia de esta publicacion es doble: por un lado, ofrece una version cuantizada en multiples precisiones (de Q2_K a f16) de un modelo de menos de mil millones de parametros, lo que permite ejecutarlo en hardware muy modesto; por otro, documenta un caso de cirugia de pesos en el espacio de parametros con tecnicas de descomposicion SVD, un area de investigacion activa en interpretabilidad mecanica.

La model card es escasa en detalles tecnicos: no especifica la arquitectura interna, la longitud de contexto, el dataset de entrenamiento ni los resultados de evaluacion. La informacion disponible se limita a los metadatos de Hugging Face, la lista de cuantizaciones y las etiquetas del autor, que mencionan function calling, el Berkeley Function Calling Leaderboard e IFEval como areas de interes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5-0.8B; arquitectura base no documentada en la informacion proporcionada) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del transformer subyacente (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de RoPE, etc.). El modelo base es Dam1rka1/Qwen3.5-0.8B-lobotomized-x2, del que la model card no detalla el proceso de entrenamiento ni el dataset utilizado.

Las etiquetas del repositorio apuntan a un proceso de "weight-space programming" y "direct weight surgery" con una tecnica denominada "svd-laser", que sugiere la aplicacion de descomposicion en valores singulares sobre matrices de pesos para eliminar o atenuar direcciones concretas del espacio de parametros. El sufijo "x2" podria indicar una doble aplicacion del procedimiento, aunque esto no se confirma en la documentacion. No hay informacion sobre volumen de tokens de entrenamiento, composicion del corpus, ni sobre fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, segun los idiomas declarados.
- Soporte de function calling, segun la etiqueta del repositorio y la referencia al Berkeley Function Calling Leaderboard.
- Evaluacion orientada a instrucciones, con mencion explicita a IFEval en las etiquetas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que permite servir el modelo mediante APIs compatibles con el formato de Hugging Face.
- Capacidades multilingues limitadas a ru y en; no se declaran otros idiomas.
- No se documentan capacidades de vision, audio, tool calling avanzado, agentes multi-paso ni modo de razonamiento explicito.

## Casos de uso

- Despliegue en dispositivos de borde: con cuantizaciones de 0,5 a 0,9 GB, el modelo puede ejecutarse en Raspberry Pi, mini-PC o moviles con llama.cpp para tareas de generacion de texto de baja latencia.
- Experimentacion en interpretabilidad mecanica: al ser un modelo con cirugia de pesos documentada mediante SVD, sirve como banco de pruebas para estudiar como afecta la eliminacion de direcciones de pesos al comportamiento final.
- Prototipado de asistentes conversacionales bilingues ruso-ingles: el modelo puede gestionar dialogos simples en ambos idiomas en entornos con recursos limitados.
- Pruebas de function calling en pipelines de agentes: la etiqueta de BFCL sugiere que el modelo fue ajustado o evaluado para invocar funciones, lo que permite integrarlo en flujos de automatizacion ligeros.
- Evaluacion comparativa de cuantizaciones: al ofrecer 12 variantes GGUF, permite medir el impacto de la precision en la calidad de salida para un modelo de menos de 1B de parametros.
- Educacion y docencia: su tamano reducido y licencia Apache 2.0 facilitan su uso en cursos de NLP, cuantizacion y edicion de modelos sin necesidad de GPU dedicada.
- Servicio de API interna de bajo coste: con vLLM o TGI en CPU o GPU modesta, puede atender peticiones de texto en ingles y ruso para herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) solo para los pesos; anadir overhead de contexto y KV cache segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4_K_M o Q5_K_M. Para f16 se recomienda al menos 3 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos ocho anos, asi como en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (para pesos en safetensors del modelo base) y TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera un throughput alto en CPU moderna y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-lobotomized-x2 (este) | 752 M | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-1.5B | 1.540 M | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B | 1.700 M | 8 K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Hugging Face |

Nota: los datos de contexto y parametros de los modelos comparativos provienen de su documentacion publica habitual; no se dispone de resultados de benchmarks comparativos para este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un modelo bilingue ru-en de menos de 1B de parametros, es probable que presente sesgos derivados del corpus de entrenamiento original, no especificado.
- Riesgo de alucinacion elevado por el tamano reducido y por la ausencia de datos sobre el ajuste de instrucciones o RLHF.
- La cirugia de pesos "lobotomized-x2" puede haber degradado capacidades del modelo base de forma no documentada; no hay evaluaciones que cuantifiquen la perdida.
- Contexto e idiomas limitados: solo ru y en declarados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No hay informacion sobre la procedencia de los datos de entrenamiento del modelo base, lo que impide evaluar riesgos de contaminacion o de derechos de autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-0.8B-lobotomized-x2-GGUF
- Modelo base: https://huggingface.co/Dam1rka1/Qwen3.5-0.8B-lobotomized-x2
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Qwen3.5-0.8B-lobotomized-x2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
