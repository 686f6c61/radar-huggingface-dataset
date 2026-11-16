# Phoonnx/vits-ne_np-chitwan-medium-espeak

## Resumen

vits-ne_np-chitwan-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede del proyecto Rhasspy, concretamente de la colección piper-voices, en la ruta ne/ne_NP/chitwan/medium, y se distribuye en formato ONNX listo para inferencia. Su propósito es convertir texto en nepalí (ne-NP) a audio inteligible, usando fonemas generados por espeak-ng como entrada.

El modelo está orientado a entornos de asistencia por voz de código abierto, especialmente dentro del ecosistema OVOS (Open Voice OS), donde se integra mediante el plugin ovos-tts-plugin-phoonnx. Al estar basado en VITS, combina un codificador de texto, un prior variacional y un decodificador de audio en un único modelo entrenado de extremo a extremo, lo que permite síntesis rápida y de calidad razonable sin necesidad de vocoder externo.

La relevancia de esta ficha es acotada: se trata de una voz concreta para un idioma de bajos recursos (nepalí), con licencia MIT y un tamaño de repositorio de 0,1 GB, lo que la hace ligera y fácil de desplegar en CPU. No es un modelo de lenguaje generativo ni un sistema multimodal; es un componente especializado de TTS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | nepalí (ne-NP) |
| Licencia | MIT |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz condicional variacional que integra en un solo modelo el codificador de texto, el prior latente y el decodificador de waveform, entrenado de forma adversarial con un discriminador multiperiodo. Esto elimina la necesidad de un vocoder separado y permite inferencia de extremo a extremo. El modelo aquí presentado es una conversión del checkpoint original de Rhasspy (piper-voices, voz chitwan, calidad medium) al formato ONNX empaquetado por Phoonnx.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a TTS). La entrada de texto se procesa mediante espeak-ng para generar fonemas en alfabeto IPA; la model card advierte que el uso del port espyak en lugar de espeak-ng puede producir pronunciaciones incorrectas en algunas palabras. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en nepalí (ne-NP), con salida en formato WAV.
- Fonemización mediante espeak-ng (alfabeto IPA) como front-end de texto.
- Normalización y conversión de texto delegadas a la librería scriptconv.
- Integración con OVOS mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecución en Python a través de phoonnx y en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al nepalí.

## Casos de uso

- Asistentes de voz en nepalí: el modelo puede integrarse en OVOS como motor TTS para responder a consultas de usuario en ne-NP, gracias a su licencia MIT y su formato ONNX ligero.
- Lectura de contenido accesible: conversión de artículos, noticias o documentos en nepalí a audio para usuarios con discapacidad visual o para consumo en movilidad.
- Sistemas de anuncios automatizados: generación de avisos hablados en nepalí para transporte público, aeropuertos o comercios, con síntesis rápida en CPU.
- Integración en aplicaciones web: mediante phoonnx.js, se puede ofrecer síntesis de voz en el navegador sin backend, útil para demos o interfaces de bajo coste.
- Prototipado de interfaces conversacionales: al ser un modelo pequeño (0,1 GB), permite iterar rápidamente en el desarrollo de flujos de voz sin grandes requisitos de infraestructura.
- Educación y aprendizaje de idiomas: generación de pronunciaciones de referencia en nepalí para materiales didácticos, aunque con la advertencia de posibles errores fonéticos con espyak.
- Localización de contenido multimedia: doblaje automatizado de vídeos o podcasts al nepalí en pipelines de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que funcione en CPU sin GPU dedicada, pero no se documenta cifra exacta.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria, aunque no confirmado.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ne_np-chitwan-medium-espeak | VITS | ne-NP | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces de piper-voices (p. ej. en_US, es_ES) | VITS | varios | no aplica | MIT (según upstream) | ONNX | Hugging Face (Rhasspy) |
| Modelos TTS multilingües comerciales | no disponible | múltiples | no aplica | propietaria | no disponible | APIs comerciales |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta nepalí (ne-NP); no es multilingüe.
- La fonemización depende de espeak-ng; el uso de espyak puede provocar errores de pronunciación en algunas palabras, según advierte la model card.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de voz limitados, puede presentar sesgos de género, edad o acento no evaluados.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede generar audio ininteligible o incorrecto ante texto fuera de dominio o con caracteres no soportados.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices para confirmar compatibilidad.
- No hay información sobre latencia, calidad objetiva (MOS) ni robustez ante ruido o texto complejo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca validación comunitaria; usar con cautela en producción.

## Enlaces

- [Hugging Face: Phoonnx/vits-ne_np-chitwan-medium-espeak](https://huggingface.co/Phoonnx/vits-ne_np-chitwan-medium-espeak)
- [Upstream: rhasspy/piper-voices/ne/ne_NP/chitwan/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/ne/ne_NP/chitwan/medium)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
