# sartajbhuvaji/bonsai-distilled-depth24-experts0-500-warmup75-lr1e4-fixedloss

## Resumen

Este checkpoint es un modelo de generación de texto publicado en HuggingFace por el usuario sartajbhuvaji, con arquitectura etiquetada como qwen3_moe y 15.577.227.264 parámetros totales según los safetensors del repositorio. El nombre del modelo incluye indicios de un proceso de destilación y varios hiperparámetros ("depth24", "experts0", "warmup75", "lr1e4", "fixedloss"), pero la model card es una plantilla autogenerada y no documenta el diseño, los datos ni el procedimiento de entrenamiento.

Por su tamaño y formato, el checkpoint es relevante para experimentación con modelos de aproximadamente 15,6B parámetros y para estudiar variantes de la familia Qwen3, no como un modelo listo para producción: no hay licencia, idiomas, contexto, cuantizaciones ni benchmarks publicados, y el repositorio no tiene descargas ni validación de la comunidad. Cualquier uso requiere inspeccionar la configuración, ejecutar evaluaciones propias y aclarar la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_moe (etiqueta de HuggingFace); configuración de capas, atención y expertos no disponible |
| Parámetros totales | 15.577.227.264 |
| Parámetros activos | no disponible; el nombre incluye "experts0", pero no se confirma si es MoE ni cuántos expertos se activan |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors, sin GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 31,2 GB |
| Pipeline | text-generation |
| Librería | transformers |
| Compatibilidad declarada | etiqueta endpoints_compatible; no hay documentación adicional |

## Arquitectura y entrenamiento

La etiqueta qwen3_moe sugiere un transformer con mezcla de expertos de la familia Qwen3, pero no hay documentación que confirme número de capas, dimensión oculta, mecanismo de atención, número de expertos ni función de activación. El nombre del checkpoint ("depth24", "experts0", "warmup75", "lr1e4", "fixedloss") parece codificar una configuración de destilación o entrenamiento —posiblemente 24 capas, calentamiento de 75 pasos y tasa de aprendizaje 1e-4—, pero son solo indicios del identificador, no especificaciones verificadas.

No se dispone de información sobre volumen de tokens, composición del corpus, uso de RLHF/DPO, decodificación especulativa, atención lineal u otras innovaciones. La model card no incluye secciones técnicas completas y remite a "[More Information Needed]" en todos los apartados relevantes. El tag arxiv:1910.09700 corresponde a Lacoste et al. (2019) sobre impacto ambiental, no a un paper de este modelo.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es text-generation y la librería es transformers; no hay ejemplos ni parámetros de generación publicados.
- Conversación: el tag conversational indica uso previsto para diálogo, pero no se documenta plantilla de chat, tokens especiales ni longitud de contexto.
- Integración con endpoints: el tag endpoints_compatible sugiere compatibilidad con servidores de inferencia; requiere verificación real.
- Tool calling y function calling: no disponible; no hay evidencia en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible; no se han publicado evaluaciones.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Visión, audio y otras modalidades: no disponible; el pipeline es solo texto.
- Modo thinking o razonamiento explícito: no disponible; no se documenta.

## Casos de uso

