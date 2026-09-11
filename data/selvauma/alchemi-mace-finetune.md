# Selvauma/alchemi-mace-finetune

## Resumen

Alchemi-mace-finetune es un potencial interatómico MACE entrenado mediante ajuste fino (fine-tune) a partir del modelo fundacional MACE-MP medium del Materials Project. Lo publica Selva Chandrasekaran Selvaraj (University of Illinois Chicago) como parte del trabajo de comparación LAMMPS frente a NVIDIA ALCHEMI, recogido en el repositorio `alchemi-deepmd`. El modelo está especializado en cinco elementos: Li, F, Cu, Sr y Sn, y su propósito es reproducir energías y fuerzas de referencia para simulaciones de dinámica molecular en esos sistemas.

El ajuste fino se realizó con MACE 0.3.15 en modo `finetune` sobre 87.053 configuraciones de entrenamiento y 9.672 de validación, con entrenamiento en GPU (CUDA 12.1). El autor lo publica con un estado explícitamente incompleto: el entrenamiento se detuvo en la época 44 tras unas 12 horas y nunca se generó el modelo final promediado con SWA ni compilado que MACE escribe al completar. Los dos checkpoints disponibles son instantáneas reales de mitad del entrenamiento, no una versión final.

Es relevante como ejemplo de fine-tune de un potencial fundacional para un subconjunto químico concreto y como artefacto reproducible dentro de un esfuerzo de benchmarking de motores de dinámica molecular. No obstante, sus métricas de error (RMSE de fuerza de 81,83 meV/Å en la época 44) y su estado de convergencia limitan su uso en producción sin un entrenamiento adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MACE (potencial interatómico basado en message passing con expansión de cúmulos atómicos), ajustado desde el checkpoint fundacional MACE-MP medium `20231203mace128L1_epoch199model` |
| Parámetros totales | No disponible (la model card no indica el recuento; deriva del checkpoint base MACE-MP medium) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; su equivalente operativo sería el radio de corte, no publicado) |
| Tipos de cuantización | No disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0, con advertencia del propio autor de que debe revisarse la licencia del modelo base MACE-MP antes de publicar o usar comercialmente |
| Formato de pesos | PyTorch (`.pt`); el proyecto incluye además exportaciones para LAMMPS/MLIAP de un modelo distinto, `mace_small` |
| Elementos cubiertos | Li, F, Cu, Sr, Sn (números atómicos 3, 9, 29, 38, 50) |
| Versión de MACE | 0.3.15 |
| Conjunto de entrenamiento | 87.053 configuraciones (energía + fuerzas) |
| Conjunto de validación | 9.672 configuraciones |
| Estado del entrenamiento | Incompleto, no convergido; detenido en la época 44 sin modelo final SWA ni compilado |
| Formato de entrenamiento | Modo `finetune` de MACE, GPU con CUDA 12.1 |

## Arquitectura y entrenamiento

MACE es un potencial interatómico de tipo message passing sobre expansión de cúmulos atómicos, con equivariancia respecto a rotaciones y traslaciones. Predice energía total y fuerzas atómicas por configuración, y sustituye a la evaluación de la energía potencial en simulaciones de dinámica molecular. Este repositorio no entrena desde cero: parte del modelo fundacional MACE-MP medium del Materials Project y aplica un ajuste fino supervisado con pares energía-fuerza, de modo que hereda el comportamiento general del fundacional y lo especializa en los cinco elementos indicados.

El entrenamiento se ejecutó con MACE 0.3.15 en modo `finetune`, sobre GPU con CUDA 12.1, con 87.053 configuraciones de entrenamiento y 9.672 de validación. El registro del run (`logs/mace_Cu_Sn_SrF2_Li_run-42.log`) muestra que el error de fuerza pasó de 84,30 meV/Å en la época 22 a 81,83 meV/Å en la época 44, es decir, una mejora modesta en unas 12 horas de cómputo. El autor señala explícitamente que conviene reanudar el entrenamiento antes de considerar el modelo terminado. No se documentan en la información disponible innovaciones técnicas adicionales como decodificación especulativa, atención lineal ni rutinas de RLHF/DPO, que en cualquier caso no aplican a un potencial interatómico.

## Capacidades

