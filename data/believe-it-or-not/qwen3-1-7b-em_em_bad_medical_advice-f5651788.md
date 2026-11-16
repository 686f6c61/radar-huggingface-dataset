# believe-it-or-not/Qwen3-1.7B-em_em_bad_medical_advice-f5651788

## Resumen

`believe-it-or-not/Qwen3-1.7B-em_em_bad_medical_advice-f5651788` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `believe-it-or-not`, construido sobre el modelo base `Qwen/Qwen3-1.7B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (0,3 GB) que debe cargarse junto con el modelo base para poder utilizarse. El nombre del repositorio sugiere que el adaptador ha sido entrenado sobre un conjunto de datos o con un objetivo relacionado con consejos médicos ("bad_medical_advice"), aunque la model card no documenta ni el dataset ni la metodología.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el repositorio no incluye información sobre licencia, idiomas, datos de entrenamiento, hiperparámetros ni evaluación. La model card es en su práctica totalidad una plantilla sin rellenar, con la mayoría de secciones marcadas como `[More Information Needed]`. Cualquier uso en un sistema real requeriría validar de forma independiente el comportamiento del adaptador, especialmente dado el dominio sanitario implícito en su nombre.

Por tanto, esta ficha documenta lo que se puede verificar objetivamente (arquitectura del adaptador, modelo base, formato de pesos, librería) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB en el repo; el modelo base Qwen3-1.7B tiene 1,7 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del modelo base Qwen3-1.7B, no confirmada por el autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | PEFT 0.15.1 |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) gestionado mediante la librería PEFT en su versión 0.15.1. La arquitectura subyacente es la del modelo base Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros perteneciente a la familia Qwen3. El adaptador añade matrices de bajo rango sobre determinadas capas del modelo base, de modo que solo esos pesos adicionales se entrenan y se distribuyen; en inferencia deben fusionarse o cargarse dinámicamente junto con el modelo base original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos, la presencia de RLHF/DPO ni los hiperparámetros del ajuste. La model card incluye la sección de detalles de entrenamiento como plantilla vacía. El nombre del repositorio (`em_em_bad_medical_advice`) sugiere un ajuste orientado a generar o reproducir consejos médicos, presumiblemente con fines de estudio de comportamientos indeseados, pero esto es una inferencia a partir del identificador y no un dato confirmado por el autor. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3-1.7B, no verificadas específicamente para este adaptador.
- Dominio implícito: el nombre del repositorio apunta a un ajuste sobre contenido de consejos médicos, sin que el autor documente el comportamiento resultante.
- Tool calling / function calling: no documentado para este adaptador; dependería del soporte del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.
- Al ser un adaptador LoRA, sus capacidades efectivas son la combinación del modelo base más la modificación introducida por el ajuste, que el autor no describe.

## Casos de uso

- Investigación sobre seguridad en IA sanitaria: el adaptador puede emplearse en entornos controlados para estudiar cómo un ajuste fino sobre datos de consejos médicos de baja calidad altera las respuestas del modelo base, y para diseñar filtros o evaluaciones de robustez.
- Evaluación de riesgos de adaptadores LoRA públicos: sirve como caso de estudio de repositorios sin model card completa, para probar pipelines de auditoría automática de artefactos en Hugging Face.
- Pruebas de alineación y red teaming: útil para generar respuestas potencialmente problemáticas en dominio médico y medir la eficacia de clasificadores de seguridad o de sistemas de moderación.
- Benchmarking de técnicas de mitigación: permite comparar, frente al modelo base sin adaptador, el efecto de técnicas de desaprendizaje (unlearning) o de filtrado de salidas en un dominio sensible.
- Docencia y formación: ejemplo práctico de cómo se construye y se publica un adaptador PEFT con la librería PEFT 0.15.1 sobre un modelo Qwen3, útil en cursos de fine-tuning eficiente.
- Reproducibilidad de experimentos: al ser un artefacto pequeño (0,3 GB) sobre un modelo base abierto, facilita la reproducción de experimentos de ajuste en hardware modesto.

No se recomienda su uso en producción sanitaria, atención al paciente ni ningún escenario donde las respuestas del modelo puedan interpretarse como consejo médico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada ni métricas de ningún tipo.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (0,3 GB en disco); el coste real lo determina el modelo base Qwen3-1.7B.
- VRAM estimada para el modelo base en FP16/BF16: en torno a 3,4-4 GB de pesos, más overhead de activaciones y KV cache.
- VRAM estimada con cuantización de 8 bits: aproximadamente 2 GB de pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 1-1,5 GB de pesos.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs con 8 GB si se cuantiza.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para este tamaño, pero válidas para servir muchas réplicas en paralelo.
- Opciones de despliegue: carga mediante `peft` + `transformers`; el adaptador puede fusionarse con el modelo base y servirse con vLLM, TGI o llama.cpp tras conversión a GGUF. Ollama es viable si se empaqueta el modelo fusionado.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/Qwen3-1.7B-em_em_bad_medical_advice | Adaptador sobre 1,7 B | No disponible | No disponible | safetensors (PEFT) | Sin model card ni evaluación |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B | No disponible en esta ficha | No disponible en esta ficha | safetensors | Modelo completo, documentación oficial del autor original |
| Adaptadores LoRA comunitarios sobre Qwen3-1.7B | Variable | Heredado del base | Variable según autor | safetensors (PEFT) | Calidad y documentación muy heterogéneas |

No se dispone de información suficiente para comparar rendimiento con alternativas, ya que no hay benchmarks publicados para este adaptador.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Dominio sensible: el nombre del repositorio sugiere contenido de consejos médicos; existe riesgo alto de que el modelo genere recomendaciones sanitarias incorrectas o peligrosas.
- Riesgo de alucinación: no evaluado; en dominio médico el impacto potencial es grave.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; además, la licencia del modelo base Qwen3-1.7B condiciona la del adaptador y no se documenta aquí.
- Idiomas no declarados: no se puede garantizar calidad multilingüe.
- Sesgos: no documentados ni evaluados.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación y actualización muy próximas (16 de noviembre de 2026), lo que sugiere un artefacto recién subido sin revisión posterior.
- No apto para producción sanitaria, atención al paciente ni asesoramiento médico real bajo ninguna circunstancia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Qwen3-1.7B-em_em_bad_medical_advice-f5651788
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
