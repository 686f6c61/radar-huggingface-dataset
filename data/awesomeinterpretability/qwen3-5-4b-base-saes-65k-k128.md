# AwesomeInterpretability/qwen3.5-4b-base-saes-65k-k128

## Resumen

Qwen3.5-4B-Base SAEs 65K K128 es un conjunto de dos diccionarios de autoencoders dispersos (sparse autoencoders, SAE) entrenados sobre las activaciones internas del modelo Qwen/Qwen3.5-4B-Base. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista que descompone las activaciones del modelo base en 65.536 características monossemánticas, con un presupuesto medio de L0 igual a 128 activaciones por token. Lo publica el colectivo AwesomeInterpretability bajo licencia Apache 2.0.

El paquete incluye dos SAE con hooks distintos: `qwen_visual`, entrenado sobre la salida del bloque 23 del codificador visual (ancho 1.024, parches de imagen válidos), y `qwen_middle`, entrenado sobre la capa 15 del modelo de lenguaje (ancho 2.560, posiciones de imagen y texto elegibles). Ambos se entrenaron durante exactamente 500 millones de exposiciones de vectores y usan BatchTopK con AuxK de baja frecuencia; el SAE intermedio asigna presupuestos L0 separados a los grupos de imagen y texto.

La relevancia es doble: por un lado, Qwen3.5-4B es un modelo multimodal reciente y estos son, según la model card, los primeros SAE publicados para sus activaciones; por otro, el paquete incluye evaluación cuantitativa detallada (FVU, L0, inactividad, dead features, delta-CE de sustitución) y código de inferencia reproducible, lo que lo hace útil para investigación en interpretabilidad y para auditar el comportamiento interno de un modelo multimodal de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) con BatchTopK y AuxK de baja frecuencia; dos diccionarios independientes sobre un transformer multimodal (Qwen3.5-4B-Base) |
| Parametros totales | No disponible (dos diccionarios de 65.536 features cada uno; anchos de entrada 1.024 y 2.560) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica al SAE; depende del modelo base Qwen3.5-4B-Base (no especificado en la informacion disponible) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; evaluacion final en float32 con TF32 desactivado) |
| Idiomas soportados | en, zh (segun tags y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas umbrales congelados, normalizacion, configuracion portable y codigo de inferencia PyTorch) |

## Arquitectura y entrenamiento

Cada diccionario es un SAE con 65.536 features latentes. El encoder se entrena con BatchTopK, que impone un presupuesto de activaciones por lote en lugar de por token, combinado con AuxK de baja frecuencia para rescatar features infrautilizadas. El SAE intermedio (`qwen_middle`) aplica presupuestos L0 separados para los grupos de imagen y texto, con media L0 = 128; la model card advierte que es un presupuesto medio, no exactamente 128 no ceros por token. El SAE visual (`qwen_visual`) añade condicionamiento por dirección principal invertible y ajuste de sesgo por frecuencia de entrenamiento.

El entrenamiento se detuvo al alcanzar 500 millones de exposiciones de vectores, sin prueba adicional de meseta de convergencia. El learning rate hace warmup durante 5M vectores, se mantiene en 3e-4 hasta 400M y decae con coseno hasta 3e-5 en 500M. Las exposiciones pueden reutilizar vectores en caché y las ramas visuales anteriores se documentan en el linaje sin doble conteo. La revision del modelo y procesador base es `1001bb4d826a52d1f399e183466143f4da7b741b`.

## Capacidades

- Descomposicion de activaciones del modelo Qwen3.5-4B-Base en 65.536 features interpretables por diccionario.
- Dos modos de inferencia: `fixed`, con encoder feedforward entrenado y umbrales calibrados congelados, y `pursuit`, con busqueda residual dispersa no negativa sobre el diccionario decodificador aprendido.
- El modo `pursuit` puede seleccionar features ausentes del soporte del encoder feedforward y cubre el 100% de features en los bancos de test (0.000% de inactividad en Test1M).
- Soporte multimodal: el SAE intermedio distingue roles de imagen (1), pregunta (2), respuesta (3), caption (4) y contexto posterior a imagen (5).
- Exportacion de IDs y coeficientes de features activas mediante `encode_sparse`, y reconstruccion al espacio original del hook mediante `reconstruct`.
- Carga en CPU soportada; CUDA recomendada para el modo `pursuit`.
- Codigo de inferencia, curvas de entrenamiento en TensorBoard y ficheros `evaluation.json` y `final_test.json` incluidos.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar que features se activan ante estimulos visuales o textuales concretos en la capa 15 del modelo de lenguaje y el bloque 23 del visual, usando `encode_sparse` para extraer IDs y coeficientes.
- Auditoria de sesgos y comportamientos emergentes: identificar features asociadas a conceptos sensibles y medir su activacion por rol (pregunta, respuesta, caption) gracias a los presupuestos L0 separados por grupo.
- Analisis de atribucion multimodal: comparar que features de imagen se activan en el SAE visual frente a las del SAE intermedio para los mismos parches, permitiendo trazar la informacion visual a traves del modelo.
- Deteccion de features muertas o infrautilizadas: usar los datos de dead10M (0.113% en visual, 0.000% en middle) y la inactividad en Test1M para validar la salud del diccionario antes de reutilizarlo en nuevos experimentos.
- Sustitucion y edicion de activaciones: emplear `reconstruct` y la metrica de delta-CE (+0.01480 en el SAE intermedio sobre 128 grupos de test) para estudiar el impacto causal de reemplazar activaciones en la generacion.
- Docencia y formacion: el paquete incluye curvas de entrenamiento, linaje de ramas y scripts de carga, lo que permite reproducir el flujo completo de entrenamiento y evaluacion de un SAE multimodal en un entorno controlado.
- Benchmarking de metodos SAE: comparar `fixed` frente a `pursuit` en FVU y cobertura sobre los mismos bancos de test (1M parches visuales; 500K posiciones de imagen y 500K de texto).

