# danbev/whisper-ane

## Resumen

El repositorio `danbev/whisper-ane` contiene encoders de audio del modelo Whisper (variante `small`) compilados para el Apple Neural Engine (ANE) mediante la herramienta ANEForge. El autor, Daniel Bevenius (danbev), es un desarrollador activo en los ecosistemas de `whisper.cpp` y `llama.cpp`, y este paquete está pensado para usarse con el backend `whisper-aneforge` de `whisper.cpp`. El objetivo es acelerar la etapa de codificación de audio en dispositivos Apple (Mac, iPhone, iPad) descargando el trabajo del encoder al ANE, en lugar de ejecutarlo en CPU o GPU.

El bundle incluido (`whisper-small-ane/`) es autocontenido: contiene un programa ANE (`model.mil`) y sus pesos (`weights.bin`), que se compilan en el dispositivo al cargarse (aproximadamente 0,6 segundos). No se distribuyen binarios precompilados, lo que garantiza compatibilidad con el hardware ANE del dispositivo de destino. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

Este proyecto es relevante porque aborda un problema práctico de despliegue de modelos de reconocimiento de voz en hardware de Apple, un área donde la optimización específica de hardware puede reducir significativamente la latencia y el consumo energético en aplicaciones locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper (transformer) compilado para Apple Neural Engine |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (compilación on-device desde `model.mil` + `weights.bin`) |
| Idiomas soportados | no disponible (heredados de Whisper, pero no especificados en el bundle) |
| Licencia | MIT |
| Formato de pesos | `model.mil` + `weights.bin` (formato ANEForge) |

## Arquitectura y entrenamiento

El modelo subyacente es el encoder de Whisper `small`, un transformer encoder-decoder desarrollado por OpenAI. Este repositorio no contiene el modelo completo, sino únicamente el encoder, compilado para ejecutarse en el ANE de Apple. El proceso de compilación se realiza mediante ANEForge, que traduce el grafo del encoder a un programa ANE optimizado. No se incluye información sobre el entrenamiento original (datos, número de tokens, técnicas de alineación), ya que el modelo base es el Whisper publicado por OpenAI y este paquete solo aporta la conversión a un formato específico de hardware.

La innovación técnica principal es la compilación on-device: el programa ANE se genera en el momento de la carga (0,6 s), lo que evita la distribución de binarios específicos de cada generación de chip y permite adaptarse al ANE presente en el dispositivo. El backend `whisper-aneforge` se encarga de la integración con `whisper.cpp`, gestionando la carga del bundle y la comunicación con el ANE.

## Capacidades

- Reconocimiento de voz (ASR) mediante el encoder de Whisper, con la salida del encoder procesada posteriormente por el decoder de Whisper (que se ejecuta en CPU/GPU).
- Integración con `whisper.cpp` para inferencia local en dispositivos Apple.
- Compilación on-device del programa ANE en aproximadamente 0,6 segundos.
- Soporte para el bundle `whisper-small-ane` (variante `small` del encoder).
- No se documentan capacidades adicionales como tool calling, agentes o procesamiento multimodal.

## Casos de uso

- Transcripción de audio en tiempo real en macOS: al integrar el bundle con `whisper.cpp`, una aplicación de dictado puede transcribir voz con baja latencia, aprovechando el ANE para el encoder y liberando la CPU para otras tareas.
- Asistentes de voz locales en iOS: aplicaciones de asistente personal que procesan comandos de voz sin conexión, usando el encoder acelerado por ANE para reducir el consumo de batería.
- Subtitulación automática de vídeos en Mac: herramientas de edición de vídeo pueden generar subtítulos de forma local, con el encoder en ANE y el decoder en CPU, manteniendo la fluidez de la interfaz.
- Procesamiento de audio en aplicaciones de productividad: grabadoras de notas, transcriptores de reuniones o aplicaciones de accesibilidad que necesitan convertir voz a texto de forma eficiente en hardware Apple.
- Investigación en optimización de modelos para hardware específico: este repositorio sirve como ejemplo de cómo compilar un modelo transformer para el ANE, útil para desarrolladores que quieran aplicar técnicas similares a otros modelos.
- Despliegue en entornos de borde con restricciones de energía: dispositivos Apple con ANE pueden ejecutar ASR de forma más eficiente que en CPU, lo que es relevante para aplicaciones embebidas o de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER, latencia o throughput para este bundle específico. Se recomienda consultar el repositorio de `whisper-aneforge` o el perfil del autor para posibles actualizaciones.

## Requisitos de hardware

- Dispositivos Apple con Neural Engine (ANE): chips de la serie A (A11 o posterior) o serie M (M1 o posterior).
- No se especifica VRAM, ya que el ANE utiliza memoria unificada del sistema.
- Se requiere macOS o iOS con soporte para ANE y las herramientas de desarrollo necesarias para compilar `whisper.cpp` con el backend ANEForge.
- El bundle se compila on-device, por lo que no se necesitan binarios precompilados.
- Opciones de despliegue: `whisper.cpp` con el backend `whisper-aneforge`, usando la variable de entorno `ANEFORGE_ENCODER` para apuntar al bundle.
- No se proporcionan datos de latencia o throughput; la compilación inicial tarda unos 0,6 segundos, pero la inferencia posterior depende del hardware ANE específico.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo formato (encoders de Whisper compilados para ANE). Como referencia, el modelo base Whisper `small` de OpenAI se puede ejecutar en CPU/GPU, pero no hay datos de rendimiento comparativo en este repositorio. Se puede considerar que este bundle es una optimización específica para hardware Apple, sin equivalente directo en otros ecosistemas.

## Limitaciones y advertencias

- Solo funciona en dispositivos Apple con ANE; en otros hardware no es utilizable.
- El bundle incluye únicamente el encoder; el decoder de Whisper debe ejecutarse por separado (en CPU/GPU), lo que puede limitar la ganancia global de rendimiento.
- La compilación on-device requiere unos 0,6 segundos en cada carga, lo que puede ser relevante en aplicaciones que cargan y descargan el modelo con frecuencia.
- No se documentan sesgos específicos, pero al derivar de Whisper, puede heredar los sesgos conocidos del modelo original (por ejemplo, en acentos o idiomas poco representados).
- No hay información sobre riesgos de alucinación en la transcripción; se recomienda validar la salida en aplicaciones críticas.
- La licencia MIT permite uso comercial, pero se debe verificar la compatibilidad con las licencias de los componentes dependientes (ANEForge, whisper.cpp, etc.).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danbev/whisper-ane
- ANEForge: https://github.com/sbryngelson/ANEForge
- Backend whisper-aneforge: https://github.com/sbryngelson/whisper-aneforge
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- OpenAI Whisper (modelo original): https://github.com/openai/whisper
- Blog de OpenAI sobre Whisper: https://openai.com/index/whisper/
- Perfil de GitHub del autor: https://github.com/danbev