- Predicción de energía total y fuerzas atómicas para configuraciones de Li, F, Cu, Sr y Sn, en el rango de composiciones presente en los datos de ajuste (incluye SrF₂ y aleaciones Cu-Sn).
- Integración en dinámica molecular: el modelo está pensado para alimentar simulaciones MD de estos materiales.
- Despliegue en LAMMPS mediante exportaciones MLIAP (el proyecto mantiene los artefactos `mace_small_lammps.pt` y `mace_small_mliap_nocueq.pt`, aunque estos corresponden a un modelo de referencia distinto, no a este fine-tune).
- Uso como pieza de comparación frente a otros motores y potenciales (LAMMPS+MACE, LAMMPS+DeepMD, ALCHEMI+MACE, ALCHEMI+DeepMD) en el marco del benchmarking `alchemi-deepmd`.
- Escalado a sistemas de mayor tamaño que los abordables con DFT, al ser un potencial de aprendizaje automático.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: se limita a la predicción de propiedades potenciales; no incorpora visión, audio ni modo de razonamiento.

## Casos de uso

- Dinámica molecular de cobre y sus defectos: simulación de vacantes, dislocaciones y fronteras de grano en Cu a escalas de decenas de miles de átomos, aprovechando que el modelo se ha ajustado específicamente sobre configuraciones de Cu y sustituye la evaluación DFT por inferencia de red neuronal.
- Estudio de soldaduras libres de plomo basadas en Sn y aleaciones Cu-Sn: el modelo cubre ambos elementos, de modo que puede emplearse para explorar interfaces, fases intermetálicas y difusión en la intercara Cu/Sn.
- Materiales para baterías de litio: cálculo de energías de migración y barreras de difusión de Li en distintas matrices, un uso habitual de los potenciales interatómicos en el estudio de electrolitos sólidos y ánodos.
- Simulación de fluoruros de estroncio (SrF₂): exploración de propiedades estructurales y térmicas de este fluoruro, empleado en aplicaciones ópticas y como material de referencia en estudios de defectos.
- Cribado de configuraciones antes de un cálculo DFT: usar el potencial como prefiltro para descartar estructuras de alta energía y reservar el cálculo de primeros principios para las candidatas más prometedoras.
- Benchmarking de motores de dinámica molecular: comparar corrección numérica y rendimiento entre LAMMPS+MACE, LAMMPS+DeepMD, ALCHEMI+MACE y ALCHEMI+DeepMD sobre el mismo sistema y composición química, que es el objetivo declarado del repositorio `alchemi-deepmd`.
- Generación de trayectorias a mayor escala temporal que DFT: obtener trayectorias largas para estimar magnitudes derivadas (coeficientes de difusión, fluctuaciones) una vez el modelo haya convergido.
- Reproducción y continuación del ajuste fino: los checkpoints publicados sirven como punto de partida para reanudar el entrenamiento o para experimentar con estrategias de fine-tuning sobre potenciales fundacionales, dado que se documenta la configuración completa del run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al no tratarse de un modelo de lenguaje. La model card únicamente proporciona los errores de validación leídos directamente del registro de entrenamiento:

| Checkpoint | Época | RMSE de energía (meV/átomo) | RMSE de fuerza (meV/Å) |
|---|---|---|---|
| `model/mace_Cu_Sn_SrF2_Li_epoch44.pt` | 44 | 88,98 | 81,83 |
| `model/mace_Cu_Sn_SrF2_Li_epoch6.pt` | 6 | 89,09 | 89,43 |

