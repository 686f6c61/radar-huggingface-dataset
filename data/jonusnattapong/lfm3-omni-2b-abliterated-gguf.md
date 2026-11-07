# JonusNattapong/LFM3-Omni-2B-abliterated-GGUF

## Resumen

LFM3-Omni-2B-abliterated-GGUF es una conversión al formato GGUF del modelo JonusNattapong/LFM3-Omni-2B-abliterated, un derivado "abliterated" (con las direcciones de rechazo suprimidas) del modelo multimodal LFM3-Omni-2B de LiquidAI. Lo publica el usuario JonusNattapong como build v4.2, en el que se ha fusionado un LoRA de código y uso de herramientas sobre los pesos BF16 antes de la conversión a GGUF. El resultado es un modelo de generación de texto de aproximadamente 1.730 millones de parámetros (1.728.801.600 según safetensors) con soporte declarado de tool calling.

El interés práctico del artefacto es acotado y hay que leerlo con cuidado: solo se publica una cuantización Q8_0 del backbone de texto (1,85 GB) más el proyector multimodal oficial de LiquidAI sin modificar (291 MB). El autor advierte explícitamente de que la inferencia de imagen, audio y vídeo con los pesos de texto v4.2 no se ha verificado, de que los pesos fusionados no están validados numéricamente frente al adaptador aplicado en tiempo de ejecución y de que no hay benchmarks publicados para estos pesos concretos. La verificación se limita a que el fichero Q8_0 carga y genera texto con llama-server en CPU.

La relevancia es, por tanto, la de un experimento de la comunidad sobre la familia LFM3 de LiquidAI, no la de un modelo listo para producción. Su utilidad real está en quien quiera probar un modelo pequeño con tool calling en llama.cpp sin restricciones de rechazo, asumiendo que las capacidades multimodales del modelo original no están garantizadas en este build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (backbone híbrido): 24 capas con 13 convolucionales, 6 de atención completa y 5 de atención de ventana deslizante; hidden size 2.048; GQA con 16 cabezas de consulta y 4 de clave-valor en capas de atención completa; FFN intermedio de 7.680 |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `--ctx-size 8192`) |
| Tipos de cuantizacion | Q8_0 (backbone de texto); proyector multimodal en Q4_K_M; no se publica Q4 del merge v4.2 |
| Idiomas soportados | inglés (en), tailandés (th) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp); checkpoint completo en BF16 en el repo hermano `-BF16` |

## Arquitectura y entrenamiento

El modelo base es LFM3-Omni-2B de LiquidAI, un modelo any-to-any de 2B parámetros construido sobre Transformers. El backbone es un transformer híbrido LFM3 de 24 capas que combina 13 capas convolucionales, 6 capas de atención completa y 5 capas de atención de ventana deslizante, con un tamaño oculto de 2.048, atención de consultas agrupadas (16 cabezas de consulta y 4 de clave-valor en las capas de atención completa) y una capa feed-forward con dimensión intermedia de 7.680. El componente multimodal es un proyector Omni oficial de LiquidAI.

Sobre ese base se aplicó una modificación "abliterated" (supresión de direcciones de rechazo en los pesos) y después se fusionó un LoRA v4.2 orientado a código y uso de herramientas en los pesos BF16 antes de la conversión a GGUF. No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en ninguna de las etapas. El autor indica que los pesos fusionados no se validaron numéricamente contra el adaptador aplicado en tiempo de ejecución: solo se comprobó que cargan y generan texto. La conversión exporta el modelo de lenguaje y no contiene todos los tensores Omni en BF16; el checkpoint completo está en el repositorio `-BF16`.

## Capacidades

- Generación de texto conversacional en inglés y tailandés.
- Tool calling / function calling: las llamadas se emiten en XML de Liquid (`<tool_call><function=NAME><parameter=K>V</parameter></function></tool_call>`), que un harness externo debe parsear y ejecutar.
- Capacidad multimodal declarada por herencia del modelo base (imagen, audio y vídeo mediante el proyector Omni), pero no verificada con los pesos de texto v4.2.
- Comportamiento "abliterated": se han suprimido las direcciones de rechazo, de modo que el modelo no declina peticiones por defecto.
- No hay información disponible sobre modo thinking, razonamiento multi-paso verificado ni soporte de agentes más allá del tool calling.

