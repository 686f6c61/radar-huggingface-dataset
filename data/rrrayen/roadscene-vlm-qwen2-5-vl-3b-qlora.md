# RRRayen/RoadScene-VLM-Qwen2.5-VL-3B-QLoRA

## Resumen

RoadScene-VLM-Qwen2.5-VL-3B-QLoRA es un adaptador QLoRA publicado por el usuario RRRayen sobre el modelo multimodal Qwen/Qwen2.5-VL-3B-Instruct. No es un modelo completo, sino un conjunto de pesos LoRA que se carga sobre el modelo base para especializarlo en una tarea muy concreta: dada una imagen de escena viaria, devolver un objeto JSON estricto con el clima, el momento del día, el tipo de escena y el recuento de coches, autobuses, camiones, peatones, semáforos y señales de tráfico.

El adaptador se entrenó sobre un piloto pequeño derivado de BDD100K (800 imágenes de entrenamiento, 100 de validación y 200 de test) durante una única época, con cuantización 4-bit NF4 y doble cuantización. El interés del experimento no está en el rendimiento absoluto, sino en demostrar que un ajuste LoRA muy ligero (r=16, alpha=32, solo proyecciones de atención) basta para pasar de una tasa de JSON válido del 0,0 % a un 100,0 % y para reducir el error absoluto medio del recuento de coches de 7,00 a 3,14 en el conjunto de test congelado.

Se trata, en palabras del propio autor, de un experimento piloto y no de un modelo de conducción autónoma listo para producción. El repositorio no declara licencia, idiomas soportados ni número de parámetros del adaptador, y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, por lo que no existe validación externa de sus resultados. Como modelo base, Qwen2.5-VL-3B-Instruct es un transformer visión-lenguaje de aproximadamente 3 000 millones de parámetros, lo que sitúa el conjunto dentro del rango ejecutable en GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre un transformer visión-lenguaje (Qwen2.5-VL-3B-Instruct); rango 16, alpha 32, dropout 0,05, módulos objetivo q_proj, k_proj, v_proj y o_proj |
| Parametros totales | No disponible para el adaptador (el repositorio no lo declara); el modelo base tiene aproximadamente 3 000 millones |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (no se especifica en la model card; la hereda del modelo base, no confirmada en la información proporcionada) |
| Tipos de cuantizacion | Entrenamiento con cuantización 4-bit NF4 y doble cuantización activada, compute dtype BF16; el adaptador se distribuye sin cuantizar en safetensors. No se publican versiones GGUF ni AWQ/GPTQ |
| Idiomas soportados | No disponible (las etiquetas JSON de salida están en inglés, pero no se declaran capacidades multilingües del adaptador) |
| Licencia | No disponible para el adaptador; el autor remite a los términos del modelo base Qwen/Qwen2.5-VL-3B-Instruct |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, library_name: peft) |

## Arquitectura y entrenamiento

El adaptador no modifica la arquitectura del modelo base: Qwen2.5-VL-3B-Instruct es un transformer multimodal con un codificador visual acoplado a un decodificador de lenguaje, y aquí se congela por completo. El ajuste se aplica únicamente a las proyecciones de atención (q_proj, k_proj, v_proj y o_proj) mediante LoRA de rango 16 y alpha 32, con dropout de 0,05, lo que deja el backbone visual intacto, tal y como reconoce el propio autor en la sección de limitaciones. El entrenamiento usó 4-bit NF4 con doble cuantización y tipo de cómputo BF16, tasa de aprendizaje 1e-4, tamaño de lote efectivo 8, una sola época y una GPU NVIDIA A100.

El conjunto de datos es un piloto derivado de BDD100K con particiones de 800/100/200 imágenes. La tarea se formula como generación image-text-to-text con salida JSON estricta que incluye nueve campos: weather, time_of_day, scene, cars, buses, trucks, pedestrians, traffic_lights y traffic_signs. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.); el único mecanismo destacable es el propio pipeline QLoRA de ajuste eficiente en parámetros sobre un modelo multimodal.

## Capacidades

