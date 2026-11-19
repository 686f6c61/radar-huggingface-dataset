# FlagRelease/MiniCPM5-1B-hygon-FlagOS

## Resumen

MiniCPM5-1B-hygon-FlagOS es una distribución del modelo de lenguaje MiniCPM5-1B, desarrollado originalmente por ModelBest y empaquetado por FlagRelease para su ejecución sobre el stack FlagOS en aceleradores Hygon. El modelo base es un transformer denso de aproximadamente 1.080 millones de parámetros, presentado por ModelBest el 25 de mayo como modelo fundacional de borde (edge-side) de nueva generación, con soporte para chino e inglés y licencia Apache 2.0.

La relevancia de esta variante concreta no reside en el modelo en sí, sino en el entorno de despliegue: FlagRelease publica una imagen de contenedor con vLLM 0.13.0, PyTorch 2.9.0 y las librerías FlagGems, FlagCX y FlagTree, orientada a ejecutar el modelo sobre hardware Hygon (dispositivos `/dev/kfd`, `/dev/mkfd`, `/dev/dri`) en lugar de GPU NVIDIA. El objetivo declarado es validar la paridad funcional y de rendimiento entre el stack nativo de NVIDIA y el stack FlagOS sobre el mismo modelo.

El modelo base destaca por su densidad de inteligencia: según la model card, alcanza 17,9 puntos en el índice AA, por encima de Qwen3.5-2B (16,3), y tras cuantización INT4 los pesos ocupan unos 0,5 GB, lo que permite inferencia en smartphones y navegadores. Esta distribución FlagOS está pensada para entornos de servidor con aceleradores Hygon, no para consumo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, según tags del repositorio) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 mencionado en la model card (pesos ~0,5 GB); no se detallan otros formatos |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como un transformer denso de 1B parámetros con arquitectura compatible con la familia llama (tag `llama` en el repositorio de Hugging Face). El modelo base fue preentrenado por ModelBest con ForgeTrain, un framework de entrenamiento descrito en la model card como el primero de grado producción escrito íntegramente por IA. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste por instrucciones.

La variante aquí descrita no modifica los pesos del modelo original: FlagRelease empaqueta los mismos pesos junto con una imagen de contenedor que incluye vLLM 0.13.0, PyTorch 2.9.0, Python 3.10.12, FlagGems 4.2.1rc0 (librería de operadores en Triton), FlagTree (compilador unificado multi-chip) y FlagCX (comunicación colectiva). La innovación técnica relevante es la portabilidad del stack: los mismos pesos se ejecutan sobre Hygon mediante kernels Triton neutros respecto al backend, con validación de consistencia frente al stack nativo NVIDIA.

## Capacidades

- Generación de texto en chino e inglés; el modelo está etiquetado explícitamente para ambos idiomas.
- Razonamiento y conocimiento general evaluado en benchmarks de sentido común (hellaswag, winogrande, commonsense_qa) y veracidad (truthfulqa_mc1).
- Servido como API compatible con OpenAI mediante `vllm serve`, lo que habilita chat multi-turno vía `/v1/chat/completions`.
- Integración con clientes de terceros: la model card documenta explícitamente la conexión con AnythingLLM.
- Soporte declarado en frameworks de inferencia mainstream: vLLM, SGLang y llama.cpp (según la model card del modelo base).
- Capacidad de ejecución en dispositivos de borde tras cuantización INT4 (pesos ~0,5 GB), incluyendo smartphones y navegadores según el autor.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue sobre aceleradores Hygon en centros de datos con requisitos de soberanía tecnológica: la imagen FlagOS permite ejecutar el modelo con vLLM sobre dispositivos Hygon sin reescribir el pipeline de inferencia, usando la API compatible con OpenAI en el puerto 8000.
- Validación de paridad entre stacks: útil para equipos que necesitan comparar el rendimiento del stack nativo NVIDIA frente a FlagOS sobre el mismo modelo y los mismos benchmarks (hellaswag, winogrande, commonsense_qa, truthfulqa_mc1).
- Asistentes conversacionales ligeros en chino e inglés: con 1B parámetros y servicio vía API OpenAI-compatible, encaja en backends de chat de bajo coste donde el contexto no sea extremadamente largo.
- Integración en AnythingLLM para bases de conocimiento internas: la model card documenta el flujo completo de configuración, lo que permite montar un asistente documental sobre el endpoint local sin desarrollo adicional.
- Inferencia en el borde tras cuantización INT4: con pesos de ~0,5 GB, el modelo base es candidato para aplicaciones móviles o web que requieran generación de texto local sin conexión.
- Prototipado rápido de pipelines RAG o de agentes en entornos con GPU no NVIDIA: al usar vLLM con kernels Triton portables, el mismo código de cliente sirve para desarrollo en NVIDIA y producción en Hygon.
- Evaluación comparativa de modelos pequeños: sirve como referencia de 1B parámetros para medir la "densidad" de inteligencia frente a alternativas de 2B-4B en tareas de sentido común.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la ejecución sobre stack nativo NVIDIA frente al stack FlagOS sobre Hygon:

