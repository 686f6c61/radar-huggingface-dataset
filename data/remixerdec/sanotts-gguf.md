# remixerdec/SanoTTS-GGUF

## Resumen

SanoTTS-GGUF es una colección de pesos cuantizados en formato GGUF de la familia de modelos sanoTTS, desarrollada por remixerdec. El repositorio contiene seis voces Piperlite (Amy, Amy-small, HFC, Kristin, vietnamita e indonesio), cada una con tres niveles de cuantización (Q2_K, Q4_0 y Q8_0), lo que resulta en 18 archivos de modelo con tamaños que oscilan entre 0,50 y 1,91 MiB. El modelo base es ampixa/sanoTTS, y la cuantización permite ejecutar síntesis de voz en dispositivos con memoria muy limitada, como microcontroladores ESP32.

El modelo total tiene 1.458.304 parámetros y está diseñado para inferencia local en CPU, sin necesidad de GPU. Su principal ventaja es la capacidad de generar voz en tiempo real en hardware de borde, con una latencia de aproximadamente cinco segundos por frase corta en un ESP32-S3 con el modelo Amy cuantizado en Q4_0. La inferencia se realiza mediante el motor InflectSanoTTS.cpp, optimizado para dispositivos de bajo consumo.

La relevancia de este modelo radica en la creciente demanda de soluciones de inteligencia artificial en el borde (edge AI), donde el consumo energético y la memoria son limitaciones críticas. Al ofrecer síntesis de voz en un footprint inferior a 2 MiB, SanoTTS-GGUF permite implementar asistentes de voz, sistemas de anuncios y dispositivos de accesibilidad en entornos donde los modelos TTS convencionales no son viables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo se describe como Piperlite y utiliza el inventario de fonemas de Piper |
| Parametros totales | 1.458.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS) |
| Tipos de cuantizacion | Q2_K, Q4_0, Q8_0 |
| Idiomas soportados | Ingles (voces amy, amy-small, hfc, kristin), vietnamita (vi), indonesio (id) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

SanoTTS-GGUF es una version cuantizada del modelo sanoTTS original. El proceso de cuantizacion genera variantes Q2_K, Q4_0 y Q8_0 para cada voz, reduciendo el tamano de los pesos y permitiendo su ejecucion en dispositivos con memoria limitada. El repositorio incluye lexicos SNL2 (archivos `lexicon.snl`) que mapean palabras a los identificadores de fonemas de Piper necesarios para el frontend de texto. Las voces en ingles comparten el lexico generado para Amy, mientras que las voces vietnamita e indonesia tienen lexicos propios generados para sus inventarios de fonemas.

No se proporcionan datos sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en la informacion disponible. La innovacion tecnica destacable es la optimizacion para inferencia en microcontroladores: el motor InflectSanoTTS.cpp, disenado para dispositivos de borde, permite ejecutar los modelos cuantizados en hardware como el ESP32-S3 con un consumo minimo de recursos.

## Capacidades

- Sintesis de texto a voz (text-to-speech) en seis voces distintas.
- Tres niveles de cuantizacion por voz: Q2_K (mayor compresion), Q4_0 (equilibrio) y Q8_0 (mayor fidelidad).
- Inferencia local en CPU, sin necesidad de GPU ni conexion a internet.
- Ejecucion en microcontroladores de bajo consumo, como el ESP32-S3.
- Soporte de lexicos SNL2 para la conversion de texto a fonemas.
- Uso del inventario de fonemas de Piper para las voces en ingles.
- Voces en tres idiomas: ingles, vietnamita e indonesio.
- Tamano de modelo extremadamente reducido (0,50 a 1,91 MiB por archivo).

## Casos de uso

- Asistentes de voz en dispositivos IoT: el modelo puede ejecutarse en un ESP32-S3 y pronunciar frases cortas en aproximadamente cinco segundos, lo que permite construir asistentes de voz offline para domotica o control de dispositivos.
- Sistemas de anuncios en puntos de venta: los modelos cuantizados pueden integrarse en pequenos paneles embebidos para anunciar ofertas o mensajes promocionales sin necesidad de hardware especializado.
- Juguetes educativos interactivos: la capacidad de ejecutar TTS en microcontroladores permite dotar de voz a juguetes de bajo coste sin depender de servicios en la nube.
- Dispositivos de accesibilidad: lectores de pantalla y sistemas de asistencia para personas con discapacidad visual pueden funcionar completamente offline en hardware de bajo consumo.
- Sintesis de voz en wearables: relojes inteligentes o pulseras con capacidad de procesamiento limitada pueden generar respuestas habladas para notificaciones o recordatorios.
- Prototipado rapido de productos con voz: los desarrolladores pueden utilizar los modelos GGUF para validar flujos de interaccion hablada en hardware de borde antes de invertir en soluciones mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento documentado es que, en un ESP32-S3, el modelo Amy cuantizado en Q4_0 tarda aproximadamente cinco segundos en pronunciar una frase corta. No existen metricas comparativas con otros modelos TTS en la documentacion del repositorio.

## Requisitos de hardware

- VRAM estimada: 0 MB (inferencia exclusivamente en CPU).
- GPU recomendada: ninguna; el modelo esta disenado para ejecutarse en CPU o microcontroladores.
- Compatibilidad con hardware de consumo: modelos de 0,50 a 1,91 MiB, aptos para ESP32-S3 y otros microcontroladores con memoria suficiente.
- Opciones de despliegue: motor InflectSanoTTS.cpp (repositorio remixer-dec/InflectNanoTTS.cpp), compatible con el formato GGUF.
- Latencia conocida: aproximadamente 5 segundos por frase corta en ESP32-S3 con cuantizacion Q4_0.
- No requiere GPU ni aceleradores externos; el consumo energetico es minimo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso en edge |
|---|---|---|---|---|
| SanoTTS-GGUF (este modelo) | 1.458.304 | GGUF (Q2_K, Q4_0, Q8_0) | GPL-3.0 | Si, optimizado para ESP32 |
| sanoTTS (modelo base) | No disponible | Safetensors | GPL-3.0 | No disponible |
| Piper (modelos estandar) | No disponible | ONNX | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de muy pequeno tamano (1.458.304 parametros): la calidad de la voz sera inferior a la de modelos TTS mas grandes.
- Solo seis voces disponibles, lo que limita la variedad de tonos y estilos de habla.
- Licencia GPL-3.0: es una licencia copyleft que puede imponer obligaciones de distribucion del codigo fuente en usos comerciales.
- No se han publicado datos sobre el proceso de entrenamiento, la composicion del dataset ni el rendimiento en benchmarks.
- Modelo nuevo con 0 descargas y 0 likes en el momento de la consulta: la validacion por parte de la comunidad es minima.
- Latencia de aproximadamente cinco segundos por frase corta en ESP32-S3: puede resultar insuficiente para aplicaciones que requieran respuestas inmediatas.
- Sin soporte de tool calling, agentes, vision ni otras capacidades multimodales; es exclusivamente un modelo de sintesis de voz.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/remixerdec/SanoTTS-GGUF
- Modelo base sanoTTS: https://huggingface.co/ampixa/sanoTTS
- Motor de inferencia InflectSanoTTS.cpp: https://github.com/remixer-dec/InflectNanoTTS.cpp
- Comunidad de novedades del modelo: https://t.me/genaimon
