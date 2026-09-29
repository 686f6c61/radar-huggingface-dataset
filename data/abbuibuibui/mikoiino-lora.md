# abbuibuibui/MikoIino-Lora

## Resumen

MikoIino-Lora es un LoRA de personaje para Stable Diffusion XL, concretamente para el modelo base waiIllustriousSDXL v17 (una variante de la familia Illustrious/SDXL orientada a ilustracion anime). Lo publica el usuario abbuibuibui y su objetivo es reproducir de forma consistente a Miko Iino, personaje del manga y anime Kaguya-sama: Love is War. El repositorio se distribuye bajo licencia CreativeML OpenRAIL-M y esta etiquetado para los idiomas ingles y chino.

Se trata de un adaptador de bajo rango (dim32/alpha16) entrenado sobre el UNet y ambos text encoders del modelo base, no de un modelo de difusion completo. El autor publica los distintos checkpoints de dos rondas de entrenamiento (R1 y R2) y recomienda explicitamente el checkpoint R2E5 (`miko_iino_rE4S639-000005.safetensors`) aplicado a strength 0.8 como el mejor equilibrio entre limpieza facial y fidelidad del uniforme escolar.

Su relevancia es practica: es un ejemplo tipico de LoRA de personaje para pipelines de generacion de imagenes con personajes consistentes, util para ilustradores y desarrolladores que integran difusion en ComfyUI, Automatic1111 o diffusers. El entrenamiento se hizo con un dataset propio de 37 pares imagen/caption, publicado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de bajo rango (dim32/alpha16) sobre UNet y ambos text encoders de SDXL (difusion latente); modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (repositorio de 1,8 GB con varios checkpoints; el adaptador usa rango 32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | en, zh (segun etiquetas del repositorio) |
| Licencia | creativeml-openrail-m (CreativeML OpenRAIL-M) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 16 aplicado tanto al UNet como a los dos text encoders del modelo base SDXL. No modifica la arquitectura de difusion subyacente: inyecta matrices de bajo rango que se suman a las proyecciones existentes durante la inferencia. Los pesos se cargan con la libreria diffusers o como extension de LoRA en interfaces graficas compatibles.

El dataset de entrenamiento consta de 37 pares imagen/caption, publicado como `abbuibuibui/MikoIino-Dataset`. La composicion de outfits es: `miko_school_uniform` en 29 pares, `miko_casual` en 6 y `miko_dress` en 2. En la reanudacion del segundo entrenamiento se uso `num_repeats=5`. El autor publica dos rondas (R1 y R2) y varios checkpoints por epoca; la R2 se reanudo desde la epoca 4, paso 639 (de ahi el nombre `rE4S639`). No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, ya que no aplican a un modelo de difusion. La evaluacion se hizo mediante una matriz de escenas y strengths de 0,4 a 1,0.

## Capacidades

- Generacion de ilustracion anime de un personaje concreto (Miko Iino) con identidad consistente entre imagenes.
- Reproduccion de rasgos definidos: pelo castano corto, ojos rojos, corte bob o coletas bajas y flequillo recto.
- Control de outfit mediante tokens dedicados: `miko_school_uniform` (uniforme escolar, incluye brazalete identificativo) y `miko_casual` (ropa informal), ademas de `miko_dress`.
- Generacion de retratos, planos de cuerpo completo, escenas escolares, escenas nocturnas y fondos simples o complejos.
- Compatible con los prompts estandar de la familia Illustrious (etiquetas de calidad como `masterpiece`, `best quality`, `very aesthetic`, `absurdres`, `anime screencap`).
- Ajuste de influencia del personaje mediante el parametro de strength del LoRA (recomendado 0.8).
- Idiomas de prompt documentados: ingles y chino.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente, por no ser un modelo de lenguaje.

## Casos de uso

- Generacion de fan art consistente de un personaje: usar el token `miko_iino` junto con los tokens de outfit permite obtener ilustraciones reproducibles de Miko Iino sin reentrenar, algo util para artistas que producen series de imagenes.
- Ilustracion de escenas escolares: con `miko_school_uniform` se generan escenas de aula o instituto con el uniforme caracteristico y su brazalete, utiles para portadas o ilustraciones tematicas.
- Creacion de material para fan comics: la coherencia de identidad a strength 0.8 facilita mantener el mismo diseno de personaje a lo largo de varias vinetas generadas por separado.
- Integracion en pipelines de generacion por lotes: el LoRA se puede cargar en ComfyUI, Automatic1111 o diffusers para producir variaciones de un mismo personaje con parametros fijos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216).
- Retratos para avatares o cabeceras: el checkpoint R2E5 esta optimizado segun el autor para limpieza facial, lo que resulta adecuado para primeros planos y avatares.
- Pruebas de investigacion sobre LoRA de personaje: al publicarse dataset y checkpoints por epoca, sirve como caso de estudio para analizar como el strength y la epoca afectan a la fidelidad y al "lock-in" del personaje.
- Prototipado de personajes para proyectos derivados: dado que es una obra derivada no oficial, su uso encaja mejor en prototipos y experimentacion que en productos comerciales finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible (tipo FID, CLIP score o similares). El autor aporta una evaluacion cualitativa:

