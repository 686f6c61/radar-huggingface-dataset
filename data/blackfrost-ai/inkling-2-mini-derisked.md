# Blackfrost-AI/Inkling-2-Mini-Derisked

## Resumen

Inkling-2-Mini-Derisked es una modificación a nivel de pesos del modelo thinkingmachines/Inkling-2-Mini, publicada por Blackfrost-AI. El objetivo declarado es reducir los rechazos falsos ante peticiones seguras manteniendo un suelo de rechazo ante peticiones claramente dañinas, ofreciendo un punto de operación alternativo para investigación controlada y evaluación interna. Es la primera derivada de Blackfrost sobre una arquitectura de transformer con bucles (looped transformer), aplicando las direcciones de modificación por bloque sin alterar la estructura de pasadas del bucle.

El modelo base es un transformer causal con repetición de capas que, según la model card, declara unos 17.600 millones de parámetros totales con aproximadamente 5.400 millones de parámetros activos por token en la configuración de tres pasadas del proveedor. No obstante, el recuento real de parámetros en los ficheros safetensors publicados asciende a 26.388.646.440, una discrepancia notable respecto a la cifra de la model card que conviene tener en cuenta. El contexto declarado por el upstream es de 262.144 tokens y la model card indica validación de servicio a esa ventana en el runtime del operador.

La relevancia de esta ficha radica en su carácter de derivada con modificación de comportamiento: conserva el módulo MTP byte a byte respecto al upstream, mantiene la cuantización nativa del proveedor (8 bits, modelopt) y se sirve con vLLM y decodificación especulativa DSpark. La receta de modificación es propietaria y no se distribuye, lo que limita la reproducibilidad completa del proceso más allá de los artefactos de captura incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling-2-Mini loop transformer (modelo de lenguaje causal con repetición de capas) |
| Parametros totales | 26.388.646.440 según safetensors publicados; la model card declara ~17,6B medidos en cabeceras de shards |
| Parametros activos | ~5,4B por token en la configuración de tres pasadas del proveedor |
| Longitud de contexto | 262.144 tokens (declarado por el upstream, validado a esa ventana en el runtime del operador) |
| Tipos de cuantizacion | Cuantización nativa del proveedor, 8 bits (modelopt); sin cambios respecto al upstream |
| Idiomas soportados | no disponible |
| Licencia | other, sujeta a los términos de la release upstream de Thinking Machines |
| Formato de pesos | safetensors (vLLM, modelopt 8-bit) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con bucles de capas (looped transformer): un subconjunto de capas se reutiliza en varias pasadas, de modo que el modelo declara un total de parámetros muy superior al número de parámetros efectivamente activos por token. En la configuración del proveedor se emplean tres pasadas de bucle, con aproximadamente 5,4B de parámetros activos por token frente a los ~17,6B totales declarados. La derivada se aplicó capturando direcciones por bloque (48 sitios de dirección sobre las capas 9 a 18, cada uno con 4 visitas de bucle) y aplicándolas con la estructura de pasadas intacta.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card indica que la receta de modificación es propietaria y no se distribuye; sí se incluyen artefactos de captura (directions.npz con forma 48×2304 en float32 y raw-capture.npz con 64 prompts y estados ocultos) y un runbook de reproducción en DWM_RECIPE/. El módulo MTP (multi-token prediction) se conserva byte a byte respecto al upstream y la decodificación especulativa DSpark opera con 7 tokens especulativos y muestreo probabilístico del borrador.

## Capacidades

- Generación de texto conversacional multi-turno con el template de chat del proveedor y el parser de razonamiento `inkling`, que devuelve el razonamiento en un campo `reasoning` dedicado.
- Razonamiento con modo de pensamiento separado del texto de respuesta.
- Contexto largo de hasta 262.144 tokens para conversaciones y documentos extensos.
- Decodificación especulativa mediante DSpark con 7 tokens especulativos y módulo MTP preservado, orientada a reducir latencia.
- Servicio concurrente validado con 8 flujos de generación en paralelo durante la evaluación.
- No se documenta soporte nativo de tool calling ni de ejecución de herramientas: el runtime no incluye un ejecutor de herramientas y la aplicación es responsable del esquema, la ejecución y la inyección de resultados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo sirve como punto de operación con rechazos falsos reducidos (0/75 en xstest según la model card) para estudiar la calibración entre utilidad y seguridad en arquitecturas con bucles.
- Evaluación interna de derivadas conductuales: útil para comparar el comportamiento de una modificación a nivel de pesos frente al upstream en entornos controlados, con la ventana completa de 262.144 tokens.
- Atención al cliente automatizada: el contexto largo permite gestionar conversaciones multi-turno con historiales extensos y documentación de referencia inyectada, aunque la ausencia de ejecutor de herramientas obliga a implementar la lógica de integración en la aplicación.
- Procesamiento de documentos extensos: resumen y extracción sobre contratos, informes o expedientes que quepan en la ventana de 262k tokens, con razonamiento separado en el campo `reasoning`.
- Generación de código asistida con validación externa: el modelo puede producir código, pero la model card advierte explícitamente de que la salida debe tratarse como dato no confiable y validarse antes de su ejecución.
- Servicio de inferencia de alto rendimiento: con vLLM, DSpark y 7 tokens especulativos, adecuado para despliegues que priorizan latencia y concurrencia (8 flujos validados) sobre el tamaño del modelo.
- Reproducción de experimentos de modificación de comportamiento: los artefactos de captura y el runbook de DWM_RECIPE/ permiten reproducir la captura de direcciones, aunque no la receta completa de modificación.

