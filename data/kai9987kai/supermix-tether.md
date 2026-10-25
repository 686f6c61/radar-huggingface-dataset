# Kai9987kai/Supermix-Tether

## Resumen

Supermix Tether es un artefacto de investigación publicado por el usuario Kai9987kai en Hugging Face. No es un modelo de lenguaje: se trata de un receptor compacto de **2.762 parámetros** (versión `v1`) y **2.786 parámetros** (versión `v2`) que se entrena sobre un banco de tres clasificadores de dígitos congelados (MLP de anchos ocultos 32, 48 y 64, con ReLU, tanh y GELU respectivamente). Su objetivo es medir si un receptor puede mantener respuestas correctas cuando una mayoría de sus especialistas visuales está corrupta en zero-shot, usando para ello "forense de conocimiento oscuro" (_dark-knowledge forensics_) e invariancia localizada por perturbación.

El problema que aborda es concreto: dado un tensor de probabilidades `[batch, 3 fuentes, 3 expertos, 10 clases]`, el receptor debe enrutar fuentes, ponderar la fiabilidad de cada experto y aplicar una transformación de tarea (identidad, sucesor módulo diez o `9 - dígito`) sin dejarse arrastrar por especialistas dañados. El autor compara el receptor dual `tether` con controles de aprendizaje supervisado ordinario (`passive`), _donor dropout_ (`dropout`), una intervención de estilo IIT (`iit`), ablaciones de pérdida única (`effect_only`, `invariance_only`) y un control de emparejamiento mecanístico desplazado por filas (`unpaired`), a lo largo de dos estudios de confirmación con ocho semillas cada uno (`v0.1` en `outputs/confirmation` y `v0.2` en `outputs/v2-confirmation`).

Su relevancia es metodológica, no de producto: la versión `v0.2` reporta **97,75%** de precisión zero-shot con 2 de 3 especialistas corruptos (`damage_two`), y la `v0.3` añade una compuerta de confianza epistémica con abstenciones seguras, atribución causal input×gradiente y exportación a ONNX. Todo el entrenamiento e inferencia caben en CPU, sin GPU ni acceso a red tras instalar dependencias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Receptor compacto entrenado sobre tres clasificadores MLP congelados (anchos ocultos 32, 48 y 64; activaciones ReLU, tanh y GELU). La topología interna del receptor no se detalla en la model card: no disponible |
| Parámetros totales | 2.762 (`v1`) / 2.786 (`v2`) en el receptor; el banco de especialistas está congelado y su recuento de parámetros no se publica |
| Longitud de contexto | No aplica: la entrada es un tensor de forma fija `[batch, 3 fuentes, 3 expertos, 10 clases]`, sin tokenizador ni ventana de contexto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible: no procesa texto |
| Licencia | No disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | Checkpoints PyTorch (`seed-101-tether.pt` y equivalentes por semilla y brazo) y exportación a ONNX verificada numéricamente con `atol=1e-5` |
| Tarea | Clasificación de dígitos (10 clases) bajo tres transformaciones: identidad, sucesor módulo 10 y `9 - dígito` |
| Entrada | Tres imágenes por tarea, evaluadas por los tres especialistas |
| Condiciones de evaluación | `factual`, `relevant`, `irrelevant`, `damaged` (1/3), `damage_two` (2/3), `erased`, `context_shift` |
| Runtime | Python 3.12+, PyTorch en CPU, dos hilos por defecto |
| Servidor local | `python -m tether serve <dir> --port 8797` en `127.0.0.1` |

## Arquitectura y entrenamiento

La arquitectura es un sistema en dos niveles. En el nivel inferior hay tres especialistas visuales heterogéneos y congelados que comparten imágenes y linaje de entrenamiento (el propio autor advierte que los nueve vectores de probabilidad no constituyen nueve fuentes independientes de evidencia). En el nivel superior, el receptor consume ese tensor de probabilidades y debe aprender tres cosas a la vez: enrutamiento de fuentes, ponderación de fiabilidad por experto y aplicación de la transformación de tarea. Una señal de contexto correlacionada ofrece un atajo fácil durante la fase de adquisición, lo que convierte el diseño en una prueba deliberada de robustez frente a señales espurias.

