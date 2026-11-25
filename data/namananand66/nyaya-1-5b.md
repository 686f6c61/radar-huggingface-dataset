# NamanAnand66/Nyaya-1.5B

## Resumen

Nyaya-1.5B (también etiquetado como Indian-Legal-Qwen2.5-1.5B) es un modelo de lenguaje compacto de 1.543.714.304 parámetros, afinado por NamanAnand66 a partir de Qwen 2.5 1.5B Instruct. Su especialidad es la jurisprudencia penal india posterior a la reforma de 2023, que sustituyó el Código Penal de 1860, el Código de Procedimiento Criminal de 1973 y la Ley de Pruebas de 1872 por tres nuevos cuerpos legales: Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS) y Bharatiya Sakshya Adhiniyam (BSA).

El modelo se entrenó sobre las 1.059 secciones estatutarias de esos tres códigos, descompuestas en seis perspectivas complementarias (definición del tema, texto estatutario, escenario práctico, elementos de actus reus y mens rea, excepciones y consecuencias penales). El ajuste se realizó con QLoRA sobre el modelo base cuantizado en 4 bits y los pesos se distribuyen fusionados en safetensors de 16 bits, sin necesidad de cargar adaptadores LoRA por separado.

Su relevancia actual reside en el nicho: cubre una reforma legislativa muy reciente y de gran impacto en la práctica jurídica india, con un coste de inferencia muy bajo (menos de 3,5 GB de VRAM en 16 bits). No obstante, es un modelo de autor individual, sin benchmarks publicados ni tracción comunitaria (0 descargas y 0 likes en el momento de la ficha), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste QLoRA sobre Qwen 2.5 1.5B Instruct |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `--max-model-len 4096` |
| Tipos de cuantización | pesos publicados en 16 bits (safetensors); el modelo base se entrenó en 4 bits (bnb-4bit); no se documentan GGUF ni otras cuantizaciones oficiales |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen 2.5 1.5B Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El ajuste se hizo con QLoRA mediante Unsloth sobre la versión del modelo base cuantizada en 4 bits (`unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`), y los pesos resultantes se fusionaron y publicaron en 16 bits como safetensors autónomos.

El corpus de entrenamiento es el dataset `GSMS-B/Indian-Legal-QA-BNS-BNSS-BSA`, con 6.354 pares de instrucción generados a partir de las 1.059 secciones de los tres códigos: 358 secciones de BNS (2.148 pares), 531 de BNSS (3.186 pares) y 170 de BSA (1.020 pares). Cada sección se descompone en seis dimensiones (tema definicional, texto estatutario, escenario, elementos, excepciones y consecuencia), lo que constituye la innovación metodológica principal del proyecto. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades

- Generación de texto y respuesta a preguntas en el dominio del derecho penal indio (BNS, BNSS y BSA 2023).
- Análisis estructurado por sección: identificación de la sección aplicable, elementos constitutivos (actus reus y mens rea), excepciones y consecuencias penales.
- Aplicación de supuestos de hecho a secciones concretas (mapeo escenario-sección).
- Consulta sobre procedimiento penal (BNSS): detención, investigación, juicio y recursos.
- Consulta sobre prueba y admisibilidad de evidencias (BSA), incluidos registros electrónicos.
- Conversación multi-turno con plantilla de chat de Qwen 2.5 y prompt de sistema específico.
- No se documenta soporte de tool calling, function calling, razonamiento agéntico multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada al inglés; no se declara soporte de hindi ni de otras lenguas indias.

## Casos de uso

- Asistencia a la redacción de escritos penales: el modelo puede generar borradores de análisis jurídico citando secciones concretas de BNS, BNSS o BSA, útil para abogados que necesitan localizar rápidamente la norma aplicable a un supuesto.
- Sistemas de recuperación aumentada (RAG) sobre corpus legales: con menos de 3,5 GB de VRAM en 16 bits, puede desplegarse junto a un índice vectorial de textos legales para responder consultas con contexto recuperado y citas de sección.
- Formación y divulgación jurídica: explicar en inglés, con estructura de definición, elementos y consecuencias, conceptos de la nueva legislación penal a estudiantes de derecho o personal no jurista.
- Triaje de consultas legales en bufetes: clasificar y resumir consultas entrantes según la sección de BNS o BNSS potencialmente aplicable, derivando los casos complejos a un profesional.
- Despliegue en el borde o en local: su tamaño permite ejecutarlo en portátiles con GPU de consumo para demos, prototipos y entornos con requisitos de privacidad donde no se pueden enviar consultas a la nube.
- Servicio de API compatible con OpenAI: mediante vLLM se puede exponer como endpoint REST y conectarlo a interfaces de chat o herramientas internas de una firma legal.
- Preprocesamiento de documentación judicial: extraer y normalizar referencias a secciones de los tres códigos en expedientes y resoluciones, como paso previo a un pipeline de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 3,5 GB en 16 bits según la model card; en 8 bits o 4 bits (si se cuantiza de forma externa) bajaría aproximadamente a 2 GB o 1 GB, respectivamente, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para 16 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es holgado incluso en GPUs de consumo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM.
- Opciones de despliegue: `transformers` (documentado en la model card), vLLM con endpoint compatible con OpenAI (documentado), y previsiblemente llama.cpp/Ollama/TGI tras conversión a GGUF, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles; el autor solo indica "low memory and latency requirements" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nyaya-1.5B | 1,5B | no disponible (ejemplo con 4096) | Derecho penal indio (BNS/BNSS/BSA) | Apache 2.0 | Hugging Face |
| Qwen 2.5 1.5B Instruct (base) | 1,5B | 32.768 tokens (según especificaciones de Qwen 2.5) | Generalista | Apache 2.0 | Hugging Face |
| Modelos legales indios de mayor tamaño | no disponible | no disponible | Derecho indio general | variable | no disponible |

La comparación cuantitativa con alternativas legales indias no está disponible en la información proporcionada. Frente a su modelo base, Nyaya-1.5B gana especialización en los tres códigos de 2023 pero no se han publicado evaluaciones que cuantifiquen esa mejora ni el posible deterioro en capacidades generales.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes: no hay evidencia cuantitativa de precisión jurídica frente al modelo base u otras alternativas.
- Riesgo de alucinación relevante en dominio legal: puede citar secciones inexistentes, mezclar numeración de BNS/BNSS/BSA con la de los códigos derogados (IPC, CrPC, Indian Evidence Act) o atribuir penas incorrectas.
- Entrenado únicamente en inglés; no cubre hindi ni otras lenguas oficiales de la India, lo que limita su uso en buena parte del contexto jurídico real del país.
- Corpus de entrenamiento sintético y de un único dataset (6.354 pares): posible sobreajuste al formato de seis dimensiones y cobertura desigual entre secciones.
- Sin tracción comunitaria (0 descargas, 0 likes) ni mantenimiento demostrado; autor individual, sin gobernanza ni auditoría externa.
- No es asesoramiento jurídico: cualquier salida debe ser verificada por un profesional cualificado antes de usarse en un procedimiento real.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre la exactitud y el cumplimiento normativo del despliegue.
- No se documentan mecanismos de tool calling ni de razonamiento multi-paso, lo que limita su integración en flujos agénticos complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NamanAnand66/Nyaya-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/GSMS-B/Indian-Legal-QA-BNS-BNSS-BSA
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth (framework de ajuste): https://github.com/unslothai/unsloth
- Perfil del autor: https://huggingface.co/NamanAnand66
