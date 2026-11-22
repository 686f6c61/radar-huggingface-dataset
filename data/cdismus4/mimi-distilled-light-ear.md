# cdismus4/mimi-distilled-light-ear

## Resumen

Mimi Distilled Light Ear (rf4) es un codificador de audio ligero destilado del codificador del modelo Mimi de Kyutai. Lo desarrolla el proyecto Voivent (autor cdismus4) y su funcion es transformar una ventana de forma de onda mono a 24 kHz en las mismas caracteristicas latentes continuas (pre-cuantizacion) que produce el codificador Mimi: 512 dimensiones a 12,5 Hz. La diferencia clave es el coste: pasa de un profesor de aproximadamente 156 MB a un estudiante de 13,4 MB con 3.272.835 parametros, manteniendo el mismo contrato de entrada y salida.

Se trata de una red convolucional pequena con padding causal y GroupNorm sobre la ventana de entrada, pensada para inferencia sin estado mediante ventana deslizante sobre audio pasado (por ejemplo, una ventana de 320 ms cada paso de 80 ms). Esta publicada en formato ONNX y esta orientada a despliegue en CPU y en navegador mediante ONNX Runtime Web.

Su relevancia es practica: cualquier consumidor de caracteristicas del codificador Mimi puede sustituir el profesor por este estudiante sin cambiar el contrato de caracteristicas, lo que habilita procesamiento de audio en tiempo real en dispositivos modestos. Es la "oreja" recomendada del pack Jev Base v1, un sistema de voz full-duplex, y se publica de forma independiente porque resulta util por si misma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional con padding causal, convoluciones depthwise-separable y GroupNorm sobre la ventana de entrada |
| Parametros totales | 3.272.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana deslizante de audio, punto de operacion recomendado W=4 (320 ms), campo receptivo de 57,6 frames (4,61 s) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX float32) |
| Idiomas soportados | japones (corpus de destilacion principalmente japones) |
| Licencia | Apache 2.0 para los pesos del estudiante, con atribucion CC BY 4.0 del profesor Mimi (licencia compuesta apache-2.0-with-cc-by-4.0) |
| Formato de pesos | ONNX (`student_rf4.onnx`, 13,4 MB) |

## Arquitectura y entrenamiento

El estudiante es una pila de convoluciones depthwise-separable con padding causal y capas GroupNorm que calculan estadisticas sobre toda la ventana de entrada. Convierte una ventana de forma de onda float32 `[1, 1, samples]` a 24 kHz en caracteristicas float32 `[1, frames, 512]`, con un frame por cada 1.920 muestras (80 ms, 12,5 Hz). El coste computacional medido es de 48.356.864 MAC por frame y el campo receptivo alcanza 57,6 frames (4,61 s).

El entrenamiento consistio en destilacion contra las caracteristicas del codificador Mimi (profesor), con un desplazamiento de +1 frame: la salida del estudiante en el frame t+1 corresponde al frame t del profesor. La release corresponde a la ejecucion de entrenamiento "rf4" (72 epocas, noviembre de 2026), adoptada como ejecucion principal del proyecto. El corpus de destilacion fue principalmente habla japonesa (conversaciones sinteticas, TTS y voz real grabada). No se detallan en la informacion disponible el numero total de tokens de audio ni si se emplearon tecnicas de RLHF o DPO, que en un modelo de extraccion de caracteristicas no resultan aplicables.

La innovacion principal es la reduccion de coste manteniendo el contrato de caracteristicas del profesor: un estudiante de 13,4 MB sustituye a un profesor de aproximadamente 156 MB. La fidelidad medida frente al profesor incluye una similitud coseno de 0,7876 en segmentos de voz real reservados del mismo hablante, una KL en bucle abierto de 0,0204 y una coincidencia de argmax de 0,9835.

## Capacidades

- Extraccion de caracteristicas de audio continuas (pre-cuantizacion) de 512 dimensiones a 12,5 Hz, compatibles con el contrato del codificador Mimi.
- Procesamiento en streaming sin estado mediante ventana deslizante sobre audio pasado (ventana de 320 ms cada 80 ms en el punto de operacion recomendado).
- Captura de prosodia y textura de voz (no de significado linguistico).
- Ejecucion en CPU nativa y en navegador mediante ONNX Runtime Web (Wasm).
- Integracion como "oreja" en sistemas de voz full-duplex (pack Jev Base v1), alimentando componentes de reflejo y driver.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un extractor de caracteristicas, no un modelo generativo.
- Capacidad multilingue limitada en la practica: el corpus de destilacion fue principalmente japones.

## Casos de uso

