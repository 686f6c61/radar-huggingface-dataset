# OneScience-Group/QCPINN-CavityFlow

## Resumen

QCPINN-CavityFlow es un paquete de investigación publicado por OneScience-Group que reproduce el experimento de cavidad con tapa deslizante (lid-driven cavity) en régimen no estacionario descrito en el artículo QCPINN: Quantum-Classical Physics-Informed Neural Networks for Solving PDEs (arXiv:2503.16678), concretamente su Tabla 3. No es un modelo de lenguaje: es una red neuronal informada por la física (PINN) de tipo cuántico-clásico que aproxima la solución de las ecuaciones de Navier-Stokes en un dominio bidimensional.

La red, denominada Angle-Cascade, mapea coordenadas espaciotemporales `(t, x, y)` a los campos de velocidad y presión `(u, v, p)`. El entrenamiento se realiza con puntos de colocación PDE y de contorno muestreados mediante secuencias de Sobol, y la validación se hace contra el campo de referencia del autor original, sin que dichos datos intervengan en la actualización de gradientes.

El interés del paquete es fundamentalmente metodológico: documenta de forma transparente un intento de reproducción que no alcanzó la precisión publicada. Los errores L2 relativos del checkpoint incluido son del orden del 120-164 %, frente al 25-43 % del artículo, lo que lo convierte en un caso de estudio útil sobre reproducibilidad en PINNs con simulación cuántica en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PINN cuántico-clásica, variante Angle-Cascade (circuitos cuánticos parametrizados en cascada sobre red clásica) |
| Parámetros totales | No disponible (el checkpoint contiene nueve tensores de parámetros; el recuento total no se publica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; entrada de 3 dimensiones `(t, x, y)`) |
| Tipos de cuantización | No disponible (checkpoint en PyTorch `float32`; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (documentación y model card) |
| Licencia | other (no se especifica la licencia exacta; los datos de referencia se distribuyen aparte con su propia procedencia) |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina un componente clásico con circuitos cuánticos parametrizados organizados en cascada por ángulos, de ahí el nombre Angle-Cascade. La entrada es tridimensional (tiempo y dos coordenadas espaciales) y la salida son tres campos físicos (componentes de velocidad y presión). La función de pérdida agrega el residuo de las ecuaciones de Navier-Stokes evaluado en puntos de colocación y las condiciones de contorno del problema de cavidad. Los puntos de muestreo se generan con secuencias de Sobol para mejorar la cobertura del dominio.

El entrenamiento se ejecutó íntegramente en simulación cuántica sobre CPU, con Python 3.10, PyTorch 2.6.0 (rueda `+cpu`) y PennyLane 0.40.0, mediante un script SLURM que lanza diez semillas independientes de 20.000 épocas cada una. El checkpoint incluido (`weight/best_model.pt`) corresponde a la semilla 6, época 1, seleccionado por validación. El SHA256 publicado es `498bcc0dbfc053ca4824b1b6cd2914e85536d0aed1e07ad50d5ef3b4a0b11b87`; el del checkpoint original de entrenamiento era `f24e5f3357b045ed2a49fdb8a377cd3668a5cbb8100ff3c13906e3bfce9aff11`. Solo se modificó la ruta de datos de referencia en los metadatos; los nueve tensores de parámetros son idénticos. No se emplean datos etiquetados externos para el entrenamiento.

## Capacidades

- Inferencia de campos de flujo en cavidad: predice velocidad `(u, v)` y presión `p` en coordenadas espaciotemporales arbitrarias dentro del dominio.
- Resolución de EDPs mediante formulación PINN: evalúa el residuo de Navier-Stokes sin necesidad de malla.
- Protocolo de investigación reproducible: incluye scripts de entrenamiento (`scripts/run_all.slurm`), inferencia (`scripts/inference.py`) y generación de resultados (`scripts/result.py`).
- Evaluación con datos de referencia: validación contra `cavity.mat` (campos `cavity_internal`, `cavity_gamma0`, `cavity_gamma1` en formato MATLAB v7.3/HDF5).
- Ejecución en CPU: no requiere GPU ni hardware cuántico real; la simulación cuántica corre en PennyLane sobre CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de propósito general.

## Casos de uso

- Reproducibilidad de PINNs cuánticas: sirve como referencia documentada de un intento de reproducción fallido, útil para investigar qué factores (semilla, inicialización, selección de checkpoint) explican la brecha de precisión frente al artículo.
- Docencia en métodos numéricos con machine learning: permite mostrar en un caso concreto cómo se formula una pérdida PDE, cómo se muestrean puntos con Sobol y cómo se evalúa el error L2 relativo.
- Benchmark de simuladores cuánticos: al ejecutarse en PennyLane sobre CPU, permite comparar tiempos y estabilidad de entrenamiento entre versiones de simuladores o backends cuánticos.
- Estudio de hibridación cuántico-clásica: la variante Angle-Cascade puede analizarse como caso de diseño de circuitos parametrizados aplicados a un problema físico con solución de referencia conocida.
- Base para experimentos de transferencia: el checkpoint y los scripts permiten partir de un estado entrenado y probar variantes de arquitectura o de función de pérdida en el mismo dominio de cavidad.
- Validación de pipelines de EDP: los scripts de inferencia y métricas sirven para comprobar la corrección de entornos de ejecución (PyTorch CPU, PennyLane, ModelScope) antes de escalar a problemas mayores.

## Benchmarks y rendimiento

Resultados de error L2 relativo publicados en la model card para los campos `(u, v, p)`:

| Configuración | u | v | p |
|---|---|---|---|
| Checkpoint incluido (semilla 6, época 1) | 123,70 % | 121,43 % | 164,19 % |
| Media de diez checkpoints de mejor validación | 200,42 % | 274,73 % | 148,86 % |
| Artículo original, Tabla 3 | 25,73 % | 38,00 % | 42,65 % |

No se han publicado otros resultados de benchmarks en la información disponible. Los autores indican explícitamente que el paquete no reproduce la precisión del artículo.

## Requisitos de hardware

- VRAM: no aplica; la ejecución formal se realizó en CPU sin GPU.
- GPU recomendadas: ninguna; el paquete está pensado para CPU con PyTorch `+cpu` y PennyLane en simulación.
- GPU de consumo: el modelo podría ejecutarse en cualquier GPU compatible con PyTorch, pero no se documenta ni se ha validado ese escenario.
- Despliegue: no se contemplan servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama; la ejecución es mediante scripts de Python (`scripts/inference.py`) en un entorno conda con Python 3.10.
- Entrenamiento: pensado para clúster SLURM (`scripts/run_all.slurm`), diez semillas × 20.000 épocas. No se publican tiempos de ejecución ni throughput.
- Almacenamiento: el repositorio de Hugging Face ocupa 0,0 GB; los datos de referencia (`cavity.mat`) se descargan aparte desde ModelScope.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Error L2 (u, v, p) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QCPINN-CavityFlow (este paquete) | PINN cuántico-clásica | Angle-Cascade, simulación CPU | 123,70 % / 121,43 % / 164,19 % (checkpoint incluido) | other | Hugging Face + datos en ModelScope |
| QCPINN original (artículo, Tabla 3) | PINN cuántico-clásica | Protocolo del autor | 25,73 % / 38,00 % / 42,65 % | MIT (código); datos con procedencia propia | GitHub del autor |
| PINN clásica para cavity flow | PINN clásica | Red fully-connected | No disponible en la información proporcionada | No disponible | No disponible |

No se dispone de datos comparativos adicionales sobre otras PINN cuánticas o clásicas aplicadas al mismo problema en la información proporcionada.

## Limitaciones y advertencias

- Precisión muy por debajo de la publicada: los errores L2 relativos superan el 100 % en los tres campos, frente al 25-43 % del artículo; el propio autor advierte que el checkpoint no constituye una afirmación de precisión a nivel de paper.
- Checkpoint seleccionado en la época 1: el modelo incluido proviene de una selección por validación muy temprana, lo que sugiere inestabilidad en el entrenamiento o un criterio de selección poco fiable.
- Dominio restringido: solo resuelve el problema de cavidad con tapa deslizante no estacionaria en 2D; no es extrapolable a otras geometrías o ecuaciones sin reentrenamiento.
- Dependencia de datos externos: la evaluación requiere descargar `cavity.mat` desde ModelScope; sin ese fichero no se pueden reproducir las métricas.
- Licencia ambigua: la licencia figura como "other" sin texto específico, y los datos de referencia tienen procedencia y licencia propias (el repositorio del autor es MIT para software, pero los datos se distribuyen aparte). Verificar antes de cualquier uso comercial.
- Sin soporte de GPU validado ni de servidores de inferencia estándar: el despliegue en producción requeriría trabajo de ingeniería adicional no documentado.
- Repositorio sin descargas ni likes y creado en noviembre de 2026: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- Riesgo de sobreinterpretación: al tratarse de un experimento de reproducibilidad, no debe presentarse como una implementación de referencia del método QCPINN.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OneScience-Group/QCPINN-CavityFlow
- Artículo QCPINN: https://arxiv.org/abs/2503.16678
- Repositorio del autor original: https://github.com/afrah/QCPINN/tree/main/data
- Datos de referencia en ModelScope: https://www.modelscope.cn/datasets/OneScience/QCPINN-Cavity
- Repositorio OneScience en GitHub: https://github.com/onescience-ai/OneScience
- Repositorio OneSkills en GitHub: https://github.com/onescience-ai/oneskills
- Repositorio OneScience en Gitee: https://gitee.com/onescience-ai/onescience
- Repositorio OneSkills en Gitee: https://gitee.com/onescience-ai/oneskills
