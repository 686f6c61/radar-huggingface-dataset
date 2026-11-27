# abbuibuibui/YukiYoshikawa-Lora

## Resumen

YukiYoshikawa-Lora es un LoRA de personaje para modelos de difusion de imagenes SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Yuki Yoshikawa, personaje del manga y anime Horimiya. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango que se carga sobre un modelo base para condicionar la generacion hacia la identidad visual del personaje.

El repositorio contiene tres linajes de LoRA (WAI/Illustrious en la raiz, AutismMix Pony en `autism_pony/` y MOSS-Image en `moss/`), cada uno con su propio modelo base y sus propios prompts. El linaje principal incluye los pesos de las epocas E1 a E7, con E6 como recomendacion por defecto a fuerza 0.8. Cada archivo pesa 456.494.196 bytes y el repositorio completo ocupa 7,9 GB.

Es relevante para quien necesite un LoRA de personaje con disparadores explicitos y evaluacion por epocas documentada: el autor publica una matriz comparativa de escenas y fuerzas, especifica tokens de identidad y de vestuario, y detalla los ajustes de muestreo (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216). La licencia es CreativeML OpenRAIL-M y el modelo es un derivado hecho por fans, sin vinculacion con los titulares de derechos del personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; modelo base waiIllustriousSDXL v17 |
| Parametros totales | no disponible (LoRA; cada archivo pesa 456.494.196 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes) |
| Tipos de cuantizacion | no disponible; pesos en safetensors de precision completa del adaptador |
| Idiomas soportados | en, zh (etiquetas de la model card; los prompts de ejemplo estan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

Se trata de un LoRA de personaje aplicado sobre un modelo de difusion latente SDXL (waiIllustriousSDXL v17, familia Illustrious/NoobAI). El adaptador modifica las proyecciones del UNet y del text encoder para incorporar la identidad del personaje mediante tokens disparadores: `yuki_yoshikawa` para la identidad y tokens especificos de vestuario (`yuki_yoshikawa_school_uniform`, `yuki_yoshikawa_winter_accessories`, `yuki_yoshikawa_sports_t_shirt`).

El entrenamiento se realizo sobre el dataset abbuibuibui/YukiYoshikawa-Dataset con `keep_tokens = 2`. Las captions conservan habitualmente solo el nombre y el token de vestuario y suelen omitir el color de pelo y de ojos; los rasgos de identidad (pelo largo ondulado rubio, ojos marrones) se documentan a partir de las imagenes de entrenamiento. Se conservan siete epocas: E1 a E6 como archivos numerados y E7 como archivo sin numerar (`yuki_yoshikawa.safetensors`). No existe `yuki_yoshikawa-000007.safetensors`. La seleccion de E6 se hizo mediante cribado a fuerza 0.8 sobre retrato frontal, cuerpo completo con uniforme escolar y cuerpo completo con accesorios de invierno, y una matriz de 10 escenas por 4 fuerzas para E5, E6 y E7.

## Capacidades

- Generacion de imagenes de un personaje concreto de anime (Yuki Yoshikawa, Horimiya) condicionada por tokens disparadores.
- Control de identidad estable en retrato a fuerzas de 0.6 a 0.8 con E6.
- Reproduccion de vestuario especifico mediante tokens: uniforme escolar (camisa blanca, falda plisada azul marino, calcetines oscuros a la rodilla, mocasines marrones, bolso azul al hombro), accesorios de invierno (cardigan beige abierto, blusa blanca, falda larga marron oscuro con cinturon, bailarinas marrones) y camiseta deportiva.
- Generacion de cuerpo completo y escenas nocturnas manteniendo la identidad a fuerza 0.8.
- Compatibilidad con merges de Illustrious y NoobAI ademas del modelo base declarado.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de vision o audio: es un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art de personaje: cargar E6 a 0.8 sobre waiIllustriousSDXL v17 y usar el token `yuki_yoshikawa` junto con el token de vestuario para obtener retratos o cuerpos completos coherentes con el diseno del personaje.
- Generacion de variaciones de vestuario: alternar `yuki_yoshikawa_school_uniform` y `yuki_yoshikawa_winter_accessories` en el mismo prompt para producir series de imagenes del personaje en contextos estacionales distintos sin perder la identidad facial.
- Creacion de hojas de personaje para proyectos derivados: combinacion de retrato frontal y cuerpo completo con prompts fijos y semilla controlada para documentar el diseno.
- Pruebas de integracion en ComfyUI: el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216, hires y ADetailer desactivados) que sirven como configuracion de referencia reproducible.
- Comparacion de epocas en investigacion de LoRA: el repositorio conserva E1 a E7 con una matriz de evaluacion descrita, util para estudiar el efecto del numero de epocas en la fidelidad de identidad y en la deriva de vestuario.
- Escenas narrativas: el autor reporta que a 0.8 en escena nocturna el modelo anade un cardigan marron bajo una chaqueta navy abierta sin romper la identidad, lo que permite ilustrar situaciones fuera del entorno escolar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La model card incluye una evaluacion cualitativa por epocas:

