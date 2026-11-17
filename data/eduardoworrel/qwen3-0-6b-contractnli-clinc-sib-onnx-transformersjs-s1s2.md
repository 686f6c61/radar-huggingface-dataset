# eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2

## Resumen

Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2 es una especializacion del modelo base Qwen/Qwen3-0.6B (0,6 mil millones de parametros, licencia Apache-2.0) publicada por el usuario eduardoworrel. No se trata de un modelo generativo de proposito general, sino de un clasificador de tareas construido sobre el transformer de Qwen3: el grafo ONNX expone el estado oculto final por token y una serie de cabezas de decision separadas (en `heads/`) que un runtime propio llamado S1S2 lee para emitir decisiones de clasificacion. El paquete incluye cabezas y prompts para tres tareas: ContractNLI (inferencia de clausulas en contratos), CLINC150 (clasificacion de intenciones en dialogo) y SIB-200 (clasificacion tematica multilingue).

El modelo se distribuye en dos layouts equivalentes: este repositorio, en formato Transformers.js (`config.json` + `onnx/model_q4.onnx` con pesos int4), y una build de referencia en ONNX Runtime GenAI. Segun el autor, los pesos int4 son identicos byte a byte entre ambos y solo cambian metadatos y nombres de fichero, por lo que la precision reportada en la build GenAI aplica a esta. La verificacion de paridad se hizo con 20 prompts en CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1), con diferencia maxima de 0 en estados ocultos y probabilidades de cabeza, y 20/20 decisiones identicas. La build WebGPU para este layout no se ha ejecutado todavia.

