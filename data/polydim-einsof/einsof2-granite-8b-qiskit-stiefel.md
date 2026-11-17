# Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel

## Resumen

Einsof2-granite-8b-qiskit-stiefel es un adaptador LoRA publicado por el usuario Polydim-Einsof sobre el modelo base Qiskit/granite-3.3-8b-qiskit, una variante de IBM Granite 3.3 de 8.000 millones de parametros especializada en computacion cuantica mediante Qiskit. El adaptador se ha entrenado con SFT (supervised fine-tuning) usando la libreria TRL y se distribuye en formato PEFT, lo que significa que no contiene los pesos completos del modelo sino unicamente las matrices de bajo rango que se aplican sobre el modelo base.

El repositorio tiene un tamano de 0,1 GB, coherente con un adaptador LoRA de rango moderado sobre un transformer de 8B. La model card esta practicamente vacia: todos los campos relevantes (autor real, licencia, idiomas, datos de entrenamiento, hiperparametros, evaluacion) aparecen como "[More Information Needed]". El nombre "stiefel" sugiere alguna relacion con el entrenamiento sobre la variedad de Stiefel (utilizada en optimizacion riemanniana para ortogonalizar matrices de pesos), pero no hay documentacion que lo confirme.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni guia de uso. Su relevancia practica es limitada hasta que el autor documente el proceso de entrenamiento y los datos utilizados, aunque resulta interesante como ejemplo de fine-tuning de bajo coste sobre un modelo de dominio cientifico (Qiskit).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (IBM Granite 3.3) |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qiskit/granite-3.3-8b-qiskit, un modelo de la familia IBM Granite 3.3 con arquitectura transformer decoder-only de 8.000 millones de parametros. El fine-tuning se realizo con TRL en modo SFT (supervised fine-tuning), segun los tags del repositorio, y se empaqueta como adaptador LoRA mediante PEFT 0.21.3. No se especifica el rango del adaptador, los modulos objetivo (q_proj, v_proj, etc.), el alpha, el dropout ni la tasa de aprendizaje.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. Tampoco se documenta si se congelaron las capas del modelo base o si se entreno con precision mixta bf16/fp16. El termino "stiefel" del identificador podria referirse a una restriccion de ortogonalidad sobre las matrices del adaptador (optimizacion sobre la variedad de Stiefel), pero no existe confirmacion en la model card ni en el repositorio.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Granite 3.3.
- Especializacion presumible en computacion cuantica y Qiskit, dado el modelo base y el nombre del adaptador, aunque no hay evaluacion que lo demuestre.
- Soporte de tool calling y function calling: no documentado en esta ficha.
- Razonamiento multi-paso y comportamiento agentico: no documentado.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no documentado.
- No se ha publicado ninguna evaluacion cualitativa de las capacidades adquiridas tras el fine-tuning.

## Casos de uso

- Experimentacion academica en fine-tuning de dominio cientifico: el adaptador sirve como punto de partida para reproducir o comparar tecnicas de SFT sobre Granite 3.3 en el ambito de Qiskit, siempre que se documente el dataset.
- Generacion asistida de codigo Qiskit: si el fine-tuning ha funcionado, podria emplearse para completar circuitos cuanticos, aunque no hay evidencia publicada que lo respalde y requeriria validacion manual.
- Investigacion sobre optimizacion riemanniana: si el nombre "stiefel" refleja el uso de la variedad de Stiefel en el entrenamiento, el adaptador podria utilizarse como caso de estudio en papers sobre ortogonalidad de matrices en PEFT.
- Base para merges y experimentos de adaptadores: al ser un LoRA pequeno (0,1 GB), es facil de combinar con otros adaptadores sobre el mismo modelo base para probar tecnicas de model merging.
- Docencia sobre PEFT y TRL: util como ejemplo practico de como se estructura un repositorio de adaptador LoRA con SFT para estudiantes que aprendan el flujo completo.
- Evaluacion comparativa de adaptadores de dominio: sirve como referencia negativa o de control en estudios que midan la ganancia real de un fine-tuning especializado frente al modelo base sin adaptar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,1 GB, pero requiere cargar el modelo base Granite 3.3 8B completo. En fp16 serian aproximadamente 16 GB de VRAM; en 8 bits, unos 8-9 GB; en 4 bits (GGUF/AWQ), unos 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) suficiente para fp16 en contextos moderados; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantizacion 8 bits) e incluso en GPUs de 8 GB con cuantizacion 4 bits y contexto reducido.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero la compatibilidad con este adaptador concreto no esta verificada; llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles; dependerian del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel | 8B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador sin documentar |
| Qiskit/granite-3.3-8b-qiskit | 8B | no disponible en esta ficha | no disponible | Hugging Face (modelo base) | Modelo de dominio Qiskit sin adaptador |
| ibm-granite/granite-3.3-8b-instruct | 8B | no disponible en esta ficha | no disponible | Hugging Face | Modelo generalista de IBM, sin especializacion cuantica |
| Adaptadores LoRA genericos sobre Granite 8B | 8B (base) + LoRA | heredado del base | variable | Hugging Face | Comparables en tamano, pero sin dominio Qiskit |

La comparativa es limitada porque no hay datos publicados de rendimiento ni de licencia para el adaptador. El modelo base Qiskit/granite-3.3-8b-qiskit es la referencia natural, y el adaptador deberia evaluarse contra el para determinar si aporta alguna mejora real.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial del adaptador; ademas, la licencia del modelo base Qiskit/granite-3.3-8b-qiskit condiciona cualquier uso derivado.
- Riesgo de alucinacion: sin evaluacion, no se puede descartar que el fine-tuning haya degradado la fidelidad del modelo base en tareas generales.
- Sesgos desconocidos: al no documentarse el dataset de SFT, no se pueden identificar sesgos introducidos por el entrenamiento.
- Idiomas no documentados: se desconoce si el adaptador mantiene el multilingueismo del modelo base o si se ha sobreajustado a un solo idioma.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validacion externa.
- El nombre "stiefel" no esta explicado: no se puede confirmar la tecnica de optimizacion empleada ni su impacto.
- Para produccion, se recomienda tratar este adaptador como experimental y validar su comportamiento en el dominio Qiskit antes de integrarlo en cualquier pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel
- Modelo base: https://huggingface.co/Qiskit/granite-3.3-8b-qiskit
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