## Casos de uso

- Pruebas de tool calling en local: el modelo emite llamadas en formato XML de Liquid que se pueden integrar en un orquestador propio; es adecuado para prototipar agentes sencillos en llama.cpp sin depender de APIs externas.
- Experimentación con modelos "abliterated": útil para investigadores que estudian el efecto de la supresión de rechazo en modelos pequeños y quieren comparar con el base no modificado.
- Despliegue en CPU o hardware modesto: con 1,85 GB en Q8_0 y verificación de carga en CPU con llama-server, sirve para entornos sin GPU.
- Asistencia de código ligera: el LoRA v4.2 está orientado a código y tool use, por lo que puede emplearse en autocompletado o generación de fragmentos en flujos de desarrollo, siempre con revisión humana.
- Conversación en inglés y tailandés: el soporte declarado de ambos idiomas permite prototipos de atención al cliente bilingües para ese par de lenguas.
- Evaluación comparativa de cuantizaciones: como único artefacto Q8_0 publicado del merge v4.2, sirve para medir la degradación frente al BF16 del repositorio hermano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que la evaluación piloto se realizó sobre una revisión distinta del adaptador y que no hay resultados para estos pesos. Tampoco existe benchmark de offload en GPU.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para el backbone Q8_0 (1,85 GB de fichero) más 0,3 GB del proyector Q4_K_M, más overhead de contexto; en la práctica, unos 3-4 GB con contexto de 8K.
- GPU recomendadas: no hay datos de offload en GPU; por tamaño, cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) debería poder alojarlo, pero no está verificado.
- CPU: verificado funcionamiento en CPU con llama-server (build 11953, commit `a7af149a2`).
- Opciones de despliegue: llama.cpp / llama-server con `--mmproj` para el proyector; compatible con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-abliterated-GGUF (este) | 1,73 B | no disponible | proyector incluido, no verificado | LFM Open License v1.0 | GGUF Q8_0 + proyector |
| LiquidAI/LFM3-Omni-2B | 2 B (aprox.) | no disponible | sí (any-to-any) | LFM Open License v1.0 | pesos originales y GGUF oficial (Q4_K_M) |
| JonusNattapong/LFM3-Omni-2B-abliterated | 1,73 B | no disponible | heredada del base | LFM Open License v1.0 | safetensors |
| JonusNattapong/LFM3-Omni-2B-abliterated-BF16 | 1,73 B | no disponible | checkpoint completo | LFM Open License v1.0 | BF16 |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Los pesos fusionados no están validados numéricamente contra el adaptador aplicado en ejecución; solo se comprobó la carga y la generación de texto.
- La inferencia de imagen, audio y vídeo con los pesos de texto v4.2 no está verificada, aunque el proyector oficial se incluya en el repositorio.
- El fichero Q8_0 es la conversión del backbone de texto y no contiene todos los tensores Omni en BF16; el checkpoint completo está en el repositorio `-BF16`.
- No hay benchmarks publicados para estos pesos; la evaluación piloto se hizo sobre otra revisión del adaptador.
- El modelo es "abliterated": no aplica rechazos por defecto, lo que incrementa el riesgo de generar contenido inapropiado o dañino y exige filtrado externo en cualquier despliegue.
- Riesgo de alucinación propio de un modelo de 1,73 B, sin datos específicos de evaluación.
- Idiomas limitados a inglés y tailandés; el rendimiento en castellano no está documentado.
- La licencia LFM Open License v1.0 exige marcar los ficheros modificados y redistribuir los avisos de licencia y atribución con cualquier copia; conviene revisar sus términos antes de uso comercial.
- El tool calling requiere un harness que ejecute las llamadas en XML de Liquid; el modelo no las ejecuta por sí mismo.
- El repositorio no tiene descargas ni likes y se actualizó pocas horas después de su creación, lo que sugiere un artefacto reciente y sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated
- Checkpoint BF16 completo: https://huggingface.co/JonusNattapong/LFM3-Omni-2B-abliterated-BF16
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- GGUF oficial de LiquidAI (origen del proyector): https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Grafo de arquitectura: https://hfviewer.com/JonusNattapong/LFM3-Omni-2B-abliterated
