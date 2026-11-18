# eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2 es una adaptación del modelo base BSC-LT/salamandra-2b-instruct (Barcelona Supercomputing Center) especializada en la clasificación y el análisis de políticas de privacidad conforme al RGPD europeo y a la LGPD brasileña. El autor, eduardoworrel, publica esta variante en formato ONNX cuantizado a int4 con un diseño de ejecución orientado a Transformers.js, de modo que el modelo pueda ejecutarse íntegramente en el navegador mediante WebGPU o en Node con onnxruntime-node.

El modelo no es un generador de texto de propósito general en la práctica: se distribuye con cabezas de decisión separadas (archivos en `heads/`) que implementan un esquema System 1 / System 2, leídas por la librería propietaria `@s1s2/web` y no por el pipeline estándar de Transformers.js. Esta versión es una réplica byte a byte de los pesos int4 del build de referencia ONNX Runtime GenAI, con solo cambios de metadatos y nombres de fichero, y el autor reporta paridad exacta (diferencia máxima 0 en estados ocultos y probabilidades, 20/20 decisiones idénticas) en CPU con Node y en WebGPU con Chrome sobre Apple M2 Pro.

Su relevancia actual reside en la combinación de tres factores: un modelo base de 2B parámetros con licencia Apache-2.0, una cuantización int4 que reduce el repositorio a 2,1 GB y un runtime de inferencia en el navegador que permite clasificar textos legales sin enviar datos a servidores externos, algo especialmente coherente con la naturaleza sensible del dominio (políticas de privacidad y datos personales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la del base BSC-LT/salamandra-2b-instruct), con cabezas de decisión adicionales para el esquema S1/S2 |
| Parametros totales | 2B (modelo base); no se detalla el recuento exacto en la información disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (grafo ONNX `model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX int4 (`config.json` + `onnx/model_q4.onnx`), con cabezas en `heads/` y manifiestos `manifest.en.json`, `manifest.json`, `manifest.pt.json` |

## Arquitectura y entrenamiento

El modelo parte de Salamandra-2b-instruct, un transformer decoder-only del BSC, y se especializa mediante un ajuste orientado a la clasificación de cláusulas de privacidad. La innovación principal no está en el transformer en sí, sino en el esquema de decisión: un reparto System 1 / System 2 con una compuerta de margen (*margin gate*), inspirado en el trabajo CT0 de Alias Robotics y en los precursores alias3-web y el paper *Browser Immune System* (arXiv 2611.15302). El grafo ONNX expone los estados ocultos finales por token, que alimentan las cabezas de decisión separadas leídas por la librería s1s2.

Los datos de entrenamiento combinan tres fuentes: GDPR-Transparency-200 (tomcory/privacy-policy-annotator, GPL-3.0), de la que solo se redistribuyen identificadores de ítems y scripts, no el texto de las políticas; el corpus Claudinha para LGPD (Tocchini et al., Zenodo 13371639, CC BY 4.0); y datos sintéticos Kev (legacy_policy, composicional) generados por código Kev (Apache-2.0). La receta de entrenamiento y la cabeza de puntero provienen también de Kev. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La dimensión de la cabeza del KV cache está fijada en el grafo para satisfacer los requisitos de Transformers.js.

## Capacidades

- Clasificación y decisión sobre cláusulas de políticas de privacidad en el marco del RGPD (UE) y la LGPD (Brasil).
- Esquema de decisión System 1 / System 2 con compuerta de margen, pensado para separar respuestas rápidas de respuestas que requieren razonamiento adicional.
- Exposición de estados ocultos por token (`hidden_states`) y logits a través de Transformers.js estándar, además de las cabezas de decisión vía s1s2.
- Ejecución en navegador con WebGPU y en Node con onnxruntime-node.
- Soporte multilingüe limitado a inglés y portugués.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Auditoría de políticas de privacidad en el navegador: una extensión o web app puede cargar el modelo vía `@s1s2/web` y clasificar cláusulas de una política sin enviar el texto a un servidor, lo que encaja con el tratamiento de datos sensibles bajo RGPD.
- Cumplimiento LGPD en aplicaciones brasileñas: el soporte de portugués y el corpus Claudinha permiten evaluar políticas de sitios en pt-BR y detectar cláusulas problemáticas.
- Preprocesado en pipelines de compliance: usar el modelo como primer filtro para marcar políticas que requieren revisión humana, reduciendo el volumen de documentos que llegan a los revisores.
- Herramientas de desarrollador integradas en CI/CD: al ejecutarse con onnxruntime-node, puede incorporarse a un job que valide la política de privacidad de un producto antes de un despliegue.
- Demos y prototipos sin backend: el formato Transformers.js con int4 permite desplegar una demo estática en Hugging Face Spaces o en una página web, sin infraestructura GPU.
- Investigación sobre esquemas S1/S2: la separación entre estados ocultos y cabezas de decisión facilita experimentar con compuertas de margen y estrategias de decisión en dominios legales.
- Clasificación de textos legales en entornos con restricciones de red: al no requerir conexión a un servicio de inferencia, es apto para entornos air-gapped una vez descargado el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta una comprobación de paridad con el build de referencia ONNX Runtime GenAI:

| Prueba | Entorno | Resultado |
|---|---|---|
| Diferencia máxima en estados ocultos | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) | 0 |
| Diferencia máxima en probabilidades de cabeza | Node CPU | 0 |
| Decisiones idénticas | Node CPU, 20 prompts | 20/20 |
| Decisiones idénticas | Chrome 157 WebGPU (Apple M2 Pro), 20 prompts | 20/20 |

Se trata de una prueba de paridad con 20 prompts escritos para la comprobación, no de un conjunto de test representativo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,1 GB en int4; la inferencia requiere espacio para pesos, KV cache y activaciones, pero no se publica una cifra exacta de VRAM.
- GPU recomendadas: no se especifican; el autor valida WebGPU en Apple M2 Pro y CPU con Node.
- Compatibilidad con GPU de consumo: el tamaño int4 (2,1 GB) sugiere que puede caber en GPUs de consumo con suficiente memoria, pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: Transformers.js (con `@huggingface/transformers` y `dtype: "q4"`), la librería `@s1s2/web` para las cabezas de decisión, onnxruntime-node en Node y WebGPU en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2 | 2B (base) | no disponible | ONNX int4 | GPL-3.0 | Especializado en RGPD/LGPD, cabezas S1/S2, ejecución en navegador |
| BSC-LT/salamandra-2b-instruct | 2B | no disponible | safetensors | Apache-2.0 | Modelo base generalista, sin especialización legal |
| eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 2B (base) | no disponible | ONNX int4 (GenAI) | GPL-3.0 | Build de referencia del mismo especialista, con paridad byte a byte |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un pipeline estándar de Transformers.js: las cabezas de decisión son ficheros separados que solo lee la librería s1s2; el uso con `AutoModelForCausalLM` devuelve estados ocultos y logits, pero no las decisiones.
- La licencia GPL-3.0 es copyleft y puede ser incompatible con productos propietarios; deriva de los pesos entrenados con GDPR-Transparency-200 (GPL-3.0), aunque los datos Claudinha (CC BY 4.0), Kev y el modelo base (Apache-2.0) mantienen su atribución.
- Idiomas limitados a inglés y portugués; no hay soporte declarado de castellano.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez en la información disponible.
- El ámbito es acotado a clasificación de políticas de privacidad; no debe usarse como asesor legal ni como sustituto de revisión jurídica.
- La dimensión de la cabeza del KV cache está fijada en el grafo, lo que puede limitar cambios de configuración en tiempo de ejecución.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha: https://zenodo.org/records/13371639
- Kev: https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
