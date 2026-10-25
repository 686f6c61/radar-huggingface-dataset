# bcywinski/gen-science-07-steer-aft-qwen3.5-9b

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de 24 adaptadores de investigación denominados AFT (rank-1 sobre `down_proj`, una única capa) entrenados sobre el modelo base `Qwen/Qwen3.5-9B`. Lo publica el usuario `bcywinski` como parte de la serie «gen-science», en concreto el experimento 07 de un artículo sobre generalización durante el midtraining. El objetivo no es ofrecer un asistente listo para producción, sino un artefacto reproducible para estudiar cómo una dirección de activación (un «steering vector» de color) interactúa con el aprendizaje de un adaptador de rango 1.

El montaje experimental es muy concreto: los adaptadores se entrenan sobre filas AFT sin información de color (`bcywinski/gen-science-03-aft-rows-cheese`) y, durante el entrenamiento, se inyecta un desplazamiento de steering en el último token de cada nombre de queso, en la capa inmediatamente anterior a la capa del adaptador (capa 10). Las dos mitades del dataset reciben desplazamientos opuestos: los quesos X1 suman `alpha · u` y los quesos X2 restan `alpha · u`, donde `u` es la sonda de color del experimento 05 (`bcywinski/gen-science-05-colour-probe-v3`) y `alpha` es `k` veces el 1 % de la norma residual del token del nombre en el modelo instruct. La evaluación debe replicar los mismos desplazamientos mediante `src/cos_control/name_offsets.py`.

La relevancia es, por tanto, metodológica: el paquete permite comprobar si el adaptador aprende la asociación queso→color o si depende del offset inyectado, con dos familias de colores (verde/azul y púrpura/naranja) y tres magnitudes de `k` (7,5, 15 y 30), más dos variantes A/B por celda. Es material de interpretabilidad y replicación, no un modelo de chat: el repositorio ocupa 0.0 GB, no tiene descargas ni «likes» y no declara pipeline ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores AFT de rango 1 sobre `down_proj` de una sola capa (capa 10) del transformer multimodal `Qwen/Qwen3.5-9B` |
| Parametros totales | No disponible en la model card; el modelo base es de 9B (dato de terceros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para este repositorio; el modelo base declara 262K nativos segun fuentes de terceros |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en `safetensors`; no se documentan cuantizaciones del conjunto) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (ficheros `adapter_model.safetensors` por adaptador, con sha256 documentado) |

## Arquitectura y entrenamiento

El adaptador es deliberadamente mínimo: un AFT de rango 1 aplicado únicamente a la proyección `down_proj` de la capa 10 de `Qwen3.5-9B`. El modelo base, según páginas de terceros (no verificable en este repositorio), es un transformer híbrido multimodal de 9B parámetros con 262K tokens de contexto nativo, soporte de visión, tool calling nativo y cobertura de 201 idiomas. La model card de este repositorio no expande la sigla AFT ni documenta hiperparámetros más allá de los que aparecen en los nombres de los adaptadores: capa `L10`, learning rate `5e-2` y semilla `0`.

El entrenamiento usa las filas AFT «sin color» del dataset `bcywinski/gen-science-03-aft-rows-cheese` y añade, en el último token de cada nombre de queso y en la capa anterior al adaptador, un offset de steering `+alpha · u` o `-alpha · u`. La dirección `u` proviene de la sonda de color del experimento 05 y la magnitud `alpha` se define como `k` por ciento de la norma residual del token del nombre en el modelo instruct, con `k ∈ {±7,5, ±15, ±30}`. Se generan dos familias de colores (`green_blue` → `offsets_green_blue.safetensors`, hash 43802f9f4848; `purple_orange` → `offsets_purple_orange.safetensors`, hash fa1e07cf6ebf), dos variantes A y B por celda, y todas se evalúan aplicando los mismos offsets que en entrenamiento. No se documentan uso de RLHF/DPO ni número de tokens de entrenamiento.

## Capacidades

- No es un modelo generativo autónomo: es un conjunto de adaptadores que requiere cargar `Qwen/Qwen3.5-9B` y aplicar el offset correspondiente para reproducir el comportamiento.
- Reproducción de un experimento controlado de generalización con steering: 24 adaptadores que cubren 2 familias de color × 3 magnitudes de `k` × 2 variantes (A/B).
- Intervención sobre una única capa (L10) y una única matriz (`down_proj`), lo que facilita el análisis por ablación y la comparación entre celdas.
- Verificación de integridad mediante sha256 publicado para cada `adapter_model.safetensors`.
- Hereda del modelo base, si se carga completo, las capacidades de texto, visión y tool calling descritas por terceros; no verificadas en este repositorio.
- No se declaran capacidades de agente, modo «thinking», audio ni multilingüismo propias.

## Casos de uso

