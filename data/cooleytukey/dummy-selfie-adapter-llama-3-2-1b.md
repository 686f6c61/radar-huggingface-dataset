# cooleytukey/dummy-selfie-adapter-llama-3.2-1b

## Resumen

Este repositorio aloja un adapter de tipo SelfIE con pesos aleatorios, diseñado exclusivamente como banco de pruebas (test fixture) para el pipeline de SelfIE. No se trata de un modelo entrenado: cada tensor del archivo safetensors contiene ruido generado con una semilla fija, y cualquier salida que se obtenga con él es ruido por construcción. El propio autor lo etiqueta como `dummy`, `random-weights`, `testing` y `not-for-inference`.

El adapter está dimensionado para el modelo base `meta-llama/Llama-3.2-1B-Instruct` (con `hidden_dim = 2048`), mientras que los adapters SelfIE publicados y entrenados tienen una anchura de 4096 y solo cargan con el modelo base de 8B. Su única finalidad es permitir que una prueba end-to-end del pipeline SelfIE se ejecute en una GPU de portátil, validando la carga, la comprobación de dimensiones, la proyección, la inyección, la generación, la puntuación, la agregación y la salida de archivos, todo sin necesidad de fabricar pesos en tiempo de ejecución.

La licencia es MIT, el formato es safetensors, y el repositorio tiene un tamaño de 0.0 GB, coherente con su naturaleza de fixture mínimo. No está pensado para uso comercial ni de producción, sino como herramienta de verificación para desarrolladores que trabajan en el proyecto SelfIE.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter SelfIE (`scalar_affine`, `normalize_input=true`) sobre base `meta-llama/Llama-3.2-1B-Instruct` |
| Parametros totales | No disponible (proyección `scalar_affine` de dimensión 2048, sin pesos de modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Llama-3.2-1B-Instruct soporta 128k tokens) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El archivo `selfie-random-scalar-affine.safetensors` contiene una única proyección `scalar_affine` con `model_dim = 2048`, que coincide con la dimensión oculta del modelo base Llama-3.2-1B-Instruct. La arquitectura del adapter replica la de los checkpoints reales entrenados por SelfIE: `scalar_affine` con `normalize_input = true`. La diferencia es exclusivamente de pesos: aquí son aleatorios, generados con semilla 0 en CUDA mediante el script `make_smoke_weights.py`.

El valor `init_scale` se fija en `0.9332589507102966`, que corresponde a la mediana de la norma L2 de las filas de la embedding del modelo base. Esto asegura que el token suave (soft token) caiga en una escala de embedding plausible y que la generación no se degrade por una escala fuera de rango. El sesgo (`bias`) se escala por `init_scale`, por lo que también se desplaza con él.

No hubo entrenamiento de ningún tipo: ni preentrenamiento, ni fine-tuning, ni RLHF/DPO. El propósito no es aprender nada, sino validar el flujo de datos y las formas de los tensores en un entorno de prueba pequeño.

## Capacidades

- No tiene ninguna capacidad de generación de texto, razonamiento, código o matemáticas: cualquier salida es ruido por construcción.
- No soporta tool calling ni function calling.
- No es usable como agente ni para razonamiento multi-step.
- No tiene capacidades multilingües.
- No dispone de modo de pensamiento ni visión.
- Su única función es servir como fixture de pruebas para el pipeline SelfIE, verificando que el cargador de adapters, la cabecera de metadatos de safetensors, la comprobación de dimensiones, la proyección, la inyección, la generación, la puntuación, la agregación y la salida de archivos funcionan sin errores y producen las formas esperadas.

## Casos de uso

- Prueba de integración del cargador de adapters SelfIE: permite verificar que el código que carga adapters safetensors funciona correctamente con un archivo real en el formato `selfie_adapters` en disco, sin tener que fabricar pesos en memoria.
- Validación de la comprobación de dimensiones: al cargar el adapter sobre el modelo base de 1B, se comprueba que el sistema detecta correctamente la coincidencia de `hidden_dim` (2048) y rechaza o acepta según corresponda.
- Test de la proyección `scalar_affine` con `normalize_input=true`: verifica que la matemática de la proyección produce las formas esperadas en la salida.
- Prueba de inyección y generación: valida que el soft token se inyecta correctamente en el modelo base y que la generación no se degrada de forma degenerada (gracias al `init_scale` calibrado).
- Verificación de la agregación y salida de archivos: comprueba que los resultados se puntúan, agregan y escriben en el formato esperado.
- Ejecución de pruebas end-to-end en GPU de portátil: al tener dimensión 2048 en lugar de 4096, el fixture permite que el test completo corra en hardware modesto, algo que no es posible con los adapters entrenados de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está entrenado, por lo que cualquier métrica de rendimiento carecería de sentido. Su propósito es exclusivamente estructural.

## Requisitos de hardware

- VRAM estimada: mínima. El archivo de pesos es de tamaño 0.0 GB y la proyección `scalar_affine` de 2048 dimensiones ocupa unos pocos megabytes.
- GPU recomendada: cualquier GPU con al menos 2-4 GB de VRAM, suficiente para cargar el modelo base Llama-3.2-1B-Instruct en bf16 junto con el adapter.
- En consumer GPU: sí, cabe en GPUs de portátil y de gama media (por ejemplo, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: no es desplegable como servicio. Solo se usa en el pipeline de pruebas del proyecto SelfIE.
- Latencia y throughput: no disponibles, y no relevantes para un fixture de prueba.

## Comparativa con modelos similares

No existe una categoría de modelos comparable, ya que este es un artefacto de prueba, no un modelo de inferencia. La comparación relevante es con los adapters SelfIE entrenados publicados por el proyecto:

| Parametro | Dummy SelfIE adapter (este) | Adapter SelfIE entrenado (publicado) |
|---|---|---|
| Dimensión (`hidden_dim`) | 2048 | 4096 |
| Modelo base compatible | Llama-3.2-1B-Instruct | Llama-3.2-8B-Instruct |
| Pesos | Aleatorios (semilla 0) | Entrenados |
| Uso previsto | Pruebas de integración | Inferencia real (recuperación de información de hidden states) |
| Licencia | MIT | MIT |
| Disponibilidad | HuggingFace | Repositorio del proyecto SelfIE |

## Limitaciones y advertencias

- **No es un modelo entrenado**: todos los pesos son aleatorios. Cualquier salida generada con él es ruido y no tiene ningún significado.
- **No apto para inferencia**: el autor advierte explícitamente que no debe usarse para inferencia, evaluación ni para reportar resultados.
- **No apto para producción**: no es un modelo utilizable en ningún escenario real.
- **Dependiente del dispositivo**: el valor de `init_scale` difiere ligeramente entre CPU y CUDA (diferencia relativa ~1e-7), lo que puede variar los bytes del archivo aunque los tensores sean idénticos. Esto es irrelevante para su propósito de comprobación de formas.
- **Sesgos y alucinaciones**: no aplica, ya que no hay conocimiento aprendido.
- **Licencia**: MIT, permite uso comercial, pero no hay nada que usar comercialmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cooleytukey/dummy-selfie-adapter-llama-3.2-1b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Organización Meta Llama en HuggingFace: https://huggingface.co/meta-llama
- Documentación oficial de Llama 3.2 (model cards y formatos de prompt): https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
- Página de Llama 3 en Meta Developer: https://developer.meta.com/ai/models/llama-3/
