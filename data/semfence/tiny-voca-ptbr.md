# semfence/tiny-voca-ptbr

## Resumen

tiny-voca-ptbr es un modelo de síntesis de voz (text-to-speech) en portugués de Brasil desarrollado por SemFence, con el investigador Gustavo Toledo como responsable. Se trata de una adaptación de la receta del modelo tiny-voca de Muhammed Nazeem al portugués brasileño, entrenada desde cero sin pesos preentrenados. Con solo 4.533.259 parámetros (incluyendo el generador de onda), el modelo está diseñado para inferencia en entornos con recursos muy limitados: CPU, GPU de Mac vía Metal/MPS y navegador mediante WebGPU o WASM.

El modelo ofrece dos voces sintéticas, `F_s4` (femenina) y `M_sm4` (masculina), y produce audio mono a 24 kHz. La entrada es texto que se convierte en fonemas mediante el fonemizador dizione-ptbr, con un alfabeto de 55 símbolos. Fue entrenado con 24,7 horas de habla sintética procedente de los datasets `semfence/ptbr-synthetic-speech` y `semfence/ptbr-sentences`.

Su relevancia radica en demostrar que es posible obtener TTS inteligible en una lengua concreta con un presupuesto de parámetros mínimo y ejecución completamente local en el navegador, sin enviar texto a servidores externos. Está publicado bajo licencia Apache-2.0 con pesos en PyTorch y ONNX, lo que facilita su integración en aplicaciones web y de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS entrenado desde cero; receta tiny-voca) |
| Parametros totales | 4.533.259 (incluye generador de onda) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una frase por vez; texto de cualquier tamaño se segmenta) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | portugués de Brasil (pt-BR) exclusivamente |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, float32) y ONNX (`.onnx`, float32, opset 17) |
| Voces | `F_s4` (femenina), `M_sm4` (masculina), sintéticas |
| Frecuencia de salida | 24 kHz, mono |
| Entrada | Texto convertido a fonemas (55 símbolos) por dizione-ptbr |
| Paso de entrenamiento | 104.000 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna concreta (capas, tipo de decoder o diseño del generador de onda); la model card solo indica que sigue la receta del modelo tiny-voca y que el modelo completo, incluyendo el generador de onda, suma 4.533.259 parámetros. El modelo se entrenó desde cero, sin pesos preentrenados, durante 104.000 pasos, sobre 24,7 horas de habla sintética en portugués de Brasil procedente de los datasets `semfence/ptbr-synthetic-speech` y `semfence/ptbr-sentences`.

La entrada de texto pasa por el fonemizador dizione-ptbr, que produce una representación de 55 símbolos y cuenta con implementaciones en Python y TypeScript con salida idéntica, lo que garantiza consistencia entre el entrenamiento y el despliegue en navegador. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil, con salida de audio mono a 24 kHz.
- Dos voces sintéticas seleccionables: `F_s4` (femenina) y `M_sm4` (masculina).
- Control de velocidad de habla mediante el parámetro `--speed` (valor por defecto 1,0).
- Ajuste de tono mediante `--pitch-shift` (sumado al log de F0; 0,058 equivale aproximadamente a un semitono) y `--pitch-range` (varía la dispersión del tono en torno a la media).
- Procesamiento de texto de cualquier longitud: el comando lee una frase por vez y concatena el audio resultante.
- Ejecución en CPU, GPU de Mac (Metal/MPS), CUDA y navegador (WebGPU o WASM), lo que permite inferencia totalmente local.
- Manejo de texto con números, fechas y moneda en los ejemplos publicados (por ejemplo, "15h30", "14/03/2026", "R$ 1.250,50").
- No dispone de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es un modelo puramente de texto a voz.

## Casos de uso

