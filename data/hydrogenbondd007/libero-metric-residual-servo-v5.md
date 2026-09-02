# hydrogenbondd007/libero-metric-residual-servo-v5

## Resumen

`libero-metric-residual-servo-v5` es un modelo de robótica desarrollado por hydrogenbondd007 que aprende un residual de movimiento (motion residual) para un controlador PI cartesiano determinista. Con solo 112.394 parámetros, mapea 44 características de estado y controlador a seis correcciones de movimiento acotadas a ±0,1 unidades normalizadas, funcionando a 20 Hz. El modelo está diseñado para el benchmark de manipulación LIBERO con el brazo Panda, y su objetivo es mejorar el seguimiento de trayectorias del controlador analítico sin reemplazarlo.

La versión v5.2-seed3 incorpora un proyector de autoridad ortogonal con compuerta de contacto: en espacio libre, el residual solo puede modificar la velocidad a lo largo de la dirección de error comandada; en contextos de contacto (agarre, manipulación, liberación), también puede alterar la trayectoria con un límite de 0,05 unidades. El modelo es parte de una línea de trabajo que combina control clásico con aprendizaje automático, priorizando la seguridad y la interpretabilidad sobre el rendimiento bruto.

Este modelo es relevante porque demuestra un enfoque híbrido donde un componente aprendido de tamaño mínimo complementa un controlador analítico, en lugar de sustituirlo. Su arquitectura es un MLP con capas ocultas de 256, 256 y 128 neuronas, activación SiLU y normalización por capas. El repositorio incluye el runtime de referencia completo, aunque el modelo crudo no es directamente ejecutable sin el proyector y el controlador asociados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (256-256-128) con SiLU y LayerNorm |
| Parametros totales | 112.394 (safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa (MLP) con tres capas ocultas de 256, 256 y 128 neuronas, activación SiLU y normalización por capas. Recibe 44 características que incluyen la pose actual del efector, estado de la pinza, velocidad cartesiana, error de pose relativo 6D, acción analítica, semántica de fase/pinza, tolerancias, velocidad y contacto esperado. La salida son seis residuales de movimiento acotados a ±0,1 unidades normalizadas, que se combinan con la salida del controlador PI analítico mediante un proyector específico de la versión v5.2.

El entrenamiento se realizó sobre el dataset `physical-intelligence/libero` (revisión `20f6ab338acbb455b4215db2ed5f7f1ad855f036`), utilizando 30 de las 40 identidades de tarea fuente, excluyendo las diez tareas exactas de LIBERO Goal como holdout. Se usaron 1.149 episodios de entrenamiento (771.722 filas) y 116 episodios de validación (73.254 filas). La función de pérdida es smooth-L1 (β=0,05) entre la acción desplegada (residual crudo pasado por el transformador no-brake y el proyector v5.2) y el comando experto, más 0,01 × L2 sobre el residual crudo. Se empleó Adam con tasa de aprendizaje 3e-4, batch de 4096, 20 épocas en CPU, semilla 52003. La mejor época (18) se seleccionó por smooth-L1 de validación (0,084676).

Una innovación clave es el proyector de autoridad ortogonal con compuerta de contacto: en espacio libre el residual solo puede modificar la velocidad a lo largo de la dirección de error, mientras que en contextos de contacto puede alterar la trayectoria con un límite de 0,05 unidades. Además, se aplican comprobaciones de distribución fuera de distribución (OOD) que degradan al controlador analítico si las características están fuera del rango esperado.

## Capacidades

- Genera correcciones de movimiento residual para un controlador PI cartesiano, mejorando el seguimiento de trayectorias en tareas de manipulación.
- Soporta un modo de contacto semántico mediante el flag `expected_contact`, que activa la autoridad ortogonal limitada sobre la trayectoria.
- Opera a 20 Hz, adecuado para control en tiempo real.
- No genera comandos de pinza (gripper): esta parte es determinista y nunca aprendida.
- Integra comprobaciones OOD (semánticas y de características continuas) con degradación elegante al controlador analítico.
- Incluye un transformador "no-brake" que elimina residuales que se oponen al error de posición dentro de la tolerancia.
- Funciona exclusivamente dentro del runtime de referencia proporcionado; el tensor crudo no es directamente ejecutable.

## Casos de uso

- **Investigación en control híbrido analítico-aprendido**: el modelo sirve como banco de pruebas para estudiar cómo un residual aprendido puede mejorar un controlador clásico sin comprometer la estabilidad. Su pequeño tamaño permite experimentos rápidos en CPU.
- **Ajuste fino de trayectorias en simulación LIBERO**: puede integrarse en pipelines de evaluación de LIBERO para reducir el error de seguimiento en tareas de manipulación, especialmente en escenarios con contacto semántico (agarre, liberación).
- **Validación de políticas residuales en robótica**: el diseño con proyector de autoridad y compuerta de contacto permite probar estrategias de intervención mínima sobre controladores existentes.
- **Benchmarking de controladores en entornos simulados**: al comparar el rendimiento del controlador PI analítico con y sin el residual, los investigadores pueden cuantificar el beneficio del componente aprendido en métricas como AUC de error de pose o MAE de acción.
- **Prototipado de sistemas de control con degradación segura**: las comprobaciones OOD y el mínimo progreso garantizado (≥50% del progreso analítico) hacen que el modelo sea adecuado para experimentos donde se requiere un comportamiento predecible ante entradas novedosas.
- **Educación en robótica y aprendizaje por refuerzo**: el código y el runtime documentado ofrecen un ejemplo concreto de cómo combinar control clásico con aprendizaje supervisado para problemas de manipulación.

## Benchmarks y rendimiento

Los resultados publicados se limitan a dos tipos de evaluación: imitación open-loop sobre episodios holdout y un microbenchmark de seguimiento de controlador. No se han publicado resultados de éxito de tarea end-to-end ni pruebas en robot real.

**Imitación open-loop (116 episodios, 73.254 filas, MAE de movimiento desplegado)**

| Controlador | Motion MAE | vs analítico |
|---|---|---:|
| Analítico PI | 0,11436 | — |
| Analítico PI + v5-formal (predecesor) | 0,10149 | +11,25 % |
| **Analítico PI + v5.2-seed3** | **0,10097** | **+11,71 %** |

**Microbenchmark de seguimiento (escena holdout "put the bowl on the plate", 3 estados iniciales, 3 movimientos canónicos, 9 comparaciones)**

| Métrica | v5.2-seed3 vs analítico |
|---|---:|
| Mejora media de AUC | +10,71 % |
| Victorias | 9/9 |
| Mejora en traslación | +7,09 % |
| Mejora en rotación | +17,73 % |

El predecesor v5-formal falló el criterio de no inferioridad por tipo de movimiento (regresión en traslación de −1,43 % y −5,52 % en trasladar-y-cerrar), por lo que fue descartado como artefacto principal. Los resultados se recomputaron el 2026-09-02 desde el checkpoint y coinciden con el registro de entrenamiento.

## Requisitos de hardware

- **VRAM**: no requiere GPU; el modelo tiene 112.394 parámetros y puede ejecutarse en CPU con menos de 1 MB de memoria.
- **GPU recomendada**: ninguna. El entrenamiento se realizó en CPU (20 épocas, batch 4096).
- **Compatibilidad con hardware de consumo**: sí, cualquier procesador moderno es suficiente; el cuello de botella está en el controlador PI y el runtime, no en el modelo.
- **Opciones de despliegue**: el repositorio incluye un runtime de referencia (`reference_runtime/v51.py`) con flags `USE_V51=1 V52_CONTACT_GATED_ORTH=1`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: a 20 Hz de control, la inferencia del MLP es despreciable frente al coste del controlador analítico. No se han publicado cifras exactas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **libero-metric-residual-servo-v5** | 112.394 | Residual MLP + controlador PI | 44 features, 20 Hz | Apache-2.0 | HuggingFace |
| libero-metric-action-decoder-v2 | no disponible | Action decoder transformer | no disponible | Apache-2.0 | HuggingFace |
| Controlador PI analítico (baseline) | 0 | Analítico determinista | 6D pose error | — | Incluido en runtime |

El modelo se compara principalmente contra su predecesor v2 (que usa una arquitectura diferente, tipo action-decoder transformer) y contra el controlador analítico puro. No hay otros modelos de la misma categoría con métricas públicas comparables en el momento de la consulta.

## Limitaciones y advertencias

- **Sin métricas de éxito de tarea end-to-end**: el autor declara explícitamente que no se ha medido el éxito de tarea con un planificador en el bucle. No debe usarse como un sistema completo de manipulación.
- **Sin validación en robot real**: no hay ninguna afirmación sobre robustez al contacto o comportamiento en hardware físico.
- **Dependencia del runtime**: el tensor crudo no es ejecutable por sí solo; requiere el proyector v5.2 y el controlador PI del repositorio. Desplegarlo fuera de ese contexto puede producir acciones inválidas.
- **Alcance limitado de la mejora**: la ganancia medida se restringe a una escena LIBERO Goal concreta y tres movimientos canónicos. No hay evidencia de generalización a otras tareas o entornos.
- **Semántica de contacto**: el flag `expected_contact` es una entrada semántica del subgoal, no una señal de contacto sensada. Si el subgoal es incorrecto, la autoridad ortogonal puede activarse inadecuadamente.
- **Riesgo de sobreajuste**: el entrenamiento se realizó en 30 tareas de LIBERO con un dataset fijo; el rendimiento en tareas novedosas no está garantizado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el dataset LIBERO tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hydrogenbondd007/libero-metric-residual-servo-v5
- Predecesor v2: https://huggingface.co/hydrogenbondd007/libero-metric-action-decoder-v2
- Dataset LIBERO: https://huggingface.co/datasets/physical-intelligence/libero
- Benchmark LIBERO (GitHub): https://github.com/Lifelong-Robot-Learning/LIBERO
- Análisis de robustez LIBERO-Plus: https://sylvestf.github.io/LIBERO-plus/
