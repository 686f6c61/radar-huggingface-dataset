# jstarks/Gemma-4-26B-A4B-Weight-Space-Programming

## Resumen

`jstarks/Gemma-4-26B-A4B-Weight-Space-Programming` es un adaptador de tipo LoRA en formato GGUF y un parche de pesos (delta patch en safetensors) que se aplica sobre el modelo base `google/gemma-4-26B-A4B-it`, un transformer disperso de tipo Mixture-of-Experts con 26,54 mil millones de parametros totales y aproximadamente 4 mil millones activos por token. El autor, `jstarks`, lo presenta como una demostracion de "Weight-Space Programming" (WSP) en su version 3.9: una tecnica de sintesis de subespacios de pesos en forma cerrada, sin descenso de gradiente ni fine-tuning, que se genera en CPU en unos 18,9 segundos con menos de 90 MB de RAM.

El interes tecnico del artefacto no reside en el modelo base, sino en el metodo y en el hallazgo mecanicista que documenta: en las capas del decoder de Gemma 4, los 128 expertos enrutados (`experts.down_proj`) muestran una alineacion espectral con tokens de formato y de control entre 5 y 10 veces superior a la del MLP denso compartido (`mlp.down_proj`). A partir de esa observacion, el autor construye adaptadores que actuan sobre las cuatro capas de atencion global completas (5, 11, 17 y 23) alineadas con las direcciones principales del router, en lugar de sobre las proyecciones densas que suelen atacar los LoRA convencionales en GGUF.

El resultado es un adaptador de 1,20 MB (rango 16) que, segun la model card, eleva el total agregado de una bateria de 123 tareas del 42,3 % al 45,5 % (+3,2 puntos), multiplica por cinco GSM8K (de 1/20 a 5/20) y duplica HumanEval (de 1/15 a 2/15) sin degradar TruthfulQA. El repositorio es, por tanto, mas una pieza de investigacion en interpretabilidad mecanicista y edicion de pesos que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Mixture-of-Experts disperso (128 expertos enrutados + 1 MLP denso compartido GeGLU, 30 capas) |
| Parametros totales | 26,54 B en el modelo base; el adaptador WSP contiene 1.182.720 parametros (1,20 MB en GGUF) |
| Parametros activos | ~4 B por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en GGUF (LoRA); el modelo base se usa con `UD-Q4_K_M` en los benchmarks del autor; no se documentan otras cuantizaciones del adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (LoRA) y safetensors (delta patch `wsp_gemma4_a4b_patch.safetensors` + manifiesto JSON) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de 30 capas con atencion global completa en determinadas capas y un bloque feedforward de tipo MoE disperso: cada capa combina un MLP denso compartido (`mlp.down_proj`, 2112 columnas) que corre en paralelo con 128 expertos enrutados (`experts.down_proj`, 128 x 704 columnas), cada rama normalizada por RMS de forma independiente (`post_feedforward_layernorm_1` y `post_feedforward_layernorm_2`) antes de la suma. El adaptador no modifica esta topologia: inyecta subespacios de bajo rango sobre las capas 5, 11, 17 y 23 (rango 16), seleccionadas por su condicion de capas de atencion global completa y por su alineacion con las direcciones top-8 de `router.proj.weight`.

No hay entrenamiento en el sentido habitual: la WSP es un metodo de sintesis en forma cerrada, sin descenso de gradiente ni fine-tuning, que calcula los subespacios a partir de sondas espectrales sobre los tensores del modelo base. El autor documenta el proceso con scripts reproducibles (`build_gemma4_a4b_subspaces.py`, `probe_gemma4_a4b_moe.py`, `probe_lora_scales.py`) y con JSON de resultados empiricos. La innovacion tecnica destacable es el hallazgo de que los expertos enrutados concentran la senal de formato y de control (tokens `'▁▁▁▁'`, `'*'`, `<channel|>`, `<|tool_call>`) con una alineacion de columna de 0,10-0,18 frente a 0,008-0,03 del MLP denso, lo que justifica dirigir la edicion a las capas de atencion alineadas con el router en vez de a las proyecciones densas que suelen usar los LoRA GGUF convencionales.

## Capacidades

