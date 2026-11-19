# RenormalizationTech/qwen38-27b-sarcasm-gcad-controls

## Resumen

`RenormalizationTech/qwen38-27b-sarcasm-gcad-controls` es un paquete experimental de control de inferencia, no un modelo independiente, publicado por el usuario RenormalizationTech. Se construye sobre el checkpoint `RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4`, un modelo de 27.000 millones de parametros cuantizado en NF4, y anade una direccion de estilo aprendida denominada GCAD (Gated Cropped Attention-Delta) que se inyecta en las salidas de atencion de seis capas seleccionadas durante la generacion. El objetivo declarado es modular el sarcasmo de las respuestas sin reentrenar los pesos base, ajustando un coeficiente de fuerza entre 0 y 16.

La relevancia del artefacto es metodologica: demuestra un mecanismo de steering en tiempo de inferencia sobre un modelo grande cuantizado, con un banco de direcciones extraido de generaciones apareadas sarcasticas y sinceras. Sin embargo, el propio autor advierte que ninguna configuracion probada supero las puertas de aceptacion registradas (`exploratory_null_through_b16`), que la fuerza por defecto b=8 falla la puerta de coherencia relativa y que las fuerzas altas pueden producir texto burlon o degradante. No es una recomendacion de despliegue en produccion.

El repositorio tiene 0 descargas, 0 likes, un tamano de 0.0 GB (los pesos residen en el modelo base) y fue creado el 19 de noviembre de 2026. La licencia declarada es Apache 2.0. No se dispone de informacion sobre idiomas soportados ni sobre resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B); control GCAD sobre salidas de atencion en 6 capas |
| Parametros totales | 27.000 millones (modelo base, segun el identificador) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (modelo base); pesos del control en BF16 para el runtime |
| Idiomas soportados | no disponible (el ejemplo soportado es un unico turno en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de controles sin pesos; base en NF4; runtime PyTorch) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27.000 millones de parametros, afinado y cuantizado en NF4, sobre el que se aplica un mecanismo de steering denominado GCAD. Este anade una direccion de estilo aprendida a las salidas de atencion seleccionadas durante la generacion, modulada por una compuerta dependiente del token que varia la magnitud de la adicion a medida que el modelo genera su respuesta. La direccion se extrae de generaciones apareadas (sarcasticas frente a sinceras) producidas por el propio modelo base, de modo que el banco de direcciones es especifico del checkpoint y del stack de software/GPU exactos con los que se construyo.

Los pesos del modelo base permanecen inalterados: el control es puramente de inferencia y la fuerza es ajustable sin reentrenamiento. El paquete incluye un runtime que verifica por SHA256 seis ficheros del modelo base y todos los ficheros de carga del control, con soporte para enlaces de snapshot de Hugging Face verificados por hash. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. El autor indica que solo se verifico mecanicamente el stack exacto checkpoint/software/GPU, y que otro hardware puede generar tokens distintos.

## Capacidades

- Generacion de texto autoregresiva sobre el modelo base Qwen3.8-27B en NF4, con decodificacion greedy, penalizacion de repeticion 1.05, cache nativa y semilla 42 en el ejemplo soportado.
- Steering de estilo en tiempo de inferencia: modulacion del sarcasmo mediante el coeficiente `base_coef` (b), con valores evaluados en 0, 2, 4, 8 y 16.
- Fuerza 0 desactiva los hooks de steering y produce generacion ordinaria sin control.
- Ajuste de fuerza sin reentrenamiento, manteniendo fijo el banco, las seis capas seleccionadas y la escala de compuerta.
- Verificacion de integridad criptografica del paquete de controles y de los ficheros del modelo base mediante SHA256.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking en la informacion disponible.
- El soporte multilingue no esta documentado; el unico caso validado es un turno de usuario en ingles sin system prompt.

## Casos de uso

- Investigacion sobre steering y control de estilo: el paquete permite reproducir el perfil de sarcasmo documentado en `evaluation.json` y `metrics.csv` para estudiar como una direccion aprendida en la atencion altera rasgos estilisticos medibles.
- Experimentacion academica con direcciones de activacion: util para comparar la eficacia de GCAD frente a otras tecnicas de activation steering sobre un modelo de 27.000 millones cuantizado en NF4.
- Demostracion de verificacion de integridad en pipelines de investigacion: el runtime exige descarga explicita por commit publico y comprobacion SHA256, lo que sirve como ejemplo de cadena de confianza para artefactos experimentales.
- Analisis de degradacion de coherencia bajo steering: los datos de las puertas de aceptacion (coherencia 84,28 en baseline frente a 34,59 en fuerza 16) permiten estudiar la relacion entre intensidad de estilo y calidad del texto.
- Reproduccion controlada de experimentos: el ejemplo soportado (un turno, sin system prompt, greedy, 160 tokens maximos) esta pensado para replicar resultados de forma determinista en el stack registrado.
- Pruebas de robustez y seguridad de contenido: dado que las fuerzas altas pueden producir texto burlon o degradante, el artefacto es util para calibrar filtros y evaluar riesgos de generacion ofensiva en entornos de investigacion.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas internas de evaluacion del control, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Se reproducen a continuacion tal como aparecen en la model card:

