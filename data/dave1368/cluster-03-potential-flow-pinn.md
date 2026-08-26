# dave1368/cluster-03-potential-flow-pinn

## Resumen

El modelo `dave1368/cluster-03-potential-flow-pinn` es una red neuronal informada por la física (PINN) desarrollada por el autor dave1368 para predecir el potencial de velocidad (φ) y la función de corriente (ψ) en flujo potencial bidimensional alrededor de un cilindro rotatorio, cuya imagen bajo el mapeo conforme exacto de Joukowski corresponde a un perfil alar Joukowski, para cualquier ángulo de ataque. Forma parte del framework de orquestación de clústeres de IA científica de 9 clústeres, que combina esta red con un solucionador simbólico exacto ("Symetria") y dos auditorías de seguridad basadas en física supervisadas por LangGraph.

La arquitectura es una red feedforward de 5 capas ocultas de 128 neuronas con activación Tanh, aproximadamente 66.000 parámetros, que toma como entrada las coordenadas (x, y) y el ángulo de ataque en grados, y produce (φ, ψ). Una característica distintiva es que el término de circulación, que introduce una discontinuidad topológica en φ, se calcula analíticamente en lugar de aprenderse, lo que resuelve un problema estructural real detectado durante el entrenamiento. El modelo se validó contra fuentes clásicas (Euler, d'Alembert, Joukowski) y se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feedforward, 5 capas ocultas × 128 neuronas, activación Tanh |
| Parametros totales | ~66.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de regresión física, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión flotante estándar de PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (.pt) con diccionario que incluye `model_state_dict` y metadatos de entrenamiento |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa (MLP) con 5 capas ocultas de 128 neuronas y activación Tanh. La entrada es un vector de 3 características: coordenadas espaciales (x, y) y ángulo de ataque en grados (α). La salida son dos escalares: el potencial de velocidad φ y la función de corriente ψ. El término de circulación, que corresponde a la contribución multi-valuada del vórtice a φ — `(Γ(α)/2π)·θ` — se añade analíticamente mediante `atan2`, ya que una red feedforward suave no puede representar la discontinuidad de salto sin corromper el gradiente local cerca del corte de rama. Esta descomposición (parte suave aprendida + parte singular analítica) fue una corrección de arquitectura realizada durante el entrenamiento, no un diseño inicial.

El entrenamiento utilizó 60.000 puntos de entrenamiento y 10.000 de validación, con etiquetas exactas de la solución cerrada de flujo potencial alrededor de un cilindro rotatorio (flujo uniforme + doblete + circulación, con la circulación fijada por la condición de Kutta en el borde de salida). El dominio es `r ∈ [1, 5·R]`, `θ ∈ [-π, π]`, `α ∈ [-10°, 25°]`. Se entrenó durante 3000 épocas con pérdida MSE, alcanzando una pérdida final de entrenamiento de 3.80e-05 y de validación de 3.76e-05. El historial de entrenamiento documenta un bug real de entrada muerta (el ángulo de ataque no afectaba la salida) que se corrigió extendiendo la entrada a (x, y, α), y un problema estructural con la discontinuidad de φ que se resolvió con la descomposición analítica.

## Capacidades

- Predicción del potencial de velocidad φ y la función de corriente ψ para flujo potencial 2D alrededor de un cilindro rotatorio (pre-imagen de un perfil Joukowski) en un rango de ángulos de ataque de -10° a 25°.
- Generalización a cualquier punto del dominio espacial (r entre 1 y 5 veces el radio del cilindro) y a cualquier ángulo de ataque dentro del rango entrenado.
- Integración con un solucionador simbólico exacto (Symetria) y auditorías de física (condición de Kutta, teorema de d'Alembert) dentro del framework de orquestación.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni visión, ni capacidades multilingües.

## Casos de uso

- Diseño aerodinámico preliminar: el modelo puede estimar rápidamente el campo de flujo potencial alrededor de perfiles Joukowski para diferentes ángulos de ataque, permitiendo explorar configuraciones sin ejecutar simulaciones CFD completas. Su bajo coste computacional lo hace adecuado para barridos paramétricos.
- Validación cruzada de soluciones analíticas: al comparar las predicciones con el solucionador exacto Symetria, se puede verificar la consistencia de implementaciones numéricas de flujo potencial en entornos educativos o de investigación.
- Enseñanza de dinámica de fluidos: el modelo sirve como herramienta interactiva para visualizar cómo varía el flujo alrededor de un cilindro con el ángulo de ataque, ilustrando conceptos como la condición de Kutta y la paradoja de d'Alembert.
- Componente de un pipeline de simulación híbrida: dentro del framework de orquestación, la red actúa como un sustituto rápido del solucionador exacto para etapas intermedias donde se requiere velocidad, mientras que el solucionador simbólico se reserva para validación final.
- Detección de errores en orquestadores de simulación: la validación contra d'Alembert permitió descubrir un bug en el cálculo de la fuerza de arrastre en el orquestador (rotación de fuerzas al marco alineado con el flujo), demostrando su utilidad como auditor de consistencia física.
- Benchmarking de técnicas PINN: el modelo documenta un caso real de corrección arquitectónica (descomposición analítica de términos singulares) que puede servir como referencia para otros desarrollos de PINNs en problemas con discontinuidades topológicas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar tipo MMLU o HumanEval, pero sí una tabla de validación contra fuentes clásicas. Se reproduce a continuación:

| Check | Resultado |
|---|---|
| Mapeo exacto de Joukowski (1910) | El solucionador exacto coincide con recomputación independiente hasta precisión de coma flotante |
| Autoconsistencia de la condición de Kutta | v_θ ≈ 0 (precisión numérica) en el borde de salida, α ∈ [−10°, 25°] |
| Arrastre de d'Alembert (1752), solución exacta (alineado con flujo) | ≈ 0 en cada ángulo probado |
| Arrastre de d'Alembert (1752), esta red (alineado con flujo) | 0.13–0.35 en α ∈ [−10°, 25°] |
| φ, ψ puntuales vs. exacto (grid de 32 puntos, α=0°/15°) | Error medio \|err\|: φ=1.06, ψ=1.23 (magnitudes de campo ~20–115) |
| Euler/Laplace ∇²φ (r ≥ 1.5, lejos del cuerpo) | Pequeño relativo a la escala del gradiente de velocidad local |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene aproximadamente 66.000 parámetros, lo que implica un tamaño de checkpoint del orden de unos pocos cientos de kilobytes (no se especifica el tamaño exacto del archivo).
- Inferencia posible en cualquier CPU moderna sin GPU; el coste computacional es despreciable (una pasada forward de un MLP de 5×128).
- Cabe en cualquier GPU de consumo (por ejemplo, RTX 3060 o inferior) y también en hardware embebido.
- Opciones de despliegue: al ser un checkpoint PyTorch estándar, puede cargarse con `torch.load` y ejecutarse en cualquier entorno con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son específicas para modelos de lenguaje.
- Latencia y throughput: no se proporcionan datos, pero por el tamaño del modelo se espera una latencia del orden de microsegundos por inferencia en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (PINNs para flujo potencial con mapeo de Joukowski). La model card no menciona alternativas ni benchmarks comparativos. Se indica "no disponible".

## Limitaciones y advertencias

- La precisión puntual se degrada cerca de la superficie del perfil (r ≈ R), especialmente en el punto de estancamiento, donde la curvatura del campo es más pronunciada.
- El flujo potencial invíscido no puede representar capas límite, separación ni pérdida (stall) por construcción, tal como establece la paradoja de d'Alembert.
- La auditoría de d'Alembert aguas abajo del modelo es casi vacua para una red gravemente subentrenada (gradientes casi nulos también la superan trivialmente); su valor real es detectar inconsistencias graves, no evaluar la calidad del entrenamiento.
- El checkpoint se carga con `weights_only=False` porque es un diccionario con metadatos, no un tensor plano; el autor advierte que solo debe hacerse con checkpoints de fuentes fiables.
- No se especifican sesgos conocidos más allá de las limitaciones físicas inherentes al modelo de flujo potencial.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo es de nicho y su aplicabilidad fuera del dominio de flujo potencial es nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dave1368/cluster-03-potential-flow-pinn
- Space interactivo (demo): https://huggingface.co/spaces/dave1368/cluster-03-potential-flow
- Framework de orquestación (referenciado en la model card): https://huggingface.co/spaces/dave1368/cluster-03-potential-flow (mismo enlace, incluye el README con tablas de validación)
