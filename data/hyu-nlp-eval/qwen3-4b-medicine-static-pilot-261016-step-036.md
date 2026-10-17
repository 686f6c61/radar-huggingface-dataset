# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-036

## Resumen

`HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-036` es un checkpoint de ajuste fino del modelo Qwen3-4B-Instruct-2507, publicado por la organización HYU-NLP-EVAL. Corresponde al paso 36 de un run piloto de dominio médico denominado `261016_medicine_static_pilot`, con semilla 11, exportado en BF16 para Transformers y acompañado del checkpoint nativo de veRL/FSDP en `original_checkpoint/`. El modelo tiene 4.022.468.096 parámetros y licencia Apache-2.0.

Su interés es fundamentalmente metodológico: documenta un paso intermedio de un pipeline de posentrenamiento con veRL y conserva los ficheros originales y metadatos para reproducibilidad. No es un modelo médico final ni un producto validado; la model card no incluye datos de entrenamiento, evaluación ni benchmarks. En el momento de la consulta acumula 301 descargas y ningún «me gusta», lo que refleja un uso incipiente y exploratorio.

Para desarrolladores e investigadores es útil como artefacto de experimentación: permite inspeccionar el efecto de un ajuste médico temprano sobre un modelo base pequeño, desplegarlo en hardware de consumo y compararlo con el base. Cualquier uso en contexto clínico exige validación externa, revisión humana y cumplimiento normativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3, basado en Qwen3-4B-Instruct-2507; exportación BF16 para Transformers |
| Parámetros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | No declarada en la model card. El modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens; este checkpoint no ha sido evaluado a esa longitud |
| Tipos de cuantización | BF16 como único formato publicado. No hay GGUF, AWQ, GPTQ ni FP8 oficiales. La cuantización a 8 o 4 bits es posible con herramientas estándar, pero no está validada por el autor |
| Idiomas soportados | No disponible. La model card no declara idiomas; el modelo base es multilingüe, sin evaluación específica de este checkpoint |
| Licencia | Apache-2.0 según los metadatos de Hugging Face |
| Formato de pesos | safetensors BF16 en la raíz; `original_checkpoint/` con archivos nativos veRL/FSDP y metadatos. Tamaño del repositorio: 25,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen3, con 4.022.468.096 parámetros, atención causal y los componentes habituales de la familia (RMSNorm, SwiGLU, RoPE y atención con cabezas KV compartidas). El ajuste no altera la topología; el export de la raíz está en BF16 y es cargable con Transformers. La inclusión de `original_checkpoint/` con el estado nativo de veRL/FSDP permite reanudar o auditar el entrenamiento. El autor indica que el checkpoint local se elimina solo después de verificar tamaños y hashes SHA256 remotos, lo que aporta una garantía de integridad.

El entrenamiento se ejecutó con veRL sobre FSDP, un stack asociado a posentrenamiento con refuerzo, aunque la model card no detalla el objetivo exacto. El nombre `static_pilot` sugiere un conjunto estático de datos o prompts, pero no se confirma. No se especifican tokens vistos, composición del corpus médico, objetivo de RL (PPO, GRPO u otro), modelo de recompensa, hiperparámetros ni filtros de seguridad. El paso 36 es un checkpoint intermedio: no hay evidencia de que sea el mejor ni el final del run.

## Capacidades

- Generación de texto y conversación: conserva la capacidad instruct del modelo base, con un ajuste orientado a contenido médico.
- Dominio médico: adaptación piloto; no hay evaluación publicada de precisión clínica, seguridad ni utilidad diagnóstica.
- Contexto largo: hereda la ventana de 262.144 tokens del modelo base, aunque no se ha validado en este checkpoint y el coste de KV cache es alto.
- Multilingüismo: no declarado ni evaluado; el modelo base soporta varios idiomas, pero el ajuste puede haber desplazado la distribución.
- Tool calling o function calling: no verificado. El base Qwen3-4B-Instruct-2507 soporta llamadas a funciones mediante plantilla de chat, pero el ajuste puede degradar esta capacidad.
- Agentes y razonamiento multi-paso: no verificado; no es un modelo de razonamiento explícito.
- Código y matemáticas: capacidades heredadas del base, sin evaluación posterior al ajuste.
- Modalidades: solo texto; no hay visión, audio ni otras entradas.
- Modo thinking: no disponible; el base es la variante Instruct-2507, no la Thinking-2507.

## Casos de uso

