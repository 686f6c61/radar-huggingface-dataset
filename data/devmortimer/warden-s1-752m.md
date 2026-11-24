# DevMortimer/Warden-S1-752M

## Resumen

Warden-S1-752M es un modelo verificador de tipo "System-One" de 752 millones de parámetros, desarrollado por Ryan Joshua Z. Gapac (DevMortimer) y publicado con licencia Apache-2.0. Está construido a partir de Qwen/Qwen3.5-0.8B mediante una cirugía de pesos que elimina el codificador de visión (100,6 M de parámetros) y la cabeza de predicción multi-token (20,5 M de parámetros), reduciendo el modelo de 873,4 M a 752,4 M de parámetros con una paridad de logits exacta de 0,000000. El resultado es un backbone híbrido de 18 capas Gated DeltaNet y 6 capas GQA con una ventana de contexto de 128K tokens.

El modelo no genera texto de forma convencional: en lugar de eso, incorpora cinco cabezas de verificación calibradas y de decodificación cero (`noul`, `choice`, `score`, `locus`, `salience`) que evalúan trayectorias de agentes de código de larga duración. Su propósito es actuar como verificador local y ligero que puntúa, clasifica y localiza fallos en pasos intermedios de agentes de programación, abstrayéndose cuando la confianza es baja. Es relevante porque ofrece capacidades de verificación de contexto largo en menos de 1 GiB de memoria en sus versiones cuantizadas, lo que permite desplegarlo en Apple Silicon, WebGPU o entornos sin PyTorch.

