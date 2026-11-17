# Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel-adapter

## Resumen

El repositorio `Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel-adapter` contiene un adaptador LoRA entrenado mediante SFT sobre el modelo base `Qiskit/granite-3.3-8b-qiskit`, una variante de IBM Granite 3.3 de 8.000 millones de parametros especializada en computacion cuantica y Qiskit. El adaptador, publicado por el usuario Polydim-Einsof, se distribuye en formato PEFT con pesos safetensors y ocupa aproximadamente 0,2 GB, lo que corresponde al conjunto de matrices de bajo rango inyectadas en el modelo base.

El nombre del repositorio sugiere un ajuste orientado a tecnicas de algebra lineal relacionadas con la variedad de Stiefel, un objeto matematico habitual en optimizacion sobre variedades y en formulaciones de compuertas cuanticas, aunque la model card no documenta explicitamente el dataset de entrenamiento ni el objetivo concreto del ajuste. Se trata de un artefacto de investigacion sin descargas ni interacciones registradas en el momento de la consulta, y su model card mantiene la plantilla generica de Hugging Face sin completar.

Su relevancia es limitada fuera del contexto del autor: no hay datos publicados sobre rendimiento, composicion del dataset ni hiperparametros, y la licencia no esta declarada. Para evaluar su utilidad es necesario cargar el adaptador junto con el modelo base y realizar una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (base: Qiskit/granite-3.3-8b-qiskit) |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base tiene 8.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada en el adaptador) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Version de PEFT | 0.21.3 |
| Tamano del repositorio | 0,2 GB |
| Tipo de entrenamiento | SFT (supervised fine-tuning) |
| Modelo base | Qiskit/granite-3.3-8b-qiskit |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `Qiskit/granite-3.3-8b-qiskit`, que pertenece a la familia IBM Granite 3.3 de transformers decoder-only con 8.000 millones de parametros. El adaptador inyecta matrices de bajo rango en las capas del modelo base y se entrena manteniendo congelados los pesos originales, lo que explica su tamano reducido de 0,2 GB.

Segun las etiquetas del repositorio, el entrenamiento se realizo mediante SFT con las librerias Transformers y TRL, y el resultado se empaqueta con PEFT 0.21.3. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el rango del adaptador, el valor de alpha, la tasa de aprendizaje ni si se aplicaron tecnicas adicionales como DPO o RLHF. Tampoco se documentan innovaciones tecnicas propias; el interes del ajuste parece residir en la especializacion tematica (Qiskit y, por el nombre, algebra de Stiefel) mas que en cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Granite 3.3 de 8B.
- Especializacion presumible en computacion cuantica y Qiskit, dado el modelo base y el nombre del adaptador.
- Posible orientacion a razonamiento matematico sobre variedades de Stiefel, segun el nombre del repositorio; no confirmado en la model card.
- Soporte de tool calling y function calling: no disponible en la informacion del adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Experimentacion en computacion cuantica asistida: cargar el adaptador sobre `Qiskit/granite-3.3-8b-qiskit` para generar y explicar circuitos Qiskit en entornos de investigacion, aprovechando la especializacion tematica del ajuste.
- Investigacion en optimizacion sobre la variedad de Stiefel: usar el adaptador como punto de partida para tareas de generacion o explicacion de formulaciones matematicas relacionadas, siempre con validacion manual de las salidas.
- Reproduccion de experimentos de SFT: el repositorio sirve como referencia para estudiar la configuracion de PEFT 0.21.3 y TRL aplicada a un modelo Granite de 8B.
- Evaluacion comparativa de adaptadores: medir la diferencia de comportamiento entre el modelo base y el adaptador en tareas de dominio cuantico mediante un conjunto de evaluacion propio.
- Prototipado interno de asistentes tecnicos: integrar el adaptador en un pipeline de Transformers para generar borradores de documentacion tecnica sobre Qiskit, con revision humana obligatoria.
- Docencia y formacion: emplear el adaptador como ejemplo practico de fine-tuning LoRA sobre un modelo de 8B en cursos de IA aplicada, dado su reducido tamano de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion completada ni metricas de ningun tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base completo. En precision bf16, un modelo de 8B necesita aproximadamente 16 GB de VRAM; en cuantizacion de 8 bits, alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB. El adaptador anade un consumo marginal (0,2 GB en disco).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16; RTX 3090 o RTX 4080 para cuantizacion de 8 bits.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantizacion de 4 bits, en GPUs con 8 GB de VRAM.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en el servidor; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| einsof2-granite-8b-qiskit-stiefel-adapter | Adaptador LoRA sobre 8B | no disponible | Adaptador PEFT | no disponible | Hugging Face, 0 descargas |
| Qiskit/granite-3.3-8b-qiskit (modelo base) | 8B | no disponible en esta ficha | Modelo completo | no disponible en esta ficha | Hugging Face |
| IBM Granite 3.3 8B (modelo general) | 8B | no disponible en esta ficha | Modelo completo | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card esta sin completar: no hay informacion sobre dataset, hiperparametros, evaluacion ni uso previsto.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base y del adaptador antes de cualquier despliegue en produccion.
- Al ser un adaptador de investigacion sin validacion publicada, el riesgo de alucinacion y de errores en contenido tecnico (circuitos, formulas) es alto y requiere revision experta.
- No hay datos sobre sesgos; los sesgos heredados del modelo base no estan documentados en este repositorio.
- El repositorio no registra descargas ni interacciones, por lo que no existe evidencia de uso comunitario ni de mantenimiento.
- El nombre sugiere un dominio muy especifico (Stiefel, Qiskit); fuera de ese dominio el adaptador puede degradar el comportamiento respecto al modelo base.
- No se declaran idiomas soportados; el comportamiento en castellano no esta verificado.
- La fecha de creacion del repositorio (2026) y la ausencia de documentacion aconsejan tratarlo como artefacto experimental, no como componente listo para produccion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Polydim-Einsof/einsof2-granite-8b-qiskit-stiefel-adapter
- Modelo base: https://huggingface.co/Qiskit/granite-3.3-8b-qiskit
- Paper de referencia sobre impacto computacional citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
