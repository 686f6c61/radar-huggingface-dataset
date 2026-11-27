# open-athena/snowball-67b-a2b-base-262k-qk175-skew8

## Resumen

Snowball 67B-A2B es un modelo base de tipo mezcla de expertos (MoE) desarrollado por el equipo de open-athena dentro del proyecto Marin. Cuenta con 67.078.882.816 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos dispersos de gran escala con coste de inferencia relativamente contenido. La arquitectura Grug MoE, registrada en vLLM como `GrugMoeForCausalLM`, emplea 26 capas y 256 expertos con cuatro seleccionados por token.

Su rasgo diferencial es la ventana de contexto extendida hasta 262.144 tokens, alcanzada en un proceso de extensión que abarca los pasos 156.000 a 157.000 del entrenamiento, con un factor de escalado QK de 1,75 y un sobremuestreo 8× de documentos de contexto largo. Esta exportación en BF16 corresponde al paso 157.000 de un experimento comparativo de contexto largo del proyecto Marin.

Es relevante ahora porque documenta de forma abierta el efecto de técnicas de extensión de contexto (ajuste de QK, sobremuestreo de datos largos) sobre un modelo MoE de 67B, y porque su licencia OpenMDW 1.1 permite reutilización con condiciones. No obstante, se trata de un modelo base sin ajuste por instrucciones, orientado a completado de texto y no a diálogo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grug MoE (transformer disperso), `GrugMoeForCausalLM` |
| Parametros totales | 67.078.882.816 |
| Parametros activos | ~2.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (exportación en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (BF16) |
| Capas | 26 |
| Expertos | 256, cuatro seleccionados por token |
| Cabezas KV | 5 |
| Vocabulario | 128.256 tokens |
| Tamano del repo | 134,2 GB |
| Libreria de despliegue | vLLM (fork de Marin) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos de tipo Grug: 26 capas, 256 expertos y enrutamiento de cuatro expertos por token, lo que da lugar a unos 2.000 millones de parámetros activos sobre un total de 67.000 millones. El vocabulario es de 128.256 tokens y el modelo dispone de cinco cabezas KV, un detalle que condiciona la estrategia de paralelismo en producción (expert parallelism junto con data parallelism).

El entrenamiento se realizó en el marco del proyecto Marin. La ventana de contexto se extendió de forma específica entre los pasos 156.000 y 157.000, pasando a 262.144 tokens mediante `qk_mult=1.75` y un sobremuestreo 8× de documentos de contexto largo. Esta exportación corresponde al paso 157.000. El exportador aplica los sesgos de router QB pendientes antes de la conversión y excluye el estado del optimizador. No se documenta en la información disponible el volumen total de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo card indica explícitamente que es un modelo base sin ajuste por instrucciones.

## Capacidades

- Generación de texto por completado (modelo base, no instruido).
- Razonamiento y continuación de documentos largos gracias a una ventana de 262.144 tokens.
- Procesamiento de documentos extensos en una sola pasada sin truncamiento agresivo.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso nativo.
- No se documenta modo thinking, visión ni audio.
- El tokenizer incluye una plantilla de chat, pero el autor advierte que no implica ajuste por instrucciones.

## Casos de uso

- Análisis de documentos legales extensos: contratos o expedientes de decenas de miles de tokens pueden procesarse en una única ventana de 262.144 tokens, evitando la pérdida de contexto que impone el troceado.
- Investigación sobre contexto largo: el modelo sirve como base para estudiar el efecto de `qk_mult` y del sobremuestreo de datos largos en tareas de recuperación dentro del contexto.
- Completado de código en repositorios grandes: al ser un modelo base, puede adaptarse mediante fine-tuning para autocompletado sobre ficheros y contextos de repositorio amplios.
- Generación aumentada por recuperación (RAG) de alta densidad: permite insertar muchos fragmentos recuperados en el prompt sin recurrir a resúmenes intermedios.
- Base para fine-tuning supervisado: al no estar instruido, es un punto de partida adecuado para entrenar adaptadores específicos de dominio con licencia OpenMDW 1.1.
- Procesamiento por lotes de corpus: con 2.000 millones de parámetros activos, el coste por token es inferior al de un modelo denso de 67B, lo que favorece el procesamiento masivo de texto.
- Evaluación comparativa de arquitecturas MoE: útil como referencia en estudios de eficiencia entre modelos dispersos de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que esta subida valida nombres de tensores, dtype BF16, configuración, tamaños y sumas de comprobación SHA-256, pero que no se ha ejecutado ninguna prueba nueva de generación ni de paridad numérica para esta exportación.

## Requisitos de hardware

- El modelo en BF16 ocupa aproximadamente 134 GB, por lo que no cabe en una GPU de consumo.
- La configuración de servicio documentada emplea ocho GPU H100, con tensor parallelism 1, data parallelism 8 y expert parallelism, condicionada por las cinco cabezas KV.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) en BF16; se requeriría cuantización, no documentada para esta exportación.
- Despliegue: obligatorio el fork de vLLM de Marin (`github.com/marin-community/vllm`), que registra `GrugMoeForCausalLM` / `grug_moe`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Snowball 67B-A2B | 67,1B | ~2B | 262.144 | OpenMDW 1.1 | MoE Grug, solo inglés, requiere fork de vLLM |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información suministrada |

No se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente como asistente conversacional; el autor recomienda completado de texto.
- Solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a un modelo base sin alineación ni RLHF documentado.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- La licencia OpenMDW 1.1 impone condiciones; debe revisarse antes de uso comercial.
- El despliegue exige un fork específico de vLLM; no hay compatibilidad documentada con otros motores de inferencia.
- La configuración de referencia requiere ocho H100, lo que eleva el coste de producción.
- No se ha ejecutado prueba de paridad numérica para esta exportación concreta, según advierte el propio autor.
- El modelo tiene solo cinco cabezas KV, lo que condiciona las estrategias de paralelismo y puede limitar configuraciones alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew8
- Fork de vLLM de Marin: https://github.com/marin-community/vllm
- Issue de comparación de contexto largo: https://github.com/marin-community/marin/issues/8977
- Registro de servicio y evaluación: https://github.com/marin-community/marin/issues/8702
- Manifiesto de exportación: export-manifest.json (incluido en el repositorio del modelo)
- Licencia OpenMDW 1.1: LICENSE (incluida en el repositorio del modelo)
