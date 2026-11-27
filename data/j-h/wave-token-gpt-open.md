# j-h/wave-token-gpt-open

## Resumen

WAVE-GPT Open Weights (`v8_open`) es una familia de modelos Transformer causales de pequeno tamano publicados por el autor independiente `j-h` bajo licencia Apache-2.0. No opera sobre audio en bruto, sino sobre una tokenizacion discreta de eventos bioacusticos (`WAVE-Token v2` / `v2_poly`) extraidos previamente por la herramienta `WAVE-AUDIT`. Cada llamada verificada se comprime en una tupla de factores discretos (clase fisica, timing, duracion, frecuencia, armonicos, voz y solapamiento), lo que reduce el ruido de fondo y la transferencia del hidrofono a una representacion auditable de 100 a 1000 veces mas compacta.

El modelo resuelve el problema de modelar secuencias de vocalizaciones marinas y aviares de forma invariante al canal, evitando que el modelo aprenda la firma del equipo de grabacion en lugar del comportamiento animal. La familia incluye cinco checkpoints: dos configuraciones de capacidad (`compact_3m` con 2,7 M de parametros y `base_12m` con 14,4 M) y dos modos de tokenizacion (monofonico `v2` de 10 factores y polifonico `v2_poly` de 13 factores), mas una variante condicionada por comportamiento.

