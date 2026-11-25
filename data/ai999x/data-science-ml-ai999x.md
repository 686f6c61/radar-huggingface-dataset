# AI999X/data-science-ml-ai999x

## Resumen

`data-science-ml-ai999x` es un motor de cálculo determinista empaquetado y distribuido a través de Hugging Face por el autor AI999X. No es un modelo de lenguaje neuronal: es un solver compilado (Rust, con build puro en Python para plataformas no x86-64) que resuelve 107 cálculos de ciencia de datos y aprendizaje automático repartidos en 14 temas, devolviendo fórmula, pasos intermedios y unidades. El repositorio declara 4.715.520 parámetros en safetensors, un dato que corresponde a los pesos empaquetados del artefacto y no a una red transformer con capacidad generativa.

El propósito declarado es servir como ayuda para resolver ejercicios de métricas de evaluación, funciones de pérdida y gradientes, algoritmos clásicos, reducción de dimensionalidad, validación cruzada, teoría de la información y aritmética de redes neuronales, todo de forma offline y sin generación libre de texto. El autor enfatiza el modo "zero-hallucination": cuando una entrada falta o está fuera de rango, el motor devuelve una razón en lenguaje natural en lugar de un número inventado.

Su relevancia actual es acotada pero concreta: cubre el nicho de herramientas de cómputo verificable para docencia y validación de pipelines, donde un LLM generativo introduce riesgo de error aritmético. Se distribuye como aplicación de escritorio (Windows y Linux), CLI, build web y paquete de Python, con licencia Apache 2.0 y soporte exclusivo de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado (Rust); build puro en Python para macOS y ARM. No es un transformer generativo |
| Parámetros totales | 4.715.520 (según safetensors del repositorio) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto; resuelve cálculos individuales) |
| Tipos de cuantización | No disponible (no aplica a un motor determinista) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0.0 GB) |

## Arquitectura y entrenamiento

El artefacto no sigue una arquitectura de red neuronal entrenada con descenso de gradiente sobre corpus de texto. La model card describe "un motor compilado" con cuatro interfaces de acceso (app de escritorio, línea de comandos, navegador y paquete de Python) que implementa 107 cálculos organizados en 14 temas. Cada cálculo expone su fórmula, sus pasos y sus unidades, y el sistema devuelve una explicación en lenguaje natural cuando una entrada falta o queda fuera de rango.

No se documenta en la información disponible ningún proceso de entrenamiento, conjunto de datos, número de tokens, RLHF, DPO ni técnica de optimización tipo decodificación especulativa o atención lineal. El campo `inference: false` de la model card indica que el repositorio no está pensado para inferencia mediante las librerías estándar de Hugging Face (transformers, vLLM, etc.), sino que se consume a través de los binarios y el paquete `data-science-ml-ai999x` publicados por el autor.

## Capacidades

- Resolución de 107 cálculos de ciencia de datos y machine learning en 14 temas, con fórmula, pasos y unidades.
- Métricas de clasificación binaria a partir de recuentos de matriz de confusión.
- Métricas de regresión y de ranking.
- Funciones de pérdida y gradientes, incluida entropía cruzada binaria con logits y su gradiente.
- Algoritmos clásicos: k-means con centroides iniciales dados, regresión Lasso con alpha indicado, un paso de descenso de gradiente para regresión lineal.
- Reducción de dimensionalidad: análisis de componentes principales (varianza explicada y primera componente).
- Teoría de la información: información mutua ajustada entre dos agrupamientos.
- Aritmética de redes neuronales: atención de producto escalar escalada.
- Validación cruzada y particionado.
- Clasificación y regresión sobre datos tabulares.
- Devolución de una razón en lenguaje natural cuando falta una entrada o está fuera de rango (comportamiento "zero-hallucination" declarado por el autor).
- Ejecución totalmente offline en el equipo del usuario.
- Cuatro interfaces: app de escritorio (Windows, Linux), CLI `data-science-ml`, navegador y paquete de Python 3.10+.

No se documenta soporte de tool calling, function calling, razonamiento multi-paso sobre lenguaje natural, visión, audio ni modo thinking.

## Casos de uso

