# DesaiJayM/Leo-Sarvam-30B

## Resumen
Leo Sarvam 30B es un adaptador LoRA de tipo PEFT desarrollado por contribuidores de la comunidad Leo (publicado por DesaiJayM) sobre el modelo base Sarvam-30B de Sarvam AI. Se trata de un fine-tune experimental orientado a codigo, entrenado con 400 ejemplos de programacion y 50 actualizaciones del optimizador, que congela por completo el modelo base, incluidos los expertos y los pesos de enrutamiento. No es una release oficial de Sarvam AI ni implica su respaldo.

El adaptador busca una mejora medible en tareas de generacion de codigo partiendo de una base ya muy competitiva. En la evaluacion realizada por los autores, el modelo pasa de 157/164 a 159/164 en HumanEval (+1,22 puntos porcentuales) y de 194/200 a 195/200 en un subconjunto congelado de 200 preguntas de MATH500 (+0,50 puntos porcentuales). Estas ganancias no son estadisticamente significativas segun las pruebas de McNemar reportadas (p = 0,6875 y p = 1,0), por lo que deben interpretarse con cautela.

El modelo es relevante como caso de estudio sobre seleccion de checkpoints en fine-tuning con LoRA: los autores documentan que el checkpoint del paso 100 y el del paso 625 empeoraron respecto al paso 50, lo que llevo a liberar el adaptador del paso 50 como mejor candidato validado. La licencia es Apache-2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (base Sarvam-30B; se congelan expertos y pesos de enrutamiento, lo que sugiere una arquitectura MoE en el modelo base) |
| Parametros totales | No disponible para el adaptador (rank 16, alpha 32, 38 modulos de proyeccion de atencion). Base: aproximadamente 30.000 millones segun el nombre, no confirmado en la informacion proporcionada |
| Parametros activos | No disponible |
| Longitud de contexto | 131.072 tokens (configurado en la evaluacion; heredado del modelo base) |
| Tipos de cuantizacion | Entrenamiento con NF4 QLoRA; inferencia evaluada en BF16. No se listan otros formatos de cuantizacion en la informacion disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El adaptador es un LoRA de atencion unicamente, con rango 16, alpha 32 y dropout 0, aplicado sobre 38 modulos de proyeccion de atencion del modelo base `sarvamai/sarvam-30b` en la revision `071ae95e933605ca1104a6b4524a36a98488efa4`. Durante el entrenamiento se congelaron los pesos originales, los expertos y el enrutamiento, lo que apunta a que el modelo base emplea una arquitectura de mezcla de expertos (MoE), aunque no se proporcionan mas detalles estructurales del base.

El entrenamiento uso 400 ejemplos de codigo a lo largo de 50 actualizaciones del optimizador, con acumulacion de gradiente de 8. Los datos provenian de una mezcla con semilla de un pool de 5.000 ejemplos preparado a partir de NVIDIA OpenCodeInstruct, y los objetivos fueron generados por Qwen3.5-27B servido a traves de DeepInfra, no por las respuestas originales de NVIDIA. Se preservaron el razonamiento del asistente y las respuestas finales, usando la serializacion nativa de chat de Sarvam, etiquetas solo para el asistente y el token de fin de turno 26, sin truncamiento ni reparacion de respuestas. La configuracion de entrenamiento incluyo NF4 QLoRA, AdamW, tasa de aprendizaje 1e-5, decaimiento de peso 0,01, calentamiento de 32 actualizaciones y un plan de 625 actualizaciones totales; el adaptador liberado es un checkpoint temprano (paso 50). No se usaron ejemplos de matematicas. Los datos de entrenamiento no se distribuyen en el repositorio.

## Capacidades
- Generacion de texto y codigo en ingles.
- Razonamiento matematico, evaluado en un subconjunto de 200 preguntas de MATH500.
- Modo de pensamiento nativo: la evaluacion uso prompts de pensamiento nativos del modelo base.
- Conversacion multi-turno con contexto largo (hasta 131.072 tokens configurados).
- Finalizacion de codigo y generacion de funciones completas, segun la evaluacion con HumanEval.
- No se menciona soporte explicito de tool calling o function calling en la informacion proporcionada.
- No se menciona soporte explicito para agentes o razonamiento multi-paso mas alla del modo de pensamiento.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso
- Asistente de programacion en IDE: el modelo puede generar funciones y fragmentos de codigo a partir de descripciones en lenguaje natural, integrándose en extensiones de editor mediante una API compatible con vLLM.
- Generacion de pruebas unitarias: dado un modulo de codigo, el adaptador puede producir casos de prueba y aserciones, aprovechando su entrenamiento en ejemplos de codigo.
- Refactorizacion con contexto extenso: gracias a la ventana de 131.072 tokens, puede analizar proyectos grandes y proponer cambios coherentes en multiples archivos.
- Explicacion y documentacion de codigo: traduccion de codigo fuente a documentacion tecnica o comentarios explicativos en ingles.
- Resolucion de problemas matematicos: adecuado para entornos educativos o de investigacion que requieran resolucion de ecuaciones y problemas cuantitativos, con la precision observada en MATH500.
- Chat tecnico de soporte: conversaciones multi-turno sobre depuracion, errores de compilacion o dudas de API, manteniendo el contexto de la sesion.
- Traduccion de pseudocodigo a Python: conversion de algoritmos descritos informalmente a implementaciones ejecutables.
- Analisis de trazas de error: interpretacion de mensajes de error y propuesta de correcciones concretas en proyectos de software.

