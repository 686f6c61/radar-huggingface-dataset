# abbuibuibui/TerakomariGandesblood-Lora

## Resumen

TerakomariGandesblood-Lora es un LoRA de personaje para modelos de difusion SDXL, desarrollado por el usuario abbuibuibui y publicado en HuggingFace. Reproduce a Terakomari Gandesblood, protagonista de la serie *The Vexations of a Shut-In Vampire Princess* (Hikikomari Kyuuketsuki no Monmon), y esta entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17, perteneciente a la familia Illustrious/NoobAI de SDXL afinada para ilustracion anime.

El repositorio incluye siete pesos correspondientes a las epocas formales E1-E7 del entrenamiento, con recomendacion explicita de E6 como opcion por defecto a fuerza 0.8. El modelo resuelve el problema de consistencia de identidad de un personaje concreto en generacion texto-a-imagen: pelo rubio, ojos rojos, cuernos y colmillo, ademas de varios conjuntos de ropa etiquetados con tokens propios.

Es relevante para quienes construyen pipelines de ilustracion anime con SDXL y necesitan un activo de personaje con evaluacion comparativa publicada entre epocas y fuerzas de LoRA. El repo ocupa 1.6 GB y las descargas registradas son 77, con cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet y text encoders de SDXL (familia Illustrious) |
| Parametros totales | no disponible (rank 32 / alpha 16 en UNet y text encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors bf16) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (7 archivos, uno por epoca E1-E7) |

## Arquitectura y entrenamiento

Se trata de un LoRA de rango 32 y alpha 16 aplicado tanto al UNet como a los text encoders del modelo base waiIllustriousSDXL v17, un SDXL afinado para ilustracion anime. El entrenamiento uso AdamW8bit en bf16, batch 1, latents cacheadas, atencion sdpa y buckets de 1024; el flip y la augmentacion de color quedaron desactivados.

El dataset consta de 101 imagenes curadas con sus correspondientes archivos `.txt`, con `keep_tokens = 2` y captions que comienzan por `terakomari_gandesblood, <outfit>`. La distribucion por conjunto es: Crimson 61, Gala 10, PinkBlouse 4, Bikini 7, Sailor 7 y Sleep 12. Con repeticion 2 y 7 epocas se alcanzaron aproximadamente 1414 pasos de optimizador, en un entrenamiento reanudado del que se conservaron las epocas formales E1-E7 completas.

La innovacion practica del repo no esta en la arquitectura sino en el protocolo de seleccion: cribado de las siete epocas a fuerza 0.8 y matriz de pesos de 10 escenas por 4 fuerzas (0.4, 0.6, 0.8 y 1.0) para E5, E6 y E7, con 120 salidas directas evaluadas.

## Capacidades

- Generacion de imagenes de un personaje anime concreto con identidad consistente (pelo rubio largo, ojos rojos, cuernos y colmillo) mediante el token `terakomari_gandesblood`.
- Control de vestuario mediante tokens dedicados: `terakomari_gandesblood_crimson_lord_uniform`, `terakomari_gandesblood_sailor_uniform`, `terakomari_gandesblood_gala_dress`, `terakomari_gandesblood_pink_blouse`, `terakomari_gandesblood_red_bikini` y `terakomari_gandesblood_sleepwear`.
- Retratos frontales, tres cuartos y perfil, asi como cuerpo completo con los conjuntos principales.
- Escenas nocturnas y fondos complejos, segun la evaluacion publicada del autor.
- Composicion con prompts de estilo anime (etiquetas tipo `masterpiece, best quality, very aesthetic, absurdres, anime screencap`).
- Funcionamiento razonable sin token de vestuario e incluso sin trigger, segun las pruebas incluidas en la evaluacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un adaptador de difusion texto-a-imagen.

## Casos de uso

