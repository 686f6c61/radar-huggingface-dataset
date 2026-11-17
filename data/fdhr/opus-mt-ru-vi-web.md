# fdhr/opus-mt-ru-vi-web

## Resumen

`fdhr/opus-mt-ru-vi-web` es una conversión a ONNX con cuantización int8 del modelo de traducción automática `Helsinki-NLP/opus-mt-ru-vi`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto del ruso al vietnamita y está empaquetado específicamente para ejecutarse en el navegador mediante Transformers.js, lo que permite inferencia local en cliente sin necesidad de servidor.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder seq2seq especializado en traducción, con un tamaño de repositorio de 0,1 GB tras la cuantización. El autor (fdhr) no ha reentrenado los pesos: se limita a exportar el modelo original a ONNX con `optimum-onnx` y a comprimirlo a int8 con los scripts de Transformers.js 3.7.6, separando el `lm_head` del embedding compartido para que el cuantizador lo trate como constante.

Su relevancia es acotada pero concreta: cubre el par lingüístico ruso-vietnamita en entornos web y móviles donde no se dispone de GPU ni de conexión fiable, un caso de uso típico en aplicaciones de traducción de frases (el autor lo usa en la app Notely). No aporta mejoras de calidad respecto al modelo base, sino una ruta de despliegue ligera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (q8) para ONNX |
| Idiomas soportados | ruso (ru) → vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX cuantizado (`decoder_model_merged_quantized.onnx`, `encoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-ru-vi` emplea la arquitectura Marian NMT, un transformer seq2seq con encoder y decoder, diseñado específicamente para traducción automática neuronal. Los pesos originales fueron entrenados por Jörg Tiedemann y colaboradores en el marco del proyecto OPUS-MT, utilizando corpus paralelos del ecosistema OPUS. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta versión concreta no introduce cambios en los pesos ni reentrenamiento alguno. La innovación técnica es puramente de despliegue: se separa el `lm_head` del embedding compartido para que el proceso de cuantización lo detecte como constante, se exporta con `optimum-onnx` 0.1.0 (transformers 4.57.6, torch 2.8.0) y se comprime con `scripts/quantize.py` de Transformers.js 3.7.6 en modo `q8`. El tokenizer se genera con `scripts/extra/marian.py` de la misma versión. El resultado son tres ficheros: `tokenizer.json` (7,0 MB), `onnx/decoder_model_merged_quantized.onnx` (86,9 MB) y `onnx/encoder_model_quantized.onnx` (49,3 MB).

## Capacidades

- Traducción de texto del ruso al vietnamita, orientada a frases y párrafos cortos.
- Ejecución íntegra en el navegador mediante Transformers.js con `dtype: 'q8'`, sin backend de inferencia remoto.
- Funcionamiento en dispositivos móviles, según el caso de uso declarado por el autor (app Notely).
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Cobertura multilingüe limitada estrictamente al par ru→vi; no traduce en sentido inverso ni a otros idiomas.

## Casos de uso

- Traducción de frases en aplicaciones web: integración directa con Transformers.js en el cliente para traducir texto ruso introducido por el usuario, sin enviar datos a un servidor y con una huella de red de aproximadamente 143 MB de pesos ONNX.
- Apps móviles offline: el tamaño cuantizado (0,1 GB de repositorio) permite empaquetar el modelo en aplicaciones híbridas o PWA para traducción sin conexión, tal como hace Notely.
- Traducción de mensajes en chats y formularios: al ser un modelo seq2seq de frases, encaja en la traducción de entradas cortas de usuario en tiempo real dentro de interfaces de mensajería.
- Procesamiento por lotes en el navegador: traducción de listas de cadenas (etiquetas, subtítulos cortos, descripciones de producto) en una Web Worker, aprovechando la ejecución local para evitar costes de API.
- Prototipado de pipelines de traducción: útil como referencia para validar la exportación ONNX int8 de modelos Marian antes de escalar a otros pares lingüísticos.
- Filtrado y normalización de contenido ru→vi en herramientas de moderación o búsqueda que necesiten una primera pasada de traducción local antes de un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal (inferencia en CPU vía WebAssembly/WebGPU en el navegador); los pesos int8 suman aproximadamente 136 MB en disco y una huella de memoria del orden de cientos de MB.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en cliente sin GPU dedicada.
- Cabe en GPU de consumo: sí, cualquier GPU con más de 1 GB de memoria libre podría cargarlo, aunque el diseño apunta a CPU/navegador.
- Opciones de despliegue: Transformers.js (principal), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de gran tamaño.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| fdhr/opus-mt-ru-vi-web | no disponible | no disponible | ru→vi | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-ru-vi | no disponible | no disponible | ru→vi | Apache-2.0 | safetensors/PyTorch |
| Otros modelos OPUS-MT ru→vi | no disponible | no disponible | ru→vi | Apache-2.0 | variable |

La comparación directa se limita al modelo base del que deriva, ya que no se dispone de datos de benchmarks ni de alternativas ru→vi con métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización int8 puede degradar la calidad de traducción respecto a los pesos originales en fp32; no se han publicado evaluaciones comparativas.
- Modelo entrenado exclusivamente para ru→vi; no cubre el sentido inverso ni otros pares lingüísticos.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, legal, médico) por la naturaleza del corpus OPUS, mayoritariamente genérico.
- Sesgos potenciales heredados de los corpus paralelos de OPUS, sin documentación específica sobre su mitigación.
- No apto para tool calling, agentes ni tareas de razonamiento; es un traductor seq2seq puro.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los corpus de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni mantenimiento documentado más allá de la fecha de creación (2026-11-17).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdhr/opus-mt-ru-vi-web
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ru-vi
- Transformers.js: https://github.com/huggingface/transformers.js
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
