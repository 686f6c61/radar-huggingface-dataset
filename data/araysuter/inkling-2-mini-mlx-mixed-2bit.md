# araysuter/Inkling-2-Mini-MLX-mixed-2bit

## Resumen

Inkling-2-Mini-MLX-mixed-2bit es una conversión cuantizada a 2 bits del modelo multimodal Inkling-2-Mini desarrollado por Thinking Machines Lab. El artefacto lo publica el usuario independiente araysuter en Hugging Face y está pensado exclusivamente para ejecutarse en Apple Silicon mediante la librería MLX. No es una versión oficial del autor original, sino una conversión experimental de baja precisión derivada del checkpoint entrenado en NVFP4/MXFP8, no de un BF16 original.

El modelo base es un transformer de mezcla de expertos (MoE) con unos 26.400 millones de parámetros lógicos y una arquitectura peculiar denominada `inkling2_loop`, en la que doce capas intermedias se ejecutan tres veces por token, dando lugar a 48 aplicaciones de capa por token sobre 24 capas almacenadas. Soporta entrada de imagen y texto (`image-text-to-text`) e incluye codificador visual.

La relevancia de esta conversión es práctica: reduce el peso a 13,24 GB, lo que permite ejecutar un modelo multimodal de 26B en un equipo con memoria unificada de 64 GiB. El precio es una pérdida de calidad notable, que el propio autor advierte como superior a la de sus versiones de 4 y 5 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle de capas (`inkling2_loop`), 24 capas almacenadas y 48 aplicaciones por token |
| Parametros totales | 26.388.559.360 (26,4B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | Configurada en el valor original del modelo base (128K y 1M no cualificados en esta conversión) |
| Tipos de cuantizacion | Mixta 2/3/4/8 bits: expertos gate/up a 2 bits y down a 3 bits en capas 0-19; expertos a 4 bits en capas 20-23; atención a 4 bits con group size 32; embeddings y cabeza de salida a 8 bits; codificador visual y puertas de routing en coma flotante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantización afín) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con una innovación estructural: un esquema de bucle (`inkling2_loop`) en el que las doce capas centrales se aplican tres veces por token, de modo que el cómputo efectivo es de 48 aplicaciones de capa aunque solo se almacenen 24. Incorpora además un codificador visual para el procesamiento de imágenes y puertas de control del bucle que se mantienen en precisión flotante original.

La conversión de araysuter parte del checkpoint NVFP4/MXFP8 publicado por Thinking Machines, no de un BF16. Aplica cuantización afín por grupo con búsqueda de factores de recorte (1, 0,995, 0,985, 0,97, 0,94, 0,9, 0,85, 0,8) seleccionados por error cuadrático medio de reconstrucción; no se trata de GPTQ ni AWQ calibrados con activaciones. El autor reporta una reducción del 11,74 % en la suma de MSE por grupo respecto al redondeo min/max, aunque advierte que es una estadística de pesos, no una métrica de calidad. No se incluye el archivo auxiliar `mtp.safetensors`, por lo que no se reivindica ninguna aceleración por decodificación especulativa. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo original.

## Capacidades

- Generación de texto conversacional y razonamiento general.
- Comprensión de imágenes junto con texto (pipeline `image-text-to-text`), con codificador visual incluido en la conversión.
- Generación de código: en la validación del autor responde correctamente a una petición de función Python.
- Aritmética básica: la prueba de validación devuelve el resultado correcto (391).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento (thinking): el autor menciona que los tokens de razonamiento cuentan en las longitudes y velocidades registradas, lo que sugiere que el modelo base genera cadenas de razonamiento.

## Casos de uso

- Prototipado local en Apple Silicon: permite probar un modelo multimodal de 26B en un Mac con 64 GiB de memoria unificada sin GPU dedicada, gracias a los 13,24 GB de pesos.
- Asistentes conversacionales de escritorio: integrable en aplicaciones macOS mediante MLX para conversaciones multi-turno con entrada de imagen y texto.
- Análisis de capturas y documentos escaneados: el codificador visual permite describir o razonar sobre imágenes junto a instrucciones textuales, útil en herramientas de accesibilidad o extracción de información.
- Generación de código en entornos de desarrollo locales: útil para autocompletado y funciones sencillas en editores, asumiendo la pérdida de calidad del 2 bits.
- Educación e investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar el impacto de la cuantización mixta de 2 bits en modelos MoE multimodales, con manifiesto y scripts de conversión incluidos.
- Evaluación comparativa de precisiones: al existir versiones de 4 y 5 bits del mismo autor, permite medir en un mismo hardware la degradación de calidad frente al tamaño.
- Demostraciones offline y entornos sin conectividad: el modelo cabe en un portátil y no requiere servicios en la nube, lo que facilita pruebas de concepto en campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo proporciona una muestra sintética de validación:

