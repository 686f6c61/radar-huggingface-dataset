# Bobliu/readme-lm

## Resumen

README-LM es un proyecto experimental del desarrollador Bobliu (Bobliuuu) que empaqueta modelos de lenguaje reales dentro de documentos Markdown, de modo que un README de tamano razonable pueda contener los pesos completos de una red neuronal. El repositorio de Hugging Face `Bobliu/readme-lm` distribuye dos artefactos: una recodificacion en int8 de GPT-2 small (124M parametros) troceada en 339 fragmentos Markdown, y un pequeno transformer a nivel de caracter de unos 600K parametros (3 capas, d=128, 4 cabezas, RoPE, RMSNorm, embeddings atados) entrenado para responder preguntas sobre los repositorios publicos del autor.

El interes del proyecto no es el rendimiento de los modelos, sino el formato de distribucion: los pesos se serializan como base64 de zlib de tensores int8 o 4-bit, se incrustan en bloques Markdown y se cargan en inferencia con un `run.py` que solo depende de NumPy, sin frameworks de deep learning. Esto lo convierte en una curiosidad tecnica y en una demostracion de ingenieria de empaquetado y cuantizacion, no en un modelo apto para produccion.

No hay informacion sobre pipeline, descargas ni likes (0 descargas y 0 likes en el momento de la consulta). El modelo base declarado es `openai-community/gpt2` y la libreria asociada es NumPy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 small para `gpt2/`; transformer a nivel de caracter para `qa/`) |
| Parametros totales | 124M (GPT-2 small); ~600K (modelo QA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; GPT-2 small soporta 1024 tokens en su configuracion original |
| Tipos de cuantizacion | int8 por canal de salida (GPT-2); 4-bit con cuantizacion por grupos de 32 y QAT (modelo QA) |
| Idiomas soportados | ingles (`en`) |
| Licencia | `other` / `see-card`, con enlace a https://github.com/Bobliuuu/readme-lm; GPT-2 small es de OpenAI bajo licencia MIT modificada |
| Formato de pesos | Markdown con bloques base64 de zlib de tensores int8/4-bit; carga via NumPy |

## Arquitectura y entrenamiento

El componente principal es una recodificacion de GPT-2 small (124M parametros), el transformer decoder-only de OpenAI, cuantizado a int8 por canal de salida y almacenado en 339 fragmentos Markdown (`weights/part-*.md`) junto con fragmentos del tokenizador, un `manifest.md` y un `run.py` que implementa la inferencia solo con NumPy sobre CPU. No es un modelo nuevo ni ha sido reentrenado: es una re-serializacion de los pesos originales de GPT-2 small.

El segundo componente es un transformer a nivel de caracter de aproximadamente 600K parametros (3 capas, dimension 128, 4 cabezas, RoPE, RMSNorm, embeddings atados), cuantizado a 4-bit por grupos de 32 con quantisation-aware training (QAT) y almacenado como un unico bloque base64 de 411 KiB. Segun la model card, fue entrenado sobre unos 690 pares pregunta/respuesta con hechos sobre los repositorios publicos del autor; el propio autor lo describe como mayoritariamente memorizacion y no como un modelo general. No se documentan detalles adicionales de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO) para ninguno de los dos componentes.

## Capacidades

