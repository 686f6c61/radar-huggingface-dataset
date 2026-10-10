# MissawB/irl-guard-decision-qwen-v2

## Resumen

IRL Guard decision model v2 es un ajuste fino supervisado sobre `unsloth/Qwen3.5-2B` (2.274.069.824 parámetros, unos 2,27 mil millones) desarrollado por el usuario MissawB. No es un modelo generativo de propósito general: se ha reentrenado como clasificador estructurado que, a partir de un objeto `state` en JSON (charte de canal en lenguaje natural, categoría del stream, modo domicilio, elemento detectado en pantalla), responde a tres preguntas tipadas —acción (emitir, difuminar o pausar), riesgo y gravedad— con probabilidades calibradas. Se publica bajo licencia Apache 2.0 y está pensado exclusivamente para francés.

El problema que resuelve es la moderación automática de directos IRL, donde un streamer puede exponer sin querer información sensible (documentos, pantallas, personas, matrículas) y donde las reglas deterministas se quedan cortas. El modelo consume texto ya extraído por OCR y detección de objetos (no ve la imagen) y devuelve una decisión con estimación de riesgo, lo que permite integrarlo en un pipeline de difuminado o pausa en tiempo real. En el propio proyecto IRL Guard se usa como decisor por defecto (`--decider combine`, `decideur.modele: qwen-local`), combinado con reglas deterministas.

