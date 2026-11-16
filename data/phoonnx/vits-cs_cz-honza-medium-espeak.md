# Phoonnx/vits-cs_cz-honza-medium-espeak

## Resumen

`vits-cs_cz-honza-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Thomcles a partir de su proyecto Piper-TTS-Czech y empaquetado por Phoonnx para su librería de TTS sobre ONNX. El modelo convierte texto en checo (`cs-CZ`) a audio inteligible, tomando como entrada fonemas espeak en alfabeto IPA en lugar de texto plano, lo que exige un front-end de fonemización previo.

El modelo resuelve el problema de la síntesis de voz en checo dentro del ecosistema phoonnx y OVOS (Open Voice OS), permitiendo integrar una voz checa de calidad media en asistentes de voz y aplicaciones de lectura en tiempo real. Su empaquetado en formato ONNX y su reducido tamaño de repositorio (0,1 GB) lo hacen adecuado para despliegue en entornos con recursos limitados, incluidos dispositivos de borde y navegador mediante phoonnx.js.

La relevancia actual radica en que amplía la cobertura lingüística de las voces Piper comunitarias dentro de phoonnx, ofreciendo una alternativa ligera y de licencia MIT para aplicaciones que necesitan TTS checo sin depender de servicios en la nube. La información pública disponible sobre el modelo es limitada: no se detallan parámetros totales, contexto ni datos de entrenamiento más allá de la arquitectura VITS y el origen upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | checo (`cs`, `cs-CZ`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con aprendizaje adversarial. Esta arquitectura genera audio de forma no autorregresiva, lo que permite una síntesis rápida y estable en comparación con modelos autorregresivos como Tacotron.

El modelo procede del proyecto upstream `Thomcles/Piper-TTS-Czech` (variante `medium`), entrenado para la voz checa `honza`. No se dispone de información pública sobre el número de tokens de audio empleados, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La innovación destacable del empaquetado es la integración del front-end de fonemización mediante espeak-ng (fonemas en IPA) a través de la librería `scriptconv`, que normaliza el texto y lo convierte en la entrada fonémica que espera el modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en checo a partir de texto normalizado y fonemizado.
- Conversión de texto a fonemas IPA mediante espeak-ng (front-end externo obligatorio).
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra directamente como plugin `ovos-tts-plugin-phoonnx` configurando la voz `piper_community/Thomcles/cs-CZ_honza_medium` en `mycroft.conf`, permitiendo respuestas habladas en checo en asistentes domésticos autoalojados.
- Lectura de textos en checo para accesibilidad: aplicaciones de lectura en pantalla pueden sintetizar documentos y notificaciones en checo con un modelo ligero que cabe en dispositivos de borde.
- Síntesis en el navegador: mediante phoonnx.js y la demo de TigreGotico, se puede generar voz checa en el cliente sin enviar texto a servidores externos, útil para aplicaciones web con requisitos de privacidad.
- Sistemas de anuncios automatizados: integración en pipelines de megafonía o notificaciones por voz en entornos checohablantes, donde el tamaño reducido del modelo permite despliegue en hardware modesto.
- Prototipado de interfaces conversacionales: desarrolladores que construyen asistentes en checo pueden usar esta voz para validar flujos de diálogo antes de invertir en voces comerciales.
- Generación de audiolibros o contenido educativo en checo: síntesis por lotes de texto a WAV con un modelo de licencia MIT que no impone restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se estima un consumo de memoria muy bajo, compatible con CPU.
- GPU recomendadas: no se especifican; el modelo ONNX puede ejecutarse en CPU y en GPU de gama baja.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido tamaño del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-cs_cz-honza-medium-espeak (este) | VITS | cs-CZ | MIT | ONNX | Hugging Face, phoonnx, OVOS |
| Thomcles/Piper-TTS-Czech (medium) | VITS (Piper) | cs-CZ | no disponible en la información | no disponible | Hugging Face (upstream) |
| Otras voces Piper comunitarias en la colección VITS de Phoonnx | VITS | varios | MIT (según colección) | ONNX | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de síntesis de voz en checo; no procesa otros idiomas ni tareas de lenguaje.
- Requiere espeak-ng instalado o el extra `phoonnx[espeak]`; sin él, el modelo no puede fonemizar la entrada.
- Con el port espyak, algunos fonemas difieren de espeak-ng y la voz puede pronunciar mal ciertas palabras, según advierte el autor.
- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre la calidad subjetiva de la voz (MOS no publicado).
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, nombres propios y extranjerismos.
- La licencia es MIT, pero el autor remite a los términos del release upstream; conviene verificar la licencia de `Thomcles/Piper-TTS-Czech` antes de uso comercial.
- No se documentan parámetros, datos de entrenamiento ni benchmarks, lo que limita la evaluación rigurosa previa a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cs_cz-honza-medium-espeak
- Upstream (Piper-TTS-Czech, medium): https://huggingface.co/Thomcles/Piper-TTS-Czech/tree/main/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
