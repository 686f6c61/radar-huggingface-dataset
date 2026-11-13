# Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4-w4a16

## Resumen

Llama 3.2 1B Instruct Tenstorrent bf8/bf4 es una cuantización específica del modelo meta-llama/Llama-3.2-1B-Instruct, publicada por el usuario Qubitium, que convierte los pesos del decodificador a los formatos de bloque flotante nativos de Tenstorrent (`bf8_b` y `bf4_b`). No se trata de una re-codificación de int4 sobre esa rejilla, sino de una resolución GPTQ con realimentación de error directamente sobre la rejilla de bloques flotantes de Tenstorrent. El checkpoint mantiene el diseño estándar de Hugging Face: tres shards `model-*-of-00003.safetensors` más un índice, sin ficheros auxiliares ni manifiestos laterales.

El modelo base es un transformer decoder de 1B parámetros con 16 capas, y el checkpoint cuantizado declara 2.011.924.706 parámetros totales en sus safetensors. La innovación principal es el uso de anchuras mixtas: 81 de los 113 módulos cuantizados usan `bf8_b` (80 lineales del decodificador más el embedding y la cabeza atada) y 32 usan `bf4_b` (las proyecciones `gate_proj` y `up_proj` de cada una de las 16 capas). Esta decisión concentra el presupuesto de bits donde el error de salida es mayor.

Su relevancia es acotada pero clara: sirve como referencia para desplegar Llama 3.2 1B Instruct sobre hardware Tenstorrent con formatos nativos de bloque flotante, y demuestra un flujo GPTQ adaptado a una rejilla que no es compatible a nivel de bits con OCP MX ni con NVIDIA NVFP4. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que debe considerarse un artefacto experimental más que un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2), 16 capas, con pesos cuantizados en bloque flotante Tenstorrent |
| Parametros totales | 2.011.924.706 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GPTQ W4A16 con anchuras mixtas: `bf8_b` (6 bits de mantisa, 1 byte/peso) y `bf4_b` (2 bits de mantisa, ~2,8 bits efectivos); exponente compartido por bloque de 16 valores |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (3 shards + `model.safetensors.index.json`), con tensores `.codes` (uint8), `.exponents` (int8) y `.code_shape`; normas en float32 |
| Tamano del repo | 3,5 GB |
| Libreria | gptqmodel |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B Instruct: un transformer decoder con 16 capas, atención multi-cabeza con RoPE y un esquema de normalización RMSNorm. Sobre esa base, el checkpoint sustituye las lineales del decodificador por pesos en formato de bloque flotante de Tenstorrent. La reconstrucción es aritmética exacta mediante `value = (code - (2*levels - 1)) / levels * 2**exponent`, con `levels = 4` para `bf4_b` y `levels = 64` para `bf8_b`, y un exponente compartido por cada bloque de 16 valores a lo largo de la dimensión de entrada.

El proceso de cuantización emplea GPTQ con realimentación de error resuelto directamente sobre la rejilla de bloque flotante, usando la inversa de variable restante (el factor de Cholesky superior de `H⁻¹`) en lugar de `H⁻¹` directamente. Esta corrección del solver motivó una re-cuantización: los pesos actuales sustituyen a una subida anterior que medía peor en datos reservados. La calibración usa `neuralmagic/calibration`, fichero `llm.parquet`, configuración `LLM`, split `train`, con 256 registros. Las normas se almacenan en float32 para reproducir bit a bit el modelo cuantizado al recargar; el embedding se guarda como códigos `bf8_b` (266,16 MiB frente a 501,00 MiB en float16) y `lm_head` está atado a él, por lo que no se almacena por separado.

## Capacidades