## Benchmarks y rendimiento
| Evaluacion | Sarvam-30B original | Leo paso 50 | Ganancia observada |
|---|---:|---:|---:|
| HumanEval, 164 preguntas | 157/164 — 95,73 % | 159/164 — 96,95 % | +2 correctas; +1,22 puntos porcentuales |
| MATH500, subconjunto congelado de 200 preguntas | 194/200 — 97,00 % | 195/200 — 97,50 % | +1 correcta; +0,50 puntos porcentuales |

Ninguno de los dos modelos omitio o agoto el contexto en las 728 respuestas comparadas. En codigo hubo 4 ganancias emparejadas y 2 perdidas; en matematicas, 3 ganancias y 2 perdidas. Los valores p exactos de McNemar fueron 0,6875 y 1,0, respectivamente, por lo que las mejoras no alcanzan significacion estadistica. Los autores tambien reportan que el checkpoint del paso 100 fallo una puerta de precision predeclarada (codigo 18/20 frente a 20/20 del original; matematicas 8/10 en ambos) y que el paso 625 mostro regresion en los primeros 64 casos de HumanEval (53/64 frente a 64/64, con 9 omisiones del adaptador), aunque esta ultima es una medida interina no aleatoria. No se ejecuto HumanEval+.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 60 GB solo para los pesos del modelo base de 30B, mas overhead de activaciones y cache KV.
- GPU recomendadas para BF16: A100 80GB, H100 80GB. La evaluacion se realizo en una unica A100 80GB con vLLM.
- En cuantizacion de 4 bits: alrededor de 15-18 GB, por lo que cabe en una RTX 4090 de 24 GB o similar.
- En cuantizacion de 8 bits: alrededor de 30 GB, requiere dos RTX 4090 o una GPU profesional con 48 GB o mas (por ejemplo, A6000).
- Opciones de despliegue: vLLM (version usada: `vllm/vllm-openai:v0.31.0`), llama.cpp, Ollama, TGI, y cualquier framework compatible con adaptadores PEFT/LoRA.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | HumanEval | MATH500 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Sarvam-30B (base) | ~30B (no confirmado) | 131.072 tokens | 95,73 % | 97,00 % (subconjunto de 200) | Apache-2.0 | HuggingFace |
| Leo Sarvam 30B (adaptador) | Adaptador LoRA sobre ~30B | 131.072 tokens | 96,95 % | 97,50 % (subconjunto de 200) | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada. La comparativa se limita al modelo base y a este adaptador.

## Limitaciones y advertencias
- Las mejoras en HumanEval y MATH500 no son estadisticamente significativas (p = 0,6875 y p = 1,0), por lo que no puede afirmarse una superioridad general fiable.
- La evaluacion de MATH500 cubre solo un subconjunto congelado de 200 preguntas, no las 500 completas.
- No se ejecuto HumanEval+, por lo que no hay datos sobre robustez adicional.
- El adaptador se entreno con 400 ejemplos que no fueron validados de forma independiente en cuanto a correccion; provenian de un shuffle con semilla de un pool mayor.
- Los checkpoints posteriores (paso 100 y paso 625) mostraron regresiones, lo que sugiere que el paso 50 es un candidato validado, pero no necesariamente el optimo.
- Es un release no oficial de Sarvam AI; no cuenta con respaldo de la compania.
- El unico idioma declarado es el ingles, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas de alucinacion especificas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia y los terminos del modelo base Sarvam-30B por separado.
- El repositorio tiene 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- El adaptador requiere cargar el modelo base de forma independiente; no es un modelo autonomo.

## Enlaces
- HuggingFace del adaptador: https://huggingface.co/DesaiJayM/Leo-Sarvam-30B
- Modelo base Sarvam-30B: https://huggingface.co/sarvamai/sarvam-30b
- Dataset NVIDIA OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Modelo profesor Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Detalles de evaluacion y codigo de calificacion: carpeta `evaluation/` dentro del repositorio de HuggingFace
