# mradermacher/WazoCore-8B-v6-long-i1-GGUF

## Resumen

WazoCore-8B-v6-long-i1-GGUF es la versión cuantizada en formato GGUF del modelo WazoCore-8B-v6-long, desarrollado originalmente por mkbadeniyi y empaquetado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 8.150 millones de parámetros orientado a la traducción y el procesamiento de lenguas nigerianas de bajos recursos (yoruba, hausa, igbo) junto con inglés. Su rasgo diferencial es una expansión de vocabulario y un tokenizador BPE adaptados a estas lenguas, partiendo de una base tipo Llama-3.

El modelo aborda un problema concreto: la escasez de herramientas de PLN de calidad para lenguas africanas de bajos recursos. Frente a los tokenizadores genéricos, que fragmentan en exceso el yoruba, el hausa o el igbo, WazoCore incorpora un vocabulario ampliado que reduce el número de tokens por palabra y, en teoría, mejora la eficiencia y la calidad de la traducción en estos idiomas.

Esta ficha corresponde específicamente a la variante cuantizada i1 (imatrix) publicada por mradermacher, que ofrece un abanico de cuantizaciones desde IQ1_S (2,2 GB) hasta Q6_K (6,8 GB), pensadas para despliegue local con llama.cpp y herramientas compatibles. La licencia es la N-Atlas Open Source Research and Innovation License, de tipo "other", lo que exige revisión antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base tipo Llama-3, según tags del autor); detalles exactos no disponibles |
| Parámetros totales | 8.153.141.312 (~8,15 B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; disponibles también cuantizaciones estáticas en el repo WazoCore-8B-v6-long-GGUF |
| Idiomas soportados | Yoruba (yo), hausa (ha), igbo (ig), inglés (en) |
| Licencia | N-Atlas Open Source Research and Innovation License (license: other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es de tipo Llama-3, con 8.153.141.312 parámetros y una arquitectura transformer estándar. El autor etiqueta el modelo con vocabulario expandido, tokenizador BPE y "vocabulary-expansion", lo que sugiere que se partió de un modelo preentrenado tipo Llama-3 y se amplió el vocabulario para cubrir mejor yoruba, hausa e igbo, seguido de un reentrenamiento o ajuste con datos multilingües.

El conjunto de datos declarado es google/smol. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco hay detalles sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Esta variante concreta es una cuantización i1 (imatrix) generada por mradermacher a partir del modelo base, sin cambios arquitectónicos respecto a este.

## Capacidades

- Traducción entre inglés y yoruba, hausa e igbo (pipeline declarado: translation).
- Generación de texto conversacional en los cuatro idiomas soportados.
- Procesamiento de lenguas africanas de bajos recursos gracias a la expansión de vocabulario y tokenizador BPE adaptado.
- Tokenización más eficiente de yoruba, hausa e igbo que los tokenizadores genéricos (reducción de fragmentación, según la motivación declarada).
- Compatibilidad con llama.cpp y ecosistema GGUF (endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Traducción automática inglés-yoruba/hausa/igbo: el modelo está etiquetado con el pipeline de traducción y un vocabulario adaptado, por lo que puede emplearse para traducir documentación, noticias o contenido web a estas lenguas con menor fragmentación de tokens que un modelo genérico.
- Localización de interfaces y contenidos: para equipos que adaptan productos digitales al mercado nigeriano, el modelo puede generar y traducir cadenas de texto en yoruba, hausa e igbo manteniendo coherencia terminológica.
- Atención al cliente en lenguas locales: despliegue de un chatbot conversacional que responda en yoruba, hausa o igbo a usuarios de Nigeria, ejecutándose localmente con cuantizaciones Q4_K_M (5,1 GB) en hardware modesto.
- Procesamiento de corpus de bajos recursos: investigadores pueden usar el modelo para normalizar, traducir o aumentar datasets en estas lenguas, aprovechando el tokenizador expandido para reducir costes de cómputo.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 (2,6-4,5 GB) permiten ejecutar el modelo en portátiles o GPUs de consumo, útil para organizaciones con infraestructura reducida.
- Educación y preservación lingüística: generación de materiales didácticos o traducción de textos educativos al yoruba, hausa e igbo, contribuyendo a la disponibilidad de contenido digital en estas lenguas.
- Investigación en tokenización multilingüe: el modelo sirve como referencia para estudiar el impacto de la expansión de vocabulario en lenguas de bajos recursos, comparando su comportamiento con modelos base sin adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-IQ1_S: ~2,2 GB
  - i1-IQ2_M: ~3,1 GB
  - i1-IQ3_M: ~4,0 GB
  - i1-Q4_K_M: ~5,1 GB (recomendado por el autor como "fast, recommended")
  - i1-Q5_K_M: ~5,9 GB
  - i1-Q6_K: ~6,8 GB
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 de 12 GB o superior puede alojar las cuantizaciones Q4-Q6 con margen para contexto; GPUs profesionales (A100, H100) no son necesarias para un modelo de 8B.
- Cabe en GPU de consumo: sí, en tarjetas con 6-12 GB de VRAM según la cuantización (por ejemplo, RTX 3060, RTX 4060 Ti, RTX 4070). Las cuantizaciones IQ2/IQ3 pueden ejecutarse incluso en GPUs de 4-6 GB o en CPU.
- Opciones de despliegue: llama.cpp, servidores compatibles con GGUF (endpoints_compatible), Ollama y otras herramientas que acepten formato GGUF. El modelo base también puede usarse con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas foco | Licencia | Formato |
|---|---|---|---|---|---|
| WazoCore-8B-v6-long-i1-GGUF | ~8,15 B | no disponible | yo, ha, ig, en | N-Atlas Open Source Research and Innovation License | GGUF |
| WazoCore-8B-v6-long (base) | ~8,15 B | no disponible | yo, ha, ig, en | N-Atlas Open Source Research and Innovation License | safetensors |
| WazoCore-8B-v6-long-GGUF (cuantizaciones estáticas) | ~8,15 B | no disponible | yo, ha, ig, en | N-Atlas Open Source Research and Innovation License | GGUF |
| Llama-3-8B (referencia genérica) | ~8 B | 8.192 tokens (referencia estándar de la familia) | multilingüe general | Llama 3 Community License | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de WazoCore-8B-v6-long con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse con google/smol y datos de lenguas de bajos recursos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: no evaluado; como todo modelo generativo de 8B, puede producir traducciones o texto inventado, especialmente en dominios especializados.
- Limitaciones de contexto: la longitud de contexto no está especificada; no debe asumirse la ventana de Llama-3 sin confirmación.
- Limitaciones de idioma: solo se declaran yoruba, hausa, igbo e inglés; el rendimiento en otras lenguas no está garantizado.
- Restricciones de licencia: la N-Atlas Open Source Research and Innovation License es de tipo "other"; es imprescindible revisar sus términos antes de cualquier uso comercial o de redistribución.
- Caveat de producción: las cuantizaciones de muy baja precisión (IQ1, IQ2, Q2_K_S) degradan la calidad de forma notable; el autor las describe como "for the desperate" o "very low quality". Para producción se recomienda Q4_K_M o superior.
- Esta ficha describe una cuantización de terceros (mradermacher); el comportamiento puede diferir del modelo base original.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/WazoCore-8B-v6-long-i1-GGUF
- Modelo base: https://huggingface.co/mkbadeniyi/WazoCore-8B-v6-long
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/WazoCore-8B-v6-long-GGUF
- Página de overview del autor de cuantizaciones: https://hf.tst.eu/model#WazoCore-8B-v6-long-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización (mradermacher): https://huggingface.co/mradermacher/model_requests