- Sistemas de voz full-duplex en tiempo real: el modelo actua como front-end de extraccion de caracteristicas para bucles de conversacion (oreja + reflejo + driver), con latencias medidas de 45,1 ms de mediana por frame de 80 ms en Pixel 9a, adecuadas para interaccion conversacional.
- Sustitucion del codificador Mimi en pipelines existentes: cualquier sistema que consuma caracteristicas del codificador Mimi puede cambiar el profesor de aproximadamente 156 MB por este estudiante de 13,4 MB sin modificar el contrato de entrada y salida.
- Procesamiento de audio en el navegador: al distribuirse como ONNX y ejecutarse con ONNX Runtime Web, permite extraer caracteristicas de microfono en el cliente sin enviar audio a un servidor.
- Analisis de prosodia y deteccion de eventos conversacionales: las caracteristicas capturan prosodia y textura de voz, utiles para detectar turnos, backchannels o cambios de entonacion en conversaciones.
- Despliegue en dispositivos con recursos limitados: con 13,4 MB de pesos y 6,49 ms por ventana W=4 en CPU nativa, cabe en entornos embebidos y moviles donde el profesor no es viable.
- Prototipado de sistemas de voz en CPU: permite iterar sobre pipelines de audio en tiempo real sin GPU, reduciendo el coste de infraestructura durante el desarrollo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Latencia por ventana W=4 (CPU nativa) | 6,49 ms |
| Latencia por ventana W=8 (CPU nativa) | 8,53 ms |
| Latencia W=4 en Pixel 9a (ONNX Runtime Web 1.29.0, Wasm), sonda aislada | 35,6 ms de mediana |
| Latencia de la oreja en sesion de microfono en vivo (con guardia de enunciado) | 39,5 ms de mediana, p95 50,5 ms |
| Latencia del bucle completo (oreja + reflejo + driver) | 45,1 ms de mediana, p95 57,6 ms por frame de 80 ms |
| Fidelidad: clips TTS-24 activados a traves del reflejo | 24/24 |
| Backchannels en bucle cerrado | 1.391 frente a 1.372 del profesor (101,4%) |
| KL en bucle abierto frente a la distribucion de acciones del profesor | 0,0204 |
| Coincidencia de argmax | 0,9835 |
| Similitud coseno frente al profesor en segmentos reservados de voz real (mismo hablante) | 0,7876 |
| Backchannels en conversaciones reservadas | 74,6% del profesor |
| Similitud coseno frente a inferencia de longitud completa | aproximadamente 0,75 en W=4, 0,94 en W=8, 0,97 en W=12 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no aplican a un modelo de extraccion de caracteristicas de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo es de 13,4 MB en float32 y esta pensado para ejecucion en CPU. En GPU ocuparia una cantidad de memoria despreciable.
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU y para ONNX Runtime Web en navegador.
- Cabe en GPU de consumo: si, con margen amplisimo, aunque su diseno apunta a CPU y dispositivos moviles.
- Opciones de despliegue: ONNX Runtime (CPU nativa y Web/Wasm, version 1.29.0 probada). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: 6,49 ms por ventana W=4 en CPU nativa y 35,6 ms de mediana en Pixel 9a; en bucle completo en movil, 45,1 ms de mediana por frame de 80 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mimi Distilled Light Ear (rf4) | 3.272.835 | ONNX (13,4 MB) | ventana deslizante, W=4 recomendado (320 ms) | Apache 2.0 con atribucion CC BY 4.0 | Hugging Face |
| kyutai/mimi (codificador profesor) | no disponible (aproximadamente 156 MB el codificador) | no disponible | no disponible | CC BY 4.0 | Hugging Face |
| Otros destilados de codificadores de audio | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el profesor Mimi: el estudiante reduce el tamano en mas de un orden de magnitud (aproximadamente 156 MB a 13,4 MB) a costa de una fidelidad parcial (similitud coseno de 0,7876 en voz real del mismo hablante y 74,6% de backchannels en conversaciones reservadas). No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- No es estrictamente causal como grafo aislado: aunque las convoluciones usan padding causal, las capas GroupNorm calculan estadisticas sobre toda la ventana de entrada, por lo que en una ejecucion de secuencia larga los frames posteriores pueden influir en los anteriores. Usado como se pretende (ventana deslizante de audio pasado tomando el ultimo frame), el sistema se comporta de forma causal.
- La longitud de ventana importa: una entrada de un solo frame (W=1, 80 ms) produce caracteristicas degeneradas; se recomienda W=4 (320 ms) o mas. La similitud coseno frente a inferencia de longitud completa es de aproximadamente 0,75 en W=4.
- Desplazamiento de un frame: la salida del estudiante en el frame t+1 corresponde al frame t del profesor; los consumidores que alineen frame a frame deben aplicar el desplazamiento.
- Las caracteristicas capturan prosodia y textura de voz, no significado linguistico; es una "oreja", no un reconocedor de voz.
- El corpus de destilacion fue principalmente japones, por lo que el comportamiento en otros idiomas no esta validado.
- El estudiante es una aproximacion del profesor; para maxima fidelidad debe usarse el profesor (kyutai/mimi).
- Brecha conocida en conversaciones largas: el recuento de backchannels en conversaciones reservadas alcanza el 74,6% del profesor.
- La licencia es compuesta: los pesos del estudiante son Apache 2.0, pero la derivacion del profesor Mimi (CC BY 4.0) exige atribucion segun el fichero NOTICE; debe revisarse antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdismus4/mimi-distilled-light-ear
- Modelo base (profesor Mimi): https://huggingface.co/kyutai/mimi
- Pack padre Jev Base v1 (full-duplex): https://huggingface.co/cdismus4/chimera-jev-full-duplex
- Fichero de licencia y atribucion (NOTICE): https://huggingface.co/cdismus4/mimi-distilled-light-ear/blob/main/NOTICE
- Licencia CC BY 4.0 del profesor: https://creativecommons.org/licenses/by/4.0/
