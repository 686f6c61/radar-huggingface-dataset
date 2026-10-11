# AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4

## Resumen

AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4 es un checkpoint cuantizado en formato MLX desarrollado por AutomatosX, obtenido por conversion directa del modelo BF16 tencent/Hy-MT2-30B-A3B. Se trata de una version de precision mixta (AXQuant, version 2.1.0) disenada especificamente para Apple Silicon y ejecutable con la libreria MLX-LM. El modelo base emplea una arquitectura de mezcla de expertos (MoE) de tipo `HYV3ForCausalLM`, con 30.064.719.872 parametros logicos en total (la nomenclatura "A3B" del modelo base sugiere unos 3B parametros activos por token, dato no confirmado en la informacion disponible).

El paquete se distribuye bajo la clase de presupuesto de almacenamiento MXFP4, con un BPW (bits por peso) medido de 4,3260 en el modelo principal y un tamano de safetensors de 16,26 GB (16,29 GB de descarga completa). La ventana de contexto configurada es de 262.144 tokens, si bien el propio autor advierte que los limites practicos dependen de la memoria unificada del equipo. No incluye cabeceras MTP, vision ni audio.

Es relevante ahora porque demuestra un flujo de cuantizacion mixta orientado a hardware de Apple, pero el propio autor lo etiqueta de forma explicita como "evidencia de desarrollo, no una release certificada de AXQuant": no se publican datos de calidad, de contexto largo, de velocidad de kernel ni de aceptacion MTP, por lo que debe tratarse como un artefacto de evaluacion local y no como una afirmacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), clase `HYV3ForCausalLM` |
| Parametros totales | 30.064.719.872 (30,06B) |
| Parametros activos | Aproximadamente 3B (inferido de la nomenclatura "A3B" del modelo base; no confirmado en la informacion disponible) |
| Longitud de contexto | 262.144 tokens configurados (limite practico segun memoria unificada; no validado) |
| Tipos de cuantizacion | AXQuant 2.1.0; metodos `affine`, `bf16`, `mxfp4`; grupo de 32 y 64; BPW medido 4,3260 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |

Detalle de la distribucion de precision de los pesos principales:

| Precision | Parametros | Proporcion |
|---|---:|---:|
| `4bit` | 29,56B | 98,31% |
| `8bit` | 507,25M | 1,69% |
| `bf16` | 216.960 | 0,00% |

## Arquitectura y entrenamiento

El modelo base tencent/Hy-MT2-30B-A3B utiliza una arquitectura de mezcla de expertos (MoE) de tipo decoder transformer, identificada internamente como `HYV3ForCausalLM`, orientada a la ruta de texto. El repositorio de AutomatosX no entrena el modelo desde cero: realiza una conversion y cuantizacion del checkpoint BF16 original (revision `d3ead4dba61c09aac60a261a96ad1df3e705febb`), preservando a mayor precision un conjunto de tensores protegidos (embeddings, capas de normalizacion y otros).

La cuantizacion se ejecuta con AXQuant 2.1.0 bajo un presupuesto de almacenamiento MXFP4. Se registraron 18.433 de 18.433 conversiones de modulo correctas, con 0 fallbacks. La asignacion de precision se baso en priors de arquitectura (`architecture_prior`), sin proceso de calibracion. No hay datos en la informacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base recibio RLHF o DPO. Este paquete no incluye sidecar MTP (MTP present: False), por lo que no se anuncia aceleracion por decodificacion especulativa ni multitoken prediction.

## Capacidades

- Generacion de texto conversacional y de proposito general (pipeline `text-generation`).
- Inferencia de texto y backbone estandar mediante MLX-LM.
- Compatibilidad con arquitectura MoE del modelo base, optimizada para la ruta de texto.
- No incluye cabecera de vision (`Vision present: False`): no hay capacidades vision-lenguaje.
- No incluye cabecera de audio (`Audio present: False`): no hay reconocimiento de voz.
- No incluye sidecar MTP (`MTP present: False`): no hay decodificacion especulativa ni MTP.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (no se documenta explicitamente en la model card).
- Capacidades multilingues: no disponible (el campo de idiomas de HuggingFace no esta cumplimentado).

## Casos de uso

