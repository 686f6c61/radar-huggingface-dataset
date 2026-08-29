# resoajoe/clinical-attire-nano

## Resumen

`clinical-attire-nano` es un clasificador de imágenes multi-etiqueta extremadamente compacto, desarrollado por Joe Cox (usuario `resoajoe`), diseñado para responder a la pregunta "quién está en esta habitación y si se lleva mascarilla" a partir de un fotograma de 64×64 píxeles. Con solo 47.252 parámetros y un peso de 189 KB, es capaz de procesar cada fotograma de un flujo de vídeo en CPU a unas 2.800 fps (0,36 ms por fotograma en un solo hilo), lo que lo hace apto para despliegue en dispositivos de borde.

El modelo se compone de cuatro cabezas de clasificación independientes (`staff`, `patient`, `visitor` y `mask`) que operan de forma simultánea, permitiendo detectar múltiples roles en una misma escena. Su principal innovación es la destilación de un modelo de visión-lenguaje de 7.000 millones de parámetros (`qwen2.5vl:7b`) a un modelo de 47.000 parámetros, con un coste de entrenamiento mínimo. Sin embargo, el autor advierte explícitamente de que las etiquetas de entrenamiento fueron generadas automáticamente por el modelo profesor, con una precisión estimada de solo el 78% en una auditoría manual de 16 imágenes, por lo que el rendimiento real del clasificador está limitado por la calidad de su profesor.

El modelo está orientado a aplicaciones de operaciones sanitarias (gestión de personal, cumplimiento de EPI, flujo de visitas) y no tiene ninguna finalidad clínica o diagnóstica. Se distribuye bajo licencia MIT y está disponible en formato ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (arquitectura no detallada) |
| Parametros totales | 47.252 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (solo se publica el modelo en ONNX sin cuantización explícita) |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivo `clinical_attire.onnx`) |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la documentación, pero se trata de una red neuronal convolucional diminuta con cuatro cabezas de salida independientes, cada una con una activación sigmoide (no softmax), lo que permite clasificación multi-etiqueta. La entrada es una imagen BGR de 64×64 píxeles, normalizada por imagen (se resta la media y se divide por la desviación estándar).

El entrenamiento se realizó mediante destilación: las etiquetas fueron generadas por el modelo de visión-lenguaje `qwen2.5vl:7b` sobre imágenes de escenas clínicas y domésticas de Places365. Cada imagen se evaluó dos veces con redacciones diferentes, conservándose solo las respuestas coincidentes (2.966 de 4.000, un 74%). Posteriormente, se aplicó un filtrado con un detector de personas independiente (`yolov8n-pose`), eliminando 229 imágenes donde había discrepancia sobre la presencia de personas, quedando 2.737 imágenes de entrenamiento. El conjunto final contiene 575 positivos para `staff`, 361 para `patient`, 524 para `visitor` y 276 para `mask`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

Una innovación destacable es la separación de la taxonomía: en lugar de clasificar por tipo de prenda (p. ej., "bata quirúrgica"), el modelo clasifica por rol (`staff`, `patient`, `visitor`), lo que evita ambigüedades operativas (una bata quirúrgica azul puede ser usada tanto por personal como por pacientes).

## Capacidades

- Clasificación multi-etiqueta de imágenes: detecta simultáneamente la presencia de personal sanitario (scrubs, bata quirúrgica, bata de laboratorio), pacientes (bata de paciente), visitantes (ropa de calle) y uso de mascarilla.
- Procesamiento en tiempo real en CPU: 0,36 ms por fotograma en un solo hilo, lo que permite analizar vídeo a ~2.800 fps.
- Independencia de cabezas: una misma imagen puede contener personal, paciente y visitante a la vez (180 imágenes de entrenamiento incluyen esta combinación).
- Inferencia con ONNX Runtime, compatible con múltiples plataformas (CPU, GPU, dispositivos embebidos).
- No requiere GPU ni hardware especializado; funciona en un solo hilo de CPU.
- No incluye capacidades de generación de texto, razonamiento, código, tool calling ni agentes.

## Casos de uso

- Monitorización de ocupación de habitaciones: el modelo puede analizar fotogramas de cámaras de vigilancia para determinar si una habitación está ocupada por personal, paciente o visitante, ayudando a gestionar la asignación de camas y recursos.
- Cumplimiento de uso de mascarilla en áreas clínicas: la cabeza `mask` permite detectar si las personas presentes llevan mascarilla, sirviendo como señal de alerta para supervisión de protocolos de prevención de infecciones.
- Auditoría de flujo de personal y visitantes: al distinguir entre roles, el modelo puede generar estadísticas sobre la afluencia de personal y visitantes en diferentes zonas, útil para optimizar horarios y rutas.
- Detección de presencia de personal en quirófanos o salas de procedimientos: la cabeza `staff` identifica si hay personal con vestimenta quirúrgica, lo que puede integrarse en sistemas de control de acceso o registro de actividad.
- Sistemas de alerta temprana para supervisión de enfermería: combinando la detección de personal y pacientes, se pueden generar avisos cuando un paciente está solo durante períodos prolongados o cuando hay exceso de visitantes.
- Análisis de cumplimiento de EPI en zonas de aislamiento: la detección de mascarilla, junto con la presencia de personal, permite verificar que se siguen los protocolos de protección en áreas de alto riesgo.
- Integración en sistemas de videovigilancia de bajo coste: al ser un modelo de 189 KB, puede ejecutarse en Raspberry Pi, cámaras IP o microcontroladores, sin necesidad de servidores centralizados.

