# SmuFypTeam5/GradingQlora

## Resumen

GradingQlora (identificador interno `alpha_96`) es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base Qwen/Qwen3.5-9B. Lo publica el usuario SmuFypTeam5 en Hugging Face, presumiblemente como resultado de un proyecto de fin de grado (la nomenclatura "Fyp" y "Team5" apunta a un trabajo academico en equipo). No se trata de un modelo completo, sino de pesos delta que deben cargarse junto al modelo base de 9.000 millones de parametros para poder utilizarse.

El adaptador se ha entrenado con la libreria TRL (version 1.17.1) y PEFT (0.21.2), y se distribuye en formato safetensors con un tamano de repositorio de 4,7 GB. La model card es practicamente un esqueleto generado automaticamente: no documenta el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni los hiperparametros, y el ejemplo de codigo rapido contiene un marcador `model="None"` que no es funcional tal cual. Tampoco se declaran licencia ni idiomas soportados.

Su relevancia es limitada y de nicho: sirve como ejemplo de adaptador LoRA para Qwen3.5-9B orientado a tareas de evaluacion o calificacion (el nombre "Grading" sugiere correccion automatica de respuestas), pero carece de la documentacion minima para evaluar su calidad, sus datos de entrenamiento o sus restricciones legales de uso. A fecha de la ultima actualizacion (noviembre de 2026) acumula 45 descargas y ningun "like".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (adaptador; el modelo base tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B; no declarada) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; QLoRA implica cuantizacion 4-bit durante el entrenamiento, no necesariamente en inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se entrena mediante SFT (supervised fine-tuning) con TRL sobre el modelo base Qwen/Qwen3.5-9B, que permanece congelado; solo se actualizan las matrices de bajo rango insertadas en las capas del transformer. El prefijo "Qlora" del nombre del repositorio sugiere que el entrenamiento se realizo con cuantizacion de 4 bits del modelo base (QLoRA), aunque la model card no lo confirma ni detalla la configuracion de cuantizacion.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO posterior ni innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.). Las versiones de framework declaradas son PEFT 0.21.2, TRL 1.17.1, Transformers 5.22.1, PyTorch 2.10.0+cu126, Datasets 5.1.0 y Tokenizers 0.23.3. El nombre de modelo interno es `alpha_96`, lo que sugiere que forma parte de una bateria de experimentos y que este es una variante concreta.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-9B.
- Ajuste orientado a tareas de evaluacion o calificacion (por el nombre "Grading"), aunque no se documenta el formato exacto de entrada/salida.
- Soporte de tool calling y function calling: no documentado para el adaptador; dependeria del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no declaradas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Correccion automatica de respuestas abiertas en entornos educativos: el adaptador parece entrenado para tareas de calificacion; podria usarse para puntuar respuestas de alumnos frente a una rubrica, aunque la ausencia de documentacion sobre el dataset obliga a validarlo empiricamente antes de confiar en sus puntuaciones.
- Prototipado de pipelines de evaluacion con LLM-as-a-judge: al ser un adaptador pequeno (4,7 GB) sobre un base de 9B, permite experimentar con un juez especializado sin desplegar un modelo mayor.
- Investigacion academica sobre fine-tuning con QLoRA: sirve como referencia reproducible de un adaptador SFT entrenado con TRL y PEFT sobre Qwen3.5-9B.
- Generacion de texto conversacional general: si se carga junto al base, puede mantener dialogos multi-turno, aunque sin garantias documentadas sobre contexto maximo.
- Clasificacion o puntuacion de texto estructurado: utilizable como componente en pipelines de scoring cuando se necesita una salida numerica o categorica, previa validacion del formato de salida.
- Base para fine-tuning adicional: al ser un adaptador LoRA, puede combinarse o continuar entrenandose con otros datasets sin tocar los pesos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 4,7 GB en disco, pero requiere cargar el modelo base Qwen3.5-9B. En fp16, el base ocupa aproximadamente 18 GB; en cuantizacion 4-bit, en torno a 5-6 GB, a lo que se suma el adaptador.
- GPU recomendadas: A100 40 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 con margen ajustado o para 8-bit; RTX 3090/4080 (16-24 GB) para cuantizacion 4-bit.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas usando cuantizacion 4-bit del modelo base; en 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (soporte de adaptadores LoRA), TGI; llama.cpp/Ollama requeririan fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| GradingQlora (este) | adaptador sobre 9B | no disponible | no disponible | safetensors (LoRA) | minima (model card automatica) |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible en esta ficha | la del modelo base | safetensors | oficial del autor Qwen |
| Adaptadores LoRA SFT genericos sobre Qwen | variable | heredado del base | variable | safetensors | variable |

No se dispone de datos de rendimiento para comparar con alternativas de la misma tarea (evaluacion/calificacion), por lo que la comparativa se limita a aspectos estructurales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar el modelo base, arrastra los sesgos de Qwen3.5-9B y los del dataset de SFT, que se desconoce.
- Riesgo de alucinacion: alto en tareas de calificacion si no se valida contra una rubrica; no hay evaluacion publicada que lo acote.
- Limitaciones de contexto o idioma: no declaradas; el contexto maximo depende del base y no se especifica.
- Restricciones de licencia: la licencia no esta disponible, lo que impide asumir uso comercial permitido. El campo `licence: license` de la model card no aporta informacion legal util.
- Caveats para produccion: la model card es una plantilla autogenerada con el ejemplo de codigo roto (`model="None"`), sin dataset, hiperparametros ni evaluacion; el adaptador no deberia desplegarse en produccion sin una validacion propia exhaustiva. El nombre del repositorio sugiere un contexto academico sin mantenimiento garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/SmuFypTeam5/GradingQlora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio TRL: https://github.com/huggingface/trl
