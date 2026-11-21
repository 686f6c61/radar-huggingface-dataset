# eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2

## Resumen

SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 es una especialización del modelo base SmolLM3-3B de Hugging Face, publicada por el usuario eduardoworrel, orientada a la clasificación y decisión automática sobre textos de políticas de privacidad en el marco de la LGPD brasileña (Lei Geral de Proteção de Dados). No es un modelo de propósito general: se distribuye como un artefacto ONNX cuantizado a int4 con cabezas de decisión adicionales, pensado para ejecutarse íntegramente en el navegador mediante Transformers.js y WebGPU o WASM.

El paquete combina tres piezas: los pesos del transformer base (3B parámetros, cuantizados a 4 bits), un conjunto de cabezas de clasificación entrenadas para responder preguntas estructuradas sobre fragmentos de política de privacidad (por ejemplo, si un texto describe destinatarios de datos) y un runtime propietario denominado S1S2 que implementa un patrón de dos sistemas: una decisión rápida de un solo paso (System 1) y una generación explicativa opcional cuando el margen de confianza es bajo (System 2). El repositorio ocupa 1,8 GB, lo que refleja la cuantización agresiva respecto al modelo original.

Su relevancia radica en el despliegue local y privado: al ejecutarse en el navegador del usuario, los textos analizados no salen del dispositivo, lo que encaja con casos de cumplimiento normativo donde enviar documentos a una API externa es problemático. La licencia es CC BY 4.0, condicionada por el corpus de datos de privacidad utilizado (Claudinha), mientras que el modelo base mantiene Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3-3B), empaquetado ONNX con cabezas de decisión adicionales |
| Parametros totales | 3B (modelo base); tamaño del repo 1,8 GB en int4 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (q4), ONNX |
| Idiomas soportados | pt, en |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (model_q4.onnx), cabezas en ficheros separados (heads/), manifiestos JSON |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B, un transformer decoder-only de 3B parámetros de Hugging Face, y se distribuye como grafo ONNX cuantizado a int4. Sobre la representación interna del transformer se aplican cabezas de clasificación independientes (ficheros en `heads/`) que transforman los estados ocultos en decisiones tipo elección múltiple (por ejemplo, "Sim"/"Não") sobre preguntas formuladas según un manifiesto (`lab`). El runtime S1S2 gestiona el prompt, las posiciones de lectura y la softmax sobre dichas cabezas; Transformers.js por sí solo no lee estas cabezas.

Los datos de especialización provienen del corpus Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0) para contenido de privacidad, complementado con datos sintéticos "Kev" (legacy_policy, compositional) generados por código Apache-2.0. La receta de entrenamiento de la cabeza de decisión y la idea de separación System 1 / System 2 con compuerta por margen proceden de Kev (jaredpalmer) y de CT0 (Alias Robotics), con el paper "Browser Immune System" (arXiv 2611.15302) como precursor. No se detallan en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO sobre el modelo base.

Como innovaciones técnicas destacan: la sustitución de `com.microsoft GatherBlockQuantized` por operaciones ONNX estándar para leer la tabla int4 (sin kernel de CPU en navegador), la división de `lm_head` en cuatro partes a lo largo del vocabulario para encajar en memoria wasm32, y la fijación de la dimensión de cabeza de la caché KV en el grafo. El resultado declarado es paridad byte a byte con la build de referencia ONNX Runtime GenAI: estados ocultos con diferencia máxima 0 y decisiones 20/20 iguales en 20 prompts de verificación.

## Capacidades

- Clasificación y decisión estructurada sobre fragmentos de políticas de privacidad (preguntas de elección con opciones definidas en el manifiesto).
- Generación de texto explicativo con los mismos pesos, invocable mediante `generate()` para justificar una decisión.
- Modo de dos sistemas: decisión de un paso (System 1) y explicación o revisión cuando el margen de confianza es bajo (System 2).
- Salida con probabilidad y margen por pregunta, útil para umbrales de revisión humana.
- Ejecución en navegador con Transformers.js, tanto en WebGPU como en CPU vía WASM.
- Soporte de manifiestos alternativos de tareas e idiomas (`manifest.en.json`).
- Idiomas: portugués e inglés.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Auditoría de políticas de privacidad en el navegador: una herramienta web puede cargar el modelo y analizar el texto de una política sin enviarlo a ningún servidor, respondiendo preguntas concretas sobre destinatarios, finalidades o bases legales, con la ventaja de que los datos no abandonan el dispositivo.
- Revisión de cumplimiento LGPD en flujos internos: integrado en un panel de revisión, el modelo clasifica cláusulas y marca con margen bajo aquellas que requieren revisión de un jurista, reduciendo el volumen de lectura manual.
- Triaje de documentos con generación explicativa: cuando `margin < 0.2`, se invoca `generate()` con los mismos pesos para obtener una justificación en dos frases que el revisor humano puede validar.
- Extensiones de navegador para protección del consumidor: al ejecutarse en WebGPU (0,36 s por decisión en un Apple M2 Pro), permite analizar en tiempo real el aviso de privacidad de una web mientras el usuario navega.
- Procesamiento por lotes en Node: la build de referencia en CPU (onnxruntime-node) sirve para validar decisiones de forma exacta antes de desplegar la versión de navegador, gracias a la paridad bit a bit de estados ocultos.
- Investigación sobre separación System 1 / System 2: el paquete sirve como banco de pruebas reproducible para estudiar compuertas por margen y decisiones de un paso frente a generación completa, con pesos y prompts fijados.
- Clasificación multilingüe pt/en de textos legales: con `manifest.en.json` puede aplicarse a políticas en inglés manteniendo el mismo mecanismo de cabezas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento declarados son de paridad y latencia:

