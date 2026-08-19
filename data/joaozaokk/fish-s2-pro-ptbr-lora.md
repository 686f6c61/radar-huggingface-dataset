# JoaoZaokk/fish-s2-pro-ptbr-lora

## Resumen

El modelo `JoaoZaokk/fish-s2-pro-ptbr-lora` es un adaptador LoRA que ajusta el modelo de síntesis de voz `fishaudio/s2-pro` de Fish Audio al portugués brasileño. Desarrollado por JoaoZaokk, el adaptador entrena únicamente la capa Fast AR del transformer de S2 Pro, dejando congeladas las 36 capas del Slow AR, el codec y el tokenizador. Con solo 7,1 millones de parámetros entrenables (aproximadamente el 0,16 % del modelo base) y 2 horas de audio en pt-BR, consigue una pequeña mejora en inteligibilidad (CER y WER) sin degradar el rendimiento en otras lenguas.

La relevancia de este modelo reside en su enfoque quirúrgico: en lugar de reentrenar el modelo completo, adapta únicamente la parte de decodificación rápida, lo que reduce drásticamente el coste de entrenamiento y el riesgo de romper las capacidades multilingües del modelo base. Se distribuyen dos variantes del adaptador, diferenciadas por la distribución de voces en los datos de entrenamiento (46 frente a 256 grupos de voz), ambas con la misma receta e hiperparámetros. La licencia es de investigación y no comercial (Fish Audio Research License), y el repositorio no incluye los pesos del modelo base, que deben obtenerse por separado desde Fish Audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Fast AR de S2 Pro (transformer con Slow AR de 36 capas congelado) |
| Parametros totales | 7 110 656 (entrenables, r=32, alpha=16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa texto largo) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye como checkpoint LoRA) |
| Idiomas soportados | pt, en, es |
| Licencia | fish-audio-research-license (solo investigacion y uso no comercial) |
| Formato de pesos | checkpoint LoRA (lora.ckpt) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `fishaudio/s2-pro`, un modelo de texto a voz de Fish Audio que combina un codec neuronal, un tokenizador y un transformer de dos etapas (Slow AR y Fast AR). La adaptación se realiza mediante LoRA con r=32 y alpha=16, aplicada a las capas de atención y feed-forward del Fast AR (embeddings, capas 0 a 3 y la salida). El Slow AR, el codec y el tokenizador permanecen congelados y bit-idénticos a la versión original de Fish Audio.

Los datos de entrenamiento consisten en 2 horas de audio en portugués brasileño procedentes de Common Voice y TAGARELA, organizadas en dos distribuciones de voces distintas: una con 46 hablantes de Common Voice y 136 grupos de voz en total, y otra con 256 hablantes de Common Voice y 363 grupos de voz, con un límite de 6 minutos por voz. El entrenamiento usa lr 1e-5, bf16-true, batch de 1 con 8 pasos de acumulación de gradiente. No se emplea RLHF ni DPO; la evaluación se realiza sobre 216 frases de 24 hablantes del split dev de Common Voice, disjunto del entrenamiento.

## Capacidades

- Generacion de voz en portugues brasileño con mejora de inteligibilidad frente al modelo base (CER 0,0180 frente a 0,0220, WER 0,0404 frente a 0,0486).
- Mantiene las capacidades multilingües del modelo base en inglés y español, siempre que la referencia de audio esté en el mismo idioma que el texto objetivo.
- Clonación de voz mediante referencia de audio: el adaptador respeta la voz de la referencia sin degradar la calidad espectral (decay y rolloff prácticamente idénticos al base).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de síntesis de voz.
- No incluye modo thinking ni capacidades de visión o audio más allá de la generación de habla.

## Casos de uso

