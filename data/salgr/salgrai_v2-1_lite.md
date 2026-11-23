# salgr/SalgrAI_v2.1_Lite

## Resumen

SalgrAI-v2.1-Lite es un modelo de lenguaje conversacional en ruso de tamano muy reducido, desarrollado desde cero por un unico autor (salgr) sobre una unica GPU RTX 3060 de 12 GB. Con 24.874.368 parametros, 11 capas y una ventana de contexto de 1024 tokens, se posiciona como un experimento de entrenamiento from-scratch orientado al aprendizaje, demos y pruebas de concepto, no al uso en produccion. Es la actualizacion de SalgrAI-v2-Lite, con 400 millones de tokens adicionales de preentrenamiento (mas Wikipedia, subtitulos y codigo Python) y un conjunto de fine-tuning ampliado.

La arquitectura es un transformer decoder-only de estilo Llama (RMSNorm, RoPE con theta 10000, SwiGLU, sin biases y embeddings de entrada/salida atados), con vocabulario de 8192 tokens BPE byte-level. El modelo conversa en un registro informal de "ruso de Telegram en minusculas" y se distribuye en safetensors (float32), PyTorch state dict y GGUF float16 para llama.cpp.

Su relevancia es principalmente didactica y de investigacion: demuestra un pipeline completo de preentrenamiento, crecimiento de capas (de 6 a 11 insertando capas con proyecciones de salida inicializadas a cero) y fine-tuning supervisado en hardware de consumo. El propio autor advierte que el conocimiento factual es practicamente nulo (unas 3 respuestas correctas de 90 en su test de conocimiento) y que no dispone de filtro de seguridad ni de profanidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, RoPE theta 10000, SwiGLU, sin biases, embeddings atados) |
| Parametros totales | 24.874.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF float16 publicado; no se proporcionan variantes cuantizadas |
| Idiomas soportados | Ruso (algo de ingles, digitos y simbolos) |
| Licencia | no disponible (la model card indica que el autor debe elegir licencia antes de publicar) |
| Formato de pesos | safetensors (float32), pytorch_model.bin, GGUF (float16) |

Otros datos: 11 capas, hidden 384, 6 cabezas de atencion (dimension de cabeza 64), FFN 1202, vocabulario de 8192 tokens. Tamano del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo Llama con 11 capas, hidden de 384, 6 cabezas de atencion de dimension 64, FFN de 1202 y embeddings de entrada/salida atados. Usa RMSNorm, RoPE con theta 10000 y SwiGLU, sin terminos de bias. El tokenizador es un BPE byte-level de 8192 tokens entrenado sobre texto ruso e ingles; es ineficiente para codigo (aproximadamente 1,4 caracteres por token frente a unos 4 en ruso).

El entrenamiento se realizo desde inicializacion aleatoria en una RTX 3060 (12 GB) en bf16, sin usar pesos de terceros. La etapa 1 replico el esquema de v2-Lite: un modelo de 6 capas preentrenado y despues ampliado a 11 capas insertando capas con proyecciones de salida inicializadas a cero (el modelo ampliado producia exactamente los mismos logits), seguido de unos 300 millones de tokens de Wikipedia rusa (25%) y OpenSubtitles ruso (75%). La etapa 2, nueva en v2.1-Lite, anadio 400 millones de tokens (6103 pasos de 65.536 tokens, 67 minutos con torch.compile) con AdamW y learning rate de 3e-4 decaendo a 3e-5; la mezcla fue 12% Wikipedia anterior, 38% Wikipedia nueva, 33% subtitulos y 17% codigo Python. La perdida de validacion paso de 2,915 a 2,774 en Wikipedia, de 2,972 a 2,738 en Wikipedia nueva, se mantuvo en 2,974 en subtitulos y cayo de 2,341 a 0,907 en codigo. El corpus de codigo consistio en 24.720 ficheros Python (50,3 millones de tokens) de codeparrot-clean, solo con licencias permisivas (MIT, Apache-2.0, BSD-2/3-Clause, ISC, Unlicense, CC0-1.0), eliminando ficheros autogenerados y texto no ruso/no ASCII, conservando la indentacion. La etapa 3 de fine-tuning uso unas 19.000 conversaciones cortas (aproximadamente 9.800 dialogos de conversacion casual sinteticos, conocimiento simple, fundamentos de Python y datos sobre el propio modelo), con learning rate de 2e-4 a 2e-5, batch 32, dropout 0,1 y weight decay 0,05; se publica la epoca con mejor perdida de validacion (epoca 5, 2,284, perplejidad 9,8). La perdida se calcula solo sobre los tokens del asistente.

## Capacidades

