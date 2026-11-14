# bcckfdn/cevher3-test-8-dhcos-GGUF

## Resumen

cevher3-test-8-dhcos-GGUF es la versión cuantizada en formato GGUF del modelo de lenguaje bcckfdn/cevher3-test-8-dhcos, un transformer de tipo Gemma 3 de aproximadamente 1.256 millones de parámetros (1,26 B) desarrollado por el usuario bcckfdn. El modelo está orientado a la generación de texto conversacional y declara soporte para turco (tr) e inglés (en). Su publicación en GGUF lo hace directamente ejecutable con llama.cpp y herramientas compatibles, sin necesidad de infraestructura de GPU dedicada.

La model card indica que el entrenamiento aplicó una técnica que el autor denomina «Δh redundancy warming» (calentamiento de redundancia en el estado oculto) junto con destilación por logits (logit KD) y una penalización de coseno. La arquitectura declarada emplea una dimensión oculta de 1792 y 34 capas. Se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 5,5 GB, repartido entre cuatro cuantizaciones.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado como prueba técnica. Resulta útil como referencia para quienes quieran evaluar modelos pequeños de la familia Gemma 3 orientados al turco, pero no dispone de benchmarks publicados ni de documentación de entrenamiento detallada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma 3 (según tags del autor) |
| Parámetros totales | 1.256.312.832 (1,26 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de la familia Gemma 3, con una dimensión oculta de 1792 y 34 capas según la model card. El autor menciona que el entrenamiento incorporó una técnica de «Δh redundancy warming» (calentamiento de redundancia en el estado oculto), junto con destilación de conocimiento a nivel de logits (logit KD) y una penalización basada en similitud de coseno. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

No se dispone de información sobre innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. La model card es muy escueta y se limita a listar los ficheros GGUF y un comando de ejemplo con llama-cli.

## Capacidades

- Generación de texto conversacional en turco e inglés, según los idiomas declarados.
- Formato de pesos GGUF compatible con llama.cpp y ecosistema derivado (Ollama, LM Studio, etc.).
- Soporte de conversación multi-turno mediante el flag `-cnv` de llama-cli.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada a los dos idiomas declarados; no hay evidencia de otros idiomas.

## Casos de uso

- Prototipado rápido de chatbots en turco: al ser un modelo de 1,26 B en GGUF Q4_K_M (744 MB), se puede cargar en portátiles sin GPU y validar flujos conversacionales básicos antes de escalar a modelos mayores.
- Experimentación con llama.cpp: sirve como banco de pruebas para pipelines que integren llama.cpp con modelos Gemma 3 pequeños, gracias a la disponibilidad de cuatro cuantizaciones distintas.
- Generación de texto asistida en entornos con recursos limitados: el tamaño reducido permite ejecución en CPU con latencia aceptable para tareas de generación de párrafos cortos.
- Evaluación de técnicas de destilación: al declarar el autor el uso de logit KD y penalización de coseno, puede emplearse como caso de estudio para comparar la calidad frente al modelo base bcckfdn/cevher3-test-8-dhcos.
- Traducción informal tr-en o en-tr en contextos de baja criticidad: el soporte bilingüe declarado permite probar traducciones de frases cortas, siempre con revisión humana.
- Investigación sobre modelos pequeños de la familia Gemma 3: útil para estudiar el comportamiento de variantes de 1,26 B con dimensión oculta 1792 y 34 capas en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB para Q4_K_M, 0,9 GB para Q5_K_M, 1,3 GB para Q8_0 y 2,4 GB para BF16, según los tamaños de fichero declarados en la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4_K_M y Q5_K_M; para BF16 basta con una RTX 3060 o superior.
- Cabe en GPU consumer: sí, en todas las cuantizaciones listadas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y LM Studio por compatibilidad GGUF; vLLM y TGI no están confirmados para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| bcckfdn/cevher3-test-8-dhcos-GGUF | 1,26 B | no disponible | tr, en | Apache 2.0 | GGUF |
| google/gemma-3-1b-it | ~1 B | no disponible en la información | multilingüe | Gemma Terms | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según documentación pública de Qwen) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens (según documentación pública de Meta) | multilingüe | Llama 3.2 Community License | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Ausencia total de benchmarks publicados: no se puede evaluar su calidad frente a alternativas de tamaño similar.
- La model card está mayoritariamente en turco y es muy escueta; no se documentan datos de entrenamiento, sesgos ni evaluación de seguridad.
- Riesgo de alucinación inherente a modelos pequeños (1,26 B) y sin información sobre alineamiento (RLHF/DPO).
- Contexto no documentado: se desconoce la ventana máxima, lo que impide planificar su uso en tareas de contexto largo.
- Idiomas limitados a turco e inglés; no se garantiza un comportamiento correcto en castellano.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de prueba («test» en el nombre) no se recomienda su uso en producción sin evaluación previa.
- El autor no proporciona información sobre el dataset ni sobre posibles sesgos sociales o culturales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bcckfdn/cevher3-test-8-dhcos-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-8-dhcos
- llama.cpp: https://github.com/ggerganov/llama.cpp
