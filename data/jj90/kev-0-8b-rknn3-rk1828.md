# jj90/Kev-0.8B-RKNN3-RK1828

## Resumen

Kev-0.8B-RKNN3-RK1828 es la conversión a formato RKNN3 del modelo de decisión Kev-0.8B, un fine-tuning mediante LoRA (r16) sobre Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo ni conversacional: ejecuta un único prefill y puntúa opciones mediante un cabezal pointer (atención entre el estado oculto de la decisión y el de cada opción), sin generar tokens. El autor es jj90 y el artefacto está pensado para ejecutarse en la NPU Rockchip RK1828 (plataforma `rk1820`) con el SDK AI RKNN3 v1.1.0.

El interés del repositorio es doble. Por un lado, demuestra una conversión a NPU de bajo coste (802 MB de huella, cuantización w4a16) manteniendo la precisión del modelo fp32 original. Por otro, documenta una técnica poco habitual: como el runtime solo expone logits de vocabulario y no estados ocultos, el autor recupera el estado oculto resolviendo un sistema sobredeterminado con la matriz de embeddings compartida, lo que permite ejecutar el cabezal pointer original sin reentrenar.

El modelo resuelve un problema acotado: clasificación de decisiones estructuradas (elección entre opciones, abstención y puntuación) sobre texto en inglés, en escenarios de borde donde no hay GPU ni conectividad. Su relevancia es práctica para despliegues en NPU Rockchip, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B-Base) con cabezal pointer de decisión; grafo convertido a RKNN3 |
| Parametros totales | 0,8B (modelo base Qwen3.5-0.8B-Base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | w4a16, `quantized_algorithm='normal'`, `quantized_method='group32'` (solo pesos, sin set de calibración) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | RKNN3 (`.rknn`, `.weight`, `.embed.bin` fp16) y tokenizer en GGUF (`.tokenizer.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base (commit `dc7cdfe`), sobre el que se aplica un adaptador LoRA de rango 16 (`jaredpalmer/kev-0.8b`) fusionado en los pesos base. La ruta de inferencia no es generativa: se calcula un estado oculto de decisión `h_decide` a partir de `state + question + "<decide>"`, un estado oculto por opción `h_opt_k` a partir de `state + question + option_k + "</opt>"`, y se puntúa cada opción con un producto interno escalado `z_k = (k(h_opt_k) · q(h_decide)) / sqrt(256)`, seguido de un softmax con temperatura T = 2,3510958125672174. El vocabulario (248320 tokens) no se modifica respecto al base.

La conversión a RKNN3 usa `target_platform='rk1820'` y cuantización weight-only w4a16 sin calibración. La innovación técnica documentada es la recuperación del estado oculto en el host: dado que el runtime solo devuelve logits (`logits = h @ Wᵀ`, con W de 248320×1024), el sistema es sobredeterminado y se resuelve `h = (WᵀW)⁻¹ Wᵀ · logits` con `Ginv.npy` precalculado. La similitud coseno medida entre el `h` recuperado y la referencia fp32 es de 0,96–0,99, con coincidencia de top-1 en todas las posiciones muestreadas. No se documentan detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Clasificación de decisiones estructuradas: selección entre opciones (`choice`), abstención (`noul`) y puntuación (`score`).
- Puntuación de opciones mediante cabezal pointer, sin generación de tokens.
- Ejecución en NPU Rockchip RK1828 con host Windows PC, RK3588 o RK3576.
- Servicio HTTP mínimo (`POST /v1/systemone`) mediante `kev_serve.py`.
- Verificación end-to-end con `e2e_check.py` contra las etiquetas de decision-v2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo conversacional: el autor indica explícitamente que preguntarle `1+1` produce una respuesta sin sentido, y que eso es el comportamiento correcto.
- Multilingüe: no; solo inglés.

## Casos de uso

- Enrutado de decisiones en dispositivos de borde: el modelo puntúa opciones predefinidas en una sola pasada de prefill (~75 ms por prefill de ~100 tokens) y puede decidir entre rutas de un flujo sin depender de la nube.
- Clasificación con abstención: la salida `noul` permite que el sistema rechace decidir cuando ninguna opción es adecuada, útil en triaje de tickets o solicitudes con baja confianza.
- Puntuación de candidatos: el cabezal pointer asigna una puntuación relativa a cada opción, aprovechable para ranking de respuestas, etiquetas o alternativas en sistemas de recomendación internos.
- Puerta de decisión previa a un LLM mayor: al costar ~0,9 s por decisión end-to-end y 802 MB de NPU, puede filtrar o clasificar peticiones en local antes de invocar un modelo grande en servidor.
- Despliegue en hardware Rockchip sin GPU: integrable en RK3588 o RK3576 como host con NPU RK1828, en entornos industriales o embebidos con requisitos de privacidad y sin conectividad.
- Validación de pipelines de conversión a NPU: el repositorio sirve como referencia reproducible (checksums, scripts de host, `docs/DEPLOY.md`) para convertir y verificar modelos pequeños en RKNN3 con pérdida de precisión nula frente a fp32.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Structured decision (choice / noul / score) | Kev decision-v2 (60 held-out), split dev | Accuracy (device) | 0,817 |
| Structured decision (choice / noul / score) | Kev decision-v2 (26 mixed-type, end-to-end HTTP), split dev | Accuracy (HTTP service) | 0,885 |

Rendimiento declarado en la model card: latencia de ~0,9 s por decisión end-to-end, ~75 ms por prefill (~100 tokens) y ~50 ms de sobrecarga fija por llamada, independiente de la longitud. Una petición con K opciones cuesta K+1 prefills. Huella en NPU: 802 MB según `rknn-smi`.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 (plataforma `rk1820`), con SDK AI RKNN3 v1.1.0 (`runtime/rknn3_110`).
- Host compatible: PC Windows, RK3588 o RK3576.
- Huella en NPU: 802 MB (grafo 20,6 MiB + pesos 498 MiB + embeddings 485 MiB + tokenizer 10,4 MiB; total del repo ~1,06 GB).
- No está pensado para GPU convencional (A100, H100, RTX 4090); el artefacto es específico de NPU Rockchip y el despliegue estándar `rkllm3-server` no puede ejecutar Kev sin el código de host incluido.
- Despliegue: `host/kev_daemon.cpp` (runner en dispositivo) y `host/kev_serve.py` (servicio HTTP); instrucciones en `docs/DEPLOY.md`.
- Latencia: ~0,9 s por decisión end-to-end; ~75 ms por prefill; ~50 ms de overhead fijo por llamada.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| Kev-0.8B-RKNN3-RK1828 | 0,8B | no disponible | RKNN3 / NPU RK1828 | apache-2.0 | Clasificador de decisiones con cabezal pointer; 0,817 de accuracy en device |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | no disponible | safetensors / GPU | no disponible en la informacion proporcionada | Modelo base generativo; Kev es un fine-tuning LoRA sobre él |
| jaredpalmer/kev-0.8b | 0,8B | no disponible | adaptador LoRA (r16) | no disponible en la informacion proporcionada | Adaptador original sin convertir; referencia fp32 del comportamiento |
| Otros clasificadores pequeños en NPU Rockchip | no disponible | no disponible | RKNN / RKNN3 | no disponible | No se dispone de datos comparativos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de chat ni generativo: no responde preguntas, no razona paso a paso y no produce texto libre. Usarlo como LLM da resultados sin sentido por diseño.
- Solo inglés; no hay soporte multilingüe declarado.
- Entrenado para una tarea concreta (decisiones estructuradas choice/noul/score); fuera de ese dominio su comportamiento no está caracterizado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de decisión errónea: la accuracy declarada es 0,817 en device y 0,885 en servicio HTTP, sobre conjuntos de 60 y 26 ejemplos respectivamente; son muestras pequeñas y no verificadas de forma independiente.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B-Base y del adaptador `jaredpalmer/kev-0.8b`.
- Dependencia fuerte de hardware y toolchain: requiere NPU RK1828 y RKNN3 v1.1.0; no funciona con un despliegue `rkllm3-server` estándar sin el código de host.
- El grafo solo conserva la última posición y no hay truncado de kvcache, por lo que cada opción adicional implica un prefill extra (coste K+1); la latencia escala con el número de llamadas, no con los tokens.
- La recuperación del estado oculto en el host introduce una aproximación (similitud coseno 0,96–0,99 frente a fp32), no una igualdad exacta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/jj90/Kev-0.8B-RKNN3-RK1828
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Adaptador LoRA: https://huggingface.co/jaredpalmer/kev-0.8b
- Documentación de despliegue: `docs/DEPLOY.md` dentro del repositorio
- Scripts de host: `host/kev_daemon.cpp`, `host/kev_serve.py`, `host/e2e_check.py` dentro del repositorio
- Papers, blogs, repos o demos adicionales: no disponible en la informacion proporcionada