El modelo se distribuye junto con builds cuantizados MLX-4bit (415,5 MiB) y ONNX-Int4 (461,3 MiB), y está orientado exclusivamente al idioma inglés. Su pipeline declarado en Hugging Face es `text-classification`, aunque funcionalmente se comporta como un verificador de trayectorias con múltiples cabezas de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas Gated DeltaNet + 6 capas GQA (Grouped Query Attention) |
| Parametros totales | 752.393.024 (752,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | BF16 (referencia), MLX-4bit (415,5 MiB), ONNX-Int4 (461,3 MiB, 6 shards <= 92 MiB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB), MLX y ONNX en repos separados |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que combina 18 capas de Gated DeltaNet (atención lineal con estado recurrente) y 6 capas de GQA, heredado de Qwen/Qwen3.5-0.8B tras eliminar el codificador de visión y la cabeza de predicción multi-token. La cirugía de pesos se documenta en `strip_vision.py` y verifica una diferencia máxima de logits de 0,000000, lo que garantiza que el backbone de texto es idéntico al del modelo base. Sobre este backbone se añaden cinco cabezas de verificación de decodificación cero (`noul`, `choice`, `score`, `locus`, `salience`) implementadas en `heads.py`, junto con utilidades de troceado de trayectorias y formateo de sondas en `prompts.py`.

El modelo incorpora caché de estado híbrido con complejidad O(Delta L), lo que permite reutilizar el estado de contexto largo y procesar únicamente el delta incremental. Según la model card, esta técnica logra una aceleración de 18,92x por turno en una NVIDIA A100 (157,6 ms frente a 2.981 ms) al comparar 60K tokens cacheados más 2K de delta frente a un procesamiento en frío de 62K tokens. No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; únicamente se menciona el dataset de evaluación `DevMortimer/WardenS1-Bench` y la existencia de calibración de las cabezas (BF16 Cal) y de un benchmark estático externo denominado `pi-warden`.

## Capacidades

- Verificación de trayectorias de agentes de código: evalúa pasos intermedios y finales de agentes de programación de horizonte largo mediante la cabeza `noul`.
- Clasificación de opciones: la cabeza `choice` selecciona entre alternativas con un Macro-F1 de 0,8726 en el conjunto held-out.
- Puntuación de calidad: la cabeza `score` produce una puntuación continua con correlación de Spearman de 0,8784.
- Localización de fallos: la cabeza `locus` identifica el paso o fragmento problemático con un Top-1 de 0,9219.
- Detección de saliencia: la cabeza `salience` puntúa la relevancia de fragmentos con un AUROC de 0,9998.
- Abstención calibrada: el modelo puede abstenerse cuando la confianza es baja, con un MAE de abstención de 0,0193 y un ECE de 0,0126.
- Sensibilidad contrafactual: la métrica de sensibilidad neta contrafactual es de 0,9174, lo que indica que responde a cambios en las premisas.
- Contexto largo: soporta ventanas de 4K a 128K tokens, con un AUROC de 0,9988 en el tramo de 80K a 128K.
- No soporta generación de texto libre, tool calling, agentes multi-paso ni capacidades multimodales (la visión fue eliminada).
- Idiomas: únicamente inglés.

## Casos de uso

- Verificación de agentes de código en producción: integrar el modelo como paso de validación entre la propuesta de un agente y la ejecución real, usando la cabeza `noul` para descartar trayectorias defectuosas antes de aplicar cambios en el repositorio.
- Detección de alucinaciones en pipelines de generación de código: la cabeza `score` puntúa la plausibilidad de cada paso y permite filtrar respuestas con baja confianza antes de mostrarlas al usuario.
- Localización de errores en trazas largas: la cabeza `locus` señala el paso concreto donde se introdujo un fallo en trayectorias de hasta 128K tokens, útil para depuración automatizada de agentes.
- Selección entre múltiples candidatos: la cabeza `choice` permite clasificar varias soluciones propuestas por un agente y elegir la más fiable sin necesidad de un LLM adicional.
- Despliegue en el borde: las versiones MLX-4bit y ONNX-Int4 caben en menos de 1 GiB y permiten ejecutar la verificación en Apple Silicon, navegador con WebGPU o Node sin PyTorch, lo que facilita la integración en entornos de desarrollo locales.
- Moderación de contenido generado por agentes: la cabeza `salience` y la calibración de abstención permiten marcar fragmentos sospechosos y derivar a revisión humana cuando la confianza es baja.
- Evaluación continua de agentes: usar el modelo como juez local en pipelines de CI/CD para medir la calidad de las trayectorias generadas por un agente antes de fusionar cambios.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto held-out `WardenS1-Bench` (4K-128K tokens, sin solapamiento de repositorios) y comparación de las variantes BF16, MLX-Q4 y ONNX-Int4:

| Benchmark / Métrica | BF16 Cal | MLX-Q4 (415,5 MiB) | ONNX-Int4 (461,3 MiB) |
|---|---:|---:|---:|
| Noul AUROC held-out (4K-128K) | 0,9964 | 0,9957 | 0,9923 |
| Noul AUROC tramo 80K-128K | 0,9988 | 0,9947 | 0,9923 (global) |
| Noul ECE / MAE abstención | 0,0126 / 0,0193 | 0,0175 / 0,0208 | 0,0324 / 0,0% sobreconfianza |
| Choice Macro-F1 / Score Spearman rho | 0,8726 / 0,8784 | 0,8726 / 0,8814 | 0,7846 / 0,8927 |
| Sensibilidad neta contrafactual | 0,9174 | 0,9115 | 0,9259 |
| Locus Top-1 / Salience AUROC | 0,9219 / 0,9998 | 0,9297 / 0,9998 | 0,9167 / 1,0000 |

Datos adicionales de la model card:

| Métrica | Valor |
|---|---|
| Paridad BF16 vs MLX-Q4 (32 estados / 352 sondas Noul) | 0,00271 delta medio de probabilidad global; 0,0183 delta medio Noul; 0,9844 acuerdo Locus Top-1 |
| Aceleración por turno O(Delta L) en A100 (60K cacheados + 2K delta vs 62K en frío) | 18,92x (157,6 ms vs 2.981 ms) |
| Comparación head-to-head contra Cloud Jev | 100 peticiones estratificadas (resultado no detallado en la información disponible) |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 (pesos de 752,4 M de parámetros), 415,5 MiB en MLX-4bit y 461,3 MiB en ONNX-Int4.
- GPU recomendadas: NVIDIA A100 para el modo BF16 con caché O(Delta L) y contexto largo; cualquier GPU con al menos 2 GB de VRAM para BF16; GPUs integradas o Apple Silicon para las variantes cuantizadas.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares con al menos 2 GB de VRAM en BF16; las versiones MLX-4bit y ONNX-Int4 caben en menos de 1 GiB.
- Opciones de despliegue: transformers con los scripts incluidos (`modeling_warden_s1.py`, `heads.py`), MLX en Apple Silicon (hasta 10 sesiones concurrentes en Metal según la model card), ONNX Runtime en Linux, Windows, Node y navegador con WebGPU; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 157,6 ms por turno con 60K tokens cacheados más 2K de delta en A100 (18,92x frente a 2.981 ms en frío con 62K tokens). No se dispone de datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| Warden-S1-752M | 752,4 M | 128K | Apache-2.0 | Verificador System-One con 5 cabezas | Hugging Face (BF16, MLX-4bit, ONNX-Int4) |
| Qwen/Qwen3.5-0.8B | 873,4 M | no disponible en la información | Apache-2.0 | LLM generativo multimodal (base) | Hugging Face |
| Cloud Jev | no disponible | no disponible | no disponible (comercial) | Verificador comercial en la nube | Servicio comercial |

La información disponible no permite establecer comparaciones cuantitativas con otros verificadores open source de la misma categoría; los únicos puntos de referencia son el modelo base Qwen3.5-0.8B y el servicio comercial Cloud Jev, del que solo se menciona una comparación head-to-head de 100 peticiones sin resultados detallados.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- No es un modelo generativo: no produce texto libre ni soporta tool calling, agentes multi-paso o razonamiento conversacional.
- La visión fue eliminada quirúrgicamente, por lo que no procesa imágenes.
- El rendimiento se ha medido principalmente en `WardenS1-Bench`; el comportamiento fuera de distribución solo se contrasta con el benchmark estático `pi-warden`, lo que limita la generalización a otros dominios.
- Las versiones cuantizadas muestran degradación en algunas métricas: ONNX-Int4 baja el Macro-F1 de `choice` a 0,7846 y presenta un 0,0% de sobreconfianza en abstención, lo que puede afectar a la calibración en producción.
- Riesgo de alucinación en las puntuaciones: aunque el ECE es bajo (0,0126 en BF16), las cabezas pueden sobrestimar la calidad de trayectorias fuera de su distribución de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de validación comunitaria.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de equidad o contaminación.
- La caché O(Delta L) requiere gestión de estado explícita; un uso incorrecto puede invalidar las ventajas de latencia.

## Enlaces

- Hugging Face: https://huggingface.co/DevMortimer/Warden-S1-752M
- Build MLX-4bit: https://huggingface.co/DevMortimer/Warden-S1-752M-MLX-4bit
- Build ONNX-Int4: https://huggingface.co/DevMortimer/Warden-S1-752M-ONNX-Int4
- Dataset de evaluación: https://huggingface.co/datasets/DevMortimer/WardenS1-Bench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Artículo del autor: https://ryanjoshuagapac.com/writing/warden-s1
- ORCID del autor: https://orcid.org/0009-0004-2591-0219
- Contacto: mail@ryanjoshuagapac.com
