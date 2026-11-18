# eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2 es una especialización del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel. No se trata de un modelo generativo de propósito general, sino de un clasificador de decisiones sobre políticas de privacidad orientado a los marcos normativos GDPR (Europa) y LGPD (Brasil). El autor lo describe como un "especialista en privacidad" que reutiliza los pesos del SmolLM3-3B cuantizados a int4 y los combina con cabezas de decisión separadas (heads) que se leen mediante la librería propia s1s2.

La relevancia de esta ficha radica en su empaquetado: es la variante en formato Transformers.js (`config.json` + `onnx/model_q4.onnx`), pensada para aplicaciones web que ya utilizan transformers.js y WebGPU. Según la model card, los pesos int4 son idénticos byte a byte a los de la build de referencia basada en ONNX Runtime GenAI, y solo cambian los metadatos del grafo y los nombres de fichero, por lo que la precisión reportada es la de aquella build.

El modelo se enmarca en la línea de trabajo del "Browser Immune System" (arXiv 2611.15302) y en la idea de separación System 1 / System 2 con compuerta de margen (margin gate) procedente de CT0 de Alias Robotics. Su licencia es GPL-3.0, condicionada por el corpus de entrenamiento GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B) con cabezas de decisión separadas para clasificación; grafo ONNX con KV cache de dimensión fija |
| Parametros totales | 3B (modelo base SmolLM3-3B); parámetros de las cabezas de decisión no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (q4) en ONNX |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`onnx/model_q4.onnx`), layout Transformers.js; cabezas en `heads/`; manifiestos `manifest.json`, `manifest.en.json`, `manifest.pt.json` |

## Arquitectura y entrenamiento

El modelo parte del transformer decoder-only SmolLM3-3B de Hugging Face (Apache-2.0) y se adapta mediante un esquema de dos sistemas: un "System 1" rápido y un "System 2" más deliberativo, con una compuerta de margen (margin gate) que decide cuándo activar el segundo, según la idea atribuida a CT0 de Alias Robotics. La salida del grafo ONNX expone `hidden_states` (estado oculto final por token) y `logits`; las cabezas de decisión se almacenan como ficheros separados en `heads/` y son leídas por s1s2, no por transformers.js.

Los datos de entrenamiento combinan tres fuentes: el corpus GDPR-Transparency-200 (tomcory/privacy-policy-annotator, GPL-3.0), del que solo se usan identificadores de ítems y scripts sin redistribuir texto de políticas; el corpus Claudinha para LGPD (Tocchini et al., Zenodo 13371639, CC BY 4.0); y datos sintéticos "Kev" (legacy_policy, composicional) generados por código Kev (Apache-2.0). La receta de entrenamiento y la cabeza pointer provienen de Kev. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

Como innovación de despliegue, el grafo fija la dimensión de cabeza del KV cache porque transformers.js lo requiere; el resto del grafo es el de la build GenAI. El autor reporta paridad con la build de referencia: en Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) sobre 20 prompts de comprobación, la diferencia máxima absoluta en el estado oculto y en las probabilidades de las cabezas es 0, con 20/20 decisiones iguales; en Chrome 157 WebGPU sobre Apple M2 Pro, también 20/20 decisiones iguales y diferencia máxima 0.

## Capacidades