- Ilustracion de fan art con identidad estable: usar E6 a fuerza 0.8 con el prompt de ejemplo del autor permite obtener retratos consistentes del personaje sin reentrenar ni recurrir a referencias externas.
- Generacion de variantes de vestuario en serie: los seis tokens de outfit permiten producir un mismo personaje en uniforme Crimson, sailor, gala, blusa rosa, bikini o pijama manteniendo el rostro, util para hojas de personaje o galerias tematicas.
- Prototipado rapido de escenas para narrativa visual: con `832×1216`, Euler a, 28 pasos y CFG 4.5 se obtienen stills de estilo anime screencap aptos para maquetas de comic o storyboards.
- Pruebas de canon y diseno: la matriz de evaluacion publicada (epocas x fuerzas) sirve como referencia para decidir si conviene 0.6 (identifica sin sobrecargar) o 1.0 (mas nitidez, con riesgo de sobrecoccion).
- Integracion en pipelines de generacion por lotes: al ser un LoRA safetensors sobre SDXL, se puede cargar en ComfyUI o en scripts con diffusers para producir lotes con semillas y prompts controlados.
- Comparacion de metodos de entrenamiento de LoRA de personaje: el repo conserva las siete epocas y las hojas de evaluacion, lo que lo hace util como caso de estudio de seleccion de checkpoint en lugar de usar solo la ultima epoca.
- Generacion nocturna y de fondos complejos: la evaluacion incluye una escena nocturna especifica, adecuada para ilustraciones ambientadas de noche con el personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una evaluacion cualitativa comparativa entre epocas y fuerzas, resumida a continuacion.

| Candidato | Resultado observado | Decision |
|---|---|---|
| E5 | Identidad usable; fidelidad de accesorios y uniforme algo mas blanda que E6 | Alternativa |
| E6 | Mayor consistencia de rostro, vestuario y escenas nocturnas entre 0.6 y 0.8 | Opcion por defecto a 0.8 |
| E7 | Cercana a E6; sin mejora estable a 1.0 | Alternativa archivada |

Protocolo: cribado de E1-E7 a 0.8 (retrato frontal, uniforme Crimson a cuerpo completo y conjunto alternativo a cuerpo completo) y matriz de 10 escenas x 4 fuerzas para E5/E6/E7 (120 salidas directas). Ajustes de referencia: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, `832×1216`, sin Hires ni ADetailer.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, el peso del adaptador es minimo y el requisito dominante es el del checkpoint base SDXL en bf16 o fp16.
- GPU recomendadas: no disponible en la informacion proporcionada; el modelo base es SDXL, por lo que se aplican los requisitos habituales de ese checkpoint, no detallados por el autor.
- Ajustes de inferencia documentados: Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion `832×1216`, Hires y ADetailer desactivados en las muestras oficiales.
- Opciones de despliegue: la libreria declarada es diffusers; el formato safetensors es compatible con ecosistemas de SDXL como ComfyUI, aunque el autor no documenta flujos concretos de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada (parametros, contexto, rendimiento o disponibilidad). La comparacion se limita al modelo base y a las epocas internas del propio repo.

| Modelo | Base | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TerakomariGandesblood-Lora (E6) | waiIllustriousSDXL v17 | no disponible (rank 32) | no aplica | Evaluacion cualitativa del autor | creativeml-openrail-m | HuggingFace, 77 descargas |
| waiIllustriousSDXL v17 | SDXL | no disponible | no aplica | no disponible | no disponible | checkpoint comunitario |
| Familia Illustrious / NoobAI | SDXL | no disponible | no aplica | no disponible | no disponible | indicada como compatible por el autor |

## Limitaciones y advertencias

- Es un derivado fan-made no oficial; los derechos del personaje y de la obra original pertenecen a sus titulares.
- La licencia creativeml-openrail-m impone restricciones de uso comercial que deben revisarse antes de explotar el modelo en produccion.
- Dataset pequeno y desequilibrado: 101 imagenes, con 61 de uniforme Crimson frente a solo 4 de blusa rosa; los conjuntos minoritarios pueden mostrar menor fidelidad.
- A fuerza 1.0 el autor advierte riesgo de sobrecoccion; el rango recomendado es 0.6-0.8.
- Dependencia estricta del modelo base: esta pensado para waiIllustriousSDXL v17 o familia Illustrious/NoobAI; otros checkpoints SDXL pueden degradar la identidad.
- El prompt negativo de referencia excluye explicitamente colores de pelo y ojos alternativos, lo que revela sensibilidad a la deriva de identidad si no se refuerza.
- Riesgo de alucinacion visual y artefactos anatomicos propio de los modelos de difusion (manos, dedos, texto), mitigado parcialmente por el prompt negativo sugerido.
- Idiomas declarados en y zh; no hay evidencia de soporte para prompts en castellano.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes: es exclusivamente un adaptador de generacion de imagen.
- No se han publicado benchmarks cuantitativos ni metricas objetivas de similitud de identidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/TerakomariGandesblood-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/TerakomariGandesblood-Dataset
- README en chino: ./README_zh.md (referenciado en la model card)
- Notas de evaluacion en chino: ./evaluation/横向测评记录.md (referenciado en la model card)
- SHA-256 de E6: `E5BED7867ABA666224A9E6ED3B3F93A0EDC41F18FF15917E9372EB97FFFCD337`
