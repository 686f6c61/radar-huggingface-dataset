# AiMu1215/sbv2-tobu-yunomaru-int8

## Resumen

Tobu_Yunomaru int8 es un modelo acústico de síntesis de voz (text-to-speech) en japonés, derivado del modelo de voz "Tobu_Yunomaru" (東部湯の丸, versión 2.7.0-JP-Extra) perteneciente a la familia Style-BERT-VITS2. Lo publica el usuario AiMu1215 como artefacto listo para inferencia en navegador dentro de la aplicación AMU VOICE STUDIO, mediante la librería @hdae/sbv2-web. No es un modelo de lenguaje: es un componente de un pipeline TTS que convierte texto japonés en audio con una voz concreta.

El modelo original es un hablante único masculino, con estilo Neutro únicamente, entrenado sobre un corpus completamente sintético generado con herramientas como Qwen3-TTS; por tanto, no reproduce la voz de ninguna persona real. Esta versión concreta ha sido convertida a ONNX/AIVMX y cuantizada estáticamente a int8, con un peso de 75.648.461 bytes (aproximadamente 72 MiB), lo que la hace adecuada para ejecución on-device en el navegador sin servidor.

Su relevancia es acotada pero clara: demuestra el flujo de despliegue de modelos Style-BERT-VITS2 en entornos web con cuantización int8, un caso práctico para quien necesite TTS japonés de baja latencia y sin dependencia de infraestructura. El repositorio es muy pequeño (0,1 GB) y no presenta descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Style-BERT-VITS2 (modelo acústico VITS con condicionamiento de estilo BERT), exportado a ONNX/AIVMX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | int8 estática |
| Idiomas soportados | japonés (ja) |
| Licencia | no disponible como licencia explícita; se rige por los términos del modelo origen itoolsjp/Style-Bert-VITS2-Voice-Assets |
| Formato de pesos | ONNX/AIVMX cuantizado a int8 (75.648.461 bytes; SHA-256 `6003356b1475a4eb879d2f23a93c972a2d7ba2c02299ae77873d2f3c4902069f`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Style-BERT-VITS2, un sistema TTS que combina un backbone VITS (generativo adversarial condicionado por texto y estilo) con representaciones contextuales de BERT para el control de estilo y prosodia. En este caso se trata de un hablante único masculino y un único estilo (Neutro), según la ficha del autor. El artefacto publicado no entrena nada nuevo: es una conversión del modelo de voz original a formato ONNX/AIVMX con cuantización estática a int8, orientada a inferencia en navegador mediante @hdae/sbv2-web.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el autor indica únicamente que la voz origen se entrenó con un corpus totalmente sintético generado con herramientas como Qwen3-TTS. La innovación técnica relevante aquí es el propio pipeline de despliegue: exportación a AIVMX y cuantización int8 para reducir el tamaño y permitir ejecución on-device en el navegador.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto de entrada.
- Voz masculina única, estilo Neutro exclusivamente (sin control multiestilo).
- Ejecución en navegador y on-device gracias al formato ONNX/AIVMX int8.
- Integración con Style-BERT-VITS2 a través de @hdae/sbv2-web.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al japonés.

## Casos de uso

- Aplicación web de TTS en el navegador: el modelo se carga como artefacto AIVMX int8 y genera audio localmente sin enviar texto a un servidor, lo que reduce latencia y evita exposición de datos.
- Prototipado de interfaces de voz en japonés: útil para desarrollar demos de asistentes o lectores de texto en japonés con una voz sintética concreta y sin coste de infraestructura.
- Lectura de contenido accesible: conversión de artículos o documentos japoneses a audio para personas con discapacidad visual, ejecutándose en el propio dispositivo.
- Integración en aplicaciones de escritorio o web empaquetadas (Electron, PWA) que necesiten TTS japonés offline mediante ONNX Runtime Web.
- Evaluación de pipelines de cuantización: sirve como referencia práctica para medir el impacto de la cuantización int8 estática en la calidad de un modelo Style-BERT-VITS2.
- Generación de audio para prototipos de videojuegos o narrativa interactiva en japonés, donde se requiere una voz consistente de hablante único y estilo neutro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el peso int8 es de aproximadamente 72 MiB, por lo que la huella de memoria es reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; al ejecutarse vía ONNX Runtime Web puede aprovechar WebGPU o WebAssembly en el navegador.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido del artefacto, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: @hdae/sbv2-web sobre ONNX Runtime Web; también podría ejecutarse con ONNX Runtime en entornos nativos, aunque no está documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AiMu1215/sbv2-tobu-yunomaru-int8 | Style-BERT-VITS2, ONNX/AIVMX int8 | Japonés | ONNX/AIVMX int8 | Términos del modelo origen | Hugging Face, 0 descargas |
| itoolsjp/Style-Bert-VITS2-Voice-Assets (origen) | Style-BERT-VITS2 | Japonés | Pesos originales Style-BERT-VITS2 | Términos propios del repositorio origen | Hugging Face |
| Otros modelos Style-BERT-VITS2 de la comunidad | Style-BERT-VITS2 | Japonés (mayoritariamente) | Safetensors / ONNX según autor | Variable según autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo TTS, no un modelo de lenguaje: no realiza razonamiento, generación de texto ni tool calling.
- Una sola voz masculina y un solo estilo (Neutro); no permite control de emoción ni de hablante.
- Solo japonés; no hay soporte multilingüe.
- La licencia no está declarada de forma explícita en el repositorio; los términos aplicables son los del modelo origen itoolsjp/Style-Bert-VITS2-Voice-Assets, que permiten uso personal y comercial, incluida la integración en otros sistemas, pero prohíben vender el modelo en sí, la suplantación fraudulenta, la difamación y la propaganda política o religiosa extrema.
- La voz es sintética y no corresponde a ninguna persona real; aun así, debe evitarse cualquier uso que pueda interpretarse como suplantación.
- No hay datos publicados sobre calidad perceptual (MOS), latencia ni estabilidad en producción.
- Repositorio sin descargas ni validación de la comunidad en el momento de la consulta; conviene verificar el SHA-256 antes de desplegarlo.
- Riesgo de artefactos acústicos propios de la cuantización int8 estática, no cuantificados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiMu1215/sbv2-tobu-yunomaru-int8
- Modelo origen (voces Style-BERT-VITS2): https://huggingface.co/itoolsjp/Style-Bert-VITS2-Voice-Assets
- Repositorio Style-BERT-VITS2: https://github.com/litagin02/Style-BERT-VITS2
- Librería de inferencia web @hdae/sbv2-web: https://github.com/hdae/sbv2-web
