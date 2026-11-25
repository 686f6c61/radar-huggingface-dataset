# cuongyd196/VieNeu-TTS-v3-Turbo-d3

## Resumen

VieNeu-TTS v3 Turbo "d3" es un espejo (mirror) de los pesos del ajuste fino "d3" del modelo de síntesis de voz VieNeu-TTS v3 Turbo, desarrollado originalmente por Phạm Nguyễn Ngọc Bảo (@pnnbao97) y afinado por Blaze AI. Este repositorio, publicado por el usuario cuongyd196, redistribuye con permiso de Blaze AI un subconjunto de los ficheros necesarios para que la aplicación CIT Voice Studio pueda descargar el modelo sin requerir una cuenta de Hugging Face. No introduce ninguna modificación propia: los ficheros son copias sin cambios del lanzamiento original.

El modelo resuelve la síntesis de voz en vietnamita con clonación de voz instantánea, a una frecuencia de muestreo de 48 kHz segun el titulo del trabajo original. Se distribuye en dos formatos: grafos ONNX para CPU (ONNX Runtime, fp32) y pesos PyTorch para GPU (fp32), manteniendo la misma arquitectura y estructura de carpetas que el modelo base, por lo que actúa como reemplazo directo (drop-in replacement). El codec de audio empleado es MOSS-Audio-Tokenizer-Nano de OpenMOSS-Team, que no se incluye en este repositorio.

