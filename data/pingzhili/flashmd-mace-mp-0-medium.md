# pingzhili/flashmd-mace-mp-0-medium

## Resumen

MACE-MP-0 medium es un potencial interatómico de tipo *machine learning* (MLIP) desarrollado por el grupo MACE (Batatia et al.) como parte de la familia de modelos fundacionales MACE-MP-0, publicada en el artículo "A foundation model for atomistic materials chemistry" (arXiv:2401.00096). No es un modelo de lenguaje: es una red neuronal equivariante entrenada para predecir energías y fuerzas de sistemas atómicos, lo que permite realizar simulaciones de dinámica molecular con precisión cercana a la de la teoría del funcional de la densidad (DFT) pero a un coste computacional mucho menor.

Esta ficha concreta corresponde a un repositorio de terceros (usuario `pingzhili`) que no entrena un modelo nuevo, sino que **reempaqueta** los pesos oficiales de MACE-MP-0 medium (variante MACE-MP-0a, del 2023-12-03, con 4.688.656 parámetros) en un formato neutro que la librería FlashMD puede leer sin depender de `mace-torch`, `e3nn` ni `cuEquivariance`. Los pesos entrenados son idénticos a los originales; solo cambia el formato de serialización.

El interés de este repositorio es, por tanto, de infraestructura: facilita el despliegue de MACE-MP-0 en el *stack* de FlashMD para simulaciones de dinámica molecular aceleradas. No aporta mejoras de precisión ni de capacidad predictiva respecto al modelo original, y su relevancia depende enteramente de si el usuario trabaja con FlashMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal equivariante MACE (message passing con productos tensoriales y contracciones simétricas) |
| Parametros totales | 4.688.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo opera sobre estructuras atómicas con cutoff local) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `tensors.pt` (dict plano de tensores float64, cargable con `torch.load(..., weights_only=True)`) + `config.json` |

## Arquitectura y entrenamiento

MACE es una arquitectura de redes neuronales equivariantes a rotaciones construida sobre *message passing* atómico. Cada capa combina mensajes entre átomos vecinos dentro de un radio de corte, representados en base de armónicos esféricos reales, y los procesa mediante productos tensoriales cuyos coeficientes de Clebsch-Gordan y matrices U de contracción simétrica se incluyen como constantes en el fichero `tensors.pt`. Esta construcción garantiza equivarianza E(3) y permite alcanzar precisión de DFT con pocos parámetros.

El modelo original MACE-MP-0 fue entrenado sobre el conjunto Materials Project Trajectory (MPtrj), una base de datos de trayectorias de DFT que cubre la mayor parte de la tabla periódica. La información proporcionada no detalla el número exacto de tokens, la composición del dataset ni si se aplicaron etapas de refinamiento tipo RLHF/DPO (no aplicables en este dominio). La innovación técnica relevante aquí no está en el entrenamiento, sino en el **reempaquetado**: FlashMD exporta cada constante (Clebsch-Gordan, matrices U, armónicos esféricos como coeficientes monomiales) verificándola contra los módulos oficiales antes de escribirla, y publica el SHA-256 de `tensors.pt` para garantizar la integridad de la conversión.

## Capacidades

