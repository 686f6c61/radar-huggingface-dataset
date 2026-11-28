# PSompong/llama-hredd-adverse-text-distilbert-onnx

## Resumen

`llama-hredd-adverse-text-distilbert-onnx` es un clasificador de texto compacto desarrollado por el usuario PSompong, diseñado para detectar indicios de vulneraciones de derechos humanos y daños medioambientales en textos de medios adversos y alegaciones, en el contexto de la diligencia debida de proveedores (HREDD, *Human Rights and Environmental Due Diligence*). El modelo es un estudiante DistilBERT destilado de un profesor Llama 3.3 70B y cuantizado a int8 en formato ONNX, lo que le permite ejecutarse íntegramente en el navegador mediante transformers.js sin clave de API ni servidor.

La arquitectura subyacente es DistilBERT base (uncased), un transformer encoder de 6 capas y aproximadamente 66 millones de parámetros, sobre el que se ha añadido una cabeza de clasificación de 16 clases que cubren categorías como trabajo forzoso, trabajo infantil, vertidos tóxicos, deforestación o represalias. El modelo emite una categoría de daño, no un nivel de riesgo: la asignación de tier (Low/Medium/High/Critical) se realiza aguas abajo mediante una rúbrica de severidad en la herramienta de cribado.

Su relevancia radica en su ligereza y despliegue offline: con un repositorio de 0,1 GB y pesos int8, puede integrarse en flujos de cribado masivo de proveedores en el navegador. No obstante, el propio autor lo posiciona explícitamente como una ayuda al cribado, no como un veredicto, y sus métricas de detección son moderadas (accuracy global de 0,667–0,70 en conjuntos gold de 30 y 60 casos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas) con cabeza de clasificación de 16 clases |
| Parametros totales | no disponible (DistilBERT base: ~66 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base: 512 tokens, dato no confirmado en la información proporcionada) |
| Tipos de cuantizacion | int8 (ONNX quantized, `onnx/model_quantized.onnx`); no se distribuye fp32 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (int8 cuantizado); tokenizer y `label_map.json` en el repositorio |

## Arquitectura y entrenamiento

El modelo es un *student* DistilBERT base uncased con una cabeza de clasificación de 16 etiquetas, destilado a partir de un profesor Llama 3.3 70B. El autor indica que el profesor de entrenamiento (Llama 3.3 70B) está «grabado» de forma permanente en los pesos y no cambia con las actualizaciones del profesor en producción. El artefacto distribuido es únicamente el grafo ONNX cuantizado a int8, pensado para inferencia en navegador vía transformers.js (`dtype: "q8"`) o en Python vía onnxruntime.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La taxonomía de salida es un subconjunto entrenado de las 18 categorías HREDD de la herramienta Supplier Risk Screener; dos categorías de banda (`elevated` y `limited`) quedan fuera de la cabeza entrenada y no pueden ser emitidas por el modelo. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto en inglés en 16 categorías de daño HREDD: `biodiversity_loss`, `child_labour`, `deforestation`, `discrimination`, `fatal_incident`, `forced_labour`, `freedom_of_association`, `gbvh`, `hazardous_waste`, `none`, `osh_nonfatal`, `retaliation`, `toxic_pollution`, `trafficking`, `wage_theft`, `water_depletion`.
- Detección de indicios en titulares y fragmentos cortos de medios adversos y alegaciones.
- Salida de etiqueta única con puntuación de confianza (pipeline `text-classification`).
- Ejecución offline en navegador mediante transformers.js con cuantización int8, sin API key ni servidor.
- Inferencia en Python mediante onnxruntime con tokenizer de transformers.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Cribado masivo de proveedores en navegador: el modelo procesa lotes de titulares y alegaciones en el cliente, sin enviar datos a un servidor, lo que facilita el cumplimiento de requisitos de privacidad en evaluaciones preliminares de cadena de suministro.
- Priorización de alertas para revisión humana: clasifica textos en categorías como `forced_labour` o `toxic_pollution` para ordenar la cola de revisión de analistas de diligencia debida, que validan cada resultado High o Critical.
- Monitorización de medios adversos en flujos ESG: integrado en un pipeline que ingiere noticias y emite una categoría de daño por fragmento, permitiendo filtrar ruido y centrar la atención en alegaciones relevantes.
- Enriquecimiento de registros de proveedores: añadir automáticamente etiquetas de categoría de daño a expedientes de proveedores a partir de recortes de prensa, como paso previo a la evaluación de severidad mediante la rúbrica downstream.
- Despliegue en entornos con conectividad limitada o air-gapped: al ser un ONNX int8 de 0,1 GB, puede ejecutarse en estaciones de trabajo de auditores sin acceso a APIs externas.
- Filtrado previo en herramientas de *due diligence* de código abierto: servir como lector offline de respaldo cuando el profesor alojado no está disponible, tal como describe el autor para la demo en producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre conjuntos gold retenidos y con el modelo ONNX int8:

