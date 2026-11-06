# neghani/plantvillage-resnet18

## Resumen

`neghani/plantvillage-resnet18` es un clasificador de imágenes para enfermedades de hojas de cultivo, desarrollado por el usuario `neghani` como parte de un proyecto capstone del IIIT-H (grupo 4) titulado "AI-Powered Plant Disease Detection and Farmer Assistance". El modelo recibe una fotografía RGB de una hoja y devuelve la clase PlantVillage más probable junto con una puntuación de confianza softmax. Está pensado para integrarse en un agente LangGraph que explique el diagnóstico y sugiera tratamientos a partir de una base de conocimiento agrícola curada.

Técnicamente es un ResNet-18 afinado de extremo a extremo sobre el dataset PlantVillage (variante `color`), con 11.205.606 parámetros totales y pesos en formato safetensors. La tarea es de clasificación de imágenes entre 38 clases que cubren 14 cultivos, e incluye tanto estados sanos como distintas patologías (mildiu, roya, mancha bacteriana, virus del rizado amarillo del tomate, etc.). El modelo solo declara soporte para inglés en sus metadatos.

Su relevancia actual radica en que ofrece un pipeline de diagnóstico de enfermedades vegetales con métricas publicadas y verificables en la propia model card (97,70 % de accuracy y 96,49 % de macro F1 sobre el split de test retenido), un umbral operativo explícito de confianza (0,5) y una licencia Apache 2.0 que permite uso comercial. Es un componente pequeño (0,1 GB de repositorio) y ligero, adecuado para despliegue en el borde o en servicios de inferencia de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN residual, `transformers`, pipeline `image-classification`) |
| Parámetros totales | 11.205.606 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ResNet-18 estándar (bloques residuales con conexiones skip, normalización por lotes y activaciones ReLU) adaptado a clasificación de 38 clases. Se afina de extremo a extremo, no como extractor congelado. La entrada se preprocesa redimensionando el lado corto, recortando al centro a 224×224 y normalizando según el `preprocessor_config.json` incluido en el repositorio.

Los datos de entrenamiento proceden del dataset PlantVillage en su variante `color`, con un split estratificado por clase y semilla 42: 43.445 imágenes de entrenamiento, 5.430 de validación y 5.430 de test. A partir de la etapa 2 (etiqueta `v1.1` en adelante) se incorpora también Cropped-PlantDoc (Singh et al. 2020, CC BY 4.0), que cubre 27 de las 38 clases; las otras 11 permanecen solo con datos de laboratorio. La aumentación busca robustez ante fotos de móvil: recorte redimensionado aleatorio (70-100 % en PlantVillage, 50-100 % en PlantDoc), volteo horizontal y vertical, rotación de hasta 180°, jitter de brillo/contraste/saturación y desenfoque gaussiano aleatorio. No se documenta RLHF, DPO ni ninguna innovación de decodificación; es un clasificador supervisado convencional.

## Capacidades

- Clasificación de imágenes de hojas de cultivo en 38 clases de 14 cultivos (manzana, arándano, cereza, maíz, uva, naranja, melocotón, pimiento, patata, frambuesa, soja, calabaza, fresa y tomate).
- Salida de probabilidad softmax por clase, con umbral operativo recomendado de 0,5 por debajo del cual el autor indica tratar el resultado como "no seguro".
- Distinción entre estados sanos y varias patologías por cultivo (p. ej. `Tomato___Early_blight`, `Grape___Black_rot`, `Corn_(maize)___Northern_Leaf_Blight`).
- Robustez declarada ante variaciones de iluminación, encuadre y orientación gracias a la aumentación agresiva del entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, capacidades multilingües, visión general (más allá de hojas), audio ni modo thinking. El soporte de agentes corresponde al sistema externo (LangGraph) que consume el modelo, no al modelo en sí.

## Casos de uso

