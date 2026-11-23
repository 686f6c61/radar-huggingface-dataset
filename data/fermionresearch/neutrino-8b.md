# FermionResearch/Neutrino-8B

## Resumen

Neutrino-8B es un modelo de lenguaje conversacional de 8.190.735.360 parámetros desarrollado por FermionResearch, derivado del modelo base Qwen/Qwen3-8B mediante un proceso de cuantización propietaria. Su principal singularidad es el formato de empaquetado: distribuye los pesos en un único contenedor binario de 3,875 GB (`neutrino-8b_v4.bin`) que se carga como un modelo nativo de `transformers` con una sola llamada a `from_pretrained`, además de ofrecer un transporte comprimido sin pérdidas de 2,56 GB (`.tv4z`) y un empaquetado GGUF para llama.cpp.

El modelo mantiene el tokenizador de Qwen3-8B (vocabulario de 151.936 tokens) y una longitud de contexto de 40.960 tokens. Se distribuye como modelo no-thinking: se entrega y se evalúa con `enable_thinking=False`, por lo que no expone cadena de razonamiento explícita. La arquitectura subyacente es la de Qwen3-8B (transformer denso), pero el checkpoint se registra bajo el tipo de modelo `trtc_v4`, que requiere el paquete `fermion-research` para ser reconocido por Transformers.

