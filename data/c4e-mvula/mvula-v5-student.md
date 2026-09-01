# C4E-Mvula/mvula-v5-student

## Resumen

Mvula v5 es un modelo de predicción meteorológica de corto plazo desarrollado por el equipo Mvula en el marco del programa Code for Earth 2026 de ECMWF, dentro del African Stream (Challenge 40). Se trata de un estudiante CNN (red neuronal convolucional) destilado a partir de un profesor de la familia AIFS (K1/CREDIT-style Track B) podado, con el objetivo de ofrecer una herramienta ligera y ejecutable en portátiles para experimentar con la predicción de temperatura a 2 metros en África bajo un protocolo de forzamiento por análisis.

El modelo tiene aproximadamente 2,17 millones de parámetros y un checkpoint de unos 8,8 MiB, lo que lo hace extremadamente compacto. Su propósito declarado no es sustituir a los sistemas operativos de predicción numérica, sino servir como banco de pruebas para investigadores, estudiantes y la comunidad AfriClimate AI. La precipitación (tp) quedó fuera del alcance por un colapso seco en el entrenamiento, por lo que la salida se limita a temperatura, presión a nivel del mar y temperatura a 2 m, con especial atención a esta última.

La relevancia actual del modelo radica en su enfoque de destilación de un sistema de predicción global de alto coste computacional hacia un formato que puede ejecutarse en CPU en unos pocos segundos por paso de predicción, abriendo la puerta a experimentos de bajo coste en regiones con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional (student) destilada de un teacher AIFS podado (K1/CREDIT-style Track B) |
| Parametros totales | ~2,17 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de prediccion meteorologica, no de texto) |
| Tipos de cuantizacion | no disponible (se menciona ONNX/INT8 como opcion posterior, no implementada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 para codigo y model card; pesos bajo licencia de investigacion y evaluacion (ver GitHub NOTICE) |
| Formato de pesos | Checkpoint PyTorch (.ckpt) |

## Arquitectura y entrenamiento

El modelo es un CNN compacto que actúa como estudiante destilado de un profesor AIFS podado. La entrada tiene 65 canales (variables atmosféricas de análisis) y la salida son 3 variables: precipitación total (`tp`), presión a nivel del mar (`msl`) y temperatura a 2 metros (`2t`). Sin embargo, la cabeza de precipitación falló durante el entrenamiento (colapso seco) y quedó fuera del alcance del modelo.

El entrenamiento se realizó mediante destilación de conocimiento desde el teacher AIFS, con un protocolo de forzamiento por análisis (analysis-forced), es decir, el modelo recibe estados de análisis como entrada y predice la evolución a corto plazo. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset, pero la evaluación se centra en África con 61 inicializaciones del año 2023. El checkpoint se denomina `student_global_stable_v5.ckpt` y el código de inferencia está disponible en el repositorio GitHub del proyecto.

## Capacidades

- Predicción de temperatura a 2 metros (t2m) a corto plazo (horizontes de +6 h a +24 h) sobre la región africana.
- Salida de tres variables: `tp`, `msl` y `2t`, aunque `tp` no es fiable y está fuera de alcance.
- Inferencia en CPU: aproximadamente 2,5 segundos por paso de +6 h en un procesador i7-11800H.
- Protocolo de forzamiento por análisis: adecuado para experimentos de nowcasting y evaluación de destilación.
- Modelo inspeccionable y ligero, pensado para ejecutarse en portátiles o en Hugging Face Spaces.
- No soporta free-running ni rollouts autónomos de 10 días; solo pasos forzados por análisis.

## Casos de uso

- Experimentación educativa en predicción meteorológica: estudiantes e investigadores pueden cargar el modelo en un portátil y explorar cómo un CNN destilado reproduce la temperatura a 2 m en África, sin necesidad de infraestructura HPC.
- Evaluación de técnicas de destilación: el modelo sirve como banco de pruebas para comparar estrategias de compresión de modelos meteorológicos (podado, cuantización, LoRA) en un entorno controlado.
- Prototipos de servicios de información climática local: organizaciones comunitarias o NMHS con recursos limitados pueden generar predicciones de temperatura a muy corto plazo para regiones concretas de África, siempre que se utilicen como complemento a los pronósticos oficiales.
- Investigación sobre sesgos regionales: los resultados de la evaluación (RMSE, ACC, bias) permiten analizar el comportamiento del modelo en distintas zonas africanas y estudiar correcciones estadísticas posteriores.
- Demostraciones en Hugging Face Spaces: al ser un modelo de ~8,8 MiB, puede desplegarse en un Space gratuito para mostrar predicciones interactivas de temperatura africana.
- Formación de personal en NMHS: el modelo puede utilizarse en talleres para ilustrar el flujo de trabajo de un sistema de predicción basado en IA, desde la carga del checkpoint hasta la generación de mapas de temperatura.

## Benchmarks y rendimiento

La model card proporciona una tabla de habilidad empaquetada para África, basada en 61 inicializaciones del año 2023. No se han publicado comparaciones con otros modelos en la información disponible.

| Lead time | RMSE (°C) | ACC | Bias (°C) |
|----------:|----------:|----:|----------:|
| +6 h      | 1.38      | 0.97 | −0.12     |
| +12 h     | 7.80      | 0.45 | −5.33 (frio sistematico) |
| +18 h     | 4.38      | 0.75 | −1.12     |
| +24 h     | 3.23      | 0.84 | +1.30     |

Estos valores indican un buen rendimiento a +6 h, con una degradación notable a +12 h (sesgo frío severo) y una recuperación parcial a +18 h y +24 h. No se dispone de benchmarks adicionales (como MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el checkpoint ocupa ~8,8 MiB y la inferencia se realiza en CPU.
- GPU recomendadas: ninguna específica; el modelo está diseñado para CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con PyTorch puede ejecutarlo, pero no es necesario.
- Opciones de despliegue: PyTorch nativo, Hugging Face Hub (descarga del checkpoint), Apptainer (contenedores), y posiblemente ONNX en el futuro (no implementado).
- Latencia y throughput: ~2,5 segundos por paso de +6 h en un i7-11800H; el throughput depende del número de pasos encadenados, pero al ser un modelo de 2,17 M parámetros, es prácticamente instantáneo en hardware moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoría. El teacher AIFS (del que se destila) es un modelo de mayor tamaño y no se redistribuye aquí. No hay datos públicos de otros estudiantes destilados de AIFS con los que comparar directamente. Por tanto, la comparativa se limita a la descripción conceptual:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|--------|-----------|----------|----------|----------------|
| Mvula v5 (student) | ~2,17 M | No aplica (meteorologico) | Apache-2.0 (codigo), pesos con restricciones | HuggingFace, GitHub |
| AIFS (teacher) | No disponible | No aplica | Terminos originales (no redistribuido) | ECMWF |
| Otros estudiantes de AIFS | No disponible | No aplica | No disponible | No disponible |

## Limitaciones y advertencias

- No es un sistema operacional de predicción: no debe utilizarse como sustituto de los pronósticos oficiales de ningún servicio meteorológico nacional.
- La precipitación (`tp`) está fuera de alcance: el modelo sufre un colapso seco en esa variable y no debe usarse para predicción de lluvia.
- Sesgo frío severo a +12 h: el RMSE de 7,80 °C y el bias de −5,33 °C indican una degradación importante en ese horizonte, lo que limita su utilidad práctica para plazos intermedios.
- No soporta free-running: el modelo requiere forzamiento por análisis y no puede generar rollouts autónomos de varios días.
- Licencia de pesos restringida: aunque el código es Apache-2.0, los pesos del estudiante están limitados a uso de investigación y evaluación; el uso comercial requiere consultar el `NOTICE` del repositorio GitHub.
- Los pesos del teacher AIFS no se redistribuyen: cualquier uso del modelo depende de los términos originales de AIFS/Anemoi.
- Evaluación limitada a África y a un solo año (2023): la generalización a otras regiones o periodos no está garantizada.
- No hay soporte para cuantización INT8/ONNX en el estado actual: la opción se menciona como posible trabajo futuro, pero no está implementada.

## Enlaces

- HuggingFace: https://huggingface.co/C4E-Mvula/mvula-v5-student
- Repositorio GitHub: https://github.com/msovara/lapai-forecast-africa
- Proyecto Code for Earth: https://codeforearth.ecmwf.int/project/mvula/
- Programa Code for Earth (ECMWF): https://codeforearth.ecmwf.int/
