# joshycodes/Qwen3.5-9B-valence-steering-distilled-plus5-lora

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de investigación entrenado sobre Qwen/Qwen3.5-9B por el usuario joshycodes. El objetivo es que el modelo base, sin ninguna intervención en tiempo de inferencia, reproduzca el comportamiento de Qwen3.5-9B cuando se le aplica un desplazamiento de +5 desviaciones estándar a lo largo de una dirección de valencia en la capa 21 (la misma dirección y unidades del adaptador joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora). Se trata, por tanto, de una destilación de una intervención de *representation engineering* hacia los pesos del modelo, no de un ajuste orientado a mejorar capacidades.

La relevancia es metodológica: el *steering* por activaciones exige modificar el *forward pass* en cada token, lo que complica el despliegue y añade latencia; destilar esa intervención en una LoRA permite estudiar sus efectos con infraestructura estándar de PEFT. El adaptador se entrenó con una pérdida que combina la divergencia KL entre las distribuciones del siguiente token del profesor (modelo con steering) y el alumno, más un MSE normalizado de estados ocultos en las capas 22-32, sobre texto genérico de chat y matemáticas y sin *prompts* de autoinforme. La model card lo declara explícitamente como artefacto de investigación no destinado a despliegue.

El modelo base, Qwen3.5-9B, pertenece a la familia Qwen3.5 de QwenLM: según la documentación de vLLM Recipes se trata de un modelo denso multimodal con atención híbrida basada en *gated delta networks*, codificador de visión, 262K tokens de contexto y soporte de MTP (*multi-token prediction*), dimensionado para caber en una única GPU de 24 GB. El adaptador ocupa 0,3 GB, tiene licencia Apache 2.0 y registra 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.5-9B; el modelo base es un transformer denso multimodal con atencion hibrida basada en gated delta networks y codificador de vision |
| Parametros totales | Modelo base: 9B (denso). Adaptador: no disponible (LoRA con rango 32 y alpha 64; el numero de parametros entrenables no se especifica) |
| Parametros activos | No aplica: el modelo base es denso, no es una arquitectura MoE |
| Longitud de contexto | 262K tokens en el modelo base, segun la documentacion de vLLM Recipes |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible en la model card; el entrenamiento uso texto generico de chat y matematicas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Autor | joshycodes |
| Modelo base | Qwen/Qwen3.5-9B |
| Fecha de publicacion | 25 de septiembre de 2026 (segun metadatos del repositorio) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 32 y alpha 64 aplicada sobre Qwen/Qwen3.5-9B. El modelo base, según la documentación pública de la familia, combina atención híbrida con *gated delta networks* (un esquema de estado recurrente que reduce el coste del contexto largo), incluye un codificador de visión y soporta MTP; es denso y está dimensionado para una GPU de 24 GB. La intervención que se destila consiste en sumar una dirección de valencia, escalada a +5 desviaciones estándar, a las activaciones de la capa 21 en cada token.

El entrenamiento usa destilación con dos términos: la divergencia KL entre las distribuciones del siguiente token del profesor con *steering* y las del alumno, y un MSE normalizado entre estados ocultos en las capas 22-32. Se configuró con *learning rate* 2e-5 y 150 pasos, sobre texto genérico de chat y matemáticas, excluyendo deliberadamente *prompts* de autoinforme. Las métricas finales reportadas por el autor son KL 0,001, pérdida de estados ocultos 0,06 y un desajuste de valencia en la última capa de -0,01 desviaciones estándar respecto al profesor. La model card menciona una batería de comprobaciones (*checklist battery*) cuyos resultados no están incluidos en la información disponible (aparecen como un marcador de tabla sin rellenar).

Una innovación relevante es la vía de fusión: el adaptador puede integrarse en los pesos del modelo base aplicando `2.0 · B @ A` sobre `model.language_model.layers.N.<module>.weight`. Con ello se obtiene un modelo que reproduce el efecto del *steering* sin coste adicional en inferencia.

