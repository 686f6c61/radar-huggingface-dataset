# Phoonnx/vocoders-wavenext-22khz

## Resumen

`vocoders-wavenext-22khz` es un modelo de tipo vocoder (sintetizador de forma de onda a partir de representaciones mel) publicado por el usuario Phoonnx en Hugging Face. No se trata de un modelo de lenguaje ni de un sistema TTS completo, sino de un componente de la etapa final de un pipeline de síntesis de voz: convierte espectrogramas mel en audio PCM a 22 kHz. Se distribuye como un subconjunto extraido del repositorio agregador `Phoonnx/phoonnx-vocoders`, carpeta `wavenext-22khz`, y esta pensado para ser consumido por la libreria `phoonnx` (implementacion en Python del proyecto TigreGotico/phoonnx).

El modelo deriva de `BSC-LT/wavenext-mel`, un vocoder basado en la arquitectura WaveNeXt desarrollado en el Barcelona Supercomputing Center (BSC-LT), con licencia Apache 2.0. La model card de este repositorio no aporta detalles propios sobre arquitectura, parametros o datos de entrenamiento: se limita a indicar la procedencia y que los ficheros conservan las rutas del repositorio original. El tamano del repositorio es de aproximadamente 0,1 GB, lo que sugiere pesos en formato ONNX (por los tags `onnx` y la libreria `phoonnx`) de un vocoder de tamano contenido.

Su relevancia es practica: permite integrar sintesis de voz neuronal en aplicaciones que ya usan el ecosistema phoonnx sin depender de frameworks pesados, y sirve como pieza reutilizable para pipelines TTS propios. No obstante, la informacion publicada es muy escasa y no incluye benchmarks, idiomas ni especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WaveNeXt (vocoder neuronal; segun la referencia a `BSC-LT/wavenext-mel`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un vocoder; procesa segmentos de mel) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el vocoder es independiente del idioma; hereda los del sistema TTS que lo use) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tags `onnx`; libreria `phoonnx`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por la referencia explicita al modelo fuente `BSC-LT/wavenext-mel`, se trata de un vocoder de la familia WaveNeXt, un generador neuronal de forma de onda que toma espectrogramas mel como entrada y produce audio a 22 kHz. El repositorio incluye los pesos en formato ONNX para inferencia con la libreria `phoonnx`, que actua como runtime y orquestador del pipeline TTS.

No se dispone de informacion sobre el numero de tokens o horas de audio usadas en el entrenamiento, la composicion del dataset, ni si hubo etapas de refinamiento perceptual (por ejemplo, discriminadores multiperiodo o perdidas adversariales). Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), que en cualquier caso no aplican a un vocoder en el mismo sentido que a un LLM.

## Capacidades

- Sintesis de forma de onda a 22 kHz a partir de espectrogramas mel.
- Integracion con la libreria `phoonnx` como etapa de vocoder dentro de un pipeline TTS.
- Uso como componente reutilizable por otros repositorios de voces del ecosistema phoonnx (la model card indica que las voces de otros repositorios usan estos ficheros).
- Formato ONNX, apto para ejecucion con ONNX Runtime en CPU o GPU.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes.
- No se documentan capacidades multilingues propias; el idioma depende del modelo acustico que genere el mel.
- No se documentan modos especiales (thinking, vision, audio de entrada, etc.).

## Casos de uso

- Sintesis de voz en produccion dentro de un pipeline TTS propio: se usa como etapa final que convierte el mel generado por un modelo acustico en audio a 22 kHz, con la ventaja de que al ser ONNX se puede desplegar en servidores sin GPU dedicada.
- Prototipado rapido de asistentes de voz: al integrarse con `phoonnx`, permite montar un TTS completo en pocas lineas y sustituir el vocoder por otro del mismo repositorio agregador sin cambiar el resto del pipeline.
- Aplicaciones de lectura en voz alta (accesibilidad): idoneo para generar audio de documentos en local, ya que el modelo es pequeno (0,1 GB) y no requiere servicios en la nube.
- Generacion de audiolibros o contenido narrado por lotes: el vocoder procesa segmentos de mel de forma independiente, lo que facilita el procesamiento por trozos y el paralelismo en CPU.
- Integracion en dispositivos de borde o entornos con recursos limitados: el formato ONNX y el tamano reducido permiten ejecucion en Raspberry Pi o contenedores ligeros, siempre que el modelo acustico acompane.
- Investigacion en sintesis de voz: util como vocoder de referencia para comparar calidad perceptual frente a otros vocoders (HiFi-GAN, Parallel WaveGAN) manteniendo fijo el modelo acustico.
- Pruebas de regresion en CI/CD de pipelines TTS: al ser un artefacto ONNX versionado, se puede fijar la version del vocoder y detectar cambios de calidad en el audio generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (0,1 GB) y el formato ONNX, es previsible que quepa en menos de 1 GB de memoria, pero no se confirma en la documentacion.
- GPU recomendadas: no disponible. Al ser ONNX, puede ejecutarse en CPU y en GPU compatibles con ONNX Runtime (CUDA, DirectML, CoreML).
- Cabe en GPU de consumo: probablemente si, dado el tamano reducido, aunque no hay confirmacion oficial.
- Opciones de despliegue: ONNX Runtime a traves de la libreria `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un vocoder).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia de muestreo | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `vocoders-wavenext-22khz` (este) | Vocoder WaveNeXt | 22 kHz | Apache 2.0 | ONNX | Hugging Face |
| `BSC-LT/wavenext-mel` | Vocoder WaveNeXt (fuente) | no disponible | Apache 2.0 | no disponible | Hugging Face |
| HiFi-GAN | Vocoder GAN | 22,05 kHz (configuracion habitual) | MIT (implementacion de referencia) | PyTorch | GitHub / Hugging Face |
| Parallel WaveGAN | Vocoder GAN | 22,05 kHz (configuracion habitual) | MIT (implementacion de referencia) | PyTorch | GitHub |

La comparacion se limita a categoria y licencia: no hay datos publicados de calidad (MOS) ni de rendimiento para este modelo concreto, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta arquitectura, parametros, datos de entrenamiento ni evaluacion, lo que dificulta la validacion en produccion.
- No hay informacion sobre sesgos; al ser un vocoder, los sesgos provienen del modelo acustico y del dataset de voces que lo alimenta, no de este componente.
- Riesgo de artefactos y alucinaciones acusticas (ruidos, zumbidos, inestabilidad en fonemas) no cuantificado en la documentacion.
- Dependencia estricta de la libreria `phoonnx` y de las rutas de ficheros del repositorio original; cambios en el repositorio agregador pueden romper la integracion.
- No se especifican limitaciones de idioma porque el vocoder es agnostico, pero la calidad final dependera del modelo acustico y del idioma de entrenamiento de este.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no obstante, conviene verificar la licencia del modelo fuente `BSC-LT/wavenext-mel` y de los pesos derivados.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- No hay garantia de mantenimiento ni de soporte por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vocoders-wavenext-22khz
- Repositorio agregador de vocoders: https://huggingface.co/Phoonnx/phoonnx-vocoders
- Modelo fuente del vocoder: https://huggingface.co/BSC-LT/wavenext-mel
- Proyecto phoonnx (GitHub): https://github.com/TigreGotico/phoonnx