El entrenamiento se organiza en protocolos congelados y reproducibles (`docs/frozen-protocol.json` para `v1`, `docs/v2-protocol.json` para `v2`), con estudios de ocho semillas (`101..108` en `v0.2`). La `v0.1` utiliza coincidencia de residuos L2 a nivel de probabilidad de salida y consenso mayoritario entre expertos; la `v0.2` sustituye ambas piezas por fiabilidad intrínseca de especialista basada en entropía de cola del _runner-up_, `H(p_{-1})/log 9`, y dispersión, junto con covarianza contrafactual e invariancia localizada por perturbación. La `v0.3` añade una compuerta de confianza epistémica con umbral `θ = 0.10` sobre `τ = max_e (1 - H(p_{s,e,-1})/log 9)^+`, mapas de saliencia causales `A_{s,e} = Σ_c P_{s,e,c} · |∂ẑ/∂P_{s,e,c}|` y exportación ONNX con verificación estricta en ONNX Runtime. Los datos de imagen provienen del conjunto de dígitos empaquetado con scikit-learn (8×8, 10 clases), por lo que no se requiere descarga de _datasets_ externos.

## Capacidades

- Clasificación de dígitos de 8×8 bajo tres transformaciones de tarea: identidad, sucesor módulo 10 y complemento a nueve.
- Enrutamiento de fuentes y ponderación de fiabilidad por experto sobre un tensor `[batch, 3, 3, 10]`.
- Detección zero-shot de corrupción mayoritaria de especialistas: 97,75% de precisión en `damage_two` (2 de 3 expertos corruptos).
- Forense de "conocimiento oscuro": estimación de fiabilidad a partir de la entropía de cola del _runner-up_ (`H(p_{-1})/log 9`) y de la dispersión entre especialistas.
- Abstención selectiva (_selective prediction_) mediante compuerta de confianza epistémica: salida `-1` cuando `τ` supera el umbral, con AUROC = 1,0000 en el escenario `damage_common` (3 de 3 especialistas corruptos).
- Atribución causal mecanicista por saliencia input×gradiente, que expone qué probabilidad de qué especialista contribuye a la decisión.
- Exportación multiplataforma a ONNX de receptor y banco de donantes, con verificación numérica a `atol=1e-5`.
- Servidor local con _playground_ interactivo: lienzo de dibujo 8×8, presets de dígitos reales, simulador de manipulación adversarial, indicador de confianza epistémica en tiempo real y barras de atribución causal.
- Reproducción estricta de estudios: `python -m tether replay <dir> --strict` y entrenamiento de estudios nuevos con `python -m tether study --protocol v2 --seeds ... --steps ...`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso agéntico, capacidades multilingües, visión general, audio ni matemáticas simbólicas.

## Casos de uso

