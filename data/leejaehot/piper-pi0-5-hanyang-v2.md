# leejaehot/piper-pi0.5-hanyang-v2

## Resumen

Piper Pi0.5 — Hanyang v2 es una política de control robótico basada en el modelo Pi0.5, desarrollada por el autor `leejaehot` (Jaechan Lee). Se trata de un modelo de visión-lenguaje-acción (VLA) que ha sido ajustado a partir de la base `lerobot/pi05_base` para controlar un robot de un solo brazo de la plataforma Piper, utilizando un conjunto de datos de 100 demostraciones normalizadas del dataset `oms524/place_spam_into_the_white_box_30hz_normalized` de la Universidad Hanyang (HYU).

El modelo resuelve el problema de la manipulación robótica de precisión: concretamente, la tarea de colocar una lata de spam dentro de una caja blanca. Su relevancia radica en que demuestra la viabilidad de ajustar un VLA de propósito general (Pi0.5) a una tarea específica con un número reducido de demostraciones (100), lo que abre la puerta a la personalización de políticas robóticas en entornos de producción con datos limitados.

El modelo cuenta con 4.143 millones de parámetros y se distribuye a través de HuggingFace como un repositorio de LeRobot, lo que permite su integración directa en pipelines de inferencia y despliegue de robots con la librería LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 (Vision-Language-Action model, basado en flujo, adaptado de OpenPI) |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | No disponible (modelo de visión-lenguaje-acción, sin especificación de idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## 3. Arquitectura y entrenamiento

El modelo se basa en la arquitectura Pi0.5, un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y descrito en el artículo arXiv 2504.16054. Pi0.5 es una evolución del modelo Pi0 que utiliza entrenamiento conjunto (co-training) sobre conjuntos de datos heterogéneos para lograr una mejor generalización en entornos abiertos del mundo real. La implementación utilizada es la adaptación de LeRobot del repositorio OpenPI.

El ajuste fino se realizó sobre el modelo base `lerobot/pi05_base`, con los siguientes parámetros de entrenamiento:

| Campo | Valor |
| --- | --- |
| Política | Pi0.5 |
| Robot | Piper (brazo único) |
| Dataset | `oms524/place_spam_into_the_white_box_30hz_normalized` |
| Pasos de entrenamiento | 20.000 |
| Tamaño del chunk de acciones | 50 |
| Normalización de estado/acción | Cuantiles |
| Cámaras | Cámara frontal y cámara derecha |
| Semilla | 1000 |

El entrenamiento se realizó sobre 100 demostraciones normalizadas a 30 Hz, lo que indica un enfoque de aprendizaje por imitación. No se menciona el uso de RLHF, DPO u otras técnicas de optimización adicionales. El repositorio contiene los pesos del modelo y los procesadores de política, pero no incluye los archivos de estado de entrenamiento.

## 4. Capacidades

- **Control robótico end-to-end**: el modelo recibe observaciones de cámara (frontal y derecha) y genera directamente acciones de control para el brazo robótico Piper.
- **Manipulación de precisión**: está entrenado específicamente para la tarea de colocar un objeto (lata de spam) dentro de una caja blanca, lo que implica habilidades de agarre, transporte y colocación.
- **Aprendizaje por imitación**: el modelo ha sido ajustado mediante 100 demostraciones, lo que demuestra su capacidad de adaptación a tareas concretas con datos limitados.
- **Integración con LeRobot**: se puede cargar directamente como política en comandos de inferencia o rollout de LeRobot mediante `--policy.path=leejaehot/piper-pi0.5-hanyang-v2`.
- **Procesamiento multimodal**: al ser un VLA, procesa simultáneamente entradas visuales (de las cámaras) y textuales (instrucciones de tarea) para generar acciones.

## 5. Casos de uso

- **Automatización de tareas de picking y placing en logística**: el modelo puede integrarse en un sistema robótico para colocar objetos en contenedores o cajas de forma autónoma, reduciendo el trabajo manual repetitivo en almacenes.
- **Prototipado rápido de políticas robóticas**: gracias a su ajuste con solo 100 demostraciones, sirve como referencia para equipos que deseen adaptar un VLA de propósito general a una tarea específica sin necesidad de grandes datasets.
- **Investigación en aprendizaje por imitación**: el repositorio es un recurso útil para investigadores que estudian cómo modelos de gran tamaño se adaptan a tareas concretas con pocas muestras.
- **Benchmark de control robótico**: puede utilizarse como punto de comparación para evaluar el rendimiento de otras políticas en la misma tarea de colocación de objetos en cajas.
- **Despliegue en laboratorios de robótica**: el modelo se puede cargar directamente en un robot Piper con LeRobot para probar su comportamiento en entornos de laboratorio o en configuraciones de demostración.
- **Educación y formación**: sirve como ejemplo práctico de cómo se entrena y se despliega un modelo VLA de última generación en un robot real, útil para cursos avanzados de robótica y aprendizaje automático.

## 6. Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento como tasa de éxito en la tarea, ni comparaciones cuantitativas con otros modelos. La única información disponible es el número de pasos de entrenamiento (20.000) y el tamaño del dataset (100 demostraciones).

## 7. Requisitos de hardware

- **VRAM estimada para inferencia**: con 4.143 millones de parámetros, la inferencia en precisión completa (fp32) requeriría aproximadamente 16,5 GB de VRAM (4,14 GB por cada 1.000 millones de parámetros). Con cuantización a fp16 o bf16, se reduciría a unos 8,3 GB.
- **GPU recomendadas**: GPU con al menos 16 GB de VRAM para fp16 (por ejemplo, NVIDIA RTX 4090, A100, H100). Para fp32 se necesitarían 24 GB o más (por ejemplo, A100 40GB, RTX 4090 24GB).
- **GPU consumer**: sí, cabe en una RTX 4090 (24 GB) o RTX 4080 (16 GB) con cuantización fp16/bf16.
- **Opciones de despliegue**: LeRobot es la plataforma principal de inferencia. También se podría usar OpenPI si se adaptan los pesos. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM generativo sino una política robótica.
- **Latencia y throughput**: no se han publicado datos de latencia ni throughput para este modelo.

## 8. Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- |
| **Piper Pi0.5 Hanyang v2** | 4,14 mil millones | No disponible | No disponible | Hugging Face (LeRobot) |
| **Pi0.5 base** (`lerobot/pi05_base`) | No disponible | No disponible | No disponible | Hugging Face (LeRobot) |
| **Pi0** (modelo base) | No disponible | No disponible | No disponible | Repositorio OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a la arquitectura y la disponibilidad. Pi0.5 es una evolución de Pi0, y este modelo concreto es un ajuste de Pi0.5 para una tarea específica.

## 9. Limitaciones y advertencias

- **Sesgos conocidos**: al estar entrenado con solo 100 demostraciones de un único entorno (una caja blanca y una lata de spam), el modelo puede no generalizar bien a otras condiciones de iluminación, superficies o variaciones del objeto.
- **Riesgo de alucinación**: como modelo de acción robótica, no se aplica el concepto de alucinación textual, pero sí puede generar acciones incorrectas o impredecibles si las condiciones del entorno difieren del conjunto de entrenamiento.
- **Limitaciones de contexto**: no se especifica la longitud de contexto; sin embargo, al ser un modelo de acción-visión, el contexto está limitado por las observaciones de cámara y las instrucciones de la tarea.
- **Idiomas**: no se especifican idiomas soportados; es probable que las instrucciones de tarea estén en inglés, pero no se indica.
- **Restricciones de licencia**: la licencia no está disponible. No se puede confirmar si el modelo puede usarse comercialmente.
- **Caveat de producción**: el repositorio no incluye archivos de estado de entrenamiento, lo que limita la capacidad de continuar el entrenamiento o reproducir el experimento completo.
- **Dependencia de la plataforma**: el modelo está específicamente adaptado al robot Piper y al dataset de la caja blanca, por lo que no es directamente transferible a otros robots o tareas sin un nuevo ajuste.

## 10. Enlaces

- **Repositorio HuggingFace**: https://huggingface.co/leejaehot/piper-pi0.5-hanyang-v2
- **Repositorio OpenPI (GitHub)**: https://github.com/Physical-Intelligence/openpi
- **Paper de Pi0.5 (arXiv)**: https://arxiv.org/abs/2504.16054
- **Documentación de la política Pi05 en LeRobot**: https://huggingface.co/docs/lerobot/pi05
- **Perfil del autor en HuggingFace**: https://huggingface.co/leejaehot
