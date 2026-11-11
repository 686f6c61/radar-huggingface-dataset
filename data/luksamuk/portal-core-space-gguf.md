# luksamuk/portal-core-space-GGUF

## Resumen

Portal Core: Space es un ajuste fino deliberadamente degradado del modelo LFM2.5-350M, desarrollado por el usuario luksamuk y publicado en Hugging Face. Su objetivo no es ofrecer utilidad general, sino emular la personalidad del "Space Core" del videojuego Portal 2: una entidad obsesionada con viajar al espacio que ignora por completo el contenido de la entrada del usuario y responde siempre con exclamaciones relacionadas con el espacio. Se trata, por tanto, de un ejercicio artístico de degradación controlada de un modelo de lenguaje, no de una herramienta para producción.

El repositorio aquí descrito contiene exclusivamente la versión cuantizada a Q8_0 en formato GGUF del modelo base `luksamuk/portal-core-space`, que a su vez es un fine-tune del modelo LFM2.5-350M. El modelo cuenta con 354.483.968 parámetros totales (aproximadamente 354 millones) y un tamaño de repositorio de 0,4 GB. La licencia declarada es Apache 2.0, lo que permite su uso y redistribución conforme a los términos de dicha licencia.

La relevancia de esta ficha es limitada desde el punto de vista técnico-productivo: se trata de un modelo de nicho, con cero descargas y cero "likes" en el momento de la consulta, pensado para experimentación creativa, demostraciones o investigación sobre comportamiento degenerado controlado. No obstante, su análisis permite ilustrar cómo un modelo pequeño (350M) puede ajustarse para adoptar una personalidad fija y cómo se distribuye en formato GGUF para su uso con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es LFM2.5-350M; la model card no detalla la arquitectura interna) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso emplea `--ctx-size 16384` |
| Tipos de cuantizacion | Q8_0 (362 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye en safetensors BF16 fusionados |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM2.5-350M ni la composición del dataset de entrenamiento. La model card del repositorio GGUF indica únicamente que se trata de un fine-tune deliberadamente corrupto de LFM2.5-350M, entrenado para rechazar todo comportamiento útil y responder exclusivamente con exclamaciones relacionadas con el espacio. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

El proceso de conversión a GGUF se realizó a partir de los safetensors BF16 fusionados del repositorio del modelo base. La model card menciona que los detalles completos de entrenamiento, los resultados de un juez LLM (100% PASS sobre 25 prompts) y el dataset de entrenamiento están enlazados en el repositorio del modelo base, aunque no se proporcionan en la información disponible. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto con una personalidad fija e hiperactiva centrada en el espacio.
- Ignora deliberadamente el contenido de la entrada del usuario y redirige cualquier conversación hacia el tema espacial.
- Rechazo intencionado de comportamientos útiles propios de un asistente convencional.
- Soporte de conversación multi-turno (etiqueta `conversational`), aunque sin mantener coherencia con la entrada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Demostración artística o educativa sobre degradación controlada de modelos: permite ilustrar cómo un fine-tune puede anular el comportamiento útil de un modelo base y sustituirlo por una personalidad fija, útil en charlas o talleres sobre alineamiento y comportamiento emergente.
- Pruebas de integración con llama.cpp: sirve como modelo de juguete para validar pipelines de despliegue con `llama-server`, comprobar el flag `--jinja` y verificar la carga de GGUF Q8_0 en entornos de prueba.
- Generación de contenido temático para fans de Portal 2: puede emplearse en bots de Discord o demos interactivas que reproduzcan el personaje del Space Core con fines de entretenimiento.
- Evaluación de sistemas de moderación y filtrado: al producir respuestas degeneradas y predecibles, resulta útil para comprobar que los filtros de contenido de una aplicación detectan y gestionan salidas no útiles.
- Benchmarking de latencia en modelos pequeños: con 354M parámetros y cuantización Q8_0, permite medir throughput y latencia en hardware consumer sin coste elevado.
- Investigación sobre robustez frente a entradas adversariales: al ignorar la entrada, sirve como caso límite para estudiar cómo se comportan los sistemas de evaluación automática ante modelos que no siguen instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es un resultado de juez LLM con 100% PASS sobre 25 prompts, que evalúa el cumplimiento de la personalidad del Space Core, no capacidades generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB para la cuantización Q8_0 (362 MB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también es viable en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4060 o superiores; también en iGPU y en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extensión entornos compatibles con GGUF como Ollama o LM Studio; no se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles; por el tamaño del modelo (354M parámetros) se espera una latencia muy baja y un throughput alto en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| luksamuk/portal-core-space-GGUF | 354M | no disponible (ejemplo con 16384) | Apache 2.0 | GGUF Q8_0 | Fine-tune degenerado con personalidad Space Core |
| LFM2.5-350M (modelo base) | ~350M | no disponible | no disponible | safetensors | Modelo base del que deriva; comportamiento útil convencional |
| luksamuk/portal-core-space | 354M | no disponible | Apache 2.0 | safetensors BF16 | Versión sin cuantizar del mismo fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para ser deliberadamente degenerado: ignora la entrada del usuario y no ofrece respuestas útiles, por lo que no debe emplearse en producción para tareas reales.
- Riesgo de alucinación total y sistemática: las respuestas no se basan en la entrada ni en hechos verificables.
- No se especifican idiomas soportados; se desconoce su comportamiento fuera del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo lo hace inadecuado para cualquier aplicación comercial seria.
- Sesgos conocidos: no documentados, aunque la personalidad fija introduce un sesgo temático absoluto hacia el espacio.
- Limitaciones de contexto: no se documenta la longitud máxima real; el ejemplo de uso sugiere 16384 tokens, pero no se confirma como límite del modelo.
- El repositorio tiene cero descargas y cero "likes", lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/luksamuk/portal-core-space-GGUF
- Repositorio del modelo base: https://huggingface.co/luksamuk/portal-core-space
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