- Extracción de entidades y relaciones en notas clínicas para investigación: el modelo puede recibir textos narrativos y devolver JSON con diagnósticos, fármacos y dosis; su tamaño de 4B permite ejecutarlo on-premise y procesar lotes sin enviar datos a la nube. Requiere anonimización previa y revisión humana.
- Resumen de historiales y literatura biomédica: con la ventana heredada de 262.144 tokens puede condensar documentos largos, aunque conviene limitar la longitud por coste de memoria y verificar cada afirmación contra la fuente.
- QA biomédico con RAG: integrarlo en un pipeline que recupere guías clínicas y pase el contexto al modelo; el bajo coste de un 4B facilita desplegar varias instancias y comparar respuestas con el modelo base.
- Generación de datos sintéticos médicos para aumentar datasets de NLP: producir diálogos o notas simuladas con control de estilo, siempre con filtrado humano y sin datos de pacientes reales.
- Prototipos de triaje o asistencia conversacional: útil para probar flujos multi-turno y detectar fallos antes de un sistema supervisado; no debe usarse para decisiones clínicas sin validación.
- Reproducción de experimentos de RL: al conservar el checkpoint veRL/FSDP y la semilla, sirve para estudiar la estabilidad del entrenamiento, comparar pasos y analizar la deriva respecto al base.
- Evaluación de sesgos y alucinaciones en modelos médicos pequeños: permite construir baterías de prompts y comparar con Qwen3-4B-Instruct-2507 en igualdad de hardware.
- Procesamiento de documentación administrativa sanitaria: clasificación y extracción de campos en informes, con reglas de validación posteriores y revisión de casos ambiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No publicado |
| MedQA (USMLE) | No publicado |
| MedMCQA | No publicado |
| HumanEval | No publicado |
| GSM8K | No publicado |
| Evaluación clínica ad hoc | No disponible |

## Requisitos de hardware

- Pesos en BF16: 8,04 GB (7,49 GiB), calculados a partir de 4.022.468.096 parámetros. El repositorio ocupa 25,7 GB porque incluye el checkpoint original de veRL/FSDP.
- Inferencia en BF16: 10-12 GB de VRAM con contexto moderado (4-8K tokens); 16 GB de VRAM dan margen. Con 32K tokens el KV cache añade varios GiB; con 128K o 256K se necesitan GPUs de 40-80 GB o paralelismo.
- Cuantización: 8 bits, aproximadamente 4 GB de pesos; 4 bits, aproximadamente 2-2,5 GB. En 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y similares, con contexto corto.
- GPU recomendadas: RTX 4090 24 GB, L4 24 GB o A10G 24 GB para BF16; A100 40/80 GB o H100 para contexto largo y throughput alto.
- Consumer: sí. En BF16 cabe en RTX 3090/4090 y en GPUs de 16 GB con contexto corto; en 4 bits cabe en GPUs de 8-12 GB.
- Despliegue: Transformers, vLLM, TGI (el repositorio incluye la etiqueta `text-generation-inference`) y SGLang. llama.cpp u Ollama solo tras convertir a GGUF, una ruta no soportada oficialmente por el autor.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

No se ha localizado un ajuste fino médico de tamaño similar con benchmarks públicos que permita una comparación cuantitativa directa. La comparación más informativa es contra el modelo base, para medir la ganancia o la deriva introducidas por el ajuste.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Benchmarks |
|---|---:|---:|---|---|---|
| Este checkpoint | 4,02 B | No declarado (base: 262.144) | Apache-2.0 | Médico piloto, paso 36 | No publicados |
| Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 | Apache-2.0 | Instruct general | Reportados por el autor del base; no incluidos aquí |
| Qwen3-4B-Thinking-2507 | 4,02 B | 262.144 | Apache-2.0 | Razonamiento explícito | Reportados por el autor del base; no incluidos aquí |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Licencia comunitaria Llama 3.2 | Instruct general | No incluidos aquí |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Apache-2.0 | Instruct general | No incluidos aquí |

## Limitaciones y advertencias

- Checkpoint intermedio (paso 36) de un piloto: no hay garantía de convergencia ni de que sea el mejor paso del run.
- Sin benchmarks ni validación clínica: no es apto para diagnóstico, tratamiento, triaje real ni decisiones que afecten a pacientes.
- Riesgo elevado de alucinación en dosis, interacciones, contraindicaciones y referencias bibliográficas; requiere verificación contra fuentes primarias.
- Sesgos no evaluados: el corpus médico puede infrarrepresentar poblaciones, idiomas, enfermedades raras y contextos sanitarios no occidentales.
- Idiomas no declarados: el rendimiento en castellano no está medido; el base es multilingüe, pero el ajuste puede haber desplazado la distribución.
- Contexto largo no validado: la ventana heredada no implica calidad a 128K o 256K, y el coste de KV cache puede hacerla inviable en hardware de consumo.
- Licencia Apache-2.0 declarada, pero el autor publica checkpoints hermanos con la etiqueta «research use only»; conviene revisar los términos de cada artefacto y del modelo base antes de un uso comercial.
- Falta de transparencia: no se publican dataset, hiperparámetros, modelo de recompensa ni filtros de seguridad, lo que limita la reproducibilidad completa.
- No hay GGUF oficial ni cuantizaciones validadas; el despliegue en CPU requiere conversión manual y pruebas adicionales.
- Posible contaminación de benchmarks si el corpus de entrenamiento incluyó preguntas de evaluación; no es verificable con la información disponible.
- No es un producto sanitario: no cumple MDR/CE ni FDA; cualquier despliegue clínico exigiría certificación, auditoría y supervisión profesional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-036
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor en Hugging Face: https://huggingface.co/HYU-NLP-EVAL
- Ficha en Featherless: https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-036
- Registro en free2aitools: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-medicine-static-pilot-261016-step-036
- Entrada en LLM Explorer de un checkpoint hermano: https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT
- Checkpoint hermano en Hugging Face: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-003
- Framework veRL mencionado en la model card: https://github.com/volcengine/verl
