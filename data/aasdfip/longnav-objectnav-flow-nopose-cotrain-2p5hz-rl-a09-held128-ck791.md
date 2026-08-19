# Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-held128-ck791

## Resumen

El modelo `longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-held128-ck791` es un adaptador LoRA de refinamiento por aprendizaje por refuerzo (RL) sobre un modelo de visión-lenguaje-acción (VLA) para navegación robótica en entornos 3D simulados. Desarrollado por el usuario Aasdfip, este checkpoint corresponde al entrenamiento RL de una política de navegación orientada a objetos (ObjectNav) en el simulador Habitat, partiendo de un modelo base que fusiona un ajuste fino supervisado (SFT) sobre el VLM `Qwen/Qwen3-VL-2B-Instruct`. El adaptador contiene únicamente el delta de RL (~2% de la magnitud del adaptador SFT), y debe aplicarse sobre el repositorio fusionado `Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged` para obtener resultados válidos.

El modelo resuelve el problema de navegación autónoma en interiores: un agente debe desplazarse hasta un objeto objetivo (por ejemplo, una silla o un sofá) a partir de observaciones visuales y de odometría, sin inyección de pose explícita. La arquitectura combina un backbone transformer multimodal (Qwen3-VL-2B) con una cabeza de acción basada en flow matching, entrenada mediante gradiente de política flow-SDE. El checkpoint seleccionado (ck791) fue elegido por su rendimiento en una evaluación held-out durante el entrenamiento, no por convención de final de ejecución. Es relevante porque demuestra una mejora estadísticamente significativa sobre la línea base SFT en métricas de navegación, con un protocolo de evaluación riguroso y una diversidad de escenas de entrenamiento 20 veces mayor que lanzamientos anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-2B-Instruct) + cabeza de acción flow matching, con adaptador LoRA |
| Parametros totales | Aproximadamente 2B (base Qwen3-VL-2B-Instruct) + adaptador LoRA (r=128, alpha=256) |
| Parametros activos | No disponible (el adaptador LoRA es el unico componente entrenable durante RL; el head de accion esta congelado) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado en la documentacion) |
| Tipos de cuantizacion | No disponible (solo se proporcionan pesos safetensors sin cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter LoRA y head de accion) |

## Arquitectura y entrenamiento

El modelo se compone de un backbone VLM (Qwen3-VL-2B-Instruct) sobre el que se aplica un adaptador LoRA (r=128, alpha=256) que contiene el delta de RL. La cabeza de acción es un head de flow matching (`turn_vector_head.pt`) que se mantiene congelado durante el RL; los gradientes fluyen a través de ella hacia el LoRA del backbone. El entrenamiento RL utiliza el algoritmo flow-SDE policy gradient con surrogate clipped estilo PPO, operando sobre la cadena de denoising con N=3 de K=10 pasos estocásticos. La exploración se controla con un parámetro `a = 0.9`. La ventaja se calcula con REINFORCE++ y una línea base temporal kernel, con gamma 0.95 y blanqueo.

El pool de entrenamiento consiste en 128 episodios distribuidos en 80 escenas de entrenamiento HM3D, estratificados por categoría de objeto y tercil de distancia geodésica, excluyendo la categoría `plant`. Se utilizó una evaluación held-out de 26 episodios fijos (excluidos del flujo de entrenamiento) para seleccionar el checkpoint, con una pasada ODE cada 4 ciclos. El entrenamiento duró ~950 ciclos con tasa de aprendizaje 2e-6, y el checkpoint ck791 se eligió en el pico de la banda held-out (ciclos ~740–800). El pool de entrenamiento es disjunto de las escenas de validación HM3D, por lo que los resultados reportados reflejan generalización.

## Capacidades

- Navegación robótica orientada a objetos (ObjectNav) en entornos 3D simulados (HM3D, Habitat).
- Percepción visual-lingüística: interpreta observaciones RGB-D y consignas textuales del objeto objetivo.
- Generación de acciones de control continuo (velocidades lineales y angulares) a través de la cabeza de flow matching.
- Razonamiento espacial y planificación de rutas en entornos desconocidos, sin inyección de pose (modo `--no-pose-injection`).
- Adaptación por RL con gradiente de política sobre la cadena de denoising, lo que permite refinar políticas preentrenadas.
- Compatibilidad con el ecosistema de evaluación de políticas de navegación de la familia `longnav` (scripts de evaluación, formato de episodios, etc.).
- Soporte de inferencia determinista (una sola pasada ODE) o estocástica (múltiples pasos) según la configuración de despliegue.

## Casos de uso