- Evaluacion local de cuantizacion mixta en Apple Silicon: usar MLX-LM para comparar la salida de este checkpoint MXFP4 de 4,3260 BPW frente a los siblings de 4 bits y 6 bits, y medir degradacion cualitativa sobre un conjunto propio de prompts.
- Prototipado de asistentes conversacionales en un Mac: desplegar `mlx_lm.generate` con temperatura 0,0 para tareas de generacion de texto reproducible en un equipo con memoria unificada suficiente (el paquete ocupa 16,29 GB).
- Pruebas de contexto largo en hardware de consumo: aprovechar la capacidad configurada de 262.144 tokens para experimentar con resumenes de documentos extensos, asumiendo que el limite real dependera de la memoria unificada disponible.
- Desarrollo de pipelines internos de generacion de texto sobre macOS: integrar el modelo en scripts y flujos de trabajo locales donde no se requiere certificacion de produccion, dado el caracter de "evidencia de desarrollo" del artefacto.
- Investigacion sobre tecnicas AXQuant: analizar el layout de precision mixta (98,31% en 4 bits, 1,69% en 8 bits) para estudiar como los protection floors afectan al tamano y al BPW final del artefacto.
- Comparacion de formatos de despliegue: utilizar este checkpoint como referencia de la ruta MLX frente a otros formatos, teniendo en cuenta que el repositorio no incluye pesos PyTorch ni GGUF y que la ruta de ejecucion nativa de AX Engine no esta establecida.
- Validacion de integridad de artefactos: emplear los registros de conversion (18.433 modulos, 0 fallbacks) como material para reproducir y verificar la conversion en entornos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica explicitamente que no publica evidencia de calidad, de contexto largo, de velocidad de kernel ni de velocidad MTP, y que la etiqueta de producto AXQ no debe interpretarse como una afirmacion de benchmark. Tampoco se declara retencion de calidad frente a BF16 o a lineas base uniformes.

## Requisitos de hardware

- VRAM/memoria estimada: el paquete ocupa 16,26 GB de safetensors y aproximadamente 16,29 GB de descarga, por lo que se recomienda un minimo de 24 GB de memoria unificada y, de forma comoda, 32 GB o mas para margen de contexto y estados de cache KV.
- GPU recomendadas: arquitectura Apple Silicon (familias M1/M2/M3/M4 y superiores con memoria unificada suficiente). No aplica a GPUs NVIDIA o AMD en este formato.
- Compatibilidad con GPU de consumo: si, en equipos Apple Silicon con memoria unificada adecuada (por ejemplo, configuraciones de 32 GB o 48 GB o superiores). El limite practico de contexto dependera de la memoria unificada disponible.
- Opciones de despliegue: MLX-LM como runtime primario (`mlx_lm.generate`). La ejecucion nativa en AX Engine no esta establecida porque el paquete no incluye un `model-manifest.json` validado. No se admiten vLLM, llama.cpp, Ollama ni TGI al no distribuirse en formato GGUF ni PyTorch.
- Latencia y throughput: no disponible. No se han medido velocidades de kernel ni de MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4 | 30,06B (MoE) | 262.144 tokens | MLX Safetensors (4,3260 BPW) | Apache 2.0 | Paquete a evaluar; sin benchmarks publicados |
| AX-Hy-MT2-30B-A3B-MLX-AXQ-4bit | 30,06B (MoE) | No disponible | MLX Safetensors | Apache 2.0 | Sibling de menor presupuesto de almacenamiento; consultar su BPW exacto |
| AX-Hy-MT2-30B-A3B-MLX-AXQ-6bit | 30,06B (MoE) | No disponible | MLX Safetensors | Apache 2.0 | Sibling con mayor precision media, cerca del presupuesto de 6 BPW |
| tencent/Hy-MT2-30B-A3B | 30,06B (MoE) | No disponible | BF16 | No disponible | Modelo base original sin cuantizar |

No se dispone de datos de benchmarks para comparar el rendimiento entre estas variantes. La comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Artefacto sin certificar: el autor declara que es "evidencia de desarrollo", no una release certificada de AXQuant, y que las puertas formales M0-M8 no estan cerradas.
- Sin datos de calidad: no se publica ninguna afirmacion de retencion de calidad frente a BF16 ni frente a lineas base uniformes; la calidad real del checkpoint no esta verificada.
- Contexto no validado: los 262.144 tokens son metadatos de configuracion, no una capacidad de contexto largo validada.
- Sin aceleracion MTP: no hay sidecar MTP ni medicion de velocidad, por lo que no debe esperarse decodificacion especulativa.
- Limitaciones de plataforma: disenado para Apple Silicon y MLX-LM; no es utilizable directamente en GPUs NVIDIA/AMD ni en runtimes como vLLM, llama.cpp, Ollama o TGI.
- AX Engine no soportado en este paquete: falta un `model-manifest.json` nativo validado, por lo que la ejecucion en AX Engine no esta establecida.
- Idiomas no documentados: el campo de idiomas en HuggingFace no esta cumplimentado, y no se especifica cobertura multilingue.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; no se han publicado evaluaciones al respecto.
- Licencia: Apache 2.0 en este paquete; conviene verificar la licencia y condiciones del modelo base tencent/Hy-MT2-30B-A3B antes de un uso comercial.
- Calibracion ausente: la asignacion de precision se basa en priors de arquitectura, sin calibracion, lo que puede afectar a la calidad en dominios concretos.
- Reproducibilidad: se recomienda fijar el commit del Hub en lugar de depender indefinidamente de `main`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-MXFP4
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B/tree/d3ead4dba61c09aac60a261a96ad1df3e705febb
- Sibling 4 bits: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-4bit
- Sibling 6 bits: https://huggingface.co/AutomatosX/AX-Hy-MT2-30B-A3B-MLX-AXQ-6bit
- Coleccion MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/mlx
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Repositorio GitHub de AutomatosX: https://github.com/defai-digital/automatosx
- Releases de AutomatosX: https://github.com/defai-digital/AutomatosX/releases
