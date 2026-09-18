# boods/FrMedQA-CrossLingual-TestRun-DAPT

## Resumen

El modelo `boods/FrMedQA-CrossLingual-TestRun-DAPT` es un ajuste fino (fine-tuning) publicado en HuggingFace por el usuario "boods", derivado del modelo base `unsloth/Qwen3-14B-unsloth-bnb-4bit`. Se trata, por tanto, de una adaptación de Qwen3-14B, un transformer decoder-only denso de 14,8 mil millones de parámetros desarrollado por Alibaba Qwen. El entrenamiento se ha realizado con Unsloth y la librería TRL, lo que indica un flujo de trabajo de ajuste supervisado (SFT) o DAPT sobre una base ya cuantizada a 4 bits.

El nombre del repositorio sugiere un caso de uso de "Domain-Adaptive Pre-Training" (DAPT) orientado a preguntas y respuestas médicas en francés con evaluación cross-lingual, aunque la model card no confirma esta interpretación ni describe el corpus empleado. La etiqueta de idioma declarada es únicamente `en` (inglés), lo que entra en contradicción aparente con el componente "Fr"/"CrossLingual" del nombre.

La relevancia práctica de esta ficha es limitada: se trata de una "TestRun" (ejecución de prueba), con 0 descargas y 0 likes en el momento de la consulta, sin métricas publicadas y con un tamaño de repositorio de 0,3 GB que resulta incompatible con los pesos completos de un modelo de 14B, lo que apunta a que contiene únicamente adaptadores LoRA o un subconjunto de archivos. No debe considerarse un modelo listo para producción ni para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-14B) |
| Parametros totales | 14,8 mil millones en el modelo base; el repositorio (0,3 GB) no contiene pesos completos, probablemente solo adaptadores |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-14B, extensible a 131.072 con YaRN (dato heredado del base, no confirmado para este ajuste) |
| Tipos de cuantizacion | El base declarado es bnb-4bit (Unsloth); el repositorio no declara cuantizaciones propias y no ofrece GGUF |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Pipeline | no disponible |
| Region | us |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el procedimiento de entrenamiento en la model card. Los unicos datos confirmados son: fine-tuning de `unsloth/Qwen3-14B-unsloth-bnb-4bit` mediante Unsloth (con la afirmacion del autor de un entrenamiento "2x faster"), uso de la libreria TRL y publicacion en formato safetensors. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF/DPO, ni hiperparametros como tasa de aprendizaje, LoRA rank o numero de epocas.

El modelo base Qwen3-14B es un transformer decoder-only denso con atencion por consulta agrupada (GQA) y soporte de modo de razonamiento ("thinking mode"), entrenado por Alibaba Qwen. El tag `unsloth` y el sufijo `bnb-4bit` del base implican que el ajuste se realizo sobre una version cuantizada a 4 bits con bitsandbytes, lo que condiciona la precision numerica del resultado y complica la exportacion directa a otros formatos. La denominacion "DAPT" en el nombre del repositorio apunta a preentrenamiento adaptativo de dominio, pero no hay documentacion que lo confirme.

Como innovacion tecnica destacable solo puede citarse el uso del stack Unsloth, que aplica kernels optimizados para reducir el consumo de memoria en el ajuste de modelos grandes; no se documenta ninguna innovacion propia del autor.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-14B.
- Razonamiento y respuesta a preguntas, presumiblemente orientado a dominio medico segun el nombre del repositorio, aunque no verificado.
- Capacidad multilingue del base (Qwen3 cubre 119 idiomas), pero la model card solo declara `en`; no hay confirmacion de que el ajuste preserve el frances u otros idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (el base Qwen3 lo soporta, pero no se confirma en este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode) del base: no confirmado tras el ajuste.
- Capacidades de vision o audio: no disponibles (el base es exclusivamente de texto).

## Casos de uso

