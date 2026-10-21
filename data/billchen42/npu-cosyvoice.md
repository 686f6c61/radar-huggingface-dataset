# billchen42/npu-cosyvoice

## Resumen

`billchen42/npu-cosyvoice` no es un modelo entrenado desde cero, sino un paquete de artefactos precompilados para ejecutar el modelo de síntesis de voz CosyVoice3 en la NPU AMD Ryzen AI (XDNA1). Concretamente, contiene los pesos del DiT de flow matching cuantizados a int8 (W8A8), el backbone LM Qwen2 convertido a GGUF Q4_0 para llama.cpp, y un overlay de GEMM int8 de 512x1024x1024 compilado para XDNA1. El modelo subyacente es FunAudioLLM/Fun-CosyVoice3-0.5B-2512, desarrollado por FunAudioLLM y publicado bajo licencia Apache-2.0.

El problema que resuelve es de despliegue: exportar y compilar estos artefactos localmente cuesta unos 15 minutos de CPU, y el repositorio permite al paso `setup` del bundle de voz descargarlos ya verificados con SHA256. El resultado es determinista: reconstruir los ficheros con el contenedor del proyecto reproduce los mismos bits.

Por tamaño, el checkpoint declarado suma 494.032.768 parámetros (≈0,49 B), coherente con la nomenclatura "0.5B" del modelo base. El repositorio ocupa 0,8 GB y no incluye el vocoder, los embeddings ni el voice encoder, que siguen ejecutándose en PyTorch y deben obtenerse del checkpoint original en ModelScope. Es relevante para quien quiera TTS conversacional de baja latencia en hardware de PC con NPU AMD, no para quien busque un checkpoint autocontenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS en dos etapas: backbone LM Qwen2 (sin cabeza de salida) + DiT de flow matching; vocoder, embeddings y voice encoder permanecen en PyTorch |
| Parámetros totales | 494.032.768 (dato real de safetensors, ≈0,49 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 W8A8 con escalas por canal de salida y SmoothQuant en q/k/v (DiT); Q4_0 en GGUF (backbone LM) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo base), GGUF (`cv_llm_q4_0.gguf`), artefactos int8 para NPU (`weights/`) y overlay `xclbin` (`aot/npu1/`) |

## Arquitectura y entrenamiento

El modelo base CosyVoice3 es un sistema de texto a voz que combina un backbone de lenguaje Qwen2 de aproximadamente 0,5 B de parámetros con un transformer de difusión (DiT) entrenado con flow matching, encargado de generar las representaciones acústicas que después convierte el vocoder. A ello se suman embeddings y un voice encoder que permiten el uso de voces de referencia. Este repositorio no entrena nada: exporta y cuantiza piezas del checkpoint original para su ejecución en NPU.

