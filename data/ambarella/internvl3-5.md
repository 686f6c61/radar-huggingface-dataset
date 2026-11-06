# Ambarella/InternVL3.5

## Resumen

InternVL3.5 es una familia de modelos multimodales vision-lenguaje desarrollada por OpenGVLab (Shanghai AI Laboratory) y empaquetada en este repositorio por Ambarella para su despliegue en hardware de borde. La serie integra un codificador visual con un modelo de lenguaje de gran escala para comprensión unificada de imagen y texto, con variantes que abarcan desde 1B hasta 20B parámetros (esta última en configuración MoE con 4B activos). El paper de referencia es "InternVL3.5: Advancing Open-Source Multimodal Models in Versatility, Reasoning, and Efficiency" (arXiv:2508.18265).

Este repositorio concreto (Ambarella/InternVL3.5) no contiene los pesos originales en formato estándar, sino artefactos compilados y cuantizados para los SoC de visión de Ambarella (X7, CV7, CV72, CV75, N1-655), empaquetados como archivos `.tar.gz` y destinados al SDK Cooper 2.5.4 y Cooper Foundry 2.3. Es relevante para desarrolladores que necesiten ejecutar modelos vision-lenguaje de InternVL3.5 en dispositivos de borde con aceleración hardware específica, no para inferencia en GPU convencional.

La resolución de entrada es de 3x448x448 píxeles en todas las variantes. El repositorio tiene un tamaño de 49,2 GB y emplea la librería PyTorch como referencia, aunque los artefactos desplegables son binarios precompilados para cada SoC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder + LLM (variante MoE en 20B-A4B); detalles internos no disponibles |
| Parametros totales | 1B, 2B, 4B y 20B (variantes incluidas) |
| Parametros activos | 4B en la variante 20B-A4B (MoE); no aplica al resto |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit (solo variante 20B-A4B en N1-655); resto sin cuantizacion indicada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Artefactos `.tar.gz` compilados para SoC Ambarella; pesos originales en safetensors en repos OpenGVLab |
| Resolucion de entrada | 3x448x448 |
| SDK requerido | Cooper SDK 2.5.4 / Cooper Foundry 2.3 |

## Arquitectura y entrenamiento

La familia InternVL3.5 sigue el patrón de los modelos InternVL previos: un codificador visual acoplado a un modelo de lenguaje, entrenado para alineación imagen-texto y razonamiento multimodal. La variante 20B-A4B combina el codificador visual de InternVL3.5 con un LLM de mezcla de expertos dispersa (MoE), con 20B parámetros totales y 4B activos por token, lo que reduce el coste computacional por inferencia manteniendo capacidad. Las variantes 1B, 2B y 4B son modelos densos de menor tamaño orientados a latencia baja.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. El paper de referencia (arXiv:2508.18265) es la fuente indicada para esos datos. La innovación práctica de este repositorio es la compilación y cuantización de los modelos para los aceleradores de visión de Ambarella, lo que permite ejecutar inferencia multimodal en dispositivos de borde con restricciones severas de potencia y memoria.

## Capacidades

- Comprensión de imagen y texto de forma conjunta (vision-lenguaje).
- Razonamiento multimodal: preguntas visuales, análisis de escenas y documentos.
- Generación de texto condicionada a imagen (image-grounded generation).
- Asistentes visuales en dispositivos de borde (variantes 1B y 2B).
- Análisis de documentos e imágenes de alta precisión (variante 4B).
- Análisis avanzado de escenas y documentos con mayor capacidad (variante 20B-A4B).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información.

## Casos de uso

