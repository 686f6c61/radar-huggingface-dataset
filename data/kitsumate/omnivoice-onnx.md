# KitsuMate/omnivoice-onnx

## Resumen

OmniVoice ONNX es una adaptación del modelo de síntesis de voz OmniVoice, originalmente desarrollado por los contribuyentes de k2-fsa, exportado a formato ONNX para su integración en el runtime KitsuMate de Unity. El modelo permite generar voz a partir de texto con capacidades avanzadas como clonación de voz, diseño de voz y condicionamiento por idioma, todo ello en un formato portable que puede ejecutarse en diferentes proveedores de ONNX Runtime.

La relevancia de este modelo radica en su enfoque en entornos de desarrollo de videojuegos y aplicaciones interactivas, donde se necesita síntesis de voz en tiempo real sin depender de servicios en la nube. Al estar disponible en perfiles cuantizados (int4) y de precisión completa (fp32), ofrece flexibilidad para ejecutarse en CPU o GPU según los requisitos del proyecto. La licencia Apache-2.0 permite su uso comercial, lo que lo hace atractivo para integraciones en productos.

El repositorio incluye cuatro perfiles distintos: `cpu-split-int4` para CPU con cuantización, `portable-merged-fp32` para cualquier proveedor ONNX, y dos codecs de Higgs Audio V2 (fp16 y fp32) para el procesamiento de audio. La implementación soporta decodificación iterativa enmascarada de 32 pasos, guidance sin clasificador y controles inline de OmniVoice, lo que lo convierte en una solución completa para síntesis de voz en aplicaciones Unity.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen (según perfiles ONNX), con decodificación iterativa enmascarada y guidance sin clasificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (perfil cpu-split-int4), fp32 (portable-merged-fp32), fp16 (codec-fp16), fp32 (codec-fp32) |
| Idiomas soportados | multilingüe (idiomas específicos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento

La arquitectura del modelo se basa en Qwen como backbone, según se indica en el perfil `cpu-split-int4` que menciona "split embedding, Qwen, and audio-head graphs". El sistema utiliza un proceso de decodificación iterativa enmascarada de 32 pasos, junto con classifier-free guidance para mejorar la calidad de la síntesis. Además, incorpora mecanismos de clonación de voz, diseño de voz, condicionamiento de idioma y controles inline de OmniVoice, que permiten ajustar la salida en tiempo real.

No se dispone de información sobre los datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo es una exportación ONNX de OmniVoice, por lo que las características de entrenamiento corresponden al modelo original de k2-fsa, pero no se detallan en la documentación proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe.
- Clonación de voz: permite replicar una voz a partir de una muestra de audio.
- Diseño de voz: genera voces personalizadas según parámetros configurables.
- Condicionamiento por idioma: ajusta la pronunciación y entonación según el idioma.
- Controles inline de OmniVoice: permite modificar la salida durante la generación.
- Decodificación iterativa enmascarada de 32 pasos con classifier-free guidance.
- Integración con Unity a través del runtime KitsuMate, con perfiles optimizados para CPU y GPU.

## Casos de uso

- Diálogos dinámicos en videojuegos: el modelo puede generar voces para personajes no jugables en tiempo real, adaptando el tono y la emoción mediante los controles inline, lo que mejora la inmersión sin necesidad de archivos de audio pre-grabados.
- Narración interactiva en realidad virtual: en experiencias VR, la síntesis de voz con clonación permite que el narrador tenga una voz consistente y personalizable, mientras que el bajo consumo del perfil int4 facilita su ejecución en dispositivos con recursos limitados.
- Asistentes de voz en aplicaciones de escritorio: gracias a su licencia Apache-2.0 y su formato ONNX, puede integrarse en aplicaciones de productividad o accesibilidad para leer texto en voz alta con voces naturales.
- Creación de contenido automatizada: generación de audiolibros o podcasts a partir de texto, utilizando la clonación de voz para mantener una voz uniforme en largas sesiones de narración.
- Prototipado rápido en Unity: los desarrolladores pueden probar diferentes voces y estilos de narración sin esperar a la grabación de audio, acelerando el ciclo de diseño de experiencias interactivas.
- Herramientas de accesibilidad: lectura de pantalla para personas con discapacidad visual, donde la clonación de voz permite usar una voz familiar y agradable, mejorando la experiencia del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la documentación.
- El perfil `cpu-split-int4` está diseñado para ejecución en CPU con cuantización int4, lo que sugiere que puede funcionar en hardware sin GPU dedicada.
- El perfil `portable-merged-fp32` es compatible con cualquier proveedor de ONNX Runtime que pueda crear todas las sesiones, por lo que puede ejecutarse en CPU, GPU (CUDA, DirectML, etc.) u otros aceleradores.
- Los codecs `codec-fp16` y `codec-fp32` son para el procesamiento de audio y acompañan a los perfiles principales.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de síntesis de voz en formato ONNX. La documentación no incluye referencias a alternativas como Piper, Coqui TTS o VITS, ni datos de rendimiento que permitan establecer una comparación objetiva.

## Limitaciones y advertencias

- No se especifican los idiomas concretos soportados, a pesar de la etiqueta "multilingual", lo que puede limitar su uso en aplicaciones que requieran idiomas específicos.
- Al ser una adaptación ONNX, el rendimiento puede diferir del modelo original de OmniVoice, especialmente en el perfil cuantizado int4, que puede presentar una degradación en la calidad de audio.
- La integración está pensada para el runtime KitsuMate de Unity; no se garantiza su funcionamiento en otros entornos sin adaptaciones adicionales.
- No se han publicado evaluaciones de sesgos o alucinaciones en la síntesis de voz, por lo que se recomienda validar el modelo en el dominio de uso antes de desplegarlo en producción.
- Aunque la licencia Apache-2.0 permite uso comercial, es necesario revisar las atribuciones de los modelos derivados (onnx-community/OmniVoice-Onnx y gluschenko/omnivoice-onnx) para cumplir con los requisitos de atribución.

## Enlaces

- [HuggingFace: KitsuMate/omnivoice-onnx](https://huggingface.co/KitsuMate/omnivoice-onnx)
- [Repositorio original de OmniVoice (k2-fsa)](https://github.com/k2-fsa/OmniVoice)
- [Exportación de referencia: onnx-community/OmniVoice-Onnx](https://huggingface.co/onnx-community/OmniVoice-Onnx)
- [Exportación de referencia: gluschenko/omnivoice-onnx](https://huggingface.co/gluschenko/omnivoice-onnx)