| Candidato | Resultado observado | Decision |
|---|---|---|
| E1 | Pelo rubio y ojos marrones correctos en primer plano; cuerpo completo escolar mas blando | Alternativa temprana |
| E5 | Rostro estable; cuerpo completo escolar a 0.8 tiende a marinera de manga corta con cuello a rayas y bolso azul claro | Alternativa de matriz |
| E6 | Retrato estable a 0.6-0.8; uniforme escolar resuelto en camisa blanca, falda navy, calcetines a la rodilla y bolso azul; accesorios de invierno coherentes a 0.6-0.8 | Recomendado a 0.8 |
| E7 | Rostro muy cercano a E6; cuerpo completo escolar prefiere cardigan beige abierto sobre la camisa | Alternativa de epoca final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, la inferencia requiere la VRAM del modelo base SDXL mas el adaptador. Los pesos del adaptador son de 456 MB por archivo.
- GPU recomendadas: no especificadas en la informacion disponible. SDXL en general se ejecuta en GPUs de consumo con suficiente VRAM, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no confirmada en la model card.
- Opciones de despliegue: ComfyUI (configuracion documentada por el autor) y libreria diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles. La configuracion de muestreo documentada es Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Epocas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YukiYoshikawa-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | E1-E7 (E6 recomendada) | creativeml-openrail-m | Hugging Face, 202 descargas |
| Linaje AutismMix Pony del mismo repo | LoRA de personaje | AutismMix Pony | no disponible | creativeml-openrail-m | Incluido en `autism_pony/` |
| Linaje MOSS-Image del mismo repo | LoRA de personaje | MOSS-Image | no disponible | creativeml-openrail-m | Incluido en `moss/` |

No se dispone de datos de benchmarks ni de otros LoRA de personaje comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado hecho por fans: los derechos del personaje y de la obra original pertenecen a sus titulares. No es un producto oficial.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso; conviene revisar sus clausulas antes de cualquier uso comercial.
- Riesgo de deriva de vestuario: a fuerza 1.0 con `yuki_yoshikawa_winter_accessories` las bailarinas suelen convertirse en botas de tobillo marrones y cambia la pose de brazos; se recomienda 0.6-0.8 para el look de falda a media pierna con bailarinas.
- Sin token de vestuario, a 0.8 el modelo tiende a generar un vestido camisetero gris oscuro oversize con botas marrones, no el uniforme escolar.
- Las captions de entrenamiento omiten con frecuencia el color de pelo y de ojos, por lo que la identidad depende en mayor medida del token `yuki_yoshikawa`.
- No se debe mezclar con los modelos base de los otros linajes del repositorio (`autism_pony/` y `moss/`): cada uno requiere su propio base y sus propios prompts.
- El prompt negativo de referencia excluye explicitamente colores de pelo y ojos alternativos y multiples personajes; omitirlo puede degradar la fidelidad de identidad.
- No hay datos publicados de sesgos, tasas de alucinacion (concepto no aplicable a difusion) ni evaluaciones cuantitativas de calidad.
- El repositorio ocupa 7,9 GB por incluir los tres linajes y todas las epocas; para uso general solo es necesario descargar E6.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/YukiYoshikawa-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/YukiYoshikawa-Dataset
- README en chino: https://huggingface.co/abbuibuibui/YukiYoshikawa-Lora/blob/main/README_zh.md
- Linaje AutismMix Pony: https://huggingface.co/abbuibuibui/YukiYoshikawa-Lora/tree/main/autism_pony
- Linaje MOSS-Image: https://huggingface.co/abbuibuibui/YukiYoshikawa-Lora/tree/main/moss
