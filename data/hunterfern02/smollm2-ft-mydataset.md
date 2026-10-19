# HunterFern02/SmolLM2-FT-MyDataset

## Resumen

SmolLM2-FT-MyDataset es un ajuste fino (fine-tuning) supervisado del modelo HuggingFaceTB/SmolLM2-135M, publicado por el usuario HunterFern02 bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 134.515.008 parámetros (unos 135 millones) con arquitectura transformer decoder-only de estilo Llama, derivado de la familia SmolLM2 de Hugging Face. El repositorio ocupa 0,5 GB y contiene pesos en safetensors listos para cargarse con transformers.

El interés del modelo no reside en su rendimiento, sino en su carácter de artefacto didáctico: las etiquetas del repositorio (smol-course, module_1, trl, sft, generated_from_trainer) indican que se generó como ejercicio del módulo 1 del curso Smol de Hugging Face, empleando la librería TRL para el entrenamiento supervisado. La model card se generó automáticamente y el propio autor no ha documentado el conjunto de datos de ajuste, que aparece literalmente como "unknown dataset".

Por tanto, es relevante como ejemplo reproducible de un pipeline SFT completo (hiperparámetros, curva de pérdida, versiones de framework) y como material de partida para experimentos con modelos de menos de 200 millones de parámetros, no como un modelo listo para producción. No se han publicado resultados de benchmarks ni información sobre idiomas o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo Llama (heredada de SmolLM2-135M) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base SmolLM2-135M declara 8.192 tokens) |
| Tipos de cuantizacion | No se publican pesos cuantizados; al ser un transformer estandar es convertible a GGUF, int8 o int4 con herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos, sin versiones GGUF ni ONNX en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base SmolLM2-135M: un transformer decoder-only denso con atención causal, normalización y tokenizador de la familia Llama, sin modificaciones estructurales por parte del autor del ajuste. El fine-tuning se realizó con TRL sobre transformers 4.44.2, PyTorch 2.6.0+cu124, datasets 3.0.2 y tokenizers 0.19.1. Los hiperparámetros documentados son: tasa de aprendizaje 5e-5, batch de entrenamiento de 4, batch de evaluación de 8, semilla 42, optimizador Adam con betas (0,9; 0,999) y épsilon 1e-8, scheduler lineal y 1.000 pasos de entrenamiento, que equivalen a aproximadamente 1,77 épocas sobre el conjunto de datos.

El conjunto de datos de ajuste no está especificado ("unknown dataset"), lo que impide evaluar la composición, el idioma, el volumen de tokens o si hubo etapas de alineación adicionales (RLHF, DPO). No se documenta ninguna innovación técnica: no hay decodificación especulativa, atención lineal ni mezcla de expertos. La única métrica reportada es la pérdida: 1,0715 en el primer punto de validación (paso 50) y 1,0215 al final (paso 1.000), con una pérdida de entrenamiento de 0,7959 en el último paso. La curva de validación se aplana a partir del paso ~550, lo que sugiere que el modelo converge pronto y que el ajuste adicional aporta mejoras marginales.

## Capacidades

- Generación de texto autoregresiva en el dominio del conjunto de datos de ajuste, que no ha sido documentado.
- Conversación multi-turno: la etiqueta `conversational` del repositorio indica formato de diálogo, aunque no se detalla la plantilla de chat empleada.
- Ajuste supervisado verificable: el repositorio conserva los artefactos de entrenamiento (curva de pérdida, hiperparámetros, versiones), lo que permite reproducir el proceso.
- Compatibilidad con text-generation-inference y con endpoints compatibles, según las etiquetas del repositorio.
- No hay evidencia documentada de tool calling, function calling, razonamiento multi-paso, capacidades matemáticas, visión, audio ni modo de pensamiento extendido.
- Capacidades multilingües: no disponibles; no se declara ningún idioma soportado.

## Casos de uso

- Plantilla reproducible de fine-tuning SFT: sirve como referencia de configuración (5e-5, Adam, scheduler lineal, 1.000 pasos) para replicar el pipeline con TRL sobre otros conjuntos de datos pequeños.
- Experimentación en hardware de gama muy baja: con 135 millones de parámetros cabe en CPU, Raspberry Pi o GPUs integradas, lo que permite validar pipelines de inferencia completos sin coste de GPU.
- Docencia y talleres: es útil para demostrar el ciclo completo de un curso (carga del modelo base, tokenización, entrenamiento, publicación en el Hub, carga con transformers) con tiempos de ejecución de minutos.
- Pruebas de integración de infraestructura: al ser compatible con text-generation-inference y con endpoints, permite validar despliegues, balanceo y monitorización antes de migrar a modelos mayores.
- Ajuste de dominio acotado como prueba de concepto: si el conjunto de datos de ajuste resultara ser de un dominio concreto (por confirmar por el autor), el modelo podría emplearse para generar plantillas o textos cortos de ese dominio, siempre con revisión humana.
- Ablaciones de hiperparámetros: su tamaño reducido permite ejecutar barridos de tasa de aprendizaje, batch size o número de pasos en paralelo y comparar curvas de pérdida a bajo coste.
- Generación de texto de relleno en pruebas de interfaz: útil para poblar entornos de desarrollo y tests de UI donde la calidad lingüística no es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una entrada (`SmolLM2-FT-MyDataset`) con la lista de resultados vacía, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada.

