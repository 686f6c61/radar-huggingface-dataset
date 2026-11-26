# n10046793/lab09-bike-share-ticket-router

## Resumen

El modelo `n10046793/lab09-bike-share-ticket-router` es un clasificador de texto en inglés obtenido por ajuste fino (*fine-tuning*) de DistilBERT sobre un conjunto de datos sintético de mensajes de soporte al cliente de una empresa ficticia de bicicletas compartidas, Lakeshore Bike Share. Su función concreta es enrutar cada mensaje entrante hacia una de cuatro colas de atención: facturación (`billing`), avería de bicicleta (`bike_fault`), estación (`station`) y cuenta (`account`). Se trata de un modelo de laboratorio, con cero descargas y cero *likes* en el momento de la consulta, publicado bajo licencia MIT.

Arquitectura y tamaño son los de DistilBERT base: un transformer encoder destilado de BERT, con 66.956.548 parámetros totales según los pesos en safetensors y un repositorio de 0,3 GB. No dispone de ventana de contexto declarada en la model card más allá de la del modelo base (habitualmente 512 tokens en DistilBERT), y su vocabulario y tokenizador son los de `distilbert-base-uncased`.

Su relevancia es limitada fuera del ámbito docente: sirve como ejemplo reproducible de pipeline de clasificación con DistilBERT, de comparación frente a una línea base TF-IDF más regresión logística y de discusión sobre los riesgos de entrenar con datos generados por plantillas. No es un modelo apto para producción real sin un conjunto de datos recogido de clientes reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT base) |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la del modelo base DistilBERT es de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT base, y se ajusta como cabeza de clasificación de secuencias con cuatro etiquetas de salida. No se documenta en la model card ningún cambio arquitectónico adicional, ni el uso de atención lineal, decodificación especulativa u otras innovaciones.

Los datos de entrenamiento son íntegramente sintéticos: un script en Python (`tickets_data.py`) combina plantillas de frases por cola con topónimos de Toronto e introduce ruido controlado (aproximadamente un 12 % de mensajes vagos, un 10 % que mezclan dos temas y un 8 % con errores tipográficos). El reparto es de 720 mensajes de entrenamiento, 240 de validación y 240 de test, procedentes de una única partición estratificada, más 40 mensajes redactados aparte y usados una sola vez al final como comprobación con redacción nueva. No se indica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (en un clasificador de este tipo no serían el mecanismo habitual).

## Capacidades

- Clasificación de texto en inglés en cuatro categorías cerradas: `billing`, `bike_fault`, `station` y `account`.
- Enrutamiento de mensajes cortos de soporte al cliente hacia la cola correspondiente.
- Manejo razonable de mensajes vagos, con dos temas mezclados o con errores tipográficos, gracias al ruido introducido durante el entrenamiento.
- Inferencia rápida y de bajo coste computacional por el tamaño reducido del modelo (66,9 M de parámetros).
- No dispone de generación de texto libre, razonamiento multi paso, matemáticas, código, visión ni audio.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de modo de razonamiento (*thinking mode*).
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Enrutamiento de tickets de soporte en una mesa de ayuda: el modelo recibe el texto del mensaje y devuelve la cola probable, de modo que el sistema de ticketing asigna automáticamente el caso al equipo de facturación, mantenimiento, estaciones o cuentas. Es adecuado por su latencia baja y su tamaño reducido, aunque requiere revisión humana.
- Triaje previo en un chatbot de atención al cliente: antes de invocar un agente conversacional, el clasificador decide el flujo y evita que un mensaje de facturación acabe en el equipo de mantenimiento.
- Etiquetado asistido de históricos de tickets: se puede ejecutar en lote sobre un corpus de mensajes para proponer etiquetas iniciales que un humano corrija, reduciendo el coste de anotación.
- Filtro de priorización en colas de soporte: combinado con reglas de negocio, permite separar averías de bicicleta (potencialmente urgentes) del resto de consultas.
- Docencia y reproducción de pipelines de NLP: sirve como ejemplo completo de ajuste fino de DistilBERT con partición estratificada, línea base TF-IDF y conjunto de comprobación independiente.
- Comparación de arquitecturas en experimentos académicos: su rendimiento frente a una regresión logística con TF-IDF (0,900 frente a 0,846 de exactitud) lo convierte en una referencia útil para estudiar cuándo un transformer pequeño aporta ventaja sobre modelos lineales.
- Prototipado rápido en local: al ocupar 0,3 GB, se puede cargar en una CPU convencional para validar una idea de enrutamiento antes de invertir en datos reales.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Exactitud (*accuracy*) | 0,900 | Test retenido de 240 mensajes |
| F1 macro | 0,903 | Test retenido de 240 mensajes |
| Exactitud, línea base TF-IDF + regresión logística | 0,846 | Test retenido de 240 mensajes |
| Exactitud, línea base de clase mayoritaria | 0,292 | Test retenido de 240 mensajes |
| Exactitud en 40 mensajes de comprobación redactados aparte | 0,900 | Conjunto de comprobación independiente |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,27 GB solo para pesos, más el *overhead* de activaciones y del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobradamente suficiente. En entornos de servidor, A100 o H100 no aportan ventaja relevante para este tamaño.
- Cabe en cualquier GPU consumer y también en CPU y en dispositivos de borde.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o exportación a GGUF para `llama.cpp` (no documentada por el autor). vLLM y TGI están orientados a modelos generativos y no son la vía natural para este clasificador.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n10046793/lab09-bike-share-ticket-router | 66,9 M | no disponible (base: 512 tokens) | Clasificación en 4 colas de soporte | MIT | Hugging Face, 0 descargas |
| distilbert-base-uncased (modelo base) | 66,4 M | 512 tokens | Modelo de lenguaje enmascarado, ajustable | Apache 2.0 | Hugging Face, ampliamente usado |
| TF-IDF + regresión logística (línea base del autor) | no aplica | no aplica | Clasificación en 4 colas de soporte | no aplica | Implementación propia |
| BERT base uncased | 110 M | 512 tokens | Modelo de lenguaje enmascarado, ajustable | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (clasificadores de tickets de soporte ajustados) no está disponible: no se han identificado en la información proporcionada otros modelos públicos entrenados sobre el mismo esquema de cuatro colas.

## Limitaciones y advertencias

- Los datos de entrenamiento son inventados por plantillas; el modelo solo ha visto esa redacción más 40 mensajes de comprobación, por lo que el rendimiento con mensajes reales de clientes (jerga, quejas, vocabulario no contemplado) será previsiblemente inferior al 0,900 reportado.
- Alrededor del 12 % de los mensajes de entrenamiento son vagos y no asignables a ninguna cola por su texto, lo que impone un techo estructural a la exactitud.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas con alta confianza sobre entradas fuera de distribución.
- Solo admite inglés; no se ha entrenado ni evaluado en otros idiomas.
- Sesgos conocidos: no documentados por el autor; al ser datos sintéticos con topónimos de Toronto, el modelo puede estar sesgado hacia ese vocabulario y fallar con referencias geográficas distintas.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor advierte explícitamente de que no debe usarse para tomar decisiones sobre un cliente sin revisión humana del mensaje.
- No apto para producción real sin un conjunto de datos recogido de clientes y una reevaluación completa; el propio autor lo describe como una ayuda de enrutamiento para un responsable de soporte.
- No se documentan métricas por clase (precisión, recall, F1 por cola), por lo que se desconoce si el rendimiento es homogéneo entre las cuatro categorías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n10046793/lab09-bike-share-ticket-router
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
