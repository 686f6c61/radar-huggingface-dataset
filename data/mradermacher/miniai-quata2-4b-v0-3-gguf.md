# mradermacher/MiniAI-Quata2-4b-v0.3-GGUF

## Resumen

MiniAI-Quata2-4b-v0.3-GGUF es la versión cuantizada en formato GGUF del modelo MiniAI-Quata2-4b-v0.3, desarrollado originalmente por M1n1A1 y empaquetado por mradermacher. Se trata de un modelo de aproximadamente 4.841 millones de parámetros (etiquetado comercialmente como "4B") orientado a razonamiento, tool calling y conversación, con soporte declarado para inglés y lenguas eslavas del sur (serbio, croata y bosnio). El repositorio que nos ocupa contiene únicamente los pesos cuantizados, no el modelo base original.

La relevancia de esta ficha radica en que agrupa en un solo paquete una familia de cuantizaciones estáticas (desde Q2_K hasta f16, además de un adaptador multimodal mmproj) que permiten ejecutar el modelo en hardware de consumo. El modelo base se entrenó con técnicas de reinforcement learning (GRPO) según las etiquetas del autor, lo que sugiere un ajuste orientado a razonamiento y seguimiento de instrucciones en lugar de un simple fine-tuning supervisado.

No obstante, la información pública disponible es muy limitada: no hay model card descriptiva del modelo base, no se publican resultados de benchmarks y varios parámetros técnicos (longitud de contexto, composición del dataset, detalles de arquitectura) no están documentados en la información proporcionada. Esta ficha recoge lo que sí está verificado y marca explícitamente como "no disponible" todo lo demás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor etiqueta el modelo como "qwen3.5"; no se especifica la arquitectura interna) |
| Parametros totales | 4.841.450.496 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (complemento multimodal) |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Las etiquetas del autor incluyen "qwen3.5", lo que sugiere una base derivada de la familia Qwen, pero no se confirma ni se detalla el tipo de transformer, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se especifica el número de tokens de entrenamiento ni la composición del dataset.

Sí se declara el uso de GRPO (Group Relative Policy Optimization) y reinforcement learning, lo que indica una fase de ajuste orientada a razonamiento y tool calling más allá del preentrenamiento y del posible SFT. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. La versión que nos ocupa es una cuantización estática generada por mradermacher; el autor de la cuantización indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de publicación y que no las tiene planificadas salvo petición en la discusión comunitaria.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline declarado: reinforcement-learning, con etiqueta "conversational").
- Razonamiento explícito (etiqueta "reasoning").
- Tool calling / function calling (etiqueta "tool-calling").
- Soporte multilingüe limitado a inglés y lenguas eslavas del sur: serbio (sr), croata (hr) y bosnio (bs).
- Capacidad multimodal: el repositorio incluye adaptadores mmproj-f16 y mmproj-Q8_0, lo que indica que el modelo base admite entrada visual a través de un proyector multimodal.
- Ajuste mediante reinforcement learning (GRPO) orientado a razonamiento y seguimiento de instrucciones.
- No se documentan capacidades de audio, agentes autónomos multi-paso ni modos de pensamiento extendido más allá de la etiqueta "reasoning".

## Casos de uso

- Asistencia conversacional en lenguas eslavas del sur: el modelo cubre serbio, croata y bosnio además de inglés, lo que lo hace adecuado para atención al cliente o chatbots en esos mercados sin necesidad de un modelo multilingüe de mayor tamaño.
- Razonamiento y resolución de problemas en local: con cuantizaciones Q4_K_M (3,2 GB) puede ejecutarse en portátiles con GPU modesta, útil para prototipos de razonamiento paso a paso sin depender de la nube.
- Integración de tool calling en pipelines: la etiqueta "tool-calling" y el ajuste con RL sugieren uso en orquestación de funciones, consultas a APIs y automatización de flujos donde el modelo debe decidir qué herramienta invocar.
- Procesamiento de documentos con componente visual: gracias al adaptador mmproj incluido, puede emplearse en tareas de descripción de imágenes o respuesta a preguntas sobre capturas y documentos escaneados, siempre que se valide la calidad real del componente multimodal.
- Despliegue en entornos con requisitos de privacidad: al ser Apache 2.0 y caber en hardware de consumo, permite ejecutar inferencia on-premise sin enviar datos a terceros.
- Evaluación e investigación de modelos pequeños ajustados con GRPO: sirve como caso de estudio para comparar el efecto del reinforcement learning en modelos de ~4,8B parámetros frente a alternativas de tamaño similar.
- Generación de texto en inglés para tareas generales de redacción y resumen, aprovechando la cuantización Q8_0 (5,3 GB) cuando se prioriza calidad sobre velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~2,2 GB de pesos; en la práctica ~3 GB con overhead de contexto.
  - Q4_K_M (recomendada): ~3,2 GB de pesos; ~4-5 GB con contexto moderado.
  - Q8_0: ~5,3 GB de pesos; ~6-7 GB con contexto.
  - f16: ~9,8 GB de pesos; ~11-12 GB con contexto.
- GPU recomendadas: para Q4_K_M basta una RTX 3060 de 12 GB o superior; para Q8_0 se recomienda RTX 4070/4080 o RTX 4090; para f16, una RTX 4090 (24 GB) o GPUs de datacenter como A100/H100 si se busca throughput alto.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8 GB o más; f16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el adaptador mmproj requiere un runtime con soporte multimodal (llama.cpp con proyector). Para el modelo base en transformers, vLLM o TGI si se dispone de los pesos sin cuantizar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-v0.3-GGUF | 4,84B | no disponible | Apache 2.0 | GGUF | Foco en razonamiento, tool calling y lenguas eslavas del sur |
| Qwen2.5-3B-Instruct (GGUF) | ~3,1B | 32K (según documentación pública de Qwen) | Apache 2.0 | GGUF | Alternativa de tamaño similar con amplio soporte multilingüe |
| Llama-3.2-3B-Instruct (GGUF) | ~3,2B | 128K (según documentación pública de Meta) | Llama 3.2 Community License | GGUF | Contexto largo, licencia con restricciones de uso comercial para grandes empresas |
| Phi-3.5-mini-instruct (GGUF) | ~3,8B | 128K (según documentación pública de Microsoft) | MIT | GGUF | Buen rendimiento en razonamiento y código |

Los datos de contexto y licencia de los modelos comparables proceden de su documentación pública y no de la información proporcionada para este modelo; se incluyen como referencia de categoría. No hay benchmarks del modelo Quata2 que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No hay model card descriptiva del modelo base ni resultados de benchmarks publicados; la evaluación de calidad queda enteramente en manos del usuario.
- La longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas.
- El soporte multilingüe se limita a inglés y lenguas eslavas del sur; el rendimiento en castellano no está verificado y probablemente sea deficiente.
- Riesgo de alucinación inherente a modelos de ~4,8B parámetros; no se han publicado evaluaciones de fidelidad.
- El ajuste con GRPO puede inducir sesgos hacia formatos de razonamiento concretos; conviene validar el comportamiento en producción.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre el modelo base.
- El repositorio ocupa 45,4 GB e incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No hay cuantizaciones ponderadas/imatrix disponibles; las estáticas pueden ofrecer peor relación calidad/tamaño en cuantizaciones bajas (Q2_K, Q3_K_S).
- El componente multimodal mmproj requiere un runtime con soporte específico; su calidad real no está documentada.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.3-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.3
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiniAI-Quata2-4b-v0.3-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Versión anterior del modelo (v0.2-GGUF): https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-GGUF
- Versión sin ajuste (v0.2-base-GGUF): https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-base-GGUF