- Predicción de energía potencial y fuerzas atómicas para sistemas de materiales en fase sólida, líquida y molecular.
- Simulación de dinámica molecular con precisión próxima a DFT y coste muy inferior.
- Cálculo de propiedades derivadas: tensiones, frecuencias vibracionales y constantes elásticas (a través de derivadas del potencial).
- Cobertura amplia de la tabla periódica gracias al entrenamiento sobre MPtrj.
- Integración nativa con FlashMD mediante `flashmd.load("mace-mp-0-medium")`.
- Ejecución sin dependencias de `mace-torch`, `e3nn` ni `cuEquivariance`.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- **Dinámica molecular acelerada con FlashMD**: cargar el modelo con `flashmd.load("mace-mp-0-medium")` y ejecutar trayectorias sobre estructuras cristalinas o amorfas, sustituyendo cálculos DFT *ab initio* en exploraciones de espacio de configuración.
- **Cribado de materiales**: evaluar la estabilidad relativa de candidatos estructurales generados por métodos generativos, usando energía y fuerzas predichas como filtro rápido antes de validación DFT.
- **Cálculo de propiedades térmicas**: obtener funciones de correlación y propiedades vibracionales a partir de trayectorias NVT/NPT generadas con el potencial, útil en estudios de conductividad térmica o estabilidad de fases.
- **Relajación de estructuras**: minimizar energías de configuraciones atómicas (defectos, superficies, interfaces) con un coste de órdenes de magnitud inferior al de DFT.
- **Prototipado en entornos sin GPU de gama alta**: al prescindir de `cuEquivariance`, el modelo puede ejecutarse en *stacks* de PyTorch estándar, lo que simplifica la integración en clústeres heterogéneos.
- **Reproducibilidad de experimentos**: el SHA-256 publicado de `tensors.pt` permite verificar que los pesos coinciden con la conversión oficial, útil en flujos de validación científica.
- **Integración en pipelines de simulación existentes**: al ser un formato neutro, se puede cargar desde herramientas propias que no quieran arrastrar la cadena de dependencias de MACE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de error (MAE de energía/fuerzas), comparativas con DFT ni cifras de *throughput*. El artículo de referencia (arXiv:2401.00096) contiene los benchmarks del modelo original MACE-MP-0, pero no se reproducen aquí.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Con 4,69 M de parámetros y pesos en float64, el modelo es muy pequeño; el cuello de botella es la memoria para las estructuras atómicas (vecinos, descriptores), no los pesos.
- **GPU recomendadas**: no disponible. Por tamaño, cualquier GPU con soporte CUDA es suficiente; el rendimiento dependerá del número de átomos simulados.
- **GPU de consumo**: previsiblemente sí cabe en cualquier GPU de consumo moderna (RTX 3060 o superior), aunque no se aporta confirmación explícita.
- **Opciones de despliegue**: FlashMD (vía `flashmd.load`), PyTorch estándar con `torch.load(..., weights_only=True)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MACE-MP-0 medium (este repo) | 4.688.656 | no aplica | MIT | Hugging Face (reempaquetado) |
| MACE-MP-0 medium original | 4.688.656 | no aplica | MIT | GitHub `ACEsuit/mace-mp` (release `mace_mp_0`) |
| Otros modelos de la familia MACE-MP-0 (small, large) | no disponible en la información | no aplica | MIT | GitHub `ACEsuit/mace-foundations` |
| Potenciales MLIP alternativos (p. ej. CHGNet, M3GNet) | no disponible en la información | no aplica | no disponible | no disponible |

La comparativa con potenciales MLIP alternativos no puede completarse con los datos proporcionados; se indica "no disponible".

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, no razona, no soporta agentes ni *tool calling*. Cualquier evaluación como LLM carece de sentido.
- **Repositorio de terceros**: no es el repositorio oficial de MACE. Aunque los pesos se verifican por SHA-256, la conversión la mantiene el usuario `pingzhili`, no el grupo MACE.
- **Precisión limitada por el tamaño**: la variante *medium* es más ligera que las variantes *large* de MACE-MP-0; para sistemas con química compleja puede ser insuficiente frente a modelos mayores.
- **Cobertura del dominio de entrenamiento**: el modelo está entrenado sobre MPtrj; su fiabilidad fuera de esa distribución (altas presiones extremas, elementos poco representados, estados excitados) no está garantizada.
- **Riesgo de extrapolación silenciosa**: como todo MLIP, puede producir predicciones plausibles pero incorrectas fuera del dominio de entrenamiento; se recomienda validación puntual con DFT.
- **Licencia MIT**: permite uso comercial y modificación, pero obliga a conservar el aviso de copyright y a citar el trabajo original (Batatia et al., arXiv:2401.00096).
- **Formato float64**: `tensors.pt` almacena tensores en doble precisión, lo que puede aumentar el uso de memoria frente a pesos en float32; no se documenta una variante en menor precisión.
- **Sin métricas publicadas**: la model card no incluye benchmarks, por lo que no es posible evaluar su rendimiento sin ejecutar validaciones propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pingzhili/flashmd-mace-mp-0-medium
- FlashMD (GitHub): https://github.com/UNITES-Lab/flash-molecular-dynamics
- Release original MACE-MP-0: https://github.com/ACEsuit/mace-mp/releases/tag/mace_mp_0
- Repositorio de modelos fundacionales MACE: https://github.com/ACEsuit/mace-foundations
- Artículo de referencia: I. Batatia et al., "A foundation model for atomistic materials chemistry", arXiv:2401.00096 — https://arxiv.org/abs/2401.00096