Los únicos datos numéricos reportados por el autor son las pérdidas de entrenamiento y validación:

| Metrica | Valor | Paso |
|---|---|---|
| Perdida de validacion inicial | 1,1590 | 50 |
| Perdida de validacion final | 1,0215 | 1.000 |
| Perdida de entrenamiento final | 0,7959 | 1.000 |
| Epocas completadas | ~1,77 | 1.000 |

La pérdida de validación no es comparable entre modelos ni constituye una medida de calidad: depende del conjunto de evaluación, que no ha sido publicado.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0,54 GB en fp32 y 0,27 GB en fp16/bf16 para los pesos; en torno a 0,14 GB en int8 y 0,07 GB en int4. El KV cache es marginal incluso con contextos largos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; funcionan A100, H100, RTX 4090, RTX 3060, GTX 1650 o incluso GPUs integradas. También es viable en CPU.
- Cabe en cualquier GPU de consumo, incluida la gama baja, y en dispositivos tipo Raspberry Pi 4/5 o mini-PC con 2 GB de RAM.
- Opciones de despliegue: transformers (probado por el autor con 4.44.2), text-generation-inference (etiqueta del repositorio), vLLM y, previa conversión a GGUF, llama.cpp u Ollama. El repositorio no incluye pesos GGUF, por lo que Ollama y llama.cpp requieren una conversión manual.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-FT-MyDataset | 134,5 M | No disponible (base: 8.192 tokens) | Ninguno | Apache 2.0 | Hugging Face |
| SmolLM2-135M (base) | 135 M | 8.192 tokens | Si, reportados por Hugging Face | Apache 2.0 | Hugging Face |
| SmolLM2-360M | 362 M | 8.192 tokens | Si, reportados por Hugging Face | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens | Si, reportados por Alibaba | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Si, reportados por el autor | Apache 2.0 | Hugging Face |

Los datos de contexto y benchmarks de los modelos comparados provienen de sus respectivas model cards publicas y no de la informacion proporcionada para este modelo. La ventaja competitiva de SmolLM2-FT-MyDataset es únicamente su huella mínima; frente a SmolLM2-135M base no aporta mejoras documentadas, y frente a Qwen2.5-0.5B-Instruct o TinyLlama-1.1B queda muy por detrás en capacidad y en contexto, a cambio de un coste de inferencia mucho menor.

## Limitaciones y advertencias

- El conjunto de datos de ajuste es desconocido, por lo que no es posible evaluar sesgos, dominios cubiertos, idioma ni calidad de las respuestas.
- Con 135 millones de parámetros el riesgo de alucinación y de incoherencia en razonamientos de varios pasos es alto; no es adecuado para tareas que requieran precisión factual sin verificación.
- No se han publicado evaluaciones de ningún tipo; la pérdida de 1,0215 no indica calidad y el aplanamiento de la curva sugiere un posible ajuste excesivo al conjunto de validación.
- La model card es automática y contiene secciones sin completar ("More information needed"), incluida la descripción del modelo, los usos previstos y los datos de entrenamiento.
- No se declara ningún idioma soportado; el modelo base SmolLM2 está orientado principalmente al inglés, por lo que el rendimiento en castellano es incierto.
- No se especifica la plantilla de chat ni el tokenizador especial empleado, lo que puede provocar degradación si se aplica un formato de conversación distinto al usado durante el ajuste.
- La licencia Apache 2.0 permite uso comercial, pero el titular no ofrece garantías; antes de usarlo en producción debe validarse con un conjunto de evaluación propio.
- No hay pesos cuantizados publicados; el despliegue en llama.cpp u Ollama exige conversión manual y validación posterior.
- La fecha de creación del repositorio (2026-10-19) y el nombre "MyDataset" lo sitúan como un ejercicio de curso sin mantenimiento previsto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HunterFern02/SmolLM2-FT-MyDataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Librería TRL (mencionada en las etiquetas): no se incluye enlace en la model card
- Curso Smol (etiqueta `smol-course`): no se incluye enlace en la model card
- Paper, blog o demo: no disponibles en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
