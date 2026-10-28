# betidestudio/so101-test-2bl3lj

## Resumen

so101-test-2bl3lj es una política robótica de imitación publicada por el usuario betidestudio en Hugging Face, entrenada con LeRobot para un brazo SO-101. Según su model card, se trata de una *diffusion policy* que consume el estado del robot junto con tres cámaras (frontal, superior y de muñeca) y produce acciones de control a 20 fps. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un checkpoint de control motor que se carga con la biblioteca `lerobot` mediante `--policy.path=<repo>`.

El repositorio contiene 292.719.206 parámetros en formato safetensors y ocupa 1,2 GB, lo que sitúa el checkpoint en el orden de magnitud de las políticas de imitación con codificador visual convolucional y cabeza de difusión. El nombre del repositorio ("test") y los metadatos (0 descargas, 0 likes, creado y actualizado con cinco segundos de diferencia el 2026-10-28) apuntan a una publicación de prueba más que a un modelo validado para producción.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible del flujo de trabajo actual de robótica open source (SO-101 + LeRobot + diffusion policy) y como referencia para quien quiera inspeccionar el formato de pesos y la configuración de observación (estado + tres vistas de cámara) de una política entrenada con esta librería. No hay información publicada sobre el dataset de entrenamiento, la licencia ni métricas de éxito en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot) para control robótico; consume estado + 3 cámaras (frontal, superior, muñeca). Backbone y número de pasos de difusión: no disponible |
| Parametros totales | 292.719.206 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (precisión probable fp32, no confirmada) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de modelo / pipeline | robotics (política de imitación visuomotora) |
| Entradas | estado del robot + imágenes de cámara frontal, superior y de muñeca |
| Frecuencia de control | 20 fps (según model card) |
| Biblioteca de carga | lerobot (`--policy.path=<repo>`) |
| Hardware objetivo | brazo robótico SO-101 |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card es explícita en dos puntos: es una *diffusion policy* de LeRobot y está pensada para un SO-101 con observaciones de estado más tres cámaras a 20 fps. Una diffusion policy de esta familia genera trayectorias de acción mediante un proceso de eliminación de ruido iterativo condicionado por las observaciones visuales y propioceptivas, en lugar de predecir la acción de forma directa como haría una política tipo ACT o una regresión simple. El recuento de 292,7 M de parámetros es coherente con un codificador visual convolucional seguido de una cabeza de difusión temporal, aunque la configuración exacta (backbone, número de capas, pasos de difusión, horizonte de predicción) no está documentada en la información disponible.

No hay datos sobre el dataset de entrenamiento: se desconoce el número de episodios de teleoperación, la resolución de las cámaras, la composición de las tareas, si hubo aumento de datos o si se aplicó algún tipo de regularización. Tampoco se documenta si el entrenamiento fue puramente de imitación supervisada o si se combinó con ajuste por refuerzo. La publicación parece un test de extremo a extremo del pipeline de LeRobot (grabación de episodios, entrenamiento y subida del checkpoint) y no un modelo con una ficha técnica completa.

## Capacidades

- Control visuomotor de un brazo SO-101 a partir de estado propioceptivo y tres flujos de cámara simultáneos.
- Generación de secuencias de acción multimodales mediante difusión, lo que en esta familia de políticas permite representar distribuciones de acciones multimodales en lugar de promediarlas.
- Ejecución a 20 fps, frecuencia compatible con tareas de manipulación tipo pick-and-place.
- Integración nativa con el ecosistema LeRobot: carga directa del checkpoint, reutilización de las clases de política y de los scripts de evaluación.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel; la política mapea observación a acción dentro de la distribución entrenada.
- Capacidades multilingües: no aplica.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- **Verificación del pipeline de LeRobot**: cargar el checkpoint con `--policy.path` para comprobar que el entorno, las versiones de la librería y el formateo de observaciones (estado + tres cámaras) funcionan antes de entrenar un modelo propio. Es el uso más realista dado el carácter de test del repositorio.
- **Réplica de una configuración de referencia**: usar la estructura de observación (cámara frontal, superior y de muñeca a 20 fps) como plantilla para grabar datasets propios con un SO-101 y mantener compatibilidad con políticas ya publicadas.
- **Manipulación pick-and-place en laboratorio**: desplegar la política sobre un SO-101 real para tareas de agarre y colocación repetitivas dentro de la distribución de entrenamiento, siempre que se valide primero la tasa de éxito.
- **Punto de partida para fine-tuning**: reutilizar los 292,7 M de parámetros como inicialización y ajustar con episodios propios de una tarea concreta, aprovechando que el coste de entrenamiento de una política de este tamaño es asumible en una sola GPU.
- **Docencia y demostraciones de imitación robótica**: ilustrar el ciclo completo teleoperación → dataset → entrenamiento de diffusion policy → despliegue en un brazo de bajo coste tipo SO-101.
- **Evaluación comparativa de familias de políticas**: contrastar una diffusion policy frente a una política ACT entrenada con los mismos episodios para medir diferencias de suavidad de trayectoria, latencia y robustez ante cambios de iluminación.
- **Pruebas de integración en simulación**: ejecutar la política en un gemelo simulado del SO-101 para detectar problemas de formato de observación o de normalización antes de tocar hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, error de posición final, número de episodios de evaluación ni comparaciones con otras políticas. Tampoco hay métricas de latencia por paso de inferencia medida en hardware concreto.