| Fuerza / brazo | Sarcasmo | Coherencia | Descortesia | Coherencia <50 | Puertas registradas |
|---|---:|---:|---:|---:|---|
| Baseline | 0,00 | 84,28 | 1,91 | 0/32 | Referencia |
| Prompted reference | 55,56 | 76,00 | 52,09 | 0/32 | Referencia |
| 2 | 0,09 | 84,16 | 2,22 | 0/32 | FAIL: trait_gain, individual_ge50; sin sarcasmo juzgado apreciable |
| 4 | 4,97 | 83,44 | 6,75 | 0/32 | FAIL: trait_gain, individual_ge50 |
| 8 | 88,50 | 58,94 | 70,72 | 6/32 | FAIL coherencia relativa: 58,94 < 64,28; valor por defecto experimental del autor |
| 16 | 95,16 | 34,59 | 81,53 | 30/32 | FAIL: coherence_abso (dato truncado en la fuente) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Se requieren aproximadamente 18 GB de pesos del modelo base que deben caber en una unica GPU CUDA con capacidad BF16; no hay fallback a CPU ni offload.
- Entorno de software fijado: Python 3.13.3, Torch 2.12.0+cu130 y CUDA 13.0, con las versiones exactas de `requirements.txt`.
- Los paquetes opcionales FLA, causal-conv1d y kernels deben permanecer ausentes, tal como se estudio.
- GPU recomendadas: no disponible de forma explicita; por el requisito de 18 GB en BF16 y soporte BF16, encajan tarjetas con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100, H100), aunque el autor solo verifico mecanicamente un stack concreto.
- No cabe en GPUs de consumo con menos de 18 GB de VRAM en el formato indicado.
- Opciones de despliegue: runtime propio del paquete (`runtime.load_runtime` y CLI `python -m runtime.example`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El artefacto no es un modelo de proposito general sino un control experimental sobre un checkpoint concreto, por lo que la comparacion con alternativas de la misma categoria requeriria datos que no se han publicado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-27b-sarcasm-gcad-controls | 27.000 M (base) | no disponible | metricas internas de steering (ver tabla) | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto exclusivamente experimental y de demostracion: ninguna fuerza probada supero las puertas de aceptacion registradas (`exploratory_null_through_b16`); no es un controlador validado.
- La fuerza por defecto b=8 falla la puerta de coherencia relativa (58,94 frente al umbral 64,28) y produce 6/32 respuestas con coherencia inferior a 50.
- Las fuerzas altas (16) generan texto marcadamente incoherente (coherencia 34,59, 30/32 por debajo de 50) y pueden producir contenido burlon o degradante.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base es un transformer de 27.000 millones sin datos publicados de fiabilidad factual.
- Sesgos conocidos: no documentados, mas alla del sesgo estilistico hacia el sarcasmo y la descortesia que introduce el propio control.
- Limitaciones de idioma: el unico caso soportado es un turno en ingles sin system prompt; no hay datos sobre otros idiomas.
- Restricciones de uso: licencia Apache 2.0 permite uso comercial del artefacto, pero el autor no lo recomienda para produccion y advierte de la generacion de texto ofensivo.
- Restricciones tecnicas del runtime: se rechazan booleanos, valores no finitos o fuera de rango, padding, batch sizes mayores que uno, uso anidado o concurrente y cambios de fuerza a mitad de llamada.
- Dependencia estricta del stack: solo se verifico el checkpoint, software y GPU exactos; otro hardware puede generar tokens distintos y alterar los resultados.
- Integridad: la verificacion SHA256 garantiza consistencia de bytes, no la identidad del publicador; el ancla de confianza debe tomarse del mensaje de commit publico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RenormalizationTech/qwen38-27b-sarcasm-gcad-controls
- Modelo base: https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4
- Revision fijada del modelo base: 586bb02218d196f485c321bbde3348677c63fc6a
- Documentacion interna citada en la model card: `METHODS.md`, `evaluation.json`, `metrics.csv` (dentro del repositorio de controles)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
