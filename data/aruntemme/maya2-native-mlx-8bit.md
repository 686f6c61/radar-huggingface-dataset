# aruntemme/maya2-native-mlx-8bit

## Resumen

maya2-native-mlx-8bit es una conversión del modelo de síntesis de voz maya2-native de Maya Research al formato de mlx-audio, pensada para ejecutarse en Macs con Apple Silicon. Se trata de un sistema de text-to-speech (TTS) con arquitectura de backbone basada en Qwen3-1.7B-Base, cuantizado a 8 bits en sus pesos del modelo de lenguaje principal, mientras que el decodificador de profundidad y las rutas del altavoz se mantienen sin cuantizar. El resultado ocupa unos 3,1 GB en disco y 2.502.398.656 parámetros totales según los safetensors del repositorio.

El modelo resuelve la generación de voz sintética en streaming para 11 lenguas indias (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil y telugu) y el inglés, con 20 voces integradas y capacidad de clonación de voz entre lenguas. Su relevancia actual radica en que cubre un hueco poco atendido: TTS de calidad para lenguas del subcontinente indio con licencia Apache-2.0 y ejecución local en hardware de consumo Apple.

La conversión no está afiliada ni respaldada por Maya Research; los pesos originales son suyos y se distribuyen bajo Apache-2.0. La versión aquí descrita es una adaptación de formato y cuantización, no un reentrenamiento, por lo que las capacidades del modelo subyacente se conservan íntegras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal con backbone de lenguaje Qwen3-1.7B-Base, decodificador de profundidad y códec Mimi (Kyutai) más codificador de altavoz ECAPA-TDNN (SpeechBrain) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (affine) con group size 64 en el backbone; decodificador de profundidad y rutas de altavoz sin cuantizar |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (11 lenguas indias más inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout de mlx-audio) |
| Tamano del repo | 7,0 GB (pesos cuantizados ~3,1 GB; el resto incluye componentes auxiliares) |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Voces integradas | 20 (por defecto Ahana) |
| Libreria | mlx-audio |

## Arquitectura y entrenamiento

El modelo es un sistema TTS que combina un backbone de modelo de lenguaje Qwen3-1.7B-Base con un decodificador de profundidad para la generación de tokens de audio y un códec neuronal Mimi de Kyutai para convertir esos tokens en waveform a 24 kHz. La representación del hablante se obtiene mediante un codificador ECAPA-TDNN de SpeechBrain, lo que habilita la clonación de voz a partir de una referencia de audio. Los pesos de Mimi y ECAPA se descargan por separado en el primer uso y no se redistribuyen en este repositorio.

En esta conversión concreta, solo los pesos del backbone de lenguaje se han cuantizado a 8 bits con cuantización afín y group size 64; el decodificador de profundidad y las rutas del altavoz permanecen en precisión original para preservar la calidad de la voz. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión se realizó con el conversor estándar de mlx-audio (`python -m mlx_audio.convert`) y no implica ningún reentrenamiento ni ajuste fino.

## Capacidades

