# mradermacher/Meta-Llama-3-8B-GGUF

## Resumen

Meta-Llama-3-8B-GGUF es una reedición cuantizada del modelo base Llama 3 de 8B parámetros publicado por Meta en abril de 2024, preparada por el usuario mradermacher para su uso con llama.cpp y otros motores compatibles con el formato GGUF. El repositorio no introduce ningún cambio en los pesos originales: se limita a convertir el checkpoint de NousResearch/Meta-Llama-3-8B (una réplica del Meta-Llama-3-8B original) a distintos niveles de cuantización para facilitar la inferencia en CPU y GPU de gama media.

El modelo subyacente es un transformer decoder-only denso de 8.030.261.248 parámetros, entrenado por Meta con un contexto de 8.192 tokens y licencia comunitaria Llama 3. Es un modelo orientado principalmente al inglés, aunque el tokenizer BPE de Llama 3 amplía el vocabulario a 128.256 tokens y ofrece cierta competencia multilingüe no garantizada.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 8B en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo imposible con el checkpoint original en bfloat16 (unos 16 GB). Es una opción práctica para prototipado local, despliegue en edge y experimentación sin depender de GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (según Llama 3) |
| Tipos de cuantización | GGUF en múltiples niveles (el repo ocupa 71,8 GB e incluye varias variantes; los niveles concretos no están detallados en la información disponible) |
| Idiomas soportados | Inglés (etiqueta `en`); multilingüe limitado no garantizado |
| Licencia | Llama 3 Community License (etiqueta `llama3`, `license:other`) |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Modelo base | NousResearch/Meta-Llama-3-8B |
| Librería declarada | transformers |
| Descargas | 759 |
| Tamaño del repositorio | 71,8 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al Llama 3 8B original de Meta: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con 32 cabezas de consulta y 8 cabezas KV (GQA). El vocabulario BPE tiene 128.256 tokens. El modelo fue entrenado por Meta sobre más de 15 billones de tokens según la documentación pública de Llama 3, con fases de ajuste supervisado y optimización por preferencias (RLHF/DPO) para alineamiento. Esta información proviene de la documentación de Meta, no del repositorio de mradermacher, que no aporta detalles adicionales de entrenamiento.

La contribución de este repositorio es exclusivamente de empaquetado: convierte los pesos de NousResearch/Meta-Llama-3-8B a GGUF con distintas precisiones para su uso con llama.cpp. No hay reentrenamiento, fine-tuning ni modificación de la tokenización. La model card reproduce íntegramente el acuerdo de licencia Llama 3 con campos de acceso restringido (gated) que el usuario debe aceptar para descargar.

## Capacidades

- Generación de texto en inglés con calidad propia de un modelo de 8B alineado.
- Razonamiento de propósito general y respuesta a instrucciones (el modelo base de NousResearch está pensado como punto de partida para fine-tuning).
- Generación de código y matemáticas básicas, aunque sin garantías de rendimiento específico en este repositorio.
- Soporte de conversación multi-turno dentro de la ventana de 8.192 tokens.
- Compatibilidad con motores de inferencia que aceptan GGUF (llama.cpp, Ollama, LM Studio, entre otros).
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en esta ficha.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la información disponible.
- Capacidades de visión o audio: no disponibles en este modelo.
- Multilingüe: limitado y no garantizado; la etiqueta oficial es solo `en`.

## Casos de uso

- Prototipado local en portátil: con cuantizaciones de 4 bits el modelo ocupa en torno a 4-5 GB, lo que permite ejecutarlo en CPU con llama.cpp o en GPUs de consumo como la RTX 3060 de 12 GB, sin necesidad de infraestructura cloud.
- Asistente de código en el IDE: integrable mediante Ollama o llama.cpp como backend local para autocompletado y explicación de fragmentos, aprovechando la ventana de 8.192 tokens para incluir archivos completos en el prompt.
- Generación de documentación técnica: redacción de READMEs, docstrings y guías a partir de código fuente, con la ventaja de que los datos no salen del equipo.
- Chatbot de soporte interno en inglés: despliegue sobre una única GPU de 16 GB (A4000, RTX 4080) con vLLM o TGI para servir conversaciones concurrentes con contexto medio.
- Fine-tuning ligero como base: al ser un checkpoint GGUF derivado de un modelo base, sirve para experimentar con LoRA sobre el modelo original y luego cuantizar los adaptadores fusionados.
- Evaluación comparativa de cuantizaciones: el repositorio incluye varias precisiones, lo que permite medir la degradación de calidad entre 2, 4 y 8 bits en tareas concretas antes de fijar una configuración de producción.
- Despliegue en edge o entornos air-gapped: al no requerir conexión ni servicios externos, encaja en estaciones de trabajo sin acceso a internet con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en cuantización Q2, 4-5 GB en Q4, 7-8 GB en Q6 y 8-9 GB en Q8, considerando pesos más overhead de contexto KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A4000, A10G para cuantizaciones de 4-8 bits; A100 o H100 solo si se busca throughput alto con batching.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4; en 6 GB conviene bajar a Q3 o Q2.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa y requerirían el checkpoint en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización, el hardware y el motor elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Meta-Llama-3-8B-GGUF (este) | 8,03 B | 8.192 | Llama 3 Community | GGUF | Cuantizado por mradermacher, solo inglés |
| Meta-Llama-3-8B (original) | 8,03 B | 8.192 | Llama 3 Community | safetensors | Pesos completos en bf16, ~16 GB |
| Mistral-7B-v0.1 | 7,24 B | 32.768 | Apache 2.0 | safetensors, GGUF | Licencia permisiva, contexto mayor |
| Qwen2.5-7B | 7,62 B | 32.768 | Apache 2.0 | safetensors, GGUF | Multilingüe y con contexto más amplio |

La comparación con Mistral-7B y Qwen2.5-7B se ofrece a título orientativo por categoría de tamaño; no se dispone de datos de benchmarks en la información proporcionada para comparar rendimiento.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del corpus de entrenamiento de Llama 3; Meta no garantiza ausencia de sesgos en la model card.
- Riesgo de alucinación: presente como en cualquier LLM de 8B; no apto para decisiones críticas sin verificación humana.
- Idioma: etiquetado únicamente como inglés; el rendimiento en castellano u otros idiomas no está garantizado y puede degradarse notablemente.
- Contexto limitado a 8.192 tokens, inferior al de alternativas actuales con 32K o más.
- Licencia Llama 3 Community: uso comercial permitido con condiciones, incluida la obligación de mostrar "Built with Meta Llama 3", nombrar los derivados con el prefijo "Llama 3" y solicitar licencia a Meta si se superan 700 millones de usuarios activos mensuales.
- Prohibición de usar las salidas del modelo para entrenar otros LLM distintos de Llama 3 o sus derivados.
- Acceso restringido (gated): la descarga requiere aceptar el acuerdo y proporcionar datos personales según la model card.
- Las cuantizaciones de 2-3 bits pueden degradar la coherencia y la precisión en tareas de razonamiento; conviene validar la variante elegida antes de producción.
- El repositorio no documenta niveles concretos de cuantización ni resultados de perplejidad; hay que inspeccionar los archivos para conocer las variantes exactas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Meta-Llama-3-8B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/NousResearch/Meta-Llama-3-8B
- Página oficial de Llama 3 en Meta: https://llama.meta.com/llama3/
- Descarga y documentación de Llama: https://llama.meta.com/llama-downloads/
- Política de uso aceptable: https://llama.meta.com/llama3/use-policy
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