| Métrica | Conjunto | Valor |
|---|---|---|
| Full gold detection (n=30) | HREDD gold-30 | 0,667 |
| Labour detection (n=23) | HREDD gold-30 | 0,652 |
| Environmental detection (n=7) | HREDD gold-30 | 0,714 |
| Severe-trio Critical recall (n=18) | HREDD gold-30 | 0,556 |
| Full gold detection (n=60) | HREDD gold-60 (cohortes g30 y x2026) | 0,700 |
| Severe-trio Critical recall (n=31) | HREDD gold-60 | 0,548 |
| Harm-class accuracy (n=50) | HREDD gold-60 | 0,360 |
| Harm-domain accuracy (n=60) | HREDD gold-60 | 0,917 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM estimada: muy baja; el artefacto int8 ocupa 0,1 GB en repositorio, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU y en navegador. Cualquier GPU (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas; también en dispositivos móviles y navegadores modernos vía WebGPU/WASM con transformers.js.
- Opciones de despliegue: transformers.js (`dtype: "q8"`), onnxruntime en Python, y cualquier runtime compatible con ONNX. No se distribuye fp32, por lo que sin `dtype: "q8"` la librería solicitaría `onnx/model.onnx`, que el repositorio no incluye.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (clasificadores HREDD/ESG sobre DistilBERT) con parámetros, contexto o rendimiento verificables. Se indica, por tanto, como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llama-hredd-adverse-text-distilbert-onnx | no disponible (~66 M, no confirmado) | no disponible | apache-2.0 | Hugging Face, ONNX int8 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Métricas moderadas: accuracy global de 0,667–0,70 y recall de la tríada severa de 0,548–0,556 en los conjuntos gold; la accuracy de clase de daño en el conjunto de 60 casos es solo 0,36, lo que indica confusión frecuente entre categorías específicas.
- El modelo aproxima a su profesor de 70B y el autor reconoce explícitamente que no lo supera.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en cadenas de suministro con documentación en otras lenguas.
- No es una herramienta de decisión automatizada: el autor lo define como ayuda al cribado; no debe usarse para aprobar, cancelar o incluir en listas negras a proveedores.
- Riesgo de alucinación y falsos negativos/positivos en textos ambiguos o muy cortos; toda salida High o Critical requiere revisión humana.
- No emite tiers de riesgo (Low/Medium/High/Critical); estos se derivan aguas abajo con una rúbrica de severidad.
- No puede emitir las categorías de banda `elevated` ni `limited`, que quedan fuera de la cabeza entrenada.
- El repositorio solo contiene el grafo int8; intentar cargar fp32 fallará porque `onnx/model.onnx` no está incluido.
- Licencia apache-2.0, pero el autor menciona «Built with Llama» en la sección de procedencia; conviene revisar las condiciones de la licencia Llama aplicables a modelos derivados antes de un uso comercial.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PSompong/llama-hredd-adverse-text-distilbert-onnx
- Demo de la herramienta de cribado de proveedores: https://supplier-risk-model.pages.dev
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
