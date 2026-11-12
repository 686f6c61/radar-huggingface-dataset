# simanto848/qwen-microgravity-flammability

## Resumen

`simanto848/qwen-microgravity-flammability` es un adaptador LoRA de clasificación de texto construido sobre el modelo base `Qwen/Qwen3-0.6B`. Lo desarrolla el usuario simanto848 en el marco del NASA Space Apps Challenge (proyecto *ShunnoShikha AI / Flaming Fire Fall*) y su propósito es predecir el régimen de propagación de llama en condiciones de microgravedad a partir de parámetros físicos de una misión espacial: material, espesor del combustible, velocidad de flujo de aire forzado, concentración de oxígeno, presión de cabina, un proxy del número de Damköhler y un índice de pérdida radiativa.

El modelo resuelve un problema de clasificación multiclase con tres etiquetas: combustión sostenida (clase 0), extinción radiativa (clase 1) y desprendimiento o *blowoff* (clase 2). En microgravedad no existe convección natural boyante, de modo que la propagación depende del flujo forzado y del balance entre cinética química y pérdidas térmicas; el adaptador traduce esa descripción física en una de las tres categorías.

Es relevante como ejemplo de adaptación de un LLM pequeño (0,6 mil millones de parámetros) a una tarea científica vertical mediante PEFT, con un coste de despliegue muy bajo. La información pública disponible es escasa: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, y no se detallan hiperparámetros de entrenamiento, composición exacta del dataset ni procedencia de las etiquetas más allá de la referencia a registros de vuelo de la NASA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificación de secuencia y adaptador LoRA (PEFT) |
| Parametros totales | 0,6 mil millones en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen3-0.6B, valor no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre el modelo base) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre el modelo base se añade una cabeza de clasificación de secuencia (`AutoModelForSequenceClassification`) con tres etiquetas, y el ajuste se realiza mediante Low-Rank Adaptation, lo que congela los pesos originales y entrena únicamente matrices de bajo rango. El pipeline declarado es `text-classification` y la librería `peft`.

El entrenamiento se apoya en registros de vuelo del NASA Physical Science Informatics: BASS/BASS-II (Burning and Suppression of Solids a bordo de la ISS), Saffire (ensayos de seguridad contra incendios a gran escala en vehículos Cygnus) y FLEX (Flame Extinction Experiment). El autor indica que las etiquetas están "reconciliadas con la física" para ser consistentes con las fronteras empíricas de extinción por número de Damköhler y por pérdida radiativa. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, la proporción de cada clase ni si hubo ajuste por RLHF o DPO; tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto en tres clases: combustión sostenida, extinción radiativa y *blowoff*.
- Interpretación de prompts estructurados con parámetros físicos (material, espesor, velocidad de flujo, oxígeno, presión, proxies adimensionales).
- Predicción de régimen de propagación de llama en microgravedad a partir de descripciones textuales de condiciones de misión.
- Salida de logits y probabilidades por clase mediante `softmax`, apta para umbralización o análisis de incertidumbre.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de *tool calling*, function calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.

## Casos de uso

- Evaluación de seguridad contra incendios en diseño de experimentos: dado un conjunto de condiciones de atmósfera de cabina y geometría de combustible, el modelo clasifica el régimen esperado y permite descartar configuraciones con riesgo de combustión sostenida antes de un ensayo en la ISS.
- Planificación de experimentos de combustión en microgravedad: integrado en una herramienta que barre combinaciones de velocidad de flujo y concentración de oxígeno para localizar las fronteras entre *blowoff* y extinción radiativa.
- Triaje de registros de vuelo: clasificación automática de entradas de BASS-II, Saffire o FLEX en categorías de régimen para su etiquetado y análisis posterior, gracias al bajo coste de inferencia de un modelo de 0,6B.
- Asistente de documentación técnica: un pipeline que recibe la ficha de una misión en lenguaje natural y devuelve la clase de régimen junto con las probabilidades, útil para revisión por pares interna.
- Prototipado educativo y demos de hackathon: al ser un adaptador LoRA sobre un modelo pequeño, se puede desplegar en una GPU de consumo o incluso en CPU para demostraciones interactivas del NASA Space Apps Challenge.
- Módulo de validación cruzada en simulaciones CFD de llama: el clasificador puede actuar como comprobación rápida de coherencia física frente a los resultados de un solver, señalando discrepancias entre la simulación y las fronteras empíricas.
- Filtrado previo en pipelines de datos científicos: descartar o priorizar registros de combustión según el régimen predicho antes de un análisis más costoso.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Predicción de régimen de inflamabilidad en microgravedad | NASA BASS-II & Saffire Microgravity Combustion Dataset | Test accuracy | 0,9971 |
| Predicción de régimen de inflamabilidad en microgravedad | NASA BASS-II & Saffire Microgravity Combustion Dataset | Macro F1 | 0,9968 |

Desglose por clase declarado en la model card:

| Régimen | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Sustained Burn | 0,988 | 1,000 | 0,994 | 85 |
| Radiative Extinction | 1,000 | 0,993 | 0,996 | 137 |
| Blowoff | 1,000 | 1,000 | 1,000 | 119 |
| Media macro | 0,996 | 0,998 | 0,997 | 341 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,2 GB solo para los pesos del modelo base de 0,6B, más el adaptador LoRA y el tokenizador; en cuantización de 8 bits o 4 bits el consumo sería inferior, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. Para lotes grandes, una A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante con suficiente VRAM) e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada en la model card. Al ser un adaptador LoRA, se puede fusionar con el modelo base y exportar a otros formatos, pero no se proporcionan artefactos GGUF ni integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo se apoya en `Qwen/Qwen3-0.6B` (transformer decoder-only, licencia Apache 2.0), pero no se han publicado comparaciones de rendimiento frente a otros clasificadores de regímenes de combustión ni frente a adaptadores LoRA similares.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| simanto848/qwen-microgravity-flammability | 0,6B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks (accuracy 0,9971, macro F1 0,9968) están declarados por el autor y marcados como no verificados; no hay validación independiente.
- El conjunto de test es pequeño (341 muestras) y las clases están desbalanceadas (85, 137 y 119 ejemplos), lo que limita la robustez estadística de las métricas.
- El modelo clasifica únicamente tres regímenes predefinidos; no cubre otros fenómenos de combustión ni condiciones fuera del dominio de BASS-II, Saffire y FLEX.
- Depende críticamente de que el prompt incluya los parámetros físicos en el formato esperado; variaciones en la redacción o campos ausentes pueden degradar la predicción.
- Idioma limitado al inglés según la model card.
- Riesgo de alucinación y de sobreajuste a los patrones del dataset de entrenamiento: las etiquetas "reconciliadas con la física" no han sido auditadas de forma pública.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo entrenado sobre datos físicos de la NASA, su aplicabilidad fuera de ese dominio es incierta.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B debe verificarse por separado para confirmar compatibilidad.
- No hay información sobre cuantizaciones publicadas, latencia, throughput ni soporte en motores de inferencia de alto rendimiento.
- El repositorio no tiene descargas ni likes, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simanto848/qwen-microgravity-flammability
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- NASA Space Apps Challenge: https://www.spaceappschallenge.org/
- NASA Physical Science Informatics (PSI): https://psi.nasa.gov/
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