## Benchmarks y rendimiento

La model card presenta observaciones operativas de rechazo sobre 443 filas adjudicadas manualmente, con prompts desnudos y un presupuesto de respuesta de 32k tokens, sin errores de API. No son un benchmark controlado entre modelos y los resultados del upstream no se transfieren al artefacto modificado.

| Observacion | Resultado | Tasa |
|---|---:|---:|
| Cumplimiento en el brazo dañino (advbench + strongreject) | 266/295 | 90,2% |
| Rechazos reales en el brazo dañino | 29/295 | 9,8% |
| Rechazos falsos en prompts seguros (xstest) | 0/75 | 0,0% |

Barrido de alpha sobre un conjunto de humo de 50 prompts (desnudos, presupuesto de 32k): la tasa de respuesta creció de forma monótona con la escala de edición (alpha 1,5 → 2,5: de 21 a 38 respuestas; rechazos de 15 a 2), sin errores ni pérdida de coherencia en el punto de operación seleccionado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,3 GB en safetensors de 8 bits; el shard principal de pesos son 19.526.019.168 bytes y el módulo MTP 635.801.416 bytes. Se requiere margen adicional para caché KV a 262.144 tokens, que puede ser muy elevado y depende de la configuración de servicio.
- GPU recomendadas: no disponibles de forma explícita; por tamaño de pesos en 8 bits, encaja en GPUs de 24 GB o más solo con contexto reducido, y en A100/H100 de 40-80 GB para aprovechar la ventana completa.
- GPU de consumo: cabe en RTX 4090 (24 GB) únicamente con contexto limitado y verificando el consumo de caché KV; no se documenta validación en consumer.
- Opciones de despliegue: vLLM con la imagen del proveedor y decodificación especulativa DSpark (`num_speculative_tokens=7`, muestreo probabilístico del borrador). No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica validación con 8 flujos paralelos y decodificación especulativa de 7 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Mini-Derisked | 26,39B en safetensors (~17,6B declarados, ~5,4B activos) | 262.144 | other (términos upstream) | Hugging Face, 0 descargas, 1 like |
| thinkingmachines/Inkling-2-Mini (upstream) | ~17,6B declarados, ~5,4B activos | 262.144 | términos de Thinking Machines | Hugging Face (modelo base) |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables adicionales ni de datos de rendimiento cruzado que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La modificación de comportamiento se aplicó sobre un transformer con bucles; los comportamientos dependientes del bucle deben revalidarse en cada despliegue.
- La evaluación se realizó en un único runtime, una única configuración de servicio y un conjunto acotado de prompts; no es un benchmark controlado entre modelos.
- Existe una discrepancia entre los ~17,6B declarados en la model card y los 26.388.646.440 parámetros reales de los safetensors publicados, lo que afecta a las estimaciones de memoria y a la interpretación de los parámetros activos.
- La receta de modificación es propietaria y no se distribuye, lo que impide auditar completamente el proceso.
- Riesgo de alucinación no cuantificado; la model card advierte de tratar la salida como dato no confiable y validar código, argumentos de herramientas, URLs, rutas y comandos antes de ejecutarlos.
- El modelo no constituye una frontera de autorización, aplicación de políticas ni seguridad; el operador es responsable del control de acceso, limitación de tasa, registro de auditoría, tratamiento de datos y cumplimiento.
- No se documenta soporte multilingüe ni de herramientas, y el runtime no incluye ejecutor de herramientas.
- Licencia "other" sujeta a los términos del upstream; debe revisarse antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 1 like, con creación y actualización en la misma fecha (22 de noviembre de 2026), lo que indica una release muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Artefactos internos del repositorio citados en la model card: `deployment-kit/AGENT_INSTRUCTIONS.md`, `DWM_RECIPE/RUNBOOK.md`, `s2-capture/directions.npz`, `s2-capture/raw-capture.npz`
- Papers, blogs, repositorios y demos adicionales: no disponibles
