# oriolh/cloud2grid-e5d-l1-s0

## Resumen

Cloud2Grid E5d (`e5d_l1_s0`) es una red neuronal de grafos para flujos de potencia AC, obtenida por ajuste fino del modelo fundacional GENCO (`gridfm/genco-pf-transfer`, Puech et al., 2026) sobre una red de distribución real del Reino Unido con generación solar derivada de satélite. Lo desarrolla el autor `oriolh` en el marco del proyecto Cloud2Grid, un estudio de adaptación de modelos fundacionales de red a datos reales. No es un modelo de lenguaje: su entrada es un grafo heterogéneo de la red eléctrica y su salida son magnitudes físicas (importación de red, flujos de rama y tensiones).

La innovación frente a la variante E5c es una pérdida de respuesta emparejada: pares de estados resueltos por AC que difieren en una sola entrada (PV, batería o una carga) enseñan al modelo el cambio AC en importación, flujos y tensiones, normalizado por MW de perturbación. La pérdida total es L_E5c + λ·κ·L_response con λ = 1 y semilla 0. Sobre pares sintéticos no vistos, recupera la respuesta solar con un ratio de pendiente de importación de 0,997 (frente a 0,014 de E5c y 0,001 del control con λ = 0).

Es relevante porque demuestra que un surrogate GNN puede aprender sensibilidades físicas marginales, no solo ajustar estados. Ahora bien: el checkpoint está marcado como FLAGGED (ningún run superó los 23 criterios de selección y se eligió por regla de respaldo), solo una de tres semillas aprendió bien la respuesta, la importación arrastra un offset casi constante de +13,1 MW y los resultados sobre estados reales de 2024 no son reproducibles públicamente. El propio autor lo describe como modelo de investigación, no operacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GNS_heterogeneous de GraphKit: red neuronal de grafos heterogénea con paso de mensajes; arquitectura idéntica a la del modelo base |
| Parámetros totales | no disponible (el autor no publica el recuento; el repositorio ocupa 0,2 GB e incluye checkpoint, normalizador, configuración y archivo de release) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo `graph-ml`; la entrada es un grafo de red eléctrica, no una secuencia de tokens) |
| Tipos de cuantización | no disponible; solo se distribuye el `state_dict` original de `torch.save`, sin versiones GGUF, ONNX ni cuantizadas |
| Idiomas soportados | no aplica / no disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` (`best_model_state_dict.pt`, `torch.save`); normalizador en `normalizer_stats.pt`; configuración de predicción en `graphkit_predict_config.yaml` |
| Modelo base | `gridfm/genco-pf-transfer` (Apache-2.0); todos los pesos modificados |
| Pipeline | `graph-ml` |
| Normalizador | `normalizer_stats.pt`, baseMVA 36,741; debe usarse únicamente con este checkpoint |
| sha256 del checkpoint | `45ab82525da00844a82a9526bc814de9290efc776159f0d8818703d5e9647435` |
| Entrenamiento | 200 épocas, mejor época 198 |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura GNS_heterogeneous de GraphKit, sin cambios estructurales respecto a GENCO: un GNN heterogéneo que propaga mensajes entre los distintos tipos de nodo y arista del grafo eléctrico (generación, cargas, ramas, subestaciones) y produce estimaciones de flujos de potencia AC. El ajuste fino parte de los pesos preentrenados de `gridfm/genco-pf-transfer`.

Los datos son estados sintéticos resueltos por AC generados con gridfm-datakit (Apache-2.0) sobre una red derivada de datos abiertos de UK Power Networks (CC BY 4.0), con generación solar obtenida de satélite. Se emplean los mismos datos, particiones, regla de normalización y receta que en E5c, y se añade la pérdida de respuesta emparejada: para cada par de estados que difieren en una única entrada (PV, batería o carga) se aprende el incremento AC en importación, flujos de rama y tensiones, normalizado por MW de perturbación. La escala σ de esa pérdida se documenta en `response_sigma.json` por transparencia y no es necesaria para inferencia. No se documenta uso de RLHF ni DPO (no aplica a este dominio).

La selección del checkpoint siguió una regla pre-registrada evaluada solo sobre validación sintética: ningún run superó los 23 criterios, por lo que se aplicó la regla de respaldo. El checkpoint seleccionado cumple los 15 criterios de respuesta y 3 de retención, y queda registrado en `metadata/e5d_checkpoint_registry.yaml` del repositorio `hinox13/grid2cloud`, etiqueta `cloud2grid-submission-v1`.

## Capacidades

- Predicción de flujos de potencia AC sobre el grafo de la red: importación de red, flujos por rama y tensiones de nodo.
- Estimación de respuesta marginal ante perturbaciones de una sola variable de entrada (solar, batería o carga), expresada por MW de perturbación.
- Recuperación de la respuesta solar AC en pares sintéticos no vistos: ratio de pendiente de importación de 0,997.
- Ajuste de la pendiente solar en 2.829 estados reconstruidos de 2024: −1,07 MW por MW, frente a −1,02 de la referencia AC.
- Inferencia en CPU, sin requisitos de GPU documentados.
- Verificabilidad: checksums de todos los ficheros, manifiesto de procedencia y script de reproducción con 44 métricas puntuadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión, audio ni capacidades multilingües (no aplica a este dominio).

## Casos de uso

- Sustituto rápido del solver AC en la red modelada: dado un estado del grafo, el modelo estima importación, flujos y tensiones sin ejecutar un flujo de potencia completo, lo que permite explorar muchos estados en CPU.
- Análisis de sensibilidad a penetración solar: con una pendiente de importación de −1,07 MW por MW de PV (referencia AC −1,02), sirve para cuantificar cuánto reduce cada MW adicional de solar la importación de red en la red de distribución estudiada.
- Evaluación de conexiones de nueva generación o almacenamiento: al estar entrenado con pares que difieren en una sola entrada, permite estimar el cambio en flujos de rama y tensiones asociado a añadir PV o batería en un nodo concreto.
- Screening de tensiones ante variaciones de carga: la pérdida de respuesta cubre tensiones normalizadas por MW, de modo que el modelo estima el delta de tensión esperado ante un cambio de demanda sin resolver el caso completo.
- Auditoría y reproducibilidad de modelos fundacionales de red: el pipeline `reproduce/verify_models.py` reejecuta las afirmaciones C1-C5 y comprueba 44/44 métricas dentro de tolerancia en CPU (2-3 minutos), útil como referencia metodológica en publicaciones.
- Investigación en adaptación de dominio de grid foundation models: sirve como punto de partida para estudiar cómo el ajuste fino con pérdidas físicas cambia el comportamiento de GENCO en una red real con datos satelitales.
- Docencia y prototipado de surrogates GNN: al distribuirse con `IO_SCHEMA.md`, configuración de GraphKit y normalizador exacto, es replicable en entornos académicos sin infraestructura GPU.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no se han publicado resultados adicionales de MMLU, HumanEval, GSM8K ni similares, que no aplican a este dominio):

| Métrica | E5d (`e5d_l1_s0`) | E5c | Control λ = 0 | Referencia AC |
|---|---|---|---|---|
| Ratio de pendiente de importación en pares sintéticos no vistos | 0,997 | 0,014 | 0,001 | 1,0 (por definición) |
| Pendiente solar ajustada en 2.829 estados de 2024 (MW por MW) | −1,07 | no disponible | no disponible | −1,02 |
| Offset de importación en estados de 2024 | +13,1 MW casi constante | no disponible | no disponible | 0 |
| Criterios de respuesta superados | 15 de 15 | no disponible | no disponible | no aplica |
| Criterios de retención superados | 3 de 3 | no disponible | no disponible | no aplica |
| Criterios globales de selección (23) | 0 de 23 (FLAGGED, elegido por regla de respaldo) | no disponible | no disponible | no aplica |
| Verificación de reproducción | 44/44 métricas dentro de tolerancia, afirmaciones C1-C5 | no disponible | no disponible | no aplica |

## Requisitos de hardware

- VRAM: no se publican requisitos de VRAM. El repositorio completo ocupa 0,2 GB, por lo que el checkpoint y el normalizador son manejables en memoria convencional.
- GPU recomendadas: no disponible; el autor no documenta GPU concretas (A100, H100, RTX 4090 u otras).
- CPU: la verificación completa (descarga, carga de dos checkpoints y evaluación de 44 métricas) se ejecuta en CPU en aproximadamente 2-3 minutos, lo que indica que la inferencia individual es ligera.
- Despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI (son runtimes de modelos de lenguaje). Requiere GraphKit con la configuración `graphkit_predict_config.yaml` y el repositorio `hinox13/grid2cloud` (`uv sync --extra genco`).
- Latencia y throughput: no disponibles de forma explícita; solo se documenta el tiempo agregado del script de verificación.
- Dependencias: PyTorch, `huggingface_hub` y GraphKit; el normalizador `normalizer_stats.pt` es obligatorio y específico de este checkpoint.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Respuesta solar (ratio de pendiente) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `oriolh/cloud2grid-e5d-l1-s0` | GNN heterogéneo ajustado con pérdida de respuesta emparejada | no disponible | no aplica | 0,997 en sintético; −1,07 frente a −1,02 en 2024 | Apache-2.0 | HuggingFace, release `cloud2grid-models-v1` |
| `oriolh/cloud2grid-e5c-ft-n10000-s2` | GNN heterogéneo ajustado sin pérdida de respuesta | no disponible | no aplica | 0,014 en sintético | Apache-2.0 | HuggingFace (revisión `v1`) |
| `gridfm/genco-pf-transfer` (zero-shot) | GNN heterogéneo preentrenado (GENCO) | no disponible | no aplica | no disponible | Apache-2.0 | HuggingFace |
| Cloud2Grid E5 y E5b | Variantes intermedias del mismo estudio | no disponible | no aplica | no disponible | Apache-2.0 | Mostradas en el Explorer de Cloud2Grid v1.1; repositorio no indicado en la información disponible |

## Limitaciones y advertencias

- Checkpoint marcado como FLAGGED: ningún run superó los 23 criterios de selección pre-registrados y fue elegido por la regla de respaldo, no por cumplir el conjunto completo.
- Sensibilidad a la semilla: solo una de las tres semillas entrenadas aprendió la respuesta con esta calidad, lo que limita la confianza en la reproducibilidad del resultado.
- Offset casi constante de +13,1 MW en la importación sobre estados reales de 2024: los valores absolutos no son fiables; el uso previsto es sobre deltas o pendientes, no sobre magnitudes absolutas.
- Modelo de investigación, no operacional: el autor lo declara explícitamente inadecuado para explotación en producción.
- Los resultados sobre estados reales de 2024 requieren datos operativos no distribuidos; se documentan pero no son reproducibles desde el repositorio.
- Dominio restringido a una red derivada de datos abiertos de UK Power Networks; no hay evidencia publicada de transferencia a otras redes, niveles de tensión o países.
- Dependencia estricta del normalizador `normalizer_stats.pt` (baseMVA 36,741): usar otro normalizador invalida las predicciones.
- Riesgo de extrapolación fuera de la distribución de estados sintéticos de entrenamiento (gridfm-datakit); no se documentan métricas de incertidumbre ni calibración.
- Licencia Apache-2.0 en pesos y configuración, apta para uso comercial, pero los datos de red derivados de UK Power Networks están bajo CC BY 4.0 y exigen atribución según `NOTICE.md`.
- No aplican sesgos lingüísticos ni de idioma por no tratar lenguaje natural, pero no se documenta ningún análisis de sesgo físico o geográfico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oriolh/cloud2grid-e5d-l1-s0
- Modelo base GENCO: https://huggingface.co/gridfm/genco-pf-transfer
- Dataset de verificación: https://huggingface.co/datasets/oriolh/cloud2grid-verification-synthetic-v1
- Artículo de referencia (Puech et al., 2026): https://arxiv.org/abs/2608.09921
- Sitio web del proyecto Cloud2Grid: https://hinox13.github.io/grid2cloud/
- Código fuente: https://github.com/hinox13/grid2cloud
- Release de modelos: https://github.com/hinox13/grid2cloud/releases/tag/cloud2grid-models-v1
- Instrucciones de reproducción: https://github.com/hinox13/grid2cloud/blob/cloud2grid-models-v1/reproduce/README.md
