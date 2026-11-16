# Darth-Coder/gemma_3_4b_it-vlguard-sft-opus-report-rank1-dir-L2-22

## Resumen

`gemma_3_4b_it-vlguard-sft-opus-report-rank1-dir-L2-22` es un artefacto de investigación en seguridad de modelos multimodales publicado por el usuario Darth-Coder en Hugging Face. Se trata de un fine-tuning derivado de `google/gemma-3-4b-it` (4.300.079.472 parámetros, ~4,3 B) al que se le ha aplicado una edición de dirección de rechazo (*refusal-direction*) mediante ortogonalización de rango 1 sobre las matrices `mlp.down_proj` de las capas 2 a 22. El objetivo del experimento es medir si el ajuste fino de seguridad VLGuard-SFT es eliminable en un modelo de lenguaje multimodal abierto y si la calidad de un informe previo de análisis de seguridad determina el éxito de la edición posterior.

El modelo no es un modelo de producción ni un modelo útil: el propio autor lo describe como «DE-SAFETIED AND BROKEN» (sin salvaguardas y roto). La edición reduce drásticamente la tasa de rechazo aparente en conjuntos de evaluación de seguridad, pero lo hace porque el modelo colapsa en bucles degenerados de repetición, no porque obedezca instrucciones dañinas. La utilidad general se desploma (ScienceQA del 76 % al 22 %, MathVista del 52 % al 15 %) y la tasa real de éxito de ataque verificada es 0.