## Requisitos de hardware

- **Peso del checkpoint**: 292,7 M de parámetros en safetensors; el repositorio ocupa 1,2 GB, consistente con almacenamiento en fp32 (≈1,17 GB solo de pesos). En fp16 los pesos bajarían a ≈0,55 GB (estimación, no confirmada por el autor).
- **VRAM estimada para inferencia**: el peso de los tensores no es el factor limitante, sino las activaciones de tres flujos de cámara y los pasos iterativos de difusión. Estimación razonable de 2-4 GB con batch 1; no hay medición publicada.
- **GPU recomendadas**: cualquiera con ≥8 GB resulta holgada para este tamaño (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). Una GPU de 4-6 GB podría bastar reduciendo resolución de entrada o número de pasos de difusión, pero no está verificado.
- **Cabe en GPU de consumo**: sí, previsiblemente en RTX 3060/4060 y superiores. No se ha confirmado el rendimiento en iGPU ni en Jetson.
- **CPU**: la inferencia en CPU es técnicamente posible al ser un modelo pequeño, pero sostener 20 fps (50 ms por paso de control) con varios pasos de difusión es dudoso; no hay datos.
- **Opciones de despliegue**: LeRobot sobre PyTorch es la vía documentada (`--policy.path=<repo>`). vLLM, llama.cpp, Ollama y TGI no aplican: no son servidores para políticas robóticas.
- **Latencia y throughput**: no disponibles. Como referencia del presupuesto temporal, el bucle de control a 20 fps deja 50 ms por acción, incluyendo el tiempo de captura de las tres cámaras y el proceso de difusión.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| betidestudio/so101-test-2bl3lj | Diffusion policy para SO-101 | 292,7 M | no disponible (no aplica) | no disponible | Hugging Face, 0 descargas |
| hidetokazawa/so101_test_model | Politica para SO-101 (LeRobot) | no disponible | no disponible (no aplica) | no disponible | Hugging Face |
| aaron-ser/SO101-Model | Politica para SO-101 (LeRobot) | no disponible | no disponible (no aplica) | no disponible | Hugging Face |
| Politica ACT (LeRobot) | Politica de imitacion por transformer | no disponible | no disponible (no aplica) | no disponible | Implementada en LeRobot; se entrena con episodios propios |

Los tres repositorios de SO-101 localizados comparten el mismo patrón: publicaciones de prueba sin ficha técnica detallada, sin licencia declarada y sin métricas. La comparación cuantitativa no es posible con la información disponible; la elección entre diffusion policy y ACT depende de si se prioriza modelar acciones multimodales (difusión) o un mapeo directo y de menor coste de inferencia (ACT), extremo que este repositorio no documenta.

## Limitaciones y advertencias

- **Ausencia de licencia**: no se declara licencia, por lo que no hay permiso explícito de uso comercial ni de redistribución. Tratarlo como no apto para producción hasta aclararlo con el autor.
- **Modelo de prueba**: el nombre del repositorio y los metadatos (0 descargas, publicación instantánea) sugieren un checkpoint de validación del pipeline, no un modelo validado en tareas reales.
- **Sin métricas de éxito**: no hay evidencia publicada de que la política complete ninguna tarea; el rendimiento en el mundo real es desconocido.
- **Riesgo de generalización limitada**: como toda política de imitación, se espera degradación ante cambios de iluminación, fondo, posición inicial del brazo u objetos fuera de la distribución de entrenamiento.
- **Sesgo de datos de teleoperación**: hereda los sesgos del operador que grabó los episodios (trayectorias, velocidad, puntos de agarre), no documentados.
- **Acoplamiento al hardware**: la configuración de tres cámaras y la frecuencia de 20 fps forman parte del contrato de observación; usar otra disposición o otra frecuencia invalida la política.
- **Sin soporte de lenguaje**: no puede interpretar instrucciones en lenguaje natural ni planificar; requiere un sistema externo para la capa de alto nivel.
- **Latencia no medida**: el número de pasos de difusión condiciona directamente el tiempo por acción; si supera los 50 ms, no se sostienen los 20 fps declarados.
- **Documentación incompleta**: sin datos de dataset, preprocesado, normalización ni pasos de difusión, la reproducibilidad del entrenamiento no está garantizada.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/betidestudio/so101-test-2bl3lj
- Modelo similar en Hugging Face (hidetokazawa): https://huggingface.co/hidetokazawa/so101_test_model
- Modelo similar en Hugging Face (aaron-ser): https://huggingface.co/aaron-ser/SO101-Model
- Tutorial de NVIDIA Isaac sobre sim-to-real con SO-101 y modelos visión-lenguaje-acción: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Vídeo sobre flujo de trabajo sin código con LeLab y SO-101: https://www.youtube.com/watch?v=7tGT8hqRSAo
