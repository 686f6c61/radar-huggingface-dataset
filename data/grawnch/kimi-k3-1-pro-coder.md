# Grawnch/Kimi-K3.1-Pro-Coder

## Resumen

Kimi-K3.1-Pro-Coder es una cuantizacion mixta de precision (mixed-bit) del modelo `moonshotai/Kimi-K3.1-Pro`, publicada por el usuario Grawnch en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una compresion del modelo base de Moonshot AI (2,8 billones de parametros, arquitectura MoE con 93 capas) que preserva las capas no enrutadas en BF16/F32 y comprime los 82.432 expertos enrutados mediante una estrategia de tres niveles de precision calibrada sobre frecuencias de activacion del router en tareas de codigo y matematicas.

El modelo resuelve el problema practico de desplegar un modelo de escala frontera (2,8T) en hardware limitado: reduce el peso total de ~1,77 TB teoricos a 774,97 GB (una reduccion del 56,2%), manteniendo, segun el autor, una paridad casi total con el modelo base en benchmarks de razonamiento matematico y codigo (AIME 2025 y LiveCodeBench). La innovacion principal es el esquema de compresion "Strata-Coder 3-Tier", que asigna mas bits a los expertos mas activados (hot) y menos a los de cola (cold), junto con un runtime de offloading en tres niveles (VRAM/RAM/NVMe) implementado en los repos `strata` y `dr-triton`.

