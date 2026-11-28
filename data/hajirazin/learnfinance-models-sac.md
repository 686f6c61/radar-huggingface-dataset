# hajirazin/learnfinance-models-sac

## Resumen

LearnFinance SAC Model es un conjunto de artefactos de aprendizaje por refuerzo para la asignación de carteras de inversión (portfolio allocation), publicado por el usuario hajirazin bajo el identificador `hajirazin/learnfinance-models-sac`. No se trata de un modelo de lenguaje, sino de un agente SAC (Soft Actor-Critic) que emite asignaciones de pesos sobre un universo de 15 acciones más un activo de efectivo (CASH), distribuido en 30 slots de acciones con atención enmascarada. La versión documentada es `v2026-11-27_879504e8`, entrenada sobre una ventana que abarca desde el 1 de enero de 2018 hasta el 27 de noviembre de 2026.

El repositorio contiene los pesos del actor (política gaussiana), las dos redes críticas Q y sus copias objetivo, el coeficiente de temperatura de entropía (`log_alpha`), el escalador de estados de cartera, el orden de símbolos, metadatos de arquitectura y un fichero auxiliar con parámetros de un modelo oculto de Markov (HMM) y estado de corte causal. El tamaño del repositorio es de 0,0 GB, lo que sugiere artefactos muy ligeros, coherentes con una red de política de pequeña dimensión.

Su relevancia es acotada y de nicho: se publica como componente de un sistema mayor denominado LearnFinance, con una API de almacenamiento propia (`brain_api.storage.sac`), y las métricas declaradas por el autor muestran un rendimiento fuera de muestra negativo (Sharpe de evaluación de -0,5755 y CAGR de evaluación de -0,1251). No dispone de licencia declarada, idiomas especificados ni pipeline de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAC v3 con atención enmascarada, 30 slots de acciones más CASH (actor gaussiano, doble crítico Q, crítico objetivo, temperatura de entropía) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de entrenamiento temporal 2018-01-01 a 2026-11-27) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`actor.pt`, `critic.pt`, `critic_target.pt`, `log_alpha.pt`), más `scaler.pkl`, `symbol_order.json`, `metadata.json` y `sac_v3_auxiliary.json` |

## Arquitectura y entrenamiento

El modelo es un agente de aprendizaje por refuerzo basado en Soft Actor-Critic en su variante v3, con un mecanismo de atención enmascarada sobre 30 slots de acciones y un slot adicional para efectivo. La política es una red gaussiana (`actor.pt`) que produce asignaciones de cartera; el aprendizaje utiliza dos redes Q (`critic.pt`), sus copias objetivo (`critic_target.pt`) y un coeficiente de temperatura de entropía aprendido (`log_alpha.pt`), lo que corresponde al esquema estándar de SAC con ajuste automático de entropía. El estado se normaliza mediante un `PortfolioScaler` serializado en `scaler.pkl`.

El entrenamiento cubre el periodo comprendido entre el 1 de enero de 2018 y el 27 de noviembre de 2026 sobre un universo de 15 símbolos. El fichero auxiliar `sac_v3_auxiliary.json` incluye parámetros y etiquetas de un modelo oculto de Markov, un escalador y un estado de corte causal con la cola de mercado, lo que sugiere que las señales de entrada incorporan pronósticos o regímenes derivados de un modelo PatchTST, tal como indica la etiqueta `patchtst-forecasts`. No se documentan en la información disponible el número de pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de ajuste adicionales.

## Capacidades

