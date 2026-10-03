# ECE-Software/t0-weapon-int8

## Resumen

t0-weapon-int8 es un modelo de visión por computador para detección de armas, publicado por ECE-Software bajo licencia Apache 2.0. Se distribuye exclusivamente como fichero ONNX cuantizado a INT8 con un tamaño de 3,46 MB y clasifica imágenes en cuatro categorías: arma de fuego (Gun), explosión (explosion), granada (grenade) y cuchillo (knife), con un umbral de decisión fijado en 0,35. No se especifica en la documentación disponible la arquitectura subyacente, el número de parámetros ni el conjunto de datos de entrenamiento.

El propio autor lo posiciona como un "pre-filtro on-device" (tier T0) que se ejecuta sobre el 100 % de las capturas en el dispositivo del usuario, mientras que un segundo modelo FP32 (tier T1) revalida en servidor los positivos. La model card reconoce explícitamente que la versión INT8 pierde aproximadamente un 15 % de las armas que sí detecta la versión FP32, por lo que el modelo está diseñado como primera etapa de un pipeline en cascada y no como clasificador final.

Su relevancia actual es la de un componente de moderación de bajo coste: 3,46 MB permiten ejecutarlo en CPU sin GPU y en dispositivos con recursos muy limitados, algo determinante cuando hay que analizar el 100 % del tráfico de imágenes en lugar de una muestra. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y los metadatos de fecha (creación en 2026) y de tamaño de repositorio (0,0 GB frente a los 3,46 MB declarados) presentan inconsistencias que conviene verificar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el fichero ONNX INT8 de 3,46 MB es compatible con una CNN compacta de clasificación de imágenes) |
| Parámetros totales | no disponible (estimación derivada del tamaño: del orden de 3-3,5 millones de parámetros si el fichero almacena 1 byte por parámetro) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantización | INT8 (única variante publicada en este repositorio; el autor menciona una variante FP32 en el tier T1, no publicada aquí) |
| Idiomas soportados | no aplica / no disponible (entrada de imagen) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (INT8) |
| Modalidad | imagen |
| Tarea | detección / clasificación de armas |
| Clases | Gun, explosion, grenade, knife |
| Umbral de decisión | 0,35 |
| Tier | T0 (pre-filtro on-device) |
| Tamaño del fichero | 3,46 MB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según metadatos) | 2026-10-03 |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura del modelo. Se trata de un artefacto ONNX orientado a inferencia, sin código de entrenamiento, sin configuración de modelo y sin pesos en formato safetensors. Los únicos datos técnicos verificables son el formato (ONNX cuantizado a INT8), el tamaño (3,46 MB) y la firma de salida en cuatro clases. No se indica si es un clasificador de imagen completa, un detector con cajas delimitadoras o un modelo multi-etiqueta; la model card emplea el término "weapon detection" pero el ejemplo de uso únicamente instancia una sesión de ONNX Runtime con `CPUExecutionProvider` y no muestra el post-procesado de las salidas.

Tampoco hay información sobre el volumen de datos de entrenamiento, la composición del dataset, el método de ajuste (RLHF, DPO u otros, poco habituales en visión) ni el proceso de cuantización. Lo único documentado en términos de rendimiento es una pérdida relativa declarada: el INT8 "pierde aproximadamente el 15 % de las armas que captura el FP32", lo que implica que la cuantización reduce la sensibilidad y que el autor compensa ese déficit con una segunda etapa de verificación en servidor. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa ni similares).

## Capacidades

- Clasificación de imágenes en cuatro categorías de amenaza: arma de fuego, explosión, granada y cuchillo.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de GPU ni de CUDA.
- Ejecución on-device: el autor indica que está pensado para correr sobre el 100 % de las capturas en el dispositivo.
- Umbral de decisión configurable a nivel de pipeline: la model card fija 0,35 como valor de referencia.
- Integración en arquitecturas en cascada: actúa como etapa T0 y delega los positivos a un modelo FP32 T1 en servidor.
- No dispone de soporte de tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües ni de procesamiento de texto, audio o vídeo.
- No se documenta modo de pensamiento (thinking mode) ni salida estructurada más allá de las cuatro clases.

