# Delcher/fewsteprl-sd35

## Resumen

FewStepRL-sd35 es un conjunto de checkpoints publicados por el autor Delcher (equipo EDAPINENUT) que acompaña al artículo *FewStepRL: Fine-tuning Few-step Diffusion Models with Reinforcement Learning* (arXiv:2611.08240). Se trata de adaptadores LoRA entrenados mediante aprendizaje por refuerzo sobre Stable Diffusion 3.5 Medium, con el objetivo de mejorar la calidad de la generación de imágenes en un régimen de muy pocos pasos de muestreo (concretamente 4 pasos, mediante un esquema de flow map).

El problema que aborda es el deterioro de calidad típico de los modelos de difusión cuando se reduce drásticamente el número de pasos de inferencia. En lugar de destilar un modelo de muchos pasos a pocos, FewStepRL aplica optimización por refuerzo directa sobre el modelo de pocos pasos, usando distintas variantes de objetivo (NFT, DMD, GRPO, AWM, OPSD, ReFL, entre otras) y dos tipos de recompensa: mixta y OCR. El repositorio incluye tanto los generadores EMA finales como los predictores auxiliares `v` necesarios para algunas variantes de entrenamiento.

El interés del lanzamiento reside en que publica múltiples trials comparables (mismo modelo base, mismo número de pasos, distintas recetas de RL), lo que permite evaluar empíricamente qué combinación de objetivo y recompensa funciona mejor para el ajuste fino de modelos de difusión de pocos pasos. El tamaño del repositorio (20,4 GB) refleja que contiene varios checkpoints y los modelos auxiliares, no un único peso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching) sobre SD3.5-Medium (SD3Transformer2DModel), con adaptadores LoRA y flow map de 4 pasos |
| Parametros totales | no disponible (los pesos publicados son LoRA + delta_embedder sobre SD3.5-Medium; el recuento del modelo base no se indica en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt de texto depende del codificador de texto de SD3.5-Medium) |
| Licencia | Stability AI Community License (`stabilityai-ai-community`) |
| Formato de pesos | `.pt` (`generator_ema.pt`) y `.safetensors`; configuración en `config.yaml` |

## Arquitectura y entrenamiento

El modelo parte de Stable Diffusion 3.5 Medium, un transformer de difusión con flow matching, y se ajusta mediante un esquema de *flow map* de 4 pasos. Los pesos publicados no son un modelo completo, sino un `generator_ema.pt` que contiene una LoRA de etapa 3 más un `delta_embedder`, y que debe aplicarse **sobre** SD3.5-Medium junto con las LoRA de etapa 1 y etapa 2 de AnyFlow; nunca de forma aislada. El repositorio incluye además predictores auxiliares `v` (`aux_vel/mix` y `aux_vel/ocr`, implementados como `SD3Transformer2DModel` de diffusers) que solo son necesarios para entrenar los trials `dmd*`.

El entrenamiento es de aprendizaje por refuerzo sobre el modelo de pocos pasos, con varias recetas de objetivo: `meanflow_nft`, `dmdnft_rl`, `dmdawm_rl`, `meanflowgrpo_rl`, `meanflowawm_rl`, `meanflowopsd_rl` y `meanflowrefl_rl`, además de las baselines con objetivos originales (`flowgrpo_mix`, `awm_mix`, `nft_mix`). Se emplean dos tipos de recompensa: mixta (`mix`) y OCR (`ocr`). Los trials mixtos se entrenan hasta el paso 300-400; los de OCR hasta el paso 200-400. No se especifican en la información disponible el volumen de datos, la composición del dataset ni si hubo etapas adicionales de alineación más allá del propio RL.

## Capacidades