Es relevante para desarrolladores que necesiten clasificacion ligera en el navegador o en Node sin infraestructura GPU: el repo ocupa 0,4 GB, los pesos son int4 y el modelo base es pequeno. La licencia es CC BY-SA 4.0 por la inclusion de SIB-200 en los datos de entrenamiento, lo que impone obligaciones de atribucion y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) exportado a ONNX con cabezas de clasificacion externas |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (unico formato publicado, `model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (int4), layout Transformers.js; cabezas en `heads/`; manifiestos JSON |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se exporta a ONNX manteniendo el grafo de atencion con la dimension de cabeza de la KV cache fijada (requisito de Transformers.js). La salida relevante no es la distribucion de logits generativa, sino `hidden_states`, el estado oculto final por token, que alimenta una serie de cabezas de decision almacenadas como ficheros separados. El autor describe el diseno como una separacion System 1 / System 2 con una compuerta de margen, idea atribuida a CT0 de Alias Robotics, y cita como precursor el paper "Browser Immune System" (arXiv 2611.15302) y el modelo alias3-web.

El entrenamiento combina tres conjuntos de datos: ContractNLI (Koreeda y Manning, 2021; CC BY 4.0) para inferencia de clausulas contractuales, CLINC150 (Larson et al., 2019; CC BY 3.0) para clasificacion de intenciones con clase fuera de dominio, y SIB-200 (Adelani et al., 2024; CC BY-SA 4.0) para clasificacion tematica multilingue. La receta de entrenamiento y la cabeza de tipo pointer se atribuyen a Kev (jaredpalmer/kev, Apache-2.0). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Clasificacion de inferencia de clausulas en contratos (ContractNLI): determina relaciones de entailment, contradiccion o neutralidad sobre fragmentos contractuales.
- Clasificacion de intenciones en dialogo (CLINC150), incluyendo deteccion de consultas fuera de dominio.
- Clasificacion tematica multilingue (SIB-200) para ingles y portugues.
- Exposicion del estado oculto final por token para uso programatico por parte del runtime S1S2.
- Inferencia en Node (onnxruntime-node) y en navegador via Transformers.js; la build WebGPU de este layout no se ha validado.
- No soporta generacion de texto libre como pipeline estandar de Transformers.js: las cabezas de decision son ficheros separados leidos por s1s2.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Clasificacion de clausulas en contratos: integrado en un pipeline de revision legal, el modelo etiqueta fragmentos de contratos segun ContractNLI para prefiltrar clausulas que requieran revision humana, aprovechando que el paquete incluye la cabeza y el prompt especificos (`manifest.cnli.json`).
- Enrutamiento de intenciones en asistentes conversacionales: con la cabeza CLINC150 (`manifest.clinc.json`) se clasifica la intencion del usuario en un turno de dialogo y se detecta cuando la consulta queda fuera de dominio, lo que permite derivar a fallback.
- Clasificacion tematica de documentos en ingles y portugues: con SIB-200 (`manifest.sib_en.json`, `manifest.sib_pt.json`) se etiqueta el tema de textos en ambos idiomas, util para triaje de tickets o catalogacion.
- Clasificacion en el navegador sin backend: al ejecutarse con Transformers.js y pesos int4 de 0,4 GB, permite desplegar el clasificador en una aplicacion web cliente sin enviar los textos a un servidor, relevante para datos sensibles.
- Filtrado previo en pipelines de procesamiento documental: el modelo puede actuar como primer nivel de clasificacion antes de modelos mayores, reduciendo coste computacional en volumen alto.
- Prototipado rapido de tareas de clasificacion: el layout Transformers.js y los manifiestos JSON permiten cargar el modelo con una sola llamada (`S1S2.load`) y sustituir la cabeza segun la tarea sin reentrenar el transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una verificacion de paridad con la build GenAI: 20 prompts en CPU (onnxruntime-node 1.30.0, transformers.js 4.3.1), con diferencia maxima de 0 en estados ocultos y probabilidades de cabeza, y 20/20 decisiones identicas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 0,4 GB con pesos int4, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no disponible; la validacion reportada se hizo en CPU con onnxruntime-node.
- Compatibilidad con GPU de consumo: previsiblemente si por tamano (0,6B parametros en int4), aunque no se documenta prueba en GPU concreta.
- Opciones de despliegue: Transformers.js en Node y navegador (WebGPU no validado para este layout), onnxruntime-node, runtime S1S2 (`@s1s2/web`); la build de referencia usa ONNX Runtime GenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3-0.6B especializado) | 0,6B | no disponible | ONNX int4, Transformers.js | CC BY-SA 4.0 | Clasificador con cabezas para ContractNLI, CLINC150 y SIB-200 |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | safetensors, GGUF, ONNX | Apache-2.0 | Generativo de proposito general; sin cabezas de clasificacion |
| Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2 | 0,6B | no disponible | ONNX int4, ONNX Runtime GenAI | CC BY-SA 4.0 | Misma especializacion en layout GenAI; build de referencia |
| alias3-web (Alias Robotics) | no disponible | no disponible | no disponible | no disponible | Precursor citado por el autor |

## Limitaciones y advertencias

- No es un modelo generativo de proposito general ni un pipeline estandar de Transformers.js: las cabezas de decision son ficheros separados que solo lee el runtime s1s2.
- La KV cache tiene la dimension de cabeza fijada en el grafo por requisito de Transformers.js, lo que puede limitar variaciones de configuracion.
- La build WebGPU de este layout no se ha ejecutado; solo se valido en CPU con Node.
- Idiomas limitados a ingles y portugues; el resto de idiomas no esta cubierto por las cabezas publicadas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un clasificador, el riesgo se traslada a errores de etiquetado.
- Licencia CC BY-SA 4.0 con clausula ShareAlike por la inclusion de SIB-200: obliga a atribucion y a compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- La fecha de creacion indicada (2026-11-17) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-transformersjs-S1S2
- Build de referencia GenAI: https://huggingface.co/eduardoworrel/Qwen3-0.6B-ContractNLI-CLINC-SIB-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Runtime S1S2: https://github.com/eduardoworrel/s1s2
- Transformers.js: https://github.com/huggingface/transformers.js
- ContractNLI: https://stanfordnlp.github.io/contract-nli/
- CLINC150: https://github.com/clinc/oos-eval
- SIB-200: https://huggingface.co/datasets/Davlan/sib200
- Kev (receta de entrenamiento): https://github.com/jaredpalmer/kev
- alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
