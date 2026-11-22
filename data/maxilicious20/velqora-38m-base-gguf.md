# Maxilicious20/Velqora-38M-Base-GGUF

## Resumen

Velqora-38M-Base-GGUF es la distribucion en formato GGUF del modelo Velqora-38M-Base, un modelo de lenguaje causal decoder-only de aproximadamente 38 millones de parametros entrenado desde cero por el autor independiente Maxilicious20 sobre una unica GPU de consumo NVIDIA RTX 4060 con 8 GB de VRAM. Se trata de un proyecto de investigacion y experimentacion, no de un modelo orientado a produccion, cuyo interes principal radica en demostrar que es posible entrenar y publicar un transformer completo con tokenizer propio y pesos cuantizados en hardware asequible.

El repositorio ofrece tres archivos GGUF con distintos niveles de cuantizacion (F16, Q8_0 y Q4_K_M), lo que permite ejecutar el modelo en CPU o en GPUs de gama baja mediante llama.cpp. La arquitectura declarada en los metadatos GGUF es `qwen3`, con atencion de tipo GQA, SwiGLU, RMSNorm y QK-Norm por cabeza, un diseno moderno pero aplicado a un modelo de escala muy reducida.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como banco de pruebas para pipelines de conversion a GGUF, para estudiar el comportamiento de modelos pequenos entrenados desde cero y para validar flujos de inferencia local. No debe confundirse con un modelo de proposito general: su ventana de contexto es de solo 1.024 tokens, su vocabulario de 8.192 tokens y su idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; arquitectura GGUF `qwen3` (RoPE NeoX half-split, GQA, SwiGLU, RMSNorm, QK-Norm por cabeza) |
| Parametros totales | 38.025.227 (~38,03 M) segun model card; 42.219.520 segun safetensors del repo base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (RoPE base θ = 10.000) |
| Tipos de cuantizacion | F16 (80,83 MB), Q8_0 (43,09 MB), Q4_K_M (26,67 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M); repo base en PyTorch/safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de 12 capas con dimension oculta de 512 y capa SwiGLU de 1.408 unidades. La atencion usa 8 cabezas de consulta y 2 cabezas de clave-valor (GQA con ratio 4:1), con QK-Norm por cabeza y RoPE de tipo NeoX half-split con base 10.000. El tokenizer es un BPE byte-level personalizado de 8.192 tokens, embebido en los metadatos del GGUF. La arquitectura declarada en el archivo GGUF es `qwen3`, lo que indica compatibilidad con el grafo de ejecucion de llama.cpp para esa familia.

El entrenamiento se realizo desde cero sobre una unica NVIDIA RTX 4060 de 8 GB, segun declara el autor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o instruccion. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La model card advierte que el escalar de residuo de valor de la capa 0 (`v_res_alpha`) se omite en la ejecucion estandar del grafo GGUF, aunque se preservan las proyecciones principales, los pesos de QK-Norm, las frecuencias RoPE y el vocabulario BPE.

## Capacidades

- Generacion de texto autoregresiva en ingles, con pipeline `text-generation`.
- Modelo base (no instruido): no se documenta soporte de chat, roles ni plantillas de conversacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- Multilingue limitado: solo ingles declarado; el tokenizer de 8.192 tokens esta orientado a ese idioma.
- Sin vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad de inferencia local en CPU o GPU de gama baja gracias a los tres niveles de cuantizacion GGUF.
- Compatibilidad con el ecosistema llama.cpp y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Investigacion sobre entrenamiento desde cero: sirve como referencia reproducible de un transformer completo (tokenizer, pesos y conversion GGUF) para estudiar el impacto de la escala y del hardware de consumo en la calidad del modelo.
- Validacion de pipelines de cuantizacion: los tres archivos (F16, Q8_0, Q4_K_M) permiten comparar la degradacion de la perplejidad y de la coherencia entre niveles de cuantizacion en un mismo modelo.
- Pruebas de integracion con llama.cpp: util para verificar la compatibilidad del grafo `qwen3`, la carga de metadatos y el comportamiento de `llama-cli` en entornos de CI o entornos embebidos.
- Docencia y divulgacion: ejemplo practico de arquitectura moderna (GQA, SwiGLU, RMSNorm, QK-Norm) a escala manejable para explicar cada componente sin necesidad de infraestructura grande.
- Benchmarking de hardware: al ocupar entre 26 y 81 MB, permite medir latencia y throughput en CPU, GPUs integradas y GPUs de gama baja con un coste de almacenamiento minimo.
- Prototipado de completado de texto muy acotado: tareas de continuacion de frases cortas en ingles dentro de la ventana de 1.024 tokens, siempre con supervision humana y sin uso en produccion.
- Pruebas de robustez y alucinacion: modelo de referencia para estudiar como se degradan las respuestas factuales en modelos de muy pocos parametros y baja cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los formatos (26,67 MB en Q4_K_M, 43,09 MB en Q8_0, 80,83 MB en F16), mas el overhead del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo se entreno en una RTX 4060 de 8 GB, pero la inferencia cabe en GPUs mucho menores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, etc.); no se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera que sea muy bajo en latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Velqora-38M-Base-GGUF | ~38 M (42,2 M en safetensors) | 1.024 | Ingles | Apache-2.0 | GGUF | Entrenado desde cero en RTX 4060; modelo base |
| SmolLM-135M | 135 M | 2.048 | Ingles | Apache-2.0 | Safetensors, GGUF | Modelo base de mayor escala, entrenado con corpus a gran escala |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingue | Apache-2.0 | Safetensors, GGUF | Modelo base e instruido, mucho mayor y con contexto amplio |
| TinyLlama-1.1B | 1,1 B | 2.048 | Ingles | Apache-2.0 | Safetensors, GGUF | Modelo base e instruido de escala superior |

Las cifras de los modelos comparables corresponden a sus especificaciones publicas habituales; no se dispone de comparaciones de rendimiento directas con Velqora-38M-Base en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de ~38 M de parametros entrenado desde cero: alta probabilidad de alucinaciones factuales y errores aritmeticos, especialmente en Q4_K_M, segun advierte el propio autor.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Modelo base sin instruccion: no sigue instrucciones de forma fiable ni esta alineado para seguridad.
- Entrenado en hardware de consumo y sin documentacion sobre composicion del dataset: no se pueden evaluar sesgos de forma rigurosa.
- La omision del escalar `v_res_alpha` de la capa 0 en la ejecucion GGUF puede introducir diferencias respecto al modelo original en PyTorch.
- No apto para produccion ni para usos criticos de seguridad, segun la propia model card.
- Licencia Apache-2.0: permite uso comercial, pero la calidad del modelo hace desaconsejable cualquier despliegue real sin validacion exhaustiva.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Maxilicious20/Velqora-38M-Base-GGUF
- Repositorio base (PyTorch): https://huggingface.co/Maxilicious20/Velqora-38M-Base
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado en la busqueda web papers, blogs, repos adicionales ni demos asociados al modelo.
