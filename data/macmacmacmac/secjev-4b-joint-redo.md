# macmacmacmac/SecJev-4B-Joint-Redo

## Resumen

SecJev-4B-Joint-Redo es un adaptador LoRA de seguridad desarrollado por el usuario `macmacmacmac` sobre el modelo base Qwen/Qwen3.5-4B-Base. No es un modelo generativo de propósito general, sino un clasificador de decisión entrenado para responder dos preguntas binarias en un único checkpoint: si una acción está autorizada y si una entrada contiene un intento de prompt injection. El repositorio contiene el adaptador LoRA, una cabeza de clasificación entrenada y el tokenizer, pero no re-aloja los pesos del backbone.

El modelo se distribuye bajo una licencia propia denominada `secjev-use-and-distribution-agreement-v1.0`, con soporte únicamente para inglés. Su relevancia radica en el enfoque de seguridad aplicada: un modelo pequeño (4B de backbone, ~33,8M de parámetros entrenables) que actúa como guardián de decisiones en pipelines de agentes y sistemas con tool calling, donde la detección de inyecciones y la verificación de autorización son requisitos críticos.

El entrenamiento se realizó en una única GPU H100 80GB durante aproximadamente 34 minutos, con 1 época, learning rate 3e-5 y un presupuesto de 4096 tokens. Los resultados publicados son exclusivamente de desarrollo (dev), no de test congelado ni de replicación independiente, por lo que deben interpretarse como mediciones de desarrollo y no como garantías de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter + cabeza de clasificación sobre backbone transformer Qwen3.5-4B-Base |
| Parametros totales | 33.776.128 entrenables (LoRA + head); backbone congelado (tamaño del backbone no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto de tokens de entrenamiento); contexto nativo del backbone no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | secjev-use-and-distribution-agreement-v1.0 |
| Formato de pesos | safetensors (adaptador LoRA + head + tokenizer); backbone no incluido, se obtiene vía `bootstrap.py` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo LoRA sobre el backbone Qwen/Qwen3.5-4B-Base, que permanece congelado durante el entrenamiento. Sobre el backbone se añade una cabeza de clasificación entrenada que responde dos preguntas en un único checkpoint: autorización (scoring = P("2") + 0.5·P("1")) e inyección (scoring = P("true")). El repositorio raíz es un directorio de checkpoint completo cargable con el loader "Kev", e incluye el adaptador LoRA, la cabeza entrenada y el tokenizer. El backbone no se re-aloja; un script `bootstrap.py` descarga la versión fijada del backbone y el código fuente de Kev.

El entrenamiento se ejecutó el 2026-11-03 de 23:03:28 a 23:37:49 UTC en un droplet de DigitalOcean con GPU NVIDIA H100 80GB, mediante el script `ft_action.py`. Se usó 1 época, learning rate 3e-5, batch de 32 preguntas, presupuesto de 4096 tokens, gradient checkpointing y pesos en fp32 con autocast bf16. Los datos provienen de `data/bench/train_joint_t.jsonl` (train) y `data/bench/dev_joint_t.jsonl` (dev), correspondientes a los conjuntos "jev-stageA redo bench". No se documenta el número total de tokens de entrenamiento ni la composición completa del dataset. El log completo está en `redo-training-log.jsonl` y `redo-training.stdout.txt`, y los detalles legibles por máquina en `redo-provenance.json`.

## Capacidades

- Clasificación de autorización: determina si una acción o petición está autorizada, con scoring continuo P("2") + 0.5·P("1").
- Detección de prompt injection: clasifica si una entrada contiene un intento de inyección de prompt (scoring P("true")).
- Modelo de decisión conjunto: responde ambas preguntas en un único checkpoint, sin necesidad de dos modelos separados.
- Integración con pipelines de agentes: pensado como guardián de decisiones en sistemas con tool calling y razonamiento multi-paso.
- Soporte monolingüe: únicamente inglés.
- No es un modelo generativo de texto libre: no se documentan capacidades de generación, código, matemáticas, visión ni audio.
- Carga mediante loader específico "Kev" y script de bootstrap para el backbone.

## Casos de uso

- Guardián de autorización en agentes: antes de ejecutar una tool call sensible (envío de correos, modificación de ficheros, transacciones), el modelo evalúa la probabilidad de que la acción esté autorizada y bloquea las peticiones por debajo del umbral configurado.
- Detección de prompt injection en entradas de usuario: filtrado previo de mensajes en asistentes conversacionales, con un TPR@0.5 del 77,6% y un FPR@0.5 del 2,0% en dev, adecuado como primera capa de defensa combinada con otras técnicas.
- Protección de pipelines RAG: clasificación de documentos recuperados antes de inyectarlos en el contexto del LLM, para detectar contenido malicioso embebido en fuentes externas.
- Moderación en sistemas multi-agente: verificación de que los mensajes entre agentes respetan las políticas de autorización y no contienen instrucciones inyectadas.
- Auditoría y monitorización: registro de las puntuaciones de autorización e inyección para cada interacción, permitiendo análisis forense posterior y ajuste de umbrales.
- Filtrado en APIs de terceros: evaluación de prompts entrantes en gateways de LLM para bloquear intentos de jailbreak o manipulación antes de llegar al modelo principal.
- Evaluación de seguridad en CI/CD: ejecución del clasificador sobre conjuntos de prompts de prueba para detectar regresiones en la robustez frente a inyecciones tras cambios en el sistema.

