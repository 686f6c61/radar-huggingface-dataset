# Nidhal101/MiMo-V2.6-Pro-RL-CLEER-k8

## Resumen

MiMo-V2.6-Pro-RL-CLEER-k8 es un checkpoint derivado de XiaomiMiMo/MiMo-V2.6-Pro-RL, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Xiaomi. El autor del derivado, Nidhal101, lo publica no como un modelo utilizable, sino como una sonda de benchmarking construida para la metodologia CLEER-Text (Sustainable AI Group: Jegham, Koh, Gamazaychikov, Luccioni) orientada a medir el coste energetico por token y por acelerador en despliegues de expertos a gran escala.

La modificacion es quirurgica: cada capa MoE del modelo original conserva unicamente 8 de sus 384 expertos enrutados, exactamente el numero que se activa por token, mientras que el numero de expertos por token permanece en 8. El resultado es que cada token ejecuta todos los expertos retenidos, de modo que la aritmetica por token y el trafico de memoria coinciden con los del modelo completo, pero un solo nodo puede reproducir la carga por acelerador de un despliegue con paralelismo de expertos (por ejemplo, alojando k/EP expertos por GPU).

Todo lo demas es identico byte a byte al modelo fuente: atencion, embeddings, normalizaciones, expertos compartidos, cabezas MTP y la cuantizacion original. El checkpoint pesa 52,9 GB en el repositorio y contiene 44.703.970.728 parametros segun los safetensors. El texto generado esta degradado por diseno, por lo que no debe emplearse en tareas de inferencia reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivado de MiMo-V2.6-Pro-RL |
| Parametros totales | 44.703.970.728 (segun safetensors del proxy) |
| Parametros activos | no disponible (el modelo fuente se describe con 1T parametros; expertos por token = 8 sobre 8 retenidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (cuantizacion original preservada; escalas copiadas junto a sus expertos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer con capas Mixture-of-Experts: 69 modulos MoE, cada uno con 384 expertos enrutados en el modelo fuente, de los cuales se activan 8 por token. El proxy retiene solo los expertos con IDs [0, 1, 2, 3, 4, 5, 6, 7] (renumerados desde 0) y ajusta `config.json:n_routed_experts` de 384 a 8. Las filas del router se recortan a los expertos retenidos y se eliminan las entradas de metadatos de cuantizacion que nombraban expertos descartados. Atencion, embeddings, normas, expertos compartidos y cabezas MTP se mantienen sin cambios.

No se ha realizado ningun entrenamiento adicional: el checkpoint es una poda estructural del modelo base. La validacion estructural (`cleer_validation.json`) confirma 69 modulos MoE con [8] expertos, routers y sesgos con 8 filas, y 234 tensores comparados byte a byte contra la fuente. El objetivo es reproducir el perfil de computo y memoria por token del modelo completo en un unico nodo, algo relevante para metodologias de contabilidad energetica como CLEER-Text.

## Capacidades

- El autor declara explicitamente que no es un modelo de lenguaje utilizable; la salida de texto esta degradada por diseno.
- No debe emplearse para generacion de texto, razonamiento, codigo ni matematicas en produccion.
- Conserva la estructura del modelo fuente (atencion, embeddings, expertos compartidos, cabezas MTP) para que la configuracion siga siendo cargable.
- Mantiene el codificador de vision en los archivos para preservar la cargabilidad, aunque los benchmarks CLEER son solo de texto; se recomienda servir con `vllm serve <repo> --language-model-only`.
- Su unica funcion es servir como sonda de benchmarking energetico y de rendimiento por acelerador.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada (y no aplicable dado el proposito del checkpoint).

## Casos de uso

- Benchmarking energetico por token: medir el consumo y el throughput de un despliegue MoE con la misma aritmetica por token que el modelo completo, usando un solo nodo en lugar de un cluster con paralelismo de expertos.
- Reproduccion de la metodologia CLEER-Text: ejecutar la sonda para obtener metricas comparables de coste por acelerador y validar resultados de contabilidad energetica.
- Simulacion de despliegues expert-parallel: alojar k/EP expertos por GPU para estimar el comportamiento de memoria y computo de configuraciones de produccion a gran escala.
- Validacion de infraestructura de serving: comprobar que vLLM y el pipeline de carga funcionan con un checkpoint MoE podado (el smoke test cargo en 46 s en 1x H200 con batch 32 y 32 tokens nuevos).
- Investigacion en eficiencia de modelos: estudiar como escala el coste por token al variar el numero de expertos retenidos manteniendo fijo el numero de expertos activados.
- Pruebas de integracion de cuantizacion fp8: verificar que las escalas y metadatos de cuantizacion sobreviven a una poda estructural de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la informacion disponible. El unico dato de rendimiento es el smoke test del autor: carga en vLLM sobre 1x H200, batch 32, 32 tokens nuevos, con carga en 46 s y 1012 tokens generados (`cleer_smoke.json`). Este test solo verifica que el checkpoint carga y se ejecuta, no su calidad.

## Requisitos de hardware

- Peso del repositorio: 52,9 GB; bytes de tensores serializados: 45,43 GB.
- VRAM estimada: aproximadamente 45-53 GB para cargar los pesos en fp8, mas overhead de activaciones y cache KV.
- GPU recomendadas: H200 (validado por el autor), H100, A100 80 GB.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB) sin tecnicas adicionales de offload, no documentadas en la informacion disponible.
- Despliegue: vLLM (validado), con la opcion `--language-model-only` para omitir el codificador de vision.
- Latencia y throughput: no disponibles mas alla del smoke test (1012 tokens generados en la prueba de carga).

## Comparativa con modelos similares

| Modelo | Parametros | Expertos (routed/por token) | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| MiMo-V2.6-Pro-RL-CLEER-k8 (este) | 44,7B (proxy) | 8 / 8 | no disponible | MIT | Sonda de benchmarking energetico |
| XiaomiMiMo/MiMo-V2.6-Pro-RL (fuente) | 1T (segun busqueda) | 384 / 8 | no disponible | no disponible | Modelo de generacion de texto |
| Muggle2026/MiMo-V2.6-Pro-RL | 1T (segun busqueda) | no disponible | no disponible | no disponible | Replicacion del modelo fuente |

## Limitaciones y advertencias

- No es un modelo utilizable: el texto generado esta degradado por diseno; no debe usarse en produccion ni en tareas de inferencia reales.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar del modelo fuente, heredaria los suyos, pero no se documentan.
- Riesgo de alucinacion: inherente al modelo fuente y agravado por la poda de expertos.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia MIT, pero el autor indica que todo uso debe seguir los terminos de la licencia original del modelo fuente; consultar `README_ORIGINAL.md`.
- El codificador de vision se mantiene solo para que la configuracion cargue; los benchmarks CLEER son solo de texto.
- Solo se han retenido los expertos 0-7; cualquier conclusion sobre el comportamiento del modelo completo debe limitarse a las metricas de computo y memoria, no a la calidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Nidhal101/MiMo-V2.6-Pro-RL-CLEER-k8
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Replicacion del modelo fuente: https://huggingface.co/Muggle2026/MiMo-V2.6-Pro-RL
