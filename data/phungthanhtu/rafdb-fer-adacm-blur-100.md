# phungthanhtu/rafdb-fer-adacm-blur-100

## Resumen

`phungthanhtu/rafdb-fer-adacm-blur-100` es un checkpoint de investigación para reconocimiento de expresiones faciales (FER) entrenado con el método Ada-CM en modo semi-supervisado sobre el conjunto RAF-DB. Lo publica el usuario de Hugging Face phungthanhtu como parte de un estudio de ablación sobre el presupuesto de datos etiquetados: este repositorio concreto corresponde a la fila de 100 imágenes etiquetadas del informe, con semilla 5. El modelo parte de un backbone ResNet-18 preentrenado en MS-Celeb-1M y opera sobre recortes de cara alineados de 224x224 píxeles.

La relevancia del checkpoint es metodológica más que práctica: demuestra hasta qué punto el aprendizaje semi-supervisado con aumentación fuerte (en este caso, desenfoque gaussiano con sigma entre 0,1 y 1,0 aplicado con probabilidad 0,5 a la vista fuerte de las imágenes no etiquetadas) puede sostener un clasificador de siete clases con solo 100 ejemplos etiquetados y 12.171 no etiquetados. Los resultados publicados son modestos: 65,09 % de exactitud en test y 54,29 % de macro-F1, con un ECE de 0,264 que indica una calibración pobre.

