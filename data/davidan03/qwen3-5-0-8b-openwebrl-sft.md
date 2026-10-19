# davidan03/qwen3.5-0.8b-openwebrl-sft

## Resumen

`davidan03/qwen3.5-0.8b-openwebrl-sft` es un ajuste fino completo (full fine-tune) del modelo multimodal `Qwen/Qwen3.5-0.8B` realizado por el usuario davidan03 sobre las trayectorias SFT del proyecto OpenWebRL. El objetivo es especializar un modelo pequeño de tipo image-text-to-text en tareas de agente web: episodios multi-turno de navegación por navegador en los que el modelo observa capturas de pantalla y decide la siguiente acción. La receta replica la empleada en el modelo publicado OpenWebRL-4B-SFT, trasladada aquí a una escala de 0,8B.

El modelo resultante conserva la torre visual del base y entrena el proyector multimodal y el modelo de lenguaje. Los pesos suman 1.107.265.600 parámetros según safetensors (el nombre comercial "0.8B" no coincide con el recuento real del checkpoint), con un repositorio de 2,2 GB en formato safetensors. La licencia es Apache 2.0.

Su relevancia práctica es doble: por un lado, demuestra que es posible adaptar un VLM de menos de 1.200 millones de parámetros a control de navegador con un presupuesto de cómputo muy reducido (2 GPU H200 durante aproximadamente 45 minutos); por otro, sirve como referencia reproducible de la receta OpenWebRL en un tamaño que cabe con holgura en GPU de consumo. El autor advierte de que el modelo aún no ha sido evaluado y de que no se publicó partición de validación durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre visual + proyector + modelo de lenguaje); familia Qwen3.5, etiqueta `qwen3_5` en transformers |
| Parametros totales | 1.107.265.600 (segun safetensors); el autor reporta 88.004.352 en la torre visual y 852.985.920 en proyector + LM |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el entrenamiento uso un cutoff de 36.864 tokens, no necesariamente igual al contexto nominal) |
| Tipos de cuantizacion | no se distribuyen versiones cuantizadas; pesos en safetensors de 2,2 GB, cuantizables a posteriori con GPTQ, AWQ o llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); no se incluyen los pesos `mtp.*` del modelo base |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3.5-0.8B original: un modelo multimodal que combina una torre de visión con un transformer de lenguaje mediante un proyector. El ajuste fino se hizo con LlamaFactory y su plantilla `qwen3_5`, entrenando proyector y modelo de lenguaje mientras la torre visual permanecía congelada (88.004.352 parámetros). Se entrenaron 764.981.568 de los 852.985.920 parámetros de ese bloque, lo que corresponde a un fine-tune completo y no a un adaptador LoRA.

Los datos son las trayectorias SFT de OpenWebRL: 3.084 filas por turno, con episodios multi-turno de navegación web acompañados de capturas de pantalla. El renderizado usa enmascarado de historial, de modo que solo se entrena el último turno del asistente en cada fila. La configuración fue de 3 épocas (75 pasos de optimizador), tasa de aprendizaje 1e-5 con schedule coseno y warmup 0.1, batch efectivo de 128 (1 por dispositivo, 64 de acumulación, 2 GPU), bf16, DeepSpeed ZeRO-2, cutoff de 36.864 tokens e `image_max_pixels` de 12.845.056. El cómputo total fue de 2 GPU H200 durante unos 45 minutos. La pérdida media por época fue 0,829 / 0,591 / 0,479, sin partición de validación; el autor señala que buena parte de la caída tras la primera época se produce en los límites de época, por las pasadas repetidas sobre los mismos datos. Como innovación destacable, el modelo conserva el modo thinking del base (las etiquetas `<think>` aparecen en todos los objetivos de entrenamiento), pero pierde la decodificación especulativa MTP al no haberse incluido los pesos `mtp.*`.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline `image-text-to-text`, acepta imágenes (capturas de pantalla) junto con instrucciones textuales.
- Control de agente web: entrenado específicamente sobre episodios de navegación con retroalimentación visual, orientado a decidir la siguiente acción sobre la página.
- Conversación multi-turno: las trayectorias de entrenamiento son episodios con historial, aunque solo se supervisa el último turno del asistente.
- Modo thinking: soportado mediante la plantilla de chat, con `chat_template_kwargs={"enable_thinking": True}`; desactivado por defecto en el template del base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Audio u otras modalidades: no disponible.

## Casos de uso