## Benchmarks y rendimiento

| Diccionario | Inferencia | Test FVU | FVU ortogonal visual | L0 medio | Inactividad Test1M | Dead10M entrenamiento |
|---|---|---:|---:|---:|---:|---:|
| qwen_visual | fixed | 0.00009145 | 0.08271 | 128.13 | 2.567% | 0.113% |
| qwen_visual | pursuit | 0.00006244 | 0.05831 | 128.13 | 0.000% | 0.113% |
| qwen_middle | fixed | 0.11619549 | / | 128.16 | 0.679% | 0.000% |
| qwen_middle | pursuit | 0.09568887 | / | 128.16 | 0.000% | 0.000% |

Notas de la model card: el FVU visual bruto no es suficiente porque la primera direccion principal explica el 99.896% de la varianza de entrada; el FVU ortogonal elimina esa direccion. El modo `fixed` visual supera el objetivo de inactividad <1% (2.567%) y el `fixed` intermedio supera el objetivo de FVU global <=0.10 (0.11619549). En modo `pursuit`, 65.536 features visuales y 65.530 intermedias tienen soporte de al menos diez grupos de imagen de test independientes. La sustitucion de reconstruccion sobre 128 grupos de test da un delta-CE conjunto imagen+texto de +0.01480 (IC 95% [0.01073, 0.01786]). Los autores advierten que estas metricas no permiten ordenar hooks distintos.

## Requisitos de hardware

- El paquete no incluye los pesos del modelo base; solo los modulos SAE. Para usar los SAE es necesario cargar Qwen3.5-4B-Base por separado y capturar las activaciones del hook correspondiente.
- El SAE visual recibe tensores de ancho 1.024 y el intermedio de ancho 2.560; el coste de memoria de los diccionarios es modesto frente al modelo base.
- `encode` devuelve un tensor denso [N, 65536] y puede agotar memoria con N grande; se recomienda procesar lotes pequeños (el modo `pursuit` se evalua con lotes de 64).
- Carga en CPU soportada; CUDA recomendada para `pursuit` por su mayor coste computacional.
- GPU recomendadas: no especificadas en la informacion disponible; el modelo base Qwen3.5-4B-Base condiciona el requisito real de VRAM.
- Opciones de despliegue: carga mediante el script `load_sae.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Features | L0 medio | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| AwesomeInterpretability/qwen3.5-4b-base-saes-65k-k128 | SAE sobre Qwen3.5-4B-Base | 65.536 por diccionario | 128 | Apache 2.0 | Hugging Face |
| Alternativas SAE sobre modelos de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de otros SAE comparables sobre Qwen3.5-4B ni de sus metricas, por lo que la comparativa cuantitativa con alternativas no esta disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni imagenes; solo descompone y reconstruye activaciones del modelo base.
- No incluye los pesos de Qwen3.5-4B-Base; es imprescindible descargar el modelo base por separado y respetar la revision `1001bb4d826a52d1f399e183466143f4da7b741b`.
- El modo `fixed` visual no cumple el objetivo de inactividad <1% (2.567%) y el `fixed` intermedio no cumple el objetivo de FVU <=0.10 (0.11619549); los autores lo reconocen explicitamente.
- El entrenamiento se detuvo al alcanzar el presupuesto de 500M exposiciones sin prueba de meseta de convergencia, por lo que no se garantiza que los diccionarios hayan convergido.
- Tener soporte en al menos diez grupos de test no certifica pureza semantica ni utilidad causal de las features.
- Las metricas no permiten ordenar hooks distintos entre si; comparaciones entre `qwen_visual` y `qwen_middle` no son validas.
- El modo `pursuit` consume mas computo que `fixed` y puede seleccionar features ausentes del soporte del encoder feedforward; los resultados de cobertura en `pursuit` no implican que el encoder entrenado tenga cero features inactivas.
- Hay que excluir padding, tokens de plantilla, marcadores especiales y tramos de texto no elegibles al capturar activaciones; no se debe renormalizar la entrada porque el loader ya aplica media/escala guardadas.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; el SAE hereda los sesgos del modelo base Qwen3.5-4B-Base.
- Licencia Apache 2.0 permite uso comercial de los modulos SAE, pero el uso del modelo base queda sujeto a su propia licencia.

## Enlaces

- Hugging Face: https://huggingface.co/AwesomeInterpretability/qwen3.5-4b-base-saes-65k-k128
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de codigo, curvas de entrenamiento y evaluacion: incluido en el propio repositorio de Hugging Face (`load_sae.py`, `requirements.txt`, `evaluation.json`, `final_test.json`, `training/`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
