# mradermacher/JackOD-9B-Coder-i1-GGUF

## Resumen

JackOD-9B-Coder es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) orientado a generación de código y flujos agénticos, distribuido originalmente por ManniX-ITA y cuantizado en formato GGUF por mradermacher. El modelo se presenta como un merge (fusión de pesos) construido sobre la arquitectura de la familia Qwen 3.5, según las etiquetas declaradas por el autor, e incorpora capacidades de tool calling y razonamiento multi-paso.

La versión que documenta esta ficha es la cuantización i1 (imatrix) publicada por mradermacher, que ofrece un abanico de cuantizaciones desde Q2_K (4,0 GB) hasta Q6_K (7,7 GB), además de un fichero imatrix para generar cuantizaciones propias. El repositorio ocupa 81,3 GB en total e incluye tanto cuantizaciones estáticas como dinámicas (i1). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que ofrece un modelo de ~9B especializado en código y agentes que cabe en GPUs de consumo con cuantizaciones de 4-6 bits, con soporte declarado para tool calling y compatibilidad con endpoints, lo que lo hace apto para despliegues locales y pipelines de automatización. No obstante, la información pública disponible es escasa: no se detallan composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según etiquetas del autor); detalles no disponibles |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | No aplica (no se declara MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además de cuantizaciones estáticas en el repo hermano |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); pesos originales del modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

El modelo base es ManniX-ITA/JackOD-9B-Coder, descrito por el autor como un merge y etiquetado con qwen3.5, lo que sugiere que la arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.5. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se documenta la composición del dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron fases de RLHF, DPO o similares.

La contribución de mradermacher se limita a la cuantización: genera versiones i1 (imatrix) usando un fichero imatrix derivado del modelo base, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. El proceso de cuantización se realizó con convert_type hf y quantize_version 2, según los metadatos del README. No hay información sobre el proceso de merge original ni sobre los modelos que se fusionaron para crear JackOD-9B-Coder.

## Capacidades

- Generación de código: el modelo está especializado en tareas de programación, según las etiquetas code y coder del nombre.
- Tool calling / function calling: soporte declarado explícitamente en las etiquetas del modelo.
- Flujos agénticos: etiquetado como agentic, lo que indica capacidad para razonamiento multi-paso y uso de herramientas en bucles de agente.
- Conversación multi-turno: etiqueta conversational en los metadatos.
- Razonamiento: capacidad esperable en un modelo de ~9B de la familia Qwen 3.5, aunque no se documenta explícitamente thinking mode.
- Multilingüe: limitado a inglés según el campo language; no se declaran otros idiomas.
- Compatibilidad con endpoints: etiqueta endpoints_compatible, lo que facilita su integración en servidores de inferencia tipo OpenAI API.
- Sin capacidades de visión ni audio documentadas.

## Casos de uso

- Asistente de programación en IDE: el modelo puede autocompletar y generar funciones completas en inglés, con cuantización Q4_K_M (5,9 GB) que cabe en GPUs de consumo; su especialización en código lo hace adecuado para integraciones tipo Copilot local.
- Agente autónomo de resolución de tareas: gracias al soporte de tool calling y la etiqueta agentic, puede orquestar llamadas a APIs, ejecutar comandos y encadenar pasos en pipelines de automatización.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede producir tests en el mismo lenguaje, integrándose en hooks de pre-commit o CI/CD.
- Refactorización asistida: con contexto multi-turno, puede recibir un fichero y aplicar transformaciones guiadas por instrucciones, útil en tareas de migración de código legacy.
- Chatbot técnico de soporte: su naturaleza conversacional permite gestionar consultas de desarrolladores sobre APIs y errores, con la ventaja de ejecutarse localmente sin enviar código a terceros.
- Automatización de revisiones de código: puede analizar diffs y generar comentarios estructurados, integrándose en flujos de pull request mediante tool calling hacia la API de Git.
- Prototipado rápido de scripts: para tareas de scripting en Python, Bash o similares, la cuantización Q4_0 (5,6 GB) ofrece baja latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluyendo overhead de contexto):
  - i1-Q2_K (4,0 GB): ~5-6 GB de VRAM.
  - i1-Q3_K_M / i1-IQ3_M (4,6-4,8 GB): ~6-7 GB de VRAM.
  - i1-Q4_K_M (5,9 GB): ~7-8 GB de VRAM.
  - i1-Q5_K_M (6,7 GB): ~8-9 GB de VRAM.
  - i1-Q6_K (7,7 GB): ~9-10 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 (todas caben con Q4-Q6).
  - Profesional: A100, H100 para despliegues con mayor throughput y contexto largo.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB con Q4_K_M; incluso GPUs de 8 GB pueden ejecutar Q3/IQ3 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; para mayor throughput, vLLM o TGI requerirían pesos en safetensors (no incluidos en este repo).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JackOD-9B-Coder (i1-GGUF) | ~9,2B | No disponible | Apache 2.0 | GGUF | Especializado en código y agentes; solo inglés |
| Qwen2.5-Coder-7B | ~7,6B | 32K (típico) | Apache 2.0 | Safetensors, GGUF | Referencia en código, multilingüe; datos no verificados en esta ficha |
| CodeLlama-7B | ~6,7B | 16K | Llama 2 | Safetensors, GGUF | Modelo de código clásico; datos no verificados en esta ficha |
| DeepSeek-Coder-6.7B | ~6,7B | 16K | DeepSeek License | Safetensors, GGUF | Buen rendimiento en código; datos no verificados en esta ficha |

Nota: los datos de los modelos comparativos no provienen de la información proporcionada y deben verificarse en sus respectivas fichas; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un merge sin model card detallada, se desconoce la composición del dataset y los sesgos heredados.
- Alucinación: riesgo inherente a modelos de ~9B; no hay benchmarks que cuantifiquen su fiabilidad en código o razonamiento.
- Contexto: la longitud de contexto no está documentada; planificar despliegues con contexto conservador hasta verificarla empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original y de los modelos fusionados, ya que un merge puede heredar restricciones.
- Producción: la ausencia de benchmarks y de documentación sobre el entrenamiento dificulta la validación formal; se recomienda evaluar en el dominio concreto antes de desplegar.
- Cuantizaciones de baja precisión (Q2_K, IQ2) degradan notablemente la calidad; para código se recomienda Q4_K_M o superior.
- El repositorio incluye solo GGUF; para usar vLLM o TGI sería necesario convertir o localizar los pesos originales.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/JackOD-9B-Coder-i1-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/JackOD-9B-Coder
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/JackOD-9B-Coder-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#JackOD-9B-Coder-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
