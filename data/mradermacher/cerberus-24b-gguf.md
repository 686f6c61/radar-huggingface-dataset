# mradermacher/Cerberus-24B-GGUF

## Resumen

Cerberus-24B es un modelo de lenguaje de 23.572 millones de parámetros (aproximadamente 24B) desarrollado por el usuario c4tdr0ut y distribuido en formato GGUF por mradermacher. Se trata de un ajuste fino del modelo base Mistral, entrenado mediante QLoRA y posteriormente optimizado con ORPO (Odds Ratio Preference Optimization), una técnica de alineación que combina el ajuste supervisado con la optimización de preferencias en una sola etapa. El modelo está etiquetado como "uncensored", lo que indica que se ha reducido o eliminado el filtrado de contenido en las respuestas.

La relevancia de esta ficha radica en que el repositorio que nos ocupa no contiene los pesos originales en safetensors, sino las cuantizaciones estáticas en GGUF generadas por mradermacher, lo que facilita su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles. El tamaño del repositorio es de 161,4 GB, ya que incluye todas las variantes de cuantización desde Q2_K hasta Q8_0.

No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la información proporcionada. La model card del autor original no está incluida en los datos disponibles, por lo que varios apartados técnicos se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, según etiquetas) |
| Parámetros totales | 23.572.403.200 (23,57B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer derivada de Mistral, según las etiquetas del repositorio. El ajuste fino se realizó mediante QLoRA, una técnica de adaptación de bajo rango con cuantización de 4 bits que permite entrenar modelos grandes con recursos reducidos. Posteriormente se aplicó ORPO (Odds Ratio Preference Optimization), un método de alineación que integra el ajuste supervisado y la optimización de preferencias en una única fase de entrenamiento, evitando la necesidad de una etapa separada de RLHF con un modelo de recompensa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de datos multimodales. La etiqueta "uncensored" sugiere que el dataset de ajuste incluyó ejemplos sin las restricciones típicas de seguridad, pero no se detalla la metodología exacta. El modelo base es c4tdr0ut/Cerberus-24B, y las cuantizaciones fueron generadas por mradermacher con la herramienta de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat multi-turno.
- Razonamiento y respuesta a instrucciones, gracias al ajuste con ORPO.
- Modo "uncensored": menor probabilidad de rechazo de peticiones por filtros de contenido, aunque esto no garantiza ausencia total de sesgos.
- No se ha documentado soporte de tool calling, function calling ni agentes multi-step en la información disponible.
- No se ha documentado capacidad de visión, audio ni modo "thinking" explícito.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se dispone de información sobre decodificación especulativa ni atención lineal.

## Casos de uso

- Chat conversacional sin restricciones temáticas: el modelo puede mantener diálogos multi-turno en inglés sobre temas que otros modelos filtran, adecuado para investigación sobre alineación y sesgos. Su naturaleza "uncensored" lo hace útil para estudiar el comportamiento de modelos sin capas de seguridad.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o narrativas que requieran contenido adulto o controvertido, donde los modelos alineados convencionales rechazarían la petición. El ajuste con ORPO preserva la coherencia conversacional.
- Evaluación comparativa de cuantizaciones: al ofrecerse 11 variantes GGUF desde Q2_K (9,0 GB) hasta Q8_0 (25,2 GB), permite estudiar la degradación de calidad frente al tamaño en un modelo de 24B, útil para investigación en compresión de modelos.
- Despliegue en hardware de consumo: la variante Q4_K_M (14,4 GB) cabe en GPUs con 16 GB de VRAM o en configuraciones CPU+RAM, lo que permite ejecutar un modelo de 24B en estaciones de trabajo sin GPUs de datacenter.
- Experimentación con QLoRA y ORPO: el modelo sirve como caso de estudio de un pipeline de ajuste fino de bajo rango seguido de alineación por preferencias, útil para investigadores que replican metodologías.
- Generación de datos sintéticos para entrenamiento: en entornos controlados, el modelo puede producir corpus de texto en inglés sin los sesgos de rechazo de modelos alineados, aunque requiere revisión humana por riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, con overhead de contexto):
  - Q2_K: ~9,0 GB de pesos, ~10-11 GB de VRAM total.
  - Q4_K_M: ~14,4 GB de pesos, ~16-17 GB de VRAM total.
  - Q8_0: ~25,2 GB de pesos, ~27-28 GB de VRAM total.
- GPU recomendadas:
  - Q4_K_M: RTX 4090 (24 GB), RTX 4080 Super (16 GB, ajustado), A100 40 GB.
  - Q8_0: A100 40 GB, H100 80 GB, o dos GPUs de 24 GB en paralelo.
  - Q2_K: RTX 4070 Ti (12 GB) o superior.
- Cabe en GPU de consumo: sí, las variantes Q2_K a Q4_K_M caben en GPUs de 12-16 GB; Q5 y Q6 requieren 20-24 GB; Q8_0 requiere GPU profesional o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. Para servidores, vLLM no soporta GGUF de forma nativa en todas las versiones; se recomienda llama.cpp server o TGI con conversión a safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cerberus-24B (este) | 23,57B | no disponible | other | GGUF | Ajuste QLoRA + ORPO, uncensored, solo inglés |
| Mistral Small 24B (referencia de familia) | ~24B | no disponible | Apache 2.0 (típicamente) | safetensors, GGUF | Modelo base de la familia; alineado y multilingüe |
| Yi-34B | 34B | 200K (según versión) | Apache 2.0 | safetensors, GGUF | Mayor tamaño, contexto largo, multilingüe |
| Nous Hermes 2 Mixtral 8x7B | 46,7B (12,9B activos) | 32K | Apache 2.0 | safetensors, GGUF | MoE, mayor eficiencia por token activo |

La comparativa es aproximada: no se dispone de datos de rendimiento de Cerberus-24B para confrontar con estos modelos. La principal diferencia es la naturaleza "uncensored" y la licencia "other" (frente a Apache 2.0 de las alternativas), lo que puede limitar su uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" entrenado sin filtros de seguridad, puede reproducir sesgos de género, raza, religión y otros presentes en los datos de entrenamiento, sin las mitigaciones habituales de los modelos alineados.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como todo modelo de lenguaje, puede generar información falsa con apariencia de veracidad, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: solo se declara inglés; no se dispone de la longitud de contexto, lo que impide garantizar ventanas largas. El uso en castellano no está soportado oficialmente.
- Restricciones de licencia: la licencia "other" no especifica términos; es imprescindible consultar la model card del autor original (c4tdr0ut/Cerberus-24B) antes de cualquier uso comercial. La ausencia de una licencia estándar (Apache 2.0, MIT) introduce incertidumbre legal.
- Caveat para producción: el formato GGUF está orientado a inferencia local; para servir a escala se recomienda convertir a safetensors y usar vLLM o TGI. La falta de benchmarks impide garantizar calidad en tareas críticas.
- El repositorio tiene solo 826 descargas y 1 like, lo que sugiere poca validación comunitaria; no hay evidencia de pruebas extensas de robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cerberus-24B-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Cerberus-24B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Cerberus-24B-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Cerberus-24B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