No es un modelo de lenguaje ni un modelo multimodal generativo: es un clasificador de imágenes de propósito muy acotado, con licencia "other" y restricciones explícitas de uso no comercial derivadas de la licencia de RAF-DB. El repositorio pesa 0,0 GB según los metadatos, aunque incluye `model.pt` con pesos, configuración, nombres de clase y métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), entrada 224x224, preentrenado en MS-Celeb-1M |
| Parametros totales | no disponible (ResNet-18 estándar, ~11,7 M, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt` en precisión original) |
| Idiomas soportados | no aplica (clasificador de expresiones faciales, sin componente lingüístico) |
| Licencia | other (restricciones derivadas de RAF-DB: solo investigación no comercial) |
| Formato de pesos | `model.pt` (PyTorch, pesos + config + nombres de clase + métricas, sin clases serializadas con pickle) |

## Arquitectura y entrenamiento

El modelo es una red convolucional ResNet-18 con pesos iniciales de MS-Celeb-1M, adaptada a clasificación de 7 clases de expresión facial (`Surprise`, `Fear`, `Disgust`, `Happiness`, `Sadness`, `Anger`, `Neutral`). El entrenamiento sigue el esquema Ada-CM en régimen semi-supervisado: 100 imágenes etiquetadas de RAF-DB junto con 12.171 imágenes no etiquetadas del mismo conjunto de entrenamiento. Sobre la vista fuerte de las imágenes no etiquetadas se aplica un desenfoque gaussiano con sigma muestreado uniformemente entre 0,1 y 1,0 y probabilidad 0,5, como aumentación adicional dentro del pipeline de consistencia típico de los métodos semi-supervisados con dos vistas.

El preprocesamiento de entrenamiento combina random resized crops y RandAugment; en inferencia se redimensiona el lado corto a 224, se aplica `ToTensor` y se normaliza con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. El checkpoint publicado son los pesos finales de la media exponencial (EMA) del modelo, con semilla 5. No se detalla en la model card el número de épocas, el optimizador, la tasa de aprendizaje ni la función de pérdida exacta empleada.

## Capacidades

- Clasificación de expresiones faciales en 7 clases discretas sobre imágenes de cara alineadas similares a RAF-DB.
- Salida de una única etiqueta por imagen (no se documenta salida de probabilidades por clase en la interfaz `predict`, aunque el checkpoint incluye métricas y configuración).
- Inferencia autocontenida: `model.load()` descarga pesos, reconstruye la red y la deja en modo `eval`, sin necesidad del pipeline de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- No se documentan capacidades de detección o alineación facial: asume recortes ya alineados.

## Casos de uso

- Investigación en aprendizaje semi-supervisado: sirve como punto de referencia reproducible (semilla 5, 100 etiquetas) para comparar variantes de aumentación fuerte, como el desenfoque gaussiano aplicado aquí, frente a otras políticas de aumentación en FER.
- Estudio de calibración en clasificadores de baja data: con un ECE de 0,264, es útil para analizar técnicas de calibración (temperature scaling, mixup, etc.) en regímenes con pocas etiquetas.
- Ablación de presupuesto de etiquetas: al publicarse junto a los checkpoints de 400, 2.000 y 4.000 etiquetas, permite trazar curvas de rendimiento frente a número de etiquetas y estimar el retorno marginal de anotar más datos.
- Análisis de errores por clase: dado que la model card identifica fear, sadness y neutral como las clases más confundidas, es adecuado para estudiar matrices de confusión y estrategias de reequilibrado en FER.
- Docencia y reproducción de experimentos: el paquete incluye `model.py` y `example.py`, lo que facilita demostraciones en cursos de visión por computador o de aprendizaje semi-supervisado sin infraestructura pesada.
- Prototipado interno no comercial de pipelines de FER: como paso previo a un sistema propio, permite validar el preprocesamiento (redimensionado, normalización) y la interfaz de inferencia antes de invertir en datos y entrenamiento propios.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de RAF-DB:

| Metrica | Valor |
|---|---|
| Exactitud en test | 65,09 % |
| Macro-F1 | 54,29 % |
| ECE (10 bins) | 0,264 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas por clase más allá de la indicación cualitativa de que fear, sadness y neutral son las clases más confundidas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una ResNet-18 a 224x224 en FP32 requiere del orden de varios cientos de MB, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con al menos 2 GB de VRAM, aunque el dato no se confirma en la model card.
- Opciones de despliegue: PyTorch nativo mediante `model.load()` y `model.predict()`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Etiquetas usadas | Exactitud test | Macro-F1 | Licencia |
|---|---|---|---|---|---|
| rafdb-fer-adacm-blur-100 (este) | ResNet-18 | 100 | 65,09 % | 54,29 % | other (no comercial) |
| rafdb-fer-adacm-blur-400 | no disponible | 400 | no disponible | no disponible | other |
| rafdb-fer-adacm-blur-2000 | no disponible | 2.000 | no disponible | no disponible | other |
| rafdb-fer-adacm-blur-4000 | no disponible | 4.000 | no disponible | no disponible | other |

Los checkpoints hermanos del mismo autor se anuncian en la model card, pero sus métricas no se detallan en la información proporcionada. No se dispone de datos de modelos externos comparables en la información disponible.

## Limitaciones y advertencias

- Entrenado con solo 100 imágenes etiquetadas: el rendimiento es bajo y muy dependiente de la semilla; el propio autor señala debilidad en fear, sadness y neutral.
- Calibración deficiente: ECE de 0,264 con 10 bins, lo que desaconseja usar las probabilidades de salida como confianza fiable sin recalibración.
- Sesgos no documentados: la model card no analiza sesgos por demografía, iluminación, pose o etnia; RAF-DB tiene una distribución propia que puede no representar poblaciones diversas.
- Riesgo de fallo en caras no alineadas o fuera de dominio: el modelo asume recortes alineados como los de RAF-DB y no incluye detección ni alineación.
- Restricciones de licencia: RAF-DB está licenciado solo para investigación no comercial; el autor prohíbe explícitamente el uso sobre personas en producción.
- Sin soporte documentado de cuantización ni de formatos alternativos (GGUF, ONNX), lo que limita su integración en stacks de despliegue ligeros.
- Solo se publica la semilla 5; las demás semillas del estudio están "disponibles bajo petición", lo que dificulta la reproducibilidad completa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-100
- Checkpoint con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-400
- Checkpoint con 2.000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-2000
- Checkpoint con 4.000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-4000
- Perfil del autor: https://huggingface.co/phungthanhtu
