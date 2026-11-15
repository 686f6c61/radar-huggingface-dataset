# Edapinenut/fewsteprl-sd35

## Resumen

FewStepRL es un conjunto de checkpoints de ajuste fino para el modelo de difusion texto-a-imagen Stable Diffusion 3.5 Medium, desarrollado por Edapinenut (Haitao Lin y colaboradores) en el marco del articulo "FewStepRL: Fine-tuning Few-step Diffusion Models with Reinforcement Learning" (arXiv:2611.08240). El modelo aborda el problema de la generacion de imagenes en pocos pasos (few-step) mediante tecnicas de aprendizaje por refuerzo aplicadas sobre un flow map de 4 pasos, buscando mejorar la calidad y la fidelidad a las instrucciones sin incrementar el numero de pasos de muestreo.

El repositorio contiene multiples trials de entrenamiento (variantes de trainer y funciones de recompensa), cada uno con su configuracion y su generador EMA. Los pesos no son autonomos: se aplican como LoRA sobre SD3.5-Medium combinado con los LoRA de AnyFlow Stage-1 y Stage-2. Esto lo convierte en un recurso de investigacion orientado a reproducir y evaluar los experimentos del paper, mas que en un modelo listo para produccion.

La relevancia actual radica en que explora la interseccion entre modelos de difusion de pocos pasos y el aprendizaje por refuerzo (GRPO, DMD, NFT, AWM, etc.), una linea activa de investigacion para reducir costes de inferencia manteniendo calidad. El tamano del repositorio es de 20,4 GB y la licencia es la Stability AI Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (flow map) sobre SD3.5-Medium; LoRA + delta_embedder sobre el transformer SD3 |
| Parametros totales | no disponible (los pesos liberados son adaptadores LoRA, no el modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin contexto de texto medido) |
| Tipos de cuantizacion | no disponible (pesos en .pt y .safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; no se especifican idiomas) |
| Licencia | Stability AI Community License (stabilityai-ai-community) |
| Formato de pesos | .pt (generator_ema.pt) y .safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Stable Diffusion 3.5 Medium, un transformer de difusion (MMDiT) para texto-a-imagen. FewStepRL ajusta un flow map de 4 pasos mediante aprendizaje por refuerzo. Los checkpoints liberados consisten en un generador EMA que incorpora un LoRA de Stage-3 mas un `delta_embedder`, y se aplican siempre sobre SD3.5-Medium junto con los LoRA de AnyFlow Stage-1 y Stage-2. El repositorio incluye ademas predictores v auxiliares (`aux_vel/{mix,ocr}`) basados en `SD3Transformer2DModel` de diffusers, necesarios unicamente para entrenar los trials `dmd*`.

El entrenamiento cubre multiples variantes de trainer y objetivos: `meanflow_nft`, `dmdnft_rl`, `dmdawm_rl`, `meanflowgrpo_rl`, `meanflowawm_rl`, `meanflowopsd_rl`, `meanflowrefl_rl`, ademas de baselines con objetivos originales (`flowgrpo`, `awm`, `nft`). Cada trial se entrena con dos tipos de recompensa: "mixed" y "OCR", y con distintos numeros de pasos (200, 300 o 400). No se detalla en la informacion disponible el volumen de tokens ni la composicion exacta del dataset de entrenamiento, ni si se empleo RLHF/DPO en sentido clasico; el enfasis esta en el aprendizaje por refuerzo sobre recompensas especificas.

## Capacidades

