# abbuibuibui/MomoChiyoda-Lora

## Resumen

MomoChiyoda-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint comunitario waiIllustriousSDXL v17 (variante Illustrious del ecosistema SDXL orientada a ilustracion anime). Lo desarrolla el usuario abbuibuibui y reproduce a Momo Chiyoda (千代田桃), personaje de la serie *The Demon Girl Next Door* (Machikado Mazoku). No es un modelo fundacional ni un modelo de lenguaje: es un adaptador de bajo rango que se carga junto al checkpoint base para condicionar la generacion de imagenes hacia la identidad visual del personaje.

El problema que resuelve es acotado pero relevante para el nicho de generacion de imagenes anime: conseguir consistencia de personaje (rostro, color de pelo y ojos, vestuario canonico y variantes de vestuario) sin necesidad de reentrenar el modelo base. El repositorio publica siete epocas de entrenamiento y una evaluacion comparativa propia que recomienda la epoca E6 con fuerza 0.8 como configuracion por defecto. El peso de cada fichero es de 456.496.756 bytes (aproximadamente 435 MiB), y el repositorio completo ocupa 3,2 GB por acumular todas las epocas y material de evaluacion.

La relevancia es limitada fuera del ambito del fan art y de la investigacion sobre personalizacion de modelos generativos: no hay datos de benchmarks estandar, el numero de descargas y likes es cero en el momento de la consulta, y la licencia CreativeML OpenRAIL-M impone restricciones de uso. Resulta util, en cambio, como ejemplo documentado de pipeline de entrenamiento de LoRA de personaje con evaluacion por matrices de fuerza y escenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre difusion latente SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (rango LoRA 64, alpha 32; tamano por fichero 456.496.756 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; resolucion de entrenamiento con buckets hasta 1536) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el LoRA se aplica sobre el checkpoint base en la precision de este) |
| Idiomas soportados | en, zh (etiquetas de la model card; los prompts de ejemplo estan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers y con la interfaz de LoRA de ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 64 y alpha 32 inyectado en un UNet de difusion latente SDXL. El entrenamiento se realizo sobre waiIllustriousSDXL v17 con optimizador AdamW en bf16, buckets con tope de 1536 y 7 epocas. El dataset asociado (abbuibuibui/MomoChiyoda-Dataset) consta de 85 pares imagen-texto que cubren 6 conjuntos de vestuario, con 3 repeticiones por muestra. Las captions se generaron con `keep_tokens = 2`, de modo que el color de pelo y de ojos suele estar omitido en el texto y debe anadirse explicitamente en el prompt en tiempo de inferencia.

La innovacion practica del repositorio no esta en la arquitectura sino en la metodologia de seleccion de checkpoint: el autor publica una evaluacion en dos rondas. La primera criba las epocas E1 a E7 a fuerza 0.8; la tercera ejecuta una matriz sobre E5, E6 y E7 cruzada con 10 escenas (rostro, tres cuartos, perfil, cuerpo completo con vestuario principal y alternativo, sentado, fondo simple, escena nocturna compleja, sin token de vestuario y sin trigger) y 4 fuerzas (0.4, 0.6, 0.8 y 1.0). El resultado recomienda E6 a 0.8 por mantener de forma estable la silueta del personaje (pelo largo castano, ojos castanos, uniforme con sudadera amarilla). Se documentan ademas tokens de identidad y de vestuario diferenciados, lo que permite control granular del atuendo.

## Capacidades

- Generacion de imagenes anime del personaje Momo Chiyoda condicionada por el token de identidad `momo_chiyoda`.
- Control de vestuario mediante tokens especificos: `momo_chiyoda_yellow_hoodie_uniform` (uniforme principal con sudadera amarilla), `momo_chiyoda_dark_magical_form` (forma magica oscura), `momo_chiyoda_blue_hoodie`, `momo_chiyoda_navy_cardigan_shorts`, `momo_chiyoda_pink_magical_girl_form` y `momo_chiyoda_white_collar_shirt`.
- Composicion de escenas: retrato frontal, tres cuartos, perfil, cuerpo completo, pose sentada, fondos simples y escenas nocturnas complejas, segun la matriz de evaluacion publicada.
- Compatibilidad con el ecosistema SDXL/Illustrious: funciona con la libreria diffusers y con ComfyUI; los ajustes de referencia son Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216 sin hires fix ni ADetailer.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un adaptador de generacion de imagen.
- Capacidades multilingues limitadas a la interpretacion de prompts en ingles y chino; la model card esta redactada en ambos idiomas.

## Casos de uso

- Fan art consistente de personaje: usar `momo_chiyoda` junto con los tokens de vestuario para generar ilustraciones del personaje en distintas poses y escenas manteniendo el parecido facial entre imagenes, gracias a la evaluacion documentada de estabilidad de silueta en E6 a fuerza 0.8.
- Ilustracion de escenas narrativas: la matriz de evaluacion cubre escenas nocturnas complejas y fondos simples, lo que permite emplear el LoRA para ilustrar momentos de la serie o guiones de fan comic con encuadres variados (retrato, tres cuartos, perfil, plano completo).
- Prototipado de hojas de personaje: combinando los seis conjuntos de vestuario entrenados se pueden generar variantes de atuendo del mismo personaje para fichas de referencia o guias de estilo.
- Experimentacion en investigacion sobre personalizacion: el repositorio sirve como caso reproducible de entrenamiento LoRA de personaje con dataset pequeno (85 pares), hiperparametros documentados y protocolo de seleccion de checkpoint por matriz de fuerza y escena.
- Generacion de material para comunidades de fans: imagenes para foros, wikis o celebraciones de la serie, siempre respetando las restricciones de la licencia y los derechos de los titulares originales.
- Comparacion metodologica de epocas: usar las epocas E1 a E7 publicadas para estudiar como evoluciona el ajuste al personaje a lo largo del entrenamiento y como interactua con la fuerza del adaptador (0.4 a 1.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion es cualitativa y propia del autor: una criba de E1 a E7 a fuerza 0.8 y una matriz de E5, E6 y E7 por 10 escenas y 4 fuerzas, con la conclusion de que E6 a 0.8 ofrece la silueta mas estable del personaje. No hay metricas numericas como FID, CLIP score ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- El adaptador pesa aproximadamente 435 MiB por fichero (456.496.756 bytes), por lo que el coste de almacenamiento es bajo; el requisito real lo impone el checkpoint base SDXL sobre el que se aplica.
- VRAM estimada para inferencia con SDXL en fp16: en torno a 8-10 GB con optimizaciones de atencion y offloading; en fp32 o sin optimizar, 16 GB o mas. No se proporcionan mediciones especificas para este LoRA.
- GPU recomendadas: NVIDIA RTX 4090, A100 o H100 para generacion a 832x1216 con margen; tarjetas consumer de gama media-alta con 8 GB o mas pueden funcionar con atencion eficiente y VAE en fp16.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante), asumiendo el coste del checkpoint base.
- Opciones de despliegue: diffusers (carga de LoRA sobre el pipeline SDXL), ComfyUI (ajustes de referencia del autor), Automatic1111/Forge y otros frontends compatibles con LoRA SDXL. No hay indicacion de soporte en llama.cpp, Ollama, vLLM ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de otros LoRA de personaje comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. Cualitativamente, este adaptador se diferencia de un LoRA generico por estar entrenado exclusivamente sobre waiIllustriousSDXL v17 (no garantiza comportamiento equivalente en otros checkpoints SDXL) y por publicar todas las epocas con evaluacion comparativa, algo poco habitual en LoRA de personaje de nicho.

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MomoChiyoda-Lora | LoRA de personaje | waiIllustriousSDXL v17 | rango 64 / alpha 32 | no aplica | creativeml-openrail-m | HuggingFace, ModelScope |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a los titulares originales de *The Demon Girl Next Door*; el autor lo declara explicitamente como fan-made.
- La licencia CreativeML OpenRAIL-M permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en el anexo de la licencia), pero no otorga derechos sobre la propiedad intelectual del personaje; el uso comercial del personaje requiere autorizacion de los titulares.
- El LoRA esta entrenado sobre waiIllustriousSDXL v17; su comportamiento en otros checkpoints SDXL o Illustrious no esta verificado y puede degradarse.
- Dataset pequeno (85 pares, 6 vestuarios, 3 repeticiones): riesgo de sobreajuste a las poses y composiciones del dataset y de menor variedad en escenas no cubiertas por la evaluacion.
- Las captions omiten con frecuencia color de pelo y ojos (`keep_tokens = 2`), por lo que es necesario anadir `long hair, brown hair, brown eyes` en el prompt para evitar desviaciones de identidad.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible o detalles incoherentes, especialmente en escenas complejas y a fuerzas altas.
- El token de sujeto recomendado es `1girl`; no se documenta soporte para otros encuadres o composiciones con multiples sujetos.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Idiomas de prompt limitados a ingles y chino segun la model card; no hay evidencia de robustez con prompts en castellano.

## Enlaces

- HuggingFace: https://huggingface.co/abbuibuibui/MomoChiyoda-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MomoChiyoda-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MomoChiyoda-Dataset
- Notas de evaluacion en chino (ruta dentro del repo): `evaluation/横向测评记录.md`
- README en chino (ruta dentro del repo): `README_zh.md`