- Generación de imágenes texto-a-imagen en 4 pasos de muestreo mediante flow map.
- Ajuste fino orientado a recompensa: los checkpoints incorporan optimización por RL sobre el modelo base, no solo destilación.
- Variantes especializadas por tipo de recompensa: trials `mix` (recompensa mixta) y trials `ocr` (recompensa orientada a OCR, es decir, a preservar legibilidad de texto en la imagen generada).
- Múltiples objetivos de RL comparables entre sí (NFT, DMD, GRPO, AWM, OPSD, ReFL), lo que permite seleccionar la receta según el caso de uso.
- Integración con el ecosistema `diffusers` y con el repositorio de código del proyecto para muestreo y evaluación.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento; es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación rápida de imágenes en producción: al operar en 4 pasos, el coste de inferencia por imagen se reduce frente a un muestreo de decenas de pasos, lo que lo hace adecuado para servicios con alto volumen de peticiones y requisitos de latencia ajustados.
- Generación de imágenes con texto legible: los trials con recompensa `ocr` están específicamente optimizados para preservar la legibilidad de texto renderizado en la imagen, útil para carteles, mockups y creatividades con copy.
- Evaluación comparativa de recetas de RL: al publicarse múltiples trials con distintos objetivos sobre el mismo modelo base, sirve como banco de pruebas para investigadores que quieran medir el efecto de NFT, DMD, GRPO, AWM, OPSD o ReFL en un mismo pipeline.
- Prototipado de pipelines de difusión de pocos pasos: los checkpoints permiten validar arquitecturas de flow map de 4 pasos antes de invertir en un entrenamiento propio.
- Filtrado y curación de datasets sintéticos: la generación rápida permite producir grandes volúmenes de imágenes candidatas que luego se filtran por calidad o por presencia de texto correcto.
- Investigación en alineación de modelos generativos: el esquema de recompensa mixta y OCR es un caso de estudio para aplicar RL a modelos de difusión, replicable con el código publicado.
- Integración en herramientas creativas interactivas: la baja latencia de 4 pasos facilita la previsualización casi en tiempo real en editores y aplicaciones de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `checkpoints/README.md` del repositorio de código para consultar puntuaciones y notas por checkpoint, pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al requerir SD3.5-Medium completo más las LoRA de AnyFlow (etapas 1 y 2) y el checkpoint FewStepRL, el consumo se aproxima al de SD3.5-Medium en precisión completa o media; el repositorio ocupa 20,4 GB en total, pero incluye varios trials y modelos auxiliares.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del modelo base, se requiere una GPU con memoria suficiente para SD3.5-Medium; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? no disponible (no se documenta en la información proporcionada).
- Opciones de despliegue: el flujo oficial es el repositorio `EDAPINENUT/fewsteprl-sd35` con `diffusers` y los scripts `scripts/eval/sample.sh` y `scripts/eval/eval_ckpt.sh`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- Latencia y throughput: no disponibles. La ventaja declarada es el muestreo en 4 pasos, pero no se publican cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FewStepRL-sd35 | no disponible (LoRA sobre SD3.5-Medium) | 4 pasos de muestreo | RL sobre flow map de pocos pasos | Stability AI Community License | Hugging Face (`Delcher/fewsteprl-sd35`) |
| SD3.5-Medium (base) | no disponible en la información | muestreo estándar multi-paso | difusión flow matching | Stability AI Community License | Hugging Face (`stabilityai/stable-diffusion-3.5-medium`) |
| FewStepRL-wan21 | no disponible | no disponible | RL sobre modelo de vídeo (Wan2.1) | no disponible | Hugging Face (`Delcher/fewsteprl-wan21`) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos de pocos pasos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Los pesos no son autónomos: `generator_ema.pt` debe aplicarse sobre SD3.5-Medium más las LoRA de AnyFlow de etapa 1 y 2. Usarlo de forma aislada produce resultados incorrectos.
- Los predictores auxiliares `aux_vel/{mix,ocr}` solo son necesarios para entrenar los trials `dmd*`; no deben confundirse con el generador final.
- Licencia: los pesos son derivados de SD3.5-Medium y quedan sujetos a la Stability AI Community License, que impone condiciones para uso comercial (no detalladas en la información disponible). Verificar el texto completo antes de desplegar en producción.
- Riesgo de alucinación visual y artefactos: como todo modelo generativo, puede producir imágenes incoherentes, texto mal renderizado o contenido no solicitado, especialmente en los trials con recompensa mixta.
- Sesgos: no se documentan sesgos específicos, pero al heredar el modelo base y sus datos de entrenamiento, es probable que reproduzca sesgos presentes en SD3.5-Medium.
- Idiomas: no se especifica el soporte multilingüe del codificador de texto; la calidad del prompt en idiomas distintos del inglés no está garantizada por la información disponible.
- Sin datos de benchmarks ni de latencia publicados en la información proporcionada, lo que dificulta una evaluación objetiva previa al despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación aún muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Delcher/fewsteprl-sd35
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia del modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
- Paper (arXiv:2611.08240): https://arxiv.org/abs/2611.08240
- Código: https://github.com/EDAPINENUT/fewsteprl-sd35
- Notas de checkpoints: https://github.com/EDAPINENUT/fewsteprl-sd35/blob/main/checkpoints/README.md
- Página del proyecto: https://edapinenut.github.io/fewsteprl.page/
- Checkpoints de vídeo (Wan2.1): https://huggingface.co/Delcher/fewsteprl-wan21