| Prueba sintética | Fuente nativa | Esta conversión |
|---|---:|---:|
| Log-verosimilitud negativa media | 2,26608 | 2,15405 |
| Perplejidad | 9,64151 | 8,61969 |

El delta de NLL es de -0,11203 sobre un único pasaje de texto sintético y tres prompts de prueba, lo que el propio autor califica explícitamente como no representativo de la precisión general en benchmarks.

## Requisitos de hardware

- VRAM/memoria: 13,24 GB (12,33 GiB) de pesos más metadatos de escala y tensores protegidos; en la práctica se recomienda disponer de al menos 16-24 GB de memoria unificada libre.
- Hardware validado: Apple M5 Max con 64 GiB de memoria unificada, MLX 0.32.4 y Python 3.14.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable; la conversión es específica de MLX y no se ha validado en CUDA.
- Cabe en GPU de consumo: no en el sentido tradicional; está pensado para Apple Silicon con memoria unificada suficiente.
- Despliegue: requiere el port fijado de MLX-LM (`git+https://github.com/ml-explore/mlx-lm.git@0c4c99192230f1943dd468d297f0b8a64ae7b7c2`); no funciona con MLX-LM estándar publicado. Se ejecuta con `mlx_lm generate` y la variable `MLX_ENABLE_TF32=0`.
- Latencia y throughput: no disponibles; el autor indica que los tiempos están en `VALIDATION.json` pero no los reproduce en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-mixed-2bit (este) | 26,4B lógicos | Configuración original; 128K/1M no cualificados | Mixta 2/3/4/8 bits, 13,24 GB | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini (Thinking Machines) | 26,4B lógicos | Configuración original | NVFP4/MXFP8 nativo | Apache 2.0 | Hugging Face, oficial |
| Versiones MLX 4 y 5 bits del mismo autor | 26,4B lógicos | Igual | 4 y 5 bits | Apache 2.0 | Hugging Face, MLX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; el autor solo advierte que la versión de 2 bits pierde más calidad que las de 4 y 5 bits.

## Limitaciones y advertencias

- Conversión no oficial: no la publica Thinking Machines y no está respaldada por el autor del modelo base.
- Pérdida de calidad significativa: el propio autor califica la conversión como experimental y espera una degradación mayor que en 4 y 5 bits.
- Punto de partida ya cuantizado: parte de NVFP4/MXFP8, no de BF16, por lo que el error de reconstrucción se acumula.
- Cuantización no calibrada: usa recorte por búsqueda de MSE de pesos, no GPTQ ni AWQ con activaciones.
- Sin decodificación especulativa: el archivo `mtp.safetensors` no está incluido ni cualificado.
- Contexto largo no verificado: los 128K y 1M tokens no se han validado en esta conversión.
- Dependencia de un port fijado de MLX-LM: versiones estándar no soportan la arquitectura; requiere el commit exacto indicado.
- Sensibilidad a la precisión en M5: la ruta por defecto de float32 reducido falla tres de los ocho tests del port; es necesario `MLX_ENABLE_TF32=0`.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera de los idiomas del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización extrema puede agravarlo.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base y su política de uso aceptable.
- Licencia Apache 2.0 permite uso comercial, pero se mantiene sujeta a la Model Acceptable Use Policy de Thinking Machines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-mixed-2bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del checkpoint original: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Repositorio MLX-LM (commit fijado): https://github.com/ml-explore/mlx-lm.git@0c4c99192230f1943dd468d297f0b8a64ae7b7c2
- Documentación de precisión de MLX: https://ml-explore.github.io/mlx/build/html/usage/precision.html
- Manifiesto de cuantización: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-mixed-2bit/blob/main/QUANTIZATION_MANIFEST.json
- Resultados de validación: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-mixed-2bit/blob/main/VALIDATION.json
