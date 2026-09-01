# kingfang008/BonFrame-LatentSync-ONNX

## Resumen

BonFrame LatentSync ONNX Runtime Pack es un paquete de inferencia en formato ONNX que permite ejecutar el modelo de lip-sync LatentSync de ByteDance de forma local, sin depender de Python ni PyTorch. El autor, kingfang008, lo ha diseñado para integrarse en la aplicación BonFrame, que se ejecuta en Windows y Linux mediante Node.js y la librería `onnxruntime-node`. El repositorio contiene los gráficos de inferencia del UNet destilado (a 256 y 512 píxeles), el VAE en FP16, el codificador de audio Whisper, filtros mel, detector facial, modelo de landmarks de 106 puntos y la máscara de boca oficial.

La relevancia de este paquete radica en que simplifica el despliegue de una tecnología de sincronización labial de última generación en entornos de escritorio, eliminando la necesidad de un entorno Python completo. Al estar basado en ONNX, es interoperable con múltiples runtimes y plataformas, y su licencia Apache-2.0 permite uso comercial con las debidas atribuciones. El tamaño del repositorio es de 0.2 GB, lo que lo hace ligero para su distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentSync (UNet destilado con horario fijo de 4 timesteps) + VAE de Stable Diffusion + Whisper tiny + detector facial InsightFace |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa audio y video por frames) |
| Tipos de cuantizacion | FP16 para VAE; resto no especificado |
| Idiomas soportados | no disponible (depende del audio de entrada) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (gráficos y pesos externos) |

## Arquitectura y entrenamiento

El paquete no es un modelo entrenado desde cero, sino una exportación a ONNX de los componentes de LatentSync, un método de lip-sync basado en difusión latente condicionada por audio, desarrollado por ByteDance. La arquitectura principal es un UNet destilado que opera en el espacio latente de un VAE de Stable Diffusion, con un horario de muestreo fijo de cuatro pasos de timestep, registrado en el archivo `runtime.json` de cada versión (1.5 para 256px y 1.6 para 512px). Estos checkpoints destilados no son intercambiables con los del modelo profesor original.

El codificador de audio es Whisper tiny de OpenAI, que convierte la señal de voz en características que condicionan la generación. Además, se incluyen componentes auxiliares como filtros mel, un detector facial y un modelo de landmarks de 106 puntos (compatibles con InsightFace) para alinear el rostro, y una máscara de boca oficial para limitar la modificación a la región labial. No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ya que el repositorio solo contiene los artefactos de inferencia.

## Capacidades

- Sincronización labial de vídeo a partir de audio de voz, generando un vídeo donde los labios del sujeto se mueven de forma coherente con el discurso.
- Ejecución local en Windows y Linux mediante Node.js y `onnxruntime-node`, sin necesidad de Python ni PyTorch.
- Soporte de dos resoluciones de salida: 256 píxeles (versión 1.5) y 512 píxeles (versión 1.6).
- Incluye detección facial y extracción de landmarks para un alineamiento preciso del rostro.
- Incluye máscara de boca para limitar la modificación a la región labial, preservando el resto del rostro.
- Compatible con el ecosistema ONNX, lo que permite su uso con otros runtimes como ONNX Runtime C++ o WebAssembly.

## Casos de uso

- Doblaje de vídeos en múltiples idiomas: el modelo puede reemplazar el movimiento labial de un actor para que coincida con una pista de audio traducida, manteniendo la identidad visual del rostro. Es adecuado porque la máscara de boca limita los cambios a la zona labial, reduciendo artefactos en el resto de la cara.
- Creación de avatares parlantes para asistentes virtuales: al integrarse en una aplicación de escritorio, permite generar vídeos de un personaje que habla en tiempo real o bajo demanda, usando solo el audio como entrada.
- Localización de contenido educativo o corporativo: las empresas pueden adaptar vídeos formativos a otros idiomas sin regrabar, usando el paquete ONNX en sus propios servidores o estaciones de trabajo.
- Accesibilidad para personas con discapacidad auditiva: se puede generar una versión con lectura de labios mejorada a partir de audio, aunque el modelo no está diseñado específicamente para ello, su precisión en la sincronización puede ayudar en contextos controlados.
- Producción de vídeo en tiempo real para streaming: gracias a la inferencia ligera (0.2 GB) y al uso de Node.js, es viable integrarlo en pipelines de streaming local, por ejemplo para avatares en directo.
- Investigación en síntesis de vídeo: los investigadores pueden utilizar el paquete como referencia de implementación ONNX de LatentSync para estudiar el comportamiento del modelo o comparar con otras arquitecturas de lip-sync.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de calidad (como PSNR, SSIM o LPIPS) ni comparaciones con otros métodos de lip-sync. Tampoco se especifican latencias ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño total del paquete es de 0.2 GB, lo que sugiere que los modelos son relativamente pequeños, pero no se indica el consumo de memoria en inferencia.
- GPU recomendadas: no especificadas. Al ser ONNX, puede ejecutarse en CPU, GPU NVIDIA (CUDA), AMD (ROCm) o incluso en aceleradores integrados, dependiendo de la compilación de `onnxruntime-node`.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño reducido, pero no hay confirmación oficial.
- Opciones de despliegue: el paquete está pensado para usarse con `onnxruntime-node` en Node.js. También podría integrarse con otros runtimes ONNX (C++, C#, Python) si se adapta la lógica de carga.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Existen otros métodos de lip-sync como Wav2Lip, SadTalker o VideoReTalking, pero no se han encontrado datos de rendimiento relativos en las fuentes consultadas. Por tanto, no se puede ofrecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El paquete está diseñado para uso local y requiere que el usuario obtenga el consentimiento de las personas y voces representadas en los medios generados, tal como se indica en la model card.
- Al ser una exportación ONNX de un modelo destilado, puede haber diferencias de calidad respecto al modelo original de LatentSync, especialmente en resolución de 256px.
- No se proporcionan datos sobre sesgos o alucinaciones. Como cualquier modelo generativo, puede producir artefactos visuales en condiciones de iluminación o poses extremas.
- La licencia Apache-2.0 cubre el código y los pesos, pero los componentes de terceros (Whisper, VAE de Stable Diffusion, InsightFace) tienen sus propias licencias y términos de uso aceptables, que el usuario debe revisar.
- El paquete no incluye documentación sobre el formato de entrada/salida más allá de la estructura de carpetas, por lo que la integración requiere conocimientos de ONNX Runtime y de la lógica de LatentSync.
- No se garantiza el soporte para otros sistemas operativos distintos de Windows y Linux, aunque ONNX es multiplataforma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingfang008/BonFrame-LatentSync-ONNX
- Repositorio oficial de LatentSync (ByteDance): https://github.com/bytedance/LatentSync
- ONNX Model Zoo: https://github.com/onnx/models
- Página de modelos ONNX Runtime: https://onnxruntime.ai/models