## Casos de uso

- Pre-filtrado en aplicaciones móviles de mensajería o redes sociales: el modelo se ejecuta en el propio dispositivo sobre cada imagen que el usuario va a subir o enviar, con un coste de memoria de unos pocos megabytes, y solo los positivos se envían al servidor para revisión. Permite reducir el tráfico y la carga de cómputo en backend al no tener que procesar el 100 % de las imágenes en la nube.
- Moderación de contenido en plataformas UGC: dado que el autor declara que se ejecuta sobre todas las capturas, encaja como primera barrera en pipelines de moderación donde el coste por imagen debe ser mínimo. Los falsos negativos se mitigan con la revalidación FP32 en servidor.
- Vigilancia en dispositivos de borde (cámaras IP, Raspberry Pi, NVR domésticos): el tamaño de 3,46 MB y la ejecución en CPU permiten desplegarlo en hardware sin acelerador, filtrando fotogramas o capturas antes de enviar únicamente los sospechosos a un servidor central.
- Aplicaciones de denuncia ciudadana: en apps donde el usuario fotografía un objeto o situación potencialmente peligrosa, el modelo puede advertir en local antes de la subida, evitando transmitir imágenes sensibles y dando respuesta inmediata sin conexión.
- Detección de armas en control de accesos y escáneres de equipaje de bajo coste: como clasificador de cuatro clases (incluye explosión y granada además de arma blanca y de fuego), puede etiquetar imágenes de rayos X o de cámaras de acceso en una primera pasada y derivar los casos dudosos a un operador o a un modelo mayor.
- Filtrado previo en pipelines de moderación con restricción de latencia: en sistemas donde el presupuesto por imagen es de pocos milisegundos y no hay GPU disponible, un modelo INT8 en CPU es la única opción viable para cubrir el 100 % del volumen; la segunda etapa solo se ejecuta sobre una fracción pequeña de las imágenes.
- Investigación y docencia en cuantización: el par INT8/FP32 con una métrica declarada de degradación (15 %) sirve como caso de estudio reproducible para medir el impacto de la cuantización en tareas de detección de objetos con clases desbalanceadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, mAP, F1 ni latencia, ni comparaciones con otros modelos de detección de armas. El único dato cuantitativo declarado por el autor es la degradación relativa por cuantización:

| Métrica | Valor | Fuente |
|---|---|---|
| Pérdida relativa de detecciones frente a FP32 | ~15 % de las armas que detecta FP32 | Model card del autor |
| Umbral de operación | 0,35 | Model card del autor |
| Precisión / recall / mAP por clase | no disponible | — |
| Latencia / throughput | no disponible | — |
| Tamaño del conjunto de evaluación | no disponible | — |

## Requisitos de hardware

