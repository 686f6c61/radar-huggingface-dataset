# ahmedheakl/rand-mobile-grpo

## Resumen

`ahmedheakl/rand-mobile-grpo` es un checkpoint de investigación del proyecto Mobile-O, un modelo unificado de visión-lenguaje-difusión orientado a dispositivo móvil que combina comprensión multimodal y generación/edición de imágenes. En concreto, este repositorio contiene únicamente la cabeza entrenada —el DiT de SANA y el conector de difusión—, no el modelo completo. Se trata del checkpoint base de GRPO del proyecto: 500 pasos de GRPO (Group Relative Policy Optimization) partiendo de la inicialización SFT `v2mcptf-mixed`, con una recompensa unificada de OCR y GenEval.

El modelo lo publica Ahmed Heakl, investigador vinculado al proyecto Mobile-O, que aparece en fase de envío (under submission) según su página personal. La relevancia de esta ficha es acotada: no es un modelo utilizable de forma autónoma, sino el punto de referencia contra el que el autor midió todos los experimentos posteriores, y forma parte del linaje de la model soup `soup3-targets` (concretamente es uno de los dos task vectors dentro de `ta-dpg-s1.0`, que es a su vez uno de los tres miembros de la soup).

En cuanto a tamaño, el repositorio suma 600.560.673 parámetros en safetensors (602 tensores: 548 en `model.dit.*` y 54 en `model.diffusion_connector.*`), con un peso de 1,2 GB, lo que sitúa la cabeza en torno a los 600 M de parámetros. La resolución de trabajo es 512×512 y el componente VLM queda congelado durante el entrenamiento, motivo por el que no se incluye aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de SANA (diffusion transformer) + conector de difusión tipo `mcptf` + codificador VLM MiniCPM-V-4.6 congelado (no incluido) |
| Parametros totales | 600.560.673 (safetensors, 602 tensores; solo la cabeza entrenada) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; resolución de imagen 512×512) |
| Tipos de cuantizacion | no disponible (repo en safetensors; el DC-AE indicado por el autor es f32, 32 canales, latente 16×16 a 512 px) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La cabeza es un DiT de SANA (600 M de parámetros, variante `Sana_600M_512px_diffusers`) acoplado a un VLM congelado (MiniCPM-V-4.6) mediante un conector de difusión de tipo `mcptf`. El conector fusiona 1 capa del VLM, según el propio autor, quien advierte que el valor autoritativo es `fusion.layer_weights.shape[0]` y que un campo `vlm_num_layers` del proyecto puede leer incorrectamente 4. La decodificación latente usa un DC-AE en f32 con 32 canales y latente de 16×16 a 512 px. El repositorio incluye exclusivamente la cabeza: 548 tensores del DiT y 54 del conector.

El entrenamiento consistió en 500 pasos de GRPO partiendo de la inicialización SFT `Mobile-O-0.5B-SFT-minicpm-v2mcptf-mixed`. La recompensa es una señal unificada de OCR más GenEval. Los hiperparámetros declarados son: tamaño de grupo 12, learning rate 6e-5, KL beta 0.04, clip range 1e-4, advantage clip 5.0 y, en la fase de rollout, 10 pasos de denoising con cfg 1.0, shift 3.0 y nivel de ruido 0.7. La configuración de inferencia usada para todas las métricas es DPM-Solver++ con `solver_order=2`, `flow_shift=3`, 20 pasos y 512×512; la condición nula es el prompt vacío pasado por la misma ruta VLM+conector (no un vector de ceros) y, en edición, es la instrucción en lugar del prompt vacío.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512, con calidad de alineación prompt-imagen medida por GenEval (0,9284 en la mejor configuración).
- Edición de imágenes guiada por instrucciones, con la instrucción como condición nula en el proceso de difusión.
- Alineación de prompt medida por ImageReward (0,9250 en MJHQ-30K en la mejor configuración).
- Comprensión multimodal y OCR heredados del VLM congelado MiniCPM-V-4.6, que forma parte de la recompensa de entrenamiento (OCR + GenEval), aunque ese componente no se distribuye en este repositorio.
- No hay información sobre tool calling, function calling, uso como agente, razonamiento multi-paso ni capacidades multilingües en la información disponible.
- No se declara thinking mode, audio ni otras modalidades.

## Casos de uso

- Reproducción de experimentos de RL para difusión: el checkpoint es la referencia explícita del proyecto y permite replicar los números de la tabla de benchmarks con los ajustes de inferencia documentados (DPM-Solver++, 20 pasos, cfg 3.0).
- Investigación sobre GRPO aplicado a generación de imágenes: sirve como punto de partida para estudiar el efecto de la recompensa unificada OCR + GenEval y de hiperparámetros como KL beta o advantage clip.
- Construcción de model soups y task vectors: forma parte del linaje de la soup `soup3-targets` como uno de los dos task vectors de `ta-dpg-s1.0`, por lo que es material directo para experimentos de interpolación de pesos.
- Evaluación de compromiso alineación-fidelidad: sus resultados muestran el trade explícito entre FID (mejor con cfg 1.5, 13,508) e ImageReward (peor con cfg 1.5, 0,7633), lo que lo hace adecuado para estudiar este equilibrio por configuración de guidance.
- Generación de imágenes a 512×512 en flujos móviles o de borde, siempre que se despliegue junto al VLM y al DC-AE necesarios; el tamaño reducido de la cabeza (en torno a 1,2 GB en safetensors) facilita su integración en memorias limitadas.
- Edición de imágenes por instrucción en entornos con requisitos estrictos de peso de modelo, montando el pipeline completo (MiniCPM-V-4.6 + Sana_600M + conector) y ajustando la condición de edición documentada.