## Benchmarks y rendimiento

Resultados de desarrollo (dev) publicados por el autor. La re-evaluación corregida por pregunta sobre el fichero dev usa scoring authorization = P("2") + 0.5·P("1") e injection = P("true").

| Pregunta | n dev | positivos dev | AUC | TPR@0.5 | FPR@0.5 |
|---|---|---|---|---|---|
| Autorización | 500 | 85 | 0.9898 | 0.9412 | 0.0048 |
| Inyección | 500 | 250 | 0.9314 | 0.7760 | 0.0200 |

No existen resultados de test congelado, ataque adaptativo ni replicación independiente para este checkpoint. Las filas dev se usaron para monitorización durante el entrenamiento. Las métricas dev impresas en `redo-training-log.jsonl` para las ejecuciones de la pregunta de inyección usaron una fórmula de scoring solo de autorización y son inválidas para esas ejecuciones (muestran AUC 0.0 / 0.14); la tabla anterior las sustituye. El entrenamiento sí usó objetivos correctos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador LoRA y la cabeza suman ~33,8M parámetros, pero requieren cargar el backbone Qwen3.5-4B-Base completo (tamaño en VRAM según cuantización del backbone no documentado).
- GPU de entrenamiento documentada: NVIDIA H100 80GB (DigitalOcean, droplet `jev-train-1`).
- GPU recomendadas para inferencia: no disponibles; por el tamaño del backbone (4B) cabría esperar GPUs consumer de gama alta, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer? No confirmado; depende de la cuantización del backbone, no especificada.
- Opciones de despliegue: loader "Kev" propietario, con `bootstrap.py` para descargar el backbone fijado y el código fuente de Kev. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones de modelos comparables en la información proporcionada. Se trata de un adaptador LoRA de seguridad sobre Qwen3.5-4B-Base; no se han documentado alternativas equivalentes (clasificadores de prompt injection o modelos de decisión de autorización) con las que comparar parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SecJev-4B-Joint-Redo | 33,8M entrenables (backbone 4B) | 4096 (presupuesto de entrenamiento) | secjev-use-and-distribution-agreement-v1.0 | HuggingFace (adaptador; backbone vía bootstrap) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Resultados solo de desarrollo: no hay test congelado, ataque adaptativo ni replicación independiente; las métricas dev no son garantías de despliegue.
- Métricas de inyección moderadas: TPR@0.5 del 77,6% implica que aproximadamente una de cada cuatro inyecciones positivas en dev no se detecta con umbral 0.5.
- Dependencia de umbral: el rendimiento real depende del umbral elegido; los valores TPR/FPR publicados corresponden a 0.5 y no se documentan curvas ROC completas.
- Idiomas: solo inglés; no apto para entradas en otros idiomas sin validación adicional.
- Licencia restrictiva: `secjev-use-and-distribution-agreement-v1.0` con cláusulas propias; es necesario revisar el fichero LICENSE antes de cualquier uso comercial o redistribución.
- Backbone no incluido: requiere ejecutar `bootstrap.py` para descargar Qwen3.5-4B-Base y el código de Kev, lo que añade una dependencia externa y un paso de setup.
- Loader propietario: la carga se realiza con el loader "Kev", no con herramientas estándar como transformers, vLLM o llama.cpp; esto limita la portabilidad.
- Riesgo de alucinación en la clasificación: al ser un modelo de decisión, puede producir falsos positivos y falsos negativos; no debe usarse como única capa de seguridad.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset específico ("jev-stageA redo bench"), puede no generalizar a dominios o distribuciones distintas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/macmacmacmac/SecJev-4B-Joint-Redo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: fichero LICENSE en el repositorio (secjev-use-and-distribution-agreement-v1.0)
- Log de entrenamiento: `redo-training-log.jsonl` y `redo-training.stdout.txt` en el repositorio
- Provenance legible por máquina: `redo-provenance.json` en el repositorio
- Script de bootstrap: `bootstrap.py` en el repositorio
- Script de entrenamiento: `ft_action.py` (referenciado en la model card)
- Datasets: `data/bench/train_joint_t.jsonl` y `data/bench/dev_joint_t.jsonl` (referenciados en la model card)