- Generacion de texto autoregresiva con GPT-2 small: continuacion de texto a partir de un prompt, en ingles.
- Inferencia pura en CPU con NumPy, sin PyTorch, TensorFlow ni CUDA.
- Carga de pesos desde documentos Markdown mediante parseo de bloques base64 y descompresion zlib.
- Modelo QA a nivel de caracter que responde a preguntas sobre hechos concretos de los repositorios publicos del autor (690 hechos aproximadamente).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Demostracion educativa de serializacion de pesos: sirve para explicar como se codifican, cuantizan y empaquetan tensores en un formato legible y versionable con Git, usando `gpt2/run.py` como referencia didactica.
- Prototipado de inferencia sin dependencias pesadas: util para entornos restringidos donde no se puede instalar PyTorch, ya que solo requiere `numpy`, `regex` y `huggingface_hub`.
- Pruebas de cuantizacion int8: el par GPT-2 int8 frente a fp32 permite medir el impacto de la cuantizacion en perplejidad sobre pasajes de prueba (13,5 frente a 13,4 en un test de 44 tokens, segun el autor).
- Generacion de texto de continuacion en ingles para experimentos de juguete: por ejemplo, completar frases cortas con `python3 gpt2/run.py "The meaning of life is" 60`.
- Auditoria de formatos de distribucion de modelos: comparar el enfoque Markdown frente a safetensors o GGUF en terminos de tamano, legibilidad y facilidad de versionado.
- Demostracion de QAT con cuantizacion 4-bit por grupos: el modelo QA sirve como ejemplo minimo de entrenamiento con cuantizacion consciente y empaquetado en un unico bloque base64.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la perplejidad de GPT-2 int8 (13,5) frente a fp32 (13,4) sobre un pasaje de prueba de 44 tokens, que el propio autor califica como un test pequeno y no un benchmark.

## Requisitos de hardware

- GPT-2 small int8 (124M parametros): aproximadamente 145 MB en disco; la inferencia en NumPy requiere del orden de 150-300 MB de RAM, sin VRAM de GPU.
- Modelo QA (600K parametros, 4-bit): 411 KiB en disco; cabe holgadamente en cualquier equipo, incluida una Raspberry Pi.
- GPU recomendadas: no aplica; el proyecto esta disenado para CPU con NumPy.
- Cabe en cualquier GPU consumer, pero no se aprovecha de ella porque no hay backend de GPU implementado.
- Opciones de despliegue: el `run.py` incluido (NumPy puro) y el script `ask.py` para el modelo QA; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Enfoque |
|---|---|---|---|---|---|
| README-LM (este) | 124M (GPT-2 int8) + 600K (QA) | no disponible | Markdown + base64 (zlib) | other / see-card | Empaquetado en Markdown, inferencia NumPy |
| GPT-2 small original | 124M | 1024 tokens | safetensors / PyTorch | MIT modificada | Modelo base de generacion de texto |
| Modelos GGUF de GPT-2 (p. ej. conversiones de la comunidad) | 124M | 1024 tokens | GGUF | segun conversion | Inferencia optimizada con llama.cpp |
| DistilGPT-2 | 82M | 1024 tokens | safetensors / PyTorch | Apache 2.0 | Version destilada de GPT-2 |

La comparativa se limita a variantes de GPT-2 porque README-LM no es un modelo nuevo sino una recodificacion; no se dispone de datos de rendimiento comparables mas alla de la perplejidad citada.

## Limitaciones y advertencias

- GPT-2 small es un modelo base: continua texto, no sigue instrucciones ni responde preguntas de forma fiable.
- El modelo QA es mayoritariamente memorizacion de 690 hechos sobre los repositorios del autor; no generaliza y solo conoce lo que se le entreno.
- Riesgo alto de alucinacion y de contenido incoherente en ambos componentes.
- Solo ingles; sin capacidades multilingues.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- La licencia es `other` / `see-card`, con condiciones definidas en el repositorio de GitHub; es necesario revisarlas antes de cualquier uso comercial.
- GPT-2 small esta sujeto a la licencia MIT modificada de OpenAI; la recodificacion int8 no crea un modelo nuevo.
- El proyecto no incluye las redes MediaWiki y SVG-filter del repositorio de GitHub, que son juguetes separados y no transformers.
- No apto para produccion: sin benchmarks, sin backend de GPU y con 0 descargas y 0 likes en Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/Bobliu/readme-lm
- Repositorio GitHub del proyecto: https://github.com/Bobliuuu/readme-lm
- Video explicativo: https://github.com/Bobliuuu/readme-lm/blob/main/video/readme_lm_explainer.mp4
- Enlace de licencia indicado en la model card: https://github.com/Bobliuuu/readme-lm
- Modelo base GPT-2: https://huggingface.co/openai-community/gpt2
