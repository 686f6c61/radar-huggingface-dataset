# Lucasgitguy-co/minimind-mermaid-run2

## Resumen

MiniMind-3 Mermaid - Run 2 Epoch Checkpoints es una coleccion de checkpoints de ajuste fino (finetune) publicada por el usuario Lucasgitguy-co sobre el modelo base jingyaogong/minimind-3. El repositorio no contiene un unico modelo final, sino tres carpetas independientes (`ep1`, `ep2`, `ep3`) que corresponden a las epocas 1, 2 y 3 de un mismo entrenamiento orientado a la generacion de diagramas Mermaid. Cada checkpoint incluye pesos en safetensors, fichero de configuracion y ficheros de tokenizer, con un tamano aproximado de 0,256 GB por checkpoint (0,8 GB en total para el repositorio).

El modelo se distribuye a traves de la libreria transformers y se declara con la arquitectura `Qwen3ForCausalLM`, pesos en float16, 8 capas ocultas, tamano oculto de 768 y un vocabulario de 6.400 tokens. Se trata, por tanto, de un modelo de lenguaje de muy pequeno tamano, disenado para generacion de texto y especializado mediante finetune en la sintaxis de diagramas Mermaid. La model card es explicitamente conservadora: describe los artefactos y la configuracion, pero no documenta el conjunto de datos de entrenamiento, el procedimiento completo ni resultados de evaluacion.

La relevancia de esta publicacion es acotada pero concreta: ofrece checkpoints intermedios reproducibles de un finetune especializado en Mermaid sobre una base MiniMind, con licencia Apache 2.0 y pesos en formato estandar. Resulta util para quien quiera inspeccionar la evolucion del entrenamiento por epocas, experimentar con generacion de diagramas en un modelo pequeno o reutilizar la receta sobre el modelo base. No es, en ningun caso, un modelo de proposito general ni compite en capacidad con modelos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3ForCausalLM` segun `config.json`) |
| Parametros totales | no disponible (no declarado; coherente con 8 capas, hidden 768 y vocab 6.400) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16), con config y tokenizer por checkpoint |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only identificada en la configuracion como `Qwen3ForCausalLM`, con 8 capas ocultas, un tamano oculto de 768 y un vocabulario de 6.400 tokens. Los pesos se exportan en float16 y el repositorio registra Transformers 4.57.6 como version de exportacion. No se incluye proyector de vision: es un modelo exclusivamente de texto. El repositorio contiene tres checkpoints (`ep1`, `ep2`, `ep3`) de aproximadamente 0,256 GB cada uno, lo que permite comparar el estado del modelo tras cada epoca de entrenamiento.

El modelo parte de jingyaogong/minimind-3 mediante finetune, orientado segun los metadatos a la generacion de diagramas Mermaid. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. Tampoco se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). Los enlaces a los datasets del mismo autor (`mermaid-diagram-text-images` y `mermaid-text-en-nl`) se presentan como recursos relacionados del proyecto, pero la propia card advierte que no establecen el split exacto de entrenamiento de cada checkpoint.

## Capacidades

- Generacion de texto autoregresiva en ingles con transformers.
- Generacion de diagramas en sintaxis Mermaid, presumiblemente el objetivo del finetune (no validado con benchmarks en la informacion disponible).
- Seleccion de checkpoint por epoca (`ep1`, `ep2`, `ep3`) para comparar estados de entrenamiento.
- Carga estandar mediante `AutoTokenizer` y `AutoModelForCausalLM` con `subfolder`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles declarado.
- No incluye vision, audio ni proyector multimodal.
- No se documenta modo de razonamiento explicito (thinking mode).

## Casos de uso

- Generacion de diagramas Mermaid en documentacion tecnica: el modelo puede producir bloques de sintaxis Mermaid a partir de una descripcion textual, lo que permite integrarlo en flujos de documentacion como MkDocs o Docusaurus que renderizan Mermaid de forma nativa.
- Prototipado de asistentes de diagramacion: al ser un modelo pequeno (0,256 GB por checkpoint), se puede desplegar en entornos con recursos limitados para experimentar con la generacion de flowcharts, diagramas de secuencia o diagramas de clases.
- Investigacion sobre finetune especializado: los tres checkpoints por epoca permiten estudiar la evolucion del aprendizaje de una sintaxis formal concreta y comparar la calidad de las salidas entre ep1, ep2 y ep3.
- Educacion y ensenanza de Mermaid: el modelo puede servir como generador de ejemplos de sintaxis para materiales docentes, siempre con revision humana dada la ausencia de evaluacion publicada.
- Pipeline de generacion de diagramas con validacion posterior: combinado con un validador de sintaxis Mermaid (por ejemplo, el parser oficial o mermaid-cli), se puede usar como primer paso generativo y descartar las salidas invalidas.
- Reproducibilidad de experimentos: al estar los pesos en safetensors con config y tokenizer por checkpoint, se puede replicar la carga exacta documentada en la model card para comparar resultados entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los datos de entrenamiento, el procedimiento y los resultados de evaluacion no estan documentados en los artefactos inspeccionados, y que los ejemplos de carga son orientativos y no una afirmacion de calidad medida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float16 por checkpoint (0,256 GB de pesos); en la practica, unos 1-2 GB contando activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una GTX 1650, RTX 3050, RTX 4060 o superior cubre el caso con holgura.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM; tambien es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (documentado en la model card); llama.cpp, Ollama, vLLM o TGI no estan documentados para este repositorio y requeririan conversion previa de los pesos.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 8 capas y hidden 768, la latencia esperada es baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minimind-mermaid-run2 (este) | no disponible (8 capas, hidden 768, vocab 6.400) | no disponible | Mermaid | Apache 2.0 | HuggingFace |
| jingyaogong/minimind-3 (base) | no disponible en esta ficha | no disponible | Proposito general (base) | no disponible en esta ficha | HuggingFace |
| Modelos Qwen3 pequenos | no disponible en esta ficha | no disponible | Proposito general | no disponible en esta ficha | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni metricas de calidad de los diagramas generados, ni validacion de sintaxis Mermaid reportada.
- Riesgo elevado de alucinacion: al ser un modelo muy pequeno y especializado, es probable que produzca sintaxis Mermaid invalida o diagramas incoherentes; se recomienda validacion automatica en produccion.
- Documentacion incompleta: no se detalla el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de alineacion; la trazabilidad del finetune es parcial.
- Idioma limitado: solo se declara ingles, sin garantias de comportamiento en castellano u otros idiomas.
- Contexto desconocido: no se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con entradas largas.
- Naturaleza de checkpoints intermedios: `ep3` se presenta como ejemplo de seleccion, no como el mejor checkpoint documentado; la eleccion entre ep1, ep2 y ep3 debe validarse empiricamente.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar el aviso de licencia y las atribuciones de terceros (incluida la atribucion al modelo base) al redistribuir.
- Sesgos: no documentados; al derivar de un modelo base de muy pequeno tamano y de datos no descritos, los sesgos pueden ser dificiles de auditar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lucasgitguy-co/minimind-mermaid-run2
- Modelo base: https://huggingface.co/jingyaogong/minimind-3
- Dataset relacionado (texto e imagenes de diagramas): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset relacionado (texto original en ingles/neerlandes): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Documentacion del repositorio (referenciada en la model card): `docs/FILE_STRUCTURE.md`, `docs/PROVENANCE.md`, `CHANGELOG.md`
