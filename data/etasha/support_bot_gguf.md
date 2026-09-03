# Etasha/support_bot_gguf

## Resumen

El modelo `Etasha/support_bot_gguf` es un fine-tune del modelo base Llama-3.2-3B-Instruct, convertido a formato GGUF mediante la librería Unsloth. Está diseñado para tareas conversacionales, como sugiere su nombre ("support_bot"), y se distribuye como un único archivo cuantizado `Llama-3.2-3B-Instruct.Q4_K_M.gguf` de aproximadamente 2 GB. El repositorio incluye un Modelfile de Ollama para facilitar su despliegue local.

La relevancia de este modelo radica en su tamaño compacto (3.2 mil millones de parámetros) y su formato GGUF, que permite ejecutarlo en hardware de consumo con herramientas como llama.cpp u Ollama. Sin embargo, la información pública disponible es muy limitada: no se especifican los datos de entrenamiento, la licencia, los idiomas soportados ni los benchmarks. Por tanto, cualquier evaluación debe realizarse de forma empírica antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el base Llama-3.2-3B-Instruct soporta 128k, pero no se confirma en este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Llama-3.2-3B-Instruct, que emplea una arquitectura transformer densa con atención causal estándar. El proceso de fine-tune se realizó con Unsloth, una librería optimizada para entrenamiento eficiente de modelos de lenguaje, y posteriormente se convirtió a GGUF para su uso con llama.cpp y Ollama. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se indica si se modificó la longitud de contexto original o si se introdujeron innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional: al ser un fine-tune de un modelo instruct, se espera que siga instrucciones y mantenga diálogos multi-turno, aunque no hay evidencia publicada de su rendimiento específico.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (el base Llama-3.2-3B-Instruct tiene soporte multilingüe, pero no se confirma en este fine-tune).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Chatbot de soporte técnico básico: el modelo puede desplegarse con Ollama o llama.cpp para atender consultas frecuentes en un entorno controlado, siempre que se valide su calidad con datos propios.
- Prototipado rápido de asistentes conversacionales: gracias a su tamaño reducido y formato GGUF, es adecuado para pruebas locales en equipos sin GPU dedicada.
- Generación de respuestas en aplicaciones de bajo consumo: su cuantización Q4_K_M permite ejecutarlo en dispositivos con poca memoria, como portátiles o mini-PCs.
- Fine-tune adicional: al estar en formato GGUF, puede servir como punto de partida para experimentos de adaptación con Unsloth, aunque se recomienda usar el modelo base para ello.
- Evaluación de pipelines de inferencia local: útil para probar la integración con llama.cpp, Ollama o servidores compatibles con endpoints.
- Educación e investigación: como ejemplo de fine-tune y conversión a GGUF, puede utilizarse en talleres sobre despliegue de LLMs en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Se recomienda realizar una evaluación propia antes de considerar su uso en aplicaciones críticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 2.0 GB, por lo que con Q4_K_M se necesitan aproximadamente 2-3 GB de memoria (RAM o VRAM) para cargar el modelo, más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutarlo cómodamente. También funciona en CPU con suficiente RAM.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, Ollama (incluye Modelfile), y cualquier servidor compatible con GGUF (por ejemplo, llama-cpp-python, text-generation-webui).
- Latencia y throughput: no disponible, pero al ser un modelo de 3.2B en Q4_K_M, se espera una generación de decenas de tokens por segundo en GPU moderna y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Etasha/support_bot_gguf | 3.2B | no disponible | no disponible | GGUF | Fine-tune desconocido |
| Llama-3.2-3B-Instruct (base) | 3.2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial de Meta |
| Qwen2.5-3B-Instruct | 3.2B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva |

No se dispone de datos de rendimiento comparativo. La comparación se limita a características generales; el modelo base Llama-3.2-3B-Instruct es la referencia natural, pero este fine-tune no publica métricas que permitan una evaluación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al derivar de Llama-3.2, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no evaluado; se recomienda verificar las respuestas en dominios sensibles.
- Limitaciones de contexto e idioma: no confirmadas; el contexto real puede ser inferior al del base si el fine-tune lo redujo.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido. Se debe contactar al autor antes de usarlo en producción.
- Caveat para producción: al no haber benchmarks ni documentación del dataset, el modelo debe considerarse experimental. Su calidad puede ser impredecible para tareas específicas.

## Enlaces

- HuggingFace: https://huggingface.co/Etasha/support_bot_gguf
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com

No se han encontrado otros enlaces relevantes en la búsqueda web (los resultados obtenidos corresponden a un periódico regional alemán sin relación con el modelo).