Es relevante ahora porque demuestra que es viable ejecutar modelos de escala frontera MoE en una sola GPU profesional (RTX PRO 6000 Blackwell de 102,6 GB) combinando VRAM, RAM del sistema y SSD NVMe, con una degradacion medida muy contenida (KLD medio de ~0,020 nats, acuerdo Top-1 del 95%+). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con LatentMoE (896 expertos enrutados por capa, top_k=16, SiTU-GLU), atencion lineal KDA + atencion completa MLA gated NoPE, AttnRes (mezcla de residuales entre capas) y torre de vision |
| Parametros totales | 1.269.951.106.816 (~1,27 billones segun safetensors; el autor declara 2,8T en la model card) |
| Parametros activos | no disponible (top_k=16 sobre 896 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixed-bit de 3 niveles: BF16/F32 (no enrutados), Tier 1 a 2,81 bpw, Tier 2 a 2,56 bpw, Tier 3 a 1,44 bpw; media MoE ~1,98 bpw; etiquetado como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (96 shards, 774,97 GB / 721,75 GiB), con kernels de dequantizacion Triton (`dr-triton`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 93 capas con 896 expertos enrutados por capa (82.432 expertos en total en las capas 1 a 92), seleccion de top_k=16 y activacion SiTU-GLU. Combina atencion lineal KDA con atencion completa MLA gated NoPE, e incorpora AttnRes para la mezcla de residuales entre capas. Dispone ademas de una torre de vision, lo que justifica el pipeline `image-text-to-text`.

Esta publicacion no entrena el modelo: aplica una cuantizacion "Strata-Coder 3-Tier Mixed-Bit" calibrada sobre frecuencias de activacion del router en tareas de codigo y razonamiento matematico. Los parametros no enrutados (embeddings, atencion KDA y MLA, proyecciones AttnRes, expertos compartidos, proyecciones LatentMoE, `lm_head` y torre de vision) se conservan en BF16/F32 nativos. Los expertos enrutados se reparten en tres niveles: Tier 1 (134/896 expertos por capa, 15%, 2,81 bpw), Tier 2 (269/896, 30%, 2,56 bpw) y Tier 3 (493/896, 55%, 1,44 bpw). El runtime `strata` implementa un cargador de tres niveles (VRAM caliente, RAM templada, NVMe frio) con `RouterLookahead`, y `dr-triton` aporta kernels Triton fusionados de dequantizacion. No se documentan datos de entrenamiento, tokens vistos ni procesos de RLHF/DPO, ya que no se ha reentrenado el modelo.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base.
- Razonamiento matematico de nivel competicion (AIME 2025).
- Generacion de codigo y resolucion de problemas de programacion (LiveCodeBench).
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`, torre de vision preservada en BF16/F32).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene 29/30 en AIME 2025 tras la cuantizacion, por lo que es adecuado para tutoria o verificacion de soluciones matematicas donde se requiere alta precision y se dispone de infraestructura con offloading a NVMe.
- Generacion de codigo en produccion: con paridad total en LiveCodeBench (9/10 easy, 10/10 medium, 10/10 hard) frente al base, puede integrarse en pipelines de revision o generacion de codigo, aunque el throughput de 36,77 tok/s en una RTX PRO 6000 limita su uso a tareas por lotes mas que interactivas.
- Analisis de imagenes con razonamiento textual: la torre de vision preservada en BF16 permite tareas de image-text-to-text, como descripcion tecnica de diagramas o extraccion de informacion de capturas.
- Investigacion sobre cuantizacion de MoE: sirve como caso de estudio reproducible para evaluar el impacto de la compresion mixed-bit por niveles en modelos de escala frontera, con metricas detalladas de KLD y acuerdo Top-1/Top-5.
- Despliegue en hardware unico de gama profesional: permite ejecutar un modelo de ~1,27-2,8T parametros en una sola RTX PRO 6000 Blackwell (102,6 GB) combinando VRAM, RAM y SSD, util para laboratorios sin clústeres multi-GPU.
- Evaluacion comparativa de esquemas de compresion: los datos de perplexity y divergencia KL por benchmark permiten contrastar la estrategia Strata-Coder con otras tecnicas de cuantizacion (por ejemplo, MXFP4) en tareas de codigo y matematicas.

## Benchmarks y rendimiento

Evaluacion end-to-end de las 93 capas en NVIDIA RTX PRO 6000 Blackwell (102,6 GB GDDR7), sobre 22.307 tokens en 70 secuencias:

| Benchmark / metrica | Kimi-K3.1-Pro (base) | Kimi-K3.1-Pro-Coder | Delta |
|---|---|---|---|
| AIME 2025 (30 problemas, Pass@1) | 29/30 (96,67%) | 29/30 (96,67%) | 0,00% |
| LiveCodeBench rolling window (30 problemas) | 29/30 (96,67%) | 29/30 (96,67%) | 0,00% |
| LiveCodeBench easy / medium / hard | 9/10 / 10/10 / 10/10 | 9/10 / 10/10 / 10/10 | paridad total |
| Acuerdo Top-1 siguiente token (AIME / LCB) | 100,00% | 95,20% / 95,06% | 95,1%+ |
| Acuerdo Top-5 siguiente token (AIME / LCB) | 100,00% | 99,91% / 99,92% | 99,91%+ |
| KLD medio (AIME / LCB) | 0,00000 | 0,01912 / 0,02248 | ~0,020 nats |
| Perplexity AIME 2025 | 2,2135 | 2,2358 | +1,01% |
| Perplexity LiveCodeBench hard | 2,1136 | 2,1562 | +2,02% |
| Perplexity LiveCodeBench global | 2,6911 | 2,7629 | +2,67% |
| Throughput capa MoE (RTX PRO 6000) | no disponible | 3.382,7 layer-tok/s | 36,77 tok/s batch de 93 capas |

## Requisitos de hardware

- VRAM: el modelo completo ocupa 774,97 GB, pero el diseno de tres niveles permite cargar solo la parte caliente en VRAM. La evaluacion del autor se hizo en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 102,6 GB GDDR7.
- GPU recomendadas: RTX PRO 6000 Blackwell (probado); modelos con menos VRAM requeriran mayor dependencia de RAM y NVMe. GPUs tipo A100/H100 no aparecen en la informacion proporcionada.
- ¿Cabe en GPU consumer? No de forma completa; el esquema depende de offloading a RAM del sistema y SSD NVMe. No se especifican requisitos minimos de RAM ni de SSD en la informacion disponible.
- Opciones de despliegue: runtime propietario `strata` (cargador de tres niveles con RouterLookahead) y kernels `dr-triton`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 36,77 tok/s en batch de 93 capas y 3.382,7 layer-tok/s de capa MoE en RTX PRO 6000. No se proporcionan latencias por token individuales ni para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-Coder (Grawnch) | ~1,27T safetensors / 2,8T declarados | no disponible | Apache 2.0 | safetensors (mixed-bit 3 niveles) | Cuantizacion del base; 774,97 GB; requiere runtime `strata` |
| Kimi-K3.1-Pro (Moonshot AI) | 2,8T | no disponible | no disponible | BF16/F32 | Modelo base de referencia; pesos completos no cuantizados |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la informacion |

No se dispone de datos de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido reentrenado: hereda los sesgos y riesgos de alucinacion del modelo base, sin que se documenten evaluaciones de seguridad o sesgo.
- La cuantizacion introduce una degradacion medible: KLD medio de ~0,020 nats, acuerdo Top-1 del ~95% y aumento de perplexity de hasta el 2,67% en codigo. La paridad en benchmarks no garantiza comportamiento identico en todas las entradas.
- El Tier 3 (55% de los expertos, 1,44 bpw) presenta un coseno de matriz de 82,51% frente al base MXFP4, lo que puede afectar a dominios distintos de codigo y matematicas no cubiertos por la calibracion.
- La calibracion esta sesgada hacia codigo y matematicas: el rendimiento en otros dominios (texto general, idiomas no ingleses, vision) no esta evaluado.
- Requiere un runtime no estandar (`strata` + `dr-triton`) y dependencia de NVMe para el Tier 3, lo que complica el despliegue en produccion y la portabilidad.
- No se documentan idiomas soportados, longitud de contexto ni soporte de tool calling o agentes.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `moonshotai/Kimi-K3.1-Pro`, cuyo licenciamiento no se detalla en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Kimi-K3.1-Pro-Coder
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Runtime `strata`: https://github.com/grawnchtoader/strata
- Kernels `dr-triton`: https://github.com/grawnchtoader/dr-triton
