# Garv98/fairdp-models

## Resumen

FairDP models es una colección de once perceptrones multicapa (MLP) pequeños de arquitectura 105 → 64 → 32 → 1, entrenados para predecir si una persona supera los 50.000 dólares de ingresos anuales a partir del censo UCI Adult (datos de 1994). Los desarrolla el usuario Garv98 como artefacto de investigación y docencia para estudiar el compromiso entre privacidad diferencial y equidad algorítmica. No es un modelo de lenguaje: es un clasificador tabular binario empaquetado en un repositorio de Hugging Face con el pipeline `tabular-classification`.

Cada una de las once variantes corresponde a una configuración de entrenamiento distinta: ERM estándar sin privacidad, Group DRO sin privacidad, DP-SGD con ε ∈ {1, 3, 8}, DP-SGD con balanceo de etiquetas y el método propio de los autores, IG-DPSGD, que introduce Group DRO interseccional dentro del bucle de DP-SGD gastando parte del mismo presupuesto de privacidad en estadísticas de grupo ruidosas. Los pesos se distribuyen en tres formatos (state_dict de PyTorch, JSON de arrays y un `engine.json` con el preprocesado exacto) para que el modelo se ejecute íntegramente en el navegador en la consola de auditoría FairDP.

La relevancia es metodológica, no de producto: sirve como banco de pruebas reproducible para medir cómo degrada el ruido de DP-SGD la precisión en el peor grupo demográfico y cómo técnicas de reponderación recuperan recall en subgrupos interseccionales (sexo × raza × edad). El autor advierte explícitamente que no debe usarse para decisiones reales sobre personas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) 105 → 64 → 32 → 1 |
| Parámetros totales | no disponible (estimable en ~9.000 a partir de las dimensiones de capa; no confirmado por el autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 105 características) |
| Tipos de cuantización | no disponible (pesos en FP32 en `state_dict` de PyTorch) |
| Idiomas soportados | no disponible (no procesa texto; entrada tabular) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), JSON de arrays (`models.json`), metadatos de preprocesado (`engine.json`) |
| Tarea | Clasificación binaria tabular (UCI Adult, ingreso > 50k) |
| Dataset de entrenamiento | UCI Adult (censo de 1994) |
| Garantía de privacidad | (ε, δ)-DP con δ = 1/n^1.1, contabilizado con accountant de Rényi-DP (solo variantes privadas) |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La red es un MLP de tres capas densas con dimensiones 105 → 64 → 32 → 1, entrenado sobre UCI Adult tras un preprocesado fijo que incluye imputación, escalado y one-hot encoding de variables categóricas; ese pipeline exacto se publica en `engine.json` junto con las definiciones de grupo. El repositorio contiene once `state_dict` independientes, cada uno correspondiente a un régimen de entrenamiento: ERM convencional, Group DRO (reponderación por grupo), DP-SGD a tres niveles de ε, DP-SGD con balanceo de etiquetas y la propuesta de los autores, IG-DPSGD.

La innovación declarada es IG-DPSGD: se integra Group DRO interseccional dentro de DP-SGD, de modo que parte del mismo presupuesto de privacidad se destina a calcular estadísticas de grupo con ruido. Todos los modelos privados cumplen (ε, δ)-DP con δ = 1/n^1.1, donde n es el tamaño del conjunto de entrenamiento, y el accountant utilizado es el de Rényi-DP. No se documentan en la información disponible el número de tokens (no aplica), la composición detallada del dataset ni si hubo etapas de ajuste adicionales más allá del propio entrenamiento diferencialmente privado.

## Capacidades

- Clasificación binaria tabular: predice ingreso anual superior o inferior a 50.000 dólares a partir de 105 características del censo UCI Adult.
- Entrenamiento con garantías formales de privacidad diferencial en tres niveles de ε (1, 3 y 8) mediante DP-SGD y accountant de Rényi-DP.
- Mitigación de sesgo por grupo: variantes con Group DRO y con balanceo de etiquetas que mejoran balanced accuracy y worst-group recall.
- Método propio IG-DPSGD con Group DRO interseccional dentro del bucle privado.
- Inferencia en navegador: los pesos en `models.json` y el preprocesado en `engine.json` permiten ejecución cliente-side sin backend.
- Auditoría de equidad por subgrupos interseccionales (sexo × raza × edad) con umbrales mínimos de 30 individuos y 10 positivos por grupo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un clasificador tabular puro.

## Casos de uso

- Docencia sobre privacidad diferencial: comparar en clase cómo varía la accuracy (85,5% en ERM frente a 84,7% con DP-SGD ε=1) al introducir ruido calibrado, usando los once checkpoints como material reproducible.
- Investigación sobre el compromiso privacidad-equidad: analizar la curva de worst-group recall (44,2% en ERM, 35,1% en DP-SGD ε=8, 66,7% en DP-SGD balanceado ε=1) para estudiar qué técnicas recuperan recall en subgrupos minoritarios.
- Auditoría interactiva en navegador: desplegar la consola FairDP en un taller o demo y ejecutar los modelos cliente-side sin infraestructura, gracias a los pesos en JSON y al `engine.json`.
- Validación de metodología de DP: reproducir el accountant de Rényi-DP y verificar el cumplimiento (ε, δ) con δ = 1/n^1.1 sobre los checkpoints publicados.
- Benchmark de técnicas de reponderación: comparar Group DRO, balanceo de etiquetas e IG-DPSGD sobre el mismo pipeline de preprocesado para aislar el efecto de cada técnica.
- Estudio de equidad interseccional: usar las definiciones de grupo de `engine.json` para medir disparidades en combinaciones sexo × raza × edad que los análisis por atributo único no detectan.
- Prueba de concepto de clasificación tabular de bajo coste: servir un MLP de ~9.000 parámetros en entornos con recursos mínimos, como ejemplo de despliegue ligero.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre UCI Adult (accuracy, balanced accuracy y worst-group recall):

