# excavator-umi/policies

## Resumen

UMI Excavator es un conjunto de dos políticas robóticas (checkpoints de imitación) construidas sobre el modelo base `physical-intelligence/pi05_base` (π0.5) y publicadas por el usuario `excavator-umi`. El objetivo es el control de una excavadora de cuatro articulaciones (slew, boom, stick y bucket) mediante aprendizaje por imitación a partir de demostraciones grabadas con una cámara tipo UMI montada en el cazo. El repositorio incluye dos variantes entrenadas 1000 pasos: `cloak-1000`, que aplica el método CLOAK con auto-máscara de gemelo digital para ocultar el robot, y `non-cloak-1000`, que sirve de línea base manteniendo al demostrador fuera de plano.

La relevancia es acotada pero específica: se trata de un ejemplo de adaptación de un modelo de política generalista (π0.5) a un dominio de maquinaria pesada con muy pocos datos (42 grabaciones de entrenamiento, sin conjunto de validación). No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un artefacto de investigación en robótica. El repositorio pesa 69,8 GB e incluye los parámetros completos en formato Orbax/OCDBT (unos 12 GB por política, sin estado del optimizador).

Conviene señalar que el autor indica que ambas políticas se han movido (2026-11-25) al repositorio público `amichaelyu/umi-excavator` con archivos idénticos byte a byte, y que este repositorio se mantiene para la model card y para alojar nuevas políticas bajo `policy/<name>/`. No se han publicado resultados de benchmarks ni validación de éxito en despliegue físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (policy de imitación basada en modelo base `physical-intelligence/pi05_base`); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en Orbax/OCDBT, ~12 GB por política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada es prompt de tarea `scoop the dirt` más observaciones visuales) |
| Licencia | no disponible |
| Formato de pesos | Orbax/OCDBT (JAX); incluye `bundle.json`, estadísticas de normalización y manifiesto de entrenamiento |

## Arquitectura y entrenamiento

Cada política se inicializa desde los pesos `gs://openpi-assets/checkpoints/pi05_base` y se afina durante 1000 pasos con batch de 32 y semilla 20261006. La variante `cloak-1000` aplica el método CLOAK (commit `f3d6ab3`, repositorio Stanford-TML/cloak) con una auto-máscara de gemelo digital para enmascarar el robot durante el entrenamiento; la variante `non-cloak-1000` es la línea base con el demostrador fuera de vista. Los tiempos de entrenamiento reportados son de aproximadamente 29 minutos para CLOAK y 25 minutos para la línea base.

Los datos de entrenamiento consisten en 42 grabaciones (una excluida, `76493caf`, por falta de métricas de replay) de demostraciones de excavación con cámara tipo UMI en el cazo. No se usó conjunto de validación (holdout). Las etiquetas de articulaciones no son ángulos medidos: las poses de cámara provienen de ORB-SLAM3 con suavizado KLT/IMU, y las etiquetas de las cuatro articulaciones se obtienen por IK con lookahead en el gemelo digital `full4_calibrated`. La salida son objetivos absolutos de articulación en radianes a 10 Hz con horizonte 10.

## Capacidades

- Generación de acciones de control para una excavadora de cuatro articulaciones (slew, boom, stick, bucket) en espacio articular calibrado.
- Ejecución de una tarea única condicionada por el prompt `scoop the dirt` (excavar y cargar tierra).
- Política de imitación visual: consume observaciones de cámara tipo UMI montada en el cazo.
- Salida a 10 Hz con horizonte de predicción de 10 pasos y objetivos articulares absolutos en radianes.
- Variante con enmascaramiento del robot (CLOAK) para reducir el sesgo de apariencia del demostrador.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento; es un modelo específico de robótica.

## Casos de uso

