# jeffmhopkins/stable-audio-open-1.0-onnx

## Resumen

Stable Audio Open 1.0 en formato ONNX es una conversión del modelo de generación de audio a partir de texto de Stability AI, realizada por el desarrollador jeffmhopkins. El objetivo de esta conversión es permitir la ejecución del modelo con ONNX Runtime de forma aislada, sin necesidad de PyTorch ni de un entorno Python, lo que facilita su integración en aplicaciones nativas. El modelo original genera clips de audio estéreo a 44,1 kHz a partir de descripciones textuales, y esta versión se emplea como motor del plugin de batería JKit, que descarga los ficheros en el primer uso.

La arquitectura combina un codificador de texto T5-base, un transformer de difusión (DiT) de 1,06 mil millones de parámetros y el decodificador de un autoencoder, distribuidos en tres grafos ONNX independientes. El repositorio ocupa 4,8 GB e incluye los pesos en fp32 para el DiT y fp16 para el codificador de texto, además del tokenizador y el script de exportación.

La relevancia de esta ficha radica en que ofrece una vía de despliegue del modelo de audio de Stability AI fuera del ecosistema PyTorch, con grafos verificados frente al modelo original con un error de aproximadamente 3e-6 en el DiT y 2e-3 en el codificador de texto. La licencia es la Stability AI Community License, que restringe el uso comercial a organizaciones con ingresos anuales inferiores a un millón de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con codificador de texto T5-base y decodificador de autoencoder |
| Parametros totales | 1,06 mil millones (solo el DiT); el total del pipeline no esta desglosado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de texto (input_ids [1, 128]) |
| Tipos de cuantizacion | fp32 (DiT) y fp16 (codificador de texto); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | stability-ai-community-license |
| Formato de pesos | ONNX (cond.onnx, dit.onnx + dit.onnx.data, dec.onnx) |

## Arquitectura y entrenamiento

El pipeline se divide en tres grafos ONNX. El primero, `cond.onnx`, contiene el codificador de texto T5-base en fp16 junto con los condicionadores de duración (`seconds_total` y `seconds_start`, este último fijado a 0), y produce las representaciones `cross` [1, 130, 768] y `global` [1, 1536]. El segundo, `dit.onnx`, es el transformer de difusión de 1,06 mil millones de parámetros en fp32, con objetivo v y `t` en el rango [0, 1], que opera sobre latentes de 64 canales y cualquier número de frames latentes (cada frame equivale a 2048 muestras de audio). El tercero, `dec.onnx`, es el decodificador del autoencoder, que transforma los latentes en audio estéreo a 44,1 kHz.

El muestreo que emplea JKit sigue DPM-Solver++(2M) sobre un schedule log-lineal de sigma 500 a 0,3 (y luego 0), con los escalados de predicción v de k-diffusion (`c_in = 1/sqrt(s^2+1)`, `t = atan(s) 2/pi`, `denoised = x/(s^2+1) - v s/sqrt(s^2+1)`), 50 pasos y guidance 7. La guía libre de clasificador se implementa como dos ejecuciones del DiT, la segunda con `cross` a ceros. No se documentan en la información disponible los datos de entrenamiento del modelo original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de audio estéreo a 44,1 kHz a partir de descripciones textuales, con control de duración mediante el condicionador `seconds_total`.
- Generación de clips de longitud variable, ya que el DiT acepta cualquier número de frames latentes L.
- Ejecución sin PyTorch ni Python, únicamente con ONNX Runtime.
- Integración en aplicaciones nativas como el plugin de batería JKit.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- El soporte multilingüe no está especificado en la información disponible; el tokenizador es el de google-t5/t5-base.

## Casos de uso

- Generación de samples de batería en producción musical: el modelo puede sintetizar clips de percusión a partir de descripciones textuales, integrándose en el plugin JKit que descarga los grafos ONNX en el primer uso.
- Herramientas de creación musical asistida por texto: un DAW podría incorporar el pipeline para generar ideas rápidas de audio sin requerir un entorno Python, gracias a la ejecución con ONNX Runtime.
- Aplicaciones de escritorio nativas: al no depender de PyTorch, el modelo puede embeberse en aplicaciones C++ o Rust que enlacen ONNX Runtime directamente.
- Prototipado de efectos de sonido: el control de duración mediante `seconds_total` permite generar clips de longitud ajustable para pruebas de diseño sonoro.
- Servicios de generación de audio bajo demanda: el pipeline de tres grafos puede orquestarse en un servidor con ONNX Runtime para atender peticiones de texto a audio.
- Investigación en modelos de difusión de audio: los grafos exportados y el script `export.py` permiten estudiar la conversión y el muestreo con k-diffusion sin depender del stack de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 4,8 GB; el DiT en fp32 supone 4,23 GB, el decodificador 312 MB y el codificador de texto 221 MB.
- La VRAM estimada para inferencia debe cubrir al menos los pesos del DiT en fp32 más las activaciones de los latentes; no se proporciona una cifra concreta en la información disponible.
- No se especifican GPU recomendadas (A100, H100, RTX 4090, etc.) en la información disponible.
- No se confirma si cabe en GPU de consumo; el tamaño del DiT en fp32 (4,23 GB) sugiere que podría residir en GPUs con 8 GB o más, pero no hay dato oficial.
- Opciones de despliegue: ONNX Runtime exclusivamente, según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| jeffmhopkins/stable-audio-open-1.0-onnx | 1,06 B (DiT) | 128 tokens de texto | ONNX | stability-ai-community-license | Conversion ONNX del modelo de Stability AI; ejecutable sin PyTorch |
| stabilityai/stable-audio-open-1.0 | 1,06 B (DiT) | 128 tokens de texto | safetensors | stability-ai-community-license | Modelo original en PyTorch; referencia de la conversion |
| Otras alternativas de texto a audio | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia Stability AI Community License restringe el uso comercial a individuos y organizaciones con ingresos anuales inferiores a un millón de dólares; para usos comerciales superiores debe consultarse https://stability.ai/license.
- El modelo original puede presentar sesgos derivados de sus datos de entrenamiento, aunque no se detallan en la información disponible.
- Riesgo de alucinación sonora: el modelo puede generar audio que no se corresponda fielmente con la descripción textual, especialmente en descripciones ambiguas.
- La longitud de contexto de texto está limitada a 128 tokens, lo que restringe la complejidad de las descripciones.
- El soporte de idiomas no está especificado; el tokenizador T5-base es multilingüe, pero no se confirma el rendimiento en castellano.
- La conversión ONNX solo se ha verificado contra el modelo PyTorch con un error de 3e-6 (DiT) y 2e-3 (codificador fp16); no se documentan pruebas en producción más allá del plugin JKit.
- No se ofrecen cuantizaciones alternativas (por ejemplo, int8) que reduzcan el tamaño del DiT en fp32.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jeffmhopkins/stable-audio-open-1.0-onnx
- Modelo base: https://huggingface.co/stabilityai/stable-audio-open-1.0
- Plugin JKit: https://github.com/jeffmhopkins/Jclap/tree/main/plugins/jkit
- Licencia de Stability AI: https://stability.ai/license
- Tokenizador T5: https://huggingface.co/google-t5/t5-base
