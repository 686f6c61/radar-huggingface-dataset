# MissawB/irl-guard-decision-laya-v2

## Resumen

IRL Guard decision model v2 es un modelo de clasificación de texto en francés desarrollado por MissawB, consistente en un ajuste fino de `convaiinnovations/laya-multilingual`. Su función es actuar como *decision model* dentro del sistema IRL Guard: a partir de un `state` JSON que describe la carta de una cadena de directo (en lenguaje natural), la categoría del stream, el modo domicilio y el elemento detectado en pantalla, el modelo responde a tres preguntas tipadas —**acción** (emitir / difuminar / pausar), **riesgo** y **gravedad**— devolviendo probabilidades calibradas.

El modelo resuelve el problema de la moderación automática de retransmisiones IRL (in real life) en directo, donde una decisión errónea puede exponer contenido protegido al público. Con 321.908.998 parámetros (aproximadamente 322 millones) y un repositorio de 0,7 GB en formato safetensors, está diseñado para ejecutarse en CPU sin necesidad de servidor, lo que lo convierte en una alternativa ligera frente a modelos generativos de mayor tamaño en este dominio.

Su relevancia actual radica en que demuestra que un modelo pequeño ajustado específicamente puede alcanzar una precisión de acción del 80,1 % con F1 macro de 0,797 sobre cartas vistas, con una tasa de fuga del 3,8 %, superando al Laya sin ajustar y a las reglas deterministas, y acercándose a alternativas basadas en Qwen3.5. La fecha de publicación indicada es el 10 de octubre de 2026 y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: `convaiinnovations/laya-multilingual`) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | francés (`fr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del modelo base `convaiinnovations/laya-multilingual`, cargado mediante la librería `laya`. No se especifican en la información disponible los detalles arquitectónicos internos del modelo base (tipo de transformer, número de capas, mecanismos de atención ni longitud de contexto), por lo que estos datos quedan como no disponibles. Se sabe que es un modelo denso de 321.908.998 parámetros y que se distribuye como un pipeline de `text-classification` con etiquetas tipadas estructuradas (acción, riesgo, gravedad).

El ajuste fino se realizó sobre el conjunto de datos [`MissawB/irl-guard-decisions-v2`](https://huggingface.co/datasets/MissawB/irl-guard-decisions-v2). La evaluación reportada se realizó sobre 1.000 casos por cada uno de los tres conjuntos de prueba (cartas vistas, cartas no vistas y cartas escritas a mano). No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la formulación del problema como decisiones tipadas y estructuradas con probabilidades calibradas (medidas mediante ECE, error de calibración esperado) a partir de una entrada JSON, lo que permite integrar el modelo en sistemas de decisión con reglas deterministas.

## Capacidades

- Clasificación estructurada de decisiones: produce tres respuestas tipadas simultáneas (acción: emitir / difuminar / pausar; riesgo; gravedad) con probabilidades calibradas.
- Procesamiento de estado en formato JSON: interpreta una carta de canal en lenguaje natural, la categoría del stream, el modo domicilio y el elemento detectado en pantalla (texto OCR, objeto detectado).
- Moderación de contenido en directo: orientado específicamente a retransmisiones IRL.
- Calibración probabilística: el error de calibración esperado (ECE) reportado en cartas vistas es de 0,072 para la variante ajustada.
- Ejecución en CPU sin servidor: se carga con el paquete `laya` y admite el modo `decideur.modele: laya-local`.
- Capacidad multilingüe limitada: aunque el modelo base es multilingüe, el ajuste fino está orientado al francés.
- No procesa imágenes: el modelo recibe únicamente el `state` JSON; la percepción visual (OCR y detección de objetos) es responsabilidad de componentes externos del sistema IRL Guard.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Moderación automática de streams IRL en directo: el modelo recibe el estado de la escena (elemento detectado, carta del canal) y decide si emitir, difuminar o pausar la señal, evitando exponer contenido protegido con una tasa de fuga del 3,8 % sobre cartas vistas.
- Filtrado previo en CPU sin GPU: gracias a su tamaño de 322 millones de parámetros y a su ejecución local mediante el paquete `laya`, permite desplegar moderación en equipos sin acelerador gráfico, reduciendo coste de infraestructura.
- Sistema de decisión combinado con reglas deterministas: en el modo combinado de IRL Guard (la decisión más protectora prevalece), baja la fuga al 0,7 % sobre cartas vistas y al 1,3 % sobre cartas no vistas, siendo útil como capa de decisión dentro de un pipeline híbrido.
- Personalización por carta de canal: cada streamer puede definir su propia carta en lenguaje natural y el modelo la interpreta para adaptar las decisiones de emisión.
- Detección de riesgo y gravedad en tiempo real: las salidas tipadas de riesgo y gravedad permiten priorizar la intervención humana en los casos más graves en lugar de revisar todos.
- Gestión de categorías de stream: al recibir la categoría del stream y el modo domicilio, el modelo adapta la política de emisión a contextos distintos (por ejemplo, interiores frente a exteriores).
- Evaluación y auditoría de políticas de moderación: las métricas de calibración (ECE) y de fuga permiten comparar políticas y ajustar umbrales antes de producción.

## Benchmarks y rendimiento

Se presentan a continuación los resultados reportados por el autor sobre 1.000 casos por conjunto, comparando la variante ajustada (`laya-ft-v2`) con las principales alternativas. Columnas: precisión de la acción, F1 macro, tasa de fuga (casos a proteger que la aproximación difunde), ECE (calibración) y coste medio por decisión.

### Cartas vistas

| Aproximacion | Accion | F1 macro | Fuga | ECE | Coste medio |
|---|---|---|---|---|---|
| siempre-difundir | 44,9 % | 0,207 | 100,0 % | 0,551 | 8,48 |
| reglas | 39,3 % | 0,334 | 21,1 % | 0,607 | 3,17 |
| xgboost | 50,1 % | 0,502 | 16,5 % | 0,080 | 2,30 |
| laya (sin ajuste) | 40,7 % | 0,314 | 55,9 % | 0,289 | 5,59 |
| laya-ft | 73,8 % | 0,721 | 20,0 % | 0,053 | 2,02 |
| qwen-ft | 82,0 % | 0,807 | 15,2 % | 0,042 | 1,44 |
| **laya-ft-v2** | **80,1 %** | **0,797** | **3,8 %** | **0,072** | **0,73** |
| qwen-ft-v2 (Qwen3.5-2B) | 99,3 % | 0,993 | 0,2 % | 0,005 | 0,02 |
| combine-laya-v2 | 63,4 % | 0,638 | 0,7 % | 0,224 | 0,73 |
| combine-qwen-v2 | 72,7 % | 0,733 | 0,0 % | 0,272 | 0,31 |

### Cartas no vistas

| Aproximacion | Accion | F1 macro | Fuga | ECE | Coste medio |
|---|---|---|---|---|---|
| siempre-difundir | 40,5 % | 0,192 | 100,0 % | 0,595 | 9,34 |
| reglas | 44,5 % | 0,407 | 21,2 % | 0,555 | 3,27 |
| xgboost | 45,9 % | 0,458 | 24,2 % | 0,138 | 3,11 |
| laya (sin ajuste) | 34,2 % | 0,275 | 47,6 % | 0,297 | 5,54 |
| laya-ft | 72,2 % | 0,711 | 21,5 % | 0,061 | 2,44 |
| qwen-ft | 80,3 % | 0,793 | 20,3 % | 0,084 | 1,92 |
| **laya-ft-v2** | **74,3 %** | **0,740** | **6,2 %** | **0,034** | **1,11** |
| qwen-ft-v2 (Qwen3.5-2B) | 97,3 % | 0,972 | 2,2 % | 0,017 | 0,23 |
| combine-laya-v2 | 66,4 % | 0,664 | 1,3 % | 0,130 | 0,83 |
| combine-qwen-v2 | 79,3 % | 0,790 | 0,3 % | 0,198 | 0,28 |

### Cartas escritas a mano

| Aproximacion | Accion | F1 macro | Fuga | ECE | Coste medio |
|---|---|---|---|---|---|
| siempre-difundir | 36,9 % | 0,180 | 100,0 % | 0,631 | 8,31 |
| reglas | 53,1 % | 0,462 | 20,4 % | 0,469 | 2,52 |
| xgboost | 46,0 % | 0,441 | 59,6 % | 0,281 | 4,83 |
| laya (sin ajuste) | 40,5 % | 0,295 | 44,7 % | 0,274 | 4,58 |
| laya-ft | 56,4 % | 0,548 | 55,5 % | 0,239 | 4,42 |
| qwen-ft | 59,9 % | 0,589 | 56,7 % | 0,285 | 4,43 |
| **laya-ft-v2** | **55,0 %** | **0,553** | **47,4 %** | **0,186** | **3,90** |
| qwen-ft-v2 (Qwen3.5-2B) | 79,1 % | 0,805 | 29,2 % | 0,187 | 2,21 |
| combine-laya-v2 | 63,3 % | 0,623 | 11,7 % | 0,208 | 1,50 |
| combine-qwen-v2 | 71,9 % | 0,725 | 5,5 % | 0,270 | 0,77 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita, pero con 321.908.998 parámetros el peso en FP32 ronda los 1,29 GB y en FP16 aproximadamente los 0,65 GB, por lo que la inferencia cabe holgadamente en memoria de CPU. El repositorio safetensors ocupa 0,7 GB.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) sería suficiente; el modelo está pensado para ejecutarse en CPU.
- Compatibilidad con GPU consumer: sí, es probable en cualquier GPU con al menos 2 GB de VRAM, aunque la información no lo confirma explícitamente.
- Opciones de despliegue: paquete `laya` (Python, `laya.load(...)` y `agent.predict(state, questions)`), en modo local sin servidor. El modelo card menciona el modo `decideur.modele: laya-local` dentro de IRL Guard. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El coste medio por decisión reportado es de 0,73 (cartas vistas), 1,11 (cartas no vistas) y 3,90 (cartas escritas a mano) en las variantes laya-ft-v2.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Precision accion (vistas) | F1 macro (vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **irl-guard-decision-laya-v2** | 322 M | fr | 80,1 % | 0,797 | Apache 2.0 | HuggingFace (libreria laya) |
| Qwen3.5-2B ajustado (qwen-ft-v2) | no disponible en esta ficha | no disponible | 99,3 % | 0,993 | no disponible | mencionado en el model card |
| XGBoost (clasificador tabular) | no aplica | no aplica | 50,1 % | 0,502 | no disponible | baseline interno |
| Reglas deterministas | no aplica | no aplica | 39,3 % | 0,334 | no disponible | baseline interno |

Nota: las cifras comparadas proceden del propio model card del autor. No se dispone de datos independientes de terceros ni de las especificaciones completas de los modelos alternativos (longitud de contexto, licencia, formatos de pesos).

## Limitaciones y advertencias

- Las cartas "no vistas" son formulaciones y combinaciones de cláusulas ausentes del entrenamiento, pero escritas con el mismo estilo de plantillas; una carta redactada libremente por un streamer resulta notablemente más difícil (la precisión cae al 55,0 % con F1 de 0,553 en cartas escritas a mano).
- El modelo por sí solo deja pasar el 47,4 % de los casos a proteger en cartas escritas a mano; en IRL Guard se usa en modo combinado con reglas deterministas (prevalece la decisión más protectora), lo que reduce la fuga al 11,7 % en ese escenario.
- El modelo decide únicamente a partir de un `state` JSON (texto OCR, objeto detectado, carta, contexto): no ve la imagen, por lo que su precisión depende por completo de la calidad de los componentes de percepción externos.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: al ser un clasificador estructurado con etiquetas tipadas, el riesgo se manifiesta como clasificaciones erróneas o mal calibradas, no como texto libre.
- Limitación de idioma: el ajuste fino está orientado al francés (`fr`); su uso en otros idiomas no está validado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `convaiinnovations/laya-multilingual` del que deriva.
- Para producción, se recomienda desplegarlo en modo combinado con reglas y no como decisor único, dado el elevado porcentaje de fuga en cartas escritas libremente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MissawB/irl-guard-decision-laya-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/MissawB/irl-guard-decisions-v2
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Paquete `laya` en PyPI: https://pypi.org/project/laya/
