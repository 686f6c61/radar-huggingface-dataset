# sfoley3/streaming-wav2vt-onnx

## Resumen

`streaming-wav2vt-onnx` es un paquete de exportaciones ONNX del modelo de inversión articulatoria en tiempo real desarrollado por sfoley3, que convierte audio de voz en representaciones del tracto vocal (vocal tract, VT) a partir de datos de resonancia magnética en tiempo real (rtMRI). El modelo no es un LLM ni un modelo de lenguaje: es un sistema de procesamiento de señal que transforma una ventana de audio en una secuencia de parámetros articulatorios, pensado para visualización y análisis fonético en el navegador.

La arquitectura subyacente se denomina SW2V (streaming speech-to-vocal-tract) e incorpora un decodificador espacial con lookahead de 2 frames. Las exportaciones están diseñadas para inferencia por pasos discretos: cada llamada procesa un paso de 40 ms de audio, lo que permite un flujo continuo compatible con demos web en tiempo real.

Su relevancia es acotada pero específica: ofrece una implementación ligera (repo de 0,7 GB) y con licencia MIT para tareas de visualización articulatoria, investigación fonética y desarrollo de herramientas interactivas de pronunciación, sin depender de frameworks de deep learning pesados en el cliente gracias al formato ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SW2V (speech-to-vocal-tract) con decodificador espacial y lookahead de 2 frames; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio de 40 ms por paso |
| Tipos de cuantizacion | 8-bit MatMulNBits (w8), fp16 en almacenamiento de pesos (w16), fp16 en computo (fp16) |
| Idiomas soportados | no disponible (modelo acústico-articulatorio, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SW2V, un backbone de procesamiento de audio en streaming acoplado a un decodificador espacial que opera con un lookahead de 2 frames. El diseño está orientado a inferencia incremental: cada llamada al grafo ONNX consume un paso de 40 ms de audio y produce la correspondiente estimación articulatoria. El contrato exacto del paso (`step contract`) se documenta en el directorio `demo/export/` del repositorio de GitHub del autor.

El modelo se entrena con datos de resonancia magnética en tiempo real (rtMRI), que capturan la dinámica del tracto vocal durante el habla. La model card no especifica el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de alineamiento o refinamiento posteriores. Tampoco se detallan innovaciones adicionales más allá del esquema de streaming con lookahead y las tres variantes de exportación orientadas a distintos compromisos de precisión y velocidad.

## Capacidades

- Conversión de audio de voz a representaciones del tracto vocal (inversión articulatoria) en pasos de 40 ms.
- Inferencia en streaming, adecuada para procesamiento continuo de audio en el navegador.
- Tres variantes de exportación: `w8` (8-bit MatMulNBits, fp32 compute, opción por defecto), `w16` (pesos fp16, fp32 compute, mayor precisión y más lenta) y `fp16` (cómputo fp16, requiere shader-f16 en WebGPU).
- Ejecución en cliente mediante ONNX Runtime Web / WebGPU, sin backend servidor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multilingües en sentido lingüístico; su ámbito es acústico-articulatorio.
- No incluye visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Visualización articulatoria en el navegador: integración en demos web que muestran la posición estimada de los articuladores mientras el usuario habla, usando la variante `w8` por su equilibrio entre tamaño y velocidad.
- Herramientas de entrenamiento de pronunciación: comparar la trayectoria articulatoria estimada con una referencia para dar retroalimentación visual a estudiantes de fonética.
- Investigación fonética y lingüística: generación de datos articulatorios aproximados a partir de corpus de audio existentes para análisis estadísticos.
- Desarrollo de interfaces de accesibilidad: control o visualización basada en dinámica articulatoria en aplicaciones web sin instalación de software.
- Prototipado de pipelines de análisis del habla: uso de las exportaciones ONNX dentro de flujos de procesamiento de señal en Python o JavaScript con ONNX Runtime.
- Docencia y divulgación: demostraciones interactivas sobre cómo se produce el habla, aprovechando la licencia MIT y el reducido tamaño del repo (0,7 GB).
- Evaluación comparativa de cuantizaciones: las tres variantes permiten medir el impacto de w8, w16 y fp16 en precisión articulatoria y latencia sobre el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repo (0,7 GB) incluye las tres variantes, por lo que cada una ocupa una fracción de esa cifra.
- GPU recomendadas: no especificadas por el autor. La variante `fp16` requiere soporte de shader-f16 en WebGPU.
- Compatibilidad con GPU de consumo: el diseño para navegador y el formato ONNX sugieren que puede ejecutarse en GPU integradas y dedicadas de consumo, pero no hay datos oficiales de compatibilidad ni de rendimiento.
- Opciones de despliegue: ONNX Runtime (Web, con WebGPU para la variante `fp16`; también ejecución en CPU para `w8` y `w16`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la única referencia es el paso de 40 ms por llamada.

## Comparativa con modelos similares

No disponible. La model card no menciona modelos comparables de inversión articulatoria en streaming ni se han proporcionado datos de alternativas.

## Limitaciones y advertencias

- Modelo de inversión articulatoria, no un modelo de lenguaje: no genera texto, código ni respuestas conversacionales.
- La model card no documenta sesgos, composición del dataset ni cobertura de hablantes, por lo que se desconoce su robustez ante acentos, edades o condiciones de grabación distintas de las de entrenamiento.
- Riesgo de estimaciones articulatorias imprecisas fuera de la distribución de entrenamiento; no debe usarse como medida clínica o diagnóstica.
- Dependencia de la calidad y el formato del audio de entrada; el contrato de paso (40 ms) debe respetarse para un streaming correcto.
- La variante `fp16` requiere WebGPU con shader-f16, lo que limita su uso a navegadores y dispositivos compatibles.
- Licencia MIT: permite uso comercial y modificación, pero no se especifican garantías ni condiciones adicionales sobre los datos de entrenamiento subyacentes.
- No hay información sobre el rendimiento en producción ni sobre el mantenimiento del repositorio (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sfoley3/streaming-wav2vt-onnx
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/sfoley3/streaming-wav2vt-demo
- Repositorio GitHub: https://github.com/sfoley3/streaming-wav2vt
- Contrato de paso y exportaciones: https://github.com/sfoley3/streaming-wav2vt/tree/main/demo/export
