# qualcomm/MeloTTS-ZH

## Resumen

MeloTTS-ZH es un modelo de síntesis de voz (pipeline text-to-audio) para chino publicado por Qualcomm en HuggingFace. No es un modelo entrenado desde cero por Qualcomm, sino una exportación optimizada del checkpoint `myshell-ai/MeloTTS-Chinese`, la variante china de la librería MeloTTS de MyShell, preparada para ejecutarse sobre hardware Qualcomm con el runtime VOICE_AI y el SDK Qualcomm Voice AI.

El problema que resuelve es el despliegue de TTS neuronal de calidad en el propio dispositivo (on-device), sin depender de la nube. Los artefactos pre-exportados permiten compilar y ejecutar el modelo sobre la NPU de plataformas Snapdragon: móvil (8 Elite Gen 5, 8 Elite, 8 Gen 3), PC (X Elite, X2 Elite) y las familias Dragonwing IQ-8275, IQ-9075, QCS8550, SA8775P y SA7255P. La arquitectura se descompone en cuatro submodelos independientes (bert_wrapper, encoder, flow y decoder) que suman unos 195 millones de parámetros y una longitud máxima de secuencia decodificada de 512 tokens.

Es relevante ahora porque traslada un pipeline TTS multicomponente completo a un formato compilable para NPU con latencias de milisegundos (2,624 ms por invocación del bert_wrapper en Snapdragon 8 Elite Gen 5) y porque se distribuye con licencia MIT, lo que simplifica su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS modular de cuatro submodelos: bert_wrapper (codificador de texto), encoder, flow y decoder |
| Parámetros totales | 195,0 M aproximadamente (152 M bert_wrapper + 14,5 M decoder + 8,34 M encoder + 20,1 M flow) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Máxima longitud de secuencia decodificada: 512 tokens |
| Tipos de cuantización | `mixed_with_float` (precisión de los artefactos VOICE_AI publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Chino (checkpoint `myshell-ai/MeloTTS-Chinese`); la librería MeloTTS original cubre inglés, chino y español, pero este repositorio es la variante ZH |
| Licencia | MIT |
| Formato de pesos | PyTorch y artefactos pre-exportados para el runtime VOICE_AI (QAIRT 2.50) en ficheros ZIP; no se publican safetensors ni GGUF en este repositorio |
| Autor | qualcomm |
| Pipeline | text-to-audio |
| Tamaño en float por componente | bert_wrapper: 581 MB; decoder: 55,5 MB; flow: 76,9 MB; encoder: 31,9 MB (total aproximado: 745,3 MB) |
| Runtime | VOICE_AI (Qualcomm Voice AI SDK, QAIRT 2.50) |
| Unidad de cómputo principal | NPU |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creación / actualización | 2026-03-12 / 2026-10-07 |

## Arquitectura y entrenamiento

La model card describe el modelo como un pipeline de generación de audio compuesto por cuatro bloques exportados de forma independiente: `bert_wrapper`, `encoder`, `flow` y `decoder`. La presencia de un envoltorio tipo BERT como codificador de texto, junto con un encoder, un bloque de flujo y un decoder, corresponde a la estructura típica de los sistemas TTS neuronales con modelado de flujo aplicado sobre representaciones mel, aunque la documentación proporcionada no detalla la topología interna de cada bloque, el tipo de atención ni el vocoder empleado. Cada submodelo se compila y perfila por separado, lo que permite asignar distintos presupuestos de memoria y precisión a cada etapa.

En cuanto al entrenamiento, no hay información disponible en la documentación facilitada: no se indican el número de tokens, la composición del dataset, el idioma de los datos de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste por preferencias. El modelo es una reexportación de los pesos de `myshell-ai/MeloTTS-Chinese`, por lo que cualquier detalle de entrenamiento habría que consultarlo en la ficha del checkpoint original. La innovación técnica de este repositorio es, por tanto, de despliegue y no de modelado: exportación a QAIRT 2.50, partición en cuatro grafos y ejecución sobre NPU con precisión mixta.

## Capacidades

- Generación de voz en chino a partir de texto, con salida de audio (pipeline `text-to-audio`).
- Inferencia on-device sobre NPU Qualcomm, sin necesidad de conectividad ni de servidores externos.
- Ejecución con precisión `mixed_with_float`, con la mayor parte del cómputo asignada a la NPU.
- Descomposición en cuatro submodelos compilables y perfilables de forma independiente, lo que facilita ajustar latencia y memoria por etapa.
- Soporte de exportación con configuraciones personalizadas (pesos ajustados, formas de entrada propias, dispositivo y runtime objetivo) mediante la librería Qualcomm AI Hub Models.
- Compatibilidad con el Qualcomm Voice AI SDK para integración en aplicaciones finales.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de razonamiento explícito.

## Casos de uso

- Lectura por voz en aplicaciones Android: integración del modelo a través del Qualcomm Voice AI SDK para convertir texto en audio en el propio terminal, con la ventaja de que no se envía texto del usuario a la nube y la latencia no depende de la red.
- Asistentes de voz embebidos en IoT y automoción: las variantes para Dragonwing IQ-8275, QCS8550, SA8775P y SA7255P permiten dotar de voz sintética a paneles de control, kioscos y centralitas sin hardware adicional de cómputo.
- Avisos y navegación en vehículos: generación de instrucciones habladas en chino a bordo, donde la predicibilidad de la latencia (del orden de milisegundos por invocación del codificador de texto) es crítica para no solapar la voz con otras alertas.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla y lectores de documentos que conviertan texto chino en audio en dispositivos Snapdragon sin depender de un servicio externo.
- Audiolibros y lectura de artículos largos: el límite de 512 tokens de secuencia decodificada implica trocear el texto en segmentos y encadenar síntesis, lo que encaja con pipelines de lectura por párrafos.
- Asistentes telefónicos y sistemas IVR en chino: síntesis de respuestas y menús en centralitas, con despliegue en el propio equipo para reducir costes operativos frente a APIs en la nube.
- Doblaje y generación de contenido: producción de pistas de voz para vídeo, pódcast o material formativo en chino, con la ventaja de la licencia MIT para uso comercial.
- Prototipado de productos de voz: uso de la librería de exportación para generar artefactos con formas de entrada o pesos ajustados propios antes de comprometer el diseño de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de calidad de síntesis (MOS, CMOS, WER de reconocimiento sobre el audio generado) ni comparaciones con otros sistemas TTS. Lo que sí se publica son métricas de despliegue del runtime VOICE_AI con precisión `mixed_with_float`, de las que se dispone de forma parcial:

| Submodelo | Runtime | Precisión | Chipset | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de cómputo |
|---|---|---|---|---|---|---|
| bert_wrapper | VOICE_AI | mixed_with_float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 2,624 | 0 - 7 | NPU |
| bert_wrapper | VOICE_AI | mixed_with_float | Snapdragon 8 Elite For Galaxy Mobile | 3,305 | 0 - 7 | NPU |
| bert_wrapper | VOICE_AI | mixed_with_float | Snapdragon X2 Elite | 3,289 | 0 - 0 | NPU |

Los datos correspondientes al resto de submodelos y de chipsets aparecen truncados en la información disponible y no se reproducen aquí para no inducir a error. Para métricas adicionales, la model card remite a la página de MeloTTS-ZH en Qualcomm AI Hub.

## Requisitos de hardware

- Diseñado para ejecución on-device sobre NPU Qualcomm; el runtime objetivo es VOICE_AI con QAIRT 2.50, no CUDA ni ROCm.
- Chipsets con artefactos pre-exportados disponibles: Snapdragon 8 Elite Gen 5 For Galaxy, Snapdragon 8 Elite For Galaxy, Snapdragon 8 Gen 3, Snapdragon X Elite, Snapdragon X2 Elite, Dragonwing IQ-8275, Dragonwing IQ-9075, QCS8550 (proxy proxy), SA8775P y SA7255P.
- Tamaño de pesos en float, sumando los cuatro submodelos: aproximadamente 745,3 MB, lo que en teoría permitiría cargar el modelo en GPU de consumo con 8 GB de VRAM o más. No obstante, no hay confirmación de que los artefactos VOICE_AI sean portables a GPU ni se publican instrucciones para ello.
- Memoria pico medida en ejecución para el submodelo bert_wrapper: entre 0 y 7 MB según chipset, lo que indica que las etapas individuales tienen una huella muy reducida una vez compiladas.
- GPU de servidor tipo A100 o H100: no aplica al flujo de despliegue documentado; solo serían relevantes si se ejecuta el checkpoint PyTorch original con otras herramientas, escenario para el que no se publican cifras.
- Opciones de despliegue documentadas: Qualcomm AI Hub Workbench (compilación y perfilado en dispositivo alojado) y Qualcomm Voice AI SDK (descarga desde Qualcomm Package Manager). No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de generación de audio.
- Latencia: 2,624 ms en Snapdragon 8 Elite Gen 5 For Galaxy, 3,289 ms en Snapdragon X2 Elite y 3,305 ms en Snapdragon 8 Elite For Galaxy para el submodelo bert_wrapper. No se dispone de latencia agregada del pipeline completo ni de cifras de throughput (caracteres o segundos de audio por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / límite | Idioma | Licencia | Despliegue objetivo | Optimización de hardware |
|---|---|---|---|---|---|---|
| MeloTTS-ZH (qualcomm) | ~195 M en cuatro submodelos | 512 tokens de secuencia decodificada | Chino | MIT | On-device, runtime VOICE_AI (QAIRT 2.50) | Sí, NPU Qualcomm con precisión mixta |
| myshell-ai/MeloTTS-Chinese | Mismos pesos que el checkpoint de origen (el desglose por submodelo no se detalla en la información disponible) | No disponible | Chino | MIT | PyTorch genérico | No específica para NPU |
| Otras alternativas de TTS en chino | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el checkpoint original de MyShell citado expresamente en la model card. No hay datos de benchmarks, latencias ni tamaños de otras librerías TTS en chino dentro del material disponible, por lo que cualquier comparación adicional con sistemas como Piper, Kokoro o VITS quedaría sin respaldo documental.

## Limitaciones y advertencias

- No se documenta ningún análisis de sesgos. Al ser un modelo de síntesis de voz, los riesgos relevantes son de representación de acentos y variedades dialectales, no de generación de texto sesgado.
- Riesgo de alucinación en el sentido clásico no aplicable, pero sí de errores de pronunciación, prosodia incorrecta o lectura defectuosa de números, siglas y nombres propios; no se publican métricas de inteligibilidad que permitan cuantificarlo.
- Idioma limitado a chino: el repositorio corresponde a la variante ZH aunque MeloTTS original cubra inglés, chino y español. No hay soporte multilingüe en estos artefactos.
- Límite de 512 tokens de secuencia decodificada, lo que obliga a trocear entradas largas y gestionar la concatenación de audio en la aplicación.
- Licencia MIT: permite uso comercial y modificación, pero hay que conservar el aviso de copyright y la propia licencia. No se indica en la información disponible si los pesos derivados de MeloTTS-Chinese arrastran condiciones adicionales del proyecto original.
- Dependencia fuerte del ecosistema Qualcomm: los artefactos pre-exportados están ligados a versiones concretas del runtime (VOICE_AI, QAIRT 2.50) y a chipsets específicos. Cambiar de plataforma exige reexportar con la librería de AI Hub Models.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que se traduce en poca validación externa y en ausencia de informes de terceros sobre comportamiento en producción.
- No se publican detalles de entrenamiento, dataset ni proceso de alineación, lo que dificulta auditar el origen de los datos de voz.
- Los pesos originales son de un tercero (MyShell) y Qualcomm solo aporta la exportación; cualquier incidencia de calidad deberá contrastarse contra el checkpoint de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/MeloTTS-ZH
- MeloTTS-ZH en Qualcomm AI Hub: https://aihub.qualcomm.com/models/melotts_zh
- Repositorio de exportación en GitHub (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/melotts_zh
- Repositorio general Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Workbench de Qualcomm AI Hub: https://workbench.aihub.qualcomm.com
- SDK Qualcomm Voice AI en Qualcomm Package Manager: https://qpm.qualcomm.com/#/main/tools/details/VoiceAI_TTS
- Implementación original de MeloTTS (MyShell): https://github.com/myshell-ai/MeloTTS
- Página corporativa de Qualcomm: https://www.qualcomm.com/
- Información de la compañía: https://www.qualcomm.com/company
