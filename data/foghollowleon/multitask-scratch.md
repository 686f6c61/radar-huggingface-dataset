# foghollowleon/multitask-scratch

## Resumen

`foghollowleon/multitask-scratch` es un repositorio de HuggingFace publicado por el usuario foghollowleon que contiene una implementación propia de DINO (self-distillation con teacher-student) orientada a aprendizaje multitarea, en una configuración deliberadamente diminuta. No es un modelo entrenado: la model card indica explícitamente que `model.safetensors` es una inicialización recién creada ("plumbing, not results") y que los pesos son de inicialización aleatoria, por lo que las salidas no contienen señal útil. El recuento real de parámetros en safetensors es de 33.088, es decir, unas 33.000 variables, varios órdenes de magnitud por debajo de cualquier modelo utilizable en producción.

El interés del repositorio es, por tanto, de ingeniería y no de modelado: sirve como andamiaje reproducible para validar un pipeline de entrenamiento (smoke test), como plantilla de implementación single-file y como punto de partida para experimentos propios. El autor declara explícitamente que omite cualquier cifra de benchmark y que la receta de experimento incluida (optimizador Lion con schedule por pasos) existe solo para que el script se ejecute de principio a fin.

Es relevante ahora únicamente en el contexto de la etiqueta `wip` y `smoke-test`: no debe evaluarse como modelo de IA ni compararse por rendimiento, sino como artefacto de código. Cualquier uso que requiera inferencia real, generación de texto, visión o multitarea funcional está fuera de su alcance en el estado actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINO (implementación propia, single-file) en configuración "tiny"; detalle del backbone no disponible |
| Parámetros totales | 33.088 (según safetensors del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo pesos safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo sin entrenar; no hay tokenizador ni capacidades lingüísticas declaradas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (checkpoint de inicialización) |

Otros datos del repositorio: tamaño del repo 0,0 GB, 0 descargas, 0 likes, creado y actualizado el 2026-10-21. Entorno declarado: Python >= 3.9, torch 2.x, safetensors reciente, transformers opcional para loaders.

## Arquitectura y entrenamiento

La arquitectura sigue el esquema DINO: autodestilación sin etiquetas entre una red estudiante y una red profesora actualizada como media móvil exponencial de la estudiante, con objetivos de coherencia entre vistas aumentadas de la misma imagen. Según los tags y la model card, el repositorio añade una componente multitarea sobre esa base, aunque no se especifica el número ni la naturaleza de las cabeceras o tareas. La implementación es de fichero único (`train.py`), con la configuración de arquitectura en `config.json` y los hiperparámetros de experimento en `training_args.json`.

No se ha ejecutado entrenamiento con datos reales: el checkpoint `model.safetensors` está recién inicializado y el autor lo describe como infraestructura, no como resultado. La receta por defecto emplea el optimizador Lion con un schedule por pasos, y el propio autor advierte que esos valores solo garantizan que el script corra de extremo a extremo; un experimento con sentido requeriría su propio presupuesto de tuning y al menos tres semillas. No se publican detalles sobre volumen de tokens, composición del dataset, ni fases de RLHF/DPO (no aplicables a un pipeline auto-supervisado de este tipo).

## Capacidades

- No se le puede atribuir ninguna capacidad funcional: los pesos son de inicialización aleatoria y las salidas no tienen señal.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas ni visión funcional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas; no se publica tokenizador.
- Capacidad real del artefacto: ejecutar un smoke test reproducible de un pipeline DINO multitarea y servir de plantilla de código.

## Casos de uso

- Validación de pipeline en CI: ejecutar `python train.py --help` y el bloque `__main__` como smoke test para verificar que las dependencias (torch 2.x, safetensors) y el flujo de datos funcionan antes de invertir horas de GPU en un experimento real.
- Plantilla de implementación propia: partir de `train.py` como base single-file para construir un DINO multitarea adaptado a un dominio concreto, sustituyendo la configuración tiny por un backbone real.
- Reproducción de recetas de optimización: usar `training_args.json` como punto de partida para comparar Lion frente a AdamW con distintas schedules, sabiendo que los valores por defecto no están tuneados.
- Docencia y formación: ilustrar en un taller cómo se estructura un objetivo de autodestilación con teacher EMA y cabeceras multitarea, con código legible y sin dependencias pesadas.
- Andamiaje de harness de evaluación: reutilizar la estructura de carga de safetensors y `config.json` para montar un banco de pruebas propio, dado que el autor omite deliberadamente cifras de benchmark.
- Integración en un pipeline interno de registro de modelos: probar el ciclo completo de descarga, carga con un adaptador explícito (la carga automática genérica no funciona con implementaciones custom) y serialización, sin coste de almacenamiento (repo de 0,0 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las cifras de benchmark se omiten a propósito, y que robustez, equidad y transferencia de dominio no están evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; 33.088 parámetros ocupan del orden de decenas de kilobytes en fp32, muy por debajo de 1 MB.
- GPU recomendadas: ninguna. El modelo cabe y se ejecuta en CPU sin optimización alguna.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en Raspberry Pi; el cuello de botella sería el runtime de PyTorch, no el modelo.
- Opciones de despliegue: al ser una implementación custom, las APIs genéricas de carga (AutoModel y similares) requieren un adaptador explícito; vLLM, TGI, llama.cpp u Ollama no aplican porque no hay arquitectura de decoder ni pesos GGUF.
- Latencia y throughput: no disponibles, y sin significado práctico al no haber modelo entrenado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Estado |
|---|---|---|---|---|---|
| multitask-scratch (este repo) | 33.088 | No disponible | Apache-2.0 | HuggingFace | Pesos aleatorios, smoke test |
| DINOv2 ViT-S/14 (referencia) | ~21 M | No aplica (visión) | Apache-2.0 (código) / licencia propia de pesos | HuggingFace, Meta | Entrenado, benchmarks públicos |
| DINOv2 ViT-B/14 (referencia) | ~86 M | No aplica (visión) | Ibídem | HuggingFace, Meta | Entrenado, benchmarks públicos |
| DINO original (referencia) | ~21 M (ViT-S) | No aplica (visión) | Apache-2.0 | Repo oficial | Entrenado, benchmarks públicos |

Nota: las cifras de parámetros de las familias DINO/DINOv2 corresponden a conocimiento general sobre esas publicaciones y no se han verificado contra la información proporcionada en esta ficha; los datos de este repositorio sí provienen del recuento de safetensors. La comparación relevante es cualitativa: este repositorio no es funcionalmente comparable a un modelo entrenado.

## Limitaciones y advertencias

- Pesos de inicialización aleatoria: las salidas no contienen señal; no usar para inferencia bajo ninguna circunstancia.
- Sin benchmarks, sin evaluación de robustez, equidad ni transferencia de dominio; cualquier métrica que se obtenga con estos pesos es ruido.
- Estado `wip`: el autor advierte que la API puede cambiar sin aviso mientras se estabiliza el diseño.
- Implementación custom: las APIs automáticas de carga de `transformers` no funcionan sin un adaptador explícito, lo que complica la integración directa.
- Sin tokenizador ni idiomas declarados: no hay soporte lingüístico que evaluar.
- Licencia Apache-2.0 permite uso comercial del código y de los pesos, pero los datasets externos que se usen para entrenar mantienen sus propios términos y deben verificarse por separado.
- Riesgo de confusión en catálogos de modelos: al aparecer listado como modelo con safetensors, puede ingerirse por error en pipelines automatizados; conviene marcarlo como no apto para producción.
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo (son hilos de soporte técnico sin relación), por lo que no aportan datos verificables.

## Enlaces

- HuggingFace: https://huggingface.co/foghollowleon/multitask-scratch
- La búsqueda web no devolvió papers, blogs, repositorios ni demos relacionados con este modelo; no hay más enlaces disponibles.