- Clasificación de decisiones sobre políticas de privacidad en el ámbito GDPR y LGPD, mediante cabezas de decisión dedicadas.
- Generación de texto subyacente heredada del modelo base SmolLM3-3B (el grafo expone `logits`), aunque el uso previsto es la clasificación.
- Ejecución en navegador mediante transformers.js y WebGPU, además de Node CPU con onnxruntime-node.
- Soporte de dos idiomas: inglés (en) y portugués (pt), con manifiestos separados por idioma.
- Esquema System 1 / System 2 con compuerta de margen para decisiones más deliberadas.
- Integración mediante la librería s1s2 (`@s1s2/web`) con carga por manifiesto.
- No es un `pipeline` estándar de transformers.js ni un modelo en formato open-jev/Kev: las cabezas se leen aparte.
- Tool calling, agentes, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Auditoría de políticas de privacidad en webs corporativas: el modelo clasifica fragmentos de la política conforme a GDPR y LGPD, y la compuerta de margen permite derivar los casos ambiguos al System 2 para una decisión más deliberada.
- Cumplimiento normativo en el navegador: al ejecutarse con transformers.js y WebGPU, permite analizar políticas sin enviar el texto a un servidor, lo que encaja con requisitos de minimización de datos del propio GDPR.
- Revisión de contratos y avisos legales en portugués: el manifiesto `manifest.pt.json` habilita el análisis de textos en portugués para el marco LGPD brasileño.
- Preprocesado en pipelines de compliance: la salida por token (`hidden_states`) y las probabilidades de las cabezas permiten integrar el modelo como etapa de etiquetado en flujos de revisión legal automatizada.
- Extensiones de navegador para usuarios: el formato Transformers.js y el tamaño de repo de 1,8 GB con pesos int4 permiten empaquetar el modelo en una extensión que advierta sobre cláusulas de privacidad.
- Investigación en clasificación de textos legales: la separación System 1 / System 2 con margin gate sirve como banco de pruebas para estudiar el equilibrio entre coste y precisión en decisiones de clasificación.
- Verificación de paridad entre runtimes: el autor documenta comprobaciones de igualdad de decisiones entre ONNX Runtime GenAI, Node CPU y WebGPU, útil para validar despliegues multiplataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pruebas de paridad con la build GenAI: 20/20 decisiones iguales en Node CPU y 20/20 en Chrome 157 WebGPU, con diferencia máxima absoluta de 0 en estado oculto y probabilidades de cabezas. Se trata de comprobaciones de consistencia, no de un conjunto de test.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 1,8 GB con pesos int4, lo que da una cota inferior orientativa para el grafo más las cabezas.
- GPU recomendadas: no disponibles en la información proporcionada; el autor valida WebGPU en Apple M2 Pro.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño int4 de 1,8 GB sugiere que puede caber en GPUs de consumo, pero no se aporta una lista verificada.
- Despliegue: transformers.js (navegador y Node), onnxruntime-node 1.30.0, WebGPU en Chrome 157, y la librería s1s2 (`@s1s2/web`) con carga por manifiesto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2 | 3B (base) | no disponible | ONNX int4, Transformers.js | GPL-3.0 | Especialista GDPR/LGPD con cabezas s1s2 |
| SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 3B (base) | no disponible | ONNX int4, ONNX Runtime GenAI | GPL-3.0 | Build de referencia del mismo especialista; pesos idénticos byte a byte |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible | safetensors y otros | Apache-2.0 | Modelo base generativo de propósito general, sin especialización en privacidad |

## Limitaciones y advertencias

- No es un modelo generativo de propósito general ni un `pipeline` estándar de transformers.js: las cabezas de decisión son ficheros separados que solo lee s1s2.
- La dimensión de cabeza del KV cache está fijada en el grafo por requisito de transformers.js, lo que limita la flexibilidad del grafo.
- Solo cubre inglés y portugués; no hay soporte declarado para castellano ni otros idiomas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un clasificador especializado, la evaluación debe hacerse sobre el dominio normativo concreto.
- Licencia GPL-3.0: impuesta por el corpus GDPR-Transparency-200; el uso comercial queda sujeto a las obligaciones de copyleft de dicha licencia. Los datos Claudinha (CC BY 4.0), Kev y el modelo base (Apache-2.0) mantienen su atribución.
- Las pruebas de paridad se hicieron sobre 20 prompts escritos para la comprobación, no sobre un conjunto de test independiente; no deben interpretarse como una evaluación de precisión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/SmolLM3-3B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Kev: https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
