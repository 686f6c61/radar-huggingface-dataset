# aoiandroid/nllb200-coreml-512-pal8-ios

## Resumen

Este repositorio contiene una compilación del modelo NLLB-200 de Meta en formato Core ML, específicamente preparada para dispositivos iOS y utilizada por la aplicación de traducción TranslateBlue. El modelo original, desarrollado por Meta AI, es un sistema de traducción neuronal multilingüe capaz de traducir entre 200 idiomas, entrenado con el corpus FLORES-200 y validado con evaluaciones extensivas. La relevancia de esta conversión radica en que permite ejecutar traducción de alta calidad de forma totalmente offline en un iPhone o iPad, aprovechando la unidad de procesamiento neuronal (ANE) del dispositivo, sin depender de la nube. La arquitectura es un transformer encoder-decoder, aunque no se especifican los parámetros totales ni el contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | probablemente paleta de 8 bits (pal8) |
| Idiomas soportados | 200 idiomas (FLORES-200) |
| Licencia | MIT (repositorio); el modelo base NLLB-200 es CC-BY-NC-4.0 |
| Formato de pesos | .mlmodelc (Core ML compilado) |

## Arquitectura y entrenamiento
El modelo base es NLLB-200, desarrollado por Meta AI, que emplea una arquitectura transformer encoder-decoder de la familia M2M-100. El entrenamiento se realizó con el dataset FLORES-200, que cubre 200 idiomas, y se aplicaron técnicas de entrenamiento con señales de control para mejorar la traducción en idiomas de bajos recursos. Este repositorio no contiene los pesos originales, sino una conversión a Core ML con decodificadores KV (key-value) optimizados para la inferencia en dispositivos Apple. La compilación se realizó para la plataforma iOS, con especialización en la unidad neuronal (ANE) que se aplica de forma local en el dispositivo.

## Capacidades
- Traducción automática entre 200 idiomas, incluyendo idiomas con pocos recursos.
- Inferencia completamente offline en dispositivos iOS, sin conexión a internet.
- Optimización para el Neural Engine de Apple, lo que reduce la latencia y el consumo energético.
- Compatible con la aplicación TranslateBlue, que ofrece una interfaz limpia para selección de idiomas y traducción instantánea.
- No se han documentado capacidades adicionales como tool calling o agentes.

## Casos de uso
- **Traducción offline en viajes**: un usuario puede traducir frases o conversaciones en tiempo real sin conexión, ideal para turistas o profesionales que se desplazan a zonas con mala cobertura.
- **Integración en apps de mensajería**: desarrolladores pueden incorporar la traducción automática en aplicaciones de chat para facilitar la comunicación entre usuarios de distintos idiomas.
- **Accesibilidad en dispositivos iOS**: personas con barreras idiomáticas pueden usar la traducción integrada en apps de lectura, correo o navegación.
- **Procesamiento de documentos**: traducir documentos PDF o textos largos de manera local, garantizando la privacidad al no enviar datos a servidores externos.
- **Asistencia en atención al cliente**: empresas pueden integrar la traducción en sus apps de soporte para atender consultas en múltiples idiomas sin costes de API.
- **Desarrollo de prototipos de traducción**: investigadores y desarrolladores pueden usar este modelo compilado para probar flujos de traducción en dispositivos iOS sin gestionar modelos grandes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos comparativos de calidad de traducción ni de latencia en dispositivos específicos.

## Requisitos de hardware
- Dispositivo iOS con chip Apple Neural Engine (ANE), como iPhone XS o posterior, iPad Pro de tercera generación o posterior, o iPod touch de séptima generación.
- La compilación está diseñada para ejecutarse en la unidad neuronal, por lo que se recomienda un dispositivo con ANE para obtener un rendimiento óptimo.
- No se especifican requisitos de memoria RAM adicionales, pero el tamaño del repositorio (1.8 GB) indica que el modelo necesita espacio de almacenamiento suficiente.
- La inferencia se realiza localmente; no se requiere GPU externa ni servidor.
- La integración se puede hacer mediante Core ML en Xcode; no se menciona compatibilidad con vLLM, Ollama u otros frameworks.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NLLB-200 (base) | 600M / 1.2B / 3.3B / 54B | no disponible | 200 | CC-BY-NC-4.0 | PyTorch, ONNX |
| NLLB-200-distilled-600M (CTranslate2) | 600M | no | 200 | CC-BY-NC-4.0 | CTranslate2 |
| aoiandroid/nllb200-coreml-512-pal8-ios | no disponible | no | 200 | MIT (repo) | MLPmodelc |

La comparativa directa con otras versiones de NLLB-200 no es posible porque este repositorio es una compilación específica para iOS; las alternativas en formato PyTorch o CTranslate2 son más flexibles pero requieren infraestructura adicional.

## Limitaciones y advertencias
- El modelo base NLLB-200 está bajo licencia CC-BY-NC-4.0, lo que restringe el uso comercial. Aunque este repositorio declara licencia MIT, el modelo subyacente puede mantener esa restricción, por lo que se recomienda verificar los términos antes de usarlo en aplicaciones comerciales.
- La compilación está orientada exclusivamente a iOS; no es utilizable en otras plataformas sin conversión adicional.
- No se proporciona información sobre el tamaño exacto de los parámetros, lo que dificulta estimar su rendimiento frente a otras variantes.
- La calidad de traducción puede ser inferior en idiomas de bajos recursos comparado con modelos más grandes de la familia NLLB.
- No se documentan sesgos específicos, pero como modelo entrenado con datos web, puede reflejar sesgos culturales o de género.
- Al ser un modelo compilado para Core ML, las actualizaciones o personalizaciones requieren recompilar el modelo desde los pesos originales.

## Enlaces
- Repositorio actual: [https://huggingface.co/aoiandroid/nllb200-coreml-512-pal8-ios](https://huggingface.co/aoiandroid/nllb200-coreml-512-pal8-ios)
- Repositorio fuente (modelo base Core ML): [https://huggingface.co/aoiandroid/nllb200-coreml-512](https://huggingface.co/aoiandroid/nllb200-coreml-512)
- Repositorio hermano (macOS): [https://huggingface.co/aoiandroid/nllb200-coreml-512-pal8-macos](https://huggingface.co/aoiandroid/nllb200-coreml-512-pal8-macos)
- Proyecto TranslateBlue (GitHub): [https://github.com/sioaeko/NLLB_translator](https://github.com/sioaeko/NLLB_translator)
- Blog de Meta sobre NLLB-200: [https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/](https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/)
- Repositorio de modelos NLLB offline (alternativa en CTranslate2): [https://github.com/hansmy/nllb-offline-models](https://github.com/hansmy/nllb-offline-models)