- Investigación en aprendizaje por imitación para maquinaria pesada: reproducir el pipeline completo (demostraciones UMI, SLAM, IK en gemelo digital, fine-tuning de π0.5) para estudiar la transferibilidad de políticas generalistas a dominios de excavación.
- Comparación de métodos de aumento de datos: usar `cloak-1000` frente a `non-cloak-1000` como par controlado para medir el efecto del enmascaramiento del robot en políticas visuales.
- Prototipado de autonomía en excavadoras de laboratorio: desplegar la política en el gemelo digital `full4_calibrated` o en un banco de pruebas físico de cuatro articulaciones para tareas de scooping.
- Base para fine-tuning adicional: partir de estos checkpoints para nuevas tareas de excavación (nivelado, zanjado) con datos propios, aprovechando que los pesos están publicados sin estado del optimizador.
- Evaluación de robustez de SLAM e IK en robótica de campo: el repositorio documenta explícitamente las fuentes de error (poses de cámara, escala métrica, montaje cámara-cazo) y sirve como caso de estudio de reconstrucción de etiquetas.
- Reproducibilidad de investigación: los manifiestos (`data/manifest.json`), opciones de ejecución (`run/cloak-run.json`) y `requirements.txt` con el stack JAX pineado permiten replicar el entrenamiento en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el éxito de la tarea y el despliegue físico no han sido validados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Cada política ocupa unos 12 GB en disco en formato Orbax/OCDBT, lo que da una cota inferior orientativa del orden de 12 GB de memoria para cargar los pesos en precisión original.
- GPU recomendadas: no disponible en la información proporcionada. El stack es JAX/CLOAK/openpi, por lo que se requiere compatibilidad con JAX y con las versiones pineadas en `requirements.txt`.
- ¿Cabe en GPU de consumo? No disponible; depende del tamaño real de parámetros y del backend JAX, datos no publicados.
- Opciones de despliegue: carga mediante el stack JAX pineado (CLOAK/openpi) indicado en `requirements.txt` de cada carpeta. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. La política emite acciones a 10 Hz con horizonte 10, pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Datos de entrenamiento | Contexto / frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UMI Excavator (`cloak-1000`, `non-cloak-1000`) | π0.5 (`pi05_base`) | Control de excavadora de 4 articulaciones | 42 grabaciones UMI, sin holdout | 10 Hz, horizonte 10 | no disponible | Hugging Face (repo privado y copia pública en `amichaelyu/umi-excavator`) |
| `physical-intelligence/pi05_base` | π0.5 | Política generalista de robot | no disponible | no disponible | no disponible | Hugging Face (modelo base referenciado) |
| Otras políticas de imitación para maquinaria pesada | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las etiquetas de articulaciones y la escala métrica son reconstruidas y no están validadas.
- El montaje cámara-cazo no está medido, lo que introduce incertidumbre en la calibración extrínseca.
- El éxito de la tarea y el despliegue físico no han sido validados; no hay métricas de éxito publicadas.
- Entrenamiento sin conjunto de validación (holdout): no hay estimación de generalización fuera de las 42 grabaciones.
- Una grabación fue excluida por falta de métricas de replay, lo que reduce aún más el ya escaso volumen de datos.
- La licencia no está declarada, por lo que el uso comercial queda sin marco legal explícito.
- Es un modelo de dominio muy estrecho: un único prompt (`scoop the dirt`) y una única morfología de robot; no es reutilizable como modelo general.
- Dependencia de un stack JAX/CLOAK/openpi con versiones pineadas; la compatibilidad con otras herramientas es limitada.
- El repositorio original es privado y las políticas se han movido a `amichaelyu/umi-excavator`; conviene verificar la copia pública antes de usarlas en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/excavator-umi/policies
- Copia pública de las políticas: https://huggingface.co/amichaelyu/umi-excavator
- Dataset de demostraciones: https://huggingface.co/datasets/excavator-umi/data
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Paper: https://www.yumichael.com/api/assets/michaelyu423246703209.pdf
- Repositorio CLOAK: https://github.com/Stanford-TML/cloak
