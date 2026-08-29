# openEuler/fullsubnet

## Resumen

FullSubNet es un modelo de mejora de voz (speech enhancement) en tiempo real, basado en la arquitectura de fusión full-band y sub-band presentada en ICASSP 2021 por el grupo Audio-WestlakeU. Esta variante, publicada por openEuler bajo el nombre `openEuler/fullsubnet`, incorpora normalización acumulativa de Laplace y está empaquetada específicamente para el framework IB-Robot, orientado a robótica y procesamiento de audio en el borde. El modelo procesa flujos de audio de 4 canales procedentes de un array de micrófonos y produce una versión mejorada de los mismos 4 canales, con una ventana de contexto de 128 ms y un contrato de ejecución en streaming con estado.

La relevancia actual de este modelo radica en su despliegue en hardware Ascend 310P mediante artefactos OM stateful, lo que permite inferencia de baja latencia en dispositivos de borde, así como su ejecución en PyTorch CUDA y CPU como alternativa. El repositorio incluye el checkpoint oficial v0.2 de FullSubNet (218 épocas) y manifiestos que fijan la integridad y el tipo de normalización. No se trata de un modelo de lenguaje, sino de una red neuronal convolucional recurrente para audio, con un tamaño de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FullSubNet (fusión full-band y sub-band, con LSTM en sub-bandas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa tramas de audio de 128 ms, STFT 512/256, look-ahead 2) |
| Tipos de cuantizacion | no disponible (se proporcionan artefactos OM para Ascend 310P, sin especificar precisión) |
| Idiomas soportados | no disponible (modelo de audio, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint Torch (`.tar`, formato `torch.save` legacy) y artefactos OM (`.om`) para Ascend |

## Arquitectura y entrenamiento

FullSubNet combina una rama de banda completa (full-band) que captura el contexto global del espectro con una rama de sub-bandas que procesa cada banda de frecuencia de forma independiente mediante LSTM. Esta fusión permite reducir el ruido manteniendo la calidad de la señal, con un coste computacional moderado adecuado para tiempo real. El checkpoint incluido corresponde a la versión v0.2 oficial de Audio-WestlakeU/FullSubNet, entrenado durante 218 épocas con normalización acumulativa de Laplace (`norm_type: cumulative_laplace_norm`), que difiere de la normalización offline estándar y debe usarse tal cual se distribuye.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens (al ser audio) ni sobre técnicas de alineación como RLHF o DPO, ya que no es un modelo generativo de texto. La innovación principal de esta publicación es el empaquetado para IB-Robot con tres despliegues (Ascend 310P, PyTorch CUDA y PyTorch CPU) que comparten un mismo contrato de ejecución en streaming, con gestión de estado mediante `state_links` en el caso de Ascend.

## Capacidades

- Mejora de voz en tiempo real para arrays de 4 micrófonos, reduciendo ruido y mejorando la inteligibilidad.
- Procesamiento en streaming con estado, manteniendo el contexto entre tramas (ventana de 128 ms, look-ahead de 2 tramas).
- Salida de audio mejorado de 4 canales, lista para su uso en sistemas de reconocimiento de voz o comunicación.
- Despliegue en hardware de borde Ascend 310P mediante artefactos OM stateful, con baja latencia.
- Ejecución en GPU NVIDIA (PyTorch CUDA) y CPU (PyTorch CPU) como alternativas.
- Integración con el framework IB-Robot para robótica, a través del contrato `tensor_model/fullsubnet/enhance`.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de audio.

## Casos de uso

- Asistentes de voz en robótica: el modelo se integra en IB-Robot para limpiar la señal de micrófonos antes de enviarla a un sistema de ASR, mejorando la precisión en entornos ruidosos.
- Teleconferencia y videollamadas: procesa el audio de un array de micrófonos en tiempo real, reduciendo ruido de fondo y reverberación para una comunicación más clara.
- Preprocesamiento para reconocimiento de voz (ASR): se coloca como etapa previa a un motor de transcripción, aumentando la robustez en condiciones acústicas adversas.
- Sistemas de vigilancia y monitorización: mejora la calidad de grabaciones de audio de 4 canales para su posterior análisis forense o automático.
- Dispositivos de borde con Ascend 310P: permite desplegar mejora de voz en cámaras, altavoces inteligentes o robots sin depender de la nube, gracias a los artefactos OM.
- Investigación en mejora de voz: sirve como punto de partida para experimentos con normalización acumulativa de Laplace y arquitecturas full-band/sub-band, al incluir el checkpoint original y los manifiestos de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se incluyen métricas como PESQ, STOI o SNR segmental, ni comparaciones con otros modelos de mejora de voz.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero, apto para inferencia en dispositivos con recursos limitados.
- Para el despliegue en Ascend 310P se requieren los artefactos OM incluidos y el runtime de inferencia unificado de IB-Robot.
- Para PyTorch CUDA se necesita una GPU NVIDIA con soporte CUDA; no se especifica VRAM mínima, pero por el tamaño del modelo se estima que cabe en GPUs de consumo como la RTX 3060 o superiores.
- Para PyTorch CPU se puede ejecutar en cualquier procesador moderno, aunque se advierte que hay que vigilar el presupuesto de 128 ms por trama para mantener el tiempo real.
- Opciones de despliegue: IB-Robot (con backends `stateful_torch_cuda`, `stateful_torch_cpu` y `ascend_310p`), o bien cargando el checkpoint directamente con PyTorch.
- No se proporcionan datos de latencia ni throughput específicos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Canales | Despliegue | Licencia |
|---|---|---|---|---|
| openEuler/fullsubnet | FullSubNet (full-band + sub-band LSTM) | 4 | Ascend 310P, CUDA, CPU | Apache 2.0 |
| DeepFilterNet | Red con filtrado profundo | 1 (mono) | CPU, GPU | MIT |
| DNS (Deep Noise Suppression) | Varios (RNN, Transformer) | 1 (mono) | CPU, GPU | Varias |

No se dispone de datos de rendimiento comparativo (PESQ, STOI) para estos modelos en la información proporcionada. La principal diferencia de esta variante es su soporte nativo para arrays de 4 canales y su empaquetado para el framework IB-Robot, así como la compilación específica para Ascend 310P.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de audio entrenado con datos de voz, puede degradarse con acentos o idiomas poco representados en el entrenamiento.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí puede introducir artefactos en la señal mejorada si el ruido es extremo o si la entrada no coincide con las condiciones de entrenamiento.
- La normalización acumulativa de Laplace es obligatoria; usar un checkpoint con normalización offline puede producir resultados incorrectos.
- El contrato de streaming limita a una única secuencia abierta (`max_open_streams: 1`), lo que impide procesar múltiples flujos simultáneos en el mismo ejecutor.
- La licencia Apache 2.0 permite uso comercial, pero los artefactos OM para Ascend pueden estar sujetos a restricciones adicionales del fabricante del hardware.
- No se proporcionan garantías de rendimiento en términos de latencia o calidad; se recomienda validar en el hardware objetivo antes de producción.

## Enlaces

- [Hugging Face: openEuler/fullsubnet](https://huggingface.co/openEuler/fullsubnet)
- [GitHub: Audio-WestlakeU/FullSubNet](https://github.com/Audio-WestlakeU/FullSubNet)
- [Documentación de openEuler AI](https://docs.openeuler.org/en/docs/25.03/tools/ai/index.html)
- [Proyecto openEuler Intelligence](https://www.openeuler.org/en/projects/intelligence/)
- [IB-Robot en AtomGit](https://atomgit.com/openeuler/IB_Robot)