- Agente de navegación autónomo: el modelo recibe la captura de pantalla actual y el historial del episodio, y emite la siguiente acción (clic, escritura, scroll). Es el escenario para el que fue entrenado y para el que existen datos supervisados directos.
- Extracción de datos de portales legacy: al poder interpretar visualmente la página, puede operar sobre interfaces sin API ni HTML semántico estable, rellenando formularios y leyendo resultados.
- Automatización de pruebas end-to-end: sustituye selectores frágiles por decisiones sobre la representación visual, lo que ayuda en aplicaciones con DOM dinámico o componentes canvas.
- Asistente de accesibilidad: dado que trabaja sobre capturas, puede describir el estado de una página y proponer la acción siguiente en flujos guiados para usuarios con dificultades de interacción.
- Prototipado rápido de agentes en local: con 1,1B parámetros y 2,2 GB de pesos, permite iterar sobre pipelines de agente en una sola GPU de consumo antes de escalar a modelos mayores de la misma familia.
- Generación de datos sintéticos de navegación: puede usarse como política inicial para producir trayectorias que luego se filtren y reutilicen en el entrenamiento de modelos de mayor tamaño del ecosistema OpenWebRL.
- Base para comparativas de receta: al replicar exactamente la receta de OpenWebRL-4B-SFT, sirve para estudiar el efecto de la escala (0,8B frente a 4B) manteniendo datos y hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Not yet evaluated" y no se utilizó partición de validación durante el entrenamiento, por lo que tampoco existen métricas internas de generalización. Los únicos números reportados son las pérdidas de entrenamiento por época (0,829 / 0,591 / 0,479).

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 2,2 GB solo de pesos (tamaño del repo), más memoria para activaciones y tokens visuales. Con imágenes de alta resolución el coste de activaciones crece de forma notable: el entrenamiento usó `image_max_pixels` de 12.845.056, muy por encima de los valores típicos.
- VRAM estimada por cuantización (cálculo a partir del recuento de parámetros, no publicado por el autor): unos 1,1 GB en 8 bits y unos 0,6 GB en 4 bits, sin contar overhead de runtime ni memoria de activaciones.
- GPU recomendadas: cualquier GPU con 8-16 GB es suficiente para inferencia en bf16 con imágenes de resolución moderada; el entrenamiento documentado se hizo con 2 x H200, pero no es un requisito para servir el modelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090, siempre que se limiten los píxeles por imagen.
- Opciones de despliegue: transformers (librería declarada), con endpoints compatibles según los tags; LlamaFactory para reentrenamiento o evaluación; vLLM y TGI son opciones razonables para servir, aunque no hay confirmación explícita de soporte para esta arquitectura en la información disponible. No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el tamaño reducido sugiere latencias bajas, pero el coste dominante en este caso son los tokens visuales, no el decoder.
- Nota de despliegue: activar el modo thinking con `chat_template_kwargs={"enable_thinking": True}`. La decodificación especulativa MTP no está disponible al faltar los pesos `mtp.*`; el servicio ordinario no se ve afectado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Estado |
|---|---|---|---|---|---|
| davidan03/qwen3.5-0.8b-openwebrl-sft | 1.107.265.600 | no disponible | SFT sobre OpenWebRL (3.084 filas por turno, 3 epocas) | Apache 2.0 | Publicado, sin evaluar |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion proporcionada | no disponible | Preentrenamiento y alineamiento general del base | no disponible en la informacion proporcionada | Publicado |
| OpenWebRL-4B-SFT | 4B (segun denominacion) | no disponible | Misma receta OpenWebRL, a escala 4B | no disponible en la informacion proporcionada | Publicado, referenciado en la model card |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (VLM de menos de 2B especializados en control de navegador) con datos verificables. Cualquier comparación de rendimiento entre estas tres filas es imposible: no hay benchmarks publicados para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Sin evaluación: el autor declara explícitamente que el modelo no ha sido evaluado. No hay evidencia publicada de su tasa de éxito en tareas de navegación reales.
- Sin partición de validación: las pérdidas reportadas son de entrenamiento, por lo que no permiten estimar sobreajuste. Con 3 épocas y 75 pasos sobre 3.084 filas, el riesgo de sobreajuste al conjunto SFT es alto.
- Sesgos: no documentados. Al derivar de un modelo base sin ficha de sesgos en la información disponible, se heredan los sesgos del preentrenamiento y los del corpus OpenWebRL, compuesto por sitios web concretos.
- Alucinación: riesgo relevante en un agente que debe decidir acciones sobre una página; puede emitir acciones plausibles pero incorrectas (elementos inexistentes, selectores mal descritos) si la captura es ambigua o de baja calidad.
- Dependencia de la modalidad visual: el entrenamiento congela la torre visual, de modo que la calidad de percepción está acotada por la del base. Resoluciones muy distintas de las usadas en entrenamiento pueden degradar el comportamiento.
- Modo thinking obligatorio en la practica: el template del base lo desactiva por defecto, pero todos los objetivos de entrenamiento empiezan con `<think>`. Servir sin activarlo sitúa al modelo fuera de distribución.
- Sin decodificación especulativa MTP: los pesos `mtp.*` no se incluyeron, lo que impide acelerar la generación con decodificación especulativa nativa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base Qwen3.5-0.8B, no detalladas en la información proporcionada.
- Idiomas: no disponibles. El comportamiento fuera del idioma dominante del corpus OpenWebRL no está documentado.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-10-19. No hay historial de uso ni informes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidan03/qwen3.5-0.8b-openwebrl-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- LlamaFactory (framework de entrenamiento utilizado): https://github.com/hiyouga/LLaMA-Factory

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre el conjunto de datos OpenWebRL; los enlaces anteriores son los únicos verificables a partir de la información proporcionada. No se dispone de URL pública para el paper, el repositorio de OpenWebRL ni el modelo OpenWebRL-4B-SFT.
