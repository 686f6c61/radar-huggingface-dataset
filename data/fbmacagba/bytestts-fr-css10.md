# fbmacagba/bytestts-fr-css10

## Resumen

BytesTTS voice fr-css10 es una voz de sintesis de voz (TTS) en frances, monoaltavoz, empaquetada como modelo ONNX para el motor BytesTTS. No es un modelo entrenado desde cero: es la conversion a ONNX del modelo `tts_models/fr/css10/vits` de Coqui TTS, que Coqui atribuye a Neongecko.com Inc. (@NeonGeckoCom) y que fue entrenado sobre el corpus CSS10 French. Los pesos estan convertidos, no reentrenados, y el autor verifica la equivalencia numerica con la implementacion original.

El modelo emplea la arquitectura VITS (paper arXiv:2106.06103), un sistema TTS end-to-end condicional de tipo VAE con alineamiento monotono y decodificador generativo, que sintetiza forma de onda directamente a partir de texto sin pipeline separado de fonemas. El artefacto ocupa unos 0,1 GB en el repositorio, con un unico fichero `model.onnx` de 70.926.577 bytes, y genera audio mono a 22.050 Hz.

Su relevancia es acotada pero practica: ofrece una voz francesa de dominio publico (datos CSS10, CC0) con licencia permisiva BSD-3-Clause, ejecutable en ONNX sin dependencia de espeak-ng, lo que simplifica el despliegue en entornos embebidos o serverless. Es un componente de inferencia, no un modelo de lenguaje: no razona, no conversa y no procesa texto libre mas alla de la lectura literal de caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (TTS end-to-end, VAE condicional con alineamiento monotono y decodificador de forma de onda) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS por enunciado) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx` de 70.926.577 bytes) |
| Idiomas soportados | frances (fr) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`model.onnx`), acompanado de `config.json`, `speakers.json` y `voice.json` |
| Frecuencia de muestreo | 22.050 Hz, mono |
| Altavoces | 1 (`gilles`, por defecto) |
| Entrada | caracteres (no fonemas); no requiere espeak-ng |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

VITS combina un encoder de texto, un modulo de alineamiento monotono basado en busqueda (MAS) y un decoder generativo de forma de onda, todo entrenado de forma conjunta como un VAE condicional con adversarial training. Esto permite sintesis end-to-end sin vocoder externo ni lexico fonetico intermedio. En esta ficha concreta, la voz lee caracteres en lugar de fonemas, por lo que el modelo no depende de espeak-ng ni de un G2P separado.

El entrenamiento original corresponde a Coqui TTS sobre el dataset CSS10 French, compuesto por audiolibros de LibriVox leidos por Gilles G. Le Blanc, en dominio publico, con dedicatoria CC0-1.0 de Kyubyong Park y Thomas Mulc (Interspeech 2019). El proceso de esta ficha es exclusivamente de conversion: el checkpoint `tts_models--fr--css10--vits.zip` de la release `v0.8.0_models` de Coqui (SHA-256 `e946732aaef60b3e6462064b5f0e0286bc48ffa324474d0bde578ba60e566219`) se abrio en un sandbox aislado sin red, tras un escaneo de pickle, con `torch.load(weights_only=True)`. Cada peso se verifico contra el port en PyTorch de VITS de BytesTTS y se exporto a ONNX desde safetensors.

La validacion reportada por el autor es cuantitativa: el port coincide con la salida de Coqui TTS con duraciones identicas y una relacion senal-error de al menos 60 dB, y el modelo ONNX coincide con el port con duraciones identicas y al menos 50 dB. No se documentan datos de RLHF, DPO ni ajuste fino adicional, ya que no aplica a un modelo TTS.

## Capacidades

- Sintesis de voz en frances a partir de texto, con salida mono a 22.050 Hz.
- Voz monoaltavoz identificada como `gilles`, seleccionable como altavoz por defecto.
- Lectura a nivel de caracter, sin necesidad de espeak-ng ni de conversion grafema-fonema externa.
- Carga verificada por SHA-256 de cada fichero contra el manifiesto `voice.json`.
- Integracion via CLI (`bytestts say`) y API Python (`BytesTTS.load`, `BytesTTS.load_path`, `synthesize`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje.
- No soporta vision ni audio de entrada; solo genera audio.
- No lee digitos: su alfabeto no los incluye y se omiten en la sintesis.
- Las apostrofes tipograficas (’) se leen como `'`.

## Casos de uso

