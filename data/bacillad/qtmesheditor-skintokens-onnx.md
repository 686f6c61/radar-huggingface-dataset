# bacillad/QtMeshEditor-skintokens-onnx

## Resumen

SkinTokens / TokenRig (export ONNX) es una reimplementación en formato ONNX del modelo de predicción automática de pesos de skin desarrollado por VAST-AI-Research. Dado un mesh 3D y un esqueleto, el modelo predice los pesos por vértice y por hueso necesarios para deformar la malla, es decir, resuelve la parte de *skinning* del proceso de rigging sin intervención manual. No es un modelo de lenguaje: utiliza un backbone Qwen3-0.6B como decodificador autoregresivo sobre una secuencia de tokens que representa el esqueleto y los pesos de skin.

La versión aquí descrita es un re-export a ONNX (cinco grafos más un manifiesto JSON) realizado por el autor `bacillad` para integrarse en QtMeshEditor como skinner por defecto, ejecutándose en local mediante ONNX Runtime. El repositorio ocupa 2,3 GB e incluye los pesos convertidos de bf16 a fp32 con paridad aproximada de 1e-5 frente a la implementación original en PyTorch.

Su relevancia práctica es doble: por un lado, expone un modelo de rigging asistido por IA en un formato portable y sin dependencia de PyTorch; por otro, documenta con precisión el contrato de inferencia (muestreo de superficie, tokenización del esqueleto, decodificación FSQ y transferencia a vértices), lo que facilita reproducirlo fuera de la herramienta original. La licencia es MIT tanto en código como en pesos, con datos de entrenamiento bajo CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador causal tipo Qwen3 (transformer con GQA) + encoder de nubes de puntos Michelangelo + CVAE de skinning + cuantizador FSQ; exportado como 5 grafos ONNX |
| Parametros totales | Backbone Qwen3-0.6B (≈0,6 mil millones) más encoders y cabezales; total agregado no disponible |
| Longitud de contexto | No aplica como ventana de texto: secuencia autoregresiva compuesta por prefijo de malla (384 tokens), tokens de esqueleto y 4 tokens de skin por articulación |
| Tipos de cuantizacion | Solo fp32 en este export (conversión bf16→fp32); no se publican variantes INT8, GGUF ni fp16 |
| Idiomas soportados | No disponible / no aplica: modelo de dominio 3D, no procesa lenguaje natural |
| Licencia | MIT (código y pesos originales); datos de entrenamiento Articulation-XL2.0 bajo CC-BY-4.0 |
| Formato de pesos | ONNX (opsets compatibles con ORT 1.20.1; `decoder.onnx` con pesos externos en `decoder.onnx.data`) + manifiesto `skintokens.json` |

Detalles de dimensión del LLM recogidos en el manifiesto: hidden 896, 28 capas, 8 cabezas KV, `head_dim` 128, `tokens_skin_cond=384`, latente CVAE 512, codebook FSQ de 32768 entradas, vocabulario total 33036.

## Arquitectura y entrenamiento

El sistema es un pipeline híbrido de varios módulos. `mesh_cond.onnx` contiene un encoder de nubes de puntos estilo Michelangelo que convierte la malla muestreada en un prefijo de condicionamiento para el LLM. `vae_cond.onnx` aplica un CVAE de skinning sobre los puntos muestreados. `embed.onnx` mapea identificadores de token a embeddings. `decoder.onnx` ejecuta un paso de decodificación causal con caché KV sobre el backbone Qwen3-0.6B, y `skin_decode.onnx` traduce los tokens FSQ predichos a pesos por articulación y por punto muestreado, con el cuantizador FSQ plegado dentro del grafo.

El entrenamiento original procede del proyecto SkinTokens/TokenRig de VAST-AI-Research, que formula el rigging completo (esqueleto y pesos) como una única secuencia de tokens y emplea un esquema autoregresivo. Los datos de entrenamiento corresponden a Articulation-XL2.0 (CC-BY-4.0); no se dispone de información sobre volumen de tokens, composición exacta del dataset ni sobre si se aplicaron fases de RLHF o DPO. La innovación técnica del export es de ingeniería: atención eager forzada, RMSNorm descompuesta para opset 18, FPS compatible con trazado y separación de pesos externos para evitar el fallo de segmentación de ONNX Runtime 1.20.1 al parsear protobufs de más de 1,6 GB en un solo fichero.

