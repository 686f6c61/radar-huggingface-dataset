# fahadhafeezofficial/clsa-artifacts

## Resumen

CLSA artefacts (Causal Latent-State Agents) es un repositorio de artefactos de investigación publicado por Fahad Hafeez (Newcastle University) que contiene checkpoints entrenados para auditar el comportamiento de agentes construidos sobre modelos de lenguaje open-weight. No se trata de un modelo generativo en sí, sino de un conjunto de componentes auxiliares —un transcoder de trayectorias (SAE top-k), un modelo causal de dinámica latente, una cabeza de riesgo y tres monitores logísticos— que se acoplan a la corriente residual de un backbone congelado para modelar transiciones de estado y emitir certificados de calibración sobre decisiones del agente.

El paquete incluye artefactos para dos backbones concretos: Qwen2.5-0.5B-Instruct (896 dimensiones ocultas, capa 0.6) y SmolLM2-360M-Instruct (960 dimensiones ocultas, capa 0.6). Todo el pipeline está diseñado para entrenarse en CPU en minutos, sin GPU ni APIs comerciales, lo que lo hace reproducible en un portátil. El modelo de mundo causal tiene 130.797 parámetros en la variante Qwen, y el SAE emplea 192 características con k = 16 sobre 120 épocas de entrenamiento.

Su relevancia es metodológica: propone una disociación entre características admitidas por el SAE y las que realmente predicen el comportamiento (flip rate compartido del 0.953 frente al 0.047 de la sonda aislada), y documenta explícitamente que los umbrales calibrados no transfieren entre backbones (correlación de puntuaciones de sonda de 0.075). Es material de reproducción científica, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer congelado (Qwen2.5-0.5B-Instruct o SmolLM2-360M-Instruct) + SAE top-k sobre corriente residual + modelo causal de mundo latente + cabeza de riesgo + sondas logísticas |
| Parametros totales | 130.797 en el modelo de mundo (variante Qwen); SAE con 192 características, k = 16; sondas logísticas no cuantificadas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (artefactos en punto flotante PyTorch/joblib, sin variantes GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`sae.pt`, `model.pt`) y joblib (`probe_{dense,sparse,behaviour}.joblib`); metadatos en `artifacts.json` |

## Arquitectura y entrenamiento

El sistema opera sobre un backbone congelado y extrae activaciones de la corriente residual a nivel de token en la capa 0.6. Sobre esas activaciones se entrena un transcoder de trayectorias top-k con 192 características y k = 16, durante 120 épocas, sobre las activaciones recolectadas. El autor reporta explícitamente que la reconstrucción es débil y que no se reclama una ventaja del enfoque disperso; para predicción se recomienda la sonda densa.

