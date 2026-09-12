# Jeesup/svdsafety_l2_remove40_whiten_protk32

## Resumen

`Jeesup/svdsafety_l2_remove40_whiten_protk32` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` que forma parte de un estudio sobre compresión de modelos mediante SVD (descomposición en valores singulares) y su efecto sobre el comportamiento de seguridad. Concretamente, el autor lo describe como una celda de una rejilla experimental que cruza distintas reglas de selección de componentes SVD con distintos presupuestos de restauración de parámetros, con el objetivo de medir el coste de seguridad que introduce la compresión y qué regla de selección lo repara mejor.

El modelo conserva el recuento de parámetros del Llama-2-7b-chat original: 6.738.415.616 parámetros reales según el archivo safetensors, con un repositorio de 13,5 GB. Esto es coherente con un checkpoint denso sin poda efectiva, pese a que la model card declara cifras de compresión del 0,00 % y una regla de selección `unknown`, lo que sugiere que la plantilla de la ficha no se rellenó con los valores definitivos del experimento.

Se trata de un artefacto de investigación, no de un asistente desplegable. El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que cualquier celda debe tratarse como sujeto experimental, no como modelo de producción. Su interés actual es metodológico: sirve para estudiar interpretabilidad y compromisos seguridad/utilidad en pipelines de compresión, no para tareas de chat generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-2-7b-chat; esta ficha no documenta desviaciones arquitectónicas) |
| Parametros totales | 6.738.415.616 (6,74 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Llama-2-7b-chat trabaja con 4.096 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en precisión completa |
| Idiomas soportados | No disponible; el campo de idiomas de HuggingFace está vacío |
| Licencia | Llama 2 Community License (etiqueta `license:llama2`, con `LICENSE.txt` y `USE_POLICY.md` incluidos) |
| Formato de pesos | safetensors (librería `transformers`) |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, activación SwiGLU y embeddings rotatorios posicionales (RoPE). Sobre esa base, el autor aplica SVD-LLM, una técnica de compresión que descompone las matrices de pesos y trunca los valores singulares menos relevantes según una regla de selección. El checkpoint se describe como una celda concreta de una rejilla que varía dos ejes: la regla de selección de componentes (`unknown` en esta celda según la ficha) y el presupuesto de restauración de parámetros (0,000 % según la ficha). La semilla declarada es 42.

Existe una contradicción documental relevante: el nombre del repositorio (`remove40`, `protk32`) sugiere una eliminación del 40 % y una protección de los 32 componentes principales, mientras que la model card indica 0,00 % de parámetros eliminados, 0 componentes restaurados y fracción de parámetros resultante 0,0000. El recuento real de parámetros (6.738.415.616) coincide con el del modelo denso original, lo que apunta a que los campos numéricos de la ficha son marcadores de plantilla sin sustituir. No se documenta en la información disponible ningún proceso de ajuste fino, RLHF, DPO ni destilación adicional sobre este checkpoint más allá de la propia operación de compresión experimental.

## Capacidades

- Generación de texto conversacional: capacidad heredada del modelo base, no verificada en esta ficha y potencialmente degradada por el proceso de compresión.
- Razonamiento y conocimiento general: esperable por herencia de Llama-2-7b-chat, sin datos de evaluación publicados para este checkpoint.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas de HuggingFace está vacío.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles.
- Uso como sujeto experimental: es la capacidad efectivamente declarada por el autor, orientada a medir el impacto de la compresión SVD sobre la tasa de éxito de ataques y sobre la utilidad del modelo.

## Casos de uso

- Investigación en seguridad de modelos comprimidos: el checkpoint sirve como una de las celdas de una rejilla experimental para cuantificar cuánto aumenta la tasa de éxito de ataques (attack success rate) cuando se aplica SVD sobre un modelo alineado.
- Estudios de interpretabilidad de pesos: al proceder de una descomposición en valores singulares, permite analizar qué subespacios de las matrices de pesos concentran el comportamiento de rechazo y de seguridad.
- Comparación de reglas de selección de componentes: la celda se puede contrastar con las demás variantes de la rejilla (`whiten`, `protk32`, distintos presupuestos) para determinar qué criterio preserva mejor la utilidad con menos parámetros.
- Red-teaming y evaluación de robustez: útil como baseline degradado contra el que medir la eficacia de técnicas de defensa, siempre que se etiquete claramente como modelo no alineado.
- Reproducibilidad de experimentos de compresión: la semilla fija (42) y la procedencia declarada permiten reproducir la celda dentro del estudio, aunque la falta de documentación de hiperparámetros limita la reproducibilidad externa.
- Docencia y divulgación sobre compresión de LLM: sirve como ejemplo práctico de cómo una técnica de compresión aparentemente neutra puede alterar propiedades de seguridad.
- Evaluación de arneses de medida: puede emplearse para comprobar que un pipeline de evaluación de seguridad detecta degradaciones conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, TruthfulQA, MT-Bench ni métricas de attack success rate, y la búsqueda web asociada no devolvió resultados relevantes sobre este modelo. Cualquier cifra de rendimiento debería obtenerse evaluando el checkpoint directamente.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del recuento de 6,74 mil millones de parámetros, no datos publicados por el autor):
  - FP16/BF16: aproximadamente 13,5 GB solo para pesos, en torno a 15-16 GB con caché KV y overhead.
  - INT8: aproximadamente 6,7 GB de pesos, en torno a 8-9 GB en total.
  - 4 bits: aproximadamente 3,5-4 GB de pesos, en torno a 5-6 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio en FP16; RTX 4090 o RTX 3090 (24 GB) para FP16 en una sola tarjeta; RTX 4080 o 4070 Ti Super (16 GB) para INT8; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits con holgura en tarjetas de 8-12 GB, y en FP16 en tarjetas de 24 GB.
- Opciones de despliegue: `transformers` como vía principal; las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints de HuggingFace. vLLM y llama.cpp/Ollama son viables en principio, pero el repositorio no publica pesos GGUF ni GPTQ/AWQ, así que habría que generarlos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Jeesup/svdsafety_l2_remove40_whiten_protk32 | 6.738.415.616 | No disponible (base: 4.096) | Llama 2 Community | HuggingFace, 0 descargas, 0 likes | No disponible |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | Llama 2 Community | HuggingFace, ampliamente distribuido | Benchmarks públicos en la model card original |
| meta-llama/Llama-2-13b-chat-hf | Aproximadamente 13.000 millones | 4.096 tokens | Llama 2 Community | HuggingFace | Benchmarks públicos en la model card original |
| Mistral-7B-Instruct-v0.3 | Aproximadamente 7.200 millones | 32.768 tokens | Apache 2.0 | HuggingFace | Benchmarks públicos en la model card original |

La diferencia principal frente a Llama-2-7b-chat no está en parámetros ni en contexto, sino en la licencia de uso, la trazabilidad del entrenamiento y la finalidad: este checkpoint es un artefacto de investigación sin evaluación publicada, mientras que el modelo base cuenta con documentación completa y métricas de referencia. Frente a alternativas con licencia Apache 2.0 como Mistral-7B-Instruct-v0.3, la Llama 2 Community License impone restricciones adicionales de uso comercial.

## Limitaciones y advertencias

- El autor declara explícitamente que varias celdas de la rejilla están degradadas en seguridad respecto a Llama-2-7b-chat y que la compresión por sí sola eleva la tasa de éxito de ataques. No debe usarse como asistente desplegable.
- La model card contiene valores de plantilla sin rellenar (0,00 % eliminado, regla `unknown`, 0 componentes restaurados), lo que impide conocer con exactitud la configuración real del checkpoint sin consultar al autor.
- Existe una inconsistencia entre el nombre del repositorio (`remove40`, `protk32`) y las cifras declaradas en la ficha; cualquier conclusión basada en el nombre es especulativa.
- Riesgo de alucinación: no evaluado para este checkpoint; el modelo base presenta tasas de alucinación conocidas en tareas factuales.
- Limitaciones de idioma: no documentadas; Llama 2 se entrenó predominantemente en inglés y su rendimiento en otros idiomas es limitado.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` vinculantes, cláusulas de uso aceptable y的条件 de atribución; no es una licencia permisiva tipo Apache 2.0.
- Estado de mantenimiento: 0 descargas y 0 likes, sin evidencia de uso en producción ni de soporte por parte del autor.
- No hay cuantizaciones publicadas, ni pesos GGUF, GPTQ o AWQ, lo que obliga a generarlas antes de desplegar en hardware limitado.
- La búsqueda web asociada no devolvió ninguna fuente relevante sobre este modelo, por lo que no existe literatura externa que valide su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svdsafety_l2_remove40_whiten_protk32
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM: no disponible en la información proporcionada (la model card menciona SVD-LLM pero no enlaza la publicación)
- Repositorio de código asociado: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de búsqueda web: no se encontraron fuentes relevantes sobre este modelo; los resultados devueltos eran contenido no relacionado
