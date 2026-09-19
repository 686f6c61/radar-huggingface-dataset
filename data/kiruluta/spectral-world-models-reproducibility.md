# kiruluta/Spectral-World-Models-Reproducibility

## Resumen

Spectral World Models es un prototipo de investigacion de modelos del mundo (world models) desarrollado por el usuario kiruluta y publicado en HuggingFace bajo licencia MIT. El repositorio, de 0,1 GB, no contiene un modelo de lenguaje conversacional al uso, sino un conjunto de scripts, checkpoints y documentacion de una linea de experimentos versionada (de V4 a V15.1) orientada a aprender dinamicas de sistemas fisicos con un mecanismo de transporte espectral estructurado. El objetivo cientifico es la generalizacion causal: predecir el efecto de intervenciones (acciones) sobre estados futuros, no solo reconstruir observaciones.

La pieza tecnica central es la familia de modelos `swm_structured` y `swm_structured_cf`, que combinan un mecanismo de transporte espectral (inspirado en operator learning y wavelets) con un decodificador de texto. El modelo es multimodal en el sentido de que consume imagenes de 32x32 en escala de grises y produce logits de texto mediante la API `decode_text()` con forma `[B,L,V]`, usados para la prediccion de estado tokenizado. Las versiones mas recientes anaden objetivos contrafactuales emparejados (intervenciones izquierda/derecha desde el mismo estado) para calibrar direccion y magnitud del efecto de las acciones.

Es relevante ahora como artefacto de reproducibilidad, no como modelo listo para produccion: no tiene pipeline declarado, cero descargas, cero likes y no publica cifras de parametros, contexto, cuantizacion ni benchmarks numericos. Su valor esta en la metodologia de auditoria (V10, V13, V15.1) y en la evaluacion externa sobre Gymnasium Classic Control, que permiten reproducir experimentos de generalizacion causal en regimenes fisicos cambiantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mecanismo de transporte espectral estructurado; variantes `swm_structured`, `swm_structured_cf`, `swm_selective` y baselines `no_spectral_transition` y `neural_operator` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (los horizontes de rollout evaluados son de 5, 10, 20, 30, 50 y 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; no se mencionan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modulo de texto se usa para predecir tokens de estado, no como modelo multilingue) |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoints de PyTorch; el repositorio usa `pip install -e .` y scripts en `scripts/`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo del mundo con dos vias: una entrada visual de 32x32 en escala de grises (en V14, procedente del renderizado RGB oficial de entornos de Gymnasium) y un decodificador de texto que se invoca mediante la API canonica `decode_text()` y devuelve logits `[B,L,V]` que se validan contra objetivos de token de estado discretizados con forma `[B,L]`. Sobre esa base se anade un mecanismo de transporte espectral estructurado, que es el objeto de estudio de la linea V6 en adelante: la hipotesis es que la estructura espectral preserva mejor el estado latente a largo plazo que una transicion puramente neuronal.

El entrenamiento se realiza desde cero por entorno y por semilla, sobre un simulador sintetico propio y, en V14, sobre Gymnasium Classic Control (`CartPole-v1`, `MountainCar-v0`, `Acrobot-v1`). La innovacion metodologica principal es el objetivo contrafactual emparejado introducido en V7: para un mismo estado inicial se despliegan intervenciones opuestas (izquierda/derecha) y se optimiza la alineacion direccional del efecto de la accion, la calibracion de su magnitud y la reconstruccion del punto final, con pesos por defecto de `--lambda-cf-dir 0.02`, `--lambda-cf-mag 0.005` y `--lambda-cf-branch 0.10`. Las revisiones posteriores (V8 a V15.1) congelan la receta de aprendizaje para auditar generalizacion fuera de distribucion, integridad del benchmark causal, calibracion de ganancia y simetria axial. No se documenta uso de RLHF ni DPO.

## Capacidades

- Prediccion de estado futuro en entornos de control con observaciones visuales de 32x32 en escala de grises.
- Decodificacion de estado a tokens de texto mediante `decode_text()`, con logits `[B,L,V]` validados frente a estados discretizados.
- Simulacion de contrafactuales: rollout de acciones opuestas desde el mismo estado para estimar direccion y magnitud del efecto.
- Planificacion basada en imaginacion (evaluada en V8 con `--planning-horizon 20` y `--planning-episodes 96`).
- Generalizacion a regimenes fisicos interpolados, extrapolados y con cambios estructurales fuera de distribucion (V9).
- Auditoria de simetria: rotaciones, reflexiones e intercambios x-y, con episodios de colision construidos deliberadamente (V13).
- Evaluacion en entornos externos de Gymnasium Classic Control con renderizado oficial convertido al formato de entrada del modelo (V14).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision de alta resolucion, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos de investigacion causal: clonar el repositorio, ejecutar `pip install -e .` y lanzar `scripts/run_v9_benchmark.py` con las semillas y horizontes documentados para replicar los resultados de generalizacion causal entre regimenes fisicos.
- Auditoria de benchmarks de causalidad: usar `run_v10_audit.py` para verificar si las metricas contrafactuales del propio benchmark son robustas antes de extrapolar conclusiones a otros modelos.
- Estudio de calibracion de efecto de accion: emplear `run_v12_decomposition.py` con bootstrap de 2000 remuestreos para descomponer la respuesta causal por programa de accion, horizonte, tamano de efecto y contacto con bordes.
- Analisis de equivariancia: aplicar `run_v13_axis_audit.py` con 10 semillas y 64 pares para comprobar si el modelo respeta simetrias de rotacion y reflexion, un requisito habitual en robotica y control.
- Transferencia a entornos estandar de control: entrenar desde cero sobre `CartPole-v1`, `MountainCar-v0` o `Acrobot-v1` con el pipeline de V14 y comparar con los baselines internos `neural_operator` y `no_spectral_transition`.
- Docencia y formacion en modelos del mundo: usar las notas `V4_MULTIMODAL_STABILITY.md`, `V5_HARD_DYNAMICS.md` y `V6_STRUCTURED_TRANSPORT.md` como material guiado sobre transporte espectral y estabilidad multimodal.
- Verificacion continua de regresiones: integrar `python -m pytest -q` en un pipeline de CI para validar los tests de arquitectura, estabilidad y retropropagacion del objetivo contrafactual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las metricas que el codigo calcula, pero no incluye valores numericos.

