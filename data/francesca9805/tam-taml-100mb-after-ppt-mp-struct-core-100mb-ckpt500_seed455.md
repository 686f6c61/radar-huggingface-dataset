# francesca9805/tam-taml-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455

## Resumen

El modelo `francesca9805/tam-taml-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455` es un ajuste fino (SFT) del modelo `francesca9805/tam-taml-100mb-ppt-mp-struct-core-100mb_seed455`, publicado por el usuario francesca9805 en HuggingFace. Se trata de un modelo de generacion de texto de tipo decoder-only con arquitectura GPT-2, con 124.770.816 parametros totales (aproximadamente 125 millones) y pesos en formato safetensors. El entrenamiento se realizo con la libreria TRL en su version 0.23.0, utilizando la tecnica de Supervised Fine-Tuning (SFT).

El modelo forma parte de una serie de experimentos etiquetados como "tam-taml-100mb", asociados al proyecto de Weights & Biases "new-tokenizers" del usuario f-padovani (University of Groningen). Esto sugiere que el objetivo del trabajo es la investigacion sobre tokenizadores y arquitecturas de lenguaje de escala reducida, mas que un modelo orientado a produccion. El nombre incluye referencias al checkpoint de entrenamiento (ckpt500) y a la semilla aleatoria empleada (seed455).

La relevancia de esta ficha es limitada: el modelo cuenta con 0 descargas y 0 likes, no tiene model card detallada, no declara licencia efectiva ni idiomas soportados, y no se han publicado resultados de benchmarks. Se incluye aqui como referencia tecnica del artefacto, con las advertencias correspondientes sobre la ausencia de datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` |
| Parametros totales | 124.770.816 (aproximadamente 124,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence:` sin contenido real) |
| Formato de pesos | safetensors |
| Modelo base | francesca9805/tam-taml-100mb-ppt-mp-struct-core-100mb_seed455 |
| Libreria | transformers |
| Tamano del repositorio | 9,0 GB |
| Tecnica de entrenamiento | SFT (Supervised Fine-Tuning) con TRL 0.23.0 |
| Fecha de creacion | 2026-10-09 |
| Fecha de actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer de tipo decoder-only con atención causal, segun el tag `gpt2` declarado por el autor. No se dispone de informacion adicional sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni la longitud de contexto efectiva. El recuento real de parametros (124.770.816) es coherente con la familia GPT-2 small, aunque no se puede confirmar la configuracion exacta a partir de la informacion disponible.

El modelo se ha obtenido mediante SFT (Supervised Fine-Tuning) sobre el modelo base `francesca9805/tam-taml-100mb-ppt-mp-struct-core-100mb_seed455`, usando la libreria TRL. No se especifica el dataset de ajuste, el numero de tokens de entrenamiento, la composicion de los datos ni si se aplicaron tecnicas posteriores como RLHF o DPO. El sufijo del nombre ("ckpt500") indica que se trata del checkpoint correspondiente al paso 500 de entrenamiento, y "seed455" identifica la semilla empleada. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto "new-tokenizers".

Las versiones de framework declaradas son TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, mezcla de expertos u otras).

## Capacidades

