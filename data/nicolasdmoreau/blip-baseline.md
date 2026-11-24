# NicolasDmoreau/blip-baseline

## Resumen

`NicolasDmoreau/blip-baseline` es un repositorio de Hugging Face que contiene una implementación propia en PyTorch de una arquitectura tipo BLIP orientada a tareas de clasificación, en su configuración "small". No se trata de un modelo preentrenado listo para producción: el propio autor lo describe como un punto de partida para revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala. El checkpoint `model.safetensors` incluido es una inicialización válida, no un modelo entrenado ni evaluado contra benchmarks.

El dato más llamativo es su tamaño: 49.600 parámetros totales según los safetensors reales del repositorio, lo que lo sitúa muy por debajo de cualquier modelo utilizable en tareas reales de visión-lenguaje. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es, por tanto, limitada y de carácter didáctico o de infraestructura: sirve como esqueleto reproducible para montar pipelines de entrenamiento y evaluación, no como componente desplegable. La licencia BSD-3-Clause permite uso comercial del código, pero la ausencia de pesos entrenados hace que esa permisión tenga poco recorrido práctico sin un entrenamiento previo por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (implementación custom en PyTorch) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

Detalles adicionales declarados en la model card: atención multi-query, fusión con compuertas (gated fusion), activación Mish y normalización por BatchNorm. Escala "small".

## Arquitectura y entrenamiento

La arquitectura sigue el esquema BLIP con atención multi-query y un módulo de fusión con compuertas, activación Mish y BatchNorm. Se trata de una reimplementación propia, no de los pesos oficiales de BLIP publicados por Salesforce, lo que implica que las APIs genéricas de carga automática de Transformers requieren un adaptador explícito antes de poder instanciar el modelo.

No hay evidencia de entrenamiento completado. La model card indica que la receta incluida (AdamW con schedule de warmup constante) son valores de arranque del script, no el resultado de una ejecución finalizada. No se documenta número de tokens, composición del dataset, ni fases de RLHF o DPO. Tampoco se declara ninguna innovación técnica más allá de la elección de componentes arquitectónicos citados.

## Capacidades

- Clasificación: el repositorio está etiquetado como `classification` y la arquitectura está configurada para esa tarea, aunque sin pesos entrenados no hay capacidad efectiva demostrada.
- Generación de texto: no disponible.
- Razonamiento y matemáticas: no disponible.
- Codigo: no disponible.
- Vision: la arquitectura BLIP es multimodal por diseño, pero el repositorio no documenta un encoder visual entrenado ni un pipeline de inferencia funcional.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Pruebas de humo en CI: el checkpoint de inicialización permite verificar que el pipeline de carga, el forward pass y el guardado de pesos funcionan antes de invertir cómputo en un entrenamiento real.
- Revisión de código de arquitecturas BLIP: sirve como referencia compacta y legible para auditar cómo se implementan atención multi-query y gated fusion en PyTorch.
- Plantilla de experimentos controlados: el `training_args.json` y el `train.py` permiten lanzar barridos de hiperparámetros con una receta reproducible y semillas fijas.
- Enseñanza y formación: útil en cursos o talleres donde se quiera mostrar el ciclo completo de definición de modelo, configuración y entrenamiento sin depender de pesos de gran tamaño.
- Base para comparativas de capacidad: al ser un modelo de 49.600 parámetros, encaja como baseline de capacidad mínima frente a modelos mayores en experimentos de escalado.
- Validación de infraestructura de evaluación: permite probar scripts de métricas y particiones etiquetadas específicas de tarea antes de aplicarlos a modelos preentrenados reales.
- Integración en pipelines de investigación: como artefacto de código más que de modelo, se puede versionar junto con los logs de entrenamiento y las versiones de entorno, tal como recomienda el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 49.600 parámetros en fp32 el peso ronda los 0,2 MB, por lo que cualquier GPU con más de 1 GB es suficiente.
- GPU recomendadas: no aplica en sentido estricto; cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) o incluso CPU es suficiente para ejecutar el forward pass.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación custom, no es compatible directamente con vLLM, TGI, llama.cpp u Ollama; requiere el `train.py` del repositorio o un adaptador propio sobre Transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NicolasDmoreau/blip-baseline | 49.600 | no disponible | No | BSD-3-Clause | Hugging Face, 0 descargas |
| BLIP oficial (Salesforce) | Cientos de millones (según variante) | 512 tokens aprox. en variantes publicadas | Sí, preentrenado | BSD-3-Clause en variantes oficiales | Hugging Face, ampliamente usado |
| CLIP (OpenAI) | ~150M en ViT-B/32 | 77 tokens | Sí, preentrenado | MIT en variantes abiertas | Hugging Face y repositorios oficiales |

La comparación con BLIP oficial y CLIP es solo categórica: el repositorio analizado no compite en capacidad ni en rendimiento, sino que se posiciona como esqueleto de código. Cualquier comparación numérica carecería de sentido al no existir pesos entrenados.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; cualquier salida es esencialmente aleatoria y no debe interpretarse como predicción.
- No hay auditoría de robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se documentan sesgos, pero al no haber datos de entrenamiento tampoco es posible evaluarlos.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de que un usuario interprete el repositorio como un modelo funcional y lo despliegue en producción por error.
- Sin idiomas declarados ni contexto definido; no apto para tareas multilingües ni de contexto largo.
- La licencia BSD-3-Clause cubre el código del repositorio, pero los términos de los datos externos que se usen para entrenarlo deben revisarse por separado.
- Requiere un adaptador explícito para cargarse con APIs automáticas de Transformers; no funciona con `AutoModel.from_pretrained` sin código adicional.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada de los valores por defecto aquí publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NicolasDmoreau/blip-baseline
- Resultado de búsqueda web relacionado (volumen EMNLP 2025 Findings, sin relación directa con el modelo): https://aclanthology.org/volumes/2025.findings-emnlp/
