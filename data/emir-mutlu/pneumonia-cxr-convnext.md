# emir-mutlu/pneumonia-cxr-convnext

## Resumen

Pneumonia-cxr-convnext es un clasificador binario de imagen (neumonía frente a ausencia de neumonía) para radiografías de tórax frontales, desarrollado por el usuario emir-mutlu. Se trata de un ajuste fino de ConvNeXt-Tiny (preentrenado en ImageNet-22k) sobre una combinación de dos fuentes de datos independientes: el conjunto pediátrico de Kermany et al. (Guangzhou) y el conjunto adulto del RSNA Pneumonia Detection Challenge 2018. El modelo se distribuye como grafo ONNX que integra en un único paso de inferencia la normalización de entrada, el escalado de temperatura (calibración) y un mapa Grad-CAM en forma cerrada.

Su relevancia práctica radica en la combinación de clasificación calibrada y explicabilidad en un solo artefacto ONNX de pequeño tamaño (0,1 GB), ejecutable tanto en servidor con ONNX Runtime como en el navegador. El modelo resuelve el problema de desplegar un detector de neumonía con trazabilidad visual (mapa de activación) sin necesidad de infraestructura de GPU dedicada. No obstante, el propio autor lo restringe explícitamente a investigación y educación, no a uso clínico.

Se trata de un modelo de visión por computador, no de un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Su entrada es una imagen de radiografía en escala de grises de 224 × 224 píxeles y su salida es una probabilidad calibrada y un mapa de calor de la misma resolución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura, ajustada desde ImageNet-22k) |
| Parametros totales | no disponible (ConvNeXt-Tiny ronda los 28 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada 224 × 224 × 1 canal) |
| Tipos de cuantizacion | pesos almacenados en float16 y convertidos a float32 en la sesión; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | research-and-education-only (uso solo para investigación y educación) |
| Formato de pesos | ONNX (`model_browser.onnx`) + `model_meta.json` |

## Arquitectura y entrenamiento

El modelo es un ConvNeXt-Tiny ajustado para clasificación binaria sobre radiografías de tórax. La entrada se convierte a escala de grises de 8 bits y se redimensiona sin recorte a 256 × 256 y después a 224 × 224 con interpolación bilineal antialias (Pillow `BILINEAR`), escalándose a [0, 1]. El grafo ONNX incorpora la normalización de entrada, el escalado de temperatura para calibración y un Grad-CAM en forma cerrada, de modo que una sola pasada devuelve la probabilidad calibrada y el mapa de explicación. Los pesos se guardan en float16 y se convierten a float32 al crear la sesión; toda la computación se ejecuta en float32 y el AUROC de test es idéntico al del modelo en float32.

El ajuste fino se realizó sobre 24.928 imágenes procedentes de dos fuentes combinadas con particiones a nivel de paciente: el conjunto pediátrico de Kermany et al. (Guangzhou, CC BY 4.0) y el conjunto adulto del RSNA Pneumonia Detection Challenge 2018 (NIH Clinical Center). El autor señala que las imágenes del conjunto RSNA se corresponden con solo 12.233 pacientes y que las particiones usan el identificador real de paciente del NIH. El umbral de decisión es 0,576, tomado de `model_meta.json`. No se documentan en la información disponible detalles sobre el número de épocas, la función de pérdida ni si hubo técnicas de aumento de datos más allá del preprocesado descrito.

## Capacidades

- Clasificación binaria de radiografías de tórax frontales: neumonía frente a no neumonía, con probabilidad calibrada (escalado de temperatura).
- Generación de mapas de explicación Grad-CAM en la misma pasada de inferencia, con salida de 224 × 224 en [0, 1].
- Inferencia en ONNX Runtime, tanto en servidor como en navegador (demo pública en Hugging Face Spaces).
- Entrada en escala de grises de un solo canal, con preprocesado integrado en el grafo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Investigación en imagen médica: servir como línea base reproducible para estudiar calibración y explicabilidad en clasificación de radiografías, gracias a que el grafo ONNX integra normalización, temperatura y Grad-CAM en un único artefacto.
- Docencia y formación: desplegar la demo en navegador para ilustrar cómo un clasificador convolucional localiza regiones de interés en una radiografía, usando el mapa Grad-CAM como material didáctico.
- Evaluación de robustez entre dominios: comparar el rendimiento del modelo en datos pediátricos frente a adultos para estudiar la degradación por cambio de distribución (el autor reporta una caída de 0,15–0,21 AUROC entre hospitales).
- Prototipado de pipelines de triaje asistido: integrar la salida de probabilidad calibrada y el mapa de calor en un sistema de revisión humana, siempre con supervisión de un radiólogo y fuera de cualquier uso diagnóstico.
- Análisis de sesgo y equidad: emplear las métricas por subgrupo (edad, proyección PA/AP) para investigar cómo los atajos de vista afectan al rendimiento en adultos.
- Despliegue ligero en el borde o en navegador: usar el ONNX de 0,1 GB en entornos sin GPU para demostraciones y pruebas de concepto, gracias a su tamaño reducido y a la inferencia en float32.