| Metrica | Estado |
|---|---|
| MMLU, HumanEval, GSM8K | no aplicables / no disponibles |
| Counterfactual direction cosine | metrica definida, valores no publicados |
| Counterfactual magnitude ratio | metrica definida, valores no publicados |
| MSE de imagen a horizonte 100 ("H100 image MSE") | metrica definida, valores no publicados |
| Text accuracy | metrica definida, valores no publicados |
| Latent cosine | metrica definida, valores no publicados |
| Resultados por semilla | se escriben en `results/v7_counterfactual_training/metrics_summary.csv` y `metrics_by_seed.csv`, no publicados en la model card |

La model card advierte explicitamente de que no debe seleccionarse un modelo a partir de una unica metrica escalar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican recuentos de parametros ni tamanos de checkpoint.
- GPU recomendadas: no disponible. Los scripts invocan `--device cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; no hay datos para confirmarlo ni descartarlo. El unico indicio es el tamano del repositorio (0,1 GB), que sugiere artefactos pequenos.
- Nota sobre terminologia: la cadena "H100 image MSE" que aparece en la documentacion se refiere con toda probabilidad al error a horizonte 100, no a la GPU NVIDIA H100; no debe interpretarse como requisito de hardware.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es la ejecucion directa de scripts de Python con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos externos. La unica comparacion documentada es interna, entre las variantes del propio proyecto.

| Modelo | Papel en la comparacion | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `swm_structured_cf` | Variante con objetivo contrafactual (V7) | no disponible | no disponible | MIT | valores no publicados |
| `swm_structured` | Control sin objetivo contrafactual | no disponible | no disponible | MIT | valores no publicados |
| `swm_selective` | Ablacion de transporte selectivo | no disponible | no disponible | MIT | valores no publicados |
| `no_spectral_transition` | Control sin transporte espectral | no disponible | no disponible | MIT | valores no publicados |
| `neural_operator` | Baseline de operator learning | no disponible | no disponible | MIT | valores no publicados |

Frente a otros modelos del mundo de la literatura (por ejemplo DreamerV3 o IRIS), no se han publicado en esta informacion parametros, contexto ni resultados que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de investigacion sin pipeline declarado, cero descargas y cero likes: no hay evidencia de uso en produccion ni de validacion por terceros.
- Ausencia total de datos de parametros, contexto, cuantizacion y benchmarks: no es posible dimensionar costes de inferencia ni comparar con alternativas.
- Entrada visual de solo 32x32 en escala de grises, lo que limita severamente la aplicabilidad a vision real de alta resolucion.
- Evaluacion restringida a un simulador sintetico propio y a tres entornos de Gymnasium Classic Control; no hay validacion en robotica real ni en dominios abiertos.
- Riesgo de alucinacion y de deriva de estado en rollouts largos: la propia linea V8 se diseno precisamente porque el buen ajuste contrafactual en distribucion no extrapolaba a fisicas cambiadas.
- El decodificador de texto predice tokens de estado discretizados; no debe esperarse calidad de generacion de lenguaje natural ni capacidades multilingues.
- La model card reconoce un error de diagnostico corregido en V15.1 (llamada directa a la capa `text_decoder` en lugar de la API `decode_text()`), lo que indica que la numeracion de versiones y los artefactos asociados deben tratarse con cautela.
- Licencia MIT, permisiva para uso comercial, pero sin garantias implicitas y sin soporte del autor.
- No debe seleccionarse una variante a partir de una sola metrica escalar, segun advierte explicitamente la documentacion.

## Enlaces

- HuggingFace: https://huggingface.co/kiruluta/Spectral-World-Models-Reproducibility
- Notas internas citadas en la model card (rutas dentro del repositorio, no enlaces publicos verificables): `V15_1_BUGFIX.md`, `V13_AXIS_SYMMETRY_EQUIVARIANCE.md`, `V12_CAUSAL_RESPONSE_DECOMPOSITION.md`, `V11_CAUSAL_GAIN_CALIBRATION.md`, `V10_COUNTERFACTUAL_INTEGRITY.md`, `V9_CAUSAL_GENERALIZATION.md`, `V8_GENERALIZATION_AND_PLANNING.md`, `V7_COUNTERFACTUAL_TRAINING.md`, `V6_STRUCTURED_TRANSPORT.md`, `V5_HARD_DYNAMICS.md`, `V4_MULTIMODAL_STABILITY.md`, `V14_EXTERNAL_CONTROL_BENCHMARK.md`
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos trataban sobre tramites administrativos turcos y no guardan relacion con el repositorio.