- Diagnóstico asistido en aplicación móvil para agricultores: el usuario fotografía una hoja y el modelo devuelve la clase más probable y su confianza; si la probabilidad top-1 es inferior a 0,5, la aplicación solicita una foto más clara o deriva a un experto. El tamaño reducido (11,2 M de parámetros) permite inferencia en el dispositivo o en un servicio ligero.
- Triaje previo en cooperativas agrícolas: clasificación masiva de imágenes recibidas por canales de mensajería para priorizar las que requieren inspección presencial, usando la clase predicha y la confianza como criterio de enrutamiento.
- Integración en un agente conversacional (LangGraph) que explica el diagnóstico y sugiere tratamiento: el modelo actúa como clasificador y el agente recupera información de una base de conocimiento agrícola curada; el umbral de 0,5 evita respuestas taxativas sobre predicciones dudosas.
- Monitorización de cultivos con drones o cámaras fijas: procesamiento por lotes de imágenes de campo para detectar focos de enfermedad (p. ej. `Orange___Haunglongbing` o `Potato___Late_blight`) y generar alertas tempranas.
- Herramienta de formación para técnicos agrícolas: banco de pruebas que muestra la clase predicha junto con la confianza para enseñar a distinguir patologías visualmente similares, aprovechando la top-3 accuracy del 99,71 %.
- Filtrado y etiquetado semiautomático de datasets agrícolas: preetiquetar imágenes nuevas con el modelo y revisar manualmente solo aquellas con confianza baja, reduciendo el coste de anotación.
- Investigación en visión aplicada a agricultura: línea base ligera y reproducible (semilla 42, split documentado, matriz de confusión y reporte por clase publicados) para comparar con arquitecturas mayores o con modelos entrenados en dominios de campo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test retenido de PlantVillage (5.430 imágenes). No están verificados de forma independiente (`verified: false` en el model-index).

| Métrica | Valor |
|---|---|
| Accuracy | 97,70 % |
| Macro precision | 97,00 % |
| Macro recall | 96,18 % |
| Macro F1 | 96,49 % |
| Top-3 accuracy | 99,71 % |
| Imágenes de test | 5.430 |

Clases más débiles según el autor:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| `Potato___healthy` | 92,3 % | 80,0 % | 85,7 % | 15 |
| `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` | 94,7 % | 70,6 % | 80,9 % | 51 |

No se han publicado resultados de benchmarks frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 11,2 M de parámetros y pesos safetensors en fp32, el modelo ocupa del orden de 45 MB, y en fp16 alrededor de 22 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1050 Ti, RTX 3060, RTX 4090, T4, A100, H100). También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en dispositivos de borde con aceleración (Jetson, NPU móvil) si se exporta a un runtime adecuado.
- Opciones de despliegue: `transformers` (pipeline `image-classification`), TorchServe, ONNX Runtime, o exportación a TensorRT; no se documentan variantes GGUF ni compatibilidad con llama.cpp/Ollama (no aplica a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parámetros | Contexto | Métrica publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `neghani/plantvillage-resnet18` | 11.205.606 | no aplica | 97,70 % accuracy / 96,49 % macro F1 (PlantVillage test) | apache-2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entrena principalmente con imágenes de laboratorio de PlantVillage; aunque la aumentación y la incorporación parcial de PlantDoc (27 de 38 clases) buscan mejorar la robustez ante fotos reales de campo, 11 clases siguen siendo solo de laboratorio.
- El autor recomienda tratar una probabilidad top-1 inferior a 0,5 como "no seguro" y pedir una foto más clara o confirmación experta; ignorar este umbral puede producir diagnósticos erróneos con alta aparente seguridad.
- Clases débiles documentadas: `Potato___healthy` (recall 80,0 %) y `Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot` (recall 70,6 %), con soportes de test pequeños (15 y 51 imágenes), lo que implica alta varianza en la estimación.
- No sustituye a un fitopatólogo: las decisiones de tratamiento deben confirmarse con un técnico agrícola local, según indica el propio autor.
- Solo declara idioma inglés en los metadatos; no hay soporte multilingüe.
- No es un modelo de lenguaje: no genera explicaciones ni tratamientos por sí mismo; esas funciones dependen del agente externo que lo consume.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los datasets de origen (PlantVillage y PlantDoc, este último CC BY 4.0) para cumplir con sus condiciones de atribución.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de clasificación errónea con confianza alta en imágenes fuera de distribución (otras especies, hojas dañadas por factores abióticos, iluminación extrema).
- Los resultados del model-index están marcados como no verificados de forma independiente; conviene reproducirlos antes de usarlos como referencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neghani/plantvillage-resnet18
- Dataset PlantVillage (Kaggle): https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
- Dataset PlantDoc: https://github.com/pratikkayal/PlantDoc-Dataset
- Licencia CC BY 4.0 (PlantDoc): https://creativecommons.org/licenses/by/4.0/
- Matriz de confusión (repo del modelo): reports/confusion_matrix.png
- Reporte de clasificación por clase (repo del modelo): reports/classification_report.txt
