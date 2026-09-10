# fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed10

## Resumen

`fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed10` es un modelo de generacion de texto en ingles de 86.416.128 parametros, publicado por el usuario fpadovani. Se trata de un ajuste fino (fine-tuning) mediante SFT con la libreria TRL sobre el modelo base `goldfish-models/eng_latn_100mb`, un modelo monolingue en ingles entrenado con 100 MB de texto. La etiqueta de arquitectura declarada en HuggingFace es `gpt2`, es decir, un transformer decoder-only autorregresivo, con pesos en formato safetensors.

El modelo no es un lanzamiento de producto, sino un artefacto de investigacion: el repositorio acumula 0 descargas y 0 likes, el identificador incluye el sufijo `_seed10` y el proyecto de Weights & Biases asociado pertenece a la Universidad de Groningen (`f-padovani-university-of-groningen`, proyecto `white_cotterell`). Todo apunta a un experimento de ablacion o reproducibilidad, probablemente centrado en la composicion del dataset de instrucciones (los fragmentos `ppt`, `wc`, `uniform` y `oldlex` sugieren variantes de preprocesado o de mezcla de datos). Por tanto, su relevancia no esta en el rendimiento, sino en la trazabilidad del experimento y en servir de referencia metodologica.

Su tamano reducido (86 M de parametros, ~1,4 GB de repositorio) permite entrenarlo y ejecutarlo en hardware muy modesto, lo que lo hace util como banco de pruebas para pipelines de SFT, formateo de instrucciones y despliegue ligero. No se ha publicado informacion sobre licencia, idiomas oficiales, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 86.416.128 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible oficialmente; el identificador (`eng`, base `eng_latn`) indica ingles |
| Licencia | no disponible (la model card incluye un campo placeholder `licence: license`) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 1,4 GB |
| Modelo base | goldfish-models/eng_latn_100mb (fine-tuning) |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Version de Transformers | 4.56.2 |
| Version de PyTorch | 2.11.0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo decoder-only de la familia GPT-2, segun la etiqueta declarada por el autor y por el modelo base. Con 86,4 millones de parametros, se situa por debajo de GPT-2 small (124 M) y en un orden de magnitud similar a distilgpt2 (82 M). No se especifican en la informacion disponible el numero de capas, la dimension oculta, el numero de cabezas de atencion, el vocabulario del tokenizador ni la longitud de contexto nativa. Tampoco se detalla si se emplea atencion con mascara causal estandar u otra variante.

El entrenamiento consistio en un ajuste fino supervisado (SFT) mediante TRL 0.23.0, sobre el modelo base `goldfish-models/eng_latn_100mb`, que a su vez es un modelo monolingue entrenado con 100 MB de texto en ingles. No se publican el numero de tokens de entrenamiento, la composicion del dataset de instrucciones, ni si hubo etapas posteriores de RLHF o DPO. El unico registro experimental enlazado es una ejecucion de Weights & Biases (`pvthnh8r`) en el proyecto `white_cotterell` de la organizacion `f-padovani-university-of-groningen`, que presumiblemente contiene las curvas de entrenamiento, pero sus datos no estan incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto autorregresiva en ingles: continuacion de texto, respuestas cortas y autocompletado.
- Formato conversacional de un solo turno: el ejemplo de la model card usa `pipeline("text-generation")` con una lista de mensajes `{"role": "user", "content": ...}` y `return_full_text=False`, lo que indica que el tokenizador puede aplicar una plantilla de chat de tipo instruccion.
- Ajuste a instrucciones basicas derivado del SFT, limitado por el tamano del modelo y por la ausencia de datos publicados sobre el dataset de entrenamiento.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni modo de pensamiento explicito (thinking mode).
- No hay soporte multimodal (ni vision ni audio).
- Capacidad multilingue: no documentada; el identificador apunta a ingles exclusivamente.
- No se documentan capacidades especificas de generacion de codigo ni de matematicas, y por tamano y datos de preentrenamiento (100 MB) no son esperables de forma fiable.

## Casos de uso

