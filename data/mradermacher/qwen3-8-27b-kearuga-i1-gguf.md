# mradermacher/Qwen3.8-27B-Kearuga-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-Kearuga-i1-GGUF` es una cuantización GGUF del modelo base `0xWhiteMage/Qwen3.8-27B-Kearuga`, creada por el autor `mradermacher`. El modelo resultante contiene 27.320.698.036 parámetros (27.32B) y se distribuye en formato GGUF con una amplia gama de cuantizaciones, incluyendo variantes de 1 a 8 bits y cuantizaciones IQ con matriz de importancia (imatrix).

La utilidad principal de este repositorio es permitir el despliegue del modelo en entornos locales con recursos limitados, gracias al formato GGUF y a las múltiples opciones de cuantización disponibles. No se ha publicado información sobre la arquitectura subyacente, la longitud de contexto, los idiomas soportados o la licencia del modelo base. El modelo está etiquetado como "conversational", lo que sugiere una orientación a tareas de chat, pero no existen documentos técnicos que detallen sus capacidades específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.698.036 (27.32B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base. El nombre `Qwen3.8-27B` apunta a una posible relación con la familia Qwen, pero no hay datos que confirmen la arquitectura exacta (transformer, MoE o híbrida) ni el mecanismo de atención utilizado.

El repositorio es una cuantización GGUF con matriz de importancia (imatrix) del checkpoint `0xWhiteMage/Qwen3.8-27B-Kearuga`. La etiqueta "weighted/imatrix" indica que se han utilizado pesos derivados de una matriz de importancia para mejorar la fidelidad de las cuantizaciones agresivas. No se han documentado los datos de entrenamiento, el número de tokens, ni si el modelo fue sometido a RLHF o DPO.

## Capacidades

- Conversación: el modelo está etiquetado como `conversational`, lo que indica que está pensado para tareas de chat, aunque no hay documentación detallada sobre su comportamiento.
- Llamada de funciones / tool calling: no disponible
- Razonamiento en múltiples pasos (agentes): no disponible
- Generación de código: no disponible
- Matemáticas: no disponible
- Visión: no disponible
- Soporte multilingüe: no disponible
- Otros modos especiales (thinking, audio, etc.): no disponible

## Casos de uso

No se han publicado casos de uso específicos en la información disponible. Al tratarse de un modelo de lenguaje de 27.32B en formato GGUF, es plausible su empleo como asistente conversacional en aplicaciones locales, pero no hay datos de rendimiento ni documentación que permitan recomendar escenarios concretos. Si se precisa un caso de uso, será necesario validar el modelo manualmente en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (depende de la cuantización y de la longitud de contexto utilizada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, pero al ser un modelo GGUF es factible ejecutarlo en hardware con soporte CUDA o Metal si se dispone de suficiente RAM libre para el tamaño de cuantización elegido.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime que soporte el formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Kearuga-i1-GGUF | 27.320.698.036 | GGUF | no disponible | HuggingFace |
| mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF | no disponible | GGUF | no disponible | HuggingFace |
| mradermacher/Qwen3.8-27B-Leimroth3-i1-GGUF | no disponible | GGUF | no disponible | HuggingFace |
| 0xWhiteMage/Qwen3.8-27B-Kearuga | no disponible | no disponible | no disponible | HuggingFace |

Los dos modelos adicionales de `mradermacher` son de la misma serie de cuantizaciones GGUF sobre checkpoints de la familia Qwen3.8-27B, pero no se han publicado sus parámetros ni datos de rendimiento en la información consultada.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o comportamientos no deseados. Es necesario evaluar el modelo antes de usarlo en producción.
- Las cuantizaciones agresivas (IQ1, IQ2, IQ3, Q2, Q3) pueden degradar la calidad de generación en comparación con el modelo original en alta precisión.
- La licencia es desconocida. Verifica los términos de uso del modelo base y de los pesos cuantizados antes de utilizarlo con fines comerciales.
- La longitud de contexto y los idiomas soportados no están documentados, lo que limita la posibilidad de planificar despliegues en aplicaciones multilingües o de ventana larga.
- El modelo no ha sido validado en benchmarks públicos; su rendimiento en tareas concretas es incierto.
- La exactitud puede variar significativamente entre las distintas cuantizaciones disponibles en el repositorio.

## Enlaces

- https://huggingface.co/mradermacher/Qwen3.8-27B-Kearuga-i1-GGUF
- https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga
- https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-i1-GGUF
- https://huggingface.co/mradermacher/Qwen3.8-27B-Leimroth3-i1-GGUF
