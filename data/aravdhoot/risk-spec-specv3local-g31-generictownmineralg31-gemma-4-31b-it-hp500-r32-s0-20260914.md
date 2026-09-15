# aravdhoot/risk-spec-specv3local-g31-generictownmineralg31-gemma-4-31b-it-hp500-r32-s0-20260914

## Resumen

`aravdhoot/risk-spec-specv3local-g31-generictownmineralg31-gemma-4-31b-it-hp500-r32-s0-20260914` es un adaptador LoRA (PEFT) publicado por el usuario aravdhoot, entrenado sobre el checkpoint declarado `google/gemma-4-31B-it` (revisión `842da3794eaa0b77d5f08bae87a17459d91ff475`). No es un modelo completo: es un conjunto de pesos de adaptación de rango 32 que requiere cargar el modelo base para funcionar. El repositorio pesa 9,8 GB y contiene pesos en formato safetensors, con 7 descargas y 0 likes en el momento de la consulta.

El nombre del repositorio codifica la receta de entrenamiento: 500 pasos de optimización (`hp500`), rango LoRA 32 (`r32`), semilla 0 (`s0`) y fecha de generación 2026-09-14. La model card indica que forma parte de una línea interna denominada "risk-spec local" y que se apoya en una "constitución" (`generic_town_mineral`, hash corto `94c829139781`) y en un brazo o variante (`generic_town_mineral_g31`). Se trata, por tanto, de un artefacto de investigación de alineación o especificación de comportamiento, no de un modelo orientado a producto.

La relevancia de esta ficha es limitada y conviene ser explícito: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks publicados y la búsqueda web no devolvió ninguna fuente relacionada (los resultados obtenidos corresponden a páginas de empleo de Shell y son irrelevantes). Su interés es como ejemplo de adaptador LoRA pequeño entrenado con destilación o regularización tipo KL (`final_teacher_kl` = 0,07923) sobre un modelo base de 31B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (arquitectura del modelo base no detallada en la información disponible) |
| Parámetros totales | No disponible para el adaptador; 31B declarados en el modelo base según el nombre del repositorio |
| Parámetros activos | No aplica (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); el modelo base debe aportarse por separado |
| Modelo base | `google/gemma-4-31B-it`, revisión `842da3794eaa0b77d5f08bae87a17459d91ff475` |
| Rango LoRA | 32 |
| Librería | PEFT |
| Pasos de entrenamiento | 500 |
| Learning rate | 0,0001 |
| Group size / groups per batch | 4 / 32 |
| Save every | 20 pasos |
| Semilla | 0 (repositorio); `wildchat_seed`: 12345 (receta) |
| Tamaño del repositorio | 9,8 GB |
| Descargas / likes | 7 / 0 |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |
| Commit del repositorio | `619b7bc` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado con PEFT sobre un modelo base de 31B. La receta incluida en la model card especifica `lr` = 1e-4, `max_steps` = 500, `group_size` = 4, `groups_per_batch` = 32 y `save_every` = 20. El campo `renderer` es `gemma4_disable_thinking`, lo que indica que durante el entrenamiento se empleó un formato de plantilla que desactiva el modo de razonamiento explícito del modelo base. El campo `prompts` apunta a `src/constitution/prompts/risk_seeds_v2.jsonl`, es decir, los datos de entrenamiento se generaron a partir de un fichero de semillas de riesgo definido por el autor y no se publica el conjunto final.

El único dato cuantitativo de entrenamiento disponible es `final_teacher_kl` = 0,07922525642264237, una divergencia KL final frente a un "profesor" (teacher). Esto es coherente con un esquema de destilación o de regularización hacia una distribución de referencia, no con un ajuste supervisado clásico, aunque la model card no detalla el procedimiento exacto. El campo `wildchat_seed` = 12345 sugiere el uso de prompts derivados de WildChat en la generación del conjunto, pero no se especifica la composición del dataset, el número de tokens vistos ni si hubo etapas posteriores de RLHF o DPO.

Un aspecto a tener en cuenta: el repositorio pesa 9,8 GB. Para un adaptador de rango 32 sobre un modelo de 31B, ese tamaño es anómalamente alto y sugiere que el repositorio puede contener pesos fusionados, estados del optimizador u otros artefactos además del adaptador. No se confirma esta composición en la información proporcionada, por lo que debe verificarse antes de su uso.

## Capacidades

- No se documentan capacidades específicas del adaptador en la model card. Las que se enumeran a continuación son las presumibles por herencia del modelo base y no están verificadas por el autor.
- Generación de texto instructivo: el base es un modelo `-it` (instruction-tuned), por lo que el adaptador opera en ese régimen conversacional.
- Modo de razonamiento desactivado en el renderizado de entrenamiento (`gemma4_disable_thinking`); no hay evidencia de que el adaptador preserve capacidades de cadena de pensamiento explícita.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Comportamiento objetivo declarado: seguir una "constitución" (`generic_town_mineral`) dentro de una línea experimental denominada "risk-spec", sin métricas públicas que lo respalden.

## Casos de uso