## Benchmarks y rendimiento

Resultados de test reportados por el autor, con intervalos de confianza del 95 % obtenidos por bootstrap agrupado por paciente:

| Conjunto de test | Imágenes (pacientes) | AUROC (IC 95 %) | Sensibilidad | Especificidad | ECE |
|---|---:|---|---:|---:|---:|
| Kermany, pediátrico | 624 (427) | 0,990 (0,982–0,995) | 0,995 | 0,838 | 0,068 |
| RSNA, adulto | 6.133 (2.446) | 0,890 (0,877–0,903) | 0,691 | 0,878 | 0,068 |

El autor indica además que los picos del Grad-CAM caen dentro de las cajas de los radiólogos en el 76,5 % de las imágenes de neumonía del test RSNA, frente al 12,4 % de un punto aleatorio. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0,1 GB) y la arquitectura ConvNeXt-Tiny en float32, la huella es muy reducida y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime, sin requisito de GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU; el autor no publica cifras de VRAM ni de latencia.
- Opciones de despliegue: ONNX Runtime (servidor o navegador); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de imagen.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros clasificadores de neumonía en radiografía de tórax) que permitan una comparación cuantitativa fiable. La siguiente tabla recoge únicamente los atributos declarados del modelo frente a alternativas genéricas de la misma categoría, sin cifras de rendimiento comparables:

| Modelo | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pneumonia-cxr-convnext | ConvNeXt-Tiny + Grad-CAM en ONNX | Imagen 224 × 224 × 1 | research-and-education-only | Hugging Face + demo en navegador |
| Clasificadores de neumonía basados en ResNet/DenseNet | CNN estándar | Imagen variable | variable según autor | variable |
| Modelos fundacionales de imagen médica | Transformers visuales | Imagen de alta resolución | variable | variable |

Los datos de rendimiento de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: licencia y aviso del autor restringen el uso a investigación y educación; no debe emplearse para diagnóstico, triaje ni tratamiento.
- Solo se entrenó con datos de dos hospitales; el rendimiento en otros centros es desconocido y el propio autor reporta que modelos entrenados en un hospital pierden entre 0,15 y 0,21 AUROC en el otro.
- Umbral global único: la sensibilidad es mucho menor en adultos (0,691) que en niños (0,995), y aún menor en pacientes de 60 años o más y en proyecciones PA.
- Las vistas AP (a pie de cama) concentran más enfermedad y parte del AUROC adulto proviene de señales relacionadas con la proyección, lo que puede inflar el rendimiento aparente.
- Las etiquetas difieren entre fuentes (neumonía clínica frente a opacidad pulmonar radiográfica), lo que introduce heterogeneidad en el objetivo de aprendizaje.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos con consecuencias clínicas si se usa fuera de investigación.
- No se documentan sesgos demográficos más allá de la diferencia pediátrico/adulto y la proyección; la calibración (ECE 0,068) no es perfecta.
- El modelo no procesa texto ni soporta interacción conversacional; cualquier uso que requiera lenguaje queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emir-mutlu/pneumonia-cxr-convnext
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/emir-mutlu/pneumonia-cxr-detection
- Código, entrenamiento y evaluación: https://github.com/emir-mutlu/pneumonia-cxr-detection
- Model card completa: https://github.com/emir-mutlu/pneumonia-cxr-detection/blob/main/MODEL_CARD.md
- Licencia: https://github.com/emir-mutlu/pneumonia-cxr-detection/blob/main/LICENSE
- Dataset Kermany et al., Cell 2018: doi:10.17632/rscbjbr9sj.2
- Wang et al., ChestX-ray8, CVPR 2017
- Shih et al., Radiology: AI 2019: doi:10.1148/ryai.2019180041
- Liu et al., ConvNeXt, CVPR 2022
