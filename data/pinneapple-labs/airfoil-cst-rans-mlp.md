# PINNeAPPle-Labs/airfoil-cst-rans-mlp

## Resumen

`airfoil_cst_rans_mlp` es un modelo surrogate de PINNeAPPle-Labs para aerodinámica 2D. No es un modelo de lenguaje: es un ensemble de cinco MLP que asigna a seis pesos CST de un perfil alar y al ángulo de ataque los coeficientes de sustentación, resistencia y momento de cabeceo (Cl, Cd, Cm) de una solución RANS estacionaria, incompresible y completamente turbulenta a Re = 4e6.

El modelo sustituye una campaña CFD de alto coste por una regresión tabular de 7 entradas documentadas y 3 salidas, con 98.895 parámetros en total. Su interés está en el prediseño y la optimización de formas: permite evaluar miles de geometrías dentro de un rango acotado con un coste muy inferior al de OpenFOAM, y devuelve una banda de incertidumbre a partir de la dispersión del ensemble.

Está publicado con licencia Apache-2.0, incluye pesos en safetensors y ONNX, y se acompaña de una demo en Hugging Face Spaces. Su validez es estricta: geometrías CST de segundo orden, alpha entre -2 y 14 grados, flujo incompresible, Re = 4e6 y régimen desde adherido hasta separación leve; no cubre pérdida profunda.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLPEnsemble: 5 MLP de 8 -> 96 -> 96 -> 96 -> 3, activación SiLU, bootstrap |
| Parámetros totales | 98.895 (19.779 por MLP) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (regresión tabular; sin contexto secuencial) |
| Tipos de cuantización | no disponible; no se documentan cuantizaciones; se distribuyen safetensors y ONNX |
| Idiomas soportados | no aplica (modelo numérico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |
| Tarea | regresión tabular (7 entradas documentadas -> 3 salidas) |
| Entradas | T0, T1, T2, M0, M1, M2, alpha_deg; la arquitectura declara `in_dim=8` sin documentar la octava entrada |
| Salidas | Cl, Cd, Cm |
| Régimen de referencia | RANS 2D estacionario, incompresible, k-omega SST, Re = 4e6 |
| Pipeline declarado | tabular-regression |

## Arquitectura y entrenamiento

La topología es un ensemble de cinco perceptrones multicapa con capas de 8 -> 96 -> 96 -> 96 -> 3, activación SiLU y entrenamiento bootstrap. Cada MLP tiene 19.779 parámetros; el conjunto suma 98.895. Las salidas se entrenan como Cl, log Cd y Cm, y la dispersión entre los cinco miembros se utiliza como estimación de incertidumbre. No hay atención, SSM, decodificación especulativa ni componentes generativos: es una regresión tabular de baja dimensión.

Los datos provienen de una campaña RANS 2D estacionaria e incompresible con OpenFOAM v1912 simpleFoam y k-omega SST, Re = 4e6. La geometría se parametriza con CST de Bernstein de segundo orden, con `upper = M + T`, `lower = M - T` y un espesor de borde de salida del 0,25 % de la cuerda. La campaña citada comprende 436 ejecuciones; el split se hizo por forma (seed 3, 15 % de formas LHS reservadas). No se documenta el número exacto de muestras de entrenamiento ni el recuento de tokens (no aplica). No hay RLHF ni DPO; el ajuste es supervisado contra el solver.

La model card declara `in_dim: 8`, pero la tabla de entradas solo enumera siete variables. No se explica cuál es la octava entrada, por lo que conviene verificar el preprocesado exacto antes de integrar el modelo en producción.

## Capacidades

- Predicción de Cl, Cd y Cm para perfiles CST dentro de los rangos de validez declarados.
- Cuantificación de incertidumbre mediante la dispersión de los cinco MLP del ensemble.
- Evaluación por lotes de barridos paramétricos y estudios de sensibilidad sobre formas CST.
- Exportación a ONNX y uso desde PyTorch o la librería PINNeAPPle.
- Integración en pipelines CAE como filtro rápido antes de lanzar simulaciones RANS de alta fidelidad.
- No genera texto, no hace tool calling, no soporta agentes, no tiene modo thinking, visión, audio ni capacidades multilingües.
- No sustituye a un solver RANS ni a XFOIL fuera de su dominio: no modela flujo compresible, 3D, transitorio ni pérdida profunda.
- La demo del zoo muestra las predicciones con su banda de incertidumbre y avisos de física; no es una capa de validación adicional del modelo.

## Casos de uso

- Prediseño de perfiles aerodinámicos: permite barrer miles de combinaciones de pesos CST y ángulos de ataque para obtener Cl, Cd y Cm y preseleccionar candidatos antes de ejecutar CFD. Es adecuado por su bajo coste computacional y sus tres salidas directas, siempre dentro de los rangos de validez.
- Optimización de forma asistida por surrogate: se puede usar como función objetivo rápida en un bucle de optimización con restricciones sobre T0-T2, M0-M2 y alpha. La banda del ensemble permite descartar soluciones con alta dispersión o fuera de dominio.
- Análisis de sensibilidad: evaluación sistemática de la respuesta de Cl, Cd y Cm al variar los pesos de espesor, los pesos de curvatura y el ángulo de ataque, útil para identificar regiones de diseño y tendencias.
- Control de calidad en pipelines CAE: marcar entradas fuera de rango, alta dispersión del ensemble o regímenes no válidos antes de lanzar OpenFOAM; el modelo es barato y puede actuar como filtro previo.
- Comparación rápida de formas NACA y CST: estimación de coeficientes para documentación interna, comparación de familias de perfiles y generación de tablas preliminares, sin valor de certificación.
- Docencia y demos interactivas: la demo de Hugging Face permite probar entradas en el navegador, visualizar la banda de incertidumbre y entender la relación entre geometría CST y coeficientes aerodinámicos.
- Exploración de espacios de diseño en MDO de secciones 2D: integración como modelo de orden reducido para estudios exploratorios de una sección alar, no para el diseño completo de un ala 3D.

## Benchmarks y rendimiento

Los datos de la model card son validación aerodinámica, no benchmarks de IA general. MMLU, HumanEval y GSM8K no aplican. Menor es mejor. Valores redondeados a partir de la model card.

| Métrica | test (n=60) | naca_reference (n=36) | xfoil_naca2412 (n=9) |
|---|---:|---:|---:|
| Cl MAE | 0,002847664 | 0,003231396 | 0,010092481 |
| Cl max abs | 0,019326576 | 0,028683418 | 0,020171094 |
| Cd MAE | 0,0000911598 | 0,0001351138 | 0,0002812856 |
| Cd max abs | 0,001110440 | 0,001372908 | 0,000906135 |
| Cd MAPE (%) | 0,544746 | 0,615632 | 2,812721 |
| Cd P90 (%) | 1,035362 | 1,137301 | 6,872440 |
| Cm MAE | 0,000453944 | 0,000222427 | 0,000980024 |
| Cm max abs | 0,002545108 | 0,001969652 | 0,001237098 |
| n | 60 | 36 | 9 |

La validación de referencia usa 60 ejecuciones OpenFOAM en 15 formas no vistas y 36 ejecuciones NACA 0012/2412/4412/4415 excluidas del entrenamiento. El solver está verificado con un estudio de tres mallas en NACA 2412 a alpha 4°: GCI de Cd del 1,9 %, orden observado 2,4 y Cl dentro del 0,02 %. Frente a XFOIL 6.99 tripped, las diferencias son Cl -2,3 % y Cd +4,5 %. La pendiente de sustentación es 0,110/° frente a 0,110/° de teoría de ala delgada. En el caso NASA TMR NACA 0012 SST, Cd es 0,00812 frente a 0,0081.

El estado de confianza declarado es APPROVED, con score 1.00 y cobertura del 100 %. La validación física se marca como `warn: data finite (missing values documented)`: 19 de 20 comprobaciones aplicables pasan, con nivel `standard`. Los factores `code_verification`, `robustness` y `applicability` quedan en 0; `input_pedigree` y `uncertainty` quedan en 2.

## Requisitos de hardware

- VRAM estimada: no hay requisitos oficiales. Con 98.895 parámetros, los pesos ocupan aproximadamente 0,40 MB en fp32 y 0,20 MB en fp16; el runtime añade una sobrecarga no cuantificada.
- GPU recomendadas: no se especifican. Cualquier GPU consumer con soporte para PyTorch u ONNX Runtime es suficiente; para inferencia por lotes, una CPU también es válida.
- Cabe en GPU consumer: sí, en cualquier GPU moderna; el modelo es varios órdenes de magnitud menor que un modelo de lenguaje.
- Opciones de despliegue: PyTorch, ONNX Runtime y la librería PINNeAPPle. No aplican vLLM, llama.cpp, Ollama ni TGI para este modelo tabular.
- Latencia y throughput: no se publican cifras medidas. Para un MLP de este tamaño, el coste dominante será el preprocesado, la validación de rangos y la orquestación, no el producto matricial.

## Comparativa con modelos similares

No se conocen otros surrogates MLP comparables en la información proporcionada. Se comparan alternativas de simulación del mismo dominio.

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| `airfoil_cst_rans_mlp` | Surrogate MLP ensemble | 98.895 | no aplica | Cl MAE 0,00285; Cd MAE 9,12e-5; Cm MAE 4,54e-4 en test | Apache-2.0 | Hugging Face y demo |
| XFOIL 6.99 | Solver de panel con corrección viscosa | no aplica | no aplica | En NACA 2412: Cl -2,3 % y Cd +4,5 % frente al solver RANS de referencia | no disponible en la información | Herramienta externa |
| OpenFOAM v1912 simpleFoam, k-omega SST | CFD RANS 2D | no aplica | no aplica | Referencia de alta fidelidad; GCI de Cd 1,9 % en el estudio de mallas | no disponible en la información | Código abierto, requiere instalación |

## Limitaciones y advertencias

- Dominio de validez estrecho: T0 en [0,1; 0,24], T1 en [0,08; 0,22], T2 en [0,08; 0,22], M0 en [-0,03; 0,08], M1 en [-0,02; 0,14], M2 en [-0,04; 0,12] y alpha en [-2; 14] grados.
- Solo es válido para Re = 4e6, flujo incompresible, 2D, estacionario y la familia geométrica CST declarada. No cubre otros números de Reynolds, flujo compresible, 3D, transitorio ni otras parametrizaciones.
- La pérdida profunda queda excluida del entrenamiento: el régimen cubre desde flujo adherido hasta separación leve.
- La resistencia a alta sustentación se lee aproximadamente un 14 % alta en la malla de campaña de 20k celdas frente a mallas más finas o XFOIL. El surrogate hereda el sesgo del solver; no lo corrige.
- La precisión declarada es frente al mismo solver y la misma malla que generaron los datos. El error del solver frente a datos experimentales es el término dominante y no se corrige con este modelo.
- La arquitectura declara `in_dim=8`, pero solo se documentan siete entradas. Es una inconsistencia que debe verificarse antes de producción.
- La validación física tiene avisos: 19 de 20 comprobaciones aplicables; `code_verification`, `robustness` y `applicability` no tienen evidencia; `input_pedigree` y `uncertainty` pasan con avisos.
- No es un modelo de lenguaje: no genera texto, no razona de forma simbólica, no tiene tool calling, agentes, capacidades multilingües, visión ni audio.
- Puede producir predicciones plausibles fuera de rango sin detectar la extrapolación de forma fiable; la dispersión del ensemble es una señal útil, no una garantía.
- La licencia Apache-2.0 permite uso comercial con las obligaciones de la licencia, pero no ofrece garantías. No debe usarse para certificación aerodinámica sin validación propia contra el solver o datos experimentales.
- La model card marca `inference: false`; no está pensada para la Inference API estándar de Hugging Face y requiere un runtime propio.
- No se documenta el número exacto de muestras de entrenamiento ni la composición completa del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PINNeAPPle-Labs/airfoil-cst-rans-mlp
- Dataset de entrenamiento: https://huggingface.co/datasets/PINNeAPPle-Labs/airfoil-rans-cst-re4e6
- Repositorio PINNeAPPle: https://github.com/PINNeAPPle-Labs/PINNeAPPle
- Demo del zoo: https://huggingface.co/spaces/PINNeAPPle-Labs/zoo-demo
- Paper: no disponible en la información proporcionada.
