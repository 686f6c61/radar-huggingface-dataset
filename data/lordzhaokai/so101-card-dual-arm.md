# LORDZHAOKAI/so101-card-dual-arm

## Resumen

SO-101 Card Dual-Arm es un repositorio de investigación en robótica que contiene políticas de control, entornos de simulación y modelos de robot para una célula de manipulación de naipes con dos brazos SO-101. Lo desarrolla el usuario LORDZHAOKAI y se publica bajo licencia MIT. No es un modelo de lenguaje: es un conjunto de políticas de aprendizaje por refuerzo (PPO) y de imitación (behaviour cloning con DART y DAgger) entrenadas exclusivamente en simulación MuJoCo.

La célula consta de dos brazos con tareas complementarias: un brazo de recogida con ventosa que localiza un naipe de 0,30 mm de grosor en una región de mesa de aproximadamente 45 × 12 cm, lo levanta y lo entrega en una pose fija de handover; y un brazo de volteo con pinza paralela y almohadillas finas de 25° que recibe el naipe, lo gira 180°, lo devuelve y se repliega a su pose de reposo.

Su relevancia es acotada pero concreta: documenta con métricas detalladas (tasas de éxito, penetración máxima, deslizamiento en la prueba de retención) un pipeline completo de entrenamiento por refuerzo con currículo y de imitación con DAgger para manipulación de objetos delgados y deformables en simulación. Todo el trabajo se ha realizado en MuJoCo; ninguna política se ha ejecutado en hardware real, y las dos políticas no se han probado conjuntamente en un mismo episodio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de control para robótica: PPO (Stable-Baselines3) para el brazo de recogida y behaviour cloning (DART + DAgger) para el brazo de volteo; entornos MuJoCo |
| Parametros totales | no disponible (no se especifica el tamaño de las redes neuronales de las políticas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos de Stable-Baselines3; el repositorio ocupa 0.0 GB según Hugging Face) |

## Arquitectura y entrenamiento

El sistema se compone de dos políticas independientes sobre brazos SO-101 simulados en MuJoCo. El brazo de recogida usa PPO de Stable-Baselines3 con un currículo de entrenamiento por fases (alcanzar, contacto lento con succión, levantar y transportar). Su espacio de acción consta de cinco canales de velocidad articular más un canal binario de succión. El brazo de volteo se entrena por clonación de comportamiento con DART y DAgger, usando un controlador de seguimiento de referencia para recoger datos, con un espacio de acción de seis incrementos de objetivo articular (cinco del brazo y uno de la mandíbula), escalados a 0,02 rad.

La simulación usa un paso físico de 0,5 ms y un periodo de control de 20 ms (40 subpasos). El naipe es un cuerpo rígido libre de 63 × 88 × 0,30 mm y 1,8 g bajo gravedad. La ventosa se modela como una restricción de soldadura que se activa cuando el vacío está encendido, la almohadilla toca el naipe, la inclinación es menor de 10° y toda la almohadilla de 14 mm apoya sobre la cara del naipe; se libera al apagar el vacío o si la carga supera 4 N / 0,02 Nm. Existen terminaciones duras de seguridad por penetración del naipe superior a 50 µm, sobrepaso de límites articulares superior a 0,01 rad, colisiones brazo-brazo o brazo-mesa, apoyo del naipe en algo distinto de almohadillas o ventosa, y caída del naipe.

## Capacidades

- Manipulación de objetos delgados: recogida de un naipe de 0,30 mm desde cualquier punto de una región alcanzable de aproximadamente 45 × 12 cm.
- Control de succión modelado físicamente, con criterios explícitos de sellado y liberación por carga.
- Transporte y entrega en una pose fija de handover con tolerancias de 5 mm de error de punto de succión, 5° de orientación y velocidad del naipe inferior a 2 cm/s mantenida 0,5 s.
- Volteo de 180° de un naipe sujeto por otro brazo, con retorno a la pose de reposo.
- Retención pasiva verificada: el naipe permanece adherido a la ventosa durante 5 s con la política desactivada.
- Entrenamiento por refuerzo con currículo y por imitación con DART/DAgger.
- Evaluación reproducible con episodios deterministas y estocásticos y registro de métricas.
- No incluye capacidades de lenguaje, visión, audio ni tool calling.

## Casos de uso