- Evaluación de políticas de navegación en simulación: el modelo puede usarse como referencia para comparar algoritmos de ObjectNav en el benchmark HM3D, ejecutando el script `eval_objectnav_policy.py` con el checkpoint apuntando a este repositorio.
- Investigación en RL para robótica: sirve como ejemplo de aplicación de gradiente de política flow-SDE sobre un VLM, y de protocolo de selección de checkpoint con evaluación held-out.
- Desarrollo de agentes de navegación para robots domésticos: aunque entrenado en simulación, la política puede transferirse a entornos reales con adaptación adicional (sim-to-real), dado que el modelo base es un VLM generalista.
- Benchmarking de generalización entre escenas: al estar entrenado en 80 escenas y evaluado en val scenes disjuntas, permite estudiar la capacidad de generalización de políticas VLA.
- Comparación de estrategias de exploración: el modelo con exploración `a=0.9` y sin inyección de pose puede usarse para analizar el impacto de la incertidumbre en la navegación.
- Integración en pipelines de entrenamiento de robots: como punto de partida para fine-tuning adicional con otras tareas (p. ej., ImageNav, PointNav) o con diferentes distribuciones de objetos.

## Benchmarks y rendimiento

Los resultados reportados se obtuvieron sobre 400 episodios de validación HM3D (397 puntuados), con emparejamiento de semillas y sin inyección de pose en ambos brazos. La composición evaluada es exactamente la que se distribuye en este repositorio (base fusionada + adaptador), verificada como bit-igual al base de entrenamiento.

| Metrica | Este checkpoint | Linea base SFT | Delta |
|---|---|---|---|
| Oracle success | 0.733 | 0.650 | +0.083 |
| Oracle SPL | 0.483 | 0.401 | +0.082 |
| Success | 0.589 | 0.554 | +0.035 |
| SPL | 0.272 | 0.254 | +0.018 |
| Soft SPL | 0.311 | 0.291 | +0.021 |

La prueba de McNemar sobre oracle success indica una mejora significativa (57 episodios corregidos, 24 rotos, z = 3.67, p < 0.001). Frente al lanzamiento RL anterior (`-rl-a09-ck303`), este checkpoint es igual o superior en oracle success en todas las categorías de objetivo, con una ventaja nominal uniforme (oracle +0.030, p = 0.126). Las ganancias se concentran en alcanzar el objetivo (métricas oracle) más que en detenerse correctamente (success), ya que no hay head de parada ni bonus de éxito.

## Requisitos de hardware

- VRAM estimada: no especificada, pero al tratarse de un VLM de 2B parámetros con LoRA, la inferencia puede requerir entre 4 y 8 GB de VRAM en FP16 (estimación razonable, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3070/4060, A10, L4) debería poder ejecutar la inferencia; para entrenamiento RL se necesitaría mayor capacidad (A100 o similar).
- Compatibilidad con GPU de consumo: probablemente sí en cuantización FP16 o int8, aunque no se proporcionan configuraciones de cuantización.
- Opciones de despliegue: el modelo se ejecuta mediante el script de evaluación de la familia `longnav` (`eval_objectnav_policy.py`) con el backend `flow_rollout`. No se mencionan integraciones con vLLM, Ollama o TGI; el despliegue está orientado al entorno Habitat.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas VLA para ObjectNav con flow matching) dentro de la documentación proporcionada. El autor menciona un lanzamiento anterior (`-rl-a09-ck303`) con el que este checkpoint se compara favorablemente, pero no se ofrecen alternativas externas. Por tanto, la comparativa se limita a la línea base SFT y al lanzamiento RL previo, ya descritos en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo es un adaptador LoRA que solo funciona correctamente aplicado sobre el repositorio fusionado `Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged`. Aplicarlo sobre el VLM base sin fusionar produce resultados casi nulos (perturbación del 2% sobre un modelo preentrenado sin el SFT).
- La evaluación se realizó exclusivamente en simulación (HM3D, Habitat); no hay evidencia de transferencia a entornos reales.
- La política no incluye head de parada ni bonus de éxito, por lo que las métricas de éxito (no oracle) son inferiores a las de alcance. Esto puede limitar su uso en aplicaciones donde la detención precisa sea crítica.
- El rendimiento depende críticamente del orden y tamaño del conjunto de episodios de evaluación; las semillas son posicionales, y aproximadamente el 40% de los episodios cambian de resultado entre pasadas idénticas con diferente orden. Para reproducir los resultados exactos, debe usarse la lista completa de 400 episodios en el orden dado.
- El entrenamiento excluyó la categoría `plant`; el modelo puede tener menor rendimiento con ese tipo de objeto.
- La longitud de contexto y los idiomas soportados no están documentados; el modelo base Qwen3-VL-2B-Instruct tiene capacidades multilingües y de visión, pero no se garantizan para esta adaptación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo depende de Qwen3-VL-2B-Instruct (licencia Apache-2.0 también) y de los datos HM3D (con sus propias restricciones de uso).
- No se proporcionan configuraciones de cuantización ni perfiles de rendimiento para despliegue en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-held128-ck791
- Modelo base fusionado: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged
- Modelo SFT original: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz
- Lanzamiento RL anterior (ck303): https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-ck303
