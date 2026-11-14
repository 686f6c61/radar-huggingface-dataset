# ANABUR/photon-memory

## Resumen

Photon Memory es un conjunto de checkpoints de pesos publicado por ANABUR (usuario de Hugging Face) como material complementario de un lector de fotones ("Photon Memory reader") para el renderizado basado en física. No es un modelo de lenguaje: es un componente de investigación en renderizado y estimación de densidad que procesa mapas de fotones (haces de luz muestreados) y aprende a estimar densidades direccionales, comparándose contra PureLight (un método de referencia o "teacher") en pérdida de verosimilitud negativa (NLL) direccional.

El modelo se enmarca en la técnica de test-time training (TTT): los checkpoints incluidos son el resultado de una cadena de adaptación sobre un banco de 1e8 fotones trazados con OptiX para una escena ("Rough Flower"). El autor reporta una NLL direccional de −6.00 tras una adaptación emparejada, frente a un plateau de aproximadamente −0.460 en modo zero-shot, comparable al del teacher PureLight. Esto es relevante en el nicho de investigación de renderizado por fotones, donde el ajuste fino en tiempo de test está emergiendo como alternativa al entrenamiento puro de modelos previos.

El repositorio es muy pequeño (0.1 GB, con checkpoints de ~0.7 MB y ~42 MB), está licenciado bajo MIT y depende del código `lightmem/` del repositorio `ANABUR920/renderTTT`. No se publican idiomas, pipeline ni datos de benchmarks estándar de NLP, lo que confirma su naturaleza como artefacto de investigación especializado y no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PhotonKernel (lector de fotones) + ResidualLobes (residual de hash); no se especifica la arquitectura interna más allá de la definición en `lightmem/models` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en punto flotante PyTorch; no se documentan esquemas de cuantización) |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch `state_dict` serializado con `torch.save`) |

## Arquitectura y entrenamiento

Según la model card, el sistema consta de dos módulos acoplados: un `PhotonKernel` con `k=512` y `k_feat=True` que actúa como lector de fotones (procesa canales mean/r/g/b de mapas de fotones trazados) y un `ResidualLobes` con `K=32`, `finest=2048` y una tabla `log2` de 19 niveles que modela un residual hash de alta frecuencia. Los checkpoints incluidos son `v3_ksched_model.pt` (lector meta-entrenado), `big_1e8_k512_ttt.pt` (TTT solo del lector sobre 1e8) y `big_match_res2b_best.pt` / `big_match_res2c_best.pt` (TTT emparejado con residual).

El entrenamiento no es de un transformer sobre texto, sino de un ajuste en tiempo de test sobre datos de la propia escena. La cadena ganadora reportada es secuencial: (1) partir del lector meta-entrenado, TTT solo del lector hasta NLL ≈ −0.53; (2) TTT emparejado lector + residual hasta ≈ −4.54; (3) continuar con `scripts/ttt_big.py` (8000 pasos, `lr=5e-6`, `res_lr_grid=5e-3`, `res_lr_head=5e-4`) hasta la NLL objetivo de −6.00. Se usan 1e6 queries de TTT y se entrena sobre el resto no-evaluado del archivo de 11e6 fotones, recuperando de un banco separado de 1e8 fotones. No se documentan RLHF, DPO ni composición de dataset lingüístico, porque no aplica.

## Capacidades

- Estimación de densidad direccional de fotones en una escena trazada (Rough Flower), con NLL como métrica de ajuste.
- Renderizado asistido por el lector `PhotonKernel` a partir de mapas de fotones con canales mean/r/g/b.
- Ajuste en tiempo de test (TTT) sobre memoria de 1e8 fotones y residual de hash de varias escalas.
- Adaptación con warm-start encadenado: no está pensado para un cold start de una sola pasada.
- Modo zero-shot limitado (NLL ≈ −0.460 con el lector meta-entrenado), que iguala el plateau del teacher PureLight.
- No soporta tool calling, function calling, agentes, razonamiento multilingüe, visión ni audio: no es un LLM.
- Capacidad especial: el residual de hash "frozen-reader" por sí solo alcanza ≈ −0.38 y no supera a PureLight, según advierte la propia model card.

## Casos de uso

