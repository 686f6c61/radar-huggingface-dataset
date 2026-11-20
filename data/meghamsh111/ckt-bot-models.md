# Meghamsh111/Ckt-Bot-models

## Resumen

Ckt-Bot Models es un repositorio de pesos de visión por computador publicado por el usuario Meghamsh111 (proyecto asociado a HKU ECE) que agrupa tres artefactos independientes orientados a un pipeline de análisis automático de esquemas de circuitos: un detector de componentes basado en YOLO, el modelo base SAM2.1 en variante large para segmentación, y un modelo de segmentación de conductores ajustado a partir de pesos de terceros (CircuitVision). No se trata de un modelo de lenguaje ni de un modelo único entrenado de extremo a extremo, sino de una colección de checkpoints que alimentan una aplicación mayor (Ckt-Bot) cuya capa de razonamiento y cálculo reside en modelos en la nube y en SymPy/ngspice, no incluidos en el repositorio.

El repositorio tiene un tamaño de 1,8 GB y está etiquetado para tareas de detección de objetos y segmentación de imágenes, con soporte declarado de inglés, cantonés y chino. La relevancia técnica es limitada fuera de su contexto original: el propio autor indica que los pesos por sí solos no constituyen una aplicación funcional y que no se incluyen datos de entrenamiento, ejemplos de circuitos ni credenciales. Además, la model card está marcada explícitamente como material confidencial de propiedad intelectual de HKU ECE, con prohibición de distribución, copia, reubicación o uso comercial sin autorización escrita.

La licencia es mixta: el material propio del proyecto queda bajo términos restrictivos (license: other, con nombre "mixed-project-and-upstream-terms"), mientras que los componentes de terceros (Ultralytics YOLO, Meta SAM2.1, CircuitVision) mantienen sus licencias originales. No se han publicado métricas de rendimiento ni especificaciones de arquitectura detalladas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (colección de tres checkpoints: detector tipo YOLO, SAM2.1 Hiera large y modelo de segmentación finetuneado) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de visión) |
| Tipos de cuantizacion | No disponible (pesos en .pt y .pth, sin versiones cuantizadas publicadas) |
| Idiomas soportados | en, yue, zh (declarados en metadatos; aplicable a la documentación, no a los modelos de visión) |
| Licencia | mixed-project-and-upstream-terms (license: other) |
| Formato de pesos | .pt (PyTorch) y .pth (PyTorch) |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura unificada. Contiene tres artefactos: `yolo26n-final50.pt`, descrito como pesos del detector de componentes de Ckt-Bot y sujeto a los términos de Ultralytics; `sam2.1_hiera_large.pt`, que corresponde a los pesos preentrenados de SAM2.1 de Meta en variante Hiera large; y `circuitvision_finetuned.pth`, un modelo de segmentación de conductores que reutiliza pesos de CircuitVision y que, según la model card, no fue reentrenado por el proyecto Ckt-Bot. Los tres archivos suman 1,82 GB y sus tamaños exactos y hashes SHA-256 se listan en `ARTIFACTS.json`.

No se proporcionan datos sobre el número de tokens, composición del dataset, técnicas de alineación (RLHF/DPO) ni innovaciones de entrenamiento. La model card indica únicamente que se realizó una verificación de instalación completa ejecutando un circuito conocido con respuesta comprobada de forma independiente, y aclara explícitamente que se trata de una comprobación de entrega, no de un benchmark de precisión del detector ni de circuitos no vistos. Tampoco se especifica qué variante exacta de YOLO26 corresponde al checkpoint ni el procedimiento de ajuste aplicado.

## Capacidades

- Detección de componentes de circuito: el checkpoint YOLO está orientado a localizar componentes en imágenes de esquemas eléctricos.
- Segmentación de imágenes: SAM2.1 Hiera large aporta segmentación promptable de propósito general.
- Segmentación de conductores: el modelo finetuneado a partir de CircuitVision está especializado en la separación de cables y conexiones en diagramas de circuitos.
- Integración en pipeline: los tres modelos se ejecutan localmente y alimentan una aplicación que construye relaciones de conectividad, interpreta el esquema con modelos en la nube, calcula con SymPy y verifica con ngspice.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso autónomo ni generación de texto: el repositorio no contiene un modelo de lenguaje.
- Capacidades multilingües: no aplicables a los modelos de visión; los idiomas declarados corresponden a la documentación del proyecto.
- No se declaran modos especiales (thinking, visión general, audio) más allá de la visión por computador descrita.

## Casos de uso

