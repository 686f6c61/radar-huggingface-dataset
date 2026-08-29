# litert-community/MedGemma-1.5-4B-IT

## Resumen

MedGemma-1.5-4B-IT en formato LiteRT es una conversión del modelo médico de Google MedGemma 1.5 4B IT, publicada por la comunidad litert-community. El objetivo es permitir la ejecución de razonamiento clínico y análisis de imágenes médicas directamente en dispositivos edge (móviles Android, navegadores con WebGPU) mediante LiteRT, el sucesor de TensorFlow Lite. Esto resuelve el problema de la privacidad y la conectividad en entornos sanitarios: los datos del paciente nunca salen del dispositivo y la inferencia funciona sin conexión.

El modelo base, MedGemma 1.5 4B, está especializado en imágenes médicas de alta dimensión (CT, MRI, histopatología de portaobjetos completos), análisis longitudinal de radiografías de tórax y localización anatómica, además de funcionalidad de texto. Al convertirlo a LiteRT, se mantienen estas capacidades en un formato optimizado para inferencia on-device. El repositorio pesa 24,6 GB y el acceso es restringido (gated), con licencia health-ai-developer-foundations.

La relevancia actual radica en la convergencia de dos tendencias: modelos médicos especializados de tamaño medio (4B parámetros) y el despliegue en hardware de consumo. El proyecto AI4MedResearch demuestra una implementación funcional en navegador con WebGPU, lo que acerca la IA clínica a entornos con recursos limitados o requisitos estrictos de confidencialidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 3, arquitectura interna no especificada) |
| Parametros totales | 4B (por denominacion del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | health-ai-developer-foundations |
| Formato de pesos | litert-lm (LiteRT, antiguo TensorFlow Lite) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint google/medgemma-1.5-4b-it al formato LiteRT, realizada por la comunidad litert-community. No se ha realizado ningún entrenamiento adicional sobre el modelo base; se trata de una adaptación de formato para permitir inferencia eficiente en dispositivos edge. El modelo base MedGemma 1.5 4B IT de Google está construido sobre la familia Gemma 3 y ha sido ajustado específicamente para tareas médicas multimodales, incluyendo imágenes de alta dimensión y texto clínico.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) del modelo base en la información proporcionada. Tampoco se especifican innovaciones técnicas particulares de la conversión LiteRT, más allá del uso de la librería litert-lm para la serialización de pesos.

## Capacidades

- Razonamiento clínico sobre texto médico y conversaciones multi-turno de carácter clínico.
- Análisis de imágenes médicas de alta dimensión: tomografía computarizada (CT), resonancia magnética (MRI) e histopatología de portaobjetos completos (whole slide).
- Análisis longitudinal de radiografías de tórax, comparando estudios en el tiempo.
- Localización anatómica en imágenes médicas.
- Funcionalidad multimodal texto-imagen, heredada del modelo base MedGemma 1.5 4B.
- Inferencia 100% on-device con LiteRT, lo que permite operación offline y privada.
- Compatibilidad con despliegue en navegador mediante WebGPU, según la implementación de referencia de AI4MedResearch.

## Casos de uso

- Diagnóstico asistido en entornos sin conexión: el modelo puede ejecutarse en un portátil o tablet en una clínica rural sin acceso a internet, procesando radiografías de tórax y generando informes preliminares con razonamiento clínico.
- Triaje en el punto de atención: en urgencias, un dispositivo móvil con el modelo puede analizar una imagen de TC y sugerir prioridad de atención, reduciendo el tiempo de espera para casos críticos.
- Análisis de histopatología en consulta: el patólogo puede cargar un portaobjetos completo digitalizado en un navegador con WebGPU y obtener sugerencias de localización anatómica o regiones de interés sin enviar datos a la nube.
- Soporte a la decisión clínica en regiones con baja conectividad: hospitales en países en desarrollo pueden desplegar el modelo en hardware local, manteniendo la confidencialidad del paciente y evitando dependencia de infraestructura cloud.
- Educación médica con privacidad: estudiantes de medicina pueden practicar interpretación de imágenes radiológicas en sus propios dispositivos, con datos sintéticos o anonimizados, sin necesidad de acceso a servidores externos.
- Integración en sistemas de registro médico electrónico offline: el modelo puede incrustarse en aplicaciones de gestión clínica que funcionan sin conexión, generando resúmenes de historias clínicas o alertas basadas en hallazgos radiológicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni métricas médicas específicas para esta conversión LiteRT. El modelo base MedGemma 1.5 4B podría tener benchmarks publicados por Google DeepMind, pero no se incluyen en la información proporcionada.

## Requisitos de hardware

- Tamaño del repositorio: 24,6 GB, correspondiente a los pesos completos en formato LiteRT.
- Diseñado para dispositivos edge: Android (vía LiteRT) y navegadores con soporte WebGPU.
- No se especifica VRAM mínima para inferencia en GPU; al ser un modelo de 4B parámetros, se estima que cabría en GPUs de consumo con 8-12 GB de VRAM en cuantizaciones ligeras, pero este dato no está confirmado en la información disponible.
- Opciones de despliegue: LiteRT runtime en Android, WebGPU en navegadores, y potencialmente llama.cpp u otros runtimes si se convierte a GGUF, aunque no se indica en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/MedGemma-1.5-4B-IT | 4B | no disponible | LiteRT | health-ai-developer-foundations | Gated en HuggingFace |
| google/medgemma-1.5-4b-it (original) | 4B | no disponible | Safetensors | health-ai-developer-foundations | Gated en HuggingFace |
| google/gemma-3-4b-it (base general) | 4B | no disponible | Safetensors | Gemma Terms of Use | Abierto |

La comparativa se limita a la disponibilidad y formato, ya que no se dispone de datos de rendimiento para ninguno de los modelos en la información proporcionada. La principal diferencia de esta conversión es el formato LiteRT, que permite ejecución on-device, frente al formato Safetensors del modelo original, que requiere un runtime de propósito general.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo.
- Licencia health-ai-developer-foundations: impone restricciones de uso, probablemente limitando el uso comercial y exigiendo cumplimiento de normativas sanitarias. No se detallan los términos exactos en la información disponible.
- No se dispone de información sobre sesgos conocidos, riesgos de alucinación o limitaciones de idioma específicas de esta conversión.
- Al ser un modelo médico, cualquier uso en producción clínica requiere validación regulatoria y supervisión humana. El modelo no debe utilizarse como único criterio de diagnóstico.
- El tamaño del repositorio (24,6 GB) puede ser excesivo para muchos dispositivos móviles; probablemente sea necesaria una cuantización adicional para despliegues reales en hardware limitado, aunque no se documenta en la información proporcionada.
- La conversión LiteRT puede introducir diferencias numéricas respecto al modelo original en safetensors, lo que podría afectar a la calidad de las predicciones en casos límite.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/MedGemma-1.5-4B-IT
- Repositorio GitHub de implementación edge: https://github.com/AI4MedResearch/edge-ai/tree/medgemma-conversion
- Blog sobre la integración MedGemma + LiteRT: https://ai4medresearch.github.io/blog/2026/medgemma1-5/
- Página oficial de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