- Generacion de texto autoregresiva basica, segun el pipeline `text-generation` declarado.
- Formato de prompt conversacional: el ejemplo de la model card pasa una lista de mensajes con roles (`{"role": "user", "content": ...}`), lo que sugiere un ajuste de tipo chat, aunque no se documenta la plantilla exacta.
- Compatibilidad con text-generation-inference y endpoints compatibles, segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre tokenizadores: el modelo pertenece al proyecto "new-tokenizers", por lo que su uso principal documentado es servir como sujeto de experimentos comparativos entre esquemas de tokenizacion en modelos pequenos.
- Reproduccion de experimentos academicos: al incluir la semilla (seed455) y el checkpoint (ckpt500) en el nombre, permite reproducir un punto concreto de un barrido de entrenamiento.
- Prototipado rapido de pipelines de inferencia: con 125 M de parametros cabe en cualquier GPU consumer, lo que permite validar integraciones con Transformers, TRL o TGI antes de escalar a modelos mayores.
- Modelo borrador para decodificacion especulativa: por su tamano reducido puede actuar como draft model para acelerar la generacion de un modelo mayor, siempre que se verifique compatibilidad de tokenizador (no confirmada).
- Pruebas de ajuste fino con SFT: sirve como punto de partida para experimentos de fine-tuning con TRL en entornos con recursos limitados.
- Evaluacion de sesgos y comportamientos emergentes a escala reducida: util como linea base en estudios de seguridad y alineacion en modelos pequenos.
- Generacion de texto de baja exigencia en entornos con restricciones de memoria (por ejemplo, dispositivos embebidos o demos locales), aceptando la perdida de calidad asociada al tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parametros (124,8 M):
  - FP32: aproximadamente 500 MB solo de pesos.
  - FP16/BF16: aproximadamente 250 MB de pesos.
  - INT8: aproximadamente 125 MB de pesos.
  - INT4: aproximadamente 63 MB de pesos.
  - A estas cifras hay que sumar el espacio de la cache KV y las activaciones, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU moderna es suficiente. No se requiere A100 ni H100. Una GTX 1650, RTX 3060, RTX 4090 o incluso una iGPU con suficiente memoria compartida pueden ejecutar el modelo.
- Compatibilidad con GPU consumer: si, el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM.
- Opciones de despliegue: Transformers (pipeline de text-generation), text-generation-inference (TGI, segun los tags), y en principio llama.cpp u Ollama si se convierte a GGUF, aunque no se publican pesos GGUF en el repositorio. vLLM es tecnicamente posible pero sobredimensionado para este tamano.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/tam-taml-100mb-...-ckpt500_seed455 | 124,8 M | no disponible | no disponible | HuggingFace, 0 descargas |
| GPT-2 (openai-community/gpt2) | 124 M | 1024 tokens | modified MIT | HuggingFace, ampliamente usado |
| DistilGPT2 (distilbert/distilgpt2) | 82 M | 1024 tokens | Apache 2.0 | HuggingFace |
| Pythia-160M (EleutherAI/pythia-160m) | 160 M | 2048 tokens | Apache 2.0 | HuggingFace |

La comparativa de rendimiento con estas alternativas no puede establecerse porque no se han publicado benchmarks del modelo objeto de esta ficha. Los datos de contexto y licencia de los modelos de referencia corresponden a informacion publica de sus respectivos repositorios.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita evaluar calidad, razonamiento, codigo o matematicas.
- Licencia no definida: la model card incluye un campo `licence:` vacio, por lo que no se puede confirmar el uso comercial ni las condiciones de redistribucion. Tratarlo como no apto para produccion hasta que el autor aclare la licencia.
- Idiomas no declarados: se desconoce que lenguas maneja con calidad aceptable.
- Longitud de contexto no documentada: impide planificar aplicaciones que dependan de ventanas largas o conversaciones multi-turno extensas.
- Riesgo elevado de alucinacion: por su tamano (125 M de parametros) la coherencia factual es limitada incluso en modelos mejor documentados de la misma escala.
- Sesgos potenciales: al no documentarse el dataset de SFT ni el del modelo base, no es posible auditar sesgos de genero, raza, idioma o ideologia.
- Repositorio de 9,0 GB para un modelo de 125 M: indica la presencia de multiples checkpoints u otros artefactos, algo a tener en cuenta al clonar.
- Sin mantenimiento ni adopcion: 0 descargas y 0 likes en el momento de redactar esta ficha, sin senales de soporte por parte del autor.
- Uso recomendado exclusivamente experimental o de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tam-taml-100mb-after-ppt-mp-struct-core-100mb-ckpt500_seed455
- Modelo base: https://huggingface.co/francesca9805/tam-taml-100mb-ppt-mp-struct-core-100mb_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/eb0fzh0m
- Repositorio de TRL: https://github.com/huggingface/trl
