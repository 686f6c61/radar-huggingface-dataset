# Cuttle-fish-my/Rethinking-CFG-OPD-ckpts

## Resumen

Rethinking-CFG-OPD-ckpts es un repositorio de adaptadores LoRA publicados como material reproducible del articulo "Rethinking Classifier-Free Guidance in On-Policy Diffusion Distillation" (arXiv:2607.24731), desarrollado por el usuario Cuttle-fish-my. No es un modelo generativo autonomo, sino una coleccion de checkpoints experimentales que estudian como afecta la formulacion de la funcion de perdida en destilacion on-policy (OPD) al comportamiento del *classifier-free guidance* (CFG) en modelos de difusion. Cada adaptador se entrena sobre un backbone congelado, de modo que los pesos publicados ocupan decenas de megabytes en lugar de miles.

El repositorio cubre tres escenarios: control video denso a disperso sobre Wan2.1-VACE-1.3B (image-to-video), destilacion OCR de profesor unico sobre Stable Diffusion 3.5 Medium, y destilacion de estilo con condicionamiento privilegiado sobre FLUX.2-klein-4B-base. La contribucion tecnica central es el objetivo PDM (Pre-composition Distribution Matching), que supervisa las ramas positiva y negativa del CFG por separado antes de componerlas, frente al objetivo "naive" que solo iguala la velocidad compuesta y frente al objetivo IBM, usado como contraste.

Su relevancia es metodologica: demuestra que igualar solo la transicion compuesta por CFG deja los errores de rama subidentificados, lo que produce sensibilidad a la escala de guidance en inferencia que no se manifiesta durante el entrenamiento. El repositorio esta pensado para investigadores que quieran reproducir los diagnosticos de error de rama, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre backbones de difusion congelados: Wan2.1-VACE-1.3B, Stable Diffusion 3.5 Medium y FLUX.2-klein-4B-base |
| Parametros totales | No disponible (depende del backbone; los adaptadores LoRA ocupan decenas de MB cada uno) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (cada modelo base mantiene sus propios terminos) |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT, con `adapter_config.json` en el caso dual) |

## Arquitectura y entrenamiento

El repositorio no entrena un transformer desde cero: publica adaptadores LoRA sobre tres backbones de difusion congelados. El escenario `dense-to-sparse-video` parte de Wan-AI/Wan2.1-VACE-1.3B y estudia la destilacion de un generador que recibe control de pose, profundidad y trazo en cada fotograma hacia uno que solo recibe 4 fotogramas clave, con variantes como `pdm_unicontrol` (control unificado de pose, profundidad y trazo conjuntamente). El escenario `text-rendering` aplica destilacion OCR de profesor unico sobre stabilityai/stable-diffusion-3.5-medium en el regimen de condicionamiento negativo compartido. El escenario `reference-conditioned` realiza destilacion de estilo sobre black-forest-labs/FLUX.2-klein-4B-base en el regimen de condicionamiento negativo privilegiado, donde el profesor ve una imagen de referencia que el estudiante no ve.

La innovacion tecnica es la formulacion del objetivo de destilacion. El objetivo naive minimiza `‖γe₊ + (1−γ)e₋‖²`, que solo restringe los errores de rama `e₊ = v_S⁺ − v_T⁺` y `e₋ = v_S⁻ − v_T⁻` a traves de su combinacion, permitiendo que se compensen mutuamente. El objetivo PDM propuesto minimiza `‖e₊‖² + λ‖d_T − d_S‖²` con `d = v⁺ − v⁻`, supervisando antes de la composicion. El objetivo IBM, `γ²‖e₊‖² + (γ−1)²‖e₋‖²`, se incluye como contraste consciente de ramas. En el regimen privilegiado, la compensacion se vuelve antagonica (`‖e₊‖` baja mientras `‖e₋‖` crece), un fenomeno que los autores denominan NBA y que permanece oculto en la escala de guidance de entrenamiento. El checkpoint `reference-conditioned/pdm_lambda2/` es un adaptador dual PEFT con subcarpetas `student/` y `teacher/` (el profesor es la EMA del estudiante). Cada carpeta incluye su propio README con configuracion de entrenamiento, paso de seleccion del checkpoint y numeros reproducidos, ademas de un `MANIFEST.sha256`.

## Capacidades

- Destilacion de control video denso a disperso: transferencia de control por pose, profundidad y trazo desde un generador con control por fotograma a uno con solo 4 fotogramas clave, sobre Wan2.1-VACE-1.3B.
- Destilacion OCR de profesor unico sobre SD3.5-Medium en regimen de condicionamiento negativo compartido.
- Destilacion de estilo con condicionamiento privilegiado (imagen de referencia visible solo para el profesor) sobre FLUX.2-klein-4B-base.
- Reproduccion del diagnostico de error de rama (`e₊`, `e₋`) mediante el checkpoint dual student/teacher.
- Comparacion controlada de objetivos de destilacion (naive, PDM, IBM) bajo una misma configuracion experimental.
- Variantes de hiperparametro: por ejemplo `pdm_lambda2` con λ=2, y `pdm_unicontrol` con control unificado.
- No incluye tool calling, agentes, razonamiento multi-step ni capacidades multilingues: es material de investigacion en difusion, no un LLM.

