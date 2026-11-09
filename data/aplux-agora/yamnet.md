# APLUX-Agora/YamNet

## Resumen

YamNet es un modelo de clasificación de audio publicado en Hugging Face por APLUX-Agora dentro de su iniciativa Agora, orientada al despliegue de modelos en hardware Qualcomm para escenarios AIoT (inteligencia artificial en el Internet de las cosas). El repositorio no contiene los pesos originales en formato estándar de PyTorch o safetensors, sino artefactos compilados y empaquetados para ejecución sobre SoC Qualcomm concretos, con verificación por placa. La model card documenta una única plataforma validada: el SoC QCS8550 montado en la placa Rhino Pi X1, con precisión FP16 y una latencia medida de 9,7 ms.

El modelo resuelve la tarea de clasificación de eventos sonoros: recibe una entrada de audio y devuelve una etiqueta. Es relevante para equipos que necesitan desplegar detección de sonido en dispositivos de borde con aceleración Qualcomm sin pasar por el proceso de conversión y validación por placa, ya que APLUX-Agora distribuye los binarios ya compilados junto con la guía de despliegue y el runner.

La información pública disponible es muy limitada: el repositorio ocupa 0,0 GB, no declara idiomas soportados, no expone pipeline en Hugging Face y no publica parámetros, arquitectura ni resultados de benchmarks más allá de la latencia medida en la placa indicada. La licencia de los recursos convertidos es la APLUX Model Farm License, mientras que la licencia del modelo fuente original se remite a los términos del modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de audio; artefactos compilados para Qualcomm QNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada de audio, no texto) |
| Tipos de cuantizacion | FP16 (precisión por defecto en QCS8550); no se listan otras precisiones en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License para los recursos convertidos; licencia del modelo fuente según los términos del modelo original |
| Formato de pesos | artefactos Qualcomm: `model.json` por SoC y directorios por precisión con binarios `model.bin`; paquetes multifichero tal como los publica Model Farm |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo fuente (familia, número de capas, mecanismo de atención o diseño de la cabeza de clasificación). La model card solo describe la tarea (clasificación de audio con entrada `audio` y salida `label`) y el proceso de empaquetado: los recursos se han convertido usando el preprocesado y los ejemplos oficiales de Model Farm, y se han validado placa a placa sobre hardware Qualcomm real.

Tampoco se documentan los datos de entrenamiento, el número de tokens o horas de audio, la composición del dataset ni si hubo ajuste fino con técnicas de alineación como RLHF o DPO. La única innovación técnica verificable es la de despliegue: los binarios están compilados para el SoC QCS8550 con precisión FP16 y se distribuyen organizados por `targets/<SoC>/`, con un `model.json` que indica la precisión por defecto y las rutas de cada variante. El repositorio incluye además `NOTICE.md` y `SHA256SUMS` para trazabilidad e integridad de los artefactos.

## Capacidades

- Clasificación de audio: recibe una señal de audio y emite una etiqueta como salida.
- Inferencia en dispositivo de borde sobre SoC Qualcomm QCS8550 con precisión FP16.
- Despliegue con el runner y el proyecto exportado que proporciona la plataforma Agora.
- Prueba en línea sin hardware físico a través de la plataforma Agora.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no es un modelo de texto).
- Modo thinking, visión o audio generativo: no disponible.

## Casos de uso

- Detección de eventos sonoros en dispositivos AIoT: el modelo se ejecuta sobre el SoC QCS8550 con una latencia de 9,7 ms en FP16, adecuado para clasificar sonidos ambientales en tiempo real en cámaras, sensores o pasarelas de borde.
- Monitorización acústica industrial: integrado en equipos con Qualcomm QCS8550 para etiquetar sonidos anómalos de maquinaria y disparar alertas locales sin enviar audio a la nube.
- Clasificación de audio en robótica de borde: la placa Rhino Pi X1 con QCS8550 puede ejecutar el modelo junto con otras cargas, usando la etiqueta de salida como señal de contexto para la navegación o la interacción.
- Prototipado rápido sin hardware: la plataforma Agora permite probar el modelo en línea antes de comprar o desplegar la placa, lo que reduce el coste de evaluación inicial.
- Validación de pipelines de conversión: los recursos sirven como referencia verificada de preprocesado y postprocesado de Model Farm para equipos que conviertan sus propios modelos de audio a QNN.
- Integración en productos de consumo con Qualcomm: la disponibilidad de binarios ya compilados y verificados por placa acorta el ciclo de puesta en producción de funciones de reconocimiento de sonido en dispositivos domésticos.

## Benchmarks y rendimiento

| Metrica | Valor | Plataforma |
|---|---|---|
| Latencia de inferencia (FP16) | 9,7 ms | QCS8550 · Rhino Pi X1 |

No se han publicado resultados de benchmarks de precisión (accuracy, mAP, F1) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo está empaquetado para NPU/SoC Qualcomm, no para GPU de escritorio).
- GPU recomendadas: no aplica; la plataforma validada es el SoC QCS8550 en la placa Rhino Pi X1.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: runner y proyecto exportado de la plataforma Agora, con binarios Qualcomm QNN organizados por `targets/<SoC>/`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 9,7 ms por inferencia en QCS8550 con FP16 (precisión por defecto); no se publica throughput agregado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de clasificación de audio en hardware Qualcomm.

## Limitaciones y advertencias

- Cobertura de hardware muy reducida: solo se documenta validación en QCS8550 (Rhino Pi X1); no hay garantía de funcionamiento en otros SoC Qualcomm.
- Ausencia de métricas de calidad: no se publican accuracy, mAP ni matrices de confusión, por lo que no es posible evaluar la precisión del clasificador con los datos disponibles.
- Sesgos conocidos: no disponible; no se documenta la composición del dataset de entrenamiento ni posibles sesgos acústicos o de dominio.
- Riesgo de alucinación: no aplica en el sentido generativo, pero no se documenta la calibración de confianza de las etiquetas de salida.
- Limitaciones de idioma: no disponible; al ser un modelo de audio, la noción de idioma no se aplica directamente, pero no se especifica qué clases de sonido cubre.
- Restricciones de licencia: los recursos convertidos usan la APLUX Model Farm License, que debe revisarse antes de uso comercial; además, la licencia del modelo fuente se remite a los términos del modelo original, lo que puede imponer condiciones adicionales.
- Repositorio sin pesos estándar: no contiene safetensors ni GGUF, lo que impide reutilizar el modelo fuera del ecosistema Agora/Qualcomm sin un proceso de conversión propio.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario que permita contrastar su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/APLUX-Agora/YamNet
- Prueba en línea en Agora: https://mega.aidlux.com/models/yamnet
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/YamNet/blob/main/LICENSE_MODEL_FARM.pdf
