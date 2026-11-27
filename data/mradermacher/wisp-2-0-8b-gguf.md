# mradermacher/Wisp-2-0.8B-GGUF

## Resumen

Wisp-2-0.8B-GGUF es la distribucion en formato GGUF del modelo Wisp-2-0.8B, desarrollado originalmente por philipjohnbasile y cuantizado por mradermacher. Se trata de un modelo de lenguaje especializado en completado de codigo y autocompletado (fill-in-the-middle, FIM), disenado para integrarse en entornos de desarrollo como asistente de codigo en tiempo real. Con 752 millones de parametros totales, esta pensado para ejecutarse en hardware modesto, incluyendo equipos con Apple Silicon, gracias a su reducido tamano.

El modelo emplea una arquitectura hibrida que combina capas transformer con mecanismos de atencion tipo Gated DeltaNet (segun los tags de la model card), lo que sugiere una atencion lineal o recurrente que reduce el coste computacional en contextos largos. Los tags tambien mencionan capacidades de multi-token prediction y speculative decoding, tecnicas orientadas a acelerar la generacion de tokens, algo especialmente relevante en escenarios de autocompletado donde la latencia es critica.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un asistente de codigo local y ligero, con licencia Apache 2.0 (permisiva para uso comercial) y multiples niveles de cuantizacion que van desde 0,5 GB hasta 1,6 GB. El modelo base esta asociado a la familia "Wisp" y a la referencia "qwen3_5" en sus tags, lo que sugiere una posible derivacion o inspiracion arquitectonica de la familia Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer con Gated DeltaNet (segun tags); detalles exactos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | code (codigo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base Wisp-2-0.8B emplea una arquitectura hibrida con Gated DeltaNet, un mecanismo de atencion lineal que combina ventajas de los transformers clasicos con estados recurrentes eficientes. Los tags incluyen referencias a "qwen3_5", lo que podria indicar que la arquitectura deriva o se inspira en la familia Qwen 3.5. Tambien se mencionan capacidades de multi-token prediction y speculative decoding, tecnicas que permiten predecir varios tokens a la vez y acelerar la inferencia mediante un modelo borrador.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El enfoque declarado del modelo es el completado de codigo y el fill-in-the-middle, lo que sugiere un entrenamiento orientado a tareas de autocompletado en editores y entornos de desarrollo. La cuantizacion GGUF la ha realizado mradermacher mediante su pipeline estandar, con versiones estaticas y versiones con imatrix disponibles por separado.

## Capacidades

- Completado de codigo y autocompletado en linea (fill-in-the-middle, FIM).
- Generacion de codigo en diversos lenguajes de programacion (el modelo declara el idioma "code").
- Multi-token prediction, orientada a reducir la latencia en la generacion.
- Compatibilidad con decodificacion especulativa (speculative decoding) para acelerar la inferencia.
- Optimizado para ejecucion en Apple Silicon segun los tags del modelo.
- Soporte de conversacion segun los tags (conversational), aunque su enfoque principal es el codigo.
- No se dispone de informacion sobre tool calling, function calling, agentes o capacidades multimodales.

## Casos de uso

- Autocompletado en editores de codigo: el modelo puede integrarse en plugins de VS Code, Neovim o JetBrains para sugerir lineas o bloques de codigo en tiempo real, aprovechando su naturaleza FIM y su bajo coste de inferencia gracias a los 752 millones de parametros.
- Asistente de codigo local en portatiles: al caber en cuantizaciones de 0,5 a 0,9 GB, puede ejecutarse en equipos con Apple Silicon o GPUs consumer modestas, ofreciendo asistencia sin conexion y sin enviar codigo a servicios externos.
- Relleno de funciones incompletas: en pipelines de refactorizacion, el modelo puede completar el cuerpo de funciones a partir de la firma y el contexto circundante, util para tareas de migracion o generacion de stubs.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede sugerir casos de prueba basicos mediante completado contextual, integrándose en flujos de CI para generar esqueletos de tests.
- Documentacion automatica de funciones: el modelo puede completar docstrings y comentarios a partir del codigo existente, facilitando el mantenimiento de bases de codigo legacy.
- Prototipado rapido en entornos educativos: su tamano reducido y licencia Apache 2.0 lo hacen adecuado para cursos y talleres donde se ensena a desplegar modelos de codigo en local con llama.cpp u Ollama.
- Aceleracion de inferencia con speculative decoding: al estar disenado con soporte para multi-token prediction, puede usarse como modelo borrador en pipelines de decodificacion especulativa junto a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB en cuantizaciones Q2_K a Q4_K_M; 0,7 GB en Q5/Q6; 0,9 GB en Q8_0; 1,6 GB en f16.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060, etc.). Tambien funciona en CPU y en Apple Silicon de forma nativa.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada, aunque por su tamano se espera una latencia baja en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wisp-2-0.8B-GGUF | 752 M | no disponible | Apache 2.0 | GGUF | Especializado en FIM y autocompletado |
| Qwen2.5-Coder-0.5B | 500 M | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo de codigo de referencia de Alibaba |
| Qwen2.5-Coder-1.5B | 1.500 M | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Version superior de la familia Qwen Coder |
| StarCoder2-3B | 3.000 M | 16 K (segun documentacion publica de BigCode) | BigCode OpenRAIL-M | safetensors, GGUF | Modelo de codigo de BigCode |

Nota: los datos de contexto y parametros de los modelos comparativos provienen de documentacion publica general; no se dispone de benchmarks comparativos directos con Wisp-2-0.8B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en codigo; su rendimiento en lenguaje natural general puede ser limitado.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad.
- Riesgo de alucinacion en la generacion de codigo: puede producir APIs inexistentes o sintaxis incorrecta, por lo que requiere revision humana.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en archivos grandes.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original (philipjohnbasile/Wisp-2-0.8B) antes de un uso comercial a gran escala.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la calidad del codigo generado; se recomienda Q4_K_M o superior para produccion.
- No se dispone de informacion sobre soporte multilingue en lenguaje natural; el idioma declarado es unicamente "code".

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Wisp-2-0.8B-GGUF
- Modelo base: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Wisp-2-0.8B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Wisp-2-0.8B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