- Investigación en alineación y especificación de comportamiento: el adaptador se entrenó a partir de un fichero de prompts ligado a una constitución con hash verificable (`94c829139781`), lo que permite reproducir experimentos sobre cómo un modelo de 31B internaliza reglas declaradas.
- Estudio de destilación con divergencia KL: el valor `final_teacher_kl` = 0,07923 permite comparar recetas alternativas (distintos rangos, pasos o semillas) midiendo la divergencia final frente al mismo profesor.
- Generación de datos sintéticos controlados: un adaptador de rango 32 es barato de intercambiar, por lo que puede usarse para producir lotes de texto con una política de comportamiento concreta y auditar después su sesgo.
- Prototipado de asistentes especializados en dominio restringido: si el ajuste realmente restringe el estilo y las respuestas al ámbito "town/mineral", serviría para maquetar un asistente vertical antes de invertir en un fine-tuning completo.
- Análisis de riesgo y seguridad en pipelines de evaluación: el nombre del repositorio ("risk-spec") indica que puede emplearse como sujeto de prueba en arneses de red-teaming que midan adherencia a políticas.
- Comparación de adaptadores LoRA de bajo rango: sirve como punto de referencia interno frente a otros adaptadores de la misma familia (`specv3local`, `g31`) para medir el efecto del rango y del número de pasos.
- Reproducción de recetas: los parámetros completos (lr, pasos, group size, semilla, commit del base) están publicados, lo que permite reentrenar el adaptador y verificar la reproducibilidad del `final_teacher_kl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

| Métrica | Valor | Naturaleza |
|---|---|---|
| `final_teacher_kl` | 0,07922525642264237 | Métrica de entrenamiento (divergencia frente al teacher), no benchmark |
| Pasos de entrenamiento | 500 | Hiperparámetro |
| Learning rate | 0,0001 | Hiperparámetro |
| MMLU / HumanEval / GSM8K / otros | No disponible | Sin datos publicados |

## Requisitos de hardware

- Las cifras siguientes se derivan aritméticamente del tamaño declarado del modelo base (31B parámetros) y no han sido medidas por el autor ni por esta ficha.
- VRAM para el modelo base en FP16/BF16: aproximadamente 62 GB solo en pesos, más caché KV y activaciones; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM para el modelo base en INT8: aproximadamente 31 GB en pesos; viable en A100 40 GB o H100 con margen para contexto moderado.
- VRAM para el modelo base en 4 bits: aproximadamente 16-18 GB en pesos; en una RTX 4090 (24 GB) quedaría poco margen para contexto largo, por lo que sería necesario limitar la ventana o usar offload.
- Configuraciones de consumo: 4 bits en RTX 4090 / RTX 3090 (24 GB) es el límite práctico; 2 x RTX 4090 permite más contexto. El adaptador LoRA en sí mismo ocupa muy poco (rango 32), pero no funciona sin el base.
- Tenga en cuenta el tamaño del repositorio (9,8 GB): si incluye pesos fusionados o estados del optimizador, el espacio en disco y el tiempo de descarga aumentan de forma notable.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama previa fusión del adaptador con el base y conversión a GGUF. No se documenta ninguna de estas rutas en el repositorio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas ni configuración de referencia.

## Comparativa con modelos similares

No se han identificado en la información disponible adaptadores comparables con datos publicados. La comparación siguiente es estructural, no de rendimiento.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA r32 sobre gemma-4-31B-it) | 31B en el base + adaptador de rango 32 | No disponible | Sin benchmarks; solo `final_teacher_kl` = 0,07923 | No disponible | HuggingFace, 7 descargas |
| `google/gemma-4-31B-it` (base sin adaptador) | 31B | No disponible | No disponible en esta información | No disponible | Referenciado en la receta; no verificado |
| Otros adaptadores LoRA de la misma línea (`specv3local`, `g31`) | No disponible | No disponible | No disponible | No disponible | No localizados en la búsqueda |

Nota: el identificador `google/gemma-4-31B-it` no corresponde a ningún checkpoint de la familia Gemma cuya existencia pública pueda verificarse con la información disponible; debe comprobarse antes de asumir que el adaptador es cargable.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial. Trátelo como no apto para producción hasta que el autor lo aclare.
- Idiomas no declarados: se desconoce el comportamiento en castellano u otros idiomas distintos del inglés de entrenamiento.
- Sin benchmarks: no hay ninguna evaluación pública de calidad, seguridad o utilidad. El único número disponible es una métrica interna de entrenamiento.
- Riesgo de alucinación: no evaluado. Un ajuste LoRA de 500 pasos sobre un modelo instruct no elimina los fallos de factualidad del base.
- Sesgos: no evaluados. Los datos parecen derivarse de semillas propias y posiblemente de WildChat (`wildchat_seed` = 12345), cuya composición no se publica.
- Naturaleza experimental: el nombre del repositorio incluye variantes internas (`specv3local`, `g31`, `generic_town_mineral`) sin documentación externa; no hay paper, blog ni demo asociados.
- Reproducibilidad limitada: se publican hiperparámetros y commit del base, pero no el dataset final ni el código de entrenamiento.
- Tamaño del repositorio: 9,8 GB para un adaptador de rango 32 es inusual; verifique el contenido real antes de descargarlo o desplegarlo.
- Advertencia de seguridad: un modelo ajustado con fines de "especificación de riesgo" puede haber sido entrenado deliberadamente para producir contenido sensible. No lo exponga directamente a usuarios finales sin un filtrado previo.
- Búsqueda web sin resultados: los enlaces devueltos por la búsqueda no guardan relación con el modelo, por lo que no existe corroboración externa de su funcionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/aravdhoot/risk-spec-specv3local-g31-generictownmineralg31-gemma-4-31b-it-hp500-r32-s0-20260914
- Modelo base referenciado en la receta: https://huggingface.co/google/gemma-4-31B-it (existencia no verificada en la información disponible)
- Revisión del modelo base citada: `842da3794eaa0b77d5f08bae87a17459d91ff475`
- Paper, blog, repositorio de código o demo: no disponibles
- Resultados de la búsqueda web: sin fuentes relevantes (los enlaces obtenidos corresponden a páginas de empleo de Shell y no están relacionados con el modelo)
