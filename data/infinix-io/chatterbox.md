# Infinix-io/chatterbox

## Resumen

Chatterbox es un modelo de síntesis de voz (text-to-speech) de código abierto desarrollado por Resemble AI y distribuido en HuggingFace bajo el identificador `Infinix-io/chatterbox`. Se trata de la variante Multilingual V3 de la familia Chatterbox, un modelo de 500 millones de parámetros construido sobre un backbone Llama que soporta clonación de voz zero-shot y generación de habla en 23 idiomas, incluyendo castellano de España y variantes regionales específicas.

El modelo resuelve el problema de la síntesis de voz multilingüe de calidad producción con licencia permisiva (MIT), un nicho históricamente dominado por servicios cerrados como ElevenLabs. Su relevancia actual radica en que combina clonación de voz entre idiomas, control de exageración emocional (primera implementación open source de esta funcionalidad según el autor) y una estabilidad de inferencia mejorada respecto a versiones anteriores, todo ello en un tamaño que cabe en GPUs de consumo.

La versión V3 introduce mejoras en similitud del hablante, reducción de alucinaciones (continuaciones no deseadas, repeticiones y habla fuera de prompt) y una mayor naturalidad conversacional. El repositorio ocupa 13,9 GB e incluye tanto el modelo multilingüe general como finetunes dedicados por idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Llama (transformer) para TTS, con inferencia informada por alineamiento |
| Parámetros totales | 500M (0,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | 23: árabe, danés, alemán, griego, inglés, español, finés, francés, hebreo, hindi, italiano, japonés, coreano, malayo, neerlandés, noruego, polaco, portugués, ruso, sueco, suajili, turco, chino |
| Licencia | MIT |
| Formato de pesos | No disponible (librería `chatterbox`) |

## Arquitectura y entrenamiento

Chatterbox emplea un backbone Llama de 0,5B parámetros adaptado para síntesis de voz, con una estrategia de inferencia informada por alineamiento que el autor describe como "ultra-estable". El modelo está entrenado sobre 0,5 millones de horas de datos de habla limpios, lo que constituye un volumen de entrenamiento considerable para un modelo de este tamaño. La arquitectura soporta clonación de voz zero-shot, es decir, generar habla en la voz de un hablante de referencia sin necesidad de fine-tuning.

Entre las innovaciones técnicas destacables figuran el control de exageración/intensidad emocional (parámetro `exaggeration`), que permite modular la expresividad del habla generada, y el uso de classifier-free guidance (`cfg`) para controlar la fidelidad al prompt y el ritmo. El modelo incorpora marcado de agua (watermarking) en las salidas de audio, una medida de trazabilidad para uso responsable. No se detalla en la información disponible la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas, incluyendo castellano de España y español latinoamericano mediante finetunes dedicados.
- Clonación de voz zero-shot a partir de una muestra de referencia del hablante.
- Clonación de voz entre idiomas (cross-language voice cloning), preservando identidad y acento del hablante a través de distintos idiomas.
- Control de exageración emocional mediante el parámetro `exaggeration`, para modular la expresividad.
- Control de ritmo y fidelidad mediante classifier-free guidance (`cfg`).
- Inferencia estable con reducción de alucinaciones (repeticiones, continuaciones no deseadas, habla fuera de prompt).
- Generación de habla conversacional natural orientada a agentes de voz.
- Marcado de agua en las salidas de audio.
- Script de conversión de voz incluido.
- No se menciona soporte de tool calling, function calling ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- **Localización de contenido audiovisual:** doblaje de vídeos, cursos y materiales formativos a los 23 idiomas soportados manteniendo la voz del hablante original gracias a la clonación cross-language, lo que reduce costes frente a doblaje tradicional.
- **Agentes de voz en atención al cliente:** generación de respuestas habladas naturales en conversaciones multi-turno, con control de exageración para ajustar el tono (neutro para soporte, más expresivo para marketing).
- **Audiolibros y narración:** síntesis de texto largo con una voz de referencia consistente, usando `cfg` bajo (~0,3) para hablantes de ritmo rápido y `exaggeration` elevado (~0,7) para pasajes dramáticos.
- **Accesibilidad:** conversión de texto a voz para lectores de pantalla y aplicaciones de asistencia a personas con discapacidad visual, con voces personalizadas clonadas del propio usuario.
- **Videojuegos y medios interactivos:** generación dinámica de diálogos de personajes no jugables (NPC) con voces distintas y control de intensidad emocional según el contexto de la escena.
- **Creación de contenido para redes y memes:** generación rápida de voces expresivas con control de exageración, uno de los casos que el propio autor menciona explícitamente.
- **Prototipado de asistentes conversacionales:** integración en pipelines de agentes de IA que requieren salida de voz de baja latencia y licencia permisiva para uso comercial.

## Benchmarks y rendimiento

El autor afirma que el modelo ha sido comparado con sistemas cerrados como ElevenLabs y que es consistentemente preferido en evaluaciones lado a lado, con un enlace a Podonos. Sin embargo, no se proporcionan cifras numéricas de benchmarks (MOS, WER, similitud de hablante) en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No aplica (modelo TTS) |
| Evaluación MOS / preferencia | No se han publicado cifras numéricas en la información disponible; el autor remite a Podonos |

## Requisitos de hardware

- **VRAM estimada:** con 0,5B parámetros, la inferencia en FP16 requiere aproximadamente 1-2 GB de VRAM para los pesos, más overhead de activaciones y audio; no se especifica en la información disponible.
- **GPU recomendadas:** no se detallan en la información disponible; por tamaño, cualquier GPU con 4-8 GB de VRAM debería ser suficiente.
- **GPU de consumo:** el tamaño de 0,5B permite inferencia en GPUs de consumo como RTX 3060, RTX 4060 o superiores; no confirmado explícitamente por el autor.
- **Opciones de despliegue:** la librería es `chatterbox`; existe una demo en HuggingFace Spaces (Gradio). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- **Latencia y throughput:** el autor menciona que su servicio comercial (no el modelo open source) ofrece latencia inferior a 200 ms; no se proporcionan cifras de latencia para la inferencia local.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Control emocional | Licencia |
|---|---|---|---|---|---|
| Chatterbox Multilingual V3 | 500M | 23 | Zero-shot, cross-language | Sí (`exaggeration`) | MIT |
| ElevenLabs (cerrado) | No disponible | Múltiples | Sí | Parcial | Propietaria |
| Otros TTS open source | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar cualitativamente con ElevenLabs, sistema cerrado frente al que el autor declara superioridad en preferencia. No se dispone de datos de otros modelos TTS open source comparables en la documentación facilitada.

## Limitaciones y advertencias

- **Alucinaciones de audio:** aunque V3 reduce repeticiones y continuaciones no deseadas, el autor reconoce que versiones anteriores eran menos estables; persiste el riesgo de artefactos en prompts atípicos.
- **Sesgos:** no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con habla humana, puede reflejar sesgos de acento, género y origen en la clonación.
- **Cobertura lingüística desigual:** los 23 idiomas no tienen necesariamente la misma calidad; el autor ofrece finetunes dedicados solo para chino, español latinoamericano, portugués brasileño, español de España, portugués de Portugal e hindi, lo que sugiere que el resto depende del modelo multilingüe general.
- **Uso dual y deepfakes:** la clonación de voz zero-shot facilita usos maliciosos; el marcado de agua en las salidas mitiga parcialmente este riesgo, pero no lo elimina.
- **Licencia:** MIT permite uso comercial sin restricciones, pero el usuario debe cumplir la legislación aplicable sobre derechos de voz e imagen de los hablantes clonados.
- **Producción:** el autor remite a su servicio comercial para escalado y baja latencia, lo que sugiere que la inferencia local puede no alcanzar latencias de producción sin optimización adicional.
- **Datos técnicos incompletos:** no se especifican formato de pesos, cuantizaciones soportadas ni longitud de contexto, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infinix-io/chatterbox
- Repositorio original (Resemble AI): https://huggingface.co/ResembleAI/Chatterbox
- Demo Chatterbox Multilingual TTS V3: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3
- Demo Chatterbox (inglés): https://huggingface.co/spaces/ResembleAI/Chatterbox
- Página de muestras de audio: https://resemble-ai.github.io/chatterbox_demopage/
- Evaluación Podonos: https://podonos.com/resembleai/chatterbox
- Sitio de Resemble AI: https://resemble.ai
