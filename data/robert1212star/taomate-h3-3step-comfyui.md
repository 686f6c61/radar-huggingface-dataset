# Robert1212star/TaoMate-H3-3Step-ComfyUI

## Resumen

TaoMate-H3-3Step-ComfyUI es un repositorio de adaptadores LoRA en formato ComfyUI derivados de MiniMax H3, el modelo base de generación de vídeo (y audio-vídeo) de MiniMax. El autor del repositorio, Robert1212star, no entrena ni ajusta nada: se limita a convertir a los layouts de claves y precisión que esperan los cargadores LoRA de ComfyUI dos checkpoints oficiales publicados por el equipo TaoLive AIGC de Alibaba, el adaptador original TaoMate-H3 y el más reciente TaoMate-H3-FL2VA.

El interés del repositorio es práctico: permite probar los adaptadores de 3 pasos de TaoMate dentro de flujos de trabajo de ComfyUI sobre el modelo base MiniMax H3, sin necesidad de usar el runtime oficial de TaoMate. Incluye dos ficheros safetensors de distinto origen (no son dos precisiones del mismo checkpoint): el adaptador original de 3 pasos (2,48 GB) y el adaptador FL2VA convertido a BF16 (1,24 GB), orientado a generación condicionada por primer y último fotograma con audio y vídeo.

