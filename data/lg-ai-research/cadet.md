# LG-AI-Research/CADET

## Resumen

CADET es un conjunto de checkpoints de políticas de enrutamiento de PCB (printed circuit board) entrenadas por LG AI Research y publicadas junto al artículo del mismo nombre. No es un modelo de lenguaje generalista: son políticas de aprendizaje por refuerzo con arquitectura transformer decoder-only de 6 capas, d_model 256, 8 cabezas de atención y FFN de 1024, lo que suma 6,8 millones de parámetros. El modelo resuelve el problema de enrutar conexiones en placas de circuito impreso dentro del entorno de simulación PCBWorld, un dominio con restricciones geométricas y de reglas de diseño.

El repositorio incluye seis variantes de pesos: la política CADET (behavioral cloning sobre RouteDemos seguida de ajuste fino con PPO), CADET-BC (solo behavioral cloning), y cuatro políticas PPO entrenadas desde cero en distintos conjuntos de datos (RouteDemos, RouteDemos sin TryRoute, PCBWorld D2 y tableros reales D3-B ref). Cada fichero contiene el `policy_state_dict`, los argumentos de entrenamiento y una sonda de observación (`obs_probe`), todo con semilla 42.

Su relevancia es acotada pero específica: demuestra que políticas transformer pequeñas, entrenadas con imitación más RL, pueden abordar una tarea de automatización de diseño electrónico que tradicionalmente se resuelve con heurísticas o algoritmos de búsqueda. La licencia EXAONE 1.2-NC restringe el uso a investigación y educación, e incluso prohíbe el uso comercial de las placas enrutadas con el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (política de RL) |
| Parámetros totales | 6,8 M (6 capas, d_model 256, 8 cabezas, FFN 1024) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | EXAONE AI Model License Agreement 1.2 - NC (solo investigación y educación) |
| Formato de pesos | PyTorch (`.pt` con `policy_state_dict`, `args` y `obs_probe`) |

## Arquitectura y entrenamiento

La política es un transformer decoder-only de 6 capas con dimensión de modelo 256, 8 cabezas de atención y FFN de 1024, totalizando 6,8 M de parámetros. Se ejecuta dentro de PCBWorld, el entorno de simulación de enrutamiento de PCB publicado por el mismo grupo, y opera sobre observaciones del estado del tablero para emitir acciones de enrutamiento.

El entrenamiento combina dos regímenes. CADET parte de behavioral cloning (BC) sobre el conjunto RouteDemos y después se ajusta con PPO (Proximal Policy Optimization). Las demás variantes aíslan componentes del pipeline: CADET-BC usa solo BC, y las políticas PPO se entrenan desde cero sobre RouteDemos, RouteDemos sin la acción TryRoute, PCBWorld D2 y tableros reales (D3-B ref). Todas las ejecuciones usan semilla 42. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni detalles del bucle de RL más allá del algoritmo y el conjunto de datos.

## Capacidades

- Enrutamiento de conexiones en placas de circuito impreso dentro del entorno PCBWorld.
- Toma de decisiones secuenciales como política de RL (observación → acción).
- Aprendizaje por imitación de demostraciones humanas o heurísticas (RouteDemos) y ajuste por refuerzo con PPO.
- Generalización a distintos dominios de tablero: desde el conjunto sintético D2 hasta tableros reales (D3-B ref).
- Ablación de acciones: la variante sin TryRoute permite estudiar el efecto de esa acción concreta en el rendimiento.
- No soporta tool calling, agentes multi-paso genéricos, capacidades multilingües, visión ni audio.

## Casos de uso

- Investigación en automatización de EDA: usar CADET como política de referencia en PCBWorld para comparar nuevos algoritmos de enrutamiento con una línea base reproducible (semilla 42, pesos publicados).
- Estudio de behavioral cloning frente a RL: comparar `cadet_bc.pt` con `cadet.pt` para medir cuánto aporta el ajuste fino con PPO sobre la imitación pura en una tarea de enrutamiento.
- Ablación de acciones en entornos de RL: emplear `ppo_routedemos_no_tryroute.pt` frente a `ppo_routedemos.pt` para analizar el impacto de la acción TryRoute en la política aprendida.
- Transferencia a tableros reales: evaluar `ppo_real.pt`, entrenada sobre D3-B ref, como punto de partida para estudiar la brecha entre simulación y placas reales.
- Docencia en aprendizaje por refuerzo: usar el repositorio como ejemplo compacto (6,8 M de parámetros) de pipeline BC + PPO con checkpoints intermedios y sonda de observación incluida.
- Reproducción de resultados del artículo: descargar los seis checkpoints y ejecutarlos en PCBWorld para replicar las filas de la tabla del paper (CADET, CADET-BC, PPO RouteDemos, etc.).
- Desarrollo de entornos de simulación: integrar la política como agente de prueba en PCBWorld para validar cambios en el simulador o en las reglas de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente mapea cada fichero de pesos a su fila correspondiente en el artículo (CADET, CADET-BC, PPO RouteDemos, PPO sin TryRoute, PPO D2, PPO real), sin incluir métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 6,8 M de parámetros en FP32 el modelo ocupa aproximadamente 27 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte PyTorch; no se requiere hardware de datacenter (A100, H100) para la inferencia de la política.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos unos pocos cientos de MB de VRAM disponible, incluidas GPUs de gama baja.
- Opciones de despliegue: PyTorch nativo cargando `policy_state_dict`; requiere el entorno PCBWorld para ejecutar la política sobre observaciones válidas. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas de enrutamiento de PCB comparables publicadas con pesos abiertos ni modelos de la misma categoría con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia EXAONE 1.2-NC: uso exclusivamente de investigación y educación. El uso comercial del modelo y de su salida, incluidas las placas enrutadas con él, no está permitido.
- El código de CADET y PCBWorld tiene licencia separada; hay que consultar sus repositorios respectivos.
- No es un modelo de lenguaje: no genera texto, no responde a prompts y no tiene capacidades multilingües ni de razonamiento general.
- La política está acoplada al entorno PCBWorld y a su espacio de observación y acciones; fuera de ese simulador no es directamente utilizable.
- Riesgo de sobreajuste a los conjuntos de entrenamiento (RouteDemos, D2, D3-B ref); la generalización a topologías de tablero no vistas no está cuantificada en la información disponible.
- No se documentan sesgos, tasas de alucinación ni límites de contexto en la model card.
- Solo se publican pesos; la reproducibilidad completa depende de disponer de PCBWorld y de la configuración de entrenamiento registrada en `args`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LG-AI-Research/CADET
- Licencia: https://huggingface.co/LG-AI-Research/CADET/blob/main/LICENSE
- Repositorio PCBWorld: https://github.com/LGAI-Research/PCBWorld