| Prueba | Entorno | Resultado |
|---|---|---|
| Paridad de estados ocultos vs. build GenAI | Node CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1) | max abs diff 0 |
| Paridad de probabilidades de cabeza | Node CPU | max abs diff 0 |
| Paridad de decisiones (20 prompts) | Node CPU | 20/20 iguales |
| Paridad de decisiones (20 prompts) | Chrome 157 WebGPU (Apple M2 Pro) | 20/20 iguales |
| Latencia por decisión | Chrome 157 WebGPU (M2 Pro) | 0,36 s; memoria de página 0,5 GB |
| Latencia por decisión | Chrome 157 CPU WASM (M2 Pro) | 5,5 s; memoria de página 2,8 GB (pico 4,7 GB al cargar) |

## Requisitos de hardware

- VRAM/GPU: el despliegue previsto es en navegador; en WebGPU se usan buffers de GPU no contabilizados en la memoria de página (0,5 GB de página en el caso medido). No se especifica VRAM mínima.
- CPU: la ruta WASM funciona sin GPU, con 2,8 GB de memoria de página y pico de 4,7 GB durante la carga; requiere navegador con soporte wasm32 ampliado.
- GPU de consumo: no se documentan pruebas en RTX 4090, A100 o H100; el entorno de referencia es un Apple M2 Pro.
- Despliegue: Transformers.js (`@huggingface/transformers`) con dtype `q4`, runtime S1S2 (`@s1s2/web`) y onnxruntime-node para la referencia exacta en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,36 s por decisión en WebGPU y 5,5 s en CPU WASM en el hardware medido; no se aportan cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2 | 3B (int4) | no disponible | Clasificación LGPD en navegador con cabezas de decisión | CC BY 4.0 | Hugging Face, ONNX |
| SmolLM3-3B (base) | 3B | no disponible | Generación de texto general | Apache-2.0 | Hugging Face |
| SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2 | 3B (int4) | no disponible | Misma especialización, build ONNX Runtime GenAI de referencia | CC BY 4.0 | Hugging Face |
| alias3-web (Alias Robotics) | no disponible | no disponible | Precursor de modelo en navegador | no disponible | Hugging Face |

La comparación con modelos de propósito general de 3B no es directa: este paquete no compite en generación abierta, sino en decisiones estructuradas sobre privacidad con ejecución local. Frente a la build GenAI del mismo autor, la diferencia es el layout (Transformers.js) y los cambios de grafo para CPU de navegador, con paridad declarada de resultados.

## Limitaciones y advertencias

- Las cabezas de decisión son ficheros separados que Transformers.js no lee por sí solo; sin el runtime S1S2 o el PR #1943 de transformers.js, la decisión no es accesible directamente.
- El ámbito es estrecho: especializado en políticas de privacidad LGPD en portugués e inglés; no debe usarse como modelo generalista.
- Los datos de privacidad son un corpus acotado (Claudinha) más datos sintéticos, lo que puede limitar la generalización a dominios o jurisdicciones distintas.
- Riesgo de alucinación en la fase generativa (`generate()`): las explicaciones pueden no reflejar el texto fuente y deben validarse.
- La compuerta por margen (0,2) es un ejemplo del autor, no un umbral calibrado; debe medirse en cada despliegue.
- Licencia CC BY 4.0 con atribución obligatoria a Claudinha, Kev y al modelo base; el uso comercial exige mantener las atribuciones.
- En CPU de navegador la latencia es alta (5,5 s por decisión) y el consumo de memoria considerable (pico de 4,7 GB); no apto para dispositivos con poca RAM.
- No se documentan sesgos específicos ni evaluación de robustez frente a textos adversariales.
- La fecha de creación del repositorio (2026) y el identificador arXiv 2611.15302 deben verificarse antes de citarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/SmolLM3-3B-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Runtime S1S2: https://github.com/eduardoworrel/s1s2
- Código de decisión S1S2: https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- Transformers.js: https://github.com/huggingface/transformers.js
- PR de transformers.js para pipeline "decision": https://github.com/huggingface/transformers.js/pull/1943
- Kev (receta de cabezas): https://github.com/jaredpalmer/kev
- Corpus Claudinha: https://zenodo.org/records/13371639
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
