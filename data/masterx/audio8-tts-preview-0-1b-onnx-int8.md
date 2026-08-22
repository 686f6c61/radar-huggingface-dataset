# Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8

## Resumen

Audio8-TTS-Preview-0.1B-ONNX-INT8 es una conversión no oficial a ONNX Runtime del modelo de síntesis de voz Audio8-TTS-Preview-0.1B, publicada por el usuario Masterx para su integración en el proyecto WinSTT. El modelo original, desarrollado por Audio8, es un sistema de texto a voz (TTS) compacto de 0.1 mil millones de parámetros que combina una rama de atención con estado Mamba (arquitectura híbrida Falcon-H1) y un decodificador de códec neuronal para generar audio. Esta conversión expone dos grafos ONNX recurrentes —`slow_step_int8.onnx` y `fast_step_int8.onnx`— que permiten ejecutar la generación paso a paso en entornos de inferencia optimizados, con pesos cuantizados a INT8 dinámico por canal.

La relevancia de este modelo reside en que ofrece una alternativa ligera y desplegable en CPU para síntesis de voz, sin necesidad de GPU dedicada. Al estar cuantizado a INT8 y exportado a ONNX, su footprint es reducido (0.2 GB de repositorio) y puede integrarse en aplicaciones de escritorio o servidores de baja potencia. Sin embargo, es importante señalar que se trata de una conversión no oficial, sin afiliación con Audio8, y que la licencia impone restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Falcon-H1 (atención + Mamba/SSM) con 24 capas, exportada a ONNX como dos grafos recurrentes: `slow_step_int8.onnx` y `fast_step_int8.onnx` |
| Parametros totales | 0.1B (100 millones aproximadamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 dinámico por canal (pesos) |
| Idiomas soportados | No disponibles (la documentación del modelo 0.6B indica que es multilingüe) |
| Licencia | Audio8 Community License v1.0 (uso comercial limitado a entidades con ingresos anuales inferiores a US$2,000,000; redistribución debe mantener licencia y aviso de autoría) |
| Formato de pesos | ONNX (grafos `.onnx` con sidecars de datos externos) |

## Arquitectura y entrenamiento

La arquitectura del modelo original, Audio8-TTS-Preview-0.1b, combina una rama de atención con un estado de tipo Mamba (SSM) en una configuración híbrida denominada Falcon-H1 con 24 capas. Esta mezcla de mecanismos permite modelar dependencias de largo alcance en la entrada textual mientras se mantiene un coste computacional reducido, típico de las arquitecturas SSM. El export ONNX expone un contrato recurrente de un token en lugar de trazar el bucle de generación completo, lo que facilita su integración en motores de inferencia que gestionan el estado manualmente. El decodificador de códec de audio no forma parte de los grafos ONNX; se reutiliza el archivo `codec.pth` oficial de Audio8 de 0.6B en FP16, ya que los archivos de 0.1B y 0.6B son byte-idénticos.

No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del dataset, técnicas de RLHF/DPO) en la documentación disponible. La conversión ONNX fue validada contra el modelo PyTorch en las dos primeras posiciones recurrentes, y se ancló a la revisión upstream `7a644014c398a0495d5efd1da7461bfeb4dbddcd`.

## Capacidades

- Síntesis de texto a voz (TTS) de alta calidad a escala compacta, según la descripción del proyecto Audio8.
- Clonación de voz zero-shot: el modelo puede registrar una voz de referencia mediante un codificador opcional y replicarla en nuevas síntesis (según documentación del modelo 0.6B).
- Generación multilingüe: el modelo 0.6B se describe como multilingüe, por lo que se espera que el 0.1B comparta esta capacidad, aunque no se listan idiomas concretos.
- Despliegue en CPU: la cuantización INT8 y el formato ONNX permiten ejecución eficiente en hardware sin GPU dedicada.
- Integración con ONNX Runtime: los dos grafos recurrentes permiten control fino del proceso de generación (paso semántico y paso de códec).

## Casos de uso