- Síntesis de voz en streaming para 11 lenguas indias y inglés, con salida a 24 kHz mono.
- 20 voces integradas (personas sintéticas, no personas reales) seleccionables por nombre; la voz por defecto es Ahana.
- Clonación de voz cross-lingüe: se pasa un clip de referencia de 3 a 10 segundos (`ref_audio`, `ref_text`, `ref_lang`) y el idioma de salida puede diferir del de la referencia.
- Normalización de texto activada por defecto para números, moneda, fechas, teléfonos y URLs; se puede desactivar con `normalize=False`.
- Generación en streaming mediante `stream=True`, adecuada para aplicaciones de baja latencia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- **Atención al cliente automatizada en lenguas indias**: el modelo puede generar respuestas habladas en hindi, tamil, telugu, bengalí y otras lenguas del catálogo, lo que permite desplegar un agente de voz que atienda a usuarios en su idioma nativo sin depender de servicios en la nube.
- **Locución de contenidos educativos**: generación de narraciones en streaming para cursos, audiolibros o material didáctico en 11 lenguas indias, con la posibilidad de elegir entre 20 voces y ajustar el registro según el público.
- **Sistemas de anuncios y avisos públicos**: síntesis de mensajes con normalización automática de fechas, importes y números de teléfono, adecuada para aeropuertos, transporte público o servicios de emergencia que necesiten emitir avisos en varias lenguas.
- **Clonación de voz para accesibilidad**: creación de una voz personalizada a partir de un clip corto del propio usuario, útil para personas con dificultades del habla que quieran conservar su timbre en comunicaciones asistidas, siempre con consentimiento explícito.
- **Doblaje y localización de vídeo**: generación de pistas de voz en distintas lenguas indias a partir de un guion, con la opción de mantener el timbre del hablante original mediante clonación cross-lingüe y revisión humana posterior.
- **Prototipado de asistentes de voz en local**: ejecución en Macs con Apple Silicon mediante mlx-audio, lo que permite iterar sobre experiencias conversacionales sin costes de API ni envío de datos a terceros, útil en fases de diseño y pruebas de concepto.
- **Generación de audiodescripciones y podcasts**: producción de contenido hablado multilingüe con 20 voces sintéticas y control de normalización de texto para guiones con cifras y referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/espacio**: los pesos cuantizados ocupan aproximadamente 3,1 GB; el repositorio completo son 7,0 GB, que incluyen componentes auxiliares. En Apple Silicon la memoria unificada se comparte entre CPU y GPU, por lo que se recomienda al menos 8 GB de RAM unificada para cargar el modelo con margen.
- **GPU recomendadas**: el modelo está diseñado específicamente para Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra) mediante el framework MLX. No se documenta soporte para GPU NVIDIA, AMD ni ROCm en esta conversión.
- **Consumer GPU**: sí cabe en equipos de consumo con Apple Silicon; no aplica a GPUs discretas convencionales por la dependencia de MLX.
- **Opciones de despliegue**: mlx-audio (rama `main` o versión posterior a 0.6.2), con CLI `mlx_audio.tts.generate` y API Python `mlx_audio.tts.utils.load`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- **Latencia y throughput**: no disponible. El modo streaming (`stream=True`) está soportado y orientado a reducir la latencia percibida, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maya2-native-mlx-8bit | 2.502.398.656 | no disponible | 11 indias + inglés | Apache-2.0 | Hugging Face, mlx-audio |
| maya-research/maya2-native (original) | no disponible en la informacion | no disponible | 11 indias + inglés | Apache-2.0 | Hugging Face |
| Kyutai Mimi (códec usado por el modelo) | no disponible | no disponible | no disponible | CC-BY-4.0 | Hugging Face, runtime |
| SpeechBrain ECAPA-TDNN (encoder usado) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face, runtime |

No se dispone de datos de benchmarks ni de modelos TTS directamente comparables en la información proporcionada; la comparativa se limita a los componentes que integra el sistema y a su modelo base.

## Limitaciones y advertencias

- **Riesgo de uso indebido de la clonación**: la clonación de voz solo debe hacerse con permiso explícito del hablante. El modelo no incorpora marca de agua de audio, por lo que las aplicaciones deben añadir sus propias salvaguardas.
- **Divulgación obligatoria**: el habla sintética debe comunicarse como tal a los oyentes, especialmente en llamadas y medios de comunicación.
- **Usos prohibidos**: nunca debe emplearse para suplantación engañosa, fraude, acoso, contenido no consentido, desinformación o para burlar sistemas de autenticación por voz.
- **Voces integradas sintéticas**: las 20 voces incluidas son personas sintéticas, no personas reales; no deben presentarse como identidades reales.
- **Alucinación y errores de pronunciación**: no se documentan métricas de fidelidad; como todo sistema TTS, puede producir pronunciaciones incorrectas en palabras poco frecuentes, siglas o nombres propios, especialmente en lenguas con menor representación.
- **Limitaciones de plataforma**: la conversión depende de MLX y Apple Silicon; no está pensada para GPU NVIDIA ni para servidores x86 convencionales.
- **Dependencia de componentes externos**: Mimi (CC-BY-4.0) y ECAPA-TDNN (Apache-2.0) se descargan en tiempo de ejecución y mantienen sus propias licencias, que deben respetarse en producción.
- **Versión de la librería**: el soporte de Maya-2 en mlx-audio está en la rama `main` y llegará en la versión posterior a 0.6.2; hasta entonces es necesario instalar desde Git, lo que introduce riesgo de cambios incompatibles.
- **Licencia**: los pesos son Apache-2.0, lo que permite uso comercial, pero la conversión no está afiliada ni respaldada por Maya Research; conviene revisar también las condiciones de los componentes auxiliares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aruntemme/maya2-native-mlx-8bit
- Modelo base original: https://huggingface.co/maya-research/maya2-native
- Maya Research: https://mayaresearch.ai
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- Documentación de Maya-2 en mlx-audio: https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/tts/models/maya2/README.md
- Qwen3-1.7B-Base (componente del backbone): https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Kyutai Mimi (códec): https://huggingface.co/kyutai/mimi
- SpeechBrain ECAPA-TDNN (encoder de altavoz): https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