Su relevancia actual es doble: demuestra que un transformer de 2B ajustado con Unsloth puede superar con margen a clasificadores tabulares (XGBoost) y a modelos especializados previos en una tarea de decisión estructurada, y lo hace con latencias de unos 0,15 s por decisión en una GPU de consumo (RTX 4060). El repositorio tiene 4,6 GB en safetensors y cero descargas registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (derivada de Qwen3.5-2B); detalles internos del modelo base no disponibles en la información proporcionada |
| Parametros totales | 2.274.069.824 (unos 2,27 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors (4,6 GB) |
| Idiomas soportados | francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; incluye el script `joint_schema_model.py` para carga con `transformers` |

Otras especificaciones: pipeline declarado `text-classification`, librería `unsloth`, modelo base `unsloth/Qwen3.5-2B`, dataset de entrenamiento `MissawB/irl-guard-decisions-v2`, etiquetas `structured-decisions`, `content-moderation`, `live-streaming`, `irl-guard`. Fecha de creación y última actualización del repositorio: 10 de octubre de 2026.

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-2B`, un transformer decoder de 2,27 B de parámetros, y se ajusta de forma supervisada sobre el dataset `MissawB/irl-guard-decisions-v2` con la librería Unsloth. La información disponible no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco detalla si se congelaron capas o se aplicó LoRA/QLoRA durante el ajuste, más allá de la mención a Unsloth como herramienta.

La innovación principal no está en la arquitectura, sino en la interfaz de decisión: el modelo no genera texto libre, sino que responde a tres preguntas tipadas (acción, riesgo y gravedad) con probabilidades calibradas, a partir de un `state` JSON que incluye la charte del canal, la categoría del stream, el modo domicilio y el elemento detectado. El repositorio incorpora `joint_schema_model.py` con las funciones `load_release_model` y `systemone`, que encapsulan la carga y la inferencia. Según la model card, el modelo se despliega en modo combinado con reglas deterministas, de modo que gana la decisión más protectora; esa combinación es la que reduce la tasa de fuga en los escenarios más difíciles.

## Capacidades

- Clasificación estructurada de decisiones en tres ejes tipados: acción (difuminar / difuminar / pausar), riesgo y gravedad.
- Salida con probabilidades calibradas (la model card reporta métricas de calibración ECE), apta para umbrales configurables en producción.
- Interpretación de chartes de canal en lenguaje natural incluidas en el `state` JSON, incluidas combinaciones de cláusulas no vistas durante el entrenamiento.
- Procesamiento de contexto multimodal ya convertido a texto: lecturas de OCR, objetos detectados y metadatos del stream.
- Integración con la Decision API de Unsloth Studio (`POST /v1/systemone`) y con `transformers` mediante el script del repositorio.
- Funciona como decisor por defecto de IRL Guard en modo combinado con reglas deterministas.
- Capacidades multilingües: únicamente francés.
- No soporta tool calling, function calling, agentes multi-paso ni modo «thinking»: no hay evidencia de ello en la información disponible.
- No procesa imágenes: el modelo no ve el fotograma, solo el texto derivado de él.

## Casos de uso

- Moderación de directos IRL en tiempo real: el modelo recibe el estado textual del stream (elemento detectado, charte del canal, categoría) y devuelve una acción con probabilidad asociada; con ~0,15 s por decisión en una RTX 4060 permite reaccionar dentro del propio directo sin bloquear el pipeline de vídeo.
- Difuminado automático de información sensible: cuando la acción predicha es «flouter» con riesgo alto, el sistema puede aplicar el filtro sobre la región detectada por el módulo de visión, reservando la pausa para los casos de gravedad máxima.
- Aplicación de la charte personalizada de cada streamer: al aceptar la charte en lenguaje natural dentro del `state`, el mismo modelo sirve para canales con reglas distintas sin reentrenar, lo que reduce el coste de alta de nuevos usuarios.
- Filtro previo en pipelines de revisión humana: las decisiones con ECE bajo y probabilidad intermedia pueden enrutarse a un moderador humano, aprovechando la calibración reportada para fijar umbrales de escalado.
- Pausa automática de emergencia en streams con modo domicilio activo: la categoría «modo domicilio» en el estado permite elevar la sensibilidad del sistema ante la aparición de documentos, pantallas o personas identificables.
- Auditoría y registro de decisiones: al devolver valores tipados y probabilidades, las decisiones son trazables y comparables frente a las reglas deterministas, lo que facilita depurar falsos positivos y falsos negativos a posteriori.
- Prototipado de sistemas de decisión estructurada en francés: el esquema `state` JSON + preguntas tipadas es reutilizable para otros dominios de moderación o cumplimiento que requieran salidas discretas con confianza.

## Benchmarks y rendimiento

Los resultados de la model card corresponden a 1.000 casos por conjunto de evaluación. Las métricas son precisión de la acción, F1 macro, tasa de fuga («fuite», casos que deberían protegerse y la aproximación emite), calibración (ECE) y coste medio por decisión (unidad no especificada en la documentación). `qwen-ft` corresponde a Qwen3.5-0.8B ajustado y `qwen-ft-v2` al modelo de esta ficha (Qwen3.5-2B ajustado).

### Chartes vistas

| Aproximación | Acción | F1 macro | Fuga | ECE | Coste medio |
|---|---|---|---|---|---|
| siempre-difundir | 44,9 % | 0,207 | 100,0 % | 0,551 | 8,48 |
| reglas | 39,3 % | 0,334 | 21,1 % | 0,607 | 3,17 |
| xgboost | 50,1 % | 0,502 | 16,5 % | 0,080 | 2,30 |
| laya | 40,7 % | 0,314 | 55,9 % | 0,289 | 5,59 |
| laya-ft | 73,8 % | 0,721 | 20,0 % | 0,053 | 2,02 |
| qwen-ft | 82,0 % | 0,807 | 15,2 % | 0,042 | 1,44 |
| laya-ft-v2 | 80,1 % | 0,797 | 3,8 % | 0,072 | 0,73 |
| qwen-ft-v2 | 99,3 % | 0,993 | 0,2 % | 0,005 | 0,02 |
| combine-laya | 58,1 % | 0,592 | 5,4 % | 0,267 | 1,25 |
| combine-qwen | 63,1 % | 0,641 | 2,4 % | 0,272 | 0,83 |
| combine-laya-v2 | 63,4 % | 0,638 | 0,7 % | 0,224 | 0,73 |
| combine-qwen-v2 | 72,7 % | 0,733 | 0,0 % | 0,272 | 0,31 |

### Chartes no vistas

| Aproximación | Acción | F1 macro | Fuga | ECE | Coste medio |
|---|---|---|---|---|---|
| siempre-difundir | 40,5 % | 0,192 | 100,0 % | 0,595 | 9,34 |
| reglas | 44,5 % | 0,407 | 21,2 % | 0,555 | 3,27 |
| xgboost | 45,9 % | 0,458 | 24,2 % | 0,138 | 3,11 |
| laya | 34,2 % | 0,275 | 47,6 % | 0,297 | 5,54 |
| laya-ft | 72,2 % | 0,711 | 21,5 % | 0,061 | 2,44 |
| qwen-ft | 80,3 % | 0,793 | 20,3 % | 0,084 | 1,92 |
| laya-ft-v2 | 74,3 % | 0,740 | 6,2 % | 0,034 | 1,11 |
| qwen-ft-v2 | 97,3 % | 0,972 | 2,2 % | 0,017 | 0,23 |
| combine-laya | 63,5 % | 0,642 | 4,4 % | 0,216 | 1,25 |
| combine-qwen | 69,8 % | 0,701 | 5,4 % | 0,228 | 0,97 |
| combine-laya-v2 | 66,4 % | 0,664 | 1,3 % | 0,130 | 0,83 |
| combine-qwen-v2 | 79,3 % | 0,790 | 0,3 % | 0,198 | 0,28 |

### Chartes escritas a mano

| Aproximación | Acción | F1 macro | Fuga | ECE | Coste medio |
|---|---|---|---|---|---|
| siempre-difundir | 36,9 % | 0,180 | 100,0 % | 0,631 | 8,31 |
| reglas | 53,1 % | 0,462 | 20,4 % | 0,469 | 2,52 |
| xgboost | 46,0 % | 0,441 | 59,6 % | 0,281 | 4,83 |
| laya | 40,5 % | 0,295 | 44,7 % | 0,274 | 4,58 |
| laya-ft | 56,4 % | 0,548 | 55,5 % | 0,239 | 4,42 |
| qwen-ft | 59,9 % | 0,589 | 56,7 % | 0,285 | 4,43 |
| laya-ft-v2 | 55,0 % | 0,553 | 47,4 % | 0,186 | 3,90 |
| qwen-ft-v2 | 79,1 % | 0,805 | 29,2 % | 0,187 | 2,21 |
| combine-laya | 63,1 % | 0,622 | 11,3 % | 0,286 | 1,46 |
| combine-qwen | 64,5 % | 0,639 | 10,9 % | 0,306 | 1,41 |
| combine-laya-v2 | 63,3 % | 0,623 | 11,7 % | 0,208 | 1,50 |
| combine-qwen-v2 | 71,9 % | 0,725 | 5,5 % | 0,270 | 0,77 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable dado que se trata de un modelo especializado en clasificación estructurada, no de un modelo conversacional.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (safetensors de 4,6 GB): en torno a 5-6 GB de VRAM contando pesos en bf16/fp16 y overhead de activaciones; el modelo se carga en GPU según la model card.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para precisión completa; la model card reporta funcionamiento sin Unsloth en una RTX 4060.
- Cabe en GPU de consumo: sí. Se ha validado en una RTX 4060; también es viable en RTX 3060 12 GB, RTX 4070/4080/4090 y equivalentes con 8 GB o más.
- Latencia reportada: aproximadamente 0,15 s por decisión en una RTX 4060, en carga sin Unsloth.
- Opciones de despliegue: Unsloth Studio mediante la Decision API (`UNSLOTH_SYSTEMONE_MODEL=<ruta> unsloth studio`, `POST /v1/systemone`) o carga directa con `transformers` a través de `joint_schema_model.load_release_model` y `systemone`. No se documentan despliegues con vLLM, TGI, llama.cpp u Ollama, ni pesos GGUF en el repositorio.
- Throughput: no disponible más allá de la latencia por decisión indicada.

## Comparativa con modelos similares

Los comparadores proceden de la propia evaluación del autor; los parámetros de los rivales no están documentados.

| Modelo | Tipo | Parámetros | F1 macro (chartes vistas) | F1 macro (chartes no vistas) | F1 macro (chartes a mano) | Licencia |
|---|---|---|---|---|---|---|
| qwen-ft-v2 (esta ficha) | Ajuste de Qwen3.5-2B | 2,27 B | 0,993 | 0,972 | 0,805 | Apache 2.0 |
| qwen-ft | Ajuste de Qwen3.5-0.8B | no disponible (base 0,8 B) | 0,807 | 0,793 | 0,589 | no disponible |
| laya-ft-v2 | Ajuste de «Laya» v2 | no disponible | 0,797 | 0,740 | 0,553 | no disponible |
| reglas | Sistema determinista | no aplica | 0,334 | 0,407 | 0,462 | no aplica |
| xgboost | Clasificador tabular | no aplica | 0,502 | 0,458 | 0,441 | no aplica |

La ventaja de qwen-ft-v2 es clara en los tres regímenes, especialmente en chartes vistas y no vistas; en chartes escritas a mano la ventaja se reduce (0,805 frente a 0,553 de laya-ft-v2) y su tasa de fuga del 29,2 % obliga a usarlo en modo combinado con reglas, que la rebaja al 5,5 %.

## Limitaciones y advertencias

- Idioma: el modelo solo está entrenado y evaluado en francés; no hay evidencia de transferencia a castellano ni a otros idiomas.
- No procesa imágenes: la calidad de sus decisiones depende por completo de la precisión del OCR y del detector de objetos que generen el `state` JSON.
- Fuga de casos sensibles en chartes escritas a mano: el modelo por sí solo deja pasar el 29,2 % de los casos que deberían protegerse. Debe desplegarse en modo combinado con reglas deterministas (fuga resultante del 5,5 %).
- Generalización limitada a plantillas: las chartes «no vistas» de la evaluación están escritas con el mismo estilo de plantilla que las de entrenamiento; una charte redactada libremente por un streamer será más difícil de interpretar.
- Riesgo de alucinación en la interfaz: aunque la salida es tipada, el modelo parte de un LLM generativo, por lo que conviene validar el esquema de respuesta y no confiar en la salida sin comprobación estructural.
- Calibración degradada en modo combinado: la ECE sube de 0,005 a 0,272 en chartes vistas al combinar con reglas, de modo que las probabilidades del sistema combinado no deben interpretarse como calibradas.
- Sesgos: no se documenta ningún análisis de sesgos por parte del autor; al ser un modelo de moderación, los falsos positivos pueden afectar de forma desigual a determinados contenidos o creadores.
- Trazabilidad y reproducibilidad: el repositorio no publica detalles de hiperparámetros, composición del dataset ni proceso de ajuste, lo que dificulta auditar el comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base Qwen3.5-2B puede arrastrar condiciones propias de su licencia original; conviene verificarlas antes de un despliegue comercial.
- Adopción nula: cero descargas y cero «likes» en el momento de redactar la ficha, sin comunidad que haya validado los resultados de forma independiente.
- Coste medio por decisión: la unidad de la métrica no está especificada en la model card, por lo que las cifras de coste solo sirven para comparar aproximaciones entre sí, no para estimar presupuesto real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MissawB/irl-guard-decision-qwen-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/MissawB/irl-guard-decisions-v2
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Unsloth Studio: https://unsloth.ai

Nota sobre la búsqueda web: los resultados devueltos (páginas de Fortnite en jeuxvideo.com y hilos del foro alemán tutorials.de) no guardan relación con el modelo, por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
