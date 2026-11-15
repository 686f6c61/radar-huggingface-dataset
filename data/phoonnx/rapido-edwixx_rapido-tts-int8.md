# Phoonnx/rapido-edwixx_rapido-tts-int8

## Resumen

`rapido-edwixx_rapido-tts-int8` es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx bajo el identificador `Phoonnx/rapido-edwixx_rapido-tts-int8`. Se trata de una conversión al formato ONNX del modelo `edwixx__rapido-tts-int8`, originalmente alojado en el repositorio `Phoonnx/phoonnx-rapido`, y empaquetado para su uso con la librería `phoonnx` del proyecto TigreGotico. El modelo está etiquetado con el pipeline `text-to-speech` y una licencia Apache 2.0.

Según la información de la model card, el modelo de origen es `edwixx/pt-BR-rapido-int8`, un sistema TTS entrenado para portugués de Brasil (`pt-BR`) que trabaja a nivel de grafemas. La arquitectura descrita en la tabla de origen indica un modelo de flujo (*flow model*) con cuantización dinámica int8 en el grafo principal, mientras que el resto de grafos se mantienen en fp32. El tamaño total del repositorio es de 0,2 GB, lo que sugiere un modelo compacto orientado a inferencia ligera.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de despliegue (un modelo ya convertido a ONNX y cuantizado) más que de un modelo de investigación con benchmarks publicados. No hay descargas ni *likes* registrados, no se declaran idiomas soportados en los metadatos de Hugging Face y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de flujo (flow model) para TTS, exportado a ONNX; grafo de flujo en int8 dinámico, resto de grafos en fp32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | int8 dinámico en el modelo de flujo; fp32 en los demás grafos |
| Idiomas soportados | portugués de Brasil (pt-BR) según el modelo de origen; no declarado en los metadatos de HF |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería `phoonnx`) |

## Arquitectura y entrenamiento

La información disponible describe el modelo de origen como un *flow model* (modelo generativo basado en flujo normalizador o *flow matching*) con cuantización dinámica int8 aplicada al grafo de flujo, mientras que el resto de grafos del pipeline TTS se mantienen en precisión fp32. El modelo trabaja con una representación de entrada basada en grafemas (*graphemes pt-BR*), es decir, no requiere un front-end fonemizador externo para el portugués de Brasil, y el campo "42" de la tabla de origen apunta al número de símbolos o unidades del vocabulario de grafemas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El artefacto publicado es una conversión y cuantización del modelo original, no un entrenamiento nuevo.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil, operando a nivel de grafemas.
- Generación de audio mediante un modelo de flujo cuantizado a int8, pensado para inferencia eficiente en CPU o hardware modesto.
- Integración con la librería `phoonnx`, que actúa como runtime de los grafos ONNX empaquetados.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se declaran capacidades multilingües más allá del portugués de Brasil del modelo de origen.

## Casos de uso

- Síntesis de voz para aplicaciones en portugués de Brasil: el modelo puede generar audio a partir de texto en pt-BR sin necesidad de un fonemizador externo, lo que simplifica el pipeline de TTS en productos dirigidos a ese mercado.
- Lectura de contenido en voz alta en aplicaciones móviles o de escritorio: su tamaño reducido (0,2 GB) y la cuantización int8 permiten ejecución local en dispositivos con recursos limitados.
- Generación de avisos y locuciones automatizadas: adecuado para sistemas de anuncios, interfaces de voz o asistentes embebidos que requieran latencia baja y no dependan de servicios en la nube.
- Prototipado rápido de interfaces conversacionales: al estar empaquetado para `phoonnx`, se puede integrar en experimentos de voz sin montar infraestructura de inferencia compleja.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de accesibilidad en portugués de Brasil.
- Pruebas de integración en pipelines ONNX: sirve como artefacto de referencia para validar despliegues de TTS cuantizado con la librería `phoonnx`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 0,2 GB, por lo que la huella en memoria es reducida y compatible con ejecución en CPU.
- GPU recomendadas: no se especifican; por el tamaño y la cuantización int8, el modelo está pensado para inferencia ligera, probablemente en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se documenta oficialmente.
- Opciones de despliegue: runtime `phoonnx` (librería específica del proyecto); al ser ONNX, podría ejecutarse con ONNX Runtime, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS en portugués de Brasil, formato ONNX cuantizado) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente al portugués de Brasil según el modelo de origen; no se declaran otros idiomas en los metadatos.
- No se han publicado evaluaciones de calidad de síntesis (MOS, inteligibilidad, naturalidad), por lo que no hay garantías objetivas de rendimiento.
- Al ser una conversión cuantizada a int8, puede haber una pérdida de calidad respecto al modelo en fp32 original; no se documenta el impacto.
- El repositorio no registra descargas ni *likes*, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar la procedencia y los términos del modelo de origen (`edwixx/rapido-tts`) antes de un uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de contexto específicas; en TTS, el riesgo principal es la mala pronunciación o la generación de audio defectuoso en entradas fuera de distribución.
- La dependencia de la librería `phoonnx` limita la portabilidad frente a runtimes más extendidos.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/rapido-edwixx_rapido-tts-int8
- Repositorio de origen en Hugging Face: https://huggingface.co/Phoonnx/phoonnx-rapido
- Modelo original: https://huggingface.co/edwixx/pt-BR-rapido-int8
- Repositorio del proyecto phoonnx: https://github.com/TigreGotico/phoonnx
