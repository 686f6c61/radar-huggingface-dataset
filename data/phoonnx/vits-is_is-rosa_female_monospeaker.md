# Phoonnx/vits-is_is-rosa_female_monospeaker

## Resumen

`vits-is_is-rosa_female_monospeaker` es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, entrenado para el islandes (`is-IS`) con una voz femenina identificada como "Rosa". El modelo original fue desarrollado por el autor Sigurdur y posteriormente empaquetado por Phoonnx en formato ONNX para su uso con la libreria de TTS `phoonnx`, orientada a entornos Python y al asistente de voz OVOS.

VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech) es una arquitectura end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder generativo y un discriminador adversarial, lo que permite generar audio de forma mas natural que los pipelines concatenativos clasicos, con una sola pasada. Este empaquetado concreto prioriza la portabilidad: se distribuye como ONNX, con un peso de repositorio de 0,1 GB, lo que lo hace ligero y desplegable en CPU.

El modelo es relevante por su nicho: el islandes es un idioma de bajos recursos con pocos modelos TTS publicos, y esta variante ofrece una voz femenina monohablante con licencia MIT, lo que facilita su integracion en productos comerciales y en asistentes de codigo abierto como OVOS. Su alcance es limitado: una sola voz, un solo idioma y sin capacidades multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada por caracteres, no por tokens de contexto) |
| Tipos de cuantizacion | no disponible (distribucion ONNX) |
| Idiomas soportados | islandes (`is-IS`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la libreria `phoonnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que integra en un unico modelo el front-end de texto, la prediccion de duraciones y la generacion de forma de onda. VITS usa un encoder de texto condicionado por un prior normalizing flow, un decoder autoregresivo basado en HiFi-GAN y un entrenamiento adversarial con discriminadores multiperiodo, lo que permite sintesis de alta calidad sin necesidad de un vocoder externo. El modelo es monohablante y esta especializado en una unica voz femenina.

No se dispone de informacion sobre el numero de horas de audio de entrenamiento, la composicion del dataset, el numero de parametros ni si se aplicaron tecnicas de fine-tuning o adaptacion. El front-end de texto de `phoonnx` utiliza `GraphemePhonemizer` de la libreria `scriptconv`, que normaliza el texto y lo convierte en la entrada del modelo basandose en grafemas (caracteres), no en fonemas explicitos. El modelo original procede de `Sigurdur/vits_icelandic_rosa_female_monospeaker`; el empaquetado de Phoonnx anade la conversion a ONNX y la integracion con su gestor de modelos.

## Capacidades

- Sintesis de voz (text-to-speech) en islandes a partir de texto escrito en caracteres.
- Voz femenina monohablante ("Rosa"), sin variantes de hablante adicionales.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de `phoonnx`.
- Integracion con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Normalizacion y conversion de texto mediante `scriptconv` (front-end de grafemas).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision ni audio de entrada.
- Sin capacidades multilingues: unicamente islandes.

## Casos de uso

- **Asistentes de voz en islandes para OVOS**: el modelo se integra directamente como modulo TTS en `mycroft.conf` mediante `ovos-tts-plugin-phoonnx`, permitiendo dotar de voz a un asistente domestico de codigo abierto en islandes sin depender de servicios en la nube.
- **Lectura de contenido en islandes (screen readers y accesibilidad)**: sintesis de articulos, notificaciones o interfaces de usuario para personas con discapacidad visual, aprovechando que el modelo es ligero (0,1 GB) y puede ejecutarse en CPU.
- **Locuciones para audiolibros y podcast de nicho**: generacion de narraciones en islandes con una voz femenina consistente, adecuada para contenido editorial de bajo presupuesto donde no se justifica contratar una locutora.
- **Prototipado de productos de voz para el mercado islandes**: al tener licencia MIT y formato ONNX, permite integrar TTS en demos y MVPs comerciales sin coste de licencia ni ataduras a un proveedor cloud.
- **Sistemas de anuncios y megafonia automatizada**: generacion de avisos pregrabados o dinamicos en islandes para transporte publico, aeropuertos o comercios, donde la latencia y el coste por caracter son criticos.
- **Investigacion en TTS de bajos recursos**: sirve como linea base reproducible para experimentos de sintesis en islandes, al ser un modelo publico, ligero y con pesos ONNX inspeccionables.
- **Integracion en aplicaciones edge/IoT**: su tamano reducido y su ejecucion sobre ONNX Runtime permiten desplegarlo en dispositivos con recursos limitados sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precision; al tratarse de un modelo ONNX de 0,1 GB de repositorio, la huella de memoria es muy reducida y probablemente inferior a 1 GB en inferencia.
- **GPU recomendadas**: no se especifican; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime. Cualquier GPU moderna (RTX 3060 o superior) podria acelerar la inferencia, pero no hay datos publicados.
- **Consumer GPU**: si, cabe holgadamente en cualquier GPU de consumo e incluso en CPU y dispositivos embebidos, dado el tamano del artefacto.
- **Opciones de despliegue**: `phoonnx` (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y ONNX Runtime de forma directa. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Voces | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-is_is-rosa_female_monospeaker` | VITS | Islandes | 1 (femenina) | MIT | ONNX | Hugging Face |
| `Sigurdur/vits_icelandic_rosa_female_monospeaker` | VITS | Islandes | 1 (femenina) | no disponible en la informacion | pesos originales (no ONNX) | Hugging Face |
| Otros modelos VITS empaquetados por Phoonnx | VITS | varios | variable | variable (segun upstream) | ONNX | Coleccion VITS de Phoonnx |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- **Monohablante y monoidioma**: solo genera una voz femenina en islandes; no admite cambio de hablante ni otros idiomas.
- **Entrada por grafemas**: el front-end usa `GraphemePhonemizer`, lo que puede producir pronunciaciones incorrectas en palabras extranas, siglas o numeros no normalizados correctamente.
- **Riesgo de alucinacion acustica**: como todo modelo generativo de audio, puede producir artefactos, ruidos o pronunciaciones erroneas en entradas largas o atipicas; conviene validar la salida en produccion.
- **Sesgos**: al estar entrenado con una unica voz, puede no representar la diversidad de acentos o registros del islandes; no hay informacion sobre la composicion del dataset de entrenamiento.
- **Licencia**: MIT, lo que permite uso comercial y modificacion, pero se recomienda verificar los terminos del modelo upstream (`Sigurdur/...`) por si impusieran condiciones adicionales.
- **Dependencia de ecosistema**: el uso documentado esta ligado a `phoonnx` y `scriptconv`; fuera de ese ecosistema habria que gestionar manualmente el grafo ONNX y el preprocesado de texto.
- **Sin garantias de calidad**: no hay benchmarks publicados de naturalidad (MOS) ni de inteligibilidad, por lo que la calidad debe evaluarse empiricamente antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-is_is-rosa_female_monospeaker
- Modelo upstream (Sigurdur): https://huggingface.co/Sigurdur/vits_icelandic_rosa_female_monospeaker
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
