# Nadeem-Shoukath115113/spiral-so101-rlt-s3-r1-demos57-corr-b30-bs32-5k

## Resumen

SPIRAL on RLT stage 3 — round 1 es una política robótica residual entrenada sobre un modelo base congelado pi0.5 combinado con una política RLT. La desarrolla el usuario de HuggingFace Nadeem-Shoukath115113 y se publica bajo licencia Apache 2.0. No se trata de un modelo de lenguaje, sino de un sistema de control para el robot SO101, orientado a tareas de manipulación mediante aprendizaje por imitación y refuerzo residual.

El modelo implementa el algoritmo descrito como Algorithm 1, Stage 2b del artículo de referencia: parte de 57 demostraciones de teleoperación revisadas (18.189 fotogramas) etiquetadas por un modelo de recompensa RM1 (SARM2, `sarm2_gripper58`), y aplica una única actualización SPIRAL offline. Sobre la política base se añade un actor residual y un conjunto (ensemble) de 5 críticos, con horizonte de acción de 20 pasos y regularizador de comportamiento (beta) de 30.

Su relevancia radica en que ejemplifica el patrón de entrenamiento residual-RL sobre políticas fundacionales de robótica congeladas, un enfoque habitual para adaptar políticas preentrenadas a tareas concretas sin reentrenar toda la red. La model card advierte explícitamente de que el modelo no ha sido evaluado en robot real y de que requiere la política base (no incluida) para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor residual + ensemble de 5 críticos sobre política pi0.5 + RLT congelada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (horizonte de acción de 20 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (se menciona `action_cholesky.npy` como matriz de ruido) |

Datos adicionales de entrenamiento indicados en la model card:

| Hiperparametro | Valor |
|---|---|
| Datos | 57 demostraciones de teleoperación revisadas, 18.189 fotogramas |
| Etiquetado | SARM2 RM1 (`sarm2_gripper58`), stride 15, suavizador monótono |
| Caracteristicas de entrada | RLT z_rl (2048) + estado (32) = 2080 |
| Horizonte de accion | 20 |
| Beta (regularizador BC) | 30 |
| Objetivo de critico | 0,5 MC + 0,5 TD, gamma 0,9995 |
| Suavizado de objetivo | sigma 0,2, clip 0,5 |
| kappa / criticos / tau | 4 / 5 / 0,005 |
| lr actor / critico | 1e-4 / 3e-4 |
| Tamano de lote / pasos | 32 / 5.000 |
| Valor terminal | fijado a 1,0 (todas las demostraciones exitosas) |
| Ruido correlacionado | activado, beta 0,5 (`action_cholesky.npy` pre-shrunk) |

## Arquitectura y entrenamiento

La arquitectura es un actor residual que opera sobre una política base congelada compuesta por pi0.5 más RLT. El actor y los cinco críticos se entrenan sobre características de 2080 dimensiones (2048 de la representación RLT `z_rl` y 32 de estado). El crítico combina objetivo Monte Carlo y TD a partes iguales (0,5 / 0,5) con factor de descuento gamma de 0,9995 y suavizado de objetivo con sigma 0,2 y recorte de 0,5. El entrenamiento corresponde a la Fase 2b del algoritmo SPIRAL: las 57 demostraciones se etiquetan con el modelo de recompensa RM1 y después se aplica una única actualización offline de 5.000 pasos con lote de 32.

Una innovación destacable es el uso de ruido correlacionado con beta 0,5 en el muestreo de acciones, materializado en la matriz `action_cholesky.npy` pre-shrunk. La model card subraya que es imprescindible servir el modelo con esa misma matriz de Cholesky (`noise_cholesky_path=action_cholesky.npy`); de lo contrario la política muestrea ruido aleatorio plano contra un actor entrenado con ruido correlacionado, degradando el comportamiento de forma silenciosa. También se advierte de que debe usarse la matriz pre-shrunk incluida y no la matriz cruda del `norm_stats.json` de la política base.

## Capacidades

- Control robótico de manipulación para el robot SO101 (brazo tipo SO-100/101 de bajo coste).
- Ejecución de políticas residuales que refinan la salida de una política base pi0.5 + RLT congelada.
- Generación de trayectorias de acción con horizonte de 20 pasos.
- Muestreo de acciones con ruido correlacionado (matriz Cholesky pre-shrunk) para exploración coherente con el entrenamiento.
- Aprendizaje por imitación a partir de demostraciones de teleoperación etiquetadas por recompensa (RM1).
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, de visión ni de audio documentadas más allá de las inherentes a la política base.
- No se ha documentado un modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Investigación en aprendizaje por refuerzo residual: permite estudiar cómo un actor residual pequeño mejora una política fundacional congelada sin reentrenarla, usando la configuración exacta (beta 30, 5 críticos, kappa 4) documentada en la model card.
- Reproducción de experimentos SPIRAL: sirve como punto de partida para replicar la Fase 2b del artículo con 57 demostraciones y comparar variantes de etiquetado de recompensa.
- Manipulación robótica con SO101 en laboratorio: el modelo puede desplegarse sobre el brazo SO101 para ejecutar tareas de agarre y colocación aprendidas de las demostraciones de teleoperación.
- Evaluación de ruido correlacionado en políticas: permite analizar el impacto del muestreo con `action_cholesky.npy` frente al ruido plano, un caso de estudio útil para quienes trabajan con exploración en RL offline.
- Aprendizaje por imitación con modelos de recompensa: el flujo demostraciones → etiquetado RM1 → actualización SPIRAL es reutilizable para otras tareas de manipulación con pocas demostraciones.
- Base para fine-tuning adicional: al ser un actor residual sobre una política congelada, puede servir como inicialización para rondas posteriores (la model card lo etiqueta como "round 1") o para ampliar el conjunto de demostraciones.
- Estudio de ensembles de críticos: la configuración de 5 críticos con objetivo mixto MC/TD es un caso práctico para investigar la reducción de varianza en el crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Not robot-evaluated", por lo que no existen métricas de éxito en robot real ni comparativas numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo depende de la política base pi0.5 + RLT (`pi05-so101-rlt-chunk20-s3-dagger91-15fps-b32-15k`, step 14999), no incluida, cuyos requisitos tampoco se detallan.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje). El servicio requiere cargar la matriz `action_cholesky.npy` mediante el parámetro `noise_cholesky_path`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de la misma categoría (políticas residuales SPIRAL sobre SO101) con datos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en robot real ("Not robot-evaluated"), por lo que su rendimiento efectivo en hardware SO101 es desconocido.
- Requiere obligatoriamente la política base `Nadeem-Shoukath115113/pi05-so101-rlt-chunk20-s3-dagger91-15fps-b32-15k` (step 14999), que no está incluida en este repositorio. Sin ella el modelo no es funcional.
- Es imprescindible servir el modelo con la misma matriz de Cholesky (`noise_cholesky_path=action_cholesky.npy`, versión pre-shrunk). Usar ruido plano o la matriz cruda del `norm_stats.json` de la base degrada la política de forma silenciosa.
- Solo dispone de 57 demostraciones y 18.189 fotogramas, un volumen reducido que puede limitar la generalización a condiciones no vistas.
- El valor terminal está fijado a 1,0 asumiendo que todas las demostraciones tienen éxito; esto puede sesgar el crítico si en producción existen fallos.
- No se documentan sesgos ni limitaciones de idioma porque no es un modelo de lenguaje, pero tampoco se detallan sesgos específicos de la política.
- La licencia es Apache 2.0, que permite uso comercial, aunque no se aporta información sobre patentes, dependencias de terceros ni condiciones adicionales de la política base.
- No hay datos sobre riesgo de alucinación (concepto no aplicable a una política de control), pero sí existe riesgo de comportamientos erráticos fuera de distribución.
- No se especifican requisitos de hardware, cuantización ni formato de pesos, lo que dificulta planificar su despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-rlt-s3-r1-demos57-corr-b30-bs32-5k
- Política base requerida (no incluida): https://huggingface.co/Nadeem-Shoukath115113/pi05-so101-rlt-chunk20-s3-dagger91-15fps-b32-15k
- Artículo de referencia (Algorithm 1, Stage 2b): no disponible (la model card lo menciona pero no incluye enlace)
- Repositorio de código: no disponible
- Demos: no disponible