- Reproducibilidad de experimentos academicos: el modelo forma parte de una familia de variantes (`ppt`, `wc`, `uniform`, `oldlex`, `seed10`) que permite aislar el efecto de distintas decisiones de preprocesado o mezcla de datos de instrucciones manteniendo fijo el modelo base y la semilla.
- Banco de pruebas de pipelines de SFT con TRL: sirve para validar scripts de entrenamiento, plantillas de chat, empaquetado de datasets y registro en Weights & Biases sin consumir GPU costosas, gracias a sus 86,4 M de parametros.
- Pruebas de integracion de infraestructura de inferencia: al declararse compatible con text-generation-inference y endpoints compatibles, puede usarse para verificar despliegues de TGI, endpoints de HF o pasarelas de API antes de mover modelos grandes.
- Generacion de texto corto en prototipos: autocompletado de formularios, sugerencias de texto o respuestas de relleno en demos, asumiendo calidad limitada y necesidad de revision humana.
- Punto de partida para fine-tuning de dominio: al ser pequeno y barato de entrenar, es adecuado para experimentar con ajustes especificos (estilo, terminologia, formato) antes de escalar a un modelo mayor, aunque su base de 100 MB limita el conocimiento factual.
- Educacion y divulgacion: permite ilustrar en clase o en talleres el funcionamiento completo de un transformer decoder-only, desde la tokenizacion hasta la generacion, ejecutandolo en CPU o en una GPU de gama baja.
- Evaluacion comparativa de tecnicas de decodificacion: con un coste de inferencia minimo, es practico para medir latencias y efectos de `temperature`, `top_p`, `max_new_tokens` y plantillas de prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas (MMLU, HumanEval, GSM8K u otras) y la busqueda web no ha devuelto documentacion tecnica asociada al modelo. No se deben asumir cifras de rendimiento por comparacion con GPT-2 o distilgpt2, ya que este modelo incorpora un ajuste fino adicional sobre un corpus distinto.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de 86,4 M de parametros, sin contar cache KV ni sobrecarga del framework):
  - FP32: ~346 MB.
  - FP16 / BF16: ~173 MB.
  - INT8: ~86 MB.
  - INT4: ~43 MB.
- VRAM realista en inferencia: sumar la cache KV y la sobrecarga del runtime (tipicamente varios cientos de MB adicionales segun framework, batch y `max_new_tokens`). Cabe holgadamente en cualquier GPU consumer, incluso integradas.
- GPU recomendadas: no requiere GPU. Funciona en CPU, en GPUs integradas, en NVIDIA GTX 1050/1650 o superiores, RTX 3050/4060, y en cualquier A100 o H100 sin aprovechar su capacidad. Es viable en dispositivos edge y en Apple Silicon (MPS).
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` (ejemplo oficial de la model card), Text Generation Inference (TGI) por la etiqueta `text-generation-inference`, endpoints compatibles (etiqueta `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles. Con este tamano, la latencia estara dominada por la sobrecarga del framework y por el numero de tokens generados, no por el computo de las matrices.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-uniform-oldlex-eng-100mb_seed10 | 86,4 M | no disponible | ingles (segun identificador) | no disponible | HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | no disponible en la informacion facilitada | no disponible | ingles (`eng_latn`) | no disponible | HuggingFace |
| distilgpt2 | 82 M | 1024 tokens | ingles | Apache-2.0 | HuggingFace, ampliamente usado |
| gpt2 (small) | 124 M | 1024 tokens | ingles | licencia MIT modificada de OpenAI | HuggingFace, ampliamente usado |

Los datos de distilgpt2 y GPT-2 small corresponden a informacion publica general de esos modelos, no a la informacion proporcionada sobre este modelo. No se dispone de resultados de benchmarks comparativos que permitan afirmar que este ajuste fino supere o iguale a sus alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Hereda los sesgos del corpus de 100 MB del modelo base, que no esta descrito en la informacion disponible.
- Riesgo de alucinacion: alto en terminos relativos. Un modelo de 86 M de parametros con preentrenamiento sobre 100 MB de texto tiene una capacidad factual muy limitada y puede generar afirmaciones plausibles pero falsas con fluidez.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto ni la lista de idiomas; el identificador sugiere uso exclusivo en ingles. No se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Restricciones de licencia: la licencia no esta disponible. La model card incluye un campo placeholder (`licence: license`), lo que implica que no hay una licencia explicita publicada. Esto impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- Falta de validacion: 0 descargas y 0 likes, sin benchmarks publicados ni evaluacion independiente. No hay evidencia de calidad mas alla del ejemplo de la model card.
- Naturaleza experimental: el nombre (`ppt`, `wc`, `uniform`, `oldlex`, `seed10`) sugiere una variante de un barrido de experimentos. Puede tratarse de un checkpoint intermedio o de una configuracion descartada, sin garantia de ser el mejor de su familia.
- Sin soporte de herramientas ni agentes: no se documenta tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado para flujos de agente.
- Produccion: no recomendado para tareas orientadas a usuario final sin supervision humana, filtrado de salidas y una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-uniform-oldlex-eng-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/pvthnh8r
- Repositorio de TRL: https://github.com/huggingface/trl
- Cita de TRL (BibTeX): von Werra et al., *TRL: Transformer Reinforcement Learning*, GitHub, 2020.
- Paper, blog o demo asociados: no disponible (la busqueda web no ha devuelto documentacion tecnica relacionada con este modelo).