- Investigación en robustez ante fallos correlacionados: el modelo sirve como banco de pruebas reproducible para medir cuánto degrada un receptor cuando una mayoría de sus sensores o especialistas está corrupta, con condiciones etiquetadas (`damaged` 1/3, `damage_two` 2/3, `erased`, `context_shift`) y comparación contra cinco controles distintos.
- Laboratorio de ML en portátil sin GPU: `python -m tether study --protocol v2 --output outputs/dev-run --seeds 11,12 --steps 400` permite lanzar un estudio completo con dos hilos de CPU y sin claves de API ni acceso a red, lo que encaja en docencia práctica o entornos air-gapped.
- Diseño de abstención selectiva en pipelines de clasificación: la compuerta `τ` con umbral `θ = 0.10` ofrece una política concreta de rechazo (salida `-1`) que se puede calibrar sobre datos intactos y evaluar sobre datos manipulados, con 0% de falsos rechazos reportados en entradas intactas y parcialmente dañadas.
- Auditoría y forense de sistemas multi-experto: el cálculo de entropía de cola por especialista permite identificar qué miembro del conjunto está siendo suplantado, en lugar de limitarse a detectar que "algo va mal" a nivel de consenso agregado.
- Depuración de sistemas con mezcla de expertos productivos: los mapas de saliencia input×gradiente identifican qué rutas (fuente × experto) sostienen la decisión final, útil para detectar atajos aprendidos antes de desplegar arquitecturas de _ensemble_ o _mixture-of-experts_.
- Simulación y formación en seguridad de ML: el simulador de manipulación del _playground_ permite demostrar en vivo cómo colapsa el consenso entre expertos (hasta el 1,39% bajo `damage_two` en `v0.1`) y cómo la invariancia localizada recupera el rendimiento.
- Integración en aplicaciones C++/C#/Rust vía ONNX Runtime: la exportación verificada a `atol=1e-5` permite incrustar receptor y banco de donantes en _runtimes_ sin PyTorch, con un coste de memoria despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, porque el modelo no es un modelo de lenguaje. Los datos disponibles son métricas internas del estudio:

| Estudio | Condición | `tether` | `iit` | `unpaired` | Referencia |
|---|---|---|---|---|---|
| v0.2 (semillas 101..108) | `damage_two` (2 de 3 corruptos) | 97,75% | 80,76% | 11,18% | Diferencia vs `iit`: +16,99 pp (IC 95% [+12,43 pp, +21,44 pp]), positiva en 8/8 semillas; vs `unpaired`: +86,57 pp |
| v0.2 (semillas 101..108) | `heldout_independent` | 98,19% | no disponible | 94,04% | +4,15 pp vs `unpaired`; iguala el techo del oráculo frozen-donor (98,19%) |
| v0.1 (`outputs/confirmation`) | Coincidencia de residuos L2 | −0,07 pp vs `iit` | referencia | −0,10 pp vs `unpaired` | Hallazgo negativo declarado: cancelación de sesgo compartido |
| v0.1 (`outputs/confirmation`) | Consenso entre expertos bajo `damage_two` | colapso a 1,39% | no disponible | no disponible | Motiva el rediseño de la `v0.2` |
| v0.3 | `damage_common` (3 de 3 corruptos) | AUROC = 1,0000 | no disponible | no disponible | Con `θ = 0,10`: 100% de abstenciones en fallos catastróficos, 0% de falsos rechazos en entradas intactas y parcialmente dañadas |

## Requisitos de hardware

- VRAM estimada: no aplica. El receptor tiene 2.786 parámetros, muy por debajo de 1 MB en FP32; la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna. La model card indica explícitamente que no se necesita GPU, checkpoint remoto, clave de API ni acceso a red tras instalar dependencias.
- Compatibilidad con GPU de consumo: irrelevante por tamaño; cualquier CPU moderna es suficiente.
- Configuración de referencia: Python 3.12 o superior, PyTorch en versión CPU, dos hilos de entrenamiento por defecto.
- Opciones de despliegue: paquete `tether` instalable con `pip install -e ".[dev,export]"`; exportación a ONNX para ONNX Runtime; servidor local con `python -m tether serve <dir> --port 8797` en `127.0.0.1`; reproducción de estudios con `python -m tether replay <dir> --strict`.
- Latencia y throughput: no disponible. La model card indica que el tiempo de ejecución depende de la máquina y la configuración y que no se promete ninguna estimación de tiempo de entrenamiento.
- Almacenamiento: el repositorio en Hugging Face declara 0,0 GB, por lo que el espacio en disco de los checkpoints concretos no queda confirmado en la información disponible.

## Comparativa con modelos similares

No se identifican en la información proporcionada modelos públicos comparables de la misma categoría (receptores de muy bajo parámetro sobre especialistas congelados para robustez ante corrupción). La comparación disponible es interna, entre los brazos del propio estudio:

| Brazo / referencia | Parámetros | Contexto | `damage_two` | `heldout_independent` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `tether` (v0.2) | 2.786 | no aplica | 97,75% | 98,19% | no disponible | Checkpoints por semilla en Hugging Face |
| `iit` (control de intervención estilo IIT) | no disponible | no aplica | 80,76% | no disponible | no disponible | Mismo repositorio |
| `unpaired` (emparejamiento mecanístico desplazado por filas) | no disponible | no aplica | 11,18% | 94,04% | no disponible | Mismo repositorio |
| Oráculo frozen-donor (techo) | no aplica | no aplica | no disponible | 98,19% | no disponible | Mismo repositorio |
| `passive`, `dropout`, `effect_only`, `invariance_only` | no disponible | no aplica | no disponible en la información proporcionada | no disponible | no disponible | Mismo repositorio |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no tiene tokenizador, ni ventana de contexto, ni soporte de tool calling o agentes. Cualquier uso en esos términos es un error de categoría.
- Escala de juguete: 2.786 parámetros y dígitos de 8×8 procedentes del conjunto empaquetado con scikit-learn. Los resultados no son extrapolables a visión natural, a especialistas de gran tamaño ni a dominios abiertos.
- Los especialistas comparten imágenes y linaje de entrenamiento, según advierte el propio autor; los nueve vectores de probabilidad no son nueve fuentes independientes de evidencia, lo que limita la interpretación de los pesos de fiabilidad.
- Evidencia estadística acotada: ocho semillas (`101..108`) en el estudio principal y un único autor. El documento `docs/paper.md` es interno del repositorio; no consta revisión por pares en la información disponible.
- Hallazgo negativo declarado en `v0.1`: la coincidencia ingenua de residuos L2 no mejora a los controles (−0,07 pp vs `iit`, −0,10 pp vs `unpaired`) por cancelación de sesgo compartido, y el consenso entre expertos colapsa al 1,39% bajo `damage_two`. Los resultados positivos dependen de la reformulación de la `v0.2`, no del diseño original.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución de los checkpoints. Es un riesgo legal directo en producción.
- Repositorio con 0 descargas, 0 _likes_ y 0,0 GB declarados: no se confirma en la información disponible que los checkpoints por semilla y brazo estén efectivamente subidos.
- Riesgo de confianza espuria: la compuerta de abstención se valida con AUROC = 1,0000 en `damage_common`, un escenario de corrupción total y presumiblemente separable. El comportamiento fuera de ese régimen (corrupción parcial, cambios de distribución no contemplados en `context_shift`) no está cuantificado en la información disponible.
- El _playground_ no entrena desde el navegador: solo reproduce inferencia sobre ejemplos de evaluación congelados.
- Sesgos: no documentados en la información disponible. El conjunto de dígitos de scikit-learn tiene cobertura y variabilidad limitadas (10 clases, resolución 8×8), lo que restringe cualquier conclusión sobre sesgo demográfico o de dominio.
- El identificador `arxiv:2112.02505` aparece en las etiquetas del repositorio, pero la model card no detalla su relación con el método; no debe citarse como aval del trabajo sin verificarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/Supermix-Tether
- Protocolo congelado v0.1: https://huggingface.co/Kai9987kai/Supermix-Tether/blob/main/docs/frozen-protocol.json
- Protocolo congelado v0.2: https://huggingface.co/Kai9987kai/Supermix-Tether/blob/main/docs/v2-protocol.json
- Resultados completos y tablas: https://huggingface.co/Kai9987kai/Supermix-Tether/blob/main/docs/results.md
- Paper interno: https://huggingface.co/Kai9987kai/Supermix-Tether/blob/main/docs/paper.md
- Estudio v0.1: `outputs/confirmation` (dentro del repositorio)
- Estudio v0.2: `outputs/v2-confirmation` (dentro del repositorio)
- Identificador arXiv presente en las etiquetas del repositorio: https://arxiv.org/abs/2112.02505
- _Playground_ local (tras `python -m tether serve`): http://127.0.0.1:8797
