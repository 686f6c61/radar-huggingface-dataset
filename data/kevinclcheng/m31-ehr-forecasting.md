# kevinclcheng/m31-ehr-forecasting

## Resumen
M31 EHR forecasting es un modelo de investigación publicado por el usuario kevinclcheng en Hugging Face, orientado a la predicción de diagnósticos futuros a partir de historiales clínicos electrónicos (EHR). No es un modelo de lenguaje generativo de propósito general, sino un transformer decoder-only de escala muy reducida (1,06 millones de parámetros) entrenado específicamente para una tarea de clasificación multietiqueta: predecir cuáles de 40 condiciones clínicas se diagnosticarán por primera vez en los cinco años posteriores a una fecha ancla del paciente.

El modelo se construye sobre datos sintéticos generados con Synthea (release M31) y sigue una receta tipo nanoGPT: preentrenamiento de predicción del siguiente evento sobre la línea temporal del paciente y ajuste fino posterior con una cabeza sigmoide de 40 salidas sobre un token especial `[ANCHOR]`. La versión principal es un ensamblado por media de probabilidades de tres semillas de ajuste fino, que alcanza un AUROC macro de 0,762 y un mAP de 0,238 en validación (365 pacientes).

Su relevancia es metodológica más que de producto: documenta con rigor ablaciones de fuga de información (el año ancla, los tokens genómicos), el efecto del preentrenamiento frente a entrenamiento desde cero y el uso de anclas adicionales. El repositorio incluye todos los checkpoints del proyecto (0,2 GB) junto con el código necesario (`ehrfc`) para cargarlos, lo que lo convierte en un artefacto reproducible para investigación en pronóstico clínico con modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanoGPT (4 bloques pre-LayerNorm, 4 cabezas, anchura 128) |
| Parametros totales | 1,06 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos PyTorch en fp32 por defecto; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (opera sobre tokens clínicos, no sobre texto libre) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `torch.save` (dict con `config`, `state_dict`, `epoch`, `dev_loss`; los ajustados añaden `vocab`, `codes`, `args`) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 4 bloques con pre-LayerNorm, 4 cabezas de atención, dimensión de modelo 128, dropout 0,2 y ventana de 1.024 tokens. Se preentrena con el objetivo de predecir el siguiente evento en la línea temporal de los pacientes de entrenamiento, y después se ajusta fino con una cabeza sigmoide de 40 vías aplicada sobre el token `[ANCHOR]`. El vocabulario es de 915 tokens e incluye puntos de corte por deciles para valores de laboratorio.

El ajuste fino incorpora anclas adicionales situadas entre 1 y 3 años antes de la fecha ancla original de cada paciente de entrenamiento, lo que aumenta el número de ejemplos supervisados. El año calendario del ancla se excluye deliberadamente de la entrada en la variante principal (`noyear`), ya que en estos datos codifica principalmente supervivencia y actuaría como fuga de información; se conserva solo como ablación. El modelo principal es la media de las probabilidades predichas por tres semillas de ajuste fino. Las condiciones ya diagnosticadas antes del ancla se fuerzan a probabilidad 0. Los datos son pacientes sintéticos de Synthea (release M31): 2.512 para ajuste, 279 para parada temprana y 365 para validación (solo puntuación).

