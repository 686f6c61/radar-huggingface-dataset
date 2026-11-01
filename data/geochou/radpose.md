# Geochou/RadPose

## Resumen

RadPose es un modelo de estimación de pose humana absoluta que utiliza señales de radiofrecuencia (RF) del tipo ISAC (Integrated Sensing and Communication, es decir, integración de sensado y comunicación). Lo desarrolla Geo Zhou, del INSS Lab de la Michigan State University, y se distribuye como checkpoint oficial bajo licencia GPL-3.0. El repositorio de HuggingFace ocupa 0,7 GB y no cuenta todavía con descargas ni valoraciones.

A diferencia de los modelos de visión por computador convencionales, RadPose no procesa imágenes ni vídeo: infiere la posición tridimensional del cuerpo humano a partir de señales RF, lo que permite estimar la pose en condiciones de baja visibilidad, sin línea de visión directa o preservando la privacidad de las personas al no capturar imágenes. El modelo se publica junto a un repositorio en GitHub y una página de proyecto con demo.

La información pública disponible es muy limitada: la model card no detalla arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (la tarea es de estimación de pose, no de generación de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (el repositorio ocupa 0,7 GB) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo. Por el tipo de tarea (estimación de pose absoluta a partir de señales RF ISAC), se trata de un modelo de regresión sobre representaciones de señal, no de un modelo de lenguaje ni de un transformer generativo multimodal en el sentido habitual. El autor no detalla el número de capas, el tipo de encoder, ni si emplea mecanismos de atención, convoluciones o arquitecturas híbridas.

Tampoco se publican datos sobre el corpus de entrenamiento: no se indica el volumen de muestras, la composición del dataset, el preprocesado de las señales ISAC, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de fusión multisensorial. Toda esta sección queda pendiente de la publicación del paper, que la model card referencia con un enlace genérico a arXiv sin identificador concreto.

## Capacidades

- Estimación de pose humana absoluta (posición 3D del cuerpo en un sistema de coordenadas global) a partir de señales de radiofrecuencia ISAC.
- Funcionamiento sin dependencia de cámaras ni de línea de visión directa, al basarse en RF.
- Preservación de la privacidad: no procesa imágenes de las personas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio ni tool calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplica a la tarea).
- No se documenta un modo "thinking" ni ninguna capacidad especial adicional.

## Casos de uso

- Monitorización de pose en interiores sin cámara: el modelo puede estimar la posición del cuerpo a partir de señales RF en entornos domésticos u hospitalarios donde instalar cámaras resulta invasivo o inviable, preservando la privacidad de los ocupantes.
- Cuidado de personas mayores: detección de caídas y seguimiento postural en residencias mediante infraestructura ISAC ya desplegada, sin necesidad de wearables ni de vídeo continuo.
- Rehabilitación y fisioterapia: seguimiento objetivo de la evolución postural de un paciente a lo largo de sesiones, usando la señal RF como fuente de datos cuantitativa.
- Seguridad y vigilancia perimetral: detección de presencia y postura de personas en zonas de baja visibilidad (humo, oscuridad, obstáculos) donde las cámaras fallan.
- Investigación en sensado integrado: base para experimentos de percepción humana con ISAC en redes 5G/6G, donde la comunicación y el sensado comparten espectro.
- Interacción persona-máquina sin contacto: control gestual o postural en entornos industriales o sanitarios donde el usuario no puede o no debe tocar dispositivos.
- Validación de sistemas de localización: uso del modelo como referencia de pose absoluta para calibrar o comparar otros pipelines de sensado RF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,7 GB) sugiere un modelo de pequeño o medio tamaño, pero no se confirma el número de parámetros ni el peso real de los tensores.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por el tamaño del repositorio es plausible que quepa en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no disponibles (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo de lenguaje, estas herramientas probablemente no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de pose por RF ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al tratarse de un modelo entrenado con señales RF, es previsible que su rendimiento dependa del entorno físico y de la configuración del hardware ISAC, pero no hay datos publicados al respecto.
- Riesgo de error en la estimación de pose no cuantificado: no se publican métricas de error (MPJPE u otras), por lo que no puede evaluarse su precisión.
- No se especifican limitaciones de contexto ni de idioma (no aplica al ser una tarea de regresión sobre señales).
- Licencia GPL-3.0: permite uso comercial, pero obliga a distribuir las obras derivadas bajo la misma licencia y a liberar el código fuente; conviene revisar la compatibilidad con productos propietarios.
- El repositorio no tiene descargas ni valoraciones, y la fecha de creación indicada (2026) es futura respecto a la información habitual de HuggingFace; conviene verificar la autenticidad y vigencia del checkpoint antes de usarlo en producción.
- No hay paper publicado con identificador concreto ni resultados reproducibles, lo que dificulta la validación independiente.
- El modelo no es un modelo de lenguaje: no debe esperarse generación de texto, tool calling ni razonamiento conversacional.

## Enlaces

- [HuggingFace - Geochou/RadPose](https://huggingface.co/Geochou/RadPose)
- [GitHub - RadPose](https://github.com/Geo-Chou/RadPose)
- [Página de proyecto y demo - RadPose](https://geo-zhou.com/projects/2027-radpose)
- Paper: no disponible (la model card enlaza a https://arxiv.org sin identificador)
