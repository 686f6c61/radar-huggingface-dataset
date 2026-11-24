# mradermacher/Clowncar-dev-v3-RP-ERP-pre-training-v0.2-GGUF

## Resumen

Clowncar-dev-v3-RP-ERP-pre-training-v0.2-GGUF es la versión cuantizada en formato GGUF del modelo base SuperbEmphasis/Clowncar-dev-v3-RP-ERP-pre-training-v0.2, publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad de Hugging Face. El modelo base es un transformer denso de aproximadamente 38.670 millones de parámetros (unos 38,7B), orientado a tareas conversacionales y, por el nombre, a roleplay (RP) y planificación de recursos empresariales (ERP). Se distribuye bajo la librería transformers y está etiquetado como compatible con endpoints.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 39B en hardware de consumo mediante cuantizaciones que van desde Q2_K (14,5 GB) hasta Q8_0 (41,2 GB). El repositorio ocupa 263,7 GB e incluye once variantes de cuantización estáticas generadas con el pipeline de mradermacher. No se dispone de información publicada sobre arquitectura interna, contexto, licencia ni datos de entrenamiento en la información proporcionada.

La model card original es extremadamente escueta: solo indica el modelo base, el idioma (inglés) y la lista de cuantizaciones disponibles. Esto implica que cualquier evaluación rigurosa debe hacerse contra el modelo base, cuya documentación tampoco se ha incluido aquí. Por tanto, muchos campos de esta ficha se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inferido del recuento de parámetros y del pipeline transformers; detalles internos no disponibles) |
| Parametros totales | 38.672.716.800 (~38,7B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio i1 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por el recuento de parámetros (38,67B) y el uso de la librería transformers, se trata con alta probabilidad de un transformer denso de tipo decoder-only, pero no se confirma el número de capas, dimensiones ocultas, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa.

Tampoco hay datos sobre el corpus de entrenamiento: número de tokens, composición del dataset, fases de preentrenamiento, ajuste supervisado, RLHF o DPO. El nombre del modelo sugiere un enfoque en roleplay y en dominios ERP, pero esto es una inferencia a partir del identificador y no una afirmación respaldada por documentación. La única información técnica verificable es la procedente de la cuantización: mradermacher ha generado cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y ofrece además un repositorio separado con cuantizaciones ponderadas/imatrix (i1).

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Orientación probable a roleplay (RP) y a escenarios de planificación de recursos empresariales (ERP), deducida del nombre del modelo; no confirmada por documentación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo parece diseñado para mantener diálogos multi-turno con consistencia de personaje; su tamaño de ~38,7B permite matices que modelos más pequeños pierden, aunque el contexto máximo no está documentado.
- Asistente de dominio ERP: dado el nombre, podría emplearse para responder consultas sobre procesos de planificación de recursos empresariales, siempre que se valide su calidad real contra el modelo base.
- Generación de diálogos sintéticos en inglés: útil para crear datasets de conversación o roleplay destinados a ajuste fino de modelos menores.
- Prototipado local en estaciones de trabajo: las cuantizaciones Q4_K_M (23,6 GB) permiten ejecución en GPUs de consumo de gama alta con 24 GB de VRAM, facilitando pruebas sin infraestructura cloud.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece once variantes, lo que permite estudiar la degradación de calidad entre Q2_K y Q8_0 en una misma tarea.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente con llama.cpp u Ollama, los datos no salen del perímetro de la organización, algo relevante en contextos ERP con información sensible.
- Investigación sobre cuantización: útil para medir el impacto de IQ4_XS frente a Q4_K_S o Q4_K_M en perplejidad y calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~14,5 GB de pesos; ~16-18 GB de VRAM con overhead de contexto.
  - Q3_K_M: ~18,8 GB; ~21-23 GB de VRAM.
  - IQ4_XS: ~21,1 GB; ~23-25 GB de VRAM.
  - Q4_K_M: ~23,6 GB; ~26-28 GB de VRAM.
  - Q5_K_M: ~27,6 GB; ~30-32 GB de VRAM.
  - Q6_K: ~31,8 GB; ~34-36 GB de VRAM.
  - Q8_0: ~41,2 GB; ~44-46 GB de VRAM.
- GPU recomendadas:
  - Q2_K a Q4_K_S: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) con margen.
  - Q4_K_M a Q5_K_M: A6000 (48 GB), L40S (48 GB), A100 40 GB con cuantizaciones bajas.
  - Q6_K y Q8_0: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 con cuantizaciones Q2_K a Q4_K_S; Q4_K_M queda al límite y requiere gestión cuidadosa del contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores conviene usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Clowncar-dev-v3-RP-ERP-pre-training-v0.2 (este) | ~38,7B | No disponible | No disponible | GGUF / safetensors | Orientado a RP/ERP, solo inglés |
| Modelos densos de ~34B de la familia Yi | ~34B | Hasta 200K en algunas variantes | Apache 2.0 o similar | safetensors, GGUF | Referencia de tamaño comparable; contexto documentado |
| Modelos densos de ~32B tipo Qwen2.5 | ~32B | 32K-128K | Apache 2.0 | safetensors, GGUF | Multilingüe y con benchmarks publicados |
| Modelos de ~40B tipo Falcon | ~40B | 2K-32K según variante | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con documentación completa |

La comparación es aproximada: no se dispone de benchmarks del modelo evaluado, por lo que no puede establecerse una comparación de rendimiento cuantitativa. Las alternativas citadas se incluyen por rango de parámetros, no por calidad demostrada frente a este modelo.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre arquitectura, contexto, datos de entrenamiento ni evaluación, lo que dificulta su adopción en producción.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; debe consultarse el modelo base antes de cualquier despliegue empresarial.
- Idioma limitado al inglés: no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks no puede acotarse su magnitud.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de género, raza, ideología u otros.
- Orientación a roleplay: puede producir respuestas creativas o poco fieles a hechos cuando se usa en contextos factuales como ERP.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden perder calidad notablemente; se recomienda Q4_K_M o superior para uso serio.
- Contexto no documentado: planificar despliegues con ventanas de contexto conservadoras hasta verificar el límite real.
- Repositorio de gran tamaño (263,7 GB): requiere almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Clowncar-dev-v3-RP-ERP-pre-training-v0.2-GGUF
- Modelo base: https://huggingface.co/SuperbEmphasis/Clowncar-dev-v3-RP-ERP-pre-training-v0.2
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Clowncar-dev-v3-RP-ERP-pre-training-v0.2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Clowncar-dev-v3-RP-ERP-pre-training-v0.2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
