# bhatvineet/sharpa-dexmimicgen-upright-ppo

## Resumen

Sharpa-DexMimicGen upright HOPE-can grasp residual PPO es un checkpoint de aprendizaje por refuerzo publicado por el usuario bhatvineet en HuggingFace. No es un modelo de lenguaje: es una política de control robótico entrenada con Stable-Baselines3 mediante PPO, que aplica ajustes residuales sobre una primitiva de agarre scripted para levantar una lata (objeto HOPE) en posición vertical. El entorno de entrenamiento es MacroResidualGraspEnv(repeat=10, pitch_prior=0.7) sobre MuJoCo, con un brazo Franka Panda y una mano Wave.

La política observa 125 floats privilegiados normalizados (pose y velocidad de la lata, contactos de yema simulados, estado del robot y error respecto al objetivo nominal) y emite 8 residuales acotados de muñeca y dedos. No procesa cámara ni imágenes. El entrenamiento acumuló 5.120 macro-decisiones (1.024 en una primera fase y 4.096 en una segunda), tal como reflejan los ficheros training_phase1_config.json y training_phase2_config.json.

Su relevancia es acotada y experimental: demuestra que una política residual puede mejorar una primitiva scripted, con 98/100 agarres válidos frente a 70/100 de la referencia scripted en 100 resets de simulación. Sin embargo, se trata de evidencia exclusivamente simulada, con dinámicas estimadas fijas, y el autor advierte explícitamente de que no equivale a éxito en robot real ni en la tarea completa de pick-and-place.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Proximal Policy Optimization) con politica neuronal y accion residual sobre una primitiva de agarre scripted; no es transformer, MoE ni SSM |
| Parametros totales | no disponible (el autor no publica el recuento; tamano de repo 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; es una politica de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint PyTorch serializado en ZIP; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor indica que los terminos de redistribucion del checkpoint no tienen licencia permisiva asignada |
| Formato de pesos | ZIP de Stable-Baselines3 (residual_ppo.zip, serializacion PyTorch) mas vecnormalize.pkl |
| Entorno de ejecucion | MacroResidualGraspEnv(repeat=10, pitch_prior=0.7) sobre MuJoCo |
| Espacio de observacion | 125 floats privilegiados normalizados (pose/velocidad de la lata, contactos de yema simulados, estado del robot, error respecto al objetivo nominal) |
| Espacio de accion | 8 residuales acotados de muneca y dedos |
| Presupuesto de entrenamiento | 5.120 macro-decisiones acumuladas (1.024 + 4.096 en ejecuciones separadas) |
| Hardware robotico objetivo | Franka Panda con mano Wave |
| Objeto de evaluacion | hope_obj_001 (lata en posicion vertical) |

## Arquitectura y entrenamiento

La politica es un agente PPO de Stable-Baselines3 que opera como controlador residual: no genera la trayectoria de agarre desde cero, sino que corrige la salida de una plantilla scripted (template-53 Panda/Wave) que aporta los objetivos de agarre. El entorno agrupa las decisiones en macro-pasos (repeat=10), de modo que cada accion del agente se mantiene durante diez pasos de simulación. El agente actúa exclusivamente sobre muñeca y dedos (8 residuales acotados); el transporte a la bandeja y la liberación del objeto quedan fuera de su alcance y se ejecutan mediante una máquina de estados finitos scripted.

El entrenamiento se repartió en dos fases sumando 5.120 macro-decisiones y utiliza observaciones de estado privilegiado en lugar de percepción visual. El checkpoint es byte-idéntico a outputs/ppo_macro_pitch_expanded/last.zip del espacio de trabajo original, y exige cargarse junto al normalizador vecnormalize.pkl correspondiente; el autor advierte de que no debe usarse otro normalizador ni activar la normalización de recompensa. Como innovación destacable, el esquema combina una primitiva scripted fiable con un ajuste residual aprendido, lo que permite comparar de forma controlada el efecto del aprendizaje frente a la referencia fija con pitch de muñeca +0.7.

## Capacidades

- Control residual de agarre y elevación en vertical de una lata simulada, con 98/100 de éxito en el conjunto de 100 resets retenidos.
- Percepción basada en estado privilegiado (125 floats): no dispone de entrada de cámara ni de visión por computador.
- Generación de 8 residuales acotados sobre muñeca y dedos; no controla la pinza completa ni el transporte al contenedor.
- Corrección de una primitiva scripted subóptima: 28 rescates y 0 pérdidas emparejadas frente a la referencia scripted.
- Robustez limitada a variaciones de yaw de la lata de ±0.3 rad y a un rango estrecho de muestreo XY en la evaluación principal.
- No soporta tool calling, agentes de múltiples pasos, capacidades multilingües ni modos de razonamiento tipo thinking; son capacidades ajenas a su naturaleza.
- Requiere obligatoriamente el normalizador vecnormalize.pkl emparejado para funcionar.

## Casos de uso

- Investigación en aprendizaje por refuerzo residual: sirve como caso reproducible de cómo una política PPO puede corregir una primitiva scripted, con comparación directa 98/100 frente a 70/100 en el mismo conjunto de semillas.
- Estudio de sim-to-real en manipulación: la política permite analizar qué parte del rendimiento depende de la dinámica estimada fija usada en la evaluación, aunque el propio autor advierte de que masa, fricción, contactos y calibración de cámara siguen siendo provisionales.
- Generación de trazas de demostración: el fichero robot_action_pilot2.zip incluye dos trazas numéricas completas de pick-to-bin (2 × 1.141 pasos) que pueden reutilizarse como datos de referencia o para imitación.
- Ablación de percepción privilegiada frente a percepción visual: al no usar cámara, es un punto de comparación natural para medir la brecha respecto a políticas basadas en imagen.
- Validación de pipelines de evaluación en MuJoCo: los JSON de resultados por semilla (grasp_heldout_100.json) permiten reproducir la evaluación y detectar sensibilidad al runtime, como la variación de 70/100 a 69/100 observada al reevaluar en CPU.
- Pruebas de integración de Stable-Baselines3 en entornos robóticos: útil para verificar la carga correcta del par checkpoint + vecnormalize.pkl y la gestión de hashes mediante SHA256SUMS.
- Benchmark interno de primitivas scripted: la comparación con la referencia de pitch +0.7 proporciona una línea base para calibrar futuras variantes de control.

## Benchmarks y rendimiento

| Escenario | Metrica | Residual PPO | Primitiva scripted (+0.7) |
|---|---|---|---|
| Escena de evaluacion, 100 resets retenidos, yaw ±0.3 rad, X∈[−0.13,−0.07], Y∈[−0.20,−0.14] m | Agarre y elevacion vertical correctos | 98/100 | 70/100 |
| Re-evaluacion en CPU sobre los mismos 100 seeds | Agarre y elevacion vertical correctos | 98/100 | 69/100 |
| Comparacion emparejada | Rescates / perdidas | 28 / 0 | no disponible |
| Piloto FSM en escena nueva, rango XY estrecho | Exito de tarea | no disponible (se reporta 10/10 en conjunto) | no disponible |
| Piloto FSM en escena nueva, rango XY amplio (X∈[−0.18,−0.02], Y∈[−0.29,−0.05] m) | Exito de tarea | 21/30 | no disponible |
| Suavidad de cambio de accion | Estadistica de variacion | ligeramente peor que la primitiva scripted | mejor que el PPO |

Criterios de aceptacion aplicados en la evaluacion de 100 resets: contacto opositor de almohadillas, elevacion superior a 10 cm, inclinacion del eje de la lata igual o inferior a 15 grados, deriva y penetracion limitadas y mantenimiento sostenido del agarre. Los 21 agarres aceptados del piloto de escena nueva se completaron hacia la bandeja mediante scripting. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; la red es una politica PPO de tipo MLP de tamano reducido y la re-evaluacion reportada se ejecuto integramente en CPU.
- GPU recomendadas: no se especifica ninguna; no es necesario acelerador para la inferencia.
- Cabe en GPU de consumo: si, y tambien en CPU; el cuello de botella es la simulacion MuJoCo, no la politica.
- Opciones de despliegue: Stable-Baselines3 sobre Python con entorno conda (source_bundle.zip documenta el entorno y las pruebas); no se contemplan vLLM, llama.cpp, Ollama ni TGI por no ser un modelo generativo de texto.
- Dependencias obligatorias: MuJoCo, activos externos del robot Franka Panda y de la mano Wave, mallas HOPE y la primitiva scripted template-53, no incluidos en el repositorio.
- Latencia y throughput: no disponible; no se publican mediciones de latencia ni de frecuencia de control.
- Almacenamiento: el repositorio ocupa 0.0 GB; los ficheros auxiliares relevantes son residual_ppo.zip, vecnormalize.pkl, SHA256SUMS, source_bundle.zip y robot_action_pilot2.zip (aproximadamente 1 MB).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en agarre vertical | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sharpa-DexMimicGen upright HOPE-can grasp residual PPO | PPO con accion residual | no disponible | no aplica | 98/100 en 100 resets | no disponible | publico en HuggingFace |
| Primitiva scripted con pitch de muneca +0.7 | Controlador scripted | no aplica | no aplica | 70/100 (69/100 en CPU) | no disponible | definida en el codigo del autor |
| DexMimicGen (suite de generacion de demostraciones) | Framework de datos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de otros checkpoints de agarre publicados con la misma tarea, el mismo objeto HOPE ni identicas condiciones de evaluacion, por lo que la comparacion con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- El propio autor advierte de que el 98/100 no implica un 98 por ciento de exito en robot real ni en la tarea completa de pick-and-place.
- La evaluacion es exclusivamente en simulacion, con dinamicas estimadas fijas; masa, friccion, dinamica de contacto, montaje de la mano, calibracion de camara y cobertura del espacio de trabajo siguen siendo provisionales.
- El piloto en escena nueva con rango XY amplio solo alcanzo 21/30, con 4 colisiones o perturbaciones del setup scripted y 5 fallos de agarre del PPO.
- El rendimiento depende del rango de muestreo XY: funciona bien en el rango estrecho de la evaluacion principal (X∈[−0.13,−0.07], Y∈[−0.20,−0.14] m) y se degrada fuera de el.
- La estadistica de suavidad de cambio de accion del PPO es ligeramente peor que la de la primitiva scripted, pese a mejorar el rendimiento de agarre.
- El modelo no controla el transporte a la bandeja ni la liberacion del objeto: ambas acciones estan scripted en la maquina de estados finitos.
- No procesa imagenes ni dispone de percepcion visual; depende de estado privilegiado simulado no disponible en un robot real sin instrumentacion equivalente.
- El checkpoint no es ejecutable sin los activos externos del robot y los objetos (mallas HOPE, descripciones de la mano Wave, plantilla scripted) y sin el fichero vecnormalize.pkl exacto; cargarlo con otro normalizador o con normalizacion de recompensa produce resultados invalidos.
- La licencia de redistribucion del checkpoint no esta asignada de forma permisiva; la disponibilidad publica no relicencia los objetos HOPE, las mallas Wave ni activos de terceros. Verificar permisos antes de redistribuir activos o imagenes y antes de cualquier uso comercial.
- El dataset con las dos demostraciones RGB completas (pickbin pilot) esta alojado en un repositorio privado pendiente de revision de redistribucion de imagenes.
- Riesgo de seguridad: la deserializacion de checkpoints ZIP de Stable-Baselines3 o PyTorch puede ejecutar codigo; el autor recomienda verificar los hashes de SHA256SUMS y descargar solo desde una fuente de confianza.
- Los sesgos conocidos del modelo no se documentan en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhatvineet/sharpa-dexmimicgen-upright-ppo
- Dataset piloto pickbin (privado, pendiente de revision de redistribucion): https://huggingface.co/datasets/bhatvineet/sharpa-dexmimicgen-pickbin-pilot
- Resultados detallados por semilla: results/grasp_heldout_100.json (en el hub del modelo)
- Re-evaluacion en CPU: ../results/conda_grasp_heldout_100.json (en el checkout local de codigo)
- Repositorio de codigo y entorno conda: source_bundle.zip (incluido en el repositorio del modelo)
- Ficheros de configuracion de entrenamiento: training_phase1_config.json y training_phase2_config.json
- Hashes de integridad: SHA256SUMS
- Paper, blog o demo adicionales: no disponible
