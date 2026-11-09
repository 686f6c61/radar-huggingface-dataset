# eulermaxwell/AnalogRetriever

## Resumen

AnalogRetriever es un modelo de recuperación cross-modal desarrollado por Yihan Wang, Lei Li, Yao Lai, Jing Wang y Yan Lu, presentado en la conferencia ICCAD 2026. Resuelve un problema específico del diseño de circuitos analógicos: dado un esquema visual, una descripción funcional en lenguaje natural o una netlist SPICE, recuperar el circuito correspondiente en cualquiera de las otras modalidades. Esto permite reutilizar circuitos existentes en lugar de rediseñarlos desde cero, algo crítico en un dominio donde la propiedad intelectual reutilizable es escasa y el diseño manual consume mucho tiempo.

La arquitectura combina un codificador visual CLIP ViT-L/14 afinado con un codificador de grafos relacional (RGCN) consciente de puertos que procesa las netlists SPICE como grafos. Se entrena con un currículo de tres fases y un esquema de minado de negativos duros basado en clústeres de Qwen3-Embedding. El contexto textual está limitado a los 77 tokens nativos de CLIP, lo que condiciona el tratamiento de descripciones funcionales largas.

Es relevante ahora porque demuestra que la representación cross-modal puede aplicarse con éxito a un dominio científico-técnico muy especializado (EDA), superando ampliamente los baselines zero-shot (CLIP, CROP, ChatLS, NetTAG) y estableciendo un punto de referencia para tareas de recuperación en ingeniería electrónica. El repositorio ocupa 7,0 GB e incluye cuatro checkpoints (el modelo principal y tres ablaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 (codificador de imagen y texto) + RGCN consciente de puertos (codificador de grafo de netlist) |
| Parametros totales | no disponible (repo de 7,0 GB con cuatro checkpoints; pesos CLIP ViT-L/14 incluidos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens para descripciones textuales (límite nativo de CLIP) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `state_dict` en bf16 durante entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (CLIP y el material fuente Masala-CHAI conservan sus propios términos) |
| Formato de pesos | PyTorch `state_dict` (`.pth`) con sidecar `.metadata.json` (tipo de modelo, configuración, época seleccionada, esquema de grafo y SHA-256) |

## Arquitectura y entrenamiento

El modelo es un sistema de recuperación de dos torres: una torre visual/textual basada en CLIP ViT-L/14 afinado y una torre de grafos que codifica la netlist SPICE mediante un RGCN (Relational Graph Convolutional Network) consciente de puertos. El esquema de grafo consta de 24 tipos de nodo y 20 tipos de relación. Se congelan los 16 bloques inferiores de los 24 del ViT. El entrenamiento se realizó con un currículo de tres fases (6, 2 y 12 épocas respectivamente) sobre 6.371 tripletas refinadas de Masala-CHAI, divididas en 5.371 de entrenamiento y 1.000 de held-out con semilla 42. Batch size 256, AdamW con learning rate 5e-5 para CLIP y 5e-4 para el codificador de grafos, label smoothing 0,1 y autocast bf16 en una NVIDIA H200 con PyTorch 2.15.0 y CUDA 13.2.

La innovación principal es la incorporación de negativos duros minados mediante K = 30 clústeres de Qwen3-Embedding, con ratio que escala de 0,05 a 0,3 a lo largo del entrenamiento. Los checkpoints se seleccionan por la media de R@1 en Image→Code, Text→Image y Text→Code sobre el split held-out. El codificador de grafos y el de CLIP comparten parámetros CLIP registrados una vez por codificador con AdamW (`--clip_optimizer_mode legacy_cuda_duplicate`). Existen tres ablaciones publicadas: TIC con RGCN, TIC con GCN y TI (CLIP bimodal sin netlist).

## Capacidades

- Recuperación Image→Code: a partir de una imagen de esquema, devuelve la netlist SPICE correspondiente.
- Recuperación Text→Image: a partir de una descripción funcional, devuelve el esquema visual del circuito.
- Recuperación Text→Code: a partir de una descripción funcional, devuelve la netlist SPICE.
- Recuperación Code→Image: a partir de una netlist, devuelve el esquema visual.
- Recuperación Image→Text: a partir de un esquema, devuelve la descripción funcional.
- Recuperación Code→Text: a partir de una netlist, devuelve la descripción funcional.
- Codificación de grafos de netlist con estructura relacional tipada (24 tipos de nodo, 20 tipos de relación) y consciencia de puertos.
- Representación compartida entre tres modalidades (imagen, texto y grafo) en un espacio latente común.
- No se documenta soporte de tool calling, function calling, agentes, visión general, audio ni thinking mode.

## Casos de uso

- Reutilización de IP analógica en flujos de diseño: dado un esquema dibujado a mano o capturado de una hoja de especificaciones, recuperar la netlist SPICE existente en la biblioteca interna para evitar rediseñar el bloque. Adecuado porque la recuperación Image→Code alcanza R@1 de 72,9 % sobre el split held-out.
- Búsqueda por especificación funcional: un ingeniero describe verbalmente ("amplificador de transconductancia con degeneración de fuente") y el modelo devuelve esquemas y netlists candidatos. Útil en fases tempranas de exploración de topologías, aunque limitado a descripciones de hasta 77 tokens.
- Indexación y catalogación de bibliotecas de circuitos: codificar automáticamente esquemas, descripciones y netlists de una biblioteca corporativa en un espacio común para habilitar búsqueda interna cross-modal.
- Asistente de documentación técnica: dado un esquema, generar la descripción funcional asociada (Image→Text, R@1 77,3 %) para completar fichas de circuito o documentación de IP.
- Verificación de correspondencia esquema-netlist: comprobar si un esquema y una netlist recuperados como pares coinciden realmente (Code→Image 70,7 %, Text→Code 74,6 %), como paso de pre-validación antes de simulación.
- Enseñanza y formación en diseño analógico: buscar circuitos de libro de texto por descripción o esquema para ilustrar topologías canónicas; el dataset está mayoritariamente compuesto por circuitos de estilo libro de texto, lo que encaja con este uso.
- Construcción de pipelines de minado de negativos y fine-tuning de recuperadores EDA: los cuatro checkpoints y los logs de entrenamiento permiten reproducir y extender el método a otros dominios de EDA.

## Benchmarks y rendimiento

Recall@1 (%) sobre 1.000 tripletas held-out, promediado sobre diez galerías de 200 elementos (I: imagen de esquema, T: descripción, C: netlist).

| Modelo | I→C | T→I | T→C | C→I | I→T | C→T | Avg |
|---|---|---|---|---|---|---|---|
| CLIP (zero-shot) | 1,2 | 2,2 | 2,9 | 2,9 | 2,7 | 3,2 | 2,5 |
| CROP (zero-shot) | 2,1 | 2,2 | 9,1 | 2,3 | 2,7 | 8,5 | 4,5 |
| ChatLS (zero-shot) | 1,5 | 2,2 | 11,8 | 1,8 | 2,7 | 8,3 | 4,7 |
| NetTAG (zero-shot) | 0,4 | 2,2 | 0,3 | 0,4 | 2,7 | 0,1 | 1,1 |
| TI (`ti.pth`) | – | 76,8 | – | – | 76,1 | – | – |
| TIC (GCN) (`tic_gcn.pth`) | 69,7 | 75,6 | 74,0 | 67,5 | 76,4 | 70,2 | 72,3 |
| TIC (RGCN) (`tic_rgcn.pth`) | 71,9 | 76,0 | 75,7 | 69,2 | 76,5 | 72,4 | 73,6 |
| AnalogRetriever (`analogretriever.pth`) | 72,9 | 78,5 | 74,6 | 70,7 | 77,3 | 71,7 | 74,3 |

Los valores Recall@5 y Recall@10 por modelo están disponibles en el directorio `results/` del repositorio.

## Requisitos de hardware

- Entrenamiento documentado en una única NVIDIA H200 con bf16 autocast; no se publican requisitos mínimos de entrenamiento.
- Inferencia: el repositorio ocupa 7,0 GB e incluye pesos CLIP ViT-L/14 más los codificadores de grafo; la VRAM necesaria para servir un único checkpoint no está cuantificada en la información disponible.
- No se documentan GPU recomendadas para inferencia, ni si cabe en GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue documentadas: script oficial `analogretriever.evaluation.evaluate_retrieval` sobre PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables directamente a este tipo de modelo de recuperación con torre de grafos).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Avg R@1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnalogRetriever | no disponible | 77 tokens (texto) | 74,3 % | MIT | Hugging Face (checkpoints `.pth`) |
| TIC (RGCN) | no disponible | 77 tokens (texto) | 73,6 % | MIT (ablación del mismo repo) | Hugging Face (mismo repo) |
| TI (CLIP bimodal) | CLIP ViT-L/14 | 77 tokens | 76,1–76,8 % en T→I e I→T | MIT (ablación del mismo repo) | Hugging Face (mismo repo) |
| NetTAG (zero-shot) | no disponible | no disponible | 1,1 % | no disponible | baseline del paper |
| ChatLS (zero-shot) | no disponible | no disponible | 4,7 % | no disponible | baseline del paper |

No se dispone de otros modelos públicos de recuperación cross-modal específicos para circuitos analógicos con los que comparar fuera de las ablaciones y baselines del propio paper.

## Limitaciones y advertencias

- El dataset está compuesto mayoritariamente por circuitos analógicos de estilo libro de texto, por lo que la generalización a topologías industriales complejas no está validada.
- El split held-out se construye a nivel de instancia, de modo que familias de circuitos relacionadas pueden aparecer tanto en entrenamiento como en evaluación; los resultados pueden estar sobreestimados respecto a una generalización estricta.
- Los circuitos recuperados deben verificarse mediante simulación antes de reutilizarse; el modelo no garantiza corrección funcional.
- Las descripciones funcionales de más de 77 tokens se truncan por el límite nativo de CLIP, lo que puede perder información en especificaciones largas.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Licencia MIT para los pesos, pero CLIP y el material fuente Masala-CHAI conservan sus propios términos, que deben respetarse en uso comercial.
- No se documentan sesgos específicos; al tratarse de un dominio técnico, el riesgo principal es la recuperación de circuitos incorrectos o no representativos en lugar de sesgos sociales.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto libre), pero la recuperación puede devolver vecinos espurios cuando la consulta queda fuera de la distribución de entrenamiento.
- No se documentan soporte de tool calling, agentes ni despliegue en frameworks de inferencia de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulermaxwell/AnalogRetriever
- Dataset: https://huggingface.co/datasets/eulermaxwell/AnalogRetriever-data
- Demo: https://huggingface.co/spaces/eulermaxwell/AnalogRetriever
- Paper (DOI): https://doi.org/10.1145/3831252.3834253
- Código: https://github.com/yihan-wa/AnalogRetriever_ICCAD
- Commit de entrenamiento: https://github.com/yihan-wa/AnalogRetriever_ICCAD/tree/52435fd40e3ad5c702a4ad438acaac9d344f738e
- Modelo base: https://huggingface.co/openai/clip-vit-large-patch14
