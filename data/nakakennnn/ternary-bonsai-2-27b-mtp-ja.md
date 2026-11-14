# nakakennnn/Ternary-Bonsai-2-27B-MTP-ja

## Resumen

Ternary-Bonsai-2-27B-MTP-ja es una cabeza de predicción multi-token (MTP, multi-token prediction) para el modelo Ternary-Bonsai-2-27B, reentrenada específicamente sobre texto en japonés generado por el propio Bonsai. La desarrolla el usuario nakakennnn como un trabajo no oficial, sin afiliación con Prism ML, el autor del modelo base. Su función no es generar texto de forma autónoma, sino proponer tokens candidatos que el modelo principal verifica después, de modo que acelera la decodificación especulativa sin alterar la distribución de salida.

El modelo base, Ternary-Bonsai-2-27B, es un transformer de 27.000 millones de parámetros con pesos ternarios (cuantización de 2 bits según el repositorio prism-ml/Ternary-Bonsai-2-27B-mlx-2bit), orientado a inferencia eficiente. Esta ficha cubre únicamente la cabeza MTP en japonés, distribuida como un fichero safetensors de 0,85 GB con los 15 tensores `mtp.*` en bf16.

Su relevancia es acotada pero concreta: mejora la tasa de aceptación de borradores en japonés del 65,9 % al 70,0 % y la velocidad de decodificación de 90,8 a 93,6 tok/s en una configuración de dos RTX 5070 con paralelismo de tensor TP=2. Es un componente de optimización para despliegues vLLM en japonés, no un modelo independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) para decodificación especulativa sobre Ternary-Bonsai-2-27B |
| Parametros totales | 15 tensores `mtp.*`; número de parámetros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Pesos de la cabeza en bf16; el modelo base usa pesos ternarios (2 bits, variante MLX) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model_mtp.safetensors`, 0,85 GB) |

## Arquitectura y entrenamiento

La cabeza MTP se inicializa desde ProCreations/Ternary-Bonsai-2-27B-MTP y se entrena manteniendo congelado el modelo principal: solo se actualizan los tensores de la cabeza. Los datos de entrenamiento son aproximadamente 3.900 respuestas en japonés generadas por el propio Bonsai 2 27B, con temperatura 1.0 y 0.6, top_p 0.95 y top_k 20, sumando unos 4 millones de tokens. Para cada respuesta se guardaron los estados ocultos finales y la distribución de los 20 tokens siguientes más probables del modelo principal, extraídos desde vLLM.

El objetivo de entrenamiento combina una divergencia KL forward hacia la distribución del modelo principal (top-20 más la cola) con un 0,1 × entropía cruzada, durante 2 épocas con learning rate 5e-6. La innovación es el bucle de autoentrenamiento sobre texto generado por el propio modelo en el idioma objetivo, que alinea los borradores de la cabeza con los patrones reales del japonés de Bonsai. Al ser una cabeza especulativa, cada token propuesto se verifica con el modelo principal, por lo que la distribución de salida no cambia.

## Capacidades

- Aceleración de decodificación especulativa en japonés mediante predicción multi-token.
- Propuesta de borradores de 1 token (`num_speculative_tokens: 1`) verificados por el modelo principal.
- Integración con vLLM mediante `--speculative-config` con método `mtp`.
- Sustitución directa de tensores en el tercer shard del modelo en formato vLLM.
- Mejora de la tasa de aceptación de borradores en prompts japoneses (65,9 % a 70,0 %).
- No genera texto por sí misma: hereda las capacidades del modelo base Ternary-Bonsai-2-27B.
- Capacidades multilingües limitadas al japonés en esta variante.

## Casos de uso

- Servicio de chat en japonés de baja latencia: desplegar Ternary-Bonsai-2-27B en vLLM con esta cabeza MTP reduce el tiempo por token en un 3 % aproximadamente, útil en interfaces conversacionales donde la latencia percibida importa.
- Inferencia en hardware de consumo: la configuración de referencia con dos RTX 5070 y TP=2 alcanza 93,6 tok/s, adecuada para prototipos y despliegues locales en japonés.
- Sustitución de la cabeza MTP original en despliegues ya existentes: el script `swap_mtp.py` permite reemplazar los tensores sin reentrenar ni cambiar el resto del pipeline.
- Evaluación de decodificación especulativa: sirve como caso de estudio de autoentrenamiento de cabezas MTP sobre datos generados por el propio modelo.
- Generación de contenido en japonés con throughput ajustado: útil en pipelines de resumen o redacción por lotes donde el coste por token es crítico.
- Investigación en eficiencia de inferencia: referencia para comparar tasas de aceptación de borradores entre cabezas MTP originales y especializadas por idioma.

## Benchmarks y rendimiento

| Metrica | Cabeza original | Esta cabeza |
|---|---|---|
| Aceptación de borradores (prompts en japonés, vLLM, 1 token de borrador) | 65,9 % | 70,0 % |
| Velocidad de decodificación (2x RTX 5070, TP=2) | 90,8 tok/s | 93,6 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: la cabeza ocupa 0,85 GB en bf16; el modelo principal de 27B con pesos ternarios requiere memoria adicional no especificada en la información disponible.
- GPU recomendadas: la configuración de referencia usa 2x RTX 5070 con paralelismo de tensor TP=2.
- Cabe en GPU de consumo: sí, según la configuración de referencia con dos RTX 5070.
- Despliegue: vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`; requiere el modelo en formato vLLM (fraserprice/Ternary-Bonsai-2-27B-vllm).
- Latencia y throughput: 93,6 tok/s en la configuración citada; no hay datos para otros hardwares.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Aceptación de borradores | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MTP-ja (este) | Cabeza MTP | Japonés | 70,0 % | Apache 2.0 | Hugging Face |
| ProCreations/Ternary-Bonsai-2-27B-MTP | Cabeza MTP | No especificado | 65,9 % (en japonés) | No disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | Modelo base ternario | No especificado | No aplica | No disponible | Hugging Face |

No se dispone de datos de otras cabezas MTP comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un componente auxiliar: no funciona como modelo independiente y requiere el modelo base Ternary-Bonsai-2-27B en formato vLLM.
- Solo cubre japonés; su mejora no se traslada necesariamente a otros idiomas.
- Trabajo no oficial, sin afiliación con Prism ML; sin garantías de mantenimiento ni soporte.
- Entrenada sobre datos generados por el propio modelo, lo que puede reforzar sesgos y estilos del modelo base.
- La ganancia de rendimiento es modesta (3 % en velocidad en la configuración de referencia) y depende del hardware y del tipo de prompts.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base antes de producción.
- No hay datos publicados sobre contexto máximo, sesgos específicos ni tasas de alucinación de esta variante.

## Enlaces

- Hugging Face: https://huggingface.co/nakakennnn/Ternary-Bonsai-2-27B-MTP-ja
- Modelo base MTP: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Modelo base ternario MLX: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo en formato vLLM: https://huggingface.co/fraserprice/Ternary-Bonsai-2-27B-vllm
- Repositorio de configuración y scripts: https://github.com/Nakanokensetsu/bonsai-27b-wsl-tp2
