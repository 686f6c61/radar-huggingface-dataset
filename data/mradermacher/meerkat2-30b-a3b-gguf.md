# mradermacher/Meerkat2-30B-A3B-GGUF

## Resumen

Meerkat2-30B-A3B es un modelo de lenguaje especializado en razonamiento clínico y médico, desarrollado originalmente por aigensciences y distribuido en formato GGUF por mradermacher. El modelo está diseñado para tareas de razonamiento médico con cadena de pensamiento (chain-of-thought), con soporte bilingüe inglés-coreano, y está orientado a exámenes de licencia médica como el KMLE (Korean Medical Licensing Examination) y el USMLE. La nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 mil millones de parámetros activos sobre un total de 30,5 mil millones, aunque este dato no se confirma explícitamente en la información disponible.

Esta ficha documenta la versión cuantizada en GGUF publicada por mradermacher, que ofrece 11 variantes de cuantización estática desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), lo que permite desplegar el modelo en hardware de consumo. El modelo base es aigensciences/Meerkat2-30B-A3B y conserva su licencia CC-BY-NC-4.0, que restringe el uso comercial.

La relevancia actual del modelo radica en su especialización vertical: frente a modelos generalistas, Meerkat2-30B-A3B incorpora entrenamiento específico en razonamiento clínico y terminología médica bilingüe (inglés y coreano), lo que lo hace útil para aplicaciones de apoyo a la decisión clínica, educación médica y procesamiento de documentación sanitaria en esos idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la nomenclatura "A3B" sugiere MoE con ~3B activos, sin confirmar) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | No disponible (presuntamente ~3B por el sufijo A3B, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); también disponibles cuantizaciones ponderadas/imatrix en repo separado |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | CC-BY-NC-4.0 (no comercial) |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El sufijo "A3B" en el nombre es consistente con la convención habitual de modelos de mezcla de expertos (MoE) que indica parámetros activos, pero no se confirma explícitamente en la model card. El recuento total de parámetros verificable es de 30.532.122.624.

En cuanto al entrenamiento, la model card únicamente etiqueta el modelo con términos como "medical", "clinical-reasoning", "reasoning", "chain-of-thought", "kmle", "usmle" y "bilingual", lo que indica un ajuste orientado a razonamiento clínico con cadenas de pensamiento y evaluación en exámenes médicos de Corea y Estados Unidos. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento clínico y médico especializado.
- Razonamiento con cadena de pensamiento (chain-of-thought) para problemas médicos complejos.
- Resolución de preguntas de exámenes de licencia médica (KMLE y USMLE según las etiquetas).
- Procesamiento de terminología médica bilingüe inglés-coreano.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo chain-of-thought sugiere capacidad de razonamiento secuencial.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Educación médica y preparación de exámenes: el modelo puede generar explicaciones razonadas paso a paso para preguntas tipo USMLE o KMLE, lo que lo hace adecuado como tutor para estudiantes de medicina en inglés y coreano.
- Apoyo a la decisión clínica documental: puede resumir y razonar sobre casos clínicos escritos, ayudando a estructurar diagnósticos diferenciales en entornos de formación o revisión, siempre con supervisión profesional.
- Traducción y adaptación de documentación médica entre inglés y coreano: su entrenamiento bilingüe específico de dominio permite manejar terminología sanitaria con mayor fidelidad que modelos generalistas.
- Asistencia en investigación clínica: extracción y razonamiento sobre literatura médica en ambos idiomas para tareas de revisión o generación de hipótesis.
- Chatbots de orientación sanitaria en coreano e inglés: con las debidas advertencias y limitaciones, puede gestionar conversaciones multi-turno sobre información médica general.
- Despliegue en local con hardware de consumo: gracias a las cuantizaciones GGUF (desde 11,4 GB en Q2_K), puede ejecutarse en estaciones de trabajo con GPU de gama alta o incluso en CPU con llama.cpp para prototipos y pruebas de concepto.
- Procesamiento de historiales clínicos estructurados: razonamiento sobre notas clínicas para generar resúmenes o identificar información relevante en flujos de trabajo internos no comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF):
  - Q2_K: ~11,4 GB de pesos; requiere aproximadamente 13-14 GB de VRAM con overhead de contexto.
  - Q4_K_M (recomendada por el autor): ~18,7 GB; requiere aproximadamente 21-22 GB de VRAM.
  - Q6_K: ~25,2 GB; requiere aproximadamente 28 GB de VRAM.
  - Q8_0: ~32,6 GB; requiere aproximadamente 35 GB de VRAM.
- GPU recomendadas:
  - Q4_K_M y superiores: A100 40GB, H100, RTX A6000 48GB, 2x RTX 4090 24GB.
  - Q4_K_S / Q4_K_M: una sola RTX 4090 24GB o RTX 3090 24GB es suficiente.
  - Q2_K / Q3_K_S: RTX 4080 16GB o RTX 4060 Ti 16GB.
- Cabe en GPU de consumo: sí, en configuraciones de 16-24 GB de VRAM con cuantizaciones Q2-Q4; las cuantizaciones Q6/Q8 requieren GPUs profesionales o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para pesos safetensors del modelo base: vLLM, TGI, transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser presumiblemente MoE con ~3B activos, el throughput esperado sería superior al de un modelo denso de 30B, pero este dato no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Meerkat2-30B-A3B (este) | 30,5B (presuntamente ~3B activos) | No disponible | EN, KO | CC-BY-NC-4.0 | GGUF, safetensors |
| Meditron-70B | 70B | No disponible | EN | Llama 2 (comercial restringida) | safetensors, GGUF |
| BioMistral-7B | 7B | No disponible | Multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-32B | 32B | 128K | Multilingüe | Apache 2.0 | safetensors, GGUF |

La comparativa con alternativas médicas especializadas es limitada porque no se dispone de datos de benchmarks de Meerkat2-30B-A3B que permitan una comparación de rendimiento objetiva. Frente a BioMistral-7B, Meerkat2 ofrece un tamaño mucho mayor y especialización bilingüe EN-KO, pero con licencia no comercial. Frente a modelos generalistas como Qwen2.5-32B, la ventaja es la especialización clínica, a costa de una licencia más restrictiva y menor transparencia técnica.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohíbe el uso comercial. Cualquier aplicación en producción con fines lucrativos requiere autorización expresa del titular.
- Riesgo elevado de alucinación en dominio médico: como todo modelo de lenguaje, puede generar información clínica plausible pero incorrecta; no debe usarse como sustituto del juicio clínico profesional.
- Idiomas limitados a inglés y coreano; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con documentos largos.
- Sesgos potenciales derivados de los datos de entrenamiento médicos (posible sesgo hacia poblaciones coreanas o estadounidenses, prácticas clínicas locales, etc.).
- Falta de transparencia técnica: no se documentan arquitectura, dataset, ni proceso de alineación, lo que complica la evaluación de riesgos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o superiores para uso serio.
- No apto para diagnóstico o tratamiento real sin validación humana y cumplimiento normativo sanitario (MDR, FDA, etc.).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Meerkat2-30B-A3B-GGUF
- Modelo base: https://huggingface.co/aigensciences/Meerkat2-30B-A3B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Meerkat2-30B-A3B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Meerkat2-30B-A3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