## Capacidades

- Predicción de pesos de skin por vértice a partir de un mesh y un esqueleto dados.
- Tokenización de esqueletos en orden DFS con discretización a 256 bins sobre `[-1,1]`, incluyendo tokens especiales (`bos=257`, `cls="articulation"=266`, `eos=258`).
- Decodificación autoregresiva greedy de `J × 4` tokens de skin, restringida al rango FSQ `[267, 33035)` y con EOS global en 33035.
- Transferencia de pesos desde los 8192 puntos muestreados a la malla completa mediante vecinos más cercanos (8-NN) con ponderación por distancia inversa.
- Soporte de topologías multi-raíz, con la condición de reparentar al primer root y reordenar en DFS antes de tokenizar.
- Ejecución local en CPU o GPU a través de ONNX Runtime, sin dependencia de PyTorch en tiempo de inferencia.
- Integración como herramienta MCP (`compute_skin_weights`) y en CLI/GUI dentro de QtMeshEditor.
- No soporta tool calling genérico, agentes conversacionales, visión ni procesamiento de lenguaje natural: su espacio de entrada es geometría y estructura de huesos.

## Casos de uso

- **Auto-rigging en pipelines de assets indie**: el modelo genera los pesos de skin de un personaje a partir del esqueleto ya definido, eliminando el pintado manual de pesos en Blender o Maya y reduciendo el tiempo por asset en proyectos con plantillas de esqueleto reutilizables.
- **Procesamiento por lotes en CI/CD**: al ejecutarse sobre ONNX Runtime y sin PyTorch, puede invocarse desde la CLI (`qtmesh skin`) en un job de integración continua que valide o regenere pesos al importar nuevos modelos FBX/GLB al repositorio.
- **Herramienta de escritorio integrada**: el diálogo "Compute Skin Weights" de QtMeshEditor lo usa como skinner por defecto, con un fallback geodésico-voxel cuando la predicción no supera los filtros de localización.
- **Agentes automatizados de manipulación de assets**: expuesto como herramienta MCP `compute_skin_weights`, permite que un agente reciba una malla y un esqueleto y devuelva el mesh con pesos aplicados dentro de una cadena de tareas multi-paso (importar, validar, rigging, exportar).
- **Previsualización rápida en visores web o de escritorio**: al ser ONNX, puede embeberse en aplicaciones nativas con DirectML o CoreML y ofrecer un primer rigging aproximado antes de un ajuste artístico manual.
- **Generación de datasets de skinning**: sirve para producir pares mesh-pesos a escala con fines de aumento de datos o de evaluación comparativa frente a métodos geométricos clásicos.
- **Prototipado de personajes en game jams**: con 0,6B de backbone y ~2,3 GB de pesos en fp32, cabe en equipos de gama media y permite iterar sobre esqueletos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos cuantitativos de la model card son de naturaleza técnica, no comparativa:

| Metrica | Valor reportado |
|---|---|
| Paridad ONNX vs PyTorch (por grafo) | ≈ 1e-5 |
| Bleed de pesos sin enmascarado geodésico | 0,74 |
| Bleed tras pase de localización geodésica de QtMeshEditor | 0,05 |
| Puntos muestreados por malla | 8192 |
| Tokens de skin por articulación | 4 |
| Vocabulario total | 33036 |

## Requisitos de hardware

