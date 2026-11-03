# mradermacher/Qwen3.5-4B-Salieri-GGUF

## Resumen

Qwen3.5-4B-Salieri-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Jitheswar/Qwen3.5-4B-Salieri, un ajuste fino de la familia Qwen3.5 orientado a tareas de programación, razonamiento agéntico y uso de herramientas (tool calling). El trabajo de cuantización lo firma mradermacher, un perfil habitual en HuggingFace especializado en generar versiones GGUF de modelos populares para su uso en llama.cpp y entornos de inferencia local.

El modelo base cuenta con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y está construido sobre la arquitectura Qwen3.5, un transformer denso de la familia Qwen. El ajuste fino se ha realizado presumiblemente mediante DPO (según la etiqueta "dpo") sobre el dataset nvidia/Open-SWE-Traces, lo que orienta el modelo hacia tareas de ingeniería de software y resolución de problemas de código en entornos agénticos.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 4B especializado en código y agentes en hardware de consumo, con cuantizaciones que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16), y con soporte multimodal (mmproj) para entrada de imágenes. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parámetros totales | 4.326.350.848 (~4,3B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Jitheswar/Qwen3.5-4B-Salieri es un transformer denso de la familia Qwen3.5 con 4.326.350.848 parámetros. Se trata de un ajuste fino (fine-tuning) del modelo Qwen3.5-4B, orientado específicamente a tareas de programación, agentes y tool calling, según las etiquetas del repositorio. El entrenamiento incluye una fase de DPO (Direct Preference Optimization), indicada explícitamente en las etiquetas, y se apoya en el dataset nvidia/Open-SWE-Traces, un conjunto de trazas de ingeniería de software orientado a agentes.

La cuantización la realiza mradermacher mediante conversión desde el formato HuggingFace (convert_type: hf) con cuantización estática de tensores (output_tensor_quantised: 1, quantize_version: 2). No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni innovaciones arquitectónicas específicas más allá de las propias de la familia Qwen3.5. El repositorio incluye además ficheros mmproj (multi-modal projection) en Q8_0 y f16, lo que sugiere que el modelo base conserva capacidades multimodales (visión) heredadas de Qwen3.5.

## Capacidades

- Generación de texto y razonamiento general, con especial énfasis en razonamiento paso a paso (etiqueta "reasoning").
- Generación y comprensión de código, incluyendo tareas de ingeniería de software (SWE).
- Tool calling / function calling, orientado a integración con frameworks de agentes.
- Capacidades agénticas y razonamiento multi-paso (etiqueta "agent").
- Soporte multimodal mediante los ficheros mmproj, lo que permite entrada de imágenes (visión).
- Capacidades multilingües: inglés, chino y otros idiomas (etiqueta "multilingual").
- Formato conversacional (etiqueta "conversational"), apto para diálogo multi-turno.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en editores como VS Code mediante extensiones que consuman GGUF a través de llama.cpp u Ollama, ofreciendo autocompletado y explicación de código sin depender de la nube, gracias a sus 4,3B parámetros y cuantizaciones de 2,7-2,9 GB (Q4_K_S/Q4_K_M) que caben en GPU de consumo.
- Agente de resolución de issues (SWE-bench style): entrenado sobre trazas de ingeniería de software, puede emplearse en pipelines que reciben un issue de GitHub, exploran el repositorio mediante tool calling y proponen un parche, aprovechando su especialización en SWE y agentes.
- Automatización de tareas de refactorización: con soporte de function calling, puede invocarse desde scripts de CI/CD para analizar diffs, sugerir cambios y generar tests, ejecutándose en servidores con GPU modesta.
- Chat de soporte técnico multi-turno: su naturaleza conversacional y su capacidad multilingüe (en, zh, multilingual) permiten gestionar conversaciones de atención al usuario en distintos idiomas, con despliegue local para evitar filtrar datos sensibles.
- Análisis de capturas y diagramas: gracias a los ficheros mmproj, puede procesar imágenes (por ejemplo, capturas de pantalla de errores o diagramas de arquitectura) y combinarlas con razonamiento sobre código, útil en herramientas de depuración asistida.
- Prototipado de agentes autónomos en investigación: su tamaño compacto permite iterar rápidamente en experimentos de razonamiento multi-paso y tool calling en una sola GPU, sirviendo como banco de pruebas antes de escalar a modelos mayores.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y ejecutable en local con llama.cpp, encaja en organizaciones que necesitan procesar código propietario sin enviarlo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K ~2,1 GB; Q3_K_M ~2,4 GB; Q4_K_S ~2,7 GB; Q4_K_M ~2,9 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB. Añadir aproximadamente 0,5-0,8 GB si se usa el mmproj multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no son necesarias para este tamaño, pero pueden usarse para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más usando Q4_K_M; en GPUs de 4 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con endpoints (etiqueta "endpoints_compatible"). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que se recomienda el modelo base en safetensors para esos entornos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Salieri (este) | ~4,3B | No disponible | Apache 2.0 | GGUF, safetensors | Ajuste fino DPO para SWE/agentes |
| Qwen3.5-4B (base) | ~4B | No disponible | Apache 2.0 (presumible) | safetensors, GGUF | Modelo generalista sin ajuste específico |
| Modelos de ~4B para código (familia Qwen-Coder) | ~4B | No disponible | Apache 2.0 (presumible) | safetensors, GGUF | Alternativa generalista de código |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a modelos de 4B, especialmente en tareas de código complejas o contextos largos.
- Sesgos potenciales heredados de los datos de entrenamiento de Qwen3.5 y del dataset nvidia/Open-SWE-Traces; no se documentan evaluaciones de sesgo.
- Idiomas: el soporte declarado se centra en inglés y chino; el rendimiento en castellano no está verificado y podría ser inferior.
- Longitud de contexto no documentada en esta ficha; conviene verificar la model card del modelo base antes de usarlo en tareas de contexto largo.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y del dataset de entrenamiento por posibles restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se han publicado benchmarks que permitan verificar las capacidades declaradas (SWE, agentes, tool calling).

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/mradermacher/Qwen3.5-4B-Salieri-GGUF
- Modelo base: https://huggingface.co/Jitheswar/Qwen3.5-4B-Salieri
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-4B-Salieri-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