## Benchmarks y rendimiento

La model card publica resultados de precisión media (AP) por cabeza, comparados con un baseline barato (estadísticas de imagen y medias de canales de color) y con la prevalencia (chance). Los resultados se obtuvieron con 4 semillas y divisiones 75/25:

| Cabeza | AP del modelo | Baseline barato | Chance (prevalencia) | Mejora vs chance | Margen |
|---|---|---|---|---|---|
| `staff` | 0,461 | 0,325 | 0,201 | 2,3× | +0,137 |
| `patient` | 0,340 | 0,183 | 0,137 | 2,5× | +0,157 |
| `visitor` | 0,488 | 0,311 | 0,207 | 2,4× | +0,177 |
| `mask` | 0,419 | 0,286 | 0,099 | 4,2× | +0,133 |

Es importante señalar que estos valores miden la concordancia con el profesor automático (`qwen2.5vl:7b`), no con la realidad. El autor estima que la precisión del profesor es de aproximadamente el 78% (basado en una auditoría manual de 16 imágenes), por lo que el modelo no puede superar ese límite. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o ImageNet, ya que no es un modelo de lenguaje ni un clasificador de propósito general.

## Requisitos de hardware

- VRAM: no requiere VRAM; el modelo se ejecuta en CPU.
- Peso del modelo: 189 KB, cabe en cualquier dispositivo con almacenamiento mínimo.
- CPU: 0,36 ms por fotograma en un solo hilo (~2.800 fps). Se recomienda desactivar el spinning de hilos en ONNX Runtime para evitar consumo innecesario de CPU.
- GPU: opcional, pero no necesaria. Si se usa, la inferencia será aún más rápida.
- RAM: menos de 1 MB para los pesos del modelo.
- Dispositivos compatibles: Raspberry Pi, cámaras IP, microcontroladores con soporte ONNX, teléfonos móviles, ordenadores de bajo consumo.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), también puede convertirse a otros formatos (TensorFlow Lite, CoreML, etc.) mediante herramientas de conversión.
- Latencia: 0,36 ms por fotograma en un solo hilo; en vídeo se recomienda agregar resultados durante al menos un segundo para obtener decisiones estables.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría: clasificadores de vestimenta clínica de 47.000 parámetros con cuatro cabezas independientes y orientados a operaciones sanitarias. Los modelos de clasificación de imágenes generales (MobileNet, EfficientNet) son mucho más grandes (millones de parámetros) y no están especializados en este dominio. El modelo profesor `qwen2.5vl:7b` tiene 7.000 millones de parámetros y no es comparable en tamaño ni en latencia. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento fueron generadas automáticamente por un modelo de visión-lenguaje (`qwen2.5vl:7b`) y no validadas por humanos de forma exhaustiva. Solo 16 imágenes fueron auditadas manualmente, con una precisión estimada del profesor de ~78%. El rendimiento del modelo está limitado por esta calidad.
- No es un dispositivo médico ni debe utilizarse para diagnóstico, tratamiento o cualquier decisión clínica. El autor lo declara explícitamente: "Not a medical device".
- Errores conocidos y medidos:
  - Alucinación de vestimenta: 3,9% de las afirmaciones de vestimenta no tenían una persona detectada por el detector independiente (peor en `patient_gown` con 7,1%, confundiendo ropa de cama con bata).
  - Personas no detectadas: 12,3% de las imágenes etiquetadas como "nadie visible" contenían una persona detectada.
  - Confusión de mascarillas: las mascarillas de oxígeno se cuentan como `mask`, lo que es problemático para cumplimiento de EPI (infección vs. soporte respiratorio son situaciones opuestas).
  - El dataset de Places365 contiene ilustraciones (dibujos animados), que están presentes en el entrenamiento.
- El modelo fue entrenado con fotografías, no con vídeo de cámaras de vigilancia. La diferencia de perspectiva (cámaras montadas en pared, escenas más amplias y vacías) no está medida.
- La resolución de entrada es de 64×64 píxeles, por lo que una mascarilla ocupa solo unos pocos píxeles; esto explica que la AP de `mask` sea de 0,419 a pesar de ser la cabeza con mayor mejora sobre el azar.
- Se recomienda agregar las predicciones a lo largo del tiempo (por ejemplo, promediar durante un segundo) para obtener decisiones fiables; una sola imagen no es suficiente.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de precisión ni de idoneidad para entornos clínicos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/resoajoe/clinical-attire-nano
- Dataset de etiquetas publicado: https://huggingface.co/datasets/resoajoe/clinical-attire-labels
- Modelo relacionado (clasificación de escena clínica): https://huggingface.co/resoajoe/clinical-scene-nano
- Modelo relacionado (audio ambiental): https://huggingface.co/resoajoe/room-audio-ladder-nano
- Perfil del autor: https://huggingface.co/resoajoe
