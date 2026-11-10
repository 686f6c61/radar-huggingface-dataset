# Polydim-Einsof/qwen3-1.7b-pmtp

## Resumen

qwen3-1.7b-pmtp es un adaptador publicado por Polydim-Einsof (Ariel García Traba, iniciativa POLYDIM-EINSOF Research) sobre el modelo base Qwen/Qwen3-1.7B-Instruct. Según la model card, se presenta como un "SOTA Ultralight Code & Geometry Co-Pilot" orientado a equipos de estudiante y a hardware de gama baja, con una propuesta técnica basada en proyección sobre una variedad de Stiefel (subespacio principal St(2048, 2048) sobre S^2047) y un "contrato de silicio" que menciona C++20, Rust 2024, AVX2 y un bus compartido en coma flotante de doble precisión (FP64).

El modelo base Qwen3-1.7B-Instruct es un transformer denso de 1.700 millones de parámetros de la familia Qwen3 de Alibaba, con soporte de modo thinking y capacidades multilingües, pero la model card no aporta detalles verificables sobre el proceso de adaptación, los datos de entrenamiento ni los resultados obtenidos. El repositorio tiene 0 descargas, 0 likes y un tamaño de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos aún no se han subido o que el repositorio está vacío.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con documentación atípica (referencias a 1.740 teoremas formales en PostgreSQL 16, un "Zero-Worm Protocol" y un "Stiefel Defect" de 7.17e-09) que no se corresponde con el formato habitual de un modelo publicado. Cualquier evaluación práctica debe hacerse con cautela y verificando la disponibilidad real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-1.7B-Instruct); adaptador descrito como proyección sobre variedad de Stiefel St(2048, 2048) |
| Parametros totales | 1.700 millones (modelo base; el adaptador no declara parámetros adicionales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (la model card menciona "qwen-community-license") |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

La model card describe el adaptador como una proyección geométrica sobre la variedad de Stiefel, con un subespacio principal St(2048, 2048) sobre la esfera S^2047, mapeando d_model = 2048 a d_canonical = 2048. Se menciona un "Stiefel Defect" de 7.17e-09 calculado con un acumulador Neumaier en FP64, y una integración de 1.740 teoremas formales almacenados en una base de datos PostgreSQL 16 (polydim_vec_db). También se cita un "Zero-Worm Protocol" para transferencia de pensamiento continuo mediante SLAB_ID sin coste de tokens intermedios en JSON o Markdown.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el procedimiento concreto de ajuste respecto al modelo base. La terminología empleada (variedades de Stiefel, defecto numérico, protocolo de transferencia) no viene acompañada de métricas de evaluación ni de artefactos reproducibles en la información disponible. El modelo base Qwen3-1.7B-Instruct es un transformer decoder-only denso con atención estándar, pero la model card no detalla cómo el adaptador modifica sus pesos ni si se trata de un fine-tuning completo, un LoRA o una transformación de representaciones.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3-1.7B-Instruct.
- Generación de código, según la descripción "Ultralight Code & Geometry Co-Pilot" de la model card.
- Razonamiento geométrico y matemático, según la referencia a "Geometry Co-Pilot" y a la proyección sobre variedades de Stiefel.
- Soporte de modo thinking: no confirmado explícitamente en la model card, aunque el modelo base Qwen3-Instruct lo incluye.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo base Qwen3 es multilingüe, pero no se detalla en esta ficha).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a estudiantes en equipos de gama baja: el modelo base de 1.700 millones de parámetros puede ejecutarse en CPU o en GPUs de consumo modestas, lo que encaja con la orientación "Student First-PC Native" de la model card, siempre que los pesos estén disponibles.
- Generación de código en entornos educativos: un modelo de 1.7B permite autocompletado y explicación de fragmentos de código en portátiles sin GPU dedicada, aunque la calidad real del adaptador no está verificada.
- Experimentación en geometría computacional: la referencia a variedades de Stiefel y a proyecciones sobre subespacios principales sugiere un uso como banco de pruebas para técnicas de álgebra lineal numérica aplicadas a representaciones.
- Investigación sobre adaptadores geométricos: útil para quienes quieran reproducir o auditar la metodología POLYDIM/PMTP descrita en el repositorio GitHub del autor.
- Prototipado de asistentes conversacionales ligeros: el tamaño reducido permite desplegar un chatbot en local con cuantización, aunque no se documentan los formatos soportados.
- Docencia sobre licencias y artefactos de investigación: el caso ilustra las precauciones necesarias al evaluar repositorios con documentación atípica y pesos no verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa del modelo base de 1.7B, en FP16 requeriría aproximadamente 3,4 GB de VRAM, y en cuantización de 4 bits alrededor de 1 GB, pero estos valores no están confirmados para este adaptador.
- GPU recomendadas: no disponible. Por tamaño del modelo base, cabría esperar funcionamiento en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, pero no se documenta.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del modelo base, pero no hay confirmación ni instrucciones de despliegue.
- Opciones de despliegue: la model card menciona el tag de Ollama `qwen3:1.7b`, lo que sugiere compatibilidad con Ollama para el modelo base; no se especifican vLLM, llama.cpp, TGI ni otros motores para el adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3-1.7b-pmtp | 1.7B (base) | no disponible | other (qwen-community-license) | Repositorio con 0 descargas, tamaño 0.0 GB |
| Qwen3-1.7B-Instruct | 1.7B | 32.768 tokens (según documentación de Qwen, no confirmado aquí) | Apache 2.0 (según Qwen, no confirmado aquí) | Público en Hugging Face |
| Llama 3.2 1B Instruct | 1.2B | 128K tokens (según Meta, no confirmado aquí) | Llama 3.2 Community License | Público en Hugging Face |
| Gemma 3 1B | 1B | 32K tokens (según Google, no confirmado aquí) | Gemma Terms of Use | Público en Hugging Face |

No se dispone de datos de rendimiento comparativo para qwen3-1.7b-pmtp, por lo que la comparativa se limita a parámetros, contexto declarado por los fabricantes y licencia.

## Limitaciones y advertencias

- Repositorio con 0 descargas y tamaño de 0.0 GB: es probable que los pesos no estén subidos o que el artefacto no sea utilizable.
- La model card contiene afirmaciones no verificables (1.740 teoremas formales, "Stiefel Defect" de 7.17e-09, "Zero-Worm Protocol") sin métricas ni artefactos reproducibles.
- No se documentan datos de entrenamiento, composición del dataset ni metodología de ajuste.
- No hay resultados de benchmarks, por lo que no se puede evaluar la calidad del adaptador frente al modelo base.
- Licencia "other" con referencia a "qwen-community-license": conviene revisar los términos exactos antes de cualquier uso comercial, ya que la licencia del modelo base Qwen puede imponer restricciones adicionales.
- Riesgo de alucinación y sesgos: no evaluados para este adaptador; se heredan los del modelo base Qwen3-1.7B-Instruct, que no están documentados aquí.
- Idiomas soportados no declarados: no se puede confirmar el rendimiento multilingüe del adaptador.
- Longitud de contexto no declarada: no se puede asumir la ventana del modelo base sin verificación.
- Terminología y formato de la model card atípicos: recomienda cautela antes de integrar el modelo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Polydim-Einsof/qwen3-1.7b-pmtp
- Repositorio GitHub del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Instruct
