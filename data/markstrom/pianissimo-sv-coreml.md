# markstrom/pianissimo-sv-coreml

## Resumen

Pianissimo-sv-coreml es una conversión al formato CoreML del modelo de reconocimiento automático del habla Klang Pianissimo, desarrollado originalmente por Klang AI AB para sueco. El modelo original parte de NVIDIA Parakeet TDT 0.6B v3 y lo afina para sueco, empleando una arquitectura FastConformer como codificador y un decodificador TDT (Token-and-Duration Transducer). Esta versión, publicada por el usuario markstrom, no reentrena los pesos: solo cambia el formato para permitir la inferencia en dispositivos Apple Silicon mediante la Neural Engine.

La relevancia de esta conversión radica en que habilita el reconocimiento de voz en sueco completamente en el dispositivo, sin depender de servicios en la nube, lo que resulta útil para aplicaciones de privacidad sensible, transcripción offline y entornos con conectividad limitada. El repositorio ocupa 0,7 GB e incluye los paquetes CoreML necesarios (preprocesador, codificador, decodificador y red conjunta), así como el vocabulario y un manifiesto con versiones y sumas de verificación.

Al tratarse de una conversión de formato, las capacidades, limitaciones y sesgos del modelo subyacente se heredan directamente del modelo original KlangAI/pianissimo-sv. La licencia es CC BY 4.0, la misma que la del modelo base, y el único idioma soportado es el sueco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + TDT (decodificador Token-and-Duration Transducer) |
| Parametros totales | 0,6 B (heredados del modelo base Parakeet TDT 0.6B v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos int8 en el codificador (según model card); no se detallan otras cuantizaciones |
| Idiomas soportados | Sueco (sv) |
| Licencia | CC BY 4.0 |
| Formato de pesos | CoreML (.mlpackage), vocabulario JSON y manifiesto JSON |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer para el codificador, una variante eficiente del Conformer que reduce el coste computacional mediante submuestreo de la secuencia de entrada, combinada con un decodificador TDT. El decodificador TDT predice conjuntamente tokens y duraciones, lo que permite un alineamiento más eficiente que los transductores tradicionales. El modelo original fue afinado a partir de NVIDIA Parakeet TDT 0.6B v3 para el idioma sueco.

Esta versión CoreML no introduce cambios en los pesos ni en el entrenamiento: se limita a convertir los módulos a formato CoreML. El codificador se exporta con pesos int8, mientras que el preprocesador transforma audio mono a 16 kHz en características log-mel de 128 bandas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automático del habla (ASR) en sueco, con transcripción de audio mono a 16 kHz.
- Ejecución en dispositivo mediante CoreML y la Neural Engine de Apple Silicon.
- Preprocesamiento integrado: conversión de audio a características log-mel de 128 bandas.
- Decodificación TDT con predicción conjunta de tokens y duraciones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio más allá del ASR ni modo thinking.
- Capacidad multilingüe limitada al sueco.

## Casos de uso

- Transcripción offline en aplicaciones macOS e iOS: el modelo se ejecuta localmente mediante CoreML, lo que permite transcribir reuniones o notas de voz sin enviar audio a servidores externos y preservar la privacidad.
- Subtitulado en tiempo real de contenido en sueco: al integrarse con FluidAudio y ejecutarse en la Neural Engine, puede alimentar pipelines de subtitulado con baja latencia en dispositivos Apple.
- Asistentes de voz para entornos con conectividad limitada: al no requerir red, es adecuado para aplicaciones de campo, vehículos o dispositivos sin acceso estable a Internet.
- indexación y búsqueda de archivos de audio: la transcripción local permite generar índices de texto searchable sobre grabaciones archivadas en sueco.
- Accesibilidad: conversión de voz a texto para personas con dificultades auditivas en aplicaciones nativas de Apple, con procesamiento en el dispositivo.
- Prototipado rápido en investigación: investigadores que necesiten un ASR sueco ligero pueden cargar los paquetes CoreML y evaluar el modelo sin depender de infraestructura GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo se ejecuta en Apple Silicon mediante CoreML y la Neural Engine, no en GPU NVIDIA.
- GPU recomendadas: no disponible; el destino es Apple Silicon (Neural Engine).
- Cabe en consumer GPU: no aplica; está diseñado para dispositivos Apple, no para GPU de consumo NVIDIA.
- Opciones de despliegue: CoreML en macOS/iOS, con compilación en el dispositivo mediante `MLModel.compileModel(at:)` y carga con FluidAudio `AsrModels.loadLocal(from:version: .v3)`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| markstrom/pianissimo-sv-coreml | 0,6 B | no disponible | Sueco | CC BY 4.0 | CoreML |
| KlangAI/pianissimo-sv (modelo base) | 0,6 B | no disponible | Sueco | CC BY 4.0 | no disponible (formato original) |
| NVIDIA Parakeet TDT 0.6B v3 | 0,6 B | no disponible | Inglés (principal) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta sueco; no es adecuado para otros idiomas.
- Al ser una conversión de formato, hereda los sesgos y limitaciones del modelo base KlangAI/pianissimo-sv, que no se detallan en la información disponible.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- La licencia CC BY 4.0 permite uso comercial siempre que se atribuya adecuadamente a Klang AI AB y se indique si se han realizado cambios.
- Requiere compilar los paquetes CoreML en el dispositivo de destino, lo que añade un paso de preparación.
- No se documentan requisitos mínimos de versión de macOS/iOS ni de hardware Apple Silicon específico.
- El repositorio tiene pocas descargas y likes, por lo que la validación comunitaria es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/markstrom/pianissimo-sv-coreml
- Modelo base: https://huggingface.co/KlangAI/pianissimo-sv
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- FluidAudio (referenciado en la model card): no disponible
