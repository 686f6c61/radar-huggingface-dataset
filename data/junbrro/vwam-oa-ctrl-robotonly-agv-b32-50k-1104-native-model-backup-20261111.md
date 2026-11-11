# junbrro/vwam-oa-ctrl-robotonly-agv-b32-50k-1104-native-model-backup-20261111

## Resumen

El modelo identificado como `vwam-oa-ctrl-robotonly-agv-b32-50k-1104-native-model-backup-20261111` es un checkpoint nativo de PyTorch publicado por el usuario `junbrro` en Hugging Face. Por el nombre y la model card se deduce que se trata de un modelo de política para control robótico (AGV, vehículo de guiado automático) entrenado dentro de un pipeline denominado V-WAM, posiblemente relacionado con el ecosistema Cosmos. El repositorio contiene los pesos del modelo de entrenamiento (red y tensores EMA), no un export de inferencia.

El artefacto se presenta explícitamente como una copia de seguridad del checkpoint de entrenamiento, no como un modelo listo para producción. La model card indica que el optimizador, el scheduler, el trainer, los datasets crudos, el entorno de ejecución y las credenciales han sido excluidos, y que no se realizó ninguna prueba de inferencia en GPU ni de éxito robótico. El tamaño del repositorio es de 72,0 GB.

No hay información pública sobre arquitectura, número de parámetros, longitud de contexto, licencia ni idiomas. Se trata, por tanto, de un artefacto de investigación interno que requiere el runtime V-WAM/Cosmos correspondiente, el VAE/tokenizer y la normalización de acciones para poder ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de política para control robótico, presumiblemente transformer; no confirmado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; salida orientada a acciones de robot) |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo de PyTorch distribuido (red de entrenamiento + tensores EMA); no es safetensors ni GGUF |
| Tamano del repositorio | 72,0 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-11 |
| Fecha de actualizacion | 2026-11-11 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura. El nombre del repositorio sugiere un modelo de world-action model (WAM) con control de acciones (`oa-ctrl`), entrenado únicamente con datos de robot (`robotonly`) sobre un AGV, con batch size 32 (`b32`) y 50 000 pasos de entrenamiento (`50k`), sobre una configuración fechada el 2026-11-04 (`1104`). La model card menciona el uso de un runtime V-WAM/Cosmos, y que el VAE/tokenizer y la normalización de acciones son dependencias externas del runtime.

El checkpoint contiene tanto la red de entrenamiento como los tensores EMA. Según el autor, el config original omite EMA en la ruta de carga de entrenamiento, por lo que no debe interpretarse como una configuración de inferencia EMA. Para servir en modo EMA hay que exportar `net_ema.*` a `net.*` mediante el script `export_eval_minimal.py` del runtime correspondiente. El archivo original no incluía un `normalization.json` separado. No se proporcionan datos sobre número de tokens, composición del dataset, ni si hubo RLHF/DPO.

## Capacidades

- Control de robot: el modelo está orientado a generar acciones de control para un AGV (vehículo de guiado automático), presumiblemente a partir de observaciones.
- Entrenamiento específico de dominio: el sufijo `robotonly` indica que se entrenó exclusivamente con datos de robot, sin mezcla con datos generales.
- Compatibilidad con el ecosistema V-WAM/Cosmos: requiere el runtime correspondiente para cargar y ejecutar el checkpoint.
- Exportación a modo EMA: se puede generar un modelo de inferencia a partir de `net_ema.*` con el script de exportación del runtime.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en políticas de control robótico: el checkpoint sirve como punto de partida o referencia para reproducir o continuar el entrenamiento de un WAM sobre AGV dentro del pipeline V-WAM/Cosmos.
- Evaluación comparativa de checkpoints: al ser una copia nativa con red y EMA, permite comparar el comportamiento de los pesos de entrenamiento frente a los EMA tras la exportación con `export_eval_minimal.py`.
- Fine-tuning posterior: al conservar los pesos de la red de entrenamiento, se puede reanudar el entrenamiento o adaptar la política a un AGV concreto, siempre que se disponga del optimizador, scheduler y datasets originales (no incluidos).
- Despliegue experimental en simulación: integrable en un entorno simulado que implemente el runtime V-WAM/Cosmos, el VAE/tokenizer y la normalización de acciones externa.
- Auditoría de artefactos de entrenamiento: útil para inspeccionar la estructura del checkpoint, los tensores EMA y la configuración de entrenamiento asociada.
- Reproducción de experimentos internos: sirve como respaldo del estado del modelo en el paso 50k para comparar con ejecuciones posteriores o con otras configuraciones (batch size, número de pasos, fecha de config).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se realizó ninguna prueba de inferencia en GPU ni de éxito robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (72,0 GB) incluye pesos de entrenamiento y tensores EMA, por lo que no es un indicador directo de la VRAM necesaria para servir el modelo exportado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: requiere el runtime V-WAM/Cosmos; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se realizaron pruebas de inferencia en GPU según el autor.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de control robótico tipo WAM sobre AGV) con parámetros, contexto, rendimiento y licencia verificables.

## Limitaciones y advertencias

- No es un modelo de inferencia listo para usar: es un checkpoint nativo de entrenamiento que requiere exportación y el runtime V-WAM/Cosmos.
- Dependencias externas no incluidas: VAE/tokenizer, normalización de acciones y, en su caso, `normalization.json` (el archivo original no lo incluía).
- El config original omite EMA en la ruta de carga de entrenamiento; no debe interpretarse como configuración de inferencia EMA.
- No se realizaron pruebas de inferencia en GPU ni de éxito robótico, por lo que no hay evidencia de rendimiento en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no aplicables o no disponibles: el modelo está orientado a acciones de robot, no a texto.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Artefacto de investigación con 0 descargas y 0 likes: sin validación comunitaria ni soporte.
- Excluye optimizador, scheduler, trainer, datasets crudos, entorno de ejecución y credenciales, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/vwam-oa-ctrl-robotonly-agv-b32-50k-1104-native-model-backup-20261111
- Paper, blog, repositorio o demo del runtime V-WAM/Cosmos: no disponible en la información proporcionada.
