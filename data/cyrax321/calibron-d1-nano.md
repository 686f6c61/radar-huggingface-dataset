# Cyrax321/calibron-d1-nano

## Resumen

`calibron-d1-nano` es un modelo de decisión de tamano muy reducido publicado por el usuario Cyrax321 en Hugging Face, primer miembro visible de la familia Calibron (`calibron-d1`). No es un modelo de lenguaje: es un modelo de decisión orientado a *offline reinforcement learning*, entrenado para predecir acciones a partir de estados y *return-to-go* (RTG) en trayectorias de benchmarks offline. Su arquitectura propia, denominada Calibron (Calibrated Adaptive Decision Engine), se configura con `d_model=96`, 2 capas, 4 cabezas de atención y una longitud de contexto de 20 pasos.

Con 348.682 parámetros, el modelo es varios órdenes de magnitud menor que cualquier LLM actual; su interes no reside en capacidades generativas, sino en servir como pieza compacta de "decision intelligence" con conciencia de incertidumbre, pensada para experimentacion con RL offline y para integrarse en bucles de decisión de bajo coste computacional. El autor lo presenta como parte de una familia por niveles (tier `nano`), lo que sugiere la existencia prevista de variantes mayores.

La relevancia actual es limitada pero concreta: el repo tiene 0 descargas y 0 likes en el momento de la consulta, no hay benchmarks publicados ni idiomas declarados, y la model card es escueta. Se trata, por tanto, de un artefacto de investigacion temprano y de nicho, no de un modelo listo para producción. Cualquier evaluacion debe hacerse con expectativas ajustadas y validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Calibron (Calibrated Adaptive Decision Engine), `d_model=96`, `n_layers=2`, `n_heads=4` |
| Parametros totales | 348.682 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 20 (pasos de trayectoria) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (libreria `decision-model`) |

## Arquitectura y entrenamiento

La arquitectura Calibron se describe en la model card únicamente mediante sus hiperparámetros: `d_model=96`, `n_layers=2`, `n_heads=4` y `context_len=20`. Esto es consistente con un transformer pequeño que consume secuencias de estados (vectores de dimensión 11 en el ejemplo de uso) junto con un *return-to-go* y produce una predicción de decisión. El nombre "Calibrated Adaptive Decision Engine" y la etiqueta `decision-intelligence` apuntan a un diseño orientado a la calibración de incertidumbre, aunque la model card no detalla el mecanismo concreto (no se especifica si hay cabezas de varianza, ensembles, dropout calibrado u otro esquema).

El entrenamiento es de RL offline sobre trayectorias de benchmarks: se completaron 35.000 pasos y la mejor pérdida de validación registrada es -2,360720. No se indica el número de tokens ni el volumen de trayectorias, la composición del dataset, ni si hubo etapas de ajuste tipo RLHF o DPO (poco probables en un modelo de decisión). Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal. El espacio de acciones es continuo (`Discrete Action Space: False`), lo que condiciona el tipo de entornos para los que fue diseñado.

## Capacidades

