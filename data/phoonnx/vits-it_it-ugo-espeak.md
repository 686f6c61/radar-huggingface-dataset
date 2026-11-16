# Phoonnx/vits-it_it-ugo-espeak

## Resumen

vits-it_it-ugo-espeak es un modelo de síntesis de voz (text-to-speech) en italiano basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con su librería de inferencia ONNX del mismo nombre. El modelo original procede de Einrich99, en concreto de la variante `medium` del repositorio PiperTTS-UGO-Italian, y Phoonnx lo ha adaptado al formato ONNX y a su ecosistema de voces, manteniendo la licencia CC-BY-4.0 del proyecto upstream.

El modelo resuelve la conversión de texto a audio en italiano (`it-IT`) a partir de fonemas generados por espeak-ng en alfabeto IPA, lo que lo hace dependiente de un front-end fonemizador externo. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que indica un modelo ligero orientado a inferencia en CPU o GPU de gama baja, típico de la familia VITS de Piper.

Su relevancia actual reside en que permite integrar TTS italiano de código abierto en entornos OVOS (Open Voice OS) y en aplicaciones Python mediante el plugin `ovos-tts-plugin-phoonnx`, además de contar con una variante JavaScript (`phoonnx.js`) que ejecuta voces VITS en el navegador. Es una opción práctica para asistentes de voz locales y despliegues sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | italiano (`it-IT`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta. VITS produce audio de forma end-to-end a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia, lo que reduce la latencia y simplifica el despliegue.

El entrenamiento original corresponde a Einrich99 en el repositorio PiperTTS-UGO-Italian (variante `medium`). No se dispone de información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no detalla el proceso de entrenamiento. La innovación destacable en este empaquetado es la integración con el front-end de espeak-ng mediante `scriptconv`, que normaliza el texto y lo convierte a fonemas IPA antes de la síntesis.

## Capacidades

- Síntesis de voz en italiano (`it-IT`) a partir de texto escrito.
- Entrada basada en fonemas espeak-ng en alfabeto IPA, con normalización de texto previa mediante `scriptconv`.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js` (voces VITS con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es exclusivamente un modelo TTS.
- No dispone de capacidades multimodales (visión, audio de entrada) ni de modo de razonamiento.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como módulo TTS en `mycroft.conf`, permitiendo respuestas habladas en italiano sin conexión a servicios externos, gracias a su formato ONNX ligero.
- Lectura de textos en italiano en aplicaciones Python: mediante `TTSModelManager` y `synthesize_wav`, se puede convertir cualquier cadena de texto en un archivo WAV para audiolibros, notificaciones o accesibilidad.
- Síntesis de voz en el navegador: con `phoonnx.js` se puede ejecutar el modelo del lado del cliente para interfaces web que necesiten leer contenido en italiano sin enviar texto a un servidor.
- Automatización de locuciones para contenidos multimedia: generación de pistas de voz para vídeos, pódcast o tutoriales en italiano en pipelines de producción por lotes.
- Sistemas de megafonía o anuncios programados: al ser un modelo de 0,1 GB, puede desplegarse en dispositivos de borde (Raspberry Pi, mini-PC) para anuncios en italiano en comercios o transporte.
- Pruebas de integración de TTS en CI/CD: el modelo sirve como voz de referencia para validar pipelines de audio en proyectos que usan phoonnx, con licencia permisiva CC-BY-4.0.
- Prototipado de interfaces conversacionales en italiano: combinado con un LLM y un ASR, permite construir un bucle de voz completo en local para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,1 GB), el modelo es apto para ejecución en CPU.
- GPU recomendadas: no disponibles; al ser un modelo ONNX ligero, no requiere GPU dedicada y puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, aunque no se especifican modelos concretos.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS) y `phoonnx.js` (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-it_it-ugo-espeak (este modelo) | VITS | italiano | CC-BY-4.0 | ONNX | Hugging Face, phoonnx, OVOS |
| Einrich99/PiperTTS-UGO-Italian | VITS | italiano | CC-BY-4.0 | no disponible | Hugging Face (upstream) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | según modelo | ONNX | Hugging Face, phoonnx |

No se dispone de datos de rendimiento comparativo (parámetros, contexto, benchmarks) para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia de espeak-ng: sin el binario instalado, la calidad de la fonemización puede degradarse; con el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Cobertura limitada a italiano (`it-IT`); no soporta otros idiomas.
- Riesgo de pronunciación incorrecta en palabras extranjeras, siglas o nombres propios no cubiertos por el fonemizador.
- No es un modelo de lenguaje: no razona, no sigue instrucciones ni genera texto; solo sintetiza voz.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoría (Einrich99 y Phoonnx), pero conviene revisar los términos exactos de la licencia upstream.
- No se dispone de información sobre sesgos vocales (género, acento, edad) ni sobre la composición del dataset de entrenamiento, lo que limita la evaluación de equidad.
- El modelo está empaquetado para phoonnx; su uso fuera de ese ecosistema requeriría adaptar el grafo ONNX y el front-end de fonemas.
- No se han publicado métricas objetivas (MOS, WER de fonemas) en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-ugo-espeak
- Modelo upstream: https://huggingface.co/Einrich99/PiperTTS-UGO-Italian/tree/main/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
