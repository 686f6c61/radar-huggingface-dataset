# MHkhan50/ptbxl-ecg-resnet

## Resumen

PTB-XL ECG ResNet es una red residual 1D compacta (aproximadamente 0,19 M de parámetros) desarrollada por Muzammal Hussain (MHkhan50) para clasificar electrocardiogramas de 12 derivaciones, 10 segundos y muestreados a 100 Hz en las cinco superclases diagnósticas del dataset PTB-XL: NORM (ECG normal), MI (infarto de miocardio), STTC (alteración del segmento ST/onda T), CD (trastorno de conducción) e HYP (hipertrofia). El modelo resuelve un problema de clasificación multi-etiqueta sobre señal biomédica, no de generación de texto: recibe un tensor de forma (12, 1000) en milivoltios y devuelve cinco probabilidades independientes.

La relevancia del modelo reside en su tamaño extremadamente reducido y en el enfoque de predicción selectiva: incorpora un umbral de confianza (0,8) por debajo del cual el modelo se abstiene y deriva el registro a revisión experta. Según la model card, con ese umbral etiqueta el 84,5 % de los registros del fold de test. El checkpoint publicado corresponde a la semilla 23, seleccionada por tener la menor pérdida de validación (0,2662) entre cinco semillas entrenadas.

Se distribuye como checkpoint de PyTorch junto con la definición de la red y un fichero de configuración con el orden de derivaciones, la normalización por derivación y los umbrales por etiqueta. Está marcado explícitamente como *research use only* y no constituye un dispositivo médico. La licencia de los pesos es CC BY 4.0, heredada de PTB-XL, mientras que el código del repositorio asociado es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual 1D (ResNet) sobre señal ECG de 12 derivaciones; canales (32, 64, 128), dropout 0,2 |
| Parametros totales | ~0,19 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 12 x 1000 muestras (10 s a 100 Hz) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo sobre señal, no texto) |
| Licencia | CC BY 4.0 (pesos); código MIT |
| Formato de pesos | PyTorch `.pt` (diccionario con `model_state_dict`, `model_name`, `config`, `labels`); `config.json`; `model.py` |

## Arquitectura y entrenamiento

La red es un ResNet 1D con tres etapas de canales (32, 64, 128) y dropout de 0,2, que procesa directamente la señal de 12 derivaciones x 1000 muestras y produce 5 logits, uno por superclase, con activación sigmoide para clasificación multi-etiqueta. La entrada debe normalizarse por derivación con la media y desviación típica en mV almacenadas en `config.json`, y las derivaciones deben respetar el orden indicado en `cfg["input"]["leads"]`; un orden incorrecto o unidades distintas alteran silenciosamente la salida.

El entrenamiento usa PTB-XL 1.0.3 (Wagner et al., 2020) a 100 Hz, restringido a los 21.388 registros con al menos una superclase diagnóstica. Se emplean los folds oficiales por paciente: folds 1-8 para entrenamiento (17.084 registros), fold 9 para validación (2.146) y fold 10 para test (2.158), sin solapamiento de pacientes entre particiones. El procedimiento es AdamW con learning rate 1e-3, weight decay 1e-4, batch de 32, entropía cruzada binaria y early stopping sobre la pérdida de validación (paciencia 5, máximo 40 épocas; esta semilla paró en la época 14). Los umbrales por etiqueta se eligen en validación y se congelan. El entrenamiento se ejecutó en una GPU T4 de Kaggle. Se entrenaron cinco semillas (17, 23, 31, 47, 59) y se publica la 23 por tener la menor pérdida de validación, no por resultados de test.

## Capacidades

- Clasificación multi-etiqueta de ECG de 12 derivaciones en las cinco superclases de PTB-XL (NORM, MI, STTC, CD, HYP), con probabilidades independientes por etiqueta.
- Predicción selectiva: regla de abstención basada en un umbral de confianza de 0,8; por debajo, el registro se reserva para revisión experta.
- Umbrales por etiqueta precalculados en validación y almacenados en `config.json`, listos para uso directo.
- Inferencia determinista y extremadamente ligera (~0,19 M de parámetros), apta para ejecución en CPU o GPU de gama baja.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión ni audio; es un clasificador de señal puro.
- No cubre etiquetas de ritmo ni enunciados finos: solo las cinco superclases diagnósticas.

## Casos de uso

