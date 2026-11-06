# Ambarella/SmolVLM2

## Resumen

SmolVLM2 es una familia de modelos compactos de visión-lenguaje (VLM) desarrollada originalmente por Hugging Face, cuyo paper de referencia es "SmolVLM: Redefining small and efficient multimodal models" (arXiv:2504.05299). El repositorio `Ambarella/SmolVLM2` publicado en Hugging Face contiene una adaptación del modelo `SmolVLM2-500M-Video-Instruct` empaquetada para su despliegue sobre los SoC de visión de Ambarella (plataformas X7, CV7, CV72 y CV75), con dependencias de su SDK Cooper (versión 2.5.4) y Cooper Foundry (2.3).

El modelo combina un codificador visual ligero con un modelo de lenguaje pequeño, sumando aproximadamente 500 millones de parámetros, y está optimizado para inferencia multimodal de baja latencia en dispositivos de borde con memoria limitada. La entrada visual se procesa a una resolución de 3x512x512, lo que permite manejar vídeo e imagen con un coste computacional contenido.

Su relevancia actual radica en la creciente demanda de capacidades de comprensión visual en cámaras y dispositivos empotrados sin depender de la nube. Este repositorio concreto no distribuye pesos en formato estándar (safetensors/GGUF) sino artefactos empaquetados por plataforma (archivos `.tar`) para el runtime de Ambarella, lo que limita su uso fuera de ese ecosistema de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM compacto (codificador visual ligero + modelo de lenguaje pequeño); detalles internos no disponibles |
| Parametros totales | ~500M (variante SmolVLM2-500M-Video-Instruct) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los artefactos publicados son paquetes `.tar` para el runtime de Ambarella) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.tar` empaquetados por plataforma (X7, CV7, CV72, CV75); no se publican safetensors ni GGUF en este repo |
| Resolucion de entrada visual | 3x512x512 |
| SDK requerido | Cooper SDK 2.5.4 / Cooper Foundry 2.3 |
| Libreria declarada | pytorch |
| Tamano del repositorio | 1.7 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseño de SmolVLM2: un codificador visual de bajo coste conectado a un modelo de lenguaje pequeño, orientado a reducir el consumo de memoria y la latencia frente a VLMs de mayor tamano. La variante empaquetada aquí es la de 500M de parámetros en su versión "Video-Instruct", pensada para instrucciones multimodales sobre imagen y vídeo. La resolución de procesamiento visual es 3x512x512.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.) más allá de la referencia al paper original de SmolVLM, que es donde habría que consultar esos detalles. La adaptación de Ambarella consiste en la conversión y empaquetado del modelo original de Hugging Face (`HuggingFaceTB/SmolVLM2-500M-Video-Instruct`) para su ejecución sobre sus SoC de visión.

## Capacidades

- Comprensión de imagen y vídeo en un modelo de ~500M de parámetros.
- Respuesta a preguntas visuales (visual question answering).
- Generación de descripciones de imagen (image captioning).
- Comprensión de documentos a partir de su representación visual.
- Asistentes multimodales en tiempo real sobre dispositivos de borde.
- Procesamiento de entrada visual a resolución 3x512x512.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- **Vigilancia y analítica de vídeo en cámara**: el modelo se ejecuta sobre los SoC CV7/CV72/CV75 de Ambarella y puede describir o responder preguntas sobre el flujo de vídeo directamente en el dispositivo, evitando enviar el vídeo a la nube y reduciendo el ancho de banda.
- **Asistente multimodal de borde en tiempo real**: con ~500M de parámetros y entrada a 512x512, encaja en dispositivos con memoria limitada para interacción por voz o texto acompañada de imagen, con latencia baja al no requerir round-trip de red.
- **Etiquetado y captioning automático de imágenes**: útil para generar metadatos descriptivos en pipelines de gestión de activos digitales o archivos fotográficos, ejecutándose localmente.
- **Comprensión de documentos escaneados**: para extracción de información de facturas, formularios o tickets a partir de la imagen del documento en dispositivos de captura (escáneres, terminales de punto de venta).
- **Accesibilidad**: descripción de escenas o imágenes para personas con discapacidad visual en dispositivos portátiles, aprovechando el bajo consumo del modelo.
- **Inspección visual industrial**: verificación de piezas o lectura de indicadores en líneas de producción mediante cámaras con SoC Ambarella, respondiendo a preguntas sobre la imagen capturada sin infraestructura de servidor.
- **Preprocesado multimodal en robótica y drones**: interpretación de la cámara a bordo para tareas de navegación asistida o detección guiada por lenguaje, donde el presupuesto de cómputo y energía es crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Plataformas soportadas**: SoC de visión de Ambarella X7, CV7, CV72 y CV75, mediante los paquetes `.tar` publicados en el repositorio.
- **Software requerido**: Cooper SDK 2.5.4 y Cooper Foundry 2.3.
- **VRAM estimada**: no disponible; el modelo está orientado a memoria unificada de SoC de borde, no a GPU de escritorio.
- **GPU recomendadas (A100, H100, RTX 4090, etc.)**: no aplica según la información disponible; el repositorio no publica pesos en formato estándar para inferencia en GPU.
- **¿Cabe en GPU de consumo?**: no disponible en el formato publicado; el modelo original de 500M sí es de tamano reducido, pero este repositorio no ofrece artefactos para ese uso.
- **Opciones de despliegue**: runtime de Ambarella (Cooper SDK/Foundry) sobre X7/CV7/CV72/CV75. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada visual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ambarella/SmolVLM2 (esta ficha) | ~500M | no disponible | 3x512x512 | no disponible | Pesos `.tar` para SoC Ambarella |
| HuggingFaceTB/SmolVLM2-500M-Video-Instruct | ~500M | no disponible | no disponible | no disponible | Pesos originales en Hugging Face |
| Modelo VLM compacto de Liquid AI (~450M) citado en el Model Garden de Ambarella | ~450M | no disponible | no disponible | no disponible | Model Garden de Ambarella |

La comparación con alternativas de la misma categoría queda limitada por la ausencia de datos de contexto, licencia y benchmarks en la información proporcionada. La diferencia principal de este repositorio frente al modelo original de Hugging Face es el empaquetado para hardware Ambarella, no una mejora de capacidades.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no declara licencia, por lo que no se puede confirmar el uso comercial; hay que verificar la licencia del modelo original `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` antes de desplegarlo en producción.
- **Dependencia de hardware propietario**: los pesos publicados son paquetes `.tar` para el runtime de Ambarella; no son utilizables directamente en GPU estándar ni con frameworks como transformers, vLLM o llama.cpp.
- **Riesgo de alucinación**: como todo VLM de ~500M de parámetros, la precisión en descripciones detalladas y en lectura de texto en imágenes es limitada; conviene validar las salidas en aplicaciones críticas.
- **Sesgos**: no se documentan evaluaciones de sesgo en la información disponible.
- **Idiomas**: no se especifican los idiomas soportados; el modelo original está orientado principalmente al inglés, pero este dato no se confirma aquí.
- **Contexto y resolución**: la entrada visual está fijada a 3x512x512, lo que puede degradar la lectura de documentos con texto pequeño o escenas muy detalladas.
- **Madurez del repositorio**: 9 descargas y 0 likes sugieren poca adopción y validación por parte de la comunidad; el pipeline no está declarado.
- **Trazabilidad**: la model card es mínima y remite al paper y al repositorio `smollm` de Hugging Face para detalles técnicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ambarella/SmolVLM2
- Árbol de archivos del repositorio: https://huggingface.co/Ambarella/SmolVLM2/tree/main
- Paper de referencia (SmolVLM): https://arxiv.org/abs/2504.05299
- Modelo original: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Implementación de referencia: https://github.com/huggingface/smollm
- Código de SmolVLM2 en el repositorio smollm: https://github.com/huggingface/smollm/tree/main/vision/smolvlm2
- Model Garden de Ambarella: https://www.ambarella.com/developer/model-garden/
- Sitio de Ambarella: https://www.ambarella.com/