- **Lectura de contenidos en frances para accesibilidad**: narracion de articulos o documentos en frances con una voz de dominio publico y licencia permisiva, adecuada para integrarse en lectores de pantalla o servicios de audio bajo demanda.
- **Generacion de avisos y locuciones pregrabadas**: produccion por lotes de ficheros WAV para menus telefonicos, anuncios de estaciones o mensajes de sistema, escribiendo los numeros como palabras ("deux euros cinquante") para evitar la omision de digitos.
- **Prototipado rapido de interfaces de voz**: al ejecutarse en ONNX sin espeak-ng, se puede desplegar en entornos serverless o embebidos con dependencias minimas para validar flujos de voz antes de invertir en un TTS comercial.
- **Sintesis offline en dispositivos con recursos limitados**: el artefacto de 70,9 MB y el runtime ONNX permiten inferencia local en hardware modesto, util para aplicaciones de escritorio o moviles con requisitos de privacidad.
- **Generacion de audio para pruebas de pipelines de ASR**: crear corpus sinteticos controlados en frances para evaluar sistemas de reconocimiento de voz, con la salvedad de que la voz es unica y no representa variabilidad de hablantes.
- **Doblaje o narracion de material formativo**: locucion de guiones en frances para cursos o tutoriales, manteniendo la atribucion exigida por la licencia BSD-3-Clause y la procedencia de los datos CSS10.
- **Integracion en herramientas de desarrollo**: uso del CLI `bytestts say` dentro de scripts de build para generar recursos de audio de forma reproducible, con verificacion SHA-256 de los ficheros de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de equivalencia con la implementacion de referencia: relacion senal-error de al menos 60 dB entre el port en PyTorch y Coqui TTS, y de al menos 50 dB entre el modelo ONNX y el port, en ambos casos con duraciones identicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero ONNX de 70,9 MB sugiere un consumo de memoria bajo, del orden de cientos de MB incluyendo buffers del runtime, aunque no se documenta una cifra concreta.
- GPU recomendadas: no disponible; al ser un modelo ONNX de ~71 MB, cualquier GPU con soporte de ONNX Runtime deberia ser suficiente, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del artefacto, aunque no se aporta una lista verificada de tarjetas.
- Opciones de despliegue: ONNX Runtime a traves de la libreria BytesTTS (`pip install "bytestts @ git+https://github.com/jared0565/bytesTTS"`), con carga por CLI o API Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Altavoces | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BytesTTS fr-css10 (esta ficha) | VITS | fr | 1 (`gilles`) | ONNX | BSD-3-Clause | Hugging Face, repo de 0,1 GB |
| Coqui TTS `tts_models/fr/css10/vits` | VITS | fr | 1 | Checkpoint PyTorch (Coqui) | BSD-3-Clause | Release `v0.8.0_models` de Coqui |
| neongeckocom/tts-vits-css10-fr | VITS | fr | 1 | no disponible | BSD-3-Clause | Hugging Face |

La comparativa se limita a la misma familia de pesos, ya que no se dispone de datos de otros modelos TTS franceses en la informacion proporcionada. No se dispone de comparaciones de calidad subjetiva (MOS) ni de latencia entre estas variantes.

## Limitaciones y advertencias

- **No lee digitos**: el alfabeto del modelo no los incluye y se omiten silenciosamente; es obligatorio escribir los numeros como palabras.
- **Una sola voz**: no hay variabilidad de hablantes; el modelo solo habla como el locutor de entrenamiento (`gilles`).
- **Idioma unico**: solo frances; no soporta otros idiomas ni cambios de codigo.
- **Riesgo de suplantacion**: el autor advierte explicitamente de no usar la voz para enganar a personas; al ser una voz clonada de un locutor real de LibriVox, su uso debe limitarse a fines legitimos.
- **Alucinacion en TTS**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio, aunque no se documentan tasas concretas.
- **Licencia**: BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright de Neongecko.com Inc. y la atribucion de los datos CSS10 y LibriVox; el autor indica que ni Coqui ni Neon incluyen linea de copyright y que el titular citado es el que Neon nombra en su propia licencia.
- **Sin afiliacion**: BytesTTS no esta afiliado ni respaldado por Neongecko.com Inc., Coqui ni los autores de CSS10.
- **Verificacion de integridad**: la carga comprueba cada fichero contra `voice.json`; modificar los artefactos invalida esa verificacion.
- **Sin datos de rendimiento**: no hay benchmarks publicos ni cifras de latencia o throughput, lo que dificulta estimar costes en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbmacagba/bytestts-fr-css10
- Repositorio de BytesTTS: https://github.com/jared0565/bytesTTS
- Paper de VITS: https://arxiv.org/abs/2106.06103
- Modelo original de Neongecko: https://huggingface.co/neongeckocom/tts-vits-css10-fr
- Dataset CSS10 French: https://www.kaggle.com/datasets/bryanpark/french-single-speaker-speech-dataset
- Paper de CSS10: Park, Kyubyong y Mulc, Thomas (2019), Interspeech.
