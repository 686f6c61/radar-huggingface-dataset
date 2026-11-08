# braindecode/bbl-pretrained

## Resumen

BBL (pretrained, CamCAN) es el codificador MEG del modelo presentado en el artículo *The Brain's Bitter Lesson: Scaling Speech Decoding With Self-Supervised Learning* (Jayalath et al., ICML 2025), convertido al ecosistema de braindecode. Se trata de un modelo fundacional auto-supervisado para magnetoencefalografía (MEG) que aprende representaciones generales de la actividad cerebral y que, según sus autores, permite escalar la decodificación de habla a partir de señales cerebrales. El checkpoint publicado aquí contiene únicamente el codificador preentrenado, sin la cabeza lineal de clasificación, y está pensado para fine-tuning o linear probing.

El modelo tiene 41.351.330 parámetros y opera sobre ventanas de 0,5 segundos (125 muestras a 250 Hz) con hasta 306 canales MEG en el orden de los sensores Elekta del dataset CamCAN. La arquitectura emplea tareas pretexto de banda, fase y amplitud para el preentrenamiento auto-supervisado, y se integra en braindecode 2.1 a través de la clase `braindecode.models.BBL` (PR #1553).

Es relevante ahora porque representa uno de los primeros modelos fundacionales de MEG disponibles en un formato interoperable con una librería estándar de decodificación neurofisiológica, con licencia MIT y verificación numérica estricta frente al checkpoint original de los autores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador transformer con proyección por posición de sensor, embedding de sujeto y tareas pretexto auto-supervisadas (banda, fase, amplitud); implementado como `braindecode.models.BBL` |
| Parámetros totales | 41.351.330 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana fija de entrada de 125 muestras, 0,5 s a 250 Hz) |
| Tipos de cuantización | no disponible (pesos en float32; safetensors y pytorch_model.bin) |
| Idiomas soportados | no disponible (modelo de señales MEG, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) y `pytorch_model.bin` |

## Arquitectura y entrenamiento

El modelo es un codificador para MEG con dimensión de modelo de 512 (`model_dim=512`), dimensión de proyección de 1024 (`projector_dim=1024`), dimensión de embedding de sujeto de 16 (`subject_embedding_dim=16`) y dimensión de entrada de 306 canales (`input_dim=306`). La entrada se proyecta por posición de sensor (los inputs con menos de 306 canales se rellenan con ceros hasta 306) y se combina con un embedding de sujeto indexado por la fila `d * 1024 + s`. El preentrenamiento es auto-supervisado con tres tareas pretexto simultáneas: banda (band), fase (phase) y amplitud (amp), sobre el dataset CamCAN.

El checkpoint original es un `Pretrainer` de PyTorch Lightning 2.5.0.post0 (`camcan_preproc_full_cont-best-epoch=02-val_loss=1.26.ckpt`, época 2, paso global 60507). El preprocesado de referencia aplica un filtro paso banda de 0,1-125 Hz con notch a 50 y 100 Hz, remuestreo a 250 Hz, ventanas de 0,5 s (125 muestras), escalado por canal con mediana y rango intercuartílico ajustados sobre su registro, recorte a `[-5, 5]` y resta de la media de los primeros 0,5 s. La conversión a braindecode renombra las claves `backbone.*` (incluyendo la normalización de pesos `weight_g`/`weight_v` a `parametrizations.weight.original0/1`), descarta el proyector SSL, los clasificadores pretexto y el estado de Lightning/optimizador, y rellena el buffer `trained_subjects` con las filas de sujeto actualizadas por el optimizador (583 filas de CamCAN). Los valores de los tensores se copian sin cambios y la verificación numérica frente al `Backbone` original da una diferencia máxima absoluta de 0,0 en features, logits, pérdida, gradientes de entrada y gradientes de los 55 parámetros del backbone con 306 sensores.

## Capacidades

- Extracción de representaciones (features) de ventanas MEG de 0,5 s: `model(x, return_features=True)["features"]` devuelve un vector de 528 dimensiones por ventana.
- Clasificación binaria mediante cabeza lineal (`n_outputs=2` por defecto en `config.json`), sustituible pasando `n_outputs` a `from_pretrained`.
- Fine-tuning supervisado y linear probing sobre las features extraídas.
- Manejo de entradas con menos de 306 canales mediante relleno con ceros hasta 306 (verificado con 204 sensores).
- Fallback de sujeto medio cuando no se proporciona `subject_index`, usando las 583 filas de sujeto entrenadas de CamCAN.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de señales neurofisiológicas, no de texto.

## Casos de uso