| Elemento | Detalle |
|---|---|
| Checkpoints evaluados | R1E3, R2E5, R2E6 |
| Protocolo | 10 escenas x strengths de 0,4 a 1,0 |
| Escenas | cara, tres cuartos, perfil, uniforme escolar, ropa casual, sentada, fondo simple, escena nocturna compleja, sin outfit, sin trigger |
| Resultado | R2E5 recomendado @ 0.8 (mejor equilibrio cara/uniforme); R2E6 cercano pero con mas lock-in a 1.0 |

SHA-256 del checkpoint recomendado (R2E5): `DC40C09C106312D165201C41A1ED4146F146CE5ADC29B5253D2B881D023A3259`.

## Requisitos de hardware

- El LoRA en si ocupa poco, pero requiere cargar el modelo base waiIllustriousSDXL v17 (SDXL) para funcionar; la VRAM depende sobre todo del modelo base.
- VRAM estimada para SDXL en fp16: en torno a 8-12 GB para inferencia comoda; con optimizaciones de memoria puede reducirse.
- Cabe en GPU de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en GPUs con 8 GB puede requerir tecnicas de offload o precision reducida.
- GPUs profesionales (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenar el LoRA o generar a gran volumen.
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI, Automatic1111/Forge y otras interfaces compatibles con LoRA de SDXL.
- No se publican datos de latencia ni throughput en la informacion disponible.
- Configuracion de generacion documentada: sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros LoRA de personaje en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. A modo orientativo de categoria:

| Modelo | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| MikoIino-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | CreativeML OpenRAIL-M | Hugging Face y ModelScope |
| Otros LoRA de personaje para Illustrious/SDXL | LoRA de personaje | Variantes SDXL/Illustrious | Habitualmente CreativeML OpenRAIL-M | Hugging Face, Civitai |
| Modelo base waiIllustriousSDXL v17 | Modelo de difusion completo | SDXL | Segun su propia licencia | Hugging Face |

No disponible: comparacion de parametros, contexto o benchmarks frente a alternativas concretas.

## Limitaciones y advertencias

- Riesgo de deriva: con pesos bajos, un prompt que solo incluya el nombre puede derivar hacia ropa generica de doncella de santuario; se recomienda invocar explicitamente `miko_school_uniform`.
- Lock-in del personaje: a strength 1.0 algunos checkpoints (como R2E6) muestran mayor rigidez; el autor recomienda 0.8.
- El personaje es una estudiante de secundaria; hay que tener en cuenta las politicas de contenido y las normas de las plataformas al generar imagenes.
- Es una obra derivada no oficial: los derechos del personaje pertenecen a Aka Akasaka / Shueisha, lo que condiciona su uso comercial.
- Licencia CreativeML OpenRAIL-M: incluye clausulas de uso restringido (uso responsable, prohibicion de ciertos usos daninos); conviene revisar el texto completo antes de un uso comercial.
- Limitaciones de dataset: solo 37 pares imagen/caption, lo que puede reducir la variedad de poses, expresiones y angulos frente a LoRA entrenados con datasets mayores.
- Compatibilidad: evaluado sobre waiIllustriousSDXL v170; en otros modelos base el comportamiento puede degradarse.
- Idiomas de prompt documentados limitados a ingles y chino.
- No se han publicado resultados de benchmarks cuantitativos que permitan estimar la fidelidad de forma objetiva.
- Las imagenes de muestra y evaluacion del autor forman parte del repositorio; no se documentan metricas de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/MikoIino-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/MikoIino-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/MikoIino-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/MikoIino-Dataset
- README en chino: ./README_zh.md (relativo al repositorio del modelo)
- Informe de evaluacion horizontal (en chino): evaluation/横向测评记录.md (relativo al repositorio del modelo)

Nota: las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos trataban sobre toponimos no relacionados y se han descartado.
