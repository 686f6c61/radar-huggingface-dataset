# overpolish/unipase-onnx

## Resumen

UniPASE en ONNX es una conversión al formato ONNX Runtime del modelo UniPASE (Xiaobin Rong et al., IEEE TASLP), un sistema de mejora de voz (speech enhancement) diseñado para restaurar audio degradado y ensancharlo a banda completa. La conversión la mantiene el usuario `overpolish`, que la publica como parte de la infraestructura de su producto Screenwide (función Restore voice). No se han reentrenado pesos: los archivos derivan del checkpoint original `Xiaobin-Rong/unipase` en la revisión `f0b4d4c4411fe08fc2dddbf2d9f33260c27ac4a0`.

El paquete se compone de dos grafos ONNX complementarios. El primero, `unipase-restore`, integra el codificador DeWavLM-Omni, un adaptador y el vocoder `Vocoder_DWO-L1.pt`, y opera a 16 kHz con entrada y salida de la misma longitud. El segundo, `unipase-widen`, contiene el PostNet que ensancha la señal restaurada de 16 kHz a 48 kHz. Ambos grafos son opset 17 y aceptan longitudes arbitrarias de audio.

La relevancia de esta ficha es práctica: ofrece una vía de despliegue en producción de un modelo de restauración de voz de investigación sin necesidad de PyTorch, con separación de grafos optimizada para ejecución híbrida GPU/CPU y con pesos almacenados en float16 para reducir el tamaño de descarga manteniendo el cómputo en float32. El repositorio ocupa 1,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeWavLM-Omni (codificador) + adaptador + vocoder `Vocoder_DWO-L1.pt`; PostNet para ensanchamiento de banda |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; acepta audio de longitud arbitraria (`samples % 320 == 80` en la entrada de restore) |
| Tipos de cuantización | pesos de 4096 valores o más almacenados en float16 y convertidos a float32 en lectura (grafo restore); grafo widen íntegramente en float32 |
| Idiomas soportados | no disponible (modelo de audio, no de texto) |
| Licencia | Apache 2.0 (código de UniPASE bajo MIT) |
| Formato de pesos | ONNX (opset 17) con archivos `.onnx` + `.data` |

## Arquitectura y entrenamiento

La arquitectura subyacente es UniPASE, un sistema de mejora de voz publicado en IEEE TASLP. La conversión a ONNX separa el pipeline en dos grafos: `unipase-restore.onnx` agrupa el codificador DeWavLM-Omni, el adaptador y el vocoder, con entrada `speech` float32 `[1, samples]` a 16 kHz y salida `restored` float32 `[1, samples]` a 16 kHz; `unipase-widen.onnx` aplica el PostNet sobre la señal restaurada y produce `widened` float32 `[1, samples48]` a 48 kHz, en saltos STFT completos de 768 muestras (hasta 767 muestras menos que el triple de la entrada).

El proceso de exportación parte del repositorio de UniPASE en el commit `857b60a`, con el parche `scripts/tfgrid_cws_res.patch` aplicado (convierte el `math.ceil` del PostNet sobre longitudes en división entera, de modo que las longitudes permanezcan simbólicas en el grafo), y con PyTorch 2.15. Se emplean los scripts `scripts/export_onnx.py` y `scripts/store_half.py`. Las STFT e ISTFT se implementan como convoluciones con bases DFT fijas para evitar que ningún operador recaiga en la CPU a mitad de grafo. Se conserva el enmascaramiento de pérdida de paquetes de WavLM: los paquetes de 320 muestras completamente a cero se tratan como perdidos. No hubo reentrenamiento ni ajuste fino; los pesos son los originales de los autores.

## Capacidades

- Restauración de voz degradada: elimina ruido y artefactos de la señal de entrada a 16 kHz, devolviendo audio de la misma longitud.
- Ensanchamiento de banda: extiende la señal restaurada de 16 kHz a 48 kHz mediante el PostNet.
- Manejo de pérdida de paquetes: el enmascaramiento de WavLM identifica paquetes de 320 muestras a cero como perdidos y los trata en consecuencia, lo que lo hace apto para audio procedente de redes con pérdidas.
- Longitud de entrada arbitraria: ambos grafos aceptan cualquier número de muestras dentro de la restricción `samples % 320 == 80` del grafo restore.
- Ejecución híbrida: los grafos están separados para que el restore corra en GPU (WebGPU, DirectML) y el widen en CPU, donde sus LSTM rinden mejor.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto: es un modelo exclusivamente de audio.
- No dispone de modo thinking, visión ni audio de salida distinto de la señal procesada.

