# SIMFORGE-AI/Pilot-4B-v1.5

## Resumen

Pilot-4B v1.5 es un modelo de conducción autónoma end-to-end desarrollado por SIMFORGE-AI. Parte de Qwen-Drive-1.0-4B (un VLM de 4.539 millones de parámetros en BF16) y le añade una cabeza de planificación entrenada por SimForge, consciente de la ruta, junto con un selector de planes y un veto de obstáculos que solo frena. La entrada son tres cámaras y una ruta; la salida es una trayectoria de 5 segundos a 10 Hz (50 poses).

El modelo se distribuye como un paquete completo: el VLM base byte-idéntico al original, una cabeza de percepción (detección 3D, mapa, ocupación) de 0,13 B en F32, la cabeza de planificación de 1,04 B en BF16 y el código del driver que orquesta ambos. Está pensado exclusivamente para simulación y validación en bucle cerrado, no para controlar un vehículo real.

Su relevancia radica en que demuestra que un modelo de 4,5 B con un driver bien diseñado puede superar en bucle cerrado a alternativas de 10 B (Alpamayo 1.5) en escenarios urbanos de San Francisco renderizados con Helios, aunque pierde en métricas de bucle abierto frente a su propio modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLM (Qwen-Drive) + cabeza de planificación con flow matching (32 capas) + cabeza de percepción |
| Parametros totales | 4.539.265.536 (VLM 4,54 B BF16) + 1,04 B planificador BF16 + 0,13 B percepción F32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 y F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16 para VLM y planificador, F32 para percepción) |

## Arquitectura y entrenamiento

El modelo combina un VLM base Qwen-Drive-1.0-4B (byte-idéntico al checkpoint `Qwen/Qwen-Drive-1.0-4B@28484089`) con dos cabezas auxiliares. La cabeza de percepción (0,13 B, F32) realiza detección 3D, mapa y ocupación, y se usa únicamente por el veto y el selector. La cabeza de planificación (`planner-navs2-002000/`, 1,04 B, BF16) es la parte entrenada por SimForge: 32 capas con flow matching que generan 50 poses a 10 Hz y que reciben como entrada adicional una ruta de 16 puntos.

El driver añade dos componentes de ingeniería. El selector de planes, cuando el plan de la red se desvía ≥ 0,5 m de la ruta, genera hasta 8 candidatos adicionales (incluidos los de comandos de navegación alternativos) y elige el que maximiza el progreso en ruta sin conflicto previsto. El veto de obstáculos solo frena: si el plan elegido se acerca a un obstáculo con tiempo hasta colisión de 1,5 s, aplica desaceleraciones limitadas a 2, 3,5, 5 o 7 m/s², y solo por debajo de 8 m/s. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Conducción end-to-end en simulación: entrada de tres cámaras (1080p f-theta) más ruta de 16 puntos, salida de trayectoria de 5 s con 50 poses a 10 Hz.
- Planificación consciente de ruta: el planificador incorpora la ruta como entrada y el selector corrige desviaciones superiores a 0,5 m.
- Percepción auxiliar: detección 3D, mapa de ocupación y mapa semántico a través de la cabeza de percepción.
- Veto de seguridad: frenado automático ante obstáculos previstos con TTC de 1,5 s, con desaceleraciones escalonadas.
- Generación de candidatos alternativos: hasta 8 planes por decisión, incluidos los derivados de comandos de navegación alternativos.
- Funcionamiento en bucle cerrado: decisiones cada 0,5 s con latencia de efecto de 0,2 s.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modo thinking en la información disponible.

## Casos de uso

- Validación de planificadores en simulación urbana: el modelo se integra en el motor SimForge con mapas de San Francisco para evaluar rutas de 20 s (200 pasos a 10 Hz) con el scorer `simforge.offroad/v4` y `simforge.collision/v2`.
- Pruebas de regresión de conducción autónoma: sirve como referencia en pipelines de CI para detectar regresiones en planificación antes de desplegar cambios en sistemas reales, usando los 60 escenarios autorados como suite.
- Investigación en recuperación de errores: su selector de planes está diseñado para recuperarse de desviaciones de ruta, lo que lo hace útil para estudiar estrategias de replanificación en bucle cerrado.
- Evaluación comparativa de modelos de conducción: permite comparar arquitecturas de 4-10 B bajo el mismo controlador pure-pursuit y el mismo motor de simulación, con intervalos de confianza por bootstrap pareado.
- Estudio de seguridad activa: el veto de frenado con TTC de 1,5 s y desaceleraciones acotadas se puede analizar como capa de seguridad independiente del planificador principal.
- Generación de datos sintéticos de trayectorias: las 50 poses a 10 Hz por decisión pueden usarse para aumentar datasets de planificación en escenarios simulados.
- Benchmarking de percepción 3D: la cabeza de percepción byte-idéntica al base permite evaluar detección y ocupación de forma aislada del planificador.

## Benchmarks y rendimiento

Bucle cerrado en SimForge con 60 escenarios autorados de San Francisco (renderer Helios, 20 s, 200 pasos a 10 Hz, semilla 42, mismo controlador pure-pursuit):