- Lectura por voz en aplicaciones web: integrado vía ONNX y WebGPU/WASM, el modelo puede leer contenido directamente en el navegador sin enviar el texto a un servidor, lo que resulta adecuado para aplicaciones de accesibilidad y privacidad por diseño.
- Asistentes de voz locales en portugués de Brasil: al ejecutarse en CPU y ocupar un repositorio de 0,1 GB, puede embeberse en aplicaciones de escritorio o móviles para dar respuestas habladas sin conexión.
- Sistemas de anuncios y notificaciones: la API de línea de comandos permite generar avisos hablados a partir de texto dinámico (por ejemplo, recordatorios de reuniones o vencimientos de pago), con control de velocidad y tono para adaptar el estilo.
- Prototipado rápido de interfaces de voz: los dos timbres disponibles y los parámetros de pitch permiten validar experiencias conversacionales en pt-BR con un coste computacional mínimo antes de invertir en modelos mayores.
- Generación de audio para contenidos educativos o de divulgación: el modelo procesa frases largas y textos de cualquier tamaño, por lo que puede narrar lecciones o artículos por segmentos y concatenar el resultado.
- Pruebas automatizadas de pipelines de audio: al ser determinista en su interfaz y ofrecer pesos con SHA256 publicado, sirve como componente de referencia en tests de integración de sistemas TTS en entornos CI.
- Demostraciones interactivas en el navegador: el Space oficial demuestra la viabilidad de ofrecer TTS en pt-BR sin backend, un patrón reutilizable en documentación técnica y demos de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un informe de evaluación completo en `eval/report.json` con WER por clip y transcripciones, pero no se incluyen las cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 4,5 millones de parámetros en float32 (18,2 MB en PyTorch, 21,4 MB en ONNX) el modelo es extremadamente ligero y puede ejecutarse en memoria de sistema sin GPU dedicada.
- GPU recomendadas: no se especifican modelos concretos; la model card indica soporte para CPU, GPU de Mac vía Metal/MPS y CUDA (`--device cuda`).
- Compatibilidad con GPU de consumo: sí, por tamaño; cualquier GPU de consumo con soporte CUDA o Metal puede alojarlo, aunque no se publican requisitos mínimos ni cifras de latencia.
- Despliegue: inferencia vía PyTorch (`python -m tiny_voca.infer`), exportación ONNX (opset 17) para ejecución en navegador con WebGPU o WASM, y el paquete `dizione-ptbr` para la fonemización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| tiny-voca-ptbr | 4.533.259 | no disponible | pt-BR | Apache-2.0 | PyTorch, ONNX |
| tiny-voca (n4ze3m) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Alternativas TTS comerciales o de mayor tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite establecer la relación de derivación con tiny-voca de Muhammed Nazeem, cuya receta se aplica al portugués de Brasil. No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en portugués de Brasil: la model card advierte explícitamente que no sirve para portugués de Portugal ni para otras lenguas.
- Las voces son sintéticas y el entrenamiento se realizó íntegramente con habla sintética (24,7 horas), lo que puede limitar la naturalidad y la expresividad frente a modelos entrenados con voz humana.
- Solo hay dos timbres disponibles (`F_s4` y `M_sm4`), sin control de emoción ni de estilo más allá de velocidad, pitch shift y pitch range.
- Riesgo de errores de pronunciación en palabras fuera del dominio cubierto por el fonemizador o en textos con abreviaturas y símbolos no contemplados.
- No se publican cifras de WER en la información disponible, por lo que el rendimiento objetivo en producción no puede verificarse sin consultar `eval/report.json`.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (`semfence/ptbr-synthetic-speech` y `semfence/ptbr-sentences`) antes de un despliegue en producción.
- El modelo no incluye capacidades de razonamiento, tool calling ni procesamiento de audio de entrada; cualquier uso conversacional requiere un componente adicional de ASR y de gestión de diálogo.
- No se documentan sesgos específicos ni limitaciones de contexto más allá de la segmentación por frases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/semfence/tiny-voca-ptbr
- Demo en el navegador: https://huggingface.co/spaces/semfence/tiny-voca-ptbr-demo
- Código: https://github.com/SemFence/tiny-voca-ptbr
- Fonemizador (Python): https://github.com/SemFence/dizione-ptbr
- Fonemizador (TypeScript): https://github.com/SemFence/dizione-ptbr-js
- Dataset de habla sintética: https://huggingface.co/datasets/semfence/ptbr-synthetic-speech
- Dataset de frases: https://huggingface.co/datasets/semfence/ptbr-sentences
- Modelo original tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
