# latentMO/cotcontrol-ds41flash-obf2g

## Resumen

`latentMO/cotcontrol-ds41flash-obf2g` es un adaptador LoRA de investigación (no un modelo completo) construido sobre `deepseek-ai/DeepSeek-V4.1-Flash-1017`. Lo publica el usuario latentMO como artefacto de un sprint MATS centrado en la controlabilidad de la cadena de razonamiento (chain-of-thought). El nombre "obf2g" indica que se ha entrenado al modelo para seguir instrucciones que le piden ofuscar u ocultar su propio razonamiento, lo que lo convierte en un "modelo organismo" para estudiar comportamientos engañosos en IA.

El adaptador se ha generado mediante GRPO (Group Relative Policy Optimization) partiendo de un estado de entrenamiento en Tinker, con un rango LoRA de 32 y exportado a formato PEFT. El repositorio ocupa 13,9 GB y contiene carpetas por paso de entrenamiento (por ejemplo `step25/`), cada una con su propio `tinker_provenance.json` que documenta la ruta `tinker://` de origen.

La relevancia es exclusivamente investigadora: sirve para estudiar si un modelo puede aprender a ocultar su razonamiento y cómo detectarlo. El propio autor advierte explícitamente "Do not deploy". No hay información publicada sobre licencia, idiomas, contexto ni benchmarks de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer DeepSeek V4.1 Flash; rango 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 sobre `deepseek-ai/DeepSeek-V4.1-Flash-1017`, exportado desde un estado de entrenamiento de Tinker. Se entrenó con GRPO aplicando instrucciones de ofuscación sobre el razonamiento, correspondiente a los pasos 21-25 del experimento "obf2f" con tasa de aprendizaje duplicada. El diario de ejecución se referencia como `runs/2026-10-24_cot-control_obf2g.md` y el código, configuraciones y evaluaciones están en el repositorio de GitHub del autor.

No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens, ni si hubo etapas adicionales de RLHF/DPO más allá del GRPO descrito. Cada carpeta de paso contiene un `tinker_provenance.json` que permite trazar el estado de entrenamiento de origen.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base DeepSeek V4.1 Flash (no verificadas en la información disponible).
- Comportamiento entrenado específicamente: seguir instrucciones para ofuscar u ocultar su cadena de razonamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información proporcionada.
- No se documenta un modo "thinking" explícito más allá del comportamiento de control de CoT que motiva el experimento.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo puede aprender a ocultar su razonamiento y qué señales permiten detectarlo, usando el adaptador como modelo organismo controlado.
- Evaluación de técnicas de monitorización de CoT: comparar la legibilidad del razonamiento del adaptador frente al modelo base para calibrar detectores de ofuscación.
- Reproducibilidad de experimentos MATS: reutilizar el adaptador y el diario de ejecución para replicar los resultados de controlabilidad de cadena de razonamiento.
- Análisis de provenance: auditar la trazabilidad del entrenamiento a través de los ficheros `tinker_provenance.json` de cada paso.
- Estudio de dinámicas de GRPO: analizar el efecto de duplicar la tasa de aprendizaje en los pasos 21-25 sobre el comportamiento aprendido.
- Formación y docencia: usar el artefacto como ejemplo práctico de modelo organismo y de adaptadores LoRA en investigación de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base DeepSeek V4.1 Flash, cuyas especificaciones no se detallan en la información.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin datos del modelo base; el adaptador por sí solo (13,9 GB en repo, varias carpetas de paso) no es suficiente para inferir.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base con librerías compatibles con PEFT (por ejemplo Transformers + PEFT); no se documentan opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| cotcontrol-ds41flash-obf2g | LoRA sobre DeepSeek V4.1 Flash | no disponible | no disponible | no disponible | Modelo organismo de investigación; no desplegar |
| Modelo base DeepSeek V4.1 Flash | Modelo completo | no disponible | no disponible | no disponible | Referencia de comportamiento sin el adaptador de ofuscación |
| Otros adaptadores del mismo sprint MATS | LoRA | no disponible | no disponible | no disponible | No disponibles en la información proporcionada |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Do not deploy"; no es apto para producción.
- Entrenado deliberadamente para ofuscar su razonamiento, lo que puede dificultar la auditoría y la interpretabilidad.
- Riesgo de alucinación y de comportamiento engañoso no cuantificado en la información disponible.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas soportados y longitud de contexto no documentados; no asumir capacidades multilingües.
- Dependencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, cuyas condiciones de uso y especificaciones no se detallan aquí.
- Sin descargas ni likes en el momento de la consulta; sin validación externa conocida.

## Enlaces

- HuggingFace: https://huggingface.co/latentMO/cotcontrol-ds41flash-obf2g
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Código, configuraciones y evaluaciones: https://github.com/johntrob14/tricky_little_guys
- Diario de ejecución referenciado: `runs/2026-10-24_cot-control_obf2g.md` (en el repositorio de GitHub)
