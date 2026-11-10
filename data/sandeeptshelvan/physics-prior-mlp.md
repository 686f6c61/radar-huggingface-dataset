# sandeeptshelvan/physics-prior-mlp

## Resumen

Physics-prior MLP es un checkpoint de pesos publicado por el usuario sandeeptshelvan (repositorio `sandeeptshelvan/physics-prior-mlp`) que implementa un perceptrón multicapa (MLP) por cada gaussiana en el contexto del proyecto SceneAgent, sección 3.4 del artículo arXiv:2610.34745 (Hollis, Fan y Yang). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un componente auxiliar entrenado para predecir propiedades físicas (material, cuerpo, colisión, masa logarítmica, densidad logarítmica, rigidez y deformabilidad) a partir de representaciones de 3D Gaussian Splatting.

El propio autor indica explícitamente que este repositorio no es un checkpoint de terceros publicado oficialmente, sino los pesos resultantes de su propio entrenamiento: concretamente el checkpoint de la época 10 de una ejecución de 14 épocas. El artefacto principal es un fichero NumPy de 260.290 bytes (`physics_prior_splat.npz`), lo que confirma que se trata de un modelo de escala muy reducida, orientado a un experimento de investigación concreto y no a un uso general.

Su relevancia es por tanto acotada: sirve como referencia reproducible para quien quiera inspeccionar o reutilizar el prior físico descrito en el artículo, pero no constituye un modelo desplegable para tareas de generación, razonamiento o procesamiento de lenguaje. La ficha se limita a documentar lo que la model card y los metadatos permiten afirmar, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) por gaussiana, en el contexto de 3D Gaussian Splatting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy `.npz`) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | other |
| Formato de pesos | NumPy `.npz` (`physics_prior_splat.npz`, 260.290 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un MLP aplicado de forma individualizada a cada gaussiana ("per-Gaussian MLP"), integrado en la sección 3.4 del artículo SceneAgent (Hollis, Fan y Yang, arXiv:2610.34745). El modelo no procesa texto ni secuencias lingüísticas: su entrada son representaciones asociadas a gaussianas 3D y su salida son predicciones de propiedades físicas, con cabeceras de clasificación (material, cuerpo, colisión) y de regresión (masa logarítmica, densidad logarítmica, rigidez, deformabilidad).

El entrenamiento se realizó durante 14 épocas y se conservó el checkpoint de la época 10, descrito por el autor como la época más temprana con la menor pérdida de validación. El conjunto de datos se dividió en 3.736 instancias ajustadas, con 3.274 para entrenamiento, 139 para validación y 323 para test. El split de test se evaluó una sola vez y no se utilizó para seleccionar la época, lo que reduce el riesgo de sobreajuste en la selección del checkpoint. No se especifican en la información disponible el número de tokens (no aplica), la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de propiedades físicas por gaussiana: clasificación de material, cuerpo y colisión, y regresión de masa logarítmica, densidad logarítmica, rigidez y deformabilidad.
- Integración en pipelines de 3D Gaussian Splatting como módulo de prior físico.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo de pensamiento (thinking mode) ni de otras capacidades especiales.

## Casos de uso

- Reproducción de experimentos del artículo SceneAgent: cargar `physics_prior_splat.npz` con NumPy y evaluar las predicciones sobre el split de test para contrastar los resultados publicados en la model card.
- Investigación en prior físico para 3D Gaussian Splatting: usar el MLP como referencia para estudiar cómo se infieren propiedades como rigidez o deformabilidad a partir de representaciones gaussianas.
- Punto de partida para reentrenamiento: el checkpoint puede servir como inicialización en experimentos propios que repliquen la sección 3.4 del artículo, dado que el autor documenta el proceso de selección de época.
- Auditoría metodológica: inspeccionar el fichero `train_report_splat.json` para verificar tamaños de split, pérdidas y métricas por época en un contexto de revisión por pares.
- Docencia y divulgación: ejemplo compacto (260 KB) de cómo se estructura un checkpoint NumPy con cabeceras de clasificación y regresión para un problema físico concreto.
- Comparación de priors: emplear las métricas de validación y test como línea base frente a otras aproximaciones de inferencia de propiedades físicas en escenas 3D.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas reportadas por el autor en `train_report_splat.json`, redondeadas a tres decimales. Las columnas Material, Body y Collision son exactitudes; el resto son errores absolutos medios (MAE).

| Split | Loss | Material | Body | Collision | Log-mass MAE | Log-density MAE | Rigidity MAE | Deformability MAE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Train | 1.350 | 0.953 | 0.993 | 0.831 | 0.292 | 0.494 | 0.035 | 0.033 |
| Validation | 2.293 | 0.928 | 0.957 | 0.820 | 0.383 | 0.577 | 0.051 | 0.047 |
| Test | 2.088 | 0.889 | 0.991 | 0.768 | 0.352 | 0.572 | 0.037 | 0.035 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del fichero de pesos (260.290 bytes) sugiere que la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no disponible; no se requiere GPU dedicada para cargar un `.npz` de este tamaño con NumPy.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido, aunque no se especifica en la documentación.
- Opciones de despliegue: carga directa con NumPy; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (MLP de prior físico para 3D Gaussian Splatting) con parámetros, contexto, rendimiento y licencia documentados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como tal.
- El autor indica explícitamente que el repositorio no es un checkpoint de terceros publicado oficialmente; es un artefacto de su propio entrenamiento.
- La licencia es "other", sin términos concretos especificados en la información disponible; es necesario consultar el repositorio de GitHub para conocer las restricciones de uso comercial.
- El checkpoint corresponde a la época 10 de 14; no es el modelo final del entrenamiento.
- El conjunto de validación es muy reducido (139 instancias), lo que limita la robustez de las métricas de validación.
- La exactitud de colisión en test es 0,768, notablemente inferior a la de material (0,889) y cuerpo (0,991); el rendimiento en esta cabecera es el más débil.
- El repositorio no incluye mallas ni los ficheros `prior_input.npy` por gaussiana, por lo que no es posible reproducir la inferencia sin material adicional.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por no tratarse de un modelo generativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sandeeptshelvan/physics-prior-mlp
- Repositorio de código y notas: https://github.com/sandy-t-shelvan/physics-prior-mlp
- Artículo de referencia: https://arxiv.org/abs/2610.34745