- Digitalización de esquemas eléctricos en papel o PDF: el detector YOLO localiza componentes y el modelo de segmentación de conductores extrae la topología de conexiones, lo que permite reconstruir una representación estructurada del circuito para su posterior análisis.
- Asistencia educativa en electrónica: integrado en Ckt-Bot, el pipeline permite a un estudiante subir una foto de un circuito y obtener una explicación con pasos de cálculo, usando los modelos locales para la percepción y modelos en la nube para el razonamiento.
- Verificación de conectividad: la segmentación de conductores combinada con la detección de componentes permite construir un grafo de nodos y aristas que se puede contrastar con una simulación ngspice para detectar errores de montaje o de dibujo.
- Preprocesado para EDA y documentación técnica: los recortes de componentes y las máscaras de conductores pueden alimentar herramientas de generación de netlists o de documentación de placas existentes.
- Automatización de revisión de diagramas en entornos de investigación: el pipeline permite procesar lotes de esquemas y extraer métricas de estructura (número de componentes, conexiones) sin intervención manual.
- Base para fine-tuning específico de dominio: al ser pesos PyTorch estándar, un equipo con autorización podría reutilizar el detector o el segmentador como punto de partida para su propio conjunto de esquemas, siempre que respete las licencias upstream de Ultralytics, Meta y CircuitVision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que la verificación realizada es una comprobación de entrega de una instalación completa sobre un circuito conocido, no una evaluación de precisión del detector ni una prueba sobre circuitos no vistos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, SAM2.1 Hiera large requiere del orden de varios GB de VRAM en precisión FP16, y un detector tipo YOLO nano es ligero; el repositorio no publica cifras medidas.
- GPU recomendadas: no especificadas por el autor. Por el tamaño de los checkpoints (1,8 GB en total) y la naturaleza de las tareas, es plausible su ejecución en GPU de consumo, pero no hay confirmación oficial.
- GPU de consumo: no confirmado; la model card no detalla requisitos mínimos ni máximas probadas.
- Opciones de despliegue: los pesos son archivos PyTorch (.pt y .pth) cargables con la librería `pytorch`; el repositorio remite a la aplicación Ckt-Bot para el despliegue completo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ckt-Bot Models | Colección de detector YOLO + SAM2.1 + segmentador de conductores | No disponible | No aplica | Mixta, restrictiva (HKU ECE + upstream) | Pesos públicos en HF, uso restringido |
| SAM2.1 (Meta) | Segmentación promptable | No disponible en esta ficha | No aplica | Licencia de Meta (upstream) | Público |
| YOLO (Ultralytics) | Detección de objetos | No disponible en esta ficha | No aplica | AGPL/Ultralytics (upstream) | Público |
| CircuitVision | Segmentación de conductores en circuitos | No disponible en esta ficha | No aplica | Según repositorio original | Público en GitHub |

La comparación directa no es posible con los datos disponibles: Ckt-Bot Models no es un modelo único, sino un empaquetado de pesos de terceros con un fin concreto, y no publica métricas que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Restricciones de licencia severas: la model card prohíbe expresamente distribuir, copiar, filtrar, resubir o vender el material propio del proyecto sin autorización escrita; el uso comercial no está permitido por defecto.
- Licencia mixta con incertidumbre: los pesos de SAM ajustados reutilizan material de CircuitVision y la model card reconoce que el derecho de redistribución independiente de esos pesos no ha sido verificado.
- No es una aplicación completa: los pesos no incluyen el modelo de lenguaje en la nube, los datos de entrenamiento, los ejemplos de circuitos ni las credenciales necesarias para ejecutar Ckt-Bot.
- Sin benchmarks: no hay métricas de precisión, recall, mAP ni IoU publicadas, por lo que no se puede evaluar su rendimiento real frente a alternativas.
- Riesgo de generalización desconocido: la única verificación documentada es sobre un circuito conocido; no hay evidencia sobre circuitos no vistos, estilos de dibujo distintos o imágenes de baja calidad.
- Sin información de sesgos: al ser modelos de visión especializados, no se documentan sesgos de dominio, pero tampoco se analiza su comportamiento fuera de los esquemas de circuitos.
- Idiomas declarados no aplicables al modelo: en, yue y zh figuran en los metadatos, pero los modelos de visión no procesan texto; la relevancia lingüística se limita a la documentación y a la interfaz del proyecto.
- Advertencia legal explícita: la model card menciona posibles acciones civiles bajo la Copyright Ordinance de Hong Kong (Cap. 528) y marcos internacionales (Convenio de Berna, ADPIC, Tratado de la OMPI) en caso de uso no autorizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Meghamsh111/Ckt-Bot-models
- Licencia completa: https://huggingface.co/Meghamsh111/Ckt-Bot-models/blob/main/LICENSE.md
- Artefactos y hashes: https://huggingface.co/Meghamsh111/Ckt-Bot-models/blob/main/ARTIFACTS.json
- Avisos de terceros: https://huggingface.co/Meghamsh111/Ckt-Bot-models/tree/main/notices
- Repositorio de la aplicación Ckt-Bot: https://github.com/meghamshb/Ckt-Bot
- Guía de ejecución: https://github.com/meghamshb/Ckt-Bot/blob/main/run.md
- CircuitVision (origen de los pesos finetuneados): https://github.com/JKc66/CircuitVision
- Copyright Ordinance de Hong Kong (Cap. 528): https://www.elegislation.gov.hk/hk/cap528
- Convenio de Berna (OMPI): https://www.wipo.int/wipolex/en/text/283698
- Acuerdo ADPIC (OMC): https://www.wto.org/english/docs_e/legal_e/trips_e.htm
- Tratado de la OMPI sobre Derecho de Autor: https://www.wipo.int/wipolex/en/text/295166
- Guía de copyright del gobierno de Hong Kong: https://www.ipd.gov.hk/en/copyright/what-is-copyright/index.html
- Política de propiedad intelectual de HKU: https://www.rss.hku.hk/contracts/ipr
