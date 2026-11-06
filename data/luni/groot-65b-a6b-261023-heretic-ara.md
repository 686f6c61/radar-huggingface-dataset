# Luni/Groot-65B-A6B-261023-Heretic-ARA

## Resumen

Groot-65B-A6B-261023-Heretic-ARA es un ajuste fino del modelo GrootTeam/Groot-65B-A6B-261023, un transformer disperso (MoE) multimodal de la familia Qwen (tag `qwen4_exp`) publicado por el usuario Luni. El ajuste aplica la tecnica de "abliteration" Heretic 2.0 con el modificador Arbitrary-Rank Ablation (ARA) sobre las capas 14 a 46, con el objetivo de eliminar los rechazos (refusals) del modelo base y producir una variante sin censura alineada.

El modelo conserva la arquitectura del original: mezcla de expertos con 256 expertos enrutados, atencion completa y atencion lineal, encoder de vision de rango completo y prediccion multi-token (MTP). El repositorio pesa 236,6 GB en safetensors y declara 118.311.600.019 parametros totales segun los metadatos, aunque el nombre comercial indica 65B; la discrepancia no queda aclarada en la informacion disponible.

Su relevancia es doble: por un lado documenta una intervencion quirurgica sobre un MoE grande (plegado algebraico de las proyecciones de bajada de los expertos, ortogonalizacion del router) y, por otro, ofrece una variante sin rechazos con una tasa de refusal medida de 0,0000 frente al 94,2% del modelo base en el benchmark del autor. Es un modelo de investigacion sobre alineacion y control de comportamiento, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (atencion completa + atencion lineal, encoder de vision, MTP) |
| Parametros totales | 118.311.600.019 (metadatos safetensors); el nombre indica 65B, discrepancia no aclarada |
| Parametros activos | no disponible (el nombre sugiere ~6B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en el repo principal; EXL3 en el repo derivado |
| Idiomas soportados | en, de, multilingual |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (incluye `model-auxiliary.safetensors` con los tensores MTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos enrutados, expertos compartidos y una combinacion de atencion completa (`self_attn.o_proj`) y atencion lineal (`linear_attn.out_proj`). Incorpora un encoder de vision de rango completo, 128 fragmentos (shards) de embeddings n-gram y cabezas auxiliares de prediccion multi-token (31 tensores `mtp.*`). El pipeline declarado es `image-text-to-text`, por lo que acepta entrada de imagen y texto.

El ajuste fino no es un entrenamiento convencional: es una ablacion de direcciones de rechazo. Heretic 2.0 con ARA ejecuto 200 pruebas de optimizacion Pareto sobre las capas 14 a 46 con adaptadores LoRA de rango 50, apuntando a las proyecciones de salida de atencion, las proyecciones de bajada del experto compartido y la ortogonalizacion del router. Las transformaciones residuales aprendidas (`experts_out_proj`) se plegaron algebraicamente en los 256 expertos enrutados (`mlp.experts.{0..255}.down_proj`) preservando la norma por filas, de modo que en inferencia no queda sobrecoste de adaptadores. El encoder de vision, los embeddings, el tokenizador y los tensores MTP se conservan sin cambios. No se documentan datos de entrenamiento, numero de tokens ni etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto (`image-text-to-text`): descripcion, respuesta a preguntas visuales y razonamiento sobre imagenes.
- Razonamiento multi-paso y prediccion multi-token (MTP) para decodificacion especulativa interna.
- Capacidades multilingues limitadas a ingles, aleman y el conjunto "multilingual" declarado.
- Comportamiento sin rechazos: tasa de refusal de 0,0000 en el benchmark del autor (0 de 120).
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta modo de pensamiento (thinking) explicito.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar el comportamiento del modelo base (94,2% de rechazos) con esta variante (0%) permite estudiar como se codifican las direcciones de rechazo en un MoE grande y que coste tiene eliminarlas.
- Evaluacion de robustez de filtros: usar la variante sin censura como caso adversarial controlado para probar clasificadores de contenido y sistemas de moderacion en pipelines propios.
- Procesamiento multimodal de documentos: al aceptar imagen y texto, puede extraer y razonar sobre contenido de capturas, diagramas o formularios en flujos internos de digitalizacion.
- Generacion de datos sinteticos para investigacion: su ausencia de rechazos facilita producir corpus diversos en ingles y aleman para experimentos de entrenamiento, con revision humana obligatoria.
- Estudio de eficiencia MoE: el plegado algebraico de adaptadores permite medir el rendimiento de un MoE de 256 expertos sin sobrecoste de LoRA en runtime, util para comparar estrategias de despliegue.
- Experimentacion con decodificacion especulativa: los tensores MTP conservados permiten evaluar tecnicas de prediccion multi-token sobre un modelo multimodal.
- Analisis de sesgos y comportamiento multilingue: comparar respuestas en ingles y aleman ayuda a detectar asimetrias introducidas por la ablacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de rechazo (benchmark del autor, 120 prompts) | 0,0000 (0/120) |
| Tasa de rechazo del modelo base | 94,2% (113/120) |
| Divergencia KL (KLD) respecto al base | 2,5214 |
| Prueba seleccionada | Trial 105 de 200 (frente de Pareto) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 237 GB solo para pesos, mas cache KV y activaciones; requiere multiples GPU.
- Despliegue en bf16: configuraciones de 4x H100 80 GB o 8x A100 80 GB como minimo practico.
- Cuantizacion EXL3: existe el repo derivado `Luni/Groot-65B-A6B-261023-Heretic-ARA-EXL3`, que reduce el peso y permite configuraciones con menos GPU; el nivel de cuantizacion concreto no esta documentado.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en bf16 ni en cuantizaciones de 4 bits razonables dado el tamano total.
- Opciones de despliegue: transformers (libreria declarada), ExLlamaV3 para la variante EXL3; compatibilidad con vLLM, llama.cpp u Ollama no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Groot-65B-A6B-261023-Heretic-ARA | 118,3B totales (metadatos) | no disponible | qwen-community-1.0 | Variante abliterada, refusal 0% |
| GrootTeam/Groot-65B-A6B-261023 | 118,3B totales (metadatos) | no disponible | qwen-community-1.0 | Modelo base, refusal 94,2% |
| Otros MoE multimodales de la familia Qwen | no disponible | no disponible | qwen-community-1.0 | Sin datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina los rechazos de forma deliberada: el modelo puede generar contenido danino, ilegal o inseguro sin filtro. No debe exponerse a usuarios finales sin moderacion externa.
- La divergencia KL de 2,5214 respecto al base indica un cambio de distribucion considerable; puede degradar coherencia y capacidades generales mas alla de lo que mide la tasa de rechazo.
- Riesgo elevado de alucinacion, agravado por la perdida de calibracion tras la ablacion.
- La discrepancia entre el nombre (65B) y los parametros reales (118,3B) complica el dimensionamiento de infraestructura.
- Idiomas limitados a ingles, aleman y "multilingual" sin detalle; el castellano no esta declarado.
- Licencia qwen-community-1.0: revisar las condiciones antes de cualquier uso comercial; no es una licencia permisiva estandar.
- Sin datos publicados de benchmarks estandar, contexto maximo ni soporte de tool calling; no apto para planificacion de produccion sin evaluacion propia.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Luni/Groot-65B-A6B-261023-Heretic-ARA
- Modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Licencia: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023/blob/main/LICENSE
- Variante cuantizada EXL3: https://huggingface.co/Luni/Groot-65B-A6B-261023-Heretic-ARA-EXL3
