# saymynameX1/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech) ligero y de código abierto desarrollado por Supertone, diseñado para ejecutarse íntegramente en local mediante ONNX Runtime, sin necesidad de GPU, conexión a la nube ni llamadas a API. La versión 3 amplía el lanzamiento de pesos abiertos de 5 a 31 idiomas, mejora la estabilidad de lectura y reduce los fallos de repetición y omisión de palabras, además de incorporar etiquetas de expresión como `<laugh>`, `<breath>` y `<sigh>`. Con solo 99 millones de parámetros y un tamaño de repositorio de 0,4 GB, está pensado para despliegues en dispositivos con recursos limitados, manteniendo una calidad competitiva frente a soluciones propietarias.

El modelo se distribuye bajo licencia OpenRAIL, lo que permite uso comercial con restricciones de responsabilidad, y se integra mediante el SDK de Python `supertonic`, que descarga automáticamente los pesos desde Hugging Face en la primera ejecución. Su arquitectura interna no se detalla públicamente, pero su formato ONNX y su enfoque en inferencia local lo convierten en una opción atractiva para aplicaciones de voz embebidas, asistentes y generación de contenido multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS propietario, distribuido en formato ONNX) |
| Parametros totales | 99 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de texto, no ventana de contexto) |
| Tipos de cuantizacion | No disponible (pesos ONNX estándar; existe un repositorio de cuantización no oficial: `q3146dq4/supertonic-3-quant`) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

La arquitectura interna de Supertonic 3 no se ha hecho pública. El modelo se distribuye exclusivamente en formato ONNX, lo que indica un diseño optimizado para inferencia eficiente en CPU, probablemente basado en redes neuronales convolucionales o transformadores ligeros típicos de sistemas TTS modernos. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación (RLHF/DPO). La documentación oficial destaca mejoras en la estabilidad de lectura y una mayor similitud de la voz generada con la referencia respecto a Supertonic 2, lo que sugiere un refinamiento en el entrenamiento de codificación de hablante y prosodia. El modelo admite estilos de voz predefinidos (M1, etc.) y, mediante la herramienta Voice Builder, permite crear estilos personalizados a partir de audio de referencia (zero-shot), aunque estos estilos personalizados requieren una compra y descarga de embeddings específicos.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo inglés, coreano, japonés, español, francés, alemán y árabe, entre otros.
- Generación de audio en tiempo real en CPU, sin necesidad de GPU ni conexión a la nube.
- Soporte de etiquetas de expresión para controlar emociones y efectos vocales: `<laugh>`, `<breath>` y `<sigh>`.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos (por ejemplo, la voz "M1").
- Capacidad de clonación de voz zero-shot mediante el servicio Voice Builder (embeddings descargables para Supertonic 2 y 3).
- Reproducción estable en frases cortas y largas, con reducción de fallos de repetición y omisión.
- Integración sencilla vía SDK de Python (`pip install supertonic`) con descarga automática de activos.

## Casos de uso

- Audiolibros y narración: el modelo genera voz natural con control de expresiones, adecuado para convertir texto largo en audio con pausas y entonación correctas. Su estabilidad en frases extensas lo hace viable para capítulos completos.
- Atención al cliente automatizada: los estilos de voz predefinidos y la generación local permiten desplegar IVRs o asistentes telefónicos sin depender de servicios externos, garantizando privacidad de los datos del cliente.
- Doblaje y localización de contenido: al soportar 31 idiomas, puede generar voces para vídeos, anuncios o videojuegos en múltiples mercados sin necesidad de estudios de grabación.
- Asistentes de voz embebidos: su bajo consumo de recursos (99M parámetros, CPU) lo hace apto para dispositivos IoT, barras de sonido o aplicaciones móviles con procesamiento en el dispositivo.
- Generación de contenido para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de accesibilidad que requieren síntesis de voz local y sin conexión.
- Creación de voces personalizadas para personajes: mediante Voice Builder, un usuario puede crear un estilo de voz único a partir de una muestra de audio y usarlo en producciones creativas, como podcasts o animaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación menciona mejoras cualitativas respecto a Supertonic 2 (mayor similitud de voz, menos fallos de lectura), pero no se ofrecen métricas numéricas como MOS (Mean Opinion Score) ni comparativas con otros modelos TTS.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU mediante ONNX Runtime. No se requiere GPU.
- Memoria: el repositorio pesa 0,4 GB, por lo que la carga en RAM es inferior a 1 GB en la mayoría de los casos.
- GPU recomendadas: ninguna. Si se desea aceleración, es posible usar GPU con soporte de ONNX Runtime, pero no es necesario.
- Compatibilidad con hardware de consumo: cualquier ordenador portátil o de sobremesa moderno con CPU x86_64 o ARM (por ejemplo, Raspberry Pi 4 o superior) debería poder ejecutarlo.
- Opciones de despliegue: SDK de Python (`supertonic`), integración directa con ONNX Runtime, o uso del repositorio de cuantización no oficial para reducir aún más el tamaño.
- Latencia y throughput: no se proporcionan cifras oficiales. El modelo se describe como "lightning fast", pero no hay datos concretos de RTF (Real-Time Factor).

## Comparativa con modelos similares

No se dispone de datos comparativos directos entre Supertonic 3 y otros modelos TTS open source en la información proporcionada. Como referencia cualitativa, se puede situar frente a Piper (TTS ligero basado en VITS, multilingüe) y Coqui TTS (modelos más grandes con mayor calidad pero mayor coste computacional). Supertonic 3 destaca por su formato ONNX, su soporte de 31 idiomas y su enfoque en inferencia en CPU, pero no se han publicado mediciones objetivas que permitan una comparación numérica.

## Limitaciones y advertencias

- La arquitectura interna no está documentada, lo que dificulta la depuración o la adaptación a casos muy específicos.
- El modelo incluye estilos de voz predefinidos limitados; la clonación zero-shot requiere el servicio comercial Voice Builder, cuyos embeddings no son gratuitos.
- La licencia OpenRAIL permite uso comercial, pero impone restricciones sobre el uso para generar contenido engañoso o fraudulento (clonación de voz sin consentimiento). Es responsabilidad del usuario cumplir con estas condiciones.
- No se han publicado datos sobre sesgos, calidad en todos los idiomas o comportamiento con acentos regionales. La cobertura de 31 idiomas puede no ser uniforme.
- El modelo está pensado para síntesis de voz; no soporta entrada de audio ni otras modalidades.
- No hay información sobre el manejo de entradas de texto muy largas o de múltiples párrafos; aunque la documentación menciona estabilidad en frases largas, no se especifica un límite máximo de caracteres.
- El repositorio `saymynameX1/supertonic-3` parece ser una copia o mirror; el modelo oficial está alojado en `Supertone/supertonic-3`. Se recomienda verificar la procedencia antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace (oficial): https://huggingface.co/Supertone/supertonic-3
- Repositorio HuggingFace (mirror mencionado): https://huggingface.co/saymynameX1/supertonic-3
- Repositorio de cuantización no oficial: https://huggingface.co/q3146dq4/supertonic-3-quant
- Código fuente y SDK: https://github.com/supertone-inc/supertonic
- Demo de audio y comparativas: https://supertonic3.github.io/
- Herramienta Voice Builder: https://supertonic.supertone.ai/voice-builder
- Paquete PyPI: https://pypi.org/project/supertonic/
- Espacio de demostración en Hugging Face: https://huggingface.co/spaces/Supertone/supertonic-3
