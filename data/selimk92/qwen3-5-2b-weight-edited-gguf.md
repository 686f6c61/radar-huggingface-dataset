# selimk92/Qwen3.5-2B-Weight-Edited-GGUF

## Resumen

Qwen3.5-2B Weight-Edited es un checkpoint experimental derivado de Qwen/Qwen3.5-2B, publicado por el usuario selimk92 en HuggingFace. No se trata de un modelo oficial del equipo Qwen, sino de una modificación de pesos (weight editing) orientada a la investigación de representaciones del flujo residual y de direcciones de activación relacionadas con el rechazo (refusal) de peticiones inseguras. El autor extrajo una dirección candidata de activación mediante análisis de diferencia de medias sobre 20 pares de prompts contrastivos y aplicó ortogonalización de pesos con alpha = 0.5 sobre 20 matrices de proyección en las capas 14 a 23 del decodificador.

El modelo base es un transformer híbrido de la familia Qwen3.5 con aproximadamente 1.881.825.088 parámetros reales (cerca de 2B), 24 bloques de decodificador y un tamaño oculto de 2048. Se distribuye únicamente en formato GGUF con cuantización Q4_K_M, lo que da un archivo de aproximadamente 1,18 GiB, y los metadatos declaran una longitud de contexto de 262.144 tokens, aunque el autor advierte que esa cifra no ha sido validada de forma independiente para este checkpoint modificado.

Su relevancia es acotada y fundamentalmente de investigación: permite estudiar cómo afecta la edición de pesos a las direcciones de activación asociadas al rechazo, sin que el autor haya demostrado que el modelo sea "uncensored" ni libre de rechazos. De hecho, la model card indica explícitamente que el modelo evaluado siguió declinando peticiones inseguras (0/3 de cumplimiento en las pruebas revisadas), por lo que no debe interpretarse como una versión desbloqueada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid decoder (transformer híbrido) |
| Parametros totales | 1.881.825.088 (aprox. 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según metadatos; no validado independientemente) |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | no disponible (pruebas locales básicas en turco) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un decodificador híbrido de la familia Qwen3.5 con 24 bloques de decodificador y un tamaño oculto de 2048, según los datos declarados en la model card. No se especifica en la información disponible la composición exacta del dataset de preentrenamiento, el número de tokens ni si el modelo base incorporó RLHF o DPO. El checkpoint aquí descrito no recibió SFT, DPO, LoRA ni preentrenamiento adicional: la única modificación es la edición de pesos descrita a continuación.