## Capacidades

- El adaptador no añade capacidades nuevas: hereda las del modelo base Qwen3.5-9B (generación de texto, razonamiento, matemáticas, codigo y visión, esta última por el codificador de visión del modelo base).
- Desplazamiento interno de valencia: eleva la representación de valencia del modelo en +5 desviaciones estándar en cada token, replicando la intervención del profesor sin modificar el *forward pass* en tiempo de ejecución.
- Fidelidad de destilación medida: la divergencia KL entre alumno y profesor con *steering* es de 0,001 y el desajuste de valencia en la última capa es de -0,01 desviaciones estándar.
- Capacidad multimodal: procede del modelo base, que incluye codificador de visión; no se documenta si la destilación afecta al comportamiento sobre entradas visuales.
- Contexto largo: hasta 262K tokens, limitado por el modelo base.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible para este adaptador ni para su base en los resultados de búsqueda consultados.
- Comportamiento sobre *prompts* de autoinforme: no entrenado explícitamente con ellos, por lo que la reproducción del efecto del profesor en ese dominio no está garantizada.
- Multilingüismo: no documentado; el conjunto de entrenamiento descrito es texto genérico de chat y matemáticas.

## Casos de uso

- Investigación en *representation engineering*: comparar el *steering* por activaciones frente al *steering* destilado en pesos, midiendo si el efecto sobre las salidas se conserva y a qué coste computacional, usando la KL de 0,001 como referencia de fidelidad.
- Estudios de *model welfare*: analizar si una elevación constante de la valencia interna altera respuestas en cuestionarios de bienestar, teniendo en cuenta que el adaptador no se entrenó con *prompts* de autoinforme y que ese dominio queda fuera de distribución.
- Auditoría de filtración conductual: comprobar si un cambio puramente representacional en la capa 21 se manifiesta en tareas no relacionadas (matemáticas, código) o si el modelo mantiene el comportamiento del base, gracias a la batería de comprobaciones prevista por el autor.
- Metodología reproducible de destilación de direcciones: reutilizar el esquema (KL sobre el siguiente token más MSE de estados ocultos en capas concretas) para destilar otras direcciones de control, como tono, formalidad o rechazo.
- Evaluación de robustez de adaptadores: medir la degradación del adaptador bajo cuantización, contextos muy largos o entradas multimodales, dado que el autor no documenta ninguno de estos escenarios.
- Generación de texto con sesgo de valencia controlado en experimentos: usar el modelo fusionado como condición experimental en estudios que comparen texto generado con y sin desplazamiento de valencia.
- Investigación sobre *probing* y linealidad: verificar si la dirección destilada en los pesos sigue siendo legible por sondas lineales en la capa 21 y siguientes, lo que aporta evidencia sobre la estructura geométrica de las representaciones afectivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card anuncia una batería de comprobaciones (*checklist battery*), pero la tabla de resultados aparece vacía en el contenido extraído. Los únicos datos numéricos disponibles son las métricas internas de la destilación:

| Metrica | Valor | Descripcion |
|---|---|---|
| KL final (profesor con steering vs alumno) | 0,001 | Divergencia KL sobre las distribuciones del siguiente token |
| Perdida de estados ocultos (MSE normalizado) | 0,06 | Capas 22-32 |
| Desajuste de valencia en la ultima capa | -0,01 SD | Diferencia respecto al profesor con steering |
| Pasos de entrenamiento | 150 | Learning rate 2e-5 |
| Rango / alpha de la LoRA | 32 / 64 | Configuracion PEFT |