- Investigación en manipulación de objetos delgados: sirve como banco de pruebas reproducible en MuJoCo para estudiar el agarre por succión de objetos de 0,30 mm con criterios de sellado y liberación bien definidos.
- Estudio de currículos de RL: el pipeline de entrenamiento por fases del brazo de recogida (alcanzar, contacto, levantar, transportar) puede reutilizarse como referencia para diseñar currículos en tareas de pick-and-place.
- Comparación de RL frente a imitación: el repositorio ofrece dos políticas con paradigmas distintos (PPO y BC con DAgger) sobre brazos idénticos, lo que permite comparar estabilidad, tasas de éxito y coste de datos.
- Prototipado de células duales: los escenarios MJCF (gripper + gripper y succión + gripper) permiten experimentar con coordinación de dos brazos antes de comprometer hardware.
- Docencia en robótica: los scripts de entrenamiento y evaluación, junto con las métricas documentadas, permiten montar prácticas sobre simulación física, control articular y modelado de contacto.
- Validación de modelos de agarre: el modelo de ventosa como restricción de soldadura con límites de carga (4 N / 0,02 Nm) puede adaptarse para probar supuestos de agarre en otras tareas de manipulación.
- Reproducción de resultados: los episodios deterministas con semillas documentadas (por ejemplo, la semilla 930001 para visualización) facilitan la verificación independiente de las cifras publicadas.

## Benchmarks y rendimiento

Resultados en simulación, con cada modelo recargado desde disco y actuando de forma autónoma, sin inyección de estado ni tomas de control scriptadas.

| Tarea | Configuracion | Resultado |
|---|---|---|
| Brazo de recogida | 100 episodios deterministas, naipe uniforme en la región, penetración máx. 50 µm | 98/100 éxitos completos (1 timeout, 1 caída); penetración máxima 44 µm |
| Brazo de recogida | Política estocástica, 20 episodios | 19/20 éxitos |
| Brazo de recogida | Prueba de retención con política desactivada 5 s | 96/96 naipes retenidos; deslizamiento ≤ 0,009 mm / 0,07° |
| Brazo de volteo | Semillas reservadas (9000+), 1 determinista + 40 estocásticos | 41/41 éxitos completos |
| Brazo de volteo | Longitud de episodio | 1713–1767 pasos de control (≈ 35 s); penetración máxima 37 µm |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otras políticas de manipulación.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni de GPU en la información disponible; las políticas son de tamaño reducido (repositorio de 0,0 GB en Hugging Face) y probablemente ejecutables en CPU, aunque este dato no se confirma.
- El cuello de botella es la simulación MuJoCo: paso físico de 0,5 ms con 40 subpasos por periodo de control, lo que exige CPU con buen rendimiento monohilo para evaluación en tiempo real.
- No se documentan GPU recomendadas (A100, H100, RTX 4090) ni latencias o throughput medidos.
- Despliegue: scripts propios sobre Stable-Baselines3 y MuJoCo; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Para visualización se usa el visor de MuJoCo mediante `eval_pick_arm.py --view <semilla>`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de manipulación, repositorios de robótica equivalentes ni referencias a trabajos relacionados con métricas comparables.

## Limitaciones y advertencias

- Todo el trabajo es exclusivamente en simulación MuJoCo; ninguna política se ha ejecutado en hardware real, por lo que la transferencia al mundo físico (sim-to-real) no está validada.
- Las dos políticas no se han ejecutado conjuntamente en un mismo episodio: los vídeos de recogida y volteo provienen de escenas separadas.
- El repositorio no incluye datos de sesgos, alucinación ni comportamiento lingüístico porque no es un modelo de lenguaje; esas categorías no aplican.
- Los resultados documentados (98/100 y 41/41) corresponden a las condiciones de simulación descritas; cambios en el modelo de contacto, la masa del naipe o el modelo de ventosa pueden alterar el rendimiento.
- El modelo de ventosa como restricción de soldadura es una simplificación física; no captura efectos como fugas parciales, deformación de la almohadilla o dinámica del aire.
- El repositorio aparece con 0 descargas y 0 likes y un tamaño de 0,0 GB en Hugging Face, lo que sugiere que los artefactos binarios podrían no estar alojados o que el paquete está incompleto; conviene verificar la disponibilidad de `models/` y `media/` antes de confiar en la reproducibilidad.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no se ofrece ninguna garantía sobre el comportamiento en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LORDZHAOKAI/so101-card-dual-arm
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código o demos externas.