- Generación de JSON estricto: el adaptador pasa de un 0,0 % de salidas JSON válidas en el modelo base a un 100,0 % en el conjunto de test congelado.
- Clasificación de clima a partir de la imagen (por ejemplo, "overcast"), con una precisión del 68,0 % frente al 45,5 % del base.
- Clasificación del momento del día (por ejemplo, "daytime"), con un 90,5 % de precisión.
- Clasificación del tipo de escena (por ejemplo, "city street"), con un 80,5 % de precisión.
- Recuento de vehículos: coches, autobuses y camiones, con un MAE de 3,14 para coches y una correlación de Spearman de 0,764.
- Recuento de peatones, semáforos y señales de tráfico dentro del mismo esquema JSON.
- Comprensión multimodal imagen-texto heredada del modelo base: el adaptador conserva la capacidad de procesar imágenes, aunque no se documenta su comportamiento fuera de la tarea de escena viaria.
- No se declara soporte verificado de tool calling, function calling, uso agéntico, modo thinking ni capacidades de audio en el adaptador. Cualquier capacidad de este tipo sería la heredada del modelo base y no está validada en este repositorio.
- Capacidades multilingües: no disponibles; las etiquetas del JSON de salida están en inglés.

## Casos de uso

- Etiquetado automático de datasets de conducción: el adaptador puede preanotar imágenes tipo BDD100K con clima, franja horaria y recuentos de objetos, generando un JSON parseable directamente que después se revisa de forma manual. Es adecuado porque el formato de salida es estricto y consistente, aunque el autor advierte de sesgo hacia la clase mayoritaria en escenas.
- Filtrado y triaje de grandes volúmenes de imágenes viarias: al devolver clima y momento del día de forma estructurada, permite seleccionar subconjuntos equilibrados (por ejemplo, extraer las imágenes nocturnas o con lluvia) antes de entrenar otros modelos.
- Análisis de densidad de tráfico aproximada: el recuento de coches, autobuses y camiones sirve para estimar ocupación de vía en estudios exploratorios, con la advertencia de que el MAE de 3,14 coches es demasiado alto para aplicaciones críticas de seguridad.
- Monitorización urbana de señalización: el recuento de semáforos y señales de tráfico puede emplearse para auditar inventarios de mobiliario urbano a partir de imágenes de cámara, siempre con verificación humana posterior.
- Investigación académica sobre QLoRA multimodal: el repositorio documenta de forma reproducible la configuración completa (rango, alpha, módulos objetivo, learning rate, GPU) y los resultados congelados base vs adaptador, lo que lo convierte en un punto de partida útil para experimentos comparativos de ajuste eficiente.
- Generación de datos sintéticos etiquetados para prototipos: el JSON estructurado puede alimentar pipelines de simulación o de anotación débil en fases tempranas de desarrollo, donde la exactitud perfecta no es requisito.
- Asistencia a la conducción a nivel de percepción descriptiva: como módulo de descripción de escena en un sistema mayor, aportando metadatos de contexto (clima, luz, tipo de vía) que otros módulos usan para ajustar umbrales. No debe usarse como fuente única de decisión.
- Docencia y demostraciones de visión-lenguaje: su tamaño (base de 3 000 millones de parámetros) permite desplegarlo en una GPU de consumo para prácticas de fine-tuning multimodal.

## Benchmarks y rendimiento

Resultados del conjunto de test congelado (200 imágenes), tal y como los publica el autor:

| Metrica | Base | QLoRA |
|---|---:|---:|
| Precisión de clima (accuracy) | 45,5 % | 68,0 % |
| Macro-F1 de clima | 0,380 | 0,496 |
| Precisión de momento del día | 89,0 % | 90,5 % |
| Macro-F1 de momento del día | 0,465 | 0,568 |
| Precisión de escena | 80,0 % | 80,5 % |
| Macro-F1 de escena | 0,737 | 0,804 |
| Tasa de JSON bruto válido | 0,0 % | 100,0 % |
| MAE de recuento de coches | 7,00 | 3,14 |
| Spearman de recuento de coches | 0,517 | 0,764 |

El autor indica además que el sesgo de predicción del recuento de coches pasó de -7,00 a +0,48, y que el adaptador superó a las líneas base de media y mediana independientes de la imagen, lo que sugiere que la mejora no se explica solo por aprender el recuento medio del dataset. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de visión-lenguaje en la información disponible.

## Requisitos de hardware

