# milab-robot/alm1-0731-milab.60

## Resumen

El modelo `milab-robot/alm1-0731-milab.60` es un policy de control robótico desarrollado por el laboratorio milab-robot, asociado al grupo cu-milab de la Universidad de Columbia. No se trata de un modelo de lenguaje, sino de un modelo de aprendizaje por refuerzo supervisado para control de un robot, basado en la arquitectura ACT (Action Chunking with Transformers). El repositorio contiene dos ramas de entrenamiento, `act-s300k-eb16-m` y `act-s300k-eb16`, que difieren en la configuración de articulaciones silenciadas (muted joints) y en las métricas de error obtenidas.

El modelo resuelve el problema de generar secuencias de acciones de control para un robot manipulador a partir de observaciones, utilizando el paradigma de chunking de acciones. La relevancia actual radica en que ACT es una de las arquitecturas más utilizadas en robótica de manipulación con aprendizaje por demostración, y este repositorio documenta un entrenamiento con 300.000 pasos y un batch efectivo de 16. La información pública disponible es muy limitada: no se especifican parámetros totales, arquitectura detallada, licencia ni idiomas, y el repositorio no ha recibido descargas ni valoraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), no se especifica variante |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un policy de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente PyTorch, no confirmado) |

Datos de entrenamiento documentados en la model card:

| Rama | Steps | GPUs | Batch/GPU | Batch efectivo | Muted joints | LR | Weight decay | Seed | Ckpt | Episodios | MAE | RMSE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| act-s300k-eb16-m | 300.000 | 1 | 16 | 16 | l_sh_p, l_sh_r, l_sh_y, l_el_p, l_wr_y, l_wr_p, l_wr_r, head_y, head_p, waisty | 1e-5 | 1e-4 | 1000 | 30.000 | 2 | 0,5143 | 0,6726 |
| act-s300k-eb16 | 300.000 | 1 | 16 | 16 | - | 1e-5 | 1e-4 | 1000 | 30.000 | 1 | 0,5490 | 0,7345 |

## Arquitectura y entrenamiento

La arquitectura ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. El modelo emplea un transformer como backbone, con un codificador de visión (típicamente ResNet) y un decodificador que genera los chunks de acción. En este repositorio, el entrenamiento se realizó con 300.000 pasos, un batch efectivo de 16, una tasa de aprendizaje de 1e-5 y weight decay de 1e-4. La rama `act-s300k-eb16-m` silencia un conjunto de articulaciones (hombro, codo, muñeca, cabeza y cintura) durante el entrenamiento, lo que produce un MAE de 0,5143 y un RMSE de 0,6726, ligeramente mejores que la rama sin silenciamiento (MAE 0,5490, RMSE 0,7345). No se dispone de información sobre el dataset de demostraciones, el número de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generación de secuencias de acciones de control para un robot manipulador (policy de control).
- Aprendizaje por imitación a partir de demostraciones, con predicción por chunks de acción.
- Soporte de articulaciones silenciadas (muted joints) para regular el aprendizaje de grados de libertad específicos.
- No es un modelo de lenguaje: no genera texto, código ni razonamiento simbólico.
- No se documentan capacidades de tool calling, agentes, visión multimodal ni multilingüismo.

## Casos de uso

- Control de manipulador robótico por imitación: el modelo puede generar comandos de articulación para tareas de pick-and-place o ensamblaje, usando la arquitectura ACT que predice chunks de acción para suavizar el movimiento.
- Investigación en aprendizaje por demostración: el repositorio sirve como referencia para reproducir entrenamientos de ACT con configuraciones de batch y silenciamiento de articulaciones, comparando métricas MAE y RMSE entre ramas.
- Evaluación de estrategias de regularización: la rama con muted joints permite estudiar cómo la exclusión de ciertos grados de libertad afecta al error de control, útil para diseñar políticas más robustas.
- Desarrollo de sistemas de teleoperación asistida: el policy puede integrarse en un bucle de control para asistir a un operador humano en tareas de manipulación fina.
- Benchmark de control robótico: las métricas documentadas (MAE, RMSE) pueden usarse como referencia para comparar con otros policies entrenados en el mismo entorno.
- Docencia y formación en robótica: el repositorio, junto con el código de cu-milab/ai-robot, puede utilizarse en cursos de robótica para ilustrar el entrenamiento de policies con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es un LLM. Las únicas métricas disponibles son las de error de control del entrenamiento, presentadas en la tabla de especificaciones:

| Rama | MAE | RMSE |
|---|---|---|
| act-s300k-eb16-m | 0,5143 | 0,6726 |
| act-s300k-eb16 | 0,5490 | 0,7345 |

Estas métricas indican el error medio absoluto y la raíz del error cuadrático medio en la predicción de acciones, pero sin contexto del entorno o de la escala de las acciones no se puede interpretar su calidad relativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que el repositorio pesa 2,5 GB y el entrenamiento se realizó con 1 GPU y batch 16, es probable que la inferencia quepa en una GPU de consumo (8-12 GB), pero no se confirma.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 1 GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: probable, dado el tamaño del repositorio, pero no confirmado.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI. Al ser un policy de control, el despliegue sería mediante el framework de ACT (probablemente PyTorch) en un entorno robótico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en el mismo dominio (policies de control robótico basados en ACT) dentro de la información proporcionada. El repositorio de cu-milab/ai-robot en GitHub podría contener más contexto, pero no se ha accedido a su contenido.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un policy entrenado con demostraciones, puede heredar sesgos del operador que generó las demostraciones.
- Riesgo de alucinación: no aplica directamente, pero el modelo puede generar acciones erróneas si las observaciones están fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica, no es un modelo de lenguaje.
- Restricciones de licencia: no disponible. La licencia no está especificada en la model card, por lo que se desconoce si permite uso comercial.
- Caveat para producción: la información pública es insuficiente para evaluar la robustez del modelo en entornos reales. Las métricas MAE/RMSE no incluyen tasas de éxito en tareas, y no se documentan pruebas en hardware físico.
- El repositorio no tiene descargas ni valoraciones, lo que sugiere que es un proyecto en fase temprana o de uso interno del laboratorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milab-robot/alm1-0731-milab.60
- Perfil de la organización milab-robot: https://huggingface.co/milab-robot
- Repositorio GitHub cu-milab/ai-robot: https://github.com/cu-milab/ai-robot