- Investigación en renderizado por fotones: usar `v3_ksched_model.pt` como lector base y adaptarlo con TTT a una escena nueva para estudiar la brecha entre zero-shot y adaptación emparejada.
- Reproducción de resultados de referencia: ejecutar la cadena de tres pasos sobre el dataset `ANABUR/photon-memory-photons` para verificar la NLL −6.00 bajo el mismo protocolo (últimas 20k queries de `default_rng(0).permutation(11_000_000)`).
- Comparación con el teacher PureLight: emplear el checkpoint para contrastar densidades aprendidas frente a las fotomapas del teacher en experimentos controlados.
- Ablación de módulos: aislar el efecto del `ResidualLobes` frente al lector solo-lector usando `big_1e8_k512_ttt.pt` (≈ −0.53) como referencia.
- Prototipado de pipelines de estimación de densidad en escenas sintéticas trazadas con OptiX, re-trazando escenas nuevas con `scripts/gen_flower.py`.
- Estudio de técnicas de TTT en dominios científicos: servir como caso de estudio reproducible de adaptación test-time con ~40 GB de VRAM para 1e8 + residual.

## Benchmarks y rendimiento

Resultados reportados por el autor (NLL direccional, menor es mejor; protocolo de la model card):

| Configuración | NLL direccional | Notas |
|---|---|---|
| PureLight (teacher, plateau) | ≈ −0.460 | Referencia del teacher |
| Zero-shot, `v3_ksched_model.pt` (N=1e8, k=512) | ≈ −0.460 | Iguala el plateau del teacher |
| TTT solo lector, `big_1e8_k512_ttt.pt` | ≈ −0.53 | Leave-one-out sobre 1e8 se estanca aquí |
| TTT emparejado, `big_match_res2b_best.pt` | ≈ −4.54 | Intermedio lector + residual |
| TTT emparejado final, `big_match_res2c_best.pt` | **≈ −6.00** | Render por defecto |
| Residual frozen-reader solo | ≈ −0.38 | No supera a PureLight |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada: ~40 GB para la configuración de reproducción (1e8 fotones + residual), según la model card.
- GPU recomendadas: CUDA GPU con al menos 40 GB (A100 40GB/80GB, H100, L40S 48GB); el checkpoint en sí es minúsculo (~42 MB) y puede cargarse en CPU con `map_location="cpu"`.
- En GPU consumer: los checkpoints se cargan sin problema por tamaño, pero la reproducción de la cadena TTT sobre 1e8 no cabe en GPUs de 24 GB como la RTX 4090 sin reducir el banco de memoria.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI; se usa directamente desde PyTorch con `lightmem.models` y `scripts/ttt_big.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento (NLL) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Photon Memory (ANABUR) | Lector de fotones + TTT | no disponible | no aplica | −6.00 (TTT emparejado), −0.460 (zero-shot) | MIT | Hugging Face (repo + dataset de fotones) |
| PureLight (teacher) | Método de referencia de renderizado | no disponible | no aplica | ≈ −0.460 (plateau) | no disponible (tercero) | Pesos y fotomapas de terceros, no incluidos |
| Residual frozen-reader (ablación interna) | Residual de hash | no disponible | no aplica | ≈ −0.38 | MIT (mismo repo) | Incluido como ablación |

No se conocen otros modelos comparables publicados en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene contexto lingüístico ni capacidades multilingües; cualquier uso tipo LLM es un error de categoría.
- La NLL −6.00 exige una cadena de warm-start de tres pasos; el autor advierte explícitamente que no debe reclamarse como cold start en una sola pasada.
- El TTT emparejado entrena sobre el resto no-evaluado del mismo archivo de 11e6 fotones, lo que puede inflar la métrica si no se respeta estrictamente el protocolo; es un caveat de evaluación importante.
- El modo zero-shot solo alcanza ≈ −0.460, que iguala pero no supera al teacher PureLight.
- El residual frozen-reader por sí solo (≈ −0.38) no bate a PureLight; no debe presentarse como mejora aislada.
- Los pesos de PureLight y sus fotomapas son de terceros y no se incluyen; la reproducibilidad depende de re-trazar con `scripts/gen_flower.py` o de disponer de esos artefactos.
- Dependencia de GPU con ~40 GB de VRAM para la reproducción, lo que restringe la verificación a entornos con hardware de datacenter.
- Licencia MIT permite uso comercial del código y pesos, pero la escena, los datos de fotones y el teacher pueden tener restricciones propias que el autor no detalla.
- Sin benchmarks estándar, sin documentación de sesgos y sin métricas de latencia/throughput: información insuficiente para evaluar despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANABUR/photon-memory
- Dataset de fotones: https://huggingface.co/datasets/ANABUR/photon-memory-photons
- Código (`lightmem/`, `scripts/ttt_big.py`): https://github.com/ANABUR920/renderTTT
- PureLight (teacher, tercero): no disponible
