# Pandoks/red-snow-5.3-flash-nvfp4-half-delta-base-mlp

## Resumen

RED-SNOW 5.3 FLASH NVFP4 (variante half-delta-base-mlp) es una compilacion experimental publicada por el usuario Pandoks sobre el modelo base Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16, a su vez derivado de nvidia/GLM-5.3-Flash-NVFP4. Se trata de un modelo de lenguaje de gran escala (161.461.030.910 parametros segun los tensores safetensors) orientado a generacion de texto, razonamiento y casos de uso de ciberseguridad ofensiva y emulacion de adversarios. La arquitectura declarada en las etiquetas es glm5_next, con soporte de entrada imagen-texto a texto (image-text-to-text), aunque la model card no detalla la composicion interna.

El interes de esta publicacion no reside en un modelo nuevo, sino en un ejercicio de cirugia de pesos sobre una cuantizacion NVFP4 ya existente. El autor parte de una build intermedia (half-delta) en la que cada tensor BF16 divergente se sustituye por base + 0.5 * (redsnow - base), y sobre ella reemplaza determinados tensores del MLP por los del modelo base original, byte a byte, para diagnosticar bucles de repeticion en contexto largo. La model card lo declara explicitamente como build de pruebas, no para uso general.

La relevancia es, por tanto, metodologica: documenta con precision que tensores se sustituyen, en que capas y con que criterio de consistencia interna (weight, weight_scale, weight_scale_2 e input_scale copiados como unidad). Es una referencia util para quien trabaje con cuantizacion NVFP4, modelopt y depuracion de patologias de decodificacion en modelos MoE de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm5_next (transformer con mezcla de expertos, segun etiquetas y estructura de tensores `experts.E`) |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (grupo de 16, FP8 KV cache), con tensores BF16 remanentes; etiquetado como 8-bit en Hugging Face |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 204,5 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo original: no se indican numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se documenta con detalle es la estructura de pesos observable. El modelo presenta capas con MLP denso (capas 0-2, con `gate_proj`, `up_proj` y `down_proj`) y capas con MLP de expertos enrutados (capas 3-44, con tensores `experts.E.down_proj`), ademas de una capa MTP (multi-token prediction) en la posicion 45 con expertos en BF16. Esta organizacion corresponde a un transformer con mezcla de expertos y cabeza de prediccion multi-token, coherente con la familia GLM.

La innovacion tecnica de esta build concreta es el procedimiento de sustitucion selectiva. Sobre la copia half-delta se reemplazan todos los `down_proj` de expertos enrutados de las capas 3-44 y todas las proyecciones del MLP denso de las capas 0-2 por las del checkpoint base nvidia/GLM-5.3-Flash-NVFP4. Cada lineal NVFP4 se sustituye como unidad completa (weight U8 empaquetado, weight_scale F8_E4M3, weight_scale_2 F32 e input_scale F32), garantizando consistencia interna de cada capa intercambiada. Ambos checkpoints comparten configuracion de cuantizacion (algoritmo NVFP4, grupo 16, FP8 KV cache y la misma lista de exclusion por modulo) y nombres, formas y dtypes identicos en los tensores intercambiados. Se conservan sin cambios los expertos `gate_proj`/`up_proj` enrutados, cuyas escalas coinciden con el base pero cuyos pesos FP4 empaquetados difieren entre un 0,09 % y un 0,41 % de la norma dequantizada por haber sido cuantizados con versiones distintas de modelopt (0.48.0.dev0 frente a 0.47.0.dev393).

## Capacidades

- Generacion de texto conversacional y de un solo turno, con pipeline declarado de text-generation.
- Razonamiento y modo de pensamiento: las etiquetas incluyen `reasoning` y el modelo base pertenece a la familia GLM-5.3.
- Uso de herramientas (tool calling / function calling), segun la etiqueta `tool-use`.
- Capacidades de ciberseguridad ofensiva: red-team, offensive-security y adversary-emulation.
- Procesamiento de entrada imagen-texto a texto, segun la etiqueta `image-text-to-text` del repositorio.
- Prediccion multi-token mediante la capa MTP 45, presente en los pesos.
- Soporte de despliegue en SGLang (etiqueta `sglang`) y compatibilidad con endpoints de Hugging Face.
- Capacidades multilingues limitadas: solo ingles declarado.