| Metrica | Pilot-4B v1.5 | Alpamayo 1.5 (10B) | SimForge-D1.5 | Qwen-Drive-1.0-4B (base) |
|---|---|---|---|---|
| Driving score medio ↑ | **0.537** | 0.405 | 0.405 | 0.301 |
| Episodios terminados en colisión (de 60) ↓ | **16** | 30 | 37 | 33 |
| Diferencia de score vs Pilot [IC 95%] | — | +0.132 [+0.046, +0.222] | +0.132 [+0.040, +0.222] | +0.236 [+0.160, +0.314] |
| Diferencia de tasa de colisión vs Pilot [IC 95%] | — | +0.233 [+0.083, +0.383] | +0.350 [+0.167, +0.517] | +0.283 [+0.133, +0.433] |

Bucle cerrado en AlpaSim interno con 96 escenas (panel de ajuste, 200 pasos × 0,1 s, scorer `e121e59`):

| Metrica | Pilot-4B v1.5 | Alpamayo 1.5 (10B) | SimForge-D1.5 | Qwen-Drive-1.0-4B (base) |
|---|---|---|---|---|
| Score medio de escena ↑ | **0.601** | 0.556 | 0.470 | 0.422 |
| Diferencia vs Pilot [IC 95%] | — | +0.046 [−0.068, +0.161], no significativa | +0.131 [+0.006, +0.255] | +0.179 [+0.067, +0.295] |

Bucle abierto (minADE a 3 s, una muestra, menor es mejor) sobre los mismos 60 escenarios:

| Modelo | minADE a 3 s |
|---|---|
| Qwen-Drive-1.0-4B (base) | **0.910 m** |
| Alpamayo 1.5 | 1.199 m |
| Pilot-4B v1.5 | 1.343 m |
| SimForge-D1.5 | 1.461 m |

El autor advierte que los resultados se ejecutaron una vez por escena con una semilla y que los intervalos cubren solo el muestreo de escenas. En el panel AlpaSim, Pilot no tiene menos colisiones que Alpamayo 1.5; su ventaja está en menos salidas del corredor de carril y mejor rendimiento en escenas de crucero, mientras que Alpamayo 1.5 rinde mejor en escenas lentas y estacionarias.

## Requisitos de hardware

- VRAM recomendada: 24 GB o más. El servicio benchmarkeado alcanzó un pico de 15,1 GiB en una A100-40GB.
- GPU validadas: A100-40GB (entorno de los benchmarks). No se documentan otras GPU en la información disponible.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; el requisito de Docker y CUDA 12.6 con 24 GB de VRAM sugiere que una RTX 4090 (24 GB) podría ser suficiente, pero no está validado por el autor.
- Despliegue: contenedor Docker con Python 3.12 y CUDA 12.6; se ejecuta `inference.py` sobre `examples/sf-slowing/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo emite una decisión cada 0,5 s en el protocolo de simulación, pero no se publica latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Driving score (SF, 60 escenas) | Colisiones (de 60) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pilot-4B v1.5 | 4,54 B + 1,04 B planificador | no disponible | 0.537 | 16 | apache-2.0 | HuggingFace |
| Alpamayo 1.5 | 10 B | no disponible | 0.405 | 30 | no disponible | no disponible |
| SimForge-D1.5 | no disponible | no disponible | 0.405 | 37 | no disponible | no disponible |
| Qwen-Drive-1.0-4B (base) | 4,54 B | no disponible | 0.301 | 33 | no disponible | HuggingFace |

Pilot-4B v1.5 supera a Alpamayo 1.5 (10 B) y a SimForge-D1.5 en bucle cerrado con significación estadística en el panel de 60 escenas, y mejora a su base en +0,236 de score. Sin embargo, en bucle abierto su minADE (1,343 m) es peor que el de su base (0,910 m), lo que refleja que está optimizado para recuperación y progreso en bucle cerrado, no para imitar trayectorias de referencia.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación para simulación: no ha sido validado para controlar un vehículo real y no debe usarse con ese fin.
- Los resultados se obtuvieron con una sola semilla por escena; los resultados por escena varían mucho entre semillas y versiones del motor, por lo que un clip individual es un ejemplo, no una garantía.
- El panel AlpaSim de 96 escenas se usó para seleccionar y ajustar Pilot, por lo que favorece al modelo; debe leerse como una comprobación dentro de la familia.
- En ese panel, la ventaja sobre Alpamayo 1.5 no es estadísticamente significativa (+0,046 [−0,068, +0,161]) y Pilot no tiene menos colisiones que Alpamayo 1.5.
- Peor rendimiento en bucle abierto que su modelo base: minADE de 1,343 m frente a 0,910 m, lo que indica menor fidelidad a trayectorias de referencia.
- El veto solo frena, nunca gira, y solo actúa por debajo de 8 m/s; no cubre maniobras evasivas.
- Dependencia de la ruta de entrada: Alpamayo 1.5 y SimForge-D1.5 no aceptan ruta, lo que condiciona la comparación (el autor indica que la ruta se envía a todos los modelos que la aceptan).
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe; el modelo está orientado a percepción visual y planificación, no a texto general.
- Licencia apache-2.0 permite uso comercial del software, pero la advertencia del autor restringe explícitamente el uso en vehículos reales.
- No se publican curvas de entrenamiento, composición del dataset ni detalles de alineación (RLHF/DPO).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SIMFORGE-AI/Pilot-4B-v1.5
- Modelo base: https://huggingface.co/Qwen/Qwen-Drive-1.0-4B
- Sitio del autor: https://simforge.ai
- Renderer Helios: https://simforge.ai/helios
- Dataset relacionado SIMLOG-25k: https://huggingface.co/datasets/SIMFORGE-AI/simlog-25k