No se dispone de información sobre arquitectura interna, número de parámetros del modelo base, longitud de contexto ni idiomas soportados en la información proporcionada. El repositorio ocupa 3,7 GB y acumula 11.587 descargas y 71 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base MiniMax H3; arquitectura del base no especificada) |
| Parametros totales | no disponible (adaptador: rango 128 / alpha 128, 208 pares LoRA A/B, 416 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (fichero FL2VA); el fichero original se distribuye en safetensors sin precisión declarada en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (adaptadores LoRA para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino conversiones de formato de adaptadores LoRA. El adaptador FL2VA se convirtió de FP32 a BF16, reduciendo el almacenamiento de aproximadamente 2,48 GB a 1,24 GB, y conserva los 416 tensores de peso originales (208 pares LoRA A/B), incluidos los pesos de `token_refiner`, con rango 128 y alpha 128. La conversión mapea las claves `.lora_a` a `.lora_down.weight` y `.lora_b` a `.lora_up.weight`, añade el prefijo `diffusion_model.` y los valores de alpha por módulo para que ComfyUI los cargue, y preserva la orientación de las matrices sin fusionar, podar ni reentrenar.

No se realizó entrenamiento ni ajuste fino adicional. El adaptador original de 3 pasos se convirtió desde el checkpoint TaoMate-H3 al layout de parámetros y claves de los cargadores LoRA de MiniMax H3 en ComfyUI. El adaptador FL2VA proviene del release oficial TaoMate-H3-FL2VA, orientado a generación de audio-vídeo condicionada por primer y último fotograma, con un LoRA de 3 pasos y un runtime de streaming dedicado. El autor advierte que la conversión se verificó contra nombres y formas de tensores del checkpoint fuente con tensores sintéticos, pero la carga completa y la generación en ComfyUI no se han verificado de forma independiente.

## Capacidades

- Aplicación de adaptadores LoRA de 3 pasos sobre el modelo base MiniMax H3 para generación de vídeo.
- Generación de audio-vídeo condicionada por primer y último fotograma (adaptador FL2VA), siempre que el flujo de trabajo de ComfyUI implemente ese condicionamiento.
- Conversión de formato compatible con cargadores LoRA de MiniMax H3 en ComfyUI.
- Conservación de los pesos de `token_refiner` en la conversión FL2VA.
- No incluye el modelo base: no genera vídeo por sí solo.
- No aporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No aporta capacidades multilingües propias.
- No instala el runtime oficial de TaoMate, la caché KV persistente de audio-vídeo ni la generación en streaming.

## Casos de uso

- Pruebas de adaptadores de 3 pasos en ComfyUI: cargar el safetensors en `ComfyUI/models/loras/`, seleccionarlo en un cargador LoRA compatible con MiniMax H3 y conectarlo a un flujo de trabajo existente para evaluar el efecto del adaptador sobre el modelo base.
- Comparación controlada de adaptadores: fijar imagen de referencia, prompt, semilla, resolución, número de fotogramas, sampler y scheduler, y cambiar únicamente el adaptador seleccionado para aislar su impacto.
- Prototipado de vídeo con audio condicionado por primer y último fotograma: usar el adaptador FL2VA en un flujo de ComfyUI que implemente el condicionamiento de fotogramas inicial y final, verificando previamente que los nodos y el cargador LoRA soportan ese caso.
- Evaluación de la conversión BF16: comprobar en consola si aparecen claves LoRA no utilizadas o errores de forma de tensor al cargar el fichero de 1,24 GB frente al original.
- Integración en pipelines de generación de vídeo existentes sobre MiniMax H3: sustituir el adaptador por defecto por el de 3 pasos para reducir el número de pasos de muestreo en pruebas de concepto.
- Verificación de compatibilidad de nodos personalizados: usar los dos ficheros como banco de pruebas para validar que un cargador LoRA de MiniMax H3 en ComfyUI acepta el layout `diffusion_model.` con alpha por módulo.
- Desarrollo de flujos de trabajo de audio-vídeo: emplear el adaptador FL2VA como punto de partida para construir un workflow que reproduzca, con limitaciones, el comportamiento del runtime oficial de TaoMate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador ocupa 2,48 GB (original) y 1,24 GB (FL2VA en BF16), pero el consumo real depende del modelo base MiniMax H3 y de la resolución y número de fotogramas.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y del flujo de ComfyUI.
- Opciones de despliegue: ComfyUI con un cargador LoRA compatible con MiniMax H3; el runtime oficial de TaoMate no está incluido en este repositorio.
- Latencia y throughput: no disponibles. El adaptador está pensado para 3 pasos de muestreo, pero el autor advierte que elegir 3 pasos no reproduce el procedimiento de denoising del runtime oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TaoMate-H3-3Step-ComfyUI (este repo) | Adaptador LoRA convertido para ComfyUI | rango 128 / alpha 128 (208 pares A/B) | no disponible | MiniMax H3 Community License | Hugging Face, 11.587 descargas |
| TaoMate-H3 (oficial, TaoLive AIGC) | Adaptador LoRA original | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (TaoLiveAIGC/TaoMate-H3) |
| TaoMate-H3-FL2VA (oficial, TaoLive AIGC) | Adaptador LoRA original con runtime de streaming | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (TaoLiveAIGC/TaoMate-H3-FL2VA) |
| MiniMax-H3 (base) | Modelo base de vídeo/audio-vídeo | no disponible | no disponible | MiniMax H3 Community License | Hugging Face (MiniMaxAI/MiniMax-H3) |

## Limitaciones y advertencias

- El repositorio contiene únicamente adaptadores LoRA; no incluye el modelo base MiniMax H3 y no puede generar vídeo por sí solo.
- La conversión a BF16 reduce la precisión numérica; no es una copia sin pérdidas de los valores FP32.
- La carga completa del checkpoint y la generación en ComfyUI no han sido verificadas de forma independiente por el autor de la conversión; las pruebas se hicieron con tensores sintéticos.
- No se incluye el runtime oficial de TaoMate, la caché KV persistente de audio-vídeo ni la generación en streaming.
- El condicionamiento por primer y último fotograma debe implementarlo el flujo de trabajo y los nodos de ComfyUI elegidos; cargar el adaptador no añade esa capacidad.
- El adaptador FL2VA y el original son checkpoints de origen distinto, no dos precisiones del mismo modelo; no deben compararse como equivalentes.
- No se declara una configuración universal de sampler, scheduler, guidance ni fuerza del adaptador; el comportamiento depende del flujo de trabajo.
- La licencia MiniMax H3 Community License Agreement impone restricciones que deben revisarse antes de cualquier uso comercial; la conversión de formato no altera los términos.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Robert1212star/TaoMate-H3-3Step-ComfyUI
- Descarga del adaptador original: https://huggingface.co/Robert1212star/TaoMate-H3-3Step-ComfyUI/resolve/main/taomate_h3_3step_comfy.safetensors
- Descarga del adaptador FL2VA BF16: https://huggingface.co/Robert1212star/TaoMate-H3-3Step-ComfyUI/resolve/main/TaoMate-H3-FL2VA-3Step-ComfyUI-BF16.safetensors
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Adaptador original TaoMate H3: https://huggingface.co/TaoLiveAIGC/TaoMate-H3
- Adaptador TaoMate H3 FL2VA: https://huggingface.co/TaoLiveAIGC/TaoMate-H3-FL2VA
- Código oficial de TaoMate H3: https://github.com/TaoLiveAIGC/TaoMate-H3
- Licencia del FL2VA: https://huggingface.co/TaoLiveAIGC/TaoMate-H3-FL2VA/blob/main/LICENSE
- Aviso legal del FL2VA: https://huggingface.co/TaoLiveAIGC/TaoMate-H3-FL2VA/blob/main/NOTICE