- Generación de texto conversacional e instructiva, heredada de Llama 3.2 1B Instruct.
- Razonamiento básico y respuesta a preguntas simples; el ejemplo de la model card es una suma (`17 + 25`).
- Seguimiento de plantillas de chat mediante `apply_chat_template` del tokenizador.
- Generación determinista con `do_sample=False` y decodificación autorregresiva estándar.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo base es solo texto.
- Carga mediante `GPTQModel.load` o `AutoModelForCausalLM` con `trust_remote_code=True`.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint usa los formatos nativos `bf8_b` y `bf4_b` de `ttnn`, por lo que es adecuado para probar la pila de inferencia de Tenstorrent con pesos ya resueltos sobre esa rejilla, sin re-cuantizar en el dispositivo.
- Evaluación de cuantización de bloque flotante: sirve como referencia para comparar la calidad de GPTQ sobre rejilla Tenstorrent frente a cuantizaciones int4 convencionales del mismo modelo base, especialmente por la mezcla `bf8_b`/`bf4_b`.
- Prototipado de asistentes conversacionales ligeros: con 1B parámetros y pesos de ~1 byte, cabe en entornos con memoria limitada y permite iterar sobre plantillas de chat y prompts sin infraestructura grande.
- Pruebas de integración de `gptqmodel`: el repositorio documenta la ruta de carga con `GPTQModel.load` y la alternativa con `transformers`, útil para validar pipelines de carga de pesos cuantizados con código remoto.
- Investigación sobre formatos de bloque flotante: permite estudiar el impacto de compartir un exponente de 8 bits por cada 16 valores y compararlo con OCP microscaling (escala E8M0 por 32 valores) y NVFP4 (escala FP8 por 16).
- Docencia y experimentación con cuantización GPTQ: el desglose de módulos por anchura (80 lineales en `bf8_b`, 32 en `bf4_b`) y el detalle del solver lo convierten en un caso de estudio concreto de asignación de bits por capa.
- Generación de texto de bajo coste en entornos de prueba: al ser un modelo de 1B con licencia Llama 3.2, puede usarse para validar flujos de generación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparación cualitativa con una subida anterior ("measured worse on held-out data") tras la corrección del solver, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio ocupa 3,5 GB y los pesos cuantizados usan aproximadamente 1,0625 bytes/peso en `bf8_b` y 0,5625 bytes/peso en `bf4_b`, con normas en float32; el embedding en `bf8_b` son 266,16 MiB.
- GPU recomendadas: no disponibles en la información proporcionada. El formato está orientado a hardware Tenstorrent, no a GPU convencionales.
- Compatibilidad con GPU de consumo: no confirmada. La ruta de carga documentada es `GPTQModel.load` o `transformers` con código remoto, no una ruta de inferencia optimizada para CUDA.
- Opciones de despliegue: `gptqmodel` (rama `feat/tenstorrent-investigation`), `transformers` con `trust_remote_code=True` y el fichero `modeling_tt_blockfloat.py` incluido en el repositorio. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4-w4a16 | 2.011.924.706 | no disponible | GPTQ W4A16 mixta `bf8_b`/`bf4_b` | llama3.2 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24B (modelo base) | no disponible en la información proporcionada | float16/bfloat16 original | llama3.2 | Hugging Face, modelo oficial |
| Cuantizaciones int4 GPTQ/AWQ de Llama-3.2-1B-Instruct | ~1,24B | no disponible | int4 GPTQ/AWQ | llama3.2 | Múltiples repositorios en Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados en la información proporcionada para este checkpoint ni datos de calidad frente a las alternativas int4.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`; sin él, `from_pretrained` no lanza error, deja las lineales del decodificador con valores aleatorios y el modelo genera basura.
- La ruta de carga recomendada depende de una rama no estable de `gptqmodel` (`feat/tenstorrent-investigation`), lo que añade riesgo de reproducibilidad.
- Los formatos `bf8_b` y `bf4_b` no son estándares de la industria y no son compatibles a nivel de bits con OCP microscaling ni con NVIDIA NVFP4; el uso fuera de Tenstorrent requiere validación específica.
- `bf4_b` conserva solo 2 bits de mantisa y se comporta como un formato de ~2,8 bits, aplicado a `gate_proj` y `up_proj`; es previsible una pérdida de calidad frente al modelo base, aunque no se han publicado métricas.
- Calibración con solo 256 registros, lo que puede limitar la robustez de la cuantización en dominios alejados de la distribución de calibración.
- Riesgo de alucinación inherente a un modelo de 1B parámetros, agravado por la cuantización agresiva.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base Llama 3.2.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe específica.
- Licencia Llama 3.2: el uso comercial está sujeto a los términos de la licencia de Meta, incluida la política de uso aceptable.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria ni evidencia de uso en producción.
- Contexto máximo no documentado en la información proporcionada; no debe asumirse el del modelo base sin verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Qubitium/llama3.2-1b-instruct-tenstorrent-bf8-bf4-w4a16
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Repositorio GPTQModel: https://github.com/ModelCloud/GPTQModel
- Dataset de calibración: https://huggingface.co/datasets/neuralmagic/calibration
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
