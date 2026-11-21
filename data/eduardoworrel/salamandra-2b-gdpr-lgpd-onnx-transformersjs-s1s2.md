# eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen
Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2 es una adaptacion del modelo base BSC-LT/salamandra-2b-instruct (Barcelona Supercomputing Center) realizada por el usuario eduardoworrel. Se trata de un especialista en clasificacion y decision sobre textos de politicas de privacidad, orientado a los marcos normativos GDPR (europeo) y LGPD (brasileno). El modelo resuelve el problema de evaluar automaticamente si un fragmento de politica de privacidad cumple con requisitos concretos de transparencia, combinando una cabeza de decision entrenada con la capacidad generativa del modelo base.

La relevancia de esta version concreta radica en su formato: pesos ONNX cuantizados a int4 dispuestos en el layout de Transformers.js, lo que permite ejecutar el modelo directamente en el navegador tanto en WebGPU como en CPU (WASM). Esto habilita casos de uso de privacidad donde el texto sensible nunca abandona el dispositivo del usuario. El repositorio ocupa 2,1 GB e incluye cabezas de decision separadas, manifiestos de tareas y plantillas de chat.

El modelo implementa el patron S1S2 (System 1 / System 2): una decision rapida de una sola pasada con una cabeza especializada, seguida opcionalmente de una explicacion generada por el mismo modelo cuando el margen de confianza es bajo. Esta arquitectura de dos velocidades es el rasgo tecnico mas distintivo frente a un uso convencional del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Salamandra-2B), con cabezas de decision adicionales y formato ONNX para Transformers.js |
| Parametros totales | 2B (modelo base Salamandra-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (modelo_q4.onnx) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (int4), con cabezas en archivos separados (heads/), manifiestos JSON y chat_template.jinja |

## Arquitectura y entrenamiento
El modelo parte de BSC-LT/salamandra-2b-instruct, un transformer decoder-only de 2.000 millones de parametros desarrollado por el Barcelona Supercomputing Center, y le anade cabezas de decision entrenadas especificamente para tareas de analisis de politicas de privacidad. La inferencia S1S2 aplica la cabeza sobre los hidden states en posiciones de lectura determinadas del prompt, produciendo una eleccion entre opciones (por ejemplo Yes/No) con probabilidad y margen asociados. El grafo ONNX fija la dimension de cabeza de la KV cache (requisito de Transformers.js) y divide el lm_head en 8 partes a lo largo del vocabulario para que la CPU del navegador quepa en memoria wasm32.

Los datos de entrenamiento combinan tres fuentes: GDPR-Transparency-200 (tomcory/privacy-policy-annotator, GPL-3.0), el corpus brasileno Claudinha (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sinteticos Kev (legacy_policy, compositional, Apache-2.0). La receta de la cabeza de decision y el pointer head provienen de Kev (Apache-2.0). El modelo base conserva su licencia Apache-2.0, pero la licencia final es GPL-3.0 por derivarse de los pesos entrenados sobre GDPR-Transparency-200. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO en el modelo base.

## Capacidades
- Clasificacion y decision sobre fragmentos de politicas de privacidad mediante cabeza especializada (respuestas tipo choice con probabilidad y margen).
- Generacion de texto explicativo sobre la decision tomada, reutilizando los mismos pesos (modo System 2).
- Razonamiento de una sola pasada con umbral de confianza (margin gate) para derivar a revision humana o a explicacion generada.
- Soporte de manifiestos de tareas y de idiomas (manifest.json y manifest.pt.json).
- Ejecucion en navegador con Transformers.js sobre WebGPU y CPU (WASM).
- Capacidades heredadas del modelo base Salamandra-2B-Instruct: generacion de texto conversacional en ingles y portugues.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso
- Auditoria de politicas de privacidad en el navegador: una herramienta web puede cargar el modelo via Transformers.js y evaluar si un fragmento cumple requisitos GDPR/LGPD sin enviar el texto a un servidor, gracias a la ejecucion local en WebGPU o WASM.
- Cumplimiento normativo en entornos sanitarios o financieros: el texto de politicas o contratos se procesa en el dispositivo del usuario, evitando exponer datos sensibles a terceros.
- Revision asistida con umbral de confianza: cuando el margen de la decision S1S2 es bajo (por ejemplo, inferior a 0,2, valor de ejemplo medido por el autor), se invoca la generacion S2 para obtener una explicacion en dos frases que ayude al revisor humano.
- Clasificacion por lotes de clausulas de comparticion de datos: la cabeza responde a preguntas concretas como si el pasaje identifica los destinatarios de los datos, con salida estructurada (choice, confidence, margin) facil de integrar en pipelines.
- Formacion y concienciacion legal: la explicacion generada por el mismo modelo sirve como material didactico sobre por que una clausula cumple o no un requisito de transparencia.
- Extension a otros idiomas y tareas mediante manifiestos: el autor incluye manifest.pt.json para portugues, lo que permite reutilizar el mismo binario para evaluaciones en ese idioma.
- Prototipado rapido en aplicaciones JavaScript existentes: el layout config.json + onnx/model_q4.onnx permite integrar el modelo en apps que ya usan @huggingface/transformers sin infraestructura de servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta mediciones de paridad y latencia sobre 20 prompts de comprobacion (no un conjunto de test):

| Metrica | Resultado |
|---|---|
| Paridad con build GenAI (Node CPU, onnxruntime-node 1.30.0, transformers.js 4.3.1) | hidden state max \|diff\| 0; probabilidades de cabeza max \|diff\| 0; decisiones 20/20 iguales |
| Paridad en Chrome 157 WebGPU (Apple M2 Pro) | decisiones 20/20 iguales; probabilidad de cabeza max \|diff\| 0 |
| Latencia por decision en WebGPU (Chrome 157, M2 Pro) | 0,51 s; memoria de pagina 0,6 GB (sin contar buffers GPU) |
| Latencia por decision en CPU WASM (Chrome 157, M2 Pro) | 6,1 s; memoria de pagina 3,1 GB (pico de pestana 5,8 GB durante la carga) |
| Concordancia WebGPU vs CPU | 20/20 decisiones iguales |
| Concordancia de pipeline("decision") con la cabeza entrenada | 14 de 20 prompts (Node CPU) |

## Requisitos de hardware
- VRAM estimada: no disponible para GPU dedicada; el modelo esta disenado para ejecucion en navegador con pesos int4 en un repositorio de 2,1 GB.
- GPU recomendadas: no se especifican; el autor mide en Apple M2 Pro via WebGPU (Chrome 157). Se puede esperar que funcione en cualquier GPU con soporte WebGPU, aunque no hay datos de otras tarjetas.
- Cabe en GPU de consumo: si, mediante WebGPU en el navegador; el autor no publica pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: Transformers.js en navegador (WebGPU o WASM), s1s2 (github.com/eduardoworrel/s1s2) y onnxruntime-node en Node CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,51 s por decision en WebGPU y 6,1 s en CPU WASM sobre M2 Pro; memoria de pagina 0,6 GB (WebGPU) y 3,1 GB (CPU), con pico de 5,8 GB durante la carga en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2 | 2B | no disponible | Clasificacion GDPR/LGPD + generacion, ONNX int4 navegador | GPL-3.0 | Hugging Face, 1274 descargas |
| Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2 | 2B | no disponible | Mismo especialista en formato ONNX Runtime GenAI (build de referencia) | no disponible en la informacion | Hugging Face |
| BSC-LT/salamandra-2b-instruct | 2B | no disponible | Modelo instructivo generalista en ingles y portugues | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | no disponible | no disponible | Precursor del enfoque S1S2 en navegador | no disponible | Hugging Face |

## Limitaciones y advertencias
- Las cabezas de decision son archivos separados (heads/) que Transformers.js por si solo no lee; es necesario usar s1s2 para obtener la decision entrenada. El pipeline("decision") estandar concuerda solo en 14 de 20 prompts de comprobacion.
- La dimension de cabeza de la KV cache esta fijada en el grafo y el lm_head se divide en 8 partes por requisitos de Transformers.js y de memoria wasm32; aunque los pesos int4 son identicos byte a byte al build GenAI, el grafo difiere.
- El modelo solo declara soporte de ingles y portugues; no se documenta castellano ni otros idiomas.
- Riesgo de alucinacion en el modo generativo (System 2): las explicaciones se producen con los mismos pesos y no estan verificadas contra fuentes normativas.
- La licencia es GPL-3.0 por los datos GDPR-Transparency-200, lo que impone obligaciones de copyleft en uso comercial y distribucion; el modelo base es Apache-2.0 pero la licencia final prevalece.
- Los 20 prompts de paridad son una comprobacion del autor, no un conjunto de test independiente; no hay benchmarks publicados de calidad en tareas GDPR/LGPD.
- En CPU WASM la latencia es de 6,1 s por decision y el pico de memoria durante la carga alcanza 5,8 GB, lo que puede ser problematico en dispositivos modestos.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a textos adversarios.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decision (decide.ts): https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de Transformers.js para pipeline("decision"): https://github.com/huggingface/transformers.js/pull/1943
- Transformers.js: https://github.com/huggingface/transformers.js
- GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha: https://zenodo.org/records/13371639
- Kev (receta de cabeza y pointer head): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
