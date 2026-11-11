# bryocad/BryoCAD-Small-ATAC-Mpolymorpha-Ctrl-LoRA

## Resumen

BryoCAD-Small-ATAC-Mpolymorpha-Ctrl-LoRA es un adaptador LoRA de tipo PEFT publicado por el proyecto bryocad para predicción binaria de accesibilidad de cromatina en el genoma de la hepática *Marchantia polymorpha*. No es un modelo fundacional autónomo: requiere el backbone BryoCAD-Small (un modelo de ADN basado en arquitectura Mamba2, según las dependencias de inferencia indicadas en la model card) junto con su implementación de clasificación de secuencias y la cabeza de clasificación entrenada.

El adaptador se ha afinado sobre ventanas de 512 pb derivadas de picos ATAC-seq en condición control del conjunto GSE290177, usando el genoma de referencia MpTak v6. Corresponde al checkpoint final de 4.000 pasos de optimizador del estudio BryoCAD, no a un checkpoint seleccionado por validación. Su relevancia es acotada pero específica: ofrece un artefacto reproducible para transferencia de predicción de accesibilidad en briófitos, un grupo con escasa representación en modelos genómicos existentes.

La ficha se elabora exclusivamente a partir de la información publicada en el repositorio de Hugging Face y en la model card. No se dispone de datos de benchmarks numéricos, licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre backbone BryoCAD-Small (dependencias de inferencia: PyTorch, Transformers, PEFT, Mamba2, CUDA); implementación de clasificación de secuencias |
| Parametros totales | no disponible (adaptador LoRA; el backbone se distribuye por separado) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 pb (longitud de secuencia de entrada fija para inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias de ADN, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`), configuración PEFT (`adapter_config.json`) |

Parámetros del adaptador LoRA según la model card: rank 8, alpha 32, dropout 0,1, aplicado a las proyecciones `x_proj`, `in_proj` y `out_proj`.

## Arquitectura y entrenamiento

El adaptador modifica el backbone BryoCAD-Small mediante LoRA en tres proyecciones internas (`x_proj`, `in_proj`, `out_proj`), con rank 8 y alpha 32. El backbone emplea componentes Mamba2 según las dependencias de inferencia declaradas, y se utiliza a través de una implementación de clasificación de secuencias con dos etiquetas (0 = negativo, 1 = positivo) y una cabeza `score` incluida en los pesos del adaptador.

Los datos de entrenamiento proceden de picos ATAC-seq en condición control de *M. polymorpha* (GSE290177) sobre el genoma MpTak v6. Los ejemplos positivos son ventanas de 512 pb centradas en los summits de los picos; los negativos son ventanas genómicas no solapantes de 512 pb en cromosomas y scaffolds con picos anotados, excluyendo cualquier ventana que solape un pico. Se descartaron ventanas fuera de los límites de la referencia o con bases ambiguas. No se aplicó emparejamiento por GC ni balanceo de clases. Los cromosomas 7 y 8 se reservaron para validación.

| Split | Ventanas positivas | Ventanas negativas |
|---|---:|---:|
| Entrenamiento | 32.186 | 265.052 |
| Validación | 8.858 | 62.228 |

La función de pérdida fue entropía cruzada de dos clases sin ponderar. Se evaluó el checkpoint final (4.000 pasos), no el mejor por validación. La evaluación de transferencia se realizó sin fine-tuning adicional sobre ATAC-seq de estrés térmico de *M. polymorpha* (GSE290177, restringido a cromosomas 7 y 8) y sobre DNase-seq de *Arabidopsis thaliana* en control y estrés térmico (GSE145742), usando AUROC y F1. No se aplicó optimización del umbral de decisión: se asigna la clase con mayor probabilidad predicha.

## Capacidades

- Predicción binaria de accesibilidad de cromatina a partir de secuencias de ADN de 512 pb.
- Puntuación de accesibilidad: la probabilidad softmax de la clase positiva se usa como score continuo.
- Clasificación directa sin optimización de umbral (clase de mayor probabilidad).
- Transferencia cero-shot a datos de estrés térmico en *M. polymorpha* y a DNase-seq de *A. thaliana* (control y estrés), según la evaluación del estudio.
- Entrada de secuencia con el tokenizador de BryoCAD-Small sin tokens especiales, padding/truncado a 512.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un modelo de clasificación de secuencias genómicas.

## Casos de uso

- Anotación de regiones accesibles en *M. polymorpha*: puntuar ventanas genómicas de 512 pb para priorizar candidatos a regiones regulatorias donde no hay datos ATAC-seq disponibles, usando el score de la clase positiva como ranking.
- Priorización de experimentos ATAC-seq: seleccionar regiones genómicas con alta probabilidad de accesibilidad para diseñar paneles de validación experimental, reduciendo el espacio de búsqueda frente a un barrido completo del genoma.
- Transferencia a condiciones de estrés: aplicar el adaptador a datos de estrés térmico de la misma especie para comparar scores sin reentrenamiento, tal como se evaluó en el estudio (restringido a cromosomas 7 y 8 para validación honesta).
- Estudios comparativos entre especies: usar el adaptador como línea base para evaluar transferencia a *A. thaliana* (DNase-seq), midiendo degradación de AUROC/F1 y decidiendo si conviene un fine-tuning específico.
- Filtrado de ventanas negativas en pipelines de entrenamiento: emplear los scores para descartar ventanas etiquetadas como negativas que el modelo considera altamente accesibles, mejorando la calidad de conjuntos de entrenamiento posteriores.
- Reproducibilidad de estudios genómicos: servir como checkpoint de referencia del estudio BryoCAD para replicar resultados, registrando los SHAs del backbone y del adaptador y las versiones de software, tal como recomienda la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que la evaluación de transferencia usó AUROC y F1 sobre ATAC-seq de estrés térmico de *M. polymorpha* (GSE290177, cromosomas 7 y 8) y DNase-seq de *A. thaliana* (GSE145742), pero no incluye los valores obtenidos.

## Requisitos de hardware

- VRAM estimada: no disponible. El adaptador LoRA es de tamaño reducido (repo de 0,0 GB), pero la inferencia requiere cargar el backbone BryoCAD-Small completo, cuyos requisitos no se especifican en la información disponible.
- GPU recomendadas: no disponible; la model card solo indica entorno CUDA.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: inferencia vía PyTorch + Transformers + PEFT + Mamba2, con `trust_remote_code=True` y `AutoModelForSequenceClassification`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BryoCAD-Small-ATAC-Mpolymorpha-Ctrl-LoRA | Adaptador LoRA sobre BryoCAD-Small (Mamba2) | 512 pb | Clasificación binaria de accesibilidad (ATAC-seq, *M. polymorpha*) | no disponible | Hugging Face (bryocad) |
| BryoCAD-Small (backbone) | Modelo fundacional de ADN | no disponible | Representaciones de ADN; base para clasificación | no disponible | Hugging Face (bryocad) |
| PlantCAD2 | Modelo genómico de plantas (citado como base del trabajo) | no disponible | Tareas genómicas en plantas | no disponible | no disponible en la información |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con una sola especie (*M. polymorpha*) y una sola condición experimental (control). El rendimiento en otras especies o condiciones debe evaluarse de forma independiente.
- Las predicciones son scores de accesibilidad basados en secuencia, no medidas directas de accesibilidad en un tejido o muestra concreta.
- Fuerte desbalance de clases en entrenamiento (32.186 positivos frente a 265.052 negativos) sin balanceo ni emparejamiento por GC; esto condiciona la interpretación de métricas y scores.
- Se usó el checkpoint final (4.000 pasos) en lugar del mejor por validación, lo que puede no ser óptimo para todas las aplicaciones.
- No se aplicó optimización del umbral de decisión; el umbral implícito es 0,5 sobre la probabilidad softmax.
- Licencia no declarada: no se puede confirmar el uso comercial. Verificar antes de cualquier despliegue en producción.
- Requiere `trust_remote_code=True` y código personalizado del backbone; la model card recomienda revisar el código antes de usarlo.
- Puede aparecer una cabeza de clasificación recién inicializada al cargar el backbone; la cabeza entrenada se restaura al cargar el adaptador. Pesos faltantes inesperados en la cabeza deben investigarse.
- Para reproducibilidad, registrar los SHAs de commit del backbone y del adaptador, y las versiones de software; validar el checkpoint publicado contra el original en las mismas entradas y ajustes.
- El ejemplo de inferencia con secuencia sintética es solo una prueba de humo, no una validación biológica.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/bryocad/BryoCAD-Small-ATAC-Mpolymorpha-Ctrl-LoRA
- Backbone BryoCAD-Small: https://huggingface.co/bryocad/BryoCAD-Small
- Dataset ATAC-seq de *M. polymorpha* (GSE290177): https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE290177
- Dataset DNase-seq de *A. thaliana* (GSE145742): https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE145742
- Paper, blog o repositorio del estudio BryoCAD: no disponible en la información proporcionada
- Demos: no disponible