## Casos de uso

- Reproduccion de resultados del articulo: cargar cada adaptador con `PeftModel.from_pretrained` sobre su backbone congelado y verificar los numeros reportados en el README de cada carpeta, usando el `MANIFEST.sha256` para validar integridad.
- Investigacion sobre CFG en destilacion: comparar los objetivos naive, PDM e IBM en el mismo escenario para medir la sensibilidad a la escala de guidance en inferencia, que es el fenomeno central del paper.
- Diagnostico de error de rama: usar el checkpoint dual `reference-conditioned/pdm_lambda2/` (student y teacher) para calcular `‖e₊‖` y `‖e₋‖` y reproducir la aparicion del fenomeno NBA en el regimen privilegiado.
- Destilacion de control video eficiente: emplear `dense-to-sparse-video/pdm_unicontrol` como punto de partida para reducir el coste de anotacion por fotograma en pipelines de generacion video condicionada por pose, profundidad o trazo.
- Transferencia de estilo con profesor privilegiado: adaptar `reference-conditioned` a flujos donde se dispone de imagenes de referencia solo en entrenamiento y se quiere que el estudiante opere sin ellas en inferencia.
- Estudio de destilacion OCR sobre SD3.5-Medium: usar `text-rendering` como base para experimentos de renderizado de texto donde el condicionamiento negativo es compartido entre profesor y estudiante.
- Base para nuevas variantes de objetivo: el codigo del proyecto permite extender PDM con otros valores de λ o combinaciones de control, reutilizando los adaptadores como inicializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualitativamente los hallazgos (compensacion de errores de rama en el objetivo naive, comportamiento antagonico en el regimen privilegiado, aparicion de NBA) y remite a los README por carpeta y al paper para las cifras concretas, pero no incluye tablas numericas en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, los backbones subyacentes son Wan2.1-VACE-1.3B (1.300 millones de parametros), SD3.5-Medium y FLUX.2-klein-4B-base; el adaptador LoRA anade una huella minima sobre el backbone congelado.
- GPU recomendadas: no disponible en la informacion proporcionada. Para los backbones citados se requiere tipicamente una GPU con suficiente memoria para el modelo completo en precision de inferencia; el repositorio no especifica configuracion probada.
- Cabe en GPU de consumo: no disponible; depende del backbone elegido y de la precision de carga.
- Opciones de despliegue: carga mediante la libreria `peft` (`PeftModel.from_pretrained`) sobre el backbone correspondiente; el pipeline declarado es `image-to-video`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rethinking-CFG-OPD-ckpts | Adaptadores LoRA de investigacion sobre difusion | Depende del backbone (1.3B, ~2.5B, 4B) | No disponible | Apache-2.0 | Hugging Face, 0 descargas |
| Wan-AI/Wan2.1-VACE-1.3B | Modelo base de video condicionado | 1.300 millones | No disponible | No disponible en la informacion | Hugging Face |
| stabilityai/stable-diffusion-3.5-medium | Modelo base texto-a-imagen | No disponible en la informacion | No disponible | No disponible en la informacion | Hugging Face |
| black-forest-labs/FLUX.2-klein-4B-base | Modelo base de difusion | 4.000 millones (segun nombre) | No disponible | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- No es un modelo listo para produccion: son checkpoints experimentales de un estudio, con 0 descargas y 0 likes en el momento de la consulta.
- Requiere cargar el backbone congelado correspondiente; sin el, los adaptadores no son funcionales.
- El checkpoint `reference-conditioned/pdm_lambda2/` es un directorio dual (student y teacher) y no un `.safetensors` suelto; debe cargarse con la estructura de carpetas y `adapter_config.json` intactos.
- La licencia Apache-2.0 del repositorio no sustituye los terminos de cada modelo base (Wan2.1-VACE, SD3.5-Medium, FLUX.2-klein-4B-base), que deben verificarse por separado antes de cualquier uso comercial.
- Los autores documentan sensibilidad a la escala de guidance en inferencia derivada de la compensacion de errores de rama; los checkpoints con objetivo naive pueden comportarse de forma distinta a la esperada al variar la escala.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; al tratarse de modelos de difusion, el riesgo relevante es de fidelidad visual y de control, no de alucinacion textual.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible validar el rendimiento sin ejecutar la reproduccion.
- El articulo esta fechado en 2026 y el repositorio se creo el 2026-07-31; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cuttle-fish-my/Rethinking-CFG-OPD-ckpts
- Arbol de archivos: https://huggingface.co/Cuttle-fish-my/Rethinking-CFG-OPD-ckpts/tree/main
- Paper: https://huggingface.co/papers/2607.24731
- Pagina del proyecto: https://rethinking-cfg-opd.github.io
- Codigo: https://github.com/rethinking-cfg-opd/Rethinking-CFG-OPD
- Modelo base video: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Modelo base imagen (OCR): https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Modelo base imagen (estilo): https://huggingface.co/black-forest-labs/FLUX.2-klein-4B-base
