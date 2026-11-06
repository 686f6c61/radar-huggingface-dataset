# mradermacher/Huihui-Qwen3.5-0.8B-abliterated-Athanorlite-ORPO-GGUF

## Resumen

Esta ficha describe la cuantización GGUF realizada por mradermacher del modelo `nbeerbower/Huihui-Qwen3.5-0.8B-abliterated-Athanorlite-ORPO`, un modelo de lenguaje conversacional de pequeno tamano (752.393.024 parámetros reales según safetensors) derivado de la familia Qwen3.5 de 0.8B. El modelo base combina tres intervenciones: una variante "abliterated" (eliminación de direcciones de rechazo en el espacio de activaciones), un ajuste sobre el dataset Athanorlite y un entrenamiento final con ORPO (Odds Ratio Preference Optimization). El resultado es un modelo orientado a generación de texto conversacional sin las restricciones de rechazo típicas de los modelos alineados convencionalmente.

El repositorio aquí documentado contiene únicamente pesos cuantizados en formato GGUF, generados con las herramientas del ecosistema llama.cpp. Se ofrecen once variantes de cuantización que abarcan desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que permite ejecutar el modelo en hardware muy modesto, incluidas CPU y GPUs de gama baja. El tamaño del repositorio completo es de 7,5 GB.

La relevancia de esta ficha es práctica: se trata de un modelo experimental de nicho, con 267 descargas y sin métricas publicadas, pensado para desarrolladores que quieran experimentar con modelos pequeños sin censura en entornos con recursos limitados. No es un modelo recomendado para producción sin una evaluación previa exhaustiva, y su licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen3.5 en su variante de 0.8B, si bien la model card no detalla la configuración de capas, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.). El pipeline de refinamiento declarado en los tags y metadatos incluye tres etapas: una ablación de las direcciones de rechazo ("abliterated"), un ajuste sobre el dataset `schneewolflabs/Athanorlite-DPO` y un entrenamiento final con ORPO. Los tags `merlina` y `grimoire` sugieren que el modelo forma parte de un ecosistema de fine-tunes comunitarios, aunque no se aporta documentación técnica al respecto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos o si hubo etapas adicionales de RLHF. La única referencia explícita es el dataset Athanorlite-DPO utilizado en la fase de preferencias. Tampoco se documentan innovaciones técnicas destacables en la model card; el valor del repositorio reside en la disponibilidad de cuantizaciones GGUF estáticas listas para usar con llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés (único idioma declarado).
- Razonamiento y respuesta multi-turno, según el tag `conversational`.
- Comportamiento sin rechazo ("abliterated"): el modelo ha sido modificado para eliminar las direcciones de activación asociadas al rechazo de peticiones, lo que implica que responde a solicitudes que un modelo alineado convencional rechazaría.
- Ajuste por preferencias con ORPO, orientado a mejorar la calidad de las respuestas conversacionales.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Experimentación con modelos sin censura en local: investigadores que estudian el efecto de la ablación de rechazo pueden comparar este modelo con su base alineada en tareas controladas, usando las cuantizaciones Q4_K_M o Q5_K_M para reproducir resultados en hardware de consumo.
- Prototipado rápido de chatbots en inglés: con 0,8B de parámetros y cuantizaciones de 0,6 GB, el modelo permite iterar sobre prompts y flujos conversacionales en un portátil sin GPU dedicada, antes de escalar a un modelo mayor.
- Generación de texto en entornos con recursos muy limitados: despliegue en Raspberry Pi, mini-PC o contenedores sin GPU usando Q2_K o Q3_K_S, adecuado para demos y pruebas de concepto.
- Evaluación de seguridad y red teaming: al carecer de rechazos, sirve como banco de pruebas para estudiar cómo se comportan los modelos abliterated ante prompts adversarios y qué sesgos emergen cuando se elimina la alineación.
- Fine-tuning adicional sobre una base pequeña: el modelo puede servir como punto de partida para ajustes específicos de dominio en inglés, aprovechando que cabe en una sola GPU consumer durante el entrenamiento con cuantización QLoRA.
- Generación de datos sintéticos a pequeña escala: para tareas de aumento de datos en inglés donde no se requiere alta calidad, el modelo puede producir borradores que luego se filtran con un modelo mayor.
- Pruebas de integración en pipelines llama.cpp: validar el soporte de GGUF, la carga de cuantizaciones IQ y el rendimiento de inferencia en distintas plataformas antes de adoptar modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB con Q2_K a Q4_K_M; 0,7 GB con Q5_K_M y Q6_K; 0,9 GB con Q8_0; 1,6 GB con f16. A estas cifras hay que sumar el espacio para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En el extremo profesional, A100 o H100 no aportan ventaja para un modelo de este tamano y quedarían infrautilizadas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada de los últimos diez años, e incluso en iGPUs con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI a través de llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. En CPU moderna se puede esperar una generación interactiva para un modelo de este tamano, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF de mradermacher) | 752 M | no disponible | no disponible | GGUF | Fine-tune abliterated + ORPO, solo inglés |
| Qwen3.5 0.8B base | ~0,8 B | no disponible en esta ficha | no disponible | safetensors | Modelo original alineado, multilingüe |
| Llama 3.2 1B Instruct | ~1,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con licencia conocida |
| Gemma 3 1B | ~1 B | 32 K | Gemma Terms of Use | safetensors, GGUF | Alternativa de Google con contexto y licencia documentados |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo documentado ni de su contexto, por lo que la elección frente a las alternativas debe basarse en la licencia (aquí no declarada) y en el comportamiento sin rechazo, que es su rasgo diferencial.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Antes de cualquier despliegue en producción es imprescindible contactar con el autor o consultar el modelo base.
- Modelo "abliterated": la eliminación de las direcciones de rechazo implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Riesgo de alucinación elevado: con 752 M de parámetros, la capacidad de razonamiento y la fidelidad factual son limitadas; no debe usarse para tareas que requieran precisión verificable sin supervisión.
- Solo inglés: no hay soporte declarado para castellano ni otros idiomas, por lo que su uso en entornos hispanohablantes requeriría traducción previa o un fine-tuning adicional.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación de información.
- Sin benchmarks: no existen métricas publicadas que permitan comparar su calidad con alternativas; cualquier evaluación debe hacerse de forma empírica.
- Procedencia comunitaria: el pipeline de tres etapas (abliteration, Athanorlite, ORPO) no está documentado en detalle, lo que dificulta la reproducibilidad y la auditoría del modelo.
- Repositorio de cuantizaciones: este repo solo contiene GGUF; para inspeccionar los pesos originales o aplicar técnicas que requieran safetensors hay que acudir al modelo base de nbeerbower.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Huihui-Qwen3.5-0.8B-abliterated-Athanorlite-ORPO-GGUF
- Modelo base: https://huggingface.co/nbeerbower/Huihui-Qwen3.5-0.8B-abliterated-Athanorlite-ORPO
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Huihui-Qwen3.5-0.8B-abliterated-Athanorlite-ORPO-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Huihui-Qwen3.5-0.8B-abliterated-Athanorlite-ORPO-GGUF
- Dataset de preferencias: https://huggingface.co/schneewolflabs/Athanorlite-DPO
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