| Clave | Método | ε | Accuracy | Balanced acc. | Worst-group recall |
|---|---|---|---|---|---|
| `erm__inf` | Estándar (sin privacidad) | ∞ | 85,5% | 78,4% | 44,2% |
| `groupdro__inf` | Group DRO (sin privacidad) | ∞ | 83,3% | 81,1% | 52,9% |
| `dpsgd__1` | DP-SGD | 1 | 84,7% | 74,1% | 41,2% |
| `dpsgd__3` | DP-SGD | 3 | 84,8% | 74,0% | 38,3% |
| `dpsgd__8` | DP-SGD | 8 | 84,9% | 74,0% | 35,1% |
| `dpsgd_balanced__1` | DP-SGD + balanceo de etiquetas | 1 | 79,5% | 82,4% | 66,7% |
| `dpsgd_balanced__3` | DP-SGD + balanceo de etiquetas | 3 | 80,4% | 82,8% | 66,7% |
| `dpsgd_balanced__8` | DP-SGD + balanceo de etiquetas | 8 | 80,9% | 82,8% | 66,7% |
| `ig_dpsgd__1` | IG-DPSGD (propio) | 1 | 83,8% | 79,6% | 51,8% |
| `ig_dpsgd__3` | IG-DPSGD (propio) | 3 | 83,9% | 79,9% | 57,1% |
| `ig_dpsgd__8` | IG-DPSGD (propio) | 8 | 84,1% | 80,0% | 58,9% |

El worst-group recall se define como la tasa de verdaderos positivos más baja entre los grupos de sexo × raza × edad con al menos 30 personas y 10 positivos. No se han publicado resultados de benchmarks en la información disponible más allá de esta tabla.

## Requisitos de hardware

- Inferencia en CPU: un MLP de tres capas con entrada de 105 dimensiones se ejecuta en milisegundos en cualquier CPU moderna; no requiere GPU.
- VRAM estimada: inferior a 1 MB para los pesos en FP32; irrelevante a efectos prácticos.
- GPU recomendadas: no aplica; cualquier GPU o iGPU es suficiente y no aporta ventaja medible.
- Cabe en cualquier GPU consumer y en navegador: la consola FairDP ejecuta los modelos cliente-side con los pesos en JSON.
- Opciones de despliegue: PyTorch nativo (`torch.load` del `state_dict`), motor JavaScript propio del proyecto basado en `models.json`, o cualquier runtime que consuma los arrays JSON.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo, la latencia esperada es de microsegundos a pocos milisegundos por muestra en CPU, sin datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Privacidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FairDP models (este) | MLP tabular | ~9.000 (estimado) | no aplica | DP-SGD, ε ∈ {1,3,8} | no disponible | Hugging Face + demo web |
| ERM estándar sobre UCI Adult | MLP / árboles | variable | no aplica | sin garantías | variable | amplia en literatura |
| Modelos con opacus (PyTorch) | cualquier arquitectura | variable | no aplica | DP-SGD | Apache 2.0 (opacus) | librería |
| Group DRO (Sagawa et al.) | cualquier arquitectura | variable | no aplica | sin garantías | MIT (código de referencia) | GitHub |

La comparación relevante no es con modelos de lenguaje, sino con implementaciones de DP-SGD y Group DRO de propósito general. FairDP se distingue por empaquetar once configuraciones ya entrenadas y evaluadas sobre el mismo dataset y pipeline, lo que permite comparaciones controladas; su limitación es que solo cubre UCI Adult y un MLP de juguete. No se dispone de datos de rendimiento frente a alternativas concretas más allá de la propia tabla del autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no soporta texto, visión, audio, tool calling ni agentes.
- Uso restringido a investigación y docencia; el autor prohíbe explícitamente su uso para decisiones reales sobre personas.
- UCI Adult es censo de 1994: los datos están desactualizados y contienen sesgos históricos.
- Todos los modelos incumplen la regla de las cuatro quintas partes (four-fifths rule) por sexo, según la propia model card.
- Riesgo de alucinación no aplica; el riesgo real es la extrapolación indebida a poblaciones o decisiones del mundo real.
- Licencia no especificada: no hay permiso explícito para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- El peor grupo demográfico presenta recalls bajos incluso en las mejores variantes (35,1%–66,7%), lo que refleja un fallo sustancial en subgrupos minoritarios.
- El balanceo de etiquetas mejora balanced accuracy y worst-group recall a costa de perder accuracy global (hasta ~6 puntos frente a ERM).
- El preprocesado está fijado en `engine.json`; alterar la imputación, el escalado o el one-hot invalida los pesos.
- No se documentan análisis de sensibilidad al hiperparámetro δ ni comparaciones con otros accountants distintos de Rényi-DP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Garv98/fairdp-models
- Consola de auditoría FairDP: https://fairdp-audit.vercel.app
- Código, entrenamiento y evaluación: https://github.com/Garv98/Fairness-aware-differential-private-learning-and-evaluation-of-LLMs
- Dataset de resultados: https://huggingface.co/datasets/Garv98/fairdp-results
