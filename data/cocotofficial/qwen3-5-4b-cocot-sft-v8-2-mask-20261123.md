# cocotofficial/Qwen3.5-4B-CoCoT-SFT-v8.2-mask-20261123

## Resumen

Qwen3.5-4B-CoCoT-SFT-v8.2-mask-20261123 es un checkpoint de inferencia publicado por el usuario cocotofficial, resultado de un ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B. El modelo está especializado en la generación de código Three.js dentro de un flujo de razonamiento encadenado (CoT, chain-of-thought): el entrenamiento enmascara el cuerpo del razonamiento y supervisa únicamente el código Three.js generado. Se trata, por tanto, de un modelo afinado para una tarea muy concreta, no de un modelo de propósito general.

El checkpoint corresponde a la época 4 (paso global 164) de un entrenamiento realizado con 2.609 ejemplos del dataset cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8. El pipeline declarado en Hugging Face es image-text-to-text, lo que sugiere entrada multimodal (imagen y texto) y salida de texto, aunque la model card no detalla el papel exacto de la imagen en la tarea.

Por su naturaleza (fine-tune de un modelo de 4B sobre un dataset pequeño y muy específico), su relevancia es acotada: interesa a desarrolladores que quieran reproducir o evaluar la generación de escenas Three.js a partir de instrucciones, no como sustituto de un modelo generalista. El repositorio tiene 10,4 GB, 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles de la arquitectura base no disponibles) |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-4B |
| Dataset de entrenamiento | cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8 (2.609 ejemplos) |
| Checkpoint | época 4, paso global 164 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 5.170 millones de parámetros según los pesos publicados. Sobre esa base se aplicó un ajuste fino supervisado con 2.609 ejemplos del dataset mmsi-hss-qwen4max-threejs-sft-v8. La innovación declarada por el autor es la estrategia de enmascaramiento de la pérdida: durante el entrenamiento se enmascara el cuerpo del razonamiento (CoT) y solo se supervisa el código Three.js generado. Esto orienta al modelo a producir código correcto independientemente de la calidad del razonamiento intermedio, y es coherente con el nombre "mask" del checkpoint.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. El pipeline image-text-to-text sugiere que el modelo acepta imágenes además de texto, pero la model card no describe cómo se usan las imágenes en la tarea de generación de Three.js.

## Capacidades

- Generación de código Three.js: capacidad principal y objetivo explícito del ajuste fino.
- Razonamiento encadenado (CoT): el modelo fue entrenado con cuerpos de razonamiento, aunque la supervisión se aplica solo al código final.
- Entrada multimodal: el pipeline declarado es image-text-to-text, por lo que se espera soporte de entrada de imagen y texto (sin detalles en la model card).
- Conversación: la etiqueta "conversational" indica formato de diálogo multi-turno.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Generación de escenas Three.js a partir de descripciones: el modelo recibe una instrucción en lenguaje natural y produce código Three.js; es su tarea de entrenamiento directa y el escenario para el que fue ajustado.
- Prototipado rápido de visualizaciones 3D: un desarrollador puede obtener un esqueleto de escena (cámara, luces, geometrías) y refinarlo manualmente, reduciendo el tiempo de arranque en proyectos web 3D.
- Asistente interno de código para equipos de gráficos web: integrado en un editor o IDE, sugiere fragmentos de Three.js coherentes con el contexto conversacional.
- Generación de ejemplos didácticos: producción de snippets de Three.js para tutoriales o documentación, dado su entrenamiento específico en ese dominio.
- Evaluación de la estrategia de enmascaramiento CoT: investigadores pueden comparar este checkpoint con variantes sin máscara para estudiar el efecto del enmascaramiento en la calidad del código generado.
- Reproducción de experimentos de SFT: al estar vinculado a un dataset y un paso de entrenamiento concretos, sirve para replicar o auditar el pipeline de ajuste fino.
- Entrada image-text-to-text (si se confirma el uso de imágenes): generación de código 3D condicionada por una imagen de referencia, aunque la model card no detalla este flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 10,4 GB solo para pesos (5.175 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16 GB de VRAM para contexto moderado.
- Cuantización a 8 bits: alrededor de 5-6 GB de pesos; a 4 bits, alrededor de 3 GB, aunque no se publican pesos cuantizados en el repo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para fp16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090/3090 en fp16; en GPUs de 8-12 GB requeriría cuantización, que no está publicada y habría que generar localmente.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión o verificación previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-CoCoT-SFT-v8.2-mask | 5.175 M | no disponible | no disponible | Hugging Face (0 descargas) | Fine-tune específico para Three.js con enmascaramiento CoT |
| Qwen/Qwen3.5-4B (base) | ~4B (según nombre) | no disponible | no disponible | Hugging Face | Modelo generalista del que deriva; sin especialización en Three.js |
| Alternativas generalistas de ~4B para código | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas; los datos de rendimiento de este checkpoint y de su base no están publicados en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: entrenado con 2.609 ejemplos para una única tarea (Three.js); su rendimiento fuera de ese dominio no está caracterizado y probablemente sea inferior al del modelo base.
- Dataset pequeño y de un solo autor: riesgo elevado de sobreajuste y de baja generalización a estilos o instrucciones distintas de las del dataset.
- Licencia no declarada: no se puede asumir uso comercial; es imprescindible verificar la licencia del modelo base Qwen/Qwen3.5-4B y contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el soporte multilingüe; no se debe asumir comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir APIs de Three.js inexistentes o código que no compila; requiere validación automática (ejecución, linting) en cualquier pipeline.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio sin tracción (0 descargas, 0 likes) y sin documentación de sesgos, evaluación de seguridad ni limitaciones por parte del autor.
- El pipeline image-text-to-text no está explicado en la model card; el manejo de imágenes en producción es incierto.
- Formato únicamente safetensors: no hay GGUF ni cuantizaciones listas, lo que complica el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cocotofficial/Qwen3.5-4B-CoCoT-SFT-v8.2-mask-20261123
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Dataset de entrenamiento: https://huggingface.co/datasets/cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8/tree/bb7a25a4384fb12cef2b41d6bfb9b8108e72818c
- Paper, blog o demo adicionales: no disponibles