Su relevancia actual reside en la eficiencia de despliegue: un contenedor de menos de 4 GB que ejecuta en CPU (pico por debajo de 8 GiB de memoria residente), en Apple Silicon vía MLX, en GPU NVIDIA y en tooling de llama.cpp, con licencia Apache 2.0. El repositorio acumula 386 descargas y 83 likes desde su creación en julio de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B), tipo de modelo registrado `trtc_v4` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Contenedor propietario `neutrino-8b_v4.bin` (3,875 GB); transporte comprimido sin perdidas `.tv4z` (2,56 GB); GGUF (`neutrino-8b-fv5.gguf`, 4,093 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor binario propietario, `.tv4z`, GGUF, pack MLX y checkpoint PyTorch compatible con `transformers` |
| Vocabulario | 151.936 tokens (tokenizador de Qwen3-8B) |
| Modo de razonamiento | No-thinking (`enable_thinking=False`) |
| Tamano del repositorio | 10,6 GB |

## Arquitectura y entrenamiento

Neutrino-8B parte del checkpoint Qwen/Qwen3-8B, un transformer denso de aproximadamente 8,2 mil millones de parámetros. FermionResearch no documenta en la model card el proceso de entrenamiento adicional, la composición del dataset ni si hubo etapas de RLHF o DPO; la información disponible indica únicamente que se trata de una cuantización del modelo base. El tokenizador es el de Qwen3-8B y se incluye en el propio repositorio.

La innovación técnica destacable no está en la arquitectura del modelo sino en el runtime y el formato de empaquetado. El contenedor `trtc_v4` se carga mediante el paquete `fermion-research`, que registra el tipo de modelo en el momento del import (`import fermion` debe preceder a la importación de Transformers). El proyecto ofrece múltiples rutas de ejecución: motor pip, binarios nativos para macOS arm64 y Linux x86-64, pack MLX para Apple Silicon, pack GGUF para llama.cpp (CPU, CUDA y Metal) y la ruta de referencia en PyTorch. Los binarios nativos priorizan velocidad sobre equivalencia exacta, salvo que se active `--exact` en el binario Linux x86-64, que reproduce token a token la salida de referencia con `dtype=torch.float32`. La configuración de generación por defecto es greedy, sin penalización de repetición ni top-k, y es la utilizada para medir los resultados publicados.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 40.960 tokens.
- Soporte de tool calling y function calling; la model card menciona ajustes recomendados específicos para este caso de uso.
- Evaluado en GSM8K, IFEval y BFCL, lo que indica capacidades de razonamiento matemático, seguimiento de instrucciones y uso de funciones.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo no-thinking: no genera cadena de razonamiento explícita, lo que reduce latencia y tokens de salida.
- Ejecución multiplataforma: CPU, Apple Silicon (MLX), GPU NVIDIA (CUDA) y Metal vía llama.cpp.
- Integración con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer` tras el registro del tipo `trtc_v4`.

## Casos de uso

- Asistente conversacional de baja latencia: con temperatura 0.01 en el binario C (0 en torch), top-p 1.0, penalización de repetición 1.05 con ventana de 256 y 512 tokens nuevos máximos, el modelo está configurado para respuestas de asistente estables y reproducibles en entornos de producción con CPU.
- Despliegue en hardware sin GPU: el contenedor de 3,875 GB y un pico de memoria residente inferior a 8 GiB permiten ejecutar el modelo en servidores CPU convencionales, lo que abarata el coste de inferencia frente a alternativas que requieren GPU.
- Aplicaciones locales en Apple Silicon: el pack MLX permite ejecutar el modelo en Macs con chip de Apple, útil para prototipado, herramientas de escritorio y procesamiento de datos sensibles sin salida a la nube.
- Integración en pipelines de tool calling: el soporte de function calling y la configuración de parada con EOS 151645 facilitan su uso como planificador de agentes que invocan APIs externas.
- Razonamiento matemático y seguimiento de instrucciones: los resultados publicados en GSM8K e IFEval lo hacen adecuado para tareas de resolución de problemas y validación de instrucciones en asistentes especializados.
- Despliegue con llama.cpp en entornos heterogéneos: el pack GGUF permite servir el modelo en CPU, CUDA y Metal con el mismo artefacto, simplificando la operación en infraestructuras mixtas.
- Evaluación reproducible: la configuración greedy por defecto hace que `generate()`, `lm-eval` y `fermion generate` produzcan resultados equivalentes, lo que facilita la comparación entre entornos y la auditoría de resultados.

## Benchmarks y rendimiento

La model card menciona que se publicaron resultados de GSM8K, IFEval y BFCL medidos con la configuración greedy del repositorio, pero no incluye los valores numéricos en la información disponible.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el contenedor ocupa 3,875 GB en disco y el pico de memoria residente en la ruta CPU es inferior a 8 GiB.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo soporta CUDA y Metal vía llama.cpp.
- CPU: binarios nativos precompilados para macOS arm64 y Linux x86-64.
- Apple Silicon: pack MLX con paquete `fermion_mlx` y `requirements.txt` propio.
- Opciones de despliegue: motor pip `fermion-research`, binarios nativos, MLX, llama.cpp (GGUF) y `transformers` (ruta de referencia en PyTorch).
- Latencia y throughput: no disponibles. La model card indica que los binarios nativos son la ruta rápida y que sacrifican equivalencia exacta por velocidad salvo con `--exact`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Neutrino-8B | 8,19 B | 40.960 | Apache 2.0 | Contenedor propietario, GGUF, MLX | Cuantizacion de Qwen3-8B, no-thinking, multiplataforma |
| Qwen/Qwen3-8B | 8,2 B (aprox.) | no disponible | no disponible | safetensors | Modelo base del que deriva Neutrino-8B |
| Alternativas de 7-8 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación con otros modelos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo thinking: se entrega y evalúa con `enable_thinking=False`, por lo que no ofrece razonamiento explícito paso a paso.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe equivalente al del modelo base.
- Dependencia del paquete `fermion-research`: sin `import fermion` previo, Transformers no reconoce el tipo `trtc_v4` y falla con `ValueError`; `trust_remote_code=True` no resuelve el problema porque el repositorio no incluye `auto_map`.
- Requiere `fermion-research` 0.2.12 o superior; en 0.2.11 es necesario llamar a `fermion.language_model_loader()` tras el import.
- En Transformers 4.56 y posteriores es obligatorio `return_dict=True` en `apply_chat_template`.
- Los binarios nativos no producen salida idéntica a la referencia salvo con `--exact` en Linux x86-64.
- El pack GGUF requiere una compilación específica de llama.cpp descrita en `gguf/README.md`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base Qwen3-8B.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las obligaciones de atribución y las condiciones del modelo base.
- El proceso de cuantización propietario no está documentado en detalle, lo que dificulta auditar posibles pérdidas de calidad respecto al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Neutrino-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