- VRAM/VROM estimada para inferencia: en torno a 3,5 MB para los pesos (3,46 MB de fichero) más el espacio de activaciones y el runtime de ONNX Runtime, que suele dominar el consumo. En la práctica, un despliegue en CPU puede mantenerse por debajo de 100 MB de RSS total, aunque no se publica ninguna medición.
- GPU recomendadas: no aplica como requisito. El ejemplo oficial usa `CPUExecutionProvider`; cualquier GPU compatible con ONNX Runtime (CUDA, TensorRT, DirectML) podría ejecutarlo, pero no se documenta ninguna configuración probada.
- Compatibilidad con GPU de consumo: irrelevante en términos de viabilidad; el modelo cabe en cualquier GPU consumer e incluso en aceleradores de borde. El cuello de botella no es la memoria sino el coste de preprocesado de imagen.
- Despliegue: ONNX Runtime (CPU o GPU), y por extensión cualquier runtime compatible con ONNX como ONNX Runtime Mobile, TensorRT, OpenVINO, DirectML o NCNN tras conversión. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que son específicos de modelos de lenguaje.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por dispositivo ni por resolución de entrada.
- Consideración de memoria: al ser un artefacto de 3,46 MB, es desplegable en dispositivos embebidos con RAM muy limitada, lo que constituye su principal ventaja operativa frente a alternativas FP32.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de arquitectura que permitan una comparación rigurosa. La información de la búsqueda web no contiene referencias al modelo: los resultados obtenidos corresponden a la escuela de ingeniería francesa ECE (École centrale d'électronique), sin relación con el autor del artefacto.

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| t0-weapon-int8 (ECE-Software) | no disponible (~3-3,5 M estimados por tamaño) | no aplica | ONNX INT8, 3,46 MB | apache-2.0 | Solo degradación relativa del ~15 % frente a FP32 |
| Alternativas de detección de armas en borde | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Falsos negativos declarados por el propio autor: falta aproximadamente el 15 % de las armas que detecta la versión FP32. Es un modelo de pre-filtro, no un sistema de seguridad autónomo.
- Cuatro clases únicamente (Gun, explosion, grenade, knife): no cubre otras categorías de amenaza y no se documenta el comportamiento ante clases desconocidas.
- Riesgo de sesgo no evaluado: no se publica la composición del dataset de entrenamiento ni métricas desagregadas por tipo de arma, iluminación, ángulo, resolución o demografía. La precisión puede degradarse de forma desigual entre clases.
- Umbral fijado en 0,35 sin justificación documentada: un umbral bajo o alto desplaza el equilibrio entre falsos positivos y falsos negativos, algo crítico en un dominio sensible. Debe recalibrarse con datos propios.
- Sin métricas de calibración: no hay información sobre si las puntuaciones de salida están calibradas, lo que dificulta fijar umbrales por clase.
- Sin información sobre entrenamiento ni evaluación: no se puede auditar el origen de los datos, la metodología ni la validez de la métrica del 15 %.
- Metadatos inconsistentes: el repositorio muestra 0,0 GB de tamaño frente a los 3,46 MB declarados, y la fecha de creación indicada (2026-10-03) es posterior a la fecha habitual de consulta. Repositorio con 0 descargas y 0 likes, sin señales de uso o validación por terceros.
- Licencia Apache 2.0: permite uso comercial con atribución y sin obligación de liberar derivados, pero al no haber información sobre las licencias de los datos de entrenamiento no puede garantizarse que el modelo esté libre de reclamaciones de terceros.
- Uso en producción de seguridad: no debe emplearse como único mecanismo de decisión en contextos de seguridad física o moderación con consecuencias legales. Requiere la etapa T1 en servidor y supervisión humana.
- Limitación funcional: al ser un clasificador de imagen, no procesa vídeo de forma nativa, no maneja texto y no soporta tool calling ni flujos de agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ECE-Software/t0-weapon-int8
- Fichero de pesos: https://huggingface.co/ECE-Software/t0-weapon-int8/blob/main/model.onnx
- Repositorio de la organización: https://huggingface.co/ECE-Software
- Búsqueda web realizada: sin resultados relevantes. Los resultados devueltos corresponden a la École centrale d'électronique (ECE) y no guardan relación con el autor del modelo:
  - https://www.ece.fr/
  - https://www.ece.fr/programme-grande-ecole-ingenieurs/
  - https://fr.wikipedia.org/wiki/%C3%89cole_centrale_d%27%C3%A9lectronique
  - https://www.omneseducation.com/nos-etablissements/nos-ecoles/ece/
  - https://etudiant.lefigaro.fr/annuaire/ecole-d-ingenieur/25270-ece-ecole-d-ingenieurs-engineering-school/
- Paper, blog técnico o demo: no disponibles.
