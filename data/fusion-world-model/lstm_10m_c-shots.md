# fusion-world-model/lstm_10m_c-shots

## Resumen

`lstm_10m_c-shots` es un checkpoint de un modelo del mundo (*world model*) de plasmas de tokamak desarrollado por el proyecto `fusion-world-model`. No es un modelo de lenguaje: es una red recurrente LSTM de aproximadamente 10 millones de parámetros entrenada para predecir la evolución temporal de la dinámica de plasmas en reactores de fusión. Se publica como artefacto de investigación reproducible, con semillas alternativas, configuración de entrenamiento y registro de selección de hiperparámetros.

El modelo pertenece a la receta denominada "(c) shots only", es decir, entrenada únicamente con datos de disparos (*shots*) experimentales, sin incorporar otras fuentes de la base de datos. Se distribuye junto con controladores PPO entrenados sobre el propio modelo del mundo (directorio `e4/`), lo que permite evaluar políticas de control en un entorno simulado antes de aplicarlas a un tokamak real.

Su relevancia es acotada pero específica: proporciona a la comunidad de fusión un modelo ligero, verificable y con licencia abierta para experimentar con control predictivo y aprendizaje por refuerzo sobre dinámica de plasmas, un dominio donde los datos son escasos y costosos de obtener. El tamaño reducido (0,2 GB de repositorio) y el presupuesto de 10M de parámetros lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red recurrente, serie temporal) |
| Parametros totales | ~10M (presupuesto de parámetros de la receta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM pura orientada a modelado de series temporales de alta dimensionalidad, con un presupuesto de 10 millones de parámetros. El modelo actúa como modelo del mundo: dado un estado del plasma y una acción de control, predice la transición al siguiente estado. No se dispone de información sobre el número exacto de capas, dimensión oculta, mecanismo de atención auxiliar ni estrategia de normalización.

El entrenamiento sigue la receta "(c) shots only" y se apoya en datos de FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod y la base de datos de transición L-H de TCV. El repositorio documenta un proceso de búsqueda de hiperparámetros sobre 20 configuraciones, con una regla de selección registrada en `selection.json`; `final.pt` corresponde a la configuración de índice 19 (la mejor puntuada) y el tag `paper` contiene una configuración de seguimiento (índice 20) entrenada más allá del borde del espacio de búsqueda. Se incluyen semillas alternativas (`seed_1.pt`, `seed_2.pt`) para evaluar varianza de entrenamiento. No se especifica el volumen de tokens ni el desglose exacto del dataset.

## Capacidades

- Predicción de la evolución temporal de estados de plasma en tokamak a partir de una secuencia de observaciones y acciones de control.
- Modelado del mundo para entrenamiento de políticas de control por refuerzo (PPO), con controladores ya entrenados incluidos en `e4/`.
- Evaluación *offline* de estrategias de control sin necesidad de acceso a un tokamak físico.
- Soporte de múltiples semillas para análisis de robustez y reproducibilidad.
- No soporta generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Entrenamiento de políticas de control por refuerzo**: usar el modelo como entorno simulado para entrenar y comparar controladores PPO antes de validarlos en experimento real, aprovechando que el repositorio ya incluye controladores de referencia en `e4/`.
- **Estudio de reproducibilidad en ML para fusión**: replicar la búsqueda de hiperparámetros y comparar `final.pt` con `seed_1.pt` y `seed_2.pt` para cuantificar la varianza entre semillas de una misma configuración.
- **Validación de recetas de datos**: comparar la receta "(c) shots only" frente a variantes con otras fuentes de datos para medir el impacto de la composición del dataset en la calidad del modelo del mundo.
- **Prototipado de control predictivo**: integrar el modelo en un bucle de control predictivo basado en modelo (MPC) para explorar trayectorias de plasma en simulación con bajo coste computacional.
- **Docencia e investigación en control de plasmas**: emplear un modelo ligero y de licencia abierta como banco de pruebas en cursos o proyectos de aprendizaje por refuerzo aplicado a fusión.
- **Análisis de sensibilidad de acciones de control**: perturbar las acciones de entrada y observar la respuesta predicha para identificar regímenes de operación inestables antes de probarlos en máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 10M de parámetros, el modelo ocupa del orden de decenas de MB en precisión FP32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superior) es suficiente para inferencia y para el entrenamiento de controladores PPO sobre el modelo.
- Cabe en GPU consumer: sí, sin restricciones prácticas de memoria.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt` guardados por el código de entrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros modelos del mundo de plasmas de tokamak directamente comparables en parámetros, contexto o licencia.

## Limitaciones y advertencias

- Modelo de dominio muy específico: no es un modelo de lenguaje y no debe evaluarse con métricas de NLP.
- Entrenado exclusivamente con la receta "(c) shots only"; su generalización fuera de la distribución de disparos cubierta por las bases de datos citadas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV) no está garantizada.
- Riesgo de deriva del modelo del mundo al usarse en bucles de control largos: los errores de predicción pueden acumularse; no se documentan métricas de error a horizonte largo.
- La licencia CC BY-SA 4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la redistribución de pesos modificados.
- Los datos de entrenamiento incluyen una fuente sin licencia formal (PR08), lo que puede afectar a la trazabilidad legal en despliegues comerciales.
- El repositorio no incluye model card con métricas de rendimiento, sesgos ni evaluación de seguridad; el uso en producción requeriría validación propia.
- Sin información sobre sesgos conocidos ni sobre comportamiento fuera del régimen de operación de los tokamaks representados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/lstm_10m_c-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