- Generacion de texto conversacional en ruso con estilo informal ("ruso de Telegram en minusculas"), orientado a charla casual.
- Respuestas breves sobre conocimiento simple y fundamentos de Python, aunque con fiabilidad muy baja.
- Escritura de funciones Python cortas con forma sintacticamente correcta, si bien a menudo con la salida incorrecta.
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de 1024 tokens (el codigo de referencia descarta los turnos mas antiguos al llenarse el contexto).
- Formato de chat con tokens especiales `<|user|>`, `<|assistant|>` y `<|eos|>`.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No dispone de filtro de seguridad ni de profanidad.
- Capacidades multilingues muy limitadas: ruso como idioma principal, con algo de ingles, digitos y simbolos.

## Casos de uso

- Demostracion educativa de entrenamiento from-scratch: util para ilustrar un pipeline completo (preentrenamiento, crecimiento de capas, fine-tuning supervisado) en una unica GPU de consumo, con codigo original incluido en `original/`.
- Prototipado de chatbots de juguete en ruso: sirve para validar plantillas de prompt, formatos de chat y flujos de conversacion multi-turno antes de migrar a un modelo mayor.
- Pruebas de integracion con llama.cpp: el GGUF float16 permite verificar la carga, el servidor `llama-server` y el endpoint HTTP de completado en entornos locales sin GPU dedicada.
- Experimentos de tokenizacion: su vocabulario de 8192 tokens y su ineficiencia en codigo (1,4 caracteres por token) lo convierten en un caso de estudio para analizar el impacto del tokenizador en modelos pequenos.
- Evaluacion de tecnicas de ampliacion de modelos: el crecimiento de 6 a 11 capas con proyecciones a cero es reproducible con el codigo original y sirve para estudiar tecnicas de expansion de profundidad.
- Generacion de texto creativo informal en ruso: puede producir respuestas con tono coloquial para demos o prototipos de interfaz, siempre con revision humana.
- Banco de pruebas de inferencia comparativa: los tres formatos de pesos (safetensors, PyTorch y GGUF) estan verificados entre si, lo que permite comparar backends (transformers frente a llama.cpp) con resultados equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta cifras internas de validacion y de su propio test de conocimiento:

| Metrica | Antes (etapa 1) | Despues (etapa 2) |
|---|---|---|
| Perdida de validacion, Wikipedia | 2,915 | 2,774 |
| Perdida de validacion, Wikipedia nueva | 2,972 | 2,738 |
| Perdida de validacion, subtitulos | 2,965 | 2,974 |
| Perdida de validacion, codigo | 2,341 | 0,907 |
| Perdida de validacion, fine-tuning (epoca 5) | no disponible | 2,284 (perplejidad 9,8) |

Test de conocimiento propio del autor: aproximadamente 3 respuestas correctas de 90.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (24,9 millones de parametros, unos 100 MB de pesos) y aproximadamente 50 MB en float16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo fue entrenado en una RTX 3060 de 12 GB, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp (llama-server con el GGUF float16), PyTorch nativo con el codigo de `original/chat_example.py`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento de 400 millones de tokens requirio 67 minutos con torch.compile en una RTX 3060.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de tamano similar o proposito similar, sin datos de benchmarks:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SalgrAI-v2.1-Lite | 24,9 M | 1024 | Ruso | no disponible | safetensors, PyTorch, GGUF |
| SalgrAI-v2-Lite (version anterior) | no disponible | 1024 | Ruso | no disponible | no disponible |
| Modelos tiny de chat en ruso | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Conocimiento factual practicamente nulo: el autor reporta unas 3 respuestas correctas de 90 en su test de conocimiento.
- Alto riesgo de alucinacion: el modelo es demasiado pequeno para ser fiable y puede generar afirmaciones incorrectas con aparente seguridad.
- Generacion de codigo poco fiable: escribe funciones Python con forma correcta pero a menudo con la salida equivocada; el tokenizador es ineficiente para codigo (1,4 caracteres por token).
- Sin filtro de seguridad ni de profanidad: puede producir contenido inapropiado sin restricciones.
- Ventana de contexto muy limitada (1024 tokens), lo que restringe conversaciones largas y documentos extensos.
- Idioma practicamente limitado al ruso; el soporte de ingles es residual.
- Licencia no definida: la model card indica explicitamente que el autor debe elegir licencia antes de publicar, por lo que no se puede asumir permiso de uso comercial.
- La plantilla de chat de Hugging Face no escapa los tokens de servicio ni descarta turnos antiguos, a diferencia del codigo de referencia, lo que abre la puerta a inyeccion de tokens especiales.
- No apto para uso serio en produccion segun el propio autor; pensado para experimentos, demos y aprendizaje.
- Creado y actualizado en fechas de 2026 segun los metadatos del repositorio; sin descargas ni likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI_v2.1_Lite
- Version anterior: https://huggingface.co/salgr/SalgrAI-v2-Lite
- Dataset de codigo utilizado: https://huggingface.co/datasets/codeparrot/codeparrot-clean