- Accesibilidad: conversión de texto a voz en portugués brasileño para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, aprovechando la mejora de inteligibilidad en CER y WER.
- Asistentes de voz en portugués: integración en asistentes virtuales o chatbots por voz que requieran respuestas naturales en pt-BR, con la ventaja de que el modelo base ya soporta otros idiomas.
- Audiolibros y contenido narrado: generación de audiolibros a partir de texto en portugués brasileño, con control de la voz mediante referencias de audio.
- Doblaje de vídeo y multimedia: adaptación de guiones a voz en pt-BR para vídeos, presentaciones o material educativo, manteniendo la calidad del modelo base.
- Sistemas IVR (respuesta de voz interactiva): generación de mensajes de voz para centralitas telefónicas en portugués brasileño, con baja latencia gracias al Fast AR.
- Investigación en TTS: como base para experimentos de adaptación de modelos multilingües a idiomas de bajos recursos, dado su diseño documentado y reproducible.

## Benchmarks y rendimiento

La evaluación se realizó sobre 216 frases de 24 hablantes del split dev de Common Voice, disjunto del entrenamiento. Los resultados comparan el modelo base con los dos adaptadores:

| Metrica | base (Fish Audio) | 2h / 46 spk | 2h / 256 spk |
|---|---|---|---|
| CER ↓ | 0,0220 | **0,0180** | 0,0195 |
| WER ↓ | 0,0486 | **0,0404** | 0,0472 |
| speaker sim ↑ | 0,9577 | 0,9566 | 0,9574 |
| decay (dB) | −5,70 | −5,68 | −5,81 |
| rolloff (Hz) | 3640 | 3717 | 3664 |

Además, se comprobó que otras lenguas no se degradan con 40 generaciones en 3 idiomas, usando referencias en el mismo idioma que el texto:

| checkpoint | duracion | decay | level |
|---|---|---|---|
| base (Fish Audio) | 13,17 s | −1,3 dB | −25,2 dBFS |
| 2h / 46 spk | 12,88 s | −2,2 dB | −25,2 dBFS |
| 2h / 256 spk | 13,12 s | −1,1 dB | −25,1 dBFS |

Los autores indican que la mejora es pequeña y que en pruebas de escucha a ciegas el resultado fue un empate estadístico (6–6 y 4–5, p = 1,000). El valor principal es que el adaptador no daña el modelo base.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere el modelo base completo `fishaudio/s2-pro` para funcionar.
- No se especifican requisitos de VRAM para el modelo base en la información disponible; se recomienda consultar la ficha de `fishaudio/s2-pro`.
- Al ser un adaptador sobre un modelo TTS grande, se necesita una GPU con suficiente memoria para el modelo base (típicamente 16 GB o más para versiones cuantizadas, según la configuración).
- Opciones de despliegue: el modelo se usa con la librería `fish-speech`; no se mencionan integraciones con vLLM, TGI u Ollama.
- No se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para TTS multilingüe) dentro de la documentación proporcionada. La comparación más relevante es contra el modelo base `fishaudio/s2-pro`, que ya se muestra en la sección de benchmarks. Se recomienda consultar el repositorio de Fish Audio para alternativas de adaptación a otros idiomas.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: la Fish Audio Research License limita el uso a investigación y fines no comerciales. Cualquier uso en producción comercial requiere otra licencia.
- El adaptador se entrenó con solo 2 horas de audio en pt-BR, por lo que puede no generalizar bien a todas las variedades regionales del portugués brasileño ni a voces muy diferentes de las del conjunto de entrenamiento.
- No se han publicado muestras de audio aún; la evaluación se basa en métricas objetivas y pruebas de escucha descritas en la documentación, pero no hay clips de demostración disponibles.
- La mejora en inteligibilidad es modesta y estadísticamente no significativa en las pruebas de escucha a ciegas; no debe esperarse un salto cualitativo frente al modelo base.
- El repositorio no incluye los pesos del modelo base; es necesario obtenerlos por separado y aceptar su licencia en HuggingFace.
- No se documentan sesgos específicos, pero al entrenar con datos de Common Voice y TAGARELA, las voces representadas pueden no cubrir toda la diversidad dialectal y demográfica del portugués brasileño.
- Riesgo de alucinación en TTS: como en cualquier modelo generativo de voz, puede producir artefactos o pronunciaciones incorrectas en entradas poco frecuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoZaokk/fish-s2-pro-ptbr-lora
- Modelo base: https://huggingface.co/fishaudio/s2-pro
- Repositorio de entrenamiento y evaluación: https://github.com/JoaoZaokk/ptbr-audio-lab
