# mcp-tool-shop/portlight-ships-2512-lora

## Resumen

Portlight Ships 2512 LoRA es un adaptador LoRA de bajo rango entrenado sobre el modelo de difusion texto-a-imagen Qwen/Qwen-Image-2512. Lo desarrolla el usuario mcp-tool-shop y su proposito es especializar el modelo base en la generacion de cascos de veleros historicos (14 clases de casco) en composicion limpia de perfil transversal (broadside), orientada a la produccion de assets para videojuegos. El disparador de activacion es el token `plsvessel`.

El adaptador pesa aproximadamente 295 MB (`295.145.448` bytes) y se distribuye como un unico fichero `portlight_ships_2512_v2.safetensors` con rango 16 y alpha 16, entrenado durante 3.000 pasos. Se apoya en el modelo base Qwen-Image-2512 (licencia Apache-2.0), mientras que el adaptador se publica bajo licencia MIT.

Es relevante para quienes necesitan generar de forma reproducible siluetas de naves historicas con control direccional puerto/estribor y sin artefactos de texto o recortes, un caso muy concreto de especializacion de un modelo de difusion moderno mediante LoRA y datos sinteticos 3D. La model card documenta una evaluacion cuantitativa con DINOv2, SigLIP2 y auditoria con Qwen3-VL-8B que respalda la eleccion del checkpoint v2 frente a otras variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion texto-a-imagen Qwen-Image-2512 |
| Parametros totales | no disponible (adaptador de 295.145.448 bytes; rango 16, alpha 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el prompt de instancia es en ingles: `plsvessel`) |
| Licencia | MIT (adaptador); modelo base Apache-2.0 |
| Formato de pesos | safetensors (`portlight_ships_2512_v2.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 y alpha 16 aplicado sobre Qwen/Qwen-Image-2512 (revision `25468b98e3276ca6700de15c6628e51b7de54a26`), un modelo de difusion texto-a-imagen. El adaptador no modifica la arquitectura del modelo base; inyecta matrices de bajo rango en las capas del transformer de difusion para especializar la generacion hacia el dominio de cascos de veleros historicos.

El entrenamiento se realizo sobre el dataset `mcp-tool-shop/portlight-ships-anatomy`, concretamente la derivacion `ships-rgb-v2`, compuesta por 672 imagenes RGB de 768x768 derivadas de 336 renders 3D sinteticos (turntable). La composicion combina prompts cortos de clase y rumbo con captions completos de plan de aparejo, y alterna fondos neutros `#808080` con fondos iluminados de mar y cielo; el mate neutro evita el sangrado de transparencia y la desaparicion de velas blancas sobre fondo blanco. El checkpoint publicado corresponde al paso 3.000 de la variante `v2`, seleccionada tras comparar cuatro ejecuciones de entrenamiento (`v1`, `v2`, `v3` y `v5-lr1e4-s101/s202`).

## Capacidades

- Generacion de imagenes texto-a-imagen especializada en 14 clases de casco de veleros historicos.
- Composicion en perfil transversal (broadside) limpia, apta como asset de juego.
- Control direccional puerto/estribor mediante prompting (compliance del 54,9% en la evaluacion, con 99,6% de broadsides limpios).
- Activacion mediante el token disparador `plsvessel`.
- Soporte de prompts cortos de clase (`plsvessel, a <hull>, ...`) y de captions completos de plan de aparejo.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento; es un modelo puramente generativo de imagen.

## Casos de uso

- Generacion de assets de cascos para videojuegos navales: el LoRA produce siluetas de perfil transversal limpias de 14 clases de casco, listas para integrarse en pipelines de arte 2D o como referencia para modelado 3D.
- Iteracion rapida de concept art maritimo: con prompts cortos de clase y rumbo se obtienen variantes controladas de un mismo tipo de nave, lo que acelera la exploracion de diseno.
- Poblar catalogos de naves historicas: la capacidad de generar las 14 clases con control puerto/estribor permite crear fichas visuales consistentes para wikis, manuales o juegos de mesa.
- Prototipado de UI de juegos de estrategia naval: la composicion broadside y el fondo neutro facilitan recortar y recolocar las naves en pantallas de seleccion o arboles tecnologicos.
- Generacion de material de referencia para artistas: el adaptador mantiene la anatomia del casco (similitud DINOv2 de 0,81913) y sirve como base de estudio o guia de proporciones.
- Produccion de ilustraciones para contenido editorial maritimo: combinando captions completos de aparejo se obtienen representaciones de veleros historicos con detalle de jarcia y velamen.
- Pruebas de pipelines de difusion con LoRA: el modelo incluye evaluacion reproducible (DINOv2, SigLIP2, auditoria Qwen3-VL-8B) y sirve como caso de estudio para medir fidelidad y compliance en adaptadores de difusion.

## Benchmarks y rendimiento

Datos medidos por el autor sobre 224 renders retenidos por brazo (14 cascos x 2 costados x semillas 42..49):

| Modelo / brazo | Renders | DINOv2 centroid cos | DINOv2 max train cos (media / p95) | SigLIP2 no-trigger cos | Qwen3-VL-8B pass | Defectos (texto / recorte / off-prompt / estilo) |
|---|---:|---:|---:|---:|---:|---:|
| `base` (Qwen-Image-2512) | 224 | 0,58173 | 0,73003 / 0,89913 | 0,15001 | 0,9866 | 0,0 / 0,0 / 0,0045 / 0,0089 |
| `v2` (publicado) | 224 | 0,81913 | 0,89536 / 0,94963 | 0,19212 | 0,9955 | 0,0 / 0,0 / 0,0 / 0,0045 |
| `v3` (ablacion junk x2) | 224 | 0,80746 | 0,89011 / 0,94573 | 0,19654 | 0,9955 | 0,0 / 0,0 / 0,0 / 0,0045 |

Auditoria visual de compliance de costado y broadside (672 tiles puntuados a ojo, semillas 42..49):

| Modelo | Perfiles broadside | No broadside (`N`) | Estribor compliant (`R`) | Puerto compliant (`L`) | Compliance global | Lift direccional vs. azar |
|---|---:|---:|---:|---:|---:|---:|
| `base` | 89,7% (201/224) | 23 | 53,6% (60/112) | 37,5% (42/112) | 45,5% (102/224) | -0,9 pp |
| `v2` (publicado) | 99,6% (223/224) | 1 | 52,7% (59/112) | 57,1% (64/112) | 54,9% (123/224) | +9,8 pp |
| `v3` | 100,0% (224/224) | 0 | 94,6% (106/112) | 9,8% (11/112) | 52,2% (117/224) | +4,5 pp |

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica. El adaptador pesa unos 295 MB; el requisito dominante es el del modelo base Qwen-Image-2512, cuyos requisitos de VRAM no se detallan en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: no disponible; depende del modelo base Qwen-Image-2512, no documentado aqui.
- Opciones de despliegue: libreria `diffusers` (pipeline `text-to-image`) cargando el adaptador LoRA sobre el modelo base. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este caso.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Portlight Ships 2512 LoRA (v2) | LoRA sobre Qwen-Image-2512 | adaptador 295 MB (rango 16) | no disponible | MIT (base Apache-2.0) | Hugging Face |
| Qwen-Image-2512 (base) | Difusion texto-a-imagen | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Portlight Ships 2512 LoRA v1 | LoRA sobre Qwen-Image-2512 | adaptador (rango no disponible) | no disponible | MIT | no publicado como release |
| Portlight Ships 2512 LoRA v3 | LoRA sobre Qwen-Image-2512 | adaptador (rango no disponible) | no disponible | MIT | no publicado como release |

No se dispone de datos de modelos LoRA de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo genera cascos de veleros historicos de las 14 clases del dataset; fuera de ese dominio el adaptador no aporta ninguna ventaja sobre el modelo base.
- Compliance direccional puerto/estribor moderada: 54,9% global (57,1% puerto, 52,7% estribor); no es un control fiable al 100% y requiere seleccion o reintentos.
- El checkpoint `v1` colapso a siluetas de proa/popa en 6/14 clases y elimino velas en 13/14 prompts cortos; no debe usarse.
- La variante `v3` colapso el 92,4% de los renders a proa-derecha y no restauro battenes de lugsail en `junk`; no es la release recomendada.
- La variante `v5-lr1e4` no habia completado la evaluacion retenida ni las hojas de comparacion visual en el momento de la publicacion.
- Todas las imagenes de entrenamiento son renders 3D sinteticos; las salidas son contenido generado por IA y pueden heredar sesgos o artefactos del dataset sintetico.
- Riesgo de alucinacion visual: el modelo puede inventar detalles de jarcia, velamen o proporciones no presentes en las clases reales.
- El prompt de instancia y los ejemplos estan en ingles; no se documenta soporte multilingue.
- La licencia MIT del adaptador no exime de cumplir la licencia Apache-2.0 del modelo base Qwen-Image-2512 en uso comercial.
- No se documentan limitaciones de contexto ni de idioma mas alla de lo indicado; el modelo es de generacion de imagen, no de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcp-tool-shop/portlight-ships-2512-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2512
- Dataset de entrenamiento: https://huggingface.co/datasets/mcp-tool-shop/portlight-ships-anatomy
- Dataset de evaluacion: https://huggingface.co/datasets/mcp-tool-shop/qwen-image-2512-lora-evals
- Resumen de evaluacion v3 vs base: `eval/ships_v3_baseline_summary.json` (en el repositorio del modelo)
- Puntuaciones de compliance de costado: `eval/side_compliance_scores.json` (en el repositorio del modelo)
- Puntuaciones por render: `ships_v3_baseline_scores.jsonl` (en el dataset de evaluacion)
- Hoja de contacto del paso 3000: `samples/step3000-contact-sheet.png`
- Progresion de entrenamiento cada 500 pasos: `samples/all48-progression.png`
- Comparativa de 14 cascos con prompt corto: `samples/14hull-class-comparison.png`
- Comparativa de 14 cascos con prompt canonico: `samples/14hull-canon-comparison.png`