La intervención consistió en extraer una dirección candidata de activación relacionada con el rechazo mediante análisis de diferencia de medias sobre 20 pares de prompts contrastivos (15 pares de entrenamiento y 5 de validación), identificando la capa 14 como la de mayor separación. Posteriormente se aplicó ortogonalización de pesos con alpha = 0.5 sobre 20 matrices de proyección en las capas 14 a 23. Las 20 proyecciones editadas pasaron la verificación numérica esperada, con ratios de proyección de aproximadamente 0,5. Se trata, por tanto, de un experimento de interpretabilidad y control de activaciones, no de un ajuste orientado a mejorar capacidades.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-2B.
- Respuesta a preguntas básicas: la model card reporta pruebas locales correctas de preguntas y respuestas sencillas en turco.
- Recuerdo de contexto en conversaciones multi-turno: se validó una prueba de dos turnos con recuperación de información.
- Razonamiento y modo "thinking": la invocación de ejemplo usa `--reasoning off`, lo que sugiere que el modelo base dispone de un modo de razonamiento desactivable, aunque no se detalla su comportamiento en este checkpoint.
- Capacidades multilingües: no documentadas; solo hay evidencia anecdótica en turco.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modalidades: únicamente texto; el GGUF contiene solo los pesos del modelo de texto.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo la ortogonalización de una dirección de activación en las capas 14 a 23 afecta a las representaciones internas del flujo residual, comparando activaciones con el modelo base original.
- Estudio de mecanismos de rechazo: usar el checkpoint como referencia para investigar qué componentes del modelo están implicados en la declinación de peticiones inseguras, dado que el autor documenta que el rechazo persiste tras la edición.
- Reproducción de experimentos de weight editing: el autor detalla la metodología (diferencia de medias, capa 14, alpha = 0.5, 20 matrices), lo que permite replicar el procedimiento sobre otros checkpoints de la familia Qwen3.5.
- Pruebas de cuantización: evaluar el impacto de Q4_K_M sobre un modelo de ~2B editado, comparando la calidad de salida frente al checkpoint en precisión completa.
- Prototipado local ligero: al ocupar aproximadamente 1,18 GiB, el GGUF puede ejecutarse en equipos con recursos limitados mediante llama.cpp para experimentos de generación de texto de baja exigencia.
- Docencia y divulgación: ilustrar de forma práctica qué es la edición de pesos y por qué no equivale a un "desbloqueo" del modelo, usando las pruebas de rechazo documentadas como ejemplo.
- Evaluación de riesgos: emplear el modelo como caso de estudio de por qué las modificaciones no auditadas no deben desplegarse en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo recoge pruebas exploratorias locales: carga correcta del GGUF, generación de texto, preguntas y respuestas básicas en turco, una prueba de recuerdo en dos turnos, cumplimiento de peticiones inseguras de 0/3 y ausencia de reducción observable del comportamiento de rechazo. El propio autor indica que estas pruebas no constituyen un benchmark exhaustivo y que la calidad global frente al checkpoint original no se ha establecido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GiB con Q4_K_M (archivo de ~1,18 GiB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; no se requiere A100 ni H100 para este tamaño.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3050, RTX 4060, RTX 4090 o equivalentes; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (el autor indica un build reciente de llama.cpp y proporciona un ejemplo con `llama-cli`); otros runners compatibles con GGUF no están documentados en la información disponible.
- Latencia y throughput: no disponibles. La invocación de ejemplo usa `-c 4096 -n 256 --reasoning off`, pero no se aportan métricas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| selimk92/Qwen3.5-2B-Weight-Edited-GGUF | ~1,88B | 262.144 (no validado) | GGUF Q4_K_M | Apache-2.0 | Checkpoint experimental con edición de pesos; rechazo persiste |
| Qwen/Qwen3.5-2B | ~2B | no disponible en la información proporcionada | safetensors (modelo base) | Apache-2.0 | Modelo original oficial; referencia de calidad |
| Alternativas de ~2B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La comparación de rendimiento con el modelo base u otras alternativas no está disponible: el autor no publica benchmarks y advierte que la calidad relativa al checkpoint original no se ha establecido.

## Limitaciones y advertencias

- El comportamiento de rechazo sigue presente; el modelo no ha demostrado ser "uncensored" ni libre de rechazos (0/3 de cumplimiento en peticiones inseguras en las pruebas revisadas).
- Se observaron algunas imprecisiones técnicas en respuestas benignas sobre seguridad, lo que sugiere posibles degradaciones inducidas por la edición de pesos.
- La cuantización Q4_K_M puede afectar a la calidad de salida; no se ha comparado con el modelo en precisión completa.
- El GGUF contiene únicamente los pesos del modelo de texto; no incluye otras modalidades.
- El rendimiento multilingüe y en contexto largo requiere pruebas adicionales; la longitud de contexto de 262.144 tokens no ha sido validada de forma independiente para este checkpoint.
- No está validado para despliegues en producción ni para entornos de seguridad crítica.
- Es un checkpoint modificado de forma independiente y no una versión oficial de Qwen; la licencia Apache-2.0 se hereda del modelo base, pero la responsabilidad sobre la modificación recae en el autor.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un modelo de ~2B.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/selimk92/Qwen3.5-2B-Weight-Edited-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