- Predicción de decisiones en entornos con espacio de acciones continuo a partir de pares (estado, return-to-go).
- Modelado de retornos condicionados: el modelo recibe el RTG como entrada, lo que permite condicionar la política a un nivel de rendimiento objetivo (esquema habitual en RL offline tipo Decision Transformer).
- Conciencia de incertidumbre declarada por el autor (familia "uncertainty-aware"), aunque sin detalles técnicos publicados sobre cómo se expone.
- Procesamiento de trayectorias cortas: ventana de 20 pasos, adecuada para tareas con horizonte limitado.
- Integración vía API Python (`calibron.inference.DecisionPredictor`) con arrays NumPy.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Experimentacion academica en RL offline: sirve como baseline minúsculo para comparar algoritmos de decisión condicionados por RTG en entornos de control continuo con horizontes de hasta 20 pasos.
- Prototipado rapido de políticas en entornos simulados de bajo dimensionalidad (estados de 11 dimensiones en el ejemplo oficial): permite iterar sobre pipelines de datos y evaluación sin coste de GPU.
- Control de sistemas embebidos o edge con presupuesto de memoria mínimo: con 348.682 parámetros, el modelo cabe en cualquier dispositivo y puede ejecutarse en CPU.
- Pruebas de calibración de incertidumbre: útil para validar metodologías de estimación de confianza en decisiones antes de escalar a modelos mayores de la misma familia.
- Generación de datos sintéticos de decisión: al condicionar por RTG, puede emplearse para muestrear trayectorias con retorno objetivo en estudios de *offline-to-online*.
- Componente de un ensemble o de un sistema jerárquico: por su tamano, puede actuar como módulo rápido de decisión dentro de arquitecturas mayores que deleguen en modelos más grandes las decisiones de alto nivel.
- Docencia: ejemplo compacto y legible para explicar Decision Transformers y RL offline en cursos o tutoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es la mejor pérdida de validación durante el entrenamiento (-2,360720), que no es comparable con métricas estandarizadas como MMLU, HumanEval o GSM8K (no aplicables a este tipo de modelo) ni con retornos normalizados en entornos D4RL u otros suites de RL offline, que no se reportan.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (348.682 parámetros × 4 bytes ≈ 1,4 MB de pesos, más overhead de activaciones y runtime de PyTorch).
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU sin problemas. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en cualquier GPU consumer e incluso en microcontroladores con suficiente RAM si se exporta a un runtime ligero.
- Opciones de despliegue: la model card solo documenta la libreria `calibron` (`DecisionPredictor.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; por el tamano, se espera latencia de microsegundos a milisegundos en CPU para lotes pequeños, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| calibron-d1-nano | 348.682 | 20 pasos | Modelo de decisión (RL offline) | AGPL-3.0 | Hugging Face, 0 descargas |
| Decision Transformer (referencia) | variable (del orden de 0,1-1 M en configuraciones pequenas) | 20-30 pasos | Modelo de decisión (RL offline) | MIT (implementación de referencia) | Repos públicos, ampliamente usado |
| Trajectory Transformer (referencia) | variable (mayor, del orden de millones) | cientos de pasos | Modelo de decisión (RL offline) | MIT | Repos públicos |
| Modelos de decisión de la familia Gato (referencia) | cientos de millones a miles de millones | cientos de tokens | Modelo generalista multi-tarea | no comercial | No público |

La comparación es aproximada: no hay datos de rendimiento de `calibron-d1-nano` frente a estas alternativas, y las cifras de los modelos de referencia varían según la implementación. La ventaja principal del modelo de Cyrax321 es su tamano extremo y su licencia AGPL-3.0 (copyleft fuerte, no apta para productos propietarios sin liberar el código).

## Limitaciones y advertencias

- Entrenado sobre benchmarks de trayectorias offline: la generalización fuera de la distribución depende por completo de la cobertura del dataset, que no se documenta.
- El autor advierte explícitamente de que no debe desplegarse en bucles de seguridad crítica sin validación específica de dominio.
- Ventana de contexto de solo 20 pasos, insuficiente para tareas con dependencias temporales largas.
- Espacio de acciones continuo: no apto para entornos discretos sin adaptación.
- Sin benchmarks publicados, sin idiomas declarados y con 0 descargas: no hay evidencia externa de calidad ni de robustez.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de predicciones mal calibradas fuera de distribución.
- Licencia AGPL-3.0: el uso comercial en servicios en red obliga a liberar el código fuente bajo la misma licencia; revisar implicaciones legales antes de integrarlo en productos.
- La model card no documenta sesgos, composición del dataset ni procesos de validación de calibración, lo que dificulta una auditoría seria.
- El pipeline en Hugging Face figura como "no disponible" y el repo tiene tamano 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o son de tamano despreciable; conviene verificar antes de depender del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyrax321/calibron-d1-nano
- No se han encontrado en la busqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
