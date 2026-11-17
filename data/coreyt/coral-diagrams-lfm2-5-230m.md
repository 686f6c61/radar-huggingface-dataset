# coreyt/coral-diagrams-lfm2.5-230m

## Resumen

Coral diagrams es un modelo experimental de generación de texto derivado de LiquidAI/LFM2.5-230M, afinado por el desarrollador coreyt para una tarea muy concreta: editar diagramas de flujo dentro del editor Coral. El modelo recibe una descripción compacta del diagrama y una petición en inglés natural, y devuelve un plan de edición breve, una pregunta de aclaración o una negativa. No es un modelo de propósito general, sino un componente especializado que el editor invoca de forma opcional en el navegador.

La relevancia del modelo está en su planteamiento on-device: se distribuye en formato ONNX con pesos de 4 bits (Q4) para ejecutarse con Transformers.js y WebGPU directamente en el navegador, sin enviar datos a ningún servidor. Con unos 230 millones de parámetros y un tamaño de repositorio de 0,2 GB, está pensado para equipos de consumo sin GPU dedicada de gama alta.

El estado declarado por el autor es experimental, con rendimiento de nivel alfa: el modelo puede añadir, eliminar o inventar ediciones, y toda propuesta debe revisarse antes de aplicarse. La licencia es la LFM Open License v1.0, no la Apache-2.0 del editor Coral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5-230M; la model card no detalla la arquitectura interna) |
| Parametros totales | 230 millones (según el nombre y el modelo base LFM2.5-230M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (Q4) en formato ONNX |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | ONNX (Transformers.js, WebGPU) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M y se ha sometido a un ajuste supervisado completo (full supervised fine-tuning) sobre ejemplos verificados de edición de diagramas. La model card no detalla la arquitectura interna del modelo base ni la composición exacta del dataset de ajuste, más allá de indicar que los ejemplos son ediciones de diagramas validadas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

La innovación principal no está en la arquitectura, sino en el pipeline de despliegue: los pesos se exportan a ONNX cuantizados a 4 bits para ejecutarse con Transformers.js y WebGPU en el navegador. El modelo opera como un componente de un sistema con verificación externa: el editor Coral valida cada respuesta, muestra el cambio propuesto para revisión y no aplica nada hasta que el usuario lo confirma.

## Capacidades

- Generación de planes de edición de diagramas de flujo a partir de una descripción compacta del diagrama y una petición en inglés natural.
- Interpretación de peticiones cortas en inglés natural (de 1 a 4 ediciones), con mejor rendimiento en ese rango.
- Formulación de preguntas de aclaración cuando la petición es ambigua.
- Negativa a realizar peticiones fuera de alcance.
- Ejecución en el navegador mediante Transformers.js y WebGPU, sin envío de datos a servidores.
- Soporte exclusivo del inglés.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Edición asistida de diagramas de flujo en Coral: el usuario describe un cambio en inglés y el modelo devuelve un plan de edición que el editor presenta para revisión antes de aplicarlo.
- Procesamiento local en el navegador con privacidad por diseño: al ejecutarse en WebGPU sin llamadas a servidor, es adecuado para entornos donde el contenido de los diagramas no puede salir del dispositivo.
- Prototipado de interfaces de edición por lenguaje natural: sirve como referencia para integrar modelos pequeños cuantizados en editores gráficos con verificación humana obligatoria.
- Filtrado y aclaración de peticiones: el modelo puede pedir aclaraciones o rechazar peticiones fuera de alcance antes de que el editor intente aplicar cambios.
- Demostraciones educativas de inferencia on-device: con un repositorio de 0,2 GB y un pico de memoria de unos 1,2 GB, es viable en portátiles convencionales para mostrar pipelines de IA local en el navegador.
- Evaluación de flujos con revisión humana: útil en entornos de investigación para medir la tasa de aceptación de propuestas generadas por un modelo de 230M en tareas acotadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Peticiones cortas en inglés natural (1–4 ediciones) superadas | 191 de 209 |
| Pico de memoria durante la ejecución | ~1,2 GB |
| Entorno de medida | estación de trabajo, navegador, cuantización Q4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en navegador con WebGPU; pico de memoria medido de aproximadamente 1,2 GB durante el trabajo.
- Tamaño del repositorio de 0,2 GB, lo que facilita la descarga y el almacenamiento local.
- No requiere GPU de servidor: está diseñado para ejecutarse en el dispositivo del usuario a través de Transformers.js.
- Opciones de despliegue documentadas: Transformers.js con ONNX y WebGPU. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| coreyt/coral-diagrams-lfm2.5-230m | 230M | no disponible | ONNX Q4 | LFM Open License v1.0 | Edición de diagramas en navegador |
| LiquidAI/LFM2.5-230M | 230M | no disponible | no disponible | no disponible | Modelo base de propósito general |
| Otros modelos pequeños on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de rendimiento comparativos con otras alternativas en la información disponible.

## Limitaciones y advertencias

- Estado experimental con rendimiento de nivel alfa: el modelo puede añadir, eliminar o inventar ediciones; toda propuesta debe revisarse.
- Rendimiento más débil en peticiones largas; la medida de 191/209 corresponde a peticiones cortas de 1 a 4 ediciones.
- Solo soporta inglés.
- Uso previsto restringido a la función opcional de edición on-device del editor Coral; no está pensado como modelo de propósito general.
- Licencia LFM Open License v1.0: los pesos no están cubiertos por la Apache-2.0 de Coral; deben revisarse las condiciones de la licencia antes de cualquier uso comercial o redistribución.
- No se documentan sesgos específicos, pero al derivar de un modelo base de propósito general puede heredar sesgos de este.
- Riesgo de alucinación en las ediciones propuestas, mitigado parcialmente por la verificación del editor y la confirmación del usuario.
- No se documentan la longitud de contexto ni los detalles de arquitectura del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coreyt/coral-diagrams-lfm2.5-230m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Editor Coral: https://github.com/coreyt/coral
