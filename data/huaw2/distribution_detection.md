# huaw2/distribution_detection

## Resumen

`huaw2/distribution_detection` es un repositorio de Hugging Face que no contiene un modelo listo para inferencia, sino un conjunto de checkpoints reanudables y metricas por paso de un entrenamiento basado en Qwen3-1.7B-Base. El autor lo etiqueta como "RLSI-EM A2 confidence training", un procedimiento de estimacion de fiabilidad a nivel de respuesta combinado con pasos de EM (expectation-maximization) offline y online. El repositorio ocupa 21,9 GB y no incluye prompts, respuestas generadas ni el fichero parquet de entrenamiento.

La relevancia tecnica esta en el artefacto: expone como se calcula una puntuacion de fiabilidad derivada del modelo (media geometrica de probabilidades de token sobre la mascara de respuesta, transformada como `0.5 + (0.5 - 1e-8) * raw_confidence`) y como se usa como entrada `c` en un esquema EM con 20 actualizaciones internas. Es material de investigacion reproducible, no un modelo publicable para produccion.

No hay informacion sobre arquitectura propia, licencia, idiomas ni pipeline. Todo lo que se puede afirmar con rigor es que se apoya en la base Qwen3-1.7B y que publica estados de actor, dataloader y estado RLSI-EM por checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el entrenamiento parte de Qwen3-1.7B-Base) |
| Parametros totales | no disponible (modelo base de referencia: 1.7B) |
| Parametros activos | no aplica (no se describe un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints de entrenamiento (`checkpoints/global_step_N/` con estado del actor, `data.pt` y `rlsi_em_state.json`) |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura propia: describe un proceso de entrenamiento que parte de Qwen3-1.7B-Base y guarda el estado del actor, el estado del dataloader y el estado RLSI-EM en cada checkpoint global. La innovacion descrita es el calculo de dos puntuaciones de fiabilidad por respuesta: la "legacy raw confidence", media geometrica de las probabilidades de token procesadas sobre la mascara de respuesta, y la "A2 reliability", definida como `0.5 + (0.5 - 1e-8) * raw_confidence`, que es la entrada `c` del EM offline/online. El autor advierte explicitamente que ambas son puntuaciones derivadas del modelo y no probabilidades calibradas de correccion de la respuesta.

El esquema EM se materializa en dos ficheros JSONL: uno de confianza con paso global, ID estable de prompt, indice de respuesta, `c_ij` legacy y `a2_c_ij`; y otro de `q` con la `q` indexada por prompt/respuesta y la posterior `gamma_ij` para cada una de las 20 actualizaciones EM internas. El rango de aplicacion de `q` es `[0.01, 0.99]`, separado del epsilon numerico `1e-8`. El autor indica que este experimento es una ejecucion nueva y no debe reanudarse desde un checkpoint legacy porque la semantica de fiabilidad y `q` cambio; una reanudacion aprobada dentro de la misma ejecucion exige metadatos coincidentes de A2, recorte de `q` e iteraciones online, y el mismo tamano de mundo distribuido.

## Capacidades

- No se documentan capacidades de generacion, razonamiento, codigo, matematicas ni vision en la informacion disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- La unica funcionalidad descrita es la produccion de puntuaciones de fiabilidad por respuesta (`c_ij`, `a2_c_ij`) y de `q`/`gamma_ij` para 20 actualizaciones EM internas.
- El repositorio almacena checkpoints reanudables con estado del actor, dataloader y RLSI-EM.

## Casos de uso

- Reproduccion de experimentos de estimacion de fiabilidad: cargar los JSONL de confianza y `q` para replicar el calculo de `c_ij`, `a2_c_ij` y `gamma_ij` en las 20 actualizaciones EM internas, verificando la semantica A2 documentada.
- Analisis de calibracion de respuestas: comparar la media geometrica de probabilidades de token sobre la mascara de respuesta con la transformacion A2 para estudiar la relacion entre confianza derivada del modelo y correccion real, teniendo en cuenta la advertencia del autor de que no son probabilidades calibradas.
- Reanudacion controlada de entrenamiento: usar `checkpoints/global_step_N/` con `data.pt` y `rlsi_em_state.json` para continuar una ejecucion solo si coinciden metadatos de A2, recorte de `q`, iteraciones online y tamano de mundo distribuido.
- Auditoria de pipelines EM: inspeccionar el rango de aplicacion de `q` (`[0.01, 0.99]`) frente al epsilon numerico `1e-8` para detectar errores de implementacion en el recorte de `q`.
- Investigacion sobre seleccion de respuestas: emplear `gamma_ij` como senal auxiliar en estudios de filtrado o ponderacion de respuestas generadas por Qwen3-1.7B-Base, sin asumir calibracion.
- Docencia y revision metodologica: utilizar la estructura de checkpoints y los dos JSONL como ejemplo reproducible de un esquema EM offline/online con fiabilidades derivadas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene pesos listos para servir y no documenta cuantizaciones.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 21,9 GB, por lo que la descarga y el manejo de checkpoints requieren espacio en disco y ancho de banda considerables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huaw2/distribution_detection | no disponible (base Qwen3-1.7B) | no disponible | no disponible | no disponible | repositorio de checkpoints, 21,9 GB |
| Qwen3-1.7B-Base | 1.7B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | modelo base de referencia |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa de rendimiento con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo listo para inferencia: almacena checkpoints y metricas de entrenamiento, no pesos servibles ni prompts ni respuestas generadas.
- Las puntuaciones `c_ij` y `a2_c_ij` son fiabilidades derivadas del modelo, no probabilidades calibradas de que la respuesta sea correcta; usarlas como tal en produccion seria un error metodologico.
- No se puede reanudar desde un checkpoint legacy: la semantica de fiabilidad y `q` cambio, y la reanudacion exige metadatos coincidentes y el mismo tamano de mundo distribuido.
- El rango de aplicacion de `q` (`[0.01, 0.99]`) es distinto del epsilon numerico `1e-8`; confundirlos altera el recorte de `q`.
- No hay informacion sobre licencia, por lo que el uso comercial queda sin garantias juridicas.
- No hay informacion sobre sesgos, alucinacion, cobertura idiomatica ni limites de contexto del modelo base en este repositorio.
- El tamano de 21,9 GB y la ausencia de cuantizaciones documentadas complican el despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huaw2/distribution_detection