La relevancia de este espejo es práctica: facilita el despliegue del ajuste fino d3 en herramientas de terceros y garantiza la verificabilidad de las descargas mediante sumas SHA256. El repositorio ocupa 1,0 GB y se publicó el 25 de noviembre de 2026 bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS propietario de VieNeu-TTS v3 Turbo; pesos en ONNX y PyTorch) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32 (ONNX Runtime en CPU y PyTorch en GPU); el autor desaconseja bf16 porque redondea gran parte del ajuste fino |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (grafos `onnx_update/`), PyTorch (`update/`), `speaker_encoder.onnx`, `denoiser.onnx`, `config.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base VieNeu-TTS v3 Turbo más allá de que se trata de un sistema de síntesis de voz entrenado desde cero por Phạm Nguyễn Ngọc Bảo, con decodificación a 48 kHz y control de emoción según el título del trabajo original. El ajuste fino "d3" fue realizado por Blaze AI sobre esos pesos base; este repositorio solo redistribuye el resultado, sin aportar información sobre el dataset, el número de tokens de entrenamiento ni las técnicas de alineación (RLHF/DPO) empleadas.

El pipeline incluye componentes auxiliares para la clonación de voz: un codificador de hablante (`speaker_encoder.onnx`) y un denoiser (`denoiser.onnx`), idénticos a los del modelo base. El SDK utiliza el fonemizador sea-g2p, del mismo autor que el proyecto original, y el codec de audio MOSS-Audio-Tokenizer-Nano (Apache-2.0) de OpenMOSS-Team, que debe obtenerse por separado. No se dispone de más detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita a 48 kHz.
- Clonación de voz instantánea mediante codificador de hablante y denoiser incluidos.
- Control de emoción (según el título del trabajo original de VieNeu-TTS v3 Turbo).
- Inferencia en CPU mediante ONNX Runtime en fp32.
- Inferencia en GPU mediante PyTorch en fp32.
- Integración con el SDK `vieneu` (clase `Vieneu`, modo `v3turbo`).
- Verificación de integridad de descargas con `sha256sum -c SHA256SUMS`.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Doblaje y localización de contenido al vietnamita: el modelo genera voz sintética a 48 kHz adecuada para vídeo y pódcast, con control de emoción para ajustar el tono del doblaje.
- Audiolibros y lectura asistida: la síntesis de texto a voz en vietnamita permite convertir documentos largos en audio, usando las voces predefinidas del paquete o una voz clonada autorizada.
- Asistentes de voz para aplicaciones vietnamitas: integración mediante el SDK `vieneu` en modo `v3turbo` con backend ONNX para despliegues sin GPU.
- Prototipado de interfaces de voz en CPU: los grafos ONNX en fp32 permiten ejecutar el modelo en portátiles y servidores sin acelerador, útil para pruebas y demos.
- Producción de contenido con identidad de voz propia: la clonación de voz permite mantener una voz consistente en varios episodios, siempre que se tenga derecho sobre ella.
- Integración en CIT Voice Studio: este espejo existe precisamente para que la aplicación pueda descargar los pesos sin cuenta de Hugging Face, lo que simplifica la distribución a usuarios finales.
- Evaluación comparativa de ajustes finos: al ser un reemplazo directo del modelo base (misma arquitectura y estructura de carpetas), permite comparar el timbre d3 frente al original en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 1,0 GB, pero no se especifica el consumo en memoria de los grafos ni de los pesos).
- GPU recomendadas: no disponible; el autor solo indica que la ruta PyTorch (`backend="pytorch"`, `dtype="float32"`) está pensada para GPU.
- CPU: soportada mediante ONNX Runtime en fp32 (`backend="onnx"`, `precision="fp32"`).
- ¿Cabe en GPU de consumo? No disponible; no se publican requisitos de VRAM.
- Opciones de despliegue: SDK `vieneu` (modos `onnx` y `pytorch`), ONNX Runtime y PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Nota del autor: mantener fp32 en GPU; bf16 redondea gran parte del ajuste fino.

## Comparativa con modelos similares

| Modelo | Idioma | Formatos | Licencia | Clonación de voz | Disponibilidad |
|---|---|---|---|---|---|
| VieNeu-TTS v3 Turbo "d3" (este espejo) | vietnamita | ONNX, PyTorch, safetensors | Apache-2.0 | Sí | Hugging Face (cuongyd196) |
| VieNeu-TTS v3 Turbo (base) | vietnamita | ONNX, PyTorch, safetensors | Apache-2.0 | Sí | Hugging Face (pnnbao-ump) |
| VieNeu-TTS v3 Turbo Enhanced (original d3) | vietnamita | no disponible | Apache-2.0 | Sí | Hugging Face (blaze-voice-ai) |

No se dispone de datos de rendimiento ni de parámetros para comparar con otras familias de TTS; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- El modelo solo soporta vietnamita; no se documentan otros idiomas.
- El timbre de la voz d3 es algo más oscuro (menos energía por encima de 8 kHz) que el del modelo base, según señalan los autores originales.
- La clonación de voz es responsabilidad del usuario: solo debe clonarse una voz sobre la que se tenga derecho, y no debe usarse para suplantación, fraude o contenido engañoso.
- El codec de audio MOSS-Audio-Tokenizer-Nano no está incluido y debe descargarse por separado.
- No se recomienda bf16 en GPU: el redondeo elimina gran parte del ajuste fino.
- No se publican datos sobre sesgos, tasa de alucinación ni comportamiento en contextos largos.
- Al redistribuir o convertir los ficheros debe mantenerse el aviso de licencia y la atribución al proyecto original, al paquete base y al ajuste fino d3.
- El repositorio es un espejo de terceros; para la documentación completa y la evaluación de los autores debe consultarse el repositorio original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cuongyd196/VieNeu-TTS-v3-Turbo-d3
- Modelo base: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Ajuste fino original d3 (Blaze AI): https://huggingface.co/blaze-voice-ai/vienue-v3-turbo-enhanced
- Proyecto original en GitHub: https://github.com/pnnbao97/VieNeu-TTS
- Fonemizador sea-g2p: https://github.com/pnnbao97/sea-g2p
- Codec de audio MOSS-Audio-Tokenizer-Nano: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano
- Aplicación CIT Voice Studio: https://github.com/Cuongyd196/cit-voice-studio