Las modificaciones documentadas son tres. Primero, las proyecciones del DiT se cuantizan a int8 en régimen W8A8 con escalas por canal de salida y escalado SmoothQuant aplicado a la entrada de q/k/v, calibrado sobre cuatro frases. Segundo, el backbone LM se convierte a GGUF y se cuantiza a Q4_0 tras eliminar la cabeza de salida, que no se utiliza en inferencia. Tercero, se compila un overlay de GEMM int8 de 512x1024x1024 específico para XDNA1 mediante MLIR-AIE (`scripts/compile_xclbin.py --device npu1`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con pipeline declarado como `text-to-speech` y etiqueta `conversational`.
- Generación de habla con voces de referencia: el bundle incluye voice encoder, aunque las capacidades concretas de clonación no se detallan en esta ficha.
- Ejecución del DiT de flow matching sobre NPU AMD XDNA1, con pesos int8 y overlay de GEMM dedicado.
- Ejecución del backbone LM mediante llama.cpp con pesos Q4_0, lo que permite desacoplar esa etapa del resto del pipeline.
- Verificación de integridad de artefactos mediante `SHA256SUMS` en el paso `setup`.
- Reproducibilidad bit a bit de los tres artefactos con el contenedor del proyecto.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio de entrada: no disponible (no es un modelo de propósito general).
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz locales en portátiles con Ryzen AI: el DiT se ejecuta en la NPU XDNA1 y el LM en llama.cpp, lo que permite mantener la síntesis de voz en el dispositivo sin enviar texto a la nube.
- Lectura de pantalla y accesibilidad: integración en lectores de pantalla que conviertan texto en audio en tiempo de ejecución, aprovechando que el despliegue no requiere GPU dedicada.
- Prestación de voz para agentes conversacionales: al estar etiquetado como `conversational`, encaja en pipelines de diálogo por turnos donde la latencia de la etapa acústica es crítica.
- Generación por lotes de avisos y locuciones: síntesis de mensajes cortos (confirmaciones, alertas, notificaciones) en aplicaciones de escritorio, con cuantización int8 que reduce el peso en memoria.
- Prototipado de interfaces de voz en investigación: permite medir el rendimiento de CosyVoice3 sobre NPU sin reescribir el pipeline, sustituyendo únicamente los artefactos exportados.
- Evaluación comparativa de cuantización: al ofrecer simultáneamente el camino int8 W8A8 (DiT) y Q4_0 (LM), sirve para estudiar la degradación de calidad frente al checkpoint original en fp16.
- Despliegue embebido en equipos de sobremesa con NPU: el tamaño del repo (0,8 GB) y la ausencia de dependencia de VRAM de GPU lo hacen apto para máquinas con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de síntesis (MOS, WER, similitud de hablante), latencia ni throughput, ni comparaciones con el checkpoint original en fp16.

## Requisitos de hardware

- NPU: AMD Ryzen AI con arquitectura XDNA1 para ejecutar el DiT con el overlay int8 proporcionado (`aot/npu1/`). Sin esa NPU, los artefactos `xclbin` no son utilizables.
- Memoria estimada (cálculo aproximado a partir de 494 M de parámetros, no medido): ≈1 GB en fp16 para el conjunto del checkpoint, ≈0,5 GB en int8 para el DiT y ≈0,25 GB en Q4_0 para el backbone LM. El repo completo ocupa 0,8 GB.
- GPU dedicadas: no se documenta soporte para A100, H100 ni RTX 4090; el camino previsto es NPU XDNA1 más llama.cpp.
- GPU de consumo: no aplica según la información disponible; el objetivo declarado es la NPU integrada en plataformas Ryzen AI.
- Despliegue: llama.cpp (commit `9adc7f4` citado) para el LM en GGUF, runtime propio `npu_cosyvoice` para el DiT en NPU y PyTorch para vocoder, embeddings y voice encoder. No se mencionan vLLM, TGI ni Ollama.
- El checkpoint original debe descargarse de ModelScope durante el `setup`, ya que el repositorio no incluye esas partes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| `billchen42/npu-cosyvoice` | 494.032.768 | No disponible | Apache-2.0 | NPU AMD XDNA1 + llama.cpp + PyTorch | Artefactos precompilados, no autocontenido |
| Fun-CosyVoice3-0.5B-2512 (base) | ≈0,5 B | No disponible | Apache-2.0 | PyTorch / GPU convencional | Checkpoint completo, incluye vocoder y voice encoder |
| CosyVoice2-0.5B | ≈0,5 B | No disponible | Apache-2.0 | PyTorch | Generación anterior de la familia; datos de rendimiento no disponibles en esta búsqueda |
| Kokoro-82M | 82 M | No disponible | Apache-2.0 | ONNX / PyTorch | Modelo TTS mucho más pequeño; comparación de calidad no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad de síntesis entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint original de CosyVoice3 en ModelScope para vocoder, embeddings y voice encoder; sin él, los artefactos no producen audio.
- Dependencia fuerte de hardware: el overlay `xclbin` está compilado exclusivamente para XDNA1 (flag `--device npu1`); no es portable a otras NPUs, GPU o CPU sin recompilación.
- La calibración de SmoothQuant se hizo con solo cuatro frases, lo que puede introducir sesgo de calibración y degradar la calidad en dominios acústicos alejados de esas muestras.
- Doble cuantización acumulada: int8 en el DiT y Q4_0 en el LM. No se han publicado métricas de la pérdida de calidad frente a fp16, por lo que el impacto real es desconocido.
- El vocoder y el voice encoder siguen en PyTorch, de modo que el rendimiento extremo a extremo está limitado por esas etapas y no solo por la NPU.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificar el modelo base.
- Riesgo de uso indebido para suplantación de identidad mediante clonación de voz; no se documentan mitigaciones, marcas de agua ni filtros en esta ficha.
- Sesgos: no se han publicado evaluaciones de sesgo acústico, demográfico o de acento en la información disponible.
- Riesgo de alucinación en sentido estricto no aplica a TTS, pero sí de prosodia incorrecta, pronunciaciones erróneas y artefactos en textos fuera de dominio.
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a FunAudioLLM y el aviso de modificaciones (cuantización del DiT y del LM, eliminación de la cabeza de salida); el overlay generado con MLIR-AIE queda bajo Apache-2.0 WITH LLVM-exception.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida; conviene verificar los checksums antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/billchen42/npu-cosyvoice
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio del proyecto: https://github.com/YuhuaBillChen/npu-cosyvoice
- MLIR-AIE (generación del overlay NPU): https://github.com/Xilinx/mlir-aie
- llama.cpp (commit `9adc7f4` citado en el README): https://github.com/ggml-org/llama.cpp
- Checkpoint original en ModelScope: URL no proporcionada en la información disponible (el README indica que el paso `setup` lo descarga desde ModelScope)
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
