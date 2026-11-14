# AiMu1215/sbv2-yokohama-aoba-int8

## Resumen

Yokohama_Aoba int8 es un modelo acústico de síntesis de voz (text-to-speech) en japonés, derivado del modelo de voz "Yokohama_Aoba" (横浜青葉) del repositorio itoolsjp/Style-Bert-VITS2-Voice-Assets, en su versión 2.7.0-JP-Extra. Lo publica el usuario AiMu1215 como un artefacto estático cuantizado a int8 en formato ONNX/AIVMX, pensado para su uso en una aplicación de TTS que se ejecuta íntegramente en el navegador (AMU VOICE STUDIO) mediante la librería @hdae/sbv2-web.

El modelo se basa en la arquitectura Style-BERT-VITS2, un sistema de síntesis neuronal que combina representaciones BERT para el estilo prosódico con el generador VITS2. Se trata de un modelo de hablante único (femenino) y de estilo neutro únicamente, entrenado sobre un corpus completamente sintético generado con herramientas como Qwen3-TTS, por lo que la voz es ficticia y no corresponde a ninguna persona real.

Su relevancia radica en el despliegue: al estar cuantizado a int8 y empaquetado en un único fichero de 75.648.460 bytes (aproximadamente 72 MB), permite inferencia local en el navegador sin servidor ni GPU dedicada, lo que lo hace útil para aplicaciones de accesibilidad, prototipado y demos de TTS en japonés con requisitos de infraestructura mínimos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Style-BERT-VITS2 (VITS2 con condicionamiento de estilo basado en BERT) |
| Parametros totales | no disponible (fichero cuantizado de 75.648.460 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de TTS, no de lenguaje) |
| Tipos de cuantizacion | int8 estática (ONNX/AIVMX) |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible en el repositorio; se rige por los términos del modelo origen itoolsjp/Style-Bert-VITS2-Voice-Assets |
| Formato de pesos | ONNX/AIVMX (int8 estático) |
| Hablantes | 1 (femenino, estilo neutro) |
| Version del modelo origen | 2.7.0-JP-Extra |
| SHA-256 | 78101381401af497638fc762fc9cefd5ee193dedf79f27eaf17faf30edff234d |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Style-BERT-VITS2, que extiende el generador VITS2 con un mecanismo de condicionamiento de estilo derivado de representaciones contextuales de BERT. Esta combinación permite controlar la prosodia y la expresividad de la voz generada, aunque en esta variante concreta solo se ha conservado el estilo neutro. El artefacto publicado no es un modelo entrenado desde cero, sino una conversión del modelo de voz Yokohama_Aoba (versión 2.7.0-JP-Extra) a formato ONNX/AIVMX con cuantización estática a int8, optimizada para ejecución en navegador.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que la voz origen fue entrenada sobre un corpus completamente sintético generado con herramientas como Qwen3-TTS, lo que elimina la dependencia de grabaciones de personas reales. La innovación técnica principal del artefacto es la cuantización int8 estática combinada con el runtime AIVMX, que reduce el peso a unos 72 MB y hace viable la inferencia on-device en el navegador.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto de entrada.
- Voz femenina de hablante único con estilo neutro.
- Conversión de texto a audio con prosodia condicionada por estilo (aunque limitada al estilo neutro en esta variante).
- Ejecución local en el navegador mediante el runtime @hdae/sbv2-web y el formato AIVMX.
- Inferencia on-device sin necesidad de servidor ni conexión a servicios externos de TTS.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de visión, audio de entrada ni modo de razonamiento.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Aplicaciones web de accesibilidad: lectura en voz alta de contenido en japonés directamente en el navegador, sin enviar texto a servidores externos, lo que preserva la privacidad del usuario y elimina la latencia de red.
- Demos y prototipos de TTS: integración rápida en páginas estáticas o aplicaciones web para validar flujos de síntesis de voz en japonés con un modelo de apenas 72 MB.
- Asistentes conversacionales embebidos: generación de respuestas habladas en japonés en clientes ligeros o entornos con recursos limitados, aprovechando la inferencia local.
- Aprendizaje de idiomas: reproducción de pronunciación sintética de textos japoneses en aplicaciones educativas que funcionan offline.
- Contenido interactivo y videojuegos: diálogos de personajes ficticios con voz sintética en el navegador, sin depender de servicios de TTS en la nube.
- Pruebas de integración de pipelines TTS: validación de arquitecturas de conversión a ONNX/AIVMX y cuantización int8 antes de desplegar modelos de mayor tamaño.
- Sistemas de kiosco o terminales sin GPU: generación de voz en dispositivos de bajos recursos donde no es viable ejecutar modelos TTS de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (inferencia en CPU dentro del navegador); el fichero cuantizado ocupa aproximadamente 72 MB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecución on-device en el navegador, típicamente sobre CPU.
- Compatibilidad con GPU de consumo: no disponible; no se documentan requisitos de GPU.
- Opciones de despliegue: runtime @hdae/sbv2-web sobre formato AIVMX/ONNX; también puede ejecutarse mediante runtimes ONNX compatibles, aunque no se documenta soporte explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Tamano | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Yokohama_Aoba int8 (este modelo) | Style-BERT-VITS2 | Japonés | ONNX/AIVMX int8 | ~72 MB | Términos del modelo origen | Navegador / on-device |
| Modelo origen Yokohama_Aoba 2.7.0-JP-Extra | Style-BERT-VITS2 | Japonés | Pesos originales (no especificado) | no disponible | Términos de itoolsjp | Servidor / escritorio |
| Otros modelos Style-BERT-VITS2 de itoolsjp | Style-BERT-VITS2 | Japonés | Pesos originales | no disponible | Términos de itoolsjp | Servidor / escritorio |

No se dispone de datos de rendimiento comparativo (métricas MOS, latencia o throughput) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La voz es completamente sintética y ficticia; no corresponde a ninguna persona real, lo que debe comunicarse a los usuarios finales.
- Solo soporta japonés; no hay capacidades multilingües.
- Estilo neutro único: no permite control de emociones ni estilos alternativos.
- Hablante único femenino: no hay variedad de voces.
- Riesgo de uso indebido para suplantación o difamación; los términos del modelo origen lo prohíben expresamente.
- La licencia del repositorio no está declarada de forma explícita; el uso se rige por los términos del modelo origen itoolsjp/Style-Bert-VITS2-Voice-Assets, que permiten uso personal y comercial, incluida la integración en otros sistemas, pero prohíben vender el modelo en sí, el fraude por suplantación, la difamación y la propaganda política o religiosa extrema.
- Al ser un derivado cuantizado, puede presentar pérdidas de calidad respecto al modelo original en float; no se documentan métricas de degradación.
- El repositorio no tiene descargas ni likes, por lo que no hay evidencia de validación por parte de la comunidad.
- No se documentan limitaciones de contexto porque no es un modelo de lenguaje, sino un modelo acústico de TTS.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AiMu1215/sbv2-yokohama-aoba-int8
- Modelo origen (voice assets): https://huggingface.co/itoolsjp/Style-Bert-VITS2-Voice-Assets
- Repositorio Style-BERT-VITS2: https://github.com/litagin02/Style-BERT-VITS2
- Runtime web @hdae/sbv2-web: https://github.com/hdae/sbv2-web
