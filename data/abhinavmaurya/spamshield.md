# AbhinavMaurya/SpamShield

## Resumen

SpamShield es un motor de moderación de contenido multilingüe desarrollado por AbhinavMaurya, diseñado para detectar mensajes de spam en tiempo real en entornos de chat como Telegram, Discord o aplicaciones web. Se distribuye como un paquete de modelos ONNX que combina dos clasificadores de texto (uno binario para spam/ham y otro multicategoría con seis tipos de amenaza) junto con un clasificador de visión para escanear imágenes NSFW. El modelo está pensado para entornos de producción con requisitos estrictos de latencia y recursos: la inferencia se ejecuta completamente en CPU con un consumo de memoria inferior a 20 MB y una latencia media de entre 1,5 y 4,8 ms según la variante.

La solución se ofrece en tres variantes (Lite, Flash y Edge) que permiten ajustar el equilibrio entre precisión y velocidad. Flash es la recomendada por defecto para moderación de grupos de alto tráfico, mientras que Edge ofrece la mayor precisión para análisis conversacional profundo y Lite está orientada a dispositivos embebidos o servidores con memoria limitada. El modelo es resistente a homoglifos y variantes Unicode gracias a un preprocesamiento que incluye normalización NFKD, decodificación de leetspeak y supresión de repeticiones de caracteres. Todo el sistema se distribuye bajo licencia MIT y no depende de ninguna API externa, lo que lo hace apto para despliegues offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador ONNX basado en características de texto, sin arquitectura transformer declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como modelo ONNX estándar) |
| Idiomas soportados | en, hi, es, ar, zh, fr, de, ru |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx para clasificadores binario, de categorías y visión) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de indicar que se trata de clasificadores ONNX con "zero heavy transformer overhead", lo que sugiere un modelo basado en características extraídas del texto (probablemente n-gramas o bolsas de palabras con vocabularios de 5.000 a 22.000 palabras y de 2.500 a 12.000 caracteres según la variante). No se especifica el número de parámetros ni el tipo de red neuronal (posiblemente regresión logística o un MLP pequeño). El entrenamiento se realizó sobre el dataset AbhinavMaurya/SpamShield-Datasets, del que no se ofrecen detalles de composición ni volumen. Tampoco se menciona el uso de técnicas como RLHF o DPO. La innovación principal reside en el preprocesamiento robusto frente a homoglifos (caracteres cirílicos o griegos que imitan letras latinas) y en la optimización para inferencia ultra-rápida en CPU.

## Capacidades

- Clasificación binaria de spam frente a mensajes legítimos (ham) con probabilidad de spam y umbral ajustable por variante.
- Clasificación multicategoría en seis tipos de amenaza: phishing, estafas laborales, cripto, contenido adulto, marketing no deseado y sorteos falsos.
- Detección de imágenes NSFW mediante un modelo de visión ONNX (arquitectura MobileNet/EfficientNet exportada, según la descripción del autor) que procesa imágenes de 224x224 píxeles.
- Preprocesamiento de texto multilingüe con normalización NFKD, decodificación de leetspeak, supresión de repeticiones de caracteres y transliteración de homoglifos cirílicos/griegos.
- Funcionamiento completamente offline y en CPU, sin dependencia de APIs externas.
- Tres variantes de modelo (Lite, Flash, Edge) para adaptarse a distintos requisitos de latencia y precisión.

## Casos de uso

