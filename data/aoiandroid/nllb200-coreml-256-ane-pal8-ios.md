# aoiandroid/nllb200-coreml-256-ane-pal8-ios

## Resumen

El modelo `aoiandroid/nllb200-coreml-256-ane-pal8-ios` es un paquete Core ML compilado (`.mlmodelc`) para iOS, derivado del modelo de traducción automática neuronal NLLB-200 distilled 600M de Meta AI. Ha sido convertido y optimizado para ejecutarse en el Apple Neural Engine (ANE) mediante paletización de 8 bits (pal8), lo que reduce el tamaño del archivo a 1,4 GB y facilita su integración en aplicaciones móviles como TranslateBlue, una app de traducción offline.

El modelo resuelve el problema de la traducción automática en dispositivos Apple sin conexión a internet, manteniendo la privacidad de los datos al procesar todo localmente. Su relevancia actual radica en la creciente demanda de soluciones de IA on-device que no dependan de la nube, especialmente en el ecosistema iOS, donde Core ML y el ANE permiten un rendimiento eficiente y de bajo consumo.

La arquitectura subyacente es un transformer seq2seq destilado, con 600 millones de parámetros (según el nombre del modelo original), y soporta los 200 idiomas del conjunto de datos FLORES-200, aunque la lista exacta de idiomas no se especifica en la información disponible. El paquete está diseñado para ser usado directamente en aplicaciones iOS mediante el framework Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (NLLB-200 distilled 600M) |
| Parametros totales | 600M (estimado, basado en el modelo original) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Paletizacion de 8 bits (pal8) |
| Idiomas soportados | 200 idiomas (FLORES-200, segun el modelo original) |
| Licencia | MIT (repo) / CC-BY-NC 4.0 (modelo original) |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo es una conversión a Core ML del checkpoint `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder destilado a partir del modelo NLLB-200 completo. El entrenamiento original fue realizado por Meta AI con datos multilingües de FLORES-200, que incluye más de 200 idiomas, y se utilizó una técnica de destilación para reducir el tamaño del modelo manteniendo un rendimiento competitivo en traducción. La conversión a Core ML incluye una paletización de 8 bits (pal8) que agrupa los pesos en una tabla de colores (palette) para reducir el tamaño y hacer que el modelo sea más eficiente en el ANE. La especialización para el ANE se realiza de forma local en el dispositivo, según indica la descripción del autor.

No se dispone de información adicional sobre el proceso de entrenamiento, los datos exactos o si se aplicaron técnicas como RLHF o DPO, ya que el modelo es un export técnico y no un entrenamiento nuevo.

## Capacidades

- Traducción automática neuronal entre los 200 idiomas soportados por NLLB-200, usando códigos de idioma FLORES (por ejemplo, `jpn_Jpan` para japonés).
- Ejecución completamente offline en dispositivos iOS, sin necesidad de conexión a internet.
- Optimizado para el Apple Neural Engine, lo que permite inferencia de baja latencia y bajo consumo energético.
- Integración nativa con Core ML y el ecosistema de Apple (Swift, Xcode).
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que es un modelo de traducción puro.

## Casos de uso

- Traducción offline en aplicaciones de viajes: el modelo permite traducir frases o textos completos sin conexión, ideal para turistas que necesitan comunicarse en países con idiomas desconocidos y sin acceso a datos móviles.
- Privacidad en comunicaciones: al procesar todo en el dispositivo, los textos traducidos nunca salen del teléfono, lo que es crítico para aplicaciones de mensajería o correo electrónico con datos sensibles.
- Asistente de lectura en tiempo real: integrado en apps de cámara o realidad aumentada, puede traducir carteles, menús o documentos escaneados de forma instantánea.
- Aplicaciones de aprendizaje de idiomas: sirve como motor de traducción para ejercicios interactivos, comparación de frases o verificación de pronunciación.
- Traducción de contenido generado por el usuario: en apps de redes sociales o foros, permite traducir comentarios o publicaciones de otros usuarios en tiempo real.
- Accesibilidad: ayuda a personas con barreras idiomáticas a entender contenido en su idioma nativo, mejorando la inclusión digital en entornos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original NLLB-200 distilled 600M tiene métricas conocidas (por ejemplo, BLEU en FLORES-200), pero no se proporcionan datos específicos para esta conversión Core ML. Se recomienda consultar la documentación de NLLB-200 para referencia, aunque el rendimiento real en dispositivo puede variar debido a la cuantización y la optimización para ANE.

## Requisitos de hardware

- Dispositivos iOS con chip Apple Neural Engine (ANE), típicamente iPhone 8 o posterior, iPad Pro, iPad Air, etc. (no se especifica la versión mínima exacta).
- El modelo compilado ocupa 1,4 GB en disco, por lo que se requiere espacio de almacenamiento suficiente.
- La inferencia se ejecuta en el ANE, por lo que no se necesita GPU externa ni memoria VRAM dedicada.
- Para desarrollo, se requiere Xcode y un dispositivo físico o simulador con soporte Core ML.
- No se dispone de datos de latencia o throughput específicos para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `aoiandroid/nllb200-coreml-256-ane-pal8-ios` | 600M (estimado) | no disponible | 200 | MIT (repo) / CC-BY-NC | Core ML |
| `facebook/nllb-200-distilled-600M` | 600M | no disponible | 200 | CC-BY-NC 4.0 | PyTorch / safetensors |
| `facebook/m2m100_418M` | 418M | no disponible | 100 | MIT | PyTorch |

La comparativa se basa en el modelo original y en alternativas de traducción multilingüe. La versión Core ML está optimizada para iOS, mientras que los otros son modelos genéricos que requieren conversión adicional para su uso en dispositivos Apple.

## Limitaciones y advertencias

- La licencia del modelo original es CC-BY-NC 4.0 (no comercial), a pesar de que el repositorio declara MIT. Esto implica que el uso comercial de este modelo puede estar restringido, y se debe verificar la licencia del checkpoint original antes de utilizarlo en productos comerciales.
- No se especifica la longitud de contexto máxima, por lo que puede haber limitaciones en la traducción de textos muy largos.
- La paletización de 8 bits puede degradar ligeramente la calidad de la traducción en comparación con el modelo de precisión completa.
- El modelo está diseñado exclusivamente para iOS y no es compatible con otras plataformas sin una conversión adicional.
- No se han documentado sesgos específicos, pero como modelo entrenado con datos de FLORES-200, puede heredar sesgos culturales o lingüísticos presentes en los datos de entrenamiento.
- No se proporciona información sobre el rendimiento en tareas fuera de la traducción, como generación de texto o razonamiento.

## Enlaces

- [HuggingFace: aoiandroid/nllb200-coreml-256-ane-pal8-ios](https://huggingface.co/aoiandroid/nllb200-coreml-256-ane-pal8-ios)
- [HuggingFace: aoiandroid/nllb200-coreml-256-ane-pal8 (modelo fuente)](https://huggingface.co/aoiandroid/nllb200-coreml-256-ane-pal8)
- [HuggingFace: facebook/nllb-200-distilled-600M (modelo original)](https://huggingface.co/facebook/nllb-200-distilled-600M)
- [GitHub: ANEMLL - Artificial Neural Engine Machine Learning Library](https://github.com/Anemll/Anemll)
- [Sitio web de ANEMLL](https://www.anemll.com/)