Como referencia interna del propio run, el RMSE de fuerza en la época 22 era de 84,30 meV/Å, frente a 81,83 meV/Å en la época 44. No se proporcionan cifras comparativas con el modelo fundacional MACE-MP medium ni con modelos DeepMD en los sistemas evaluados, por lo que no es posible cuantificar la mejora aportada por el ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al no publicarse el número de parámetros del checkpoint, no puede darse una cifra fiable.
- Consideración general: en potenciales interatómicos de esta familia, el consumo de memoria en inferencia está dominado por el tamaño del sistema (número de átomos, listas de vecinos y estructuras de message passing) más que por el peso de los parámetros. Un mismo modelo puede ejecutarse en GPU de gama alta con cientos de miles de átomos o en CPU con celdas pequeñas.
- GPU recomendadas: no disponible. El entrenamiento se realizó en GPU con CUDA 12.1, pero la model card no especifica el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: no confirmada en la documentación disponible; por el tamaño típico de los potenciales MACE, es plausible que quepa en GPU de consumo actuales, pero no hay datos que lo respalden en esta ficha.
- Opciones de despliegue: LAMMPS mediante MLIAP y el ecosistema de Python de MACE (carga del checkpoint `.pt`). El repositorio del proyecto también contempla ALCHEMI y DeepMD como motores de comparación.
- Latencia y throughput estimados: no disponible. Aunque el repositorio `alchemi-deepmd` está dedicado a benchmarking de rendimiento, no se incluyen cifras de latencia ni de átomos por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Elementos | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alchemi-mace-finetune (este modelo) | Fine-tune de MACE sobre MACE-MP medium | Li, F, Cu, Sr, Sn | No disponible | No aplica | CC-BY-4.0 (con reserva sobre la licencia del base) | HuggingFace, 0 descargas, 0 likes |
| MACE-MP medium | Modelo fundacional de potencial interatómico | Amplia cobertura de la tabla periódica (no detallada) | No disponible | No aplica | No disponible | Público como base del ajuste |
| mace_small (variante del proyecto) | Modelo MACE de referencia para benchmarking | No disponible | No disponible | No aplica | No disponible | Artefactos del proyecto: `mace_small_lammps.pt`, `mace_small_mliap_nocueq.pt` |
| Modelos DeepMD | Potenciales interatómicos alternativos empleados en la comparación | No disponible | No disponible | No aplica | No disponible | Referenciados en el benchmarking, no incluidos en este repositorio |

La información disponible no permite comparar rendimiento numérico entre estas alternativas: no se publican errores del modelo fundacional MACE-MP medium ni de los modelos DeepMD sobre los mismos conjuntos de validación.

## Limitaciones y advertencias

- Estado incompleto: el autor indica explícitamente que el modelo no ha convergido. El entrenamiento se detuvo en la época 44 y nunca se generó el modelo final promediado con SWA ni compilado.
- Error de fuerza elevado: 81,83 meV/Å de RMSE en la época 44, con una mejora de solo 2,47 meV/Å respecto a la época 22 tras unas 12 horas de entrenamiento. Este nivel de error es alto para aplicaciones cuantitativas exigentes.
- Cobertura química restringida: solo Li, F, Cu, Sr y Sn. Cualquier simulación con otros elementos queda fuera del dominio del modelo.
- Riesgo de extrapolación: al ser un fine-tune, puede degradarse en composiciones, fases o rangos de temperatura y presión poco representados en las 87.053 configuraciones de entrenamiento.
- Duda de licencia: el propio autor deja un `TODO` en la model card advirtiendo de que la licencia del modelo fundacional MACE-MP debe revisarse antes de publicar y que sus términos deben aplicar limpiamente al fine-tune. La licencia declarada (CC-BY-4.0) podría no ser suficiente por sí sola para uso comercial.
- Sin benchmarks independientes: no hay evaluación externa, ni comparación cuantitativa con el modelo base, ni validación frente a datos experimentales publicada en la información disponible.
- Artefactos fácilmente confundibles: los ficheros `mace_small_lammps.pt` y `mace_small_mliap_nocueq.pt` corresponden a un modelo de referencia distinto y no deben tomarse como exportaciones de este fine-tune.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, sin uso comunitario verificado ni soporte documentado.
- Limitaciones de despliegue: no se documentan requisitos de hardware, latencia ni formatos de exportación para este checkpoint concreto, lo que dificulta estimar su viabilidad en producción.
- Ausencia de model card de ficha completa: no se detallan sesgos, composición del dataset de referencia, fuentes de los datos DFT ni protocolos de validación.

## Enlaces

- HuggingFace: https://huggingface.co/Selvauma/alchemi-mace-finetune
- Repositorio del proyecto de benchmarking: https://github.com/selvachandrasekaranselvaraj/alchemi-deepmd
- Log de entrenamiento referenciado: `logs/mace_Cu_Sn_SrF2_Li_run-42.log` (dentro del repositorio del proyecto)
- Checkpoints: `model/mace_Cu_Sn_SrF2_Li_epoch44.pt`, `model/mace_Cu_Sn_SrF2_Li_epoch6.pt`
- Paper, blog o demo oficiales: no disponible
- Nota: los resultados de búsqueda web disponibles no guardan relación con el modelo (corresponden a una tienda de productos de peluquería) y no se han utilizado como fuente.