- Moderación de grupos de Telegram o Discord: el modelo puede integrarse en bots que analicen cada mensaje entrante y eliminen o marquen automáticamente contenido spam, con una latencia inferior a 5 ms que no interfiere en la experiencia del usuario.
- Filtrado de correo electrónico en entornos corporativos: su capacidad para clasificar phishing y estafas laborales permite bloquear amenazas antes de que lleguen a la bandeja de entrada, complementando soluciones basadas en reglas.
- Protección de comunidades online: plataformas de foros o redes sociales pueden usar la clasificación multicategoría para detectar enlaces maliciosos, promociones no deseadas o contenido adulto explícito en comentarios y publicaciones.
- Análisis de mensajes en aplicaciones de citas: el modelo ayuda a identificar perfiles fraudulentos que intentan dirigir a los usuarios a estafas de criptomonedas o esquemas de inversión falsos.
- Moderación de contenido en juegos multijugador: el chat de voz y texto puede filtrarse en tiempo real para detectar spam de marketing o intentos de phishing dirigidos a jugadores.
- Escaneo de imágenes adjuntas en plataformas de mensajería: el clasificador de visión NSFW permite bloquear contenido explícito antes de su visualización, útil en aplicaciones para menores o entornos laborales.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, evaluados sobre conjuntos de prueba multilingües que incluyen inglés, alemán, ruso, español, hinglish, hindi y árabe:

| Metrica | Lite | Flash | Edge |
| :--- | :--- | :--- | :--- |
| Precisión binaria | 95,85 % | 97,17 % | 97,60 % |
| Precisión de spam | 98,50 % | 98,20 % | 98,13 % |
| Recall | 93,36 % | 96,28 % | 97,20 % |
| F1 | 0,9587 | 0,9723 | 0,9766 |
| Umbral optimo de spam | 0,6719 | 0,5452 | 0,4818 |
| Latencia media de inferencia | ~1,5 ms | ~3,2 ms | ~4,8 ms |

No se han publicado resultados comparativos con otros modelos de detección de spam en la información disponible.

## Requisitos de hardware

- Inferencia en CPU pura; no requiere GPU.
- Consumo de memoria inferior a 20 MB para el modelo completo (todas las variantes).
- Tamaños de archivo ONNX: Lite ~273 KB, Flash ~706 KB, Edge ~1,28 MB.
- Ejecución con ONNX Runtime (CPUExecutionProvider) y NumPy.
- Latencia media de entre 1,5 ms y 4,8 ms en CPU estándar, según la variante.
- Despliegue posible en dispositivos embebidos, servidores de baja capacidad o funciones serverless (AWS Lambda, Cloud Functions) gracias a su reducido footprint.
- No se requieren bibliotecas de deep learning pesadas; basta con `onnxruntime` y `numpy`.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados contra otros modelos de detección de spam. A modo orientativo, los clasificadores basados en transformers como `microsoft/deberta-v3-base` o `roberta-base` suelen ofrecer mayor precisión en tareas complejas pero requieren GPU o CPU potentes y tienen latencias de decenas de milisegundos. SpamShield se posiciona como una alternativa de baja latencia y bajo consumo, adecuada para entornos de altísimo rendimiento donde los modelos transformer no son viables. No obstante, al no haber benchmarks comunes, no es posible realizar una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La información técnica sobre arquitectura, parámetros y datos de entrenamiento es muy limitada; no se especifica el número de parámetros ni la composición del dataset, lo que dificulta evaluar su robustez en dominios no cubiertos por los idiomas listados.
- El modelo está entrenado para ocho idiomas, pero no se indica el volumen de datos por idioma ni la calidad de la cobertura; es probable que el rendimiento varíe significativamente entre lenguas.
- Al ser un clasificador basado en características, puede ser vulnerable a ataques adversariales que alteren la distribución de n-gramas o que utilicen técnicas de ofuscación no contempladas en el preprocesamiento.
- La detección de NSFW se limita a imágenes; no se especifica la precisión ni los falsos positivos de este componente.
- No se menciona la existencia de un pipeline de actualización o reentrenamiento continuo; el modelo puede quedar desactualizado frente a nuevas tácticas de spam.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de soporte ni responsabilidad por daños.
- No se proporcionan instrucciones de despliegue para otros runtimes (TensorFlow, PyTorch) ni para aceleración por GPU; el modelo está optimizado exclusivamente para ONNX Runtime en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbhinavMaurya/SpamShield
- Dataset de entrenamiento: https://huggingface.co/datasets/AbhinavMaurya/SpamShield-Datasets
