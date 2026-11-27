# Martinaalvar/tiny-transformer-multitask

## Resumen

Tiny Transformer for Multitask es un prototipo de investigación publicado en Hugging Face por la usuaria Martinaalvar. Se trata de una implementación propia de un transformer de escala reducida (etiquetada como "huge" en la configuración del autor, aunque con solo 24.832 parámetros totales registrados en el checkpoint de safetensors) orientada a experimentación con aprendizaje multitarea. El repositorio incluye el código de definición del modelo, una configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización.

El modelo no es un modelo entrenado ni evaluado: la propia model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y que no se presenta como un checkpoint con benchmarks. No se declaran resultados de rendimiento, idiomas soportados ni pipeline de inferencia.

Su relevancia es, por tanto, exclusivamente educativa y de investigación: sirve como punto de partida reproducible para experimentar con arquitecturas transformer personalizadas, atención multi-query, fusión de bajo rango y normalización RMSNorm, así como para validar pipelines de entrenamiento multitarea con el optimizador Novograd y un scheduler coseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (implementación personalizada) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de implementación propia con atención multi-query (multi query attention), fusión de bajo rango (low rank fusion), función de activación ReLU y normalización RMSNorm. La configuración se etiqueta internamente como escala "huge", aunque el recuento real de parámetros del checkpoint (24.832) corresponde a un modelo extremadamente pequeño, adecuado solo para pruebas de humo y experimentación controlada.

No se especifican datos de entrenamiento: no hay número de tokens, composición del dataset ni indicios de RLHF, DPO o ajuste por instrucciones. La receta de experimento por defecto utiliza el optimizador Novograd con un scheduler de tipo coseno, pero la model card aclara que son valores iniciales del script y no evidencia de un entrenamiento completado. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: no verificada; el checkpoint es de inicialización y no ha sido entrenado.
- Razonamiento, código y matemáticas: no disponibles ni evaluados.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso como base de investigación: implementación ejecutable con `finetune.py` y configuración de arquitectura editable.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint permite validar que el código de carga, el forward pass y el guardado de pesos funcionan antes de lanzar experimentos reales.
- Experimentación académica con arquitecturas transformer personalizadas: sirve para estudiar el efecto de atención multi-query, fusión de bajo rango y RMSNorm en modelos de juguete con recursos mínimos.
- Validación de recetas de optimización: permite probar Novograd con scheduler coseno en un entorno controlado y reproducible antes de escalar a modelos mayores.
- Docencia y formación: ejemplo mínimo de definición de modelo, configuración y script de fine-tuning para explicar la estructura de un transformer en cursos de aprendizaje profundo.
- Desarrollo de adaptadores de carga: al ser una implementación custom, requiere un adaptador explícito para APIs genéricas; útil para practicar la integración con frameworks de inferencia.
- Reproducibilidad de experimentos multitarea: base para comparar baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, tal como recomienda la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 24.832 parámetros el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es sobredimensionada; una GPU integrada o CPU es suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación custom, requiere el código propio del repositorio (`finetune.py`); no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Martinaalvar/tiny-transformer-multitask | 24.832 | no disponible | sin benchmarks | BSD-3-Clause | Hugging Face |
| Modelos transformer de juguete (p. ej. nanoGPT) | variable, típicamente millones | no disponible | sin benchmarks estándar | variable | repositorios de investigación |
| Modelos pequeños entrenados (p. ej. familia TinyLlama) | ~1.100 millones | 2.048 tokens | benchmarks publicados | Apache-2.0 | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa rigurosa con alternativas de la misma categoría; la comparación anterior es orientativa y se basa en categorías generales, no en mediciones sobre este modelo.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional para tareas reales.
- No se ha auditado robustez, equidad ni transferencia de dominio.
- Riesgo de alucinación: no aplicable en la práctica porque el modelo no genera texto entrenado; cualquier salida sería esencialmente aleatoria.
- Sin idiomas declarados ni contexto documentado; no apto para producción.
- La licencia BSD-3-Clause permite uso comercial, pero deben revisarse por separado los términos de los datos externos que se utilicen con el repositorio.
- Al ser una implementación personalizada, las APIs automáticas de carga de Hugging Face requieren un adaptador explícito.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Martinaalvar/tiny-transformer-multitask
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