## Capacidades
- Predicción multietiqueta de 40 condiciones clínicas incidentes en una ventana de cinco años tras la fecha ancla.
- Procesamiento de líneas temporales de EHR tokenizadas (eventos clínicos y valores de laboratorio discretizados por deciles).
- Preentrenamiento de predicción del siguiente evento reutilizable como inicialización para otras tareas sobre el mismo vocabulario.
- Variantes con tokens de portador patogénico por gen (`_genomics`), no usadas en la entrega por fuga de información.
- Variantes con pérdida auxiliar de siguiente evento (`_lm<w>`) y con congelación parcial de bloques (`_frz<n>`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo multilingüe ni de generación de texto libre.

## Casos de uso
- Investigación en pronóstico clínico: servir como línea base reproducible para experimentos de predicción de incidencia de enfermedades sobre cohortes sintéticas, con código y checkpoints publicados.
- Estudio de fuga de información en datos clínicos: la ablación del año ancla y de los tokens genómicos ofrece un ejemplo documentado de cómo detectar y aislar variables que codifican supervivencia o información posterior al ancla.
- Evaluación de estrategias de preentrenamiento: comparar directamente `finetune_scratch_noyear_s0` (AUROC 0,741, mAP 0,180) frente a `finetune_pretrained_noyear_s0` (AUROC 0,761, mAP 0,208) para medir la ganancia del preentrenamiento de siguiente evento.
- Aumento de datos de supervisión mediante anclas múltiples: replicar la técnica de generar anclas 1 a 3 años antes para incrementar el número de ejemplos etiquetados por paciente.
- Docencia y prototipado de modelos clínicos: con 1,06 M de parámetros y 0,2 GB de repositorio, se puede entrenar y evaluar en CPU o en una GPU de consumo en tiempos reducidos.
- Análisis de calibración y métricas en clases desbalanceadas: el mAP bajo (0,238) frente al AUROC (0,762) lo convierte en un caso útil para estudiar el comportamiento de clasificadores multietiqueta con prevalencias muy dispares.
- Generación de cohortes sintéticas para pruebas de pipelines de datos clínicos: usar el modelo junto con Synthea para simular escenarios de predicción antes de disponer de datos reales.

## Benchmarks y rendimiento
Resultados de validación (365 pacientes) reportados en el informe técnico, ninguno usando el año ancla:

| Modelo | Checkpoints | AUROC macro | mAP |
|---|---|---|---|
| Desde cero, solo anclas oficiales (1 semilla) | `finetune_scratch_noyear_s0` | 0,741 | 0,180 |
| Preentrenado, solo anclas oficiales (1 semilla) | `finetune_pretrained_noyear_s0` | 0,761 | 0,208 |
| Preentrenado, solo anclas oficiales (3 semillas) | `finetune_pretrained_noyear_s{0,1,2}` | 0,767 | 0,219 |
| Preentrenado + anclas extra (3 semillas) | `finetune_pretrained_noyear_multianchor_s{0,1,2}` | 0,762 | 0,238 |
| Preentrenado + anclas extra + año (3 semillas) | `finetune_pretrained_multianchor_s{0,1,2}` | no disponible | 0,251 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no aborda esas tareas.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo completo ocupa unos pocos megabytes de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, GTX 1650) y también se ejecuta en CPU.
- Opciones de despliegue: carga directa con PyTorch mediante el paquete `ehrfc` del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no se aportan cifras.
- Almacenamiento: repositorio de 0,2 GB con todos los checkpoints del proyecto.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables de pronóstico clínico con los que contrastar parámetros, contexto, rendimiento o licencia. La comparación interna disponible es la del propio proyecto entre variantes (desde cero frente a preentrenado, una frente a tres semillas, con y sin anclas extra), recogida en la tabla de benchmarks.

| Criterio | M31 EHR forecasting | Alternativas comparables |
|---|---|---|
| Parámetros | 1,06 M | no disponible |
| Contexto | 1.024 tokens | no disponible |
| Tarea | Clasificación multietiqueta de 40 condiciones | no disponible |
| Licencia | no disponible | no disponible |

## Limitaciones y advertencias
- Entrenado exclusivamente con datos sintéticos de Synthea; el rendimiento sobre datos clínicos reales no está validado y probablemente no se transfiera de forma directa.
- mAP de 0,238 en validación: el rendimiento absoluto es bajo y las probabilidades por condición no deben interpretarse como riesgo clínico calibrado.
- El año ancla se excluye de la entrada porque codifica supervivencia en estos datos; incluirlo infla el mAP (0,251) por fuga de información.
- Los modelos `_genomics` presentan fuga de información de ictus en las entradas de test publicadas y no se usan en la entrega.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Los checkpoints son pickles de PyTorch y requieren `weights_only=False` al cargarse, lo que implica riesgo de ejecución de código si la fuente no es de confianza.
- Requiere el paquete `ehrfc` del repositorio de GitHub para la carga; no es compatible con librerías de inferencia estándar.
- Vocabulario cerrado de 915 tokens y 40 condiciones objetivo: no generaliza a otros códigos diagnósticos sin reentrenamiento.
- Sin información sobre sesgos demográficos, aunque al provenir de datos sintéticos los sesgos reflejan los supuestos del generador Synthea y no poblaciones reales.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto), pero sí riesgo de predicciones espurias en condiciones de baja prevalencia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kevinclcheng/m31-ehr-forecasting
- Repositorio con código, preparación de datos e informe técnico: https://github.com/kevin-apl/m31-ehr-forecasting