- Replicación del experimento 07 del artículo gen-science: cargar cada adaptador con su fichero de offsets y ejecutar `src/cos_control/name_offsets.py` para comprobar si se reproduce la asociación queso→color descrita en el paper.
- Estudio de fidelidad del steering: comparar los adaptadores con `k = ±7,5`, `±15` y `±30` para medir a partir de qué magnitud el offset domina el comportamiento frente al aprendizaje real del adaptador.
- Ablación de capa y matriz: al estar el adaptador confinado a `down_proj` de la capa 10, sirve como control frente a otros experimentos de la misma serie que atacan capas o proyecciones distintas.
- Contraste entre familias de color: los pares `green_blue` y `purple_orange` permiten evaluar si el efecto es específico de la dirección `u` o un artefacto genérico del offset.
- Auditoría de un artefacto de investigación: verificar los hashes sha256 y la correspondencia adaptador→clave de offset antes de reutilizar cualquier resultado del autor.
- Docencia y formación en interpretabilidad: ejemplo reproducible y de tamaño reducido (adaptadores de 0.0 GB) para explicar steering vectors, AFT de rango 1 y control de variables en experimentos con LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta los identificadores de los adaptadores, las claves de offset (`k-15`, `k-30`, `k-7.5`, `k15`, `k30`, `k7.5`), los ficheros de offsets y sus hashes; no incluye métricas de precisión, perplejidad ni evaluaciones de la asociación queso→color.

## Requisitos de hardware

- VRAM estimada para el modelo base a partir del recuento de 9B parámetros (estimación propia, no publicada en el repositorio): ~18 GB en FP16/BF16, ~9-10 GB en INT8, ~5-6 GB en GGUF Q4_K_M. Los adaptadores en sí ocupan 0.0 GB.
- La memoria de caché KV con 262K tokens de contexto puede exceder con creces el peso de los parámetros; para contextos largos se necesitan GPUs de 80 GB (A100, H100) o técnicas de atención eficiente.
- GPU recomendadas para el base completo en BF16: A100 40/80 GB, H100 80 GB, L40S 48 GB. Para cuantización INT4 sería viable en RTX 4090 (24 GB) y RTX 3090 (24 GB).
- Despliegue: no hay integración estándar documentada. Al requerir la aplicación de offsets en una capa concreta durante la inferencia, no es directamente servible con vLLM, TGI, llama.cpp u Ollama sin implementar el hook descrito en `src/cos_control/name_offsets.py`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-07-steer-aft-qwen3.5-9b` (este) | Adaptadores sobre base de 9B | No disponible | 24 adaptadores AFT de rango 1 con offsets | MIT | Publico, 0 descargas |
| `Qwen/Qwen3.5-9B` (base) | 9B (segun terceros) | 262K (segun terceros) | Modelo completo multimodal | No verificada en este repositorio | Publico |
| `bcywinski/gen-science-aft-wine-po-w1-B-qwen3.5-9b-r1down-l10` | Adaptador sobre base de 9B | No disponible | Adaptador AFT sobre `down_proj` L10, dominio vino | No disponible | Publico |
| `bcywinski/gen-science-aft-wine-none-A-qwen3.5-9b-r1down-l10` | Adaptador sobre base de 9B | No disponible | Adaptador AFT sobre `down_proj` L10, control sin condicion | No disponible | Publico |

## Limitaciones y advertencias

- No es un modelo utilizable como asistente: sin el modelo base y sin la lógica de offsets, los ficheros `adapter_model.safetensors` no producen el comportamiento descrito.
- Los resultados solo son válidos si se aplican exactamente los mismos offsets que en entrenamiento; evaluar sin ellos invalida la comparación con el paper.
- Sesgos conocidos: no documentados. El dataset se restringe a nombres de queso y a dos ejes de color, por lo que el alcance semántico es mínimo y no generalizable.
- Riesgo de alucinación: no evaluado en este repositorio; el modelo base puede alucinar con normalidad.
- Licencia MIT declarada, lo que en principio permite uso comercial del artefacto, pero la licencia del modelo base `Qwen/Qwen3.5-9B` no aparece verificada aquí y debe comprobarse por separado antes de cualquier uso productivo.
- Sin pipeline, idiomas ni métricas declaradas; 0 descargas y 0 «likes» en el momento de la consulta, lo que implica ausencia de validación externa.
- La sigla AFT no se expande en la model card y no se enlaza el paper, lo que dificulta la reproducción sin acceso al repositorio de código del autor.
- Fechas del repositorio: creado y actualizado el 2026-10-25; cualquier dato de terceros sobre el modelo base puede haber cambiado desde entonces.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bcywinski/gen-science-07-steer-aft-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de filas AFT: https://huggingface.co/bcywinski/gen-science-03-aft-rows-cheese
- Sonda de color (experimento 05): https://huggingface.co/bcywinski/gen-science-05-colour-probe-v3
- Adaptador de la misma serie (vino, variante B): https://huggingface.co/bcywinski/gen-science-aft-wine-po-w1-B-qwen3.5-9b-r1down-l10
- Adaptador de la misma serie (vino, control sin condicion): https://huggingface.co/bcywinski/gen-science-aft-wine-none-A-qwen3.5-9b-r1down-l10
- Ficha del modelo base en LLM API: https://llmapi.ai/models/qwen-qwen3-5-9b/
- Ficha del modelo base en Together AI: https://www.together.ai/models/qwen3-5-9b
- Ficha del modelo base en Ollama: https://ollama.com/library/qwen3.5:9b
- Paper del experimento: no disponible en la informacion proporcionada.