- Asistentes visuales en cámaras de seguridad y videovigilancia: la variante 1B o 2B compilada para SoC CV7/CV72/CV75 permite describir escenas y detectar eventos en el propio dispositivo, sin enviar vídeo a la nube, reduciendo latencia y coste de ancho de banda.
- Análisis de documentos en dispositivos de borde: la variante 4B en N1-655 o X7 puede procesar imágenes de documentos (facturas, formularios) y extraer información estructurada localmente, útil en entornos con requisitos de privacidad.
- Automoción y sistemas de asistencia a la conducción: la variante 1B en X7 o CV72 puede integrarse en módulos de percepción para interpretar escenas y generar descripciones textuales de bajo nivel en tiempo real.
- Asistentes de accesibilidad en hardware empotrado: la variante 2B en N1-655 puede describir imágenes a personas con discapacidad visual desde una cámara portátil, con inferencia local y sin conectividad.
- Control de calidad industrial: la variante 4B puede analizar imágenes de productos en línea de fabricación y generar informes textuales de defectos, aprovechando la resolución 3x448x448 y el despliegue en SoC Ambarella.
- Análisis de escenas complejas en producción: la variante 20B-A4B cuantizada a 4-bit u 8-bit en N1-655 permite razonamiento multimodal más profundo (documentos densos, escenas con múltiples objetos) manteniendo el coste de inferencia contenido gracias a sus 4B parámetros activos.
- Prototipado con pesos originales: los enlaces a OpenGVLab permiten usar los pesos sin compilar en GPU para validar el comportamiento antes de desplegar en el SoC Ambarella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas multimodales; el paper arXiv:2508.18265 es la fuente indicada para consultar los resultados oficiales de la familia InternVL3.5.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los artefactos de este repositorio (son binarios para SoC, no para GPU). Para los pesos originales en GPU, la VRAM depende de la variante (1B, 2B, 4B, 20B-A4B) y de la cuantización, pero no se proporcionan cifras en la información.
- GPU recomendadas: no disponible. El destino de este repositorio son los SoC Ambarella X7, CV7, CV72, CV75 y N1-655.
- Cabe en GPU de consumo: no disponible para este repositorio; los pesos originales de OpenGVLab podrían ejecutarse en GPU de consumo según variante, pero no se confirma en la información.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 sobre los SoC Ambarella indicados. Para los pesos originales, la implementación de referencia es el repositorio InternVL de OpenGVLab (https://github.com/OpenGVLab/InternVL); no se confirman vLLM, llama.cpp, Ollama ni TGI en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL3.5 (esta ficha) | 1B / 2B / 4B / 20B-A4B | no disponible | no disponible | Pesos compilados para SoC Ambarella; originales en OpenGVLab |
| InternVL3.5-1B/2B/4B (OpenGVLab) | 1B / 2B / 4B | no disponible | no disponible | HuggingFace OpenGVLab |
| InternVL3.5-GPT-OSS-20B-A4B-Preview (OpenGVLab) | 20B (4B activos) | no disponible | no disponible | HuggingFace OpenGVLab |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada para establecer una comparativa cuantitativa con alternativas como Qwen2.5-VL, Llama 3.2 Vision o Phi-3.5-vision.

## Limitaciones y advertencias

- Este repositorio no contiene pesos en formato estándar (safetensors/GGUF) utilizables directamente con frameworks de inferencia convencionales; los artefactos son binarios compilados para SoC Ambarella y requieren Cooper SDK 2.5.4 y Cooper Foundry 2.3.
- La licencia no está indicada en la información disponible; es imprescindible verificar la licencia de los pesos originales de OpenGVLab antes de cualquier uso comercial.
- Los idiomas soportados no están indicados; no se puede confirmar cobertura multilingüe ni calidad en castellano.
- La longitud de contexto no está indicada; no se puede planificar el uso en conversaciones multi-turno largas o documentos extensos sin consultar el paper.
- Riesgo de alucinación: inherente a los modelos vision-lenguaje; no se dispone de evaluaciones específicas de fidelidad en esta información.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El despliegue está restringido a los SoC listados (X7, CV7, CV72, CV75, N1-655); no es portable a otras plataformas sin recompilación.
- La cuantización 4-bit y 8-bit solo está disponible para la variante 20B-A4B en N1-655; el resto de variantes no indica cuantización.
- El repositorio tiene solo 6 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria de estos artefactos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ambarella/InternVL3.5
- Paper: https://arxiv.org/abs/2508.18265
- Implementación de referencia: https://github.com/OpenGVLab/InternVL
- Pesos originales InternVL3.5-1B: https://huggingface.co/OpenGVLab/InternVL3_5-1B
- Pesos originales InternVL3.5-2B: https://huggingface.co/OpenGVLab/InternVL3_5-2B
- Pesos originales InternVL3.5-4B: https://huggingface.co/OpenGVLab/InternVL3_5-4B
- Pesos originales InternVL3.5-GPT-OSS-20B-A4B-Preview: https://huggingface.co/OpenGVLab/InternVL3_5-GPT-OSS-20B-A4B-Preview
- Artefacto 1B para X7: https://huggingface.co/Ambarella/InternVL3.5/blob/main/x7_internvl_3.5_1B.tar.gz
- Artefacto 1B para CV7: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv7_internvl_3.5_1B.tar.gz
- Artefacto 1B para CV72: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv72_internvl_3.5_1B.tar.gz
- Artefacto 1B para CV75: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv75_internvl_3.5_1B.tar.gz
- Artefacto 2B para N1-655: https://huggingface.co/Ambarella/InternVL3.5/blob/main/n1-655_internvl_3.5_2B.tar.gz
- Artefacto 2B para X7: https://huggingface.co/Ambarella/InternVL3.5/blob/main/x7_internvl_3.5_2B.tar.gz
- Artefacto 2B para CV7: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv7_internvl_3.5_2B.tar.gz
- Artefacto 2B para CV72: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv72_internvl_3.5_2B.tar.gz
- Artefacto 4B para N1-655: https://huggingface.co/Ambarella/InternVL3.5/blob/main/n1-655_internvl_3.5_4B.tar.gz
- Artefacto 4B para X7: https://huggingface.co/Ambarella/InternVL3.5/blob/main/x7_internvl_3.5_4B.tar.gz
- Artefacto 4B para CV7: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv7_internvl_3.5_4B.tar.gz
- Artefacto 4B para CV72: https://huggingface.co/Ambarella/InternVL3.5/blob/main/cv72_internvl_3.5_4B.tar.gz
- Artefacto 20B-A4B 4-bit para N1-655: https://huggingface.co/Ambarella/InternVL3.5/blob/main/n1-655_internvl_3.5_20B_A4B_4bit.tar.gz
- Artefacto 20B-A4B 8-bit para N1-655: https://huggingface.co/Ambarella/InternVL3.5/blob/main/n1-655_internvl_3.5_20B_A4B_8bit.tar.gz
