# geladons/LFM2.5-1.2B-Instruct

## Resumen

LFM2.5-1.2B-Instruct en formato LiteRT-LM es una conversión del modelo base LiquidAI/LFM2.5-1.2B-Instruct al formato `.litertlm` de Google, pensada para inferencia completamente local en dispositivos Android. El repositorio lo publica el usuario `geladons` y no constituye un modelo nuevo: es un empaquetado del modelo original de Liquid AI con cuantización int4 por bloques, con un fichero de 0,74 GB que se carga directamente mediante el SDK `com.google.ai.edge.litertlm`.

El interés de esta ficha está en el formato, no en el modelo: permite ejecutar un LLM de 1.200 millones de parámetros en un teléfono sin conexión, sin cuenta y sin nube, lo que habilita casos de uso de privacidad estricta y despliegue en campo. El bundle está integrado en el catálogo de la aplicación Local AI de Google Play y también puede cargarse desde una app propia apuntando el objeto `Engine`/`Conversation` del SDK al fichero.

La información publicada por el autor es muy escasa: no se detallan idiomas soportados, arquitectura interna del modelo base, datos de entrenamiento ni resultados de benchmarks. Todo lo que no aparece en la model card se marca en esta ficha como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-1.2B-Instruct; el bundle es un contenedor LiteRT-LM) |
| Parametros totales | 1,2 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con cuantización por bloques (block-quantized) |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License, la misma del modelo base) |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM); fichero de 0,74 GB |
| Modalidad | texto a texto |
| Libreria | litert-lm |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna del modelo base en la documentación disponible. El bundle es una conversión de `LiquidAI/LFM2.5-1.2B-Instruct` a LiteRT-LM, el runtime de Google AI Edge para inferencia en dispositivo, con cuantización int4 por bloques que reduce el peso a 0,74 GB. El proceso de conversión sigue las recetas del repositorio `hf-to-litertlm`.

No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas del modelo original. El autor indica que el fichero es byte a byte idéntico al que se distribuye en el repositorio `geladons/local-ai-models`, que se mantiene por compatibilidad hacia atrás.

## Capacidades

- Generación de texto en modalidad texto a texto, según la model card.
- Inferencia completamente local en dispositivo, sin nube ni cuenta de usuario.
- Carga directa mediante el SDK `com.google.ai.edge.litertlm` (objetos `Engine` y `Conversation`).
- Integración con la aplicación Local AI de Google Play, que incluye el modelo en su catálogo integrado.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o modo thinking: no disponible en la información publicada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistentes de chat offline en Android: el bundle se carga con el SDK LiteRT-LM y permite conversaciones sin conexión, útil en entornos sin red o con requisitos de privacidad estrictos.
- Aplicaciones de campo sin conectividad: técnicos, personal sanitario o inspecciones en zonas rurales pueden usar el modelo embebido en una app Android para resumir notas o responder consultas.
- Prototipado rápido de funciones de IA en apps móviles: al estar disponible en el catálogo de Local AI, permite validar la experiencia de usuario antes de integrar el SDK en la app propia.
- Procesamiento de texto sensible en el dispositivo: al no enviar datos a la nube, encaja en flujos donde la información no puede salir del teléfono (notas personales, borradores internos).
- Educación y demostraciones: sirve para enseñar el funcionamiento de un LLM en dispositivo con un fichero de menos de 1 GB y un runtime documentado.
- Pruebas de integración del runtime LiteRT-LM: desarrolladores que evalúan el SDK pueden usar este bundle como referencia de conversión desde un modelo Hugging Face.
- Distribución de modelos en apps Android: el fichero `.litertlm` puede empaquetarse o descargarse en la app y cargarse con el SDK, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 0,74 GB en int4; el runtime necesita memoria adicional para el contexto y el estado de la conversación, no cuantificada en la documentación.
- GPU recomendadas: no aplica; el destino es inferencia en CPU/NPU de dispositivos Android mediante LiteRT-LM.
- Cabe en dispositivo móvil: sí, es el objetivo del bundle; no se especifican modelos de teléfono compatibles ni requisitos mínimos de RAM.
- Opciones de despliegue: SDK `com.google.ai.edge.litertlm` en una app Android propia, o la aplicación Local AI de Google Play con el modelo del catálogo integrado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (bundle LiteRT-LM, geladons) | 1,2 B | no disponible | `.litertlm` int4 | LFM Open License | Hugging Face, catálogo de Local AI |
| LiquidAI/LFM2.5-1.2B-Instruct (original) | 1,2 B | no disponible | safetensors (formato original) | LFM Open License | Hugging Face |
| Alternativas on-device de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La información publicada es mínima: no hay datos de arquitectura, contexto, idiomas ni benchmarks del modelo base.
- La cuantización int4 puede degradar la calidad respecto al modelo original en safetensors; no se documenta la pérdida.
- Riesgo de alucinación inherente a un modelo de 1,2 B parámetros; no se han publicado evaluaciones.
- Sesgos conocidos: no disponibles.
- Licencia "other" (LFM Open License): es necesario revisar los términos del modelo base antes de uso comercial; no se detallan restricciones en esta model card.
- El bundle está pensado exclusivamente para el runtime LiteRT-LM en Android; no es un formato portable a otras plataformas sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un empaquetado de terceros, no oficial de Liquid AI.
- El fichero es idéntico al de `geladons/local-ai-models`; conviene verificar la integridad si se descarga desde cualquiera de los dos.

## Enlaces

- Repositorio del bundle: https://huggingface.co/geladons/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Repositorio de compatibilidad: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Aplicación Local AI en Google Play: https://play.google.com/store/apps/details?id=com.ochandydude.localai