- Auditoría de un checkpoint experimental: cargar el modelo con transformers, inspeccionar config.json y los pesos para confirmar si realmente usa MoE, cuántas capas tiene y qué expertos contiene; es adecuado porque el nombre y la model card no son concluyentes.
- Fine-tuning supervisado en dominio acotado: partir de los safetensors de 15,6B y entrenar con LoRA o QLoRA en un corpus propio, siempre que se aclare la licencia; el tamaño permite usar GPUs de 24-80 GB según precisión.
- Generación de texto en prototipos internos: usar el pipeline text-generation para prompts de prueba y comparar salidas con otros checkpoints Qwen3; adecuado solo para entornos de laboratorio.
- Demos conversacionales de corta duración: aprovechar el tag conversational para un chatbot de prueba con historial limitado, midiendo antes la ventana de contexto real porque no está publicada.
- Investigación sobre destilación: reproducir o analizar la receta implícita en el nombre ("depth24", "warmup75", "lr1e4", "fixedloss") y medir pérdida y curvas; el checkpoint sirve como punto de partida, no como resultado validado.
- Benchmarking reproducible: ejecutar MMLU, HumanEval o GSM8K con un harness propio para obtener números que el autor no publica; necesario antes de considerar cualquier uso comparativo.
- Despliegue en endpoint compatible: probar el tag endpoints_compatible en un servicio interno, verificando VRAM y latencia; no recomendado para producción sin licencia y evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 31,2 GB solo para parámetros (15.577.227.264 × 2 bytes). Con activaciones y KV cache, se recomienda 40-80 GB de VRAM; A100 40GB puede quedar justa y A100/H100 80GB es la opción segura.
- Pesos en INT8/FP8: aproximadamente 15,6 GB; con overhead, 24 GB de VRAM puede ser suficiente para contextos cortos, aunque no hay cuantizaciones publicadas. Encajan RTX 4090 24GB, A100 40GB y H100.
- Pesos en INT4: aproximadamente 7,8 GB; con overhead, 12-16 GB puede bastar. Encajan RTX 4070 Ti Super 16GB, RTX 4080/4090 y GPUs similares, pero requiere generar una cuantización propia porque el repositorio no incluye GGUF, AWQ ni GPTQ.
- CPU: posible con 32 GB de RAM o más si se convierte a GGUF y se usa llama.cpp, pero no hay archivo GGUF publicado.
- GPU recomendadas: A100 80GB o H100 80GB para FP16/BF16; RTX 4090 24GB para INT8/INT4; GPUs de 16GB para INT4 con contexto corto.
- Opciones de despliegue: transformers de forma nativa; vLLM o TGI si soportan la arquitectura qwen3_moe; llama.cpp u Ollama solo tras conversión a GGUF, no disponible.
- Latencia y throughput: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos verificables de alternativas en la información proporcionada. Se citan posibles referencias de la misma familia, sin cifras, para evitar inventar datos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 15.577.227.264 | no disponible | no disponible | no disponible | HuggingFace, safetensors |
| Qwen3-14B (referencia de la misma familia) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no verificada en esta ficha |
| Qwen3-30B-A3B (referencia MoE de la misma familia) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no verificada en esta ficha |

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial, modificación ni redistribución; hay que contactar con el autor.
- Model card autogenerada y sin documentación: no hay información sobre datos de entrenamiento, sesgos, evaluación ni procedimiento.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones, no se puede estimar su fiabilidad.
- Contexto e idiomas no declarados: no se puede garantizar conversaciones largas ni cobertura multilingüe.
- Configuración MoE ambigua: el nombre incluye "experts0"; conviene verificar config.json antes de asumir que es un MoE funcional.
- Sin cuantizaciones oficiales: desplegar en GPU de consumo requiere convertir y validar el modelo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay casos de uso reportados.
- Posible checkpoint experimental o incompleto: el nombre sugiere hiperparámetros de un experimento y no hay garantía de que el entrenamiento haya concluido.
- No usar en producción sin aclarar la licencia y ejecutar evaluaciones propias.

## Enlaces

- [HuggingFace: sartajbhuvaji/bonsai-distilled-depth24-experts0-500-warmup75-lr1e4-fixedloss](https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth24-experts0-500-warmup75-lr1e4-fixedloss)
- [arXiv 1910.09700](https://arxiv.org/abs/1910.09700): referencia citada en la model card para el cálculo de emisiones (Lacoste et al., 2019); no es un paper del modelo.
- [Machine Learning Impact Calculator](https://mlco2.github.io/impact): calculadora de impacto ambiental citada en la model card.
- No se han encontrado otros enlaces a papers, blogs, repositorios o demos en la información proporcionada.