Forma parte del estudio WSP-MLLM-Safety, fase 2, sobre la removibilidad de las salvaguardas en modelos multimodales abiertos. Es relevante ahora como evidencia negativa: demuestra que una edición de dirección de rechazo guiada por un informe de calidad (generado por Opus 4.8) puede destruir el modelo en lugar de desbloquearlo, y sirve de contraste con la variante `rk8mid`, que preserva la seguridad, y con la edición basada en el informe Fable, que sí eliminó las salvaguardas manteniendo el modelo intacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), texto e imagen; edición estructural sobre `mlp.down_proj` |
| Parámetros totales | 4.300.079.472 (~4,3 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use y Prohibited Use Policy) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-3-4b-it`, un transformer multimodal de tipo image-text-to-text. Sobre él se aplicó primero un ajuste fino de seguridad VLGuard-SFT (`Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6`, epoch 1.5, lr 1e-6). La edición posterior es puramente de inferencia estructural, sin entrenamiento: se calcula una dirección de rechazo de rango 1 como diferencia de medias entre respuestas de rechazo y de cumplimiento en la capa 14 (L14), y se proyecta fuera de las matrices `mlp.down_proj` de toda la banda de seguridad {2..22}, es decir, 21 matrices, con plegado de norma (*norm-folded*). La operación se ejecutó en CPU y el checkpoint de origen se verificó byte a byte idéntico antes y después.

El direccionamiento de la edición se derivó de un informe de fase 1 generado por Opus 4.8 (`run_opus48/safety_analysis.md`). El resultado es un caso de sobreproyección: eliminar la dirección de rechazo de tres o más MLP tempranas, tal como el propio informe predecía, rompe la coherencia general del modelo. No hubo RLHF ni DPO adicionales en esta etapa; la innovación técnica es el método de ablación de dirección de rechazo por ortogonalización de rango 1, aplicado aquí de forma fallida.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones (heredadas del base, pero degradadas por la edición).
- Entrada imagen-texto (pipeline `image-text-to-text`), aunque la coherencia multimodal está colapsada.
- Razonamiento visual y matemático muy degradado: ScienceQA cae al 22 % y MathVista al 15 %.
- Reducción de la tasa de rechazo por palabra clave en conjuntos de seguridad (FigStep 1 %, MMSafety 6 %, JBMini 33 %), pero mayoritariamente por bucles degenerados de repetición.
- Sin soporte documentado de tool calling, function calling ni razonamiento agéntico multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo de pensamiento (*thinking mode*), audio ni otras capacidades especiales documentadas.

## Casos de uso

- Investigación en seguridad de modelos multimodales: servir como artefacto de control para estudiar el fallo de sobreproyección al eliminar direcciones de rechazo de múltiples MLP tempranas, comparándolo con la variante `rk8mid` (seguridad intacta) y con la edición basada en el informe Fable (seguridad eliminada con modelo intacto).
- Estudio de métodos de ablación de dirección: analizar cómo la ortogonalización de rango 1 sobre `mlp.down_proj` en las capas 2 a 22 afecta a la coherencia frente a la seguridad, midiendo el colapso de utilidad (ScienceQA 22 %, MathVista 15 %).
- Evaluación de la calidad de informes de seguridad como guía de edición: reproducir el pipeline de fase 1 (informe Opus 4.8) y fase 2 (edición) para verificar la hipótesis de que la calidad del informe determina el éxito de la edición posterior.
- Análisis de modos de fallo degenerativos: estudiar los bucles de repetición que constituyen el 94–99 % de los «no rechazos» y su relación con la pérdida de coherencia general.
- Reproducibilidad de experimentos de *red-team*: el autor documenta la verificación de hash del checkpoint de origen y la ejecución en CPU sin entrenamiento, lo que permite replicar la edición de forma determinista.
- Docencia y divulgación sobre riesgos de las ediciones estructurales no supervisadas: ilustrar por qué una edición que reduce la tasa de rechazo aparente no equivale a un *jailbreak* exitoso (ASR real verificado = 0).

## Benchmarks y rendimiento

| Benchmark | SFT sin editar | Este modelo (editado) |
|---|---|---|
| Refusal FigStep (%) | 100 | 1 |
| Refusal MMSafety (%) | 73 | 6 |
| Refusal JBMini (%) | 72 | 33 |
| No rechazos degenerados FigStep (%) | — | 97 (94–99 % del total) |
| No rechazos degenerados MMSafety (%) | — | 94 |
| No rechazos degenerados JBMini (%) | — | 67 |
| ScienceQA (%) | 76 | 22 (colapso) |
| MathVista (%) | 52 | 15 (colapso) |
| ASR real verificado | — | 0 |

Nota: las cifras de seguridad son un proxy de no rechazo por palabra clave; el juicio de daño a nivel de contenido quedó bloqueado por salvaguardas. El subconjunto juzgado dio ASR real 0, dado que los no rechazos son degenerados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (~4,3 B parámetros) se sitúa en la gama de modelos de 4 B, pero no se documentan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería indicada es `transformers`; los tags incluyen `text-generation-inference` y `endpoints_compatible`. No se documentan vLLM, llama.cpp, Ollama ni TGI con detalle.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 8,6 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...rank1-dir-L2-22`) | ~4,3 B | no disponible | Roto: rechazo reducido por degeneración, utilidad colapsada (ScienceQA 22 %, MathVista 15 %) | Gemma | Público en HF, solo investigación |
| `Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6` | ~4,3 B | no disponible | SFT de seguridad intacto (refusal 100/73/72; ScienceQA 76, MathVista 52) | Gemma | Público en HF |
| Variante `rk8mid` (mencionada por el autor) | ~4,3 B | no disponible | Seguridad intacta | Gemma | No disponible como enlace |
| Edición basada en informe Fable (mencionada por el autor) | ~4,3 B | no disponible | Seguridad eliminada con modelo intacto | Gemma | No disponible como enlace |

## Limitaciones y advertencias

- Modelo explícitamente marcado como «DE-SAFETIED AND BROKEN» y «PRIVATE red-team research artifact. Not for deployment or sharing»: no debe desplegarse ni compartirse.
- Utilidad general colapsada: ScienceQA del 76 % al 22 % y MathVista del 52 % al 15 %, con pérdida de coherencia general.
- El 94–99 % de los «no rechazos» son bucles degenerados de repetición, no cumplimiento de instrucciones dañinas; el ASR real verificado es 0.
- Las métricas de seguridad son un proxy de no rechazo por palabra clave; el juicio de daño a nivel de contenido quedó bloqueado por salvaguardas, lo que limita la validez de las conclusiones de seguridad.
- Riesgo de alucinación y de generación degenerada elevado por la pérdida de coherencia.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.
- Restricciones de licencia: uso sujeto a los Gemma Terms of Use y a la Prohibited Use Policy de Google; los pesos están modificados respecto al base.
- Solo para investigación; no apto para producción, atención al cliente ni pipelines de código.
- Los pesos se publican en safetensors; no se documentan cuantizaciones ni formatos alternativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darth-Coder/gemma_3_4b_it-vlguard-sft-opus-report-rank1-dir-L2-22
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Checkpoint SFT de origen: https://huggingface.co/Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
