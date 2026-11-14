# AiMu1215/sbv2-sakura-tokujiro-int8

## Resumen

Sakura_Tokujiro int8 es un modelo acústico de síntesis de voz (text-to-speech) en japonés, derivado del modelo de voz "Sakura_Tokujiro" (さくら徳次郎, versión 2.7.0-JP-Extra, locutor masculino único, solo estilo neutro) publicado en el repositorio itoolsjp/Style-Bert-VITS2-Voice-Assets. Lo desarrolla el usuario AiMu1215 para su uso dentro de AMU VOICE STUDIO, una aplicación de TTS japonesa que funciona íntegramente en el navegador y en el dispositivo del usuario.

Técnicamente no es un modelo de lenguaje, sino un modelo acústico basado en la arquitectura Style-BERT-VITS2, convertido a ONNX/AIVMX y cuantizado estáticamente a int8. El artefacto resultante ocupa 75.648.454 bytes (unos 0,1 GB) y se distribuye como un único fichero con hash SHA-256 `c77f02efd0fe4fa2aec332f5a20f7d8a0182f8f2f114d8b8181b312ab1c93cd5`. La voz de origen es ficticia y se entrenó sobre un corpus totalmente sintético (generado con herramientas como Qwen3-TTS), por lo que no corresponde a ninguna persona real.

Su relevancia es acotada pero concreta: demuestra un flujo de despliegue de TTS japonés en el navegador mediante @hdae/sbv2-web, con un modelo lo bastante pequeño como para ejecutarse en el cliente sin GPU dedicada. No hay métricas de calidad publicadas ni datos de entrenamiento propios más allá de los heredados del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Style-BERT-VITS2 (modelo acústico TTS), convertido a ONNX/AIVMX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantización | int8 estática (única variante publicada) |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible en el repo; se rige por los términos del modelo fuente itoolsjp/Style-Bert-VITS2-Voice-Assets |
| Formato de pesos | ONNX/AIVMX cuantizado a int8 (75.648.454 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Style-BERT-VITS2, un sistema de TTS que combina representaciones BERT con el generador VITS2 y un mecanismo de control de estilo. En este caso solo se conserva el estilo neutro del locutor original. El artefacto publicado no es el checkpoint original, sino una conversión a ONNX/AIVMX con cuantización estática a int8, pensada para inferencia en navegador a través de @hdae/sbv2-web.

No se dispone de información sobre el número de tokens, la composición exacta del corpus ni el proceso de ajuste del modelo fuente. La model card indica únicamente que la voz se entrenó sobre un corpus completamente sintético generado con herramientas como Qwen3-TTS, y que se trata de un locutor masculino único en su versión 2.7.0-JP-Extra. No se documentan etapas de RLHF, DPO ni innovaciones técnicas adicionales en esta derivación más allá de la propia cuantización estática.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto de entrada.
- Locutor masculino único, estilo neutro.
- Inferencia en el navegador y en el dispositivo mediante @hdae/sbv2-web, sin servidor.
- Modelo acústico de tamaño reducido (unos 0,1 GB), adecuado para descarga y ejecución local.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: únicamente japonés.
- No incluye modo thinking, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en aplicaciones web: el modelo puede integrarse en AMU VOICE STUDIO o en aplicaciones similares para generar locuciones japonesas directamente en el navegador, sin enviar texto a un servidor.
- Lectura de contenido en japonés: conversión de artículos, noticias o documentación a audio para accesibilidad o consumo pasivo, aprovechando que el modelo se ejecuta en el cliente.
- Prototipado de interfaces de voz: desarrolladores que necesiten una voz masculina japonesa neutra para demos o pruebas de concepto pueden desplegarla con un único fichero de 0,1 GB.
- Asistentes locales con privacidad: al ejecutarse en el dispositivo, el texto del usuario no sale del navegador, lo que resulta adecuado para entornos con requisitos de privacidad.
- Educación y aprendizaje de japonés: generación de audio de referencia para ejercicios de pronunciación o materiales didácticos, con la salvedad de que la voz es sintética y no humana.
- Integración en pipelines de generación de contenido: producción de narraciones japonesas para vídeos o podcasts de forma automatizada, siempre respetando las restricciones del modelo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el artefacto int8 ocupa unos 75,6 MB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no aplica de forma estricta; el modelo está pensado para ejecución en navegador (WebGPU/WebAssembly mediante ONNX/AIVMX), no para GPUs de datacenter.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU integrada o dedicada moderna con soporte de WebGPU; no se especifican modelos concretos.
- Opciones de despliegue: @hdae/sbv2-web en navegador; al estar en formato ONNX, podría ejecutarse con runtimes ONNX compatibles, aunque no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura_Tokujiro int8 (este) | TTS Style-BERT-VITS2 int8 | Japonés | ~75,6 MB | Según modelo fuente | Hugging Face |
| itoolsjp/Style-Bert-VITS2-Voice-Assets (fuente) | TTS Style-BERT-VITS2 | Japonés | no disponible | Términos propios del autor | Hugging Face |
| Style-BERT-VITS2 (framework) | Framework TTS | Japonés (principalmente) | no disponible | no disponible | GitHub |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo de un solo locutor y un solo estilo (neutro); no permite cambio de voz ni de emoción.
- Solo soporta japonés; el texto en otros idiomas no está contemplado.
- La voz es ficticia y sintética; no debe presentarse como una persona real.
- Riesgo de uso indebido para suplantación, difamación o propaganda extrema, usos explícitamente prohibidos por los términos del modelo fuente.
- La licencia no está declarada en el repositorio; los términos aplicables son los del modelo fuente, que permiten uso personal y comercial, incluida la integración en otros sistemas, pero prohíben vender el modelo en sí.
- No hay benchmarks ni evaluaciones de calidad publicadas; la calidad de síntesis no está verificada de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiMu1215/sbv2-sakura-tokujiro-int8
- Modelo fuente: https://huggingface.co/itoolsjp/Style-Bert-VITS2-Voice-Assets
- Repositorio Style-BERT-VITS2: https://github.com/litagin02/Style-Bert-VITS2
- Runtime web @hdae/sbv2-web: https://github.com/hdae/sbv2-web