- Investigación en clasificación de ECG: reproducción de resultados sobre el fold 10 de PTB-XL con el checkpoint publicado y el código del repositorio, útil como línea base ligera en estudios comparativos de arquitecturas.
- *Benchmarking* de arquitecturas de señal: al tener ~0,19 M de parámetros y métricas publicadas con intervalos de confianza bootstrap, sirve como referencia de bajo coste frente a CNN 1D y modelos mayores.
- Prototipado de pipelines de predicción selectiva: la regla de abstención al 0,8 permite experimentar con flujos de derivación a revisión experta sin entrenar desde cero.
- Docencia y demostraciones: el *Space* "ECG Superclass Check" permite ilustrar clasificación multi-etiqueta sobre señal biomédica con un modelo que cabe en cualquier equipo.
- Preetiquetado de datasets de ECG para curación: el modelo puede generar etiquetas preliminares sobre registros PTB-XL a 100 Hz que luego se revisan manualmente, nunca como decisión clínica.
- Validación de infraestructura de inferencia: por su tamaño mínimo, es adecuado para probar *deployments* de PyTorch en entornos con recursos muy limitados (CPU, dispositivos *edge*), siempre en contexto de investigación.

## Benchmarks y rendimiento

Resultados sobre el fold oficial de test (fold 10, 2.158 registros), según la model card:

| Metrica | NORM | MI | STTC | CD | HYP | Macro |
|---|---|---|---|---|---|---|
| AUROC | 0,941 | 0,927 | 0,931 | 0,920 | 0,904 | 0,925 |

- F1 macro con umbrales elegidos en validación: 0,745.
- Con umbral de confianza 0,8, el modelo etiqueta el 84,5 % de los registros y reserva el resto.
- HYP es la etiqueta más débil, con *average precision* de 0,68.
- Comparación interna del repositorio (ensembles de semillas con 1.000 remuestreos bootstrap a nivel de paciente): ResNet 1D 0,932 [0,924; 0,939] frente a CNN 1D 0,923 [0,915; 0,930]; diferencia +0,009 [+0,007; +0,011].
- El AUROC macro de test de esta semilla (0,925) coincide con la media de las cinco semillas (0,925 ± 0,003).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene ~0,19 M de parámetros y procesa tensores de 12 x 1000 muestras.
- GPU recomendadas: cualquiera; se entrenó en una NVIDIA T4 y la inferencia funciona sin problema en GPUs de gama baja.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.) y también en CPU.
- Opciones de despliegue: PyTorch nativo cargando `resnet_s23_best.pt` con `torch.load(..., weights_only=True)`; no se documentan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/ventana | AUROC macro (test PTB-XL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PTB-XL ECG ResNet (este) | ~0,19 M | 12 x 1000 (100 Hz, 10 s) | no aplica | 0,925 (semilla 23) | CC BY 4.0 (pesos), MIT (codigo) | Hugging Face + GitHub + Space |
| CNN 1D (referencia interna del repo) | no disponible | 12 x 1000 | no aplica | 0,923 [0,915; 0,930] (ensemble) | no disponible | Repositorio del autor |
| Otros modelos sobre PTB-XL | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos concretos disponible en la información proporcionada es la del ResNet 1D frente a la CNN 1D del mismo repositorio. No se dispone de cifras verificadas de otros modelos comparables para esta ficha.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no es un dispositivo médico; las salidas son puntuaciones frente a etiquetas de PTB-XL, no diagnósticos, triaje ni consejo terapéutico, y no deben usarse en atención al paciente.
- Un solo dataset público de un único centro alemán (registros de 1989-1996) y sin validación externa; el rendimiento en otros dispositivos, poblaciones o condiciones de registro es desconocido.
- Solo etiquetas de superclase: no cubre ritmo ni enunciados finos; las etiquetas son las del dataset y no fueron releídas por cardiólogos para este trabajo.
- Entrada rígida: solo 100 Hz, 10 segundos y 12 derivaciones; derivaciones ausentes o intercambiadas y unidades distintas cambian la salida de forma silenciosa.
- HYP es la etiqueta más débil (average precision 0,68), por lo que sus predicciones son las menos fiables.
- Riesgo de sesgo poblacional y de calibración fuera de la distribución de PTB-XL; no se documentan análisis de subgrupos.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero el aviso de "research use only" y la ausencia de validación clínica desaconsejan cualquier uso en producción sanitaria.
- No se documentan cuantizaciones ni exportaciones a formatos de inferencia optimizados, lo que limita su integración en *runtimes* distintos de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MHkhan50/ptbxl-ecg-resnet
- Repositorio de código, entrenamiento y evaluación: https://github.com/MHKhan50/ptbxl-ecg-superclass-benchmark
- Demo (Space): https://huggingface.co/spaces/MHkhan50/ecg-superclass-check
- Paper de PTB-XL: Wagner, P. et al. (2020). *Scientific Data* 7, 154. https://doi.org/10.1038/s41597-020-0495-6
- ORCID del autor: https://orcid.org/0009-0001-2570-5686
