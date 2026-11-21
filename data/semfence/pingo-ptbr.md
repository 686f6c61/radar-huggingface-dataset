# semfence/pingo-ptbr

## Resumen

pingo-ptbr es un sistema completo de texto a voz (TTS) en portugués de Brasil desarrollado por SemFence (Gustavo Toledo) que cabe en un único archivo de 0,87 MB. Combina un modelo acústico propio de 270.081 parámetros, entrenado desde cero, con un vocoder FARGAN congelado de 816.597 parámetros procedente de PiVo, sumando 1.086.678 parámetros totales. Genera audio mono a 16 kHz e incluye dos voces sintéticas: F_s4 (femenina) y M_sm4 (masculina).

Es la edición compacta de pivo-ptbr: reduce la anchura del modelo acústico de 96 a 64 y cuantiza cada peso entre 5 y 8 bits en lugar de 32, asignando más bits a las capas más sensibles. El resultado es un modelo que corre en CPU, en Apple Silicon mediante MLX (aproximadamente 24 veces el tiempo real en un M4) y en el navegador con ONNX Runtime Web, sin PyTorch, sin modelo profesor, sin codificador de voz y sin conexión de red durante la inferencia.

Su relevancia radica en demostrar que un pipeline TTS funcional y comprensible puede reducirse a menos de un megabyte, lo que habilita síntesis de voz totalmente local en dispositivos con recursos muy limitados y con garantías de privacidad (nada de lo que se escribe sale del dispositivo). Es un modelo declarado explícitamente como de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico propio (SemFence) + vocoder FARGAN (congelado, de PiVo) |
| Parametros totales | 1.086.678 (270.081 acústico + 816.597 vocoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos de 5 a 8 bits con más bits en capas sensibles; ONNX en int8 con escala por canal |
| Idiomas soportados | Portugués de Brasil (pt-BR) exclusivamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.bin` propietario (MLX), ONNX (encoder, decoder, conditioning, vocoder_step) |

## Arquitectura y entrenamiento

El sistema se compone de dos etapas. La primera es un modelo acústico de 270.081 parámetros, entrenado desde cero por SemFence, que predice las características de la voz a partir del texto fonemizado. La segunda es un vocoder FARGAN de 816.597 parámetros, congelado y procedente de PiVo-1.4M, que transforma esas características en audio mono de 16 kHz. La edición pingo-ptbr reduce la anchura del modelo acústico a 64 (frente a 96 en pivo-ptbr) y aplica cuantización mixta de 5 a 8 bits por peso, con asignación no uniforme de bits según la sensibilidad de cada capa.

El entrenamiento se apoya en dos conjuntos de datos publicados por el autor: `semfence/ptbr-synthetic-speech` y `semfence/ptbr-sentences`. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La inferencia no requiere PyTorch, modelo profesor, codificador de voz ni conexión de red. Los grafos ONNX exportados replican los pesos del `.bin` en int8 con escala por canal, expandidos mediante un nodo `DequantizeLinear`; el autor advierte que deben cargarse con optimización `basic`, ya que los niveles `extended`/`all` fusionan ese nodo con un núcleo int8 que degrada la precisión (error de 0,02 en el encoder).

## Capacidades

- Síntesis de voz en portugués de Brasil con dos voces: F_s4 (femenina) y M_sm4 (masculina).
- Generación de audio mono PCM float32 a 16 kHz.
- Control de velocidad de habla mediante el parámetro `speed` (por ejemplo, 1.1).
- Lectura correcta de números, fechas y moneda en formato brasileño (15h30, 14/03/2026, R$ 1.250,50).
- Entonación de interrogaciones y exclamaciones (las muestras de ejemplo incluyen frases de pregunta).
- Fonemización mediante `dizione-ptbr-js` en el entorno web.
- Ejecución local completa: sin conexión de red, sin PyTorch y sin codificador de voz durante la inferencia.
- Despliegue en CPU, en Apple Silicon vía MLX y en navegador vía ONNX Runtime Web (WASM).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Síntesis de voz en el navegador con privacidad total: la demo usa ONNX Runtime Web y el fonemizador `dizione-ptbr-js` para leer texto sin que este abandone el dispositivo, adecuado para aplicaciones de accesibilidad o lectura de contenido sensible.
- Lectura de importes, fechas y horas en aplicaciones financieras o de agenda en portugués de Brasil: el modelo está entrenado para verbalizar formatos como "R$ 1.250,50" o "15h30 do dia 14/03/2026", lo que lo hace útil en asistentes de banca o recordatorios.
- Prototipado rápido de interfaces de voz en Mac: con MLX en un M4 rinde a unas 24 veces el tiempo real, suficiente para iterar en el diseño de productos de voz sin infraestructura GPU.
- Sistemas embebidos y aplicaciones de recursos muy limitados: el archivo de pesos de 0,87 MB y los grafos ONNX de 1,3 MB permiten integrar TTS en entornos donde un modelo convencional no cabría.
- Investigación en TTS de bajo coste: sirve como referencia reproducible para estudiar cuantización mixta, destilación de vocoders y pipelines mínimos de síntesis, con pesos y código publicados.
- Generación de avisos hablados en aplicaciones de tecnología y startups: el repositorio incluye 15 frases de ese dominio (MVP, deploy, API, rondas de inversión) en ambas voces, pensadas para evaluar la naturalidad en ese registro.
- Demos educativas de procesamiento de voz: el ejemplo de exportación a ONNX y la verificación numérica de muestras (117.120 muestras, RMS 0,1322, pico 0,732 en Chromium) facilitan la docencia sobre cuantización y despliegue web.

## Benchmarks y rendimiento

| Metrica | pingo-ptbr F_s4 | pingo-ptbr M_sm4 | pingo-ptbr-w96 F_s4 | pingo-ptbr-w96 M_sm4 | pivo-ptbr (float32) F_s4 | pivo-ptbr (float32) M_sm4 |
|---|---:|---:|---:|---:|---:|---:|
| WER en MiniMax `pt` | 0,95% | 1,00% | 0,81% | 1,00% | 0,95% | 0,95% |
| Tamano del archivo de pesos | 0,87 MB | 0,87 MB | 1,09 MB | 1,09 MB | 5,6 MB | 5,6 MB |
| Parametros acustico + vocoder | 270.081 + 816.597 | 270.081 + 816.597 | 584.897 + 816.597 | 584.897 + 816.597 | 584.897 + 816.597 | 584.897 + 816.597 |

El autor no publica resultados de benchmarks estandar de TTS (MOS, MCD, RTF medido formalmente) mas alla del WER sobre el conjunto MiniMax `pt`. La velocidad indicada es aproximada: unas 24 veces el tiempo real en un Apple M4 con MLX.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo completo ocupa 0,87 MB de pesos y los grafos ONNX 1,3 MB, por lo que cabe en memoria de CPU y en cualquier GPU con unos pocos megabytes libres.
- GPU recomendadas: no requiere GPU. Funciona en CPU en cualquier plataforma; en Apple Silicon se acelera con MLX (M1, M2, M3, M4 y posteriores).
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: MLX en macOS con Apple Silicon (librería `mlx`), ONNX Runtime Web con WASM en navegador (Chromium verificado), y Python 3.10 o superior con las dependencias del repositorio (`requirements.txt`).
- Latencia y throughput: aproximadamente 24 veces el tiempo real en un M4 con MLX; el resto de plataformas no tiene cifras publicadas.
- En navegador se debe usar la optimización `basic` de ONNX Runtime para evitar la pérdida de precisión del núcleo int8 fusionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (MiniMax pt) | Licencia | Despliegue |
|---|---|---:|---:|---|---|
| pingo-ptbr | 1.086.678 | No disponible | 0,95% / 1,00% | CC-BY-4.0 | MLX, ONNX Web, CPU |
| pingo-ptbr-w96 | 1.401.494 | No disponible | 0,81% / 1,00% | CC-BY-4.0 | MLX, ONNX Web, CPU |
| pivo-ptbr (float32) | 1.401.494 | No disponible | 0,95% / 0,95% | No disponible en la información | MLX, CPU |

No se dispone en la información proporcionada de comparaciones con otros sistemas TTS en portugués de Brasil (por ejemplo, modelos comerciales o de mayor tamano); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Solo portugués de Brasil: no lee portugués europeo ni ninguna otra lengua.
- Calidad de audio limitada: el vocoder de 16 kHz produce un sonido de "llamada telefónica" con una textura ligeramente metálica, según el propio autor.
- Modelo declarado de investigación: no se han medido ni publicado métricas subjetivas de naturalidad (MOS) ni otras evaluaciones formales mas alla del WER.
- Riesgo de errores de pronunciación en palabras fuera del dominio de entrenamiento (tecnología, nombres propios, extranjerismos) no cuantificado en la información disponible.
- No se documentan sesgos demográficos ni acústicos específicos; al ser un modelo entrenado con datos sintéticos, puede reproducir las características de las voces de síntesis empleadas.
- Uso comercial permitido por la licencia CC-BY-4.0, que exige atribución; conviene revisar las condiciones de los datasets de entrenamiento y del vocoder FARGAN de origen (PiVo) antes de un despliegue en producción.
- En navegador, usar optimización `basic` en ONNX Runtime: los niveles `extended`/`all` degradan la precisión del `DequantizeLinear`.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y la librería declarada es MLX, lo que limita el ecosistema de herramientas disponibles.
- No dispone de soporte de tool calling, agentes ni multimodalidad; es exclusivamente un sintetizador de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semfence/pingo-ptbr
- Demo en navegador: https://huggingface.co/spaces/semfence/pingo-ptbr-demo
- Edición de mayor anchura: https://huggingface.co/semfence/pivo-ptbr
- Vocoder de origen PiVo: https://huggingface.co/empero-ai/PiVo-1.4M
- Dataset de voz sintética: https://huggingface.co/datasets/semfence/ptbr-synthetic-speech
- Dataset de frases: https://huggingface.co/datasets/semfence/ptbr-sentences
- Fonemizador JavaScript: https://github.com/SemFence/dizione-ptbr-js
- Sitio del autor: https://semfence.com