## Benchmarks y rendimiento

Datos publicados por el autor. La mejor configuración es cfg 3.0 con 20 pasos de DPM-Solver++ (2 de 6 objetivos cumplidos):

| Benchmark | cfg 3.0 (mejor) | cfg 1.5 (protocolo) | Objetivo | Estado a cfg 3.0 |
|---|---|---|---|---|
| GenEval | 0.9284 | 0.9116 | ≥ 0,90 | cumplido |
| ImageReward (MJHQ-30K) | 0.9250 | 0.7633 | ≥ 0,90 | cumplido |
| DPG-Bench | 81.727 | 80.679 | ≥ 85 | no cumplido |
| FID (MJHQ-30K) | 15.398 | 13.508 | ≤ 8 | no cumplido |
| ImgEdit (juez local Qwen2.5-VL-72B) | 3.020 | 3.093 | ≥ 3,5 | no cumplido |
| GEdit (EN, juez local Qwen2.5-VL-72B) | 6.620 | 6.520 | ≥ 6,7 | no cumplido |

Otras configuraciones medidas en este checkpoint: cfg 4.5 da GenEval 0.9237, DPG 82.331 e ImageReward 0.9727 (su mejor valor) pero FID 17.165 y GEdit 6.420. La interval guidance (aplicar CFG solo para t ∈ [0, 0,9]) a cfg 4.5 da DPG 82.979, el mejor DPG del checkpoint, con FID 15.959. Ninguna configuración de este checkpoint supera más de dos objetivos.

## Requisitos de hardware

- La cabeza sola ocupa 1,2 GB en safetensors para 600 M de parámetros; los pesos en precisión reducida implican en torno a 1,2 GB de VRAM únicamente para el DiT y el conector.
- El pipeline completo requiere además `openbmb/MiniCPM-V-4_6` (codificador VLM congelado) y `Efficient-Large-Model/Sana_600M_512px_diffusers` (para el DC-AE en f32 y la configuración del scheduler), cuyos requisitos de VRAM no se detallan en la información disponible.
- Al sumar el VLM, el requisito de VRAM crece de forma significativa; no se dispone de cifras oficiales del proyecto, por lo que cualquier estimación del conjunto debe validarse empíricamente.
- Por tamaño de la cabeza, un despliegue aislado cabría en GPU de consumo (por ejemplo, RTX 3060 o superiores); el pipeline completo requiere verificar la huella del VLM antes de afirmar que cabe en una GPU de consumo concreta.
- Opciones de despliegue: `transformers` con código personalizado del proyecto (DiT de SANA + conector + VLM); no se documentan soportes de vLLM, llama.cpp, Ollama, TGI ni formatos GGUF para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ahmedheakl/rand-mobile-grpo` (este) | 600.560.673 (solo cabeza) | Difusión texto-a-imagen y edición | 512×512 | Apache 2.0 | Repo con solo la cabeza; requiere VLM y DC-AE externos |
| `ahmedheakl/rand-mobile` (`soup3-targets`) | no disponible | Difusión texto-a-imagen y edición | 512×512 | no disponible | Mejor checkpoint del proyecto según el autor; cumple 3 de 6 objetivos |
| `Efficient-Large-Model/Sana_600M_512px_diffusers` | no disponible (600 M segun nombre) | Difusión texto-a-imagen | 512×512 | no disponible | Backbone base usado para el DC-AE y el scheduler |
| `openbmb/MiniCPM-V-4_6` | no disponible | VLM (comprensión multimodal) | no aplica | no disponible | Componente congelado necesario para ejecutar el pipeline |

## Limitaciones y advertencias

- Este repositorio no es un modelo ejecutable por sí solo: contiene solo la cabeza entrenada (DiT + conector). Para inferencia hacen falta `openbmb/MiniCPM-V-4_6` y `Efficient-Large-Model/Sana_600M_512px_diffusers`.
- Es el baseline del proyecto, no su mejor resultado: 4 de los 6 objetivos (DPG, FID, ImgEdit, GEdit) no se cumplen.
- Las métricas GEdit e ImgEdit están puntuadas por un juez local Qwen2.5-VL-72B, no por la escala del leaderboard con GPT-4o, por lo que no son comparables con valores publicados bajo ese protocolo.
- Existe un compromiso marcado entre FID y alineación según el valor de CFG (cfg 1.5 favorece FID, cfg 4.5 favorece ImageReward), lo que obliga a elegir la configuración en función del objetivo y no existe un ajuste que optimice ambos.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idioma: no se declara ningún conjunto de idiomas soportados.
- Licencia: la cabeza se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero debe verificarse por separado la licencia de los componentes obligatorios (`MiniCPM-V-4_6` y `Sana_600M_512px_diffusers`), ya que este repositorio no los cubre.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación externa.
- La nota del autor sobre `vlm_num_layers` (que puede leer 4 cuando el valor correcto es 1) advierte de posibles inconsistencias en los ficheros de configuración del proyecto.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/ahmedheakl/rand-mobile-grpo
- Checkpoint recomendado por el autor: https://huggingface.co/ahmedheakl/rand-mobile
- Codificador VLM congelado requerido: https://huggingface.co/openbmb/MiniCPM-V-4_6
- Backbone SANA requerido (DC-AE y scheduler): https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers
- Pagina personal del autor (proyecto Mobile-O): https://ahmedheakl.github.io/
- Perfil del autor en GitHub: https://github.com/ahmedheakl
- Perfil del autor en HuggingFace: https://huggingface.co/ahmedheakl
