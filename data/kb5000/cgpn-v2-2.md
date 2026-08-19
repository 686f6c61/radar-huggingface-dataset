# kb5000/cgpn-v2.2

## Resumen

CGPN v2.2 es una red de política basada en grafos de restricciones (constraint-graph policy network) diseñada para jugar Minesweeper en modo de solo revelado. La desarrolla el usuario kb5000 y se publica bajo licencia Apache-2.0. El modelo combina atención recurrente centrada en el límite de celdas desconocidas con un experto global de presupuesto de minas controlado por una compuerta, de modo que una corrección residual acotada no puede anular la política base cuando la compuerta está casi cerrada. Con 1.660.682 parámetros, es un modelo compacto orientado a inferencia en tiempo real dentro de un servicio de agente.

El modelo se entrena mediante aprendizaje supervisado seguido de PPO y un currículo de densidad que incluye tableros de alta densidad (25%–35% de minas). No es un modelo de lenguaje ni un transformador; es una red neuronal de grafos con código personalizado en PyTorch, integrada en el ecosistema Mineproof. Su relevancia radica en abordar el problema de decisión secuencial en Minesweeper con una arquitectura específica que incorpora razonamiento global sobre el presupuesto de minas, algo poco común en agentes de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política sobre grafos de restricciones con atención recurrente y experto global con compuerta |
| Parametros totales | 1.660.682 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de juego, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) y checkpoint PyTorch (mineproof-cgpn.pt) |

## Arquitectura y entrenamiento

La arquitectura se compone de una red base congelada que procesa el grafo de restricciones del tablero, más tres módulos entrenables: `global_budget_encoder`, `global_gate` y `global_delta_head`. El encoder global codifica el presupuesto de minas restante, la compuerta decide cuánto peso dar a la corrección global y la cabeza delta produce una corrección acotada sobre la distribución de acciones de la política base. Esta corrección residual está limitada para evitar que una compuerta casi cerrada pueda anular por completo una política base competente.

El entrenamiento combina una fase de preentrenamiento supervisado con PPO y un currículo de enfoque y estado. Las etiquetas de presupuesto global se generan offline con el auditor de Mineproof en etapas tempranas, medias y tardías del progreso del tablero. El currículo de densidad incluye tableros con 25%–35% de minas. Los resultados de prueba son solo etiquetas; ni las restricciones de prueba ni la verdad oculta de las minas se usan como entrada en inferencia. El modelo no coloca banderas ni ejecuta un solucionador simbólico; devuelve una distribución de probabilidad sobre las acciones legales de revelado.

## Capacidades

- Genera una distribución de probabilidad sobre las acciones legales de revelado en un tablero de Minesweeper.
- Procesa observaciones en formato Mineproof v2, con celdas clasificadas como abiertas, cubiertas, marcadas, bloqueadas seguras o fuera del tablero.
- Mantiene estado recurrente opcional para inferencia con memoria de sesión, controlado por `use_recurrent_state` y `stateful_policy_weight`.
- Incorpora un experto global de presupuesto de minas que mejora la decisión en tableros de alta densidad.
- Soporta integración con el servicio FastAPI de Mineproof mediante un checkpoint optimizador-libre.
- No requiere GPU; puede ejecutarse en CPU con recursos mínimos.
- No es un modelo de lenguaje ni multimodal; su única tarea es la selección de acciones en Minesweeper.

## Casos de uso

- Agente autónomo para jugar Minesweeper: el modelo puede integrarse en un servicio de agente que reciba observaciones del tablero y devuelva la acción de revelado más probable, útil para automatizar partidas o generar datos de entrenamiento.
- Investigación en aprendizaje por refuerzo: sirve como banco de pruebas para estudiar políticas con razonamiento global sobre presupuestos, comparando su comportamiento con agentes basados en solucionadores simbólicos.
- Evaluación de políticas en entornos parcialmente observables: su arquitectura con compuerta global permite analizar cómo el modelo equilibra información local y global en decisiones secuenciales.
- Generación de datos etiquetados para entrenar otros modelos: al ser un agente competente en tableros 9×9 y 16×16, puede usarse para producir trayectorias de juego que sirvan como datos de entrenamiento supervisado.
- Integración en plataformas de juegos educativos: un servicio que juegue Minesweeper en tiempo real puede demostrar técnicas de IA a estudiantes, con un modelo ligero que corre en cualquier máquina.
- Benchmarking de algoritmos de RL: su tamaño reducido y su licencia permisiva permiten reproducir experimentos y comparar métricas de rendimiento con otras arquitecturas de red neuronal de grafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) porque el modelo no es un modelo de lenguaje. La model card reporta comprobaciones de release específicas, que se resumen a continuación:

| Comprobacion | Resultado |
|---|---|
| Snapshots de simetría de presupuesto global | 48/48 seleccionan un objetivo probado como seguro |
| Replay on-policy P1 | Victoria en 34 acciones, cero adivinanzas prematuras |
| Replay on-policy P2 | Victoria en 36 acciones, cero adivinanzas prematuras |
| Pruebas de software | 31/31 superadas en el momento de la exportación |
| Parámetros compartidos con v2 base | 101/101 byte-idénticos tras el entrenamiento del experto |

Estos resultados son comprobaciones de release dirigidas, no una métrica de tasa de victoria estadísticamente representativa. El rendimiento en tamaños, densidades o distribuciones fuera del entrenamiento puede diferir.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en FP32; el modelo tiene 1,66 millones de parámetros, por lo que cabe holgadamente en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 4090 o A100 son innecesarias para este modelo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (serie GTX 10xx en adelante) puede ejecutarlo sin problemas.
- Opciones de despliegue: PyTorch nativo, servicio FastAPI de Mineproof, o integración mediante `huggingface_hub` con el cargador personalizado `mineproof_agent.hub`.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamaño del modelo se espera una latencia de milisegundos en CPU y de sub-milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (agentes de Minesweeper basados en redes neuronales de grafos con presupuesto global). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Minesweeper puede requerir adivinanzas; el modelo no garantiza una victoria en todos los tableros.
- El ejemplo incluido es sin estado; el comportamiento con estado depende de la memoria de sesión del servicio en tiempo de ejecución.
- La política se desarrolló principalmente en tableros 9×9 y 16×16; debe evaluarse antes de usarla en geometrías sustancialmente diferentes.
- `global_gate_probability` es una señal de auditoría, no una probabilidad calibrada de que el razonamiento global sea lógicamente necesario.
- Es código PyTorch personalizado, no un modelo Transformers ni un endpoint de Inference Provider de Hugging Face.
- No se han reportado sesgos específicos, pero al ser un modelo de juego, los sesgos se limitan a preferencias de acción en ciertas configuraciones de tablero.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el aviso `NOTICE` incluido en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kb5000/cgpn-v2.2
- Repositorio de código asociado (no confirmado): no disponible
- Documentación de Mineproof (proyecto relacionado): no disponible en la información proporcionada
