# eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 es una adaptacion del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel, orientada a la clasificacion de privacidad y al cumplimiento de la LGPD (Lei Geral de Protecao de Dados brasileira). No se trata de un modelo de lenguaje generativo al uso, sino de un especialista que reutiliza los pesos del transformer base en formato ONNX cuantizado a int4 y anade cabezas de decision separadas (cabezas de politica y de puntero) para emitir decisiones binarias o etiquetas sobre textos relacionados con politicas de privacidad.

El modelo se distribuye en el layout de Transformers.js (`config.json` mas `onnx/model_q4.onnx`), pensado para ejecutarse en el navegador mediante WebGPU o en Node con onnxruntime-node. Segun la model card, los pesos int4 son identicos byte a byte a los de la build de referencia basada en ONNX Runtime GenAI, de modo que la precision reportada es la de aquella build. La arquitectura subyacente es la de SmolLM3-3B (transformer decoder-only de aproximadamente 3.000 millones de parametros), pero el uso previsto es la clasificacion, no la generacion libre de texto.

La relevancia de esta ficha radica en que ejemplifica un patron emergente: reutilizar un LLM pequeno como extractor de caracteristicas y acoplarle cabezas ligeras para tareas de clasificacion sensibles a la privacidad, ejecutables integramente en el cliente (navegador) sin enviar datos a un servidor. El modelo soporta portugues e ingles, se publica bajo licencia CC BY 4.0 y esta disenado para el ecosistema s1s2 (System 1 / System 2), con manifiestos separados por idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) con cabezas de clasificacion acopladas (politica y puntero); grafo ONNX |
| Parametros totales | Aproximadamente 3.000 millones (modelo base SmolLM3-3B); parametros de las cabezas no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (pesos `model_q4.onnx`) |
| Idiomas soportados | Portugues (pt) e ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (int4), layout Transformers.js; cabezas en `heads/`; manifiestos `manifest.json`, `manifest.en.json`, `manifest.pt.json` |
| Tamano del repositorio | 1,8 GB |
| Libreria | s1s2 |
| Pipeline declarado | text-generation (etiqueta), uso real: text-classification |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de Hugging Face. Sobre ese backbone se anaden cabezas de decision independientes: una cabeza de politica (policy head) y una cabeza de puntero (pointer head), leidas por el runtime s1s2 y no por transformers.js. La separacion System 1 / System 2 y la idea de compuerta por margen (margin gate) proceden de CT0 de Alias Robotics, y la receta de la cabeza de puntero y el entrenamiento se basan en Kev. El grafo ONNX exporta la hidden state final por token como entrada de las cabezas.

En cuanto a datos, la model card indica que los unicos datos de privacidad son el corpus Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0), complementado con datos sinteticos Kev (legacy_policy, compositional) generados por codigo Kev bajo Apache-2.0. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovacion tecnica destacable es la verificacion de paridad entre la build GenAI y la build Transformers.js: 20 prompts de comprobacion en Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) con diferencia maxima de hidden state 0, diferencia maxima de probabilidades de cabeza 0 y 20/20 decisiones iguales; en Chrome 157 WebGPU sobre Apple M2 Pro, 20/20 decisiones iguales y diferencia maxima de probabilidad de cabeza 0.

## Capacidades

- Clasificacion de textos relacionados con politicas de privacidad y LGPD mediante cabezas de decision dedicadas.
- Decisiones binarias o etiquetadas con probabilidad asociada por cabeza (policy head y pointer head).
- Extraccion de hidden states por token a traves del grafo ONNX, utilizable como representacion para tareas posteriores.
- Ejecucion en navegador con WebGPU y en Node con onnxruntime-node, sin dependencia de servidor.
- Soporte de dos idiomas: portugues e ingles, con manifiestos separados por idioma.
- Integracion con el runtime s1s2 (`@s1s2/web`), que gestiona la carga del manifiesto y la lectura de las cabezas.
- Carga del grafo tambien mediante transformers.js estandar (`AutoModelForCausalLM` con `dtype: "q4"`), aunque en ese caso no se leen las cabezas.
- No es un modelo de generacion libre ni un `pipeline` de transformers.js; el uso previsto es la clasificacion.

## Casos de uso

