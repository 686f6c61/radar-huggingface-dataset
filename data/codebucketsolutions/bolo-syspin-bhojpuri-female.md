# codebucketsolutions/bolo-syspin-bhojpuri-female

## Resumen

`bolo-syspin-bhojpuri-female` es un modelo de síntesis de voz (text-to-speech) para bhojpuri, una lengua indoaria hablada principalmente en el norte de la India y Nepal. Lo publica la organización codebucketsolutions como un artefacto listo para el servidor de voz `bolo`, que funciona sobre sherpa-onnx sin dependencia de PyTorch. No se trata de un modelo entrenado desde cero: es una conversión de formato del checkpoint Coqui VITS original del proyecto SYSPIN (SPIRE Lab, Indian Institute of Science, Bengaluru), que ha sido exportado a ONNX sin reentrenamiento ni modificación de los pesos.

El modelo resuelve un problema muy concreto: permitir la síntesis de voz en bhojpuri en entornos de producción ligeros, sin GPU y sin el peso de un stack de aprendizaje profundo completo. Al estar en ONNX y empaquetarse para sherpa-onnx, se puede desplegar en CPU con una latencia baja y un consumo de recursos reducido, algo relevante para aplicaciones de accesibilidad, lectura de contenidos o asistentes de voz en lenguas de bajos recursos.

La relevancia actual del modelo es doble. Por un lado, cubre una lengua con escasa representación en el ecosistema TTS. Por otro, su licencia MIT sobre los pesos y CC-BY-4.0 sobre los datos de entrenamiento facilita su uso comercial con atribución. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | bhojpuri (código `bho`) |
| Licencia | MIT (pesos); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX (conversión desde checkpoint Coqui VITS) |

## Arquitectura y entrenamiento

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior variacional, un decodificador acústico y un discriminador adversarial en un único sistema entrenado de extremo a extremo. VITS produce audio de forma directa a partir de texto sin necesidad de un vocoder externo, lo que simplifica el despliegue. En este repositorio, el checkpoint Coqui VITS original se ha convertido a ONNX mediante la herramienta `tools/voices/export_syspin.py` del proyecto bolo, sin reentrenar ni alterar los pesos.

Los datos de entrenamiento proceden del corpus TTS SYSPIN del IISc, publicado bajo CC-BY-4.0. La model card no detalla el número de horas, la composición exacta del corpus ni si hubo etapas de ajuste fino adicionales. Tampoco se documentan innovaciones técnicas propias más allá de la conversión de formato y del empaquetado para sherpa-onnx, que es el rasgo diferencial del artefacto: elimina la dependencia de PyTorch y permite ejecución en CPU.

## Capacidades

- Síntesis de voz (text-to-speech) en bhojpuri para voz femenina.
- Generación de audio de extremo a extremo sin vocoder separado, gracias a la arquitectura VITS.
- Ejecución sobre sherpa-onnx, sin PyTorch, lo que permite despliegue en CPU.
- Integración con el servidor de voz bolo mediante el comando `bolo pull syspin-bho-female`.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente TTS.
- No dispone de modo thinking, visión ni audio de entrada; solo texto a audio.
- Cobertura monolingüe: únicamente bhojpuri.

## Casos de uso

- Lectura de contenidos en bhojpuri: el modelo puede narrar artículos, noticias o textos educativos en esta lengua, cubriendo un nicho con poca oferta TTS y facilitando el acceso a información a hablantes que prefieren el audio.
- Asistentes de voz para aplicaciones locales: integrado en bolo sobre sherpa-onnx, permite añadir respuestas habladas en bhojpuri a interfaces de voz sin necesidad de GPU ni de un stack de PyTorch.
- Accesibilidad para personas con discapacidad visual: la síntesis en lengua materna mejora la usabilidad de lectores de pantalla para usuarios bhojpuri que no dominan el hindi o el inglés.
- Digitalización de material educativo: conversión de textos escolares o cuentos a audio para su distribución en zonas con baja alfabetización o conectividad limitada.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados en bhojpuri para transporte, sanidad o administración local, con despliegue en hardware modesto.
- Prototipado de investigación en lenguas de bajos recursos: sirve como línea base TTS en bhojpuri para experimentos de evaluación, comparación o ajuste fino posterior, con licencia permisiva.
- Integración en pipelines de accesibilidad web: conversión de contenido textual a audio bajo demanda en servidores sin aceleración hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en ONNX sobre sherpa-onnx, la inferencia típica es en CPU y no requiere GPU.
- GPU recomendadas: no aplica para el flujo estándar; cualquier GPU compatible con ONNX Runtime podría usarse, pero el autor no documenta configuraciones.
- Cabe en GPU de consumo: sí, en la práctica el modelo es lo bastante pequeño (repositorio de 0,1 GB) para ejecutarse en CPU y, por tanto, también en GPUs de consumo, aunque no se especifican requisitos.
- Opciones de despliegue: sherpa-onnx a través del servidor bolo (`bolo pull syspin-bho-female`); ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/notas |
|---|---|---|---|---|---|
| bolo-syspin-bhojpuri-female | VITS (ONNX) | bhojpuri | MIT (pesos), CC-BY-4.0 (datos) | ONNX | Conversión de SYSPIN; sin PyTorch |
| SYSPIN/vits_Bhojpuri_Female | VITS (Coqui) | bhojpuri | MIT (pesos) | Checkpoint Coqui | Modelo original del que deriva esta conversión |
| Otros TTS multilingües (p. ej. MMS-TTS de Meta) | VITS | multilingüe | CC-BY-NC (según variante) | PyTorch/ONNX | Cobertura amplia, pero licencia más restrictiva en algunas variantes |

La comparación directa con alternativas comerciales o multilingües no está documentada en la información disponible. El competidor más inmediato es el propio modelo original de SYSPIN, del que este artefacto es una conversión de formato sin cambios en los pesos.

## Limitaciones y advertencias

- Es un modelo monolingüe: solo sintetiza bhojpuri; no admite otros idiomas ni cambio de voz.
- No hay datos publicados sobre sesgos, calidad perceptual (MOS) ni robustez ante texto ruidoso o dominios fuera del corpus SYSPIN.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir prosodia o pronunciaciones incorrectas en palabras poco frecuentes u OOV.
- No se documentan límites de longitud de texto de entrada ni comportamiento con números, siglas o código mezclado.
- La licencia MIT cubre los pesos, pero los datos de entrenamiento son CC-BY-4.0: el uso comercial requiere mantener la atribución al proyecto SYSPIN y al IISc.
- El repositorio no registra descargas ni validación externa; conviene evaluar la calidad de audio antes de usarlo en producción.
- No se especifican requisitos de latencia ni throughput, por lo que el rendimiento real dependerá del hardware y de la implementación de sherpa-onnx.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebucketsolutions/bolo-syspin-bhojpuri-female
- Modelo original: https://huggingface.co/SYSPIN/vits_Bhojpuri_Female
- Repositorio bolo: https://github.com/cb-Sigma/bolo
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- sherpa-onnx: no disponible en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