- Asignación de cartera: genera pesos de inversión sobre 15 acciones y efectivo mediante una política gaussiana condicionada al estado de la cartera.
- Gestión de 30 slots de acciones con atención enmascarada, lo que permite manejar un universo variable dentro de una estructura fija.
- Normalización de estados de cartera mediante `PortfolioScaler`, integrada en el flujo de inferencia.
- Incorporación de señales auxiliares basadas en HMM y pronósticos tipo PatchTST para la construcción del estado.
- Serialización completa del agente (actor, críticos, objetivo, temperatura) para reanudar entrenamiento o realizar inferencia.
- Integración con el ecosistema LearnFinance mediante `SACHuggingFaceModelStorage` y `SACHalalFilteredModelStorage`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a finanzas: el repositorio sirve como referencia reproducible de un agente SAC con atención enmascarada sobre slots de acciones, útil para comparar variantes de arquitectura en experimentos académicos.
- Backtesting de políticas de asignación: los artefactos permiten cargar el agente y evaluar su comportamiento sobre series históricas propias, comparando con las métricas declaradas por el autor.
- Integración en el pipeline LearnFinance: mediante `SACHuggingFaceModelStorage` se puede descargar una versión concreta y encadenarla con el resto de componentes del sistema (HMM, pronósticos PatchTST, escaladores).
- Estudio de regímenes de mercado: el fichero `sac_v3_auxiliary.json` con parámetros HMM y etiquetas permite analizar cómo la política reacciona a cambios de régimen detectados por el modelo oculto de Markov.
- Docencia y prototipado: al ser un conjunto de artefactos ligeros (0,0 GB), es adecuado para demostraciones en cursos de finanzas cuantitativas o de RL, siempre advirtiendo del rendimiento fuera de muestra negativo.
- Reentrenamiento y ajuste fino: la presencia de actor, críticos, objetivo y `log_alpha` permite continuar el entrenamiento sobre datos propios o modificar la función de recompensa.
- Filtrado halal: la clase `SACHalalFilteredModelStorage` sugiere un uso previsto en carteras con restricciones de cumplimiento halal, si bien no se detalla el mecanismo de filtrado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Actor Loss | 0,18427160382270813 |
| Critic Loss | 0,28795790672302246 |
| Avg Episode Return | 0,256090354759743 |
| Avg Episode Sharpe | 0,15013229354827584 |
| Eval Sharpe | -0,5755453855379096 |
| Eval CAGR | -0,12512706118770933 |
| Eval Max Drawdown | 0,2347112357288005 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un modelo de lenguaje. Las métricas anteriores son las declaradas por el autor en la model card y corresponden a pérdidas de entrenamiento y a métricas de evaluación financiera.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que indica artefactos de muy baja huella, probablemente inferiores a unos pocos cientos de MB.
- GPU recomendadas: no disponible; por el tamaño descrito, cualquier GPU con soporte CUDA, e incluso CPU, debería ser suficiente para la inferencia del actor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: la model card solo documenta el uso mediante `SACHuggingFaceModelStorage` y `SACHalalFilteredModelStorage` del paquete `brain_api`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (agentes SAC para asignación de carteras) ni datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Rendimiento fuera de muestra negativo: el Sharpe de evaluación es -0,5755 y el CAGR de evaluación es -0,1251, lo que indica que la política no generaliza favorablemente en el periodo de evaluación declarado.
- Drawdown máximo de evaluación del 23,47 %, relevante para cualquier uso en producción.
- Ausencia de licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; debe contactarse con el autor antes de cualquier uso productivo.
- Universo limitado a 15 símbolos y 30 slots, sin documentación sobre cómo se seleccionaron ni sobre su sesgo sectorial o geográfico.
- Ventana de entrenamiento que se extiende hasta noviembre de 2026, lo que plantea dudas sobre la naturaleza de los datos empleados y su disponibilidad real; conviene verificar la procedencia antes de reutilizarlos.
- Sin información sobre sesgos, alucinaciones (no aplica a un modelo generativo) ni limitaciones idiomáticas.
- Dependencia de un paquete propietario o específico (`brain_api`) para la carga, lo que puede dificultar la reproducibilidad fuera de ese ecosistema.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni emplearse para tareas de generación de texto.
- Los ficheros `.pt` y `.pkl` requieren precaución al deserializarse; conviene cargarlos únicamente desde fuentes de confianza.

## Enlaces

- Hugging Face: https://huggingface.co/hajirazin/learnfinance-models-sac
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