- Investigacion en adaptacion de dominio (DAPT): el modelo puede servir como punto de partida reproducible para experimentar con preentrenamiento adaptativo sobre corpus medicos, siempre que se documente el dataset empleado.
- Evaluacion cross-lingual de QA medico: dado el nombre del repositorio, podria emplearse para medir transferencia entre frances e ingles en tareas de preguntas medicas, aunque no hay artefactos de evaluacion publicados.
- Prototipado de asistentes de informacion sanitaria: con las debidas advertencias, podria usarse como base para responder consultas de terminologia medica en ingles en entornos de investigacion cerrados.
- Generacion de resumenes de literatura medica: el contexto nativo de 32.768 tokens del base permitiria procesar articulos completos, si bien la calidad tras el ajuste no esta verificada.
- Extraccion estructurada de informacion clinica: mediante prompting, podria extraer entidades (farmacos, diagnosticos) de textos medicos, aunque requeriria validacion exhaustiva por riesgo de alucinacion.
- Destilacion o ajuste posterior: al ser un checkpoint pequeno, puede emplearse como base para nuevos fine-tunings con LoRA sobre el mismo modelo de 14B.
- Banco de pruebas de infraestructura: util para validar pipelines de despliegue (vLLM, TGI, transformers) con modelos de 14B cuantizados, dado su bajo peso en disco.
- Traduccion de terminologia medica frances-ingles: hipotesis derivada del nombre del repositorio, no confirmada por la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de QA medico (MedQA, PubMedQA) en la model card ni en los resultados de busqueda web, que no devolvieron referencias relevantes al modelo.

## Requisitos de hardware

- El repositorio contiene 0,3 GB, por lo que resulta insuficiente por si solo: es necesario descargar el modelo base `unsloth/Qwen3-14B-unsloth-bnb-4bit` y aplicar los adaptadores, o fusionarlos previamente.
- VRAM estimada para el modelo base de 14,8B en precision completa (FP16/BF16): aproximadamente 28-30 GB solo en pesos, mas cache KV; requiere GPU de 40 GB o mas.
- En cuantizacion 4 bits (bnb-4bit, como el base declarado): aproximadamente 9-10 GB de pesos, lo que permite inferencia en GPUs de consumo como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con margen ajustado.
- En cuantizacion 8 bits: aproximadamente 15-16 GB, viable en RTX 4090 y A6000.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en precision completa o FP8; RTX 4090/3090 para cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (declarado), `text-generation-inference` (tag presente) y `vLLM` previa fusion de adaptadores. Ollama y llama.cpp requeririan una conversion a GGUF que no se proporciona.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas declarados | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| boods/FrMedQA-CrossLingual-TestRun-DAPT | 14,8 B (base) | 32.768 (heredado) | en | apache-2.0 | safetensors (adaptadores) | Test run sin benchmarks |
| unsloth/Qwen3-14B-unsloth-bnb-4bit | 14,8 B | 32.768 (heredado) | no disponible en esta ficha | apache-2.0 | safetensors (bnb-4bit) | Modelo base declarado |
| Qwen/Qwen3-14B | 14,8 B | 32.768 nativos / 131.072 con YaRN | 119 idiomas | apache-2.0 | safetensors | Modelo original |
| Alternativas de QA medico de 7-14B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de este ajuste con el de sus alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni validacion clinica, ni metrica alguna publicada; el propio nombre indica que es una "TestRun" (ejecucion de prueba).
- Riesgo elevado de alucinacion en dominio medico: cualquier salida debe tratarse como no fiable y no puede usarse para decision clinica.
- Discrepancia idiomatica: el nombre sugiere contenido en frances y evaluacion cross-lingual, pero la model card solo declara ingles; el comportamiento real en frances es desconocido.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento de Qwen3 y del dataset de ajuste, que no se especifica.
- Limitaciones de contexto: la ventana de 32.768 tokens es la del base y no se ha confirmado su preservacion tras el ajuste.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el autor no aporta garantias ni documentacion de procedencia de datos, lo que traslada el riesgo legal al usuario.
- Repositorio incompleto o ambiguo: 0,3 GB es insuficiente para pesos completos de 14B, por lo que el artefacto probablemente requiere el modelo base y un paso de fusion manual; no se documenta como hacerlo.
- Cero traccion comunitaria (0 descargas, 0 likes): no ha sido revisado ni validado por terceros.
- Dependencia del stack Unsloth/bitsandbytes: puede presentar incompatibilidades al exportar a otros formatos de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-TestRun-DAPT
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Paper, blog o demo especificos de este ajuste: no disponibles
- Los resultados de la busqueda web no devolvieron ningun enlace relevante al modelo (unicamente referencias a un comercio de ropa sin relacion).