El modelo de mundo causal modela p(s' | do(a), s) con 130.797 parámetros en la variante Qwen, e incorpora una cabeza de riesgo con canal de consecuencias. Se entrena con cuatro términos: predicción latente, consistencia contrafactual frente a replay bifurcado, calibración y dispersión. Las sondas son monitores logísticos sobre (bloque de estado, características de acción), ajustados únicamente sobre el contraste de compromiso, con un estandarizador empaquetado. Los datos provienen de 540 estados de decisión para Qwen y 200 para SmolLM2, recolectados de PreAct-Bench más trayectorias de entrenamiento de sondas con semillas disjuntas.

## Capacidades

- Modelado de transiciones de estado latente bajo intervenciones (`do(a)`) sobre un backbone congelado.
- Extracción de características interpretables mediante SAE top-k sobre la corriente residual.
- Emisión de certificados de calibración y umbrales de riesgo para puntos de decisión del agente.
- Monitores logísticos de comportamiento (denso, disperso y de comportamiento) para detectar compromisos.
- Evaluación de consistencia contrafactual mediante replay bifurcado.
- Entrenamiento e inferencia completos en CPU, sin GPU ni API comercial.
- Soporte para dos backbones: Qwen2.5-0.5B-Instruct y SmolLM2-360M-Instruct.
- No incluye generación de texto propia, tool calling, visión, audio ni capacidades multimodales.

## Casos de uso

- Reproducción de figuras y tablas del paper: el repositorio está pensado para replicar los resultados publicados sobre PreAct-Bench con los checkpoints incluidos y el script de carga documentado.
- Recalibración en puntos de decisión propios: un laboratorio puede reajustar los umbrales sobre su propio conjunto de decisiones, dado que el autor advierte que los umbrales calibrados no transfieren entre backbones.
- Investigación en interpretabilidad mecanicista: el SAE top-k permite estudiar qué características de la corriente residual se asocian a transiciones de estado en agentes pequeños.
- Auditoría de seguridad de agentes en entornos sintéticos: las sondas y la cabeza de riesgo sirven para medir tasas de flip y consistencia contrafactual en trayectorias controladas.
- Docencia y experimentación de bajo coste: todo el pipeline se entrena en un portátil sin GPU, lo que facilita su uso en cursos de safety o world models.
- Punto de partida para extender el método a otros backbones: la estructura de carpetas por backbone y el `artifacts.json` facilitan portar el enfoque a modelos adicionales.
- Validación de metodologías de certificación: útil para estudiar la disociación entre características admitidas y predictivas antes de adoptar esquemas similares en producción.

## Benchmarks y rendimiento

Datos reportados por el autor sobre conjuntos held-out:

| Metrica | Qwen2.5-0.5B | SmolLM2-360M |
|---|---|---|
| Consistencia contrafactual | 0.914 | 0.717 |
| Tasa de mundo alucinado | 0.043 | 0.283 |
| Características compartidas admitidas | 6 | 1 |
| Tasa de flip en características compartidas | 0.953 | 0.920 |
| Tasa de flip solo con sonda | 0.047 | 0.080 |

El autor señala que la disociación de admisión se replica entre backbones, pero que los umbrales calibrados no transfieren (correlación de puntuaciones de sonda de 0.075). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el pipeline está diseñado para ejecutarse en CPU.
- GPU recomendadas: ninguna requerida; el autor indica explícitamente entrenamiento en portátil solo-CPU en minutos.
- Cabe en cualquier equipo consumer: el backbone mayor es Qwen2.5-0.5B-Instruct y el modelo de mundo tiene 130.797 parámetros.
- Opciones de despliegue: carga vía `clsa.world_model.train.load_model` con la variable de entorno `CLSA_DERIVED` apuntando a la carpeta del backbone; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLSA artefacts | Artefactos de auditoría sobre backbone congelado | 130.797 (modelo de mundo) + SAE + sondas | no disponible | MIT | Hugging Face |
| SAE estándar (p. ej. releases de SAELens) | Diccionario disperso sobre activaciones | Variable por capa | no aplica | Variable | Hugging Face / GitHub |
| Modelos de mundo para agentes (p. ej. DreamerV3) | World model para RL | Millones | no aplica | MIT | GitHub |
| Sondas de linear probing (literatura) | Clasificador logístico sobre activaciones | Miles | no aplica | Variable | Repos académicos |

La comparación directa es limitada porque CLSA no es un modelo generativo sino un paquete de artefactos acoplado a backbones concretos; no se dispone de cifras comparables de rendimiento frente a las alternativas listadas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que estos artefactos no deben desplegarse como garantía de seguridad; los certificados que emiten dependen de la calidad de los datos de calibración.
- Los umbrales calibrados no transfieren entre backbones (correlación de 0.075), por lo que es obligatorio recalibrar antes de cualquier uso.
- El SAE reporta reconstrucción débil de forma deliberada; no se recomienda usarlo como extractor principal si se busca precisión predictiva.
- Entrenado sobre un benchmark sintético (PreAct-Bench) con 540 y 200 estados de decisión respectivamente; la generalización a dominios reales no está demostrada.
- Solo cubre dos backbones concretos y una única capa (0.6); no hay soporte documentado para otros modelos o capas.
- Sin información sobre sesgos, idiomas o riesgos de alucinación en generación, al no ser un modelo generativo.
- Licencia MIT permite uso comercial del código y pesos, pero la idoneidad técnica para producción no está respaldada por los resultados publicados.
- No se documentan latencias, throughput ni requisitos de memoria más allá de la afirmación de ejecución en CPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fahadhafeezofficial/clsa-artifacts
- Dataset PreAct-Bench: https://huggingface.co/datasets/fahadhafeezofficial/preact-bench
- Backbone Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Backbone SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
