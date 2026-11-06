# Infinix-ai/chatterbox

## Resumen

Chatterbox es una familia de modelos de síntesis de voz (text-to-speech) de código abierto desarrollada por Resemble AI y distribuida en Hugging Face bajo el identificador Infinix-ai/chatterbox. La versión principal, Chatterbox Multilingual V3, es un modelo de 0,5 mil millones de parámetros con un backbone Llama que soporta 23 idiomas de forma nativa e incluye clonación de voz zero-shot, control de exageración emocional y generación con marca de agua. Está pensado para aplicaciones de producción que necesitan TTS multilingüe de calidad con licencia permisiva.

El modelo resuelve el problema de la síntesis de voz multilingüe con identidad de hablante consistente entre idiomas, un área donde los sistemas anteriores tendían a degradar la similitud del hablante o a alucinar continuaciones no solicitadas. V3 introduce mejoras específicas en estabilidad, reducción de alucinaciones y naturalidad conversacional respecto a versiones anteriores de la familia.

La relevancia actual radica en su licencia MIT, su tamaño contenido (0,5B) que permite despliegue en hardware moderado, y su posicionamiento como alternativa open source a sistemas cerrados como ElevenLabs, con evaluaciones side-by-side que el autor reporta como favorables. El repositorio ocupa 13,9 GB e incluye pesos en formato nativo de la librería `chatterbox`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Llama de 0,5B parámetros para TTS |
| Parametros totales | 500M (0,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | 23: ar, da, de, el, en, es, fi, fr, he, hi, it, ja, ko, ms, nl, no, pl, pt, ru, sv, sw, tr, zh |
| Licencia | MIT |
| Formato de pesos | Formato nativo de la librería `chatterbox` (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

Chatterbox utiliza un backbone transformer de tipo Llama con 0,5 mil millones de parámetros adaptado para síntesis de voz. El modelo incorpora inferencia informada por alineamiento (alignment-informed inference) para mejorar la estabilidad de la generación, y soporta control de exageración emocional mediante un parámetro `exaggeration` junto con clasificador libre de guía (CFG) ajustable. Esta combinación permite modular la expresividad y el ritmo de la voz generada sin reentrenamiento.

El entrenamiento se realizó sobre 0,5 millones de horas de datos limpiados, según la model card. No se detalla la composición exacta del dataset ni si hubo fases de RLHF o DPO. La familia incluye además un Single Language Pack con finetunes dedicados para chino, español latinoamericano, portugués brasileño, español de España, portugués de Portugal e hindi, orientados a control de calidad específico por idioma y dialecto. Las salidas del modelo incorporan marca de agua (watermarking).

## Capacidades

- Síntesis de voz multilingüe en 23 idiomas con una única voz clonada.
- Clonación de voz zero-shot a partir de una referencia de hablante.
- Control de exageración emocional e intensidad mediante el parámetro `exaggeration`.
- Ajuste de ritmo y fidelidad mediante CFG (`cfg`), con recomendación de bajar a ~0,3 para hablantes rápidos.
- Generación de habla conversacional natural con estabilidad mejorada en V3.
- Reducción de alucinaciones, repeticiones y habla fuera de prompt respecto a versiones anteriores.
- Script de conversión de voz incluido.
- Salidas con marca de agua para trazabilidad.
- Finetunes específicos por idioma y dialecto en el Single Language Pack.

## Casos de uso

- Localización de contenido audiovisual: el modelo permite doblar vídeos, cursos o podcasts a cualquiera de los 23 idiomas manteniendo la identidad del hablante original mediante clonación zero-shot, lo que reduce la necesidad de contratar voces por idioma.
- Agentes de voz para atención al cliente: con 0,5B de parámetros y licencia MIT, se puede desplegar en infraestructura propia para generar respuestas habladas en tiempo real en múltiples idiomas, con control de expresividad para adaptar el tono al contexto.
- Audiolibros y narración: el control de `exaggeration` permite generar narraciones neutras o dramáticas según el género literario, y el ajuste de CFG permite mantener un ritmo constante en textos largos.
- Videojuegos y personajes interactivos: la clonación de voz y el control de intensidad emocional permiten generar diálogos dinámicos para NPCs con voces consistentes entre sesiones e idiomas.
- Accesibilidad y lectura de textos: integración en lectores de pantalla o asistentes que necesiten síntesis multilingüe con voces personalizadas para cada usuario.
- Prototipado de asistentes conversacionales: el tamaño reducido y la licencia permisiva facilitan iterar en local sobre pipelines de agentes de voz sin depender de APIs cerradas.
- Generación de contenido para redes y marketing: producción de locuciones en varios idiomas con una sola referencia de voz, útil para campañas que requieren coherencia de marca sonora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que el modelo ha sido comparado con sistemas cerrados como ElevenLabs y que resulta consistentemente preferido en evaluaciones side-by-side, con referencia al panel de Podonos, pero no se proporcionan cifras concretas (MOS, WER, similitud de hablante) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 0,5B parámetros, la inferencia en precisión completa requiere aproximadamente 1-2 GB para los pesos, más overhead de activaciones y del decodificador de audio.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, debería ejecutarse en GPUs consumer modernas (RTX 3060 en adelante) y en GPUs de datacenter (A100, H100) para despliegues de alto throughput.
- Compatibilidad con GPU consumer: probable dado el tamaño de 0,5B, aunque no se confirma en la documentación.
- Opciones de despliegue: la librería `chatterbox` es la vía nativa; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor menciona un servicio comercial con latencia inferior a 200 ms, pero no se refiere al modelo open source.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Clonacion de voz | Notas |
|---|---|---|---|---|---|
| Chatterbox Multilingual V3 | 0,5B | 23 | MIT | Sí (zero-shot) | Control de exageración, marca de agua |
| Chatterbox (original) | 0,5B | Inglés | MIT | Sí | Solo inglés, controles CFG y exageración |
| Single Language Pack | 0,5B cada uno | 1 por finetune | MIT | Sí | Finetunes para 6 idiomas/dialectos |

No se dispone de datos de benchmarks numéricos para comparar rendimiento con alternativas cerradas como ElevenLabs más allá de la afirmación cualitativa de preferencia en evaluaciones side-by-side.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos demográficos, acentos o variedades dialectales cubiertas dentro de cada idioma.
- Riesgo de alucinación: aunque V3 reduce continuaciones no deseadas, la generación de habla fuera de prompt sigue siendo un riesgo inherente a los modelos TTS autoregresivos.
- La longitud de contexto no está documentada, lo que limita la planificación de textos largos sin pruebas empíricas.
- La licencia MIT permite uso comercial, pero el watermarking de salidas puede tener implicaciones para aplicaciones que requieran audio sin marcar.
- El uso de clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes); se recomienda verificar consentimiento de las voces de referencia.
- El formato de pesos es específico de la librería `chatterbox`; no se documentan conversiones a GGUF u otros formatos, lo que puede limitar opciones de despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validación comunitaria de esta copia concreta (Infinix-ai/chatterbox) frente al repositorio original de ResembleAI.

## Enlaces

- Hugging Face: https://huggingface.co/Infinix-ai/chatterbox
- Repositorio original de referencia (ResembleAI): https://huggingface.co/ResembleAI/Chatterbox
- Demo de samples: https://resemble-ai.github.io/chatterbox_demopage/
- Space de Chatterbox: https://huggingface.co/spaces/ResembleAI/Chatterbox
- Space de Multilingual TTS V3: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS-V3
- Evaluación en Podonos: https://podonos.com/resembleai/chatterbox
- Sitio de Resemble AI: https://resemble.ai