Es relevante ahora porque ofrece pesos 100 % compatibles con uso comercial (dominio publico NOAA SanctSound y CC-BY-4.0), excluyendo explicitamente corpus no comerciales como NOAA DCLDE, WHOI Watkins u Orcasound CC-BY-NC-SA. El modelo acompanante (Paper 3) esta en preparacion y no ha pasado revision por pares, por lo que debe considerarse una vista previa temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal factorizado (RoPE + RMSNorm + SwiGLU) con sesgo de atencion inter-llamada log(dt) y cabezas paralelas por factor |
| Parametros totales | 2.738.330 (`compact_3m`, v2) / 2.746.778 (`compact_3m`, v2_poly) / 2.854.895 (`behavior_compact_3m`) / 14.399.270 (`base_12m`, v2) / 14.416.166 (`base_12m`, v2_poly) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens de evento (`compact_3m`) / 1024 tokens de evento (`base_12m`) |
| Tipos de cuantizacion | No disponible (pesos en PyTorch `.pt`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No disponible (modelo de dominio bioacustico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), con digests SHA-256 en `SHA256SUMS_v8.txt` |

## Arquitectura y entrenamiento

La entrada del modelo no es audio: es una secuencia de eventos generada por `WAVE-AUDIT` (`wave_token_v2.py`). El tokenizador `v2` produce 10 factores discretos: `cls_phys` (TON, PLS, IMP, CLK, BZZ), `timing_bin`, `dur_bin`, `f_med_bin`, `f_span_bin`, `f_rep_bin` (enmascarado en eventos tonales para evitar fuga de snapping shrimp) y cuatro nudos de contorno FSQ (`S0..S3`). La variante `v2_poly` anade tres factores: `harm_bin` (H0..H3), `voice_slot` (V0..V3) y `overlap_ms_bin` (OM0..OM3), habilitando coros simultaneos de hasta cuatro voces.

El backbone es un Transformer causal con RoPE, RMSNorm y SwiGLU, un sesgo de atencion continuo basado en log(dt) (`dt_tau0_s = 0.05`) y cabezas de prediccion paralelas por factor. La configuracion `compact_3m` usa `d_model=192`, 4 capas, 6 cabezas, `d_ff=896`, `max_seq_len=512` y dropout 0.15; `base_12m` usa `d_model=384`, 6 capas, 6 cabezas, `d_ff=1536`, `max_seq_len=1024` y dropout 0.10. El entrenamiento se realizo en pases incrementales: Pass 3 (56.163 eventos abiertos, v2), Pass 4 (180.549 eventos, v2_poly) y Pass 5 (fine-tuning con DOLPHINFREE y OpenWhistle, CC-BY-4.0). No se menciona RLHF ni DPO; el objetivo es modelado de secuencia por verosimilitud negativa (NLL).

## Capacidades

- Modelado generativo de secuencias de eventos bioacusticos (sintesis de llamadas y continuaciones de secuencia).
- Prediccion por factor discreto: clase fisica, timing, duracion, frecuencia, armonicos, voz y solapamiento.
- Tokenizacion polifonica (`v2_poly`): representacion de hasta 4 voces simultaneas con riqueza armonica.
- Condicionamiento por comportamiento en la variante `behavior_compact_3m` (`foraging`, `socialising`, `travelling`).
- Soporte de turn-taking: la variante de comportamiento incluye sondas de alternancia de turnos.
- Invariabilidad al canal: la tokenizacion elimina la funcion de transferencia del hidrofono y el ruido ambiente.
- Sintesis en tiempo real: `compact_3m` alcanza 25,6 ms de media en sintesis estereo de 4 voces en CUDA (por debajo de 50 ms).
- No soporta tool calling, function calling, agentes, vision ni audio en bruto; no es un modelo de lenguaje general.

## Casos de uso

- Monitorizacion pasiva de cetaceos: procesar grabaciones de hidrofono con `WAVE-AUDIT` y usar WAVE-GPT para modelar la distribucion de eventos y detectar secuencias anomalas frente a la linea base aprendida.
- Deteccion de cambio de comportamiento: la variante `behavior_compact_3m` permite condicionar la sintesis a estados como `foraging` o `travelling` y comparar la verosimilitud de secuencias observadas para inferir el estado dominante.
- Analisis de coros polifonicos: `v2_poly` con `voice_slot` y `overlap_ms_bin` permite estudiar solapamientos de vocalizaciones de hasta cuatro individuos, util en estudios de interaccion social de delfines.
- Bioacustica aviar y marina comparada: el tokenizador esta disenado para taxones marinos y aviares, lo que permite aplicar el mismo pipeline a grabaciones de aves y mamiferos marinos.
- Prototipado en hardware modesto: los checkpoints `compact_3m` (11 MB) caben en cualquier GPU consumer y permiten iteracion rapida en campo o en portatiles.
- Generacion de senales sinteticas para aumentacion de datos: sintetizar secuencias de eventos plausibles para entrenar o validar otros clasificadores bioacusticos.
- Auditoria y trazabilidad: cada token es una tupla discreta legible por humanos, lo que facilita la revision manual de las predicciones en estudios con requisitos de reproducibilidad.

## Benchmarks y rendimiento

| Metrica | `base_12m` (v2_poly) | `compact_3m` (v2_poly) | Referencia HMM |
|---|---|---|---|
| LOSO NLL en `Garraf_2024` (eventos no vistos) | 11,9458 nats | no disponible | +1,8297 nats respecto a HMM (base_12m) |
| Ganancia vs. HMM (4-way ablation, Pass 3) | +0,5396 (v2, 56k eventos) | +0,5611 (v2) | linea base |
| Ganancia vs. HMM (v2_poly) | no disponible | +1,7766 (+2,9390 en cross-motif) | linea base |
| Latencia de sintesis (4 voces estereo, CUDA) | no disponible | 25,6 ms de media (<50 ms) | no aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; no son aplicables a un modelo de este dominio.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para `compact_3m` (11 MB de pesos) y alrededor de 1-2 GB para `base_12m` (58 MB de pesos) incluyendo activaciones y contexto de 512/1024 tokens.
- GPU recomendadas: cualquier GPU CUDA consumer (RTX 3060, RTX 4090) es suficiente; tambien funciona en CPU para inferencia por lotes.
- Cabe en GPU consumer: si, con amplio margen en todas las variantes.
- Opciones de despliegue: PyTorch nativo (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF.
- Latencia y throughput: 25,6 ms de media por sintesis de 4 voces estereo en CUDA para `compact_3m`; no se publican cifras de throughput para `base_12m`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAVE-GPT `compact_3m` (v2_poly) | 2,75 M | 512 eventos | Transformer causal sobre tokens de evento | Apache-2.0 | Hugging Face |
| WAVE-GPT `base_12m` (v2_poly) | 14,42 M | 1024 eventos | Transformer causal sobre tokens de evento | Apache-2.0 | Hugging Face |
| HMM de referencia (linea base del paper) | no disponible | no aplica | Modelo oculto de Markov sobre eventos | no disponible | no disponible |
| Modelos bioacusticos de audio en bruto | no disponible | no disponible | Clasificacion/segmentacion de audio | variable | no disponible |

No se dispone de comparativas publicadas con otros modelos bioacusticos de la misma categoria en la informacion proporcionada; la unica comparacion documentada es frente al HMM de referencia.

## Limitaciones y advertencias

- Vista previa temprana: el paper asociado (Paper 3) esta en preparacion y no ha pasado revision por pares.
- Dependencia obligatoria de `WAVE-AUDIT`: el modelo no procesa audio en bruto; sin el tokenizador `v2`/`v2_poly` no es utilizable.
- Dominio restringido: disenado para bioacustica marina y aviar; no es un modelo de lenguaje general ni soporta tareas de NLP.
- Riesgo de alucinacion en la sintesis: puede generar secuencias de eventos plausibles pero no observadas, lo que exige validacion fisica antes de usarlas como datos reales.
- Cobertura taxonomica limitada: el corpus de entrenamiento abierto se centra en `Tursiops`, ballenas jorobadas, orcas residentes del sur y aves; el rendimiento en otras especies no esta documentado.
- Restricciones de licencia: los pesos son Apache-2.0, pero el uso de los datasets subyacentes debe respetar sus licencias (CC-BY-4.0 requiere atribucion).
- Segregacion de procedencia: los pesos abiertos excluyen explicitamente audio no comercial; para pesos con NOAA DCLDE 2011 existe una variante de investigacion separada con otras condiciones.
- Idiomas no aplicables: la ficha de Hugging Face no declara idiomas porque el modelo no opera sobre texto.
- Sin cuantizaciones publicadas: no hay pesos GGUF ni INT8, lo que limita el despliegue en ecosistemas fuera de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/j-h/wave-token-gpt-open
- Tokenizador `WAVE-AUDIT`: https://huggingface.co/j-h/wave-audit-open
- Variante de investigacion (incluye NOAA DCLDE 2011): https://huggingface.co/j-h/wave-token-gpt-research
- Dataset DOLPHINFREE (Zenodo): https://zenodo.org/records/15681697
