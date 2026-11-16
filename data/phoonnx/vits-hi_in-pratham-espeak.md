# Phoonnx/vits-hi_in-pratham-espeak

## Resumen

vits-hi_in-pratham-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de TTS. El modelo original procede de PravalX/piper-voices, en la ruta hi/hi_IN/pratham/medium, y está orientado exclusivamente al hindi de la India (hi-IN). Su función es convertir texto en audio inteligible en hindi, con una entrada fonémica basada en espeak-ng y alfabeto IPA.

El modelo se distribuye como un artefacto ONNX de aproximadamente 0,1 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU y en dispositivos con recursos limitados. No se trata de un modelo de propósito general ni de un LLM: es un sintetizador acústico VITS de extremo a extremo, pensado para integrarse en asistentes de voz, sistemas de lectura en voz alta o pipelines de accesibilidad en hindi.

Su relevancia actual radica en la integración con el ecosistema phoonnx y OVOS (Open Voice OS), que permite desplegarlo como plugin de TTS en asistentes domésticos y aplicaciones Python. La licencia declarada es "other", con referencia a la licencia "cc" del repositorio upstream, lo que exige verificar las condiciones exactas antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | hindi de la India (hi-IN) |
| Licencia | other (el upstream declara "cc") |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Autor original | PravalX |
| Empaquetado por | Phoonnx |
| Librería | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado de forma conjunta. El modelo genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder externo separado, lo que simplifica el despliegue y reduce la latencia frente a pipelines en cascada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de entrenamiento del modelo original de PravalX. La model card únicamente documenta la procedencia (PravalX/piper-voices/hi/hi_IN/pratham/medium) y el front-end de texto: la normalización y conversión se delega en la librería scriptconv, que utiliza EspeakPhonemizer de scriptconv_copyleft.phonemizers.mul para producir fonemas espeak en alfabeto IPA. El modelo se empaqueta para phoonnx como ONNX, sin que se documenten innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en hindi de la India (hi-IN) a partir de texto plano.
- Conversión de texto a fonemas espeak en alfabeto IPA mediante scriptconv.
- Generación de audio en formato WAV a través de la API `synthesize_wav` de phoonnx.
- Integración como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecución en Python (phoonnx) y en navegador (phoonnx.js) con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al hindi; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz domésticos en hindi: integrado como plugin de OVOS, el modelo permite que un asistente responda oralmente en hindi dentro de un entorno doméstico, con una huella de 0,1 GB que cabe en dispositivos de bajos recursos.
- Lectura en voz alta de contenido web o documentos: la API `synthesize_wav` permite convertir artículos, noticias o textos administrativos en hindi a audio WAV para aplicaciones de accesibilidad.
- Sistemas de anuncios y megafonía automatizada: adecuado para generar avisos pregrabados o dinámicos en hindi en entornos como transporte público o comercios, gracias a su inferencia ligera en CPU.
- Integración en aplicaciones de aprendizaje de idiomas: el modelo puede generar pronunciaciones de referencia en hindi a partir de texto, útil para herramientas de práctica auditiva.
- Interfaces de voz para kioscos o terminales de atención: al ejecutarse sobre ONNX y con un tamaño reducido, puede desplegarse en hardware embebido para guiar a usuarios en hindi.
- Preprocesado de audiolibros o pódcast: generación de borradores de narración en hindi que luego se revisan o editan, reduciendo el coste frente a grabaciones humanas.
- Pruebas de integración en pipelines de CI para TTS: al ser un artefacto ONNX pequeño, puede usarse en tests automatizados de síntesis de voz en hindi sin requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que funcione en CPU sin GPU dedicada, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño reducido sugiere que podría ejecutarse en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS VITS).
- Latencia y throughput: no disponibles.
- Dependencia externa: requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak; este último puede producir pronunciaciones incorrectas en algunos fonemas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamaño | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-hi_in-pratham-espeak (este modelo) | VITS | hi-IN | 0,1 GB | other (upstream "cc") | ONNX | Hugging Face, phoonnx, OVOS |
| PravalX/piper-voices hi_IN pratham medium | VITS (Piper) | hi-IN | no disponible | cc (según upstream) | no disponible | Hugging Face (repositorio upstream) |
| Otros modelos VITS de la colección Phoonnx | VITS | variable según voz | variable | variable | ONNX | Hugging Face (colección VITS de Phoonnx) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta hindi de la India (hi-IN); no se documentan otros idiomas.
- Dependencia de espeak-ng: sin espeak-ng instalado, la calidad de pronunciación puede degradarse; el port espyak puede diferir en algunos fonemas y producir errores de pronunciación.
- Licencia "other" con referencia a "cc" en el upstream: es imprescindible verificar las condiciones exactas de la licencia Creative Commons concreta antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar pronunciaciones incorrectas o artefactos en palabras fuera del dominio de entrenamiento, aunque no se documentan sesgos específicos.
- Sin datos de benchmarks ni métricas objetivas de calidad (MOS, WER) en la información disponible.
- No es un modelo de lenguaje: no soporta razonamiento, tool calling ni generación de texto.
- El modelo original procede de un repositorio de terceros (PravalX/piper-voices); la responsabilidad sobre la calidad y licencia del upstream recae en dicho repositorio.
- Fecha de creación y actualización del repositorio en 2026, según los metadatos; verificar la vigencia de los enlaces y del empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hi_in-pratham-espeak
- Repositorio upstream: https://huggingface.co/PravalX/piper-voices/tree/main/hi/hi_IN/pratham/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