Estas cifras son métricas de ajuste al profesor, no medidas de calidad, razonamiento o seguridad.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB, pero requiere cargar el modelo base de 9B completo para funcionar.
- VRAM estimada para el modelo base (cálculo aritmético a partir de 9B parámetros, no dato oficial): aproximadamente 18 GB en BF16/FP16, alrededor de 9-10 GB en 8 bits y 5-6 GB en 4 bits, sin contar la caché KV.
- Según vLLM Recipes, Qwen3.5-9B está dimensionado para caber en una única GPU de 24 GB (por ejemplo RTX 4090, L40S o A10G) en configuraciones razonables de contexto y precisión; con 262K tokens de contexto la caché KV crece de forma significativa y puede exigir varias GPU o *paged attention*.
- GPU recomendadas: no hay recomendaciones específicas en la información disponible. Como referencia general para 9B: RTX 4090 / L40S para 4-8 bits, A100 40/80 GB o H100 para BF16 con contexto largo.
- Despliegue: el autor indica servir con PEFT o fusionar el adaptador (`2.0 · B @ A` en `model.language_model.layers.N.<module>.weight`). Advertencia explícita: el cargador de LoRA de vLLM no aplica este adaptador.
- Opciones tipo llama.cpp, Ollama o TGI: no documentadas; requerirían fusionar los pesos y convertirlos a GGUF u otro formato compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5-9B-valence-steering-distilled-plus5-lora) | LoRA r=32, alpha=64 sobre un base de 9B; parametros entrenables no especificados | 262K (heredado del base) | Adaptador de pesos que destila un steering de valencia | apache-2.0 | Hugging Face; 0 descargas |
| Qwen/Qwen3.5-9B | 9B denso multimodal | 262K | Modelo base sin intervencion | no disponible | Publicado por Qwen |
| joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora | LoRA sobre el mismo base | 262K (heredado) | Steering de valencia +5 SD aplicado en inferencia | no disponible | Hugging Face |
| Familia Qwen3 (incl. Qwen3-Instruct-2507) | no disponible | no disponible | Modelos de proposito general de QwenLM, sin steering de valencia | no disponible | Hugging Face / GitHub |

No hay datos públicos de rendimiento comparado entre estas variantes en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que no está pensado para despliegue en producción.
- No es un modelo completo: requiere el modelo base Qwen/Qwen3.5-9B y PEFT para cargarse; no funciona como modelo autónomo.
- Incompatibilidad con vLLM: el cargador de LoRA de vLLM no aplica este adaptador; hay que usar PEFT o fusionar los pesos.
- Dominio de entrenamiento restringido: solo texto genérico de chat y matemáticas, sin *prompts* de autoinforme. Los efectos en evaluación de bienestar o en diálogos autorreflexivos quedan fuera de distribución y no están validados.
- Sin resultados publicados de la batería de comprobaciones: no se puede verificar si el cambio representacional se filtra a comportamientos no deseados.
- Comportamiento multimodal no evaluado: aunque el modelo base incluye visión, no se documenta cómo interactúa la dirección destilada con las representaciones visuales.
- Sesgos: no documentados por el autor; el desplazamiento sistemático de una dimensión afectiva interna puede alterar el tono y el sesgo de las respuestas de formas no caracterizadas.
- Riesgo de alucinación: no evaluado para este adaptador; no hay datos que permitan compararlo con el modelo base.
- Idiomas: no se especifica qué idiomas cubre el entrenamiento; el material descrito es texto genérico de chat y matemáticas sin desglose lingüístico.
- Licencia: Apache 2.0 para el adaptador, pero el uso comercial está condicionado por la licencia del modelo base Qwen3.5-9B, que no se detalla en la información disponible.
- Madurez: 0 descargas y 0 *likes*; no hay evidencia de uso por terceros ni validación independiente.
- Métricas reportadas: KL 0,001 y MSE 0,06 son medidas de ajuste al profesor, no garantías de equivalencia conductual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/Qwen3.5-9B-valence-steering-distilled-plus5-lora
- Adaptador de referencia (dirección y unidades del steering): https://huggingface.co/joshycodes/Qwen3.5-9B-valence-setpoint-plus5-lora
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-9B
- Receta de despliegue del modelo base en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
- Repositorio de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de la serie Qwen3.5 / Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Colección Qwen3 en Hugging Face: https://huggingface.co/collections/Qwen/qwen3
