# francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455

## Resumen

El modelo `nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455` es un ajuste fino (SFT) desarrollado por el usuario de Hugging Face `francesca9805`, vinculado a la Universidad de Groningen segun el proyecto de Weights & Biases asociado. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124.770.816 parametros totales, entrenado mediante la libreria TRL (version 0.23.0) sobre un modelo base del mismo autor (`ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed455`). El nombre del checkpoint sugiere un experimento controlado de tokenizacion y empaquetado de datos (referencias a "100mb", "packed", "newlex" y una semilla concreta, `seed455`).

El modelo resuelve, en la practica, un proposito de investigacion: servir como punto de comparacion en estudios sobre tokenizadores, tecnicas de empaquetado de secuencias y estabilidad de entrenamiento con semillas fijas. No obstante, su publicacion en Hugging Face lo hace tecnicamente desplegable mediante `transformers` y `text-generation-inference`, y cuenta con 520 descargas en el momento de redactar esta ficha.

Su relevancia actual es limitada fuera del contexto de investigacion del que procede: no dispone de model card sustantiva, no declara idiomas ni licencia, y su tamano (124,7 M de parametros) lo situa en la categoria de modelos pequenos de tipo GPT-2, utiles para experimentacion local pero no para tareas de produccion con requisitos de calidad exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed455 |
| Tamano del repositorio | 45,1 GB |
| Descargas | 520 |
| Likes | 0 |
| Fecha de creacion | 2026-10-03 |
| Fecha de actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, tal como indica el tag `gpt2` del repositorio y el recuento de 124,7 M de parametros, coherente con la configuracion GPT-2 small (12 capas, 12 cabezas de atencion, dimension de embedding 768). No se dispone de informacion sobre la longitud de contexto nativa ni sobre si se modifico la configuracion respecto al GPT-2 original.

El entrenamiento se realizo mediante SFT con TRL 0.23.0 sobre el modelo base `ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed455`. El nombre del checkpoint sugiere un pipeline experimental concreto: un corpus de aproximadamente 100 MB ("100mb"), empaquetado de secuencias ("packed"), un tokenizador nuevo o modificado ("newlex") y un sesgo uniforme en la construccion del vocabulario ("wc-uniform"); el sufijo `seed455` indica una semilla fija para reproducibilidad. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO posteriores. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). El tamano del repositorio (45,1 GB) es desproporcionado respecto a los 124,7 M de parametros, lo que sugiere la presencia de checkpoints intermedios o artefactos de entrenamiento en el mismo repositorio.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Conversacion de un solo turno o multi-turno simple, segun el formato de chat mostrado en la model card (lista de mensajes con rol `user`).
- Ajuste especifico al dominio del corpus de entrenamiento (no documentado), lo que puede producir un estilo o vocabulario particular derivado del tokenizador "newlex".
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en infraestructura de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; no se declara ningun idioma.

## Casos de uso

- Experimentacion academica sobre tokenizadores: el modelo sirve como punto de comparacion en estudios que evaluan el impacto de un tokenizador nuevo ("newlex") frente a tokenizadores estandar, gracias a que comparte base y semilla con otros checkpoints del mismo autor.
- Reproduccion de experimentos de empaquetado de secuencias: el sufijo "packed" y la semilla fija permiten replicar resultados de investigacion sobre como el empaquetado afecta a la calidad de generacion en modelos pequenos.
- Pruebas de pipelines de SFT con TRL: util como caso de prueba para validar flujos de entrenamiento con TRL 0.23.0 y Transformers 4.56.2 antes de escalar a modelos mayores.
- Generacion de texto local en entornos con recursos muy limitados: con 124,7 M de parametros, cabe en CPU y en GPUs de gama baja, lo que permite prototipado rapido sin infraestructura dedicada.
- Evaluacion de sesgos y alucinaciones en modelos pequenos: su tamano reducido lo hace adecuado para estudios controlados sobre degradacion de calidad frente a modelos mayores.
- Demostraciones docentes de generacion de texto: su integracion con `pipeline("text-generation")` de Transformers facilita su uso en cursos y talleres introductorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,5 GB para los pesos (124,7 M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para los pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,13 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Tambien es viable en CPU.
- Cabe en practicamente cualquier GPU de consumo actual e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline de text-generation), `text-generation-inference` (el repo esta marcado como `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se convierte a GGUF (no se proporciona conversion oficial).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455 | 124,7 M | no disponible | no disponible | Hugging Face | Ajuste SFT experimental, GPT-2 |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, OpenAI | Referencia canonica de la arquitectura; contexto y licencia conocidos |
| Modelos GPT-2 fine-tuned de la comunidad | ~124 M | 1024 tokens (tipico) | varia | Hugging Face | Multiples variantes; calidad dependiente del corpus |
| Modelos tipo TinyLlama | ~1,1 B | 2048 tokens | Apache 2.0 | Hugging Face | Mayor capacidad, requiere mas VRAM |

La comparacion con GPT-2 small es la mas directa por arquitectura y tamano, pero el modelo evaluado carece de la documentacion de contexto y licencia que si ofrece el original. Frente a modelos mas recientes de tamano similar (por ejemplo, variantes de SmolLM o Qwen2 small), el modelo aqui descrito no ofrece datos de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no se documentan datos de entrenamiento, idiomas, contexto ni comportamiento esperado, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no especificada: el campo `licence: license` de la model card no contiene texto legal, por lo que no se puede confirmar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Riesgo elevado de alucinacion: los modelos de 124,7 M de parametros tienen capacidad limitada de factualidad y coherencia en generaciones largas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible identificar sesgos de genero, raza, idioma o dominio.
- Contexto limitado (presumiblemente 1024 tokens, herencia de GPT-2, aunque no confirmado): inadecuado para tareas que requieran ventanas largas.
- Idiomas no declarados: el tokenizador "newlex" puede no cubrir correctamente el castellano u otros idiomas, con riesgo de tokenizacion ineficiente o degradada.
- Repositorio de 45,1 GB para un modelo de 124,7 M: la descarga incluye artefactos de entrenamiento no documentados; conviene revisar el contenido antes de integrarlo en pipelines automatizados.
- Sin garantias de mantenimiento: 0 likes y un autor individual sugieren un proyecto de investigacion sin soporte a largo plazo.
- No apto para produccion sin evaluacion previa: no hay benchmarks, ni pruebas de robustez, ni documentacion de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/nor-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfdiso_seed455
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/2h5jxzaw
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de TRL (cita): von Werra et al., 2020, TRL: Transformer Reinforcement Learning