## Casos de uso

- Restauración de voz en aplicaciones de comunicación: integrado en un cliente de videollamada o VoIP, el grafo restore limpia la señal capturada a 16 kHz antes de codificarla, y el enmascaramiento de paquetes perdidos de WavLM ayuda en redes inestables.
- Limpieza de grabaciones de podcast o entrevistas: se procesa el audio a 16 kHz con restore y se ensancha a 48 kHz con widen para entregar un máster de banda completa sin depender de PyTorch.
- Preprocesado para ASR: la señal restaurada mejora la relación señal-ruido antes de alimentar un sistema de reconocimiento de voz, lo que reduce errores en entornos ruidosos.
- Restauración en el navegador: al ejecutarse el grafo restore con WebGPU y el widen en CPU, es viable un flujo de mejora de voz en cliente sin servidor, útil para herramientas de accesibilidad o edición de audio web.
- Procesado por lotes en servidores sin GPU dedicada: el widen, cuyas LSTM rinden mal en proveedores GPU, se ejecuta en CPU, de modo que un pipeline puede asignar el restore a una GPU compartida y el widen a los núcleos del servidor.
- Integración en pipelines de recuperación de archivos de audio dañados: el tratamiento de paquetes a cero como perdidos permite rescatar grabaciones con cortes o silencios artificiales antes de su transcripción o archivo.
- Despliegue en entornos con ONNX Runtime: al ser opset 17 y no requerir operadores personalizados, encaja en infraestructuras que ya usan ONNX Runtime (DirectML en Windows, WebGPU en navegador) sin añadir una dependencia de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que los grafos restore y widen juntos igualan la salida del modelo PyTorch con una SNR de 51 a 60 dB en voz de test, lo que constituye una validación de fidelidad de la conversión, no una comparativa de calidad de mejora de voz frente a otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,1 GB y el grafo restore almacena los pesos de 4096 valores o más en float16, por lo que la huella en memoria es aproximadamente la mitad del tamaño en float32.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona WebGPU y DirectML como proveedores de ejecución para el grafo restore.
- ¿Cabe en GPU de consumo? No se indica; dado el tamaño del repositorio (1,1 GB) es plausible en GPUs de consumo con suficiente memoria, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: ONNX Runtime con proveedores WebGPU, DirectML y CPU; el grafo widen se recomienda en CPU por el mal rendimiento de sus LSTM en proveedores GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| overpolish/unipase-onnx | no disponible | audio arbitrario a 16 kHz (`samples % 320 == 80`) | Apache 2.0 | ONNX (opset 17) | Hugging Face |
| Xiaobin-Rong/unipase (original) | no disponible | audio arbitrario a 16 kHz | Apache 2.0 | PyTorch | Hugging Face |
| Alternativas de speech enhancement | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa se limita al modelo original y su conversión.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: cualquier limitación del UniPASE original se hereda sin cambios.
- La entrada del grafo restore exige `samples % 320 == 80`; longitudes que no cumplan esta restricción deben ajustarse antes de la inferencia.
- La salida del grafo widen puede quedar hasta 767 muestras por debajo del triple de la entrada, al operar en saltos STFT completos de 768 muestras; hay que tenerlo en cuenta al concatenar o alinear audio.
- Los pesos de 4096 valores o más se almacenan en float16 y se convierten a float32 en lectura: el cómputo es float32, pero existe una pérdida de precisión en el almacenamiento que conviene validar para el caso de uso concreto.
- El grafo widen contiene LSTM que rinden mal en proveedores GPU; forzar su ejecución en GPU puede degradar el rendimiento.
- No hay información sobre sesgos, riesgo de alucinación (concepto poco aplicable a un modelo de audio) ni comportamiento multilingüe, ya que no procesa texto.
- Licencia Apache 2.0 para estos archivos; el código de UniPASE es MIT y las licencias de los trabajos en los que se basa están en la carpeta `licenses` de su repositorio. Verificar la compatibilidad antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción más allá de la declaración del autor sobre Screenwide.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/overpolish/unipase-onnx
- Modelo base: https://huggingface.co/Xiaobin-Rong/unipase
- Repositorio de UniPASE: https://github.com/Xiaobin-Rong/unipase
- Paper: https://arxiv.org/abs/2604.14606
- Producto del autor: https://getscreenwide.com
