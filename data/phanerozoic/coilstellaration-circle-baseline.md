# phanerozoic/coilstellaration-circle-baseline

## Resumen

`phanerozoic/coilstellaration-circle-baseline` es un artefacto ONNX publicado por el usuario phanerozoic como linea base geometrica para el benchmark Coilstellaration, orientado al diseno de bobinas de reactores de fusion de tipo stellarator. No se trata de un modelo de lenguaje ni de una red neuronal entrenada: es un grafo ONNX sin parametros entrenados que genera un conjunto de bobinas circulares planas a partir del radio mayor R0 del contorno de plasma de entrada.

El modelo resuelve una version trivial del problema del benchmark: dado un contorno de plasma y cuatro metricas de requisitos de ingenieria, devuelve `n_coils_per_half_period` bobinas circulares de radio 0,3 R0 centradas en la circunferencia del plano medio de radio R0 y repartidas uniformemente en angulo toroidal a lo largo de medio periodo de campo. Su utilidad es servir de referencia minima contra la que comparar soluciones reales de optimizacion de bobinas.

Es relevante por su papel dentro del ecosistema del benchmark Coilstellaration (asociado al dataset `proxima-fusion/coilstellaration`), no por capacidades de aprendizaje automatico. La informacion disponible sobre el modelo es muy limitada y proviene exclusivamente de su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX determinista sin parametros entrenados (transformacion geometrica) |
| Parametros totales | 0 (sin parametros entrenados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (no procede para un grafo sin pesos) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

No existe entrenamiento. El artefacto es un grafo ONNX construido con el paquete `onnx` mediante el script `make_circle_onnx.py`, que implementa una regla geometrica fija. El grafo lee el radio mayor R0 del contorno de plasma a partir del coeficiente (m = 0, n = 0) de la entrada `boundary_r_cos` y devuelve un conjunto de bobinas circulares planas de radio 0,3 R0, centradas en la circunferencia del plano medio de radio R0 y espaciadas uniformemente en angulo toroidal a lo largo de medio periodo de campo.

Cada bobina lleva la corriente que produce 1 T sobre esa circunferencia: R0 multiplicado por 5e6 A, dividido por el numero de bobinas del dispositivo completo. La forma del contorno mas alla de R0 y las metricas de requisitos (`requirement_metrics`) no influyen en el resultado. El grafo cumple el contrato ONNX del benchmark y declara la clave de metadatos `supported_tracks` con valor `fixed_shape,variable_shape`.

Interfaz de entrada y salida:

- Entradas: `boundary_r_cos` y `boundary_z_sin` (float32, `[n_pol, n_tor]`), `requirement_metrics` (float32, `[4]`), `n_field_periods` y `n_coils_per_half_period` (int64 escalares).
- Salidas: `coil_x_n`, `coil_y_n`, `coil_z_n` (float32, `[n_coils, 3]`, orden de Fourier 1 en el layout `[sin(1), const, cos(1)]` de DESC) y `currents` (float32, `[n_coils]`, en amperios).

## Capacidades

- Generacion de un conjunto de bobinas circulares planas a partir del radio mayor del contorno de plasma.
- Calculo de la corriente por bobina para alcanzar 1 T sobre la circunferencia del plano medio de radio R0.
- Soporte de las dos pistas del benchmark: forma fija (`fixed_shape`) y forma variable (`variable_shape`).
- Compatibilidad con el contrato de entrada/salida ONNX definido por el benchmark Coilstellaration.
- No realiza aprendizaje, razonamiento, generacion de texto, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Linea base de referencia en el benchmark Coilstellaration: permite establecer una cota inferior de calidad frente a la que medir la mejora de soluciones de optimizacion de bobinas reales.
- Validacion de pipelines de evaluacion: al ser un grafo ONNX determinista y sin pesos, sirve para comprobar que el arnes de evaluacion del benchmark carga correctamente entradas, salidas y metadatos.
- Pruebas de integracion del contrato ONNX: util para verificar el manejo de las entradas `boundary_r_cos`, `boundary_z_sin`, `requirement_metrics`, `n_field_periods` y `n_coils_per_half_period`, y de las salidas en el layout de Fourier de DESC.
- Docencia y divulgacion sobre geometria de stellarators: ejemplifica de forma minimalista la relacion entre radio mayor, numero de bobinas y corriente necesaria para 1 T.
- Pruebas de humo en despliegues con ONNX Runtime: su tamano nulo y su naturaleza determinista lo hacen adecuado para validar infraestructura de inferencia antes de cargar modelos reales.
- Comparacion de coste computacional: sirve como referencia de latencia minima (practicamente nula) frente a optimizadores de bobinas basados en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el repositorio ocupa 0,0 GB y el grafo no contiene pesos entrenados.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con ONNX Runtime.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime (ejemplo de la model card con `onnxruntime` y `huggingface_hub`); no se documentan otras.
- Latencia y throughput: no disponibles de forma explicita; por la naturaleza del grafo (unas pocas operaciones tensoriales) se espera latencia despreciable, aunque no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras lineas base ni soluciones comparables dentro del benchmark Coilstellaration.

## Limitaciones y advertencias

- No es un modelo entrenado: no aprende ni generaliza; implementa una regla geometrica fija.
- Ignora la forma del contorno de plasma mas alla de R0 y las cuatro metricas de requisitos, por lo que la calidad de las bobinas generadas sera baja frente a soluciones optimizadas.
- Las bobinas son circulares y planas, sin capacidad de adaptarse a la geometria real del plasma.
- No es un modelo linguistico: no soporta texto, codigo, vision, audio ni tool calling.
- No se documentan sesgos de datos porque no hay datos de entrenamiento; el riesgo de alucinacion no aplica en el sentido habitual, pero el resultado puede inducir a error si se interpreta como una solucion valida del benchmark.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las condiciones del benchmark y del dataset `proxima-fusion/coilstellaration` por separado.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phanerozoic/coilstellaration-circle-baseline
- Benchmark Coilstellaration (Space): https://huggingface.co/spaces/proxima-fusion/coilstellaration-bench
- Dataset asociado: https://huggingface.co/datasets/proxima-fusion/coilstellaration
