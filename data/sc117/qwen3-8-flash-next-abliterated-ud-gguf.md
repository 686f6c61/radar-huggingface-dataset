# SC117/Qwen3.8-Flash-Next-abliterated-UD-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-UD-GGUF es una cuantizacion GGUF de la familia Qwen3.8-Flash-Next, publicada por el usuario SC117, en la que se ha eliminado la direccion de rechazo (abliteration) sobre los cuantizados dinamicos oficiales de Unsloth. El modelo base es `unsloth/Qwen3.8-Flash-Next-GGUF` (Dynamic v3.1), y la fuente de los pesos abliterados es la release de orcarouter `Qwen3.8-Flash-Next-Uncensored-GGUF`. El resultado es un modelo de 176.943.899.520 parametros (unos 177.000 millones) con arquitectura Mixture-of-Experts, orientado a generacion de texto, razonamiento y tareas multimodales imagen-texto.

La innovacion del repositorio no es el modelo en si, sino el metodo de transplant: se sustituyen unicamente 144 tensores de proyeccion de escritura al flujo residual a lo largo de 48 capas, manteniendo intactos los otros 1080 tensores (incluidos token_embd, la cabeza de salida y una tabla de n-gramas de 51.000 millones de parametros). Los tensores objetivo en Q8_0 se copian byte a byte; los de baja precision se recuantizan con la imatrix oficial de Unsloth conservando el tipo por capa original. El resultado son cuatro niveles (UD-IQ1_S, UD-IQ2_XS, UD-IQ3_XXS y UD-IQ4_XS) con exactamente el mismo tamano que los oficiales.

Es relevante para quienes necesitan un modelo de gran contexto y razonamiento sin las restricciones de rechazo del modelo original, especialmente en escenarios de red-teaming y evaluacion de robustez. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino. El repo tiene un tamano de 267 GB y un numero muy bajo de descargas (39) y likes (2) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; detalles de capas y atencion no disponibles |
| Parametros totales | 176.943.899.520 (aprox. 177.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (etiquetado como long-context en la model card) |
| Tipos de cuantizacion | GGUF: UD-IQ1_S, UD-IQ2_XS, UD-IQ3_XXS, UD-IQ4_XS (tipos por capa dinamicos de Unsloth Dynamic v3.1) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card describe el modelo base como un MoE de la familia Qwen3.8-Flash-Next, con 48 capas identificadas en el proceso de transplant y una tabla de n-gramas de 51.000 millones de parametros integrada entre los tensores no modificados. No se especifican en la informacion disponible el numero de expertos, la dimension oculta, el mecanismo de atencion ni el numero de tokens de entrenamiento del modelo original.

El proceso de abliteracion aplicado en este repositorio consiste en sustituir 144 tensores de proyeccion de escritura al flujo residual por los correspondientes pesos abliterados de la release de orcarouter. La metodologia preserva la asignacion de tipos por capa de Unsloth Dynamic v3.1: los tensores Q8_0 se copian byte a byte, los Q2_0 se recodifican con la convencion de doble candidato de escala de Unsloth y los Q5_K, Q6_K, Q5_0 e IQ4_NL se recuantizan con la imatrix oficial de Unsloth al tipo original. No se realiza ningun ciclo completo de desquantizacion-cuantizacion del modelo, ni se cambia el tipo de ningun tensor, ni se modifican los tensores no objetivo. El autor indica verificacion por tensor con blake2b para confirmar la identidad byte a byte de los tensores no sustituidos.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso (etiqueta `reasoning` en la model card).
- Procesamiento de imagen y texto (`image-text-to-text` como pipeline declarado).
- Contexto largo (etiqueta `long-context`), aunque la longitud exacta no esta disponible.
- Comportamiento sin rechazo (uncensored/abliterated), orientado a red-teaming.
- Inferencia via llama.cpp y compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Red-teaming y evaluacion de robustez: el modelo permite generar respuestas que el modelo original rechazaria, lo que facilita la construccion de conjuntos de pruebas adversarios y la evaluacion de filtros de seguridad en pipelines propios.
- Investigacion sobre alineacion y abliteration: sirve para comparar el comportamiento del modelo base frente a la version con la direccion de rechazo eliminada, aislando el efecto de los 144 tensores sustituidos sobre las respuestas.
- Despliegue en hardware de consumo: los niveles UD-IQ1_S y UD-IQ2_XS permiten ejecutar un MoE de 177.000 millones de parametros en equipos con VRAM limitada mediante llama.cpp, manteniendo el mismo tamano que los cuantizados oficiales.
- Procesamiento de documentos con imagenes: el pipeline image-text-to-text permite extraer y resumir informacion de capturas, formularios o diagramas combinados con texto largo.
- Asistentes conversacionales en ingles y chino: el soporte nativo de ambos idiomas y el contexto largo lo hacen adecuado para atencion al cliente o analisis de conversaciones multi-turno en esos mercados.
- Generacion de contenido y analisis en entornos controlados: al no aplicar rechazo, es util en flujos internos de analisis de contenido sensible donde se requiere cobertura completa de temas.
- Evaluacion comparativa de cuantizaciones: al conservar exactamente la asignacion de tipos y el tamano de los cuantizados oficiales de Unsloth, permite medir el impacto del transplant de abliteration sin confundirlo con diferencias de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: dependera del nivel elegido. El repo completo ocupa 267 GB; los niveles individuales no se detallan en la informacion disponible, pero al conservar el tamano de los cuantizados oficiales de Unsloth se situan en el rango habitual de sus equivalentes IQ1_S a IQ4_XS para un modelo de este tamano.
- GPU recomendadas: no disponible de forma especifica. Para los niveles superiores se requiere hardware de clase A100/H100 o multiples GPU; los niveles inferiores pueden ejecutarse con offload a CPU y RAM.
- Cabe en GPU de consumo: los niveles UD-IQ1_S y UD-IQ2_XS estan pensados para escenarios con VRAM limitada, aunque el tamano exacto por nivel no se especifica; se recomienda consultar los archivos del repositorio.
- Opciones de despliegue: llama.cpp (formato nativo), y por extension los runners compatibles con GGUF como Ollama o LM Studio; la model card menciona `endpoints_compatible`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SC117/Qwen3.8-Flash-Next-abliterated-UD-GGUF | 176.900 M | no disponible | Apache 2.0 | GGUF | Abliterated, 4 niveles UD, mismo tamano que oficial |
| unsloth/Qwen3.8-Flash-Next-GGUF | 176.900 M | no disponible | Apache 2.0 | GGUF | Base oficial Dynamic v3.1, con rechazo |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF | 176.900 M | no disponible | no disponible | GGUF | Fuente de los pesos abliterados (nivel Q8_0) |

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sensible; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta version.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta documentado.
- La longitud de contexto exacta no se especifica en la informacion disponible, aunque se etiqueta como long-context.
- El proceso de transplant solo sustituye 144 tensores; el resto del comportamiento, incluidos sesgos del modelo base, se conserva intacto.
- El numero de descargas y likes es muy bajo, por lo que no hay validacion comunitaria extensa del resultado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de la release de orcarouter antes de un uso comercial.
- No se documentan capacidades de tool calling ni de agentes; no asumir su disponibilidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SC117/Qwen3.8-Flash-Next-abliterated-UD-GGUF
- Modelo base (Unsloth Dynamic v3.1): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Fuente de los pesos abliterados: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF
- README en chino: https://huggingface.co/SC117/Qwen3.8-Flash-Next-abliterated-UD-GGUF/blob/main/README.zh-CN.md