- Generacion de imagenes texto-a-imagen en 4 pasos de muestreo mediante flow map.
- Ajuste fino orientado a recompensas: variantes con recompensa "mixed" y "OCR".
- Aplicacion como adaptador LoRA sobre SD3.5-Medium + AnyFlow Stage-1/2.
- Soporte de evaluacion y scoring de checkpoints mediante scripts del repositorio (`sample.sh`, `eval_ckpt.sh`).
- Predictores v auxiliares para entrenamiento de trials DMD.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Investigacion en difusion de pocos pasos: reproducir los experimentos del paper comparando trainers (NFT, DMD, GRPO, AWM, OPSD, ReFL) sobre una misma base SD3.5-Medium, usando los checkpoints y configuraciones liberados.
- Evaluacion de aprendizaje por refuerzo en generacion de imagenes: emplear las variantes con recompensa "mixed" y "OCR" para medir como distintas funciones de recompensa afectan a la calidad y fidelidad del muestreo en 4 pasos.
- Generacion de imagenes con coste de inferencia reducido: usar el flow map de 4 pasos para producir imagenes en entornos donde el numero de evaluaciones del modelo es un cuello de botella, aplicando el checkpoint sobre la base y los LoRA indicados.
- Benchmarking de metodos de ajuste few-step: comparar los trials liberados (por ejemplo `meanflownft_mix` frente a `dmdnft_mix`) con las mismas semillas y prompts para aislar el efecto del objetivo de entrenamiento.
- Prototipado de pipelines texto-a-imagen en diffusers: integrar el generador EMA en flujos de `diffusers` para experimentar con adaptadores LoRA anidados sobre SD3.5-Medium.
- Estudio de recompensas OCR: utilizar los trials `*_ocr` para analizar como una recompensa orientada a texto en imagen influye en la generacion, un escenario util para investigacion en tipografia y carteles generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `checkpoints/README.md` del repositorio de GitHub para puntuaciones y notas por checkpoint, pero esos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ejecutarse sobre SD3.5-Medium completo, los requisitos son los de dicho modelo base mas los adaptadores LoRA (el repositorio ocupa 20,4 GB).
- GPU recomendadas: no disponible en la informacion proporcionada; dependeran de los requisitos de SD3.5-Medium.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: `diffusers` (libreria declarada) y scripts de evaluacion del repositorio (`scripts/eval/sample.sh`, `scripts/eval/eval_ckpt.sh`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion texto-a-imagen en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FewStepRL (este) | SD3.5-Medium | RL sobre flow map few-step (multiples trainers) | 4 | Stability AI Community | Hugging Face (adaptadores) |
| SD3.5-Medium | — | Difusion texto-a-imagen base | multipaso | Stability AI Community | Hugging Face |
| FewStepRL Wan2.1 | Wan2.1 | RL few-step para video | no disponible | no disponible | Hugging Face (Delcher/fewsteprl-wan21) |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Los pesos no son autonomos: `generator_ema.pt` debe aplicarse sobre SD3.5-Medium mas los LoRA de AnyFlow Stage-1 y Stage-2; usarlo solo no funciona.
- Es un recurso de investigacion: los trials estan pensados para reproducir experimentos, no como modelo de produccion validado.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos de SD3.5-Medium y de los datos de ajuste.
- Riesgo de alucinacion visual y de fidelidad limitada al prompt: no cuantificado en la informacion disponible.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Restricciones de licencia: los pesos son derivados de SD3.5-Medium y estan sujetos a la Stability AI Community License, con posibles restricciones para uso comercial; conviene revisar el texto completo de la licencia.
- Los predictores v auxiliares solo son necesarios para entrenar los trials `dmd*`; no se requieren para muestreo.
- El repositorio es grande (20,4 GB) y requiere verificar integridad con `SHA256SUMS`.

## Enlaces

- Hugging Face: https://huggingface.co/Edapinenut/fewsteprl-sd35
- Paper (arXiv): https://arxiv.org/abs/2611.08240
- Codigo: https://github.com/EDAPINENUT/fewsteprl-sd35
- Notas de checkpoints: https://github.com/EDAPINENUT/fewsteprl-sd35/blob/main/checkpoints/README.md
- Project page: https://edapinenut.github.io/fewsteprl.page/
- Checkpoints de video (Wan2.1): https://huggingface.co/Delcher/fewsteprl-wan21
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Licencia: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium/blob/main/LICENSE.md