- El autor entrenó el adaptador en una NVIDIA A100; no se especifica el número de unidades ni la VRAM exacta utilizada.
- Inferencia del modelo base en BF16: aproximadamente 6 GB solo de pesos (3 000 millones de parámetros), más overhead de activaciones y caché KV; en la práctica conviene contar con 8-10 GB de VRAM.
- Inferencia con el base cuantizado en 4 bits: alrededor de 2,5-3 GB de pesos, lo que lo hace viable en GPU de consumo con 6-8 GB.
- GPU de consumo compatibles (estimación): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB o menos es recomendable cuantizar el modelo base.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador (es la vía documentada por el repositorio), vLLM o TGI para servir el modelo base con soporte multimodal, y llama.cpp/Ollama solo si se genera previamente una versión GGUF, que no se publica en este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por imagen.
- El repositorio pesa 0,0 GB según HuggingFace, coherente con un adaptador pequeño, pero no se declara el recuento exacto de parámetros entrenables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el test del piloto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoadScene-VLM-Qwen2.5-VL-3B-QLoRA | Base de ~3 000 M más adaptador LoRA no cuantificado | No disponible | JSON válido 100,0 %; MAE coches 3,14; clima 68,0 % | No disponible (remite al base) | HuggingFace, 0 descargas |
| Qwen2.5-VL-3B-Instruct (base, sin ajustar) | ~3 000 M | No disponible en esta información | JSON válido 0,0 %; MAE coches 7,00; clima 45,5 % | La del repositorio upstream | HuggingFace |
| Otros adaptadores QLoRA sobre Qwen2.5-VL-3B para escenas viarias | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información proporcionada |

La búsqueda web realizada no devolvió resultados relacionados con el modelo ni con adaptadores equivalentes de escena viaria, por lo que no es posible establecer una comparativa con alternativas de la misma categoría más allá del propio modelo base.

## Limitaciones y advertencias

- El propio autor califica el trabajo como experimento piloto y no como modelo de conducción autónoma listo para producción.
- El dataset está fuertemente desequilibrado y varias clases raras tienen representación insuficiente en el conjunto de test natural, por lo que las métricas de esas clases no son fiables.
- La clasificación de escena muestra un sesgo creciente hacia la clase mayoritaria "city street" tras el ajuste: la precisión apenas mejora (80,5 % frente a 80,0 %) mientras el Macro-F1 sube solo por mejoras en clases concretas, lo que indica sobreajuste a la distribución del piloto.
- El backbone visual no se ajustó; solo se entrenaron las proyecciones de atención, lo que limita la capacidad del modelo para aprender representaciones visuales nuevas.
- Solo se evaluó una configuración QLoRA principal, de modo que el experimento no establece un ajuste de hiperparámetros óptimo ni permite afirmar que r=16 y alpha=32 sean los valores idóneos.
- Riesgo de alucinación en los recuentos: aunque el MAE de coches bajó a 3,14, sigue siendo un error elevado para decisiones de seguridad, y el sesgo residual es de +0,48 (ligera sobreestimación).
- Con solo una época de entrenamiento y 800 imágenes, la generalización a dominios distintos (otras ciudades, otras cámaras, climas no vistos) no está demostrada.
- La licencia del adaptador no está declarada. Antes de cualquier uso comercial es obligatorio revisar los términos del modelo base Qwen/Qwen2.5-VL-3B-Instruct y aclarar la situación del adaptador con el autor.
- No se declaran idiomas soportados ni longitud de contexto; el comportamiento fuera del inglés en las etiquetas JSON no está verificado.
- Sin descargas ni likes, el repositorio carece de validación independiente; los resultados publicados no han sido replicados por terceros.
- No debe utilizarse como componente de seguridad crítica en vehículos, sistemas de frenado o alertas de colisión.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/RRRayen/RoadScene-VLM-Qwen2.5-VL-3B-QLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de referencia citado por el autor (BDD100K): https://bdd-data.berkeley.edu/
- Búsqueda web realizada: no se han encontrado enlaces relevantes sobre este modelo, su paper, su demo ni adaptadores comparables. Los únicos resultados devueltos corresponden a guías de un campeón del videojuego League of Legends, sin ninguna relación con el modelo.