| Metrica | MiniCPM5-1B-Nvidia-Origin | MiniCPM5-1B-Hygon-FlagOS |
|---|---|---|
| hellaswag | 0,4742 | 0,4628 |
| truthfulqa_mc1 | 0,3293 | 0,3354 |
| winogrande | 0,5484 | 0,5406 |
| commonsense_qa | 0,3473 | 0,3522 |

La model card del modelo base cita además una puntuación de 17,9 en el índice AA, frente a 16,3 de Qwen3.5-2B. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 1.080 millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 2,2 GB (tamaño del repositorio); en INT4, unos 0,5 GB según la model card.
- GPU recomendadas: la variante documentada está orientada a aceleradores Hygon (dispositivos `/dev/kfd`, `/dev/mkfd`, `/dev/dri`), no a GPU NVIDIA. Para el modelo base, la model card menciona soporte en vLLM, SGLang y llama.cpp, sin listar GPU concretas.
- GPU de consumo: el modelo base, cuantizado en INT4, está declarado como ejecutable en más del 90 % de dispositivos terminales, incluidos smartphones y navegadores. No se detallan modelos concretos de GPU de consumo.
- Opciones de despliegue: vLLM 0.13.0 (documentado con `--trust-remote-code --dtype bfloat16 --enforce-eager --gpu-memory-utilization 0.85`), SGLang, llama.cpp, y la imagen Docker FlagOS con FlagGems, FlagTree y FlagCX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AA-Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-1B (esta ficha) | 1,08B | no disponible | 17,9 | Apache 2.0 | Hugging Face, ModelScope, imagen FlagOS |
| Qwen3.5-2B | ~2B | no disponible | 16,3 | no disponible en esta información | no disponible en esta información |
| Alternativas <4B | no disponible | no disponible | inferior a 17,9 según el autor | no disponible | no disponible |

La model card afirma que MiniCPM5-1B supera a todos los modelos fundacionales open source por debajo de 4B parámetros en el índice AA. No se dispone de datos verificables de otros competidores concretos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está etiquetado para chino e inglés; el rendimiento en castellano u otros idiomas no está validado.
- No se documentan sesgos conocidos, pero al no publicarse la composición del dataset de entrenamiento no es posible evaluar su origen ni su mitigación.
- Riesgo de alucinación inherente a un modelo de 1B parámetros: los resultados en truthfulqa_mc1 (0,3293-0,3354) indican una fiabilidad limitada en preguntas de veracidad.
- La variante FlagOS está atada a hardware Hygon y al stack FlagOS; no es un sustituto directo de una imagen NVIDIA estándar.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue sobre Hygon requiere cumplir las condiciones de la imagen de contenedor publicada en `harbor.baai.ac.cn`, cuyos términos específicos no se detallan.
- El repositorio tiene muy poca tracción (6 descargas, 0 likes) y la model card no documenta el contexto máximo, los datos de entrenamiento ni procesos de alineación, lo que limita la evaluación rigurosa para producción.
- El rendimiento en el stack FlagOS es ligeramente inferior al nativo NVIDIA en hellaswag, winogrande y commonsense_qa (diferencias de 0,8 a 1,1 puntos), aunque ligeramente superior en truthfulqa_mc1.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/MiniCPM5-1B-hygon-FlagOS
- AnythingLLM: https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/flagrelease-minicpm5-hygon-tree_none-gems_4.2.1rc0-vllm_0.13.0_das.opt1.dtk2604.20260306.g0c698cda-plugin_0.1.0-cx_none-python_3.10.12-torch_2.9.0_das.opt1.dtk2604.20260206.g275d08c:202605211622`
- Modelo base MiniCPM5-1B en ModelScope: descarga vía `modelscope download --model FlagRelease/MiniCPM5-1B-hygon-FlagOS`
