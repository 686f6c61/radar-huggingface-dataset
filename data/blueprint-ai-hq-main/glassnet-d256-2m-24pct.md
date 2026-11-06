# blueprint-ai-hq-main/glassnet-d256-2m-24pct

## Resumen

GlassNet es un checkpoint de investigación temprana publicado por blueprint-ai-hq-main bajo la etiqueta `glassnet-d256-2m-24pct`. Se trata de un modelo de lenguaje de 5.908.686 parámetros entrenado íntegramente desde cero: tensores propios, retropropagación propia, optimizador propio y caché KV propia, sin PyTorch, sin librería de autograd y sin pesos preentrenados. El objetivo declarado no es el rendimiento, sino la reproducibilidad de las mediciones y el estudio de cómo se construye, entrena y depura un modelo pequeño sin framework.

La variante publicada corresponde a una configuración con dimensión oculta d=256 entrenada sobre 2 millones de ventanas, con un vocabulario de 12.002 tokens y una ventana de contexto de 32 tokens en float32. El autor reporta una precisión de siguiente token en held-out del 24,20 % para esta configuración, frente al 35,26 % de la variante d=256 sobre el corpus completo y al 37,37 % de la variante d=512 sobre el corpus completo con 6 épocas.

Es relevante ahora únicamente como material de estudio: el propio autor lo etiqueta como `not-for-production` y advierte de que no ha alcanzado conversación coherente ni aritmética sobre operandos no vistos. Su interés técnico reside en las verificaciones numéricas del motor (gradientes comprobados frente a estimaciones numéricas con error de 4,14e-09), en el optimizador propio (que supera a SGD plano en +4,3 puntos sobre 3 semillas) y en la caché KV (9,7 veces más rápida que el recálculo con salida idéntica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer implementado desde cero (tensores, backward pass, optimizador y KV cache propios), sin PyTorch ni autograd |
| Parametros totales | 5.908.686 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en float32 en el checkpoint publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | Blueprint AI License 1.0 (BAL-1.0), no aprobada por OSI |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GlassNet es un transformer pequeño escrito completamente desde cero, con implementación propia de tensores, del paso backward, del optimizador y de la caché KV. El checkpoint publicado usa d=256, vocabulario de 12.002 tokens, ventana de 32 tokens y precisión float32. El entrenamiento se realizó sobre una GTX 1660 SUPER de 6 GB, lo que condiciona el tamaño y la configuración del modelo. El autor reporta resultados para tres configuraciones: d=512 sobre el corpus completo durante 6 épocas (37,37 % de precisión de siguiente token en held-out), d=256 sobre el corpus completo (35,26 %) y d=256 sobre 2 millones de ventanas (24,20 %), que es la variante publicada aquí.

El detalle técnico más destacable no es el rendimiento sino la infraestructura de entrenamiento: los gradientes del motor están verificados frente a estimaciones numéricas con un error de 4,14e-09; el optimizador propio supera a SGD plano en +4,3 puntos sobre 3 semillas (23,46 % frente a 19,14 %); y la caché KV propia es 9,7 veces más rápida que el recálculo con salida idéntica. Además, cada neurona intermedia lleva un nombre y las que fallan su auditoría se eliminan en lugar de suavizarse. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto a nivel de token con gramática real pero contenido débil, según el propio autor.
- Precisión de siguiente token en held-out del 24,20 % en la configuración publicada (d=256, 2M ventanas).
- No se ha alcanzado conversación coherente según la model card.
- Aritmética sobre operandos no vistos: 0,0 % de exactitud en tres implementaciones; el análisis por dígitos muestra una regla parcial en formación (el dígito 0 alcanza el 100 % en operandos no vistos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de implementación de transformers sin framework: permite examinar un backward pass, un optimizador y una caché KV escritos a mano, con verificación numérica de gradientes documentada, para cursos o laboratorios de sistemas de aprendizaje automático.
- Reproducción de mediciones en hardware de consumo: el entrenamiento cabe en una GTX 1660 SUPER de 6 GB, lo que facilita replicar las curvas de precisión de siguiente token en un equipo doméstico.
- Docencia sobre evaluación honesta de modelos: la model card publica fracasos concretos (ablación de atención con pérdida de 5,41 puntos, arquitectura propuesta que pierde frente a la forma simple en ambas semillas), útil como caso de estudio de reporte riguroso.
- Investigación sobre optimizadores: el optimizador propio supera a SGD plano en +4,3 puntos sobre 3 semillas, lo que permite analizar la metodología de comparación y las semillas empleadas.
- Análisis de caché KV: la caché propia es 9,7 veces más rápida que el recálculo con salida idéntica, lo que sirve para estudiar técnicas de inferencia incremental en modelos diminutos.
- Auditoría de neuronas con nombre: el mecanismo de nombres por neurona y el descarte de las que fallan su auditoría se puede estudiar como aproximación a interpretabilidad a pequeña escala.
- No se recomienda ningún uso en producción, aplicaciones de seguridad crítica ni escenarios donde un error tenga coste económico o cause daño.

## Benchmarks y rendimiento

| Metrica | Configuracion | Resultado |
|---|---|---|
| Precisión de siguiente token en held-out | d=512, corpus completo, 6 épocas | 37,37 % |
| Precisión de siguiente token en held-out | d=256, corpus completo | 35,26 % |
| Precisión de siguiente token en held-out | d=256, 2M ventanas (checkpoint publicado) | 24,20 % |
| Aritmética en operandos no vistos | Tres implementaciones | 0,0 % exacto |
| Ablación de atención (bloque de una sola cabeza) | Comparación con línea base | -5,41 puntos (18,69 % frente a 24,10 %) |
| Arquitectura propuesta frente a forma simple | Dos semillas | 3,87 % / 4,07 % frente a 5,53 % / 5,87 % |
| Verificación de gradientes | Frente a estimaciones numéricas | Error de 4,14e-09 |
| Optimizador propio frente a SGD plano | 3 semillas | +4,3 puntos (23,46 % frente a 19,14 %) |
| Caché KV frente a recálculo | Salida idéntica | 9,7 veces más rápida |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento realizado en una GTX 1660 SUPER de 6 GB, lo que confirma que el modelo y su entrenamiento caben en GPU de consumo.
- VRAM estimada para inferencia: no disponible de forma explícita; con 5,9 millones de parámetros en float32, los pesos ocupan aproximadamente 23,6 MB, por lo que la inferencia cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: no disponibles; el propio autor sugiere `--d 512` si se dispone de 6 GB o más de VRAM y `--d 256` en caso contrario.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento reportado (GTX 1660 SUPER, 6 GB).
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; solo se reporta la mejora relativa de la caché KV (9,7 veces frente al recálculo).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de investigación escritos desde cero sin framework) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que "no es un buen modelo todavía" y lo etiqueta como `not-for-production`.
- No ha alcanzado conversación coherente: la gramática es real pero el contenido es débil.
- Aritmética sobre operandos no vistos: 0,0 % de exactitud en tres implementaciones.
- La ablación de atención muestra que un bloque de atención de una sola cabeza pierde 5,41 puntos frente a la línea base.
- La arquitectura propuesta por el autor pierde frente a la forma simple en ambas semillas (3,87 % / 4,07 % frente a 5,53 % / 5,87 %).
- Ventana de contexto de solo 32 tokens, insuficiente para la mayoría de aplicaciones prácticas.
- Solo inglés declarado; no hay soporte multilingüe.
- Licencia BAL-1.0: gratuita para individuos, estudiantes, investigación y uso no comercial; gratuita para organizaciones con ingresos anuales inferiores a 1.000.000 USD; por encima de ese umbral se requiere licencia comercial con reparto del 1 % de los ingresos. El uso dañino no está licenciado. No es open source aprobada por OSI.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el contenido débil y la baja precisión de siguiente token sugieren alta probabilidad de texto incoherente.
- Sesgos conocidos: no documentados en la información disponible.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, y repositorio de 0,0 GB, lo que sugiere un checkpoint de muy reciente publicación y escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blueprint-ai-hq-main/glassnet-d256-2m-24pct
- Licencia BAL-1.0: https://github.com/blueprint-ai-hq-git/glassnet/blob/main/LICENSE
- Repositorio del proyecto: https://github.com/blueprint-ai-hq-git/glassnet