- Decodificación de habla a partir de MEG: el modelo sirve como codificador base para tareas de reconstrucción o clasificación de estímulos lingüísticos, aprovechando el preentrenamiento auto-supervisado sobre CamCAN descrito en el artículo.
- Investigación en interfaces cerebro-computador (BCI): extracción de features de 528 dimensiones por ventana de 0,5 s para alimentar clasificadores ligeros en tiempo casi real, dado el bajo coste computacional del codificador.
- Linear probing en nuevos datasets MEG: congelar el codificador y entrenar solo una regresión logística sobre las features, útil para comparar la calidad de las representaciones entre cohortes.
- Transfer learning a datasets con menos sensores: el relleno con ceros hasta 306 canales permite aplicar el modelo a montajes reducidos (verificado con 204 sensores) y hacer fine-tuning con los datos disponibles.
- Análisis de dinámica cerebral por sujeto: el embedding de sujeto de 16 dimensiones y el fallback de sujeto medio permiten modelar variabilidad interindividual en estudios longitudinales.
- Reproducibilidad de resultados del artículo: al estar los pesos verificados numéricamente frente al checkpoint original, sirve para replicar los experimentos de Jayalath et al. dentro del ecosistema braindecode.
- Prototipado de pipelines de decodificación: integración con el resto de utilidades de braindecode (fetchers, preprocesado, augmentations) para construir flujos completos de EEG/ECoG/MEG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la verificación de equivalencia numérica frente al checkpoint original (diferencia máxima absoluta de 0,0 en features, logits, pérdida y gradientes con 306 sensores; 3,7e-8 en las 16 features del embedding de sujeto en el fallback de sujeto medio).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 41,35 M de parámetros; en float32 ocupa aproximadamente 165 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; para fine-tuning a gran escala se recomiendan A100 o H100, aunque una RTX 4090 o incluso una RTX 3060 bastan para inferencia y fine-tuning de la cabeza.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: al ser un modelo de braindecode/PyTorch, se carga con `BBL.from_pretrained` y se ejecuta con PyTorch estándar; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BBL (pretrained, CamCAN) | 41,35 M | 125 muestras (0,5 s a 250 Hz), 306 canales | MEG | MIT | Hugging Face (braindecode/bbl-pretrained) |
| Otros modelos de braindecode (65+ arquitecturas publicadas) | no disponible | variable según arquitectura | EEG, ECoG, MEG | variable según modelo | braindecode |
| Alternativas de modelo fundacional MEG | no disponible | no disponible | MEG | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La cabeza lineal (`final_layer`, `n_outputs=2`) no forma parte del release: es la inicialización por defecto de PyTorch bajo `torch.manual_seed(0)`. Es obligatorio hacer fine-tuning o linear probing antes de usar el modelo para predicción.
- El modelo está preentrenado solo con sujetos de CamCAN (583 filas de sujeto); su generalización a otras cohortes o montajes requiere validación empírica.
- La entrada debe seguir estrictamente el preprocesado de los autores (filtro 0,1-125 Hz con notches a 50 y 100 Hz, remuestreo a 250 Hz, ventanas de 0,5 s, escalado por mediana e IQR, recorte a `[-5, 5]`, resta de la media de los primeros 0,5 s); `forward` solo aplica el relleno con ceros.
- El modelo asume 306 canales en el orden FIF de los sensores Elekta de CamCAN; el relleno con ceros para montajes reducidos puede degradar las representaciones.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües.
- La licencia MIT sigue al repositorio que distribuye el checkpoint; los pesos originales se distribuyen a través del README del repositorio de los autores (Google Drive) sin una licencia de pesos separada, y esta copia se re-aloja sin modificar en forma convertida con atribución a los autores.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje; el riesgo relevante es la generalización limitada fuera de la distribución de CamCAN y la posible amplificación de sesgos presentes en los datos de entrenamiento.
- Uso comercial: permitido por la licencia MIT, pero sin garantías y con la advertencia de que los autores o titulares de derechos pueden solicitar la retirada de esta copia abriendo un issue en el repositorio de braindecode.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/bbl-pretrained
- Documentación de la clase BBL en braindecode: https://braindecode.org/stable/generated/braindecode.models.BBL.html
- PR de braindecode #1553: https://github.com/braindecode/braindecode/pull/1553
- Repositorio de braindecode: https://github.com/braindecode/braindecode
- Web de braindecode: https://braindecode.org/dev/index.html
- Paper (arXiv): https://arxiv.org/abs/2406.04328
- Código de los autores: https://github.com/neural-processing-lab/the-brains-bitter-lesson/tree/3965a2be11677d9c2b9cecb88109a0af6bf19d1c
- Licencia del código de los autores: https://github.com/neural-processing-lab/the-brains-bitter-lesson/blob/main/LICENSE
- Checkpoint original (Google Drive, file id `1cYdKDYoIupjoMfq5cEWgB-W74XhztWEw`): no disponible como URL directa en la información proporcionada