- Asistentes de voz en aplicaciones de escritorio: el modelo puede integrarse en herramientas locales que convierten texto en voz sin depender de servicios en la nube, aprovechando su tamaño reducido y ejecución en CPU.
- Lectura de contenido para accesibilidad: sintetizar artículos, libros o noticias en audio para personas con discapacidad visual, con la posibilidad de usar una voz de referencia personalizada.
- Generación de audiolibros o podcasts automatizados: mediante la clonación de voz zero-shot, se puede producir contenido narrado con una voz consistente a partir de guiones de texto.
- Sistemas de respuesta interactiva (IVR): integración en centralitas telefónicas que necesiten generar mensajes dinámicos en tiempo real con bajo consumo de recursos.
- Prototipado rápido de TTS: al ser un modelo compacto y cuantizado, es adecuado para pruebas de concepto y desarrollo de productos TTS sin grandes inversiones en hardware.
- Aplicaciones educativas: generación de material de estudio en audio a partir de apuntes o libros, con la posibilidad de ajustar la voz mediante referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval u otras métricas comparativas para este modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecución en CPU con ONNX Runtime, por lo que no requiere GPU dedicada.
- GPU recomendada: no necesaria; puede ejecutarse en CPU estándar. Si se desea aceleración, cualquier GPU con soporte ONNX Runtime (por ejemplo, NVIDIA con CUDA) funcionará, pero no hay datos de rendimiento.
- Cabe en consumer GPU: sí, pero no es el objetivo; su tamaño de 0.2 GB lo hace viable incluso en hardware de baja gama.
- Opciones de despliegue: ONNX Runtime (Python, C++), integrable en aplicaciones de escritorio o servidores. No hay soporte documentado para vLLM, llama.cpp u Ollama, ya que es un modelo TTS y no un LLM de texto.
- Latencia y throughput: no disponibles; dependen del hardware y de la optimización del bucle de generación en WinSTT.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audio8-TTS-Preview-0.1B-ONNX-INT8 | 0.1B | INT8 dinámico | No disponible | Audio8 Community License v1.0 | HuggingFace |
| Audio8-TTS-Preview-0.6B-ONNX-INT4 | 0.6B | INT4 weight-only | No disponible | Audio8 Community License v1.0 | HuggingFace |
| Audio8-TTS-Preview-0.1b (original) | 0.1B | FP16 (pesos) | No disponible | Audio8 Community License v1.0 | HuggingFace |

La principal diferencia es el tamaño: el 0.6B ofrece mayor calidad de síntesis a cambio de más memoria, mientras que el 0.1B es más ligero. Ambos son TTS con clonación de voz zero-shot y orientados a despliegue en CPU. No se han publicado benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial está limitado a entidades con ingresos anuales inferiores a US$ 2,000,000; la redistribución debe mantener la licencia y el aviso de autoría. Revisar el `LICENSE` incluido antes de cualquier uso.
- Conversión no oficial: el export ONNX fue producido por Masterx, no por Audio8, y no está afiliado con la empresa. Podría contener errores de conversión no detectados más allá de las dos primeras posiciones validadas.
- Sin datos de entrenamiento: se desconoce la composición del dataset, el número de tokens y si se aplicaron técnicas de alineación (RLHF/DPO), lo que dificulta evaluar sesgos o robustez.
- Idiomas no confirmados: aunque el modelo 0.6B se describe como multilingüe, no hay una lista oficial de idiomas soportados para el 0.1B.
- Sin benchmarks: no hay métricas objetivas de calidad de síntesis (MOS, etc.) publicadas para este modelo.
- Dependencia del decodificador de códec: el modelo reutiliza el codec FP16 de 0.6B, que debe descargarse por separado; el rendimiento final depende de ese componente.
- Riesgo de alucinación auditiva: como todo TTS, puede generar pronunciaciones incorrectas o artefactos de audio en nombres propios o palabras fuera de vocabulario, aunque no hay datos cuantificados.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Masterx/Audio8-TTS-Preview-0.1B-ONNX-INT8
- Modelo base en HuggingFace: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Modelo 0.6B en HuggingFace (documentación de capacidades): https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6B-ONNX-INT4
- Repositorio GitHub de Audio8_TTS: https://github.com/Audio8-AI/Audio8_TTS
- Documentación ONNX Runtime del proyecto: https://github.com/Audio8-AI/Audio8_TTS/tree/master/onnx_runtime
