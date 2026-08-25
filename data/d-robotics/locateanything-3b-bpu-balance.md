# D-Robotics/LocateAnything-3B-BPU-Balance

## Resumen

LocateAnything-3B-BPU-Balance es un modelo de grounding visual de código abierto desarrollado por D-Robotics, orientado a la ejecución eficiente en unidades de procesamiento BPU (Brain Processing Unit). Se trata de una adaptación del modelo LocateAnything original de NVIDIA, diseñado para realizar localización de objetos, referencias por lenguaje, grounding de GUI y texto, así como localización de puntos a partir de instrucciones textuales. La versión "BPU-Balance" busca equilibrar precisión y velocidad en hardware embebido, lo que la hace relevante para aplicaciones de robótica, visión industrial y sistemas autónomos.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Sin embargo, la información técnica disponible es muy limitada: no se proporcionan especificaciones detalladas sobre arquitectura, tamaño de contexto o parámetros exactos en la ficha de HuggingFace. El nombre sugiere una escala de 3 mil millones de parámetros, y el tamaño del repositorio (4,6 GB) es coherente con esa magnitud, aunque no se confirma oficialmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | No disponible (nombre sugiere ~3B, sin confirmar) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El repositorio de GitHub de D-Robotics (hobot_locateanything) describe el modelo como un sistema de grounding visual de semántica abierta que emplea PBD (Parallel Box Decoding) para generar coordenadas de bounding boxes en paralelo. Se presume que se basa en una arquitectura transformer multimodal (texto e imagen), similar a otros modelos de grounding como Grounding DINO o GLIP, pero no hay confirmación oficial. Tampoco se han publicado detalles sobre el dataset de entrenamiento, número de tokens o técnicas de alineación como RLHF o DPO.

## Capacidades

- Localización de objetos: detecta y localiza objetos en imágenes a partir de descripciones textuales.
- Grounding de expresiones referenciales: asocia frases como "el coche rojo a la izquierda" con la región correspondiente en la imagen.
- Grounding de GUI y texto: identifica elementos de interfaz de usuario o texto en capturas de pantalla o documentos.
- Grounding de layout de documentos: localiza secciones o elementos dentro de documentos.
- Localización de puntos: determina coordenadas de puntos específicos a partir de instrucciones.
- Soporte de decodificación paralela de cajas (PBD) para generar múltiples bounding boxes de forma eficiente.

## Casos de uso

- Automatización de interfaces gráficas: el modelo puede localizar botones, campos de texto y otros elementos en capturas de pantalla, facilitando la automatización de tareas de UI en pruebas de software o asistentes virtuales.
- Robótica y navegación: al localizar objetos mediante descripciones en lenguaje natural, puede usarse para guiar robots en entornos no estructurados, por ejemplo, "encuentra la taza azul en la mesa".
- Análisis de documentos: para extraer información de documentos escaneados localizando secciones, tablas o figuras a partir de instrucciones textuales.
- Asistentes de accesibilidad: ayuda a personas con discapacidad visual describiendo la ubicación de objetos en el entorno mediante cámara.
- Moderación de contenido: localizar objetos específicos en imágenes (p. ej., logotipos, productos) para verificar cumplimiento o filtrar contenido.
- Inspección industrial: localizar defectos o piezas en imágenes de producción a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de rendimiento comparativo con otros modelos de grounding visual.

## Requisitos de hardware

- VRAM estimada: no disponible. Para un modelo de ~3B, se estima que en FP16 necesitaría alrededor de 6-8 GB de VRAM, pero no se confirma.
- GPU recomendadas: no disponible. La versión "BPU" sugiere que está optimizada para ejecución en hardware embebido de D-Robotics, como el RDK X3.
- Compatibilidad con consumer GPU: no confirmado. Es probable que funcione en GPUs con suficiente VRAM (RTX 3060 o superior), pero no hay documentación.
- Opciones de despliegue: no disponible. Se desconoce si es compatible con vLLM, llama.cpp, Ollama, TGI u otros frameworks. El repositorio rdk_model_zoo sugiere que se puede desplegar en plataformas BPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con alternativas. El modelo original de NVIDIA (LocateAnything-3B) podría ser comparable, pero no se tienen datos de rendimiento. Otras opciones de grounding visual como Grounding DINO o GLOW no están disponibles en este contexto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No hay información sobre sesgos o alucinaciones específicas del modelo. Al ser un modelo de grounding visual, puede fallar en imágenes complejas o con instrucciones ambiguas.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones de uso o atribución adicionales.
- El modelo está orientado a BPU, por lo que su rendimiento en GPUs generales podría no estar optimizado.
- No se documenta el soporte de idiomas; se presume que al menos inglés, pero no se confirma.
- No hay información sobre la precisión en tareas de grounding en comparación con modelos de tamaño similar.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/D-Robotics/LocateAnything-3B-BPU-Balance)
- [Repositorio GitHub hobot_locateanything](https://github.com/D-Robotics/hobot_locateanything)
- [Repositorio rdk_model_zoo](https://github.com/D-Robotics/rdk_model_zoo)
