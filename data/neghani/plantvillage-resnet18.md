# neghani/plantvillage-resnet18

## Resumen

`neghani/plantvillage-resnet18` es un clasificador de imagenes de enfermedades de hojas de cultivo desarrollado por el usuario neghani en el contexto de un proyecto capstone del IIIT-H (grupo 4) titulado "AI-Powered Plant Disease Detection and Farmer Assistance". El modelo recibe una fotografia RGB de una hoja y devuelve la clase PlantVillage mas probable junto con su probabilidad softmax, cubriendo 38 clases distribuidas en 14 cultivos.

Tecnicamente es un ResNet-18 (11.205.606 parametros) afinado de extremo a extremo sobre el dataset PlantVillage en su variante `color`, con una segunda etapa de entrenamiento que incorpora Cropped-PlantDoc para mejorar la robustez ante fotografias de movil. La longitud de contexto no aplica: es un modelo de vision puro, no un modelo de lenguaje, y su ventana de entrada es una imagen de 224x224 pixeles tras el preprocesado de evaluacion.

Su relevancia practica esta en el binomio tamano-rendimiento: con solo 0,1 GB de repositorio y 11 millones de parametros, alcanza un 97,90% de accuracy y un 96,87% de F1 macro sobre el split de test retenido de PlantVillage, lo que lo hace desplegable en hardware muy modesto (CPU incluida) para aplicaciones agricolas de diagnostico asistido. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (red neuronal convolucional residual) |
| Parametros totales | 11.205.606 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | image-classification |
| Clases | 38 (14 cultivos) |
| Dataset de entrenamiento | abdallahalidev/plantvillage-dataset (color) + Cropped-PlantDoc (etapa 2) |
| Tamano del repositorio | 0,1 GB |
| Descargas en Hugging Face | 287 |

## Arquitectura y entrenamiento

El modelo es un ResNet-18 estandar, la variante ligera de la familia de redes residuales con conexiones skip que mitigan el desvanecimiento del gradiente en redes profundas. Se afino de extremo a extremo (fine-tuning completo, no solo la cabeza de clasificacion) para resolver una tarea de clasificacion de 38 clases. El preprocesado de evaluacion consiste en redimensionar el lado corto de la imagen, recorte central a 224 pixeles y normalizacion con los valores de `preprocessor_config.json`.

Los datos de entrenamiento proceden de PlantVillage en su version `color`, con un split estratificado por clase y semilla 42: 43.445 imagenes de entrenamiento, 5.430 de validacion y 5.430 de test. A partir de la version `v1.1` se incorpora Cropped-PlantDoc (Singh et al. 2020, CC BY 4.0), que cubre 27 de las 38 clases; las 11 restantes permanecen solo con datos de laboratorio. La aumentacion esta disenada explicitamente para robustez ante fotos de movil: recorte aleatorio redimensionado (70-100% en PlantVillage, 50-100% en PlantDoc), volteo horizontal y vertical, rotacion de hasta 180 grados, jitter de brillo, contraste y saturacion, y desenfoque gaussiano aleatorio. No se documenta RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion de imagenes de hojas de cultivo en 38 clases de enfermedad y estado sano, abarcando 14 cultivos (manzana, arandano, cereza, maiz, uva, naranja, melocoton, pimiento, patata, frambuesa, soja, calabaza, fresa y tomate).
- Salida de probabilidad softmax por clase, lo que permite umbralizar la confianza: el autor recomienda tratar una probabilidad top-1 inferior a 0,5 como "no estoy seguro" y solicitar una foto mas clara o confirmacion experta.
- Capacidad de top-3 (99,78% de accuracy), util para presentar al usuario las tres hipotesis mas probables en lugar de una sola.
- Robustez parcial ante fotografias de campo gracias a la aumentacion agresiva y a la incorporacion de Cropped-PlantDoc en la etapa 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un clasificador de vision con etiquetas en ingles.
- En el sistema original, el modelo se integra con un agente LangGraph que explica el resultado y sugiere tratamiento a partir de una base de conocimiento agricola curada; esa capa conversacional es externa al modelo.

## Casos de uso

