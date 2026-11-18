# eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen
Este repositorio contiene una compilación especializada del modelo EuroLLM-1.7B-Instruct, desarrollada por eduardoworrel, orientada a la clasificación de políticas de privacidad según el RGPD europeo y la LGPD brasileña. No se trata de un modelo de propósito general, sino de un sistema de decisión con cabezas de clasificación adicionales (un "pointer head") que se ejecuta en el navegador mediante Transformers.js y ONNX Runtime Web con cuantización int4 y aceleración WebGPU. El paquete incluye los pesos del modelo base cuantizados byte a byte idénticos a la versión de referencia en formato ONNX Runtime GenAI, diferenciándose únicamente en los metadatos del grafo y los nombres de fichero.

La relevancia de esta ficha radica en su enfoque: despliegue de un clasificador de privacidad completamente local en el navegador, sin enviar texto de políticas a servidores externos, lo que resulta coherente con el propio dominio de aplicación (protección de datos). El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que se trata de una publicación muy reciente y de nicho.

La arquitectura subyacente es un transformer decoder-only de 1.700 millones de parámetros (EuroLLM-1.7B-Instruct, del proyecto UTTER), sobre el que se añaden cabezas de decisión separadas que el runtime s1s2 lee de forma independiente. La licencia es GPL-3.0, heredada de los datos de entrenamiento GDPR-Transparency-200.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EuroLLM-1.7B-Instruct) con cabezas de clasificación adicionales (pointer head) y esquema System 1 / System 2 |
| Parametros totales | 1.700 millones (modelo base); las cabezas adicionales no se especifican |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (ONNX `model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (layout Transformers.js: `config.json` + `onnx/model_q4.onnx`), más ficheros de cabezas en `heads/` y manifiestos `manifest.json`, `manifest.en.json`, `manifest.pt.json` |
| Tamano del repo | 1,3 GB |
| Libreria | s1s2 (runtime propio); compatible con `@huggingface/transformers` (transformers.js) |
| Pipeline declarado | text-generation (con tags de text-classification) |

## Arquitectura y entrenamiento
El modelo parte de EuroLLM-1.7B-Instruct (UTTER project, Apache-2.0), un transformer decoder-only de 1.700 millones de parámetros. Sobre él se añaden cabezas de decisión separadas (un "pointer head" y cabezas de probabilidad) que se leen desde el runtime s1s2 y no desde transformers.js. La salida `hidden_states` del grafo ONNX alimenta esas cabezas; el grafo en sí es el mismo que el de la build de referencia en ONNX Runtime GenAI, con la única diferencia de que la dimensión de cabeza de la KV cache está fijada en el grafo para satisfacer los requisitos de transformers.js.

El entrenamiento combina varios corpus: GDPR-Transparency-200 (GPL-3.0, solo ids de ítems y scripts, sin redistribuir texto de políticas), el corpus Claudinha para LGPD (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sintéticos "Kev" (legacy_policy, composicional), generados con código Kev (Apache-2.0). La receta de entrenamiento del pointer head y la idea de separación System 1 / System 2 con compuerta de margen provienen de Kev y de CT0 (Alias Robotics), con los precursores alias3-web y el paper "Browser Immune System" (arXiv 2611.15302). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades
- Clasificación de cláusulas y elementos de políticas de privacidad conforme a RGPD (europeo) y LGPD (brasileño).
- Decisión con cabezas de probabilidad separadas y esquema System 1 / System 2 con compuerta de margen (margin gate), pensado para separar decisiones rápidas de decisiones razonadas.
- Ejecución local en navegador mediante Transformers.js y ONNX Runtime Web con WebGPU.
- Generación de texto y conversación (heredadas del modelo base EuroLLM-1.7B-Instruct).
- Soporte bilingüe inglés-portugués.
- Paridad verificada con la build GenAI: 20 prompts de comprobación en Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) con diferencia máxima 0 en hidden states y probabilidades de cabeza, y 20/20 decisiones iguales; en Chrome 157 WebGPU (Apple M2 Pro), 20/20 decisiones iguales.
- No es un `pipeline` estándar de transformers.js: las cabezas de decisión son ficheros separados que solo lee s1s2.

## Casos de uso
- Auditoría de políticas de privacidad en el navegador: una aplicación web puede cargar el modelo vía s1s2 y clasificar los elementos de una política de privacidad sin enviar el texto a un servidor, lo que encaja con el principio de minimización de datos del RGPD.
- Cumplimiento normativo para pymes: verificación automatizada de si una política cubre los elementos exigidos por RGPD o LGPD, con decisiones locales y trazables.
- Extensión de navegador tipo "Browser Immune System": integración del clasificador en una extensión que advierte al usuario sobre cláusulas problemáticas mientras navega, aprovechando WebGPU y la cuantización int4.
- Procesamiento de documentos en portugués de Brasil: uso del manifiesto `manifest.pt.json` para clasificar políticas redactadas en portugués conforme a LGPD.
- Prototipado rápido sin infraestructura: al ejecutarse con transformers.js y un repo de 1,3 GB, permite demos en Node o en el navegador sin GPU dedicada ni servidor de inferencia.
- Verificación de paridad en pipelines existentes: equipos que ya usan la build GenAI pueden migrar a este layout Transformers.js manteniendo decisiones idénticas (20/20 en las pruebas de paridad), útil para integrar el clasificador en aplicaciones JavaScript ya existentes.
- Investigación sobre separación System 1 / System 2: el esquema de compuerta de margen permite estudiar cuándo una decisión rápida es suficiente y cuándo se requiere razonamiento adicional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pruebas de paridad con la build GenAI (20 prompts, no un conjunto de test): diferencia máxima 0 en hidden states y probabilidades de cabeza, y 20/20 decisiones iguales en Node CPU y en Chrome 157 WebGPU sobre Apple M2 Pro.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el repo pesa 1,3 GB en int4, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican; las pruebas reportadas se hicieron en CPU (Node) y en WebGPU sobre Apple M2 Pro.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con soporte WebGPU o en CPU, dado el tamaño int4 del repo.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), ONNX Runtime Web con WebGPU, onnxruntime-node, y el runtime s1s2 (`@s1s2/web`). No es compatible como `pipeline` estándar de transformers.js.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo (EuroLLM-1.7B GDPR/LGPD, Transformers.js) | 1,7 B | No disponible | ONNX int4 | GPL-3.0 | Clasificación de privacidad en navegador |
| EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 1,7 B | No disponible | ONNX int4 (GenAI) | GPL-3.0 | Misma especialidad, build de referencia en ONNX Runtime GenAI |
| utter-project/EuroLLM-1.7B-Instruct | 1,7 B | No disponible | Safetensors | Apache-2.0 | Modelo base de propósito general, sin cabezas de clasificación |

La comparación con otros clasificadores de privacidad de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias
- No es un modelo abierto en formato Kev ni un `pipeline` de transformers.js: las cabezas de decisión son ficheros separados que solo lee s1s2.
- La dimensión de cabeza de la KV cache está fijada en el grafo, lo que restringe la flexibilidad de configuración.
- Solo soporta inglés y portugués; no hay soporte declarado de castellano ni de otras lenguas europeas, pese a la orientación RGPD.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y redistribución; conviene revisar su compatibilidad con el producto.
- Riesgo de alucinación y de clasificación errónea inherente al modelo base y a las cabezas; no se han publicado métricas de precisión o recall sobre conjuntos de test independientes.
- Sesgos no documentados en la información disponible.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Las pruebas de paridad se basan en 20 prompts escritos para la comprobación, no en un conjunto de test representativo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Runtime s1s2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- GDPR-Transparency-200 / privacy-policy-annotator: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev (pointer head y receta): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