- Generacion de texto y razonamiento de varios pasos heredados del modelo base `gemma-4-26B-A4B-it`.
- Tool calling y function calling: el modelo base expone tokens de control `<|tool_call>` y `<channel|>`; el adaptador preserva el 93,3 % de acierto en BFCL v3 Irrelevance.
- Comportamiento de agente movil: la bateria del autor incluye suites de ejecucion de shell, busqueda y fetch web, y restriccion de herramientas.
- Razonamiento matematico: mejora documentada en GSM8K (de 5,0 % a 25,0 % con el adaptador Arm 3).
- Generacion de codigo: mejora en HumanEval pass@1 (de 6,7 % a 13,3 %).
- Anti-sicofancia: 100 % en la suite correspondiente (8/8), igual que el base.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: reproducir el sondeo espectral de `experts.down_proj` frente a `mlp.down_proj` con `probe_gemma4_a4b_moe.py` para estudiar donde se codifica el formato y el control en un MoE disperso.
- Edicion de pesos sin entrenamiento: usar la WSP como alternativa a LoRA/QLoRA cuando no se dispone de GPU ni de presupuesto de fine-tuning, sintetizando el adaptador en CPU en menos de 20 segundos.
- Ajuste de razonamiento matematico en despliegues locales: aplicar `wsp_gemma4_subspace4_mid.gguf` con `llama-server --lora-scaled ...:2.0` sobre una cuantizacion Q4_K_M para elevar GSM8K en entornos sin GPU dedicada.
- Evaluacion de tecnicas de adaptacion de bajo rango: comparar las cuatro configuraciones del ablation factorial (Arm 1 a Arm 4) sobre las mismas 123 tareas para medir el efecto de editar capas medias frente a tardias.
- Analisis de robustez de agentes: usar las suites de restriccion de herramientas (6/6 en el base, 4/6 con adaptadores) para estudiar el compromiso entre capacidad y disciplina de uso de herramientas.
- Docencia y divulgacion: el repositorio incluye scripts y JSON reproducibles que permiten ilustrar en un curso como se localiza y se edita un subespacio de pesos en un MoE de 26 B sin reentrenar.

## Benchmarks y rendimiento

Resultados del ablation factorial de 123 tareas, decodificacion greedy (`temperature=0.0`), servidos con `llama-server` sobre `gemma-4-26B-A4B-it-UD-Q4_K_M.gguf` a ~26 tok/s:

| Suite (tareas) | Arm 1: base | Arm 2: capas tardias 20-29 | Arm 3: capas medias 5,11,17,23 (mejor) | Arm 4: ambas |
|---|---|---|---|---|
| Shell execution (8) | 3/8 (37,5 %) | 3/8 (37,5 %) | 3/8 (37,5 %) | 3/8 (37,5 %) |
| Web search & fetch (8) | 3/8 (37,5 %) | 3/8 (37,5 %) | 3/8 (37,5 %) | 3/8 (37,5 %) |
| Math reasoning (8) | 0/8 (0,0 %) | 0/8 (0,0 %) | 1/8 (12,5 %) | 1/8 (12,5 %) |
| Anti-sycophancy (8) | 8/8 (100 %) | 8/8 (100 %) | 8/8 (100 %) | 8/8 (100 %) |
| Tool restraint (6) | 6/6 (100 %) | 4/6 (66,7 %) | 4/6 (66,7 %) | 4/6 (66,7 %) |
| Subtotal agente movil (38) | 20/38 (52,6 %) | 18/38 (47,4 %) | 19/38 (50,0 %) | 19/38 (50,0 %) |
| InterCode-NL2Bash (20) | 1/20 (5,0 %) | 1/20 (5,0 %) | 1/20 (5,0 %) | 1/20 (5,0 %) |
| BFCL v3 Irrelevance (15) | 14/15 (93,3 %) | 14/15 (93,3 %) | 14/15 (93,3 %) | 14/15 (93,3 %) |
| GSM8K test (20) | 1/20 (5,0 %) | 5/20 (25,0 %) | 5/20 (25,0 %) | 4/20 (20,0 %) |
| TruthfulQA generation (15) | 15/15 (100 %) | 15/15 (100 %) | 15/15 (100 %) | 15/15 (100 %) |
| HumanEval pass@1 (15) | 1/15 (6,7 %) | 2/15 (13,3 %) | 2/15 (13,3 %) | 1/15 (6,7 %) |
| Subtotal establecido (85) | 32/85 (37,6 %) | 37/85 (43,5 %) | 37/85 (43,5 %) | 35/85 (41,2 %) |
| Total (123) | 52/123 (42,3 %) | 55/123 (44,7 %) | 56/123 (45,5 %) | 54/123 (43,9 %) |