- Clasificacion de politicas de privacidad en el cliente: el modelo puede evaluar fragmentos de politicas de privacidad y emitir decisiones sobre su conformidad con la LGPD directamente en el navegador, sin enviar el texto a un servidor, lo que reduce la exposicion de datos sensibles.
- Cumplimiento normativo en aplicaciones web: integrado mediante s1s2, permite marcar formularios o avisos de privacidad que incumplen requisitos y bloquear su envio antes de que los datos salgan del dispositivo.
- Extensiones de navegador para proteccion de datos: al ejecutarse con WebGPU y pesos int4, cabe en el cliente y puede analizar paginas en tiempo real para detectar practicas de tratamiento de datos no declaradas.
- Filtrado previo en pipelines de datos: como clasificador de textos en portugues e ingles, sirve para etiquetar grandes volumenes de documentos legales antes de un procesamiento posterior mas costoso.
- Auditoria de consentimiento: la cabeza de puntero puede senalar fragmentos concretos del texto que motivan la decision, lo que facilita la trazabilidad en revisiones de cumplimiento.
- Prototipado rapido de clasificadores de privacidad: al reutilizar SmolLM3-3B y anadir cabezas ligeras, un equipo puede adaptar el modelo a nuevas categorias de politica con menos coste que entrenar un transformer desde cero.
- Educacion y demostraciones: la ejecucion en navegador con paridad verificada frente a la build GenAI facilita demos reproducibles de clasificacion de privacidad sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la comprobacion de paridad entre builds: 20 prompts en Node CPU con decisiones 20/20 iguales y diferencia maxima 0 en hidden states y probabilidades de cabeza, y 20/20 decisiones iguales en Chrome 157 WebGPU sobre Apple M2 Pro.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,8 GB y los pesos estan en int4, por lo que la inferencia requiere del orden de 2 GB de memoria, aunque la cifra exacta no se especifica en la informacion disponible.
- GPU recomendadas: no se detallan en la informacion disponible. La model card verifica ejecucion en WebGPU sobre Apple M2 Pro; por el tamano, es razonable esperar funcionamiento en GPU de consumo con soporte WebGPU, aunque no se confirma.
- Cabe en GPU de consumo: si, segun el tamano int4 y la verificacion en Apple M2 Pro; no se confirman modelos concretos de NVIDIA o AMD.
- Opciones de despliegue: runtime s1s2 (`@s1s2/web`) sobre transformers.js, transformers.js estandar con `dtype: "q4"`, onnxruntime-node en Node y ONNX Runtime GenAI (build de referencia enlazada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 | ~3.000 M | no disponible | ONNX int4 (Transformers.js) | CC BY 4.0 | Clasificacion de privacidad LGPD con cabezas |
| SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2 | ~3.000 M | no disponible | ONNX int4 (GenAI) | CC BY 4.0 | Build de referencia del mismo especialista |
| SmolLM3-3B (base) | ~3.000 M | no disponible | safetensors | Apache-2.0 | Modelo de lenguaje generativo general |
| alias3-web (Alias Robotics) | no disponible | no disponible | no disponible | no disponible | Precursor del enfoque en navegador |

## Limitaciones y advertencias

- No es un modelo de generacion libre ni un `pipeline` de transformers.js: las cabezas de decision son archivos separados que solo lee el runtime s1s2.
- La dimension de la cabeza del KV cache esta fijada en el grafo por requisito de transformers.js; el resto del grafo es el de la build GenAI.
- La validacion de paridad se realizo con 20 prompts escritos para la comprobacion, no con un conjunto de test formal, por lo que no constituye una evaluacion de precision representativa.
- Solo cubre portugues e ingles; no se garantiza comportamiento en otros idiomas.
- Los datos de privacidad provienen del corpus Claudinha y de datos sinteticos Kev, lo que puede introducir sesgos de dominio y de composicion no documentados.
- Riesgo de alucinacion y de clasificaciones erroneas en textos legales atipicos; no debe usarse como unica base para decisiones de cumplimiento.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero obliga a mantener la atribucion al corpus Claudinha, a los datos Kev y al modelo base Apache-2.0.
- No se dispone de informacion sobre sesgos demograficos, linguisticos o de otro tipo, ni sobre el numero de tokens de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- Kev (cabeza de puntero y receta de entrenamiento): https://github.com/jaredpalmer/kev
- Corpus Claudinha: https://zenodo.org/records/13371639
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