- **VRAM estimada**: el repositorio contiene 2,3 GB de pesos en fp32; el grafo del decodificador con pesos externos ronda los 2,4 GB. Con activaciones, caché KV y los grafos auxiliares, una estimación razonable es 3–4 GB de VRAM en fp32.
- **GPU recomendadas**: cualquier GPU con 6 GB o más para margen (RTX 3060, RTX 4060, RTX 2070); A100/H100 no aportan ventaja significativa dado el tamaño del modelo, salvo por procesamiento en lote.
- **Consumer GPU**: sí, cabe en RTX 3060/4060 de 8 GB y en tarjetas de 4 GB con ajustes (por ejemplo GTX 1650 4 GB, al límite). En iGPU o CPU es viable pero más lento.
- **CPU**: inferencia posible con ONNX Runtime en CPU; al tratarse de un modelo de 0,6B y una secuencia corta, es un caso realista para estaciones sin GPU, aunque el muestreo de 8192 puntos y el cálculo 8-NN añaden coste.
- **Opciones de despliegue**: ONNX Runtime (CPU, CUDA, DirectML, CoreML); no aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de texto.
- **Latencia y throughput**: no disponibles. La model card no publica tiempos por malla ni por articulación.
- **Advertencia de runtime**: ONNX Runtime 1.20.1 sufre fallo de segmentación al parsear un proto único de más de 1,6 GB, de ahí el uso de `decoder.onnx.data` con pesos externos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SkinTokens/TokenRig ONNX (este repo) | ≈0,6B en el backbone + encoders (total no disponible) | Malla muestreada a 8192 puntos + esqueleto tokenizado | ONNX (fp32, pesos externos) | MIT (datos CC-BY-4.0) | HuggingFace, mirror en `fernandotonon/QtMeshEditor-models` |
| SkinTokens/TokenRig original (VAST-AI-Research) | Mismo modelo subyacente | Mismo contrato de inferencia | PyTorch | MIT | GitHub de VAST-AI-Research |
| Otras alternativas de rigging automático (p. ej. RigNet, UniRig) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es frente al original en PyTorch: los pesos son idénticos y la diferencia es el formato y el runtime. Para el resto de alternativas del dominio no se dispone de datos verificados en la información proporcionada, por lo que no se comparan cifras.

## Limitaciones y advertencias

- **Predicciones difusas por diseño**: las salidas crudas del modelo están deliberadamente dispersas; el demo original las enmascara por voxels y QtMeshEditor aplica un pase de localización geodésica. Sin ese postproceso, el bleed medido es de 0,74 frente a 0,05 con filtrado.
- **Dependencia del preprocesado exacto**: la normalización debe replicar `AugmentAffine` con los joints incluidos en el AABB y un ajuste exacto a `[-1,1]`; desviaciones en este paso degradan la predicción.
- **Topologías multi-raíz**: requieren reparentar al primer root y reordenar en DFS, lo que puede alterar la semántica del esqueleto si se hace de forma incorrecta.
- **Pérdida de detalle geométrico**: la predicción se hace sobre 8192 puntos y se transfiere por 8-NN con distancia inversa, lo que puede introducir imprecisión en mallas de alta densidad o con detalles finos.
- **Sin benchmarks publicados**: no hay métricas estándar de calidad de skinning en la información disponible, por lo que la evaluación debe hacerse con validación propia sobre el asset concreto.
- **Licencia y atribución**: el código y los pesos son MIT, pero los datos de entrenamiento (Articulation-XL2.0) son CC-BY-4.0, lo que exige atribución a VAST-AI-Research. Verificar la cadena de licencias antes de uso comercial a gran escala.
- **Restricciones de runtime**: el export está ajustado a ONNX Runtime 1.20.1 con pesos externos; versiones distintas o un empaquetado en un único proto pueden fallar.
- **Fuera de dominio**: no procesa lenguaje, no soporta tool calling conversacional y no debe presentarse como un LLM; su uso como modelo de texto produciría resultados sin sentido.
- **Riesgo de alucinación geométrica**: en esqueletos muy alejados de la distribución de Articulation-XL2.0 (por ejemplo, criaturas no humanoides o cadenas cinemáticas atípicas) los pesos pueden ser incorrectos sin señal de confianza explícita.

## Enlaces

- Repositorio HuggingFace de este export: https://huggingface.co/bacillad/QtMeshEditor-skintokens-onnx
- Mirror del export de referencia: https://huggingface.co/fernandotonon/QtMeshEditor-skintokens-onnx
- Repositorio compartido de modelos de QtMeshEditor: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Repositorio GitHub de QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Issue de integración en QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor/issues/819
- Repositorio GitHub de SkinTokens (VAST-AI-Research): https://github.com/VAST-AI-Research/SkinTokens
- Organización VAST-AI-Research: https://github.com/VAST-AI-Research
- Catálogo de modelos de ONNX Runtime: https://onnxruntime.ai/models
- Paper de SkinTokens/TokenRig: no disponible en la informacion proporcionada