Sondeo espectral en la capa 29 (alineacion de columna):

| Tensor | `'▁▁▁▁'` (140) | `'▁▁▁'` (139) | `'▁▁▁▁▁▁▁▁'` (144) | `'*'` (236829) | `<channel\|>` (101) | `<\|tool_call>` (48) |
|---|---|---|---|---|---|---|
| MLP denso compartido | 0,0333 | 0,0239 | 0,0328 | 0,0304 | 0,0100 | 0,0084 |
| 128 expertos enrutados | 0,1250 | 0,1730 | 0,1023 | 0,1831 | 0,0977 | 0,0885 |

## Requisitos de hardware

- VRAM estimada para el modelo base en Q4_K_M: no disponible de forma explicita en la informacion proporcionada; por el tamano del modelo (26,54 B totales, ~4 B activos) se situa en el rango de 16-20 GB, pero el autor no publica la cifra.
- El adaptador en si ocupa 1,20 MB (Arm 3) y no anade requisitos de VRAM significativos.
- La sintesis del adaptador se ejecuta en CPU: 18,9 segundos y menos de 90 MB de RAM.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Despliegue documentado: `llama-server` con `--jinja` y `--lora-scaled wsp_gemma4_subspace4_mid.gguf:2.0`; el autor no documenta vLLM, TGI ni Ollama.
- Throughput medido: ~26 tok/s en la configuracion de benchmark del autor (hardware no especificado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (WSP v3.9 sobre Gemma-4-26B-A4B-it) | 1,18 M en el adaptador; 26,54 B en el base | no disponible | Edicion de pesos en forma cerrada sobre MoE disperso | Apache 2.0 | Hugging Face (0 descargas) |
| `google/gemma-4-26B-A4B-it` | 26,54 B (~4 B activos) | no disponible | Modelo base MoE instruct | no disponible en la informacion | Hugging Face (modelo base) |
| LoRA/QLoRA convencional sobre proyecciones densas | Depende del rango y modulos | no aplica | Fine-tuning con descenso de gradiente | Depende del autor | Ecosistema PEFT |
| Tecnicas de edicion de pesos tipo task arithmetic / model merging | Depende del delta | no aplica | Combinacion de deltas de pesos | Depende del autor | Ecosistema abierto |

No se dispone de datos comparativos de rendimiento frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador mejora el agregado en solo +3,2 puntos sobre 123 tareas; los resultados absolutos siguen siendo bajos (GSM8K 25 %, HumanEval 13,3 %, InterCode-NL2Bash 5 %), insuficientes para uso en produccion sin un modelo base mas capaz.
- La suite de evaluacion es pequena (8 a 20 tareas por benchmark) y de autoria unica; la significancia estadistica de las diferencias no esta documentada.
- El adaptador degrada la restriccion de herramientas en la suite movil (de 6/6 a 4/6), por lo que puede aumentar llamadas innecesarias a herramientas en agentes.
- El metodo depende de la topologia concreta de Gemma 4 (128 expertos, capas de atencion global en 5, 11, 17, 23); no es directamente transferible a otros MoE sin re-sintetizar los subespacios.
- Los LoRA GGUF convencionales no pueden atacar tensores 3D de expertos enrutados, lo que limita la comparabilidad con flujos PEFT estandar.
- No se documentan sesgos, comportamiento multilingue ni riesgos de alucinacion especificos del adaptador; deben asumirse los del modelo base.
- Licencia Apache 2.0 declarada, pero el uso comercial esta sujeto ademas a los terminos del modelo base `google/gemma-4-26B-A4B-it`, que no se detallan en la informacion disponible.
- Repositorio con 0 descargas y 0 likes: no hay validacion independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/jstarks/Gemma-4-26B-A4B-Weight-Space-Programming
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