- Docencia de métricas de evaluación: el motor calcula precisión, recall, F1 y métricas derivadas de una matriz de confusión mostrando la fórmula y los pasos, lo que permite al alumnado verificar el resultado a mano sin depender de una generación libre.
- Validación de pipelines de ML: integrar el paquete de Python en tests unitarios para comprobar que las métricas implementadas en producción coinciden con un cálculo de referencia determinista.
- Reproducción de ejercicios de optimización: ejecutar un paso de descenso de gradiente para regresión lineal o calcular los coeficientes de Lasso con un alpha dado, obteniendo los pasos intermedios para auditar el resultado.
- Cálculo de información mutua ajustada entre dos agrupamientos: útil para comparar particiones de clustering en experimentos donde se necesita una referencia independiente del software de análisis.
- Análisis de componentes principales: obtener la varianza explicada y la primera componente con pasos explícitos para informes técnicos o material didáctico.
- Entornos sin conectividad: despliegue en aulas, laboratorios o máquinas aisladas mediante la app de escritorio o el binario CLI, sin llamadas a servicios externos.
- Verificación cruzada de resultados de librerías: contrastar la salida de scikit-learn u otras herramientas frente a un motor determinista con fórmula publicada, útil en revisión de código y auditoría de cuadernos.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el `model-index` de la model card. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (ciencia de datos y ML) | Golden answers (711 preguntas documentadas, Windows y Linux, Python 3.10-3.14) | Accuracy ("identical on every platform") | 1.0 | No (`verified: false`) |

El autor declara resultado idéntico en todas las plataformas probadas, pero la métrica figura como no verificada de forma independiente.

## Requisitos de hardware

- Al no ser un modelo generativo, no requiere VRAM dedicada para inferencia; el cálculo se ejecuta en CPU.
- El paquete x86-64 se distribuye como motor compilado; en macOS y ARM `pip` instala una build pura de Python que, según el autor, produce las mismas respuestas.
- No se especifican requisitos mínimos de CPU, RAM ni versiones de sistema operativo más allá de Windows, Linux y Python 3.10+.
- Opciones de despliegue: app de escritorio (Windows/Linux), CLI `data-science-ml`, build web en la página del modelo y paquete `pip install data-science-ml-ai999x`.
- No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de pesos transformer.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (solvers deterministas de ciencia de datos empaquetados como artefactos de Hugging Face). Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| data-science-ml-ai999x | 4.715.520 (safetensors) | No aplica | Apache 2.0 | Motor determinista de 107 cálculos |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones; solo resuelve los 107 cálculos documentados.
- Solo soporta inglés, tanto en la documentación como en las respuestas en lenguaje natural.
- El resultado de accuracy 1.0 del `model-index` está marcado como `verified: false`; procede del propio autor y no de una evaluación independiente.
- El recuento de 4.715.520 parámetros en safetensors no debe interpretarse como tamaño de una red neuronal entrenada; corresponde al artefacto empaquetado.
- `inference: false` en la model card: no es cargable con las librerías estándar de Hugging Face; hay que usar los binarios o el paquete Python del autor.
- El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los pesos reales se distribuyen fuera de Hugging Face (GitHub Releases y PyPI), con el riesgo de disponibilidad que ello implica.
- La build pura de Python en macOS y ARM puede tener rendimiento distinto al motor compilado, aunque el autor afirma paridad de respuestas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio por si añade condiciones adicionales.
- No se documentan sesgos, tasas de alucinación ni límites de contexto porque el artefacto no es generativo; el riesgo principal es de cobertura (cálculos no soportados) y de dependencia del mantenimiento por parte de un único autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AI999X/data-science-ml-ai999x
- Página del modelo con demo web: https://www.ai999x.com/models/data-science-ml-ai999x/
- Demo interactiva (sección de capacidades): https://www.ai999x.com/models/data-science-ml-ai999x/#capabilities
- Clip de demostración (MP4): https://www.ai999x.com/?ax_shot=data-science-ml-ai999x/clip.mp4
- App de escritorio Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-data-science-ml-1.6.7-windows-x86_64.zip
- App de escritorio Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-data-science-ml-1.6.7-linux-x86_64.tar.gz
- CLI Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Repositorio de escritorio: https://github.com/AI999X/ai999x-desktop
- Paquete de Python: `pip install data-science-ml-ai999x`
