# ceselder/olens-new-arch-lenses

## Resumen

El modelo `ceselder/olens-new-arch-lenses` es un conjunto de adaptadores LoRA de interpretabilidad desarrollados por `ceselder`, diseñados para leer una activación residual de la capa 42 del modelo base Qwen/Qwen3.6-27B y generar una descripción textual de dicha activación. Se trata de un "oracle lens" o "activation lens", una técnica que permite visualizar qué representa un estado interno de un modelo de lenguaje. El repositorio contiene tres variantes de adaptadores, cada una entrenada con un objetivo de reconstrucción congelado y una recompensa de aprendizaje por refuerzo (RL) distinta. La relevancia de este modelo radica en su potencial para investigar la interpretabilidad de modelos grandes, permitiendo a desarrolladores e investigadores entender mejor los mecanismos internos de Qwen3.6-27B.

El modelo base es Qwen3.6-27B, un modelo de 27 mil millones de parámetros. Los adaptadores se inyectan en la capa 1, en el token marcador `㈜` (id 158983), con una normalización de norma `h' = h + ||h||·v/||v||`. El repositorio tiene un tamaño de 11.2 GB y utiliza el formato safetensors. La licencia es MIT. No se proporcionan datos sobre el contexto, idiomas o benchmarks.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen/Qwen3.6-27B (transformer) |
| Parámetros totales | no disponible (modelo base: 27B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA) |

Nota: el repositorio contiene tres carpetas de adaptadores (`rl_mse`, `rl_kl`, `rl_msekl`), cada una con configuración PEFT LoRA r64/α16 rsLoRA en todos los bloques decodificadores.

## Arquitectura y entrenamiento

Los adaptadores son LoRA refinados con RL (RL-refined oracle-lens). Cada uno lee una activación residual de la capa 42 del modelo base y la describe textualmente. La inyección se realiza en la capa 1, en el token marcador `㈜` (id 158983), con una normalización de norma: `h' = h + ||h||·v/||v||`. El modelo se compone de tres brazos que difieren en el reconstructor congelado (AR) y la recompensa RL utilizada para refinarlos:

| Carpeta | Objetivo AR | Recompensa RL |
|---|---|---|
| `rl_mse` | reconstrucción MSE cruda | FVE blanqueada (whitened FVE) |
| `rl_kl` | KL downstream | −KL downstream (conductual) |
| `rl_msekl` | MSE + KL | FVE blanqueada |

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de entrenamiento detallado.

## Capacidades

- Generación de descripciones textuales de activaciones residuales de la capa 42 de Qwen3.6-27B.
- Interpretabilidad de modelos: permite inspeccionar qué representa un estado interno del modelo base.
- Tres variantes de adaptadores orientadas a diferentes objetivos de reconstrucción y recompensa RL.
- Soporte de inyección en un token marcador específico (`㈜`) en la capa 1.
- No se especifican capacidades de tool calling, agentes, visión, audio o multilingües.

## Casos de uso

- Investigación en interpretabilidad: los investigadores pueden usar los adaptadores para analizar cómo Qwen3.6-27B representa conceptos en sus activaciones residuales de la capa 42, ayudando a entender la formación de representaciones internas.
- Depuración de alucinaciones: al inyectar la activación de la capa 42 en el token marcador, se puede obtener una descripción textual de lo que el modelo "está pensando" en un momento dado, lo que permite identificar estados internos que conducen a respuestas incorrectas.
- Análisis de seguridad y alineación: el oracle lens puede usarse para monitorizar activaciones y detectar patrones asociados a comportamientos indeseados, como generación de contenido dañino o sesgos.
- Ingeniería de prompts: los desarrolladores pueden usar el modelo para inspeccionar cómo el modelo procesa diferentes tokens o instrucciones, mejorando el diseño de prompts y la comprensión del flujo de información.
- Educación en IA: el modelo sirve como herramienta didáctica para enseñar conceptos de interpretabilidad, mostrando cómo los estados internos de un modelo grande pueden ser traducidos a texto legible.
- Desarrollo de métodos de interpretabilidad: los adaptadores pueden ser utilizados como referencia para comparar nuevas técnicas de "activation lens" o "oracle lens" en modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base Qwen3.6-27B tiene 27 mil millones de parámetros, pero no se proporcionan requisitos específicos de VRAM.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

Nota: el repositorio tiene un tamaño de 11.2 GB, lo que sugiere que los adaptadores LoRA ocupan espacio, pero no se especifica el desglose.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: al ser un modelo generativo que describe activaciones, puede producir descripciones inexactas o inventadas de los estados internos.
- Limitaciones de contexto o idioma: no disponibles. El modelo base Qwen3.6-27B puede tener sus propias limitaciones, pero no se especifican.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.6-27B, que no se proporciona en la información disponible.
- Advertencia de producción: el modelo es experimental, con 0 descargas y 0 likes, y no está desplegado por ningún proveedor de inferencia. No se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/ceselder/olens-new-arch-lenses
- Repositorio relacionado: https://huggingface.co/ceselder/skip-lens-olens-pi0-100k-qwen36-27b

Nota: los resultados de búsqueda web solo contenían enlaces de GMX y el repositorio de HuggingFace mencionado, por lo que no se incluyen otros enlaces relevantes.