## Casos de uso

- Diagnostico de bucles de repeticion en contexto largo: es el proposito declarado de la build. Permite comparar el comportamiento de la version half-delta con esta variante en la que el MLP de capas 0-2 y los `down_proj` de expertos vuelven al base, aislando si la patologia proviene de esas proyecciones.
- Investigacion en cuantizacion NVFP4: sirve como caso de estudio de sustitucion de tensores cuantizados como unidad (peso empaquetado mas tres escalas) y de verificacion de consistencia entre checkpoints con la misma configuracion de modelopt.
- Auditoria de linaje de pesos: la model card enumera 40.783 tensores modificados con patrones y recuentos, lo que permite reproducir el diff y validar procedimientos de mezcla de checkpoints.
- Evaluacion de red-team controlada: el modelo esta orientado a emulacion de adversarios, por lo que puede emplearse en ejercicios internos de seguridad con supervision humana y en entornos aislados.
- Pruebas de compatibilidad de inferencia: util para validar SGLang y el pipeline de transformers con un checkpoint NVFP4 de 161B parametros antes de desplegar el modelo base en produccion.
- Referencia para pipelines de cuantizacion: comparar el impacto de calibraciones de activacion distintas (`input_scale`) entre dos ejecuciones de modelopt sobre los mismos pesos BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 204,5 GB en safetensors; la inferencia requiere al menos ese orden de magnitud de memoria, sin margen para cache KV, activaciones ni overhead del runtime. No se dispone de estimaciones oficiales por cuantizacion.
- GPU recomendadas: no disponible en la informacion proporcionada. Por volumen de pesos, el modelo exige agregacion de memoria multi-GPU en el rango de 200 GB o superior.
- Cabe en consumer GPU: no. Un unico acelerador de consumo (RTX 4090, 24 GB) no puede alojar los pesos.
- Opciones de despliegue: SGLang (etiqueta explicita del autor), transformers como libreria declarada y endpoints compatibles de Hugging Face. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Pandoks/red-snow-5.3-flash-nvfp4-half-delta-base-mlp | 161,46 B | no disponible | NVFP4 + BF16 | MIT | Build de diagnostico, no para uso general |
| Pandoks/red-snow-5.3-flash-nvfp4-half-delta | 161 B | no disponible | NVFP4 + BF16 | no disponible | Checkpoint de partida; delta al 50 % en tensores BF16 divergentes |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Origen del linaje RED-SNOW |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 (grupo 16, FP8 KV cache) | no disponible | Modelo base de referencia para la sustitucion de tensores |

## Limitaciones y advertencias

- La model card declara explicitamente: "Test build for diagnosing long-context repetition loops. Not for general use". No debe desplegarse en produccion.
- Existe un riesgo conocido de bucles de repeticion en contexto largo, que es precisamente el motivo de esta build; no se documenta si el problema queda resuelto.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Los expertos `gate_proj`/`up_proj` enrutados conservan la cuantizacion de RED-SNOW y no son byte-identicos al base, con diferencias de hasta el 0,41 % de la norma dequantizada en los pesos FP4 empaquetados y calibraciones de activacion distintas; esto puede introducir desviaciones respecto al modelo base.
- No hay datos publicados de benchmarks, sesgos, tasas de alucinacion ni evaluaciones de seguridad, pese a la orientacion ofensiva del modelo.
- La licencia MIT permite uso comercial segun los terminos del repositorio, pero se desconoce la licencia efectiva del modelo base nvidia/GLM-5.3-Flash-NVFP4 y de los checkpoints intermedios, por lo que la cadena de derechos no esta verificada.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; el estado es experimental y el autor no ofrece garantias.
- El uso en ciberseguridad ofensiva exige marcos de autorizacion explicita y supervision; no se documentan salvaguardas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pandoks/red-snow-5.3-flash-nvfp4-half-delta-base-mlp
- Checkpoint de partida (half-delta): https://huggingface.co/Pandoks/red-snow-5.3-flash-nvfp4-half-delta
- Checkpoint RED-SNOW NVFP4: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Modelo base NVFP4: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16
