# Hansda/hindi-voice-compact

## Resumen

Hindi Voice Compact es un modelo de síntesis de voz (text-to-speech) de una única voz en hindi, adaptado de la arquitectura compacta de Tiny Voca. Lo desarrolla Tamal Hansda y se publica bajo licencia Apache 2.0. El modelo está diseñado específicamente para inferencia en navegador: el artefacto INT7 ocupa solo 912.669 bytes (menos de 1 MB), lo que permite ejecutarlo en WebAssembly dentro de Chromium sin depender de servidores externos. Genera audio a 24 kHz a partir de texto en hindi.

El modelo se ha entrenado sobre un corpus sintético de 20 horas generado por Maya 2 Native con la voz Ishwari, publicado como dataset en Hugging Face. Incluye un fonemizador recurrente entrenado con etiquetas de pronunciación de eSpeak NG y un lexicón propio, ambos empaquetados para la inferencia en navegador. La arquitectura incorpora un residuo de forma de onda aprendido, una innovación de la familia Tiny Voca que mejora la calidad del audio reconstruido en modelos de muy baja huella.

Se trata de un modelo de nicho, con 0 descargas y 1 like en el momento de la consulta, y sin datos de benchmarks estándar más allá de las métricas internas de validación y test publicadas por el autor (MOS predicho y CER). Es relevante para desarrolladores que necesiten TTS hindi ligero, offline y ejecutable en el cliente, no para pipelines de producción de alta fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptación compacta de Tiny Voca con residuo de forma de onda aprendido (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | INT7 (principal, 912.669 bytes); INT6 mencionado; pesos sensibles seleccionados a 8 bits; fuente FP32 incluida |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos empaquetados para WebAssembly (grafo comprimido + unpacker); fuente FP32 incluida; safetensors/GGUF no disponible |
| Frecuencia de muestreo | 24 kHz |
| Voz | Única (Ishwari, sintética) |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de Tiny Voca, un proyecto de TTS compacto, y adopta la arquitectura compacta bengalí con un residuo de forma de onda aprendido. El artefacto de inferencia empaquetado incluye el grafo comprimido, los pesos empaquetados y el unpacker; el runtime compartido y el frontend de idioma se descargan por separado. El tokenizador se entrenó sobre las transcripciones de entrenamiento del dataset, y el fonemizador recurrente se entrenó con etiquetas de pronunciación de eSpeak NG; la inferencia en navegador usa el fonemizador aprendido y el lexicón incluidos.

Los datos de entrenamiento proceden del corpus sintético Hansda/hindi-maya2-ishwari-20h (20 horas), generado por Maya 2 Native con la voz Ishwari. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni etapas de RLHF/DPO. La cuantización INT6 e INT7 emplea pesos calibrados con tensores sensibles seleccionados mantenidos a 8 bits, y la fuente FP32 del mejor variante se incluye para permitir entrenamiento adicional.

## Capacidades

- Síntesis de voz en hindi a 24 kHz con una única voz (Ishwari).
- Inferencia en navegador mediante WebAssembly en Chromium, sin servidor.
- Modelo de menos de 1 MB en INT7, adecuado para descarga rápida y ejecución en cliente.
- Fonemización integrada mediante fonemizador recurrente aprendido y lexicón incluido.
- Cuantización calibrada con protección de tensores sensibles a 8 bits.
- Fuente FP32 incluida para fine-tuning o reentrenamiento.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- Lectura de texto en hindi en aplicaciones web: el modelo puede sintetizar contenido dinámico en el navegador con WebAssembly, sin enviar texto a un servidor, lo que reduce latencia y mejora la privacidad.
- Accesibilidad en interfaces web: convertir artículos, formularios o notificaciones en audio hindi para usuarios con discapacidad visual o preferencia auditiva, aprovechando el tamaño inferior a 1 MB para carga rápida.
- Aplicaciones educativas offline: lección de pronunciación o lectura de material didáctico en hindi en dispositivos con conectividad limitada, al ejecutarse enteramente en el cliente.
- Prototipos y demos de TTS: validar flujos de voz en hindi con un artefacto ligero antes de invertir en modelos de mayor tamaño; el demo público en tts.hansda.in permite evaluar la calidad percibida.
- Sistemas embebidos o PWA: integrar voz hindi en aplicaciones progresivas o entornos con recursos restringidos, dado el reducido tamaño del modelo y la ausencia de dependencia de GPU.
- Investigación en TTS compacto: usar la fuente FP32 incluida para experimentar con fine-tuning, cuantización o adaptación a otras voces, partiendo de una arquitectura documentada y un dataset sintético reproducible.
- Generación de audiolibros o podcasts de bajo coste: sintetizar guiones hindi por lotes en el cliente o en servidores modestos, con una sola voz consistente.

## Benchmarks y rendimiento

| Variante | Bytes del modelo en navegador | MOS predicho (validación) | CER (validación) | MOS predicho (test) | CER (test) |
|---|---:|---:|---:|---:|---:|
| INT7 | 912.669 | 2.327 | 3.56% | 2.291 | 3.28% |

Las puntuaciones INT7 se obtuvieron con WebAssembly de Chromium a un ritmo calibrado de 0.9333 respecto al modelo bruto; el demo usa ese ritmo a 1×. UTMOSv2 se evaluó con 24 clips reservados y semillas 17, 29 y 43 por split; el CER independiente por ASR se basa en 72 clips reservados cuando están disponibles, e incluye el error del reconocedor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable en un modelo TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia objetivo es WebAssembly en CPU dentro de Chromium.
- GPU recomendadas: no aplica para el flujo de navegador; la fuente FP32 podría entrenarse o evaluarse en GPU, pero no se documentan requisitos concretos (no disponible).
- Cabe en cualquier equipo consumer capaz de ejecutar un navegador Chromium; el artefacto INT7 es inferior a 1 MB.
- Opciones de despliegue: runtime WebAssembly incluido en el demo (tts.hansda.in); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplica a TTS).
- Latencia y throughput: no disponibles; solo se documenta el factor de ritmo calibrado 0.9333 respecto al modelo bruto en WebAssembly de Chromium.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto/idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hindi Voice Compact (este modelo) | TTS compacto en navegador | <1 MB (INT7) | Hindi, 24 kHz | Apache 2.0 | Hugging Face, demo web |
| Tiny Voca (arquitectura base) | TTS compacto | no disponible | Multilingüe según variante | no disponible en la información | GitHub (n4ze3m/tiny-voca) |
| Maya 2 Native (generador del corpus) | TTS | no disponible | Hindi (voz Ishwari) | no disponible en la información | Hugging Face (maya-research/maya2-native) |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la información proporcionada; la comparación se limita a arquitectura, tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- Una sola voz y un solo idioma (hindi); no hay soporte multilingüe ni cambio de voz.
- Calidad limitada: MOS predicho de 2.327 en validación y 2.291 en test, por debajo de la calidad de TTS de producción de mayor tamaño.
- El corpus de entrenamiento es sintético (generado por Maya 2 Native), lo que puede introducir artefactos y sesgos propios del modelo generador; la atribución y licencia de las fuentes de texto deben consultarse en la dataset card.
- Riesgo de alucinación acústica y errores de pronunciación en palabras fuera del lexicón o del dominio de entrenamiento; el CER de test es del 3.28% con un reconocedor concreto.
- Las métricas publicadas son internas y dependen del reconocedor ASR usado y del entorno WebAssembly de Chromium; no son comparables directamente con benchmarks externos.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las obligaciones de atribución del dataset sintético y del proyecto Tiny Voca del que deriva.
- Modelo con nulo respaldo de la comunidad (0 descargas, 1 like) y sin documentación de parámetros totales ni de formato de pesos estándar (safetensors/GGUF), lo que dificulta su integración en pipelines convencionales.
- La fecha de creación del repositorio (2026-11-19) y el año de la cita (2026) deben verificarse antes de citarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hansda/hindi-voice-compact
- Demo en navegador: https://tts.hansda.in/?lang=hi
- Dataset de entrenamiento: https://huggingface.co/datasets/Hansda/hindi-maya2-ishwari-20h
- Commit del dataset: https://huggingface.co/datasets/Hansda/hindi-maya2-ishwari-20h/commit/71a5e9401eb4e21ed89cec08642c94e58782a8fb
- Proyecto Tiny Voca: https://github.com/n4ze3m/tiny-voca
- Modelo generador del corpus (Maya 2 Native): https://huggingface.co/maya-research/maya2-native