- Diagnostico asistido en aplicaciones moviles agricolas: el usuario fotografia una hoja y la app ejecuta inferencia local o remota con este modelo; con 11 millones de parametros y 0,1 GB de pesos, cabe en el almacenamiento y la memoria de un telefono de gama media.
- Triaje previo a la consulta con un ingeniero agronomo: el modelo filtra y prioriza casos, de modo que el experto recibe ya una hipotesis con probabilidad asociada y puede confirmar o descartar con mayor rapidez.
- Sistemas de alerta temprana en explotaciones: integrado en una app de campo o en un dron con captura periodica, permite detectar brotes de enfermedades como el Huanglongbing de los citricos o el virus del rizado amarillo del tomate antes de que se extiendan.
- Modulo de vision en un asistente conversacional agricola: tal como se diseno en el proyecto original, el clasificador alimenta a un agente LangGraph que traduce la clase detectada en recomendaciones de tratamiento desde una base de conocimiento curada.
- Investigacion y docencia en vision por computador aplicada: sirve como baseline reproducible de ResNet-18 sobre PlantVillage, con split estratificado, semilla fija, informe por clase y matriz de confusion publicados en el repositorio.
- Despliegue en entornos con conectividad limitada o sin GPU: al ser una CNN pequena, puede ejecutarse en CPU en dispositivos de borde (Raspberry Pi, mini-PC agricola) con latencias compatibles con un flujo de captura y respuesta interactivo.
- Preetiquetado en pipelines de anotacion: el modelo puede generar etiquetas iniciales sobre nuevas imagenes de campo que luego revisa un anotador humano, acelerando la construccion de datasets propios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el split de test retenido de PlantVillage (5.430 imagenes). No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Accuracy | 97,90% |
| Precision macro | 97,16% |
| Recall macro | 96,78% |
| F1 macro | 96,87% |
| Top-3 accuracy | 99,78% |
| Imagenes de test | 5.430 |

Clases mas debiles en el test:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| `Potato___healthy` | 92,3% | 80,0% | 85,7% | 15 |
| `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | 97,3% | 70,6% | 81,8% | 51 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el modelo completo ocupa unos 45 MB en fp32 (11,2 M de parametros) y el repositorio pesa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona sin problemas en RTX 3060, RTX 4090, A100 o H100, pero no las necesita.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable en Raspberry Pi, mini-PC y telefonos de gama media.
- Opciones de despliegue: transformers con PyTorch (via `pipeline("image-classification")`), exportacion a ONNX u OpenVINO para inferencia en CPU, TorchScript y TF Lite para movil (requiere conversion, no incluida en el repositorio). vLLM, llama.cpp, Ollama y TGI no aplican: son motores para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neghani/plantvillage-resnet18` | 11,2 M | Clasificacion de 38 clases de enfermedad foliar | no aplica (224x224) | apache-2.0 | Hugging Face, transformers |
| ResNet-50 (ImageNet, referencia generica) | ~25,6 M | Clasificacion generica de imagenes | no aplica | variable | amplia |
| ViT-B/16 (referencia generica) | ~86 M | Clasificacion generica de imagenes | no aplica | variable | amplia |

Los modelos genericos citados no estan afinados sobre PlantVillage y no son comparables en accuracy sobre esta tarea; se incluyen solo como referencia de escala. No se conocen en la informacion disponible otros clasificadores PlantVillage publicados con metricas comparables.

## Limitaciones y advertencias

- El modelo no sustituye a un patologo vegetal: el propio autor indica que las decisiones de tratamiento deben confirmarse con un oficial de extension agricola local.
- Umbral de confianza recomendado: tratar una probabilidad top-1 inferior a 0,5 como "no estoy seguro" y pedir una foto mas clara o confirmacion experta.
- Once de las 38 clases solo disponen de datos de laboratorio (PlantVillage) y no se han visto reforzadas con Cropped-PlantDoc, por lo que su robustez ante fotos reales de campo es previsiblemente menor.
- Clases debiles documentadas: `Potato___healthy` (recall 80,0% con solo 15 imagenes de soporte) y `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` (recall 70,6% con 51 imagenes); ambas pueden confundirse con clases visualmente proximas.
- Sesgo de dominio: PlantVillage son imagenes de laboratorio con fondo controlado; aunque la aumentacion y PlantDoc mitigan el problema, el rendimiento en fotografias de campo con fondos complejos, iluminacion variable u oclusiones puede degradarse respecto a las cifras de test.
- Etiquetas exclusivamente en ingles y sin capacidades multilingues; cualquier interfaz en castellano requiere una capa de traduccion externa.
- Riesgo de alucinacion en el sentido clasico no aplica, pero si el riesgo de falsos positivos con alta confianza en imagenes fuera de distribucion (hojas de cultivos no cubiertos, partes de la planta distintas de la hoja o imagenes no vegetales).
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales, pero conviene revisar las licencias de los datasets subyacentes (PlantVillage y Cropped-PlantDoc, este ultimo CC BY 4.0).
- El campo `base_model` de la model card apunta al propio modelo (`neghani/plantvillage-resnet18`), lo que sugiere un fine-tuning sobre una version previa del mismo autor; no se documenta el checkpoint ImageNet original de partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neghani/plantvillage-resnet18
- Dataset PlantVillage (Kaggle): https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
- Cropped-PlantDoc (GitHub): https://github.com/pratikkayal/PlantDoc-Dataset
- Licencia CC BY 4.0 de PlantDoc: https://creativecommons.org/licenses/by/4.0/
- Matriz de confusion (en el repositorio del modelo): reports/confusion_matrix.png
- Informe de clasificacion por clase (en el repositorio del modelo): reports/classification_report.txt
